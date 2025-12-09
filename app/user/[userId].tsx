// SearchScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Text,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Search as SearchIcon, X, ArrowLeft } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query'; 

import Colors from '@/constants/colors';
import { api } from '@/services/api';
import UserListItem from '@/components/user/UserListItem';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  // Fetch Users
  const { 
    data: usersData, 
    isLoading: isLoadingUsers,
    isFetching: isFetchingUsers 
  } = useQuery({
    queryKey: ['search-users', debouncedQuery],
    queryFn: () => api.search.users(debouncedQuery),
    enabled: debouncedQuery.length > 0, 
  });

  // Data Extraction
  const users = 
    (usersData as any)?.results?.users || 
    (usersData as any)?.users || 
    [];
  
  const isLoading = isFetchingUsers;

  const handleClearSearch = () => {
    setQuery('');
    setDebouncedQuery('');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={Colors.text} size={24} />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <SearchIcon color={Colors.textMuted} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..." 
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <X color={Colors.textMuted} size={18} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {isLoading && users.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <View style={styles.content}>
            <FlatList
              data={users}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <UserListItem user={item} /> 
              )}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                debouncedQuery ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No users found.</Text>
                  </View>
                ) : null
              }
            />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12 },
  backButton: { padding: 4 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 20, paddingHorizontal: 12, height: 40, gap: 8 },
  searchInput: { flex: 1, color: Colors.text, fontSize: 16, height: '100%' },
  content: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: 20 },
  emptyState: { padding: 32, alignItems: 'center' },
  emptyText: { color: Colors.textSecondary, fontSize: 16 },
});
