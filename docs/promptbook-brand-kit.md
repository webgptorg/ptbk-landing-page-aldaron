# Promptbook brand kit

The 5 November 2026 owner brief supersedes the English-only kit. `/cs/branding`
and `/en/branding` use the launch shell, matching language navigation, metadata,
sharing images and footer links. The unprefixed entry selects the browser language
with a private 307 and retains the query. The podcast's own `/branding` remains independent.

## Sources and scope

`lib/promptbook-brand/brand.json` owns the product palette, messages, logo geometry
and public asset paths. Both the launch website and kit consume its scoped tokens
and the identical SVG lockup. Copy follows the current homepage and the Reborn
`README.md`: ongoing responsibilities, user rules, an engine on the user's machine,
user-owned files and a choice of models. No customer evidence or performance claims
are introduced. `lib/promptbook-brand/index.ts` shares the homepage's intro sentences.

All changes apply to Promptbook. AI ta Krajta and Pavol's personal sites retain their
own artwork, components, routes, fonts, tokens and copy. Original `/logo/*` assets
remain unchanged because other existing surfaces use them. The new `/brand/*`
files have their own paths and explicit static-file allowlist entries.

## Brand name

The 11 November 2026 website typography selection is Exo 2 (headings, 600) with
Barlow (body/UI, 400–700). The localized marketing shell loads complete local WOFF2
files from `public/fonts/promptbook`, with their OFL notices and source checksums.
The website's type specimens use this pair. The outlined Inter wordmark and the
previously exported Outfit/Inter slide/social templates retain their original artwork.

Use Promptbook in text and `promptbook` in the logo. The official abbreviation
is `ptbk` in lowercase. The CLI command uses the same spelling.

## Logo construction

`artwork.json` retains the three authored PB curves from
`webgptorg/promptbook/design/source/logo-design-system.svg` (Reborn branch;
source-file commit `3022f26d4adc667b4cf9903b70977bd76f5113bc`). It contains no raster trace.
`scripts/brand/generate.py` projects the three faces onto an exact isometric cube:
the six vertices are `(64,4)`, `(64+30√3,34)`, `(64+30√3,94)`, `(64,124)`,
`(64−30√3,94)`, `(64−30√3,34)`. The envelope has six 60-unit sides and 120° angles.
The construction hexagon is a guide, not an extra visible outline in the logo.

The full lockup uses equal-size Inter Medium (500) for `prompt` and Inter Bold
(700) for `book`. The lowercase `ptbk` lockup uses Inter Medium (500) throughout.
Both have outlined lettering. The light artwork uses an ink-blue symbol and
near-black lettering, with ink-blue `book` in the full version. The all-white
artwork has a transparent export for ink-blue surfaces and a solid black export.
The cube's vertical edge matches the wordmark's cap height. In the full lockup,
the gap from the symbol to the first letter is about 40 units in the 760-unit
viewBox. Clear space is ¼ of the symbol height on every side.
Digital minimums are 32 px for the symbol and 160 px for the complete lockup;
the page shows both at their actual desktop sizes. Print remains an actual-size
legibility check rather than an invented universal millimetre threshold.

## Regeneration

With Python FontTools and the repository's Sharp dependency available:

```sh
python scripts/brand/generate.py
```

This explicit editorial command generates the committed SVGs, transparent PNGs,
localized 16:9 and social templates, Markdown rules, JSON tokens, CSS variables and
an optional ZIP with stable entry dates. Raster templates use local Outfit/Inter
through Fontconfig; they require no font-network request. Template SVG text stays
editable and requires those fonts. Font licences are already in `public/fonts/workshop`.
Generation never runs during a website build or calls an AI provider.

The full Czech and English PDFs print the actual localized pages. With the site
running locally and Playwright Chromium installed, regenerate the PDFs and ZIP:

```sh
node scripts/brand/export-guide.cjs http://localhost:4009
python scripts/brand/generate.py
```

Every published file is linked individually. Keep all generated `/brand/*` paths
in `lib/domains/sharedPublicAssetPaths.ts` when adding/removing a file. The ZIP is
only a convenience; downloads never require it.

## Page content

Downloads lead, followed by illustrated spacing, minimum sizes, regular geometry,
bad-use examples, color roles with real clipboard feedback, practical font samples,
approved short/paragraph text and slide/social/partner examples. The robot section
includes a rotatable view, five illustrated poses and instructions for making
new poses. The standalone SVG and PNG are exported from the homepage component.
The GLB contains the working pose with separate named meshes for the head, torso,
feet, arms and pen. Import it in Blender with File → Import → glTF 2.0.

The viewer and GLB use the Robot Studio mascot from revision
`4cab1389a4e3835dbc711da69634689fbc50e860`. To regenerate the pose geometry and
GLB from a checkout of the approved source, run:

```sh
node scripts/brand/export-robot-model.mjs /path/to/robot-studio/dist
```

The torso edge is 61.8% of the head edge. Each foot is 44% of the torso edge.
The feet sit diagonally with a gap between them. No current verified engine UI screenshot
was available in the repository; it is not replaced with a fabricated mockup. BookEditor and
MockedChat demonstrations are removed only from this page, not from the product.
The source files remain untouched. Do not manufacture an engine screenshot from
a mockup; product screenshots must be actual current captures.

## Verification

Focused Vitest coverage checks the real download targets, localization, transparent
PNG dimensions, true vector logo contents and the projection's 60° geometry.
Middleware tests verify both explicit languages, query-preserving private aliases
and independent branded domains. Run the relevant launch/metadata/domain tests,
lint, production build and then TypeScript. Inspect the deployed desktop/mobile
pages, language navigation, downloads and clipboard feedback; never submit test leads.
