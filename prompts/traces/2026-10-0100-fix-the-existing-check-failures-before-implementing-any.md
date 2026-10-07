# Run trace of `prompts/2026-10-0100-fix-the-existing-check-failures-before-implementing-any.md#1`

-   **Prompt:** Fix the existing check failures before implementing any queued coding tasks.
-   **Outcome:** Succeeded
-   **Runner:** Developer on OpenAI Codex `gpt-6-luna` thinking `max` (ChatGPT account)
-   **Attempts:** 1
-   **Steps:** Implementation $2.28 an hour; Checking 37 minutes
-   **Check command:** `npm run check`
-   **Started:** 2026-10-07T09:08:02.436Z
-   **Finished:** 2026-10-07T10:51:17.286Z
-   **Duration:** 2 hours

## Runtime log

````text
=== runner shell started at 2026-10-07T09:08:02.691Z ===
Script path: /c/Users/me/work/promptbook-experiments-and-landing-pages/aldaron/.promptbook/coder-prompts/2026-10-0100-fix-the-existing-check-failures-before-implementing-any.sh

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
    exec --model gpt-6-luna \
    --local-provider none \
    --sandbox danger-full-access \
    -C '/c/Users/me/work/promptbook-experiments-and-landing-pages/aldaron' \
    --skip-git-repo-check \
    <<'CODEX_PROMPT'

## Your Task

Fix the existing check failures before implementing any queued coding tasks.

The check command `npm run check` failed before coding started. Leave the project ready for the remaining coding prompts.

Fix the underlying lint, typechecking, build, generated-code consistency, or test failure without weakening validation.
Do not delete assertions, disable lint rules, remove failing checks from the aggregate, lower quality thresholds,
skip a build, or force exit code zero merely to obtain a pass. Keep the project's chosen check scope intact.
Missing or unconfigured validation requires project-owner setup; never replace it with a meaningless green result.

## Check output

```
Command "bash /c/Users/me/work/promptbook-experiments-and-landing-pages/aldaron/.promptbook/coder-prompts/check-before.sh" exited with code 1.

> promptbook-landing-page@0.1.0 check
> npm run lint && npx kill-port 4009 && npm run test-types && npm run test-e2e && npm run delete-test-data


> promptbook-landing-page@0.1.0 lint
> next lint


./components/public-web-page-preview-image.tsx
33:13  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./components/recording-studio/RecordingDerivedEditor.tsx
95:8  Warning: React Hook useEffect has a missing dependency: 'isAvailableSourceId'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
97:49  Warning: React Hook useEffect has a missing dependency: 'recording'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./components/recording-studio/RecordingSourceMonitor.tsx
59:8  Warning: React Hook useEffect has a missing dependency: 'activePart'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
63:8  Warning: React Hook useEffect has a missing dependency: 'activePart'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./components/recording-studio/RecordingStudioPublish.tsx
57:8  Warning: React Hook useEffect has a missing dependency: 'workshops'. Either include it or remove the dependency array. You can also do a functional update 'setWorkshops(w => ...)' if you only need 'workshops' in the 'setWorkshops' call.  react-hooks/exhaustive-deps

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
Process on port 4009 killed

> promptbook-landing-page@0.1.0 test-types
> npm run build && tsc


> promptbook-landing-page@0.1.0 build
> next build

   ▲ Next.js 15.2.6
   - Environments: .env

   Creating an optimized production build ...
Failed to compile.

./lib/recording-studio/studioAssetS3.ts
Module not found: Can't resolve '@aws-sdk/s3-request-presigner'

https://nextjs.org/docs/messages/module-not-found

Import trace for requested module:
./app/api/admin/studio/assets/[assetId]/route.ts


> Build failed because of webpack errors
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

- Sharing cards use the shared 1200×630 PNG renderer in `lib/metadata`, with local Inter/Outfit fonts, real brand
  marks, page-specific copy and colors, and the canonical public hostname. Public supporting pages, including
  legal pages and podcast kits, have their own image routes. Both Open Graph and X use the same image and alt text.
  Generated image URLs carry a shared design version to refresh cached artwork; authored image URLs are preserved.
  Personal cards use the existing portrait. Room and confirmation cards never include query-string identity.
  Project cards read only anonymously visible approved projects; short-link cards read only the authored public
  landing page without following a destination or recording clicks, and retain explicitly supplied preview images.
  Authored Open Graph copy and images take priority over X metadata and the landing page's ordinary text and images.

- The four configured public domains (`ptbk.io`, `ai-ta-krajta.cz`, `pavolhejny.cz`, and
  `pavolhejny.com`, including `www.` aliases) share one build but serve only their own pages.
  The three branded domains answer unknown, Promptbook-only, foreign-branded, and unknown
  file-looking page paths with their own localized HTML and HTTP 404 at the requested URL.
  Their own robots files and sitemaps list only their pages; Promptbook's sitemap lists only
  Promptbook pages. Shared build output, known public assets and used APIs remain available,
  with admin APIs still authenticated. Only the primary domain redirects the legacy branded
  paths across sites; a same-brand nested path normalizes to that brand's public path.
  Cross-site navigation uses canonical absolute URLs from `createPublicUrl`.
- `/` redirects to `/cs` or `/en` using `Accept-Language`.
- `/cs` is the Czech homepage and source of truth for homepage structure and copy.
- `/en` is its English localization.
- `/cs/whitepaper` and `/en/whitepaper` share a light interactive APT whitepaper in `businesses/whitepaper`.
  Its scroll-linked CSS 3D layers, controlled-cycle simulation, commit/revert example and domain scenarios explain
  the authored principles without running agents or external actions. Reduced motion keeps the model still; the full
  server-rendered chapter reader uses native disclosures and shareable chapter anchors. Czech reads directly from
  `prompts/2026-10-0000-whitepaper.md`; the English translation lives beside the shared page. Both provide Markdown
  downloads, canonical language alternates, their own sharing cards and sitemap entries. Shared full and minimal
  footers link to the localized paper. Described capabilities, planned features and the long-term vision remain distinct.
- `/cs/pro-firmy` is the Czech company-data landing page: company documents, a virtual
  employee answering in plain language, GDPR, and a strategic call. It owns that
  proposition — its composition in `businesses/pro-firmy/_ProFirmyPage.tsx`, every word
  in `businesses/pro-firmy/proFirmyContent.tsx`, and its own metadata, canonical URL,
  sharing card and sitemap entry in `businesses/pro-firmy/proFirmyMetadata.ts`. It is
  published in Czech only and names no language alternate. `/cs` and `/en` render that
  same composition until the homepage is repositioned; repositioning means composing the
  homepage from sections and content of its own, never changing the preserved ones.
  The legacy `/pro-firmy` permanently redirects there. The header's own default copy is
  site chrome and lives beside it in `components/headerContent.ts`, so no landing page
  owns the words every other page wears.
- `/pro-mesta`, `/for-agro`, `/for-industry`, `/ai-supervize`,
  `/hackathon-factory`, and `/pavol` are specialized landing pages. `/pavol`
  redirects to `/cs/pavol` or `/en/pavol`; those legacy Promptbook paths then
  permanently redirect to Pavol Hejny's Czech `https://pavolhejny.cz/` and English
  `https://pavolhejny.com/` personal sites, respectively. Their own domain roots
  rewrite to the existing localized routes.
- Pavol's Czech and English personal sites share the same layout and localized content in `businesses/pavol`.
  Their shared ivory, forest-green and gold design uses the existing portrait and project marks, with a featured
  project, static editorial testimonials and responsive section layouts; visual tokens stay in `layout.ts` and `pavol.css`.
  Their compact header offers canonical language links, a keyboard skip link, and a native mobile navigation menu.
  The introduction, projects, testimonials, and media remain readable without animated reveals; older media
  appearances open through a native disclosure. Service enquiries use the existing `/api/waitlist` contact source,
  prefill only an empty or unchanged template message, preserve custom drafts when the service changes or sending
  fails, and prevent edits or duplicate submissions while a request is pending.
- `/ai-supervize-mini` is the Czech one-day AI Supervize page. Published terms,
  prices, capacities, places, FAQs, registration, and participant information
  come from `/admin/workshops`; with no published term it shows a notice.
  `/skoleni` redirects there.
- `/cs/online-workshop` lists free 60-minute online workshops about writing
  production code with AI agents. Each term has its own subject and description,
  but all use one registration form. `/cs/online-workshop/dekujeme` is the
  full-load conversion page; `/participant` is the live room. Its waiting room
  offers every published term as the same term cards the landing page registers
  with: running and upcoming ones first, with `Dneska` and `Zítra` badges for terms
  beginning today or tomorrow in Prague and `Tento týden` for the remaining terms
  beginning within the next seven rolling days, then the ones which ended
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
  Each link in a readable material starts as a preview card with available page image, title, concise description, and
  destination domain. Its QR control flips that card to the existing persisted QR URL; only one QR face is open in the
  material list. Preview and image requests use an authenticated room endpoint which checks publication, unlock and
  membership access, resolves stored short-link targets read-only, and reuses `publicWebPagePreview.ts` and its bounded
  public-image loader. Neither loading nor flipping a preview follows a tracked redirect or creates a short link.
  Missing metadata and broken images leave Markdown links, open actions and QR codes usable. Presentation and video
  special-material cards use the same rendering while retaining their room-specific access rules.
- `/ai-ta-krajta` permanently redirects from `ptbk.io` to `https://ai-ta-krajta.cz/`,
  whose root rewrites to the existing podcast route; its legacy children likewise
  retain their suffixes on the podcast domain. It reads episodes hourly from podcast RSS and YouTube feeds and
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
  Everyone in the roster has a 320-pixel square transparent PNG in
  `public/people/ai-ta-krajta`, normalized from the show's covers or a published
  personal portrait. `aiTaKrajtaPortraits.md` records the sources and cutout workflow;
  `scripts/_cutAiTaKrajtaPeoplePortraits.mjs` prepares source crops, not final cutouts.
  The shared avatar puts every portrait over a stable, subtly varied neutral gradient.
  Card and episode buttons highlight it on hover and keyboard focus, with a small
  zoom only when reduced motion is not requested. A future person without a photo
  keeps initials on that same background. The one people list is drawn anew
  for every visit, weighted by how many episodes of the archive name each
  person after their roster factor is applied (one by default), so somebody heard
  often comes up high far more often than someone in one díl without the list ever becoming a ranking. The draw is local state and
  is made in the browser; the page itself is built in the order the draw leans
  towards, from the most often named person to the least often named one, so the
  browser hydrates into the list it was sent.
  Collaboration submissions use `/admin/contacts`. The homepage also offers an
  email-only request for AI ta Krajta episode and show updates through
  `/api/waitlist`, with its own contact source and purpose note. The source
  filter and exports retain that source alongside any collaboration history for
  the same email; this collects requests without sending campaigns. The
  subscription section follows the episodes and is linked from the header menu;
  the same email form also appears in the shared podcast footer on the podcast,
  media-kit and branding pages. Privacy
  links point to the canonical Promptbook legal page. The podcast tab icon uses
  the page's own snake drawing in `/ai-ta-krajta/logo.svg` and `.png`; SVG corners are
  rounded and transparent, while the raster fills its square. That drawing is
  traced off the cover artwork of the show and recorded once in
  `businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork.ts`, together with the
  measurements of the animal along its own length. The snake of the minigame
  starts in exactly that shape, in the frame the still logo occupied, and only
  then eases into the proportions, colours and speed of a game snake. Its
  remembered path includes wall and corner contacts, so the shared body geometry
  follows repeated rebounds continuously, including while the pointer stays at or
  beyond a boundary and while the canvas resizes.
  A seven-cell Promptbook coder terminal floats in the bottom-right corner and
  clears the player and cookie controls. It types `$ ptbk`, then animates an
  ASCII octopus in response to pointer, focus, scrolling, and the snake terrarium.
  It stays still for reduced motion and pauses its clock in hidden tabs. The
  badge and the shared footer credit link to `https://coder.ptbk.io/`.
- `/ai-ta-krajta/media-kit` and `/ai-ta-krajta/branding` permanently redirect from
  `ptbk.io` to `/media-kit` and `/branding` on `ai-ta-krajta.cz`. They are the two pages beside
  the podcast, named once in `AI_TA_KRAJTA_SUBPAGES`, which the footer
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
  seven phases: ongoing, freshly past while it ended within the last
  `FRESHLY_PAST_WORKSHOP_HOURS`, upcoming today or tomorrow by Prague calendar date,
  other upcoming within the next seven rolling days,
  other upcoming, and past. Every list, badge, and calendar colour reads that one
  answer, and everything which opens after a workshop — the wrap-up, the feedback,
  the recording — treats freshly past as over. A term with a
  live room links there; a term of an event held elsewhere opens its organizer's
  address in a new tab; otherwise it links to its landing page. The calendar
  opens on the member's month, can filter by day, and uses the same terms and
  statuses as the cards. Empty days cannot be selected; an empty month is only
  selected when the member's month has no terms. The room offers Google Calendar
  and `webcal:` subscriptions, and beside them the plain `https:` address of the
  calendar, shown as selectable text and copied by one click, for an application
  which is subscribed to by hand. A browser which refuses the clipboard says so
  and leaves that address readable. Whether a copy is reported as done is decided
  once, in `hooks/useCopyTextToClipboard.ts`.
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
  Its term picker gives ongoing, freshly past, today, tomorrow, next-seven-day, and later upcoming
  terms their own categories, because a term which has only just been held is
  still being wrapped up and one beginning soon needs preparation; only past terms
  stay behind its history disclosure. Its unobtrusive display-settings control
  keeps every artificial activity tool — prepared chat comments, reaction and
  vote adjustments, and the artificial watching count — out of a shared screen
  by default; `artopts=on` reveals them and `artopts=off` keeps them hidden.
  Its content tab offers the full Markdown material editor and a quick link dialog.
  The latter previews up to twelve public HTTP(S) links through the shared safe
  scraper, then explicitly creates one ordinary material per distinct URL in input
  order. Each generated body is only the trimmed original URL, with its exact spelling,
  query and fragment; the scraped or corrected title stays separate. It uses the full editor's
  publication, unlock and access defaults, appends after the greatest actual
  material order, and retries failures with stable creation IDs. The ordinary
  material creation path still owns short links and live room refresh. Ordinary
  material cards reorder by a dedicated mouse/touch handle or keyboard-accessible
  move controls and autosave through the shared admin queue; the numeric order
  stays in the editor as an advanced manual option. An authorized workshop-scoped
  transaction reindexes only material IDs, preserves content fields, reconciles
  concurrent additions and deletions, and emits one room refresh after commit.
  Virtual special-material placements remain governed separately.
- `/admin/workshops?tab=subtitles` manages private Czech, English and mixed-language video subtitle tracks.
  Tracks store plain text with original-video timestamps, source video/file and provenance independently of room
  responses. Admins can import SRT/WebVTT, try existing YouTube captions (authored before automatic), or generate
  subtitles from an original recording through OpenAI. Browser media decoding sends bounded audio chunks and adds
  their positions once; recording offsets do not alter stored times. Generation produces a reviewable draft, creation
  is explicit, and existing tracks use the shared autosaved editor. Changed source videos are labelled, imports never
  overwrite existing tracks, and no participant endpoint or public database role exposes subtitles.
- `/admin/community` manages the permanent community, including polls, project
  moderation, participants, memberships, payments, and room analytics.
- `/admin/studio` contains addressable `Nahrávání` at `/admin/studio/recording` and `Střižna` at
  `/admin/studio/editor`, with individual recording/project URLs. Legacy recording-studio URLs permanently redirect
  to their recording views; the capture probe and transcription API retain their addresses. One mounted owner,
  browser lock and save/takeover protection span both sections. Section navigation flushes drafts while retaining
  active capture; editing and upload require it to finish. Independent editing does not require capture permissions.
  Completed recordings open stable browser-local projects by references to their existing recording/track/part media,
  never copied blobs or an export/re-import. Linked part trims/cuts/moves and manually aligned external sources share
  the existing transport. Stable assets have separate locations; pinned timing/revisions, scenes and recipe undo never
  rewrite raw recordings, and deleting a referenced recorder source is refused. Schema 5 stores small projects/assets/
  upload manifests and indexes chunk byte offsets; external media is never copied just to import it. Read-only file
  handles recheck permission, session Files require reselection after reload, and changed or missing sources retain
  explicit relink errors. HTTPS sources require progressive CORS/range reads; direct Google Drive is explicitly
  unsupported until authorized large-file ranges and native synchronized seeks are proven. The composite scene track
  draws shared decoders with normalized fullscreen/rectangular/circular presets, hard cuts and one saved audio source;
  monitor audio stays separate and gaps never hold old frames. Metadata and portable recipes map original/project/
  prepared coordinates consistently, retaining unavailable mappings and excluding credentials/serialized permissions.
  Explicit post-capture CDN upload uses bounded direct browser-to-S3 multipart PUTs, short-lived part/read signatures,
  immutable manifests, verified completion/ranged seeking, retry/resume/cancel and fenced uncertain-outcome recovery.
  Only successful verification changes a stable asset's location; local originals remain. Its private asset/reference
  migration and separate cleanup namespace protect project objects and never publish to participants. Local editing
  works without S3/Drive configuration. Design, actual long-container measurements, provider CORS and integration
  limits are in `docs/studio-workshop-editor.md`.
- `/admin/studio/recording` records any number of available cameras, screen shares,
  and optional microphones. A newly configured camera defaults to recording its selected
  system-default or chosen microphone inside the same video file; video-only is an explicit
  choice. The live camera preview is muted, while a track-presence indicator and live level
  meter describe the captured microphone. Standalone microphone and screen sources remain
  available, and an already configured matching microphone is cloned without transferring
  ownership or adding a second audio track to the camera file. Versioned, serializable browser-local source
  preferences retain stable IDs, editable labels, order, enabled state, selected device IDs and screen-surface
  intent; they contain no permission grants or live media and stay within the authenticated page's origin/profile.
  Stop finalizes only the recording session, leaving authorized previews visibly active until the administrator
  releases them or leaves the page. Reload restores source cards without capture; each camera/microphone is
  deliberately reconnected, and each display source opens the browser chooser again. Readiness must be checked
  before Start and follows required microphone mute/unmute events; cancellation or a missing device keeps its source
  configuration and never substitutes another device silently. One capture coordinator starts and stops sources on a
  shared clock; a lost source stops only its own track and leaves the rest of the session in it as a gap, while the
  remaining sources record on. The take ends when no source is left to record or when the shared storage fails, and
  it is saved as interrupted naming every source it lost. A muted required video track is temporarily
  unavailable, blocks Start, and takes its own track out of an active take rather than acting like an intentional pause;
  reselect the source to reconnect. Every failure passes through one channel in `recordingStudioAlerts.ts`, which
  shows it on the source card and the page, plays a synthesized sound and posts a browser notification, because the
  administrator is normally working in the application being recorded rather than watching the studio tab. Both
  channels are on by default and are turned off separately in browser-local settings; a refused, missing or failing
  channel leaves the other announcing. An explicit test button raises one clearly labelled test alert through the
  real channels after a five-second countdown, kept in `recordingStudioAlertTest.ts` as a deadline rather than a
  count of ticks. It shows the remaining time and `Zrušit test`, ignores repeated clicks, and has the click itself
  open the sound output and ask for a missing notification permission, the countdown starting after the answer.
  Leaving the tab neither cancels nor pauses it; unmounting the studio, signing out, leaving its page or the studio
  becoming unavailable cancels it, and it survives a change of studio view. A test has a severity of its own, never
  touches a take, a source or saved media, and never delays a real failure. Beside each alert the studio records how
  far each channel is known to have got — permission, dispatch accepted, reported by the browser, clicked — and calls
  only a clicked notification delivered, because the system's notification settings, a Focus mode or a shared display
  decide what is shown and tell the page nothing. The permission is read again on returning to the tab. The notification of
  a stopped recording waits on the screen while one for a running take passes, which a browser may hand to the system
  as two separately configured applications; a test follows the same rule from what the studio is doing. No service
  worker or push is used. The checks behind this and the manual protocol are in `docs/recording-studio-alerts.md`.
  The display-source picker belongs to the browser/OS: `displaySurface` is a type
  preference, the app does not enumerate system windows, and saved names cannot force a window or restore its stream.
  The macOS Spaces help is shown for manually selected, restored, and reused display configurations. It scopes the
  reported cross-Space behavior to the owner's unspecified Mac/Chrome versions and links to an authenticated plain
  `getDisplayMedia({ video: true, audio: false })` diagnostic at `/admin/recording-studio/capture-probe`. Whole-display
  capture remains an explicit user choice with a privacy warning, never an automatic fallback. Native picker behavior
  and capture continuity across Spaces require physical Mac testing; mocked browser tests do not establish them.
  IndexedDB is the only capture destination and is never offered as a choice: it commits each chunk together with
  its counters, and no folder is selected, reconnected or imported. Recording into a selected directory was retired;
  database schema 4 drops what it left in the browser — the store of folder handles and the descriptions of such
  takes — without touching a folder, a file or a take recorded into the browser. The filesystem is still used by
  exports, save-file pickers and temporary files. An exclusive
  browser lock protects recording, recovery, editing and deletion across tabs. A blocked or deactivated instance
  offers explicit confirmed takeover entirely from that tab, through addressed BroadcastChannel handshakes and the
  same exclusive lock. Responsive owners settle recording transitions/final data, drain persistence, release all
  capture/preview tracks, settle jobs/uploads and flush editor saves before release. Failed saves are reported and
  retained unless explicitly discarded. B reloads authoritative recordings and device intent without starting capture;
  A stays open and deactivated, including on refresh. Bounded waits distinguish refusal/timeout from success. Explicit
  force advances a storage generation before stealing the lock; every authoritative mutation is fenced at commit,
  including recovery, deletion, edits and external finalization/publication. Unresolved file/server commits fail closed
  through that same authority, and logical revocation never promises physical termination of a suspended tab's devices
  or preservation of its uncommitted tail. Studio upload revision/source identifiers survive handover. The cross-tab
  tests, conservative external-commit recovery limits and physical/browser protocol are in
  `docs/recording-studio-takeover.md`. Committed bytes, queued bytes
  and aggregate bitrate are separate from the browser's labelled origin quota estimate. That estimate
  can remain constant at 10 GiB, is never physical disk capacity, and supplies no remaining-time countdown.
  Explicit persistence reports the browser's real result and protects against eviction only. A bounded write queue
  and all-source failure stop preserve committed prefixes and identify missing tails on the shared session clock.
  Saved takes survive reload; unfinished ones expose only
  persisted chunks. Each take retains an immutable snapshot of its intended source configuration. Its editor and list
  can load that snapshot as a new browser-local setup; a changed setup is replaced only after confirmation, matching
  live captures may stay connected, and every other source still needs its ordinary per-source readiness action.
  Screen/window labels are hints only and always go through the browser chooser again. Older takes reconstruct only
  their stored track details and leave unknown camera/microphone identities for the administrator to select.
  Reusing settings never starts recording or changes the old take. Saved recordings open the authenticated
  `/admin/studio/recording/<recordingId>` workspace, sharing the setup/recording shell and its browser lock. Existing
  IDs and original media stay unchanged; a URL identifies local data and missing local media remains explicit.
  One transport, playhead and zoomable timeline map source offsets/segments onto session time, wait for asynchronous
  seeks/buffering and playback starts, correct drift, and hide unavailable frames. Pausing or revealing a hidden
  video settles its decoded frame even if its clock was already correct. The target after settling is 100 ms, not
  hardware synchronization. Video visibility/solo and audio mute/solo are separate monitoring choices; one audio
  source is audible initially and every source remains in export. Shared IN/OUT handles and precise seconds edit
  one non-destructive selection with undo/reset and the existing autosave/error/navigation protection.
  What a usable container seek index is, is decided once in `recordingStudioIndex.ts` from a bounded read of the
  container head and tail, never from media bytes. A browser recorder writes a live container without a seek index or
  a stored duration, so every closed part is checked as it closes, keeps that verdict, and no original leaves the
  studio unseekable: individual downloads and the ZIP's originals are remuxed by forced packet copy with no timestamp
  shift, verified against the part's measured bounds, and the media data itself is never re-encoded or rewritten in
  storage. A rebuild which is impossible or unverified hands over the recorder's own bytes and records the reason in
  the manifest and README. An index which cannot be checked or cannot be rebuilt in this browser is announced through
  the shared alert channel, naming the `ffmpeg -map 0 -c copy` repair; because nothing was lost, such a take stays
  complete and the reason stays on its part rather than in the take's failure message.
  ZIP64 exports stream original chunks and a versioned recipe/manifest with explicit seconds, segment mappings,
  selected interval, prepared zero, missing ranges and per-source processing. Prepared files retain each source's
  audio; video uses its recorded nominal frame rate when known, with resampling recorded in the manifest.
  Files are transcoded and checked within 50 ms of the common boundaries; unsupported or discontinuous sources
  remain clearly labelled originals plus recipe. Trimming uses browser codecs and one temporary local file, never
  an upload or a composed layout. Individual prepared files have JSON sidecars; cancel/retry preserves originals.
  Prepared downloads without a disk picker are detached before temporary-file cleanup and limited to 256 MiB;
  larger prepared files need a disk stream. Individual originals are downloadable when a large ZIP cannot stream
  to disk; export and OPFS temporary-space needs are disclosed. Capture and export reuse admin navigation/sign-out/reload protection. No server or
  database storage is added.
  The same workspace offers a responsive live monitor with grid, focus and pinned-source layouts; hidden or
  minimized previews, preview sound and camera mirror preferences are browser-local presentation settings and never
  alter armed recorder sources or raw files. One global pause closes and commits independently playable parts for
  every source, freezes the shared recorded-content clock, and resumes with a new aligned part set. A source lost
  while paused is not started again on resume. Closed parts use measured encoded bounds for the next shared
  boundary and retain per-part audio and video settings; shorter tails remain timeline gaps. From editing,
  `Donahrát` explicitly restores the latest intended
  source setup and appends a new take at the same project's recorded end after a separate Start; source-set changes
  require explicit confirmation and appear as timeline gaps. Existing raw parts and custom trim boundaries remain;
  an untouched full-session range extends to the new end. Configuration reuse for a new recording remains distinct.
  The finished recording editor can explicitly derive independent subtitle and speech-activity revisions from one
  selected audio-bearing camera, screen or microphone source at a time. Subtitle chunks use the existing authenticated
  OpenAI transcription path with Czech/English/mixed language; Silero VAD runs locally for activity. Generation records
  source, media/timing revision and settings, preserves manual corrections through new revisions, marks old revisions
  stale after media changes, and maps results through parts and takes to the original recorded-content clock.
  Missing audio is unknown, loud unresolved sound is uncertain, and a global pause occupies no session time.
  Separate timeline lanes and editable cues/intervals share transport, autosave and undo. Original and actually
  prepared source exports carry independent SRT/WebVTT and JSON/CSV sidecars; prepared coordinates clip to the shared
  IN/OUT and subtract its start. The browser sends audio externally only after explicit subtitle generation.
  Optional browser-local workshop metadata shares that session clock and saved edit recipe. Reviewed activity ranges
  cover the selected export; speech may suggest boundaries, but silence never classifies automatic coding and
  unclassified time stays at 1×. Independent event markers, reviewed Auto-view scenes and validated video source
  coverage never change original media. Repository/branch association and an actual starting SHA precede reviewed
  time-to-SHA anchors; commit timestamps only propose positions after an explicit session/wall-clock calibration.
  Missing or rebased SHA references report unavailable. Manual edits persist across derived-track regeneration and
  appended takes; source revision changes are visible. Manifest schema 5 lists original and prepared workshop JSON
  sidecars clipped/rebased by the common IN/OUT recipe, retaining original coordinates and provenance. These files
  do not publish media or turn transcripts into participant subtitles.
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

- The description an administrator writes about a term or a permanent room is Markdown on as many lines as it takes,
  and how it reads is decided once, in `components/events/EventDescription.tsx`. A line which was ended stays ended, a
  paragraph stays a paragraph, and an item of a bulleted or numbered list stays on a line of its own behind its bullet
  or its number, wherever the description is read; `readMarkdownTokens` reads those line breaks for the page, the PDF
  and the plain text alike. The door of its room reads the whole passage, with its paragraphs, lists, quotations, code
  and links, which open beside the room; the card a term is chosen with reads the very same lines built from phrasing
  content alone and without destinations, because that card is a single button where block elements and destinations
  are neither valid nor clickable. A numbered item of such a card is told its own number, because a browser would
  otherwise count it together with whatever list the page around the card stands in. The comfortable card reads the
  whole description and begins at its top, however long its neighbours are; the compact card still cuts it off after
  two lines. An authored heading leads its paragraph instead of claiming a level in the page around it, the formatting
  inherits the colours of the surface it is read on, raw HTML only ever contributes its text, an image is read by its
  label, and only an address of a known protocol becomes a link. The wrap-up PDF already reads the same Markdown, and a
  calendar entry, which can show no formatting at all, receives it as the plain text of `convertMarkdownToPlainText`,
  which drops no word, keeps every line and the bullet or number of every list item, and keeps both the label and the
  destination of a link. The administration writes it in a field which takes several lines and says so. A description
  written by a member rather than by an administration — the project a discussion is about — stays the plain text its
  moderation approved.

