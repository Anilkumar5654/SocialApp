import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router'; 
// 👇 Import useQueryClient
import { useQuery, useQueryClient } from '@tanstack/react-query'; 

import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { getMediaUri } from '@/utils/media';
import { api } from '@/services/api'; 

// --- INTERFACE DEFINITIONS ---
interface StoryGroup {
  user_id: string;
  username: string;
  avatar: string;
  stories: any[];
  hasUnviewed: boolean;
}

export default function StoryBar() {
  const { user } = useAuth();
  const queryClient = useQueryClient(); // 👈 For instant UI updates
  const currentUserId = String(user?.id); 

  const { data, isLoading } = useQuery({
    queryKey: ['stories-feed'],
    queryFn: async () => {
      if (!api.stories?.getFeed) return { stories: [] };
      return api.stories.getFeed();
    },
  });

  const allStories = data?.stories || [];

  // Grouping, Sorting, and Unwatched Status Calculation
  const { groupedStories, hasMyActiveStories } = useMemo(() => {
    const groups: { [key: string]: StoryGroup } = {};
    let currentUserStories: any[] = [];
    let hasActiveStories = false; // Separate flag

    allStories.forEach((story: any) => {
      const uid = String(story.user_id);

      if (uid === currentUserId) {
          currentUserStories.push(story);
          hasActiveStories = true; // Set flag if any self-story exists
          return; 
      }

      if (!groups[uid]) {
        groups[uid] = {
          user_id: uid,
          username: story.user.username,
          avatar: story.user.avatar,
          stories: [],
          hasUnviewed: false,
        };
      }
      
      groups[uid].stories.push(story);
      
      if (!story.is_viewed) {
        groups[uid].hasUnviewed = true;
      }
    });

    const finalGroups = Object.values(groups);

    finalGroups.sort((a, b) => {
      if (a.hasUnviewed && !b.hasUnviewed) return -1; 
      if (!a.hasUnviewed && b.hasUnviewed) return 1;  
      return new Date(b.stories[0].created_at).getTime() - new Date(a.stories[0].created_at).getTime(); 
    });

    // Add 'Your Story' to the front only if it exists
    if (currentUserStories.length > 0) {
        const userGroup: StoryGroup = {
            user_id: currentUserId,
            username: user?.username || 'Your Story', 
            avatar: user?.avatar || '',
            stories: currentUserStories,
            hasUnviewed: currentUserStories.some(s => !s.is_viewed) 
        };
        finalGroups.unshift(userGroup);
    }
    
    // Return both the list and the status flag
    return { groupedStories: finalGroups, hasMyActiveStories: hasActiveStories };
  }, [allStories, currentUserId, user?.avatar, user?.username]);


  // Handle Story Creation (if no stories) or Viewing (if stories exist)
  const handleMyStoryPress = () => {
      // Logic based on the flag extracted from useMemo
      if (hasMyActiveStories) {
          // View my own story (if stories exist)
          router.push({
             pathname: '/stories/view',
             params: { userId: currentUserId }
          });
      } else {
          // Create new story (if no stories exist)
          router.push('/stories/create');
      }
  };

  // Handle Press on a specific story group
  const handleStoryGroupPress = (group: StoryGroup) => {
    router.push({
      pathname: '/stories/view',
      params: { userId: group.user_id } 
    });
  };


  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* 1. My Story (Create/View Button) */}
        <TouchableOpacity style={styles.storyItem} onPress={handleMyStoryPress}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={{ uri: getMediaUri(user?.avatar) || 'https://via.placeholder.com/100' }} 
              style={styles.myAvatar} 
            />
            {/* 🌟 FIX: Show plus icon only if the user has NO active stories 🌟 */}
            {!hasMyActiveStories && (
                <View style={styles.addIcon}>
                  <Plus size={14} color="#fff" strokeWidth={3} />
                </View>
            )}
            
          </View>
          <Text style={styles.username} numberOfLines={1}>Your Story</Text>
        </TouchableOpacity>

        {/* Loading Indicator */}
        {isLoading && <ActivityIndicator size="small" color={Colors.primary} style={{ marginLeft: 10 }} />}

        {/* 2. Real API Stories (Grouped and Sorted) */}
        {groupedStories
          .filter(group => group.user_id !== currentUserId) 
          .map((group: StoryGroup) => (
            <TouchableOpacity 
              key={group.user_id} 
              style={styles.storyItem}
              onPress={() => handleStoryGroupPress(group)}
            >
              <LinearGradient
                // Watched/Unwatched Ring Logic
                colors={group.hasUnviewed ? [Colors.primary, '#A020F0'] : ['#333', '#333']}
                style={styles.ring}
              >
                <View style={styles.avatarBorder}>
                  <Image source={{ uri: getMediaUri(group.avatar) }} style={styles.avatar} />
                </View>
              </LinearGradient>
              <Text style={styles.username} numberOfLines={1}>{group.username}</Text>
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
    justifyContent: 'center', // Added for better centering
    alignItems: 'center', // Added for better centering
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
