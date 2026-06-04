import type { StoryblokStoriesResponse, StoryblokStory } from '../app/types/storyblok'

type RoutePathOptions = {
  token: string
  region: string
  version: string
  homeSlug: string
}

const getStoryblokApiBase = (region: string) => {
  if (!region || region === 'eu') {
    return 'https://api.storyblok.com/v2/cdn'
  }

  return `https://api-${region}.storyblok.com/v2/cdn`
}

const isRenderableStory = (story: StoryblokStory) =>
  ['page', 'article', 'game'].includes(String(story.content?.component))

const storyPathFromFullSlug = (fullSlug: string, homeSlug: string) => {
  const normalizedSlug = fullSlug.replace(/^\/+|\/+$/g, '')

  return normalizedSlug === homeSlug ? '/' : `/${normalizedSlug}`
}

const requestStoriesPage = async (
  page: number,
  { token, region, version }: RoutePathOptions
) => {
  const url = new URL(`${getStoryblokApiBase(region)}/stories`)

  url.searchParams.set('token', token)
  url.searchParams.set('version', version === 'published' ? 'published' : 'draft')
  url.searchParams.set('page', String(page))
  url.searchParams.set('per_page', '100')
  url.searchParams.set('excluding_fields', 'body,article')

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Storyblok route fetch failed with status ${response.status}`)
  }

  return {
    data: (await response.json()) as StoryblokStoriesResponse,
    total: Number(response.headers.get('total') || 0)
  }
}

export const getStoryblokRoutePaths = async (options: RoutePathOptions) => {
  const stories: StoryblokStory[] = []
  const perPage = 100
  let page = 1
  let total = 0

  do {
    const { data, total: totalStories } = await requestStoriesPage(page, options)

    stories.push(...data.stories)
    total = totalStories || stories.length
    page += 1
  } while (stories.length < total && dataPageHasMore(stories.length, total, perPage))

  return stories
    .filter(isRenderableStory)
    .map((story) => storyPathFromFullSlug(story.full_slug, options.homeSlug))
}

const dataPageHasMore = (loaded: number, total: number, perPage: number) =>
  total > 0 && loaded >= perPage
