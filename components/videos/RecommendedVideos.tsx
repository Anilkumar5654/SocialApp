import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';

// 👇 Reusing the existing component (No code duplication)
import VideoCard from '@/components/videos/VideoCard';

interface RecommendedVideosProps {
    videos: any[];
}

export default function RecommendedVideos({ videos }: RecommendedVideosProps) {
    // Safety check
    if (!videos || videos.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Up Next</Text>
            
            <View style={styles.list}>
                {videos.map((item) => (
                    // 👇 VideoCard handles Image, Time Format, Clicks & Navigation internally
                    <VideoCard 
                        key={item.id} 
                        video={item} 
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
        paddingBottom: 40, // Space at bottom
    },
    headerTitle: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: '700',
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    list: {
        // VideoCard already has marginBottom and background color
    }
});
