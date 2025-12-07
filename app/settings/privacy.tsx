import { Stack, router } from 'expo-router';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Users, EyeOff, MessageSquare, Activity, UserPlus } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Colors from '@/constants/colors';
import { api } from '@/services/api'; 

// --- TYPE DEFINITIONS for Privacy State ---
interface PrivacySettings {
    is_private_account: boolean;
    posts_visibility: 'public' | 'followers'; // Maps to posts.feed_scope
    reels_visibility: 'public' | 'followers'; // Maps to reels.visibility
    allow_comments: 'everyone' | 'followers' | 'following';
    show_activity_status: boolean; // Maps to users.last_active logic
}

// --- Reusable Component for Toggle Switches ---
interface SettingToggleItemProps {
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  icon: React.ComponentType<{ color?: string; size?: number }>;
  isDisabled: boolean;
}

const SettingToggleItem: React.FC<SettingToggleItemProps> = ({ 
  title, 
  subtitle, 
  value, 
  onValueChange,
  icon: Icon,
  isDisabled
}) => {
  return (
    <View style={[styles.itemContainer, isDisabled && styles.itemDisabled]}>
      <View style={styles.iconContainer}>
        <Icon color={isDisabled ? Colors.textMuted : Colors.text} size={22} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.itemTitle, isDisabled && styles.itemTitleDisabled]}>{title}</Text>
        <Text style={styles.itemSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        onValueChange={onValueChange}
        value={value}
        trackColor={{ false: Colors.textMuted, true: Colors.primary }}
        thumbColor={Colors.text}
        disabled={isDisabled}
      />
    </View>
  );
};

// --- Component for Radio Button Group ---
interface RadioOption {
    label: string;
    value: string;
}

interface RadioGroupItemProps {
    title: string;
    options: RadioOption[];
    selectedValue: string;
    onSelect: (value: string) => void;
    isDisabled: boolean;
}

