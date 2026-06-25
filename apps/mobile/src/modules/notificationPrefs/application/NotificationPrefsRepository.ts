import type { NotificationPrefs } from '../domain/NotificationPrefs'

export interface NotificationPrefsRepository {
  load(): Promise<NotificationPrefs>
  save(prefs: NotificationPrefs): Promise<void>
}
