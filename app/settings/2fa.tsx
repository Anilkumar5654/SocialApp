import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Lock, CheckCircle, XCircle, Copy } from 'lucide-react-native'; 
import * as Clipboard from 'expo-clipboard';

import Colors from '@/constants/colors';
// import { api } from '@/services/api'; 

// --- MOCK DATA ---
const MOCK_2FA_SECRET = 'NZXXQ443XJTWQ2DBEBYCA5DF'; 

export default function TwoFactorAuthScreen() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false); 
  // Step 0: Enabled/Disabled View
  // Step 1: Show Secret Key/QR Code
  // Step 2: Verify TOTP Code
  const [currentStep, setCurrentStep] = useState(is2FAEnabled ? 0 : 1);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- HANDLERS ---
  
  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied!', 'Secret key has been copied to clipboard.');
  };

  // Handler to disable 2FA
  const handleDisable2FA = async () => {
    Alert.alert(
      'Disable 2FA',
      'Are you sure you want to disable Two-Factor Authentication?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              // API call to disable 2FA: await api.security.disable2FA();
              setIs2FAEnabled(false);
              setCurrentStep(1); // Go back to setup step
              Alert.alert('Success', '2FA successfully disabled.');
            } catch (e) {
              Alert.alert('Error', 'Failed to disable 2FA.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };
  
  // Handler for Step 1: Move to verification (Step 2)
  const handleNextStep = () => {
    // In a real app, API call to generate MOCK_2FA_SECRET would happen here
    setCurrentStep(2);
  };

  // Handler for Step 2: Verify Code and Enable 2FA
  const handleVerifyAndEnable = async () => {
    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Verification code must be 6 digits.');
      return;
    }
    
    setIsLoading(true);
    try {
        // API call to verify the TOTP code against the secret key
        // await api.security.verify2FA(verificationCode, MOCK_2FA_SECRET);
        
        // Simulating Success:
        setIs2FAEnabled(true);
        setCurrentStep(0); // Move to enabled status view
        Alert.alert('Success', '2FA successfully enabled!');
        
    } catch (e) {
        // Simulating Failure:
        Alert.alert('Error', 'Invalid code. Please check the code and time on your Authenticator App.');
    } finally {
        setIsLoading(false);
        setVerificationCode(''); // Clear the input
    }
  };


  // --- UI RENDERING FOR SETUP STEPS ---

  const renderSetupSteps = () => {
    if (currentStep === 1) {
      return (
        // --- STEP 1: Show Secret and QR ---
        <View style={styles.stepContainer}>
          <Text style={styles.stepHeader}>1. Set up your Authenticator App</Text>
          <Text style={styles.stepText}>
            Scan the QR code below or enter the Secret Key into any TOTP app like Google Authenticator or Authy.
          </Text>

          {/* QR Code Placeholder (Requires a library for actual rendering) */}
          <View style={styles.qrCodePlaceholder}>
            <Text style={styles.qrText}>[QR Code Placeholder]</Text>
          </View>
          
          <View style={styles.secretKeyRow}>
            <Text style={styles.secretText}>{MOCK_2FA_SECRET}</Text>
            <TouchableOpacity onPress={() => copyToClipboard(MOCK_2FA_SECRET)}>
                <Copy color={Colors.text} size={20} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.button} onPress={handleNextStep}>
            <Text style={styles.buttonText}>Next: Verify Code</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (currentStep === 2) {
      return (
        // --- STEP 2: Verify Code ---
        <View style={styles.stepContainer}>
          <Text style={styles.stepHeader}>2. Verify the Code</Text>
          <Text style={styles.stepText}>
            Enter the 6-digit code from your Authenticator App to activate 2FA.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="6-digit verification code"
            placeholderTextColor={Colors.textMuted}
            keyboardType="number-pad"
            maxLength={6}
            value={verificationCode}
            onChangeText={setVerificationCode}
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[styles.button, verificationCode.length !== 6 && styles.buttonDisabled]}
            onPress={handleVerifyAndEnable}
            disabled={verificationCode.length !== 6 || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.text} />
            ) : (
              <Text style={styles.buttonText}>Verify & Enable 2FA</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    }
  };
  
  // --- Main Render ---

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Two-Factor Authentication',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Status Box */}
        <View style={styles.statusBox}>
          {is2FAEnabled ? (
            <>
              <CheckCircle color={Colors.success} size={25} />
              <Text style={styles.statusTextEnabled}>2FA is ENABLED</Text>
            </>
          ) : (
            <>
              <XCircle color={Colors.danger} size={25} />
              <Text style={styles.statusTextDisabled}>2FA is DISABLED</Text>
            </>
          )}
        </View>

        {is2FAEnabled ? (
          // --- 2FA Enabled View (Step 0) ---
          <View style={styles.enabledView}>
            <Text style={styles.enabledText}>
                Your account is protected. You will need a code from your authenticator app to log in.
            </Text>
             <TouchableOpacity 
                style={[styles.button, styles.disableButton]} 
                onPress={handleDisable2FA} 
                disabled={isLoading}
             >
                {isLoading ? <ActivityIndicator color={Colors.text} /> : <Text style={styles.buttonText}>Disable 2FA</Text>}
             </TouchableOpacity>

            <View style={styles.recoveryBox}>
                <Text style={styles.recoveryHeader}>Recovery Codes</Text>
                <Text style={styles.recoveryText}>Generate backup codes in case you lose access to your phone.</Text>
                <TouchableOpacity style={styles.linkButton} onPress={() => Alert.alert('Recovery Codes', 'Generate codes functionality coming soon!')}>
                    <Text style={styles.linkButtonText}>Generate Codes</Text>
                </TouchableOpacity>
            </View>
          </View>
        ) : (
          // --- 2FA Disabled/Setup View (Steps 1 & 2) ---
          renderSetupSteps()
        )}
        
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
    padding: 20,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    marginBottom: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusTextEnabled: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.success,
  },
  statusTextDisabled: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.danger,
  },
  stepContainer: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepHeader: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginBottom: 10,
  },
  stepText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  qrCodePlaceholder: {
    height: 150,
    width: 150,
    backgroundColor: Colors.border, 
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
    borderRadius: 8,
  },
  qrText: {
      color: Colors.textMuted,
      fontSize: 12,
  },
  secretKeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: Colors.background,
    borderRadius: 6,
    marginBottom: 20,
    gap: 10,
  },
  secretText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  input: {
    height: 50,
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 15,
    color: Colors.text,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  disableButton: {
    backgroundColor: Colors.danger, 
    marginTop: 20,
  },
  enabledView: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  enabledText: {
    fontSize: 15,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  recoveryBox: {
    marginTop: 30,
    padding: 15,
    backgroundColor: Colors.background,
    borderRadius: 8,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recoveryHeader: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 5,
  },
  recoveryText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  linkButton: {
      marginTop: 5,
  },
  linkButtonText: {
      color: Colors.primary,
      fontSize: 15,
      fontWeight: '600' as const,
  }
});
