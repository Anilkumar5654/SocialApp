import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { api } from '@/services/api';

// 👇 Reusing the Smart Post Item
import PostItem from '@/components/feed/PostItem';

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();

  // Fetch Single Post Data
  const { data, isLoading, isError } = useQuery({
    queryKey: ['post-detail', postId],
    queryFn: () => api.posts.getPost(postId!),
    enabled: !!postId,
  });

  const post = data?.post;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (isError || !post) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.errorText}>Post not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.btn}>
            <Text style={styles.btnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Custom Header */}
      <Stack.Screen 
        options={{
            headerShown: true,
            title: 'Post',
            headerStyle: { backgroundColor: Colors.background },
            headerTintColor: Colors.text,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={{ paddingRight: 10 }}>
                <ArrowLeft color={Colors.text} size={24} />
              </TouchableOpacity>
            ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 👇 Using the reusable component handles everything (Like, Comment, Share, Modals) */}
        <PostItem post={post} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 20 },
  errorText: { color: Colors.textSecondary, marginBottom: 20, fontSize: 16 },
  btn: { padding: 10, backgroundColor: Colors.surface, borderRadius: 8 },
  btnText: { color: Colors.primary, fontWeight: '600' }
});
