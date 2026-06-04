declare global {
  interface Window {
    StoryblokBridge?: new (options?: Record<string, unknown>) => {
      on: (
        events: string | string[],
        callback: (payload?: unknown) => void
      ) => void
    }
  }

  interface WindowEventMap {
    'boring-thing:storyblok-input': CustomEvent<unknown>
  }
}

const bridgeScriptId = 'boring-thing-storyblok-bridge'
const bridgeScriptSrc = 'https://app.storyblok.com/f/storyblok-v2-latest.js'

const hasStoryblokPreviewParams = (query: Record<string, unknown>) =>
  Object.keys(query).some((key) => key.startsWith('_storyblok'))

const isIframe = () => {
  try {
    return window.self !== window.top
  } catch {
    return true
  }
}

const loadBridgeScript = () =>
  new Promise<void>((resolve, reject) => {
    if (window.StoryblokBridge) {
      resolve()
      return
    }

    const existingScript = document.getElementById(bridgeScriptId)

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener('error', reject, { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = bridgeScriptId
    script.async = true
    script.src = bridgeScriptSrc
    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener('error', reject, { once: true })

    document.head.appendChild(script)
  })

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()

  if (!config.public.storyblokEditorMode) {
    return
  }

  const route = useRoute()
  const shouldLoadBridge =
    hasStoryblokPreviewParams(route.query) || isIframe()

  if (!shouldLoadBridge) {
    return
  }

  try {
    await loadBridgeScript()
    const Bridge = window.StoryblokBridge

    if (!Bridge) {
      return
    }

    const bridge = new Bridge({
      preventClicks: true
    })

    bridge.on('input', (payload) => {
      window.dispatchEvent(
        new CustomEvent('boring-thing:storyblok-input', {
          detail: payload
        })
      )
    })

    bridge.on(['change', 'published'], () => {
      window.location.reload()
    })
  } catch (error) {
    console.warn('Storyblok editor bridge could not be loaded.', error)
  }
})
