// File: profile.tsx.txt (app/(tabs)/profile/index.tsx) - FIX: Reels removed for Posts-Only Profile

import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Settings, Grid, Film, Sparkles } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';

import Colors from '@/constants/colors';
import { buildMediaUrl, MEDIA_FALLBACKS } from '@/constants/media';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { User } from '@/types';

const { width } = Dimensions.get('window');
const GRID_ITEM_SIZE = (width - 2) / 3;

// --- ProfileHeader component remains the same (source 7-18) ---
function ProfileHeader({ user }: { user: User }) {
  [span_11](start_span)const coverPhoto = user.coverPhoto || user.cover_photo;[span_11](end_span)
  const postsCount = user.postsCount || user.posts_count || [span_12](start_span)0;[span_12](end_span)
  const followersCount = user.followersCount || user.followers_count || [span_13](start_span)0;[span_13](end_span)
  const followingCount = user.followingCount || user.following_count || [span_14](start_span)0;[span_14](end_span)
  [span_15](start_span)const isVerified = user.isVerified || user.is_verified || false;[span_15](end_span)
  [span_16](start_span)const coverUri = buildMediaUrl(coverPhoto, 'userCover');[span_16](end_span)

  [span_17](start_span)const avatarUri = buildMediaUrl(user.avatar, 'userProfile');[span_17](end_span)
  return (
    <View style={styles.profileHeader}>
      <Image
        source={{ uri: coverUri }}
        style={styles.coverPhoto}
        contentFit="cover"
      />

      <View style={styles.profileInfo}>
        <Image source={{ uri: avatarUri }} style={styles.profileAvatar} contentFit="cover" />

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text 
            [span_18](start_span)style={styles.statValue}>[span_18](end_span)
              {postsCount.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {followersCount > 1000
           
              ? [span_19](start_span)`${(followersCount / 1000).toFixed(1)}K`[span_19](end_span)
                : followersCount}
            </Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {followingCount.toLocaleString()}
  
            [span_20](start_span)</Text>[span_20](end_span)
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>

      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{user.name}</Text>
          {isVerified && (
            <Text style={styles.verifiedBadge}>✓</Text>
 
          [span_21](start_span))}[span_21](end_span)
        </View>
        <Text style={styles.username}>@{user.username}</Text>
        {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
      </View>

      <TouchableOpacity
        style={styles.creatorStudioButton}
        onPress={() => router.push('/creator-studio')}
      >
        <Sparkles color={Colors.primary} size={20} />
        <Text style={styles.creatorStudioButtonText}>Creator Studio</Text>
      
      [span_22](start_span)</TouchableOpacity>[span_22](end_span)

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => router.push('/edit-profile')}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
    
        > [span_23](start_span)
          <Settings color={Colors.text} size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}[span_23](end_span)
// --- End of ProfileHeader ---


export default function ProfileScreen() {
  [span_24](start_span)const insets = useSafeAreaInsets();[span_24](end_span)
  [span_25](start_span)const { user: currentUser } = useAuth();[span_25](end_span)
  
  // FIX 1: activeTab ko sirf 'posts' par set kiya gaya hai. Reels ka option hata diya.
  const [activeTab, setActiveTab] = useState<'posts'>('posts');

  // FIX 2: Reels Data Query (userReelsData) ko poora remove kiya gaya hai.
  const { data: userPostsData, isLoading: isLoadingPosts } = useQuery<{ posts: any[];
  [span_26](start_span)hasMore: boolean }>({[span_26](end_span)
    queryKey: ['user-posts', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return { posts: [], hasMore: false };
      return api.users.getPosts(currentUser.id);
    },
    // Ab activeTab check karna unnecessary hai, lekin 'posts' hi rakhte hain.
    enabled: !!currentUser?.id && activeTab === 'posts',
  });
  
  // const userReelsData removed 

  const userPosts = userPostsData?.posts || [span_27](start_span)[];[span_27](end_span)
  // const userReels removed 
  
  // renderGridItem logic ko sirf POSTS ke liye simplified kiya gaya hai.
  const renderGridItem = ({ item }: { item: any }) => {
    [span_28](start_span)let imageUri: string = MEDIA_FALLBACKS.userProfile;[span_28](end_span)
    
    // FIX 3: activeTab === 'reels' block hata diya gaya hai.
    if (item.images && item.images.length > 0) {
      [span_29](start_span)imageUri = buildMediaUrl(item.images[0]);[span_29](end_span)
    } else if (item.thumbnail_url) {
      [span_30](start_span)imageUri = buildMediaUrl(item.thumbnail_url);[span_30](end_span)
    }

    return (
      [span_31](start_span)<TouchableOpacity style={styles.gridItem}>[span_31](end_span)
        <Image
          source={{ uri: imageUri }}
          style={styles.gridImage}
          contentFit="cover"
        />
        {/* Reels overlay removed */}
      </TouchableOpacity>
    );
  };

  if (!currentUser) {
    return (
      [span_32](start_span)<View style={[styles.container, styles.centerContent]}>[span_32](end_span)
        <Text style={styles.errorText}>Please log in to view your profile</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // FIX 4: isLoading and data variables ko sirf POSTS ke liye set kiya gaya hai.
  const isLoading = isLoadingPosts;
  const data = userPosts; 

  return (
    [span_33](start_span)<View style={[styles.container, { paddingTop: insets.top }]}>[span_33](end_span)
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileHeader user={currentUser} />

        <View style={styles.tabBar}>
          {/* POSTS Tab */}
          <TouchableOpacity
            style={[styles.tab, styles.tabActive]} // Only one tab, so always active
            onPress={() => setActiveTab('posts')}
          >
          
            <Grid
              color={Colors.primary} // Always primary color since it's the only tab
              size={22}
            />
          </TouchableOpacity>
          {/* FIX 5: REELS Tab removed */}

        </View>

        {isLoading ? (
     
          [span_34](start_span)<View style={styles.loadingContainer}>[span_34](end_span)
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : data.length > 0 ?
        [span_35](start_span)(
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={renderGridItem}
            numColumns={3}
            scrollEnabled={false}
            contentContainerStyle={styles.grid}
          />
      
        ) : ([span_35](end_span)
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No posts yet
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
[span_36](start_span)}[span_36](end_span)

// --- Styles remain the same (no changes in styles needed for this fix) ---
// (Source 40 onwards contain only style definitions)
// ...
