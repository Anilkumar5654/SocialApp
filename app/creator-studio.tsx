import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar, RefreshControl, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { Plus, Bell, LayoutDashboard, Clapperboard, BarChart2, MessageSquare, DollarSign } from 'lucide-react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import Colors from '@/constants/colors';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { getMediaUri } from '@/utils/media';

// --- CLEAN COMPONENTS ---
import CustomFixedHeader from '@/components/creator/micro/CustomFixedHeader';
import CreateChannelForm from '@/components/creator/forms/CreateChannelForm';
import StudioHeader from '@/components/creator/StudioHeader';

// --- TAB VIEWS ---
import DashboardView from '@/components/creator/dashboards/DashboardView';
import ContentView from '@/components/creator/content/ContentView';
import EarningsView from '@/components/creator/earnings/EarningsView';
import AnalyticsView from '@/components/creator/analytics/AnalyticsView';
import CommunityView from '@/components/creator/community/CommunityView';

type StudioTab = 'Dashboard' | 'Content' | 'Analytics' | 'Community' | 'Earnings';

export default function CreatorStudioScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Local UI States
  const [activeTab, setActiveTab] = useState<StudioTab>('Dashboard');
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  
  // Form States (for Create Channel)
  const [channelName, setChannelName] = useState('');
  const [channelDescription, setChannelDescription] = useState('');
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);

  // --- MONETIZATION CONSTANTS (Source: 250, 252) ---
  const TARGET_SUBS = 1000;
  const TARGET_WATCH_HOURS = 4000;

  // 1. Fetch All Data (Combined Query)
  const { data: creatorData, isLoading, refetch, isError } = useQuery({
    queryKey: ['creator-full-data', user?.id],
    queryFn: async () => {
        // Fetch all necessary data points
        const [channelRes, statsRes, earningsRes, contentRes] = await Promise.all([
            api.channels.checkUserChannel(user?.id || '').then(res => res.data || null).catch(() => ({})),
            api.creator.getStats().catch(() => ({ stats: {} })),
            api.creator.getEarnings('month').catch(() => ({ earnings: {} })),
            api.creator.getContent('all', 1).catch(() => ({ content: [] })),
        ]);
        
        // Group content for the Content Tab view
        const allContent = contentRes.content || [];
        
        return { 
            channel: channelRes.channel, 
            stats: statsRes.stats, 
            earnings: earningsRes.earnings, 
            recentVideos: allContent.filter((c: any) => c.type === 'video').slice(0, 3), 
            allContent: {
                posts: allContent.filter((c: any) => c.type === 'post'),
                reels: allContent.filter((c: any) => c.type === 'reel'),
                videos: allContent.filter((c: any) => c.type === 'video'),
            }
        };
    },
    enabled: !!user?.id,
  });

  const channel = creatorData?.channel;
  const stats = creatorData?.stats || {};
  const earnings = creatorData?.earnings || {};
  const recentVideos = creatorData?.recentVideos || [];
  const allContent = creatorData?.allContent || { posts: [], reels: [], videos: [] };
  
  // Derived Values
  const isMonetized = !!(channel?.is_monetization_enabled);
  const currentSubs = channel?.subscribers_count || 0;
  const currentWatchHours = channel?.monetization_watch_hours || 0;
  const availableEarnings = (earnings.total_earnings || 0) - (earnings.pending_earnings || 0) - (earnings.paid_earnings || 0);
  const canWithdraw = availableEarnings >= 100;

  // Handlers
  const handleEditChannel = () => router.push('/channel/edit');
  const handleUploadVideo = () => router.push('/videos/upload');
  
  const handleContentPress = (type: 'post' | 'reel' | 'video', id: string) => {
    if (type === 'post') router.push(`/post/${id}`);
    if (type === 'reel') router.push('/reels');
    if (type === 'video') router.push(`/videos/player?videoId=${id}`);
  };

  const handleDeleteContent = async (item: any) => {
      Alert.alert('Delete', 'Are you sure you want to delete this content?', [
          { text: 'Cancel' },
          { text: 'Delete', style: 'destructive', onPress: async () => {
              const deleteApi = item.type === 'video' ? api.videos.delete(item.id) : api.reels.delete(item.id);
              await deleteApi;
              queryClient.invalidateQueries({ queryKey: ['creator-full-data'] });
              Alert.alert('Success', `${item.type} deleted.`);
          }}
      ]);
  };

  const handleCreateChannel = async () => { 
      if (!channelName.trim()) return Alert.alert('Error', 'Please enter a channel name');
      setIsCreatingChannel(true); 
      try { 
          const response: any = await api.channels.create({ name: channelName, description: channelDescription });
          if (response.channel) { 
              Alert.alert('Success', 'Channel created successfully!'); 
              queryClient.invalidateQueries({ queryKey: ['creator-full-data'] });
              setShowCreateChannel(false); 
          } 
      } catch (error: any) { 
          Alert.alert('Error', error.message || 'Failed to create channel');
      } finally { 
          setIsCreatingChannel(false); 
      } 
  };
  
  const handleApplyMonetization = () => Alert.alert("Application Sent", "Your channel is under review.");

  const onRefresh = useCallback(() => {
      setRefreshing(true);
      queryClient.invalidateQueries({ queryKey: ['creator-full-data'] });
      refetch().then(() => setRefreshing(false));
  }, [refetch]);

  const renderContent = () => {
      if (isLoading && !isError) return <ActivityIndicator color={Colors.primary} size="large" style={styles.loader} />;
      if (isError) return <Text style={styles.errorText}>Failed to load creator data.</Text>;
      
      switch (activeTab) {
          case 'Dashboard':
              return <DashboardView stats={stats} recentContent={recentVideos} isLoading={isLoading} currentWatchHours={currentWatchHours} handleContentPress={handleContentPress} />;
          
          case 'Content':
              return <ContentView posts={allContent.posts} reels={allContent.reels} videos={allContent.videos} handleContentPress={handleContentPress} handleDelete={handleDeleteContent} />;

          case 'Earnings':
              return <EarningsView channel={channel} earnings={earnings} isMonetized={isMonetized} availableEarnings={availableEarnings} currentSubs={currentSubs} currentWatchHours={currentWatchHours} canWithdraw={canWithdraw} handleApplyMonetization={handleApplyMonetization} />;

          case 'Analytics':
              return <AnalyticsView />;
              
          case 'Community':
              return <CommunityView />;
              
          default:
              return <Text style={styles.placeholderText}>Coming Soon.</Text>;
      }
  };

  if (showCreateChannel) {
      return (
          <CreateChannelForm 
              channelName={channelName} setChannelName={setChannelName}
              channelDescription={channelDescription} setChannelDescription={setChannelDescription}
              isCreatingChannel={isCreatingChannel}
              handleCreateChannel={handleCreateChannel}
              handleCancel={() => setShowCreateChannel(false)}
          />
      );
  }

  if (!channel && !isLoading) {
    return (
        <View style={styles.container}>
          <CustomFixedHeader user={user} onUploadPress={handleUploadVideo} />
          <View style={[styles.centerContent, { flex: 1 }]}>
            <Text style={styles.noChannelTitle}>No Channel Found</Text>
            <TouchableOpacity style={styles.createChannelButton} onPress={() => setShowCreateChannel(true)}>
                <Text style={styles.createChannelButtonText}>Create Channel</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <Stack.Screen options={{ headerShown: false }} />

      <CustomFixedHeader user={user} onUploadPress={handleUploadVideo} />
      
      <ScrollView 
          style={styles.mainContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {channel && <StudioHeader channel={channel} handleEditChannel={handleEditChannel} />}
        <View style={{minHeight: 500}}>
          {renderContent()}
        </View>
      </ScrollView>

      {/* Bottom Tab Bar (Custom for Studio) */}
      <View style={[styles.bottomTabs, { paddingBottom: insets.bottom + 10 }]}>
        <TabItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'Dashboard'} onPress={() => setActiveTab('Dashboard')} />
        <TabItem icon={Clapperboard} label="Content" active={activeTab === 'Content'} onPress={() => setActiveTab('Content')} />
        <TabItem icon={BarChart2} label="Analytics" active={activeTab === 'Analytics'} onPress={() => setActiveTab('Analytics')} />
        <TabItem icon={MessageSquare} label="Community" active={activeTab === 'Community'} onPress={() => setActiveTab('Community')} />
        <TabItem icon={DollarSign} label="Earn" active={activeTab === 'Earnings'} onPress={() => setActiveTab('Earnings')} />
      </View>
    </View>
  );
}

