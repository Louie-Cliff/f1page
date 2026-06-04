<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    loadingLabel?: string
    loading?: boolean
    disabled?: boolean
  }>(),
  {
    loadingLabel: 'Submitting...',
    loading: false,
    disabled: false
  }
)
</script>

<template>
  <button
    class="other-cta other-cta-button"
    :class="{ 'is-loading': loading }"
    :disabled="disabled || loading"
    type="submit"
  >
    <span class="label">{{ loading ? loadingLabel : label }}</span>
  </button>
</template>
