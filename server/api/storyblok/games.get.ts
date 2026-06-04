export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Number(Array.isArray(query.limit) ? query.limit[0] : query.limit)
  const rawReferences = Array.isArray(query.references)
    ? query.references.join(',')
    : String(query.references || '')
  const references = rawReferences
    .split(',')
    .map((reference) => reference.trim())
    .filter(Boolean)

  return await fetchStoryblokGames({
    references,
    limit: Number.isFinite(limit) ? limit : undefined
  })
})
