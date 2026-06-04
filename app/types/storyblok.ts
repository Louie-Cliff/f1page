export type StoryblokRichTextDocument = {
  type?: string
  content?: StoryblokRichTextNode[]
}

export type StoryblokRichTextNode = {
  type?: string
  text?: string
  marks?: StoryblokRichTextMark[]
  attrs?: {
    level?: number
    alt?: string
    src?: string
    title?: string
    [key: string]: unknown
  }
  content?: StoryblokRichTextNode[]
}

export type StoryblokRichTextMark = {
  type?: string
  attrs?: {
    href?: string
    target?: '_blank' | '_self'
    linktype?: string
    anchor?: string
    uuid?: string
    [key: string]: unknown
  }
}

export type StoryblokAsset = {
  id?: number
  alt?: string
  name?: string
  title?: string
  filename?: string
  copyright?: string
  focus?: string
  fieldtype?: string
  meta_data?: {
    alt?: string
    title?: string
    [key: string]: unknown
  }
}

export type StoryblokLink = {
  id?: string
  uuid?: string
  url?: string
  cached_url?: string
  full_slug?: string
  linktype?: string
  target?: '_blank' | '_self'
  anchor?: string
  email?: string
}

export type StoryblokBlok = {
  _uid?: string
  _editable?: string
  component?: string
  [key: string]: unknown
}

export type StoryblokSeoPlugin = {
  title?: string
  description?: string
  og_title?: string
  og_description?: string
  og_image?: string
  twitter_title?: string
  twitter_description?: string
  twitter_image?: string
  no_index?: boolean
  no_follow?: boolean
  plugin?: string
  [key: string]: unknown
}

export type StoryblokStory = {
  id: number
  uuid: string
  name: string
  slug: string
  full_slug: string
  content: StoryblokBlok
  created_at?: string
  published_at?: string
  first_published_at?: string
}

export type StoryblokStoryResponse = {
  story: StoryblokStory
  cv?: number
}

export type StoryblokStoriesResponse = {
  stories: StoryblokStory[]
  cv?: number
}

export type StoryblokPaginatedStoriesResponse = StoryblokStoriesResponse & {
  total: number
  page: number
  perPage: number
  totalPages: number
}
