import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MessageSquare } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function CommunityView() {
  return (
    <View style={styles.container}>
      <MessageSquare size={60} color={Colors.textSecondary} />
      <Text style={styles.title}>Community Management</Text>
      <Text style={styles.subtitle}>Manage comments, messages, and follower relationships here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    title: { color: Colors.text, fontSize: 18, fontWeight: '700' as const, marginTop: 20 },
    subtitle: { color: Colors.textSecondary, marginTop: 10, textAlign: 'center' }
});
