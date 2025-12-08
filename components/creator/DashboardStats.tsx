import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, TrendingUp } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { formatViews } from '@/utils/format';

interface DashboardStatsProps {
  stats: any;
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  // Data extraction
  const views = stats?.total_views || 0;
  const watchTime = stats?.total_watch_time || 0.0;
  const followers = stats?.total_subscribers || 0; // Using sub count as followers
  const engagement = stats?.engagement_rate || 0;

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Performance</Text>
        <TouchableOpacity style={styles.dateBadge}>
            <Calendar size={14} color={Colors.textSecondary} style={{ marginRight: 4 }} />
            <Text style={styles.dateText}>Last 28 days</Text>
        </TouchableOpacity>
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        
        {/* Card 1: Views */}
        <View style={styles.card}>
            <Text style={styles.cardValue}>{formatViews(views)}</Text>
            <Text style={styles.cardLabel}>Views</Text>
        </View>

        {/* Card 2: Watch Time */}
        <View style={styles.card}>
            <Text style={styles.cardValue}>{watchTime.toFixed(1)}</Text>
            <Text style={styles.cardLabel}>Watch time (hours)</Text>
        </View>

        {/* Card 3: Followers (With Trend) */}
        <View style={styles.card}>
            <View style={{flexDirection:'row', alignItems:'center', gap:6, marginBottom:4}}>
                <Text style={styles.cardValue}>{formatViews(followers)}</Text>
            </View>
            <Text style={styles.cardLabel}>Followers</Text>
            <Text style={styles.trend}>+15% this month</Text>
        </View>

        {/* Card 4: Engagement (With Trend) */}
        <View style={styles.card}>
            <View style={{flexDirection:'row', alignItems:'center', gap:6, marginBottom:4}}>
                <TrendingUp size={18} color="#3b82f6" />
            </View>
            <Text style={styles.cardLabel}>Engagement</Text>
            <Text style={styles.cardValue}>{engagement}%</Text>
            <Text style={styles.trend}>+8% this month</Text>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.text },
  dateBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#1A1A1A', borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  dateText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { 
    width: '48%', 
    backgroundColor: '#1A1A1A', 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#333',
    justifyContent: 'center'
  },
  cardValue: { fontSize: 22, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  cardLabel: { fontSize: 13, color: Colors.textSecondary },
  trend: { fontSize: 12, color: Colors.success, fontWeight: '600', marginTop: 6 }
});
