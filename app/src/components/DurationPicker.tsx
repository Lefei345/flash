import { useState, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput, Modal } from 'react-native';

const PRESETS = [
  { label: '半小时', mins: 30 },
  { label: '1小时', mins: 60 },
  { label: '6小时', mins: 360 },
  { label: '24小时', mins: 1440 },
];

interface Props { selected: number; onSelect: (mins: number) => void; }

export default function DurationPicker({ selected, onSelect }: Props) {
  const [show, setShow] = useState<'tomorrow' | 'custom' | null>(null);
  const [h, setH] = useState(''); const [m, setM] = useState('');
  const [mon, setMon] = useState(''); const [day, setDay] = useState('');
  const [hh, setHh] = useState(''); const [mm, setMm] = useState('');
  const blockRef = useRef(false);

  const isPreset = PRESETS.some(p => p.mins === selected);

  const open = (type: 'tomorrow' | 'custom') => {
    setShow(type);
    setH(''); setM(''); setMon(''); setDay(''); setHh(''); setMm('');
    blockRef.current = true;
    setTimeout(() => { blockRef.current = false; }, 500);
  };

  const close = () => {
    if (blockRef.current) return;
    setShow(null);
  };

  const applyTomorrow = () => {
    const hr = parseInt(h) || 0; const mn = parseInt(m) || 0;
    if (h === '' || m === '' || hr < 0 || hr > 23 || mn < 0 || mn > 59) return;
    const now = new Date();
    const t = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hr, mn, 0, 0);
    const diff = Math.round((t.getTime() - now.getTime()) / 60000);
    if (diff <= 0) return;
    onSelect(diff);
    setShow(null);
  };

  const applyCustom = () => {
    const now = new Date();
    const mth = parseInt(mon) || 0;
    const d = parseInt(day) || 0;
    const hr = parseInt(hh) || 0;
    const mn = parseInt(mm) || 0;
    if (!mth || !d || mth < 1 || mth > 12 || d < 1 || d > 31) return;
    let year = now.getFullYear();
    const testDate = new Date(year, mth - 1, d);
    if (testDate.getMonth() !== mth - 1) return;
    if (testDate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) year++;
    const t = new Date(year, mth - 1, d, hr, mn, 0, 0);
    const diff = Math.round((t.getTime() - now.getTime()) / 60000);
    if (diff <= 0 || diff > 525600) return;
    onSelect(diff);
    setShow(null);
  };

  const label = isPreset ? PRESETS.find(p => p.mins === selected)!.label
    : `${Math.floor(selected / 60)}h${selected % 60 ? ` ${selected % 60}m` : ''}`;

  return (
    <>
      <View style={s.row}>
        {PRESETS.map(p => (
          <Pressable key={p.mins} style={[s.cap, selected === p.mins && s.act]} onPress={() => onSelect(p.mins)}>
            <Text style={[s.txt, selected === p.mins && s.at]}>{p.label}</Text>
          </Pressable>
        ))}
        <Pressable style={[s.cap, !isPreset && s.act]} onPress={() => open('custom')}>
          <Text style={[s.txt, !isPreset && s.at]}>{!isPreset ? label : '自定义'}</Text>
        </Pressable>
        <Pressable style={s.cap} onPress={() => open('tomorrow')}>
          <Text style={s.txt}>明天</Text>
        </Pressable>
      </View>

      <Modal visible={show === 'tomorrow'} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={s.bg} onPress={close}>
          <Pressable style={s.panel} onPress={() => {}}>
            <Text style={s.ttl}>明天几点提醒</Text>
            <View style={s.tr}><TextInput style={s.ti} value={h} onChangeText={setH} keyboardType="number-pad" placeholder="时" placeholderTextColor="#CCC" maxLength={2} autoFocus /><Text style={{ fontSize: 28, color: '#333' }}>:</Text><TextInput style={s.ti} value={m} onChangeText={setM} keyboardType="number-pad" placeholder="分" placeholderTextColor="#CCC" maxLength={2} /></View>
            <View style={s.br}><Text style={s.cc} onPress={close}>取消</Text><Text style={s.ok} onPress={applyTomorrow}>确定</Text></View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={show === 'custom'} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={s.bg} onPress={close}>
          <Pressable style={s.panel} onPress={() => {}}>
            <Text style={s.ttl}>选择到期时间</Text>
            <View style={s.dr}>
              <View style={s.dc}><Text style={s.dl}>月</Text><TextInput style={s.di} value={mon} onChangeText={setMon} keyboardType="number-pad" placeholder={`${new Date().getMonth()+1}`} placeholderTextColor="#CCC" maxLength={2} autoFocus /></View>
              <View style={s.dc}><Text style={s.dl}>日</Text><TextInput style={s.di} value={day} onChangeText={setDay} keyboardType="number-pad" placeholder={`${new Date().getDate()}`} placeholderTextColor="#CCC" maxLength={2} /></View>
              <View style={s.dc}><Text style={s.dl}>时</Text><TextInput style={s.di} value={hh} onChangeText={setHh} keyboardType="number-pad" placeholder="0" placeholderTextColor="#CCC" maxLength={2} /></View>
              <View style={s.dc}><Text style={s.dl}>分</Text><TextInput style={s.di} value={mm} onChangeText={setMm} keyboardType="number-pad" placeholder="0" placeholderTextColor="#CCC" maxLength={2} /></View>
            </View>
            <View style={s.br}><Text style={s.cc} onPress={close}>取消</Text><Text style={s.ok} onPress={applyCustom}>确定</Text></View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, justifyContent: 'center', flexWrap: 'wrap', paddingHorizontal: 8 },
  cap: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0E0E0' },
  act: { backgroundColor: '#87CEEB', borderColor: '#87CEEB' },
  txt: { fontSize: 14, color: '#666' },
  at: { color: '#FFF', fontWeight: '600' },
  bg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  panel: { backgroundColor: '#FFF', borderRadius: 16, padding: 24, width: 320 },
  ttl: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 18, textAlign: 'center' },
  tr: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  ti: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, padding: 12, fontSize: 28, textAlign: 'center', width: 80, backgroundColor: '#FAFAFA' },
  dr: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  dc: { alignItems: 'center' },
  dl: { fontSize: 12, color: '#999', marginBottom: 4 },
  di: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, padding: 10, fontSize: 18, textAlign: 'center', width: 62, backgroundColor: '#FAFAFA' },
  br: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 22 },
  cc: { fontSize: 16, color: '#999' },
  ok: { fontSize: 16, color: '#87CEEB', fontWeight: '600' },
});
