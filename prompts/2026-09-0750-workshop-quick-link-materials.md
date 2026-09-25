[x] by Developer on OpenAI Codex `gpt-6-sol` thinking `max` (ChatGPT account) - Implementation ~$0.4680 26 minutes; Testing 18 minutes

[✨🔗] Add workshop link materials quickly, including multiple URLs and automatically fetched titles

- In workshop material administration, offer two clear entry points: `Přidat materiál` for the existing full Markdown editor and `Přidat odkaz` for fast URL sharing.
- The fast path creates the SAME ordinary workshop material records as the full editor, not a parallel link collection or a new incompatible material type.
    - For one URL, pasting a valid link and explicitly confirming creation should be sufficient; do not require writing a title or description.
    - Support multiple URLs in the same dialog, one per line. Create one material per URL, in the input order, rather than a single material containing the whole batch.
    - Ignore empty lines, validate each entry and show the number of materials to be added. Clearly identify invalid entries instead of silently dropping them.
    - Deduplicate repeated identical URLs within a batch without silently removing meaningful query parameters or fragments. If a destination is already among the workshop's materials, warn rather than silently overwriting that material.
- Fetch a useful page title before creating each material.
    - IMPORTANT: title and preview scraping already exists. Reuse `scrapePublicWebPagePreview` in `lib/network/publicWebPagePreview.ts` and its URL validation/metadata fallback behavior. Do not write another scraper, HTML parser or metadata service.
    - Existing consumers include `lib/community-projects/communityProjectPreview.ts` and `lib/workshops/workshopEventCardDetails.ts`; inspect and reuse the shared layer, not a copy of their logic.
    - Use the scraped title as the material title and a normal Markdown link as its content. Escape metadata safely for Markdown; do not copy untrusted HTML or generate unnecessary promotional text.
    - Allow an optional title correction, but do not make a second rich-editing step mandatory. Full editing remains available after creation.
    - Missing metadata, a timeout or an unreachable public page must have a clear hostname/URL fallback so useful links can still be added. Invalid URLs and disallowed scrape targets must not bypass the shared safety checks.
    - Keep the submitted destination, including meaningful query/fragment information, as the actual material link. A scraper's normalized/canonical URL must not silently replace it.
- Keep the interaction fast and predictable.
    - Show per-link metadata/loading/fallback states. Use bounded concurrency and a bounded batch size; one slow page must not hold the whole dialog indefinitely.
    - Ignore stale metadata results if a URL is changed, removed or the dialog is closed. A late result must not overwrite an edited title or create a material by itself.
    - Scraping and editing the draft do not persist materials. Creation is explicit, consistent with `2026-09-0740-admin-autosave-ui-consistency.md`.
    - Display the inherited publication, unlock-time and access defaults. Reuse the full editor's current defaults rather than accidentally exposing paid or not-yet-unlocked content.
    - Append materials after the existing ordinary materials using their actual order, not merely the current list length. Integrate with `2026-09-0760-workshop-material-drag-and-drop-order.md`.
    - Prevent double submission. If saving partially fails, report per-item results, retain failed entries and retry only those; successfully created materials must not be duplicated by a retry.
- Reuse the existing material creation path, including short links, click tracking, room ownership, authorization and live participant refresh.
    - Start with `businesses/workshop-admin/WorkshopContentAdmin.tsx`, `WorkshopContentEditor.tsx`, `workshopAdminApiClient.ts`, `lib/workshops/workshopContentCreation.ts` and `workshopMaterialLinks.ts`.
    - Do not construct participant-specific tracking or a second shortening flow in the new dialog.
    - Keep metadata fetching server-side with the existing restrictions on private/internal addresses, redirects, response sizes and timeouts. Do not turn the feature into an unrestricted public fetching proxy.
- Acceptance criteria:
    - A single pasted URL becomes a normally editable material with a useful title and working tracked link.
    - A batch produces separate materials in the intended order; blanks, repeated URLs, invalid input, missing metadata and slow pages behave as specified.
    - Closing before confirmation creates nothing. Double clicks, partial failures and retries do not create accidental duplicates.
    - New materials obey the same publication, timing, access and realtime rules as manually written materials.
    - Tests verify use of the existing scraper and creation helpers rather than duplicated implementations.
- You are working with `/admin/workshops?tab=content` and the shared material administration where applicable.
- Keep in mind the DRY _(don't repeat yourself)_ principle, especially for scraping titles, creating materials and generating short links.
- Do an analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](../changelog/_current-preversion.md).

