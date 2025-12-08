import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
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
    seekPosition: number;
    isSeeking: boolean;
    showSeekIcon: boolean;
    seekDirection: 'forward' | 'backward';
    togglePlayPause: () => void;
    toggleFullscreen: () => void;
    handleDoubleTap: (e: any) => void;
    handleSeekStart: (e: any) => void;
    handleSeekMove: (e: any) => void;
    handleSeekEnd: (e: any) => void;
    handleLayout: (e: any) => void;
    goBack: () => void;
    progressBarRef: React.RefObject<View>;
}

export default function VideoController({
    isPlaying, showControls, isFullscreen, isSeeking, currentPosition, videoDuration,
    seekPosition, showSeekIcon, seekDirection, togglePlayPause, toggleFullscreen,
    handleDoubleTap, handleSeekStart, handleSeekMove, handleSeekEnd, handleLayout, goBack, progressBarRef
}: VideoControllerProps) {
    const insets = useSafeAreaInsets();
    const displayPosition = isSeeking && seekPosition > 0 ? seekPosition : currentPosition;
    const progressPercentage = videoDuration > 0 ? (displayPosition / videoDuration) * 100 : 0;

    return (
        <Pressable style={styles.overlay} onPress={handleDoubleTap}>
            {showSeekIcon && (
                <View style={styles.seekOverlay}>
                    <View style={styles.seekIconContainer}>
                        {seekDirection === 'forward' ? <ArrowBigRight color="white" size={48} /> : <ArrowBigLeft color="white" size={48} />}
                        <Text style={styles.seekText}>10s</Text>
                    </View>
                </View>
            )}

            {showControls && (
                <View style={styles.controls}>
                    <View style={[styles.topBar, { paddingTop: isFullscreen ? insets.top : 10 }]}>
                       <TouchableOpacity onPress={goBack}><ArrowLeft color="white" size={24} /></TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={togglePlayPause} style={styles.centerBtn}>
                        {isPlaying ? <Pause color="white" size={48} fill="white" /> : <Play color="white" size={48} fill="white" />}
                    </TouchableOpacity>

                    <View style={styles.bottomBar}>
                        <Text style={styles.timeText}>
                            {formatDuration(displayPosition / 1000)} / {formatDuration(videoDuration / 1000)}
                        </Text>
                        <Pressable
                            ref={progressBarRef}
                            style={styles.progressBar}
                            onLayout={handleLayout} 
                            onPressIn={handleSeekStart} 
                            onResponderMove={handleSeekMove} 
                            onResponderRelease={handleSeekEnd} 
                        >
                            <View style={styles.track} />
                            <View style={[styles.fill, { width: `${progressPercentage}%` }]} />
                            <View style={[styles.handle, { left: `${progressPercentage}%` }]} />
                        </Pressable>
                        <TouchableOpacity onPress={toggleFullscreen}>
                            <Maximize color="white" size={20} style={{ marginLeft: 10 }}/>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  controls: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'space-between' },
  topBar: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 10 },
  centerBtn: { alignSelf: 'center' },
  bottomBar: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 10 },
  timeText: { color: '#fff', fontSize: 12, marginRight: 10, fontWeight: '600', minWidth: 80 },
  seekOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 5 },
  seekIconContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 15, borderRadius: 10 },
  seekText: { color: '#fff', fontSize: 20, fontWeight: '700', marginLeft: 5 },
  progressBar: { flex: 1, height: 20, justifyContent: 'center' },
  track: { position: 'absolute', height: 3, width: '100%', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2 },
  fill: { height: 3, backgroundColor: Colors.primary, borderRadius: 2 },
  handle: { position: 'absolute', width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary, top: 4, transform: [{ translateX: -6 }] },
});
                                                                      
