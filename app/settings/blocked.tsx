import { Stack, useRouter } from 'expo-router'; // useRouter for navigation
import { Image } from 'expo-image'; // Using expo-image as per your UserProfileScreen
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
// Import MEDIA_BASE_URL from your api service
import { api, MEDIA_BASE_URL } from '@/services/api'; 

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

interface BlockedUsersResponse {
    success: boolean;
    data: BlockedUser[];
    message?: string;
}

// Helper function (Replicates the logic used in UserProfileScreen)
const getAvatarUri = (uri: string | null): string => {
    if (!uri) return '';
    // Assuming your avatar path is relative and needs MEDIA_BASE_URL prefix
    return uri.startsWith('http') ? uri : `${MEDIA_BASE_URL}/${uri}`;
};

// --- Custom Confirmation Modal Component (Remains the same) ---
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
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// --- Component for a single blocked user row (MODIFIED FOR AVATAR & CLICK) ---
interface BlockedUserItemProps {
  user: BlockedUser;
  onUnblock: (userId: string) => void;
  isUnblocking: boolean;
  onViewProfile: (userId: string) => void; 
}

const BlockedUserItem: React.FC<BlockedUserItemProps> = ({ 
    user, 
    onUnblock, 
    isUnblocking, 
    onViewProfile 
}) => {
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
  
  const avatarUri = getAvatarUri(user.avatar);
  const showAvatarImage = !!avatarUri;

  return (
    <View style={styles.userItem}>
      
      {/* 💡 Profile Area: Clickable for Navigation */}
      <TouchableOpacity
        style={styles.profileArea} 
        onPress={() => onViewProfile(user.id)}
      >
        
        {/* 💡 FIX 1: Avatar Display using expo-image */}
        {showAvatarImage ? (
            <Image 
                source={{ uri: avatarUri }} 
                style={styles.avatarImage} 
                contentFit="cover" // Ensure image covers the circle
            />
        ) : (
            <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{user.username.charAt(0).toUpperCase()}</Text>
            </View>
        )}
        
        <View style={styles.userInfo}>
            <View style={styles.nameRow}>
                <Text style={styles.usernameText}>{user.username}</Text>
                {user.is_verified && <UserCheck color={Colors.primary} size={14} style={{marginLeft: 4}} />}
            </View>
            <Text style={styles.bioText} numberOfLines={1}>{user.bio || user.name}</Text>
            
            <View style={styles.timeRow}>
                <Clock color={Colors.textMuted} size={12} />
                <Text style={styles.timeText}>Blocked since {getFormattedTime(user.blocked_at)}</Text>
            </View>
        </View>
      </TouchableOpacity>
      
      {/* Unblock Button (Kept separate) */}
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
  const router = useRouter(); // 💡 useRouter initialization
  const [modalVisible, setModalVisible] = useState(false);
  const [userToUnblock, setUserToUnblock] = useState<BlockedUser | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Fetch blocked users list using useQuery
  const { data: blockedUsers, isLoading: isLoadingList, isError } = useQuery<BlockedUser[]>({
    queryKey: ['blockedUsersList'],
    queryFn: api.settings.getBlockedUsers,
    select: (response: BlockedUsersResponse) => response.data,
  });

  // 2. Unblock Mutation (Fixes "old.filter is not a function" error)
  const unblockMutation = useMutation({
    mutationFn: (userId: string) => api.settings.unblockUser(userId),
    
    onMutate: async (userIdToUnblock) => {
        setModalVisible(false); 
        setErrorMessage(null); 
        await queryClient.cancelQueries({ queryKey: ['blockedUsersList'] });
        
        const previousBlockedUsers = queryClient.getQueryData<BlockedUser[]>(['blockedUsersList']);
        
        queryClient.setQueryData<BlockedUser[]>(['blockedUsersList'], (oldData) => {
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
  
  // 💡 FIX 2: Handler for profile navigation
  const handleViewProfile = (userId: string) => {
      // Use the profile routing structure from your UserProfileScreen context
      router.push(`/profile/${userId}`); 
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
            onViewProfile={handleViewProfile} // 💡 Passed profile handler
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
      />
    </View>
  );
}

// --- STYLES (MODIFIED) ---

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
    justifyContent: 'space-between', // Ensures button stays right
  },
  profileArea: { 
    flex: 1, 
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImage: { 
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: Colors.surface, // Background for loading
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
    marginLeft: 10, 
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
  },
    // Modal Styles... (omitted for brevity)
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
