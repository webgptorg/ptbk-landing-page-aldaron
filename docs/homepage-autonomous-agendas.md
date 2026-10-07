# Autonomous-agenda homepage

The Czech and English homepages share `businesses/homepage/HomepagePage.tsx`. This implements the October 2026
benefit-led direction. The deferred September PRD and its history remain untouched.

## Existing behavior and the preservation boundary

Before this change, both localized roots rendered `ProFirmyPage`, with company-document metadata. That composition
and its words, shared section defaults, booking notification, CTA and default qualification dialog still belong to
`/cs/pro-firmy`. The homepage now supplies its own composition, copy, navigation and qualification presentation.
The full footer keeps its funding and legal information; optional footer copy and links do not change other callers.

The existing popup used company-page questions and a full-load `/dekujeme` conversion. A configurable presentation
now allows homepage-specific fields over the same `subscribeToWaitlist`, `/api/waitlist`, `qualification-popup` source
and `PersonalDataConsentNote`. It adds no contact store. The note identifies `autonomous-agendas` and the language.
Closed and failed drafts are retained; a synchronous submission guard and disabled fields protect pending requests.
Success uses `/dekujeme?flow=homepage&lang=cs|en`, retaining the conversion destination without contact identity in its
URL. The default company confirmation and popup remain unchanged.

No changes were made to root language selection, middleware, host isolation, branded root rewrites, whitepaper
content/components/styles/downloads or the company-page content/metadata. A homepage-only authored preview revision
extends the shared design version; other social image URLs and authored image priority remain intact.

## Source and content decisions

The local source is `prompts/2026-10-0000-whitepaper.md`, version 0.1, 2 October 2026:

- Chapters 1 and 7: continuing a useful responsibility, recognizing a later need, and waiting when no useful work is needed.
- Chapter 11: software care, customer communication and accounting supporting documents.
- Chapters 10 and 12: human remit, separate preparation/authorization/external action, and the distinction between
  current delivery, development and long-term ambition.

`homepageScenarios.ts` owns each localized burden, responsibility, benefit, human boundary and artifact/story state.
The interactive view and the complete native text reader consume these same definitions. These are fictional
illustrations, not customer evidence or a list of shipped integrations. No performance savings, deadlines, compliance
claims or named integrations are asserted. The optional localized whitepaper link supplies technical depth.

## Interaction and fallback

The reducer stores only selected scenario and step. Every scenario starts at its prepared outcome; replay returns to
the first input. Direct step buttons and previous/next controls are deterministic. Nothing executes, sends a message,
connects an external business service, or submits a contact while exploring a story.

There is deliberately no autoplay, task queue, timer or simulation clock. A 280 ms CSS artifact reveal is the only
motion. Replacing the artifact cancels a stale transition. Visibility and intersection gates remove that animation
when hidden/offscreen; reduced motion removes it and the perspective transforms entirely. The explanation stays.
Controls are disabled until hydration. The hero, first outcome, every scenario in the native disclosure, CTA anchor,
email contact and footer are server-rendered. A local error boundary isolates a failed story from that content.

## Verification

The focused checks are in `businesses/homepage/*.test.tsx` and `tests/e2e/homepage.spec.ts`, alongside the retained
company-flow, whitepaper, metadata/social and domain-isolation suites. Browser submissions use the real waitlist
endpoint with the isolated in-memory E2E store; the deliberately failed first request tests localized retry handling.
No production lead was sent.

Rendered review artifacts are in the ignored `.tmp/homepage-review/` directory. Both languages were inspected at
1440 px desktop, 375 px phone and 320 px narrow widths, including every scenario/step, dialog, keyboard and touch,
reduced motion, offscreen and frozen/active lifecycle return, JavaScript disabled and aborted client scripts.
All three retained pages were captured before and after at 1440 px with JavaScript disabled. Their main text and
metadata were identical. Both whitepapers were pixel-identical. The company page differed only in its existing
animated final-CTA grid/glow; its geometry was identical.

Initial warm development-server observations (not production benchmarks): DOMContentLoaded was approximately
128–198 ms; measured layout shift without recent input was 0–0.00051. Dev resource transfer was about 3.9 MB,
including framework/development and existing global resources. After a fresh dev-server start, the first Czech page
took about 5.2 s to DOMContentLoaded including its 4.2 s route compilation, and English about 1.0 s. Story browsing
issued no `/api/` or model requests.
Desktop story height is reserved across all states. Phone text can grow to remain readable; no horizontal overflow
was found at 375 or 320 px. This does not establish production Core Web Vitals or physical-device performance.

A broad preview run also encountered the unrelated participant-room card: the isolated store has no published
workshop, so its page returns 404. That preview and the unrelated community-project preview are excluded from the
focused final run; no existing test was deleted. The full application E2E suite and physical Safari/VoiceOver testing
are outside this verification run.


Final checks:

- `npm run test-types` passed: optimized production build followed by TypeScript. Homepage first-load JavaScript is
  approximately 170 kB per language in the build report (shared code included).
- `npm run lint` passed with six existing warnings in `public-web-page-preview-image.tsx` and recording-studio files;
  the focused changed-file lint check had no warnings or errors.
- 56 focused unit tests passed, covering stories/reducer/error boundary, metadata/cache revisions, footer defaults and
  public-domain routing.
- 41 distinct browser checks passed: 38 homepage/whitepaper/sharing/domain cases, then root routing/sitemap/anchors,
  the footer subscription and the preserved company qualification flow. Both homepage failure/retry/success cases
  were rerun successfully after the final CTA listener/fallback refinement.
- Both languages were also checked at 720 CSS pixels with a 2× pixel scale for zoom/reflow, including reaching the
  enquiry submit button, closing with Escape and restoring focus. No horizontal overflow was observed.
- The production runtime preview was attempted but could not start: existing production instrumentation requires
  `DATABASE_URL`, intentionally absent in this isolated check. That guard was not bypassed and no production database
  was used. Production runtime performance and field Core Web Vitals therefore remain unmeasured.

The complete component-render failure is tested at the React error boundary; the browser fallback checks separately
abort client scripts and disable JavaScript. These checks do not claim that a physical screen reader was tested.

## Full-check follow-up

The first complete check found an outdated cookie-clearance test: it still visited `/cs` to wait for the company
offer's booking notification. That notification remains in `ProFirmyPage` at `/cs/pro-firmy`; the new homepage does
not render it. The test now visits its owning route and keeps every notice-visibility, desktop/mobile clearance,
cookie-clickability and footer assertion. The general cookie viewport checks also cover `/cs/pro-firmy` alongside
both homepages. No application behavior, assertion, timeout, skip condition or aggregate-check step was removed.

Follow-up results on 6 October 2026:

- `npm run check` passed end to end: lint, the production build, TypeScript, 193 browser tests and the existing
  test-data cleanup. The browser run took 17.4 minutes. Four unchanged conditional cases were skipped: unavailable
  workshop registration/participant entry, and two opt-in long-media tests requiring separately supplied fixtures.
- All 12 cookie-consent browser tests passed in the focused run. Another 38 unit tests passed for homepage stories,
  localization, metadata/social coverage, the preserved company metadata and footer defaults.
- Fresh rendered Czech/English homepages were inspected at 1440 px and 375 px; neither had horizontal overflow.
  The company booking notice was also inspected at 1440 px and 390 px and remained above the clickable cookie panel.
  Captures are the `*-retry-*.png` files in `.tmp/homepage-review/`.
- The check emitted the existing hook/image lint and ONNX bundler warnings, plus an oversized YouTube-cache-entry
  warning. They did not fail validation. The earlier production-performance and physical-device limitations remain.
