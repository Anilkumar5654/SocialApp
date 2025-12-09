import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useAuth } from '@/contexts/AuthContext';
import { getMediaUri } from '@/utils/media';
import Colors from '@/constants/colors';
import { router } from 'expo-router'; // router is needed for navigation

// ✅ Corrected FollowBtn Import
import FollowBtn from '@/components/buttons/FollowBtn'; 
// EditProfileBtn component is replaced by direct navigation logic

interface UserProfile {
    id: string;
    username: string;
    name: string;
    bio: string;
    avatar: string;
    cover_photo?: string;
    followers_count: number;
    following_count: number;
    posts_count: number;
    is_following: boolean;
    is_current_user: boolean;
    is_followed_by_viewer: boolean; 
    is_private: boolean;
}

interface ProfileHeaderProps {
    user: UserProfile;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
    const { user: currentUser } = useAuth();
    const isCurrentUser = user.id === currentUser?.id;

    const renderActionButton = () => {
        if (isCurrentUser) {
            // 🎯 FINAL FIX: Correct navigation path confirmed as '/edit-profile'
            return (
                <TouchableOpacity 
                    style={[styles.btn, styles.editBtn]}
                    onPress={() => router.push('/edit-profile')} 
                >
                    <Text style={[styles.text, styles.editText]}>Edit Profile</Text>
                </TouchableOpacity>
            ); 
        }

        return (
            <FollowBtn
                userId={user.id}
                isFollowing={user.is_following}
                isFollowedByViewer={user.is_followed_by_viewer} 
            />
        );
    };

    return (
        <View style={styles.container}>
            {user.cover_photo && (
                <Image source={{ uri: getMediaUri(user.cover_photo) }} style={styles.coverPhoto} contentFit="cover" />
            )}
            
            <View style={styles.detailsContainer}>
                <Image source={{ uri: getMediaUri(user.avatar) }} style={styles.avatar} contentFit="cover" />

                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.username}>@{user.username}</Text>

                {user.bio ? (
                    <Text style={styles.bio}>{user.bio}</Text>
                ) : (
                    !isCurrentUser && <Text style={styles.bioPlaceholder}>No bio yet.</Text>
                )}

                <View style={styles.actionButtonContainer}>
                    {renderActionButton()}
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{user.posts_count}</Text>
                        <Text style={styles.statLabel}>Posts</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{user.followers_count}</Text>
                        <Text style={styles.statLabel}>Followers</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{user.following_count}</Text>
                        <Text style={styles.statLabel}>Following</Text>
                    </View>
                </View>

                {user.is_private && !user.is_following && !isCurrentUser && (
                    <Text style={styles.privateMessage}>This account is private.</Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.background,
        paddingBottom: 16,
    },
    coverPhoto: {
        width: '100%',
        height: 120,
        backgroundColor: Colors.border,
    },
    detailsContainer: {
        paddingHorizontal: 20,
        marginTop: -30, 
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: Colors.background,
        marginBottom: 10,
        backgroundColor: '#333',
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
    },
    username: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 8,
    },
    bio: {
        fontSize: 14,
        color: Colors.text,
        marginBottom: 10,
    },
    bioPlaceholder: {
        fontSize: 14,
        color: Colors.textTertiary,
        fontStyle: 'italic',
        marginBottom: 10,
    },
    actionButtonContainer: {
        marginVertical: 10,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.border,
        marginTop: 10,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    privateMessage: {
        fontSize: 14,
        color: Colors.primary,
        textAlign: 'center',
        marginTop: 15,
        fontWeight: '600',
    },
    // Styles for Edit Profile button
    btn: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80,
    },
    editBtn: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    text: {
        fontWeight: '600',
        fontSize: 13,
    },
    editText: {
        color: Colors.text,
    }
});
