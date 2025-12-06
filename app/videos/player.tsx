import { Video as ExpoVideo, ResizeMode } from 'expo-av';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
  ActivityIndicator, Share, StatusBar, Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@tanstack/react-query';

import Colors from '@/constants/colors';
import { formatTimeAgo } from '@/constants/timeFormat';
import { api, MEDIA_BASE_URL } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext'; 
import { getDeviceId } from '@/utils/deviceId'; 

// <<< ALL EXTERNAL COMPONENTS IMPORTED SAFELY >>>
import VideoController from '@/components/video/VideoController'; 
import VideoActions from '@/components/video/VideoActions'; 
import VideoModals from '@/components/video/VideoModals'; 
import RecommendedVideos from '@/components/video/RecommendedVideos'; 

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- HELPERS (Minimal) ---

const getMediaUrl = (path: string | undefined) => {
  if (!path) return '';
  return path.startsWith('http') ? path : `${MEDIA_BASE_URL}/${path}`;
};

const formatViews = (views: number | undefined | null) => {
  const safeViews = Number(views) || 0;
  if (safeViews >= 1000000) return `${(safeViews / 1000000).toFixed(1)}M`;
  if (safeViews >= 1000) return `${(safeViews / 1000).toFixed(1)}K`;
  return safeViews.toString();
};


// --- MAIN PLAYER SCREEN ---

