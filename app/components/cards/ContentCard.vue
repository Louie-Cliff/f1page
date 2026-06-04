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
  <article class="other-item flex flex-col items-start">
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
    <div class="flex flex-col w-full h-full p-3 gap-3" :class="card.align==='right'?'text-right':card.align==='left'?'text-left':'text-center'">
      <h3 v-if="card.title || card.name" class="mb-0">
        {{ card.title || card.name }}
      </h3>
      <p v-if="card.subtitle || card.role" class="text-sm mb-0">
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
