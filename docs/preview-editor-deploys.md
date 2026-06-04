# Preview And Editor Deploys

Boring Thing uses one Netlify site per client project. Different deploy contexts decide whether the site behaves like production, a code-review preview, or the Storyblok Visual Editor.

## Deployment Model

| Netlify context | URL shape | Purpose | Content | Editor bridge | Page rendering |
| --- | --- | --- | --- | --- | --- |
| `production` | `https://client-domain.com` | Live public site | Storyblok `published` | off | static-first |
| `deploy-preview` | `https://deploy-preview-123--site.netlify.app` | Pull request review | Storyblok `draft` | off | static-first |
| `branch-deploy` | `https://branch-name--site.netlify.app` | Feature branch review | Storyblok `draft` | off | static-first |
| `storyblok` branch | `https://storyblok--site.netlify.app` | Storyblok Visual Editor | Storyblok `draft` | lazy-loaded | dynamic |

The `storyblok` branch is intentionally different. It does not prerender content pages, so editor requests are served by the Nuxt/Nitro server route and can fetch draft content at request time.

## Environment Variables

Set secrets in Netlify's environment variable UI, CLI, or API. Do not commit tokens to `netlify.toml`.

Required Storyblok values:

```txt
STORYBLOK_PREVIEW_TOKEN
STORYBLOK_PUBLIC_TOKEN
STORYBLOK_EDITOR_ACCESS_TOKEN
```

`STORYBLOK_REGION` is set to `eu` in `netlify.toml`, and `STORYBLOK_HOME_SLUG` defaults to `home`. Only add them in Netlify when a project differs from those defaults.

Before the first deploy, create or link a Netlify site:

```sh
pnpm netlify:login
pnpm netlify:init
```

Then create a draft deploy for colleague review:

```sh
pnpm netlify:deploy
```

The starter commits safe deploy-context defaults in `netlify.toml`:

```txt
production:
  STORYBLOK_VERSION="published"
  STORYBLOK_EDITOR_MODE="false"

deploy-preview / branch-deploy:
  STORYBLOK_VERSION="draft"
  STORYBLOK_EDITOR_MODE="false"

storyblok branch:
  STORYBLOK_VERSION="draft"
  STORYBLOK_EDITOR_MODE="true"
```

`STORYBLOK_ENABLE_BRIDGE` should stay `false` for the default workflow. The starter uses `app/plugins/storyblok-editor-bridge.client.ts` to load Storyblok's bridge script only when the editor deployment is opened with Storyblok preview parameters or inside an iframe.

## Headers

Netlify headers in `netlify.toml` are global and cannot be scoped to deploy contexts. Boring Thing generates a per-deploy `public/_headers` file before each build with `scripts/write-netlify-headers.mjs`.

Production builds deny iframe embedding. The `storyblok` branch omits `X-Frame-Options` and sets:

```txt
Content-Security-Policy: frame-ancestors 'self' https://app.storyblok.com
```

If a client uses Storyblok white labeling or a custom editor host, set:

```txt
STORYBLOK_FRAME_ANCESTORS="'self' https://app.storyblok.com https://cms.example.com"
```

## Storyblok Setup

In Storyblok, open Settings -> Visual Editor and set the Preview URL to the stable `storyblok` branch deploy:

```txt
https://storyblok--site-name.netlify.app/_preview/YOUR_STORYBLOK_EDITOR_ACCESS_TOKEN/
```

Storyblok appends the story slug and preview query parameters automatically. Keep the trailing slash after the access token so a story such as `/about` becomes `/_preview/TOKEN/about`, not part of the token value. For the home story, set the story's Real path to `/` if the CMS slug is `home`.

The path token is stored as an HTTP-only cookie for the editor session. Direct visits to the `storyblok` branch without the token return a 404, which keeps the branch from being casually browsed on the public internet. The older `?bt_preview=TOKEN` query token remains supported for manual access, but it should not be used as the Storyblok Visual Editor Preview URL because Storyblok appends paths after the full URL.

For local Visual Editor testing, run:

```sh
pnpm dev:storyblok
```

Then temporarily point Storyblok's Preview URL at:

```txt
https://localhost:3000/_preview/YOUR_STORYBLOK_EDITOR_ACCESS_TOKEN/
```

Storyblok's iframe runs in your browser, so `localhost` resolves to your own machine. Open the URL directly once and accept/trust the local HTTPS certificate if prompted.

The global `site-settings` story lives at `/admin`. It is blocked in normal public mode and uses an editor-only blank preview template so editors can see header navigation, footer legal copy, cookie copy, favicon/default SEO inputs, and the richtext preview field without rendering it as a real site page.

The editor-only `/admin/deploy` page includes a Netlify deploy panel when these server-side env vars are configured:

```txt
NETLIFY_SITE_ID
NETLIFY_BUILD_HOOK_URL
NETLIFY_AUTH_TOKEN
```

Build hooks can trigger deploys without an API token, but live status/history needs `NETLIFY_AUTH_TOKEN`. The deploy panel reports the main branch only so branch deploys such as `storyblok` do not appear in the client-facing status.

## Current Editor Capability

The starter currently supports:

- draft-content rendering in the editor deployment
- Storyblok editable attributes on normalized sections
- Storyblok bridge loading only in editor contexts
- live normalized page updates from Storyblok `input` events
- editor-only `/admin` rendering for the `site-settings` story
- page reload on Storyblok save/publish events

The current implementation updates the active page from Storyblok's unsaved `input` event without adding the full Storyblok Nuxt module to the public bundle.

## Known Gaps

- Editor previews live-update page-level Storyblok fields, but project-specific external data queries may still need a save/reload cycle.
- The default starter does not install the official `@storyblok/nuxt` bridge module into public bundles.
- Contact form sending depends on a rotated SendGrid key configured in Netlify.
