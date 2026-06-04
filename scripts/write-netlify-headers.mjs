import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const isEditorDeploy =
  process.env.STORYBLOK_EDITOR_MODE === 'true' ||
  process.env.NUXT_PUBLIC_STORYBLOK_EDITOR_MODE === 'true' ||
  process.env.BRANCH === 'storyblok'
const isProductionDeploy = process.env.CONTEXT
  ? process.env.CONTEXT === 'production'
  : !isEditorDeploy
const storyblokFrameAncestors =
  process.env.STORYBLOK_FRAME_ANCESTORS || "'self' https://app.storyblok.com"

const globalHeaders = [
  '  X-Content-Type-Options: nosniff',
  '  Referrer-Policy: strict-origin-when-cross-origin',
  '  Permissions-Policy: camera=(), microphone=(), geolocation=()',
  '  Strict-Transport-Security: max-age=31536000; includeSubDomains',
  isEditorDeploy
    ? `  Content-Security-Policy: frame-ancestors ${storyblokFrameAncestors}`
    : "  X-Frame-Options: DENY\n  Content-Security-Policy: frame-ancestors 'self'",
  !isProductionDeploy ? '  X-Robots-Tag: noindex, nofollow' : ''
].filter(Boolean)

const headers = [
  '/*',
  ...globalHeaders,
  '',
  '/_nuxt/*',
  '  cache-control: public, max-age=31536000, immutable',
  '',
  '/api/*',
  '  cache-control: no-store',
  '',
  '/sitemap.xml',
  '  cache-control: public, max-age=3600',
  '',
  '/robots.txt',
  '  cache-control: public, max-age=3600',
  ''
].join('\n')

const publicDir = join(process.cwd(), 'public')

await mkdir(publicDir, { recursive: true })
await writeFile(join(publicDir, '_headers'), headers)
