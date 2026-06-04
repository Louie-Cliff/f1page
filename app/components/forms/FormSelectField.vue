<script setup lang="ts">
import FormField from '~/components/forms/FormField.vue'
import MaterialIcon from '../ui/MaterialIcon.vue';

type SelectOption = string | {
  label: string
  value: string
}

const props = defineProps<{
  modelValue: string
  id?: string
  label: string
  name: string
  options: SelectOption[]
  error?: string
  hint?: string
  required?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const menu = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const optionRefs = ref<HTMLButtonElement[]>([])
const isOpen = ref(false)
const activeIndex = ref(0)
const listboxId = useId()

const normalizedOptions = computed(() =>
  props.options.map((option) =>
    typeof option === 'string'
      ? { label: option, value: option }
      : option
  )
)
const selectedIndex = computed(() =>
  Math.max(normalizedOptions.value.findIndex((option) => option.value === props.modelValue), 0)
)
const selectedOption = computed(() => normalizedOptions.value[selectedIndex.value])

const setOptionRef = (element: HTMLButtonElement | null, index: number) => {
  if (element) {
    optionRefs.value[index] = element
  }
}

const focusOption = async (index: number) => {
  activeIndex.value = Math.max(0, Math.min(index, normalizedOptions.value.length - 1))
  await nextTick()
  optionRefs.value[activeIndex.value]?.focus()
}

const openMenu = async () => {
  isOpen.value = true
  await focusOption(selectedIndex.value)
}

const closeMenu = (restoreFocus = false) => {
  isOpen.value = false

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

const selectOption = (value: string) => {
  emit('update:modelValue', value)
  closeMenu(true)
}

const handleTriggerKeydown = (event: KeyboardEvent) => {
  if (['ArrowDown', 'Enter', ' '].includes(event.key)) {
    event.preventDefault()
    openMenu()
  }
}

const handleOptionKeydown = (event: KeyboardEvent, index: number) => {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeMenu(true)
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    focusOption(index + 1)
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    focusOption(index - 1)
  }
}

const handleDocumentClick = (event: MouseEvent) => {
  const target = event.target

  if (target instanceof Node && !menu.value?.contains(target)) {
    closeMenu()
  }
}

watch(isOpen, (nextIsOpen) => {
  if (!import.meta.client) {
    return
  }

  if (nextIsOpen) {
    document.addEventListener('click', handleDocumentClick)
    return
  }

  document.removeEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
  if (!import.meta.client) {
    return
  }

  document.removeEventListener('click', handleDocumentClick)
})
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
      <div ref="menu" class="other-form-select2">
        <input :name="name" :value="modelValue" type="hidden">
        <button
          :id="controlId"
          ref="trigger"
          class="other-form-control other-form-select-trigger"
          :class="{ 'other-form-control--error': invalid }"
          type="button"
          aria-haspopup="listbox"
          :aria-expanded="isOpen"
          :aria-controls="isOpen ? listboxId : undefined"
          :aria-describedby="describedBy"
          :aria-invalid="invalid"
          @click.stop="toggleMenu"
          @keydown="handleTriggerKeydown"
        >
          <span>{{ selectedOption?.label || 'Choose an option' }}</span>
          <MaterialIcon class="other-form-select-icon" :name="isOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'" />
        </button>

        <ul
          v-if="isOpen"
          :id="listboxId"
          class="other-form-select-panel"
          role="listbox"
          :aria-labelledby="controlId"
          @click.stop
        >
          <li
            v-for="(option, index) in normalizedOptions"
            :key="option.value"
            role="presentation"
          >
            <button
              :ref="(element) => setOptionRef(element as HTMLButtonElement | null, index)"
              class="other-form-select-option"
              :class="{ 'is-selected': option.value === modelValue }"
              type="button"
              role="option"
              :aria-selected="option.value === modelValue"
              @click="selectOption(option.value)"
              @keydown="handleOptionKeydown($event, index)"
            >
              {{ option.label }}
            </button>
          </li>
        </ul>
      </div>
    </template>
  </FormField>
</template>
