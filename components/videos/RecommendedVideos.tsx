import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { formatTimeAgo } from '@/constants/timeFormat';
import { getMediaUri } from '@/utils/media';
import { formatViews, formatDuration } from '@/utils/format';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function RecommendedVideos({ recommended }: { recommended: any[] }) {
    if (!recommended || recommended.length === 0) return null;

    return (
        <View style={styles.list}>
            {recommended.map((item) => (
                <TouchableOpacity 
                    key={item.id} 
                    style={styles.card} 
                    onPress={() => router.replace({ pathname: '/videos/player', params: { videoId: item.id } })}
                >
                    <View style={styles.thumbBox}>
                        <Image source={{ uri: getMediaUri(item.thumbnail_url) }} style={styles.thumb} contentFit="cover" />
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{formatDuration(item.duration)}</Text>
                        </View>
                    </View>
                    <View style={styles.info}>
                        <Image source={{ uri: getMediaUri(item.channel_avatar) }} style={styles.avatar} />
                        <View style={styles.textCol}>
                            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                            <Text style={styles.meta}>
                                {item.channel_name} · {formatViews(item.views_count)} views · {formatTimeAgo(item.created_at)}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    list: { paddingBottom: 40 },
    card: { marginBottom: 16 },
    thumbBox: { width: SCREEN_WIDTH, aspectRatio: 16/9, backgroundColor: '#222' },
    thumb: { width: '100%', height: '100%' },
    badge: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
    info: { flexDirection: 'row', padding: 12, gap: 12 },
    avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#333' },
    textCol: { flex: 1, gap: 4 },
    title: { color: '#fff', fontSize: 15, fontWeight: '500', lineHeight: 20 },
    meta: { color: '#999', fontSize: 12 }, 
});
                      