export default function VideoPlayerScreen() {
  const { videoId } = useLocalSearchParams<{ videoId: string }>();
  const insets = useSafeAreaInsets();
  const videoRef = useRef<ExpoVideo>(null);
  const { user } = useAuth();

  // Player State
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [videoDuration, setVideoDuration] = useState(0); 
  const [currentPosition, setCurrentPosition] = useState(0); 
  const [totalDurationSec, setTotalDurationSec] = useState(0); 
  
  // Fullscreen & Seeking State
  const [isFullscreen, setIsFullscreen] = useState(false); 
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0); 
  const progressBarRef = useRef<View | null>(null);
  const progressBarWidth = useRef(0);
  
  // Double-tap & Controls State
  const lastTapTime = useRef(0);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null); // For single tap to hide/show controls
  
  // Seek Feedback State
  const [showSeekIcon, setShowSeekIcon] = useState(false);
  const [seekDirection, setSeekDirection] = useState<'forward' | 'backward'>('forward');
  const seekFeedbackTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // <<< CRITICAL SEEKING STATE (FOR PAUSE-JUMP-PLAY) >>>
  const wasPlayingBeforeSeek = useRef(false); 
  

  // Logic & UI State
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showDescription, setShowDescription] = useState(false); 
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [commentText, setCommentText] = useState('');
  
  // Toast State and Refs for Cleanup
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);

  const showCustomToast = (message: string) => {
    // Clear any existing toast timeout before setting a new one
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    
    setToastMessage(message);
    setShowToast(true);
    
    // Set a new timeout and store its reference
    toastTimeout.current = setTimeout(() => {
        setShowToast(false);
        toastTimeout.current = null; // Mark as cleared
    }, 3000); 
  };


  // Data Fetching 
  const { data: videoData, isLoading } = useQuery({ queryKey: ['video-details', videoId], queryFn: () => api.videos.getDetails(videoId!), enabled: !!videoId });
  const { data: recData } = useQuery({ queryKey: ['video-rec', videoId], queryFn: () => api.videos.getRecommended(videoId!), enabled: !!videoId });
  const { data: commentsData, refetch: refetchComments } = useQuery({ queryKey: ['video-comments', videoId], queryFn: () => api.videos.getComments(videoId!, 1), enabled: !!videoId });
  
  const video = videoData?.video; 
  const recommended = recData?.videos || [];
  const comments = commentsData?.comments || [];

  // Mutations (No Change)
  const likeMutation = useMutation({ mutationFn: () => isLiked ? api.videos.unlike(videoId!) : api.videos.like(videoId!), onSuccess: (data) => { setIsLiked(data.isLiked); setLikesCount(data.likes); if(data.isLiked && isDisliked) { setIsDisliked(false); } }});
  const dislikeMutation = useMutation({ mutationFn: () => isDisliked ? api.videos.undislike(videoId!) : api.videos.dislike(videoId!), onSuccess: (data) => { setIsDisliked(data.isDisliked); if(data.isDisliked && isLiked) { setIsLiked(false); setLikesCount(prev => Math.max(0, prev - 1)); } }});
  const subscribeMutation = useMutation({ mutationFn: () => api.channels[isSubscribed ? 'unsubscribe' : 'subscribe'](video?.channel?.id!), onSuccess: () => setIsSubscribed(!isSubscribed) });
  const commentMutation = useMutation({ mutationFn: (txt: string) => api.videos.comment(videoId!, txt), onSuccess: () => { setCommentText(''); refetchComments(); showCustomToast('Comment posted!'); } });
  const reportMutation = useMutation({ mutationFn: () => api.videos.report(videoId!, 'Inappropriate'), onSuccess: () => { showCustomToast('Thanks for reporting! We will review this video shortly.'); } });
  const deleteMutation = useMutation({ mutationFn: () => api.videos.delete(videoId!), onSuccess: () => { showCustomToast('Video has been successfully deleted.'); router.back(); } });
  const saveMutation = useMutation({ mutationFn: () => api.videos.save(videoId!), onSuccess: (data) => { const message = data.isSaved ? 'Video saved to your library!' : 'Video removed from library.'; showCustomToast(message); } });


  // --- HANDLERS (Defined here, passed to components) ---
  const handleLike = () => { likeMutation.mutate(); };
  const handleDislike = () => { dislikeMutation.mutate(); }; 
  const handleShare = async () => {
    api.videos.share(videoId!);
    try { await Share.share({ message: `Check this video: https://moviedbr.com/video/${videoId}` }); } catch {}
  };
  const handleReport = () => { Alert.alert('Confirm Report', 'Are you sure you want to report this video for inappropriate content?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Report', style: 'destructive', onPress: () => reportMutation.mutate() }]); };
  const handleDelete = () => { Alert.alert('Delete', 'Are you sure you want to delete this video?', [{text:'Cancel'}, {text:'Delete', style:'destructive', onPress:()=> deleteMutation.mutate() }]); };
  const handleSave = () => { saveMutation.mutate(); }
  
  // Seek feedback display function
  const displaySeekFeedback = (direction: 'forward' | 'backward') => {
      if (seekFeedbackTimeout.current) clearTimeout(seekFeedbackTimeout.current);
      setSeekDirection(direction);
      setShowSeekIcon(true);
      seekFeedbackTimeout.current = setTimeout(() => {
          setShowSeekIcon(false);
          seekFeedbackTimeout.current = null;
      }, 500);
  };
  
  // Seek Video by X seconds (used by double-tap)
  const seekVideo = useCallback(async (amount: number) => {
    if (!videoRef.current) return;
    
    const status = await videoRef.current.getStatusAsync();
    if (!status.isLoaded) return;
    const currentPosMillis = status.positionMillis || currentPosition;
    const newPosition = currentPosMillis + amount * 1000;
    const maxDuration = videoDuration;
    const finalPosition = Math.min(Math.max(0, newPosition), maxDuration);

    try {
      // Use statusAsync command for reliable jump without immediate play/pause change
      await videoRef.current.setStatusAsync({ positionMillis: finalPosition });
      
      // Update seekPosition to show the marker move visually in the VideoController
      if (showControls) setSeekPosition(finalPosition); 
      
      // The onPlaybackStatusUpdate will handle updating currentPosition and isPlaying.

    } catch (e) { console.log('Seek failed:', e); }
  }, [currentPosition, videoDuration, showControls]);


  // SEEKING BAR LOGIC 
  const handleSeek = (x: number) => {
      const barWidth = progressBarWidth.current || SCREEN_WIDTH; 
      const newPositionPercentage = Math.min(1, Math.max(0, x / barWidth));
      const newPositionMillis = videoDuration * newPositionPercentage;
      setSeekPosition(newPositionMillis);
  };

  // <<< PAUSE-JUMP-PLAY LOGIC START (FIXED) >>>
  const handleSeekStart = async (event: any) => { 
      if (!videoRef.current) return;
      
      const status = await videoRef.current.getStatusAsync();
      if (!status.isLoaded) return;
      
      // 1. Save the playback state and force pause
      wasPlayingBeforeSeek.current = status.isPlaying || false; 

      if (status.isPlaying) {
          await videoRef.current.pauseAsync();
          // Do NOT setIsPlaying(false) here, let onPlaybackStatusUpdate handle the state change
      }
      
      // 2. Enter seeking mode
      // Initialize seekPosition to the *current* video position, not 0
      const initialSeekPos = status.positionMillis;
      setSeekPosition(initialSeekPos); 
      setIsSeeking(true);
      handleSeek(event.nativeEvent.locationX);
  };


  const handleSeekMove = (event: any) => {
      if (isSeeking) { handleSeek(event.nativeEvent.locationX); }
  };

  // FIX: Use combined statusAsync command for reliable JUMP and conditional PLAY/PAUSE
  const handleSeekEnd = async () => {
      if (videoRef.current) {
          try {
              // Commit the seek command, and set shouldPlay based on the state before seeking started.
              await videoRef.current.setStatusAsync({ 
                  positionMillis: seekPosition,
                  shouldPlay: wasPlayingBeforeSeek.current 
              }); 
              
              // Reset seeking mode and seekPosition (currentPosition will update from onPlaybackStatusUpdate)
              setIsSeeking(false);
              setSeekPosition(0); 

          } catch (e) {
               console.log('Final seek failed:', e);
               setIsSeeking(false);
               setSeekPosition(0);
          }
      }
  };
  // <<< PAUSE-JUMP-PLAY LOGIC END >>>


  const handleLayout = (event: any) => { progressBarWidth.current = event.nativeEvent.layout.width; };

  // DOUBLE TAP LOGIC (FIXED)
  const handleDoubleTap = (event: any) => {
    const now = Date.now();
    const tapInterval = now - lastTapTime.current;
    lastTapTime.current = now; // Update tap time for the next check
    
    // Clear the controls timeout if it exists, as this is a tap event
    if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
        controlsTimeout.current = null;
    }
    
    // Detect double tap
    if (tapInterval < 300) {
      const tapX = event.nativeEvent.locationX;
      const currentWidth = isFullscreen ? Dimensions.get('window').width : SCREEN_WIDTH; 
      const isLeft = tapX < currentWidth * 0.4;
      const isRight = tapX > currentWidth * 0.6;
      
      if (isLeft) { seekVideo(-10); displaySeekFeedback('backward'); } 
      else if (isRight) { seekVideo(10); displaySeekFeedback('forward'); }
      
      // Keep controls visible after seeking
      setShowControls(true); 
      
      // Immediately reset lastTapTime to prevent triple-tap or control toggle
      lastTapTime.current = 0; 
      return;
    }
    
    // Single Tap: Set a timeout to toggle controls only if no second tap occurs
    controlsTimeout.current = setTimeout(() => {
        // If lastTapTime hasn't been reset (meaning no double-tap occurred)
        if (lastTapTime.current !== 0) { 
            setShowControls(prev => !prev); 
        }
        lastTapTime.current = 0; // Reset after the single-tap action is complete
        controlsTimeout.current = null;
    }, 300);
  };
  
  const toggleFullscreen = () => { setIsFullscreen(prev => !prev); };
  
  const goBack = () => {
      if (isFullscreen) { toggleFullscreen(); } 
      else { router.back(); }
  };

  const togglePlayPause = async () => {
    if (!videoRef.current) return;
    if (isPlaying) { await videoRef.current.pauseAsync(); setShowControls(true); } 
    else { await videoRef.current.playAsync(); }
    // Note: isPlaying state is now updated via onPlaybackStatusUpdate for consistency
  };
  
  const trackVideoWatch = useCallback(async (watchedSec: number) => {
    if (videoId && watchedSec > 1) {
      const completionRate = Math.min(1, watchedSec / (totalDurationSec || 1)); 
      getDeviceId().then(deviceId => {
        api.videos.trackWatch(videoId, watchedSec, completionRate);
      });
    }
  }, [videoId, totalDurationSec]);

  // Effects and Watch Time Cleanup (Existing Logic)
  useEffect(() => {
    if (video) { 
        setLikesCount(video.likes_count || 0);
        setIsLiked(video.is_liked || false);
        setIsDisliked(video.is_disliked || false);
        setIsSubscribed(video.channel.is_subscribed || false);
        setTotalDurationSec(video.duration_sec || 0); 
    }
  }, [video]);
  
  // Cleanup Effects
  useEffect(() => {
    let watchTimer: NodeJS.Timeout | null = null;
    let secondsWatched = 0;
    
    // Start tracking watch time every 5 seconds if playing
    if (isPlaying && !isSeeking) {
        watchTimer = setInterval(() => {
            secondsWatched += 5;
            trackVideoWatch(secondsWatched);
        }, 5000);
    }
    
    return () => {
        // Cleanup 1: Clear the video tracking timer
        if (watchTimer) clearInterval(watchTimer);
        
        // Cleanup 2: Clear the custom toast timeout
        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        
        // Cleanup 3: Clear the controls timeout
        if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
        
        // Cleanup 4: Clear the seek feedback timeout
        if (seekFeedbackTimeout.current) clearTimeout(seekFeedbackTimeout.current);
        
        // When screen unmounts, track the final watch time.
        if (secondsWatched > 0) {
            trackVideoWatch(secondsWatched);
        }
    };
  }, [videoId, totalDurationSec, isPlaying, isSeeking, trackVideoWatch]);


  // Null Check
  if (isLoading || !video || !video.channel) { 
    return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  const videoUrl = getMediaUrl(video.video_url);
  const thumbnailUrl = getMediaUrl(video.thumbnail_url); 
  
  // Robust Channel Data Access
  const channelName = video.channel.name || 'Channel Name'; 
  const channelAvatar = getMediaUrl(video.channel.avatar || 'assets/c_profile.jpg');
  const subscriberCount = video.channel.subscribers_count || 0;
  const viewsDisplay = formatViews(video.views_count);
  const isOwner = video.user.id === user?.id; 


  return (
    <View style={[styles.container, { paddingTop: isFullscreen ? 0 : insets.top }]}>
      
      <Stack.Screen options={{ headerShown: false }} /> 
      
      <StatusBar barStyle="light-content" hidden={isFullscreen} />

      {/* PLAYER AREA */}
      <View style={isFullscreen ? styles.playerContainerFull : styles.playerContainer}>
        <ExpoVideo
          key={videoId} 
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={isPlaying}
          useNativeControls={false}
          
          usePoster={true} 
          posterSource={{ uri: thumbnailUrl }}
          posterStyle={StyleSheet.absoluteFillObject}
          
          // FIX: Simplified onPlaybackStatusUpdate for consistent position/state tracking
          onPlaybackStatusUpdate={status => {
             if (status.isLoaded) {
                 // Only set duration once
                 if (videoDuration === 0) setVideoDuration(status.durationMillis || 0);
                 
                 // Always update position from the actual player status
                 setCurrentPosition(status.positionMillis);
                 
                 // Keep isPlaying state in sync with the actual player status
                 // Only update if the player's status differs from the local state
                 if (status.isPlaying !== isPlaying) {
                     setIsPlaying(status.isPlaying || false);
                 }
                 
                 if (status.didJustFinish) { 
                    setIsPlaying(false); 
                    setShowControls(true); 
                 }
             }
          }}
          onError={(e) => console.log('CRITICAL EXPO VIDEO ERROR:', e)}
        />
        
        {/* RENDER THE SEPARATE VIDEO CONTROLLER COMPONENT */}
        <VideoController 
            isPlaying={isPlaying}
            showControls={showControls}
            isFullscreen={isFullscreen}
            isSeeking={isSeeking}
            currentPosition={currentPosition}
            videoDuration={videoDuration}
            // Use seekPosition when seeking, otherwise use currentPosition
            seekPosition={isSeeking ? seekPosition : currentPosition} 
            showSeekIcon={showSeekIcon}
            seekDirection={seekDirection}
            togglePlayPause={togglePlayPause}
            toggleFullscreen={toggleFullscreen}
            handleDoubleTap={handleDoubleTap}
            handleSeekStart={handleSeekStart}
            handleSeekMove={handleSeekMove}
            handleSeekEnd={handleSeekEnd}
            handleLayout={handleLayout}
            goBack={goBack}
            progressBarRef={progressBarRef}
        />
        
      </View>

      {/* SCROLLABLE CONTENT - Hide when in fullscreen */}
      {!isFullscreen && (
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            {/* 1. Title & Views */}
            <View style={styles.infoSection}>
                <Text style={styles.title}>{video.title}</Text>
                <Text style={styles.meta}>{viewsDisplay} views · {formatTimeAgo(video.created_at)}</Text>
            </View>

            {/* 2. CHANNEL ROW */}
            <TouchableOpacity style={styles.channelRow} onPress={() => router.push({ pathname: '/channel/[channelId]', params: { channelId: video.channel.id } })}>
                <View style={{flexDirection:'row', alignItems:'center', flex:1}}>
                    <Image source={{ uri: channelAvatar }} style={styles.channelAvatar} />
                    <View>
                        <Text style={styles.channelName}>{channelName}</Text>
                        <Text style={styles.subsText}>{formatViews(subscriberCount)} subscribers</Text>
                    </View>
                </View>
                <TouchableOpacity 
                    style={[styles.subBtn, isSubscribed && styles.subBtnActive]} 
                    onPress={() => subscribeMutation.mutate()}
                >
                    <Text style={[styles.subText, isSubscribed && styles.subTextActive]}>
                        {isSubscribed ? 'Subscribed' : 'Subscribe'}
                    </Text>
                </TouchableOpacity>
            </TouchableOpacity>

            {/* 3. VIDEO ACTIONS ROW (Extracted Component) */}
            <VideoActions 
                likesCount={likesCount}
                isLiked={isLiked}
                isDisliked={isDisliked}
                handleLike={handleLike}
                handleDislike={handleDislike}
                handleShare={handleShare}
                setShowComments={setShowComments}
                setShowMenu={setShowMenu}
            />

            {/* 4. DESCRIPTION TEASER */}
            <TouchableOpacity style={styles.descContainerCard} onPress={() => setShowDescription(true)}>
                <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:4}}>
                    <Text style={styles.commentsHeader}>Description</Text>
                    <ChevronDown size={18} color={Colors.textSecondary} />
                </View>
                <Text numberOfLines={2} style={styles.descTextCard}>
                    {video.description || 'No description provided.'}
                </Text>
            </TouchableOpacity>

            {/* 5. COMMENTS TEASER */}
            <TouchableOpacity style={styles.commentsTeaser} onPress={() => setShowComments(true)}>
                <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:8}}>
                    <Text style={styles.commentsHeader}>Comments</Text>
                    <Text style={styles.commentsCount}>{comments.length}</Text>
                </View>
                {/* Checks for comments[0] and comments[0].user remain correct */}
                {comments.length > 0 && comments[0] && comments[0].user ? (
                    <View style={{flexDirection:'row', alignItems:'center', gap:10}}>
                        <Image source={{ uri: getMediaUrl(comments[0].user.avatar) }} style={{width:24, height:24, borderRadius:12}} />
                        <Text numberOfLines={1} style={{color:Colors.text, fontSize:13, flex:1}}>{comments[0].content}</Text>
                    </View>
                ) : (
                    <Text style={styles.commentsCount}>Add a public comment...</Text>
                )}
            </TouchableOpacity>

            {/* 6. RECOMMENDED VIDEOS (Extracted Component) */}
            <RecommendedVideos recommended={recommended} />
        </ScrollView>
      )}

      {/* --- RENDER MODALS (Extracted Component) --- */}
      <VideoModals 
        videoTitle={video.title}
        viewsDisplay={viewsDisplay}
        videoCreatedAt={video.created_at}
        videoDescription={video.description}
        comments={comments}
        commentText={commentText}
        setCommentText={setCommentText}
        commentMutation={() => commentMutation.mutate(commentText)}
        showComments={showComments}
        showDescription={showDescription}
        setShowComments={setShowComments}
        setShowDescription={setShowDescription}
        showMenu={showMenu}
        setShowMenu={setShowMenu}
        isOwner={isOwner}
        handleDelete={() => handleDelete()}
        handleReport={() => handleReport()}
        handleSave={() => handleSave()}
      />
      
      {/* <<< CUSTOM TOAST COMPONENT >>> */}
      {showToast && (
           <View style={styles.customToast}>
               <Text style={styles.customToastText}>{toastMessage}</Text>
           </View>
      )}


    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { justifyContent: 'center', alignItems: 'center', flex: 1 },
  
  // Player
  playerContainer: { width: SCREEN_WIDTH, aspectRatio: 16/9, backgroundColor: '#000' },
  playerContainerFull: {
    width: Dimensions.get('window').width, 
    height: Dimensions.get('window').height,
    backgroundColor: '#000',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  
  video: { width: '100%', height: '100%' },
  
  // Content
  scrollContent: { flex: 1 },
  infoSection: { padding: 12, paddingBottom: 0 },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 6, lineHeight: 24 },
  meta: { fontSize: 12, color: Colors.textSecondary },
  
  // Description Teaser
  descContainerCard: { padding: 12, backgroundColor: '#1a1a1a', marginHorizontal: 12, marginTop: 8, marginBottom: 12, borderRadius: 10 },
  descTextCard: { fontSize: 13, color: Colors.text, flex: 1, lineHeight: 18 },

  // Channel
  channelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#222' },
  channelAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10, backgroundColor: '#333' },
  channelName: { color: Colors.text, fontWeight: '700', fontSize: 15 },
  subsText: { color: Colors.textSecondary, fontSize: 12 },
  subBtn: { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  subBtnActive: { backgroundColor: '#333', borderWidth: 1, borderColor: '#444' },
  subText: { color: '#000', fontWeight: '600', fontSize: 13 },
  subTextActive: { color: '#fff' },

  // Comments Teaser
  commentsTeaser: { padding: 12, backgroundColor: '#1a1a1a', marginHorizontal: 12, marginBottom: 12, borderRadius: 10 },
  commentsHeader: { color: Colors.text, fontWeight: '700', fontSize: 14 },
  commentsCount: { color: Colors.textSecondary },

  // Recommended Cards 
  recSection: { paddingBottom: 40 },
  recCard: { marginBottom: 16 },
  recThumbContainer: { width: SCREEN_WIDTH, aspectRatio: 16/9, backgroundColor: '#222' },
  recThumb: { width: '100%', height: '100%' },
  recDuration: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  recDurationText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  recInfo: { flexDirection: 'row', padding: 12, gap: 12 },
  recAvatar: { width: 36, height: 36, borderRadius: 18 },
  recTextCol: { flex: 1, gap: 4 },
  recTitle: { color: Colors.text, fontSize: 15, fontWeight: '500', lineHeight: 20 },
  recMeta: { color: Colors.textSecondary, fontSize: 12 },
  
  // Custom Toast Styles
  customToast: {
    position: 'absolute',
    bottom: 50, 
    alignSelf: 'center',
    backgroundColor: Colors.primary, 
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 9999,
  },
  customToastText: {
    color: '#000', 
    fontWeight: '600',
    fontSize: 14,
  },
});
