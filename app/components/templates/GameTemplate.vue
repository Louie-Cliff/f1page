<script setup lang="ts">
import OptimizedImage from '~/components/ui/OptimizedImage.vue'
import type { NormalizedGamePage } from '~/types/content'
import { getContainerImageSizes } from '~/utils/image-sizes'

defineProps<{
  page: NormalizedGamePage
}>()

const imageSizes = getContainerImageSizes('w-full md:w-1/2')
</script>

<template>
  <article>
    <header class="section-shell grid gap-10 py-16 md:grid-cols-[1fr_0.9fr] md:items-center md:py-24">
      <div>
        <p class="eyebrow">Game</p>
        <h1 class="mt-4 text-4xl font-semibold text-house-text md:text-6xl">
          {{ page.title }}
        </h1>
        <p v-if="page.summary" class="mt-6 max-w-2xl text-lg leading-8 text-house-text-muted">
          {{ page.summary }}
        </p>
      </div>
      <div
        v-if="page.image"
        class="aspect-[4/3] w-full overflow-hidden rounded-lg"
      >
        <OptimizedImage
          class="h-full w-full object-cover"
          :image="page.image"
          :sizes="imageSizes"
          loading="eager"
          fetchpriority="high"
        />
      </div>
    </header>
  </article>
</template>
