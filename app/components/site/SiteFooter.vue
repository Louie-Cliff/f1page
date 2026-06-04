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
  <footer class="border-t border-white/10 bg-[#040406] text-house-white">
    <div class="section-shell flex flex-col gap-6 py-10 text-sm md:flex-row md:items-start md:justify-between">
      <div class="flex flex-col gap-3">
        <p class="eyebrow">F1 Clash Style Build</p>
        <p class="font-display text-4xl uppercase tracking-[0.08em]">{{ siteName }}</p>
      </div>
      <RichTextRenderer
        v-if="hasLegal"
        class="max-w-3xl text-house-white/70 [&_.other-richtext]:max-w-none [&_.other-richtext]:text-base [&_.other-richtext_a]:text-white [&_.other-richtext_h1]:text-white [&_.other-richtext_h2]:text-white [&_.other-richtext_h3]:text-white [&_.other-richtext_h4]:text-white"
        :rich-text="settings.legal"
      />
    </div>
  </footer>
</template>
