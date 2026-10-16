# Autonomous agendas homepage

The Czech `/cs` and English `/en` pages present ongoing business responsibilities and an enquiry about deployment.
The shared composition lives in `businesses/homepage/HomepagePage.tsx`; Czech is the content source of truth.
The September homepage proposal remains deferred and unchanged.

## Analysis and implementation

Before this change, both routes rendered `ProFirmyPage`, while their metadata already had its own module.
The company offer owns its document Q&A proposition, shared qualification defaults and canonical `/cs/pro-firmy`
address. The new homepage therefore has its own content and styles. The whitepaper's semantic controls and CSS
perspective informed the presentation; none of its chapters, interactions or page styles were replaced.

Whitepaper chapters 1 and 7 supply the shift to ongoing responsibility, chapter 11 supplies the three examples,
and chapters 10 and 12 supply the approval boundaries and distinction between capabilities and vision. The page
labels these as fictional illustrations of the direction being developed. It makes no measured customer-result,
integration-availability, guaranteed-compliance or autonomous-payment claims.

- `homepageScenarios.ts` supplies the interactive stories, readable native-disclosure summaries and enquiry choices.
  Every scenario has a burden, entrusted responsibility, benefit, owner decision and five finite story moments.
- `homepageStoryModel.ts` selects one scenario and step. The first view is a prepared result; selecting a scenario
  resets to that view. Replay returns to the incoming need. Nothing accumulates, runs on a timer or calls a service.
  Software proposals remain unpublished, customer responses remain unsent, and accounting inputs await review.
- The layered agent, project and task surfaces are semantic buttons for those same story states. Their grid layout
  gives text its own space at narrow widths and zoom. Scroll changes only perspective and lift. Its optional controller
  unmounts offscreen, in a hidden document and for reduced motion. Direct controls remain immediate.
- Hero, initial story, benefits, summaries and contact links are server-rendered. An error boundary contains failures
  in the story. If client scripts or the enquiry handler are unavailable, the primary action keeps its native contact
  anchor; the contact section links to the existing contact page.
- `QualificationPopup` accepts an optional presentation. Without it, the original company form remains unchanged.
  The homepage uses `subscribeToWaitlist`, the existing `qualification-popup` source, attribution and consent note.
  It retains drafts on close/failure, validates locally, disables pending edits and fences duplicate submissions.
  Success uses `/dekujeme?source=autonomous-agendas&lang=cs|en` without contact identity in the URL.
- The full shared footer retains legal and funding information. Its optional claim and product links affect only
  callers that supply them. Homepage metadata uses an `agenda` illustration and a page-specific content revision in
  addition to the shared image version. Authored preview URLs and other pages' artwork are unchanged.

## Preservation

No changes to the company composition/content/metadata, whitepaper sources, root language selector, domain routing
or deferred September PRD are needed. The legacy company redirect and canonical Czech-only offer remain in place.
Rendered main text and Open Graph/X/canonical/alternate metadata are compared against the saved pre-change baseline
for `/cs/pro-firmy`, `/cs/whitepaper` and `/en/whitepaper`. Shared-form preservation also has a browser submission test.

## Verification

### Automated checks

- `npm test -- --maxWorkers=2`: 2,278 passed, two optional studio S3 integration tests skipped
  (317 test files passed, one skipped). The initial default-worker run hit two timeouts in the unchanged workshop
  participant tests; all 36 tests in that file passed in isolation, then the complete suite passed with two workers.
- `npm test -- businesses/homepage businesses/pro-firmy lib/metadata lib/domains lib/homepage-language`:
  all 59 tests passed after the final changes. They cover localization, reducer bounds, rapid selection,
  motion-controller cleanup, rendered failure fallback, enquiry-anchor fallback and metadata preservation.
- `npm run lint`: passed, with six existing warnings in the public preview image and recording-studio components.
- The build stage of `npm run test-types` succeeded. After correcting test-only TypeScript errors,
  `npx tsc --noEmit` passed against the regenerated build types. The build reports 170 kB First Load JS for each
  homepage. Existing non-fatal SWC lockfile-patch and ONNX dynamic-import warnings remain.
- Chromium browser verification covered 48 distinct checks across `homepage.spec.ts`, `whitepaper.spec.ts`,
  `sharing-previews.spec.ts`, `public-domains.spec.ts`, and the company qualification/footer newsletter cases in
  `public-submissions.spec.ts`. The existing workshop sharing-preview case passed on its configured retry.
  All 14 checks passed again in the final homepage-only run.

Browser coverage includes all 15 story moments in both languages, direct layered-surface controls, forward/back,
replay, rapid switching, background/offscreen return, keyboard and touch, reduced motion, JavaScript disabled,
failed client scripts, form validation, draft retention, duplicate prevention, failure/retry, focus restoration,
confirmation attribution, language routing, the legacy 301 redirect, canonical/sitemap membership and PNG previews.
Network assertions reject application API/model calls and unexpected writes during the demonstration; they exempt
the existing shared analytics destinations and Next.js development diagnostics. The demonstration itself has no
network operations. Enquiry checks use the real local API with isolated in-memory contacts; failure/retry checks
intercept their own requests. They do not establish production lead delivery.

