import React from 'react';
import { TouchableOpacity, Share, StyleSheet, Text, View } from 'react-native';
import { Share2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { api } from '@/services/api';

interface ShareBtnProps {
  id: string;
  type: 'post' | 'video' | 'reel' | 'channel';
  count?: number; // Optional: Agar count dikhana ho
  color?: string;
  size?: number;
  showCount?: boolean;
}

export default function ShareBtn({ 
  id, 
  type, 
  count, 
  color = Colors.text, 
  size = 24, 
  showCount = false 
}: ShareBtnProps) {

  const handleShare = async () => {
    // 1. Generate Link (Apne Domain ke hisab se change kar lena)
    // Example: https://socialclub.com/video/123
    const url = `https://socialclub.com/${type}/${id}`;
    const message = `Check this out: ${url}`;

    try {
      // 2. Open Native Share Dialog
      const result = await Share.share({
        message: message,
        url: url, // iOS specific
        title: 'Share Content' // Android specific
      });

      // 3. Track Share on Backend (Only if successfully shared)
      if (result.action === Share.sharedAction) {
         // Fire and forget (No need to wait)
         if (type === 'post') api.posts.share(id);
         else if (type === 'video') api.videos.share(id);
         else if (type === 'reel') api.reels.share(id);
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <TouchableOpacity onPress={handleShare} style={styles.container}>
      <Share2 color={color} size={size} />
      {showCount && count !== undefined && (
        <Text style={[styles.text, { color }]}>
          {count > 0 ? count : 'Share'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  }
});
        
