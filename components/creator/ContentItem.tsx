import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { ChevronRight, MonitorPlay, Eye, Heart } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { getImageUrl } from '@/utils/media'; // Assumed
import { formatTimeAgo } from '@/constants/timeFormat'; // Assumed

interface ContentItemProps {
    type: 'post' | 'reel' | 'video';
    item: any;
    onPress: () => void;
    hideStats?: boolean;
}

export default function ContentItem({ type, item, onPress, hideStats }: ContentItemProps) {
    // FIX: Ensure all variable declarations end cleanly with a semicolon
    const thumbnailUri = getImageUrl(item.thumbnail_url || item.thumbnailUrl || item.images?.[0]);
    const title = type === 'video' ? (item.title || item.caption || item.content) : (item.content || item.caption || 'Untitled');
    const views = item.views || 0;
    const likes = item.likes || 0;
    const timestamp = item.timestamp || item.created_at || item.uploadDate || item.upload_date;
    const viralScore = item.viral_score;

    const hasThumbnail = !!thumbnailUri && thumbnailUri !== 'https://via.placeholder.com/60';
    const formatCount = (count: number) => count > 999 ? `${(count / 1000).toFixed(1)}K` : count;

    return (
        <TouchableOpacity style={styles.contentItem} onPress={onPress}>
            <View style={styles.contentThumbnailContainer}>
                {hasThumbnail ? (
                    <Image source={{ uri: thumbnailUri }} style={styles.contentThumbnail} contentFit="cover" />
                ) : (
                    <View style={[styles.contentThumbnail, styles.placeholderBackground]}>
                        <MonitorPlay color={Colors.textMuted} size={type === 'reel' ? 30 : 40} />
                    </View>
                )}

                {(type === 'video' || type === 'reel') && viralScore !== undefined && (
                    <View style={styles.viralScoreBadge}>
                        <Text style={styles.viralScoreText}>{viralScore.toFixed(0)}</Text>
                    </View>
                )}
            </View>
            <View style={styles.contentInfo}>
                <Text style={styles.contentTitle} numberOfLines={2}>{title}</Text>
                
                {!hideStats && (
                    <View style={styles.contentStats}>
                        <View style={styles.contentStatItem}>
                            <Eye color={Colors.textSecondary} size={14} />
                            <Text style={styles.contentStatItemText}>{formatCount(views)}</Text>
                        </View>
                        <View style={styles.contentStatItem}>
                            <Heart color={Colors.textSecondary} size={14} />
                            <Text style={styles.contentStatItemText}>{formatCount(likes)}</Text>
                        </View>
                    </View>
                )}

                <Text style={styles.contentDate}>{formatTimeAgo(timestamp)}</Text>
            </View>
            <ChevronRight color={Colors.textSecondary} size={20} />
        </TouchableOpacity>
    );
}

// NOTE: Styles are extracted from the monolith.
const styles = StyleSheet.create({
    contentItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
    contentThumbnailContainer: { position: 'relative', width: 100, aspectRatio: 16 / 9 },
    contentThumbnail: { width: '100%', height: '100%', borderRadius: 6, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
    placeholderBackground: { backgroundColor: Colors.surface },
    contentInfo: { flex: 1, marginLeft: 0 },
    contentTitle: { fontSize: 15, fontWeight: '700' as const, color: Colors.text, lineHeight: 20, marginBottom: 6 },
    contentDate: { fontSize: 13, color: Colors.textSecondary }, 
    contentStats: { flexDirection: 'row', gap: 12, marginBottom: 4 },
    contentStatItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    contentStatItemText: { fontSize: 13, color: Colors.textSecondary },
    viralScoreBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: Colors.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    viralScoreText: { fontSize: 11, fontWeight: '700' as const, color: Colors.text, },
});
