import type { NormalizedSection } from '~/types/content'

export const getStoryblokEditableAttrs = (
  section: NormalizedSection,
  editorMode: boolean
) => {
  if (!editorMode || !section.storyblok) {
    return {}
  }

  return {
    'data-blok-c': section.storyblok.dataBlokC,
    'data-blok-uid': section.storyblok.dataBlokUid
  }
}

