# CSS Styling Guide

This guide explains the styling workflow used in this project for:

- the desktop nav
- CTA and social buttons
- the section separator line
- how `main.css` and Tailwind utility classes work together

If CSS feels confusing right now, that is completely normal. The easiest way to think about this project is:

1. Vue files decide the page structure.
2. Tailwind utility classes handle one-off layout details in the template.
3. `app/assets/css/main.css` holds the reusable visual system.

That means the templates say where something goes, and `main.css` says how the branded pieces should look.

## The Big Picture

There are two styling layers in this project:

### 1. Tailwind utility classes inside Vue templates

Example from [SiteHeader.vue](/Users/louiecliff/Websites/f1page/app/components/site/SiteHeader.vue:161):

```vue
<nav
  aria-label="Main navigation"
  class="flex flex-row items-center gap-4"
>
```

These classes do quick layout jobs:

- `flex`: turn the element into a flex container
- `flex-row`: arrange children in a row
- `items-center`: vertically align items
- `gap-4`: add spacing between children

These are great for layout because they are immediate and readable in the component.

### 2. Reusable custom classes in `main.css`

Example from [main.css](/Users/louiecliff/Websites/f1page/app/assets/css/main.css:346):

```css
.other-main-navigation {
  @apply relative no-underline text-sm font-semibold uppercase tracking-[0.2em] text-white/78 transition-colors hover:text-white;
}
```

This is where the branding lives:

- nav link typography
- underline animation
- CTA hover states
- separator lines
- premium effects like gradients and shadows

Use `main.css` when a style should be reused across multiple components.

## Nav Styling

The desktop nav structure is in [SiteHeader.vue](/Users/louiecliff/Websites/f1page/app/components/site/SiteHeader.vue:166).

```vue
<ul class="m-0 hidden list-none flex-row items-center gap-8 p-0 md:flex">
  <li v-for="item in navItems" :key="item.id" class="other-main-navigation-item">
    <SmartLink class="other-main-navigation">
```

### What the Tailwind classes are doing here

- `hidden md:flex`: hide desktop nav on mobile, show it from the `md` breakpoint up
- `list-none`: remove bullet points
- `gap-8`: put space between items
- `items-center`: vertically align the links

### What the custom nav classes do

The main nav link styling lives in [main.css](/Users/louiecliff/Websites/f1page/app/assets/css/main.css:346).

```css
.other-main-navigation {
  @apply relative no-underline text-sm font-semibold uppercase tracking-[0.2em] text-white/78 transition-colors hover:text-white;
}
```

This gives the nav links:

- `relative`: needed so the animated underline can be positioned against the link
- `no-underline`: removes the browser default underline
- `text-sm`: keeps the nav compact
- `font-semibold`: makes it feel more premium and deliberate
- `uppercase`: gives the F1-style shouty nav tone
- `tracking-[0.2em]`: adds extra letter spacing
- `text-white/78`: slightly dimmed white by default
- `hover:text-white`: brightens on hover

### How the animated underline works

The underline is not a border. It is a pseudo-element:

```css
.other-main-navigation::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -0.7rem;
  height: 0.18rem;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 180ms ease;
  background: linear-gradient(90deg, var(--color-race-red), var(--color-gold));
}
```

This means:

- `::after` creates a fake extra element after the link text
- `position: absolute` places it exactly under the link
- `scaleX(0)` hides it by shrinking it horizontally
- on hover, it grows to full width

That hover trigger is here:

```css
.other-main-navigation:hover::after,
.other-main-navigation.is-active::after,
.other-main-navigation.is-exact-active::after {
  transform: scaleX(1);
}
```

So the same underline appears:

- when you hover
- when Nuxt marks the link active

## Nav Slash Separators

The slash separators are attached to the `<li>` wrapper, not the link itself.

Template reference: [SiteHeader.vue](/Users/louiecliff/Websites/f1page/app/components/site/SiteHeader.vue:167)

```vue
<li v-for="item in navItems" :key="item.id" class="other-main-navigation-item">
```

