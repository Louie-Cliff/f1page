import type { GridColumnsValue } from '~/types/content'
import {
  defaultGridColumns,
  gridBreakpoints,
  parseGridColumns,
  type GridBreakpoint,
  type GridColumnConfig
} from '~/utils/grid-columns'

// Keep these in sync with Tailwind's default container breakpoints for this starter.
// We intentionally ignore gutters and gaps so images are slightly generous.
const containerWidths: Record<GridBreakpoint, number> = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}

const mediaBreakpoints = [...gridBreakpoints]
  .filter((breakpoint) => breakpoint !== 'xs')
  .reverse()

const clampFraction = (fraction: number) => {
  if (!Number.isFinite(fraction) || fraction <= 0) {
    return 1
  }

  return Math.min(fraction, 1)
}

const formatViewportWidth = (fraction: number) => {
  const width = Math.ceil(clampFraction(fraction) * 100)

  return width >= 100 ? '100vw' : `${width}vw`
}

const normalizeBreakpoint = (value?: string): GridBreakpoint | undefined => {
  if (!value || value === 'base' || value === 'default') {
    return 'xs'
  }

  return gridBreakpoints.includes(value as GridBreakpoint)
    ? (value as GridBreakpoint)
    : undefined
}

const parseWidthValue = (value: string) => {
  if (value === 'full' || value === 'screen') {
    return 1
  }

  const fraction = value.match(/^(\d+)\/(\d+)$/)

  if (fraction) {
    const numerator = Number(fraction[1])
    const denominator = Number(fraction[2])

    return denominator ? numerator / denominator : undefined
  }

  const percentage = value.match(/^\[(\d+(?:\.\d+)?)%\]$/)

  if (percentage) {
    return Number(percentage[1]) / 100
  }

  return undefined
}

const parseWidthClassFractions = (value: string) =>
  value.split(/\s+/).reduce<Partial<Record<GridBreakpoint, number>>>((config, token) => {
    const parts = token.trim().split(':')
    const widthClass = parts.pop()
    const breakpoint = parts.length ? normalizeBreakpoint(parts.at(-1)) : 'xs'

    if (!widthClass?.startsWith('w-') || !breakpoint) {
      return config
    }

    const fraction = parseWidthValue(widthClass.slice(2))

    if (fraction) {
      config[breakpoint] = fraction
    }

    return config
  }, {})

const resolveFractionsByBreakpoint = (
  config: Partial<Record<GridBreakpoint, number>>
): Record<GridBreakpoint, number> => {
  let activeFraction = config.xs || 1

  return gridBreakpoints.reduce<Record<GridBreakpoint, number>>((resolved, breakpoint) => {
    activeFraction = config[breakpoint] || activeFraction
    resolved[breakpoint] = activeFraction

    return resolved
  }, {} as Record<GridBreakpoint, number>)
}

const resolveColumnsByBreakpoint = (
  config: GridColumnConfig
): Record<GridBreakpoint, number> => {
  let activeColumns = config.xs || 1

  return gridBreakpoints.reduce<Record<GridBreakpoint, number>>((resolved, breakpoint) => {
    activeColumns = config[breakpoint] || activeColumns
    resolved[breakpoint] = activeColumns

    return resolved
  }, {} as Record<GridBreakpoint, number>)
}

export const getContainerImageSizes = (
  value: number | string | Partial<Record<GridBreakpoint, number>> = 1
) => {
  const fractions =
    typeof value === 'string'
      ? parseWidthClassFractions(value)
      : typeof value === 'number'
        ? { xs: value }
        : value
  const resolvedFractions = resolveFractionsByBreakpoint(fractions)
  const mediaSizes = mediaBreakpoints.map((breakpoint) => {
    const width = Math.ceil(
      containerWidths[breakpoint] * clampFraction(resolvedFractions[breakpoint])
    )

    return `(min-width: ${containerWidths[breakpoint]}px) ${width}px`
  })

  return [...mediaSizes, formatViewportWidth(resolvedFractions.xs)].join(', ')
}

export const getGridImageSizes = (
  value?: GridColumnsValue,
  fallback: GridColumnConfig = defaultGridColumns
) => {
  const parsedColumns = parseGridColumns(value)
  const columns = Object.keys(parsedColumns).length ? parsedColumns : fallback
  const resolvedColumns = resolveColumnsByBreakpoint(columns)
  const mediaSizes = mediaBreakpoints.map((breakpoint) => {
    const width = Math.ceil(containerWidths[breakpoint] / resolvedColumns[breakpoint])

    return `(min-width: ${containerWidths[breakpoint]}px) ${width}px`
  })

  return [...mediaSizes, formatViewportWidth(1 / resolvedColumns.xs)].join(', ')
}
