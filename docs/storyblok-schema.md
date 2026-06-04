# Storyblok Schema

## Current Approach

The starter uses Storyblok as its only content source. It should fail loudly when required CMS data is missing rather than falling back to placeholder content.

Each client will have its own Storyblok space. New client spaces should initially be copied from the master space.

Storyblok controls site structure and URLs. The frontend should not hard-code assumptions such as articles always living under `/news` or games always living under `/games`.

The current Storyblok integration uses the EU CDN region and server-side tokens from `.env`.

## Content Types

### `page`

The main flexible page type.

Fields:

| Field | Type | Notes |
| --- | --- | --- |
| `body` | Blocks | Ordered list of page sections |
| `seo` | Plugin | Storyblok SEO app field using `seo-metatags` |
| `seo_image` | Asset | Explicit image field for SEO/social fallback behavior |

Internal normalized shape:

```ts
type NormalizedStandardPage = {
  type: 'page'
  slug: string
  name: string
  seo: NormalizedSeo
  seoImage?: NormalizedImage
  sections: NormalizedSection[]
}
```

### `article`

Structured page type for news, blog, updates, announcements, and editorial content.

Fields:

| Field | Type | Notes |
| --- | --- | --- |
| `title` | Text | Main article title |
| `date` | Date/Datetime | Published or display date |
| `article` | Richtext | Main article body |
| `image` | Asset | Main article image |
| `preview` | Text | Optional summary used by article cards |
| `featured` | Boolean | Optional flag used by `news_section` featured mode |
| `seo` | Plugin | Storyblok SEO app field using `seo-metatags` |
| `seo_image` | Asset | Explicit image field for SEO/social fallback behavior |

Internal normalized shape:

```ts
type NormalizedArticlePage = {
  type: 'article'
  slug: string
  name: string
  title: string
  date: string
  article: NormalizedRichText
  image?: NormalizedImage
  seo: NormalizedSeo
  seoImage?: NormalizedImage
}
```

### `game`

Structured page type for game detail or campaign pages.

The exact field list will be expanded later. It is expected to be similar to `article`, but with additional game-specific fields.

Temporary internal normalized shape:

```ts
type NormalizedGamePage = {
  type: 'game'
  slug: string
  name: string
  title: string
  summary?: string
  image?: NormalizedImage
  seo: NormalizedSeo
  seoImage?: NormalizedImage
}
```

TODO: Define the full `game` schema once the master Storyblok space is reviewed.

### `modal`

Overlay page type for shareable modal content. Modal stories can live anywhere, but `/modal/...` or `/modals/...` is the recommended folder pattern because it lets the frontend recognize modal links without an extra Storyblok lookup.

Fields:

| Field | Type | Notes |
| --- | --- | --- |
| `copy` | Richtext | Modal content rendered inside the modal panel. Use richtext embeddable blocks for controlled modal media, buttons, and related content. |

Runtime URL pattern:

```txt
/current-page?_=offer
/current-page?_=path/to/offer
```

Opening `/offer` directly redirects to the homepage with `?_=offer` applied.

Internal normalized shape:

```ts
type NormalizedModalPage = {
  type: 'modal'
  slug: string
  name: string
  copy: NormalizedRichText
  seo: { noIndex: true }
}
```

### `site-settings`

Global site settings live at the Storyblok path `/admin`. This story is not a public page. It feeds the public site shell and has a dedicated editor-only preview template.

Fields:

