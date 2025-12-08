import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ContentItem from '../ContentItem';
import Colors from '@/constants/colors';

interface RecentContentProps {
    videos: any[];
    // Ensure this handler is passed correctly from the main controller
    handleContentPress: (type: 'post' | 'reel' | 'video', id: string) => void; 
}

export default function RecentContent({ videos, handleContentPress }: RecentContentProps) {
    if (videos.length === 0) return null;
    
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Latest videos</Text>
            
            {videos.slice(0, 3).map((video) => (
                // 👇 FIX: The entire ContentItem component must be clean JSX
                <ContentItem
                    key={video.id}
                    type="video"
                    item={video}
                    onPress={() => handleContentPress('video', video.id)} 
                    hideStats={true} 
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    section: { padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, borderTopWidth: 1, borderTopColor: Colors.border },
    sectionTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text, marginBottom: 12 },
});
