<script setup lang="ts">
import PageTransitionOverlay from '~/components/site/PageTransitionOverlay.vue'

const config = useRuntimeConfig()
const route = useRoute()
const isIframePreview = ref(false)
const hasStoryblokPreviewParams = computed(() =>
  Object.keys(route.query).some((key) => key === '_storyblok' || key.startsWith('_storyblok_'))
)
const isStoryblokLiveEditor = computed(() =>
  config.public.storyblokEditorMode &&
  (hasStoryblokPreviewParams.value || isIframePreview.value)
)
const showPageTransitions = computed(() => !isStoryblokLiveEditor.value)

onMounted(() => {
  isIframePreview.value = window.self !== window.top
})
</script>

<template>
  <NuxtLoadingIndicator v-if="showPageTransitions" color="#44f0b2" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <PageTransitionOverlay v-if="showPageTransitions" />
</template>
