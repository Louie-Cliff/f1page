import type { ContentSource } from './content-source'
import { normalizeSlug } from './content-source'
import {
  normalizeStoryblokArticleSummary,
  normalizeStoryblokGameSummary,
  normalizeStoryblokSiteSettings,
  normalizeStoryblokStory
} from './storyblok-mappers'
import type {
  StoryblokPaginatedStoriesResponse,
  StoryblokStoriesResponse,
  StoryblokStoryResponse
} from '~/types/storyblok'

const getFetchErrorStatus = (error: unknown) => {
  const fetchError = error as {
    status?: unknown
    statusCode?: unknown
    response?: { status?: unknown }
    data?: { status?: unknown; statusCode?: unknown }
  }

  const status =
    fetchError.statusCode ||
    fetchError.status ||
    fetchError.response?.status ||
    fetchError.data?.statusCode ||
    fetchError.data?.status

  return typeof status === 'number' ? status : null
}

export const storyblokContentSource: ContentSource = {
  async getPageBySlug(slug) {
    const normalizedSlug = normalizeSlug(slug)
    const config = useRuntimeConfig()
    let response: StoryblokStoryResponse

    try {
      response = await $fetch<StoryblokStoryResponse>('/api/storyblok/story', {
        query: {
          slug: normalizedSlug
        }
      })
    } catch (error) {
      if (getFetchErrorStatus(error) === 404) {
        return null
      }

      throw error
    }

    return response.story
      ? normalizeStoryblokStory(response.story, {
          homeSlug: config.public.storyblokHomeSlug
        })
      : null
  },

  async getAllPagePaths() {
    return await $fetch<string[]>('/api/storyblok/paths')
  },

  async getArticles(options) {
    const response = await this.getArticlePage(options)

    return response.articles
  },

  async getArticlePage(options) {
    const config = useRuntimeConfig()
    const response = await $fetch<StoryblokPaginatedStoriesResponse>('/api/storyblok/articles', {
      query: {
        featured: options?.featured ? 'true' : undefined,
        limit: options?.limit,
        page: options?.page
      }
    })

    return {
      articles: response.stories.map((story) =>
        normalizeStoryblokArticleSummary(story, {
          homeSlug: config.public.storyblokHomeSlug
        })
      ),
      total: response.total,
      page: response.page,
      perPage: response.perPage,
      totalPages: response.totalPages
    }
  },

  async getGames(options) {
    const config = useRuntimeConfig()
    const response = await $fetch<StoryblokStoriesResponse>('/api/storyblok/games', {
      query: {
        references: options?.references?.join(','),
        limit: options?.limit
      }
    })

    return response.stories.map((story) =>
      normalizeStoryblokGameSummary(story, {
        homeSlug: config.public.storyblokHomeSlug
      })
    )
  },

  async getSiteSettings() {
    const config = useRuntimeConfig()
    const storyblokOptions = {
      region: config.public.storyblokRegion,
      version: config.public.storyblokVersion
    }

    if (import.meta.client) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Storyblok site settings must be loaded from the server.'
      })
    }

    const { fetchStoryblokSiteSettings } = await import(
      '~~/server/utils/storyblok'
    )
    const response = await fetchStoryblokSiteSettings(storyblokOptions)

    return response.story
      ? normalizeStoryblokSiteSettings(response.story, {
          homeSlug: config.public.storyblokHomeSlug
        })
      : null
  }
}
