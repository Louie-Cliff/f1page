import type { StoryblokStoryResponse } from '~/types/storyblok'
import {
  MODAL_QUERY_PARAM,
  isReservedModalPath,
  normalizeModalPath
} from '~/utils/modal'

const modalLinkCache = new Map<string, boolean>()

const getInternalPath = (href: string) => {
  if (!import.meta.client || href.startsWith('#')) {
    return ''
  }

  let url: URL

  try {
    url = new URL(href, window.location.origin)
  } catch {
    return ''
  }

  if (url.origin !== window.location.origin) {
    return ''
  }

  return normalizeModalPath(url.pathname)
}

export const useModalNavigation = () => {
  const route = useRoute()
  const router = useRouter()

  const isModalStoryPath = async (path: string) => {
    if (!path) {
      return false
    }

    if (isReservedModalPath(path)) {
      return true
    }

    const cachedValue = modalLinkCache.get(path)

    if (typeof cachedValue === 'boolean') {
      return cachedValue
    }

    try {
      const response = await $fetch<StoryblokStoryResponse>('/api/storyblok/story', {
        query: {
          slug: path.replace(/^\/+|\/+$/g, '')
        }
      })
      const isModal = response.story?.content?.component === 'modal'

      modalLinkCache.set(path, isModal)
      return isModal
    } catch {
      modalLinkCache.set(path, false)
      return false
    }
  }

  const openModal = async (path: string) => {
    const normalizedPath = normalizeModalPath(path)

    if (!normalizedPath) {
      return
    }

    await router.push({
      path: route.path,
      query: {
        ...route.query,
        [MODAL_QUERY_PARAM]: normalizedPath
      },
      hash: route.hash
    })
  }

  const openIfModal = async (href: string) => {
    const path = getInternalPath(href)

    if (!path || !(await isModalStoryPath(path))) {
      return false
    }

    await openModal(path)
    return true
  }

  const closeModal = async () => {
    const nextQuery = { ...route.query }
    delete nextQuery[MODAL_QUERY_PARAM]

    await router.replace({
      path: route.path,
      query: nextQuery,
      hash: route.hash
    })
  }

  return {
    closeModal,
    isModalStoryPath,
    openIfModal,
    openModal
  }
}
