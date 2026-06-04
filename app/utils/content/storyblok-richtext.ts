import type {
  NormalizedImage,
  NormalizedRichTextAlign,
  NormalizedRichTextBlok,
  NormalizedRichTextEmbeddedBlock,
  NormalizedRichText,
  NormalizedRichTextInline,
  NormalizedRichTextListItem,
  NormalizedRichTextMark,
  NormalizedRichTextNode
} from '~/types/content'
import type {
  StoryblokRichTextDocument,
  StoryblokRichTextMark,
  StoryblokRichTextNode
} from '~/types/storyblok'
import { getSafeTarget, isExternalHref } from '~/utils/links'

const markTypeMap: Record<string, NormalizedRichTextMark> = {
  bold: 'bold',
  italic: 'italic',
  underline: 'underline',
  strike: 'strike',
  code: 'code'
}

const asString = (value: unknown) => (typeof value === 'string' ? value : '')

const richTextComponentNames = new Set([
  'instance_richtext_buttons',
  'instance_richtext_embed',
  'instance_richtext_game',
  'instance_richtext_image',
  'instance_richtext_video'
])

const normalizeTextAlign = (
  value: unknown
): NormalizedRichTextAlign | undefined => {
  const align = asString(value)

  return align === 'left' ||
    align === 'center' ||
    align === 'right' ||
    align === 'justify'
    ? align
    : undefined
}

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

const normalizeImageAttrs = (
  attrs?: StoryblokRichTextNode['attrs']
): NormalizedImage | undefined => {
  const src = asString(attrs?.src)

  if (!src) {
    return undefined
  }

  return {
    src,
    alt: asString(attrs?.alt),
    title: asString(attrs?.title) || undefined,
    ...assetDimensionsFromFilename(src)
  }
}

const normalizeMarkTypes = (marks: StoryblokRichTextMark[] = []) =>
  marks
    .map((mark) => (mark.type ? markTypeMap[mark.type] : undefined))
    .filter((mark): mark is NormalizedRichTextMark => Boolean(mark))

const normalizeLinkHref = (mark?: StoryblokRichTextMark) => {
  const attrs = mark?.attrs

  if (!attrs) {
    return ''
  }

  if (attrs.linktype === 'email' && attrs.href) {
    return attrs.href.startsWith('mailto:') ? attrs.href : `mailto:${attrs.href}`
  }

  const href = asString(attrs.href)

  if (!href) {
    return ''
  }

  const hrefWithAnchor = attrs.anchor ? `${href}#${attrs.anchor}` : href

  if (attrs.linktype === 'story' && !hrefWithAnchor.startsWith('/')) {
    return `/${hrefWithAnchor}`
  }

  return hrefWithAnchor
}

const normalizeLinkInline = (
  mark: StoryblokRichTextMark,
  children: NormalizedRichTextInline[]
): NormalizedRichTextInline | null => {
  const href = normalizeLinkHref(mark)

  if (!href || !children.length) {
    return null
  }

  const external = isExternalHref(href)

  return {
    type: 'link',
    href,
    target: external ? '_blank' : getSafeTarget(href, mark.attrs?.target),
    external,
    children
  }
}

const normalizeTextInline = (
  node: StoryblokRichTextNode
): NormalizedRichTextInline[] => {
  const text = node.text || ''

  if (!text) {
    return []
  }

  const linkMark = node.marks?.find((mark) => mark.type === 'link')
  const textInline: NormalizedRichTextInline = {
    type: 'text',
    text,
    marks: normalizeMarkTypes(node.marks?.filter((mark) => mark.type !== 'link'))
  }

  if (!linkMark) {
    return [textInline]
  }

  const linkInline = normalizeLinkInline(linkMark, [textInline])

  return linkInline ? [linkInline] : [textInline]
}

const normalizeInlineNode = (
  node: StoryblokRichTextNode
): NormalizedRichTextInline[] => {
  if (node.type === 'text') {
    return normalizeTextInline(node)
  }

  if (node.type === 'hard_break') {
    return [{ type: 'hard_break' }]
  }

  return normalizeInlineNodes(node.content || [])
}

const normalizeInlineNodes = (nodes: StoryblokRichTextNode[]) =>
  nodes.flatMap(normalizeInlineNode)

const inlineText = (inline: NormalizedRichTextInline): string => {
  if (inline.type === 'text') {
    return inline.text
  }

  if (inline.type === 'link') {
    return inline.children.map(inlineText).join('')
  }

  return ' '
}

const inlineNodesText = (nodes: NormalizedRichTextInline[]) =>
  nodes.map(inlineText).join('').replace(/\s+/g, ' ').trim()

const hasInlineContent = (nodes: NormalizedRichTextInline[]) =>
  inlineNodesText(nodes).length > 0

const normalizeListItem = (
  node: StoryblokRichTextNode,
  index: number
): NormalizedRichTextListItem | null => {
  const children = normalizeInlineNodes(node.content || [])

  if (!hasInlineContent(children)) {
    return null
  }

  return {
    id: `list-item-${index}-${inlineNodesText(children)}`,
    text: inlineNodesText(children),
    children
  }
}

