<script setup lang="ts">
import TestimonialCard from '~/components/cards/TestimonialCard.vue'
import BaseCarousel from '~/components/ui/BaseCarousel.vue'
import RichTextRenderer from '~/components/ui/RichTextRenderer.vue'
import type { TestimonialsSection } from '~/types/content'
import { getThemeClasses } from '~/utils/theme'


defineProps<{
  section: TestimonialsSection
}>()
</script>

<template>
  <section class="other-section" :class="`other-theme-${section.theme}`">
    <div class="container flex flex-col items-center justify-center gap-6 other-container">
      <RichTextRenderer v-if="section.copy.nodes.length" :rich-text="section.copy" class="w-2/3 text-center" />

      <div class="w-full">
        <BaseCarousel
          :items="section.cards"
          aria-label="Testimonials"
          autoplay
          :autoplay-delay="5000"
          indicators="dots"
          loop
          show-controls
          :slides-to-scroll="1"
        >
          <template #default="{ item }">
            <TestimonialCard :card="item" />
          </template>
        </BaseCarousel>
      </div>
    </div>
  </section>
</template>
