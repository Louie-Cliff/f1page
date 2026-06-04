import type { LinkType, NormalizedLink } from '~/types/content'
import { isReservedModalPath } from '~/utils/modal'

const assetExtensionPattern =
  /\.(pdf|zip|rar|7z|docx?|xlsx?|pptx?|csv|txt|rtf|mp4|mov|webm|mp3|wav)(\?.*)?(#.*)?$/i

export const isEmailHref = (href: string) => href.startsWith('mailto:')

export const isTelephoneHref = (href: string) => href.startsWith('tel:')

export const isExternalHref = (href: string) => /^(https?:)?\/\//.test(href)

export const isHashHref = (href: string) => href.startsWith('#')

export const isJavaScriptHref = (href: string) => /^javascript:/i.test(href)

export const isAssetHref = (href: string) =>
  assetExtensionPattern.test(href) || /^https?:\/\/a\.storyblok\.com\//i.test(href)

export const getLinkType = (link: Pick<NormalizedLink, 'href' | 'type' | 'onClick'>): LinkType => {
  if (link.onClick || link.type === 'action' || isJavaScriptHref(link.href)) {
    return 'action'
  }

  if (link.type) {
    return link.type
  }

  if (isEmailHref(link.href)) {
    return 'email'
  }

  if (isTelephoneHref(link.href)) {
    return 'telephone'
  }

  if (isHashHref(link.href)) {
    return 'hash'
  }

  if (isReservedModalPath(link.href)) {
    return 'modal'
  }

  if (isAssetHref(link.href)) {
    return 'asset'
  }

  return isExternalHref(link.href) ? 'external' : 'internal'
}

export const getSafeTarget = (
  href: string,
  target?: '_blank' | '_self',
  type: LinkType = getLinkType({ href })
) => {
  if (type === 'asset') {
    return '_blank'
  }

  if (target) {
    return target
  }

  return type === 'external' ? '_blank' : undefined
}

export const getSafeRel = (target?: string) =>
  target === '_blank' ? 'noopener noreferrer' : undefined

export const getEmailAddressFromHref = (href: string) => {
  if (!isEmailHref(href)) {
    return href
  }

  const address = href.replace(/^mailto:/i, '').split('?')[0] || ''

  return decodeURIComponent(address)
}

export const getDefaultLinkIcon = (type: LinkType) => {
  if (type === 'external') {
    return 'open_in_new'
  }

  if (type === 'email') {
    return 'mail'
  }

  if (type === 'asset') {
    return 'download'
  }

  return type === 'internal' || type === 'hash' || type === 'modal'
    ? 'chevron_right'
    : undefined
}
