import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react-native';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';

import Colors from '@/constants/colors';
import { formatTimeAgo } from '@/constants/timeFormat';
import { api } from '@/services/api';
import { Post } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { getMediaUri } from '@/utils/media';

// 👇 Ab saare Modals yahi import honge, index.tsx clean rahega
import CommentsModal from '@/components/modals/CommentsModal';
import OptionsModal from '@/components/modals/OptionsModal';
import ReportModal from '@/components/modals/ReportModal';

const { width } = Dimensions.get('window');

interface PostItemProps {
  post: Post;
}

export default function PostItem({ post }: PostItemProps) {
  const { user: currentUser } = useAuth();
  
  // Local States
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  
  // Modal States (Har post apna modal khud sambhalega)
  const [showComments, setShowComments] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const isOwnPost = String(currentUser?.id) === String(post.user.id);

  // Like Mutation
  const likeMutation = useMutation({
    mutationFn: () => isLiked ? api.posts.unlike(post.id) : api.posts.like(post.id),
  });

  const toggleLike = () => {
    const newVal = !isLiked;
    setIsLiked(newVal);
    setLikesCount(prev => newVal ? prev + 1 : prev - 1);
    likeMutation.mutate();
  };

  // Delete Mutation (Options Modal se call hoga)
  const deleteMutation = useMutation({
    mutationFn: () => api.posts.delete(post.id),
    onSuccess: () => {
        Alert.alert('Success', 'Post deleted');
        // Note: Yahan ideal ye hai ki React Query cache update ho jaye
        // ya parent list re-fetch ho.
    }
  });

  return (
    <View style={styles.container}>
      {/* 1. Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.userInfo} onPress={() => router.push({ pathname: '/user/[userId]', params: { userId: post.user.id } })}>
          <Image source={{ uri: getMediaUri(post.user.avatar) }} style={styles.avatar} />
          <View>
             <Text style={styles.username}>
                {post.user.name || post.user.username} 
                {post.user.isVerified && <Text style={{ color: Colors.info }}> ✓</Text>}
             </Text>
             {post.location && <Text style={styles.location}>{post.location}</Text>}
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowOptions(true)}>
           <MoreHorizontal color={Colors.text} size={24} />
        </TouchableOpacity>
      </View>

      {/* 2. Content */}
      {post.type === 'text' && post.content && (
          <Text style={styles.textContent}>{post.content}</Text>
      )}

      {/* 3. Images (Full Width) */}
      {post.images && post.images.length > 0 && (
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.mediaContainer}>
            {post.images.map((img, i) => (
                <Image key={i} source={{ uri: getMediaUri(img) }} style={styles.postImage} contentFit="cover" />
            ))}
        </ScrollView>
      )}

      {/* 4. Action Buttons */}
      <View style={styles.actionBar}>
        <View style={styles.leftActions}>
            <TouchableOpacity onPress={toggleLike}>
                <Heart color={isLiked ? Colors.primary : Colors.text} fill={isLiked ? Colors.primary : 'transparent'} size={26} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowComments(true)}>
                <MessageCircle color={Colors.text} size={26} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => api.posts.share(post.id)}>
                <Share2 color={Colors.text} size={24} />
            </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => setIsSaved(!isSaved)}>
            <Bookmark color={isSaved ? Colors.primary : Colors.text} fill={isSaved ? Colors.primary : 'transparent'} size={24} />
        </TouchableOpacity>
      </View>

      {/* 5. Footer Stats */}
      <View style={styles.footer}>
        <Text style={styles.likes}>{likesCount.toLocaleString()} likes</Text>
        
        {(post.type === 'photo' || post.type === 'video') && post.content && (
            <Text style={styles.caption} numberOfLines={2}>
                <Text style={styles.captionUser}>{post.user.username} </Text>
                {post.content}
            </Text>
        )}
        
        {post.comments > 0 && (
            <TouchableOpacity onPress={() => setShowComments(true)}>
                <Text style={styles.viewComments}>View all {post.comments} comments</Text>
            </TouchableOpacity>
        )}
        <Text style={styles.date}>{formatTimeAgo(post.created_at)}</Text>
      </View>

      {/* --- MODALS (Lazy Loaded Logic is inside components) --- */}
      
      {showComments && (
        <CommentsModal 
            visible={showComments} 
            onClose={() => setShowComments(false)} 
            entityId={post.id} 
            entityType="post" 
        />
      )}

      <OptionsModal 
        visible={showOptions}
        onClose={() => setShowOptions(false)}
        isOwner={isOwnPost}
        onDelete={() => {
            Alert.alert('Delete', 'Are you sure?', [
                { text: 'Cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate() }
            ]);
        }}
        onReport={() => setShowReport(true)}
      />

      <ReportModal
        visible={showReport}
        onClose={() => setShowReport(false)}
        entityId={post.id}
        type="post"
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 15, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#333' },
  username: { color: Colors.text, fontWeight: '600', fontSize: 14 },
  location: { color: Colors.textSecondary, fontSize: 11 },
  textContent: { color: Colors.text, fontSize: 15, paddingHorizontal: 12, marginBottom: 8, lineHeight: 20 },
  mediaContainer: { height: width * 1.25, width: width, backgroundColor: '#111' },
  postImage: { width: width, height: '100%' },
  actionBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, alignItems: 'center' },
  leftActions: { flexDirection: 'row', gap: 16 },
  footer: { paddingHorizontal: 12 },
  likes: { color: Colors.text, fontWeight: '700', marginBottom: 4 },
  caption: { color: Colors.text, lineHeight: 18 },
  captionUser: { fontWeight: '700' },
  viewComments: { color: Colors.textSecondary, marginTop: 4, fontSize: 13 },
  date: { color: Colors.textMuted, fontSize: 10, marginTop: 2, marginBottom: 8 }
});
