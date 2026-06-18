import { StyleSheet, View, Pressable } from 'react-native';

const COLORS = [
  { color: '#E3F2FD', label: '淡蓝' },
  { color: '#FFFFFF', label: '纯白' },
  { color: '#E8F5E9', label: '淡绿' },
  { color: '#FFF8E1', label: '暖黄' },
  { color: '#FCE4EC', label: '淡粉' },
  { color: '#263238', label: '深色' },
];

interface Props {
  selected: string;
  onSelect: (color: string) => void;
}

export default function BgColorPicker({ selected, onSelect }: Props) {
  return (
    <View style={s.row}>
      {COLORS.map(c => (
        <Pressable key={c.color} onPress={() => onSelect(c.color)}>
          <View style={[s.dot, { backgroundColor: c.color }, selected === c.color && s.sel]} />
        </Pressable>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginVertical: 8 },
  dot: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: '#E0E0E0' },
  sel: { borderColor: '#87CEEB', borderWidth: 3 },
});
