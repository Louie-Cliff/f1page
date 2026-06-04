import type { NormalizedImage } from '~/types/content'

export const defaultImageWidths = [
  320,
  480,
  640,
  768,
  960,
  1200,
  1440,
  1600,
  1920,
  2400
]

const storyblokAssetPattern = /^https?:\/\/a\.storyblok\.com\//

export const isStoryblokImage = (src: string) => storyblokAssetPattern.test(src)

const clampQuality = (quality: number) => Math.min(100, Math.max(1, quality))

const imageUrlWithoutTransform = (src: string) => src.replace(/\/m\/.*$/, '')

export const getStoryblokImageUrl = (
  image: NormalizedImage,
  width?: number,
  quality = 78
) => {
  if (!isStoryblokImage(image.src)) {
    return image.src
  }

  const baseUrl = imageUrlWithoutTransform(image.src)
  const resize = width ? `${Math.round(width)}x0` : ''
  const filters = [`quality(${clampQuality(quality)})`, 'no_upscale()']

  return `${baseUrl}/m/${resize}/filters:${filters.join(':')}`
}

export const getImageWidths = (
  image: NormalizedImage,
  widths = defaultImageWidths
) => {
  const maxWidth = image.width || Math.max(...widths)
  const filteredWidths = widths.filter((width) => width <= maxWidth)

  return filteredWidths.length ? filteredWidths : [maxWidth]
}

export const getImageSrcset = (
  image: NormalizedImage,
  widths = defaultImageWidths,
  quality?: number
) =>
  getImageWidths(image, widths)
    .map((width) => `${getStoryblokImageUrl(image, width, quality)} ${width}w`)
    .join(', ')

export const getImageObjectPosition = (image: NormalizedImage) => {
  if (!image.focalPoint || !image.width || !image.height) {
    return undefined
  }

  const coordinates = image.focalPoint.match(/^(\d+)x(\d+):(\d+)x(\d+)$/)

  if (!coordinates) {
    return undefined
  }

  const x1 = Number(coordinates[1])
  const y1 = Number(coordinates[2])
  const x2 = Number(coordinates[3])
  const y2 = Number(coordinates[4])
  const centerX = ((x1 + x2) / 2 / image.width) * 100
  const centerY = ((y1 + y2) / 2 / image.height) * 100

  return `${centerX.toFixed(2)}% ${centerY.toFixed(2)}%`
}
