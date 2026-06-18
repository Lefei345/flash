import { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useCountdown } from '../hooks/useCountdown';

interface Props {
  id: string; content: string; done: boolean; pinned: boolean;
  createdAt: number; expiresAt: number;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onPin: (id: string) => void;
  bgColor?: string; minimal?: boolean;
}

export default function ThoughtItem({ id, content, done: isDone, pinned, createdAt, expiresAt, onDelete, onToggle, onPin, bgColor, minimal }: Props) {
  const { text: cdText, urgent } = useCountdown(expiresAt);
  const [del, setDel] = useState(false);
  const t = new Date(createdAt);
  const time = `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`;

  return (
    <Pressable
      style={[st.card, pinned && st.pinnedBg, bgColor ? { backgroundColor: bgColor } : undefined, pinned ? undefined : undefined]}
      onPress={minimal ? undefined : () => onToggle(id)}
      onLongPress={() => minimal ? undefined : setDel(!del)}
    >
      <View style={st.left}><Text style={st.time}>{time}</Text></View>
      <View style={st.mid}>
        <Text style={[st.content, isDone && st.done]} numberOfLines={3}>{content}</Text>
        <Text style={[st.cd, urgent && st.urgent]}>{cdText}</Text>
      </View>
      {!minimal && (
        <Pressable style={st.pin} onPress={() => onPin(id)}>
          <Text style={st.pinT}>{pinned ? '📌' : '📍'}</Text>
        </Pressable>
      )}
      {!minimal && del && (
        <Pressable style={st.del} onPress={() => onDelete(id)}>
          <Text style={st.delT}>删除</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

const st = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', marginHorizontal: 16, marginVertical: 4, borderRadius: 12, padding: 16 },
  pinnedBg: { borderLeftWidth: 3, borderLeftColor: '#87CEEB' },
  left: { width: 46, alignItems: 'center', marginRight: 14 },
  time: { fontSize: 15, fontWeight: '600', color: '#87CEEB' },
  mid: { flex: 1 },
  content: { fontSize: 17, color: '#1A1A1A', lineHeight: 24 },
  done: { textDecorationLine: 'line-through', color: '#BDBDBD' },
  cd: { fontSize: 13, color: '#9E9E9E', marginTop: 4 },
  urgent: { color: '#FF6B6B', fontWeight: '600' },
  pin: { paddingHorizontal: 6 },
  pinT: { fontSize: 16 },
  del: { backgroundColor: '#FF6B6B', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, marginLeft: 4 },
  delT: { color: '#FFF', fontSize: 13, fontWeight: '600' },
});
