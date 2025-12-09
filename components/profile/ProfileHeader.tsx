// File: src/components/profile/ProfileHeader.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Settings, BarChart3, Edit, MessageSquare } from 'lucide-react-native';

import Colors from '@/constants/colors'; 
import { useAuth } from '@/contexts/authContext';
import { getMediaUri } from '@/utils/media';

import FollowBtn from '@/components/buttons/FollowBtn'; 

const { width } = Dimensions.get('window');

interface ProfileHeaderProps {
    user: any; // User profile data
}

// --- PROFILE HEADER COMPONENT ---
export default function ProfileHeader({ user: profileUser }: ProfileHeaderProps) {
    const { user: authUser, isAuthenticated } = useAuth();
    
    const isMyProfile = isAuthenticated && String(authUser?.id) === String(profileUser?.id);

    const avatarUri = profileUser?.avatar ? getMediaUri(profileUser.avatar) : getMediaUri('assets/default_avatar.jpg');
    // Using a placeholder cover photo URL for design match
    const coverUri = profileUser?.cover_photo ? getMediaUri(profileUser.cover_photo) : 'https://example.com/placeholder-cover.jpg'; 
    
    // 🎯 REAL DATA FIXES: Use actual data or format it if needed
    const followerCount = profileUser?.followers_count?.toLocaleString() || '0'; 
    const followingCount = profileUser?.following_count?.toLocaleString() || '0';
    const postsCount = profileUser?.posts_count?.toLocaleString() || '0';
    
    return (
        <View style={styles.container}>
            
            {/* 1. Cover Photo & Avatar Area */}
            <View style={styles.coverArea}>
                <View style={styles.coverPhotoBackground} />
                
                <View style={styles.avatarGlow}>
                    <Image 
                        source={{ uri: avatarUri }}
                        style={styles.profileAvatar}
                        contentFit="cover"
                    />
                </View>
            </View>

            {/* 2. Details Section (Centered) */}
            <View style={styles.detailsContainer}>
                
                {/* Name and Handle (Using Real Data) */}
                <Text style={styles.channelName} numberOfLines={1}>
                    {profileUser?.full_name || authUser?.username || 'Anuj'} 
                </Text>
                <Text style={styles.channelHandle}>
                    {profileUser?.username ? `@${profileUser.username}` : 'Digital Artist & Creative Director'}
                </Text>

                {/* 3. Stats Row (Prominent and Centered) */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        {/* Real Data */}
                        <Text style={styles.statNumber}>{followerCount}</Text>
                        <Text style={styles.statLabel}>Followers</Text>
                    </View>
                    <View style={styles.statItem}>
                        {/* Real Data */}
                        <Text style={styles.statNumber}>{followingCount}</Text>
                        <Text style={styles.statLabel}>Following</Text>
                    </View>
                    <View style={styles.statItem}>
                        {/* Real Data */}
                        <Text style={styles.statNumber}>{postsCount}</Text>
                        <Text style={styles.statLabel}>Posts</Text>
                    </View>
                </View>
                
                {/* Bio/Description (Centered) */}
                <Text style={styles.descriptionText} numberOfLines={2}>
                    {profileUser?.bio || 'Hello 👋'}
                </Text>


                {/* 4. Action Buttons (Follow/Message/Edit) */}
                <View style={styles.actionRow}>
                    {isMyProfile ? (
                        // --- YOUR PROFILE: EDIT, STUDIO, SETTINGS ---
                        <>
                            <TouchableOpacity 
                                style={[styles.editButton, {backgroundColor: Colors.textSecondary}]}
                                onPress={() => router.push('/edit-profile')}
                            >
                                <Text style={[styles.actionButtonText, {color: Colors.background}]}>Edit Profile</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.iconButton, {backgroundColor: Colors.textSecondary}]}
                                onPress={() => router.push('/creator-studio')}
                            >
                                <BarChart3 size={20} color={Colors.background} />
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.iconButton, {backgroundColor: Colors.textSecondary}]}
                                onPress={() => router.push('/settings')}
                            >
                                <Settings size={20} color={Colors.background} />
                            </TouchableOpacity>
                        </>
                    ) : (
                        // --- OTHER USER'S PROFILE: FOLLOW & MESSAGE ---
                        <>
                            <FollowBtn
                                userId={profileUser.id}
                                isFollowing={profileUser.is_following} 
                                isFollowedByViewer={profileUser.is_followed_by_viewer} 
                                style={styles.followButton}
                            />
                            <TouchableOpacity style={styles.messageButton} onPress={() => router.push('/messages')}>
                                <Text style={styles.messageButtonText}>Message</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </View>
    );
}

// --- STYLES (MATCHING TARGET DESIGN) ---
const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.background,
    },
    coverArea: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    coverPhotoBackground: { 
        width: '100%',
        height: 180, 
        position: 'absolute',
        top: 0,
        backgroundColor: '#1E1E1E', 
    },
    avatarGlow: {
        width: 130, 
        height: 130,
        borderRadius: 65,
        borderWidth: 3,
        borderColor: Colors.primary, 
        padding: 5,
        marginTop: 110, 
        zIndex: 10,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileAvatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: '#333',
    },
    detailsContainer: {
        paddingHorizontal: 25, 
        alignItems: 'center', 
        marginTop: 10,
    },
    channelName: {
        color: Colors.text,
        fontSize: 22, 
        fontWeight: '800', 
        textAlign: 'center',
    },
    channelHandle: {
        color: Colors.textSecondary,
        fontSize: 15, 
        marginTop: 4,
        textAlign: 'center',
        marginBottom: 8,
    },
    
    // Stats
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingVertical: 15,
        marginBottom: 10,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        color: Colors.text,
        fontSize: 18, 
        fontWeight: '800', 
    },
    statLabel: {
        color: Colors.textSecondary,
        fontSize: 13, 
        marginTop: 4,
    },
    
    descriptionText: {
        color: Colors.textSecondary, 
        fontSize: 14, 
        lineHeight: 20,
        textAlign: 'center',
        marginBottom: 20,
        maxWidth: 300, 
    },
    
    // Action Row 
    actionRow: {
        flexDirection: 'row',
        gap: 10,
        width: '100%',
        marginBottom: 20,
        justifyContent: 'center',
    },
    
    // Buttons for MY PROFILE (Taller, wider design)
    editButton: { 
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 10,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 100,
    },
    actionButtonText: {
        fontSize: 16, 
        fontWeight: '700',
    },
    iconButton: {
        width: 48,
        height: 48,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    // Buttons for OTHER USER
    followButton: { 
        backgroundColor: Colors.primary, 
        paddingVertical: 12,
        borderRadius: 10,
        flex: 1,
    },
    messageButton: { 
        backgroundColor: '#333333',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 10,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageButtonText: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: '700',
    },
});
