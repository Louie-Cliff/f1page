<script setup lang="ts">
import OptimizedImage from '~/components/ui/OptimizedImage.vue'
import SmartLink from '~/components/ui/SmartLink.vue'
import type {
  NormalizedNavigationItem,
  NormalizedSiteSettings
} from '~/types/content'
import { getLinkType } from '~/utils/links'
import MaterialIcon from '../ui/MaterialIcon.vue';

const props = defineProps<{
  settings: NormalizedSiteSettings
}>()

const route = useRoute()
const bodyScrollLock = useBodyScrollLock()
const siteName = computed(() => props.settings.siteName)
const navItems = computed(() => props.settings.navigation)

const menuOpen = ref(false)
const menuButton = ref<HTMLButtonElement | null>(null)
const mobileMenu = ref<HTMLElement | null>(null)
const previousActiveElement = shallowRef<HTMLElement | null>(null)

const getFocusableMenuElements = () => {
  if (!mobileMenu.value) {
    return []
  }

  return Array.from(
    mobileMenu.value.querySelectorAll<HTMLElement>(
      [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
      ].join(',')
    )
  ).filter((element) => !element.hasAttribute('disabled'))
}

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const closeMenu = () => {
  menuOpen.value = false
}

const normalizeNavigationPath = (href: string) => {
  const withoutOrigin = href.replace(/^https?:\/\/[^/]+/i, '')
  const [pathWithQuery] = withoutOrigin.split('#')
  const [path = ''] = (pathWithQuery || '').split('?')

  return `/${path.replace(/^\/+|\/+$/g, '')}`.replace(/^\/$/, '/')
}

const isCurrentPageLink = (item: NormalizedNavigationItem) =>
  normalizeNavigationPath(item.href) === normalizeNavigationPath(route.path)

const closeMenuForLink = (item: NormalizedNavigationItem) => {
  const linkType = getLinkType({ href: item.href })

  if (linkType !== 'internal' || item.target === '_blank' || isCurrentPageLink(item)) {
    closeMenu()
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!menuOpen.value) {
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    closeMenu()
    return
  }

  if (event.key !== 'Tab') {
    return
  }

  const focusableElements = getFocusableMenuElements()

  if (!focusableElements.length) {
    event.preventDefault()
    mobileMenu.value?.focus()
    return
  }

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (!firstElement || !lastElement) {
    return
  }

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
    return
  }

  if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}

watch(() => route.fullPath, closeMenu)

watch(menuOpen, async (nextMenuOpen) => {
  if (!import.meta.client) {
    return
  }

  if (nextMenuOpen) {
    previousActiveElement.value = document.activeElement as HTMLElement | null
    bodyScrollLock.lock()
    await nextTick()
    const firstFocusableElement = getFocusableMenuElements()[0]

    ;(firstFocusableElement || mobileMenu.value)?.focus()
    return
  }

  bodyScrollLock.unlock()
  await nextTick()
  ;(previousActiveElement.value || menuButton.value)?.focus()
  previousActiveElement.value = null
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  bodyScrollLock.unlock()
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <header class="flex flex-row items-center justify-between border-b p-6 other-theme-gold bg-gold">
    <SmartLink href="/">
      <OptimizedImage
        v-if="settings.logo"
        class="max-h-12 w-auto"
        :image="settings.logo"
        :alt="settings.logo.alt || siteName"
        sizes="200px"
        :widths="[120, 180, 240, 320]"
      />
      <span v-else>{{ siteName }}</span>
    </SmartLink>

    <nav
      aria-label="Main navigation"
      class="flex flex-row"
    >
      <!-- Desktop nav -->
      <ul class="m-0 hidden list-none flex-row gap-6 p-0 md:flex">
        <li v-for="item in navItems" :key="item.id">
          <SmartLink
            class="other-main-navigation"
            :href="item.href"
            :target="item.target"
            :label="item.label"
          >
            {{ item.label }}
          </SmartLink>
        </li>
      </ul>

      <!-- Mobile drawer -->
      <aside
        id="mobile-menu"
        ref="mobileMenu"
        class="fixed inset-0 z-menu h-screen w-screen transition-opacity ease-out md:hidden"
        :class="menuOpen ? 'pointer-events-auto opacity-100 duration-0 delay-0' : 'pointer-events-none opacity-0 duration-0 delay-1000'"
        :aria-hidden="menuOpen ? undefined : 'true'"
        :inert="!menuOpen"
        tabindex="-1"
        @click.self="closeMenu"
      >
        <ul
          class="m-0 flex h-full list-none flex-col items-center justify-center bg-fuchsia p-6 gap-6 text-white transition-transform ease-out will-change-transform"
          :class="menuOpen ? 'translate-x-0 duration-1000' : 'translate-x-full duration-500'"
        >
          <li v-for="item in navItems" :key="item.id">
            <SmartLink
              class="other-mobile-navigation"
              :href="item.href"
              :target="item.target"
              :label="item.label"
              @click="closeMenuForLink(item)"
              
            >
              {{ item.label }}
            </SmartLink>
          </li>
        </ul>
      </aside>

      <!-- Mobile button -->
      <button
        ref="menuButton"
        type="button"
        class="relative z-menu md:hidden"
        aria-controls="mobile-menu"
        :aria-expanded="menuOpen ? 'true' : 'false'"
        @click="toggleMenu"
      >
        <span class="sr-only">
          {{ menuOpen ? 'Close main menu' : 'Open main menu' }}
        </span>

        <MaterialIcon :name="menuOpen ? 'close' : 'menu'" />

      </button>

    </nav>

  </header>
</template>
