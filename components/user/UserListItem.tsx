// components/user/UserListItem.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query'; 
import Colors from '@/constants/colors';
import { getMediaUri } from '@/utils/media';
import { api } from '@/services/api'; 
import FollowBtn from '@/components/buttons/FollowBtn'; 
import { useAuth } from '@/contexts/AuthContext'; 
import { CheckCircle } from 'lucide-react-native'; 

interface UserListItemProps {
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isVerified?: boolean;
    is_verified?: boolean; 
    followersCount?: number;
    followers_count?: number; 
    is_following?: boolean; 
  };
}

export default function UserListItem({ user }: UserListItemProps) {
  const { user: currentUser } = useAuth();
  
  // 1. Fetch fresh, definitive follow status
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['user-follow-status', user.id], 
    queryFn: () => api.users.getProfile(user.id), 
    enabled: String(currentUser?.id) !== String(user.id),
    staleTime: 5000, 
  });

  // 2. Definitive Status Extraction: new data > stale data (Search Prop)
  const definitiveIsFollowing = (profileData as any)?.user?.is_following ?? user.is_following ?? false; 
  
  const handlePress = () => {
    router.push({ pathname: '/user/[userId]', params: { userId: user.id } });
  };

  const followers = user.followersCount || user.followers_count || 0;
  const isVerified = user.isVerified || user.is_verified; 
  const isOwnProfile = String(currentUser?.id) === String(user.id);


  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Image source={{ uri: getMediaUri(user.avatar) }} style={styles.avatar} />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{user.name}</Text>
          
          {/* VERIFIED BADGE */}
          {isVerified && (
            <CheckCircle 
              color={Colors.primary} 
              size={18} 
              style={styles.verifiedIcon}
            />
          )}
        </View>
        <Text style={styles.username}>@{user.username}</Text>
        <Text style={styles.followers}>
          {followers > 1000 ? `${(followers / 1000).toFixed(1)}K` : followers} followers
        </Text>
      </View>

      {/* RENDER FOLLOW BUTTON */}
      {!isOwnProfile && (
        isLoading ? (
          <ActivityIndicator size="small" color={Colors.primary} style={{ marginRight: 16 }} />
        ) : (
          <FollowBtn 
            userId={user.id} 
            isFollowing={definitiveIsFollowing} 
          />
        )
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: Colors.surface,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 4,
  },
  verifiedIcon: { 
    marginLeft: 4,
    marginTop: 2, 
  },
  username: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  followers: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
