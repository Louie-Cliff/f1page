<script setup lang="ts">
import OptimizedImage from '~/components/ui/OptimizedImage.vue'
import CtaList from '~/components/ui/CtaList.vue'
import RichTextRenderer from '~/components/ui/RichTextRenderer.vue'
import type { SpotlightSection } from '~/types/content'
import { getContainerImageSizes } from '~/utils/image-sizes'
import { getThemeClasses } from '~/utils/theme'

defineProps<{
  section: SpotlightSection
}>()

const imageSizes = getContainerImageSizes('w-full md:w-1/2')
</script>

<template>
  <section class="other-section" :class="`other-theme-${section.theme}`">
    <div class="other-container grid gap-10 rounded-[2rem] border border-white/10 bg-white/4 p-6 backdrop-blur-sm md:grid-cols-[0.9fr_1fr] md:items-center md:p-10">
      <div
        v-if="section.image"
        class="aspect-[4/3] w-full overflow-hidden rounded-[1.5rem]"
      >
        <OptimizedImage
          class="h-full w-full object-cover"
          :image="section.image"
          :sizes="imageSizes"
        />
      </div>
      <div>
        <p v-if="section.label" class="eyebrow">
          {{ section.label }}
        </p>
        <h2 v-if="section.title" class="mt-4 text-5xl leading-none text-house-text md:text-6xl">
          {{ section.title }}
        </h2>
        <RichTextRenderer
          v-if="section.copy.nodes.length"
          class="mt-6"
          :rich-text="section.copy"
        />
        <CtaList v-if="section.links?.length" class="mt-8" :links="section.links" />
      </div>
    </div>
  </section>
</template>
