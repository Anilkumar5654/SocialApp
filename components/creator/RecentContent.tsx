import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { getMediaUri } from '@/utils/media';
import { formatTimeAgo } from '@/constants/timeFormat';

export default function RecentContent({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Latest videos</Text>
      
      {data.map((item) => (
        <TouchableOpacity key={item.id} style={styles.item}>
            <Image 
                source={{ uri: getMediaUri(item.thumbnail_url || item.thumbnailUrl) }} 
                style={styles.thumb} 
                contentFit="cover"
            />
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>{item.title || 'Untitled Video'}</Text>
                <Text style={styles.date}>{formatTimeAgo(item.created_at)}</Text>
            </View>
            <ChevronRight size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  item: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, backgroundColor: Colors.background },
  thumb: { width: 100, height: 56, borderRadius: 8, backgroundColor: '#333' },
  info: { flex: 1, marginLeft: 12 },
  title: { fontSize: 15, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  date: { fontSize: 13, color: Colors.textSecondary },
});
