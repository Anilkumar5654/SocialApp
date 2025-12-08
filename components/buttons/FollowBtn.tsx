import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import Colors from '@/constants/colors';
import { api } from '@/services/api';

interface FollowBtnProps {
  userId: string;
  isFollowing: boolean;
  style?: any;
}

export default function FollowBtn({ userId, isFollowing: initialStatus, style }: FollowBtnProps) {
  const [isFollowing, setIsFollowing] = useState(initialStatus);

  const followMutation = useMutation({
    mutationFn: () => isFollowing ? api.users.unfollow(userId) : api.users.follow(userId),
    onMutate: () => {
      // Optimistic Update (Turant UI change)
      setIsFollowing(!isFollowing);
    },
    onError: () => {
      // Agar fail ho jaye to wapas purana status
      setIsFollowing(!isFollowing);
    }
  });

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        isFollowing ? styles.followingBtn : styles.followBtn,
        style
      ]}
      onPress={() => followMutation.mutate()}
      disabled={followMutation.isPending}
    >
      {followMutation.isPending ? (
         <ActivityIndicator size="small" color={isFollowing ? Colors.text : '#fff'} />
      ) : (
        <Text style={[styles.text, isFollowing && styles.followingText]}>
          {isFollowing ? 'Following' : 'Follow'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  followBtn: {
    backgroundColor: Colors.primary,
  },
  followingBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  followingText: {
    color: Colors.text,
  }
});
