import type {
  GalleryCard,
  NormalizedArticleSummary,
  NormalizedGameSummary,
  NormalizedImage,
  NormalizedLink,
  NormalizedNavigationItem,
  NormalizedPage,
  NormalizedSection,
  NormalizedSiteSettings,
  NormalizedStoryblokEditable,
  SectionCard,
  SectionAlign,
  GridColumnsValue,
  TestimonialCard,
  LinkType
} from '~/types/content'
import type {
  StoryblokAsset,
  StoryblokBlok,
  StoryblokLink,
  StoryblokSeoPlugin,
  StoryblokStory
} from '~/types/storyblok'
import {
  createUnknownSection,
  normalizeSections
} from './section-normalization'
import { normalizeStoryblokCopy } from './storyblok-richtext'
import { isReservedModalPath } from '~/utils/modal'

type NormalizeStoryOptions = {
  homeSlug?: string
}

const asString = (value: unknown) => (typeof value === 'string' ? value : '')

const asNumber = (value: unknown, fallback: number) =>
  typeof value === 'number' ? value : Number(value) || fallback

const normalizeAlign = (value: unknown): SectionAlign | undefined => {
  const align = asString(value)

  return ['default', 'left', 'center', 'right'].includes(align)
    ? (align as SectionAlign)
    : undefined
}

const normalizeColumnsValue = (value: unknown): GridColumnsValue | undefined =>
  typeof value === 'number' ||
  typeof value === 'string' ||
  Array.isArray(value) ||
  (value && typeof value === 'object')
    ? (value as GridColumnsValue)
    : undefined

const asBoolean = (value: unknown, fallback: boolean) =>
  typeof value === 'boolean'
    ? value
    : value === 'true'
      ? true
      : value === 'false'
        ? false
        : fallback

const asBlocks = (value: unknown): StoryblokBlok[] =>
  Array.isArray(value) ? (value as StoryblokBlok[]) : []

const asAsset = (value: unknown): StoryblokAsset | undefined => {
  if (!value || typeof value !== 'object') {
    return undefined
  }

  const asset = value as StoryblokAsset

  return asset.filename ? asset : undefined
}

const asSeo = (value: unknown): StoryblokSeoPlugin =>
  value && typeof value === 'object' ? (value as StoryblokSeoPlugin) : {}

const decodeEditableJson = (value: string) =>
  value
    .replaceAll('&quot;', '"')
    .replaceAll('&amp;', '&')
    .replaceAll('&#34;', '"')
    .replaceAll('&#39;', "'")

