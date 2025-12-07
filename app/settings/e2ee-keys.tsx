import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Key, Shield, HardDrive, KeyRound, KeySquare } from 'lucide-react-native';

import Colors from '@/constants/colors';

// --- MOCK DATA ---
// This Fingerprint represents the unique identifier of the user's public key
const MOCK_PUBLIC_KEY_FINGERPRINT = '4A5D:BC79:E8F0:1234:5678:A9B0:C1D2:E3F4';
const MOCK_RECOVERY_PHRASE_STATUS = 'Not Set'; 

// --- Reusable Item Component for Key Actions ---
interface KeyActionItemProps {
  icon: React.ComponentType<{ color?: string; size?: number }>;
  title: string;
  subtitle: string;
  onPress: () => void;
}

const KeyActionItem: React.FC<KeyActionItemProps> = ({ icon: Icon, title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.actionItem} onPress={onPress}>
    <View style={styles.iconContainer}>
      <Icon color={Colors.primary} size={24} />
    </View>
    <View style={styles.contentContainer}>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </View>
  </TouchableOpacity>
);

// --- Main Screen Component ---

export default function E2EEKeysScreen() {
  
  const handleAction = (feature: string) => {
    Alert.alert(feature, `${feature} functionality is coming soon as part of the E2EE update.`);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Chat Encryption Keys',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
        }}
      />
      <ScrollView style={styles.content}>

        {/* --- 1. Current Key Status --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Security Status</Text>
          <View style={styles.statusBox}>
            <Shield color={Colors.success} size={28} />
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusHeader}>E2EE is Active for Messages</Text>
              <Text style={styles.statusSubText}>
                Your device has a unique key pair protecting your chat content.
              </Text>
            </View>
          </View>
        </View>

        {/* --- 2. Public Key Fingerprint --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Public Key Fingerprint</Text>
          <View style={styles.keyDisplayBox}>
            <Text style={styles.keyDisplayLabel}>KEY FINGERPRINT:</Text>
            <Text style={styles.keyDisplayText}>{MOCK_PUBLIC_KEY_FINGERPRINT}</Text>
            <Text style={styles.keyInfoText}>
                Share this with friends to verify their identity and ensure secure communication.
            </Text>
            <TouchableOpacity onPress={() => handleAction('Verify Contact Key')} style={styles.linkButton}>
                <Text style={styles.linkButtonText}>Verify a Contact's Key</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- 3. Key Management Actions --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Management & Recovery</Text>
          <KeyActionItem
            icon={HardDrive}
            title="Backup Private Key"
            subtitle="Securely save your private key to recover your chat history on a new device."
            onPress={() => handleAction('Backup Key')}
          />
          <KeyActionItem
            icon={KeyRound}
            title="Recovery Phrase"
            subtitle={`Status: ${MOCK_RECOVERY_PHRASE_STATUS}. Set a phrase to restore keys without a file backup.`}
            onPress={() => handleAction('Set Recovery Phrase')}
          />
          <KeyActionItem
            icon={KeySquare}
            title="Generate New Key Pair"
            subtitle="Creating a new key will permanently render old backups useless."
            onPress={() => handleAction('Generate New Key')}
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
  // --- Status Box ---
  statusBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  statusTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  statusHeader: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  statusSubText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  // --- Key Fingerprint Display ---
  keyDisplayBox: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  keyDisplayLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    marginBottom: 5,
  },
  keyDisplayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.info,
    letterSpacing: 1,
    marginBottom: 10,
  },
  keyInfoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  linkButton: {
      paddingVertical: 5,
  },
  linkButtonText: {
      color: Colors.primary,
      fontWeight: '600' as const,
  },
  // --- Key Action Items ---
  actionItem: {
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
  actionTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  actionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
