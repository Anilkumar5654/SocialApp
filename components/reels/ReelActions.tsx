import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Heart, MessageCircle, MoreVertical } from 'lucide-react-native';
import { formatViews } from '@/utils/format';
import ShareBtn from '@/components/buttons/ShareBtn';

interface ReelActionsProps {
  item: any;
  isLiked: boolean;
  likesCount: number;
  onLike: () => void;
  onComment: () => void;
  onOptions: () => void;
}

export default function ReelActions({ item, isLiked, likesCount, onLike, onComment, onOptions }: ReelActionsProps) {
  return (
    <View style={styles.container}>
      
      {/* Like Button */}
      <TouchableOpacity onPress={onLike} style={styles.btn}>
        <Heart 
            size={32} 
            color={isLiked ? "#E1306C" : "#fff"} 
            fill={isLiked ? "#E1306C" : "transparent"} 
        />
        <Text style={styles.text}>{formatViews(likesCount)}</Text>
      </TouchableOpacity>

      {/* Comment Button */}
      <TouchableOpacity onPress={onComment} style={styles.btn}>
        <MessageCircle size={32} color="#fff" />
        <Text style={styles.text}>{formatViews(item.comments_count)}</Text>
      </TouchableOpacity>

      {/* Share Button (Smart) */}
      <View style={styles.btn}>
        <ShareBtn 
            id={item.id} 
            type="reel" 
            size={30} 
            color="#fff" 
            showCount={true} 
            count={item.shares_count} 
        />
      </View>

      {/* Options Button */}
      <TouchableOpacity onPress={onOptions} style={styles.btn}>
        <MoreVertical size={28} color="#fff" />
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 10,
    bottom: 100, // Positioned above the bottom info
    alignItems: 'center',
    gap: 20,
    zIndex: 20,
  },
  btn: {
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 13,
    marginTop: 5,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});
        