- Workshop occurrences choose video, presentation, or their connected repository as the primary stage source. Old
  data defaults to video; the choice never changes which sources are stored. The countdown and wrap-up still follow
  `workshopPhase.ts`, and other readable sources remain supplementary special materials with recording access chosen
  by the server. Permanent room kinds which have no stage remain without one.

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
- A live workshop room has a countdown before it starts and, while it runs, the
  event's selected primary stage content: video, presentation, or the connected
  repository. Existing and unset choices mean video. Other configured sources
  stay in the shared special-material list, with recordings still selected by
  the server's member access rule. After the recorded end, the stage returns to
  the wrap-up. Permanent rooms such as the community do not gain a stage. The
  room also has reactions, watching count, moderated chat, timed materials, and
  attached poll aggregates. An open-ended term runs until its recorded end; its
  stage does not end automatically. Admins
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
  shared material card, primary action, preview card and flip-to-show QR code, for every participant without making
  it timed or membership-gated content.
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
  A workshop can instead select a hosted synchronized recording while preserving its inactive YouTube settings.
  Direct admin import and studio publication use the same private multipart object storage and schema 5 validation;
  verified revisions publish atomically, and old revisions remain briefly for connected viewers. Room JSON and every
  hosted manifest/range request apply the same live/free and paid replay rule. Prepared hosted media uses export zero,
  with recorded pause gaps mapped to the chosen live wall clock; the YouTube offset is never applied again. Imported
  subtitle sidecars stay out of the participant player. Cleanup claims inactive revisions before removing objects.
  The hosted participant player uses one prepared-export clock across Auto, Editor, Aplikace and Kamera, with a camera
  overlay in Auto, reviewed activity speed boundaries, event markers and anchored commit selection in the existing
  repository graph. Auto speed advances automatic-coding intervals through decoded steps at up to 10× and waits when
  decoding is slower. Free live playback serves only the completed, at-most-two-second segment at the server-delayed playhead through a
  time-authorized route; direct full-file bytes and other segments are denied. Members may seek the full published
  recording. Complete publication is required before this scheduled live delivery; it is not an ingest stream.
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
  The participant lists in workshop and community administration show three exclusive, complete room counts:
  moderators, trusted non-moderators, and untrusted non-moderators. Their explicit bulk-trust action confirms a
  server-reviewed eligible set and updates that room atomically; a changed set requires a fresh confirmation.
  The separate automatic-trust setting defaults off for every new or duplicated room and is applied only when a new
  participant identity is inserted. Reconnects and later setting changes never rewrite an existing trust decision.
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
  The suite keeps compiled routes, gives its owned server a 10 GiB heap budget unless `NODE_OPTIONS` already specifies
  a heap limit, and starts Next with `--disable-source-maps` to omit Node's additional source-map cache. Browser maps,
  traces and Next's memory safeguards remain. Studio's browser-local
  editors load on demand without server rendering; the shared capture owner remains mounted across their views.
- Recording-studio E2E sources use canvas video and synthesized audio with a silent Web Audio output, independent
  of physical audio-device clocks. Keep recording, storage, codecs, trimming, and ZIP exports real in these tests.
  Recorded A/V markers are checked from decoded sample timestamps rather than speaker-output latency. The preparation
  fixture additionally carries readable/binary timecodes and claps at 25/30 fps with distinct startup offsets.
  Simulated ten-hour mappings and decoder delays do not establish a ten-hour capture soak or physical macOS behavior.

CODEX_PROMPT

--- raw output ---
.env: line 27: app: command not found
ptbk-codex-login-method: chatgpt
Reading prompt from stdin...
OpenAI Codex v0.160.0
--------
workdir: C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
model: gpt-6-luna
provider: openai
approval: never
sandbox: danger-full-access
reasoning effort: max
reasoning summaries: none
session id: 01a1159e-cc9b-7540-90f6-d70e8af32859
--------
user

## Your Task

Fix the existing check failures before implementing any queued coding tasks.

The check command `npm run check` failed before coding started. Leave the project ready for the remaining coding prompts.

Fix the underlying lint, typechecking, build, generated-code consistency, or test failure without weakening validation.
Do not delete assertions, disable lint rules, remove failing checks from the aggregate, lower quality thresholds,
skip a build, or force exit code zero merely to obtain a pass. Keep the project's chosen check scope intact.
Missing or unconfigured validation requires project-owner setup; never replace it with a meaningless green result.

## Check output

```
Command "bash /c/Users/me/work/promptbook-experiments-and-landing-pages/aldaron/.promptbook/coder-prompts/check-before.sh" exited with code 1.

> promptbook-landing-page@0.1.0 check
> npm run lint && npx kill-port 4009 && npm run test-types && npm run test-e2e && npm run delete-test-data


> promptbook-landing-page@0.1.0 lint
> next lint


./components/public-web-page-preview-image.tsx
33:13  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./components/recording-studio/RecordingDerivedEditor.tsx
95:8  Warning: React Hook useEffect has a missing dependency: 'isAvailableSourceId'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
97:49  Warning: React Hook useEffect has a missing dependency: 'recording'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./components/recording-studio/RecordingSourceMonitor.tsx
59:8  Warning: React Hook useEffect has a missing dependency: 'activePart'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
63:8  Warning: React Hook useEffect has a missing dependency: 'activePart'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./components/recording-studio/RecordingStudioPublish.tsx
57:8  Warning: React Hook useEffect has a missing dependency: 'workshops'. Either include it or remove the dependency array. You can also do a functional update 'setWorkshops(w => ...)' if you only need 'workshops' in the 'setWorkshops' call.  react-hooks/exhaustive-deps

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
Process on port 4009 killed

> promptbook-landing-page@0.1.0 test-types
> npm run build && tsc


> promptbook-landing-page@0.1.0 build
> next build

   ▲ Next.js 15.2.6
   - Environments: .env

   Creating an optimized production build ...
Failed to compile.

./lib/recording-studio/studioAssetS3.ts
Module not found: Can't resolve '@aws-sdk/s3-request-presigner'

https://nextjs.org/docs/messages/module-not-found

Import trace for requested module:
./app/api/admin/studio/assets/[assetId]/route.ts


> Build failed because of webpack errors
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

- Sharing cards use the shared 1200×630 PNG renderer in `lib/metadata`, with local Inter/Outfit fonts, real brand
  marks, page-specific copy and colors, and the canonical public hostname. Public supporting pages, including
  legal pages and podcast kits, have their own image routes. Both Open Graph and X use the same image and alt text.
  Generated image URLs carry a shared design version to refresh cached artwork; authored image URLs are preserved.
  Personal cards use the existing portrait. Room and confirmation cards never include query-string identity.
  Project cards read only anonymously visible approved projects; short-link cards read only the authored public
  landing page without following a destination or recording clicks, and retain explicitly supplied preview images.
  Authored Open Graph copy and images take priority over X metadata and the landing page's ordinary text and images.

- The four configured public domains (`ptbk.io`, `ai-ta-krajta.cz`, `pavolhejny.cz`, and
  `pavolhejny.com`, including `www.` aliases) share one build but serve only their own pages.
  The three branded domains answer unknown, Promptbook-only, foreign-branded, and unknown
  file-looking page paths with their own localized HTML and HTTP 404 at the requested URL.
  Their own robots files and sitemaps list only their pages; Promptbook's sitemap lists only
  Promptbook pages. Shared build output, known public assets and used APIs remain available,
  with admin APIs still authenticated. Only the primary domain redirects the legacy branded
  paths across sites; a same-brand nested path normalizes to that brand's public path.
  Cross-site navigation uses canonical absolute URLs from `createPublicUrl`.
- `/` redirects to `/cs` or `/en` using `Accept-Language`.
- `/cs` is the Czech homepage and source of truth for homepage structure and copy.
- `/en` is its English localization.
- `/cs/whitepaper` and `/en/whitepaper` share a light interactive APT whitepaper in `businesses/whitepaper`.
  Its scroll-linked CSS 3D layers, controlled-cycle simulation, commit/revert example and domain scenarios explain
  the authored principles without running agents or external actions. Reduced motion keeps the model still; the full
  server-rendered chapter reader uses native disclosures and shareable chapter anchors. Czech reads directly from
  `prompts/2026-10-0000-whitepaper.md`; the English translation lives beside the shared page. Both provide Markdown
  downloads, canonical language alternates, their own sharing cards and sitemap entries. Shared full and minimal
  footers link to the localized paper. Described capabilities, planned features and the long-term vision remain distinct.
- `/cs/pro-firmy` is the Czech company-data landing page: company documents, a virtual
  employee answering in plain language, GDPR, and a strategic call. It owns that
  proposition — its composition in `businesses/pro-firmy/_ProFirmyPage.tsx`, every word
  in `businesses/pro-firmy/proFirmyContent.tsx`, and its own metadata, canonical URL,
  sharing card and sitemap entry in `businesses/pro-firmy/proFirmyMetadata.ts`. It is
  published in Czech only and names no language alternate. `/cs` and `/en` render that
  same composition until the homepage is repositioned; repositioning means composing the
  homepage from sections and content of its own, never changing the preserved ones.
  The legacy `/pro-firmy` permanently redirects there. The header's own default copy is
  site chrome and lives beside it in `components/headerContent.ts`, so no landing page
  owns the words every other page wears.
- `/pro-mesta`, `/for-agro`, `/for-industry`, `/ai-supervize`,
  `/hackathon-factory`, and `/pavol` are specialized landing pages. `/pavol`
  redirects to `/cs/pavol` or `/en/pavol`; those legacy Promptbook paths then
  permanently redirect to Pavol Hejny's Czech `https://pavolhejny.cz/` and English
  `https://pavolhejny.com/` personal sites, respectively. Their own domain roots
  rewrite to the existing localized routes.
- Pavol's Czech and English personal sites share the same layout and localized content in `businesses/pavol`.
  Their shared ivory, forest-green and gold design uses the existing portrait and project marks, with a featured
  project, static editorial testimonials and responsive section layouts; visual tokens stay in `layout.ts` and `pavol.css`.
  Their compact header offers canonical language links, a keyboard skip link, and a native mobile navigation menu.
  The introduction, projects, testimonials, and media remain readable without animated reveals; older media
  appearances open through a native disclosure. Service enquiries use the existing `/api/waitlist` contact source,
  prefill only an empty or unchanged template message, preserve custom drafts when the service changes or sending
  fails, and prevent edits or duplicate submissions while a request is pending.
- `/ai-supervize-mini` is the Czech one-day AI Supervize page. Published terms,
  prices, capacities, places, FAQs, registration, and participant information
  come from `/admin/workshops`; with no published term it shows a notice.
  `/skoleni` redirects there.
- `/cs/online-workshop` lists free 60-minute online workshops about writing
  production code with AI agents. Each term has its own subject and description,
  but all use one registration form. `/cs/online-workshop/dekujeme` is the
  full-load conversion page; `/participant` is the live room. Its waiting room
  offers every published term as the same term cards the landing page registers
  with: running and upcoming ones first, with `Dneska` and `Zítra` badges for terms
  beginning today or tomorrow in Prague and `Tento týden` for the remaining terms
  beginning within the next seven rolling days, then the ones which ended
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
  Each link in a readable material starts as a preview card with available page image, title, concise description, and
  destination domain. Its QR control flips that card to the existing persisted QR URL; only one QR face is open in the
  material list. Preview and image requests use an authenticated room endpoint which checks publication, unlock and
  membership access, resolves stored short-link targets read-only, and reuses `publicWebPagePreview.ts` and its bounded
  public-image loader. Neither loading nor flipping a preview follows a tracked redirect or creates a short link.
  Missing metadata and broken images leave Markdown links, open actions and QR codes usable. Presentation and video
  special-material cards use the same rendering while retaining their room-specific access rules.
- `/ai-ta-krajta` permanently redirects from `ptbk.io` to `https://ai-ta-krajta.cz/`,
  whose root rewrites to the existing podcast route; its legacy children likewise
  retain their suffixes on the podcast domain. It reads episodes hourly from podcast RSS and YouTube feeds and
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
  Everyone in the roster has a 320-pixel square transparent PNG in
  `public/people/ai-ta-krajta`, normalized from the show's covers or a published
  personal portrait. `aiTaKrajtaPortraits.md` records the sources and cutout workflow;
  `scripts/_cutAiTaKrajtaPeoplePortraits.mjs` prepares source crops, not final cutouts.
  The shared avatar puts every portrait over a stable, subtly varied neutral gradient.
  Card and episode buttons highlight it on hover and keyboard focus, with a small
  zoom only when reduced motion is not requested. A future person without a photo
  keeps initials on that same background. The one people list is drawn anew
  for every visit, weighted by how many episodes of the archive name each
  person after their roster factor is applied (one by default), so somebody heard
  often comes up high far more often than someone in one díl without the list ever becoming a ranking. The draw is local state and
  is made in the browser; the page itself is built in the order the draw leans
  towards, from the most often named person to the least often named one, so the
  browser hydrates into the list it was sent.
  Collaboration submissions use `/admin/contacts`. The homepage also offers an
  email-only request for AI ta Krajta episode and show updates through
  `/api/waitlist`, with its own contact source and purpose note. The source
  filter and exports retain that source alongside any collaboration history for
  the same email; this collects requests without sending campaigns. The
  subscription section follows the episodes and is linked from the header menu;
  the same email form also appears in the shared podcast footer on the podcast,
  media-kit and branding pages. Privacy
  links point to the canonical Promptbook legal page. The podcast tab icon uses
  the page's own snake drawing in `/ai-ta-krajta/logo.svg` and `.png`; SVG corners are
  rounded and transparent, while the raster fills its square. That drawing is
  traced off the cover artwork of the show and recorded once in
  `businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork.ts`, together with the
  measurements of the animal along its own length. The snake of the minigame
  starts in exactly that shape, in the frame the still logo occupied, and only
  then eases into the proportions, colours and speed of a game snake. Its
  remembered path includes wall and corner contacts, so the shared body geometry
  follows repeated rebounds continuously, including while the pointer stays at or
  beyond a boundary and while the canvas resizes.
  A seven-cell Promptbook coder terminal floats in the bottom-right corner and
  clears the player and cookie controls. It types `$ ptbk`, then animates an
  ASCII octopus in response to pointer, focus, scrolling, and the snake terrarium.
  It stays still for reduced motion and pauses its clock in hidden tabs. The
  badge and the shared footer credit link to `https://coder.ptbk.io/`.
- `/ai-ta-krajta/media-kit` and `/ai-ta-krajta/branding` permanently redirect from
  `ptbk.io` to `/media-kit` and `/branding` on `ai-ta-krajta.cz`. They are the two pages beside
  the podcast, named once in `AI_TA_KRAJTA_SUBPAGES`, which the footer
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
  seven phases: ongoing, freshly past while it ended within the last
  `FRESHLY_PAST_WORKSHOP_HOURS`, upcoming today or tomorrow by Prague calendar date,
  other upcoming within the next seven rolling days,
  other upcoming, and past. Every list, badge, and calendar colour reads that one
  answer, and everything which opens after a workshop — the wrap-up, the feedback,
  the recording — treats freshly past as over. A term with a
  live room links there; a term of an event held elsewhere opens its organizer's
  address in a new tab; otherwise it links to its landing page. The calendar
  opens on the member's month, can filter by day, and uses the same terms and
  statuses as the cards. Empty days cannot be selected; an empty month is only
  selected when the member's month has no terms. The room offers Google Calendar
  and `webcal:` subscriptions, and beside them the plain `https:` address of the
  calendar, shown as selectable text and copied by one click, for an application
  which is subscribed to by hand. A browser which refuses the clipboard says so
  and leaves that address readable. Whether a copy is reported as done is decided
  once, in `hooks/useCopyTextToClipboard.ts`.
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
  Its term picker gives ongoing, freshly past, today, tomorrow, next-seven-day, and later upcoming
  terms their own categories, because a term which has only just been held is
  still being wrapped up and one beginning soon needs preparation; only past terms
  stay behind its history disclosure. Its unobtrusive display-settings control
  keeps every artificial activity tool — prepared chat comments, reaction and
  vote adjustments, and the artificial watching count — out of a shared screen
  by default; `artopts=on` reveals them and `artopts=off` keeps them hidden.
  Its content tab offers the full Markdown material editor and a quick link dialog.
  The latter previews up to twelve public HTTP(S) links through the shared safe
  scraper, then explicitly creates one ordinary material per distinct URL in input
  order. Each generated body is only the trimmed original URL, with its exact spelling,
  query and fragment; the scraped or corrected title stays separate. It uses the full editor's
  publication, unlock and access defaults, appends after the greatest actual
  material order, and retries failures with stable creation IDs. The ordinary
  material creation path still owns short links and live room refresh. Ordinary
  material cards reorder by a dedicated mouse/touch handle or keyboard-accessible
  move controls and autosave through the shared admin queue; the numeric order
  stays in the editor as an advanced manual option. An authorized workshop-scoped
  transaction reindexes only material IDs, preserves content fields, reconciles
  concurrent additions and deletions, and emits one room refresh after commit.
  Virtual special-material placements remain governed separately.
- `/admin/workshops?tab=subtitles` manages private Czech, English and mixed-language video subtitle tracks.
  Tracks store plain text with original-video timestamps, source video/file and provenance independently of room
  responses. Admins can import SRT/WebVTT, try existing YouTube captions (authored before automatic), or generate
  subtitles from an original recording through OpenAI. Browser media decoding sends bounded audio chunks and adds
  their positions once; recording offsets do not alter stored times. Generation produces a reviewable draft, creation
  is explicit, and existing tracks use the shared autosaved editor. Changed source videos are labelled, imports never
  overwrite existing tracks, and no participant endpoint or public database role exposes subtitles.
- `/admin/community` manages the permanent community, including polls, project
  moderation, participants, memberships, payments, and room analytics.
- `/admin/studio` contains addressable `Nahrávání` at `/admin/studio/recording` and `Střižna` at
  `/admin/studio/editor`, with individual recording/project URLs. Legacy recording-studio URLs permanently redirect
  to their recording views; the capture probe and transcription API retain their addresses. One mounted owner,
  browser lock and save/takeover protection span both sections. Section navigation flushes drafts while retaining
  active capture; editing and upload require it to finish. Independent editing does not require capture permissions.
  Completed recordings open stable browser-local projects by references to their existing recording/track/part media,
  never copied blobs or an export/re-import. Linked part trims/cuts/moves and manually aligned external sources share
  the existing transport. Stable assets have separate locations; pinned timing/revisions, scenes and recipe undo never
  rewrite raw recordings, and deleting a referenced recorder source is refused. Schema 5 stores small projects/assets/
  upload manifests and indexes chunk byte offsets; external media is never copied just to import it. Read-only file
  handles recheck permission, session Files require reselection after reload, and changed or missing sources retain
  explicit relink errors. HTTPS sources require progressive CORS/range reads; direct Google Drive is explicitly
  unsupported until authorized large-file ranges and native synchronized seeks are proven. The composite scene track
  draws shared decoders with normalized fullscreen/rectangular/circular presets, hard cuts and one saved audio source;
  monitor audio stays separate and gaps never hold old frames. Metadata and portable recipes map original/project/
  prepared coordinates consistently, retaining unavailable mappings and excluding credentials/serialized permissions.
  Explicit post-capture CDN upload uses bounded direct browser-to-S3 multipart PUTs, short-lived part/read signatures,
  immutable manifests, verified completion/ranged seeking, retry/resume/cancel and fenced uncertain-outcome recovery.
  Only successful verification changes a stable asset's location; local originals remain. Its private asset/reference
  migration and separate cleanup namespace protect project objects and never publish to participants. Local editing
  works without S3/Drive configuration. Design, actual long-container measurements, provider CORS and integration
  limits are in `docs/studio-workshop-editor.md`.
- `/admin/studio/recording` records any number of available cameras, screen shares,
  and optional microphones. A newly configured camera defaults to recording its selected
  system-default or chosen microphone inside the same video file; video-only is an explicit
  choice. The live camera preview is muted, while a track-presence indicator and live level
  meter describe the captured microphone. Standalone microphone and screen sources remain
  available, and an already configured matching microphone is cloned without transferring
  ownership or adding a second audio track to the camera file. Versioned, serializable browser-local source
  preferences retain stable IDs, editable labels, order, enabled state, selected device IDs and screen-surface
  intent; they contain no permission grants or live media and stay within the authenticated page's origin/profile.
  Stop finalizes only the recording session, leaving authorized previews visibly active until the administrator
  releases them or leaves the page. Reload restores source cards without capture; each camera/microphone is
  deliberately reconnected, and each display source opens the browser chooser again. Readiness must be checked
  before Start and follows required microphone mute/unmute events; cancellation or a missing device keeps its source
  configuration and never substitutes another device silently. One capture coordinator starts and stops sources on a
  shared clock; a lost source stops only its own track and leaves the rest of the session in it as a gap, while the
  remaining sources record on. The take ends when no source is left to record or when the shared storage fails, and
  it is saved as interrupted naming every source it lost. A muted required video track is temporarily
  unavailable, blocks Start, and takes its own track out of an active take rather than acting like an intentional pause;
  reselect the source to reconnect. Every failure passes through one channel in `recordingStudioAlerts.ts`, which
  shows it on the source card and the page, plays a synthesized sound and posts a browser notification, because the
  administrator is normally working in the application being recorded rather than watching the studio tab. Both
  channels are on by default and are turned off separately in browser-local settings; a refused, missing or failing
  channel leaves the other announcing. An explicit test button raises one clearly labelled test alert through the
  real channels after a five-second countdown, kept in `recordingStudioAlertTest.ts` as a deadline rather than a
  count of ticks. It shows the remaining time and `Zrušit test`, ignores repeated clicks, and has the click itself
  open the sound output and ask for a missing notification permission, the countdown starting after the answer.
  Leaving the tab neither cancels nor pauses it; unmounting the studio, signing out, leaving its page or the studio
  becoming unavailable cancels it, and it survives a change of studio view. A test has a severity of its own, never
  touches a take, a source or saved media, and never delays a real failure. Beside each alert the studio records how
  far each channel is known to have got — permission, dispatch accepted, reported by the browser, clicked — and calls
  only a clicked notification delivered, because the system's notification settings, a Focus mode or a shared display
  decide what is shown and tell the page nothing. The permission is read again on returning to the tab. The notification of
  a stopped recording waits on the screen while one for a running take passes, which a browser may hand to the system
  as two separately configured applications; a test follows the same rule from what the studio is doing. No service
  worker or push is used. The checks behind this and the manual protocol are in `docs/recording-studio-alerts.md`.
  The display-source picker belongs to the browser/OS: `displaySurface` is a type
  preference, the app does not enumerate system windows, and saved names cannot force a window or restore its stream.
  The macOS Spaces help is shown for manually selected, restored, and reused display configurations. It scopes the
  reported cross-Space behavior to the owner's unspecified Mac/Chrome versions and links to an authenticated plain
  `getDisplayMedia({ video: true, audio: false })` diagnostic at `/admin/recording-studio/capture-probe`. Whole-display
  capture remains an explicit user choice with a privacy warning, never an automatic fallback. Native picker behavior
  and capture continuity across Spaces require physical Mac testing; mocked browser tests do not establish them.
  IndexedDB is the only capture destination and is never offered as a choice: it commits each chunk together with
  its counters, and no folder is selected, reconnected or imported. Recording into a selected directory was retired;
  database schema 4 drops what it left in the browser — the store of folder handles and the descriptions of such
  takes — without touching a folder, a file or a take recorded into the browser. The filesystem is still used by
  exports, save-file pickers and temporary files. An exclusive
  browser lock protects recording, recovery, editing and deletion across tabs. A blocked or deactivated instance
  offers explicit confirmed takeover entirely from that tab, through addressed BroadcastChannel handshakes and the
  same exclusive lock. Responsive owners settle recording transitions/final data, drain persistence, release all
  capture/preview tracks, settle jobs/uploads and flush editor saves before release. Failed saves are reported and
  retained unless explicitly discarded. B reloads authoritative recordings and device intent without starting capture;
  A stays open and deactivated, including on refresh. Bounded waits distinguish refusal/timeout from success. Explicit
  force advances a storage generation before stealing the lock; every authoritative mutation is fenced at commit,
  including recovery, deletion, edits and external finalization/publication. Unresolved file/server commits fail closed
  through that same authority, and logical revocation never promises physical termination of a suspended tab's devices
  or preservation of its uncommitted tail. Studio upload revision/source identifiers survive handover. The cross-tab
  tests, conservative external-commit recovery limits and physical/browser protocol are in
  `docs/recording-studio-takeover.md`. Committed bytes, queued bytes
  and aggregate bitrate are separate from the browser's labelled origin quota estimate. That estimate
  can remain constant at 10 GiB, is never physical disk capacity, and supplies no remaining-time countdown.
  Explicit persistence reports the browser's real result and protects against eviction only. A bounded write queue
  and all-source failure stop preserve committed prefixes and identify missing tails on the shared session clock.
  Saved takes survive reload; unfinished ones expose only
  persisted chunks. Each take retains an immutable snapshot of its intended source configuration. Its editor and list
  can load that snapshot as a new browser-local setup; a changed setup is replaced only after confirmation, matching
  live captures may stay connected, and every other source still needs its ordinary per-source readiness action.
  Screen/window labels are hints only and always go through the browser chooser again. Older takes reconstruct only
  their stored track details and leave unknown camera/microphone identities for the administrator to select.
  Reusing settings never starts recording or changes the old take. Saved recordings open the authenticated
  `/admin/studio/recording/<recordingId>` workspace, sharing the setup/recording shell and its browser lock. Existing
  IDs and original media stay unchanged; a URL identifies local data and missing local media remains explicit.
  One transport, playhead and zoomable timeline map source offsets/segments onto session time, wait for asynchronous
  seeks/buffering and playback starts, correct drift, and hide unavailable frames. Pausing or revealing a hidden
  video settles its decoded frame even if its clock was already correct. The target after settling is 100 ms, not
  hardware synchronization. Video visibility/solo and audio mute/solo are separate monitoring choices; one audio
  source is audible initially and every source remains in export. Shared IN/OUT handles and precise seconds edit
  one non-destructive selection with undo/reset and the existing autosave/error/navigation protection.
  What a usable container seek index is, is decided once in `recordingStudioIndex.ts` from a bounded read of the
  container head and tail, never from media bytes. A browser recorder writes a live container without a seek index or
  a stored duration, so every closed part is checked as it closes, keeps that verdict, and no original leaves the
  studio unseekable: individual downloads and the ZIP's originals are remuxed by forced packet copy with no timestamp
  shift, verified against the part's measured bounds, and the media data itself is never re-encoded or rewritten in
  storage. A rebuild which is impossible or unverified hands over the recorder's own bytes and records the reason in
  the manifest and README. An index which cannot be checked or cannot be rebuilt in this browser is announced through
  the shared alert channel, naming the `ffmpeg -map 0 -c copy` repair; because nothing was lost, such a take stays
  complete and the reason stays on its part rather than in the take's failure message.
  ZIP64 exports stream original chunks and a versioned recipe/manifest with explicit seconds, segment mappings,
  selected interval, prepared zero, missing ranges and per-source processing. Prepared files retain each source's
  audio; video uses its recorded nominal frame rate when known, with resampling recorded in the manifest.
  Files are transcoded and checked within 50 ms of the common boundaries; unsupported or discontinuous sources
  remain clearly labelled originals plus recipe. Trimming uses browser codecs and one temporary local file, never
  an upload or a composed layout. Individual prepared files have JSON sidecars; cancel/retry preserves originals.
  Prepared downloads without a disk picker are detached before temporary-file cleanup and limited to 256 MiB;
  larger prepared files need a disk stream. Individual originals are downloadable when a large ZIP cannot stream
  to disk; export and OPFS temporary-space needs are disclosed. Capture and export reuse admin navigation/sign-out/reload protection. No server or
  database storage is added.
  The same workspace offers a responsive live monitor with grid, focus and pinned-source layouts; hidden or
  minimized previews, preview sound and camera mirror preferences are browser-local presentation settings and never
  alter armed recorder sources or raw files. One global pause closes and commits independently playable parts for
  every source, freezes the shared recorded-content clock, and resumes with a new aligned part set. A source lost
  while paused is not started again on resume. Closed parts use measured encoded bounds for the next shared
  boundary and retain per-part audio and video settings; shorter tails remain timeline gaps. From editing,
  `Donahrát` explicitly restores the latest intended
  source setup and appends a new take at the same project's recorded end after a separate Start; source-set changes
  require explicit confirmation and appear as timeline gaps. Existing raw parts and custom trim boundaries remain;
  an untouched full-session range extends to the new end. Configuration reuse for a new recording remains distinct.
  The finished recording editor can explicitly derive independent subtitle and speech-activity revisions from one
  selected audio-bearing camera, screen or microphone source at a time. Subtitle chunks use the existing authenticated
  OpenAI transcription path with Czech/English/mixed language; Silero VAD runs locally for activity. Generation records
  source, media/timing revision and settings, preserves manual corrections through new revisions, marks old revisions
  stale after media changes, and maps results through parts and takes to the original recorded-content clock.
  Missing audio is unknown, loud unresolved sound is uncertain, and a global pause occupies no session time.
  Separate timeline lanes and editable cues/intervals share transport, autosave and undo. Original and actually
  prepared source exports carry independent SRT/WebVTT and JSON/CSV sidecars; prepared coordinates clip to the shared
  IN/OUT and subtract its start. The browser sends audio externally only after explicit subtitle generation.
  Optional browser-local workshop metadata shares that session clock and saved edit recipe. Reviewed activity ranges
  cover the selected export; speech may suggest boundaries, but silence never classifies automatic coding and
  unclassified time stays at 1×. Independent event markers, reviewed Auto-view scenes and validated video source
  coverage never change original media. Repository/branch association and an actual starting SHA precede reviewed
  time-to-SHA anchors; commit timestamps only propose positions after an explicit session/wall-clock calibration.
  Missing or rebased SHA references report unavailable. Manual edits persist across derived-track regeneration and
  appended takes; source revision changes are visible. Manifest schema 5 lists original and prepared workshop JSON
  sidecars clipped/rebased by the common IN/OUT recipe, retaining original coordinates and provenance. These files
  do not publish media or turn transcripts into participant subtitles.
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

