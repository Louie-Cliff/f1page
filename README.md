# Boring Thing

The Other Things starter template for fast, performant, accessible websites in the video games industry.

Boring Thing exists to own the repeatable web development work that should not be re-solved on every project: routing, CMS integration, SEO, consent, analytics, forms, media handling, page transitions, core sections, and project launch setup.

## Project Direction

- Nuxt 4 / Vue with the `/app` directory structure
- Tailwind CSS for styling
- Storyblok for content management
- Netlify for hosting
- Hybrid rendering, with static generation as the default posture
- Google Tag Manager with consent-aware loading
- Netlify Functions and SendGrid for the starter contact form
- Storyblok data normalized before it reaches Vue sections and cards

## Documentation

- [Setup Guide](docs/setup-guide.md)
- [Architecture](docs/architecture.md)
- [Storyblok Schema](docs/storyblok-schema.md)
- [Developer Notes](docs/developer-notes.md)
- [Colleague Handoff Checklist](docs/colleague-handoff.md)
- [Preview And Editor Deploys](docs/preview-editor-deploys.md)

## Current Phase

Phase 6A is the share-ready deploy and Storyblok editor workflow.

Storyblok is the only content source. Stories are fetched through server API routes, normalized into internal page/section/card types, and rendered by the shared templates and section registry.

Current shared primitives include normalized richtext rendering, responsive Storyblok images, article summary queries for `news_section`, consent-gated Google Tag Manager loading, SendGrid contact handling with starter rate limiting, generated `robots.txt` / `sitemap.xml` routes, and a Netlify deploy-context model for production, previews, and Storyblok editing.

Responsive images use `OptimizedImage.vue` plus layout-aware helpers in `app/utils/image-sizes.ts`. Full-bleed media should use `100vw`; container/card layouts should generate `sizes` from known layout rules rather than guessing in each component.

Project fonts are configured in code, not Storyblok. Google Fonts and Material Symbols are loaded from `nuxt.config.ts`, and Tailwind font tokens live in `app/assets/css/main.css`. The starter currently includes Raleway Black as `font-display`.

## Local Development

Install dependencies:

```sh
pnpm install
```

Run the dev server:

```sh
pnpm dev
```

Use Storyblok editor mode locally when testing the Visual Editor flow:

```sh
pnpm dev:storyblok
```

`dev:storyblok` runs Nuxt in draft editor mode over HTTPS, which lets Storyblok load your local site inside the Visual Editor. Point Storyblok's Preview URL at:

```txt
https://localhost:3000/_preview/YOUR_STORYBLOK_EDITOR_ACCESS_TOKEN/
```

Keep the trailing slash after the token. The first time you use the local HTTPS URL, open it directly in the browser and accept/trust the local certificate if prompted. Editor mode keeps the official Storyblok Nuxt bridge module disabled by default and lazy-loads Storyblok's bridge script only when the page is opened by the Visual Editor.

The editor-only `/admin/deploy` page includes a Netlify deploy panel. Configure these server-side variables to enable it:

```txt
NETLIFY_SITE_ID=""
NETLIFY_BUILD_HOOK_URL=""
NETLIFY_AUTH_TOKEN=""
```

The build hook enables the deploy button. The auth token enables deploy status, recent history, and summary stats.

Useful checks:

```sh
pnpm typecheck
pnpm build
```

Example Storyblok routes from the current test space:

- `/`
- `/about`
- `/news/lorem-ipsum-dolor-sit`
- `/games/astroland`

Environment values live in `.env`. Copy `.env.example` and fill in the Storyblok tokens for local development.

## Content Pipeline

The route stays thin and delegates content work to `app/utils/content/`:

```txt
app/pages/[...slug].vue
  -> resolvePage()
  -> Storyblok content source
  -> Storyblok normalization
  -> template
  -> sections/cards
```

Current source:

```txt
app/utils/content/storyblok-content-source.ts
```

Storyblok server routes:

```txt
server/api/contact.post.ts
server/api/storyblok/story.get.ts
server/api/storyblok/paths.get.ts
server/api/storyblok/articles.get.ts
```

Contact form email is sent with SendGrid through `/api/contact`. Configure:

```txt
SENDGRID_API_KEY
CONTACT_RATE_LIMIT_MAX
CONTACT_RATE_LIMIT_EMAIL_MAX
CONTACT_RATE_LIMIT_WINDOW_MS
```

The recipient email comes from `site-settings.contact_email` in Storyblok. The from address is fixed to the Other Things mailbot in code. The contact endpoint has a lightweight in-memory rate limit. This protects against bursts while a Netlify Function instance is warm, but project launches with meaningful traffic should still add provider-level spam and abuse controls where needed.

Google Tag Manager is loaded only after a visitor has accepted analytics or marketing cookies. Configure the container ID with `site-settings.gtm_id` in Storyblok. Cookie consent is enabled by default and can be disabled per project with `site-settings.cookie_consent_enabled`.

Storyblok editor previews use a stable Netlify branch deploy named `storyblok`. See [Preview And Editor Deploys](docs/preview-editor-deploys.md).
