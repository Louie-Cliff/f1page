<script setup lang="ts">
import SectionRenderer from '~/components/sections/SectionRenderer.vue'
import type { NormalizedStandardPage } from '~/types/content'

defineProps<{
  page: NormalizedStandardPage
}>()
</script>

<template>
  <SectionRenderer :sections="page.sections" />
</template>
