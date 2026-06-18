import { useRef, forwardRef, useImperativeHandle } from 'react';
import { WebView } from 'react-native-webview';

const HTML = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body>
<script>
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    window.ReactNativeWebView.postMessage(JSON.stringify({type:'error',msg:'不支持语音识别'}));
  }

  let recognition = null;

  function start() {
    if (!SpeechRecognition) return;
    try {
      recognition = new SpeechRecognition();
      recognition.lang = 'zh-CN';
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onresult = function(event) {
        let text = '';
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'result',
          text: text,
          isFinal: event.results[event.results.length - 1].isFinal
        }));
      };

      recognition.onerror = function(event) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'error',
          msg: event.error
        }));
      };

      recognition.onend = function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({type:'end'}));
      };

      recognition.start();
    } catch(e) {
      window.ReactNativeWebView.postMessage(JSON.stringify({type:'error',msg:e.message}));
    }
  }

  function stop() {
    if (recognition) {
      recognition.stop();
      recognition = null;
    }
  }

  // 接收 RN 命令
  window.addEventListener('message', function(event) {
    try {
      const data = JSON.parse(event.data);
      if (data.cmd === 'start') start();
      else if (data.cmd === 'stop') stop();
    } catch(e) {}
  });

  // 通知就绪
  window.ReactNativeWebView.postMessage(JSON.stringify({type:'ready'}));
</script>
</body>
</html>
`;

export interface SpeechRecognizerHandle {
  start: () => void;
  stop: () => void;
}

interface Props {
  onResult?: (text: string, isFinal: boolean) => void;
  onError?: (msg: string) => void;
  onEnd?: () => void;
}

const SpeechRecognizer = forwardRef<SpeechRecognizerHandle, Props>(
  function SpeechRecognizer({ onResult, onError, onEnd }, ref) {
    const webViewRef = useRef<WebView>(null);

    useImperativeHandle(ref, () => ({
      start() {
        webViewRef.current?.postMessage(JSON.stringify({ cmd: 'start' }));
      },
      stop() {
        webViewRef.current?.postMessage(JSON.stringify({ cmd: 'stop' }));
      },
    }));

    const handleMessage = (event: { nativeEvent: { data: string } }) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        switch (data.type) {
          case 'result':
            onResult?.(data.text, data.isFinal);
            break;
          case 'error':
            onError?.(data.msg);
            break;
          case 'end':
            onEnd?.();
            break;
        }
      } catch {}
    };

    return (
      <WebView
        ref={webViewRef}
        source={{ html: HTML }}
        style={{ width: 1, height: 1, position: 'absolute', left: -10, top: -10 }}
        javaScriptEnabled
        originWhitelist={['*']}
        onMessage={handleMessage}
        mediaPlaybackRequiresUserAction={false}
      />
    );
  }
);

export default SpeechRecognizer;
