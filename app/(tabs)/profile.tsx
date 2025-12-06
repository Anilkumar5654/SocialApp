import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Settings, Grid, Sparkles, Edit } from 'lucide-react-native';
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
import { User } from '@/types'; // Assuming User type is defined

const { width } = Dimensions.get('window');
// Grid items 3-column layout ke liye, 1px ka gap rakha hai
const GRID_ITEM_SIZE = (width - 2) / 3; 

// --- ProfileHeader component ---
function ProfileHeader({ user }: { user: User }) {
  const coverPhoto = user.coverPhoto || user.cover_photo;
  const postsCount = user.postsCount || user.posts_count || 0;
  const followersCount = user.followersCount || user.followers_count || 0;
  const followingCount = user.followingCount || user.following_count || 0;
  const isVerified = user.isVerified || user.is_verified || false;

  const coverUri = buildMediaUrl(coverPhoto, 'userCover');
  const avatarUri = buildMediaUrl(user.avatar, 'userProfile');

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
            <Text style={styles.statValue}>
              {postsCount.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {followersCount > 1000 ? `${(followersCount / 1000).toFixed(1)}K` : followersCount}
            </Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {followingCount.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>

      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{user.name}</Text>
          {isVerified && (
            <Text style={styles.verifiedBadge}>✓</Text>
          )}
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
      </TouchableOpacity>

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
        >
          <Settings color={Colors.text} size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- MAIN PROFILE SCREEN ---
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user: currentUser } = useAuth();
  
  // Tab state set to 'posts' (since only posts are displayed)
  const [activeTab, setActiveTab] = useState<'posts'>('posts'); 

  // 🎯 API CALL: Fetching self-posts using api.users.getPosts
  const { data: userPostsData, isLoading: isLoadingPosts } = useQuery<{ posts: any[]; hasMore: boolean }>({
    queryKey: ['user-posts', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return { posts: [], hasMore: false };
      // 👇 Yeh woh API call hai jisse aapki khud ki posts fetch hongi
      return api.users.getPosts(currentUser.id); 
    },
    enabled: !!currentUser?.id, 
  });
  
  const userPosts = userPostsData?.posts || [];
  
  // 🎯 RENDERING LOGIC: Har post item ko grid mein dikhane ke liye
  const renderGridItem = ({ item }: { item: any }) => {
    let imageUri: string = MEDIA_FALLBACKS.userProfile;
    
    // Check if post has images array or a direct thumbnail URL
    if (item.images && item.images.length > 0) {
      // Assuming 'images' is an array of media objects, taking the first one
      imageUri = buildMediaUrl(item.images[0]); 
    } else if (item.thumbnail_url) {
      // Fallback for posts that might have a dedicated thumbnail
      imageUri = buildMediaUrl(item.thumbnail_url);
    }
    // Agar koi media nahi mila, toh placeholder image (MEDIA_FALLBACKS.userProfile) dikhega

    return (
      <TouchableOpacity 
        style={styles.gridItem} 
        onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.id } })} // Example navigation
      >
        <Image
          source={{ uri: imageUri }}
          style={styles.gridImage}
          contentFit="cover"
        />
      </TouchableOpacity>
    );
  };

  if (!currentUser) {
    return (
      <View style={[styles.container, styles.centerContent]}>
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

  const isLoading = isLoadingPosts;
  const data = userPosts; 

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileHeader user={currentUser} />

        {/* TabBar: Only Posts Tab */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, styles.tabActive]} 
            onPress={() => setActiveTab('posts')}
          >
            <Grid
              color={Colors.primary} 
              size={22}
            />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : data.length > 0 ? (
          // 👇 Posts data ko 3-column grid mein display karna
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={renderGridItem}
            numColumns={3}
            scrollEnabled={false} // ScrollView ke andar hone ki wajah se
            contentContainerStyle={styles.grid}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No posts yet
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// --- STYLES ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  profileHeader: {
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  coverPhoto: {
    width: '100%',
    height: 160,
  },
  profileInfo: {
    paddingHorizontal: 16,
    marginTop: -40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: Colors.background,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  userInfo: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  verifiedBadge: {
    color: Colors.info,
    fontSize: 20,
  },
  username: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  bio: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 20,
    marginTop: 12,
  },
  creatorStudioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  creatorStudioButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  editButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  settingsButton: {
    width: 44,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  // Posts Grid Styles
  grid: {
    gap: 1,
  },
  gridItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    position: 'relative',
    margin: 0.5, // 1px gap for each item (0.5 left + 0.5 right)
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surface,
  },
  playOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
  },
  viewCount: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '700' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  loadingContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
