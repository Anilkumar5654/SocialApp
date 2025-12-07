import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Heart, MessageSquare, UserPlus, AtSign, Video, MessageCircle, Bell } from 'lucide-react-native';

import Colors from '@/constants/colors';

// --- Reusable Component for Notification Toggles ---

interface NotificationToggleItemProps {
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  icon: React.ComponentType<{ color?: string; size?: number }>;
}

const NotificationToggleItem: React.FC<NotificationToggleItemProps> = ({ 
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

// --- Main Screen Component ---

export default function NotificationsScreen() {
  // Mock States for Notification Preferences (Mapping to Notifications table types)
  const [allowGlobal, setAllowGlobal] = useState(true);
  const [allowLikes, setAllowLikes] = useState(true); // type: 'like'
  const [allowComments, setAllowComments] = useState(true); // type: 'comment'
  const [allowFollows, setAllowFollows] = useState(true); // type: 'follow'
  const [allowMentions, setAllowMentions] = useState(true); // type: 'mention'
  const [allowVideoUploads, setAllowVideoUploads] = useState(true); // type: 'video'
  const [allowDMRequests, setAllowDMRequests] = useState(true); // type: 'dm_request'

  // Handler for all setting updates (Simulated API calls)
  const handleToggleSetting = (setter: React.Dispatch<React.SetStateAction<boolean>>, newValue: boolean, settingName: string) => {
    setter(newValue);
    // In a real app: api.notifications.update(settingName, newValue);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
        }}
      />
      <ScrollView style={styles.content}>

        {/* --- 1. General Control --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <NotificationToggleItem
            icon={Bell}
            title="Push Notifications"
            subtitle="Globally enable or disable all push notifications."
            value={allowGlobal}
            onValueChange={(val) => setAllowGlobal(val)}
          />
        </View>

        {/* --- 2. Interactions --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interactions</Text>
          <NotificationToggleItem
            icon={Heart}
            title="Likes"
            subtitle="Get notified when someone likes your post or reel."
            value={allowLikes && allowGlobal}
            onValueChange={(val) => handleToggleSetting(setAllowLikes, val, 'Likes')}
            // Disable toggle if global is off
            // disabled={!allowGlobal}
          />
          <NotificationToggleItem
            icon={MessageSquare}
            title="Comments"
            subtitle="Get notified when someone comments on your content."
            value={allowComments && allowGlobal}
            onValueChange={(val) => handleToggleSetting(setAllowComments, val, 'Comments')}
          />
          <NotificationToggleItem
            icon={AtSign}
            title="Mentions"
            subtitle="Get notified when someone mentions you in a post or comment."
            value={allowMentions && allowGlobal}
            onValueChange={(val) => handleToggleSetting(setAllowMentions, val, 'Mentions')}
          />
          <NotificationToggleItem
            icon={UserPlus}
            title="New Followers"
            subtitle="Get notified when someone starts following you."
            value={allowFollows && allowGlobal}
            onValueChange={(val) => handleToggleSetting(setAllowFollows, val, 'Follows')}
          />
        </View>

        {/* --- 3. Content & Messaging --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content & Messaging</Text>
          <NotificationToggleItem
            icon={Video}
            title="New Video/Reel Uploads"
            subtitle="Alerts for new content from followed creators."
            value={allowVideoUploads && allowGlobal}
            onValueChange={(val) => handleToggleSetting(setAllowVideoUploads, val, 'VideoUploads')}
          />
          <NotificationToggleItem
            icon={MessageCircle}
            title="Direct Message Requests"
            subtitle="Get notified when someone sends you a message request."
            value={allowDMRequests && allowGlobal}
            onValueChange={(val) => handleToggleSetting(setAllowDMRequests, val, 'DMRequests')}
          />
        </View>

        {/* --- 4. Other Settings Link --- */}
        <View style={styles.section}>
            <Text style={styles.infoText}>
                Note: Email and SMS notification settings are managed separately in the web interface.
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
  infoText: {
    fontSize: 13,
    color: Colors.textMuted,
    paddingHorizontal: 16,
    paddingVertical: 10,
    textAlign: 'center',
  }
});
