import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
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
import Colors from '@/constants/colors';
import { api } from '@/services/api';

// 👇 Reusing Existing Components & Utils
import VideoCard from '@/components/videos/VideoCard';

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

export default function SearchVideosScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(''); 

  const { data: searchData, isLoading } = useQuery({
    queryKey: ['video-search', debouncedQuery],
    queryFn: () => searchVideosApi(debouncedQuery),
    enabled: !!debouncedQuery,
  });

  const searchResults = searchData?.videos || [];

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
      
      {/* Search Header */}
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
        <TouchableOpacity style={styles.searchIcon} onPress={handleManualSearch}>
            <Search size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>
      
      {/* Results */}
      <View style={{ flex: 1 }}>
        {isLoading && debouncedQuery ? (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={(item: any) => item.id.toString()}
            // 👇 Replaced ResultVideoCard with Standard VideoCard
            renderItem={({ item }) => <VideoCard video={item} />} 
            contentContainerStyle={styles.videosList} 
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        {debouncedQuery.length === 0 
                            ? "Search to find videos, channels, and more." 
                            : `No results found for "${debouncedQuery}"`}
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
  loader: { marginTop: 20 },
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
  videosList: { paddingBottom: 20 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50, paddingHorizontal: 20 },
  emptyText: { color: Colors.textSecondary, fontSize: 16, textAlign: 'center' },
});
