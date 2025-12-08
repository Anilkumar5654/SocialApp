import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, Alert, StatusBar, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { ChevronDown } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { getMediaUri } from '@/utils/media';
import { formatViews } from '@/utils/format';
import { formatTimeAgo } from '@/constants/timeFormat';

// Clean Component Imports
import VideoController from '@/components/videos/VideoController';
import VideoActions from '@/components/videos/VideoActions';
import RecommendedVideos from '@/components/videos/RecommendedVideos';
import VideoModals from '@/components/videos/VideoModals';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function VideoPlayerScreen() {
    const { videoId } = useLocalSearchParams<{ videoId: string }>();
    const insets = useSafeAreaInsets();
    const videoRef = useRef<ExpoVideo>(null);
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // --- STATES ---
    const [isPlaying, setIsPlaying] = useState(true);
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isSeeking, setIsSeeking] = useState(false);
    
    const [videoDuration, setVideoDuration] = useState(0);
    const [currentPosition, setCurrentPosition] = useState(0);
    const [seekPosition, setSeekPosition] = useState(0);
    const [showSeekIcon, setShowSeekIcon] = useState(false);
    const [seekDirection, setSeekDirection] = useState<'forward' | 'backward'>('forward');

    const [isSubscribed, setIsSubscribed] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [showDescription, setShowDescription] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [commentText, setCommentText] = useState('');

    const wasPlayingBeforeSeek = useRef(false);
    const progressBarRef = useRef<View>(null);
    const progressBarWidth = useRef(0);
    const lastTapTime = useRef(0);
    const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

    // --- DATA FETCHING ---
    const { data: vData, isLoading } = useQuery({ queryKey: ['video-detail', videoId], queryFn: () => api.videos.getDetails(videoId!), enabled: !!videoId });
    const { data: rData } = useQuery({ queryKey: ['video-rec', videoId], queryFn: () => api.videos.getRecommended(videoId!), enabled: !!videoId });
    const { data: cData, refetch: refetchComments } = useQuery({ queryKey: ['video-comments', videoId], queryFn: () => api.videos.getComments(videoId!, 1), enabled: !!videoId });

    const video = vData?.video;
    const recommended = rData?.videos || []; // Ensure this array exists
    const comments = cData?.comments || [];

    useEffect(() => {
        if (video) setIsSubscribed(video.channel?.is_subscribed || false);
    }, [video]);

    // --- MUTATIONS ---
    const likeMutation = useMutation({ mutationFn: () => video?.is_liked ? api.videos.unlike(videoId!) : api.videos.like(videoId!), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['video-detail', videoId] }) });
    const dislikeMutation = useMutation({ mutationFn: () => video?.is_disliked ? api.videos.undislike(videoId!) : api.videos.dislike(videoId!), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['video-detail', videoId] }) });
    const subMutation = useMutation({ mutationFn: () => api.channels[isSubscribed ? 'unsubscribe' : 'subscribe'](video?.channel?.id!), onSuccess: () => setIsSubscribed(!isSubscribed) });
    const commentMutation = useMutation({ mutationFn: () => api.videos.comment(videoId!, commentText), onSuccess: () => { setCommentText(''); refetchComments(); Alert.alert('Posted'); } });
    const deleteMutation = useMutation({ mutationFn: () => api.videos.delete(videoId!), onSuccess: () => router.back() });

    // --- HANDLERS ---
    const togglePlay = async () => {
        if (!videoRef.current) return;
        if (isPlaying) { await videoRef.current.pauseAsync(); setShowControls(true); } 
        else { await videoRef.current.playAsync(); }
    };

    const handleDoubleTap = (e: any) => {
        const x = e.nativeEvent.locationX;
        const w = isFullscreen ? Dimensions.get('window').width : SCREEN_WIDTH;
        if (x < w * 0.4) seekVideo(-10);
        else if (x > w * 0.6) seekVideo(10);
        else {
            if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
            setShowControls(prev => !prev);
        }
    };

    const seekVideo = async (amt: number) => {
        if (!videoRef.current) return;
        const newPos = currentPosition + (amt * 1000);
        await videoRef.current.setStatusAsync({ positionMillis: newPos });
        setSeekDirection(amt > 0 ? 'forward' : 'backward');
        setShowSeekIcon(true);
        setTimeout(() => setShowSeekIcon(false), 500);
    };

    const handleLayout = (e: any) => { progressBarWidth.current = e.nativeEvent.layout.width; };
    const handleSeekStart = async () => {
        if (!videoRef.current) return;
        wasPlayingBeforeSeek.current = isPlaying;
        if (isPlaying) await videoRef.current.pauseAsync();
        setIsSeeking(true);
    };
    const handleSeekMove = (e: any) => {
        const width = progressBarWidth.current || 1;
        const pct = Math.max(0, Math.min(1, e.nativeEvent.locationX / width));
        setSeekPosition(pct * videoDuration);
    };
    const handleSeekEnd = async () => {
        if (!videoRef.current) return;
        await videoRef.current.setStatusAsync({ positionMillis: seekPosition, shouldPlay: wasPlayingBeforeSeek.current });
        setIsSeeking(false);
    };

    if (isLoading || !video) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;

    return (
        <View style={[styles.container, { paddingTop: isFullscreen ? 0 : insets.top }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" hidden={isFullscreen} />

            <View style={isFullscreen ? styles.fullPlayer : styles.playerBox}>
                <ExpoVideo
                    ref={videoRef}
                    source={{ uri: getMediaUri(video.video_url) }}
                    style={styles.video}
                    resizeMode={ResizeMode.CONTAIN}
                    shouldPlay={isPlaying}
                    onPlaybackStatusUpdate={(s: any) => {
                        if (s.isLoaded) {
                            if (videoDuration === 0) setVideoDuration(s.durationMillis || 0);
                            setCurrentPosition(s.positionMillis);
                            if (s.isPlaying !== isPlaying) setIsPlaying(s.isPlaying);
                            if (s.didJustFinish) { setIsPlaying(false); setShowControls(true); }
                        }
                    }}
                />
                <VideoController 
                    isPlaying={isPlaying} showControls={showControls} isFullscreen={isFullscreen}
                    isSeeking={isSeeking} currentPosition={currentPosition} videoDuration={videoDuration}
                    seekPosition={seekPosition} showSeekIcon={showSeekIcon} seekDirection={seekDirection}
                    togglePlayPause={togglePlay} toggleFullscreen={() => setIsFullscreen(p => !p)}
                    handleDoubleTap={handleDoubleTap} handleSeekStart={handleSeekStart} handleSeekMove={handleSeekMove}
                    handleSeekEnd={handleSeekEnd} handleLayout={handleLayout} goBack={() => isFullscreen ? setIsFullscreen(false) : router.back()}
                    progressBarRef={progressBarRef}
                />
            </View>

            {!isFullscreen && (
                <ScrollView style={{ flex: 1 }}>
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
                        <TouchableOpacity style={[styles.subBtn, isSubscribed && { backgroundColor: '#333' }]} onPress={() => subMutation.mutate()}>
                            <Text style={styles.subText}>{isSubscribed ? 'Subscribed' : 'Subscribe'}</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>

                    <VideoActions 
                        likesCount={video.likes_count} isLiked={video.is_liked} isDisliked={video.is_disliked}
                        handleLike={() => likeMutation.mutate()} handleDislike={() => dislikeMutation.mutate()}
                        handleShare={() => api.videos.share(videoId!)} setShowComments={setShowComments} setShowMenu={setShowMenu}
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

                    {/* 👇 Corrected Prop Passing: 'videos' expects 'recommended' data */}
                    <RecommendedVideos videos={recommended} />
                </ScrollView>
            )}

            <VideoModals 
                video={video} comments={comments} commentText={commentText} setCommentText={setCommentText}
                showComments={showComments} showDescription={showDescription} showMenu={showMenu}
                setShowComments={setShowComments} setShowDescription={setShowDescription} setShowMenu={setShowMenu}
                onPostComment={() => commentMutation.mutate()} isOwner={user?.id === video.user.id}
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
  info: { padding: 12 },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  meta: { fontSize: 12, color: Colors.textSecondary },
  channel: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#222' },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10, backgroundColor: '#333' },
  cName: { color: Colors.text, fontWeight: '700' },
  cSubs: { color: Colors.textSecondary, fontSize: 12 },
  subBtn: { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  subText: { color: '#000', fontWeight: '600' },
  teaser: { padding: 12, backgroundColor: '#1a1a1a', margin: 12, borderRadius: 10 },
  teaserTitle: { color: Colors.text, fontWeight: '700', fontSize: 14, marginBottom: 4 }
});
