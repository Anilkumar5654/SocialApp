import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChart2 } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function AnalyticsView() {
  return (
    <View style={styles.container}>
      <BarChart2 size={60} color={Colors.textSecondary} />
      <Text style={styles.title}>Detailed Channel Analytics</Text>
      <Text style={styles.subtitle}>Graphs and deep dive reports will appear here soon!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    title: { color: Colors.text, fontSize: 18, fontWeight: '700' as const, marginTop: 20 },
    subtitle: { color: Colors.textSecondary, marginTop: 10, textAlign: 'center' }
});
