import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Settings, Sparkles, MessageCircle, UserPlus, UserCheck } from 'lucide-react-native'; // Icons added
import { useMutation } from '@tanstack/react-query';

import Colors from '@/constants/colors';
import { getMediaUri } from '@/utils/media';
import { User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { formatViews } from '@/utils/format';

interface ProfileHeaderProps {
  user: User;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const { user: currentUser } = useAuth();
  
  // Check ownership
  const isOwnProfile = String(currentUser?.id) === String(user.id);
  
  // Local state for instant feedback
  const [isFollowing, setIsFollowing] = useState(user.is_following);

  // Sync state if user prop changes
  useEffect(() => { setIsFollowing(user.is_following); }, [user.is_following]);

  const followMutation = useMutation({
    mutationFn: () => isFollowing ? api.users.unfollow(user.id) : api.users.follow(user.id),
    onMutate: () => setIsFollowing(!isFollowing), // Optimistic update
    onError: () => setIsFollowing(!isFollowing)   // Revert on error
  });

  return (
    <View style={styles.container}>
      {/* Cover Photo */}
      <Image source={{ uri: getMediaUri(user.cover_photo || user.coverPhoto) }} style={styles.coverPhoto} contentFit="cover" />
      
      {/* Avatar & Stats */}
      <View style={styles.infoContainer}>
        <Image source={{ uri: getMediaUri(user.avatar) }} style={styles.avatar} contentFit="cover" />
        <View style={styles.statsRow}>
          <View style={styles.statItem}><Text style={styles.statValue}>{user.posts_count || 0}</Text><Text style={styles.statLabel}>Posts</Text></View>
          <View style={styles.statItem}><Text style={styles.statValue}>{formatViews(user.followers_count) || 0}</Text><Text style={styles.statLabel}>Followers</Text></View>
          <View style={styles.statItem}><Text style={styles.statValue}>{user.following_count || 0}</Text><Text style={styles.statLabel}>Following</Text></View>
        </View>
      </View>

      {/* Name & Bio */}
      <View style={styles.bioSection}>
        <View style={styles.nameRow}>
            <Text style={styles.name}>{user.name}</Text>
            {user.isVerified && <Text style={styles.verified}>✓</Text>}
        </View>
        <Text style={styles.username}>@{user.username}</Text>
        {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
      </View>

      {/* --- BUTTONS SECTION --- */}
      {isOwnProfile ? (
        // ✅ MY PROFILE
        <>
            {/* Creator Studio */}
            <TouchableOpacity style={styles.creatorBtn} onPress={() => router.push('/creator-studio')}>
                <Sparkles color={Colors.primary} size={20} />
                <Text style={styles.creatorBtnText}>Creator Studio</Text>
            </TouchableOpacity>

            <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.mainBtn} onPress={() => router.push('/edit-profile')}>
                    <Text style={styles.btnText}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/settings')}>
                    <Settings color={Colors.text} size={20} />
                </TouchableOpacity>
            </View>
        </>
      ) : (
        // ✅ OTHER USER'S PROFILE
        <View style={styles.actionsRow}>
            {/* Follow/Unfollow Button */}
            <TouchableOpacity 
                style={[styles.followBtn, isFollowing && styles.followingBtn]} 
                onPress={() => followMutation.mutate()}
                disabled={followMutation.isPending}
            >
                {followMutation.isPending ? (
                    <ActivityIndicator size="small" color={isFollowing ? Colors.text : '#fff'} />
                ) : (
                    <>
                        {isFollowing ? <UserCheck size={18} color={Colors.text} /> : <UserPlus size={18} color="#fff" />}
                        <Text style={[styles.followText, isFollowing && { color: Colors.text }]}>
                            {isFollowing ? 'Following' : 'Follow'}
                        </Text>
                    </>
                )}
            </TouchableOpacity>
            
            {/* Message Button */}
            <TouchableOpacity style={styles.messageBtn} onPress={() => router.push(`/chat/${user.id}`)}>
                <MessageCircle color={Colors.text} size={20} />
                <Text style={styles.btnText}>Message</Text>
            </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 20, borderBottomWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  coverPhoto: { width: '100%', height: 160, backgroundColor: '#333' },
  infoContainer: { flexDirection: 'row', paddingHorizontal: 16, marginTop: -40, alignItems: 'flex-end', justifyContent: 'space-between' },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: Colors.background, backgroundColor: '#333' },
  statsRow: { flexDirection: 'row', gap: 24, paddingBottom: 10 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: Colors.text },
  statLabel: { fontSize: 13, color: Colors.textSecondary },
  bioSection: { paddingHorizontal: 16, marginTop: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 22, fontWeight: '700', color: Colors.text },
  verified: { color: Colors.info, fontWeight: 'bold' },
  username: { fontSize: 15, color: Colors.textSecondary },
  bio: { marginTop: 8, color: Colors.text, lineHeight: 20 },
  
  // Own Profile Styles
  creatorBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, padding: 12, marginHorizontal: 16, marginTop: 16, backgroundColor: Colors.surface, borderRadius: 8, borderWidth: 1, borderColor: Colors.primary },
  creatorBtnText: { color: Colors.primary, fontWeight: '700' },
  actionsRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 16, gap: 10 },
  mainBtn: { flex: 1, padding: 10, backgroundColor: Colors.surface, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  iconBtn: { width: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 8, borderWidth: 1, borderColor: Colors.border },
  btnText: { fontWeight: '600', color: Colors.text },

  // Other User Styles
  followBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, backgroundColor: Colors.primary, borderRadius: 8 },
  followingBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.border },
  followText: { fontWeight: '600', color: '#fff' },
  messageBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, backgroundColor: Colors.surface, borderRadius: 8, borderWidth: 1, borderColor: Colors.border },
});
