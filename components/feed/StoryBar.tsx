import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router'; 
import { useQuery, useQueryClient } from '@tanstack/react-query'; // useQueryClient added for future updates

import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { getMediaUri } from '@/utils/media';
import { api } from '@/services/api'; 

// --- INTERFACE DEFINITIONS ---
interface StoryGroup {
  user_id: string;
  username: string;
  avatar: string; // User's profile avatar
  lastStoryThumbnail: string; // The media URL of the last uploaded story
  stories: any[];
  hasUnviewed: boolean;
}

export default function StoryBar() {
  const { user } = useAuth();
  // We include useQueryClient here for instant UI updates after successful upload mutation
  const queryClient = useQueryClient(); 
  const currentUserId = String(user?.id); 

  const { data, isLoading } = useQuery({
    queryKey: ['stories-feed'],
    queryFn: async () => {
      if (!api.stories?.getFeed) return { stories: [] };
      return api.stories.getFeed();
    },
  });

  const allStories = data?.stories || [];

  const { groupedStories, myStoryGroup } = useMemo(() => {
    const groups: { [key: string]: StoryGroup } = {};
    let currentUserStories: any[] = [];
    
    allStories.forEach((story: any) => {
      const uid = String(story.user_id);

      if (uid === currentUserId) {
          currentUserStories.push(story);
          return; 
      }

      if (!groups[uid]) {
        groups[uid] = {
          user_id: uid,
          username: story.user.username,
          avatar: story.user.avatar,
          lastStoryThumbnail: '',
          stories: [],
          hasUnviewed: false,
        };
      }
      
      groups[uid].stories.push(story);
      
      // Update Unviewed status and lastStoryThumbnail
      if (!story.is_viewed) {
        groups[uid].hasUnviewed = true;
      }
      // Set the thumbnail to the media URL of the most recent story (since the API returns ASC, the last one is the most recent)
      groups[uid].lastStoryThumbnail = story.media_url;
    });

    const finalGroups = Object.values(groups);

    // 🌟 LOGIC 3: Sorting - Unwatched first, Watched last
    finalGroups.sort((a, b) => {
      // Primary Sort: Unwatched stories come first
      if (a.hasUnviewed && !b.hasUnviewed) return -1; 
      if (!a.hasUnviewed && b.hasUnviewed) return 1;  
      
      // Secondary Sort: Newest created story first (if both are watched/unwatched)
      return new Date(b.stories[0].created_at).getTime() - new Date(a.stories[0].created_at).getTime(); 
    });

    let myGroup: StoryGroup | undefined;
    
    if (currentUserStories.length > 0) {
        // Find the media URL of the *last* story for the thumbnail
        const lastStory = currentUserStories[currentUserStories.length - 1]; 
        
        myGroup = {
            user_id: currentUserId,
            username: user?.username || 'Your Story', 
            avatar: user?.avatar || '',
            lastStoryThumbnail: lastStory?.media_url || user?.avatar || '', // Use story media URL as thumbnail
            stories: currentUserStories,
            hasUnviewed: currentUserStories.some(s => !s.is_viewed) 
        };
        // 🌟 LOGIC 2: Push 'Your Story' to the front
        finalGroups.unshift(myGroup);
    }
    
    return { groupedStories: finalGroups, myStoryGroup: myGroup };
  }, [allStories, currentUserId, user?.avatar, user?.username]);

  
  const hasMyActiveStories = myStoryGroup?.stories.length > 0;
  
  // 🌟 LOGIC 2 (Handling Tap): View vs. Create
  const handleMyStoryPress = () => {
      if (hasMyActiveStories) {
          // If stories exist, view them
          router.push({
             pathname: '/stories/view',
             params: { userId: currentUserId }
          });
      } else {
          // If no stories exist, navigate to create screen
          router.push('/stories/create');
      }
  };

  const handleStoryGroupPress = (group: StoryGroup) => {
    router.push({
      pathname: '/stories/view',
      params: { userId: group.user_id } 
    });
  };


  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* 1. My Story (View/Create) */}
        <TouchableOpacity style={styles.storyItem} onPress={handleMyStoryPress}>
          <View style={styles.avatarWrapper}>
            <Image 
              // 🌟 LOGIC 4: Use lastStoryThumbnail if available, otherwise use avatar
              source={{ uri: getMediaUri(myStoryGroup?.lastStoryThumbnail || user?.avatar) || 'https://via.placeholder.com/100' }} 
              style={styles.myAvatar} 
            />
            {/* 🌟 LOGIC 1: Upload Button Always Visible 🌟 */}
            <View style={styles.addIcon}>
              <Plus size={14} color="#fff" strokeWidth={3} />
            </View>
            
          </View>
          <Text style={styles.username} numberOfLines={1}>Your Story</Text>
        </TouchableOpacity>

        {/* Loading Indicator */}
        {isLoading && <ActivityIndicator size="small" color={Colors.primary} style={{ marginLeft: 10 }} />}

        {/* 2. Real API Stories (Filtered and Sorted) */}
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
                  {/* Use lastStoryThumbnail for other users' ring icon */}
                  <Image source={{ uri: getMediaUri(group.lastStoryThumbnail) }} style={styles.avatar} />
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
