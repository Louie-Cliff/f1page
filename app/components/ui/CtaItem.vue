<script setup lang="ts">
import EmailLinkMenu from '~/components/ui/EmailLinkMenu.vue'
import MaterialIcon from '~/components/ui/MaterialIcon.vue'
import OptimizedImage from '~/components/ui/OptimizedImage.vue'
import SmartLink from '~/components/ui/SmartLink.vue'
import type { NormalizedLink } from '~/types/content'
import {
  getDefaultLinkIcon,
  getLinkType,
  getSafeTarget
} from '~/utils/links'

const props = defineProps<{
  link: NormalizedLink
}>()

const isImageLink = computed(() => Boolean(props.link.image))
const linkType = computed(() => getLinkType(props.link))
const target = computed(() =>
  getSafeTarget(props.link.href, props.link.target, linkType.value)
)
const isEmail = computed(() => linkType.value === 'email')
const isDownload = computed(() => linkType.value === 'asset')
const iconName = computed(() => {
  const rawIcon = props.link.icon?.trim()

  if (!rawIcon || rawIcon === 'none') {
    return undefined
  }

  return rawIcon === 'default' ? getDefaultLinkIcon(linkType.value) : rawIcon
})
const ctaClass = computed(() => {
  if (isImageLink.value) {
    return 'other-cta-image'
  }

  if (props.link.button === false || props.link.variant === 'text') {
    return 'other-cta-link other-cta-text'
  }

  return props.link.variant === 'secondary'
    ? 'other-cta-button other-cta-button-secondary'
    : 'other-cta-button'
})
const ariaLabel = computed(() => {
  if (isEmail.value) {
    return isImageLink.value ? `${props.link.label} email options` : undefined
  }

  if (isDownload.value) {
    return `Download ${props.link.label} (opens in a new tab)`
  }

  if (target.value === '_blank') {
    return `${props.link.label} (opens in a new tab)`
  }

  return isImageLink.value ? props.link.label : undefined
})

</script>

<template>
  <EmailLinkMenu
    v-if="isEmail"
    :href="link.href"
    :label="link.label"
    :trigger-class="['other-cta', ctaClass]"
    :aria-label="ariaLabel"
  >
    <template #trigger>
      <OptimizedImage
        v-if="link.image"
        class="h-10 w-auto"
        :image="link.image"
        :alt="link.label"
        sizes="160px"
        :widths="[160, 240, 320]"
      />
      <span v-else class="label">{{ link.label }}</span>
      <MaterialIcon v-if="iconName" class="icon" :name="iconName" />
    </template>
  </EmailLinkMenu>
  <SmartLink
    v-else
    class="other-cta"
    :class="ctaClass"
    :href="link.href"
    :target="link.target"
    :type="link.type"
    :action="link.onClick"
    :aria-label="ariaLabel"
    :label="link.label"
  >
    <OptimizedImage
      v-if="link.image"
      class="h-10 w-auto"
      :image="link.image"
      :alt="link.label"
      sizes="160px"
      :widths="[160, 240, 320]"
    />
    <span v-else class="label">{{ link.label }}</span>
    <MaterialIcon v-if="iconName" class="icon" :name="iconName" />
  </SmartLink>
</template>
