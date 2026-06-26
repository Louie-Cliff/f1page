# Storyblok Timeline Setup

This repo already supports a timeline section, so the content model and frontend mapping are already in place.

The path is:

- Storyblok component: `timeline_section`
- Vue component: [TimelineSection.vue](/Users/louiecliff/Websites/f1page/app/components/sections/TimelineSection.vue)
- Storyblok normalization: [storyblok-mappers.ts](/Users/louiecliff/Websites/f1page/app/utils/content/storyblok-mappers.ts)
- Section registry: [sections.ts](/Users/louiecliff/Websites/f1page/app/utils/content/sections.ts)

## What This Section Is Good For

This version of the timeline works especially well for:

- `Upcoming Season Features`
- `Roadmap`
- `Race Weekend Progression`
- `Career Mode Milestones`

For your learning project, `Upcoming Season Features` is a very good fit because it teaches:

- repeatable CMS items
- section intro copy
- visual sequencing
- styling a grid of related feature cards

## 1. Parent Storyblok Component

Create or confirm a component called `timeline_section`.

It should have these fields:

1. `copy`
   Type: `Richtext`
   Use this for the section heading and intro copy.

2. `items`
   Type: `Blocks`
   Restrict allowed components to `instance_timeline`.

3. `theme`
   Type: `Single-Option`
   Suggested values:
   - `black`
   - `white`
   - `gold`
   - `fuchsia`
   - `teal`
   - `red`

## 2. Child Timeline Item Component

Create or confirm a component called `instance_timeline`.

It should have these fields:

1. `title`
   Type: `Text`
   Main feature title.

2. `copy`
   Type: `Richtext`
   Supporting copy explaining the feature.

3. `image`
   Type: `Asset`
   Optional visual for the feature.

4. `subtitle`
   Type: `Text`
   Optional short label like `Phase 01`, `Launch`, `Mid-season`, `Live Ops`.

## 3. Add It To A Page

Inside the page `body` field:

1. Add a new blok of type `timeline_section`
2. Fill in `copy` with the section heading and intro
3. Add several `instance_timeline` items inside `items`
4. Choose a `theme`

## 4. Suggested “Upcoming Season Features” Content

Section intro:

- Heading: `Upcoming Season Features`
- Paragraph: `Fresh systems, deeper competition, and sharper strategy updates are headed to the grid.`

Example timeline items:

1. `Dynamic Weather Weekends`
   Subtitle: `Phase 01`
   Copy: Explain changing track conditions and tyre strategy.

2. `Expanded Rival Matchups`
   Subtitle: `Phase 02`
   Copy: Explain more head-to-head PvP or league features.

3. `Team Development Upgrades`
   Subtitle: `Phase 03`
   Copy: Explain staff, facilities, or driver progression improvements.

4. `Live Seasonal Events`
   Subtitle: `Phase 04`
   Copy: Explain time-limited events, rewards, or leaderboard pushes.

## 5. What The Frontend Expects

The Storyblok mapper already handles:

- `timeline_section` -> section type `timeline_section`
- `items` -> timeline cards
- `instance_timeline.title` -> card title
- `instance_timeline.subtitle` -> kicker label
- `instance_timeline.copy` -> body copy
- `instance_timeline.image` -> card image

So no extra backend work is required just to render it.

## 6. Styling Hooks

Main component:

- [TimelineSection.vue](/Users/louiecliff/Websites/f1page/app/components/sections/TimelineSection.vue)

Shared styling hooks in:

- [main.css](/Users/louiecliff/Websites/f1page/app/assets/css/main.css)

Useful selectors:

- `.other-timeline-section`
- `.other-timeline-list`
- `.other-timeline-item`
- `.other-timeline-step`
- `.other-timeline-step-index`
- `.other-timeline-step-line`
- `.other-timeline-media`
- `.other-timeline-content`
- `.other-timeline-kicker`
- `.other-timeline-title`
- `.other-timeline-copy`

## 7. What To Tweak Next

Once you’ve added the section in Storyblok, good styling practice tasks would be:

1. Change the grid gaps between timeline cards
2. Adjust card padding
3. Change the image aspect ratio
4. Make the step label pills larger or smaller
5. Tighten or loosen the title line-height

That makes this a very good section for both CMS practice and Tailwind learning.
