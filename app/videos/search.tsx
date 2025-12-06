import { router, Stack } from 'expo-router';
import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  Text,
  Keyboard,
  Dimensions,
  StatusBar,
  Pressable // Import Pressable for channel tap
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Search, X, ChevronLeft } from 'lucide-react-native';
import { Image } from 'expo-image';

import Colors from '@/constants/colors';
import { api } from '@/services/api'; 
// Helpers: Assuming you have now created utils/helpers.ts
import { getMediaUrl, formatViews, formatTimeAgo } from '@/utils/helpers'; 

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- API FETCH FUNCTION ---
const searchVideosApi = async (query: string) => {
  if (!query) return { videos: [] };
  try {
    const response = await api.videos.search(query); 
    return response; 
  } catch (error) {
    console.error('Video Search API Failed:', error);
    return { videos: [] };
  }
};

// --- SINGLE VIDEO CARD COMPONENT (NOW FULL-WIDTH FEED STYLE) ---
const ResultVideoCard = React.memo(({ video }: { video: any }) => {
  const handlePress = useCallback(() => {
    router.push({ pathname: '/videos/player', params: { videoId: video.id } });
  }, [video.id]);

  const handleChannelPress = useCallback(() => {
    if (video.channel_id) {
        router.push({ pathname: '/channel/[channelId]', params: { channelId: video.channel_id } });
    }
  }, [video.channel_id]);

  // Data Handling
  const thumbnailUrl = getMediaUrl(video.thumbnail_url);
  const channelName = video.channel_name || video.user?.channel_name || 'Unknown Channel';
  const channelAvatar = getMediaUrl(video.channel_avatar || video.user?.avatar || 'assets/c_profile.jpg');
  const viewsDisplay = formatViews(video.views_count);
  const videoDuration = Number(video.duration) || 0;
  
  // NOTE: Assuming formatDuration helper exists in utils/helpers.ts or similar. 
  // If not, we use a simple fallback for now.
  const formatDurationFallback = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity 
      style={styles.videoCard} // Reusing videoCard style
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {/* 1. Thumbnail Section (Full Width) */}
      <View style={styles.thumbnailContainer}>
        <Image 
          source={{ uri: thumbnailUrl }} 
          style={styles.thumbnail} 
          contentFit="cover"
          transition={200}
        />
        {/* Duration Badge */}
        {videoDuration > 0 && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>
                {formatDurationFallback(videoDuration)} 
            </Text>
          </View>
        )}
      </View>
      
      {/* 2. Info Section (Avatar + Text) */}
      <View style={styles.videoInfoRow}>
        {/* Channel Avatar */}
        <Pressable onPress={handleChannelPress}>
           <Image source={{ uri: channelAvatar }} style={styles.avatar} />
        </Pressable>

        {/* Text Details */}
        <View style={styles.videoDetailsColumn}>
            <Text style={styles.videoTitle} numberOfLines={2}>
              {video.title || 'Untitled Video'}
            </Text>
            
            <Text style={styles.metaText} numberOfLines={1}>
              {channelName}
              {' · '}
              {viewsDisplay} views
              {' · '}
              {formatTimeAgo(video.created_at)}
            </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});


// --- MAIN SEARCH SCREEN ---
export default function SearchVideosScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(''); 

  // 1. Data Fetching using debouncedQuery
  const { data: searchData, isLoading } = useQuery({
    queryKey: ['video-search', debouncedQuery],
    queryFn: () => searchVideosApi(debouncedQuery),
    enabled: !!debouncedQuery,
  });
  
  const searchResults = searchData?.videos || [];

  // Manual Search Handler (Triggered by button press or Enter key)
  const handleManualSearch = () => {
      Keyboard.dismiss(); 
      if (searchQuery.length > 0) {
          setDebouncedQuery(searchQuery); 
      } else {
          setDebouncedQuery(''); 
      }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Custom Search Header */}
      <View style={styles.searchHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
             <ChevronLeft size={24} color={Colors.text} /> 
        </TouchableOpacity>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Search videos..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
            returnKeyType="search"
            onSubmitEditing={handleManualSearch} 
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <X size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
            style={styles.searchIcon}
            onPress={handleManualSearch} 
        >
            <Search size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>
      
      {/* Search Results / Loading */}
      <View style={{ flex: 1 }}>
        {isLoading && debouncedQuery ? (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={(item: any) => item.id.toString()}
            renderItem={({ item }) => <ResultVideoCard video={item} />}
            // Padding reduced here, padding is now handled by videoCard/thumbnail
            contentContainerStyle={styles.videosList} 
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => {
                if (debouncedQuery.length === 0) {
                    return (
                        <View style={styles.emptyContainer}>
                             <Text style={styles.emptyText}>Search to find videos, channel, and more.</Text>
                        </View>
                    );
                }
                return (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No results found for "{debouncedQuery}"</Text>
                    </View>
                );
            }}
          />
        )}
      </View>
    </View>
  );
}

// --- STYLES (MATCHING VideosScreen.tsx FEED STYLE) ---

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loader: { marginTop: 20 },
  
  // Header Styles
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    paddingTop: 40,
  },
  backButton: { padding: 4 },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    height: 40,
    marginHorizontal: 8,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    paddingHorizontal: 10,
  },
  clearButton: { padding: 8 },
  searchIcon: { padding: 4 },
  
  // Video List Container
  videosList: {
    paddingBottom: 20,
    // Removed paddingHorizontal here, let the card itself handle it if needed
  },
  
  // Video Card Styles (Matching VideosScreen.tsx feed)
  videoCard: {
    marginBottom: 20,
    backgroundColor: Colors.background,
  },
  thumbnailContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.5625, // 16:9 Ratio
    backgroundColor: '#1A1A1A',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  
  // Info Section
  videoInfoRow: {
    flexDirection: 'row',
    paddingHorizontal: 16, // Added padding to match VideosScreen.tsx header/content padding
    paddingVertical: 12,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#333',
  },
  videoDetailsColumn: {
    flex: 1,
    gap: 4,
  },
  videoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 20,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  
  // Empty State
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50, paddingHorizontal: 20 },
  emptyText: { color: Colors.textSecondary, fontSize: 16, textAlign: 'center' },
});
