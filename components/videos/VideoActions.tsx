import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThumbsUp, ThumbsDown, Share2, MessageCircle, MoreVertical, Download } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { formatViews } from '@/utils/format';

interface VideoActionsProps {
    likesCount: number;
    isLiked: boolean;
    isDisliked: boolean;
    handleLike: () => void;
    handleDislike: () => void;
    handleShare: () => void;
    setShowComments: (show: boolean) => void;
    setShowMenu: (show: boolean) => void;
}

export default function VideoActions({
    likesCount, isLiked, isDisliked, handleLike, handleDislike, handleShare, setShowComments, setShowMenu
}: VideoActionsProps) {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
            <View style={styles.pill}>
                <TouchableOpacity style={styles.btn} onPress={handleLike}>
                    <ThumbsUp size={20} color={isLiked ? Colors.primary : Colors.text} fill={isLiked ? Colors.primary : "transparent"} />
                    <Text style={[styles.text, isLiked && { color: Colors.primary }]}>{formatViews(likesCount)}</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.btn} onPress={handleDislike}>
                    <ThumbsDown size={20} color={isDisliked ? Colors.primary : Colors.text} fill={isDisliked ? Colors.primary : "transparent"} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.circle} onPress={() => setShowComments(true)}>
                <MessageCircle size={20} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.circle} onPress={handleShare}>
                <Share2 size={20} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.circle} onPress={() => {}}>
                <Download size={20} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.circle} onPress={() => setShowMenu(true)}>
                <MoreVertical size={20} color={Colors.text} />
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { paddingHorizontal: 12, paddingVertical: 12, gap: 12 },
    pill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#222', borderRadius: 24 },
    btn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
    divider: { width: 1, height: 18, backgroundColor: '#444' },
    text: { color: '#fff', fontSize: 14, fontWeight: '600' },
    circle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center' },
});
                  
