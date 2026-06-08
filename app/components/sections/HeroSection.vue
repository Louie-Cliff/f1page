<script setup lang="ts">
import ExternalVideo from '~/components/ui/ExternalVideo.vue'
import OptimizedImage from '~/components/ui/OptimizedImage.vue'
import CtaList from '~/components/ui/CtaList.vue'
import RichTextRenderer from '~/components/ui/RichTextRenderer.vue'
import type { HeroSection } from '~/types/content'
import { getThemeClasses } from '~/utils/theme'

defineProps<{
  section: HeroSection
}>()
</script>

<template>
  <section
    class="relative flex min-h-[78svh] flex-col items-center justify-center other-section"
    :class="getThemeClasses(section.theme)">

    <div class="absolute inset-0 z-content bg-gradient-to-r from-house-black via-house-black/60 to-transparent" />
    <div class="absolute inset-x-0 bottom-0 z-content h-32 bg-gradient-to-t from-house-black to-transparent" />
    <div class="container relative z-content flex flex-col items-start justify-center gap-8 other-container">
      <RichTextRenderer
        v-if="section.copy.nodes.length"
        class="max-w-2xl"
        :rich-text="section.copy"
      />
      <CtaList v-if="section.links?.length" :links="section.links" align="left" />
    </div>
    <OptimizedImage
      v-if="section.image"
      class="absolute inset-0 z-base h-full w-full object-cover"
      :image="section.image"
      sizes="100vw"
      loading="eager"
      fetchpriority="high"
    />
    <ExternalVideo
      v-if="section.video"
      class="absolute inset-0 z-base"
      :url="section.video"
      title="Hero background video"
      background
      autoplay
      loop
      :pause-when-hidden="false"
      :controls="false"
    />
  </section>
</template>
