import { useRef } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  Animated,
  View,
} from 'react-native';

interface Props {
  isRecording: boolean;
  onPressIn: () => void;
  onPressOut: () => void;
}

export default function RecordButton({ isRecording, onPressIn, onPressOut }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 1.1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
    onPressIn();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
    onPressOut();
  };

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.ripple, { transform: [{ scale }] }]}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={({ pressed }) => [
            styles.button,
            isRecording && styles.buttonRecording,
          ]}
        >
          <Text style={styles.icon}>🎤</Text>
          <Text style={styles.label}>
            {isRecording ? '松手就存' : '按住说话'}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const BUTTON_SIZE = 150;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    borderRadius: BUTTON_SIZE,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#87CEEB',
    alignItems: 'center',
    justifyContent: 'center',
    // 阴影
    shadowColor: '#5C9FBF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonRecording: {
    backgroundColor: '#5C9FBF',
  },
  icon: {
    fontSize: 40,
  },
  label: {
    marginTop: 4,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
