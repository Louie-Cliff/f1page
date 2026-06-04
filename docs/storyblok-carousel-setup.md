# Storyblok Carousel Setup

This project already maps a Storyblok blok named `gallery_section` to [GallerySection.vue](/Users/louiecliff/Websites/f1page/app/components/sections/GallerySection.vue).

The full path is:

- Storyblok component name: `gallery_section`
- Vue renderer: [GallerySection.vue](/Users/louiecliff/Websites/f1page/app/components/sections/GallerySection.vue)
- Section registry: [sections.ts](/Users/louiecliff/Websites/f1page/app/utils/content/sections.ts)
- Storyblok normalization: [storyblok-mappers.ts](/Users/louiecliff/Websites/f1page/app/utils/content/storyblok-mappers.ts)

## 1. Create the Parent Section Blok

In Storyblok, create a new component called `gallery_section`.

Set it up with these fields:

1. `copy`
   Type: `Richtext`
   Use this for the section heading and intro copy.

2. `items`
   Type: `Blocks`
   Restrict allowed components to `instance_media`.

3. `theme`
   Type: `Single-Option`
   Suggested values: `black`, `white`, `gold`, `fuchsia`, `teal`

If your homepage body field already allows `gallery_section`, you can add it straight away. If not, add `gallery_section` to the allowed blok types for the page body field.

## 2. Create the Slide Item Blok

Create another component called `instance_media`.

Set it up with these fields:

1. `image`
   Type: `Asset`
   Optional, but usually this is what each carousel slide uses.

2. `video`
   Type: `Text`
   Optional fallback for a video URL or video label.

At least one of `image` or `video` needs to be filled per slide, otherwise the slide will be ignored by the frontend mapper.

## 3. Why These Names Matter

The frontend is expecting these exact names:

- `gallery_section`
- `copy`
- `items`
- `theme`
- `instance_media`
- `image`
- `video`

Those names are read here in [storyblok-mappers.ts](/Users/louiecliff/Websites/f1page/app/utils/content/storyblok-mappers.ts), where:

- `gallery_section` becomes a section of type `gallery_section`
- each `instance_media` block becomes one carousel slide

## 4. How to Add It to the Homepage

Open your homepage story in Storyblok, usually `home`.

In the `body` field:

1. Add a new blok of type `gallery_section`
2. Fill in `copy` with a heading and intro text
3. Add several `instance_media` items inside `items`
4. Upload the images for each slide
5. Set `theme` to `black` for the current homepage styling

## 5. Example Content Shape

For the section intro, something like:

- Heading: `Race Highlights`
- Paragraph: `A quick look at the circuits, moments, and rivalries that define the season.`

Then add 3-6 `instance_media` slides with landscape images.

## 6. When You Need a New Blok Name Instead

If you specifically want the CMS label to be `carousel_section` instead of `gallery_section`, we can do that too, but it requires matching changes in:

- [content.ts](/Users/louiecliff/Websites/f1page/app/types/content.ts)
- [sections.ts](/Users/louiecliff/Websites/f1page/app/utils/content/sections.ts)
- [section-normalization.ts](/Users/louiecliff/Websites/f1page/app/utils/content/section-normalization.ts)
- [storyblok-mappers.ts](/Users/louiecliff/Websites/f1page/app/utils/content/storyblok-mappers.ts)

For now, reusing `gallery_section` is the simplest path and already works with this codebase.
