import { fetchStoryblokArticlePage } from '~~/server/utils/storyblok'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Number(Array.isArray(query.limit) ? query.limit[0] : query.limit)
  const page = Number(Array.isArray(query.page) ? query.page[0] : query.page)
  const featured = String(
    Array.isArray(query.featured) ? query.featured[0] : query.featured || ''
  )

  return await fetchStoryblokArticlePage({
    featured: featured === 'true',
    limit: Number.isFinite(limit) ? limit : undefined,
    page: Number.isFinite(page) ? page : undefined
  })
})