const headingLevel = (level?: number): 1 | 2 | 3 | 4 => {
  if (level === 1) {
    return 1
  }

  if (level === 3) {
    return 3
  }

  if (level && level >= 4) {
    return 4
  }

  return 2
}

const normalizeImageNode = (
  node: StoryblokRichTextNode
): Extract<NormalizedRichTextNode, { type: 'image' }> | null => {
  const image = normalizeImageAttrs(node.attrs)

  return image ? { type: 'image', image, caption: image.title } : null
}

const isRichTextBlok = (value: unknown): value is NormalizedRichTextBlok =>
  Boolean(
    value &&
      typeof value === 'object' &&
      typeof (value as NormalizedRichTextBlok).component === 'string'
  )

const normalizeEmbeddedBlock = (
  value: unknown,
  index: number
): NormalizedRichTextEmbeddedBlock | null => {
  if (!isRichTextBlok(value) || !value.component) {
    return null
  }

  if (!richTextComponentNames.has(value.component)) {
    return null
  }

  return {
    id: value._uid || `${value.component}-${index}`,
    component: value.component,
    blok: value
  }
}

const normalizeEmbeddedBlocks = (
  value: unknown
): NormalizedRichTextEmbeddedBlock[] =>
  Array.isArray(value)
    ? value
        .map(normalizeEmbeddedBlock)
        .filter((block): block is NormalizedRichTextEmbeddedBlock =>
          Boolean(block)
        )
    : []

const normalizeNode = (
  node: StoryblokRichTextNode
): NormalizedRichTextNode[] => {
  if (node.type === 'heading') {
    const children = normalizeInlineNodes(node.content || [])

    return hasInlineContent(children)
      ? [
          {
            type: 'heading',
            level: headingLevel(node.attrs?.level),
            text: inlineNodesText(children),
            children,
            align: normalizeTextAlign(node.attrs?.textAlign)
          }
        ]
      : []
  }

  if (node.type === 'paragraph') {
    const nodes: NormalizedRichTextNode[] = []
    let inlineBuffer: NormalizedRichTextInline[] = []
    const flushParagraph = () => {
      if (!hasInlineContent(inlineBuffer)) {
        inlineBuffer = []
        return
      }

      nodes.push({
        type: 'paragraph',
        text: inlineNodesText(inlineBuffer),
        children: inlineBuffer,
        align: normalizeTextAlign(node.attrs?.textAlign)
      })
      inlineBuffer = []
    }

    for (const child of node.content || []) {
      if (child.type === 'image') {
        flushParagraph()

        const image = normalizeImageNode(child)

        if (image) {
          nodes.push(image)
        }

        continue
      }

      inlineBuffer.push(...normalizeInlineNode(child))
    }

    flushParagraph()

    return nodes
  }

  if (node.type === 'bullet_list' || node.type === 'ordered_list') {
    const items = (node.content || [])
      .map(normalizeListItem)
      .filter((item): item is NormalizedRichTextListItem => Boolean(item))

    return items.length
      ? [
          {
            type: 'list',
            style: node.type === 'ordered_list' ? 'ordered' : 'unordered',
            items
          }
        ]
      : []
  }

  if (node.type === 'blockquote') {
    const children = (node.content || []).flatMap(normalizeNode)

    return children.length ? [{ type: 'quote', children }] : []
  }

  if (node.type === 'horizontal_rule') {
    return [{ type: 'horizontal_rule' }]
  }

  if (node.type === 'image') {
    const image = normalizeImageNode(node)

    return image ? [image] : []
  }

  if (node.type === 'blok') {
    const blocks = normalizeEmbeddedBlocks(node.attrs?.body)

    return blocks.length ? [{ type: 'blok', blocks }] : []
  }

  return []
}

const normalizePlainTextCopy = (copy: string): NormalizedRichText => {
  const text = copy.replace(/\r\n?/g, '\n').trim()

  if (!text) {
    return { nodes: [] }
  }

  return {
    nodes: text
      .split(/\n[ \t]*\n+/)
      .map((paragraph): Extract<NormalizedRichTextNode, { type: 'paragraph' }> => {
        const children = paragraph.split('\n').flatMap((line, index) => {
          const inlines: NormalizedRichTextInline[] = []
          const lineText = line.trim()

          if (index > 0) {
            inlines.push({ type: 'hard_break' })
          }

          if (lineText) {
            inlines.push({ type: 'text', text: lineText })
          }

          return inlines
        })

        return {
          type: 'paragraph',
          text: inlineNodesText(children),
          children
        }
      })
      .filter((node) => hasInlineContent(node.children || []))
  }
}

export const normalizeStoryblokRichText = (richText?: unknown): NormalizedRichText => {
  if (typeof richText === 'string') {
    return normalizePlainTextCopy(richText)
  }

  const content =
    richText && typeof richText === 'object'
      ? (richText as StoryblokRichTextDocument).content
      : undefined

  return {
    nodes: (content || []).flatMap(normalizeNode)
  }
}

export const normalizeStoryblokCopy = (...values: unknown[]): NormalizedRichText => {
  for (const value of values) {
    const richText = normalizeStoryblokRichText(value)

    if (richText.nodes.length) {
      return richText
    }
  }

  return { nodes: [] }
}
