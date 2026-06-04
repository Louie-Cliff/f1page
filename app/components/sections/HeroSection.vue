<script setup lang="ts">
import ExternalVideo from '~/components/ui/ExternalVideo.vue'
import OptimizedImage from '~/components/ui/OptimizedImage.vue'
import CtaList from '~/components/ui/CtaList.vue'
import RichTextRenderer from '~/components/ui/RichTextRenderer.vue'
import type { HeroSection } from '~/types/content'

defineProps<{
  section: HeroSection
}>()
</script>

<template>
  <section
    class="aspect-[21/9] flex flex-col items-center justify-center relative other-section"
    :class="`other-theme-${section.theme}`">

    <div class="container relative z-content flex flex-col items-center justify-center gap-6 other-container">
      <RichTextRenderer
        v-if="section.copy.nodes.length"
        class="w-2/3 text-center"
        :rich-text="section.copy"
      />
      <CtaList v-if="section.links?.length" :links="section.links" />
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
      :controls="false"
    />
  </section>
</template>
