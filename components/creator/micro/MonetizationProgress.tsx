import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface MonetizationProgressProps { icon: any; title: string; current: number; target: number; suffix?: string; }

export default function MonetizationProgress({ icon, title, current, target, suffix = '' }: MonetizationProgressProps) {
    [span_35](start_span)const progress = Math.min((current / target) * 100, 100);[span_35](end_span)
    [span_36](start_span)const isCompleted = current >= target;[span_36](end_span)

    return (
        [span_37](start_span)<View style={styles.progressContainer}>[span_37](end_span)
            [span_38](start_span)<View style={styles.progressHeader}>[span_38](end_span)
                [span_39](start_span)<View style={styles.progressTitleRow}>[span_39](end_span)
                    {icon}
                    [span_40](start_span)<Text style={styles.progressTitle}>{title}</Text>[span_40](end_span)
                </View>
                [span_41](start_span){isCompleted && <CheckCircle2 size={18} color={Colors.success} />}[span_41](end_span)
            </View>
            
            [span_42](start_span)<View style={styles.progressTrack}>[span_42](end_span)
                <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: isCompleted ? [span_43](start_span)Colors.success : Colors.primary }]} />[span_43](end_span)
            </View>
            
            [span_44](start_span)<View style={styles.progressStats}>[span_44](end_span)
                <Text style={styles.progressCurrent}>
                    [span_45](start_span){current.toLocaleString()} <Text style={styles.progressTarget}>/ {target.toLocaleString()} {suffix}</Text>[span_45](end_span)
                </Text>
            </View>
        </View>
    );
}

// NOTE: Styles for MonetizationProgress are extracted from the monolith.
const styles = StyleSheet.create({
    [span_46](start_span)progressContainer: { gap: 10 },[span_46](end_span)
    [span_47](start_span)progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },[span_47](end_span)
    [span_48](start_span)progressTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },[span_48](end_span)
    [span_49](start_span)progressTitle: { fontSize: 15, fontWeight: '600' as const, color: Colors.text },[span_49](end_span)
    [span_50](start_span)progressTrack: { height: 8, backgroundColor: Colors.surface, borderRadius: 4, overflow: 'hidden' },[span_50](end_span)
    [span_51](start_span)progressBar: { height: '100%', borderRadius: 4 },[span_51](end_span)
    [span_52](start_span)progressStats: { alignItems: 'flex-start' },[span_52](end_span)
    [span_53](start_span)progressCurrent: { fontSize: 14, fontWeight: '700' as const, color: Colors.text },[span_53](end_span)
    [span_54](start_span)progressTarget: { color: Colors.textSecondary, fontWeight: '400' as const },[span_54](end_span)
});
