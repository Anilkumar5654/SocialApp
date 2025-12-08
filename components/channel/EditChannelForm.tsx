import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { RotateCcw } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface EditChannelFormProps {
  name: string; setName: (t: string) => void;
  handle: string; setHandle: (t: string) => void;
  bio: string; setBio: (t: string) => void;
  about: string; setAbout: (t: string) => void;
  canChangeHandle: boolean;
  daysRemaining: number;
}

export default function EditChannelForm({
  name, setName, handle, setHandle, bio, setBio, about, setAbout, canChangeHandle, daysRemaining
}: EditChannelFormProps) {
  return (
    <View style={styles.container}>
      {/* Name */}
      <View style={styles.group}>
        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Channel Name" placeholderTextColor={Colors.textMuted} />
      </View>

      {/* Handle */}
      <View style={styles.group}>
        <Text style={styles.label}>Handle (Unique URL)</Text>
        <TextInput 
            style={[styles.input, !canChangeHandle && styles.disabled]} 
            value={handle} 
            onChangeText={setHandle} 
            placeholder="@yourhandle" 
            placeholderTextColor={Colors.textMuted} 
            editable={canChangeHandle} 
        />
        {!canChangeHandle && (
            <View style={styles.notice}>
                <RotateCcw color={Colors.warning} size={14} />
                <Text style={styles.noticeText}>Can change again in {daysRemaining} days.</Text>
            </View>
        )}
      </View>

      {/* Bio */}
      <View style={styles.group}>
        <Text style={styles.label}>Bio</Text>
        <TextInput style={[styles.input, { minHeight: 60 }]} value={bio} onChangeText={setBio} placeholder="Short bio..." placeholderTextColor={Colors.textMuted} multiline maxLength={80} />
      </View>

      {/* About */}
      <View style={styles.group}>
        <Text style={styles.label}>About</Text>
        <TextInput style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]} value={about} onChangeText={setAbout} placeholder="Detailed description..." placeholderTextColor={Colors.textMuted} multiline />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  group: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  input: { backgroundColor: Colors.surface, borderRadius: 8, padding: 12, fontSize: 16, color: Colors.text, borderWidth: 1, borderColor: Colors.border },
  disabled: { opacity: 0.6 },
  notice: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  noticeText: { fontSize: 13, color: Colors.warning }
});
