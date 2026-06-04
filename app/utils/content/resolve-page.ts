import type { ContentSource, RouteSlug } from './content-source'
import type { NormalizedSiteSettings } from '~/types/content'
import { normalizeRouteSlug } from './content-source'
import { resolvePageSeo } from './seo'
import { storyblokContentSource } from './storyblok-content-source'

type ResolvePageOptions = {
  source?: ContentSource
  siteUrl: string
  siteSettings?: NormalizedSiteSettings
}

export const resolvePage = async (
  slug: RouteSlug,
  { source, siteUrl, siteSettings }: ResolvePageOptions
) => {
  const activeSource = source || storyblokContentSource
  const normalizedSlug = normalizeRouteSlug(slug)
  const page = await activeSource.getPageBySlug(normalizedSlug)

  if (!page) {
    return null
  }

  return {
    page,
    seo: resolvePageSeo(page, siteUrl, siteSettings)
  }
}
