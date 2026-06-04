# Colleague Handoff Checklist

Use this before sharing a copy of Boring Thing with another developer.

For a full first-run sequence, start with [Setup Guide](setup-guide.md). This checklist is the shorter handoff view once someone already understands the project shape.

## What Works Now

- Nuxt 4 app foundation with Tailwind CSS.
- Storyblok content behind the shared page resolver.
- Storyblok EU CDN integration using server-side routes.
- Static route generation from the active content source.
- `page`, `article`, and early `game` template support.
- Storyblok `site-settings` support for header, footer, cookie copy, favicon, and default SEO.
- Section/card registry with unknown-section fallback.
- Richtext rendering without `v-html`.
- Responsive Storyblok image service URLs.
- `news_section` article summaries from Storyblok.
- Simple cookie preference UI.
- Consent-gated Google Tag Manager loader.
- Netlify production/deploy-preview/editor context defaults.
- Lazy Storyblok Visual Editor bridge loading on the `storyblok` branch deploy.
- Contact form submission through `/api/contact` and SendGrid.
- Honeypot, submit-time validation, server validation, and starter rate limiting for contact submissions.
- Storyblok UUID-to-route resolution for `form_section.thanks`.
- Editor-only `/admin` preview for the `site-settings` story.
- Netlify headers for baseline security and static asset caching.
- Generated `/robots.txt` and `/sitemap.xml`.

## Local Setup

1. Install dependencies:

```sh
pnpm install
```

2. Copy `.env.example` to `.env`.

3. Add project-specific values:

```txt
STORYBLOK_PREVIEW_TOKEN
STORYBLOK_PUBLIC_TOKEN
STORYBLOK_EDITOR_ACCESS_TOKEN
SENDGRID_API_KEY
```

The `/admin` Storyblok story owns public project settings: `site_name`, `domain`, `gtm_id`, `contact_email`, `cookie_consent_enabled`, logo, icon, navigation, legal copy, cookie copy, default SEO, and error content. The `domain` field is the source of truth for canonicals, robots, and sitemap output, including preview/editor deploys.

4. Run locally:

```sh
pnpm dev
```

5. Check the project before sharing changes:

```sh
pnpm typecheck
pnpm build
```

## Storyblok Mode

Storyblok is the only content source. Make sure `.env` contains valid Storyblok tokens before running the app:

```sh
pnpm dev
```

Use editor mode when working inside the Storyblok Visual Editor:

```sh
pnpm dev:storyblok
```

This runs the local Nuxt server over HTTPS in draft editor mode. Set Storyblok's Visual Editor Preview URL to:

```txt
https://localhost:3000/_preview/YOUR_STORYBLOK_EDITOR_ACCESS_TOKEN/
```

Keep the trailing slash after the token, and open the URL directly once to accept/trust the local certificate if the browser prompts. Leave `STORYBLOK_ENABLE_BRIDGE` disabled for the default starter workflow. The editor bridge is lazy-loaded only when an editor-mode deployment is opened by Storyblok.

## SendGrid

The contact form needs a rotated SendGrid API key in `.env` or Netlify environment variables. Do not reuse keys that have been pasted into chat, tickets, or docs.

Required variables:

```txt
SENDGRID_API_KEY
```

Optional starter rate-limit variables:

```txt
CONTACT_RATE_LIMIT_MAX="5"
CONTACT_RATE_LIMIT_EMAIL_MAX="3"
CONTACT_RATE_LIMIT_WINDOW_MS="600000"
```

`form_section.thanks` may be a Storyblok UUID from a Stories single-option field. `/api/contact` resolves that UUID to the current page path before redirecting after a successful submission.

The recipient email comes from `site-settings.contact_email`. The from address is hard-coded to `mailbot@otherthingsagency.com` with the sender name `Other Things Mailbot`.

## Analytics And Consent

Set `site-settings.gtm_id` to enable Google Tag Manager. The GTM script is only injected after the visitor has accepted analytics or marketing cookies.

`site-settings.cookie_consent_enabled` defaults to enabled. Set it to `false` only when a project uses a CMP such as OneTrust or deliberately does not need the starter banner.

