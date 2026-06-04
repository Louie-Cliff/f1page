<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import MaterialIcon from '~/components/ui/MaterialIcon.vue'
import SmartLink from '~/components/ui/SmartLink.vue'

const props = withDefaults(defineProps<{
  currentPage: number
  totalPages: number
  getPageTo: (page: number) => RouteLocationRaw
  ariaLabel?: string
  scrollTarget?: HTMLElement | null
  scrollKey?: unknown
  scrollBehavior?: ScrollBehavior
}>(), {
  ariaLabel: 'Pagination',
  scrollBehavior: 'smooth'
})

const hasMounted = ref(false)

const paginationItems = computed<Array<number | 'gap'>>(() => {
  const items: Array<number | 'gap'> = []

  for (let page = 1; page <= props.totalPages; page += 1) {
    const isEdgePage = page === 1 || page === props.totalPages
    const isNearCurrentPage = Math.abs(page - props.currentPage) <= 1

    if (isEdgePage || isNearCurrentPage) {
      items.push(page)
    } else if (items.at(-1) !== 'gap') {
      items.push('gap')
    }
  }

  return items
})

const scrollToTarget = async () => {
  if (!props.scrollTarget) {
    return
  }

  await nextTick()
  // Wait for the new paginated content to paint before moving the viewport.
  window.requestAnimationFrame(() => {
    props.scrollTarget?.scrollIntoView({
      behavior: props.scrollBehavior,
      block: 'start'
    })
  })
}

onMounted(() => {
  hasMounted.value = true
})

watch(
  () => props.scrollKey ?? props.currentPage,
  (nextValue, previousValue) => {
    if (!hasMounted.value || nextValue === previousValue) {
      return
    }

    void scrollToTarget()
  }
)
</script>

<template>
  <nav
    v-if="totalPages > 1"
    class="other-pagination"
    :aria-label="ariaLabel"
  >
    <SmartLink
      v-if="currentPage > 1"
      :to="getPageTo(currentPage - 1)"
      class="other-pagination-button other-pagination-button-icon"
      disable-active-class
      aria-label="Go to previous page"
    >
      <MaterialIcon class="icon" name="chevron_left" />
    </SmartLink>
    <span
      v-else
      class="other-pagination-button other-pagination-button-icon other-pagination-button-disabled"
      aria-disabled="true"
    >
      <MaterialIcon class="icon" name="chevron_left" />
    </span>
    <template
      v-for="(item, index) in paginationItems"
      :key="`${item}-${index}`"
    >
      <span
        v-if="item === 'gap'"
        class="other-pagination-gap"
        aria-hidden="true"
      >
        ...
      </span>
      <SmartLink
        v-else
        :to="getPageTo(item)"
        class="other-pagination-button"
        :class="{ 'other-pagination-button-active': item === currentPage }"
        disable-active-class
        :aria-current="item === currentPage ? 'page' : undefined"
        :aria-label="`Go to page ${item}`"
      >
        {{ item }}
      </SmartLink>
    </template>
    <SmartLink
      v-if="currentPage < totalPages"
      :to="getPageTo(currentPage + 1)"
      class="other-pagination-button other-pagination-button-icon"
      disable-active-class
      aria-label="Go to next page"
    >
      <MaterialIcon class="icon" name="chevron_right" />
    </SmartLink>
    <span
      v-else
      class="other-pagination-button other-pagination-button-icon other-pagination-button-disabled"
      aria-disabled="true"
    >
      <MaterialIcon class="icon" name="chevron_right" />
    </span>
  </nav>
</template>
