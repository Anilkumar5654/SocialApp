import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
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
import { Target, BarChart2 } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Colors from '@/constants/colors';
import { api } from '@/services/api';

// --- TYPE DEFINITIONS ---
interface Interest {
    id: number;
    category: string;
    is_active: boolean; // Corresponds to whether it's used for personalization
}

interface AdPreferences {
    is_global_personalization_enabled: boolean;
    interests: Interest[];
}

// --- MOCK API FUNCTION (FIXED SYNTAX) ---
api.settings.getAdPreferences = (async (): Promise<AdPreferences> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
        is_global_personalization_enabled: true,
        interests: [
          { id: 1, category: 'Sports', is_active: true },
          { id: 2, category: 'Technology', is_active: true },
          { id: 3, category: 'Fashion', is_active: false },
          { id: 4, category: 'Travel', is_active: true },
        ],
    };
}) as any; // <-- FIX: Wrap function in parentheses

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

// --- Main Screen Component ---

export default function AdPersonalizationScreen() {
  const queryClient = useQueryClient();

  // 1. Fetch current ad preferences
  const { data: preferences, isLoading, isError } = useQuery<AdPreferences>({
    queryKey: ['adPreferences'],
    queryFn: api.settings.getAdPreferences,
  });

  // 2. Mutation for updating preferences
  const mutation = useMutation({
    mutationFn: api.settings.updateAdPreferences,
    onMutate: async (newUpdate) => {
        // Optimistic update
        await queryClient.cancelQueries({ queryKey: ['adPreferences'] });
        const previousPreferences = queryClient.getQueryData<AdPreferences>(['adPreferences']);
        
        queryClient.setQueryData<AdPreferences>(['adPreferences'], (old) => {
            if (!old) return old;
            
            // Handle global toggle change
            if ('is_global_personalization_enabled' in newUpdate) {
                const isEnabled = newUpdate.is_global_personalization_enabled as boolean;
                return {
                    ...old,
                    is_global_personalization_enabled: isEnabled,
                    // If disabled globally, mark all interests as inactive in cache
                    interests: old.interests.map(i => ({
                        ...i,
                        is_active: isEnabled ? i.is_active : false,
                    })),
                };
            }
            
            // Handle single interest change
            if ('interest_id' in newUpdate && 'is_active' in newUpdate) {
                const { interest_id, is_active } = newUpdate;
                return {
                    ...old,
                    interests: old.interests.map(i => 
                        i.id === interest_id ? { ...i, is_active: is_active as boolean } : i
                    ),
                };
            }
            return { ...old, ...newUpdate };
        });
        
        return { previousPreferences };
    },
    onError: (err, newUpdate, context) => {
        // Rollback on failure
        queryClient.setQueryData(['adPreferences'], context?.previousPreferences);
        Alert.alert('Error', 'Failed to save ad preferences.');
    },
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['adPreferences'] });
    },
  });
  
  const isSaving = mutation.isPending;
  
  // Centralized update handlers
  const handleGlobalToggle = (val: boolean) => {
    mutation.mutate({ is_global_personalization_enabled: val });
  };

  const handleCategoryToggle = (id: number, val: boolean) => {
    if (!preferences?.is_global_personalization_enabled) {
        Alert.alert("Action Blocked", "Please enable Ad Personalization globally first to manage specific interests.");
        return;
    }
    mutation.mutate({ interest_id: id, is_active: val });
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
              <Text style={styles.errorText}>Failed to load ad settings. Try reloading.</Text>
               <TouchableOpacity onPress={() => queryClient.invalidateQueries({ queryKey: ['adPreferences'] })}>
                   <Text style={styles.linkButtonText}>Retry</Text>
               </TouchableOpacity>
          </View>
      );
  }

  const { is_global_personalization_enabled, interests } = preferences;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Ad Personalization',
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

        {/* --- 1. Global Control --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GLOBAL CONTROL</Text>
          <SettingToggleItem
            icon={Target}
            title="Ad Personalization"
            subtitle="Allow us to use your activity and interests to show you more relevant ads."
            value={is_global_personalization_enabled}
            onValueChange={handleGlobalToggle}
            isDisabled={isSaving}
          />
        </View>

        {/* --- 2. Interest Categories (Maps to user_interests.category) --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>YOUR INTEREST CATEGORIES</Text>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
                {is_global_personalization_enabled 
                    ? "Your selected interests are currently being used to tailor ads."
                    : "Personalization is OFF. All ads shown are non-targeted."}
            </Text>
          </View>

          {interests.map(interest => (
             <View key={interest.id} style={[styles.itemContainer, { paddingVertical: 10 }]}>
                 <View style={styles.contentContainer}>
                     <Text style={[styles.itemTitle, !is_global_personalization_enabled && styles.disabledText]}>{interest.category}</Text>
                 </View>
                 <Switch
                    onValueChange={(val) => handleCategoryToggle(interest.id, val)}
                    value={interest.is_active && is_global_personalization_enabled}
                    trackColor={{ false: Colors.textMuted, true: Colors.primary }}
                    thumbColor={Colors.text}
                    disabled={!is_global_personalization_enabled || isSaving}
                />
             </View>
          ))}
        </View>

        {/* --- 3. Related Links --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RELATED</Text>
          <TouchableOpacity 
              style={styles.linkedItem}
              onPress={() => router.push('/settings/ad-history')}
          >
            <BarChart2 color={Colors.primary} size={20} style={styles.linkedIcon} />
            <Text style={styles.linkedItemText}>View Ad History</Text>
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
      flex: 1,
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
  disabledText: {
      color: Colors.textMuted,
  },
  // --- Info Box ---
  infoBox: {
      backgroundColor: Colors.background,
      padding: 15,
      marginHorizontal: 16,
      borderRadius: 8,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: Colors.border,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  // --- Linked Items ---
  linkedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  linkedItemText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.primary,
    marginLeft: 10,
  },
  linkedIcon: {
      marginTop: 2,
  }
});
