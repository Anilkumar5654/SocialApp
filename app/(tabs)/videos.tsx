import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Search, Plus, TrendingUp, Flame, Clock, BarChart2 } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { calculateViralityScore } from '@/utils/analytics';
import VideoCard from '@/components/videos/VideoCard';

const VIDEO_FILTERS = [
  { id: 'all', label: 'All', icon: BarChart2 },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'hot', label: 'Hot', icon: Flame },
  { id: 'recent', label: 'Recent', icon: Clock },
];

export default function VideosScreen() {
  const { isAuthenticated } = useAuth();
  const [filter, setFilter] = useState('all');
  const insets = useSafeAreaInsets();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['videos-feed'], 
    queryFn: () => api.videos.getVideos(1, 20),
  });

  const videos = data?.videos || [];

  const displayVideos = useMemo(() => {
    if (!videos.length) return [];
    let sorted = videos.map((v: any) => ({ ...v, score: calculateViralityScore(v) }));
    
    if (filter === 'trending' || filter === 'hot') {
       sorted.sort((a: any, b: any) => b.score - a.score);
    } else if (filter === 'recent') {
       sorted.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return sorted;
  }, [videos, filter]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.title}>Videos</Text>
        <View style={styles.icons}>
            <TouchableOpacity onPress={() => router.push('/videos/search')}><Search color="#fff" size={24} /></TouchableOpacity>
            {isAuthenticated && (
            <TouchableOpacity style={styles.uploadBtn} onPress={() => router.push('/videos/upload')}>
                <Plus color="#000" size={22} />
            </TouchableOpacity>
            )}
        </View>
      </View>

      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {VIDEO_FILTERS.map((f) => {
            const Icon = f.icon;
            const isActive = filter === f.id;
            return (
              <TouchableOpacity key={f.id} style={[styles.chip, isActive && styles.chipActive]} onPress={() => setFilter(f.id)}>
                <Icon color={isActive ? '#000' : Colors.textSecondary} size={14} />
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={displayVideos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <VideoCard video={item} />}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
          ListEmptyComponent={<Text style={styles.empty}>No videos found</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: '#222' },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text },
  icons: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  uploadBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  filters: { paddingVertical: 12, borderBottomWidth: 1, borderColor: '#222' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333' },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  chipTextActive: { color: '#000' },
  empty: { color: Colors.textSecondary, textAlign: 'center', marginTop: 50 }
});
