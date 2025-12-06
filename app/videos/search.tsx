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
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Search, X, ChevronLeft } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { api, MEDIA_BASE_URL } from '@/services/api'; // Ensure correct path
import { getMediaUrl, formatViews, formatTimeAgo } from '@/utils/helpers'; // Assuming you have these helpers globally or will create them

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- API FETCH FUNCTION ---
const searchVideosApi = async (query: string) => {
  if (!query) return { videos: [] };
  
  // API call: Assuming 'api.videos.search' exists and accepts a query string
  try {
    const response = await api.videos.search(query); 
    return response; // Assuming API returns { videos: [...], total: 50 }
  } catch (error) {
    console.error('Video Search API Failed:', error);
    return { videos: [] };
  }
};

// --- SINGLE VIDEO CARD COMPONENT (Re-used for Results) ---
const ResultVideoCard = React.memo(({ video }: { video: any }) => {
  const handlePress = useCallback(() => {
    // Navigate back to the player screen
    router.push({ pathname: '/videos/player', params: { videoId: video.id } });
  }, [video.id]);

  const thumbnailUrl = getMediaUrl(video.thumbnail_url);
  const channelName = video.channel_name || video.user?.channel_name || 'Unknown Channel';
  const viewsDisplay = formatViews(video.views_count);

  return (
    <TouchableOpacity 
      style={styles.resultCard} 
      onPress={handlePress}
    >
      <View style={styles.thumbnailContainer}>
        {/* Placeholder for Image component if you reuse the one from the main screen */}
        <Text style={styles.thumbnailPlaceholder}>Image</Text> 
        {/* <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} contentFit="cover" /> */}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={2}>{video.title || 'Untitled Video'}</Text>
        <Text style={styles.meta} numberOfLines={1}>
            {channelName} · {viewsDisplay} views · {formatTimeAgo(video.created_at)}
        </Text>
      </View>
    </TouchableOpacity>
  );
});


// --- MAIN SEARCH SCREEN ---
export default function SearchVideosScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // 1. Debouncing Logic
  useEffect(() => {
    const handler = setTimeout(() => {
      // Only set debounced query if the length is 3 or more, to avoid searching for single letters
      if (searchQuery.length >= 3 || searchQuery.length === 0) {
          setDebouncedQuery(searchQuery);
      }
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // 2. Data Fetching using debouncedQuery
  const { data: searchData, isLoading } = useQuery({
    queryKey: ['video-search', debouncedQuery],
    queryFn: () => searchVideosApi(debouncedQuery),
    enabled: !!debouncedQuery, // Only run the query if debouncedQuery is not empty
  });
  
  const searchResults = searchData?.videos || [];

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
            headerShown: false // Use custom header for YouTube style search bar
        }} 
      />
      
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
            onSubmitEditing={() => { 
                Keyboard.dismiss(); 
                setDebouncedQuery(searchQuery); // Immediate search on Enter/Go
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <X size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
            style={styles.searchIcon}
            onPress={() => {
                Keyboard.dismiss(); 
                setDebouncedQuery(searchQuery); // Final search trigger
            }}
        >
            <Search size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>
      
      {/* Search Results / Loading */}
      <View style={{ flex: 1 }}>
        {isLoading && debouncedQuery ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={(item: any) => item.id.toString()}
            renderItem={({ item }) => <ResultVideoCard video={item} />}
            contentContainerStyle={styles.videosList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        {debouncedQuery.length === 0 ? 'Type at least 3 letters to search.' : 'No results found for "' + debouncedQuery + '"'}
                    </Text>
                </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  
  // Header Styles
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    paddingTop: 40, // Adjust based on your useSafeAreaInsets or header height
  },
  backButton: {
      padding: 4,
  },
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
  clearButton: {
    padding: 8,
  },
  searchIcon: {
    padding: 4,
  },
  
  // List Styles
  videosList: {
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  
  // Result Card Styles (Customize these)
  resultCard: {
      flexDirection: 'row',
      marginBottom: 16,
      // Adjust width for landscape thumbnail layout
      width: SCREEN_WIDTH - 32, 
  },
  thumbnailContainer: {
    width: (SCREEN_WIDTH * 0.4), // Approx 40% width for thumbnail
    aspectRatio: 16/9,
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailPlaceholder: {
      color: Colors.textSecondary,
      fontSize: 12
  },
  // If using Expo-Image:
  // thumbnail: { width: '100%', height: '100%', borderRadius: 6 },
  
  textContainer: { 
      flex: 1, 
      paddingVertical: 2,
  },
  title: { color: Colors.text, fontSize: 15, fontWeight: '500', lineHeight: 20 },
  meta: { color: Colors.textSecondary, fontSize: 12, marginTop: 4 },
  
  // Empty State
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { color: Colors.textSecondary, fontSize: 16, textAlign: 'center' },
});
