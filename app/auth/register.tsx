import React, { useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, View } from 'react-native';
import { router } from 'expo-router';
import { User, Mail, Lock } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';

import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (password !== confirmPassword) throw new Error('Passwords do not match');
      return await register(name, username, email, password);
    },
    onSuccess: () => router.replace('/(tabs)'),
    onError: (err: any) => Alert.alert('Error', err.message),
  });

  return (
    <AuthLayout title="Create Account" subtitle="Join our community today">
      
      <AuthInput icon={User} placeholder="Full Name" value={name} onChangeText={setName} />
      <AuthInput icon={User} placeholder="Username" value={username} onChangeText={setUsername} />
      <AuthInput icon={Mail} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <AuthInput icon={Lock} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <AuthInput icon={Lock} placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

      <TouchableOpacity 
        style={[styles.btn, registerMutation.isPending && { opacity: 0.7 }]} 
        onPress={() => registerMutation.mutate()}
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending ? <ActivityIndicator color={Colors.text} /> : <Text style={styles.btnText}>Sign Up</Text>}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>Sign In</Text>
        </TouchableOpacity>
      </View>

    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  btn: { backgroundColor: Colors.primary, borderRadius: 12, height: 56, justifyContent: 'center', alignItems: 'center', marginBottom: 24, marginTop: 10 },
  btnText: { fontSize: 17, fontWeight: '700', color: Colors.text },
  footer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  footerText: { color: Colors.textSecondary, fontSize: 15 },
  link: { color: Colors.primary, fontWeight: '700', fontSize: 15 },
});
