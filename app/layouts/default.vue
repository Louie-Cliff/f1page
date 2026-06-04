<script setup lang="ts">
import SiteFooter from '~/components/site/SiteFooter.vue'
import SiteHeader from '~/components/site/SiteHeader.vue'
import CookieConsent from '~/components/site/CookieConsent.vue'
import SiteModalHost from '~/components/site/SiteModalHost.vue'

const config = useRuntimeConfig()
const { data: siteSettings } = await useSiteSettings()
const settings = computed(() => {
  if (!siteSettings.value) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Storyblok site settings are required for the site shell.'
    })
  }

  return siteSettings.value
})
const showCookieConsent = computed(() => !config.public.storyblokEditorMode)

useHead(() => ({
  link: settings.value.icon?.src
    ? [
        {
          rel: 'icon',
          href: settings.value.icon.src
        }
      ]
    : []
}))
</script>

<template>
  <div class="min-h-screen bg-house-surface text-house-text">
    <a
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-loading focus:rounded-md focus:bg-house-surface focus:px-4 focus:py-3 focus:text-house-text"
      href="#main-content"
    >
      Skip to content
    </a>
    <SiteHeader :settings="settings" />
    <main id="main-content">
      <slot />
    </main>
    <SiteFooter :settings="settings" />
    <CookieConsent v-if="showCookieConsent" :settings="settings" />
    <SiteModalHost />
  </div>
</template>
