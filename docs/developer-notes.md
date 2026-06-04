# Developer Notes

## Current Build Stage

Boring Thing is currently in Phase 6A: share-ready deploy and editor workflow.

The implementation proves routing, Storyblok content loading, Storyblok normalization, template selection, section/card rendering, richtext rendering, responsive Storyblok image URLs, article summary queries, base styling, consent-gated GTM loading, contact form handling, generated public system routes, Netlify deploy contexts, editor-mode draft rendering, and build verification.

## Package Manager

Use `pnpm`.

The starter pins the package manager in `package.json` with `packageManager: pnpm@11.3.0`.

## Nuxt Structure

Use Nuxt 4 with the `/app` directory structure.

Planned structure:

```txt
app/
  assets/
    css/
      main.css
  components/
    cards/
    sections/
    site/
    templates/
    ui/
  composables/
  layouts/
  pages/
    [...slug].vue
  plugins/
  types/
  utils/
    content/

data/
  storyblok-route-paths.ts

docs/
  architecture.md
  storyblok-schema.md
  developer-notes.md

netlify/
  functions/

public/
```

## Naming Rules

- Page-level content blocks are sections.
- Repeated child items are cards.
- Vue section files should use names such as `HeroSection.vue`.
- Vue card files should use names such as `TestimonialCard.vue`.
- Storyblok component names should use snake case, such as `hero_section` and `instance_person`.

## Data Rules

Do not spread raw Storyblok data through the app.

Data should pass through a source-specific fetcher and normalization layer before it reaches templates, sections, or cards.

This keeps the component API stable when individual client spaces vary or when the master Storyblok schema evolves.

Current content utility files:

```txt
app/utils/content/content-source.ts
app/utils/content/storyblok-content-source.ts
app/utils/content/resolve-page.ts
app/utils/content/resolve-site-settings.ts
app/utils/content/resolve-articles.ts
app/utils/content/seo.ts
app/utils/content/media.ts
app/utils/content/richtext.ts
app/utils/content/sections.ts
app/utils/content/storyblok-mappers.ts
app/utils/content/storyblok-richtext.ts
```

Storyblok is the only content source. The app uses internal Storyblok API routes and server-only tokens.

`STORYBLOK_EDITOR_MODE` controls the default editor deployment flow. In editor mode, content pages are not prerendered and the small client plugin in `app/plugins/storyblok-editor-bridge.client.ts` lazy-loads Storyblok's bridge script only when Storyblok preview parameters or iframe context are present.

`STORYBLOK_EDITOR_ACCESS_TOKEN` gates the public `storyblok` branch. Storyblok Preview URLs should use the `/_preview/TOKEN/` path prefix, which sets a short-lived HTTP-only cookie for the editor iframe and then rewrites to the requested story path. Direct branch visits without the token return a 404.

`STORYBLOK_ENABLE_BRIDGE` remains an escape hatch for projects that want the official `@storyblok/nuxt` bridge module. Keep it `false` for the starter workflow so normal visitors do not download editor code.

The catch-all route should remain thin. It should ask `resolvePage()` for the page and then render the correct template.

Section components are mapped in `app/utils/content/sections.ts`. Unknown section types should render `UnknownSection.vue` during development so CMS/schema drift is visible.

Storyblok routes are fetched during build through `data/storyblok-route-paths.ts` so static generation follows the CMS story tree.

Article summaries are fetched through the same content-source pattern. `news_section` calls `resolveArticles()` and the Storyblok source uses `server/api/storyblok/articles.get.ts`.

Game summaries are fetched through the same content-source pattern. `games_section` stores selected game story UUIDs, calls `resolveGames()`, and the Storyblok source uses `server/api/storyblok/games.get.ts`. The API preserves the selected CMS order before rendering cards through `GameCard.vue`.

Site settings are fetched from the `site-settings` story at `/admin` and normalized through `normalizeStoryblokSiteSettings()`. They power the default layout's header, footer, cookie banner message, favicon, error page content, canonical domain, and page SEO fallback. `/admin` is blocked in normal public mode and renders through `app/pages/admin.vue` only in editor mode.

## Richtext

