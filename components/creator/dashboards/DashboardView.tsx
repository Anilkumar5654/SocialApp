import React from 'react';
import { View, ScrollView } from 'react-native';
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
  // Logic to show loading state can also be here, but controlled in main controller
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
        <DashboardStats stats={stats} currentWatchHours={currentWatchHours} />
        <RecentContent videos={recentContent} handleContentPress={handleContentPress} />
        
        {/* Placeholder for overall analytics card (Source: 608) */}
        {stats && (
            <View style={{padding: 16}}>
                <View style={{backgroundColor: '#1A1A1A', borderRadius: 12, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#333'}}>
                    <Text style={{fontSize: 16, color: Colors.text, textAlign: 'center', lineHeight: 22}}>
                        [span_41](start_span)Your content reached {stats.total_views > 999999 ? `${(stats.total_views / 1000000).toFixed(1)}M` : `${(stats.total_views / 1000).toFixed(1)}K`} people this month[span_41](end_span)
                    </Text>
                </View>
            </View>
        )}
    </ScrollView>
  );
}