- The description an administrator writes about a term or a permanent room is Markdown on as many lines as it takes,
  and how it reads is decided once, in `components/events/EventDescription.tsx`. A line which was ended stays ended, a
  paragraph stays a paragraph, and an item of a bulleted or numbered list stays on a line of its own behind its bullet
  or its number, wherever the description is read; `readMarkdownTokens` reads those line breaks for the page, the PDF
  and the plain text alike. The door of its room reads the whole passage, with its paragraphs, lists, quotations, code
  and links, which open beside the room; the card a term is chosen with reads the very same lines built from phrasing
  content alone and without destinations, because that card is a single button where block elements and destinations
  are neither valid nor clickable. A numbered item of such a card is told its own number, because a browser would
  otherwise count it together with whatever list the page around the card stands in. The comfortable card reads the
  whole description and begins at its top, however long its neighbours are; the compact card still cuts it off after
  two lines. An authored heading leads its paragraph instead of claiming a level in the page around it, the formatting
  inherits the colours of the surface it is read on, raw HTML only ever contributes its text, an image is read by its
  label, and only an address of a known protocol becomes a link. The wrap-up PDF already reads the same Markdown, and a
  calendar entry, which can show no formatting at all, receives it as the plain text of `convertMarkdownToPlainText`,
  which drops no word, keeps every line and the bullet or number of every list item, and keeps both the label and the
  destination of a link. The administration writes it in a field which takes several lines and says so. A description
  written by a member rather than by an administration — the project a discussion is about — stays the plain text its
  moderation approved.

- Workshop occurrences choose video, presentation, or their connected repository as the primary stage source. Old
  data defaults to video; the choice never changes which sources are stored. The countdown and wrap-up still follow
  `workshopPhase.ts`, and other readable sources remain supplementary special materials with recording access chosen
  by the server. Permanent room kinds which have no stage remain without one.

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
- A live workshop room has a countdown before it starts and, while it runs, the
  event's selected primary stage content: video, presentation, or the connected
  repository. Existing and unset choices mean video. Other configured sources
  stay in the shared special-material list, with recordings still selected by
  the server's member access rule. After the recorded end, the stage returns to
  the wrap-up. Permanent rooms such as the community do not gain a stage. The
  room also has reactions, watching count, moderated chat, timed materials, and
  attached poll aggregates. An open-ended term runs until its recorded end; its
  stage does not end automatically. Admins
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
  shared material card, primary action, preview card and flip-to-show QR code, for every participant without making
  it timed or membership-gated content.
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
  A workshop can instead select a hosted synchronized recording while preserving its inactive YouTube settings.
  Direct admin import and studio publication use the same private multipart object storage and schema 5 validation;
  verified revisions publish atomically, and old revisions remain briefly for connected viewers. Room JSON and every
  hosted manifest/range request apply the same live/free and paid replay rule. Prepared hosted media uses export zero,
  with recorded pause gaps mapped to the chosen live wall clock; the YouTube offset is never applied again. Imported
  subtitle sidecars stay out of the participant player. Cleanup claims inactive revisions before removing objects.
  The hosted participant player uses one prepared-export clock across Auto, Editor, Aplikace and Kamera, with a camera
  overlay in Auto, reviewed activity speed boundaries, event markers and anchored commit selection in the existing
  repository graph. Auto speed advances automatic-coding intervals through decoded steps at up to 10× and waits when
  decoding is slower. Free live playback serves only the completed, at-most-two-second segment at the server-delayed playhead through a
  time-authorized route; direct full-file bytes and other segments are denied. Members may seek the full published
  recording. Complete publication is required before this scheduled live delivery; it is not an ingest stream.
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
  The participant lists in workshop and community administration show three exclusive, complete room counts:
  moderators, trusted non-moderators, and untrusted non-moderators. Their explicit bulk-trust action confirms a
  server-reviewed eligible set and updates that room atomically; a changed set requires a fresh confirmation.
  The separate automatic-trust setting defaults off for every new or duplicated room and is applied only when a new
  participant identity is inserted. Reconnects and later setting changes never rewrite an existing trust decision.
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
  The suite keeps compiled routes, gives its owned server a 10 GiB heap budget unless `NODE_OPTIONS` already specifies
  a heap limit, and starts Next with `--disable-source-maps` to omit Node's additional source-map cache. Browser maps,
  traces and Next's memory safeguards remain. Studio's browser-local
  editors load on demand without server rendering; the shared capture owner remains mounted across their views.
- Recording-studio E2E sources use canvas video and synthesized audio with a silent Web Audio output, independent
  of physical audio-device clocks. Keep recording, storage, codecs, trimming, and ZIP exports real in these tests.
  Recorded A/V markers are checked from decoded sample timestamps rather than speaker-output latency. The preparation
  fixture additionally carries readable/binary timecodes and claps at 25/30 fps with distinct startup offsets.
  Simulated ten-hour mappings and decoder delays do not establish a ten-hour capture soak or physical macOS behavior.


codex
I’m tracing how the S3 presigner is used and checking the package manifest and lockfile first. The reported build failure points to an undeclared or missing direct dependency; I’ll confirm the intended fix before changing anything, then update the changelog and run the requested checks.
exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command "Get-Location; rg -n 's3-request-presigner|GetObjectCommand|UploadPartCommand|studioAssetS3' package.json package-lock.json lib app" in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 426ms:

