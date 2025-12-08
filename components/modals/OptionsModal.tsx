import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { X, Trash2, Flag } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface OptionsModalProps {
  visible: boolean;
  onClose: () => void;
  isOwner: boolean;
  onDelete: () => void;
  onReport: () => void;
}

export default function OptionsModal({ visible, onClose, isOwner, onDelete, onReport }: OptionsModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Options</Text>
            <TouchableOpacity onPress={onClose}><X color={Colors.text} size={24} /></TouchableOpacity>
          </View>
          <View style={styles.body}>
            {isOwner ? (
              <TouchableOpacity style={styles.item} onPress={() => { onClose(); onDelete(); }}>
                <Trash2 size={20} color={Colors.error} />
                <Text style={[styles.text, { color: Colors.error }]}>Delete</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.item} onPress={() => { onClose(); onReport(); }}>
                <Flag size={20} color={Colors.text} />
                <Text style={styles.text}>Report</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  content: { backgroundColor: Colors.background, borderRadius: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: Colors.border },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text },
  body: { paddingVertical: 8 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  text: { fontSize: 16, color: Colors.text }
});
            
