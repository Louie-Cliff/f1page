import type { GridColumnsValue } from '~/types/content'

export type GridBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type GridColumnCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
export type GridColumnConfig = Partial<Record<GridBreakpoint, GridColumnCount>>

export const gridBreakpoints: GridBreakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']

const gridColumnClasses: Record<
  GridBreakpoint,
  Record<GridColumnCount, string>
> = {
  xs: {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    7: 'grid-cols-7',
    8: 'grid-cols-8',
    9: 'grid-cols-9',
    10: 'grid-cols-10',
    11: 'grid-cols-11',
    12: 'grid-cols-12'
  },
  sm: {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
    5: 'sm:grid-cols-5',
    6: 'sm:grid-cols-6',
    7: 'sm:grid-cols-7',
    8: 'sm:grid-cols-8',
    9: 'sm:grid-cols-9',
    10: 'sm:grid-cols-10',
    11: 'sm:grid-cols-11',
    12: 'sm:grid-cols-12'
  },
  md: {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    5: 'md:grid-cols-5',
    6: 'md:grid-cols-6',
    7: 'md:grid-cols-7',
    8: 'md:grid-cols-8',
    9: 'md:grid-cols-9',
    10: 'md:grid-cols-10',
    11: 'md:grid-cols-11',
    12: 'md:grid-cols-12'
  },
  lg: {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6',
    7: 'lg:grid-cols-7',
    8: 'lg:grid-cols-8',
    9: 'lg:grid-cols-9',
    10: 'lg:grid-cols-10',
    11: 'lg:grid-cols-11',
    12: 'lg:grid-cols-12'
  },
  xl: {
    1: 'xl:grid-cols-1',
    2: 'xl:grid-cols-2',
    3: 'xl:grid-cols-3',
    4: 'xl:grid-cols-4',
    5: 'xl:grid-cols-5',
    6: 'xl:grid-cols-6',
    7: 'xl:grid-cols-7',
    8: 'xl:grid-cols-8',
    9: 'xl:grid-cols-9',
    10: 'xl:grid-cols-10',
    11: 'xl:grid-cols-11',
    12: 'xl:grid-cols-12'
  },
  '2xl': {
    1: '2xl:grid-cols-1',
    2: '2xl:grid-cols-2',
    3: '2xl:grid-cols-3',
    4: '2xl:grid-cols-4',
    5: '2xl:grid-cols-5',
    6: '2xl:grid-cols-6',
    7: '2xl:grid-cols-7',
    8: '2xl:grid-cols-8',
    9: '2xl:grid-cols-9',
    10: '2xl:grid-cols-10',
    11: '2xl:grid-cols-11',
    12: '2xl:grid-cols-12'
  }
}

export const defaultGridColumns: GridColumnConfig = {
  xs: 1,
  md: 3
}

const normalizeBreakpoint = (value: unknown): GridBreakpoint | undefined => {
  const breakpoint = String(value || '').trim().toLowerCase()

  if (breakpoint === 'base' || breakpoint === 'default') {
    return 'xs'
  }

  return gridBreakpoints.includes(breakpoint as GridBreakpoint)
    ? (breakpoint as GridBreakpoint)
    : undefined
}

const normalizeColumnCount = (value: unknown): GridColumnCount | undefined => {
  const count = Number(value)

  return Number.isInteger(count) && count >= 1 && count <= 12
    ? (count as GridColumnCount)
    : undefined
}

const addColumnValue = (
  config: GridColumnConfig,
  breakpoint: unknown,
  count: unknown
) => {
  const normalizedBreakpoint = normalizeBreakpoint(breakpoint)
  const normalizedCount = normalizeColumnCount(count)

  if (normalizedBreakpoint && normalizedCount) {
    config[normalizedBreakpoint] = normalizedCount
  }
}

const parseStringColumns = (value: string): GridColumnConfig => {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return {}
  }

  const numericValue = normalizeColumnCount(trimmedValue)

  if (numericValue) {
    return { xs: numericValue }
  }

  try {
    return parseGridColumns(JSON.parse(trimmedValue))
  } catch {
    // Storyblok plugin values are often compact strings such as "xs:1, md:2".
  }

  return trimmedValue
    .split(/[\s,]+/)
    .reduce<GridColumnConfig>((config, part) => {
      const [breakpoint, count] = part.split(':')
      addColumnValue(config, breakpoint, count)

      return config
    }, {})
}

const parseObjectColumns = (value: Record<string, unknown>): GridColumnConfig => {
  const nestedValue =
    value.columns || value.value || value.config || value.breakpoints

  if (
    nestedValue &&
    (typeof nestedValue === 'string' ||
      typeof nestedValue === 'number' ||
      Array.isArray(nestedValue))
  ) {
    return parseGridColumns(nestedValue as GridColumnsValue)
  }

  if (
    nestedValue &&
    typeof nestedValue === 'object' &&
    !Array.isArray(nestedValue)
  ) {
    return parseGridColumns(nestedValue as Record<string, unknown>)
  }

  return Object.entries(value).reduce<GridColumnConfig>((config, [key, count]) => {
    addColumnValue(config, key, count)

    return config
  }, {})
}

const parseArrayColumns = (value: Array<unknown>): GridColumnConfig =>
  value.reduce<GridColumnConfig>((config, item) => {
    if (!item || typeof item !== 'object') {
      return config
    }

    const columnItem = item as Record<string, unknown>
    const breakpoint =
      columnItem.breakpoint ||
      columnItem.size ||
      columnItem.screen ||
      columnItem.name ||
      columnItem.key
    const count = columnItem.columns || columnItem.count || columnItem.value

    addColumnValue(config, breakpoint, count)

    return config
  }, {})

export const parseGridColumns = (value?: GridColumnsValue): GridColumnConfig => {
  if (typeof value === 'number') {
    const count = normalizeColumnCount(value)

    return count ? { xs: count } : {}
  }

  if (typeof value === 'string') {
    return parseStringColumns(value)
  }

  if (Array.isArray(value)) {
    return parseArrayColumns(value)
  }

  if (value && typeof value === 'object') {
    return parseObjectColumns(value)
  }

  return {}
}

export const getGridColumnClasses = (
  value?: GridColumnsValue,
  fallback: GridColumnConfig = defaultGridColumns
) => {
  const parsedColumns = parseGridColumns(value)
  const columns = Object.keys(parsedColumns).length ? parsedColumns : fallback

  return [
    'grid',
    ...gridBreakpoints
      .map((breakpoint) => {
        const count = columns[breakpoint]

        return count ? gridColumnClasses[breakpoint][count] : undefined
      })
      .filter(Boolean)
  ]
}
