<script setup lang="ts">
import ArticleTemplate from '~/components/templates/ArticleTemplate.vue'
import GameTemplate from '~/components/templates/GameTemplate.vue'
import PageTemplate from '~/components/templates/PageTemplate.vue'
import type { StoryblokStory } from '~/types/storyblok'
import { getPagePath } from '~/utils/content/content-source'
import { resolvePage } from '~/utils/content/resolve-page'
import { normalizeStoryblokStory } from '~/utils/content/storyblok-mappers'
import { MODAL_QUERY_PARAM, normalizeModalPath } from '~/utils/modal'

definePageMeta({
  key: (route) => route.path
})

const route = useRoute()
const config = useRuntimeConfig()
const { data: siteSettings } = await useSiteSettings()

const resolvedPage = await resolvePage(route.params.slug, {
  siteUrl: config.public.canonicalSiteUrl,
  siteSettings: siteSettings.value || undefined
})

if (!resolvedPage) {
  throw createError({
    statusCode: 404,
    statusMessage: 'The requested page does not exist in Storyblok.',
    fatal: true
  })
}

const page = shallowRef(resolvedPage.page)
const { seo } = resolvedPage

if (page.value.type === 'modal') {
  const modalPath = normalizeModalPath(getPagePath(page.value))

  await navigateTo({
    path: '/',
    query: {
      ...route.query,
      [MODAL_QUERY_PARAM]: modalPath
    }
  })
}

useSeoMeta(seo.meta)
useHead(seo.head)

if (import.meta.client && config.public.storyblokEditorMode) {
  const normalizePreviewStory = (story: Partial<StoryblokStory>) => {
    if (!story.content) {
      return null
    }

    return normalizeStoryblokStory(
      {
        id: Number(story.id || 0),
        uuid: String(story.uuid || ''),
        name: story.name || page.value.name,
        slug: story.slug || page.value.slug || config.public.storyblokHomeSlug,
        full_slug:
          story.full_slug || page.value.slug || config.public.storyblokHomeSlug,
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

  const updateStory = (event: WindowEventMap['boring-thing:storyblok-input']) => {
    const story = (event.detail as { story?: Partial<StoryblokStory> })?.story
    const nextPage = story ? normalizePreviewStory(story) : null

    if (nextPage) {
      page.value = nextPage
    }
  }

  onMounted(() => {
    window.addEventListener('boring-thing:storyblok-input', updateStory)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('boring-thing:storyblok-input', updateStory)
  })
}
</script>

<template>
  <PageTemplate v-if="page.type === 'page'" :page="page" />
  <ArticleTemplate v-else-if="page.type === 'article'" :page="page" />
  <GameTemplate v-else-if="page.type === 'game'" :page="page" />
</template>
