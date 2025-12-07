import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { UserMinus, X, Check } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Colors from '@/constants/colors';
import { api } from '@/services/api'; 

// --- TYPE DEFINITIONS ---
interface BlockedUser {
  id: string;
  username: string;
  name: string;
  avatar: string;
}

// Mock API function (Assuming setup in api.ts)
api.settings.getBlockedUsers = async (): Promise<BlockedUser[]> => {
    // Simulating API latency and data fetch
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { id: '1', username: 'toxic_user_1', name: 'Toxic Troll', avatar: 'url1' },
      { id: '2', username: 'spam_bot_42', name: 'Spam Bot', avatar: 'url2' },
      { id: '3', username: 'old_ex_2', name: 'Old Acquaintance', avatar: 'url3' },
    ];
};

// --- Custom Confirmation Modal Component ---
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
interface BlockedUserItemProps {
  user: BlockedUser;
  onUnblock: (userId: string) => void;
  isUnblocking: boolean;
}

const BlockedUserItem: React.FC<BlockedUserItemProps> = ({ user, onUnblock, isUnblocking }) => {
  const isCurrentlyUnblocking = isUnblocking;
  
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

  // 1. Fetch blocked users list using useQuery
  const { data: blockedUsers, isLoading: isLoadingList, isError } = useQuery<BlockedUser[]>({
    queryKey: ['blockedUsersList'],
    queryFn: api.settings.getBlockedUsers,
  });

  // 2. Unblock Mutation
  const unblockMutation = useMutation({
    mutationFn: (userId: string) => api.settings.unblockUser(userId),
    
    // Optimistic Update
    onMutate: async (userIdToUnblock) => {
        setModalVisible(false); // Close modal immediately
        await queryClient.cancelQueries({ queryKey: ['blockedUsersList'] });
        const previousBlockedUsers = queryClient.getQueryData<BlockedUser[]>(['blockedUsersList']);
        
        queryClient.setQueryData<BlockedUser[]>(['blockedUsersList'], (old) => 
            old ? old.filter(user => user.id !== userIdToUnblock) : []
        );
        
        return { previousBlockedUsers };
    },
    onSuccess: () => {
         // Use a toast or custom notification for success, not native Alert
         console.log('User successfully unblocked and list updated.');
    },
    onError: (err, userIdToUnblock, context) => {
        queryClient.setQueryData(['blockedUsersList'], context?.previousBlockedUsers);
        Alert.alert('Error', 'Failed to unblock user. Please try again.');
    },
    onSettled: () => {
        setUserToUnblock(null);
        queryClient.invalidateQueries({ queryKey: ['blockedUsersList'] });
    },
  });

  // Handler to open the custom modal
  const handleUnblockModalOpen = (userId: string) => {
      const user = blockedUsers?.find(u => u.id === userId);
      if (user) {
          setUserToUnblock(user);
          setModalVisible(true);
      }
  };
  
  // Handler called by the custom modal's confirm button
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
      
      <UnblockConfirmationModal
          isVisible={modalVisible}
          userToUnblock={userToUnblock}
          onClose={() => setModalVisible(false)}
          onConfirm={handleUnblockConfirm}
          isLoading={unblockMutation.isPending}
      />
      
      <FlatList
        data={blockedUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BlockedUserItem 
            user={item} 
            onUnblock={handleUnblockModalOpen} // Use modal opener
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
  }
});

const modalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Dark semi-transparent background
    },
    modalView: {
        margin: 20,
        backgroundColor: Colors.surface, // Modal background matching app surface
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
        color: Colors.text, // Dark theme text color
        marginBottom: 15,
    },
    modalText: {
        marginBottom: 20,
        textAlign: 'center',
        color: Colors.textSecondary, // Secondary text color
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
        backgroundColor: Colors.danger, // Use danger for destructive action (Unblock)
    },
    textStyle: {
        color: Colors.text,
        fontWeight: 'bold' as const,
        textAlign: 'center',
    },
});
