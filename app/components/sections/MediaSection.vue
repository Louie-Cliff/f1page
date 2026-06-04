<script setup lang="ts">
import ExternalVideo from '~/components/ui/ExternalVideo.vue'
import OptimizedImage from '~/components/ui/OptimizedImage.vue'
import type { MediaSection } from '~/types/content'
import { getContainerImageSizes } from '~/utils/image-sizes'
import { getThemeClasses } from '~/utils/theme'

defineProps<{
  section: MediaSection
}>()

const imageSizes = getContainerImageSizes('w-full')
</script>

<template>
  <section class="other-section" :class="`other-theme-${section.theme}`">
    <div class="container other-container">
      <figure class="m-0">
        <div class="relative overflow-hidden">
          <OptimizedImage
            v-if="section.image"
            class="w-full object-cover"
            :image="section.image"
            :sizes="imageSizes"
          />
          <ExternalVideo
            v-if="section.video"
            :class="section.image ? 'absolute inset-0' : 'aspect-video'"
            :url="section.video"
            title="Media video"
            :controls="section.videoControls !== false"
            :autoplay="section.videoAutoplay === true"
            :loop="section.videoAutoplay === true"
          />
        </div>
        <figcaption v-if="section.caption" class="other-caption">
          {{ section.caption }}
        </figcaption>
      </figure>
    </div>
  </section>
</template>
