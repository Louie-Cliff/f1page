<script setup lang="ts">
import RichTextRenderer from '~/components/ui/RichTextRenderer.vue'
import type { AccordionSection } from '~/types/content'
import { getThemeClasses } from '~/utils/theme'

defineProps<{
  section: AccordionSection
}>()
</script>

<template>
  <section class="other-section" :class="getThemeClasses(section.theme)">
    <div class="container flex flex-col items-center justify-center gap-6 other-container">
      <RichTextRenderer v-if="section.copy.nodes.length" :rich-text="section.copy" class="w-2/3 text-center"  />
      <div v-if="section.cards.length" class="grid gap-6 w-full">
        <details
          v-for="card in section.cards"
          :key="card.id"
          class="border p-0 other-item"
        >
          <summary class="cursor-pointer p-3">
            <h3>{{ card.title || card.name }}</h3>
          </summary>
          <RichTextRenderer
            v-if="card.copy?.nodes.length"
            class="px-3 my-3"
            :rich-text="card.copy"
          />
        </details>
      </div>
    </div>
  </section>
</template>
