# Homepage handwriting

## Activity-specific animation, 16 November

Only `píše` / `writes` now uses these Calligrapher paths. The other retained
exports remain unchanged as source assets. `HeroActivity` gives the other actions
distinct assembly, code, accounting/filing, planning, transcription/reply, scan
and verification entrances. They use the brand heading typeface, with compact
system monospace for code, and settle before the existing 1,320 ms entrance
budget ends. The original word rotation, hold/fade timing and one-time underline
remain unchanged. A complete hidden copy measures each word in its actual
font; ResizeObserver and font readiness refresh the width, including on phones.
No-JavaScript and reduced-motion output remain complete; the shared clock and
CSS pause every effect while hidden/offscreen.

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

The follow-up weight correction retains each original contour and expands its edge
by 6.5 SVG units with rounded joins, matching the adjacent Exo 2 600 strokes.
Reveal masks expand by the same amount so the added weight is not clipped.
The entire second line uses `min(1em, 8.8cqi)` within an inline-size headline
container, retaining .28em word gaps and room for the longest activity on phones.
No original SVG data or inter-letter spacing is changed.

Each pressure-shaped ribbon retains its original filled contour. The animation
mask follows the centerline recovered from its paired outline points, in the
original writing order. Unique mask IDs preserve SSR/hydration and multiple
headlines. CSS uses each real word width, easing horizontal changes over 350 ms
with normal word gaps. It does not reserve the longest word inside the sentence.
Constant vertical space accommodates long handwritten descenders. Hidden tabs,
offscreen pause, static reduced motion and accessible initial copy are retained.

Checks: all eight activity modes in Czech/English, original writing paths,
unique masks, one accessible promise, rotation, unchanged underline, visibility
pause and reduced-motion behavior. Browser QA checks all 16 complete phrases
at viewport widths 320, 360, 390, 768 and 1440 pixels.