| Field | Type | Notes |
| --- | --- | --- |
| `name` / `site_name` | Text | Site-wide display name. The current master space uses `name`; `site_name` remains supported as a clearer future alias |
| `logo` | Asset | Header/footer brand asset |
| `icon` | Asset | Used as the favicon where available |
| `domain` | Text | Public canonical site URL. Used for canonical links, `robots.txt`, and `sitemap.xml`; accepts a full URL or bare domain |
| `gtm_id` | Text | Optional Google Tag Manager container ID. GTM only loads after analytics or marketing consent |
| `contact_email` | Text | Contact form recipient email address |
| `cookie_consent_enabled` | Boolean | Optional. Defaults to enabled when unset |
| `navigation` | Blocks | Header navigation items; items should expose `label` and `link` where possible |
| `legal` | Richtext | Footer legal/supporting text |
| `preview` | Richtext | Editor-only richtext test field |
| `cookies` | Richtext | Cookie banner message |
| `error` | Richtext | Site-wide error page content |
| `seo` | Plugin | Site-wide default SEO fallback |
| `seo_image` | Asset | Site-wide default social image fallback |

Internal normalized shape:

```ts
type NormalizedSiteSettings = {
  type: 'site-settings'
  slug: string
  name: string
  siteName: string
  logo?: NormalizedImage
  icon?: NormalizedImage
  domain?: string
  gtmId?: string
  contactEmail?: string
  cookieConsentEnabled: boolean
  navigation: NormalizedNavigationItem[]
  legal: NormalizedRichText
  preview: NormalizedRichText
  cookies: NormalizedRichText
  error: NormalizedRichText
  seo: NormalizedSeo
  seoImage?: NormalizedImage
}
```

Public routes and public Storyblok story API requests must not expose `/admin`. The editor preview renders `/admin` only when `STORYBLOK_EDITOR_MODE` is enabled and the branch access token gate has been passed.

## SEO Field

The `seo` field uses the official Storyblok SEO app as a custom plugin field. The field should use the `seo-metatags` custom type.

The Storyblok SEO app provides a Google snippet preview, standard meta title and description fields, and Open Graph title, description, and image fields.

The separate `seo_image` asset field remains part of the content model. During normalization, it should be treated as a project-level fallback or override where useful.

Suggested normalized shape:

```ts
type NormalizedSeo = {
  title?: string
  description?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: NormalizedImage
  noIndex?: boolean
}
```

## Section Components

Sections are page-level content blocks placed inside the `page.body` field.

Section components currently seen in the master Storyblok space:

| Storyblok component | Vue component |
| --- | --- |
| `accordion_section` | `AccordionSection.vue` |
| `cards_section` | `CardsSection.vue` |
| `feature_section` | `FeatureSection.vue` |
| `hero_section` | `HeroSection.vue` |
| `form_section` | `FormSection.vue` |
| `gallery_section` | `GallerySection.vue` |
| `games_section` | `GamesSection.vue` |
| `leaderboard_section` | `LeaderboardSection.vue` |
| `media_section` | `MediaSection.vue` |
| `news_section` | `NewsSection.vue` |
| `richtext_section` | `RichtextSection.vue` |
| `spotlight_section` | `SpotlightSection.vue` |
| `testimonials_section` | `TestimonialsSection.vue` |
| `timeline_section` | `TimelineSection.vue` |

TODO: Re-run the Storyblok field audit when the master space schema changes. The current section mapping was checked against live Storyblok payloads on 2026-05-30.

### `hero_section`

| Field | Type | Notes |
| --- | --- | --- |
| `copy` | Richtext | Normalized before rendering |
| `ctas` | Blocks | Accepts `cta` cards |
| `video` | Text | YouTube or Vimeo URL |
| `image` | Asset | Image only |
| `theme` | Single option | Passed through `getThemeData()` / `getThemeClasses()` |

### `accordion_section`

| Field | Type | Notes |
| --- | --- | --- |
| `copy` | Richtext | Intro or supporting accordion copy |
| `items` | Blocks | Accepts `instance_accordion` cards |
| `theme` | Single option | Passed through `getThemeData()` / `getThemeClasses()` |

### `cards_section`

| Field | Type | Notes |
| --- | --- | --- |
| `copy` | Richtext | Intro or supporting card copy |
| `items` | Blocks | Accepts card-style child blocks such as `instance_card` and `instance_person` |
| `columns` | Custom plugin | Optional per-breakpoint grid columns, for example `xs:1, md:2, xl:3` |
| `theme` | Single option | Passed through `getThemeData()` / `getThemeClasses()` |

