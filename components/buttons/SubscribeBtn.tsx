// File: src/components/buttons/SubscribeBtn.tsx

import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import Colors from '@/constants/colors';
import { api } from '@/services/api';

interface SubscribeBtnProps {
  channelId: string;
  isSubscribed: boolean;
  style?: any;
  onToggle?: (newStatus: boolean) => void;
}

export default function SubscribeBtn({ channelId, isSubscribed: initialStatus, style, onToggle }: SubscribeBtnProps) {
  const [isSubscribed, setIsSubscribed] = useState(initialStatus);

  // Sync state if prop changes (e.g., when scrolling list)
  useEffect(() => { setIsSubscribed(initialStatus); }, [initialStatus]);

  const subMutation = useMutation({
    mutationFn: () => isSubscribed ? api.channels.unsubscribe(channelId) : api.channels.subscribe(channelId),
    onMutate: () => {
      const newVal = !isSubscribed;
      setIsSubscribed(newVal);
      if (onToggle) onToggle(newVal); // Parent ko batao
    },
    onError: () => {
      setIsSubscribed(!isSubscribed); // Revert on error
    }
  });

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        isSubscribed ? styles.subscribedBtn : styles.subscribeBtn,
        style,
        { zIndex: 99 } // ✅ FIX: Added high zIndex to ensure clickability/no overlap
      ]}
      onPress={() => subMutation.mutate()}
      disabled={subMutation.isPending}
    >
      {subMutation.isPending ? (
         <ActivityIndicator size="small" color={isSubscribed ? '#fff' : '#000'} />
      ) : (
        <Text style={[styles.text, isSubscribed && styles.subscribedText]}>
          {isSubscribed ? 'Subscribed' : 'Subscribe'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  subscribeBtn: {
    backgroundColor: Colors.text, // White/Black based on theme
  },
  subscribedBtn: {
    backgroundColor: '#333', // Dark Grey
    borderWidth: 1,
    borderColor: '#444',
  },
  text: {
    color: Colors.background, // Black text on White btn
    fontWeight: '700',
    fontSize: 13,
  },
  subscribedText: {
    color: '#fff', // White text on Dark btn
  }
});
