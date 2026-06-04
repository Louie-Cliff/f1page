import type { ContentSource } from './content-source'
import { storyblokContentSource } from './storyblok-content-source'
import type { NormalizedSiteSettings } from '~/types/content'

type ResolveSiteSettingsOptions = {
  source?: ContentSource
}

const validateSiteSettings = (siteSettings: NormalizedSiteSettings) => {
  if (!siteSettings.siteName) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Storyblok site settings are missing a site name.'
    })
  }

  if (!siteSettings.navigation.length) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Storyblok site settings are missing navigation items.'
    })
  }
}

export const resolveSiteSettings = async (
  options: ResolveSiteSettingsOptions = {}
) => {
  const activeSource = options.source || storyblokContentSource
  const siteSettings = await activeSource.getSiteSettings()

  if (!siteSettings) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Storyblok site settings could not be loaded.'
    })
  }

  validateSiteSettings(siteSettings)

  return siteSettings
}
