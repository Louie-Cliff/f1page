<script setup lang="ts">
import RichTextRenderer from '~/components/ui/RichTextRenderer.vue'
import type { LeaderboardSection } from '~/types/content'
import { getThemeClasses } from '~/utils/theme'

defineProps<{
  section: LeaderboardSection
}>()
</script>

<template>
  <section class="other-section" :class="getThemeClasses(section.theme)">
    <div class="container flex flex-col items-center gap-6 other-container">
      <RichTextRenderer v-if="section.copy.nodes.length" :rich-text="section.copy" />
    </div>
    <pre
      v-if="section.csv"
      class="mt-8 overflow-auto border border-house-border bg-house-surface p-5 text-sm leading-6 text-house-text"
    >{{ section.csv }}</pre>
  </section>
</template>
