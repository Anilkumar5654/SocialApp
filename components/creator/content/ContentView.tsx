import React from 'react';
// 👇 FIX: ScrollView को react-native से इम्पोर्ट करें
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'; 
import { ImageIcon, Film, Video } from 'lucide-react-native';
import Colors from '@/constants/colors';
import ContentItem from '../ContentItem'; // Reusing ContentItem

interface ContentViewProps {
    posts: any[];
    reels: any[];
    videos: any[];
    handleContentPress: (type: 'post' | 'reel' | 'video', id: string) => void;
    handleDelete: (item: any) => void;
}

const EmptyState = ({ type }: { type: 'post' | 'reel' | 'video' }) => {
    let icon = type === 'post' ? ImageIcon : type === 'reel' ? Film : Video;
    let message = `No ${type}s uploaded yet.`;
    
    return (
        <View style={styles.emptyState}>
            {React.createElement(icon, { color: Colors.textSecondary, size: 40 })}
            <Text style={styles.emptyText}>{message}</Text>
        </View>
    );
};

export default function ContentView({ posts, reels, videos, handleContentPress, handleDelete }: ContentViewProps) {

    const handleMenuPress = (item: any) => {
        Alert.alert('Content Actions', `Options for ${item.title || 'this content'}`, [
            { text: 'View Analytics', onPress: () => handleContentPress(item.type, item.id) },
            { text: 'Delete', onPress: () => handleDelete(item), style: 'destructive' },
            { text: 'Cancel', style: 'cancel' }
        ]);
    };

    return (
        // 👇 FIX: ScrollView is now available for use
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            {/* 1. Posts Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Posts</Text>
                    <View style={styles.contentCount}><ImageIcon color={Colors.textSecondary} size={16} /><Text style={styles.contentCountText}>{posts.length}</Text></View>
                </View>
                <Text style={styles.sectionHint}>Tap a post to view its page.</Text>
                {posts.length > 0 ? ( 
                    posts.map((post) => (<ContentItem key={post.id} type="post" item={post} onPress={() => handleContentPress('post', post.id)}/>))
                ) : (<EmptyState type="post" />)}
            </View>

            {/* 2. Reels Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Reels</Text>
                    <View style={styles.contentCount}><Film color={Colors.textSecondary} size={16} /><Text style={styles.contentCountText}>{reels.length}</Text></View>
                </View>
                {reels.length > 0 ? ( 
                    reels.map((reel) => (<ContentItem key={reel.id} type="reel" item={reel} onPress={() => handleContentPress('reel', reel.id)}/>))
                ) : (<EmptyState type="reel" />)}
            </View>

            {/* 3. Videos Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Videos</Text>
                    <View style={styles.contentCount}><Video color={Colors.textSecondary} size={16} /><Text style={styles.contentCountText}>{videos.length}</Text></View>
                </View>
                <Text style={styles.sectionHint}>Tap on a video to view detailed analytics</Text>
                {videos.length > 0 ? ( 
                    videos.map((video) => (<ContentItem key={video.id} type="video" item={video} onPress={() => handleContentPress('video', video.id)}/>))
                ) : (<EmptyState type="video" />)}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { paddingBottom: 20 },
    section: { padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 20, fontWeight: '700' as const, color: Colors.text },
    contentCount: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
    contentCountText: { fontSize: 14, fontWeight: '600' as const, color: Colors.textSecondary },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 12 },
    emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
    sectionHint: { fontSize: 13, color: Colors.textMuted, marginBottom: 12, fontStyle: 'italic' as const },
});
