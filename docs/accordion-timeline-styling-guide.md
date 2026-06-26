# Accordion And Timeline Styling Guide

This guide explains the styling applied to:

- the `accordion_section`
- the `timeline_section`

It focuses on:

- where the structure lives
- which CSS selectors control the styling
- what each effect is doing
- where you can safely change things yourself

If you are learning CSS and Tailwind at the same time, the key thing to remember is:

1. the Vue file gives the component its structure
2. `main.css` gives the component its branded visual behavior

## Where The Structure Lives

Accordion structure:

- [AccordionSection.vue](/Users/louiecliff/Websites/f1page/app/components/sections/AccordionSection.vue)

Timeline structure:

- [TimelineSection.vue](/Users/louiecliff/Websites/f1page/app/components/sections/TimelineSection.vue)

Shared styling:

- [main.css](/Users/louiecliff/Websites/f1page/app/assets/css/main.css)

## Accordion Structure

The accordion rows are rendered here in [AccordionSection.vue](/Users/louiecliff/Websites/f1page/app/components/sections/AccordionSection.vue:19):

```vue
<details
  v-for="(card, index) in section.cards"
  :key="card.id"
  class="other-accordion-item other-item"
  :open="index === 0"
>
```

Important details:

- each row is a native HTML `<details>` element
- the heading row is the `<summary>`
- the first item opens by default with `:open="index === 0"`

The summary row is here:

```vue
<summary class="other-accordion-summary cursor-pointer">
```

The title is:

```vue
<h3 class="other-accordion-title">
```

The plus/minus icon is:

```vue
<span class="other-accordion-icon">
  <span class="bar bar-horizontal" />
  <span class="bar bar-vertical" />
</span>
```

This is a useful pattern: instead of importing an icon, the plus sign is built from two little bars in CSS.

## Accordion Styling

The accordion styling starts here in [main.css](/Users/louiecliff/Websites/f1page/app/assets/css/main.css:1093).

### 1. Accordion list width

```css
.other-accordion-section .other-accordion-list {
  max-width: 64rem;
}
```

This stops the accordion from stretching too wide across the page.

### 2. Accordion item base panel

```css
.other-accordion-section .other-accordion-item {
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.06), rgb(255 255 255 / 0.02)),
    rgb(255 255 255 / 0.03);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.1),
    0 20px 50px rgb(0 0 0 / 0.16);
}
```

What this does:

- `position: relative` lets pseudo-elements be positioned inside the row
- `overflow: hidden` clips decorative elements cleanly
- the layered `background` creates a glassy premium panel
- the `box-shadow` adds depth

### 3. Left accent rail

```css
.other-accordion-section .other-accordion-item::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 0.22rem;
  background: linear-gradient(180deg, var(--color-race-red), var(--color-gold));
  opacity: 0;
}
```

This creates the thin vertical accent line on the left side of the row.

It is hidden by default with `opacity: 0`.

It appears on hover or when the item is open:

```css
.other-accordion-section .other-accordion-item:hover::before,
.other-accordion-section .other-accordion-item[open]::before {
  opacity: 1;
}
```

That is a very common CSS technique:

- create decoration with `::before`
- hide it initially
- reveal it on interaction

### 4. Hover panel behavior

```css
.other-accordion-section .other-accordion-item:hover {
  transform: translateY(-2px);
  border-color: rgb(255 255 255 / 0.18);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.12),
    0 24px 60px rgb(0 0 0 / 0.2);
}
```

This makes the row lift slightly and feel interactive.

The important pieces are:

- `translateY(-2px)` makes it rise
- `border-color` brightens the border
- `box-shadow` becomes stronger

### 5. Title underline

```css
.other-accordion-section .other-accordion-title::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -0.55rem;
  width: 4rem;
  height: 2px;
  background: linear-gradient(90deg, var(--color-race-red), var(--color-gold));
  transform: scaleX(0);
  transform-origin: left;
}
```

This creates the underline accent under the title.

It appears when hovered or opened:

```css
.other-accordion-section .other-accordion-item:hover .other-accordion-title::after,
.other-accordion-section .other-accordion-item[open] .other-accordion-title::after {
  transform: scaleX(1);
}
```

This works the same way as the nav underline:

- create a pseudo-element
- hide it with `scaleX(0)`
- reveal it with `scaleX(1)`

### 6. Accordion icon behavior

The icon shell:

```css
.other-accordion-section .other-accordion-icon {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 9999px;
}
```

The two bars:

```css
.other-accordion-section .other-accordion-icon .bar { ... }
.other-accordion-section .other-accordion-icon .bar-vertical {
  transform: translate(-50%, -50%) rotate(90deg);
}
```

This gives you a plus sign.

When the item opens:

```css
.other-accordion-section .other-accordion-item[open] .other-accordion-icon {
  transform: rotate(90deg);
}

.other-accordion-section .other-accordion-item[open] .other-accordion-icon .bar-vertical {
  opacity: 0;
}
```

That makes the plus sign reduce into a minus-like state.

## Timeline Structure

