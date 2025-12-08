import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Bookmark } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';

import Colors from '@/constants/colors';
import { api } from '@/services/api';

interface SaveBtnProps {
  id: string;
  type: 'post' | 'video' | 'reel';
  isSaved: boolean;
  size?: number;
  color?: string;
  activeColor?: string;
}

export default function SaveBtn({ 
  id, 
  type, 
  isSaved: initialStatus, 
  size = 24, 
  color = Colors.text,
  activeColor = Colors.primary 
}: SaveBtnProps) {
  
  const [isSaved, setIsSaved] = useState(initialStatus);

  const saveMutation = useMutation({
    mutationFn: () => {
      // Type ke hisab se sahi API call
      if (type === 'video') return api.videos.save(id);
      if (type === 'reel') return api.reels.save(id);
      return api.posts.save(id);
    },
    onMutate: () => {
      // Optimistic Update (Turant UI change)
      setIsSaved(!isSaved);
    },
    onError: () => {
      // Agar error aaye to wapas purana state
      setIsSaved(!isSaved);
    }
  });

  return (
    <TouchableOpacity 
      onPress={() => saveMutation.mutate()} 
      style={styles.btn}
      disabled={saveMutation.isPending}
    >
      <Bookmark
        size={size}
        color={isSaved ? activeColor : color}
        fill={isSaved ? activeColor : 'transparent'}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4
  }
});
        
