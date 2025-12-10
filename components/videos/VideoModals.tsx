import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Trash2, X } from 'lucide-react-native'; 
import Colors from '@/constants/colors';

// 🎯 REQUIRED IMPORT: Universal CommentsModal
import CommentsModal from '@/components/modals/CommentsModal'; 

interface VideoModalsProps {
    video: any;
    // ❌ Removed comment-related props (comments, commentText, etc.) as they are handled by CommentsModal.tsx
    showComments: boolean;
    showDescription: boolean;
    showMenu: boolean;
    setShowComments: (b: boolean) => void;
    setShowDescription: (b: boolean) => void;
    setShowMenu: (b: boolean) => void;
    // ❌ Removed onPostComment
    onDelete: () => void;
    onReport: () => void;
    onSave: () => void;
    isOwner: boolean;
}

export default function VideoModals(props: VideoModalsProps) {
    // ❌ Removed unnecessary props from destructuring
    const { video, showComments, showDescription, showMenu, setShowComments, setShowDescription, setShowMenu, isOwner, onDelete, onReport, onSave } = props;

    return (
        <>
            {/* 1. Comments Modal (FIXED: Uses universal component) */}
            {/* Ensure video ID is available before showing the modal */}
            {showComments && video?.id && (
                <CommentsModal 
                    visible={showComments} 
                    onClose={() => setShowComments(false)} 
                    entityId={video.id}      // Pass video ID
                    entityType="video"       // Pass correct entity type
                />
            )}
            
            {/* 2. Description Modal (UNCHANGED) */}
            <Modal visible={showDescription} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowDescription(false)}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Description</Text>
                        <TouchableOpacity onPress={() => setShowDescription(false)}><X color={Colors.text} size={24}/></TouchableOpacity>
                    </View>
                    <ScrollView style={{ padding: 16 }}>
                        <Text style={styles.videoTitle}>{video?.title}</Text>
                        <View style={styles.descBox}>
                            <Text style={styles.descText}>{video?.description || "No description."}</Text>
                        </View>
                    </ScrollView>
                </View>
            </Modal>

            {/* 3. Options Menu (UNCHANGED) */}
            <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
                <TouchableOpacity style={styles.overlay} onPress={() => setShowMenu(false)} activeOpacity={1}>
                    <View style={styles.menu}>
                        <TouchableOpacity style={styles.menuItem} onPress={onSave}><Text style={styles.menuText}>Save Video</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem} onPress={onReport}><Text style={styles.menuText}>Report</Text></TouchableOpacity>
                        {isOwner && (
                            <TouchableOpacity style={styles.menuItem} onPress={onDelete}>
                                <Trash2 size={20} color="red" />
                                <Text style={[styles.menuText, { color: 'red' }]}>Delete Video</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    modal: { flex: 1, backgroundColor: Colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: '#333' },
    headerTitle: { color: Colors.text, fontSize: 18, fontWeight: '700' },
    // Removed all hardcoded comment-related styles here
    videoTitle: { color: Colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    descBox: { borderTopWidth: 1, borderColor: '#333', paddingTop: 10 },
    descText: { color: Colors.text, lineHeight: 22 },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
    menu: { backgroundColor: '#1E1E1E', borderRadius: 12, padding: 10 },
    menuItem: { padding: 16, flexDirection: 'row', gap: 10, alignItems: 'center' },
    menuText: { color: Colors.text, fontSize: 16, fontWeight: '600' }
});
