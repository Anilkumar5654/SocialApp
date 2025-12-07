import { Stack } from 'expo-router';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Heart, MessageSquare, UserPlus, AtSign, Video, MessageCircle, Bell } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Colors from '@/constants/colors';
import { api } from '@/services/api'; 

// --- TYPE DEFINITIONS for Notification State (Maps to notifications.type) ---
interface NotificationPreferences {
    allow_global: boolean;
    allow_likes: boolean;      // type: 'like'
    allow_comments: boolean;   // type: 'comment'
    allow_follows: boolean;    // type: 'follow'
    allow_mentions: boolean;   // type: 'mention'
    allow_video_uploads: boolean; // type: 'video'
    allow_dm_requests: boolean; // type: 'dm_request'
}

// Mock API structure for simplicity, assuming api.ts handles the real endpoint:
api.settings.getNotifications = async (): Promise<NotificationPreferences> => {
    await new Promise(resolve => setTimeout(resolve, 500)); 
    return {
        allow_global: true,
        allow_likes: true,
        allow_comments: true,
        allow_follows: true,
        allow_mentions: true,
        allow_video_uploads: true,
        allow_dm_requests: true,
    };
} as any;

// --- Reusable Component for Notification Toggles ---

interface NotificationToggleItemProps {
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  icon: React.ComponentType<{ color?: string; size?: number }>;
  isDisabled: boolean;
  isGlobalOff: boolean;
}

const NotificationToggleItem: React.FC<NotificationToggleItemProps> = ({ 
  title, 
  subtitle, 
  value, 
  onValueChange,
  icon: Icon,
  isDisabled,
  isGlobalOff
}) => {
  const effectiveDisabled = isDisabled || isGlobalOff;
  
  return (
    <View style={[styles.itemContainer, effectiveDisabled && styles.itemDisabled]}>
      <View style={styles.iconContainer}>
        <Icon color={effectiveDisabled ? Colors.textMuted : Colors.text} size={22} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.itemTitle, effectiveDisabled && styles.itemTitleDisabled]}>{title}</Text>
        <Text style={styles.itemSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        onValueChange={onValueChange}
        value={value}
        trackColor={{ false: Colors.textMuted, true: Colors.primary }}
        thumbColor={Colors.text}
        disabled={effectiveDisabled}
      />
    </View>
  );
};

// --- Main Screen Component ---

