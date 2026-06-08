<script setup lang="ts">
import ContentCard from '~/components/cards/ContentCard.vue'
import RichTextRenderer from '~/components/ui/RichTextRenderer.vue'
import type { CardsSection } from '~/types/content'
import { getGridColumnClasses } from '~/utils/grid-columns'
import { getGridImageSizes } from '~/utils/image-sizes'
import { getThemeClasses } from '~/utils/theme'

const props = defineProps<{
  section: CardsSection
}>()

const cardImageSizes = computed(() => getGridImageSizes(props.section.columns))
</script>

<template>
  <section class="other-section" :class="getThemeClasses(section.theme)">
    <div class="container flex flex-col items-center justify-center gap-6 other-container">
      <RichTextRenderer v-if="section.copy.nodes.length" :rich-text="section.copy" class="max-w-3xl text-center" />
      <div
        v-if="section.cards.length"
        class="grid gap-6"
        :class="getGridColumnClasses(section.columns)"
      >
        <ContentCard
          v-for="card in section.cards"
          :key="card.id"
          :card="card"
          :image-sizes="cardImageSizes"
        />
      </div>
    </div>
  </section>
</template>
