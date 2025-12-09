import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router'; 
import { useQuery, useQueryClient } from '@tanstack/react-query'; 

import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { getMediaUri } from '@/utils/media';
import { api } from '@/services/api'; 

interface StoryGroup {
  user_id: string;
  username: string;
  avatar: string; 
  lastStoryThumbnail: string;
  stories: any[];
  hasUnviewed: boolean;
}

export default function StoryBar() {
  const { user } = useAuth();
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
      
      if (!story.is_viewed) {
        groups[uid].hasUnviewed = true;
      }
      groups[uid].lastStoryThumbnail = story.media_url;
    });

    const finalGroups = Object.values(groups);

    finalGroups.sort((a, b) => {
      if (a.hasUnviewed && !b.hasUnviewed) return -1; 
      if (!a.hasUnviewed && b.hasUnviewed) return 1;  
      return new Date(b.stories[0].created_at).getTime() - new Date(a.stories[0].created_at).getTime(); 
    });

    let myGroup: StoryGroup | undefined;
    
    if (currentUserStories.length > 0) {
        const lastStory = currentUserStories[currentUserStories.length - 1]; 
        
        myGroup = {
            user_id: currentUserId,
            username: user?.username || 'Your Story', 
            avatar: user?.avatar || '',
            lastStoryThumbnail: lastStory?.media_url || user?.avatar || '',
            stories: currentUserStories,
            hasUnviewed: currentUserStories.some(s => !s.is_viewed) 
        };
        finalGroups.unshift(myGroup);
    }
    
    return { groupedStories: finalGroups, myStoryGroup: myGroup };
  }, [allStories, currentUserId, user?.avatar, user?.username]);

  
  const hasMyActiveStories = myStoryGroup?.stories.length > 0;
  
  const handleMyStoryPress = () => {
      if (hasMyActiveStories) {
          router.push({
             pathname: '/stories/view',
             params: { userId: currentUserId }
          });
      } else {
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
        
        <TouchableOpacity 
          style={styles.storyItem} 
          onPress={handleMyStoryPress}
        >
          <View style={styles.avatarWrapper}>
            <Image 
              source={{ uri: getMediaUri(myStoryGroup?.lastStoryThumbnail || user?.avatar) || 'https://via.placeholder.com/100' }} 
              style={styles.myAvatar} 
            />
            
            <TouchableOpacity 
              style={styles.addIcon} 
              onPress={() => router.push('/stories/create')}
            >
              <Plus size={14} color="#fff" strokeWidth={3} />
            </TouchableOpacity>
            
          </View>
          <Text style={styles.username} numberOfLines={1}>Your Story</Text>
        </TouchableOpacity>

        {isLoading && <ActivityIndicator size="small" color={Colors.primary} style={{ marginLeft: 10 }} />}

        {groupedStories
          .filter(group => group.user_id !== currentUserId) 
          .map((group: StoryGroup) => (
            <TouchableOpacity 
              key={group.user_id} 
              style={styles.storyItem}
              onPress={() => handleStoryGroupPress(group)}
            >
              <LinearGradient
                colors={group.hasUnviewed ? [Colors.primary, '#A020F0'] : ['#333', '#333']}
                style={styles.ring}
              >
                <View style={styles.avatarBorder}>
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