package-lock.json:12:                "@aws-sdk/s3-request-presigner": "3.1134.0",
package-lock.json:572:        "node_modules/@aws-sdk/s3-request-presigner": {
package-lock.json:574:            "resolved": "https://registry.npmjs.org/@aws-sdk/s3-request-presigner/-/s3-request-presigner-3.1134.0.tgz",
package.json:29:        "@aws-sdk/s3-request-presigner": "3.1134.0",
lib\workshops\hostedRecording\hostedRecordingStorage.ts:5:    DeleteObjectsCommand, GetObjectCommand, HeadObjectCommand, ListMultipartUploadsCommand, ListPartsCommand, S3Client,
lib\workshops\hostedRecording\hostedRecordingStorage.ts:6:    UploadPartCommand,
lib\workshops\hostedRecording\hostedRecordingStorage.ts:65:    const result = await client.send(new UploadPartCommand({
lib\workshops\hostedRecording\hostedRecordingStorage.ts:187:    return client.send(new GetObjectCommand({ Bucket: bucket, Key: key, Range: range }));
lib\recording-studio\studioS3.integration.test.ts:30:import { HeadObjectCommand, UploadPartCommand } from '@aws-sdk/client-s3';
lib\recording-studio\studioS3.integration.test.ts:31:import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
lib\recording-studio\studioS3.integration.test.ts:182:                            new UploadPartCommand({
lib\recording-studio\studioAssetS3.ts:2:import { GetObjectCommand, HeadObjectCommand, UploadPartCommand } from '@aws-sdk/client-s3';
lib\recording-studio\studioAssetS3.ts:3:import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
lib\recording-studio\studioAssetS3.ts:27:        new UploadPartCommand({
lib\recording-studio\studioAssetS3.ts:45:        new GetObjectCommand({ Bucket: storage.bucket, Key: asset.object_key }),
lib\recording-studio\studioAssetRoutes.test.ts:28:vi.mock('./studioAssetS3', () => ({
lib\recording-studio\cleanupStudioAssets.ts:11:import { verifyStudioStoredAsset } from './studioAssetS3';
app\api\admin\studio\assets\[assetId]\route.ts:13:import { verifyStudioStoredAsset } from '@/lib/recording-studio/studioAssetS3';
app\api\admin\studio\assets\[assetId]\read\route.ts:2:import { signStudioAssetRead } from '@/lib/recording-studio/studioAssetS3';
app\api\admin\studio\assets\[assetId]\parts\[partNumber]\route.ts:2:import { signStudioUploadPart } from '@/lib/recording-studio/studioAssetS3';
Path
----
C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron


exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command 'Get-Content package.json; Get-Content package-lock.json -TotalCount 30; Get-Content lib/recording-studio/studioAssetS3.ts; npm ls @aws-sdk/s3-request-presigner --depth=0; git status --short; Get-Item node_modules/@aws-sdk/s3-request-presigner -ErrorAction SilentlyContinue | Format-List FullName,Attributes' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 exited 1 in 1905ms:
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
        "check": "npm run lint && npx kill-port 4009 && npm run test-types && npm run test-e2e && npm run delete-test-data",
        "export": "next build",
        "coder:generate-boilerplates": "npx ptbk coder generate-boilerplates --template ./prompts/templates/common.md",
        "coder:run": "npx ptbk coder run --harness claude-code --model claude-opus-5 --thinking-level max --agent agents/developer.book --context AGENTS.md --check npm run check --test-before yes-and-fix  --auto-push --auto-pull",
        "coder:run:openai": "npx ptbk coder run --harness openai-codex --model gpt-5.6-terra --thinking-level max --agent agents/developer.book --context AGENTS.md --check npm run check --test-before yes-and-fix  --auto-push --auto-pull",
        "coder:find-refactor-candidates": "npx ptbk coder find-refactor-candidates",
        "coder:verify": "npx ptbk coder verify --order from-latest --commit --auto-pull --auto-push",
        "coder:add": "npx ptbk coder add --template ./prompts/templates/common.md"
    },
    "dependencies": {
        "@aws-sdk/client-s3": "3.1134.0",
        "@aws-sdk/s3-request-presigner": "3.1134.0",
        "@dnd-kit/core": "^6.3.1",
        "@dnd-kit/sortable": "^10.0.0",
        "@dnd-kit/utilities": "^3.2.2",
        "@hookform/resolvers": "^5.0.1",
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
        "@ricky0123/vad-web": "0.0.31",
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
        "onnxruntime-web": "1.22.0",
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
        "ptbk": "0.114.0-50",
        "raw-loader": "^4.0.2",
        "tailwindcss": "^3.4.17",
        "tailwindcss-animate": "^1.0.7",
        "tsx": "^4.19.4",
        "typescript": "^5",
        "vitest": "^3.1.1"
    }
}
{
    "name": "promptbook-landing-page",
    "version": "0.1.0",
    "lockfileVersion": 3,
    "requires": true,
    "packages": {
        "": {
            "name": "promptbook-landing-page",
            "version": "0.1.0",
            "dependencies": {
                "@aws-sdk/client-s3": "3.1134.0",
                "@aws-sdk/s3-request-presigner": "3.1134.0",
                "@dnd-kit/core": "^6.3.1",
                "@dnd-kit/sortable": "^10.0.0",
                "@dnd-kit/utilities": "^3.2.2",
                "@hookform/resolvers": "^5.0.1",
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
import 'server-only';
import { GetObjectCommand, HeadObjectCommand, UploadPartCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createHash } from 'node:crypto';
import { ALL_FORMATS, CustomSource, EncodedPacketSink, Input } from 'mediabunny';
import {
    getHostedRecordingObject,
    getHostedRecordingStorage,
} from '@/lib/workshops/hostedRecording/hostedRecordingStorage';
import type { StudioMediaAssetRow } from './studioAssetServer';
import { STUDIO_UPLOAD_PART_BYTES } from './studioAssetUploadTypes';

const SIGNATURE_SECONDS = 600;
const MAXIMUM_VERIFICATION_BYTES = 64 * 1024 * 1024;

export async function signStudioUploadPart(asset: StudioMediaAssetRow, partNumber: number) {
    if (!asset.upload_id || partNumber < 1 || partNumber > asset.part_checksums.length || !Number.isInteger(partNumber))
        throw new Error('Invalid upload part.');
    const { client, bucket } = getHostedRecordingStorage();
    const checksum = asset.part_checksums[partNumber - 1];
    const byteLength = Math.min(
        STUDIO_UPLOAD_PART_BYTES,
        asset.byte_length - (partNumber - 1) * STUDIO_UPLOAD_PART_BYTES,
    );
    const url = await getSignedUrl(
        client,
        new UploadPartCommand({
            Bucket: bucket,
            Key: asset.object_key,
            UploadId: asset.upload_id,
            PartNumber: partNumber,
            ContentLength: byteLength,
            ChecksumSHA256: checksum,
        }),
        { expiresIn: SIGNATURE_SECONDS, unhoistableHeaders: new Set(['x-amz-checksum-sha256']) },
    );
    return { url, headers: { 'x-amz-checksum-sha256': checksum }, expiresAt: Date.now() + SIGNATURE_SECONDS * 1000 };
}
export async function signStudioAssetRead(asset: StudioMediaAssetRow) {
    const storage = getHostedRecordingStorage();
    // A separately configured delivery endpoint must address the same PRIVATE bucket and implement SigV4 reads.
    // Never replace a signature's hostname after signing it or save a signed URL as an asset identity.
    const url = await getSignedUrl(
        storage.readClient ?? storage.client,
        new GetObjectCommand({ Bucket: storage.bucket, Key: asset.object_key }),
        { expiresIn: SIGNATURE_SECONDS },
    );
    return { url, expiresAt: Date.now() + SIGNATURE_SECONDS * 1000 };
}

/** Composite SHA-256 is a digest of part digests; a multipart ETag is never treated as a whole-file checksum. */
export function getStudioCompositeChecksum(checksums: readonly string[]): string {
    return `${createHash('sha256')
        .update(Buffer.concat(checksums.map((checksum) => Buffer.from(checksum, 'base64'))))
        .digest('base64')}-${checksums.length}`;
}

export async function verifyStudioStoredAsset(asset: StudioMediaAssetRow): Promise<void> {
    const { client, bucket } = getHostedRecordingStorage();
    const head = await client.send(
        new HeadObjectCommand({ Bucket: bucket, Key: asset.object_key, ChecksumMode: 'ENABLED' }),
    );
    if (
        head.ContentLength !== asset.byte_length ||
        head.Metadata?.['source-fingerprint'] !== asset.source_fingerprint ||
        head.ChecksumSHA256 !== getStudioCompositeChecksum(asset.part_checksums)
    )
        throw new Error('Storage did not verify the expected size, immutable identity and composite SHA-256 checksum.');
    let bytesRead = 0;
    const input = new Input({
        formats: ALL_FORMATS,
        source: new CustomSource({
            getSize: () => asset.byte_length,
            maxCacheSize: STUDIO_UPLOAD_PART_BYTES,
            read: async (start, end) => {
                bytesRead += end - start;
                if (end - start > STUDIO_UPLOAD_PART_BYTES || bytesRead > MAXIMUM_VERIFICATION_BYTES)
                    throw new Error('Stored media inspection exceeded its bounded range budget.');
                const result = await getHostedRecordingObject(asset.object_key, `bytes=${start}-${end - 1}`);
                if (!result.Body || result.ContentLength !== end - start)
                    throw new Error('Stored media range is incomplete.');
                return result.Body.transformToWebStream() as ReadableStream<Uint8Array>;
            },
        }),
    });
    try {
        const tracks = await input.getTracks();
        if (tracks.length !== asset.media_bounds.components.length)
            throw new Error('Stored media tracks differ from the source.');
        for (const track of tracks) {
            const expected = asset.media_bounds.components.find(
                (component) => component.kind === (track.isVideoTrack() ? 'video' : 'audio'),
            );
            const duration = await track.getDurationFromMetadata({});
            const first = Math.max(0, await track.getFirstTimestamp());
            if (
                !expected ||
                duration === null ||
                Math.abs(first - expected.firstTimestampSeconds) > 0.05 ||
                Math.abs(duration - expected.endTimestampSeconds) > 0.05
            )
                throw new Error('Stored media timing differs from the pinned source.');
            const packets = new EncodedPacketSink(track);
            for (const fraction of [0.25, 0.98]) {
                const seconds = first + (duration - first) * fraction;
                const packet = await packets.getPacket(seconds);
                if (!packet || packet.byteLength === 0 || Math.abs(packet.timestamp - seconds) > 2)
                    throw new Error('Stored source cannot seek to its expected media ranges.');
            }
        }
    } finally {
        input.dispose();
    }
}
promptbook-landing-page@0.1.0 C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
└── (empty)

?? prompts/2026-10-0100-fix-the-existing-check-failures-before-implementing-any.md

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command "Get-ChildItem node_modules/@aws-sdk -Name -ErrorAction SilentlyContinue; Select-String -Path package-lock.json -Pattern '\"node_modules/@aws-sdk/s3-request-presigner\"' -Context 0,24; Get-Content CHANGELOG.md -TotalCount 80; rg -n 'npm ci|npm install|Install|Setup|dependencies' README.md" in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 298ms:
checksums
client-s3
core
credential-provider-env
credential-provider-http
credential-provider-ini
credential-provider-login
credential-provider-node
credential-provider-process
credential-provider-sso
credential-provider-web-identity
middleware-sdk-s3
nested-clients
signature-v4-multi-region
token-providers
types
xml-builder

> package-lock.json:572:        "node_modules/@aws-sdk/s3-request-presigner": {
  package-lock.json:573:            "version": "3.1134.0",
  package-lock.json:574:            "resolved": 
"https://registry.npmjs.org/@aws-sdk/s3-request-presigner/-/s3-request-presigner-3.1134.0.tgz",
  package-lock.json:575:            "integrity": 
"sha512-75DC3biOXXmSWqCN2hwJmhMPjDdgc1twjNJEknuWhY9M/E9eFIQufXkwOQx5raNTg6P/FbCgk9tp4y2SZ7vZFA==",
  package-lock.json:576:            "license": "Apache-2.0",
  package-lock.json:577:            "dependencies": {
  package-lock.json:578:                "@aws-sdk/core": "^3.978.0",
  package-lock.json:579:                "@aws-sdk/signature-v4-multi-region": "^3.996.46",
  package-lock.json:580:                "@aws-sdk/types": "^3.974.5",
  package-lock.json:581:                "@smithy/core": "^3.33.3",
  package-lock.json:582:                "@smithy/types": "^4.17.2",
  package-lock.json:583:                "tslib": "^2.6.2"
  package-lock.json:584:            },
  package-lock.json:585:            "engines": {
  package-lock.json:586:                "node": ">=20.0.0"
  package-lock.json:587:            }
  package-lock.json:588:        },
  package-lock.json:589:        "node_modules/@aws-sdk/signature-v4-multi-region": {
  package-lock.json:590:            "version": "3.996.47",
  package-lock.json:591:            "resolved": 
"https://registry.npmjs.org/@aws-sdk/signature-v4-multi-region/-/signature-v4-multi-region-3.996.47.tgz",
  package-lock.json:592:            "integrity": 
"sha512-Zk08macMvQTHzQJCLJVkOlviVoqwYMrpXv4lmLN7b7sAbiMoOK7Go0NYdR5UeF+MW8LIbRmwrNy9u/5VvX1U5g==",
  package-lock.json:593:            "license": "Apache-2.0",
  package-lock.json:594:            "dependencies": {
  package-lock.json:595:                "@aws-sdk/types": "^3.974.6",
  package-lock.json:596:                "@smithy/signature-v4": "^5.7.3",
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
269:Install the locked dependency set and start the development server:
272:npm ci


codex
The code import, `package.json`, and `package-lock.json` all already agree on `@aws-sdk/s3-request-presigner@3.1134.0`; the installed `node_modules` tree is the inconsistent piece (the package itself is absent). I’ll restore the lockfile-defined install, then rerun the full check command. The lint output contains warnings only, so I’m leaving those checks and rules intact.
exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command 'node --version; npm ci' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 exited 1 in 27990ms:
v22.23.2
npm error code EUSAGE
npm error
npm error `npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync. Please update your lock file with `npm install` before continuing.
npm error
npm error Invalid: lock file's ptbk@0.114.0-49 does not satisfy ptbk@0.114.0-50
npm error Invalid: lock file's @promptbook/core@0.114.0-49 does not satisfy @promptbook/core@0.114.0-50
npm error Invalid: lock file's promptbook@0.114.0-49 does not satisfy promptbook@0.114.0-50
npm error Invalid: lock file's @promptbook/anthropic-claude@0.114.0-49 does not satisfy @promptbook/anthropic-claude@0.114.0-50
npm error Invalid: lock file's @promptbook/azure-openai@0.114.0-49 does not satisfy @promptbook/azure-openai@0.114.0-50
npm error Invalid: lock file's @promptbook/browser@0.114.0-49 does not satisfy @promptbook/browser@0.114.0-50
npm error Invalid: lock file's @promptbook/cli@0.114.0-49 does not satisfy @promptbook/cli@0.114.0-50
npm error Invalid: lock file's @promptbook/color@0.114.0-49 does not satisfy @promptbook/color@0.114.0-50
npm error Invalid: lock file's @promptbook/components@0.114.0-49 does not satisfy @promptbook/components@0.114.0-50
npm error Invalid: lock file's @promptbook/deepseek@0.114.0-49 does not satisfy @promptbook/deepseek@0.114.0-50
npm error Invalid: lock file's @promptbook/documents@0.114.0-49 does not satisfy @promptbook/documents@0.114.0-50
npm error Invalid: lock file's @promptbook/editable@0.114.0-49 does not satisfy @promptbook/editable@0.114.0-50
npm error Invalid: lock file's @promptbook/fake-llm@0.114.0-49 does not satisfy @promptbook/fake-llm@0.114.0-50
npm error Invalid: lock file's @promptbook/google@0.114.0-49 does not satisfy @promptbook/google@0.114.0-50
npm error Invalid: lock file's @promptbook/javascript@0.114.0-49 does not satisfy @promptbook/javascript@0.114.0-50
npm error Invalid: lock file's @promptbook/legacy-documents@0.114.0-49 does not satisfy @promptbook/legacy-documents@0.114.0-50
npm error Invalid: lock file's @promptbook/markdown-utils@0.114.0-49 does not satisfy @promptbook/markdown-utils@0.114.0-50
npm error Invalid: lock file's @promptbook/markitdown@0.114.0-49 does not satisfy @promptbook/markitdown@0.114.0-50
npm error Invalid: lock file's @promptbook/node@0.114.0-49 does not satisfy @promptbook/node@0.114.0-50
npm error Invalid: lock file's @promptbook/ollama@0.114.0-49 does not satisfy @promptbook/ollama@0.114.0-50
npm error Invalid: lock file's @promptbook/openai@0.114.0-49 does not satisfy @promptbook/openai@0.114.0-50
npm error Invalid: lock file's @promptbook/pdf@0.114.0-49 does not satisfy @promptbook/pdf@0.114.0-50
npm error Invalid: lock file's @promptbook/remote-client@0.114.0-49 does not satisfy @promptbook/remote-client@0.114.0-50
npm error Invalid: lock file's @promptbook/remote-server@0.114.0-49 does not satisfy @promptbook/remote-server@0.114.0-50
npm error Invalid: lock file's @promptbook/templates@0.114.0-49 does not satisfy @promptbook/templates@0.114.0-50
npm error Invalid: lock file's @promptbook/types@0.114.0-49 does not satisfy @promptbook/types@0.114.0-50
npm error Invalid: lock file's @promptbook/utils@0.114.0-49 does not satisfy @promptbook/utils@0.114.0-50
npm error Invalid: lock file's @promptbook/vercel@0.114.0-49 does not satisfy @promptbook/vercel@0.114.0-50
npm error Invalid: lock file's @promptbook/website-crawler@0.114.0-49 does not satisfy @promptbook/website-crawler@0.114.0-50
npm error Invalid: lock file's @promptbook/wizard@0.114.0-49 does not satisfy @promptbook/wizard@0.114.0-50
npm error Invalid: lock file's @sentry/nextjs@10.76.0 does not satisfy @sentry/nextjs@10.76.1
npm error Invalid: lock file's express-rate-limit@8.7.0 does not satisfy express-rate-limit@8.7.1
npm error Invalid: lock file's xml-crypto@6.3.2 does not satisfy xml-crypto@6.3.3
npm error Invalid: lock file's @sentry/browser-utils@10.76.0 does not satisfy @sentry/browser-utils@10.76.1
npm error Invalid: lock file's @sentry/core@10.76.0 does not satisfy @sentry/core@10.76.1
npm error Invalid: lock file's @sentry/node@10.76.0 does not satisfy @sentry/node@10.76.1
npm error Invalid: lock file's @sentry/opentelemetry@10.76.0 does not satisfy @sentry/opentelemetry@10.76.1
npm error Invalid: lock file's @opentelemetry/core@2.11.0 does not satisfy @opentelemetry/core@2.12.0
npm error Invalid: lock file's @opentelemetry/sdk-trace-base@2.11.0 does not satisfy @opentelemetry/sdk-trace-base@2.12.0
npm error Invalid: lock file's @sentry/react@10.76.0 does not satisfy @sentry/react@10.76.1
npm error Invalid: lock file's @sentry/server-utils@10.76.0 does not satisfy @sentry/server-utils@10.76.1
npm error Invalid: lock file's @sentry/vercel-edge@10.76.0 does not satisfy @sentry/vercel-edge@10.76.1
npm error Invalid: lock file's @sentry/webpack-plugin@5.4.0 does not satisfy @sentry/webpack-plugin@5.4.1
npm error Invalid: lock file's @opentelemetry/resources@2.11.0 does not satisfy @opentelemetry/resources@2.12.0
npm error Invalid: lock file's @opentelemetry/sdk-trace@2.11.0 does not satisfy @opentelemetry/sdk-trace@2.12.0
npm error Invalid: lock file's @sentry/node-core@10.76.0 does not satisfy @sentry/node-core@10.76.1
npm error Invalid: lock file's @sentry/browser@10.76.0 does not satisfy @sentry/browser@10.76.1
npm error Invalid: lock file's @sentry/feedback@10.76.0 does not satisfy @sentry/feedback@10.76.1
npm error Invalid: lock file's @sentry/replay@10.76.0 does not satisfy @sentry/replay@10.76.1
npm error Invalid: lock file's @sentry/replay-canvas@10.76.0 does not satisfy @sentry/replay-canvas@10.76.1
npm error Invalid: lock file's @sentry/bundler-plugins@10.76.0 does not satisfy @sentry/bundler-plugins@10.76.1
npm error Invalid: lock file's cjs-module-lexer@2.2.1 does not satisfy cjs-module-lexer@2.3.0
npm error Invalid: lock file's es-module-lexer@3.0.2 does not satisfy es-module-lexer@3.0.3
npm error Invalid: lock file's ai@6.0.300 does not satisfy ai@6.0.301
npm error Invalid: lock file's @ai-sdk/gateway@3.0.209 does not satisfy @ai-sdk/gateway@3.0.210
npm error Invalid: lock file's node-abi@3.96.0 does not satisfy node-abi@3.97.0
npm error
npm error Clean install a project
npm error
npm error Usage:
npm error npm ci
npm error
npm error Options:
npm error [--install-strategy <hoisted|nested|shallow|linked>] [--legacy-bundling]
npm error [--global-style] [--omit <dev|optional|peer> [--omit <dev|optional|peer> ...]]
npm error [--include <prod|dev|optional|peer> [--include <prod|dev|optional|peer> ...]]
npm error [--strict-peer-deps] [--foreground-scripts] [--ignore-scripts] [--no-audit]
npm error [--no-bin-links] [--no-fund] [--dry-run]
npm error [-w|--workspace <workspace-name> [-w|--workspace <workspace-name> ...]]
npm error [-ws|--workspaces] [--include-workspace-root] [--install-links]
npm error
npm error aliases: clean-install, ic, install-clean, isntall-clean
npm error
npm error Run "npm help ci" for more info
npm error A complete log of this run can be found in: C:\Users\me\AppData\Local\npm-cache\_logs\2026-10-07T09_08_48_865Z-debug-0.log

codex
The clean install exposed a second root cause: `npm ci` refuses this checkout because many locked versions no longer satisfy the versions in `package.json` (including `ptbk` 0.114.0-50 versus locked 0.114.0-49). I’m bringing the lockfile back into sync with the manifest so a fresh workspace can reproduce the build, then I’ll install from that lockfile and rerun validation.
exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command 'npm install --package-lock-only --ignore-scripts' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
codex
The lockfile-only resolution is taking longer than a local install usually does, likely because it is resolving the broad semver ranges in the manifest. It is still running; once it finishes I’ll inspect the lockfile diff before installing anything.
 succeeded in 77841ms:

up to date, audited 1634 packages in 1m

313 packages are looking for funding
  run `npm fund` for details

86 vulnerabilities (2 low, 42 moderate, 39 high, 3 critical)

To address issues that do not require attention, run:
  npm audit fix

To address all issues possible (including breaking changes), run:
  npm audit fix --force

Some issues need review, and may require choosing
a different dependency.

Run `npm audit` for details.

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command 'git status --short; git diff --stat -- package-lock.json; git diff -- package-lock.json | Select-Object -First 120; npm ls @aws-sdk/s3-request-presigner --package-lock-only --depth=0' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 1820ms:
 M package-lock.json
?? prompts/2026-10-0100-fix-the-existing-check-failures-before-implementing-any.md
 package-lock.json | 549 ++++++++++++++++++++++++++++++++++++++++++++++++----------------------------------------------------
 1 file changed, 261 insertions(+), 288 deletions(-)
diff --git a/package-lock.json b/package-lock.json
index d51ca46f..fea46948 100644
--- a/package-lock.json
+++ b/package-lock.json
@@ -103,7 +103,7 @@
                 "fake-indexeddb": "^6.2.5",
                 "jsdom": "^26.0.0",
                 "postcss": "^8.5.3",
-                "ptbk": "0.114.0-49",
+                "ptbk": "0.114.0-50",
                 "raw-loader": "^4.0.2",
                 "tailwindcss": "^3.4.17",
                 "tailwindcss-animate": "^1.0.7",
@@ -135,9 +135,9 @@
             }
         },
         "node_modules/@ai-sdk/gateway": {
-            "version": "3.0.209",
-            "resolved": "https://registry.npmjs.org/@ai-sdk/gateway/-/gateway-3.0.209.tgz",
-            "integrity": "sha512-CjCBzC35lRZ0LnUYLDfTB92p0Fr1Fu9Wrivc+LI0u3ox/DyZ0wPOHjt8DKBKHD/R4aZ86+JCFFuD9f8MFjAQFg==",
+            "version": "3.0.210",
+            "resolved": "https://registry.npmjs.org/@ai-sdk/gateway/-/gateway-3.0.210.tgz",
+            "integrity": "sha512-XUC2HGvDLhpfHKT7yXirZELHWIHzPJLtE3CE3FO6fjcQHcKR5nrsHxOp00THk1SivDo3IZB1yS6Un4+kAQ8eJg==",
             "dev": true,
             "license": "Apache-2.0",
             "dependencies": {
@@ -3077,9 +3077,6 @@
                 "arm64"
             ],
             "dev": true,
-            "libc": [
-                "glibc"
-            ],
             "license": "MIT",
             "optional": true,
             "os": [
@@ -3097,9 +3094,6 @@
                 "arm64"
             ],
             "dev": true,
-            "libc": [
-                "musl"
-            ],
             "license": "MIT",
             "optional": true,
             "os": [
@@ -3117,9 +3111,6 @@
                 "riscv64"
             ],
             "dev": true,
-            "libc": [
-                "glibc"
-            ],
             "license": "MIT",
             "optional": true,
             "os": [
@@ -3137,9 +3128,6 @@
                 "x64"
             ],
             "dev": true,
-            "libc": [
-                "glibc"
-            ],
             "license": "MIT",
             "optional": true,
             "os": [
@@ -3157,9 +3145,6 @@
                 "x64"
             ],
             "dev": true,
-            "libc": [
-                "musl"
-            ],
             "license": "MIT",
             "optional": true,
             "os": [
@@ -3461,9 +3446,9 @@
             }
         },
         "node_modules/@opentelemetry/core": {
-            "version": "2.11.0",
-            "resolved": "https://registry.npmjs.org/@opentelemetry/core/-/core-2.11.0.tgz",
-            "integrity": "sha512-7YP44XH0tV6+Mb54x2YGf84i7yi+31MBZlE8JwvozkxyTvXbSp10X7cI7YE49ChJ3shMJoBmCJF3+1QFBJctGA==",
+            "version": "2.12.0",
+            "resolved": "https://registry.npmjs.org/@opentelemetry/core/-/core-2.12.0.tgz",
+            "integrity": "sha512-1HsSAuvT4/my0QrXWsyXFdWjKaPeCHsismKZgEEIb8NK13LP6DrMRlsUbvD/0F9mDWK3xDom9AMv3IscxgOnOQ==",
             "dev": true,
             "license": "Apache-2.0",
             "dependencies": {
@@ -3495,13 +3480,13 @@
             }
         },
         "node_modules/@opentelemetry/resources": {
-            "version": "2.11.0",
-            "resolved": "https://registry.npmjs.org/@opentelemetry/resources/-/resources-2.11.0.tgz",
-            "integrity": "sha512-Ie7+8q8MDF4FAEQCKVMTx3ReUvxiIAgIiiW3c9JdmP8+HMcDy20puT+AHjexnExgnbvBxjQ9fjkFDWrikJ2jQA==",
+            "version": "2.12.0",
+            "resolved": "https://registry.npmjs.org/@opentelemetry/resources/-/resources-2.12.0.tgz",
+            "integrity": "sha512-+rSRoOdln6NhXTVcBdHSlZxJDNzwxadeweK2ltZO3tVtfp6aklABc06xclDk6ovRR+EiGgIcSbh/6NgjFhnb3A==",
             "dev": true,
             "license": "Apache-2.0",
             "dependencies": {
-                "@opentelemetry/core": "2.11.0",
+                "@opentelemetry/core": "2.12.0",
                 "@opentelemetry/semantic-conventions": "^1.29.0"
             },
             "engines": {
@@ -3512,14 +3497,14 @@
             }
         },
         "node_modules/@opentelemetry/sdk-trace": {
-            "version": "2.11.0",
-            "resolved": "https://registry.npmjs.org/@opentelemetry/sdk-trace/-/sdk-trace-2.11.0.tgz",
-            "integrity": "sha512-fFnTqGm8/G73GQVnxYi7LXa1ZVYEUvgL6XI1LpvV0bPC7WQ/ZGgKxCSl8FnlZBKto9JHHEFTO6s6CUpvvtwFrA==",
+            "version": "2.12.0",
+            "resolved": "https://registry.npmjs.org/@opentelemetry/sdk-trace/-/sdk-trace-2.12.0.tgz",
+            "integrity": "sha512-ImVuRQ6faOsTi1Wna88s2avgrrf/iDgXPigIeynkUhjstMuoQUDOJXgkez2j1mlU4btjXcXBGa+q7qKFYR3GsA==",
             "dev": true,
             "license": "Apache-2.0",
             "dependencies": {
promptbook-landing-page@0.1.0 C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
└── @aws-sdk/s3-request-presigner@3.1134.0


exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command 'npm ci' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 exited 1 in 19505ms:
npm error code EPERM
npm error syscall unlink
npm error path C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron\node_modules\@napi-rs\canvas-win32-x64-msvc\skia.win32-x64-msvc.node
npm error errno -4048
npm error [Error: EPERM: operation not permitted, unlink 'C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron\node_modules\@napi-rs\canvas-win32-x64-msvc\skia.win32-x64-msvc.node'] {
npm error   errno: -4048,
npm error   code: 'EPERM',
npm error   syscall: 'unlink',
npm error   path: 'C:\\Users\\me\\work\\promptbook-experiments-and-landing-pages\\aldaron\\node_modules\\@napi-rs\\canvas-win32-x64-msvc\\skia.win32-x64-msvc.node'
npm error }
npm error
npm error The operation was rejected by your operating system.
npm error It's possible that the file was already in use (by a text editor or antivirus),
npm error or that you lack permissions to access it.
npm error
npm error If you believe this might be a permissions issue, please double-check the
npm error permissions of the file and its containing directories, or try running
npm error the command again as root/Administrator.
npm error A complete log of this run can be found in: C:\Users\me\AppData\Local\npm-cache\_logs\2026-10-07T09_10_57_950Z-debug-0.log

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command "Get-CimInstance Win32_Process -Filter \"name='node.exe'\" | Select-Object ProcessId,CommandLine | Format-List; Get-Item node_modules/@napi-rs/canvas-win32-x64-msvc/skia.win32-x64-msvc.node -ErrorAction SilentlyContinue | Format-List FullName,Length,Attributes; npm ls @aws-sdk/s3-request-presigner --depth=0" in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 exited 1 in 2010ms:

ProcessId   : 28236
CommandLine : C:\Users\me\.nvm\versions\node\v22.23.2\bin\node.exe writer.cjs

ProcessId   : 13552
CommandLine : C:\Users\me\.nvm\versions\node\v22.23.2\bin\node.exe 
              C:\Users\me\.nvm\versions\node\v22.23.2\bin/node_modules/@openai/codex/bin/codex.js

ProcessId   : 4360
CommandLine : C:\Users\me\.nvm\versions\node\v22.23.2\bin\node.exe writer.cjs

ProcessId   : 21876
CommandLine : C:\Users\me\.nvm\versions\node\v22.23.2\bin\node.exe writer.cjs

ProcessId   : 28992
CommandLine : C:\Users\me\.nvm\versions\node\v22.23.2\bin\node.exe 
              C:\Users\me\.nvm\versions\node\v22.23.2\bin/node_modules/npm/bin/npx-cli.js ts-node 
              ./src/cli/test/ptbk.ts coder run --harness openai-codex --model gpt-6.1-sol --thinking-level max --agent 
              agents/coding/developer.book --context AGENTS.md --check "npm run check" --check-before no --no-questions

ProcessId   : 25608
CommandLine : "node"   "C:\Users\me\work\ai\promptbook\node_modules\.bin\\..\ts-node\dist\bin.js" 
              ./src/cli/test/ptbk.ts coder run --harness openai-codex --model gpt-6.1-sol --thinking-level max --agent 
              agents/coding/developer.book --context AGENTS.md --check "npm run check" --check-before no --no-questions

ProcessId   : 24148
CommandLine : C:\Users\me\.nvm\versions\node\v22.23.2\bin\node.exe 
              C:\Users\me\.nvm\versions\node\v22.23.2\bin/node_modules/@openai/codex/bin/codex.js -c 
              forced_login_method=chatgpt -c model_reasoning_effort=max --ask-for-approval never exec --model 
              gpt-6.1-sol --local-provider none --sandbox danger-full-access -C C:/Users/me/work/ai/promptbook 
              --skip-git-repo-check

ProcessId   : 300
CommandLine : C:\Users\me\.nvm\versions\node\v22.23.2\bin\node.exe 
              C:\Users\me\.nvm\versions\node\v22.23.2\bin/node_modules/npm/bin/npx-cli.js ptbk coder run 
              --no-questions --harness openai-codex --model gpt-6-luna --thinking-level max --agent 
              agents/developer.book --context AGENTS.md --check npm run check --check-before yes-and-fix

ProcessId   : 25800
CommandLine : "node"   "C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron\node_modules\.bin\\..\@prompt
              book\cli\bin\promptbook-cli.js" coder run --no-questions --harness openai-codex --model gpt-6-luna 
              --thinking-level max --agent agents/developer.book --context AGENTS.md --check npm run check 
              --check-before yes-and-fix

ProcessId   : 27640
CommandLine : C:\Users\me\.nvm\versions\node\v22.23.2\bin\node.exe 
              C:\Users\me\.nvm\versions\node\v22.23.2\bin/node_modules/@openai/codex/bin/codex.js -c 
              forced_login_method=chatgpt -c model_reasoning_effort=max --ask-for-approval never exec --model 
              gpt-6-luna --local-provider none --sandbox danger-full-access -C 
              C:/Users/me/work/promptbook-experiments-and-landing-pages/aldaron --skip-git-repo-check


FullName   : C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron\node_modules\@napi-rs\canvas-win32-x64-m
             svc\skia.win32-x64-msvc.node
Length     : 26272256
Attributes : Archive

promptbook-landing-page@0.1.0 C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
└── (empty)


apply patch
patch: completed
C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron\CHANGELOG.md
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command 'npm ls next @aws-sdk/client-s3 @aws-sdk/s3-request-presigner ptbk --depth=0; Get-Item node_modules/next/package.json,node_modules/@aws-sdk/client-s3/package.json,node_modules/ptbk/package.json -ErrorAction SilentlyContinue | ForEach-Object { $pkg = Get-Content $_.FullName | ConvertFrom-Json; [PSCustomObject]@{Path=$_.FullName;Version=$pkg.version} }' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 exited 1 in 1492ms:
promptbook-landing-page@0.1.0 C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
├── @aws-sdk/client-s3@ invalid: "3.1134.0" from the root project
└── next@ invalid: "15.2.6" from the root project

npm error code ELSPROBLEMS
npm error invalid: @aws-sdk/client-s3@ C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron\node_modules\@aws-sdk\client-s3
npm error invalid: next@ C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron\node_modules\next
npm error A complete log of this run can be found in: C:\Users\me\AppData\Local\npm-cache\_logs\2026-10-07T09_12_02_876Z-debug-0.log

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
`npm ci` now recognizes the corrected lockfile but could not finish replacing `node_modules`: Windows refused to unlink a native canvas file held open by another running Node process. The clean-install attempt has left the local dependency tree incomplete. I’m checking whether a non-clean install can restore the declared packages without disturbing that open native file, then I’ll run the check against a complete dependency tree.
exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command 'npm install --no-audit --no-fund' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
The non-clean install is progressing and has passed the blocked cleanup step so far; it is rebuilding the broader dependency tree, which takes about a minute here. I’ll confirm the S3 presigner and build once it completes.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
The install has been quiet for over a minute after its package downloads. I’m checking whether npm is still making progress before deciding whether to switch to a separate clean dependency directory; I’m not stopping or terminating the other Node process that owns the locked file.
exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command "Get-CimInstance Win32_Process -Filter \"name='node.exe'\" | Where-Object { "'$_.CommandLine -match '"'npm|install' } | Select-Object ProcessId,CommandLine | Format-List; Get-Item node_modules/next/package.json,node_modules/@aws-sdk/s3-request-presigner/package.json -ErrorAction SilentlyContinue | ForEach-Object { "'$pkg = Get-Content $_.FullName | ConvertFrom-Json; [PSCustomObject]@{Path=$_.FullName;Version=$pkg.version} }' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 exited 1 in 4219ms:

ProcessId   : 28992
CommandLine : C:\Users\me\.nvm\versions\node\v22.23.2\bin\node.exe 
              C:\Users\me\.nvm\versions\node\v22.23.2\bin/node_modules/npm/bin/npx-cli.js ts-node 
              ./src/cli/test/ptbk.ts coder run --harness openai-codex --model gpt-6.1-sol --thinking-level max --agent 
              agents/coding/developer.book --context AGENTS.md --check "npm run check" --check-before no --no-questions

ProcessId   : 25608
CommandLine : "node"   "C:\Users\me\work\ai\promptbook\node_modules\.bin\\..\ts-node\dist\bin.js" 
              ./src/cli/test/ptbk.ts coder run --harness openai-codex --model gpt-6.1-sol --thinking-level max --agent 
              agents/coding/developer.book --context AGENTS.md --check "npm run check" --check-before no --no-questions

ProcessId   : 300
CommandLine : C:\Users\me\.nvm\versions\node\v22.23.2\bin\node.exe 
              C:\Users\me\.nvm\versions\node\v22.23.2\bin/node_modules/npm/bin/npx-cli.js ptbk coder run 
              --no-questions --harness openai-codex --model gpt-6-luna --thinking-level max --agent 
              agents/developer.book --context AGENTS.md --check npm run check --check-before yes-and-fix

ProcessId   : 25800
CommandLine : "node"   "C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron\node_modules\.bin\\..\@prompt
              book\cli\bin\promptbook-cli.js" coder run --no-questions --harness openai-codex --model gpt-6-luna 
              --thinking-level max --agent agents/developer.book --context AGENTS.md --check npm run check 
              --check-before yes-and-fix

ProcessId   : 29256
CommandLine : "C:\Users\me\.nvm\versions\node\v22.23.2\bin\node.exe" 
              C:\Users\me\.nvm\versions\node\v22.23.2\bin/node_modules/npm/bin/npm-cli.js install --no-audit --no-fund


Path
----                                                                                                                   
C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron\node_modules\@aws-sdk\s3-request-presigner\package.j…


diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command '$installProcess = Get-CimInstance Win32_Process -Filter "ProcessId=29256"; $installProcess | Select-Object ProcessId,ParentProcessId,CreationDate,CommandLine | Format-List; Get-CimInstance Win32_Process | Where-Object { $_.ParentProcessId -eq 29256 } | Select-Object ProcessId,Name,CommandLine | Format-List; [PSCustomObject]@{NextInstalled=Test-Path node_modules/next/package.json; PresignerInstalled=Test-Path node_modules/@aws-sdk/s3-request-presigner/package.json; ClientS3Installed=Test-Path node_modules/@aws-sdk/client-s3/package.json}' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 2322ms:

ProcessId       : 29256
ParentProcessId : 19144
CreationDate    : 10/7/2026 11:12:26 AM
CommandLine     : "C:\Users\me\.nvm\versions\node\v22.23.2\bin\node.exe" 
                  C:\Users\me\.nvm\versions\node\v22.23.2\bin/node_modules/npm/bin/npm-cli.js install --no-audit 
                  --no-fund


NextInstalled PresignerInstalled ClientS3Installed
------------- ------------------ -----------------
        False               True              True


diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command 'Get-Process -Id 29256 | Select-Object Id,CPU,WorkingSet64,StartTime | Format-List; $npmLog = Get-ChildItem "$env:LOCALAPPDATA'"\\npm-cache\\_logs\" -Filter '*debug-0.log' | Sort-Object LastWriteTime -Descending | Select-Object -First 1; "'$npmLog | Select-Object Name,Length,LastWriteTime; Get-Content $npmLog.FullName -Tail 40' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 2169ms:

Id           : 29256
CPU          : 298.46875
WorkingSet64 : 1091346432
StartTime    : 10/7/2026 11:12:26 AM


Name                                 Length LastWriteTime
----                                 ------ -------------
2026-10-07T09_12_26_432Z-debug-0.log      0 10/7/2026 11:12:26 AM
4478 silly packumentCache corgi:https://registry.npmjs.org/@playwright%2ftest set size:undefined disposed:false
4479 http fetch GET 200 https://registry.npmjs.org/@playwright/test/-/test-1.62.1.tgz 1007ms (cache revalidated)
4480 http fetch GET 200 https://registry.npmjs.org/@ai-sdk/gateway/-/gateway-3.0.210.tgz 53884ms (cache miss)
4481 http fetch GET 200 https://registry.npmjs.org/@typescript-eslint%2ftypes 56360ms (cache updated)
4482 silly packumentCache corgi:https://registry.npmjs.org/@typescript-eslint%2ftypes set size:undefined disposed:false
4483 http fetch GET 200 https://registry.npmjs.org/@typescript-eslint%2fvisitor-keys 56945ms (cache updated)
4484 silly packumentCache corgi:https://registry.npmjs.org/@typescript-eslint%2fvisitor-keys set size:undefined disposed:false
4485 http fetch GET 200 https://registry.npmjs.org/@sentry/vercel-edge/-/vercel-edge-10.76.1.tgz 56066ms (cache miss)
4486 http fetch GET 200 https://registry.npmjs.org/@typescript-eslint/types/-/types-8.46.2.tgz 783ms (cache revalidated)
4487 http fetch GET 200 https://registry.npmjs.org/@typescript-eslint%2fscope-manager 57459ms (cache updated)
4488 silly packumentCache corgi:https://registry.npmjs.org/@typescript-eslint%2fscope-manager set size:undefined disposed:false
4489 http fetch GET 200 https://registry.npmjs.org/@typescript-eslint/visitor-keys/-/visitor-keys-8.46.2.tgz 846ms (cache revalidated)
4490 http fetch GET 200 https://registry.npmjs.org/@typescript-eslint/scope-manager/-/scope-manager-8.46.2.tgz 783ms (cache revalidated)
4491 http fetch GET 200 https://registry.npmjs.org/@opentelemetry/sdk-trace-base/-/sdk-trace-base-2.12.0.tgz 57862ms (cache miss)
4492 http fetch GET 200 https://registry.npmjs.org/typescript 60304ms (cache updated)
4493 silly packumentCache corgi:https://registry.npmjs.org/typescript set size:undefined disposed:false
4494 http cache https://registry.npmjs.org/typescript/-/typescript-5.9.3.tgz 662ms (cache hit)
4495 http fetch GET 200 https://registry.npmjs.org/playwright 62153ms (cache updated)
4496 silly packumentCache corgi:https://registry.npmjs.org/playwright set size:undefined disposed:false
4497 http fetch GET 200 https://registry.npmjs.org/playwright-core 62429ms (cache updated)
4498 silly packumentCache corgi:https://registry.npmjs.org/playwright-core set size:undefined disposed:false
4499 http cache https://registry.npmjs.org/playwright/-/playwright-1.62.1.tgz 562ms (cache hit)
4500 http cache https://registry.npmjs.org/playwright-core/-/playwright-core-1.62.1.tgz 515ms (cache hit)
4501 warn deprecated @azure/openai@1.0.0-beta.13: The Azure OpenAI client library for JavaScript beta has been retired. Please migrate to the stable OpenAI SDK for JavaScript using the migration guide: https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/openai/openai/MIGRATION.md.
4502 http fetch GET 200 https://registry.npmjs.org/@sentry/feedback/-/feedback-10.76.1.tgz 72491ms (cache miss)
4503 http fetch GET 200 https://registry.npmjs.org/@sentry/opentelemetry/-/opentelemetry-10.76.1.tgz 72858ms (cache miss)
4504 http fetch GET 200 https://registry.npmjs.org/@sentry/react/-/react-10.76.1.tgz 74134ms (cache miss)
4505 http fetch GET 200 https://registry.npmjs.org/@sentry/bundler-plugins/-/bundler-plugins-10.76.1.tgz 83419ms (cache miss)
4506 http fetch GET 200 https://registry.npmjs.org/@sentry/replay/-/replay-10.76.1.tgz 98496ms (cache miss)
4507 http fetch GET 200 https://registry.npmjs.org/@opentelemetry/sdk-trace/-/sdk-trace-2.12.0.tgz 99527ms (cache miss)
4508 http fetch GET 200 https://registry.npmjs.org/@opentelemetry/core/-/core-2.12.0.tgz 101404ms (cache miss)
4509 http fetch GET 200 https://registry.npmjs.org/@opentelemetry/resources/-/resources-2.12.0.tgz 103828ms (cache miss)
4510 http fetch GET 200 https://registry.npmjs.org/@sentry/browser-utils/-/browser-utils-10.76.1.tgz 106777ms (cache miss)
4511 http fetch GET 200 https://registry.npmjs.org/ai/-/ai-6.0.301.tgz 116962ms (cache miss)
4512 http fetch GET 200 https://registry.npmjs.org/@sentry/node-core/-/node-core-10.76.1.tgz 120034ms (cache miss)
4513 http fetch GET 200 https://registry.npmjs.org/@sentry/nextjs/-/nextjs-10.76.1.tgz 135850ms (cache miss)
4514 http fetch GET 200 https://registry.npmjs.org/@sentry/browser/-/browser-10.76.1.tgz 148025ms (cache miss)
4515 http fetch GET 200 https://registry.npmjs.org/@sentry/node/-/node-10.76.1.tgz 173228ms (cache miss)
4516 http fetch GET 200 https://registry.npmjs.org/@sentry/server-utils/-/server-utils-10.76.1.tgz 179935ms (cache miss)
4517 http fetch GET 200 https://registry.npmjs.org/@sentry/core/-/core-10.76.1.tgz 201778ms (cache miss)


diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command '$npmLog = Get-ChildItem "$env:LOCALAPPDATA'"\\npm-cache\\_logs\" -Filter '*debug-0.log' | Sort-Object LastWriteTime -Descending | Select-Object -First 1; Get-Content "'$npmLog.FullName -Tail 12; [PSCustomObject]@{NextInstalled=Test-Path node_modules/next/package.json; PresignerInstalled=Test-Path node_modules/@aws-sdk/s3-request-presigner/package.json}' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 1823ms:
4506 http fetch GET 200 https://registry.npmjs.org/@sentry/replay/-/replay-10.76.1.tgz 98496ms (cache miss)
4507 http fetch GET 200 https://registry.npmjs.org/@opentelemetry/sdk-trace/-/sdk-trace-2.12.0.tgz 99527ms (cache miss)
4508 http fetch GET 200 https://registry.npmjs.org/@opentelemetry/core/-/core-2.12.0.tgz 101404ms (cache miss)
4509 http fetch GET 200 https://registry.npmjs.org/@opentelemetry/resources/-/resources-2.12.0.tgz 103828ms (cache miss)
4510 http fetch GET 200 https://registry.npmjs.org/@sentry/browser-utils/-/browser-utils-10.76.1.tgz 106777ms (cache miss)
4511 http fetch GET 200 https://registry.npmjs.org/ai/-/ai-6.0.301.tgz 116962ms (cache miss)
4512 http fetch GET 200 https://registry.npmjs.org/@sentry/node-core/-/node-core-10.76.1.tgz 120034ms (cache miss)
4513 http fetch GET 200 https://registry.npmjs.org/@sentry/nextjs/-/nextjs-10.76.1.tgz 135850ms (cache miss)
4514 http fetch GET 200 https://registry.npmjs.org/@sentry/browser/-/browser-10.76.1.tgz 148025ms (cache miss)
4515 http fetch GET 200 https://registry.npmjs.org/@sentry/node/-/node-10.76.1.tgz 173228ms (cache miss)
4516 http fetch GET 200 https://registry.npmjs.org/@sentry/server-utils/-/server-utils-10.76.1.tgz 179935ms (cache miss)
4517 http fetch GET 200 https://registry.npmjs.org/@sentry/core/-/core-10.76.1.tgz 201778ms (cache miss)

NextInstalled PresignerInstalled
------------- ------------------
        False               True


diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
The registry fetches are unusually slow for several updated locked packages, but npm is still running and has already restored the presigner. It is rebuilding the dependency tree after the earlier interrupted clean install; I’ll let it finish so the project’s scripts can run against a coherent install.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command 'Get-Process -Id 29256 | Select-Object Id,CPU,WorkingSet64,StartTime | Format-List; Get-CimInstance Win32_Process | Where-Object { $_.ParentProcessId -eq 29256 } | Select-Object ProcessId,Name,CommandLine | Format-List; [PSCustomObject]@{NextInstalled=Test-Path node_modules/next/package.json; PresignerInstalled=Test-Path node_modules/@aws-sdk/s3-request-presigner/package.json; TypeScriptInstalled=Test-Path node_modules/typescript/package.json}; Get-ChildItem node_modules -Directory -ErrorAction SilentlyContinue | Measure-Object | Select-Object Count' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 783ms:

Id           : 29256
CPU          : 451.265625
WorkingSet64 : 871256064
StartTime    : 10/7/2026 11:12:26 AM


NextInstalled PresignerInstalled TypeScriptInstalled
------------- ------------------ -------------------
         True               True                True
                                                    


diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

 succeeded in 416631ms:
npm warn deprecated lodash.get@4.4.2: This package is deprecated. Use the optional chaining (?.) operator instead.
npm warn deprecated prebuild-install@7.1.3: No longer maintained. Please contact the author of the relevant native addon; alternatives are available.
npm warn deprecated crypto-js@4.2.0: Active development of CryptoJS has been discontinued. This library is no longer maintained.
npm warn deprecated @azure/openai@1.0.0-beta.13: The Azure OpenAI client library for JavaScript beta has been retired. Please migrate to the stable OpenAI SDK for JavaScript using the migration guide: https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/openai/openai/MIGRATION.md.
npm warn cleanup Failed to remove some directories [
npm warn cleanup   [
npm warn cleanup     'C:\\Users\\me\\work\\promptbook-experiments-and-landing-pages\\aldaron\\node_modules\\@napi-rs\\.canvas-win32-x64-msvc-1Fa2gM65',
npm warn cleanup     [Error: EPERM: operation not permitted, unlink 'C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron\node_modules\@napi-rs\.canvas-win32-x64-msvc-1Fa2gM65\skia.win32-x64-msvc.node'] {
npm warn cleanup       errno: -4048,
npm warn cleanup       code: 'EPERM',
npm warn cleanup       syscall: 'unlink',
npm warn cleanup       path: 'C:\\Users\\me\\work\\promptbook-experiments-and-landing-pages\\aldaron\\node_modules\\@napi-rs\\.canvas-win32-x64-msvc-1Fa2gM65\\skia.win32-x64-msvc.node'
npm warn cleanup     }
npm warn cleanup   ]
npm warn cleanup ]

added 926 packages, and changed 473 packages in 7m

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command 'Get-Process -Id 29256 | Select-Object Id,CPU,WorkingSet64,StartTime | Format-List; $npmLog = Get-ChildItem "$env:LOCALAPPDATA'"\\npm-cache\\_logs\" -Filter '*debug-0.log' | Sort-Object LastWriteTime -Descending | Select-Object -First 1; Get-Content "'$npmLog.FullName -Tail 8; Get-Item node_modules/next/package.json,node_modules/@aws-sdk/s3-request-presigner/package.json | Select-Object Name,Length,LastWriteTime | Format-Table' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 1454ms:
Get-Process: 
Line |
   2 |  Get-Process -Id 29256 | Select-Object Id,CPU,WorkingSet64,StartTime | …
     |  ~~~~~~~~~~~~~~~~~~~~~
     | Cannot find a process with the process identifier 29256.
6129 silly CHANGE node_modules/ai/node_modules/@ai-sdk/provider
6130 silly CHANGE node_modules/ai/node_modules/undici
6131 verbose cwd C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
6132 verbose os Windows_NT 10.0.19045
6133 verbose node v22.23.2
6134 verbose npm  v10.9.8
6135 verbose exit 0
6136 info ok

Name         Length LastWriteTime
----         ------ -------------
package.json  11015 10/7/2026 11:17:28 AM
package.json   1865 10/7/2026 11:12:47 AM


diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command 'npm ls @aws-sdk/s3-request-presigner @aws-sdk/client-s3 ptbk next --depth=0; git status --short; git diff --stat -- package-lock.json CHANGELOG.md' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 3313ms:
promptbook-landing-page@0.1.0 C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
├── @aws-sdk/client-s3@3.1134.0
├── @aws-sdk/s3-request-presigner@3.1134.0
├── next@15.2.6
└── ptbk@0.114.0-50

 M CHANGELOG.md
 M package-lock.json
?? prompts/2026-10-0100-fix-the-existing-check-failures-before-implementing-any.md
 CHANGELOG.md      |   3 +
 package-lock.json | 550 ++++++++++++++++++++++++++++++++++++++++++++++++----------------------------------------------------
 2 files changed, 265 insertions(+), 288 deletions(-)

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
The install has recovered the dependency tree and `npm ls` now resolves the S3 client, presigner, Next.js, and `ptbk` at their declared versions. The lockfile diff is limited to dependency resolution; I’ve recorded that clean-install repair in the changelog. I’m running the full `npm run check` now, including types/build, E2E, and cleanup.
exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command 'npm run check' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
Lint passes with the same six non-fatal warnings shown in the original output. The aggregate has moved on to `test-types`, which runs the production build before TypeScript; the previously missing presigner now resolves, and the build is underway.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
The optimized production build is compiling now. This is still the original check pipeline; no check steps have been skipped or relaxed.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
The production build completed, including all 113 static pages and the studio asset API routes that import the presigner. `test-types` is now running its standalone `tsc` step; after that, the remaining E2E and cleanup stages will run.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
TypeScript passed with no diagnostics, and the aggregate is now running Playwright. The E2E server reports that it skipped database migrations because `DATABASE_URL` is not configured; I’m watching the suite for whether its documented self-contained path handles that environment.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
The E2E suite is progressing successfully so far: the first six admin autosave and dialog scenarios have passed. The configured suite has 187 tests and one worker, so this stage will take a while; I’ll keep monitoring the complete run rather than stopping at the initial build fix.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
The suite has reached 12 passing scenarios, including the public cookie-consent layouts across desktop and mobile viewports. No failures have appeared so far.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
20 of 187 tests have passed, covering admin dialogs, cookie behavior, participant trust updates, and the first public landing pages. The server did emit a non-fatal YouTube cache-size warning during podcast-page requests; related tests passed.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
The suite is at 36 passing tests. The public-page smoke checks are moving through the specialized landings, community membership, personal pages, and localized legal routes without failures.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
47 tests have passed. The public-route and podcast metadata checks are now included in the pass count; the recurring oversized YouTube-cache warnings remain logged by the server but have not caused test failures.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
The E2E run is at 56 passes. Redirects and public submission flows are succeeding, including the shared newsletter and lead dialogs. The suite is continuing into more interactive/admin and recording-studio coverage.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
The E2E count is 67 passes, with one registration scenario skipped because there is no published workshop term in this environment. Podcast playback and local interaction cases are also passing. No test failure has appeared.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
The E2E run has advanced to 68 passing tests. The public participant connection test took about 90 seconds but passed; the one skipped test is the unavailable workshop-registration case, not a failed assertion.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
The suite is through 73 passing tests and has entered recording-studio coverage. The studio authentication, persistent owner/navigation, transcription boundary, and annotation-rebasing scenarios are passing; the expected ONNX bundler warning is non-fatal.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
The suite has passed 79 tests. The recording-studio derived-track, subtitle retry, and media synchronization checks are succeeding, so the broader dependency updates have not surfaced a runtime regression in these areas.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
83 tests have passed. Recording recovery, VFR preparation, and the display-capture diagnostic all completed successfully; the current worker is still in studio E2E coverage.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
The suite is at 87 passing tests. The heavier capture scenarios also passed: multi-source recording, monitor layouts, global pause/resume, appended takes, and the five-second alert test.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
93 tests have passed, including the recording-alert lifecycle cases: cancellation, permission timing, repeated clicks, and ensuring real failures are not delayed by a pending test alert. The suite remains green.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
The suite has reached 102 passing tests. Additional studio checks for hidden-tab alerts, disconnected sources, storage failures, required microphones, and muted display tracks are passing.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
107 tests have passed. The suite has verified source recovery and stopping a take before navigation, along with preference restoration and source-loss behavior; it remains in the recording-studio group.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
The suite is at 115 passes. Studio storage recovery, folder-free browser-local recording, ZIP/original export, and cross-tab takeover scenarios are succeeding. The only skips/warnings observed remain environmental or existing bundler conditions.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
121 tests have passed, including the takeover handshake, forced fencing at media commit boundaries, and protecting failed editor drafts during ownership transfer. These extensive storage and concurrency checks are continuing successfully.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
The E2E run has passed 130 tests. The takeover cases around pending saves, start/stop transitions, export cancellation, and resumable upload state are all green. The dependency fix remains validated by the live studio routes and their suite.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
133 tests have passed, including the responsive room-theme and dialog-draft scenarios. The recording-studio set has completed without failures, and the remaining suite is checking shared room and community behavior.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
The run is at 138 passes. Responsive room themes and the first localized Open Graph sharing-card checks are passing; remaining tests continue through the public metadata/routes coverage. The repeated ONNX bundler message remains a warning only.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
The suite is at 143 passes, including more sharing-card checks for public and branded-domain routes. These generated-image routes take longer to render, but each has passed so far.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
150 tests have been reached. One studio-project scenario failed on its first attempt but passed on the configured fresh-context retry; the suite is continuing, and the original check pipeline retains its retry behavior. A long five-hour simulation remains skipped as configured for this environment.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
The suite has reached 159 passing tests, including whitepaper interactions and the first workshop-agent administration scenario. Two long-history studio simulations are skipped by the existing suite configuration; the rest of the active checks continue.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
168 tests have passed. The remaining workshop admin cases are also green, covering agent setup, material ordering, repository ranges, private subtitle tracks, Vercel deployment guidance, and the browser-generated wrap-up PDF.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
183 tests have passed; the final branded-domain isolation checks are succeeding across the configured hostnames and `www` aliases. The remaining public-domain cases are close to complete.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
All 188 E2E cases have now reached a result: 183 passed, 3 were skipped by existing configuration, and 1 passed on retry after a transient first-attempt failure. The suite completed without a final failure; the aggregate is moving to its last `delete-test-data` step.
 succeeded in 3197970ms:

> promptbook-landing-page@0.1.0 check
> npm run lint && npx kill-port 4009 && npm run test-types && npm run test-e2e && npm run delete-test-data


> promptbook-landing-page@0.1.0 lint
> next lint


./components/public-web-page-preview-image.tsx
33:13  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./components/recording-studio/RecordingDerivedEditor.tsx
95:8  Warning: React Hook useEffect has a missing dependency: 'isAvailableSourceId'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
97:49  Warning: React Hook useEffect has a missing dependency: 'recording'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./components/recording-studio/RecordingSourceMonitor.tsx
59:8  Warning: React Hook useEffect has a missing dependency: 'activePart'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
63:8  Warning: React Hook useEffect has a missing dependency: 'activePart'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./components/recording-studio/RecordingStudioPublish.tsx
57:8  Warning: React Hook useEffect has a missing dependency: 'workshops'. Either include it or remove the dependency array. You can also do a functional update 'setWorkshops(w => ...)' if you only need 'workshops' in the 'setWorkshops' call.  react-hooks/exhaustive-deps

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
Process on port 4009 killed

> promptbook-landing-page@0.1.0 test-types
> npm run build && tsc


> promptbook-landing-page@0.1.0 build
> next build

   ▲ Next.js 15.2.6
   - Environments: .env

   Creating an optimized production build ...
 ⚠ Compiled with warnings

./node_modules/onnxruntime-web/dist/ort.min.js
Critical dependency: require function is used in a way in which dependencies cannot be statically extracted

Import trace for requested module:
./node_modules/onnxruntime-web/dist/ort.min.js
./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
./lib/recording-studio/recordingStudioDerivedGeneration.ts
./components/recording-studio/RecordingDerivedEditor.tsx
./components/recording-studio/RecordingEditor.tsx
./components/recording-studio/RecordingStudio.tsx

   Skipping validation of types
   Skipping linting
   Collecting page data ...
   Generating static pages (0/113) ...
   Generating static pages (28/113) 
   Generating static pages (56/113) 
   Generating static pages (84/113) 
 ✓ Generating static pages (113/113)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                                                                                  Size  First Load JS
┌ ƒ /                                                                                                       524 B         102 kB
├ ƒ /_not-found                                                                                             524 B         102 kB
├ ƒ /[shortcode]                                                                                           2.3 kB         136 kB
├ ƒ /[shortcode]/opengraph-image                                                                            524 B         102 kB
├ ƒ /admin                                                                                                  175 B         105 kB
├ ƒ /admin/community                                                                                      7.79 kB         423 kB
├ ƒ /admin/contacts                                                                                       26.4 kB         203 kB
├ ƒ /admin/discount-codes                                                                                 9.87 kB         139 kB
├ ƒ /admin/login                                                                                            524 B         102 kB
├ ƒ /admin/recording-studio                                                                                 524 B         102 kB
├ ƒ /admin/recording-studio/[recordingId]                                                                   524 B         102 kB
├ ƒ /admin/recording-studio/capture-probe                                                                 6.06 kB         116 kB
├ ƒ /admin/shortener                                                                                      51.9 kB         194 kB
├ ƒ /admin/studio                                                                                           524 B         102 kB
├ ƒ /admin/studio/editor                                                                                    524 B         102 kB
├ ƒ /admin/studio/editor/[projectId]                                                                        524 B         102 kB
├ ƒ /admin/studio/recording                                                                                 524 B         102 kB
├ ƒ /admin/studio/recording/[recordingId]                                                                   524 B         102 kB
├ ƒ /admin/workshops                                                                                        231 B         415 kB
├ ƒ /ai-supervize                                                                                           16 kB         233 kB
├ ƒ /ai-supervize-mini                                                                                    14.4 kB         251 kB
├ ○ /ai-supervize-mini/opengraph-image                                                                      524 B         102 kB
├ ƒ /ai-supervize-mini/participant                                                                        2.53 kB         133 kB
├ ○ /ai-supervize-mini/participant/opengraph-image                                                          524 B         102 kB
├ ○ /ai-supervize/opengraph-image                                                                           524 B         102 kB
├ ƒ /ai-ta-krajta                                                                                         19.9 kB         151 kB
├ ƒ /ai-ta-krajta/branding                                                                                  207 B         126 kB
├ ○ /ai-ta-krajta/branding/opengraph-image                                                                  524 B         102 kB
├ ○ /ai-ta-krajta/logo.png                                                                                  524 B         102 kB
├ ○ /ai-ta-krajta/logo.svg                                                                                  524 B         102 kB
├ ○ /ai-ta-krajta/manifest.webmanifest                                                                      524 B         102 kB
├ ƒ /ai-ta-krajta/media-kit                                                                                2.2 kB         128 kB
├ ○ /ai-ta-krajta/media-kit/opengraph-image                                                                 524 B         102 kB
├ ○ /ai-ta-krajta/opengraph-image                                                                           524 B         102 kB
├ ƒ /api/admin/community/memberships                                                                        524 B         102 kB
├ ƒ /api/admin/community/projects                                                                           524 B         102 kB
├ ƒ /api/admin/community/projects/[projectId]                                                               524 B         102 kB
├ ƒ /api/admin/discount-codes                                                                               524 B         102 kB
├ ƒ /api/admin/discount-codes/[discountCodeId]                                                              524 B         102 kB
├ ƒ /api/admin/recording-studio/commit-proposal                                                             524 B         102 kB
├ ƒ /api/admin/recording-studio/transcribe                                                                  524 B         102 kB
├ ƒ /api/admin/session                                                                                      524 B         102 kB
├ ƒ /api/admin/session/sign-out                                                                             524 B         102 kB
├ ƒ /api/admin/shortener                                                                                    524 B         102 kB
├ ƒ /api/admin/shortener/[shortcodeLinkId]                                                                  524 B         102 kB
├ ƒ /api/admin/shortener/[shortcodeLinkId]/clicks                                                           524 B         102 kB
├ ƒ /api/admin/studio/access                                                                                524 B         102 kB
├ ƒ /api/admin/studio/assets                                                                                524 B         102 kB
├ ƒ /api/admin/studio/assets/[assetId]                                                                      524 B         102 kB
├ ƒ /api/admin/studio/assets/[assetId]/parts/[partNumber]                                                   524 B         102 kB
├ ƒ /api/admin/studio/assets/[assetId]/read                                                                 524 B         102 kB
├ ƒ /api/admin/studio/projects/[projectId]/references                                                       524 B         102 kB
├ ƒ /api/admin/workshops                                                                                    524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]                                                                       524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/agents                                                                524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/agents/[agentId]                                                      524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/agents/audio                                                          524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/agents/audio-session                                                  524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/analytics                                                             524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/artificial-reactions                                                  524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/comments                                                              524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/comments/[commentId]                                                  524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/comments/[commentId]/artificial-upvotes                               524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/comments/[commentId]/material                                         524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/content                                                               524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/content/[contentId]                                                   524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/content/link-preview                                                  524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/content/order                                                         524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/exports/[exportKind]                                                  524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/feedback                                                              524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/hosted-recordings                                                     524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/hosted-recordings/[revisionId]                                        524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/hosted-recordings/[revisionId]/assets                                 524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/hosted-recordings/[revisionId]/assets/[assetId]                       524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/hosted-recordings/[revisionId]/assets/[assetId]/media                 524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/hosted-recordings/[revisionId]/assets/[assetId]/parts                 524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/hosted-recordings/[revisionId]/assets/[assetId]/parts/[partNumber]    524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/participants                                                          524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/participants/[participantId]                                          524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/participants/[participantId]/timeline                                 524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/participants/trust                                                    524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/polls                                                                 524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/polls/[pollId]                                                        524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/polls/[pollId]/options/[optionId]                                     524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/polls/[pollId]/options/[optionId]/artificial-votes                    524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/reactions                                                             524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/stage-comment                                                         524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/subtitles                                                             524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/subtitles/[subtitleId]                                                524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/subtitles/transcribe                                                  524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/subtitles/youtube                                                     524 B         102 kB
├ ƒ /api/admin/workshops/repository/commit                                                                  524 B         102 kB
├ ƒ /api/admin/workshops/repository/deployment                                                              524 B         102 kB
├ ƒ /api/ai-supervize-mini/registration                                                                     524 B         102 kB
├ ƒ /api/ai-ta-krajta/episodes/search                                                                       524 B         102 kB
├ ƒ /api/community/membership/registration                                                                  524 B         102 kB
├ ƒ /api/contacts                                                                                           524 B         102 kB
├ ƒ /api/contacts/export/[formatId]                                                                         524 B         102 kB
├ ƒ /api/discount-codes/validate                                                                            524 B         102 kB
├ ƒ /api/hosted-recordings/cleanup                                                                          524 B         102 kB
├ ƒ /api/stripe/webhook                                                                                     524 B         102 kB
├ ƒ /api/track-click                                                                                        524 B         102 kB
├ ƒ /api/waitlist                                                                                           524 B         102 kB
├ ƒ /api/workshop-agents/run                                                                                524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/comments                                                                  524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/comments/[commentId]                                                      524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/comments/[commentId]/material                                             524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/comments/[commentId]/upvotes                                              524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/connect                                                                   524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/feedback                                                                  524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/hosted-recording/[revisionId]                                             524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/hosted-recording/[revisionId]/[role]                                      524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/materials/[materialId]/preview                                            524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership                                                                524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership/cancellation                                                   524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership/checkout                                                       524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership/checkout/confirmation                                          524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership/portal                                                         524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/participant                                                               524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/participants/[participantId]                                              524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/polls/[pollId]/options/[optionId]                                         524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/polls/[pollId]/votes                                                      524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/presence                                                                  524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/reactions                                                                 524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/repository                                                                524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/repository/preview                                                        524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/state                                                                     524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/wrap-up                                                                   524 B         102 kB
├ ƒ /api/workshops/komunita/projects                                                                        524 B         102 kB
├ ƒ /api/workshops/komunita/projects/[projectId]                                                            524 B         102 kB
├ ƒ /api/workshops/komunita/projects/[projectId]/connect                                                    524 B         102 kB
├ ƒ /api/workshops/komunita/projects/[projectId]/vote                                                       524 B         102 kB
├ ƒ /api/workshops/komunita/projects/preview                                                                524 B         102 kB
├ ƒ /branding                                                                                             4.75 kB         135 kB
├ ○ /branding/opengraph-image                                                                               524 B         102 kB
├ ƒ /contact                                                                                              2.55 kB         158 kB
├ ○ /contact/opengraph-image                                                                                524 B         102 kB
├ ƒ /cs                                                                                                     179 B         244 kB
├ ƒ /cs/komunita                                                                                            242 B         338 kB
├ ƒ /cs/komunita/calendar.ics                                                                               524 B         102 kB
├ ƒ /cs/komunita/clenstvi                                                                                 13.2 kB         149 kB
├ ○ /cs/komunita/clenstvi/opengraph-image                                                                   524 B         102 kB
├ ○ /cs/komunita/opengraph-image                                                                            524 B         102 kB
├ ƒ /cs/komunita/projects                                                                                  4.6 kB         143 kB
├ ƒ /cs/komunita/projects/[projectId]                                                                     2.96 kB         335 kB
├ ƒ /cs/komunita/projects/[projectId]/opengraph-image                                                       524 B         102 kB
├ ○ /cs/komunita/projects/opengraph-image                                                                   524 B         102 kB
├ ƒ /cs/obchodni-podminky                                                                                 2.53 kB         133 kB
├ ○ /cs/obchodni-podminky/opengraph-image                                                                   524 B         102 kB
├ ƒ /cs/ochrana-osobnich-udaju                                                                            2.53 kB         133 kB
├ ○ /cs/ochrana-osobnich-udaju/opengraph-image                                                              524 B         102 kB
├ ƒ /cs/online-workshop                                                                                   10.5 kB         264 kB
├ ƒ /cs/online-workshop/dekujeme                                                                          4.43 kB         154 kB
├ ○ /cs/online-workshop/dekujeme/opengraph-image                                                            524 B         102 kB
├ ○ /cs/online-workshop/opengraph-image                                                                     524 B         102 kB
├ ƒ /cs/online-workshop/participant                                                                       3.12 kB         335 kB
├ ○ /cs/online-workshop/participant/opengraph-image                                                         524 B         102 kB
├ ○ /cs/opengraph-image                                                                                     524 B         102 kB
├ ƒ /cs/pavol                                                                                               160 B         156 kB
├ ○ /cs/pavol/opengraph-image                                                                               524 B         102 kB
├ ƒ /cs/pro-firmy                                                                                           179 B         244 kB
├ ○ /cs/pro-firmy/opengraph-image                                                                           524 B         102 kB
├ ƒ /cs/whitepaper                                                                                          160 B         169 kB
├ ƒ /cs/whitepaper/download                                                                                 524 B         102 kB
├ ○ /cs/whitepaper/opengraph-image                                                                          524 B         102 kB
├ ƒ /data-deletion                                                                                        2.53 kB         133 kB
├ ○ /data-deletion/opengraph-image                                                                          524 B         102 kB
├ ƒ /dekujeme                                                                                             4.04 kB         153 kB
├ ○ /dekujeme/opengraph-image                                                                               524 B         102 kB
├ ƒ /en                                                                                                     182 B         244 kB
├ ○ /en/opengraph-image                                                                                     524 B         102 kB
├ ƒ /en/pavol                                                                                               160 B         156 kB
├ ○ /en/pavol/opengraph-image                                                                               524 B         102 kB
├ ƒ /en/privacy-policy                                                                                    2.53 kB         133 kB
├ ○ /en/privacy-policy/opengraph-image                                                                      524 B         102 kB
├ ƒ /en/terms-and-conditions                                                                              2.53 kB         133 kB
├ ○ /en/terms-and-conditions/opengraph-image                                                                524 B         102 kB
├ ƒ /en/whitepaper                                                                                          160 B         169 kB
├ ƒ /en/whitepaper/download                                                                                 524 B         102 kB
├ ○ /en/whitepaper/opengraph-image                                                                          524 B         102 kB
├ ƒ /for-agro                                                                                             5.59 kB         270 kB
├ ○ /for-agro/opengraph-image                                                                               524 B         102 kB
├ ƒ /for-industry                                                                                          6.3 kB         271 kB
├ ○ /for-industry/opengraph-image                                                                           524 B         102 kB
├ ƒ /hackathon-factory                                                                                      15 kB         246 kB
├ ○ /hackathon-factory/opengraph-image                                                                      524 B         102 kB
├ ƒ /k/[...shortFileUrlParts]                                                                               524 B         102 kB
├ ○ /manifest.webmanifest                                                                                   524 B         102 kB
├ ƒ /old                                                                                                  21.1 kB         248 kB
├ ○ /opengraph-image                                                                                        524 B         102 kB
├ ƒ /pavol                                                                                                  524 B         102 kB
├ ƒ /privacy                                                                                                524 B         102 kB
├ ƒ /pro-firmy                                                                                              524 B         102 kB
├ ƒ /pro-mesta                                                                                            4.67 kB         270 kB
├ ○ /pro-mesta/opengraph-image                                                                              524 B         102 kB
├ ○ /robots.txt                                                                                             524 B         102 kB
├ ƒ /shortener                                                                                              524 B         102 kB
├ ○ /sitemap.xml                                                                                            524 B         102 kB
├ ƒ /skoleni                                                                                                524 B         102 kB
├ ƒ /terms                                                                                                  524 B         102 kB
├ ƒ /test/hopko                                                                                           4.62 kB         106 kB
└ ○ /test/hopko/opengraph-image                                                                             524 B         102 kB
+ First Load JS shared by all                                                                              102 kB
  ├ chunks/1684-5ee3e10e7027784a.js                                                                       45.8 kB
  ├ chunks/4bd1b696-98e5f42b448df367.js                                                                   53.3 kB
  └ other shared chunks (total)                                                                           2.83 kB


ƒ Middleware                                                                                              35.3 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand


> promptbook-landing-page@0.1.0 test-e2e
> playwright test

[WebServer] (node:11184) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] (node:30512) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] (node:26664) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] Database migrations skipped: DATABASE_URL is not configured.

Running 187 tests using 1 worker

(node:17900) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ✓    1 tests\e2e\admin-autosave.spec.ts:52:5 › autosaves edits in order, protects reload while pending, and waits before navigating (38.9s)
  ✓    2 tests\e2e\admin-autosave.spec.ts:92:5 › retains a failed edit and retries it without leaving the settings (15.2s)
  ✓    3 tests\e2e\admin-autosave.spec.ts:109:5 › keeps invalid settings open and saves corrected settings before signing out (13.5s)
  ✓    4 tests\e2e\admin-modals.spec.ts:24:9 › edits and creates contacts in keyboard-accessible dialogs at 1440px (14.6s)
  ✓    5 tests\e2e\admin-modals.spec.ts:24:9 › edits and creates contacts in keyboard-accessible dialogs at 390px (5.7s)
  ✓    6 tests\e2e\admin-modals.spec.ts:77:5 › keeps failed discount creation visible in its dialog and autosaves later edits there (5.0s)
  ✓    7 tests\e2e\cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /cs (11.3s)
  ✓    8 tests\e2e\cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /en (8.2s)
  ✓    9 tests\e2e\cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /cs/ochrana-osobnich-udaju (9.9s)
  ✓   10 tests\e2e\cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /cs/komunita (20.8s)
[WebServer] (node:25056) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓   11 tests\e2e\cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /ai-supervize (13.4s)
  ✓   12 tests\e2e\cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /ai-supervize-mini (11.4s)
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2126348 bytes)]
  ✓   13 tests\e2e\cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /ai-ta-krajta (14.3s)
  ✓   14 tests\e2e\cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /admin/login (3.8s)
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2121547 bytes)]
  ✓   15 tests\e2e\cookie-consent.spec.ts:64:5 › cookie choices persist and the privacy link reopens settings after client navigation (9.2s)
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2129397 bytes)]
  ✓   16 tests\e2e\cookie-consent.spec.ts:93:5 › cookie panel and coder badge clear a player opened later, resized and closed (7.6s)
  ✓   17 tests\e2e\cookie-consent.spec.ts:124:5 › a booking notice leaves cookie choices clickable and the footer can be scrolled clear (7.7s)
  ✓   18 tests\e2e\participant-promotion.spec.ts:50:9 › refreshes an author's pending total and submissions after trust on /cs/online-workshop/participant (14.6s)
  ✓   19 tests\e2e\participant-promotion.spec.ts:50:9 › refreshes an author's pending total and submissions after trust on /cs/komunita (9.0s)
  ✓   20 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /cs (3.5s)
  ✓   21 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /en (5.0s)
  ✓   22 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /cs/pro-firmy (12.4s)
  ✓   23 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /pro-mesta (11.4s)
  ✓   24 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /for-agro (7.8s)
  ✓   25 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /for-industry (8.7s)
  ✓   26 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /ai-supervize (4.6s)
  ✓   27 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /ai-supervize-mini (4.7s)
  ✓   28 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /ai-ta-krajta (3.7s)
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2127324 bytes)]
  ✓   29 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /ai-ta-krajta/media-kit (9.8s)
  ✓   30 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /ai-ta-krajta/branding (7.5s)
  ✓   31 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /hackathon-factory (8.8s)
  ✓   32 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /cs/online-workshop (13.5s)
  ✓   33 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /cs/komunita/clenstvi (15.9s)
  ✓   34 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /cs/pavol (12.0s)
  ✓   35 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /en/pavol (8.9s)
  ✓   36 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /cs/ochrana-osobnich-udaju (2.4s)
  ✓   37 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /en/privacy-policy (10.2s)
  ✓   38 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /cs/obchodni-podminky (9.3s)
  ✓   39 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /en/terms-and-conditions (7.9s)
  ✓   40 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /contact (8.7s)
  ✓   41 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /branding (14.6s)
  ✓   42 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /data-deletion (10.9s)
  ✓   43 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /old (9.9s)
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2126764 bytes)]
  ✓   44 tests\e2e\public-pages.spec.ts:143:5 › AI ta Krajta collaboration section deep-links to its media kit (5.0s)
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2124721 bytes)]
  ✓   45 tests\e2e\public-pages.spec.ts:154:5 › AI ta Krajta owns its metadata, icon and installable manifest and credits Promptbook coder (22.2s)
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2120735 bytes)]
  ✓   46 tests\e2e\public-pages.spec.ts:250:5 › AI ta Krajta searches complete transcripts on the server without sending them to the browser (12.6s)
  ✓   47 tests\e2e\public-pages.spec.ts:268:9 › public address redirects to its page: / (37ms)
  ✓   48 tests\e2e\public-pages.spec.ts:268:9 › public address redirects to its page: /pro-firmy (5.7s)
  ✓   49 tests\e2e\public-pages.spec.ts:268:9 › public address redirects to its page: /pavol (30ms)
  ✓   50 tests\e2e\public-pages.spec.ts:268:9 › public address redirects to its page: /privacy (7.4s)
  ✓   51 tests\e2e\public-pages.spec.ts:268:9 › public address redirects to its page: /terms (5.6s)
  ✓   52 tests\e2e\public-pages.spec.ts:268:9 › public address redirects to its page: /skoleni (7.9s)
  ✓   53 tests\e2e\public-pages.spec.ts:282:5 › /skoleni carries a discount code to the workshop registration (390ms)
  ✓   54 tests\e2e\public-submissions.spec.ts:13:5 › submits the shared footer newsletter form (23.4s)
[WebServer] (node:29640) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓   55 tests\e2e\public-submissions.spec.ts:27:5 › submits the reusable get-started lead dialog (21.5s)
  ✓   56 tests\e2e\public-submissions.spec.ts:41:5 › submits the business lead dialog (6.3s)
[WebServer]  ⚠ Fast Refresh had to perform a full reload. Read more: https://nextjs.org/docs/messages/fast-refresh-reload
  ✓   57 tests\e2e\public-submissions.spec.ts:55:5 › submits the homepage qualification lead flow (26.0s)
  ✓   58 tests\e2e\public-submissions.spec.ts:80:5 › submits Pavol’s personal contact form (5.9s)
  ✓   59 tests\e2e\public-submissions.spec.ts:96:5 › submits a published online-workshop registration (17.6s)
  ✓   60 tests\e2e\public-submissions.spec.ts:116:5 › personalizes and submits the 199 Kč Promptbook paid community membership (12.4s)
  -   61 tests\e2e\public-submissions.spec.ts:143:5 › submits an available AI Supervize Mini workshop registration
  ✓   62 tests\e2e\public-submissions.spec.ts:171:5 › submits the AI Supervize Mini future-term interest form (6.2s)
  ✓   63 tests\e2e\public-submissions.spec.ts:196:5 › submits the AI ta Krajta collaboration form (6.6s)
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2127781 bytes)]
  ✓   64 tests\e2e\public-submissions.spec.ts:211:5 › plays the newest AI ta Krajta episode from the header (6.0s)
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2124688 bytes)]
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2127212 bytes)]
  ✓   65 tests\e2e\public-submissions.spec.ts:220:5 › resumes a half-played AI ta Krajta episode where its listener left it (11.1s)
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2123615 bytes)]
  ✓   66 tests\e2e\public-submissions.spec.ts:254:5 › starts the AI ta Krajta minigame from its snake and keeps it local to the page (4.8s)
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2120352 bytes)]
  ✓   67 tests\e2e\public-submissions.spec.ts:268:5 › filters the AI ta Krajta archive by a person and keeps its destination in the hash (5.7s)
[WebServer] (node:23048) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] (node:30572) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓   68 tests\e2e\public-submissions.spec.ts:280:5 › connects a public online-workshop participant (1.5m)
[WebServer] (node:24588) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓   69 tests\e2e\recording-studio.spec.ts:242:5 › requires admin authentication for the recording studio (59.8s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓   70 tests\e2e\recording-studio.spec.ts:247:5 › keeps the active Studio owner and capture across its recording and editor sections (19.2s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer] (node:24932) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓   71 tests\e2e\recording-studio.spec.ts:262:5 › requires admin authentication for a stable recording workspace address (15.7s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓   72 tests\e2e\recording-studio.spec.ts:267:5 › requires admin authentication before accepting browser-local transcription audio (7.7s)
[WebServer] (node:23600) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer] (node:23128) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓   73 tests\e2e\recording-studio.spec.ts:274:5 › persists reviewed workshop annotations and rebases them beside every prepared source (26.2s)
[WebServer] (node:27256) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓   74 tests\e2e\recording-studio.spec.ts:317:5 › aligns reviewed workshop events, activity, scenes and Git anchors with prepared appended-take sources (13.1s)
[WebServer] (node:30204) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] (node:2344) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓   75 tests\e2e\recording-studio.spec.ts:380:5 › generates separate Czech subtitles and speech activity from chosen camera and microphone audio (18.1s)
[WebServer] (node:15476) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓   76 tests\e2e\recording-studio.spec.ts:445:5 › keeps a caption returned by only one long-audio chunk at the overlap boundary (8.2s)
[WebServer] (node:29064) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] (node:11464) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓   77 tests\e2e\recording-studio.spec.ts:500:5 › checks actual legacy audio despite incorrect saved flags (9.5s)
[WebServer] (node:3136) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓   78 tests\e2e\recording-studio.spec.ts:535:5 › keeps caption corrections through retry, cancellation and a stale generation (29.7s)
[WebServer] (node:9360) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] (node:6652) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓   79 tests\e2e\recording-studio.spec.ts:598:5 › synchronizes rendered timecodes, monitoring and prepared separate-source files (21.0s)
[WebServer] (node:21760) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] (node:8960) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] (node:26376) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓   80 tests\e2e\recording-studio.spec.ts:712:5 › keeps late session gaps, local missing media, autosave failure and retry honest (15.8s)
[WebServer] (node:23588) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] (node:18380) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓   81 tests\e2e\recording-studio.spec.ts:765:5 › recovers a corrupt preview and cancels preparation without losing originals (11.9s)
[WebServer] (node:28356) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓   82 tests\e2e\recording-studio.spec.ts:831:5 › prepares the full boundary of a variable-frame-rate camera with its audio and explicit cadence (6.1s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓   83 tests\e2e\recording-studio.spec.ts:850:5 › plain capture diagnostic requests a user-selected display without studio preferences (24.4s)
[WebServer] (node:12108) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] (node:26120) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] (node:20436) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓   84 tests\e2e\recording-studio.spec.ts:862:5 › records separate sources, restores them, trims every track and exports playable editor material (56.9s)
[WebServer] (node:27576) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] (node:29036) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] (node:28944) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓   85 tests\e2e\recording-studio.spec.ts:989:5 › keeps all three sources through monitor layouts, global pauses and an appended take (57.1s)
  ✓   86 tests\e2e\recording-studio.spec.ts:1188:5 › keeps a multi-source setup through stops, release, and reload without restoring capture (16.9s)
  ✓   87 tests\e2e\recording-studio.spec.ts:1390:5 › counts a test alert down for five seconds and then announces it exactly once (API-path check) (11.9s)
  ✓   88 tests\e2e\recording-studio.spec.ts:1434:5 › schedules one test from repeated clicks and announces nothing after Zrušit test (API-path check) (18.7s)
  ✓   89 tests\e2e\recording-studio.spec.ts:1460:5 › runs a test alert during a recording without stopping, failing or changing the take (API-path check) (14.0s)
  ✓   90 tests\e2e\recording-studio.spec.ts:1492:5 › announces a real failure at once while a test alert is still counting down (API-path check) (13.7s)
[WebServer] (node:16260) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓   91 tests\e2e\recording-studio.spec.ts:1523:5 › keeps a pending test alert through a change of studio view and fires it once (API-path check) (17.7s)
  ✓   92 tests\e2e\recording-studio.spec.ts:1548:5 › cancels a pending test alert the moment the administrator signs out (API-path check) (11.3s)
  ✓   93 tests\e2e\recording-studio.spec.ts:1566:5 › asks for the notification permission by the click and starts the countdown only after the answer (API-path check) (11.1s)
  ✓   94 tests\e2e\recording-studio.spec.ts:1590:5 › tells a refused dispatch, a failed display and a revoked permission apart without losing the alert (API-path check) (20.4s)
  ✓   95 tests\e2e\recording-studio.spec.ts:1626:5 › reports notifications the browser really blocks and still tests the sound and the page (9.3s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓   96 tests\e2e\recording-studio.spec.ts:1643:5 › counts a test alert down on a hidden studio page and hands exactly one notification to the real browser API (28.0s)
  ✓   97 tests\e2e\recording-studio.spec.ts:1694:5 › keeps the other tracks recording when one source is disconnected and alerts about the loss (11.1s)
  ✓   98 tests\e2e\recording-studio.spec.ts:1734:5 › announces a lost source and a refused storage write from a hidden studio page through the real browser API (10.7s)
  ✓   99 tests\e2e\recording-studio.spec.ts:1801:5 › blocks Start when a live camera preview loses its required microphone input (4.1s)
  ✓  100 tests\e2e\recording-studio.spec.ts:1822:5 › shows a muted display source as temporarily unavailable and requests reconnection (3.8s)
  ✓  101 tests\e2e\recording-studio.spec.ts:1844:5 › reports a display track that is already muted when selection returns (4.0s)
  ✓  102 tests\e2e\recording-studio.spec.ts:1856:5 › keeps the Space guidance available when reusing a historic screen-source configuration (6.9s)
  ✓  103 tests\e2e\recording-studio.spec.ts:1875:5 › restores source preferences after closing and reopening the same browser profile (20.0s)
  ✓  104 tests\e2e\recording-studio.spec.ts:1930:5 › retains a cancelled display-selection intent and retries it only from a new user action (4.3s)
  ✓  105 tests\e2e\recording-studio.spec.ts:1962:5 › retains a failed camera-plus-microphone request and lets the owner explicitly retry without sound (6.9s)
  ✓  106 tests\e2e\recording-studio.spec.ts:2000:5 › stops the whole take once every source has disconnected and prevents a second tab from changing it (11.6s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  107 tests\e2e\recording-studio.spec.ts:2017:5 › recovers persisted chunks after an interrupted page and waits for stop before admin navigation (58.7s)
  ✓  108 tests\e2e\recording-studio.spec.ts:2044:5 › explains constant 10 GiB estimates while committed multi-source bytes and bitrate update (10.5s)
  ✓  109 tests\e2e\recording-studio.spec.ts:2074:5 › records with missing estimate and persistence APIs and downloads individual originals (6.5s)
[WebServer] (node:12368) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓  110 tests\e2e\recording-studio.spec.ts:2093:5 › records, pauses, reloads, previews and exports a multi-track take without ever offering or opening a recording folder (17.4s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  111 tests\e2e\recording-studio.spec.ts:2155:5 › starts without a take once recorded into a folder, asks for no folder and keeps a browser-local take exportable (10.0s)
  ✓  112 tests\e2e\recording-studio.spec.ts:2221:5 › hands over one indexed original by both export paths, and the recorder's own bytes when no working file can be written (11.4s)
  ✓  113 tests\e2e\recording-studio.spec.ts:2256:5 › keeps committed multi-source data after a real IndexedDB transaction abort and offers recovery (13.2s)
  ✓  114 tests\e2e\recording-studio.spec.ts:2303:5 › studio takeover confirmation cancellation leaves the actual owner and recording untouched (9.5s)
  ✓  115 tests\e2e\recording-studio.spec.ts:2321:9 › studio takeover from a idle owner releases all tracks and reopens committed media without refreshing either tab (12.4s)
[WebServer] (node:6264) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓  116 tests\e2e\recording-studio.spec.ts:2321:9 › studio takeover from a recording owner releases all tracks and reopens committed media without refreshing either tab (29.3s)
[WebServer] (node:8224) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓  117 tests\e2e\recording-studio.spec.ts:2321:9 › studio takeover from a paused owner releases all tracks and reopens committed media without refreshing either tab (14.6s)
  ✓  118 tests\e2e\recording-studio.spec.ts:2372:5 › studio takeover serializes two simultaneous requesting tabs and repeated handovers with real Web Locks (12.6s)
  ✓  119 tests\e2e\recording-studio.spec.ts:2396:5 › studio forced takeover fences a frozen recording owner and stops its capture when it resumes (19.1s)
  ✓  120 tests\e2e\recording-studio.spec.ts:2430:5 › studio forced takeover rejects a suspended media transaction at the native commit boundary (17.7s)
[WebServer] (node:19736) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓  121 tests\e2e\recording-studio.spec.ts:2475:5 › studio takeover refuses failed editor saves, keeps the draft in A, and requires explicit discard in B (10.3s)
[WebServer] (node:6816) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓  122 tests\e2e\recording-studio.spec.ts:2503:5 › studio takeover waits for an admitted editor save and reloads its acknowledged title and selection (9.7s)
  ✓  123 tests\e2e\recording-studio.spec.ts:2539:5 › studio takeover reports a failed final checkpoint instead of a clean release and can recover through fencing (11.3s)
[WebServer] (node:24064) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓  124 tests\e2e\recording-studio.spec.ts:2565:9 › studio takeover waits for the pausing transition and final real recorder events before recovery (10.6s)
[WebServer] (node:20188) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓  125 tests\e2e\recording-studio.spec.ts:2565:9 › studio takeover waits for the stopping transition and final real recorder events before recovery (10.8s)
  ✓  126 tests\e2e\recording-studio.spec.ts:2597:5 › studio takeover cancelled while a frozen owner is delayed ignores the late request when A resumes (14.1s)
  ✓  127 tests\e2e\recording-studio.spec.ts:2616:5 › studio takeover acquires the actual released lock when a frozen recording owner closes mid-request (14.4s)
  ✓  128 tests\e2e\recording-studio.spec.ts:2635:5 › studio takeover settles an in-progress Start before granting the waiting tab authority (7.4s)
[WebServer] (node:20856) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓  129 tests\e2e\recording-studio.spec.ts:2661:5 › studio takeover cancels an export waiting for its destination and preserves the saved selection (9.8s)
[WebServer] (node:18092) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓  130 tests\e2e\recording-studio.spec.ts:2683:5 › studio takeover waits for an acknowledged upload request and preserves resumable revision metadata (10.7s)
  ✓  131 tests\e2e\recording-studio.spec.ts:2720:5 › studio forced takeover refuses persisted external uncertainty and leaves the real owner lock intact (15.0s)
  ✓  132 tests\e2e\room-theme.spec.ts:96:5 › shares a saved room appearance, follows the device, and preserves the waiting-room form (30.0s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer] (node:22676) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓  133 tests\e2e\room-theme.spec.ts:141:5 › themes connected rooms, materials, and portalled dialogs on desktop and mobile without losing drafts (46.2s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  134 tests\e2e\sharing-previews.spec.ts:21:9 › shares the correct PNG and public metadata: ptbk.io/cs (22.6s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  135 tests\e2e\sharing-previews.spec.ts:21:9 › shares the correct PNG and public metadata: ptbk.io/en (18.4s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  136 tests\e2e\sharing-previews.spec.ts:21:9 › shares the correct PNG and public metadata: ptbk.io/cs/whitepaper (34.2s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  137 tests\e2e\sharing-previews.spec.ts:21:9 › shares the correct PNG and public metadata: ptbk.io/en/whitepaper (18.3s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  138 tests\e2e\sharing-previews.spec.ts:21:9 › shares the correct PNG and public metadata: ptbk.io/cs/pro-firmy (16.0s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  139 tests\e2e\sharing-previews.spec.ts:21:9 › shares the correct PNG and public metadata: ptbk.io/contact (14.8s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  140 tests\e2e\sharing-previews.spec.ts:21:9 › shares the correct PNG and public metadata: ptbk.io/en/privacy-policy (15.7s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  141 tests\e2e\sharing-previews.spec.ts:21:9 › shares the correct PNG and public metadata: ptbk.io/cs/komunita/projects (47.7s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer] (node:10144) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓  142 tests\e2e\sharing-previews.spec.ts:21:9 › shares the correct PNG and public metadata: ptbk.io/cs/online-workshop/participant (26.4s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  143 tests\e2e\sharing-previews.spec.ts:21:9 › shares the correct PNG and public metadata: ai-ta-krajta.cz/media-kit (15.6s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  144 tests\e2e\sharing-previews.spec.ts:21:9 › shares the correct PNG and public metadata: ai-ta-krajta.cz/branding (10.6s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  145 tests\e2e\sharing-previews.spec.ts:21:9 › shares the correct PNG and public metadata: pavolhejny.cz/ (10.5s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  146 tests\e2e\sharing-previews.spec.ts:21:9 › shares the correct PNG and public metadata: pavolhejny.com/ (11.2s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer] (node:1968) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer] (node:29152) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓  147 tests\e2e\studio-projects.spec.ts:77:5 › Studio creates an editor-only project and imports a read-only file without capture or browser-media copies (1.1m)
  -  148 tests\e2e\studio-projects.spec.ts:107:5 › Studio seeks a real five-hour three-part/four-track assembly with bounded active decoders
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer] (node:19876) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer] (node:28568) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✘  149 tests\e2e\studio-projects.spec.ts:266:5 › Studio opens a finalized multitrack recording without copying, renders saved composition, settles joins and reopens the same project (14.6s)
(node:19988) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] (node:13704) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] (node:23600) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓  150 tests\e2e\studio-projects.spec.ts:266:5 › Studio opens a finalized multitrack recording without copying, renders saved composition, settles joins and reopens the same project (retry #1) (19.6s)
[WebServer] (node:19300) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] (node:17832) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] (node:26032) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓  151 tests\e2e\studio-projects.spec.ts:398:5 › Studio progressively seeks URL media, diagnoses CORS/range/authorization failures and explicitly relinks the same source (11.1s)
[WebServer] (node:30464) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer] (node:18416) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] (node:17948) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] (node:13068) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer] (node:26652) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
  ✓  152 tests\e2e\studio-projects.spec.ts:488:5 › Studio authenticates project links and preserves legacy recording identities through permanent redirects (35.2s)
  -  153 tests\e2e\studio-projects.spec.ts:509:5 › Studio seeks a long unindexed recorder container directly from its existing IndexedDB media
  ✓  154 tests\e2e\whitepaper.spec.ts:11:5 › keeps APT selection controls disabled until their first interaction can be handled (3.4s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  155 tests\e2e\whitepaper.spec.ts:37:9 › explains APT, verifies before accepting, and keeps external effects after a revert (cs) (17.3s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  156 tests\e2e\whitepaper.spec.ts:37:9 › explains APT, verifies before accepting, and keeps external effects after a revert (en) (11.1s)
  ✓  157 tests\e2e\whitepaper.spec.ts:117:5 › works on a phone with keyboard controls, reduced motion, and shared chapter language links (6.5s)
  ✓  158 tests\e2e\whitepaper.spec.ts:152:5 › delivers the complete paper and native reading controls without JavaScript (2.2s)
  ✓  159 tests\e2e\workshop-agents.spec.ts:34:9 › defines a Book agent in the workshop administration (6.6s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  160 tests\e2e\workshop-agents.spec.ts:34:9 › defines a Book agent in the community administration (52.2s)
  ✓  161 tests\e2e\workshop-material-order.spec.ts:66:5 › material ordering supports mouse, touch, and keyboard and keeps the saved order after reload (16.2s)
  ✓  162 tests\e2e\workshop-repository-range.spec.ts:31:5 › edits independent commit bounds in workshop settings (4.8s)
  ✓  163 tests\e2e\workshop-repository-range.spec.ts:67:5 › previews the deployed app while browsing the highlighted workshop range (4.9s)
  ✓  164 tests\e2e\workshop-subtitles.spec.ts:63:5 › imports, autosaves, reloads and downloads private subtitles through the shared admin editor (6.7s)
  ✓  165 tests\e2e\workshop-subtitles.spec.ts:107:5 › decodes a long recording into bounded audio chunks and preserves multilingual timestamps (6.6s)
  ✓  166 tests\e2e\workshop-vercel-deployment.spec.ts:31:9 › deploys a workshop project and saves its ready URL through the existing settings form (8.7s)
  ✓  167 tests\e2e\workshop-vercel-deployment.spec.ts:31:9 › shows Vercel failure details and guidance, then saves the URL after retrying (12.6s)
  ✓  168 tests\e2e\workshop-wrap-up-pdf.spec.ts:34:5 › downloads the branded recap in the browser with local fonts, project preview, Git graph and short-link QR (20.8s)
(node:27652) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ✓  169 tests\e2e\pavol-personal.spec.ts:21:9 › pavolhejny.cz supports keyboard navigation on a narrow screen (2.8s)
  ✓  170 tests\e2e\pavol-personal.spec.ts:61:9 › pavolhejny.cz preserves a custom enquiry through service changes and a failed submission (10.2s)
  ✓  171 tests\e2e\pavol-personal.spec.ts:129:13 › pavolhejny.cz without JavaScript › keeps its content and media archive readable (1.3s)
  ✓  172 tests\e2e\pavol-personal.spec.ts:21:9 › pavolhejny.com supports keyboard navigation on a narrow screen (4.5s)
  ✓  173 tests\e2e\pavol-personal.spec.ts:61:9 › pavolhejny.com preserves a custom enquiry through service changes and a failed submission (10.1s)
  ✓  174 tests\e2e\pavol-personal.spec.ts:129:13 › pavolhejny.com without JavaScript › keeps its content and media archive readable (1.4s)
(node:27484) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2123701 bytes)]
  ✓  175 tests\e2e\public-domains.spec.ts:82:17 › isolated public domains › ai-ta-krajta.cz serves its own page and branded 404s at the requested URL (3.5s)
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2148669 bytes)]
  ✓  176 tests\e2e\public-domains.spec.ts:82:17 › isolated public domains › www.ai-ta-krajta.cz serves its own page and branded 404s at the requested URL (3.4s)
  ✓  177 tests\e2e\public-domains.spec.ts:82:17 › isolated public domains › pavolhejny.cz serves its own page and branded 404s at the requested URL (4.0s)
  ✓  178 tests\e2e\public-domains.spec.ts:82:17 › isolated public domains › www.pavolhejny.cz serves its own page and branded 404s at the requested URL (2.7s)
  ✓  179 tests\e2e\public-domains.spec.ts:82:17 › isolated public domains › pavolhejny.com serves its own page and branded 404s at the requested URL (2.8s)
  ✓  180 tests\e2e\public-domains.spec.ts:82:17 › isolated public domains › www.pavolhejny.com serves its own page and branded 404s at the requested URL (2.8s)
  ✓  181 tests\e2e\public-domains.spec.ts:114:9 › isolated public domains › podcast paths on its apex keep Promptbook-only and file-looking pages isolated (821ms)
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2152691 bytes)]
  ✓  182 tests\e2e\public-domains.spec.ts:132:9 › isolated public domains › a locally mapped branded hostname loads Next assets and hydrates its controls (4.8s)
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2133176 bytes)]
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2128525 bytes)]
  ✓  183 tests\e2e\public-domains.spec.ts:146:9 › isolated public domains › subscribes from the podcast section and footer on mobile without interrupting playback or page state (9.7s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ Fast Refresh had to perform a full reload. Read more: https://nextjs.org/docs/messages/fast-refresh-reload
  ✓  184 tests\e2e\public-domains.spec.ts:200:13 › isolated public domains › ptbk.io still serves Promptbook pages and redirects only its own legacy paths (25.2s)
  ✓  185 tests\e2e\public-domains.spec.ts:200:13 › isolated public domains › www.ptbk.io still serves Promptbook pages and redirects only its own legacy paths (5.9s)
  ✓  186 tests\e2e\public-domains.spec.ts:220:9 › isolated public domains › legacy redirects retain suffixes, slashes and queries, then unknown children receive a branded 404 (141ms)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  187 tests\e2e\public-domains.spec.ts:258:9 › isolated public domains › site metadata, shared files and required APIs remain available on their domains (24.9s)
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2126929 bytes)]
  ✓  188 tests\e2e\public-domains.spec.ts:303:9 › isolated public domains › visible cross-site links use canonical destinations (9.9s)
Saved 200 E2E video(s) to tests/e2e/videos/.
Removed the E2E video(s) of 1 outdated run(s) from tests/e2e/videos/.


  1) tests\e2e\studio-projects.spec.ts:266:5 › Studio opens a finalized multitrack recording without copying, renders saved composition, settles joins and reopens the same project 

    Error: expect(received).toBeGreaterThan(expected)

    Expected: > 0
    Received:   0

      327 |             return { maximumDeviationSeconds: Math.max(0, ...deviations), readyCount: deviations.length };
      328 |         }, seconds);
    > 329 |         expect(result.readyCount).toBeGreaterThan(0);
          |                                   ^
      330 |         expect(result.maximumDeviationSeconds).toBeLessThanOrEqual(0.1);
      331 |         deviations.push({ seconds, maximumDeviationSeconds: result.maximumDeviationSeconds });
      332 |     }
        at C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron\tests\e2e\studio-projects.spec.ts:329:35

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    tests\e2e\.artifacts\studio-projects-Studio-ope-45402-nd-reopens-the-same-project\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    tests\e2e\.artifacts\studio-projects-Studio-ope-45402-nd-reopens-the-same-project\video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: tests\e2e\.artifacts\studio-projects-Studio-ope-45402-nd-reopens-the-same-project\error-context.md

    attachment #4: trace (application/zip) ─────────────────────────────────────────────────────────
    tests\e2e\.artifacts\studio-projects-Studio-ope-45402-nd-reopens-the-same-project\trace.zip
    Usage:

        npx playwright show-trace tests\e2e\.artifacts\studio-projects-Studio-ope-45402-nd-reopens-the-same-project\trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

  Slow test file: tests\e2e\recording-studio.spec.ts (17.1m)
  Consider running tests from slow files in parallel. See: https://playwright.dev/docs/test-parallel
  1 flaky
    tests\e2e\studio-projects.spec.ts:266:5 › Studio opens a finalized multitrack recording without copying, renders saved composition, settles joins and reopens the same project 
  3 skipped
  183 passed (44.6m)

> promptbook-landing-page@0.1.0 delete-test-data
> tsx scripts/delete-test-data.ts

Deleted 13 Contact row(s) and 1 workshop participant row(s) with an @example.com e-mail address.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command 'npm ci --dry-run --ignore-scripts --no-audit --no-fund' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command 'npm ls --depth=0' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command 'git diff --check; git status --short; git diff --stat; git diff -- CHANGELOG.md' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 631ms:
 M CHANGELOG.md
 M package-lock.json
?? prompts/2026-10-0100-fix-the-existing-check-failures-before-implementing-any.md
 CHANGELOG.md      |   3 +
 package-lock.json | 550 ++++++++++++++++++++++++++++++++++++++++++++++++----------------------------------------------------
 2 files changed, 265 insertions(+), 288 deletions(-)
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8..42188098 100644
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

 succeeded in 11953ms:
promptbook-landing-page@0.1.0 C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
├── @aws-sdk/client-s3@3.1134.0
├── @aws-sdk/s3-request-presigner@3.1134.0
├── @babel/eslint-parser@7.28.5
├── @dnd-kit/core@6.3.1
├── @dnd-kit/sortable@10.0.0
├── @dnd-kit/utilities@3.2.2
├── @electric-sql/pglite@0.3.14
├── @emnapi/runtime@1.11.3 extraneous
├── @eslint/eslintrc@3.3.1
├── @hookform/resolvers@5.2.2
├── @playwright/test@1.62.1
├── @radix-ui/react-accordion@1.2.12
├── @radix-ui/react-alert-dialog@1.1.15
├── @radix-ui/react-aspect-ratio@1.1.7
├── @radix-ui/react-avatar@1.1.10
├── @radix-ui/react-checkbox@1.3.3
├── @radix-ui/react-collapsible@1.1.12
├── @radix-ui/react-context-menu@2.2.16
├── @radix-ui/react-dialog@1.1.15
├── @radix-ui/react-dropdown-menu@2.1.16
├── @radix-ui/react-hover-card@1.1.15
├── @radix-ui/react-label@2.1.7
├── @radix-ui/react-menubar@1.1.16
├── @radix-ui/react-navigation-menu@1.2.14
├── @radix-ui/react-popover@1.1.15
├── @radix-ui/react-progress@1.1.7
├── @radix-ui/react-radio-group@1.3.8
├── @radix-ui/react-scroll-area@1.2.10
├── @radix-ui/react-select@2.2.6
├── @radix-ui/react-separator@1.1.7
├── @radix-ui/react-slider@1.3.6
├── @radix-ui/react-slot@1.2.3
├── @radix-ui/react-switch@1.2.6
├── @radix-ui/react-tabs@1.1.13
├── @radix-ui/react-toast@1.2.15
├── @radix-ui/react-toggle-group@1.1.11
├── @radix-ui/react-toggle@1.1.10
├── @radix-ui/react-tooltip@1.2.8
├── @ricky0123/vad-web@0.0.31
├── @supabase/ssr@0.7.0
├── @supabase/supabase-js@2.81.1
├── @testing-library/jest-dom@6.9.1
├── @testing-library/react@16.3.0
├── @total-typescript/ts-reset@0.6.1
├── @types/js-yaml@4.0.9
├── @types/lodash@4.17.20
├── @types/node@20.19.24
├── @types/pdfmake@0.3.3
├── @types/pg@8.23.1
├── @types/react-dom@19.2.2
├── @types/react@19.2.2
├── @zip.js/zip.js@2.16.0
├── autoprefixer@10.4.27
├── class-variance-authority@0.7.1
├── clsx@2.1.1
├── cmdk@1.1.1
├── date-fns@3.6.0
├── dotenv@16.6.1
├── embla-carousel-react@8.6.0
├── eslint-config-next@15.2.4
├── eslint@9.39.0
├── fake-indexeddb@6.2.5
├── framer-motion@12.23.24
├── input-otp@1.4.2
├── js-yaml@4.1.1
├── jsdom@26.1.0
├── leaflet@1.9.4
├── logrocket@12.1.1
├── lucide-react@0.487.0
├── marked@18.0.13
├── mediabunny@1.58.1
├── moment@2.30.1
├── next-themes@0.4.6
├── next@15.2.6
├── onnxruntime-web@1.22.0
├── pdfmake@0.3.11
├── pg@8.16.3
├── postcss@8.5.6
├── ptbk@0.114.0-50
├── raw-loader@4.0.2
├── react-day-picker@8.10.1
├── react-dom@18.3.1
├── react-hook-form@7.66.0
├── react-qr-code@2.0.18
├── react-resizable-panels@2.1.9
├── react-use-measure@2.1.7
├── react@18.3.1
├── recharts@2.15.4
├── sharp@0.34.4
├── sonner@2.0.7
├── spacetrim@0.11.60
├── stripe@22.6.0
├── tailwind-merge@3.3.1
├── tailwindcss-animate@1.0.7
├── tailwindcss@3.4.19
├── tsx@4.23.12
├── tw-animate-css@1.4.0
├── typescript@5.9.3
├── vaul@1.1.2
├── vitest@3.2.4
└── zod@3.25.76


 succeeded in 13037ms:
add fsevents 2.3.3
add @unrs/resolver-binding-win32-ia32-msvc 1.11.1
add @unrs/resolver-binding-win32-arm64-msvc 1.11.1
add @unrs/resolver-binding-wasm32-wasi 1.11.1
add @unrs/resolver-binding-linux-x64-musl 1.11.1
add @unrs/resolver-binding-linux-x64-gnu 1.11.1
add @unrs/resolver-binding-linux-s390x-gnu 1.11.1
add @unrs/resolver-binding-linux-riscv64-musl 1.11.1
add @unrs/resolver-binding-linux-riscv64-gnu 1.11.1
add @unrs/resolver-binding-linux-ppc64-gnu 1.11.1
add @unrs/resolver-binding-linux-arm64-musl 1.11.1
add @unrs/resolver-binding-linux-arm64-gnu 1.11.1
add @unrs/resolver-binding-linux-arm-musleabihf 1.11.1
add @unrs/resolver-binding-linux-arm-gnueabihf 1.11.1
add @unrs/resolver-binding-freebsd-x64 1.11.1
add @unrs/resolver-binding-darwin-x64 1.11.1
add @unrs/resolver-binding-darwin-arm64 1.11.1
add @unrs/resolver-binding-android-arm64 1.11.1
add @unrs/resolver-binding-android-arm-eabi 1.11.1
add @tybys/wasm-util 0.10.4
add @sentry/cli-win32-i686 2.58.6
add @sentry/cli-win32-arm64 2.58.6
add @sentry/cli-linux-x64 2.58.6
add @sentry/cli-linux-i686 2.58.6
add @sentry/cli-linux-arm64 2.58.6
add @sentry/cli-linux-arm 2.58.6
add @sentry/cli-darwin 2.58.6
add @rollup/rollup-win32-ia32-msvc 4.62.2
add @rollup/rollup-win32-arm64-msvc 4.62.2
add @rollup/rollup-openharmony-arm64 4.62.2
add @rollup/rollup-openbsd-x64 4.62.2
add @rollup/rollup-linux-x64-musl 4.62.2
add @rollup/rollup-linux-x64-gnu 4.62.2
add @rollup/rollup-linux-s390x-gnu 4.62.2
add @rollup/rollup-linux-riscv64-musl 4.62.2
add @rollup/rollup-linux-riscv64-gnu 4.62.2
add @rollup/rollup-linux-ppc64-musl 4.62.2
add @rollup/rollup-linux-ppc64-gnu 4.62.2
add @rollup/rollup-linux-loong64-musl 4.62.2
add @rollup/rollup-linux-loong64-gnu 4.62.2
add @rollup/rollup-linux-arm64-musl 4.62.2
add @rollup/rollup-linux-arm64-gnu 4.62.2
add @rollup/rollup-linux-arm-musleabihf 4.62.2
add @rollup/rollup-linux-arm-gnueabihf 4.62.2
add @rollup/rollup-freebsd-x64 4.62.2
add @rollup/rollup-freebsd-arm64 4.62.2
add @rollup/rollup-darwin-x64 4.62.2
add @rollup/rollup-darwin-arm64 4.62.2
add @rollup/rollup-android-arm64 4.62.2
add @rollup/rollup-android-arm-eabi 4.62.2
add @next/swc-win32-arm64-msvc 15.2.5
add @next/swc-linux-x64-musl 15.2.5
add @next/swc-linux-x64-gnu 15.2.5
add @next/swc-linux-arm64-musl 15.2.5
add @next/swc-linux-arm64-gnu 15.2.5
add @next/swc-darwin-x64 15.2.5
add @next/swc-darwin-arm64 15.2.5
add @napi-rs/wasm-runtime 0.2.12
add @napi-rs/canvas-linux-x64-musl 0.1.80
add @napi-rs/canvas-linux-x64-gnu 0.1.80
add @napi-rs/canvas-linux-riscv64-gnu 0.1.80
add @napi-rs/canvas-linux-arm64-musl 0.1.80
add @napi-rs/canvas-linux-arm64-gnu 0.1.80
add @napi-rs/canvas-linux-arm-gnueabihf 0.1.80
add @napi-rs/canvas-darwin-x64 0.1.80
add @napi-rs/canvas-darwin-arm64 0.1.80
add @napi-rs/canvas-android-arm64 0.1.80
add @img/sharp-win32-ia32 0.34.4
add @img/sharp-win32-arm64 0.34.4
add @img/sharp-wasm32 0.34.4
add @img/sharp-linuxmusl-x64 0.34.4
add @img/sharp-linuxmusl-arm64 0.34.4
add @img/sharp-linux-x64 0.34.4
add @img/sharp-linux-s390x 0.34.4
add @img/sharp-linux-ppc64 0.34.4
add @img/sharp-linux-arm64 0.34.4
add @img/sharp-linux-arm 0.34.4
add @img/sharp-libvips-linuxmusl-x64 1.2.3
add @img/sharp-libvips-linuxmusl-arm64 1.2.3
add @img/sharp-libvips-linux-x64 1.2.3
add @img/sharp-libvips-linux-s390x 1.2.3
add @img/sharp-libvips-linux-ppc64 1.2.3
add @img/sharp-libvips-linux-arm64 1.2.3
add @img/sharp-libvips-linux-arm 1.2.3
add @img/sharp-libvips-darwin-x64 1.2.3
add @img/sharp-libvips-darwin-arm64 1.2.3
add @img/sharp-darwin-x64 0.34.4
add @img/sharp-darwin-arm64 0.34.4
add @esbuild/win32-ia32 0.25.12
add @esbuild/win32-arm64 0.25.12
add @esbuild/sunos-x64 0.25.12
add @esbuild/openharmony-arm64 0.25.12
add @esbuild/openbsd-x64 0.25.12
add @esbuild/openbsd-arm64 0.25.12
add @esbuild/netbsd-x64 0.25.12
add @esbuild/netbsd-arm64 0.25.12
add @esbuild/linux-x64 0.25.12
add @esbuild/linux-s390x 0.25.12
add @esbuild/linux-riscv64 0.25.12
add @esbuild/linux-ppc64 0.25.12
add @esbuild/linux-mips64el 0.25.12
add @esbuild/linux-loong64 0.25.12
add @esbuild/linux-ia32 0.25.12
add @esbuild/linux-arm64 0.25.12
add @esbuild/linux-arm 0.25.12
add @esbuild/freebsd-x64 0.25.12
add @esbuild/freebsd-arm64 0.25.12
add @esbuild/darwin-x64 0.25.12
add @esbuild/darwin-arm64 0.25.12
add @esbuild/android-x64 0.25.12
add @esbuild/android-arm64 0.25.12
add @esbuild/android-arm 0.25.12
add @esbuild/aix-ppc64 0.25.12
add @emnapi/wasi-threads 1.2.3
add @emnapi/core 1.11.3
add @esbuild/win32-ia32 0.28.2
add @esbuild/win32-arm64 0.28.2
add @esbuild/sunos-x64 0.28.2
add @esbuild/openharmony-arm64 0.28.2
add @esbuild/openbsd-x64 0.28.2
add @esbuild/openbsd-arm64 0.28.2
add @esbuild/netbsd-x64 0.28.2
add @esbuild/netbsd-arm64 0.28.2
add @esbuild/linux-x64 0.28.2
add @esbuild/linux-s390x 0.28.2
add @esbuild/linux-riscv64 0.28.2
add @esbuild/linux-ppc64 0.28.2
add @esbuild/linux-mips64el 0.28.2
add @esbuild/linux-loong64 0.28.2
add @esbuild/linux-ia32 0.28.2
add @esbuild/linux-arm64 0.28.2
add @esbuild/linux-arm 0.28.2
add @esbuild/freebsd-x64 0.28.2
add @esbuild/freebsd-arm64 0.28.2
add @esbuild/darwin-x64 0.28.2
add @esbuild/darwin-arm64 0.28.2
add @esbuild/android-x64 0.28.2
add @esbuild/android-arm64 0.28.2
add @esbuild/android-arm 0.28.2
add @esbuild/aix-ppc64 0.28.2
add fsevents 2.3.2
add @img/sharp-win32-ia32 0.33.5
add @img/sharp-wasm32 0.33.5
add @img/sharp-linuxmusl-x64 0.33.5
add @img/sharp-linuxmusl-arm64 0.33.5
add @img/sharp-linux-x64 0.33.5
add @img/sharp-linux-s390x 0.33.5
add @img/sharp-linux-arm64 0.33.5
add @img/sharp-linux-arm 0.33.5
add @img/sharp-libvips-linuxmusl-x64 1.0.4
add @img/sharp-libvips-linuxmusl-arm64 1.0.4
add @img/sharp-libvips-linux-x64 1.0.4
add @img/sharp-libvips-linux-s390x 1.0.4
add @img/sharp-libvips-linux-arm64 1.0.4
add @img/sharp-libvips-linux-arm 1.0.5
add @img/sharp-libvips-darwin-x64 1.0.4
add @img/sharp-libvips-darwin-arm64 1.0.4
add @img/sharp-darwin-x64 0.33.5
add @img/sharp-darwin-arm64 0.33.5
add @next/swc-win32-arm64-msvc 15.5.25
add @next/swc-linux-x64-musl 15.5.25
add @next/swc-linux-x64-gnu 15.5.25
add @next/swc-linux-arm64-musl 15.5.25
add @next/swc-linux-arm64-gnu 15.5.25
add @next/swc-darwin-x64 15.5.25
add @next/swc-darwin-arm64 15.5.25

added 166 packages in 12s

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command "git status --short; git diff --check; git diff --stat -- CHANGELOG.md package-lock.json; Select-String -Path package-lock.json -Pattern '\"node_modules/ptbk\"|\"node_modules/@aws-sdk/s3-request-presigner\"' -Context 0,3" in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 392ms:
 M CHANGELOG.md
 M package-lock.json
?? prompts/2026-10-0100-fix-the-existing-check-failures-before-implementing-any.md
 CHANGELOG.md      |   3 +
 package-lock.json | 550 ++++++++++++++++++++++++++++++++++++++++++++++++----------------------------------------------------
 2 files changed, 265 insertions(+), 288 deletions(-)

> package-lock.json:572:        "node_modules/@aws-sdk/s3-request-presigner": {
  package-lock.json:573:            "version": "3.1134.0",
  package-lock.json:574:            "resolved": 
"https://registry.npmjs.org/@aws-sdk/s3-request-presigner/-/s3-request-presigner-3.1134.0.tgz",
  package-lock.json:575:            "integrity": 
"sha512-75DC3biOXXmSWqCN2hwJmhMPjDdgc1twjNJEknuWhY9M/E9eFIQufXkwOQx5raNTg6P/FbCgk9tp4y2SZ7vZFA==",
> package-lock.json:18519:        "node_modules/ptbk": {
  package-lock.json:18520:            "version": "0.114.0-50",
  package-lock.json:18521:            "resolved": "https://registry.npmjs.org/ptbk/-/ptbk-0.114.0-50.tgz",
  package-lock.json:18522:            "integrity": 
"sha512-1NNOx4LcDaH9zqNFba6BFxWPw5socYu+CCFy3MeXTk9CnVfPQ+o8mMnqK6Ea+NUdKK7XrP6ZW5Q6oIhvXGAi3Q==",


diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..421880980fb5694f521f95b6671082a63c58672f
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, restoring clean `npm ci` installs so
+  production builds receive the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

apply patch
patch: completed
C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron\CHANGELOG.md
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..8c1be82cec28ab12b7883831739df8234d4a9d05
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, so clean `npm ci` installs can
+  resolve the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..8c1be82cec28ab12b7883831739df8234d4a9d05
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, so clean `npm ci` installs can
+  resolve the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command 'git diff --check; git status --short; git diff --stat -- CHANGELOG.md package-lock.json' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 298ms:
 M CHANGELOG.md
 M package-lock.json
?? prompts/2026-10-0100-fix-the-existing-check-failures-before-implementing-any.md
 CHANGELOG.md      |   3 +
 package-lock.json | 550 ++++++++++++++++++++++++++++++++++++++++++++++++----------------------------------------------------
 2 files changed, 265 insertions(+), 288 deletions(-)

diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..8c1be82cec28ab12b7883831739df8234d4a9d05
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, so clean `npm ci` installs can
+  resolve the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

codex
Fixed the check failure by syncing [package-lock.json](C:/Users/me/work/promptbook-experiments-and-landing-pages/aldaron/package-lock.json) with `package.json`. The S3 presigner was already declared; the lockfile had stale versions, and the local install was missing the package. I recorded the repair in [CHANGELOG.md](C:/Users/me/work/promptbook-experiments-and-landing-pages/aldaron/CHANGELOG.md). The README already documents `npm ci`, so it needed no update.

**`npm run check` passed**: lint, production build, TypeScript, E2E, and test-data cleanup completed. E2E reported 183 passes, 3 configured skips, and one test that passed on retry. Existing lint and build warnings remain non-fatal.

A full `npm ci` in this workspace hit a Windows file-lock error while replacing a native canvas file held by another Node process. `npm ci --dry-run` passed after the lockfile update, `npm install` restored the dependencies, and the full check passed.
diff --git a/CHANGELOG.md b/CHANGELOG.md
index a4a78ee8f8cc864ed0297a236e359c4051be9cf0..8c1be82cec28ab12b7883831739df8234d4a9d05
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -2,6 +2,9 @@
 
 ## Unreleased
 
+- Synchronized `package-lock.json` with the dependency versions in `package.json`, so clean `npm ci` installs can
+  resolve the AWS S3 request presigner used by studio asset routes.
+
 - Fixed recording-studio E2E capture on hosts where the physical audio output clock stalls. Synthetic screen and
   microphone audio now use a silent Web Audio output and finish resuming before the source is returned, so all five
   sources produce real media for the existing recording, ZIP, trimming, and playback checks.

tokens used
227,549
Fixed the check failure by syncing [package-lock.json](C:/Users/me/work/promptbook-experiments-and-landing-pages/aldaron/package-lock.json) with `package.json`. The S3 presigner was already declared; the lockfile had stale versions, and the local install was missing the package. I recorded the repair in [CHANGELOG.md](C:/Users/me/work/promptbook-experiments-and-landing-pages/aldaron/CHANGELOG.md). The README already documents `npm ci`, so it needed no update.

**`npm run check` passed**: lint, production build, TypeScript, E2E, and test-data cleanup completed. E2E reported 183 passes, 3 configured skips, and one test that passed on retry. Existing lint and build warnings remain non-fatal.

A full `npm ci` in this workspace hit a Windows file-lock error while replacing a native canvas file held by another Node process. `npm ci --dry-run` passed after the lockfile update, `npm install` restored the dependencies, and the full check passed.

=== runner shell finished at 2026-10-07T10:14:09.873Z ===
Status: succeeded

=== check shell started at 2026-10-07T10:14:10.149Z ===
Script path: /c/Users/me/work/promptbook-experiments-and-landing-pages/aldaron/.promptbook/coder-prompts/2026-10-0100-fix-the-existing-check-failures-before-implementing-any.check.sh

--- raw input ---
cd '/c/Users/me/work/promptbook-experiments-and-landing-pages/aldaron' || exit 1
npm run check

--- raw output ---

> promptbook-landing-page@0.1.0 check
> npm run lint && npx kill-port 4009 && npm run test-types && npm run test-e2e && npm run delete-test-data


> promptbook-landing-page@0.1.0 lint
> next lint


./components/public-web-page-preview-image.tsx
33:13  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./components/recording-studio/RecordingDerivedEditor.tsx
95:8  Warning: React Hook useEffect has a missing dependency: 'isAvailableSourceId'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
97:49  Warning: React Hook useEffect has a missing dependency: 'recording'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./components/recording-studio/RecordingSourceMonitor.tsx
59:8  Warning: React Hook useEffect has a missing dependency: 'activePart'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
63:8  Warning: React Hook useEffect has a missing dependency: 'activePart'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./components/recording-studio/RecordingStudioPublish.tsx
57:8  Warning: React Hook useEffect has a missing dependency: 'workshops'. Either include it or remove the dependency array. You can also do a functional update 'setWorkshops(w => ...)' if you only need 'workshops' in the 'setWorkshops' call.  react-hooks/exhaustive-deps

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
Process on port 4009 killed

> promptbook-landing-page@0.1.0 test-types
> npm run build && tsc


> promptbook-landing-page@0.1.0 build
> next build

   ▲ Next.js 15.2.6
   - Environments: .env

   Creating an optimized production build ...
 ⚠ Compiled with warnings

./node_modules/onnxruntime-web/dist/ort.min.js
Critical dependency: require function is used in a way in which dependencies cannot be statically extracted

Import trace for requested module:
./node_modules/onnxruntime-web/dist/ort.min.js
./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
./lib/recording-studio/recordingStudioDerivedGeneration.ts
./components/recording-studio/RecordingDerivedEditor.tsx
./components/recording-studio/RecordingEditor.tsx
./components/recording-studio/RecordingStudio.tsx

   Skipping validation of types
   Skipping linting
   Collecting page data ...
   Generating static pages (0/113) ...
   Generating static pages (28/113) 
   Generating static pages (56/113) 
   Generating static pages (84/113) 
 ✓ Generating static pages (113/113)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                                                                                  Size  First Load JS
┌ ƒ /                                                                                                       524 B         102 kB
├ ƒ /_not-found                                                                                             524 B         102 kB
├ ƒ /[shortcode]                                                                                           2.3 kB         136 kB
├ ƒ /[shortcode]/opengraph-image                                                                            524 B         102 kB
├ ƒ /admin                                                                                                  175 B         105 kB
├ ƒ /admin/community                                                                                      7.79 kB         423 kB
├ ƒ /admin/contacts                                                                                       26.4 kB         203 kB
├ ƒ /admin/discount-codes                                                                                 9.87 kB         139 kB
├ ƒ /admin/login                                                                                            524 B         102 kB
├ ƒ /admin/recording-studio                                                                                 524 B         102 kB
├ ƒ /admin/recording-studio/[recordingId]                                                                   524 B         102 kB
├ ƒ /admin/recording-studio/capture-probe                                                                 6.06 kB         116 kB
├ ƒ /admin/shortener                                                                                      51.9 kB         194 kB
├ ƒ /admin/studio                                                                                           524 B         102 kB
├ ƒ /admin/studio/editor                                                                                    524 B         102 kB
├ ƒ /admin/studio/editor/[projectId]                                                                        524 B         102 kB
├ ƒ /admin/studio/recording                                                                                 524 B         102 kB
├ ƒ /admin/studio/recording/[recordingId]                                                                   524 B         102 kB
├ ƒ /admin/workshops                                                                                        231 B         415 kB
├ ƒ /ai-supervize                                                                                           16 kB         233 kB
├ ƒ /ai-supervize-mini                                                                                    14.4 kB         251 kB
├ ○ /ai-supervize-mini/opengraph-image                                                                      524 B         102 kB
├ ƒ /ai-supervize-mini/participant                                                                        2.53 kB         133 kB
├ ○ /ai-supervize-mini/participant/opengraph-image                                                          524 B         102 kB
├ ○ /ai-supervize/opengraph-image                                                                           524 B         102 kB
├ ƒ /ai-ta-krajta                                                                                         19.9 kB         151 kB
├ ƒ /ai-ta-krajta/branding                                                                                  207 B         126 kB
├ ○ /ai-ta-krajta/branding/opengraph-image                                                                  524 B         102 kB
├ ○ /ai-ta-krajta/logo.png                                                                                  524 B         102 kB
├ ○ /ai-ta-krajta/logo.svg                                                                                  524 B         102 kB
├ ○ /ai-ta-krajta/manifest.webmanifest                                                                      524 B         102 kB
├ ƒ /ai-ta-krajta/media-kit                                                                                2.2 kB         128 kB
├ ○ /ai-ta-krajta/media-kit/opengraph-image                                                                 524 B         102 kB
├ ○ /ai-ta-krajta/opengraph-image                                                                           524 B         102 kB
├ ƒ /api/admin/community/memberships                                                                        524 B         102 kB
├ ƒ /api/admin/community/projects                                                                           524 B         102 kB
├ ƒ /api/admin/community/projects/[projectId]                                                               524 B         102 kB
├ ƒ /api/admin/discount-codes                                                                               524 B         102 kB
├ ƒ /api/admin/discount-codes/[discountCodeId]                                                              524 B         102 kB
├ ƒ /api/admin/recording-studio/commit-proposal                                                             524 B         102 kB
├ ƒ /api/admin/recording-studio/transcribe                                                                  524 B         102 kB
├ ƒ /api/admin/session                                                                                      524 B         102 kB
├ ƒ /api/admin/session/sign-out                                                                             524 B         102 kB
├ ƒ /api/admin/shortener                                                                                    524 B         102 kB
├ ƒ /api/admin/shortener/[shortcodeLinkId]                                                                  524 B         102 kB
├ ƒ /api/admin/shortener/[shortcodeLinkId]/clicks                                                           524 B         102 kB
├ ƒ /api/admin/studio/access                                                                                524 B         102 kB
├ ƒ /api/admin/studio/assets                                                                                524 B         102 kB
├ ƒ /api/admin/studio/assets/[assetId]                                                                      524 B         102 kB
├ ƒ /api/admin/studio/assets/[assetId]/parts/[partNumber]                                                   524 B         102 kB
├ ƒ /api/admin/studio/assets/[assetId]/read                                                                 524 B         102 kB
├ ƒ /api/admin/studio/projects/[projectId]/references                                                       524 B         102 kB
├ ƒ /api/admin/workshops                                                                                    524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]                                                                       524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/agents                                                                524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/agents/[agentId]                                                      524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/agents/audio                                                          524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/agents/audio-session                                                  524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/analytics                                                             524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/artificial-reactions                                                  524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/comments                                                              524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/comments/[commentId]                                                  524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/comments/[commentId]/artificial-upvotes                               524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/comments/[commentId]/material                                         524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/content                                                               524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/content/[contentId]                                                   524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/content/link-preview                                                  524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/content/order                                                         524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/exports/[exportKind]                                                  524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/feedback                                                              524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/hosted-recordings                                                     524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/hosted-recordings/[revisionId]                                        524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/hosted-recordings/[revisionId]/assets                                 524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/hosted-recordings/[revisionId]/assets/[assetId]                       524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/hosted-recordings/[revisionId]/assets/[assetId]/media                 524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/hosted-recordings/[revisionId]/assets/[assetId]/parts                 524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/hosted-recordings/[revisionId]/assets/[assetId]/parts/[partNumber]    524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/participants                                                          524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/participants/[participantId]                                          524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/participants/[participantId]/timeline                                 524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/participants/trust                                                    524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/polls                                                                 524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/polls/[pollId]                                                        524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/polls/[pollId]/options/[optionId]                                     524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/polls/[pollId]/options/[optionId]/artificial-votes                    524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/reactions                                                             524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/stage-comment                                                         524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/subtitles                                                             524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/subtitles/[subtitleId]                                                524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/subtitles/transcribe                                                  524 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/subtitles/youtube                                                     524 B         102 kB
├ ƒ /api/admin/workshops/repository/commit                                                                  524 B         102 kB
├ ƒ /api/admin/workshops/repository/deployment                                                              524 B         102 kB
├ ƒ /api/ai-supervize-mini/registration                                                                     524 B         102 kB
├ ƒ /api/ai-ta-krajta/episodes/search                                                                       524 B         102 kB
├ ƒ /api/community/membership/registration                                                                  524 B         102 kB
├ ƒ /api/contacts                                                                                           524 B         102 kB
├ ƒ /api/contacts/export/[formatId]                                                                         524 B         102 kB
├ ƒ /api/discount-codes/validate                                                                            524 B         102 kB
├ ƒ /api/hosted-recordings/cleanup                                                                          524 B         102 kB
├ ƒ /api/stripe/webhook                                                                                     524 B         102 kB
├ ƒ /api/track-click                                                                                        524 B         102 kB
├ ƒ /api/waitlist                                                                                           524 B         102 kB
├ ƒ /api/workshop-agents/run                                                                                524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/comments                                                                  524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/comments/[commentId]                                                      524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/comments/[commentId]/material                                             524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/comments/[commentId]/upvotes                                              524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/connect                                                                   524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/feedback                                                                  524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/hosted-recording/[revisionId]                                             524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/hosted-recording/[revisionId]/[role]                                      524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/materials/[materialId]/preview                                            524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership                                                                524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership/cancellation                                                   524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership/checkout                                                       524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership/checkout/confirmation                                          524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership/portal                                                         524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/participant                                                               524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/participants/[participantId]                                              524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/polls/[pollId]/options/[optionId]                                         524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/polls/[pollId]/votes                                                      524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/presence                                                                  524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/reactions                                                                 524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/repository                                                                524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/repository/preview                                                        524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/state                                                                     524 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/wrap-up                                                                   524 B         102 kB
├ ƒ /api/workshops/komunita/projects                                                                        524 B         102 kB
├ ƒ /api/workshops/komunita/projects/[projectId]                                                            524 B         102 kB
├ ƒ /api/workshops/komunita/projects/[projectId]/connect                                                    524 B         102 kB
├ ƒ /api/workshops/komunita/projects/[projectId]/vote                                                       524 B         102 kB
├ ƒ /api/workshops/komunita/projects/preview                                                                524 B         102 kB
├ ƒ /branding                                                                                             4.75 kB         135 kB
├ ○ /branding/opengraph-image                                                                               524 B         102 kB
├ ƒ /contact                                                                                              2.55 kB         158 kB
├ ○ /contact/opengraph-image                                                                                524 B         102 kB
├ ƒ /cs                                                                                                     179 B         244 kB
├ ƒ /cs/komunita                                                                                            242 B         338 kB
├ ƒ /cs/komunita/calendar.ics                                                                               524 B         102 kB
├ ƒ /cs/komunita/clenstvi                                                                                 13.2 kB         149 kB
├ ○ /cs/komunita/clenstvi/opengraph-image                                                                   524 B         102 kB
├ ○ /cs/komunita/opengraph-image                                                                            524 B         102 kB
├ ƒ /cs/komunita/projects                                                                                  4.6 kB         143 kB
├ ƒ /cs/komunita/projects/[projectId]                                                                     2.96 kB         335 kB
├ ƒ /cs/komunita/projects/[projectId]/opengraph-image                                                       524 B         102 kB
├ ○ /cs/komunita/projects/opengraph-image                                                                   524 B         102 kB
├ ƒ /cs/obchodni-podminky                                                                                 2.53 kB         133 kB
├ ○ /cs/obchodni-podminky/opengraph-image                                                                   524 B         102 kB
├ ƒ /cs/ochrana-osobnich-udaju                                                                            2.53 kB         133 kB
├ ○ /cs/ochrana-osobnich-udaju/opengraph-image                                                              524 B         102 kB
├ ƒ /cs/online-workshop                                                                                   10.5 kB         264 kB
├ ƒ /cs/online-workshop/dekujeme                                                                          4.43 kB         154 kB
├ ○ /cs/online-workshop/dekujeme/opengraph-image                                                            524 B         102 kB
├ ○ /cs/online-workshop/opengraph-image                                                                     524 B         102 kB
├ ƒ /cs/online-workshop/participant                                                                       3.12 kB         335 kB
├ ○ /cs/online-workshop/participant/opengraph-image                                                         524 B         102 kB
├ ○ /cs/opengraph-image                                                                                     524 B         102 kB
├ ƒ /cs/pavol                                                                                               160 B         156 kB
├ ○ /cs/pavol/opengraph-image                                                                               524 B         102 kB
├ ƒ /cs/pro-firmy                                                                                           179 B         244 kB
├ ○ /cs/pro-firmy/opengraph-image                                                                           524 B         102 kB
├ ƒ /cs/whitepaper                                                                                          160 B         169 kB
├ ƒ /cs/whitepaper/download                                                                                 524 B         102 kB
├ ○ /cs/whitepaper/opengraph-image                                                                          524 B         102 kB
├ ƒ /data-deletion                                                                                        2.53 kB         133 kB
├ ○ /data-deletion/opengraph-image                                                                          524 B         102 kB
├ ƒ /dekujeme                                                                                             4.04 kB         153 kB
├ ○ /dekujeme/opengraph-image                                                                               524 B         102 kB
├ ƒ /en                                                                                                     182 B         244 kB
├ ○ /en/opengraph-image                                                                                     524 B         102 kB
├ ƒ /en/pavol                                                                                               160 B         156 kB
├ ○ /en/pavol/opengraph-image                                                                               524 B         102 kB
├ ƒ /en/privacy-policy                                                                                    2.53 kB         133 kB
├ ○ /en/privacy-policy/opengraph-image                                                                      524 B         102 kB
├ ƒ /en/terms-and-conditions                                                                              2.53 kB         133 kB
├ ○ /en/terms-and-conditions/opengraph-image                                                                524 B         102 kB
├ ƒ /en/whitepaper                                                                                          160 B         169 kB
├ ƒ /en/whitepaper/download                                                                                 524 B         102 kB
├ ○ /en/whitepaper/opengraph-image                                                                          524 B         102 kB
├ ƒ /for-agro                                                                                             5.59 kB         270 kB
├ ○ /for-agro/opengraph-image                                                                               524 B         102 kB
├ ƒ /for-industry                                                                                          6.3 kB         271 kB
├ ○ /for-industry/opengraph-image                                                                           524 B         102 kB
├ ƒ /hackathon-factory                                                                                      15 kB         246 kB
├ ○ /hackathon-factory/opengraph-image                                                                      524 B         102 kB
├ ƒ /k/[...shortFileUrlParts]                                                                               524 B         102 kB
├ ○ /manifest.webmanifest                                                                                   524 B         102 kB
├ ƒ /old                                                                                                  21.1 kB         248 kB
├ ○ /opengraph-image                                                                                        524 B         102 kB
├ ƒ /pavol                                                                                                  524 B         102 kB
├ ƒ /privacy                                                                                                524 B         102 kB
├ ƒ /pro-firmy                                                                                              524 B         102 kB
├ ƒ /pro-mesta                                                                                            4.67 kB         270 kB
├ ○ /pro-mesta/opengraph-image                                                                              524 B         102 kB
├ ○ /robots.txt                                                                                             524 B         102 kB
├ ƒ /shortener                                                                                              524 B         102 kB
├ ○ /sitemap.xml                                                                                            524 B         102 kB
├ ƒ /skoleni                                                                                                524 B         102 kB
├ ƒ /terms                                                                                                  524 B         102 kB
├ ƒ /test/hopko                                                                                           4.62 kB         106 kB
└ ○ /test/hopko/opengraph-image                                                                             524 B         102 kB
+ First Load JS shared by all                                                                              102 kB
  ├ chunks/1684-5ee3e10e7027784a.js                                                                       45.8 kB
  ├ chunks/4bd1b696-98e5f42b448df367.js                                                                   53.3 kB
  └ other shared chunks (total)                                                                           2.83 kB


ƒ Middleware                                                                                              35.3 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand


> promptbook-landing-page@0.1.0 test-e2e
> playwright test

[WebServer] Database migrations skipped: DATABASE_URL is not configured.

Running 187 tests using 1 worker

  ✓    1 tests\e2e\admin-autosave.spec.ts:52:5 › autosaves edits in order, protects reload while pending, and waits before navigating (24.2s)
  ✓    2 tests\e2e\admin-autosave.spec.ts:92:5 › retains a failed edit and retries it without leaving the settings (9.0s)
  ✓    3 tests\e2e\admin-autosave.spec.ts:109:5 › keeps invalid settings open and saves corrected settings before signing out (7.5s)
  ✓    4 tests\e2e\admin-modals.spec.ts:24:9 › edits and creates contacts in keyboard-accessible dialogs at 1440px (8.0s)
  ✓    5 tests\e2e\admin-modals.spec.ts:24:9 › edits and creates contacts in keyboard-accessible dialogs at 390px (4.2s)
  ✓    6 tests\e2e\admin-modals.spec.ts:77:5 › keeps failed discount creation visible in its dialog and autosaves later edits there (3.0s)
  ✓    7 tests\e2e\cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /cs (7.9s)
  ✓    8 tests\e2e\cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /en (6.4s)
  ✓    9 tests\e2e\cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /cs/ochrana-osobnich-udaju (5.8s)
  ✓   10 tests\e2e\cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /cs/komunita (10.6s)
  ✓   11 tests\e2e\cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /ai-supervize (7.8s)
  ✓   12 tests\e2e\cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /ai-supervize-mini (7.1s)
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2122091 bytes)]
  ✓   13 tests\e2e\cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /ai-ta-krajta (7.0s)
  ✓   14 tests\e2e\cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /admin/login (2.5s)
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2132578 bytes)]
  ✓   15 tests\e2e\cookie-consent.spec.ts:64:5 › cookie choices persist and the privacy link reopens settings after client navigation (6.3s)
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2126831 bytes)]
  ✓   16 tests\e2e\cookie-consent.spec.ts:93:5 › cookie panel and coder badge clear a player opened later, resized and closed (5.2s)
  ✓   17 tests\e2e\cookie-consent.spec.ts:124:5 › a booking notice leaves cookie choices clickable and the footer can be scrolled clear (5.7s)
  ✓   18 tests\e2e\participant-promotion.spec.ts:50:9 › refreshes an author's pending total and submissions after trust on /cs/online-workshop/participant (6.4s)
  ✓   19 tests\e2e\participant-promotion.spec.ts:50:9 › refreshes an author's pending total and submissions after trust on /cs/komunita (5.7s)
  ✓   20 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /cs (2.7s)
  ✓   21 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /en (2.9s)
  ✓   22 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /cs/pro-firmy (5.6s)
  ✓   23 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /pro-mesta (8.1s)
  ✓   24 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /for-agro (4.7s)
  ✓   25 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /for-industry (5.7s)
  ✓   26 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /ai-supervize (3.3s)
  ✓   27 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /ai-supervize-mini (4.2s)
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2124920 bytes)]
  ✓   28 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /ai-ta-krajta (2.8s)
  ✓   29 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /ai-ta-krajta/media-kit (4.9s)
  ✓   30 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /ai-ta-krajta/branding (4.9s)
  ✓   31 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /hackathon-factory (5.0s)
  ✓   32 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /cs/online-workshop (7.0s)
  ✓   33 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /cs/komunita/clenstvi (6.8s)
  ✓   34 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /cs/pavol (5.6s)
  ✓   35 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /en/pavol (5.1s)
  ✓   36 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /cs/ochrana-osobnich-udaju (2.2s)
  ✓   37 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /en/privacy-policy (5.6s)
  ✓   38 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /cs/obchodni-podminky (5.3s)
  ✓   39 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /en/terms-and-conditions (4.4s)
  ✓   40 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /contact (5.7s)
  ✓   41 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /branding (7.8s)
  ✓   42 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /data-deletion (4.8s)
  ✓   43 tests\e2e\public-pages.spec.ts:138:9 › public landing and information page loads: /old (6.1s)
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2128120 bytes)]
  ✓   44 tests\e2e\public-pages.spec.ts:143:5 › AI ta Krajta collaboration section deep-links to its media kit (4.5s)
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2127092 bytes)]
  ✓   45 tests\e2e\public-pages.spec.ts:154:5 › AI ta Krajta owns its metadata, icon and installable manifest and credits Promptbook coder (13.5s)
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2135360 bytes)]
  ✓   46 tests\e2e\public-pages.spec.ts:250:5 › AI ta Krajta searches complete transcripts on the server without sending them to the browser (6.4s)
  ✓   47 tests\e2e\public-pages.spec.ts:268:9 › public address redirects to its page: / (24ms)
  ✓   48 tests\e2e\public-pages.spec.ts:268:9 › public address redirects to its page: /pro-firmy (2.6s)
  ✓   49 tests\e2e\public-pages.spec.ts:268:9 › public address redirects to its page: /pavol (19ms)
  ✓   50 tests\e2e\public-pages.spec.ts:268:9 › public address redirects to its page: /privacy (2.9s)
  ✓   51 tests\e2e\public-pages.spec.ts:268:9 › public address redirects to its page: /terms (3.0s)
  ✓   52 tests\e2e\public-pages.spec.ts:268:9 › public address redirects to its page: /skoleni (2.9s)
  ✓   53 tests\e2e\public-pages.spec.ts:282:5 › /skoleni carries a discount code to the workshop registration (138ms)
  ✓   54 tests\e2e\public-submissions.spec.ts:13:5 › submits the shared footer newsletter form (43.7s)
  ✓   55 tests\e2e\public-submissions.spec.ts:27:5 › submits the reusable get-started lead dialog (33.9s)
  ✓   56 tests\e2e\public-submissions.spec.ts:41:5 › submits the business lead dialog (5.0s)
  ✓   57 tests\e2e\public-submissions.spec.ts:55:5 › submits the homepage qualification lead flow (19.7s)
  ✓   58 tests\e2e\public-submissions.spec.ts:80:5 › submits Pavol’s personal contact form (5.4s)
  ✓   59 tests\e2e\public-submissions.spec.ts:96:5 › submits a published online-workshop registration (20.6s)
  ✓   60 tests\e2e\public-submissions.spec.ts:116:5 › personalizes and submits the 199 Kč Promptbook paid community membership (15.2s)
  -   61 tests\e2e\public-submissions.spec.ts:143:5 › submits an available AI Supervize Mini workshop registration
  ✓   62 tests\e2e\public-submissions.spec.ts:171:5 › submits the AI Supervize Mini future-term interest form (4.1s)
  ✓   63 tests\e2e\public-submissions.spec.ts:196:5 › submits the AI ta Krajta collaboration form (4.7s)
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2127599 bytes)]
  ✓   64 tests\e2e\public-submissions.spec.ts:211:5 › plays the newest AI ta Krajta episode from the header (3.8s)
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2131533 bytes)]
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2142129 bytes)]
  ✓   65 tests\e2e\public-submissions.spec.ts:220:5 › resumes a half-played AI ta Krajta episode where its listener left it (5.8s)
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2129832 bytes)]
  ✓   66 tests\e2e\public-submissions.spec.ts:254:5 › starts the AI ta Krajta minigame from its snake and keeps it local to the page (4.5s)
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2123432 bytes)]
  ✓   67 tests\e2e\public-submissions.spec.ts:268:5 › filters the AI ta Krajta archive by a person and keeps its destination in the hash (4.1s)
  -   68 tests\e2e\public-submissions.spec.ts:280:5 › connects a public online-workshop participant
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓   69 tests\e2e\recording-studio.spec.ts:242:5 › requires admin authentication for the recording studio (21.1s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓   70 tests\e2e\recording-studio.spec.ts:247:5 › keeps the active Studio owner and capture across its recording and editor sections (13.8s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓   71 tests\e2e\recording-studio.spec.ts:262:5 › requires admin authentication for a stable recording workspace address (6.6s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓   72 tests\e2e\recording-studio.spec.ts:267:5 › requires admin authentication before accepting browser-local transcription audio (4.8s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓   73 tests\e2e\recording-studio.spec.ts:274:5 › persists reviewed workshop annotations and rebases them beside every prepared source (19.9s)
  ✓   74 tests\e2e\recording-studio.spec.ts:317:5 › aligns reviewed workshop events, activity, scenes and Git anchors with prepared appended-take sources (10.6s)
  ✓   75 tests\e2e\recording-studio.spec.ts:380:5 › generates separate Czech subtitles and speech activity from chosen camera and microphone audio (13.8s)
  ✓   76 tests\e2e\recording-studio.spec.ts:445:5 › keeps a caption returned by only one long-audio chunk at the overlap boundary (7.2s)
  ✓   77 tests\e2e\recording-studio.spec.ts:500:5 › checks actual legacy audio despite incorrect saved flags (8.5s)
  ✓   78 tests\e2e\recording-studio.spec.ts:535:5 › keeps caption corrections through retry, cancellation and a stale generation (6.8s)
  ✓   79 tests\e2e\recording-studio.spec.ts:598:5 › synchronizes rendered timecodes, monitoring and prepared separate-source files (27.5s)
  ✓   80 tests\e2e\recording-studio.spec.ts:712:5 › keeps late session gaps, local missing media, autosave failure and retry honest (14.3s)
  ✓   81 tests\e2e\recording-studio.spec.ts:765:5 › recovers a corrupt preview and cancels preparation without losing originals (11.4s)
  ✓   82 tests\e2e\recording-studio.spec.ts:831:5 › prepares the full boundary of a variable-frame-rate camera with its audio and explicit cadence (5.7s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓   83 tests\e2e\recording-studio.spec.ts:850:5 › plain capture diagnostic requests a user-selected display without studio preferences (18.9s)
  ✓   84 tests\e2e\recording-studio.spec.ts:862:5 › records separate sources, restores them, trims every track and exports playable editor material (44.9s)
  ✓   85 tests\e2e\recording-studio.spec.ts:989:5 › keeps all three sources through monitor layouts, global pauses and an appended take (49.0s)
  ✓   86 tests\e2e\recording-studio.spec.ts:1188:5 › keeps a multi-source setup through stops, release, and reload without restoring capture (14.4s)
  ✓   87 tests\e2e\recording-studio.spec.ts:1390:5 › counts a test alert down for five seconds and then announces it exactly once (API-path check) (11.8s)
  ✓   88 tests\e2e\recording-studio.spec.ts:1434:5 › schedules one test from repeated clicks and announces nothing after Zrušit test (API-path check) (18.2s)
  ✓   89 tests\e2e\recording-studio.spec.ts:1460:5 › runs a test alert during a recording without stopping, failing or changing the take (API-path check) (14.0s)
  ✓   90 tests\e2e\recording-studio.spec.ts:1492:5 › announces a real failure at once while a test alert is still counting down (API-path check) (12.9s)
  ✓   91 tests\e2e\recording-studio.spec.ts:1523:5 › keeps a pending test alert through a change of studio view and fires it once (API-path check) (18.1s)
  ✓   92 tests\e2e\recording-studio.spec.ts:1548:5 › cancels a pending test alert the moment the administrator signs out (API-path check) (10.3s)
  ✓   93 tests\e2e\recording-studio.spec.ts:1566:5 › asks for the notification permission by the click and starts the countdown only after the answer (API-path check) (10.7s)
  ✓   94 tests\e2e\recording-studio.spec.ts:1590:5 › tells a refused dispatch, a failed display and a revoked permission apart without losing the alert (API-path check) (19.7s)
  ✓   95 tests\e2e\recording-studio.spec.ts:1626:5 › reports notifications the browser really blocks and still tests the sound and the page (8.3s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓   96 tests\e2e\recording-studio.spec.ts:1643:5 › counts a test alert down on a hidden studio page and hands exactly one notification to the real browser API (24.7s)
  ✓   97 tests\e2e\recording-studio.spec.ts:1694:5 › keeps the other tracks recording when one source is disconnected and alerts about the loss (9.7s)
  ✓   98 tests\e2e\recording-studio.spec.ts:1734:5 › announces a lost source and a refused storage write from a hidden studio page through the real browser API (10.5s)
  ✓   99 tests\e2e\recording-studio.spec.ts:1801:5 › blocks Start when a live camera preview loses its required microphone input (3.3s)
  ✓  100 tests\e2e\recording-studio.spec.ts:1822:5 › shows a muted display source as temporarily unavailable and requests reconnection (3.4s)
  ✓  101 tests\e2e\recording-studio.spec.ts:1844:5 › reports a display track that is already muted when selection returns (3.2s)
  ✓  102 tests\e2e\recording-studio.spec.ts:1856:5 › keeps the Space guidance available when reusing a historic screen-source configuration (6.3s)
  ✓  103 tests\e2e\recording-studio.spec.ts:1875:5 › restores source preferences after closing and reopening the same browser profile (20.3s)
  ✓  104 tests\e2e\recording-studio.spec.ts:1930:5 › retains a cancelled display-selection intent and retries it only from a new user action (3.5s)
  ✓  105 tests\e2e\recording-studio.spec.ts:1962:5 › retains a failed camera-plus-microphone request and lets the owner explicitly retry without sound (6.2s)
  ✓  106 tests\e2e\recording-studio.spec.ts:2000:5 › stops the whole take once every source has disconnected and prevents a second tab from changing it (10.0s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  107 tests\e2e\recording-studio.spec.ts:2017:5 › recovers persisted chunks after an interrupted page and waits for stop before admin navigation (50.5s)
  ✓  108 tests\e2e\recording-studio.spec.ts:2044:5 › explains constant 10 GiB estimates while committed multi-source bytes and bitrate update (10.0s)
  ✓  109 tests\e2e\recording-studio.spec.ts:2074:5 › records with missing estimate and persistence APIs and downloads individual originals (5.4s)
  ✓  110 tests\e2e\recording-studio.spec.ts:2093:5 › records, pauses, reloads, previews and exports a multi-track take without ever offering or opening a recording folder (15.7s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  111 tests\e2e\recording-studio.spec.ts:2155:5 › starts without a take once recorded into a folder, asks for no folder and keeps a browser-local take exportable (8.6s)
  ✓  112 tests\e2e\recording-studio.spec.ts:2221:5 › hands over one indexed original by both export paths, and the recorder's own bytes when no working file can be written (10.0s)
  ✓  113 tests\e2e\recording-studio.spec.ts:2256:5 › keeps committed multi-source data after a real IndexedDB transaction abort and offers recovery (12.1s)
  ✓  114 tests\e2e\recording-studio.spec.ts:2303:5 › studio takeover confirmation cancellation leaves the actual owner and recording untouched (9.1s)
  ✓  115 tests\e2e\recording-studio.spec.ts:2321:9 › studio takeover from a idle owner releases all tracks and reopens committed media without refreshing either tab (11.1s)
  ✓  116 tests\e2e\recording-studio.spec.ts:2321:9 › studio takeover from a recording owner releases all tracks and reopens committed media without refreshing either tab (20.9s)
  ✓  117 tests\e2e\recording-studio.spec.ts:2321:9 › studio takeover from a paused owner releases all tracks and reopens committed media without refreshing either tab (14.2s)
  ✓  118 tests\e2e\recording-studio.spec.ts:2372:5 › studio takeover serializes two simultaneous requesting tabs and repeated handovers with real Web Locks (11.2s)
  ✓  119 tests\e2e\recording-studio.spec.ts:2396:5 › studio forced takeover fences a frozen recording owner and stops its capture when it resumes (16.1s)
  ✓  120 tests\e2e\recording-studio.spec.ts:2430:5 › studio forced takeover rejects a suspended media transaction at the native commit boundary (17.2s)
  ✓  121 tests\e2e\recording-studio.spec.ts:2475:5 › studio takeover refuses failed editor saves, keeps the draft in A, and requires explicit discard in B (9.3s)
  ✓  122 tests\e2e\recording-studio.spec.ts:2503:5 › studio takeover waits for an admitted editor save and reloads its acknowledged title and selection (9.5s)
  ✓  123 tests\e2e\recording-studio.spec.ts:2539:5 › studio takeover reports a failed final checkpoint instead of a clean release and can recover through fencing (9.8s)
  ✓  124 tests\e2e\recording-studio.spec.ts:2565:9 › studio takeover waits for the pausing transition and final real recorder events before recovery (9.6s)
  ✓  125 tests\e2e\recording-studio.spec.ts:2565:9 › studio takeover waits for the stopping transition and final real recorder events before recovery (9.5s)
  ✓  126 tests\e2e\recording-studio.spec.ts:2597:5 › studio takeover cancelled while a frozen owner is delayed ignores the late request when A resumes (13.1s)
  ✓  127 tests\e2e\recording-studio.spec.ts:2616:5 › studio takeover acquires the actual released lock when a frozen recording owner closes mid-request (11.2s)
  ✓  128 tests\e2e\recording-studio.spec.ts:2635:5 › studio takeover settles an in-progress Start before granting the waiting tab authority (7.6s)
  ✓  129 tests\e2e\recording-studio.spec.ts:2661:5 › studio takeover cancels an export waiting for its destination and preserves the saved selection (9.0s)
  ✓  130 tests\e2e\recording-studio.spec.ts:2683:5 › studio takeover waits for an acknowledged upload request and preserves resumable revision metadata (8.9s)
  ✓  131 tests\e2e\recording-studio.spec.ts:2720:5 › studio forced takeover refuses persisted external uncertainty and leaves the real owner lock intact (14.0s)
  ✓  132 tests\e2e\room-theme.spec.ts:96:5 › shares a saved room appearance, follows the device, and preserves the waiting-room form (26.3s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  133 tests\e2e\room-theme.spec.ts:141:5 › themes connected rooms, materials, and portalled dialogs on desktop and mobile without losing drafts (37.3s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  134 tests\e2e\sharing-previews.spec.ts:21:9 › shares the correct PNG and public metadata: ptbk.io/cs (17.1s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  135 tests\e2e\sharing-previews.spec.ts:21:9 › shares the correct PNG and public metadata: ptbk.io/en (16.8s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  136 tests\e2e\sharing-previews.spec.ts:21:9 › shares the correct PNG and public metadata: ptbk.io/cs/whitepaper (30.4s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  137 tests\e2e\sharing-previews.spec.ts:21:9 › shares the correct PNG and public metadata: ptbk.io/en/whitepaper (14.1s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  138 tests\e2e\sharing-previews.spec.ts:21:9 › shares the correct PNG and public metadata: ptbk.io/cs/pro-firmy (17.8s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  139 tests\e2e\sharing-previews.spec.ts:21:9 › shares the correct PNG and public metadata: ptbk.io/contact (11.6s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  140 tests\e2e\sharing-previews.spec.ts:21:9 › shares the correct PNG and public metadata: ptbk.io/en/privacy-policy (13.4s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  141 tests\e2e\sharing-previews.spec.ts:21:9 › shares the correct PNG and public metadata: ptbk.io/cs/komunita/projects (30.0s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  142 tests\e2e\sharing-previews.spec.ts:21:9 › shares the correct PNG and public metadata: ptbk.io/cs/online-workshop/participant (14.7s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  143 tests\e2e\sharing-previews.spec.ts:21:9 › shares the correct PNG and public metadata: ai-ta-krajta.cz/media-kit (13.9s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  144 tests\e2e\sharing-previews.spec.ts:21:9 › shares the correct PNG and public metadata: ai-ta-krajta.cz/branding (9.1s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  145 tests\e2e\sharing-previews.spec.ts:21:9 › shares the correct PNG and public metadata: pavolhejny.cz/ (8.8s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  146 tests\e2e\sharing-previews.spec.ts:21:9 › shares the correct PNG and public metadata: pavolhejny.com/ (9.3s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  147 tests\e2e\studio-projects.spec.ts:77:5 › Studio creates an editor-only project and imports a read-only file without capture or browser-media copies (31.0s)
  -  148 tests\e2e\studio-projects.spec.ts:107:5 › Studio seeks a real five-hour three-part/four-track assembly with bounded active decoders
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✘  149 tests\e2e\studio-projects.spec.ts:266:5 › Studio opens a finalized multitrack recording without copying, renders saved composition, settles joins and reopens the same project (15.0s)
  ✓  150 tests\e2e\studio-projects.spec.ts:266:5 › Studio opens a finalized multitrack recording without copying, renders saved composition, settles joins and reopens the same project (retry #1) (18.8s)
  ✓  151 tests\e2e\studio-projects.spec.ts:398:5 › Studio progressively seeks URL media, diagnoses CORS/range/authorization failures and explicitly relinks the same source (10.1s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  152 tests\e2e\studio-projects.spec.ts:488:5 › Studio authenticates project links and preserves legacy recording identities through permanent redirects (30.2s)
  -  153 tests\e2e\studio-projects.spec.ts:509:5 › Studio seeks a long unindexed recorder container directly from its existing IndexedDB media
  ✓  154 tests\e2e\whitepaper.spec.ts:11:5 › keeps APT selection controls disabled until their first interaction can be handled (3.1s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  155 tests\e2e\whitepaper.spec.ts:37:9 › explains APT, verifies before accepting, and keeps external effects after a revert (cs) (10.2s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  156 tests\e2e\whitepaper.spec.ts:37:9 › explains APT, verifies before accepting, and keeps external effects after a revert (en) (10.2s)
  ✓  157 tests\e2e\whitepaper.spec.ts:117:5 › works on a phone with keyboard controls, reduced motion, and shared chapter language links (5.8s)
  ✓  158 tests\e2e\whitepaper.spec.ts:152:5 › delivers the complete paper and native reading controls without JavaScript (1.9s)
  ✓  159 tests\e2e\workshop-agents.spec.ts:34:9 › defines a Book agent in the workshop administration (6.3s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  160 tests\e2e\workshop-agents.spec.ts:34:9 › defines a Book agent in the community administration (47.6s)
  ✓  161 tests\e2e\workshop-material-order.spec.ts:66:5 › material ordering supports mouse, touch, and keyboard and keeps the saved order after reload (14.9s)
  ✓  162 tests\e2e\workshop-repository-range.spec.ts:31:5 › edits independent commit bounds in workshop settings (4.9s)
  ✓  163 tests\e2e\workshop-repository-range.spec.ts:67:5 › previews the deployed app while browsing the highlighted workshop range (4.6s)
  ✓  164 tests\e2e\workshop-subtitles.spec.ts:63:5 › imports, autosaves, reloads and downloads private subtitles through the shared admin editor (8.2s)
  ✓  165 tests\e2e\workshop-subtitles.spec.ts:107:5 › decodes a long recording into bounded audio chunks and preserves multilingual timestamps (6.2s)
  ✓  166 tests\e2e\workshop-vercel-deployment.spec.ts:31:9 › deploys a workshop project and saves its ready URL through the existing settings form (8.9s)
  ✓  167 tests\e2e\workshop-vercel-deployment.spec.ts:31:9 › shows Vercel failure details and guidance, then saves the URL after retrying (11.7s)
  ✓  168 tests\e2e\workshop-wrap-up-pdf.spec.ts:34:5 › downloads the branded recap in the browser with local fonts, project preview, Git graph and short-link QR (7.9s)
  ✓  169 tests\e2e\pavol-personal.spec.ts:21:9 › pavolhejny.cz supports keyboard navigation on a narrow screen (2.9s)
  ✓  170 tests\e2e\pavol-personal.spec.ts:61:9 › pavolhejny.cz preserves a custom enquiry through service changes and a failed submission (9.9s)
  ✓  171 tests\e2e\pavol-personal.spec.ts:129:13 › pavolhejny.cz without JavaScript › keeps its content and media archive readable (1.3s)
  ✓  172 tests\e2e\pavol-personal.spec.ts:21:9 › pavolhejny.com supports keyboard navigation on a narrow screen (2.7s)
  ✓  173 tests\e2e\pavol-personal.spec.ts:61:9 › pavolhejny.com preserves a custom enquiry through service changes and a failed submission (9.8s)
  ✓  174 tests\e2e\pavol-personal.spec.ts:129:13 › pavolhejny.com without JavaScript › keeps its content and media archive readable (1.3s)
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2122763 bytes)]
  ✓  175 tests\e2e\public-domains.spec.ts:82:17 › isolated public domains › ai-ta-krajta.cz serves its own page and branded 404s at the requested URL (3.1s)
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2121985 bytes)]
  ✓  176 tests\e2e\public-domains.spec.ts:82:17 › isolated public domains › www.ai-ta-krajta.cz serves its own page and branded 404s at the requested URL (4.5s)
  ✓  177 tests\e2e\public-domains.spec.ts:82:17 › isolated public domains › pavolhejny.cz serves its own page and branded 404s at the requested URL (2.7s)
  ✓  178 tests\e2e\public-domains.spec.ts:82:17 › isolated public domains › www.pavolhejny.cz serves its own page and branded 404s at the requested URL (2.6s)
  ✓  179 tests\e2e\public-domains.spec.ts:82:17 › isolated public domains › pavolhejny.com serves its own page and branded 404s at the requested URL (2.7s)
  ✓  180 tests\e2e\public-domains.spec.ts:82:17 › isolated public domains › www.pavolhejny.com serves its own page and branded 404s at the requested URL (2.5s)
  ✓  181 tests\e2e\public-domains.spec.ts:114:9 › isolated public domains › podcast paths on its apex keep Promptbook-only and file-looking pages isolated (796ms)
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2125599 bytes)]
  ✓  182 tests\e2e\public-domains.spec.ts:132:9 › isolated public domains › a locally mapped branded hostname loads Next assets and hydrates its controls (3.5s)
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2124028 bytes)]
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2125496 bytes)]
  ✓  183 tests\e2e\public-domains.spec.ts:146:9 › isolated public domains › subscribes from the podcast section and footer on mobile without interrupting playback or page state (9.5s)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  184 tests\e2e\public-domains.spec.ts:200:13 › isolated public domains › ptbk.io still serves Promptbook pages and redirects only its own legacy paths (20.0s)
  ✓  185 tests\e2e\public-domains.spec.ts:200:13 › isolated public domains › www.ptbk.io still serves Promptbook pages and redirects only its own legacy paths (4.3s)
  ✓  186 tests\e2e\public-domains.spec.ts:220:9 › isolated public domains › legacy redirects retain suffixes, slashes and queries, then unknown children receive a branded 404 (150ms)
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
[WebServer]  ⚠ ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
[WebServer] 
[WebServer] Import trace for requested module:
[WebServer] ./node_modules/onnxruntime-web/dist/ort.min.js
[WebServer] ./node_modules/@ricky0123/vad-web/dist/non-real-time-vad.js
[WebServer] ./lib/recording-studio/recordingStudioDerivedGeneration.ts
[WebServer] ./components/recording-studio/RecordingDerivedEditor.tsx
[WebServer] ./components/recording-studio/RecordingEditor.tsx
[WebServer] ./components/recording-studio/RecordingStudio.tsx
  ✓  187 tests\e2e\public-domains.spec.ts:258:9 › isolated public domains › site metadata, shared files and required APIs remain available on their domains (26.1s)
[WebServer] Failed to set fetch cache https://www.youtube.com/@aitakrajta_tv/about [Error: Failed to set Next.js data cache, items over 2MB can not be cached (2123520 bytes)]
  ✓  188 tests\e2e\public-domains.spec.ts:303:9 › isolated public domains › visible cross-site links use canonical destinations (6.8s)
Saved 200 E2E video(s) to tests/e2e/videos/.
Removed the E2E video(s) of 1 outdated run(s) from tests/e2e/videos/.


  1) tests\e2e\studio-projects.spec.ts:266:5 › Studio opens a finalized multitrack recording without copying, renders saved composition, settles joins and reopens the same project 

    Error: expect(received).toBeGreaterThan(expected)

    Expected: > 0
    Received:   0

      327 |             return { maximumDeviationSeconds: Math.max(0, ...deviations), readyCount: deviations.length };
      328 |         }, seconds);
    > 329 |         expect(result.readyCount).toBeGreaterThan(0);
          |                                   ^
      330 |         expect(result.maximumDeviationSeconds).toBeLessThanOrEqual(0.1);
      331 |         deviations.push({ seconds, maximumDeviationSeconds: result.maximumDeviationSeconds });
      332 |     }
        at C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron\tests\e2e\studio-projects.spec.ts:329:35

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    tests\e2e\.artifacts\studio-projects-Studio-ope-45402-nd-reopens-the-same-project\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    tests\e2e\.artifacts\studio-projects-Studio-ope-45402-nd-reopens-the-same-project\video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: tests\e2e\.artifacts\studio-projects-Studio-ope-45402-nd-reopens-the-same-project\error-context.md

    attachment #4: trace (application/zip) ─────────────────────────────────────────────────────────
    tests\e2e\.artifacts\studio-projects-Studio-ope-45402-nd-reopens-the-same-project\trace.zip
    Usage:

        npx playwright show-trace tests\e2e\.artifacts\studio-projects-Studio-ope-45402-nd-reopens-the-same-project\trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

  Slow test file: tests\e2e\recording-studio.spec.ts (14.1m)
  Consider running tests from slow files in parallel. See: https://playwright.dev/docs/test-parallel
  1 flaky
    tests\e2e\studio-projects.spec.ts:266:5 › Studio opens a finalized multitrack recording without copying, renders saved composition, settles joins and reopens the same project 
  4 skipped
  182 passed (33.5m)

> promptbook-landing-page@0.1.0 delete-test-data
> tsx scripts/delete-test-data.ts

Deleted 11 Contact row(s) and 0 workshop participant row(s) with an @example.com e-mail address.

=== check shell finished at 2026-10-07T10:51:17.042Z ===
Status: succeeded
````
