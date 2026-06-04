# Boring Thing Architecture

## Purpose

Boring Thing is a copy-per-project starter for Other Things websites. It should make the repeatable foundation of a web project fast, predictable, performant, accessible, and easy to extend for each client brand.

The starter is aimed at:

- Portfolio and studio sites for game developers and publishers
- Campaign sites for games and gaming products
- Marketing pages for game services
- Mini-sites that drive awareness, pre-orders, wishlists, signups, trailers, press-kit downloads, or similar campaign goals

## Stack

- Nuxt 4 and Vue
- Tailwind CSS
- Storyblok
- Netlify
- Google Tag Manager
- Netlify Functions
- SendGrid
- pnpm

## Distribution Model

Boring Thing is a copy-per-project starter.

Each client project should begin as a copy of this repository and then diverge as needed for the brand, campaign, or product. The starter should avoid assumptions that require all future projects to keep tracking a shared package or Nuxt layer.

## Rendering Strategy

The default rendering model is hybrid and static-first.

Most content pages should be statically generated from Storyblok data. Dynamic behavior, such as future Instagram feeds, form submission, preview mode, or campaign-specific integrations, can use server routes, Netlify Functions, or Storyblok preview behavior as required.

Storyblok is the only content source. Missing CMS data should fail loudly during development or build rather than falling back to incorrect placeholder content.

## Data Flow

```txt
Storyblok data
  -> Storyblok fetcher
  -> normalization layer
  -> page resolver
  -> template
  -> sections
  -> cards
```

Components should not need to understand raw Storyblok field shapes. Source data should be normalized into stable internal types first.

## Content Source Contract

Content fetching should go through a source interface:

```ts
type ContentSource = {
  getPageBySlug: (slug: string) => Promise<NormalizedPage | null>
  getAllPagePaths: () => Promise<string[]>
  getSiteSettings?: () => Promise<NormalizedSiteSettings | null>
}
```

The current source is `storyblokContentSource`. Server API routes fetch CMS data using server-only tokens and return normalized data to the Nuxt app.

Global settings come from the Storyblok `site-settings` story at `/admin`. They are normalized separately from pages and feed the header, footer, cookie banner, favicon, error page content, GTM ID, contact recipient, canonical domain, and default SEO fallback. `/admin` is not part of the public route tree; it renders only in editor mode through a blank admin layout.

The default Storyblok editor flow is gated by `STORYBLOK_EDITOR_MODE`. Editor mode keeps content pages dynamic and lazy-loads Storyblok's bridge script only for editor requests. The `storyblok` branch should also use `STORYBLOK_EDITOR_ACCESS_TOKEN` so direct public visits without the preview token return a 404. `STORYBLOK_ENABLE_BRIDGE` is retained as an escape hatch for projects that choose the official `@storyblok/nuxt` bridge module.

The catch-all route should stay thin:

```txt
app/pages/[...slug].vue
  -> resolvePage()
  -> Storyblok content source
  -> Storyblok normalization
  -> SEO resolution
  -> page template
```

## Normalization Helpers

The normalization layer lives in `app/utils/content/`.

Current helper files:

- `content-source.ts`
- `resolve-page.ts`
- `seo.ts`
- `media.ts`
- `richtext.ts`
- `sections.ts`
- `storyblok-richtext.ts`
- `storyblok-mappers.ts`
- `resolve-articles.ts`

These helpers are the boundary for translating Storyblok API responses into internal page, section, card, media, SEO, and richtext shapes.

## Page Types

Boring Thing supports multiple page types from the start:

- `page`: flexible, section-based page
- `article`: structured article/news/blog page
- `game`: structured game page, to be expanded later

Storyblok controls the URL structure. The Nuxt route should resolve a story by slug and then render the correct template based on the content type.

## Template Model

```txt
app/pages/[...slug].vue
  -> resolve normalized page
  -> choose template
  -> render template
```

Planned templates:

- `PageTemplate.vue`
- `ArticleTemplate.vue`
- `GameTemplate.vue`

## Section And Card Naming

Reusable page-level content blocks are called sections.

Repeated child items are called cards.

Examples:

```txt
app/components/sections/HeroSection.vue
app/components/sections/GallerySection.vue
app/components/sections/FormSection.vue
app/components/sections/TestimonialsSection.vue

app/components/cards/TestimonialCard.vue
app/components/cards/GalleryCard.vue
```

Storyblok component names should mirror this where possible:

```txt
hero_section
gallery_section
form_section
news_section
testimonials_section
cta
instance_media
```

Section rendering should go through the central registry in `app/utils/content/sections.ts`. Unknown section types render through `UnknownSection.vue` so schema drift is visible during development instead of failing silently.

## Core Systems

Boring Thing should include stable systems for:

- SEO and metadata
- Google Tag Manager
- Cookie consent
- Storyblok image optimization
- Richtext rendering
- Contact form submission
- Netlify security headers
- Page loading and page transitions
- Development/debug helpers
- Accessibility helpers and conventions

## Consent Model

The starter should use three consent categories:

- `necessary`
- `analytics`
- `marketing`

The first implementation should be simple and self-managed. It should be designed so a project can later replace it with a CMP such as OneTrust without rewriting analytics and marketing tag logic.

## Forms

The starter includes one simple contact form.

The default flow should be:

```txt
FormSection.vue
  -> useContactForm()
  -> /api/contact
  -> Netlify Function
  -> SendGrid
```

