import type {
  StoryblokPaginatedStoriesResponse,
  StoryblokStoriesResponse,
  StoryblokStory,
  StoryblokStoryResponse
} from '../../app/types/storyblok'
import type {
  ArticleQueryOptions,
  GameQueryOptions
} from '../../app/types/content'

type StoryblokVersion = 'draft' | 'published'

type StoryblokRequestOptions = {
  region?: string
  version?: string
  previewToken?: string
  publicToken?: string
}

const getStoryblokApiBase = (region: string) => {
  if (!region || region === 'eu') {
    return 'https://api.storyblok.com/v2/cdn'
  }

  return `https://api-${region}.storyblok.com/v2/cdn`
}

const getStoryblokToken = (options?: StoryblokRequestOptions) => {
  if (options) {
    const version = options.version === 'published' ? 'published' : 'draft'

    if (version === 'published') {
      return (
        options.publicToken ||
        options.previewToken ||
        process.env.STORYBLOK_PUBLIC_TOKEN ||
        process.env.STORYBLOK_PREVIEW_TOKEN ||
        ''
      )
    }

    return (
      options.previewToken ||
      options.publicToken ||
      process.env.STORYBLOK_PREVIEW_TOKEN ||
      process.env.STORYBLOK_PUBLIC_TOKEN ||
      ''
    )
  }

  const config = useRuntimeConfig()
  const version = config.public.storyblokVersion as StoryblokVersion

  if (version === 'published') {
    return process.env.STORYBLOK_PUBLIC_TOKEN || process.env.STORYBLOK_PREVIEW_TOKEN
  }

  return process.env.STORYBLOK_PREVIEW_TOKEN || process.env.STORYBLOK_PUBLIC_TOKEN
}

const getStoryblokVersion = (options?: StoryblokRequestOptions) => {
  if (options) {
    return options.version === 'published' ? 'published' : 'draft'
  }

  const config = useRuntimeConfig()

  return config.public.storyblokVersion === 'published' ? 'published' : 'draft'
}

const getStoryblokRegion = (options?: StoryblokRequestOptions) => {
  if (options) {
    return options.region || 'eu'
  }

  return useRuntimeConfig().public.storyblokRegion
}

const getStoryblokRequestUrl = (
  path: string,
  params: Record<string, string>,
  options?: StoryblokRequestOptions
) => {
  const url = new URL(`${getStoryblokApiBase(getStoryblokRegion(options))}/${path}`)
  const token = getStoryblokToken(options)

  if (!token) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Storyblok access token is missing.'
    })
  }

  url.searchParams.set('token', token)
  url.searchParams.set('version', getStoryblokVersion(options))

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      url.searchParams.set(key, value)
    }
  }

  return url
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const getSafeStoryblokUrl = (url: URL) => {
  const safeUrl = new URL(url)

  safeUrl.searchParams.set('token', '[redacted]')

  return safeUrl.toString()
}

const requestStoryblok = async <T>(
  path: string,
  params: Record<string, string> = {},
  options?: StoryblokRequestOptions
) => {
  const url = getStoryblokRequestUrl(path, params, options)
  const retryableStatuses = new Set([408, 425, 429, 500, 502, 503, 504])
  let response: Response | undefined

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    response = await fetch(url)

    if (response.ok || !retryableStatuses.has(response.status) || attempt === 3) {
      break
    }

    await wait(250 * attempt)
  }

  if (!response?.ok) {
    const status = response?.status || 502
    const responseText = response ? await response.text().catch(() => '') : ''
    const detail = [
      `Storyblok request failed with status ${status}`,
      responseText ? `Response: ${responseText.slice(0, 240)}` : '',
      `URL: ${getSafeStoryblokUrl(url)}`
    ].filter(Boolean).join(' | ')

    console.warn(detail)

    throw createError({
      statusCode: status === 404 ? 404 : 502,
      statusMessage:
        status === 404
          ? 'Storyblok story not found.'
          : 'Storyblok request failed.'
    })
  }

  return {
    data: (await response.json()) as T,
    total: Number(response.headers.get('total') || 0)
  }
}

export const fetchStoryblokStory = async (slug: string) => {
  const config = useRuntimeConfig()
  const requestedSlug = slug || config.storyblokHomeSlug || 'home'
  const path = `stories/${requestedSlug.replace(/^\/+|\/+$/g, '')}`
  const { data } = await requestStoryblok<StoryblokStoryResponse>(path)

  return data
}

const isSiteSettingsStory = (story?: StoryblokStory) =>
  story?.content?.component === 'site-settings' ||
  story?.content?.component === 'site_settings'

