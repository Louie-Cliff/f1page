# Storyblok Accordion Setup

This project already supports an accordion section, so you do not need to build new backend plumbing for it first.

The path is:

- Storyblok component: `accordion_section`
- Vue component: [AccordionSection.vue](/Users/louiecliff/Websites/f1page/app/components/sections/AccordionSection.vue)
- Storyblok normalization: [storyblok-mappers.ts](/Users/louiecliff/Websites/f1page/app/utils/content/storyblok-mappers.ts)
- Section registry: [sections.ts](/Users/louiecliff/Websites/f1page/app/utils/content/sections.ts)

## What Was Implemented In The Frontend

The accordion section now has:

- a stronger panel design
- a built-in open/close icon
- the first accordion item open by default
- better spacing for marketing-style copy

The main styling lives in:

- [main.css](/Users/louiecliff/Websites/f1page/app/assets/css/main.css)

## 1. Parent Storyblok Component

Create or confirm a component called `accordion_section`.

It should have these fields:

1. `copy`
   Type: `Richtext`
   Use this for the section heading and intro copy.

2. `items`
   Type: `Blocks`
   Restrict allowed components to `instance_accordion`.

3. `theme`
   Type: `Single-Option`
   Suggested values:
   - `black`
   - `white`
   - `gold`
   - `fuchsia`
   - `teal`
   - `red`

## 2. Child Accordion Item Component

Create or confirm a component called `instance_accordion`.

It should have these fields:

1. `title`
   Type: `Text`
   This becomes the visible accordion heading.

2. `copy`
   Type: `Richtext`
   This becomes the accordion panel content.

## 3. Add It To A Page In Storyblok

Open the page you want to edit, for example your homepage or a campaign page.

Inside the `body` field:

1. Add a new blok of type `accordion_section`
2. Enter a heading and intro in `copy`
3. Add several `instance_accordion` items inside `items`
4. Choose a `theme`

## 4. What The Frontend Expects

The Storyblok mapper already turns:

- `accordion_section` -> section type `accordion_section`
- `items` -> `cards`
- `instance_accordion.title` -> accordion heading
- `instance_accordion.copy` -> accordion body copy

That means there is no extra backend work needed just to make the section render.

## 5. Good Practice Content For Learning

This section is a good place to add content that does not exist on the live F1 Clash site.

Example ideas:

- `Frequently Asked Questions`
- `Race Weekend Tips`
- `Car Setup Advice`
- `Driver Strategy Guide`

Example accordion items:

- `How do I improve qualifying pace?`
- `What is the best way to manage tyre wear?`
- `When should I use aggressive overtakes?`
- `How do promotions and leagues work?`

## 6. What To Edit In Code If You Want To Style It Further

Frontend structure:

- [AccordionSection.vue](/Users/louiecliff/Websites/f1page/app/components/sections/AccordionSection.vue)

Shared styling hooks:

- `.other-accordion-section`
- `.other-accordion-list`
- `.other-accordion-item`
- `.other-accordion-summary`
- `.other-accordion-title`
- `.other-accordion-icon`
- `.other-accordion-copy`

Those are all defined in:

- [main.css](/Users/louiecliff/Websites/f1page/app/assets/css/main.css)

## 7. Mental Model For The “Backend” Here

For this section, “backend” mostly means:

- Storyblok schema exists
- field names match what the frontend expects
- the page body allows the section component
- the content gets normalized into the section/card types used by Vue

Because this repo is already set up for `accordion_section`, your job is mainly:

1. create the component in Storyblok if it is missing
2. add content to it
3. tune the frontend styling as you learn Tailwind and CSS
