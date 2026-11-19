# Live Promptbook releases

GitHub Releases in `webgptorg/promptbook` is the authority for current versions,
prerelease flags, notes and downloadable assets. Both `/cs/open-source` and
`/en/open-source`, plus both `/releases` pages, read `getReleaseCatalog()`.
They render dynamically rather than freezing imported JSON into their HTML.
The English installation route is separate from the static marketing catch-all.

`lib/releases/live.ts` uses Next's shared persistent data cache, revalidating after
300 seconds on access. The first request after expiry may serve the last successful
result while the cache refreshes; subsequent requests see the new release. A new
website deployment, scheduled Action, database migration or npm registry request is
not required. The complete paginated GitHub list includes prereleases, unlike
GitHub's `/releases/latest` endpoint. Requests have a shared 15-second deadline.
Public reads work without a token; an existing server-only `GITHUB_TOKEN` or
`GH_TOKEN` can provide a higher GitHub rate limit. Never expose it to the client.

A failed or partial read never replaces the cache with empty data. A cold-start
failure uses `catalog.json` outside the cache, allowing the next read to recover.
A failed background refresh retains the last successful cache entry. After ten
minutes without success, the pages identify the data as last known and link to
GitHub. The existing six-hour Action and `scripts/releases/sync.ts` now share the
GitHub-only resolver and only maintain this committed outage fallback. Its failure
cannot freeze the live website again. GitHub Actions bot pushes are not required
for live updates and are not assumed to trigger Vercel deployments.

CLI versions advance on publication to GitHub, including releases whose installer
builds are still running. Windows, Apple Silicon and Intel installers each select
the newest available uploaded nonempty file plus its `.sha256` in the same
channel. Each download shows its own version and matching checksum; an older
available installer is clearly identified. Later uploads to an existing release
are picked up on cache refresh. Signed DMG names take precedence over unsigned
previews. Missing files fall back to the GitHub release page. Do not fabricate URLs.

Historical publication/listing dates and explicit support extensions remain in the
snapshot. Records absent from GitHub are no longer installable. Previously linked
GitHub releases that are withdrawn/drafted leave current release-line summaries;
legacy npm-only lines remain historical references. Numeric prerelease ordering,
stable/preview separation and the existing 90-day support policy are retained.
New runtime observations are not used as contractual support start dates.

Verification covers multi-page reads, upstream failures and recovery, malformed
feeds, draft/withdrawn releases, delayed/empty/checksum-less assets, channel
isolation, history preservation, both localized command/download labels, and
incoming live data in both release pages. To refresh the fallback explicitly:

```sh
node --import tsx scripts/releases/sync.ts
```
