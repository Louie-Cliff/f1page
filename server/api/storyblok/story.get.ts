export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const slug = Array.isArray(query.slug) ? query.slug[0] : query.slug
  const normalizedSlug = String(slug || '').replace(/^\/+|\/+$/g, '')

  if (normalizedSlug === 'admin') {
    throw createError({
      statusCode: 404,
      statusMessage: 'Storyblok story not found.'
    })
  }

  const response = await fetchStoryblokStory(normalizedSlug)
  const component = String(response.story?.content?.component || '')

  if (
    component === 'site-settings' ||
    component === 'site_settings' ||
    !['page', 'article', 'game', 'modal'].includes(component)
  ) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Storyblok story not found.'
    })
  }

  return response
})
