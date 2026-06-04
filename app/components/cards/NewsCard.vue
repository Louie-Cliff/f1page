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
  <article class="other-item flex h-full flex-col items-start bg-white/4 backdrop-blur-sm transition-transform duration-200 hover:-translate-y-1">
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
      <div class="flex h-full w-full flex-col gap-3 p-5 md:p-6">
        <p v-if="card.featured" class="text-sm font-semibold uppercase tracking-[0.18em] text-house-text-muted">
          Featured News
        </p>
        <time
          v-if="card.date"
          class="text-xs font-semibold uppercase tracking-[0.18em] text-house-text-muted"
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
