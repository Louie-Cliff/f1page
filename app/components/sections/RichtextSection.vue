<script setup lang="ts">
import RichTextRenderer from '~/components/ui/RichTextRenderer.vue'
import type { RichtextSection } from '~/types/content'
import { getThemeClasses } from '~/utils/theme'

defineProps<{
  section: RichtextSection
}>()
</script>

<template>
  <section class="other-section" :class="`other-theme-${section.theme}`">
    <div class="container other-container">
      <RichTextRenderer
        v-if="section.copy.nodes.length"
          class="w-full"
        :rich-text="section.copy"
      />
    </div>
  </section>
</template>
