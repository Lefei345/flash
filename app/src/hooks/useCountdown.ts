import { useEffect, useState } from 'react';

export function useCountdown(expiresAt: number): { text: string; urgent: boolean } {
  const [text, setText] = useState('');
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    const update = () => {
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) { setText('即将消失'); setUrgent(true); return; }

      const hours = Math.floor(remaining / 3600000);
      const mins = Math.floor((remaining % 3600000) / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setUrgent(hours === 0 && mins < 30);

      // 超过24小时：显示具体日期（正计时）
      if (hours >= 24) {
        const d = new Date(expiresAt);
        const m = d.getMonth() + 1;
        const day = d.getDate();
        const hh = d.getHours().toString().padStart(2, '0');
        const mm = d.getMinutes().toString().padStart(2, '0');
        setText(`${m}月${day}日 ${hh}:${mm} 消失`);
      } else if (hours >= 1) {
        setText(`${hours}小时${mins}分钟后消失`);
      } else if (mins >= 1) {
        setText(`${mins}分${secs}秒后消失`);
      } else {
        setText(`${secs}秒后消失`);
      }
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  return { text, urgent };
}
