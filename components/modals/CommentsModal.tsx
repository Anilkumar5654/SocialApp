import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, TextInput, ActivityIndicator, Alert } from 'react-native';
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
  entityType: 'post' | 'reel';
}

export default function CommentsModal({ visible, onClose, entityId, entityType }: CommentsModalProps) {
  const { user: currentUser } = useAuth();
  const [text, setText] = useState('');
  const queryClient = useQueryClient();
  const queryKey = [`${entityType}-comments`, entityId];

  const { data, isLoading } = useQuery({
    queryKey: queryKey,
    queryFn: () => entityType === 'post' ? api.posts.getComments(entityId, 1) : api.reels.getComments(entityId),
    enabled: visible,
  });

  const postMutation = useMutation({
    mutationFn: (content: string) => entityType === 'post' ? api.posts.comment(entityId, content) : api.reels.comment(entityId, content),
    onSuccess: () => { setText(''); queryClient.invalidateQueries({ queryKey }); },
  });

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Comments</Text>
          <TouchableOpacity onPress={onClose}><X color={Colors.text} size={24}/></TouchableOpacity>
        </View>
        {isLoading ? <ActivityIndicator size="large" color={Colors.primary} style={{marginTop: 20}} /> : (
          <FlatList
            data={data?.comments || []}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
                <View style={styles.item}>
                    <Image source={{ uri: getMediaUri(item.user?.avatar) }} style={styles.avatar} />
                    <View style={{flex:1}}>
                        <Text style={styles.user}>{item.user?.username}</Text>
                        <Text style={styles.text}>{item.content}</Text>
                    </View>
                </View>
            )}
            contentContainerStyle={{padding: 16}}
          />
        )}
        <View style={styles.inputBox}>
            <TextInput style={styles.input} placeholder="Write a comment..." placeholderTextColor="#888" value={text} onChangeText={setText} />
            <TouchableOpacity onPress={() => text.trim() && postMutation.mutate(text)}><Send color={Colors.primary} size={24} /></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: Colors.border },
  title: { color: Colors.text, fontSize: 18, fontWeight: 'bold' },
  item: { flexDirection: 'row', marginBottom: 16, gap: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#333' },
  user: { color: Colors.text, fontWeight: 'bold', fontSize: 13 },
  text: { color: Colors.textSecondary },
  inputBox: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderColor: Colors.border, alignItems: 'center', gap: 10 },
  input: { flex: 1, color: Colors.text, backgroundColor: Colors.surface, padding: 10, borderRadius: 20 }
});
  
