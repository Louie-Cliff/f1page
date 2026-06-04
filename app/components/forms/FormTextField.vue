<script setup lang="ts">
import FormField from '~/components/forms/FormField.vue'

withDefaults(
  defineProps<{
    modelValue: string
    id?: string
    label: string
    name: string
    type?: string
    error?: string
    hint?: string
    required?: boolean
    autocomplete?: string
    inputmode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url'
    placeholder?: string
  }>(),
  {
    type: 'text'
  }
)

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <FormField
    :id="id"
    :label="label"
    :error="error"
    :hint="hint"
    :required="required"
  >
    <template #default="{ id: controlId, describedBy, invalid }">
      <input
        :id="controlId"
        class="other-form-control"
        :class="{ 'other-form-control--error': invalid }"
        :name="name"
        :type="type"
        :value="modelValue"
        :required="required"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :placeholder="placeholder"
        :aria-describedby="describedBy"
        :aria-invalid="invalid"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      >
    </template>
  </FormField>
</template>
