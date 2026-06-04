# F1 Clash Homepage Content Plan

This repo already has the right CMS structure to recreate the `https://f1clashgame.com/` homepage without changing the backend model much.

Treat the work as two tracks:

1. Frontend styling:
   Use the shared section components to make the site feel like a high-energy game landing page.
2. Storyblok content entry:
   Build the homepage in Storyblok by stacking existing section types in the right order.

## Suggested Storyblok Homepage Structure

Create or edit the homepage story, usually `home`, and add sections in this order:

1. `hero_section`
   Use for the opening banner with the strongest game screenshot or key art.
   Put the main headline, short intro, and app store / play CTA buttons in `copy` and `ctas`.

2. `feature_section`
   Use for the “From the paddock to the grid to the podium” style block.
   Pair bold copy with a vertical phone screenshot or promotional image.

3. `cards_section`
   Use for the four gameplay feature tiles:
   `Beat your rival`, `Seize the initiative`, `Race together`, `Take control`.
   Set columns to `xs:1, md:2, xl:4` if you want a compact desktop grid.

4. `spotlight_section`
   Use for the “Real Rivals. Real Time.” style highlight.
   This works well for the mid-page focus section with one large image and supporting text.

5. `spotlight_section` or `cards_section`
   Use for “Join the Community”.
   If you want one large callout with social links, use `spotlight_section`.
   If you want individual social items, use `cards_section`.

6. `testimonials_section`
   Use for the “Fan Telemetry” / player quotes carousel.

7. `news_section`
   Use if your boss wants the homepage to include recent updates like the real site ecosystem does.

## Field Mapping Notes

- `theme`: prefer `black` for most sections, then use `gold` or `white` sparingly for contrast.
- `copy`: headings and supporting text should live here; the updated frontend styling now treats rich text headings as the main visual driver.
- `ctas`: use primary buttons for `Play now`, and secondary buttons for things like `Watch trailer` or `Join Discord`.
- `image`: use tall gameplay screenshots or wide promotional art depending on the section.
- `align`: alternate `left` and `right` in feature sections so the page keeps moving visually.

## What “Backend” Means Here

For this project, “backend” is mostly:

- making sure Storyblok has the correct homepage story
- entering content into the right section types
- keeping `/admin` site settings updated for navigation, logo, legal copy, and footer content

You probably do not need new server routes or database work to get the homepage close to the F1 Clash reference.

## Recommended First Pass

1. Set up `/admin` site settings with logo, nav, footer legal copy, and domain.
2. Build the homepage in Storyblok with the section order above.
3. Fill sections with placeholder copy and images first.
4. Refine the visuals once the page rhythm feels right.

That gets you to a reviewable homepage much faster than trying to perfect each block before the full page exists.
