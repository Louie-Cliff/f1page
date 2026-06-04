import type { CookieConsentPreferences } from '~/types/consent'
import type { NormalizedSiteSettings } from '~/types/content'

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
  }
}

const gtmScriptId = 'boring-thing-gtm'

const ensureDataLayer = () => {
  window.dataLayer = window.dataLayer || []

  return window.dataLayer
}

const pushConsentEvent = (preferences: CookieConsentPreferences) => {
  ensureDataLayer().push({
    event: 'boring_thing_consent_update',
    consent: {
      necessary: true,
      analytics: preferences.analytics,
      marketing: preferences.marketing
    }
  })
}

const loadGtm = (gtmId: string) => {
  if (document.getElementById(gtmScriptId)) {
    return
  }

  const script = document.createElement('script')
  const firstScript = document.getElementsByTagName('script')[0]

  ensureDataLayer().push({
    'gtm.start': Date.now(),
    event: 'gtm.js'
  })

  script.id = gtmScriptId
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`

  const parentNode = firstScript?.parentNode || document.head
  parentNode.insertBefore(script, firstScript || null)
}

export default defineNuxtPlugin(() => {
  const { preferences } = useCookieConsent()
  const { data: siteSettings } = useNuxtData<NormalizedSiteSettings>('site-settings')
  const gtmId = computed(() => siteSettings.value?.gtmId || '')

  watch(
    [preferences, gtmId],
    ([nextPreferences, nextGtmId]) => {
      if (!nextGtmId || !nextPreferences.decided) {
        return
      }

      pushConsentEvent(nextPreferences)

      if (nextPreferences.analytics || nextPreferences.marketing) {
        loadGtm(nextGtmId)
      }
    },
    {
      immediate: true
    }
  )
})
