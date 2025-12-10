import React, { useState, useRef } from 'react';
import { View, FlatList, ActivityIndicator, Dimensions, RefreshControl, StatusBar, Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import Colors from '@/constants/colors';
import { useRouter } from 'expo-router'; // 👈 useRouter added
import { Camera } from 'lucide-react-native'; // 👈 Camera icon added

import ReelItem from '@/components/reels/ReelItem';
import CommentsModal from '@/components/modals/CommentsModal';
import ReportModal from '@/components/modals/ReportModal';
import OptionsModal from '@/components/modals/OptionsModal';

// 🛠️ FIX: Using Full Screen Height (No subtraction) to fix gap
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ReelsScreen() {
    const router = useRouter(); // 👈 Initialize router
    const [activeIndex, setActiveIndex] = useState(0);
    const [page, setPage] = useState(1);
    
    const [activeReel, setActiveReel] = useState<any>(null);
    const [showComments, setShowComments] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [showReport, setShowReport] = useState(false);

    const { user: currentUser } = useAuth();
    const queryClient = useQueryClient();

    const { data, isLoading, refetch, isRefetching } = useQuery({ 
        queryKey: ['reels-feed', page], 
        queryFn: () => api.reels.getReels(page, 5) 
    });
    
    const reels = data?.reels || [];

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.reels.delete(id),
        onSuccess: () => {
            Alert.alert('Success', 'Reel deleted successfully');
            setShowOptions(false);
            refetch(); 
        },
        onError: (err: any) => Alert.alert('Error', err.message)
    });

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setActiveIndex(viewableItems[0].index ?? 0);
        }
    }).current;

    const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

    const handleCameraPress = () => {
        // 🚀 Navigation to Upload Screen
        router.push('/reels/upload');
    };

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
            
            {/* 📸 CAMERA BUTTON / HEADER OVERLAY */}
            <TouchableOpacity 
                style={styles.cameraButton} 
                onPress={handleCameraPress}
            >
                <Camera size={26} color="#fff" />
            </TouchableOpacity>

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
                // 🛠️ FIX: Using Full Height for snapping
                snapToInterval={SCREEN_HEIGHT}
                snapToAlignment="start"
                decelerationRate="fast"
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                getItemLayout={(_, index) => ({ 
                    length: SCREEN_HEIGHT, 
                    offset: SCREEN_HEIGHT * index, 
                    index 
                })}
                refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
                onEndReached={() => { if (data?.hasMore) setPage(p => p + 1); }}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={<View style={[styles.center, { height: SCREEN_HEIGHT }]}><Text style={{ color: Colors.textSecondary }}>No reels found</Text></View>}
            />

            {activeReel && (
                <>
                    <CommentsModal visible={showComments} onClose={() => setShowComments(false)} entityId={activeReel.id} entityType="reel" />
                    <OptionsModal visible={showOptions} onClose={() => setShowOptions(false)} isOwner={String(activeReel.user_id) === String(currentUser?.id)} onDelete={() => deleteMutation.mutate(activeReel.id)} onReport={() => setShowReport(true)} />
                    <ReportModal visible={showReport} onClose={() => setShowReport(false)} entityId={activeReel.id} type="reel" />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    center: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
    // ✅ NEW STYLE: Camera Button positioned top-right
    cameraButton: {
        position: 'absolute',
        top: 40, // Adjust based on safe area/status bar
        right: 20,
        zIndex: 100, // Ensure it is above the FlatList content
        padding: 8,
    }
});
