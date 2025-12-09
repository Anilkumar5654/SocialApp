import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { Image } from 'expo-image';
import { MessageCircle, MoreHorizontal } from 'lucide-react-native';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';

import Colors from '@/constants/colors';
import { formatTimeAgo } from '@/constants/timeFormat';
import { api } from '@/services/api';
import { Post } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { getMediaUri } from '@/utils/media';
import { useToast } from '@/contexts/ToastContext'; // 👈 Import useToast

// 👇 Smart Buttons (Clean & Reusable)
import LikeBtn from '@/components/buttons/LikeBtn';
import FollowBtn from '@/components/buttons/FollowBtn';
import ShareBtn from '@/components/buttons/ShareBtn';
import SaveBtn from '@/components/buttons/SaveBtn';

// 👇 Modals
import CommentsModal from '@/components/modals/CommentsModal';
import OptionsModal from '@/components/modals/OptionsModal';
import ReportModal from '@/components/modals/ReportModal';

const { width } = Dimensions.get('window');

interface PostItemProps {
  post: Post;
}

export default function PostItem({ post }: PostItemProps) {
  const { user: currentUser } = useAuth();
  const toast = useToast(); // 👈 Initialize toast
  
  // Modal States
  const [showComments, setShowComments] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const isOwnPost = String(currentUser?.id) === String(post.user.id);

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: () => api.posts.delete(post.id),
    // 🌟 FIX: Use toast instead of Alert.alert for theme consistency
    onSuccess: () => toast.show('Post deleted successfully.', 'success') 
  });

  return (
    <View style={styles.container}>
      {/* 1. Header Section */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.userInfo} 
          // 🗺️ Routing: /user/[userId] (Consistent)
          onPress={() => router.push({ pathname: '/user/[userId]', params: { userId: post.user.id } })}
        >
          <Image source={{ uri: getMediaUri(post.user.avatar) }} style={styles.avatar} />
          <View>
             <Text style={styles.username}>
                {post.user.name || post.user.username} 
                {post.user.isVerified && <Text style={{ color: Colors.info }}> ✓</Text>}
             </Text>
             {post.location && <Text style={styles.location}>{post.location}</Text>}
          </View>
        </TouchableOpacity>

        {/* Action: Follow or Options */}
        {isOwnPost ? (
            <TouchableOpacity onPress={() => setShowOptions(true)}>
                <MoreHorizontal color={Colors.text} size={24} />
            </TouchableOpacity>
        ) : (
            <FollowBtn userId={post.user.id} isFollowing={!!post.user.is_following} />
        )}
      </View>

      {/* 2. Text Content */}
      {post.type === 'text' && post.content && (
          <Text style={styles.textContent}>{post.content}</Text>
      )}

      {/* 3. Media Carousel */}
      {post.images && post.images.length > 0 && (
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.mediaContainer}>
            {post.images.map((img, i) => (
                <Image 
                  key={i} 
                  source={{ uri: getMediaUri(img) }} 
                  style={styles.postImage} 
                  contentFit="cover" 
                />
            ))}
        </ScrollView>
      )}

      {/* 4. Interaction Bar */}
      <View style={styles.actionBar}>
        <View style={styles.leftActions}>
            {/* Like */}
            <LikeBtn 
                id={post.id} 
                isLiked={post.isLiked} 
                count={post.likes} 
                type="post" 
                showCount={false} 
                size={28} 
            />
            
            {/* Comment */}
            <TouchableOpacity onPress={() => setShowComments(true)}>
                <MessageCircle color={Colors.text} size={26} />
            </TouchableOpacity>
            
            {/* Share */}
            <ShareBtn 
                id={post.id} 
                type="post" 
                size={24} 
                color={Colors.text} 
            />
        </View>
        
        {/* Save */}
        <SaveBtn 
            id={post.id} 
            type="post" 
            isSaved={post.isSaved} 
            size={24} 
            color={Colors.text} 
        />
      </View>

      {/* 5. Footer Info */}
      <View style={styles.footer}>
        <Text style={styles.likes}>{post.likes} likes</Text> 
        
        {/* Caption */}
        {(post.type !== 'text') && post.content && (
            <Text style={styles.caption} numberOfLines={2}>
                <Text style={styles.captionUser}>{post.user.username} </Text>
                {post.content}
            </Text>
        )}
        
        {/* View Comments Link */}
        {post.comments > 0 && (
            <TouchableOpacity onPress={() => setShowComments(true)}>
                <Text style={styles.viewComments}>View all {post.comments} comments</Text>
            </TouchableOpacity>
        )}
        
        <Text style={styles.date}>{formatTimeAgo(post.created_at)}</Text>
      </View>

      {/* --- Modals --- */}
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
        onDelete={() => deleteMutation.mutate()} 
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
  leftActions: { flexDirection: 'row', gap: 20, alignItems: 'center' },
  footer: { paddingHorizontal: 12 },
  likes: { color: Colors.text, fontWeight: '700', marginBottom: 4 },
  caption: { color: Colors.text, lineHeight: 18 },
  captionUser: { fontWeight: '700' },
  viewComments: { color: Colors.textSecondary, marginTop: 4, fontSize: 13 },
  date: { color: Colors.textMuted, fontSize: 10, marginTop: 2, marginBottom: 8 }
});
