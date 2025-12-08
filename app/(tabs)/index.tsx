import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Search, Bell, MessageSquare } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';

// 👇 Components ab alag files se import ho rahe hain (Clean Structure)
import PostItem from '@/components/feed/PostItem';
import StoryBar from '@/components/feed/StoryBar'; // Ensure StoryBar is moved to components/feed/

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  
  // State for Tabs
  const [activeTab, setActiveTab] = useState<'for-you' | 'following'>('for-you');

  // React Query for Data Fetching
  const { data, refetch, isRefetching, isLoading } = useQuery({
    queryKey: ['feed', activeTab], // Unique key per tab
    queryFn: () => api.home.getFeed(1, 10, activeTab),
    enabled: isAuthenticated,
  });

  // Filter posts (Only Text/Photo in Feed as per your logic)
  const posts = (data?.posts || []).filter((item: any) => item.type === 'text' || item.type === 'photo');

  // Login Check
  if (!isAuthenticated) return (
    <View style={styles.centerContent}>
      <Text style={styles.notAuthText}>Please log in</Text>
      <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/auth/login')}>
        <Text style={styles.loginButtonText}>Log In</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      {/* 1. Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.logo}>SocialHub</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => router.push('/search')} style={styles.iconBtn}>
            <Search color={Colors.text} size={24} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.iconBtn}>
            <Bell color={Colors.text} size={24} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/messages')} style={styles.iconBtn}>
            <MessageSquare color={Colors.text} size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Tabs (For You / Following) */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'for-you' && styles.tabButtonActive]} 
          onPress={() => setActiveTab('for-you')}
        >
          <Text style={[styles.tabText, activeTab === 'for-you' && styles.tabTextActive]}>For You</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'following' && styles.tabButtonActive]} 
          onPress={() => setActiveTab('following')}
        >
          <Text style={[styles.tabText, activeTab === 'following' && styles.tabTextActive]}>Following</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Feed List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <PostItem post={item} />} // Sara Logic PostItem me chala gaya
          ListHeaderComponent={StoryBar}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No posts found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  logo: { fontSize: 26, fontWeight: '700', color: Colors.text },
  headerIcons: { flexDirection: 'row', gap: 16 },
  iconBtn: { padding: 4 },
  
  // Tabs
  tabsContainer: { flexDirection: 'row', borderBottomWidth: 1, borderColor: Colors.border },
  tabButton: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderColor: 'transparent' },
  tabButtonActive: { borderColor: Colors.primary },
  tabText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.text },

  // States
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: Colors.textSecondary, fontSize: 16 },
  
  // Auth Placeholder
  notAuthText: { fontSize: 16, color: Colors.textSecondary, marginBottom: 20 },
  loginButton: { backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 8 },
  loginButtonText: { color: Colors.text, fontWeight: '600', fontSize: 16 },
});