// Helper Component for Tabs
const TabItem = ({ icon: Icon, label, active, onPress }: any) => (
    <TouchableOpacity style={styles.tabItem} onPress={onPress}>
        <Icon size={22} color={active ? Colors.primary : Colors.textSecondary} />
        <Text style={[styles.tabLabel, { color: active ? Colors.primary : Colors.textSecondary }]}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centerContent: { justifyContent: 'center', alignItems: 'center', padding: 32 },
  noChannelTitle: { fontSize: 24, fontWeight: '700' as const, color: Colors.text, marginTop: 24, marginBottom: 8, textAlign: 'center' },
  createChannelButton: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  createChannelButtonText: { fontSize: 16, fontWeight: '700' as const, color: Colors.text },

  mainContent: { flex: 1 },
  loader: { padding: 20, alignItems: 'center' },
  placeholder: { padding: 40, alignItems: 'center', flex: 1, justifyContent: 'center' },
  placeholderText: { color: Colors.textSecondary, fontSize: 16 },

  bottomTabs: { flexDirection: 'row', borderTopWidth: 1, borderColor: Colors.border, backgroundColor: '#000', paddingTop: 12 },
  tabItem: { flex: 1, alignItems: 'center', gap: 4 },
  tabLabel: { fontSize: 10, fontWeight: '500' }
});
