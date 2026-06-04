<script setup lang="ts">
import CtaList from '~/components/ui/CtaList.vue'
import type { NormalizedRichTextBlok, SectionAlign } from '~/types/content'
import { normalizeStoryblokCtas } from '~/utils/content/storyblok-mappers'

const props = defineProps<{
  blok: NormalizedRichTextBlok
}>()

const params = computed(() => props.blok)
const align = computed<SectionAlign>(() =>
  params.value.align === 'left' ||
  params.value.align === 'center' ||
  params.value.align === 'right'
    ? params.value.align
    : 'center'
)
const ctas = computed(() => normalizeStoryblokCtas(params.value.ctas))
</script>

<template>
  <div
    class="other-richtext-embed other-richtext-embed--buttons"
    :data-component="params.component"
    :data-uid="params._uid"
    :data-align="params.align"
    :data-inline="params.inline"
    :data-layout="params.layout"
  >
    <CtaList :links="ctas" :align="align" />
  </div>
</template>
