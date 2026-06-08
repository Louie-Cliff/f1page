<script setup lang="ts">
import ContentCard from '~/components/cards/ContentCard.vue'
import BaseCarousel from '~/components/ui/BaseCarousel.vue'
import RichTextRenderer from '~/components/ui/RichTextRenderer.vue'
import type { TimelineSection } from '~/types/content'
import { getContainerImageSizes } from '~/utils/image-sizes'
import { getThemeClasses } from '~/utils/theme'

defineProps<{
  section: TimelineSection
}>()

const cardImageSizes = getContainerImageSizes('w-1/4')
</script>

<template>
  <section class="other-section" :class="getThemeClasses(section.theme)">
    <div class="container flex flex-col items-center justify-center gap-6 other-container">
      <RichTextRenderer v-if="section.copy.nodes.length" :rich-text="section.copy" class="w-2/3 text-center" />
      <BaseCarousel
        v-if="section.cards.length"
        :items="section.cards"
        aria-label="Timeline"
        indicators="none"
        show-controls
        :slides-to-scroll="1"
        slide-size="25%"
      >
        <template #default="{ item }">
          <ContentCard :card="item" :image-sizes="cardImageSizes" />
        </template>
      </BaseCarousel>
    </div>

  </section>
</template>
