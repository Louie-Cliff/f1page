# Boring Thing Setup Guide

This is the short, practical setup order for a new project or a new developer joining an existing project.

Use the deeper docs when you need detail. Use this guide when you just need to get the thing running without wondering why the site is blank, blocked, or refusing to connect.

## 1. Clone And Install

```sh
pnpm install
```

Use `pnpm`. The project pins the package manager in `package.json`.

## 2. Create Local Environment Values

Copy the example env file:

```sh
cp .env.example .env
```

Add the required local values:

```txt
STORYBLOK_PREVIEW_TOKEN=""
STORYBLOK_PUBLIC_TOKEN=""
STORYBLOK_EDITOR_ACCESS_TOKEN=""
SENDGRID_API_KEY=""
```

`STORYBLOK_EDITOR_ACCESS_TOKEN` is not from Storyblok. Make it yourself as a simple shared secret for the protected Storyblok editor route. Use the same value in Storyblok's Visual Editor Preview URL.

Optional local values:

```txt
NETLIFY_SITE_ID=""
NETLIFY_BUILD_HOOK_URL=""
NETLIFY_AUTH_TOKEN=""
CONTACT_RATE_LIMIT_MAX="5"
CONTACT_RATE_LIMIT_EMAIL_MAX="3"
CONTACT_RATE_LIMIT_WINDOW_MS="600000"
```

Only add Netlify values locally if you need to test the editor-only deploy panel at `/admin/deploy`.

## 3. Check Storyblok Before Running

The app has no mock fallback data. If Storyblok is missing, wrong, or unpublished, the site should fail visibly rather than render fake content.

Confirm the space has:

- A `site-settings` story at `/admin`.
- A homepage story, normally slugged `home`.
- Renderable content types: `page`, `article`, `game`, and `modal` if the project uses modals.
- Page sections registered in the project schema.
- SEO plugin fields on `page`, `article`, and `game`.

The `/admin` `site-settings` story should own:

- `site_name`
- `domain`
- `logo`
- `icon`
- `navigation`
- `legal`
- `cookies`
- `error`
- `gtm_id`
- `contact_email`
- `cookie_consent_enabled`
- default `seo`
- default `seo_image`

The `domain` field is the source of truth for canonical URLs, robots, and sitemap output. Do not add `NUXT_PUBLIC_SITE_URL` or `NUXT_PUBLIC_CANONICAL_SITE_URL` unless a project has a specific reason to override the CMS/domain/deploy URL behaviour.

## 4. Run The Normal Local Site

```sh
pnpm dev
```

Then open:

```txt
http://localhost:3000
```

If Nuxt says another dev server is already running, use the URL it prints rather than starting another copy.

If you get missing content or a Storyblok token error:

- Check `.env` exists.
- Check `STORYBLOK_PREVIEW_TOKEN` and `STORYBLOK_PUBLIC_TOKEN`.
- Check `STORYBLOK_REGION`, which defaults to `eu`.
- Check the Storyblok story is published or draft-accessible depending on mode.

## 5. Run Storyblok Visual Editor Locally

Use editor mode:

```sh
pnpm dev:storyblok
```

This runs Nuxt locally over HTTPS and enables draft/editor mode.

Open the local HTTPS URL directly once:

```txt
https://localhost:3000/_preview/YOUR_STORYBLOK_EDITOR_ACCESS_TOKEN/
```

Accept or trust the local certificate if your browser asks. Storyblok cannot load the iframe until your browser trusts the local HTTPS site.

In Storyblok, set Settings -> Visual Editor -> Preview URL to:

```txt
https://localhost:3000/_preview/YOUR_STORYBLOK_EDITOR_ACCESS_TOKEN/
```

Keep the trailing slash after the token. Without it, Storyblok can append the story slug to the token and create broken URLs.

If Storyblok says the site refused to connect:

- Make sure `pnpm dev:storyblok` is running, not plain `pnpm dev`.
- Open the local preview URL directly and accept the certificate.
- Check the Preview URL has `/_preview/TOKEN/` with the trailing slash.
- Check `STORYBLOK_EDITOR_ACCESS_TOKEN` in `.env` matches the token in the URL.

## 6. Connect Netlify

Each client project gets its own Netlify site.

Use the Netlify UI or CLI:

```sh
pnpm netlify:login
pnpm netlify:init
```

Expected Netlify build settings:

```txt
Build command: pnpm build
Publish directory: dist
Node version: 24
```

`netlify.toml` already sets:

```txt
NITRO_PRESET=netlify
STORYBLOK_REGION=eu
```

Only override those in Netlify if the project differs.

## 7. Add Netlify Environment Values

Add these in Netlify, not in committed files:

```txt
STORYBLOK_PREVIEW_TOKEN
STORYBLOK_PUBLIC_TOKEN
STORYBLOK_EDITOR_ACCESS_TOKEN
SENDGRID_API_KEY
```

Recommended for the `/admin/deploy` deploy panel:

```txt
NETLIFY_SITE_ID
NETLIFY_BUILD_HOOK_URL
NETLIFY_AUTH_TOKEN
```

Optional:

```txt
CONTACT_RATE_LIMIT_MAX
CONTACT_RATE_LIMIT_EMAIL_MAX
CONTACT_RATE_LIMIT_WINDOW_MS
STORYBLOK_HOME_SLUG
STORYBLOK_FRAME_ANCESTORS
```

