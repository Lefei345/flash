import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Alert, ActivityIndicator, Pressable, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RecordButton from '../components/RecordButton';
import DurationPicker from '../components/DurationPicker';
import BgColorPicker from '../components/BgColorPicker';
import ThoughtItem from '../components/ThoughtItem';
import { useRecorder } from '../hooks/useRecorder';
import { insertThought, cleanExpired, getRecentThoughts, updateDone, updatePin, deleteThought, getSetting, setSetting } from '../db/database';
import { transcribeAudio } from '../utils/transcribe';
import { initNotifications, scheduleReminder, cancelReminder } from '../utils/notifications';

export default function RecordScreen({ onGoToList, onSave }: { onGoToList: () => void; onSave: () => void }) {
  const { isRecording, startRecording, stopRecording } = useRecorder();
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [hasKeys, setHasKeys] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState('');
  const [duration, setDuration] = useState(1440);
  const [recents, setRecents] = useState<any[]>([]);
  const [bgColor, setBgColor] = useState('#E3F2FD');
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [editText, setEditText] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const lastTap = useRef(0);

  useEffect(() => {
    initNotifications();
    Promise.all([getSetting('bd_key'), getSetting('bd_secret'), getSetting('bg_color')])
      .then(([k, s, c]) => { if (k && s) { setApiKey(k); setSecretKey(s); setHasKeys(true); } if (c) setBgColor(c); });
    cleanExpired().then(() => getRecentThoughts(3).then(setRecents));
  }, []);

  const refreshRecents = () => {
    getRecentThoughts(3).then(setRecents);
  };

  const save = async () => {
    if (!apiKey.trim() || !secretKey.trim()) { Alert.alert('两个都要填'); return; }
    await setSetting('bd_key', apiKey.trim());
    await setSetting('bd_secret', secretKey.trim());
    setHasKeys(true);
  };

  const changeBgColor = (color: string) => {
    setBgColor(color);
    setSetting('bg_color', color);
  };

  const handleScreenTap = () => {
    if (loading) return;
    const now = Date.now();
    if (now - lastTap.current < 300 && !isRecording) startRecording();
    lastTap.current = now;
  };

  const handlePressIn = () => startRecording();
  const handlePressOut = useCallback(async () => {
    const uri = await stopRecording();
    if (!uri) return;
    setLoading(true);
    try {
      const text = await transcribeAudio(uri, apiKey.trim(), secretKey.trim());
      if (text?.trim()) {
        setEditText(text.trim());
        setShowEdit(true);
      } else { Alert.alert('未识别到文字'); }
    } catch (e: any) { Alert.alert('识别失败', String(e?.message || e)); }
    setLoading(false);
  }, [stopRecording, apiKey, secretKey, duration]);

  const handleEditSave = async () => {
    const txt = editText.trim();
    if (!txt) return;
    const id = await insertThought(txt, duration);
    setLastSaved(txt);
    setShowEdit(false);
    setTimeout(() => setLastSaved(''), 3000);
    const expiresAt = Date.now() + duration * 60000;
    scheduleReminder(id, txt, expiresAt);
    cleanExpired();
    refreshRecents();
    onSave();
  };

  const handleTextSave = async () => {
    const txt = textInput.trim();
    if (!txt) return;
    const id = await insertThought(txt, duration);
    setLastSaved(txt);
    setTextInput('');
    setTimeout(() => setLastSaved(''), 3000);
    const expiresAt = Date.now() + duration * 60000;
    scheduleReminder(id, txt, expiresAt);
    cleanExpired();
    refreshRecents();
  };

  const handleToggle = async (id: string, done: boolean) => {
    await updateDone(id, done ? 1 : 0);
    refreshRecents();
  };

  const subtitle = isRecording ? '松手就存' : hasKeys ? '按住说话 · 双击屏幕快速录音' : '按住说话，松手就存';

  return (
    <SafeAreaView style={[ss.safe, { backgroundColor: bgColor }]}>
      <ScrollView style={ss.ctr} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
          <View style={ss.head}>
            <Text style={ss.t1}>Flash</Text>
            <Text style={ss.t2}>{subtitle}</Text>
          </View>
          {!hasKeys ? (
            <View style={ss.box}>
              <Text style={ss.bl}>百度语音 API 设置</Text>
              <TextInput style={ss.inp} value={apiKey} onChangeText={setApiKey} placeholder="API Key" placeholderTextColor="#BBB" autoCapitalize="none" />
              <TextInput style={ss.inp} value={secretKey} onChangeText={setSecretKey} placeholder="Secret Key" placeholderTextColor="#BBB" autoCapitalize="none" secureTextEntry />
              <Text style={ss.bn} onPress={save}>保存</Text>
            </View>
          ) : (
            <View style={{ alignItems: 'center' }}>
              <BgColorPicker selected={bgColor} onSelect={changeBgColor} />
              <Text style={ss.ke} onPress={() => setHasKeys(false)}>⚙️ 修改 API 设置</Text>
            </View>
          )}
          {/* 打字输入 */}
          <View style={{ alignItems: 'center', marginBottom: 4 }}>
            <Text style={ss.textToggle} onPress={() => setShowTextInput(!showTextInput)}>
              {showTextInput ? '🎤 语音' : '⌨️ 打字'}
            </Text>
            {showTextInput && (
              <View style={ss.textRow}>
                <TextInput
                  style={ss.textInp}
                  value={textInput}
                  onChangeText={setTextInput}
                  placeholder="输入念头..."
                  placeholderTextColor="#BBB"
                  onSubmitEditing={handleTextSave}
                  returnKeyType="send"
                />
                <Text style={ss.sendBtn} onPress={handleTextSave}>发送</Text>
              </View>
            )}
          </View>

          <View style={ss.mid}>
            <DurationPicker selected={duration} onSelect={setDuration} />
            <View style={{ height: 24 }} />
            {loading ? (
              <View style={{ alignItems: 'center' }}><ActivityIndicator color="#87CEEB" /><Text style={{ marginTop: 12, color: '#9E9E9E' }}>转文字中...</Text></View>
            ) : (
              <><RecordButton isRecording={isRecording} onPressIn={handlePressIn} onPressOut={handlePressOut} />{lastSaved ? <Text style={ss.sv} numberOfLines={3}>✓ {lastSaved}</Text> : null}</>
            )}
          </View>
          <View style={ss.bot}>
            {recents.length > 0 && (
              <View style={ss.recentBox}>
                <Text style={ss.recHead}>最近念头</Text>
                {recents.map(r => (
                  <ThoughtItem key={r.id} id={r.id} content={r.content}
                    done={!!r.done} createdAt={r.created_at} expiresAt={r.expires_at}
                    onDelete={async (id) => { await deleteThought(id); cancelReminder(id); refreshRecents(); }}
                    onToggle={(id) => handleToggle(id, !r.done)}
                    onPin={async (id) => { await updatePin(id, r.pinned ? 0 : 1); refreshRecents(); }}
                    pinned={!!r.pinned} minimal bgColor={bgColor} />
                ))}
                <Text style={ss.viewAll} onPress={onGoToList}>查看全部 →</Text>
              </View>
            )}
            {recents.length === 0 && !loading && (
              <Text style={ss.lk} onPress={onGoToList}>📋 查看念头</Text>
            )}
          </View>
        </ScrollView>
      {/* 语音转文字编辑弹窗 */}
      <Modal visible={showEdit} transparent animationType="fade">
        <Pressable style={ss.bg} onPress={() => setShowEdit(false)}>
          <Pressable style={ss.editModal} onPress={() => {}}>
            <Text style={ss.editTitle}>确认并编辑</Text>
            <TextInput
              style={ss.editInput}
              value={editText}
              onChangeText={setEditText}
              multiline
              autoFocus
              textAlignVertical="top"
            />
            <View style={ss.editRow}>
              <Text style={ss.editCancel} onPress={() => setShowEdit(false)}>取消</Text>
              <Text style={ss.editOk} onPress={handleEditSave}>保存</Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const ss = StyleSheet.create({
  safe: { flex: 1 },
  ctr: { flex: 1, paddingHorizontal: 20 },
  head: { paddingTop: 40, alignItems: 'center', justifyContent: 'center' },
  t1: { fontSize: 32, fontWeight: 'bold', color: '#87CEEB' },
  t2: { fontSize: 15, color: '#9E9E9E', marginTop: 8, textAlign: 'center' },
  box: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 8 },
  bl: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 10 },
  inp: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 10, fontSize: 14, marginTop: 8 },
  bn: { marginTop: 12, fontSize: 15, color: '#87CEEB', fontWeight: '600', textAlign: 'center', paddingVertical: 8 },
  mid: { alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  sv: { marginTop: 24, fontSize: 16, color: '#5C9FBF', textAlign: 'center', paddingHorizontal: 20 },
  bot: { flex: 1, alignItems: 'center', paddingTop: 8 },
  recentBox: { width: '100%' },
  recHead: { fontSize: 13, fontWeight: '600', color: '#9E9E9E', marginLeft: 16, marginBottom: 4 },
  viewAll: { textAlign: 'right', fontSize: 13, color: '#87CEEB', marginRight: 16, marginTop: 8 },
  lk: { fontSize: 16, color: '#87CEEB', paddingVertical: 12 },
  ke: { fontSize: 12, color: '#BBB', paddingVertical: 4, marginTop: 8 },
  textToggle: { fontSize: 13, color: '#87CEEB', paddingVertical: 4 },
  textRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  textInp: { flex: 1, backgroundColor: '#FFF', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, borderWidth: 1, borderColor: '#E0E0E0' },
  sendBtn: { fontSize: 15, color: '#87CEEB', fontWeight: '600', paddingHorizontal: 8 },
  bg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  editModal: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, width: '100%', maxHeight: 400 },
  editTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12, textAlign: 'center' },
  editInput: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, padding: 14, fontSize: 17, minHeight: 120, color: '#1A1A1A' },
  editRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  editCancel: { fontSize: 16, color: '#999' },
  editOk: { fontSize: 16, color: '#87CEEB', fontWeight: '600' },
});
