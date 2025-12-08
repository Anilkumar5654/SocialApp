import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CustomAlertProps {
  visible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function CustomAlert({ visible, title, message, confirmText = 'Confirm', isDestructive, onConfirm, onCancel }: CustomAlertProps) {
  if (!visible) return null;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.box}>
          {title && <Text style={styles.title}>{title}</Text>}
          {message && <Text style={styles.message}>{message}</Text>}
          <View style={styles.buttons}>
            <TouchableOpacity onPress={onCancel} style={styles.btn}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={styles.btn}><Text style={[styles.confirmText, isDestructive && { color: '#FF4444' }]}>{confirmText}</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  box: { width: '80%', backgroundColor: '#1E1E1E', borderRadius: 14, padding: 20, alignItems: 'center' },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  message: { color: '#ccc', textAlign: 'center', marginBottom: 20 },
  buttons: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  btn: { flex: 1, alignItems: 'center', padding: 10 },
  cancelText: { color: '#fff', fontWeight: '600' },
  confirmText: { color: '#007BFF', fontWeight: '600' }
});
            