const RadioGroupItem: React.FC<RadioGroupItemProps> = ({ 
    title, 
    options, 
    selectedValue, 
    onSelect,
    isDisabled
}) => {
    return (
        <View style={styles.radioGroup}>
            <Text style={[styles.radioGroupTitle, isDisabled && styles.itemTitleDisabled]}>{title}</Text>
            {options.map((option) => (
                <TouchableOpacity
                    key={option.value}
                    style={styles.radioOption}
                    onPress={() => !isDisabled && onSelect(option.value)}
                    disabled={isDisabled}
                >
                    <Text style={[styles.radioLabel, isDisabled && styles.itemTitleDisabled]}>{option.label}</Text>
                    <View style={[styles.radioButton, isDisabled && styles.radioDisabled]}>
                        {selectedValue === option.value && (
                            <View style={styles.radioButtonInner} />
                        )}
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );
};

// --- Main Screen Component ---

export default function PrivacySettingsScreen() {
  const queryClient = useQueryClient();

  // 1. Fetch current settings state using the finalized API call
  const { data: settings, isLoading, isError } = useQuery<PrivacySettings>({
    queryKey: ['privacySettings'],
    queryFn: api.settings.getPrivacySettings,
  });

  // 2. Mutation for updating settings using the finalized API call
  const mutation = useMutation({
    mutationFn: api.settings.updatePrivacySettings,
    onMutate: async (newSettings) => {
        // Optimistic update: Save previous value and update cache immediately
        await queryClient.cancelQueries({ queryKey: ['privacySettings'] });
        const previousSettings = queryClient.getQueryData<PrivacySettings>(['privacySettings']);
        
        queryClient.setQueryData<PrivacySettings>(['privacySettings'], (old) => ({
            ...old!,
            ...newSettings,
        }));
        
        return { previousSettings };
    },
    onError: (err, newSettings, context) => {
        // Rollback to previous state on failure
        queryClient.setQueryData(['privacySettings'], context?.previousSettings);
        Alert.alert('Error', 'Failed to save settings. Please try again.');
    },
    onSettled: () => {
        // Invalidate to ensure consistency
        queryClient.invalidateQueries({ queryKey: ['privacySettings'] });
    },
  });

  // 3. Centralized update handler
  const handleUpdate = (key: keyof PrivacySettings, value: any) => {
    mutation.mutate({ [key]: value });
  };
  
  // --- Loading/Error States ---
  if (isLoading) {
      return (
          <View style={[styles.container, styles.center]}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading privacy settings...</Text>
          </View>
      );
  }
  
  if (isError || !settings) {
       return (
          <View style={[styles.container, styles.center]}>
              <Text style={styles.errorText}>Failed to load settings. Try reloading.</Text>
               <TouchableOpacity onPress={() => queryClient.invalidateQueries({ queryKey: ['privacySettings'] })}>
                   <Text style={styles.linkButtonText}>Retry</Text>
               </TouchableOpacity>
          </View>
      );
  }
  
  const isSaving = mutation.isPending;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Privacy Settings',
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

        {/* --- 1. Account Privacy --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Privacy</Text>
          <SettingToggleItem
            icon={EyeOff}
            title="Private Account"
            subtitle="Only approved followers can see your profile and content."
            value={settings.is_private_account}
            onValueChange={(val) => handleUpdate('is_private_account', val)}
            isDisabled={isSaving}
          />
          {settings.is_private_account && (
            <TouchableOpacity 
                style={styles.linkedItem}
                onPress={() => router.push('/settings/privacy/requests')}
            >
                <UserPlus color={Colors.primary} size={20} style={styles.linkedIcon} />
                <Text style={styles.linkedItemText}>Review Follower Requests</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* --- 2. Content Visibility (Schema Driven) --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content Visibility</Text>
          <RadioGroupItem
            title="Who Can See My Posts"
            options={[
              { label: 'Everyone (Public)', value: 'public' },
              { label: 'Followers Only', value: 'followers' },
            ]}
            selectedValue={settings.posts_visibility}
            onSelect={(val) => handleUpdate('posts_visibility', val as 'public' | 'followers')}
            isDisabled={isSaving}
          />
          <RadioGroupItem
            title="Who Can See My Reels"
            options={[
              { label: 'Everyone (Public)', value: 'public' },
              { label: 'Followers Only', value: 'followers' },
            ]}
            selectedValue={settings.reels_visibility}
            onSelect={(val) => handleUpdate('reels_visibility', val as 'public' | 'followers')}
            isDisabled={isSaving}
          />
        </View>

        {/* --- 3. Interaction Control --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interaction Control</Text>
          <RadioGroupItem
            title="Who Can Comment on My Content"
            options={[
              { label: 'Everyone', value: 'everyone' },
              { label: 'Followers Only', value: 'followers' },
              { label: 'People I Follow', value: 'following' },
            ]}
            selectedValue={settings.allow_comments}
            onSelect={(val) => handleUpdate('allow_comments', val as 'everyone' | 'followers' | 'following')}
            isDisabled={isSaving}
          />
          <SettingToggleItem
            icon={Activity}
            title="Activity Status"
            subtitle="Allow accounts you follow and anyone you message to see when you were last active."
            value={settings.show_activity_status}
            onValueChange={(val) => handleUpdate('show_activity_status', val)}
            isDisabled={isSaving}
          />
          <TouchableOpacity 
              style={styles.linkedItem}
              onPress={() => router.push('/settings/blocked')} 
          >
              <Users color={Colors.primary} size={20} style={styles.linkedIcon} />
              <Text style={styles.linkedItemText}>Blocked Users List</Text>
          </TouchableOpacity>
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
  loadingText: {
      color: Colors.textMuted,
      marginTop: 10,
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
       opacity: 0.7,
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
  // --- Radio Group Styles ---
  radioGroup: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  radioGroupTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    paddingVertical: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  radioLabel: {
    fontSize: 15,
    color: Colors.text,
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDisabled: {
      borderColor: Colors.textMuted,
  },
  radioButtonInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  // --- Linked Items (e.g., Blocked Users) ---
  linkedItem: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  linkedItemText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.primary,
  },
  linkedIcon: {
      marginTop: 1,
  },
});
