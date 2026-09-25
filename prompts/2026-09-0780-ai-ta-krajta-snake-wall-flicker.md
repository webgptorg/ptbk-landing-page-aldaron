[ ] !

[✨🐍] Remove flickering and wobbling when the AI ta Krajta snake hits a wall or corner

- On the AI ta Krajta website, clicking the snake logo activates the existing snake minigame.
- The reported bug is localized to boundary contact: the snake is otherwise drawn smoothly, but a wall/corner bounce makes part of its body line visibly flicker, vibrate or wobble. Fix that discontinuity without redesigning the game.
- Reproduce the behavior in the current game before deciding on the cause.
    - Test all walls and corners, repeated rebounds and holding the pointer near or beyond a boundary. Include both short and grown snakes.
    - Inspect both simulation and drawing; do not assume from the symptom that it is only a CSS effect or only the collision calculation.
    - Start with `businesses/ai-ta-krajta/AiTaKrajtaSnakeGame.tsx`, `aiTaKrajtaSnakeSimulation.ts` and `aiTaKrajtaSnakeBody.ts`.
    - In particular, inspect the relationship between `reflectCoordinate`/`reflectOffWalls`, remembered trail points, `getSnakeSegments` and the per-slice canvas strokes around a rebound. These are investigation entry points, not a predeclared root cause.
- The snake must remain visually continuous through boundary interactions.
    - No rapidly alternating body orientation, flashing seams, temporary spikes, disconnected segments or jumps in apparent thickness at a wall/corner.
    - A rebound may change movement direction as designed, but must not cause visible rendering instability over subsequent frames.
    - Handle simultaneous horizontal/vertical contact and a pointer that keeps requesting motion outside the field without getting stuck in an oscillation.
    - Keep positions finite and within the intended playing area. Do not solve the symptom by teleporting, hiding, resetting, fading out or clipping away the snake at the boundary.
- Preserve existing gameplay, steering, wall-bounce behavior, growth, food, score, responsiveness and the logo activation interaction. Do not replace rebounds with wraparound or game-over behavior.
- Keep animation stable with different canvas sizes, device pixel ratios and irregular frame timings, including resize and returning from a background tab. Do not add unnecessary frame loops or make the whole page re-render every frame.
- This is separate from the lower-priority logo-to-game visual matching task in `2026-09-0790-ai-ta-krajta-snake-logo-handoff.md`. Fixing wall flicker must not require redesigning the logo or completing that polish task first.
- Acceptance criteria:
    - Add deterministic regression coverage for the reproduced boundary sequence in the existing simulation/body tests; include every corner and repeated near-wall steering.
    - Verify the actual rendered game in the browser, including a recording or frame sequence through rebounds. A test asserting only that the head stays in bounds is insufficient to verify a visual flicker fix.
    - Confirm ordinary movement, controls, growth and score remain unchanged and that a longer play session does not accumulate instability.
- You are working with `https://ai-ta-krajta.cz/` and its internal `/ai-ta-krajta` page.
- Keep in mind the DRY _(don't repeat yourself)_ principle. Keep simulation and shared snake geometry reusable; do not add a separate boundary-only snake renderer.
- Do an analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](../changelog/_current-preversion.md).
