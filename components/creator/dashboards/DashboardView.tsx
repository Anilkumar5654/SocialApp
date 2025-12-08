import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native'; // Added Text and StyleSheet
import Colors from '@/constants/colors'; // ⬅️ FIX: Missing Colors Import Added

// Imported components (assuming they are correctly saved)
import DashboardStats from './DashboardStats';
import RecentContent from '../RecentContent';

interface DashboardViewProps {
    stats: any;
    recentContent: any[];
    isLoading: boolean;
    currentWatchHours: number;
    handleContentPress: (type: 'post' | 'reel' | 'video', id: string) => void;
}

export default function DashboardView({ stats, recentContent, isLoading, currentWatchHours, handleContentPress }: DashboardViewProps) {
  
  // Helper to format views (usually comes from utils/format, added here for local integrity)
  const formatViews = (count: number) => count > 999999 ? `${(count / 1000000).toFixed(1)}M` : `${(count / 1000).toFixed(1)}K`;

  return (
    <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }} 
    >
        {/* 1. Performance and Stats Grid */}
        <DashboardStats 
            stats={stats} 
            currentWatchHours={currentWatchHours} 
        />
        
        {/* 2. Latest Uploads Summary */}
        <RecentContent 
            videos={recentContent} 
            handleContentPress={handleContentPress} 
        />

        {/* 3. Placeholder for overall analytics card (Used Colors object here) */}
        {stats && (
            <View style={styles.reachCardWrapper}>
                <View style={styles.reachCard}>
                    <Text style={styles.reachCardText}>
                        Your content reached {formatViews(stats.total_views)} people this month
                    </Text>
                </View>
            </View>
        )}
    </ScrollView>
  );
}

// Added styles for the reach card to avoid inline styling complexity
const styles = StyleSheet.create({
    reachCardWrapper: {padding: 16},
    reachCard: {
        backgroundColor: '#1A1A1A', 
        borderRadius: 12, 
        padding: 24, 
        alignItems: 'center', 
        borderWidth: 1, 
        borderColor: '#333'
    },
    reachCardText: {
        fontSize: 16, 
        color: Colors.text, // Now correctly imported
        textAlign: 'center', 
        lineHeight: 22
    }
});
