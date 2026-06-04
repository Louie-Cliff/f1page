export type ConsentCategory = 'necessary' | 'analytics' | 'marketing'

export type CookieConsentPreferences = Record<ConsentCategory, boolean> & {
  decided: boolean
  updatedAt?: string
}
