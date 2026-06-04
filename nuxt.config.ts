import tailwindcss from '@tailwindcss/vite'
import { getStoryblokRoutePaths } from './data/storyblok-route-paths'

const fallbackSiteName = 'Boring Thing'
const configuredSiteUrl = process.env.NUXT_PUBLIC_SITE_URL || ''
const configuredCanonicalSiteUrl = process.env.NUXT_PUBLIC_CANONICAL_SITE_URL || ''
const deploymentSiteUrl =
  process.env.CONTEXT === 'production'
    ? process.env.URL || process.env.DEPLOY_PRIME_URL || ''
    : process.env.DEPLOY_PRIME_URL || process.env.URL || ''
const isLocalSiteUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(
  configuredSiteUrl
)
const isLocalCanonicalSiteUrl =
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(
    configuredCanonicalSiteUrl
  )
const siteUrl =
  configuredCanonicalSiteUrl &&
  !(process.env.NETLIFY && isLocalCanonicalSiteUrl)
    ? configuredCanonicalSiteUrl
    : configuredSiteUrl && !(process.env.NETLIFY && isLocalSiteUrl)
      ? configuredSiteUrl
      : deploymentSiteUrl || configuredCanonicalSiteUrl || configuredSiteUrl || 'http://localhost:3000'
const storyblokRegion = process.env.STORYBLOK_REGION || 'eu'
const storyblokVersion = process.env.STORYBLOK_VERSION || 'draft'
const storyblokAccessToken =
  storyblokVersion === 'published'
    ? process.env.STORYBLOK_PUBLIC_TOKEN || process.env.STORYBLOK_PREVIEW_TOKEN || ''
    : process.env.STORYBLOK_PREVIEW_TOKEN || process.env.STORYBLOK_PUBLIC_TOKEN || ''
const storyblokHomeSlug = process.env.STORYBLOK_HOME_SLUG || 'home'
const storyblokEditorMode =
  process.env.STORYBLOK_EDITOR_MODE === 'true' ||
  process.env.NUXT_PUBLIC_STORYBLOK_EDITOR_MODE === 'true'
const storyblokEnableBridge = process.env.STORYBLOK_ENABLE_BRIDGE === 'true'
const pageLoaderMinMs = Number(
  process.env.NUXT_PUBLIC_PAGE_LOADER_MIN_MS ||
    process.env.NUXT_PUBLIC_PAGE_TRANSITION_MIN_MS ||
    (process.env.NODE_ENV === 'production' ? 0 : 900)
)
const pageTransitionMinMs = Number(
  process.env.NUXT_PUBLIC_PAGE_TRANSITION_MIN_MS ||
    (process.env.NODE_ENV === 'production' ? 0 : 650)
)
const projectGoogleFontLinks = [
  {
    rel: 'preconnect',
    href: 'https://fonts.googleapis.com'
  },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossorigin: ''
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&display=swap'
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0,0&display=swap'
  }
]

if (!storyblokAccessToken) {
  throw new Error(
    'Storyblok access token is missing. Set STORYBLOK_PREVIEW_TOKEN and/or STORYBLOK_PUBLIC_TOKEN before building Boring Thing.'
  )
}

const contentPrerenderRoutes =
  !storyblokEditorMode
    ? await getStoryblokRoutePaths({
        token: storyblokAccessToken,
        region: storyblokRegion,
        version: storyblokVersion,
        homeSlug: storyblokHomeSlug
      })
    : []
const sharedPrerenderRoutes = ['/robots.txt', '/sitemap.xml']

export default defineNuxtConfig({
  compatibilityDate: '2026-05-26',
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
  modules: [
    // Optional escape hatch for projects that want the official Nuxt bridge
    // module. The starter's default editor flow uses a tiny lazy bridge loader
    // so production and normal preview visitors do not download editor code.
    ...(storyblokEnableBridge
      ? [
          [
            '@storyblok/nuxt',
            {
              accessToken: storyblokAccessToken,
              apiOptions: {
                region: storyblokRegion
              }
            }
          ] as const
        ]
      : [])
  ],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()]
  },
  nitro: {
    prerender: {
      routes: [...new Set([...contentPrerenderRoutes, ...sharedPrerenderRoutes])]
    }
  },
  router: {
    options: {
      linkActiveClass: 'is-active',
      linkExactActiveClass: 'is-exact-active'
    }
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'en'
      },
      titleTemplate: (titleChunk) =>
        titleChunk ? `${titleChunk} | ${fallbackSiteName}` : fallbackSiteName,
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#101014' }
      ],
      link: projectGoogleFontLinks
    }
  },
  runtimeConfig: {
    contactRateLimitMax: Number(process.env.CONTACT_RATE_LIMIT_MAX || 5),
    contactRateLimitEmailMax: Number(process.env.CONTACT_RATE_LIMIT_EMAIL_MAX || 3),
    contactRateLimitWindowMs: Number(process.env.CONTACT_RATE_LIMIT_WINDOW_MS || 600000),
    storyblokHomeSlug,
    sitemapPaths: contentPrerenderRoutes,
    public: {
      canonicalSiteUrl: siteUrl,
      storyblokEditorMode,
      storyblokRegion,
      storyblokVersion,
      storyblokHomeSlug,
      storyblokEnableBridge,
      pageLoaderMinMs,
      pageTransitionMinMs
    }
  },
  typescript: {
    strict: true
  }
})
