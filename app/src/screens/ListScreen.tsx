import { useEffect, useState, useCallback, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, RefreshControl, Pressable, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThoughtItem from '../components/ThoughtItem';
import { getActiveThoughts, deleteThought, cleanExpired, updateDone, updatePin, getSetting } from '../db/database';
import { cancelReminder } from '../utils/notifications';

export default function ListScreen({ onGoBack, refreshKey }: { onGoBack: () => void; refreshKey: number }) {
  const [thoughts, setThoughts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [bgColor, setBgColor] = useState('#E3F2FD');
  const [expiredCount, setExpiredCount] = useState(0);

  const load = useCallback(async () => {
    const count = await cleanExpired();
    setExpiredCount(count);
    setThoughts(await getActiveThoughts());
  }, []);

  useEffect(() => {
    load();
    getSetting('bg_color').then(c => { if (c) setBgColor(c); });
  }, [load, refreshKey]);

  const handleToggle = async (id: string) => {
    const item = thoughts.find(t => t.id === id);
    if (!item) return;
    await updateDone(id, item.done ? 0 : 1);
    load();
  };

  const handlePin = async (id: string) => {
    const item = thoughts.find(t => t.id === id);
    if (!item) return;
    await updatePin(id, item.pinned ? 0 : 1);
    load();
  };

  const panBack = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => g.dy > 10 && Math.abs(g.dy) > Math.abs(g.dx),
    onPanResponderRelease: (_, g) => { if (g.dy > 60) onGoBack(); },
  })).current;

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: bgColor }]}>
      <View style={st.dragBar} {...panBack.panHandlers}><View style={st.dragHandle} /></View>
      <View style={st.head}>
        <Text style={st.back} onPress={onGoBack}>← 返回</Text>
        <Text style={st.title}>念头流</Text>
        {expiredCount > 0 ? (
          <Pressable style={st.clearBtn} onPress={load}>
            <Text style={st.clearT}>清空{expiredCount}条</Text>
          </Pressable>
        ) : <View style={{ width: 50 }} />}
      </View>
      {thoughts.length === 0 ? (
        <View style={st.empty}>
          <Text style={st.eIcon}>✨</Text>
          <Text style={st.eText}>还没有念头</Text>
          <Text style={st.eSub}>去说一个吧</Text>
        </View>
      ) : (
        <FlatList
          data={thoughts}
          keyExtractor={i => i.id}
          renderItem={({ item }) => (
            <ThoughtItem
              id={item.id} content={item.content} done={!!item.done}
              pinned={!!item.pinned} createdAt={item.created_at}
              expiresAt={item.expires_at}
              onDelete={async (id) => { await deleteThought(id); cancelReminder(id); load(); }}
              onToggle={handleToggle} onPin={handlePin} bgColor={bgColor}
            />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
          contentContainerStyle={st.list}
        />
      )}
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  back: { fontSize: 16, color: '#87CEEB' },
  title: { fontSize: 18, fontWeight: '600', color: '#1A1A1A' },
  clearBtn: { backgroundColor: '#FF6B6B', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  clearT: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  list: { paddingVertical: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  eIcon: { fontSize: 48, marginBottom: 16 },
  eText: { fontSize: 18, color: '#9E9E9E' },
  eSub: { fontSize: 14, color: '#C0C0C0', marginTop: 4 },
  dragBar: { alignItems: 'center', paddingVertical: 4 },
  dragHandle: { width: 36, height: 5, borderRadius: 3, backgroundColor: '#D0D0D0' },
});
