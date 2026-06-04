export type PageType = 'page' | 'article' | 'game' | 'modal'

export type KnownSectionType =
  | 'accordion_section'
  | 'cards_section'
  | 'feature_section'
  | 'hero_section'
  | 'form_section'
  | 'gallery_section'
  | 'games_section'
  | 'leaderboard_section'
  | 'media_section'
  | 'news_section'
  | 'richtext_section'
  | 'spotlight_section'
  | 'testimonials_section'
  | 'timeline_section'

export type SectionType = KnownSectionType | 'unknown_section'

export type LinkVariant = 'primary' | 'secondary' | 'text'
export type LinkType =
  | 'internal'
  | 'external'
  | 'email'
  | 'telephone'
  | 'asset'
  | 'hash'
  | 'modal'
  | 'action'

export type SectionAlign = 'default' | 'left' | 'center' | 'right'

export type GridColumnsValue =
  | number
  | string
  | Record<string, unknown>
  | Array<unknown>

export type NormalizedLink = {
  label: string
  href: string
  target?: '_blank' | '_self'
  type?: LinkType
  variant?: LinkVariant
  icon?: string
  button?: boolean
  image?: NormalizedImage
  onClick?: () => void
}

export type NormalizedImage = {
  src: string
  alt: string
  title?: string
  width?: number
  height?: number
  focalPoint?: string
}

export type NormalizedSeo = {
  title?: string
  description?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: NormalizedImage
  noIndex?: boolean
}

export type NormalizedNavigationItem = {
  id: string
  label: string
  href: string
  target?: '_blank' | '_self'
}

export type NormalizedStoryblokEditable = {
  dataBlokC: string
  dataBlokUid: string
}

export type NormalizedRichTextMark =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'code'

export type NormalizedRichTextAlign = 'left' | 'center' | 'right' | 'justify'

export type NormalizedRichTextInline =
  | {
      type: 'text'
      text: string
      marks?: NormalizedRichTextMark[]
    }
  | {
      type: 'link'
      href: string
      target?: '_blank' | '_self'
      external: boolean
      children: NormalizedRichTextInline[]
    }
  | {
      type: 'hard_break'
    }

export type NormalizedRichTextListItem = {
  id: string
  text?: string
  children: NormalizedRichTextInline[]
}

export type NormalizedRichTextBlok = {
  _uid?: string
  component?: string
  [key: string]: unknown
}

export type NormalizedRichTextEmbeddedBlock = {
  id: string
  component: string
  blok: NormalizedRichTextBlok
}

export type NormalizedRichTextNode =
  | {
      type: 'heading'
      level: 1 | 2 | 3 | 4
      text?: string
      children?: NormalizedRichTextInline[]
      align?: NormalizedRichTextAlign
    }
  | {
      type: 'paragraph'
      text?: string
      children?: NormalizedRichTextInline[]
      align?: NormalizedRichTextAlign
    }
  | {
      type: 'list'
      style: 'ordered' | 'unordered'
      items: Array<string | NormalizedRichTextListItem>
    }
  | {
      type: 'quote'
      children: NormalizedRichTextNode[]
    }
  | {
      type: 'image'
      image: NormalizedImage
      caption?: string
    }
  | {
      type: 'blok'
      blocks: NormalizedRichTextEmbeddedBlock[]
    }
  | {
      type: 'horizontal_rule'
    }

export type NormalizedRichText = {
  nodes: NormalizedRichTextNode[]
}

export type ArticleQueryOptions = {
  featured?: boolean
  limit?: number
  page?: number
}

