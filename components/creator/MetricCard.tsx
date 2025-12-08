import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ArrowUp, ArrowDown } from 'lucide-react-native';
import Colors from '@/constants/colors';

// NOTE: This style is needed locally as the component is extracted.
const metricStyles = StyleSheet.create({
    metricCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.border, minHeight: 120 },
    metricHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    metricIcon: { marginRight: 8 },
    metricTitle: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' as const },
    metricValue: { fontSize: 24, fontWeight: '700' as const, color: Colors.text, marginBottom: 4 },
    metricSubtitle: { fontSize: 12, color: Colors.textMuted },
    trendContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 },
    trendText: { fontSize: 12, fontWeight: '600' as const, color: Colors.textSecondary },
    trendPositive: { color: Colors.success },
    trendNegative: { color: Colors.error },
});

export default function MetricCard({
  icon,
  title,
  value,
  subtitle,
  trend,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
  trend?: { value: number; label: string };
}) {
  const isPositive = trend && trend.value > 0;
  const isNegative = trend && trend.value < 0;

  return (
    <View style={metricStyles.metricCard}>
      <View style={metricStyles.metricHeader}>
        <View style={metricStyles.metricIcon}>{icon}</View>
        <Text style={metricStyles.metricTitle}>{title}</Text>
      </View>
      <Text style={metricStyles.metricValue}>{value}</Text>
      {subtitle && <Text style={metricStyles.metricSubtitle}>{subtitle}</Text>}
      {trend && (
        <View style={metricStyles.trendContainer}>
          {isPositive && <ArrowUp color={Colors.success} size={14} />}
          {isNegative && <ArrowDown color={Colors.error} size={14} />}
          <Text
            style={[
              metricStyles.trendText,
              isPositive && metricStyles.trendPositive,
              isNegative && metricStyles.trendNegative,
            ]}
          >
            {trend.value > 0 ? '+' : ''}
            {trend.value}% {trend.label}
          </Text>
        </View>
      )}
    </View>
  );
}
