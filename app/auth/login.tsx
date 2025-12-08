import React, { useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, View, Image } from 'react-native';
import { router } from 'expo-router';
import { Mail, Lock } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';

import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

// Clean Components
import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: () => router.replace('/(tabs)'),
    onError: (err: any) => Alert.alert('Error', err.message),
  });

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to continue">
      
      <AuthInput icon={Mail} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <AuthInput icon={Lock} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

      <TouchableOpacity onPress={() => router.push('/auth/forgot-password')} style={{ alignSelf: 'flex-end', marginBottom: 24 }}>
        <Text style={styles.forgot}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.btn, loginMutation.isPending && { opacity: 0.7 }]} 
        onPress={() => loginMutation.mutate()}
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? <ActivityIndicator color={Colors.text} /> : <Text style={styles.btnText}>Sign In</Text>}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/auth/register')}>
          <Text style={styles.link}>Sign Up</Text>
        </TouchableOpacity>
      </View>

    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  forgot: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
  btn: { backgroundColor: Colors.primary, borderRadius: 12, height: 56, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  btnText: { fontSize: 17, fontWeight: '700', color: Colors.text },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: Colors.textSecondary, fontSize: 15 },
  link: { color: Colors.primary, fontWeight: '700', fontSize: 15 },
});
