<script setup lang="ts">
import OptimizedImage from '~/components/ui/OptimizedImage.vue'
import SmartLink from '~/components/ui/SmartLink.vue'
import type { NormalizedRichTextBlok } from '~/types/content'
import { resolveGames } from '~/utils/content/resolve-games'
import { getContainerImageSizes } from '~/utils/image-sizes'

const props = defineProps<{
  blok: NormalizedRichTextBlok
}>()

const params = computed(() => props.blok)
const gameReference = computed(() =>
  typeof params.value.game === 'string' ? params.value.game : ''
)

const { data: games } = await useAsyncData(
  `richtext-game-${params.value._uid || gameReference.value || 'empty'}`,
  () =>
    gameReference.value
      ? resolveGames({
          references: [gameReference.value],
          limit: 1
        })
      : Promise.resolve([]),
  {
    watch: [gameReference]
  }
)

const imageWidthClasses = 'w-full sm:w-1/4 md:w-1/3'
const imageSizes = getContainerImageSizes(imageWidthClasses)

const game = computed(() => games.value?.[0])
</script>

<template>
  <aside
    class="other-richtext-embed other-richtext-embed--game"
    :data-component="params.component"
    :data-uid="params._uid"
    :data-game="gameReference"
    :data-show-ctas-game="params.show_ctas_game"
    :data-show-ctas-stores="params.show_ctas_stores"
    :data-show-ctas-socials="params.show_ctas_socials"
  >
    <div class="flex flex-row items-center gap-6 p-6 border rounded-lg ">
      
      <div
        v-if="game?.image"
        class="aspect-square overflow-clip rounded-lg"
        :class="imageWidthClasses"
      >
      <OptimizedImage
        v-if="game?.image"
          class="h-full w-full object-cover"
        :image="game.image"
        :sizes="imageSizes"
      />
      </div>
      <div v-if="game" class="w-full flex flex-col gap-3">
        <p v-if="game.gameType || game.status">
          <span v-if="game.gameType">{{ game.gameType }}</span>
          <span v-if="game.gameType && game.status"> / </span>
          <span v-if="game.status">{{ game.status }}</span>
        </p>
        <h3>{{ game.title }}</h3>
        <p v-if="game.summary">{{ game.summary }}</p>
      </div>
      <SmartLink
        v-if="game"
        :href="game.path"
        class="other-card-link"
      />
    </div>
  </aside>
</template>
