// components/stories/StoryPlayer.tsx

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, TextInput, Animated, ActivityIndicator, KeyboardAvoidingView, PanResponder, StatusBar, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Heart, Send, Trash2, Eye } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import Colors from '@/constants/colors';
import { formatTimeAgo } from '@/constants/timeFormat';
import { useAuth } from '@/contexts/AuthContext';
import { api, MEDIA_BASE_URL } from '@/services/api';
import FloatingHeart from './FloatingHeart';
import ViewersModal from './ViewersModal';
import CustomAlert from '@/components/modals/CustomAlert'; 
import { useToast } from '@/contexts/ToastContext'; // Assuming this hook is available

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StoryPlayerProps {
    initialUserId?: string;
}

export default function StoryPlayer({ initialUserId }: StoryPlayerProps) {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const toast = useToast();

  // --- STATE ---
  const [activeUserIndex, setActiveUserIndex] = useState(0);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [message, setMessage] = useState('');
  const [showViewers, setShowViewers] = useState(false);
  const [hearts, setHearts] = useState<number[]>([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [alertConfig, setAlertConfig] = useState<any>({ visible: false });

  const progressAnim = useRef(new Animated.Value(0)).current;
  const videoRef = useRef<Video>(null);

  // --- DATA ---
  const { data: storiesData, isLoading } = useQuery({ 
    queryKey: ['stories'], 
    queryFn: () => api.stories.getStories() 
  });
  
  const storyGroups = useMemo(() => {
    if (!storiesData?.stories) return [];
    const groups: any[] = [];
    const map = new Map();
    storiesData.stories.forEach((story: any) => {
      const uid = story.user?.id || story.user_id;
      if (!map.has(uid)) { map.set(uid, { userId: uid, user: story.user, stories: [] }); groups.push(map.get(uid)); }
      map.get(uid).stories.push(story);
    });
    return groups;
  }, [storiesData]);

  useEffect(() => {
    if (storyGroups.length > 0 && initialUserId) {
      const index = storyGroups.findIndex(g => String(g.userId) === String(initialUserId));
      if (index !== -1) setActiveUserIndex(index);
    }
  }, [initialUserId, storyGroups.length]);
  
  const currentGroup = storyGroups[activeUserIndex];
  const currentStory = currentGroup?.stories[currentStoryIndex];
  const isOwnStory = String(currentGroup?.userId) === String(currentUser?.id);

  // --- EFFECTS ---
  useEffect(() => {
    if (currentStory) {
        setHasLiked(!!currentStory.is_liked);
        setIsLoaded(false); 
        progressAnim.setValue(0);
    }
  }, [currentStory?.id]);

  const viewMutation = useMutation({ mutationFn: (id: string) => api.stories.view(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stories'] }) });
  const reactMutation = useMutation({ mutationFn: (id: string) => api.stories.react(id, 'heart') });
  
  const deleteMutation = useMutation({ 
    mutationFn: (id: string) => api.stories.delete(id), 
    onSuccess: () => { 
        queryClient.invalidateQueries({ queryKey: ['stories'] }); 
        setAlertConfig({ visible: false });
        // ✅ FIX: AppToast for success notification
        toast.show('Story deleted successfully.', 'success'); 
        
        if (currentGroup.stories.length === 1) closeViewer(); else advanceStory(); 
    },
    onError: (err: any) => {
        setAlertConfig({ visible: false }); 
        // ✅ FIX: AppToast for error notification
        toast.show(`Failed to delete story: ${err.message}`, 'error');
        setIsPaused(false);
    } 
  });

  const closeViewer = () => router.back();

  const advanceStory = useCallback(() => {
    progressAnim.setValue(0); setIsLoaded(false);
    if (currentStoryIndex < currentGroup.stories.length - 1) setCurrentStoryIndex(prev => prev + 1);
    else if (activeUserIndex < storyGroups.length - 1) { setActiveUserIndex(prev => prev + 1); setCurrentStoryIndex(0); }
    else closeViewer();
  }, [currentStoryIndex, currentGroup, activeUserIndex, storyGroups, closeViewer, progressAnim]);

  const previousStory = () => {
    progressAnim.setValue(0); setIsLoaded(false);
    if (currentStoryIndex > 0) setCurrentStoryIndex(prev => prev - 1);
    else if (activeUserIndex > 0) { setActiveUserIndex(prev => prev - 1); setCurrentStoryIndex(storyGroups[activeUserIndex - 1].stories.length - 1);
    }
    else setCurrentStoryIndex(0);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10 || Math.abs(g.dy) > 10,
      onPanResponderGrant: () => setIsPaused(true),
      onPanResponderRelease: (_, g) => {
        setIsPaused(false);
        if (Math.abs(g.dy) > Math.abs(g.dx)) { 
            if (g.dy > 50) closeViewer(); 
            else if (g.dy < -50 && isOwnStory) setShowViewers(true);
        } else {
            if (Math.abs(g.dx) < 10 && Math.abs(g.dy) < 10) { 
               if (g.x0 < SCREEN_WIDTH * 0.3) previousStory(); else advanceStory();
            }
        }
      }
    })
  ).current;

  useEffect(() => {
    if (!currentStory || isPaused || !isLoaded || alertConfig.visible || showViewers) return;
    if (!currentStory.is_viewed && !isOwnStory) viewMutation.mutate(currentStory.id);
    
    const duration = currentStory.media_type === 'video' ? (currentStory.duration ? currentStory.duration * 1000 : 15000) : 5000;
    Animated.timing(progressAnim, { toValue: 1, duration: duration, useNativeDriver: false }).start(({ finished }) => { if (finished) advanceStory(); });
    return () => progressAnim.stopAnimation();
  }, [currentStoryIndex, activeUserIndex, isPaused, isLoaded, currentStory, alertConfig.visible, showViewers, advanceStory, isOwnStory, viewMutation, progressAnim]);
  
  const handleReaction = () => {
    const willLike = !hasLiked;
    setHasLiked(willLike);
    if (willLike) setHearts(prev => [...prev, Date.now()]);
    reactMutation.mutate(currentStory.id);
  };

  const getUrl = (path: string) => path?.startsWith('http') ? path : `${MEDIA_BASE_URL}/${path}`;
  
  const handleReplySend = async () => {
    if (!message.trim() || !currentStory) return;
    // We assume api.stories.reply exists now
    try {
        await api.stories.react(currentStory.id, message.trim()); // Using react endpoint for DM/reply simplicity
        setMessage('');
        toast.show('Message sent!', 'success');
    } catch (error: any) {
        toast.show(`Failed to send message: ${error.message}`, 'error');
    }
  };

  if (isLoading || !currentStory) return <View style={styles.container}><ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 100 }} /></View>;
  
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={{ flex: 1 }} {...panResponder.panHandlers}>
        <View style={styles.mediaContainer}>
            {!isLoaded && <ActivityIndicator size="large" color="#fff" style={styles.loader} />}
            {currentStory.media_type === 'video' ? (
                <Video 
                    ref={videoRef} source={{ uri: getUrl(currentStory.media_url) }} style={styles.media} resizeMode={ResizeMode.COVER} shouldPlay={!isPaused && isLoaded && !alertConfig.visible && !showViewers} onLoad={() => setIsLoaded(true)} 
                />
            ) : (
                <Image source={{ uri: getUrl(currentStory.media_url) }} style={styles.media} contentFit="cover" onLoad={() => setIsLoaded(true)} />
            )}
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.bottomGradient} />
        </View>

        {!isPaused && !alertConfig.visible && !showViewers && (
            <View style={[styles.overlay, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 10 }]}>
                {/* Header */}
                <View style={styles.topSection}>
                    <View style={styles.progressContainer}>
                        {currentGroup.stories.map((_: any, i: number) => (
                            <View key={i} style={styles.progressBarBg}>
                                <Animated.View style={[styles.progressBarFill, { width: i === currentStoryIndex ?
                                progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) : i < currentStoryIndex ?
                                '100%' : '0%' }]} />
                            </View>
                        ))}
                    </View>
                    <View style={styles.headerRow}>
                        <View style={styles.userInfo}>
                            <Image source={{ uri: getUrl(currentGroup.user?.avatar) }} style={styles.avatar} />
                            <View>
                                <Text style={styles.username}>{currentGroup.user?.username}</Text>
                                <Text style={styles.timeAgo}>{formatTimeAgo(currentStory.created_at)}</Text>
                            </View>
                        </View>
                        <View style={styles.headerRight}>
                            {isOwnStory && <TouchableOpacity onPress={() => { setIsPaused(true);
                            setAlertConfig({ visible: true, title: 'Delete', message: 'Delete this story?', confirmText: 'Delete', isDestructive: true, onConfirm: () => deleteMutation.mutate(currentStory.id), onCancel: () => { setAlertConfig({ visible: false }); setIsPaused(false); } }) }}><Trash2 color="#fff" size={20} /></TouchableOpacity>}
                            <TouchableOpacity onPress={closeViewer}><X color="#fff" size={24} /></TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.heartsContainer} pointerEvents="none">
                        {hearts.map(id => <FloatingHeart key={id} onComplete={() => setHearts(p => p.filter(h => h !== id))} />)}
                    </View>
                    {currentStory.caption && <View style={styles.captionContainer}><Text style={styles.captionText}>{currentStory.caption}</Text></View>}
                    
                    {isOwnStory ? (
                        <TouchableOpacity style={styles.viewsPill} onPress={() => { setIsPaused(true); setShowViewers(true); }}>
                            <Eye color="#fff" size={18} />
                            <Text style={styles.viewsText}>{currentStory.views_count || 0} Views</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.replyRow}>
                            <View style={styles.inputPill}>
                                <TextInput placeholder="Send message..." placeholderTextColor="rgba(255,255,255,0.7)" style={styles.input} value={message} onChangeText={setMessage} onFocus={() => setIsPaused(true)} onBlur={() => setIsPaused(false)} />
                                {message.length > 0 && <TouchableOpacity onPress={handleReplySend}><Send color="#3B82F6" size={20} /></TouchableOpacity>}
                            </View>
                            <TouchableOpacity style={styles.heartBtn} onPress={handleReaction}>
                                <Heart color={hasLiked ? "#E1306C" : "#fff"} fill={hasLiked ? "#E1306C" : "transparent"} size={28} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        )}
      </View>

      <ViewersModal visible={showViewers} storyId={currentStory.id} onClose={() => { setShowViewers(false); setIsPaused(false); }} />
      {alertConfig.visible && <CustomAlert {...alertConfig} />}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  mediaContainer: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000', justifyContent: 'center' },
  media: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
  loader: { position: 'absolute', alignSelf: 'center', zIndex: 1 },
  bottomGradient: { position: 'absolute', bottom: 0, width: '100%', height: 150 },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
  topSection: { paddingHorizontal: 12 },
  progressContainer: { flexDirection: 'row', gap: 4, marginBottom: 12 },
  progressBarBg: { flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: '#fff' },
  username: { color: '#fff', fontWeight: '700', fontSize: 13 },
  timeAgo: { color: '#ddd', fontSize: 11 },
  headerRight: { flexDirection: 'row', gap: 16 },
  footer: { paddingHorizontal: 16, gap: 16, marginBottom: 20 },
  captionContainer: { alignSelf: 'center', marginBottom: 10 },
  captionText: { color: '#fff', fontSize: 16, textAlign: 'center', textShadowColor: '#000', textShadowRadius: 3 },
  viewsPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', alignSelf: 'center', padding: 10, borderRadius: 20, gap: 8 },
  viewsText: { color: '#fff', fontWeight: '700' },
  replyRow: { flexDirection: 'row', gap: 12 },
  inputPill: { flex: 1, height: 48, borderRadius: 24, borderWidth: 1, borderColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, backgroundColor: 'rgba(0,0,0,0.3)' },
  input: { flex: 1, color: '#fff' },
  heartBtn: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#fff' },
  heartsContainer: { position: 'absolute', bottom: 60, right: 20, height: 300, width: 50 }
});
