<script setup lang="ts">
import { MODAL_QUERY_PARAM } from '~/utils/modal'

const config = useRuntimeConfig()
const nuxtApp = useNuxtApp()
const router = useRouter()
const routeError = useError()

type OverlayMode = 'loader' | 'transition'
const ignoredQueryTransitionKeys = new Set([MODAL_QUERY_PARAM, 'p', 'newsPage'])

const visible = ref(true)
const overlayMode = ref<OverlayMode>('loader')
const isMounted = ref(false)
const transitionEnabled = ref(false)
let hideTimer: number | undefined
let shownAt = Date.now()
const transitionInMs = 320
let removeBeforeEach: (() => void) | undefined
let removeAfterEach: (() => void) | undefined
let removeOnError: (() => void) | undefined
let removePageFinishHook: (() => void) | undefined
let removeAppErrorHook: (() => void) | undefined
let removeErrorWatch: (() => void) | undefined

const wait = (duration: number) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, duration)
  })

const waitForPaint = async () => {
  await nextTick()
  await new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(resolve)
    })
  })
}

const clearHideTimer = () => {
  if (hideTimer) {
    window.clearTimeout(hideTimer)
    hideTimer = undefined
  }
}

const getMinVisibleMs = (mode: OverlayMode) =>
  Number(
    mode === 'loader'
      ? config.public.pageLoaderMinMs || 0
      : config.public.pageTransitionMinMs || 0
  )

const showOverlay = (mode: OverlayMode) => {
  clearHideTimer()
  overlayMode.value = mode
  shownAt = Date.now()
  visible.value = true
}

const hideOverlay = (delay = 180, mode = overlayMode.value) => {
  clearHideTimer()
  const minVisibleMs = getMinVisibleMs(mode)
  const visibleForMs = Date.now() - shownAt
  const remainingMinMs = Math.max(minVisibleMs - visibleForMs, 0)
  const hideDelay = Math.max(delay, remainingMinMs)

  hideTimer = window.setTimeout(() => {
    visible.value = false
  }, hideDelay)
}

const forceHideOverlay = () => {
  clearHideTimer()
  visible.value = false
}

const comparableQuery = (query: Record<string, unknown>) =>
  JSON.stringify(
    Object.entries(query)
      .filter(([key]) => !ignoredQueryTransitionKeys.has(key))
      .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
  )

const changedQueryKeys = (
  toQuery: Record<string, unknown>,
  fromQuery: Record<string, unknown>
) => {
  const keys = new Set([...Object.keys(toQuery), ...Object.keys(fromQuery)])

  return [...keys].filter((key) => JSON.stringify(toQuery[key]) !== JSON.stringify(fromQuery[key]))
}

const isIgnoredQueryOnlyNavigation = (
  to: { path: string; hash: string; query: Record<string, unknown> },
  from: { path: string; hash: string; query: Record<string, unknown> }
) => {
  if (
    to.path !== from.path ||
    to.hash !== from.hash ||
    comparableQuery(to.query) !== comparableQuery(from.query)
  ) {
    return false
  }

  const changedKeys = changedQueryKeys(to.query, from.query)

  return changedKeys.length > 0 && changedKeys.every((key) => ignoredQueryTransitionKeys.has(key))
}

onMounted(() => {
  isMounted.value = true
  overlayMode.value = 'loader'
  shownAt = Date.now()

  requestAnimationFrame(() => {
    transitionEnabled.value = true
    if (routeError.value) {
      forceHideOverlay()
      return
    }
    hideOverlay(220, 'loader')
  })

  removeBeforeEach = router.beforeEach(async (to, from) => {
    if (!from.name || to.fullPath === from.fullPath || isIgnoredQueryOnlyNavigation(to, from)) {
      return
    }

    showOverlay('transition')
    await wait(transitionInMs)
  })

  removeAfterEach = router.afterEach((_to, _from, failure) => {
    if (failure) {
      forceHideOverlay()
    }
  })

  removePageFinishHook = nuxtApp.hook('page:finish', async () => {
    if (overlayMode.value !== 'transition') {
      return
    }

    await waitForPaint()
    hideOverlay(180, 'transition')
  })

  removeOnError = router.onError(() => {
    requestAnimationFrame(() => {
      forceHideOverlay()
    })
  })

  removeAppErrorHook = nuxtApp.hook('app:error', () => {
    forceHideOverlay()
  })

  removeErrorWatch = watch(routeError, (nextError) => {
    if (nextError) {
      forceHideOverlay()
    }
  })
})

onBeforeUnmount(() => {
  clearHideTimer()
  removeBeforeEach?.()
  removeAfterEach?.()
  removeOnError?.()
  removePageFinishHook?.()
  removeAppErrorHook?.()
  removeErrorWatch?.()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="page-loader-fade" :css="transitionEnabled">
      <div
        v-if="visible"
        aria-hidden="true"
        :class="[
          'page-transition-overlay',
          'page-transition-overlay--fade',
          `page-transition-overlay--${overlayMode}`
        ]"
      >
        <p v-if="isMounted" class="page-transition-overlay__label">{{ overlayMode==="transition" ? "Transitioning" : "Initialising" }}</p>
      </div>
    </Transition>
  </Teleport>
</template>
