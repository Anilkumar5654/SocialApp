import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Eye, Clock, Heart, MessageCircle, Share2, DollarSign, Target, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query'; 

import Colors from '@/constants/colors';
import { api, MEDIA_BASE_URL } from '@/services/api';
import MetricCard from '@/components/creator/MetricCard'; // 👈 Updated Path
import RetentionGraph, { DataRow } from '@/components/creator/RetentionGraph'; // 👈 Updated Path

// --- HELPER FUNCTIONS (Extracted from the monolith for local functional integrity) ---
const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
};

const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
};

const getMediaUrl = (path: string | undefined) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `${MEDIA_BASE_URL}/${path}`;
};
// --- END HELPER FUNCTIONS ---


export default function VideoAnalyticsScreen() {
  const { videoId } = useLocalSearchParams<{ videoId: string }>();
  const router = useRouter();

  const { data: analyticsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['video-analytics', videoId],
    queryFn: async () => {
        const response = await api.creator.getVideoDetailedAnalytics(videoId || '');
        return response.analytics;
    },
    enabled: !!videoId,
  });

  const analytics = analyticsData;
  const totalInteractions = (analytics?.likes || 0) + (analytics?.comments || 0) + (analytics?.shares || 0);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Stack.Screen options={{ title: 'Video Analytics', headerStyle: { backgroundColor: Colors.background }, headerTintColor: Colors.text }} />
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  if (isError || !analytics) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Stack.Screen options={{ title: 'Video Analytics', headerStyle: { backgroundColor: Colors.background }, headerTintColor: Colors.text }} />
        <Text style={styles.errorText}>Analytics not available</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Video Analytics', headerStyle: { backgroundColor: Colors.background }, headerTintColor: Colors.text }} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* --- Video Header --- */}
        <View style={styles.videoHeader}>
          <Image source={{ uri: getMediaUrl(analytics.thumbnail_url) }} style={styles.thumbnail} contentFit="cover" />
          <Text style={styles.videoTitle} numberOfLines={2}>{analytics.title}</Text>
        </View>

        {/* --- 1. Overview Section --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.metricsGrid}>
            {/* Metric Card 1: Views */}
            <MetricCard
              icon={<Eye color={Colors.primary} size={24} />}
              title="Views"
              value={formatNumber(analytics.total_views)}
              subtitle={`${formatNumber(analytics.impressions)} impressions`}
              trend={analytics.performance_comparison?.vs_last_video?.views !== undefined ? { value: analytics.performance_comparison.vs_last_video.views, label: 'vs last video' } : undefined}
            />
            {/* Metric Card 2: Watch Time */}
            <MetricCard
              icon={<Clock color={Colors.success} size={24} />}
              title="Watch Time"
              value={formatDuration(analytics.total_watch_time)}
              subtitle={`${formatDuration(analytics.avg_view_duration)} avg`}
              trend={analytics.performance_comparison?.vs_last_video?.watch_time !== undefined ? { value: analytics.performance_comparison.vs_last_video.watch_time, label: 'vs last video' } : undefined}
            />
            {/* Metric Card 3: CTR */}
            <MetricCard
              icon={<Target color={Colors.info} size={24} />}
              title="CTR"
              value={`${analytics.ctr.toFixed(1)}%`}
              subtitle="Click-through rate"
            />
            {/* Metric Card 4: Engagement */}
            <MetricCard
              icon={<TrendingUp color={Colors.warning} size={24} />}
              title="Engagement"
              value={`${analytics.engagement_rate.toFixed(1)}%`}
              subtitle={`${formatNumber(totalInteractions)} interactions`}
            />
          </View>
        </View>

        {/* --- 2. Retention Graph --- */}
        <View style={styles.section}>
          <RetentionGraph data={analytics.retention_data} />
        </View>

        {/* --- 3. Engagement Metrics --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Engagement</Text>
          <View style={styles.engagementRow}>
            <View style={styles.engagementItem}><Heart color={Colors.error} size={20} /><Text style={styles.engagementValue}>{formatNumber(analytics.likes)}</Text><Text style={styles.engagementLabel}>Likes</Text></View>
            <View style={styles.engagementItem}><MessageCircle color={Colors.primary} size={20} /><Text style={styles.engagementValue}>{formatNumber(analytics.comments)}</Text><Text style={styles.engagementLabel}>Comments</Text></View>
            <View style={styles.engagementItem}><Share2 color={Colors.success} size={20} /><Text style={styles.engagementValue}>{formatNumber(analytics.shares)}</Text><Text style={styles.engagementLabel}>Shares</Text></View>
          </View>
        </View>

        {/* --- 4. Revenue Section --- */}
        {analytics.revenue && analytics.revenue.estimated_revenue > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Revenue</Text>
            <View style={styles.revenueCard}>
              <DollarSign color={Colors.success} size={32} />
              <Text style={styles.revenueAmount}>${analytics.revenue.estimated_revenue.toFixed(2)}</Text>
              <Text style={styles.revenueLabel}>Estimated Revenue</Text>
            </View>
            <View style={styles.revenueDetails}>
              <DataRow label="RPM" value={`$${analytics.revenue.rpm.toFixed(2)}`} />
              <DataRow label="CPM" value={`$${analytics.revenue.cpm.toFixed(2)}`} />
            </View>
          </View>
        )}

        {/* --- 5. Traffic Sources --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Traffic Sources</Text>
          <View style={styles.dataList}>
            {analytics.traffic_sources.map((source, index) => (
              <DataRow key={index} label={source.source} value={`${formatNumber(source.views)} (${source.percentage.toFixed(1)}%)`} percentage={source.percentage} />
            ))}
          </View>
        </View>

        {/* --- 6. Demographics --- */}
        {analytics.demographics && (
          <View style={styles.section}>
              <Text style={styles.sectionTitle}>Demographics</Text>
              <Text style={styles.subsectionTitle}>Age Groups</Text>
              <View style={styles.dataList}>
                {analytics.demographics.age_groups.map((group, index) => (
                  <DataRow key={index} label={group.age} value={`${group.percentage.toFixed(1)}%`} percentage={group.percentage} />
                ))}
              </View>

              <Text style={styles.subsectionTitle}>Top Countries</Text>
              <View style={styles.dataList}>
                {analytics.demographics.top_countries.map((country, index) => (
                  <DataRow key={index} label={country.country} value={`${country.percentage.toFixed(1)}%`} percentage={country.percentage} />
                ))}
              </View>
          </View>
        )}

        {/* --- 7. Performance Comparison --- */}
        {analytics.performance_comparison && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance Comparison</Text>
            
            <View style={styles.comparisonCard}>
              <Text style={styles.comparisonTitle}>vs. Last Video</Text>
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonLabel}>Views:</Text>
                <Text style={[styles.comparisonValue, analytics.performance_comparison.vs_last_video.views > 0 ? styles.comparisonPositive : styles.comparisonNegative]}>
                  {analytics.performance_comparison.vs_last_video.views > 0 ? '+' : ''}
                  {analytics.performance_comparison.vs_last_video.views}%
                </Text>
              </View>
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonLabel}>Watch Time:</Text>
                <Text style={[styles.comparisonValue, analytics.performance_comparison.vs_last_video.watch_time > 0 ? styles.comparisonPositive : styles.comparisonNegative]}>
                  {analytics.performance_comparison.vs_last_video.watch_time > 0 ? '+' : ''}
                  {analytics.performance_comparison.vs_last_video.watch_time}%
                </Text>
              </View>
            </View>

            <View style={styles.comparisonCard}>
              <Text style={styles.comparisonTitle}>vs. Channel Average</Text>
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonLabel}>Views:</Text>
                <Text style={[styles.comparisonValue, analytics.performance_comparison.vs_channel_avg.views > 0 ? styles.comparisonPositive : styles.comparisonNegative]}>
                  {analytics.performance_comparison.vs_channel_avg.views > 0 ? '+' : ''}
                  {analytics.performance_comparison.vs_channel_avg.views}%
                </Text>
              </View>
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonLabel}>Watch Time:</Text>
                <Text style={[styles.comparisonValue, analytics.performance_comparison.vs_channel_avg.watch_time > 0 ? styles.comparisonPositive : styles.comparisonNegative]}>
                  {analytics.performance_comparison.vs_channel_avg.watch_time > 0 ? '+' : ''}
                  {analytics.performance_comparison.vs_channel_avg.watch_time}%
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// NOTE: Styles are extracted from the monolith.
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centerContent: { justifyContent: 'center', alignItems: 'center', padding: 32 },
  loadingText: { fontSize: 16, color: Colors.textSecondary, marginTop: 16 },
  errorText: { fontSize: 16, color: Colors.error, textAlign: 'center', marginBottom: 24 },
  retryButton: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryButtonText: { fontSize: 16, fontWeight: '700' as const, color: Colors.text },
  videoHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  thumbnail: { width: '100%', aspectRatio: 16 / 9, borderRadius: 12, backgroundColor: Colors.surface, marginBottom: 12 },
  videoTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text, lineHeight: 24 },
  section: { padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sectionTitle: { fontSize: 20, fontWeight: '700' as const, color: Colors.text, marginBottom: 16 },
  subsectionTitle: { fontSize: 16, fontWeight: '600' as const, color: Colors.text, marginBottom: 12, marginTop: 8 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  
  engagementRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: Colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.border },
  engagementItem: { alignItems: 'center', gap: 8 },
  engagementValue: { fontSize: 20, fontWeight: '700' as const, color: Colors.text },
  engagementLabel: { fontSize: 13, color: Colors.textSecondary },
  
  revenueCard: { backgroundColor: Colors.surface, borderRadius: 12, padding: 24, alignItems: 'center', gap: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 16 },
  revenueAmount: { fontSize: 32, fontWeight: '700' as const, color: Colors.success },
  revenueLabel: { fontSize: 14, color: Colors.textSecondary },
  revenueDetails: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.border },
  
  dataList: { gap: 12 },
  comparisonCard: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 12 },
  comparisonTitle: { fontSize: 15, fontWeight: '600' as const, color: Colors.text, marginBottom: 12 },
  comparisonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  comparisonLabel: { fontSize: 14, color: Colors.textSecondary },
  comparisonValue: { fontSize: 16, fontWeight: '700' as const },
  comparisonPositive: { color: Colors.success },
  comparisonNegative: { color: Colors.error },
});
