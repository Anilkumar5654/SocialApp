import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

// --- Helper Component: DataRow ---
export function DataRow({ label, value, percentage }: { label: string; value: string; percentage?: number; }) {
  return (
    <View style={retentionStyles.dataRow}>
      <Text style={retentionStyles.dataLabel}>{label}</Text>
      <View style={retentionStyles.dataRight}>
        {percentage !== undefined && (
          <View style={[retentionStyles.progressBar, { width: 100 }]}>
            <View style={[retentionStyles.progressFill, { width: `${percentage}%` }]} />
          </View>
        )}
        <Text style={retentionStyles.dataValue}>{value}</Text>
      </View>
    </View>
  );
}
// --- End DataRow ---


export default function RetentionGraph({ data }: { data: { time: number; percentage: number }[] }) {
  const maxPercentage = Math.max(...data.map((d) => d.percentage), 100);
  const chartHeight = 150;
  // Adjusted width based on padding/margins (Same as original file logic)
  const chartWidth = width - 48; 

  return (
    <View style={retentionStyles.graphContainer}>
      <Text style={retentionStyles.graphTitle}>Audience Retention</Text>
      <Text style={retentionStyles.graphSubtitle}>Where viewers are dropping off</Text>
      <View style={retentionStyles.chartContainer}>
        <View style={retentionStyles.yAxis}>
          <Text style={retentionStyles.axisLabel}>100%</Text>
          <Text style={retentionStyles.axisLabel}>75%</Text>
          <Text style={retentionStyles.axisLabel}>50%</Text>
          <Text style={retentionStyles.axisLabel}>25%</Text>
          <Text style={retentionStyles.axisLabel}>0%</Text>
        </View>
        <View style={retentionStyles.chartArea}>
          <View style={[retentionStyles.chart, { height: chartHeight }]}>
            {data.map((point, index) => {
              const heightPercentage = (point.percentage / maxPercentage) * 100;
              const barHeight = (chartHeight * heightPercentage) / 100;
              const barWidth = chartWidth / data.length - 4;

              return (
                <View key={index} style={[retentionStyles.retentionBar, { height: barHeight, width: barWidth }]} />
              );
            })}
          </View>
          <View style={retentionStyles.xAxis}>
            <Text style={retentionStyles.axisLabel}>0s</Text>
            <Text style={retentionStyles.axisLabel}>Middle</Text>
            <Text style={retentionStyles.axisLabel}>End</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const retentionStyles = StyleSheet.create({
    graphContainer: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 16 },
    graphTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.text, marginBottom: 4 },
    graphSubtitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: 16 },
    chartContainer: { flexDirection: 'row', gap: 8 },
    yAxis: { justifyContent: 'space-between', width: 40 },
    chartArea: { flex: 1 },
    chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, backgroundColor: Colors.background, borderRadius: 8, padding: 8 },
    retentionBar: { backgroundColor: Colors.primary, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
    xAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    axisLabel: { fontSize: 11, color: Colors.textMuted },
    
    // DataRow Styles
    dataRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
    dataLabel: { fontSize: 14, color: Colors.text, fontWeight: '500' as const, flex: 1 },
    dataRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    dataValue: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600' as const, minWidth: 60, textAlign: 'right' },
    progressBar: { height: 6, backgroundColor: Colors.background, borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
});
