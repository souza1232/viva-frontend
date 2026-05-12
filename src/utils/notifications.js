import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// expo-notifications não funciona no browser — apenas native
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function setupNotifications() {
  if (Platform.OS === 'web') return; // silencia no browser

  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (existing !== 'granted') {
      const { status: asked } = await Notifications.requestPermissionsAsync();
      status = asked;
    }
    if (status !== 'granted') return;

    await Notifications.cancelAllScheduledNotificationsAsync();

    // Ritual da manhã
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '☀️ Seu ritual de hoje está esperando',
        body: 'Mensagem da Viva + desafio do dia. Leva 1 minuto!',
      },
      trigger: { hour: 7, minute: 30, repeats: true },
    });

    // Lembrete check-in
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌸 Como você está se sentindo?',
        body: 'Registre seu humor para a Viva personalizar seu dia.',
      },
      trigger: { hour: 9, minute: 0, repeats: true },
    });

    // Lembrete noturno
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌙 Antes de dormir...',
        body: 'Como foi seu sono e seus fogachos hoje? Registre para acompanhar sua evolução.',
      },
      trigger: { hour: 21, minute: 0, repeats: true },
    });
  } catch {
    // Silencia erros (ex: simulador sem permissão)
  }
}
