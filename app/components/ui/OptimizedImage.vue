<script setup lang="ts">
import type { NormalizedImage } from '~/types/content'
import {
  defaultImageWidths,
  getImageObjectPosition,
  getImageSrcset,
  getImageWidths,
  getStoryblokImageUrl,
  isStoryblokImage
} from '~/utils/storyblok-image'

const props = withDefaults(
  defineProps<{
    image: NormalizedImage
    alt?: string
    sizes?: string
    widths?: number[]
    quality?: number
    loading?: 'lazy' | 'eager'
    fetchpriority?: 'high' | 'low' | 'auto'
  }>(),
  {
    sizes: '100vw',
    quality: 78,
    loading: 'lazy',
    fetchpriority: 'auto'
  }
)

const widths = computed(() => props.widths || defaultImageWidths)
const outputWidths = computed(() => getImageWidths(props.image, widths.value))
const fallbackWidth = computed(() => Math.max(...outputWidths.value))
const src = computed(() =>
  getStoryblokImageUrl(props.image, fallbackWidth.value, props.quality)
)
const srcset = computed(() =>
  isStoryblokImage(props.image.src)
    ? getImageSrcset(props.image, outputWidths.value, props.quality)
    : undefined
)
const objectPosition = computed(() => getImageObjectPosition(props.image))
</script>

<template>
  <img
    :src="src"
    :srcset="srcset"
    :sizes="srcset ? sizes : undefined"
    :alt="alt ?? image.alt"
    :title="image.title"
    :width="image.width"
    :height="image.height"
    :loading="loading"
    :fetchpriority="fetchpriority"
    decoding="async"
    :style="objectPosition ? { objectPosition } : undefined"
  >
</template>
