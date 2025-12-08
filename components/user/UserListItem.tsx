import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { getMediaUri } from '@/utils/media';

interface UserListItemProps {
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isVerified?: boolean;
    is_verified?: boolean; // Handle potential API inconsistency
    followersCount?: number;
    followers_count?: number; // Handle potential API inconsistency
  };
  onFollow?: (userId: string) => void;
  isFollowLoading?: boolean;
}

export default function UserListItem({ user, onFollow, isFollowLoading }: UserListItemProps) {
  const handlePress = () => {
    router.push({ pathname: '/user/[userId]', params: { userId: user.id } });
  };

  const followers = user.followersCount || user.followers_count || 0;
  const isVerified = user.isVerified || user.is_verified;

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Image source={{ uri: getMediaUri(user.avatar) }} style={styles.avatar} />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{user.name}</Text>
          {isVerified && <Text style={styles.verifiedBadge}>✓</Text>}
        </View>
        <Text style={styles.username}>@{user.username}</Text>
        <Text style={styles.followers}>
          {followers > 1000 ? `${(followers / 1000).toFixed(1)}K` : followers} followers
        </Text>
      </View>
      {onFollow && (
        <TouchableOpacity
          style={styles.followButton}
          onPress={() => onFollow(user.id)}
          disabled={isFollowLoading}
        >
          <Text style={styles.followButtonText}>
            {isFollowLoading ? '...' : 'Follow'}
          </Text>
        </TouchableOpacity>
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
  verifiedBadge: {
    color: Colors.primary,
    fontSize: 14,
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
  followButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  followButtonText: {
    color: Colors.background,
    fontWeight: '600',
    fontSize: 13,
  },
});
