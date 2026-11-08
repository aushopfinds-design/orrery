# Category illustrations and motion — 15 October 2026

Seven distinct illustrations replace the flat navy category covers, including the bundle. Existing report copy, proposed prices and preview/sample links are preserved.

## Assets

Generation mode: built-in `image_gen.imagegen`, one independent generation per category. Original outputs are preserved in `../generated_images/`; project assets are copied into `public/images/reports/` as responsive 640 px and 1200 px WebP files using Sharp (format conversion and downscaling only). No API-key CLI was used.

| Category | Scene | Responsive asset paths |
| --- | --- | --- |
| year | Year Ahead — crescent moon and lake | `public/images/reports/year-v1-640.webp`, `public/images/reports/year-v1-1200.webp` |
| career | Career & Money — steps toward an open door | `public/images/reports/career-v1-640.webp`, `public/images/reports/career-v1-1200.webp` |
| compatibility | Love Compatibility — a couple on a bridge | `public/images/reports/compatibility-v1-640.webp`, `public/images/reports/compatibility-v1-1200.webp` |
| complete | Complete Life Reading — ancient tree and key | `public/images/reports/complete-v1-640.webp`, `public/images/reports/complete-v1-1200.webp` |
| business | Business & Entrepreneurship — growing golden tree | `public/images/reports/business-v1-640.webp`, `public/images/reports/business-v1-1200.webp` |
| wellbeing | Everyday Balance — quiet lotus garden | `public/images/reports/wellbeing-v1-640.webp`, `public/images/reports/wellbeing-v1-1200.webp` |
| bundle | Complete Bundle — three connected celestial arches | `public/images/reports/bundle-v1-640.webp`, `public/images/reports/bundle-v1-1200.webp` |

## Motion and accessibility

- A 12-second alternating camera zoom, a 4.8-second warm glow, five slow twinkles and two floating motes animate each illustration. Text stays still.
- IntersectionObserver pauses illustrations outside the viewport. Page visibility pauses effects in a background tab.
- “Pause image effects” / “Play image effects” controls all seven catalog illustrations. Reduced-motion preferences disable animation by default; an explicit play action can enable it.
- Decorative covers are hidden from screen readers; the visible report heading and description supply the accessible content. The pause control has keyboard focus styling and a 44 px minimum height.
- Images use lazy loading, asynchronous decoding, explicit dimensions and responsive image sources. Printing disables motion.

## Validation

- All 352 tests across 22 files passed, including locale key parity and existing report flows.
- Targeted ESLint checks passed for both changed React components. The TypeScript/Vite production build passed.
- All fourteen WebP files were checked for format, expected width and byte-for-byte equality with the production build copies.
- Browser visual QA is unavailable in this managed environment; these checks do not establish an on-device motion test.

## Full generation prompts

### year

Use case: stylized-concept. Asset type: a finished, immersive category-cover illustration for The Fate Key website, NOT a website screenshot or a UI mockup. Wide landscape 3:2 composition suitable for a 16:9 crop. Rich cinematic painterly realism, fine antique-gold details, midnight navy and indigo shadows, soft atmospheric mist, warm luminous highlights and subtle stardust, elegant enchanted-world mood matching a golden tree and mystical key brand. The image itself must feel full and richly illustrated, not like a flat gradient or an icon. Place the main visual focal point in the middle-right of the canvas, keeping the left third darker and quieter for real HTML text that will be added later. Preserve all important subjects inside the central 75% of the height. No text, no words, no letters, no numbers, no logo, no watermark, no borders, no panels, no collage. One coherent full-bleed scene.
Scene: A magnificent warm-gold crescent moon above a deep-blue mountain lake. A delicate celestial ring with twelve small luminous star points curves over the landscape, its reflection shimmering across the water. Antique-gold astrolabe details merge gracefully with the stars. A subtle illuminated path follows the lake toward a new dawn. Moon and the celestial ring are the clear focal points; beautiful richly detailed night-sky atmosphere.

### career

Use case: stylized-concept. Asset type: a finished, immersive category-cover illustration for The Fate Key website, NOT a website screenshot or a UI mockup. Wide landscape 3:2 composition suitable for a 16:9 crop. Rich cinematic painterly realism, fine antique-gold details, midnight navy and indigo shadows, soft atmospheric mist, warm luminous highlights and subtle stardust, elegant enchanted-world mood matching a golden tree and mystical key brand. The image itself must feel full and richly illustrated, not like a flat gradient or an icon. Place the main visual focal point in the middle-right of the canvas, keeping the left third darker and quieter for real HTML text that will be added later. Preserve all important subjects inside the central 75% of the height. No text, no words, no letters, no numbers, no logo, no watermark, no borders, no panels, no collage. One coherent full-bleed scene.
Scene: A curving stone stair and a fine golden light-path wind up a midnight-blue mountain toward a tall elegant doorway, slightly open, spilling warm golden light over detailed steps. The doorway's small antique-key-shaped ornament catches the light. Distant mountain horizons suggest different possibilities. This should feel like discovering a fitting direction and opportunity, not a corporate stock photo; no person needed.

### compatibility

