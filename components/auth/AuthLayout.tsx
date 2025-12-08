import React from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Sparkles, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  showBack?: boolean;
}

export default function AuthLayout({ title, subtitle, children, showBack }: AuthLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]} keyboardShouldPersistTaps="handled">
        
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft color={Colors.text} size={24} />
          </TouchableOpacity>
        )}

        <View style={styles.logoBox}>
          <View style={styles.circle}>
            <Sparkles color={Colors.primary} size={showBack ? 40 : 48} />
          </View>
          <Text style={styles.appName}>SocialHub</Text>
        </View>

        <View style={styles.formBox}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          {children}
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  backBtn: { marginBottom: 20 },
  logoBox: { alignItems: 'center', marginBottom: 40 },
  circle: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: Colors.primary, marginBottom: 16 },
  appName: { fontSize: 28, fontWeight: '800', color: Colors.primary, letterSpacing: -0.5 },
  formBox: { flex: 1 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: Colors.textSecondary, marginBottom: 32 },
});