### Rendered comparison and visual review

Main text and Open Graph/X/canonical/alternate metadata for `/cs/pro-firmy`, `/cs/whitepaper` and `/en/whitepaper`
match the saved pre-change baseline. Both whitepaper full-page screenshots are pixel-identical. Company-page
screenshots have the same dimensions and differ only in the existing continuously animated final-CTA background;
its real qualification submission also passed. No company/whitepaper source, root selector or domain middleware
was changed.

Inspected real Chromium renders in Czech and English at 1440-pixel desktop and 375-pixel phone widths: hero,
all three examples, story transitions, enquiry including consent, social cards and the full legal/funding footer.
Checks at 320, 375, 720, 768, 900, 1024 and 1440 pixels found no horizontal overflow. Artifact text remains
uncovered through all steps at 320, 375, 768 and 1440 pixels. Direct controls, language/depth links and native
fallback navigation work. The phone cookie panel leaves the footer reachable, and closing the enquiry restores
focus to its opener. Scroll changes depth while leaving the selected story unchanged.

Warm, unthrottled local development-server samples (Chromium; desktop 1440×1000, phone emulation 375×812):

| Page/view | Largest contentful paint | Cumulative layout shift |
| --- | --- | --- |
| Czech desktop | 556 ms | 0.010 |
| English desktop | 312 ms | 0 |
| Czech phone | 308 ms | 0 |
| English phone | 264 ms | 0 |

The longest observed main-thread task was 193 ms. The phone story height stayed at 1,362 pixels in Czech and
1,362–1,368 pixels in English across selections. These are local development observations, not production or
mobile-hardware performance claims; cold compilation takes longer. Screenshots, baseline comparisons and samples
are kept locally under the ignored `.tmp/homepage-final-review` and `.tmp/homepage-*` artifacts.

### Required-check regression fixes (16 October 2026)

The failed full check still looked for the company offer's booking notice at `/cs`. That preservation test now
visits `/cs/pro-firmy`; cookie layout coverage remains on `/cs` and `/en` and also covers the company offer.
The Studio test previously sampled media after checking only that no source was loading or buffering, which also
allows missing or failed sources. It now waits for the expected ready sources and checks every one against the
existing 100 ms tolerance, including the intentional camera/microphone startup gaps at an appended part boundary.
Neither change modifies the preserved company page or the Studio implementation.

Both company cookie checks and the Studio multitrack regression passed with retries disabled. All 59 focused
homepage, company, metadata and domain unit tests passed. A fresh Chromium comparison also found identical
server-rendered text and social/canonical/language metadata for the company page and both whitepapers against
the saved pre-change baseline.

In the full run, the Studio multitrack case encountered the existing eight-second media-seek timeout for all three
sources on its first attempt; its configured retry passed. The stronger readiness check retained that failure
instead of accepting absent or failed media. This remains a flaky media check, with its failed-attempt trace retained.

`npm run check` completed with exit code 0: lint, production build, TypeScript, the full browser suite and test-data
cleanup all completed. The browser suite reported 203 passed, six conditional skips and the one Studio flake in
42.6 minutes. Both company cookie checks, all 14 homepage checks, the company enquiry, both whitepapers and all
domain-isolation checks passed on their first attempts. Existing lint, SWC lockfile, ONNX import and oversized
YouTube-cache warnings remain. The complete output is in `.tmp/homepage-retry-check.log`.

Fresh desktop and phone captures in both languages were inspected, including the three example artifacts,
enquiry, consent and cookie/footer clearance. The browser review exercised all steps with touch, changing scroll
depth and returning focus after closing the enquiry. Width checks at 320, 720, 900 and 1024 pixels found no horizontal
overflow. Captures and measurements are in `.tmp/homepage-retry-review`; the comparison output is in
`.tmp/homepage-retry-preservation.log`.

These repeat measurements ran alongside cold development compilation and the full browser suite: largest contentful
paint was 16,500 ms / 7,788 ms for Czech desktop/phone and 3,304 ms / 3,640 ms for English desktop/phone. Cumulative
layout shift was 0.011 for Czech desktop and zero for the other views; the longest main-thread task was 260 ms.
The phone story heights remained 1,362 px in Czech and 1,362–1,368 px in English. These loaded development-server
samples include compilation and concurrent verification; production performance remains unmeasured.

### Limits

A production runtime preview could not start with the deliberately empty database connection because repository
instrumentation requires startup migrations. No database was changed to bypass that requirement. Production
performance, network/CPU-throttled Lighthouse, Safari/Firefox and physical phone testing were not run. Hidden-tab
coverage combines browser tab switching with explicit component visibility tests; it is not a physical-device
suspension test. No external business integration or production contact delivery was exercised. The scenarios
remain illustrations of the product direction rather than evidence that every shown integration is shipped.
