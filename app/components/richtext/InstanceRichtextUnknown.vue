<script setup lang="ts">
import type { NormalizedRichTextBlok } from '~/types/content'

const props = defineProps<{
  blok: NormalizedRichTextBlok
}>()

const params = computed(() => props.blok)
</script>

<template>
  <div
    class="other-richtext-embed other-richtext-embed--unknown"
    :data-component="params.component"
    :data-uid="params._uid"
  />
</template>
