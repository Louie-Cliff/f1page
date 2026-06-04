<script setup lang="ts">
import CtaList from '~/components/ui/CtaList.vue'
import OptimizedImage from '~/components/ui/OptimizedImage.vue'
import RichTextRenderer from '~/components/ui/RichTextRenderer.vue'
import type { SectionCard } from '~/types/content'

defineProps<{
  card: SectionCard
  imageSizes?: string
}>()
</script>

<template>
  <article class="other-item flex h-full flex-col items-start bg-white/4 backdrop-blur-sm transition-transform duration-200 hover:-translate-y-1">
    <div
      v-if="card.image"
      class="aspect-[4/3] w-full overflow-hidden"
    >
      <OptimizedImage
        class="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        :image="card.image"
        :sizes="imageSizes || '(min-width: 768px) 33vw, 100vw'"
      />
    </div>
    <div class="flex h-full w-full flex-col gap-4 p-5 md:p-6" :class="card.align==='right'?'text-right':card.align==='left'?'text-left':'text-center'">
      <h3 v-if="card.title || card.name" class="mb-0">
        {{ card.title || card.name }}
      </h3>
      <p v-if="card.subtitle || card.role" class="mb-0 text-sm font-semibold uppercase tracking-[0.18em] text-house-text-muted">
        {{ card.subtitle || card.role }}
      </p>
      <RichTextRenderer
        v-if="card.copy?.nodes.length"
        :rich-text="card.copy"
      />
      <CtaList v-if="card.links?.length" :links="card.links" :align="card.align" class="mt-auto" />
    </div>
  </article>
</template>
