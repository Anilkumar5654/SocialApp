import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Easing } from 'react-native';
import { Heart } from 'lucide-react-native';

export default function FloatingHeart({ onComplete }: { onComplete: () => void }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1, duration: 1000, easing: Easing.out(Easing.ease), useNativeDriver: true,
    }).start(() => onComplete());
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -200] });
  const opacity = anim.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] });
  const scale = anim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.5, 1.2, 1] });
  const randomX = Math.random() * 40 - 20;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }, { translateX: randomX }, { scale }], opacity }]}>
      <Heart color="#E1306C" fill="#E1306C" size={40} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 0 },
});
