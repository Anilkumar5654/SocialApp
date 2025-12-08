import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Heart } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import Colors from '@/constants/colors';
import { api } from '@/services/api';

interface LikeBtnProps {
  id: string;
  isLiked: boolean;
  count: number;
  type?: 'post' | 'video' | 'reel'; // Batao ki ye kis cheez ka like hai
  showCount?: boolean;
  size?: number;
}

export default function LikeBtn({ id, isLiked: initialLiked, count: initialCount, type = 'post', showCount = true, size = 26 }: LikeBtnProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  const likeMutation = useMutation({
    mutationFn: () => {
      // Type ke hisab se sahi API call
      if (isLiked) {
        return type === 'video' ? api.videos.dislike(id) : 
               type === 'reel' ? api.reels.unlike(id) : 
               api.posts.unlike(id);
      } else {
        return type === 'video' ? api.videos.like(id) : 
               type === 'reel' ? api.reels.like(id) : 
               api.posts.like(id);
      }
    },
    onMutate: () => {
      // Optimistic Update
      setIsLiked(!isLiked);
      setCount(prev => isLiked ? prev - 1 : prev + 1);
    },
    onError: () => {
      // Revert if error
      setIsLiked(!isLiked);
      setCount(prev => isLiked ? prev + 1 : prev - 1);
    }
  });

  return (
    <TouchableOpacity onPress={() => likeMutation.mutate()} style={styles.container}>
      <Heart 
        color={isLiked ? Colors.primary : Colors.text} 
        fill={isLiked ? Colors.primary : 'transparent'} 
        size={size} 
      />
      {showCount && (
        <Text style={[styles.text, isLiked && { color: Colors.primary }]}>
          {count.toLocaleString()}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  text: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 14
  }
});
      
