import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';

import Colors from '@/constants/colors';
import { api } from '@/services/api'; 

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Validation: New password must be at least 6 characters and match the confirmation field, and current password must be present.
  const isFormValid = newPassword.length >= 6 && newPassword === confirmPassword && currentPassword.length > 0;

  // Use useMutation for asynchronous password change operation
  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => 
        // Use the defined API endpoint
        api.settings.changePassword(data.currentPassword, data.newPassword),
    
    onSuccess: () => {
      Alert.alert('Success', 'Your password has been successfully updated. You may need to log in again.');
      
      // Clear fields and navigate back
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      router.back(); 
    },
    
    onError: (error: any) => {
      // Handle specific API errors (e.g., current password incorrect)
      const errorMessage = error.message || 'Failed to change password. Please check your current password.';
      Alert.alert('Error', errorMessage);
    },
  });

  const handleChangePassword = () => {
    if (!isFormValid) {
      Alert.alert('Error', 'Please fill all fields and ensure the new passwords match (min 6 characters).');
      return;
    }
    
    changePasswordMutation.mutate({
        currentPassword,
        newPassword
    });
  };
  
  const isLoading = changePasswordMutation.isPending;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Change Password',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
        }}
      />
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          
          {/* Current Password */}
          <Text style={styles.label}>Current Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your current password"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
            editable={!isLoading}
          />
          
          {/* New Password */}
          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter new password (min 6 characters)"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            editable={!isLoading}
          />

          {/* Confirm New Password */}
          <Text style={styles.label}>Confirm New Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm new password"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[styles.button, (!isFormValid || isLoading) && styles.buttonDisabled]}
            onPress={handleChangePassword}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.text} />
            ) : (
              <Text style={styles.buttonText}>Change Password</Text>
            )}
          </TouchableOpacity>
          
          <Text style={styles.helpText}>
              Use a combination of upper/lower case letters, numbers, and symbols for a strong password.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
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
    minHeight: '100%',
  },
  label: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 15,
    marginBottom: 8,
  },
  input: {
    height: 50,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 15,
    color: Colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  helpText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 20,
    textAlign: 'center',
  },
});
