# Run trace of `prompts/2026-09-0550-fix-the-existing-test-failures-before-implementing-any.md#1`

-   **Prompt:** Fix the existing test failures before implementing any queued coding tasks.
-   **Outcome:** Succeeded
-   **Runner:** Developer on OpenAI Codex `gpt-6-astra` thinking `max` (ChatGPT account)
-   **Attempts:** 1
-   **Steps:** Implementation ~$0.2331 12 minutes; Testing 7 minutes
-   **Verification command:** `npm run test-for-ptbk-coder`
-   **Started:** 2026-09-21T13:31:24.703Z
-   **Finished:** 2026-09-21T13:50:36.219Z
-   **Duration:** 19 minutes

## Runtime log

````text
=== runner shell started at 2026-09-21T13:31:24.748Z ===
Script path: /Users/hejny/work/aldaron/.promptbook/coder-prompts/2026-09-0550-fix-the-existing-test-failures-before-implementing-any.sh

--- raw input ---
if [ -n "${PTBK_AGENTS_SERVER_ENV_FILE:-}" ] && [ -f "${PTBK_AGENTS_SERVER_ENV_FILE}" ]; then
set -a
source "${PTBK_AGENTS_SERVER_ENV_FILE}"
set +a
elif [ -f .env ]; then
set -a
source .env
set +a
fi

CODEX_LOGIN_STATUS="$(
    unset OPENAI_API_KEY OPENAI_BASE_URL CODEX_API_KEY
    # 'codex login status' prints the "Logged in using ChatGPT" line to stderr, so merge stderr into stdout (2>&1) to capture it
    codex login status 2>&1 || true
)"
case "$CODEX_LOGIN_STATUS" in
    *"Logged in using ChatGPT"*)
        IS_CODEX_CHATGPT_LOGIN_ACTIVE=1
        ;;
    *)
        IS_CODEX_CHATGPT_LOGIN_ACTIVE=0
        ;;
esac

CODEX_LOGIN_METHOD=chatgpt
CODEX_LOGIN_METHOD_ARGUMENTS=(-c forced_login_method=chatgpt)
unset CODEX_API_KEY
if [ "$IS_CODEX_CHATGPT_LOGIN_ACTIVE" != "1" ] &&
    [ "${PTBK_OPENAI_CODEX_USE_API_KEY:-0}" = "1" ] &&
    [ -n "${OPENAI_API_KEY:-}" ]; then
    CODEX_LOGIN_METHOD_ARGUMENTS=(-c forced_login_method=api)
    CODEX_LOGIN_METHOD=api
    CODEX_API_KEY="${OPENAI_API_KEY}"
    export CODEX_API_KEY
fi

if [ "$IS_CODEX_CHATGPT_LOGIN_ACTIVE" = "1" ] ||
    [ "${PTBK_OPENAI_CODEX_USE_API_KEY:-0}" != "1" ] ||
    [ -z "${OPENAI_API_KEY:-}" ]; then
unset OPENAI_API_KEY
unset OPENAI_BASE_URL
fi

printf '%s %s\n' 'ptbk-codex-login-method:' "${CODEX_LOGIN_METHOD}"

codex \
    "${CODEX_LOGIN_METHOD_ARGUMENTS[@]}" \
    -c model_reasoning_effort="max" \
    --ask-for-approval never \
    exec --model gpt-6-astra \
    --local-provider none \
    --sandbox danger-full-access \
    -C /Users/hejny/work/aldaron \
    --skip-git-repo-check \
    <<'CODEX_PROMPT'

## Your Task

Fix the existing test failures before implementing any queued coding tasks.

The verification command `npm run test-for-ptbk-coder` failed before coding started. Fix the underlying failure without weakening or removing the tests, and leave the project ready for the remaining coding prompts.

## Verification output

```
[..., test output truncated to the last 12000 characters...]
te sources, restores them, trims every track and exports playable editor material (7.2s)
  ✘  71 tests/e2e/recording-studio.spec.ts:81:5 › records separate sources, restores them, trims every track and exports playable editor material (retry #1) (7.2s)
  ✓  72 tests/e2e/recording-studio.spec.ts:162:5 › stops the whole take on disconnect and prevents a second tab from changing it (4.7s)
  ✓  73 tests/e2e/recording-studio.spec.ts:182:5 › recovers persisted chunks after an interrupted page and waits for stop before admin navigation (11.7s)
  ✓  74 tests/e2e/room-theme.spec.ts:96:5 › shares a saved room appearance, follows the device, and preserves the waiting-room form (14.4s)
  ✓  75 tests/e2e/room-theme.spec.ts:141:5 › themes connected rooms, materials, and portalled dialogs on desktop and mobile without losing drafts (13.1s)
  ✓  76 tests/e2e/workshop-agents.spec.ts:34:9 › defines a Book agent in the workshop administration (2.9s)
  ✓  77 tests/e2e/workshop-agents.spec.ts:34:9 › defines a Book agent in the community administration (6.5s)
  ✓  78 tests/e2e/workshop-repository-range.spec.ts:31:5 › edits independent commit bounds in workshop settings (2.9s)
  ✓  79 tests/e2e/workshop-repository-range.spec.ts:67:5 › previews the deployed app while browsing the highlighted workshop range (3.3s)
  ✓  80 tests/e2e/workshop-subtitles.spec.ts:63:5 › imports, autosaves, reloads and downloads private subtitles through the shared admin editor (2.5s)
  ✓  81 tests/e2e/workshop-subtitles.spec.ts:107:5 › decodes a long recording into bounded audio chunks and preserves multilingual timestamps (2.8s)
  ✓  82 tests/e2e/workshop-vercel-deployment.spec.ts:31:9 › deploys a workshop project and saves its ready URL through the existing settings form (6.3s)
  ✓  83 tests/e2e/workshop-vercel-deployment.spec.ts:31:9 › shows Vercel failure details and guidance, then saves the URL after retrying (11.6s)
  ✓  84 tests/e2e/workshop-wrap-up-pdf.spec.ts:34:5 › downloads the branded recap in the browser with local fonts, project preview, Git graph and short-link QR (2.8s)
Saved 79 E2E video(s) to tests/e2e/videos/.
Removed the E2E video(s) of 1 outdated run(s) from tests/e2e/videos/.


  1) tests/e2e/recording-studio.spec.ts:81:5 › records separate sources, restores them, trims every track and exports playable editor material 

    Error: expect(received).toHaveLength(expected)

    Expected length: 5
    Received length: 2
    Received array:  ["originals/01-camera.webm", "originals/02-camera.webm"]

       97 |     await page.getByRole('button', { name: 'Originály ZIP', exact: true }).click();
       98 |     const originals = await readArchive((await (await originalDownload).path())!);
    >  99 |     expect(Array.from(originals.keys()).filter((name) => name.startsWith('originals/'))).toHaveLength(5);
          |                                                                                          ^
      100 |     // Exercise the streaming disk path with a real writable file, without automating an OS save dialog.
      101 |     await page.evaluate(() => Object.defineProperty(window, 'showSaveFilePicker', {
      102 |         configurable: true, value: async () => (await navigator.storage.getDirectory()).getFileHandle('test-studio-export.zip', { create: true }),
        at /Users/hejny/work/aldaron/tests/e2e/recording-studio.spec.ts:99:90

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material/video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material/error-context.md

    attachment #4: trace (application/zip) ─────────────────────────────────────────────────────────
    tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material/trace.zip
    Usage:

        npx playwright show-trace tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

    Retry #1 ───────────────────────────────────────────────────────────────────────────────────────

    Error: expect(received).toHaveLength(expected)

    Expected length: 5
    Received length: 2
    Received array:  ["originals/01-camera.webm", "originals/02-camera.webm"]

       97 |     await page.getByRole('button', { name: 'Originály ZIP', exact: true }).click();
       98 |     const originals = await readArchive((await (await originalDownload).path())!);
    >  99 |     expect(Array.from(originals.keys()).filter((name) => name.startsWith('originals/'))).toHaveLength(5);
          |                                                                                          ^
      100 |     // Exercise the streaming disk path with a real writable file, without automating an OS save dialog.
      101 |     await page.evaluate(() => Object.defineProperty(window, 'showSaveFilePicker', {
      102 |         configurable: true, value: async () => (await navigator.storage.getDirectory()).getFileHandle('test-studio-export.zip', { create: true }),
        at /Users/hejny/work/aldaron/tests/e2e/recording-studio.spec.ts:99:90

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material-retry1/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material-retry1/video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material-retry1/error-context.md

    attachment #4: trace (application/zip) ─────────────────────────────────────────────────────────
    tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material-retry1/trace.zip
    Usage:

        npx playwright show-trace tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material-retry1/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

  2) tests/e2e/participant-promotion.spec.ts:50:9 › refreshes an author's pending total and submissions after trust on /cs/online-workshop/participant 

    Error: page.goto: net::ERR_NETWORK_IO_SUSPENDED at http://127.0.0.1:4009/cs/online-workshop/participant
    Call log:
      - navigating to "http://127.0.0.1:4009/cs/online-workshop/participant", waiting until "load"


      82 |         });
      83 |
    > 84 |         const response = await page.goto(pathname);
         |                                     ^
      85 |         test.skip(response?.status() === 404, 'The configured database has no published room for this route.');
      86 |         await expect(page.getByText(`Čeká na schválení: ${isCommunity ? 3 : 2}`, { exact: true })).toBeVisible();
      87 |         const authorProject = page.getByRole('article').filter({ has: page.getByRole('heading', { name: PROJECT_TITLE }) });
        at /Users/hejny/work/aldaron/tests/e2e/participant-promotion.spec.ts:84:37

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    tests/e2e/.artifacts/participant-promotion-refr-c986f-online-workshop-participant/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    tests/e2e/.artifacts/participant-promotion-refr-c986f-online-workshop-participant/video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: tests/e2e/.artifacts/participant-promotion-refr-c986f-online-workshop-participant/error-context.md

    attachment #4: trace (application/zip) ─────────────────────────────────────────────────────────
    tests/e2e/.artifacts/participant-promotion-refr-c986f-online-workshop-participant/trace.zip
    Usage:

        npx playwright show-trace tests/e2e/.artifacts/participant-promotion-refr-c986f-online-workshop-participant/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

  3) tests/e2e/participant-promotion.spec.ts:50:9 › refreshes an author's pending total and submissions after trust on /cs/komunita 

    Test timeout of 180000ms exceeded.

    Error: expect(locator).toBeVisible() failed

    Locator: getByText('Čeká na schválení: 3', { exact: true })
    Expected: visible
    Timeout: 30000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 30000ms
      - waiting for getByText('Čeká na schválení: 3', { exact: true })


      84 |         const response = await page.goto(pathname);
      85 |         test.skip(response?.status() === 404, 'The configured database has no published room for this route.');
    > 86 |         await expect(page.getByText(`Čeká na schválení: ${isCommunity ? 3 : 2}`, { exact: true })).toBeVisible();
         |                                                                                                    ^
      87 |         const authorProject = page.getByRole('article').filter({ has: page.getByRole('heading', { name: PROJECT_TITLE }) });
      88 |         if (isCommunity) await expect(authorProject.getByText('Čeká na schválení', { exact: true })).toBeVisible();
      89 |
        at /Users/hejny/work/aldaron/tests/e2e/participant-promotion.spec.ts:86:100

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    tests/e2e/.artifacts/participant-promotion-refr-a049d--after-trust-on-cs-komunita/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    tests/e2e/.artifacts/participant-promotion-refr-a049d--after-trust-on-cs-komunita/video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: tests/e2e/.artifacts/participant-promotion-refr-a049d--after-trust-on-cs-komunita/error-context.md

    attachment #4: trace (application/zip) ─────────────────────────────────────────────────────────
    tests/e2e/.artifacts/participant-promotion-refr-a049d--after-trust-on-cs-komunita/trace.zip
    Usage:

        npx playwright show-trace tests/e2e/.artifacts/participant-promotion-refr-a049d--after-trust-on-cs-komunita/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

  1 failed
    tests/e2e/recording-studio.spec.ts:81:5 › records separate sources, restores them, trims every track and exports playable editor material 
  2 flaky
    tests/e2e/participant-promotion.spec.ts:50:9 › refreshes an author's pending total and submissions after trust on /cs/online-workshop/participant 
    tests/e2e/participant-promotion.spec.ts:50:9 › refreshes an author's pending total and submissions after trust on /cs/komunita 
  2 skipped
  76 passed (21.0m)
[1]-  Exit 1                  bash "$1"
```

-   Keep in mind the DRY _(don't repeat yourself)_ principle.
-   Do a proper analysis of the current functionality before you start implementing.
-   Add the changes into the [changelog](CHANGELOG.md)
-   Update the [README](README.md) if needed.
-   Update the [AGENTS.md](AGENTS.md) for the next job to be done if it makes sense.

## Your Behavior

You are Developer
You are a helpful, honest, and intelligent AI assistant. Your goal is to provide accurate, clear, and concise responses while being friendly and engaging. Think step-by-step before answering complex questions.

### Rules

-   If you're unsure about something, say so and offer to look it up or clarify.
-   You can use Markdown formatting in the messages like **bold** or *italic*
-   You can use Markdown code blocks if needed

For example:

```javascript
console.log('Hello');
```
-   Keep in mind the DRY _(don't repeat yourself)_ principle.
-   Keep in mind the SOLID principles.
-   Do a proper analysis of the current functionality before you start implementing.
-   Keep small responsibilities of functions and classes, avoid creating big functions or classes that do many things.
-   Constants should always be `UPPER_SNAKE_CASE`.
-   Boolean variables should always be prefixed with `is`, for example `isUserChatJobLeaseExpired` or `IS_DEBUG_MODE`.
-   Do not use abbreviations, for example use `isExpired` instead of `isExp`, `translateMessage` instead of `t`, etc.
It is fine to use well-known abbreviations, for example `id`, `url`, `html`, etc.

### Prompt suffix
-   If you're unsure about something, say so and offer to look it up or clarify.
-   You can use Markdown formatting in the messages like **bold** or *italic*
-   You can use Markdown code blocks if needed

For example:

```javascript
console.log('Hello');
```
-   Keep in mind the DRY _(don't repeat yourself)_ principle.
-   Keep in mind the SOLID principles.
-   Do a proper analysis of the current functionality before you start implementing.
-   Keep small responsibilities of functions and classes, avoid creating big functions or classes that do many things.
-   Constants should always be `UPPER_SNAKE_CASE`.
-   Boolean variables should always be prefixed with `is`, for example `isUserChatJobLeaseExpired` or `IS_DEBUG_MODE`.
-   Do not use abbreviations, for example use `isExpired` instead of `isExp`, `translateMessage` instead of `t`, etc.
It is fine to use well-known abbreviations, for example `id`, `url`, `html`, etc.

## Context

### Context

This repository contains Promptbook landing pages for different businesses,
use cases, and audiences. Keep these rules current when behavior changes.

#### Public routes

- `/` redirects to `/cs` or `/en` using `Accept-Language`.
- `/cs` is the Czech homepage and source of truth for homepage structure and copy.
- `/en` is its English localization.
- `/pro-mesta`, `/pro-firmy`, `/for-agro`, `/for-industry`, `/ai-supervize`,
  `/hackathon-factory`, and `/pavol` are specialized landing pages. `/pavol`
  redirects to `/cs/pavol` or `/en/pavol`; the localized pages are Pavol Hejny's
  personal pages.
- `/ai-supervize-mini` is the Czech one-day AI Supervize page. Published terms,
  prices, capacities, places, FAQs, registration, and participant information
  come from `/admin/workshops`; with no published term it shows a notice.
  `/skoleni` redirects there.
- `/cs/online-workshop` lists free 60-minute online workshops about writing
  production code with AI agents. Each term has its own subject and description,
  but all use one registration form. `/cs/online-workshop/dekujeme` is the
  full-load conversion page; `/participant` is the live room. Its waiting room
  offers every published term as the same term cards the landing page registers
  with: running and upcoming ones first, with a special `Tento týden` badge for a
  term beginning within the next seven rolling days, then the ones which ended
  within the last day, and the older finished ones behind a disclosure.
  Picking one changes the room being connected to and the `workshop` parameter,
  without losing the name and e-mail already typed.
  After the recorded end, its wrap-up offers a PDF generated in the browser from a fresh authenticated room response.
  The recap uses the existing description and material text for its summary and key points, includes accessible
  materials and public presentation/project links, and preserves the room's publication, unlock and membership rules.
  Its printable A4 design uses the Promptbook logo, local Inter/Outfit fonts and the room's light palette. An
  authenticated export request creates an ad hoc short link for its room QR code, without carrying participant
  identity. Project previews reuse event-card metadata, with bounded public-image loading; the printed Git graph
  reuses the room's selected branches, inclusive range and lane layout, and labels any further history as available
  in the room. Missing external previews or history leave the recap and project links available.
  It stores no document and adds no administration or database fields; chat, feedback and participant identity are
  excluded from the export.
- `/ai-ta-krajta` reads episodes hourly from podcast RSS and YouTube feeds and
  merges their host rosters with `businesses/ai-ta-krajta/aiTaKrajtaEpisodes.json`. Its shared platform list exposes
  the publisher's direct RSS feed for custom podcast applications, and page metadata advertises it as
  `application/rss+xml`.
  Each episode lists every credited person by name, and every person any source
  credits has a card in `aiTaKrajtaPeople.ts`, which a test keeps in step, so a
  credited person never misses their portrait and the filter cannot lose them.
  It keeps exact episode counts but labels subscriptions and listening hours as
  estimates. The fixed mini-player, newest-episode header button, person/search/
  episode/play/archive/collaboration filters, and section hash are shareable as
  query/hash state; the snake game is local state. Person clicks filter episodes.
  Everyone in the roster shows a portrait, cut by
  `scripts/_cutAiTaKrajtaPeoplePortraits.mjs` out of the episode cover the show
  itself published them on, or out of the picture they publish of themselves when
  no cover carries them; the roster names only the file, and a person without one
  keeps the initials on the brand gradient. The one people list is drawn anew
  for every visit, weighted by how many episodes of the archive name each
  person, so somebody heard often comes up high far more often than someone in
  one díl without the list ever becoming a ranking. The draw is local state and
  is made in the browser; the page itself is built in the order the draw leans
  towards, from the most often named person to the least often named one, so the
  browser hydrates into the list it was sent.
  Collaboration submissions use `/admin/contacts`. Its tab icon is the page's
  own snake drawing in `/ai-ta-krajta/logo.svg` and `.png`; SVG corners are
  rounded and transparent, while the raster fills its square. That drawing is
  traced off the cover artwork of the show and recorded once in
  `businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork.ts`, together with the
  measurements of the animal along its own length. The snake of the minigame
  starts in exactly that shape, in the frame the still logo occupied, and only
  then eases into the proportions, colours and speed of a game snake.
  A seven-cell Promptbook coder terminal floats in the bottom-right corner and
  clears the player and cookie controls. It types `$ ptbk`, then animates an
  ASCII octopus in response to pointer, focus, scrolling, and the snake terrarium.
  It stays still for reduced motion and pauses its clock in hidden tabs. The
  badge and the shared footer credit link to `https://coder.ptbk.io/`.
- `/ai-ta-krajta/media-kit` and `/ai-ta-krajta/branding` are the two pages beside
  the podcast. They are named once, in `AI_TA_KRAJTA_SUBPAGES`, which the footer
  lists and which they point at each other through, so no link can name a page
  differently than the page names itself. Both wear the same compact header,
  section heading and footer as each other. The brand kit hands out the logo the
  site already serves at `/ai-ta-krajta/logo.svg`, `.png` and the cover artwork,
  publishes no colour outside `AI_TA_KRAJTA_COLORS`, and says how the name is
  written; it asks for nothing and sends visitors to the media-kit form.
- `/cs/komunita` is the permanent Czech community room. It has chat, polls,
  projects, materials, and published terms, but no schedule, stage, or live
  updates. Terms show event kind, format/place, price, and status; wherever their
  shared mini card is drawn, it shows no star ratings and may show a wide preview
  of its connected project with its title, description, and repository. An ended
  term may show the video length minus the configured recording start offset as
  a replay badge. Card data includes no feedback. Where a term stands in
  time is decided
  once, in `lib/workshops/workshopPhase.ts`, as one of
  five phases: ongoing, freshly past while it ended within the last
  `FRESHLY_PAST_WORKSHOP_HOURS`, upcoming within the next seven rolling days,
  other upcoming, and past. Every list, badge, and calendar colour reads that one
  answer, and everything which opens after a workshop — the wrap-up, the feedback,
  the recording — treats freshly past as over. A term with a
  live room links there; a term of an event held elsewhere opens its organizer's
  address in a new tab; otherwise it links to its landing page. The calendar
  opens on the member's month, can filter by day, and uses the same terms and
  statuses as the cards. Empty days cannot be selected; an empty month is only
  selected when the member's month has no terms. The room offers Google Calendar
  and `webcal:` subscriptions.
- `/cs/komunita/projects` is the full project gallery, ordered by upvotes.
  `/cs/komunita/projects/<project_id>` shows scraped project details and a
  moderated discussion. Project-room sessions derive from the community session;
  the author moderates their own discussion.
- `/cs/komunita/clenstvi` offers free community access and the 199 Kč monthly
  membership. Webinars remain free; paid access adds recordings, archive,
  materials, extra content, priority questions, and Discord/community features.
  The page is prefilled from `fullname` and `email`, supports community discount
  codes, has no new annual plan or trial, and allows cancellation.
- `/cs/komunita/calendar.ics` publishes the same terms by stable slug, so moved
  or renamed terms update existing subscriptions. It contains only event terms
  and public destinations, never subscriber identity.
- `/admin/workshops` manages terms of every event kind, participants, comments,
  reactions, content, attached community polls, and settings. Every term says both
  of its audiences: the people registered on the landing page of its event, and
  the people who entered its room. A room which is no term of an event says
  nothing about registrations at all. The registration block opens the exact
  filtered `/admin/contacts` list and its shared CSV, vCard, and Book exports;
  it never creates a second contact table or serializer in workshop administration.
  Its term picker gives ongoing, freshly past, next-seven-day, and later upcoming
  terms their own categories, because a term which has only just been held is
  still being wrapped up and one beginning soon needs preparation; only past terms
  stay behind its history disclosure. Its unobtrusive display-settings control
  keeps every artificial activity tool — prepared chat comments, reaction and
  vote adjustments, and the artificial watching count — out of a shared screen
  by default; `artopts=on` reveals them and `artopts=off` keeps them hidden.
- `/admin/workshops?tab=subtitles` manages private Czech, English and mixed-language video subtitle tracks.
  Tracks store plain text with original-video timestamps, source video/file and provenance independently of room
  responses. Admins can import SRT/WebVTT, try existing YouTube captions (authored before automatic), or generate
  subtitles from an original recording through OpenAI. Browser media decoding sends bounded audio chunks and adds
  their positions once; recording offsets do not alter stored times. Generation produces a reviewable draft, creation
  is explicit, and existing tracks use the shared autosaved editor. Changed source videos are labelled, imports never
  overwrite existing tracks, and no participant endpoint or public database role exposes subtitles.
- `/admin/community` manages the permanent community, including polls, project
  moderation, participants, memberships, payments, and room analytics.
- `/admin/recording-studio` records any number of available cameras, screen shares,
  and optional microphones as separate local tracks. One capture coordinator starts
  and stops them on a shared clock; losing a source or a storage write stops the take.
  IndexedDB commits each chunk together with its counters, and an exclusive browser
  lock protects recording, recovery, editing and deletion across tabs. Size and
  remaining-time estimates use browser quota and the combined recording bitrate,
  keeping a storage reserve. Saved takes survive reload; unfinished ones expose only
  persisted chunks. The shared admin editor autosaves one trim range for every track.
  ZIP64 exports preserve originals and timing metadata and can include actual trimmed
  copies; trimming uses browser codecs and temporary local files, never an upload.
  Capture and export reuse admin navigation/sign-out/reload protection. No server or
  database storage is added.
- `/admin/shortener` manages public short links, QR/UTM output, destinations,
  notes, search/filter/sort state, and private click history. Links are served
  by `/[shortcode]`; `/shortener` redirects to the admin page.
- `/admin/login` authenticates the single `admin` account with `ADMIN_PASSWORD`
  and a signed session cookie. All `/admin/*` pages and APIs require
  `requireAdminSignedIn`. `/admin` is the post-login dashboard.
- Other public/legal routes include `/contact`, `/data-deletion`, `/privacy`,
  `/terms`, `/dekujeme`, `/branding`, and the routes under `/k`, `/old`, and
  `/test`.

#### Shared community and workshop behavior

- Community and workshop participant rooms, including waiting rooms and community project views, share light,
  dark, and device appearance through `WorkshopRoomThemeProvider` and `workshopRoomTheme.css`. The browser remembers
  the choice across rooms and tabs; changing it preserves form and room state. Room palette tokens also reach
  portalled membership/project dialogs and cookie controls. Public landing pages and administration keep their own
  appearance.

- The global cookie banner shares its page palette with its settings dialog, uses
  a shallow bottom strip on desktop and an inset panel on phones, and reserves its
  measured height so the end of each page stays reachable. Fixed bottom controls
  such as the podcast player and admin table scrollbar opt into clearance through
  `data-fixed-bottom-control`; the banner, booking notice, and coder badge measure
  their neighbors through `hooks/useFixedControlClearance.ts`.

- Rooms lead to each other in both directions, through one identity hand-off. The
  community lists the terms and opens the room of each; an invited workshop room
  places its community link beside its materials as a special material for every
  participant, regardless of paid membership. Where a special material sits is
  decided once, in `lib/workshops/workshopSpecialMaterials.ts`: a card says where
  among the ordinary materials it belongs, and the invitation opens the material
  list of a participant who does not pay while it closes the list of a paying
  member. A membership which is not loaded yet leaves it where a participant who
  does not pay reads it. Both carry the connected member's
  name and email on, and an incomplete identity carries nothing rather than half
  of it. Which rooms invite is answered by
  `lib/workshops/workshopKindCapabilities.ts`; the community and project
  discussions do not. The invitation names the community's sections by the names
  the community itself uses.
- Community polls attached to workshops are shared. A normalized email gives a
  member one vote across the community and all attached workshops. An
  administrator can enable an Other answer: a member-written response becomes
  one shared, anonymous option and receives that member's vote atomically, so
  every room can vote for it; later poll edits keep member-written answers.
  Such an answer goes through the very moderation a chat message does, by the
  one shared submission policy in `lib/workshops/workshopSubmissionStatus.ts`:
  it is pending until the shared AI review or a moderator approves it, while a trusted member and a
  moderator have theirs approved as they write it. The vote of its writer is
  counted at once either way, but until the answer is approved only its writer
  and the moderators of the room owning the poll receive it or its vote, and a
  rejected answer is gone for everybody. Who may read one answer is decided
  once, in `lib/workshops/workshopPollOptionVisibility.ts`.
  Workshops may display and accept votes, but the community owns administration.
  Where a room puts its polls is decided once, in
  `lib/workshops/workshopPollPlacement.ts`: the community, which decides in its
  own polls, opens with them, while a workshop, which is only their subject,
  keeps them below the materials it was held for.
- The participant room owns the membership badge and popup. Community and live
  workshop rooms use the same membership for the connecting email, and checkout
  returns to the room where it started. Membership is offered only by room kinds
  listed in `lib/workshops/workshopKindCapabilities.ts`; project discussions do
  not offer it.
- Members can open Stripe Customer Portal from the popup. In-app cancellation
  stops only the next renewal, preserves access through the paid period, appears
  in the badge, and can be reversed before that period ends.
- A full-price-for-the-whole-term discount is a voucher: atomically consume it,
  create membership immediately, ask for no card, and create no Stripe renewal.
  A limited-month discount still opens checkout because the regular price returns.
  Stripe webhooks update completed, cancelled, failed, and late payments. With no
  Stripe key, hide membership; with test keys, identify the test payment gate.
- Community projects use a URL-first metadata wizard. Ordinary submissions await
  AI or manual moderation; trusted members and moderators are approved immediately. Pending
  projects remain visible to their author and moderators.
- A live workshop room has countdown, YouTube stage, reactions, watching count,
  moderated chat, timed materials, and attached poll aggregates. An open-ended
  term runs until its recorded end; its stage does not end automatically. Admins
  can select, replace, clear, or create the displayed comment through the same
  private realtime channel used by reactions.
- Workshop and community chat can use reusable Book agents, administered in their shared Agents tab with
  `BookEditor` from `@promptbook/components`. `LiteAgent` from `@promptbook/node` uses `OPENAI_API_KEY`; definitions
  are shared while replies, listening and cooldowns are enabled per room. Only newly approved comments enqueue
  replies, including artificial and other agent messages, with at most two agent turns. A durable database queue
  owns leases, deduplication and rechecks of moderation, agent settings and room state before publication.
  Public messages use the existing chat rendering; admin projections and exports distinguish `user`, `artificial`
  and `agent` origins with agent/run provenance. Agents have no participant sessions or membership access.
  Live questions require an administrator's active stream-tab or microphone capture in the Agents tab; audio is
  transcribed in short standalone segments and never saved. Private transcripts feed the agents only during an
  ongoing workshop and only from its current, unexpired capture session. Stopping capture or ending the workshop
  prevents its pending live questions from publishing; publication locks that session against a concurrent stop.
  Project rooms and externally organized events offer no agents. Persistent servers run the queue in the background;
  serverless hosts can use the authenticated scheduler route documented in `README.md`.
- A term can be about a project. The connection is one value — GitHub repository,
  the default branch, and one or more branch patterns such as `main`, `client-*`,
  `feature/*`, or `*` for all branches, plus any number of public deployment
  addresses, written one per line — so it is set, changed, and unset at once and
  neither branch selection nor deployment
  outlives its repository. Room kinds which offer it are named in
  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository as a
  special material beside its ordinary materials for every participant, with its
  links, every deployment and newest commits, marking those which arrive while a
  participant watches;
  a newly found commit is broadcast to active rooms and appears on the stage for
  ten seconds. A selection resolving to multiple branches is shown as a commit
  graph. Commits come from the public commit feed or keyless API, pooled once per
  server and cached through the revalidation window; an unreadable feed still
  leaves the room naming its project. A project deployed once is opened as the live
  application of the workshop; several deployments are each named by their own
  address, and the first of them is the one a term card and the participant project panel are previewed from.
  Both reuse the deployment's image, title and description through the shared project preview; missing metadata or
  a broken image keeps the deployment address visible, with repository-only previews reserved for undeployed projects.
  The participant preview opens that deployment and loads independently of room state and commits, through an
  authenticated endpoint using the stored project. Changing rooms, repositories or the primary deployment discards
  stale previews. Community term cards keep their workshop destination.
  With a repository and no deployment URL, administration offers direct Vercel deployment using private `VERCEL_TOKEN`
  and optional `VERCEL_TEAM_ID`. One Vercel project per repository stays connected to its original GitHub source and
  deploys its production branch (initially the default branch), independently of the workshop's history selection.
  Administration polls the build and fills in its assigned production alias only when ready; the ordinary settings
  save publishes that URL. Manual URLs, a changed repository, and switching rooms discard stale pending results.
  Deployment failures show the reported reason and code, targeted recovery steps, and an optional bounded build-log
  excerpt with credentials redacted. Canceled, blocked, and alias-assignment failures have distinct guidance; missing
  diagnostics keep fallback checks and the Vercel link available. Only authenticated administration receives them.
  This adds no workshop data fields; setup and retry behavior are documented in `README.md`.
  The connection can also carry independent starting and ending commit IDs. Administration previews each commit's
  message, author and Prague date, and can fill each bound separately from the workshop time (first commit at or after
  the start, last at or before the end). Bounds are inclusive by commit time across the selected branches. The room
  initially shows and highlights that range; expanding and paging its graph reveals history outside it while retaining
  the highlight. An omitted bound leaves that side open; two omitted bounds leave the history unfiltered. Every lookup,
  autofill and history page uses the same branch selection, and commits belonging only to other branches stay hidden.
- A workshop can carry one public presentation URL for a PDF, PowerPoint file, or
  GitHub Markdown page. The room renders it beside ordinary materials through the
  shared material card, primary action, and QR code, for every participant without
  making it timed or membership-gated content.
- Paid-only materials are decided on the server in one pass. Members receive
  unlocked material; others receive only the published titles as an offer. An
  untitled item is not named, items are not named before their unlock time, and a
  room without membership hides paid-only items without naming them.
- After a workshop ends, its recording is server-gated to members. Others receive
  the published teaser, or a generic offer when no teaser exists; a term without
  a recording offers nothing. An administrator writes the recording's start
  offset as hours, minutes and seconds, while it stays stored, exported and read
  in seconds; it applies only to that paid replay and never to the countdown or
  live stream.
- Pending chat messages, member-written poll answers, and community projects use
  `lib/workshops/workshopAutoApproval.ts` for optional AI approval after saving.
  `WORKSHOP_AUTO_APPROVAL_API_KEY` enables it; the model and HTTPS base URL are
  configurable. Only clearly suitable content is approved; uncertainty, missing
  configuration, invalid output, and an eight-second timeout leave it pending.
  The database approves only unchanged pending content from a currently unbanned
  author and privately records the item, model, and time. AI never rejects, edits,
  grants trust, or replaces a human decision. It reviews text and URL metadata,
  without fetching linked pages or preview images. Moderator-created materials
  require no review, and old pending submissions are not bulk-processed.
- Trusted participants remain invisible and their messages are auto-approved.
  Granting trust or moderator status also approves every pending submission by that room-local participant — chat,
  member-written poll answers, and community projects — in the same database transaction. Rejected items stay
  rejected; a ban blocks this approval until it is lifted. The private pending-submission view supplies both this
  approval and the complete per-person counts in room moderation and administrative participant lists. Community
  project cards refresh with the room without resetting the submission form.
  Moderators see pending messages, can approve/reject/correct/pin them, and can
  trust or silence authors. An administrator in `/admin/workshops` and a moderator
  in a workshop room can also turn any comment into an ordinary, immediately
  available material. That preserves the comment in chat, carries its complete
  Markdown body into the material, and names its author in the material title;
  both entry points use the shared material creation path, including its short
  links and room refresh. Workshop and community moderators are appointed in
  `/admin/workshops`; project authors moderate their own discussions.
- The room records whether each open browser is actively or passively attended
  from pointer, typing, scroll, and touch activity. Admin analytics distinguish
  active computer users from merely open tabs with dashed audience lines.
- The community's compact gallery shows its five highest-upvoted approved projects
  and links to the full gallery. Community landing content is read from the live
  room: expose only anonymous totals, approved messages, and shared projects;
  show member first names only. If the room cannot be read, show less content,
  not an error. Landing-page reactions are estimates based on recent room data.

#### Administration and data rules

- Workshop and community settings render their shared `WorkshopSettingsForm` directly in the Settings tab,
  with autosave and navigation protection. Other admin creation and editing use the shared `AdminEditorDialog`
  (and `AdminEditorButton` for a local trigger).
  Lists show summaries and edit actions; contact notes and contacted status are edited in the contact dialog.
  The dialog contains request errors, traps and restores focus, and scrolls within the viewport. Closing with its
  button or Escape flushes pending saves and keeps invalid or failed drafts open; backdrop clicks preserve the editor.
  Search, filters, and immediate moderation actions stay in their lists. New records still require explicit creation.

- Existing records in `/admin` autosave through `useAdminAutosave` and the shared `AdminSaveQueue`.
  Raw drafts remain dirty through validation failures and failed requests; writes are debounced and serialized,
  and polling must not replace an editor's draft. Editors stay open after autosave. Pending writes protect
  close/reload with the browser's native warning; admin links, section/record switches, and sign-out flush saves
  before leaving. Explicit API mutations share `requestAdminJson`/`protectAdminMutation` for in-flight protection.
  Creation and destructive actions remain explicit. Keep record editors keyed by their stable database identity.
  Immediate material unlocking shares its draft save. Poll updates return generated prepared-choice IDs; the editor
  carries them into subsequent saves while preserving newer text, so autosaving never recreates a saved choice.

- Event kinds are defined once in `lib/events/eventTypes.ts`; adding one should
  not require database migration or page-specific duplication. Terms ask for kind,
  online/place format, price, and capacity. Each kind also names where its landing
  page records registrations, which is the `placeName` of the contacts it gathers.
  A kind which names no landing page is held by somebody else: its terms carry the
  address they are held at, are refused without one, and this application runs no
  room, gathers no registration, and returns no payer to them.
- Which term a registration belongs to is decided once, in
  `lib/workshops/workshopRegistrations.ts`. A term is recognised by its slug, by
  its Prague day, and by the moment it begins at, so registrations written before
  terms had slugs keep counting. Registration forms write the term through the
  same line prefixes that rule reads back. Contacts are still gathered, recorded
  and shown only by `/admin/contacts`; counting reads nothing but their notes.
  The registration actions in workshop administration carry that same term filter
  into the contacts list and its exports.
- Workshop polls are read-only in workshop administration, except for the
  answers members wrote into them: an administrator approves, rejects, rewords,
  or deletes one together with the votes cast for it, and reads it named by the
  author who wrote it, while a moderator of the room owning the poll only
  decides about it from the room itself. Creating a new event
  publishes it by default; duplicating an event keeps it published unless the
  source is unpublished. Duplicating a workshop preserves its connections to
  the already existing attached polls; it creates no polls, options, votes, or room history. Stage settings contain
  the live stream, paid-recording start offset, and recording teaser; presentation settings the public presentation
  address, and project settings the repository the term is about, written as an
  address or as `owner/name`, together with its branch patterns. Deleting a workshop is a soft deletion: its room
  data and attached
  community polls stay stored, but the term leaves normal public and administrative
  lists and no longer holds its slug for a replacement. An end may be empty;
  admins can record, adjust, clear, and reopen it. Overview analytics are zoomable and share their
  room, section, lines, reaction, zoom, and keyword metrics through query params.
- Community administration is the workshop dashboard restricted to the
  `community` room kind: no room picker, schedule, stage, reactions, or address.
  Its membership view filters Stripe lifecycle, prices, discounts, identifiers,
  dates, test/live mode, and links to the exact Stripe checkout/subscription.
  Community analytics cover all measured time and member details show seen times.
- Shortener search, provenance filters, sorting, and selected click history live
  in GET parameters. Editing changes only shortcode, destinations, note, and
  landing page; deletion also deletes recorded clicks.

#### Database and verification

- Put database changes in `migrations/*.sql`. Startup and
  `npm run migrate-database` run `_initialize.sql`, then migrations in filename
  order, recording immutable filenames and checksums in `public."Migration"`.
  Changed or missing migrations fail, as do queries requiring an unapplied one.
- `npm run test-types` must build before `tsc` to refresh `.next/types`.
- `npm run test-e2e` uses the Next.js development server; first-request compile
  headroom belongs in `playwright.config.ts`, not individual tests. E2E tests are
  independent and retry once in a fresh browser context for transient failures;
  failed-attempt traces remain available. Each attempt archives one recording in
  `tests/e2e/videos/`, retaining only recent runs.

CODEX_PROMPT

--- raw output ---
ptbk-codex-login-method: chatgpt
Reading prompt from stdin...
OpenAI Codex v0.155.1
--------
workdir: /Users/hejny/work/aldaron
model: gpt-6-astra
provider: openai
approval: never
sandbox: danger-full-access
reasoning effort: max
reasoning summaries: none
session id: 01a0c42a-0ba3-7fb0-9319-588f2b109ee2
--------
user

## Your Task

Fix the existing test failures before implementing any queued coding tasks.

The verification command `npm run test-for-ptbk-coder` failed before coding started. Fix the underlying failure without weakening or removing the tests, and leave the project ready for the remaining coding prompts.

## Verification output

```
[..., test output truncated to the last 12000 characters...]
te sources, restores them, trims every track and exports playable editor material (7.2s)
  ✘  71 tests/e2e/recording-studio.spec.ts:81:5 › records separate sources, restores them, trims every track and exports playable editor material (retry #1) (7.2s)
  ✓  72 tests/e2e/recording-studio.spec.ts:162:5 › stops the whole take on disconnect and prevents a second tab from changing it (4.7s)
  ✓  73 tests/e2e/recording-studio.spec.ts:182:5 › recovers persisted chunks after an interrupted page and waits for stop before admin navigation (11.7s)
  ✓  74 tests/e2e/room-theme.spec.ts:96:5 › shares a saved room appearance, follows the device, and preserves the waiting-room form (14.4s)
  ✓  75 tests/e2e/room-theme.spec.ts:141:5 › themes connected rooms, materials, and portalled dialogs on desktop and mobile without losing drafts (13.1s)
  ✓  76 tests/e2e/workshop-agents.spec.ts:34:9 › defines a Book agent in the workshop administration (2.9s)
  ✓  77 tests/e2e/workshop-agents.spec.ts:34:9 › defines a Book agent in the community administration (6.5s)
  ✓  78 tests/e2e/workshop-repository-range.spec.ts:31:5 › edits independent commit bounds in workshop settings (2.9s)
  ✓  79 tests/e2e/workshop-repository-range.spec.ts:67:5 › previews the deployed app while browsing the highlighted workshop range (3.3s)
  ✓  80 tests/e2e/workshop-subtitles.spec.ts:63:5 › imports, autosaves, reloads and downloads private subtitles through the shared admin editor (2.5s)
  ✓  81 tests/e2e/workshop-subtitles.spec.ts:107:5 › decodes a long recording into bounded audio chunks and preserves multilingual timestamps (2.8s)
  ✓  82 tests/e2e/workshop-vercel-deployment.spec.ts:31:9 › deploys a workshop project and saves its ready URL through the existing settings form (6.3s)
  ✓  83 tests/e2e/workshop-vercel-deployment.spec.ts:31:9 › shows Vercel failure details and guidance, then saves the URL after retrying (11.6s)
  ✓  84 tests/e2e/workshop-wrap-up-pdf.spec.ts:34:5 › downloads the branded recap in the browser with local fonts, project preview, Git graph and short-link QR (2.8s)
Saved 79 E2E video(s) to tests/e2e/videos/.
Removed the E2E video(s) of 1 outdated run(s) from tests/e2e/videos/.


  1) tests/e2e/recording-studio.spec.ts:81:5 › records separate sources, restores them, trims every track and exports playable editor material 

    Error: expect(received).toHaveLength(expected)

    Expected length: 5
    Received length: 2
    Received array:  ["originals/01-camera.webm", "originals/02-camera.webm"]

       97 |     await page.getByRole('button', { name: 'Originály ZIP', exact: true }).click();
       98 |     const originals = await readArchive((await (await originalDownload).path())!);
    >  99 |     expect(Array.from(originals.keys()).filter((name) => name.startsWith('originals/'))).toHaveLength(5);
          |                                                                                          ^
      100 |     // Exercise the streaming disk path with a real writable file, without automating an OS save dialog.
      101 |     await page.evaluate(() => Object.defineProperty(window, 'showSaveFilePicker', {
      102 |         configurable: true, value: async () => (await navigator.storage.getDirectory()).getFileHandle('test-studio-export.zip', { create: true }),
        at /Users/hejny/work/aldaron/tests/e2e/recording-studio.spec.ts:99:90

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material/video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material/error-context.md

    attachment #4: trace (application/zip) ─────────────────────────────────────────────────────────
    tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material/trace.zip
    Usage:

        npx playwright show-trace tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

    Retry #1 ───────────────────────────────────────────────────────────────────────────────────────

    Error: expect(received).toHaveLength(expected)

    Expected length: 5
    Received length: 2
    Received array:  ["originals/01-camera.webm", "originals/02-camera.webm"]

       97 |     await page.getByRole('button', { name: 'Originály ZIP', exact: true }).click();
       98 |     const originals = await readArchive((await (await originalDownload).path())!);
    >  99 |     expect(Array.from(originals.keys()).filter((name) => name.startsWith('originals/'))).toHaveLength(5);
          |                                                                                          ^
      100 |     // Exercise the streaming disk path with a real writable file, without automating an OS save dialog.
      101 |     await page.evaluate(() => Object.defineProperty(window, 'showSaveFilePicker', {
      102 |         configurable: true, value: async () => (await navigator.storage.getDirectory()).getFileHandle('test-studio-export.zip', { create: true }),
        at /Users/hejny/work/aldaron/tests/e2e/recording-studio.spec.ts:99:90

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material-retry1/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material-retry1/video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material-retry1/error-context.md

    attachment #4: trace (application/zip) ─────────────────────────────────────────────────────────
    tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material-retry1/trace.zip
    Usage:

        npx playwright show-trace tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material-retry1/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

  2) tests/e2e/participant-promotion.spec.ts:50:9 › refreshes an author's pending total and submissions after trust on /cs/online-workshop/participant 

    Error: page.goto: net::ERR_NETWORK_IO_SUSPENDED at http://127.0.0.1:4009/cs/online-workshop/participant
    Call log:
      - navigating to "http://127.0.0.1:4009/cs/online-workshop/participant", waiting until "load"


      82 |         });
      83 |
    > 84 |         const response = await page.goto(pathname);
         |                                     ^
      85 |         test.skip(response?.status() === 404, 'The configured database has no published room for this route.');
      86 |         await expect(page.getByText(`Čeká na schválení: ${isCommunity ? 3 : 2}`, { exact: true })).toBeVisible();
      87 |         const authorProject = page.getByRole('article').filter({ has: page.getByRole('heading', { name: PROJECT_TITLE }) });
        at /Users/hejny/work/aldaron/tests/e2e/participant-promotion.spec.ts:84:37

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    tests/e2e/.artifacts/participant-promotion-refr-c986f-online-workshop-participant/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    tests/e2e/.artifacts/participant-promotion-refr-c986f-online-workshop-participant/video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: tests/e2e/.artifacts/participant-promotion-refr-c986f-online-workshop-participant/error-context.md

    attachment #4: trace (application/zip) ─────────────────────────────────────────────────────────
    tests/e2e/.artifacts/participant-promotion-refr-c986f-online-workshop-participant/trace.zip
    Usage:

        npx playwright show-trace tests/e2e/.artifacts/participant-promotion-refr-c986f-online-workshop-participant/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

  3) tests/e2e/participant-promotion.spec.ts:50:9 › refreshes an author's pending total and submissions after trust on /cs/komunita 

    Test timeout of 180000ms exceeded.

    Error: expect(locator).toBeVisible() failed

    Locator: getByText('Čeká na schválení: 3', { exact: true })
    Expected: visible
    Timeout: 30000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 30000ms
      - waiting for getByText('Čeká na schválení: 3', { exact: true })


      84 |         const response = await page.goto(pathname);
      85 |         test.skip(response?.status() === 404, 'The configured database has no published room for this route.');
    > 86 |         await expect(page.getByText(`Čeká na schválení: ${isCommunity ? 3 : 2}`, { exact: true })).toBeVisible();
         |                                                                                                    ^
      87 |         const authorProject = page.getByRole('article').filter({ has: page.getByRole('heading', { name: PROJECT_TITLE }) });
      88 |         if (isCommunity) await expect(authorProject.getByText('Čeká na schválení', { exact: true })).toBeVisible();
      89 |
        at /Users/hejny/work/aldaron/tests/e2e/participant-promotion.spec.ts:86:100

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    tests/e2e/.artifacts/participant-promotion-refr-a049d--after-trust-on-cs-komunita/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    tests/e2e/.artifacts/participant-promotion-refr-a049d--after-trust-on-cs-komunita/video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: tests/e2e/.artifacts/participant-promotion-refr-a049d--after-trust-on-cs-komunita/error-context.md

    attachment #4: trace (application/zip) ─────────────────────────────────────────────────────────
    tests/e2e/.artifacts/participant-promotion-refr-a049d--after-trust-on-cs-komunita/trace.zip
    Usage:

        npx playwright show-trace tests/e2e/.artifacts/participant-promotion-refr-a049d--after-trust-on-cs-komunita/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

  1 failed
    tests/e2e/recording-studio.spec.ts:81:5 › records separate sources, restores them, trims every track and exports playable editor material 
  2 flaky
    tests/e2e/participant-promotion.spec.ts:50:9 › refreshes an author's pending total and submissions after trust on /cs/online-workshop/participant 
    tests/e2e/participant-promotion.spec.ts:50:9 › refreshes an author's pending total and submissions after trust on /cs/komunita 
  2 skipped
  76 passed (21.0m)
[1]-  Exit 1                  bash "$1"
```

-   Keep in mind the DRY _(don't repeat yourself)_ principle.
-   Do a proper analysis of the current functionality before you start implementing.
-   Add the changes into the [changelog](CHANGELOG.md)
-   Update the [README](README.md) if needed.
-   Update the [AGENTS.md](AGENTS.md) for the next job to be done if it makes sense.

## Your Behavior

You are Developer
You are a helpful, honest, and intelligent AI assistant. Your goal is to provide accurate, clear, and concise responses while being friendly and engaging. Think step-by-step before answering complex questions.

### Rules

-   If you're unsure about something, say so and offer to look it up or clarify.
-   You can use Markdown formatting in the messages like **bold** or *italic*
-   You can use Markdown code blocks if needed

For example:

```javascript
console.log('Hello');
```
-   Keep in mind the DRY _(don't repeat yourself)_ principle.
-   Keep in mind the SOLID principles.
-   Do a proper analysis of the current functionality before you start implementing.
-   Keep small responsibilities of functions and classes, avoid creating big functions or classes that do many things.
-   Constants should always be `UPPER_SNAKE_CASE`.
-   Boolean variables should always be prefixed with `is`, for example `isUserChatJobLeaseExpired` or `IS_DEBUG_MODE`.
-   Do not use abbreviations, for example use `isExpired` instead of `isExp`, `translateMessage` instead of `t`, etc.
It is fine to use well-known abbreviations, for example `id`, `url`, `html`, etc.

### Prompt suffix
-   If you're unsure about something, say so and offer to look it up or clarify.
-   You can use Markdown formatting in the messages like **bold** or *italic*
-   You can use Markdown code blocks if needed

For example:

```javascript
console.log('Hello');
```
-   Keep in mind the DRY _(don't repeat yourself)_ principle.
-   Keep in mind the SOLID principles.
-   Do a proper analysis of the current functionality before you start implementing.
-   Keep small responsibilities of functions and classes, avoid creating big functions or classes that do many things.
-   Constants should always be `UPPER_SNAKE_CASE`.
-   Boolean variables should always be prefixed with `is`, for example `isUserChatJobLeaseExpired` or `IS_DEBUG_MODE`.
-   Do not use abbreviations, for example use `isExpired` instead of `isExp`, `translateMessage` instead of `t`, etc.
It is fine to use well-known abbreviations, for example `id`, `url`, `html`, etc.

## Context

### Context

This repository contains Promptbook landing pages for different businesses,
use cases, and audiences. Keep these rules current when behavior changes.

#### Public routes

- `/` redirects to `/cs` or `/en` using `Accept-Language`.
- `/cs` is the Czech homepage and source of truth for homepage structure and copy.
- `/en` is its English localization.
- `/pro-mesta`, `/pro-firmy`, `/for-agro`, `/for-industry`, `/ai-supervize`,
  `/hackathon-factory`, and `/pavol` are specialized landing pages. `/pavol`
  redirects to `/cs/pavol` or `/en/pavol`; the localized pages are Pavol Hejny's
  personal pages.
- `/ai-supervize-mini` is the Czech one-day AI Supervize page. Published terms,
  prices, capacities, places, FAQs, registration, and participant information
  come from `/admin/workshops`; with no published term it shows a notice.
  `/skoleni` redirects there.
- `/cs/online-workshop` lists free 60-minute online workshops about writing
  production code with AI agents. Each term has its own subject and description,
  but all use one registration form. `/cs/online-workshop/dekujeme` is the
  full-load conversion page; `/participant` is the live room. Its waiting room
  offers every published term as the same term cards the landing page registers
  with: running and upcoming ones first, with a special `Tento týden` badge for a
  term beginning within the next seven rolling days, then the ones which ended
  within the last day, and the older finished ones behind a disclosure.
  Picking one changes the room being connected to and the `workshop` parameter,
  without losing the name and e-mail already typed.
  After the recorded end, its wrap-up offers a PDF generated in the browser from a fresh authenticated room response.
  The recap uses the existing description and material text for its summary and key points, includes accessible
  materials and public presentation/project links, and preserves the room's publication, unlock and membership rules.
  Its printable A4 design uses the Promptbook logo, local Inter/Outfit fonts and the room's light palette. An
  authenticated export request creates an ad hoc short link for its room QR code, without carrying participant
  identity. Project previews reuse event-card metadata, with bounded public-image loading; the printed Git graph
  reuses the room's selected branches, inclusive range and lane layout, and labels any further history as available
  in the room. Missing external previews or history leave the recap and project links available.
  It stores no document and adds no administration or database fields; chat, feedback and participant identity are
  excluded from the export.
- `/ai-ta-krajta` reads episodes hourly from podcast RSS and YouTube feeds and
  merges their host rosters with `businesses/ai-ta-krajta/aiTaKrajtaEpisodes.json`. Its shared platform list exposes
  the publisher's direct RSS feed for custom podcast applications, and page metadata advertises it as
  `application/rss+xml`.
  Each episode lists every credited person by name, and every person any source
  credits has a card in `aiTaKrajtaPeople.ts`, which a test keeps in step, so a
  credited person never misses their portrait and the filter cannot lose them.
  It keeps exact episode counts but labels subscriptions and listening hours as
  estimates. The fixed mini-player, newest-episode header button, person/search/
  episode/play/archive/collaboration filters, and section hash are shareable as
  query/hash state; the snake game is local state. Person clicks filter episodes.
  Everyone in the roster shows a portrait, cut by
  `scripts/_cutAiTaKrajtaPeoplePortraits.mjs` out of the episode cover the show
  itself published them on, or out of the picture they publish of themselves when
  no cover carries them; the roster names only the file, and a person without one
  keeps the initials on the brand gradient. The one people list is drawn anew
  for every visit, weighted by how many episodes of the archive name each
  person, so somebody heard often comes up high far more often than someone in
  one díl without the list ever becoming a ranking. The draw is local state and
  is made in the browser; the page itself is built in the order the draw leans
  towards, from the most often named person to the least often named one, so the
  browser hydrates into the list it was sent.
  Collaboration submissions use `/admin/contacts`. Its tab icon is the page's
  own snake drawing in `/ai-ta-krajta/logo.svg` and `.png`; SVG corners are
  rounded and transparent, while the raster fills its square. That drawing is
  traced off the cover artwork of the show and recorded once in
  `businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork.ts`, together with the
  measurements of the animal along its own length. The snake of the minigame
  starts in exactly that shape, in the frame the still logo occupied, and only
  then eases into the proportions, colours and speed of a game snake.
  A seven-cell Promptbook coder terminal floats in the bottom-right corner and
  clears the player and cookie controls. It types `$ ptbk`, then animates an
  ASCII octopus in response to pointer, focus, scrolling, and the snake terrarium.
  It stays still for reduced motion and pauses its clock in hidden tabs. The
  badge and the shared footer credit link to `https://coder.ptbk.io/`.
- `/ai-ta-krajta/media-kit` and `/ai-ta-krajta/branding` are the two pages beside
  the podcast. They are named once, in `AI_TA_KRAJTA_SUBPAGES`, which the footer
  lists and which they point at each other through, so no link can name a page
  differently than the page names itself. Both wear the same compact header,
  section heading and footer as each other. The brand kit hands out the logo the
  site already serves at `/ai-ta-krajta/logo.svg`, `.png` and the cover artwork,
  publishes no colour outside `AI_TA_KRAJTA_COLORS`, and says how the name is
  written; it asks for nothing and sends visitors to the media-kit form.
- `/cs/komunita` is the permanent Czech community room. It has chat, polls,
  projects, materials, and published terms, but no schedule, stage, or live
  updates. Terms show event kind, format/place, price, and status; wherever their
  shared mini card is drawn, it shows no star ratings and may show a wide preview
  of its connected project with its title, description, and repository. An ended
  term may show the video length minus the configured recording start offset as
  a replay badge. Card data includes no feedback. Where a term stands in
  time is decided
  once, in `lib/workshops/workshopPhase.ts`, as one of
  five phases: ongoing, freshly past while it ended within the last
  `FRESHLY_PAST_WORKSHOP_HOURS`, upcoming within the next seven rolling days,
  other upcoming, and past. Every list, badge, and calendar colour reads that one
  answer, and everything which opens after a workshop — the wrap-up, the feedback,
  the recording — treats freshly past as over. A term with a
  live room links there; a term of an event held elsewhere opens its organizer's
  address in a new tab; otherwise it links to its landing page. The calendar
  opens on the member's month, can filter by day, and uses the same terms and
  statuses as the cards. Empty days cannot be selected; an empty month is only
  selected when the member's month has no terms. The room offers Google Calendar
  and `webcal:` subscriptions.
- `/cs/komunita/projects` is the full project gallery, ordered by upvotes.
  `/cs/komunita/projects/<project_id>` shows scraped project details and a
  moderated discussion. Project-room sessions derive from the community session;
  the author moderates their own discussion.
- `/cs/komunita/clenstvi` offers free community access and the 199 Kč monthly
  membership. Webinars remain free; paid access adds recordings, archive,
  materials, extra content, priority questions, and Discord/community features.
  The page is prefilled from `fullname` and `email`, supports community discount
  codes, has no new annual plan or trial, and allows cancellation.
- `/cs/komunita/calendar.ics` publishes the same terms by stable slug, so moved
  or renamed terms update existing subscriptions. It contains only event terms
  and public destinations, never subscriber identity.
- `/admin/workshops` manages terms of every event kind, participants, comments,
  reactions, content, attached community polls, and settings. Every term says both
  of its audiences: the people registered on the landing page of its event, and
  the people who entered its room. A room which is no term of an event says
  nothing about registrations at all. The registration block opens the exact
  filtered `/admin/contacts` list and its shared CSV, vCard, and Book exports;
  it never creates a second contact table or serializer in workshop administration.
  Its term picker gives ongoing, freshly past, next-seven-day, and later upcoming
  terms their own categories, because a term which has only just been held is
  still being wrapped up and one beginning soon needs preparation; only past terms
  stay behind its history disclosure. Its unobtrusive display-settings control
  keeps every artificial activity tool — prepared chat comments, reaction and
  vote adjustments, and the artificial watching count — out of a shared screen
  by default; `artopts=on` reveals them and `artopts=off` keeps them hidden.
- `/admin/workshops?tab=subtitles` manages private Czech, English and mixed-language video subtitle tracks.
  Tracks store plain text with original-video timestamps, source video/file and provenance independently of room
  responses. Admins can import SRT/WebVTT, try existing YouTube captions (authored before automatic), or generate
  subtitles from an original recording through OpenAI. Browser media decoding sends bounded audio chunks and adds
  their positions once; recording offsets do not alter stored times. Generation produces a reviewable draft, creation
  is explicit, and existing tracks use the shared autosaved editor. Changed source videos are labelled, imports never
  overwrite existing tracks, and no participant endpoint or public database role exposes subtitles.
- `/admin/community` manages the permanent community, including polls, project
  moderation, participants, memberships, payments, and room analytics.
- `/admin/recording-studio` records any number of available cameras, screen shares,
  and optional microphones as separate local tracks. One capture coordinator starts
  and stops them on a shared clock; losing a source or a storage write stops the take.
  IndexedDB commits each chunk together with its counters, and an exclusive browser
  lock protects recording, recovery, editing and deletion across tabs. Size and
  remaining-time estimates use browser quota and the combined recording bitrate,
  keeping a storage reserve. Saved takes survive reload; unfinished ones expose only
  persisted chunks. The shared admin editor autosaves one trim range for every track.
  ZIP64 exports preserve originals and timing metadata and can include actual trimmed
  copies; trimming uses browser codecs and temporary local files, never an upload.
  Capture and export reuse admin navigation/sign-out/reload protection. No server or
  database storage is added.
- `/admin/shortener` manages public short links, QR/UTM output, destinations,
  notes, search/filter/sort state, and private click history. Links are served
  by `/[shortcode]`; `/shortener` redirects to the admin page.
- `/admin/login` authenticates the single `admin` account with `ADMIN_PASSWORD`
  and a signed session cookie. All `/admin/*` pages and APIs require
  `requireAdminSignedIn`. `/admin` is the post-login dashboard.
- Other public/legal routes include `/contact`, `/data-deletion`, `/privacy`,
  `/terms`, `/dekujeme`, `/branding`, and the routes under `/k`, `/old`, and
  `/test`.

#### Shared community and workshop behavior

- Community and workshop participant rooms, including waiting rooms and community project views, share light,
  dark, and device appearance through `WorkshopRoomThemeProvider` and `workshopRoomTheme.css`. The browser remembers
  the choice across rooms and tabs; changing it preserves form and room state. Room palette tokens also reach
  portalled membership/project dialogs and cookie controls. Public landing pages and administration keep their own
  appearance.

- The global cookie banner shares its page palette with its settings dialog, uses
  a shallow bottom strip on desktop and an inset panel on phones, and reserves its
  measured height so the end of each page stays reachable. Fixed bottom controls
  such as the podcast player and admin table scrollbar opt into clearance through
  `data-fixed-bottom-control`; the banner, booking notice, and coder badge measure
  their neighbors through `hooks/useFixedControlClearance.ts`.

- Rooms lead to each other in both directions, through one identity hand-off. The
  community lists the terms and opens the room of each; an invited workshop room
  places its community link beside its materials as a special material for every
  participant, regardless of paid membership. Where a special material sits is
  decided once, in `lib/workshops/workshopSpecialMaterials.ts`: a card says where
  among the ordinary materials it belongs, and the invitation opens the material
  list of a participant who does not pay while it closes the list of a paying
  member. A membership which is not loaded yet leaves it where a participant who
  does not pay reads it. Both carry the connected member's
  name and email on, and an incomplete identity carries nothing rather than half
  of it. Which rooms invite is answered by
  `lib/workshops/workshopKindCapabilities.ts`; the community and project
  discussions do not. The invitation names the community's sections by the names
  the community itself uses.
- Community polls attached to workshops are shared. A normalized email gives a
  member one vote across the community and all attached workshops. An
  administrator can enable an Other answer: a member-written response becomes
  one shared, anonymous option and receives that member's vote atomically, so
  every room can vote for it; later poll edits keep member-written answers.
  Such an answer goes through the very moderation a chat message does, by the
  one shared submission policy in `lib/workshops/workshopSubmissionStatus.ts`:
  it is pending until the shared AI review or a moderator approves it, while a trusted member and a
  moderator have theirs approved as they write it. The vote of its writer is
  counted at once either way, but until the answer is approved only its writer
  and the moderators of the room owning the poll receive it or its vote, and a
  rejected answer is gone for everybody. Who may read one answer is decided
  once, in `lib/workshops/workshopPollOptionVisibility.ts`.
  Workshops may display and accept votes, but the community owns administration.
  Where a room puts its polls is decided once, in
  `lib/workshops/workshopPollPlacement.ts`: the community, which decides in its
  own polls, opens with them, while a workshop, which is only their subject,
  keeps them below the materials it was held for.
- The participant room owns the membership badge and popup. Community and live
  workshop rooms use the same membership for the connecting email, and checkout
  returns to the room where it started. Membership is offered only by room kinds
  listed in `lib/workshops/workshopKindCapabilities.ts`; project discussions do
  not offer it.
- Members can open Stripe Customer Portal from the popup. In-app cancellation
  stops only the next renewal, preserves access through the paid period, appears
  in the badge, and can be reversed before that period ends.
- A full-price-for-the-whole-term discount is a voucher: atomically consume it,
  create membership immediately, ask for no card, and create no Stripe renewal.
  A limited-month discount still opens checkout because the regular price returns.
  Stripe webhooks update completed, cancelled, failed, and late payments. With no
  Stripe key, hide membership; with test keys, identify the test payment gate.
- Community projects use a URL-first metadata wizard. Ordinary submissions await
  AI or manual moderation; trusted members and moderators are approved immediately. Pending
  projects remain visible to their author and moderators.
- A live workshop room has countdown, YouTube stage, reactions, watching count,
  moderated chat, timed materials, and attached poll aggregates. An open-ended
  term runs until its recorded end; its stage does not end automatically. Admins
  can select, replace, clear, or create the displayed comment through the same
  private realtime channel used by reactions.
- Workshop and community chat can use reusable Book agents, administered in their shared Agents tab with
  `BookEditor` from `@promptbook/components`. `LiteAgent` from `@promptbook/node` uses `OPENAI_API_KEY`; definitions
  are shared while replies, listening and cooldowns are enabled per room. Only newly approved comments enqueue
  replies, including artificial and other agent messages, with at most two agent turns. A durable database queue
  owns leases, deduplication and rechecks of moderation, agent settings and room state before publication.
  Public messages use the existing chat rendering; admin projections and exports distinguish `user`, `artificial`
  and `agent` origins with agent/run provenance. Agents have no participant sessions or membership access.
  Live questions require an administrator's active stream-tab or microphone capture in the Agents tab; audio is
  transcribed in short standalone segments and never saved. Private transcripts feed the agents only during an
  ongoing workshop and only from its current, unexpired capture session. Stopping capture or ending the workshop
  prevents its pending live questions from publishing; publication locks that session against a concurrent stop.
  Project rooms and externally organized events offer no agents. Persistent servers run the queue in the background;
  serverless hosts can use the authenticated scheduler route documented in `README.md`.
- A term can be about a project. The connection is one value — GitHub repository,
  the default branch, and one or more branch patterns such as `main`, `client-*`,
  `feature/*`, or `*` for all branches, plus any number of public deployment
  addresses, written one per line — so it is set, changed, and unset at once and
  neither branch selection nor deployment
  outlives its repository. Room kinds which offer it are named in
  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository as a
  special material beside its ordinary materials for every participant, with its
  links, every deployment and newest commits, marking those which arrive while a
  participant watches;
  a newly found commit is broadcast to active rooms and appears on the stage for
  ten seconds. A selection resolving to multiple branches is shown as a commit
  graph. Commits come from the public commit feed or keyless API, pooled once per
  server and cached through the revalidation window; an unreadable feed still
  leaves the room naming its project. A project deployed once is opened as the live
  application of the workshop; several deployments are each named by their own
  address, and the first of them is the one a term card and the participant project panel are previewed from.
  Both reuse the deployment's image, title and description through the shared project preview; missing metadata or
  a broken image keeps the deployment address visible, with repository-only previews reserved for undeployed projects.
  The participant preview opens that deployment and loads independently of room state and commits, through an
  authenticated endpoint using the stored project. Changing rooms, repositories or the primary deployment discards
  stale previews. Community term cards keep their workshop destination.
  With a repository and no deployment URL, administration offers direct Vercel deployment using private `VERCEL_TOKEN`
  and optional `VERCEL_TEAM_ID`. One Vercel project per repository stays connected to its original GitHub source and
  deploys its production branch (initially the default branch), independently of the workshop's history selection.
  Administration polls the build and fills in its assigned production alias only when ready; the ordinary settings
  save publishes that URL. Manual URLs, a changed repository, and switching rooms discard stale pending results.
  Deployment failures show the reported reason and code, targeted recovery steps, and an optional bounded build-log
  excerpt with credentials redacted. Canceled, blocked, and alias-assignment failures have distinct guidance; missing
  diagnostics keep fallback checks and the Vercel link available. Only authenticated administration receives them.
  This adds no workshop data fields; setup and retry behavior are documented in `README.md`.
  The connection can also carry independent starting and ending commit IDs. Administration previews each commit's
  message, author and Prague date, and can fill each bound separately from the workshop time (first commit at or after
  the start, last at or before the end). Bounds are inclusive by commit time across the selected branches. The room
  initially shows and highlights that range; expanding and paging its graph reveals history outside it while retaining
  the highlight. An omitted bound leaves that side open; two omitted bounds leave the history unfiltered. Every lookup,
  autofill and history page uses the same branch selection, and commits belonging only to other branches stay hidden.
- A workshop can carry one public presentation URL for a PDF, PowerPoint file, or
  GitHub Markdown page. The room renders it beside ordinary materials through the
  shared material card, primary action, and QR code, for every participant without
  making it timed or membership-gated content.
- Paid-only materials are decided on the server in one pass. Members receive
  unlocked material; others receive only the published titles as an offer. An
  untitled item is not named, items are not named before their unlock time, and a
  room without membership hides paid-only items without naming them.
- After a workshop ends, its recording is server-gated to members. Others receive
  the published teaser, or a generic offer when no teaser exists; a term without
  a recording offers nothing. An administrator writes the recording's start
  offset as hours, minutes and seconds, while it stays stored, exported and read
  in seconds; it applies only to that paid replay and never to the countdown or
  live stream.
- Pending chat messages, member-written poll answers, and community projects use
  `lib/workshops/workshopAutoApproval.ts` for optional AI approval after saving.
  `WORKSHOP_AUTO_APPROVAL_API_KEY` enables it; the model and HTTPS base URL are
  configurable. Only clearly suitable content is approved; uncertainty, missing
  configuration, invalid output, and an eight-second timeout leave it pending.
  The database approves only unchanged pending content from a currently unbanned
  author and privately records the item, model, and time. AI never rejects, edits,
  grants trust, or replaces a human decision. It reviews text and URL metadata,
  without fetching linked pages or preview images. Moderator-created materials
  require no review, and old pending submissions are not bulk-processed.
- Trusted participants remain invisible and their messages are auto-approved.
  Granting trust or moderator status also approves every pending submission by that room-local participant — chat,
  member-written poll answers, and community projects — in the same database transaction. Rejected items stay
  rejected; a ban blocks this approval until it is lifted. The private pending-submission view supplies both this
  approval and the complete per-person counts in room moderation and administrative participant lists. Community
  project cards refresh with the room without resetting the submission form.
  Moderators see pending messages, can approve/reject/correct/pin them, and can
  trust or silence authors. An administrator in `/admin/workshops` and a moderator
  in a workshop room can also turn any comment into an ordinary, immediately
  available material. That preserves the comment in chat, carries its complete
  Markdown body into the material, and names its author in the material title;
  both entry points use the shared material creation path, including its short
  links and room refresh. Workshop and community moderators are appointed in
  `/admin/workshops`; project authors moderate their own discussions.
- The room records whether each open browser is actively or passively attended
  from pointer, typing, scroll, and touch activity. Admin analytics distinguish
  active computer users from merely open tabs with dashed audience lines.
- The community's compact gallery shows its five highest-upvoted approved projects
  and links to the full gallery. Community landing content is read from the live
  room: expose only anonymous totals, approved messages, and shared projects;
  show member first names only. If the room cannot be read, show less content,
  not an error. Landing-page reactions are estimates based on recent room data.

#### Administration and data rules

- Workshop and community settings render their shared `WorkshopSettingsForm` directly in the Settings tab,
  with autosave and navigation protection. Other admin creation and editing use the shared `AdminEditorDialog`
  (and `AdminEditorButton` for a local trigger).
  Lists show summaries and edit actions; contact notes and contacted status are edited in the contact dialog.
  The dialog contains request errors, traps and restores focus, and scrolls within the viewport. Closing with its
  button or Escape flushes pending saves and keeps invalid or failed drafts open; backdrop clicks preserve the editor.
  Search, filters, and immediate moderation actions stay in their lists. New records still require explicit creation.

- Existing records in `/admin` autosave through `useAdminAutosave` and the shared `AdminSaveQueue`.
  Raw drafts remain dirty through validation failures and failed requests; writes are debounced and serialized,
  and polling must not replace an editor's draft. Editors stay open after autosave. Pending writes protect
  close/reload with the browser's native warning; admin links, section/record switches, and sign-out flush saves
  before leaving. Explicit API mutations share `requestAdminJson`/`protectAdminMutation` for in-flight protection.
  Creation and destructive actions remain explicit. Keep record editors keyed by their stable database identity.
  Immediate material unlocking shares its draft save. Poll updates return generated prepared-choice IDs; the editor
  carries them into subsequent saves while preserving newer text, so autosaving never recreates a saved choice.

- Event kinds are defined once in `lib/events/eventTypes.ts`; adding one should
  not require database migration or page-specific duplication. Terms ask for kind,
  online/place format, price, and capacity. Each kind also names where its landing
  page records registrations, which is the `placeName` of the contacts it gathers.
  A kind which names no landing page is held by somebody else: its terms carry the
  address they are held at, are refused without one, and this application runs no
  room, gathers no registration, and returns no payer to them.
- Which term a registration belongs to is decided once, in
  `lib/workshops/workshopRegistrations.ts`. A term is recognised by its slug, by
  its Prague day, and by the moment it begins at, so registrations written before
  terms had slugs keep counting. Registration forms write the term through the
  same line prefixes that rule reads back. Contacts are still gathered, recorded
  and shown only by `/admin/contacts`; counting reads nothing but their notes.
  The registration actions in workshop administration carry that same term filter
  into the contacts list and its exports.
- Workshop polls are read-only in workshop administration, except for the
  answers members wrote into them: an administrator approves, rejects, rewords,
  or deletes one together with the votes cast for it, and reads it named by the
  author who wrote it, while a moderator of the room owning the poll only
  decides about it from the room itself. Creating a new event
  publishes it by default; duplicating an event keeps it published unless the
  source is unpublished. Duplicating a workshop preserves its connections to
  the already existing attached polls; it creates no polls, options, votes, or room history. Stage settings contain
  the live stream, paid-recording start offset, and recording teaser; presentation settings the public presentation
  address, and project settings the repository the term is about, written as an
  address or as `owner/name`, together with its branch patterns. Deleting a workshop is a soft deletion: its room
  data and attached
  community polls stay stored, but the term leaves normal public and administrative
  lists and no longer holds its slug for a replacement. An end may be empty;
  admins can record, adjust, clear, and reopen it. Overview analytics are zoomable and share their
  room, section, lines, reaction, zoom, and keyword metrics through query params.
- Community administration is the workshop dashboard restricted to the
  `community` room kind: no room picker, schedule, stage, reactions, or address.
  Its membership view filters Stripe lifecycle, prices, discounts, identifiers,
  dates, test/live mode, and links to the exact Stripe checkout/subscription.
  Community analytics cover all measured time and member details show seen times.
- Shortener search, provenance filters, sorting, and selected click history live
  in GET parameters. Editing changes only shortcode, destinations, note, and
  landing page; deletion also deletes recorded clicks.

#### Database and verification

- Put database changes in `migrations/*.sql`. Startup and
  `npm run migrate-database` run `_initialize.sql`, then migrations in filename
  order, recording immutable filenames and checksums in `public."Migration"`.
  Changed or missing migrations fail, as do queries requiring an unapplied one.
- `npm run test-types` must build before `tsc` to refresh `.next/types`.
- `npm run test-e2e` uses the Next.js development server; first-request compile
  headroom belongs in `playwright.config.ts`, not individual tests. E2E tests are
  independent and retry once in a fresh browser context for transient failures;
  failed-attempt traces remain available. Each attempt archives one recording in
  `tests/e2e/videos/`, retaining only recent runs.


codex
I’ll inspect the recording and ZIP export flow, reproduce the failure, and fix the cause without weakening the tests. Then I’ll update the changelog and run the full verification command.

exec
/bin/zsh -lc 'cat AGENTS.md' in /Users/hejny/work/aldaron
 succeeded in 0ms:
## Context

This repository contains Promptbook landing pages for different businesses,
use cases, and audiences. Keep these rules current when behavior changes.

### Public routes

- `/` redirects to `/cs` or `/en` using `Accept-Language`.
- `/cs` is the Czech homepage and source of truth for homepage structure and copy.
- `/en` is its English localization.
- `/pro-mesta`, `/pro-firmy`, `/for-agro`, `/for-industry`, `/ai-supervize`,
  `/hackathon-factory`, and `/pavol` are specialized landing pages. `/pavol`
  redirects to `/cs/pavol` or `/en/pavol`; the localized pages are Pavol Hejny's
  personal pages.
- `/ai-supervize-mini` is the Czech one-day AI Supervize page. Published terms,
  prices, capacities, places, FAQs, registration, and participant information
  come from `/admin/workshops`; with no published term it shows a notice.
  `/skoleni` redirects there.
- `/cs/online-workshop` lists free 60-minute online workshops about writing
  production code with AI agents. Each term has its own subject and description,
  but all use one registration form. `/cs/online-workshop/dekujeme` is the
  full-load conversion page; `/participant` is the live room. Its waiting room
  offers every published term as the same term cards the landing page registers
  with: running and upcoming ones first, with a special `Tento týden` badge for a
  term beginning within the next seven rolling days, then the ones which ended
  within the last day, and the older finished ones behind a disclosure.
  Picking one changes the room being connected to and the `workshop` parameter,
  without losing the name and e-mail already typed.
  After the recorded end, its wrap-up offers a PDF generated in the browser from a fresh authenticated room response.
  The recap uses the existing description and material text for its summary and key points, includes accessible
  materials and public presentation/project links, and preserves the room's publication, unlock and membership rules.
  Its printable A4 design uses the Promptbook logo, local Inter/Outfit fonts and the room's light palette. An
  authenticated export request creates an ad hoc short link for its room QR code, without carrying participant
  identity. Project previews reuse event-card metadata, with bounded public-image loading; the printed Git graph
  reuses the room's selected branches, inclusive range and lane layout, and labels any further history as available
  in the room. Missing external previews or history leave the recap and project links available.
  It stores no document and adds no administration or database fields; chat, feedback and participant identity are
  excluded from the export.
- `/ai-ta-krajta` reads episodes hourly from podcast RSS and YouTube feeds and
  merges their host rosters with `businesses/ai-ta-krajta/aiTaKrajtaEpisodes.json`. Its shared platform list exposes
  the publisher's direct RSS feed for custom podcast applications, and page metadata advertises it as
  `application/rss+xml`.
  Each episode lists every credited person by name, and every person any source
  credits has a card in `aiTaKrajtaPeople.ts`, which a test keeps in step, so a
  credited person never misses their portrait and the filter cannot lose them.
  It keeps exact episode counts but labels subscriptions and listening hours as
  estimates. The fixed mini-player, newest-episode header button, person/search/
  episode/play/archive/collaboration filters, and section hash are shareable as
  query/hash state; the snake game is local state. Person clicks filter episodes.
  Everyone in the roster shows a portrait, cut by
  `scripts/_cutAiTaKrajtaPeoplePortraits.mjs` out of the episode cover the show
  itself published them on, or out of the picture they publish of themselves when
  no cover carries them; the roster names only the file, and a person without one
  keeps the initials on the brand gradient. The one people list is drawn anew
  for every visit, weighted by how many episodes of the archive name each
  person, so somebody heard often comes up high far more often than someone in
  one díl without the list ever becoming a ranking. The draw is local state and
  is made in the browser; the page itself is built in the order the draw leans
  towards, from the most often named person to the least often named one, so the
  browser hydrates into the list it was sent.
  Collaboration submissions use `/admin/contacts`. Its tab icon is the page's
  own snake drawing in `/ai-ta-krajta/logo.svg` and `.png`; SVG corners are
  rounded and transparent, while the raster fills its square. That drawing is
  traced off the cover artwork of the show and recorded once in
  `businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork.ts`, together with the
  measurements of the animal along its own length. The snake of the minigame
  starts in exactly that shape, in the frame the still logo occupied, and only
  then eases into the proportions, colours and speed of a game snake.
  A seven-cell Promptbook coder terminal floats in the bottom-right corner and
  clears the player and cookie controls. It types `$ ptbk`, then animates an
  ASCII octopus in response to pointer, focus, scrolling, and the snake terrarium.
  It stays still for reduced motion and pauses its clock in hidden tabs. The
  badge and the shared footer credit link to `https://coder.ptbk.io/`.
- `/ai-ta-krajta/media-kit` and `/ai-ta-krajta/branding` are the two pages beside
  the podcast. They are named once, in `AI_TA_KRAJTA_SUBPAGES`, which the footer
  lists and which they point at each other through, so no link can name a page
  differently than the page names itself. Both wear the same compact header,
  section heading and footer as each other. The brand kit hands out the logo the
  site already serves at `/ai-ta-krajta/logo.svg`, `.png` and the cover artwork,
  publishes no colour outside `AI_TA_KRAJTA_COLORS`, and says how the name is
  written; it asks for nothing and sends visitors to the media-kit form.
- `/cs/komunita` is the permanent Czech community room. It has chat, polls,
  projects, materials, and published terms, but no schedule, stage, or live
  updates. Terms show event kind, format/place, price, and status; wherever their
  shared mini card is drawn, it shows no star ratings and may show a wide preview
  of its connected project with its title, description, and repository. An ended
  term may show the video length minus the configured recording start offset as
  a replay badge. Card data includes no feedback. Where a term stands in
  time is decided
  once, in `lib/workshops/workshopPhase.ts`, as one of
  five phases: ongoing, freshly past while it ended within the last
  `FRESHLY_PAST_WORKSHOP_HOURS`, upcoming within the next seven rolling days,
  other upcoming, and past. Every list, badge, and calendar colour reads that one
  answer, and everything which opens after a workshop — the wrap-up, the feedback,
  the recording — treats freshly past as over. A term with a
  live room links there; a term of an event held elsewhere opens its organizer's
  address in a new tab; otherwise it links to its landing page. The calendar
  opens on the member's month, can filter by day, and uses the same terms and
  statuses as the cards. Empty days cannot be selected; an empty month is only
  selected when the member's month has no terms. The room offers Google Calendar
  and `webcal:` subscriptions.
- `/cs/komunita/projects` is the full project gallery, ordered by upvotes.
  `/cs/komunita/projects/<project_id>` shows scraped project details and a
  moderated discussion. Project-room sessions derive from the community session;
  the author moderates their own discussion.
- `/cs/komunita/clenstvi` offers free community access and the 199 Kč monthly
  membership. Webinars remain free; paid access adds recordings, archive,
  materials, extra content, priority questions, and Discord/community features.
  The page is prefilled from `fullname` and `email`, supports community discount
  codes, has no new annual plan or trial, and allows cancellation.
- `/cs/komunita/calendar.ics` publishes the same terms by stable slug, so moved
  or renamed terms update existing subscriptions. It contains only event terms
  and public destinations, never subscriber identity.
- `/admin/workshops` manages terms of every event kind, participants, comments,
  reactions, content, attached community polls, and settings. Every term says both
  of its audiences: the people registered on the landing page of its event, and
  the people who entered its room. A room which is no term of an event says
  nothing about registrations at all. The registration block opens the exact
  filtered `/admin/contacts` list and its shared CSV, vCard, and Book exports;
  it never creates a second contact table or serializer in workshop administration.
  Its term picker gives ongoing, freshly past, next-seven-day, and later upcoming
  terms their own categories, because a term which has only just been held is
  still being wrapped up and one beginning soon needs preparation; only past terms
  stay behind its history disclosure. Its unobtrusive display-settings control
  keeps every artificial activity tool — prepared chat comments, reaction and
  vote adjustments, and the artificial watching count — out of a shared screen
  by default; `artopts=on` reveals them and `artopts=off` keeps them hidden.
- `/admin/workshops?tab=subtitles` manages private Czech, English and mixed-language video subtitle tracks.
  Tracks store plain text with original-video timestamps, source video/file and provenance independently of room
  responses. Admins can import SRT/WebVTT, try existing YouTube captions (authored before automatic), or generate
  subtitles from an original recording through OpenAI. Browser media decoding sends bounded audio chunks and adds
  their positions once; recording offsets do not alter stored times. Generation produces a reviewable draft, creation
  is explicit, and existing tracks use the shared autosaved editor. Changed source videos are labelled, imports never
  overwrite existing tracks, and no participant endpoint or public database role exposes subtitles.
- `/admin/community` manages the permanent community, including polls, project
  moderation, participants, memberships, payments, and room analytics.
- `/admin/recording-studio` records any number of available cameras, screen shares,
  and optional microphones as separate local tracks. One capture coordinator starts
  and stops them on a shared clock; losing a source or a storage write stops the take.
  IndexedDB commits each chunk together with its counters, and an exclusive browser
  lock protects recording, recovery, editing and deletion across tabs. Size and
  remaining-time estimates use browser quota and the combined recording bitrate,
  keeping a storage reserve. Saved takes survive reload; unfinished ones expose only
  persisted chunks. The shared admin editor autosaves one trim range for every track.
  ZIP64 exports preserve originals and timing metadata and can include actual trimmed
  copies; trimming uses browser codecs and temporary local files, never an upload.
  Capture and export reuse admin navigation/sign-out/reload protection. No server or
  database storage is added.
- `/admin/shortener` manages public short links, QR/UTM output, destinations,
  notes, search/filter/sort state, and private click history. Links are served
  by `/[shortcode]`; `/shortener` redirects to the admin page.
- `/admin/login` authenticates the single `admin` account with `ADMIN_PASSWORD`
  and a signed session cookie. All `/admin/*` pages and APIs require
  `requireAdminSignedIn`. `/admin` is the post-login dashboard.
- Other public/legal routes include `/contact`, `/data-deletion`, `/privacy`,
  `/terms`, `/dekujeme`, `/branding`, and the routes under `/k`, `/old`, and
  `/test`.

### Shared community and workshop behavior

- Community and workshop participant rooms, including waiting rooms and community project views, share light,
  dark, and device appearance through `WorkshopRoomThemeProvider` and `workshopRoomTheme.css`. The browser remembers
  the choice across rooms and tabs; changing it preserves form and room state. Room palette tokens also reach
  portalled membership/project dialogs and cookie controls. Public landing pages and administration keep their own
  appearance.

- The global cookie banner shares its page palette with its settings dialog, uses
  a shallow bottom strip on desktop and an inset panel on phones, and reserves its
  measured height so the end of each page stays reachable. Fixed bottom controls
  such as the podcast player and admin table scrollbar opt into clearance through
  `data-fixed-bottom-control`; the banner, booking notice, and coder badge measure
  their neighbors through `hooks/useFixedControlClearance.ts`.

- Rooms lead to each other in both directions, through one identity hand-off. The
  community lists the terms and opens the room of each; an invited workshop room
  places its community link beside its materials as a special material for every
  participant, regardless of paid membership. Where a special material sits is
  decided once, in `lib/workshops/workshopSpecialMaterials.ts`: a card says where
  among the ordinary materials it belongs, and the invitation opens the material
  list of a participant who does not pay while it closes the list of a paying
  member. A membership which is not loaded yet leaves it where a participant who
  does not pay reads it. Both carry the connected member's
  name and email on, and an incomplete identity carries nothing rather than half
  of it. Which rooms invite is answered by
  `lib/workshops/workshopKindCapabilities.ts`; the community and project
  discussions do not. The invitation names the community's sections by the names
  the community itself uses.
- Community polls attached to workshops are shared. A normalized email gives a
  member one vote across the community and all attached workshops. An
  administrator can enable an Other answer: a member-written response becomes
  one shared, anonymous option and receives that member's vote atomically, so
  every room can vote for it; later poll edits keep member-written answers.
  Such an answer goes through the very moderation a chat message does, by the
  one shared submission policy in `lib/workshops/workshopSubmissionStatus.ts`:
  it is pending until the shared AI review or a moderator approves it, while a trusted member and a
  moderator have theirs approved as they write it. The vote of its writer is
  counted at once either way, but until the answer is approved only its writer
  and the moderators of the room owning the poll receive it or its vote, and a
  rejected answer is gone for everybody. Who may read one answer is decided
  once, in `lib/workshops/workshopPollOptionVisibility.ts`.
  Workshops may display and accept votes, but the community owns administration.
  Where a room puts its polls is decided once, in
  `lib/workshops/workshopPollPlacement.ts`: the community, which decides in its
  own polls, opens with them, while a workshop, which is only their subject,
  keeps them below the materials it was held for.
- The participant room owns the membership badge and popup. Community and live
  workshop rooms use the same membership for the connecting email, and checkout
  returns to the room where it started. Membership is offered only by room kinds
  listed in `lib/workshops/workshopKindCapabilities.ts`; project discussions do
  not offer it.
- Members can open Stripe Customer Portal from the popup. In-app cancellation
  stops only the next renewal, preserves access through the paid period, appears
  in the badge, and can be reversed before that period ends.
- A full-price-for-the-whole-term discount is a voucher: atomically consume it,
  create membership immediately, ask for no card, and create no Stripe renewal.
  A limited-month discount still opens checkout because the regular price returns.
  Stripe webhooks update completed, cancelled, failed, and late payments. With no
  Stripe key, hide membership; with test keys, identify the test payment gate.
- Community projects use a URL-first metadata wizard. Ordinary submissions await
  AI or manual moderation; trusted members and moderators are approved immediately. Pending
  projects remain visible to their author and moderators.
- A live workshop room has countdown, YouTube stage, reactions, watching count,
  moderated chat, timed materials, and attached poll aggregates. An open-ended
  term runs until its recorded end; its stage does not end automatically. Admins
  can select, replace, clear, or create the displayed comment through the same
  private realtime channel used by reactions.
- Workshop and community chat can use reusable Book agents, administered in their shared Agents tab with
  `BookEditor` from `@promptbook/components`. `LiteAgent` from `@promptbook/node` uses `OPENAI_API_KEY`; definitions
  are shared while replies, listening and cooldowns are enabled per room. Only newly approved comments enqueue
  replies, including artificial and other agent messages, with at most two agent turns. A durable database queue
  owns leases, deduplication and rechecks of moderation, agent settings and room state before publication.
  Public messages use the existing chat rendering; admin projections and exports distinguish `user`, `artificial`
  and `agent` origins with agent/run provenance. Agents have no participant sessions or membership access.
  Live questions require an administrator's active stream-tab or microphone capture in the Agents tab; audio is
  transcribed in short standalone segments and never saved. Private transcripts feed the agents only during an
  ongoing workshop and only from its current, unexpired capture session. Stopping capture or ending the workshop
  prevents its pending live questions from publishing; publication locks that session against a concurrent stop.
  Project rooms and externally organized events offer no agents. Persistent servers run the queue in the background;
  serverless hosts can use the authenticated scheduler route documented in `README.md`.
- A term can be about a project. The connection is one value — GitHub repository,
  the default branch, and one or more branch patterns such as `main`, `client-*`,
  `feature/*`, or `*` for all branches, plus any number of public deployment
  addresses, written one per line — so it is set, changed, and unset at once and
  neither branch selection nor deployment
  outlives its repository. Room kinds which offer it are named in
  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository as a
  special material beside its ordinary materials for every participant, with its
  links, every deployment and newest commits, marking those which arrive while a
  participant watches;
  a newly found commit is broadcast to active rooms and appears on the stage for
  ten seconds. A selection resolving to multiple branches is shown as a commit
  graph. Commits come from the public commit feed or keyless API, pooled once per
  server and cached through the revalidation window; an unreadable feed still
  leaves the room naming its project. A project deployed once is opened as the live
  application of the workshop; several deployments are each named by their own
  address, and the first of them is the one a term card and the participant project panel are previewed from.
  Both reuse the deployment's image, title and description through the shared project preview; missing metadata or
  a broken image keeps the deployment address visible, with repository-only previews reserved for undeployed projects.
  The participant preview opens that deployment and loads independently of room state and commits, through an
  authenticated endpoint using the stored project. Changing rooms, repositories or the primary deployment discards
  stale previews. Community term cards keep their workshop destination.
  With a repository and no deployment URL, administration offers direct Vercel deployment using private `VERCEL_TOKEN`
  and optional `VERCEL_TEAM_ID`. One Vercel project per repository stays connected to its original GitHub source and
  deploys its production branch (initially the default branch), independently of the workshop's history selection.
  Administration polls the build and fills in its assigned production alias only when ready; the ordinary settings
  save publishes that URL. Manual URLs, a changed repository, and switching rooms discard stale pending results.
  Deployment failures show the reported reason and code, targeted recovery steps, and an optional bounded build-log
  excerpt with credentials redacted. Canceled, blocked, and alias-assignment failures have distinct guidance; missing
  diagnostics keep fallback checks and the Vercel link available. Only authenticated administration receives them.
  This adds no workshop data fields; setup and retry behavior are documented in `README.md`.
  The connection can also carry independent starting and ending commit IDs. Administration previews each commit's
  message, author and Prague date, and can fill each bound separately from the workshop time (first commit at or after
  the start, last at or before the end). Bounds are inclusive by commit time across the selected branches. The room
  initially shows and highlights that range; expanding and paging its graph reveals history outside it while retaining
  the highlight. An omitted bound leaves that side open; two omitted bounds leave the history unfiltered. Every lookup,
  autofill and history page uses the same branch selection, and commits belonging only to other branches stay hidden.
- A workshop can carry one public presentation URL for a PDF, PowerPoint file, or
  GitHub Markdown page. The room renders it beside ordinary materials through the
  shared material card, primary action, and QR code, for every participant without
  making it timed or membership-gated content.
- Paid-only materials are decided on the server in one pass. Members receive
  unlocked material; others receive only the published titles as an offer. An
  untitled item is not named, items are not named before their unlock time, and a
  room without membership hides paid-only items without naming them.
- After a workshop ends, its recording is server-gated to members. Others receive
  the published teaser, or a generic offer when no teaser exists; a term without
  a recording offers nothing. An administrator writes the recording's start
  offset as hours, minutes and seconds, while it stays stored, exported and read
  in seconds; it applies only to that paid replay and never to the countdown or
  live stream.
- Pending chat messages, member-written poll answers, and community projects use
  `lib/workshops/workshopAutoApproval.ts` for optional AI approval after saving.
  `WORKSHOP_AUTO_APPROVAL_API_KEY` enables it; the model and HTTPS base URL are
  configurable. Only clearly suitable content is approved; uncertainty, missing
  configuration, invalid output, and an eight-second timeout leave it pending.
  The database approves only unchanged pending content from a currently unbanned
  author and privately records the item, model, and time. AI never rejects, edits,
  grants trust, or replaces a human decision. It reviews text and URL metadata,
  without fetching linked pages or preview images. Moderator-created materials
  require no review, and old pending submissions are not bulk-processed.
- Trusted participants remain invisible and their messages are auto-approved.
  Granting trust or moderator status also approves every pending submission by that room-local participant — chat,
  member-written poll answers, and community projects — in the same database transaction. Rejected items stay
  rejected; a ban blocks this approval until it is lifted. The private pending-submission view supplies both this
  approval and the complete per-person counts in room moderation and administrative participant lists. Community
  project cards refresh with the room without resetting the submission form.
  Moderators see pending messages, can approve/reject/correct/pin them, and can
  trust or silence authors. An administrator in `/admin/workshops` and a moderator
  in a workshop room can also turn any comment into an ordinary, immediately
  available material. That preserves the comment in chat, carries its complete
  Markdown body into the material, and names its author in the material title;
  both entry points use the shared material creation path, including its short
  links and room refresh. Workshop and community moderators are appointed in
  `/admin/workshops`; project authors moderate their own discussions.
- The room records whether each open browser is actively or passively attended
  from pointer, typing, scroll, and touch activity. Admin analytics distinguish
  active computer users from merely open tabs with dashed audience lines.
- The community's compact gallery shows its five highest-upvoted approved projects
  and links to the full gallery. Community landing content is read from the live
  room: expose only anonymous totals, approved messages, and shared projects;
  show member first names only. If the room cannot be read, show less content,
  not an error. Landing-page reactions are estimates based on recent room data.

### Administration and data rules

- Workshop and community settings render their shared `WorkshopSettingsForm` directly in the Settings tab,
  with autosave and navigation protection. Other admin creation and editing use the shared `AdminEditorDialog`
  (and `AdminEditorButton` for a local trigger).
  Lists show summaries and edit actions; contact notes and contacted status are edited in the contact dialog.
  The dialog contains request errors, traps and restores focus, and scrolls within the viewport. Closing with its
  button or Escape flushes pending saves and keeps invalid or failed drafts open; backdrop clicks preserve the editor.
  Search, filters, and immediate moderation actions stay in their lists. New records still require explicit creation.

- Existing records in `/admin` autosave through `useAdminAutosave` and the shared `AdminSaveQueue`.
  Raw drafts remain dirty through validation failures and failed requests; writes are debounced and serialized,
  and polling must not replace an editor's draft. Editors stay open after autosave. Pending writes protect
  close/reload with the browser's native warning; admin links, section/record switches, and sign-out flush saves
  before leaving. Explicit API mutations share `requestAdminJson`/`protectAdminMutation` for in-flight protection.
  Creation and destructive actions remain explicit. Keep record editors keyed by their stable database identity.
  Immediate material unlocking shares its draft save. Poll updates return generated prepared-choice IDs; the editor
  carries them into subsequent saves while preserving newer text, so autosaving never recreates a saved choice.

- Event kinds are defined once in `lib/events/eventTypes.ts`; adding one should
  not require database migration or page-specific duplication. Terms ask for kind,
  online/place format, price, and capacity. Each kind also names where its landing
  page records registrations, which is the `placeName` of the contacts it gathers.
  A kind which names no landing page is held by somebody else: its terms carry the
  address they are held at, are refused without one, and this application runs no
  room, gathers no registration, and returns no payer to them.
- Which term a registration belongs to is decided once, in
  `lib/workshops/workshopRegistrations.ts`. A term is recognised by its slug, by
  its Prague day, and by the moment it begins at, so registrations written before
  terms had slugs keep counting. Registration forms write the term through the
  same line prefixes that rule reads back. Contacts are still gathered, recorded
  and shown only by `/admin/contacts`; counting reads nothing but their notes.
  The registration actions in workshop administration carry that same term filter
  into the contacts list and its exports.
- Workshop polls are read-only in workshop administration, except for the
  answers members wrote into them: an administrator approves, rejects, rewords,
  or deletes one together with the votes cast for it, and reads it named by the
  author who wrote it, while a moderator of the room owning the poll only
  decides about it from the room itself. Creating a new event
  publishes it by default; duplicating an event keeps it published unless the
  source is unpublished. Duplicating a workshop preserves its connections to
  the already existing attached polls; it creates no polls, options, votes, or room history. Stage settings contain
  the live stream, paid-recording start offset, and recording teaser; presentation settings the public presentation
  address, and project settings the repository the term is about, written as an
  address or as `owner/name`, together with its branch patterns. Deleting a workshop is a soft deletion: its room
  data and attached
  community polls stay stored, but the term leaves normal public and administrative
  lists and no longer holds its slug for a replacement. An end may be empty;
  admins can record, adjust, clear, and reopen it. Overview analytics are zoomable and share their
  room, section, lines, reaction, zoom, and keyword metrics through query params.
- Community administration is the workshop dashboard restricted to the
  `community` room kind: no room picker, schedule, stage, reactions, or address.
  Its membership view filters Stripe lifecycle, prices, discounts, identifiers,
  dates, test/live mode, and links to the exact Stripe checkout/subscription.
  Community analytics cover all measured time and member details show seen times.
- Shortener search, provenance filters, sorting, and selected click history live
  in GET parameters. Editing changes only shortcode, destinations, note, and
  landing page; deletion also deletes recorded clicks.

### Database and verification

- Put database changes in `migrations/*.sql`. Startup and
  `npm run migrate-database` run `_initialize.sql`, then migrations in filename
  order, recording immutable filenames and checksums in `public."Migration"`.
  Changed or missing migrations fail, as do queries requiring an unapplied one.
- `npm run test-types` must build before `tsc` to refresh `.next/types`.
- `npm run test-e2e` uses the Next.js development server; first-request compile
  headroom belongs in `playwright.config.ts`, not individual tests. E2E tests are
  independent and retry once in a fresh browser context for transient failures;
  failed-attempt traces remain available. Each attempt archives one recording in
  `tests/e2e/videos/`, retaining only recent runs.

exec
/bin/zsh -lc "pwd && git status --short && rg --files -g 'AGENTS.md' -g 'package.json' -g 'playwright.config.*' -g '*recording*' -g 'CHANGELOG.md' -g 'README.md' -g '*participant-promotion*'" in /Users/hejny/work/aldaron
 succeeded in 0ms:
/Users/hejny/work/aldaron
?? prompts/2026-09-0550-fix-the-existing-test-failures-before-implementing-any.md
AGENTS.md
playwright.config.ts
prompts/2026-09-0440-admin-recording-studio.md
prompts/traces/2026-09-0440-admin-recording-studio.md
package.json
CHANGELOG.md
tests/e2e/participant-promotion.spec.ts
public/fonts/workshop/README.md
tests/e2e/videos/2026-09-21T13-31-23-942Z-67-recording-studio-stops-the-39a4e-second-tab-from-changing-it-video-1.webm
tests/e2e/recording-studio.spec.ts
tests/e2e/videos/2026-09-21T03-31-35-948Z-61-recording-studio-records-s-695a6-ts-playable-editor-material-video.webm
README.md
tests/e2e/videos/2026-09-21T03-31-35-948Z-63-recording-studio-requires-8e374-on-for-the-recording-studio-video.webm
tests/e2e/videos/2026-09-21T13-31-23-942Z-68-recording-studio-stops-the-39a4e-second-tab-from-changing-it-video.webm
tests/e2e/videos/2026-09-21T03-31-35-948Z-62-recording-studio-recovers-71e7c-top-before-admin-navigation-video.webm
tests/e2e/videos/2026-09-21T03-31-35-948Z-65-recording-studio-stops-the-39a4e-second-tab-from-changing-it-video.webm
tests/e2e/videos/2026-09-21T03-31-35-948Z-19-participant-promotion-refr-c986f-online-workshop-participant-video.webm
tests/e2e/videos/2026-09-21T13-31-23-942Z-66-recording-studio-requires-8e374-on-for-the-recording-studio-video.webm
tests/e2e/videos/2026-09-21T03-31-35-948Z-18-participant-promotion-refr-a049d-after-trust-on-cs-komunita-video.webm
tests/e2e/videos/2026-09-21T13-31-23-942Z-20-participant-promotion-refr-c986f-online-workshop-participant-video.webm
tests/e2e/videos/2026-09-21T13-31-23-942Z-18-participant-promotion-refr-a049d-after-trust-on-cs-komunita-video.webm
tests/e2e/videos/2026-09-21T03-31-35-948Z-64-recording-studio-stops-the-39a4e-second-tab-from-changing-it-video-1.webm
tests/e2e/videos/2026-09-21T13-31-23-942Z-64-recording-studio-records-s-695a6-ts-playable-editor-material-retry1-video.webm
tests/e2e/videos/2026-09-21T13-31-23-942Z-65-recording-studio-recovers-71e7c-top-before-admin-navigation-video.webm
tests/e2e/videos/2026-09-21T13-31-23-942Z-21-participant-promotion-refr-c986f-online-workshop-participant-retry1-video.webm
tests/e2e/videos/2026-09-21T13-31-23-942Z-19-participant-promotion-refr-a049d-after-trust-on-cs-komunita-retry1-video.webm
tests/e2e/videos/2026-09-21T13-31-23-942Z-63-recording-studio-records-s-695a6-ts-playable-editor-material-video.webm
lib/recording-studio/recordingStudioStorage.ts
lib/recording-studio/recordingStudioTiming.ts
lib/recording-studio/recordingStudioTiming.test.ts
lib/recording-studio/recordingStudioDevices.ts
lib/recording-studio/recordingStudioLock.ts
lib/recording-studio/recordingStudioTestUtilities.ts
lib/recording-studio/recordingStudioStorage.test.ts
lib/recording-studio/recordingStudioTrim.ts
lib/recording-studio/recordingStudioExport.test.ts
lib/recording-studio/recordingStudioTypes.ts
lib/recording-studio/recordingStudioExport.ts
migrations/2026-09-1600-workshop-recording-start-offset.sql

exec
/bin/zsh -lc "cat package.json playwright.config.ts && sed -n '1,270p' tests/e2e/recording-studio.spec.ts" in /Users/hejny/work/aldaron
 succeeded in 0ms:
{
    "name": "promptbook-landing-page",
    "version": "0.1.0",
    "private": true,
    "scripts": {
        "dev": "npx kill-port 4009 && next dev -p 4009",
        "build": "next build",
        "start": "next start",
        "lint": "next lint",
        "test": "vitest run",
        "test-e2e": "playwright test",
        "test-e2e:headed": "playwright test --headed",
        "test-types": "npm run build && tsc",
        "migrate-database": "tsx scripts/migrate-database.ts",
        "backup-database": "tsx scripts/backup-database.ts",
        "backup-database:verify": "tsx scripts/backup-database-verify.ts",
        "delete-test-data": "tsx scripts/delete-test-data.ts",
        "test-for-ptbk-coder": "npm run lint && npx kill-port 4009 && npm run test-types && npm run test-e2e && npm run delete-test-data",
        "export": "next build",
        "coder:generate-boilerplates": "npx ptbk coder generate-boilerplates --template ./prompts/templates/common.md",
        "coder:run": "npx ptbk coder run --harness claude-code --model claude-opus-5 --thinking-level max --agent agents/developer.book --context AGENTS.md --test npm run test-for-ptbk-coder --test-before yes-and-fix  --auto-push --auto-pull",
        "coder:run:openai": "npx ptbk coder run --harness openai-codex --model gpt-5.6-terra --thinking-level max --agent agents/developer.book --context AGENTS.md --test npm run test-for-ptbk-coder --test-before yes-and-fix  --auto-push --auto-pull",
        "coder:find-refactor-candidates": "npx ptbk coder find-refactor-candidates",
        "coder:verify": "npx ptbk coder verify --order from-latest --commit --auto-pull --auto-push",
        "coder:add": "npx ptbk coder add --template ./prompts/templates/common.md"
    },
    "dependencies": {
        "@hookform/resolvers": "^5.0.1",
        "@promptbook/components": "0.114.0-40",
        "@promptbook/node": "0.114.0-40",
        "@radix-ui/react-accordion": "^1.2.3",
        "@radix-ui/react-alert-dialog": "^1.1.6",
        "@radix-ui/react-aspect-ratio": "^1.1.2",
        "@radix-ui/react-avatar": "^1.1.3",
        "@radix-ui/react-checkbox": "^1.1.4",
        "@radix-ui/react-collapsible": "^1.1.3",
        "@radix-ui/react-context-menu": "^2.2.6",
        "@radix-ui/react-dialog": "^1.1.6",
        "@radix-ui/react-dropdown-menu": "^2.1.6",
        "@radix-ui/react-hover-card": "^1.1.6",
        "@radix-ui/react-label": "^2.1.2",
        "@radix-ui/react-menubar": "^1.1.6",
        "@radix-ui/react-navigation-menu": "^1.2.5",
        "@radix-ui/react-popover": "^1.1.6",
        "@radix-ui/react-progress": "^1.1.2",
        "@radix-ui/react-radio-group": "^1.2.3",
        "@radix-ui/react-scroll-area": "^1.2.3",
        "@radix-ui/react-select": "^2.1.6",
        "@radix-ui/react-separator": "^1.1.2",
        "@radix-ui/react-slider": "^1.2.3",
        "@radix-ui/react-slot": "^1.1.2",
        "@radix-ui/react-switch": "^1.1.3",
        "@radix-ui/react-tabs": "^1.1.3",
        "@radix-ui/react-toast": "^1.2.6",
        "@radix-ui/react-toggle": "^1.1.2",
        "@radix-ui/react-toggle-group": "^1.1.2",
        "@radix-ui/react-tooltip": "^1.1.8",
        "@supabase/ssr": "^0.7.0",
        "@supabase/supabase-js": "^2.57.2",
        "@zip.js/zip.js": "^2.16.0",
        "class-variance-authority": "^0.7.1",
        "clsx": "^2.1.1",
        "cmdk": "^1.1.1",
        "date-fns": "^3.6.0",
        "dotenv": "^16.4.7",
        "embla-carousel-react": "^8.5.2",
        "framer-motion": "^12.6.3",
        "input-otp": "^1.4.2",
        "js-yaml": "^4.1.0",
        "leaflet": "^1.9.4",
        "logrocket": "^12.1.1",
        "lucide-react": "^0.487.0",
        "marked": "^18.0.13",
        "mediabunny": "^1.58.1",
        "moment": "^2.30.1",
        "next": "15.2.6",
        "next-themes": "^0.4.6",
        "pdfmake": "^0.3.11",
        "pg": "^8.16.3",
        "react": "^18.3.1",
        "react-day-picker": "^8.10.1",
        "react-dom": "^18.3.1",
        "react-hook-form": "^7.55.0",
        "react-qr-code": "^2.0.18",
        "react-resizable-panels": "^2.1.7",
        "react-use-measure": "^2.1.7",
        "recharts": "^2.15.1",
        "sharp": "^0.34.4",
        "sonner": "^2.0.3",
        "spacetrim": "^0.11.60",
        "stripe": "^22.6.0",
        "tailwind-merge": "^3.1.0",
        "tw-animate-css": "^1.2.5",
        "vaul": "^1.1.2",
        "zod": "^3.24.2"
    },
    "devDependencies": {
        "@babel/eslint-parser": "^7.27.1",
        "@electric-sql/pglite": "^0.3.14",
        "@eslint/eslintrc": "^3",
        "@playwright/test": "^1.62.1",
        "@testing-library/jest-dom": "^6.6.3",
        "@testing-library/react": "^16.3.0",
        "@total-typescript/ts-reset": "^0.6.1",
        "@types/js-yaml": "^4.0.9",
        "@types/lodash": "^4.17.20",
        "@types/node": "^20",
        "@types/pdfmake": "^0.3.3",
        "@types/pg": "^8.15.5",
        "@types/react": "^19",
        "@types/react-dom": "^19",
        "autoprefixer": "^10.4.21",
        "eslint": "^9",
        "eslint-config-next": "15.2.4",
        "fake-indexeddb": "^6.2.5",
        "jsdom": "^26.0.0",
        "postcss": "^8.5.3",
        "ptbk": "^0.114.0-40",
        "raw-loader": "^4.0.2",
        "tailwindcss": "^3.4.17",
        "tailwindcss-animate": "^1.0.7",
        "tsx": "^4.19.4",
        "typescript": "^5",
        "vitest": "^3.1.1"
    }
}
import 'dotenv/config';
import { defineConfig } from '@playwright/test';

/**
 * How long a cold Next.js start or one E2E test may take, compilation included
 *
 * Note: This is the shared cold-start budget for the server and every E2E test, so neither a slow first server
 *       readiness check nor a route reached first can be reported as broken merely for having been compiled.
 */
const E2E_COLD_COMPILATION_TEST_TIMEOUT_MS = 180_000;

/**
 * A browser assertion can be the first request for a lazily loaded client-side editor. Keep its cold compilation
 * allowance next to the suite-wide test allowance instead of making individual tests depend on implementation timing.
 */
const E2E_COLD_COMPONENT_EXPECT_TIMEOUT_MS = 30_000;

const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4009';
const usesExternalServer = process.env.E2E_BASE_URL !== undefined;
const usesIsolatedInMemorySupabase = !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

export default defineConfig({
    testDir: './tests/e2e',
    outputDir: './tests/e2e/.artifacts',
    fullyParallel: false,
    workers: 1,
    // A cold development server or the configured external database can fail transiently. Retry the whole test in
    // a fresh browser context once; keep its assertions and failed-attempt trace, and still fail persistent errors.
    retries: 1,
    // The Next.js development server compiles a page or an API endpoint the first time a test reaches it, so the first
    // test which visits a page or submits into an endpoint pays for that compilation on top of its own work. The
    // budget of one test is therefore that compilation headroom rather than the time its assertions need.
    timeout: E2E_COLD_COMPILATION_TEST_TIMEOUT_MS,
    expect: {
        timeout: E2E_COLD_COMPONENT_EXPECT_TIMEOUT_MS,
    },
    reporter: 'list',
    globalTeardown: './tests/e2e/globalTeardown.ts',
    use: {
        baseURL,
        viewport: { width: 1440, height: 900 },
        video: { mode: 'on', size: { width: 1280, height: 720 } },
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
    },
    webServer: usesExternalServer
        ? undefined
        : {
              command: 'npx next dev -p 4009',
              url: baseURL,
              reuseExistingServer: !process.env.CI,
              timeout: E2E_COLD_COMPILATION_TEST_TIMEOUT_MS,
              // The test server exercises the public API without running or repairing
              // migrations as a side effect.
              // Without a service role key, the same endpoints use an isolated in-memory
              // store so local verification does not depend on a private credential.
              // It also keeps every route it compiled for the whole run, so that a route
              // is never disposed and rebuilt underneath a later test.
              // Next does not replace explicitly empty environment values from .env.
              env: {
                  ...process.env,
                  DATABASE_URL: '',
                  E2E_IN_MEMORY_SUPABASE: usesIsolatedInMemorySupabase ? 'true' : '',
                  E2E_KEEP_COMPILED_ROUTES: 'true',
              },
          },
});
import { expect, test, type Page } from '@playwright/test';
import { ZipReader, Uint8ArrayReader, Uint8ArrayWriter } from '@zip.js/zip.js';
import { ALL_FORMATS, BufferSource, Input } from 'mediabunny';
import { readFile } from 'node:fs/promises';
import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/admin/adminConstants';
import { createAdminSessionValueOrNull } from '@/lib/admin/adminSession';
import type { RecordingArchiveManifest } from '@/lib/recording-studio/recordingStudioTypes';

test.use({ serviceWorkers: 'block' });

async function openStudio(page: Page, baseURL: string | undefined) {
    test.skip(!process.env.ADMIN_PASSWORD, 'Needs the local test server admin password.');
    await page.context().addCookies([{ name: ADMIN_SESSION_COOKIE_NAME, value: createAdminSessionValueOrNull()!, url: baseURL!, httpOnly: true, sameSite: 'Lax' }]);
    await page.addInitScript(() => {
        // Only replace physical devices/the permission picker. Recording, storage, codecs and ZIP are real.
        const streams: MediaStream[] = [];
        Object.assign(window, { studioTestStreams: streams });
        const createStream = (isVideo: boolean, isAudio: boolean) => {
            const stream = new MediaStream();
            if (isVideo) {
                const canvas = document.createElement('canvas');
                canvas.width = 320; canvas.height = 180;
                const context = canvas.getContext('2d')!;
                const draw = () => {
                    context.fillStyle = streams.length % 2 ? '#08b' : '#b60';
                    context.fillRect(0, 0, 320, 180);
                    context.fillStyle = '#fff'; context.font = '24px sans-serif';
                    context.fillText(String(performance.now()), 20, 90);
                };
                draw();
                const interval = setInterval(draw, 33);
                const videoTrack = canvas.captureStream(30).getVideoTracks()[0];
                videoTrack.addEventListener('ended', () => clearInterval(interval));
                stream.addTrack(videoTrack);
            }
            if (isAudio) {
                const context = new AudioContext();
                const oscillator = context.createOscillator();
                const destination = context.createMediaStreamDestination();
                oscillator.connect(destination); oscillator.start();
                stream.addTrack(destination.stream.getAudioTracks()[0]);
                void context.resume();
            }
            streams.push(stream);
            return Promise.resolve(stream);
        };
        Object.defineProperties(navigator.mediaDevices, {
            getUserMedia: { value: (constraints: MediaStreamConstraints) => createStream(Boolean(constraints.video), Boolean(constraints.audio)) },
            getDisplayMedia: { value: () => createStream(true, true) },
            enumerateDevices: { value: () => Promise.resolve([]) },
        });
        Object.defineProperty(window, 'showSaveFilePicker', { value: undefined, configurable: true });
    });
    await page.goto('/admin/recording-studio');
    await expect(page.getByRole('button', { name: 'Přidat zdroj', exact: true })).toBeEnabled();
}

async function addSource(page: Page, kind: 'camera' | 'screen' | 'microphone') {
    await page.getByRole('button', { name: 'Přidat zdroj', exact: true }).click();
    await page.getByLabel('Typ zdroje').selectOption(kind);
    await page.getByRole('button', { name: 'Připojit zdroj', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
}

async function readArchive(pathname: string) {
    const reader = new ZipReader(new Uint8ArrayReader(await readFile(pathname)));
    const entries = await reader.getEntries();
    const files = new Map<string, Uint8Array>();
    for (const entry of entries) {
        if (!entry.directory) files.set(entry.filename, await entry.getData(new Uint8ArrayWriter()));
    }
    await reader.close();
    return files;
}

test('requires admin authentication for the recording studio', async ({ page }) => {
    await page.goto('/admin/recording-studio');
    await expect(page).toHaveURL(/\/admin\/login\?redirectPath=%2Fadmin%2Frecording-studio/);
});

test('records separate sources, restores them, trims every track and exports playable editor material', async ({ page, baseURL }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await openStudio(page, baseURL);
    await addSource(page, 'camera');
    await addSource(page, 'camera');
    await addSource(page, 'screen');
    await addSource(page, 'screen');
    await addSource(page, 'microphone');
    await page.getByRole('button', { name: 'Nahrávat všechny zdroje', exact: true }).click();
    await expect(page.getByLabel('Délka záznamu', { exact: true })).toHaveText('00:00:04');
    await page.getByRole('button', { name: 'Zastavit všechny stopy', exact: true }).click();
    await expect(page.getByText('Uloženo', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Odebrat zdroj' })).toHaveCount(0);

    const originalDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Originály ZIP', exact: true }).click();
    const originals = await readArchive((await (await originalDownload).path())!);
    expect(Array.from(originals.keys()).filter((name) => name.startsWith('originals/'))).toHaveLength(5);
    // Exercise the streaming disk path with a real writable file, without automating an OS save dialog.
    await page.evaluate(() => Object.defineProperty(window, 'showSaveFilePicker', {
        configurable: true, value: async () => (await navigator.storage.getDirectory()).getFileHandle('test-studio-export.zip', { create: true }),
    }));
    await page.getByRole('button', { name: 'Originály ZIP', exact: true }).click();
    await expect(page.getByText('ZIP je připravený.', { exact: true })).toBeVisible();
    const diskBytes = await page.evaluate(async () => Array.from(new Uint8Array(await (await (await (await navigator.storage.getDirectory()).getFileHandle('test-studio-export.zip')).getFile()).arrayBuffer())));
    const diskReader = new ZipReader(new Uint8ArrayReader(new Uint8Array(diskBytes)));
    expect((await diskReader.getEntries()).map((entry) => entry.filename)).toEqual(Array.from(originals.keys()));
    await diskReader.close();
    await page.evaluate(() => Object.defineProperty(window, 'showSaveFilePicker', { value: undefined, configurable: true }));
    await page.getByRole('button', { name: 'Náhled a ořez', exact: true }).click();
    await page.getByLabel('Název záznamu', { exact: true }).fill('Synchronized editing take');
    await page.getByLabel('Začátek (sekundy)', { exact: true }).fill('0.5');
    await page.getByLabel('Konec (sekundy)', { exact: true }).fill('2.5');
    await expect(page.getByRole('dialog').getByText('Změny se ukládají automaticky.', { exact: true })).toBeVisible();
    const preview = page.getByRole('dialog').locator('video').first();
    await preview.evaluate(async (video: HTMLVideoElement) => { video.muted = true; await video.play(); });
    await expect.poll(() => preview.evaluate((video: HTMLVideoElement) => video.currentTime)).toBeGreaterThan(0.65);
    await expect.poll(() => preview.evaluate((video: HTMLVideoElement) => video.paused)).toBe(true);
    expect(await preview.evaluate((video: HTMLVideoElement) => video.currentTime)).toBeLessThan(2.8);
    await page.screenshot({ path: testInfo.outputPath('recording-studio-editor.png') });
    await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click();
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Synchronized editing take', exact: true })).toBeVisible();
    const trimmedDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'ZIP s ořezem', exact: true }).click();
    const files = await readArchive((await (await trimmedDownload).path())!);
    const manifest = JSON.parse(new TextDecoder().decode(files.get('recording.json'))) as RecordingArchiveManifest;
    expect(manifest.trim).toEqual({ startSeconds: 0.5, endSeconds: 2.5 });
    expect(manifest.tracks).toHaveLength(5);
    for (let index = 0; index < manifest.tracks.length; index += 1) {
        const track = manifest.tracks[index];
        if (!track.originalFile || !track.trimmedFile) throw new Error('Expected original and trimmed files for every source.');
        expect(files.get(track.originalFile)).toEqual(originals.get(track.originalFile));
        const input = new Input({ formats: ALL_FORMATS, source: new BufferSource(files.get(track.trimmedFile)!) });
        try {
            expect(await input.canRead()).toBe(true);
            expect(await input.computeDuration()).toBeGreaterThan(1.8);
            expect(await input.computeDuration()).toBeLessThan(2.2);
            const videoTracks = await input.getVideoTracks();
            expect(videoTracks.length).toBe(index === 4 ? 0 : 1);
            if (videoTracks.length > 0) {
                expect(videoTracks[0].displayWidth).toBe(320);
                expect(videoTracks[0].displayHeight).toBe(180);
            }
            expect((await input.getAudioTracks()).length).toBe(index < 2 ? 0 : 1);
        } finally { input.dispose(); }
    }
    await page.screenshot({ path: testInfo.outputPath('recording-studio-desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole('button', { name: 'ZIP s ořezem', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('recording-studio-mobile.png'), fullPage: true });
    await page.getByRole('button', { name: 'Smazat', exact: true }).click();
    await page.getByRole('button', { name: 'Smazat záznam a všechny stopy', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Synchronized editing take' })).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole('button', { name: 'Originály ZIP', exact: true })).toHaveCount(0);
    expect(errors).toEqual([]);
});

test('stops the whole take on disconnect and prevents a second tab from changing it', async ({ page, baseURL }) => {
    await openStudio(page, baseURL);
    await addSource(page, 'camera');
    await addSource(page, 'screen');
    await page.getByRole('button', { name: 'Nahrávat všechny zdroje', exact: true }).click();
    await expect(page.getByLabel('Délka záznamu', { exact: true })).toHaveText('00:00:02');
    const secondPage = await page.context().newPage();
    await secondPage.goto('/admin/recording-studio');
    await expect(secondPage.getByRole('alert').filter({ hasText: 'Studio už' })).toContainText('jiné kartě');
    await secondPage.close();
    await page.evaluate(() => {
        const streams = (window as unknown as { studioTestStreams: MediaStream[] }).studioTestStreams;
        const track = streams[1].getVideoTracks()[0];
        track.stop(); track.dispatchEvent(new Event('ended'));
    });
    await expect(page.getByText('Přerušený záznam', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Originály ZIP', exact: true })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Zastavit všechny stopy', exact: true })).toHaveCount(0);
});

test('recovers persisted chunks after an interrupted page and waits for stop before admin navigation', async ({ page, baseURL }) => {
    await openStudio(page, baseURL);
    await addSource(page, 'camera');
    await addSource(page, 'screen');
    await page.getByRole('button', { name: 'Nahrávat všechny zdroje', exact: true }).click();
    await expect(page.getByLabel('Délka záznamu', { exact: true })).toHaveText('00:00:03');
    const dialogPromise = page.waitForEvent('dialog');
    const reload = page.evaluate(() => window.location.reload());
    const dialog = await dialogPromise;
    expect(dialog.type()).toBe('beforeunload');
    await dialog.accept();
    await reload.catch(() => undefined);
    await expect(page.getByText('Přerušený záznam', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Originály ZIP', exact: true })).toBeEnabled();
    await addSource(page, 'camera');
    await page.getByRole('button', { name: 'Nahrávat všechny zdroje', exact: true }).click();
    await expect(page.getByLabel('Délka záznamu', { exact: true })).toHaveText('00:00:02');
    await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/recording-studio$/);
    await page.getByRole('button', { name: 'Zastavit všechny stopy', exact: true }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await page.getByRole('link', { name: 'Nahrávací studio', exact: true }).click();
    await expect(page.getByText('Uloženo', { exact: true })).toBeVisible();
    await expect(page.getByText('Přerušený záznam', { exact: true })).toBeVisible();
});

exec
/bin/zsh -lc "rg --files lib/recording-studio components app | rg -i 'recording.?studio|RecordingCoordinator' && cat lib/recording-studio/recordingStudioExport.ts lib/recording-studio/recordingStudioDevices.ts" in /Users/hejny/work/aldaron
 succeeded in 0ms:
lib/recording-studio/recordingStudioStorage.ts
lib/recording-studio/recordingStudioTiming.ts
lib/recording-studio/recordingStudioTiming.test.ts
lib/recording-studio/RecordingStudioCapture.ts
lib/recording-studio/recordingStudioDevices.ts
lib/recording-studio/recordingStudioLock.ts
lib/recording-studio/recordingStudioTestUtilities.ts
lib/recording-studio/recordingStudioStorage.test.ts
lib/recording-studio/RecordingStudioCapture.test.ts
lib/recording-studio/recordingStudioTrim.ts
lib/recording-studio/recordingStudioExport.test.ts
lib/recording-studio/recordingStudioTypes.ts
lib/recording-studio/recordingStudioExport.ts
components/recording-studio/RecordingLibrary.tsx
components/recording-studio/RecordingStudio.tsx
components/recording-studio/RecordingEditor.tsx
components/recording-studio/RecordingSourcePreview.tsx
components/recording-studio/RecordingSourcePicker.tsx
components/recording-studio/useRecordingStudio.ts
app/admin/recording-studio/page.tsx
import { BlobReader, BlobWriter, TextReader, ZipWriter } from '@zip.js/zip.js';
import { downloadBlobFile } from '@/lib/downloadBlobFile';
import { readRecordingTrack } from './recordingStudioStorage';
import { getRecordingByteLength, validateRecordingTrim } from './recordingStudioTiming';
import type { RecordingArchiveManifest, RecordingArchiveTrack, StudioRecording } from './recordingStudioTypes';

const MAXIMUM_BUFFERED_EXPORT_BYTES = 256 * 1024 * 1024;

type SaveFilePickerWindow = Window & {
    showSaveFilePicker?: (options: { suggestedName: string; types: { description: string; accept: Record<string, string[]> }[] }) => Promise<FileSystemFileHandle>;
};

export function recordingFileStem(recording: StudioRecording): string {
    return `${recording.title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70) || 'recording'}-${recording.id.slice(0, 8)}`;
}

/** Must be invoked before imports/awaits in the export button's gesture. */
export function chooseRecordingArchiveDestination(recording: StudioRecording): Promise<FileSystemFileHandle | null> {
    const picker = (window as SaveFilePickerWindow).showSaveFilePicker;
    return picker ? picker.call(window, {
        suggestedName: `${recordingFileStem(recording)}.zip`, types: [{ description: 'ZIP archiv', accept: { 'application/zip': ['.zip'] } }],
    }) : Promise.resolve(null);
}

type ArchiveExportOptions = {
    readonly recording: StudioRecording;
    readonly destination: FileSystemFileHandle | null;
    readonly isTrimIncluded: boolean;
    readonly signal: AbortSignal;
    readonly onProgress: (message: string) => void;
};

/** ZIP64 supports long takes; already-compressed video is stored without another compression pass. */
export async function exportRecordingArchive({ recording, destination, isTrimIncluded, signal, onProgress }: ArchiveExportOptions): Promise<void> {
    const isTrimmed = isTrimIncluded && recording.trim !== null;
    if (isTrimmed) validateRecordingTrim(recording.trim!, recording.durationSeconds);
    if (!destination && getRecordingByteLength(recording) * (isTrimmed ? 2 : 1) > MAXIMUM_BUFFERED_EXPORT_BYTES) {
        throw new Error('Pro velký ZIP je potřeba přímé ukládání na disk. Otevřete studio v desktopovém Chrome nebo Edge na tomto zařízení a stejné adrese.');
    }
    const writable = destination ? await destination.createWritable() : null;
    const archive = new ZipWriter(writable ?? new BlobWriter('application/zip'), { level: 0, zip64: true, useWebWorkers: false });
    const exportedTracks: RecordingArchiveTrack[] = [];
    let bufferedBytes = 0;
    try {
        for (let index = 0; index < recording.tracks.length; index += 1) {
            const track = recording.tracks[index];
            signal.throwIfAborted();
            if (track.byteLength === 0) { exportedTracks.push({ ...track, originalFile: null, trimmedFile: null }); continue; }
            const prefix = `${String(index + 1).padStart(2, '0')}-${track.kind}`;
            const originalFile = `originals/${prefix}.${track.mimeType.includes('mp4') ? 'mp4' : 'webm'}`;
            const blob = await readRecordingTrack(recording.id, track);
            onProgress(`Balení originálu ${index + 1}/${recording.tracks.length}: ${track.label}`);
            const addFile = async (filename: string, content: Blob) => {
                bufferedBytes += content.size;
                if (!destination && bufferedBytes > MAXIMUM_BUFFERED_EXPORT_BYTES) throw new Error('ZIP je příliš velký pro stažení v tomto prohlížeči. Použijte přímé ukládání v Chrome nebo Edge.');
                await archive.add(filename, new BlobReader(content), { signal });
            };
            await addFile(originalFile, blob);
            let trimmedFile: string | null = null;
            if (isTrimmed) {
                const { withTrimmedRecordingTrack } = await import('./recordingStudioTrim');
                await withTrimmedRecordingTrack({
                    blob, track, trim: recording.trim!, signal,
                    onProgress: (progress) => onProgress(`Ořez stopy ${index + 1}/${recording.tracks.length}: ${Math.round(progress * 100)} %`),
                    consume: async (file, extension) => {
                        trimmedFile = `trimmed/${prefix}.${extension}`;
                        await addFile(trimmedFile, file);
                    },
                });
            }
            exportedTracks.push({ ...track, originalFile, trimmedFile });
        }
        const manifest: RecordingArchiveManifest = {
            schemaVersion: 1, id: recording.id, title: recording.title, createdAt: recording.createdAt,
            status: recording.status, errorMessage: recording.errorMessage, durationSeconds: recording.durationSeconds,
            trim: recording.trim, isTrimIncluded: isTrimmed, tracks: exportedTracks,
            timing: 'Seconds on the shared session clock. startOffsetSeconds measures browser start-call offsets, not hardware genlock.',
        };
        await archive.add('recording.json', new TextReader(JSON.stringify(manifest, null, 2)), { signal });
        await archive.add('README.txt', new TextReader([
            recording.title, '', 'ORIGINALS: unmodified source files, one file per camera, screen share or microphone.',
            'Keep embedded screen audio and microphone audio as separate sources when editing.',
            'recording.json contains source names, dimensions, byte sizes, timing offsets and the shared trim range in seconds.',
            'All MediaRecorders are started/stopped in one browser turn. This is not hardware frame synchronization.',
            isTrimmed ? 'TRIMMED: copies of every recorded source, cut to the same session range. A trim can re-encode video/audio; originals preserve capture quality.' :
                'No trimmed copies are included. The original source files and any saved trim decision are preserved.',
            recording.status === 'interrupted' ? 'INTERRUPTED TAKE: only successfully saved chunks are present; the tail may be incomplete. Check each source before editing.' : '',
        ].join('\n')), { signal });
        signal.throwIfAborted();
        const result = await archive.close();
        if (!destination && result instanceof Blob) downloadBlobFile({ fileName: `${recordingFileStem(recording)}.zip`, blob: result });
    } catch (error) {
        // Abort a direct-to-disk export instead of publishing a deceptively complete partial ZIP.
        await writable?.abort().catch(() => undefined);
        throw error;
    }
}
import type { RecordingSource, RecordingSourceKind } from './recordingStudioTypes';

const VIDEO_CAPTURE_CONSTRAINTS: MediaTrackConstraints = { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } };

export function releaseRecordingSource(source: RecordingSource): void {
    source.stream.getTracks().forEach((track) => track.stop());
}

/** Call directly from the Add button: screen selection needs the browser's transient user gesture. */
export async function acquireRecordingSource(kind: RecordingSourceKind, deviceId: string): Promise<RecordingSource> {
    const stream = kind === 'screen'
        ? await navigator.mediaDevices.getDisplayMedia({ video: VIDEO_CAPTURE_CONSTRAINTS, audio: true })
        : await navigator.mediaDevices.getUserMedia(kind === 'camera'
            ? { video: { ...VIDEO_CAPTURE_CONSTRAINTS, ...(deviceId ? { deviceId: { exact: deviceId } } : {}) }, audio: false }
            : { video: false, audio: deviceId ? { deviceId: { exact: deviceId } } : true });
    const track = kind === 'microphone' ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0];
    if (!track) {
        stream.getTracks().forEach((streamTrack) => streamTrack.stop());
        throw new Error('Vybraný zdroj neposkytl požadovanou stopu.');
    }
    return { id: crypto.randomUUID(), kind, label: track.label || { camera: 'Kamera', screen: 'Obrazovka', microphone: 'Mikrofon' }[kind], stream };
}

export function getRecordingErrorMessage(error: unknown): string {
    if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') return 'Přístup nebyl povolen nebo byl výběr zrušen. Zdroj můžete přidat znovu.';
        if (error.name === 'NotReadableError') return 'Zdroj nelze otevřít. Zkontrolujte, zda ho nepoužívá jiná aplikace.';
        if (error.name === 'NotFoundError' || error.name === 'OverconstrainedError') return 'Vybrané zařízení není dostupné. Zkuste jiné.';
        if (error.name === 'QuotaExceededError') return 'Úložiště prohlížeče je plné. Uložené části záznamu zůstávají dostupné.';
    }
    return error instanceof Error ? error.message : 'Operace se nezdařila. Zkuste ji znovu.';
}

exec
/bin/zsh -lc "sed -n '1,150p' CHANGELOG.md && rg -n 'recording|test-for-ptbk|test-e2e' README.md && cat tests/e2e/participant-promotion.spec.ts && rg --files --hidden tests/e2e/.artifacts | rg 'error-context|trace.zip' | head -25" in /Users/hejny/work/aldaron
 succeeded in 0ms:
# Changelog

## Unreleased

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
38:| Operations | `/admin`, `/admin/workshops`, `/admin/community`, `/admin/recording-studio`, `/admin/contacts`, `/admin/discount-codes`, and `/admin/shortener`. |
41:## Local recording studio
43:`/admin/recording-studio` uses the existing admin login. Add each camera or screen share separately; a microphone
51:source or failing to save a chunk stops every recorder. Normal admin navigation and sign-out wait for recording or
57:saved bytes after capture starts, reserving 64 MiB for final chunks. Persistence is requested when recording begins;
61:always contain unchanged `originals/` and `recording.json` (source names, dimensions, sizes, offsets, and trim range).
272:as UTF-8 WebVTT or SRT. Times always refer to the original recording, independent of its playback start offset.
309:| `npm run test-e2e` | Playwright public-flow tests on port `4009`. Each public-page route and each public submission is checked independently, every test is given enough time for the development server to compile the route it reaches first, and without a configured Supabase service-role key it uses an isolated in-memory Supabase-compatible store. Recordings of the most recent runs are kept in `tests/e2e/videos/`. |
311:| `npm run test-for-ptbk-coder` | The repository's full automated-agent verification sequence. |
import { expect, test } from '@playwright/test';
import { DEFAULT_EVENT_DETAILS } from '../../lib/events/event';
import type { WorkshopPublicState } from '../../lib/workshops/workshopTypes';

const SERVER_TIME = '2026-09-20T10:00:00.000Z';
const AUTHOR_NAME = 'Jana Nováková';
const PROJECT_TITLE = 'Projekt čekajícího autora';
const ROOM_PATHS = ['/cs/online-workshop/participant', '/cs/komunita'] as const;

test.use({ serviceWorkers: 'block' });

function createRoomState(slug: string, isCommunity: boolean, isTrusted: boolean): WorkshopPublicState {
    return {
        serverTime: isTrusted ? '2026-09-20T10:00:01.000Z' : SERVER_TIME,
        workshop: {
            id: 'moderation-room', slug, kind: isCommunity ? 'community' : 'workshop',
            event: isCommunity ? null : DEFAULT_EVENT_DETAILS, title: 'Moderace účastníků', description: '',
            startsAt: SERVER_TIME, endsAt: null, youtubeVideoId: null, recordingStartOffsetSeconds: 0,
            previewYoutubeVideoId: null, presentationUrl: null, repository: null, isPublished: true,
            allowedReactions: [], disabledPanels: [], createdAt: SERVER_TIME, updatedAt: SERVER_TIME,
        },
        participant: {
            id: 'moderator', fullname: 'Moderátor místnosti', email: 'moderator@example.com',
            connectedAt: SERVER_TIME, isTrusted: false, isModerator: true, isInteractionBanned: false,
        },
        contentBlocks: [], paidMembersOnlyContentPreviews: [], paidMembersOnlyVideo: null,
        nextContentUnlockAt: null, feedback: null, stageComment: null, watchingParticipantCount: 1,
        recentReactions: [], reactionCounts: [],
        comments: [{
            id: 'comment', authorName: AUTHOR_NAME, body: 'Prosím o schválení příspěvků.',
            status: isTrusted ? 'approved' : 'pending', upvoteCount: 0, isUpvotedByParticipant: false,
            createdAt: SERVER_TIME, isAuthorModerator: false, isArtificial: false, parentCommentId: null, isPinned: false,
            moderatedAuthor: {
                participantId: 'author', isTrusted, isModerator: false, isInteractionBanned: false,
                pendingSubmissionCount: isTrusted ? 0 : isCommunity ? 3 : 2,
            },
        }],
        polls: [{
            id: 'poll', question: 'Co příště?', isClosed: false, isVisible: true, isOtherOptionEnabled: true,
            createdAt: SERVER_TIME, updatedAt: SERVER_TIME, attachedWorkshops: [],
            options: [{
                id: 'option', label: 'Vlastní odpověď autora', sortOrder: 0, voteCount: 1,
                isVotedByParticipant: false, isCreatedByParticipant: true, status: isTrusted ? 'approved' : 'pending',
            }],
        }],
    };
}

for (const pathname of ROOM_PATHS) {
    test(`refreshes an author's pending total and submissions after trust on ${pathname}`, async ({ page }) => {
        const isCommunity = pathname === '/cs/komunita';
        let isTrusted = false;
        const promotionRequests: unknown[] = [];
        const browserErrors: string[] = [];
        page.on('pageerror', (error) => browserErrors.push(error.message));

        // SQL transition/rollback is exercised in isolated PostgreSQL tests. Browser responses keep this test free
        // of role or content mutations in the configured database while exercising the actual room's API flow.
        await page.route('**/api/**', async (route) => {
            const request = route.request();
            const apiPath = new URL(request.url()).pathname;
            if (apiPath.endsWith('/participants/author') && request.method() === 'PATCH') {
                promotionRequests.push(request.postDataJSON());
                isTrusted = true;
                return route.fulfill({ json: { participantId: 'author', isTrusted, isModerator: false, isInteractionBanned: false } });
            }
            if (apiPath.endsWith('/state')) {
                return route.fulfill({ json: createRoomState(apiPath.split('/')[3], isCommunity, isTrusted) });
            }
            if (apiPath.endsWith('/projects')) {
                return route.fulfill({ json: { isModerationOffered: true, projects: [{
                    id: 'project', title: PROJECT_TITLE, url: 'https://example.com/project', description: 'Sdílená ukázka',
                    previewImageUrl: null, status: isTrusted ? 'approved' : 'pending', authorName: AUTHOR_NAME,
                    upvoteCount: 0, downvoteCount: 0, voteByParticipant: null,
                    discussionWorkshopSlug: 'project-discussion', createdAt: SERVER_TIME,
                }] } });
            }
            if (apiPath.endsWith('/membership')) {
                return route.fulfill({ json: { status: 'none', isPurchaseOffered: false } });
            }
            return route.fulfill({ json: {} });
        });

        const response = await page.goto(pathname);
        test.skip(response?.status() === 404, 'The configured database has no published room for this route.');
        await expect(page.getByText(`Čeká na schválení: ${isCommunity ? 3 : 2}`, { exact: true })).toBeVisible();
        const authorProject = page.getByRole('article').filter({ has: page.getByRole('heading', { name: PROJECT_TITLE }) });
        if (isCommunity) await expect(authorProject.getByText('Čeká na schválení', { exact: true })).toBeVisible();

        await page.getByRole('button', { name: `Důvěřovat účastníkovi ${AUTHOR_NAME}`, exact: true }).click();

        await expect(page.getByText('Čeká na schválení: 0', { exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: `Odebrat důvěru účastníkovi ${AUTHOR_NAME}` })).toBeVisible();
        await expect(page.getByRole('button', { name: `Schválit komentář od ${AUTHOR_NAME}` })).toHaveCount(0);
        if (isCommunity) {
            await expect(authorProject.getByText('Čeká na schválení', { exact: true })).toHaveCount(0);
            await expect(authorProject.getByRole('link', { name: PROJECT_TITLE, exact: true })).toBeVisible();
        }
        expect(promotionRequests).toEqual([{ isTrusted: true }]);
        expect(browserErrors).toEqual([]);
    });
}
tests/e2e/.artifacts/participant-promotion-refr-c986f-online-workshop-participant/error-context.md
tests/e2e/.artifacts/participant-promotion-refr-c986f-online-workshop-participant/trace.zip
tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material/error-context.md
tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material/trace.zip
tests/e2e/.artifacts/participant-promotion-refr-a049d--after-trust-on-cs-komunita/error-context.md
tests/e2e/.artifacts/participant-promotion-refr-a049d--after-trust-on-cs-komunita/trace.zip
tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material-retry1/error-context.md
tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material-retry1/trace.zip

exec
/bin/zsh -lc 'cat lib/recording-studio/RecordingCoordinator.ts lib/recording-studio/recordingStudioStorage.ts lib/recording-studio/recordingStudioTypes.ts' in /Users/hejny/work/aldaron
 exited 1 in 0ms:
cat: lib/recording-studio/RecordingCoordinator.ts: No such file or directory
import { getCommonRecordingDuration, validateRecordingTrim } from './recordingStudioTiming';
import type { RecordingStorageEstimate, RecordingTrack, RecordingTrim, StudioRecording } from './recordingStudioTypes';

const RECORDING_DATABASE_NAME = 'promptbook-recording-studio';
const RECORDING_DATABASE_VERSION = 1;
const RECORDING_STORE = 'recordings';
const CHUNK_STORE = 'chunks';

type RecordingChunk = {
    readonly recordingId: string;
    readonly trackId: string;
    readonly sequence: number;
    readonly data: Blob;
};

let databasePromise: Promise<IDBDatabase> | null = null;

function openRecordingDatabase(): Promise<IDBDatabase> {
    if (databasePromise) return databasePromise;
    databasePromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(RECORDING_DATABASE_NAME, RECORDING_DATABASE_VERSION);
        request.onupgradeneeded = () => {
            const database = request.result;
            database.createObjectStore(RECORDING_STORE, { keyPath: 'id' });
            const chunks = database.createObjectStore(CHUNK_STORE, { keyPath: ['recordingId', 'trackId', 'sequence'] });
            chunks.createIndex('recordingId', 'recordingId');
        };
        request.onsuccess = () => {
            request.result.onversionchange = () => { request.result.close(); databasePromise = null; };
            resolve(request.result);
        };
        request.onerror = () => reject(request.error);
        request.onblocked = () => reject(new Error('Zavřete ostatní karty nahrávacího studia a zkuste stránku obnovit.'));
    });
    void databasePromise.catch(() => { databasePromise = null; });
    return databasePromise;
}

function waitForTransaction(transaction: IDBTransaction): Promise<void> {
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onabort = () => reject(transaction.error ?? new Error('Uložení do prohlížeče se nezdařilo.'));
        transaction.onerror = () => reject(transaction.error);
    });
}

function readRequest<Result>(request: IDBRequest<Result>): Promise<Result> {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function listStudioRecordings(): Promise<StudioRecording[]> {
    const database = await openRecordingDatabase();
    const recordings: StudioRecording[] = await readRequest(database.transaction(RECORDING_STORE).objectStore(RECORDING_STORE).getAll());
    return recordings.sort((first, second) => second.createdAt.localeCompare(first.createdAt));
}

export async function saveStudioRecording(recording: StudioRecording): Promise<void> {
    const database = await openRecordingDatabase();
    const transaction = database.transaction(RECORDING_STORE, 'readwrite');
    const completion = waitForTransaction(transaction);
    transaction.objectStore(RECORDING_STORE).put(recording);
    await completion;
}

/** Chunk and its byte counts commit atomically, so a crash never advertises data that was not saved. */
export async function appendRecordingChunk(recording: StudioRecording, trackId: string, sequence: number, data: Blob): Promise<void> {
    const database = await openRecordingDatabase();
    const transaction = database.transaction([RECORDING_STORE, CHUNK_STORE], 'readwrite');
    const completion = waitForTransaction(transaction);
    transaction.objectStore(CHUNK_STORE).add({ recordingId: recording.id, trackId, sequence, data } satisfies RecordingChunk);
    transaction.objectStore(RECORDING_STORE).put(recording);
    await completion;
}

/** Keep disk-backed Blob references; never read the entire recording into an ArrayBuffer. */
export async function readRecordingTrack(recordingId: string, track: RecordingTrack): Promise<Blob> {
    const database = await openRecordingDatabase();
    const range = IDBKeyRange.bound([recordingId, track.id, 0], [recordingId, track.id, Number.MAX_SAFE_INTEGER]);
    const chunks: RecordingChunk[] = await readRequest(database.transaction(CHUNK_STORE).objectStore(CHUNK_STORE).getAll(range));
    if (chunks.length !== track.chunkCount || chunks.some((chunk, index) => chunk.sequence !== index)) {
        throw new Error(`Stopa „${track.label}“ není úplná. Ponechte uložená data v prohlížeči.`);
    }
    const blob = new Blob(chunks.map((chunk) => chunk.data), { type: track.mimeType });
    if (blob.size !== track.byteLength) throw new Error(`Velikost stopy „${track.label}“ neodpovídá uloženému záznamu.`);
    return blob;
}

export async function editStudioRecording(recording: StudioRecording, title: string, trim: RecordingTrim): Promise<StudioRecording> {
    validateRecordingTrim(trim, recording.durationSeconds);
    if (!title.trim()) throw new Error('Vyplňte název záznamu.');
    const updated = { ...recording, title: title.trim(), trim };
    await saveStudioRecording(updated);
    return updated;
}

export async function deleteStudioRecording(recordingId: string): Promise<void> {
    const database = await openRecordingDatabase();
    const transaction = database.transaction([RECORDING_STORE, CHUNK_STORE], 'readwrite');
    const completion = waitForTransaction(transaction);
    transaction.objectStore(RECORDING_STORE).delete(recordingId);
    const request = transaction.objectStore(CHUNK_STORE).index('recordingId').openCursor(IDBKeyRange.only(recordingId));
    request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) return;
        cursor.delete();
        cursor.continue();
    };
    await completion;
}

/** Only called while the browser-wide studio lock is held; never interrupts another tab's capture. */
export async function recoverStudioRecordings(): Promise<StudioRecording[]> {
    const recordings = await listStudioRecordings();
    return Promise.all(recordings.map(async (recording) => {
        if (recording.status !== 'recording') return recording;
        const recovered: StudioRecording = {
            ...recording, status: 'interrupted', durationSeconds: getCommonRecordingDuration(recording.tracks),
            errorMessage: 'Nahrávání bylo přerušeno. Obnovené jsou pouze části, které prohlížeč stihl uložit.',
        };
        await saveStudioRecording(recovered);
        return recovered;
    }));
}

export async function estimateRecordingStorage(): Promise<RecordingStorageEstimate> {
    const [estimate, isPersistent] = await Promise.all([
        navigator.storage?.estimate?.().catch(() => null), navigator.storage?.persisted?.().catch(() => false),
    ]);
    return {
        availableBytes: estimate?.quota === undefined || estimate.usage === undefined ? null : Math.max(0, estimate.quota - estimate.usage),
        quotaBytes: estimate?.quota ?? null,
        isPersistent: isPersistent ?? false,
    };
}
export const RECORDING_STUDIO_PATH = '/admin/recording-studio';
export const RECORDING_CHUNK_MILLISECONDS = 1_000;
export const RECORDING_VIDEO_BITS_PER_SECOND = 8_000_000;
export const RECORDING_AUDIO_BITS_PER_SECOND = 192_000;
export const RECORDING_STORAGE_RESERVE_BYTES = 64 * 1024 * 1024;
export const RECORDING_MAX_PENDING_BYTES = 64 * 1024 * 1024;
export const RECORDING_STUDIO_LOCK = 'promptbook-recording-studio';

export type RecordingSourceKind = 'camera' | 'screen' | 'microphone';

export type RecordingSource = {
    readonly id: string;
    readonly kind: RecordingSourceKind;
    readonly label: string;
    readonly stream: MediaStream;
};

export type RecordingTrim = {
    readonly startSeconds: number;
    readonly endSeconds: number;
};

export type RecordingTrack = {
    readonly id: string;
    readonly kind: RecordingSourceKind;
    readonly label: string;
    readonly mimeType: string;
    readonly byteLength: number;
    readonly chunkCount: number;
    readonly startOffsetSeconds: number;
    readonly durationSeconds: number;
    readonly width: number | null;
    readonly height: number | null;
    readonly frameRate: number | null;
    readonly isAudioIncluded: boolean;
};

export type StudioRecording = {
    readonly id: string;
    readonly title: string;
    readonly createdAt: string;
    readonly status: 'recording' | 'complete' | 'interrupted';
    readonly durationSeconds: number;
    readonly tracks: readonly RecordingTrack[];
    readonly trim: RecordingTrim | null;
    readonly errorMessage: string | null;
};

export type RecordingArchiveTrack = RecordingTrack & {
    readonly originalFile: string | null;
    readonly trimmedFile: string | null;
};

export type RecordingArchiveManifest = Pick<StudioRecording, 'id' | 'title' | 'createdAt' | 'status' | 'errorMessage' | 'durationSeconds' | 'trim'> & {
    readonly schemaVersion: 1;
    readonly isTrimIncluded: boolean;
    readonly tracks: readonly RecordingArchiveTrack[];
    readonly timing: string;
};

export type RecordingStorageEstimate = {
    readonly availableBytes: number | null;
    readonly quotaBytes: number | null;
    readonly isPersistent: boolean;
};

exec
/bin/zsh -lc "rg --files lib/recording-studio components app | rg -i 'recording.?studio|RecordingCoordinator'" in /Users/hejny/work/aldaron
 succeeded in 0ms:
lib/recording-studio/recordingStudioStorage.ts
lib/recording-studio/recordingStudioTiming.ts
lib/recording-studio/recordingStudioTiming.test.ts
lib/recording-studio/RecordingStudioCapture.ts
lib/recording-studio/recordingStudioDevices.ts
lib/recording-studio/recordingStudioLock.ts
lib/recording-studio/recordingStudioTestUtilities.ts
lib/recording-studio/recordingStudioStorage.test.ts
lib/recording-studio/RecordingStudioCapture.test.ts
lib/recording-studio/recordingStudioTrim.ts
lib/recording-studio/recordingStudioExport.test.ts
lib/recording-studio/recordingStudioTypes.ts
lib/recording-studio/recordingStudioExport.ts
components/recording-studio/RecordingLibrary.tsx
components/recording-studio/RecordingStudio.tsx
components/recording-studio/RecordingEditor.tsx
components/recording-studio/RecordingSourcePreview.tsx
components/recording-studio/RecordingSourcePicker.tsx
components/recording-studio/useRecordingStudio.ts
app/admin/recording-studio/page.tsx

exec
/bin/zsh -lc "cat tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material/error-context.md tests/e2e/.artifacts/participant-promotion-refr-a049d--after-trust-on-cs-komunita/error-context.md && sed -n '41,78p' README.md && rg -n 'recording|MediaRecorder' lib/recording-studio components/admin app/admin/recording-studio" in /Users/hejny/work/aldaron
 succeeded in 0ms:
# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: recording-studio.spec.ts >> records separate sources, restores them, trims every track and exports playable editor material
- Location: tests/e2e/recording-studio.spec.ts:81:5

# Error details

```
Error: expect(received).toHaveLength(expected)

Expected length: 5
Received length: 2
Received array:  ["originals/01-camera.webm", "originals/02-camera.webm"]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - link "Promptbook admin – Admin dashboard" [ref=e5] [cursor=pointer]:
          - /url: /admin
          - generic [ref=e9]: Promptbook admin
          - generic [ref=e10]: – Admin dashboard
        - heading "Nahrávací studio" [level=1] [ref=e12]
        - button "Odhlásit se" [ref=e15] [cursor=pointer]
      - navigation "Navigace administrace" [ref=e19]:
        - list [ref=e20]:
          - listitem [ref=e21]:
            - link "Dashboard" [ref=e22] [cursor=pointer]:
              - /url: /admin
          - listitem [ref=e28]:
            - link "Živé workshopy" [ref=e29] [cursor=pointer]:
              - /url: /admin/workshops
          - listitem [ref=e36]:
            - link "Komunita" [ref=e37] [cursor=pointer]:
              - /url: /admin/community
          - listitem [ref=e42]:
            - link "Nahrávací studio" [ref=e43] [cursor=pointer]:
              - /url: /admin/recording-studio
          - listitem [ref=e47]:
            - link "Kontakty a leady" [ref=e48] [cursor=pointer]:
              - /url: /admin/contacts
          - listitem [ref=e53]:
            - link "Zkracovač odkazů" [ref=e54] [cursor=pointer]:
              - /url: /admin/shortener
          - listitem [ref=e58]:
            - link "Slevové kódy" [ref=e59] [cursor=pointer]:
              - /url: /admin/discount-codes
  - main [ref=e63]:
    - generic [ref=e64]:
      - generic [ref=e65]:
        - heading "Nahrávací studio" [level=2] [ref=e66]
        - paragraph [ref=e67]: Připojte kamery, sdílené obrazovky a případně mikrofon. Jedním tlačítkem nahrajte všechny zdroje do samostatných souborů pro střihače.
      - generic [ref=e68]:
        - generic [ref=e69]:
          - paragraph [ref=e70]: Délka záznamu
          - paragraph [ref=e71]: 00:00:04
          - paragraph [ref=e72]: Všechny stopy mají společný čas.
        - generic [ref=e73]:
          - paragraph [ref=e74]: Volné místo v prohlížeči
          - paragraph [ref=e77]: 3 GiB
          - paragraph [ref=e78]: Prohlížeč může místní data automaticky uvolnit.
        - generic [ref=e79]:
          - paragraph [ref=e80]: Odhad zbývajícího nahrávání
          - paragraph [ref=e81]: —
          - paragraph [ref=e82]: Přidejte zdroj. Pokud prohlížeč nesdělí kapacitu, odhad není dostupný.
      - region [ref=e83]:
        - generic [ref=e84]:
          - heading "Zdroje 0" [level=2] [ref=e85]
          - generic [ref=e86]:
            - button "Přidat zdroj" [ref=e87] [cursor=pointer]
            - button "Nahrávat všechny zdroje" [disabled]
        - paragraph [ref=e90]: Přidejte první kameru nebo sdílení obrazovky.
        - paragraph [ref=e91]: Obraz ani zvuk se neodesílá na server. Záznamy se průběžně ukládají v tomto prohlížeči; po natáčení si stáhněte ZIP.
      - region [ref=e92]:
        - generic [ref=e93]:
          - heading "Uložené záznamy" [level=2] [ref=e94]
          - paragraph [ref=e95]: Pouze v tomto prohlížeči a na tomto zařízení. Stažený ZIP je vaše záloha pro střihače.
        - status [ref=e96]: ZIP je připravený.
        - article "Záznam 21. 9. 2026 15:29:44" [ref=e97]:
          - generic [ref=e98]:
            - generic [ref=e99]:
              - heading "Záznam 21. 9. 2026 15:29:44" [level=3] [ref=e100]
              - paragraph [ref=e101]: 00:00:00 · 612,5 KiB · 5 stop
            - generic [ref=e102]: Uloženo
          - list [ref=e103]:
            - listitem [ref=e104]:
              - generic "yHsnpeFvYVir+xcqaYiCmLq/4GTZBDHqfjfY8Qam0ZiOyzXxS+RdjZMKa2SzXYCqle9TjTeGWxcMbDN6AoI4Iw==" [ref=e105]: 1. yHsnpeFvYVir+xcqaYiCmLq/4GTZBDHqfjfY8Qam0ZiOyzXxS+RdjZMKa2SzXYCqle9TjTeGWxcMbDN6AoI4Iw==
              - generic [ref=e106]: 296,6 KiB
            - listitem [ref=e107]:
              - generic "E8B0reIGG57kFZqigA8F6GXokCVVVRvXIKDP+znvMN8VJGX4JpYK/qfQELHvlqLbNgRxf/Zjr10y4YWsGtGhDw==" [ref=e108]: 2. E8B0reIGG57kFZqigA8F6GXokCVVVRvXIKDP+znvMN8VJGX4JpYK/qfQELHvlqLbNgRxf/Zjr10y4YWsGtGhDw==
              - generic [ref=e109]: 315,9 KiB
            - listitem [ref=e110]:
              - generic "a9T7j8Bdke+pyXjZZUg35ppHpNXxjm8Vj4D4fHQOqxuFoHzj52ejYOu5Dv2Ta895eIK/AWIo4Ts8LIU33N8cPg==" [ref=e111]: 3. a9T7j8Bdke+pyXjZZUg35ppHpNXxjm8Vj4D4fHQOqxuFoHzj52ejYOu5Dv2Ta895eIK/AWIo4Ts8LIU33N8cPg== · zvuk
              - generic [ref=e112]: 0 B
            - listitem [ref=e113]:
              - generic "GlJMCViYBiwry1ZPp/vbrf3+PcmONj1+whEHTCnmiFqF43hBPoDmkxzn+cOqOxQHUcMAZucPr3tLKlMwKEpRXg==" [ref=e114]: 4. GlJMCViYBiwry1ZPp/vbrf3+PcmONj1+whEHTCnmiFqF43hBPoDmkxzn+cOqOxQHUcMAZucPr3tLKlMwKEpRXg== · zvuk
              - generic [ref=e115]: 0 B
            - listitem [ref=e116]:
              - generic "MediaStreamAudioDestinationNode" [ref=e117]: 5. MediaStreamAudioDestinationNode · zvuk
              - generic [ref=e118]: 0 B
          - generic [ref=e119]:
            - button "Náhled a ořez" [disabled]
            - button "Originály ZIP" [ref=e120] [cursor=pointer]
            - button "Smazat" [ref=e124] [cursor=pointer]
  - alert [ref=e125]
  - region [ref=e127]:
    - generic [ref=e128]:
      - heading "Cookies" [level=2] [ref=e132]
      - paragraph [ref=e133]: We use cookies to keep the website working, to understand its traffic, and to measure the effectiveness of our advertising. The "Accept all" button gives us your consent.
      - paragraph [ref=e134]:
        - text: The details are in our
        - link "privacy policy" [ref=e135] [cursor=pointer]:
          - /url: /en/privacy-policy
        - text: .
    - generic [ref=e136]:
      - button "Customize" [ref=e137] [cursor=pointer]
      - button "Accept all" [ref=e138] [cursor=pointer]
```

# Test source

```ts
  1   | import { expect, test, type Page } from '@playwright/test';
  2   | import { ZipReader, Uint8ArrayReader, Uint8ArrayWriter } from '@zip.js/zip.js';
  3   | import { ALL_FORMATS, BufferSource, Input } from 'mediabunny';
  4   | import { readFile } from 'node:fs/promises';
  5   | import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/admin/adminConstants';
  6   | import { createAdminSessionValueOrNull } from '@/lib/admin/adminSession';
  7   | import type { RecordingArchiveManifest } from '@/lib/recording-studio/recordingStudioTypes';
  8   | 
  9   | test.use({ serviceWorkers: 'block' });
  10  | 
  11  | async function openStudio(page: Page, baseURL: string | undefined) {
  12  |     test.skip(!process.env.ADMIN_PASSWORD, 'Needs the local test server admin password.');
  13  |     await page.context().addCookies([{ name: ADMIN_SESSION_COOKIE_NAME, value: createAdminSessionValueOrNull()!, url: baseURL!, httpOnly: true, sameSite: 'Lax' }]);
  14  |     await page.addInitScript(() => {
  15  |         // Only replace physical devices/the permission picker. Recording, storage, codecs and ZIP are real.
  16  |         const streams: MediaStream[] = [];
  17  |         Object.assign(window, { studioTestStreams: streams });
  18  |         const createStream = (isVideo: boolean, isAudio: boolean) => {
  19  |             const stream = new MediaStream();
  20  |             if (isVideo) {
  21  |                 const canvas = document.createElement('canvas');
  22  |                 canvas.width = 320; canvas.height = 180;
  23  |                 const context = canvas.getContext('2d')!;
  24  |                 const draw = () => {
  25  |                     context.fillStyle = streams.length % 2 ? '#08b' : '#b60';
  26  |                     context.fillRect(0, 0, 320, 180);
  27  |                     context.fillStyle = '#fff'; context.font = '24px sans-serif';
  28  |                     context.fillText(String(performance.now()), 20, 90);
  29  |                 };
  30  |                 draw();
  31  |                 const interval = setInterval(draw, 33);
  32  |                 const videoTrack = canvas.captureStream(30).getVideoTracks()[0];
  33  |                 videoTrack.addEventListener('ended', () => clearInterval(interval));
  34  |                 stream.addTrack(videoTrack);
  35  |             }
  36  |             if (isAudio) {
  37  |                 const context = new AudioContext();
  38  |                 const oscillator = context.createOscillator();
  39  |                 const destination = context.createMediaStreamDestination();
  40  |                 oscillator.connect(destination); oscillator.start();
  41  |                 stream.addTrack(destination.stream.getAudioTracks()[0]);
  42  |                 void context.resume();
  43  |             }
  44  |             streams.push(stream);
  45  |             return Promise.resolve(stream);
  46  |         };
  47  |         Object.defineProperties(navigator.mediaDevices, {
  48  |             getUserMedia: { value: (constraints: MediaStreamConstraints) => createStream(Boolean(constraints.video), Boolean(constraints.audio)) },
  49  |             getDisplayMedia: { value: () => createStream(true, true) },
  50  |             enumerateDevices: { value: () => Promise.resolve([]) },
  51  |         });
  52  |         Object.defineProperty(window, 'showSaveFilePicker', { value: undefined, configurable: true });
  53  |     });
  54  |     await page.goto('/admin/recording-studio');
  55  |     await expect(page.getByRole('button', { name: 'Přidat zdroj', exact: true })).toBeEnabled();
  56  | }
  57  | 
  58  | async function addSource(page: Page, kind: 'camera' | 'screen' | 'microphone') {
  59  |     await page.getByRole('button', { name: 'Přidat zdroj', exact: true }).click();
  60  |     await page.getByLabel('Typ zdroje').selectOption(kind);
  61  |     await page.getByRole('button', { name: 'Připojit zdroj', exact: true }).click();
  62  |     await expect(page.getByRole('dialog')).toHaveCount(0);
  63  | }
  64  | 
  65  | async function readArchive(pathname: string) {
  66  |     const reader = new ZipReader(new Uint8ArrayReader(await readFile(pathname)));
  67  |     const entries = await reader.getEntries();
  68  |     const files = new Map<string, Uint8Array>();
  69  |     for (const entry of entries) {
  70  |         if (!entry.directory) files.set(entry.filename, await entry.getData(new Uint8ArrayWriter()));
  71  |     }
  72  |     await reader.close();
  73  |     return files;
  74  | }
  75  | 
  76  | test('requires admin authentication for the recording studio', async ({ page }) => {
  77  |     await page.goto('/admin/recording-studio');
  78  |     await expect(page).toHaveURL(/\/admin\/login\?redirectPath=%2Fadmin%2Frecording-studio/);
  79  | });
  80  | 
  81  | test('records separate sources, restores them, trims every track and exports playable editor material', async ({ page, baseURL }, testInfo) => {
  82  |     const errors: string[] = [];
  83  |     page.on('pageerror', (error) => errors.push(error.message));
  84  |     await openStudio(page, baseURL);
  85  |     await addSource(page, 'camera');
  86  |     await addSource(page, 'camera');
  87  |     await addSource(page, 'screen');
  88  |     await addSource(page, 'screen');
  89  |     await addSource(page, 'microphone');
  90  |     await page.getByRole('button', { name: 'Nahrávat všechny zdroje', exact: true }).click();
  91  |     await expect(page.getByLabel('Délka záznamu', { exact: true })).toHaveText('00:00:04');
  92  |     await page.getByRole('button', { name: 'Zastavit všechny stopy', exact: true }).click();
  93  |     await expect(page.getByText('Uloženo', { exact: true })).toBeVisible();
  94  |     await expect(page.getByRole('button', { name: 'Odebrat zdroj' })).toHaveCount(0);
  95  | 
  96  |     const originalDownload = page.waitForEvent('download');
  97  |     await page.getByRole('button', { name: 'Originály ZIP', exact: true }).click();
  98  |     const originals = await readArchive((await (await originalDownload).path())!);
> 99  |     expect(Array.from(originals.keys()).filter((name) => name.startsWith('originals/'))).toHaveLength(5);
      |                                                                                          ^ Error: expect(received).toHaveLength(expected)
  100 |     // Exercise the streaming disk path with a real writable file, without automating an OS save dialog.
  101 |     await page.evaluate(() => Object.defineProperty(window, 'showSaveFilePicker', {
  102 |         configurable: true, value: async () => (await navigator.storage.getDirectory()).getFileHandle('test-studio-export.zip', { create: true }),
  103 |     }));
  104 |     await page.getByRole('button', { name: 'Originály ZIP', exact: true }).click();
  105 |     await expect(page.getByText('ZIP je připravený.', { exact: true })).toBeVisible();
  106 |     const diskBytes = await page.evaluate(async () => Array.from(new Uint8Array(await (await (await (await navigator.storage.getDirectory()).getFileHandle('test-studio-export.zip')).getFile()).arrayBuffer())));
  107 |     const diskReader = new ZipReader(new Uint8ArrayReader(new Uint8Array(diskBytes)));
  108 |     expect((await diskReader.getEntries()).map((entry) => entry.filename)).toEqual(Array.from(originals.keys()));
  109 |     await diskReader.close();
  110 |     await page.evaluate(() => Object.defineProperty(window, 'showSaveFilePicker', { value: undefined, configurable: true }));
  111 |     await page.getByRole('button', { name: 'Náhled a ořez', exact: true }).click();
  112 |     await page.getByLabel('Název záznamu', { exact: true }).fill('Synchronized editing take');
  113 |     await page.getByLabel('Začátek (sekundy)', { exact: true }).fill('0.5');
  114 |     await page.getByLabel('Konec (sekundy)', { exact: true }).fill('2.5');
  115 |     await expect(page.getByRole('dialog').getByText('Změny se ukládají automaticky.', { exact: true })).toBeVisible();
  116 |     const preview = page.getByRole('dialog').locator('video').first();
  117 |     await preview.evaluate(async (video: HTMLVideoElement) => { video.muted = true; await video.play(); });
  118 |     await expect.poll(() => preview.evaluate((video: HTMLVideoElement) => video.currentTime)).toBeGreaterThan(0.65);
  119 |     await expect.poll(() => preview.evaluate((video: HTMLVideoElement) => video.paused)).toBe(true);
  120 |     expect(await preview.evaluate((video: HTMLVideoElement) => video.currentTime)).toBeLessThan(2.8);
  121 |     await page.screenshot({ path: testInfo.outputPath('recording-studio-editor.png') });
  122 |     await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click();
  123 |     await page.reload();
  124 |     await expect(page.getByRole('heading', { name: 'Synchronized editing take', exact: true })).toBeVisible();
  125 |     const trimmedDownload = page.waitForEvent('download');
  126 |     await page.getByRole('button', { name: 'ZIP s ořezem', exact: true }).click();
  127 |     const files = await readArchive((await (await trimmedDownload).path())!);
  128 |     const manifest = JSON.parse(new TextDecoder().decode(files.get('recording.json'))) as RecordingArchiveManifest;
  129 |     expect(manifest.trim).toEqual({ startSeconds: 0.5, endSeconds: 2.5 });
  130 |     expect(manifest.tracks).toHaveLength(5);
  131 |     for (let index = 0; index < manifest.tracks.length; index += 1) {
  132 |         const track = manifest.tracks[index];
  133 |         if (!track.originalFile || !track.trimmedFile) throw new Error('Expected original and trimmed files for every source.');
  134 |         expect(files.get(track.originalFile)).toEqual(originals.get(track.originalFile));
  135 |         const input = new Input({ formats: ALL_FORMATS, source: new BufferSource(files.get(track.trimmedFile)!) });
  136 |         try {
  137 |             expect(await input.canRead()).toBe(true);
  138 |             expect(await input.computeDuration()).toBeGreaterThan(1.8);
  139 |             expect(await input.computeDuration()).toBeLessThan(2.2);
  140 |             const videoTracks = await input.getVideoTracks();
  141 |             expect(videoTracks.length).toBe(index === 4 ? 0 : 1);
  142 |             if (videoTracks.length > 0) {
  143 |                 expect(videoTracks[0].displayWidth).toBe(320);
  144 |                 expect(videoTracks[0].displayHeight).toBe(180);
  145 |             }
  146 |             expect((await input.getAudioTracks()).length).toBe(index < 2 ? 0 : 1);
  147 |         } finally { input.dispose(); }
  148 |     }
  149 |     await page.screenshot({ path: testInfo.outputPath('recording-studio-desktop.png'), fullPage: true });
  150 |     await page.setViewportSize({ width: 390, height: 844 });
  151 |     await expect(page.getByRole('button', { name: 'ZIP s ořezem', exact: true })).toBeVisible();
  152 |     expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  153 |     await page.screenshot({ path: testInfo.outputPath('recording-studio-mobile.png'), fullPage: true });
  154 |     await page.getByRole('button', { name: 'Smazat', exact: true }).click();
  155 |     await page.getByRole('button', { name: 'Smazat záznam a všechny stopy', exact: true }).click();
  156 |     await expect(page.getByRole('heading', { name: 'Synchronized editing take' })).toHaveCount(0);
  157 |     await page.reload();
  158 |     await expect(page.getByRole('button', { name: 'Originály ZIP', exact: true })).toHaveCount(0);
  159 |     expect(errors).toEqual([]);
  160 | });
  161 | 
  162 | test('stops the whole take on disconnect and prevents a second tab from changing it', async ({ page, baseURL }) => {
  163 |     await openStudio(page, baseURL);
  164 |     await addSource(page, 'camera');
  165 |     await addSource(page, 'screen');
  166 |     await page.getByRole('button', { name: 'Nahrávat všechny zdroje', exact: true }).click();
  167 |     await expect(page.getByLabel('Délka záznamu', { exact: true })).toHaveText('00:00:02');
  168 |     const secondPage = await page.context().newPage();
  169 |     await secondPage.goto('/admin/recording-studio');
  170 |     await expect(secondPage.getByRole('alert').filter({ hasText: 'Studio už' })).toContainText('jiné kartě');
  171 |     await secondPage.close();
  172 |     await page.evaluate(() => {
  173 |         const streams = (window as unknown as { studioTestStreams: MediaStream[] }).studioTestStreams;
  174 |         const track = streams[1].getVideoTracks()[0];
  175 |         track.stop(); track.dispatchEvent(new Event('ended'));
  176 |     });
  177 |     await expect(page.getByText('Přerušený záznam', { exact: true })).toBeVisible();
  178 |     await expect(page.getByRole('button', { name: 'Originály ZIP', exact: true })).toBeEnabled();
  179 |     await expect(page.getByRole('button', { name: 'Zastavit všechny stopy', exact: true })).toHaveCount(0);
  180 | });
  181 | 
  182 | test('recovers persisted chunks after an interrupted page and waits for stop before admin navigation', async ({ page, baseURL }) => {
  183 |     await openStudio(page, baseURL);
  184 |     await addSource(page, 'camera');
  185 |     await addSource(page, 'screen');
  186 |     await page.getByRole('button', { name: 'Nahrávat všechny zdroje', exact: true }).click();
  187 |     await expect(page.getByLabel('Délka záznamu', { exact: true })).toHaveText('00:00:03');
  188 |     const dialogPromise = page.waitForEvent('dialog');
  189 |     const reload = page.evaluate(() => window.location.reload());
  190 |     const dialog = await dialogPromise;
  191 |     expect(dialog.type()).toBe('beforeunload');
  192 |     await dialog.accept();
  193 |     await reload.catch(() => undefined);
  194 |     await expect(page.getByText('Přerušený záznam', { exact: true })).toBeVisible();
  195 |     await expect(page.getByRole('button', { name: 'Originály ZIP', exact: true })).toBeEnabled();
  196 |     await addSource(page, 'camera');
  197 |     await page.getByRole('button', { name: 'Nahrávat všechny zdroje', exact: true }).click();
  198 |     await expect(page.getByLabel('Délka záznamu', { exact: true })).toHaveText('00:00:02');
  199 |     await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
```# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: participant-promotion.spec.ts >> refreshes an author's pending total and submissions after trust on /cs/komunita
- Location: tests/e2e/participant-promotion.spec.ts:50:9

# Error details

```
Test timeout of 180000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Čeká na schválení: 3', { exact: true })
Expected: visible
Timeout: 30000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 30000ms
  - waiting for getByText('Čeká na schválení: 3', { exact: true })

```

```yaml
- group "Barevný režim":
  - button "Podle zařízení" [pressed]
  - button "Světlý režim"
  - button "Tmavý režim"
- main:
  - img "Ověřuji připojení"
- alert
- region "Cookies":
  - heading "Cookies" [level=2]
  - paragraph: Cookies používáme, aby web fungoval, abychom rozuměli návštěvnosti a měřili účinnost reklamy. Tlačítkem „Přijmout vše“ nám k tomu dáte souhlas.
  - paragraph:
    - text: Podrobnosti najdete v
    - link "zásadách ochrany osobních údajů":
      - /url: /cs/ochrana-osobnich-udaju
    - text: .
  - button "Nastavit"
  - button "Přijmout vše"
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test';
  2   | import { DEFAULT_EVENT_DETAILS } from '../../lib/events/event';
  3   | import type { WorkshopPublicState } from '../../lib/workshops/workshopTypes';
  4   | 
  5   | const SERVER_TIME = '2026-09-20T10:00:00.000Z';
  6   | const AUTHOR_NAME = 'Jana Nováková';
  7   | const PROJECT_TITLE = 'Projekt čekajícího autora';
  8   | const ROOM_PATHS = ['/cs/online-workshop/participant', '/cs/komunita'] as const;
  9   | 
  10  | test.use({ serviceWorkers: 'block' });
  11  | 
  12  | function createRoomState(slug: string, isCommunity: boolean, isTrusted: boolean): WorkshopPublicState {
  13  |     return {
  14  |         serverTime: isTrusted ? '2026-09-20T10:00:01.000Z' : SERVER_TIME,
  15  |         workshop: {
  16  |             id: 'moderation-room', slug, kind: isCommunity ? 'community' : 'workshop',
  17  |             event: isCommunity ? null : DEFAULT_EVENT_DETAILS, title: 'Moderace účastníků', description: '',
  18  |             startsAt: SERVER_TIME, endsAt: null, youtubeVideoId: null, recordingStartOffsetSeconds: 0,
  19  |             previewYoutubeVideoId: null, presentationUrl: null, repository: null, isPublished: true,
  20  |             allowedReactions: [], disabledPanels: [], createdAt: SERVER_TIME, updatedAt: SERVER_TIME,
  21  |         },
  22  |         participant: {
  23  |             id: 'moderator', fullname: 'Moderátor místnosti', email: 'moderator@example.com',
  24  |             connectedAt: SERVER_TIME, isTrusted: false, isModerator: true, isInteractionBanned: false,
  25  |         },
  26  |         contentBlocks: [], paidMembersOnlyContentPreviews: [], paidMembersOnlyVideo: null,
  27  |         nextContentUnlockAt: null, feedback: null, stageComment: null, watchingParticipantCount: 1,
  28  |         recentReactions: [], reactionCounts: [],
  29  |         comments: [{
  30  |             id: 'comment', authorName: AUTHOR_NAME, body: 'Prosím o schválení příspěvků.',
  31  |             status: isTrusted ? 'approved' : 'pending', upvoteCount: 0, isUpvotedByParticipant: false,
  32  |             createdAt: SERVER_TIME, isAuthorModerator: false, isArtificial: false, parentCommentId: null, isPinned: false,
  33  |             moderatedAuthor: {
  34  |                 participantId: 'author', isTrusted, isModerator: false, isInteractionBanned: false,
  35  |                 pendingSubmissionCount: isTrusted ? 0 : isCommunity ? 3 : 2,
  36  |             },
  37  |         }],
  38  |         polls: [{
  39  |             id: 'poll', question: 'Co příště?', isClosed: false, isVisible: true, isOtherOptionEnabled: true,
  40  |             createdAt: SERVER_TIME, updatedAt: SERVER_TIME, attachedWorkshops: [],
  41  |             options: [{
  42  |                 id: 'option', label: 'Vlastní odpověď autora', sortOrder: 0, voteCount: 1,
  43  |                 isVotedByParticipant: false, isCreatedByParticipant: true, status: isTrusted ? 'approved' : 'pending',
  44  |             }],
  45  |         }],
  46  |     };
  47  | }
  48  | 
  49  | for (const pathname of ROOM_PATHS) {
  50  |     test(`refreshes an author's pending total and submissions after trust on ${pathname}`, async ({ page }) => {
  51  |         const isCommunity = pathname === '/cs/komunita';
  52  |         let isTrusted = false;
  53  |         const promotionRequests: unknown[] = [];
  54  |         const browserErrors: string[] = [];
  55  |         page.on('pageerror', (error) => browserErrors.push(error.message));
  56  | 
  57  |         // SQL transition/rollback is exercised in isolated PostgreSQL tests. Browser responses keep this test free
  58  |         // of role or content mutations in the configured database while exercising the actual room's API flow.
  59  |         await page.route('**/api/**', async (route) => {
  60  |             const request = route.request();
  61  |             const apiPath = new URL(request.url()).pathname;
  62  |             if (apiPath.endsWith('/participants/author') && request.method() === 'PATCH') {
  63  |                 promotionRequests.push(request.postDataJSON());
  64  |                 isTrusted = true;
  65  |                 return route.fulfill({ json: { participantId: 'author', isTrusted, isModerator: false, isInteractionBanned: false } });
  66  |             }
  67  |             if (apiPath.endsWith('/state')) {
  68  |                 return route.fulfill({ json: createRoomState(apiPath.split('/')[3], isCommunity, isTrusted) });
  69  |             }
  70  |             if (apiPath.endsWith('/projects')) {
  71  |                 return route.fulfill({ json: { isModerationOffered: true, projects: [{
  72  |                     id: 'project', title: PROJECT_TITLE, url: 'https://example.com/project', description: 'Sdílená ukázka',
  73  |                     previewImageUrl: null, status: isTrusted ? 'approved' : 'pending', authorName: AUTHOR_NAME,
  74  |                     upvoteCount: 0, downvoteCount: 0, voteByParticipant: null,
  75  |                     discussionWorkshopSlug: 'project-discussion', createdAt: SERVER_TIME,
  76  |                 }] } });
  77  |             }
  78  |             if (apiPath.endsWith('/membership')) {
  79  |                 return route.fulfill({ json: { status: 'none', isPurchaseOffered: false } });
  80  |             }
  81  |             return route.fulfill({ json: {} });
  82  |         });
  83  | 
  84  |         const response = await page.goto(pathname);
  85  |         test.skip(response?.status() === 404, 'The configured database has no published room for this route.');
> 86  |         await expect(page.getByText(`Čeká na schválení: ${isCommunity ? 3 : 2}`, { exact: true })).toBeVisible();
      |                                                                                                    ^ Error: expect(locator).toBeVisible() failed
  87  |         const authorProject = page.getByRole('article').filter({ has: page.getByRole('heading', { name: PROJECT_TITLE }) });
  88  |         if (isCommunity) await expect(authorProject.getByText('Čeká na schválení', { exact: true })).toBeVisible();
  89  | 
  90  |         await page.getByRole('button', { name: `Důvěřovat účastníkovi ${AUTHOR_NAME}`, exact: true }).click();
  91  | 
  92  |         await expect(page.getByText('Čeká na schválení: 0', { exact: true })).toBeVisible();
  93  |         await expect(page.getByRole('button', { name: `Odebrat důvěru účastníkovi ${AUTHOR_NAME}` })).toBeVisible();
  94  |         await expect(page.getByRole('button', { name: `Schválit komentář od ${AUTHOR_NAME}` })).toHaveCount(0);
  95  |         if (isCommunity) {
  96  |             await expect(authorProject.getByText('Čeká na schválení', { exact: true })).toHaveCount(0);
  97  |             await expect(authorProject.getByRole('link', { name: PROJECT_TITLE, exact: true })).toBeVisible();
  98  |         }
  99  |         expect(promotionRequests).toEqual([{ isTrusted: true }]);
  100 |         expect(browserErrors).toEqual([]);
  101 |     });
  102 | }
  103 | 
```## Local recording studio

`/admin/recording-studio` uses the existing admin login. Add each camera or screen share separately; a microphone
can be added as its own audio file. Camera previews are muted, cameras capture video only, and screen audio is
included when the browser's share picker supplies it. All sources start and stop in the same JavaScript turn.
This is software synchronization, not hardware genlock; the editor's manifest records measured start-call offsets.

Recordings stay in IndexedDB in the same browser profile, device, and site origin. Nothing is sent to the server.
Chunks and their metadata commit atomically; incomplete takes retain successfully saved chunks after reopening.
One browser tab holds the studio lock, including while recovering, editing, exporting, or deleting takes. Ending a
source or failing to save a chunk stops every recorder. Normal admin navigation and sign-out wait for recording or
export to finish, and closing/reloading during capture shows the existing browser warning.

Use a current desktop Chrome or Edge over HTTPS (localhost also works). Device limits, codecs, and screen/audio
capture depend on the browser and operating system. The displayed free capacity is **browser quota**, not a reading
of physical free disk space. Remaining time estimates use all tracks' configured bitrates initially and measured
saved bytes after capture starts, reserving 64 MiB for final chunks. Persistence is requested when recording begins;
the browser can decline it, clear site data, or run out of disk sooner. Download takes you want to keep.

The shared editor saves one trim range in seconds, applied to every track on the session timeline. ZIP exports
always contain unchanged `originals/` and `recording.json` (source names, dimensions, sizes, offsets, and trim range).
**ZIP s ořezem** also produces `trimmed/` copies using Mediabunny and browser codecs, preserving the source dimensions
and audio; trimming can re-encode, so originals remain the highest-quality material. A browser unable to process
every embedded track refuses trimmed export instead of silently dropping audio. **Originály ZIP** remains available.
Conversion uses temporary files in the origin-private filesystem, requiring room for one trimmed track at a time;
temporary files are removed after processing or on the next studio visit following an interrupted export.

ZIP64 archives stream directly to the chosen file when the browser offers the save-file picker, so large archives
need no full-memory buffer. Other browsers use a download fallback capped at 256 MiB to avoid exhausting memory.
The studio adds no environment variables, uploads, server APIs, or database migrations.

## Technology

- **Next.js 15** App Router, React, and TypeScript
- **Tailwind CSS** and Radix-based reusable UI components
- **PostgreSQL** migrations and server-side access through `pg`
- **Supabase** clients for data-backed public and administrative workflows
- **Vitest** unit/component tests and **Playwright** end-to-end tests
lib/recording-studio/recordingStudioStorage.ts:1:import { getCommonRecordingDuration, validateRecordingTrim } from './recordingStudioTiming';
lib/recording-studio/recordingStudioStorage.ts:2:import type { RecordingStorageEstimate, RecordingTrack, RecordingTrim, StudioRecording } from './recordingStudioTypes';
lib/recording-studio/recordingStudioStorage.ts:4:const RECORDING_DATABASE_NAME = 'promptbook-recording-studio';
lib/recording-studio/recordingStudioStorage.ts:6:const RECORDING_STORE = 'recordings';
lib/recording-studio/recordingStudioStorage.ts:10:    readonly recordingId: string;
lib/recording-studio/recordingStudioStorage.ts:25:            const chunks = database.createObjectStore(CHUNK_STORE, { keyPath: ['recordingId', 'trackId', 'sequence'] });
lib/recording-studio/recordingStudioStorage.ts:26:            chunks.createIndex('recordingId', 'recordingId');
lib/recording-studio/recordingStudioStorage.ts:56:    const recordings: StudioRecording[] = await readRequest(database.transaction(RECORDING_STORE).objectStore(RECORDING_STORE).getAll());
lib/recording-studio/recordingStudioStorage.ts:57:    return recordings.sort((first, second) => second.createdAt.localeCompare(first.createdAt));
lib/recording-studio/recordingStudioStorage.ts:60:export async function saveStudioRecording(recording: StudioRecording): Promise<void> {
lib/recording-studio/recordingStudioStorage.ts:64:    transaction.objectStore(RECORDING_STORE).put(recording);
lib/recording-studio/recordingStudioStorage.ts:69:export async function appendRecordingChunk(recording: StudioRecording, trackId: string, sequence: number, data: Blob): Promise<void> {
lib/recording-studio/recordingStudioStorage.ts:73:    transaction.objectStore(CHUNK_STORE).add({ recordingId: recording.id, trackId, sequence, data } satisfies RecordingChunk);
lib/recording-studio/recordingStudioStorage.ts:74:    transaction.objectStore(RECORDING_STORE).put(recording);
lib/recording-studio/recordingStudioStorage.ts:78:/** Keep disk-backed Blob references; never read the entire recording into an ArrayBuffer. */
lib/recording-studio/recordingStudioStorage.ts:79:export async function readRecordingTrack(recordingId: string, track: RecordingTrack): Promise<Blob> {
lib/recording-studio/recordingStudioStorage.ts:81:    const range = IDBKeyRange.bound([recordingId, track.id, 0], [recordingId, track.id, Number.MAX_SAFE_INTEGER]);
lib/recording-studio/recordingStudioStorage.ts:91:export async function editStudioRecording(recording: StudioRecording, title: string, trim: RecordingTrim): Promise<StudioRecording> {
lib/recording-studio/recordingStudioStorage.ts:92:    validateRecordingTrim(trim, recording.durationSeconds);
lib/recording-studio/recordingStudioStorage.ts:94:    const updated = { ...recording, title: title.trim(), trim };
lib/recording-studio/recordingStudioStorage.ts:99:export async function deleteStudioRecording(recordingId: string): Promise<void> {
lib/recording-studio/recordingStudioStorage.ts:103:    transaction.objectStore(RECORDING_STORE).delete(recordingId);
lib/recording-studio/recordingStudioStorage.ts:104:    const request = transaction.objectStore(CHUNK_STORE).index('recordingId').openCursor(IDBKeyRange.only(recordingId));
lib/recording-studio/recordingStudioStorage.ts:116:    const recordings = await listStudioRecordings();
lib/recording-studio/recordingStudioStorage.ts:117:    return Promise.all(recordings.map(async (recording) => {
lib/recording-studio/recordingStudioStorage.ts:118:        if (recording.status !== 'recording') return recording;
lib/recording-studio/recordingStudioStorage.ts:120:            ...recording, status: 'interrupted', durationSeconds: getCommonRecordingDuration(recording.tracks),
app/admin/recording-studio/page.tsx:1:import { RecordingStudio } from '@/components/recording-studio/RecordingStudio';
app/admin/recording-studio/page.tsx:3:import { RECORDING_STUDIO_PATH } from '@/lib/recording-studio/recordingStudioTypes';
lib/recording-studio/recordingStudioTiming.ts:4:} from './recordingStudioTypes';
lib/recording-studio/recordingStudioTiming.ts:8:export function getRecordingByteLength(recording: StudioRecording): number {
lib/recording-studio/recordingStudioTiming.ts:9:    return recording.tracks.reduce((total, track) => total + track.byteLength, 0);
lib/recording-studio/recordingStudioTiming.ts:18:export function getRecordingBytesPerSecond(sources: readonly RecordingSource[], recording: StudioRecording | null): number {
lib/recording-studio/recordingStudioTiming.ts:19:    if (recording && recording.durationSeconds >= 3 && getRecordingByteLength(recording) > 0) {
lib/recording-studio/recordingStudioTiming.ts:20:        return getRecordingByteLength(recording) / recording.durationSeconds;
lib/recording-studio/recordingStudioTiming.test.ts:2:import { createTestStudioRecording } from './recordingStudioTestUtilities';
lib/recording-studio/recordingStudioTiming.test.ts:3:import { estimateRecordingSeconds, getCommonRecordingDuration, getTrackTrim, validateRecordingTrim } from './recordingStudioTiming';
lib/recording-studio/recordingStudioTiming.test.ts:4:import { RECORDING_STORAGE_RESERVE_BYTES } from './recordingStudioTypes';
lib/recording-studio/recordingStudioTiming.test.ts:6:describe('shared recording timeline and quota estimates', () => {
lib/recording-studio/recordingStudioTiming.test.ts:8:        const recording = createTestStudioRecording();
lib/recording-studio/recordingStudioTiming.test.ts:10:        expect(getTrackTrim(trim, recording.tracks[0])).toEqual({ start: 2, end: 7 });
lib/recording-studio/recordingStudioTiming.test.ts:11:        expect(getTrackTrim(trim, recording.tracks[1], 0.5)).toEqual({ start: 2.498, end: 7.498 });
lib/recording-studio/recordingStudioTiming.test.ts:12:        expect(getTrackTrim({ startSeconds: 0, endSeconds: 5 }, recording.tracks[1]).start).toBe(-0.002);
lib/recording-studio/RecordingStudioCapture.ts:1:import { getRecordingErrorMessage } from './recordingStudioDevices';
lib/recording-studio/RecordingStudioCapture.ts:2:import { appendRecordingChunk, saveStudioRecording } from './recordingStudioStorage';
lib/recording-studio/RecordingStudioCapture.ts:3:import { getCommonRecordingDuration } from './recordingStudioTiming';
lib/recording-studio/RecordingStudioCapture.ts:7:} from './recordingStudioTypes';
lib/recording-studio/RecordingStudioCapture.ts:13:    readonly onProgress: (recording: StudioRecording) => void;
lib/recording-studio/RecordingStudioCapture.ts:19:    readonly recorder: MediaRecorder;
lib/recording-studio/RecordingStudioCapture.ts:28:    private resolveFinished!: (recording: StudioRecording | null) => void;
lib/recording-studio/RecordingStudioCapture.ts:30:    private recording: StudioRecording | null = null;
lib/recording-studio/RecordingStudioCapture.ts:50:            this.recording = {
lib/recording-studio/RecordingStudioCapture.ts:52:                status: 'recording', durationSeconds: 0, trim: null, errorMessage: null,
lib/recording-studio/RecordingStudioCapture.ts:55:            await saveStudioRecording(this.recording);
lib/recording-studio/RecordingStudioCapture.ts:56:            this.savedRecording = this.recording;
lib/recording-studio/RecordingStudioCapture.ts:58:            this.recording = { ...this.recording, createdAt: new Date().toISOString() };
lib/recording-studio/RecordingStudioCapture.ts:66:            this.options.onProgress(this.recording);
lib/recording-studio/RecordingStudioCapture.ts:97:        const mimeType = (isVideo ? VIDEO_MIME_TYPES : AUDIO_MIME_TYPES).find((candidate) => MediaRecorder.isTypeSupported(candidate));
lib/recording-studio/RecordingStudioCapture.ts:99:        const recorder = new MediaRecorder(source.stream, {
lib/recording-studio/RecordingStudioCapture.ts:129:        if (!this.recording) return;
lib/recording-studio/RecordingStudioCapture.ts:130:        this.recording = { ...this.recording, tracks: this.recording.tracks.map((track) => track.id === trackId ? { ...track, ...changes } : track) };
lib/recording-studio/RecordingStudioCapture.ts:134:        if (data.size === 0 || !this.recording || this.isWriteFailed) return;
lib/recording-studio/RecordingStudioCapture.ts:135:        const track = this.recording.tracks.find((candidate) => candidate.id === trackId)!;
lib/recording-studio/RecordingStudioCapture.ts:140:        this.recording = { ...this.recording, durationSeconds: this.elapsedSeconds() };
lib/recording-studio/RecordingStudioCapture.ts:141:        const snapshot = this.recording;
lib/recording-studio/recordingStudioDevices.ts:1:import type { RecordingSource, RecordingSourceKind } from './recordingStudioTypes';
lib/recording-studio/recordingStudioLock.ts:1:import { RECORDING_STUDIO_LOCK } from './recordingStudioTypes';
components/admin/adminNavigationConfig.ts:9:import { RECORDING_STUDIO_PATH } from '@/lib/recording-studio/recordingStudioTypes';
lib/recording-studio/recordingStudioTestUtilities.ts:1:import type { StudioRecording } from './recordingStudioTypes';
lib/recording-studio/recordingStudioTestUtilities.ts:5:        id: 'test-recording', title: 'Test recording', createdAt: '2026-09-20T12:00:00.000Z', status: 'complete',
lib/recording-studio/recordingStudioStorage.test.ts:3:import { appendRecordingChunk, deleteStudioRecording, editStudioRecording, listStudioRecordings, readRecordingTrack, recoverStudioRecordings, saveStudioRecording } from './recordingStudioStorage';
lib/recording-studio/recordingStudioStorage.test.ts:4:import { createTestStudioRecording } from './recordingStudioTestUtilities';
lib/recording-studio/recordingStudioStorage.test.ts:6:describe('durable recording storage', () => {
lib/recording-studio/recordingStudioStorage.test.ts:8:        for (const recording of await listStudioRecordings()) await deleteStudioRecording(recording.id);
lib/recording-studio/recordingStudioStorage.test.ts:11:        const recording = createTestStudioRecording();
lib/recording-studio/recordingStudioStorage.test.ts:12:        await saveStudioRecording(recording);
lib/recording-studio/recordingStudioStorage.test.ts:13:        const first = { ...recording, tracks: [{ ...recording.tracks[0], byteLength: 3, chunkCount: 1 }] };
lib/recording-studio/recordingStudioStorage.test.ts:21:        expect((await listStudioRecordings())[0].title).toBe(recording.title);
lib/recording-studio/recordingStudioStorage.test.ts:23:    it('recovers interrupted takes without changing finalized recordings or their original data', async () => {
lib/recording-studio/recordingStudioStorage.test.ts:24:        const recording = createTestStudioRecording();
lib/recording-studio/recordingStudioStorage.test.ts:25:        const interrupted = { ...recording, status: 'recording' as const, tracks: [{ ...recording.tracks[0], byteLength: 4, chunkCount: 1, durationSeconds: 4 }] };
lib/recording-studio/recordingStudioStorage.test.ts:36:        const recording = createTestStudioRecording();
lib/recording-studio/recordingStudioStorage.test.ts:37:        const stored = { ...recording, tracks: [{ ...recording.tracks[0], byteLength: 3, chunkCount: 1 }] };
lib/recording-studio/RecordingStudioCapture.test.ts:3:import type { RecordingSource, StudioRecording } from './recordingStudioTypes';
lib/recording-studio/RecordingStudioCapture.test.ts:6:vi.mock('./recordingStudioStorage', () => ({ appendRecordingChunk: STORAGE.append, saveStudioRecording: STORAGE.save }));
lib/recording-studio/RecordingStudioCapture.test.ts:16:    public start = vi.fn(() => { this.state = 'recording'; });
lib/recording-studio/RecordingStudioCapture.test.ts:31:    beforeEach(() => { TestRecorder.instances.length = 0; vi.stubGlobal('MediaRecorder', TestRecorder); STORAGE.append.mockReset().mockResolvedValue(undefined); STORAGE.save.mockReset().mockResolvedValue(undefined); });
lib/recording-studio/RecordingStudioCapture.test.ts:38:        expect(TestRecorder.instances.map((recorder) => recorder.state)).toEqual(['recording', 'recording']);
lib/recording-studio/recordingStudioTypes.ts:1:export const RECORDING_STUDIO_PATH = '/admin/recording-studio';
lib/recording-studio/recordingStudioTypes.ts:7:export const RECORDING_STUDIO_LOCK = 'promptbook-recording-studio';
lib/recording-studio/recordingStudioTypes.ts:42:    readonly status: 'recording' | 'complete' | 'interrupted';
lib/recording-studio/recordingStudioExport.ts:3:import { readRecordingTrack } from './recordingStudioStorage';
lib/recording-studio/recordingStudioExport.ts:4:import { getRecordingByteLength, validateRecordingTrim } from './recordingStudioTiming';
lib/recording-studio/recordingStudioExport.ts:5:import type { RecordingArchiveManifest, RecordingArchiveTrack, StudioRecording } from './recordingStudioTypes';
lib/recording-studio/recordingStudioExport.ts:13:export function recordingFileStem(recording: StudioRecording): string {
lib/recording-studio/recordingStudioExport.ts:14:    return `${recording.title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70) || 'recording'}-${recording.id.slice(0, 8)}`;
lib/recording-studio/recordingStudioExport.ts:18:export function chooseRecordingArchiveDestination(recording: StudioRecording): Promise<FileSystemFileHandle | null> {
lib/recording-studio/recordingStudioExport.ts:21:        suggestedName: `${recordingFileStem(recording)}.zip`, types: [{ description: 'ZIP archiv', accept: { 'application/zip': ['.zip'] } }],
lib/recording-studio/recordingStudioExport.ts:26:    readonly recording: StudioRecording;
lib/recording-studio/recordingStudioExport.ts:34:export async function exportRecordingArchive({ recording, destination, isTrimIncluded, signal, onProgress }: ArchiveExportOptions): Promise<void> {
lib/recording-studio/recordingStudioExport.ts:35:    const isTrimmed = isTrimIncluded && recording.trim !== null;
lib/recording-studio/recordingStudioExport.ts:36:    if (isTrimmed) validateRecordingTrim(recording.trim!, recording.durationSeconds);
lib/recording-studio/recordingStudioExport.ts:37:    if (!destination && getRecordingByteLength(recording) * (isTrimmed ? 2 : 1) > MAXIMUM_BUFFERED_EXPORT_BYTES) {
lib/recording-studio/recordingStudioExport.ts:45:        for (let index = 0; index < recording.tracks.length; index += 1) {
lib/recording-studio/recordingStudioExport.ts:46:            const track = recording.tracks[index];
lib/recording-studio/recordingStudioExport.ts:51:            const blob = await readRecordingTrack(recording.id, track);
lib/recording-studio/recordingStudioExport.ts:52:            onProgress(`Balení originálu ${index + 1}/${recording.tracks.length}: ${track.label}`);
lib/recording-studio/recordingStudioExport.ts:61:                const { withTrimmedRecordingTrack } = await import('./recordingStudioTrim');
lib/recording-studio/recordingStudioExport.ts:63:                    blob, track, trim: recording.trim!, signal,
lib/recording-studio/recordingStudioExport.ts:64:                    onProgress: (progress) => onProgress(`Ořez stopy ${index + 1}/${recording.tracks.length}: ${Math.round(progress * 100)} %`),
lib/recording-studio/recordingStudioExport.ts:74:            schemaVersion: 1, id: recording.id, title: recording.title, createdAt: recording.createdAt,
lib/recording-studio/recordingStudioExport.ts:75:            status: recording.status, errorMessage: recording.errorMessage, durationSeconds: recording.durationSeconds,
lib/recording-studio/recordingStudioExport.ts:76:            trim: recording.trim, isTrimIncluded: isTrimmed, tracks: exportedTracks,
lib/recording-studio/recordingStudioExport.ts:79:        await archive.add('recording.json', new TextReader(JSON.stringify(manifest, null, 2)), { signal });
lib/recording-studio/recordingStudioExport.ts:81:            recording.title, '', 'ORIGINALS: unmodified source files, one file per camera, screen share or microphone.',
lib/recording-studio/recordingStudioExport.ts:83:            'recording.json contains source names, dimensions, byte sizes, timing offsets and the shared trim range in seconds.',
lib/recording-studio/recordingStudioExport.ts:84:            'All MediaRecorders are started/stopped in one browser turn. This is not hardware frame synchronization.',
lib/recording-studio/recordingStudioExport.ts:87:            recording.status === 'interrupted' ? 'INTERRUPTED TAKE: only successfully saved chunks are present; the tail may be incomplete. Check each source before editing.' : '',
lib/recording-studio/recordingStudioExport.ts:91:        if (!destination && result instanceof Blob) downloadBlobFile({ fileName: `${recordingFileStem(recording)}.zip`, blob: result });
lib/recording-studio/recordingStudioTrim.ts:2:import { getTrackTrim } from './recordingStudioTiming';
lib/recording-studio/recordingStudioTrim.ts:3:import type { RecordingTrack, RecordingTrim } from './recordingStudioTypes';
lib/recording-studio/recordingStudioTrim.ts:5:const EXPORT_TEMPORARY_DIRECTORY = 'promptbook-recording-studio-exports';
lib/recording-studio/recordingStudioExport.test.ts:3:import { exportRecordingArchive } from './recordingStudioExport';
lib/recording-studio/recordingStudioExport.test.ts:4:import { createTestStudioRecording } from './recordingStudioTestUtilities';
lib/recording-studio/recordingStudioExport.test.ts:5:import type { RecordingArchiveManifest } from './recordingStudioTypes';
lib/recording-studio/recordingStudioExport.test.ts:9:vi.mock('./recordingStudioStorage', () => ({ readRecordingTrack: DOWNLOADS.read }));
lib/recording-studio/recordingStudioExport.test.ts:11:describe('recording archive exports', () => {
lib/recording-studio/recordingStudioExport.test.ts:14:        const recording = createTestStudioRecording();
lib/recording-studio/recordingStudioExport.test.ts:16:            recording: { ...recording, tracks: recording.tracks.map((track) => ({ ...track, byteLength: 14, chunkCount: 1 })), trim: { startSeconds: 1, endSeconds: 4 } },
lib/recording-studio/recordingStudioExport.test.ts:21:        expect(entries.map((entry) => entry.filename)).toEqual(['originals/01-camera.webm', 'originals/02-screen.webm', 'recording.json', 'README.txt']);
lib/recording-studio/recordingStudioExport.test.ts:41:            recording: createTestStudioRecording(), destination: { createWritable: async () => writable } as unknown as FileSystemFileHandle,
lib/recording-studio/recordingStudioExport.test.ts:49:        const recording = createTestStudioRecording();
lib/recording-studio/recordingStudioExport.test.ts:51:            recording: { ...recording, tracks: [{ ...recording.tracks[0], byteLength: 300 * 1024 * 1024 }] },

exec
/bin/zsh -lc 'cat lib/recording-studio/RecordingStudioCapture.ts lib/recording-studio/RecordingStudioCapture.test.ts' in /Users/hejny/work/aldaron
 succeeded in 0ms:
import { getRecordingErrorMessage } from './recordingStudioDevices';
import { appendRecordingChunk, saveStudioRecording } from './recordingStudioStorage';
import { getCommonRecordingDuration } from './recordingStudioTiming';
import {
    RECORDING_AUDIO_BITS_PER_SECOND, RECORDING_CHUNK_MILLISECONDS, RECORDING_MAX_PENDING_BYTES, RECORDING_VIDEO_BITS_PER_SECOND,
    type RecordingSource, type RecordingTrack, type StudioRecording,
} from './recordingStudioTypes';

const VIDEO_MIME_TYPES = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
const AUDIO_MIME_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];

type CaptureOptions = {
    readonly onProgress: (recording: StudioRecording) => void;
    readonly onStopping: () => void;
};

type RecorderEntry = {
    readonly source: RecordingSource;
    readonly recorder: MediaRecorder;
    readonly stopped: Promise<void>;
    readonly finish: () => void;
    isStarted: boolean;
};

/** Owns one shared clock, the all-source start/stop barrier, and an ordered, bounded disk-write queue. */
export class RecordingStudioCapture {
    public readonly finished: Promise<StudioRecording | null>;
    private resolveFinished!: (recording: StudioRecording | null) => void;
    private entries: RecorderEntry[] = [];
    private recording: StudioRecording | null = null;
    private savedRecording: StudioRecording | null = null;
    private writeQueue = Promise.resolve();
    private pendingBytes = 0;
    private startedAt = 0;
    private stoppedAt: number | null = null;
    private isStarting = true;
    private isStopping = false;
    private isWriteFailed = false;
    private errorMessage: string | null = null;
    private readonly removeListeners: (() => void)[] = [];

    public constructor(private readonly options: CaptureOptions) {
        this.finished = new Promise((resolve) => { this.resolveFinished = resolve; });
    }

    public async start(sources: readonly RecordingSource[]): Promise<void> {
        try {
            if (sources.length === 0) throw new Error('Nejprve přidejte zdroj.');
            for (const source of sources) this.entries.push(this.prepareRecorder(source));
            this.recording = {
                id: crypto.randomUUID(), title: `Záznam ${new Date().toLocaleString('cs-CZ')}`, createdAt: new Date().toISOString(),
                status: 'recording', durationSeconds: 0, trim: null, errorMessage: null,
                tracks: this.entries.map((entry) => this.describeTrack(entry)),
            };
            await saveStudioRecording(this.recording);
            this.savedRecording = this.recording;
            this.startedAt = performance.now();
            this.recording = { ...this.recording, createdAt: new Date().toISOString() };
            // No await between start calls: each recorder receives the same browser event-loop turn.
            for (const entry of this.entries) {
                if (entry.source.stream.getTracks().some((track) => track.readyState !== 'live')) throw new Error('Jeden ze zdrojů byl odpojen.');
                this.updateTrack(entry.source.id, { startOffsetSeconds: this.elapsedSeconds() });
                entry.recorder.start(RECORDING_CHUNK_MILLISECONDS);
                entry.isStarted = true;
            }
            this.options.onProgress(this.recording);
        } catch (error) {
            this.errorMessage = getRecordingErrorMessage(error);
            this.isStopping = true;
        } finally {
            this.isStarting = false;
        }
        if (this.isStopping) this.stop(this.errorMessage);
    }

    public stop(errorMessage: string | null = null): Promise<StudioRecording | null> {
        if (errorMessage && !this.errorMessage) this.errorMessage = errorMessage;
        this.isStopping = true;
        if (this.isStarting || this.stoppedAt !== null) return this.finished;
        this.stoppedAt = performance.now();
        this.options.onStopping();
        // Final dataavailable is delivered BEFORE stop. Wait for every stop and then all queued writes.
        for (const entry of this.entries) {
            if (!entry.isStarted) entry.finish();
            else if (entry.recorder.state !== 'inactive') entry.recorder.stop();
        }
        void this.finalize();
        return this.finished;
    }

    private elapsedSeconds(): number {
        return Math.max(0, ((this.stoppedAt ?? performance.now()) - this.startedAt) / 1000);
    }

    private prepareRecorder(source: RecordingSource): RecorderEntry {
        const isVideo = source.stream.getVideoTracks().length > 0;
        const mimeType = (isVideo ? VIDEO_MIME_TYPES : AUDIO_MIME_TYPES).find((candidate) => MediaRecorder.isTypeSupported(candidate));
        if (!mimeType) throw new Error('Prohlížeč nenabízí podporovaný formát záznamu. Zkuste Chrome nebo Edge.');
        const recorder = new MediaRecorder(source.stream, {
            mimeType, videoBitsPerSecond: RECORDING_VIDEO_BITS_PER_SECOND, audioBitsPerSecond: RECORDING_AUDIO_BITS_PER_SECOND,
        });
        let finish!: () => void;
        const stopped = new Promise<void>((resolve) => { finish = resolve; });
        recorder.ondataavailable = (event) => this.enqueueChunk(source.id, event.data);
        recorder.onerror = () => { void this.stop(`Nahrávání zdroje „${source.label}“ selhalo. Všechny stopy byly zastaveny.`); };
        recorder.onstop = () => {
            finish();
            if (!this.isStopping) void this.stop(`Zdroj „${source.label}“ skončil. Všechny stopy byly zastaveny.`);
        };
        for (const track of source.stream.getTracks()) {
            const handleEnded = () => { void this.stop(`Zdroj „${source.label}“ byl odpojen. Všechny stopy byly zastaveny.`); };
            track.addEventListener('ended', handleEnded);
            this.removeListeners.push(() => track.removeEventListener('ended', handleEnded));
        }
        return { source, recorder, stopped, finish, isStarted: false };
    }

    private describeTrack({ source, recorder }: RecorderEntry): RecordingTrack {
        const settings = source.stream.getVideoTracks()[0]?.getSettings();
        return {
            id: source.id, kind: source.kind, label: source.label, mimeType: recorder.mimeType,
            byteLength: 0, chunkCount: 0, startOffsetSeconds: 0, durationSeconds: 0,
            width: settings?.width ?? null, height: settings?.height ?? null, frameRate: settings?.frameRate ?? null,
            isAudioIncluded: source.stream.getAudioTracks().length > 0,
        };
    }

    private updateTrack(trackId: string, changes: Partial<RecordingTrack>): void {
        if (!this.recording) return;
        this.recording = { ...this.recording, tracks: this.recording.tracks.map((track) => track.id === trackId ? { ...track, ...changes } : track) };
    }

    private enqueueChunk(trackId: string, data: Blob): void {
        if (data.size === 0 || !this.recording || this.isWriteFailed) return;
        const track = this.recording.tracks.find((candidate) => candidate.id === trackId)!;
        this.updateTrack(trackId, {
            byteLength: track.byteLength + data.size, chunkCount: track.chunkCount + 1,
            durationSeconds: Math.max(0, this.elapsedSeconds() - track.startOffsetSeconds),
        });
        this.recording = { ...this.recording, durationSeconds: this.elapsedSeconds() };
        const snapshot = this.recording;
        this.pendingBytes += data.size;
        this.writeQueue = this.writeQueue.then(async () => {
            if (this.isWriteFailed) return;
            await appendRecordingChunk(snapshot, trackId, track.chunkCount, data);
            this.savedRecording = snapshot;
            this.options.onProgress(snapshot);
        }).catch((error: unknown) => {
            // Never append beyond a failed chunk: that would create an undecodable gap.
            this.isWriteFailed = true;
            void this.stop(getRecordingErrorMessage(error));
        }).finally(() => { this.pendingBytes -= data.size; });
        if (this.pendingBytes > RECORDING_MAX_PENDING_BYTES) {
            void this.stop('Úložiště nestíhá ukládat záznam. Nahrávání všech stop bylo zastaveno.');
        }
    }

    private async finalize(): Promise<void> {
        await Promise.all(this.entries.map((entry) => entry.stopped));
        await this.writeQueue;
        this.removeListeners.forEach((remove) => remove());
        const saved = this.savedRecording;
        if (!saved) {
            this.resolveFinished(null);
            return;
        }
        let result: StudioRecording = {
            ...saved, durationSeconds: getCommonRecordingDuration(saved.tracks),
            status: this.errorMessage ? 'interrupted' : 'complete', errorMessage: this.errorMessage,
        };
        try {
            await saveStudioRecording(result);
        } catch (error) {
            result = { ...result, status: 'interrupted', errorMessage: getRecordingErrorMessage(error) };
        }
        this.options.onProgress(result);
        this.resolveFinished(result);
    }
}
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RecordingStudioCapture } from './RecordingStudioCapture';
import type { RecordingSource, StudioRecording } from './recordingStudioTypes';

const STORAGE = vi.hoisted(() => ({ append: vi.fn(), save: vi.fn() }));
vi.mock('./recordingStudioStorage', () => ({ appendRecordingChunk: STORAGE.append, saveStudioRecording: STORAGE.save }));

class TestRecorder {
    static readonly instances: TestRecorder[] = [];
    static isTypeSupported = () => true;
    public state = 'inactive';
    public mimeType = 'video/webm';
    public ondataavailable: ((event: { data: Blob }) => void) | null = null;
    public onstop: (() => void) | null = null;
    public onerror: (() => void) | null = null;
    public start = vi.fn(() => { this.state = 'recording'; });
    public stop = vi.fn(() => {
        this.state = 'inactive';
        queueMicrotask(() => { this.emit('tail'); this.onstop?.(); });
    });
    public constructor() { TestRecorder.instances.push(this); }
    public emit(content: string) { this.ondataavailable?.({ data: new Blob([content]) }); }
}

function makeSource(id: string): RecordingSource {
    const track = Object.assign(new EventTarget(), { readyState: 'live', getSettings: () => ({ width: 640, height: 480, frameRate: 30 }) });
    return { id, kind: 'camera', label: id, stream: { getVideoTracks: () => [track], getAudioTracks: () => [], getTracks: () => [track] } as unknown as MediaStream };
}

describe('multi-source capture barriers and durable failure handling', () => {
    beforeEach(() => { TestRecorder.instances.length = 0; vi.stubGlobal('MediaRecorder', TestRecorder); STORAGE.append.mockReset().mockResolvedValue(undefined); STORAGE.save.mockReset().mockResolvedValue(undefined); });
    afterEach(() => vi.unstubAllGlobals());

    it('starts/stops every source together and waits for the last data event and its disk write', async () => {
        const onProgress = vi.fn();
        const capture = new RecordingStudioCapture({ onProgress, onStopping: vi.fn() });
        await capture.start([makeSource('one'), makeSource('two')]);
        expect(TestRecorder.instances.map((recorder) => recorder.state)).toEqual(['recording', 'recording']);
        let release!: () => void;
        STORAGE.append.mockImplementationOnce(() => new Promise<void>((resolve) => { release = resolve; }));
        const finish = vi.fn();
        const completion = capture.stop().then(finish);
        expect(TestRecorder.instances.map((recorder) => recorder.stop.mock.calls.length)).toEqual([1, 1]);
        await vi.waitFor(() => expect(STORAGE.append).toHaveBeenCalledTimes(1));
        expect(finish).not.toHaveBeenCalled();
        release();
        await completion;
        const result = finish.mock.calls[0][0] as StudioRecording;
        expect(result.status).toBe('complete');
        expect(result.tracks.map((track) => [track.byteLength, track.chunkCount])).toEqual([[4, 1], [4, 1]]);
        expect(STORAGE.append.mock.calls.map((call) => [call[1], call[2]])).toEqual([['one', 0], ['two', 0]]);
    });

    it('stops all sources when a device disconnects', async () => {
        const sources = [makeSource('one'), makeSource('two')];
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn() });
        await capture.start(sources);
        sources[1].stream.getTracks()[0].dispatchEvent(new Event('ended'));
        const result = await capture.finished;
        expect(TestRecorder.instances.every((recorder) => recorder.state === 'inactive')).toBe(true);
        expect(result?.status).toBe('interrupted');
        expect(result?.errorMessage).toContain('two');
    });

    it('keeps only acknowledged bytes after a quota failure and never writes beyond the gap', async () => {
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn() });
        await capture.start([makeSource('one'), makeSource('two')]);
        TestRecorder.instances[0].emit('good');
        await vi.waitFor(() => expect(STORAGE.append).toHaveBeenCalledTimes(1));
        STORAGE.append.mockRejectedValueOnce(new DOMException('Full', 'QuotaExceededError'));
        TestRecorder.instances[1].emit('lost');
        TestRecorder.instances[0].emit('also lost');
        const result = await capture.finished;
        expect(STORAGE.append).toHaveBeenCalledTimes(2);
        expect(result?.tracks.map((track) => track.byteLength)).toEqual([4, 0]);
        expect(result?.status).toBe('interrupted');
        expect(result?.errorMessage).toContain('plné');
        expect(TestRecorder.instances.every((recorder) => recorder.stop.mock.calls.length === 1)).toBe(true);
    });

    it('releases a partially started batch when a later recorder fails to start', async () => {
        const source = makeSource('two');
        Object.defineProperty(source.stream.getTracks()[0], 'readyState', { value: 'ended' });
        const capture = new RecordingStudioCapture({ onProgress: vi.fn(), onStopping: vi.fn() });
        await capture.start([makeSource('one'), source]);
        const result = await capture.finished;
        expect(result?.status).toBe('interrupted');
        expect(TestRecorder.instances[0].state).toBe('inactive');
        expect(TestRecorder.instances[1].start).not.toHaveBeenCalled();
    });
});

exec
/bin/zsh -lc "cat components/recording-studio/RecordingSourcePicker.tsx components/recording-studio/useRecordingStudio.ts && sed -n '1,85p' tests/e2e/.artifacts/participant-promotion-refr-a049d--after-trust-on-cs-komunita/error-context.md && sed -n '41,76p' README.md" in /Users/hejny/work/aldaron
 succeeded in 0ms:
'use client';

import { Button } from '@/components/ui/button';
import { getRecordingErrorMessage } from '@/lib/recording-studio/recordingStudioDevices';
import type { RecordingSourceKind } from '@/lib/recording-studio/recordingStudioTypes';
import { useEffect, useState } from 'react';

export function RecordingSourcePicker({ onAdd, onClose }: {
    readonly onAdd: (kind: RecordingSourceKind, deviceId: string) => Promise<void>;
    readonly onClose: () => void;
}) {
    const [kind, setKind] = useState<RecordingSourceKind>('camera');
    const [deviceId, setDeviceId] = useState('');
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    useEffect(() => {
        void navigator.mediaDevices.enumerateDevices().then(setDevices).catch(() => undefined);
    }, []);
    const matchingDevices = devices.filter((device) => device.kind === (kind === 'camera' ? 'videoinput' : 'audioinput'));
    return (
        <form className="space-y-5" onSubmit={(event) => {
            event.preventDefault();
            if (isAdding) return;
            setIsAdding(true); setErrorMessage(null);
            void onAdd(kind, deviceId).then(onClose).catch((error: unknown) => setErrorMessage(getRecordingErrorMessage(error))).finally(() => setIsAdding(false));
        }}>
            <label className="block text-sm font-medium">Typ zdroje
                <select className="mt-2 w-full rounded-lg border p-3" value={kind} disabled={isAdding} onChange={(event) => { setKind(event.target.value as RecordingSourceKind); setDeviceId(''); }}>
                    <option value="camera">Kamera</option><option value="screen">Obrazovka / okno / karta</option><option value="microphone">Mikrofon</option>
                </select>
            </label>
            {kind !== 'screen' && <label className="block text-sm font-medium">Zařízení
                <select className="mt-2 w-full rounded-lg border p-3" value={deviceId} disabled={isAdding} onChange={(event) => setDeviceId(event.target.value)}>
                    <option value="">Výchozí zařízení</option>
                    {matchingDevices.filter((device) => device.deviceId).map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Zařízení ${index + 1}`}</option>)}
                </select>
            </label>}
            <p className="text-sm leading-6 text-slate-500">
                {kind === 'camera' ? 'Kamera nahrává obraz. Zvuk přidejte jako samostatný mikrofon. Po prvním povolení se v nabídce objeví názvy dalších kamer.' :
                    kind === 'screen' ? 'Pro každé sdílení přidejte nový zdroj. Zvuk karty se nahraje, pokud jej povolíte ve výběru prohlížeče.' : 'Mikrofon bude samostatná zvuková stopa pro střihače.'}
            </p>
            {errorMessage && <p role="alert" className="text-sm text-red-700">{errorMessage}</p>}
            <Button type="submit" disabled={isAdding}>{isAdding ? 'Čekám na výběr…' : 'Připojit zdroj'}</Button>
        </form>
    );
}
'use client';

import { flushAdminSaves } from '@/lib/admin/adminPendingSaves';
import { protectAdminMutation } from '@/lib/admin/protectAdminMutation';
import { RecordingStudioCapture } from '@/lib/recording-studio/RecordingStudioCapture';
import { acquireRecordingSource, getRecordingErrorMessage, releaseRecordingSource } from '@/lib/recording-studio/recordingStudioDevices';
import { runWithRecordingStudioLock } from '@/lib/recording-studio/recordingStudioLock';
import { estimateRecordingStorage, recoverStudioRecordings } from '@/lib/recording-studio/recordingStudioStorage';
import {
    RECORDING_STORAGE_RESERVE_BYTES,
    type RecordingSource, type RecordingSourceKind, type RecordingStorageEstimate, type StudioRecording,
} from '@/lib/recording-studio/recordingStudioTypes';
import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_REFRESH_MILLISECONDS = 5_000;
const INITIAL_STORAGE_ESTIMATE: RecordingStorageEstimate = { availableBytes: null, quotaBytes: null, isPersistent: false };

export function useRecordingStudio() {
    const [sources, setSources] = useState<RecordingSource[]>([]);
    const [recordings, setRecordings] = useState<StudioRecording[]>([]);
    const [activeRecording, setActiveRecording] = useState<StudioRecording | null>(null);
    const [storage, setStorage] = useState(INITIAL_STORAGE_ESTIMATE);
    const [phase, setPhase] = useState<'loading' | 'idle' | 'starting' | 'recording' | 'stopping' | 'unavailable'>('loading');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const runtime = useRef({ isDisposed: false, isAddingSource: false, capture: null as RecordingStudioCapture | null, sources: [] as RecordingSource[] });

    const refreshStorage = useCallback(async () => {
        const estimate = await estimateRecordingStorage();
        if (runtime.current.isDisposed) return;
        setStorage(estimate);
        if (estimate.availableBytes !== null && estimate.availableBytes < RECORDING_STORAGE_RESERVE_BYTES) {
            void runtime.current.capture?.stop('Úložiště se blíží svému limitu. Všechny stopy byly zastaveny a uložené části zůstávají dostupné.');
        }
    }, []);

    useEffect(() => {
        const current = { isDisposed: false, isAddingSource: false, capture: null as RecordingStudioCapture | null, sources: [] as RecordingSource[] };
        runtime.current = current;
        if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined' || !window.indexedDB || !navigator.locks) {
            setErrorMessage('Studio potřebuje HTTPS (nebo localhost), záznam médií a místní úložiště. Otevřete ho v aktuálním Chrome nebo Edge na počítači.');
            setPhase('unavailable');
            return;
        }
        let releaseLock: (() => void) | undefined;
        const released = new Promise<void>((resolve) => { releaseLock = resolve; });
        // One owner also prevents another tab from deleting or recovering an active take.
        void runWithRecordingStudioLock(async (lock) => {
            if (current.isDisposed) return;
            if (!lock) {
                setErrorMessage('Studio už je otevřené v jiné kartě. Zavřete ji a obnovte tuto stránku.');
                setPhase('unavailable');
                return;
            }
            try {
                const recovered = await recoverStudioRecordings();
                const { clearRecordingExportTemporaryFiles } = await import('@/lib/recording-studio/recordingStudioTrim');
                await clearRecordingExportTemporaryFiles();
                if (!current.isDisposed) {
                    setRecordings(recovered);
                    setPhase('idle');
                    await refreshStorage();
                }
            } catch (error) {
                if (!current.isDisposed) { setErrorMessage(getRecordingErrorMessage(error)); setPhase('unavailable'); }
            }
            await released;
            await current.capture?.stop('Stránka studia byla zavřena.');
            // History navigation can unmount the page before an editor save or cancelled export settles.
            await flushAdminSaves();
        }).catch((error: unknown) => {
            if (!current.isDisposed) { setErrorMessage(getRecordingErrorMessage(error)); setPhase('unavailable'); }
        });
        const storageTimer = setInterval(() => { void refreshStorage(); }, STORAGE_REFRESH_MILLISECONDS);
        return () => {
            current.isDisposed = true;
            clearInterval(storageTimer);
            void current.capture?.stop('Stránka studia byla zavřena.').finally(() => current.sources.forEach(releaseRecordingSource));
            if (!current.capture) current.sources.forEach(releaseRecordingSource);
            releaseLock?.();
        };
    }, [refreshStorage]);

    const activeCreatedAt = activeRecording?.createdAt;
    useEffect(() => {
        if (phase !== 'recording' || !activeCreatedAt) return;
        const createdAt = new Date(activeCreatedAt).getTime();
        const update = () => setElapsedSeconds(Math.max(0, (Date.now() - createdAt) / 1000));
        update();
        const timer = setInterval(update, 250);
        return () => clearInterval(timer);
    }, [phase, activeCreatedAt]); // A persisted chunk must not reset the elapsed-time clock.

    const removeSource = (sourceId: string) => {
        if (runtime.current.capture) return;
        const source = runtime.current.sources.find((candidate) => candidate.id === sourceId);
        if (source) releaseRecordingSource(source);
        runtime.current.sources = runtime.current.sources.filter((candidate) => candidate.id !== sourceId);
        setSources([...runtime.current.sources]);
    };

    const addSource = async (kind: RecordingSourceKind, deviceId: string) => {
        const current = runtime.current;
        if (current.capture || current.isAddingSource || phase !== 'idle') return;
        current.isAddingSource = true;
        setErrorMessage(null);
        try {
            // Start capture before awaiting any storage operation, retaining the screen-picker gesture.
            const source = await acquireRecordingSource(kind, deviceId);
            if (current.isDisposed) { releaseRecordingSource(source); return; }
            current.sources.push(source);
            source.stream.getTracks().forEach((track) => track.addEventListener('ended', () => {
                if (current.isDisposed || current.capture) return;
                removeSource(source.id);
                setErrorMessage(`Zdroj „${source.label}“ byl odpojen. Přidejte ho znovu.`);
            }, { once: true }));
            setSources([...current.sources]);
        } finally {
            current.isAddingSource = false;
        }
    };

    const startRecording = () => {
        const current = runtime.current;
        if (phase !== 'idle' || current.capture || current.isAddingSource || current.sources.length === 0) return;
        setErrorMessage(null);
        setElapsedSeconds(0);
        setActiveRecording(null);
        setPhase('starting');
        // Reuse admin navigation, sign-out and beforeunload protection for the entire recording lifetime.
        void protectAdminMutation(async () => {
            try {
                const estimate = await estimateRecordingStorage();
                if (estimate.availableBytes !== null && estimate.availableBytes < RECORDING_STORAGE_RESERVE_BYTES) throw new Error('Pro další záznam chybí místo. Nejdřív stáhněte a smažte starší záznamy.');
                if (current.isDisposed) return;
                void navigator.storage?.persist?.().then(() => refreshStorage()).catch(() => undefined);
                const capture = new RecordingStudioCapture({
                    onProgress: (recording) => { if (!current.isDisposed) setActiveRecording(recording); },
                    onStopping: () => { if (!current.isDisposed) setPhase('stopping'); },
                });
                current.capture = capture;
                await capture.start(current.sources);
                if (!current.isDisposed) setPhase((previous) => previous === 'starting' ? 'recording' : previous);
                const recording = await capture.finished;
                if (recording && !current.isDisposed) {
                    setRecordings((previous) => [recording, ...previous.filter((item) => item.id !== recording.id)]);
                    setErrorMessage(recording.errorMessage);
                } else if (!recording && !current.isDisposed) {
                    setErrorMessage('Záznam se nepodařilo zahájit. Zkontrolujte zdroje a dostupnost úložiště.');
                }
            } catch (error) {
                if (!current.isDisposed) setErrorMessage(getRecordingErrorMessage(error));
            } finally {
                current.capture = null;
                current.sources.forEach(releaseRecordingSource);
                current.sources = [];
                if (!current.isDisposed) {
                    setSources([]); setActiveRecording(null); setPhase('idle');
                    await refreshStorage();
                }
            }
        });
    };

    return {
        sources, recordings, activeRecording, storage, phase, errorMessage, elapsedSeconds,
        addSource, removeSource, startRecording, stopRecording: () => { void runtime.current.capture?.stop(); },
        setErrorMessage, refreshStorage,
        updateRecording: (recording: StudioRecording) => setRecordings((previous) => previous.map((item) => item.id === recording.id ? recording : item)),
        removeRecording: (recordingId: string) => setRecordings((previous) => previous.filter((item) => item.id !== recordingId)),
    };
}
# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: participant-promotion.spec.ts >> refreshes an author's pending total and submissions after trust on /cs/komunita
- Location: tests/e2e/participant-promotion.spec.ts:50:9

# Error details

```
Test timeout of 180000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Čeká na schválení: 3', { exact: true })
Expected: visible
Timeout: 30000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 30000ms
  - waiting for getByText('Čeká na schválení: 3', { exact: true })

```

```yaml
- group "Barevný režim":
  - button "Podle zařízení" [pressed]
  - button "Světlý režim"
  - button "Tmavý režim"
- main:
  - img "Ověřuji připojení"
- alert
- region "Cookies":
  - heading "Cookies" [level=2]
  - paragraph: Cookies používáme, aby web fungoval, abychom rozuměli návštěvnosti a měřili účinnost reklamy. Tlačítkem „Přijmout vše“ nám k tomu dáte souhlas.
  - paragraph:
    - text: Podrobnosti najdete v
    - link "zásadách ochrany osobních údajů":
      - /url: /cs/ochrana-osobnich-udaju
    - text: .
  - button "Nastavit"
  - button "Přijmout vše"
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test';
  2   | import { DEFAULT_EVENT_DETAILS } from '../../lib/events/event';
  3   | import type { WorkshopPublicState } from '../../lib/workshops/workshopTypes';
  4   | 
  5   | const SERVER_TIME = '2026-09-20T10:00:00.000Z';
  6   | const AUTHOR_NAME = 'Jana Nováková';
  7   | const PROJECT_TITLE = 'Projekt čekajícího autora';
  8   | const ROOM_PATHS = ['/cs/online-workshop/participant', '/cs/komunita'] as const;
  9   | 
  10  | test.use({ serviceWorkers: 'block' });
  11  | 
  12  | function createRoomState(slug: string, isCommunity: boolean, isTrusted: boolean): WorkshopPublicState {
  13  |     return {
  14  |         serverTime: isTrusted ? '2026-09-20T10:00:01.000Z' : SERVER_TIME,
  15  |         workshop: {
  16  |             id: 'moderation-room', slug, kind: isCommunity ? 'community' : 'workshop',
  17  |             event: isCommunity ? null : DEFAULT_EVENT_DETAILS, title: 'Moderace účastníků', description: '',
  18  |             startsAt: SERVER_TIME, endsAt: null, youtubeVideoId: null, recordingStartOffsetSeconds: 0,
  19  |             previewYoutubeVideoId: null, presentationUrl: null, repository: null, isPublished: true,
  20  |             allowedReactions: [], disabledPanels: [], createdAt: SERVER_TIME, updatedAt: SERVER_TIME,
  21  |         },
  22  |         participant: {
  23  |             id: 'moderator', fullname: 'Moderátor místnosti', email: 'moderator@example.com',
  24  |             connectedAt: SERVER_TIME, isTrusted: false, isModerator: true, isInteractionBanned: false,
  25  |         },
  26  |         contentBlocks: [], paidMembersOnlyContentPreviews: [], paidMembersOnlyVideo: null,
  27  |         nextContentUnlockAt: null, feedback: null, stageComment: null, watchingParticipantCount: 1,
  28  |         recentReactions: [], reactionCounts: [],
  29  |         comments: [{
  30  |             id: 'comment', authorName: AUTHOR_NAME, body: 'Prosím o schválení příspěvků.',
  31  |             status: isTrusted ? 'approved' : 'pending', upvoteCount: 0, isUpvotedByParticipant: false,
## Local recording studio

`/admin/recording-studio` uses the existing admin login. Add each camera or screen share separately; a microphone
can be added as its own audio file. Camera previews are muted, cameras capture video only, and screen audio is
included when the browser's share picker supplies it. All sources start and stop in the same JavaScript turn.
This is software synchronization, not hardware genlock; the editor's manifest records measured start-call offsets.

Recordings stay in IndexedDB in the same browser profile, device, and site origin. Nothing is sent to the server.
Chunks and their metadata commit atomically; incomplete takes retain successfully saved chunks after reopening.
One browser tab holds the studio lock, including while recovering, editing, exporting, or deleting takes. Ending a
source or failing to save a chunk stops every recorder. Normal admin navigation and sign-out wait for recording or
export to finish, and closing/reloading during capture shows the existing browser warning.

Use a current desktop Chrome or Edge over HTTPS (localhost also works). Device limits, codecs, and screen/audio
capture depend on the browser and operating system. The displayed free capacity is **browser quota**, not a reading
of physical free disk space. Remaining time estimates use all tracks' configured bitrates initially and measured
saved bytes after capture starts, reserving 64 MiB for final chunks. Persistence is requested when recording begins;
the browser can decline it, clear site data, or run out of disk sooner. Download takes you want to keep.

The shared editor saves one trim range in seconds, applied to every track on the session timeline. ZIP exports
always contain unchanged `originals/` and `recording.json` (source names, dimensions, sizes, offsets, and trim range).
**ZIP s ořezem** also produces `trimmed/` copies using Mediabunny and browser codecs, preserving the source dimensions
and audio; trimming can re-encode, so originals remain the highest-quality material. A browser unable to process
every embedded track refuses trimmed export instead of silently dropping audio. **Originály ZIP** remains available.
Conversion uses temporary files in the origin-private filesystem, requiring room for one trimmed track at a time;
temporary files are removed after processing or on the next studio visit following an interrupted export.

ZIP64 archives stream directly to the chosen file when the browser offers the save-file picker, so large archives
need no full-memory buffer. Other browsers use a download fallback capped at 256 MiB to avoid exhausting memory.
The studio adds no environment variables, uploads, server APIs, or database migrations.

## Technology

- **Next.js 15** App Router, React, and TypeScript
- **Tailwind CSS** and Radix-based reusable UI components
- **PostgreSQL** migrations and server-side access through `pg`

exec
/bin/zsh -lc "lsof -nP -iTCP:4009 -sTCP:LISTEN && node --version && rg -n 'AudioContext|launchOptions|fake.*media' tests playwright.config.ts" in /Users/hejny/work/aldaron
 exited 1 in 0ms:
codex
The failed archive contains all five track entries, but the two screen tracks and microphone track have zero bytes before export. The cameras recorded normally. I’m checking why audio-bearing sources produced no data; the ZIP writer appears to be preserving the stored result correctly.

exec
/bin/zsh -lc "rg -n 'AudioContext|launchOptions|fake.*media' tests playwright.config.ts && sed -n '160,250p' tests/e2e/recording-studio.spec.ts" in /Users/hejny/work/aldaron
 succeeded in 0ms:
tests/e2e/recording-studio.spec.ts:37:                const context = new AudioContext();
});

test('stops the whole take on disconnect and prevents a second tab from changing it', async ({ page, baseURL }) => {
    await openStudio(page, baseURL);
    await addSource(page, 'camera');
    await addSource(page, 'screen');
    await page.getByRole('button', { name: 'Nahrávat všechny zdroje', exact: true }).click();
    await expect(page.getByLabel('Délka záznamu', { exact: true })).toHaveText('00:00:02');
    const secondPage = await page.context().newPage();
    await secondPage.goto('/admin/recording-studio');
    await expect(secondPage.getByRole('alert').filter({ hasText: 'Studio už' })).toContainText('jiné kartě');
    await secondPage.close();
    await page.evaluate(() => {
        const streams = (window as unknown as { studioTestStreams: MediaStream[] }).studioTestStreams;
        const track = streams[1].getVideoTracks()[0];
        track.stop(); track.dispatchEvent(new Event('ended'));
    });
    await expect(page.getByText('Přerušený záznam', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Originály ZIP', exact: true })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Zastavit všechny stopy', exact: true })).toHaveCount(0);
});

test('recovers persisted chunks after an interrupted page and waits for stop before admin navigation', async ({ page, baseURL }) => {
    await openStudio(page, baseURL);
    await addSource(page, 'camera');
    await addSource(page, 'screen');
    await page.getByRole('button', { name: 'Nahrávat všechny zdroje', exact: true }).click();
    await expect(page.getByLabel('Délka záznamu', { exact: true })).toHaveText('00:00:03');
    const dialogPromise = page.waitForEvent('dialog');
    const reload = page.evaluate(() => window.location.reload());
    const dialog = await dialogPromise;
    expect(dialog.type()).toBe('beforeunload');
    await dialog.accept();
    await reload.catch(() => undefined);
    await expect(page.getByText('Přerušený záznam', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Originály ZIP', exact: true })).toBeEnabled();
    await addSource(page, 'camera');
    await page.getByRole('button', { name: 'Nahrávat všechny zdroje', exact: true }).click();
    await expect(page.getByLabel('Délka záznamu', { exact: true })).toHaveText('00:00:02');
    await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/recording-studio$/);
    await page.getByRole('button', { name: 'Zastavit všechny stopy', exact: true }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await page.getByRole('link', { name: 'Nahrávací studio', exact: true }).click();
    await expect(page.getByText('Uloženo', { exact: true })).toBeVisible();
    await expect(page.getByText('Přerušený záznam', { exact: true })).toBeVisible();
});

exec
/bin/zsh -lc 'mkdir -p /tmp/aldaron-test-failure-evidence && cp tests/e2e/.artifacts/participant-promotion-refr-a049d--after-trust-on-cs-komunita/trace.zip /tmp/aldaron-test-failure-evidence/community-trace.zip && cp tests/e2e/.artifacts/participant-promotion-refr-c986f-online-workshop-participant/trace.zip /tmp/aldaron-test-failure-evidence/workshop-trace.zip && npm run test-e2e -- tests/e2e/recording-studio.spec.ts' in /Users/hejny/work/aldaron
exec
/bin/zsh -lc "node --input-type=module <<'JAVASCRIPT'
import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage();
page.on('console', message => console.log(message.type(), message.text()));
await page.setContent('<button>Start audio</button>');
await page.locator('button').evaluate(button => button.addEventListener('click', async () => {
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const destination = context.createMediaStreamDestination();
  oscillator.connect(destination); oscillator.start();
  window.audioDiagnostic = {context, oscillator, destination, chunks: []};
  const recorder = new MediaRecorder(destination.stream, {mimeType: 'audio/webm;codecs=opus'});
  window.audioDiagnostic.recorder = recorder;
  recorder.ondataavailable = event => window.audioDiagnostic.chunks.push(event.data.size);
  await context.resume();
  recorder.start(250);
}));
await page.locator('button').click();
await page.waitForTimeout(2000);
console.log(await page.evaluate(() => ({state: audioDiagnostic.context.state, time: audioDiagnostic.context.currentTime, recorder: audioDiagnostic.recorder.state, chunks: audioDiagnostic.chunks, audio: audioDiagnostic.destination.stream.getAudioTracks().map(track => ({state: track.readyState, isMuted: track.muted, isEnabled: track.enabled}))})));
await browser.close();
JAVASCRIPT" in /Users/hejny/work/aldaron
 succeeded in 2344ms:
{
  state: 'running',
  time: 0.005333333333333333,
  recorder: 'recording',
  chunks: [],
  audio: [ { state: 'live', isMuted: false, isEnabled: true } ]
}

exec
/bin/zsh -lc "python3 <<'PYTHON'
import json, zipfile
for filename in ['community-trace.zip', 'workshop-trace.zip']:
    print(filename)
    with zipfile.ZipFile('/tmp/aldaron-test-failure-evidence/' + filename) as archive:
        for name in archive.namelist():
            if name.endswith('.trace'):
                for line in archive.read(name).decode().splitlines():
                    event = json.loads(line)
                    if event['type'] == 'before' and event.get('method') in ['goto','expect']:
                        print({key: event[key] for key in ['type','startTime','method','params','callId'] if key in event})
                    if event['type'] == 'after' and event.get('error'):
                        print({key: event[key] for key in ['type','endTime','callId','error'] if key in event})
            if name.endswith('.network'):
                events = [json.loads(line) for line in archive.read(name).decode().splitlines()]
                for event in events:
                    snapshot = event.get('snapshot', {})
                    request = snapshot.get('request', {})
                    response = snapshot.get('response', {})
                    if '/api/' in request.get('url', '') or snapshot.get('time', 0) > 5000 or response.get('status', 200) >= 400:
                        print({'url': request.get('url','').split('?')[0], 'status': response.get('status'), 'time': snapshot.get('time'), 'failure': snapshot.get('_failureText')})
PYTHON" in /Users/hejny/work/aldaron
 succeeded in 145ms:
community-trace.zip
{'type': 'before', 'startTime': 993492.6, 'method': 'expect', 'params': {}, 'callId': 'expect@35'}
{'type': 'after', 'endTime': 1023499.302, 'callId': 'expect@35', 'error': {'name': '', 'message': 'Error: \x1b[2mexpect(\x1b[22m\x1b[31mlocator\x1b[39m\x1b[2m).\x1b[22mtoBeVisible\x1b[2m(\x1b[22m\x1b[2m)\x1b[22m failed\n\nLocator: getByText(\'Čeká na schválení: 3\', { exact: true })\nExpected: visible\nTimeout: 30000ms\nError: element(s) not found\n\nCall log:\n\x1b[2m  - Expect "toBeVisible" with timeout 30000ms\x1b[22m\n\x1b[2m  - waiting for getByText(\'Čeká na schválení: 3\', { exact: true })\x1b[22m\n', 'stack': 'Error: \x1b[2mexpect(\x1b[22m\x1b[31mlocator\x1b[39m\x1b[2m).\x1b[22mtoBeVisible\x1b[2m(\x1b[22m\x1b[2m)\x1b[22m failed\n\nLocator: getByText(\'Čeká na schválení: 3\', { exact: true })\nExpected: visible\nTimeout: 30000ms\nError: element(s) not found\n\nCall log:\n\x1b[2m  - Expect "toBeVisible" with timeout 30000ms\x1b[22m\n\x1b[2m  - waiting for getByText(\'Čeká na schválení: 3\', { exact: true })\x1b[22m\n\n    at /Users/hejny/work/aldaron/tests/e2e/participant-promotion.spec.ts:86:100'}}
{'type': 'before', 'startTime': 82846.695, 'method': 'goto', 'params': {'url': '/cs/komunita', 'waitUntil': 'load'}, 'callId': 'call@44'}
workshop-trace.zip
{'type': 'after', 'endTime': 78835.936, 'callId': 'pw:api@30', 'error': {'name': '', 'message': 'Error: page.goto: net::ERR_NETWORK_IO_SUSPENDED at http://127.0.0.1:4009/cs/online-workshop/participant\nCall log:\n\x1b[2m  - navigating to "http://127.0.0.1:4009/cs/online-workshop/participant", waiting until "load"\x1b[22m\n', 'stack': 'Error: page.goto: net::ERR_NETWORK_IO_SUSPENDED at http://127.0.0.1:4009/cs/online-workshop/participant\nCall log:\n\x1b[2m  - navigating to "http://127.0.0.1:4009/cs/online-workshop/participant", waiting until "load"\x1b[22m\n\n    at /Users/hejny/work/aldaron/tests/e2e/participant-promotion.spec.ts:84:37'}}
{'type': 'before', 'startTime': 78280.098, 'method': 'goto', 'params': {'url': '/cs/online-workshop/participant', 'waitUntil': 'load'}, 'callId': 'call@1716'}
{'type': 'after', 'endTime': 78696.088, 'callId': 'call@1716', 'error': {'message': 'net::ERR_NETWORK_IO_SUSPENDED at http://127.0.0.1:4009/cs/online-workshop/participant', 'stack': 'Error: net::ERR_NETWORK_IO_SUSPENDED at http://127.0.0.1:4009/cs/online-workshop/participant\n    at _FrameSession._navigate (/Users/hejny/work/aldaron/node_modules/playwright-core/lib/coreBundle.js:37451:17)\n    at _Frame.gotoImpl (/Users/hejny/work/aldaron/node_modules/playwright-core/lib/coreBundle.js:23080:28)', 'name': 'Error'}}

 exited 1 in 39214ms:
[WebServer] (node:21256) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] (node:21280) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] (node:21287) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] Database migrations skipped: DATABASE_URL is not configured.

Running 4 tests using 1 worker

(node:21316) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ✓  1 tests/e2e/recording-studio.spec.ts:76:5 › requires admin authentication for the recording studio (3.6s)
  ✘  2 tests/e2e/recording-studio.spec.ts:81:5 › records separate sources, restores them, trims every track and exports playable editor material (7.1s)
(node:21388) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ✘  3 tests/e2e/recording-studio.spec.ts:81:5 › records separate sources, restores them, trims every track and exports playable editor material (retry #1) (7.0s)
(node:21432) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ✓  4 tests/e2e/recording-studio.spec.ts:162:5 › stops the whole take on disconnect and prevents a second tab from changing it (4.6s)
  ✓  5 tests/e2e/recording-studio.spec.ts:182:5 › recovers persisted chunks after an interrupted page and waits for stop before admin navigation (9.1s)
Saved 6 E2E video(s) to tests/e2e/videos/.
Removed the E2E video(s) of 1 outdated run(s) from tests/e2e/videos/.


  1) tests/e2e/recording-studio.spec.ts:81:5 › records separate sources, restores them, trims every track and exports playable editor material 

    Error: expect(received).toHaveLength(expected)

    Expected length: 5
    Received length: 2
    Received array:  ["originals/01-camera.webm", "originals/02-camera.webm"]

       97 |     await page.getByRole('button', { name: 'Originály ZIP', exact: true }).click();
       98 |     const originals = await readArchive((await (await originalDownload).path())!);
    >  99 |     expect(Array.from(originals.keys()).filter((name) => name.startsWith('originals/'))).toHaveLength(5);
          |                                                                                          ^
      100 |     // Exercise the streaming disk path with a real writable file, without automating an OS save dialog.
      101 |     await page.evaluate(() => Object.defineProperty(window, 'showSaveFilePicker', {
      102 |         configurable: true, value: async () => (await navigator.storage.getDirectory()).getFileHandle('test-studio-export.zip', { create: true }),
        at /Users/hejny/work/aldaron/tests/e2e/recording-studio.spec.ts:99:90

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material/video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material/error-context.md

    attachment #4: trace (application/zip) ─────────────────────────────────────────────────────────
    tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material/trace.zip
    Usage:

        npx playwright show-trace tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

    Retry #1 ───────────────────────────────────────────────────────────────────────────────────────

    Error: expect(received).toHaveLength(expected)

    Expected length: 5
    Received length: 2
    Received array:  ["originals/01-camera.webm", "originals/02-camera.webm"]

       97 |     await page.getByRole('button', { name: 'Originály ZIP', exact: true }).click();
       98 |     const originals = await readArchive((await (await originalDownload).path())!);
    >  99 |     expect(Array.from(originals.keys()).filter((name) => name.startsWith('originals/'))).toHaveLength(5);
          |                                                                                          ^
      100 |     // Exercise the streaming disk path with a real writable file, without automating an OS save dialog.
      101 |     await page.evaluate(() => Object.defineProperty(window, 'showSaveFilePicker', {
      102 |         configurable: true, value: async () => (await navigator.storage.getDirectory()).getFileHandle('test-studio-export.zip', { create: true }),
        at /Users/hejny/work/aldaron/tests/e2e/recording-studio.spec.ts:99:90

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material-retry1/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material-retry1/video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material-retry1/error-context.md

    attachment #4: trace (application/zip) ─────────────────────────────────────────────────────────
    tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material-retry1/trace.zip
    Usage:

        npx playwright show-trace tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material-retry1/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

  1 failed
    tests/e2e/recording-studio.spec.ts:81:5 › records separate sources, restores them, trims every track and exports playable editor material 
  3 passed (38.9s)

web search: 
exec
/bin/zsh -lc "rg -n 'interface AudioContextOptions|sinkId|AudioSinkOptions' node_modules/typescript/lib/lib.dom.d.ts && python3 <<'PYTHON'
import json, zipfile
with zipfile.ZipFile('/tmp/aldaron-test-failure-evidence/community-trace.zip') as archive:
    for name in archive.namelist():
        if name.endswith('.network'):
            events = [json.loads(line) for line in archive.read(name).decode().splitlines()]
            print(name, len(events), json.dumps(events[0])[:1600] if events else '')
        if name.endswith('.trace') and name "'!= '"'test.trace':
            for line in archive.read(name).decode().splitlines():
                event=json.loads(line)
                if event['type'] in ('before','after','console','event'):
                    print(json.dumps(event)[:1400])
PYTHON" in /Users/hejny/work/aldaron
 succeeded in 0ms:
118:interface AudioContextOptions {
15497:     * The **`sinkId`** read-only property of the HTMLMediaElement interface returns a string that is the unique ID of the device to be used for playing audio output.
15500:     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/sinkId)
15502:    readonly sinkId: string;
15576:    setSinkId(sinkId: string): Promise<void>;
{"type": "before", "callId": "call@40", "startTime": 82807.438, "class": "BrowserContext", "method": "newPage", "params": {}, "stepId": "pw:api@28"}
{"type": "event", "time": 82845.03, "class": "BrowserContext", "method": "page", "params": {"pageId": "page@20d6b58f793a6d9bd8424cbee7f7631f"}}
{"type": "after", "callId": "call@40", "endTime": 82845.059, "result": {"page": "<Page>"}}
{"type": "before", "callId": "call@42", "startTime": 82845.969, "title": "Route requests", "class": "Page", "method": "setNetworkInterceptionPatterns", "params": {"patterns": [{"glob": "**/api/**"}]}, "stepId": "pw:api@29", "pageId": "page@20d6b58f793a6d9bd8424cbee7f7631f"}
{"type": "after", "callId": "call@42", "endTime": 82846.348}
{"type": "before", "callId": "call@44", "startTime": 82846.695, "class": "Frame", "method": "goto", "params": {"url": "/cs/komunita", "waitUntil": "load"}, "stepId": "pw:api@30", "pageId": "page@20d6b58f793a6d9bd8424cbee7f7631f", "beforeSnapshot": "before@call@44"}
{"type": "console", "messageType": "error", "text": "Failed to load resource: net::ERR_CONNECTION_RESET", "args": [], "location": {"url": "https://www.googletagmanager.com/gtag/js?id=G-LDZBXVZHT0", "lineNumber": 0, "columnNumber": 0}, "time": 988620.107, "pageId": "page@20d6b58f793a6d9bd8424cbee7f7631f"}
{"type": "console", "messageType": "error", "text": "Failed to load resource: net::ERR_CONNECTION_RESET", "args": [], "location": {"url": "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap", "lineNumber": 0, "columnNumber": 0}, "time": 988624.036, "pageId": "page@20d6b58f793a6d9bd8424cbee7f7631f"}
0-trace.network 15 {"type": "resource-snapshot", "snapshot": {"pageref": "page@20d6b58f793a6d9bd8424cbee7f7631f", "startedDateTime": "2026-09-21T13:11:44.917Z", "time": 2350.466, "request": {"method": "GET", "url": "http://127.0.0.1:4009/cs/komunita", "httpVersion": "HTTP/1.1", "cookies": [], "headers": [{"name": "Accept", "value": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"}, {"name": "Accept-Language", "value": "en-US"}, {"name": "Upgrade-Insecure-Requests", "value": "1"}, {"name": "User-Agent", "value": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/151.0.7922.34 Safari/537.36"}, {"name": "sec-ch-ua", "value": "\"Not=A?Brand\";v=\"99\", \"HeadlessChrome\";v=\"151\", \"Chromium\";v=\"151\""}, {"name": "sec-ch-ua-mobile", "value": "?0"}, {"name": "sec-ch-ua-platform", "value": "\"macOS\""}], "queryString": [], "headersSize": 499, "bodySize": 0}, "response": {"status": 200, "statusText": "OK", "httpVersion": "HTTP/1.1", "cookies": [], "headers": [{"name": "Cache-Control", "value": "no-store, must-revalidate"}, {"name": "Connection", "value": "keep-alive"}, {"name": "Content-Encoding", "value": "gzip"}, {"name": "Content-Type", "value": "text/html; charset=utf-8"}, {"name": "Date", "value": "Mon, 21 Sep 2026 13:11:47 GMT"}, {"name": "Keep-Alive", "value": "timeout=5"}, {"name": "Transfer-Encoding", "value": "chunked"}, {"name": "Vary", "value": "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch, Accept-Encoding"}, {"

exec
/bin/zsh -lc "node --input-type=module <<'JAVASCRIPT'
import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage();
page.on('console', message => console.log(message.type(), message.text()));
await page.setContent('<button>Start audio</button>');
await page.locator('button').evaluate(button => button.addEventListener('click', async () => {
  const context = new AudioContext({sinkId: {type: 'none'}});
  const oscillator = context.createOscillator();
  const destination = context.createMediaStreamDestination();
  oscillator.connect(destination); oscillator.start();
  window.audioDiagnostic = {context, oscillator, destination, chunks: []};
  const recorder = new MediaRecorder(destination.stream, {mimeType: 'audio/webm;codecs=opus'});
  window.audioDiagnostic.recorder = recorder;
  recorder.ondataavailable = event => window.audioDiagnostic.chunks.push(event.data.size);
  await context.resume();
  recorder.start(250);
}));
await page.locator('button').click();
await page.waitForTimeout(2000);
console.log(await page.evaluate(() => ({state: audioDiagnostic.context.state, time: audioDiagnostic.context.currentTime, sink: audioDiagnostic.context.sinkId, recorder: audioDiagnostic.recorder.state, chunks: audioDiagnostic.chunks})));
await browser.close();
JAVASCRIPT" in /Users/hejny/work/aldaron
web search: site.developer.chrome.com AudioContext sinkId type none silent sink audio hardware
 succeeded in 2278ms:
{
  state: 'running',
  time: 0.005333333333333333,
  sink: undefined,
  recorder: 'recording',
  chunks: []
}

exec
/bin/zsh -lc "python3 <<'PYTHON'
import json, zipfile
with zipfile.ZipFile('/tmp/aldaron-test-failure-evidence/community-trace.zip') as archive:
    for name in archive.namelist():
        if name.endswith('.network'):
            for line in archive.read(name).decode().splitlines():
                snapshot = json.loads(line)['snapshot']
                print({'url': snapshot['request']['url'].split('?')[0], 'status': snapshot['response']['status'], 'time': snapshot['time'], 'failure': snapshot.get('_failureText')})
PYTHON" in /Users/hejny/work/aldaron
 succeeded in 0ms:
{'url': 'http://127.0.0.1:4009/cs/komunita', 'status': 200, 'time': 2350.466, 'failure': None}
{'url': 'http://127.0.0.1:4009/_next/static/css/app/cs/komunita/page.css', 'status': 200, 'time': 12.564, 'failure': None}
{'url': 'http://127.0.0.1:4009/_next/static/media/8e9860b6e62d6359-s.p.woff2', 'status': 200, 'time': 11.825, 'failure': None}
{'url': 'http://127.0.0.1:4009/_next/static/media/98848575513c9742-s.p.woff2', 'status': 200, 'time': 11.698, 'failure': None}
{'url': 'http://127.0.0.1:4009/_next/static/media/e4af272ccee01ff0-s.p.woff2', 'status': 200, 'time': 11.718, 'failure': None}
{'url': 'http://127.0.0.1:4009/_next/static/media/7b0b24f36b1a6d0b-s.p.woff2', 'status': 200, 'time': 10.463999999999999, 'failure': None}
{'url': 'http://127.0.0.1:4009/_next/static/css/app/layout.css', 'status': 200, 'time': 16.671999999999997, 'failure': None}
{'url': 'http://127.0.0.1:4009/_next/static/chunks/webpack.js', 'status': 200, 'time': 22.776, 'failure': None}
{'url': 'https://www.googletagmanager.com/gtag/js', 'status': 200, 'time': 72.31299999999999, 'failure': None}
{'url': 'https://fonts.googleapis.com/css2', 'status': -1, 'time': -1, 'failure': None}
{'url': 'http://127.0.0.1:4009/_next/static/chunks/main-app.js', 'status': -1, 'time': -1, 'failure': None}
{'url': 'http://127.0.0.1:4009/_next/static/chunks/app-pages-internals.js', 'status': -1, 'time': -1, 'failure': None}
{'url': 'http://127.0.0.1:4009/_next/static/chunks/app/layout.js', 'status': -1, 'time': -1, 'failure': None}
{'url': 'http://127.0.0.1:4009/_next/static/chunks/app/not-found.js', 'status': -1, 'time': -1, 'failure': None}
{'url': 'http://127.0.0.1:4009/_next/static/chunks/app/cs/komunita/page.js', 'status': -1, 'time': -1, 'failure': None}

exec
/bin/zsh -lc "node --input-type=module <<'JAVASCRIPT'
import { chromium } from '@playwright/test';
const browser = await chromium.launch();
for (const isSilent of [false, true]) {
  const page = await browser.newPage();
  await page.route('http://localhost:41799/**', route => route.fulfill({contentType:'text/html',body:'<button>Start audio</button>'}));
  await page.goto('http://localhost:41799/');
  await page.locator('button').evaluate((button, isSilent) => button.addEventListener('click', async () => {
    const context = new AudioContext(isSilent ? {sinkId: {type: 'none'}} : {});
    const oscillator = context.createOscillator();
    const destination = context.createMediaStreamDestination();
    oscillator.connect(destination); oscillator.start();
    window.audioDiagnostic = {context, oscillator, destination, chunks: []};
    const recorder = new MediaRecorder(destination.stream, {mimeType: 'audio/webm;codecs=opus'});
    window.audioDiagnostic.recorder = recorder;
    recorder.ondataavailable = event => window.audioDiagnostic.chunks.push(event.data.size);
    await context.resume();
    recorder.start(250);
  }), isSilent);
  await page.locator('button').click();
  await page.waitForTimeout(2000);
  console.log({isSilent, ...await page.evaluate(() => ({isSecure: isSecureContext, state: audioDiagnostic.context.state, time: audioDiagnostic.context.currentTime, sink: audioDiagnostic.context.sinkId, recorder: audioDiagnostic.recorder.state, chunks: audioDiagnostic.chunks}))});
  await page.close();
}
await browser.close();
JAVASCRIPT" in /Users/hejny/work/aldaron
 succeeded in 4413ms:
{
  isSilent: false,
  isSecure: true,
  state: 'running',
  time: 0.005333333333333333,
  sink: '',
  recorder: 'recording',
  chunks: []
}
{
  isSilent: true,
  isSecure: true,
  state: 'running',
  time: 2.005333333333333,
  sink: {},
  recorder: 'recording',
  chunks: [ 4026, 4846, 4846, 4846, 4846, 4846 ]
}

codex
I reproduced the cause: the test’s synthetic audio clock stalls on this machine despite reporting “running.” Using Chromium’s silent audio output produces real encoded audio without depending on a physical output device. I’ll make that change in the shared test fixture and keep every recording, ZIP, trim, and playback assertion.

The participant-promotion traces show suspended networking and incomplete page loads. I’ll rerun both alongside the recording tests.

apply patch
patch: completed
/Users/hejny/work/aldaron/AGENTS.md
/Users/hejny/work/aldaron/CHANGELOG.md
/Users/hejny/work/aldaron/README.md
/Users/hejny/work/aldaron/tests/e2e/recording-studio.spec.ts
diff --git a/AGENTS.md b/AGENTS.md
index 7ccd1cd9ab95fc3714da646dc39d1e229c1f4734..3314bd5373931a916150ca90931419129fe3c333
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -392,3 +392,5 @@
   independent and retry once in a fresh browser context for transient failures;
   failed-attempt traces remain available. Each attempt archives one recording in
   `tests/e2e/videos/`, retaining only recent runs.
+- Recording-studio E2E sources use canvas video and synthesized audio with a silent Web Audio output, independent
+  of physical audio-device clocks. Keep recording, storage, codecs, trimming, and ZIP exports real in these tests.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index c6fc7d8859d693c0e925481be24aed730141c0ac..a4a78ee8f8cc864ed0297a236e359c4051be9cf0
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,10 @@
 
 ## Unreleased
 
+- Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
+  microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
+  sources produce real media for the existing recording, ZIP, trimming, and playback checks.
+
 - Let administrators choose whether a community-membership discount code remains permanent or applies only to a
   selected number of monthly renewals. Stripe now receives the matching coupon, so a temporary reduction ends at the
   full subscription price without an application-side timer; existing codes remain permanent.
diff --git a/README.md b/README.md
index edf7257a302096b486cd1cc6bba29c38d579ac24..8b59b12ea2d48ba53b717d06b952e19f71aa3de3
--- a/README.md
+++ b/README.md
@@ -69,6 +69,9 @@
 need no full-memory buffer. Other browsers use a download fallback capped at 256 MiB to avoid exhausting memory.
 The studio adds no environment variables, uploads, server APIs, or database migrations.
 
+Its E2E tests supply canvas video and synthesized audio with a silent Web Audio output, so they need no physical
+camera, microphone, or working speaker device. Recording, storage, codecs, trimming, and ZIP exports remain real.
+
 ## Technology
 
 - **Next.js 15** App Router, React, and TypeScript
diff --git a/tests/e2e/recording-studio.spec.ts b/tests/e2e/recording-studio.spec.ts
index 5154b89d98ec838477b8c80f45cba785303770c5..0fa2dbe0f3b430e6f35901d97d826427321404e4
--- a/tests/e2e/recording-studio.spec.ts
+++ b/tests/e2e/recording-studio.spec.ts
@@ -15,7 +15,7 @@
         // Only replace physical devices/the permission picker. Recording, storage, codecs and ZIP are real.
         const streams: MediaStream[] = [];
         Object.assign(window, { studioTestStreams: streams });
-        const createStream = (isVideo: boolean, isAudio: boolean) => {
+        const createStream = async (isVideo: boolean, isAudio: boolean) => {
             const stream = new MediaStream();
             if (isVideo) {
                 const canvas = document.createElement('canvas');
@@ -34,15 +34,17 @@
                 stream.addTrack(videoTrack);
             }
             if (isAudio) {
-                const context = new AudioContext();
+                // Render real audio without a physical output device, whose clock may stall on a headless host.
+                const AUDIO_CONTEXT_OPTIONS: AudioContextOptions & { sinkId: { type: 'none' } } = { sinkId: { type: 'none' } };
+                const context = new AudioContext(AUDIO_CONTEXT_OPTIONS);
                 const oscillator = context.createOscillator();
                 const destination = context.createMediaStreamDestination();
                 oscillator.connect(destination); oscillator.start();
                 stream.addTrack(destination.stream.getAudioTracks()[0]);
-                void context.resume();
+                await context.resume();
             }
             streams.push(stream);
-            return Promise.resolve(stream);
+            return stream;
         };
         Object.defineProperties(navigator.mediaDevices, {
             getUserMedia: { value: (constraints: MediaStreamConstraints) => createStream(Boolean(constraints.video), Boolean(constraints.audio)) },

diff --git a/AGENTS.md b/AGENTS.md
index 7ccd1cd9ab95fc3714da646dc39d1e229c1f4734..3314bd5373931a916150ca90931419129fe3c333
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -392,3 +392,5 @@
   independent and retry once in a fresh browser context for transient failures;
   failed-attempt traces remain available. Each attempt archives one recording in
   `tests/e2e/videos/`, retaining only recent runs.
+- Recording-studio E2E sources use canvas video and synthesized audio with a silent Web Audio output, independent
+  of physical audio-device clocks. Keep recording, storage, codecs, trimming, and ZIP exports real in these tests.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index c6fc7d8859d693c0e925481be24aed730141c0ac..a4a78ee8f8cc864ed0297a236e359c4051be9cf0
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,10 @@
 
 ## Unreleased
 
+- Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
+  microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
+  sources produce real media for the existing recording, ZIP, trimming, and playback checks.
+
 - Let administrators choose whether a community-membership discount code remains permanent or applies only to a
   selected number of monthly renewals. Stripe now receives the matching coupon, so a temporary reduction ends at the
   full subscription price without an application-side timer; existing codes remain permanent.
diff --git a/README.md b/README.md
index edf7257a302096b486cd1cc6bba29c38d579ac24..8b59b12ea2d48ba53b717d06b952e19f71aa3de3
--- a/README.md
+++ b/README.md
@@ -69,6 +69,9 @@
 need no full-memory buffer. Other browsers use a download fallback capped at 256 MiB to avoid exhausting memory.
 The studio adds no environment variables, uploads, server APIs, or database migrations.
 
+Its E2E tests supply canvas video and synthesized audio with a silent Web Audio output, so they need no physical
+camera, microphone, or working speaker device. Recording, storage, codecs, trimming, and ZIP exports remain real.
+
 ## Technology
 
 - **Next.js 15** App Router, React, and TypeScript
diff --git a/tests/e2e/recording-studio.spec.ts b/tests/e2e/recording-studio.spec.ts
index 5154b89d98ec838477b8c80f45cba785303770c5..0fa2dbe0f3b430e6f35901d97d826427321404e4
--- a/tests/e2e/recording-studio.spec.ts
+++ b/tests/e2e/recording-studio.spec.ts
@@ -15,7 +15,7 @@
         // Only replace physical devices/the permission picker. Recording, storage, codecs and ZIP are real.
         const streams: MediaStream[] = [];
         Object.assign(window, { studioTestStreams: streams });
-        const createStream = (isVideo: boolean, isAudio: boolean) => {
+        const createStream = async (isVideo: boolean, isAudio: boolean) => {
             const stream = new MediaStream();
             if (isVideo) {
                 const canvas = document.createElement('canvas');
@@ -34,15 +34,17 @@
                 stream.addTrack(videoTrack);
             }
             if (isAudio) {
-                const context = new AudioContext();
+                // Render real audio without a physical output device, whose clock may stall on a headless host.
+                const AUDIO_CONTEXT_OPTIONS: AudioContextOptions & { sinkId: { type: 'none' } } = { sinkId: { type: 'none' } };
+                const context = new AudioContext(AUDIO_CONTEXT_OPTIONS);
                 const oscillator = context.createOscillator();
                 const destination = context.createMediaStreamDestination();
                 oscillator.connect(destination); oscillator.start();
                 stream.addTrack(destination.stream.getAudioTracks()[0]);
-                void context.resume();
+                await context.resume();
             }
             streams.push(stream);
-            return Promise.resolve(stream);
+            return stream;
         };
         Object.defineProperties(navigator.mediaDevices, {
             getUserMedia: { value: (constraints: MediaStreamConstraints) => createStream(Boolean(constraints.video), Boolean(constraints.audio)) },

exec
/bin/zsh -lc 'git diff --stat && git diff -- tests/e2e/recording-studio.spec.ts CHANGELOG.md AGENTS.md README.md' in /Users/hejny/work/aldaron
 succeeded in 0ms:
 AGENTS.md                          |  2 ++
 CHANGELOG.md                       |  4 ++++
 README.md                          |  3 +++
 tests/e2e/recording-studio.spec.ts | 10 ++++++----
 4 files changed, 15 insertions(+), 4 deletions(-)
diff --git a/AGENTS.md b/AGENTS.md
index 7ccd1cd..3314bd5 100644
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -392,3 +392,5 @@ use cases, and audiences. Keep these rules current when behavior changes.
   independent and retry once in a fresh browser context for transient failures;
   failed-attempt traces remain available. Each attempt archives one recording in
   `tests/e2e/videos/`, retaining only recent runs.
+- Recording-studio E2E sources use canvas video and synthesized audio with a silent Web Audio output, independent
+  of physical audio-device clocks. Keep recording, storage, codecs, trimming, and ZIP exports real in these tests.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index c6fc7d8..a4a78ee 100644
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,10 @@
 
 ## Unreleased
 
+- Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
+  microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
+  sources produce real media for the existing recording, ZIP, trimming, and playback checks.
+
 - Let administrators choose whether a community-membership discount code remains permanent or applies only to a
   selected number of monthly renewals. Stripe now receives the matching coupon, so a temporary reduction ends at the
   full subscription price without an application-side timer; existing codes remain permanent.
diff --git a/README.md b/README.md
index edf7257..8b59b12 100644
--- a/README.md
+++ b/README.md
@@ -69,6 +69,9 @@ ZIP64 archives stream directly to the chosen file when the browser offers the sa
 need no full-memory buffer. Other browsers use a download fallback capped at 256 MiB to avoid exhausting memory.
 The studio adds no environment variables, uploads, server APIs, or database migrations.
 
+Its E2E tests supply canvas video and synthesized audio with a silent Web Audio output, so they need no physical
+camera, microphone, or working speaker device. Recording, storage, codecs, trimming, and ZIP exports remain real.
+
 ## Technology
 
 - **Next.js 15** App Router, React, and TypeScript
diff --git a/tests/e2e/recording-studio.spec.ts b/tests/e2e/recording-studio.spec.ts
index 5154b89..0fa2dbe 100644
--- a/tests/e2e/recording-studio.spec.ts
+++ b/tests/e2e/recording-studio.spec.ts
@@ -15,7 +15,7 @@ async function openStudio(page: Page, baseURL: string | undefined) {
         // Only replace physical devices/the permission picker. Recording, storage, codecs and ZIP are real.
         const streams: MediaStream[] = [];
         Object.assign(window, { studioTestStreams: streams });
-        const createStream = (isVideo: boolean, isAudio: boolean) => {
+        const createStream = async (isVideo: boolean, isAudio: boolean) => {
             const stream = new MediaStream();
             if (isVideo) {
                 const canvas = document.createElement('canvas');
@@ -34,15 +34,17 @@ async function openStudio(page: Page, baseURL: string | undefined) {
                 stream.addTrack(videoTrack);
             }
             if (isAudio) {
-                const context = new AudioContext();
+                // Render real audio without a physical output device, whose clock may stall on a headless host.
+                const AUDIO_CONTEXT_OPTIONS: AudioContextOptions & { sinkId: { type: 'none' } } = { sinkId: { type: 'none' } };
+                const context = new AudioContext(AUDIO_CONTEXT_OPTIONS);
                 const oscillator = context.createOscillator();
                 const destination = context.createMediaStreamDestination();
                 oscillator.connect(destination); oscillator.start();
                 stream.addTrack(destination.stream.getAudioTracks()[0]);
-                void context.resume();
+                await context.resume();
             }
             streams.push(stream);
-            return Promise.resolve(stream);
+            return stream;
         };
         Object.defineProperties(navigator.mediaDevices, {
             getUserMedia: { value: (constraints: MediaStreamConstraints) => createStream(Boolean(constraints.video), Boolean(constraints.audio)) },

exec
/bin/zsh -lc 'npm test -- lib/recording-studio && git diff --check' in /Users/hejny/work/aldaron
exec
/bin/zsh -lc 'npm run test-e2e -- tests/e2e/recording-studio.spec.ts tests/e2e/participant-promotion.spec.ts' in /Users/hejny/work/aldaron
 succeeded in 893ms:

 RUN  v3.2.4 /Users/hejny/work/aldaron

 ✓ lib/recording-studio/recordingStudioTiming.test.ts (9 tests) 2ms
 ✓ lib/recording-studio/recordingStudioStorage.test.ts (3 tests) 10ms
 ✓ lib/recording-studio/recordingStudioExport.test.ts (3 tests) 13ms
 ✓ lib/recording-studio/RecordingStudioCapture.test.ts (4 tests) 119ms

 Test Files  4 passed (4)
      Tests  19 passed (19)
   Start at  15:35:06
   Duration  516ms (transform 107ms, setup 0ms, collect 196ms, tests 144ms, environment 0ms, prepare 158ms)


diff --git a/AGENTS.md b/AGENTS.md
index 7ccd1cd9ab95fc3714da646dc39d1e229c1f4734..3314bd5373931a916150ca90931419129fe3c333
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -392,3 +392,5 @@
   independent and retry once in a fresh browser context for transient failures;
   failed-attempt traces remain available. Each attempt archives one recording in
   `tests/e2e/videos/`, retaining only recent runs.
+- Recording-studio E2E sources use canvas video and synthesized audio with a silent Web Audio output, independent
+  of physical audio-device clocks. Keep recording, storage, codecs, trimming, and ZIP exports real in these tests.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index c6fc7d8859d693c0e925481be24aed730141c0ac..a4a78ee8f8cc864ed0297a236e359c4051be9cf0
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,10 @@
 
 ## Unreleased
 
+- Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
+  microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
+  sources produce real media for the existing recording, ZIP, trimming, and playback checks.
+
 - Let administrators choose whether a community-membership discount code remains permanent or applies only to a
   selected number of monthly renewals. Stripe now receives the matching coupon, so a temporary reduction ends at the
   full subscription price without an application-side timer; existing codes remain permanent.
diff --git a/README.md b/README.md
index edf7257a302096b486cd1cc6bba29c38d579ac24..8b59b12ea2d48ba53b717d06b952e19f71aa3de3
--- a/README.md
+++ b/README.md
@@ -69,6 +69,9 @@
 need no full-memory buffer. Other browsers use a download fallback capped at 256 MiB to avoid exhausting memory.
 The studio adds no environment variables, uploads, server APIs, or database migrations.
 
+Its E2E tests supply canvas video and synthesized audio with a silent Web Audio output, so they need no physical
+camera, microphone, or working speaker device. Recording, storage, codecs, trimming, and ZIP exports remain real.
+
 ## Technology
 
 - **Next.js 15** App Router, React, and TypeScript
diff --git a/tests/e2e/recording-studio.spec.ts b/tests/e2e/recording-studio.spec.ts
index 5154b89d98ec838477b8c80f45cba785303770c5..0fa2dbe0f3b430e6f35901d97d826427321404e4
--- a/tests/e2e/recording-studio.spec.ts
+++ b/tests/e2e/recording-studio.spec.ts
@@ -15,7 +15,7 @@
         // Only replace physical devices/the permission picker. Recording, storage, codecs and ZIP are real.
         const streams: MediaStream[] = [];
         Object.assign(window, { studioTestStreams: streams });
-        const createStream = (isVideo: boolean, isAudio: boolean) => {
+        const createStream = async (isVideo: boolean, isAudio: boolean) => {
             const stream = new MediaStream();
             if (isVideo) {
                 const canvas = document.createElement('canvas');
@@ -34,15 +34,17 @@
                 stream.addTrack(videoTrack);
             }
             if (isAudio) {
-                const context = new AudioContext();
+                // Render real audio without a physical output device, whose clock may stall on a headless host.
+                const AUDIO_CONTEXT_OPTIONS: AudioContextOptions & { sinkId: { type: 'none' } } = { sinkId: { type: 'none' } };
+                const context = new AudioContext(AUDIO_CONTEXT_OPTIONS);
                 const oscillator = context.createOscillator();
                 const destination = context.createMediaStreamDestination();
                 oscillator.connect(destination); oscillator.start();
                 stream.addTrack(destination.stream.getAudioTracks()[0]);
-                void context.resume();
+                await context.resume();
             }
             streams.push(stream);
-            return Promise.resolve(stream);
+            return stream;
         };
         Object.defineProperties(navigator.mediaDevices, {
             getUserMedia: { value: (constraints: MediaStreamConstraints) => createStream(Boolean(constraints.video), Boolean(constraints.audio)) },

diff --git a/AGENTS.md b/AGENTS.md
index 7ccd1cd9ab95fc3714da646dc39d1e229c1f4734..3314bd5373931a916150ca90931419129fe3c333
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -392,3 +392,5 @@
   independent and retry once in a fresh browser context for transient failures;
   failed-attempt traces remain available. Each attempt archives one recording in
   `tests/e2e/videos/`, retaining only recent runs.
+- Recording-studio E2E sources use canvas video and synthesized audio with a silent Web Audio output, independent
+  of physical audio-device clocks. Keep recording, storage, codecs, trimming, and ZIP exports real in these tests.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index c6fc7d8859d693c0e925481be24aed730141c0ac..a4a78ee8f8cc864ed0297a236e359c4051be9cf0
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,10 @@
 
 ## Unreleased
 
+- Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
+  microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
+  sources produce real media for the existing recording, ZIP, trimming, and playback checks.
+
 - Let administrators choose whether a community-membership discount code remains permanent or applies only to a
   selected number of monthly renewals. Stripe now receives the matching coupon, so a temporary reduction ends at the
   full subscription price without an application-side timer; existing codes remain permanent.
diff --git a/README.md b/README.md
index edf7257a302096b486cd1cc6bba29c38d579ac24..8b59b12ea2d48ba53b717d06b952e19f71aa3de3
--- a/README.md
+++ b/README.md
@@ -69,6 +69,9 @@
 need no full-memory buffer. Other browsers use a download fallback capped at 256 MiB to avoid exhausting memory.
 The studio adds no environment variables, uploads, server APIs, or database migrations.
 
+Its E2E tests supply canvas video and synthesized audio with a silent Web Audio output, so they need no physical
+camera, microphone, or working speaker device. Recording, storage, codecs, trimming, and ZIP exports remain real.
+
 ## Technology
 
 - **Next.js 15** App Router, React, and TypeScript
diff --git a/tests/e2e/recording-studio.spec.ts b/tests/e2e/recording-studio.spec.ts
index 5154b89d98ec838477b8c80f45cba785303770c5..0fa2dbe0f3b430e6f35901d97d826427321404e4
--- a/tests/e2e/recording-studio.spec.ts
+++ b/tests/e2e/recording-studio.spec.ts
@@ -15,7 +15,7 @@
         // Only replace physical devices/the permission picker. Recording, storage, codecs and ZIP are real.
         const streams: MediaStream[] = [];
         Object.assign(window, { studioTestStreams: streams });
-        const createStream = (isVideo: boolean, isAudio: boolean) => {
+        const createStream = async (isVideo: boolean, isAudio: boolean) => {
             const stream = new MediaStream();
             if (isVideo) {
                 const canvas = document.createElement('canvas');
@@ -34,15 +34,17 @@
                 stream.addTrack(videoTrack);
             }
             if (isAudio) {
-                const context = new AudioContext();
+                // Render real audio without a physical output device, whose clock may stall on a headless host.
+                const AUDIO_CONTEXT_OPTIONS: AudioContextOptions & { sinkId: { type: 'none' } } = { sinkId: { type: 'none' } };
+                const context = new AudioContext(AUDIO_CONTEXT_OPTIONS);
                 const oscillator = context.createOscillator();
                 const destination = context.createMediaStreamDestination();
                 oscillator.connect(destination); oscillator.start();
                 stream.addTrack(destination.stream.getAudioTracks()[0]);
-                void context.resume();
+                await context.resume();
             }
             streams.push(stream);
-            return Promise.resolve(stream);
+            return stream;
         };
         Object.defineProperties(navigator.mediaDevices, {
             getUserMedia: { value: (constraints: MediaStreamConstraints) => createStream(Boolean(constraints.video), Boolean(constraints.audio)) },

diff --git a/AGENTS.md b/AGENTS.md
index 7ccd1cd9ab95fc3714da646dc39d1e229c1f4734..3314bd5373931a916150ca90931419129fe3c333
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -392,3 +392,5 @@
   independent and retry once in a fresh browser context for transient failures;
   failed-attempt traces remain available. Each attempt archives one recording in
   `tests/e2e/videos/`, retaining only recent runs.
+- Recording-studio E2E sources use canvas video and synthesized audio with a silent Web Audio output, independent
+  of physical audio-device clocks. Keep recording, storage, codecs, trimming, and ZIP exports real in these tests.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index c6fc7d8859d693c0e925481be24aed730141c0ac..a4a78ee8f8cc864ed0297a236e359c4051be9cf0
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,10 @@
 
 ## Unreleased
 
+- Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
+  microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
+  sources produce real media for the existing recording, ZIP, trimming, and playback checks.
+
 - Let administrators choose whether a community-membership discount code remains permanent or applies only to a
   selected number of monthly renewals. Stripe now receives the matching coupon, so a temporary reduction ends at the
   full subscription price without an application-side timer; existing codes remain permanent.
diff --git a/README.md b/README.md
index edf7257a302096b486cd1cc6bba29c38d579ac24..8b59b12ea2d48ba53b717d06b952e19f71aa3de3
--- a/README.md
+++ b/README.md
@@ -69,6 +69,9 @@
 need no full-memory buffer. Other browsers use a download fallback capped at 256 MiB to avoid exhausting memory.
 The studio adds no environment variables, uploads, server APIs, or database migrations.
 
+Its E2E tests supply canvas video and synthesized audio with a silent Web Audio output, so they need no physical
+camera, microphone, or working speaker device. Recording, storage, codecs, trimming, and ZIP exports remain real.
+
 ## Technology
 
 - **Next.js 15** App Router, React, and TypeScript
diff --git a/tests/e2e/recording-studio.spec.ts b/tests/e2e/recording-studio.spec.ts
index 5154b89d98ec838477b8c80f45cba785303770c5..0fa2dbe0f3b430e6f35901d97d826427321404e4
--- a/tests/e2e/recording-studio.spec.ts
+++ b/tests/e2e/recording-studio.spec.ts
@@ -15,7 +15,7 @@
         // Only replace physical devices/the permission picker. Recording, storage, codecs and ZIP are real.
         const streams: MediaStream[] = [];
         Object.assign(window, { studioTestStreams: streams });
-        const createStream = (isVideo: boolean, isAudio: boolean) => {
+        const createStream = async (isVideo: boolean, isAudio: boolean) => {
             const stream = new MediaStream();
             if (isVideo) {
                 const canvas = document.createElement('canvas');
@@ -34,15 +34,17 @@
                 stream.addTrack(videoTrack);
             }
             if (isAudio) {
-                const context = new AudioContext();
+                // Render real audio without a physical output device, whose clock may stall on a headless host.
+                const AUDIO_CONTEXT_OPTIONS: AudioContextOptions & { sinkId: { type: 'none' } } = { sinkId: { type: 'none' } };
+                const context = new AudioContext(AUDIO_CONTEXT_OPTIONS);
                 const oscillator = context.createOscillator();
                 const destination = context.createMediaStreamDestination();
                 oscillator.connect(destination); oscillator.start();
                 stream.addTrack(destination.stream.getAudioTracks()[0]);
-                void context.resume();
+                await context.resume();
             }
             streams.push(stream);
-            return Promise.resolve(stream);
+            return stream;
         };
         Object.defineProperties(navigator.mediaDevices, {
             getUserMedia: { value: (constraints: MediaStreamConstraints) => createStream(Boolean(constraints.video), Boolean(constraints.audio)) },

 succeeded in 44757ms:
[WebServer] (node:22126) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] (node:22158) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] (node:22166) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] Database migrations skipped: DATABASE_URL is not configured.

Running 6 tests using 1 worker

(node:22200) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ✓  1 tests/e2e/participant-promotion.spec.ts:50:9 › refreshes an author's pending total and submissions after trust on /cs/online-workshop/participant (4.4s)
  ✓  2 tests/e2e/participant-promotion.spec.ts:50:9 › refreshes an author's pending total and submissions after trust on /cs/komunita (3.7s)
  ✓  3 tests/e2e/recording-studio.spec.ts:78:5 › requires admin authentication for the recording studio (2.1s)
  ✓  4 tests/e2e/recording-studio.spec.ts:83:5 › records separate sources, restores them, trims every track and exports playable editor material (14.9s)
  ✓  5 tests/e2e/recording-studio.spec.ts:164:5 › stops the whole take on disconnect and prevents a second tab from changing it (4.3s)
  ✓  6 tests/e2e/recording-studio.spec.ts:184:5 › recovers persisted chunks after an interrupted page and waits for stop before admin navigation (8.9s)
Saved 7 E2E video(s) to tests/e2e/videos/.
Removed the E2E video(s) of 1 outdated run(s) from tests/e2e/videos/.

  6 passed (44.5s)

diff --git a/AGENTS.md b/AGENTS.md
index 7ccd1cd9ab95fc3714da646dc39d1e229c1f4734..3314bd5373931a916150ca90931419129fe3c333
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -392,3 +392,5 @@
   independent and retry once in a fresh browser context for transient failures;
   failed-attempt traces remain available. Each attempt archives one recording in
   `tests/e2e/videos/`, retaining only recent runs.
+- Recording-studio E2E sources use canvas video and synthesized audio with a silent Web Audio output, independent
+  of physical audio-device clocks. Keep recording, storage, codecs, trimming, and ZIP exports real in these tests.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index c6fc7d8859d693c0e925481be24aed730141c0ac..a4a78ee8f8cc864ed0297a236e359c4051be9cf0
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,10 @@
 
 ## Unreleased
 
+- Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
+  microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
+  sources produce real media for the existing recording, ZIP, trimming, and playback checks.
+
 - Let administrators choose whether a community-membership discount code remains permanent or applies only to a
   selected number of monthly renewals. Stripe now receives the matching coupon, so a temporary reduction ends at the
   full subscription price without an application-side timer; existing codes remain permanent.
diff --git a/README.md b/README.md
index edf7257a302096b486cd1cc6bba29c38d579ac24..8b59b12ea2d48ba53b717d06b952e19f71aa3de3
--- a/README.md
+++ b/README.md
@@ -69,6 +69,9 @@
 need no full-memory buffer. Other browsers use a download fallback capped at 256 MiB to avoid exhausting memory.
 The studio adds no environment variables, uploads, server APIs, or database migrations.
 
+Its E2E tests supply canvas video and synthesized audio with a silent Web Audio output, so they need no physical
+camera, microphone, or working speaker device. Recording, storage, codecs, trimming, and ZIP exports remain real.
+
 ## Technology
 
 - **Next.js 15** App Router, React, and TypeScript
diff --git a/tests/e2e/recording-studio.spec.ts b/tests/e2e/recording-studio.spec.ts
index 5154b89d98ec838477b8c80f45cba785303770c5..0fa2dbe0f3b430e6f35901d97d826427321404e4
--- a/tests/e2e/recording-studio.spec.ts
+++ b/tests/e2e/recording-studio.spec.ts
@@ -15,7 +15,7 @@
         // Only replace physical devices/the permission picker. Recording, storage, codecs and ZIP are real.
         const streams: MediaStream[] = [];
         Object.assign(window, { studioTestStreams: streams });
-        const createStream = (isVideo: boolean, isAudio: boolean) => {
+        const createStream = async (isVideo: boolean, isAudio: boolean) => {
             const stream = new MediaStream();
             if (isVideo) {
                 const canvas = document.createElement('canvas');
@@ -34,15 +34,17 @@
                 stream.addTrack(videoTrack);
             }
             if (isAudio) {
-                const context = new AudioContext();
+                // Render real audio without a physical output device, whose clock may stall on a headless host.
+                const AUDIO_CONTEXT_OPTIONS: AudioContextOptions & { sinkId: { type: 'none' } } = { sinkId: { type: 'none' } };
+                const context = new AudioContext(AUDIO_CONTEXT_OPTIONS);
                 const oscillator = context.createOscillator();
                 const destination = context.createMediaStreamDestination();
                 oscillator.connect(destination); oscillator.start();
                 stream.addTrack(destination.stream.getAudioTracks()[0]);
-                void context.resume();
+                await context.resume();
             }
             streams.push(stream);
-            return Promise.resolve(stream);
+            return stream;
         };
         Object.defineProperties(navigator.mediaDevices, {
             getUserMedia: { value: (constraints: MediaStreamConstraints) => createStream(Boolean(constraints.video), Boolean(constraints.audio)) },

codex
All six focused E2E tests passed on the first attempt, including the five-source recording, trim, and export test and both participant-promotion tests. The 19 recording unit tests also passed. The changelog and verification notes are updated; I’m starting the full `npm run test-for-ptbk-coder` check.

exec
/bin/zsh -lc 'npm run test-for-ptbk-coder > /tmp/aldaron-test-for-ptbk-coder.log 2>&1' in /Users/hejny/work/aldaron
diff --git a/AGENTS.md b/AGENTS.md
index 7ccd1cd9ab95fc3714da646dc39d1e229c1f4734..3314bd5373931a916150ca90931419129fe3c333
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -392,3 +392,5 @@
   independent and retry once in a fresh browser context for transient failures;
   failed-attempt traces remain available. Each attempt archives one recording in
   `tests/e2e/videos/`, retaining only recent runs.
+- Recording-studio E2E sources use canvas video and synthesized audio with a silent Web Audio output, independent
+  of physical audio-device clocks. Keep recording, storage, codecs, trimming, and ZIP exports real in these tests.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index c6fc7d8859d693c0e925481be24aed730141c0ac..a4a78ee8f8cc864ed0297a236e359c4051be9cf0
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,10 @@
 
 ## Unreleased
 
+- Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
+  microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
+  sources produce real media for the existing recording, ZIP, trimming, and playback checks.
+
 - Let administrators choose whether a community-membership discount code remains permanent or applies only to a
   selected number of monthly renewals. Stripe now receives the matching coupon, so a temporary reduction ends at the
   full subscription price without an application-side timer; existing codes remain permanent.
diff --git a/README.md b/README.md
index edf7257a302096b486cd1cc6bba29c38d579ac24..8b59b12ea2d48ba53b717d06b952e19f71aa3de3
--- a/README.md
+++ b/README.md
@@ -69,6 +69,9 @@
 need no full-memory buffer. Other browsers use a download fallback capped at 256 MiB to avoid exhausting memory.
 The studio adds no environment variables, uploads, server APIs, or database migrations.
 
+Its E2E tests supply canvas video and synthesized audio with a silent Web Audio output, so they need no physical
+camera, microphone, or working speaker device. Recording, storage, codecs, trimming, and ZIP exports remain real.
+
 ## Technology
 
 - **Next.js 15** App Router, React, and TypeScript
diff --git a/tests/e2e/recording-studio.spec.ts b/tests/e2e/recording-studio.spec.ts
index 5154b89d98ec838477b8c80f45cba785303770c5..0fa2dbe0f3b430e6f35901d97d826427321404e4
--- a/tests/e2e/recording-studio.spec.ts
+++ b/tests/e2e/recording-studio.spec.ts
@@ -15,7 +15,7 @@
         // Only replace physical devices/the permission picker. Recording, storage, codecs and ZIP are real.
         const streams: MediaStream[] = [];
         Object.assign(window, { studioTestStreams: streams });
-        const createStream = (isVideo: boolean, isAudio: boolean) => {
+        const createStream = async (isVideo: boolean, isAudio: boolean) => {
             const stream = new MediaStream();
             if (isVideo) {
                 const canvas = document.createElement('canvas');
@@ -34,15 +34,17 @@
                 stream.addTrack(videoTrack);
             }
             if (isAudio) {
-                const context = new AudioContext();
+                // Render real audio without a physical output device, whose clock may stall on a headless host.
+                const AUDIO_CONTEXT_OPTIONS: AudioContextOptions & { sinkId: { type: 'none' } } = { sinkId: { type: 'none' } };
+                const context = new AudioContext(AUDIO_CONTEXT_OPTIONS);
                 const oscillator = context.createOscillator();
                 const destination = context.createMediaStreamDestination();
                 oscillator.connect(destination); oscillator.start();
                 stream.addTrack(destination.stream.getAudioTracks()[0]);
-                void context.resume();
+                await context.resume();
             }
             streams.push(stream);
-            return Promise.resolve(stream);
+            return stream;
         };
         Object.defineProperties(navigator.mediaDevices, {
             getUserMedia: { value: (constraints: MediaStreamConstraints) => createStream(Boolean(constraints.video), Boolean(constraints.audio)) },

exec
/bin/zsh -lc 'tail -n 28 /tmp/aldaron-test-for-ptbk-coder.log && git status --short' in /Users/hejny/work/aldaron
 succeeded in 0ms:
> promptbook-landing-page@0.1.0 test-types
> npm run build && tsc


> promptbook-landing-page@0.1.0 build
> next build

   ▲ Next.js 15.2.6
   - Environments: .env

   Creating an optimized production build ...
 ✓ Compiled successfully
   Skipping validation of types
   Skipping linting
   Collecting page data ...
   Generating static pages (0/82) ...
   Generating static pages (20/82) 
   Generating static pages (40/82) 
   Generating static pages (61/82) 
BenefitsSection rendered
IntegrationsSection rendered
BenefitsSection rendered
IntegrationsSection rendered
BenefitsSection rendered
IntegrationsSection rendered
BenefitsSection rendered
BenefitsSection rendered
IntegrationsSection rendered
 M AGENTS.md
 M CHANGELOG.md
 M README.md
 M tests/e2e/recording-studio.spec.ts
?? prompts/2026-09-0550-fix-the-existing-test-failures-before-implementing-any.md

diff --git a/AGENTS.md b/AGENTS.md
index 7ccd1cd9ab95fc3714da646dc39d1e229c1f4734..3314bd5373931a916150ca90931419129fe3c333
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -392,3 +392,5 @@
   independent and retry once in a fresh browser context for transient failures;
   failed-attempt traces remain available. Each attempt archives one recording in
   `tests/e2e/videos/`, retaining only recent runs.
+- Recording-studio E2E sources use canvas video and synthesized audio with a silent Web Audio output, independent
+  of physical audio-device clocks. Keep recording, storage, codecs, trimming, and ZIP exports real in these tests.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index c6fc7d8859d693c0e925481be24aed730141c0ac..a4a78ee8f8cc864ed0297a236e359c4051be9cf0
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,10 @@
 
 ## Unreleased
 
+- Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
+  microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
+  sources produce real media for the existing recording, ZIP, trimming, and playback checks.
+
 - Let administrators choose whether a community-membership discount code remains permanent or applies only to a
   selected number of monthly renewals. Stripe now receives the matching coupon, so a temporary reduction ends at the
   full subscription price without an application-side timer; existing codes remain permanent.
diff --git a/README.md b/README.md
index edf7257a302096b486cd1cc6bba29c38d579ac24..8b59b12ea2d48ba53b717d06b952e19f71aa3de3
--- a/README.md
+++ b/README.md
@@ -69,6 +69,9 @@
 need no full-memory buffer. Other browsers use a download fallback capped at 256 MiB to avoid exhausting memory.
 The studio adds no environment variables, uploads, server APIs, or database migrations.
 
+Its E2E tests supply canvas video and synthesized audio with a silent Web Audio output, so they need no physical
+camera, microphone, or working speaker device. Recording, storage, codecs, trimming, and ZIP exports remain real.
+
 ## Technology
 
 - **Next.js 15** App Router, React, and TypeScript
diff --git a/tests/e2e/recording-studio.spec.ts b/tests/e2e/recording-studio.spec.ts
index 5154b89d98ec838477b8c80f45cba785303770c5..0fa2dbe0f3b430e6f35901d97d826427321404e4
--- a/tests/e2e/recording-studio.spec.ts
+++ b/tests/e2e/recording-studio.spec.ts
@@ -15,7 +15,7 @@
         // Only replace physical devices/the permission picker. Recording, storage, codecs and ZIP are real.
         const streams: MediaStream[] = [];
         Object.assign(window, { studioTestStreams: streams });
-        const createStream = (isVideo: boolean, isAudio: boolean) => {
+        const createStream = async (isVideo: boolean, isAudio: boolean) => {
             const stream = new MediaStream();
             if (isVideo) {
                 const canvas = document.createElement('canvas');
@@ -34,15 +34,17 @@
                 stream.addTrack(videoTrack);
             }
             if (isAudio) {
-                const context = new AudioContext();
+                // Render real audio without a physical output device, whose clock may stall on a headless host.
+                const AUDIO_CONTEXT_OPTIONS: AudioContextOptions & { sinkId: { type: 'none' } } = { sinkId: { type: 'none' } };
+                const context = new AudioContext(AUDIO_CONTEXT_OPTIONS);
                 const oscillator = context.createOscillator();
                 const destination = context.createMediaStreamDestination();
                 oscillator.connect(destination); oscillator.start();
                 stream.addTrack(destination.stream.getAudioTracks()[0]);
-                void context.resume();
+                await context.resume();
             }
             streams.push(stream);
-            return Promise.resolve(stream);
+            return stream;
         };
         Object.defineProperties(navigator.mediaDevices, {
             getUserMedia: { value: (constraints: MediaStreamConstraints) => createStream(Boolean(constraints.video), Boolean(constraints.audio)) },

exec
/bin/zsh -lc 'tail -n 18 /tmp/aldaron-test-for-ptbk-coder.log' in /Users/hejny/work/aldaron
 succeeded in 0ms:
ƒ  (Dynamic)  server-rendered on demand


> promptbook-landing-page@0.1.0 test-e2e
> playwright test

[WebServer] (node:22733) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] (node:22759) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] (node:22761) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] Database migrations skipped: DATABASE_URL is not configured.

Running 81 tests using 1 worker

(node:22797) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)

diff --git a/AGENTS.md b/AGENTS.md
index 7ccd1cd9ab95fc3714da646dc39d1e229c1f4734..3314bd5373931a916150ca90931419129fe3c333
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -392,3 +392,5 @@
   independent and retry once in a fresh browser context for transient failures;
   failed-attempt traces remain available. Each attempt archives one recording in
   `tests/e2e/videos/`, retaining only recent runs.
+- Recording-studio E2E sources use canvas video and synthesized audio with a silent Web Audio output, independent
+  of physical audio-device clocks. Keep recording, storage, codecs, trimming, and ZIP exports real in these tests.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index c6fc7d8859d693c0e925481be24aed730141c0ac..a4a78ee8f8cc864ed0297a236e359c4051be9cf0
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,10 @@
 
 ## Unreleased
 
+- Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
+  microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
+  sources produce real media for the existing recording, ZIP, trimming, and playback checks.
+
 - Let administrators choose whether a community-membership discount code remains permanent or applies only to a
   selected number of monthly renewals. Stripe now receives the matching coupon, so a temporary reduction ends at the
   full subscription price without an application-side timer; existing codes remain permanent.
diff --git a/README.md b/README.md
index edf7257a302096b486cd1cc6bba29c38d579ac24..8b59b12ea2d48ba53b717d06b952e19f71aa3de3
--- a/README.md
+++ b/README.md
@@ -69,6 +69,9 @@
 need no full-memory buffer. Other browsers use a download fallback capped at 256 MiB to avoid exhausting memory.
 The studio adds no environment variables, uploads, server APIs, or database migrations.
 
+Its E2E tests supply canvas video and synthesized audio with a silent Web Audio output, so they need no physical
+camera, microphone, or working speaker device. Recording, storage, codecs, trimming, and ZIP exports remain real.
+
 ## Technology
 
 - **Next.js 15** App Router, React, and TypeScript
diff --git a/tests/e2e/recording-studio.spec.ts b/tests/e2e/recording-studio.spec.ts
index 5154b89d98ec838477b8c80f45cba785303770c5..0fa2dbe0f3b430e6f35901d97d826427321404e4
--- a/tests/e2e/recording-studio.spec.ts
+++ b/tests/e2e/recording-studio.spec.ts
@@ -15,7 +15,7 @@
         // Only replace physical devices/the permission picker. Recording, storage, codecs and ZIP are real.
         const streams: MediaStream[] = [];
         Object.assign(window, { studioTestStreams: streams });
-        const createStream = (isVideo: boolean, isAudio: boolean) => {
+        const createStream = async (isVideo: boolean, isAudio: boolean) => {
             const stream = new MediaStream();
             if (isVideo) {
                 const canvas = document.createElement('canvas');
@@ -34,15 +34,17 @@
                 stream.addTrack(videoTrack);
             }
             if (isAudio) {
-                const context = new AudioContext();
+                // Render real audio without a physical output device, whose clock may stall on a headless host.
+                const AUDIO_CONTEXT_OPTIONS: AudioContextOptions & { sinkId: { type: 'none' } } = { sinkId: { type: 'none' } };
+                const context = new AudioContext(AUDIO_CONTEXT_OPTIONS);
                 const oscillator = context.createOscillator();
                 const destination = context.createMediaStreamDestination();
                 oscillator.connect(destination); oscillator.start();
                 stream.addTrack(destination.stream.getAudioTracks()[0]);
-                void context.resume();
+                await context.resume();
             }
             streams.push(stream);
-            return Promise.resolve(stream);
+            return stream;
         };
         Object.defineProperties(navigator.mediaDevices, {
             getUserMedia: { value: (constraints: MediaStreamConstraints) => createStream(Boolean(constraints.video), Boolean(constraints.audio)) },

codex
Lint, the production build, and TypeScript checks passed. The full 81-test browser suite is now running.

exec
/bin/zsh -lc 'tail -n 16 /tmp/aldaron-test-for-ptbk-coder.log' in /Users/hejny/work/aldaron
 succeeded in 0ms:
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] Database migrations skipped: DATABASE_URL is not configured.

Running 81 tests using 1 worker

(node:22797) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ✓   1 tests/e2e/admin-autosave.spec.ts:52:5 › autosaves edits in order, protects reload while pending, and waits before navigating (8.1s)
  ✓   2 tests/e2e/admin-autosave.spec.ts:92:5 › retains a failed edit and retries it without leaving the settings (3.0s)
  ✓   3 tests/e2e/admin-autosave.spec.ts:109:5 › keeps invalid settings open and saves corrected settings before signing out (2.2s)
  ✓   4 tests/e2e/admin-modals.spec.ts:24:9 › edits and creates contacts in keyboard-accessible dialogs at 1440px (3.0s)
  ✓   5 tests/e2e/admin-modals.spec.ts:24:9 › edits and creates contacts in keyboard-accessible dialogs at 390px (2.4s)
  ✓   6 tests/e2e/admin-modals.spec.ts:77:5 › keeps failed discount creation visible in its dialog and autosaves later edits there (1.1s)
  ✓   7 tests/e2e/cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /cs (2.7s)
  ✓   8 tests/e2e/cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /en (2.2s)
  ✓   9 tests/e2e/cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /cs/ochrana-osobnich-udaju (2.0s)

diff --git a/AGENTS.md b/AGENTS.md
index 7ccd1cd9ab95fc3714da646dc39d1e229c1f4734..3314bd5373931a916150ca90931419129fe3c333
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -392,3 +392,5 @@
   independent and retry once in a fresh browser context for transient failures;
   failed-attempt traces remain available. Each attempt archives one recording in
   `tests/e2e/videos/`, retaining only recent runs.
+- Recording-studio E2E sources use canvas video and synthesized audio with a silent Web Audio output, independent
+  of physical audio-device clocks. Keep recording, storage, codecs, trimming, and ZIP exports real in these tests.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index c6fc7d8859d693c0e925481be24aed730141c0ac..a4a78ee8f8cc864ed0297a236e359c4051be9cf0
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,10 @@
 
 ## Unreleased
 
+- Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
+  microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
+  sources produce real media for the existing recording, ZIP, trimming, and playback checks.
+
 - Let administrators choose whether a community-membership discount code remains permanent or applies only to a
   selected number of monthly renewals. Stripe now receives the matching coupon, so a temporary reduction ends at the
   full subscription price without an application-side timer; existing codes remain permanent.
diff --git a/README.md b/README.md
index edf7257a302096b486cd1cc6bba29c38d579ac24..8b59b12ea2d48ba53b717d06b952e19f71aa3de3
--- a/README.md
+++ b/README.md
@@ -69,6 +69,9 @@
 need no full-memory buffer. Other browsers use a download fallback capped at 256 MiB to avoid exhausting memory.
 The studio adds no environment variables, uploads, server APIs, or database migrations.
 
+Its E2E tests supply canvas video and synthesized audio with a silent Web Audio output, so they need no physical
+camera, microphone, or working speaker device. Recording, storage, codecs, trimming, and ZIP exports remain real.
+
 ## Technology
 
 - **Next.js 15** App Router, React, and TypeScript
diff --git a/tests/e2e/recording-studio.spec.ts b/tests/e2e/recording-studio.spec.ts
index 5154b89d98ec838477b8c80f45cba785303770c5..0fa2dbe0f3b430e6f35901d97d826427321404e4
--- a/tests/e2e/recording-studio.spec.ts
+++ b/tests/e2e/recording-studio.spec.ts
@@ -15,7 +15,7 @@
         // Only replace physical devices/the permission picker. Recording, storage, codecs and ZIP are real.
         const streams: MediaStream[] = [];
         Object.assign(window, { studioTestStreams: streams });
-        const createStream = (isVideo: boolean, isAudio: boolean) => {
+        const createStream = async (isVideo: boolean, isAudio: boolean) => {
             const stream = new MediaStream();
             if (isVideo) {
                 const canvas = document.createElement('canvas');
@@ -34,15 +34,17 @@
                 stream.addTrack(videoTrack);
             }
             if (isAudio) {
-                const context = new AudioContext();
+                // Render real audio without a physical output device, whose clock may stall on a headless host.
+                const AUDIO_CONTEXT_OPTIONS: AudioContextOptions & { sinkId: { type: 'none' } } = { sinkId: { type: 'none' } };
+                const context = new AudioContext(AUDIO_CONTEXT_OPTIONS);
                 const oscillator = context.createOscillator();
                 const destination = context.createMediaStreamDestination();
                 oscillator.connect(destination); oscillator.start();
                 stream.addTrack(destination.stream.getAudioTracks()[0]);
-                void context.resume();
+                await context.resume();
             }
             streams.push(stream);
-            return Promise.resolve(stream);
+            return stream;
         };
         Object.defineProperties(navigator.mediaDevices, {
             getUserMedia: { value: (constraints: MediaStreamConstraints) => createStream(Boolean(constraints.video), Boolean(constraints.audio)) },

exec
/bin/zsh -lc 'tail -n 12 /tmp/aldaron-test-for-ptbk-coder.log' in /Users/hejny/work/aldaron
 succeeded in 0ms:
  ✓  19 tests/e2e/participant-promotion.spec.ts:50:9 › refreshes an author's pending total and submissions after trust on /cs/komunita (3.2s)
  ✓  20 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs (991ms)
  ✓  21 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /en (963ms)
  ✓  22 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /pro-mesta (2.0s)
  ✓  23 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /for-agro (1.5s)
  ✓  24 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /for-industry (1.6s)
  ✓  25 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /ai-supervize (1.0s)
  ✓  26 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /ai-supervize-mini (1.5s)
  ✓  27 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /ai-ta-krajta (873ms)
  ✓  28 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /ai-ta-krajta/media-kit (1.5s)
  ✓  29 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /ai-ta-krajta/branding (1.3s)
  ✓  30 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /hackathon-factory (2.5s)

diff --git a/AGENTS.md b/AGENTS.md
index 7ccd1cd9ab95fc3714da646dc39d1e229c1f4734..3314bd5373931a916150ca90931419129fe3c333
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -392,3 +392,5 @@
   independent and retry once in a fresh browser context for transient failures;
   failed-attempt traces remain available. Each attempt archives one recording in
   `tests/e2e/videos/`, retaining only recent runs.
+- Recording-studio E2E sources use canvas video and synthesized audio with a silent Web Audio output, independent
+  of physical audio-device clocks. Keep recording, storage, codecs, trimming, and ZIP exports real in these tests.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index c6fc7d8859d693c0e925481be24aed730141c0ac..a4a78ee8f8cc864ed0297a236e359c4051be9cf0
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,10 @@
 
 ## Unreleased
 
+- Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
+  microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
+  sources produce real media for the existing recording, ZIP, trimming, and playback checks.
+
 - Let administrators choose whether a community-membership discount code remains permanent or applies only to a
   selected number of monthly renewals. Stripe now receives the matching coupon, so a temporary reduction ends at the
   full subscription price without an application-side timer; existing codes remain permanent.
diff --git a/README.md b/README.md
index edf7257a302096b486cd1cc6bba29c38d579ac24..8b59b12ea2d48ba53b717d06b952e19f71aa3de3
--- a/README.md
+++ b/README.md
@@ -69,6 +69,9 @@
 need no full-memory buffer. Other browsers use a download fallback capped at 256 MiB to avoid exhausting memory.
 The studio adds no environment variables, uploads, server APIs, or database migrations.
 
+Its E2E tests supply canvas video and synthesized audio with a silent Web Audio output, so they need no physical
+camera, microphone, or working speaker device. Recording, storage, codecs, trimming, and ZIP exports remain real.
+
 ## Technology
 
 - **Next.js 15** App Router, React, and TypeScript
diff --git a/tests/e2e/recording-studio.spec.ts b/tests/e2e/recording-studio.spec.ts
index 5154b89d98ec838477b8c80f45cba785303770c5..0fa2dbe0f3b430e6f35901d97d826427321404e4
--- a/tests/e2e/recording-studio.spec.ts
+++ b/tests/e2e/recording-studio.spec.ts
@@ -15,7 +15,7 @@
         // Only replace physical devices/the permission picker. Recording, storage, codecs and ZIP are real.
         const streams: MediaStream[] = [];
         Object.assign(window, { studioTestStreams: streams });
-        const createStream = (isVideo: boolean, isAudio: boolean) => {
+        const createStream = async (isVideo: boolean, isAudio: boolean) => {
             const stream = new MediaStream();
             if (isVideo) {
                 const canvas = document.createElement('canvas');
@@ -34,15 +34,17 @@
                 stream.addTrack(videoTrack);
             }
             if (isAudio) {
-                const context = new AudioContext();
+                // Render real audio without a physical output device, whose clock may stall on a headless host.
+                const AUDIO_CONTEXT_OPTIONS: AudioContextOptions & { sinkId: { type: 'none' } } = { sinkId: { type: 'none' } };
+                const context = new AudioContext(AUDIO_CONTEXT_OPTIONS);
                 const oscillator = context.createOscillator();
                 const destination = context.createMediaStreamDestination();
                 oscillator.connect(destination); oscillator.start();
                 stream.addTrack(destination.stream.getAudioTracks()[0]);
-                void context.resume();
+                await context.resume();
             }
             streams.push(stream);
-            return Promise.resolve(stream);
+            return stream;
         };
         Object.defineProperties(navigator.mediaDevices, {
             getUserMedia: { value: (constraints: MediaStreamConstraints) => createStream(Boolean(constraints.video), Boolean(constraints.audio)) },

codex
Both participant-promotion tests passed on the first attempt in the full suite too. The run has reached the public-page checks with no failures so far.

exec
/bin/zsh -lc 'tail -n 12 /tmp/aldaron-test-for-ptbk-coder.log' in /Users/hejny/work/aldaron
 succeeded in 0ms:
  ✓  30 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /hackathon-factory (2.5s)
  ✓  31 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs/online-workshop (4.5s)
  ✓  32 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs/komunita/clenstvi (4.8s)
  ✓  33 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs/pavol (1.9s)
  ✓  34 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /en/pavol (2.8s)
  ✓  35 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs/ochrana-osobnich-udaju (788ms)
  ✓  36 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /en/privacy-policy (1.4s)
  ✓  37 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs/obchodni-podminky (1.2s)
  ✓  38 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /en/terms-and-conditions (1.3s)
  ✓  39 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /contact (1.7s)
  ✓  40 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /branding (2.3s)
  ✓  41 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /data-deletion (3.8s)

diff --git a/AGENTS.md b/AGENTS.md
index 7ccd1cd9ab95fc3714da646dc39d1e229c1f4734..3314bd5373931a916150ca90931419129fe3c333
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -392,3 +392,5 @@
   independent and retry once in a fresh browser context for transient failures;
   failed-attempt traces remain available. Each attempt archives one recording in
   `tests/e2e/videos/`, retaining only recent runs.
+- Recording-studio E2E sources use canvas video and synthesized audio with a silent Web Audio output, independent
+  of physical audio-device clocks. Keep recording, storage, codecs, trimming, and ZIP exports real in these tests.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index c6fc7d8859d693c0e925481be24aed730141c0ac..a4a78ee8f8cc864ed0297a236e359c4051be9cf0
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,10 @@
 
 ## Unreleased
 
+- Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
+  microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
+  sources produce real media for the existing recording, ZIP, trimming, and playback checks.
+
 - Let administrators choose whether a community-membership discount code remains permanent or applies only to a
   selected number of monthly renewals. Stripe now receives the matching coupon, so a temporary reduction ends at the
   full subscription price without an application-side timer; existing codes remain permanent.
diff --git a/README.md b/README.md
index edf7257a302096b486cd1cc6bba29c38d579ac24..8b59b12ea2d48ba53b717d06b952e19f71aa3de3
--- a/README.md
+++ b/README.md
@@ -69,6 +69,9 @@
 need no full-memory buffer. Other browsers use a download fallback capped at 256 MiB to avoid exhausting memory.
 The studio adds no environment variables, uploads, server APIs, or database migrations.
 
+Its E2E tests supply canvas video and synthesized audio with a silent Web Audio output, so they need no physical
+camera, microphone, or working speaker device. Recording, storage, codecs, trimming, and ZIP exports remain real.
+
 ## Technology
 
 - **Next.js 15** App Router, React, and TypeScript
diff --git a/tests/e2e/recording-studio.spec.ts b/tests/e2e/recording-studio.spec.ts
index 5154b89d98ec838477b8c80f45cba785303770c5..0fa2dbe0f3b430e6f35901d97d826427321404e4
--- a/tests/e2e/recording-studio.spec.ts
+++ b/tests/e2e/recording-studio.spec.ts
@@ -15,7 +15,7 @@
         // Only replace physical devices/the permission picker. Recording, storage, codecs and ZIP are real.
         const streams: MediaStream[] = [];
         Object.assign(window, { studioTestStreams: streams });
-        const createStream = (isVideo: boolean, isAudio: boolean) => {
+        const createStream = async (isVideo: boolean, isAudio: boolean) => {
             const stream = new MediaStream();
             if (isVideo) {
                 const canvas = document.createElement('canvas');
@@ -34,15 +34,17 @@
                 stream.addTrack(videoTrack);
             }
             if (isAudio) {
-                const context = new AudioContext();
+                // Render real audio without a physical output device, whose clock may stall on a headless host.
+                const AUDIO_CONTEXT_OPTIONS: AudioContextOptions & { sinkId: { type: 'none' } } = { sinkId: { type: 'none' } };
+                const context = new AudioContext(AUDIO_CONTEXT_OPTIONS);
                 const oscillator = context.createOscillator();
                 const destination = context.createMediaStreamDestination();
                 oscillator.connect(destination); oscillator.start();
                 stream.addTrack(destination.stream.getAudioTracks()[0]);
-                void context.resume();
+                await context.resume();
             }
             streams.push(stream);
-            return Promise.resolve(stream);
+            return stream;
         };
         Object.defineProperties(navigator.mediaDevices, {
             getUserMedia: { value: (constraints: MediaStreamConstraints) => createStream(Boolean(constraints.video), Boolean(constraints.audio)) },

exec
/bin/zsh -lc 'tail -n 12 /tmp/aldaron-test-for-ptbk-coder.log' in /Users/hejny/work/aldaron
 succeeded in 0ms:
  ✓  45 tests/e2e/public-pages.spec.ts:246:5 › AI ta Krajta searches complete transcripts on the server without sending them to the browser (1.9s)
  ✓  46 tests/e2e/public-pages.spec.ts:264:9 › public address redirects to its page: / (8ms)
  ✓  47 tests/e2e/public-pages.spec.ts:264:9 › public address redirects to its page: /pavol (653ms)
  ✓  48 tests/e2e/public-pages.spec.ts:264:9 › public address redirects to its page: /privacy (661ms)
  ✓  49 tests/e2e/public-pages.spec.ts:264:9 › public address redirects to its page: /terms (694ms)
  ✓  50 tests/e2e/public-pages.spec.ts:264:9 › public address redirects to its page: /skoleni (701ms)
  ✓  51 tests/e2e/public-pages.spec.ts:278:5 › /skoleni carries a discount code to the workshop registration (22ms)
  ✓  52 tests/e2e/public-submissions.spec.ts:13:5 › submits the shared footer newsletter form (6.1s)
[WebServer] (node:23549) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓  53 tests/e2e/public-submissions.spec.ts:27:5 › submits the reusable get-started lead dialog (9.9s)
  ✓  54 tests/e2e/public-submissions.spec.ts:41:5 › submits the business lead dialog (1.7s)

diff --git a/AGENTS.md b/AGENTS.md
index 7ccd1cd9ab95fc3714da646dc39d1e229c1f4734..3314bd5373931a916150ca90931419129fe3c333
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -392,3 +392,5 @@
   independent and retry once in a fresh browser context for transient failures;
   failed-attempt traces remain available. Each attempt archives one recording in
   `tests/e2e/videos/`, retaining only recent runs.
+- Recording-studio E2E sources use canvas video and synthesized audio with a silent Web Audio output, independent
+  of physical audio-device clocks. Keep recording, storage, codecs, trimming, and ZIP exports real in these tests.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index c6fc7d8859d693c0e925481be24aed730141c0ac..a4a78ee8f8cc864ed0297a236e359c4051be9cf0
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,10 @@
 
 ## Unreleased
 
+- Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
+  microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
+  sources produce real media for the existing recording, ZIP, trimming, and playback checks.
+
 - Let administrators choose whether a community-membership discount code remains permanent or applies only to a
   selected number of monthly renewals. Stripe now receives the matching coupon, so a temporary reduction ends at the
   full subscription price without an application-side timer; existing codes remain permanent.
diff --git a/README.md b/README.md
index edf7257a302096b486cd1cc6bba29c38d579ac24..8b59b12ea2d48ba53b717d06b952e19f71aa3de3
--- a/README.md
+++ b/README.md
@@ -69,6 +69,9 @@
 need no full-memory buffer. Other browsers use a download fallback capped at 256 MiB to avoid exhausting memory.
 The studio adds no environment variables, uploads, server APIs, or database migrations.
 
+Its E2E tests supply canvas video and synthesized audio with a silent Web Audio output, so they need no physical
+camera, microphone, or working speaker device. Recording, storage, codecs, trimming, and ZIP exports remain real.
+
 ## Technology
 
 - **Next.js 15** App Router, React, and TypeScript
diff --git a/tests/e2e/recording-studio.spec.ts b/tests/e2e/recording-studio.spec.ts
index 5154b89d98ec838477b8c80f45cba785303770c5..0fa2dbe0f3b430e6f35901d97d826427321404e4
--- a/tests/e2e/recording-studio.spec.ts
+++ b/tests/e2e/recording-studio.spec.ts
@@ -15,7 +15,7 @@
         // Only replace physical devices/the permission picker. Recording, storage, codecs and ZIP are real.
         const streams: MediaStream[] = [];
         Object.assign(window, { studioTestStreams: streams });
-        const createStream = (isVideo: boolean, isAudio: boolean) => {
+        const createStream = async (isVideo: boolean, isAudio: boolean) => {
             const stream = new MediaStream();
             if (isVideo) {
                 const canvas = document.createElement('canvas');
@@ -34,15 +34,17 @@
                 stream.addTrack(videoTrack);
             }
             if (isAudio) {
-                const context = new AudioContext();
+                // Render real audio without a physical output device, whose clock may stall on a headless host.
+                const AUDIO_CONTEXT_OPTIONS: AudioContextOptions & { sinkId: { type: 'none' } } = { sinkId: { type: 'none' } };
+                const context = new AudioContext(AUDIO_CONTEXT_OPTIONS);
                 const oscillator = context.createOscillator();
                 const destination = context.createMediaStreamDestination();
                 oscillator.connect(destination); oscillator.start();
                 stream.addTrack(destination.stream.getAudioTracks()[0]);
-                void context.resume();
+                await context.resume();
             }
             streams.push(stream);
-            return Promise.resolve(stream);
+            return stream;
         };
         Object.defineProperties(navigator.mediaDevices, {
             getUserMedia: { value: (constraints: MediaStreamConstraints) => createStream(Boolean(constraints.video), Boolean(constraints.audio)) },

codex
The full run has passed the public-page checks and reached the form submissions. No failures or retries have appeared; the recording and remaining workshop checks are still ahead.

exec
/bin/zsh -lc 'tail -n 12 /tmp/aldaron-test-for-ptbk-coder.log' in /Users/hejny/work/aldaron
 succeeded in 0ms:
  ✓  49 tests/e2e/public-pages.spec.ts:264:9 › public address redirects to its page: /terms (694ms)
  ✓  50 tests/e2e/public-pages.spec.ts:264:9 › public address redirects to its page: /skoleni (701ms)
  ✓  51 tests/e2e/public-pages.spec.ts:278:5 › /skoleni carries a discount code to the workshop registration (22ms)
  ✓  52 tests/e2e/public-submissions.spec.ts:13:5 › submits the shared footer newsletter form (6.1s)
[WebServer] (node:23549) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓  53 tests/e2e/public-submissions.spec.ts:27:5 › submits the reusable get-started lead dialog (9.9s)
  ✓  54 tests/e2e/public-submissions.spec.ts:41:5 › submits the business lead dialog (1.7s)
  ✓  55 tests/e2e/public-submissions.spec.ts:55:5 › submits the homepage qualification lead flow (17.1s)
  ✓  56 tests/e2e/public-submissions.spec.ts:80:5 › submits Pavol’s personal contact form (4.1s)
  -  57 tests/e2e/public-submissions.spec.ts:96:5 › submits a published online-workshop registration
  ✓  58 tests/e2e/public-submissions.spec.ts:116:5 › personalizes and submits the 199 Kč Promptbook paid community membership (8.9s)

diff --git a/AGENTS.md b/AGENTS.md
index 7ccd1cd9ab95fc3714da646dc39d1e229c1f4734..3314bd5373931a916150ca90931419129fe3c333
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -392,3 +392,5 @@
   independent and retry once in a fresh browser context for transient failures;
   failed-attempt traces remain available. Each attempt archives one recording in
   `tests/e2e/videos/`, retaining only recent runs.
+- Recording-studio E2E sources use canvas video and synthesized audio with a silent Web Audio output, independent
+  of physical audio-device clocks. Keep recording, storage, codecs, trimming, and ZIP exports real in these tests.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index c6fc7d8859d693c0e925481be24aed730141c0ac..a4a78ee8f8cc864ed0297a236e359c4051be9cf0
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,10 @@
 
 ## Unreleased
 
+- Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
+  microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
+  sources produce real media for the existing recording, ZIP, trimming, and playback checks.
+
 - Let administrators choose whether a community-membership discount code remains permanent or applies only to a
   selected number of monthly renewals. Stripe now receives the matching coupon, so a temporary reduction ends at the
   full subscription price without an application-side timer; existing codes remain permanent.
diff --git a/README.md b/README.md
index edf7257a302096b486cd1cc6bba29c38d579ac24..8b59b12ea2d48ba53b717d06b952e19f71aa3de3
--- a/README.md
+++ b/README.md
@@ -69,6 +69,9 @@
 need no full-memory buffer. Other browsers use a download fallback capped at 256 MiB to avoid exhausting memory.
 The studio adds no environment variables, uploads, server APIs, or database migrations.
 
+Its E2E tests supply canvas video and synthesized audio with a silent Web Audio output, so they need no physical
+camera, microphone, or working speaker device. Recording, storage, codecs, trimming, and ZIP exports remain real.
+
 ## Technology
 
 - **Next.js 15** App Router, React, and TypeScript
diff --git a/tests/e2e/recording-studio.spec.ts b/tests/e2e/recording-studio.spec.ts
index 5154b89d98ec838477b8c80f45cba785303770c5..0fa2dbe0f3b430e6f35901d97d826427321404e4
--- a/tests/e2e/recording-studio.spec.ts
+++ b/tests/e2e/recording-studio.spec.ts
@@ -15,7 +15,7 @@
         // Only replace physical devices/the permission picker. Recording, storage, codecs and ZIP are real.
         const streams: MediaStream[] = [];
         Object.assign(window, { studioTestStreams: streams });
-        const createStream = (isVideo: boolean, isAudio: boolean) => {
+        const createStream = async (isVideo: boolean, isAudio: boolean) => {
             const stream = new MediaStream();
             if (isVideo) {
                 const canvas = document.createElement('canvas');
@@ -34,15 +34,17 @@
                 stream.addTrack(videoTrack);
             }
             if (isAudio) {
-                const context = new AudioContext();
+                // Render real audio without a physical output device, whose clock may stall on a headless host.
+                const AUDIO_CONTEXT_OPTIONS: AudioContextOptions & { sinkId: { type: 'none' } } = { sinkId: { type: 'none' } };
+                const context = new AudioContext(AUDIO_CONTEXT_OPTIONS);
                 const oscillator = context.createOscillator();
                 const destination = context.createMediaStreamDestination();
                 oscillator.connect(destination); oscillator.start();
                 stream.addTrack(destination.stream.getAudioTracks()[0]);
-                void context.resume();
+                await context.resume();
             }
             streams.push(stream);
-            return Promise.resolve(stream);
+            return stream;
         };
         Object.defineProperties(navigator.mediaDevices, {
             getUserMedia: { value: (constraints: MediaStreamConstraints) => createStream(Boolean(constraints.video), Boolean(constraints.audio)) },

exec
/bin/zsh -lc 'tail -n 12 /tmp/aldaron-test-for-ptbk-coder.log' in /Users/hejny/work/aldaron
 succeeded in 0ms:
  ✓  58 tests/e2e/public-submissions.spec.ts:116:5 › personalizes and submits the 199 Kč Promptbook paid community membership (8.9s)
  ✓  59 tests/e2e/public-submissions.spec.ts:143:5 › submits an available AI Supervize Mini workshop registration (4.2s)
  ✓  60 tests/e2e/public-submissions.spec.ts:171:5 › submits the AI Supervize Mini future-term interest form (2.2s)
  ✓  61 tests/e2e/public-submissions.spec.ts:196:5 › submits the AI ta Krajta collaboration form (3.1s)
  ✓  62 tests/e2e/public-submissions.spec.ts:211:5 › plays the newest AI ta Krajta episode from the header (1.5s)
  ✓  63 tests/e2e/public-submissions.spec.ts:220:5 › resumes a half-played AI ta Krajta episode where its listener left it (2.0s)
  ✓  64 tests/e2e/public-submissions.spec.ts:254:5 › starts the AI ta Krajta minigame from its snake and keeps it local to the page (2.3s)
  ✓  65 tests/e2e/public-submissions.spec.ts:268:5 › filters the AI ta Krajta archive by a person and keeps its destination in the hash (1.8s)
[WebServer] (node:23858) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  -  66 tests/e2e/public-submissions.spec.ts:280:5 › connects a public online-workshop participant
  ✓  67 tests/e2e/recording-studio.spec.ts:78:5 › requires admin authentication for the recording studio (7.6s)

diff --git a/AGENTS.md b/AGENTS.md
index 7ccd1cd9ab95fc3714da646dc39d1e229c1f4734..3314bd5373931a916150ca90931419129fe3c333
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -392,3 +392,5 @@
   independent and retry once in a fresh browser context for transient failures;
   failed-attempt traces remain available. Each attempt archives one recording in
   `tests/e2e/videos/`, retaining only recent runs.
+- Recording-studio E2E sources use canvas video and synthesized audio with a silent Web Audio output, independent
+  of physical audio-device clocks. Keep recording, storage, codecs, trimming, and ZIP exports real in these tests.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index c6fc7d8859d693c0e925481be24aed730141c0ac..a4a78ee8f8cc864ed0297a236e359c4051be9cf0
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,10 @@
 
 ## Unreleased
 
+- Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
+  microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
+  sources produce real media for the existing recording, ZIP, trimming, and playback checks.
+
 - Let administrators choose whether a community-membership discount code remains permanent or applies only to a
   selected number of monthly renewals. Stripe now receives the matching coupon, so a temporary reduction ends at the
   full subscription price without an application-side timer; existing codes remain permanent.
diff --git a/README.md b/README.md
index edf7257a302096b486cd1cc6bba29c38d579ac24..8b59b12ea2d48ba53b717d06b952e19f71aa3de3
--- a/README.md
+++ b/README.md
@@ -69,6 +69,9 @@
 need no full-memory buffer. Other browsers use a download fallback capped at 256 MiB to avoid exhausting memory.
 The studio adds no environment variables, uploads, server APIs, or database migrations.
 
+Its E2E tests supply canvas video and synthesized audio with a silent Web Audio output, so they need no physical
+camera, microphone, or working speaker device. Recording, storage, codecs, trimming, and ZIP exports remain real.
+
 ## Technology
 
 - **Next.js 15** App Router, React, and TypeScript
diff --git a/tests/e2e/recording-studio.spec.ts b/tests/e2e/recording-studio.spec.ts
index 5154b89d98ec838477b8c80f45cba785303770c5..0fa2dbe0f3b430e6f35901d97d826427321404e4
--- a/tests/e2e/recording-studio.spec.ts
+++ b/tests/e2e/recording-studio.spec.ts
@@ -15,7 +15,7 @@
         // Only replace physical devices/the permission picker. Recording, storage, codecs and ZIP are real.
         const streams: MediaStream[] = [];
         Object.assign(window, { studioTestStreams: streams });
-        const createStream = (isVideo: boolean, isAudio: boolean) => {
+        const createStream = async (isVideo: boolean, isAudio: boolean) => {
             const stream = new MediaStream();
             if (isVideo) {
                 const canvas = document.createElement('canvas');
@@ -34,15 +34,17 @@
                 stream.addTrack(videoTrack);
             }
             if (isAudio) {
-                const context = new AudioContext();
+                // Render real audio without a physical output device, whose clock may stall on a headless host.
+                const AUDIO_CONTEXT_OPTIONS: AudioContextOptions & { sinkId: { type: 'none' } } = { sinkId: { type: 'none' } };
+                const context = new AudioContext(AUDIO_CONTEXT_OPTIONS);
                 const oscillator = context.createOscillator();
                 const destination = context.createMediaStreamDestination();
                 oscillator.connect(destination); oscillator.start();
                 stream.addTrack(destination.stream.getAudioTracks()[0]);
-                void context.resume();
+                await context.resume();
             }
             streams.push(stream);
-            return Promise.resolve(stream);
+            return stream;
         };
         Object.defineProperties(navigator.mediaDevices, {
             getUserMedia: { value: (constraints: MediaStreamConstraints) => createStream(Boolean(constraints.video), Boolean(constraints.audio)) },

exec
/bin/zsh -lc 'tail -n 7 /tmp/aldaron-test-for-ptbk-coder.log' in /Users/hejny/work/aldaron
 succeeded in 0ms:
  ✓  64 tests/e2e/public-submissions.spec.ts:254:5 › starts the AI ta Krajta minigame from its snake and keeps it local to the page (2.3s)
  ✓  65 tests/e2e/public-submissions.spec.ts:268:5 › filters the AI ta Krajta archive by a person and keeps its destination in the hash (1.8s)
[WebServer] (node:23858) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  -  66 tests/e2e/public-submissions.spec.ts:280:5 › connects a public online-workshop participant
  ✓  67 tests/e2e/recording-studio.spec.ts:78:5 › requires admin authentication for the recording studio (7.6s)
  ✓  68 tests/e2e/recording-studio.spec.ts:83:5 › records separate sources, restores them, trims every track and exports playable editor material (16.1s)

diff --git a/AGENTS.md b/AGENTS.md
index 7ccd1cd9ab95fc3714da646dc39d1e229c1f4734..3314bd5373931a916150ca90931419129fe3c333
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -392,3 +392,5 @@
   independent and retry once in a fresh browser context for transient failures;
   failed-attempt traces remain available. Each attempt archives one recording in
   `tests/e2e/videos/`, retaining only recent runs.
+- Recording-studio E2E sources use canvas video and synthesized audio with a silent Web Audio output, independent
+  of physical audio-device clocks. Keep recording, storage, codecs, trimming, and ZIP exports real in these tests.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index c6fc7d8859d693c0e925481be24aed730141c0ac..a4a78ee8f8cc864ed0297a236e359c4051be9cf0
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,10 @@
 
 ## Unreleased
 
+- Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
+  microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
+  sources produce real media for the existing recording, ZIP, trimming, and playback checks.
+
 - Let administrators choose whether a community-membership discount code remains permanent or applies only to a
   selected number of monthly renewals. Stripe now receives the matching coupon, so a temporary reduction ends at the
   full subscription price without an application-side timer; existing codes remain permanent.
diff --git a/README.md b/README.md
index edf7257a302096b486cd1cc6bba29c38d579ac24..8b59b12ea2d48ba53b717d06b952e19f71aa3de3
--- a/README.md
+++ b/README.md
@@ -69,6 +69,9 @@
 need no full-memory buffer. Other browsers use a download fallback capped at 256 MiB to avoid exhausting memory.
 The studio adds no environment variables, uploads, server APIs, or database migrations.
 
+Its E2E tests supply canvas video and synthesized audio with a silent Web Audio output, so they need no physical
+camera, microphone, or working speaker device. Recording, storage, codecs, trimming, and ZIP exports remain real.
+
 ## Technology
 
 - **Next.js 15** App Router, React, and TypeScript
diff --git a/tests/e2e/recording-studio.spec.ts b/tests/e2e/recording-studio.spec.ts
index 5154b89d98ec838477b8c80f45cba785303770c5..0fa2dbe0f3b430e6f35901d97d826427321404e4
--- a/tests/e2e/recording-studio.spec.ts
+++ b/tests/e2e/recording-studio.spec.ts
@@ -15,7 +15,7 @@
         // Only replace physical devices/the permission picker. Recording, storage, codecs and ZIP are real.
         const streams: MediaStream[] = [];
         Object.assign(window, { studioTestStreams: streams });
-        const createStream = (isVideo: boolean, isAudio: boolean) => {
+        const createStream = async (isVideo: boolean, isAudio: boolean) => {
             const stream = new MediaStream();
             if (isVideo) {
                 const canvas = document.createElement('canvas');
@@ -34,15 +34,17 @@
                 stream.addTrack(videoTrack);
             }
             if (isAudio) {
-                const context = new AudioContext();
+                // Render real audio without a physical output device, whose clock may stall on a headless host.
+                const AUDIO_CONTEXT_OPTIONS: AudioContextOptions & { sinkId: { type: 'none' } } = { sinkId: { type: 'none' } };
+                const context = new AudioContext(AUDIO_CONTEXT_OPTIONS);
                 const oscillator = context.createOscillator();
                 const destination = context.createMediaStreamDestination();
                 oscillator.connect(destination); oscillator.start();
                 stream.addTrack(destination.stream.getAudioTracks()[0]);
-                void context.resume();
+                await context.resume();
             }
             streams.push(stream);
-            return Promise.resolve(stream);
+            return stream;
         };
         Object.defineProperties(navigator.mediaDevices, {
             getUserMedia: { value: (constraints: MediaStreamConstraints) => createStream(Boolean(constraints.video), Boolean(constraints.audio)) },

codex
The previously failing five-source recording test passed in the full run, including playable trimmed exports. Two existing tests skipped because no published online-workshop term was available. No failures or retries so far.

exec
/bin/zsh -lc 'tail -n 9 /tmp/aldaron-test-for-ptbk-coder.log' in /Users/hejny/work/aldaron
 succeeded in 0ms:
  ✓  64 tests/e2e/public-submissions.spec.ts:254:5 › starts the AI ta Krajta minigame from its snake and keeps it local to the page (2.3s)
  ✓  65 tests/e2e/public-submissions.spec.ts:268:5 › filters the AI ta Krajta archive by a person and keeps its destination in the hash (1.8s)
[WebServer] (node:23858) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  -  66 tests/e2e/public-submissions.spec.ts:280:5 › connects a public online-workshop participant
  ✓  67 tests/e2e/recording-studio.spec.ts:78:5 › requires admin authentication for the recording studio (7.6s)
  ✓  68 tests/e2e/recording-studio.spec.ts:83:5 › records separate sources, restores them, trims every track and exports playable editor material (16.1s)
  ✓  69 tests/e2e/recording-studio.spec.ts:164:5 › stops the whole take on disconnect and prevents a second tab from changing it (4.8s)
  ✓  70 tests/e2e/recording-studio.spec.ts:184:5 › recovers persisted chunks after an interrupted page and waits for stop before admin navigation (33.2s)

diff --git a/AGENTS.md b/AGENTS.md
index 7ccd1cd9ab95fc3714da646dc39d1e229c1f4734..3314bd5373931a916150ca90931419129fe3c333
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -392,3 +392,5 @@
   independent and retry once in a fresh browser context for transient failures;
   failed-attempt traces remain available. Each attempt archives one recording in
   `tests/e2e/videos/`, retaining only recent runs.
+- Recording-studio E2E sources use canvas video and synthesized audio with a silent Web Audio output, independent
+  of physical audio-device clocks. Keep recording, storage, codecs, trimming, and ZIP exports real in these tests.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index c6fc7d8859d693c0e925481be24aed730141c0ac..a4a78ee8f8cc864ed0297a236e359c4051be9cf0
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,10 @@
 
 ## Unreleased
 
+- Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
+  microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
+  sources produce real media for the existing recording, ZIP, trimming, and playback checks.
+
 - Let administrators choose whether a community-membership discount code remains permanent or applies only to a
   selected number of monthly renewals. Stripe now receives the matching coupon, so a temporary reduction ends at the
   full subscription price without an application-side timer; existing codes remain permanent.
diff --git a/README.md b/README.md
index edf7257a302096b486cd1cc6bba29c38d579ac24..8b59b12ea2d48ba53b717d06b952e19f71aa3de3
--- a/README.md
+++ b/README.md
@@ -69,6 +69,9 @@
 need no full-memory buffer. Other browsers use a download fallback capped at 256 MiB to avoid exhausting memory.
 The studio adds no environment variables, uploads, server APIs, or database migrations.
 
+Its E2E tests supply canvas video and synthesized audio with a silent Web Audio output, so they need no physical
+camera, microphone, or working speaker device. Recording, storage, codecs, trimming, and ZIP exports remain real.
+
 ## Technology
 
 - **Next.js 15** App Router, React, and TypeScript
diff --git a/tests/e2e/recording-studio.spec.ts b/tests/e2e/recording-studio.spec.ts
index 5154b89d98ec838477b8c80f45cba785303770c5..0fa2dbe0f3b430e6f35901d97d826427321404e4
--- a/tests/e2e/recording-studio.spec.ts
+++ b/tests/e2e/recording-studio.spec.ts
@@ -15,7 +15,7 @@
         // Only replace physical devices/the permission picker. Recording, storage, codecs and ZIP are real.
         const streams: MediaStream[] = [];
         Object.assign(window, { studioTestStreams: streams });
-        const createStream = (isVideo: boolean, isAudio: boolean) => {
+        const createStream = async (isVideo: boolean, isAudio: boolean) => {
             const stream = new MediaStream();
             if (isVideo) {
                 const canvas = document.createElement('canvas');
@@ -34,15 +34,17 @@
                 stream.addTrack(videoTrack);
             }
             if (isAudio) {
-                const context = new AudioContext();
+                // Render real audio without a physical output device, whose clock may stall on a headless host.
+                const AUDIO_CONTEXT_OPTIONS: AudioContextOptions & { sinkId: { type: 'none' } } = { sinkId: { type: 'none' } };
+                const context = new AudioContext(AUDIO_CONTEXT_OPTIONS);
                 const oscillator = context.createOscillator();
                 const destination = context.createMediaStreamDestination();
                 oscillator.connect(destination); oscillator.start();
                 stream.addTrack(destination.stream.getAudioTracks()[0]);
-                void context.resume();
+                await context.resume();
             }
             streams.push(stream);
-            return Promise.resolve(stream);
+            return stream;
         };
         Object.defineProperties(navigator.mediaDevices, {
             getUserMedia: { value: (constraints: MediaStreamConstraints) => createStream(Boolean(constraints.video), Boolean(constraints.audio)) },

exec
/bin/zsh -lc 'tail -n 9 /tmp/aldaron-test-for-ptbk-coder.log' in /Users/hejny/work/aldaron
 succeeded in 0ms:
[WebServer] (node:23858) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  -  66 tests/e2e/public-submissions.spec.ts:280:5 › connects a public online-workshop participant
  ✓  67 tests/e2e/recording-studio.spec.ts:78:5 › requires admin authentication for the recording studio (7.6s)
  ✓  68 tests/e2e/recording-studio.spec.ts:83:5 › records separate sources, restores them, trims every track and exports playable editor material (16.1s)
  ✓  69 tests/e2e/recording-studio.spec.ts:164:5 › stops the whole take on disconnect and prevents a second tab from changing it (4.8s)
  ✓  70 tests/e2e/recording-studio.spec.ts:184:5 › recovers persisted chunks after an interrupted page and waits for stop before admin navigation (33.2s)
[WebServer] Failed to load the community room: TypeError: fetch failed
  -  71 tests/e2e/room-theme.spec.ts:96:5 › shares a saved room appearance, follows the device, and preserves the waiting-room form

diff --git a/AGENTS.md b/AGENTS.md
index 7ccd1cd9ab95fc3714da646dc39d1e229c1f4734..3314bd5373931a916150ca90931419129fe3c333
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -392,3 +392,5 @@
   independent and retry once in a fresh browser context for transient failures;
   failed-attempt traces remain available. Each attempt archives one recording in
   `tests/e2e/videos/`, retaining only recent runs.
+- Recording-studio E2E sources use canvas video and synthesized audio with a silent Web Audio output, independent
+  of physical audio-device clocks. Keep recording, storage, codecs, trimming, and ZIP exports real in these tests.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index c6fc7d8859d693c0e925481be24aed730141c0ac..a4a78ee8f8cc864ed0297a236e359c4051be9cf0
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,10 @@
 
 ## Unreleased
 
+- Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
+  microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
+  sources produce real media for the existing recording, ZIP, trimming, and playback checks.
+
 - Let administrators choose whether a community-membership discount code remains permanent or applies only to a
   selected number of monthly renewals. Stripe now receives the matching coupon, so a temporary reduction ends at the
   full subscription price without an application-side timer; existing codes remain permanent.
diff --git a/README.md b/README.md
index edf7257a302096b486cd1cc6bba29c38d579ac24..8b59b12ea2d48ba53b717d06b952e19f71aa3de3
--- a/README.md
+++ b/README.md
@@ -69,6 +69,9 @@
 need no full-memory buffer. Other browsers use a download fallback capped at 256 MiB to avoid exhausting memory.
 The studio adds no environment variables, uploads, server APIs, or database migrations.
 
+Its E2E tests supply canvas video and synthesized audio with a silent Web Audio output, so they need no physical
+camera, microphone, or working speaker device. Recording, storage, codecs, trimming, and ZIP exports remain real.
+
 ## Technology
 
 - **Next.js 15** App Router, React, and TypeScript
diff --git a/tests/e2e/recording-studio.spec.ts b/tests/e2e/recording-studio.spec.ts
index 5154b89d98ec838477b8c80f45cba785303770c5..0fa2dbe0f3b430e6f35901d97d826427321404e4
--- a/tests/e2e/recording-studio.spec.ts
+++ b/tests/e2e/recording-studio.spec.ts
@@ -15,7 +15,7 @@
         // Only replace physical devices/the permission picker. Recording, storage, codecs and ZIP are real.
         const streams: MediaStream[] = [];
         Object.assign(window, { studioTestStreams: streams });
-        const createStream = (isVideo: boolean, isAudio: boolean) => {
+        const createStream = async (isVideo: boolean, isAudio: boolean) => {
             const stream = new MediaStream();
             if (isVideo) {
                 const canvas = document.createElement('canvas');
@@ -34,15 +34,17 @@
                 stream.addTrack(videoTrack);
             }
             if (isAudio) {
-                const context = new AudioContext();
+                // Render real audio without a physical output device, whose clock may stall on a headless host.
+                const AUDIO_CONTEXT_OPTIONS: AudioContextOptions & { sinkId: { type: 'none' } } = { sinkId: { type: 'none' } };
+                const context = new AudioContext(AUDIO_CONTEXT_OPTIONS);
                 const oscillator = context.createOscillator();
                 const destination = context.createMediaStreamDestination();
                 oscillator.connect(destination); oscillator.start();
                 stream.addTrack(destination.stream.getAudioTracks()[0]);
-                void context.resume();
+                await context.resume();
             }
             streams.push(stream);
-            return Promise.resolve(stream);
+            return stream;
         };
         Object.defineProperties(navigator.mediaDevices, {
             getUserMedia: { value: (constraints: MediaStreamConstraints) => createStream(Boolean(constraints.video), Boolean(constraints.audio)) },

exec
/bin/zsh -lc "sed -n '82,160p' tests/e2e/room-theme.spec.ts && sed -n '92,116p' tests/e2e/public-submissions.spec.ts && sed -n '277,304p' tests/e2e/public-submissions.spec.ts" in /Users/hejny/work/aldaron
 succeeded in 0ms:

/** Appearance controls must leave the title readable even beside every workshop status badge. */
async function checkResponsiveRoom(page: Page, testInfo: TestInfo, screenshotPrefix: string): Promise<void> {
    for (const width of RESPONSIVE_WIDTHS) {
        await page.setViewportSize({ width, height: 1000 });
        if (width === 1440 || width === 390) {
            await page.screenshot({ path: testInfo.outputPath(`${screenshotPrefix}-${width}.png`), fullPage: true });
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        const titleWidth = await page.getByText(ROOM_TITLE, { exact: true }).evaluate((title) => title.clientWidth);
        expect(titleWidth).toBeGreaterThanOrEqual(MINIMAL_READABLE_TITLE_WIDTH);
    }
}

test('shares a saved room appearance, follows the device, and preserves the waiting-room form', async ({ page }) => {
    const browserErrors: string[] = [];
    page.on('pageerror', (error) => browserErrors.push(error.message));
    await mockRoomResponses(page, false);
    await page.emulateMedia({ colorScheme: 'light' });
    await openPublishedRoom(page, COMMUNITY_PATH);
    await expect(page.getByRole('button', { name: 'Podle zařízení', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('color', PALETTES[0].heading);
    await page.getByLabel('Jméno a příjmení').fill('Jana Nováková');
    await page.getByLabel('E-mail', { exact: true }).fill('room-theme@example.com');

    const darkButton = page.getByRole('button', { name: 'Tmavý režim', exact: true });
    await darkButton.focus();
    await page.keyboard.press('Enter');
    await expect(darkButton).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByLabel('Jméno a příjmení')).toHaveValue('Jana Nováková');
    await expect(page.getByLabel('E-mail', { exact: true })).toHaveValue('room-theme@example.com');
    await expect(page.locator('[data-cookie-consent-panel]')).toHaveCSS('background-color', PALETTES[1].surface);
    await page.getByRole('button', { name: 'Nastavit', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Nastavení cookies' })).toHaveCSS('background-color', PALETTES[1].surface);
    await page.keyboard.press('Escape');
    await page.reload();
    await expect(darkButton).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('color', PALETTES[1].heading);

    await page.getByRole('button', { name: 'Podle zařízení', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('color', PALETTES[0].heading);
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('color', PALETTES[1].heading);
    await page.getByRole('button', { name: 'Světlý režim', exact: true }).click();
    await openPublishedRoom(page, PARTICIPANT_PATH);
    await expect(page.getByRole('button', { name: 'Světlý režim', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('color', PALETTES[0].heading);
    await page.getByRole('button', { name: 'Nastavit', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Nastavení cookies' })).toHaveCSS('background-color', PALETTES[0].surface);
    await page.keyboard.press('Escape');

    await page.goto('/cs/online-workshop');
    await expect(page.getByRole('group', { name: 'Barevný režim' })).toHaveCount(0);
    await expect(page.locator('[data-cookie-consent-panel]')).toHaveCSS('color-scheme', 'dark');
    await openPublishedRoom(page, COMMUNITY_PATH);
    await expect(page.getByRole('button', { name: 'Světlý režim', exact: true })).toHaveAttribute('aria-pressed', 'true');
    expect(browserErrors).toEqual([]);
});

test('themes connected rooms, materials, and portalled dialogs on desktop and mobile without losing drafts', async ({ page }, testInfo) => {
    const browserErrors: string[] = [];
    page.on('pageerror', (error) => browserErrors.push(error.message));
    await mockRoomResponses(page, true);
    await openPublishedRoom(page, COMMUNITY_PATH);
    await page.getByRole('button', { name: 'Přijmout vše', exact: true }).click();
    const chatDraft = page.getByRole('textbox', { name: 'Nová zpráva do chatu' });
    await chatDraft.fill('Rozepsaný komentář');

    for (const palette of PALETTES) {
        await page.getByRole('button', { name: palette.label, exact: true }).click();
        await expect(chatDraft).toHaveValue('Rozepsaný komentář');
        await expect(page.getByRole('heading', { name: 'Živý chat', exact: true })).toHaveCSS('color', palette.heading);
        await expect(page.getByRole('heading', { name: 'Co vás zajímá?', exact: true })).toHaveCSS('color', palette.heading);
        await expect(page.getByRole('heading', { name: 'Poznámky', exact: true })).toHaveCSS('color', palette.text);
        await page.getByRole('button', { name: 'Sdílet projekt', exact: true }).click();
        await expect(page.getByRole('dialog')).toHaveCSS('background-color', palette.surface);
        await page.keyboard.press('Escape');
        await page.getByRole('button', { name: 'Free členství. Otevřít možnosti členství' }).click();
        await expect(page.getByRole('dialog')).toHaveCSS('background-color', palette.surface);

    await expect(page.getByRole('heading', { name: 'Děkuji, zpráva je odeslaná' })).toBeVisible();
});

test('submits a published online-workshop registration', async ({ page }) => {
    await page.goto('/cs/online-workshop');

    const registrationForm = page.locator('#registrace form').first();
    if ((await registrationForm.count()) === 0) {
        test.skip(true, 'The configured database has no published future online workshop available for registration.');
    }

    await registrationForm.locator('input[name="fullname"]').fill('E2E Online Workshop');
    await registrationForm.locator('input[name="email"]').fill(createE2eTestEmail('online-workshop-registration'));
    await registrationForm.locator('input[name="phone"]').fill('+420 777 000 002');

    const thankYouNavigation = page.waitForURL(/\/cs\/online-workshop\/dekujeme/);
    await submitAndExpectApiSuccess(page, '/api/waitlist', () =>
        registrationForm.getByRole('button', { name: 'Rezervovat místo zdarma' }).click(),
    );
    await thankYouNavigation;
    await expect(page).toHaveURL(/\/cs\/online-workshop\/dekujeme/);
});

test('personalizes and submits the 199 Kč Promptbook paid community membership', async ({ page }) => {
    ).toBeVisible();
});

test('connects a public online-workshop participant', async ({ page }) => {
    await page.goto('/cs/online-workshop/participant');

    const fullname = page.locator('#participant-fullname');
    if ((await fullname.count()) === 0) {
        test.skip(
            true,
            'The configured database has no published workshop room available for participant registration.',
        );
    }

    const connectionForm = fullname.locator('xpath=ancestor::form');
    await fullname.fill('E2E Participant');
    await page.locator('#participant-email').fill(createE2eTestEmail('workshop-participant'));

    await submitAndExpectApiSuccess(page, /\/api\/workshops\/[^/]+\/connect$/, () =>
        connectionForm.getByRole('button', { name: /Připojit/ }).click(),
    );
});

exec
/bin/zsh -lc 'tail -n 9 /tmp/aldaron-test-for-ptbk-coder.log' in /Users/hejny/work/aldaron
 succeeded in 0ms:
[WebServer] (node:23858) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  -  66 tests/e2e/public-submissions.spec.ts:280:5 › connects a public online-workshop participant
  ✓  67 tests/e2e/recording-studio.spec.ts:78:5 › requires admin authentication for the recording studio (7.6s)
  ✓  68 tests/e2e/recording-studio.spec.ts:83:5 › records separate sources, restores them, trims every track and exports playable editor material (16.1s)
  ✓  69 tests/e2e/recording-studio.spec.ts:164:5 › stops the whole take on disconnect and prevents a second tab from changing it (4.8s)
  ✓  70 tests/e2e/recording-studio.spec.ts:184:5 › recovers persisted chunks after an interrupted page and waits for stop before admin navigation (33.2s)
[WebServer] Failed to load the community room: TypeError: fetch failed
  -  71 tests/e2e/room-theme.spec.ts:96:5 › shares a saved room appearance, follows the device, and preserves the waiting-room form

diff --git a/AGENTS.md b/AGENTS.md
index 7ccd1cd9ab95fc3714da646dc39d1e229c1f4734..3314bd5373931a916150ca90931419129fe3c333
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -392,3 +392,5 @@
   independent and retry once in a fresh browser context for transient failures;
   failed-attempt traces remain available. Each attempt archives one recording in
   `tests/e2e/videos/`, retaining only recent runs.
+- Recording-studio E2E sources use canvas video and synthesized audio with a silent Web Audio output, independent
+  of physical audio-device clocks. Keep recording, storage, codecs, trimming, and ZIP exports real in these tests.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index c6fc7d8859d693c0e925481be24aed730141c0ac..a4a78ee8f8cc864ed0297a236e359c4051be9cf0
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,10 @@
 
 ## Unreleased
 
+- Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
+  microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
+  sources produce real media for the existing recording, ZIP, trimming, and playback checks.
+
 - Let administrators choose whether a community-membership discount code remains permanent or applies only to a
   selected number of monthly renewals. Stripe now receives the matching coupon, so a temporary reduction ends at the
   full subscription price without an application-side timer; existing codes remain permanent.
diff --git a/README.md b/README.md
index edf7257a302096b486cd1cc6bba29c38d579ac24..8b59b12ea2d48ba53b717d06b952e19f71aa3de3
--- a/README.md
+++ b/README.md
@@ -69,6 +69,9 @@
 need no full-memory buffer. Other browsers use a download fallback capped at 256 MiB to avoid exhausting memory.
 The studio adds no environment variables, uploads, server APIs, or database migrations.
 
+Its E2E tests supply canvas video and synthesized audio with a silent Web Audio output, so they need no physical
+camera, microphone, or working speaker device. Recording, storage, codecs, trimming, and ZIP exports remain real.
+
 ## Technology
 
 - **Next.js 15** App Router, React, and TypeScript
diff --git a/tests/e2e/recording-studio.spec.ts b/tests/e2e/recording-studio.spec.ts
index 5154b89d98ec838477b8c80f45cba785303770c5..0fa2dbe0f3b430e6f35901d97d826427321404e4
--- a/tests/e2e/recording-studio.spec.ts
+++ b/tests/e2e/recording-studio.spec.ts
@@ -15,7 +15,7 @@
         // Only replace physical devices/the permission picker. Recording, storage, codecs and ZIP are real.
         const streams: MediaStream[] = [];
         Object.assign(window, { studioTestStreams: streams });
-        const createStream = (isVideo: boolean, isAudio: boolean) => {
+        const createStream = async (isVideo: boolean, isAudio: boolean) => {
             const stream = new MediaStream();
             if (isVideo) {
                 const canvas = document.createElement('canvas');
@@ -34,15 +34,17 @@
                 stream.addTrack(videoTrack);
             }
             if (isAudio) {
-                const context = new AudioContext();
+                // Render real audio without a physical output device, whose clock may stall on a headless host.
+                const AUDIO_CONTEXT_OPTIONS: AudioContextOptions & { sinkId: { type: 'none' } } = { sinkId: { type: 'none' } };
+                const context = new AudioContext(AUDIO_CONTEXT_OPTIONS);
                 const oscillator = context.createOscillator();
                 const destination = context.createMediaStreamDestination();
                 oscillator.connect(destination); oscillator.start();
                 stream.addTrack(destination.stream.getAudioTracks()[0]);
-                void context.resume();
+                await context.resume();
             }
             streams.push(stream);
-            return Promise.resolve(stream);
+            return stream;
         };
         Object.defineProperties(navigator.mediaDevices, {
             getUserMedia: { value: (constraints: MediaStreamConstraints) => createStream(Boolean(constraints.video), Boolean(constraints.audio)) },

codex
All recording-studio checks passed. A later room-theme test skipped after the configured database fetch failed. I’m letting the suite finish and will recheck that test if the connection recovers.

exec
/bin/zsh -lc 'tail -n 12 /tmp/aldaron-test-for-ptbk-coder.log' in /Users/hejny/work/aldaron
 succeeded in 0ms:
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  -  66 tests/e2e/public-submissions.spec.ts:280:5 › connects a public online-workshop participant
  ✓  67 tests/e2e/recording-studio.spec.ts:78:5 › requires admin authentication for the recording studio (7.6s)
  ✓  68 tests/e2e/recording-studio.spec.ts:83:5 › records separate sources, restores them, trims every track and exports playable editor material (16.1s)
  ✓  69 tests/e2e/recording-studio.spec.ts:164:5 › stops the whole take on disconnect and prevents a second tab from changing it (4.8s)
  ✓  70 tests/e2e/recording-studio.spec.ts:184:5 › recovers persisted chunks after an interrupted page and waits for stop before admin navigation (33.2s)
[WebServer] Failed to load the community room: TypeError: fetch failed
  -  71 tests/e2e/room-theme.spec.ts:96:5 › shares a saved room appearance, follows the device, and preserves the waiting-room form
[WebServer] (node:25261) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓  72 tests/e2e/room-theme.spec.ts:141:5 › themes connected rooms, materials, and portalled dialogs on desktop and mobile without losing drafts (25.9s)
  ✓  73 tests/e2e/workshop-agents.spec.ts:34:9 › defines a Book agent in the workshop administration (4.0s)

diff --git a/AGENTS.md b/AGENTS.md
index 7ccd1cd9ab95fc3714da646dc39d1e229c1f4734..3314bd5373931a916150ca90931419129fe3c333
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -392,3 +392,5 @@
   independent and retry once in a fresh browser context for transient failures;
   failed-attempt traces remain available. Each attempt archives one recording in
   `tests/e2e/videos/`, retaining only recent runs.
+- Recording-studio E2E sources use canvas video and synthesized audio with a silent Web Audio output, independent
+  of physical audio-device clocks. Keep recording, storage, codecs, trimming, and ZIP exports real in these tests.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index c6fc7d8859d693c0e925481be24aed730141c0ac..a4a78ee8f8cc864ed0297a236e359c4051be9cf0
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,10 @@
 
 ## Unreleased
 
+- Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
+  microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
+  sources produce real media for the existing recording, ZIP, trimming, and playback checks.
+
 - Let administrators choose whether a community-membership discount code remains permanent or applies only to a
   selected number of monthly renewals. Stripe now receives the matching coupon, so a temporary reduction ends at the
   full subscription price without an application-side timer; existing codes remain permanent.
diff --git a/README.md b/README.md
index edf7257a302096b486cd1cc6bba29c38d579ac24..8b59b12ea2d48ba53b717d06b952e19f71aa3de3
--- a/README.md
+++ b/README.md
@@ -69,6 +69,9 @@
 need no full-memory buffer. Other browsers use a download fallback capped at 256 MiB to avoid exhausting memory.
 The studio adds no environment variables, uploads, server APIs, or database migrations.
 
+Its E2E tests supply canvas video and synthesized audio with a silent Web Audio output, so they need no physical
+camera, microphone, or working speaker device. Recording, storage, codecs, trimming, and ZIP exports remain real.
+
 ## Technology
 
 - **Next.js 15** App Router, React, and TypeScript
diff --git a/tests/e2e/recording-studio.spec.ts b/tests/e2e/recording-studio.spec.ts
index 5154b89d98ec838477b8c80f45cba785303770c5..0fa2dbe0f3b430e6f35901d97d826427321404e4
--- a/tests/e2e/recording-studio.spec.ts
+++ b/tests/e2e/recording-studio.spec.ts
@@ -15,7 +15,7 @@
         // Only replace physical devices/the permission picker. Recording, storage, codecs and ZIP are real.
         const streams: MediaStream[] = [];
         Object.assign(window, { studioTestStreams: streams });
-        const createStream = (isVideo: boolean, isAudio: boolean) => {
+        const createStream = async (isVideo: boolean, isAudio: boolean) => {
             const stream = new MediaStream();
             if (isVideo) {
                 const canvas = document.createElement('canvas');
@@ -34,15 +34,17 @@
                 stream.addTrack(videoTrack);
             }
             if (isAudio) {
-                const context = new AudioContext();
+                // Render real audio without a physical output device, whose clock may stall on a headless host.
+                const AUDIO_CONTEXT_OPTIONS: AudioContextOptions & { sinkId: { type: 'none' } } = { sinkId: { type: 'none' } };
+                const context = new AudioContext(AUDIO_CONTEXT_OPTIONS);
                 const oscillator = context.createOscillator();
                 const destination = context.createMediaStreamDestination();
                 oscillator.connect(destination); oscillator.start();
                 stream.addTrack(destination.stream.getAudioTracks()[0]);
-                void context.resume();
+                await context.resume();
             }
             streams.push(stream);
-            return Promise.resolve(stream);
+            return stream;
         };
         Object.defineProperties(navigator.mediaDevices, {
             getUserMedia: { value: (constraints: MediaStreamConstraints) => createStream(Boolean(constraints.video), Boolean(constraints.audio)) },

exec
/bin/zsh -lc 'tail -n 12 /tmp/aldaron-test-for-ptbk-coder.log' in /Users/hejny/work/aldaron
 succeeded in 0ms:
  ✓  69 tests/e2e/recording-studio.spec.ts:164:5 › stops the whole take on disconnect and prevents a second tab from changing it (4.8s)
  ✓  70 tests/e2e/recording-studio.spec.ts:184:5 › recovers persisted chunks after an interrupted page and waits for stop before admin navigation (33.2s)
[WebServer] Failed to load the community room: TypeError: fetch failed
  -  71 tests/e2e/room-theme.spec.ts:96:5 › shares a saved room appearance, follows the device, and preserves the waiting-room form
[WebServer] (node:25261) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓  72 tests/e2e/room-theme.spec.ts:141:5 › themes connected rooms, materials, and portalled dialogs on desktop and mobile without losing drafts (25.9s)
  ✓  73 tests/e2e/workshop-agents.spec.ts:34:9 › defines a Book agent in the workshop administration (4.0s)
  ✓  74 tests/e2e/workshop-agents.spec.ts:34:9 › defines a Book agent in the community administration (40.4s)
  ✓  75 tests/e2e/workshop-repository-range.spec.ts:31:5 › edits independent commit bounds in workshop settings (5.8s)
  ✓  76 tests/e2e/workshop-repository-range.spec.ts:67:5 › previews the deployed app while browsing the highlighted workshop range (2.5s)
  ✓  77 tests/e2e/workshop-subtitles.spec.ts:63:5 › imports, autosaves, reloads and downloads private subtitles through the shared admin editor (4.2s)

diff --git a/AGENTS.md b/AGENTS.md
index 7ccd1cd9ab95fc3714da646dc39d1e229c1f4734..3314bd5373931a916150ca90931419129fe3c333
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -392,3 +392,5 @@
   independent and retry once in a fresh browser context for transient failures;
   failed-attempt traces remain available. Each attempt archives one recording in
   `tests/e2e/videos/`, retaining only recent runs.
+- Recording-studio E2E sources use canvas video and synthesized audio with a silent Web Audio output, independent
+  of physical audio-device clocks. Keep recording, storage, codecs, trimming, and ZIP exports real in these tests.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index c6fc7d8859d693c0e925481be24aed730141c0ac..a4a78ee8f8cc864ed0297a236e359c4051be9cf0
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,10 @@
 
 ## Unreleased
 
+- Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
+  microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
+  sources produce real media for the existing recording, ZIP, trimming, and playback checks.
+
 - Let administrators choose whether a community-membership discount code remains permanent or applies only to a
   selected number of monthly renewals. Stripe now receives the matching coupon, so a temporary reduction ends at the
   full subscription price without an application-side timer; existing codes remain permanent.
diff --git a/README.md b/README.md
index edf7257a302096b486cd1cc6bba29c38d579ac24..8b59b12ea2d48ba53b717d06b952e19f71aa3de3
--- a/README.md
+++ b/README.md
@@ -69,6 +69,9 @@
 need no full-memory buffer. Other browsers use a download fallback capped at 256 MiB to avoid exhausting memory.
 The studio adds no environment variables, uploads, server APIs, or database migrations.
 
+Its E2E tests supply canvas video and synthesized audio with a silent Web Audio output, so they need no physical
+camera, microphone, or working speaker device. Recording, storage, codecs, trimming, and ZIP exports remain real.
+
 ## Technology
 
 - **Next.js 15** App Router, React, and TypeScript
diff --git a/tests/e2e/recording-studio.spec.ts b/tests/e2e/recording-studio.spec.ts
index 5154b89d98ec838477b8c80f45cba785303770c5..0fa2dbe0f3b430e6f35901d97d826427321404e4
--- a/tests/e2e/recording-studio.spec.ts
+++ b/tests/e2e/recording-studio.spec.ts
@@ -15,7 +15,7 @@
         // Only replace physical devices/the permission picker. Recording, storage, codecs and ZIP are real.
         const streams: MediaStream[] = [];
         Object.assign(window, { studioTestStreams: streams });
-        const createStream = (isVideo: boolean, isAudio: boolean) => {
+        const createStream = async (isVideo: boolean, isAudio: boolean) => {
             const stream = new MediaStream();
             if (isVideo) {
                 const canvas = document.createElement('canvas');
@@ -34,15 +34,17 @@
                 stream.addTrack(videoTrack);
             }
             if (isAudio) {
-                const context = new AudioContext();
+                // Render real audio without a physical output device, whose clock may stall on a headless host.
+                const AUDIO_CONTEXT_OPTIONS: AudioContextOptions & { sinkId: { type: 'none' } } = { sinkId: { type: 'none' } };
+                const context = new AudioContext(AUDIO_CONTEXT_OPTIONS);
                 const oscillator = context.createOscillator();
                 const destination = context.createMediaStreamDestination();
                 oscillator.connect(destination); oscillator.start();
                 stream.addTrack(destination.stream.getAudioTracks()[0]);
-                void context.resume();
+                await context.resume();
             }
             streams.push(stream);
-            return Promise.resolve(stream);
+            return stream;
         };
         Object.defineProperties(navigator.mediaDevices, {
             getUserMedia: { value: (constraints: MediaStreamConstraints) => createStream(Boolean(constraints.video), Boolean(constraints.audio)) },

exec
/bin/zsh -lc 'tail -n 9 /tmp/aldaron-test-for-ptbk-coder.log' in /Users/hejny/work/aldaron
 succeeded in 359ms:
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓  72 tests/e2e/room-theme.spec.ts:141:5 › themes connected rooms, materials, and portalled dialogs on desktop and mobile without losing drafts (25.9s)
  ✓  73 tests/e2e/workshop-agents.spec.ts:34:9 › defines a Book agent in the workshop administration (4.0s)
  ✓  74 tests/e2e/workshop-agents.spec.ts:34:9 › defines a Book agent in the community administration (40.4s)
  ✓  75 tests/e2e/workshop-repository-range.spec.ts:31:5 › edits independent commit bounds in workshop settings (5.8s)
  ✓  76 tests/e2e/workshop-repository-range.spec.ts:67:5 › previews the deployed app while browsing the highlighted workshop range (2.5s)
  ✓  77 tests/e2e/workshop-subtitles.spec.ts:63:5 › imports, autosaves, reloads and downloads private subtitles through the shared admin editor (4.2s)
  ✓  78 tests/e2e/workshop-subtitles.spec.ts:107:5 › decodes a long recording into bounded audio chunks and preserves multilingual timestamps (3.6s)
  ✓  79 tests/e2e/workshop-vercel-deployment.spec.ts:31:9 › deploys a workshop project and saves its ready URL through the existing settings form (6.7s)

diff --git a/AGENTS.md b/AGENTS.md
index 7ccd1cd9ab95fc3714da646dc39d1e229c1f4734..3314bd5373931a916150ca90931419129fe3c333
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -392,3 +392,5 @@
   independent and retry once in a fresh browser context for transient failures;
   failed-attempt traces remain available. Each attempt archives one recording in
   `tests/e2e/videos/`, retaining only recent runs.
+- Recording-studio E2E sources use canvas video and synthesized audio with a silent Web Audio output, independent
+  of physical audio-device clocks. Keep recording, storage, codecs, trimming, and ZIP exports real in these tests.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index c6fc7d8859d693c0e925481be24aed730141c0ac..a4a78ee8f8cc864ed0297a236e359c4051be9cf0
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,10 @@
 
 ## Unreleased
 
+- Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
+  microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
+  sources produce real media for the existing recording, ZIP, trimming, and playback checks.
+
 - Let administrators choose whether a community-membership discount code remains permanent or applies only to a
   selected number of monthly renewals. Stripe now receives the matching coupon, so a temporary reduction ends at the
   full subscription price without an application-side timer; existing codes remain permanent.
diff --git a/README.md b/README.md
index edf7257a302096b486cd1cc6bba29c38d579ac24..8b59b12ea2d48ba53b717d06b952e19f71aa3de3
--- a/README.md
+++ b/README.md
@@ -69,6 +69,9 @@
 need no full-memory buffer. Other browsers use a download fallback capped at 256 MiB to avoid exhausting memory.
 The studio adds no environment variables, uploads, server APIs, or database migrations.
 
+Its E2E tests supply canvas video and synthesized audio with a silent Web Audio output, so they need no physical
+camera, microphone, or working speaker device. Recording, storage, codecs, trimming, and ZIP exports remain real.
+
 ## Technology
 
 - **Next.js 15** App Router, React, and TypeScript
diff --git a/tests/e2e/recording-studio.spec.ts b/tests/e2e/recording-studio.spec.ts
index 5154b89d98ec838477b8c80f45cba785303770c5..0fa2dbe0f3b430e6f35901d97d826427321404e4
--- a/tests/e2e/recording-studio.spec.ts
+++ b/tests/e2e/recording-studio.spec.ts
@@ -15,7 +15,7 @@
         // Only replace physical devices/the permission picker. Recording, storage, codecs and ZIP are real.
         const streams: MediaStream[] = [];
         Object.assign(window, { studioTestStreams: streams });
-        const createStream = (isVideo: boolean, isAudio: boolean) => {
+        const createStream = async (isVideo: boolean, isAudio: boolean) => {
             const stream = new MediaStream();
             if (isVideo) {
                 const canvas = document.createElement('canvas');
@@ -34,15 +34,17 @@
                 stream.addTrack(videoTrack);
             }
             if (isAudio) {
-                const context = new AudioContext();
+                // Render real audio without a physical output device, whose clock may stall on a headless host.
+                const AUDIO_CONTEXT_OPTIONS: AudioContextOptions & { sinkId: { type: 'none' } } = { sinkId: { type: 'none' } };
+                const context = new AudioContext(AUDIO_CONTEXT_OPTIONS);
                 const oscillator = context.createOscillator();
                 const destination = context.createMediaStreamDestination();
                 oscillator.connect(destination); oscillator.start();
                 stream.addTrack(destination.stream.getAudioTracks()[0]);
-                void context.resume();
+                await context.resume();
             }
             streams.push(stream);
-            return Promise.resolve(stream);
+            return stream;
         };
         Object.defineProperties(navigator.mediaDevices, {
             getUserMedia: { value: (constraints: MediaStreamConstraints) => createStream(Boolean(constraints.video), Boolean(constraints.audio)) },

codex
The subsequent room-theme and workshop checks passed. The suite is finishing its deployment and PDF-export tests, followed by test-data cleanup. There are still no test failures.

 succeeded in 396511ms:
exec
/bin/zsh -lc 'tail -n 24 /tmp/aldaron-test-for-ptbk-coder.log' in /Users/hejny/work/aldaron
 succeeded in 0ms:
[WebServer] Failed to load the community room: TypeError: fetch failed
  -  71 tests/e2e/room-theme.spec.ts:96:5 › shares a saved room appearance, follows the device, and preserves the waiting-room form
[WebServer] (node:25261) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓  72 tests/e2e/room-theme.spec.ts:141:5 › themes connected rooms, materials, and portalled dialogs on desktop and mobile without losing drafts (25.9s)
  ✓  73 tests/e2e/workshop-agents.spec.ts:34:9 › defines a Book agent in the workshop administration (4.0s)
  ✓  74 tests/e2e/workshop-agents.spec.ts:34:9 › defines a Book agent in the community administration (40.4s)
  ✓  75 tests/e2e/workshop-repository-range.spec.ts:31:5 › edits independent commit bounds in workshop settings (5.8s)
  ✓  76 tests/e2e/workshop-repository-range.spec.ts:67:5 › previews the deployed app while browsing the highlighted workshop range (2.5s)
  ✓  77 tests/e2e/workshop-subtitles.spec.ts:63:5 › imports, autosaves, reloads and downloads private subtitles through the shared admin editor (4.2s)
  ✓  78 tests/e2e/workshop-subtitles.spec.ts:107:5 › decodes a long recording into bounded audio chunks and preserves multilingual timestamps (3.6s)
  ✓  79 tests/e2e/workshop-vercel-deployment.spec.ts:31:9 › deploys a workshop project and saves its ready URL through the existing settings form (6.7s)
  ✓  80 tests/e2e/workshop-vercel-deployment.spec.ts:31:9 › shows Vercel failure details and guidance, then saves the URL after retrying (12.3s)
  ✓  81 tests/e2e/workshop-wrap-up-pdf.spec.ts:34:5 › downloads the branded recap in the browser with local fonts, project preview, Git graph and short-link QR (8.2s)
Saved 76 E2E video(s) to tests/e2e/videos/.
Removed the E2E video(s) of 1 outdated run(s) from tests/e2e/videos/.

  3 skipped
  78 passed (6.4m)

> promptbook-landing-page@0.1.0 delete-test-data
> tsx scripts/delete-test-data.ts

Deleted 18 Contact row(s) and 0 workshop participant row(s) with an @example.com e-mail address.

diff --git a/AGENTS.md b/AGENTS.md
index 7ccd1cd9ab95fc3714da646dc39d1e229c1f4734..3314bd5373931a916150ca90931419129fe3c333
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -392,3 +392,5 @@
   independent and retry once in a fresh browser context for transient failures;
   failed-attempt traces remain available. Each attempt archives one recording in
   `tests/e2e/videos/`, retaining only recent runs.
+- Recording-studio E2E sources use canvas video and synthesized audio with a silent Web Audio output, independent
+  of physical audio-device clocks. Keep recording, storage, codecs, trimming, and ZIP exports real in these tests.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index c6fc7d8859d693c0e925481be24aed730141c0ac..a4a78ee8f8cc864ed0297a236e359c4051be9cf0
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,10 @@
 
 ## Unreleased
 
+- Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
+  microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
+  sources produce real media for the existing recording, ZIP, trimming, and playback checks.
+
 - Let administrators choose whether a community-membership discount code remains permanent or applies only to a
   selected number of monthly renewals. Stripe now receives the matching coupon, so a temporary reduction ends at the
   full subscription price without an application-side timer; existing codes remain permanent.
diff --git a/README.md b/README.md
index edf7257a302096b486cd1cc6bba29c38d579ac24..8b59b12ea2d48ba53b717d06b952e19f71aa3de3
--- a/README.md
+++ b/README.md
@@ -69,6 +69,9 @@
 need no full-memory buffer. Other browsers use a download fallback capped at 256 MiB to avoid exhausting memory.
 The studio adds no environment variables, uploads, server APIs, or database migrations.
 
+Its E2E tests supply canvas video and synthesized audio with a silent Web Audio output, so they need no physical
+camera, microphone, or working speaker device. Recording, storage, codecs, trimming, and ZIP exports remain real.
+
 ## Technology
 
 - **Next.js 15** App Router, React, and TypeScript
diff --git a/tests/e2e/recording-studio.spec.ts b/tests/e2e/recording-studio.spec.ts
index 5154b89d98ec838477b8c80f45cba785303770c5..0fa2dbe0f3b430e6f35901d97d826427321404e4
--- a/tests/e2e/recording-studio.spec.ts
+++ b/tests/e2e/recording-studio.spec.ts
@@ -15,7 +15,7 @@
         // Only replace physical devices/the permission picker. Recording, storage, codecs and ZIP are real.
         const streams: MediaStream[] = [];
         Object.assign(window, { studioTestStreams: streams });
-        const createStream = (isVideo: boolean, isAudio: boolean) => {
+        const createStream = async (isVideo: boolean, isAudio: boolean) => {
             const stream = new MediaStream();
             if (isVideo) {
                 const canvas = document.createElement('canvas');
@@ -34,15 +34,17 @@
                 stream.addTrack(videoTrack);
             }
             if (isAudio) {
-                const context = new AudioContext();
+                // Render real audio without a physical output device, whose clock may stall on a headless host.
+                const AUDIO_CONTEXT_OPTIONS: AudioContextOptions & { sinkId: { type: 'none' } } = { sinkId: { type: 'none' } };
+                const context = new AudioContext(AUDIO_CONTEXT_OPTIONS);
                 const oscillator = context.createOscillator();
                 const destination = context.createMediaStreamDestination();
                 oscillator.connect(destination); oscillator.start();
                 stream.addTrack(destination.stream.getAudioTracks()[0]);
-                void context.resume();
+                await context.resume();
             }
             streams.push(stream);
-            return Promise.resolve(stream);
+            return stream;
         };
         Object.defineProperties(navigator.mediaDevices, {
             getUserMedia: { value: (constraints: MediaStreamConstraints) => createStream(Boolean(constraints.video), Boolean(constraints.audio)) },

codex
`npm run test-for-ptbk-coder` passed, including cleanup: 78 browser tests passed and 3 skipped. I’m rerunning the room-theme test that skipped during the database fetch error to confirm its assertions execute.

exec
/bin/zsh -lc 'git diff --check && git diff --stat && git status --short' in /Users/hejny/work/aldaron
 succeeded in 0ms:
 AGENTS.md                          |  2 ++
 CHANGELOG.md                       |  4 ++++
 README.md                          |  3 +++
 tests/e2e/recording-studio.spec.ts | 10 ++++++----
 4 files changed, 15 insertions(+), 4 deletions(-)
 M AGENTS.md
 M CHANGELOG.md
 M README.md
 M tests/e2e/recording-studio.spec.ts
?? prompts/2026-09-0550-fix-the-existing-test-failures-before-implementing-any.md

exec
/bin/zsh -lc "npm run test-e2e -- tests/e2e/room-theme.spec.ts --grep 'shares a saved room appearance'" in /Users/hejny/work/aldaron
diff --git a/AGENTS.md b/AGENTS.md
index 7ccd1cd9ab95fc3714da646dc39d1e229c1f4734..3314bd5373931a916150ca90931419129fe3c333
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -392,3 +392,5 @@
   independent and retry once in a fresh browser context for transient failures;
   failed-attempt traces remain available. Each attempt archives one recording in
   `tests/e2e/videos/`, retaining only recent runs.
+- Recording-studio E2E sources use canvas video and synthesized audio with a silent Web Audio output, independent
+  of physical audio-device clocks. Keep recording, storage, codecs, trimming, and ZIP exports real in these tests.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index c6fc7d8859d693c0e925481be24aed730141c0ac..a4a78ee8f8cc864ed0297a236e359c4051be9cf0
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,10 @@
 
 ## Unreleased
 
+- Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
+  microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
+  sources produce real media for the existing recording, ZIP, trimming, and playback checks.
+
 - Let administrators choose whether a community-membership discount code remains permanent or applies only to a
   selected number of monthly renewals. Stripe now receives the matching coupon, so a temporary reduction ends at the
   full subscription price without an application-side timer; existing codes remain permanent.
diff --git a/README.md b/README.md
index edf7257a302096b486cd1cc6bba29c38d579ac24..8b59b12ea2d48ba53b717d06b952e19f71aa3de3
--- a/README.md
+++ b/README.md
@@ -69,6 +69,9 @@
 need no full-memory buffer. Other browsers use a download fallback capped at 256 MiB to avoid exhausting memory.
 The studio adds no environment variables, uploads, server APIs, or database migrations.
 
+Its E2E tests supply canvas video and synthesized audio with a silent Web Audio output, so they need no physical
+camera, microphone, or working speaker device. Recording, storage, codecs, trimming, and ZIP exports remain real.
+
 ## Technology
 
 - **Next.js 15** App Router, React, and TypeScript
diff --git a/tests/e2e/recording-studio.spec.ts b/tests/e2e/recording-studio.spec.ts
index 5154b89d98ec838477b8c80f45cba785303770c5..0fa2dbe0f3b430e6f35901d97d826427321404e4
--- a/tests/e2e/recording-studio.spec.ts
+++ b/tests/e2e/recording-studio.spec.ts
@@ -15,7 +15,7 @@
         // Only replace physical devices/the permission picker. Recording, storage, codecs and ZIP are real.
         const streams: MediaStream[] = [];
         Object.assign(window, { studioTestStreams: streams });
-        const createStream = (isVideo: boolean, isAudio: boolean) => {
+        const createStream = async (isVideo: boolean, isAudio: boolean) => {
             const stream = new MediaStream();
             if (isVideo) {
                 const canvas = document.createElement('canvas');
@@ -34,15 +34,17 @@
                 stream.addTrack(videoTrack);
             }
             if (isAudio) {
-                const context = new AudioContext();
+                // Render real audio without a physical output device, whose clock may stall on a headless host.
+                const AUDIO_CONTEXT_OPTIONS: AudioContextOptions & { sinkId: { type: 'none' } } = { sinkId: { type: 'none' } };
+                const context = new AudioContext(AUDIO_CONTEXT_OPTIONS);
                 const oscillator = context.createOscillator();
                 const destination = context.createMediaStreamDestination();
                 oscillator.connect(destination); oscillator.start();
                 stream.addTrack(destination.stream.getAudioTracks()[0]);
-                void context.resume();
+                await context.resume();
             }
             streams.push(stream);
-            return Promise.resolve(stream);
+            return stream;
         };
         Object.defineProperties(navigator.mediaDevices, {
             getUserMedia: { value: (constraints: MediaStreamConstraints) => createStream(Boolean(constraints.video), Boolean(constraints.audio)) },

 succeeded in 30173ms:
[WebServer] (node:27969) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] (node:28054) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] (node:28057) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] Database migrations skipped: DATABASE_URL is not configured.

Running 1 test using 1 worker

(node:28176) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ✓  1 tests/e2e/room-theme.spec.ts:96:5 › shares a saved room appearance, follows the device, and preserves the waiting-room form (20.0s)
Saved 1 E2E video(s) to tests/e2e/videos/.
Removed the E2E video(s) of 1 outdated run(s) from tests/e2e/videos/.

  1 passed (29.9s)

diff --git a/AGENTS.md b/AGENTS.md
index 7ccd1cd9ab95fc3714da646dc39d1e229c1f4734..3314bd5373931a916150ca90931419129fe3c333
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -392,3 +392,5 @@
   independent and retry once in a fresh browser context for transient failures;
   failed-attempt traces remain available. Each attempt archives one recording in
   `tests/e2e/videos/`, retaining only recent runs.
+- Recording-studio E2E sources use canvas video and synthesized audio with a silent Web Audio output, independent
+  of physical audio-device clocks. Keep recording, storage, codecs, trimming, and ZIP exports real in these tests.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index c6fc7d8859d693c0e925481be24aed730141c0ac..a4a78ee8f8cc864ed0297a236e359c4051be9cf0
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,10 @@
 
 ## Unreleased
 
+- Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
+  microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
+  sources produce real media for the existing recording, ZIP, trimming, and playback checks.
+
 - Let administrators choose whether a community-membership discount code remains permanent or applies only to a
   selected number of monthly renewals. Stripe now receives the matching coupon, so a temporary reduction ends at the
   full subscription price without an application-side timer; existing codes remain permanent.
diff --git a/README.md b/README.md
index edf7257a302096b486cd1cc6bba29c38d579ac24..8b59b12ea2d48ba53b717d06b952e19f71aa3de3
--- a/README.md
+++ b/README.md
@@ -69,6 +69,9 @@
 need no full-memory buffer. Other browsers use a download fallback capped at 256 MiB to avoid exhausting memory.
 The studio adds no environment variables, uploads, server APIs, or database migrations.
 
+Its E2E tests supply canvas video and synthesized audio with a silent Web Audio output, so they need no physical
+camera, microphone, or working speaker device. Recording, storage, codecs, trimming, and ZIP exports remain real.
+
 ## Technology
 
 - **Next.js 15** App Router, React, and TypeScript
diff --git a/tests/e2e/recording-studio.spec.ts b/tests/e2e/recording-studio.spec.ts
index 5154b89d98ec838477b8c80f45cba785303770c5..0fa2dbe0f3b430e6f35901d97d826427321404e4
--- a/tests/e2e/recording-studio.spec.ts
+++ b/tests/e2e/recording-studio.spec.ts
@@ -15,7 +15,7 @@
         // Only replace physical devices/the permission picker. Recording, storage, codecs and ZIP are real.
         const streams: MediaStream[] = [];
         Object.assign(window, { studioTestStreams: streams });
-        const createStream = (isVideo: boolean, isAudio: boolean) => {
+        const createStream = async (isVideo: boolean, isAudio: boolean) => {
             const stream = new MediaStream();
             if (isVideo) {
                 const canvas = document.createElement('canvas');
@@ -34,15 +34,17 @@
                 stream.addTrack(videoTrack);
             }
             if (isAudio) {
-                const context = new AudioContext();
+                // Render real audio without a physical output device, whose clock may stall on a headless host.
+                const AUDIO_CONTEXT_OPTIONS: AudioContextOptions & { sinkId: { type: 'none' } } = { sinkId: { type: 'none' } };
+                const context = new AudioContext(AUDIO_CONTEXT_OPTIONS);
                 const oscillator = context.createOscillator();
                 const destination = context.createMediaStreamDestination();
                 oscillator.connect(destination); oscillator.start();
                 stream.addTrack(destination.stream.getAudioTracks()[0]);
-                void context.resume();
+                await context.resume();
             }
             streams.push(stream);
-            return Promise.resolve(stream);
+            return stream;
         };
         Object.defineProperties(navigator.mediaDevices, {
             getUserMedia: { value: (constraints: MediaStreamConstraints) => createStream(Boolean(constraints.video), Boolean(constraints.audio)) },

codex
Fixed the recording fixture’s stalled audio clock using [silent Web Audio output](https://developer.chrome.com/blog/audiocontext-setsinkid). All assertions remain unchanged. Updated the changelog, README, and AGENTS.md.

Verification passed:

- `npm run test-for-ptbk-coder`: 78 passed, 3 skipped.
- The database-related skip passed on rerun; two data-dependent skips remain.
- All 19 recording unit tests passed.

Ready for the remaining coding tasks.
diff --git a/AGENTS.md b/AGENTS.md
index 7ccd1cd9ab95fc3714da646dc39d1e229c1f4734..3314bd5373931a916150ca90931419129fe3c333
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -392,3 +392,5 @@
   independent and retry once in a fresh browser context for transient failures;
   failed-attempt traces remain available. Each attempt archives one recording in
   `tests/e2e/videos/`, retaining only recent runs.
+- Recording-studio E2E sources use canvas video and synthesized audio with a silent Web Audio output, independent
+  of physical audio-device clocks. Keep recording, storage, codecs, trimming, and ZIP exports real in these tests.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index c6fc7d8859d693c0e925481be24aed730141c0ac..a4a78ee8f8cc864ed0297a236e359c4051be9cf0
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,10 @@
 
 ## Unreleased
 
+- Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
+  microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
+  sources produce real media for the existing recording, ZIP, trimming, and playback checks.
+
 - Let administrators choose whether a community-membership discount code remains permanent or applies only to a
   selected number of monthly renewals. Stripe now receives the matching coupon, so a temporary reduction ends at the
   full subscription price without an application-side timer; existing codes remain permanent.
diff --git a/README.md b/README.md
index edf7257a302096b486cd1cc6bba29c38d579ac24..8b59b12ea2d48ba53b717d06b952e19f71aa3de3
--- a/README.md
+++ b/README.md
@@ -69,6 +69,9 @@
 need no full-memory buffer. Other browsers use a download fallback capped at 256 MiB to avoid exhausting memory.
 The studio adds no environment variables, uploads, server APIs, or database migrations.
 
+Its E2E tests supply canvas video and synthesized audio with a silent Web Audio output, so they need no physical
+camera, microphone, or working speaker device. Recording, storage, codecs, trimming, and ZIP exports remain real.
+
 ## Technology
 
 - **Next.js 15** App Router, React, and TypeScript
diff --git a/tests/e2e/recording-studio.spec.ts b/tests/e2e/recording-studio.spec.ts
index 5154b89d98ec838477b8c80f45cba785303770c5..0fa2dbe0f3b430e6f35901d97d826427321404e4
--- a/tests/e2e/recording-studio.spec.ts
+++ b/tests/e2e/recording-studio.spec.ts
@@ -15,7 +15,7 @@
         // Only replace physical devices/the permission picker. Recording, storage, codecs and ZIP are real.
         const streams: MediaStream[] = [];
         Object.assign(window, { studioTestStreams: streams });
-        const createStream = (isVideo: boolean, isAudio: boolean) => {
+        const createStream = async (isVideo: boolean, isAudio: boolean) => {
             const stream = new MediaStream();
             if (isVideo) {
                 const canvas = document.createElement('canvas');
@@ -34,15 +34,17 @@
                 stream.addTrack(videoTrack);
             }
             if (isAudio) {
-                const context = new AudioContext();
+                // Render real audio without a physical output device, whose clock may stall on a headless host.
+                const AUDIO_CONTEXT_OPTIONS: AudioContextOptions & { sinkId: { type: 'none' } } = { sinkId: { type: 'none' } };
+                const context = new AudioContext(AUDIO_CONTEXT_OPTIONS);
                 const oscillator = context.createOscillator();
                 const destination = context.createMediaStreamDestination();
                 oscillator.connect(destination); oscillator.start();
                 stream.addTrack(destination.stream.getAudioTracks()[0]);
-                void context.resume();
+                await context.resume();
             }
             streams.push(stream);
-            return Promise.resolve(stream);
+            return stream;
         };
         Object.defineProperties(navigator.mediaDevices, {
             getUserMedia: { value: (constraints: MediaStreamConstraints) => createStream(Boolean(constraints.video), Boolean(constraints.audio)) },

tokens used
109,687
Fixed the recording fixture’s stalled audio clock using [silent Web Audio output](https://developer.chrome.com/blog/audiocontext-setsinkid). All assertions remain unchanged. Updated the changelog, README, and AGENTS.md.

Verification passed:

- `npm run test-for-ptbk-coder`: 78 passed, 3 skipped.
- The database-related skip passed on rerun; two data-dependent skips remain.
- All 19 recording unit tests passed.

Ready for the remaining coding tasks.
[1]-  Done                    bash "$1"

=== runner shell finished at 2026-09-21T13:43:52.113Z ===
Status: succeeded

=== test shell started at 2026-09-21T13:43:52.136Z ===
Script path: /Users/hejny/work/aldaron/.promptbook/coder-prompts/2026-09-0550-fix-the-existing-test-failures-before-implementing-any.test.sh

--- raw input ---
cd "/Users/hejny/work/aldaron"
npm run test-for-ptbk-coder

--- raw output ---

> promptbook-landing-page@0.1.0 test-for-ptbk-coder
> npm run lint && npx kill-port 4009 && npm run test-types && npm run test-e2e && npm run delete-test-data


> promptbook-landing-page@0.1.0 lint
> next lint


./components/public-web-page-preview-image.tsx
33:13  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
Could not kill process on port 4009. No process running on port.

> promptbook-landing-page@0.1.0 test-types
> npm run build && tsc


> promptbook-landing-page@0.1.0 build
> next build

   ▲ Next.js 15.2.6
   - Environments: .env

   Creating an optimized production build ...
 ✓ Compiled successfully
   Skipping validation of types
   Skipping linting
   Collecting page data ...
   Generating static pages (0/82) ...
   Generating static pages (20/82) 
   Generating static pages (40/82) 
BenefitsSection rendered
IntegrationsSection rendered
BenefitsSection rendered
BenefitsSection rendered
IntegrationsSection rendered
BenefitsSection rendered
IntegrationsSection rendered
   Generating static pages (61/82) 
BenefitsSection rendered
IntegrationsSection rendered
 ✓ Generating static pages (82/82)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                                                                  Size  First Load JS  Revalidate  Expire
┌ ƒ /                                                                                       414 B         102 kB
├ ○ /_not-found                                                                             414 B         102 kB
├ ƒ /[shortcode]                                                                          2.31 kB         142 kB
├ ƒ /admin                                                                                  176 B         105 kB
├ ƒ /admin/community                                                                      7.78 kB         375 kB
├ ƒ /admin/contacts                                                                       24.9 kB         200 kB
├ ƒ /admin/discount-codes                                                                 8.35 kB         138 kB
├ ƒ /admin/login                                                                            414 B         102 kB
├ ƒ /admin/recording-studio                                                               89.8 kB         220 kB
├ ƒ /admin/shortener                                                                      49.5 kB         193 kB
├ ƒ /admin/workshops                                                                        220 B         367 kB
├ ○ /ai-supervize                                                                           16 kB         239 kB
├ ƒ /ai-supervize-mini                                                                    17.2 kB         233 kB
├ ○ /ai-supervize-mini/opengraph-image                                                      414 B         102 kB
├ ƒ /ai-supervize-mini/participant                                                        2.51 kB         139 kB
├ ○ /ai-supervize/opengraph-image                                                           414 B         102 kB
├ ○ /ai-ta-krajta                                                                         19.2 kB         146 kB          1h      1y
├ ○ /ai-ta-krajta/branding                                                                  203 B         122 kB
├ ○ /ai-ta-krajta/logo.png                                                                  414 B         102 kB
├ ○ /ai-ta-krajta/logo.svg                                                                  414 B         102 kB
├ ○ /ai-ta-krajta/manifest.webmanifest                                                      414 B         102 kB
├ ○ /ai-ta-krajta/media-kit                                                               3.63 kB         125 kB
├ ○ /ai-ta-krajta/opengraph-image                                                           414 B         102 kB
├ ƒ /api/admin/community/memberships                                                        414 B         102 kB
├ ƒ /api/admin/community/projects                                                           414 B         102 kB
├ ƒ /api/admin/community/projects/[projectId]                                               414 B         102 kB
├ ƒ /api/admin/discount-codes                                                               414 B         102 kB
├ ƒ /api/admin/discount-codes/[discountCodeId]                                              414 B         102 kB
├ ƒ /api/admin/session                                                                      414 B         102 kB
├ ƒ /api/admin/session/sign-out                                                             414 B         102 kB
├ ƒ /api/admin/shortener                                                                    414 B         102 kB
├ ƒ /api/admin/shortener/[shortcodeLinkId]                                                  414 B         102 kB
├ ƒ /api/admin/shortener/[shortcodeLinkId]/clicks                                           414 B         102 kB
├ ƒ /api/admin/workshops                                                                    414 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]                                                       414 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/agents                                                414 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/agents/[agentId]                                      414 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/agents/audio                                          414 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/agents/audio-session                                  414 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/analytics                                             414 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/artificial-reactions                                  414 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/comments                                              414 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/comments/[commentId]                                  414 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/comments/[commentId]/artificial-upvotes               414 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/comments/[commentId]/material                         414 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/content                                               414 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/content/[contentId]                                   414 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/exports/[exportKind]                                  414 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/feedback                                              414 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/participants                                          414 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/participants/[participantId]                          414 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/participants/[participantId]/timeline                 414 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/polls                                                 414 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/polls/[pollId]                                        414 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/polls/[pollId]/options/[optionId]                     414 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/polls/[pollId]/options/[optionId]/artificial-votes    414 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/reactions                                             414 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/stage-comment                                         414 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/subtitles                                             414 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/subtitles/[subtitleId]                                414 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/subtitles/transcribe                                  414 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/subtitles/youtube                                     414 B         102 kB
├ ƒ /api/admin/workshops/repository/commit                                                  414 B         102 kB
├ ƒ /api/admin/workshops/repository/deployment                                              414 B         102 kB
├ ƒ /api/ai-supervize-mini/registration                                                     414 B         102 kB
├ ƒ /api/ai-ta-krajta/episodes/search                                                       414 B         102 kB
├ ƒ /api/community/membership/registration                                                  414 B         102 kB
├ ƒ /api/contacts                                                                           414 B         102 kB
├ ƒ /api/contacts/export/[formatId]                                                         414 B         102 kB
├ ƒ /api/discount-codes/validate                                                            414 B         102 kB
├ ƒ /api/stripe/webhook                                                                     414 B         102 kB
├ ƒ /api/track-click                                                                        414 B         102 kB
├ ƒ /api/waitlist                                                                           414 B         102 kB
├ ƒ /api/workshop-agents/run                                                                414 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/comments                                                  414 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/comments/[commentId]                                      414 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/comments/[commentId]/material                             414 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/comments/[commentId]/upvotes                              414 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/connect                                                   414 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/feedback                                                  414 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership                                                414 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership/cancellation                                   414 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership/checkout                                       414 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership/checkout/confirmation                          414 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership/portal                                         414 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/participant                                               414 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/participants/[participantId]                              414 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/polls/[pollId]/options/[optionId]                         414 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/polls/[pollId]/votes                                      414 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/presence                                                  414 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/reactions                                                 414 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/repository                                                414 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/repository/preview                                        414 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/state                                                     414 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/wrap-up                                                   414 B         102 kB
├ ƒ /api/workshops/komunita/projects                                                        414 B         102 kB
├ ƒ /api/workshops/komunita/projects/[projectId]                                            414 B         102 kB
├ ƒ /api/workshops/komunita/projects/[projectId]/connect                                    414 B         102 kB
├ ƒ /api/workshops/komunita/projects/[projectId]/vote                                       414 B         102 kB
├ ƒ /api/workshops/komunita/projects/preview                                                414 B         102 kB
├ ○ /branding                                                                             4.74 kB         141 kB
├ ○ /contact                                                                              2.54 kB         164 kB
├ ○ /cs                                                                                     172 B         241 kB
├ ƒ /cs/komunita                                                                            230 B         302 kB
├ ƒ /cs/komunita/calendar.ics                                                               414 B         102 kB
├ ƒ /cs/komunita/clenstvi                                                                 13.1 kB         155 kB
├ ○ /cs/komunita/clenstvi/opengraph-image                                                   414 B         102 kB
├ ○ /cs/komunita/opengraph-image                                                            414 B         102 kB
├ ƒ /cs/komunita/projects                                                                 6.77 kB         141 kB
├ ƒ /cs/komunita/projects/[projectId]                                                     2.94 kB         299 kB
├ ○ /cs/obchodni-podminky                                                                 2.52 kB         139 kB
├ ○ /cs/ochrana-osobnich-udaju                                                            2.52 kB         139 kB
├ ƒ /cs/online-workshop                                                                   13.2 kB         246 kB
├ ƒ /cs/online-workshop/dekujeme                                                          4.46 kB         152 kB
├ ○ /cs/online-workshop/opengraph-image                                                     414 B         102 kB
├ ƒ /cs/online-workshop/participant                                                       3.05 kB         300 kB
├ ○ /cs/online-workshop/participant/opengraph-image                                         414 B         102 kB
├ ○ /cs/opengraph-image                                                                     414 B         102 kB
├ ○ /cs/pavol                                                                               157 B         203 kB
├ ○ /cs/pavol/opengraph-image                                                               414 B         102 kB
├ ○ /data-deletion                                                                        2.51 kB         139 kB
├ ○ /dekujeme                                                                             4.23 kB         151 kB
├ ○ /en                                                                                     172 B         241 kB
├ ○ /en/opengraph-image                                                                     414 B         102 kB
├ ○ /en/pavol                                                                               158 B         203 kB
├ ○ /en/pavol/opengraph-image                                                               414 B         102 kB
├ ○ /en/privacy-policy                                                                    2.52 kB         139 kB
├ ○ /en/terms-and-conditions                                                              2.52 kB         139 kB
├ ○ /for-agro                                                                             7.31 kB         268 kB
├ ○ /for-agro/opengraph-image                                                               414 B         102 kB
├ ○ /for-industry                                                                         7.91 kB         269 kB
├ ○ /for-industry/opengraph-image                                                           414 B         102 kB
├ ○ /hackathon-factory                                                                      15 kB         252 kB
├ ○ /hackathon-factory/opengraph-image                                                      414 B         102 kB
├ ƒ /k/[...shortFileUrlParts]                                                               414 B         102 kB
├ ○ /manifest.webmanifest                                                                   414 B         102 kB
├ ○ /old                                                                                  17.8 kB         246 kB
├ ○ /opengraph-image                                                                        414 B         102 kB
├ ƒ /pavol                                                                                  414 B         102 kB
├ ƒ /privacy                                                                                414 B         102 kB
├ ƒ /pro-firmy                                                                              414 B         102 kB
├ ○ /pro-mesta                                                                            6.39 kB         267 kB
├ ○ /pro-mesta/opengraph-image                                                              414 B         102 kB
├ ○ /robots.txt                                                                             414 B         102 kB
├ ○ /shortener                                                                              414 B         102 kB
├ ○ /sitemap.xml                                                                            414 B         102 kB
├ ƒ /skoleni                                                                                414 B         102 kB
├ ƒ /terms                                                                                  414 B         102 kB
└ ○ /test/hopko                                                                           4.62 kB         106 kB
+ First Load JS shared by all                                                              102 kB
  ├ chunks/1684-da5c21b68f3b188c.js                                                       45.8 kB
  ├ chunks/4bd1b696-cf2681237822a0c6.js                                                   53.3 kB
  └ other shared chunks (total)                                                           2.63 kB


ƒ Middleware                                                                                31 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand


> promptbook-landing-page@0.1.0 test-e2e
> playwright test

[WebServer] Database migrations skipped: DATABASE_URL is not configured.

Running 81 tests using 1 worker

  ✓   1 tests/e2e/admin-autosave.spec.ts:52:5 › autosaves edits in order, protects reload while pending, and waits before navigating (8.3s)
  ✓   2 tests/e2e/admin-autosave.spec.ts:92:5 › retains a failed edit and retries it without leaving the settings (4.8s)
  ✓   3 tests/e2e/admin-autosave.spec.ts:109:5 › keeps invalid settings open and saves corrected settings before signing out (3.8s)
  ✓   4 tests/e2e/admin-modals.spec.ts:24:9 › edits and creates contacts in keyboard-accessible dialogs at 1440px (3.6s)
  ✓   5 tests/e2e/admin-modals.spec.ts:24:9 › edits and creates contacts in keyboard-accessible dialogs at 390px (2.4s)
  ✓   6 tests/e2e/admin-modals.spec.ts:77:5 › keeps failed discount creation visible in its dialog and autosaves later edits there (1.2s)
  ✓   7 tests/e2e/cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /cs (2.7s)
  ✓   8 tests/e2e/cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /en (2.1s)
  ✓   9 tests/e2e/cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /cs/ochrana-osobnich-udaju (2.1s)
  ✓  10 tests/e2e/cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /cs/komunita (3.6s)
  ✓  11 tests/e2e/cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /ai-supervize (2.8s)
  ✓  12 tests/e2e/cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /ai-supervize-mini (2.9s)
  ✓  13 tests/e2e/cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /ai-ta-krajta (2.3s)
  ✓  14 tests/e2e/cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /admin/login (1.2s)
  ✓  15 tests/e2e/cookie-consent.spec.ts:64:5 › cookie choices persist and the privacy link reopens settings after client navigation (2.4s)
  ✓  16 tests/e2e/cookie-consent.spec.ts:92:5 › cookie panel and coder badge clear a player opened later, resized and closed (1.5s)
  ✓  17 tests/e2e/cookie-consent.spec.ts:123:5 › a booking notice leaves cookie choices clickable and the footer can be scrolled clear (1.8s)
  ✓  18 tests/e2e/participant-promotion.spec.ts:50:9 › refreshes an author's pending total and submissions after trust on /cs/online-workshop/participant (2.6s)
  ✓  19 tests/e2e/participant-promotion.spec.ts:50:9 › refreshes an author's pending total and submissions after trust on /cs/komunita (3.0s)
  ✓  20 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs (958ms)
  ✓  21 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /en (954ms)
  ✓  22 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /pro-mesta (1.7s)
  ✓  23 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /for-agro (1.5s)
  ✓  24 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /for-industry (1.5s)
  ✓  25 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /ai-supervize (1.2s)
  ✓  26 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /ai-supervize-mini (1.3s)
  ✓  27 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /ai-ta-krajta (1.0s)
  ✓  28 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /ai-ta-krajta/media-kit (1.6s)
  ✓  29 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /ai-ta-krajta/branding (1.4s)
  ✓  30 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /hackathon-factory (1.5s)
  ✓  31 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs/online-workshop (2.1s)
  ✓  32 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs/komunita/clenstvi (2.8s)
  ✓  33 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs/pavol (1.2s)
  ✓  34 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /en/pavol (2.3s)
  ✓  35 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs/ochrana-osobnich-udaju (774ms)
  ✓  36 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /en/privacy-policy (1.4s)
  ✓  37 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs/obchodni-podminky (1.4s)
  ✓  38 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /en/terms-and-conditions (1.3s)
  ✓  39 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /contact (1.5s)
  ✓  40 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /branding (4.7s)
  ✓  41 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /data-deletion (16.1s)
  ✓  42 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /old (3.7s)
  ✓  43 tests/e2e/public-pages.spec.ts:139:5 › AI ta Krajta collaboration section deep-links to its media kit (1.7s)
  ✓  44 tests/e2e/public-pages.spec.ts:150:5 › AI ta Krajta owns its metadata, icon and installable manifest and credits Promptbook coder (6.3s)
  ✓  45 tests/e2e/public-pages.spec.ts:246:5 › AI ta Krajta searches complete transcripts on the server without sending them to the browser (2.0s)
  ✓  46 tests/e2e/public-pages.spec.ts:264:9 › public address redirects to its page: / (12ms)
  ✓  47 tests/e2e/public-pages.spec.ts:264:9 › public address redirects to its page: /pavol (739ms)
  ✓  48 tests/e2e/public-pages.spec.ts:264:9 › public address redirects to its page: /privacy (780ms)
  ✓  49 tests/e2e/public-pages.spec.ts:264:9 › public address redirects to its page: /terms (748ms)
  ✓  50 tests/e2e/public-pages.spec.ts:264:9 › public address redirects to its page: /skoleni (701ms)
  ✓  51 tests/e2e/public-pages.spec.ts:278:5 › /skoleni carries a discount code to the workshop registration (20ms)
  ✓  52 tests/e2e/public-submissions.spec.ts:13:5 › submits the shared footer newsletter form (6.7s)
  ✓  53 tests/e2e/public-submissions.spec.ts:27:5 › submits the reusable get-started lead dialog (14.4s)
  ✓  54 tests/e2e/public-submissions.spec.ts:41:5 › submits the business lead dialog (2.4s)
  ✓  55 tests/e2e/public-submissions.spec.ts:55:5 › submits the homepage qualification lead flow (18.9s)
  ✓  56 tests/e2e/public-submissions.spec.ts:80:5 › submits Pavol’s personal contact form (3.6s)
  -  57 tests/e2e/public-submissions.spec.ts:96:5 › submits a published online-workshop registration
  ✓  58 tests/e2e/public-submissions.spec.ts:116:5 › personalizes and submits the 199 Kč Promptbook paid community membership (23.7s)
  ✓  59 tests/e2e/public-submissions.spec.ts:143:5 › submits an available AI Supervize Mini workshop registration (10.2s)
  ✓  60 tests/e2e/public-submissions.spec.ts:171:5 › submits the AI Supervize Mini future-term interest form (2.2s)
  ✓  61 tests/e2e/public-submissions.spec.ts:196:5 › submits the AI ta Krajta collaboration form (3.1s)
  ✓  62 tests/e2e/public-submissions.spec.ts:211:5 › plays the newest AI ta Krajta episode from the header (1.6s)
  ✓  63 tests/e2e/public-submissions.spec.ts:220:5 › resumes a half-played AI ta Krajta episode where its listener left it (3.4s)
  ✓  64 tests/e2e/public-submissions.spec.ts:254:5 › starts the AI ta Krajta minigame from its snake and keeps it local to the page (1.5s)
  ✓  65 tests/e2e/public-submissions.spec.ts:268:5 › filters the AI ta Krajta archive by a person and keeps its destination in the hash (1.7s)
  -  66 tests/e2e/public-submissions.spec.ts:280:5 › connects a public online-workshop participant
  ✓  67 tests/e2e/recording-studio.spec.ts:78:5 › requires admin authentication for the recording studio (7.6s)
  ✓  68 tests/e2e/recording-studio.spec.ts:83:5 › records separate sources, restores them, trims every track and exports playable editor material (17.3s)
  ✓  69 tests/e2e/recording-studio.spec.ts:164:5 › stops the whole take on disconnect and prevents a second tab from changing it (4.7s)
  ✓  70 tests/e2e/recording-studio.spec.ts:184:5 › recovers persisted chunks after an interrupted page and waits for stop before admin navigation (12.3s)
  ✓  71 tests/e2e/room-theme.spec.ts:96:5 › shares a saved room appearance, follows the device, and preserves the waiting-room form (22.2s)
  ✓  72 tests/e2e/room-theme.spec.ts:141:5 › themes connected rooms, materials, and portalled dialogs on desktop and mobile without losing drafts (17.4s)
  ✓  73 tests/e2e/workshop-agents.spec.ts:34:9 › defines a Book agent in the workshop administration (3.8s)
  ✓  74 tests/e2e/workshop-agents.spec.ts:34:9 › defines a Book agent in the community administration (11.9s)
  ✓  75 tests/e2e/workshop-repository-range.spec.ts:31:5 › edits independent commit bounds in workshop settings (3.0s)
  ✓  76 tests/e2e/workshop-repository-range.spec.ts:67:5 › previews the deployed app while browsing the highlighted workshop range (2.0s)
  ✓  77 tests/e2e/workshop-subtitles.spec.ts:63:5 › imports, autosaves, reloads and downloads private subtitles through the shared admin editor (5.5s)
  ✓  78 tests/e2e/workshop-subtitles.spec.ts:107:5 › decodes a long recording into bounded audio chunks and preserves multilingual timestamps (2.8s)
  ✓  79 tests/e2e/workshop-vercel-deployment.spec.ts:31:9 › deploys a workshop project and saves its ready URL through the existing settings form (7.8s)
  ✓  80 tests/e2e/workshop-vercel-deployment.spec.ts:31:9 › shows Vercel failure details and guidance, then saves the URL after retrying (10.0s)
  ✓  81 tests/e2e/workshop-wrap-up-pdf.spec.ts:34:5 › downloads the branded recap in the browser with local fonts, project preview, Git graph and short-link QR (3.0s)
Saved 76 E2E video(s) to tests/e2e/videos/.
Removed the E2E video(s) of 1 outdated run(s) from tests/e2e/videos/.

  2 skipped
  79 passed (6.0m)

> promptbook-landing-page@0.1.0 delete-test-data
> tsx scripts/delete-test-data.ts

Deleted 9 Contact row(s) and 0 workshop participant row(s) with an @example.com e-mail address.
[1]-  Done                    bash "$1"

=== test shell finished at 2026-09-21T13:50:36.202Z ===
Status: succeeded
````
