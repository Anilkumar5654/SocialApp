import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Settings, Grid, Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';

import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { getMediaUri } from '@/utils/media';

const { width } = Dimensions.get('window');
const GRID_SIZE = (width - 2) / 3;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');

  const { data: postsData, isLoading } = useQuery({
    queryKey: ['user-posts', user?.id],
    queryFn: async () => user?.id ? api.users.getPosts(user.id) : { posts: [] },
    enabled: !!user?.id, 
  });

  const posts = postsData?.posts || [];

  if (!user) return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.text}>Please log in</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/auth/login')}><Text style={styles.btnText}>Log In</Text></TouchableOpacity>
      </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
            <Image source={{ uri: getMediaUri(user.cover_photo) }} style={styles.cover} contentFit="cover" />
            <View style={styles.info}>
                <Image source={{ uri: getMediaUri(user.avatar) }} style={styles.avatar} contentFit="cover" />
                <View style={styles.stats}>
                    <View style={styles.stat}><Text style={styles.statVal}>{user.posts_count || 0}</Text><Text style={styles.statLabel}>Posts</Text></View>
                    <View style={styles.stat}><Text style={styles.statVal}>{user.followers_count || 0}</Text><Text style={styles.statLabel}>Followers</Text></View>
                    <View style={styles.stat}><Text style={styles.statVal}>{user.following_count || 0}</Text><Text style={styles.statLabel}>Following</Text></View>
                </View>
            </View>
            <View style={styles.bioSec}>
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.handle}>@{user.username}</Text>
                {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
            </View>
            <TouchableOpacity style={styles.creatorBtn} onPress={() => router.push('/creator-studio')}>
                <Sparkles color={Colors.primary} size={20} />
                <Text style={styles.creatorText}>Creator Studio</Text>
            </TouchableOpacity>
            <View style={styles.actions}>
                <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/edit-profile')}><Text style={styles.editText}>Edit Profile</Text></TouchableOpacity>
                <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/settings')}><Settings color={Colors.text} size={20} /></TouchableOpacity>
            </View>
        </View>

        <View style={styles.tabs}>
            <TouchableOpacity style={[styles.tab, styles.tabActive]}><Grid color={Colors.primary} size={22} /></TouchableOpacity>
        </View>

        {isLoading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
        ) : (
            <FlatList
                data={posts}
                keyExtractor={item => item.id}
                numColumns={3}
                scrollEnabled={false}
                renderItem={({ item }) => {
                    const uri = item.images?.[0] ? getMediaUri(item.images[0]) : getMediaUri(item.thumbnail_url);
                    return (
                        <TouchableOpacity style={styles.gridItem} onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.id } })}>
                            <Image source={{ uri }} style={styles.gridImg} contentFit="cover" />
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={<View style={styles.empty}><Text style={styles.text}>No posts yet</Text></View>}
            />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { paddingBottom: 20, borderBottomWidth: 1, borderColor: Colors.border },
  cover: { width: '100%', height: 160 },
  info: { paddingHorizontal: 16, marginTop: -40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: Colors.background },
  stats: { flexDirection: 'row', gap: 24 },
  stat: { alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '700', color: Colors.text },
  statLabel: { fontSize: 13, color: Colors.textSecondary },
  bioSec: { paddingHorizontal: 16, marginTop: 16 },
  name: { fontSize: 22, fontWeight: '700', color: Colors.text },
  handle: { fontSize: 15, color: Colors.textSecondary },
  bio: { marginTop: 8, color: Colors.text, lineHeight: 20 },
  creatorBtn: { flexDirection: 'row', justifyContent: 'center', gap: 8, padding: 12, margin: 16, backgroundColor: Colors.surface, borderRadius: 8, borderWidth: 1, borderColor: Colors.primary },
  creatorText: { color: Colors.primary, fontWeight: '700' },
  actions: { flexDirection: 'row', paddingHorizontal: 16, gap: 12 },
  editBtn: { flex: 1, padding: 10, backgroundColor: Colors.surface, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  editText: { fontWeight: '600', color: Colors.text },
  settingsBtn: { width: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 8, borderWidth: 1, borderColor: Colors.border },
  tabs: { borderBottomWidth: 1, borderColor: Colors.border, flexDirection: 'row' },
  tab: { flex: 1, padding: 16, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderColor: Colors.primary },
  gridItem: { width: GRID_SIZE, height: GRID_SIZE, margin: 0.5 },
  gridImg: { width: '100%', height: '100%', backgroundColor: Colors.surface },
  empty: { padding: 40, alignItems: 'center' },
  text: { color: Colors.textSecondary },
  btn: { backgroundColor: Colors.primary, padding: 12, borderRadius: 8, marginTop: 10 },
  btnText: { color: Colors.text, fontWeight: '600' }
});