The Storyblok editor branch suppresses the floating cookie banner on normal pages so it does not block content editing. The `/admin` settings preview renders a static, always-visible cookie banner inside the preview area without writing consent.

## Netlify

Expected build settings:

```txt
Build command: pnpm build
Publish directory: dist
Node version: 24
NITRO_PRESET: netlify
```

Set production Storyblok builds to published content unless a project specifically needs draft behavior:

```txt
STORYBLOK_VERSION="published"
```

Use one Netlify site per client project:

```txt
production: published Storyblok content, static-first
deploy-preview: draft Storyblok content, static-first, no editor bridge
storyblok branch: draft Storyblok content, dynamic pages, lazy editor bridge
```

In Storyblok, set Settings -> Visual Editor -> Preview URL to:

```txt
https://storyblok--site-name.netlify.app/_preview/YOUR_STORYBLOK_EDITOR_ACCESS_TOKEN/
```

The `storyblok` branch must be enabled as a Netlify branch deploy. Direct branch visits without the `bt_preview` token return a 404. See `docs/preview-editor-deploys.md`.

The editor-only `/admin/deploy` page can trigger Netlify builds and display main branch deploy status/history. Add these server-side env vars to Netlify:

```txt
NETLIFY_SITE_ID
NETLIFY_BUILD_HOOK_URL
NETLIFY_AUTH_TOKEN
```

`NETLIFY_BUILD_HOOK_URL` enables the build button. `NETLIFY_AUTH_TOKEN` enables deploy progress, recent history, and simple stats. Keep both values out of Storyblok fields and client-side runtime config.

## First Netlify Site Setup

There is no shared Netlify site committed into this starter. Each copied client project should create or link one Netlify site.

1. Log in to Netlify:

```sh
pnpm netlify:login
```

2. Create or link the site:

```sh
pnpm netlify:init
```

Use the settings already defined in `netlify.toml`:

```txt
Build command: pnpm build
Publish directory: dist
```

3. Add environment variables in Netlify. Secrets must be added in the Netlify UI/CLI, not committed:

```txt
STORYBLOK_PREVIEW_TOKEN
STORYBLOK_PUBLIC_TOKEN
STORYBLOK_EDITOR_ACCESS_TOKEN
SENDGRID_API_KEY
```

4. Enable branch deploys and make sure the `storyblok` branch can deploy.

5. Create a colleague preview:

```sh
pnpm netlify:deploy
```

6. After the preview exists, test the contact form against the preview URL with a rotated SendGrid key.

## Before A Client Project Starts

- Confirm the Storyblok master copy has the current section and page schemas.
- Confirm `/admin` exists as a `site-settings` story and has navigation, legal, cookies, SEO, and SEO image populated.
- Replace starter site name, `/admin` domain, contact recipient, and GTM ID in Storyblok.
- Confirm `STORYBLOK_HOME_SLUG`.
- Enable the `storyblok` branch deploy in Netlify and set Storyblok's Preview URL to the `/_preview/TOKEN/` editor URL.
- Update `--other-scroll-offset` in `app/assets/css/main.css` so anchors and paginated sections land below the project's real header height at each breakpoint.
- Decide whether the project needs a CMP such as OneTrust instead of the starter consent model.
- Add the full `game` page schema once the project needs it.
- Run one real contact-form send with the project SendGrid key.
- Check `/robots.txt` and `/sitemap.xml` on the deploy URL.
- Run Lighthouse or WebPageTest once real content and fonts are in place.

## Known Gaps / Next Up

These are intentionally unfinished starter areas, not broken features:

- Rotate the SendGrid key before production use if it has ever been shared in chat, tickets, or docs.
- Storyblok Visual Editor live-updates CMS page content, but external/project-specific data queries may still need a save/reload cycle.
- The `game` page template has only the early shared fields; the full game schema still needs defining.
- Richtext embedded Storyblok blocks have thin skeleton renderers; final project styling and richer game/video rendering still need defining.
- Keep the setup guide current as env vars, Storyblok fields, Netlify contexts, brand CSS, image sizing, and scroll offset setup evolve.
- Run a proper Lighthouse/WebPageTest pass once a real client brand, media set, and fonts are in place.
