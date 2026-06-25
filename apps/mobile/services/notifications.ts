import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import { shouldSendNotification } from './notificationPrefs'

// Comportamento padrão para notificações recebidas com app em foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

// ─── Registro de push token ───────────────────────────────────────────────────
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    // Simuladores não recebem push
    return null
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    return null
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Lista Smart',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C47A2A',
    })
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId
  const token = await Notifications.getExpoPushTokenAsync({ projectId })
  return token.data
}

// ─── Notificações locais ──────────────────────────────────────────────────────
export async function scheduleLocalNotification(
  title: string,
  body: string,
  delaySeconds = 1
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: delaySeconds },
  })
}

export async function notifyPriceAlert(productName: string, marketName: string, price: number): Promise<void> {
  if (!(await shouldSendNotification('priceDrop'))) return

  await scheduleLocalNotification(
    '💰 Queda de preço!',
    `${productName} está por R$ ${price.toFixed(2)} em ${marketName}`
  )
}

export async function notifyContributionApproved(points: number): Promise<void> {
  if (!(await shouldSendNotification('contributionApproved'))) return

  await scheduleLocalNotification(
    '✅ Contribuição aprovada',
    `+${points} pontos adicionados ao seu perfil!`
  )
}

export async function notifyOfflineSynced(count: number): Promise<void> {
  if (!(await shouldSendNotification('offlineSync'))) return

  await scheduleLocalNotification(
    '🔄 Sincronização concluída',
    `${count} ${count === 1 ? 'operação sincronizada' : 'operações sincronizadas'} com sucesso.`
  )
}

// ─── Listeners ────────────────────────────────────────────────────────────────
export function addNotificationReceivedListener(
  handler: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(handler)
}

export function addNotificationResponseListener(
  handler: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(handler)
}
