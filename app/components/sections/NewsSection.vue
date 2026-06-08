<script setup lang="ts">
import NewsCard from '~/components/cards/NewsCard.vue'

import BasePagination from '~/components/ui/BasePagination.vue'
import RichTextRenderer from '~/components/ui/RichTextRenderer.vue'
import type { NewsSection } from '~/types/content'
import { resolveArticlePage } from '~/utils/content/resolve-articles'
import { getGridColumnClasses } from '~/utils/grid-columns'
import { getGridImageSizes } from '~/utils/image-sizes'
import { getThemeClasses } from '~/utils/theme'

const props = defineProps<{
  section: NewsSection
}>()

const newsPageQuery = 'p'
const route = useRoute()
const sectionElement = ref<HTMLElement | null>(null)

const isPaginatedNews = computed(() => props.section.mode === 'all')
const articlesPerPage = computed(() => Math.max(Number(props.section.articles) || 6, 1))
const currentPage = computed(() => {
  if (!isPaginatedNews.value) {
    return 1
  }

  const rawPage = route.query[newsPageQuery]
  const page = Number(Array.isArray(rawPage) ? rawPage[0] : rawPage)

  return Number.isFinite(page) && page > 1 ? Math.floor(page) : 1
})

const { data: articlePage } = await useAsyncData(
  () =>
    `news-section-${props.section.id}-${props.section.mode}-${articlesPerPage.value}-${currentPage.value}`,
  () =>
    resolveArticlePage({
      featured: props.section.mode === 'featured',
      limit: articlesPerPage.value,
      page: currentPage.value
    }),
  {
    watch: [articlesPerPage, currentPage]
  }
)

const articles = computed(() => articlePage.value?.articles || [])
const totalPages = computed(() =>
  isPaginatedNews.value ? articlePage.value?.totalPages || 1 : 1
)
const showPagination = computed(() => isPaginatedNews.value && totalPages.value > 1)
const articlePageNumber = computed(() => articlePage.value?.page)

const getPageTo = (page: number) => {
  const query = { ...route.query }

  if (page <= 1) {
    delete query[newsPageQuery]
  } else {
    query[newsPageQuery] = String(page)
  }

  return {
    path: route.path,
    query
  }
}

const articleImageSizes = getGridImageSizes()
</script>

<template>
  <section
    ref="sectionElement"
    class="other-section"
    :class="getThemeClasses(section.theme)"
  >
    <div class="container flex flex-col items-center justify-center gap-6 other-container">
      <RichTextRenderer v-if="section.copy.nodes.length" :rich-text="section.copy" class="max-w-3xl text-center" />
      <div
        v-if="articles?.length"
        class="grid gap-6"
        :class="getGridColumnClasses()"
      >
        <NewsCard
          v-for="article in articles"
          :key="article.id"
          :card="article"
          :image-sizes="articleImageSizes"
        />
      </div>
      <p
        v-else
        class="mt-8 rounded-lg border border-house-border bg-house-surface p-5 text-sm text-house-text-muted"
      >
        No {{ section.mode }} articles are available yet.
      </p>
      <BasePagination
        v-if="showPagination"
        :current-page="currentPage"
        :total-pages="totalPages"
        :get-page-to="getPageTo"
        :scroll-target="sectionElement"
        :scroll-key="articlePageNumber"
        aria-label="News pagination"
      />
    </div>
  </section>
</template>
