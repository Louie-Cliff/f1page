import { isReservedModalPath, normalizeModalPath } from '~/utils/modal'

export default defineNuxtPlugin(() => {
  const modalNavigation = useModalNavigation()

  const handleDocumentClick = async (event: MouseEvent) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    const target = event.target

    if (!(target instanceof Element)) {
      return
    }

    const link = target.closest<HTMLAnchorElement>('a[href]')

    if (!link || link.target === '_blank' || link.hasAttribute('download')) {
      return
    }

    const url = new URL(link.href)

    if (url.origin !== window.location.origin) {
      return
    }

    const path = normalizeModalPath(url.pathname)

    const targetPath = `${url.pathname}${url.search}`
    const currentPath = `${window.location.pathname}${window.location.search}`

    if (!path || targetPath === currentPath) {
      return
    }

    event.preventDefault()

    if (isReservedModalPath(path) || (await modalNavigation.isModalStoryPath(path))) {
      await modalNavigation.openModal(path)
      return
    }

    await navigateTo(`${url.pathname}${url.search}${url.hash}`)
  }

  document.addEventListener('click', handleDocumentClick)
})
