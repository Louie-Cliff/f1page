import { resolveCanonicalSiteUrl } from '../../app/utils/site-url'

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

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const siteUrl = resolveCanonicalSiteUrl(
    { domain: await getSiteSettingsDomain() },
    config.public.canonicalSiteUrl
  )
  const blockIndexing =
    config.public.storyblokEditorMode || config.public.storyblokVersion !== 'published'

  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')

  return [
    'User-agent: *',
    blockIndexing ? 'Disallow: /' : 'Allow: /',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`
  ].join('\n')
})
