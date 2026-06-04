import { resolveCanonicalSiteUrl } from '../../app/utils/site-url'

const escapeXml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

const getSiteSettingsDomain = async () => {
  try {
    const { fetchStoryblokSiteSettings } = await import('../utils/storyblok')
    const response = await fetchStoryblokSiteSettings()

    return typeof response.story?.content?.domain === 'string'
      ? response.story.content.domain
      : undefined
  } catch {
    return undefined
  }
}

const getSitemapPaths = async (config: ReturnType<typeof useRuntimeConfig>) => {
  const configuredPaths = Array.isArray(config.sitemapPaths)
    ? config.sitemapPaths
    : []

  if (configuredPaths.length) {
    return configuredPaths
  }

  if (config.public.storyblokEditorMode || config.public.storyblokVersion !== 'published') {
    return ['/']
  }

  return await fetchStoryblokPaths()
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const siteUrl = resolveCanonicalSiteUrl(
    { domain: await getSiteSettingsDomain() },
    config.public.canonicalSiteUrl
  )
  const paths = [...new Set(await getSitemapPaths(config))].sort()
  const urls = paths
    .map((path) => {
      const normalizedPath = path === '/' ? '' : path.replace(/\/+$/g, '')

      return [
        '  <url>',
        `    <loc>${escapeXml(`${siteUrl}${normalizedPath}`)}</loc>`,
        '  </url>'
      ].join('\n')
    })
    .join('\n')

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>'
  ].join('\n')
})
