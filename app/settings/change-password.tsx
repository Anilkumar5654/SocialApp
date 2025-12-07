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

import Colors from '@/constants/colors';
// import { api } from '@/services/api'; // Assuming you have an API service

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validation: New password must be at least 6 characters and match the confirmation field.
  const isFormValid = newPassword.length >= 6 && newPassword === confirmPassword && currentPassword.length > 0;

  const handleChangePassword = async () => {
    if (!isFormValid) {
      Alert.alert('Error', 'Please fill all fields and ensure the new passwords match (min 6 characters).');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call to change the password
      // NOTE: In a real app, you must send currentPassword to verify identity on the backend.
      
      // await api.users.changePassword({
      //   currentPassword,
      //   newPassword,
      // });

      // Simulating Success:
      Alert.alert('Success', 'Your password has been successfully updated.');
      
      // Clear fields and navigate back
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      router.back(); 

    } catch (error: any) {
      // Simulating Error (e.g., current password incorrect or server failure):
      Alert.alert('Error', error.message || 'Failed to change password. Please check your current password.');
    } finally {
      setIsLoading(false);
    }
  };

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
            style={[styles.button, !isFormValid && styles.buttonDisabled]}
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