### `feature_section`

| Field | Type | Notes |
| --- | --- | --- |
| `copy` | Richtext | Main feature copy |
| `image` | Asset | Optional image |
| `align` | Single option | `left`, `right`, or `default`; `default` alternates by page position |
| `theme` | Single option | Passed through `getThemeData()` / `getThemeClasses()` |

### `form_section`

| Field | Type | Notes |
| --- | --- | --- |
| `copy` | Richtext | Intro or supporting form copy |
| `button_label` | Text | Submit button text |
| `thanks` | Single option | Stories source filtered to `page`; UUID resolved to a page path after successful submit |
| `theme` | Single option | Passed through `getThemeData()` / `getThemeClasses()` |

### `gallery_section`

| Field | Type | Notes |
| --- | --- | --- |
| `copy` | Richtext | Intro or supporting gallery copy |
| `items` | Blocks | Accepts `instance_media` cards |
| `theme` | Single option | Passed through `getThemeData()` / `getThemeClasses()` |

### `games_section`

| Field | Type | Notes |
| --- | --- | --- |
| `copy` | Richtext | Intro or supporting games copy |
| `items` | Stories | Game story references. UUIDs are resolved to game summary cards during SSR/prerender |
| `theme` | Single option | Passed through `getThemeData()` / `getThemeClasses()` |

### `leaderboard_section`

| Field | Type | Notes |
| --- | --- | --- |
| `copy` | Richtext | Intro or supporting leaderboard copy |
| `csv` | Text | Raw leaderboard data placeholder |
| `theme` | Single option | Passed through `getThemeData()` / `getThemeClasses()` |

### `media_section`

| Field | Type | Notes |
| --- | --- | --- |
| `image` | Asset | Optional image |
| `video` | Text | YouTube or Vimeo URL |
| `video_controls` | Boolean | Shows provider controls when enabled |
| `video_autoplay` | Boolean | Enables muted looping autoplay |
| `caption` | Text | Optional caption |
| `size` | Single option | Project styling hook |
| `theme` | Single option | Passed through `getThemeData()` / `getThemeClasses()` |

### `news_section`

| Field | Type | Notes |
| --- | --- | --- |
| `copy` | Richtext | Intro or supporting news copy |
| `type` | Single option | `all` or `featured` |
| `articles` | Number | Initial number of articles to display |
| `theme` | Single option | Passed through `getThemeData()` / `getThemeClasses()` |

`news_section` fetches article summaries through the active content source. In Storyblok mode, `type: featured` applies `filter_query[featured][is]=true` against the `article.featured` field.

### `richtext_section`

| Field | Type | Notes |
| --- | --- | --- |
| `copy` | Richtext | Main richtext content |
| `theme` | Single option | Passed through `getThemeData()` / `getThemeClasses()` |

### `spotlight_section`

| Field | Type | Notes |
| --- | --- | --- |
| `label` | Text | Optional short label |
| `title` | Text | Optional section title |
| `copy` | Richtext | Main spotlight copy |
| `ctas` | Blocks | Accepts `cta` cards |
| `image` | Asset | Optional image |
| `story` | Story/link reference | Optional linked story |
| `theme` | Single option | Passed through `getThemeData()` / `getThemeClasses()` |

### `testimonials_section`

| Field | Type | Notes |
| --- | --- | --- |
| `copy` | Richtext | Intro or supporting testimonial copy |
| `items` | Blocks | Accepts `instance_testimonial` cards |
| `theme` | Single option | Passed through `getThemeData()` / `getThemeClasses()` |

### `timeline_section`

| Field | Type | Notes |
| --- | --- | --- |
| `copy` | Richtext | Intro or supporting timeline copy |
| `items` | Blocks | Accepts `instance_timeline` cards |
| `theme` | Single option | Passed through `getThemeData()` / `getThemeClasses()` |

## Card Components

Cards are repeated child items used inside sections.

Child block components currently seen in the master Storyblok space:

