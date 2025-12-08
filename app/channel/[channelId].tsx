import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Grid, Video, Info } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';

import Colors from '@/constants/colors';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

// 👇 Reusable Components (Clean Code)
import ChannelHeader from '@/components/channel/ChannelHeader';
import ChannelVideoCard from '@/components/channel/ChannelVideoCard';

export default function ChannelProfileScreen() {
  const { channelId } = useLocalSearchParams<{ channelId?: string }>();
  const resolvedChannelId = Array.isArray(channelId) ? channelId[0] : channelId ?? '';
  const { user: currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'videos' | 'reels' | 'about'>('videos');

  // 1. Fetch Channel Details
  const { data: channelData, isLoading, isError } = useQuery({
    queryKey: ['channel-profile', resolvedChannelId],
    queryFn: () => api.channels.getChannel(resolvedChannelId), 
    enabled: resolvedChannelId.length > 0,
    select: (data) => data.channel,
  });

  // 2. Fetch Content (Videos/Reels)
  const { data: contentData, isLoading: isLoadingContent } = useQuery({
    queryKey: ['channel-content', resolvedChannelId, activeTab],
    queryFn: async () => {
      if (activeTab === 'videos') return api.channels.getVideos(resolvedChannelId, 1); 
      if (activeTab === 'reels') return api.channels.getReels(resolvedChannelId, 1);
      return { videos: [], reels: [] };
    },
    enabled: resolvedChannelId.length > 0 && activeTab !== 'about', 
  });

  const profile = channelData;
  const isOwnChannel = currentUser?.id === profile?.user_id;
  
  // Extract content array safely
  const content = activeTab === 'reels' 
    ? ((contentData as any)?.reels || []) 
    : ((contentData as any)?.videos || []);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (isError || !profile) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ headerShown: true, headerStyle: { backgroundColor: Colors.background }, headerTintColor: Colors.text }} />
        <Text style={styles.errorText}>Channel not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: profile.name || 'Channel',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ paddingRight: 12 }}>
              <ArrowLeft color={Colors.text} size={24} />
            </TouchableOpacity>
          ),
          // Settings button is already handled inside ChannelHeader for owners, 
          // but if you want it in the top bar specifically:
          headerRight: isOwnChannel ? () => null : undefined, 
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* 1. Header (Handles Subscribe, Stats, Bio automatically) */}
        <ChannelHeader channel={profile} />
        
        {/* 2. Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity style={[styles.tab, activeTab === 'videos' && styles.tabActive]} onPress={() => setActiveTab('videos')}>
            <Grid color={activeTab === 'videos' ? Colors.text : Colors.textMuted} size={24} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.tab, activeTab === 'reels' && styles.tabActive]} onPress={() => setActiveTab('reels')}>
            <Video color={activeTab === 'reels' ? Colors.text : Colors.textMuted} size={24} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.tab, activeTab === 'about' && styles.tabActive]} onPress={() => setActiveTab('about')}>
            <Info color={activeTab === 'about' ? Colors.text : Colors.textMuted} size={24} />
          </TouchableOpacity>
        </View>

        {/* 3. Content Section */}
        {activeTab === 'about' ? (
          <View style={styles.aboutContainer}>
            <Text style={styles.aboutTitle}>About this Channel</Text>
            <Text style={styles.aboutText}>
              {profile.about_text || 'No description provided for this channel.'}
            </Text>
            <Text style={styles.aboutStats}>
                Joined: {new Date(profile.created_at || Date.now()).toLocaleDateString()}
            </Text>
          </View>
        ) : isLoadingContent ? (
          <View style={styles.centerPadding}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : (
          <View style={styles.videosList}>
            {content.length === 0 ? (
              <View style={styles.emptyContent}>
                <Text style={styles.emptyText}>
                  {activeTab === 'reels' ? 'No reels uploaded yet' : 'No videos uploaded yet'}
                </Text>
              </View>
            ) : (
              content.map((item: any) => (
                <ChannelVideoCard 
                    key={item.id} 
                    item={item} 
                    type={activeTab as 'videos' | 'reels'} 
                />
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  centerPadding: { padding: 40, alignItems: 'center' },
  errorText: { color: Colors.textSecondary, fontSize: 16 },
  
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border, marginBottom: 10 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  
  videosList: { paddingVertical: 10 },
  emptyContent: { padding: 64, alignItems: 'center' },
  emptyText: { color: Colors.textSecondary, fontSize: 15 },

  aboutContainer: { padding: 16, backgroundColor: Colors.background },
  aboutTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  aboutText: { fontSize: 14, color: Colors.text, lineHeight: 22, marginBottom: 20 },
  aboutStats: { fontSize: 14, color: Colors.textSecondary, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10 },
});
