import { DEFAULT_NOTIFICATION_PREFS } from '../domain/NotificationPrefs'
import type { NotificationPrefs } from '../domain/NotificationPrefs'
import type { NotificationPrefsRepository } from './NotificationPrefsRepository'

export async function loadNotificationPrefsUseCase(
  repository: NotificationPrefsRepository
): Promise<NotificationPrefs> {
  try {
    const loaded = await repository.load()
    return {
      ...DEFAULT_NOTIFICATION_PREFS,
      ...loaded,
    }
  } catch {
    return DEFAULT_NOTIFICATION_PREFS
  }
}