| Storyblok component | Vue component |
| --- | --- |
| `cta` | `CtaItem.vue`, usually through `CtaList.vue` |
| Game story references | `GameCard.vue`, through `games_section` |
| `instance_accordion` | Rendered inside `AccordionSection.vue` |
| `instance_card` | `ContentCard.vue` |
| `instance_media` | `GalleryCard.vue` |
| `instance_person` | `ContentCard.vue` |
| `instance_testimonial` | `TestimonialCard.vue` |
| `instance_timeline` | `ContentCard.vue` |

### `cta`

| Field | Type | Notes |
| --- | --- | --- |
| `label` | Text | Link text or image alt fallback |
| `link` | Link | Supports Storyblok story, URL, and email links |
| `icon` | Text/plugin TODO | Material Symbol name. `none` renders no icon. `default` maps to the link type |
| `button` | Boolean | Defaults to `true`; false renders as text-style link |
| `image` | Asset | If set, render as an image link, such as an app store badge |

### `instance_media`

| Field | Type | Notes |
| --- | --- | --- |
| `video` | Text | YouTube or Vimeo URL |
| `image` | Asset | Optional image |

### `instance_card`

| Field | Type | Notes |
| --- | --- | --- |
| `title` | Text | Card title |
| `subtitle` | Text | Optional supporting label |
| `copy` | Richtext | Main card copy |
| `ctas` | Blocks | Accepts `cta` cards |
| `image` | Asset | Optional image |
| `align` | Single option | Text/CTA alignment |

### `instance_person`

| Field | Type | Notes |
| --- | --- | --- |
| `name` | Text | Person name |
| `role` | Text | Person role |
| `biography` | Richtext | Person biography |
| `ctas` | Blocks | Accepts `cta` cards |
| `image` | Asset | Optional image |

### `instance_testimonial`

| Field | Type | Notes |
| --- | --- | --- |
| `quote` | Text | Testimonial quote |
| `name` | Text | Person name |
| `role` | Text | Person role |
| `image` | Asset | Optional image |

### `instance_accordion`

| Field | Type | Notes |
| --- | --- | --- |
| `title` | Text | Accordion summary text |
| `copy` | Richtext | Accordion panel copy |

### `instance_timeline`

| Field | Type | Notes |
| --- | --- | --- |
| `title` | Text | Timeline item title |
| `copy` | Richtext | Timeline item copy |
| `image` | Asset | Optional image |

## Media Conventions

Images and videos should normalize into a shared media shape before reaching sections.

Suggested image shape:

```ts
type NormalizedImage = {
  src: string
  alt: string
  title?: string
  width?: number
  height?: number
  focalPoint?: string
}
```

Accessibility expectations:

- Editorial and informational images require meaningful `alt` text.
- Decorative images should normalize to an empty `alt` value.
- Video content should provide captions, transcripts, or a documented project-level exception.

Rendered images should use `OptimizedImage.vue`, which creates responsive Storyblok Image Service URLs and applies focal point positioning where possible.

## Richtext Conventions

Storyblok richtext should be rendered through a shared richtext renderer, not directly inside every section or template.

The renderer should handle:

- Semantic headings
- H1 headings where the content model/editor intentionally uses them
- Links
- Lists
- Images
- Blockquotes
- Horizontal rules
- Common text marks
- Accessible link text
- External link behavior
- Text alignment values from Storyblok richtext nodes: `left`, `center`, `right`, and `justify`
- Embedded richtext Storyblok blocks:
  - `instance_richtext_buttons`
  - `instance_richtext_embed`
  - `instance_richtext_game`
  - `instance_richtext_image`
  - `instance_richtext_video`

Embedded richtext blocks are normalized as raw Storyblok blok params and rendered through files in `app/components/richtext/`, so project teams can add layout and visual styling without changing the resolver.

## Storyblok Data

New client spaces should be copied from the master Storyblok space so the required page, article, game, section, card, and site-settings schemas exist before the first build.
