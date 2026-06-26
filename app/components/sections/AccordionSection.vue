<script setup lang="ts">
import RichTextRenderer from '~/components/ui/RichTextRenderer.vue'
import type { AccordionSection } from '~/types/content'
import { getThemeClasses } from '~/utils/theme'

const props = defineProps<{
  section: AccordionSection
}>()
</script>

<template>
  <section class="other-section other-accordion-section" :class="getThemeClasses(section.theme)">
    <div class="container flex flex-col items-center justify-center gap-8 other-container md:gap-10">
      <RichTextRenderer
        v-if="section.copy.nodes.length"
        :rich-text="section.copy"
        class="max-w-3xl text-center"
      />
      <div v-if="section.cards.length" class="other-accordion-list grid w-full gap-4 md:gap-5">
        <details
          v-for="(card, index) in section.cards"
          :key="card.id"
          class="other-accordion-item other-item"
          :open="index === 0"
        >
          <summary class="other-accordion-summary cursor-pointer">
            <h3 class="other-accordion-title">
              {{ card.title || card.name }}
            </h3>
            <span class="other-accordion-icon" aria-hidden="true">
              <span class="bar bar-horizontal" />
              <span class="bar bar-vertical" />
            </span>
          </summary>
          <RichTextRenderer
            v-if="card.copy?.nodes.length"
            class="other-accordion-copy px-5 pb-5 md:px-6 md:pb-6"
            :rich-text="card.copy"
          />
        </details>
      </div>
    </div>
  </section>
</template>
