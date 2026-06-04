<script setup lang="ts">
import RichTextRenderer from '~/components/ui/RichTextRenderer.vue'
import MaterialIcon from '~/components/ui/MaterialIcon.vue'
import type { NormalizedModalPage } from '~/types/content'
import type { StoryblokStory } from '~/types/storyblok'
import { storyblokContentSource } from '~/utils/content/storyblok-content-source'
import { normalizeStoryblokStory } from '~/utils/content/storyblok-mappers'
import { getModalPathFromQuery } from '~/utils/modal'

const route = useRoute()
const config = useRuntimeConfig()
const modalNavigation = useModalNavigation()
const bodyScrollLock = useBodyScrollLock()
const modalPanel = ref<HTMLElement | null>(null)
const modalPath = computed(() => getModalPathFromQuery(route.query))
const previousActiveElement = shallowRef<HTMLElement | null>(null)
const modalPage = shallowRef<NormalizedModalPage | null>(null)
const isOpen = computed(() => Boolean(modalPage.value))
let modalRequestId = 0

const loadModalPage = async (path: string) => {
  const requestId = ++modalRequestId

  if (!path) {
    modalPage.value = null
    return
  }

  const page = await storyblokContentSource.getPageBySlug(path)

  if (requestId !== modalRequestId || path !== modalPath.value) {
    return
  }

  modalPage.value = page?.type === 'modal' ? page : null
}

await loadModalPage(modalPath.value)

watch(modalPath, (nextPath) => {
  void loadModalPage(nextPath)
})

const getFocusableElements = () => {
  if (!modalPanel.value) {
    return []
  }

  return Array.from(
    modalPanel.value.querySelectorAll<HTMLElement>(
      [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
      ].join(',')
    )
  ).filter((element) => !element.hasAttribute('disabled'))
}

const focusModal = async () => {
  await nextTick()
  const firstFocusableElement = getFocusableElements()[0]

  ;(firstFocusableElement || modalPanel.value)?.focus()
}

const closeModal = async () => {
  await modalNavigation.closeModal()
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!isOpen.value) {
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    closeModal()
    return
  }

  if (event.key !== 'Tab') {
    return
  }

  const focusableElements = getFocusableElements()

  if (!focusableElements.length) {
    event.preventDefault()
    modalPanel.value?.focus()
    return
  }

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (!firstElement || !lastElement) {
    return
  }

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
    return
  }

  if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}

watch(isOpen, async (nextIsOpen) => {
  if (!import.meta.client) {
    return
  }

  if (nextIsOpen) {
    previousActiveElement.value = document.activeElement as HTMLElement | null
    bodyScrollLock.lock()
    document.addEventListener('keydown', handleKeydown)
    await focusModal()
    return
  }

  bodyScrollLock.unlock()
  document.removeEventListener('keydown', handleKeydown)
  previousActiveElement.value?.focus()
  previousActiveElement.value = null
})

if (import.meta.client && config.public.storyblokEditorMode) {
  const updateModalStory = (event: WindowEventMap['boring-thing:storyblok-input']) => {
    const story = (event.detail as { story?: Partial<StoryblokStory> })?.story

    if (!story?.content || story.content.component !== 'modal') {
      return
    }

    const nextModalPage = normalizeStoryblokStory(
      {
        id: Number(story.id || 0),
        uuid: String(story.uuid || ''),
        name: story.name || modalPage.value?.name || 'Modal',
        slug: story.slug || modalPath.value.replace(/^\/+/, ''),
        full_slug: story.full_slug || modalPath.value.replace(/^\/+/, ''),
        content: story.content,
        created_at: story.created_at,
        published_at: story.published_at,
        first_published_at: story.first_published_at
      },
      {
        homeSlug: config.public.storyblokHomeSlug
      }
    )

    if (nextModalPage.type === 'modal') {
      modalPage.value = nextModalPage
    }
  }

  onMounted(() => {
    window.addEventListener('boring-thing:storyblok-input', updateModalStory)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('boring-thing:storyblok-input', updateModalStory)
  })
}

onBeforeUnmount(() => {
  if (!import.meta.client) {
    return
  }

  bodyScrollLock.unlock()
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="other-modal">
      <div
        v-if="modalPage"
        class="other-modal"
        @click.self="closeModal"
      >   
        <button
          class="other-modal-close"
          type="button"
          aria-label="Close modal"
          @click="closeModal"
        >
          <MaterialIcon name="close" />
        </button>
        <section
          ref="modalPanel"
          class="other-modal-panel"
          role="dialog"
          aria-modal="true"
          :aria-label="modalPage.name"
          tabindex="-1"
        >
          <RichTextRenderer
            v-if="modalPage.copy.nodes.length"
            :rich-text="modalPage.copy"
          />
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
