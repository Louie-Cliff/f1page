import type {
  NormalizedPage,
  NormalizedSeo,
  NormalizedSiteSettings
} from '~/types/content'
import { getPagePath } from './content-source'
import { resolveCanonicalSiteUrl } from '~/utils/site-url'

const fallbackDescription =
  'A Boring Thing starter page for game industry websites.'

export const normalizeSeo = (seo?: NormalizedSeo | null): NormalizedSeo => ({
  ...(seo || {})
})

export const resolvePageSeo = (
  page: NormalizedPage,
  fallbackSiteUrl: string,
  siteSettings?: NormalizedSiteSettings
) => {
  const siteUrl = resolveCanonicalSiteUrl(siteSettings, fallbackSiteUrl)
  const defaultSeo = siteSettings?.seo
  const title = page.seo.title || defaultSeo?.title || page.name
  const description =
    page.seo.description || defaultSeo?.description || fallbackDescription
  const ogTitle = page.seo.ogTitle || title
  const ogDescription = page.seo.ogDescription || description
  const ogImage =
    page.seo.ogImage?.src ||
    page.seoImage?.src ||
    defaultSeo?.ogImage?.src ||
    siteSettings?.seoImage?.src
  const canonicalUrl = `${siteUrl}${getPagePath(page)}`

  return {
    meta: {
      title,
      description,
      ogTitle,
      ogDescription,
      ogImage,
      ogType: page.type === 'article' ? ('article' as const) : ('website' as const),
      twitterCard: ogImage ? ('summary_large_image' as const) : ('summary' as const)
    },
    head: {
      link: [{ rel: 'canonical', href: canonicalUrl }],
      meta: page.seo.noIndex || defaultSeo?.noIndex
        ? [{ name: 'robots', content: 'noindex,nofollow' }]
        : []
    }
  }
}