Storyblok richtext is normalized in `app/utils/content/storyblok-richtext.ts` and rendered by `app/components/ui/RichTextRenderer.vue`.

Supported primitives:

- Paragraphs
- H1, H2, H3, and H4 headings
- Ordered and unordered lists
- Blockquotes
- Horizontal rules
- Richtext images
- Links with safe external target/rel behavior
- Bold, italic, underline, strike, and code marks
- Storyblok text alignment: `left`, `center`, `right`, and `justify`

Embedded Storyblok components inside richtext are normalized as raw blok params and rendered through `app/components/richtext/`. The starter supports `instance_richtext_buttons`, `instance_richtext_embed`, `instance_richtext_game`, `instance_richtext_image`, and `instance_richtext_video` as thin skeleton components.

H1 headings are rendered if editors add them in Storyblok richtext. Use Storyblok/editor guidance to avoid accidental page outlines with too many top-level headings.

## External Video

YouTube and Vimeo URLs are rendered through `app/components/ui/ExternalVideo.vue`; the starter does not use a third-party player package. The shared component builds provider embed URLs, supports autoplay/loop/control options, pauses when it leaves the viewport, and only auto-resumes when autoplay is enabled.

`hero_section.video` renders as a muted looping background video. `media_section.video` uses `video_controls` and `video_autoplay` from Storyblok and can sit over a section image. `instance_richtext_video` uses the same renderer with normal controls and no autoplay by default.

## Theming

Section theme values from Storyblok are arbitrary project words. Use `getThemeData()` from `app/utils/theme.ts` to convert those words into stable class data:

```ts
{
  background: 'bg-black',
  color: 'text-white',
  border: 'border-white/20',
  alt: 'text-gold',
  styles: 'bg-black text-white'
}
```

Add project-specific values to the `projectThemes` map. Unknown theme names still produce semantic hooks such as `other-theme-elephant`, but they do not invent Tailwind classes at runtime.

The starter also exposes house/system colours in `app/assets/css/main.css` using `house-*` Tailwind tokens. Use these for boilerplate UI that should stay neutral across client themes: admin screens, validation messages, cookie consent, modals, loaders, absolute black/white, and success/warning/error states. Keep client branding in the project theme map instead of using house colours for normal page design.

## Fonts

Fonts are project-level design decisions and should not be controlled by Storyblok.

Google Fonts are loaded through static Nuxt head links in `nuxt.config.ts`. The starter currently includes Raleway Black:

```txt
https://fonts.googleapis.com/css2?family=Raleway:wght@900&display=swap
```

Font families are exposed to Tailwind in `app/assets/css/main.css`:

```css
--font-sans: ui-sans-serif, system-ui, sans-serif;
--font-display: Raleway, ui-sans-serif, system-ui, sans-serif;
```

Use Tailwind classes such as `font-sans` and `font-display` in components. The starter applies `font-display font-black` to headings by default so the included display font is visible.

For each client project:

- Update `projectGoogleFontLinks` in `nuxt.config.ts`.
- Update the `--font-*` theme tokens in `app/assets/css/main.css`.
- Keep loaded weights limited to the weights the design actually uses.
- Re-run Lighthouse/WebPageTest after real fonts are in place.

## Material Icons

Material Symbols are loaded through the same static Nuxt head link list as project fonts in `nuxt.config.ts`.

Use the Google-provided class directly when an icon is needed:

```html
<span class="material-symbols-outlined" aria-hidden="true">coffee</span>
```

For Vue components, prefer `app/components/ui/MaterialIcon.vue`:

```vue
<MaterialIcon name="coffee" />
```

The component renders the icon as decorative with `aria-hidden="true"`. Make sure the surrounding button/link has a visible text label or an explicit accessible label.

CTA icons come from `link.icon`:

- `none` or an empty value renders no icon.
- `default` maps to the CTA link type.
- Any other value is rendered as a Material Symbol name.

Default CTA icons:

- Internal/hash links: `chevron_right`
- External links: `open_in_new`
- Email links: `mail`
- Asset/download links: `download`

