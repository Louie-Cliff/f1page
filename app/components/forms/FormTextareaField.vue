<script setup lang="ts">
import FormField from '~/components/forms/FormField.vue'

defineProps<{
  modelValue: string
  id?: string
  label: string
  name: string
  error?: string
  hint?: string
  required?: boolean
  placeholder?: string
  rows?: number
}>()

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
      <textarea
        :id="controlId"
        class="other-form-control other-form-textarea"
        :class="{ 'other-form-control--error': invalid }"
        :name="name"
        :value="modelValue"
        :required="required"
        :placeholder="placeholder"
        :rows="rows"
        :aria-describedby="describedBy"
        :aria-invalid="invalid"
        @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      />
    </template>
  </FormField>
</template>
