// File: src/components/profile/ProfileHeader.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Settings, BarChart3, Edit } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { getMediaUri } from '@/utils/media';

interface ProfileHeaderProps {
    user: any; // User profile data
}

// --- PROFILE HEADER COMPONENT ---
export default function ProfileHeader({ user: profileUser }: ProfileHeaderProps) {
    const { user: authUser, isAuthenticated } = useAuth();
    
    // 🎯 CRITICAL FIX: Ensure ID comparison works across String/Number types
    const isMyProfile = isAuthenticated && String(authUser?.id) === String(profileUser?.id);

    const avatarUri = profileUser?.avatar ? getMediaUri(profileUser.avatar) : getMediaUri('assets/default_avatar.jpg');
    const followerCount = profileUser?.followers_count?.toLocaleString() || '0'; 
    
    return (
        <View style={styles.headerContainer}>
            
            {/* Avatar and Name/Username Row */}
            <View style={styles.avatarRow}>
                <Image 
                    source={{ uri: avatarUri }}
                    style={styles.profileAvatar}
                    contentFit="cover"
                />
                
                <View style={styles.profileDetails}>
                    {/* Text Size Increased */}
                    <Text style={styles.channelName} numberOfLines={1}>
                        {profileUser?.full_name || 'User Profile'}
                    </Text>
                    <Text style={styles.channelHandle}>
                        {profileUser?.username ? `@${profileUser.username}` : 'No username'}
                    </Text>
                </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    {/* Text Size Increased */}
                    <Text style={styles.statNumber}>18</Text>
                    <Text style={styles.statLabel}>Posts</Text>
                </View>
                <View style={styles.statItem}>
                     {/* Text Size Increased */}
                    <Text style={styles.statNumber}>{followerCount}</Text>
                    <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.statItem}>
                     {/* Text Size Increased */}
                    <Text style={styles.statNumber}>2</Text>
                    <Text style={styles.statLabel}>Following</Text>
                </View>
            </View>

            {/* Action Buttons (Conditional Rendering) */}
            <View style={styles.actionRow}>
                {isMyProfile ? (
                    // --- 🌟 YOUR PROFILE: EDIT, STUDIO, SETTINGS 🌟 ---
                    <>
                        {/* 1. Edit Profile Button */}
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => router.push('/edit-profile')}
                        >
                            <Edit size={20} color={Colors.text} style={{ marginRight: 5 }} />
                            <Text style={styles.actionButtonText}>Edit Profile</Text>
                        </TouchableOpacity>
                        
                        {/* 2. Creator Studio Button (Icon Only) */}
                        <TouchableOpacity 
                            style={styles.iconButton}
                            onPress={() => router.push('/creator-studio')}
                        >
                            <BarChart3 size={20} color={Colors.textSecondary} />
                        </TouchableOpacity>
                        
                        {/* 3. Settings Button (Icon Only) */}
                        <TouchableOpacity 
                            style={styles.iconButton}
                            onPress={() => router.push('/settings')}
                        >
                            <Settings size={20} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    </>
                ) : (
                    // --- OTHER USER'S PROFILE: FOLLOW BUTTON ---
                    // Assuming you will import FollowBtn here later, using a simple button for now
                    <TouchableOpacity 
                        style={styles.followButton}
                        onPress={() => console.log('Follow button pressed')}
                    >
                        <Text style={styles.followButtonText}>Following</Text>
                    </TouchableOpacity>
                )}
            </View>
            
            <Text style={styles.descriptionText} numberOfLines={2}>
                 {profileUser?.bio || 'No bio provided.'}
             </Text>
        </View>
    );
}

// --- STYLES ---
const styles = StyleSheet.create({
    headerContainer: {
        width: '100%',
        backgroundColor: Colors.background,
        paddingHorizontal: 16,
        paddingVertical: 15,
    },
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    profileAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: '#333',
        backgroundColor: '#333',
        marginRight: 15,
    },
    profileDetails: {
        flex: 1,
    },
    channelName: {
        color: Colors.text,
        fontSize: 26, // Increased
        fontWeight: '700',
    },
    channelHandle: {
        color: Colors.textSecondary,
        fontSize: 16, // Increased
        marginTop: 2,
    },
    descriptionText: {
        color: Colors.textSecondary, 
        fontSize: 15, // Increased
        marginTop: 15,
        lineHeight: 22,
    },
    
    // Stats
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderTopWidth: 1,
        borderColor: '#262626',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        color: Colors.text,
        fontSize: 20, // Increased
        fontWeight: '700',
    },
    statLabel: {
        color: Colors.textSecondary,
        fontSize: 14, // Increased
    },
    
    // Action Row (My Profile & Other Profile Buttons)
    actionRow: {
        flexDirection: 'row',
        marginTop: 20,
        gap: 10,
    },
    
    // Buttons for MY PROFILE
    actionButton: { // Edit Profile Button
        flexDirection: 'row',
        backgroundColor: '#262626',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    actionButtonText: {
        color: Colors.text,
        fontSize: 16, // Increased
        fontWeight: '600',
    },
    iconButton: { // Studio & Settings Buttons
        backgroundColor: '#262626',
        width: 45, // Increased size
        height: 45, // Increased size
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    // Button for OTHER USER
    followButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 10, // Increased padding
        paddingHorizontal: 15,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    followButtonText: {
        color: Colors.text,
        fontSize: 16, // Increased
        fontWeight: '600',
    },
});
