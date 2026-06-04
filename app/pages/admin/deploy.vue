<script setup lang="ts">
import NetlifyDeployPanel from '~/components/admin/NetlifyDeployPanel.vue'

definePageMeta({
  layout: 'admin'
})

const config = useRuntimeConfig()

if (!config.public.storyblokEditorMode) {
  throw createError({
    statusCode: 404,
    statusMessage: 'The requested page does not exist.'
  })
}

useSeoMeta({
  title: 'Deploy Preview',
  description: 'Storyblok editor preview for production deploy status.',
  robots: 'noindex,nofollow'
})
</script>

<template>
  <main class="mx-auto grid max-w-6xl gap-10 px-4 py-8">
    <header>
      <p class="text-xs font-bold uppercase text-house-text-muted">
        Storyblok admin
      </p>
      <h1 class="mt-2 text-3xl font-black text-house-text">
        Deploy
      </h1>
    </header>

    <NetlifyDeployPanel />
  </main>
</template>
