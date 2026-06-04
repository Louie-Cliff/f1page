type NetlifyDeployState =
  | 'new'
  | 'pending_review'
  | 'accepted'
  | 'rejected'
  | 'enqueued'
  | 'building'
  | 'uploading'
  | 'uploaded'
  | 'preparing'
  | 'prepared'
  | 'processing'
  | 'processed'
  | 'ready'
  | 'error'
  | 'retrying'
  | 'canceled'
  | 'skipped'
  | string

type RawNetlifyDeploy = {
  id?: string
  state?: NetlifyDeployState
  name?: string
  title?: string
  branch?: string
  context?: string
  url?: string
  ssl_url?: string
  deploy_url?: string
  deploy_ssl_url?: string
  admin_url?: string
  commit_ref?: string
  commit_url?: string
  commit_message?: string
  deploy_time?: number
  created_at?: string
  updated_at?: string
  published_at?: string
  error_message?: string
}

export type NormalizedNetlifyDeploy = {
  id: string
  state: NetlifyDeployState
  label: string
  progress: number
  branch?: string
  context?: string
  url?: string
  commitRef?: string
  commitMessage?: string
  deployTime?: number
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
  errorMessage?: string
}

const apiBaseUrl = 'https://api.netlify.com/api/v1'

const deployStateLabels: Record<string, string> = {
  new: 'Created',
  pending_review: 'Pending review',
  accepted: 'Accepted',
  rejected: 'Rejected',
  enqueued: 'Queued',
  building: 'Building',
  uploading: 'Uploading',
  uploaded: 'Uploaded',
  preparing: 'Preparing deploy',
  prepared: 'Prepared',
  processing: 'Processing deploy',
  processed: 'Processed',
  ready: 'Live',
  retrying: 'Retrying',
  error: 'Failed',
  canceled: 'Canceled',
  skipped: 'Skipped'
}

const deployStateProgress: Record<string, number> = {
  new: 5,
  pending_review: 5,
  accepted: 8,
  enqueued: 12,
  retrying: 15,
  building: 35,
  uploading: 75,
  uploaded: 82,
  preparing: 88,
  prepared: 90,
  processing: 92,
  processed: 96,
  ready: 100,
  rejected: 100,
  error: 100,
  canceled: 100,
  skipped: 100
}

const isDeployActive = (deploy: NormalizedNetlifyDeploy) =>
  !['ready', 'error', 'canceled', 'skipped', 'rejected'].includes(deploy.state)

const productionBranch = 'main'

const isProductionDeploy = (deploy: NormalizedNetlifyDeploy) =>
  deploy.branch === productionBranch

const getNetlifySiteId = () => process.env.NETLIFY_SITE_ID || ''
const getNetlifyAuthToken = () => process.env.NETLIFY_AUTH_TOKEN || ''
const getNetlifyBuildHookUrl = () => process.env.NETLIFY_BUILD_HOOK_URL || ''

const requireEditorMode = () => {
  const config = useRuntimeConfig()

  if (!config.public.storyblokEditorMode) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Netlify admin tools are not available.'
    })
  }
}

const normalizeDeploy = (deploy: RawNetlifyDeploy): NormalizedNetlifyDeploy => {
  const state = deploy.state || 'new'

  return {
    id: deploy.id || '',
    state,
    label: deployStateLabels[state] || state,
    progress: deployStateProgress[state] ?? 20,
    branch: deploy.branch,
    context: deploy.context,
    url: deploy.ssl_url || deploy.url || deploy.deploy_ssl_url || deploy.deploy_url,
    commitRef: deploy.commit_ref,
    commitMessage: deploy.commit_message,
    deployTime: deploy.deploy_time,
    createdAt: deploy.created_at,
    updatedAt: deploy.updated_at,
    publishedAt: deploy.published_at,
    errorMessage: deploy.error_message
  }
}

const netlifyApiFetch = async <T>(path: string) => {
  const authToken = getNetlifyAuthToken()

  if (!authToken) {
    throw createError({
      statusCode: 501,
      statusMessage: 'Netlify API token is not configured.'
    })
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      Accept: 'application/json'
    }
  })

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: 'Netlify API request failed.'
    })
  }

  return await response.json() as T
}

export const getNetlifyDeploySummary = async (limit = 8) => {
  requireEditorMode()

  const siteId = getNetlifySiteId()
  const hasBuildHook = Boolean(getNetlifyBuildHookUrl())
  const hasAuthToken = Boolean(getNetlifyAuthToken())

  if (!siteId || !hasAuthToken) {
    return {
      configured: Boolean(siteId || hasBuildHook),
      siteId: siteId || undefined,
      hasBuildHook,
      hasAuthToken,
      deploys: [] as NormalizedNetlifyDeploy[],
      activeDeploy: null,
      stats: null
    }
  }

  const deploys = (
    await netlifyApiFetch<RawNetlifyDeploy[]>(
      `/sites/${encodeURIComponent(siteId)}/deploys?per_page=${Math.max(limit * 3, 24)}`
    )
  )
    .map(normalizeDeploy)
    .filter((deploy) => deploy.id)
    .filter(isProductionDeploy)
    .slice(0, limit)

  const successfulDeploys = deploys.filter((deploy) => deploy.state === 'ready')
  const failedDeploys = deploys.filter((deploy) =>
    ['error', 'canceled', 'skipped', 'rejected'].includes(deploy.state)
  )
  const deployTimes = deploys
    .map((deploy) => deploy.deployTime)
    .filter((value): value is number => typeof value === 'number' && value > 0)

  return {
    configured: true,
    siteId,
    hasBuildHook,
    hasAuthToken,
    deploys,
    activeDeploy: deploys.find(isDeployActive) || null,
    stats: {
      recentCount: deploys.length,
      successfulCount: successfulDeploys.length,
      failedCount: failedDeploys.length,
      averageDeploySeconds: deployTimes.length
        ? Math.round(
            deployTimes.reduce((total, deployTime) => total + deployTime, 0) /
              deployTimes.length
          )
        : null,
      latestPublishedAt: successfulDeploys[0]?.publishedAt || null
    }
  }
}

export const triggerNetlifyBuild = async (title?: string) => {
  requireEditorMode()

  const buildHookUrl = getNetlifyBuildHookUrl()

  if (!buildHookUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Netlify build hook is not configured.'
    })
  }

  const url = new URL(buildHookUrl)
  url.searchParams.set('trigger_title', title || 'Triggered from Storyblok admin')

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      source: 'boring-thing-admin',
      triggeredAt: new Date().toISOString()
    })
  })

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: 'Netlify build hook could not be triggered.'
    })
  }

  return {
    ok: true,
    triggeredAt: new Date().toISOString(),
    summary: await getNetlifyDeploySummary(8).catch(() => null)
  }
}