Shared link rendering is handled by `app/components/ui/SmartLink.vue`. It renders internal and hash links with `NuxtLink`, external/email/telephone/asset links with `<a>`, and future code-created actions with `<button type="button">` when an action handler is provided. Storyblok-provided `javascript:` URLs are treated as actions and are not executed.

`CtaItem.vue` uses `SmartLink` for CTA links, then adds image/icon/button presentation. CTA links respect the Storyblok target setting because the editor has an explicit window-control option there.

Email links are the one exception to the direct-link render path. CTAs and richtext email links both use `app/components/ui/EmailLinkMenu.vue`, which opens a small inline dialog with "Open mail app" and "Copy email address" actions. This avoids forcing a visitor straight into their system mail app while keeping the visible CTA or richtext styling intact.

Style the shared email menu in one place through the `other-email-menu-*` classes:

- `other-email-menu`
- `other-email-menu-trigger`
- `other-email-menu-panel`
- `other-email-menu-address`
- `other-email-menu-action`
- `other-email-menu-status`

`RichTextInlineRenderer.vue` also uses `SmartLink` for richtext links, with a consistent inner `<span class="label">` structure and the `other-richtext-link` class. Richtext external web links are forced to open in a new tab because the richtext editor does not expose the same per-link window control as CTAs.

Asset links always open in a new tab regardless of the CMS target, and use the HTML `download` attribute as a browser hint. Browsers may ignore `download` for cross-origin assets such as Storyblok CDN files, so `target="_blank"` is the reliable protection against replacing the current page.

## Modal Pages

Storyblok `modal` stories render as overlays through `app/components/site/SiteModalHost.vue`.

The shareable URL pattern is:

```txt
/current-page?_=offer
/current-page?_=path/to/offer
```

When a visitor opens a modal story URL directly, such as `/offer`, the catch-all page redirects to the homepage with `?_=offer` applied.

Generated internal links are checked before navigation. If the target story is a `modal`, the router keeps the current page in place and adds `_` instead. The `/modal/...` or `/modals/...` folder pattern is still recommended because it lets generic anchors be recognized immediately.

The modal is a real dialog surface: `role="dialog"`, `aria-modal="true"`, outside click close, Escape close, scroll lock, and a basic focus trap are handled centrally. Style the shell through `.other-modal`, `.other-modal-panel`, and `.other-modal-close`.

Use `useBodyScrollLock()` for overlays that should freeze the page behind them. It fixes the body at the current scroll position and restores that position on unlock. The lock is ref-counted, so modal and mobile navigation overlays can overlap without prematurely unlocking the page.

## Page Transitions

The loading overlay lives in `app/components/site/PageTransitionOverlay.vue` and has two modes: `loader` for the first page load, and `transition` for internal route changes. They share the same visual treatment by default, but projects can target `.page-transition-overlay--loader` and `.page-transition-overlay--transition` separately.

Transitions are disabled only for actual Storyblok live editor sessions: editor preview params or iframe context. A direct visit to an editor-mode branch can still show transitions.

The overlay shell is present in SSR output so visitors do not see the page before the first loader clears. The visible loading label is only rendered after mount and is `aria-hidden`, so it should not appear in search snippets.

The default animation is CSS-driven through `.page-transition-overlay` and `.page-loader-fade-*` in `app/assets/css/main.css`. Project transitions can be swapped by editing those classes or replacing the component.

Use `NUXT_PUBLIC_PAGE_LOADER_MIN_MS` for the first-load minimum visible duration, and `NUXT_PUBLIC_PAGE_TRANSITION_MIN_MS` for internal route transitions. The starter uses visible local defaults so developers can tune the motion, and `0` in production so fast pages stay fast unless a project opts in.

Route errors and failed navigations should force the overlay off immediately. A missing Storyblok route must show the CMS 404/error page, not a stuck black overlay. If a local tab appears black, check the current URL first; for example, `/leaderboard-playground` currently returns a Storyblok 404 in the test space.

Query-only updates for modals and news pagination are ignored by the transition overlay. They update UI state on the current page and do not fire the same page lifecycle as a full route change.

## Pagination And Scroll Targets