const fetchSiteSettingsByContentType = async (options?: StoryblokRequestOptions) => {
  const componentNames = ['site-settings', 'site_settings']

  for (const contentType of componentNames) {
    const { data } = await requestStoryblok<StoryblokStoriesResponse>(
      'stories',
      {
        content_type: contentType,
        page: '1',
        per_page: '1'
      },
      options
    )

    const story = data.stories.find(isSiteSettingsStory)

    if (story) {
      return {
        story
      }
    }
  }

  return null
}

export const fetchStoryblokSiteSettings = async (options?: StoryblokRequestOptions) => {
  try {
    const { data } = await requestStoryblok<StoryblokStoryResponse>(
      'stories/admin',
      {},
      options
    )

    if (isSiteSettingsStory(data.story)) {
      return data
    }
  } catch {
    // Some spaces expose settings at /admin via Storyblok real path rather than
    // story slug. Fall through and locate the singleton by component type.
  }

  const data = await fetchSiteSettingsByContentType(options)

  if (data) {
    return data
  }

  throw createError({
    statusCode: 404,
    statusMessage: 'Storyblok site settings story not found.'
  })
}

const isRenderableStory = (story: StoryblokStory) =>
  ['page', 'article', 'game'].includes(String(story.content?.component))

const storyPathFromFullSlug = (fullSlug: string) => {
  const config = useRuntimeConfig()
  const homeSlug = config.storyblokHomeSlug || 'home'
  const normalizedSlug = fullSlug.replace(/^\/+|\/+$/g, '')

  return normalizedSlug === homeSlug ? '/' : `/${normalizedSlug}`
}

export const fetchStoryblokPaths = async () => {
  const perPage = 100
  let page = 1
  let total = 0
  const stories: StoryblokStory[] = []

  do {
    const { data, total: totalStories } = await requestStoryblok<StoryblokStoriesResponse>(
      'stories',
      {
        page: String(page),
        per_page: String(perPage),
        excluding_fields: 'body,article'
      }
    )

    stories.push(...data.stories)
    total = totalStories || stories.length
    page += 1
  } while (stories.length < total)

  return stories.filter(isRenderableStory).map((story) => storyPathFromFullSlug(story.full_slug))
}

export const fetchStoryblokArticlePage = async (
  options: ArticleQueryOptions = {}
): Promise<StoryblokPaginatedStoriesResponse> => {
  const perPage = Math.min(Math.max(options.limit || 12, 1), 100)
  const page = Math.max(options.page || 1, 1)
  const params: Record<string, string> = {
    content_type: 'article',
    page: String(page),
    per_page: String(perPage),
    sort_by: 'content.date:desc',
    excluding_fields: 'article'
  }

  if (options.featured) {
    params['filter_query[featured][is]'] = 'true'
  }

  const { data, total } = await requestStoryblok<StoryblokStoriesResponse>('stories', params)

  return {
    ...data,
    total,
    page,
    perPage,
    totalPages: Math.max(Math.ceil(total / perPage), 1)
  }
}

export const fetchStoryblokArticles = async (options: ArticleQueryOptions = {}) => {
  const data = await fetchStoryblokArticlePage(options)

  return {
    stories: data.stories,
    cv: data.cv
  }
}

export const fetchStoryblokGames = async (options: GameQueryOptions = {}) => {
  const references = (options.references || [])
    .map((reference) => String(reference || '').trim())
    .filter(Boolean)
  const perPage = Math.min(Math.max(options.limit || references.length || 100, 1), 100)
  const params: Record<string, string> = {
    content_type: 'game',
    page: '1',
    per_page: String(perPage),
    sort_by: 'content.date:desc',
    excluding_fields: 'gallery,features,updates'
  }

  if (references.length) {
    params.by_uuids = references.join(',')
  }

  const { data } = await requestStoryblok<StoryblokStoriesResponse>('stories', params)

  if (!references.length) {
    return data
  }

  const storyByUuid = new Map(data.stories.map((story) => [story.uuid, story]))

  return {
    ...data,
    stories: references
      .map((reference) => storyByUuid.get(reference))
      .filter((story): story is StoryblokStory => Boolean(story))
  }
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const resolveStoryblokPagePath = async (reference?: string) => {
  const config = useRuntimeConfig()
  const value = String(reference || '').trim()

  if (!value) {
    return undefined
  }

  if (value.startsWith('/')) {
    return value
  }

  if (!uuidPattern.test(value)) {
    return value === config.storyblokHomeSlug ? '/' : `/${value.replace(/^\/+|\/+$/g, '')}`
  }

  // Storyblok single-option fields sourced from "Stories" can store a UUID.
  // Fetching with find_by=uuid turns that UUID into the current CMS URL.
  const { data } = await requestStoryblok<StoryblokStoryResponse>(
    `stories/${value}`,
    {
      find_by: 'uuid'
    }
  )

  if (!data.story?.full_slug) {
    return undefined
  }

  const slug = data.story.full_slug.replace(/^\/+|\/+$/g, '')

  return slug === config.storyblokHomeSlug ? '/' : `/${slug}`
}
