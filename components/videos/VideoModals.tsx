import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, TextInput, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { X, Send, Trash2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { formatTimeAgo } from '@/constants/timeFormat';
import { getMediaUri } from '@/utils/media';

interface VideoModalsProps {
    video: any;
    comments: any[];
    commentText: string;
    setCommentText: (t: string) => void;
    showComments: boolean;
    showDescription: boolean;
    showMenu: boolean;
    setShowComments: (b: boolean) => void;
    setShowDescription: (b: boolean) => void;
    setShowMenu: (b: boolean) => void;
    onPostComment: () => void;
    onDelete: () => void;
    onReport: () => void;
    onSave: () => void;
    isOwner: boolean;
}

export default function VideoModals(props: VideoModalsProps) {
    const { video, comments, commentText, setCommentText, showComments, showDescription, showMenu, setShowComments, setShowDescription, setShowMenu, onPostComment, isOwner, onDelete, onReport, onSave } = props;

    return (
        <>
            {/* Comments Modal */}
            <Modal visible={showComments} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowComments(false)}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Comments</Text>
                        <TouchableOpacity onPress={() => setShowComments(false)}><X color={Colors.text} size={24}/></TouchableOpacity>
                    </View>
                    <FlatList
                        data={comments}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.comment}>
                                <Image source={{ uri: getMediaUri(item.user.avatar) }} style={styles.avatar} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.username}>{item.user.username} <Text style={styles.time}>{formatTimeAgo(item.created_at)}</Text></Text>
                                    <Text style={styles.text}>{item.content}</Text>
                                </View>
                            </View>
                        )}
                        contentContainerStyle={{ padding: 16 }}
                    />
                    <View style={styles.inputBox}>
                        <TextInput style={styles.input} placeholder="Add a comment..." placeholderTextColor="#888" value={commentText} onChangeText={setCommentText} />
                        <TouchableOpacity onPress={onPostComment}><Send color={Colors.primary} size={24}/></TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Description Modal */}
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

            {/* Options Menu */}
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
    comment: { flexDirection: 'row', marginBottom: 16, gap: 12 },
    avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#333' },
    username: { color: Colors.text, fontWeight: '700', fontSize: 13 },
    time: { color: '#888', fontWeight: '400', fontSize: 12 },
    text: { color: '#ccc', fontSize: 14 },
    inputBox: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderColor: '#333', alignItems: 'center', gap: 10 },
    input: { flex: 1, backgroundColor: '#111', borderRadius: 20, padding: 10, color: Colors.text },
    videoTitle: { color: Colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    descBox: { borderTopWidth: 1, borderColor: '#333', paddingTop: 10 },
    descText: { color: Colors.text, lineHeight: 22 },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
    menu: { backgroundColor: '#1E1E1E', borderRadius: 12, padding: 10 },
    menuItem: { padding: 16, flexDirection: 'row', gap: 10, alignItems: 'center' },
    menuText: { color: Colors.text, fontSize: 16, fontWeight: '600' }
});
           
