import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { getMediaUri } from '@/utils/media';

// Mock data for stories (Baad me API se replace kar lena)
const MOCK_STORIES = [
  { id: '1', user: { username: 'rahul_ui', avatar: 'https://i.pravatar.cc/150?u=1' }, isSeen: false },
  { id: '2', user: { username: 'design_pro', avatar: 'https://i.pravatar.cc/150?u=2' }, isSeen: true },
  { id: '3', user: { username: 'coder_life', avatar: 'https://i.pravatar.cc/150?u=3' }, isSeen: false },
  { id: '4', user: { username: 'travel_diaries', avatar: 'https://i.pravatar.cc/150?u=4' }, isSeen: true },
];

export default function StoryBar() {
  const { user } = useAuth();
  
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* 1. My Story (Add Button) */}
        <TouchableOpacity style={styles.storyItem}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={{ uri: getMediaUri(user?.avatar) || 'https://via.placeholder.com/100' }} 
              style={styles.myAvatar} 
            />
            <View style={styles.addIcon}>
              <Plus size={14} color="#fff" strokeWidth={3} />
            </View>
          </View>
          <Text style={styles.username}>Your Story</Text>
        </TouchableOpacity>

        {/* 2. Other User Stories */}
        {MOCK_STORIES.map((story) => (
          <TouchableOpacity key={story.id} style={styles.storyItem}>
            <LinearGradient
              colors={story.isSeen ? ['#333', '#333'] : [Colors.primary, '#A020F0']}
              style={styles.ring}
            >
              <View style={styles.avatarBorder}>
                <Image source={{ uri: story.user.avatar }} style={styles.avatar} />
              </View>
            </LinearGradient>
            <Text style={styles.username} numberOfLines={1}>{story.user.username}</Text>
          </TouchableOpacity>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border, // Ensure Colors.border exists in constants
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 16,
    gap: 16,
  },
  storyItem: {
    alignItems: 'center',
    gap: 6,
    width: 72,
  },
  avatarWrapper: {
    position: 'relative',
    width: 68,
    height: 68,
  },
  myAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  addIcon: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: Colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  ring: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBorder: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  username: {
    fontSize: 11,
    color: Colors.text,
    textAlign: 'center',
  }
});
    
