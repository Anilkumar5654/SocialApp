import React, { useState, useRef } from 'react';
import { View, FlatList, ActivityIndicator, Dimensions, RefreshControl, StatusBar, Alert, StyleSheet } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import Colors from '@/constants/colors';

// 👇 Clean Components
import ReelItem from '@/components/reels/ReelItem';
import CommentsModal from '@/components/modals/CommentsModal';
import ReportModal from '@/components/modals/ReportModal';
import OptionsModal from '@/components/modals/OptionsModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_TAB_HEIGHT = 80; // Adjust according to your TabBar height
const ACTUAL_HEIGHT = SCREEN_HEIGHT - BOTTOM_TAB_HEIGHT;

export default function ReelsScreen() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [page, setPage] = useState(1);
    
    // Modal Logic (Global for performance)
    const [activeReel, setActiveReel] = useState<any>(null);
    const [showComments, setShowComments] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [showReport, setShowReport] = useState(false);

    const { user: currentUser } = useAuth();
    const queryClient = useQueryClient();

    // 1. Fetch Reels
    const { data, isLoading, refetch, isRefetching } = useQuery({ 
        queryKey: ['reels-feed', page], 
        queryFn: () => api.reels.getReels(page, 5) 
    });
    
    const reels = data?.reels || [];

    // 2. Delete Mutation (Passed to Options Modal)
    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.reels.delete(id),
        onSuccess: () => {
            Alert.alert('Success', 'Reel deleted successfully');
            setShowOptions(false);
            refetch(); // Refresh list to remove deleted item
        },
        onError: (err: any) => Alert.alert('Error', err.message)
    });

    // 3. Viewability Logic (To play only the active video)
    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setActiveIndex(viewableItems[0].index ?? 0);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50
    }).current;

    // Loading State
    if (isLoading && page === 1) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            <FlatList
                data={reels}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item, index }) => (
                    <ReelItem 
                        item={item} 
                        isActive={index === activeIndex}
                        openComments={(id) => { setActiveReel(item); setShowComments(true); }}
                        openOptions={(r) => { setActiveReel(r); setShowOptions(true); }}
                    />
                )}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                snapToInterval={ACTUAL_HEIGHT}
                snapToAlignment="start"
                decelerationRate="fast"
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                
                // Layout Calculation for Smooth Scrolling / Precision
                getItemLayout={(_, index) => ({ 
                    length: ACTUAL_HEIGHT, 
                    offset: ACTUAL_HEIGHT * index, 
                    index 
                })}
                
                refreshControl={
                    <RefreshControl 
                        refreshing={isRefetching} 
                        onRefresh={refetch} 
                        tintColor={Colors.primary} 
                    />
                }
                
                onEndReached={() => { if (data?.hasMore) setPage(p => p + 1); }}
                onEndReachedThreshold={0.5}
                
                ListEmptyComponent={
                    <View style={[styles.center, { height: ACTUAL_HEIGHT }]}>
                        <Text style={{ color: Colors.textSecondary }}>No reels found</Text>
                    </View>
                }
            />

            {/* Global Modals (Rendered once per screen) */}
            {activeReel && (
                <>
                    <CommentsModal 
                        visible={showComments} 
                        onClose={() => setShowComments(false)} 
                        entityId={activeReel.id} 
                        entityType="reel" 
                    />
                    
                    <OptionsModal
                        visible={showOptions}
                        onClose={() => setShowOptions(false)}
                        isOwner={String(activeReel.user_id) === String(currentUser?.id)}
                        onDelete={() => deleteMutation.mutate(activeReel.id)}
                        onReport={() => setShowReport(true)}
                    />
                    
                    <ReportModal
                        visible={showReport}
                        onClose={() => setShowReport(false)}
                        entityId={activeReel.id}
                        type="reel"
                    />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    center: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }
});
