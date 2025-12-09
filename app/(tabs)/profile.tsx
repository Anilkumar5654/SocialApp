// File: app/(tabs)/profile/index.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Grid } from 'lucide-react-native'; // Keeping Grid icon only for the Posts tab content

import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/authContext';
import { api } from '@/services/api';
import { getMediaUri } from '@/utils/media';

import ProfileHeader from '@/components/profile/ProfileHeader';

const { width } = Dimensions.get('window');
const GRID_SIZE = (width - 2) / 3;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
  
  // Active tab state can stay for future expansion, but UI only shows 'Posts'
  const [activeTab, setActiveTab] = useState<'posts'>('posts');

  const { data: postsData, isLoading } = useQuery({
    queryKey: ['user-posts', user?.id],
    queryFn: async () => user?.id ? api.users.getPosts(user.id) : { posts: [] },
    enabled: !!user?.id, 
  });

  const posts = postsData?.posts || [];

  // --- Not Logged In State ---
  if (!isAuthenticated || !user) {
      return (
        <View style={styles.center}>
            <Text style={styles.notAuthText}>Please log in to view profile</Text>
            <TouchableOpacity style={styles.btn} onPress={() => router.push('/auth/login')}>
                <Text style={styles.btnText}>Log In</Text>
            </TouchableOpacity>
        </View>
      );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* 1. Header Component */}
        <ProfileHeader user={user} />

        {/* 2. Tabs Section (Only Posts Tab - Design Match) */}
        <View style={styles.tabs}>
            <TouchableOpacity style={[styles.tab, styles.tabActive]}>
                {/* 🎯 FIX: Removed the Grid icon that was previously below the text */}
                <Text style={styles.tabText}>Posts</Text> 
            </TouchableOpacity>
            {/* 🎯 FIX: Removed Reels and Tagged tabs */}
        </View>

        {/* 3. Grid Content */}
        {isLoading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : (
            <FlatList
                data={posts}
                keyExtractor={item => item.id.toString()}
                numColumns={3}
                scrollEnabled={false} 
                ListHeaderComponent={
                    <View style={styles.contentGridIcon}>
                        {/* 🎯 FIX: Keeping a single Grid icon above the posts content */}
                        <Grid color={Colors.text} size={22} />
                    </View>
                }
                renderItem={({ item }) => {
                    const uri = item.images?.[0] ? getMediaUri(item.images[0]) : getMediaUri(item.thumbnail_url);
                    return (
                        <TouchableOpacity 
                            style={styles.gridItem} 
                            onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.id } })}
                        >
                            <Image source={{ uri }} style={styles.gridImg} contentFit="cover" />
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>No posts yet</Text>
                    </View>
                }
            />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  notAuthText: { color: Colors.textSecondary, marginBottom: 20, fontSize: 16 },
  btn: { backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 8 },
  btnText: { color: Colors.text, fontWeight: '600' },
  
  // Tab Styles (Simplified for single Posts tab)
  tabs: { borderBottomWidth: 1, borderColor: Colors.border, flexDirection: 'row', justifyContent: 'center' },
  tab: { paddingHorizontal: 40, paddingVertical: 12, alignItems: 'center' },
  tabText: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  tabActive: { borderBottomWidth: 3, borderColor: Colors.primary },
  
  contentGridIcon: {
      alignItems: 'center',
      paddingVertical: 15,
  },
  
  gridItem: { width: GRID_SIZE, height: GRID_SIZE, margin: 0.5, backgroundColor: '#1A1A1A' },
  gridImg: { width: '100%', height: '100%' },
  
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: Colors.textSecondary }
});
