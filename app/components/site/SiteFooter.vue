<script setup lang="ts">
import RichTextRenderer from '~/components/ui/RichTextRenderer.vue'
import type { NormalizedSiteSettings } from '~/types/content'

const props = defineProps<{
  settings: NormalizedSiteSettings
}>()

const siteName = computed(() => props.settings.siteName)
const hasLegal = computed(() => Boolean(props.settings.legal.nodes.length))
</script>

<template>
  <footer class="border-t border-house-border bg-house-black text-house-white">
    <div class="section-shell flex flex-col gap-4 py-8 text-sm md:flex-row md:items-center md:justify-between">
      <p class="font-semibold">{{ siteName }}</p>
      <RichTextRenderer
        v-if="hasLegal"
        class="max-w-2xl text-house-white/70 [&.rich-text]:text-sm [&.rich-text]:leading-6 [&.rich-text]:text-house-white/70 [&.rich-text_a]:text-house-white [&.rich-text_h1]:text-house-white [&.rich-text_h2]:text-house-white [&.rich-text_h3]:text-house-white [&.rich-text_h4]:text-house-white"
        :rich-text="settings.legal"
      />
    </div>
  </footer>
</template>
