import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { X, Send, Trash2 } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import Colors from '@/constants/colors';
import { formatTimeAgo } from '@/constants/timeFormat';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { getMediaUri } from '@/utils/media';

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  entityId: string;
  entityType: 'post' | 'reel' | 'video'; // Ab ye Video ko bhi support karega
}

export default function CommentsModal({ visible, onClose, entityId, entityType }: CommentsModalProps) {
  const { user: currentUser } = useAuth();
  const [text, setText] = useState('');
  const queryClient = useQueryClient();

  // Unique Query Key based on type
  const queryKey = [`${entityType}-comments`, entityId];

  // 👇 Dynamic API Selection Logic
  // Ye check karega ki Post hai, Reel hai ya Video, aur sahi API call karega
  const getApiMethod = () => {
      switch (entityType) {
          case 'video': return api.videos;
          case 'reel': return api.reels;
          default: return api.posts;
      }
  };
  
  const currentApi = getApiMethod();

  // 1. Fetch Comments
  const { data, isLoading } = useQuery({
    queryKey: queryKey,
    queryFn: () => currentApi.getComments(entityId, 1),
    enabled: visible,
  });

  const comments = data?.comments || [];

  // 2. Post Comment Mutation
  const postMutation = useMutation({
    mutationFn: (content: string) => currentApi.comment(entityId, content),
    onSuccess: () => {
      setText('');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err: any) => Alert.alert('Error', err.message),
  });

  // 3. Delete Comment Mutation
  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => {
        // Agar specific API me delete ka method alag hai to yaha handle karein
        // Abhi ke liye Maan rahe hain ki sabme 'deleteComment' hai ya fallback post wala hai
        if (currentApi.deleteComment) return currentApi.deleteComment(commentId);
        return api.posts.deleteComment(commentId); 
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
    }
  });

  const handleDelete = (commentId: string) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(commentId) }
    ]);
  };

  const handleUserPress = (userId: string) => {
      onClose();
      router.push({ pathname: '/user/[userId]', params: { userId } });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Comments ({comments.length})</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X color={Colors.text} size={24} />
          </TouchableOpacity>
        </View>

        {/* List */}
        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
               const isOwner = String(currentUser?.id) === String(item.user_id);
               return (
                <View style={styles.item}>
                  <TouchableOpacity onPress={() => handleUserPress(item.user_id)}>
                    <Image source={{ uri: getMediaUri(item.user?.avatar) }} style={styles.avatar} />
                  </TouchableOpacity>
                  
                  <View style={styles.content}>
                    <View style={styles.row}>
                        <Text style={styles.username}>{item.user?.username || 'User'}</Text>
                        <Text style={styles.time}>{formatTimeAgo(item.created_at)}</Text>
                    </View>
                    <Text style={styles.text}>{item.content}</Text>
                  </View>

                  {isOwner && (
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                        <Trash2 size={16} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
               );
            }}
            ListEmptyComponent={
                <View style={styles.empty}>
                    <Text style={styles.emptyText}>No comments yet. Be the first!</Text>
                </View>
            }
          />
        )}

        {/* Input Area (With Keyboard Handling) */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.inputBox}>
            <Image source={{ uri: getMediaUri(currentUser?.avatar) }} style={styles.inputAvatar} />
            <TextInput 
                style={styles.input} 
                placeholder={`Comment as ${currentUser?.username}...`} 
                placeholderTextColor={Colors.textSecondary}
                value={text}
                onChangeText={setText}
                multiline
            />
            <TouchableOpacity 
                onPress={() => text.trim() && postMutation.mutate(text)} 
                disabled={!text.trim() || postMutation.isPending}
                style={styles.sendBtn}
            >
                {postMutation.isPending ? <ActivityIndicator size="small" color={Colors.primary} /> : <Send color={text.trim() ? Colors.primary : Colors.textSecondary} size={24} />}
            </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: '#222' },
  title: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  closeBtn: { padding: 4 },
  loader: { marginTop: 20 },
  listContent: { padding: 16, paddingBottom: 20 },
  empty: { marginTop: 40, alignItems: 'center' },
  emptyText: { color: Colors.textSecondary },
  
  // Comment Item
  item: { flexDirection: 'row', marginBottom: 20, gap: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#333' },
  content: { flex: 1, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  username: { color: Colors.text, fontWeight: '600', fontSize: 13 },
  time: { color: Colors.textSecondary, fontSize: 11 },
  text: { color: Colors.text, fontSize: 14, lineHeight: 20 },
  deleteBtn: { padding: 4, alignSelf: 'flex-start' },

  // Input
  inputBox: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderColor: '#222', alignItems: 'center', gap: 12, marginBottom: Platform.OS === 'ios' ? 20 : 0 },
  inputAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#333' },
  input: { flex: 1, color: Colors.text, fontSize: 15, maxHeight: 100 },
  sendBtn: { padding: 4 }
});
