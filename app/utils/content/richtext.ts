import type { NormalizedRichText } from '~/types/content'

export const emptyRichText = (): NormalizedRichText => ({
  nodes: []
})

export const normalizeRichText = (
  richText?: NormalizedRichText | null
): NormalizedRichText => richText || emptyRichText()
