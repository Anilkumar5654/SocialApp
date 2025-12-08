import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';

// 👇 Reusing the existing VideoCard (Clean Structure)
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
                    // 👇 Using VideoCard handles Image, Time, Clicks & Navigation automatically
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
        paddingBottom: 40, 
    },
    headerTitle: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: '700',
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    list: {
        // VideoCard internally manages its own spacing
    }
});
