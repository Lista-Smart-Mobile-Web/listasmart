import type { NotificationPrefs } from '../domain/NotificationPrefs'
import type { NotificationPrefsRepository } from './NotificationPrefsRepository'

export async function saveNotificationPrefsUseCase(
  repository: NotificationPrefsRepository,
  prefs: NotificationPrefs
): Promise<void> {
  await repository.save(prefs)
}
