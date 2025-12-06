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
  StatusBar
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Search, X, ChevronLeft } from 'lucide-react-native';
import { Image } from 'expo-image'; // Expo Image Import

import Colors from '@/constants/colors';
import { api } from '@/services/api'; 
// Helpers: Assuming you have now created utils/helpers.ts
import { getMediaUrl, formatViews, formatTimeAgo } from '@/utils/helpers'; 

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- API FETCH FUNCTION ---
const searchVideosApi = async (query: string) => {
  if (!query) return { videos: [] };
  
  try {
    // Calling the newly added search function in api.videos
    const response = await api.videos.search(query); 
    return response; 
  } catch (error) {
    console.error('Video Search API Failed:', error);
    return { videos: [] };
  }
};

// --- SINGLE VIDEO CARD COMPONENT (Re-used for Results) ---
const ResultVideoCard = React.memo(({ video }: { video: any }) => {
  const handlePress = useCallback(() => {
    // Navigate to the player screen
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
        {/* Thumbnail Image */}
        <Image 
          source={{ uri: thumbnailUrl }} 
          style={styles.thumbnail} 
          contentFit="cover" 
          transition={200}
        />
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
  const [debouncedQuery, setDebouncedQuery] = useState(''); // Only updated on manual trigger

  // FIX 3: Removed useEffect/Debouncing logic. Manual search only.
  
  // 1. Data Fetching using debouncedQuery
  const { data: searchData, isLoading } = useQuery({
    queryKey: ['video-search', debouncedQuery],
    queryFn: () => searchVideosApi(debouncedQuery),
    enabled: !!debouncedQuery, // Only run the query if debouncedQuery is not empty
  });
  
  const searchResults = searchData?.videos || [];

  // Manual Search Handler (Triggered by button press or Enter key)
  const handleManualSearch = () => {
      Keyboard.dismiss(); 
      // Update debouncedQuery only when the user explicitly searches
      if (searchQuery.length > 0) {
          setDebouncedQuery(searchQuery); 
      } else {
          setDebouncedQuery(''); // Clear results if query is empty
      }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <Stack.Screen 
        options={{ 
            headerShown: false 
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
            onSubmitEditing={handleManualSearch} // <-- FIX 3: Manual search on Enter/Submit
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <X size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
            style={styles.searchIcon}
            onPress={handleManualSearch} // <-- FIX 3: Manual search on Search icon
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
  
  // Result Card Styles (Horizontal Layout - YouTube Search Result Style)
  resultCard: {
      flexDirection: 'row',
      marginBottom: 16,
      width: '100%', // FIX 2: Ensuring it takes full width of the container
  },
  thumbnailContainer: {
    width: (SCREEN_WIDTH * 0.4), // Approx 40% width for thumbnail
    aspectRatio: 16/9,
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: '#333',
    // Removed justifyContent/alignItems since Image covers the area now
  },
  thumbnail: { 
    width: '100%', 
    height: '100%', 
    borderRadius: 6 
  },
  
  textContainer: { 
      flex: 1, 
      paddingVertical: 2,
  },
  title: { color: Colors.text, fontSize: 15, fontWeight: '500', lineHeight: 20 },
  meta: { color: Colors.textSecondary, fontSize: 12, marginTop: 4 },
  
  // Empty State
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50, paddingHorizontal: 20 },
  emptyText: { color: Colors.textSecondary, fontSize: 16, textAlign: 'center' },
});
