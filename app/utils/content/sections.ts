import type { Component } from 'vue'
import AccordionSection from '~/components/sections/AccordionSection.vue'
import CardsSection from '~/components/sections/CardsSection.vue'
import FeatureSection from '~/components/sections/FeatureSection.vue'
import FormSection from '~/components/sections/FormSection.vue'
import GallerySection from '~/components/sections/GallerySection.vue'
import GamesSection from '~/components/sections/GamesSection.vue'
import HeroSection from '~/components/sections/HeroSection.vue'
import LeaderboardSection from '~/components/sections/LeaderboardSection.vue'
import MediaSection from '~/components/sections/MediaSection.vue'
import NewsSection from '~/components/sections/NewsSection.vue'
import RichtextSection from '~/components/sections/RichtextSection.vue'
import SpotlightSection from '~/components/sections/SpotlightSection.vue'
import TestimonialsSection from '~/components/sections/TestimonialsSection.vue'
import TimelineSection from '~/components/sections/TimelineSection.vue'
import UnknownSection from '~/components/sections/UnknownSection.vue'
import type {
  KnownSectionType,
  SectionType
} from '~/types/content'
import { knownSectionTypes } from './section-normalization'

export {
  createUnknownSection,
  isKnownSectionType,
  knownSectionTypes,
  normalizeSections
} from './section-normalization'

export const sectionRegistry = {
  accordion_section: AccordionSection,
  cards_section: CardsSection,
  feature_section: FeatureSection,
  hero_section: HeroSection,
  form_section: FormSection,
  gallery_section: GallerySection,
  games_section: GamesSection,
  leaderboard_section: LeaderboardSection,
  media_section: MediaSection,
  news_section: NewsSection,
  richtext_section: RichtextSection,
  spotlight_section: SpotlightSection,
  testimonials_section: TestimonialsSection,
  timeline_section: TimelineSection
} satisfies Record<KnownSectionType, Component>

export const getSectionComponent = (type: SectionType): Component => {
  if (type === 'unknown_section') {
    return UnknownSection
  }

  return sectionRegistry[type] || UnknownSection
}
