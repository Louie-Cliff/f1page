import type { CookieConsentPreferences } from '~/types/consent'

const consentCookieName = 'boring_thing_cookie_consent'
const consentMaxAgeSeconds = 60 * 60 * 24 * 180

const defaultPreferences = (): CookieConsentPreferences => ({
  necessary: true,
  analytics: false,
  marketing: false,
  decided: false
})

export const useCookieConsent = () => {
  const cookie = useCookie<CookieConsentPreferences>(consentCookieName, {
    default: defaultPreferences,
    maxAge: consentMaxAgeSeconds,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  })

  const preferences = computed<CookieConsentPreferences>(() => ({
    ...defaultPreferences(),
    ...cookie.value,
    necessary: true
  }))

  const setPreferences = (
    nextPreferences: Pick<CookieConsentPreferences, 'analytics' | 'marketing'>
  ) => {
    cookie.value = {
      necessary: true,
      analytics: nextPreferences.analytics,
      marketing: nextPreferences.marketing,
      decided: true,
      updatedAt: new Date().toISOString()
    }
  }

  const acceptAll = () => {
    setPreferences({
      analytics: true,
      marketing: true
    })
  }

  const rejectOptional = () => {
    setPreferences({
      analytics: false,
      marketing: false
    })
  }

  const resetConsent = () => {
    cookie.value = defaultPreferences()
  }

  return {
    preferences,
    setPreferences,
    acceptAll,
    rejectOptional,
    resetConsent
  }
}
