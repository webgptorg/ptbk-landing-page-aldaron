# Homepage handwriting

The 15 November correction replaces the original hand-built alphabet with whole
word drawings exported from **https://www.calligrapher.ai/** in the owner's
browser: Style **9** (internal value 21), Legibility **0.75**, Stroke Width
**0.76**. Speed was temporarily increased for capture; it does not change shape.

`scripts/hero-calligrapher-raw.json` preserves the original filled SVG paths and
their measured bounds. `node scripts/prepare-hero-calligrapher.cjs` prepares
`businesses/new/heroCalligrapher.json`; this is an explicit editorial operation,
not a build hook. It translates/scales the complete drawings without substituting
glyphs or changing inter-letter spacing. The client ships only reviewed SVGs,
without a model download or generator request.

Calligrapher's character vocabulary is English. Czech words were generated from
their unaccented spelling. Czech acute accents use its generated apostrophe;
carons use a reduced generated v, with a small edge stroke for legibility. Only
the relevant i dots are replaced; j dots and all original letter contours stay.
These additions are recorded in the preparation script and never silently
passed off as native Czech generation.

Each pressure-shaped ribbon retains its original filled contour. The animation
mask follows the centerline recovered from its paired outline points, in the
original writing order. Unique mask IDs preserve SSR/hydration and multiple
headlines. CSS uses each real word width, easing horizontal changes over 350 ms
with normal word gaps. It does not reserve the longest word inside the sentence.
Constant vertical space accommodates long handwritten descenders. Hidden tabs,
offscreen pause, static reduced motion and accessible initial copy are retained.

Checks: all 16 Czech/English activity drawings, complete mask rendering, rotation,
width changes, unique masks, visibility pause and reduced-motion behavior.
