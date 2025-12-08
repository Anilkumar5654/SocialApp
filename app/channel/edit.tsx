import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { ArrowLeft, Save } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';

import Colors from '@/constants/colors';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { getMediaUri } from '@/utils/media';

// Components
import EditChannelHeader from '@/components/channel/EditChannelHeader';
import EditChannelForm from '@/components/channel/EditChannelForm';

const HANDLE_CHANGE_DAYS = 20;
const MILLIS_PER_DAY = 1000 * 60 * 60 * 24;

export default function EditChannelScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // States
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [about, setAbout] = useState('');
  const [newAvatar, setNewAvatar] = useState<string | null>(null);
  const [newCover, setNewCover] = useState<string | null>(null);

  // 1. Fetch Data
  const { data: channel, isLoading } = useQuery({
    queryKey: ['my-channel', user?.id],
    queryFn: async () => {
        const check = await api.channels.checkUserChannel(user?.id || '');
        if (check?.channel?.id) {
            const res = await api.channels.getChannel(check.channel.id);
            return res.channel;
        }
        throw new Error('No channel found');
    },
    enabled: !!user?.id
  });

  // 2. Populate Form
  useEffect(() => {
    if (channel) {
        setName(channel.name); setHandle(channel.handle);
        setBio(channel.bio); setAbout(channel.about_text);
    }
  }, [channel]);

  // 3. Handle Restriction Logic
  const timeDiff = useMemo(() => {
      if (!channel?.last_handle_update) return Infinity;
      return Date.now() - new Date(channel.last_handle_update).getTime();
  }, [channel]);
  
  const canChangeHandle = timeDiff >= (HANDLE_CHANGE_DAYS * MILLIS_PER_DAY);
  const daysRemaining = Math.ceil((HANDLE_CHANGE_DAYS * MILLIS_PER_DAY - timeDiff) / MILLIS_PER_DAY);

  // 4. Media Picker
  const pickMedia = async (type: 'avatar' | 'cover') => {
      const res = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: type === 'avatar' ? [1, 1] : [16, 9],
          quality: 0.7,
      });
      if (!res.canceled && res.assets[0]) {
          if (type === 'avatar') setNewAvatar(res.assets[0].uri);
          else setNewCover(res.assets[0].uri);
      }
  };

  // 5. Update Mutation
  const updateMutation = useMutation({
      mutationFn: async () => {
          const formData = new FormData();
          formData.append('channel_id', channel.id);
          formData.append('name', name);
          formData.append('bio', bio);
          formData.append('about_text', about);
          
          if (handle !== channel.handle && canChangeHandle) {
              formData.append('handle', handle);
              formData.append('updateHandleTime', 'true');
          }

          if (newAvatar) {
              formData.append('avatar', { uri: newAvatar, name: 'avatar.jpg', type: 'image/jpeg' } as any);
          }
          if (newCover) {
              formData.append('cover_photo', { uri: newCover, name: 'cover.jpg', type: 'image/jpeg' } as any);
          }
          
          return api.channels.updateChannel(formData);
      },
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['my-channel'] });
          queryClient.invalidateQueries({ queryKey: ['channel-profile'] });
          Alert.alert('Success', 'Channel updated!');
          setNewAvatar(null); setNewCover(null);
      },
      onError: (e: any) => Alert.alert('Error', e.message)
  });

  if (isLoading || !user) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><ArrowLeft color={Colors.text} size={24} /></TouchableOpacity>
        <Text style={styles.title}>Edit Channel</Text>
        <TouchableOpacity onPress={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? <ActivityIndicator size="small" color={Colors.primary} /> : <Save color={Colors.primary} size={24} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <EditChannelHeader 
            avatarUri={newAvatar || getMediaUri(channel?.avatar)} 
            coverUri={newCover || getMediaUri(channel?.cover_photo)} 
            onPickAvatar={() => pickMedia('avatar')} 
            onPickCover={() => pickMedia('cover')}
            isAvatarPending={!!newAvatar}
            isCoverPending={!!newCover}
        />

        <EditChannelForm 
            name={name} setName={setName} 
            handle={handle} setHandle={setHandle}
            bio={bio} setBio={setBio}
            about={about} setAbout={setAbout}
            canChangeHandle={canChangeHandle}
            daysRemaining={daysRemaining}
        />

        <TouchableOpacity 
            style={[styles.saveBtn, updateMutation.isPending && { opacity: 0.6 }]} 
            onPress={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
        >
            <Text style={styles.saveText}>{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: Colors.border },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text },
  content: { padding: 16, paddingBottom: 40 },
  saveBtn: { backgroundColor: Colors.primary, padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  saveText: { color: Colors.text, fontSize: 16, fontWeight: '700' }
});
