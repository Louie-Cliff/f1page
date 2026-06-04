<script setup lang="ts">
import type { NormalizedSection } from '~/types/content'
import { getSectionComponent } from '~/utils/content/sections'
import { getStoryblokEditableAttrs } from '~/utils/storyblok-editor'

defineProps<{
  sections: NormalizedSection[]
}>()

const config = useRuntimeConfig()
</script>

<template>
  <div
    v-for="(section, sectionIndex) in sections"
    :key="section.id"
    class="other-section-shell"
    v-bind="getStoryblokEditableAttrs(section, config.public.storyblokEditorMode)"
  >
    <component
      :is="getSectionComponent(section.type)"
      :section="section"
      :section-index="sectionIndex"
    />
  </div>
</template>
