<script setup lang="ts">
import OptimizedImage from '~/components/ui/OptimizedImage.vue'
import type { TestimonialCard } from '~/types/content'

defineProps<{
  card: TestimonialCard
}>()
</script>

<template>
  <figure class="other-item other-testimonial-card m-0 flex min-h-[24rem] flex-col justify-between gap-8 bg-white/4 p-8 md:p-14">
    <div class="other-testimonial-card-meta flex items-center justify-between gap-4">
      <p class="font-display text-sm uppercase tracking-[0.3em] text-house-text-muted">Fan telemetry</p>
      <span class="other-testimonial-rating" aria-hidden="true">★★★★★</span>
    </div>

    <blockquote class="other-testimonial-quote font-display text-4xl uppercase leading-[0.9] md:text-6xl">
      {{ card.quote }}
    </blockquote>
    <figcaption class="other-testimonial-author flex flex-row items-center gap-3">
      <div
        v-if="card.image"
        class="aspect-square w-13 overflow-hidden rounded-full border border-white/15"
      >
        <OptimizedImage
          class="h-full w-full object-cover"
          :image="card.image"
          sizes="48px"
          :widths="[48, 96, 144]"
        />
      </div>
      <p class="flex flex-col items-start">
        <span class="font-semibold">{{ card.name }}</span>
        <span v-if="card.role" class="text-sm uppercase tracking-[0.18em] text-house-text-muted">{{ card.role }}</span>
      </p>
    </figcaption>
  </figure>
</template>
