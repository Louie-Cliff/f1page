<script setup lang="ts">
import Autoplay from 'embla-carousel-autoplay'
import MaterialIcon from '~/components/ui/MaterialIcon.vue'
import useEmblaCarousel from 'embla-carousel-vue'
import type { EmblaOptionsType } from 'embla-carousel'

type CarouselIndicatorType = 'dots' | 'thumbnails' | 'none'

const props = withDefaults(
  defineProps<{
    items?: any[]
    ariaLabel?: string
    loop?: boolean
    autoplay?: boolean
    autoplayDelay?: number
    autoplayPauseOnHover?: boolean
    autoplayStopOnInteraction?: boolean
    slidesToScroll?: number | 'auto'
    slideSize?: string
    slideClass?: string
    align?: EmblaOptionsType['align']
    containScroll?: EmblaOptionsType['containScroll']
    draggable?: boolean
    indicators?: CarouselIndicatorType
    showControls?: boolean
    options?: EmblaOptionsType
  }>(),
  {
    items: () => [],
    ariaLabel: 'Carousel',
    loop: false,
    autoplay: false,
    autoplayDelay: 5000,
    autoplayPauseOnHover: true,
    autoplayStopOnInteraction: true,
    slidesToScroll: 1,
    slideSize: '100%',
    slideClass: '',
    align: 'start',
    containScroll: 'trimSnaps',
    draggable: true,
    indicators: 'dots',
    showControls: true,
    options: undefined
  }
)

defineSlots<{
  default(props: { item: any; index: number; isSelected: boolean }): unknown
  indicator?(props: { item: any; index: number; isSelected: boolean }): unknown
}>()

const carouselId = useId()
const prefersReducedMotion = ref(false)
const selectedSnap = ref(0)
const scrollSnaps = ref<number[]>([])
const canScrollPrev = ref(false)
const canScrollNext = ref(false)
let cleanupMotionPreference = () => {}

const hasMultipleSlides = computed(() => props.items.length > 1)
const shouldAutoplay = computed(
  () => props.autoplay && hasMultipleSlides.value && !prefersReducedMotion.value
)

const emblaOptions = computed<EmblaOptionsType>(() => ({
  ...props.options,
  align: props.align,
  containScroll: props.containScroll,
  loop: props.loop && hasMultipleSlides.value,
  slidesToScroll: props.slidesToScroll,
  watchDrag: props.draggable
}))

const emblaPlugins = computed(() =>
  shouldAutoplay.value
    ? [
        Autoplay({
          delay: props.autoplayDelay,
          stopOnFocusIn: props.autoplayPauseOnHover,
          stopOnMouseEnter: props.autoplayPauseOnHover,
          stopOnInteraction: props.autoplayStopOnInteraction
        })
      ]
    : []
)

const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions, emblaPlugins)

const updateCarouselState = () => {
  const api = emblaApi.value

  if (!api) {
    return
  }

  scrollSnaps.value = api.scrollSnapList()
  selectedSnap.value = api.selectedScrollSnap()
  canScrollPrev.value = api.canScrollPrev()
  canScrollNext.value = api.canScrollNext()
}

const scrollPrevious = () => emblaApi.value?.scrollPrev()
const scrollNext = () => emblaApi.value?.scrollNext()
const scrollTo = (index: number) => emblaApi.value?.scrollTo(index)

watch(
  emblaApi,
  (api) => {
    if (!api) {
      return
    }

    updateCarouselState()
    api.on('select', updateCarouselState)
    api.on('reInit', updateCarouselState)
  },
  { immediate: true }
)

watch(
  () => props.items.length,
  async () => {
    await nextTick()
    emblaApi.value?.reInit()
    updateCarouselState()
  }
)

onMounted(() => {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  const updateMotionPreference = () => {
    prefersReducedMotion.value = mediaQuery.matches
  }

  updateMotionPreference()
  mediaQuery.addEventListener('change', updateMotionPreference)

  cleanupMotionPreference = () => {
    mediaQuery.removeEventListener('change', updateMotionPreference)
  }
})

onBeforeUnmount(() => {
  const api = emblaApi.value

  api?.off('select', updateCarouselState)
  api?.off('reInit', updateCarouselState)
  cleanupMotionPreference()
})
</script>

<template>
  <div class="other-carousel group" :data-carousel-id="carouselId">

    <div class="relative">
      <div
        ref="emblaRef"
        class="other-carousel-viewport"
        role="region"
        :aria-label="ariaLabel"
        aria-roledescription="carousel"
      >
        <div class="other-carousel-container ">
          <div
            v-for="(item, index) in items"
            :key="item?.id || index"
            class="other-carousel-slide"
            :class="slideClass"
            :style="{ flexBasis: slideSize }"
            role="group"
            aria-roledescription="slide"
            :aria-label="`${index + 1} of ${items.length}`"
          >
            <slot
              :item="item"
              :index="index"
              :is-selected="selectedSnap === index"
            />
          </div>
        </div>
      </div>

      <div v-if="showControls && hasMultipleSlides" class="other-carousel-controls">
        <button
          class="other-carousel-button other-carousel-button-previous"
          type="button"
          :disabled="!loop && !canScrollPrev"
          aria-label="Previous slide"
          @click="scrollPrevious"
        >
          <MaterialIcon name="chevron_left" />
        </button>
        <button
          class="other-carousel-button other-carousel-button-next"
          type="button"
          :disabled="!loop && !canScrollNext"
          aria-label="Next slide"
          @click="scrollNext"
        >
          <MaterialIcon name="chevron_right" />
        </button>
      </div>

    </div>


    <div
      v-if="indicators !== 'none' && hasMultipleSlides"
      class="other-carousel-indicators"
      aria-label="Carousel slides"
    >
      <button
        v-for="(_, index) in scrollSnaps"
        :key="index"
        class="other-carousel-indicator transition"
        :class="[
          indicators === 'thumbnails'
            ? 'other-carousel-indicator-thumbnail'
            : 'other-carousel-indicator-dot',
          selectedSnap === index ? 'is-active bg-house-black' : 'bg-none'
        ]"
        type="button"
        :aria-label="`Go to slide ${index + 1}`"
        :aria-current="selectedSnap === index ? 'true' : undefined"
        @click="scrollTo(index)"
      >
        <slot
          v-if="indicators === 'thumbnails'"
          name="indicator"
          :item="items[index]"
          :index="index"
          :is-selected="selectedSnap === index"
        />
        <span v-else class="sr-only">Slide {{ index + 1 }}</span>
      </button>
    </div>
  </div>
</template>
