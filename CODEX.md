# CODEX Notes

This file is a quick orientation guide for any agent or collaborator dropping into this repo.

## What This Project Is

- Nuxt 4 frontend
- Storyblok-backed content model
- Section-driven page renderer
- Current design target: recreate the homepage feel of `https://f1clashgame.com/`

The priority has been visual parity and content composition, not building a custom backend from scratch.

## How Pages Render

The main dynamic route is:

- [app/pages/[...slug].vue](/Users/louiecliff/Websites/f1page/app/pages/[...slug].vue)

That route resolves Storyblok content and hands it off to page templates.

Standard pages render sections through:

- [app/components/templates/PageTemplate.vue](/Users/louiecliff/Websites/f1page/app/components/templates/PageTemplate.vue)
- [app/components/sections/SectionRenderer.vue](/Users/louiecliff/Websites/f1page/app/components/sections/SectionRenderer.vue)

Section component lookup lives in:

- [app/utils/content/sections.ts](/Users/louiecliff/Websites/f1page/app/utils/content/sections.ts)

Storyblok normalization lives in:

- [app/utils/content/storyblok-mappers.ts](/Users/louiecliff/Websites/f1page/app/utils/content/storyblok-mappers.ts)

## Storyblok Model

The current schema guide is here:

- [docs/storyblok-schema.md](/Users/louiecliff/Websites/f1page/docs/storyblok-schema.md)

Useful project-specific docs:

- [docs/f1-homepage-content-plan.md](/Users/louiecliff/Websites/f1page/docs/f1-homepage-content-plan.md)
- [docs/storyblok-carousel-setup.md](/Users/louiecliff/Websites/f1page/docs/storyblok-carousel-setup.md)
- [docs/css-styling-guide.md](/Users/louiecliff/Websites/f1page/docs/css-styling-guide.md)
- [docs/setup-guide.md](/Users/louiecliff/Websites/f1page/docs/setup-guide.md)

## Current Design Direction

The visual system has been pushed toward a more premium F1 Clash-inspired look:

- dark carbon-style backgrounds
- red/gold accenting
- stronger uppercase display typography
- animated nav underline
- CTA hover states that turn race red with dark text
- section separator lines between stacked homepage sections

Most of that shared styling lives in:

- [app/assets/css/main.css](/Users/louiecliff/Websites/f1page/app/assets/css/main.css)

## Theme System

Theme mapping lives in:

- [app/utils/theme.ts](/Users/louiecliff/Websites/f1page/app/utils/theme.ts)

Base CSS theme variable blocks live in:

- [app/assets/css/main.css](/Users/louiecliff/Websites/f1page/app/assets/css/main.css)

Important implementation detail:

- Section components should use `getThemeClasses(section.theme)`, not raw string interpolation like `` `other-theme-${section.theme}` ``.
- Raw interpolation breaks when Storyblok values contain spaces or aliases.

Example bug that was fixed:

- Storyblok value `racing red` normalizes to `racing-red`
- the actual CSS theme block is `.other-theme-race-red`
- `theme.ts` now maps both `race-red` and `racing-red` to the same final class

If a new theme is added in Storyblok, make sure all three layers stay in sync:

1. Add the CSS variable block in `main.css`
2. Add the theme mapping in `theme.ts`
3. Use `getThemeClasses()` in the consuming section component

## Reused Sections Instead Of Custom One-Offs

The current approach has favored reusing existing section types where possible:

- `hero_section` for the homepage banner
- `feature_section` for split promo/content blocks
- `cards_section` for grouped feature tiles
- `gallery_section` for the carousel/image rail
- `spotlight_section` for a community or promo block
- `testimonials_section` for quote-driven content

This has kept the CMS model simpler and let styling changes lift the whole site.

## Carousel Notes

The gallery/carousel implementation currently centers on:

- [app/components/sections/GallerySection.vue](/Users/louiecliff/Websites/f1page/app/components/sections/GallerySection.vue)
- [app/components/cards/GalleryCard.vue](/Users/louiecliff/Websites/f1page/app/components/cards/GalleryCard.vue)
- [app/components/ui/BaseCarousel.vue](/Users/louiecliff/Websites/f1page/app/components/ui/BaseCarousel.vue)

Storyblok setup for that is documented in:

- [docs/storyblok-carousel-setup.md](/Users/louiecliff/Websites/f1page/docs/storyblok-carousel-setup.md)

## Local Verification Caveat

This workspace has sometimes been edited without a running local server or installed dependencies.

If visual verification is needed:

1. Ensure dependencies are installed
2. Start the local Nuxt dev server
3. Check the intended route, currently often `/f1-clash`

## Suggested Next Steps For Any Agent

If continuing the F1 Clash work, the highest-value next steps are:

1. Verify the live local page visually against the reference site
2. Refine section-specific variants, especially community/promo sections
3. Keep CMS structure simple and push visual sophistication into reusable code
4. Update docs when adding new Storyblok fields, themes, or section variants
