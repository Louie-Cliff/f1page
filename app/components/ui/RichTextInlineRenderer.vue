<script setup lang="ts">
import type {
  NormalizedRichTextInline,
  NormalizedRichTextMark
} from '~/types/content'
import EmailLinkMenu from '~/components/ui/EmailLinkMenu.vue'
import SmartLink from '~/components/ui/SmartLink.vue'
import { getLinkType } from '~/utils/links'

defineProps<{
  inlines: NormalizedRichTextInline[]
}>()

const hasMark = (
  inline: NormalizedRichTextInline,
  mark: NormalizedRichTextMark
) => inline.type === 'text' && Boolean(inline.marks?.includes(mark))

const inlineText = (inline: NormalizedRichTextInline): string => {
  if (inline.type === 'text') {
    return inline.text
  }

  if (inline.type === 'hard_break') {
    return ' '
  }

  return inline.children.map(inlineText).join('')
}

const isEmailLink = (inline: NormalizedRichTextInline) =>
  inline.type === 'link' && getLinkType({ href: inline.href }) === 'email'
</script>

<template>
  <template v-for="(inline, index) in inlines" :key="`${inline.type}-${index}`">
    <template v-if="inline.type === 'link'">
      <EmailLinkMenu
        v-if="isEmailLink(inline)"
        :href="inline.href"
        :label="inlineText(inline)"
        trigger-class="other-richtext-link"
      >
        <template #trigger>
          <span class="label">
            <RichTextInlineRenderer :inlines="inline.children" />
          </span>
        </template>
      </EmailLinkMenu>
      <SmartLink
        v-else
        class="other-richtext-link"
        :href="inline.href"
        :target="inline.target"
        :label="inlineText(inline)"
      >
        <span class="label">
          <RichTextInlineRenderer :inlines="inline.children" />
        </span>
      </SmartLink>
    </template>
    <br v-else-if="inline.type === 'hard_break'">
    <code v-else-if="inline.type === 'text' && hasMark(inline, 'code')">
      {{ inline.text }}
    </code>
    <strong
      v-else-if="
        inline.type === 'text' &&
        hasMark(inline, 'bold') &&
        hasMark(inline, 'italic')
      "
    >
      <em>{{ inline.text }}</em>
    </strong>
    <strong v-else-if="inline.type === 'text' && hasMark(inline, 'bold')">
      {{ inline.text }}
    </strong>
    <em v-else-if="inline.type === 'text' && hasMark(inline, 'italic')">
      {{ inline.text }}
    </em>
    <s v-else-if="inline.type === 'text' && hasMark(inline, 'strike')">
      {{ inline.text }}
    </s>
    <span
      v-else-if="inline.type === 'text' && hasMark(inline, 'underline')"
      class="underline underline-offset-2"
    >
      {{ inline.text }}
    </span>
    <template v-else-if="inline.type === 'text'">{{ inline.text }}</template>
  </template>
</template>
