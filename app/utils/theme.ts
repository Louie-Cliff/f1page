export const normalizeThemeName = (theme?: string) =>
  (theme || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')

export type ThemeClassData = {
  name: string
  slug: string
  classes: string[]
  background: string
  color: string
  border: string
  alt: string
  muted: string
  panel: string
  styles: string
  stringy: string
}

type ThemeClassInput = Partial<
  Pick<
    ThemeClassData,
    'background' | 'color' | 'border' | 'alt' | 'muted' | 'panel' | 'styles' | 'stringy'
  >
>

const defaultTheme: Omit<ThemeClassData, 'name' | 'slug' | 'classes'> = {
  background: '',
  color: '',
  border: 'border-house-border',
  alt: 'text-house-accent',
  muted: 'text-house-text-muted',
  panel: 'bg-house-surface',
  styles: 'bg-house-surface text-house-text',
  stringy: 'other-theme-white'
}

// Project-specific theme names from Storyblok should be mapped here. Keep the
// CMS values arbitrary and client-friendly; keep Tailwind classes visible here
// so the build can include them.
const projectThemes: Record<string, ThemeClassInput> = {
  black: {
    background: 'bg-black',
    color: 'text-white',
    border: 'border-white/20',
    alt: 'text-gold',
    muted: 'text-black',
    panel: 'bg-black',
    styles: 'bg-black text-white',
    stringy: 'other-theme-black'

  },
  white: {
    background: 'bg-white',
    color: 'text-black',
    border: 'border-black/20',
    alt: 'text-fuchsia',
    muted: 'text-white',
    panel: 'bg-white',
    styles: 'bg-white text-black',
    stringy: 'other-theme-white'

  },
  gold: {
    background: 'bg-gold',
    color: 'text-black',
    border: 'border-black/20',
    alt: 'text-fuchsia',
    muted: 'text-gold',
    panel: 'bg-gold',
    styles: 'bg-gold text-black',
    stringy: 'other-theme-gold'
  },
  fuchsia: {
    background: 'bg-fuchsia',
    color: 'text-white',
    border: 'border-white/20',
    alt: 'text-gold',
    muted: 'text-fuchsia',
    panel: 'bg-fuchsia',
    styles: 'bg-fuchsia text-white',
    stringy: 'other-theme-fuchsia'
  },
  teal: {
    background: 'bg-teal',
    color: 'text-white',
    border: 'border-white/20',
    alt: 'text-gold',
    muted: 'text-teal',
    panel: 'bg-teal',
    styles: 'bg-teal text-white',
    stringy: 'other-theme-teal'
  },
  'race-red': {
    background: 'bg-race-red',
    color: 'text-white',
    border: 'border-white/20',
    alt: 'text-gold',
    muted: 'text-race-red',
    panel: 'bg-carbon-soft',
    styles: 'bg-race-red text-white',
    stringy: 'other-theme-race-red'
  },
  'racing-red': {
    background: 'bg-race-red',
    color: 'text-white',
    border: 'border-white/20',
    alt: 'text-gold',
    muted: 'text-race-red',
    panel: 'bg-carbon-soft',
    styles: 'bg-race-red text-white',
    stringy: 'other-theme-race-red'
  },
  red: {
    background: 'bg-race-red',
    color: 'text-white',
    border: 'border-white/20',
    alt: 'text-gold',
    muted: 'text-race-red',
    panel: 'bg-carbon-soft',
    styles: 'bg-race-red text-white',
    stringy: 'other-theme-race-red'
  }
}

export const getThemeData = (theme?: string): ThemeClassData => {
  const slug = normalizeThemeName(theme)
  const mappedTheme = slug ? projectThemes[slug] : undefined
  const themeData = {
    ...defaultTheme,
    ...(mappedTheme || {})
  }
  const baseClasses = ['section-theme']
  const themeClass = themeData.stringy ? [themeData.stringy] : slug ? [`other-theme-${slug}`] : []

  return {
    name: theme || '',
    slug,
    ...themeData,
    classes: [...baseClasses, ...themeClass],
    styles: themeData.styles || [themeData.background, themeData.color].filter(Boolean).join(' ')
  }
}

export const getThemeClasses = (theme?: string) => {
  const themeData = getThemeData(theme)

  return [...themeData.classes, themeData.styles].filter(Boolean)
}
