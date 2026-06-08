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
  <section class="other-section" :class="getThemeClasses(section.theme)">
    <div class="container flex flex-col items-center justify-center gap-8 other-container md:gap-10">
      <RichTextRenderer
        v-if="section.copy.nodes.length"
        class="max-w-3xl text-center"
        :rich-text="section.copy"
      />
      <div
        v-if="section.cards.length"
        class="other-gallery-carousel w-full rounded-[2rem] border border-white/10 bg-white/4 p-5 backdrop-blur-sm md:p-8"
      >
        <BaseCarousel
          :items="section.cards"
          aria-label="Gallery"
          autoplay
          :autoplay-delay="4500"
          autoplay-pause-on-hover
          loop
          indicators="thumbnails"
          show-controls
          :slides-to-scroll="1"
          slide-size="var(--gallery-slide-size)"
          slide-class="other-gallery-slide"
        >
          <template #default="{ item }">
            <GalleryCard :card="item" :image-sizes="galleryImageSizes" />
          </template>
          <template #indicator="{ item, isSelected }">
            <div
              v-if="item.image"
              class="aspect-video w-20 overflow-hidden rounded-xl border transition duration-200 md:w-24"
              :class="isSelected ? 'border-white/70 opacity-100' : 'border-white/10 opacity-60'"
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
              class="inline-flex aspect-video w-20 items-center justify-center rounded-xl border border-white/10 bg-house-black px-2 text-xs font-bold uppercase tracking-[0.18em] text-house-white md:w-24"
            >
              Video
            </span>
          </template>
        </BaseCarousel>
      </div>
      <p
        v-else
        class="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-house-text-muted"
      >
        Add `instance_media` blocks in Storyblok to populate this carousel.
      </p>
    </div>

  </section>
</template>