The styling is here: [main.css](/Users/louiecliff/Websites/f1page/app/assets/css/main.css:349)

```css
.other-main-navigation-item {
  @apply relative flex items-center;
}

.other-main-navigation-item:not(:last-child)::after {
  content: "/";
  position: absolute;
  right: -1.2rem;
  top: 50%;
  transform: translateY(-52%) skewX(-10deg);
  color: rgba(255, 255, 255, 0.72);
  font-family: var(--font-display);
  font-size: 1.15rem;
  line-height: 1;
}
```

### Why this works

- `:not(:last-child)` means “add the slash to every item except the final one”
- `::after` creates the slash
- `right: -1.2rem` pushes it into the gap between items
- `skewX(-10deg)` gives it that stylized forward-slash feeling
- `font-family: var(--font-display)` makes it use the bold display font instead of body text

This is a very common CSS trick: add decorative graphics with pseudo-elements so you do not need extra HTML.

## CTA And Social Button Styling

The CTA decision logic lives in [CtaItem.vue](/Users/louiecliff/Websites/f1page/app/components/ui/CtaItem.vue:33).

That file decides which CSS class to use:

- `other-cta-text`
- `other-cta-button`
- `other-cta-button-secondary`
- `other-cta-image`

### How the class gets chosen

```ts
if (props.link.button === false || props.link.variant === 'text') {
  return 'other-cta-link other-cta-text'
}

return props.link.variant === 'secondary'
  ? 'other-cta-button other-cta-button-secondary'
  : 'other-cta-button'
```

So:

- text-style links use `other-cta-text`
- normal buttons use `other-cta-button`
- outlined buttons use `other-cta-button-secondary`

### Base CTA wrapper

This is the shared base style from [main.css](/Users/louiecliff/Websites/f1page/app/assets/css/main.css:581):

```css
.other-cta {
  @apply inline-flex items-center whitespace-nowrap cursor-pointer no-underline transition-all duration-200;
  position: relative;
}
```

This means:

- `inline-flex`: lets the button size itself to its content
- `items-center`: vertically align icon and text
- `whitespace-nowrap`: stop labels breaking onto two lines
- `transition-all duration-200`: animate hover/focus changes smoothly

### Text CTA styling

From [main.css](/Users/louiecliff/Websites/f1page/app/assets/css/main.css:589):

```css
.other-cta-text {
  @apply rounded-full border border-transparent px-4 py-2 no-underline;
  color: var(--primary);
}
```

This turns a plain link into a pill-shaped action.

On hover:

```css
.other-cta-text:hover,
.other-cta-text:focus-visible {
  color: var(--color-house-black);
  background-color: var(--color-race-red);
  border-color: rgba(255, 255, 255, 0.14);
  box-shadow: 0 10px 26px rgba(225, 6, 0, 0.25);
}
```

That is the “red with black text” effect you asked for.

### Button CTA styling

From [main.css](/Users/louiecliff/Websites/f1page/app/assets/css/main.css:608):

```css
.other-cta-button {
  @apply justify-center rounded-full px-6 py-3 gap-2 no-underline border text-sm font-semibold uppercase tracking-[0.18em];
  color: var(--primary-foreground);
  background-color: var(--primary);
  border-color: var(--border);
  box-shadow: 0 10px 30px rgba(225, 6, 0, 0.25);
}
```

This gives buttons their premium look:

- `rounded-full`: capsule shape
- `uppercase`: bold game-marketing style
- `tracking-[0.18em]`: spaced-out lettering
- `box-shadow`: soft glow / lift

Hover and focus for both normal and secondary buttons:

```css
.other-cta-button:hover,
.other-cta-button:focus-visible,
.other-cta-button-secondary:hover,
.other-cta-button-secondary:focus-visible {
  transform: translateY(-1px);
  color: var(--color-house-black);
  background-color: var(--color-race-red);
  border-color: rgba(255, 255, 255, 0.14);
  box-shadow: 0 14px 32px rgba(225, 6, 0, 0.32);
}
```

