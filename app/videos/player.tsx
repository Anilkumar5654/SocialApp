import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, Alert, StatusBar, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
// 👇 Expo Video Import
import { useVideoPlayer, VideoView } from 'expo-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { ChevronDown } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { api } from '@/services/api';
// 👇 Ad Manager Import
import { VideoAdManager } from '@/services/VideoAdManager'; 
import { useAuth } from '@/contexts/AuthContext';
import { getMediaUri } from '@/utils/media';
import { formatViews } from '@/utils/format';
import { formatTimeAgo } from '@/constants/timeFormat';

// 👇 Components
import VideoController from '@/components/videos/VideoController';
import VideoActions from '@/components/videos/VideoActions';
import RecommendedVideos from '@/components/videos/RecommendedVideos';
import VideoModals from '@/components/videos/VideoModals';
import SubscribeBtn from '@/components/buttons/SubscribeBtn'; 

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function VideoPlayerScreen() {
    const { videoId } = useLocalSearchParams<{ videoId: string }>();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    // --- STATES ---
    const [isPlaying, setIsPlaying] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isBuffering, setIsBuffering] = useState(true);
    
    // Time States
    const [videoDuration, setVideoDuration] = useState(0); 
    const [currentPosition, setCurrentPosition] = useState(0); 
    
    // Seeking States (Sirf Polling rokne ke liye aur Double Tap ke liye)
    const [isSeeking, setIsSeeking] = useState(false);
    
    // Double Tap Animation Props (Jo Controller maang raha hai)
    // Note: Slider drag ka state ab Controller ke paas hai locally.
    // Ye sirf double tap icons ke liye hai.
    const [seekPosition, setSeekPosition] = useState(0); // Unused for slider now, but kept for types if needed
    const [showSeekIcon, setShowSeekIcon] = useState(false);
    const [seekDirection, setSeekDirection] = useState<'forward' | 'backward'>('forward');

    // UI States
    const [showComments, setShowComments] = useState(false);
    const [showDescription, setShowDescription] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [commentText, setCommentText] = useState('');

    const lastTapTime = useRef(0);
    const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
    const wasPlayingBeforeSeek = useRef(false);

    // --- DATA FETCHING ---
    const { data: vData, isLoading } = useQuery({ 
        queryKey: ['video-detail', videoId], 
        queryFn: () => api.videos.getDetails(videoId!), 
        enabled: !!videoId 
    });
    
    const { data: rData } = useQuery({ 
        queryKey: ['video-rec', videoId], 
        queryFn: () => api.videos.getRecommended(videoId!), 
        enabled: !!videoId 
    });
    
    const { data: cData, refetch: refetchComments } = useQuery({ 
        queryKey: ['video-comments', videoId], 
        queryFn: () => api.videos.getComments(videoId!, 1), 
        enabled: !!videoId 
    });

    const video = vData?.video;
    const recommended = rData?.videos || [];
    const comments = cData?.comments || [];
    const videoSource = video ? getMediaUri(video.video_url) : null;

    // --- 🔥 PLAYER SETUP ---
    const player = useVideoPlayer(videoSource, (playerInstance) => {
        playerInstance.loop = false;
        playerInstance.pause(); // Ad ka wait karo
    });

    // 1. Basic Listeners
    useEffect(() => {
        if (!player) return;

        const playSub = player.addListener('playingChange', (event) => {
            setIsPlaying(event.isPlaying);
            if(event.isPlaying) {
                 setIsBuffering(false);
                 startHideControlsTimer();
            }
        });

        const statusSub = player.addListener('statusChange', (event) => {
             if (event.status === 'loading') setIsBuffering(true);
             else if (event.status === 'readyToPlay') {
                 setIsBuffering(false);
                 if (player.duration > 0) setVideoDuration(player.duration * 1000);
             }
             else if (event.status === 'error') Alert.alert('Error', 'Video failed to load');
        });

        return () => {
            playSub.remove();
            statusSub.remove();
        };
    }, [player]);

    // 2. Polling Loop (Time Update)
    useEffect(() => {
        // Agar seek kar rahe ho, to polling mat karo (taki progress bar lade nahi)
        if (!player || !isPlaying || isSeeking) return;

        const interval = setInterval(() => {
            setCurrentPosition(player.currentTime * 1000);
            if (player.duration > 0 && videoDuration === 0) {
                setVideoDuration(player.duration * 1000);
            }
        }, 200);

        return () => clearInterval(interval);
    }, [player, isPlaying, isSeeking, videoDuration]);


    // --- 📺 AD LOGIC ---
    useEffect(() => {
        const playAdSequence = async () => {
            if (video && player) {
                player.pause();
                setIsBuffering(false); 
                await VideoAdManager.showAd(video);
                player.play();
                startHideControlsTimer();
            }
        };
        playAdSequence();
    }, [video, player]);


    // --- 🎮 CONTROLS LOGIC ---
    const startHideControlsTimer = () => {
        if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
        controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
    };

    const toggleControls = () => {
        if (showControls) setShowControls(false);
        else {
            setShowControls(true);
            startHideControlsTimer();
        }
    };

    const togglePlay = () => {
        if (isPlaying) {
            player.pause();
            setShowControls(true);
            if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
        } else {
            player.play();
            startHideControlsTimer();
        }
    };

    // --- ✅ NEW SEEKING HANDLERS ---
    
    // Jab user ungli rakhega
    const handleSeekStart = () => {
        setIsSeeking(true); // Polling roko
        wasPlayingBeforeSeek.current = isPlaying;
        player.pause(); // Video roko
        if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    };

    // Jab user ungli chodega (Controller final value dega)
    const handleSeekEnd = (finalPositionMs: number) => {
        const targetSeconds = finalPositionMs / 1000;
        player.currentTime = targetSeconds; // Jump karo
        
        // Polling wapas chalu karo thodi der baad
        setTimeout(() => setIsSeeking(false), 100);

        if (wasPlayingBeforeSeek.current) {
            player.play();
            startHideControlsTimer();
        }
    };

    // Double Tap Logic
    const handleDoubleTap = (e: any) => {
        const now = Date.now();
        if (now - lastTapTime.current < 300) {
            const x = e.nativeEvent.locationX;
            const w = isFullscreen ? Dimensions.get('window').width : SCREEN_WIDTH;
            const seekAmt = x < w * 0.4 ? -10 : x > w * 0.6 ? 10 : 0;
            
            if (seekAmt !== 0) {
                const newTime = player.currentTime + seekAmt;
                player.currentTime = newTime;
                
                // Update UI state immediately for Polling Loop to catch up
                setCurrentPosition(newTime * 1000);

                // Show Icon
                setSeekDirection(seekAmt > 0 ? 'forward' : 'backward');
                setShowSeekIcon(true);
                setTimeout(() => setShowSeekIcon(false), 500);
            }
            lastTapTime.current = 0;
        } else {
            lastTapTime.current = now;
            setTimeout(() => toggleControls(), 300);
        }
    };

    // --- MUTATIONS ---
    const commentMutation = useMutation({ 
        mutationFn: () => api.videos.comment(videoId!, commentText), 
        onSuccess: () => { setCommentText(''); refetchComments(); Alert.alert('Posted', 'Comment added successfully'); } 
    });
    
    const deleteMutation = useMutation({ 
        mutationFn: () => api.videos.delete(videoId!), 
        onSuccess: () => router.back() 
    });

    // --- RENDER ---
    if (isLoading || !video) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;

    return (
        <View style={[styles.container, { paddingTop: isFullscreen ? 0 : insets.top }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" hidden={isFullscreen} />

            <View style={isFullscreen ? styles.fullPlayer : styles.playerBox}>
                <VideoView
                    player={player}
                    style={styles.video}
                    contentFit="contain"
                    nativeControls={false}
                />
                
                {isBuffering && (
                    <View style={styles.bufferingOverlay}>
                        <ActivityIndicator size="large" color="white" />
                    </View>
                )}

                <VideoController 
                    isPlaying={isPlaying} 
                    showControls={showControls} 
                    isFullscreen={isFullscreen}
                    
                    // Time Props
                    currentPosition={currentPosition} 
                    videoDuration={videoDuration}

                    // Double Tap UI Props (Ye abhi bhi chahiye 10s icon ke liye)
                    isSeeking={isSeeking} // Ye slider ke liye nahi, icons ke liye use ho sakta hai
                    seekPosition={seekPosition} // Unused by slider, kept for type safety
                    showSeekIcon={showSeekIcon}
                    seekDirection={seekDirection}
                    
                    // Actions
                    togglePlayPause={togglePlay} 
                    toggleFullscreen={() => setIsFullscreen(p => !p)}
                    handleDoubleTap={handleDoubleTap} 
                    
                    // ✅ Updated Handlers
                    handleSeekStart={handleSeekStart} 
                    handleSeekEnd={handleSeekEnd} 
                    
                    goBack={() => isFullscreen ? setIsFullscreen(false) : router.back()}
                />
            </View>

            {/* DETAILS (Comments, etc.) */}
            {!isFullscreen && (
                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                    <View style={styles.info}>
                        <Text style={styles.title}>{video.title}</Text>
                        <Text style={styles.meta}>{formatViews(video.views_count)} views · {formatTimeAgo(video.created_at)}</Text>
                    </View>
                    <TouchableOpacity style={styles.channel} onPress={() => router.push({ pathname: '/channel/[channelId]', params: { channelId: video.channel.id } })}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <Image source={{ uri: getMediaUri(video.channel.avatar) }} style={styles.avatar} />
                            <View>
                                <Text style={styles.cName}>{video.channel.name}</Text>
                                <Text style={styles.cSubs}>{formatViews(video.channel.subscribers_count)} subscribers</Text>
                            </View>
                        </View>
                        <SubscribeBtn channelId={video.channel.id} isSubscribed={video.channel.is_subscribed} />
                    </TouchableOpacity>
                    <VideoActions 
                        videoId={videoId!} likesCount={video.likes_count} isLiked={video.is_liked}
                        isDisliked={video.is_disliked} isSaved={video.is_saved} handleLike={() => {}} handleDislike={() => {}}
                    />
                    <TouchableOpacity style={styles.teaser} onPress={() => setShowDescription(true)}>
                        <Text style={styles.teaserTitle}>Description <ChevronDown size={14} color="#aaa"/></Text>
                        <Text numberOfLines={2} style={{ color: '#ccc' }}>{video.description || 'No description'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.teaser} onPress={() => setShowComments(true)}>
                        <Text style={styles.teaserTitle}>Comments ({comments.length})</Text>
                        {comments[0] && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                                <Image source={{ uri: getMediaUri(comments[0].user.avatar) }} style={{ width: 20, height: 20, borderRadius: 10, marginRight: 8 }} />
                                <Text numberOfLines={1} style={{ color: '#ccc', flex: 1 }}>{comments[0].content}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    <RecommendedVideos videos={recommended} />
                </ScrollView>
            )}

            <VideoModals 
                video={video} comments={comments} commentText={commentText} setCommentText={setCommentText}
                showComments={showComments} showDescription={showDescription} showMenu={showMenu}
                setShowComments={setShowComments} setShowDescription={setShowDescription} setShowMenu={setShowMenu}
                onPostComment={() => commentMutation.mutate()} isOwner={user?.id === video.user_id}
                onDelete={() => deleteMutation.mutate()} onReport={() => Alert.alert('Reported')} onSave={() => Alert.alert('Saved')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  playerBox: { width: SCREEN_WIDTH, aspectRatio: 16/9, backgroundColor: '#000' },
  fullPlayer: { width: Dimensions.get('window').width, height: Dimensions.get('window').height, backgroundColor: '#000', position: 'absolute', top: 0, left: 0, zIndex: 10 },
  video: { width: '100%', height: '100%' },
  bufferingOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 5, backgroundColor: 'rgba(0,0,0,0.3)' },
  info: { padding: 12 },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  meta: { fontSize: 12, color: Colors.textSecondary },
  channel: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#222' },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10, backgroundColor: '#333' },
  cName: { color: Colors.text, fontWeight: '700' },
  cSubs: { color: Colors.textSecondary, fontSize: 12 },
  teaser: { padding: 12, backgroundColor: '#1a1a1a', margin: 12, borderRadius: 10 },
  teaserTitle: { color: Colors.text, fontWeight: '700', fontSize: 14, marginBottom: 4 }
});
