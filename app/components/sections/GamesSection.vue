<script setup lang="ts">
import GameCard from '~/components/cards/GameCard.vue'
import RichTextRenderer from '~/components/ui/RichTextRenderer.vue'
import type { GamesSection } from '~/types/content'
import { resolveGames } from '~/utils/content/resolve-games'
import { getGridColumnClasses } from '~/utils/grid-columns'
import { getGridImageSizes } from '~/utils/image-sizes'
import { getThemeClasses } from '~/utils/theme'

const props = defineProps<{
  section: GamesSection
}>()

const { data: games } = await useAsyncData(
  `games-section-${props.section.id}-${props.section.games.join('-')}`,
  () =>
    resolveGames({
      references: props.section.games
    })
)

const gameImageSizes = getGridImageSizes()
</script>

<template>
  <section class="other-section" :class="`other-theme-${section.theme}`">
    <div class="container flex flex-col items-center gap-6 other-container">
      <RichTextRenderer v-if="section.copy.nodes.length" :rich-text="section.copy" class="w-2/3 text-center" />
      <div
        v-if="games?.length"
        class="gap-6"
        :class="getGridColumnClasses()"
      >
        <GameCard
          v-for="game in games"
          :key="game.id"
          :game="game"
          :image-sizes="gameImageSizes"
        />
      </div>
      <p
        v-else
        class="mt-8 rounded-lg border border-house-border bg-house-surface p-5 text-sm text-house-text-muted"
      >
        No games are available yet.
      </p>
    </div>
  </section>
</template>
