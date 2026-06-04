export type ExternalVideoProvider = 'youtube' | 'vimeo'

export type ExternalVideoConfig = {
  provider: ExternalVideoProvider
  id: string
  hash?: string
}

const getUrl = (value: string) => {
  try {
    return new URL(value)
  } catch {
    return null
  }
}

const getYouTubeId = (url: URL) => {
  if (url.hostname === 'youtu.be') {
    return url.pathname.split('/').filter(Boolean)[0]
  }

  if (!url.hostname.includes('youtube.com')) {
    return ''
  }

  if (url.pathname.startsWith('/embed/')) {
    return url.pathname.split('/').filter(Boolean)[1]
  }

  if (url.pathname.startsWith('/shorts/')) {
    return url.pathname.split('/').filter(Boolean)[1]
  }

  return url.searchParams.get('v') || ''
}

const getVimeoConfig = (url: URL): ExternalVideoConfig | null => {
  if (!url.hostname.includes('vimeo.com')) {
    return null
  }

  const parts = url.pathname.split('/').filter(Boolean)
  const videoIndex = parts[0] === 'video' ? 1 : 0
  const id = parts[videoIndex] || ''

  if (!/^\d+$/.test(id)) {
    return null
  }

  const pathHash = parts[videoIndex + 1]
  const hash =
    url.searchParams.get('h') ||
    (pathHash && !pathHash.includes('.') ? pathHash : '')

  return {
    provider: 'vimeo',
    id,
    hash: hash || undefined
  }
}

export const getExternalVideoConfig = (
  value?: string
): ExternalVideoConfig | null => {
  if (!value) {
    return null
  }

  const url = getUrl(value)

  if (!url) {
    return null
  }

  const youTubeId = getYouTubeId(url)

  if (youTubeId) {
    return {
      provider: 'youtube',
      id: youTubeId
    }
  }

  return getVimeoConfig(url)
}

export const getExternalVideoEmbedUrl = (
  config: ExternalVideoConfig,
  options: {
    autoplay?: boolean
    controls?: boolean
    loop?: boolean
    muted?: boolean
    background?: boolean
  }
) => {
  const params = new URLSearchParams()

  if (config.provider === 'youtube') {
    params.set('enablejsapi', '1')
    params.set('playsinline', '1')
    params.set('rel', '0')
    params.set('modestbranding', '1')
    params.set('autoplay', options.autoplay ? '1' : '0')
    params.set('mute', options.muted ? '1' : '0')
    params.set('controls', options.controls ? '1' : '0')

    if (options.loop) {
      params.set('loop', '1')
      params.set('playlist', config.id)
    }

    return `https://www.youtube-nocookie.com/embed/${config.id}?${params.toString()}`
  }

  params.set('api', '1')
  params.set('dnt', '1')
  params.set('playsinline', '1')
  params.set('autoplay', options.autoplay ? '1' : '0')
  params.set('muted', options.muted ? '1' : '0')
  params.set('loop', options.loop ? '1' : '0')
  params.set('controls', options.controls ? '1' : '0')

  if (options.background) {
    params.set('background', '1')
  }

  if (config.hash) {
    params.set('h', config.hash)
  }

  return `https://player.vimeo.com/video/${config.id}?${params.toString()}`
}
