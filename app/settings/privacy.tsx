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
} from 'react-native';
import { Users, EyeOff, MessageSquare, Activity } from 'lucide-react-native';

import Colors from '@/constants/colors';

// --- Reusable Components for Privacy Screen ---

// 1. Component for Toggle Switches (e.g., Private Account, Activity Status)
interface SettingToggleItemProps {
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  icon: React.ComponentType<{ color?: string; size?: number }>;
}

const SettingToggleItem: React.FC<SettingToggleItemProps> = ({ 
  title, 
  subtitle, 
  value, 
  onValueChange,
  icon: Icon 
}) => {
  return (
    <View style={styles.itemContainer}>
      <View style={styles.iconContainer}>
        <Icon color={Colors.text} size={22} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        onValueChange={onValueChange}
        value={value}
        trackColor={{ false: Colors.textMuted, true: Colors.primary }}
        thumbColor={Colors.text}
      />
    </View>
  );
};

// 2. Component for Radio Button Group (e.g., Content Visibility)
interface RadioOption {
    label: string;
    value: string;
}

interface RadioGroupItemProps {
    title: string;
    options: RadioOption[];
    selectedValue: string;
    onSelect: (value: string) => void;
}

const RadioGroupItem: React.FC<RadioGroupItemProps> = ({ 
    title, 
    options, 
    selectedValue, 
    onSelect 
}) => {
    return (
        <View style={styles.radioGroup}>
            <Text style={styles.radioGroupTitle}>{title}</Text>
            {options.map((option) => (
                <TouchableOpacity
                    key={option.value}
                    style={styles.radioOption}
                    onPress={() => onSelect(option.value)}
                >
                    <Text style={styles.radioLabel}>{option.label}</Text>
                    <View style={styles.radioButton}>
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
  // Mock States for Privacy Settings
  const [isPrivate, setIsPrivate] = useState(false); // Maps to users table
  const [postsVisibility, setPostsVisibility] = useState('public'); // Maps to posts.feed_scope
  const [reelsVisibility, setReelsVisibility] = useState('public'); // Maps to reels.visibility
  const [allowComments, setAllowComments] = useState('everyone'); // Maps to videos.allow_comments logic
  const [showActivity, setShowActivity] = useState(true); // Maps to users.last_active logic

  // Handle setting updates (Simulated API calls)
  const handleToggleSetting = (setter: React.Dispatch<React.SetStateAction<any>>, newValue: any, settingName: string) => {
    setter(newValue);
    // In a real app: api.settings.update(settingName, newValue);
    // Alert.alert('Success', `${settingName} updated to ${newValue}.`);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Privacy Settings',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
        }}
      />
      <ScrollView style={styles.content}>

        {/* --- 1. Account Privacy --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Privacy</Text>
          <SettingToggleItem
            icon={EyeOff}
            title="Private Account"
            subtitle="Only approved followers can see your profile and content."
            value={isPrivate}
            onValueChange={(val) => handleToggleSetting(setIsPrivate, val, 'PrivateAccount')}
          />
          {isPrivate && (
            <TouchableOpacity 
                style={styles.linkedItem}
                onPress={() => router.push('/settings/privacy/requests')}
            >
                <Text style={styles.linkedItemText}>Review Follower Requests</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* --- 2. Content Visibility --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content Visibility</Text>
          <RadioGroupItem
            title="Who Can See My Posts"
            options={[
              { label: 'Everyone (Public)', value: 'public' },
              { label: 'Followers Only', value: 'followers' },
            ]}
            selectedValue={postsVisibility}
            onSelect={(val) => handleToggleSetting(setPostsVisibility, val, 'PostsVisibility')}
          />
          <RadioGroupItem
            title="Who Can See My Reels"
            options={[
              { label: 'Everyone (Public)', value: 'public' },
              { label: 'Followers Only', value: 'followers' },
            ]}
            selectedValue={reelsVisibility}
            onSelect={(val) => handleToggleSetting(setReelsVisibility, val, 'ReelsVisibility')}
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
            selectedValue={allowComments}
            onSelect={(val) => handleToggleSetting(setAllowComments, val, 'AllowComments')}
          />
          <SettingToggleItem
            icon={Activity}
            title="Activity Status"
            subtitle="Allow accounts you follow and anyone you message to see when you were last active."
            value={showActivity}
            onValueChange={(val) => handleToggleSetting(setShowActivity, val, 'ShowActivity')}
          />
          <TouchableOpacity 
              style={styles.linkedItem}
              onPress={() => router.push('/settings/blocked')} // Linking to an existing route
          >
              <Text style={styles.linkedItemText}>Blocked Users</Text>
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
  content: {
    paddingBottom: 40,
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
  },
  linkedItemText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.primary,
  }
});
