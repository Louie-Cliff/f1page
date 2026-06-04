<script setup lang="ts">
import OptimizedImage from '~/components/ui/OptimizedImage.vue'
import RichTextEmbeddedBlock from '~/components/richtext/RichTextEmbeddedBlock.vue'
import RichTextInlineRenderer from '~/components/ui/RichTextInlineRenderer.vue'
import type {
  NormalizedRichText,
  NormalizedRichTextInline,
  NormalizedRichTextListItem,
  NormalizedRichTextNode
} from '~/types/content'

defineOptions({
  name: 'RichTextRenderer'
})

defineProps<{
  richText: NormalizedRichText
}>()

const textToInline = (text?: string): NormalizedRichTextInline[] =>
  text ? [{ type: 'text', text }] : []

const nodeInlines = (node: NormalizedRichTextNode) =>
  (node.type === 'heading' || node.type === 'paragraph') && node.children?.length
    ? node.children
    : node.type === 'heading' || node.type === 'paragraph'
      ? textToInline(node.text)
      : []

const listItem = (
  item: string | NormalizedRichTextListItem,
  index: number
): NormalizedRichTextListItem =>
  typeof item === 'string'
    ? {
        id: `legacy-list-item-${index}-${item}`,
        text: item,
        children: textToInline(item)
      }
    : item

const headingTag = (node: NormalizedRichTextNode) => {
  if (node.type !== 'heading') {
    return 'p'
  }

  return `h${node.level}`
}

const alignClass = (node: NormalizedRichTextNode) => {
  if (node.type !== 'heading' && node.type !== 'paragraph') {
    return undefined
  }

  return node.align === 'center'
    ? 'text-center'
    : node.align === 'right'
      ? 'text-right'
      : node.align === 'justify'
        ? 'text-justify'
        : node.align === 'left'
          ? 'text-left'
          : undefined
}
</script>

<template>
  <div class="other-richtext">
    <template v-for="(node, index) in richText.nodes" :key="`${node.type}-${index}`">
      <component
        :is="headingTag(node)"
        v-if="node.type === 'heading'"
        :class="alignClass(node)"
      >
        <RichTextInlineRenderer :inlines="nodeInlines(node)" />
      </component>
      <p v-else-if="node.type === 'paragraph'" :class="alignClass(node)">
        <RichTextInlineRenderer :inlines="nodeInlines(node)" />
      </p>
      <ul v-else-if="node.type === 'list' && node.style === 'unordered'">
        <li
          v-for="(item, itemIndex) in node.items"
          :key="listItem(item, itemIndex).id"
        >
          <RichTextInlineRenderer :inlines="listItem(item, itemIndex).children" />
        </li>
      </ul>
      <ol v-else-if="node.type === 'list' && node.style === 'ordered'">
        <li
          v-for="(item, itemIndex) in node.items"
          :key="listItem(item, itemIndex).id"
        >
          <RichTextInlineRenderer :inlines="listItem(item, itemIndex).children" />
        </li>
      </ol>
      <blockquote v-else-if="node.type === 'quote'">
        <RichTextRenderer :rich-text="{ nodes: node.children }" />
      </blockquote>
      <figure v-else-if="node.type === 'image'">
        <OptimizedImage
          class="w-full"
          :image="node.image"
          sizes="(min-width: 768px) 720px, 100vw"
        />
        <figcaption v-if="node.caption" class="other-caption">{{ node.caption }}</figcaption>
      </figure>
      <template v-else-if="node.type === 'blok'">
        <RichTextEmbeddedBlock
          v-for="block in node.blocks"
          :key="block.id"
          :block="block"
        />
      </template>
      <hr v-else-if="node.type === 'horizontal_rule'">
    </template>
  </div>
</template>
