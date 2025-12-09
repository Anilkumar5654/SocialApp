import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Grid } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { api } from '@/services/api';
import { getMediaUri } from '@/utils/media';

// 👇 Reusing Smart Profile Header
import ProfileHeader from '@/components/profile/ProfileHeader';

const { width } = Dimensions.get('window');
const GRID_SIZE = (width - 2) / 3;

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId?: string }>();
  // Handle array/string param safely
  const resolvedUserId = Array.isArray(userId) ? userId[0] : userId ?? '';

  const [activeTab, setActiveTab] = useState<'posts'>('posts');

  // 1. Fetch User Data
  const { data: profileData, isLoading: loadingProfile, isError } = useQuery({
    queryKey: ['user-profile', resolvedUserId],
    queryFn: () => api.users.getProfile(resolvedUserId),
    enabled: !!resolvedUserId,
  });

  // 2. Fetch User Posts
  const { data: postsData, isLoading: loadingPosts } = useQuery({
    queryKey: ['user-posts', resolvedUserId],
    queryFn: () => api.users.getPosts(resolvedUserId, 1),
    enabled: !!resolvedUserId,
  });

  const user = profileData?.user;
  const posts = postsData?.posts || [];

  if (loadingProfile) {
    return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
        </View>
    );
  }

  if (isError || !user) {
    return (
        <View style={styles.center}>
            <Text style={{ color: Colors.textSecondary }}>User not found</Text>
            <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                <Text style={{ color: Colors.primary }}>Go Back</Text>
            </TouchableOpacity>
        </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
            headerShown: true, 
            title: user.username, 
            headerStyle: { backgroundColor: Colors.background },
            headerTintColor: Colors.text,
            headerLeft: () => (
                <TouchableOpacity onPress={() => router.back()} style={{ paddingRight: 10 }}>
                    <ArrowLeft color={Colors.text} size={24} />
                </TouchableOpacity>
            )
        }} 
      />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        // 👇 Header Component handles all profile details
        ListHeaderComponent={
            <>
                <ProfileHeader user={user} />
                {/* Tabs Section */}
                <View style={styles.tabs}>
                    <TouchableOpacity style={[styles.tab, styles.tabActive]}>
                        <Grid color={Colors.primary} size={22} />
                    </TouchableOpacity>
                </View>
            </>
        }
        renderItem={({ item }) => {
            const uri = item.images?.[0] ? getMediaUri(item.images[0]) : getMediaUri(item.thumbnail_url);
            return (
                <TouchableOpacity 
                    style={styles.gridItem} 
                    onPress={() => router.push({ pathname: '/post/[postId]', params: { postId: item.id } })}
                >
                    <Image source={{ uri }} style={styles.gridImg} contentFit="cover" />
                </TouchableOpacity>
            );
        }}
        ListEmptyComponent={
            !loadingPosts ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyText}>No posts yet</Text>
                </View>
            ) : <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  
  tabs: { borderBottomWidth: 1, borderColor: Colors.border, flexDirection: 'row', justifyContent: 'center' },
  tab: { paddingVertical: 14, width: '33%', alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderColor: Colors.primary },
  
  gridItem: { width: GRID_SIZE, height: GRID_SIZE, margin: 0.5, backgroundColor: '#1A1A1A' },
  gridImg: { width: '100%', height: '100%' },
  
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: Colors.textSecondary }
});
