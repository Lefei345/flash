import * as FileSystem from 'expo-file-system/legacy';

let cachedToken = '';
let tokenExpiry = 0;

async function getToken(apiKey: string, secretKey: string): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const res = await fetch(
    `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`,
    { method: 'POST' }
  );
  const data = await res.json();
  if (!data.access_token) throw new Error('获取token失败');
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}

export async function transcribeAudio(
  audioUri: string,
  apiKey: string,
  secretKey: string
): Promise<string> {
  const token = await getToken(apiKey, secretKey);

  const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
    encoding: 'base64' as any,
  });

  const info = await FileSystem.getInfoAsync(audioUri);
  const fileSize = (info as any).size || 0;

  const body = JSON.stringify({
    format: 'm4a',
    rate: 16000,
    channel: 1,
    cuid: 'flash_app',
    token,
    speech: audioBase64,
    len: fileSize,
  });

  const res = await fetch('https://vop.baidu.com/server_api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  const data = await res.json();
  if (data.err_no !== 0) {
    throw new Error(data.err_msg || `识别失败(${data.err_no})`);
  }

  return data.result?.[0] || '';
}
