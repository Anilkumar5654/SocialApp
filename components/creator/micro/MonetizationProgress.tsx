import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface MonetizationProgressProps { icon: any; title: string; current: number; target: number; suffix?: string; }

export default function MonetizationProgress({ icon, title, current, target, suffix = '' }: MonetizationProgressProps) {
    const progress = Math.min((current / target) * 100, 100);
    const isCompleted = current >= target;

    return (
        <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
                <View style={styles.progressTitleRow}>
                    {icon}
                    <Text style={styles.progressTitle}>{title}</Text>
                </View>
                {isCompleted && <CheckCircle2 size={18} color={Colors.success} />}
            </View>
            
            <View style={styles.progressTrack}>
                <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: isCompleted ? Colors.success : Colors.primary }]} />
            </View>
            
            <View style={styles.progressStats}>
                <Text style={styles.progressCurrent}>
                    {current.toLocaleString()} <Text style={styles.progressTarget}>/ {target.toLocaleString()} {suffix}</Text>
                </Text>
            </View>
        </View>
    );
}
// NOTE: Styles for MonetizationProgress should be moved from the main file.
const styles = StyleSheet.create({
    progressContainer: { gap: 10 },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    progressTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    progressTitle: { fontSize: 15, fontWeight: '600', color: Colors.text },
    progressTrack: { height: 8, backgroundColor: Colors.surface, borderRadius: 4, overflow: 'hidden' },
    progressBar: { height: '100%', borderRadius: 4 },
    progressStats: { alignItems: 'flex-start' },
    progressCurrent: { fontSize: 14, fontWeight: '700', color: Colors.text },
    progressTarget: { color: Colors.textSecondary, fontWeight: '400' },
});
