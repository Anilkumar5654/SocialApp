import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface AuthInputProps {
  icon: React.ElementType;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  editable?: boolean;
}

export default function AuthInput({ icon: Icon, secureTextEntry, ...props }: AuthInputProps) {
  const [showPass, setShowPass] = useState(false);
  const isPassword = secureTextEntry;

  return (
    <View style={styles.wrapper}>
      <Icon color={Colors.textMuted} size={20} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholderTextColor={Colors.textMuted}
        secureTextEntry={isPassword && !showPass}
        autoCapitalize="none"
        {...props}
      />
      {isPassword && (
        <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
          {showPass ? <EyeOff color={Colors.textMuted} size={20} /> : <Eye color={Colors.textMuted} size={20} />}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 16, height: 56, marginBottom: 16 },
  icon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: Colors.text, height: '100%' },
  eyeBtn: { padding: 8 },
});
