<script setup lang="ts">
defineProps<{
  name: string
}>()
</script>

<template>
  <span class="material-symbols-outlined" aria-hidden="true">{{ name }}</span>
</template>

/* https://fonts.google.com/icons */
