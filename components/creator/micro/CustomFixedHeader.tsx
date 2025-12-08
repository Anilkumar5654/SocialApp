import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Bell, User } from 'lucide-react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router'; // Router needed for navigation
import Colors from '@/constants/colors';
import { getMediaUri } from '@/utils/media'; // Utility for image paths

function CustomFixedHeader({ user, onUploadPress }: { user: any, onUploadPress: () => void }) {
    const insets = useSafeAreaInsets();
    // Assuming user object has avatar path
    const avatarUrl = getMediaUri(user?.avatar); 

    return (
        <View style={[styles.customHeaderWrapper, { paddingTop: insets.top }]}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
            <View style={styles.customHeaderContainer}>
                <View style={styles.customHeaderLeft}>
                    <Text style={styles.customHeaderTitle}>Studio</Text>
                </View>
    
                <View style={styles.headerRightContainer}>
                    <TouchableOpacity onPress={onUploadPress} style={styles.headerIcon}>
                        <Plus color={Colors.text} size={24} />
                    </TouchableOpacity>
                  
                    <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.headerIcon}>
                        <Bell color={Colors.text} size={24} />
                    </TouchableOpacity>
                    
                    {/* User Avatar (Profile Navigation) */}
                    <TouchableOpacity onPress={() => router.push('/profile')}> 
                        {avatarUrl ? (
                             <Image 
                                source={{ uri: avatarUrl }}
                                style={styles.headerAvatar}
                                contentFit="cover"
                             />
                        ) : (
                            <View style={styles.profileAvatarPlaceholder}>
                                <User color={Colors.textMuted} size={20} />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    customHeaderWrapper: { backgroundColor: Colors.background, borderBottomWidth: 1, borderBottomColor: Colors.border },
    customHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, height: 52 },
    customHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
    customHeaderTitle: { fontSize: 22, fontWeight: '700' as const, color: Colors.text, letterSpacing: -0.5 },
    headerRightContainer: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    headerIcon: { padding: 4 },
    headerAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
    profileAvatarPlaceholder: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
});
export default CustomFixedHeader;
