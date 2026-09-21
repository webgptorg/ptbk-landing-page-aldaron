# AI ta Krajta portraits

The page uses the 25 transparent, 320 × 320 PNGs in `public/people/ai-ta-krajta/`.
Every file contains the person only. `AiTaKrajtaPersonAvatar` supplies the neutral gradient,
circular clipping, and hover/focus treatment for both the 96-pixel cards and 34-pixel episode credits.
The background variation is stable by person ID, independent of roster ordering.

## Sources

The original files in `public/people/` remain available for other pages. The JPEGs below
were prepared by `scripts/_cutAiTaKrajtaPeoplePortraits.mjs`, which records the original
publisher URLs, episode credits, and crop coordinates. Running that script refreshes
source crops; it does **not** replace the normalized PNGs.

| Person | Source in `public/people/` |
| --- | --- |
| Pavol Hejný | `pavol-hejny-transparent-square.png` |
| Jiří Jahn | `jiri-jahn-transparent-square.png` |
| Petr Glaser | `petr-glaser.jpg` |
| Patrik Braborec | `patrik-braborec.jpg` |
| Jacek Soubusta | `jacek-soubusta.jpg` |
| Šimon Podhajský | `simon-podhajsky.jpg` |
| Roman Baranovič | `roman-baranovic.jpg` |
| Katka Fajmanová | `katka-fajmanova.jpg` |
| Prokop Simek | `prokop-simek.jpg` |
| Matyáš Křeček | `matyas-krecek.jpg` |
| Tomáš Koblížek | `tomas-koblizek.jpg` |
| Adam Zvada | `adam-zvada.jpg` |
| Lukáš Caha | `lukas-caha.jpg` |
| Richard Mládek | `richard-mladek.jpg` |
| Dalibor Krejčí | `dalibor-krejci.jpg` |
| Petr Brzek | `petr-brzek.jpg` |
| Tomáš Kroupa | `tomas-kroupa.jpg` |
| Ondřej Sukač | `ondrej-sukac.jpg` |
| Tomáš Mikolov | `tomas-mikolov.jpg` |
| Jan Cienciala | `jan-cienciala.jpg` |
| Lenka Šefčáková | `lenka-sefcakova.jpg` |
| Pavel Ungr | `pavel-ungr.jpg` |
| Matouš Havlena | `matous-havlena.jpg` |
| Ondra | `ondra.jpg` |

Petr Šimeček's portrait comes from his [Datascript conference speaker profile](https://www.datascript.cz/it-konference/agentic-ai-2026-next-generation-ai-agent-engineering/),
using the [original photograph](https://www.datascript.cz/ir/storage/d5_DS-PrednaskySpeaker/79-image-File-PESI.png).
Its biography matches the guest of episode 6: time-series forecasting at Google,
Mediaboard, and Masaryk University. His GitHub avatar has balloons covering his face
and is not suitable for this portrait.

## Cutout workflow

Pavol and Jiří reuse the existing transparent originals. The other 23 portraits were
edited individually with the built-in imagegen tool. All cutouts are downscaled with
Sharp to 304 × 304 and padded with transparency (16 pixels above, 8 on each side) on
the 320-pixel canvas, keeping room above the hair even during the small hover zoom.
PNG export retains alpha and uses a palette at quality 95, effort 10, and compression
level 9 to keep the small avatars light to download.
No image-generation service runs in the page or at build time.

Prompt used for the cutouts (each supplied photo is the edit target):

> Use case: background-extraction. Asset type: podcast person's head-and-shoulders avatar.
> Edit the supplied photo: remove its entire background and any sliver of another person,
> keeping ONLY the central person. Real transparent PNG alpha, no backdrop, no checkerboard.
> Preserve the person's exact facial identity, proportions, expression, pose, gaze, skin
> texture, hair, beard, glasses, clothing and lighting; do not beautify or invent details.
> Square composition, centered head and shoulders extending to bottom edge, entire hair/head
> inside frame with about 5% transparent margin above, face around 40% of image height.
> Clean hair edges without background fringes or halos. No text, outline, new objects or
> drawn circle. One portrait only.

Petr Glaser and Patrik Braborec used this initial prompt:

> Use case: background-extraction. Asset type: existing podcast person's portrait for a
> small circular website avatar. EDIT TARGET: the supplied photograph. Remove only the
> background and any fragment of another person at the edge, producing a real transparent
> PNG with alpha. Keep THIS person's face, identity, facial proportions, expression, pose,
> hair, beard, ears, clothing and photographic texture unchanged. Do not redraw, beautify,
> relight or invent a new person. Keep the current square framing and scale: complete top
> of hair with a small 5 percent top margin, centered head and shoulders, shoulders extending
> to bottom edge. Clean natural hair edges, no visible coloured fringe, no halo. No background,
> gradient, white fill, checkerboard pattern, shadow, text, watermark or circle drawn into
> the image. Output a single square transparent PNG of exactly this same person.

Ondra's prompt adds this instruction because the source crops his forehead:

> Keep his actual receding hairline and balding head. Reframe enough to fit his entire head
> and both shoulders, with clear margin above the scalp; do not crop his forehead.

When updating a portrait, compare it with the source, inspect hair and glasses against
the page gradient, and check the actual circular avatar at both sizes. Keep complete
heads, similar face scale, and shoulders reaching the bottom. Do not bake the circle,
gradient, outline, or hover effect into the PNG. `aiTaKrajtaPeople.test.ts` checks every
roster entry for a real, uniformly sized PNG with transparent and opaque pixels.
