import React from 'react';
import { TouchableOpacity, Share, StyleSheet, Text, View } from 'react-native';
import { Share2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { api } from '@/services/api';
import { formatViews } from '@/utils/format'; // 👈 Formatter import kiya

interface ShareBtnProps {
  id: string;
  type: 'post' | 'video' | 'reel' | 'channel';
  count?: number; 
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
    const url = `https://socialclub.com/${type}/${id}`;
    const message = `Check this out: ${url}`;

    try {
      const result = await Share.share({
        message: message,
        url: url, 
        title: 'Share Content'
      });

      if (result.action === Share.sharedAction) {
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
          {/* 👇 Logic Change: Agar 0 hai to '0' dikhayega, 'Share' nahi */}
          {count > 0 ? formatViews(count) : '0'} 
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center', // Center align for vertical stacks (Reels)
    gap: 4, // Icon aur Text ke beech gap kam kiya
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2
  }
});
