import AsyncStorage from '@react-native-async-storage/async-storage'

export const NOTIFICATION_PREFS_KEY = '@listasmart/notification-prefs'

export interface NotificationPrefs {
  enabled: boolean
  contributionApproved: boolean
  priceDrop: boolean
  offlineSync: boolean
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  enabled: true,
  contributionApproved: true,
  priceDrop: true,
  offlineSync: true,
}

export async function loadNotificationPrefs(): Promise<NotificationPrefs> {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY)
    if (!raw) return DEFAULT_NOTIFICATION_PREFS
    return {
      ...DEFAULT_NOTIFICATION_PREFS,
      ...(JSON.parse(raw) as Partial<NotificationPrefs>),
    }
  } catch {
    return DEFAULT_NOTIFICATION_PREFS
  }
}

export async function saveNotificationPrefs(prefs: NotificationPrefs): Promise<void> {
  await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs))
}

export async function shouldSendNotification(type: keyof Omit<NotificationPrefs, 'enabled'>): Promise<boolean> {
  const prefs = await loadNotificationPrefs()
  return prefs.enabled && prefs[type]
}
