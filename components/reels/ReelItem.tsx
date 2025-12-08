import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableWithoutFeedback, TouchableOpacity, Animated } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Music2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';

import { getMediaUri } from '@/utils/media';
import { api } from '@/services/api';

// 👇 Clean Components
import ReelActions from './ReelActions';
import SubscribeBtn from '@/components/buttons/SubscribeBtn';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_TAB_HEIGHT = 80;
const ACTUAL_HEIGHT = SCREEN_HEIGHT - BOTTOM_TAB_HEIGHT;

interface ReelItemProps {
    item: any;
    isActive: boolean;
    openComments: (id: string) => void;
    openOptions: (item: any) => void;
}

export default React.memo(function ReelItem({ item, isActive, openComments, openOptions }: ReelItemProps) {
    const videoRef = useRef<Video>(null);
    const insets = useSafeAreaInsets();
    const heartScale = useRef(new Animated.Value(0)).current;
    const [userPaused, setUserPaused] = useState(false);
    
    // Like State
    const [isLiked, setIsLiked] = useState(item.is_liked);
    const [likesCount, setLikesCount] = useState(item.likes_count);

    const likeMutation = useMutation({
        mutationFn: () => isLiked ? api.reels.unlike(item.id) : api.reels.like(item.id),
        onMutate: () => {
            setIsLiked(!isLiked);
            setLikesCount((prev: number) => isLiked ? prev - 1 : prev + 1);
        },
        onError: () => {
            setIsLiked(!isLiked);
            setLikesCount((prev: number) => isLiked ? prev + 1 : prev - 1);
        }
    });

    useEffect(() => {
        if (!videoRef.current) return;
        if (isActive && !userPaused) {
            videoRef.current.playAsync();
        } else {
            videoRef.current.pauseAsync();
            if (!isActive) {
                videoRef.current.setPositionAsync(0);
                setUserPaused(false);
            }
        }
    }, [isActive, userPaused]);

    const handleDoubleTap = useCallback(() => {
        if (!isLiked) likeMutation.mutate();
        
        heartScale.setValue(0);
        Animated.sequence([
            Animated.spring(heartScale, { toValue: 1, useNativeDriver: true }),
            Animated.timing(heartScale, { toValue: 0, duration: 200, useNativeDriver: true })
        ]).start();
    }, [isLiked]);

    const handlePress = () => {
        const lastTap = (handlePress as any).lastTap;
        const now = Date.now();
        if (lastTap && (now - lastTap) < 300) {
            handleDoubleTap();
        } else {
            setTimeout(() => setUserPaused(p => !p), 300);
        }
        (handlePress as any).lastTap = now;
    };

    return (
        <View style={[styles.container, { height: ACTUAL_HEIGHT }]}>
            <TouchableWithoutFeedback onPress={handlePress}>
                <View style={styles.videoWrapper}>
                    <Video
                        ref={videoRef}
                        source={{ uri: getMediaUri(item.video_url) }}
                        style={styles.video}
                        resizeMode={ResizeMode.COVER}
                        isLooping
                        posterSource={{ uri: getMediaUri(item.thumbnail_url) }}
                        shouldPlay={isActive && !userPaused}
                    />
                    
                    {/* Big Heart Animation (Center) */}
                    <View style={styles.centerHeart}>
                        <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                            <Heart size={100} color="#E1306C" fill="#E1306C" style={{ opacity: 0.9 }} />
                        </Animated.View>
                    </View>

                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.gradient} />

                    {/* 👇 Cleaned Up Actions (Right Side) */}
                    <View style={{ bottom: insets.bottom + 40, position: 'absolute', right: 0 }}>
                        <ReelActions 
                            item={item}
                            isLiked={isLiked}
                            likesCount={likesCount}
                            onLike={() => likeMutation.mutate()}
                            onComment={() => openComments(item.id)}
                            onOptions={() => openOptions(item)}
                        />
                    </View>

                    {/* Bottom Info Section */}
                    <View style={[styles.info, { bottom: insets.bottom + 10 }]}>
                        <View style={styles.userRow}>
                            <TouchableOpacity 
                                onPress={() => router.push({ pathname: '/channel/[channelId]', params: { channelId: item.channel_id } })} 
                                style={styles.userInfo}
                            >
                                <Image source={{ uri: getMediaUri(item.channel_avatar) }} style={styles.avatar} />
                                <Text style={styles.username}>{item.channel_name}</Text>
                            </TouchableOpacity>
                            
                            <SubscribeBtn 
                                channelId={item.channel_id}
                                isSubscribed={item.is_subscribed}
                                style={styles.subBtn}
                            />
                        </View>
                        
                        <Text style={styles.caption} numberOfLines={2}>{item.caption}</Text>
                        
                        <View style={styles.musicRow}>
                            <Music2 size={14} color="#fff" />
                            <Text style={styles.musicText}>Original Audio</Text>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </View>
    );
});

const styles = StyleSheet.create({
    container: { width: SCREEN_WIDTH, backgroundColor: '#000' },
    videoWrapper: { flex: 1 },
    video: { width: '100%', height: '100%' },
    centerHeart: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
    gradient: { position: 'absolute', bottom: 0, width: '100%', height: 250 },
    
    info: { position: 'absolute', left: 16, right: 80 },
    userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
    userInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    avatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#fff' },
    username: { color: '#fff', fontWeight: '700', fontSize: 16 },
    subBtn: { paddingVertical: 4, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: '#fff', borderRadius: 8, minWidth: 70 },
    
    caption: { color: '#fff', fontSize: 14, marginBottom: 10, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 3 },
    musicRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    musicText: { color: '#fff', fontSize: 13 }
});
