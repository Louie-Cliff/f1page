import type {
  ArticleQueryOptions,
  NormalizedArticleListPage,
  NormalizedArticleSummary
} from '~/types/content'
import { storyblokContentSource } from './storyblok-content-source'

export const resolveArticles = async (
  options: ArticleQueryOptions = {}
): Promise<NormalizedArticleSummary[]> => {
  return await storyblokContentSource.getArticles(options)
}

export const resolveArticlePage = async (
  options: ArticleQueryOptions = {}
): Promise<NormalizedArticleListPage> => {
  return await storyblokContentSource.getArticlePage(options)
}
