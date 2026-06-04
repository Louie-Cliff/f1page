<script setup lang="ts">
const props = defineProps<{
  id?: string
  label: string
  error?: string
  hint?: string
  required?: boolean
}>()

const fallbackId = useId()
const controlId = computed(() => props.id || fallbackId)
const errorId = computed(() => `${controlId.value}-error`)
const hintId = computed(() => `${controlId.value}-hint`)
const describedBy = computed(() =>
  [
    props.hint ? hintId.value : '',
    props.error ? errorId.value : ''
  ].filter(Boolean).join(' ') || undefined
)
</script>

<template>
  <div
    class="other-form-field"
    :class="{ 'other-form-field--error': Boolean(error) }"
  >
    <label class="other-form-label" :for="controlId">
      <span>{{ label }}</span>
      <span v-if="required" class="other-form-required" aria-hidden="true">*</span>
    </label>

    <slot
      :id="controlId"
      :described-by="describedBy"
      :invalid="Boolean(error)"
    />

    <p v-if="hint" :id="hintId" class="other-form-hint">
      {{ hint }}
    </p>
    <p v-if="error" :id="errorId" class="other-form-error" role="alert">
      {{ error }}
    </p>
  </div>
</template>
