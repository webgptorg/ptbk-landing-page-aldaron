# Homepage agenda positioning

## Analysis before implementation

The preservation change moved the previous homepage into `businesses/pro-firmy`. Both `/cs` and `/en` were rendering
`ProFirmyPage` directly, and `businesses/homepage` contained only the old homepage metadata. There was no independent
homepage section model left to update. The company page's document chat, pain points, product comparison, metrics,
booking notifications and qualification questions belong to the preserved proposition.

The shared header can accept navigation, language links and a primary action without replacing its default copy.
Its primary button emits `open-qualification-popup`. The footer has configurable product links and uses the shared
contact API for its newsletter. `TeamSection` has existing portraits and contacts. The original qualification
popup writes to `/api/waitlist` with `placeName: qualification-popup` and navigates by a full page load to `/dekujeme`.
The old confirmation talks about company data and is Czech only. Homepage SEO, root fallback artwork and site-wide
structured data still described company knowledge rather than ongoing responsibilities.

## Implementation boundaries

`Homepage` owns a new server-rendered composition and bilingual content: outcome, explicit one-shot/ongoing comparison,
agenda anatomy, selectable examples, then technical leverage. Text and diagrams stay readable without reveal
animations. Examples are labelled illustrations rather than live product activity; accounting review and filing
remain with an expert, and external access/tools are configured for the particular agenda.

The enquiry captures a responsibility, project and contact details through the existing API and source. A JSON note
identifies the agenda proposition and language for qualification. A synchronous pending guard prevents duplicate
requests; errors keep the draft available. The existing full-load confirmation route accepts `source=agenda` and
`language=cs|en` for the new localized follow-up. Requests without that source retain the company-page confirmation.
The contact-source name, endpoint, database schema and admin exports have not changed.

The header/footer overrides and optional compact team layout leave the company-page defaults intact. The homepage
links directly to `/cs/pro-firmy`; root `Accept-Language` routing and the legacy `/pro-firmy` redirect are unchanged.
The homepage WebPage schema uses the same page definition as its metadata. Site-wide Organization/WebSite descriptions,
manifest, root fallback image and both localized sharing images now use agenda positioning. Sharing artwork uses the
shared local-font PNG renderer with design version 3.

## Integration evidence

The installed `ptbk` version is `0.114.0-41` (lockfile resolved), not a proposed integration list. Named homepage tools
are scoped explicitly to **Promptbook Coder**, not guaranteed arbitrary integrations for all example agendas:

- `package.json` configures `coder:run` with `--harness claude-code` and `coder:run:openai` with `--harness openai-codex`.
- `node_modules/@promptbook/cli/src/book-3.0/cliAgentEnv.ts` and
  `src/cli/cli-commands/common/promptRunnerCliOptions.ts` register `openai-codex`, `claude-code` and `opencode`.
- `node_modules/@promptbook/cli/umd/index.umd.js` dispatches these to `OpenAiCodexRunner`, `ClaudeCodeRunner` and
  `OpencodeRunner` in its runner resolver (around lines 28355–28375 in this installed version).
- The installed `node_modules/ptbk/README.md`, “Promptbook Coder / Features”, documents those runners, unattended
  and interactive execution, context injection and Git review/history workflows.

This verifies availability in the installed product. It does not assert that each vendor is authenticated in this
deployment, that every model is supported, or that the illustrative administrative workflows are turnkey services.

## Verification

The homepage browser suite covers both languages, switching examples, real API lead capture and localized confirmation,
failure/retry behavior, pending controls, CTA focus restoration, narrow layouts and preservation of root/company routes.
Metadata tests cover canonical/hreflang/social/schema consistency and the independent company-data page. Sharing tests
load the real PNGs and check their dimensions and public metadata. Manual screenshots are reviewed separately at
representative desktop and mobile widths.

Completed checks:

- `npm test`: all 297 files / 2,074 tests passed. The existing recording cleanup test required an explicitly aged
  superseded fixture; no migration or production retention behavior changed.
- `npm run test-types`: production build and TypeScript passed. A final `tsc --noEmit` also passed after review.
- `npm run lint`: passed with the existing preview-image and recording-studio warnings.
- Focused Playwright run: all 24 cases completed successfully (23 first-attempt passes and the existing participant-room
  metadata case passing on its configured fresh-context retry after an initial no-room 404). Homepage cases, both
  real enquiry submissions, the company-page qualification flow and newsletter all passed on their first attempts.
  The test server used isolated in-memory contacts and no production database credentials.
- Reviewed Czech and English hero, comparison, model, examples, technology, team, contact and dialog screenshots at
  1440×1000 and 390×844. The responsive tests also checked 320px and 768px without relying on hidden overflow.
  Reviewed both real 1200×630 sharing cards and the localized mobile confirmation. Review artifacts are in the ignored
  `.tmp/homepage-review` folder; logs are in `.tmp/homepage-{unit-tests,types,lint,e2e-final}.log`.

### Verification retry: preserved booking notice

The full verification found a cookie-clearance test still visiting `/cs` to wait for the old delayed booking notice.
The agenda homepage intentionally omits that company-page component, so the assertion timed out. The test now uses
the shared `PRO_FIRMY_PATH` for the preserved page, and the cookie viewport matrix includes that route. Both localized
homepage tests advance the browser clock past the notice's delay and assert that no booking notice appears. Production
components and the preserved company-data content do not need to change for this correction.

- Focused cookie/homepage browser run: all 23 tests passed, including real lead capture in both languages.
- Relevant homepage, company-page, metadata and short-link metadata unit tests: all 46 tests passed in 6 files.
- `npm run test-for-ptbk-coder`: passed with exit code 0. Lint, production build, TypeScript, the complete browser
  suite (153 passed, 2 skipped) and test-data cleanup completed. No browser case needed a retry in the final run.
  An earlier run was interrupted after the Mac ran out of disk space and Next cached a failed compilation;
  removing generated build output and inactive build caches allowed a fresh run without changing application code.
  The successful log is `.tmp/homepage-verification-final.log`.
- Fresh Czech and English screenshots were manually reviewed at 1440×1000 and 390×844, including the hero,
  comparison, agenda examples, technology and enquiry form, together with both real 1200×630 sharing cards.
  These additional review artifacts are in `.tmp/homepage-verification-review`.
