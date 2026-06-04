<script setup lang="ts">
import GalleryCard from '~/components/cards/GalleryCard.vue'
import BaseCarousel from '~/components/ui/BaseCarousel.vue'
import OptimizedImage from '~/components/ui/OptimizedImage.vue'
import RichTextRenderer from '~/components/ui/RichTextRenderer.vue'
import type { GallerySection } from '~/types/content'
import { getContainerImageSizes } from '~/utils/image-sizes'
import { getThemeClasses } from '~/utils/theme'

defineProps<{
  section: GallerySection
}>()

const galleryImageSizes = getContainerImageSizes('w-full')
</script>

<template>
  <section class="other-section" :class="`other-theme-${section.theme}`">
    <div class="container flex flex-col items-center justify-center gap-6 other-container">
      <RichTextRenderer
        v-if="section.copy.nodes.length"
        class="w-2/3 text-center"
        :rich-text="section.copy"
      />
      <div v-if="section.cards.length">
        <BaseCarousel
          :items="section.cards"
          aria-label="Gallery"
          indicators="thumbnails"
          show-controls
          :slides-to-scroll="1"
        >
          <template #default="{ item }">
            <GalleryCard :card="item" :image-sizes="galleryImageSizes" />
          </template>
          <template #indicator="{ item }">
            <div
              v-if="item.image"
              class="aspect-video w-20 overflow-hidden"
            >
              <OptimizedImage
                class="h-full w-full object-cover"
                :image="item.image"
                sizes="80px"
                :widths="[80, 160]"
              />
            </div>
            <span
              v-else
              class="inline-flex aspect-video w-20 items-center justify-center bg-house-black px-2 text-xs font-bold text-house-white"
            >
              Video
            </span>
          </template>
        </BaseCarousel>
      </div>
    </div>

  </section>
</template>
