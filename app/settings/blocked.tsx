import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { UserMinus, X, Check, Clock, UserCheck } from 'lucide-react-native'; 
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Colors from '@/constants/colors';
import { api } from '@/services/api'; 

// --- TYPE DEFINITIONS ---
interface BlockedUser {
  id: string; 
  username: string;
  name: string;
  avatar: string | null;
  bio: string | null;            
  is_verified: boolean;         
  blocked_at: string;           
}

// Define the expected server response structure
interface BlockedUsersResponse {
    success: boolean;
    data: BlockedUser[];
    message?: string;
}

// --- Custom Confirmation Modal Component (Theme Friendly) ---
// 💡 NOTE: This component is defined *outside* the main export function.
interface UnblockConfirmationModalProps {
    isVisible: boolean;
    userToUnblock: BlockedUser | null;
    onClose: () => void;
    onConfirm: (userId: string) => void;
    isLoading: boolean;
}

const UnblockConfirmationModal: React.FC<UnblockConfirmationModalProps> = ({
    isVisible,
    userToUnblock,
    onClose,
    onConfirm,
    isLoading,
}) => {
    if (!userToUnblock) return null;

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={modalStyles.centeredView}>
                <View style={modalStyles.modalView}>
                    <Text style={modalStyles.modalTitle}>Unblock {userToUnblock.username}?</Text>
                    <Text style={modalStyles.modalText}>
                        Unblocked users will be able to view your profile and send you messages again.
                    </Text>

                    <View style={modalStyles.buttonContainer}>
                        <TouchableOpacity
                            style={[modalStyles.button, modalStyles.buttonCancel]}
                            onPress={onClose}
                            disabled={isLoading}
                        >
                            <X color={Colors.text} size={18} />
                            <Text style={modalStyles.textStyle}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[modalStyles.button, modalStyles.buttonConfirm]}
                            onPress={() => onConfirm(userToUnblock.id)}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={Colors.text} size="small" />
                            ) : (
                                <Check color={Colors.text} size={18} />
                            )}
                            <Text style={modalStyles.textStyle}>Unblock</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// --- Component for a single blocked user row ---
// 💡 NOTE: This component is defined *outside* the main export function.
interface BlockedUserItemProps {
  user: BlockedUser;
  onUnblock: (userId: string) => void;
  isUnblocking: boolean;
}

