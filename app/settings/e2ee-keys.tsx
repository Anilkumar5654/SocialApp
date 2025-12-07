import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Key, Shield, HardDrive, KeyRound, KeySquare } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';

import Colors from '@/constants/colors';
import { api } from '@/services/api'; 

// --- MOCK DATA ---
const MOCK_PUBLIC_KEY_FINGERPRINT = '4A5D:BC79:E8F0:1234:5678:A9B0:C1D2:E3F4';
const MOCK_RECOVERY_PHRASE_STATUS = 'Not Set'; 

// --- Reusable Item Component for Key Actions ---
interface KeyActionItemProps {
  icon: React.ComponentType<{ color?: string; size?: number }>;
  title: string;
  subtitle: string;
  onPress: () => void;
  isLoading: boolean;
  isDestructive?: boolean;
}

const KeyActionItem: React.FC<KeyActionItemProps> = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    onPress, 
    isLoading, 
    isDestructive 
}) => (
  <TouchableOpacity 
    style={styles.actionItem} 
    onPress={onPress} 
    disabled={isLoading}
  >
    <View style={styles.iconContainer}>
      <Icon color={isDestructive ? Colors.danger : Colors.primary} size={24} />
    </View>
    <View style={styles.contentContainer}>
      <Text style={[styles.actionTitle, isDestructive && { color: Colors.danger }]}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </View>
    {isLoading && <ActivityIndicator color={Colors.primary} size="small" />}
  </TouchableOpacity>
);

// --- Main Screen Component ---

export default function E2EEKeysScreen() {
    
    // We use a mock mutation here to simulate any async security action (Key generation/backup)
    const securityMutation = useMutation({
        // Using the 2FA endpoint as a generic security action simulator for now
        mutationFn: (action: string) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (Math.random() < 0.1) { // 10% chance of failure for demo
                        reject(new Error(`Failed to perform ${action}.`));
                    } else {
                        resolve(action);
                    }
                }, 800);
            });
        },
        onSuccess: (action) => {
            Alert.alert('Success', `${action} completed successfully.`);
        },
        onError: (error: any) => {
            Alert.alert('Error', error.message);
        }
    });
    
    const handleGenerateNewKey = () => {
        Alert.alert(
            'Confirm New Key',
            'Are you sure you want to generate a new key pair? All previous backups will become invalid.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Generate',
                    style: 'destructive',
                    onPress: () => securityMutation.mutate('Key Generation'),
                },
            ]
        );
    };

    const handleBackupKey = () => {
        Alert.alert(
            'Backup Key',
            'A secure key file will be generated. Store it safely and offline.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Generate File',
                    onPress: () => securityMutation.mutate('Key Backup'),
                },
            ]
        );
    };

    const handleRecoveryPhrase = () => {
         Alert.alert(
            'Set Recovery Phrase',
            'You will be prompted to create and verify a long passphrase. Store it safely.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Start Setup',
                    onPress: () => securityMutation.mutate('Recovery Setup'),
                },
            ]
        );
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
          <Text style={styles.sectionTitle}>CURRENT SECURITY STATUS</Text>
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
          <Text style={styles.sectionTitle}>YOUR PUBLIC KEY FINGERPRINT</Text>
          <View style={styles.keyDisplayBox}>
            <Text style={styles.keyDisplayLabel}>KEY FINGERPRINT:</Text>
            <Text style={styles.keyDisplayText}>{MOCK_PUBLIC_KEY_FINGERPRINT}</Text>
            <Text style={styles.keyInfoText}>
                Share this with friends to verify their identity and ensure secure communication.
            </Text>
            <TouchableOpacity onPress={() => Alert.alert('Verify', 'Navigate to verify contact key')} style={styles.linkButton}>
                <Text style={styles.linkButtonText}>Verify a Contact's Key</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- 3. Key Management Actions --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MANAGEMENT & RECOVERY</Text>
          <KeyActionItem
            icon={HardDrive}
            title="Backup Private Key"
            subtitle="Securely save your private key to recover your chat history on a new device."
            onPress={handleBackupKey}
            isLoading={securityMutation.isPending && securityMutation.variables === 'Key Backup'}
          />
          <KeyActionItem
            icon={KeyRound}
            title="Recovery Phrase"
            subtitle={`Status: ${MOCK_RECOVERY_PHRASE_STATUS}. Set a phrase to restore keys without a file backup.`}
            onPress={handleRecoveryPhrase}
            isLoading={securityMutation.isPending && securityMutation.variables === 'Recovery Setup'}
          />
          <KeyActionItem
            icon={KeySquare}
            title="Generate New Key Pair"
            subtitle="Creating a new key will permanently render old backups useless."
            onPress={handleGenerateNewKey}
            isDestructive
            isLoading={securityMutation.isPending && securityMutation.variables === 'Key Generation'}
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
    justifyContent: 'space-between',
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
    flexDirection: 'column',
    marginRight: 10,
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
