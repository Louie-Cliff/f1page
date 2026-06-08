<script setup lang="ts">
import type { UnknownSection } from '~/types/content'
import { getThemeClasses } from '~/utils/theme'

defineProps<{
  section: UnknownSection
}>()
</script>

<template>
  <section class="other-section" :class="getThemeClasses(section.theme)">
    <div class="container other-container">
      <p class="font-bold">
        The section type <code>{{ section.originalType }}</code> is not registered in the project yet.
      </p>
    </div>
  </section>
</template>