Use Netlify's secret handling for private values such as SendGrid, Storyblok preview, editor access, Netlify auth, and build hooks. `STORYBLOK_PUBLIC_TOKEN` is public by nature, but keeping all CMS tokens in env vars is still cleaner than committing them.

Avoid old starter/public env values unless the code specifically needs them:

```txt
NUXT_PUBLIC_CONTENT_SOURCE
NUXT_PUBLIC_SITE_NAME
NUXT_PUBLIC_SITE_URL
NUXT_PUBLIC_GTM_ID
NUXT_PUBLIC_COOKIE_CONSENT_ENABLED
```

Most of that now comes from the `/admin` `site-settings` story.

## 8. Understand Netlify Contexts

The deploy contexts are intentionally different:

```txt
production: published Storyblok content, static-first
deploy-preview: draft Storyblok content, static-first
branch deploys: draft Storyblok content, static-first
storyblok branch: draft Storyblok content, editor mode, dynamic pages
```

The `storyblok` branch exists for the Visual Editor. It should be a Netlify branch deploy and should use the same code as `main`.

If you want `storyblok` to stay in sync with `main`, use the repo workflow agreed for the project. The starter does not automatically force branch syncing by itself.

## 9. Set Storyblok Preview URL For Netlify

After the `storyblok` branch deploy exists, set Storyblok's Visual Editor Preview URL to:

```txt
https://storyblok--site-name.netlify.app/_preview/YOUR_STORYBLOK_EDITOR_ACCESS_TOKEN/
```

Keep the trailing slash.

Direct public visits to the `storyblok` branch without the preview token should return a 404. That is deliberate. The branch is for Storyblok's iframe, not public browsing.

## 10. Configure Project-Level Styling

Update these early in the project:

- Google Font links in `nuxt.config.ts`.
- Tailwind font tokens in `app/assets/css/main.css`.
- Project themes in `app/utils/theme.ts`.
- House/system colours only if the neutral admin/form/error UI needs changing.
- `--other-scroll-offset` in `app/assets/css/main.css`.

`--other-scroll-offset` should match the real fixed or sticky header height at each breakpoint. It is used by anchor links and paginated sections so content lands below the header instead of hiding behind it.

## 11. Check Core Content Features

Before sharing with colleagues, check:

- Header navigation comes from `/admin` `site-settings`.
- Footer legal copy comes from `/admin` `site-settings`.
- Cookie banner appears on the normal site when enabled.
- Cookie banner does not block normal Storyblok editor pages.
- `/admin` renders only in editor mode.
- `/admin/deploy` renders only in editor mode.
- 404/error page content comes from `/admin` `site-settings.error`.
- News pagination updates the `p` query string and does not trigger the page transition overlay.
- Modal links open over the current page and lock background scrolling.
- Mobile navigation locks background scrolling.

## 12. Check Forms

The starter contact form uses SendGrid.

Before testing a real send:

- Use a rotated SendGrid API key.
- Add `SENDGRID_API_KEY` in local `.env` or Netlify env vars.
- Set `site-settings.contact_email` in Storyblok.
- Confirm the from address in code is still correct for the project.
- Submit one test form on the deployed preview.

If the form submits locally but not on Netlify, check Netlify env vars first.

## 13. Check SEO And System Routes

Check:

```txt
/robots.txt
/sitemap.xml
```

Also check page source or a metadata inspector for:

- Page-level SEO plugin values.
- Site-settings SEO fallback values.
- `seo_image` fallback.
- Canonical URL using the Storyblok `domain` field.

## 14. Run Verification

Before sharing or deploying:

```sh
pnpm typecheck
pnpm build
```

Then click through at least:

- Home
- About or another standard `page`
- News listing
- News article
- Games listing
- Game page
- Contact form
- Any modal links
- `/admin` in editor mode
- `/admin/deploy` in editor mode if Netlify values are configured

## 15. Common WTF Checks

If the page is blank or black:

- Check the current URL. You may be on a real Storyblok 404.
- Check Storyblok tokens.
- Check the story exists and has a supported content type.
- Check the section is registered in `app/utils/content/sections.ts`.

If the Storyblok editor does not live-update:

- Check you are in `pnpm dev:storyblok` locally or on the `storyblok` branch on Netlify.
- Check the URL includes Storyblok preview query params.
- Save/reload if the content depends on external data, such as queried articles or games.

If Netlify secret scanning fails:

- Remove real tokens from committed files.
- Rotate any exposed key.
- Keep secrets in Netlify env vars.
- Avoid disabling secret scanning except as a deliberate last resort.

If Netlify builds but content is missing:

- Check `STORYBLOK_VERSION` for that deploy context.
- Production uses `published`; previews and storyblok branch use `draft`.
- Check stories are published if production should show them.

If the Storyblok branch is publicly browsable:

- Check `STORYBLOK_EDITOR_MODE=true` for the `storyblok` context.
- Check `STORYBLOK_EDITOR_ACCESS_TOKEN` is set.
- Check the Preview URL uses `/_preview/TOKEN/`.

If anchor links or pagination scroll to the wrong place:

- Update `--other-scroll-offset` in `app/assets/css/main.css`.

## 16. Useful Deeper Docs

- [Architecture](architecture.md)
- [Storyblok Schema](storyblok-schema.md)
- [Developer Notes](developer-notes.md)
- [Preview And Editor Deploys](preview-editor-deploys.md)
- [Colleague Handoff Checklist](colleague-handoff.md)
