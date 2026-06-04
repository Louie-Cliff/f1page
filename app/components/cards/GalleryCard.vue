<script setup lang="ts">
import OptimizedImage from '~/components/ui/OptimizedImage.vue'
import type { GalleryCard } from '~/types/content'

defineProps<{
  card: GalleryCard
  imageSizes?: string
}>()
</script>

<template>
  <article class="other-item overflow-hidden bg-black">
    <div
      v-if="card.image"
      class="aspect-[16/9] w-full overflow-hidden"
    >
      <OptimizedImage
        class="h-full w-full object-cover"
        :image="card.image"
        :sizes="imageSizes || '100vw'"
      />
    </div>
    <div
      v-else-if="card.video"
      class="flex aspect-[16/9] items-center justify-center bg-house-black p-6 text-center text-sm font-semibold uppercase tracking-[0.18em] text-house-white"
    >
      {{ card.video }}
    </div>
  </article>
</template>