Use case: stylized-concept. Asset type: a finished, immersive category-cover illustration for The Fate Key website, NOT a website screenshot or a UI mockup. Wide landscape 3:2 composition suitable for a 16:9 crop. Rich cinematic painterly realism, fine antique-gold details, midnight navy and indigo shadows, soft atmospheric mist, warm luminous highlights and subtle stardust, elegant enchanted-world mood matching a golden tree and mystical key brand. The image itself must feel full and richly illustrated, not like a flat gradient or an icon. Place the main visual focal point in the middle-right of the canvas, keeping the left third darker and quieter for real HTML text that will be added later. Preserve all important subjects inside the central 75% of the height. No text, no words, no letters, no numbers, no logo, no watermark, no borders, no panels, no collage. One coherent full-bleed scene.
Scene: Two clearly adult people, seen from a graceful distance in three-quarter silhouette, stand close together with hands lightly touching on a small stone bridge over a still midnight-blue lake. Two streams of delicate gold light rise around them and meet above into a loose luminous heart-shaped arch made of tiny stars, subtle and elegant, not a huge cartoon heart. Soft flowering branches and reflected amber light frame the romantic scene. The two people and their connection must be visually clear; no visible detailed faces.

### complete

Use case: stylized-concept. Asset type: a finished, immersive category-cover illustration for The Fate Key website, NOT a website screenshot or a UI mockup. Wide landscape 3:2 composition suitable for a 16:9 crop. Rich cinematic painterly realism, fine antique-gold details, midnight navy and indigo shadows, soft atmospheric mist, warm luminous highlights and subtle stardust, elegant enchanted-world mood matching a golden tree and mystical key brand. The image itself must feel full and richly illustrated, not like a flat gradient or an icon. Place the main visual focal point in the middle-right of the canvas, keeping the left third darker and quieter for real HTML text that will be added later. Preserve all important subjects inside the central 75% of the height. No text, no words, no letters, no numbers, no logo, no watermark, no borders, no panels, no collage. One coherent full-bleed scene.
Scene: An ancient luminous tree of life stands on an island above a misty valley, with intricate golden leaves and deep roots following branching paths. A beautiful antique celestial key with a star-shaped centre hangs within the branches. Warm light travels into different paths across the ground, suggesting many chapters of one life. Highly detailed natural bark, moss, roots and fantastical golden light; a fresh original composition, no moon as the primary subject.

### business

Use case: stylized-concept. Asset type: a finished, immersive category-cover illustration for The Fate Key website, NOT a website screenshot or a UI mockup. Wide landscape 3:2 composition suitable for a 16:9 crop. Rich cinematic painterly realism, fine antique-gold details, midnight navy and indigo shadows, soft atmospheric mist, warm luminous highlights and subtle stardust, elegant enchanted-world mood matching a golden tree and mystical key brand. The image itself must feel full and richly illustrated, not like a flat gradient or an icon. Place the main visual focal point in the middle-right of the canvas, keeping the left third darker and quieter for real HTML text that will be added later. Preserve all important subjects inside the central 75% of the height. No text, no words, no letters, no numbers, no logo, no watermark, no borders, no panels, no collage. One coherent full-bleed scene.
Scene: An enchanted stone courtyard with an elegant open archway and a small flourishing young tree growing in an antique-gold planter. Several fine golden light-lines from its roots branch into luminous little lanterns along paths leading to distant midnight-blue rooftops, like connections and a new venture taking shape. A beautiful small antique key rests at the base of the tree. Rich material detail, purposeful growth and cooperation, sophisticated rather than cartoonish. No coins, no money piles, no graphs.

### wellbeing

Use case: stylized-concept. Asset type: a finished, immersive category-cover illustration for The Fate Key website, NOT a website screenshot or a UI mockup. Wide landscape 3:2 composition suitable for a 16:9 crop. Rich cinematic painterly realism, fine antique-gold details, midnight navy and indigo shadows, soft atmospheric mist, warm luminous highlights and subtle stardust, elegant enchanted-world mood matching a golden tree and mystical key brand. The image itself must feel full and richly illustrated, not like a flat gradient or an icon. Place the main visual focal point in the middle-right of the canvas, keeping the left third darker and quieter for real HTML text that will be added later. Preserve all important subjects inside the central 75% of the height. No text, no words, no letters, no numbers, no logo, no watermark, no borders, no panels, no collage. One coherent full-bleed scene.
Scene: An exquisitely peaceful moonlit garden, a calm reflective pool, a mossy stone ledge and a softly luminous golden lotus on still water. A graceful tree branch curves above, with a few gold leaves descending slowly, and soft warm lantern light glows through deep indigo mist. A small bronze key lies naturally on the stone ledge near the water. Compose an immediate feeling of breathing space, balanced everyday rhythm and gentle restoration. No people, no medical imagery.

### bundle

Use case: stylized-concept. Asset type: a finished, immersive category-cover illustration for The Fate Key website, NOT a website screenshot or a UI mockup. Wide landscape 3:2 composition suitable for a 16:9 crop. Rich cinematic painterly realism, fine antique-gold details, midnight navy and indigo shadows, soft atmospheric mist, warm luminous highlights and subtle stardust, elegant enchanted-world mood matching a golden tree and mystical key brand. The image itself must feel full and richly illustrated, not like a flat gradient or an icon. Place the main visual focal point in the middle-right of the canvas, keeping the left third darker and quieter for real HTML text that will be added later. Preserve all important subjects inside the central 75% of the height. No text, no words, no letters, no numbers, no logo, no watermark, no borders, no panels, no collage. One coherent full-bleed scene.
Scene: A majestic celestial garden hall at night with three elegant open archways set into one continuous architectural space. A luminous tree is visible through one arch, a crescent over a lake through the next, and two small intertwined golden trails through the third. One beautifully detailed antique key floats at the centre where the three light-paths meet. The three arches form one believable, atmospheric panoramic scene with depth and warm gold light. This is a unified illustration, never a triptych, split-screen, collage or three separate panels.
