// File: src/components/profile/ProfileHeader.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Settings, BarChart3, Edit, Grid } from 'lucide-react-native'; // Added Grid for tab style

import Colors from '@/constants/colors'; 
import { useAuth } from '@/contexts/AuthContext';
import { getMediaUri } from '@/utils/media';

// NOTE: Ensure your FollowBtn path is correct!
import FollowBtn from '@/components/buttons/FollowBtn'; 

interface ProfileHeaderProps {
    user: any; // User profile data
}

// --- PROFILE HEADER COMPONENT ---
export default function ProfileHeader({ user: profileUser }: ProfileHeaderProps) {
    const { user: authUser, isAuthenticated } = useAuth();
    
    // CRITICAL ID COMPARISON FIX for My Profile check
    const isMyProfile = isAuthenticated && String(authUser?.id) === String(profileUser?.id);

    const avatarUri = profileUser?.avatar ? getMediaUri(profileUser.avatar) : getMediaUri('assets/default_avatar.jpg');
    const coverUri = profileUser?.cover_photo ? getMediaUri(profileUser.cover_photo) : undefined;
    const followerCount = profileUser?.followers_count?.toLocaleString() || '0'; 
    
    return (
        <View style={styles.container}>
            {/* 1. Cover Photo */}
            {coverUri && (
                <Image source={{ uri: coverUri }} style={styles.coverPhoto} contentFit="cover" />
            )}
            
            <View style={styles.detailsContainer}>
                
                {/* 2. Avatar */}
                <Image 
                    source={{ uri: avatarUri }}
                    style={styles.profileAvatar}
                    contentFit="cover"
                />
                
                {/* 3. Name and Username */}
                <View style={styles.nameSection}>
                    <Text style={styles.channelName} numberOfLines={1}>
                        {profileUser?.full_name || ''} 
                    </Text>
                    <Text style={styles.channelHandle}>
                        {profileUser?.username ? `@${profileUser.username}` : 'No username'}
                    </Text>
                </View>
                
                {/* Bio/Description */}
                <Text style={styles.descriptionText} numberOfLines={2}>
                     {profileUser?.bio || 'I am a passionate creator.'}
                 </Text>


                {/* 4. Action Buttons (Conditional Rendering) */}
                <View style={styles.actionRow}>
                    {isMyProfile ? (
                        // --- YOUR PROFILE: EDIT, STUDIO, SETTINGS ---
                        <>
                            <TouchableOpacity 
                                style={[styles.actionButton, styles.editButton]} // Changed style name for clarity
                                onPress={() => router.push('/edit-profile')}
                            >
                                <Edit size={20} color={Colors.text} style={{ marginRight: 5 }} />
                                <Text style={styles.actionButtonText}>Edit Profile</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.iconButton}
                                onPress={() => router.push('/creator-studio')}
                            >
                                <BarChart3 size={20} color={Colors.textSecondary} />
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.iconButton}
                                onPress={() => router.push('/settings')}
                            >
                                <Settings size={20} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        </>
                    ) : (
                        // --- OTHER USER'S PROFILE: FOLLOW BUTTON ---
                        <FollowBtn
                            userId={profileUser.id}
                            isFollowing={profileUser.is_following} 
                            isFollowedByViewer={profileUser.is_followed_by_viewer} 
                        />
                    )}
                </View>
                
                {/* 5. Stats Row (Moved lower for cleaner look) */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>18</Text>
                        <Text style={styles.statLabel}>Posts</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{followerCount}</Text>
                        <Text style={styles.statLabel}>Followers</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>2</Text>
                        <Text style={styles.statLabel}>Following</Text>
                    </View>
                </View>

            </View>
        </View>
    );
}

// --- STYLES ---
const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.background,
    },
    coverPhoto: {
        width: '100%',
        height: 150, // Slightly increased height
        backgroundColor: '#1E1E1E', 
    },
    detailsContainer: {
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    profileAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: Colors.background,
        backgroundColor: '#333',
        marginTop: -50, // Pull avatar over the cover photo
        marginBottom: 10,
    },
    nameSection: {
        marginBottom: 10,
    },
    channelName: {
        color: Colors.text,
        fontSize: 26, 
        fontWeight: '700',
    },
    channelHandle: {
        color: Colors.textSecondary,
        fontSize: 16, 
        marginTop: 2,
    },
    descriptionText: {
        color: Colors.text, // Bio text made visible
        fontSize: 15, 
        lineHeight: 22,
        marginBottom: 15, // Space above buttons
    },
    
    // Stats
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 15,
        marginTop: 10, // Space after buttons
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        color: Colors.text,
        fontSize: 20, 
        fontWeight: '700',
    },
    statLabel: {
        color: Colors.textSecondary,
        fontSize: 14, 
    },
    
    // Action Row 
    actionRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 15, // Space below buttons
    },
    
    // Buttons for MY PROFILE
    editButton: { // Edit Profile Button
        flexDirection: 'row',
        backgroundColor: '#262626',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    actionButtonText: {
        color: Colors.text,
        fontSize: 16, 
        fontWeight: '600',
    },
    iconButton: { // Studio & Settings Buttons
        backgroundColor: '#262626',
        width: 45, 
        height: 45, 
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
