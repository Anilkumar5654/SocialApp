import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { X, ChevronRight } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import Colors from '@/constants/colors';
import { api } from '@/services/api';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  entityId: string;
  type: 'post' | 'reel';
}

export default function ReportModal({ visible, onClose, entityId, type }: ReportModalProps) {
  const reportReasons = [
    'Spam or Scam', 'Inappropriate Content', 'Harassment', 'Violence', 'False Information', 'Other'
  ];

  const reportMutation = useMutation({
    mutationFn: (reason: string) => type === 'post' 
      ? api.posts.report(entityId, reason, '') 
      : api.reels.report(entityId, reason),
    onSuccess: () => {
      Alert.alert('Report Submitted', 'Thank you for reporting.');
      onClose();
    },
    onError: (error: any) => Alert.alert('Error', error.message),
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Report</Text>
            <TouchableOpacity onPress={onClose}><X color={Colors.text} size={24} /></TouchableOpacity>
          </View>
          {reportMutation.isPending ? (
            <ActivityIndicator color={Colors.primary} size="large" style={{ padding: 20 }} />
          ) : (
            <ScrollView style={{ maxHeight: 400 }}>
              {reportReasons.map((reason, index) => (
                <TouchableOpacity key={index} style={styles.item} onPress={() => reportMutation.mutate(reason)}>
                  <Text style={styles.text}>{reason}</Text>
                  <ChevronRight size={20} color={Colors.textMuted} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  content: { backgroundColor: Colors.background, borderRadius: 12, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: Colors.border },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text },
  item: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: Colors.border },
  text: { color: Colors.text, fontSize: 16 }
});
    
