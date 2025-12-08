import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Camera } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface EditChannelHeaderProps {
  avatarUri: string;
  coverUri: string;
  onPickAvatar: () => void;
  onPickCover: () => void;
  isAvatarPending: boolean;
  isCoverPending: boolean;
}

export default function EditChannelHeader({ 
  avatarUri, coverUri, onPickAvatar, onPickCover, isAvatarPending, isCoverPending 
}: EditChannelHeaderProps) {
  return (
    <View style={styles.container}>
        {/* Cover Photo */}
        <View style={styles.coverBox}>
            <Image source={{ uri: coverUri }} style={styles.cover} contentFit="cover" />
            <TouchableOpacity style={styles.camBtn} onPress={onPickCover}>
                <Camera color="white" size={24} />
            </TouchableOpacity>
            {isCoverPending && <Text style={styles.pendingText}>Cover pending</Text>}
        </View>

        {/* Avatar */}
        <View style={styles.avatarBox}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} contentFit="cover" />
            <TouchableOpacity style={styles.avatarCamBtn} onPress={onPickAvatar}>
                <Camera color={Colors.text} size={18} />
            </TouchableOpacity>
            {isAvatarPending && <Text style={styles.pendingTextAvatar}>Avatar pending</Text>}
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 30, alignItems: 'center' },
  coverBox: { width: '100%', height: 120, backgroundColor: Colors.surface, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: -40, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  cover: { width: '100%', height: '100%', opacity: 0.8 },
  camBtn: { position: 'absolute', padding: 8, backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: 20, zIndex: 3 },
  avatarBox: { position: 'relative', width: 100, height: 100 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: Colors.background, backgroundColor: Colors.surface },
  avatarCamBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: Colors.primary, padding: 6, borderRadius: 18, borderWidth: 2, borderColor: Colors.background },
  pendingText: { position: 'absolute', bottom: 5, color: Colors.warning, fontSize: 12, zIndex: 3, fontWeight: '600' },
  pendingTextAvatar: { position: 'absolute', top: -15, right: -40, color: Colors.warning, fontSize: 12, fontWeight: '600' }
});
      
