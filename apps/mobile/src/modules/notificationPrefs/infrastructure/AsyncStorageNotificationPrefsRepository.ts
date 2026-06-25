import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  DEFAULT_NOTIFICATION_PREFS,
  NOTIFICATION_PREFS_KEY,
  type NotificationPrefs,
} from '../domain/NotificationPrefs'
import type { NotificationPrefsRepository } from '../application/NotificationPrefsRepository'

export class AsyncStorageNotificationPrefsRepository implements NotificationPrefsRepository {
  async load(): Promise<NotificationPrefs> {
    const raw = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY)
    if (!raw) return DEFAULT_NOTIFICATION_PREFS

    const parsed = JSON.parse(raw) as Partial<NotificationPrefs>
    return {
      ...DEFAULT_NOTIFICATION_PREFS,
      ...parsed,
    }
  }

  async save(prefs: NotificationPrefs): Promise<void> {
    await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs))
  }
}
