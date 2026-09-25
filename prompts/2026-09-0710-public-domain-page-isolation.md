[ ]

[✨🧱] Keep the public domains isolated and show the correct site's 404 instead of falling through to Promptbook

- Keep one repository, one build and one Vercel deployment, but make the public experience behave like three independent websites: Promptbook, AI ta Krajta and Pavol Hejny's personal site with Czech and English domains.
- The current configured production domains are `ptbk.io`, `ai-ta-krajta.cz`, `pavolhejny.cz` and `pavolhejny.com`, including their existing `www.` aliases. Use the actual domain configuration, not phonetic spellings from the feature discussion. Do not introduce or provision additional domains.
- Follow up on `prompts/2026-09-0660-domains.md`.
    - Start with `middleware.ts`, `middleware.test.ts` and `lib/domains/publicDomainRouting.ts`.
    - The middleware currently redirects unmatched branded-domain page paths to `PRIMARY_SITE_URL`. It also considers legacy branded redirects before deciding which pages belong to the requested domain. These behaviors must not allow a request on one branded site to escape into another site's pages.
- A domain may render only its own public pages.
    - An unknown path on `ai-ta-krajta.cz` must show an AI ta Krajta not-found page, with an actual HTTP 404 response, while keeping that domain and requested path in the address bar.
    - This applies equally to a completely nonexistent path and a path which exists only on `ptbk.io`, such as `/cs`, `/cs/online-workshop` or `/cs/komunita`.
    - Apply the same isolation to both personal domains. A foreign legacy path such as `/cs/pavol` on the podcast domain must not automatically redirect to the personal site.
    - Do not redirect these requests to Promptbook, silently render a Promptbook page, return a successful 200 error page, or replace every unknown path with the site's homepage.
    - The 404 must use the requested site's branding, language, navigation and home link, without a flash of Promptbook content.
- Preserve the intentional legacy redirects from the PRIMARY site.
    - `ptbk.io/ai-ta-krajta` redirects permanently to `https://ai-ta-krajta.cz/`; its legacy children retain their suffixes, including `/media-kit` and `/branding`.
    - `ptbk.io/cs/pavol` redirects permanently to `https://pavolhejny.cz/`, and `ptbk.io/en/pavol` to `https://pavolhejny.com/`.
    - Preserve the existing `/pavol` language-selection entry point and query parameters. Avoid redirect loops.
    - An unknown legacy podcast child may reach the corresponding podcast-domain path, but must then receive that site's 404 rather than returning to Promptbook.
- Keep explicit cross-site links working. Audit relevant headers, footers, personal language links, community links and legal links; links to another website must point to its canonical absolute URL, not rely on the removed fallback redirect. Reuse `createPublicUrl` and the shared domain mapping.
- This is page isolation, not a separation into new deployments or a replacement for authorization.
    - Preserve shared Next.js assets, fonts, images and the APIs actually used by each site, including contact submission.
    - Keep podcast logos, manifest and metadata routes working on their public domain, and keep the personal sites' metadata working too.
    - Do not use a broad file-extension exception as a way for arbitrary page paths or the shared short-link catch-all to bypass domain isolation. Unknown file-looking page paths must not expose another site's page.
    - Preserve authentication on administrative APIs. Unrelated administrative pages on branded domains must not be rendered as part of those sites.
    - Keep existing local-development and preview-host workflows usable.
- Acceptance criteria:
    - Test each configured domain and its `www.` alias with a valid own page, an unknown page, a Promptbook-only page and another brand's internal path.
    - Assert HTTP status, absence of an unwanted redirect, unchanged browser URL and correct branded 404 content, not just middleware helper return values.
    - Test valid legacy redirects, query strings, trailing slashes, required shared assets/APIs and explicit cross-site navigation.
    - Ordinary Promptbook routes continue to work on `ptbk.io`.
- Keep in mind the DRY _(don't repeat yourself)_ principle. Keep ownership and canonical-domain rules in one shared place.
- Do an analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](../changelog/_current-preversion.md).
