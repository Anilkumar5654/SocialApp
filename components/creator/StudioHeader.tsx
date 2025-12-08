import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Edit3 } from 'lucide-react-native'; // Edit icon
import Colors from '@/constants/colors';
import { getMediaUri } from '@/utils/media';
import { formatViews } from '@/utils/format';

interface StudioHeaderProps {
  channel: any;
}

export default function StudioHeader({ channel }: StudioHeaderProps) {
  if (!channel) return null;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Image 
            source={{ uri: getMediaUri(channel.avatar) }} 
            style={styles.avatar} 
            contentFit="cover"
        />
        <View style={styles.info}>
            <Text style={styles.name}>{channel.name}</Text>
            <Text style={styles.subs}>{formatViews(channel.subscribers_count)} total subscribers</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.editBtn} 
        onPress={() => router.push('/channel/edit')}
      >
        <Edit3 size={16} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.editText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: Colors.background,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 1, borderColor: '#333' },
  info: { justifyContent: 'center' },
  name: { fontSize: 18, fontWeight: '700', color: Colors.text },
  subs: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  editBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#333', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 8 
  },
  editText: { color: '#fff', fontWeight: '600', fontSize: 14 }
});