const BlockedUserItem: React.FC<BlockedUserItemProps> = ({ user, onUnblock, isUnblocking }) => {
  const isCurrentlyUnblocking = isUnblocking;
  
  const getFormattedTime = (timestamp: string) => {
    try {
        const date = new Date(timestamp);
        const diffInDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (diffInDays < 1) return "Today";
        if (diffInDays < 30) return `${diffInDays} days ago`;
        return date.toLocaleDateString();
    } catch {
        return "Unknown Date";
    }
  };

  return (
    <View style={styles.userItem}>
      {/* Avatar Placeholder/Image */}
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>{user.username.charAt(0).toUpperCase()}</Text>
      </View>
      
      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
            <Text style={styles.usernameText}>{user.username}</Text>
            {user.is_verified && <UserCheck color={Colors.primary} size={14} style={{marginLeft: 4}} />}
        </View>
        <Text style={styles.bioText} numberOfLines={1}>{user.bio || user.name}</Text>
        
        {/* Blocked Time Display */}
        <View style={styles.timeRow}>
            <Clock color={Colors.textMuted} size={12} />
            <Text style={styles.timeText}>Blocked since {getFormattedTime(user.blocked_at)}</Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.unblockButton}
        onPress={() => onUnblock(user.id)}
        disabled={isCurrentlyUnblocking}
      >
        {isCurrentlyUnblocking ? (
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
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [userToUnblock, setUserToUnblock] = useState<BlockedUser | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Fetch blocked users list using useQuery
  const { data: blockedUsers, isLoading: isLoadingList, isError } = useQuery<BlockedUser[]>({
    queryKey: ['blockedUsersList'],
    queryFn: api.settings.getBlockedUsers,
    
    // FIX 1: Selects the 'data' array from the server response object
    select: (response: BlockedUsersResponse) => response.data,
  });

  // 2. Unblock Mutation (Fixes the "old.filter is not a function" error)
  const unblockMutation = useMutation({
    mutationFn: (userId: string) => api.settings.unblockUser(userId),
    
    onMutate: async (userIdToUnblock) => {
        setModalVisible(false); 
        setErrorMessage(null); 
        await queryClient.cancelQueries({ queryKey: ['blockedUsersList'] });
        
        const previousBlockedUsers = queryClient.getQueryData<BlockedUser[]>(['blockedUsersList']);
        
        queryClient.setQueryData<BlockedUser[]>(['blockedUsersList'], (oldData) => {
            // FIX 2: Ensures oldData is an array before calling filter
            const currentList = Array.isArray(oldData) ? oldData : [];

            return currentList.filter(user => user.id !== userIdToUnblock);
        });
        
        return { previousBlockedUsers };
    },
    onSuccess: () => {
         console.log('User successfully unblocked and list updated.');
    },
    onError: (err: any, userIdToUnblock, context) => {
        queryClient.setQueryData(['blockedUsersList'], context?.previousBlockedUsers);
        setErrorMessage(err.message || 'Failed to unblock user. Please try again.'); 
    },
    onSettled: () => {
        setUserToUnblock(null);
        queryClient.invalidateQueries({ queryKey: ['blockedUsersList'] });
    },
  });

  // Handler functions remain the same...

  const handleUnblockModalOpen = (userId: string) => {
      const user = blockedUsers?.find(u => u.id === userId);
      if (user) {
          setUserToUnblock(user);
          setModalVisible(true);
      }
  };
  
  const handleUnblockConfirm = (userId: string) => {
      unblockMutation.mutate(userId); 
  };
  
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <UserMinus color={Colors.textMuted} size={40} />
      <Text style={styles.emptyText}>You haven't blocked anyone yet.</Text>
      <Text style={styles.emptySubText}>Blocked users cannot see your content or message you.</Text>
    </View>
  );
  
  if (isLoadingList) {
      return (
          <View style={[styles.container, styles.center]}>
              <ActivityIndicator size="large" color={Colors.primary} />
          </View>
      );
  }
  
  if (isError || !blockedUsers) {
       return (
          <View style={[styles.container, styles.center]}>
              <Text style={styles.errorText}>Failed to load blocked users list.</Text>
               <TouchableOpacity onPress={() => queryClient.invalidateQueries({ queryKey: ['blockedUsersList'] })}>
                   <Text style={styles.linkButtonText}>Retry</Text>
               </TouchableOpacity>
          </View>
      );
  }


  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Blocked Users',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
        }}
      />
      
      {/* 💡 This component is now correctly scoped and available */}
      <UnblockConfirmationModal
          isVisible={modalVisible}
          userToUnblock={userToUnblock}
          onClose={() => setModalVisible(false)}
          onConfirm={handleUnblockConfirm}
          isLoading={unblockMutation.isPending}
      />
      
      {/* Theme-friendly error message display */}
      {errorMessage && (
        <View style={styles.globalErrorBar}>
          <Text style={styles.globalErrorText}>{errorMessage}</Text>
          <TouchableOpacity onPress={() => setErrorMessage(null)}>
            <X color={Colors.text} size={18} />
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={blockedUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BlockedUserItem 
            user={item} 
            onUnblock={handleUnblockModalOpen} 
            isUnblocking={unblockMutation.isPending && userToUnblock?.id === item.id}
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
  center: {
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
  listContent: {
    paddingBottom: 20,
    flexGrow: 1,
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usernameText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  bioText: { 
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  timeRow: { 
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textMuted,
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
    backgroundColor: Colors.background,
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
  },
  // New styles for theme-friendly global error bar
  globalErrorBar: {
    backgroundColor: Colors.danger, 
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  globalErrorText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500' as const,
    flexShrink: 1,
    marginRight: 10,
  }
});

const modalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)', 
    },
    modalView: {
        margin: 20,
        backgroundColor: Colors.surface, 
        borderRadius: 12,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700' as const,
        color: Colors.text, 
        marginBottom: 15,
    },
    modalText: {
        marginBottom: 20,
        textAlign: 'center',
        color: Colors.textSecondary, 
        fontSize: 14,
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        gap: 10,
    },
    button: {
        flex: 1,
        borderRadius: 8,
        padding: 12,
        elevation: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
    },
    buttonCancel: {
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    buttonConfirm: {
        backgroundColor: Colors.danger, 
    },
    textStyle: {
        color: Colors.text,
        fontWeight: 'bold' as const,
        textAlign: 'center',
    },
});
