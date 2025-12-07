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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';


import Colors from '@/constants/colors';
import { api } from '@/services/api'; 

// --- TYPE DEFINITION ---
interface TwoFAStatus {
    is_2fa_enabled: boolean;
}

// --- MOCK/DUMMY API FUNCTIONS (Must be defined in api.ts) ---
// NOTE: We assume these endpoints exist in api.settings module now.
api.settings.get2FAStatus = async (): Promise<TwoFAStatus> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // FIXED: Added semicolon here to resolve the previous SyntaxError
    return { is_2fa_enabled: false }; 
} as any; 

api.settings.generate2FASecret = async (): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return 'NZXXQ443XJTWQ2DBEBYCA5DF'; 
} as any;


export default function TwoFactorAuthScreen() {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [secretKey, setSecretKey] = useState<string>('');
  
  // 1. Fetch current status
  const { data: status, isLoading: isLoadingStatus, isError: isErrorStatus } = useQuery<TwoFAStatus>({
      queryKey: ['2FAStatus'],
      queryFn: api.settings.get2FAStatus,
      initialData: { is_2fa_enabled: false },
      refetchOnWindowFocus: true,
  });

  // 2. Mutation for enabling 2FA (Step 2 confirmation)
  const enableMutation = useMutation({
      mutationFn: (code: string) => api.settings.enable2FA(secretKey, code),
      onSuccess: () => {
          Alert.alert('Success', '2FA successfully enabled!');
          queryClient.invalidateQueries({ queryKey: ['2FAStatus'] });
          setCurrentStep(0);
      },
      onError: (error: any) => {
          Alert.alert('Error', error.message || 'Invalid code. Please try again.');
      },
  });

  // 3. Mutation for disabling 2FA
  const disableMutation = useMutation({
      mutationFn: () => api.settings.disable2FA(verificationCode), 
      onSuccess: () => {
          Alert.alert('Success', '2FA successfully disabled.');
          queryClient.invalidateQueries({ queryKey: ['2FAStatus'] });
          setCurrentStep(1); 
      },
       onError: (error: any) => {
          Alert.alert('Error', error.message || 'Failed to disable 2FA.');
      },
  });

  const handleCopySecret = async () => {
    await Clipboard.setStringAsync(secretKey);
    Alert.alert('Copied!', 'Secret key has been copied to clipboard.');
  };
  
  const handleStartSetup = async () => {
      // Step 1: Fetch the secret key from the server
      const key = await api.settings.generate2FASecret();
      setSecretKey(key);
      setCurrentStep(1);
  };
  
  const handleNextStep = () => {
    setCurrentStep(2);
  };

  const handleVerifyAndEnable = () => {
    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Verification code must be 6 digits.');
      return;
    }
    enableMutation.mutate(verificationCode);
  };

  const handleDisable2FA = () => {
    Alert.alert(
      'Disable 2FA',
      'Are you sure you want to disable Two-Factor Authentication? We recommend keeping it enabled.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable',
          style: 'destructive',
          onPress: () => disableMutation.mutate(), 
        },
      ]
    );
  };
  
  const isSaving = enableMutation.isPending || disableMutation.isPending;
  const is2FAEnabled = status?.is_2fa_enabled ?? false;

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
            <Text style={styles.qrText}>[{secretKey ? 'QR Code for' : 'Generating'} {secretKey}]</Text>
          </View>
          
          <View style={styles.secretKeyRow}>
            <Text style={styles.secretText}>{secretKey || 'Tap Start Setup...'}</Text>
            <TouchableOpacity onPress={handleCopySecret} disabled={!secretKey || isSaving}>
                <Copy color={secretKey ? Colors.text : Colors.textMuted} size={20} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.button} onPress={handleNextStep} disabled={!secretKey || isSaving}>
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
            editable={!isSaving}
          />

          <TouchableOpacity
            style={[styles.button, verificationCode.length !== 6 && styles.buttonDisabled]}
            onPress={handleVerifyAndEnable}
            disabled={verificationCode.length !== 6 || isSaving}
          >
            {isSaving ? (
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

  if (isLoadingStatus) {
       return (
          <View style={[styles.container, styles.center]}>
              <ActivityIndicator size="large" color={Colors.primary} />
          </View>
      );
  }
  
  if (isErrorStatus) {
      return (
          <View style={[styles.container, styles.center]}>
              <Text style={styles.errorText}>Failed to load 2FA status.</Text>
               <TouchableOpacity onPress={() => queryClient.invalidateQueries({ queryKey: ['2FAStatus'] })}>
                   <Text style={styles.linkButtonText}>Retry</Text>
               </TouchableOpacity>
          </View>
      );
  }

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
          // --- 2FA Enabled View ---
          <View style={styles.enabledView}>
            <Text style={styles.enabledText}>
                Your account is protected. You will need a code from your authenticator app to log in.
            </Text>
             <TouchableOpacity 
                style={[styles.button, styles.disableButton]} 
                onPress={handleDisable2FA} 
                disabled={isSaving}
             >
                {isSaving ? <ActivityIndicator color={Colors.text} /> : <Text style={styles.buttonText}>Disable 2FA</Text>}
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
          // --- 2FA Disabled/Setup View ---
          <View>
              {secretKey || currentStep === 2 ? (
                  renderSetupSteps()
              ) : (
                   <TouchableOpacity 
                        style={styles.startButton} 
                        onPress={handleStartSetup}
                        disabled={isSaving}
                    >
                        <Text style={styles.startButtonText}>Start 2FA Setup</Text>
                    </TouchableOpacity>
              )}
          </View>
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
  startButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 50,
  },
  startButtonText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700' as const,
  }
});
