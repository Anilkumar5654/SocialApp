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
    [span_7](start_span)const thumbnailUri = getImageUrl(item.thumbnail_url || item.thumbnailUrl || item.images?.[0]);[span_7](end_span)
    const title = type === 'video' ? (item.title || item.caption || item.content) [span_8](start_span): (item.content || item.caption || 'Untitled');[span_8](end_span)
    const views = item.views || [span_9](start_span)0;[span_9](end_span)
    const likes = item.likes || [span_10](start_span)0;[span_10](end_span)
    [span_11](start_span)const timestamp = item.timestamp || item.created_at || item.uploadDate || item.upload_date;[span_11](end_span)
    [span_12](start_span)const viralScore = item.viral_score;[span_12](end_span)

    [span_13](start_span)const hasThumbnail = !!thumbnailUri && thumbnailUri !== 'https://via.placeholder.com/60';[span_13](end_span)

    const formatCount = (count: number) => count > 999 ? [span_14](start_span)[span_15](start_span)`${(count / 1000).toFixed(1)}K` : count;[span_14](end_span)[span_15](end_span)

    return (
        <TouchableOpacity style={styles.contentItem} onPress={onPress}>
            <View style={styles.contentThumbnailContainer}>
                {hasThumbnail ? (
                    [span_16](start_span)<Image source={{ uri: thumbnailUri }} style={styles.contentThumbnail} contentFit="cover" />[span_16](end_span)
                ) : (
                    <View style={[styles.contentThumbnail, styles.placeholderBackground]}>
                        [span_17](start_span)<MonitorPlay color={Colors.textMuted} size={type === 'reel' ? 30 : 40} />[span_17](end_span)
                    </View>
                )}

                {(type === 'video' || type === 'reel') && viralScore !== undefined && (
                    [span_18](start_span)<View style={styles.viralScoreBadge}>[span_18](end_span)
                        <Text style={styles.viralScoreText}>{viralScore.toFixed(0)}</Text>
                    </View>
                )}
            </View>
            <View style={styles.contentInfo}>
                [span_19](start_span)<Text style={styles.contentTitle} numberOfLines={2}>{title}</Text>[span_19](end_span)
                
                {!hideStats && (
                    [span_20](start_span)<View style={styles.contentStats}>[span_20](end_span)
                        <View style={styles.contentStatItem}>
                            <Eye color={Colors.textSecondary} size={14} />
                            [span_21](start_span)<Text style={styles.contentStatItemText}>{formatCount(views)}</Text>[span_21](end_span)
                        </View>
                        <View style={styles.contentStatItem}>
                            <Heart color={Colors.textSecondary} size={14} />
                            [span_22](start_span)<Text style={styles.contentStatItemText}>{formatCount(likes)}</Text>[span_22](end_span)
                        </View>
                    </View>
                )}

                [span_23](start_span)<Text style={styles.contentDate}>{formatTimeAgo(timestamp)}</Text>[span_23](end_span)
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
