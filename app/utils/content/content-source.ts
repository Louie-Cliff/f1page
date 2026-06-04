import type {
  ArticleQueryOptions,
  GameQueryOptions,
  NormalizedArticleListPage,
  NormalizedArticleSummary,
  NormalizedGameSummary,
  NormalizedPage,
  NormalizedSiteSettings
} from '~/types/content'

export type RouteSlug = string | string[] | undefined

export type ContentSource = {
  getPageBySlug: (slug: string) => Promise<NormalizedPage | null>
  getAllPagePaths: () => Promise<string[]>
  getArticles: (options?: ArticleQueryOptions) => Promise<NormalizedArticleSummary[]>
  getArticlePage: (options?: ArticleQueryOptions) => Promise<NormalizedArticleListPage>
  getGames: (options?: GameQueryOptions) => Promise<NormalizedGameSummary[]>
  getSiteSettings: () => Promise<NormalizedSiteSettings | null>
}

export const normalizeSlug = (slug: string) =>
  slug.replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/')

export const normalizeRouteSlug = (slug: RouteSlug) => {
  const rawSlug = Array.isArray(slug) ? slug.join('/') : slug || ''

  return normalizeSlug(rawSlug)
}

export const getPagePath = (page: NormalizedPage) =>
  page.slug ? `/${normalizeSlug(page.slug)}` : '/'
