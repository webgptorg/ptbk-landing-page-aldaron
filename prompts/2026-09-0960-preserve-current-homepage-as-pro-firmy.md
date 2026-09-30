[ ]

[✨🏢] Preserve the current company-data homepage as `/pro-firmy`

- The current Czech homepage at `/cs` is a focused B2B landing page for Promptbook as a company-data / knowledge product ("Česká AI platforma pro firemní data", company documents, virtual employee, GDPR, strategic call). Before the root homepage is repositioned, preserve this existing proposition as a dedicated page.
- Create a Czech route `/cs/pro-firmy` that preserves the current `/cs` homepage experience and content as it exists immediately before this task is implemented.
- The page must remain a real first-class landing page, not a redirect back to `/cs`.
- Preserve the current page structure and conversion flow, including:
    - header and strategic-call CTA,
    - hero and animated assistant conversation,
    - social proof / industries,
    - pain points,
    - solution,
    - how-it-works,
    - comparison / enemy section,
    - testimonials and metrics,
    - team,
    - final CTA,
    - qualification popup,
    - booking notification,
    - footer and all existing legal/navigation behavior.
- Preserve the existing visual design and responsive behavior. This task is about relocating the current proposition, not redesigning or rewriting it.
- Do not duplicate a large frozen copy of the implementation if the same sections/components can be shared cleanly. Extract or parameterize page composition/content where useful so the subsequent homepage redesign can diverge without breaking `/cs/pro-firmy`.
- Give `/cs/pro-firmy` its own metadata, canonical URL, Open Graph/social preview behavior, sitemap entry and other SEO metadata appropriate to the existing company-data proposition. Its canonical URL must not claim to be `/cs`.
- Existing analytics, lead submission, qualification and booking behavior must continue to work from the new route.
- Existing inbound links and application routes other than the homepage must not be broken.
- This task does **not** redesign `/cs`; it only establishes the preserved destination that the following homepage-repositioning task can safely replace.
- English:
    - Do not invent an English `/en/pro-firmy` slug.
    - Preserve current `/en` behavior in this task. The new global homepage task will decide how the English root is repositioned.
- Relevant current entry points include `app/cs/page.tsx`, `app/en/page.tsx`, `businesses/homepage/_Homepage.tsx`, `businesses/homepage/homepageContent.tsx`, and `businesses/homepage/homepageMetadata.ts`. Inspect the actual repository before deciding what should be shared, moved, or renamed.
- Acceptance criteria:
    - Opening `/cs/pro-firmy` shows the current Czech company-data landing page with the same user-visible proposition and working conversion flow.
    - `/cs/pro-firmy` has correct route-specific metadata/canonical/social preview and is discoverable in the sitemap as appropriate.
    - The existing `/cs` page still works after this task by itself; no new agenda-based homepage is implemented yet.
    - Existing homepage interactions and relevant automated tests remain green.
    - Mobile and desktop rendering are checked.
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do an analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](../changelog/_current-preversion.md).
