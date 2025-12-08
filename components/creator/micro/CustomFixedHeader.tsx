import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Bell, User } from 'lucide-react-native';
import { Image } from 'expo-image';
import Colors from '@/constants/colors';
import { getImageUrl } from '@/utils/media'; // Assumed to be available globally

function CustomFixedHeader({ user, onUploadPress }: { user: any, onUploadPress: () => void, avatarUrl?: string }) {
    const insets = useSafeAreaInsets();
    const avatarUrl = getImageUrl(user?.avatar); // Using utility for avatar

    return (
        <View style={[styles.customHeaderWrapper, { paddingTop: insets.top }]}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
            <View style={styles.customHeaderContainer}>
                <View style={styles.customHeaderLeft}>
                    [span_1](start_span)<Text style={styles.customHeaderTitle}>Studio</Text>[span_1](end_span)
                </View>
    
                <View style={styles.headerRightContainer}>
                    <TouchableOpacity onPress={onUploadPress} style={styles.headerIcon}>
                        [span_2](start_span)<Plus color={Colors.text} size={24} />[span_2](end_span)
                    </TouchableOpacity>
                  
                    <TouchableOpacity onPress={() => {/* Handle Navigation */}} style={styles.headerIcon}>
                        [span_3](start_span)<Bell color={Colors.text} size={24} />[span_3](end_span)
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {/* Handle Navigation */}}>
                        {avatarUrl ? (
                             <Image 
                                source={{ uri: avatarUrl }}
                                [span_4](start_span)style={styles.headerAvatar}[span_4](end_span)
                                contentFit="cover"
                             />
                        ) : (
                            <View style={styles.profileAvatarPlaceholder}>
                                [span_5](start_span)<User color={Colors.textMuted} size={20} />[span_5](end_span)
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

// NOTE: Styles for this component are crucial for rendering the header correctly.
const styles = StyleSheet.create({
    [span_6](start_span)[span_7](start_span)customHeaderWrapper: { backgroundColor: Colors.background, borderBottomWidth: 1, borderBottomColor: Colors.border },[span_6](end_span)[span_7](end_span)
    [span_8](start_span)customHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, height: 52 },[span_8](end_span)
    customHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
    [span_9](start_span)[span_10](start_span)customHeaderTitle: { fontSize: 22, fontWeight: '700' as const, color: Colors.text, letterSpacing: -0.5 },[span_9](end_span)[span_10](end_span)
    [span_11](start_span)[span_12](start_span)headerRightContainer: { flexDirection: 'row', alignItems: 'center', gap: 16 },[span_11](end_span)[span_12](end_span)
    headerIcon: { padding: 4 },
    [span_13](start_span)[span_14](start_span)headerAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },[span_13](end_span)[span_14](end_span)
    [span_15](start_span)[span_16](start_span)profileAvatarPlaceholder: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },[span_15](end_span)[span_16](end_span)
});
export default CustomFixedHeader;
