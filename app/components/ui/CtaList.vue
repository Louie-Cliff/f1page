<script setup lang="ts">
import CtaItem from '~/components/ui/CtaItem.vue'
import type { NormalizedLink, SectionAlign } from '~/types/content'

defineOptions({
  inheritAttrs: false
})

withDefaults(
  defineProps<{
    links?: NormalizedLink[]
    align?: SectionAlign
    as?: 'ul' | 'div'
  }>(),
  {
    links: () => [],
    align: 'center',
    as: 'ul'
  }
)
</script>

<template>
  <component
    :is="as"
    v-if="links.length"
    v-bind="$attrs"
    :class="[
      'flex flex-wrap items-center gap-6 other-cta-list',
      align === 'right' ? 'justify-end' : align === 'left' ? 'justify-start' : 'justify-center',
      as === 'ul' ? 'm-0 list-none p-0' : ''
    ]"
  >
    <template v-if="as === 'ul'">
      <li v-for="link in links" :key="`${link.href}-${link.label}`">
        <CtaItem :link="link" />
      </li>
    </template>
    <template v-else>
      <CtaItem
        v-for="link in links"
        :key="`${link.href}-${link.label}`"
        :link="link"
      />
    </template>
  </component>
</template>
