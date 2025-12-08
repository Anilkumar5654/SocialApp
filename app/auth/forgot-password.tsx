import React, { useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, View } from 'react-native';
import { router } from 'expo-router';
import { Mail } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';

import Colors from '@/constants/colors';
import { api } from '@/services/api';

import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');

  const resetMutation = useMutation({
    mutationFn: () => api.auth.forgotPassword(email),
    onSuccess: () => Alert.alert('Success', 'Check your email for reset link', [{ text: 'OK', onPress: () => router.back() }]),
    onError: (err: any) => Alert.alert('Error', err.message),
  });

  return (
    <AuthLayout title="Forgot Password?" subtitle="Enter your email to reset password" showBack>
      
      <AuthInput icon={Mail} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />

      <TouchableOpacity 
        style={[styles.btn, resetMutation.isPending && { opacity: 0.7 }]} 
        onPress={() => resetMutation.mutate()}
        disabled={resetMutation.isPending}
      >
        {resetMutation.isPending ? <ActivityIndicator color={Colors.text} /> : <Text style={styles.btnText}>Send Reset Link</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={{ alignItems: 'center' }}>
        <Text style={styles.link}>Back to Sign In</Text>
      </TouchableOpacity>

    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  btn: { backgroundColor: Colors.primary, borderRadius: 12, height: 56, justifyContent: 'center', alignItems: 'center', marginBottom: 24, marginTop: 10 },
  btnText: { fontSize: 17, fontWeight: '700', color: Colors.text },
  link: { color: Colors.primary, fontWeight: '600', fontSize: 15 },
});
