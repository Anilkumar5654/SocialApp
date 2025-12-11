import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthContext } from '@/contexts/AuthContext'; 

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerBackTitle: 'Back' }}>
        
        {/* --- AUTHENTICATION --- */}
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
        <Stack.Screen name="auth/forgot-password" options={{ headerShown: false }} />
        
        {/* --- MAIN TABS (Home, Reels, etc.) --- */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* --- COMMON FEATURES (Modals) --- */}
        <Stack.Screen
          name="search"
          options={{ headerShown: false, presentation: 'modal' }}
        />
        <Stack.Screen
          name="notifications"
          options={{ headerShown: false, presentation: 'modal' }}
        />
        <Stack.Screen
          name="messages"
          options={{ headerShown: false, presentation: 'modal' }}
        />

        {/* --- 🛠️ CRITICAL FIXES FOR WHITE FLASH --- */}

        {/* 1. Settings (app/settings/index.tsx) */}
        <Stack.Screen
          name="settings"
          options={{ headerShown: false, presentation: 'modal' }}
        />

        {/* 2. Edit Profile (app/profile/edit.tsx) */}
        <Stack.Screen
          name="profile/edit"
          options={{ headerShown: false, presentation: 'modal' }}
        />

        {/* 3. User Profile (app/user/[userId].tsx) */}
        <Stack.Screen 
          name="user/[userId]" 
          options={{ headerShown: false }} 
        />

        {/* --- CREATOR TOOLS --- */}
        <Stack.Screen
          name="creator"
          options={{ headerShown: false, presentation: 'modal' }}
        />
        <Stack.Screen 
          name="creator/video/analytics" 
          options={{ headerShown: false, presentation: 'modal' }} 
        />

        {/* --- ADMIN & DEBUG --- */}
        <Stack.Screen name="admin" options={{ headerShown: false }} />
        <Stack.Screen
          name="api-debug"
          options={{ headerShown: false, presentation: 'modal' }}
        />

        {/* --- MEDIA PLAYERS --- */}
        <Stack.Screen
          name="videos/player"
          options={{ headerShown: false, presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="stories/view"
          options={{ headerShown: false, presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="stories/create"
          options={{ headerShown: false, presentation: 'modal' }}
        />

      </Stack>
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext> 
        <GestureHandlerRootView style={styles.container}>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </AuthContext>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
