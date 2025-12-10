import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { X, Send } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Image } from 'expo-image';

import Colors from '@/constants/colors';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/authContext';
import { getMediaUri } from '@/utils/media';

// 🎯 Ensure this path matches where you put CommentItem.tsx (e.g., @/components/ui/CommentItem)
import CommentItem from '@/components/ui/CommentItem'; 

// --- TYPES (Simplified for clarity) ---
interface UserInfo {
    username: string;
    avatar: string;
}
interface Comment {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
    user: UserInfo;
    parent_comment_id: string | null;
    replies: Comment[]; 
    reply_count: number;
}

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  entityId: string;
  entityType: 'post' | 'reel' | 'video';
}

const { height } = Dimensions.get('window');

export default function CommentsModal({ visible, onClose, entityId, entityType }: CommentsModalProps) {
  const { user: currentUser } = useAuth();
  const [text, setText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null); // State for Reply Feature
  const queryClient = useQueryClient();

  const queryKey = [`${entityType}-comments`, entityId];
  
  // Dynamic API Selection Logic
  const getApiMethod = () => {
      switch (entityType) {
          case 'video': return api.videos;
          case 'reel': return api.reels;
          default: return api.posts;
      }
  };
  const currentApi = getApiMethod();

  // 1. Fetch Comments
  const { data, isLoading } = useQuery<any, Error, { comments: Comment[] }>({
    queryKey: queryKey,
    queryFn: () => currentApi.getComments(entityId, 1), 
    enabled: visible,
  });

  // Since API might return flat or nested, we take the top level for the FlatList
  const topLevelComments = data?.comments.filter((c: Comment) => !c.parent_comment_id) || [];

  // --- ACTIONS ---

  // Placeholder for future Reply function (Sets the reply context)
  const handleReplyPress = useCallback((comment: Comment) => {
      setReplyingTo(comment);
      // Optional: Focus the input field here
  }, []);

  const handlePost = () => {
      if (!text.trim()) return;
      
      // Determine if it's a reply or a top-level comment
      const parentId = replyingTo?.id || null; 
      
      // 🎯 Mutation now passes parent_id, but API needs to support it (future backend change)
      postMutation.mutate({ content: text, parent_id: parentId }); 
  };

  const handleUserPress = (userId: string) => {
      onClose();
      router.push({ pathname: '/user/[userId]', params: { userId } });
  };

  const handleDelete = useCallback((commentId: string) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(commentId) }
    ]);
  }, []);


  // 2. Post Comment/Reply Mutation
  const postMutation = useMutation({
    mutationFn: ({ content, parent_id }: { content: string, parent_id: string | null }) => {
        // Assuming currentApi.comment signature is now (entityId, content, parent_id)
        return currentApi.comment(entityId, content, parent_id); 
    },
    onSuccess: () => {
      setText('');
      setReplyingTo(null); // Reset reply state after successful post
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err: any) => Alert.alert('Error', err.message),
  });

  // 3. Delete Comment Mutation
  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => {
        if (currentApi.deleteComment) return currentApi.deleteComment(commentId);
        return api.posts.deleteComment(commentId); 
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
    }
  });


  // Input Placeholder Text
  const currentPlaceholder = useMemo(() => {
      if (replyingTo) {
          return `Replying to ${replyingTo.user?.username}...`;
      }
      return `Comment as ${currentUser?.username}...`;
  }, [replyingTo, currentUser]);


  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Comments ({topLevelComments.length})</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X color={Colors.text} size={24} />
          </TouchableOpacity>
        </View>

        {/* List */}
        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
        ) : (
          <FlatList
            data={topLevelComments}
            keyExtractor={(item) => item.id.toString()}
            // Removed internal padding here, now handled by CommentItem.tsx
            contentContainerStyle={styles.listContent} 
            renderItem={({ item }) => (
                <CommentItem
                    comment={item}
                    currentUser={currentUser}
                    onUserPress={handleUserPress}
                    onDelete={handleDelete}
                    onReply={handleReplyPress} // Pass the reply context setter
                    isReply={false}
                />
            )}
            ListEmptyComponent={
                <View style={styles.empty}>
                    <Text style={styles.emptyText}>No comments yet. Be the first!</Text>
                </View>
            }
          />
        )}

        {/* Input Area (With Keyboard Handling) */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
            
            {/* Replying To Bar (Only visible when replying) */}
            {replyingTo && (
                <View style={styles.replyingToBar}>
                    <Text style={styles.replyingToText}>
                        Replying to <Text style={styles.replyingToUsername}>{replyingTo.user?.username}</Text>
                    </Text>
                    <TouchableOpacity onPress={() => setReplyingTo(null)}>
                        <X size={16} color={Colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            )}
            
            {/* Input Field */}
            <View style={styles.inputBox}>
            <Image source={{ uri: getMediaUri(currentUser?.avatar) }} style={styles.inputAvatar} />
            <TextInput 
                style={styles.input} 
                placeholder={currentPlaceholder} 
                placeholderTextColor={Colors.textSecondary}
                value={text}
                onChangeText={setText}
                multiline
                editable={!postMutation.isPending}
            />
            <TouchableOpacity 
                onPress={handlePost} 
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
  container: { flex: 1, backgroundColor: Colors.background, minHeight: height * 0.8 },
  
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: '#222' },
  title: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  closeBtn: { padding: 4 },
  
  // List
  loader: { marginTop: 20 },
  listContent: { paddingVertical: 10 }, 
  empty: { marginTop: 40, alignItems: 'center' },
  emptyText: { color: Colors.textSecondary },
  
  // Replying To Bar
  replyingToBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#333',
    borderTopWidth: 1,
    borderColor: '#444'
  },
  replyingToText: {
    color: Colors.text,
    fontSize: 13,
  },
  replyingToUsername: {
    fontWeight: '700',
    color: Colors.primary,
  },
  
  // Input
  inputBox: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderColor: '#222', alignItems: 'center', gap: 12, marginBottom: Platform.OS === 'ios' ? 20 : 0 },
  inputAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#333' },
  input: { flex: 1, color: Colors.text, fontSize: 15, maxHeight: 100 },
  sendBtn: { padding: 4 }
});