export type NormalizedArticleListPage = {
  articles: NormalizedArticleSummary[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export type GameQueryOptions = {
  references?: string[]
  limit?: number
}

export type NormalizedArticleSummary = {
  id: string
  slug: string
  path: string
  title: string
  date: string
  featured?: boolean
  excerpt?: NormalizedRichText
  image?: NormalizedImage
}

export type NormalizedGameSummary = {
  id: string
  slug: string
  path: string
  title: string
  summary?: string
  gameType?: string
  status?: string
  date?: string
  image?: NormalizedImage
  icon?: NormalizedImage
}

type BaseSection<TType extends SectionType> = {
  id: string
  type: TType
  theme?: string
  storyblok?: NormalizedStoryblokEditable
}

export type SectionCard = {
  id: string
  title?: string
  subtitle?: string
  copy?: NormalizedRichText
  image?: NormalizedImage
  video?: string
  name?: string
  role?: string
  quote?: string
  align?: SectionAlign
  links?: NormalizedLink[]
  href?: string
}

export type NewsCard = {
  id: string
  title?: string
  excerpt?: NormalizedRichText
  image?: NormalizedImage
  date?: string
  featured?: boolean
  path?: string
}

export type AccordionSection = BaseSection<'accordion_section'> & {
  copy: NormalizedRichText
  cards: SectionCard[]
}

export type CardsSection = BaseSection<'cards_section'> & {
  copy: NormalizedRichText
  columns?: GridColumnsValue
  cards: SectionCard[]
}

export type FeatureSection = BaseSection<'feature_section'> & {
  copy: NormalizedRichText
  image?: NormalizedImage
  align?: SectionAlign
}

export type GamesSection = BaseSection<'games_section'> & {
  copy: NormalizedRichText
  games: string[]
}

export type LeaderboardSection = BaseSection<'leaderboard_section'> & {
  copy: NormalizedRichText
  csv?: string
}

export type MediaSection = BaseSection<'media_section'> & {
  image?: NormalizedImage
  video?: string
  videoControls?: boolean
  videoAutoplay?: boolean
  caption?: string
  size?: string
}

export type RichtextSection = BaseSection<'richtext_section'> & {
  copy: NormalizedRichText
}

export type SpotlightSection = BaseSection<'spotlight_section'> & {
  copy: NormalizedRichText
  label?: string
  title?: string
  image?: NormalizedImage
  storyPath?: string
  links?: NormalizedLink[]
}

export type TimelineSection = BaseSection<'timeline_section'> & {
  copy: NormalizedRichText
  cards: SectionCard[]
}

export type HeroSection = BaseSection<'hero_section'> & {
  copy: NormalizedRichText
  video?: string
  image?: NormalizedImage
  links?: NormalizedLink[]
}

export type GalleryCard = {
  id: string
  image?: NormalizedImage
  video?: string
}

export type GallerySection = BaseSection<'gallery_section'> & {
  copy: NormalizedRichText
  cards: GalleryCard[]
}

export type FormSection = BaseSection<'form_section'> & {
  copy: NormalizedRichText
  submitLabel?: string
  thanksPath?: string
}

export type NewsSection = BaseSection<'news_section'> & {
  copy: NormalizedRichText
  mode: 'all' | 'featured'
  articles: number
}

export type TestimonialCard = {
  id: string
  quote: string
  name: string
  role?: string
  image?: NormalizedImage
}

export type TestimonialsSection = BaseSection<'testimonials_section'> & {
  copy: NormalizedRichText
  cards: TestimonialCard[]
}

export type UnknownSection = BaseSection<'unknown_section'> & {
  originalType: string
}

export type NormalizedSection =
  | AccordionSection
  | CardsSection
  | FeatureSection
  | HeroSection
  | FormSection
  | GallerySection
  | GamesSection
  | LeaderboardSection
  | MediaSection
  | NewsSection
  | RichtextSection
  | SpotlightSection
  | TestimonialsSection
  | TimelineSection
  | UnknownSection

type BasePage<TType extends PageType> = {
  type: TType
  slug: string
  name: string
  seo: NormalizedSeo
  seoImage?: NormalizedImage
}

export type NormalizedStandardPage = BasePage<'page'> & {
  sections: NormalizedSection[]
}

export type NormalizedModalPage = BasePage<'modal'> & {
  copy: NormalizedRichText
}

export type NormalizedArticlePage = BasePage<'article'> & {
  title: string
  date: string
  article: NormalizedRichText
  image?: NormalizedImage
}

// TODO: Expand once the Storyblok master space's game fields are reviewed.
export type NormalizedGamePage = BasePage<'game'> & {
  title: string
  summary?: string
  gameType?: string
  status?: string
  date?: string
  image?: NormalizedImage
  icon?: NormalizedImage
}

export type NormalizedPage =
  | NormalizedStandardPage
  | NormalizedModalPage
  | NormalizedArticlePage
  | NormalizedGamePage

export type NormalizedSiteSettings = {
  type: 'site-settings'
  slug: string
  name: string
  siteName: string
  logo?: NormalizedImage
  icon?: NormalizedImage
  domain?: string
  gtmId?: string
  contactEmail?: string
  cookieConsentEnabled: boolean
  navigation: NormalizedNavigationItem[]
  legal: NormalizedRichText
  preview: NormalizedRichText
  cookies: NormalizedRichText
  error: NormalizedRichText
  seo: NormalizedSeo
  seoImage?: NormalizedImage
  storyblok?: NormalizedStoryblokEditable
}
