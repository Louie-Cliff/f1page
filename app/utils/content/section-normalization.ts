import type {
  KnownSectionType,
  NormalizedSection,
  UnknownSection as NormalizedUnknownSection
} from '~/types/content'

export const knownSectionTypes: KnownSectionType[] = [
  'accordion_section',
  'cards_section',
  'feature_section',
  'hero_section',
  'form_section',
  'gallery_section',
  'games_section',
  'leaderboard_section',
  'media_section',
  'news_section',
  'richtext_section',
  'spotlight_section',
  'testimonials_section',
  'timeline_section'
]

export const isKnownSectionType = (type: string): type is KnownSectionType =>
  knownSectionTypes.includes(type as KnownSectionType)

export const createUnknownSection = (
  originalType: string,
  id: string
): NormalizedUnknownSection => ({
  id,
  type: 'unknown_section',
  originalType
})

export const normalizeSections = (
  sections?: Array<NormalizedSection | { id?: string; type?: string }>
): NormalizedSection[] => {
  return (sections || []).map((section, index) => {
    const normalizedSection = (() => {
      if (section.type && isKnownSectionType(section.type)) {
        return section as NormalizedSection
      }

      return createUnknownSection(
        section.type || 'missing_section_type',
        section.id || `unknown-section-${index}`
      )
    })()

    return normalizedSection
  })
}
