<script setup lang="ts">
import OptimizedImage from '~/components/ui/OptimizedImage.vue'
import type { TestimonialCard } from '~/types/content'

defineProps<{
  card: TestimonialCard
}>()
</script>

<template>
  <figure class="other-item m-0 flex min-h-80 flex-col justify-between gap-8 bg-white/4 p-8 md:p-12">
    
    <blockquote class="font-display text-4xl uppercase leading-none md:text-5xl">
      {{ card.quote }}
    </blockquote>
    <figcaption class="flex flex-row items-center gap-3">
      <div
        v-if="card.image"
        class="aspect-square w-12 overflow-hidden rounded-full"
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
