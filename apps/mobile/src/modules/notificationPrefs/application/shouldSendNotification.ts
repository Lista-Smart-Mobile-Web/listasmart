import type { NotificationPreferenceType } from '../domain/NotificationPrefs'
import type { NotificationPrefsRepository } from './NotificationPrefsRepository'
import { loadNotificationPrefsUseCase } from './loadNotificationPrefs'

export async function shouldSendNotificationUseCase(
  repository: NotificationPrefsRepository,
  type: NotificationPreferenceType
): Promise<boolean> {
  const prefs = await loadNotificationPrefsUseCase(repository)
  return prefs.enabled && prefs[type]
}
