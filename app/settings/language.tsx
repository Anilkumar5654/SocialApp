import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { CheckCircle, Globe } from 'lucide-react-native';

import Colors from '@/constants/colors';

// --- MOCK DATA ---
interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const supportedLanguages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
];

// --- Component for a single language selection row ---
interface LanguageItemProps {
  language: Language;
  isSelected: boolean;
  onSelect: (code: string) => void;
}

const LanguageItem: React.FC<LanguageItemProps> = ({ language, isSelected, onSelect }) => (
  <TouchableOpacity
    style={styles.languageItem}
    onPress={() => onSelect(language.code)}
  >
    <View style={styles.languageInfo}>
      <Text style={styles.languageName}>{language.name}</Text>
      <Text style={styles.languageNativeName}>{language.nativeName}</Text>
    </View>
    
    {isSelected ? (
      <CheckCircle color={Colors.primary} size={24} />
    ) : (
      <View style={styles.radioPlaceholder} />
    )}
  </TouchableOpacity>
);

// --- Main Screen Component ---

export default function LanguageScreen() {
  const [selectedLanguageCode, setSelectedLanguageCode] = useState('en');

  const handleSelectLanguage = (code: string) => {
    setSelectedLanguageCode(code);
    
    // In a real app, this would trigger an API call or context update:
    // api.settings.setLanguage(code);
    Alert.alert('Language Updated', `Language set to ${supportedLanguages.find(l => l.code === code)?.name}. App restart may be required.`);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Language',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
        }}
      />
      <ScrollView style={styles.content}>

        <View style={styles.infoBox}>
          <Globe color={Colors.info} size={24} />
          <Text style={styles.infoText}>
            Select the language you want to use for the app interface.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supported Languages</Text>
          {supportedLanguages.map((language) => (
            <LanguageItem
              key={language.code}
              language={language}
              isSelected={language.code === selectedLanguageCode}
              onSelect={handleSelectLanguage}
            />
          ))}
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
  // --- Info Box ---
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 8,
    borderBottomColor: Colors.surface,
    gap: 15,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  // --- Language Item Styles ---
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  languageNativeName: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  radioPlaceholder: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.textMuted,
  },
});
