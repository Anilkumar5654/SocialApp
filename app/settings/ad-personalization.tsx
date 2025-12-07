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
import { Target, List, Globe, BarChart2 } from 'lucide-react-native';

import Colors from '@/constants/colors';

// --- MOCK DATA ---
// Represents categories stored in the user_interests table.
interface Interest {
    id: number;
    category: string;
    is_active: boolean; // Corresponds to whether it's used for personalization
}

const initialInterests: Interest[] = [
  { id: 1, category: 'Sports', is_active: true },
  { id: 2, category: 'Technology', is_active: true },
  { id: 3, category: 'Fashion', is_active: false },
  { id: 4, category: 'Travel', is_active: true },
  { id: 5, category: 'Gaming', is_active: false },
];

// --- Reusable Component for Toggle Switches ---
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
        disabled={!title.includes("Ad Personalization")} // Disable if it's the specific interest toggles
      />
    </View>
  );
};

// --- Main Screen Component ---

export default function AdPersonalizationScreen() {
  const [isPersonalizationEnabled, setIsPersonalizationEnabled] = useState(true);
  const [interests, setInterests] = useState(initialInterests);

  // Global toggle handler
  const handleGlobalToggle = (val: boolean) => {
    setIsPersonalizationEnabled(val);
    // If disabled globally, mark all categories as inactive
    if (!val) {
        setInterests(prev => prev.map(i => ({ ...i, is_active: false })));
    }
    // In a real app: api.ads.setPersonalization(val);
  };

  // Category specific toggle handler
  const handleCategoryToggle = (id: number, val: boolean) => {
    if (!isPersonalizationEnabled && val) {
        // Prevent enabling if the global toggle is off
        Alert.alert("Action Blocked", "Please enable Ad Personalization globally first to manage specific interests.");
        return;
    }
    setInterests(prev => 
        prev.map(i => (i.id === id ? { ...i, is_active: val } : i))
    );
    // In a real app: api.ads.updateInterest(id, val);
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Ad Personalization',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
        }}
      />
      <ScrollView style={styles.content}>

        {/* --- 1. Global Control --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Global Control</Text>
          <SettingToggleItem
            icon={Target}
            title="Ad Personalization"
            subtitle="Allow us to use your activity and interests to show you more relevant ads."
            value={isPersonalizationEnabled}
            onValueChange={handleGlobalToggle}
          />
        </View>

        {/* --- 2. Interest Categories (Maps to user_interests.category) --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Interest Categories</Text>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
                {isPersonalizationEnabled 
                    ? "Your selected interests are currently being used to tailor ads."
                    : "Personalization is OFF. All ads shown are non-targeted."}
            </Text>
          </View>

          {interests.map(interest => (
             <View key={interest.id} style={[styles.itemContainer, { paddingVertical: 10 }]}>
                 <View style={styles.contentContainer}>
                     <Text style={[styles.itemTitle, !isPersonalizationEnabled && styles.disabledText]}>{interest.category}</Text>
                 </View>
                 <Switch
                    onValueChange={(val) => handleCategoryToggle(interest.id, val)}
                    value={interest.is_active && isPersonalizationEnabled}
                    trackColor={{ false: Colors.textMuted, true: Colors.primary }}
                    thumbColor={Colors.text}
                    disabled={!isPersonalizationEnabled}
                />
             </View>
          ))}
        </View>

        {/* --- 3. Related Links --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Related</Text>
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
  // --- Item Container Styles (Copied from Privacy/Notifications for consistency) ---
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
