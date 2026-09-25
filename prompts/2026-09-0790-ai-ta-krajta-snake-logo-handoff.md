[ ]

[✨🎨] Make the snake emerge from the existing logo without even a small visual shape change

- Priority: LOW. This is visual polish, below functional fixes such as the wall/corner flicker in `2026-09-0780-ai-ta-krajta-snake-wall-flicker.md`. Keep it a separate task.
- Clicking the AI ta Krajta logo already starts a snake game, but the owner can still see a slight mismatch between the static logo snake and the snake at the beginning of the game.
- The existing STATIC LOGO is the visual source of truth. It is the brand's snake; the game must start from it, not the other way around.
    - Do not redraw or simplify the logo to match the current game renderer.
    - Do not substitute an approximately similar snake, a new brand asset or a generic uniform-width game snake.
    - Preserve its exact silhouette, pose, curves, head and tail, thickness/taper, colors, scale, position and rotation through the handoff.
- The final idle frame, first game frame and initial release into movement must look like one continuous object.
    - There must be no visible jump, tiny morph, color flash, double image, blank frame or apparent resize when rendering ownership changes.
    - The snake should move out of the logo's existing pose. Do not first interpolate the still logo into a slightly different stationary snake and only then begin the game.
    - A later bend caused by actual movement, growth or existing gameplay is fine; an unrelated correction of the initial shape is not.
    - A longer hold, crossfade or overlaid still logo that merely delays or conceals the eventual mismatch is not a fix. Verify the whole release, not only the first canvas draw.
- Analyze the existing shared artwork and handoff before changing anything.
    - Start with `businesses/ai-ta-krajta/AiTaKrajtaSnakeTerrarium.tsx`, `AiTaKrajtaSnakeGame.tsx`, `AiTaKrajtaMark.tsx`, `aiTaKrajtaMarkArtwork.ts`, `aiTaKrajtaMarkCanvas.ts`, `aiTaKrajtaSnakeLogoPose.ts` and `aiTaKrajtaSnakeBody.ts`.
    - The current game already draws the mark and has hold/release timing. Existing comments describing an exact handoff do not replace checking the reported visual mismatch.
    - Reuse the canonical artwork, coordinate transforms and body measurements. Do not maintain separate hand-tuned SVG, canvas and game approximations of the initial snake.
    - Check coordinate origins, aspect ratio, stroke geometry, scaling, device-pixel-ratio conversion and the first moving frames, not just the static asset.
- Preserve click/touch/keyboard activation, the rest of the page, score, steering, food and game performance. Avoid regressions in the separate wall-flicker fix and do not change unrelated podcast branding.
- Acceptance criteria:
    - Capture the last static frame, first game frame and several frames across the initial release at identical viewport and pixel-ratio settings.
    - Use aligned overlay/image-difference checks and visual inspection against the existing static logo, allowing only genuine rasterization noise, not a different silhouette or pose.
    - Verify desktop/mobile sizes, common device pixel ratios and repeated activation/restart where supported. Resizing must not introduce a new handoff jump.
    - Confirm movement starts naturally from the original pose without an intermediate corrective morph or hidden switch to a different snake.
- You are working with `https://ai-ta-krajta.cz/` and its internal `/ai-ta-krajta` page.
- Keep in mind the DRY _(don't repeat yourself)_ principle. Keep the existing artwork as the single source of truth.
- Do an analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](../changelog/_current-preversion.md).
