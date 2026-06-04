<script setup lang="ts">
import CookieConsent from '~/components/site/CookieConsent.vue'
import SiteFooter from '~/components/site/SiteFooter.vue'
import SiteHeader from '~/components/site/SiteHeader.vue'
import RichTextRenderer from '~/components/ui/RichTextRenderer.vue'
import type { NormalizedSiteSettings } from '~/types/content'
import type { StoryblokStory } from '~/types/storyblok'
import { normalizeStoryblokSiteSettings } from '~/utils/content/storyblok-mappers'

definePageMeta({
  layout: 'admin'
})

const config = useRuntimeConfig()

if (!config.public.storyblokEditorMode) {
  throw createError({
    statusCode: 404,
    statusMessage: 'The requested page does not exist.'
  })
}

const { data } = await useSiteSettings()
const settings = shallowRef<NormalizedSiteSettings | null>(data.value || null)

useSeoMeta({
  title: 'Site Settings Preview',
  description: 'Storyblok editor preview for global site settings.',
  robots: 'noindex,nofollow'
})

const normalizePreviewSettings = (story: Partial<StoryblokStory>) => {
  if (!story.content) {
    return null
  }

  return normalizeStoryblokSiteSettings(
    {
      id: Number(story.id || 0),
      uuid: String(story.uuid || ''),
      name: story.name || settings.value?.name || 'Site Settings',
      slug: story.slug || 'admin',
      full_slug: story.full_slug || 'admin',
      content: story.content,
      created_at: story.created_at,
      published_at: story.published_at,
      first_published_at: story.first_published_at
    },
    {
      homeSlug: config.public.storyblokHomeSlug
    }
  )
}

if (import.meta.client) {
  const updateSettings = (
    event: WindowEventMap['boring-thing:storyblok-input']
  ) => {
    const story = (event.detail as { story?: Partial<StoryblokStory> })?.story
    const nextSettings = story ? normalizePreviewSettings(story) : null

    if (nextSettings) {
      settings.value = nextSettings
    }
  }

  onMounted(() => {
    window.addEventListener('boring-thing:storyblok-input', updateSettings)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('boring-thing:storyblok-input', updateSettings)
  })
}
</script>

<template>
  <main class="mx-auto grid max-w-6xl gap-10 px-4 py-8">
    <header>
      <p class="text-xs font-bold uppercase text-house-text-muted">
        Storyblok admin preview
      </p>
      <h1 class="mt-2 text-3xl font-black text-house-text">
        Site settings
      </h1>
    </header>

    <section
      v-if="settings"
      class="grid gap-4 border border-house-border bg-house-surface p-4"
      aria-labelledby="settings-preview-heading"
    >
      <h2 id="settings-preview-heading" class="text-lg font-bold text-house-text">
        Site shell preview
      </h2>
      <div class="overflow-hidden border border-house-border">
        <SiteHeader :settings="settings" />
        <div class="p-6">
          <p class="max-w-2xl text-sm leading-6 text-house-text-muted">
            This blank admin template previews global content without rendering a real
            public page. Header, footer, and cookie copy are using the same site
            components as the public layout.
          </p>
        </div>
        <SiteFooter :settings="settings" />
      </div>
      <div class="relative min-h-72 overflow-hidden border border-house-border bg-house-surface">
        <CookieConsent :settings="settings" preview />
      </div>
    </section>

    <section
      v-if="settings?.preview.nodes.length"
      class="grid gap-4 border border-house-border bg-house-surface p-4"
      aria-labelledby="settings-rich-text-heading"
    >
      <h2 id="settings-rich-text-heading" class="text-lg font-bold text-house-text">
        Rich text preview
      </h2>
      <RichTextRenderer :rich-text="settings.preview" />
    </section>

    <section
      v-if="settings?.error.nodes.length"
      class="grid gap-4 border border-house-border bg-house-surface p-4"
      aria-labelledby="settings-error-heading"
    >
      <h2 id="settings-error-heading" class="text-lg font-bold text-house-text">
        Error page preview
      </h2>
      <RichTextRenderer :rich-text="settings.error" />
    </section>
  </main>
</template>
