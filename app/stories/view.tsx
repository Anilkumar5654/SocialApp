import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import StoryPlayer from '@/components/stories/StoryPlayer';

export default function StoryViewScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  // Sara logic ab StoryPlayer ke andar hai
  return <StoryPlayer initialUserId={userId} />;
}
