import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowBigRight, ArrowBigLeft, Pause, Play, Maximize, ArrowLeft } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { formatDuration } from '@/utils/format';

interface VideoControllerProps {
    isPlaying: boolean;
    showControls: boolean;
    isFullscreen: boolean;
    videoDuration: number;
    currentPosition: number;
    togglePlayPause: () => void;
    toggleFullscreen: () => void;
    handleDoubleTap: (e: any) => void;
    handleSeekStart: () => void; // Parent ko sirf start batao
    handleSeekEnd: (finalPosition: number) => void; // Parent ko final value do
    goBack: () => void;
}

export default function VideoController({
    isPlaying, showControls, isFullscreen, videoDuration, currentPosition,
    togglePlayPause, toggleFullscreen, handleDoubleTap, 
    handleSeekStart, handleSeekEnd, goBack
}: VideoControllerProps) {
    const insets = useSafeAreaInsets();
    const progressBarRef = useRef<View>(null);
    const progressBarWidth = useRef(0);

    // 🔥 LOCAL STATE (Jumping fix karne ke liye)
    const [isDragging, setIsDragging] = useState(false);
    const [dragPosition, setDragPosition] = useState(0);

    // Jab drag nahi ho raha, tabhi parent ki suno
    const displayPosition = isDragging ? dragPosition : currentPosition;
    
    // Percentage Calculation
    const progressPercentage = videoDuration > 0 ? (displayPosition / videoDuration) * 100 : 0;
    const safeProgress = Math.min(Math.max(progressPercentage, 0), 100);

    // --- 🎮 LOCAL GESTURE HANDLERS ---
    const onTouchStart = () => {
        setIsDragging(true);
        setDragPosition(currentPosition); // Jahan hai wahin se shuru karo
        handleSeekStart(); // Parent ko bolo video pause kare
    };

    const onTouchMove = (e: any) => {
        const width = progressBarWidth.current || 1;
        const locationX = e.nativeEvent.locationX;
        
        // Calculate new position locally (Instant Update)
        const pct = Math.max(0, Math.min(1, locationX / width));
        const newPos = pct * videoDuration;
        
        setDragPosition(newPos); // Sirf local state update karo (No Lag)
    };

    const onTouchEnd = () => {
        setIsDragging(false);
        handleSeekEnd(dragPosition); // Parent ko final value bhej do
    };

    const handleLayout = (e: any) => { progressBarWidth.current = e.nativeEvent.layout.width; };

    return (
        <TouchableOpacity activeOpacity={1} style={styles.overlay} onPress={handleDoubleTap}>
            {/* Seek Icon Animation (Optional: ise props se control kar sakte ho agar chahiye) */}
            
            {showControls && (
                <View style={styles.controls}>
                    {/* Top Bar */}
                    <View style={[styles.topBar, { paddingTop: isFullscreen ? insets.top : 10 }]}>
                       <TouchableOpacity onPress={goBack}><ArrowLeft color="white" size={24} /></TouchableOpacity>
                    </View>

                    {/* Center Play/Pause */}
                    <TouchableOpacity onPress={togglePlayPause} style={styles.centerBtn}>
                        {isPlaying ? <Pause color="white" size={48} fill="white" /> : <Play color="white" size={48} fill="white" />}
                    </TouchableOpacity>

                    {/* Bottom Bar */}
                    <View style={styles.bottomBar}>
                        <Text style={styles.timeText}>
                            {formatDuration(displayPosition / 1000)} / {formatDuration(videoDuration / 1000)}
                        </Text>
                        
                        {/* 🔥 SUPER SMOOTH SEEK BAR */}
                        <View
                            ref={progressBarRef}
                            style={styles.progressBar}
                            onLayout={handleLayout}
                            
                            // Gestures
                            onStartShouldSetResponder={() => true}
                            onMoveShouldSetResponder={() => true}
                            onResponderGrant={onTouchStart}
                            onResponderMove={onTouchMove}
                            onResponderRelease={onTouchEnd}
                            onResponderTerminate={onTouchEnd}
                        >
                            <View style={styles.track} />
                            <View style={[styles.fill, { width: `${safeProgress}%` }]} />
                            
                            {/* Handle (Bada Touch Area) */}
                            <View style={[styles.handle, { left: `${safeProgress}%` }]} />
                        </View>

                        <TouchableOpacity onPress={toggleFullscreen}>
                            <Maximize color="white" size={20} style={{ marginLeft: 10 }}/>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  controls: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'space-between' },
  topBar: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 10 },
  centerBtn: { alignSelf: 'center' },
  bottomBar: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 10 },
  timeText: { color: '#fff', fontSize: 12, marginRight: 10, fontWeight: '600', minWidth: 80 },
  progressBar: { flex: 1, height: 30, justifyContent: 'center' },
  track: { position: 'absolute', height: 3, width: '100%', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2 },
  fill: { height: 3, backgroundColor: Colors.primary, borderRadius: 2 },
  handle: { position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.primary, top: 8, transform: [{ translateX: -7 }] },
});
