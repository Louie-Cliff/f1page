<script setup lang="ts">
import OptimizedImage from '~/components/ui/OptimizedImage.vue'
import RichTextRenderer from '~/components/ui/RichTextRenderer.vue'
import type { NormalizedArticlePage } from '~/types/content'
import { getContainerImageSizes } from '~/utils/image-sizes'

defineProps<{
  page: NormalizedArticlePage
}>()

const imageSizes = getContainerImageSizes('w-full')
</script>

<template>
  <article>
    <header class="section-shell py-16 md:py-24">
      <p class="eyebrow">Article</p>
      <h1 class="mt-4 max-w-4xl text-4xl font-semibold text-house-text md:text-6xl">
        {{ page.title }}
      </h1>
      <time class="mt-6 block text-sm font-semibold text-house-text-muted" :datetime="page.date">
        {{ page.date }}
      </time>
      <div
        v-if="page.image"
        class="mt-10 aspect-[16/9] w-full overflow-hidden rounded-lg"
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
    <div class="section-shell max-w-3xl pb-20">
      <RichTextRenderer :rich-text="page.article" />
    </div>
  </article>
</template>
