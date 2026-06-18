import { useState } from 'react';
import { useAudioRecorder, RecordingPresets, setAudioModeAsync } from 'expo-audio';

export function useRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [active, setActive] = useState(false);

  const start = async () => {
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    await recorder.record();
    setActive(true);
  };

  const stop = async (): Promise<string | null> => {
    try {
      await recorder.stop();
      setActive(false);
      return recorder.uri ?? null;
    } catch { setActive(false); return null; }
  };

  return { isRecording: active, startRecording: start, stopRecording: stop };
}
