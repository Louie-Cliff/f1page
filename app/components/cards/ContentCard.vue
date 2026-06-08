28rme<script setup lang="ts">
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
  <article class="other-item flex h-full flex-col items-start bg-white/4 backdrop-blur-sm transition-transform duration-200 hover:-translate-y-1 min-h-[28rem]">
    <div
      v-if="card.image"
      class="other-card-media h-[18rem] w-full overflow-hidden p-4 md:h-[22rem] md:p-6"
    >
      <OptimizedImage
        class="h-full w-auto max-w-full object-contain object-center transition-transform duration-500 hover:scale-105"
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
