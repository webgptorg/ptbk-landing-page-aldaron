# Changelog

## Unreleased

- Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
  microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
  sources produce real media for the existing recording, ZIP, trimming, and playback checks.

- Let administrators choose whether a community-membership discount code remains permanent or applies only to a
  selected number of monthly renewals. Stripe now receives the matching coupon, so a temporary reduction ends at the
  full subscription price without an application-side timer; existing codes remain permanent.

- Stopped the end-to-end suite from intermittently failing with `TypeError: Cannot read properties of undefined
  (reading 'call')`. Its Next.js development server used to dispose a compiled route after a minute without a request,
  and rebuilding it re-emitted the shared server chunks underneath whichever request arrived next; a page such as
  `/ai-supervize-mini`, reached again minutes later through the `/skoleni` redirect, was exactly that case. The test
  server now keeps every route it compiled for the whole run, while an ordinary `npm run dev` keeps disposing the
  routes it no longer serves.
- Checked every public redirect by the destination it names instead of by following it, so a redirecting address such
  as `/skoleni` now proves its own status code and destination rather than re-rendering an already covered page through
  the Next.js development server a second time.
- Added the Czech and English privacy-policy and terms pages to the public-page smoke suite, which previously reached
  only the language the test browser happened to ask for.
- Covered that `/skoleni` carries a discount code into the AI Supervize Mini registration anchor.
- Gave every E2E test the same cold-compilation budget from one place in the Playwright configuration, so a public
  form which happens to be the first to reach its endpoint is no longer reported as broken merely for having waited
  for the development server to compile it.
- Let every public-submission test run even when one of them fails, so a single slow form no longer hides whether the
  remaining public forms still accept a submission.
- Bounded the archive of E2E recordings to the most recent runs, so repeated verification cannot fill the disk of the
  machine which is verifying the project.
- Kept every public-page smoke assertion while isolating each route, so cold Next.js compilation cannot time out a
  healthy route reached later in the suite.
- Allowed the local Playwright loopback host to load Next.js development resources without cross-origin blocking.
- Made type verification regenerate Next.js route types before running TypeScript, preventing removed routes left in `.next/types` from breaking subsequent coding runs.
- Fixed the thank-you page's internal homepage navigation so the production lint check passes.
- Made local Playwright verification self-contained when a Supabase service-role key is unavailable, while retaining configured-database coverage when one is provided.