Use `app/components/ui/BasePagination.vue` for paginated content lists. It centralizes previous/next controls, compact page ranges, accessible pagination labels, active-page state, and the optional scroll-back behavior after content updates.

When a paginated section should move the visitor back to the start of the list after changing page, pass the section element as `scrollTarget` and pass a value that changes after the new content has loaded as `scrollKey`. `NewsSection` uses the resolved article page number for this so the scroll waits until the fresh article data has painted.

The shared scroll offset lives in `app/assets/css/main.css` as `--other-scroll-offset`. `.other-section` uses that value for `scroll-margin-top`, and `html` uses it for `scroll-padding-top`, so both anchor links and JS `scrollIntoView()` calls can land below the project header.

Update the responsive `--other-scroll-offset` values per project to match the actual fixed/sticky header heights. This should be part of the future setup checklist.

## Images

Use `app/components/ui/OptimizedImage.vue` for rendered image assets.

The helper in `app/utils/storyblok-image.ts` creates Storyblok Image Service URLs with proportional widths, `srcset`, quality filtering, and `no_upscale()`. It also maps Storyblok focal point coordinates to CSS `object-position` when dimensions are available.

`OptimizedImage` is not DOM/container-aware. It does not inspect the rendered element width in the browser. Instead, it generates the available Storyblok image widths and passes a `sizes` value to the browser. The browser then chooses the best candidate from `srcset` based on viewport, device pixel ratio, and the supplied `sizes` hint.

Keep `sizes` accurate to the layout contract:

- Full-bleed hero/background images should use `sizes="100vw"`.
- Fixed-size logos, icons, and app-store-style CTA images should use fixed values such as `sizes="160px"`.
- Container-based layouts should use `app/utils/image-sizes.ts`.

`app/utils/image-sizes.ts` intentionally duplicates Tailwind's default container breakpoints:

```ts
getContainerImageSizes(1 / 3)
getContainerImageSizes('w-full sm:w-9/12 md:w-1/3 lg:w-1/2 xl:w-1/4')
getGridImageSizes(section.columns)
```

This is the starter's "magic-ish" image sizing layer. It uses known layout rules rather than measuring the DOM. Gaps and side padding are intentionally ignored so generated image sizes are slightly generous and easy to reason about.

For responsive container layouts, prefer passing the same Tailwind width classes that control the rendered image width. The parser supports `w-full`, fraction widths such as `w-1/3`, responsive prefixes such as `md:w-1/2`, and simple percentage arbitrary values such as `w-[75%]`.

If a project changes Tailwind container widths, update `containerWidths` in `app/utils/image-sizes.ts` at the same time.

Current layout usage:

- `HeroSection` uses `100vw`.
- `FeatureSection` keeps its image width classes in one string and passes that string to `getContainerImageSizes()`.
- `CardsSection` uses `getGridImageSizes(section.columns)` and passes the result into each `ContentCard`.

## Grid Columns

Storyblok's custom columns plugin values are parsed by `app/utils/grid-columns.ts`.

The parser accepts common shapes such as compact strings, JSON strings, objects, nested plugin values, and arrays. The normalized column config is used for both Tailwind grid classes and responsive image `sizes`.

Example:

```txt
xs:1, sm:1, md:2, lg:2, xl:3
```

This can produce grid classes such as:

```txt
grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3
```

And image sizes based on the current container width divided by the active column count.

## Layering

Global z-index layers are defined as Tailwind v4 theme tokens in `app/assets/css/main.css`.

Use named layers for site-level UI:

```txt
z-popover
z-cookie
z-menu
z-modal
z-toast
z-loading
```

Use `z-base`, `z-content`, `z-raised`, and `z-sticky` for local component stacking. Avoid arbitrary large z-index values such as `z-[9999]`; add or adjust a named layer instead if the starter has a genuine new global layer.

## Comments And TODOs

Use comments for:

- TODOs that future developers genuinely need to see
- Non-obvious tradeoffs
- Integration assumptions
- Accessibility exceptions
- CMS field-shape assumptions

Avoid comments that only restate obvious code.

## Accessibility Defaults

All sections and cards should be built semantically first.

Default expectations:

