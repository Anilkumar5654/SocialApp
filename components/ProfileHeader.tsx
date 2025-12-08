import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Settings, Sparkles } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { getMediaUri } from '@/utils/media';
import { User } from '@/types'; // Ensure types/index.ts exists

interface ProfileHeaderProps {
  user: User;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const coverUri = getMediaUri(user.cover_photo || user.coverPhoto);
  const avatarUri = getMediaUri(user.avatar);

  return (
    <View style={styles.container}>
      {/* Cover Photo */}
      <Image source={{ uri: coverUri }} style={styles.coverPhoto} contentFit="cover" />

      {/* Info Section */}
      <View style={styles.infoContainer}>
        <Image source={{ uri: avatarUri }} style={styles.avatar} contentFit="cover" />
        
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.posts_count || 0}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.followers_count || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.following_count || 0}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>

      {/* Bio Section */}
      <View style={styles.bioSection}>
        <View style={styles.nameRow}>
            <Text style={styles.name}>{user.name}</Text>
            {user.isVerified && <Text style={styles.verified}>✓</Text>}
        </View>
        <Text style={styles.username}>@{user.username}</Text>
        {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
      </View>

      {/* Creator Studio Button */}
      <TouchableOpacity 
        style={styles.creatorBtn} 
        onPress={() => router.push('/creator-studio')}
      >
        <Sparkles color={Colors.primary} size={20} />
        <Text style={styles.creatorBtnText}>Creator Studio</Text>
      </TouchableOpacity>

      {/* Action Buttons (Edit / Settings) */}
      <View style={styles.actionsRow}>
        <TouchableOpacity 
          style={styles.editBtn} 
          onPress={() => router.push('/edit-profile')}
        >
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.settingsBtn} 
          onPress={() => router.push('/settings')}
        >
          <Settings color={Colors.text} size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 20, borderBottomWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  coverPhoto: { width: '100%', height: 160, backgroundColor: '#333' },
  infoContainer: { flexDirection: 'row', paddingHorizontal: 16, marginTop: -40, alignItems: 'flex-end', justifyContent: 'space-between' },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: Colors.background, backgroundColor: '#333' },
  statsRow: { flexDirection: 'row', gap: 24, paddingBottom: 10 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: Colors.text },
  statLabel: { fontSize: 13, color: Colors.textSecondary },
  bioSection: { paddingHorizontal: 16, marginTop: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 22, fontWeight: '700', color: Colors.text },
  verified: { color: Colors.info, fontSize: 18, fontWeight: 'bold' },
  username: { fontSize: 15, color: Colors.textSecondary },
  bio: { marginTop: 8, color: Colors.text, lineHeight: 20 },
  creatorBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, padding: 12, marginHorizontal: 16, marginTop: 16, backgroundColor: Colors.surface, borderRadius: 8, borderWidth: 1, borderColor: Colors.primary },
  creatorBtnText: { color: Colors.primary, fontWeight: '700' },
  actionsRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 12, gap: 12 },
  editBtn: { flex: 1, padding: 10, backgroundColor: Colors.surface, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  editBtnText: { fontWeight: '600', color: Colors.text },
  settingsBtn: { width: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 8, borderWidth: 1, borderColor: Colors.border }
});
    
