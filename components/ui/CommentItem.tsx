// File: src/components/ui/CommentItem.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Trash2 } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { formatTimeAgo } from '@/constants/timeFormat';
import { getMediaUri } from '@/utils/media';

// --- TYPES (Matching the structure used in CommentsModal) ---
interface Comment {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
    user: {
        username: string;
        avatar: string;
    };
    replies?: Comment[]; // For future reply feature
    reply_count?: number;
}

interface CommentItemProps {
    comment: Comment;
    currentUser: any; // User object from useAuth (Used for ownership check)
    onUserPress: (userId: string) => void;
    onDelete: (commentId: string) => void; // Function to handle delete mutation
    onReply: (comment: Comment) => void;  // Placeholder for future reply feature
    isReply: boolean; // Flag for indentation (currently not active in modal)
}

export default function CommentItem({ 
    comment, 
    currentUser, 
    onUserPress, 
    onDelete, 
    onReply, 
    isReply 
}: CommentItemProps) {
    
    // 🎯 FIX: Check if the current user owns this comment for showing Trash2 icon
    const isOwner = String(currentUser?.id) === String(comment.user_id);

    // Style adjustment for indentation (future use)
    const containerStyle = isReply ? styles.replyContainer : styles.topLevelContainer;

    return (
        <View style={containerStyle}>
            <View style={styles.item}>
                
                {/* 1. Avatar */}
                <TouchableOpacity onPress={() => onUserPress(comment.user_id)}>
                    <Image source={{ uri: getMediaUri(comment.user?.avatar) }} style={styles.avatar} />
                </TouchableOpacity>
                
                {/* 2. Content Area */}
                <View style={styles.content}>
                    <View style={styles.row}>
                        <Text style={styles.username}>{comment.user?.username || 'User'}</Text>
                        <Text style={styles.time}>{formatTimeAgo(comment.created_at)}</Text>
                    </View>
                    <Text style={styles.text}>{comment.content}</Text>
                    
                    {/* Actions: Reply Button */}
                    <View style={styles.actions}>
                        {/* Placeholder for future reply functionality */}
                        <TouchableOpacity onPress={() => onReply(comment)}>
                            <Text style={styles.replyText}>Reply</Text>
                        </TouchableOpacity>
                        
                        {/* Future: Show Reply Count */}
                        {comment.reply_count && comment.reply_count > 0 ? (
                             <TouchableOpacity style={styles.replyCountBtn}>
                                <Text style={styles.replyCountText}>{comment.reply_count} Replies</Text>
                            </TouchableOpacity>
                        ) : null}

                    </View>
                </View>

                {/* 3. Delete Button (Only for owner) */}
                {isOwner && (
                    <TouchableOpacity onPress={() => onDelete(comment.id)} style={styles.deleteBtn}>
                        <Trash2 size={16} color={Colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    topLevelContainer: {
        marginBottom: 20,
        paddingHorizontal: 16, // Added padding to match modal's original styling
    },
    replyContainer: {
        marginLeft: 40, // Indent for replies (future)
        marginTop: 10,
        marginBottom: 10,
        paddingHorizontal: 16, 
    },
    
    item: { 
        flexDirection: 'row', 
        gap: 12,
        flex: 1,
    },
    avatar: { 
        width: 36, 
        height: 36, 
        borderRadius: 18, 
        backgroundColor: '#333' 
    },
    content: { 
        flex: 1, 
        gap: 4 
    },
    row: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 8 
    },
    username: { 
        color: Colors.text, 
        fontWeight: '600', 
        fontSize: 13 
    },
    time: { 
        color: Colors.textSecondary, 
        fontSize: 11 
    },
    text: { 
        color: Colors.text, 
        fontSize: 14, 
        lineHeight: 20 
    },
    
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 15,
    },
    replyText: {
        color: Colors.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
    replyCountBtn: {
        paddingVertical: 2,
    },
    replyCountText: {
        color: Colors.primary,
        fontSize: 12,
        fontWeight: '600',
    },
    
    deleteBtn: { 
        padding: 4, 
        alignSelf: 'flex-start' 
    },
});
