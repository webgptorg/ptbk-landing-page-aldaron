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


---

[ ]

[✨🔗] Keep quick-link material content as exactly the original pasted URL

- Follow-up to the implemented quick-link material feature in THIS file. Title scraping and creation of one material per pasted URL already work according to the owner. Make only the small content-generation correction below; do not reimplement that feature.
- Keep the scraped page title as the material's title, including the current useful fallback/title-edit behavior.
- The material body supplied to the existing material-creation pipeline must contain ONLY the original URL entered for that material.
    - No repeated title, Markdown link `[title](url)`, angle-bracket autolink `<url>`, list marker, code fence, explanatory sentence or generated preview markup.
    - Trim only surrounding whitespace used to separate input lines. Preserve the URL's path, meaningful query string, percent encoding and fragment; do not replace it with a scraper redirect target or canonical URL.
    - For multiple input links, produce one material per accepted URL in the existing order; each body contains only its own original URL.
- This intentionally supersedes the earlier requirement in this file to generate a normal Markdown link as content. Preserve the previous prompt's completed status and history; append this as a new independently tracked section rather than rewriting the original specification.
- Example: after a page at `https://example.com/article?ref=workshop#demo` yields the title `Example article`, the title is `Example article` and the complete generated body is the literal string `https://example.com/article?ref=workshop#demo`.
- Let the existing downstream link extraction, short-link/tracking, preview and QR components handle presentation. Do not add a second linkification/scraping pass, disable tracking, or turn existing branded preview cards back into plain text.
    - Verify where raw body generation ends and existing link processing begins. Test exact original-URL equality at that generation boundary; do not bypass the established downstream pipeline merely to force equality after it has intentionally transformed a link.
    - Ensure bare URLs enter that shared pipeline correctly. Correct a genuine plain-URL handling gap in the shared helper if necessary, rather than wrapping the URL in new Markdown to work around it.
- No automatic rewrite of previously created or manually edited materials is requested.
- Acceptance criteria:
    - A single URL creates the expected scraped title and a raw body equal to the trimmed original URL, with no Markdown wrapper or duplicate title.
    - Two distinct URLs produce two materials with their own scraped titles and original-URL bodies. Include query strings/fragments and characters that previously required Markdown escaping.
    - Metadata failure still uses the existing title fallback while retaining the original URL. Existing tracking, previews and QR behavior work with the resulting material.
    - Full/manual material editing and old material content remain unchanged.
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do an analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](../changelog/_current-preversion.md).
