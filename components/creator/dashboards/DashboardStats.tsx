import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Calendar, Users, TrendingUp } from 'lucide-react-native';
import Colors from '@/constants/colors';
import StatCard from '../micro/StatCard'; 
import { formatViews } from '@/utils/format'; 

const { width } = Dimensions.get('window');

interface DashboardStatsProps {
    stats: any;
    currentWatchHours: number;
}

export default function DashboardStats({ stats, currentWatchHours }: DashboardStatsProps) {
    
    // 👇 FIX: Added semicolons to variable declarations
    const totalViews = stats?.total_views || 0;
    const totalFollowers = stats?.total_followers || 0;
    const engagementRate = stats?.engagement_rate || 0;
    
    const followersGrowth = stats?.monthly_growth?.followers;
    const engagementGrowth = stats?.monthly_growth?.engagement;

    return (
        <View style={styles.section}>
            {/* Header: Performance / Last 28 days */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Performance</Text>
                <View style={styles.timeFilterContainer}>
                    <Calendar color={Colors.textSecondary} size={16} />
                    <Text style={styles.timeFilterText}>Last 28 days</Text>
                </View>
            </View>

            {/* Top Row: Views and Watch Time */}
            <View style={styles.overviewAnalyticsGrid}>
                <View style={styles.analyticsStatCard}>
                    <Text style={styles.analyticsStatValue}>{formatViews(totalViews)}</Text>
                    <Text style={styles.analyticsStatTitle}>Views</Text>
                </View>
                <View style={styles.analyticsStatCard}>
                    <Text style={styles.analyticsStatValue}>{currentWatchHours.toFixed(1)}</Text>
                    <Text style={styles.analyticsStatTitle}>Watch time (hours)</Text>
                </View>
            </View>

            {/* Bottom Row: StatCards */}
            <View style={styles.statsGrid}>
                <StatCard 
                    icon={<Users color={Colors.primary} size={24} />} 
                    title="Followers" 
                    value={totalFollowers.toLocaleString()} 
                    change={followersGrowth > 0 ? `+${followersGrowth}%` : undefined} 
                    isPositive={followersGrowth > 0} 
                />
                <StatCard 
                    icon={<TrendingUp color={Colors.info} size={24} />} 
                    title="Engagement" 
                    value={`${engagementRate.toFixed(1)}%`} 
                    change={engagementGrowth > 0 ? `+${engagementGrowth}%` : undefined}
                    isPositive={engagementGrowth > 0} 
                />
            </View>
        </View>
    );
}

// STYLES
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
