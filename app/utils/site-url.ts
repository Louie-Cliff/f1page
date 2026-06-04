import type { NormalizedSiteSettings } from '~/types/content'

export const normalizeSiteUrl = (siteUrl?: string | null) => {
  const rawUrl = String(siteUrl || '').trim()

  if (!rawUrl) {
    return null
  }

  const urlWithProtocol = /^https?:\/\//i.test(rawUrl)
    ? rawUrl
    : `https://${rawUrl}`

  try {
    const url = new URL(urlWithProtocol)

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null
    }

    return url.toString().replace(/\/+$/g, '')
  } catch {
    return null
  }
}

export const resolveCanonicalSiteUrl = (
  siteSettings?: Pick<NormalizedSiteSettings, 'domain'> | null,
  fallbackSiteUrl?: string | null
) =>
  normalizeSiteUrl(siteSettings?.domain) ||
  normalizeSiteUrl(fallbackSiteUrl) ||
  'http://localhost:3000'
