import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import Colors from '@/constants/colors';
import { formatTimeAgo } from '@/constants/timeFormat';
import { getMediaUri } from '@/utils/media';
import { formatDuration, formatViews } from '@/utils/format'; // Using centralized utils

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ContentItem {
  id: string;
  title?: string;
  caption?: string;
  views?: number;
  duration?: string | number;
  created_at?: string;
  thumbnail_url?: string;
  thumbnailUrl?: string; // API inconsistency handle
}

interface ChannelVideoCardProps {
    item: ContentItem;
    type: 'videos' | 'reels';
}

export default function ChannelVideoCard({ item, type }: ChannelVideoCardProps) {
    const isReel = type === 'reels';
    
    const handlePress = () => {
        if (isReel) {
            // Navigate to reels tab (Or specific reel player if you have one)
            router.push('/reels');
        } else {
            router.push({
                pathname: '/videos/player', 
                params: { videoId: item.id } 
            });
        }
    };

    const thumbnailUrl = getMediaUri(item.thumbnailUrl || item.thumbnail_url);
    const title = item.title || item.caption || (isReel ? 'Untitled Reel' : 'Untitled Video');

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
            {/* Thumbnail */}
            <View style={styles.thumbnailBox}>
                <Image source={{ uri: thumbnailUrl }} style={styles.image} contentFit="cover" />
                {!!item.duration && (
                    <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>{formatDuration(Number(item.duration))}</Text>
                    </View>
                )}
            </View>

            {/* Info */}
            <View style={styles.details}>
                <Text style={styles.title} numberOfLines={2}>{title}</Text>
                <Text style={styles.meta} numberOfLines={1}>
                    {formatViews(item.views)} · {formatTimeAgo(item.created_at || '')}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flexDirection: 'row', marginBottom: 20, paddingHorizontal: 16 },
    thumbnailBox: { width: 150, height: 85, backgroundColor: Colors.surface, borderRadius: 6, overflow: 'hidden' },
    image: { width: '100%', height: '100%' },
    durationBadge: { position: 'absolute', bottom: 4, right: 4, backgroundColor: 'rgba(0, 0, 0, 0.8)', paddingHorizontal: 4, borderRadius: 3 },
    durationText: { color: 'white', fontSize: 10, fontWeight: '600' },
    details: { flex: 1, marginLeft: 12, justifyContent: 'flex-start' },
    title: { fontSize: 15, fontWeight: '600', color: Colors.text, lineHeight: 20, marginBottom: 4 },
    meta: { fontSize: 13, color: Colors.textSecondary },
});
