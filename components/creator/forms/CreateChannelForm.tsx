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
            [span_56](start_span)<View style={[styles.customHeaderWrapper, { paddingTop: insets.top }]}>[span_56](end_span)
                 [span_57](start_span)<View style={styles.customHeaderContainer}>[span_57](end_span)
                    [span_58](start_span)<Text style={styles.customHeaderTitle}>Create Channel</Text>[span_58](end_span)
                 </View>
            </View>

            [span_59](start_span)<ScrollView style={styles.content} contentContainerStyle={styles.createChannelContent}>[span_59](end_span)
                [span_60](start_span)<Text style={styles.createChannelTitle}>Create Your Channel</Text>[span_60](end_span)
                <Text style={styles.createChannelDescription}>
                  Start your creator journey! [span_61](start_span)Create a channel to upload long-form videos and access monetization features.[span_61](end_span)
                </Text>
                
                {/* Name Input */}
                [span_62](start_span)<View style={styles.inputGroup}>[span_62](end_span)
                    [span_63](start_span)<Text style={styles.inputLabel}>Channel Name *</Text>[span_63](end_span)
                    [span_64](start_span)<TextInput style={styles.input} placeholder="Enter channel name" placeholderTextColor={Colors.textMuted} value={channelName} onChangeText={setChannelName}/>[span_64](end_span)
                </View>

                {/* Description Input */}
                [span_65](start_span)<View style={styles.inputGroup}>[span_65](end_span)
                    [span_66](start_span)<Text style={styles.inputLabel}>Description</Text>[span_66](end_span)
                    [span_67](start_span)[span_68](start_span)<TextInput style={[styles.input, styles.textArea]} placeholder="Tell viewers about your channel" placeholderTextColor={Colors.textMuted} value={channelDescription} onChangeText={setChannelDescription} multiline numberOfLines={4}/>[span_67](end_span)[span_68](end_span)
                </View>

                {/* Submit Button */}
                [span_69](start_span)<TouchableOpacity style={[styles.submitButton, isCreatingChannel && styles.submitButtonDisabled]} onPress={handleCreateChannel} disabled={isCreatingChannel}>[span_69](end_span)
                    {isCreatingChannel ? (<ActivityIndicator color={Colors.text} />) [span_70](start_span)[span_71](start_span): (<Text style={styles.submitButtonText}>Create Channel</Text>)}[span_70](end_span)[span_71](end_span)
                </TouchableOpacity>
                
                {/* Cancel Button */}
                [span_72](start_span)<TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>[span_72](end_span)
                    [span_73](start_span)<Text style={styles.cancelButtonText}>Cancel</Text>[span_73](end_span)
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

// NOTE: Styles for CreateChannelForm are extracted from the monolith.
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    customHeaderWrapper: { backgroundColor: Colors.background, borderBottomWidth: 1, borderBottomColor: Colors.border },
    customHeaderContainer: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingHorizontal: 16, height: 52 },
    customHeaderTitle: { fontSize: 22, fontWeight: '700' as const, color: Colors.text, letterSpacing: -0.5 },
    [span_74](start_span)createChannelContent: { padding: 16 },[span_74](end_span)
    [span_75](start_span)createChannelTitle: { fontSize: 28, fontWeight: '700' as const, color: Colors.text, marginBottom: 12 },[span_75](end_span)
    [span_76](start_span)createChannelDescription: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: 32 },[span_76](end_span)
    [span_77](start_span)inputGroup: { marginBottom: 24 },[span_77](end_span)
    [span_78](start_span)inputLabel: { fontSize: 14, fontWeight: '600' as const, color: Colors.text, marginBottom: 8 },[span_78](end_span)
    [span_79](start_span)input: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: Colors.text },[span_79](end_span)
    [span_80](start_span)textArea: { minHeight: 100, paddingTop: 14, textAlignVertical: 'top' },[span_80](end_span)
    [span_81](start_span)submitButton: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },[span_81](end_span)
    [span_82](start_span)submitButtonDisabled: { opacity: 0.4 },[span_82](end_span)
    [span_83](start_span)submitButtonText: { fontSize: 16, fontWeight: '700' as const, color: Colors.text },[span_83](end_span)
    [span_84](start_span)cancelButton: { paddingVertical: 12, alignItems: 'center' },[span_84](end_span)
    [span_85](start_span)cancelButtonText: { fontSize: 15, fontWeight: '600' as const, color: Colors.textSecondary },[span_85](end_span)
});
