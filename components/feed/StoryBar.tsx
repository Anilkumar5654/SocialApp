import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router'; 
import { useQuery } from '@tanstack/react-query'; 

import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { getMediaUri } from '@/utils/media';
import { api } from '@/services/api'; 

// --- START: NEW INTERFACE DEFINITIONS (Expected from Grouping Logic) ---
interface StoryGroup {
  user_id: string;
  username: string;
  avatar: string;
  stories: any[];
  hasUnviewed: boolean; // TRUE if at least one story in the group is unviewed
}

// --- END: NEW INTERFACE DEFINITIONS ---

export default function StoryBar() {
  const { user } = useAuth();
  const currentUserId = user?.id;

  const { data, isLoading } = useQuery({
    queryKey: ['stories-feed'],
    queryFn: async () => {
      if (!api.stories?.getFeed) return { stories: [] };
      return api.stories.getFeed();
    },
  });

  const allStories = data?.stories || [];

  // 1. & 2. FIX: Grouping, Sorting, and Unwatched Status Calculation
  const groupedStories: StoryGroup[] = useMemo(() => {
    const groups: { [key: string]: StoryGroup } = {};
    let currentUserStories: any[] = [];
    
    // Group all stories by user_id
    allStories.forEach((story: any) => {
      const uid = story.user_id;

      // Filter: Handle Current User Stories (Which should technically be empty due to API filter, but good for self-checking)
      if (uid === currentUserId) {
          currentUserStories.push(story);
          return; 
      }

      // Group other users' stories
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
      
      // Determine if the group has *any* unviewed stories
      if (!story.is_viewed) {
        groups[uid].hasUnviewed = true;
      }
    });

    // Convert to array and sort: Unwatched first, then by creation date
    const finalGroups = Object.values(groups);

    finalGroups.sort((a, b) => {
      // 2. Watched/Unwatched Sorting Fix
      if (a.hasUnviewed && !b.hasUnviewed) return -1; // Unwatched (TRUE) comes first
      if (!a.hasUnviewed && b.hasUnviewed) return 1;  // Watched (FALSE) comes later
      // Secondary sorting: by the creation date of the newest story in the group
      return new Date(b.stories[0].created_at).getTime() - new Date(a.stories[0].created_at).getTime(); 
    });

    // 5. FIX: Your own stories are added as the first item
    if (currentUserStories.length > 0) {
        // Create a fake group for the current user's active stories
        const userGroup: StoryGroup = {
            user_id: currentUserId,
            username: 'Your Story',
            avatar: user?.avatar || '',
            stories: currentUserStories,
            // If you filtered your own stories in API, you must fetch them separately
            // Assuming your stories are NOT filtered by API for now.
            hasUnviewed: currentUserStories.some(s => !s.is_viewed) 
        };
        finalGroups.unshift(userGroup);
    }
    
    return finalGroups;
  }, [allStories, currentUserId, user?.avatar]);


  // 2. & 5. FIX: Handle Story Creation (if no stories) or Viewing (if stories exist)
  const handleMyStoryPress = () => {
      const myStoryGroup = groupedStories.find(g => g.user_id === currentUserId);
      
      if (myStoryGroup && myStoryGroup.stories.length > 0) {
          // View my own story
          router.push({
             pathname: '/stories/view',
             params: { userId: currentUserId }
          });
      } else {
          // Create new story
          router.push('/stories/create');
      }
  };

  // 1. FIX: Handle Press on a specific story group
  const handleStoryGroupPress = (group: StoryGroup) => {
    router.push({
      pathname: '/stories/view',
      params: { userId: group.user_id } // Group ka pehla item nahi, User ID bhejo
    });
  };


  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* 1. My Story (Create/View Button) */}
        {/* 5. FIX: Show Your Story icon based on actual data */}
        <TouchableOpacity style={styles.storyItem} onPress={handleMyStoryPress}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={{ uri: getMediaUri(user?.avatar) || 'https://via.placeholder.com/100' }} 
              style={styles.myAvatar} 
            />
            {/* If user has no active stories, show the plus icon */}
            {(!groupedStories.find(g => g.user_id === currentUserId) || groupedStories.find(g => g.user_id === currentUserId)?.stories.length === 0) && (
                <View style={styles.addIcon}>
                  <Plus size={14} color="#fff" strokeWidth={3} />
                </View>
            )}
            
          </View>
          <Text style={styles.username} numberOfLines={1}>{groupedStories.find(g => g.user_id === currentUserId) ? user?.username : 'Your Story'}</Text>
        </TouchableOpacity>

        {/* Loading Indicator */}
        {isLoading && <ActivityIndicator size="small" color={Colors.primary} style={{ marginLeft: 10 }} />}

        {/* 2. Real API Stories (Grouped and Sorted) */}
        {groupedStories
          .filter(group => group.user_id !== currentUserId) // Ensure current user is not repeated
          .map((group: StoryGroup) => (
            <TouchableOpacity 
              key={group.user_id} // Key is now the user_id (unique for the group)
              style={styles.storyItem}
              onPress={() => handleStoryGroupPress(group)}
            >
              <LinearGradient
                // 2. FIX: Use hasUnviewed for ring color
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
