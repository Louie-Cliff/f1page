<script setup lang="ts">
import OptimizedImage from '~/components/ui/OptimizedImage.vue'
import type { TestimonialCard } from '~/types/content'

defineProps<{
  card: TestimonialCard
}>()
</script>

<template>
  <figure class="flex flex-col items-start justify-start m-0 gap-3 other-item py-12">
    
    <blockquote class="text-3xl">
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
        <span v-if="card.role">{{ card.role }}</span>
      </p>
    </figcaption>
  </figure>
</template>
