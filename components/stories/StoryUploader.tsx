// components/stories/StoryUploader.tsx

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, TextInput, KeyboardAvoidingView, ActivityIndicator, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Image as ImageIcon, Video as VideoIcon, Send, Camera, RefreshCcw } from 'lucide-react-native';

import { api } from '@/services/api';
import Colors from '@/constants/colors';
import { useToast } from '@/contexts/ToastContext'; // Assuming this hook is available

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function StoryUploader() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const videoRef = useRef<Video>(null);
  const toast = useToast();

  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState<{ uri: string; type: 'image' | 'video'; mimeType: string; duration?: number; } | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (data: { media: typeof media; caption: string }) => {
      if (!data.media) throw new Error("No media");
      const formData = new FormData();
      const uriParts = data.media.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      const mediaFile: any = {
        uri: Platform.OS === 'ios' ? data.media.uri.replace('file://', '') : data.media.uri,
        name: `upload.${fileType}`,
        type: data.media.mimeType || (data.media.type === 'video' ? 'video/mp4' : 'image/jpeg'),
      };
      formData.append('file', mediaFile);
      if (data.caption.trim()) formData.append('caption', data.caption.trim());
      formData.append('media_type', data.media.type);
      if (data.media.duration) formData.append('duration', Math.round(data.media.duration).toString());
      return api.stories.upload(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      toast.show('Your story is live!', 'success'); // Replaced Alert
      router.back();
    },
    onError: (err: any) => {
      toast.show(`Failed to upload story: ${err.message}`, 'error'); // Replaced Alert
    },
  });

  const handlePick = async (mode: 'camera' | 'library', type: 'image' | 'video' | 'all') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      toast.show('Permission needed to access media library.', 'info'); 
      return; 
    }
    
    const opts: ImagePicker.ImagePickerOptions = {
        mediaTypes: type === 'video' ? ImagePicker.MediaTypeOptions.Videos : type === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.All,
        allowsEditing: true, quality: 0.8, videoMaxDuration: 60, aspect: [9, 16],
    };
    const res = mode === 'camera' ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    
    if (!res.canceled && res.assets[0]) {
        const asset = res.assets[0];
        setMedia({ uri: asset.uri, type: asset.type === 'video' ? 'video' : 'image', mimeType: asset.mimeType || 'image/jpeg', duration: asset.duration ? asset.duration / 1000 : undefined });
    }
  };

  if (!media) {
    // Selection View
    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}><TouchableOpacity onPress={() => router.back()}><X color="#fff" size={32} /></TouchableOpacity><Text style={styles.title}>Add to Story</Text><View style={{width:32}} /></View>
            <View style={styles.center}>
                <Text style={styles.hint}>Share your moments</Text>
                <View style={styles.grid}>
                    <TouchableOpacity style={styles.card} onPress={() => handlePick('camera', 'all')}><View style={[styles.circle, {backgroundColor:Colors.primary}]}><Camera color="#fff" size={32}/></View><Text style={styles.label}>Camera</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.card} onPress={() => handlePick('library', 'image')}><View style={[styles.circle, {backgroundColor:'#405DE6'}]}><ImageIcon color="#fff" size={32}/></View><Text style={styles.label}>Photos</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.card} onPress={() => handlePick('library', 'video')}><View style={[styles.circle, {backgroundColor:'#F56040'}]}><VideoIcon color="#fff" size={32}/></View><Text style={styles.label}>Videos</Text></TouchableOpacity>
                </View>
            </View>
        </View>
    );
  }

  // Preview View
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
                {media.type === 'video' ? (
                    <Video ref={videoRef} source={{ uri: media.uri }} style={styles.preview} resizeMode={ResizeMode.COVER} shouldPlay isLooping />
                ) : (
                    <Image source={{ uri: media.uri }} style={styles.preview} contentFit="cover" />
                )}
                <View style={[styles.topActions, { top: insets.top + 10 }]}>
                    <TouchableOpacity onPress={() => { setMedia(null); setCaption(''); }} style={styles.glassBtn}><X color="#fff" size={24} /></TouchableOpacity>
                    <TouchableOpacity onPress={() => handlePick('library', media.type)} style={styles.glassBtn}><RefreshCcw color="#fff" size={20} /></TouchableOpacity>
                </View>
                <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 10 }]}>
                    <View style={styles.captionBox}>
                        <TextInput style={styles.input} placeholder="Write a caption..." placeholderTextColor="#ccc" value={caption} onChangeText={setCaption} multiline maxLength={150} />
                        <Text style={styles.count}>{caption.length}/150</Text>
                    </View>
                    <TouchableOpacity style={[styles.sendBtn, uploadMutation.isPending && {opacity:0.5}]} 
                      onPress={() => uploadMutation.mutate({ media, caption })} disabled={uploadMutation.isPending}>
                        {uploadMutation.isPending ?
                        <ActivityIndicator color="#000" /> : <><Text style={styles.sendText}>Share</Text><Send color="#000" size={18} /></>}
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 40 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 100 },
  hint: { color: '#aaa', fontSize: 16, marginBottom: 30 },
  grid: { flexDirection: 'row', gap: 20 },
  card: { width: 100, height: 120, backgroundColor: '#1A1A1A', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333' },
  circle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  label: { color: '#fff', fontWeight: '600' },
  preview: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, position: 'absolute' },
  topActions: { position: 'absolute', left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' },
  glassBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  bottomActions: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, justifyContent: 'flex-end', gap: 16 },
  captionBox: { backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  input: { color: '#fff', fontSize: 16, maxHeight: 100 },
  count: { color: '#aaa', fontSize: 10, alignSelf: 'flex-end' },
  sendBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 30, height: 56, gap: 8 }
});
