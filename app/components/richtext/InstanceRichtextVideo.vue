<script setup lang="ts">
import ExternalVideo from '~/components/ui/ExternalVideo.vue'
import type { NormalizedRichTextBlok } from '~/types/content'

const props = defineProps<{
  blok: NormalizedRichTextBlok
}>()

const params = computed(() => props.blok)
const video = computed(() =>
  typeof params.value.video === 'string' ? params.value.video : ''
)
const caption = computed(() =>
  typeof params.value.caption === 'string' ? params.value.caption : ''
)
</script>

<template>
  <figure class="other-richtext-embed other-richtext-embed--video"
      :data-component="params.component"
      :data-uid="params._uid"
      :data-align="params.align"
      :data-size="params.size"
      :data-inline="params.inline"
      :data-video="video"
    >
      <ExternalVideo v-if="video" :url="video" title="Richtext video" />
      <figcaption v-if="caption" class="other-caption">{{ caption }}</figcaption>
  </figure>
</template>
