import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar, RefreshControl, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { Plus, Bell, LayoutDashboard, Clapperboard, BarChart2, MessageSquare, DollarSign } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import Colors from '@/constants/colors';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { getMediaUri } from '@/utils/media';

// 👇 Clean Components
import StudioHeader from '@/components/creator/StudioHeader'; // (Updated in last step)
import DashboardView from '@/components/creator/dashboards/DashboardView'; // New View
import EarningsView from '@/components/creator/earnings/EarningsView'; // New View
// Import other views: ContentView, AnalyticsView, etc.

type StudioTab = 'Dashboard' | 'Content' | 'Analytics' | 'Community' | 'Earn';

const TARGET_SUBS = 1000;
const TARGET_WATCH_HOURS = 4000;

export default function CreatorStudioScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<StudioTab>('Dashboard');
  const [refreshing, setRefreshing] = useState(false);
  
  // 1. Fetch All Data (Combined Query)
  const { data: creatorData, isLoading, refetch } = useQuery({
    queryKey: ['creator-full-data', user?.id],
    queryFn: async () => {
        const [channelRes, statsRes, earningsRes, contentRes] = await Promise.all([
            api.channels.checkUserChannel(user?.id || '').then(res => res.data || null),
            api.creator.getStats().catch(() => ({ stats: {} })),
            api.creator.getEarnings('month').catch(() => ({ earnings: {} })),
            api.creator.getContent('videos', 1).catch(() => ({ content: [] })),
        ]);
        return { channel: channelRes, stats: statsRes.stats, earnings: earningsRes.earnings, recentVideos: contentRes.content };
    },
    enabled: !!user?.id,
  });

  const channel = creatorData?.channel;
  const stats = creatorData?.stats;
  const earnings = creatorData?.earnings;
  const recentVideos = creatorData?.recentVideos?.slice(0, 3) || [];
  
  const isMonetized = !!(channel?.is_monetization_enabled);
  const currentSubs = channel?.subscribers_count || 0;
  const currentWatchHours = channel?.monetization_watch_hours || 0;

  // Derived Values
  const availableEarnings = (earnings?.total_earnings || 0) - (earnings?.pending_earnings || 0) - (earnings?.paid_earnings || 0);
  const canWithdraw = availableEarnings >= 100;
  
  const handleApplyMonetization = () => {
      Alert.alert("Application Sent", "Your channel is under review.");
  };

  const onRefresh = useCallback(() => {
      setRefreshing(true);
      refetch().then(() => setRefreshing(false));
  }, []);

  const renderContent = () => {
      if (isLoading) return <ActivityIndicator color={Colors.primary} size="large" style={styles.loader} />;
      if (!channel) return <Text style={styles.errorText}>No Channel Found. Please Create One.</Text>;

      switch (activeTab) {
          case 'Dashboard':
              return <DashboardView stats={stats} recentContent={recentVideos} isLoading={isLoading} />;
          
          case 'Content':
              // Placeholder for ContentView
              return <View style={styles.placeholder}><Text style={styles.placeholderText}>Content List (Videos/Reels/Posts) here</Text></View>;

          case 'Earnings':
              return (
                  <EarningsView 
                      channel={channel}
                      earnings={earnings} 
                      isMonetized={isMonetized} 
                      availableEarnings={availableEarnings}
                      currentSubs={currentSubs}
                      currentWatchHours={currentWatchHours}
                      canWithdraw={canWithdraw}
                      handleApplyMonetization={handleApplyMonetization}
                  />
              );

          default:
              return <View style={styles.placeholder}><Text style={styles.placeholderText}>Coming Soon: {activeTab}</Text></View>;
      }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Top Bar (Header) */}
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.topTitle}>Studio</Text>
        <View style={styles.topIcons}>
            <TouchableOpacity onPress={() => router.push('/videos/upload')}><Plus color={Colors.text} size={26} /></TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/notifications')}><Bell color={Colors.text} size={24} /></TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/profile')}>
                <Image source={{ uri: getMediaUri(user?.avatar) }} style={styles.miniAvatar} />
            </TouchableOpacity>
        </View>
      </View>
      
      {/* Scrollable Content */}
      <ScrollView 
          style={styles.mainContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {channel && <StudioHeader channel={channel} />}
        {renderContent()}
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
  errorText: { color: Colors.text, fontSize: 16, textAlign: 'center', marginTop: 50 },
  
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderColor: Colors.border },
  topTitle: { fontSize: 24, fontWeight: '800', color: Colors.text },
  topIcons: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  miniAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#333' },

  mainContent: { flex: 1 },
  loader: { padding: 20, alignItems: 'center' },
  placeholder: { padding: 40, alignItems: 'center', flex: 1, justifyContent: 'center' },
  placeholderText: { color: Colors.textSecondary, fontSize: 16 },

  bottomTabs: { flexDirection: 'row', borderTopWidth: 1, borderColor: Colors.border, backgroundColor: '#000', paddingTop: 12 },
  tabItem: { flex: 1, alignItems: 'center', gap: 4 },
  tabLabel: { fontSize: 10, fontWeight: '500' }
});
