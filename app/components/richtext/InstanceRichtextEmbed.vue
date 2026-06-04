<script setup lang="ts">
import type { NormalizedRichTextBlok } from '~/types/content'

const props = defineProps<{
  blok: NormalizedRichTextBlok
}>()

const params = computed(() => props.blok)
const embedCode = computed(() =>
  typeof params.value.code === 'string' ? params.value.code : ''
)
const caption = computed(() =>
  typeof params.value.caption === 'string' ? params.value.caption : ''
)
</script>

<template>
  <figure
    class="other-richtext-embed other-richtext-embed--embed"
    :data-component="params.component"
    :data-uid="params._uid"
    :data-align="params.align"
    :data-size="params.size"
    :data-inline="params.inline"
  >
    <!-- TODO: Add project-level sanitisation rules before accepting embed code from less trusted CMS roles. -->
    <div v-if="embedCode" class="other-richtext-embed-code" v-html="embedCode" />
    <figcaption v-if="caption" class="other-caption">{{ caption }}</figcaption>
  </figure>
</template>
