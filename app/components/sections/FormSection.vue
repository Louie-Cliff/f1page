<script setup lang="ts">
import FormSelectField from '~/components/forms/FormSelectField.vue'
import FormSubmitButton from '~/components/forms/FormSubmitButton.vue'
import FormTextareaField from '~/components/forms/FormTextareaField.vue'
import FormTextField from '~/components/forms/FormTextField.vue'
import RichTextRenderer from '~/components/ui/RichTextRenderer.vue'
import type { FormSection } from '~/types/content'
import { getThemeClasses } from '~/utils/theme'

type ContactFormErrors = Partial<
  Record<'name' | 'email' | 'subject' | 'message' | 'form', string>
>
type ContactFormField = Exclude<keyof ContactFormErrors, 'form'>

const props = defineProps<{
  section: FormSection
}>()

const defaultSubject = 'General Enquiries'
const subjectOptions = [defaultSubject, 'New Business', 'Tech Support']
const form = reactive({
  name: '',
  email: '',
  subject: defaultSubject,
  message: '',
  website: '',
  startedAt: Date.now()
})
const errors = reactive<ContactFormErrors>({})
const isSubmitting = ref(false)
const submitted = ref(false)
const validators: Record<ContactFormField, () => string | null> = {
  name: () => form.name.trim().length < 2 ? 'Enter your name.' : null,
  email: () =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
      ? null
      : 'Enter a valid email address.',
  subject: () =>
    subjectOptions.includes(form.subject) ? null : 'Choose a valid subject.',
  message: () =>
    form.message.trim().length < 10
      ? 'Enter a message of at least 10 characters.'
      : null
}

const clearErrors = () => {
  for (const key of Object.keys(errors) as Array<keyof ContactFormErrors>) {
    delete errors[key]
  }
}

const setErrors = (nextErrors: ContactFormErrors) => {
  clearErrors()
  Object.assign(errors, nextErrors)
}

const validateField = (field: ContactFormField) => validators[field]()

const clearFieldErrorWhenValid = (field: ContactFormField) => {
  if (!errors[field]) {
    return
  }

  const nextError = validateField(field)

  if (!nextError) {
    delete errors[field]
  }
}

const validateClient = () => {
  const nextErrors: ContactFormErrors = {}

  for (const field of Object.keys(validators) as ContactFormField[]) {
    const fieldError = validateField(field)

    if (fieldError) {
      nextErrors[field] = fieldError
    }
  }

  setErrors(nextErrors)
  return !Object.keys(nextErrors).length
}

const resetForm = () => {
  form.name = ''
  form.email = ''
  form.subject = defaultSubject
  form.message = ''
  form.website = ''
  form.startedAt = Date.now()
}

const submitForm = async () => {
  submitted.value = false

  if (!validateClient()) {
    return
  }

  isSubmitting.value = true

  try {
    const response = await $fetch<{ ok: boolean; redirectTo?: string }>('/api/contact', {
      method: 'POST',
      body: {
        ...form,
        thanksPath: props.section.thanksPath
      }
    })

    if (response.redirectTo) {
      await navigateTo(response.redirectTo)
      return
    }

    submitted.value = true
    resetForm()
    clearErrors()
  } catch (error) {
    const serverErrors =
      (error as { data?: { data?: { errors?: ContactFormErrors } } })?.data?.data
        ?.errors || {
        form: 'Your message could not be sent. Please try again.'
      }

    setErrors(serverErrors)
    form.startedAt = Date.now()
  } finally {
    isSubmitting.value = false
  }
}

watch(() => form.name, () => clearFieldErrorWhenValid('name'))
watch(() => form.email, () => clearFieldErrorWhenValid('email'))
watch(() => form.subject, () => clearFieldErrorWhenValid('subject'))
watch(() => form.message, () => clearFieldErrorWhenValid('message'))
</script>

<template>
  <section class="other-section" :class="getThemeClasses(section.theme)">
      <div class="container flex flex-col items-center justify-center gap-6 other-container">
          <RichTextRenderer
            v-if="section.copy.nodes.length"
            class="w-2/3 text-center"
            :rich-text="section.copy"
          />
        <form
          class="grid w-full gap-4 md:w-1/2"
          novalidate
          @submit.prevent="submitForm"
        >
          <p
            v-if="errors.form"
            id="contact-form-error"
            class="rounded-md border border-house-error/40 bg-house-error-surface p-3 text-sm font-semibold text-house-text"
            role="alert"
          >
            {{ errors.form }}
          </p>

          <FormTextField
            id="contact-name"
            v-model="form.name"
            label="Name"
            name="name"
            autocomplete="name"
            required
            :error="errors.name"
          />

          <FormTextField
            id="contact-email"
            v-model="form.email"
            label="Email"
            name="email"
            type="email"
            autocomplete="email"
            inputmode="email"
            required
            :error="errors.email"
          />

          <FormSelectField
            id="contact-subject"
            v-model="form.subject"
            label="Subject"
            name="subject"
            :options="subjectOptions"
            required
            :error="errors.subject"
          />

          <FormTextareaField
            id="contact-message"
            v-model="form.message"
            label="Message"
            name="message"
            required
            :error="errors.message"
          />

          <label class="sr-only" for="contact-website">
            Website
            <input
              id="contact-website"
              v-model="form.website"
              autocomplete="off"
              name="website"
              tabindex="-1"
              type="text"
            >
          </label>

          <FormSubmitButton
            :label="section.submitLabel || 'Send message'"
            loading-label="Sending..."
            :loading="isSubmitting"
          />

          <p v-if="submitted" class="text-sm font-semibold text-house-success" role="status">
            Thanks, your message has been sent.
          </p>
        </form>
    </div>
  </section>
</template>
