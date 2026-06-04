<script setup lang="ts">
import {
  getExternalVideoConfig,
  getExternalVideoEmbedUrl
} from '~/utils/video'

const props = withDefaults(
  defineProps<{
    url?: string
    title?: string
    autoplay?: boolean
    controls?: boolean
    loop?: boolean
    background?: boolean
    pauseWhenHidden?: boolean
  }>(),
  {
    title: 'Video',
    autoplay: false,
    controls: true,
    loop: false,
    background: false,
    pauseWhenHidden: true
  }
)

const iframe = ref<HTMLIFrameElement | null>(null)
const isVisible = ref(false)
const isPlaying = ref(false)
const isLoaded = ref(false)
const prefersReducedMotion = ref(false)

let observer: IntersectionObserver | undefined

const video = computed(() => getExternalVideoConfig(props.url))
const shouldAutoplay = computed(
  () => (props.autoplay || props.background) && !prefersReducedMotion.value
)
const shouldMute = computed(() => shouldAutoplay.value || props.background)
const shouldLoop = computed(() => props.loop || props.background || shouldAutoplay.value)
const showTapControl = computed(() => !props.controls && !props.background)
const iframeSrc = computed(() =>
  video.value
    ? getExternalVideoEmbedUrl(video.value, {
        autoplay: shouldAutoplay.value,
        controls: props.controls && !props.background,
        loop: shouldLoop.value,
        muted: shouldMute.value,
        background: props.background
      })
    : ''
)

const sendCommand = (command: 'play' | 'pause') => {
  const frame = iframe.value?.contentWindow
  const provider = video.value?.provider

  if (!frame || !provider) {
    return
  }

  if (provider === 'youtube') {
    frame.postMessage(
      JSON.stringify({
        event: 'command',
        func: command === 'play' ? 'playVideo' : 'pauseVideo',
        args: []
      }),
      '*'
    )
  }

  if (provider === 'vimeo') {
    frame.postMessage(
      JSON.stringify({
        method: command
      }),
      '*'
    )
  }

  isPlaying.value = command === 'play'
}

const play = () => {
  sendCommand('play')
}

const pause = () => {
  sendCommand('pause')
}

const togglePlayback = () => {
  if (isPlaying.value) {
    pause()
    return
  }

  play()
}

const handleLoad = () => {
  isLoaded.value = true

  if (shouldAutoplay.value && isVisible.value) {
    play()
  }
}

onMounted(() => {
  prefersReducedMotion.value = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches

  if (!props.pauseWhenHidden || !iframe.value) {
    isVisible.value = true
    return
  }

  observer = new IntersectionObserver(
    ([entry]) => {
      isVisible.value = Boolean(entry?.isIntersecting)

      if (!entry?.isIntersecting) {
        pause()
        return
      }

      if (shouldAutoplay.value && isLoaded.value) {
        play()
      }
    },
    {
      threshold: 0.2
    }
  )

  observer.observe(iframe.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
})

defineExpose({
  play,
  pause
})
</script>

<template>
  <div
    v-if="iframeSrc"
    class="other-external-video"
    :class="{
      'other-external-video--background': background,
      'other-external-video--interactive': !background
    }"
    :data-provider="video?.provider"
  >
    <iframe
      ref="iframe"
      class="other-external-video-frame"
      :src="iframeSrc"
      :title="title"
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
      allowfullscreen
      loading="lazy"
      referrerpolicy="strict-origin-when-cross-origin"
      @load="handleLoad"
    />
    <button
      v-if="showTapControl"
      class="absolute inset-0 cursor-pointer"
      type="button"
      :aria-label="isPlaying ? 'Pause video' : 'Play video'"
      @click="togglePlayback"
    >
      <span class="text-house-white">{{ isPlaying ? '' : 'Play' }}</span>
    </button>
  </div>
</template>
