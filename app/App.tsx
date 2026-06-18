import { useState, useEffect, useRef, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, Vibration, Animated, Dimensions, View, PanResponder, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import RecordScreen from './src/screens/RecordScreen';
import ListScreen from './src/screens/ListScreen';
import { getRecentlyExpired, cleanExpired } from './src/db/database';
import { cancelReminder } from './src/utils/notifications';
import { prepareBeep, getBeepUri } from './src/utils/alertSound';

const SW = Dimensions.get('window').width;

export default function App() {
  const [page, setPage] = useState(0); // 0=record, 1=list
  const [refreshKey, setRefreshKey] = useState(0);
  const alertedIds = useRef<Set<string>>(new Set());
  const soundRef = useRef<Audio.Sound | null>(null);
  const readyRef = useRef(false);
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => { prepareBeep().then(() => { readyRef.current = true; }); }, []);

  const playBeep = async () => {
    try {
      const uri = getBeepUri();
      if (!uri) return;
      if (soundRef.current) await soundRef.current.unloadAsync();
      const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
      soundRef.current = sound;
    } catch {}
  };

  const goTo = useCallback((idx: number) => {
    setPage(idx);
    Animated.spring(translateX, { toValue: -idx * SW, useNativeDriver: true, speed: 16, bounciness: 4 }).start();
  }, [translateX]);

  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 15 && Math.abs(g.dx) > Math.abs(g.dy) * 2,
    onPanResponderMove: (_, g) => {
      const maxLeft = page === 1 ? 0 : -g.dx;
      const offset = Math.max(-SW, Math.min(0, -page * SW + g.dx));
      translateX.setValue(offset);
    },
    onPanResponderRelease: (_, g) => {
      if (g.dx < -50 && page === 0) goTo(1);
      else if (g.dx > 50 && page === 1) goTo(0);
      else Animated.spring(translateX, { toValue: -page * SW, useNativeDriver: true, speed: 16, bounciness: 4 }).start();
    },
  })).current;

  useEffect(() => {
    const check = async () => {
      try {
        const expired = await getRecentlyExpired();
        for (const item of expired) {
          if (!alertedIds.current.has(item.id)) {
            alertedIds.current.add(item.id);
            await cancelReminder(item.id);
            await cleanExpired();
            Vibration.vibrate([300, 150, 300, 150, 500]);
            if (readyRef.current) playBeep();
            Alert.alert('⏰ 念头已到期', item.content, [{ text: '知道了' }]);
          }
        }
      } catch {}
    };
    const t = setInterval(check, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <View style={st.root} {...pan.panHandlers}>
      <Animated.View style={[st.container, { transform: [{ translateX }] }]}>
        <View style={{ width: SW, flex: 1 }}>
          <RecordScreen onGoToList={() => goTo(1)} onSave={() => setRefreshKey(k => k + 1)} />
        </View>
        <View style={{ width: SW, flex: 1 }}>
          <ListScreen onGoBack={() => goTo(0)} refreshKey={refreshKey} />
        </View>
      </Animated.View>

      <View style={st.dots}>
        <View style={[st.dot, page === 0 && st.on]} />
        <View style={[st.dot, page === 1 && st.on]} />
      </View>

      <StatusBar style="dark" />
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1, flexDirection: 'row', width: SW * 2 },
  dots: { position: 'absolute', bottom: 14, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#CCC' },
  on: { backgroundColor: '#87CEEB', width: 14, borderRadius: 3 },
});
