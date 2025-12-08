import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { router, Stack } from 'expo-router';
import { Plus, Bell, LayoutDashboard, Clapperboard, BarChart2, MessageSquare, DollarSign } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import Colors from '@/constants/colors';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { getMediaUri } from '@/utils/media';

// Clean Components
import StudioHeader from '@/components/creator/StudioHeader';
import DashboardStats from '@/components/creator/DashboardStats';
import RecentContent from '@/components/creator/RecentContent';

export default function CreatorStudioScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Dashboard');

  // 1. Fetch Channel Info
  const { data: channelData } = useQuery({
    queryKey: ['my-channel', user?.id],
    queryFn: async () => {
        const check = await api.channels.checkUserChannel(user?.id || '');
        if (check?.channel?.id) {
            const res = await api.channels.getChannel(check.channel.id);
            return res.channel;
        }
        return null;
    },
    enabled: !!user?.id
  });

  // 2. Fetch Stats
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['creator-stats'],
    queryFn: () => api.creator.getStats(),
  });

  // 3. Fetch Recent Content
  const { data: contentData } = useQuery({
    queryKey: ['creator-recent'],
    queryFn: () => api.creator.getContent('videos', 1),
  });

  const channel = channelData;
  const stats = statsData?.stats;
  const recentVideos = contentData?.content?.slice(0, 3) || []; // Show top 3

  if (isLoading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Top Bar (Fixed) */}
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.topTitle}>Studio</Text>
        <View style={styles.topIcons}>
            <TouchableOpacity onPress={() => router.push('/videos/upload')}><Plus color="#fff" size={26} /></TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/notifications')}><Bell color="#fff" size={24} /></TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/profile')}>
                <Image source={{ uri: getMediaUri(user?.avatar) }} style={styles.miniAvatar} />
            </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'Dashboard' ? (
            <>
                <StudioHeader channel={channel} />
                <DashboardStats stats={stats} />
                <RecentContent data={recentVideos} />
            </>
        ) : (
            <View style={styles.placeholder}>
                <Text style={{color: '#fff'}}>Coming Soon: {activeTab}</Text>
            </View>
        )}
      </ScrollView>

      {/* Bottom Tab Bar (Custom for Studio) */}
      <View style={[styles.bottomTabs, { paddingBottom: insets.bottom + 10 }]}>
        <TabItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'Dashboard'} onPress={() => setActiveTab('Dashboard')} />
        <TabItem icon={Clapperboard} label="Content" active={activeTab === 'Content'} onPress={() => setActiveTab('Content')} />
        <TabItem icon={BarChart2} label="Analytics" active={activeTab === 'Analytics'} onPress={() => setActiveTab('Analytics')} />
        <TabItem icon={MessageSquare} label="Community" active={activeTab === 'Community'} onPress={() => setActiveTab('Community')} />
        <TabItem icon={DollarSign} label="Earn" active={activeTab === 'Earn'} onPress={() => setActiveTab('Earn')} />
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
  center: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderColor: '#222' },
  topTitle: { fontSize: 24, fontWeight: '800', color: Colors.text },
  topIcons: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  miniAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#333' },

  content: { flex: 1 },
  placeholder: { padding: 40, alignItems: 'center' },

  bottomTabs: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#222', backgroundColor: '#000', paddingTop: 12 },
  tabItem: { flex: 1, alignItems: 'center', gap: 4 },
  tabLabel: { fontSize: 10, fontWeight: '500' }
});
