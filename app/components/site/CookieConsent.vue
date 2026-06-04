<script setup lang="ts">
import RichTextRenderer from '~/components/ui/RichTextRenderer.vue'
import type { NormalizedSiteSettings } from '~/types/content'

const props = withDefaults(
  defineProps<{
    settings?: NormalizedSiteSettings | null
    preview?: boolean
  }>(),
  {
    preview: false
  }
)

const { preferences, acceptAll, rejectOptional, setPreferences } = useCookieConsent()
const isMounted = ref(false)
const choices = reactive({
  analytics: false,
  marketing: false
})

onMounted(() => {
  choices.analytics = preferences.value.analytics
  choices.marketing = preferences.value.marketing
  isMounted.value = true
})

const showBanner = computed(
  () =>
    props.preview ||
    (isMounted.value &&
      (props.settings?.cookieConsentEnabled ?? true) &&
      !preferences.value.decided)
)
const hasCookieMessage = computed(() => Boolean(props.settings?.cookies.nodes.length))
const bannerClass = computed(() =>
  props.preview
    ? 'relative border-t border-house-border bg-house-surface px-4 py-4'
    : 'fixed inset-x-0 bottom-0 z-cookie border-t border-house-border bg-house-surface px-4 py-4 shadow-[0_-12px_32px_rgba(0,0,0,0.12)]'
)

const saveChoices = () => {
  if (props.preview) {
    return
  }

  setPreferences({
    analytics: choices.analytics,
    marketing: choices.marketing
  })
}

const acceptAllCookies = () => {
  if (!props.preview) {
    acceptAll()
  }
}

const rejectOptionalCookies = () => {
  if (!props.preview) {
    rejectOptional()
  }
}
</script>

<template>
  <aside
    v-if="showBanner"
    aria-label="Cookie consent"
    :class="bannerClass"
  >
    <div class="mx-auto grid max-w-6xl gap-4 md:grid-cols-[1fr_auto] md:items-end">
      <div>
        <h2 class="text-base font-semibold text-house-text">
          Cookie preferences
        </h2>
        <RichTextRenderer
          v-if="hasCookieMessage && settings"
          class="mt-2 max-w-3xl text-sm leading-6 text-house-text-muted [&.rich-text]:text-sm [&.rich-text]:leading-6"
          :rich-text="settings.cookies"
        />
        <p v-else class="mt-2 max-w-3xl text-sm leading-6 text-house-text-muted">
          We use necessary cookies to keep the site working. With your choice, we can also use analytics and marketing cookies for measurement and campaign tags.
        </p>
        <div class="mt-4 flex flex-wrap gap-4 text-sm text-house-text">
          <label class="inline-flex items-center gap-2 font-semibold">
            <input checked disabled type="checkbox">
            Necessary
          </label>
          <label class="inline-flex items-center gap-2 font-semibold">
            <input v-model="choices.analytics" type="checkbox">
            Analytics
          </label>
          <label class="inline-flex items-center gap-2 font-semibold">
            <input v-model="choices.marketing" type="checkbox">
            Marketing
          </label>
        </div>
      </div>
      <div class="flex flex-wrap gap-3 md:justify-end">
        <button class="button-secondary" type="button" @click="rejectOptionalCookies">
          Necessary only
        </button>
        <button class="button-secondary" type="button" @click="saveChoices">
          Save choices
        </button>
        <button class="button-primary" type="button" @click="acceptAllCookies">
          Accept all
        </button>
      </div>
    </div>
  </aside>
</template>
