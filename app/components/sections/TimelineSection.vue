<script setup lang="ts">
import OptimizedImage from '~/components/ui/OptimizedImage.vue'
import RichTextRenderer from '~/components/ui/RichTextRenderer.vue'
import type { TimelineSection } from '~/types/content'
import { getContainerImageSizes } from '~/utils/image-sizes'
import { getThemeClasses } from '~/utils/theme'

defineProps<{
  section: TimelineSection
}>()

const cardImageSizes = getContainerImageSizes('w-full')
</script>

<template>
  <section class="other-section other-timeline-section" :class="getThemeClasses(section.theme)">
    <div class="container flex flex-col items-center justify-center gap-8 other-container md:gap-10">
      <RichTextRenderer
        v-if="section.copy.nodes.length"
        :rich-text="section.copy"
        class="max-w-3xl text-center"
      />

      <div v-if="section.cards.length" class="other-timeline-list grid w-full gap-5 md:gap-6">
        <article
          v-for="(card, index) in section.cards"
          :key="card.id"
          class="other-timeline-item other-item"
        >
          <div class="other-timeline-step">
            <span class="other-timeline-step-index">
              {{ String(index + 1).padStart(2, '0') }}
            </span>
            <span class="other-timeline-step-line" aria-hidden="true" />
          </div>

          <div
            v-if="card.image"
            class="other-timeline-media"
          >
            <OptimizedImage
              class="h-full w-full object-cover"
              :image="card.image"
              :sizes="cardImageSizes"
            />
          </div>

          <div class="other-timeline-content">
            <p v-if="card.subtitle" class="other-timeline-kicker">
              {{ card.subtitle }}
            </p>
            <h3 v-if="card.title || card.name" class="other-timeline-title">
              {{ card.title || card.name }}
            </h3>
            <RichTextRenderer
              v-if="card.copy?.nodes.length"
              class="other-timeline-copy"
              :rich-text="card.copy"
            />
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
