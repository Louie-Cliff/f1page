<script setup lang="ts">
import type { NuxtError } from '#app'
import RichTextRenderer from '~/components/ui/RichTextRenderer.vue'

defineProps<{
  error: NuxtError
}>()

const { data: siteSettings } = await useSiteSettings()

const hasCmsErrorContent = computed(() =>
  Boolean(siteSettings.value?.error.nodes.length)
)
</script>

<template>
  <NuxtLayout>
    <section class="py-24 other-section">
      <div class="container flex flex-col items-center justify-center gap-6 other-container">
        <RichTextRenderer
          v-if="hasCmsErrorContent && siteSettings"
          class="w-full"
          :rich-text="siteSettings.error"
        />
        <template v-else>
          <h1>
            {{ error.statusCode === 404 ? 'Page not found' : 'Something went wrong' }}
          </h1>
          <p>
            {{ error.statusMessage || 'The requested page could not be loaded.' }}
          </p>
        </template>
      </div>
    </section>
  </NuxtLayout>
</template>
