<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import type { LinkType } from '~/types/content'
import {
  getLinkType,
  getSafeRel,
  getSafeTarget
} from '~/utils/links'

defineOptions({
  inheritAttrs: false
})

const attrs = useAttrs()
const route = useRoute()
const props = defineProps<{
  href?: string
  to?: RouteLocationRaw
  target?: '_blank' | '_self'
  type?: LinkType
  action?: () => void
  ariaLabel?: string
  label?: string
  disableActiveClass?: boolean
}>()

const rawHref = computed(() =>
  props.href || (typeof props.to === 'string' ? props.to : '')
)
const linkType = computed(() =>
  props.to && typeof props.to !== 'string' && !props.href
    ? props.type || 'internal'
    : getLinkType({
        href: rawHref.value,
        type: props.type,
        onClick: props.action
      })
)
const target = computed(() => getSafeTarget(rawHref.value, props.target, linkType.value))
const rel = computed(() => getSafeRel(target.value))
const isAction = computed(() => linkType.value === 'action')
const isRouterLink = computed(() =>
  Boolean(props.to) || ['internal', 'hash', 'modal'].includes(linkType.value)
)
const routerTo = computed(() => {
  if (props.to && typeof props.to !== 'string') {
    return props.to
  }

  if (linkType.value === 'hash') {
    return rawHref.value
  }

  const [pathAndQuery, hash] = rawHref.value.split('#')
  const [path = '', query] = (pathAndQuery || '').split('?')
  const normalizedPath = `/${path.replace(/^\/+|\/+$/g, '')}`.replace(/^\/$/, '/')

  return [
    normalizedPath,
    query ? `?${query}` : '',
    hash ? `#${hash}` : ''
  ].join('')
})
const normalizePath = (path: string) =>
  `/${path.replace(/^\/+|\/+$/g, '')}`.replace(/^\/$/, '/')
const activeTargetPath = computed(() => {
  if (!isRouterLink.value || linkType.value === 'hash') {
    return null
  }

  if (props.to && typeof props.to !== 'string') {
    const path = 'path' in props.to && typeof props.to.path === 'string'
      ? props.to.path
      : null

    return path ? normalizePath(path) : null
  }

  const [pathAndQuery] = rawHref.value.split('#')
  const [path = ''] = (pathAndQuery || '').split('?')

  return normalizePath(path)
})
const routePath = computed(() => normalizePath(route.path))
const isExactRouteActive = computed(() =>
  Boolean(activeTargetPath.value && routePath.value === activeTargetPath.value)
)
const isRouteActive = computed(() => {
  if (!activeTargetPath.value) {
    return false
  }

  if (activeTargetPath.value === '/') {
    return routePath.value === '/'
  }

  return (
    routePath.value === activeTargetPath.value ||
    routePath.value.startsWith(`${activeTargetPath.value}/`)
  )
})
const routerActiveClasses = computed(() => {
  if (props.disableActiveClass) {
    return undefined
  }

  if (!isRouteActive.value) {
    return undefined
  }

  const activeClass =
    typeof attrs['active-class'] === 'string'
      ? attrs['active-class']
      : 'is-active'
  const exactActiveClass =
    typeof attrs['exact-active-class'] === 'string'
      ? attrs['exact-active-class']
      : 'is-exact-active'

  return [
    activeClass,
    isExactRouteActive.value ? exactActiveClass : undefined
  ].filter(Boolean)
})
const isDownload = computed(() => linkType.value === 'asset')
const modalNavigation = useModalNavigation()
const passthroughAttrs = computed(() => {
  const {
    'active-class': _activeClass,
    'exact-active-class': _exactActiveClass,
    ...rest
  } = attrs

  return rest
})
const resolvedAriaLabel = computed(() => {
  if (props.ariaLabel) {
    return props.ariaLabel
  }

  if (!props.label) {
    return undefined
  }

  if (isDownload.value) {
    return `Download ${props.label} (opens in a new tab)`
  }

  return target.value === '_blank'
    ? `${props.label} (opens in a new tab)`
    : undefined
})

const handleClick = () => {
  props.action?.()
}

const handleRouterClick = async (
  event: MouseEvent,
  navigate?: (event?: MouseEvent) => Promise<unknown> | unknown
) => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    target.value === '_blank'
  ) {
    return
  }

  if (
    !['internal', 'modal'].includes(linkType.value) ||
    typeof routerTo.value !== 'string'
  ) {
    await navigate?.(event)
    return
  }

  event.preventDefault()

  const handledAsModal = await modalNavigation.openIfModal(routerTo.value)

  if (!handledAsModal) {
    await navigateTo(routerTo.value)
  }
}
</script>

<template>
  <button
    v-if="isAction"
    v-bind="passthroughAttrs"
    type="button"
    :aria-label="resolvedAriaLabel"
    @click="handleClick"
  >
    <slot />
  </button>

  <NuxtLink
    v-else-if="isRouterLink"
    :to="routerTo"
    custom
    v-slot="{ href: resolvedHref, navigate }"
  >
    <a
      v-bind="passthroughAttrs"
      :href="resolvedHref"
      :target="target"
      :rel="rel"
      :class="routerActiveClasses"
      :aria-label="resolvedAriaLabel"
      @click="handleRouterClick($event, navigate)"
    >
      <slot />
    </a>
  </NuxtLink>

  <a
    v-else
    v-bind="passthroughAttrs"
    :href="rawHref"
    :target="target"
    :rel="rel"
    :download="isDownload ? '' : undefined"
    :aria-label="resolvedAriaLabel"
  >
    <slot />
  </a>
</template>
