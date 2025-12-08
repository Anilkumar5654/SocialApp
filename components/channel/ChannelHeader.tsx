import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Settings } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { getMediaUri } from '@/utils/media';
import { formatViews } from '@/utils/format';
import { useAuth } from '@/contexts/AuthContext';

// Reuse Components
import SubscribeBtn from '@/components/buttons/SubscribeBtn';
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

interface ChannelHeaderProps {
  channel: any;
}

export default function ChannelHeader({ channel }: ChannelHeaderProps) {
  const { user } = useAuth();
  const isOwner = String(user?.id) === String(channel.user_id);

  return (
    <View style={styles.container}>
      {/* Cover Image */}
      <Image source={{ uri: getMediaUri(channel.cover_photo) }} style={styles.cover} contentFit="cover" />

      <View style={styles.content}>
        {/* Avatar & Info */}
        <View style={styles.headerRow}>
            <Image source={{ uri: getMediaUri(channel.avatar) }} style={styles.avatar} />
            <View style={styles.info}>
                <Text style={styles.name}>{channel.name}</Text>
                <Text style={styles.handle}>@{channel.username || 'handle'}</Text>
                <Text style={styles.stats}>
                    {formatViews(channel.subscribers_count)} subscribers · {channel.videos_count || 0} videos
                </Text>
            </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionArea}>
            {isOwner ? (
                <View style={styles.ownerBtns}>
                    <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/creator-studio')}>
                        <Text style={styles.editBtnText}>Manage Channel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/settings')}>
                        <Settings color={Colors.text} size={24} />
                    </TouchableOpacity>
                </View>
            ) : (
                <SubscribeBtn 
                    channelId={channel.id} 
                    isSubscribed={channel.is_subscribed} 
                    style={styles.subBtnFull}
                />
            )}
        </View>

        {/* Bio / Description */}
        {channel.description && (
            <Text style={styles.bio} numberOfLines={2}>{channel.description}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.background, marginBottom: 10 },
  cover: { width: '100%', height: 120, backgroundColor: '#222' },
  content: { padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: -40 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: Colors.background, backgroundColor: '#333' },
  info: { paddingTop: 20, flex: 1 },
  name: { fontSize: 20, fontWeight: '700', color: Colors.text },
  handle: { fontSize: 13, color: Colors.textSecondary },
  stats: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  actionArea: { marginTop: 16 },
  subBtnFull: { width: '100%', paddingVertical: 10 },
  ownerBtns: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  editBtn: { flex: 1, backgroundColor: '#333', paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
  editBtnText: { color: '#fff', fontWeight: '600' },
  bio: { marginTop: 12, color: Colors.textSecondary, fontSize: 13, lineHeight: 18 }
});
  
