import React, { useState, useRef, useCallback } from 'react';
import { View, FlatList, ActivityIndicator, Dimensions, RefreshControl, StatusBar, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import Colors from '@/constants/colors';
import { router } from 'expo-router';

import ReelItem from '@/components/reels/ReelItem';
import CommentsModal from '@/components/modals/CommentsModal';
import ReportModal from '@/components/modals/ReportModal';
import OptionsModal from '@/components/modals/OptionsModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_TAB_HEIGHT = 80;
const ACTUAL_HEIGHT = SCREEN_HEIGHT - BOTTOM_TAB_HEIGHT;

export default function ReelsScreen() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [page, setPage] = useState(1);
    const [activeReel, setActiveReel] = useState<any>(null);
    
    // Modal States
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

    const likeMutation = useMutation({
        mutationFn: (id: string) => {
            const r = reels.find((x: any) => x.id === id);
            return r?.is_liked ? api.reels.unlike(id) : api.reels.like(id);
        },
        onSuccess: (_, id) => {
            queryClient.setQueryData(['reels-feed', page], (old: any) => ({
                ...old,
                reels: old.reels.map((r: any) => r.id === id ? { ...r, is_liked: !r.is_liked, likes_count: r.is_liked ? r.likes_count - 1 : r.likes_count + 1 } : r)
            }));
        }
    });

    const subscribeMutation = useMutation({
        mutationFn: (cid: string) => {
            const r = reels.find((x: any) => x.channel_id === cid);
            return r?.is_subscribed ? api.channels.unsubscribe(cid) : api.channels.subscribe(cid);
        },
        onSuccess: (_, cid) => {
            queryClient.setQueryData(['reels-feed', page], (old: any) => ({
                ...old,
                reels: old.reels.map((r: any) => r.channel_id === cid ? { ...r, is_subscribed: !r.is_subscribed } : r)
            }));
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.reels.delete(id),
        onSuccess: () => {
            Alert.alert('Deleted', 'Reel deleted successfully');
            refetch();
        }
    });

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index ?? 0);
    }).current;

    if (isLoading && page === 1) return <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center' }}><ActivityIndicator size="large" color={Colors.primary} /></View>;

    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <FlatList
                data={reels}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item, index }) => (
                    <ReelItem 
                        item={item} 
                        isActive={index === activeIndex}
                        toggleLike={(id) => likeMutation.mutate(id)}
                        toggleSubscribe={(cid) => subscribeMutation.mutate(cid)}
                        openComments={(id) => { setActiveReel(item); setShowComments(true); }}
                        openOptions={(r) => { setActiveReel(r); setShowOptions(true); }}
                    />
                )}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                snapToInterval={ACTUAL_HEIGHT}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
                getItemLayout={(_, index) => ({ length: ACTUAL_HEIGHT, offset: ACTUAL_HEIGHT * index, index })}
                refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
                onEndReached={() => { if (data?.hasMore) setPage(p => p + 1); }}
            />

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
