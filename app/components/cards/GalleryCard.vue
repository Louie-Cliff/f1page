<script setup lang="ts">
import OptimizedImage from '~/components/ui/OptimizedImage.vue'
import type { GalleryCard } from '~/types/content'

defineProps<{
  card: GalleryCard
  imageSizes?: string
}>()
</script>

<template>
  <article class="overflow-hidden other-item">
    <div
      v-if="card.image"
      class="aspect-[4/3] w-full overflow-hidden"
    >
      <OptimizedImage
        class="h-full w-full object-cover"
        :image="card.image"
        :sizes="imageSizes || '100vw'"
      />
    </div>
    <div
      v-else-if="card.video"
      class="flex aspect-[4/3] items-center justify-center bg-house-black p-5 text-center text-sm font-semibold text-house-white"
    >
      {{ card.video }}
    </div>
  </article>
</template>