const normalizeStoryblokEditable = (
  blok: StoryblokBlok
): NormalizedStoryblokEditable | undefined => {
  const editable = asString(blok._editable)

  if (!editable) {
    return undefined
  }

  const json = decodeEditableJson(
    editable.replace(/^<!--#storyblok#/, '').replace(/-->$/, '')
  )

  try {
    const parsed = JSON.parse(json) as { id?: number | string; uid?: string }

    if (!parsed.id || !parsed.uid) {
      return undefined
    }

    return {
      dataBlokC: JSON.stringify(parsed),
      dataBlokUid: `${parsed.id}-${parsed.uid}`
    }
  } catch {
    return undefined
  }
}

const isPresent = <T>(value: T | null | undefined): value is T => Boolean(value)

const assetDimensionsFromFilename = (filename: string) => {
  const dimensions = filename.match(/\/(\d+)x(\d+)\//)

  if (!dimensions) {
    return {}
  }

  return {
    width: Number(dimensions[1]),
    height: Number(dimensions[2])
  }
}

export const normalizeStoryblokAsset = (
  asset?: StoryblokAsset
): NormalizedImage | undefined => {
  if (!asset?.filename) {
    return undefined
  }

  return {
    src: asset.filename,
    alt: asset.alt || asset.meta_data?.alt || asset.name || '',
    title: asset.title || asset.meta_data?.title || asset.name,
    focalPoint: asset.focus,
    ...assetDimensionsFromFilename(asset.filename)
  }
}

const normalizeStoryblokSeo = (seo: StoryblokSeoPlugin, seoImage?: StoryblokAsset) => {
  const ogImage = seo.og_image
    ? {
        src: seo.og_image,
        alt: seo.og_title || seo.title || ''
      }
    : normalizeStoryblokAsset(seoImage)

  return {
    title: seo.title,
    description: seo.description,
    ogTitle: seo.og_title || seo.twitter_title,
    ogDescription: seo.og_description || seo.twitter_description,
    ogImage,
    noIndex: Boolean(seo.no_index)
  }
}

export const normalizeStoryblokLinkUrl = (link?: StoryblokLink) => {
  if (!link) {
    return ''
  }

  if (link.linktype === 'email' && link.email) {
    return `mailto:${link.email}`
  }

  const rawUrl = link.url || link.cached_url || ''
  const urlWithAnchor = link.anchor ? `${rawUrl}#${link.anchor}` : rawUrl

  if (!urlWithAnchor) {
    return ''
  }

  if (link.linktype === 'story' && !urlWithAnchor.startsWith('/')) {
    return `/${urlWithAnchor}`
  }

  return urlWithAnchor
}

const normalizeStoryblokLinkType = (link?: StoryblokLink): LinkType | undefined => {
  if (!link?.linktype) {
    return undefined
  }

  if (link.linktype === 'story') {
    const href = normalizeStoryblokLinkUrl(link)

    if (isReservedModalPath(href)) {
      return 'modal'
    }

    return link.anchor && !link.cached_url && !link.url ? 'hash' : 'internal'
  }

  if (link.linktype === 'email') {
    return 'email'
  }

  if (link.linktype === 'asset') {
    return 'asset'
  }

  return link.linktype === 'url' ? 'external' : undefined
}

const normalizeStoryReference = (value: unknown) => {
  if (typeof value === 'string') {
    return value
  }

  if (!value || typeof value !== 'object') {
    return ''
  }

  const reference = value as StoryblokLink
  const slug = reference.cached_url || reference.full_slug || reference.url

  if (slug) {
    return slug.startsWith('/') ? slug : `/${slug.replace(/^\/+|\/+$/g, '')}`
  }

  return reference.uuid || reference.id || ''
}

export const normalizeStoryblokCta = (blok: StoryblokBlok): NormalizedLink | null => {
  const link = blok.link as StoryblokLink | undefined
  const image = normalizeStoryblokAsset(asAsset(blok.image))
  const label = image?.alt || asString(blok.label)
  const href = normalizeStoryblokLinkUrl(link)
  const button = asBoolean(blok.button, true)
  const icon = asString(blok.icon)

  if (!label || !href) {
    return null
  }

  return {
    label,
    href,
    target: link?.target,
    type: normalizeStoryblokLinkType(link),
    variant: button ? 'primary' : 'text',
    icon: icon && icon !== 'none' ? icon : undefined,
    button,
    image
  }
}

export const normalizeStoryblokCtas = (value: unknown): NormalizedLink[] =>
  asBlocks(value).map(normalizeStoryblokCta).filter(isPresent)

const normalizeNavigationItem = (blok: StoryblokBlok): NormalizedNavigationItem | null => {
  const id = blok._uid || crypto.randomUUID()
  const label =
    asString(blok.label) ||
    asString(blok.title) ||
    asString(blok.name) ||
    asString(blok.text)
  const storyblokLink = blok.link || blok.url || blok.page
  const href =
    typeof storyblokLink === 'string'
      ? storyblokLink
      : normalizeStoryblokLinkUrl(storyblokLink as StoryblokLink)

  if (!label || !href) {
    return null
  }

  return {
    id,
    label,
    href,
    target: (storyblokLink as StoryblokLink | undefined)?.target
  }
}

const normalizeInstanceMedia = (blok: StoryblokBlok): GalleryCard | null => {
  const image = normalizeStoryblokAsset(asAsset(blok.image))
  const video = asString(blok.video) || undefined

  if (!image && !video) {
    return null
  }

  return {
    id: blok._uid || `${image?.src || video}`,
    image,
    video
  }
}

const normalizeContentCard = (blok: StoryblokBlok): SectionCard | null => {
  const image = normalizeStoryblokAsset(asAsset(blok.image))
  const video = asString(blok.video) || undefined
  const title =
    asString(blok.title) ||
    asString(blok.name) ||
    asString(blok.label) ||
    undefined
  const copy = normalizeStoryblokCopy(blok.copy, blok.biography)
  const links = normalizeStoryblokCtas(blok.ctas)
  const href = normalizeStoryReference(blok.story || blok.link) || undefined

  if (!title && !image && !video && !copy.nodes.length && !href) {
    return null
  }

  return {
    id: blok._uid || title || image?.src || video || href || crypto.randomUUID(),
    title,
    subtitle: asString(blok.subtitle) || undefined,
    copy: copy.nodes.length ? copy : undefined,
    image,
    video,
    name: asString(blok.name) || undefined,
    role: asString(blok.role) || undefined,
    quote: asString(blok.quote) || undefined,
    align: normalizeAlign(blok.align),
    links: links.length ? links : undefined,
    href
  }
}

const normalizeStoryReferenceCard = (value: unknown): SectionCard | null => {
  const href = normalizeStoryReference(value)

  if (!href) {
    return null
  }

  return {
    id: href,
    title: href.replace(/^\/+/, ''),
    href
  }
}

const normalizeContentItems = (value: unknown) =>
  Array.isArray(value)
    ? value
        .map((item) =>
          item && typeof item === 'object'
            ? normalizeContentCard(item as StoryblokBlok)
            : normalizeStoryReferenceCard(item)
        )
        .filter(isPresent)
    : []

const normalizeStoryReferences = (value: unknown) =>
  Array.isArray(value)
    ? value
        .map((item) => normalizeStoryReference(item))
        .filter((reference) => Boolean(reference))
    : []

const normalizeTestimonialCard = (blok: StoryblokBlok): TestimonialCard | null => {
  const quote = asString(blok.quote)
  const name = asString(blok.name)

  if (!quote || !name) {
    return null
  }

  return {
    id: blok._uid || `${name}-${quote}`,
    quote,
    name,
    role: asString(blok.role) || undefined,
    image: normalizeStoryblokAsset(asAsset(blok.image))
  }
}

const normalizeStoryblokSection = (blok: StoryblokBlok): NormalizedSection => {
  const id = blok._uid || crypto.randomUUID()
  const component = asString(blok.component)
  const theme = asString(blok.theme) || undefined
  const storyblok = normalizeStoryblokEditable(blok)
  const withStoryblokEditable = <T extends NormalizedSection>(section: T): T =>
    storyblok
      ? {
          ...section,
          storyblok
        }
      : section

  if (component === 'hero_section') {
    const ctas = normalizeStoryblokCtas(blok.ctas)

    return withStoryblokEditable({
      id,
      type: 'hero_section',
      copy: normalizeStoryblokCopy(blok.copy),
      video: asString(blok.video) || undefined,
      image: normalizeStoryblokAsset(asAsset(blok.image)),
      links: ctas,
      theme
    })
  }

  if (component === 'accordion_section') {
    return withStoryblokEditable({
      id,
      type: 'accordion_section',
      copy: normalizeStoryblokCopy(blok.copy),
      cards: normalizeContentItems(blok.items),
      theme
    })
  }

  if (component === 'cards_section') {
    return withStoryblokEditable({
      id,
      type: 'cards_section',
      copy: normalizeStoryblokCopy(blok.copy),
      cards: normalizeContentItems(blok.items),
      columns: normalizeColumnsValue(blok.columns),
      theme
    })
  }

  if (component === 'feature_section') {
    return withStoryblokEditable({
      id,
      type: 'feature_section',
      copy: normalizeStoryblokCopy(blok.copy),
      image: normalizeStoryblokAsset(asAsset(blok.image)),
      align: normalizeAlign(blok.align),
      theme
    })
  }

  if (component === 'form_section') {
    return withStoryblokEditable({
      id,
      type: 'form_section',
      copy: normalizeStoryblokCopy(blok.copy),
      submitLabel: asString(blok.button_label) || undefined,
      thanksPath: normalizeStoryReference(blok.thanks) || undefined,
      theme
    })
  }

  if (component === 'gallery_section') {
    return withStoryblokEditable({
      id,
      type: 'gallery_section',
      copy: normalizeStoryblokCopy(blok.copy),
      cards: asBlocks(blok.items).map(normalizeInstanceMedia).filter(isPresent),
      theme
    })
  }

  if (component === 'games_section') {
    return withStoryblokEditable({
      id,
      type: 'games_section',
      copy: normalizeStoryblokCopy(blok.copy),
      games: normalizeStoryReferences(blok.items),
      theme
    })
  }

  if (component === 'leaderboard_section') {
    return withStoryblokEditable({
      id,
      type: 'leaderboard_section',
      copy: normalizeStoryblokCopy(blok.copy),
      csv: asString(blok.csv) || undefined,
      theme
    })
  }

  if (component === 'media_section') {
    return withStoryblokEditable({
      id,
      type: 'media_section',
      image: normalizeStoryblokAsset(asAsset(blok.image)),
      video: asString(blok.video) || undefined,
      videoControls: asBoolean(blok.video_controls, true),
      videoAutoplay: asBoolean(blok.video_autoplay, false),
      caption: asString(blok.caption) || undefined,
      size: asString(blok.size) || undefined,
      theme
    })
  }

  if (component === 'news_section') {
    const mode = asString(blok.type) === 'featured' ? 'featured' : 'all'

    return withStoryblokEditable({
      id,
      type: 'news_section',
      copy: normalizeStoryblokCopy(blok.copy),
      mode,
      articles: asNumber(blok.articles, 3),
      theme
    })
  }

  if (component === 'richtext_section') {
    return withStoryblokEditable({
      id,
      type: 'richtext_section',
      copy: normalizeStoryblokCopy(blok.copy),
      theme
    })
  }

  if (component === 'spotlight_section') {
    const ctas = normalizeStoryblokCtas(blok.ctas)

    return withStoryblokEditable({
      id,
      type: 'spotlight_section',
      label: asString(blok.label) || undefined,
      title: asString(blok.title) || undefined,
      copy: normalizeStoryblokCopy(blok.copy),
      image: normalizeStoryblokAsset(asAsset(blok.image)),
      storyPath: normalizeStoryReference(blok.story) || undefined,
      links: ctas,
      theme
    })
  }

  if (component === 'testimonials_section') {
    return withStoryblokEditable({
      id,
      type: 'testimonials_section',
      copy: normalizeStoryblokCopy(blok.copy),
      cards: asBlocks(blok.items).map(normalizeTestimonialCard).filter(isPresent),
      theme
    })
  }

  if (component === 'timeline_section') {
    return withStoryblokEditable({
      id,
      type: 'timeline_section',
      copy: normalizeStoryblokCopy(blok.copy),
      cards: normalizeContentItems(blok.items),
      theme
    })
  }

  return withStoryblokEditable(createUnknownSection(component || 'missing_section_type', id))
}

const storyPathFromFullSlug = (fullSlug: string, homeSlug = 'home') => {
  const normalizedSlug = fullSlug.replace(/^\/+|\/+$/g, '')

  return normalizedSlug === homeSlug ? '' : normalizedSlug
}

const storyUrlPathFromFullSlug = (fullSlug: string, homeSlug = 'home') => {
  const slug = storyPathFromFullSlug(fullSlug, homeSlug)

  return slug ? `/${slug}` : '/'
}

export const normalizeStoryblokArticleSummary = (
  story: StoryblokStory,
  options: NormalizeStoryOptions = {}
): NormalizedArticleSummary => {
  const content = story.content
  const seo = normalizeStoryblokSeo(asSeo(content.seo), asAsset(content.seo_image))
  const excerpt = normalizeStoryblokCopy(
    content.summary,
    content.excerpt,
    content.preview,
    seo.description
  )

  return {
    id: story.uuid || String(story.id),
    slug: storyPathFromFullSlug(story.full_slug, options.homeSlug),
    path: storyUrlPathFromFullSlug(story.full_slug, options.homeSlug),
    title: asString(content.title) || story.name,
    featured: asBoolean(content.featured, false),
    date:
      asString(content.date) ||
      story.first_published_at ||
      story.published_at ||
      story.created_at ||
      '',
    excerpt: excerpt.nodes.length ? excerpt : undefined,
    image: normalizeStoryblokAsset(asAsset(content.image))
  }
}

export const normalizeStoryblokGameSummary = (
  story: StoryblokStory,
  options: NormalizeStoryOptions = {}
): NormalizedGameSummary => {
  const content = story.content
  const seo = normalizeStoryblokSeo(asSeo(content.seo), asAsset(content.seo_image))
  const summary =
    asString(content.summary) ||
    asString(content.description) ||
    seo.description ||
    undefined

  return {
    id: story.uuid || String(story.id),
    slug: storyPathFromFullSlug(story.full_slug, options.homeSlug),
    path: storyUrlPathFromFullSlug(story.full_slug, options.homeSlug),
    title: asString(content.title) || story.name,
    summary,
    gameType: asString(content.type) || undefined,
    status: asString(content.status) || undefined,
    date:
      asString(content.date) ||
      story.first_published_at ||
      story.published_at ||
      story.created_at ||
      '',
    image: normalizeStoryblokAsset(asAsset(content.image)),
    icon: normalizeStoryblokAsset(asAsset(content.icon))
  }
}

export const normalizeStoryblokStory = (
  story: StoryblokStory,
  options: NormalizeStoryOptions = {}
): NormalizedPage => {
  const content = story.content
  const component = asString(content.component)
  const seoImage = asAsset(content.seo_image)
  const seo = normalizeStoryblokSeo(asSeo(content.seo), seoImage)
  const slug = storyPathFromFullSlug(story.full_slug, options.homeSlug)

  if (component === 'article') {
    return {
      type: 'article',
      slug,
      name: story.name,
      title: asString(content.title) || story.name,
      date:
        asString(content.date) ||
        story.first_published_at ||
        story.published_at ||
        story.created_at ||
        '',
      article: normalizeStoryblokCopy(content.article),
      image: normalizeStoryblokAsset(asAsset(content.image)),
      seo,
      seoImage: normalizeStoryblokAsset(seoImage)
    }
  }

  if (component === 'game') {
    return {
      type: 'game',
      slug,
      name: story.name,
      title: asString(content.title) || story.name,
      summary: asString(content.summary) || asString(content.description) || undefined,
      gameType: asString(content.type) || undefined,
      status: asString(content.status) || undefined,
      date:
        asString(content.date) ||
        story.first_published_at ||
        story.published_at ||
        story.created_at ||
        '',
      image: normalizeStoryblokAsset(asAsset(content.image)),
      icon: normalizeStoryblokAsset(asAsset(content.icon)),
      seo,
      seoImage: normalizeStoryblokAsset(seoImage)
    }
  }

  if (component === 'modal') {
    return {
      type: 'modal',
      slug,
      name: story.name,
      copy: normalizeStoryblokCopy(content.copy),
      seo: {
        noIndex: true
      },
      seoImage: undefined
    }
  }

  return {
    type: 'page',
    slug,
    name: story.name,
    sections: normalizeSections(asBlocks(content.body).map(normalizeStoryblokSection)),
    seo,
    seoImage: normalizeStoryblokAsset(seoImage)
  }
}

export const normalizeStoryblokSiteSettings = (
  story: StoryblokStory,
  options: NormalizeStoryOptions = {}
): NormalizedSiteSettings | null => {
  const content = story.content
  const component = asString(content.component)

  if (component !== 'site-settings' && component !== 'site_settings') {
    return null
  }

  const seoImage = asAsset(content.seo_image)
  const navigationBlocks = asBlocks(content.navigation)
  const navigation = navigationBlocks
    .map(normalizeNavigationItem)
    .filter(isPresent)

  if (navigationBlocks.length && navigationBlocks.length !== navigation.length) {
    throw new Error(
      'Storyblok site-settings navigation contains an invalid item. Each navigation item needs a label and link.'
    )
  }

  if (!navigation.length) {
    throw new Error(
      'Storyblok site-settings navigation is required and must contain at least one valid item.'
    )
  }

  return {
    type: 'site-settings',
    slug: storyPathFromFullSlug(story.full_slug, options.homeSlug),
    name: story.name,
    siteName: asString(content.site_name) || asString(content.name) || story.name,
    logo: normalizeStoryblokAsset(asAsset(content.logo)),
    icon: normalizeStoryblokAsset(asAsset(content.icon)),
    domain: asString(content.domain) || undefined,
    gtmId:
      asString(content.gtm_id) ||
      asString(content.gtmId) ||
      asString(content.google_tag_manager_id) ||
      undefined,
    contactEmail:
      asString(content.contact_email) ||
      asString(content.sendgrid_to_email) ||
      asString(content.to_email) ||
      undefined,
    cookieConsentEnabled:
      content.cookie_consent_enabled === undefined
        ? true
        : asBoolean(content.cookie_consent_enabled, true),
    navigation,
    legal: normalizeStoryblokCopy(content.legal),
    preview: normalizeStoryblokCopy(content.preview),
    cookies: normalizeStoryblokCopy(content.cookies),
    error: normalizeStoryblokCopy(content.error),
    seo: normalizeStoryblokSeo(asSeo(content.seo), seoImage),
    seoImage: normalizeStoryblokAsset(seoImage),
    storyblok: normalizeStoryblokEditable(content)
  }
}