Project-specific forms, such as newsletter signup, press access, beta registration, or pre-order interest, should be added by individual projects rather than baked into the starter.

## Styling Philosophy

Tailwind provides the base styling system. Boring Thing should include enough CSS for useful defaults, accessibility, layout primitives, and core sections, but each client project must be able to layer its own brand system on top.

The starter should avoid heavy visual opinions. It should be solid, semantic, responsive, accessible, and easy to restyle.

## Fonts

Fonts are a project-level design concern, not CMS content.

The starter loads Google Fonts and Material Symbols through static Nuxt head links in `nuxt.config.ts` and exposes font families through Tailwind theme tokens in `app/assets/css/main.css`. This keeps font choices close to the project design system and avoids letting CMS users change brand typography accidentally.

The starter currently includes Raleway Black as the first display font. Client projects should replace or extend the Google Fonts links and `--font-*` tokens as part of their design setup, keeping the loaded weights as small as practical.

Material Symbols are available globally through the Google `material-symbols-outlined` class and the `MaterialIcon.vue` helper component. Shared link semantics live in `SmartLink.vue`; CTAs and richtext links both use that primitive so internal, external, email, asset, hash, and action links behave consistently. CTA icons are resolved in `CtaItem.vue`, including sensible defaults for internal, external, email, and asset links.

Storyblok section `theme` values are arbitrary client/project words. The helper in `app/utils/theme.ts` normalizes that word, returns stable hooks such as `section-theme--dark`, and maps known project words to explicit Tailwind classes:

```ts
const theme = getThemeData(section.theme)

theme.background
theme.color
theme.border
theme.alt
theme.styles
```

Add project-specific theme names to `projectThemes` in `app/utils/theme.ts`. Do not build Tailwind class names directly from CMS strings, because Tailwind needs to see class names at build time.

## Image Sizing Strategy

Storyblok image optimization is handled through `OptimizedImage.vue` and the Storyblok Image Service.

The browser chooses the downloaded image candidate from `srcset`, but it needs an accurate `sizes` value to do that well. The starter does not try to inspect DOM container widths at runtime. Instead, known layout contracts generate `sizes` strings:

- Full-bleed media uses `100vw`.
- Container fractions and responsive Tailwind width class strings use `getContainerImageSizes()` from `app/utils/image-sizes.ts`.
- CMS-controlled card grids use `getGridImageSizes()` from `app/utils/image-sizes.ts`, based on the same Storyblok columns value used by `getGridColumnClasses()`.

`app/utils/image-sizes.ts` duplicates the Tailwind container breakpoints as a simple source of truth for image calculations. If a project changes container widths in Tailwind/CSS, update the helper too. The helper intentionally ignores gaps and padding so images are slightly generous rather than brittle.

## Page Transitions

`app/components/site/PageTransitionOverlay.vue` provides both first-load and route-change motion. First load uses `loader` mode, while internal navigation uses `transition` mode. The modes look the same in the starter, but projects can style `.page-transition-overlay--loader` and `.page-transition-overlay--transition` differently.

Transitions are disabled only for actual Storyblok live editor sessions: editor preview params or iframe context. A direct visit to an editor-mode branch can still show transitions.

The overlay shell is rendered in SSR HTML to avoid flashing the page before hydration. The loading text itself is only rendered on the client and is `aria-hidden`, so it is not part of page metadata or search snippets.

The default transition is a fade overlay. Projects can change the animation by editing the `.page-transition-overlay` and `.page-loader-fade-*` classes in `app/assets/css/main.css`, or by replacing the component while keeping the same route hook pattern.

`NUXT_PUBLIC_PAGE_LOADER_MIN_MS` controls the first-load minimum visible duration. `NUXT_PUBLIC_PAGE_TRANSITION_MIN_MS` controls the route-transition minimum visible duration. Keep production values low or `0` when transitions should clear as soon as content is ready.

Failed navigations and Nuxt route errors must hide the overlay immediately so missing Storyblok pages render the CMS error page rather than a blank/black screen.

## Performance Philosophy

Performance is a core product feature of the starter.

Default expectations:

- Static generation wherever practical
- Minimal client JavaScript
- Lazy loading for non-critical media
- Responsive image sizing
- Font loading discipline
- Consent-aware third-party scripts
- No unnecessary global dependencies
- Clear performance budgets before launch

## Documentation Philosophy

Documentation should live close to the system it explains.

Use comments in source files for TODOs, project assumptions, and non-obvious implementation details. Avoid comments that simply repeat what the code says.

Repository-level docs should explain architecture, schema, setup, launch, and extension points.

## Implementation Phases

1. Architecture and documentation
2. Nuxt 4 starter foundation with Storyblok data
3. Page resolver, templates, and section registry
4. Storyblok integration
5. Normalization layer
6. Core systems
7. Core sections and cards
8. Quality gates and launch tooling

Current status: phases 1-4 are in place at a first working level. Phase 6A is in place, with Storyblok normalization covering pages, articles, games, SEO fields, assets, richtext, sections, CTAs, gallery media, responsive images, article summary queries, consent-gated GTM loading, generated public system routes, contact-form hardening, and the Netlify production/preview/editor deployment model.

Phase 6A has added per-deploy Netlify headers, a `storyblok` branch deployment model, dynamic draft rendering for the editor deployment, and lazy Storyblok bridge loading.