### Why the hover feels premium

There are three things happening at once:

1. `translateY(-1px)`
   The button lifts slightly upward.

2. `background-color: var(--color-race-red)`
   The red brand color becomes dominant.

3. `box-shadow`
   The button gets a stronger glow/shadow, which adds depth.

That combination is more polished than just changing color.

## Section Separator Line

This is the line between sections that makes the page feel more structured.

The wrapper is added in [SectionRenderer.vue](/Users/louiecliff/Websites/f1page/app/components/sections/SectionRenderer.vue:14):

```vue
<div
  v-for="(section, sectionIndex) in sections"
  :key="section.id"
  class="other-section-shell"
>
```

That wrapper exists only to give us a hook for the divider.

The CSS is here: [main.css](/Users/louiecliff/Websites/f1page/app/assets/css/main.css:311)

```css
.other-section-shell {
  position: relative;
}

.other-section-shell + .other-section-shell::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  width: min(100% - 2rem, 76rem);
  height: 2px;
  transform: translateX(-50%);
  background:
    linear-gradient(
      90deg,
      transparent 0%,
      rgba(225, 6, 0, 0.9) 18%,
      rgba(255, 255, 255, 0.92) 50%,
      rgba(225, 6, 0, 0.9) 82%,
      transparent 100%
    );
  box-shadow: 0 0 24px rgba(225, 6, 0, 0.25);
}
```

### How this works

The selector is the key:

```css
.other-section-shell + .other-section-shell::before
```

This means:

- find an `.other-section-shell`
- but only if it comes immediately after another `.other-section-shell`
- then draw a fake element before it

In plain English:

“Add a decorative line at the start of every section except the first one.”

### Why this is useful

You do not need to manually add divider markup between every section.

Instead:

- Vue renders the sections
- CSS automatically places the divider between neighboring wrappers

That keeps the HTML cleaner and makes the effect reusable site-wide.

## Why Some Styling Lives In Templates

Example from [SiteHeader.vue](/Users/louiecliff/Websites/f1page/app/components/site/SiteHeader.vue:166):

```vue
<ul class="m-0 hidden list-none flex-row items-center gap-8 p-0 md:flex">
```

This stayed in the template because it is mostly layout:

- remove list styles
- set spacing
- hide/show at breakpoints

That kind of styling is often easiest to keep next to the markup.

## Why Some Styling Lives In `main.css`

Example:

- nav underline animation
- slash separators
- CTA hover treatment
- section divider gradient

These are visual rules, not just layout rules.

Because they are design-system pieces, it makes more sense to keep them in one shared CSS file.

## A Good Rule Of Thumb

Use Tailwind utility classes in the Vue file when:

- you are doing layout
- the style is specific to one spot
- the class list is still readable

Use `main.css` when:

- the style is reused
- the style involves pseudo-elements like `::before` or `::after`
- the style is part of the project’s brand system
- the effect is too long or too complex for inline utility classes

## How To Tweak Things Safely

### If you want the nav links more subtle

Edit [main.css](/Users/louiecliff/Websites/f1page/app/assets/css/main.css:346):

- reduce `tracking-[0.2em]`
- change `text-white/78` to something dimmer like `text-white/65`

### If you want the CTA hover to be less aggressive

Edit [main.css](/Users/louiecliff/Websites/f1page/app/assets/css/main.css:593):

- reduce the red opacity/shadow
- remove the `translateY(-1px)`

### If you want a stronger section divider

Edit [main.css](/Users/louiecliff/Websites/f1page/app/assets/css/main.css:314):

- increase `height: 2px` to `3px`
- strengthen the white middle color
- increase the `box-shadow`

## Mental Model To Keep

When you see styling in this project, ask:

1. Is this layout or branding?
2. Is it reused or one-off?
3. Does it need pseudo-elements or animation?

If it is:

- layout and one-off: put it in the template
- branding and reusable: put it in `main.css`

That one habit will make the whole styling workflow much easier to reason about.
