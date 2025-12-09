// app/create.tsx

import React from 'react';
import { Stack } from 'expo-router'; // Stack import kiya gaya
import StoryUploader from '@/components/stories/StoryUploader';

export default function CreateStoryScreen() {
  return (
    <>
      {/* 3. FIX: Header hatane ke liye Stack.Screen ka use */}
      <Stack.Screen options={{ headerShown: false }} />
      <StoryUploader />
    </>
  );
}
