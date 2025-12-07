import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Download, CheckCircle, Clock } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Colors from '@/constants/colors';
import { api } from '@/services/api'; 

// --- TYPE DEFINITIONS for Data Export ---
interface Request {
    id: number;
    date: string;
    status: 'Ready' | 'Processing' | 'Expired';
    format: string;
    size: string;
    downloadUrl?: string; // New field for actual download link
}

// Mock API functions for data export (Must be defined in api.ts settings module)
// Assuming API Endpoints: /settings/data/requests (GET) and /settings/data/request-export (POST)

export default function DataExportScreen() {
  const queryClient = useQueryClient();
  const [selectedFormat, setSelectedFormat] = useState<'JSON' | 'HTML'>('JSON');

  // 1. Fetch current requests status
  const { data: pastRequests = [], isLoading: isLoadingRequests, isError: isErrorRequests } = useQuery<Request[]>({
    queryKey: ['dataExportRequests'],
    // NOTE: Assuming api.settings has getDataExportRequests: async () => this.request('/settings/data/requests')
    queryFn: async () => {
        // Mocking the API fetch for request history
        await new Promise(resolve => setTimeout(resolve, 500));
        return [
            { id: 101, date: '2025-11-01', status: 'Ready', format: 'JSON', size: '105 MB', downloadUrl: 'mock/download/101' },
            { id: 102, date: '2025-12-01', status: 'Processing', format: 'HTML', size: '...', downloadUrl: undefined },
        ];
    },
  });

  // 2. Mutation for creating a new request
  const requestMutation = useMutation({
    mutationFn: (format: 'JSON' | 'HTML') => {
        // NOTE: Assuming api.settings has requestDataExport: async (format) => this.request('/settings/data/request-export', { method: 'POST', body: JSON.stringify({ format }) })
        return new Promise((resolve) => {
            setTimeout(() => resolve({ success: true }), 300); // Mocking API call
        });
    },
    onSuccess: () => {
        Alert.alert('Request Sent', 'Your data export request is processing. Check this page later to download your file.');
        queryClient.invalidateQueries({ queryKey: ['dataExportRequests'] });
    },
    onError: () => {
        Alert.alert('Error', 'Failed to submit data request. Please try again.');
    },
  });
  
  const isRequesting = requestMutation.isPending;

  const handleRequestData = () => {
    // Safety check before processing sensitive data request
    Alert.alert(
      'Confirm Data Request',
      `You are requesting a copy of your data in ${selectedFormat} format. This process may take several hours.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request',
          onPress: () => requestMutation.mutate(selectedFormat),
          style: 'default',
        },
      ]
    );
  };
  
  const handleDownload = (request: Request) => {
      // Logic for actual file download using Linking.openURL or an external browser
      Alert.alert('Download', `Simulating download of archive from ${request.date}.`);
      // Linking.openURL(request.downloadUrl!); 
  };

  const getStatusColor = (status: Request['status']) => {
    switch (status) {
      case 'Ready':
        return Colors.success;
      case 'Processing':
        return Colors.info;
      case 'Expired':
        return Colors.danger;
      default:
        return Colors.textMuted;
    }
  };
  
  const renderRequestItem = (item: Request) => (
    <View key={item.id} style={styles.requestItem}>
      <View style={styles.requestInfo}>
        <Text style={styles.requestDate}>{item.date} ({item.format})</Text>
        <Text style={[styles.requestStatus, { color: getStatusColor(item.status) }]}>
          {item.status} ({item.size})
        </Text>
      </View>
      
      {item.status === 'Ready' && (
        <TouchableOpacity style={styles.downloadButton} onPress={() => handleDownload(item)}>
          <Text style={styles.downloadButtonText}>Download</Text>
        </TouchableOpacity>
      )}
      {item.status === 'Processing' && (
        <ActivityIndicator color={Colors.info} size="small" />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Download Your Data',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
        }}
      />
      <ScrollView style={styles.content}>
        
        {/* --- 1. Information --- */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>What's included?</Text>
          <Text style={styles.infoText}>
            This archive includes a copy of your content (posts, reels, videos), messages, account information, and activity logs.
          </Text>
        </View>

        {/* --- 2. Format Selection --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>File Format</Text>
          <View style={styles.formatContainer}>
            {['JSON', 'HTML'].map(format => (
              <TouchableOpacity
                key={format}
                style={[
                  styles.formatOption,
                  selectedFormat === format && styles.formatSelected,
                ]}
                onPress={() => setSelectedFormat(format as 'JSON' | 'HTML')}
                disabled={isRequesting}
              >
                <Text style={styles.formatText}>{format}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* --- 3. Request Button --- */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.requestButton, (isRequesting || isLoadingRequests) && styles.requestButtonDisabled]}
            onPress={handleRequestData}
            disabled={isRequesting || isLoadingRequests}
          >
            {isRequesting ? (
              <ActivityIndicator color={Colors.text} />
            ) : (
              <View style={styles.requestButtonContent}>
                <Download color={Colors.text} size={20} />
                <Text style={styles.requestButtonText}>Request Archive</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.processingNote}>
            <Clock color={Colors.textMuted} size={14} /> Processing time may take up to 48 hours.
          </Text>
        </View>

        {/* --- 4. Request History --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Request History</Text>
          {isLoadingRequests ? (
              <ActivityIndicator color={Colors.primary} style={{ padding: 20 }} />
          ) : pastRequests.length === 0 ? (
            <Text style={styles.emptyHistoryText}>No past requests found.</Text>
          ) : (
            pastRequests.map(renderRequestItem)
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  section: {
    paddingVertical: 10,
    borderBottomWidth: 8,
    borderBottomColor: Colors.surface,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingVertical: 12,
    letterSpacing: 0.5,
  },
  // --- Info Section ---
  infoSection: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  // --- Format Selection ---
  formatContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 10,
    backgroundColor: Colors.surface,
  },
  formatOption: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  formatSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '20',
  },
  formatText: {
    color: Colors.text,
    fontWeight: '600' as const,
  },
  // --- Request Button ---
  requestButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
  },
  requestButtonDisabled: {
    opacity: 0.5,
  },
  requestButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  requestButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  processingNote: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  // --- History Styles ---
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  requestInfo: {
    flex: 1,
  },
  requestDate: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  requestStatus: {
    fontSize: 13,
    marginTop: 2,
  },
  downloadButton: {
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  downloadButtonText: {
    color: Colors.text,
    fontWeight: '700' as const,
    fontSize: 14,
  },
  emptyHistoryText: {
      padding: 20,
      textAlign: 'center',
      color: Colors.textMuted,
  }
});
