import type { NormalizedImage } from '~/types/content'

export const normalizeImage = (
  image?: NormalizedImage | null
): NormalizedImage | undefined => {
  if (!image?.src) {
    return undefined
  }

  return {
    ...image,
    alt: image.alt ?? ''
  }
}
