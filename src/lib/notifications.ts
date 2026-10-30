import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function ensureReportNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reportes', {
      name: 'Reportes',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#176B5B',
    });
  }
}

export async function scheduleResolutionNotification(title: string) {
  await ensureReportNotificationChannel();
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Reporte resuelto',
      body: `Se resolvió: ${title}`,
      sound: true,
      data: { channel: 'reportes' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 10,
      ...(Platform.OS === 'android' ? { channelId: 'reportes' } : {}),
    },
  });
}
