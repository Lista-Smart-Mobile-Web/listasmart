import {
  DEFAULT_NOTIFICATION_PREFS,
  NOTIFICATION_PREFS_KEY,
  type NotificationPreferenceType,
  type NotificationPrefs,
} from '@/src/modules/notificationPrefs/domain/NotificationPrefs'
import { AsyncStorageNotificationPrefsRepository } from '@/src/modules/notificationPrefs/infrastructure/AsyncStorageNotificationPrefsRepository'
import { loadNotificationPrefsUseCase } from '@/src/modules/notificationPrefs/application/loadNotificationPrefs'
import { saveNotificationPrefsUseCase } from '@/src/modules/notificationPrefs/application/saveNotificationPrefs'
import { shouldSendNotificationUseCase } from '@/src/modules/notificationPrefs/application/shouldSendNotification'

const repository = new AsyncStorageNotificationPrefsRepository()

export { NOTIFICATION_PREFS_KEY, DEFAULT_NOTIFICATION_PREFS }
export type { NotificationPrefs }

export async function loadNotificationPrefs(): Promise<NotificationPrefs> {
  return loadNotificationPrefsUseCase(repository)
}

export async function saveNotificationPrefs(prefs: NotificationPrefs): Promise<void> {
  await saveNotificationPrefsUseCase(repository, prefs)
}

export async function shouldSendNotification(type: NotificationPreferenceType): Promise<boolean> {
  return shouldSendNotificationUseCase(repository, type)
}
