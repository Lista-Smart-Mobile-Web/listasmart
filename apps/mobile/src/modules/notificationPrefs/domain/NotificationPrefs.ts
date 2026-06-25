export const NOTIFICATION_PREFS_KEY = '@listasmart/notification-prefs'

export interface NotificationPrefs {
  enabled: boolean
  contributionApproved: boolean
  priceDrop: boolean
  offlineSync: boolean
}

export type NotificationPreferenceType = keyof Omit<NotificationPrefs, 'enabled'>

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  enabled: true,
  contributionApproved: true,
  priceDrop: true,
  offlineSync: true,
}
