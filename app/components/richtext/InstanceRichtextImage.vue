<script setup lang="ts">
import OptimizedImage from '~/components/ui/OptimizedImage.vue'
import type { NormalizedImage, NormalizedRichTextBlok } from '~/types/content'

type RawImage = {
  alt?: string | null
  filename?: string | null
  focus?: string | null
  name?: string | null
  title?: string | null
  meta_data?: {
    alt?: string | null
    title?: string | null
  }
}

const props = defineProps<{
  blok: NormalizedRichTextBlok
}>()

const params = computed(() => props.blok)

const assetDimensionsFromFilename = (filename: string) => {
  const dimensions = filename.match(/\/(\d+)x(\d+)\//)

  return dimensions
    ? {
        width: Number(dimensions[1]),
        height: Number(dimensions[2])
      }
    : {}
}

const image = computed<NormalizedImage | undefined>(() => {
  const asset = params.value.image as RawImage | undefined

  if (!asset?.filename) {
    return undefined
  }

  return {
    src: asset.filename,
    alt: asset.alt || asset.meta_data?.alt || asset.name || '',
    title: asset.title || asset.meta_data?.title || asset.name || undefined,
    focalPoint: asset.focus || undefined,
    ...assetDimensionsFromFilename(asset.filename)
  }
})

const caption = computed(() =>
  typeof params.value.caption === 'string' ? params.value.caption : ''
)
</script>

<template>
  <figure
    class="other-richtext-embed other-richtext-embed--image"
    :data-component="params.component"
    :data-uid="params._uid"
    :data-align="params.align"
    :data-size="params.size"
    :data-inline="params.inline"
  >
    <OptimizedImage
      v-if="image"
      :image="image"
      sizes="(min-width: 768px) 720px, 100vw"
    />
    <figcaption v-if="caption" class="other-caption">{{ caption }}</figcaption>
  </figure>
</template>
