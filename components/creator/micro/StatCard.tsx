import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';

interface StatCardProps { icon: React.ReactNode; title: string; value: string; change?: string; }

export default function StatCard({ icon, title, value, change }: StatCardProps) {
    const isPositive = change?.startsWith('+');
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

const styles = StyleSheet.create({
    card: { width: 155, backgroundColor: Colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.border, justifyContent: 'space-between', minHeight: 120 },
    statIcon: { marginBottom: 10, alignSelf: 'flex-start' },
    statTitle: { fontSize: 13, color: Colors.textSecondary },
    statValue: { fontSize: 28, fontWeight: '800' as const, color: Colors.text },
    statChange: { fontSize: 12, fontWeight: '600' as const, marginTop: 4 },
    statChangePositive: { color: Colors.success },
    statChangeNegative: { color: Colors.error },
});
