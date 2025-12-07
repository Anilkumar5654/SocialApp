import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { UserMinus } from 'lucide-react-native';
// NOTE: For a real app, you would use Image component for avatars

import Colors from '@/constants/colors';
// import { api } from '@/services/api'; 

// --- MOCK DATA ---
const initialBlockedUsers = [
  { id: '1', username: 'toxic_user_1', name: 'Toxic Troll', avatar: 'url1' },
  { id: '2', username: 'spam_bot_42', name: 'Spam Bot', avatar: 'url2' },
  { id: '3', username: 'old_ex_2', name: 'Old Acquaintance', avatar: 'url3' },
];

// --- Component for a single blocked user row ---
interface BlockedUserItemProps {
  user: typeof initialBlockedUsers[0];
  onUnblock: (userId: string) => void;
  isUnblocking: boolean;
}

const BlockedUserItem: React.FC<BlockedUserItemProps> = ({ user, onUnblock, isUnblocking }) => {
  return (
    <View style={styles.userItem}>
      {/* Avatar Placeholder */}
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>{user.username.charAt(0).toUpperCase()}</Text>
      </View>
      
      <View style={styles.userInfo}>
        <Text style={styles.usernameText}>{user.username}</Text>
        <Text style={styles.nameText}>{user.name}</Text>
      </View>
      
      <TouchableOpacity
        style={styles.unblockButton}
        onPress={() => onUnblock(user.id)}
        disabled={isUnblocking}
      >
        {isUnblocking ? (
          <ActivityIndicator color={Colors.text} size="small" />
        ) : (
          <Text style={styles.unblockButtonText}>Unblock</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

// --- Main Screen Component ---

export default function BlockedUsersScreen() {
  const [blockedUsers, setBlockedUsers] = useState(initialBlockedUsers);
  const [isUnblockingId, setIsUnblockingId] = useState<string | null>(null);

  const handleUnblock = (userId: string) => {
    Alert.alert(
      'Unblock User',
      `Are you sure you want to unblock ${blockedUsers.find(u => u.id === userId)?.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          style: 'destructive',
          onPress: async () => {
            setIsUnblockingId(userId);
            try {
              // API call to unblock: await api.users.unblock(userId);
              
              // Simulating success: Remove user from local list
              setBlockedUsers(prev => prev.filter(u => u.id !== userId));
              Alert.alert('Success', `User unblocked.`);
            } catch (e) {
              Alert.alert('Error', 'Failed to unblock user.');
            } finally {
              setIsUnblockingId(null);
            }
          },
        },
      ]
    );
  };
  
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <UserMinus color={Colors.textMuted} size={40} />
      <Text style={styles.emptyText}>You haven't blocked anyone yet.</Text>
      <Text style={styles.emptySubText}>Blocked users cannot see your content or message you.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Blocked Users',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
        }}
      />
      
      <FlatList
        data={blockedUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BlockedUserItem 
            user={item} 
            onUnblock={handleUnblock} 
            isUnblocking={isUnblockingId === item.id}
          />
        )}
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
  listContent: {
    paddingBottom: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: Colors.text,
    fontWeight: '700' as const,
    fontSize: 18,
  },
  userInfo: {
    flex: 1,
  },
  usernameText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  nameText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  unblockButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.textMuted,
    minWidth: 100,
    alignItems: 'center',
  },
  unblockButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  emptyContainer: {
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
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
