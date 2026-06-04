import type { H3Event } from 'h3'

const accessCookieName = 'bt_storyblok_preview'
const accessQueryName = 'bt_preview'
const accessPathPrefixes = ['/_preview/', '/_bt-preview/']

const hasStoryblokPreviewParams = (query: Record<string, unknown>) =>
  Object.keys(query).some((key) => key.startsWith('_storyblok'))

const isPublicAssetPath = (path: string) =>
  path.startsWith('/_nuxt/') ||
  path.startsWith('/api/storyblok/') ||
  path === '/favicon.ico' ||
  path === '/robots.txt' ||
  path === '/sitemap.xml'

const isLocalEditorHost = (url: URL) =>
  ['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(url.hostname)

const getQueryValue = (value: unknown) =>
  Array.isArray(value) ? String(value[0] || '') : String(value || '')

const setAccessCookie = (event: H3Event, accessToken: string) => {
  const url = getRequestURL(event)
  const isSecureRequest = url.protocol === 'https:'

  setCookie(event, accessCookieName, accessToken, {
    httpOnly: true,
    maxAge: 60 * 60 * 12,
    path: '/',
    sameSite: isSecureRequest ? 'none' : 'lax',
    secure: isSecureRequest
  })
}

const redirectToPreviewPath = (event: H3Event, path: string) => {
  const url = getRequestURL(event)
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  url.searchParams.delete(accessQueryName)
  const search = url.searchParams.toString()
  const redirectPath = `${normalizedPath || '/'}${search ? `?${search}` : ''}`

  return sendRedirect(event, redirectPath, 302)
}

const getPathFromQueryTokenSuffix = (suppliedToken: string, accessToken: string) => {
  if (!suppliedToken.startsWith(accessToken)) {
    return null
  }

  const suffix = suppliedToken.slice(accessToken.length).replace(/^\/+/, '')

  return suffix ? `/${suffix}` : null
}

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()

  if (!config.public.storyblokEditorMode) {
    return
  }

  const url = getRequestURL(event)

  if (isPublicAssetPath(url.pathname)) {
    return
  }

  const query = getQuery(event)
  const accessToken = process.env.STORYBLOK_EDITOR_ACCESS_TOKEN || ''
  const suppliedToken = getQueryValue(query[accessQueryName])

  const accessPathPrefix = accessPathPrefixes.find((prefix) =>
    url.pathname.startsWith(prefix)
  )

  if (accessToken && accessPathPrefix) {
    const previewPath = decodeURIComponent(url.pathname.slice(accessPathPrefix.length))
    const [pathToken, ...pathParts] = previewPath.split('/')

    if (pathToken === accessToken) {
      setAccessCookie(event, accessToken)

      return redirectToPreviewPath(event, `/${pathParts.join('/')}`)
    }
  }

  // Local HTTPS editor mode is used by developers, not public visitors. Allow
  // direct browsing outside Storyblok so local testing does not fight the
  // public branch access gate.
  if (isLocalEditorHost(url) && !accessPathPrefix) {
    return
  }

  if (accessToken && suppliedToken === accessToken) {
    setAccessCookie(event, accessToken)

    return
  }

  const querySuffixPath =
    accessToken && suppliedToken
      ? getPathFromQueryTokenSuffix(suppliedToken, accessToken)
      : null

  if (querySuffixPath) {
    setAccessCookie(event, accessToken)

    return redirectToPreviewPath(event, querySuffixPath)
  }

  if (accessToken && getCookie(event, accessCookieName) === accessToken) {
    return
  }

  // If no shared token is configured yet, block casual direct visits while
  // still allowing Storyblok's iframe requests that carry preview parameters.
  if (!accessToken && hasStoryblokPreviewParams(query)) {
    return
  }

  throw createError({
    statusCode: 404,
    statusMessage: 'Preview not found.'
  })
})
