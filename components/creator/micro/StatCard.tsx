import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DollarSign, TrendingUp, Users, Eye, Clock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { formatViews } from '@/utils/format';

interface StatCardProps { icon: React.ReactNode; title: string; value: string; change?: string; isPositive?: boolean; }

export default function StatCard({ icon, title, value, change, isPositive }: StatCardProps) {
    return (
        <View style={styles.card}>
            <View style={styles.statIcon}>{icon}</View>
            <Text style={styles.statTitle}>{title}</Text>
            <Text style={styles.statValue}>{value}</Text>
            {change && (
                <Text style={[styles.statChange, isPositive ? styles.statChangePositive : styles.statChangeNegative]}>
                    {change} this month
                </Text>
            )}
        </View>
    );
}

// NOTE: Styles for StatCard should be moved from the main file.
const styles = StyleSheet.create({
    card: { width: 155, backgroundColor: Colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.border, justifyContent: 'space-between', minHeight: 120 },
    statIcon: { marginBottom: 10, alignSelf: 'flex-start' },
    statTitle: { fontSize: 13, color: Colors.textSecondary },
    statValue: { fontSize: 28, fontWeight: '800', color: Colors.text },
    statChange: { fontSize: 12, fontWeight: '600', marginTop: 4 },
    statChangePositive: { color: Colors.success },
    statChangeNegative: { color: Colors.error },
});
