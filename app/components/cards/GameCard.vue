<script setup lang="ts">
import OptimizedImage from '~/components/ui/OptimizedImage.vue'
import SmartLink from '~/components/ui/SmartLink.vue'
import type { NormalizedGameSummary } from '~/types/content'

defineProps<{
  game: NormalizedGameSummary
  imageSizes?: string
}>()
</script>

<template>
  <article class="other-item flex flex-col items-start">
    <SmartLink :href="game.path" class="focus-visible:outline-offset-0 other-card-link">
      <div
        v-if="game.image"
        class="aspect-[4/3] w-full overflow-hidden"
      >
        <OptimizedImage
          class="h-full w-full object-cover"
          :image="game.image"
          :sizes="imageSizes || '(min-width: 768px) 33vw, 100vw'"
        />
      </div>
      <div class="flex w-full flex-col gap-3 p-3 text-center">
        <p v-if="game.gameType || game.status" class="mb-0 text-sm">
          <span v-if="game.gameType">{{ game.gameType }}</span>
          <span v-if="game.gameType && game.status"> / </span>
          <span v-if="game.status">{{ game.status }}</span>
        </p>
        <h3 class="mb-0">
          {{ game.title }}
        </h3>
        <p v-if="game.summary" class="mb-0">
          {{ game.summary }}
        </p>
      </div>
    </SmartLink>
  </article>
</template>
