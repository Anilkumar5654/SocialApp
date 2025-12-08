import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

interface CreateChannelFormProps {
    channelName: string;
    setChannelName: (name: string) => void;
    channelDescription: string;
    setChannelDescription: (desc: string) => void;
    isCreatingChannel: boolean;
    handleCreateChannel: () => void;
    handleCancel: () => void;
}

export default function CreateChannelForm({
    channelName,
    setChannelName,
    channelDescription,
    setChannelDescription,
    isCreatingChannel,
    handleCreateChannel,
    handleCancel,
}: CreateChannelFormProps) {
    const insets = useSafeAreaInsets();
    
    return (
        <View style={styles.container}>
            <View style={[styles.customHeaderWrapper, { paddingTop: insets.top }]}>
                 <View style={styles.customHeaderContainer}>
                    <Text style={styles.customHeaderTitle}>Create Channel</Text>
                 </View>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.createChannelContent}>
                <Text style={styles.createChannelTitle}>Create Your Channel</Text>
                <Text style={styles.createChannelDescription}>
                  Start your creator journey! Create a channel to upload long-form videos and access monetization features.
                </Text>
                
                {/* Name Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Channel Name *</Text>
                    <TextInput style={styles.input} placeholder="Enter channel name" placeholderTextColor={Colors.textMuted} value={channelName} onChangeText={setChannelName}/>
                </View>

                {/* Description Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Description</Text>
                    <TextInput style={[styles.input, styles.textArea]} placeholder="Tell viewers about your channel" placeholderTextColor={Colors.textMuted} value={channelDescription} onChangeText={setChannelDescription} multiline numberOfLines={4}/>
                </View>

                {/* Submit Button */}
                <TouchableOpacity style={[styles.submitButton, isCreatingChannel && styles.submitButtonDisabled]} onPress={handleCreateChannel} disabled={isCreatingChannel}>
                    {isCreatingChannel ? (<ActivityIndicator color={Colors.text} />) : (<Text style={styles.submitButtonText}>Create Channel</Text>)}
                </TouchableOpacity>
                
                {/* Cancel Button */}
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

// STYLES
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    customHeaderWrapper: { backgroundColor: Colors.background, borderBottomWidth: 1, borderBottomColor: Colors.border },
    customHeaderContainer: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingHorizontal: 16, height: 52 },
    customHeaderTitle: { fontSize: 22, fontWeight: '700' as const, color: Colors.text, letterSpacing: -0.5 },
    createChannelContent: { padding: 16 },
    createChannelTitle: { fontSize: 28, fontWeight: '700' as const, color: Colors.text, marginBottom: 12 },
    createChannelDescription: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: 32 },
    inputGroup: { marginBottom: 24 },
    inputLabel: { fontSize: 14, fontWeight: '600' as const, color: Colors.text, marginBottom: 8 },
    input: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: Colors.text },
    textArea: { minHeight: 100, paddingTop: 14, textAlignVertical: 'top' },
    submitButton: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
    submitButtonDisabled: { opacity: 0.4 },
    submitButtonText: { fontSize: 16, fontWeight: '700' as const, color: Colors.text },
    cancelButton: { paddingVertical: 12, alignItems: 'center' },
    cancelButtonText: { fontSize: 15, fontWeight: '600' as const, color: Colors.textSecondary },
});