export default function NotificationsScreen() {
  const queryClient = useQueryClient();

  // 1. Fetch current notification preferences
  const { data: preferences, isLoading, isError } = useQuery<NotificationPreferences>({
    queryKey: ['notificationPreferences'],
    queryFn: api.settings.getNotifications,
  });

  // 2. Mutation for updating preferences
  const mutation = useMutation({
    mutationFn: api.settings.updateNotifications,
    onMutate: async (newPreferences) => {
        // Optimistic update
        await queryClient.cancelQueries({ queryKey: ['notificationPreferences'] });
        const previousPreferences = queryClient.getQueryData<NotificationPreferences>(['notificationPreferences']);
        
        queryClient.setQueryData<NotificationPreferences>(['notificationPreferences'], (old) => ({
            ...old!,
            ...newPreferences,
        }));
        
        return { previousPreferences };
    },
    onError: (err, newPreferences, context) => {
        // Rollback on failure
        queryClient.setQueryData(['notificationPreferences'], context?.previousPreferences);
        Alert.alert('Error', 'Failed to save notification settings.');
    },
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] });
    },
  });

  // Centralized update handler
  const handleUpdate = (key: keyof NotificationPreferences, value: any) => {
    // If turning off global, ensure all sub-toggles are also off in the mutation payload
    let updatePayload: Partial<NotificationPreferences> = { [key]: value };

    if (key === 'allow_global' && value === false) {
        updatePayload = {
            allow_global: false,
            allow_likes: false,
            allow_comments: false,
            allow_follows: false,
            allow_mentions: false,
            allow_video_uploads: false,
            allow_dm_requests: false,
        };
    }
    mutation.mutate(updatePayload);
  };
  
  // --- Loading/Error States ---
  if (isLoading) {
      return (
          <View style={[styles.container, styles.center]}>
              <ActivityIndicator size="large" color={Colors.primary} />
          </View>
      );
  }
  
  if (isError || !preferences) {
       return (
          <View style={[styles.container, styles.center]}>
              <Text style={styles.errorText}>Failed to load notification settings. Try reloading.</Text>
               <TouchableOpacity onPress={() => queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] })}>
                   <Text style={styles.linkButtonText}>Retry</Text>
               </TouchableOpacity>
          </View>
      );
  }

  const isSaving = mutation.isPending;
  const isGlobalOff = !preferences.allow_global;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
        }}
      />
      
      {isSaving && (
          <View style={styles.savingOverlay}>
              <ActivityIndicator color={Colors.text} />
              <Text style={styles.savingText}>Saving...</Text>
          </View>
      )}
      
      <ScrollView style={styles.content}>

        {/* --- 1. General Control --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <NotificationToggleItem
            icon={Bell}
            title="Push Notifications"
            subtitle="Globally enable or disable all push notifications."
            value={preferences.allow_global}
            onValueChange={(val) => handleUpdate('allow_global', val)}
            isDisabled={isSaving}
            isGlobalOff={false} // This toggle cannot be globally off itself
          />
        </View>

        {/* --- 2. Interactions --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interactions</Text>
          <NotificationToggleItem
            icon={Heart}
            title="Likes"
            subtitle="Get notified when someone likes your post or reel."
            value={preferences.allow_likes}
            onValueChange={(val) => handleUpdate('allow_likes', val)}
            isDisabled={isSaving}
            isGlobalOff={isGlobalOff}
          />
          <NotificationToggleItem
            icon={MessageSquare}
            title="Comments"
            subtitle="Get notified when someone comments on your content."
            value={preferences.allow_comments}
            onValueChange={(val) => handleUpdate('allow_comments', val)}
            isDisabled={isSaving}
            isGlobalOff={isGlobalOff}
          />
          <NotificationToggleItem
            icon={AtSign}
            title="Mentions"
            subtitle="Get notified when someone mentions you in a post or comment."
            value={preferences.allow_mentions}
            onValueChange={(val) => handleUpdate('allow_mentions', val)}
            isDisabled={isSaving}
            isGlobalOff={isGlobalOff}
          />
          <NotificationToggleItem
            icon={UserPlus}
            title="New Followers"
            subtitle="Get notified when someone starts following you."
            value={preferences.allow_follows}
            onValueChange={(val) => handleUpdate('allow_follows', val)}
            isDisabled={isSaving}
            isGlobalOff={isGlobalOff}
          />
        </View>

        {/* --- 3. Content & Messaging --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content & Messaging</Text>
          <NotificationToggleItem
            icon={Video}
            title="New Video/Reel Uploads"
            subtitle="Alerts for new content from followed creators."
            value={preferences.allow_video_uploads}
            onValueChange={(val) => handleUpdate('allow_video_uploads', val)}
            isDisabled={isSaving}
            isGlobalOff={isGlobalOff}
          />
          <NotificationToggleItem
            icon={MessageCircle}
            title="Direct Message Requests"
            subtitle="Get notified when someone sends you a message request."
            value={preferences.allow_dm_requests}
            onValueChange={(val) => handleUpdate('allow_dm_requests', val)}
            isDisabled={isSaving}
            isGlobalOff={isGlobalOff}
          />
        </View>
        
        {/* --- 4. Other Settings Link --- */}
        <View style={styles.section}>
            <Text style={styles.infoText}>
                Email and SMS notification settings are managed separately in the web interface.
            </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
      justifyContent: 'center',
      alignItems: 'center',
  },
  errorText: {
       color: Colors.danger,
      fontSize: 16,
      marginBottom: 10,
  },
  linkButtonText: {
      color: Colors.primary,
      fontWeight: '600' as const,
  },
  content: {
    paddingBottom: 40,
  },
  // --- Saving Overlay ---
  savingOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingText: {
      color: Colors.text,
      marginTop: 8,
      fontSize: 16,
  },
  // --- Section Styles ---
  section: {
    paddingVertical: 8,
    borderBottomWidth: 8,
    borderBottomColor: Colors.surface,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingVertical: 12,
    letterSpacing: 0.5,
  },
  // --- Item Container Styles ---
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  itemDisabled: {
       opacity: 0.5,
  },
  itemTitleDisabled: {
      color: Colors.textMuted,
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  contentContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  itemSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textMuted,
    paddingHorizontal: 16,
    paddingVertical: 10,
    textAlign: 'center',
  }
});
