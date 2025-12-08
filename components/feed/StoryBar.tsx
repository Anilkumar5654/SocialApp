import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router'; // 👈 Navigation ke liye
import { useQuery } from '@tanstack/react-query'; // 👈 Data fetching ke liye

import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { getMediaUri } from '@/utils/media';
import { api } from '@/services/api'; // 👈 API service

export default function StoryBar() {
  const { user } = useAuth();

  // 1. 👇 REAL DATA FETCHING (Mock Data Hata Diya)
  const { data, isLoading } = useQuery({
    queryKey: ['stories-feed'],
    queryFn: async () => {
      // Safety check: agar api service ready nahi hai
      if (!api.stories?.getFeed) return { stories: [] };
      return api.stories.getFeed();
    },
  });

  const stories = data?.stories || [];

  // 2. 👇 STORY VIEW LOGIC
  const handleStoryPress = (story: any) => {
    router.push({
      pathname: '/stories/view',
      params: { userId: story.user_id } // User ID bhej rahe hain taki player sahi story khole
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* 1. My Story (Create Button) */}
        <TouchableOpacity style={styles.storyItem} onPress={() => router.push('/stories/create')}>
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

        {/* Loading Indicator */}
        {isLoading && <ActivityIndicator size="small" color={Colors.primary} style={{ marginLeft: 10 }} />}

        {/* 2. Real API Stories */}
        {stories.map((story: any) => (
          <TouchableOpacity 
            key={story.id} 
            style={styles.storyItem}
            onPress={() => handleStoryPress(story)}
          >
            <LinearGradient
              colors={story.is_seen ? ['#333', '#333'] : [Colors.primary, '#A020F0']}
              style={styles.ring}
            >
              <View style={styles.avatarBorder}>
                <Image source={{ uri: getMediaUri(story.user.avatar) }} style={styles.avatar} />
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
    borderBottomColor: Colors.border,
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
    backgroundColor: '#333',
  },
  username: {
    fontSize: 11,
    color: Colors.text,
    textAlign: 'center',
  }
});
