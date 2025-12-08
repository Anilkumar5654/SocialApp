import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Calendar, Users, TrendingUp } from 'lucide-react-native';
import Colors from '@/constants/colors';
import StatCard from '../micro/StatCard'; // Reusable component

const { width } = Dimensions.get('window');

interface DashboardStatsProps {
    stats: any;
    currentWatchHours: number;
}

export default function DashboardStats({ stats, currentWatchHours }: DashboardStatsProps) {
    // Helper function for view count display (Assumed formatViews is available)
    const formatViews = (count: number) => count > 999 ? [span_26](start_span)`${(count / 1000).toFixed(1)}K` : count;[span_26](end_span)

    // Trends are hardcoded as per the original component, but logic is simplified
    const totalViews = stats?.total_views || 0;
    const totalFollowers = stats?.total_followers || [span_27](start_span)0;[span_27](end_span)
    const engagementRate = stats?.engagement_rate || [span_28](start_span)0;[span_28](end_span)

    return (
        <View style={styles.section}>
            {/* Header: Performance / Last 28 days */}
            <View style={styles.sectionHeader}>
                [span_29](start_span)<Text style={styles.sectionTitle}>Performance</Text>[span_29](end_span)
                <View style={styles.timeFilterContainer}>
                    [span_30](start_span)<Calendar color={Colors.textSecondary} size={16} />[span_30](end_span)
                    [span_31](start_span)<Text style={styles.timeFilterText}>Last 28 days</Text>[span_31](end_span)
                </View>
            </View>

            {/* Top Row: Views and Watch Time (Specific Layout) */}
            [span_32](start_span)<View style={styles.overviewAnalyticsGrid}>[span_32](end_span)
                <View style={styles.analyticsStatCard}>
                    [span_33](start_span)<Text style={styles.analyticsStatValue}>{formatViews(totalViews)}</Text>[span_33](end_span)
                    <Text style={styles.analyticsStatTitle}>Views</Text>
                </View>
                <View style={styles.analyticsStatCard}>
                    [span_34](start_span)<Text style={styles.analyticsStatValue}>{currentWatchHours.toFixed(1)}</Text>[span_34](end_span)
                    <Text style={styles.analyticsStatTitle}>Watch time (hours)</Text>
                </View>
            </View>

            {/* Bottom Row: StatCards (Reusable) */}
            [span_35](start_span)<View style={styles.statsGrid}>[span_35](end_span)
                <StatCard 
                    icon={<Users color={Colors.primary} size={24} />} 
                    title="Followers" 
                    value={totalFollowers.toLocaleString()} 
                    change={stats?.monthly_growth?.followers > 0 ? `+${stats.monthly_growth.followers}%` : undefined} 
                    isPositive={stats?.monthly_growth?.followers > 0} 
                [span_36](start_span)/>[span_36](end_span)
                <StatCard 
                    icon={<TrendingUp color={Colors.info} size={24} />} 
                    title="Engagement" 
                    value={`${engagementRate.toFixed(1)}%`} 
                    change={stats?.monthly_growth?.engagement > 0 ? `+${stats.monthly_growth.engagement}%` : undefined}
                    isPositive={stats?.monthly_growth?.engagement > 0} 
                [span_37](start_span)/>[span_37](end_span)
            </View>
        </View>
    );
}

// NOTE: Styles are combined from the original file.
const styles = StyleSheet.create({
    section: { padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, borderTopWidth: 1, borderTopColor: Colors.border },
    sectionTitle: { fontSize: 20, fontWeight: '700' as const, color: Colors.text },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    timeFilterContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
    timeFilterText: { fontSize: 13, fontWeight: '600' as const, color: Colors.textSecondary },
    overviewAnalyticsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, marginBottom: 16 },
    analyticsStatCard: { width: (width - 48) / 2, backgroundColor: Colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.border, minHeight: 80 },
    analyticsStatValue: { fontSize: 22, fontWeight: '700' as const, color: Colors.text, marginBottom: 4 },
    analyticsStatTitle: { fontSize: 14, color: Colors.textSecondary },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 16 },
});
