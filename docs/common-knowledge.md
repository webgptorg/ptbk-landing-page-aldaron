# Common knowledge publication

`/book` is the public, English-source catalogue of reusable Promptbook knowledge. It belongs to the primary Promptbook domain and is separate from localized marketing routes. The first topic is external-action impact. The index and readable topic are server-rendered; source endpoints need neither login nor JavaScript and return UTF-8 plain text with public CORS, a SHA-256 ETag and release identity.

- Latest: `https://ptbk.io/book/external-action-impact.book`.
- Immutable first release: `https://ptbk.io/book/external-action-impact/1.0.0.book`.
- Readable topic: `https://ptbk.io/book/external-action-impact`.

Canonical content lives in `knowledge/<topic>/<version>.book`. The small curated catalogue is `lib/common-knowledge/catalog.ts`; both raw URLs read the exact same released file. Runtime tracing includes these sources for serverless deployment. Unknown releases return 404 instead of falling back to latest. The latest response is revalidatable with a five-minute shared cache; immutable releases have one-year immutable caching. Files use the existing website build/deployment, without a separate publisher or an engine-release dependency.

## Publishing a revision

1. Preserve every previously released file unchanged. Add a new version file with its own release/date and immutable URL.
2. Append its release entry to that topic's catalogue and deliberately advance `currentVersion` when recommending it. Knowledge versions do not follow the engine package or project migration version.
3. For a new topic, add its catalogue entry and a small latest-source route beside the existing one. Topic reading, immutable-source lookup and metadata use the catalogue.
4. Run focused source, metadata, sitemap and domain-routing checks and the website build. Publish through this repository's existing `main` deployment.
5. Verify the public index, readable topic, latest/version byte identity, cache/version headers and missing-version 404. Previous immutable releases must remain unchanged.

The Book is a reference resource, not another agent service. Add its KNOWLEDGE link and a short application RULE to an existing project Adam without replacing local instructions. Users can pin, replace/remove, inline or fork it. The engine's separate specification defines inherited use, cached/offline resolution, project Adam -> internal Expert -> Teacher composition and durable evaluation provenance. This website publication does not implement those engine changes or silently modify existing projects.

Improved paid knowledge is a possible future extension, not a currently sold entitlement. No billing, login wall or premium endpoint is introduced by this publication.
