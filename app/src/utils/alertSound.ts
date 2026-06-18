import CryptoJS from 'crypto-js';
import * as FileSystem from 'expo-file-system/legacy';

let beepUri: string | null = null;

export async function prepareBeep(): Promise<void> {
  if (beepUri) return;
  const b64 = generateBeepB64();
  const path = FileSystem.cacheDirectory + 'beep.wav';
  await FileSystem.writeAsStringAsync(path, b64, { encoding: 'base64' as any });
  beepUri = path;
}

export function getBeepUri(): string | null {
  return beepUri;
}

function generateBeepB64(): string {
  const sampleRate = 44100;
  // 三段提示音：滴滴滴
  const beepDuration = 0.15;  // 每声 150ms
  const gapDuration = 0.1;    // 间隔 100ms
  const totalBeeps = 3;
  const totalDuration = totalBeeps * beepDuration + (totalBeeps - 1) * gapDuration;
  const numSamples = Math.floor(sampleRate * totalDuration);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const ws = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  ws(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  ws(8, 'WAVE');
  ws(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  ws(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let val = 0;
    for (let b = 0; b < totalBeeps; b++) {
      const start = b * (beepDuration + gapDuration);
      const end = start + beepDuration;
      if (t >= start && t < end) {
        const localT = t - start;
        const freq = 1200 + b * 400; // 频率递增：1200, 1600, 2000 Hz
        val += Math.sin(2 * Math.PI * freq * localT) * 0.9 * Math.exp(-localT * 3);
      }
    }
    view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, val)) * 32767, true);
  }

  return CryptoJS.enc.Base64.stringify(
    CryptoJS.lib.WordArray.create(new Uint8Array(buffer))
  );
}
