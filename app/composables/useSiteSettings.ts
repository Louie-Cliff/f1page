import { resolveSiteSettings } from '~/utils/content/resolve-site-settings'
import type { NormalizedSiteSettings } from '~/types/content'

export const useSiteSettings = async () => {
  const siteSettings = useState<NormalizedSiteSettings | null>(
    'site-settings',
    () => null
  )

  if (import.meta.server && !siteSettings.value) {
    siteSettings.value = await resolveSiteSettings()
  }

  if (!siteSettings.value) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Storyblok site settings are required for the site shell.'
    })
  }

  return {
    data: siteSettings
  }
}
