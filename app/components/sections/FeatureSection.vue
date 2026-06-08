<script setup lang="ts">
import OptimizedImage from '~/components/ui/OptimizedImage.vue'
import RichTextRenderer from '~/components/ui/RichTextRenderer.vue'
import type { FeatureSection } from '~/types/content'
import { getContainerImageSizes } from '~/utils/image-sizes'
import { getThemeClasses } from '~/utils/theme'

const props = defineProps<{
  section: FeatureSection
  sectionIndex?: number
}>()

const resolvedAlign = computed(() => {
  if (props.section.align === 'left' || props.section.align === 'right') {
    return props.section.align
  }

  return (props.sectionIndex || 0) % 2 === 0 ? 'right' : 'left'
})

const layoutClass = computed(() =>
  resolvedAlign.value === 'left' ? 'md:flex-row-reverse' : 'md:flex-row'
)

const imageWidthClasses = 'w-full md:w-1/3'
const imageSizes = getContainerImageSizes(imageWidthClasses)
</script>

<template>
  <section class="other-section" :class="getThemeClasses(section.theme)">
    <div
      class="container flex flex-col items-center gap-10 other-container md:gap-16"
      :class="layoutClass"
    >
      <div class="w-full md:w-1/2">
        <RichTextRenderer v-if="section.copy.nodes.length" :rich-text="section.copy" />
      </div>
      <div
        v-if="section.image"
        class="aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 bg-house-surface-muted"
        :class="imageWidthClasses"
      >
        <OptimizedImage
          class="h-full w-full object-cover"
          :image="section.image"
          :sizes="imageSizes"
        />
      </div>
    </div>
  </section>
</template>