The timeline item loop is here in [TimelineSection.vue](/Users/louiecliff/Websites/f1page/app/components/sections/TimelineSection.vue:24):

```vue
<article
  v-for="(card, index) in section.cards"
  :key="card.id"
  class="other-timeline-item other-item"
>
```

Each item contains:

- a step row
- an optional image
- text content

The step row:

```vue
<div class="other-timeline-step">
  <span class="other-timeline-step-index">
    {{ String(index + 1).padStart(2, '0') }}
  </span>
  <span class="other-timeline-step-line" />
</div>
```

This is what creates the roadmap feel:

- numbered step pill like `01`
- horizontal line extending to the right

## Timeline Styling

Timeline styling starts here in [main.css](/Users/louiecliff/Websites/f1page/app/assets/css/main.css:1213).

### 1. Timeline card panel

```css
.other-timeline-section .other-timeline-item {
  position: relative;
  display: grid;
  gap: 1.25rem;
  overflow: hidden;
  padding: 1.25rem;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.06), rgb(255 255 255 / 0.02)),
    rgb(255 255 255 / 0.03);
}
```

This is similar to the accordion:

- layered background
- depth through shadow
- spacing between internal sections

### 2. Moving sheen effect

```css
.other-timeline-section .other-timeline-item::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(120deg, transparent 0%, rgb(255 255 255 / 0.02) 36%, rgb(255 255 255 / 0.08) 50%, transparent 64%);
  transform: translateX(-24%);
  opacity: 0;
}
```

This creates a soft diagonal sheen across the card.

On hover:

```css
.other-timeline-section .other-timeline-item:hover::before {
  opacity: 1;
  transform: translateX(0);
}
```

This is one of the “speed” cues:

- diagonal highlight
- slight motion
- very restrained

### 3. Timeline hover lift

```css
.other-timeline-section .other-timeline-item:hover {
  transform: translateY(-3px);
}
```

Like the accordion, this helps the card feel touchable and premium.

### 4. Step pill and line

The step number pill:

```css
.other-timeline-section .other-timeline-step-index {
  min-width: 3.25rem;
  padding: 0.45rem 0.8rem;
  border-radius: 9999px;
  font-family: var(--font-display);
}
```

The line:

```css
.other-timeline-section .other-timeline-step-line {
  flex: 1;
  height: 2px;
  background:
    linear-gradient(90deg, rgb(255 204 0 / 0.8), rgb(255 255 255 / 0.35), transparent);
}
```

This gives the section its “roadmap” feel.

On hover:

```css
.other-timeline-section .other-timeline-item:hover .other-timeline-step-line {
  filter: drop-shadow(0 0 10px rgb(255 204 0 / 0.28));
}
```

That small glow makes the line feel more alive.

### 5. Timeline title underline

```css
.other-timeline-section .other-timeline-title::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -0.65rem;
  width: 3.5rem;
  height: 2px;
  background: linear-gradient(90deg, var(--color-race-red), var(--color-gold));
  transform: scaleX(0);
}
```

Then on hover:

```css
.other-timeline-section .other-timeline-item:hover .other-timeline-title::after {
  transform: scaleX(1);
}
```

Again, same general pattern:

- decorative pseudo-element
- hidden by scale
- revealed on hover

## Why These Sections Feel More “F1”

The styling choices that push them closer to a premium racing-game feel are:

- red/gold accent lines
- glass-panel backgrounds
- strong uppercase display type
- directional motion cues
- restrained hover lift
- visual sequencing through pills, lines, and numbering

That combination feels much more on-brand than plain cards or plain accordions.

## Where To Tweak Things Yourself

### Accordion

If you want to change the hover lift:

- edit `.other-accordion-item:hover`

If you want the left accent line thicker:

- edit `.other-accordion-item::before`

If you want the underline longer:

- edit `.other-accordion-title::after`

If you want the icon bigger:

- edit `.other-accordion-icon`

### Timeline

If you want the sheen stronger:

- edit `.other-timeline-item::before`

If you want more glow on the step line:

- edit `.other-timeline-step-line`
- and `.other-timeline-item:hover .other-timeline-step-line`

If you want the number pill bigger:

- edit `.other-timeline-step-index`

If you want the title underline longer:

- edit `.other-timeline-title::after`

## Tailwind vs Plain CSS Here

These two sections are a good example of when plain CSS is the better tool.

Why?

- they use `::before` and `::after`
- they use state-based relationships like:
  - `.other-accordion-item:hover .other-accordion-title::after`
  - `.other-timeline-item:hover::before`
- they use layered gradients and shadows

That kind of styling is easier to maintain in `main.css` than directly in the template.

The templates still use Tailwind classes for:

- layout
- spacing
- width limits
- breakpoint changes

But the branded interaction design lives in shared CSS.

## Good Next Practice Changes

If you want to experiment safely, good practice edits would be:

1. Increase the accordion title underline width
2. Make the accordion hover lift stronger or weaker
3. Change the timeline step-line glow strength
4. Make the timeline sheen subtler or more visible
5. Adjust the timeline card padding

These are ideal next exercises because they are noticeable, but low-risk.