- Real buttons for actions
- Real links for navigation
- Meaningful headings
- Visible focus states
- No interactive `div` elements
- Alt text handling for all images
- Captions/transcripts for meaningful video where possible
- Motion respects `prefers-reduced-motion`

## Performance Defaults

Default expectations:

- Static generation where possible
- Responsive images
- Lazy-loaded non-critical media
- Minimal global JavaScript
- No third-party scripts before consent where consent is required
- Font loading should be intentional and documented
- Client-only behavior should be opt-in

## Analytics And Consent

Google Tag Manager is the default analytics container mechanism.

The starter consent model uses:

- `necessary`
- `analytics`
- `marketing`

GTM is loaded only after a visitor accepts analytics or marketing cookies. Analytics and marketing tags should respect the selected consent categories pushed into `window.dataLayer`.

Set these fields on the `/admin` Storyblok `site-settings` story per project:

```txt
gtm_id
cookie_consent_enabled
```

`cookie_consent_enabled` defaults to enabled. If a project uses a full CMP, set it to `false`, remove or bypass the starter consent component, and map the CMP's categories into the same GTM loading point.

In `STORYBLOK_EDITOR_MODE`, the default layout does not mount the floating cookie banner. The editor-only `/admin` settings preview renders `CookieConsent` in `preview` mode, which keeps the banner static inside the preview area and prevents accept/save actions from writing consent.

## Forms

The starter includes one contact form.

The contact form submits to `/api/contact`, which is built as a serverless route by Nitro/Netlify and sends email through SendGrid.

Current fields:

- Name
- Email
- Subject, with `General Enquiries`, `New Business`, and `Tech Support`
- Message

Validation runs on both client and server. The server also includes a hidden honeypot field, a minimum submit-time check, and a lightweight in-memory rate limit.

The form reads these values:

```txt
SENDGRID_API_KEY
site-settings.contact_email
CONTACT_RATE_LIMIT_MAX
CONTACT_RATE_LIMIT_EMAIL_MAX
CONTACT_RATE_LIMIT_WINDOW_MS
```

The SendGrid API key and optional rate-limit values stay in environment variables. The recipient email comes from Storyblok, and the from address is fixed in code as the Other Things mailbot.

`form_section.thanks` can be a Storyblok UUID from a Stories single-option field. The contact API resolves that UUID to the current page path with `resolveStoryblokPagePath()` before returning a redirect target.

Form UI should use the shared helpers in `app/components/forms/`:

- `FormTextField`
- `FormTextareaField`
- `FormSelectField`
- `FormSubmitButton`

These helpers centralize label/error/ARIA wiring and expose stable `other-form-*` classes in `app/assets/css/main.css`. `FormSelectField` uses a custom button/listbox popover instead of the native mobile select UI. Keep form-specific validation in the parent form or a composable, and clear field errors when the individual field becomes valid.

The starter rate limit is intentionally simple because Netlify Functions memory is per warm instance. Keep it as a useful first guard, and add provider-level controls for high-risk campaigns.

## Public System Routes

The starter exposes generated routes for:

```txt
/robots.txt
/sitemap.xml
```

Both are prerendered during builds. The sitemap is generated from renderable Storyblok stories.

During static builds, `sitemap.xml` reuses the Storyblok route list that Nuxt already fetched for prerendering. This avoids making a second content-tree request during the sitemap prerender step, which keeps builds less vulnerable to a transient Storyblok CDN failure after the pages themselves have already rendered.

Project-specific forms, such as newsletter signup or campaign registration, should be implemented by individual projects.

## Netlify Functions

When adding Netlify Functions directly, use the modern default export plus `config` pattern.

Example shape:

```ts
import type { Config, Context } from '@netlify/functions'

export default async (request: Request, context: Context) => {
  return new Response('OK')
}

export const config: Config = {
  path: '/api/example'
}
```

## Open Questions

- Define the full `game` page schema.
- Decide whether richtext embedded Storyblok components belong in the starter.
- Decide the first Lighthouse/performance budget.
- Decide whether project-specific external data queries need live editor refresh hooks beyond page-level Storyblok `input` updates.
