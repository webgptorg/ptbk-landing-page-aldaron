[ ]

[✨🃏] Show material link previews by default and flip a preview card to reveal its existing QR code

- Improve the materials shown to workshop participants, primarily `/cs/online-workshop/participant?workshop=...`, and shared room surfaces using the same material rendering.
- Today, `businesses/online-workshop/participant/WorkshopContent.tsx` renders material Markdown and a QR code for each link. A material with many links creates a wall of QR codes with no destination previews.
- Replace the always-visible QR area with link preview cards, similar in information hierarchy to a social sharing preview.
    - Default/front face: preview image when available, title, concise description when useful, and the destination's domain. Do not generate filler text.
    - A material with multiple links gets a corresponding preview for each link currently represented by the material link/QR mechanism.
    - Keep the material's Markdown, explicit links and existing primary open action usable. This is not a rewrite of material content into a different storage format.
    - Missing metadata or a broken image produces a clean title/domain/link fallback, not a broken card or a blocked material.
- Each preview card has a small, discoverable QR icon button in its upper-right corner.
    - Clicking the button flips that card to a back face containing the QR code and enough title/domain context to identify the destination.
    - Provide an equally clear way to flip back to the preview. The QR button must not also open the destination link.
    - Keep at most one material QR face open at a time within the material list, so a phone is not presented with several competing codes. Opening another QR returns the previous card to its preview.
    - Use stable card dimensions and a subtle flip; honor reduced motion with an immediate face change. Do not cause the materials list to jump or scroll unexpectedly.
    - Support keyboard and touch, visible focus and accessible show/hide labels. The hidden face must not expose duplicate focusable controls to assistive technology.
    - The QR must remain large, high-contrast and unobstructed enough to scan. Keep a readable destination/open action on its back.
- IMPORTANT: preserve QR and short-link semantics exactly.
    - Reuse `PromptbookQrCode` and the existing link extraction/shortening pipeline in `lib/workshops/workshopMaterialLinks.ts`.
    - The QR value must be the same persisted tracked short URL that the current material QR would encode, not a scraped canonical URL or a newly generated short link.
    - Opening the material must keep the existing destination, attribution and click tracking. Merely loading a preview or flipping a card must not count as a click or generate another short link.
    - Resolve a stored short link to its destination through a read-only server lookup for metadata; do not fetch it through the public tracked redirect endpoint and manufacture click history.
- IMPORTANT: preview scraping already exists. Reuse `lib/network/publicWebPagePreview.ts` and existing preview consumers/components where appropriate.
    - Do not implement another Open Graph parser, title scraper or independent metadata service. Share this layer with `2026-09-0750-workshop-quick-link-materials.md`.
    - Fetch metadata independently of critical room updates, with caching, bounded work and fallback states. Do not scrape every visible URL again on each room poll or participant render.
    - Reuse server-side public-URL restrictions, redirect validation, timeouts and response-size limits. Render external metadata as untrusted text, never raw HTML.
    - Metadata must obey material visibility: do not fetch or expose previews, destination URLs or images for unpublished, still-locked or inaccessible paid content. A title-only paid offer must remain title-only.
    - Scope any new preview endpoint to content the participant is authorized to read rather than exposing an unrestricted fetching proxy.
- Preserve card state across unrelated room refreshes through stable material/link identities. Reset or discard stale preview/QR state when the room, link or material actually changes or disappears.
- Reuse the shared material card so presentations and other compatible special materials gain consistent rendering where applicable. Keep special widgets with their own behavior intact; admin preview reuse is optional, not the primary goal.
- Acceptance criteria:
    - Cover materials with no links, one link and several links, including unavailable metadata and failed images.
    - All cards start preview-side up; flipping one reveals the correct scannable QR, flipping back works, and opening another QR hides the previous one.
    - Assert that QR values and tracked hrefs are unchanged and that preview requests/flips do not increment click counts.
    - Test live material edits/removal, mobile layouts, keyboard interaction and reduced motion.
    - Verify locked and paid-only content does not leak through preview payloads or image requests.
- Keep in mind the DRY _(don't repeat yourself)_ principle. This is primarily a presentation change built from existing pieces, not a replacement QR or scraping system.
- Do an analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](../changelog/_current-preversion.md).
