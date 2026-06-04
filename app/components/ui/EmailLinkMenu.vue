<script setup lang="ts">
import { getEmailAddressFromHref } from '~/utils/links'

const props = defineProps<{
  href: string
  label: string
  triggerClass?: string | string[] | Record<string, boolean>
  ariaLabel?: string
}>()

const menu = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const openMailLink = ref<HTMLAnchorElement | null>(null)
const isOpen = ref(false)
const copied = ref(false)
const copyFailed = ref(false)
const menuId = useId()
const emailAddress = computed(() => getEmailAddressFromHref(props.href))

const openMenu = async () => {
  isOpen.value = true
  copied.value = false
  copyFailed.value = false
  await nextTick()
  openMailLink.value?.focus()
}

const closeMenu = (restoreFocus = false) => {
  isOpen.value = false
  copied.value = false
  copyFailed.value = false

  if (restoreFocus) {
    trigger.value?.focus()
  }
}

const toggleMenu = () => {
  if (isOpen.value) {
    closeMenu()
    return
  }

  openMenu()
}

const copyEmailAddress = async () => {
  copied.value = false
  copyFailed.value = false

  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error('Clipboard API unavailable')
    }

    await navigator.clipboard.writeText(emailAddress.value)
    copied.value = true
  } catch {
    copyFailed.value = true
  }
}

const handleDocumentClick = (event: MouseEvent) => {
  const target = event.target

  if (target instanceof Node && !menu.value?.contains(target)) {
    closeMenu()
  }
}

const handleDocumentKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeMenu(true)
  }
}

watch(isOpen, (nextIsOpen) => {
  if (!import.meta.client) {
    return
  }

  if (nextIsOpen) {
    document.addEventListener('click', handleDocumentClick)
    document.addEventListener('keydown', handleDocumentKeydown)
    return
  }

  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleDocumentKeydown)
})

onBeforeUnmount(() => {
  if (!import.meta.client) {
    return
  }

  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleDocumentKeydown)
})
</script>

<template>
  <span ref="menu" class="other-email-menu">
    <button
      ref="trigger"
      class="other-email-menu-trigger"
      :class="triggerClass"
      type="button"
      aria-haspopup="dialog"
      :aria-expanded="isOpen"
      :aria-controls="isOpen ? menuId : undefined"
      :aria-label="ariaLabel"
      @click.stop="toggleMenu"
    >
      <slot name="trigger">
        <span class="label">{{ label }}</span>
      </slot>
    </button>

    <div
      v-if="isOpen"
      :id="menuId"
      class="other-email-menu-panel"
      role="dialog"
      :aria-label="`${label} email options`"
      @click.stop
    >
      <p class="other-email-menu-address">{{ emailAddress }}</p>
      <a
        ref="openMailLink"
        class="other-email-menu-action"
        :href="href"
        @click="closeMenu()"
      >
        Open mail app
      </a>
      <button
        class="other-email-menu-action"
        type="button"
        @click="copyEmailAddress"
      >
        Copy email address
      </button>
      <p class="other-email-menu-status" role="status">
        {{
          copied
            ? 'Email address copied.'
            : copyFailed
              ? 'Email address could not be copied.'
              : ''
        }}
      </p>
    </div>
  </span>
</template>
