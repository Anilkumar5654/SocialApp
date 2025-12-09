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
    user: any; // User profile data (should include id, username, followers_count, etc.)
}

// --- PROFILE HEADER COMPONENT ---
export default function ProfileHeader({ user: profileUser }: ProfileHeaderProps) {
    const { user: authUser, isAuthenticated } = useAuth();
    
    // FIX: Check if the profile being viewed is the logged-in user's profile
    const isMyProfile = isAuthenticated && authUser?.id === profileUser?.id;

    const avatarUri = profileUser?.avatar ? getMediaUri(profileUser.avatar) : getMediaUri('assets/default_avatar.jpg');
    // Using followers_count from the passed profileUser object
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
                    <Text style={styles.channelName} numberOfLines={1}>
                        {profileUser?.full_name || 'User Profile'}
                    </Text>
                    <Text style={styles.channelHandle}>
                        {profileUser?.username ? `@${profileUser.username}` : 'No username'}
                        {' · '}
                        {followerCount} Followers
                    </Text>
                </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>12</Text>
                    <Text style={styles.statLabel}>Posts</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{followerCount}</Text>
                    <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>88</Text>
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
                    // --- OTHER USER'S PROFILE: FOLLOW BUTTON (Replace with your actual FollowBtn component) ---
                    <TouchableOpacity 
                        style={styles.followButton}
                        onPress={() => console.log('Follow button pressed')}
                    >
                        <Text style={styles.followButtonText}>Follow</Text>
                    </TouchableOpacity>
                    // NOTE: If you are using your fully fixed FollowBtn.tsx, replace the above TouchableOpacity with:
                    // <FollowBtn userId={profileUser.id} isFollowing={false} isFollowedByViewer={false} />
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
        fontSize: 24,
        fontWeight: '700',
    },
    channelHandle: {
        color: Colors.textSecondary,
        fontSize: 14,
        marginTop: 2,
    },
    descriptionText: {
        color: Colors.textSecondary, 
        fontSize: 14,
        marginTop: 15,
        lineHeight: 20,
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
        fontSize: 18,
        fontWeight: '700',
    },
    statLabel: {
        color: Colors.textSecondary,
        fontSize: 12,
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
        fontSize: 14,
        fontWeight: '600',
    },
    iconButton: { // Studio & Settings Buttons
        backgroundColor: '#262626',
        width: 40, 
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    // Button for OTHER USER
    followButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    followButtonText: {
        color: Colors.text,
        fontSize: 14,
        fontWeight: '600',
    },
});
