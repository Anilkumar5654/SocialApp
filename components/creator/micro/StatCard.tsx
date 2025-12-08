import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';

interface StatCardProps { icon: React.ReactNode; title: string; value: string; change?: string; }

export default function StatCard({ icon, title, value, change }: StatCardProps) {
    [span_20](start_span)const isPositive = change?.startsWith('+');[span_20](end_span)

    return (
        <View style={styles.card}>
            [span_21](start_span)<View style={styles.statIcon}>{icon}</View>[span_21](end_span)
            [span_22](start_span)<Text style={styles.statTitle}>{title}</Text>[span_22](end_span)
            [span_23](start_span)<Text style={styles.statValue}>{value}</Text>[span_23](end_span)
            {change && (
                [span_24](start_span)[span_25](start_span)<Text style={[styles.statChange, isPositive ? styles.statChangePositive : styles.statChangeNegative]}>[span_24](end_span)[span_25](end_span)
                    [span_26](start_span){change} this month[span_26](end_span)
                </Text>
            )}
        </View>
    );
}

// NOTE: Styles for StatCard are extracted from the monolith.
const styles = StyleSheet.create({
    [span_27](start_span)card: { width: 155, backgroundColor: Colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.border, justifyContent: 'space-between', minHeight: 120 },[span_27](end_span)
    [span_28](start_span)statIcon: { marginBottom: 10, alignSelf: 'flex-start' },[span_28](end_span)
    [span_29](start_span)statTitle: { fontSize: 13, color: Colors.textSecondary },[span_29](end_span)
    [span_30](start_span)statValue: { fontSize: 28, fontWeight: '800' as const, color: Colors.text },[span_30](end_span)
    [span_31](start_span)statChange: { fontSize: 12, fontWeight: '600' as const, marginTop: 4 },[span_31](end_span)
    [span_32](start_span)statChangePositive: { color: Colors.success },[span_32](end_span)
    [span_33](start_span)statChangeNegative: { color: Colors.error },[span_33](end_span)
});
