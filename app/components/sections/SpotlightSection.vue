<script setup lang="ts">
import OptimizedImage from '~/components/ui/OptimizedImage.vue'
import CtaList from '~/components/ui/CtaList.vue'
import RichTextRenderer from '~/components/ui/RichTextRenderer.vue'
import type { SpotlightSection } from '~/types/content'
import { getContainerImageSizes } from '~/utils/image-sizes'
import { getThemeClasses, getThemeData } from '~/utils/theme'

const props = defineProps<{
  section: SpotlightSection
}>()

const imageSizes = getContainerImageSizes('w-full md:w-1/2')
const themeData = computed(() => getThemeData(props.section.theme))
const isRaceRedTheme = computed(() => themeData.value.stringy === 'other-theme-race-red')
</script>

<template>
  <section
    class="other-section other-spotlight-section"
    :class="[getThemeClasses(section.theme), isRaceRedTheme ? 'other-spotlight-section--race-red' : '']"
  >
    <div class="other-container other-spotlight-panel grid gap-8 overflow-hidden rounded-[2rem] border border-white/10 p-6 md:grid-cols-[1.2fr_1fr] md:items-center md:gap-16 md:p-12">
      <div
        v-if="section.image"
        class="other-spotlight-media aspect-[16/10] w-full overflow-hidden rounded-[2rem] md:aspect-[5/4]"
      >
        <OptimizedImage
          class="h-full w-full object-cover"
          :image="section.image"
          :sizes="imageSizes"
        />
      </div>
      <div class="other-spotlight-copy mx-auto max-w-lg text-center md:mx-0 md:max-w-2xl sm:text-left">
        <p v-if="section.label" class="eyebrow other-spotlight-eyebrow">
          {{ section.label }}
        </p>
        <h2 v-if="section.title" class="mt-4 text-6xl leading-[0.92] text-house-text md:max-w-xl md:text-8xl">
          {{ section.title }}
        </h2>
        <RichTextRenderer
          v-if="section.copy.nodes.length"
          class="mt-5 md:mt-7"
          :rich-text="section.copy"
        />
        <CtaList
          v-if="section.links?.length"
          class="mt-6 md:mt-8"
          :links="section.links"
          align="left"
        />
      </div>
    </div>
  </section>
</template>
