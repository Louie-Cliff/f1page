<script setup lang="ts">
import ContentCard from '~/components/cards/ContentCard.vue'
import RichTextRenderer from '~/components/ui/RichTextRenderer.vue'
import type { CardsSection } from '~/types/content'
import { getGridColumnClasses } from '~/utils/grid-columns'
import { getGridImageSizes } from '~/utils/image-sizes'
import { getThemeClasses, getThemeData } from '~/utils/theme'

const props = defineProps<{
  section: CardsSection
}>()

const cardImageSizes = computed(() => getGridImageSizes(props.section.columns))
const themeData = computed(() => getThemeData(props.section.theme))
const isRaceRedTheme = computed(() => themeData.value.stringy === 'other-theme-race-red')
</script>

<template>
  <section
    class="other-section other-cards-section"
    :class="[getThemeClasses(section.theme), isRaceRedTheme ? 'other-cards-section--race-red' : '']"
  >
    <div class="container flex flex-col items-center justify-center gap-6 other-container">
      <RichTextRenderer
        v-if="section.copy.nodes.length"
        :rich-text="section.copy"
        class="other-cards-section-copy max-w-3xl text-center"
      />
      <div
        v-if="section.cards.length"
        class="other-cards-section-grid grid gap-6"
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
