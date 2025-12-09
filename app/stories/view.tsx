// app/view.tsx

import React from 'react';
import { useLocalSearchParams, Stack } from 'expo-router'; // Stack import kiya gaya
import StoryPlayer from '@/components/stories/StoryPlayer';

export default function StoryViewScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  
  return (
    <>
      {/* 3. FIX: Header hatane ke liye Stack.Screen ka use */}
      <Stack.Screen options={{ headerShown: false }} />
      <StoryPlayer initialUserId={userId} />
    </>
  );
}
