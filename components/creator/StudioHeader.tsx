import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Edit } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { getMediaUri } from '@/utils/media'; // ✅ FIX: Corrected import and function name
import { formatViews } from '@/utils/format'; 

interface StudioHeaderProps {
  channel: any;
  handleEditChannel: () => void;
}

export default function StudioHeader({ channel, handleEditChannel }: StudioHeaderProps) {
  if (!channel) return null;
  
  // ✅ FIX: Using the correct function getMediaUri
  const avatarUrl = getMediaUri(channel.avatar); 

  return (
    <View style={styles.channelDetailsSection}>
        <Image
          source={{ uri: avatarUrl }} 
          style={styles.channelAvatar}
          contentFit="cover"
        />
        <View style={styles.channelHeaderInfo}>
          <Text style={styles.channelName}>{channel.name}</Text>
          <Text style={styles.channelStats}>
            {formatViews(channel.subscribers_count)} total subscribers
          </Text>
        </View>

        <TouchableOpacity 
            style={styles.editChannelButton} 
            onPress={handleEditChannel} 
        >
            <Edit color={Colors.text} size={18} />
            <Text style={styles.editChannelButtonText}>Edit</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    channelDetailsSection: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: Colors.background, borderBottomWidth: 1, borderBottomColor: Colors.border, justifyContent: 'space-between' },
    channelAvatar: { width: 60, height: 60, borderRadius: 30, marginRight: 16, backgroundColor: Colors.surface, borderWidth: 2, borderColor: Colors.border },
    channelHeaderInfo: { flex: 1, justifyContent: 'center', marginRight: 10 },
    channelName: { fontSize: 24, fontWeight: '800' as const, color: Colors.text },
    channelStats: { fontSize: 15, color: Colors.textSecondary, marginTop: 4 },
    editChannelButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, alignSelf: 'flex-start' },
    editChannelButtonText: { color: Colors.text, fontWeight: '600' as const, fontSize: 14 },
});
