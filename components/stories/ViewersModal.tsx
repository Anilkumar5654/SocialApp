// components/stories/ViewersModal.tsx

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { X, Heart } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';

import Colors from '@/constants/colors';
import { formatTimeAgo } from '@/constants/timeFormat';
import { api, MEDIA_BASE_URL } from '@/services/api';
import { useToast } from '@/contexts/ToastContext'; // Assuming this hook is available

export default function ViewersModal({ visible, onClose, storyId }: { visible: boolean; onClose: () => void; storyId: string }) {
  const toast = useToast();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['story-viewers', storyId],
    queryFn: () => api.stories.getViewers(storyId),
    enabled: visible && !!storyId,
  });

  // Handle Fetch Error
  useEffect(() => {
    if (isError) {
      toast.show('Failed to fetch viewers list.', 'error');
      onClose(); // Close modal on error
    }
  }, [isError, onClose, toast]); 

  const viewers = data?.viewers || [];
  const getImageUri = (uri: string) => uri?.startsWith('http') ? uri : `${MEDIA_BASE_URL}/${uri}`;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Story Views ({viewers.length})</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}><X color="#fff" size={20} /></TouchableOpacity>
          </View>
          
          {isLoading ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} /> : (
            <FlatList
              data={viewers}
              keyExtractor={(item: any) => item.user_id}
              contentContainerStyle={{ padding: 16 }}
              ListEmptyComponent={<Text style={styles.empty}>No views yet.</Text>}
              renderItem={({ item }: { item: any }) => (
                <TouchableOpacity style={styles.item} onPress={() => { onClose(); router.push({ pathname: '/user/[userId]', params: { userId: item.user_id } }); }}>
                  <Image source={{ uri: getImageUri(item.avatar) }} style={styles.avatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.username}</Text>
                    <Text style={styles.time}>{formatTimeAgo(item.viewed_at)}</Text>
                  </View>
                  {item.reaction_type === 'heart' && <Heart size={18} color="#E1306C" fill="#E1306C" />}
                </TouchableOpacity>
              )}
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  content: { backgroundColor: '#121212', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '50%' },
  header: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#333' },
  title: { color: '#fff', fontSize: 16, fontWeight: '700' },
  closeBtn: { backgroundColor: '#333', padding: 4, borderRadius: 12 },
  empty: { color: '#666', textAlign: 'center', marginTop: 20 },
  item: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  name: { color: '#fff', fontWeight: '600' },
  time: { color: '#888', fontSize: 12 }
});
