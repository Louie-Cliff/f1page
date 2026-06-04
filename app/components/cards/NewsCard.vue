<script setup lang="ts">
import OptimizedImage from '~/components/ui/OptimizedImage.vue'
import RichTextRenderer from '~/components/ui/RichTextRenderer.vue'
import SmartLink from '~/components/ui/SmartLink.vue'
import type { NewsCard } from '~/types/content'

defineProps<{
  card: NewsCard
  imageSizes?: string
}>()
</script>

<template>
  <article class="other-item flex flex-col items-start">
    <SmartLink :href="card.path" class="focus-visible:outline-offset-0 other-card-link">
      <div
        v-if="card.image"
        class="aspect-[4/3] w-full overflow-hidden"
      >
        <OptimizedImage
          class="h-full w-full object-cover"
          :image="card.image"
          :sizes="imageSizes || '(min-width: 768px) 33vw, 100vw'"
        />
      </div>
      <div class="flex flex-col w-full p-3 gap-3">
        <p v-if="card.featured" class="text-sm">
          Featured News
        </p>
        <time
          v-if="card.date"
          class="text-xs"
          :datetime="card.date"
        >
          {{ card.date }}
        </time>
        <h3 v-if="card.title" class="mb-0">
          {{ card.title }}
        </h3>
        <RichTextRenderer
          v-if="card.excerpt?.nodes.length"
          :rich-text="card.excerpt"
        />
      </div>
    </SmartLink>
  </article>
</template>
