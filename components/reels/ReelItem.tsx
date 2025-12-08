import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableWithoutFeedback, TouchableOpacity, Animated } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, MessageCircle, Share2, MoreVertical, Music2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getMediaUri } from '@/utils/media';
import { api } from '@/services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_TAB_HEIGHT = 80; // Adjust based on OS if needed
const ACTUAL_HEIGHT = SCREEN_HEIGHT - BOTTOM_TAB_HEIGHT;

interface ReelItemProps {
    item: any;
    isActive: boolean;
    toggleLike: (id: string) => void;
    toggleSubscribe: (id: string) => void;
    openComments: (id: string) => void;
    openOptions: (item: any) => void;
}

export default React.memo(function ReelItem({ item, isActive, toggleLike, toggleSubscribe, openComments, openOptions }: ReelItemProps) {
    const videoRef = useRef<Video>(null);
    const insets = useSafeAreaInsets();
    const heartScale = useRef(new Animated.Value(0)).current;
    const [userPaused, setUserPaused] = useState(false);

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
        if (!item.is_liked) toggleLike(item.id);
        heartScale.setValue(0);
        Animated.sequence([
            Animated.spring(heartScale, { toValue: 1, useNativeDriver: true }),
            Animated.timing(heartScale, { toValue: 0, duration: 200, useNativeDriver: true })
        ]).start();
    }, [item.is_liked, toggleLike]);

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
                    />
                    <View style={styles.centerHeart}>
                        <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                            <Heart size={100} color="#E1306C" fill="#E1306C" style={{ opacity: 0.9 }} />
                        </Animated.View>
                    </View>
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.gradient} />

                    <View style={[styles.actions, { bottom: insets.bottom + 100 }]}>
                        <TouchableOpacity onPress={() => toggleLike(item.id)} style={styles.actionBtn}>
                            <Heart size={32} color={item.is_liked ? "#E1306C" : "#fff"} fill={item.is_liked ? "#E1306C" : "transparent"} />
                            <Text style={styles.actionText}>{item.likes_count}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => openComments(item.id)} style={styles.actionBtn}>
                            <MessageCircle size={32} color="#fff" />
                            <Text style={styles.actionText}>{item.comments_count}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => api.reels.share(item.id)} style={styles.actionBtn}>
                            <Share2 size={30} color="#fff" />
                            <Text style={styles.actionText}>{item.shares_count}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => openOptions(item)} style={styles.actionBtn}>
                            <MoreVertical size={28} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.info, { bottom: insets.bottom + 20 }]}>
                        <View style={styles.userRow}>
                            <TouchableOpacity onPress={() => router.push({ pathname: '/channel/[channelId]', params: { channelId: item.channel_id } })}>
                                <Image source={{ uri: getMediaUri(item.channel_avatar) }} style={styles.avatar} />
                            </TouchableOpacity>
                            <Text style={styles.username}>{item.channel_name}</Text>
                            <TouchableOpacity style={[styles.subBtn, item.is_subscribed && styles.subBtnActive]} onPress={() => toggleSubscribe(item.channel_id)}>
                                <Text style={[styles.subText, item.is_subscribed && { color: '#fff' }]}>{item.is_subscribed ? 'Subscribed' : 'Subscribe'}</Text>
                            </TouchableOpacity>
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
    gradient: { position: 'absolute', bottom: 0, width: '100%', height: 200 },
    actions: { position: 'absolute', right: 10, alignItems: 'center', gap: 20 },
    actionBtn: { alignItems: 'center' },
    actionText: { color: '#fff', fontSize: 13, marginTop: 5, fontWeight: '600' },
    info: { position: 'absolute', left: 16, right: 80 },
    userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    avatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#fff', marginRight: 10 },
    username: { color: '#fff', fontWeight: '700', fontSize: 16, marginRight: 10 },
    subBtn: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
    subBtnActive: { backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: '#fff' },
    subText: { fontSize: 12, fontWeight: '700', color: '#000' },
    caption: { color: '#fff', fontSize: 14, marginBottom: 10 },
    musicRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    musicText: { color: '#fff', fontSize: 13 }
});
      
