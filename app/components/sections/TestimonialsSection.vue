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
  <section class="other-section other-testimonials-section" :class="getThemeClasses(section.theme)">
    <div class="container flex flex-col items-center justify-center gap-8 other-container">
      <RichTextRenderer v-if="section.copy.nodes.length" :rich-text="section.copy" class="max-w-3xl text-center" />

      <div class="mt-4 w-full md:mt-6">
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
