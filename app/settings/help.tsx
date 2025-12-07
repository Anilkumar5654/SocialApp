import { Stack } from 'expo-router';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { HelpCircle, FileText, Mail, MessageSquare } from 'lucide-react-native';

import Colors from '@/constants/colors';

// --- Reusable Link Component ---
interface LinkItemProps {
  icon: React.ComponentType<{ color?: string; size?: number }>;
  title: string;
  subtitle: string;
  url?: string;
  onPress: () => void;
}

const LinkItem: React.FC<LinkItemProps> = ({ icon: Icon, title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.linkItem} onPress={onPress}>
    <View style={styles.iconContainer}>
      <Icon color={Colors.primary} size={24} />
    </View>
    <View style={styles.contentContainer}>
      <Text style={styles.linkTitle}>{title}</Text>
      <Text style={styles.linkSubtitle}>{subtitle}</Text>
    </View>
  </TouchableOpacity>
);

// --- Main Screen Component ---

export default function HelpScreen() {
  
  const handleLinkPress = (url: string, action: string) => {
      // In a real app, you would use Linking.openURL(url);
      Alert.alert(`Open ${action}`, `Simulating opening: ${url}`);
      // Or for internal features: router.push(url);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Help & Support',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
        }}
      />
      <ScrollView style={styles.content}>

        {/* --- 1. Support & Help Center --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get Help</Text>
          <LinkItem
            icon={HelpCircle}
            title="Help Center"
            subtitle="Find answers to frequently asked questions and tutorials."
            onPress={() => handleLinkPress('https://help.yoursocialapp.com', 'Help Center')}
          />
          <LinkItem
            icon={Mail}
            title="Contact Support"
            subtitle="Submit a support ticket for technical issues or account recovery."
            onPress={() => handleLinkPress('mailto:support@yoursocialapp.com', 'Email Support')}
          />
          <LinkItem
            icon={MessageSquare}
            title="Report a Problem"
            subtitle="Send us feedback or report bugs and abusive content."
            onPress={() => handleLinkPress('/support/report', 'Report Form')}
          />
        </View>

        {/* --- 2. Legal and Policies --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <LinkItem
            icon={FileText}
            title="Terms of Service"
            subtitle="Read the rules and terms for using our platform."
            onPress={() => handleLinkPress('https://yoursocialapp.com/terms', 'Terms of Service')}
          />
          <LinkItem
            icon={FileText}
            title="Privacy Policy"
            subtitle="Learn how we collect, use, and protect your data."
            onPress={() => handleLinkPress('https://yoursocialapp.com/privacy', 'Privacy Policy')}
          />
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
  // --- Link Item Styles ---
  linkItem: {
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
  linkTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  linkSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
