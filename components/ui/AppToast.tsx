// components/ui/AppToast.tsx

import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, StatusBar } from 'react-native';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react-native';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

// 💡 Define types for the toast and the ref handle
export type ToastType = 'success' | 'error' | 'info';
export interface ToastHandle {
  show: (message: string, type: ToastType, duration?: number) => void;
}

const AppToast = forwardRef<ToastHandle>((props, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('info');
  const fadeAnim = useState(new Animated.Value(-100))[0]; // Initial position above the screen

  // Expose the show function via ref
  useImperativeHandle(ref, () => ({
    show: (msg, t, duration = 3000) => {
      setMessage(msg);
      setType(t);
      setIsVisible(true);
      
      // Start animation to slide down
      Animated.timing(fadeAnim, {
        toValue: 0, 
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Hide after duration
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: -100, 
            duration: 300,
            useNativeDriver: true,
          }).start(() => setIsVisible(false));
        }, duration);
      });
    },
  }));
  
  if (!isVisible) {
    return null;
  }

  // Choose icon and color based on type
  let iconComponent;
  let backgroundColor;
  
  switch (type) {
    case 'success':
      iconComponent = <CheckCircle color="white" size={20} />;
      backgroundColor = Colors.success; // Assuming success color is green/vibrant
      break;
    case 'error':
      iconComponent = <X color="white" size={20} />;
      backgroundColor = Colors.error; // Assuming error color is red
      break;
    case 'info':
    default:
      iconComponent = <Info color="white" size={20} />;
      backgroundColor = Colors.info; // Assuming info color is blue/primary
      break;
  }

  // Get status bar height for correct positioning (using fixed padding for simplicity)
  const safeAreaTop = (StatusBar.currentHeight || 0) + 10;

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor, 
          top: safeAreaTop, 
          transform: [{ translateY: fadeAnim }], 
        }
      ]}
    >
      <View style={styles.content}>
        {iconComponent}
        <Text style={styles.messageText}>{message}</Text>
      </View>
    </Animated.View>
  );
});

export default AppToast;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: width - 32, // Padding 16 on both sides
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 8,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  messageText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1,
  },
});
