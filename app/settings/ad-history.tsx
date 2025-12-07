import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { BarChart2, Zap, Hand, Trash2 } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Colors from '@/constants/colors';
import { api } from '@/services/api'; 

// --- TYPE DEFINITIONS ---
interface AdInteraction {
    id: number;
    date: string;
    advertiser: string;
    action: 'Viewed' | 'Clicked';
}

// --- MOCK API ---
// NOTE: In a real app, this would fetch from ad_impressions/ad_clicks tables.
api.settings.getAdHistory = async (): Promise<AdInteraction[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { id: 1, date: '2025-12-06', advertiser: 'Tech Innovations Inc.', action: 'Clicked' },
      { id: 2, date: '2025-12-05', advertiser: 'Fashion Store XYZ', action: 'Viewed' },
      { id: 3, date: '2025-12-05', advertiser: 'Gaming Studio Alpha', action: 'Clicked' },
    ];
};

// --- Component for a single Ad Interaction row (unchanged) ---
const AdHistoryItem: React.FC<{ item: AdInteraction }> = ({ item }) => {
  const isClicked = item.action === 'Clicked';
  const icon = isClicked ? Hand : Zap;
  const iconColor = isClicked ? Colors.primary : Colors.info;

  return (
    <View style={styles.historyItem}>
      <View style={styles.iconContainer}>
        {React.createElement(icon, { color: iconColor, size: 20 })}
      </View>
      <View style={styles.historyInfo}>
        <Text style={styles.advertiserText}>{item.advertiser}</Text>
        <Text style={styles.actionText}>
          {item.action} on {item.date}
        </Text>
      </View>
      <Text style={[styles.statusBadge, { backgroundColor: isClicked ? Colors.primary : Colors.info }]}>
        {item.action}
      </Text>
    </View>
  );
};

// --- Main Screen Component ---

export default function AdHistoryScreen() {
  const queryClient = useQueryClient();
  
  const { data: history = [], isLoading, isError } = useQuery<AdInteraction[]>({
    queryKey: ['adHistory'],
    queryFn: api.settings.getAdHistory,
  });

  const clearHistoryMutation = useMutation({
    // Simulating a call to a dedicated clear endpoint
    mutationFn: () => new Promise((resolve) => setTimeout(() => resolve(true), 500)), 
    
    onMutate: async () => {
        // Optimistic Update: Clear the list immediately
        await queryClient.cancelQueries({ queryKey: ['adHistory'] });
        const previousHistory = queryClient.getQueryData<AdInteraction[]>(['adHistory']);
        queryClient.setQueryData(['adHistory'], []);
        return { previousHistory };
    },
    onSuccess: () => {
        Alert.alert('Success', 'Ad history successfully cleared.');
    },
    onError: (err, variables, context) => {
        // Rollback on failure
        queryClient.setQueryData(['adHistory'], context?.previousHistory);
        Alert.alert('Error', 'Failed to clear history.');
    },
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['adHistory'] });
    },
  });

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to permanently delete your ad interaction history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => clearHistoryMutation.mutate(),
        },
      ]
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <BarChart2 color={Colors.textMuted} size={40} />
      <Text style={styles.emptyText}>No recent ad activity found.</Text>
      <Text style={styles.emptySubText}>Impressions and clicks will appear here.</Text>
    </View>
  );

  if (isLoading) {
      return (
          <View style={[styles.container, styles.center]}>
              <ActivityIndicator size="large" color={Colors.primary} />
          </View>
      );
  }
  
  if (isError) {
       return (
          <View style={[styles.container, styles.center]}>
              <Text style={styles.errorText}>Failed to load ad history.</Text>
               <TouchableOpacity onPress={() => queryClient.invalidateQueries({ queryKey: ['adHistory'] })}>
                   <Text style={styles.linkButtonText}>Retry</Text>
               </TouchableOpacity>
          </View>
      );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Ad History',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
        }}
      />
      
      {/* Clear History Button in Header */}
      <View style={styles.headerActions}>
        <Text style={styles.headerNote}>Showing {history.length} recent interactions</Text>
        <TouchableOpacity 
          onPress={handleClearHistory} 
          disabled={history.length === 0 || clearHistoryMutation.isPending}
          style={styles.clearButton}
        >
          {clearHistoryMutation.isPending ? (
              <ActivityIndicator color={Colors.danger} size="small" />
          ) : (
              <Trash2 color={history.length === 0 ? Colors.textMuted : Colors.danger} size={18} />
          )}
          <Text style={[styles.clearButtonText, history.length === 0 && { color: Colors.textMuted }]}>
             {clearHistoryMutation.isPending ? 'Clearing...' : 'Clear History'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <AdHistoryItem item={item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  errorText: {
       color: Colors.danger,
      fontSize: 16,
      marginBottom: 10,
  },
  linkButtonText: {
      color: Colors.primary,
      fontWeight: '600' as const,
  },
  headerActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: Colors.border,
      backgroundColor: Colors.surface,
  },
  headerNote: {
      fontSize: 13,
      color: Colors.textSecondary,
  },
  clearButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      padding: 5,
  },
  clearButtonText: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: Colors.danger,
  },
  listContent: {
    paddingBottom: 20,
    backgroundColor: Colors.surface,
    flexGrow: 1,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  advertiserText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  actionText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 15,
      fontSize: 12,
      fontWeight: '700' as const,
      color: Colors.text,
      minWidth: 70,
      textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
    backgroundColor: Colors.surface,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: 15,
    fontWeight: '600' as const,
  },
  emptySubText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 5,
  }
});
