import * as Notifications from 'expo-notifications';

// 初始化通知权限
export async function initNotifications(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// 预定到期提醒
export async function scheduleReminder(id: string, content: string, expiresAt: number) {
  // 取消旧的同名通知
  await Notifications.cancelScheduledNotificationAsync(id);

  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title: 'Flash 提醒',
      body: content.length > 60 ? content.substring(0, 57) + '...' : content,
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(expiresAt),
    },
  });
}

// 取消提醒
export async function cancelReminder(id: string) {
  await Notifications.cancelScheduledNotificationAsync(id);
}
