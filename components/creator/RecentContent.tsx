import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ContentItem from '../ContentItem';

interface RecentContentProps {
    videos: any[];
    handleContentPress: (type: 'post' | 'reel' | 'video', id: string) => void;
}

export default function RecentContent({ videos, handleContentPress }: RecentContentProps) {
    if (videos.length === 0) return null;
    
    return (
        <View style={styles.section}>
            [span_39](start_span)<Text style={styles.sectionTitle}>Latest videos</Text>[span_39](end_span)
            
            {videos.slice(0, 3).map((video) => (
                <ContentItem
                    key={video.id}
                    type="video"
                    item={video}
                    [span_40](start_span)onPress={() => handleContentPress('video', video.id)}[span_40](end_span)
                    hideStats={true} // Display only title and date in this summary
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    section: { padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
    sectionTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text, marginBottom: 12 },
});
