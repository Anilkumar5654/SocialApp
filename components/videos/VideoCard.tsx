import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { formatTimeAgo } from '@/constants/timeFormat';
import { getMediaUri } from '@/utils/media';

const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return "00:00";
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

const formatViews = (views: number | undefined | null) => {
  const safeViews = Number(views) || 0; 
  if (safeViews >= 1000000) return `${(safeViews / 1000000).toFixed(1)}M`;
  if (safeViews >= 1000) return `${(safeViews / 1000).toFixed(1)}K`;
  return safeViews.toString();
};

export default React.memo(function VideoCard({ video }: { video: any }) {
  const handlePress = useCallback(() => {
    router.push({ pathname: '/videos/player', params: { videoId: video.id } });
  }, [video.id]);

  const handleChannelPress = useCallback(() => {
    if (video.channel_id) router.push({ pathname: '/channel/[channelId]', params: { channelId: video.channel_id } });
  }, [video.channel_id]);

  const channelAvatar = getMediaUri(video.channel_avatar || video.user?.avatar);
  const thumbnailUrl = getMediaUri(video.thumbnail_url);

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.9}>
      <View style={styles.thumbnailContainer}>
        <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} contentFit="cover" />
        <View style={styles.badge}>
            <Text style={styles.badgeText}>{formatDuration(Number(video.duration))}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Pressable onPress={handleChannelPress}>
           <Image source={{ uri: channelAvatar }} style={styles.avatar} />
        </Pressable>
        <View style={styles.details}>
            <Text style={styles.title} numberOfLines={2}>{video.title || video.caption}</Text>
            <Text style={styles.meta}>
              {video.channel_name || video.user?.username} · {formatViews(video.views_count)} views · {formatTimeAgo(video.created_at)}
            </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: { marginBottom: 20, backgroundColor: Colors.background },
  thumbnailContainer: { width: '100%', aspectRatio: 16/9, backgroundColor: '#1A1A1A' },
  thumbnail: { width: '100%', height: '100%' },
  badge: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 6, borderRadius: 4 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  info: { flexDirection: 'row', padding: 12, gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#333' },
  details: { flex: 1, gap: 4 },
  title: { fontSize: 15, fontWeight: '600', color: Colors.text, lineHeight: 20 },
  meta: { fontSize: 12, color: Colors.textSecondary }
});
  
