# Run trace of `prompts/2026-09-0171-freshly-upcomming-events.md#24`

-   **Prompt:** Alongside the "Tento týden" badge add "Dneska" and "Zítra" badges
-   **Prompt section:** 3 of 3
-   **Outcome:** Succeeded
-   **Runner:** Developer on OpenAI Codex `gpt-6-astra` thinking `max` (ChatGPT account)
-   **Attempts:** 1
-   **Steps:** Implementation ~$0.2721 6 minutes; Testing 5 minutes
-   **Verification command:** `npm run test-for-ptbk-coder`
-   **Started:** 2026-09-21T14:16:33.638Z
-   **Finished:** 2026-09-21T14:27:44.414Z
-   **Duration:** 11 minutes

## Runtime log

````text
=== runner shell started at 2026-09-21T14:16:33.685Z ===
Script path: /Users/hejny/work/aldaron/.promptbook/coder-prompts/2026-09-0171-freshly-upcomming-events-3.sh

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

Alongside the "Tento týden" badge add "Dneska" and "Zítra" badges

![alt text](prompts/screenshots/2026-09-0171-freshly-upcomming-events-1.png)
![alt text](prompts/screenshots/2026-09-0171-freshly-upcomming-events-2.png)

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
session id: 01a0c453-6153-79b1-af2b-e57ba0428d09
--------
user

## Your Task

Alongside the "Tento týden" badge add "Dneska" and "Zítra" badges

![alt text](prompts/screenshots/2026-09-0171-freshly-upcomming-events-1.png)
![alt text](prompts/screenshots/2026-09-0171-freshly-upcomming-events-2.png)

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
I’ll trace how “Tento týden” is chosen and add “Dneska” and “Zítra” through the shared logic so they stay consistent across event cards and calendars.

exec
/bin/zsh -lc "pwd && git status --short && rg --files -g 'AGENTS.md' -g 'package.json' -g '*workshopPhase*' -g '*freshly-upcomming-events*' -g '*Workshop*Card*' -g '*workshop*Calendar*'" in /Users/hejny/work/aldaron
 succeeded in 0ms:
/Users/hejny/work/aldaron
 M prompts/2026-09-0171-freshly-upcomming-events.md
AGENTS.md
prompts/prompts/screenshots/2026-09-0171-freshly-upcomming-events.png
prompts/prompts/screenshots/2026-09-0171-freshly-upcomming-events-1.png
prompts/prompts/screenshots/2026-09-0171-freshly-upcomming-events-2.png
prompts/2026-09-0171-freshly-upcomming-events.md
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md
prompts/traces/2026-09-0171-freshly-upcomming-events.md
package.json
lib/workshops/workshopCalendar.ts
lib/workshops/workshopPhase.ts
lib/workshops/workshopPhase.test.ts
lib/workshops/workshopCalendar.test.ts
businesses/online-workshop/participant/WorkshopRepositoryCommitCard.tsx
components/workshops/workshopPhaseAppearance.ts
components/workshops/WorkshopEventCardList.tsx
components/workshops/WorkshopProjectPreviewCard.tsx
components/workshops/WorkshopEventCard.tsx
businesses/workshop-admin/WorkshopSelectorCard.tsx
businesses/workshop-admin/WorkshopSelectorCardList.tsx
businesses/workshop-admin/WorkshopSelectorCardList.test.tsx

exec
/bin/zsh -lc "rg -n 'Tento týden|freshlyUpcoming|freshly-upcoming|freshly_upcoming|FRESHLY_UPCOMING' --glob '"'!package-lock.json'"' --glob '"'!yarn.lock'"'" in /Users/hejny/work/aldaron
 succeeded in 0ms:
AGENTS.md:24:  with: running and upcoming ones first, with a special `Tento týden` badge for a
changelog/_current-preversion.md:100:  now marked `Tento týden`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
prompts/2026-09-0171-freshly-upcomming-events.md:19:[✨🌷] Change the "Do týdne" badge to "Tento týden"
prompts/2026-09-0171-freshly-upcomming-events.md:27:[✨🌷] Alongside the "Tento týden" badge add "Dneska" and "Zítra" badges
prompts/traces/2026-09-0550-fix-the-existing-test-failures-before-implementing-any.md:337:  with: running and upcoming ones first, with a special `Tento týden` badge for a
prompts/traces/2026-09-0550-fix-the-existing-test-failures-before-implementing-any.md:988:  with: running and upcoming ones first, with a special `Tento týden` badge for a
prompts/traces/2026-09-0550-fix-the-existing-test-failures-before-implementing-any.md:1390:  with: running and upcoming ones first, with a special `Tento týden` badge for a
prompts/traces/2026-09-0410-workshop-project-auto-deployment-vercel-2.md:2014:  with: running and upcoming ones first, with a special `Tento týden` badge for a
components/workshops/workshopPhaseAppearance.ts:67:        label: 'Tento týden',
components/workshops/WorkshopLinksPanel.test.tsx:222:        expect(screen.getAllByText('Tento týden')).toHaveLength(2);
components/workshops/WorkshopLinksPanel.test.tsx:227:        expect(upcomingNextWeekCard?.textContent).toContain('Tento týden');
prompts/traces/2026-08-0530-ai-ta-krajta-27.md:158:  with: running and upcoming ones first, with a special `Tento týden` badge for a
prompts/traces/2026-08-0530-ai-ta-krajta-27.md:629:  with: running and upcoming ones first, with a special `Tento týden` badge for a
prompts/traces/2026-08-0530-ai-ta-krajta-27.md:1475:  with: running and upcoming ones first, with a special `Tento týden` badge for a
prompts/traces/2026-09-0240-wrap-up-pdf-2.md:2132:  now marked `Tento týden`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
prompts/traces/2026-09-0240-wrap-up-pdf-2.md:2235:  with: running and upcoming ones first, with a special `Tento týden` badge for a
prompts/traces/2026-09-0430-admin-modals-2.md:1516:  with: running and upcoming ones first, with a special `Tento týden` badge for a
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3:-   **Prompt:** Change the "Do týdne" badge to "Tento týden"
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:79:Change the "Do týdne" badge to "Tento týden"
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:525:Change the "Do týdne" badge to "Tento týden"
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:953:I’ll find where the badge text is defined, change it to “Tento týden,” and check the affected references.
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:975:/bin/zsh -lc "rg -n --hidden -g '"'!node_modules'"' -g '"'!.git'"' -g '"'!.next'"' 'Do týdne|do týdne|Tento týden' ." in /Users/hejny/work/aldaron
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:984:./prompts/2026-09-0171-freshly-upcomming-events.md:19:[✨🌷] Change the "Do týdne" badge to "Tento týden"
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:2799:/bin/zsh -lc "rg -n -g '"'!prompts/**'"' -g '"'!package-lock.json'"' 'Do týdne|do týdne|Tento týden' ." in /Users/hejny/work/aldaron
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:2830:+  with: running and upcoming ones first, with a special `Tento týden` badge for a
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:2843:+        ).toContain('Tento týden');
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:2856:+        expect(screen.getByRole('heading', { name: 'Tento týden (1)' })).not.toBeNull();
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:2865:+        expect(getWorkshopCards()[2].textContent).toContain('Tento týden');
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:2878:+  now marked `Tento týden`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:2891:+        expect(screen.getAllByText('Tento týden')).toHaveLength(2);
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:2897:+        expect(upcomingNextWeekCard?.textContent).toContain('Tento týden');
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:2910:+        label: 'Tento týden',
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:2924:+  with: running and upcoming ones first, with a special `Tento týden` badge for a
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:2937:+        ).toContain('Tento týden');
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:2950:+        expect(screen.getByRole('heading', { name: 'Tento týden (1)' })).not.toBeNull();
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:2959:+        expect(getWorkshopCards()[2].textContent).toContain('Tento týden');
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:2972:+  now marked `Tento týden`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:2985:+        expect(screen.getAllByText('Tento týden')).toHaveLength(2);
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:2991:+        expect(upcomingNextWeekCard?.textContent).toContain('Tento týden');
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3004:+        label: 'Tento týden',
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3025:+  with: running and upcoming ones first, with a special `Tento týden` badge for a
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3038:+        ).toContain('Tento týden');
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3051:+        expect(screen.getByRole('heading', { name: 'Tento týden (1)' })).not.toBeNull();
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3060:+        expect(getWorkshopCards()[2].textContent).toContain('Tento týden');
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3073:+  now marked `Tento týden`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3086:+        expect(screen.getAllByText('Tento týden')).toHaveLength(2);
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3092:+        expect(upcomingNextWeekCard?.textContent).toContain('Tento týden');
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3105:+        label: 'Tento týden',
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3136:+  with: running and upcoming ones first, with a special `Tento týden` badge for a
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3149:+        ).toContain('Tento týden');
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3162:+        expect(screen.getByRole('heading', { name: 'Tento týden (1)' })).not.toBeNull();
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3171:+        expect(getWorkshopCards()[2].textContent).toContain('Tento týden');
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3184:+  now marked `Tento týden`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3197:+        expect(screen.getAllByText('Tento týden')).toHaveLength(2);
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3203:+        expect(upcomingNextWeekCard?.textContent).toContain('Tento týden');
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3216:+        label: 'Tento týden',
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3237:+  with: running and upcoming ones first, with a special `Tento týden` badge for a
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3250:+        ).toContain('Tento týden');
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3263:+        expect(screen.getByRole('heading', { name: 'Tento týden (1)' })).not.toBeNull();
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3272:+        expect(getWorkshopCards()[2].textContent).toContain('Tento týden');
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3285:+  now marked `Tento týden`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3298:+        expect(screen.getAllByText('Tento týden')).toHaveLength(2);
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3304:+        expect(upcomingNextWeekCard?.textContent).toContain('Tento týden');
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3317:+        label: 'Tento týden',
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3323:Changed the shared badge text from “Do týdne” to “Tento týden” everywhere it’s used.
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3335:+  with: running and upcoming ones first, with a special `Tento týden` badge for a
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3348:+        ).toContain('Tento týden');
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3361:+        expect(screen.getByRole('heading', { name: 'Tento týden (1)' })).not.toBeNull();
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3370:+        expect(getWorkshopCards()[2].textContent).toContain('Tento týden');
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3383:+  now marked `Tento týden`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3396:+        expect(screen.getAllByText('Tento týden')).toHaveLength(2);
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3402:+        expect(upcomingNextWeekCard?.textContent).toContain('Tento týden');
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3415:+        label: 'Tento týden',
prompts/traces/2026-09-0171-freshly-upcomming-events-2.md:3422:Changed the shared badge text from “Do týdne” to “Tento týden” everywhere it’s used.
prompts/traces/2026-09-0450-preview-deployment.md:1511:  with: running and upcoming ones first, with a special `Tento týden` badge for a
prompts/traces/2026-09-0450-preview-deployment.md:2614:  now marked `Tento týden`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
prompts/traces/2026-09-0450-preview-deployment.md:4065:  now marked `Tento týden`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
prompts/traces/2026-09-0450-preview-deployment.md:6970:        expect(upcomingNextWeekCard?.textContent).toContain('Tento týden');
businesses/workshop-admin/WorkshopSelectorCardList.test.tsx:136:        expect(screen.getByRole('heading', { name: 'Tento týden (1)' })).not.toBeNull();
businesses/workshop-admin/WorkshopSelectorCardList.test.tsx:146:        expect(getWorkshopCards()[2].textContent).toContain('Tento týden');
prompts/traces/2026-09-0470-workshop-subtitles.md:1482:  with: running and upcoming ones first, with a special `Tento týden` badge for a
prompts/traces/2026-09-0470-workshop-subtitles.md:4698:  now marked `Tento týden`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx:175:        ).toContain('Tento týden');

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
  Everyone in the roster has a 320-pixel square transparent PNG in
  `public/people/ai-ta-krajta`, normalized from the show's covers or a published
  personal portrait. `aiTaKrajtaPortraits.md` records the sources and cutout workflow;
  `scripts/_cutAiTaKrajtaPeoplePortraits.mjs` prepares source crops, not final cutouts.
  The shared avatar puts every portrait over a stable, subtly varied neutral gradient.
  Card and episode buttons highlight it on hover and keyboard focus, with a small
  zoom only when reduced motion is not requested. A future person without a photo
  keeps initials on that same background. The one people list is drawn anew
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
- Recording-studio E2E sources use canvas video and synthesized audio with a silent Web Audio output, independent
  of physical audio-device clocks. Keep recording, storage, codecs, trimming, and ZIP exports real in these tests.

exec
/bin/zsh -lc 'cat components/workshops/WorkshopEventCard.tsx && cat components/workshops/WorkshopEventCardList.tsx && cat businesses/workshop-admin/WorkshopSelectorCard.tsx && cat businesses/workshop-admin/WorkshopSelectorCardList.tsx' in /Users/hejny/work/aldaron
 succeeded in 0ms:
import { Button } from '@/components/ui/button';
import { WorkshopPhaseBadge } from '@/components/workshops/WorkshopPhaseBadge';
import { WorkshopProjectPreviewCard } from '@/components/workshops/WorkshopProjectPreviewCard';
import type { CalendarDayKey } from '@/lib/calendar/calendarMonth';
import { formatCzechRelativeDayPrefix } from '@/lib/calendar/czechRelativeDay';
import type { EventListing } from '@/lib/events/eventListing';
import { formatEventFormat } from '@/lib/events/eventLocation';
import { formatEventPrice } from '@/lib/events/eventPrice';
import { getEventTypeDefinition, isExternalEventType } from '@/lib/events/eventTypes';
import { formatMediaDuration } from '@/lib/podcast/podcastEpisodeDuration';
import { isWorkshopPhasePast } from '@/lib/workshops/workshopPhase';
import { ArrowUpRight, CalendarDays, CirclePlay, ExternalLink } from 'lucide-react';
import Link from 'next/link';

type WorkshopEventCardProps = {
    readonly listing: EventListing;
    readonly locale: string;
    readonly timeZone: string;

    /**
     * The day it is today in the country this card is drawn for, which makes its term today, tomorrow, or one of the
     * days of this week
     */
    readonly todayDayKey: CalendarDayKey;
};

/**
 * When one term is held, as a member reads it, for example `dnes, pátek 4. 9. 2026 · 19:00`
 *
 * Note: The term has already been dated for the country this list is drawn for, so how near its day is is read from
 *       that day rather than dated a second time.
 */
function formatEventListingDateTime(
    listing: EventListing,
    todayDayKey: CalendarDayKey,
    locale: string,
    timeZone: string,
): string {
    const startsAtDate = new Date(listing.workshop.startsAt);
    const dateLabel = new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        timeZone,
    }).format(startsAtDate);
    const timeLabel = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone }).format(
        startsAtDate,
    );

    return `${formatCzechRelativeDayPrefix(listing.dayKey, todayDayKey)}${dateLabel} · ${timeLabel}`;
}

/**
 * The length somebody can replay, after the start of a recorded stream has been skipped.
 */
function WorkshopEventCardRecordingDuration({
    recordingDurationSeconds,
}: {
    readonly recordingDurationSeconds: number;
}) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-room-accent/10 px-2.5 py-1 text-xs font-medium tabular-nums text-room-accent">
            <CirclePlay className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Záznam {formatMediaDuration(recordingDurationSeconds)}
        </span>
    );
}

/**
 * One listed term as a card leading to it, which says when it is held, what it is, and where it stands in time
 *
 * Note: The list of cards and the day of a calendar show a term with this very same card, so a member reads the same
 *       thing about a term however they came to it.
 */
export function WorkshopEventCard({ listing, locale, timeZone, todayDayKey }: WorkshopEventCardProps) {
    const { workshop, event, link, phase } = listing;
    const eventCardDetails = workshop.eventCardDetails;
    const project = eventCardDetails?.project ?? null;
    const recordingDurationSeconds = eventCardDetails?.recordingDurationSeconds ?? null;
    const isRecordingDurationShown = isWorkshopPhasePast(phase) && recordingDurationSeconds !== null;

    // Note: A term held by somebody else leads out of this application, so it opens beside the room a member is
    //       reading rather than taking them out of it, and says so with its own icon.
    const isEventHeldExternally = isExternalEventType(event.type);
    const EventLinkIcon = isEventHeldExternally ? ExternalLink : ArrowUpRight;

    return (
        <Button
            asChild
            variant="outline"
            className="group h-full w-full items-start whitespace-normal rounded-xl border-room-border/10 bg-room-overlay/[0.035] p-4 text-left text-room-heading hover:border-room-accent/50 hover:bg-room-accent/10 hover:text-room-heading focus-visible:ring-room-accent"
        >
            <Link href={link} {...(isEventHeldExternally ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <span className="min-w-0 break-words font-semibold leading-6">{workshop.title}</span>
                        <EventLinkIcon className="mt-1 h-4 w-4 shrink-0 text-room-accent" aria-hidden="true" />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <WorkshopPhaseBadge phase={phase} tone="room" />
                        {isRecordingDurationShown && (
                            <WorkshopEventCardRecordingDuration recordingDurationSeconds={recordingDurationSeconds} />
                        )}
                    </div>
                    <span className="mt-3 flex items-center gap-1.5 text-xs font-normal text-room-muted">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {formatEventListingDateTime(listing, todayDayKey, locale, timeZone)}
                    </span>
                    <span className="mt-1 block break-words text-xs font-normal leading-5 text-room-muted">
                        {getEventTypeDefinition(event.type).label} · {formatEventFormat(event)} ·{' '}
                        {formatEventPrice(event.priceCzk)}
                    </span>
                    {project !== null && (
                        <div className="mt-4"><WorkshopProjectPreviewCard project={project} /></div>
                    )}
                </div>
            </Link>
        </Button>
    );
}
import { WorkshopEventCard } from '@/components/workshops/WorkshopEventCard';
import type { CalendarDayKey } from '@/lib/calendar/calendarMonth';
import { classNames } from '@/lib/classNames';
import type { EventListing } from '@/lib/events/eventListing';

/**
 * How the list of terms is named to somebody who cannot see that it is a list of them
 */
const WORKSHOP_EVENT_CARD_LIST_LABEL = 'Termíny akcí';

type WorkshopEventCardListProps = {
    readonly listings: readonly EventListing[];
    readonly locale: string;
    readonly timeZone: string;

    /**
     * The day it is today in the country these terms are listed for, see `WorkshopEventCard`
     */
    readonly todayDayKey: CalendarDayKey;
    readonly className?: string;
};

/**
 * The listed terms as cards leading to them
 *
 * Note: Both views of the terms end in this one list - the cards show every term with it, and the calendar shows the
 *       terms of the chosen day or month with it - so a term is never described in two different ways.
 */
export function WorkshopEventCardList({
    listings,
    locale,
    timeZone,
    todayDayKey,
    className,
}: WorkshopEventCardListProps) {
    return (
        <ul
            aria-label={WORKSHOP_EVENT_CARD_LIST_LABEL}
            className={classNames('grid grid-cols-1 gap-3 sm:grid-cols-2', className)}
        >
            {listings.map((listing) => (
                <li key={listing.workshop.id}>
                    <WorkshopEventCard
                        listing={listing}
                        locale={locale}
                        timeZone={timeZone}
                        todayDayKey={todayDayKey}
                    />
                </li>
            ))}
        </ul>
    );
}
'use client';

import {
    formatWorkshopAdminDateTime,
    formatWorkshopParticipantCount,
    formatWorkshopRegisteredParticipantCount,
} from '@/businesses/workshop-admin/workshopAdminFormatting';
import {
    PARTICIPANT_COUNT_TITLE,
    REGISTERED_PARTICIPANT_COUNT_TITLE,
} from '@/businesses/workshop-admin/workshopAudienceLabels';
import { WorkshopPhaseBadge } from '@/components/workshops/WorkshopPhaseBadge';
import { getWorkshopPhase } from '@/lib/workshops/workshopPhase';
import type { WorkshopAdminSummary } from '@/lib/workshops/workshopTypes';
import { CalendarDays, UserPlus, Users } from 'lucide-react';

type WorkshopSelectorCardProps = {
    readonly workshop: WorkshopAdminSummary;
    readonly isSelected: boolean;
    readonly onSelect: (workshopId: string) => void;
};

/**
 * One selectable occurrence, which says at a glance when it happens, whether it is running, how many people signed up
 * for it, and how many of them really came.
 */
export function WorkshopSelectorCard({ workshop, isSelected, onSelect }: WorkshopSelectorCardProps) {
    return (
        <button
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(workshop.id)}
            className={`w-full rounded-xl border p-2.5 text-left transition-colors ${isSelected ? 'border-cyan-500 bg-cyan-50 ring-1 ring-cyan-500' : 'border-slate-200 bg-white hover:border-cyan-300 hover:bg-slate-50'}`}
        >
            <span className="flex min-w-0 items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-950" title={workshop.title}>
                    {workshop.title}
                </span>
                <WorkshopPhaseBadge phase={getWorkshopPhase(workshop)} className="!px-2 !py-0.5 !text-[11px]" />
            </span>
            <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {formatWorkshopAdminDateTime(workshop.startsAt)}
                </span>
                {workshop.registeredParticipantCount !== null && (
                    <span className="flex items-center gap-1.5" title={REGISTERED_PARTICIPANT_COUNT_TITLE}>
                        <UserPlus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {formatWorkshopRegisteredParticipantCount(workshop.registeredParticipantCount)}
                    </span>
                )}
                <span className="flex items-center gap-1.5" title={PARTICIPANT_COUNT_TITLE}>
                    <Users className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {formatWorkshopParticipantCount(workshop.participantCount)}
                </span>
            </span>
        </button>
    );
}
'use client';

import { WorkshopSelectorCard } from '@/businesses/workshop-admin/WorkshopSelectorCard';
import { Input } from '@/components/ui/input';
import { getWorkshopPhaseAppearance } from '@/components/workshops/workshopPhaseAppearance';
import {
    getWorkshopPhase,
    groupWorkshopsByPhase,
    WORKSHOP_PHASE_VALUES,
    type WorkshopPhase,
} from '@/lib/workshops/workshopPhase';
import type { WorkshopAdminSummary } from '@/lib/workshops/workshopTypes';
import { ChevronDown, RefreshCw, Search } from 'lucide-react';
import { useId, useMemo, useState } from 'react';

type WorkshopSelectorCardListProps = {
    readonly label: string;
    readonly workshops: readonly WorkshopAdminSummary[];
    readonly selectedWorkshopId: string | null;
    readonly isLoading: boolean;
    readonly emptyMessage: string;
    readonly onSelect: (workshopId: string) => void;
};

const CZECH_LOCALE = 'cs-CZ';
const WORKSHOP_CARD_GRID_CLASS_NAME = 'grid grid-cols-1 gap-1.5 xl:grid-cols-2';
const WORKSHOP_LIST_CLASS_NAME =
    'mt-3 space-y-3 lg:max-h-[min(34rem,calc(100dvh-31rem))] lg:overflow-y-auto lg:pr-1';
const WORKSHOP_HISTORY_CATEGORY_LABEL = 'Historie';

/**
 * The administration names an active category with the same label as its badge, so a term cannot be called one thing
 * in the selector and another in its card. History is the one exception because it is a disclosure of the past,
 * rather than another past-term badge.
 */
function getWorkshopPhaseCategoryLabel(phase: WorkshopPhase): string {
    return phase === 'past' ? WORKSHOP_HISTORY_CATEGORY_LABEL : getWorkshopPhaseAppearance(phase).label;
}

function normalizeWorkshopSearchQuery(searchQuery: string): string {
    return searchQuery
        .trim()
        .toLocaleLowerCase(CZECH_LOCALE)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function isWorkshopMatchingSearchQuery(workshop: WorkshopAdminSummary, normalizedSearchQuery: string): boolean {
    if (normalizedSearchQuery.length === 0) {
        return true;
    }

    return normalizeWorkshopSearchQuery(`${workshop.title} ${workshop.slug}`).includes(normalizedSearchQuery);
}

type WorkshopSelectorCardGridProps = {
    readonly accessibleLabel: string;
    readonly workshops: readonly WorkshopAdminSummary[];
    readonly selectedWorkshopId: string | null;
    readonly onSelect: (workshopId: string) => void;
};

/**
 * Renders each selectable workshop in one place, so the current terms and the progressively disclosed archive stay
 * equally informative and behave identically.
 */
function WorkshopSelectorCardGrid({
    accessibleLabel,
    workshops,
    selectedWorkshopId,
    onSelect,
}: WorkshopSelectorCardGridProps) {
    return (
        <ul aria-label={accessibleLabel} className={WORKSHOP_CARD_GRID_CLASS_NAME}>
            {workshops.map((workshop) => (
                <li key={workshop.id} className="min-w-0">
                    <WorkshopSelectorCard
                        workshop={workshop}
                        isSelected={workshop.id === selectedWorkshopId}
                        onSelect={onSelect}
                    />
                </li>
            ))}
        </ul>
    );
}

/**
 * Offers every occurrence as a card in the five shared time categories. An administrator gets the workshop that is
 * running first, the one they are wrapping up next, then the terms to prepare soon and later, while the old archive
 * remains available on demand.
 */
export function WorkshopSelectorCardList({
    label,
    workshops,
    selectedWorkshopId,
    isLoading,
    emptyMessage,
    onSelect,
}: WorkshopSelectorCardListProps) {
    const searchInputId = useId();
    const pastWorkshopsListId = useId();
    const [searchQuery, setSearchQuery] = useState('');
    const [isPastWorkshopsExpanded, setIsPastWorkshopsExpanded] = useState(false);
    const normalizedSearchQuery = useMemo(() => normalizeWorkshopSearchQuery(searchQuery), [searchQuery]);
    const matchingWorkshops = useMemo(() => {
        return workshops.filter((workshop) => isWorkshopMatchingSearchQuery(workshop, normalizedSearchQuery));
    }, [normalizedSearchQuery, workshops]);
    const matchingWorkshopsByPhase = useMemo(() => groupWorkshopsByPhase(matchingWorkshops), [matchingWorkshops]);
    const pastWorkshops = matchingWorkshopsByPhase.past;
    const selectedWorkshop = workshops.find((workshop) => workshop.id === selectedWorkshopId);
    const isSelectedWorkshopInHistory =
        selectedWorkshop !== undefined && getWorkshopPhase(selectedWorkshop) === 'past';
    const isSearchQueryPresent = normalizedSearchQuery.length > 0;
    const isPastWorkshopsVisible = isPastWorkshopsExpanded || isSelectedWorkshopInHistory || isSearchQueryPresent;

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</h2>
            {isLoading ? (
                <div className="flex justify-center py-6">
                    <RefreshCw className="h-4 w-4 animate-spin text-cyan-600" aria-label="Načítání" />
                </div>
            ) : workshops.length === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
                    {emptyMessage}
                </p>
            ) : (
                <>
                    <label htmlFor={searchInputId} className="sr-only">
                        Hledat workshop
                    </label>
                    <div className="relative mt-3">
                        <Search
                            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                            aria-hidden="true"
                        />
                        <Input
                            id={searchInputId}
                            type="search"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Hledat workshop"
                            className="h-9 pl-9"
                        />
                    </div>
                    {matchingWorkshops.length === 0 ? (
                        <p className="mt-3 rounded-xl border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
                            Žádný workshop neodpovídá hledání.
                        </p>
                    ) : (
                        <div className={WORKSHOP_LIST_CLASS_NAME}>
                            {WORKSHOP_PHASE_VALUES.filter((phase) => phase !== 'past').map((phase) => {
                                const workshopsInPhase = matchingWorkshopsByPhase[phase];
                                const phaseCategoryLabel = getWorkshopPhaseCategoryLabel(phase);
                                const phaseSectionId = `${pastWorkshopsListId}-${phase}`;

                                return workshopsInPhase.length === 0 ? null : (
                                    <section key={phase} aria-labelledby={phaseSectionId}>
                                        <h3
                                            id={phaseSectionId}
                                            className="px-1 text-xs font-semibold uppercase tracking-wider text-slate-500"
                                        >
                                            {phaseCategoryLabel} ({workshopsInPhase.length})
                                        </h3>
                                        <div className="mt-1.5">
                                            <WorkshopSelectorCardGrid
                                                accessibleLabel={`Seznam workshopů: ${phaseCategoryLabel}`}
                                                workshops={workshopsInPhase}
                                                selectedWorkshopId={selectedWorkshopId}
                                                onSelect={onSelect}
                                            />
                                        </div>
                                    </section>
                                );
                            })}

                            {pastWorkshops.length > 0 && (
                                <section>
                                    <button
                                        type="button"
                                        aria-controls={pastWorkshopsListId}
                                        aria-expanded={isPastWorkshopsVisible}
                                        onClick={() => setIsPastWorkshopsExpanded((isExpanded) => !isExpanded)}
                                        className="flex w-full items-center justify-between rounded-lg px-1 py-1 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 transition-colors hover:text-slate-800"
                                    >
                                        {WORKSHOP_HISTORY_CATEGORY_LABEL} ({pastWorkshops.length})
                                        <ChevronDown
                                            className={`h-4 w-4 shrink-0 transition-transform ${isPastWorkshopsVisible ? 'rotate-180' : ''}`}
                                            aria-hidden="true"
                                        />
                                    </button>
                                    {isPastWorkshopsVisible && (
                                        <div className="mt-1.5" id={pastWorkshopsListId}>
                                            <WorkshopSelectorCardGrid
                                                accessibleLabel="Historie workshopů"
                                                workshops={pastWorkshops}
                                                selectedWorkshopId={selectedWorkshopId}
                                                onSelect={onSelect}
                                            />
                                        </div>
                                    )}
                                </section>
                            )}
                        </div>
                    )}
                </>
            )}
        </section>
    );
}

exec
/bin/zsh -lc 'cat package.json && cat lib/workshops/workshopPhase.ts && cat components/workshops/workshopPhaseAppearance.ts && cat lib/workshops/workshopPhase.test.ts' in /Users/hejny/work/aldaron
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
import {
    DEFAULT_WORKSHOP_DURATION_MINUTES,
    FRESHLY_PAST_WORKSHOP_HOURS,
    UPCOMING_NEXT_WEEK_WORKSHOP_HOURS,
} from '@/lib/workshops/workshopConstants';

const MILLISECONDS_PER_MINUTE = 60 * 1000;
const MILLISECONDS_PER_HOUR = 60 * MILLISECONDS_PER_MINUTE;

/**
 * Where one occurrence currently stands in time, named from the most pressing phase to the least
 *
 * Note: An occurrence which has only just been held is a phase of its own rather than the beginning of the history,
 *       because what a member does with a workshop of yesterday evening — its room, its recording, its materials — has
 *       nothing to do with what they do with a workshop of last spring.
 * Note: An occurrence which starts during the next seven days is also a phase of its own, so a schedule can call
 *       attention to the terms somebody still has time to plan for without each surface calculating that window again.
 * Note: This order is what ranks the phases wherever they are listed, coloured, or grouped, so a phase is placed among
 *       the others only here.
 */
export const WORKSHOP_PHASE_VALUES = ['ongoing', 'freshly-past', 'upcoming-next-week', 'upcoming', 'past'] as const;

export type WorkshopPhase = (typeof WORKSHOP_PHASE_VALUES)[number];

/**
 * Whether an occurrence of this phase has already been held, however long ago that was
 *
 * Note: This is the one answer to the question everything which opens after a workshop asks — the wrap-up, the
 *       feedback, and the recording — so a workshop which has only just ended is over exactly as much as one which
 *       ended a year ago.
 */
export function isWorkshopPhasePast(phase: WorkshopPhase): boolean {
    return phase === 'freshly-past' || phase === 'past';
}

/**
 * Whether an occurrence of this phase has not started yet, whether it starts soon or later.
 *
 * Note: Follow-up recommendations need one answer to this question. A term within the next week remains the next
 *       workshop just as much as a term next month does, even though the schedule gives the nearer one a special
 *       badge.
 */
export function isWorkshopPhaseUpcoming(phase: WorkshopPhase): boolean {
    return phase === 'upcoming-next-week' || phase === 'upcoming';
}

/**
 * As much of a workshop as it takes to decide when it happens
 *
 * Note: Both a summary and the full details of a workshop satisfy this shape, so nothing has to be loaded just to
 *       place an occurrence in time.
 * Note: An occurrence without an end has not ended. It runs for as long as it takes and is only over once its end is
 *       recorded, which is what the administration does when the workshop is really finished.
 */
export type WorkshopOccurrenceTiming = {
    readonly startsAt: string;
    readonly endsAt: string | null;
};

/**
 * How pressing one phase is, which is nothing but the order the phases are named in
 */
function getWorkshopPhaseRank(phase: WorkshopPhase): number {
    return WORKSHOP_PHASE_VALUES.indexOf(phase);
}

/**
 * Moment an occurrence was really given as its end, or `null` while that end is left open
 *
 * Note: This is the single rule for whether an occurrence has an end at all, so nothing decides on its own that an
 *       unwritten or nonsensical end means the workshop is over.
 */
export function getWorkshopRecordedEndsAtMilliseconds(occurrence: WorkshopOccurrenceTiming): number | null {
    const endsAtMilliseconds = occurrence.endsAt === null ? Number.NaN : Date.parse(occurrence.endsAt);

    return endsAtMilliseconds > Date.parse(occurrence.startsAt) ? endsAtMilliseconds : null;
}

/**
 * Whether an occurrence still has no end, so it runs until the administration ends it
 */
export function isWorkshopEndOpen(occurrence: WorkshopOccurrenceTiming): boolean {
    return getWorkshopRecordedEndsAtMilliseconds(occurrence) === null;
}

/**
 * Moment an occurrence is expected to end, taken from the usual length of a workshop while its end is left open
 *
 * Note: A calendar invitation and a duration label have to name a length before an occurrence has one, which is what
 *       this expectation is for. It deliberately never decides whether an occurrence is over — only a recorded end
 *       does that.
 */
export function getWorkshopExpectedEndsAtMilliseconds(occurrence: WorkshopOccurrenceTiming): number {
    return (
        getWorkshopRecordedEndsAtMilliseconds(occurrence) ??
        Date.parse(occurrence.startsAt) + DEFAULT_WORKSHOP_DURATION_MINUTES * MILLISECONDS_PER_MINUTE
    );
}

/**
 * Whether a future occurrence starts in the rolling window the schedule calls the next week.
 */
function isWorkshopStartingWithinNextWeek(
    startsAtMilliseconds: number,
    currentTimeMilliseconds: number,
): boolean {
    return (
        startsAtMilliseconds > currentTimeMilliseconds &&
        startsAtMilliseconds <= currentTimeMilliseconds + UPCOMING_NEXT_WEEK_WORKSHOP_HOURS * MILLISECONDS_PER_HOUR
    );
}

/**
 * Decides whether an occurrence is still ahead but imminent, further ahead, running right now, only just over, or
 * already history.
 *
 * Note: An occurrence whose end is open never becomes past by itself. It keeps running — and keeps its stage on —
 *       until an administrator records the end of it.
 * Note: How long an occurrence stays freshly past is counted from the end which was really recorded for it rather than
 *       from the end it was expected to have, so a workshop is never called fresh before anybody ended it.
 *
 * @param currentTimeMilliseconds moment to compare against, so a list places every occurrence against the same instant
 */
export function getWorkshopPhase(
    occurrence: WorkshopOccurrenceTiming,
    currentTimeMilliseconds = Date.now(),
): WorkshopPhase {
    const startsAtMilliseconds = Date.parse(occurrence.startsAt);
    if (isWorkshopStartingWithinNextWeek(startsAtMilliseconds, currentTimeMilliseconds)) {
        return 'upcoming-next-week';
    }

    if (startsAtMilliseconds > currentTimeMilliseconds) {
        return 'upcoming';
    }

    const recordedEndsAtMilliseconds = getWorkshopRecordedEndsAtMilliseconds(occurrence);
    if (recordedEndsAtMilliseconds === null || recordedEndsAtMilliseconds > currentTimeMilliseconds) {
        return 'ongoing';
    }

    const millisecondsSinceEnd = currentTimeMilliseconds - recordedEndsAtMilliseconds;
    return millisecondsSinceEnd <= FRESHLY_PAST_WORKSHOP_HOURS * MILLISECONDS_PER_HOUR ? 'freshly-past' : 'past';
}

/**
 * The one phase which speaks for a group of occurrences, which is the most pressing among them
 *
 * Note: A day of a calendar carries whatever terms fall on it, and it can only be coloured by one of them. It is
 *       coloured by the very same ranking which puts a running term on top of a list, so a day where something is
 *       happening right now never looks like history.
 */
export function getMostProminentWorkshopPhase(phases: readonly WorkshopPhase[]): WorkshopPhase {
    return phases.reduce(
        (mostProminentPhase, phase) =>
            getWorkshopPhaseRank(phase) < getWorkshopPhaseRank(mostProminentPhase) ? phase : mostProminentPhase,
        'past',
    );
}

/**
 * The two keys which order one occurrence among the others
 *
 * Note: The history is ranked by its negated date, so the term which ended last leads it while the future is led by
 *       the term which starts next. The most relevant occurrence of every group therefore stays on top of it.
 */
function getWorkshopPhaseOrder(
    occurrence: WorkshopOccurrenceTiming,
    currentTimeMilliseconds: number,
): { readonly phaseRank: number; readonly dateRank: number } {
    const phase = getWorkshopPhase(occurrence, currentTimeMilliseconds);
    const startsAtMilliseconds = Date.parse(occurrence.startsAt);
    const dateRank = Number.isFinite(startsAtMilliseconds) ? startsAtMilliseconds : 0;

    return { phaseRank: getWorkshopPhaseRank(phase), dateRank: isWorkshopPhasePast(phase) ? -dateRank : dateRank };
}

/**
 * Orders occurrences by their phase first and by their date within every phase
 *
 * @param currentTimeMilliseconds moment which decides the phases, so one list is never sorted against a moving instant
 */
export function sortWorkshopsByPhase<TWorkshop extends WorkshopOccurrenceTiming>(
    workshops: readonly TWorkshop[],
    currentTimeMilliseconds = Date.now(),
): readonly TWorkshop[] {
    return workshops
        .map((workshop) => ({ workshop, order: getWorkshopPhaseOrder(workshop, currentTimeMilliseconds) }))
        .sort(
            (firstEntry, secondEntry) =>
                firstEntry.order.phaseRank - secondEntry.order.phaseRank ||
                firstEntry.order.dateRank - secondEntry.order.dateRank,
        )
        .map(({ workshop }) => workshop);
}

/**
 * Splits occurrences into the same ordered phases which administration and public listings use.
 *
 * Keeping the ordering and the grouping together means a picker can progressively disclose an archive without
 * teaching a second place which workshop belongs before, during, or after the current moment.
 */
export function groupWorkshopsByPhase<TWorkshop extends WorkshopOccurrenceTiming>(
    workshops: readonly TWorkshop[],
    currentTimeMilliseconds = Date.now(),
): Readonly<Record<WorkshopPhase, readonly TWorkshop[]>> {
    const workshopsByPhase: Record<WorkshopPhase, TWorkshop[]> = {
        ongoing: [],
        'freshly-past': [],
        'upcoming-next-week': [],
        upcoming: [],
        past: [],
    };

    for (const workshop of sortWorkshopsByPhase(workshops, currentTimeMilliseconds)) {
        workshopsByPhase[getWorkshopPhase(workshop, currentTimeMilliseconds)].push(workshop);
    }

    return workshopsByPhase;
}
import type { WorkshopPhase } from '@/lib/workshops/workshopPhase';

/**
 * Backgrounds a phase is drawn on: the light administration and a room following the member's theme.
 */
export type WorkshopPhaseTone = 'light' | 'room';

/**
 * How one phase names itself and which colour says so
 */
export type WorkshopPhaseAppearance = {
    /**
     * How this phase is named wherever a term of it is listed
     */
    readonly label: string;

    /**
     * Classes of the badge which names this phase on each of the two backgrounds
     */
    readonly badgeClassNameByTone: Readonly<Record<WorkshopPhaseTone, string>>;

    /**
     * Classes of a calendar day which carries a term of this phase
     */
    readonly calendarDayClassName: string;

    /**
     * Classes of the small mark standing for one term of this phase inside a calendar day and in its legend
     */
    readonly markClassName: string;
};

/**
 * The one description of how every phase looks, wherever a term is listed
 *
 * Note: A list of cards and a calendar of the same terms say the very same thing with the very same colour - green
 *       runs right now, amber has only just been held, violet starts within a week, cyan is further ahead, and grey is
 *       history - because both of them read their colours here instead of choosing their own.
 * Note: These colours live beside the components which wear them rather than among the rules of the application,
 *       because only the directories of the components are read for the styles the application is built with.
 */
const WORKSHOP_PHASE_APPEARANCES: Readonly<Record<WorkshopPhase, WorkshopPhaseAppearance>> = {
    ongoing: {
        label: 'Probíhá',
        badgeClassNameByTone: {
            light: 'bg-emerald-100 text-emerald-800',
            room: 'bg-room-success/15 text-room-success ring-1 ring-inset ring-room-success/40',
        },
        calendarDayClassName: 'border-room-success/50 bg-room-success/15 text-room-success',
        markClassName: 'bg-room-success',
    },
    // Note: A term which has only just been held is neither what is happening nor what is long over, and it is drawn
    //       as exactly that: warm enough to be noticed among the history, quiet enough never to be mistaken for a
    //       workshop which is still running.
    'freshly-past': {
        label: 'Právě proběhlo',
        badgeClassNameByTone: {
            light: 'bg-amber-100 text-amber-800',
            room: 'bg-room-warning/15 text-room-warning ring-1 ring-inset ring-room-warning/40',
        },
        calendarDayClassName: 'border-room-warning/40 bg-room-warning/10 text-room-warning',
        markClassName: 'bg-room-warning',
    },
    // Note: This stays distinct from the ordinary upcoming cyan so the special badge is useful even when a reader
    //       cannot infer a date at a glance.
    'upcoming-next-week': {
        label: 'Tento týden',
        badgeClassNameByTone: {
            light: 'bg-violet-100 text-violet-800',
            room: 'bg-room-upcoming/15 text-room-upcoming ring-1 ring-inset ring-room-upcoming/40',
        },
        calendarDayClassName: 'border-room-upcoming/40 bg-room-upcoming/10 text-room-upcoming',
        markClassName: 'bg-room-upcoming',
    },
    upcoming: {
        label: 'Nadchází',
        badgeClassNameByTone: {
            light: 'bg-cyan-100 text-cyan-800',
            room: 'bg-room-accent/15 text-room-accent ring-1 ring-inset ring-room-accent/40',
        },
        calendarDayClassName: 'border-room-accent/40 bg-room-accent/10 text-room-accent',
        markClassName: 'bg-room-action',
    },
    past: {
        label: 'Proběhlo',
        badgeClassNameByTone: {
            light: 'bg-slate-100 text-slate-500',
            room: 'bg-room-overlay/5 text-room-muted ring-1 ring-inset ring-room-border/10',
        },
        calendarDayClassName: 'border-room-muted/25 bg-room-muted/10 text-room-text',
        markClassName: 'bg-room-muted',
    },
};

export function getWorkshopPhaseAppearance(phase: WorkshopPhase): WorkshopPhaseAppearance {
    return WORKSHOP_PHASE_APPEARANCES[phase];
}
import {
    groupWorkshopsByPhase,
    getMostProminentWorkshopPhase,
    getWorkshopExpectedEndsAtMilliseconds,
    getWorkshopPhase,
    isWorkshopEndOpen,
    isWorkshopPhasePast,
    isWorkshopPhaseUpcoming,
    sortWorkshopsByPhase,
    type WorkshopOccurrenceTiming,
} from '@/lib/workshops/workshopPhase';
import { describe, expect, it } from 'vitest';

const CURRENT_TIME_MILLISECONDS = Date.parse('2026-08-21T19:30:00+02:00');

const PAST_WORKSHOP: WorkshopOccurrenceTiming = {
    startsAt: '2026-07-10T19:00:00+02:00',
    endsAt: '2026-07-10T20:30:00+02:00',
};

/**
 * A workshop of yesterday evening, which ended a few hours before the moment these terms are placed against
 */
const FRESHLY_PAST_WORKSHOP: WorkshopOccurrenceTiming = {
    startsAt: '2026-08-20T19:00:00+02:00',
    endsAt: '2026-08-20T20:30:00+02:00',
};
const OLDER_PAST_WORKSHOP: WorkshopOccurrenceTiming = {
    startsAt: '2026-06-10T19:00:00+02:00',
    endsAt: '2026-06-10T20:30:00+02:00',
};
const ONGOING_WORKSHOP: WorkshopOccurrenceTiming = {
    startsAt: '2026-08-21T19:00:00+02:00',
    endsAt: '2026-08-21T20:30:00+02:00',
};
const UPCOMING_WORKSHOP: WorkshopOccurrenceTiming = {
    startsAt: '2026-09-10T19:00:00+02:00',
    endsAt: '2026-09-10T20:30:00+02:00',
};
const UPCOMING_NEXT_WEEK_WORKSHOP: WorkshopOccurrenceTiming = {
    startsAt: '2026-08-24T19:00:00+02:00',
    endsAt: '2026-08-24T20:30:00+02:00',
};
const LATER_UPCOMING_WORKSHOP: WorkshopOccurrenceTiming = {
    startsAt: '2026-10-10T19:00:00+02:00',
    endsAt: '2026-10-10T20:30:00+02:00',
};
const OPEN_ENDED_WORKSHOP: WorkshopOccurrenceTiming = {
    startsAt: '2026-08-21T19:00:00+02:00',
    endsAt: null,
};

describe('workshop phase', () => {
    it('places an occurrence against the given moment', () => {
        expect(getWorkshopPhase(UPCOMING_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming');
        expect(getWorkshopPhase(UPCOMING_NEXT_WEEK_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming-next-week');
        expect(getWorkshopPhase(ONGOING_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('ongoing');
        expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('freshly-past');
        expect(getWorkshopPhase(PAST_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('past');
    });

    it('keeps an occurrence freshly past for a whole day after the end recorded for it', () => {
        expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, Date.parse('2026-08-20T20:30:01+02:00'))).toBe('freshly-past');
        expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('freshly-past');
        expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, Date.parse('2026-08-21T20:30:01+02:00'))).toBe('past');
    });

    it('counts an occurrence which has only just been held among the ones which are over', () => {
        expect(isWorkshopPhasePast('freshly-past')).toBe(true);
        expect(isWorkshopPhasePast('past')).toBe(true);
        expect(isWorkshopPhasePast('ongoing')).toBe(false);
        expect(isWorkshopPhasePast('upcoming-next-week')).toBe(false);
        expect(isWorkshopPhasePast('upcoming')).toBe(false);
    });

    it('keeps a term starting within seven rolling days separate from a later upcoming term', () => {
        const workshopAtNextWeekBoundary: WorkshopOccurrenceTiming = {
            startsAt: '2026-08-28T19:30:00+02:00',
            endsAt: '2026-08-28T20:30:00+02:00',
        };
        const workshopAfterNextWeekBoundary: WorkshopOccurrenceTiming = {
            ...workshopAtNextWeekBoundary,
            startsAt: '2026-08-28T19:30:00.001+02:00',
        };

        expect(getWorkshopPhase(workshopAtNextWeekBoundary, CURRENT_TIME_MILLISECONDS)).toBe('upcoming-next-week');
        expect(getWorkshopPhase(workshopAfterNextWeekBoundary, CURRENT_TIME_MILLISECONDS)).toBe('upcoming');
    });

    it('counts both kinds of future term among the workshops which are still ahead', () => {
        expect(isWorkshopPhaseUpcoming('upcoming-next-week')).toBe(true);
        expect(isWorkshopPhaseUpcoming('upcoming')).toBe(true);
        expect(isWorkshopPhaseUpcoming('ongoing')).toBe(false);
        expect(isWorkshopPhaseUpcoming('freshly-past')).toBe(false);
        expect(isWorkshopPhaseUpcoming('past')).toBe(false);
    });

    it('never calls an occurrence whose end is left open freshly past, however long ago it started', () => {
        expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-08-22T19:00:00+02:00'))).toBe('ongoing');
    });

    it('keeps a workshop whose end is left open running until an end is recorded', () => {
        expect(isWorkshopEndOpen(OPEN_ENDED_WORKSHOP)).toBe(true);
        expect(isWorkshopEndOpen(ONGOING_WORKSHOP)).toBe(false);
        expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('ongoing');
        expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('ongoing');
        expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-12-24T18:00:00+01:00'))).toBe('ongoing');
        expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-08-21T18:59:59+02:00'))).toBe(
            'upcoming-next-week',
        );
    });

    it('ends a workshop as soon as the administration records the moment it was ended', () => {
        const endedWorkshop: WorkshopOccurrenceTiming = {
            ...OPEN_ENDED_WORKSHOP,
            endsAt: '2026-08-21T20:12:00+02:00',
        };

        expect(isWorkshopEndOpen(endedWorkshop)).toBe(false);
        expect(getWorkshopPhase(endedWorkshop, Date.parse('2026-08-21T20:11:00+02:00'))).toBe('ongoing');
        expect(getWorkshopPhase(endedWorkshop, Date.parse('2026-08-21T20:13:00+02:00'))).toBe('freshly-past');
        expect(getWorkshopPhase(endedWorkshop, Date.parse('2026-08-23T20:13:00+02:00'))).toBe('past');
    });

    it('expects an open end to take as long as a workshop usually does, without ending it', () => {
        expect(getWorkshopExpectedEndsAtMilliseconds(OPEN_ENDED_WORKSHOP)).toBe(
            Date.parse('2026-08-21T20:00:00+02:00'),
        );
        expect(getWorkshopExpectedEndsAtMilliseconds(ONGOING_WORKSHOP)).toBe(
            Date.parse('2026-08-21T20:30:00+02:00'),
        );
    });

    it('keeps an occurrence ongoing until its very end and imminent until its very start', () => {
        expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T19:00:00+02:00'))).toBe('ongoing');
        expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T18:59:59+02:00'))).toBe(
            'upcoming-next-week',
        );
        expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('freshly-past');
    });
});

describe('workshop phase ordering', () => {
    it('lists what runs now, needs wrap-up, starts within a week, starts later, and is history in that order', () => {
        const sortedWorkshops = sortWorkshopsByPhase(
            [
                OLDER_PAST_WORKSHOP,
                LATER_UPCOMING_WORKSHOP,
                PAST_WORKSHOP,
                FRESHLY_PAST_WORKSHOP,
                UPCOMING_WORKSHOP,
                UPCOMING_NEXT_WEEK_WORKSHOP,
                ONGOING_WORKSHOP,
            ],
            CURRENT_TIME_MILLISECONDS,
        );

        expect(sortedWorkshops).toEqual([
            ONGOING_WORKSHOP,
            FRESHLY_PAST_WORKSHOP,
            UPCOMING_NEXT_WEEK_WORKSHOP,
            UPCOMING_WORKSHOP,
            LATER_UPCOMING_WORKSHOP,
            PAST_WORKSHOP,
            OLDER_PAST_WORKSHOP,
        ]);
    });

    it('leaves the listed workshops untouched', () => {
        const workshops = [UPCOMING_WORKSHOP, ONGOING_WORKSHOP];

        sortWorkshopsByPhase(workshops, CURRENT_TIME_MILLISECONDS);

        expect(workshops).toEqual([UPCOMING_WORKSHOP, ONGOING_WORKSHOP]);
    });

    it('groups every phase in the same priority and date order as the workshop list', () => {
        const workshopsByPhase = groupWorkshopsByPhase(
            [
                OLDER_PAST_WORKSHOP,
                LATER_UPCOMING_WORKSHOP,
                PAST_WORKSHOP,
                FRESHLY_PAST_WORKSHOP,
                UPCOMING_WORKSHOP,
                UPCOMING_NEXT_WEEK_WORKSHOP,
                ONGOING_WORKSHOP,
            ],
            CURRENT_TIME_MILLISECONDS,
        );

        expect(workshopsByPhase).toEqual({
            ongoing: [ONGOING_WORKSHOP],
            'freshly-past': [FRESHLY_PAST_WORKSHOP],
            'upcoming-next-week': [UPCOMING_NEXT_WEEK_WORKSHOP],
            upcoming: [UPCOMING_WORKSHOP, LATER_UPCOMING_WORKSHOP],
            past: [PAST_WORKSHOP, OLDER_PAST_WORKSHOP],
        });
    });

    it('lets the most pressing phase speak for a group of occurrences', () => {
        expect(getMostProminentWorkshopPhase(['past', 'upcoming', 'ongoing'])).toBe('ongoing');
        expect(getMostProminentWorkshopPhase(['past', 'upcoming', 'upcoming-next-week'])).toBe('upcoming-next-week');
        expect(getMostProminentWorkshopPhase(['past', 'freshly-past', 'upcoming'])).toBe('freshly-past');
        expect(getMostProminentWorkshopPhase(['past', 'freshly-past'])).toBe('freshly-past');
        expect(getMostProminentWorkshopPhase(['past'])).toBe('past');
        expect(getMostProminentWorkshopPhase([])).toBe('past');
    });
});

exec
/bin/zsh -lc 'cat components/workshops/WorkshopEventCard.tsx && cat businesses/workshop-admin/WorkshopSelectorCard.tsx && cat businesses/workshop-admin/WorkshopSelectorCardList.tsx' in /Users/hejny/work/aldaron
 succeeded in 0ms:
import { Button } from '@/components/ui/button';
import { WorkshopPhaseBadge } from '@/components/workshops/WorkshopPhaseBadge';
import { WorkshopProjectPreviewCard } from '@/components/workshops/WorkshopProjectPreviewCard';
import type { CalendarDayKey } from '@/lib/calendar/calendarMonth';
import { formatCzechRelativeDayPrefix } from '@/lib/calendar/czechRelativeDay';
import type { EventListing } from '@/lib/events/eventListing';
import { formatEventFormat } from '@/lib/events/eventLocation';
import { formatEventPrice } from '@/lib/events/eventPrice';
import { getEventTypeDefinition, isExternalEventType } from '@/lib/events/eventTypes';
import { formatMediaDuration } from '@/lib/podcast/podcastEpisodeDuration';
import { isWorkshopPhasePast } from '@/lib/workshops/workshopPhase';
import { ArrowUpRight, CalendarDays, CirclePlay, ExternalLink } from 'lucide-react';
import Link from 'next/link';

type WorkshopEventCardProps = {
    readonly listing: EventListing;
    readonly locale: string;
    readonly timeZone: string;

    /**
     * The day it is today in the country this card is drawn for, which makes its term today, tomorrow, or one of the
     * days of this week
     */
    readonly todayDayKey: CalendarDayKey;
};

/**
 * When one term is held, as a member reads it, for example `dnes, pátek 4. 9. 2026 · 19:00`
 *
 * Note: The term has already been dated for the country this list is drawn for, so how near its day is is read from
 *       that day rather than dated a second time.
 */
function formatEventListingDateTime(
    listing: EventListing,
    todayDayKey: CalendarDayKey,
    locale: string,
    timeZone: string,
): string {
    const startsAtDate = new Date(listing.workshop.startsAt);
    const dateLabel = new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        timeZone,
    }).format(startsAtDate);
    const timeLabel = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone }).format(
        startsAtDate,
    );

    return `${formatCzechRelativeDayPrefix(listing.dayKey, todayDayKey)}${dateLabel} · ${timeLabel}`;
}

/**
 * The length somebody can replay, after the start of a recorded stream has been skipped.
 */
function WorkshopEventCardRecordingDuration({
    recordingDurationSeconds,
}: {
    readonly recordingDurationSeconds: number;
}) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-room-accent/10 px-2.5 py-1 text-xs font-medium tabular-nums text-room-accent">
            <CirclePlay className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Záznam {formatMediaDuration(recordingDurationSeconds)}
        </span>
    );
}

/**
 * One listed term as a card leading to it, which says when it is held, what it is, and where it stands in time
 *
 * Note: The list of cards and the day of a calendar show a term with this very same card, so a member reads the same
 *       thing about a term however they came to it.
 */
export function WorkshopEventCard({ listing, locale, timeZone, todayDayKey }: WorkshopEventCardProps) {
    const { workshop, event, link, phase } = listing;
    const eventCardDetails = workshop.eventCardDetails;
    const project = eventCardDetails?.project ?? null;
    const recordingDurationSeconds = eventCardDetails?.recordingDurationSeconds ?? null;
    const isRecordingDurationShown = isWorkshopPhasePast(phase) && recordingDurationSeconds !== null;

    // Note: A term held by somebody else leads out of this application, so it opens beside the room a member is
    //       reading rather than taking them out of it, and says so with its own icon.
    const isEventHeldExternally = isExternalEventType(event.type);
    const EventLinkIcon = isEventHeldExternally ? ExternalLink : ArrowUpRight;

    return (
        <Button
            asChild
            variant="outline"
            className="group h-full w-full items-start whitespace-normal rounded-xl border-room-border/10 bg-room-overlay/[0.035] p-4 text-left text-room-heading hover:border-room-accent/50 hover:bg-room-accent/10 hover:text-room-heading focus-visible:ring-room-accent"
        >
            <Link href={link} {...(isEventHeldExternally ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <span className="min-w-0 break-words font-semibold leading-6">{workshop.title}</span>
                        <EventLinkIcon className="mt-1 h-4 w-4 shrink-0 text-room-accent" aria-hidden="true" />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <WorkshopPhaseBadge phase={phase} tone="room" />
                        {isRecordingDurationShown && (
                            <WorkshopEventCardRecordingDuration recordingDurationSeconds={recordingDurationSeconds} />
                        )}
                    </div>
                    <span className="mt-3 flex items-center gap-1.5 text-xs font-normal text-room-muted">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {formatEventListingDateTime(listing, todayDayKey, locale, timeZone)}
                    </span>
                    <span className="mt-1 block break-words text-xs font-normal leading-5 text-room-muted">
                        {getEventTypeDefinition(event.type).label} · {formatEventFormat(event)} ·{' '}
                        {formatEventPrice(event.priceCzk)}
                    </span>
                    {project !== null && (
                        <div className="mt-4"><WorkshopProjectPreviewCard project={project} /></div>
                    )}
                </div>
            </Link>
        </Button>
    );
}
'use client';

import {
    formatWorkshopAdminDateTime,
    formatWorkshopParticipantCount,
    formatWorkshopRegisteredParticipantCount,
} from '@/businesses/workshop-admin/workshopAdminFormatting';
import {
    PARTICIPANT_COUNT_TITLE,
    REGISTERED_PARTICIPANT_COUNT_TITLE,
} from '@/businesses/workshop-admin/workshopAudienceLabels';
import { WorkshopPhaseBadge } from '@/components/workshops/WorkshopPhaseBadge';
import { getWorkshopPhase } from '@/lib/workshops/workshopPhase';
import type { WorkshopAdminSummary } from '@/lib/workshops/workshopTypes';
import { CalendarDays, UserPlus, Users } from 'lucide-react';

type WorkshopSelectorCardProps = {
    readonly workshop: WorkshopAdminSummary;
    readonly isSelected: boolean;
    readonly onSelect: (workshopId: string) => void;
};

/**
 * One selectable occurrence, which says at a glance when it happens, whether it is running, how many people signed up
 * for it, and how many of them really came.
 */
export function WorkshopSelectorCard({ workshop, isSelected, onSelect }: WorkshopSelectorCardProps) {
    return (
        <button
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(workshop.id)}
            className={`w-full rounded-xl border p-2.5 text-left transition-colors ${isSelected ? 'border-cyan-500 bg-cyan-50 ring-1 ring-cyan-500' : 'border-slate-200 bg-white hover:border-cyan-300 hover:bg-slate-50'}`}
        >
            <span className="flex min-w-0 items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-950" title={workshop.title}>
                    {workshop.title}
                </span>
                <WorkshopPhaseBadge phase={getWorkshopPhase(workshop)} className="!px-2 !py-0.5 !text-[11px]" />
            </span>
            <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {formatWorkshopAdminDateTime(workshop.startsAt)}
                </span>
                {workshop.registeredParticipantCount !== null && (
                    <span className="flex items-center gap-1.5" title={REGISTERED_PARTICIPANT_COUNT_TITLE}>
                        <UserPlus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {formatWorkshopRegisteredParticipantCount(workshop.registeredParticipantCount)}
                    </span>
                )}
                <span className="flex items-center gap-1.5" title={PARTICIPANT_COUNT_TITLE}>
                    <Users className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {formatWorkshopParticipantCount(workshop.participantCount)}
                </span>
            </span>
        </button>
    );
}
'use client';

import { WorkshopSelectorCard } from '@/businesses/workshop-admin/WorkshopSelectorCard';
import { Input } from '@/components/ui/input';
import { getWorkshopPhaseAppearance } from '@/components/workshops/workshopPhaseAppearance';
import {
    getWorkshopPhase,
    groupWorkshopsByPhase,
    WORKSHOP_PHASE_VALUES,
    type WorkshopPhase,
} from '@/lib/workshops/workshopPhase';
import type { WorkshopAdminSummary } from '@/lib/workshops/workshopTypes';
import { ChevronDown, RefreshCw, Search } from 'lucide-react';
import { useId, useMemo, useState } from 'react';

type WorkshopSelectorCardListProps = {
    readonly label: string;
    readonly workshops: readonly WorkshopAdminSummary[];
    readonly selectedWorkshopId: string | null;
    readonly isLoading: boolean;
    readonly emptyMessage: string;
    readonly onSelect: (workshopId: string) => void;
};

const CZECH_LOCALE = 'cs-CZ';
const WORKSHOP_CARD_GRID_CLASS_NAME = 'grid grid-cols-1 gap-1.5 xl:grid-cols-2';
const WORKSHOP_LIST_CLASS_NAME =
    'mt-3 space-y-3 lg:max-h-[min(34rem,calc(100dvh-31rem))] lg:overflow-y-auto lg:pr-1';
const WORKSHOP_HISTORY_CATEGORY_LABEL = 'Historie';

/**
 * The administration names an active category with the same label as its badge, so a term cannot be called one thing
 * in the selector and another in its card. History is the one exception because it is a disclosure of the past,
 * rather than another past-term badge.
 */
function getWorkshopPhaseCategoryLabel(phase: WorkshopPhase): string {
    return phase === 'past' ? WORKSHOP_HISTORY_CATEGORY_LABEL : getWorkshopPhaseAppearance(phase).label;
}

function normalizeWorkshopSearchQuery(searchQuery: string): string {
    return searchQuery
        .trim()
        .toLocaleLowerCase(CZECH_LOCALE)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function isWorkshopMatchingSearchQuery(workshop: WorkshopAdminSummary, normalizedSearchQuery: string): boolean {
    if (normalizedSearchQuery.length === 0) {
        return true;
    }

    return normalizeWorkshopSearchQuery(`${workshop.title} ${workshop.slug}`).includes(normalizedSearchQuery);
}

type WorkshopSelectorCardGridProps = {
    readonly accessibleLabel: string;
    readonly workshops: readonly WorkshopAdminSummary[];
    readonly selectedWorkshopId: string | null;
    readonly onSelect: (workshopId: string) => void;
};

/**
 * Renders each selectable workshop in one place, so the current terms and the progressively disclosed archive stay
 * equally informative and behave identically.
 */
function WorkshopSelectorCardGrid({
    accessibleLabel,
    workshops,
    selectedWorkshopId,
    onSelect,
}: WorkshopSelectorCardGridProps) {
    return (
        <ul aria-label={accessibleLabel} className={WORKSHOP_CARD_GRID_CLASS_NAME}>
            {workshops.map((workshop) => (
                <li key={workshop.id} className="min-w-0">
                    <WorkshopSelectorCard
                        workshop={workshop}
                        isSelected={workshop.id === selectedWorkshopId}
                        onSelect={onSelect}
                    />
                </li>
            ))}
        </ul>
    );
}

/**
 * Offers every occurrence as a card in the five shared time categories. An administrator gets the workshop that is
 * running first, the one they are wrapping up next, then the terms to prepare soon and later, while the old archive
 * remains available on demand.
 */
export function WorkshopSelectorCardList({
    label,
    workshops,
    selectedWorkshopId,
    isLoading,
    emptyMessage,
    onSelect,
}: WorkshopSelectorCardListProps) {
    const searchInputId = useId();
    const pastWorkshopsListId = useId();
    const [searchQuery, setSearchQuery] = useState('');
    const [isPastWorkshopsExpanded, setIsPastWorkshopsExpanded] = useState(false);
    const normalizedSearchQuery = useMemo(() => normalizeWorkshopSearchQuery(searchQuery), [searchQuery]);
    const matchingWorkshops = useMemo(() => {
        return workshops.filter((workshop) => isWorkshopMatchingSearchQuery(workshop, normalizedSearchQuery));
    }, [normalizedSearchQuery, workshops]);
    const matchingWorkshopsByPhase = useMemo(() => groupWorkshopsByPhase(matchingWorkshops), [matchingWorkshops]);
    const pastWorkshops = matchingWorkshopsByPhase.past;
    const selectedWorkshop = workshops.find((workshop) => workshop.id === selectedWorkshopId);
    const isSelectedWorkshopInHistory =
        selectedWorkshop !== undefined && getWorkshopPhase(selectedWorkshop) === 'past';
    const isSearchQueryPresent = normalizedSearchQuery.length > 0;
    const isPastWorkshopsVisible = isPastWorkshopsExpanded || isSelectedWorkshopInHistory || isSearchQueryPresent;

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</h2>
            {isLoading ? (
                <div className="flex justify-center py-6">
                    <RefreshCw className="h-4 w-4 animate-spin text-cyan-600" aria-label="Načítání" />
                </div>
            ) : workshops.length === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
                    {emptyMessage}
                </p>
            ) : (
                <>
                    <label htmlFor={searchInputId} className="sr-only">
                        Hledat workshop
                    </label>
                    <div className="relative mt-3">
                        <Search
                            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                            aria-hidden="true"
                        />
                        <Input
                            id={searchInputId}
                            type="search"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Hledat workshop"
                            className="h-9 pl-9"
                        />
                    </div>
                    {matchingWorkshops.length === 0 ? (
                        <p className="mt-3 rounded-xl border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
                            Žádný workshop neodpovídá hledání.
                        </p>
                    ) : (
                        <div className={WORKSHOP_LIST_CLASS_NAME}>
                            {WORKSHOP_PHASE_VALUES.filter((phase) => phase !== 'past').map((phase) => {
                                const workshopsInPhase = matchingWorkshopsByPhase[phase];
                                const phaseCategoryLabel = getWorkshopPhaseCategoryLabel(phase);
                                const phaseSectionId = `${pastWorkshopsListId}-${phase}`;

                                return workshopsInPhase.length === 0 ? null : (
                                    <section key={phase} aria-labelledby={phaseSectionId}>
                                        <h3
                                            id={phaseSectionId}
                                            className="px-1 text-xs font-semibold uppercase tracking-wider text-slate-500"
                                        >
                                            {phaseCategoryLabel} ({workshopsInPhase.length})
                                        </h3>
                                        <div className="mt-1.5">
                                            <WorkshopSelectorCardGrid
                                                accessibleLabel={`Seznam workshopů: ${phaseCategoryLabel}`}
                                                workshops={workshopsInPhase}
                                                selectedWorkshopId={selectedWorkshopId}
                                                onSelect={onSelect}
                                            />
                                        </div>
                                    </section>
                                );
                            })}

                            {pastWorkshops.length > 0 && (
                                <section>
                                    <button
                                        type="button"
                                        aria-controls={pastWorkshopsListId}
                                        aria-expanded={isPastWorkshopsVisible}
                                        onClick={() => setIsPastWorkshopsExpanded((isExpanded) => !isExpanded)}
                                        className="flex w-full items-center justify-between rounded-lg px-1 py-1 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 transition-colors hover:text-slate-800"
                                    >
                                        {WORKSHOP_HISTORY_CATEGORY_LABEL} ({pastWorkshops.length})
                                        <ChevronDown
                                            className={`h-4 w-4 shrink-0 transition-transform ${isPastWorkshopsVisible ? 'rotate-180' : ''}`}
                                            aria-hidden="true"
                                        />
                                    </button>
                                    {isPastWorkshopsVisible && (
                                        <div className="mt-1.5" id={pastWorkshopsListId}>
                                            <WorkshopSelectorCardGrid
                                                accessibleLabel="Historie workshopů"
                                                workshops={pastWorkshops}
                                                selectedWorkshopId={selectedWorkshopId}
                                                onSelect={onSelect}
                                            />
                                        </div>
                                    )}
                                </section>
                            )}
                        </div>
                    )}
                </>
            )}
        </section>
    );
}

exec
/bin/zsh -lc 'cat lib/workshops/workshopPhase.ts && cat components/workshops/workshopPhaseAppearance.ts' in /Users/hejny/work/aldaron
 succeeded in 0ms:
import {
    DEFAULT_WORKSHOP_DURATION_MINUTES,
    FRESHLY_PAST_WORKSHOP_HOURS,
    UPCOMING_NEXT_WEEK_WORKSHOP_HOURS,
} from '@/lib/workshops/workshopConstants';

const MILLISECONDS_PER_MINUTE = 60 * 1000;
const MILLISECONDS_PER_HOUR = 60 * MILLISECONDS_PER_MINUTE;

/**
 * Where one occurrence currently stands in time, named from the most pressing phase to the least
 *
 * Note: An occurrence which has only just been held is a phase of its own rather than the beginning of the history,
 *       because what a member does with a workshop of yesterday evening — its room, its recording, its materials — has
 *       nothing to do with what they do with a workshop of last spring.
 * Note: An occurrence which starts during the next seven days is also a phase of its own, so a schedule can call
 *       attention to the terms somebody still has time to plan for without each surface calculating that window again.
 * Note: This order is what ranks the phases wherever they are listed, coloured, or grouped, so a phase is placed among
 *       the others only here.
 */
export const WORKSHOP_PHASE_VALUES = ['ongoing', 'freshly-past', 'upcoming-next-week', 'upcoming', 'past'] as const;

export type WorkshopPhase = (typeof WORKSHOP_PHASE_VALUES)[number];

/**
 * Whether an occurrence of this phase has already been held, however long ago that was
 *
 * Note: This is the one answer to the question everything which opens after a workshop asks — the wrap-up, the
 *       feedback, and the recording — so a workshop which has only just ended is over exactly as much as one which
 *       ended a year ago.
 */
export function isWorkshopPhasePast(phase: WorkshopPhase): boolean {
    return phase === 'freshly-past' || phase === 'past';
}

/**
 * Whether an occurrence of this phase has not started yet, whether it starts soon or later.
 *
 * Note: Follow-up recommendations need one answer to this question. A term within the next week remains the next
 *       workshop just as much as a term next month does, even though the schedule gives the nearer one a special
 *       badge.
 */
export function isWorkshopPhaseUpcoming(phase: WorkshopPhase): boolean {
    return phase === 'upcoming-next-week' || phase === 'upcoming';
}

/**
 * As much of a workshop as it takes to decide when it happens
 *
 * Note: Both a summary and the full details of a workshop satisfy this shape, so nothing has to be loaded just to
 *       place an occurrence in time.
 * Note: An occurrence without an end has not ended. It runs for as long as it takes and is only over once its end is
 *       recorded, which is what the administration does when the workshop is really finished.
 */
export type WorkshopOccurrenceTiming = {
    readonly startsAt: string;
    readonly endsAt: string | null;
};

/**
 * How pressing one phase is, which is nothing but the order the phases are named in
 */
function getWorkshopPhaseRank(phase: WorkshopPhase): number {
    return WORKSHOP_PHASE_VALUES.indexOf(phase);
}

/**
 * Moment an occurrence was really given as its end, or `null` while that end is left open
 *
 * Note: This is the single rule for whether an occurrence has an end at all, so nothing decides on its own that an
 *       unwritten or nonsensical end means the workshop is over.
 */
export function getWorkshopRecordedEndsAtMilliseconds(occurrence: WorkshopOccurrenceTiming): number | null {
    const endsAtMilliseconds = occurrence.endsAt === null ? Number.NaN : Date.parse(occurrence.endsAt);

    return endsAtMilliseconds > Date.parse(occurrence.startsAt) ? endsAtMilliseconds : null;
}

/**
 * Whether an occurrence still has no end, so it runs until the administration ends it
 */
export function isWorkshopEndOpen(occurrence: WorkshopOccurrenceTiming): boolean {
    return getWorkshopRecordedEndsAtMilliseconds(occurrence) === null;
}

/**
 * Moment an occurrence is expected to end, taken from the usual length of a workshop while its end is left open
 *
 * Note: A calendar invitation and a duration label have to name a length before an occurrence has one, which is what
 *       this expectation is for. It deliberately never decides whether an occurrence is over — only a recorded end
 *       does that.
 */
export function getWorkshopExpectedEndsAtMilliseconds(occurrence: WorkshopOccurrenceTiming): number {
    return (
        getWorkshopRecordedEndsAtMilliseconds(occurrence) ??
        Date.parse(occurrence.startsAt) + DEFAULT_WORKSHOP_DURATION_MINUTES * MILLISECONDS_PER_MINUTE
    );
}

/**
 * Whether a future occurrence starts in the rolling window the schedule calls the next week.
 */
function isWorkshopStartingWithinNextWeek(
    startsAtMilliseconds: number,
    currentTimeMilliseconds: number,
): boolean {
    return (
        startsAtMilliseconds > currentTimeMilliseconds &&
        startsAtMilliseconds <= currentTimeMilliseconds + UPCOMING_NEXT_WEEK_WORKSHOP_HOURS * MILLISECONDS_PER_HOUR
    );
}

/**
 * Decides whether an occurrence is still ahead but imminent, further ahead, running right now, only just over, or
 * already history.
 *
 * Note: An occurrence whose end is open never becomes past by itself. It keeps running — and keeps its stage on —
 *       until an administrator records the end of it.
 * Note: How long an occurrence stays freshly past is counted from the end which was really recorded for it rather than
 *       from the end it was expected to have, so a workshop is never called fresh before anybody ended it.
 *
 * @param currentTimeMilliseconds moment to compare against, so a list places every occurrence against the same instant
 */
export function getWorkshopPhase(
    occurrence: WorkshopOccurrenceTiming,
    currentTimeMilliseconds = Date.now(),
): WorkshopPhase {
    const startsAtMilliseconds = Date.parse(occurrence.startsAt);
    if (isWorkshopStartingWithinNextWeek(startsAtMilliseconds, currentTimeMilliseconds)) {
        return 'upcoming-next-week';
    }

    if (startsAtMilliseconds > currentTimeMilliseconds) {
        return 'upcoming';
    }

    const recordedEndsAtMilliseconds = getWorkshopRecordedEndsAtMilliseconds(occurrence);
    if (recordedEndsAtMilliseconds === null || recordedEndsAtMilliseconds > currentTimeMilliseconds) {
        return 'ongoing';
    }

    const millisecondsSinceEnd = currentTimeMilliseconds - recordedEndsAtMilliseconds;
    return millisecondsSinceEnd <= FRESHLY_PAST_WORKSHOP_HOURS * MILLISECONDS_PER_HOUR ? 'freshly-past' : 'past';
}

/**
 * The one phase which speaks for a group of occurrences, which is the most pressing among them
 *
 * Note: A day of a calendar carries whatever terms fall on it, and it can only be coloured by one of them. It is
 *       coloured by the very same ranking which puts a running term on top of a list, so a day where something is
 *       happening right now never looks like history.
 */
export function getMostProminentWorkshopPhase(phases: readonly WorkshopPhase[]): WorkshopPhase {
    return phases.reduce(
        (mostProminentPhase, phase) =>
            getWorkshopPhaseRank(phase) < getWorkshopPhaseRank(mostProminentPhase) ? phase : mostProminentPhase,
        'past',
    );
}

/**
 * The two keys which order one occurrence among the others
 *
 * Note: The history is ranked by its negated date, so the term which ended last leads it while the future is led by
 *       the term which starts next. The most relevant occurrence of every group therefore stays on top of it.
 */
function getWorkshopPhaseOrder(
    occurrence: WorkshopOccurrenceTiming,
    currentTimeMilliseconds: number,
): { readonly phaseRank: number; readonly dateRank: number } {
    const phase = getWorkshopPhase(occurrence, currentTimeMilliseconds);
    const startsAtMilliseconds = Date.parse(occurrence.startsAt);
    const dateRank = Number.isFinite(startsAtMilliseconds) ? startsAtMilliseconds : 0;

    return { phaseRank: getWorkshopPhaseRank(phase), dateRank: isWorkshopPhasePast(phase) ? -dateRank : dateRank };
}

/**
 * Orders occurrences by their phase first and by their date within every phase
 *
 * @param currentTimeMilliseconds moment which decides the phases, so one list is never sorted against a moving instant
 */
export function sortWorkshopsByPhase<TWorkshop extends WorkshopOccurrenceTiming>(
    workshops: readonly TWorkshop[],
    currentTimeMilliseconds = Date.now(),
): readonly TWorkshop[] {
    return workshops
        .map((workshop) => ({ workshop, order: getWorkshopPhaseOrder(workshop, currentTimeMilliseconds) }))
        .sort(
            (firstEntry, secondEntry) =>
                firstEntry.order.phaseRank - secondEntry.order.phaseRank ||
                firstEntry.order.dateRank - secondEntry.order.dateRank,
        )
        .map(({ workshop }) => workshop);
}

/**
 * Splits occurrences into the same ordered phases which administration and public listings use.
 *
 * Keeping the ordering and the grouping together means a picker can progressively disclose an archive without
 * teaching a second place which workshop belongs before, during, or after the current moment.
 */
export function groupWorkshopsByPhase<TWorkshop extends WorkshopOccurrenceTiming>(
    workshops: readonly TWorkshop[],
    currentTimeMilliseconds = Date.now(),
): Readonly<Record<WorkshopPhase, readonly TWorkshop[]>> {
    const workshopsByPhase: Record<WorkshopPhase, TWorkshop[]> = {
        ongoing: [],
        'freshly-past': [],
        'upcoming-next-week': [],
        upcoming: [],
        past: [],
    };

    for (const workshop of sortWorkshopsByPhase(workshops, currentTimeMilliseconds)) {
        workshopsByPhase[getWorkshopPhase(workshop, currentTimeMilliseconds)].push(workshop);
    }

    return workshopsByPhase;
}
import type { WorkshopPhase } from '@/lib/workshops/workshopPhase';

/**
 * Backgrounds a phase is drawn on: the light administration and a room following the member's theme.
 */
export type WorkshopPhaseTone = 'light' | 'room';

/**
 * How one phase names itself and which colour says so
 */
export type WorkshopPhaseAppearance = {
    /**
     * How this phase is named wherever a term of it is listed
     */
    readonly label: string;

    /**
     * Classes of the badge which names this phase on each of the two backgrounds
     */
    readonly badgeClassNameByTone: Readonly<Record<WorkshopPhaseTone, string>>;

    /**
     * Classes of a calendar day which carries a term of this phase
     */
    readonly calendarDayClassName: string;

    /**
     * Classes of the small mark standing for one term of this phase inside a calendar day and in its legend
     */
    readonly markClassName: string;
};

/**
 * The one description of how every phase looks, wherever a term is listed
 *
 * Note: A list of cards and a calendar of the same terms say the very same thing with the very same colour - green
 *       runs right now, amber has only just been held, violet starts within a week, cyan is further ahead, and grey is
 *       history - because both of them read their colours here instead of choosing their own.
 * Note: These colours live beside the components which wear them rather than among the rules of the application,
 *       because only the directories of the components are read for the styles the application is built with.
 */
const WORKSHOP_PHASE_APPEARANCES: Readonly<Record<WorkshopPhase, WorkshopPhaseAppearance>> = {
    ongoing: {
        label: 'Probíhá',
        badgeClassNameByTone: {
            light: 'bg-emerald-100 text-emerald-800',
            room: 'bg-room-success/15 text-room-success ring-1 ring-inset ring-room-success/40',
        },
        calendarDayClassName: 'border-room-success/50 bg-room-success/15 text-room-success',
        markClassName: 'bg-room-success',
    },
    // Note: A term which has only just been held is neither what is happening nor what is long over, and it is drawn
    //       as exactly that: warm enough to be noticed among the history, quiet enough never to be mistaken for a
    //       workshop which is still running.
    'freshly-past': {
        label: 'Právě proběhlo',
        badgeClassNameByTone: {
            light: 'bg-amber-100 text-amber-800',
            room: 'bg-room-warning/15 text-room-warning ring-1 ring-inset ring-room-warning/40',
        },
        calendarDayClassName: 'border-room-warning/40 bg-room-warning/10 text-room-warning',
        markClassName: 'bg-room-warning',
    },
    // Note: This stays distinct from the ordinary upcoming cyan so the special badge is useful even when a reader
    //       cannot infer a date at a glance.
    'upcoming-next-week': {
        label: 'Tento týden',
        badgeClassNameByTone: {
            light: 'bg-violet-100 text-violet-800',
            room: 'bg-room-upcoming/15 text-room-upcoming ring-1 ring-inset ring-room-upcoming/40',
        },
        calendarDayClassName: 'border-room-upcoming/40 bg-room-upcoming/10 text-room-upcoming',
        markClassName: 'bg-room-upcoming',
    },
    upcoming: {
        label: 'Nadchází',
        badgeClassNameByTone: {
            light: 'bg-cyan-100 text-cyan-800',
            room: 'bg-room-accent/15 text-room-accent ring-1 ring-inset ring-room-accent/40',
        },
        calendarDayClassName: 'border-room-accent/40 bg-room-accent/10 text-room-accent',
        markClassName: 'bg-room-action',
    },
    past: {
        label: 'Proběhlo',
        badgeClassNameByTone: {
            light: 'bg-slate-100 text-slate-500',
            room: 'bg-room-overlay/5 text-room-muted ring-1 ring-inset ring-room-border/10',
        },
        calendarDayClassName: 'border-room-muted/25 bg-room-muted/10 text-room-text',
        markClassName: 'bg-room-muted',
    },
};

export function getWorkshopPhaseAppearance(phase: WorkshopPhase): WorkshopPhaseAppearance {
    return WORKSHOP_PHASE_APPEARANCES[phase];
}

exec
/bin/zsh -lc "rg -n 'getWorkshopPhase|upcoming-next-week|WORKSHOP_PHASE|WorkshopPhase' lib components businesses tests --glob '"'!*.snap'"' && rg -n 'Prague|Europe/Prague|DayKey|dayKey' lib/utils lib/workshops components/workshops --glob '"'!*.test.*'"' && cat vitest.config.*" in /Users/hejny/work/aldaron
 exited 2 in 0ms:
businesses/workshop-admin/WorkshopSettingsForm.tsx:28:import { getWorkshopPhase } from '@/lib/workshops/workshopPhase';
businesses/workshop-admin/WorkshopSettingsForm.tsx:103:        getWorkshopPhase({ startsAt: startsAtIso, endsAt: endsAtIso }) === 'ongoing';
components/events/EventTermOptionCard.tsx:1:import { WorkshopPhaseBadge } from '@/components/workshops/WorkshopPhaseBadge';
components/events/EventTermOptionCard.tsx:7:import { getWorkshopPhase } from '@/lib/workshops/workshopPhase';
components/events/EventTermOptionCard.tsx:177:    const phase = getWorkshopPhase(occurrence, Date.parse(currentTime));
components/events/EventTermOptionCard.tsx:178:    const isWorkshopStartingWithinNextWeek = phase === 'upcoming-next-week';
components/events/EventTermOptionCard.tsx:203:                    <WorkshopPhaseBadge
businesses/workshop-admin/WorkshopSelectorCard.tsx:12:import { WorkshopPhaseBadge } from '@/components/workshops/WorkshopPhaseBadge';
businesses/workshop-admin/WorkshopSelectorCard.tsx:13:import { getWorkshopPhase } from '@/lib/workshops/workshopPhase';
businesses/workshop-admin/WorkshopSelectorCard.tsx:39:                <WorkshopPhaseBadge phase={getWorkshopPhase(workshop)} className="!px-2 !py-0.5 !text-[11px]" />
businesses/workshop-admin/WorkshopSelectorCardList.test.tsx:40:    id: 'upcoming-next-week-workshop-id',
businesses/workshop-admin/WorkshopSelectorCardList.tsx:5:import { getWorkshopPhaseAppearance } from '@/components/workshops/workshopPhaseAppearance';
businesses/workshop-admin/WorkshopSelectorCardList.tsx:7:    getWorkshopPhase,
businesses/workshop-admin/WorkshopSelectorCardList.tsx:9:    WORKSHOP_PHASE_VALUES,
businesses/workshop-admin/WorkshopSelectorCardList.tsx:10:    type WorkshopPhase,
businesses/workshop-admin/WorkshopSelectorCardList.tsx:36:function getWorkshopPhaseCategoryLabel(phase: WorkshopPhase): string {
businesses/workshop-admin/WorkshopSelectorCardList.tsx:37:    return phase === 'past' ? WORKSHOP_HISTORY_CATEGORY_LABEL : getWorkshopPhaseAppearance(phase).label;
businesses/workshop-admin/WorkshopSelectorCardList.tsx:113:        selectedWorkshop !== undefined && getWorkshopPhase(selectedWorkshop) === 'past';
businesses/workshop-admin/WorkshopSelectorCardList.tsx:153:                            {WORKSHOP_PHASE_VALUES.filter((phase) => phase !== 'past').map((phase) => {
businesses/workshop-admin/WorkshopSelectorCardList.tsx:155:                                const phaseCategoryLabel = getWorkshopPhaseCategoryLabel(phase);
components/workshops/workshopPhaseAppearance.ts:1:import type { WorkshopPhase } from '@/lib/workshops/workshopPhase';
components/workshops/workshopPhaseAppearance.ts:6:export type WorkshopPhaseTone = 'light' | 'room';
components/workshops/workshopPhaseAppearance.ts:11:export type WorkshopPhaseAppearance = {
components/workshops/workshopPhaseAppearance.ts:20:    readonly badgeClassNameByTone: Readonly<Record<WorkshopPhaseTone, string>>;
components/workshops/workshopPhaseAppearance.ts:42:const WORKSHOP_PHASE_APPEARANCES: Readonly<Record<WorkshopPhase, WorkshopPhaseAppearance>> = {
components/workshops/workshopPhaseAppearance.ts:66:    'upcoming-next-week': {
components/workshops/workshopPhaseAppearance.ts:95:export function getWorkshopPhaseAppearance(phase: WorkshopPhase): WorkshopPhaseAppearance {
components/workshops/workshopPhaseAppearance.ts:96:    return WORKSHOP_PHASE_APPEARANCES[phase];
components/workshops/WorkshopLinksPanel.test.tsx:9:import { getWorkshopPhaseAppearance } from '@/components/workshops/workshopPhaseAppearance';
components/workshops/WorkshopLinksPanel.test.tsx:161:            getWorkshopPhaseAppearance('ongoing').calendarDayClassName,
components/workshops/WorkshopLinksPanel.test.tsx:164:            getWorkshopPhaseAppearance('upcoming').calendarDayClassName,
components/workshops/WorkshopLinksPanel.test.tsx:220:            getWorkshopPhaseAppearance('upcoming-next-week').calendarDayClassName,
components/workshops/WorkshopLinksPanel.test.tsx:268:            getWorkshopPhaseAppearance('freshly-past').calendarDayClassName,
components/workshops/WorkshopLinksPanel.test.tsx:271:            getWorkshopPhaseAppearance('ongoing').calendarDayClassName,
lib/events/eventListing.ts:10:import { getWorkshopPhase, sortWorkshopsByPhase, type WorkshopPhase } from '@/lib/workshops/workshopPhase';
lib/events/eventListing.ts:32:    readonly phase: WorkshopPhase;
lib/events/eventListing.ts:82:                      phase: getWorkshopPhase(workshop, currentTimeMilliseconds),
lib/events/eventListing.test.ts:36:    id: 'upcoming-next-week-workshop-id',
lib/events/eventListing.test.ts:89:            'upcoming-next-week',
components/workshops/WorkshopEventCard.tsx:2:import { WorkshopPhaseBadge } from '@/components/workshops/WorkshopPhaseBadge';
components/workshops/WorkshopEventCard.tsx:11:import { isWorkshopPhasePast } from '@/lib/workshops/workshopPhase';
components/workshops/WorkshopEventCard.tsx:81:    const isRecordingDurationShown = isWorkshopPhasePast(phase) && recordingDurationSeconds !== null;
components/workshops/WorkshopEventCard.tsx:101:                        <WorkshopPhaseBadge phase={phase} tone="room" />
components/workshops/WorkshopPhaseBadge.tsx:2:    getWorkshopPhaseAppearance,
components/workshops/WorkshopPhaseBadge.tsx:3:    type WorkshopPhaseTone,
components/workshops/WorkshopPhaseBadge.tsx:6:import type { WorkshopPhase } from '@/lib/workshops/workshopPhase';
components/workshops/WorkshopPhaseBadge.tsx:8:type WorkshopPhaseBadgeProps = {
components/workshops/WorkshopPhaseBadge.tsx:9:    readonly phase: WorkshopPhase;
components/workshops/WorkshopPhaseBadge.tsx:14:    readonly tone?: WorkshopPhaseTone;
components/workshops/WorkshopPhaseBadge.tsx:21:export function WorkshopPhaseBadge({ phase, tone = 'light', className }: WorkshopPhaseBadgeProps) {
components/workshops/WorkshopPhaseBadge.tsx:22:    const { label, badgeClassNameByTone } = getWorkshopPhaseAppearance(phase);
components/workshops/WorkshopCalendarMonth.tsx:5:import { getWorkshopPhaseAppearance } from '@/components/workshops/workshopPhaseAppearance';
components/workshops/WorkshopCalendarMonth.tsx:23:import { WORKSHOP_PHASE_VALUES } from '@/lib/workshops/workshopPhase';
components/workshops/WorkshopCalendarMonth.tsx:55:            {WORKSHOP_PHASE_VALUES.map((phase) => {
components/workshops/WorkshopCalendarMonth.tsx:56:                const { label, markClassName } = getWorkshopPhaseAppearance(phase);
components/workshops/WorkshopCalendarDay.tsx:1:import { getWorkshopPhaseAppearance } from '@/components/workshops/workshopPhaseAppearance';
components/workshops/WorkshopCalendarDay.tsx:5:import { getMostProminentWorkshopPhase, type WorkshopPhase } from '@/lib/workshops/workshopPhase';
components/workshops/WorkshopCalendarDay.tsx:37:function WorkshopCalendarDayMark({ phase }: { readonly phase: WorkshopPhase }) {
components/workshops/WorkshopCalendarDay.tsx:40:            className={classNames('h-1.5 w-1.5 shrink-0 rounded-full', getWorkshopPhaseAppearance(phase).markClassName)}
components/workshops/WorkshopCalendarDay.tsx:63:        ? getWorkshopPhaseAppearance(getMostProminentWorkshopPhase(listings.map((listing) => listing.phase)))
businesses/online-workshop/participant/WorkshopWrapUpNavigation.tsx:9:import { isWorkshopPhaseUpcoming } from '@/lib/workshops/workshopPhase';
businesses/online-workshop/participant/WorkshopWrapUpNavigation.tsx:38:    }).filter((listing) => isWorkshopPhaseUpcoming(listing.phase) && !isExternalEventType(listing.event.type));
businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx:70:        ...termsByPhase['upcoming-next-week'],
businesses/online-workshop/participant/WorkshopStage.tsx:14:import { getWorkshopPhase, isWorkshopPhasePast } from '@/lib/workshops/workshopPhase';
businesses/online-workshop/participant/WorkshopStage.tsx:108:    const phase = getWorkshopPhase(workshop, currentTime);
businesses/online-workshop/participant/WorkshopStage.tsx:110:    const isWorkshopPast = isWorkshopPhasePast(phase);
lib/workshops/workshopWrapUpExport.ts:4:import { getWorkshopPhase, isWorkshopPhasePast } from '@/lib/workshops/workshopPhase';
lib/workshops/workshopWrapUpExport.ts:27:        && isWorkshopPhasePast(getWorkshopPhase(source.workshop, Date.parse(source.serverTime)));
businesses/workshop-admin/agents/WorkshopAgentListening.tsx:4:import { getWorkshopPhase } from '@/lib/workshops/workshopPhase';
businesses/workshop-admin/agents/WorkshopAgentListening.tsx:20:    const isLive = getWorkshopPhase(workshop) === 'ongoing' && workshop.isPublished && !workshop.disabledPanels.includes('chat');
lib/workshops/workshopPublic.ts:4:import { getWorkshopPhase, isWorkshopPhasePast } from '@/lib/workshops/workshopPhase';
lib/workshops/workshopPublic.ts:129:                isRecordingAvailable: isWorkshopPhasePast(
lib/workshops/workshopPublic.ts:130:                    getWorkshopPhase(
lib/workshops/workshopPhase.test.ts:3:    getMostProminentWorkshopPhase,
lib/workshops/workshopPhase.test.ts:5:    getWorkshopPhase,
lib/workshops/workshopPhase.test.ts:7:    isWorkshopPhasePast,
lib/workshops/workshopPhase.test.ts:8:    isWorkshopPhaseUpcoming,
lib/workshops/workshopPhase.test.ts:55:        expect(getWorkshopPhase(UPCOMING_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming');
lib/workshops/workshopPhase.test.ts:56:        expect(getWorkshopPhase(UPCOMING_NEXT_WEEK_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming-next-week');
lib/workshops/workshopPhase.test.ts:57:        expect(getWorkshopPhase(ONGOING_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('ongoing');
lib/workshops/workshopPhase.test.ts:58:        expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('freshly-past');
lib/workshops/workshopPhase.test.ts:59:        expect(getWorkshopPhase(PAST_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('past');
lib/workshops/workshopPhase.test.ts:63:        expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, Date.parse('2026-08-20T20:30:01+02:00'))).toBe('freshly-past');
lib/workshops/workshopPhase.test.ts:64:        expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('freshly-past');
lib/workshops/workshopPhase.test.ts:65:        expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, Date.parse('2026-08-21T20:30:01+02:00'))).toBe('past');
lib/workshops/workshopPhase.test.ts:69:        expect(isWorkshopPhasePast('freshly-past')).toBe(true);
lib/workshops/workshopPhase.test.ts:70:        expect(isWorkshopPhasePast('past')).toBe(true);
lib/workshops/workshopPhase.test.ts:71:        expect(isWorkshopPhasePast('ongoing')).toBe(false);
lib/workshops/workshopPhase.test.ts:72:        expect(isWorkshopPhasePast('upcoming-next-week')).toBe(false);
lib/workshops/workshopPhase.test.ts:73:        expect(isWorkshopPhasePast('upcoming')).toBe(false);
lib/workshops/workshopPhase.test.ts:86:        expect(getWorkshopPhase(workshopAtNextWeekBoundary, CURRENT_TIME_MILLISECONDS)).toBe('upcoming-next-week');
lib/workshops/workshopPhase.test.ts:87:        expect(getWorkshopPhase(workshopAfterNextWeekBoundary, CURRENT_TIME_MILLISECONDS)).toBe('upcoming');
lib/workshops/workshopPhase.test.ts:91:        expect(isWorkshopPhaseUpcoming('upcoming-next-week')).toBe(true);
lib/workshops/workshopPhase.test.ts:92:        expect(isWorkshopPhaseUpcoming('upcoming')).toBe(true);
lib/workshops/workshopPhase.test.ts:93:        expect(isWorkshopPhaseUpcoming('ongoing')).toBe(false);
lib/workshops/workshopPhase.test.ts:94:        expect(isWorkshopPhaseUpcoming('freshly-past')).toBe(false);
lib/workshops/workshopPhase.test.ts:95:        expect(isWorkshopPhaseUpcoming('past')).toBe(false);
lib/workshops/workshopPhase.test.ts:99:        expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-08-22T19:00:00+02:00'))).toBe('ongoing');
lib/workshops/workshopPhase.test.ts:105:        expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('ongoing');
lib/workshops/workshopPhase.test.ts:106:        expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('ongoing');
lib/workshops/workshopPhase.test.ts:107:        expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-12-24T18:00:00+01:00'))).toBe('ongoing');
lib/workshops/workshopPhase.test.ts:108:        expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-08-21T18:59:59+02:00'))).toBe(
lib/workshops/workshopPhase.test.ts:109:            'upcoming-next-week',
lib/workshops/workshopPhase.test.ts:120:        expect(getWorkshopPhase(endedWorkshop, Date.parse('2026-08-21T20:11:00+02:00'))).toBe('ongoing');
lib/workshops/workshopPhase.test.ts:121:        expect(getWorkshopPhase(endedWorkshop, Date.parse('2026-08-21T20:13:00+02:00'))).toBe('freshly-past');
lib/workshops/workshopPhase.test.ts:122:        expect(getWorkshopPhase(endedWorkshop, Date.parse('2026-08-23T20:13:00+02:00'))).toBe('past');
lib/workshops/workshopPhase.test.ts:135:        expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T19:00:00+02:00'))).toBe('ongoing');
lib/workshops/workshopPhase.test.ts:136:        expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T18:59:59+02:00'))).toBe(
lib/workshops/workshopPhase.test.ts:137:            'upcoming-next-week',
lib/workshops/workshopPhase.test.ts:139:        expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('freshly-past');
lib/workshops/workshopPhase.test.ts:194:            'upcoming-next-week': [UPCOMING_NEXT_WEEK_WORKSHOP],
lib/workshops/workshopPhase.test.ts:201:        expect(getMostProminentWorkshopPhase(['past', 'upcoming', 'ongoing'])).toBe('ongoing');
lib/workshops/workshopPhase.test.ts:202:        expect(getMostProminentWorkshopPhase(['past', 'upcoming', 'upcoming-next-week'])).toBe('upcoming-next-week');
lib/workshops/workshopPhase.test.ts:203:        expect(getMostProminentWorkshopPhase(['past', 'freshly-past', 'upcoming'])).toBe('freshly-past');
lib/workshops/workshopPhase.test.ts:204:        expect(getMostProminentWorkshopPhase(['past', 'freshly-past'])).toBe('freshly-past');
lib/workshops/workshopPhase.test.ts:205:        expect(getMostProminentWorkshopPhase(['past'])).toBe('past');
lib/workshops/workshopPhase.test.ts:206:        expect(getMostProminentWorkshopPhase([])).toBe('past');
lib/workshops/workshopPhase.ts:21:export const WORKSHOP_PHASE_VALUES = ['ongoing', 'freshly-past', 'upcoming-next-week', 'upcoming', 'past'] as const;
lib/workshops/workshopPhase.ts:23:export type WorkshopPhase = (typeof WORKSHOP_PHASE_VALUES)[number];
lib/workshops/workshopPhase.ts:32:export function isWorkshopPhasePast(phase: WorkshopPhase): boolean {
lib/workshops/workshopPhase.ts:43:export function isWorkshopPhaseUpcoming(phase: WorkshopPhase): boolean {
lib/workshops/workshopPhase.ts:44:    return phase === 'upcoming-next-week' || phase === 'upcoming';
lib/workshops/workshopPhase.ts:63:function getWorkshopPhaseRank(phase: WorkshopPhase): number {
lib/workshops/workshopPhase.ts:64:    return WORKSHOP_PHASE_VALUES.indexOf(phase);
lib/workshops/workshopPhase.ts:124:export function getWorkshopPhase(
lib/workshops/workshopPhase.ts:127:): WorkshopPhase {
lib/workshops/workshopPhase.ts:130:        return 'upcoming-next-week';
lib/workshops/workshopPhase.ts:153:export function getMostProminentWorkshopPhase(phases: readonly WorkshopPhase[]): WorkshopPhase {
lib/workshops/workshopPhase.ts:156:            getWorkshopPhaseRank(phase) < getWorkshopPhaseRank(mostProminentPhase) ? phase : mostProminentPhase,
lib/workshops/workshopPhase.ts:167:function getWorkshopPhaseOrder(
lib/workshops/workshopPhase.ts:171:    const phase = getWorkshopPhase(occurrence, currentTimeMilliseconds);
lib/workshops/workshopPhase.ts:175:    return { phaseRank: getWorkshopPhaseRank(phase), dateRank: isWorkshopPhasePast(phase) ? -dateRank : dateRank };
lib/workshops/workshopPhase.ts:188:        .map((workshop) => ({ workshop, order: getWorkshopPhaseOrder(workshop, currentTimeMilliseconds) }))
lib/workshops/workshopPhase.ts:206:): Readonly<Record<WorkshopPhase, readonly TWorkshop[]>> {
lib/workshops/workshopPhase.ts:207:    const workshopsByPhase: Record<WorkshopPhase, TWorkshop[]> = {
lib/workshops/workshopPhase.ts:210:        'upcoming-next-week': [],
lib/workshops/workshopPhase.ts:216:        workshopsByPhase[getWorkshopPhase(workshop, currentTimeMilliseconds)].push(workshop);
lib/workshops/agents/workshopAgentPolicy.ts:3:import { getWorkshopPhase } from '@/lib/workshops/workshopPhase';
lib/workshops/agents/workshopAgentPolicy.ts:16:        getWorkshopPhase({ startsAt: room.starts_at, endsAt: room.ends_at }) === 'ongoing';
lib/workshops/workshopDatabase.ts:32:import { getWorkshopPhase, isWorkshopPhasePast } from '@/lib/workshops/workshopPhase';
lib/workshops/workshopDatabase.ts:2478:    const isWorkshopPast = workshopRow.room_kind === 'workshop' && isWorkshopPhasePast(getWorkshopPhase(workshop));
rg: lib/utils: No such file or directory (os error 2)
components/workshops/WorkshopEventCardList.tsx:2:import type { CalendarDayKey } from '@/lib/calendar/calendarMonth';
components/workshops/WorkshopEventCardList.tsx:19:    readonly todayDayKey: CalendarDayKey;
components/workshops/WorkshopEventCardList.tsx:33:    todayDayKey,
components/workshops/WorkshopEventCardList.tsx:47:                        todayDayKey={todayDayKey}
components/workshops/WorkshopEventCard.tsx:4:import type { CalendarDayKey } from '@/lib/calendar/calendarMonth';
components/workshops/WorkshopEventCard.tsx:24:    readonly todayDayKey: CalendarDayKey;
components/workshops/WorkshopEventCard.tsx:35:    todayDayKey: CalendarDayKey,
components/workshops/WorkshopEventCard.tsx:51:    return `${formatCzechRelativeDayPrefix(listing.dayKey, todayDayKey)}${dateLabel} · ${timeLabel}`;
components/workshops/WorkshopEventCard.tsx:76:export function WorkshopEventCard({ listing, locale, timeZone, todayDayKey }: WorkshopEventCardProps) {
components/workshops/WorkshopEventCard.tsx:108:                        {formatEventListingDateTime(listing, todayDayKey, locale, timeZone)}
components/workshops/WorkshopLinksPanel.tsx:6:import { createCalendarDayKey } from '@/lib/calendar/calendarMonth';
components/workshops/WorkshopLinksPanel.tsx:81:    const todayDayKey = createCalendarDayKey(serverTime, timeZone);
components/workshops/WorkshopLinksPanel.tsx:125:                    todayDayKey={todayDayKey}
components/workshops/WorkshopLinksPanel.tsx:132:                    todayDayKey={todayDayKey}
components/workshops/WorkshopCalendarMonth.tsx:14:    type CalendarDayKey,
components/workshops/WorkshopCalendarMonth.tsx:19:    groupEventListingsByDayKey,
components/workshops/WorkshopCalendarMonth.tsx:46:    readonly todayDayKey: CalendarDayKey;
components/workshops/WorkshopCalendarMonth.tsx:76:export function WorkshopCalendarMonth({ listings, locale, timeZone, todayDayKey }: WorkshopCalendarMonthProps) {
components/workshops/WorkshopCalendarMonth.tsx:77:    const [shownMonthKey, setShownMonthKey] = useState(() => selectInitialCalendarMonthKey(listings, todayDayKey));
components/workshops/WorkshopCalendarMonth.tsx:78:    const [selectedDayKey, setSelectedDayKey] = useState<CalendarDayKey | null>(null);
components/workshops/WorkshopCalendarMonth.tsx:80:    const listingsByDayKey = useMemo(() => groupEventListingsByDayKey(listings), [listings]);
components/workshops/WorkshopCalendarMonth.tsx:84:        () => listings.filter((listing) => isCalendarDayInMonth(listing.dayKey, shownMonthKey)),
components/workshops/WorkshopCalendarMonth.tsx:92:        setSelectedDayKey(null);
components/workshops/WorkshopCalendarMonth.tsx:95:    const selectDay = (dayKey: CalendarDayKey) => {
components/workshops/WorkshopCalendarMonth.tsx:96:        setSelectedDayKey((previousDayKey) => (previousDayKey === dayKey ? null : dayKey));
components/workshops/WorkshopCalendarMonth.tsx:99:    const shownListings = selectedDayKey === null ? shownMonthListings : (listingsByDayKey.get(selectedDayKey) ?? []);
components/workshops/WorkshopCalendarMonth.tsx:101:        selectedDayKey === null
components/workshops/WorkshopCalendarMonth.tsx:103:            : formatCalendarDayTitle(selectedDayKey, locale);
components/workshops/WorkshopCalendarMonth.tsx:122:                        onClick={() => showMonth(getCalendarMonthKey(todayDayKey))}
components/workshops/WorkshopCalendarMonth.tsx:146:                    week.map((dayKey) => (
components/workshops/WorkshopCalendarMonth.tsx:148:                            key={dayKey}
components/workshops/WorkshopCalendarMonth.tsx:149:                            dayKey={dayKey}
components/workshops/WorkshopCalendarMonth.tsx:150:                            listings={listingsByDayKey.get(dayKey) ?? []}
components/workshops/WorkshopCalendarMonth.tsx:151:                            isInShownMonth={isCalendarDayInMonth(dayKey, shownMonthKey)}
components/workshops/WorkshopCalendarMonth.tsx:152:                            isToday={dayKey === todayDayKey}
components/workshops/WorkshopCalendarMonth.tsx:153:                            isSelected={dayKey === selectedDayKey}
components/workshops/WorkshopCalendarMonth.tsx:154:                            title={formatCalendarDayTitle(dayKey, locale)}
components/workshops/WorkshopCalendarMonth.tsx:165:                {selectedDayKey !== null && (
components/workshops/WorkshopCalendarMonth.tsx:168:                        onClick={() => setSelectedDayKey(null)}
components/workshops/WorkshopCalendarMonth.tsx:185:                    todayDayKey={todayDayKey}
components/workshops/WorkshopCalendarDay.tsx:2:import { getCalendarDayNumber, type CalendarDayKey } from '@/lib/calendar/calendarMonth';
components/workshops/WorkshopCalendarDay.tsx:13:    readonly dayKey: CalendarDayKey;
components/workshops/WorkshopCalendarDay.tsx:31:    readonly onSelect: (dayKey: CalendarDayKey) => void;
components/workshops/WorkshopCalendarDay.tsx:53:    dayKey,
components/workshops/WorkshopCalendarDay.tsx:76:            onClick={() => onSelect(dayKey)}
components/workshops/WorkshopCalendarDay.tsx:94:                {getCalendarDayNumber(dayKey)}
lib/workshops/workshopDate.ts:1:import type { CalendarDayKey } from '@/lib/calendar/calendarMonth';
lib/workshops/workshopDate.ts:7:const PRAGUE_TIME_ZONE = 'Europe/Prague';
lib/workshops/workshopDate.ts:48: * Names an occurrence date as shortly as a label beside a title can, in the same Prague time as its full date.
lib/workshops/workshopDate.ts:95: * The calendar day one occurrence falls on in Prague, written as `2026-09-04`
lib/workshops/workshopDate.ts:100:export function formatPragueCalendarDate(startsAt: string): CalendarDayKey {
lib/workshops/workshopDate.ts:108:    return formatCzechRelativeDayPrefix(formatPragueCalendarDate(startsAt), formatPragueCalendarDate(currentTime));
lib/workshops/workshopDate.ts:137: * The time span one occurrence runs for in Prague time, for example `10:00–16:00`
lib/workshops/workshopDate.ts:145: * Formats the start time of a Czech workshop in Prague time.
lib/workshops/workshopRegistrations.ts:1:import { formatCzechWorkshopMoment, formatPragueCalendarDate } from '@/lib/workshops/workshopDate';
lib/workshops/workshopRegistrations.ts:195:        new Set([term.slug, formatPragueCalendarDate(term.startsAt), formatCzechWorkshopMoment(term.startsAt)]),

exec
/bin/zsh -lc 'cat lib/calendar/czechRelativeDay.ts && cat lib/workshops/workshopDate.ts && cat lib/calendar/calendarMonth.ts' in /Users/hejny/work/aldaron
 succeeded in 0ms:
import {
    getCalendarWeekDayIndex,
    getCalendarWeekStartDayKey,
    shiftCalendarDayKey,
    type CalendarDayKey,
} from '@/lib/calendar/calendarMonth';

/**
 * How near one day is to the day it is read on
 *
 * Note: A day of the current week is one of them whether it has already been or is still to come, because `tato středa`
 *       names the Wednesday of this week just as truthfully on Friday as on Monday. Only `today` and `tomorrow` are
 *       nearer than that, and they are named before it.
 */
export const RELATIVE_CALENDAR_DAYS = ['today', 'tomorrow', 'this-week', 'other'] as const;

export type RelativeCalendarDay = (typeof RELATIVE_CALENDAR_DAYS)[number];

/**
 * How near one day is to the day a visitor is reading it on
 *
 * @param dayKey the day being named
 * @param todayDayKey the day it is today, in the very same country the named day was dated for
 */
export function getRelativeCalendarDay(dayKey: CalendarDayKey, todayDayKey: CalendarDayKey): RelativeCalendarDay {
    if (dayKey === todayDayKey) {
        return 'today';
    }

    if (dayKey === shiftCalendarDayKey(todayDayKey, 1)) {
        return 'tomorrow';
    }

    if (getCalendarWeekStartDayKey(dayKey) === getCalendarWeekStartDayKey(todayDayKey)) {
        return 'this-week';
    }

    return 'other';
}

const CZECH_TODAY_PREFIX = 'dnes, ';
const CZECH_TOMORROW_PREFIX = 'zítra, ';

/**
 * `tento` in the gender the name of each day of the week has in Czech, in the order `Date` counts the days from Sunday
 *
 * Note: `neděle`, `středa` and `sobota` are feminine, `pondělí` and `úterý` are neuter, and `čtvrtek` and `pátek` are
 *       masculine, so the one word standing in front of them is not one word at all.
 */
const CZECH_WEEK_DAY_DEMONSTRATIVES = ['tato', 'toto', 'toto', 'tato', 'tento', 'tento', 'tato'] as const;

/**
 * The words which say how near one day is, written in front of the date of that day, for example `dnes, ` or `tento `
 *
 * A day further away than this week is named by its date alone, which is what the empty prefix leaves it as.
 *
 * Note: The date which follows this prefix has to name the day of the week it falls on, because a day of this week is
 *       said by that very name — `tento ` and `čtvrtek 17. 9. 2026` are one sentence rather than two.
 *
 * @param dayKey the day being named
 * @param todayDayKey the day it is today, in the very same country the named day was dated for
 */
export function formatCzechRelativeDayPrefix(dayKey: CalendarDayKey, todayDayKey: CalendarDayKey): string {
    switch (getRelativeCalendarDay(dayKey, todayDayKey)) {
        case 'today':
            return CZECH_TODAY_PREFIX;
        case 'tomorrow':
            return CZECH_TOMORROW_PREFIX;
        case 'this-week':
            return `${CZECH_WEEK_DAY_DEMONSTRATIVES[getCalendarWeekDayIndex(dayKey)]} `;
        default:
            return '';
    }
}
import type { CalendarDayKey } from '@/lib/calendar/calendarMonth';
import { formatCzechRelativeDayPrefix } from '@/lib/calendar/czechRelativeDay';
import { DEFAULT_WORKSHOP_DURATION_MINUTES } from '@/lib/workshops/workshopConstants';
import { getWorkshopExpectedEndsAtMilliseconds } from '@/lib/workshops/workshopPhase';

const CZECH_LOCALE = 'cs-CZ';
const PRAGUE_TIME_ZONE = 'Europe/Prague';
const MILLISECONDS_PER_MINUTE = 60 * 1000;

const CZECH_WORKSHOP_DATE_FORMAT = new Intl.DateTimeFormat(CZECH_LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    timeZone: PRAGUE_TIME_ZONE,
});

const CZECH_WORKSHOP_TIME_FORMAT = new Intl.DateTimeFormat(CZECH_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: PRAGUE_TIME_ZONE,
});

/**
 * Formats an occurrence date in the timezone in which Czech workshops take place, independently of the server's
 * timezone.
 */
export function formatCzechWorkshopDate(startsAt: string): string {
    return CZECH_WORKSHOP_DATE_FORMAT.format(new Date(startsAt));
}

/**
 * The exact moment one occurrence begins at, for example `čtvrtek 20. 8. 2026 19:00`
 *
 * Note: This is how a term is named where it has to be told apart from another term held on the very same day, which
 *       is what identifies a term a registration was written for before the terms had addresses of their own.
 */
export function formatCzechWorkshopMoment(startsAt: string): string {
    return `${formatCzechWorkshopDate(startsAt)} ${formatCzechWorkshopTime(startsAt)}`;
}

const CZECH_WORKSHOP_SHORT_DATE_FORMAT = new Intl.DateTimeFormat(CZECH_LOCALE, {
    dateStyle: 'short',
    timeZone: PRAGUE_TIME_ZONE,
});

/**
 * Names an occurrence date as shortly as a label beside a title can, in the same Prague time as its full date.
 */
export function formatCzechWorkshopShortDate(startsAt: string): string {
    return CZECH_WORKSHOP_SHORT_DATE_FORMAT.format(new Date(startsAt));
}

const CZECH_WORKSHOP_DAY_FORMAT = new Intl.DateTimeFormat(CZECH_LOCALE, {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    timeZone: PRAGUE_TIME_ZONE,
});

/**
 * The day one occurrence falls on, for example `4. 9. 2026`
 *
 * Note: This is how a term a visitor has to put in their calendar is named, so it says its year in full rather than
 *       shortening it the way a compact label beside a title does.
 */
export function formatCzechWorkshopDay(startsAt: string): string {
    return CZECH_WORKSHOP_DAY_FORMAT.format(new Date(startsAt));
}

const CZECH_WORKSHOP_DAY_AND_MONTH_FORMAT = new Intl.DateTimeFormat(CZECH_LOCALE, {
    day: 'numeric',
    month: 'numeric',
    timeZone: PRAGUE_TIME_ZONE,
});

/**
 * The day one occurrence falls on without its year, for example `4. 9.`
 *
 * Note: This is how a term is named where several terms are listed beside each other and the year they share would
 *       only be repeated.
 */
export function formatCzechWorkshopDayAndMonth(startsAt: string): string {
    return CZECH_WORKSHOP_DAY_AND_MONTH_FORMAT.format(new Date(startsAt));
}

const PRAGUE_CALENDAR_DATE_FORMAT = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: PRAGUE_TIME_ZONE,
});

/**
 * The calendar day one occurrence falls on in Prague, written as `2026-09-04`
 *
 * Note: This is the machine-readable day of a term rather than a label for a visitor, which is what identifies a term
 *       by the day it is held on.
 */
export function formatPragueCalendarDate(startsAt: string): CalendarDayKey {
    return PRAGUE_CALENDAR_DATE_FORMAT.format(new Date(startsAt));
}

/**
 * How near one occurrence is to the day a visitor is reading about it on, as the words standing in front of its date
 */
function formatCzechWorkshopDayPrefix(startsAt: string, currentTime: string): string {
    return formatCzechRelativeDayPrefix(formatPragueCalendarDate(startsAt), formatPragueCalendarDate(currentTime));
}

/**
 * When one occurrence is held, said from the day a visitor reads it on, for example `dnes, úterý 15. 9. 2026`,
 * `zítra, středa 16. 9. 2026`, `tento čtvrtek 17. 9. 2026`, or `pátek 2. 10. 2026` once it is further away than that
 *
 * Note: This is how a term near enough to be looked forward to is named, so a participant reads that a workshop is
 *       today rather than working that out from its date.
 */
export function formatCzechWorkshopRelativeDate(startsAt: string, currentTime: string): string {
    return `${formatCzechWorkshopDayPrefix(startsAt, currentTime)}${formatCzechWorkshopDate(startsAt)}`;
}

/**
 * The day one occurrence falls on, said from the day a visitor reads it on, for example `dnes, úterý 15. 9. 2026`,
 * `tento čtvrtek 17. 9. 2026`, or `2. 10. 2026` once it is further away than this week
 *
 * Note: A near day is named rather than merely dated, which is why it takes the name of its weekday with it. A day
 *       nothing can be said about beyond its date stays the plain date it already was, so a list of far-away terms
 *       does not grow a weekday it never showed.
 */
export function formatCzechWorkshopRelativeDay(startsAt: string, currentTime: string): string {
    const dayPrefix = formatCzechWorkshopDayPrefix(startsAt, currentTime);

    return dayPrefix === '' ? formatCzechWorkshopDay(startsAt) : `${dayPrefix}${formatCzechWorkshopDate(startsAt)}`;
}

/**
 * The time span one occurrence runs for in Prague time, for example `10:00–16:00`
 */
export function formatCzechWorkshopTimeRange(startsAt: string, endsAt: string | null): string {
    const startTime = formatCzechWorkshopTime(startsAt);
    return endsAt === null ? startTime : `${startTime}–${formatCzechWorkshopTime(endsAt)}`;
}

/**
 * Formats the start time of a Czech workshop in Prague time.
 */
export function formatCzechWorkshopTime(startsAt: string): string {
    return CZECH_WORKSHOP_TIME_FORMAT.format(new Date(startsAt));
}

/**
 * Describes how long a workshop is expected to take. A workshop whose end is still left open is announced with the
 * same usual length as its calendar invitation, because a visitor is told how long to set aside before anybody can
 * know when the workshop will really be ended.
 */
export function formatCzechWorkshopDuration(startsAt: string, endsAt: string | null): string {
    const startsAtMilliseconds = Date.parse(startsAt);
    const durationMinutes = Number.isFinite(startsAtMilliseconds)
        ? Math.round(
              (getWorkshopExpectedEndsAtMilliseconds({ startsAt, endsAt }) - startsAtMilliseconds) /
                  MILLISECONDS_PER_MINUTE,
          )
        : DEFAULT_WORKSHOP_DURATION_MINUTES;

    return `${durationMinutes} minut`;
}
/**
 * One calendar day, written as `2026-09-04`
 *
 * Note: A day is deliberately a plain calendar date rather than a moment. Two terms are on the same day when the
 *       country the calendar is drawn for says they are, which is what places a late evening term on the day its
 *       visitors live in instead of the day the server happens to be in.
 */
export type CalendarDayKey = string;

/**
 * One calendar month, written as `2026-09`
 */
export type CalendarMonthKey = string;

const CALENDAR_DAYS_PER_WEEK = 7;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Day the week starts on, counted the way `Date` counts days from Sunday
 *
 * Note: The Czech Republic starts its week on Monday, as the whole ISO-8601 world does.
 */
const CALENDAR_FIRST_WEEK_DAY_INDEX = 1;

/**
 * A Monday, from which the names of the days of one whole week are read
 */
const CALENDAR_WEEK_DAY_LABEL_REFERENCE = Date.UTC(2024, 0, 1);

const CALENDAR_DAY_KEY_LENGTH = 'YYYY-MM-DD'.length;
const CALENDAR_MONTH_KEY_LENGTH = 'YYYY-MM'.length;

/**
 * The calendar day a moment falls on in one time zone
 *
 * @param isoDateTime moment, as an ISO 8601 string
 * @param timeZone time zone the calendar is drawn for, for example `Europe/Prague`
 */
export function createCalendarDayKey(isoDateTime: string, timeZone: string): CalendarDayKey {
    const dateParts = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone,
    }).formatToParts(new Date(isoDateTime));

    const readDatePart = (partType: Intl.DateTimeFormatPartTypes): string =>
        dateParts.find((datePart) => datePart.type === partType)?.value ?? '';

    return `${readDatePart('year')}-${readDatePart('month')}-${readDatePart('day')}`;
}

/**
 * The month one day belongs to
 */
export function getCalendarMonthKey(dayKey: CalendarDayKey): CalendarMonthKey {
    return dayKey.slice(0, CALENDAR_MONTH_KEY_LENGTH);
}

/**
 * The number a day is written with in its month, for example `4`
 */
export function getCalendarDayNumber(dayKey: CalendarDayKey): number {
    return Number(dayKey.slice(CALENDAR_MONTH_KEY_LENGTH + 1, CALENDAR_DAY_KEY_LENGTH));
}

/**
 * The first day of one month, which is the moment every label of that month is formatted from
 *
 * Note: A month is placed in UTC on purpose. Nothing here is a moment in a time zone - it is the grid of a calendar,
 *       which the same days make up wherever it is read.
 */
function createMonthStartDate(monthKey: CalendarMonthKey): Date {
    const year = Number(monthKey.slice(0, 4));
    const monthNumber = Number(monthKey.slice(5, CALENDAR_MONTH_KEY_LENGTH));

    return new Date(Date.UTC(year, monthNumber - 1, 1));
}

function createDayKeyOfDate(date: Date): CalendarDayKey {
    return date.toISOString().slice(0, CALENDAR_DAY_KEY_LENGTH);
}

/**
 * The moment one day of the grid is counted and named from
 *
 * Note: A day is placed in UTC on purpose, for the same reason a month is: it is a day of a calendar rather than a
 *       moment in a time zone, and it has already been dated for the country its calendar is drawn for.
 */
function createDayKeyDate(dayKey: CalendarDayKey): Date {
    return new Date(`${dayKey}T00:00:00Z`);
}

/**
 * The day one many days away from another, for example the day after the one a visitor is reading on
 */
export function shiftCalendarDayKey(dayKey: CalendarDayKey, dayOffset: number): CalendarDayKey {
    return createDayKeyOfDate(new Date(createDayKeyDate(dayKey).getTime() + dayOffset * MILLISECONDS_PER_DAY));
}

/**
 * Which day of the week one day falls on, counted the way `Date` counts days from Sunday
 */
export function getCalendarWeekDayIndex(dayKey: CalendarDayKey): number {
    return createDayKeyDate(dayKey).getUTCDay();
}

/**
 * The first day of the week one day belongs to
 *
 * Note: This is what tells whether two days fall into the same week, so which day a week starts on is answered here
 *       once rather than by everything asking that question.
 */
export function getCalendarWeekStartDayKey(dayKey: CalendarDayKey): CalendarDayKey {
    const weekDayOffset =
        (getCalendarWeekDayIndex(dayKey) - CALENDAR_FIRST_WEEK_DAY_INDEX + CALENDAR_DAYS_PER_WEEK) %
        CALENDAR_DAYS_PER_WEEK;

    return shiftCalendarDayKey(dayKey, -weekDayOffset);
}

/**
 * The month one many months away from another, for example the month a visitor reaches by paging back
 */
export function shiftCalendarMonthKey(monthKey: CalendarMonthKey, monthOffset: number): CalendarMonthKey {
    const monthStartDate = createMonthStartDate(monthKey);
    monthStartDate.setUTCMonth(monthStartDate.getUTCMonth() + monthOffset);

    return getCalendarMonthKey(createDayKeyOfDate(monthStartDate));
}

/**
 * Every day one month is drawn with, grouped into whole weeks
 *
 * Note: The first and the last week are filled up with the neighbouring days, so that every week of the grid is a
 *       whole week and the days of a month always stand under the day of the week they fall on.
 */
export function createCalendarMonthWeeks(monthKey: CalendarMonthKey): readonly (readonly CalendarDayKey[])[] {
    const monthStartDate = createMonthStartDate(monthKey);
    const leadingDayCount =
        (monthStartDate.getUTCDay() - CALENDAR_FIRST_WEEK_DAY_INDEX + CALENDAR_DAYS_PER_WEEK) %
        CALENDAR_DAYS_PER_WEEK;
    const monthDayCount = new Date(
        Date.UTC(monthStartDate.getUTCFullYear(), monthStartDate.getUTCMonth() + 1, 0),
    ).getUTCDate();
    const weekCount = Math.ceil((leadingDayCount + monthDayCount) / CALENDAR_DAYS_PER_WEEK);

    return Array.from({ length: weekCount }, (_, weekIndex) =>
        Array.from({ length: CALENDAR_DAYS_PER_WEEK }, (__, weekDayIndex) =>
            createDayKeyOfDate(
                new Date(
                    Date.UTC(
                        monthStartDate.getUTCFullYear(),
                        monthStartDate.getUTCMonth(),
                        1 - leadingDayCount + weekIndex * CALENDAR_DAYS_PER_WEEK + weekDayIndex,
                    ),
                ),
            ),
        ),
    );
}

/**
 * Whether one day belongs to the month a calendar is currently showing
 */
export function isCalendarDayInMonth(dayKey: CalendarDayKey, monthKey: CalendarMonthKey): boolean {
    return getCalendarMonthKey(dayKey) === monthKey;
}

/**
 * The heading of one month, for example `září 2026`
 */
export function formatCalendarMonthTitle(monthKey: CalendarMonthKey, locale: string): string {
    return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
        createMonthStartDate(monthKey),
    );
}

/**
 * The full name of one day, for example `pátek 4. září 2026`, which names a day of the grid where its number alone
 * would not be enough
 */
export function formatCalendarDayTitle(dayKey: CalendarDayKey, locale: string): string {
    return new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(createDayKeyDate(dayKey));
}

/**
 * The names of the days of the week, in the order the calendar puts its columns in
 */
export function createCalendarWeekDayLabels(locale: string): readonly string[] {
    const weekDayFormat = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });

    return Array.from({ length: CALENDAR_DAYS_PER_WEEK }, (_, weekDayIndex) =>
        weekDayFormat.format(new Date(CALENDAR_WEEK_DAY_LABEL_REFERENCE + weekDayIndex * MILLISECONDS_PER_DAY)),
    );
}

exec
/bin/zsh -lc 'cat businesses/workshop-admin/WorkshopSelectorCardList.tsx && cat businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx && cat lib/events/eventListing.ts && cat vitest.config.*' in /Users/hejny/work/aldaron
 succeeded in 0ms:
'use client';

import { WorkshopSelectorCard } from '@/businesses/workshop-admin/WorkshopSelectorCard';
import { Input } from '@/components/ui/input';
import { getWorkshopPhaseAppearance } from '@/components/workshops/workshopPhaseAppearance';
import {
    getWorkshopPhase,
    groupWorkshopsByPhase,
    WORKSHOP_PHASE_VALUES,
    type WorkshopPhase,
} from '@/lib/workshops/workshopPhase';
import type { WorkshopAdminSummary } from '@/lib/workshops/workshopTypes';
import { ChevronDown, RefreshCw, Search } from 'lucide-react';
import { useId, useMemo, useState } from 'react';

type WorkshopSelectorCardListProps = {
    readonly label: string;
    readonly workshops: readonly WorkshopAdminSummary[];
    readonly selectedWorkshopId: string | null;
    readonly isLoading: boolean;
    readonly emptyMessage: string;
    readonly onSelect: (workshopId: string) => void;
};

const CZECH_LOCALE = 'cs-CZ';
const WORKSHOP_CARD_GRID_CLASS_NAME = 'grid grid-cols-1 gap-1.5 xl:grid-cols-2';
const WORKSHOP_LIST_CLASS_NAME =
    'mt-3 space-y-3 lg:max-h-[min(34rem,calc(100dvh-31rem))] lg:overflow-y-auto lg:pr-1';
const WORKSHOP_HISTORY_CATEGORY_LABEL = 'Historie';

/**
 * The administration names an active category with the same label as its badge, so a term cannot be called one thing
 * in the selector and another in its card. History is the one exception because it is a disclosure of the past,
 * rather than another past-term badge.
 */
function getWorkshopPhaseCategoryLabel(phase: WorkshopPhase): string {
    return phase === 'past' ? WORKSHOP_HISTORY_CATEGORY_LABEL : getWorkshopPhaseAppearance(phase).label;
}

function normalizeWorkshopSearchQuery(searchQuery: string): string {
    return searchQuery
        .trim()
        .toLocaleLowerCase(CZECH_LOCALE)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function isWorkshopMatchingSearchQuery(workshop: WorkshopAdminSummary, normalizedSearchQuery: string): boolean {
    if (normalizedSearchQuery.length === 0) {
        return true;
    }

    return normalizeWorkshopSearchQuery(`${workshop.title} ${workshop.slug}`).includes(normalizedSearchQuery);
}

type WorkshopSelectorCardGridProps = {
    readonly accessibleLabel: string;
    readonly workshops: readonly WorkshopAdminSummary[];
    readonly selectedWorkshopId: string | null;
    readonly onSelect: (workshopId: string) => void;
};

/**
 * Renders each selectable workshop in one place, so the current terms and the progressively disclosed archive stay
 * equally informative and behave identically.
 */
function WorkshopSelectorCardGrid({
    accessibleLabel,
    workshops,
    selectedWorkshopId,
    onSelect,
}: WorkshopSelectorCardGridProps) {
    return (
        <ul aria-label={accessibleLabel} className={WORKSHOP_CARD_GRID_CLASS_NAME}>
            {workshops.map((workshop) => (
                <li key={workshop.id} className="min-w-0">
                    <WorkshopSelectorCard
                        workshop={workshop}
                        isSelected={workshop.id === selectedWorkshopId}
                        onSelect={onSelect}
                    />
                </li>
            ))}
        </ul>
    );
}

/**
 * Offers every occurrence as a card in the five shared time categories. An administrator gets the workshop that is
 * running first, the one they are wrapping up next, then the terms to prepare soon and later, while the old archive
 * remains available on demand.
 */
export function WorkshopSelectorCardList({
    label,
    workshops,
    selectedWorkshopId,
    isLoading,
    emptyMessage,
    onSelect,
}: WorkshopSelectorCardListProps) {
    const searchInputId = useId();
    const pastWorkshopsListId = useId();
    const [searchQuery, setSearchQuery] = useState('');
    const [isPastWorkshopsExpanded, setIsPastWorkshopsExpanded] = useState(false);
    const normalizedSearchQuery = useMemo(() => normalizeWorkshopSearchQuery(searchQuery), [searchQuery]);
    const matchingWorkshops = useMemo(() => {
        return workshops.filter((workshop) => isWorkshopMatchingSearchQuery(workshop, normalizedSearchQuery));
    }, [normalizedSearchQuery, workshops]);
    const matchingWorkshopsByPhase = useMemo(() => groupWorkshopsByPhase(matchingWorkshops), [matchingWorkshops]);
    const pastWorkshops = matchingWorkshopsByPhase.past;
    const selectedWorkshop = workshops.find((workshop) => workshop.id === selectedWorkshopId);
    const isSelectedWorkshopInHistory =
        selectedWorkshop !== undefined && getWorkshopPhase(selectedWorkshop) === 'past';
    const isSearchQueryPresent = normalizedSearchQuery.length > 0;
    const isPastWorkshopsVisible = isPastWorkshopsExpanded || isSelectedWorkshopInHistory || isSearchQueryPresent;

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</h2>
            {isLoading ? (
                <div className="flex justify-center py-6">
                    <RefreshCw className="h-4 w-4 animate-spin text-cyan-600" aria-label="Načítání" />
                </div>
            ) : workshops.length === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
                    {emptyMessage}
                </p>
            ) : (
                <>
                    <label htmlFor={searchInputId} className="sr-only">
                        Hledat workshop
                    </label>
                    <div className="relative mt-3">
                        <Search
                            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                            aria-hidden="true"
                        />
                        <Input
                            id={searchInputId}
                            type="search"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Hledat workshop"
                            className="h-9 pl-9"
                        />
                    </div>
                    {matchingWorkshops.length === 0 ? (
                        <p className="mt-3 rounded-xl border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
                            Žádný workshop neodpovídá hledání.
                        </p>
                    ) : (
                        <div className={WORKSHOP_LIST_CLASS_NAME}>
                            {WORKSHOP_PHASE_VALUES.filter((phase) => phase !== 'past').map((phase) => {
                                const workshopsInPhase = matchingWorkshopsByPhase[phase];
                                const phaseCategoryLabel = getWorkshopPhaseCategoryLabel(phase);
                                const phaseSectionId = `${pastWorkshopsListId}-${phase}`;

                                return workshopsInPhase.length === 0 ? null : (
                                    <section key={phase} aria-labelledby={phaseSectionId}>
                                        <h3
                                            id={phaseSectionId}
                                            className="px-1 text-xs font-semibold uppercase tracking-wider text-slate-500"
                                        >
                                            {phaseCategoryLabel} ({workshopsInPhase.length})
                                        </h3>
                                        <div className="mt-1.5">
                                            <WorkshopSelectorCardGrid
                                                accessibleLabel={`Seznam workshopů: ${phaseCategoryLabel}`}
                                                workshops={workshopsInPhase}
                                                selectedWorkshopId={selectedWorkshopId}
                                                onSelect={onSelect}
                                            />
                                        </div>
                                    </section>
                                );
                            })}

                            {pastWorkshops.length > 0 && (
                                <section>
                                    <button
                                        type="button"
                                        aria-controls={pastWorkshopsListId}
                                        aria-expanded={isPastWorkshopsVisible}
                                        onClick={() => setIsPastWorkshopsExpanded((isExpanded) => !isExpanded)}
                                        className="flex w-full items-center justify-between rounded-lg px-1 py-1 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 transition-colors hover:text-slate-800"
                                    >
                                        {WORKSHOP_HISTORY_CATEGORY_LABEL} ({pastWorkshops.length})
                                        <ChevronDown
                                            className={`h-4 w-4 shrink-0 transition-transform ${isPastWorkshopsVisible ? 'rotate-180' : ''}`}
                                            aria-hidden="true"
                                        />
                                    </button>
                                    {isPastWorkshopsVisible && (
                                        <div className="mt-1.5" id={pastWorkshopsListId}>
                                            <WorkshopSelectorCardGrid
                                                accessibleLabel="Historie workshopů"
                                                workshops={pastWorkshops}
                                                selectedWorkshopId={selectedWorkshopId}
                                                onSelect={onSelect}
                                            />
                                        </div>
                                    )}
                                </section>
                            )}
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
'use client';

import { createOnlineWorkshopTermNoteText } from '@/businesses/online-workshop/onlineWorkshopTerms';
import { EventTermOptionList } from '@/components/events/EventTermOptionList';
import type { EventOccurrence } from '@/lib/events/eventOccurrence';
import { groupWorkshopsByPhase } from '@/lib/workshops/workshopPhase';
import { ChevronDown, Clock, History, Sparkles } from 'lucide-react';
import { useId, useMemo, useState } from 'react';

/**
 * What the waiting room says while a participant is choosing which workshop to enter
 */
const ONLINE_WORKSHOP_ROOM_TERM_PICKER_COPY = {
    legend: 'Vyberte si workshop',
    description: 'Do místnosti kteréhokoli workshopu se dostanete stejným jménem a e-mailem.',
    noCurrentTermsMessage: 'Právě teď žádný workshop neběží a další termín zatím není vypsaný.',
    freshlyPastTermsLabel: 'Právě proběhlo',
    pastTermsLabel: 'Proběhlé workshopy',

    /**
     * Note: A workshop which has only just been held promises exactly what any finished one does, and says only that
     *       it was now — what a participant came back for is waiting behind the very same open door.
     */
    freshlyPastTermNoteText: 'Právě skončil, místnost zůstává otevřená',

    /**
     * Note: A room which is over is worth entering for what stayed in it, and that is all this promises. What a
     *       recording or a paid material asks for is decided by the room itself once a participant is inside.
     */
    pastTermNoteText: 'Místnost zůstává otevřená',
} as const;

type OnlineWorkshopRoomTermPickerProps = {
    readonly terms: readonly EventOccurrence[];
    readonly selectedTermSlug: string;
    readonly onSelectTerm: (term: EventOccurrence) => void;

    /**
     * Moment which decides what is running, what is ahead, and what is already over
     *
     * Note: That moment comes from the server which listed these terms, so the browser groups them exactly as the
     *       page it received was built, rather than regrouping them the instant it hydrates.
     */
    readonly currentTime: string;
};

/**
 * Every published term of the online workshop, offered to a participant who has not connected to one yet
 *
 * Note: A workshop which runs right now or is still ahead is what a participant is nearly always looking for, so those
 *       terms lead. The ones which are over stay reachable behind one click, because their rooms keep the chat and the
 *       materials of the workshop which was held in them.
 * Note: A workshop which has only just been held is named on its own, in the open, between the two of them. Somebody
 *       who was at it last night comes back for what stayed in its room, and asking them to unfold the whole history
 *       to find the workshop they have just left would hide it among the terms they are not looking for at all.
 */
export function OnlineWorkshopRoomTermPicker({
    terms,
    selectedTermSlug,
    onSelectTerm,
    currentTime,
}: OnlineWorkshopRoomTermPickerProps) {
    const pastTermsListId = useId();
    const termsByPhase = useMemo(
        () => groupWorkshopsByPhase(terms, Date.parse(currentTime)),
        [currentTime, terms],
    );
    const currentTerms = [
        ...termsByPhase.ongoing,
        ...termsByPhase['upcoming-next-week'],
        ...termsByPhase.upcoming,
    ];
    const freshlyPastTerms = termsByPhase['freshly-past'];
    const { past: pastTerms } = termsByPhase;
    const isSelectedTermPast = pastTerms.some((term) => term.slug === selectedTermSlug);

    // Note: A participant who came for a workshop which is already over meets the history open, so the term they came
    //       for is where they can see it. That is asked about the workshop the room was entered with rather than kept
    //       in step with the choice, because from then on it is the participant who opens and closes the history.
    const [isPastTermsShown, setIsPastTermsShown] = useState(isSelectedTermPast);

    // Note: Which term is chosen, which moment the terms are placed against, and how much room a card is given is one
    //       and the same question for every group this picker offers, so each of them is laid out by the very same
    //       description of a list and adds nothing but its own terms and its own note.
    const sharedTermOptionListProps = {
        selectedTermSlug,
        onSelectTerm,
        currentTime,
        isTopicShown: true,
        appearance: 'room',
        density: 'compact',
    } as const;

    return (
        <fieldset className="min-w-0">
            <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-room-muted">
                {ONLINE_WORKSHOP_ROOM_TERM_PICKER_COPY.legend}
            </legend>
            <p className="mt-1 text-xs leading-5 text-room-subtle">{ONLINE_WORKSHOP_ROOM_TERM_PICKER_COPY.description}</p>

            {currentTerms.length === 0 ? (
                <p className="mt-3 rounded-lg border border-dashed border-room-border/15 bg-room-overlay/[0.025] px-3 py-3 text-xs text-room-muted">
                    {ONLINE_WORKSHOP_ROOM_TERM_PICKER_COPY.noCurrentTermsMessage}
                </p>
            ) : (
                <EventTermOptionList
                    {...sharedTermOptionListProps}
                    terms={currentTerms}
                    noteIcon={Clock}
                    createNoteText={createOnlineWorkshopTermNoteText}
                    className="mt-3"
                />
            )}

            {freshlyPastTerms.length > 0 && (
                <>
                    <p className="mt-3 px-1 text-xs font-semibold text-room-warning">
                        {ONLINE_WORKSHOP_ROOM_TERM_PICKER_COPY.freshlyPastTermsLabel} ({freshlyPastTerms.length})
                    </p>
                    <EventTermOptionList
                        {...sharedTermOptionListProps}
                        terms={freshlyPastTerms}
                        noteIcon={Sparkles}
                        createNoteText={() => ONLINE_WORKSHOP_ROOM_TERM_PICKER_COPY.freshlyPastTermNoteText}
                        className="mt-1"
                    />
                </>
            )}

            {pastTerms.length > 0 && (
                <>
                    <button
                        type="button"
                        aria-controls={pastTermsListId}
                        aria-expanded={isPastTermsShown}
                        onClick={() => setIsPastTermsShown((isShown) => !isShown)}
                        className="mt-3 flex w-full items-center justify-between gap-3 rounded-lg px-1 py-1.5 text-left text-xs font-semibold text-room-subtle transition-colors hover:text-room-text"
                    >
                        {ONLINE_WORKSHOP_ROOM_TERM_PICKER_COPY.pastTermsLabel} ({pastTerms.length})
                        <ChevronDown
                            className={`h-3.5 w-3.5 shrink-0 transition-transform ${isPastTermsShown ? 'rotate-180' : ''}`}
                            aria-hidden="true"
                        />
                    </button>
                    {isPastTermsShown && (
                        <EventTermOptionList
                            {...sharedTermOptionListProps}
                            id={pastTermsListId}
                            terms={pastTerms}
                            noteIcon={History}
                            createNoteText={() => ONLINE_WORKSHOP_ROOM_TERM_PICKER_COPY.pastTermNoteText}
                            className="mt-1"
                        />
                    )}
                </>
            )}
        </fieldset>
    );
}
import {
    createCalendarDayKey,
    getCalendarMonthKey,
    type CalendarDayKey,
    type CalendarMonthKey,
} from '@/lib/calendar/calendarMonth';
import type { EventDetails } from '@/lib/events/event';
import { createEventLinkOrNull } from '@/lib/events/eventLinks';
import type { WorkshopParticipantIdentity } from '@/lib/workshops/workshopParticipantLink';
import { getWorkshopPhase, sortWorkshopsByPhase, type WorkshopPhase } from '@/lib/workshops/workshopPhase';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';

/**
 * One listed term, together with everything both a card and a calendar day say about it
 *
 * Note: Where a term leads, where it stands in time and which day it falls on is worked out once here, so that the
 *       two views of the same terms can never disagree about any of it.
 */
export type EventListing = {
    readonly workshop: WorkshopSummary;
    readonly event: EventDetails;

    /**
     * Where this term leads the member reading the list
     */
    readonly link: string;

    /**
     * Whether this term is running right now, only just over, starts within the next week, is further ahead, or is
     * already history
     */
    readonly phase: WorkshopPhase;

    /**
     * The day this term is held on in the country the list is drawn for
     */
    readonly dayKey: CalendarDayKey;
};

type EventListingOptions = {
    readonly workshops: readonly WorkshopSummary[];

    /**
     * Details of the member reading the list, which every link carries on into the room it opens
     */
    readonly participantIdentity: WorkshopParticipantIdentity;

    /**
     * Moment which decides the phases, so that one whole list is placed against the same instant
     */
    readonly currentTimeMilliseconds: number;

    /**
     * Time zone the terms are dated in, for example `Europe/Prague`
     */
    readonly timeZone: string;
};

/**
 * The terms a room lists, ordered by what matters most to a member: what runs now, what has just ended, what starts
 * within a week, what comes later, then the history.
 *
 * Note: A term the application cannot lead anywhere is deliberately left out instead of being offered as a link which
 *       would open a different event.
 */
export function createEventListings({
    workshops,
    participantIdentity,
    currentTimeMilliseconds,
    timeZone,
}: EventListingOptions): readonly EventListing[] {
    return sortWorkshopsByPhase(workshops, currentTimeMilliseconds).flatMap((workshop) => {
        const link = createEventLinkOrNull(workshop, participantIdentity);

        return link === null || workshop.event === null
            ? []
            : [
                  {
                      workshop,
                      event: workshop.event,
                      link,
                      phase: getWorkshopPhase(workshop, currentTimeMilliseconds),
                      dayKey: createCalendarDayKey(workshop.startsAt, timeZone),
                  },
              ];
    });
}

/**
 * The listed terms of every day which has any, so that a calendar reads the terms of one day without searching all of
 * them again for every day it draws
 */
export function groupEventListingsByDayKey(
    listings: readonly EventListing[],
): ReadonlyMap<CalendarDayKey, readonly EventListing[]> {
    const listingsByDayKey = new Map<CalendarDayKey, EventListing[]>();

    for (const listing of listings) {
        const dayListings = listingsByDayKey.get(listing.dayKey);
        if (dayListings === undefined) {
            listingsByDayKey.set(listing.dayKey, [listing]);
        } else {
            dayListings.push(listing);
        }
    }

    return listingsByDayKey;
}

/**
 * The month a calendar of these terms opens on
 *
 * Note: A calendar opens on the month a member is in, because that is the month they are looking for. Only when
 *       nothing at all is listed in it does it open on the month of the most relevant term instead, so that a member
 *       is never met by an empty grid while terms are waiting one page away.
 */
export function selectInitialCalendarMonthKey(
    listings: readonly EventListing[],
    todayDayKey: CalendarDayKey,
): CalendarMonthKey {
    const currentMonthKey = getCalendarMonthKey(todayDayKey);
    const isAnyListingInCurrentMonth = listings.some(
        (listing) => getCalendarMonthKey(listing.dayKey) === currentMonthKey,
    );

    if (isAnyListingInCurrentMonth || listings.length === 0) {
        return currentMonthKey;
    }

    return getCalendarMonthKey(listings[0].dayKey);
}
import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    // Note: The same JSX runtime Next.js compiles the components with, so that a component does not need to import
    //       React just to be renderable in a test.
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname),
        },
    },
    test: {
        exclude: ['node_modules/**', '.next/**', '.tmp/**', 'out/**', 'tests/e2e/**'],
    },
});

codex
The badge, admin categories, and calendar colors all use one shared phase model. I’ll add “Dneska” and “Zítra” before “Tento týden,” using Prague calendar dates. Events will still switch to “Probíhá” when they start.

exec
/bin/zsh -lc "sed -n '1,270p' components/workshops/WorkshopLinksPanel.test.tsx && sed -n '1,190p' businesses/workshop-admin/WorkshopSelectorCardList.test.tsx" in /Users/hejny/work/aldaron
 succeeded in 0ms:
/**
 * @vitest-environment jsdom
 */

import { WorkshopLinksPanel } from '@/components/workshops/WorkshopLinksPanel';
import { formatCalendarDayTitle } from '@/lib/calendar/calendarMonth';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import { formatEventPrice } from '@/lib/events/eventPrice';
import { getWorkshopPhaseAppearance } from '@/components/workshops/workshopPhaseAppearance';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

const TERM_LIST_LABEL = 'Termíny akcí';

const SERVER_TIME = '2026-09-10T19:30:00+02:00';
const CALENDAR_FEED_URL = 'https://ptbk.io/cs/komunita/calendar.ics';
const PARTICIPANT_IDENTITY = { fullname: 'Jana Nováková', email: 'jana@example.com' };

const ONGOING_WORKSHOP: WorkshopSummary = {
    id: 'ongoing-workshop-id',
    kind: 'workshop',
    event: DEFAULT_EVENT_DETAILS,
    slug: 'production-ai-2026-09-10',
    title: 'Produkční kód s AI agenty',
    description: 'Online workshop s Pavolem Hejným a Jiřím Jahnem',
    startsAt: '2026-09-10T19:00:00+02:00',
    endsAt: '2026-09-10T20:30:00+02:00',
    isPublished: true,
};

const UPCOMING_WORKSHOP: WorkshopSummary = {
    ...ONGOING_WORKSHOP,
    id: 'upcoming-workshop-id',
    slug: 'ai-supervize-mini-2026-09-24',
    title: 'AI Supervize Mini',
    event: {
        ...DEFAULT_EVENT_DETAILS,
        type: 'ai-supervize-mini',
        locationKind: 'onsite',
        locationLabel: 'Praha',
        priceCzk: 12000,
    },
    startsAt: '2026-09-24T10:00:00+02:00',
    endsAt: '2026-09-24T16:00:00+02:00',
};

const TOMORROW_WORKSHOP: WorkshopSummary = {
    ...ONGOING_WORKSHOP,
    id: 'tomorrow-workshop-id',
    slug: 'production-ai-2026-09-11',
    title: 'Produkční kód s AI agenty zítra',
    startsAt: '2026-09-11T19:00:00+02:00',
    endsAt: '2026-09-11T20:30:00+02:00',
};

const THIS_WEEK_WORKSHOP: WorkshopSummary = {
    ...ONGOING_WORKSHOP,
    id: 'this-week-workshop-id',
    slug: 'production-ai-2026-09-12',
    title: 'Produkční kód s AI agenty v sobotu',
    startsAt: '2026-09-12T19:00:00+02:00',
    endsAt: '2026-09-12T20:30:00+02:00',
};

/**
 * The workshop of yesterday evening, which ended a few hours before the moment this list is drawn against
 */
const FRESHLY_PAST_WORKSHOP: WorkshopSummary = {
    ...ONGOING_WORKSHOP,
    id: 'freshly-past-workshop-id',
    slug: 'production-ai-2026-09-09',
    title: 'Produkční kód s AI agenty včera',
    startsAt: '2026-09-09T19:00:00+02:00',
    endsAt: '2026-09-09T20:30:00+02:00',
};

const PAST_WORKSHOP: WorkshopSummary = {
    ...ONGOING_WORKSHOP,
    id: 'past-workshop-id',
    slug: 'production-ai-2026-07-10',
    title: 'Produkční kód s AI agenty v červenci',
    startsAt: '2026-07-10T19:00:00+02:00',
    endsAt: '2026-07-10T20:30:00+02:00',
};

const RICH_PAST_WORKSHOP: WorkshopSummary = {
    ...PAST_WORKSHOP,
    id: 'rich-past-workshop-id',
    slug: 'production-ai-2026-07-11',
    title: 'Produkční kód s AI agenty s projektem',
    eventCardDetails: {
        project: {
            title: 'Automatizační dashboard',
            description: 'Projekt, který během workshopu vznikl.',
            previewImageUrl: 'https://projects.example.com/dashboard-preview.png',
            repositoryName: 'promptbook/automation-dashboard',
            deploymentUrl: 'https://projects.example.com/dashboard',
        },
        recordingDurationSeconds: 5_325,
    },
};

const EXTERNAL_CONFERENCE_URL = 'https://konference.example.com/program';

const EXTERNAL_CONFERENCE: WorkshopSummary = {
    ...ONGOING_WORKSHOP,
    id: 'external-conference-id',
    slug: 'webexpo-2026-09-18',
    title: 'WebExpo · přednáška lektora komunity',
    event: { ...DEFAULT_EVENT_DETAILS, type: 'external', externalUrl: EXTERNAL_CONFERENCE_URL },
    startsAt: '2026-09-18T09:00:00+02:00',
    endsAt: '2026-09-18T17:00:00+02:00',
};

const WORKSHOPS: readonly WorkshopSummary[] = [PAST_WORKSHOP, ONGOING_WORKSHOP, UPCOMING_WORKSHOP];

function renderWorkshopLinksPanel(workshops: readonly WorkshopSummary[] = WORKSHOPS) {
    render(
        <WorkshopLinksPanel
            workshops={workshops}
            participantIdentity={PARTICIPANT_IDENTITY}
            title="Termíny akcí Promptbooku"
            description="Vyberte si termín."
            emptyMessage="Žádný termín není dostupný."
            locale="cs-CZ"
            timeZone="Europe/Prague"
            serverTime={SERVER_TIME}
            calendarFeedUrl={CALENDAR_FEED_URL}
        />,
    );
}

function findCalendarDay(dayKey: string): HTMLElement {
    return screen.getByRole('button', { name: formatCalendarDayTitle(dayKey, 'cs-CZ') });
}

function findTermLinks(): readonly HTMLElement[] {
    return within(screen.getByRole('list', { name: TERM_LIST_LABEL })).getAllByRole('link');
}

function showCardsView(): void {
    fireEvent.click(screen.getByRole('button', { name: 'Karty' }));
}

afterEach(cleanup);

describe('workshop links panel', () => {
    it('opens on the calendar of the month a member is in', () => {
        renderWorkshopLinksPanel();

        expect(screen.getAllByText('září 2026').length).toBeGreaterThan(0);
        expect(screen.getByRole('link', { name: /Produkční kód s AI agenty/ })).not.toBeNull();
        expect(screen.queryByRole('link', { name: /v červenci/ })).toBeNull();
    });

    it('colours every day of the calendar by where the term held on it stands in time', () => {
        renderWorkshopLinksPanel();

        expect(findCalendarDay('2026-09-10').className).toContain(
            getWorkshopPhaseAppearance('ongoing').calendarDayClassName,
        );
        expect(findCalendarDay('2026-09-24').className).toContain(
            getWorkshopPhaseAppearance('upcoming').calendarDayClassName,
        );
        expect(findCalendarDay('2026-09-11').getAttribute('disabled')).not.toBeNull();
    });

    it('narrows the listed terms to the chosen day and back to the whole month', () => {
        renderWorkshopLinksPanel();

        fireEvent.click(findCalendarDay('2026-09-24'));

        expect(screen.getByRole('link', { name: /AI Supervize Mini/ })).not.toBeNull();
        expect(screen.queryByRole('link', { name: /Produkční kód s AI agenty/ })).toBeNull();

        fireEvent.click(screen.getByRole('button', { name: 'Celý měsíc' }));

        expect(screen.getByRole('link', { name: /Produkční kód s AI agenty/ })).not.toBeNull();
    });

    it('lists every term of every month once the cards are chosen', () => {
        renderWorkshopLinksPanel();
        showCardsView();

        expect(findTermLinks().map((termLink) => termLink.textContent)).toEqual([
            expect.stringContaining(ONGOING_WORKSHOP.title),
            expect.stringContaining(UPCOMING_WORKSHOP.title),
            expect.stringContaining(PAST_WORKSHOP.title),
        ]);
    });

    it('names a term held today, tomorrow, or later this week rather than only dating it', () => {
        renderWorkshopLinksPanel([ONGOING_WORKSHOP, TOMORROW_WORKSHOP, THIS_WEEK_WORKSHOP, UPCOMING_WORKSHOP]);
        showCardsView();

        expect(findTermLinks().map((termLink) => termLink.textContent)).toEqual([
            expect.stringContaining('dnes, čtvrtek 10. 9. 2026'),
            expect.stringContaining('zítra, pátek 11. 9. 2026'),
            expect.stringContaining('tato sobota 12. 9. 2026'),
            expect.stringContaining('čtvrtek 24. 9. 2026'),
        ]);
    });

    it('says on every card whether its term is running, still ahead, or already over', () => {
        renderWorkshopLinksPanel();
        showCardsView();

        const [ongoingCard, upcomingCard, pastCard] = findTermLinks();

        expect(ongoingCard?.textContent).toContain('Probíhá');
        expect(upcomingCard?.textContent).toContain('Nadchází');
        expect(pastCard?.textContent).toContain('Proběhlo');
    });

    it('gives a term in the next seven days its own badge and calendar colour', () => {
        renderWorkshopLinksPanel([ONGOING_WORKSHOP, TOMORROW_WORKSHOP, UPCOMING_WORKSHOP]);

        expect(findCalendarDay('2026-09-11').className).toContain(
            getWorkshopPhaseAppearance('upcoming-next-week').calendarDayClassName,
        );
        expect(screen.getAllByText('Tento týden')).toHaveLength(2);

        showCardsView();

        const [, upcomingNextWeekCard, upcomingCard] = findTermLinks();
        expect(upcomingNextWeekCard?.textContent).toContain('Tento týden');
        expect(upcomingCard?.textContent).toContain('Nadchází');
    });

    it('shows the created-project preview and replay length without review feedback on the mini card', () => {
        renderWorkshopLinksPanel([RICH_PAST_WORKSHOP]);
        showCardsView();

        const card = screen.getByRole('link', { name: /Produkční kód s AI agenty s projektem/ });

        expect(card.textContent).not.toMatch(/hodnocení|\/ 5/i);
        expect(within(card).queryByLabelText(/hodnocení/i)).toBeNull();
        expect(card.textContent).toContain('Záznam 1:28:45');
        expect(card.textContent).toContain('Projekt workshopu');
        expect(card.textContent).toContain('Automatizační dashboard');
        expect(card.textContent).toContain('promptbook/automation-dashboard');
        expect(card.textContent).toContain('projects.example.com/dashboard');
        expect(card.getAttribute('href')).toContain(`/cs/online-workshop/participant?workshop=${RICH_PAST_WORKSHOP.slug}`);
        expect(
            within(card).getByRole('img', { name: 'Náhled projektu Automatizační dashboard' }).getAttribute('src'),
        ).toBe('https://projects.example.com/dashboard-preview.png');
    });

    it('sets a term which has only just been held apart from the history it would otherwise close', () => {
        renderWorkshopLinksPanel([PAST_WORKSHOP, FRESHLY_PAST_WORKSHOP, ONGOING_WORKSHOP, UPCOMING_WORKSHOP]);
        showCardsView();

        const [ongoingCard, freshlyPastCard, upcomingCard, pastCard] = findTermLinks();

        expect(ongoingCard?.textContent).toContain(ONGOING_WORKSHOP.title);
        expect(freshlyPastCard?.textContent).toContain(FRESHLY_PAST_WORKSHOP.title);
        expect(freshlyPastCard?.textContent).toContain('Právě proběhlo');
        expect(upcomingCard?.textContent).toContain(UPCOMING_WORKSHOP.title);
        expect(pastCard?.textContent).toContain(PAST_WORKSHOP.title);
        expect(pastCard?.textContent).toContain('Proběhlo');
    });

    it('colours the day of a term which has only just been held as neither running nor history', () => {
        renderWorkshopLinksPanel([PAST_WORKSHOP, FRESHLY_PAST_WORKSHOP, ONGOING_WORKSHOP]);

        expect(findCalendarDay('2026-09-09').className).toContain(
            getWorkshopPhaseAppearance('freshly-past').calendarDayClassName,
        );
        expect(findCalendarDay('2026-09-10').className).toContain(
/**
 * @vitest-environment jsdom
 */

import { formatWorkshopAdminDateTime } from '@/businesses/workshop-admin/workshopAdminFormatting';
import { WorkshopSelectorCardList } from '@/businesses/workshop-admin/WorkshopSelectorCardList';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import type { WorkshopAdminSummary } from '@/lib/workshops/workshopTypes';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ONGOING_WORKSHOP: WorkshopAdminSummary = {
    id: 'ongoing-workshop-id',
    kind: 'workshop',
    event: DEFAULT_EVENT_DETAILS,
    slug: 'produkcni-kod-2026-08-21',
    title: 'Produkční kód s AI agenty',
    description: 'Online workshop s Pavolem Hejným a Jiřím Jahnem',
    startsAt: '2026-08-21T19:00:00+02:00',
    endsAt: '2026-08-21T20:30:00+02:00',
    isPublished: true,
    participantCount: 42,
    registeredParticipantCount: 61,
};
const UPCOMING_WORKSHOP: WorkshopAdminSummary = {
    id: 'upcoming-workshop-id',
    kind: 'workshop',
    event: DEFAULT_EVENT_DETAILS,
    slug: 'produkcni-kod-2026-09-10',
    title: 'Produkční kód s AI agenty v září',
    description: 'Zářijový termín online workshopu.',
    startsAt: '2026-09-10T19:00:00+02:00',
    endsAt: '2026-09-10T20:30:00+02:00',
    isPublished: true,
    participantCount: 3,
    registeredParticipantCount: 1,
};
const UPCOMING_NEXT_WEEK_WORKSHOP: WorkshopAdminSummary = {
    ...UPCOMING_WORKSHOP,
    id: 'upcoming-next-week-workshop-id',
    slug: 'produkcni-kod-2026-08-24',
    title: 'Produkční kód s AI agenty tento týden',
    startsAt: '2026-08-24T19:00:00+02:00',
    endsAt: '2026-08-24T20:30:00+02:00',
};
const FRESHLY_PAST_WORKSHOP: WorkshopAdminSummary = {
    id: 'freshly-past-workshop-id',
    kind: 'workshop',
    event: DEFAULT_EVENT_DETAILS,
    slug: 'produkcni-kod-2026-08-20',
    title: 'Produkční kód s AI agenty včera',
    description: 'Včerejší termín online workshopu.',
    startsAt: '2026-08-20T19:00:00+02:00',
    endsAt: '2026-08-20T20:30:00+02:00',
    isPublished: true,
    participantCount: 12,
    registeredParticipantCount: 15,
};
const PAST_WORKSHOP: WorkshopAdminSummary = {
    id: 'past-workshop-id',
    kind: 'workshop',
    event: DEFAULT_EVENT_DETAILS,
    slug: 'produkcni-kod-2026-07-10',
    title: 'Produkční kód s AI agenty v červenci',
    description: 'Červencový termín online workshopu.',
    startsAt: '2026-07-10T19:00:00+02:00',
    endsAt: '2026-07-10T20:30:00+02:00',
    isPublished: true,
    participantCount: 1,
    registeredParticipantCount: null,
};

function renderWorkshopSelectorCardList(
    workshops: readonly WorkshopAdminSummary[],
    onSelect: (workshopId: string) => void = vi.fn(),
    selectedWorkshopId: string | null = ONGOING_WORKSHOP.id,
) {
    render(
        <WorkshopSelectorCardList
            label="Workshop"
            workshops={workshops}
            selectedWorkshopId={selectedWorkshopId}
            isLoading={false}
            emptyMessage="Vytvořte první workshop."
            onSelect={onSelect}
        />,
    );
}

function getWorkshopCards() {
    return screen.queryAllByRole('button').filter((button) => button.hasAttribute('aria-pressed'));
}

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-21T19:30:00+02:00'));
});

afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

describe('workshop selector card list', () => {
    it('leads with the running workshop and prepared terms, while keeping the archive available on demand', () => {
        renderWorkshopSelectorCardList([PAST_WORKSHOP, UPCOMING_WORKSHOP, ONGOING_WORKSHOP]);

        expect(getWorkshopCards().map((workshopCard) => workshopCard.textContent)).toEqual([
            expect.stringContaining(ONGOING_WORKSHOP.title),
            expect.stringContaining(UPCOMING_WORKSHOP.title),
        ]);

        const historyToggle = screen.getByRole('button', { name: 'Historie (1)' });
        expect(historyToggle.getAttribute('aria-expanded')).toBe('false');

        fireEvent.click(historyToggle);

        expect(getWorkshopCards().map((workshopCard) => workshopCard.textContent)).toEqual([
            expect.stringContaining(ONGOING_WORKSHOP.title),
            expect.stringContaining(UPCOMING_WORKSHOP.title),
            expect.stringContaining(PAST_WORKSHOP.title),
        ]);
    });

    it('keeps each non-historical phase in its own administration category', () => {
        renderWorkshopSelectorCardList([
            PAST_WORKSHOP,
            FRESHLY_PAST_WORKSHOP,
            UPCOMING_WORKSHOP,
            UPCOMING_NEXT_WEEK_WORKSHOP,
            ONGOING_WORKSHOP,
        ]);

        expect(screen.getByRole('heading', { name: 'Probíhá (1)' })).not.toBeNull();
        expect(screen.getByRole('heading', { name: 'Právě proběhlo (1)' })).not.toBeNull();
        expect(screen.getByRole('heading', { name: 'Tento týden (1)' })).not.toBeNull();
        expect(screen.getByRole('heading', { name: 'Nadchází (1)' })).not.toBeNull();
        expect(getWorkshopCards().map((workshopCard) => workshopCard.textContent)).toEqual([
            expect.stringContaining(ONGOING_WORKSHOP.title),
            expect.stringContaining(FRESHLY_PAST_WORKSHOP.title),
            expect.stringContaining(UPCOMING_NEXT_WEEK_WORKSHOP.title),
            expect.stringContaining(UPCOMING_WORKSHOP.title),
        ]);

        expect(getWorkshopCards()[1].textContent).toContain('Právě proběhlo');
        expect(getWorkshopCards()[2].textContent).toContain('Tento týden');
        expect(screen.getByRole('button', { name: 'Historie (1)' }).getAttribute('aria-expanded')).toBe('false');
    });

    it('leaves the history closed while the selected workshop has only just been held', () => {
        renderWorkshopSelectorCardList(
            [ONGOING_WORKSHOP, FRESHLY_PAST_WORKSHOP, PAST_WORKSHOP],
            vi.fn(),
            FRESHLY_PAST_WORKSHOP.id,
        );

        expect(screen.getByRole('button', { name: 'Historie (1)' }).getAttribute('aria-expanded')).toBe('false');

        const [, freshlyPastCard] = getWorkshopCards();

        expect(freshlyPastCard.textContent).toContain(FRESHLY_PAST_WORKSHOP.title);
        expect(freshlyPastCard.getAttribute('aria-pressed')).toBe('true');
    });

    it('says of every workshop when it happens, where it stands, and how large its audience is', () => {
        renderWorkshopSelectorCardList([ONGOING_WORKSHOP, UPCOMING_WORKSHOP, PAST_WORKSHOP]);

        fireEvent.click(screen.getByRole('button', { name: 'Historie (1)' }));

        const [ongoingCard, upcomingCard, pastCard] = getWorkshopCards();

        expect(ongoingCard.textContent).toContain('Probíhá');
        expect(ongoingCard.textContent).toContain('42 účastníků');
        expect(ongoingCard.textContent).toContain(formatWorkshopAdminDateTime(ONGOING_WORKSHOP.startsAt));
        expect(upcomingCard.textContent).toContain('Nadchází');
        expect(upcomingCard.textContent).toContain('3 účastníci');
        expect(pastCard.textContent).toContain('Proběhl');
        expect(pastCard.textContent).toContain('1 účastník');
    });

    it('says how many people registered for a term beside how many of them really came', () => {
        renderWorkshopSelectorCardList([ONGOING_WORKSHOP, UPCOMING_WORKSHOP, PAST_WORKSHOP]);

        fireEvent.click(screen.getByRole('button', { name: 'Historie (1)' }));

        const [ongoingCard, upcomingCard, pastCard] = getWorkshopCards();

        expect(ongoingCard.textContent).toContain('61 registrovaných');
        expect(upcomingCard.textContent).toContain('1 registrovaný');


exec
/bin/zsh -lc 'cat lib/workshops/workshopPhase.test.ts && cat lib/events/eventListing.test.ts' in /Users/hejny/work/aldaron
 succeeded in 0ms:
import {
    groupWorkshopsByPhase,
    getMostProminentWorkshopPhase,
    getWorkshopExpectedEndsAtMilliseconds,
    getWorkshopPhase,
    isWorkshopEndOpen,
    isWorkshopPhasePast,
    isWorkshopPhaseUpcoming,
    sortWorkshopsByPhase,
    type WorkshopOccurrenceTiming,
} from '@/lib/workshops/workshopPhase';
import { describe, expect, it } from 'vitest';

const CURRENT_TIME_MILLISECONDS = Date.parse('2026-08-21T19:30:00+02:00');

const PAST_WORKSHOP: WorkshopOccurrenceTiming = {
    startsAt: '2026-07-10T19:00:00+02:00',
    endsAt: '2026-07-10T20:30:00+02:00',
};

/**
 * A workshop of yesterday evening, which ended a few hours before the moment these terms are placed against
 */
const FRESHLY_PAST_WORKSHOP: WorkshopOccurrenceTiming = {
    startsAt: '2026-08-20T19:00:00+02:00',
    endsAt: '2026-08-20T20:30:00+02:00',
};
const OLDER_PAST_WORKSHOP: WorkshopOccurrenceTiming = {
    startsAt: '2026-06-10T19:00:00+02:00',
    endsAt: '2026-06-10T20:30:00+02:00',
};
const ONGOING_WORKSHOP: WorkshopOccurrenceTiming = {
    startsAt: '2026-08-21T19:00:00+02:00',
    endsAt: '2026-08-21T20:30:00+02:00',
};
const UPCOMING_WORKSHOP: WorkshopOccurrenceTiming = {
    startsAt: '2026-09-10T19:00:00+02:00',
    endsAt: '2026-09-10T20:30:00+02:00',
};
const UPCOMING_NEXT_WEEK_WORKSHOP: WorkshopOccurrenceTiming = {
    startsAt: '2026-08-24T19:00:00+02:00',
    endsAt: '2026-08-24T20:30:00+02:00',
};
const LATER_UPCOMING_WORKSHOP: WorkshopOccurrenceTiming = {
    startsAt: '2026-10-10T19:00:00+02:00',
    endsAt: '2026-10-10T20:30:00+02:00',
};
const OPEN_ENDED_WORKSHOP: WorkshopOccurrenceTiming = {
    startsAt: '2026-08-21T19:00:00+02:00',
    endsAt: null,
};

describe('workshop phase', () => {
    it('places an occurrence against the given moment', () => {
        expect(getWorkshopPhase(UPCOMING_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming');
        expect(getWorkshopPhase(UPCOMING_NEXT_WEEK_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming-next-week');
        expect(getWorkshopPhase(ONGOING_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('ongoing');
        expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('freshly-past');
        expect(getWorkshopPhase(PAST_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('past');
    });

    it('keeps an occurrence freshly past for a whole day after the end recorded for it', () => {
        expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, Date.parse('2026-08-20T20:30:01+02:00'))).toBe('freshly-past');
        expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('freshly-past');
        expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, Date.parse('2026-08-21T20:30:01+02:00'))).toBe('past');
    });

    it('counts an occurrence which has only just been held among the ones which are over', () => {
        expect(isWorkshopPhasePast('freshly-past')).toBe(true);
        expect(isWorkshopPhasePast('past')).toBe(true);
        expect(isWorkshopPhasePast('ongoing')).toBe(false);
        expect(isWorkshopPhasePast('upcoming-next-week')).toBe(false);
        expect(isWorkshopPhasePast('upcoming')).toBe(false);
    });

    it('keeps a term starting within seven rolling days separate from a later upcoming term', () => {
        const workshopAtNextWeekBoundary: WorkshopOccurrenceTiming = {
            startsAt: '2026-08-28T19:30:00+02:00',
            endsAt: '2026-08-28T20:30:00+02:00',
        };
        const workshopAfterNextWeekBoundary: WorkshopOccurrenceTiming = {
            ...workshopAtNextWeekBoundary,
            startsAt: '2026-08-28T19:30:00.001+02:00',
        };

        expect(getWorkshopPhase(workshopAtNextWeekBoundary, CURRENT_TIME_MILLISECONDS)).toBe('upcoming-next-week');
        expect(getWorkshopPhase(workshopAfterNextWeekBoundary, CURRENT_TIME_MILLISECONDS)).toBe('upcoming');
    });

    it('counts both kinds of future term among the workshops which are still ahead', () => {
        expect(isWorkshopPhaseUpcoming('upcoming-next-week')).toBe(true);
        expect(isWorkshopPhaseUpcoming('upcoming')).toBe(true);
        expect(isWorkshopPhaseUpcoming('ongoing')).toBe(false);
        expect(isWorkshopPhaseUpcoming('freshly-past')).toBe(false);
        expect(isWorkshopPhaseUpcoming('past')).toBe(false);
    });

    it('never calls an occurrence whose end is left open freshly past, however long ago it started', () => {
        expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-08-22T19:00:00+02:00'))).toBe('ongoing');
    });

    it('keeps a workshop whose end is left open running until an end is recorded', () => {
        expect(isWorkshopEndOpen(OPEN_ENDED_WORKSHOP)).toBe(true);
        expect(isWorkshopEndOpen(ONGOING_WORKSHOP)).toBe(false);
        expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('ongoing');
        expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('ongoing');
        expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-12-24T18:00:00+01:00'))).toBe('ongoing');
        expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-08-21T18:59:59+02:00'))).toBe(
            'upcoming-next-week',
        );
    });

    it('ends a workshop as soon as the administration records the moment it was ended', () => {
        const endedWorkshop: WorkshopOccurrenceTiming = {
            ...OPEN_ENDED_WORKSHOP,
            endsAt: '2026-08-21T20:12:00+02:00',
        };

        expect(isWorkshopEndOpen(endedWorkshop)).toBe(false);
        expect(getWorkshopPhase(endedWorkshop, Date.parse('2026-08-21T20:11:00+02:00'))).toBe('ongoing');
        expect(getWorkshopPhase(endedWorkshop, Date.parse('2026-08-21T20:13:00+02:00'))).toBe('freshly-past');
        expect(getWorkshopPhase(endedWorkshop, Date.parse('2026-08-23T20:13:00+02:00'))).toBe('past');
    });

    it('expects an open end to take as long as a workshop usually does, without ending it', () => {
        expect(getWorkshopExpectedEndsAtMilliseconds(OPEN_ENDED_WORKSHOP)).toBe(
            Date.parse('2026-08-21T20:00:00+02:00'),
        );
        expect(getWorkshopExpectedEndsAtMilliseconds(ONGOING_WORKSHOP)).toBe(
            Date.parse('2026-08-21T20:30:00+02:00'),
        );
    });

    it('keeps an occurrence ongoing until its very end and imminent until its very start', () => {
        expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T19:00:00+02:00'))).toBe('ongoing');
        expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T18:59:59+02:00'))).toBe(
            'upcoming-next-week',
        );
        expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('freshly-past');
    });
});

describe('workshop phase ordering', () => {
    it('lists what runs now, needs wrap-up, starts within a week, starts later, and is history in that order', () => {
        const sortedWorkshops = sortWorkshopsByPhase(
            [
                OLDER_PAST_WORKSHOP,
                LATER_UPCOMING_WORKSHOP,
                PAST_WORKSHOP,
                FRESHLY_PAST_WORKSHOP,
                UPCOMING_WORKSHOP,
                UPCOMING_NEXT_WEEK_WORKSHOP,
                ONGOING_WORKSHOP,
            ],
            CURRENT_TIME_MILLISECONDS,
        );

        expect(sortedWorkshops).toEqual([
            ONGOING_WORKSHOP,
            FRESHLY_PAST_WORKSHOP,
            UPCOMING_NEXT_WEEK_WORKSHOP,
            UPCOMING_WORKSHOP,
            LATER_UPCOMING_WORKSHOP,
            PAST_WORKSHOP,
            OLDER_PAST_WORKSHOP,
        ]);
    });

    it('leaves the listed workshops untouched', () => {
        const workshops = [UPCOMING_WORKSHOP, ONGOING_WORKSHOP];

        sortWorkshopsByPhase(workshops, CURRENT_TIME_MILLISECONDS);

        expect(workshops).toEqual([UPCOMING_WORKSHOP, ONGOING_WORKSHOP]);
    });

    it('groups every phase in the same priority and date order as the workshop list', () => {
        const workshopsByPhase = groupWorkshopsByPhase(
            [
                OLDER_PAST_WORKSHOP,
                LATER_UPCOMING_WORKSHOP,
                PAST_WORKSHOP,
                FRESHLY_PAST_WORKSHOP,
                UPCOMING_WORKSHOP,
                UPCOMING_NEXT_WEEK_WORKSHOP,
                ONGOING_WORKSHOP,
            ],
            CURRENT_TIME_MILLISECONDS,
        );

        expect(workshopsByPhase).toEqual({
            ongoing: [ONGOING_WORKSHOP],
            'freshly-past': [FRESHLY_PAST_WORKSHOP],
            'upcoming-next-week': [UPCOMING_NEXT_WEEK_WORKSHOP],
            upcoming: [UPCOMING_WORKSHOP, LATER_UPCOMING_WORKSHOP],
            past: [PAST_WORKSHOP, OLDER_PAST_WORKSHOP],
        });
    });

    it('lets the most pressing phase speak for a group of occurrences', () => {
        expect(getMostProminentWorkshopPhase(['past', 'upcoming', 'ongoing'])).toBe('ongoing');
        expect(getMostProminentWorkshopPhase(['past', 'upcoming', 'upcoming-next-week'])).toBe('upcoming-next-week');
        expect(getMostProminentWorkshopPhase(['past', 'freshly-past', 'upcoming'])).toBe('freshly-past');
        expect(getMostProminentWorkshopPhase(['past', 'freshly-past'])).toBe('freshly-past');
        expect(getMostProminentWorkshopPhase(['past'])).toBe('past');
        expect(getMostProminentWorkshopPhase([])).toBe('past');
    });
});
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import {
    createEventListings,
    groupEventListingsByDayKey,
    selectInitialCalendarMonthKey,
} from '@/lib/events/eventListing';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';
import { describe, expect, it } from 'vitest';

const PRAGUE_TIME_ZONE = 'Europe/Prague';
const CURRENT_TIME_MILLISECONDS = Date.parse('2026-09-10T19:30:00+02:00');
const PARTICIPANT_IDENTITY = { fullname: 'Jana Nováková', email: 'jana@example.com' };

const ONGOING_WORKSHOP: WorkshopSummary = {
    id: 'ongoing-workshop-id',
    kind: 'workshop',
    event: DEFAULT_EVENT_DETAILS,
    slug: 'production-ai-2026-09-10',
    title: 'Produkční kód s AI agenty',
    description: 'Online workshop s Pavolem Hejným a Jiřím Jahnem',
    startsAt: '2026-09-10T19:00:00+02:00',
    endsAt: '2026-09-10T20:30:00+02:00',
    isPublished: true,
};

const UPCOMING_WORKSHOP: WorkshopSummary = {
    ...ONGOING_WORKSHOP,
    id: 'upcoming-workshop-id',
    slug: 'production-ai-2026-10-08',
    startsAt: '2026-10-08T19:00:00+02:00',
    endsAt: '2026-10-08T20:30:00+02:00',
};

const UPCOMING_NEXT_WEEK_WORKSHOP: WorkshopSummary = {
    ...ONGOING_WORKSHOP,
    id: 'upcoming-next-week-workshop-id',
    slug: 'production-ai-2026-09-13',
    startsAt: '2026-09-13T19:00:00+02:00',
    endsAt: '2026-09-13T20:30:00+02:00',
};

const FRESHLY_PAST_WORKSHOP: WorkshopSummary = {
    ...ONGOING_WORKSHOP,
    id: 'freshly-past-workshop-id',
    slug: 'production-ai-2026-09-09',
    startsAt: '2026-09-09T19:00:00+02:00',
    endsAt: '2026-09-09T20:30:00+02:00',
};

const PAST_WORKSHOP: WorkshopSummary = {
    ...ONGOING_WORKSHOP,
    id: 'past-workshop-id',
    slug: 'production-ai-2026-07-10',
    startsAt: '2026-07-10T19:00:00+02:00',
    endsAt: '2026-07-10T20:30:00+02:00',
};

const COMMUNITY_ROOM: WorkshopSummary = {
    ...ONGOING_WORKSHOP,
    id: 'community-id',
    kind: 'community',
    event: null,
    slug: 'komunita',
    title: 'Komunita Promptbooku',
};

function createListings(workshops: readonly WorkshopSummary[]) {
    return createEventListings({
        workshops,
        participantIdentity: PARTICIPANT_IDENTITY,
        currentTimeMilliseconds: CURRENT_TIME_MILLISECONDS,
        timeZone: PRAGUE_TIME_ZONE,
    });
}

describe('event listings', () => {
    it('leads with the running term, its wrap-up, the next week, later terms, and the history', () => {
        const listings = createListings([
            PAST_WORKSHOP,
            UPCOMING_WORKSHOP,
            UPCOMING_NEXT_WEEK_WORKSHOP,
            FRESHLY_PAST_WORKSHOP,
            ONGOING_WORKSHOP,
        ]);

        expect(listings.map((listing) => listing.phase)).toEqual([
            'ongoing',
            'freshly-past',
            'upcoming-next-week',
            'upcoming',
            'past',
        ]);
        expect(listings.map((listing) => listing.dayKey)).toEqual([
            '2026-09-10',
            '2026-09-09',
            '2026-09-13',
            '2026-10-08',
            '2026-07-10',
        ]);
    });

    it('carries the identity of the member into every term which has a room', () => {
        const [listing] = createListings([ONGOING_WORKSHOP]);

        expect(listing?.link).toBe(
            '/cs/online-workshop/participant?workshop=production-ai-2026-09-10&email=jana%40example.com&fullname=Jana+Nov%C3%A1kov%C3%A1',
        );
    });

    it('leaves out a room which is no term of any event at all', () => {
        expect(createListings([COMMUNITY_ROOM, ONGOING_WORKSHOP]).map((listing) => listing.workshop.id)).toEqual([
            ONGOING_WORKSHOP.id,
        ]);
    });

    it('gathers the terms of one day under that day', () => {
        const secondTermOfTheSameDay = { ...ONGOING_WORKSHOP, id: 'second-id', slug: 'production-ai-2026-09-10-b' };
        const listingsByDayKey = groupEventListingsByDayKey(
            createListings([ONGOING_WORKSHOP, secondTermOfTheSameDay, UPCOMING_WORKSHOP]),
        );

        expect(listingsByDayKey.get('2026-09-10')).toHaveLength(2);
        expect(listingsByDayKey.get('2026-10-08')).toHaveLength(1);
        expect(listingsByDayKey.get('2026-09-11')).toBeUndefined();
    });

    it('opens the calendar on the month a member is in whenever a term is held in it', () => {
        expect(selectInitialCalendarMonthKey(createListings([ONGOING_WORKSHOP, UPCOMING_WORKSHOP]), '2026-09-10')).toBe(
            '2026-09',
        );
    });

    it('opens the calendar on the most relevant term rather than on an empty month', () => {
        expect(selectInitialCalendarMonthKey(createListings([PAST_WORKSHOP, UPCOMING_WORKSHOP]), '2026-09-10')).toBe(
            '2026-10',
        );
        expect(selectInitialCalendarMonthKey([], '2026-09-10')).toBe('2026-09');
    });
});

exec
/bin/zsh -lc "rg -n 'upcoming-next-week|WORKSHOP_PHASE_VALUES|WorkshopPhase' lib components businesses tests --glob '"'!*.test.*'"' && cat components/workshops/workshopRoomTheme.css && cat tailwind.config.*" in /Users/hejny/work/aldaron
 succeeded in 0ms:
businesses/workshop-admin/WorkshopSettingsForm.tsx:28:import { getWorkshopPhase } from '@/lib/workshops/workshopPhase';
businesses/workshop-admin/WorkshopSettingsForm.tsx:103:        getWorkshopPhase({ startsAt: startsAtIso, endsAt: endsAtIso }) === 'ongoing';
components/events/EventTermOptionCard.tsx:1:import { WorkshopPhaseBadge } from '@/components/workshops/WorkshopPhaseBadge';
components/events/EventTermOptionCard.tsx:7:import { getWorkshopPhase } from '@/lib/workshops/workshopPhase';
components/events/EventTermOptionCard.tsx:177:    const phase = getWorkshopPhase(occurrence, Date.parse(currentTime));
components/events/EventTermOptionCard.tsx:178:    const isWorkshopStartingWithinNextWeek = phase === 'upcoming-next-week';
components/events/EventTermOptionCard.tsx:203:                    <WorkshopPhaseBadge
businesses/workshop-admin/WorkshopSelectorCard.tsx:12:import { WorkshopPhaseBadge } from '@/components/workshops/WorkshopPhaseBadge';
businesses/workshop-admin/WorkshopSelectorCard.tsx:13:import { getWorkshopPhase } from '@/lib/workshops/workshopPhase';
businesses/workshop-admin/WorkshopSelectorCard.tsx:39:                <WorkshopPhaseBadge phase={getWorkshopPhase(workshop)} className="!px-2 !py-0.5 !text-[11px]" />
businesses/workshop-admin/agents/WorkshopAgentListening.tsx:4:import { getWorkshopPhase } from '@/lib/workshops/workshopPhase';
businesses/workshop-admin/agents/WorkshopAgentListening.tsx:20:    const isLive = getWorkshopPhase(workshop) === 'ongoing' && workshop.isPublished && !workshop.disabledPanels.includes('chat');
components/workshops/workshopPhaseAppearance.ts:1:import type { WorkshopPhase } from '@/lib/workshops/workshopPhase';
components/workshops/workshopPhaseAppearance.ts:6:export type WorkshopPhaseTone = 'light' | 'room';
components/workshops/workshopPhaseAppearance.ts:11:export type WorkshopPhaseAppearance = {
components/workshops/workshopPhaseAppearance.ts:20:    readonly badgeClassNameByTone: Readonly<Record<WorkshopPhaseTone, string>>;
components/workshops/workshopPhaseAppearance.ts:42:const WORKSHOP_PHASE_APPEARANCES: Readonly<Record<WorkshopPhase, WorkshopPhaseAppearance>> = {
components/workshops/workshopPhaseAppearance.ts:66:    'upcoming-next-week': {
components/workshops/workshopPhaseAppearance.ts:95:export function getWorkshopPhaseAppearance(phase: WorkshopPhase): WorkshopPhaseAppearance {
components/workshops/WorkshopEventCard.tsx:2:import { WorkshopPhaseBadge } from '@/components/workshops/WorkshopPhaseBadge';
components/workshops/WorkshopEventCard.tsx:11:import { isWorkshopPhasePast } from '@/lib/workshops/workshopPhase';
components/workshops/WorkshopEventCard.tsx:81:    const isRecordingDurationShown = isWorkshopPhasePast(phase) && recordingDurationSeconds !== null;
components/workshops/WorkshopEventCard.tsx:101:                        <WorkshopPhaseBadge phase={phase} tone="room" />
components/workshops/WorkshopPhaseBadge.tsx:2:    getWorkshopPhaseAppearance,
components/workshops/WorkshopPhaseBadge.tsx:3:    type WorkshopPhaseTone,
components/workshops/WorkshopPhaseBadge.tsx:6:import type { WorkshopPhase } from '@/lib/workshops/workshopPhase';
components/workshops/WorkshopPhaseBadge.tsx:8:type WorkshopPhaseBadgeProps = {
components/workshops/WorkshopPhaseBadge.tsx:9:    readonly phase: WorkshopPhase;
components/workshops/WorkshopPhaseBadge.tsx:14:    readonly tone?: WorkshopPhaseTone;
components/workshops/WorkshopPhaseBadge.tsx:21:export function WorkshopPhaseBadge({ phase, tone = 'light', className }: WorkshopPhaseBadgeProps) {
components/workshops/WorkshopPhaseBadge.tsx:22:    const { label, badgeClassNameByTone } = getWorkshopPhaseAppearance(phase);
lib/events/eventListing.ts:10:import { getWorkshopPhase, sortWorkshopsByPhase, type WorkshopPhase } from '@/lib/workshops/workshopPhase';
lib/events/eventListing.ts:32:    readonly phase: WorkshopPhase;
lib/events/eventListing.ts:82:                      phase: getWorkshopPhase(workshop, currentTimeMilliseconds),
components/workshops/WorkshopCalendarMonth.tsx:5:import { getWorkshopPhaseAppearance } from '@/components/workshops/workshopPhaseAppearance';
components/workshops/WorkshopCalendarMonth.tsx:23:import { WORKSHOP_PHASE_VALUES } from '@/lib/workshops/workshopPhase';
components/workshops/WorkshopCalendarMonth.tsx:55:            {WORKSHOP_PHASE_VALUES.map((phase) => {
components/workshops/WorkshopCalendarMonth.tsx:56:                const { label, markClassName } = getWorkshopPhaseAppearance(phase);
components/workshops/WorkshopCalendarDay.tsx:1:import { getWorkshopPhaseAppearance } from '@/components/workshops/workshopPhaseAppearance';
components/workshops/WorkshopCalendarDay.tsx:5:import { getMostProminentWorkshopPhase, type WorkshopPhase } from '@/lib/workshops/workshopPhase';
components/workshops/WorkshopCalendarDay.tsx:37:function WorkshopCalendarDayMark({ phase }: { readonly phase: WorkshopPhase }) {
components/workshops/WorkshopCalendarDay.tsx:40:            className={classNames('h-1.5 w-1.5 shrink-0 rounded-full', getWorkshopPhaseAppearance(phase).markClassName)}
components/workshops/WorkshopCalendarDay.tsx:63:        ? getWorkshopPhaseAppearance(getMostProminentWorkshopPhase(listings.map((listing) => listing.phase)))
lib/workshops/workshopPublic.ts:4:import { getWorkshopPhase, isWorkshopPhasePast } from '@/lib/workshops/workshopPhase';
lib/workshops/workshopPublic.ts:129:                isRecordingAvailable: isWorkshopPhasePast(
lib/workshops/workshopPublic.ts:130:                    getWorkshopPhase(
lib/workshops/workshopWrapUpExport.ts:4:import { getWorkshopPhase, isWorkshopPhasePast } from '@/lib/workshops/workshopPhase';
lib/workshops/workshopWrapUpExport.ts:27:        && isWorkshopPhasePast(getWorkshopPhase(source.workshop, Date.parse(source.serverTime)));
lib/workshops/workshopDatabase.ts:32:import { getWorkshopPhase, isWorkshopPhasePast } from '@/lib/workshops/workshopPhase';
lib/workshops/workshopDatabase.ts:2478:    const isWorkshopPast = workshopRow.room_kind === 'workshop' && isWorkshopPhasePast(getWorkshopPhase(workshop));
businesses/workshop-admin/WorkshopSelectorCardList.tsx:5:import { getWorkshopPhaseAppearance } from '@/components/workshops/workshopPhaseAppearance';
businesses/workshop-admin/WorkshopSelectorCardList.tsx:7:    getWorkshopPhase,
businesses/workshop-admin/WorkshopSelectorCardList.tsx:9:    WORKSHOP_PHASE_VALUES,
businesses/workshop-admin/WorkshopSelectorCardList.tsx:10:    type WorkshopPhase,
businesses/workshop-admin/WorkshopSelectorCardList.tsx:36:function getWorkshopPhaseCategoryLabel(phase: WorkshopPhase): string {
businesses/workshop-admin/WorkshopSelectorCardList.tsx:37:    return phase === 'past' ? WORKSHOP_HISTORY_CATEGORY_LABEL : getWorkshopPhaseAppearance(phase).label;
businesses/workshop-admin/WorkshopSelectorCardList.tsx:113:        selectedWorkshop !== undefined && getWorkshopPhase(selectedWorkshop) === 'past';
businesses/workshop-admin/WorkshopSelectorCardList.tsx:153:                            {WORKSHOP_PHASE_VALUES.filter((phase) => phase !== 'past').map((phase) => {
businesses/workshop-admin/WorkshopSelectorCardList.tsx:155:                                const phaseCategoryLabel = getWorkshopPhaseCategoryLabel(phase);
lib/workshops/workshopPhase.ts:21:export const WORKSHOP_PHASE_VALUES = ['ongoing', 'freshly-past', 'upcoming-next-week', 'upcoming', 'past'] as const;
lib/workshops/workshopPhase.ts:23:export type WorkshopPhase = (typeof WORKSHOP_PHASE_VALUES)[number];
lib/workshops/workshopPhase.ts:32:export function isWorkshopPhasePast(phase: WorkshopPhase): boolean {
lib/workshops/workshopPhase.ts:43:export function isWorkshopPhaseUpcoming(phase: WorkshopPhase): boolean {
lib/workshops/workshopPhase.ts:44:    return phase === 'upcoming-next-week' || phase === 'upcoming';
lib/workshops/workshopPhase.ts:63:function getWorkshopPhaseRank(phase: WorkshopPhase): number {
lib/workshops/workshopPhase.ts:64:    return WORKSHOP_PHASE_VALUES.indexOf(phase);
lib/workshops/workshopPhase.ts:124:export function getWorkshopPhase(
lib/workshops/workshopPhase.ts:127:): WorkshopPhase {
lib/workshops/workshopPhase.ts:130:        return 'upcoming-next-week';
lib/workshops/workshopPhase.ts:153:export function getMostProminentWorkshopPhase(phases: readonly WorkshopPhase[]): WorkshopPhase {
lib/workshops/workshopPhase.ts:156:            getWorkshopPhaseRank(phase) < getWorkshopPhaseRank(mostProminentPhase) ? phase : mostProminentPhase,
lib/workshops/workshopPhase.ts:167:function getWorkshopPhaseOrder(
lib/workshops/workshopPhase.ts:171:    const phase = getWorkshopPhase(occurrence, currentTimeMilliseconds);
lib/workshops/workshopPhase.ts:175:    return { phaseRank: getWorkshopPhaseRank(phase), dateRank: isWorkshopPhasePast(phase) ? -dateRank : dateRank };
lib/workshops/workshopPhase.ts:188:        .map((workshop) => ({ workshop, order: getWorkshopPhaseOrder(workshop, currentTimeMilliseconds) }))
lib/workshops/workshopPhase.ts:206:): Readonly<Record<WorkshopPhase, readonly TWorkshop[]>> {
lib/workshops/workshopPhase.ts:207:    const workshopsByPhase: Record<WorkshopPhase, TWorkshop[]> = {
lib/workshops/workshopPhase.ts:210:        'upcoming-next-week': [],
lib/workshops/workshopPhase.ts:216:        workshopsByPhase[getWorkshopPhase(workshop, currentTimeMilliseconds)].push(workshop);
lib/workshops/agents/workshopAgentPolicy.ts:3:import { getWorkshopPhase } from '@/lib/workshops/workshopPhase';
lib/workshops/agents/workshopAgentPolicy.ts:16:        getWorkshopPhase({ startsAt: room.starts_at, endsAt: room.ends_at }) === 'ongoing';
businesses/online-workshop/participant/WorkshopWrapUpNavigation.tsx:9:import { isWorkshopPhaseUpcoming } from '@/lib/workshops/workshopPhase';
businesses/online-workshop/participant/WorkshopWrapUpNavigation.tsx:38:    }).filter((listing) => isWorkshopPhaseUpcoming(listing.phase) && !isExternalEventType(listing.event.type));
businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx:70:        ...termsByPhase['upcoming-next-week'],
businesses/online-workshop/participant/WorkshopStage.tsx:14:import { getWorkshopPhase, isWorkshopPhasePast } from '@/lib/workshops/workshopPhase';
businesses/online-workshop/participant/WorkshopStage.tsx:108:    const phase = getWorkshopPhase(workshop, currentTime);
businesses/online-workshop/participant/WorkshopStage.tsx:110:    const isWorkshopPast = isWorkshopPhasePast(phase);
/* Semantic room colors also reach body portals. Elsewhere the provider keeps the
   original dark defaults for shared room cards embedded in marketing pages. */
:root {
    --room-background: 6 19 27;
    --room-surface: 8 26 36;
    --room-header: 7 24 32;
    --room-inset: 2 6 23;
    --room-hover: 15 23 42;
    --room-overlay: 255 255 255;
    --room-border: 255 255 255;
    --room-heading: 248 250 252;
    --room-text: 226 232 240;
    --room-muted: 148 163 184;
    --room-subtle: 148 163 184;
    --room-accent: 165 243 252;
    --room-action: 103 232 249;
    --room-action-hover: 165 243 252;
    --room-action-foreground: 2 6 23;
    --room-success: 167 243 208;
    --room-warning: 253 230 138;
    --room-danger: 253 164 175;
    --room-upcoming: 196 181 253;
    --room-graph-pink: 244 114 182;
    --room-color-scheme: dark;
    --room-focus-ring: 188 86% 53%;
}

:root[data-room-theme='light'] {
    --room-background: 244 248 250;
    --room-surface: 255 255 255;
    --room-header: 255 255 255;
    --room-inset: 241 245 249;
    --room-hover: 226 232 240;
    --room-overlay: 15 23 42;
    --room-border: 15 23 42;
    --room-heading: 15 23 42;
    --room-text: 51 65 85;
    --room-muted: 71 85 105;
    --room-subtle: 82 97 118;
    --room-accent: 21 94 117;
    --room-action: 14 116 144;
    --room-action-hover: 21 94 117;
    --room-action-foreground: 255 255 255;
    --room-success: 6 95 70;
    --room-warning: 146 64 14;
    --room-danger: 159 18 57;
    --room-upcoming: 109 40 217;
    --room-graph-pink: 190 24 93;
    --room-color-scheme: light;
    --room-focus-ring: 192 82% 31%;
}

/* Native controls use the palette only in rooms and their portalled dialogs. */
.workshop-room {
    color-scheme: var(--room-color-scheme);
    --ring: var(--room-focus-ring);
}
import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: ['class'],
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './businesses/**/*.{js,ts,jsx,tsx,mdx}',
        './config/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-promptbook':
                    'linear-gradient(135deg, var(--promptbook-blue) 0%, var(--promptbook-green) 100%)',
                'gradient-promptbook-dark':
                    'linear-gradient(135deg, var(--promptbook-blue-dark) 0%, var(--promptbook-green-dark) 100%)',

                // TODO: Organize these better, remove:
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'gradient-purple': 'linear-gradient(135deg, #7aebff 0%, #3B82F6 100%)',
                'gradient-green': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            colors: {
                room: {
                    background: 'rgb(var(--room-background) / <alpha-value>)',
                    surface: 'rgb(var(--room-surface) / <alpha-value>)',
                    header: 'rgb(var(--room-header) / <alpha-value>)',
                    inset: 'rgb(var(--room-inset) / <alpha-value>)',
                    hover: 'rgb(var(--room-hover) / <alpha-value>)',
                    overlay: 'rgb(var(--room-overlay) / <alpha-value>)',
                    border: 'rgb(var(--room-border) / <alpha-value>)',
                    heading: 'rgb(var(--room-heading) / <alpha-value>)',
                    text: 'rgb(var(--room-text) / <alpha-value>)',
                    muted: 'rgb(var(--room-muted) / <alpha-value>)',
                    subtle: 'rgb(var(--room-subtle) / <alpha-value>)',
                    accent: 'rgb(var(--room-accent) / <alpha-value>)',
                    action: 'rgb(var(--room-action) / <alpha-value>)',
                    'action-hover': 'rgb(var(--room-action-hover) / <alpha-value>)',
                    'action-foreground': 'rgb(var(--room-action-foreground) / <alpha-value>)',
                    success: 'rgb(var(--room-success) / <alpha-value>)',
                    warning: 'rgb(var(--room-warning) / <alpha-value>)',
                    danger: 'rgb(var(--room-danger) / <alpha-value>)',
                    upcoming: 'rgb(var(--room-upcoming) / <alpha-value>)',
                },
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                chart: {
                    '1': 'hsl(var(--chart-1))',
                    '2': 'hsl(var(--chart-2))',
                    '3': 'hsl(var(--chart-3))',
                    '4': 'hsl(var(--chart-4))',
                    '5': 'hsl(var(--chart-5))',
                },
                // Promptbook brand colors
                promptbook: {
                    blue: '#7aebff',
                    'dark-gray': '#111827',
                    'light-gray': '#f3f4f6',
                    success: '#10b981',
                    error: '#ef4444',
                },
            },
            keyframes: {
                'accordion-down': {
                    from: {
                        height: '0',
                    },
                    to: {
                        height: 'var(--radix-accordion-content-height)',
                    },
                },
                'accordion-up': {
                    from: {
                        height: 'var(--radix-accordion-content-height)',
                    },
                    to: {
                        height: '0',
                    },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
            },
        },
    },
    plugins: [require('tailwindcss-animate')],
};
export default config;

exec
/bin/zsh -lc "sed -n '150,225p' components/events/EventTermOptionCard.tsx && cat lib/workshops/workshopConstants.ts && rg -n 'TIME_ZONE|timeZone' config/online* businesses/online-workshop/*.ts components/workshops/WorkshopLinksPanel.tsx && sed -n '1,110p' changelog/_current-preversion.md && sed -n '1,110p' lib/workshops/workshopPhase.test.ts" in /Users/hejny/work/aldaron
 exited 1 in 0ms:
     * seats are left in them
     */
    readonly noteIcon: LucideIcon;
    readonly noteText: string;
};

/**
 * One term of an event as a visitor picks it, which says when it is held, what it is about, in what form, and at what
 * price
 *
 * Note: Every landing page which lets a visitor choose between the terms of its event picks them with this one card,
 *       so the terms of two events are never offered in two different ways. What only one of those pages knows about
 *       its terms is said in the note beneath.
 */
export function EventTermOptionCard({
    occurrence,
    isSelected,
    onSelect,
    currentTime,
    isTopicShown = false,
    appearance = 'light',
    density = 'comfortable',
    noteIcon: NoteIcon,
    noteText,
}: EventTermOptionCardProps) {
    const appearanceClassNames = EVENT_TERM_OPTION_CARD_APPEARANCES[appearance];
    const densityClassNames = EVENT_TERM_OPTION_CARD_DENSITIES[density];
    const phase = getWorkshopPhase(occurrence, Date.parse(currentTime));
    const isWorkshopStartingWithinNextWeek = phase === 'upcoming-next-week';

    return (
        <button
            type="button"
            aria-pressed={isSelected}
            onClick={onSelect}
            className={cn(
                'border text-left transition-all',
                densityClassNames.card,
                isSelected ? appearanceClassNames.selectedCard : appearanceClassNames.card,
            )}
        >
            <span
                className={cn(
                    'flex flex-wrap items-center gap-2 font-bold',
                    densityClassNames.heading,
                    appearanceClassNames.heading,
                )}
            >
                <span>
                    {formatCzechWorkshopRelativeDay(occurrence.startsAt, currentTime)} ·{' '}
                    {formatCzechWorkshopTimeRange(occurrence.startsAt, occurrence.endsAt)}
                </span>
                {isWorkshopStartingWithinNextWeek && (
                    <WorkshopPhaseBadge
                        phase={phase}
                        tone={appearance}
                        className={density === 'compact' ? '!px-2 !py-0.5 !text-[11px]' : undefined}
                    />
                )}
            </span>
            {isTopicShown && (
                <>
                    <span className={cn('font-semibold', densityClassNames.title, appearanceClassNames.title)}>
                        {occurrence.title}
                    </span>
                    {occurrence.description.trim() !== '' && (
                        <span className={cn(densityClassNames.description, appearanceClassNames.description)}>
                            {occurrence.description}
                        </span>
                    )}
                </>
            )}
            <span className={cn('flex flex-wrap items-center', densityClassNames.detailsRow)}>
                <span
                    className={cn(
                        'rounded-full font-semibold',
export const WORKSHOP_TABLE_NAME = 'workshops';
export const WORKSHOP_IS_DELETED_COLUMN_NAME = 'is_deleted';
export const WORKSHOP_CONTENT_TABLE_NAME = 'workshop_content_blocks';
export const WORKSHOP_PARTICIPANT_TABLE_NAME = 'workshop_participants';
export const WORKSHOP_COMMENT_TABLE_NAME = 'workshop_comments';
export const WORKSHOP_UPVOTE_TABLE_NAME = 'workshop_comment_upvotes';
export const WORKSHOP_REACTION_TABLE_NAME = 'workshop_reactions';
export const WORKSHOP_CONTENT_SHORTCODE_LINK_TABLE_NAME = 'workshop_content_shortcode_links';
export const WORKSHOP_COMMENT_SHORTCODE_LINK_TABLE_NAME = 'workshop_comment_shortcode_links';
export const WORKSHOP_FEEDBACK_TABLE_NAME = 'workshop_feedback';
export const WORKSHOP_POLL_TABLE_NAME = 'workshop_polls';
export const WORKSHOP_POLL_OPTION_TABLE_NAME = 'workshop_poll_options';
export const WORKSHOP_POLL_VOTE_TABLE_NAME = 'workshop_poll_votes';
export const WORKSHOP_POLL_WORKSHOP_TABLE_NAME = 'workshop_poll_workshops';
export const COPY_WORKSHOP_POLL_ATTACHMENTS_FUNCTION_NAME = 'copy_workshop_poll_attachments';

export const WORKSHOP_SESSION_COOKIE_PREFIX = 'workshop_session_';
export const WORKSHOP_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
export const WORKSHOP_SESSION_TOKEN_BYTES = 32;
export const MAXIMAL_WORKSHOP_PARTICIPANT_FULLNAME_LENGTH = 200;
export const MAXIMAL_WORKSHOP_PARTICIPANT_EMAIL_LENGTH = 320;
export const MAXIMAL_WORKSHOP_PARTICIPANT_USER_AGENT_LENGTH = 2_000;
export const MAXIMAL_WORKSHOP_SLUG_LENGTH = 100;
export const MAXIMAL_WORKSHOP_REACTION_LENGTH = 16;
export const DEFAULT_WORKSHOP_DURATION_MINUTES = 60;

/**
 * How long after its recorded end an occurrence is still freshly past
 *
 * Note: A workshop which ended within the last day is what a member has just been at, so it is still worth reading as
 *       something which has only just happened rather than as one more term of the history. A whole day is what that
 *       takes, because somebody who was at an evening workshop reads about it again the next morning.
 */
export const FRESHLY_PAST_WORKSHOP_HOURS = 24;

/**
 * How long before its start an occurrence is called imminent rather than merely upcoming.
 *
 * Note: This is a rolling seven-day window measured from the moment a list is built, rather than a calendar week.
 *       Someone reading the schedule on Friday should therefore see a workshop next Thursday in exactly the same
 *       special category as somebody reading it on Monday sees a workshop the following Monday.
 */
export const UPCOMING_NEXT_WEEK_WORKSHOP_HOURS = 7 * 24;

/**
 * The greatest whole-second position PostgreSQL can safely store in the recording offset's integer column.
 */
export const MAXIMAL_WORKSHOP_RECORDING_START_OFFSET_SECONDS = 2_147_483_647;

/**
 * How long the community can reuse public metadata from a workshop project and YouTube replay.
 *
 * Note: This keeps a list of historic terms from asking every linked project host and YouTube again on each visit,
 * while an administrator's changed deployment still reaches the card during the same day.
 */
export const WORKSHOP_EVENT_CARD_EXTERNAL_DETAILS_REVALIDATE_SECONDS = 60 * 60;

/**
 * How many reactions a single workshop may offer at once
 *
 * Note: The database guards the very same number, so both of them are changed together.
 */
export const MAXIMAL_WORKSHOP_ALLOWED_REACTION_COUNT = 16;
export const MAXIMAL_WORKSHOP_COMMENT_LENGTH = 2_000;
export const MAXIMAL_WORKSHOP_FEEDBACK_TEXT_LENGTH = 5_000;
export const MAXIMAL_WORKSHOP_POLL_QUESTION_LENGTH = 500;
export const MAXIMAL_WORKSHOP_POLL_OPTION_LENGTH = 200;
export const MINIMAL_WORKSHOP_POLL_OPTION_COUNT = 2;
export const MAXIMAL_WORKSHOP_POLL_OPTION_COUNT = 8;
/**
 * How many workshop occurrences one poll can be about
 *
 * Note: The database guards the very same number, so both of them are changed together.
 */
export const MAXIMAL_WORKSHOP_POLL_WORKSHOP_COUNT = 20;
export const MAXIMAL_VISIBLE_WORKSHOP_POLL_COUNT = 20;
export const MAXIMAL_ADMIN_WORKSHOP_POLL_COUNT = 1_000;
export const MAXIMAL_ARTIFICIAL_POLL_VOTE_ADJUSTMENT = 1_000_000;
export const MAXIMAL_WORKSHOP_PRESENCE_REPORT_SECONDS = 120;

/**
 * How many of the newest commits of the connected repository one room lists
 *
 * Note: The commits are read through one cached server-side answer however many participants have the room open, so
 *       the room can follow the project without turning every participant into a GitHub client.
 */
export const MAXIMAL_WORKSHOP_REPOSITORY_COMMIT_COUNT = 10;

/** How long the server remembers commit identifiers while a repository monitor is active */
export const MAXIMAL_WORKSHOP_REPOSITORY_MONITOR_COMMIT_COUNT = 500;

export const WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS = 60;

/** How long a room remains a target of a repository monitor without another repository request */
export const WORKSHOP_REPOSITORY_MONITOR_TARGET_LEASE_SECONDS = 3 * WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS;

/**
 * How long a branch name may be, which is what Git itself allows a reference to be
 */
export const MAXIMAL_WORKSHOP_REPOSITORY_BRANCH_LENGTH = 255;
/** How many branch patterns one workshop may select explicitly */
export const MAXIMAL_WORKSHOP_REPOSITORY_BRANCH_COUNT = 50;
/** How many public addresses the project of one workshop may be deployed at */
export const MAXIMAL_WORKSHOP_REPOSITORY_DEPLOYMENT_COUNT = 50;

/**
 * How long after their last request a participant still counts as watching the workshop
 *
 * Note: An open room reports its presence every 30 seconds and reloads the whole state at most every 150 seconds,
 *       so this window stays above both to never drop an attentive participant out of the count.
 */
export const WORKSHOP_WATCHING_WINDOW_SECONDS = 180;

/**
 * How long one presence sample of a participant lasts, which is what the audience of the administration graph is
 * counted from
 *
 * Note: The database bins the presence it records by the very same number of seconds, see `migrations/*.sql`, so both
 *       of them are changed together. A room reports its presence more often than this, which is what makes a sample
 *       cost one row per watched minute rather than one row per request.
 */
export const WORKSHOP_PRESENCE_SAMPLE_BUCKET_SECONDS = 60;

/**
 * How many messages of a room the administration reads to count the metrics an administrator wrote themselves
 *
 * Note: Whole message bodies travel to the browser for this, so a very busy room is sampled from its newest messages
 *       instead of sending an unbounded answer on every refresh.
 */
export const MAXIMAL_WORKSHOP_ADMIN_COMMENT_SAMPLE_COUNT = 5_000;

export const MAXIMAL_VISIBLE_COMMENT_COUNT = 200;
export const MAXIMAL_VISIBLE_PENDING_COMMENT_COUNT = 50;
export const MAXIMAL_RECENT_REACTION_COUNT = 50;
export const MAXIMAL_ADMIN_PARTICIPANT_LIST_COUNT = 5_000;
export const MAXIMAL_ARTIFICIAL_UPVOTE_ADJUSTMENT = 1_000_000;
export const WORKSHOP_REALTIME_TOPIC_PREFIX = 'workshop:';
export const WORKSHOP_REALTIME_EVENT_NAME = 'workshop-event';

/**
 * The reactions a workshop offers until an admin says otherwise
 *
 * Note: Every one of them is celebrated by an animation of its own, see `workshopReactionAnimations`.
 */
export const DEFAULT_WORKSHOP_REACTIONS = [
    '👍',
    '❤️',
    '👏',
    '🔥',
    '💡',
    '😂',
    '</>',
    '✨',
    '🐍',
    '👀',
    '🎉',
    '🎆',
    '👩‍💻',
] as const;

export function getWorkshopSessionCookieName(workshopSlug: string): string {
    return `${WORKSHOP_SESSION_COOKIE_PREFIX}${workshopSlug}`;
}

export function getWorkshopRealtimeTopic(workshopSlug: string): string {
    return `${WORKSHOP_REALTIME_TOPIC_PREFIX}${workshopSlug}`;
}
zsh:1: no matches found: config/online*

exec
/bin/zsh -lc "sed -n '1,230p' businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx && cat lib/events/eventListing.test.ts && rg --files components/events lib/calendar tests/e2e | head -65" in /Users/hejny/work/aldaron
 succeeded in 0ms:
/**
 * @vitest-environment jsdom
 */

import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import type { EventOccurrence } from '@/lib/events/eventOccurrence';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The room as far as a waiting participant is concerned: nothing loaded yet and a connection to make
 *
 * Note: Every slug the room was opened with is remembered, because which workshop this waiting room would really
 *       connect to is exactly what picking another term has to change.
 */
const participantMocks = vi.hoisted(() => ({ openedWorkshopSlugs: [] as string[] }));

vi.mock('@/businesses/online-workshop/participant/useWorkshopParticipant', () => ({
    useWorkshopParticipant: (workshopSlug: string) => {
        participantMocks.openedWorkshopSlugs.push(workshopSlug);

        return {
            state: null,
            commentSort: 'recent',
            isCheckingConnection: false,
            isConnectionRequired: true,
            isRefreshing: false,
            isUsingCachedState: false,
            errorMessage: null,
            subscribeToReactions: () => () => undefined,
            newlyUnlockedContentBlockIds: new Set<string>(),
            connect: async () => true,
            changeFullname: async () => true,
            refresh: async () => true,
            changeCommentSort: () => undefined,
            submitComment: async () => true,
            upvoteComment: async () => undefined,
            voteOnPoll: async () => true,
            moderateComment: async () => true,
            moderateAuthor: async () => true,
            react: async () => undefined,
            saveFeedback: async () => true,
        };
    },
}));

import { OnlineWorkshopSelectedTermRoom } from '@/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom';

/**
 * The moment the terms below are placed against, which is a Thursday between two of them
 */
const CURRENT_TIME = '2026-09-10T12:00:00+02:00';

const PARTICIPANT_PATH = '/cs/online-workshop/participant';

function createOnlineWorkshopTerm(values: {
    readonly slug: string;
    readonly title: string;
    readonly startsAt: string;
    readonly endsAt: string;
}): EventOccurrence {
    return {
        id: `id-${values.slug}`,
        kind: 'workshop',
        event: DEFAULT_EVENT_DETAILS,
        slug: values.slug,
        title: values.title,
        description: `O čem je ${values.title}.`,
        startsAt: values.startsAt,
        endsAt: values.endsAt,
        isPublished: true,
    };
}

const NEAREST_UPCOMING_WORKSHOP = createOnlineWorkshopTerm({
    slug: 'online-workshop-ai-databaze-2026-09-11',
    title: 'AI a databáze',
    startsAt: '2026-09-11T10:00:00+02:00',
    endsAt: '2026-09-11T11:00:00+02:00',
});

const LATER_UPCOMING_WORKSHOP = createOnlineWorkshopTerm({
    slug: 'online-workshop-kontext-projektu-2026-09-14',
    title: 'Kontext projektu a agenti',
    startsAt: '2026-09-14T13:00:00+02:00',
    endsAt: '2026-09-14T14:00:00+02:00',
});

const PAST_WORKSHOP = createOnlineWorkshopTerm({
    slug: 'online-workshop-git-ai-2026-09-07',
    title: 'Git a AI',
    startsAt: '2026-09-07T13:00:00+02:00',
    endsAt: '2026-09-07T14:00:00+02:00',
});

/**
 * The workshop of yesterday evening, which ended well within the day before this room was built
 */
const FRESHLY_PAST_WORKSHOP = createOnlineWorkshopTerm({
    slug: 'online-workshop-testy-s-agenty-2026-09-09',
    title: 'Testy s agenty',
    startsAt: '2026-09-09T19:00:00+02:00',
    endsAt: '2026-09-09T20:00:00+02:00',
});

const PUBLISHED_WORKSHOPS: readonly EventOccurrence[] = [
    LATER_UPCOMING_WORKSHOP,
    NEAREST_UPCOMING_WORKSHOP,
    PAST_WORKSHOP,
];

function renderWaitingRoom(
    openedWorkshop: EventOccurrence,
    workshops: readonly EventOccurrence[] = PUBLISHED_WORKSHOPS,
) {
    return render(
        <OnlineWorkshopSelectedTermRoom
            openedWorkshop={openedWorkshop}
            workshops={workshops}
            currentTime={CURRENT_TIME}
            initialEmail="jana@example.com"
            initialFullname="Jana Nováková"
        />,
    );
}

function getOpenedWorkshopSlug(): string | undefined {
    return participantMocks.openedWorkshopSlugs.at(-1);
}

beforeEach(() => {
    participantMocks.openedWorkshopSlugs = [];
    window.history.replaceState({}, '', `${PARTICIPANT_PATH}?workshop=${LATER_UPCOMING_WORKSHOP.slug}`);
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('online workshop waiting room', () => {
    it('keeps paid events out of the connection picker when loading the shared follow-up schedule', () => {
        const paidWorkshop: EventOccurrence = {
            ...NEAREST_UPCOMING_WORKSHOP,
            id: 'paid-workshop',
            slug: 'paid-workshop',
            title: 'Placené školení',
            event: { ...DEFAULT_EVENT_DETAILS, type: 'ai-supervize-mini', priceCzk: 4900 },
        };
        renderWaitingRoom(NEAREST_UPCOMING_WORKSHOP, [...PUBLISHED_WORKSHOPS, paidWorkshop]);

        expect(screen.queryByRole('button', { name: /Placené školení/ })).toBeNull();
        expect(screen.getByRole('button', { name: new RegExp(LATER_UPCOMING_WORKSHOP.title) })).not.toBeNull();
    });

    it('offers every workshop which runs now or is still ahead, and keeps the finished ones one click away', () => {
        renderWaitingRoom(LATER_UPCOMING_WORKSHOP);

        expect(screen.getByRole('button', { name: new RegExp(NEAREST_UPCOMING_WORKSHOP.title) })).toBeDefined();
        expect(
            screen.getByRole('button', { name: new RegExp(LATER_UPCOMING_WORKSHOP.title) }).getAttribute('aria-pressed'),
        ).toBe('true');
        expect(screen.queryByRole('button', { name: new RegExp(PAST_WORKSHOP.title) })).toBeNull();

        fireEvent.click(screen.getByRole('button', { name: /Proběhlé workshopy \(1\)/ }));

        expect(screen.getByRole('button', { name: new RegExp(PAST_WORKSHOP.title) })).toBeDefined();
    });

    it('marks a term starting during the next seven days in the waiting-room picker', () => {
        renderWaitingRoom(LATER_UPCOMING_WORKSHOP);

        expect(
            screen.getByRole('button', { name: new RegExp(NEAREST_UPCOMING_WORKSHOP.title) }).textContent,
        ).toContain('Tento týden');
    });

    it('names the workshop which has only just been held in the open, rather than filing it into the history', () => {
        renderWaitingRoom(LATER_UPCOMING_WORKSHOP, [...PUBLISHED_WORKSHOPS, FRESHLY_PAST_WORKSHOP]);

        expect(screen.getByText('Právě proběhlo (1)')).toBeDefined();
        expect(
            screen.getByRole('button', { name: new RegExp(FRESHLY_PAST_WORKSHOP.title) }).textContent,
        ).toContain('Právě skončil, místnost zůstává otevřená');

        // Note: The history is still the one click it always was, and holds only the terms which are really behind us.
        expect(screen.getByRole('button', { name: /Proběhlé workshopy \(1\)/ })).toBeDefined();
        expect(screen.queryByRole('button', { name: new RegExp(PAST_WORKSHOP.title) })).toBeNull();
    });

    it('connects to the workshop a participant picked instead of the one their link opened', () => {
        renderWaitingRoom(LATER_UPCOMING_WORKSHOP);
        expect(getOpenedWorkshopSlug()).toBe(LATER_UPCOMING_WORKSHOP.slug);

        fireEvent.click(screen.getByRole('button', { name: new RegExp(NEAREST_UPCOMING_WORKSHOP.title) }));

        expect(getOpenedWorkshopSlug()).toBe(NEAREST_UPCOMING_WORKSHOP.slug);
        expect(screen.getByRole('heading', { name: NEAREST_UPCOMING_WORKSHOP.title })).toBeDefined();
        expect(window.location.search).toBe(`?workshop=${NEAREST_UPCOMING_WORKSHOP.slug}`);
    });

    it('keeps the name and the e-mail of a participant who changes their mind about the workshop', () => {
        renderWaitingRoom(LATER_UPCOMING_WORKSHOP);
        const emailInput = screen.getByLabelText('E-mail') as HTMLInputElement;
        fireEvent.change(emailInput, { target: { value: 'pavol@example.com' } });

        fireEvent.click(screen.getByRole('button', { name: new RegExp(NEAREST_UPCOMING_WORKSHOP.title) }));

        expect((screen.getByLabelText('E-mail') as HTMLInputElement).value).toBe('pavol@example.com');
        expect((screen.getByLabelText('Jméno a příjmení') as HTMLInputElement).value).toBe('Jana Nováková');
    });

    it('shows the finished workshop a participant really came for among the finished ones', () => {
        window.history.replaceState({}, '', `${PARTICIPANT_PATH}?workshop=${PAST_WORKSHOP.slug}`);
        renderWaitingRoom(PAST_WORKSHOP);

        expect(
            screen.getByRole('button', { name: new RegExp(PAST_WORKSHOP.title) }).getAttribute('aria-pressed'),
        ).toBe('true');
        expect(getOpenedWorkshopSlug()).toBe(PAST_WORKSHOP.slug);
    });

    it('asks nobody to choose when the online workshop has a single published term', () => {
        renderWaitingRoom(NEAREST_UPCOMING_WORKSHOP, [NEAREST_UPCOMING_WORKSHOP]);

        expect(screen.queryByText('Vyberte si workshop')).toBeNull();
        expect(screen.getByRole('heading', { name: NEAREST_UPCOMING_WORKSHOP.title })).toBeDefined();
    });
});
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import {
    createEventListings,
    groupEventListingsByDayKey,
    selectInitialCalendarMonthKey,
} from '@/lib/events/eventListing';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';
import { describe, expect, it } from 'vitest';

const PRAGUE_TIME_ZONE = 'Europe/Prague';
const CURRENT_TIME_MILLISECONDS = Date.parse('2026-09-10T19:30:00+02:00');
const PARTICIPANT_IDENTITY = { fullname: 'Jana Nováková', email: 'jana@example.com' };

const ONGOING_WORKSHOP: WorkshopSummary = {
    id: 'ongoing-workshop-id',
    kind: 'workshop',
    event: DEFAULT_EVENT_DETAILS,
    slug: 'production-ai-2026-09-10',
    title: 'Produkční kód s AI agenty',
    description: 'Online workshop s Pavolem Hejným a Jiřím Jahnem',
    startsAt: '2026-09-10T19:00:00+02:00',
    endsAt: '2026-09-10T20:30:00+02:00',
    isPublished: true,
};

const UPCOMING_WORKSHOP: WorkshopSummary = {
    ...ONGOING_WORKSHOP,
    id: 'upcoming-workshop-id',
    slug: 'production-ai-2026-10-08',
    startsAt: '2026-10-08T19:00:00+02:00',
    endsAt: '2026-10-08T20:30:00+02:00',
};

const UPCOMING_NEXT_WEEK_WORKSHOP: WorkshopSummary = {
    ...ONGOING_WORKSHOP,
    id: 'upcoming-next-week-workshop-id',
    slug: 'production-ai-2026-09-13',
    startsAt: '2026-09-13T19:00:00+02:00',
    endsAt: '2026-09-13T20:30:00+02:00',
};

const FRESHLY_PAST_WORKSHOP: WorkshopSummary = {
    ...ONGOING_WORKSHOP,
    id: 'freshly-past-workshop-id',
    slug: 'production-ai-2026-09-09',
    startsAt: '2026-09-09T19:00:00+02:00',
    endsAt: '2026-09-09T20:30:00+02:00',
};

const PAST_WORKSHOP: WorkshopSummary = {
    ...ONGOING_WORKSHOP,
    id: 'past-workshop-id',
    slug: 'production-ai-2026-07-10',
    startsAt: '2026-07-10T19:00:00+02:00',
    endsAt: '2026-07-10T20:30:00+02:00',
};

const COMMUNITY_ROOM: WorkshopSummary = {
    ...ONGOING_WORKSHOP,
    id: 'community-id',
    kind: 'community',
    event: null,
    slug: 'komunita',
    title: 'Komunita Promptbooku',
};

function createListings(workshops: readonly WorkshopSummary[]) {
    return createEventListings({
        workshops,
        participantIdentity: PARTICIPANT_IDENTITY,
        currentTimeMilliseconds: CURRENT_TIME_MILLISECONDS,
        timeZone: PRAGUE_TIME_ZONE,
    });
}

describe('event listings', () => {
    it('leads with the running term, its wrap-up, the next week, later terms, and the history', () => {
        const listings = createListings([
            PAST_WORKSHOP,
            UPCOMING_WORKSHOP,
            UPCOMING_NEXT_WEEK_WORKSHOP,
            FRESHLY_PAST_WORKSHOP,
            ONGOING_WORKSHOP,
        ]);

        expect(listings.map((listing) => listing.phase)).toEqual([
            'ongoing',
            'freshly-past',
            'upcoming-next-week',
            'upcoming',
            'past',
        ]);
        expect(listings.map((listing) => listing.dayKey)).toEqual([
            '2026-09-10',
            '2026-09-09',
            '2026-09-13',
            '2026-10-08',
            '2026-07-10',
        ]);
    });

    it('carries the identity of the member into every term which has a room', () => {
        const [listing] = createListings([ONGOING_WORKSHOP]);

        expect(listing?.link).toBe(
            '/cs/online-workshop/participant?workshop=production-ai-2026-09-10&email=jana%40example.com&fullname=Jana+Nov%C3%A1kov%C3%A1',
        );
    });

    it('leaves out a room which is no term of any event at all', () => {
        expect(createListings([COMMUNITY_ROOM, ONGOING_WORKSHOP]).map((listing) => listing.workshop.id)).toEqual([
            ONGOING_WORKSHOP.id,
        ]);
    });

    it('gathers the terms of one day under that day', () => {
        const secondTermOfTheSameDay = { ...ONGOING_WORKSHOP, id: 'second-id', slug: 'production-ai-2026-09-10-b' };
        const listingsByDayKey = groupEventListingsByDayKey(
            createListings([ONGOING_WORKSHOP, secondTermOfTheSameDay, UPCOMING_WORKSHOP]),
        );

        expect(listingsByDayKey.get('2026-09-10')).toHaveLength(2);
        expect(listingsByDayKey.get('2026-10-08')).toHaveLength(1);
        expect(listingsByDayKey.get('2026-09-11')).toBeUndefined();
    });

    it('opens the calendar on the month a member is in whenever a term is held in it', () => {
        expect(selectInitialCalendarMonthKey(createListings([ONGOING_WORKSHOP, UPCOMING_WORKSHOP]), '2026-09-10')).toBe(
            '2026-09',
        );
    });

    it('opens the calendar on the most relevant term rather than on an empty month', () => {
        expect(selectInitialCalendarMonthKey(createListings([PAST_WORKSHOP, UPCOMING_WORKSHOP]), '2026-09-10')).toBe(
            '2026-10',
        );
        expect(selectInitialCalendarMonthKey([], '2026-09-10')).toBe('2026-09');
    });
});
components/events/EventTermOptionList.tsx
components/events/EventTermOptionCard.tsx
tests/e2e/workshop-vercel-deployment.spec.ts
tests/e2e/workshop-subtitles.spec.ts
tests/e2e/participant-promotion.spec.ts
tests/e2e/public-pages.spec.ts
tests/e2e/globalTeardown.ts
tests/e2e/workshop-wrap-up-pdf.spec.ts
lib/calendar/calendarMonth.ts
lib/calendar/create-calendar-links.ts
lib/calendar/calendarMonth.test.ts
lib/calendar/czechRelativeDay.ts
lib/calendar/create-calendar-links.test.ts
lib/calendar/czechRelativeDay.test.ts
tests/e2e/admin-autosave.spec.ts
tests/e2e/room-theme.spec.ts
tests/e2e/recording-studio.spec.ts
tests/e2e/workshop-agents.spec.ts
tests/e2e/public-submissions.spec.ts
tests/e2e/admin-modals.spec.ts
tests/e2e/workshop-repository-range.spec.ts
tests/e2e/cookie-consent.spec.ts
tests/e2e/support/submissions.ts

exec
/bin/zsh -lc "sed -n '1,25p' changelog/_current-preversion.md && sed -n '88,115p' changelog/_current-preversion.md && sed -n '1,95p' businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx && cat next.config.* && cat .eslintrc*" in /Users/hejny/work/aldaron
 succeeded in 0ms:
# Current preversion

- Added the **Titulky** tab at `/admin/workshops?tab=subtitles` with private Czech, English and mixed-language tracks.
  Admins can fetch available YouTube captions, generate timed subtitles from an uploaded video/audio recording,
  import or edit SRT/WebVTT, and download either format. Long recordings are decoded in the browser and transcribed
  in bounded audio chunks using the existing private OpenAI key; generated drafts are reviewed before explicit creation.
  Existing tracks autosave through the shared editor, keep original-video timing and source information, and remain
  separate from participant responses. Added a private subtitle-table migration and documented setup and limitations.

- Workshop project previews on `/cs/komunita` and `/cs/online-workshop/participant` now share the first deployment's
  image, title, description and address. Missing metadata or broken images retain the application's identity instead
  of a generic GitHub preview; projects without a deployment keep the repository fallback. The participant preview
  opens the deployed app alongside the existing repository and deployment links, and loads independently of chat and
  commits. Late responses from previously selected rooms or projects are discarded; community cards still open the workshop.

- Redesigned the workshop wrap-up PDF for sharing and A4 printing with the Promptbook logo, locally embedded
  Inter/Outfit fonts, a light room palette, numbered sections and running headers/footers. It now includes a QR code
  and readable ad hoc short link back to the workshop room, a project preview with all deployment links, and a
  paginated vector Git graph using the same branch selection, commit bounds and lane layout as the materials panel.
  Export preparation remains authenticated and uses the existing material-access projection; private room data is
  excluded. External preview/history failures retain the recap and project links, and longer histories are labelled
  with a link to continue in the room. No document is stored or workshop database field added.

- Added `/admin/recording-studio` to the shared admin menu and dashboard. Multiple cameras, screen shares (with
  available shared audio), and optional separate microphones start and stop together, with per-track sizes,
  materials with clickable links, and any presentation, repository, and deployments. The download refreshes the
  existing authenticated room state, preserving publication, unlock, and membership rules and refusing workshops
  that have not ended or have been reopened. PDFs support Czech text and multiple pages and are generated in the
  browser on demand, with no new administration, database fields, or saved documents.

- Added a quiet display-settings switch to `/admin/workshops` and `/admin/community` for screen sharing. Artificial
  controls stay hidden by default: prepared chat comments and reactions, synthetic viewer counts, and artificial
  comment and poll-vote adjustments no longer appear among ordinary moderation controls. The switch is one compact
  settings icon away and keeps its intentional state in the shareable address as `artopts=on` or `artopts=off`; it
  changes no stored room data.

- Added a fifth shared time state for event terms: a published term that begins within the next seven rolling days is
  now marked `Tento týden`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
  picker of `/cs/online-workshop/participant?workshop=`, while `/admin/workshops` gives ongoing, freshly past,
  next-seven-day, later upcoming, and historical terms their own ordered categories. The shared future-term helper
  keeps these imminent terms eligible for the post-workshop recommendation too, so highlighting a near event never
  makes it disappear as the next workshop.

- Added reusable Book agents to workshop and community chat. The shared Agents tab in `/admin/workshops` and
  `/admin/community` edits personalities with Promptbook `BookEditor`, enables each agent per room, and shows recent
  activity. `LiteAgent` from `@promptbook/node` uses server-side `OPENAI_API_KEY` and each agent's source Book to reply
  to approved participant, artificial and agent comments. A durable queue, per-agent cooldowns, leases and a two-turn
  limit prevent duplicate replies and unbounded agent conversations. Replies use the existing chat, threads, links and
  moderation; administration and CSV exports distinguish all three origins and retain agent/run identifiers.
  Live workshops can share stream-tab audio or a presenter microphone from the Agents tab. Private rolling
  transcripts supply timely questions; stopping capture, ending the event or disabling an agent prevents stale
  questions. A restarted capture excludes previous sessions' speech, and publication locks the active session against
  a concurrent stop. Books, transcripts and execution records remain private. Added migrations, isolated PostgreSQL tests,
'use client';

import { createOnlineWorkshopTermNoteText } from '@/businesses/online-workshop/onlineWorkshopTerms';
import { EventTermOptionList } from '@/components/events/EventTermOptionList';
import type { EventOccurrence } from '@/lib/events/eventOccurrence';
import { groupWorkshopsByPhase } from '@/lib/workshops/workshopPhase';
import { ChevronDown, Clock, History, Sparkles } from 'lucide-react';
import { useId, useMemo, useState } from 'react';

/**
 * What the waiting room says while a participant is choosing which workshop to enter
 */
const ONLINE_WORKSHOP_ROOM_TERM_PICKER_COPY = {
    legend: 'Vyberte si workshop',
    description: 'Do místnosti kteréhokoli workshopu se dostanete stejným jménem a e-mailem.',
    noCurrentTermsMessage: 'Právě teď žádný workshop neběží a další termín zatím není vypsaný.',
    freshlyPastTermsLabel: 'Právě proběhlo',
    pastTermsLabel: 'Proběhlé workshopy',

    /**
     * Note: A workshop which has only just been held promises exactly what any finished one does, and says only that
     *       it was now — what a participant came back for is waiting behind the very same open door.
     */
    freshlyPastTermNoteText: 'Právě skončil, místnost zůstává otevřená',

    /**
     * Note: A room which is over is worth entering for what stayed in it, and that is all this promises. What a
     *       recording or a paid material asks for is decided by the room itself once a participant is inside.
     */
    pastTermNoteText: 'Místnost zůstává otevřená',
} as const;

type OnlineWorkshopRoomTermPickerProps = {
    readonly terms: readonly EventOccurrence[];
    readonly selectedTermSlug: string;
    readonly onSelectTerm: (term: EventOccurrence) => void;

    /**
     * Moment which decides what is running, what is ahead, and what is already over
     *
     * Note: That moment comes from the server which listed these terms, so the browser groups them exactly as the
     *       page it received was built, rather than regrouping them the instant it hydrates.
     */
    readonly currentTime: string;
};

/**
 * Every published term of the online workshop, offered to a participant who has not connected to one yet
 *
 * Note: A workshop which runs right now or is still ahead is what a participant is nearly always looking for, so those
 *       terms lead. The ones which are over stay reachable behind one click, because their rooms keep the chat and the
 *       materials of the workshop which was held in them.
 * Note: A workshop which has only just been held is named on its own, in the open, between the two of them. Somebody
 *       who was at it last night comes back for what stayed in its room, and asking them to unfold the whole history
 *       to find the workshop they have just left would hide it among the terms they are not looking for at all.
 */
export function OnlineWorkshopRoomTermPicker({
    terms,
    selectedTermSlug,
    onSelectTerm,
    currentTime,
}: OnlineWorkshopRoomTermPickerProps) {
    const pastTermsListId = useId();
    const termsByPhase = useMemo(
        () => groupWorkshopsByPhase(terms, Date.parse(currentTime)),
        [currentTime, terms],
    );
    const currentTerms = [
        ...termsByPhase.ongoing,
        ...termsByPhase['upcoming-next-week'],
        ...termsByPhase.upcoming,
    ];
    const freshlyPastTerms = termsByPhase['freshly-past'];
    const { past: pastTerms } = termsByPhase;
    const isSelectedTermPast = pastTerms.some((term) => term.slug === selectedTermSlug);

    // Note: A participant who came for a workshop which is already over meets the history open, so the term they came
    //       for is where they can see it. That is asked about the workshop the room was entered with rather than kept
    //       in step with the choice, because from then on it is the participant who opens and closes the history.
    const [isPastTermsShown, setIsPastTermsShown] = useState(isSelectedTermPast);

    // Note: Which term is chosen, which moment the terms are placed against, and how much room a card is given is one
    //       and the same question for every group this picker offers, so each of them is laid out by the very same
    //       description of a list and adds nothing but its own terms and its own note.
    const sharedTermOptionListProps = {
        selectedTermSlug,
        onSelectTerm,
        currentTime,
        isTopicShown: true,
        appearance: 'room',
        density: 'compact',
    } as const;

    return (
        <fieldset className="min-w-0">
/**
 * The end-to-end suite drives a development server, which compiles a route on its first visit and, by default,
 * disposes it again after a minute without a request. Disposing a route re-emits the shared server chunks, and a
 * request which arrives while they are being re-emitted fails inside the Next.js module registry with
 * `TypeError: Cannot read properties of undefined (reading 'call')`. Keeping every route the suite already compiled
 * means each of them is compiled exactly once, so no test can be hit by that re-emit.
 *
 * Note: An ordinary `npm run dev` keeps disposing routes it no longer serves, because a development session lasts far
 *       longer than a test run and has no reason to hold every route it ever opened in memory.
 */
const IS_COMPILED_ROUTE_KEPT_FOR_WHOLE_RUN = process.env.E2E_KEEP_COMPILED_ROUTES === 'true';

/**
 * Longer than any end-to-end run, so that no route is disposed while the suite is still using the server.
 */
const KEPT_COMPILED_ROUTE_MAXIMAL_INACTIVE_AGE_MS = 24 * 60 * 60 * 1000;

/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
    images: { unoptimized: true },
    serverExternalPackages: ['pg', '@promptbook/node'],
    outputFileTracingIncludes: {
        '/*': ['./migrations/**/*.sql'],
    },
    devIndicators: false,
    async redirects() {
        return [
            {
                source: '/pavol/cs',
                destination: '/cs/pavol',
                permanent: true,
            },
            {
                source: '/pavol/en',
                destination: '/en/pavol',
                permanent: true,
            },
            {
                source: '/jirka',
                destination: 'https://www.linkedin.com/in/jirkajahn/',
                permanent: true,
            },
            {
                source: '/jiri',
                destination: 'https://www.linkedin.com/in/jirkajahn/',
                permanent: true,
            },
        ];
    },
    allowedDevOrigins: [
        '127.0.0.1',
        '*.macaly.dev',
        '*.macaly.app',
        '*.macaly-app.com',
        '*.macaly-user-data.dev',
    ],
    webpack: (config, { dev, isServer }) => {
        // Note: [📖] Allow books to be imported:
        config.module.rules.push({
            test: /\.book$/,
            use: 'raw-loader',
        });

        // Allow YAML files to be imported
        config.module.rules.push({
            test: /\.ya?ml$/,
            use: 'raw-loader',
        });

        // TODO: [🧵]

        return config;
    },
};

if (IS_COMPILED_ROUTE_KEPT_FOR_WHOLE_RUN) {
    // Note: Next.js merges this over its own defaults, so the buffer of recently accessed routes keeps its default.
    nextConfig.onDemandEntries = { maxInactiveAge: KEPT_COMPILED_ROUTE_MAXIMAL_INACTIVE_AGE_MS };
}

module.exports = nextConfig;
{
    "extends": "next/core-web-vitals",
    "parser": "@babel/eslint-parser",
    "parserOptions": {
        "requireConfigFile": false,
        "babelOptions": {
            "presets": ["next/babel"]
        }
    },
    "rules": {
        "react/no-unescaped-entities": "off" // <- Note: this rule is disabled because Cline often uses unescaped entities in JSX (despite of all the instructions) and its annoying to fix it all the time manually    }
    }
}

apply patch
patch: completed
/Users/hejny/work/aldaron/AGENTS.md
/Users/hejny/work/aldaron/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
/Users/hejny/work/aldaron/businesses/workshop-admin/WorkshopSelectorCardList.tsx
/Users/hejny/work/aldaron/changelog/_current-preversion.md
/Users/hejny/work/aldaron/components/events/EventTermOptionCard.tsx
/Users/hejny/work/aldaron/components/workshops/workshopPhaseAppearance.ts
/Users/hejny/work/aldaron/components/workshops/workshopRoomTheme.css
/Users/hejny/work/aldaron/lib/workshops/workshopPhase.ts
/Users/hejny/work/aldaron/tailwind.config.ts
diff --git a/AGENTS.md b/AGENTS.md
index 8557778d230f0715e09a335fd303bf86015c32dd..d000c5fd0c0fe752490b216922648f5e0d80e798
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -21,8 +21,9 @@
   but all use one registration form. `/cs/online-workshop/dekujeme` is the
   full-load conversion page; `/participant` is the live room. Its waiting room
   offers every published term as the same term cards the landing page registers
-  with: running and upcoming ones first, with a special `Tento týden` badge for a
-  term beginning within the next seven rolling days, then the ones which ended
+  with: running and upcoming ones first, with `Dneska` and `Zítra` badges for terms
+  beginning today or tomorrow in Prague and `Tento týden` for the remaining terms
+  beginning within the next seven rolling days, then the ones which ended
   within the last day, and the older finished ones behind a disclosure.
   Picking one changes the room being connected to and the `workshop` parameter,
   without losing the name and e-mail already typed.
@@ -91,8 +92,9 @@
   a replay badge. Card data includes no feedback. Where a term stands in
   time is decided
   once, in `lib/workshops/workshopPhase.ts`, as one of
-  five phases: ongoing, freshly past while it ended within the last
-  `FRESHLY_PAST_WORKSHOP_HOURS`, upcoming within the next seven rolling days,
+  seven phases: ongoing, freshly past while it ended within the last
+  `FRESHLY_PAST_WORKSHOP_HOURS`, upcoming today or tomorrow by Prague calendar date,
+  other upcoming within the next seven rolling days,
   other upcoming, and past. Every list, badge, and calendar colour reads that one
   answer, and everything which opens after a workshop — the wrap-up, the feedback,
   the recording — treats freshly past as over. A term with a
@@ -121,7 +123,7 @@
   nothing about registrations at all. The registration block opens the exact
   filtered `/admin/contacts` list and its shared CSV, vCard, and Book exports;
   it never creates a second contact table or serializer in workshop administration.
-  Its term picker gives ongoing, freshly past, next-seven-day, and later upcoming
+  Its term picker gives ongoing, freshly past, today, tomorrow, next-seven-day, and later upcoming
   terms their own categories, because a term which has only just been held is
   still being wrapped up and one beginning soon needs preparation; only past terms
   stay behind its history disclosure. Its unobtrusive display-settings control
diff --git a/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx b/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
index 7f931fba445fad57265cd021c65bace471ba8e0b..e64332721f4035a7a4eb12cab7db6c3ae00a0e38
--- a/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
@@ -3,7 +3,7 @@
 import { createOnlineWorkshopTermNoteText } from '@/businesses/online-workshop/onlineWorkshopTerms';
 import { EventTermOptionList } from '@/components/events/EventTermOptionList';
 import type { EventOccurrence } from '@/lib/events/eventOccurrence';
-import { groupWorkshopsByPhase } from '@/lib/workshops/workshopPhase';
+import { groupWorkshopsByPhase, isWorkshopPhaseUpcoming, WORKSHOP_PHASE_VALUES } from '@/lib/workshops/workshopPhase';
 import { ChevronDown, Clock, History, Sparkles } from 'lucide-react';
 import { useId, useMemo, useState } from 'react';
 
@@ -65,11 +65,8 @@
         () => groupWorkshopsByPhase(terms, Date.parse(currentTime)),
         [currentTime, terms],
     );
-    const currentTerms = [
-        ...termsByPhase.ongoing,
-        ...termsByPhase['upcoming-next-week'],
-        ...termsByPhase.upcoming,
-    ];
+    const currentTerms = WORKSHOP_PHASE_VALUES.filter((phase) => phase === 'ongoing' || isWorkshopPhaseUpcoming(phase))
+        .flatMap((phase) => termsByPhase[phase]);
     const freshlyPastTerms = termsByPhase['freshly-past'];
     const { past: pastTerms } = termsByPhase;
     const isSelectedTermPast = pastTerms.some((term) => term.slug === selectedTermSlug);
diff --git a/businesses/workshop-admin/WorkshopSelectorCardList.tsx b/businesses/workshop-admin/WorkshopSelectorCardList.tsx
index 5b7e331aceddc897620dae58f248e2bc983896f5..aa2123738032474da72d18ca79338f95ec457fdc
--- a/businesses/workshop-admin/WorkshopSelectorCardList.tsx
+++ b/businesses/workshop-admin/WorkshopSelectorCardList.tsx
@@ -86,7 +86,7 @@
 }
 
 /**
- * Offers every occurrence as a card in the five shared time categories. An administrator gets the workshop that is
+ * Offers every occurrence as a card in the shared time categories. An administrator gets the workshop that is
  * running first, the one they are wrapping up next, then the terms to prepare soon and later, while the old archive
  * remains available on demand.
  */
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index df5b4612ecafacc477bfe8dbb97475db021af62b..83d8b0f693509e0926ab81b0ce15225503d91f9c
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,5 +1,9 @@
 # Current preversion
 
+- Added `Dneska` and `Zítra` event badges ahead of `Tento týden`, based on Prague calendar dates. Shared cards,
+  calendars, landing-page term choices, and the admin picker use the same phases and theme-aware colours. Terms
+  still switch to `Probíhá` at their start and remain eligible for waiting-room choices and follow-up recommendations.
+
 - Added the **Titulky** tab at `/admin/workshops?tab=subtitles` with private Czech, English and mixed-language tracks.
   Admins can fetch available YouTube captions, generate timed subtitles from an uploaded video/audio recording,
   import or edit SRT/WebVTT, and download either format. Long recordings are decoded in the browser and transcribed
diff --git a/components/events/EventTermOptionCard.tsx b/components/events/EventTermOptionCard.tsx
index ce65036825b967fb19601515127f7890cf8ff0bc..d6f100083c022187d95746b95f83f57e8d2dd676
--- a/components/events/EventTermOptionCard.tsx
+++ b/components/events/EventTermOptionCard.tsx
@@ -4,7 +4,7 @@
 import { formatEventPrice } from '@/lib/events/eventPrice';
 import { cn } from '@/lib/utils';
 import { formatCzechWorkshopRelativeDay, formatCzechWorkshopTimeRange } from '@/lib/workshops/workshopDate';
-import { getWorkshopPhase } from '@/lib/workshops/workshopPhase';
+import { getWorkshopPhase, isWorkshopPhaseUpcoming } from '@/lib/workshops/workshopPhase';
 import type { LucideIcon } from 'lucide-react';
 
 /**
@@ -175,7 +175,7 @@
     const appearanceClassNames = EVENT_TERM_OPTION_CARD_APPEARANCES[appearance];
     const densityClassNames = EVENT_TERM_OPTION_CARD_DENSITIES[density];
     const phase = getWorkshopPhase(occurrence, Date.parse(currentTime));
-    const isWorkshopStartingWithinNextWeek = phase === 'upcoming-next-week';
+    const isWorkshopStartingSoon = isWorkshopPhaseUpcoming(phase) && phase !== 'upcoming';
 
     return (
         <button
@@ -199,7 +199,7 @@
                     {formatCzechWorkshopRelativeDay(occurrence.startsAt, currentTime)} ·{' '}
                     {formatCzechWorkshopTimeRange(occurrence.startsAt, occurrence.endsAt)}
                 </span>
-                {isWorkshopStartingWithinNextWeek && (
+                {isWorkshopStartingSoon && (
                     <WorkshopPhaseBadge
                         phase={phase}
                         tone={appearance}
diff --git a/components/workshops/workshopPhaseAppearance.ts b/components/workshops/workshopPhaseAppearance.ts
index 397626aeeca074142ce787ebea7da16101b8f4ee..81ed54d491ff2b28c62b9de95d4df343cb3676a5
--- a/components/workshops/workshopPhaseAppearance.ts
+++ b/components/workshops/workshopPhaseAppearance.ts
@@ -34,8 +34,8 @@
  * The one description of how every phase looks, wherever a term is listed
  *
  * Note: A list of cards and a calendar of the same terms say the very same thing with the very same colour - green
- *       runs right now, amber has only just been held, violet starts within a week, cyan is further ahead, and grey is
- *       history - because both of them read their colours here instead of choosing their own.
+ *       runs right now, amber has only just been held, orange starts today, blue tomorrow, violet within a week, cyan
+ *       further ahead, and grey is history - because both read their colours here instead of choosing their own.
  * Note: These colours live beside the components which wear them rather than among the rules of the application,
  *       because only the directories of the components are read for the styles the application is built with.
  */
@@ -61,6 +61,24 @@
         calendarDayClassName: 'border-room-warning/40 bg-room-warning/10 text-room-warning',
         markClassName: 'bg-room-warning',
     },
+    'upcoming-today': {
+        label: 'Dneska',
+        badgeClassNameByTone: {
+            light: 'bg-orange-100 text-orange-800',
+            room: 'bg-room-upcoming-today/15 text-room-upcoming-today ring-1 ring-inset ring-room-upcoming-today/40',
+        },
+        calendarDayClassName: 'border-room-upcoming-today/40 bg-room-upcoming-today/10 text-room-upcoming-today',
+        markClassName: 'bg-room-upcoming-today',
+    },
+    'upcoming-tomorrow': {
+        label: 'Zítra',
+        badgeClassNameByTone: {
+            light: 'bg-blue-100 text-blue-800',
+            room: 'bg-room-upcoming-tomorrow/15 text-room-upcoming-tomorrow ring-1 ring-inset ring-room-upcoming-tomorrow/40',
+        },
+        calendarDayClassName: 'border-room-upcoming-tomorrow/40 bg-room-upcoming-tomorrow/10 text-room-upcoming-tomorrow',
+        markClassName: 'bg-room-upcoming-tomorrow',
+    },
     // Note: This stays distinct from the ordinary upcoming cyan so the special badge is useful even when a reader
     //       cannot infer a date at a glance.
     'upcoming-next-week': {
diff --git a/components/workshops/workshopRoomTheme.css b/components/workshops/workshopRoomTheme.css
index 3f5f35d8211be102c381f56b40f2d3e79a68be31..47c55c58a0db06612e949785c95ffc205584b310
--- a/components/workshops/workshopRoomTheme.css
+++ b/components/workshops/workshopRoomTheme.css
@@ -19,6 +19,8 @@
     --room-success: 167 243 208;
     --room-warning: 253 230 138;
     --room-danger: 253 164 175;
+    --room-upcoming-today: 253 186 116;
+    --room-upcoming-tomorrow: 147 197 253;
     --room-upcoming: 196 181 253;
     --room-graph-pink: 244 114 182;
     --room-color-scheme: dark;
@@ -44,6 +46,8 @@
     --room-success: 6 95 70;
     --room-warning: 146 64 14;
     --room-danger: 159 18 57;
+    --room-upcoming-today: 154 52 18;
+    --room-upcoming-tomorrow: 30 64 175;
     --room-upcoming: 109 40 217;
     --room-graph-pink: 190 24 93;
     --room-color-scheme: light;
diff --git a/lib/workshops/workshopPhase.ts b/lib/workshops/workshopPhase.ts
index 0ac9e8a2847c45355d50625381df66584f696536..ac1ea734d5ae6bdf4de3076aeeb2ce399051b59e
--- a/lib/workshops/workshopPhase.ts
+++ b/lib/workshops/workshopPhase.ts
@@ -1,3 +1,5 @@
+import { createCalendarDayKey } from '@/lib/calendar/calendarMonth';
+import { getRelativeCalendarDay } from '@/lib/calendar/czechRelativeDay';
 import {
     DEFAULT_WORKSHOP_DURATION_MINUTES,
     FRESHLY_PAST_WORKSHOP_HOURS,
@@ -6,6 +8,7 @@
 
 const MILLISECONDS_PER_MINUTE = 60 * 1000;
 const MILLISECONDS_PER_HOUR = 60 * MILLISECONDS_PER_MINUTE;
+const WORKSHOP_TIME_ZONE = 'Europe/Prague';
 
 /**
  * Where one occurrence currently stands in time, named from the most pressing phase to the least
@@ -15,10 +18,19 @@
  *       nothing to do with what they do with a workshop of last spring.
  * Note: An occurrence which starts during the next seven days is also a phase of its own, so a schedule can call
  *       attention to the terms somebody still has time to plan for without each surface calculating that window again.
+ *       Today and tomorrow take precedence within that window, using Prague calendar days rather than elapsed hours.
  * Note: This order is what ranks the phases wherever they are listed, coloured, or grouped, so a phase is placed among
  *       the others only here.
  */
-export const WORKSHOP_PHASE_VALUES = ['ongoing', 'freshly-past', 'upcoming-next-week', 'upcoming', 'past'] as const;
+export const WORKSHOP_PHASE_VALUES = [
+    'ongoing',
+    'freshly-past',
+    'upcoming-today',
+    'upcoming-tomorrow',
+    'upcoming-next-week',
+    'upcoming',
+    'past',
+] as const;
 
 export type WorkshopPhase = (typeof WORKSHOP_PHASE_VALUES)[number];
 
@@ -41,7 +53,12 @@
  *       badge.
  */
 export function isWorkshopPhaseUpcoming(phase: WorkshopPhase): boolean {
-    return phase === 'upcoming-next-week' || phase === 'upcoming';
+    return (
+        phase === 'upcoming-today' ||
+        phase === 'upcoming-tomorrow' ||
+        phase === 'upcoming-next-week' ||
+        phase === 'upcoming'
+    );
 }
 
 /**
@@ -127,6 +144,17 @@
 ): WorkshopPhase {
     const startsAtMilliseconds = Date.parse(occurrence.startsAt);
     if (isWorkshopStartingWithinNextWeek(startsAtMilliseconds, currentTimeMilliseconds)) {
+        const relativeDay = getRelativeCalendarDay(
+            createCalendarDayKey(occurrence.startsAt, WORKSHOP_TIME_ZONE),
+            createCalendarDayKey(new Date(currentTimeMilliseconds).toISOString(), WORKSHOP_TIME_ZONE),
+        );
+        if (relativeDay === 'today') {
+            return 'upcoming-today';
+        }
+        if (relativeDay === 'tomorrow') {
+            return 'upcoming-tomorrow';
+        }
+
         return 'upcoming-next-week';
     }
 
@@ -207,6 +235,8 @@
     const workshopsByPhase: Record<WorkshopPhase, TWorkshop[]> = {
         ongoing: [],
         'freshly-past': [],
+        'upcoming-today': [],
+        'upcoming-tomorrow': [],
         'upcoming-next-week': [],
         upcoming: [],
         past: [],
diff --git a/tailwind.config.ts b/tailwind.config.ts
index 8019f41f1539feedb45d402a70dd8ffff9aca8ad..db919851e4a1a55643569375d67dc665ab75a01b
--- a/tailwind.config.ts
+++ b/tailwind.config.ts
@@ -51,6 +51,8 @@
                     success: 'rgb(var(--room-success) / <alpha-value>)',
                     warning: 'rgb(var(--room-warning) / <alpha-value>)',
                     danger: 'rgb(var(--room-danger) / <alpha-value>)',
+                    'upcoming-today': 'rgb(var(--room-upcoming-today) / <alpha-value>)',
+                    'upcoming-tomorrow': 'rgb(var(--room-upcoming-tomorrow) / <alpha-value>)',
                     upcoming: 'rgb(var(--room-upcoming) / <alpha-value>)',
                 },
                 background: 'hsl(var(--background))',

diff --git a/AGENTS.md b/AGENTS.md
index 8557778d230f0715e09a335fd303bf86015c32dd..d000c5fd0c0fe752490b216922648f5e0d80e798
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -21,8 +21,9 @@
   but all use one registration form. `/cs/online-workshop/dekujeme` is the
   full-load conversion page; `/participant` is the live room. Its waiting room
   offers every published term as the same term cards the landing page registers
-  with: running and upcoming ones first, with a special `Tento týden` badge for a
-  term beginning within the next seven rolling days, then the ones which ended
+  with: running and upcoming ones first, with `Dneska` and `Zítra` badges for terms
+  beginning today or tomorrow in Prague and `Tento týden` for the remaining terms
+  beginning within the next seven rolling days, then the ones which ended
   within the last day, and the older finished ones behind a disclosure.
   Picking one changes the room being connected to and the `workshop` parameter,
   without losing the name and e-mail already typed.
@@ -91,8 +92,9 @@
   a replay badge. Card data includes no feedback. Where a term stands in
   time is decided
   once, in `lib/workshops/workshopPhase.ts`, as one of
-  five phases: ongoing, freshly past while it ended within the last
-  `FRESHLY_PAST_WORKSHOP_HOURS`, upcoming within the next seven rolling days,
+  seven phases: ongoing, freshly past while it ended within the last
+  `FRESHLY_PAST_WORKSHOP_HOURS`, upcoming today or tomorrow by Prague calendar date,
+  other upcoming within the next seven rolling days,
   other upcoming, and past. Every list, badge, and calendar colour reads that one
   answer, and everything which opens after a workshop — the wrap-up, the feedback,
   the recording — treats freshly past as over. A term with a
@@ -121,7 +123,7 @@
   nothing about registrations at all. The registration block opens the exact
   filtered `/admin/contacts` list and its shared CSV, vCard, and Book exports;
   it never creates a second contact table or serializer in workshop administration.
-  Its term picker gives ongoing, freshly past, next-seven-day, and later upcoming
+  Its term picker gives ongoing, freshly past, today, tomorrow, next-seven-day, and later upcoming
   terms their own categories, because a term which has only just been held is
   still being wrapped up and one beginning soon needs preparation; only past terms
   stay behind its history disclosure. Its unobtrusive display-settings control
diff --git a/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx b/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
index 7f931fba445fad57265cd021c65bace471ba8e0b..e64332721f4035a7a4eb12cab7db6c3ae00a0e38
--- a/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
@@ -3,7 +3,7 @@
 import { createOnlineWorkshopTermNoteText } from '@/businesses/online-workshop/onlineWorkshopTerms';
 import { EventTermOptionList } from '@/components/events/EventTermOptionList';
 import type { EventOccurrence } from '@/lib/events/eventOccurrence';
-import { groupWorkshopsByPhase } from '@/lib/workshops/workshopPhase';
+import { groupWorkshopsByPhase, isWorkshopPhaseUpcoming, WORKSHOP_PHASE_VALUES } from '@/lib/workshops/workshopPhase';
 import { ChevronDown, Clock, History, Sparkles } from 'lucide-react';
 import { useId, useMemo, useState } from 'react';
 
@@ -65,11 +65,8 @@
         () => groupWorkshopsByPhase(terms, Date.parse(currentTime)),
         [currentTime, terms],
     );
-    const currentTerms = [
-        ...termsByPhase.ongoing,
-        ...termsByPhase['upcoming-next-week'],
-        ...termsByPhase.upcoming,
-    ];
+    const currentTerms = WORKSHOP_PHASE_VALUES.filter((phase) => phase === 'ongoing' || isWorkshopPhaseUpcoming(phase))
+        .flatMap((phase) => termsByPhase[phase]);
     const freshlyPastTerms = termsByPhase['freshly-past'];
     const { past: pastTerms } = termsByPhase;
     const isSelectedTermPast = pastTerms.some((term) => term.slug === selectedTermSlug);
diff --git a/businesses/workshop-admin/WorkshopSelectorCardList.tsx b/businesses/workshop-admin/WorkshopSelectorCardList.tsx
index 5b7e331aceddc897620dae58f248e2bc983896f5..aa2123738032474da72d18ca79338f95ec457fdc
--- a/businesses/workshop-admin/WorkshopSelectorCardList.tsx
+++ b/businesses/workshop-admin/WorkshopSelectorCardList.tsx
@@ -86,7 +86,7 @@
 }
 
 /**
- * Offers every occurrence as a card in the five shared time categories. An administrator gets the workshop that is
+ * Offers every occurrence as a card in the shared time categories. An administrator gets the workshop that is
  * running first, the one they are wrapping up next, then the terms to prepare soon and later, while the old archive
  * remains available on demand.
  */
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index df5b4612ecafacc477bfe8dbb97475db021af62b..83d8b0f693509e0926ab81b0ce15225503d91f9c
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,5 +1,9 @@
 # Current preversion
 
+- Added `Dneska` and `Zítra` event badges ahead of `Tento týden`, based on Prague calendar dates. Shared cards,
+  calendars, landing-page term choices, and the admin picker use the same phases and theme-aware colours. Terms
+  still switch to `Probíhá` at their start and remain eligible for waiting-room choices and follow-up recommendations.
+
 - Added the **Titulky** tab at `/admin/workshops?tab=subtitles` with private Czech, English and mixed-language tracks.
   Admins can fetch available YouTube captions, generate timed subtitles from an uploaded video/audio recording,
   import or edit SRT/WebVTT, and download either format. Long recordings are decoded in the browser and transcribed
diff --git a/components/events/EventTermOptionCard.tsx b/components/events/EventTermOptionCard.tsx
index ce65036825b967fb19601515127f7890cf8ff0bc..d6f100083c022187d95746b95f83f57e8d2dd676
--- a/components/events/EventTermOptionCard.tsx
+++ b/components/events/EventTermOptionCard.tsx
@@ -4,7 +4,7 @@
 import { formatEventPrice } from '@/lib/events/eventPrice';
 import { cn } from '@/lib/utils';
 import { formatCzechWorkshopRelativeDay, formatCzechWorkshopTimeRange } from '@/lib/workshops/workshopDate';
-import { getWorkshopPhase } from '@/lib/workshops/workshopPhase';
+import { getWorkshopPhase, isWorkshopPhaseUpcoming } from '@/lib/workshops/workshopPhase';
 import type { LucideIcon } from 'lucide-react';
 
 /**
@@ -175,7 +175,7 @@
     const appearanceClassNames = EVENT_TERM_OPTION_CARD_APPEARANCES[appearance];
     const densityClassNames = EVENT_TERM_OPTION_CARD_DENSITIES[density];
     const phase = getWorkshopPhase(occurrence, Date.parse(currentTime));
-    const isWorkshopStartingWithinNextWeek = phase === 'upcoming-next-week';
+    const isWorkshopStartingSoon = isWorkshopPhaseUpcoming(phase) && phase !== 'upcoming';
 
     return (
         <button
@@ -199,7 +199,7 @@
                     {formatCzechWorkshopRelativeDay(occurrence.startsAt, currentTime)} ·{' '}
                     {formatCzechWorkshopTimeRange(occurrence.startsAt, occurrence.endsAt)}
                 </span>
-                {isWorkshopStartingWithinNextWeek && (
+                {isWorkshopStartingSoon && (
                     <WorkshopPhaseBadge
                         phase={phase}
                         tone={appearance}
diff --git a/components/workshops/workshopPhaseAppearance.ts b/components/workshops/workshopPhaseAppearance.ts
index 397626aeeca074142ce787ebea7da16101b8f4ee..81ed54d491ff2b28c62b9de95d4df343cb3676a5
--- a/components/workshops/workshopPhaseAppearance.ts
+++ b/components/workshops/workshopPhaseAppearance.ts
@@ -34,8 +34,8 @@
  * The one description of how every phase looks, wherever a term is listed
  *
  * Note: A list of cards and a calendar of the same terms say the very same thing with the very same colour - green
- *       runs right now, amber has only just been held, violet starts within a week, cyan is further ahead, and grey is
- *       history - because both of them read their colours here instead of choosing their own.
+ *       runs right now, amber has only just been held, orange starts today, blue tomorrow, violet within a week, cyan
+ *       further ahead, and grey is history - because both read their colours here instead of choosing their own.
  * Note: These colours live beside the components which wear them rather than among the rules of the application,
  *       because only the directories of the components are read for the styles the application is built with.
  */
@@ -61,6 +61,24 @@
         calendarDayClassName: 'border-room-warning/40 bg-room-warning/10 text-room-warning',
         markClassName: 'bg-room-warning',
     },
+    'upcoming-today': {
+        label: 'Dneska',
+        badgeClassNameByTone: {
+            light: 'bg-orange-100 text-orange-800',
+            room: 'bg-room-upcoming-today/15 text-room-upcoming-today ring-1 ring-inset ring-room-upcoming-today/40',
+        },
+        calendarDayClassName: 'border-room-upcoming-today/40 bg-room-upcoming-today/10 text-room-upcoming-today',
+        markClassName: 'bg-room-upcoming-today',
+    },
+    'upcoming-tomorrow': {
+        label: 'Zítra',
+        badgeClassNameByTone: {
+            light: 'bg-blue-100 text-blue-800',
+            room: 'bg-room-upcoming-tomorrow/15 text-room-upcoming-tomorrow ring-1 ring-inset ring-room-upcoming-tomorrow/40',
+        },
+        calendarDayClassName: 'border-room-upcoming-tomorrow/40 bg-room-upcoming-tomorrow/10 text-room-upcoming-tomorrow',
+        markClassName: 'bg-room-upcoming-tomorrow',
+    },
     // Note: This stays distinct from the ordinary upcoming cyan so the special badge is useful even when a reader
     //       cannot infer a date at a glance.
     'upcoming-next-week': {
diff --git a/components/workshops/workshopRoomTheme.css b/components/workshops/workshopRoomTheme.css
index 3f5f35d8211be102c381f56b40f2d3e79a68be31..47c55c58a0db06612e949785c95ffc205584b310
--- a/components/workshops/workshopRoomTheme.css
+++ b/components/workshops/workshopRoomTheme.css
@@ -19,6 +19,8 @@
     --room-success: 167 243 208;
     --room-warning: 253 230 138;
     --room-danger: 253 164 175;
+    --room-upcoming-today: 253 186 116;
+    --room-upcoming-tomorrow: 147 197 253;
     --room-upcoming: 196 181 253;
     --room-graph-pink: 244 114 182;
     --room-color-scheme: dark;
@@ -44,6 +46,8 @@
     --room-success: 6 95 70;
     --room-warning: 146 64 14;
     --room-danger: 159 18 57;
+    --room-upcoming-today: 154 52 18;
+    --room-upcoming-tomorrow: 30 64 175;
     --room-upcoming: 109 40 217;
     --room-graph-pink: 190 24 93;
     --room-color-scheme: light;
diff --git a/lib/workshops/workshopPhase.ts b/lib/workshops/workshopPhase.ts
index 0ac9e8a2847c45355d50625381df66584f696536..ac1ea734d5ae6bdf4de3076aeeb2ce399051b59e
--- a/lib/workshops/workshopPhase.ts
+++ b/lib/workshops/workshopPhase.ts
@@ -1,3 +1,5 @@
+import { createCalendarDayKey } from '@/lib/calendar/calendarMonth';
+import { getRelativeCalendarDay } from '@/lib/calendar/czechRelativeDay';
 import {
     DEFAULT_WORKSHOP_DURATION_MINUTES,
     FRESHLY_PAST_WORKSHOP_HOURS,
@@ -6,6 +8,7 @@
 
 const MILLISECONDS_PER_MINUTE = 60 * 1000;
 const MILLISECONDS_PER_HOUR = 60 * MILLISECONDS_PER_MINUTE;
+const WORKSHOP_TIME_ZONE = 'Europe/Prague';
 
 /**
  * Where one occurrence currently stands in time, named from the most pressing phase to the least
@@ -15,10 +18,19 @@
  *       nothing to do with what they do with a workshop of last spring.
  * Note: An occurrence which starts during the next seven days is also a phase of its own, so a schedule can call
  *       attention to the terms somebody still has time to plan for without each surface calculating that window again.
+ *       Today and tomorrow take precedence within that window, using Prague calendar days rather than elapsed hours.
  * Note: This order is what ranks the phases wherever they are listed, coloured, or grouped, so a phase is placed among
  *       the others only here.
  */
-export const WORKSHOP_PHASE_VALUES = ['ongoing', 'freshly-past', 'upcoming-next-week', 'upcoming', 'past'] as const;
+export const WORKSHOP_PHASE_VALUES = [
+    'ongoing',
+    'freshly-past',
+    'upcoming-today',
+    'upcoming-tomorrow',
+    'upcoming-next-week',
+    'upcoming',
+    'past',
+] as const;
 
 export type WorkshopPhase = (typeof WORKSHOP_PHASE_VALUES)[number];
 
@@ -41,7 +53,12 @@
  *       badge.
  */
 export function isWorkshopPhaseUpcoming(phase: WorkshopPhase): boolean {
-    return phase === 'upcoming-next-week' || phase === 'upcoming';
+    return (
+        phase === 'upcoming-today' ||
+        phase === 'upcoming-tomorrow' ||
+        phase === 'upcoming-next-week' ||
+        phase === 'upcoming'
+    );
 }
 
 /**
@@ -127,6 +144,17 @@
 ): WorkshopPhase {
     const startsAtMilliseconds = Date.parse(occurrence.startsAt);
     if (isWorkshopStartingWithinNextWeek(startsAtMilliseconds, currentTimeMilliseconds)) {
+        const relativeDay = getRelativeCalendarDay(
+            createCalendarDayKey(occurrence.startsAt, WORKSHOP_TIME_ZONE),
+            createCalendarDayKey(new Date(currentTimeMilliseconds).toISOString(), WORKSHOP_TIME_ZONE),
+        );
+        if (relativeDay === 'today') {
+            return 'upcoming-today';
+        }
+        if (relativeDay === 'tomorrow') {
+            return 'upcoming-tomorrow';
+        }
+
         return 'upcoming-next-week';
     }
 
@@ -207,6 +235,8 @@
     const workshopsByPhase: Record<WorkshopPhase, TWorkshop[]> = {
         ongoing: [],
         'freshly-past': [],
+        'upcoming-today': [],
+        'upcoming-tomorrow': [],
         'upcoming-next-week': [],
         upcoming: [],
         past: [],
diff --git a/tailwind.config.ts b/tailwind.config.ts
index 8019f41f1539feedb45d402a70dd8ffff9aca8ad..db919851e4a1a55643569375d67dc665ab75a01b
--- a/tailwind.config.ts
+++ b/tailwind.config.ts
@@ -51,6 +51,8 @@
                     success: 'rgb(var(--room-success) / <alpha-value>)',
                     warning: 'rgb(var(--room-warning) / <alpha-value>)',
                     danger: 'rgb(var(--room-danger) / <alpha-value>)',
+                    'upcoming-today': 'rgb(var(--room-upcoming-today) / <alpha-value>)',
+                    'upcoming-tomorrow': 'rgb(var(--room-upcoming-tomorrow) / <alpha-value>)',
                     upcoming: 'rgb(var(--room-upcoming) / <alpha-value>)',
                 },
                 background: 'hsl(var(--background))',

apply patch
patch: completed
/Users/hejny/work/aldaron/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
/Users/hejny/work/aldaron/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
/Users/hejny/work/aldaron/components/workshops/WorkshopLinksPanel.test.tsx
/Users/hejny/work/aldaron/lib/workshops/workshopPhase.test.ts
diff --git a/AGENTS.md b/AGENTS.md
index 8557778d230f0715e09a335fd303bf86015c32dd..d000c5fd0c0fe752490b216922648f5e0d80e798
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -21,8 +21,9 @@
   but all use one registration form. `/cs/online-workshop/dekujeme` is the
   full-load conversion page; `/participant` is the live room. Its waiting room
   offers every published term as the same term cards the landing page registers
-  with: running and upcoming ones first, with a special `Tento týden` badge for a
-  term beginning within the next seven rolling days, then the ones which ended
+  with: running and upcoming ones first, with `Dneska` and `Zítra` badges for terms
+  beginning today or tomorrow in Prague and `Tento týden` for the remaining terms
+  beginning within the next seven rolling days, then the ones which ended
   within the last day, and the older finished ones behind a disclosure.
   Picking one changes the room being connected to and the `workshop` parameter,
   without losing the name and e-mail already typed.
@@ -91,8 +92,9 @@
   a replay badge. Card data includes no feedback. Where a term stands in
   time is decided
   once, in `lib/workshops/workshopPhase.ts`, as one of
-  five phases: ongoing, freshly past while it ended within the last
-  `FRESHLY_PAST_WORKSHOP_HOURS`, upcoming within the next seven rolling days,
+  seven phases: ongoing, freshly past while it ended within the last
+  `FRESHLY_PAST_WORKSHOP_HOURS`, upcoming today or tomorrow by Prague calendar date,
+  other upcoming within the next seven rolling days,
   other upcoming, and past. Every list, badge, and calendar colour reads that one
   answer, and everything which opens after a workshop — the wrap-up, the feedback,
   the recording — treats freshly past as over. A term with a
@@ -121,7 +123,7 @@
   nothing about registrations at all. The registration block opens the exact
   filtered `/admin/contacts` list and its shared CSV, vCard, and Book exports;
   it never creates a second contact table or serializer in workshop administration.
-  Its term picker gives ongoing, freshly past, next-seven-day, and later upcoming
+  Its term picker gives ongoing, freshly past, today, tomorrow, next-seven-day, and later upcoming
   terms their own categories, because a term which has only just been held is
   still being wrapped up and one beginning soon needs preparation; only past terms
   stay behind its history disclosure. Its unobtrusive display-settings control
diff --git a/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx b/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
index 7f931fba445fad57265cd021c65bace471ba8e0b..e64332721f4035a7a4eb12cab7db6c3ae00a0e38
--- a/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
@@ -3,7 +3,7 @@
 import { createOnlineWorkshopTermNoteText } from '@/businesses/online-workshop/onlineWorkshopTerms';
 import { EventTermOptionList } from '@/components/events/EventTermOptionList';
 import type { EventOccurrence } from '@/lib/events/eventOccurrence';
-import { groupWorkshopsByPhase } from '@/lib/workshops/workshopPhase';
+import { groupWorkshopsByPhase, isWorkshopPhaseUpcoming, WORKSHOP_PHASE_VALUES } from '@/lib/workshops/workshopPhase';
 import { ChevronDown, Clock, History, Sparkles } from 'lucide-react';
 import { useId, useMemo, useState } from 'react';
 
@@ -65,11 +65,8 @@
         () => groupWorkshopsByPhase(terms, Date.parse(currentTime)),
         [currentTime, terms],
     );
-    const currentTerms = [
-        ...termsByPhase.ongoing,
-        ...termsByPhase['upcoming-next-week'],
-        ...termsByPhase.upcoming,
-    ];
+    const currentTerms = WORKSHOP_PHASE_VALUES.filter((phase) => phase === 'ongoing' || isWorkshopPhaseUpcoming(phase))
+        .flatMap((phase) => termsByPhase[phase]);
     const freshlyPastTerms = termsByPhase['freshly-past'];
     const { past: pastTerms } = termsByPhase;
     const isSelectedTermPast = pastTerms.some((term) => term.slug === selectedTermSlug);
diff --git a/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
index 57b8fcd8dd0773a357f9328322d8d2259cbebe4c..737f320838372e58dc3deb108ce2be6a53a267aa
--- a/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
@@ -79,6 +79,13 @@
     endsAt: '2026-09-11T11:00:00+02:00',
 });
 
+const TODAY_WORKSHOP = createOnlineWorkshopTerm({
+    slug: 'online-workshop-dnes-2026-09-10',
+    title: 'Dnešní workshop',
+    startsAt: '2026-09-10T19:00:00+02:00',
+    endsAt: '2026-09-10T20:00:00+02:00',
+});
+
 const LATER_UPCOMING_WORKSHOP = createOnlineWorkshopTerm({
     slug: 'online-workshop-kontext-projektu-2026-09-14',
     title: 'Kontext projektu a agenti',
@@ -167,12 +174,23 @@
         expect(screen.getByRole('button', { name: new RegExp(PAST_WORKSHOP.title) })).toBeDefined();
     });
 
-    it('marks a term starting during the next seven days in the waiting-room picker', () => {
-        renderWaitingRoom(LATER_UPCOMING_WORKSHOP);
+    it('keeps today and tomorrow selectable with their own badges before the other next-week terms', () => {
+        renderWaitingRoom(LATER_UPCOMING_WORKSHOP, [...PUBLISHED_WORKSHOPS, TODAY_WORKSHOP]);
 
         expect(
+            screen.getByRole('button', { name: new RegExp(TODAY_WORKSHOP.title) }).textContent,
+        ).toContain('Dneska');
+        expect(
             screen.getByRole('button', { name: new RegExp(NEAREST_UPCOMING_WORKSHOP.title) }).textContent,
+        ).toContain('Zítra');
+        expect(
+            screen.getByRole('button', { name: new RegExp(LATER_UPCOMING_WORKSHOP.title) }).textContent,
         ).toContain('Tento týden');
+
+        fireEvent.click(screen.getByRole('button', { name: new RegExp(TODAY_WORKSHOP.title) }));
+
+        expect(getOpenedWorkshopSlug()).toBe(TODAY_WORKSHOP.slug);
+        expect(window.location.search).toBe(`?workshop=${TODAY_WORKSHOP.slug}`);
     });
 
     it('names the workshop which has only just been held in the open, rather than filing it into the history', () => {
diff --git a/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx b/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
index 0532d6441fc320af25f7f81a71ff4a257b382efd..3bd0a65778edd8c7191ae34a712e8c3153a2bb0c
--- a/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
+++ b/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
@@ -43,6 +43,22 @@
     startsAt: '2026-08-24T19:00:00+02:00',
     endsAt: '2026-08-24T20:30:00+02:00',
 };
+const UPCOMING_TODAY_WORKSHOP: WorkshopAdminSummary = {
+    ...UPCOMING_WORKSHOP,
+    id: 'upcoming-today-workshop-id',
+    slug: 'produkcni-kod-2026-08-21-evening',
+    title: 'Večerní workshop dnes',
+    startsAt: '2026-08-21T21:00:00+02:00',
+    endsAt: '2026-08-21T22:00:00+02:00',
+};
+const UPCOMING_TOMORROW_WORKSHOP: WorkshopAdminSummary = {
+    ...UPCOMING_WORKSHOP,
+    id: 'upcoming-tomorrow-workshop-id',
+    slug: 'produkcni-kod-2026-08-22',
+    title: 'Workshop zítra',
+    startsAt: '2026-08-22T19:00:00+02:00',
+    endsAt: '2026-08-22T20:30:00+02:00',
+};
 const FRESHLY_PAST_WORKSHOP: WorkshopAdminSummary = {
     id: 'freshly-past-workshop-id',
     kind: 'workshop',
@@ -128,22 +144,30 @@
             FRESHLY_PAST_WORKSHOP,
             UPCOMING_WORKSHOP,
             UPCOMING_NEXT_WEEK_WORKSHOP,
+            UPCOMING_TOMORROW_WORKSHOP,
+            UPCOMING_TODAY_WORKSHOP,
             ONGOING_WORKSHOP,
         ]);
 
         expect(screen.getByRole('heading', { name: 'Probíhá (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Právě proběhlo (1)' })).not.toBeNull();
+        expect(screen.getByRole('heading', { name: 'Dneska (1)' })).not.toBeNull();
+        expect(screen.getByRole('heading', { name: 'Zítra (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Tento týden (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Nadchází (1)' })).not.toBeNull();
         expect(getWorkshopCards().map((workshopCard) => workshopCard.textContent)).toEqual([
             expect.stringContaining(ONGOING_WORKSHOP.title),
             expect.stringContaining(FRESHLY_PAST_WORKSHOP.title),
+            expect.stringContaining(UPCOMING_TODAY_WORKSHOP.title),
+            expect.stringContaining(UPCOMING_TOMORROW_WORKSHOP.title),
             expect.stringContaining(UPCOMING_NEXT_WEEK_WORKSHOP.title),
             expect.stringContaining(UPCOMING_WORKSHOP.title),
         ]);
 
         expect(getWorkshopCards()[1].textContent).toContain('Právě proběhlo');
-        expect(getWorkshopCards()[2].textContent).toContain('Tento týden');
+        expect(getWorkshopCards()[2].textContent).toContain('Dneska');
+        expect(getWorkshopCards()[3].textContent).toContain('Zítra');
+        expect(getWorkshopCards()[4].textContent).toContain('Tento týden');
         expect(screen.getByRole('button', { name: 'Historie (1)' }).getAttribute('aria-expanded')).toBe('false');
     });
 
diff --git a/businesses/workshop-admin/WorkshopSelectorCardList.tsx b/businesses/workshop-admin/WorkshopSelectorCardList.tsx
index 5b7e331aceddc897620dae58f248e2bc983896f5..aa2123738032474da72d18ca79338f95ec457fdc
--- a/businesses/workshop-admin/WorkshopSelectorCardList.tsx
+++ b/businesses/workshop-admin/WorkshopSelectorCardList.tsx
@@ -86,7 +86,7 @@
 }
 
 /**
- * Offers every occurrence as a card in the five shared time categories. An administrator gets the workshop that is
+ * Offers every occurrence as a card in the shared time categories. An administrator gets the workshop that is
  * running first, the one they are wrapping up next, then the terms to prepare soon and later, while the old archive
  * remains available on demand.
  */
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index df5b4612ecafacc477bfe8dbb97475db021af62b..83d8b0f693509e0926ab81b0ce15225503d91f9c
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,5 +1,9 @@
 # Current preversion
 
+- Added `Dneska` and `Zítra` event badges ahead of `Tento týden`, based on Prague calendar dates. Shared cards,
+  calendars, landing-page term choices, and the admin picker use the same phases and theme-aware colours. Terms
+  still switch to `Probíhá` at their start and remain eligible for waiting-room choices and follow-up recommendations.
+
 - Added the **Titulky** tab at `/admin/workshops?tab=subtitles` with private Czech, English and mixed-language tracks.
   Admins can fetch available YouTube captions, generate timed subtitles from an uploaded video/audio recording,
   import or edit SRT/WebVTT, and download either format. Long recordings are decoded in the browser and transcribed
diff --git a/components/events/EventTermOptionCard.tsx b/components/events/EventTermOptionCard.tsx
index ce65036825b967fb19601515127f7890cf8ff0bc..d6f100083c022187d95746b95f83f57e8d2dd676
--- a/components/events/EventTermOptionCard.tsx
+++ b/components/events/EventTermOptionCard.tsx
@@ -4,7 +4,7 @@
 import { formatEventPrice } from '@/lib/events/eventPrice';
 import { cn } from '@/lib/utils';
 import { formatCzechWorkshopRelativeDay, formatCzechWorkshopTimeRange } from '@/lib/workshops/workshopDate';
-import { getWorkshopPhase } from '@/lib/workshops/workshopPhase';
+import { getWorkshopPhase, isWorkshopPhaseUpcoming } from '@/lib/workshops/workshopPhase';
 import type { LucideIcon } from 'lucide-react';
 
 /**
@@ -175,7 +175,7 @@
     const appearanceClassNames = EVENT_TERM_OPTION_CARD_APPEARANCES[appearance];
     const densityClassNames = EVENT_TERM_OPTION_CARD_DENSITIES[density];
     const phase = getWorkshopPhase(occurrence, Date.parse(currentTime));
-    const isWorkshopStartingWithinNextWeek = phase === 'upcoming-next-week';
+    const isWorkshopStartingSoon = isWorkshopPhaseUpcoming(phase) && phase !== 'upcoming';
 
     return (
         <button
@@ -199,7 +199,7 @@
                     {formatCzechWorkshopRelativeDay(occurrence.startsAt, currentTime)} ·{' '}
                     {formatCzechWorkshopTimeRange(occurrence.startsAt, occurrence.endsAt)}
                 </span>
-                {isWorkshopStartingWithinNextWeek && (
+                {isWorkshopStartingSoon && (
                     <WorkshopPhaseBadge
                         phase={phase}
                         tone={appearance}
diff --git a/components/workshops/WorkshopLinksPanel.test.tsx b/components/workshops/WorkshopLinksPanel.test.tsx
index 0d3b760e290f4cf5027ca2364269abf8adacd1aa..9db3d59e76e3e4dff76d653ddb58c86d8ca06e70
--- a/components/workshops/WorkshopLinksPanel.test.tsx
+++ b/components/workshops/WorkshopLinksPanel.test.tsx
@@ -54,6 +54,15 @@
     endsAt: '2026-09-11T20:30:00+02:00',
 };
 
+const TODAY_WORKSHOP: WorkshopSummary = {
+    ...ONGOING_WORKSHOP,
+    id: 'today-workshop-id',
+    slug: 'production-ai-2026-09-10-evening',
+    title: 'Večerní workshop dnes',
+    startsAt: '2026-09-10T21:00:00+02:00',
+    endsAt: '2026-09-10T22:00:00+02:00',
+};
+
 const THIS_WEEK_WORKSHOP: WorkshopSummary = {
     ...ONGOING_WORKSHOP,
     id: 'this-week-workshop-id',
@@ -213,17 +222,27 @@
         expect(pastCard?.textContent).toContain('Proběhlo');
     });
 
-    it('gives a term in the next seven days its own badge and calendar colour', () => {
-        renderWorkshopLinksPanel([ONGOING_WORKSHOP, TOMORROW_WORKSHOP, UPCOMING_WORKSHOP]);
+    it('distinguishes today, tomorrow, and the rest of the next seven days on cards and the calendar', () => {
+        renderWorkshopLinksPanel([THIS_WEEK_WORKSHOP, TOMORROW_WORKSHOP, TODAY_WORKSHOP, UPCOMING_WORKSHOP]);
 
+        expect(findCalendarDay('2026-09-10').className).toContain(
+            getWorkshopPhaseAppearance('upcoming-today').calendarDayClassName,
+        );
         expect(findCalendarDay('2026-09-11').className).toContain(
+            getWorkshopPhaseAppearance('upcoming-tomorrow').calendarDayClassName,
+        );
+        expect(findCalendarDay('2026-09-12').className).toContain(
             getWorkshopPhaseAppearance('upcoming-next-week').calendarDayClassName,
         );
+        expect(screen.getAllByText('Dneska')).toHaveLength(2);
+        expect(screen.getAllByText('Zítra')).toHaveLength(2);
         expect(screen.getAllByText('Tento týden')).toHaveLength(2);
 
         showCardsView();
 
-        const [, upcomingNextWeekCard, upcomingCard] = findTermLinks();
+        const [todayCard, tomorrowCard, upcomingNextWeekCard, upcomingCard] = findTermLinks();
+        expect(todayCard?.textContent).toContain('Dneska');
+        expect(tomorrowCard?.textContent).toContain('Zítra');
         expect(upcomingNextWeekCard?.textContent).toContain('Tento týden');
         expect(upcomingCard?.textContent).toContain('Nadchází');
     });
diff --git a/components/workshops/workshopPhaseAppearance.ts b/components/workshops/workshopPhaseAppearance.ts
index 397626aeeca074142ce787ebea7da16101b8f4ee..81ed54d491ff2b28c62b9de95d4df343cb3676a5
--- a/components/workshops/workshopPhaseAppearance.ts
+++ b/components/workshops/workshopPhaseAppearance.ts
@@ -34,8 +34,8 @@
  * The one description of how every phase looks, wherever a term is listed
  *
  * Note: A list of cards and a calendar of the same terms say the very same thing with the very same colour - green
- *       runs right now, amber has only just been held, violet starts within a week, cyan is further ahead, and grey is
- *       history - because both of them read their colours here instead of choosing their own.
+ *       runs right now, amber has only just been held, orange starts today, blue tomorrow, violet within a week, cyan
+ *       further ahead, and grey is history - because both read their colours here instead of choosing their own.
  * Note: These colours live beside the components which wear them rather than among the rules of the application,
  *       because only the directories of the components are read for the styles the application is built with.
  */
@@ -61,6 +61,24 @@
         calendarDayClassName: 'border-room-warning/40 bg-room-warning/10 text-room-warning',
         markClassName: 'bg-room-warning',
     },
+    'upcoming-today': {
+        label: 'Dneska',
+        badgeClassNameByTone: {
+            light: 'bg-orange-100 text-orange-800',
+            room: 'bg-room-upcoming-today/15 text-room-upcoming-today ring-1 ring-inset ring-room-upcoming-today/40',
+        },
+        calendarDayClassName: 'border-room-upcoming-today/40 bg-room-upcoming-today/10 text-room-upcoming-today',
+        markClassName: 'bg-room-upcoming-today',
+    },
+    'upcoming-tomorrow': {
+        label: 'Zítra',
+        badgeClassNameByTone: {
+            light: 'bg-blue-100 text-blue-800',
+            room: 'bg-room-upcoming-tomorrow/15 text-room-upcoming-tomorrow ring-1 ring-inset ring-room-upcoming-tomorrow/40',
+        },
+        calendarDayClassName: 'border-room-upcoming-tomorrow/40 bg-room-upcoming-tomorrow/10 text-room-upcoming-tomorrow',
+        markClassName: 'bg-room-upcoming-tomorrow',
+    },
     // Note: This stays distinct from the ordinary upcoming cyan so the special badge is useful even when a reader
     //       cannot infer a date at a glance.
     'upcoming-next-week': {
diff --git a/components/workshops/workshopRoomTheme.css b/components/workshops/workshopRoomTheme.css
index 3f5f35d8211be102c381f56b40f2d3e79a68be31..47c55c58a0db06612e949785c95ffc205584b310
--- a/components/workshops/workshopRoomTheme.css
+++ b/components/workshops/workshopRoomTheme.css
@@ -19,6 +19,8 @@
     --room-success: 167 243 208;
     --room-warning: 253 230 138;
     --room-danger: 253 164 175;
+    --room-upcoming-today: 253 186 116;
+    --room-upcoming-tomorrow: 147 197 253;
     --room-upcoming: 196 181 253;
     --room-graph-pink: 244 114 182;
     --room-color-scheme: dark;
@@ -44,6 +46,8 @@
     --room-success: 6 95 70;
     --room-warning: 146 64 14;
     --room-danger: 159 18 57;
+    --room-upcoming-today: 154 52 18;
+    --room-upcoming-tomorrow: 30 64 175;
     --room-upcoming: 109 40 217;
     --room-graph-pink: 190 24 93;
     --room-color-scheme: light;
diff --git a/lib/workshops/workshopPhase.test.ts b/lib/workshops/workshopPhase.test.ts
index 746ba57a99a0364e632cefb24b1412a8ea7d26df..8b34cd8e7b7fe7caa4f15b8cf9d229c3c3b9bd14
--- a/lib/workshops/workshopPhase.test.ts
+++ b/lib/workshops/workshopPhase.test.ts
@@ -41,6 +41,14 @@
     startsAt: '2026-08-24T19:00:00+02:00',
     endsAt: '2026-08-24T20:30:00+02:00',
 };
+const UPCOMING_TODAY_WORKSHOP: WorkshopOccurrenceTiming = {
+    startsAt: '2026-08-21T21:00:00+02:00',
+    endsAt: '2026-08-21T22:00:00+02:00',
+};
+const UPCOMING_TOMORROW_WORKSHOP: WorkshopOccurrenceTiming = {
+    startsAt: '2026-08-22T19:00:00+02:00',
+    endsAt: '2026-08-22T20:00:00+02:00',
+};
 const LATER_UPCOMING_WORKSHOP: WorkshopOccurrenceTiming = {
     startsAt: '2026-10-10T19:00:00+02:00',
     endsAt: '2026-10-10T20:30:00+02:00',
@@ -54,11 +62,24 @@
     it('places an occurrence against the given moment', () => {
         expect(getWorkshopPhase(UPCOMING_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming');
         expect(getWorkshopPhase(UPCOMING_NEXT_WEEK_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming-next-week');
+        expect(getWorkshopPhase(UPCOMING_TODAY_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming-today');
+        expect(getWorkshopPhase(UPCOMING_TOMORROW_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming-tomorrow');
         expect(getWorkshopPhase(ONGOING_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('ongoing');
         expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('freshly-past');
         expect(getWorkshopPhase(PAST_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('past');
     });
 
+    it.each([
+        ['2026-08-21T21:59:59Z', '2026-08-21T22:30:00Z', 'upcoming-tomorrow'],
+        ['2026-08-21T22:00:00Z', '2026-08-21T22:30:00Z', 'upcoming-today'],
+        ['2026-12-31T22:30:00Z', '2026-12-31T23:30:00Z', 'upcoming-tomorrow'],
+        ['2026-03-28T00:15:00+01:00', '2026-03-29T23:30:00+02:00', 'upcoming-tomorrow'],
+        ['2026-03-28T23:30:00+01:00', '2026-03-30T00:15:00+02:00', 'upcoming-next-week'],
+        ['2026-10-25T00:15:00+02:00', '2026-10-25T23:30:00+01:00', 'upcoming-today'],
+    ])('uses Prague calendar days from %s to classify %s as %s', (currentTime, startsAt, expectedPhase) => {
+        expect(getWorkshopPhase({ startsAt, endsAt: null }, Date.parse(currentTime))).toBe(expectedPhase);
+    });
+
     it('keeps an occurrence freshly past for a whole day after the end recorded for it', () => {
         expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, Date.parse('2026-08-20T20:30:01+02:00'))).toBe('freshly-past');
         expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('freshly-past');
@@ -69,6 +90,8 @@
         expect(isWorkshopPhasePast('freshly-past')).toBe(true);
         expect(isWorkshopPhasePast('past')).toBe(true);
         expect(isWorkshopPhasePast('ongoing')).toBe(false);
+        expect(isWorkshopPhasePast('upcoming-today')).toBe(false);
+        expect(isWorkshopPhasePast('upcoming-tomorrow')).toBe(false);
         expect(isWorkshopPhasePast('upcoming-next-week')).toBe(false);
         expect(isWorkshopPhasePast('upcoming')).toBe(false);
     });
@@ -87,7 +110,9 @@
         expect(getWorkshopPhase(workshopAfterNextWeekBoundary, CURRENT_TIME_MILLISECONDS)).toBe('upcoming');
     });
 
-    it('counts both kinds of future term among the workshops which are still ahead', () => {
+    it('counts every kind of future term among the workshops which are still ahead', () => {
+        expect(isWorkshopPhaseUpcoming('upcoming-today')).toBe(true);
+        expect(isWorkshopPhaseUpcoming('upcoming-tomorrow')).toBe(true);
         expect(isWorkshopPhaseUpcoming('upcoming-next-week')).toBe(true);
         expect(isWorkshopPhaseUpcoming('upcoming')).toBe(true);
         expect(isWorkshopPhaseUpcoming('ongoing')).toBe(false);
@@ -106,7 +131,7 @@
         expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('ongoing');
         expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-12-24T18:00:00+01:00'))).toBe('ongoing');
         expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-08-21T18:59:59+02:00'))).toBe(
-            'upcoming-next-week',
+            'upcoming-today',
         );
     });
 
@@ -134,7 +159,7 @@
     it('keeps an occurrence ongoing until its very end and imminent until its very start', () => {
         expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T19:00:00+02:00'))).toBe('ongoing');
         expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T18:59:59+02:00'))).toBe(
-            'upcoming-next-week',
+            'upcoming-today',
         );
         expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('freshly-past');
     });
@@ -150,6 +175,8 @@
                 FRESHLY_PAST_WORKSHOP,
                 UPCOMING_WORKSHOP,
                 UPCOMING_NEXT_WEEK_WORKSHOP,
+                UPCOMING_TOMORROW_WORKSHOP,
+                UPCOMING_TODAY_WORKSHOP,
                 ONGOING_WORKSHOP,
             ],
             CURRENT_TIME_MILLISECONDS,
@@ -158,6 +185,8 @@
         expect(sortedWorkshops).toEqual([
             ONGOING_WORKSHOP,
             FRESHLY_PAST_WORKSHOP,
+            UPCOMING_TODAY_WORKSHOP,
+            UPCOMING_TOMORROW_WORKSHOP,
             UPCOMING_NEXT_WEEK_WORKSHOP,
             UPCOMING_WORKSHOP,
             LATER_UPCOMING_WORKSHOP,
@@ -183,6 +212,8 @@
                 FRESHLY_PAST_WORKSHOP,
                 UPCOMING_WORKSHOP,
                 UPCOMING_NEXT_WEEK_WORKSHOP,
+                UPCOMING_TOMORROW_WORKSHOP,
+                UPCOMING_TODAY_WORKSHOP,
                 ONGOING_WORKSHOP,
             ],
             CURRENT_TIME_MILLISECONDS,
@@ -191,6 +222,8 @@
         expect(workshopsByPhase).toEqual({
             ongoing: [ONGOING_WORKSHOP],
             'freshly-past': [FRESHLY_PAST_WORKSHOP],
+            'upcoming-today': [UPCOMING_TODAY_WORKSHOP],
+            'upcoming-tomorrow': [UPCOMING_TOMORROW_WORKSHOP],
             'upcoming-next-week': [UPCOMING_NEXT_WEEK_WORKSHOP],
             upcoming: [UPCOMING_WORKSHOP, LATER_UPCOMING_WORKSHOP],
             past: [PAST_WORKSHOP, OLDER_PAST_WORKSHOP],
@@ -199,6 +232,11 @@
 
     it('lets the most pressing phase speak for a group of occurrences', () => {
         expect(getMostProminentWorkshopPhase(['past', 'upcoming', 'ongoing'])).toBe('ongoing');
+        expect(getMostProminentWorkshopPhase(['upcoming-today', 'ongoing'])).toBe('ongoing');
+        expect(getMostProminentWorkshopPhase(['upcoming-tomorrow', 'upcoming-today', 'upcoming-next-week'])).toBe(
+            'upcoming-today',
+        );
+        expect(getMostProminentWorkshopPhase(['upcoming-next-week', 'upcoming-tomorrow'])).toBe('upcoming-tomorrow');
         expect(getMostProminentWorkshopPhase(['past', 'upcoming', 'upcoming-next-week'])).toBe('upcoming-next-week');
         expect(getMostProminentWorkshopPhase(['past', 'freshly-past', 'upcoming'])).toBe('freshly-past');
         expect(getMostProminentWorkshopPhase(['past', 'freshly-past'])).toBe('freshly-past');
diff --git a/lib/workshops/workshopPhase.ts b/lib/workshops/workshopPhase.ts
index 0ac9e8a2847c45355d50625381df66584f696536..ac1ea734d5ae6bdf4de3076aeeb2ce399051b59e
--- a/lib/workshops/workshopPhase.ts
+++ b/lib/workshops/workshopPhase.ts
@@ -1,3 +1,5 @@
+import { createCalendarDayKey } from '@/lib/calendar/calendarMonth';
+import { getRelativeCalendarDay } from '@/lib/calendar/czechRelativeDay';
 import {
     DEFAULT_WORKSHOP_DURATION_MINUTES,
     FRESHLY_PAST_WORKSHOP_HOURS,
@@ -6,6 +8,7 @@
 
 const MILLISECONDS_PER_MINUTE = 60 * 1000;
 const MILLISECONDS_PER_HOUR = 60 * MILLISECONDS_PER_MINUTE;
+const WORKSHOP_TIME_ZONE = 'Europe/Prague';
 
 /**
  * Where one occurrence currently stands in time, named from the most pressing phase to the least
@@ -15,10 +18,19 @@
  *       nothing to do with what they do with a workshop of last spring.
  * Note: An occurrence which starts during the next seven days is also a phase of its own, so a schedule can call
  *       attention to the terms somebody still has time to plan for without each surface calculating that window again.
+ *       Today and tomorrow take precedence within that window, using Prague calendar days rather than elapsed hours.
  * Note: This order is what ranks the phases wherever they are listed, coloured, or grouped, so a phase is placed among
  *       the others only here.
  */
-export const WORKSHOP_PHASE_VALUES = ['ongoing', 'freshly-past', 'upcoming-next-week', 'upcoming', 'past'] as const;
+export const WORKSHOP_PHASE_VALUES = [
+    'ongoing',
+    'freshly-past',
+    'upcoming-today',
+    'upcoming-tomorrow',
+    'upcoming-next-week',
+    'upcoming',
+    'past',
+] as const;
 
 export type WorkshopPhase = (typeof WORKSHOP_PHASE_VALUES)[number];
 
@@ -41,7 +53,12 @@
  *       badge.
  */
 export function isWorkshopPhaseUpcoming(phase: WorkshopPhase): boolean {
-    return phase === 'upcoming-next-week' || phase === 'upcoming';
+    return (
+        phase === 'upcoming-today' ||
+        phase === 'upcoming-tomorrow' ||
+        phase === 'upcoming-next-week' ||
+        phase === 'upcoming'
+    );
 }
 
 /**
@@ -127,6 +144,17 @@
 ): WorkshopPhase {
     const startsAtMilliseconds = Date.parse(occurrence.startsAt);
     if (isWorkshopStartingWithinNextWeek(startsAtMilliseconds, currentTimeMilliseconds)) {
+        const relativeDay = getRelativeCalendarDay(
+            createCalendarDayKey(occurrence.startsAt, WORKSHOP_TIME_ZONE),
+            createCalendarDayKey(new Date(currentTimeMilliseconds).toISOString(), WORKSHOP_TIME_ZONE),
+        );
+        if (relativeDay === 'today') {
+            return 'upcoming-today';
+        }
+        if (relativeDay === 'tomorrow') {
+            return 'upcoming-tomorrow';
+        }
+
         return 'upcoming-next-week';
     }
 
@@ -207,6 +235,8 @@
     const workshopsByPhase: Record<WorkshopPhase, TWorkshop[]> = {
         ongoing: [],
         'freshly-past': [],
+        'upcoming-today': [],
+        'upcoming-tomorrow': [],
         'upcoming-next-week': [],
         upcoming: [],
         past: [],
diff --git a/tailwind.config.ts b/tailwind.config.ts
index 8019f41f1539feedb45d402a70dd8ffff9aca8ad..db919851e4a1a55643569375d67dc665ab75a01b
--- a/tailwind.config.ts
+++ b/tailwind.config.ts
@@ -51,6 +51,8 @@
                     success: 'rgb(var(--room-success) / <alpha-value>)',
                     warning: 'rgb(var(--room-warning) / <alpha-value>)',
                     danger: 'rgb(var(--room-danger) / <alpha-value>)',
+                    'upcoming-today': 'rgb(var(--room-upcoming-today) / <alpha-value>)',
+                    'upcoming-tomorrow': 'rgb(var(--room-upcoming-tomorrow) / <alpha-value>)',
                     upcoming: 'rgb(var(--room-upcoming) / <alpha-value>)',
                 },
                 background: 'hsl(var(--background))',

diff --git a/AGENTS.md b/AGENTS.md
index 8557778d230f0715e09a335fd303bf86015c32dd..d000c5fd0c0fe752490b216922648f5e0d80e798
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -21,8 +21,9 @@
   but all use one registration form. `/cs/online-workshop/dekujeme` is the
   full-load conversion page; `/participant` is the live room. Its waiting room
   offers every published term as the same term cards the landing page registers
-  with: running and upcoming ones first, with a special `Tento týden` badge for a
-  term beginning within the next seven rolling days, then the ones which ended
+  with: running and upcoming ones first, with `Dneska` and `Zítra` badges for terms
+  beginning today or tomorrow in Prague and `Tento týden` for the remaining terms
+  beginning within the next seven rolling days, then the ones which ended
   within the last day, and the older finished ones behind a disclosure.
   Picking one changes the room being connected to and the `workshop` parameter,
   without losing the name and e-mail already typed.
@@ -91,8 +92,9 @@
   a replay badge. Card data includes no feedback. Where a term stands in
   time is decided
   once, in `lib/workshops/workshopPhase.ts`, as one of
-  five phases: ongoing, freshly past while it ended within the last
-  `FRESHLY_PAST_WORKSHOP_HOURS`, upcoming within the next seven rolling days,
+  seven phases: ongoing, freshly past while it ended within the last
+  `FRESHLY_PAST_WORKSHOP_HOURS`, upcoming today or tomorrow by Prague calendar date,
+  other upcoming within the next seven rolling days,
   other upcoming, and past. Every list, badge, and calendar colour reads that one
   answer, and everything which opens after a workshop — the wrap-up, the feedback,
   the recording — treats freshly past as over. A term with a
@@ -121,7 +123,7 @@
   nothing about registrations at all. The registration block opens the exact
   filtered `/admin/contacts` list and its shared CSV, vCard, and Book exports;
   it never creates a second contact table or serializer in workshop administration.
-  Its term picker gives ongoing, freshly past, next-seven-day, and later upcoming
+  Its term picker gives ongoing, freshly past, today, tomorrow, next-seven-day, and later upcoming
   terms their own categories, because a term which has only just been held is
   still being wrapped up and one beginning soon needs preparation; only past terms
   stay behind its history disclosure. Its unobtrusive display-settings control
diff --git a/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx b/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
index 7f931fba445fad57265cd021c65bace471ba8e0b..e64332721f4035a7a4eb12cab7db6c3ae00a0e38
--- a/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
@@ -3,7 +3,7 @@
 import { createOnlineWorkshopTermNoteText } from '@/businesses/online-workshop/onlineWorkshopTerms';
 import { EventTermOptionList } from '@/components/events/EventTermOptionList';
 import type { EventOccurrence } from '@/lib/events/eventOccurrence';
-import { groupWorkshopsByPhase } from '@/lib/workshops/workshopPhase';
+import { groupWorkshopsByPhase, isWorkshopPhaseUpcoming, WORKSHOP_PHASE_VALUES } from '@/lib/workshops/workshopPhase';
 import { ChevronDown, Clock, History, Sparkles } from 'lucide-react';
 import { useId, useMemo, useState } from 'react';
 
@@ -65,11 +65,8 @@
         () => groupWorkshopsByPhase(terms, Date.parse(currentTime)),
         [currentTime, terms],
     );
-    const currentTerms = [
-        ...termsByPhase.ongoing,
-        ...termsByPhase['upcoming-next-week'],
-        ...termsByPhase.upcoming,
-    ];
+    const currentTerms = WORKSHOP_PHASE_VALUES.filter((phase) => phase === 'ongoing' || isWorkshopPhaseUpcoming(phase))
+        .flatMap((phase) => termsByPhase[phase]);
     const freshlyPastTerms = termsByPhase['freshly-past'];
     const { past: pastTerms } = termsByPhase;
     const isSelectedTermPast = pastTerms.some((term) => term.slug === selectedTermSlug);
diff --git a/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
index 57b8fcd8dd0773a357f9328322d8d2259cbebe4c..737f320838372e58dc3deb108ce2be6a53a267aa
--- a/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
@@ -79,6 +79,13 @@
     endsAt: '2026-09-11T11:00:00+02:00',
 });
 
+const TODAY_WORKSHOP = createOnlineWorkshopTerm({
+    slug: 'online-workshop-dnes-2026-09-10',
+    title: 'Dnešní workshop',
+    startsAt: '2026-09-10T19:00:00+02:00',
+    endsAt: '2026-09-10T20:00:00+02:00',
+});
+
 const LATER_UPCOMING_WORKSHOP = createOnlineWorkshopTerm({
     slug: 'online-workshop-kontext-projektu-2026-09-14',
     title: 'Kontext projektu a agenti',
@@ -167,12 +174,23 @@
         expect(screen.getByRole('button', { name: new RegExp(PAST_WORKSHOP.title) })).toBeDefined();
     });
 
-    it('marks a term starting during the next seven days in the waiting-room picker', () => {
-        renderWaitingRoom(LATER_UPCOMING_WORKSHOP);
+    it('keeps today and tomorrow selectable with their own badges before the other next-week terms', () => {
+        renderWaitingRoom(LATER_UPCOMING_WORKSHOP, [...PUBLISHED_WORKSHOPS, TODAY_WORKSHOP]);
 
         expect(
+            screen.getByRole('button', { name: new RegExp(TODAY_WORKSHOP.title) }).textContent,
+        ).toContain('Dneska');
+        expect(
             screen.getByRole('button', { name: new RegExp(NEAREST_UPCOMING_WORKSHOP.title) }).textContent,
+        ).toContain('Zítra');
+        expect(
+            screen.getByRole('button', { name: new RegExp(LATER_UPCOMING_WORKSHOP.title) }).textContent,
         ).toContain('Tento týden');
+
+        fireEvent.click(screen.getByRole('button', { name: new RegExp(TODAY_WORKSHOP.title) }));
+
+        expect(getOpenedWorkshopSlug()).toBe(TODAY_WORKSHOP.slug);
+        expect(window.location.search).toBe(`?workshop=${TODAY_WORKSHOP.slug}`);
     });
 
     it('names the workshop which has only just been held in the open, rather than filing it into the history', () => {
diff --git a/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx b/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
index 0532d6441fc320af25f7f81a71ff4a257b382efd..3bd0a65778edd8c7191ae34a712e8c3153a2bb0c
--- a/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
+++ b/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
@@ -43,6 +43,22 @@
     startsAt: '2026-08-24T19:00:00+02:00',
     endsAt: '2026-08-24T20:30:00+02:00',
 };
+const UPCOMING_TODAY_WORKSHOP: WorkshopAdminSummary = {
+    ...UPCOMING_WORKSHOP,
+    id: 'upcoming-today-workshop-id',
+    slug: 'produkcni-kod-2026-08-21-evening',
+    title: 'Večerní workshop dnes',
+    startsAt: '2026-08-21T21:00:00+02:00',
+    endsAt: '2026-08-21T22:00:00+02:00',
+};
+const UPCOMING_TOMORROW_WORKSHOP: WorkshopAdminSummary = {
+    ...UPCOMING_WORKSHOP,
+    id: 'upcoming-tomorrow-workshop-id',
+    slug: 'produkcni-kod-2026-08-22',
+    title: 'Workshop zítra',
+    startsAt: '2026-08-22T19:00:00+02:00',
+    endsAt: '2026-08-22T20:30:00+02:00',
+};
 const FRESHLY_PAST_WORKSHOP: WorkshopAdminSummary = {
     id: 'freshly-past-workshop-id',
     kind: 'workshop',
@@ -128,22 +144,30 @@
             FRESHLY_PAST_WORKSHOP,
             UPCOMING_WORKSHOP,
             UPCOMING_NEXT_WEEK_WORKSHOP,
+            UPCOMING_TOMORROW_WORKSHOP,
+            UPCOMING_TODAY_WORKSHOP,
             ONGOING_WORKSHOP,
         ]);
 
         expect(screen.getByRole('heading', { name: 'Probíhá (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Právě proběhlo (1)' })).not.toBeNull();
+        expect(screen.getByRole('heading', { name: 'Dneska (1)' })).not.toBeNull();
+        expect(screen.getByRole('heading', { name: 'Zítra (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Tento týden (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Nadchází (1)' })).not.toBeNull();
         expect(getWorkshopCards().map((workshopCard) => workshopCard.textContent)).toEqual([
             expect.stringContaining(ONGOING_WORKSHOP.title),
             expect.stringContaining(FRESHLY_PAST_WORKSHOP.title),
+            expect.stringContaining(UPCOMING_TODAY_WORKSHOP.title),
+            expect.stringContaining(UPCOMING_TOMORROW_WORKSHOP.title),
             expect.stringContaining(UPCOMING_NEXT_WEEK_WORKSHOP.title),
             expect.stringContaining(UPCOMING_WORKSHOP.title),
         ]);
 
         expect(getWorkshopCards()[1].textContent).toContain('Právě proběhlo');
-        expect(getWorkshopCards()[2].textContent).toContain('Tento týden');
+        expect(getWorkshopCards()[2].textContent).toContain('Dneska');
+        expect(getWorkshopCards()[3].textContent).toContain('Zítra');
+        expect(getWorkshopCards()[4].textContent).toContain('Tento týden');
         expect(screen.getByRole('button', { name: 'Historie (1)' }).getAttribute('aria-expanded')).toBe('false');
     });
 
diff --git a/businesses/workshop-admin/WorkshopSelectorCardList.tsx b/businesses/workshop-admin/WorkshopSelectorCardList.tsx
index 5b7e331aceddc897620dae58f248e2bc983896f5..aa2123738032474da72d18ca79338f95ec457fdc
--- a/businesses/workshop-admin/WorkshopSelectorCardList.tsx
+++ b/businesses/workshop-admin/WorkshopSelectorCardList.tsx
@@ -86,7 +86,7 @@
 }
 
 /**
- * Offers every occurrence as a card in the five shared time categories. An administrator gets the workshop that is
+ * Offers every occurrence as a card in the shared time categories. An administrator gets the workshop that is
  * running first, the one they are wrapping up next, then the terms to prepare soon and later, while the old archive
  * remains available on demand.
  */
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index df5b4612ecafacc477bfe8dbb97475db021af62b..83d8b0f693509e0926ab81b0ce15225503d91f9c
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,5 +1,9 @@
 # Current preversion
 
+- Added `Dneska` and `Zítra` event badges ahead of `Tento týden`, based on Prague calendar dates. Shared cards,
+  calendars, landing-page term choices, and the admin picker use the same phases and theme-aware colours. Terms
+  still switch to `Probíhá` at their start and remain eligible for waiting-room choices and follow-up recommendations.
+
 - Added the **Titulky** tab at `/admin/workshops?tab=subtitles` with private Czech, English and mixed-language tracks.
   Admins can fetch available YouTube captions, generate timed subtitles from an uploaded video/audio recording,
   import or edit SRT/WebVTT, and download either format. Long recordings are decoded in the browser and transcribed
diff --git a/components/events/EventTermOptionCard.tsx b/components/events/EventTermOptionCard.tsx
index ce65036825b967fb19601515127f7890cf8ff0bc..d6f100083c022187d95746b95f83f57e8d2dd676
--- a/components/events/EventTermOptionCard.tsx
+++ b/components/events/EventTermOptionCard.tsx
@@ -4,7 +4,7 @@
 import { formatEventPrice } from '@/lib/events/eventPrice';
 import { cn } from '@/lib/utils';
 import { formatCzechWorkshopRelativeDay, formatCzechWorkshopTimeRange } from '@/lib/workshops/workshopDate';
-import { getWorkshopPhase } from '@/lib/workshops/workshopPhase';
+import { getWorkshopPhase, isWorkshopPhaseUpcoming } from '@/lib/workshops/workshopPhase';
 import type { LucideIcon } from 'lucide-react';
 
 /**
@@ -175,7 +175,7 @@
     const appearanceClassNames = EVENT_TERM_OPTION_CARD_APPEARANCES[appearance];
     const densityClassNames = EVENT_TERM_OPTION_CARD_DENSITIES[density];
     const phase = getWorkshopPhase(occurrence, Date.parse(currentTime));
-    const isWorkshopStartingWithinNextWeek = phase === 'upcoming-next-week';
+    const isWorkshopStartingSoon = isWorkshopPhaseUpcoming(phase) && phase !== 'upcoming';
 
     return (
         <button
@@ -199,7 +199,7 @@
                     {formatCzechWorkshopRelativeDay(occurrence.startsAt, currentTime)} ·{' '}
                     {formatCzechWorkshopTimeRange(occurrence.startsAt, occurrence.endsAt)}
                 </span>
-                {isWorkshopStartingWithinNextWeek && (
+                {isWorkshopStartingSoon && (
                     <WorkshopPhaseBadge
                         phase={phase}
                         tone={appearance}
diff --git a/components/workshops/WorkshopLinksPanel.test.tsx b/components/workshops/WorkshopLinksPanel.test.tsx
index 0d3b760e290f4cf5027ca2364269abf8adacd1aa..9db3d59e76e3e4dff76d653ddb58c86d8ca06e70
--- a/components/workshops/WorkshopLinksPanel.test.tsx
+++ b/components/workshops/WorkshopLinksPanel.test.tsx
@@ -54,6 +54,15 @@
     endsAt: '2026-09-11T20:30:00+02:00',
 };
 
+const TODAY_WORKSHOP: WorkshopSummary = {
+    ...ONGOING_WORKSHOP,
+    id: 'today-workshop-id',
+    slug: 'production-ai-2026-09-10-evening',
+    title: 'Večerní workshop dnes',
+    startsAt: '2026-09-10T21:00:00+02:00',
+    endsAt: '2026-09-10T22:00:00+02:00',
+};
+
 const THIS_WEEK_WORKSHOP: WorkshopSummary = {
     ...ONGOING_WORKSHOP,
     id: 'this-week-workshop-id',
@@ -213,17 +222,27 @@
         expect(pastCard?.textContent).toContain('Proběhlo');
     });
 
-    it('gives a term in the next seven days its own badge and calendar colour', () => {
-        renderWorkshopLinksPanel([ONGOING_WORKSHOP, TOMORROW_WORKSHOP, UPCOMING_WORKSHOP]);
+    it('distinguishes today, tomorrow, and the rest of the next seven days on cards and the calendar', () => {
+        renderWorkshopLinksPanel([THIS_WEEK_WORKSHOP, TOMORROW_WORKSHOP, TODAY_WORKSHOP, UPCOMING_WORKSHOP]);
 
+        expect(findCalendarDay('2026-09-10').className).toContain(
+            getWorkshopPhaseAppearance('upcoming-today').calendarDayClassName,
+        );
         expect(findCalendarDay('2026-09-11').className).toContain(
+            getWorkshopPhaseAppearance('upcoming-tomorrow').calendarDayClassName,
+        );
+        expect(findCalendarDay('2026-09-12').className).toContain(
             getWorkshopPhaseAppearance('upcoming-next-week').calendarDayClassName,
         );
+        expect(screen.getAllByText('Dneska')).toHaveLength(2);
+        expect(screen.getAllByText('Zítra')).toHaveLength(2);
         expect(screen.getAllByText('Tento týden')).toHaveLength(2);
 
         showCardsView();
 
-        const [, upcomingNextWeekCard, upcomingCard] = findTermLinks();
+        const [todayCard, tomorrowCard, upcomingNextWeekCard, upcomingCard] = findTermLinks();
+        expect(todayCard?.textContent).toContain('Dneska');
+        expect(tomorrowCard?.textContent).toContain('Zítra');
         expect(upcomingNextWeekCard?.textContent).toContain('Tento týden');
         expect(upcomingCard?.textContent).toContain('Nadchází');
     });
diff --git a/components/workshops/workshopPhaseAppearance.ts b/components/workshops/workshopPhaseAppearance.ts
index 397626aeeca074142ce787ebea7da16101b8f4ee..81ed54d491ff2b28c62b9de95d4df343cb3676a5
--- a/components/workshops/workshopPhaseAppearance.ts
+++ b/components/workshops/workshopPhaseAppearance.ts
@@ -34,8 +34,8 @@
  * The one description of how every phase looks, wherever a term is listed
  *
  * Note: A list of cards and a calendar of the same terms say the very same thing with the very same colour - green
- *       runs right now, amber has only just been held, violet starts within a week, cyan is further ahead, and grey is
- *       history - because both of them read their colours here instead of choosing their own.
+ *       runs right now, amber has only just been held, orange starts today, blue tomorrow, violet within a week, cyan
+ *       further ahead, and grey is history - because both read their colours here instead of choosing their own.
  * Note: These colours live beside the components which wear them rather than among the rules of the application,
  *       because only the directories of the components are read for the styles the application is built with.
  */
@@ -61,6 +61,24 @@
         calendarDayClassName: 'border-room-warning/40 bg-room-warning/10 text-room-warning',
         markClassName: 'bg-room-warning',
     },
+    'upcoming-today': {
+        label: 'Dneska',
+        badgeClassNameByTone: {
+            light: 'bg-orange-100 text-orange-800',
+            room: 'bg-room-upcoming-today/15 text-room-upcoming-today ring-1 ring-inset ring-room-upcoming-today/40',
+        },
+        calendarDayClassName: 'border-room-upcoming-today/40 bg-room-upcoming-today/10 text-room-upcoming-today',
+        markClassName: 'bg-room-upcoming-today',
+    },
+    'upcoming-tomorrow': {
+        label: 'Zítra',
+        badgeClassNameByTone: {
+            light: 'bg-blue-100 text-blue-800',
+            room: 'bg-room-upcoming-tomorrow/15 text-room-upcoming-tomorrow ring-1 ring-inset ring-room-upcoming-tomorrow/40',
+        },
+        calendarDayClassName: 'border-room-upcoming-tomorrow/40 bg-room-upcoming-tomorrow/10 text-room-upcoming-tomorrow',
+        markClassName: 'bg-room-upcoming-tomorrow',
+    },
     // Note: This stays distinct from the ordinary upcoming cyan so the special badge is useful even when a reader
     //       cannot infer a date at a glance.
     'upcoming-next-week': {
diff --git a/components/workshops/workshopRoomTheme.css b/components/workshops/workshopRoomTheme.css
index 3f5f35d8211be102c381f56b40f2d3e79a68be31..47c55c58a0db06612e949785c95ffc205584b310
--- a/components/workshops/workshopRoomTheme.css
+++ b/components/workshops/workshopRoomTheme.css
@@ -19,6 +19,8 @@
     --room-success: 167 243 208;
     --room-warning: 253 230 138;
     --room-danger: 253 164 175;
+    --room-upcoming-today: 253 186 116;
+    --room-upcoming-tomorrow: 147 197 253;
     --room-upcoming: 196 181 253;
     --room-graph-pink: 244 114 182;
     --room-color-scheme: dark;
@@ -44,6 +46,8 @@
     --room-success: 6 95 70;
     --room-warning: 146 64 14;
     --room-danger: 159 18 57;
+    --room-upcoming-today: 154 52 18;
+    --room-upcoming-tomorrow: 30 64 175;
     --room-upcoming: 109 40 217;
     --room-graph-pink: 190 24 93;
     --room-color-scheme: light;
diff --git a/lib/workshops/workshopPhase.test.ts b/lib/workshops/workshopPhase.test.ts
index 746ba57a99a0364e632cefb24b1412a8ea7d26df..8b34cd8e7b7fe7caa4f15b8cf9d229c3c3b9bd14
--- a/lib/workshops/workshopPhase.test.ts
+++ b/lib/workshops/workshopPhase.test.ts
@@ -41,6 +41,14 @@
     startsAt: '2026-08-24T19:00:00+02:00',
     endsAt: '2026-08-24T20:30:00+02:00',
 };
+const UPCOMING_TODAY_WORKSHOP: WorkshopOccurrenceTiming = {
+    startsAt: '2026-08-21T21:00:00+02:00',
+    endsAt: '2026-08-21T22:00:00+02:00',
+};
+const UPCOMING_TOMORROW_WORKSHOP: WorkshopOccurrenceTiming = {
+    startsAt: '2026-08-22T19:00:00+02:00',
+    endsAt: '2026-08-22T20:00:00+02:00',
+};
 const LATER_UPCOMING_WORKSHOP: WorkshopOccurrenceTiming = {
     startsAt: '2026-10-10T19:00:00+02:00',
     endsAt: '2026-10-10T20:30:00+02:00',
@@ -54,11 +62,24 @@
     it('places an occurrence against the given moment', () => {
         expect(getWorkshopPhase(UPCOMING_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming');
         expect(getWorkshopPhase(UPCOMING_NEXT_WEEK_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming-next-week');
+        expect(getWorkshopPhase(UPCOMING_TODAY_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming-today');
+        expect(getWorkshopPhase(UPCOMING_TOMORROW_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming-tomorrow');
         expect(getWorkshopPhase(ONGOING_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('ongoing');
         expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('freshly-past');
         expect(getWorkshopPhase(PAST_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('past');
     });
 
+    it.each([
+        ['2026-08-21T21:59:59Z', '2026-08-21T22:30:00Z', 'upcoming-tomorrow'],
+        ['2026-08-21T22:00:00Z', '2026-08-21T22:30:00Z', 'upcoming-today'],
+        ['2026-12-31T22:30:00Z', '2026-12-31T23:30:00Z', 'upcoming-tomorrow'],
+        ['2026-03-28T00:15:00+01:00', '2026-03-29T23:30:00+02:00', 'upcoming-tomorrow'],
+        ['2026-03-28T23:30:00+01:00', '2026-03-30T00:15:00+02:00', 'upcoming-next-week'],
+        ['2026-10-25T00:15:00+02:00', '2026-10-25T23:30:00+01:00', 'upcoming-today'],
+    ])('uses Prague calendar days from %s to classify %s as %s', (currentTime, startsAt, expectedPhase) => {
+        expect(getWorkshopPhase({ startsAt, endsAt: null }, Date.parse(currentTime))).toBe(expectedPhase);
+    });
+
     it('keeps an occurrence freshly past for a whole day after the end recorded for it', () => {
         expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, Date.parse('2026-08-20T20:30:01+02:00'))).toBe('freshly-past');
         expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('freshly-past');
@@ -69,6 +90,8 @@
         expect(isWorkshopPhasePast('freshly-past')).toBe(true);
         expect(isWorkshopPhasePast('past')).toBe(true);
         expect(isWorkshopPhasePast('ongoing')).toBe(false);
+        expect(isWorkshopPhasePast('upcoming-today')).toBe(false);
+        expect(isWorkshopPhasePast('upcoming-tomorrow')).toBe(false);
         expect(isWorkshopPhasePast('upcoming-next-week')).toBe(false);
         expect(isWorkshopPhasePast('upcoming')).toBe(false);
     });
@@ -87,7 +110,9 @@
         expect(getWorkshopPhase(workshopAfterNextWeekBoundary, CURRENT_TIME_MILLISECONDS)).toBe('upcoming');
     });
 
-    it('counts both kinds of future term among the workshops which are still ahead', () => {
+    it('counts every kind of future term among the workshops which are still ahead', () => {
+        expect(isWorkshopPhaseUpcoming('upcoming-today')).toBe(true);
+        expect(isWorkshopPhaseUpcoming('upcoming-tomorrow')).toBe(true);
         expect(isWorkshopPhaseUpcoming('upcoming-next-week')).toBe(true);
         expect(isWorkshopPhaseUpcoming('upcoming')).toBe(true);
         expect(isWorkshopPhaseUpcoming('ongoing')).toBe(false);
@@ -106,7 +131,7 @@
         expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('ongoing');
         expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-12-24T18:00:00+01:00'))).toBe('ongoing');
         expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-08-21T18:59:59+02:00'))).toBe(
-            'upcoming-next-week',
+            'upcoming-today',
         );
     });
 
@@ -134,7 +159,7 @@
     it('keeps an occurrence ongoing until its very end and imminent until its very start', () => {
         expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T19:00:00+02:00'))).toBe('ongoing');
         expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T18:59:59+02:00'))).toBe(
-            'upcoming-next-week',
+            'upcoming-today',
         );
         expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('freshly-past');
     });
@@ -150,6 +175,8 @@
                 FRESHLY_PAST_WORKSHOP,
                 UPCOMING_WORKSHOP,
                 UPCOMING_NEXT_WEEK_WORKSHOP,
+                UPCOMING_TOMORROW_WORKSHOP,
+                UPCOMING_TODAY_WORKSHOP,
                 ONGOING_WORKSHOP,
             ],
             CURRENT_TIME_MILLISECONDS,
@@ -158,6 +185,8 @@
         expect(sortedWorkshops).toEqual([
             ONGOING_WORKSHOP,
             FRESHLY_PAST_WORKSHOP,
+            UPCOMING_TODAY_WORKSHOP,
+            UPCOMING_TOMORROW_WORKSHOP,
             UPCOMING_NEXT_WEEK_WORKSHOP,
             UPCOMING_WORKSHOP,
             LATER_UPCOMING_WORKSHOP,
@@ -183,6 +212,8 @@
                 FRESHLY_PAST_WORKSHOP,
                 UPCOMING_WORKSHOP,
                 UPCOMING_NEXT_WEEK_WORKSHOP,
+                UPCOMING_TOMORROW_WORKSHOP,
+                UPCOMING_TODAY_WORKSHOP,
                 ONGOING_WORKSHOP,
             ],
             CURRENT_TIME_MILLISECONDS,
@@ -191,6 +222,8 @@
         expect(workshopsByPhase).toEqual({
             ongoing: [ONGOING_WORKSHOP],
             'freshly-past': [FRESHLY_PAST_WORKSHOP],
+            'upcoming-today': [UPCOMING_TODAY_WORKSHOP],
+            'upcoming-tomorrow': [UPCOMING_TOMORROW_WORKSHOP],
             'upcoming-next-week': [UPCOMING_NEXT_WEEK_WORKSHOP],
             upcoming: [UPCOMING_WORKSHOP, LATER_UPCOMING_WORKSHOP],
             past: [PAST_WORKSHOP, OLDER_PAST_WORKSHOP],
@@ -199,6 +232,11 @@
 
     it('lets the most pressing phase speak for a group of occurrences', () => {
         expect(getMostProminentWorkshopPhase(['past', 'upcoming', 'ongoing'])).toBe('ongoing');
+        expect(getMostProminentWorkshopPhase(['upcoming-today', 'ongoing'])).toBe('ongoing');
+        expect(getMostProminentWorkshopPhase(['upcoming-tomorrow', 'upcoming-today', 'upcoming-next-week'])).toBe(
+            'upcoming-today',
+        );
+        expect(getMostProminentWorkshopPhase(['upcoming-next-week', 'upcoming-tomorrow'])).toBe('upcoming-tomorrow');
         expect(getMostProminentWorkshopPhase(['past', 'upcoming', 'upcoming-next-week'])).toBe('upcoming-next-week');
         expect(getMostProminentWorkshopPhase(['past', 'freshly-past', 'upcoming'])).toBe('freshly-past');
         expect(getMostProminentWorkshopPhase(['past', 'freshly-past'])).toBe('freshly-past');
diff --git a/lib/workshops/workshopPhase.ts b/lib/workshops/workshopPhase.ts
index 0ac9e8a2847c45355d50625381df66584f696536..ac1ea734d5ae6bdf4de3076aeeb2ce399051b59e
--- a/lib/workshops/workshopPhase.ts
+++ b/lib/workshops/workshopPhase.ts
@@ -1,3 +1,5 @@
+import { createCalendarDayKey } from '@/lib/calendar/calendarMonth';
+import { getRelativeCalendarDay } from '@/lib/calendar/czechRelativeDay';
 import {
     DEFAULT_WORKSHOP_DURATION_MINUTES,
     FRESHLY_PAST_WORKSHOP_HOURS,
@@ -6,6 +8,7 @@
 
 const MILLISECONDS_PER_MINUTE = 60 * 1000;
 const MILLISECONDS_PER_HOUR = 60 * MILLISECONDS_PER_MINUTE;
+const WORKSHOP_TIME_ZONE = 'Europe/Prague';
 
 /**
  * Where one occurrence currently stands in time, named from the most pressing phase to the least
@@ -15,10 +18,19 @@
  *       nothing to do with what they do with a workshop of last spring.
  * Note: An occurrence which starts during the next seven days is also a phase of its own, so a schedule can call
  *       attention to the terms somebody still has time to plan for without each surface calculating that window again.
+ *       Today and tomorrow take precedence within that window, using Prague calendar days rather than elapsed hours.
  * Note: This order is what ranks the phases wherever they are listed, coloured, or grouped, so a phase is placed among
  *       the others only here.
  */
-export const WORKSHOP_PHASE_VALUES = ['ongoing', 'freshly-past', 'upcoming-next-week', 'upcoming', 'past'] as const;
+export const WORKSHOP_PHASE_VALUES = [
+    'ongoing',
+    'freshly-past',
+    'upcoming-today',
+    'upcoming-tomorrow',
+    'upcoming-next-week',
+    'upcoming',
+    'past',
+] as const;
 
 export type WorkshopPhase = (typeof WORKSHOP_PHASE_VALUES)[number];
 
@@ -41,7 +53,12 @@
  *       badge.
  */
 export function isWorkshopPhaseUpcoming(phase: WorkshopPhase): boolean {
-    return phase === 'upcoming-next-week' || phase === 'upcoming';
+    return (
+        phase === 'upcoming-today' ||
+        phase === 'upcoming-tomorrow' ||
+        phase === 'upcoming-next-week' ||
+        phase === 'upcoming'
+    );
 }
 
 /**
@@ -127,6 +144,17 @@
 ): WorkshopPhase {
     const startsAtMilliseconds = Date.parse(occurrence.startsAt);
     if (isWorkshopStartingWithinNextWeek(startsAtMilliseconds, currentTimeMilliseconds)) {
+        const relativeDay = getRelativeCalendarDay(
+            createCalendarDayKey(occurrence.startsAt, WORKSHOP_TIME_ZONE),
+            createCalendarDayKey(new Date(currentTimeMilliseconds).toISOString(), WORKSHOP_TIME_ZONE),
+        );
+        if (relativeDay === 'today') {
+            return 'upcoming-today';
+        }
+        if (relativeDay === 'tomorrow') {
+            return 'upcoming-tomorrow';
+        }
+
         return 'upcoming-next-week';
     }
 
@@ -207,6 +235,8 @@
     const workshopsByPhase: Record<WorkshopPhase, TWorkshop[]> = {
         ongoing: [],
         'freshly-past': [],
+        'upcoming-today': [],
+        'upcoming-tomorrow': [],
         'upcoming-next-week': [],
         upcoming: [],
         past: [],
diff --git a/tailwind.config.ts b/tailwind.config.ts
index 8019f41f1539feedb45d402a70dd8ffff9aca8ad..db919851e4a1a55643569375d67dc665ab75a01b
--- a/tailwind.config.ts
+++ b/tailwind.config.ts
@@ -51,6 +51,8 @@
                     success: 'rgb(var(--room-success) / <alpha-value>)',
                     warning: 'rgb(var(--room-warning) / <alpha-value>)',
                     danger: 'rgb(var(--room-danger) / <alpha-value>)',
+                    'upcoming-today': 'rgb(var(--room-upcoming-today) / <alpha-value>)',
+                    'upcoming-tomorrow': 'rgb(var(--room-upcoming-tomorrow) / <alpha-value>)',
                     upcoming: 'rgb(var(--room-upcoming) / <alpha-value>)',
                 },
                 background: 'hsl(var(--background))',

codex
The new badges now flow through the shared cards, calendar, and admin picker. I also updated the waiting-room list and follow-up eligibility to include both new phases. I’m checking Prague midnight and daylight-saving boundaries next.

exec
/bin/zsh -lc 'git diff -- lib/workshops/workshopPhase.ts lib/workshops/workshopPhase.test.ts components/workshops/workshopPhaseAppearance.ts businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx' in /Users/hejny/work/aldaron
 succeeded in 0ms:
diff --git a/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx b/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
index 7f931fb..e643327 100644
--- a/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
@@ -3,7 +3,7 @@
 import { createOnlineWorkshopTermNoteText } from '@/businesses/online-workshop/onlineWorkshopTerms';
 import { EventTermOptionList } from '@/components/events/EventTermOptionList';
 import type { EventOccurrence } from '@/lib/events/eventOccurrence';
-import { groupWorkshopsByPhase } from '@/lib/workshops/workshopPhase';
+import { groupWorkshopsByPhase, isWorkshopPhaseUpcoming, WORKSHOP_PHASE_VALUES } from '@/lib/workshops/workshopPhase';
 import { ChevronDown, Clock, History, Sparkles } from 'lucide-react';
 import { useId, useMemo, useState } from 'react';
 
@@ -65,11 +65,8 @@ export function OnlineWorkshopRoomTermPicker({
         () => groupWorkshopsByPhase(terms, Date.parse(currentTime)),
         [currentTime, terms],
     );
-    const currentTerms = [
-        ...termsByPhase.ongoing,
-        ...termsByPhase['upcoming-next-week'],
-        ...termsByPhase.upcoming,
-    ];
+    const currentTerms = WORKSHOP_PHASE_VALUES.filter((phase) => phase === 'ongoing' || isWorkshopPhaseUpcoming(phase))
+        .flatMap((phase) => termsByPhase[phase]);
     const freshlyPastTerms = termsByPhase['freshly-past'];
     const { past: pastTerms } = termsByPhase;
     const isSelectedTermPast = pastTerms.some((term) => term.slug === selectedTermSlug);
diff --git a/components/workshops/workshopPhaseAppearance.ts b/components/workshops/workshopPhaseAppearance.ts
index 397626a..81ed54d 100644
--- a/components/workshops/workshopPhaseAppearance.ts
+++ b/components/workshops/workshopPhaseAppearance.ts
@@ -34,8 +34,8 @@ export type WorkshopPhaseAppearance = {
  * The one description of how every phase looks, wherever a term is listed
  *
  * Note: A list of cards and a calendar of the same terms say the very same thing with the very same colour - green
- *       runs right now, amber has only just been held, violet starts within a week, cyan is further ahead, and grey is
- *       history - because both of them read their colours here instead of choosing their own.
+ *       runs right now, amber has only just been held, orange starts today, blue tomorrow, violet within a week, cyan
+ *       further ahead, and grey is history - because both read their colours here instead of choosing their own.
  * Note: These colours live beside the components which wear them rather than among the rules of the application,
  *       because only the directories of the components are read for the styles the application is built with.
  */
@@ -61,6 +61,24 @@ const WORKSHOP_PHASE_APPEARANCES: Readonly<Record<WorkshopPhase, WorkshopPhaseAp
         calendarDayClassName: 'border-room-warning/40 bg-room-warning/10 text-room-warning',
         markClassName: 'bg-room-warning',
     },
+    'upcoming-today': {
+        label: 'Dneska',
+        badgeClassNameByTone: {
+            light: 'bg-orange-100 text-orange-800',
+            room: 'bg-room-upcoming-today/15 text-room-upcoming-today ring-1 ring-inset ring-room-upcoming-today/40',
+        },
+        calendarDayClassName: 'border-room-upcoming-today/40 bg-room-upcoming-today/10 text-room-upcoming-today',
+        markClassName: 'bg-room-upcoming-today',
+    },
+    'upcoming-tomorrow': {
+        label: 'Zítra',
+        badgeClassNameByTone: {
+            light: 'bg-blue-100 text-blue-800',
+            room: 'bg-room-upcoming-tomorrow/15 text-room-upcoming-tomorrow ring-1 ring-inset ring-room-upcoming-tomorrow/40',
+        },
+        calendarDayClassName: 'border-room-upcoming-tomorrow/40 bg-room-upcoming-tomorrow/10 text-room-upcoming-tomorrow',
+        markClassName: 'bg-room-upcoming-tomorrow',
+    },
     // Note: This stays distinct from the ordinary upcoming cyan so the special badge is useful even when a reader
     //       cannot infer a date at a glance.
     'upcoming-next-week': {
diff --git a/lib/workshops/workshopPhase.test.ts b/lib/workshops/workshopPhase.test.ts
index 746ba57..8b34cd8 100644
--- a/lib/workshops/workshopPhase.test.ts
+++ b/lib/workshops/workshopPhase.test.ts
@@ -41,6 +41,14 @@ const UPCOMING_NEXT_WEEK_WORKSHOP: WorkshopOccurrenceTiming = {
     startsAt: '2026-08-24T19:00:00+02:00',
     endsAt: '2026-08-24T20:30:00+02:00',
 };
+const UPCOMING_TODAY_WORKSHOP: WorkshopOccurrenceTiming = {
+    startsAt: '2026-08-21T21:00:00+02:00',
+    endsAt: '2026-08-21T22:00:00+02:00',
+};
+const UPCOMING_TOMORROW_WORKSHOP: WorkshopOccurrenceTiming = {
+    startsAt: '2026-08-22T19:00:00+02:00',
+    endsAt: '2026-08-22T20:00:00+02:00',
+};
 const LATER_UPCOMING_WORKSHOP: WorkshopOccurrenceTiming = {
     startsAt: '2026-10-10T19:00:00+02:00',
     endsAt: '2026-10-10T20:30:00+02:00',
@@ -54,11 +62,24 @@ describe('workshop phase', () => {
     it('places an occurrence against the given moment', () => {
         expect(getWorkshopPhase(UPCOMING_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming');
         expect(getWorkshopPhase(UPCOMING_NEXT_WEEK_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming-next-week');
+        expect(getWorkshopPhase(UPCOMING_TODAY_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming-today');
+        expect(getWorkshopPhase(UPCOMING_TOMORROW_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming-tomorrow');
         expect(getWorkshopPhase(ONGOING_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('ongoing');
         expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('freshly-past');
         expect(getWorkshopPhase(PAST_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('past');
     });
 
+    it.each([
+        ['2026-08-21T21:59:59Z', '2026-08-21T22:30:00Z', 'upcoming-tomorrow'],
+        ['2026-08-21T22:00:00Z', '2026-08-21T22:30:00Z', 'upcoming-today'],
+        ['2026-12-31T22:30:00Z', '2026-12-31T23:30:00Z', 'upcoming-tomorrow'],
+        ['2026-03-28T00:15:00+01:00', '2026-03-29T23:30:00+02:00', 'upcoming-tomorrow'],
+        ['2026-03-28T23:30:00+01:00', '2026-03-30T00:15:00+02:00', 'upcoming-next-week'],
+        ['2026-10-25T00:15:00+02:00', '2026-10-25T23:30:00+01:00', 'upcoming-today'],
+    ])('uses Prague calendar days from %s to classify %s as %s', (currentTime, startsAt, expectedPhase) => {
+        expect(getWorkshopPhase({ startsAt, endsAt: null }, Date.parse(currentTime))).toBe(expectedPhase);
+    });
+
     it('keeps an occurrence freshly past for a whole day after the end recorded for it', () => {
         expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, Date.parse('2026-08-20T20:30:01+02:00'))).toBe('freshly-past');
         expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('freshly-past');
@@ -69,6 +90,8 @@ describe('workshop phase', () => {
         expect(isWorkshopPhasePast('freshly-past')).toBe(true);
         expect(isWorkshopPhasePast('past')).toBe(true);
         expect(isWorkshopPhasePast('ongoing')).toBe(false);
+        expect(isWorkshopPhasePast('upcoming-today')).toBe(false);
+        expect(isWorkshopPhasePast('upcoming-tomorrow')).toBe(false);
         expect(isWorkshopPhasePast('upcoming-next-week')).toBe(false);
         expect(isWorkshopPhasePast('upcoming')).toBe(false);
     });
@@ -87,7 +110,9 @@ describe('workshop phase', () => {
         expect(getWorkshopPhase(workshopAfterNextWeekBoundary, CURRENT_TIME_MILLISECONDS)).toBe('upcoming');
     });
 
-    it('counts both kinds of future term among the workshops which are still ahead', () => {
+    it('counts every kind of future term among the workshops which are still ahead', () => {
+        expect(isWorkshopPhaseUpcoming('upcoming-today')).toBe(true);
+        expect(isWorkshopPhaseUpcoming('upcoming-tomorrow')).toBe(true);
         expect(isWorkshopPhaseUpcoming('upcoming-next-week')).toBe(true);
         expect(isWorkshopPhaseUpcoming('upcoming')).toBe(true);
         expect(isWorkshopPhaseUpcoming('ongoing')).toBe(false);
@@ -106,7 +131,7 @@ describe('workshop phase', () => {
         expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('ongoing');
         expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-12-24T18:00:00+01:00'))).toBe('ongoing');
         expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-08-21T18:59:59+02:00'))).toBe(
-            'upcoming-next-week',
+            'upcoming-today',
         );
     });
 
@@ -134,7 +159,7 @@ describe('workshop phase', () => {
     it('keeps an occurrence ongoing until its very end and imminent until its very start', () => {
         expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T19:00:00+02:00'))).toBe('ongoing');
         expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T18:59:59+02:00'))).toBe(
-            'upcoming-next-week',
+            'upcoming-today',
         );
         expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('freshly-past');
     });
@@ -150,6 +175,8 @@ describe('workshop phase ordering', () => {
                 FRESHLY_PAST_WORKSHOP,
                 UPCOMING_WORKSHOP,
                 UPCOMING_NEXT_WEEK_WORKSHOP,
+                UPCOMING_TOMORROW_WORKSHOP,
+                UPCOMING_TODAY_WORKSHOP,
                 ONGOING_WORKSHOP,
             ],
             CURRENT_TIME_MILLISECONDS,
@@ -158,6 +185,8 @@ describe('workshop phase ordering', () => {
         expect(sortedWorkshops).toEqual([
             ONGOING_WORKSHOP,
             FRESHLY_PAST_WORKSHOP,
+            UPCOMING_TODAY_WORKSHOP,
+            UPCOMING_TOMORROW_WORKSHOP,
             UPCOMING_NEXT_WEEK_WORKSHOP,
             UPCOMING_WORKSHOP,
             LATER_UPCOMING_WORKSHOP,
@@ -183,6 +212,8 @@ describe('workshop phase ordering', () => {
                 FRESHLY_PAST_WORKSHOP,
                 UPCOMING_WORKSHOP,
                 UPCOMING_NEXT_WEEK_WORKSHOP,
+                UPCOMING_TOMORROW_WORKSHOP,
+                UPCOMING_TODAY_WORKSHOP,
                 ONGOING_WORKSHOP,
             ],
             CURRENT_TIME_MILLISECONDS,
@@ -191,6 +222,8 @@ describe('workshop phase ordering', () => {
         expect(workshopsByPhase).toEqual({
             ongoing: [ONGOING_WORKSHOP],
             'freshly-past': [FRESHLY_PAST_WORKSHOP],
+            'upcoming-today': [UPCOMING_TODAY_WORKSHOP],
+            'upcoming-tomorrow': [UPCOMING_TOMORROW_WORKSHOP],
             'upcoming-next-week': [UPCOMING_NEXT_WEEK_WORKSHOP],
             upcoming: [UPCOMING_WORKSHOP, LATER_UPCOMING_WORKSHOP],
             past: [PAST_WORKSHOP, OLDER_PAST_WORKSHOP],
@@ -199,6 +232,11 @@ describe('workshop phase ordering', () => {
 
     it('lets the most pressing phase speak for a group of occurrences', () => {
         expect(getMostProminentWorkshopPhase(['past', 'upcoming', 'ongoing'])).toBe('ongoing');
+        expect(getMostProminentWorkshopPhase(['upcoming-today', 'ongoing'])).toBe('ongoing');
+        expect(getMostProminentWorkshopPhase(['upcoming-tomorrow', 'upcoming-today', 'upcoming-next-week'])).toBe(
+            'upcoming-today',
+        );
+        expect(getMostProminentWorkshopPhase(['upcoming-next-week', 'upcoming-tomorrow'])).toBe('upcoming-tomorrow');
         expect(getMostProminentWorkshopPhase(['past', 'upcoming', 'upcoming-next-week'])).toBe('upcoming-next-week');
         expect(getMostProminentWorkshopPhase(['past', 'freshly-past', 'upcoming'])).toBe('freshly-past');
         expect(getMostProminentWorkshopPhase(['past', 'freshly-past'])).toBe('freshly-past');
diff --git a/lib/workshops/workshopPhase.ts b/lib/workshops/workshopPhase.ts
index 0ac9e8a..ac1ea73 100644
--- a/lib/workshops/workshopPhase.ts
+++ b/lib/workshops/workshopPhase.ts
@@ -1,3 +1,5 @@
+import { createCalendarDayKey } from '@/lib/calendar/calendarMonth';
+import { getRelativeCalendarDay } from '@/lib/calendar/czechRelativeDay';
 import {
     DEFAULT_WORKSHOP_DURATION_MINUTES,
     FRESHLY_PAST_WORKSHOP_HOURS,
@@ -6,6 +8,7 @@ import {
 
 const MILLISECONDS_PER_MINUTE = 60 * 1000;
 const MILLISECONDS_PER_HOUR = 60 * MILLISECONDS_PER_MINUTE;
+const WORKSHOP_TIME_ZONE = 'Europe/Prague';
 
 /**
  * Where one occurrence currently stands in time, named from the most pressing phase to the least
@@ -15,10 +18,19 @@ const MILLISECONDS_PER_HOUR = 60 * MILLISECONDS_PER_MINUTE;
  *       nothing to do with what they do with a workshop of last spring.
  * Note: An occurrence which starts during the next seven days is also a phase of its own, so a schedule can call
  *       attention to the terms somebody still has time to plan for without each surface calculating that window again.
+ *       Today and tomorrow take precedence within that window, using Prague calendar days rather than elapsed hours.
  * Note: This order is what ranks the phases wherever they are listed, coloured, or grouped, so a phase is placed among
  *       the others only here.
  */
-export const WORKSHOP_PHASE_VALUES = ['ongoing', 'freshly-past', 'upcoming-next-week', 'upcoming', 'past'] as const;
+export const WORKSHOP_PHASE_VALUES = [
+    'ongoing',
+    'freshly-past',
+    'upcoming-today',
+    'upcoming-tomorrow',
+    'upcoming-next-week',
+    'upcoming',
+    'past',
+] as const;
 
 export type WorkshopPhase = (typeof WORKSHOP_PHASE_VALUES)[number];
 
@@ -41,7 +53,12 @@ export function isWorkshopPhasePast(phase: WorkshopPhase): boolean {
  *       badge.
  */
 export function isWorkshopPhaseUpcoming(phase: WorkshopPhase): boolean {
-    return phase === 'upcoming-next-week' || phase === 'upcoming';
+    return (
+        phase === 'upcoming-today' ||
+        phase === 'upcoming-tomorrow' ||
+        phase === 'upcoming-next-week' ||
+        phase === 'upcoming'
+    );
 }
 
 /**
@@ -127,6 +144,17 @@ export function getWorkshopPhase(
 ): WorkshopPhase {
     const startsAtMilliseconds = Date.parse(occurrence.startsAt);
     if (isWorkshopStartingWithinNextWeek(startsAtMilliseconds, currentTimeMilliseconds)) {
+        const relativeDay = getRelativeCalendarDay(
+            createCalendarDayKey(occurrence.startsAt, WORKSHOP_TIME_ZONE),
+            createCalendarDayKey(new Date(currentTimeMilliseconds).toISOString(), WORKSHOP_TIME_ZONE),
+        );
+        if (relativeDay === 'today') {
+            return 'upcoming-today';
+        }
+        if (relativeDay === 'tomorrow') {
+            return 'upcoming-tomorrow';
+        }
+
         return 'upcoming-next-week';
     }
 
@@ -207,6 +235,8 @@ export function groupWorkshopsByPhase<TWorkshop extends WorkshopOccurrenceTiming
     const workshopsByPhase: Record<WorkshopPhase, TWorkshop[]> = {
         ongoing: [],
         'freshly-past': [],
+        'upcoming-today': [],
+        'upcoming-tomorrow': [],
         'upcoming-next-week': [],
         upcoming: [],
         past: [],

exec
/bin/zsh -lc 'git diff --check && git diff --stat && npm run lint -- --file lib/workshops/workshopPhase.ts --file components/workshops/workshopPhaseAppearance.ts --file components/events/EventTermOptionCard.tsx --file businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx --file businesses/workshop-admin/WorkshopSelectorCardList.tsx --file tailwind.config.ts' in /Users/hejny/work/aldaron
 exited 2 in 0ms:
prompts/2026-09-0171-freshly-upcomming-events.md:31: new blank line at EOF.

exec
/bin/zsh -lc 'npm test -- lib/workshops/workshopPhase.test.ts lib/events/eventListing.test.ts components/workshops/WorkshopLinksPanel.test.tsx businesses/workshop-admin/WorkshopSelectorCardList.test.tsx businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx businesses/online-workshop/participant/WorkshopWrapUpNavigation.test.tsx businesses/online-workshop/participant/WorkshopStage.test.tsx lib/workshops/workshopDate.test.ts lib/calendar/czechRelativeDay.test.ts' in /Users/hejny/work/aldaron
diff --git a/AGENTS.md b/AGENTS.md
index 8557778d230f0715e09a335fd303bf86015c32dd..d000c5fd0c0fe752490b216922648f5e0d80e798
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -21,8 +21,9 @@
   but all use one registration form. `/cs/online-workshop/dekujeme` is the
   full-load conversion page; `/participant` is the live room. Its waiting room
   offers every published term as the same term cards the landing page registers
-  with: running and upcoming ones first, with a special `Tento týden` badge for a
-  term beginning within the next seven rolling days, then the ones which ended
+  with: running and upcoming ones first, with `Dneska` and `Zítra` badges for terms
+  beginning today or tomorrow in Prague and `Tento týden` for the remaining terms
+  beginning within the next seven rolling days, then the ones which ended
   within the last day, and the older finished ones behind a disclosure.
   Picking one changes the room being connected to and the `workshop` parameter,
   without losing the name and e-mail already typed.
@@ -91,8 +92,9 @@
   a replay badge. Card data includes no feedback. Where a term stands in
   time is decided
   once, in `lib/workshops/workshopPhase.ts`, as one of
-  five phases: ongoing, freshly past while it ended within the last
-  `FRESHLY_PAST_WORKSHOP_HOURS`, upcoming within the next seven rolling days,
+  seven phases: ongoing, freshly past while it ended within the last
+  `FRESHLY_PAST_WORKSHOP_HOURS`, upcoming today or tomorrow by Prague calendar date,
+  other upcoming within the next seven rolling days,
   other upcoming, and past. Every list, badge, and calendar colour reads that one
   answer, and everything which opens after a workshop — the wrap-up, the feedback,
   the recording — treats freshly past as over. A term with a
@@ -121,7 +123,7 @@
   nothing about registrations at all. The registration block opens the exact
   filtered `/admin/contacts` list and its shared CSV, vCard, and Book exports;
   it never creates a second contact table or serializer in workshop administration.
-  Its term picker gives ongoing, freshly past, next-seven-day, and later upcoming
+  Its term picker gives ongoing, freshly past, today, tomorrow, next-seven-day, and later upcoming
   terms their own categories, because a term which has only just been held is
   still being wrapped up and one beginning soon needs preparation; only past terms
   stay behind its history disclosure. Its unobtrusive display-settings control
diff --git a/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx b/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
index 7f931fba445fad57265cd021c65bace471ba8e0b..e64332721f4035a7a4eb12cab7db6c3ae00a0e38
--- a/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
@@ -3,7 +3,7 @@
 import { createOnlineWorkshopTermNoteText } from '@/businesses/online-workshop/onlineWorkshopTerms';
 import { EventTermOptionList } from '@/components/events/EventTermOptionList';
 import type { EventOccurrence } from '@/lib/events/eventOccurrence';
-import { groupWorkshopsByPhase } from '@/lib/workshops/workshopPhase';
+import { groupWorkshopsByPhase, isWorkshopPhaseUpcoming, WORKSHOP_PHASE_VALUES } from '@/lib/workshops/workshopPhase';
 import { ChevronDown, Clock, History, Sparkles } from 'lucide-react';
 import { useId, useMemo, useState } from 'react';
 
@@ -65,11 +65,8 @@
         () => groupWorkshopsByPhase(terms, Date.parse(currentTime)),
         [currentTime, terms],
     );
-    const currentTerms = [
-        ...termsByPhase.ongoing,
-        ...termsByPhase['upcoming-next-week'],
-        ...termsByPhase.upcoming,
-    ];
+    const currentTerms = WORKSHOP_PHASE_VALUES.filter((phase) => phase === 'ongoing' || isWorkshopPhaseUpcoming(phase))
+        .flatMap((phase) => termsByPhase[phase]);
     const freshlyPastTerms = termsByPhase['freshly-past'];
     const { past: pastTerms } = termsByPhase;
     const isSelectedTermPast = pastTerms.some((term) => term.slug === selectedTermSlug);
diff --git a/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
index 57b8fcd8dd0773a357f9328322d8d2259cbebe4c..737f320838372e58dc3deb108ce2be6a53a267aa
--- a/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
@@ -79,6 +79,13 @@
     endsAt: '2026-09-11T11:00:00+02:00',
 });
 
+const TODAY_WORKSHOP = createOnlineWorkshopTerm({
+    slug: 'online-workshop-dnes-2026-09-10',
+    title: 'Dnešní workshop',
+    startsAt: '2026-09-10T19:00:00+02:00',
+    endsAt: '2026-09-10T20:00:00+02:00',
+});
+
 const LATER_UPCOMING_WORKSHOP = createOnlineWorkshopTerm({
     slug: 'online-workshop-kontext-projektu-2026-09-14',
     title: 'Kontext projektu a agenti',
@@ -167,12 +174,23 @@
         expect(screen.getByRole('button', { name: new RegExp(PAST_WORKSHOP.title) })).toBeDefined();
     });
 
-    it('marks a term starting during the next seven days in the waiting-room picker', () => {
-        renderWaitingRoom(LATER_UPCOMING_WORKSHOP);
+    it('keeps today and tomorrow selectable with their own badges before the other next-week terms', () => {
+        renderWaitingRoom(LATER_UPCOMING_WORKSHOP, [...PUBLISHED_WORKSHOPS, TODAY_WORKSHOP]);
 
         expect(
+            screen.getByRole('button', { name: new RegExp(TODAY_WORKSHOP.title) }).textContent,
+        ).toContain('Dneska');
+        expect(
             screen.getByRole('button', { name: new RegExp(NEAREST_UPCOMING_WORKSHOP.title) }).textContent,
+        ).toContain('Zítra');
+        expect(
+            screen.getByRole('button', { name: new RegExp(LATER_UPCOMING_WORKSHOP.title) }).textContent,
         ).toContain('Tento týden');
+
+        fireEvent.click(screen.getByRole('button', { name: new RegExp(TODAY_WORKSHOP.title) }));
+
+        expect(getOpenedWorkshopSlug()).toBe(TODAY_WORKSHOP.slug);
+        expect(window.location.search).toBe(`?workshop=${TODAY_WORKSHOP.slug}`);
     });
 
     it('names the workshop which has only just been held in the open, rather than filing it into the history', () => {
diff --git a/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx b/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
index 0532d6441fc320af25f7f81a71ff4a257b382efd..3bd0a65778edd8c7191ae34a712e8c3153a2bb0c
--- a/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
+++ b/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
@@ -43,6 +43,22 @@
     startsAt: '2026-08-24T19:00:00+02:00',
     endsAt: '2026-08-24T20:30:00+02:00',
 };
+const UPCOMING_TODAY_WORKSHOP: WorkshopAdminSummary = {
+    ...UPCOMING_WORKSHOP,
+    id: 'upcoming-today-workshop-id',
+    slug: 'produkcni-kod-2026-08-21-evening',
+    title: 'Večerní workshop dnes',
+    startsAt: '2026-08-21T21:00:00+02:00',
+    endsAt: '2026-08-21T22:00:00+02:00',
+};
+const UPCOMING_TOMORROW_WORKSHOP: WorkshopAdminSummary = {
+    ...UPCOMING_WORKSHOP,
+    id: 'upcoming-tomorrow-workshop-id',
+    slug: 'produkcni-kod-2026-08-22',
+    title: 'Workshop zítra',
+    startsAt: '2026-08-22T19:00:00+02:00',
+    endsAt: '2026-08-22T20:30:00+02:00',
+};
 const FRESHLY_PAST_WORKSHOP: WorkshopAdminSummary = {
     id: 'freshly-past-workshop-id',
     kind: 'workshop',
@@ -128,22 +144,30 @@
             FRESHLY_PAST_WORKSHOP,
             UPCOMING_WORKSHOP,
             UPCOMING_NEXT_WEEK_WORKSHOP,
+            UPCOMING_TOMORROW_WORKSHOP,
+            UPCOMING_TODAY_WORKSHOP,
             ONGOING_WORKSHOP,
         ]);
 
         expect(screen.getByRole('heading', { name: 'Probíhá (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Právě proběhlo (1)' })).not.toBeNull();
+        expect(screen.getByRole('heading', { name: 'Dneska (1)' })).not.toBeNull();
+        expect(screen.getByRole('heading', { name: 'Zítra (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Tento týden (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Nadchází (1)' })).not.toBeNull();
         expect(getWorkshopCards().map((workshopCard) => workshopCard.textContent)).toEqual([
             expect.stringContaining(ONGOING_WORKSHOP.title),
             expect.stringContaining(FRESHLY_PAST_WORKSHOP.title),
+            expect.stringContaining(UPCOMING_TODAY_WORKSHOP.title),
+            expect.stringContaining(UPCOMING_TOMORROW_WORKSHOP.title),
             expect.stringContaining(UPCOMING_NEXT_WEEK_WORKSHOP.title),
             expect.stringContaining(UPCOMING_WORKSHOP.title),
         ]);
 
         expect(getWorkshopCards()[1].textContent).toContain('Právě proběhlo');
-        expect(getWorkshopCards()[2].textContent).toContain('Tento týden');
+        expect(getWorkshopCards()[2].textContent).toContain('Dneska');
+        expect(getWorkshopCards()[3].textContent).toContain('Zítra');
+        expect(getWorkshopCards()[4].textContent).toContain('Tento týden');
         expect(screen.getByRole('button', { name: 'Historie (1)' }).getAttribute('aria-expanded')).toBe('false');
     });
 
diff --git a/businesses/workshop-admin/WorkshopSelectorCardList.tsx b/businesses/workshop-admin/WorkshopSelectorCardList.tsx
index 5b7e331aceddc897620dae58f248e2bc983896f5..aa2123738032474da72d18ca79338f95ec457fdc
--- a/businesses/workshop-admin/WorkshopSelectorCardList.tsx
+++ b/businesses/workshop-admin/WorkshopSelectorCardList.tsx
@@ -86,7 +86,7 @@
 }
 
 /**
- * Offers every occurrence as a card in the five shared time categories. An administrator gets the workshop that is
+ * Offers every occurrence as a card in the shared time categories. An administrator gets the workshop that is
  * running first, the one they are wrapping up next, then the terms to prepare soon and later, while the old archive
  * remains available on demand.
  */
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index df5b4612ecafacc477bfe8dbb97475db021af62b..83d8b0f693509e0926ab81b0ce15225503d91f9c
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,5 +1,9 @@
 # Current preversion
 
+- Added `Dneska` and `Zítra` event badges ahead of `Tento týden`, based on Prague calendar dates. Shared cards,
+  calendars, landing-page term choices, and the admin picker use the same phases and theme-aware colours. Terms
+  still switch to `Probíhá` at their start and remain eligible for waiting-room choices and follow-up recommendations.
+
 - Added the **Titulky** tab at `/admin/workshops?tab=subtitles` with private Czech, English and mixed-language tracks.
   Admins can fetch available YouTube captions, generate timed subtitles from an uploaded video/audio recording,
   import or edit SRT/WebVTT, and download either format. Long recordings are decoded in the browser and transcribed
diff --git a/components/events/EventTermOptionCard.tsx b/components/events/EventTermOptionCard.tsx
index ce65036825b967fb19601515127f7890cf8ff0bc..d6f100083c022187d95746b95f83f57e8d2dd676
--- a/components/events/EventTermOptionCard.tsx
+++ b/components/events/EventTermOptionCard.tsx
@@ -4,7 +4,7 @@
 import { formatEventPrice } from '@/lib/events/eventPrice';
 import { cn } from '@/lib/utils';
 import { formatCzechWorkshopRelativeDay, formatCzechWorkshopTimeRange } from '@/lib/workshops/workshopDate';
-import { getWorkshopPhase } from '@/lib/workshops/workshopPhase';
+import { getWorkshopPhase, isWorkshopPhaseUpcoming } from '@/lib/workshops/workshopPhase';
 import type { LucideIcon } from 'lucide-react';
 
 /**
@@ -175,7 +175,7 @@
     const appearanceClassNames = EVENT_TERM_OPTION_CARD_APPEARANCES[appearance];
     const densityClassNames = EVENT_TERM_OPTION_CARD_DENSITIES[density];
     const phase = getWorkshopPhase(occurrence, Date.parse(currentTime));
-    const isWorkshopStartingWithinNextWeek = phase === 'upcoming-next-week';
+    const isWorkshopStartingSoon = isWorkshopPhaseUpcoming(phase) && phase !== 'upcoming';
 
     return (
         <button
@@ -199,7 +199,7 @@
                     {formatCzechWorkshopRelativeDay(occurrence.startsAt, currentTime)} ·{' '}
                     {formatCzechWorkshopTimeRange(occurrence.startsAt, occurrence.endsAt)}
                 </span>
-                {isWorkshopStartingWithinNextWeek && (
+                {isWorkshopStartingSoon && (
                     <WorkshopPhaseBadge
                         phase={phase}
                         tone={appearance}
diff --git a/components/workshops/WorkshopLinksPanel.test.tsx b/components/workshops/WorkshopLinksPanel.test.tsx
index 0d3b760e290f4cf5027ca2364269abf8adacd1aa..9db3d59e76e3e4dff76d653ddb58c86d8ca06e70
--- a/components/workshops/WorkshopLinksPanel.test.tsx
+++ b/components/workshops/WorkshopLinksPanel.test.tsx
@@ -54,6 +54,15 @@
     endsAt: '2026-09-11T20:30:00+02:00',
 };
 
+const TODAY_WORKSHOP: WorkshopSummary = {
+    ...ONGOING_WORKSHOP,
+    id: 'today-workshop-id',
+    slug: 'production-ai-2026-09-10-evening',
+    title: 'Večerní workshop dnes',
+    startsAt: '2026-09-10T21:00:00+02:00',
+    endsAt: '2026-09-10T22:00:00+02:00',
+};
+
 const THIS_WEEK_WORKSHOP: WorkshopSummary = {
     ...ONGOING_WORKSHOP,
     id: 'this-week-workshop-id',
@@ -213,17 +222,27 @@
         expect(pastCard?.textContent).toContain('Proběhlo');
     });
 
-    it('gives a term in the next seven days its own badge and calendar colour', () => {
-        renderWorkshopLinksPanel([ONGOING_WORKSHOP, TOMORROW_WORKSHOP, UPCOMING_WORKSHOP]);
+    it('distinguishes today, tomorrow, and the rest of the next seven days on cards and the calendar', () => {
+        renderWorkshopLinksPanel([THIS_WEEK_WORKSHOP, TOMORROW_WORKSHOP, TODAY_WORKSHOP, UPCOMING_WORKSHOP]);
 
+        expect(findCalendarDay('2026-09-10').className).toContain(
+            getWorkshopPhaseAppearance('upcoming-today').calendarDayClassName,
+        );
         expect(findCalendarDay('2026-09-11').className).toContain(
+            getWorkshopPhaseAppearance('upcoming-tomorrow').calendarDayClassName,
+        );
+        expect(findCalendarDay('2026-09-12').className).toContain(
             getWorkshopPhaseAppearance('upcoming-next-week').calendarDayClassName,
         );
+        expect(screen.getAllByText('Dneska')).toHaveLength(2);
+        expect(screen.getAllByText('Zítra')).toHaveLength(2);
         expect(screen.getAllByText('Tento týden')).toHaveLength(2);
 
         showCardsView();
 
-        const [, upcomingNextWeekCard, upcomingCard] = findTermLinks();
+        const [todayCard, tomorrowCard, upcomingNextWeekCard, upcomingCard] = findTermLinks();
+        expect(todayCard?.textContent).toContain('Dneska');
+        expect(tomorrowCard?.textContent).toContain('Zítra');
         expect(upcomingNextWeekCard?.textContent).toContain('Tento týden');
         expect(upcomingCard?.textContent).toContain('Nadchází');
     });
diff --git a/components/workshops/workshopPhaseAppearance.ts b/components/workshops/workshopPhaseAppearance.ts
index 397626aeeca074142ce787ebea7da16101b8f4ee..81ed54d491ff2b28c62b9de95d4df343cb3676a5
--- a/components/workshops/workshopPhaseAppearance.ts
+++ b/components/workshops/workshopPhaseAppearance.ts
@@ -34,8 +34,8 @@
  * The one description of how every phase looks, wherever a term is listed
  *
  * Note: A list of cards and a calendar of the same terms say the very same thing with the very same colour - green
- *       runs right now, amber has only just been held, violet starts within a week, cyan is further ahead, and grey is
- *       history - because both of them read their colours here instead of choosing their own.
+ *       runs right now, amber has only just been held, orange starts today, blue tomorrow, violet within a week, cyan
+ *       further ahead, and grey is history - because both read their colours here instead of choosing their own.
  * Note: These colours live beside the components which wear them rather than among the rules of the application,
  *       because only the directories of the components are read for the styles the application is built with.
  */
@@ -61,6 +61,24 @@
         calendarDayClassName: 'border-room-warning/40 bg-room-warning/10 text-room-warning',
         markClassName: 'bg-room-warning',
     },
+    'upcoming-today': {
+        label: 'Dneska',
+        badgeClassNameByTone: {
+            light: 'bg-orange-100 text-orange-800',
+            room: 'bg-room-upcoming-today/15 text-room-upcoming-today ring-1 ring-inset ring-room-upcoming-today/40',
+        },
+        calendarDayClassName: 'border-room-upcoming-today/40 bg-room-upcoming-today/10 text-room-upcoming-today',
+        markClassName: 'bg-room-upcoming-today',
+    },
+    'upcoming-tomorrow': {
+        label: 'Zítra',
+        badgeClassNameByTone: {
+            light: 'bg-blue-100 text-blue-800',
+            room: 'bg-room-upcoming-tomorrow/15 text-room-upcoming-tomorrow ring-1 ring-inset ring-room-upcoming-tomorrow/40',
+        },
+        calendarDayClassName: 'border-room-upcoming-tomorrow/40 bg-room-upcoming-tomorrow/10 text-room-upcoming-tomorrow',
+        markClassName: 'bg-room-upcoming-tomorrow',
+    },
     // Note: This stays distinct from the ordinary upcoming cyan so the special badge is useful even when a reader
     //       cannot infer a date at a glance.
     'upcoming-next-week': {
diff --git a/components/workshops/workshopRoomTheme.css b/components/workshops/workshopRoomTheme.css
index 3f5f35d8211be102c381f56b40f2d3e79a68be31..47c55c58a0db06612e949785c95ffc205584b310
--- a/components/workshops/workshopRoomTheme.css
+++ b/components/workshops/workshopRoomTheme.css
@@ -19,6 +19,8 @@
     --room-success: 167 243 208;
     --room-warning: 253 230 138;
     --room-danger: 253 164 175;
+    --room-upcoming-today: 253 186 116;
+    --room-upcoming-tomorrow: 147 197 253;
     --room-upcoming: 196 181 253;
     --room-graph-pink: 244 114 182;
     --room-color-scheme: dark;
@@ -44,6 +46,8 @@
     --room-success: 6 95 70;
     --room-warning: 146 64 14;
     --room-danger: 159 18 57;
+    --room-upcoming-today: 154 52 18;
+    --room-upcoming-tomorrow: 30 64 175;
     --room-upcoming: 109 40 217;
     --room-graph-pink: 190 24 93;
     --room-color-scheme: light;
diff --git a/lib/workshops/workshopPhase.test.ts b/lib/workshops/workshopPhase.test.ts
index 746ba57a99a0364e632cefb24b1412a8ea7d26df..8b34cd8e7b7fe7caa4f15b8cf9d229c3c3b9bd14
--- a/lib/workshops/workshopPhase.test.ts
+++ b/lib/workshops/workshopPhase.test.ts
@@ -41,6 +41,14 @@
     startsAt: '2026-08-24T19:00:00+02:00',
     endsAt: '2026-08-24T20:30:00+02:00',
 };
+const UPCOMING_TODAY_WORKSHOP: WorkshopOccurrenceTiming = {
+    startsAt: '2026-08-21T21:00:00+02:00',
+    endsAt: '2026-08-21T22:00:00+02:00',
+};
+const UPCOMING_TOMORROW_WORKSHOP: WorkshopOccurrenceTiming = {
+    startsAt: '2026-08-22T19:00:00+02:00',
+    endsAt: '2026-08-22T20:00:00+02:00',
+};
 const LATER_UPCOMING_WORKSHOP: WorkshopOccurrenceTiming = {
     startsAt: '2026-10-10T19:00:00+02:00',
     endsAt: '2026-10-10T20:30:00+02:00',
@@ -54,11 +62,24 @@
     it('places an occurrence against the given moment', () => {
         expect(getWorkshopPhase(UPCOMING_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming');
         expect(getWorkshopPhase(UPCOMING_NEXT_WEEK_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming-next-week');
+        expect(getWorkshopPhase(UPCOMING_TODAY_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming-today');
+        expect(getWorkshopPhase(UPCOMING_TOMORROW_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming-tomorrow');
         expect(getWorkshopPhase(ONGOING_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('ongoing');
         expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('freshly-past');
         expect(getWorkshopPhase(PAST_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('past');
     });
 
+    it.each([
+        ['2026-08-21T21:59:59Z', '2026-08-21T22:30:00Z', 'upcoming-tomorrow'],
+        ['2026-08-21T22:00:00Z', '2026-08-21T22:30:00Z', 'upcoming-today'],
+        ['2026-12-31T22:30:00Z', '2026-12-31T23:30:00Z', 'upcoming-tomorrow'],
+        ['2026-03-28T00:15:00+01:00', '2026-03-29T23:30:00+02:00', 'upcoming-tomorrow'],
+        ['2026-03-28T23:30:00+01:00', '2026-03-30T00:15:00+02:00', 'upcoming-next-week'],
+        ['2026-10-25T00:15:00+02:00', '2026-10-25T23:30:00+01:00', 'upcoming-today'],
+    ])('uses Prague calendar days from %s to classify %s as %s', (currentTime, startsAt, expectedPhase) => {
+        expect(getWorkshopPhase({ startsAt, endsAt: null }, Date.parse(currentTime))).toBe(expectedPhase);
+    });
+
     it('keeps an occurrence freshly past for a whole day after the end recorded for it', () => {
         expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, Date.parse('2026-08-20T20:30:01+02:00'))).toBe('freshly-past');
         expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('freshly-past');
@@ -69,6 +90,8 @@
         expect(isWorkshopPhasePast('freshly-past')).toBe(true);
         expect(isWorkshopPhasePast('past')).toBe(true);
         expect(isWorkshopPhasePast('ongoing')).toBe(false);
+        expect(isWorkshopPhasePast('upcoming-today')).toBe(false);
+        expect(isWorkshopPhasePast('upcoming-tomorrow')).toBe(false);
         expect(isWorkshopPhasePast('upcoming-next-week')).toBe(false);
         expect(isWorkshopPhasePast('upcoming')).toBe(false);
     });
@@ -87,7 +110,9 @@
         expect(getWorkshopPhase(workshopAfterNextWeekBoundary, CURRENT_TIME_MILLISECONDS)).toBe('upcoming');
     });
 
-    it('counts both kinds of future term among the workshops which are still ahead', () => {
+    it('counts every kind of future term among the workshops which are still ahead', () => {
+        expect(isWorkshopPhaseUpcoming('upcoming-today')).toBe(true);
+        expect(isWorkshopPhaseUpcoming('upcoming-tomorrow')).toBe(true);
         expect(isWorkshopPhaseUpcoming('upcoming-next-week')).toBe(true);
         expect(isWorkshopPhaseUpcoming('upcoming')).toBe(true);
         expect(isWorkshopPhaseUpcoming('ongoing')).toBe(false);
@@ -106,7 +131,7 @@
         expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('ongoing');
         expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-12-24T18:00:00+01:00'))).toBe('ongoing');
         expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-08-21T18:59:59+02:00'))).toBe(
-            'upcoming-next-week',
+            'upcoming-today',
         );
     });
 
@@ -134,7 +159,7 @@
     it('keeps an occurrence ongoing until its very end and imminent until its very start', () => {
         expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T19:00:00+02:00'))).toBe('ongoing');
         expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T18:59:59+02:00'))).toBe(
-            'upcoming-next-week',
+            'upcoming-today',
         );
         expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('freshly-past');
     });
@@ -150,6 +175,8 @@
                 FRESHLY_PAST_WORKSHOP,
                 UPCOMING_WORKSHOP,
                 UPCOMING_NEXT_WEEK_WORKSHOP,
+                UPCOMING_TOMORROW_WORKSHOP,
+                UPCOMING_TODAY_WORKSHOP,
                 ONGOING_WORKSHOP,
             ],
             CURRENT_TIME_MILLISECONDS,
@@ -158,6 +185,8 @@
         expect(sortedWorkshops).toEqual([
             ONGOING_WORKSHOP,
             FRESHLY_PAST_WORKSHOP,
+            UPCOMING_TODAY_WORKSHOP,
+            UPCOMING_TOMORROW_WORKSHOP,
             UPCOMING_NEXT_WEEK_WORKSHOP,
             UPCOMING_WORKSHOP,
             LATER_UPCOMING_WORKSHOP,
@@ -183,6 +212,8 @@
                 FRESHLY_PAST_WORKSHOP,
                 UPCOMING_WORKSHOP,
                 UPCOMING_NEXT_WEEK_WORKSHOP,
+                UPCOMING_TOMORROW_WORKSHOP,
+                UPCOMING_TODAY_WORKSHOP,
                 ONGOING_WORKSHOP,
             ],
             CURRENT_TIME_MILLISECONDS,
@@ -191,6 +222,8 @@
         expect(workshopsByPhase).toEqual({
             ongoing: [ONGOING_WORKSHOP],
             'freshly-past': [FRESHLY_PAST_WORKSHOP],
+            'upcoming-today': [UPCOMING_TODAY_WORKSHOP],
+            'upcoming-tomorrow': [UPCOMING_TOMORROW_WORKSHOP],
             'upcoming-next-week': [UPCOMING_NEXT_WEEK_WORKSHOP],
             upcoming: [UPCOMING_WORKSHOP, LATER_UPCOMING_WORKSHOP],
             past: [PAST_WORKSHOP, OLDER_PAST_WORKSHOP],
@@ -199,6 +232,11 @@
 
     it('lets the most pressing phase speak for a group of occurrences', () => {
         expect(getMostProminentWorkshopPhase(['past', 'upcoming', 'ongoing'])).toBe('ongoing');
+        expect(getMostProminentWorkshopPhase(['upcoming-today', 'ongoing'])).toBe('ongoing');
+        expect(getMostProminentWorkshopPhase(['upcoming-tomorrow', 'upcoming-today', 'upcoming-next-week'])).toBe(
+            'upcoming-today',
+        );
+        expect(getMostProminentWorkshopPhase(['upcoming-next-week', 'upcoming-tomorrow'])).toBe('upcoming-tomorrow');
         expect(getMostProminentWorkshopPhase(['past', 'upcoming', 'upcoming-next-week'])).toBe('upcoming-next-week');
         expect(getMostProminentWorkshopPhase(['past', 'freshly-past', 'upcoming'])).toBe('freshly-past');
         expect(getMostProminentWorkshopPhase(['past', 'freshly-past'])).toBe('freshly-past');
diff --git a/lib/workshops/workshopPhase.ts b/lib/workshops/workshopPhase.ts
index 0ac9e8a2847c45355d50625381df66584f696536..ac1ea734d5ae6bdf4de3076aeeb2ce399051b59e
--- a/lib/workshops/workshopPhase.ts
+++ b/lib/workshops/workshopPhase.ts
@@ -1,3 +1,5 @@
+import { createCalendarDayKey } from '@/lib/calendar/calendarMonth';
+import { getRelativeCalendarDay } from '@/lib/calendar/czechRelativeDay';
 import {
     DEFAULT_WORKSHOP_DURATION_MINUTES,
     FRESHLY_PAST_WORKSHOP_HOURS,
@@ -6,6 +8,7 @@
 
 const MILLISECONDS_PER_MINUTE = 60 * 1000;
 const MILLISECONDS_PER_HOUR = 60 * MILLISECONDS_PER_MINUTE;
+const WORKSHOP_TIME_ZONE = 'Europe/Prague';
 
 /**
  * Where one occurrence currently stands in time, named from the most pressing phase to the least
@@ -15,10 +18,19 @@
  *       nothing to do with what they do with a workshop of last spring.
  * Note: An occurrence which starts during the next seven days is also a phase of its own, so a schedule can call
  *       attention to the terms somebody still has time to plan for without each surface calculating that window again.
+ *       Today and tomorrow take precedence within that window, using Prague calendar days rather than elapsed hours.
  * Note: This order is what ranks the phases wherever they are listed, coloured, or grouped, so a phase is placed among
  *       the others only here.
  */
-export const WORKSHOP_PHASE_VALUES = ['ongoing', 'freshly-past', 'upcoming-next-week', 'upcoming', 'past'] as const;
+export const WORKSHOP_PHASE_VALUES = [
+    'ongoing',
+    'freshly-past',
+    'upcoming-today',
+    'upcoming-tomorrow',
+    'upcoming-next-week',
+    'upcoming',
+    'past',
+] as const;
 
 export type WorkshopPhase = (typeof WORKSHOP_PHASE_VALUES)[number];
 
@@ -41,7 +53,12 @@
  *       badge.
  */
 export function isWorkshopPhaseUpcoming(phase: WorkshopPhase): boolean {
-    return phase === 'upcoming-next-week' || phase === 'upcoming';
+    return (
+        phase === 'upcoming-today' ||
+        phase === 'upcoming-tomorrow' ||
+        phase === 'upcoming-next-week' ||
+        phase === 'upcoming'
+    );
 }
 
 /**
@@ -127,6 +144,17 @@
 ): WorkshopPhase {
     const startsAtMilliseconds = Date.parse(occurrence.startsAt);
     if (isWorkshopStartingWithinNextWeek(startsAtMilliseconds, currentTimeMilliseconds)) {
+        const relativeDay = getRelativeCalendarDay(
+            createCalendarDayKey(occurrence.startsAt, WORKSHOP_TIME_ZONE),
+            createCalendarDayKey(new Date(currentTimeMilliseconds).toISOString(), WORKSHOP_TIME_ZONE),
+        );
+        if (relativeDay === 'today') {
+            return 'upcoming-today';
+        }
+        if (relativeDay === 'tomorrow') {
+            return 'upcoming-tomorrow';
+        }
+
         return 'upcoming-next-week';
     }
 
@@ -207,6 +235,8 @@
     const workshopsByPhase: Record<WorkshopPhase, TWorkshop[]> = {
         ongoing: [],
         'freshly-past': [],
+        'upcoming-today': [],
+        'upcoming-tomorrow': [],
         'upcoming-next-week': [],
         upcoming: [],
         past: [],
diff --git a/tailwind.config.ts b/tailwind.config.ts
index 8019f41f1539feedb45d402a70dd8ffff9aca8ad..db919851e4a1a55643569375d67dc665ab75a01b
--- a/tailwind.config.ts
+++ b/tailwind.config.ts
@@ -51,6 +51,8 @@
                     success: 'rgb(var(--room-success) / <alpha-value>)',
                     warning: 'rgb(var(--room-warning) / <alpha-value>)',
                     danger: 'rgb(var(--room-danger) / <alpha-value>)',
+                    'upcoming-today': 'rgb(var(--room-upcoming-today) / <alpha-value>)',
+                    'upcoming-tomorrow': 'rgb(var(--room-upcoming-tomorrow) / <alpha-value>)',
                     upcoming: 'rgb(var(--room-upcoming) / <alpha-value>)',
                 },
                 background: 'hsl(var(--background))',

 succeeded in 2124ms:

 RUN  v3.2.4 /Users/hejny/work/aldaron

 ✓ lib/calendar/czechRelativeDay.test.ts (7 tests) 6ms
 ✓ lib/workshops/workshopPhase.test.ts (20 tests) 28ms
 ✓ lib/workshops/workshopDate.test.ts (4 tests) 4ms
 ✓ lib/events/eventListing.test.ts (6 tests) 24ms
 ✓ businesses/online-workshop/participant/WorkshopWrapUpNavigation.test.tsx (4 tests) 118ms
 ✓ businesses/workshop-admin/WorkshopSelectorCardList.test.tsx (11 tests) 189ms
 ✓ components/workshops/WorkshopLinksPanel.test.tsx (16 tests) 434ms
 ✓ businesses/online-workshop/participant/WorkshopStage.test.tsx (19 tests) 170ms
 ✓ businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx (8 tests) 158ms

 Test Files  9 passed (9)
      Tests  95 passed (95)
   Start at  16:21:21
   Duration  1.55s (transform 780ms, setup 0ms, collect 2.25s, tests 1.13s, environment 1.74s, prepare 488ms)


exec
/bin/zsh -lc "git diff --check -- . ':"'!prompts/2026-09-0171-freshly-upcomming-events.md'"' && git diff --stat && rg --files businesses/online-workshop/participant | rg 'WrapUp.*test|Stage.*test'" in /Users/hejny/work/aldaron
 succeeded in 0ms:
 AGENTS.md                                          | 12 +++---
 .../participant/OnlineWorkshopRoomTermPicker.tsx   |  9 ++---
 .../OnlineWorkshopSelectedTermRoom.test.tsx        | 22 ++++++++++-
 .../WorkshopSelectorCardList.test.tsx              | 26 ++++++++++++-
 .../workshop-admin/WorkshopSelectorCardList.tsx    |  2 +-
 changelog/_current-preversion.md                   |  4 ++
 components/events/EventTermOptionCard.tsx          |  6 +--
 components/workshops/WorkshopLinksPanel.test.tsx   | 25 ++++++++++--
 components/workshops/workshopPhaseAppearance.ts    | 22 ++++++++++-
 components/workshops/workshopRoomTheme.css         |  4 ++
 lib/workshops/workshopPhase.test.ts                | 44 ++++++++++++++++++++--
 lib/workshops/workshopPhase.ts                     | 34 ++++++++++++++++-
 prompts/2026-09-0171-freshly-upcomming-events.md   |  3 +-
 tailwind.config.ts                                 |  2 +
 14 files changed, 186 insertions(+), 29 deletions(-)
businesses/online-workshop/participant/WorkshopStage.test.tsx
businesses/online-workshop/participant/WorkshopWrapUpPdfDownload.test.tsx
businesses/online-workshop/participant/WorkshopWrapUpNavigation.test.tsx

exec
/bin/zsh -lc 'npm run lint -- --file lib/workshops/workshopPhase.ts --file components/workshops/workshopPhaseAppearance.ts --file components/events/EventTermOptionCard.tsx --file businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx --file businesses/workshop-admin/WorkshopSelectorCardList.tsx --file lib/workshops/workshopPhase.test.ts --file components/workshops/WorkshopLinksPanel.test.tsx --file businesses/workshop-admin/WorkshopSelectorCardList.test.tsx --file businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx --file tailwind.config.ts' in /Users/hejny/work/aldaron
exec
/bin/zsh -lc 'npm run test-types > /tmp/aldaron-today-tomorrow-build.log 2>&1' in /Users/hejny/work/aldaron
diff --git a/AGENTS.md b/AGENTS.md
index 8557778d230f0715e09a335fd303bf86015c32dd..d000c5fd0c0fe752490b216922648f5e0d80e798
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -21,8 +21,9 @@
   but all use one registration form. `/cs/online-workshop/dekujeme` is the
   full-load conversion page; `/participant` is the live room. Its waiting room
   offers every published term as the same term cards the landing page registers
-  with: running and upcoming ones first, with a special `Tento týden` badge for a
-  term beginning within the next seven rolling days, then the ones which ended
+  with: running and upcoming ones first, with `Dneska` and `Zítra` badges for terms
+  beginning today or tomorrow in Prague and `Tento týden` for the remaining terms
+  beginning within the next seven rolling days, then the ones which ended
   within the last day, and the older finished ones behind a disclosure.
   Picking one changes the room being connected to and the `workshop` parameter,
   without losing the name and e-mail already typed.
@@ -91,8 +92,9 @@
   a replay badge. Card data includes no feedback. Where a term stands in
   time is decided
   once, in `lib/workshops/workshopPhase.ts`, as one of
-  five phases: ongoing, freshly past while it ended within the last
-  `FRESHLY_PAST_WORKSHOP_HOURS`, upcoming within the next seven rolling days,
+  seven phases: ongoing, freshly past while it ended within the last
+  `FRESHLY_PAST_WORKSHOP_HOURS`, upcoming today or tomorrow by Prague calendar date,
+  other upcoming within the next seven rolling days,
   other upcoming, and past. Every list, badge, and calendar colour reads that one
   answer, and everything which opens after a workshop — the wrap-up, the feedback,
   the recording — treats freshly past as over. A term with a
@@ -121,7 +123,7 @@
   nothing about registrations at all. The registration block opens the exact
   filtered `/admin/contacts` list and its shared CSV, vCard, and Book exports;
   it never creates a second contact table or serializer in workshop administration.
-  Its term picker gives ongoing, freshly past, next-seven-day, and later upcoming
+  Its term picker gives ongoing, freshly past, today, tomorrow, next-seven-day, and later upcoming
   terms their own categories, because a term which has only just been held is
   still being wrapped up and one beginning soon needs preparation; only past terms
   stay behind its history disclosure. Its unobtrusive display-settings control
diff --git a/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx b/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
index 7f931fba445fad57265cd021c65bace471ba8e0b..e64332721f4035a7a4eb12cab7db6c3ae00a0e38
--- a/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
@@ -3,7 +3,7 @@
 import { createOnlineWorkshopTermNoteText } from '@/businesses/online-workshop/onlineWorkshopTerms';
 import { EventTermOptionList } from '@/components/events/EventTermOptionList';
 import type { EventOccurrence } from '@/lib/events/eventOccurrence';
-import { groupWorkshopsByPhase } from '@/lib/workshops/workshopPhase';
+import { groupWorkshopsByPhase, isWorkshopPhaseUpcoming, WORKSHOP_PHASE_VALUES } from '@/lib/workshops/workshopPhase';
 import { ChevronDown, Clock, History, Sparkles } from 'lucide-react';
 import { useId, useMemo, useState } from 'react';
 
@@ -65,11 +65,8 @@
         () => groupWorkshopsByPhase(terms, Date.parse(currentTime)),
         [currentTime, terms],
     );
-    const currentTerms = [
-        ...termsByPhase.ongoing,
-        ...termsByPhase['upcoming-next-week'],
-        ...termsByPhase.upcoming,
-    ];
+    const currentTerms = WORKSHOP_PHASE_VALUES.filter((phase) => phase === 'ongoing' || isWorkshopPhaseUpcoming(phase))
+        .flatMap((phase) => termsByPhase[phase]);
     const freshlyPastTerms = termsByPhase['freshly-past'];
     const { past: pastTerms } = termsByPhase;
     const isSelectedTermPast = pastTerms.some((term) => term.slug === selectedTermSlug);
diff --git a/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
index 57b8fcd8dd0773a357f9328322d8d2259cbebe4c..737f320838372e58dc3deb108ce2be6a53a267aa
--- a/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
@@ -79,6 +79,13 @@
     endsAt: '2026-09-11T11:00:00+02:00',
 });
 
+const TODAY_WORKSHOP = createOnlineWorkshopTerm({
+    slug: 'online-workshop-dnes-2026-09-10',
+    title: 'Dnešní workshop',
+    startsAt: '2026-09-10T19:00:00+02:00',
+    endsAt: '2026-09-10T20:00:00+02:00',
+});
+
 const LATER_UPCOMING_WORKSHOP = createOnlineWorkshopTerm({
     slug: 'online-workshop-kontext-projektu-2026-09-14',
     title: 'Kontext projektu a agenti',
@@ -167,12 +174,23 @@
         expect(screen.getByRole('button', { name: new RegExp(PAST_WORKSHOP.title) })).toBeDefined();
     });
 
-    it('marks a term starting during the next seven days in the waiting-room picker', () => {
-        renderWaitingRoom(LATER_UPCOMING_WORKSHOP);
+    it('keeps today and tomorrow selectable with their own badges before the other next-week terms', () => {
+        renderWaitingRoom(LATER_UPCOMING_WORKSHOP, [...PUBLISHED_WORKSHOPS, TODAY_WORKSHOP]);
 
         expect(
+            screen.getByRole('button', { name: new RegExp(TODAY_WORKSHOP.title) }).textContent,
+        ).toContain('Dneska');
+        expect(
             screen.getByRole('button', { name: new RegExp(NEAREST_UPCOMING_WORKSHOP.title) }).textContent,
+        ).toContain('Zítra');
+        expect(
+            screen.getByRole('button', { name: new RegExp(LATER_UPCOMING_WORKSHOP.title) }).textContent,
         ).toContain('Tento týden');
+
+        fireEvent.click(screen.getByRole('button', { name: new RegExp(TODAY_WORKSHOP.title) }));
+
+        expect(getOpenedWorkshopSlug()).toBe(TODAY_WORKSHOP.slug);
+        expect(window.location.search).toBe(`?workshop=${TODAY_WORKSHOP.slug}`);
     });
 
     it('names the workshop which has only just been held in the open, rather than filing it into the history', () => {
diff --git a/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx b/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
index 0532d6441fc320af25f7f81a71ff4a257b382efd..3bd0a65778edd8c7191ae34a712e8c3153a2bb0c
--- a/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
+++ b/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
@@ -43,6 +43,22 @@
     startsAt: '2026-08-24T19:00:00+02:00',
     endsAt: '2026-08-24T20:30:00+02:00',
 };
+const UPCOMING_TODAY_WORKSHOP: WorkshopAdminSummary = {
+    ...UPCOMING_WORKSHOP,
+    id: 'upcoming-today-workshop-id',
+    slug: 'produkcni-kod-2026-08-21-evening',
+    title: 'Večerní workshop dnes',
+    startsAt: '2026-08-21T21:00:00+02:00',
+    endsAt: '2026-08-21T22:00:00+02:00',
+};
+const UPCOMING_TOMORROW_WORKSHOP: WorkshopAdminSummary = {
+    ...UPCOMING_WORKSHOP,
+    id: 'upcoming-tomorrow-workshop-id',
+    slug: 'produkcni-kod-2026-08-22',
+    title: 'Workshop zítra',
+    startsAt: '2026-08-22T19:00:00+02:00',
+    endsAt: '2026-08-22T20:30:00+02:00',
+};
 const FRESHLY_PAST_WORKSHOP: WorkshopAdminSummary = {
     id: 'freshly-past-workshop-id',
     kind: 'workshop',
@@ -128,22 +144,30 @@
             FRESHLY_PAST_WORKSHOP,
             UPCOMING_WORKSHOP,
             UPCOMING_NEXT_WEEK_WORKSHOP,
+            UPCOMING_TOMORROW_WORKSHOP,
+            UPCOMING_TODAY_WORKSHOP,
             ONGOING_WORKSHOP,
         ]);
 
         expect(screen.getByRole('heading', { name: 'Probíhá (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Právě proběhlo (1)' })).not.toBeNull();
+        expect(screen.getByRole('heading', { name: 'Dneska (1)' })).not.toBeNull();
+        expect(screen.getByRole('heading', { name: 'Zítra (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Tento týden (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Nadchází (1)' })).not.toBeNull();
         expect(getWorkshopCards().map((workshopCard) => workshopCard.textContent)).toEqual([
             expect.stringContaining(ONGOING_WORKSHOP.title),
             expect.stringContaining(FRESHLY_PAST_WORKSHOP.title),
+            expect.stringContaining(UPCOMING_TODAY_WORKSHOP.title),
+            expect.stringContaining(UPCOMING_TOMORROW_WORKSHOP.title),
             expect.stringContaining(UPCOMING_NEXT_WEEK_WORKSHOP.title),
             expect.stringContaining(UPCOMING_WORKSHOP.title),
         ]);
 
         expect(getWorkshopCards()[1].textContent).toContain('Právě proběhlo');
-        expect(getWorkshopCards()[2].textContent).toContain('Tento týden');
+        expect(getWorkshopCards()[2].textContent).toContain('Dneska');
+        expect(getWorkshopCards()[3].textContent).toContain('Zítra');
+        expect(getWorkshopCards()[4].textContent).toContain('Tento týden');
         expect(screen.getByRole('button', { name: 'Historie (1)' }).getAttribute('aria-expanded')).toBe('false');
     });
 
diff --git a/businesses/workshop-admin/WorkshopSelectorCardList.tsx b/businesses/workshop-admin/WorkshopSelectorCardList.tsx
index 5b7e331aceddc897620dae58f248e2bc983896f5..aa2123738032474da72d18ca79338f95ec457fdc
--- a/businesses/workshop-admin/WorkshopSelectorCardList.tsx
+++ b/businesses/workshop-admin/WorkshopSelectorCardList.tsx
@@ -86,7 +86,7 @@
 }
 
 /**
- * Offers every occurrence as a card in the five shared time categories. An administrator gets the workshop that is
+ * Offers every occurrence as a card in the shared time categories. An administrator gets the workshop that is
  * running first, the one they are wrapping up next, then the terms to prepare soon and later, while the old archive
  * remains available on demand.
  */
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index df5b4612ecafacc477bfe8dbb97475db021af62b..83d8b0f693509e0926ab81b0ce15225503d91f9c
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,5 +1,9 @@
 # Current preversion
 
+- Added `Dneska` and `Zítra` event badges ahead of `Tento týden`, based on Prague calendar dates. Shared cards,
+  calendars, landing-page term choices, and the admin picker use the same phases and theme-aware colours. Terms
+  still switch to `Probíhá` at their start and remain eligible for waiting-room choices and follow-up recommendations.
+
 - Added the **Titulky** tab at `/admin/workshops?tab=subtitles` with private Czech, English and mixed-language tracks.
   Admins can fetch available YouTube captions, generate timed subtitles from an uploaded video/audio recording,
   import or edit SRT/WebVTT, and download either format. Long recordings are decoded in the browser and transcribed
diff --git a/components/events/EventTermOptionCard.tsx b/components/events/EventTermOptionCard.tsx
index ce65036825b967fb19601515127f7890cf8ff0bc..d6f100083c022187d95746b95f83f57e8d2dd676
--- a/components/events/EventTermOptionCard.tsx
+++ b/components/events/EventTermOptionCard.tsx
@@ -4,7 +4,7 @@
 import { formatEventPrice } from '@/lib/events/eventPrice';
 import { cn } from '@/lib/utils';
 import { formatCzechWorkshopRelativeDay, formatCzechWorkshopTimeRange } from '@/lib/workshops/workshopDate';
-import { getWorkshopPhase } from '@/lib/workshops/workshopPhase';
+import { getWorkshopPhase, isWorkshopPhaseUpcoming } from '@/lib/workshops/workshopPhase';
 import type { LucideIcon } from 'lucide-react';
 
 /**
@@ -175,7 +175,7 @@
     const appearanceClassNames = EVENT_TERM_OPTION_CARD_APPEARANCES[appearance];
     const densityClassNames = EVENT_TERM_OPTION_CARD_DENSITIES[density];
     const phase = getWorkshopPhase(occurrence, Date.parse(currentTime));
-    const isWorkshopStartingWithinNextWeek = phase === 'upcoming-next-week';
+    const isWorkshopStartingSoon = isWorkshopPhaseUpcoming(phase) && phase !== 'upcoming';
 
     return (
         <button
@@ -199,7 +199,7 @@
                     {formatCzechWorkshopRelativeDay(occurrence.startsAt, currentTime)} ·{' '}
                     {formatCzechWorkshopTimeRange(occurrence.startsAt, occurrence.endsAt)}
                 </span>
-                {isWorkshopStartingWithinNextWeek && (
+                {isWorkshopStartingSoon && (
                     <WorkshopPhaseBadge
                         phase={phase}
                         tone={appearance}
diff --git a/components/workshops/WorkshopLinksPanel.test.tsx b/components/workshops/WorkshopLinksPanel.test.tsx
index 0d3b760e290f4cf5027ca2364269abf8adacd1aa..9db3d59e76e3e4dff76d653ddb58c86d8ca06e70
--- a/components/workshops/WorkshopLinksPanel.test.tsx
+++ b/components/workshops/WorkshopLinksPanel.test.tsx
@@ -54,6 +54,15 @@
     endsAt: '2026-09-11T20:30:00+02:00',
 };
 
+const TODAY_WORKSHOP: WorkshopSummary = {
+    ...ONGOING_WORKSHOP,
+    id: 'today-workshop-id',
+    slug: 'production-ai-2026-09-10-evening',
+    title: 'Večerní workshop dnes',
+    startsAt: '2026-09-10T21:00:00+02:00',
+    endsAt: '2026-09-10T22:00:00+02:00',
+};
+
 const THIS_WEEK_WORKSHOP: WorkshopSummary = {
     ...ONGOING_WORKSHOP,
     id: 'this-week-workshop-id',
@@ -213,17 +222,27 @@
         expect(pastCard?.textContent).toContain('Proběhlo');
     });
 
-    it('gives a term in the next seven days its own badge and calendar colour', () => {
-        renderWorkshopLinksPanel([ONGOING_WORKSHOP, TOMORROW_WORKSHOP, UPCOMING_WORKSHOP]);
+    it('distinguishes today, tomorrow, and the rest of the next seven days on cards and the calendar', () => {
+        renderWorkshopLinksPanel([THIS_WEEK_WORKSHOP, TOMORROW_WORKSHOP, TODAY_WORKSHOP, UPCOMING_WORKSHOP]);
 
+        expect(findCalendarDay('2026-09-10').className).toContain(
+            getWorkshopPhaseAppearance('upcoming-today').calendarDayClassName,
+        );
         expect(findCalendarDay('2026-09-11').className).toContain(
+            getWorkshopPhaseAppearance('upcoming-tomorrow').calendarDayClassName,
+        );
+        expect(findCalendarDay('2026-09-12').className).toContain(
             getWorkshopPhaseAppearance('upcoming-next-week').calendarDayClassName,
         );
+        expect(screen.getAllByText('Dneska')).toHaveLength(2);
+        expect(screen.getAllByText('Zítra')).toHaveLength(2);
         expect(screen.getAllByText('Tento týden')).toHaveLength(2);
 
         showCardsView();
 
-        const [, upcomingNextWeekCard, upcomingCard] = findTermLinks();
+        const [todayCard, tomorrowCard, upcomingNextWeekCard, upcomingCard] = findTermLinks();
+        expect(todayCard?.textContent).toContain('Dneska');
+        expect(tomorrowCard?.textContent).toContain('Zítra');
         expect(upcomingNextWeekCard?.textContent).toContain('Tento týden');
         expect(upcomingCard?.textContent).toContain('Nadchází');
     });
diff --git a/components/workshops/workshopPhaseAppearance.ts b/components/workshops/workshopPhaseAppearance.ts
index 397626aeeca074142ce787ebea7da16101b8f4ee..81ed54d491ff2b28c62b9de95d4df343cb3676a5
--- a/components/workshops/workshopPhaseAppearance.ts
+++ b/components/workshops/workshopPhaseAppearance.ts
@@ -34,8 +34,8 @@
  * The one description of how every phase looks, wherever a term is listed
  *
  * Note: A list of cards and a calendar of the same terms say the very same thing with the very same colour - green
- *       runs right now, amber has only just been held, violet starts within a week, cyan is further ahead, and grey is
- *       history - because both of them read their colours here instead of choosing their own.
+ *       runs right now, amber has only just been held, orange starts today, blue tomorrow, violet within a week, cyan
+ *       further ahead, and grey is history - because both read their colours here instead of choosing their own.
  * Note: These colours live beside the components which wear them rather than among the rules of the application,
  *       because only the directories of the components are read for the styles the application is built with.
  */
@@ -61,6 +61,24 @@
         calendarDayClassName: 'border-room-warning/40 bg-room-warning/10 text-room-warning',
         markClassName: 'bg-room-warning',
     },
+    'upcoming-today': {
+        label: 'Dneska',
+        badgeClassNameByTone: {
+            light: 'bg-orange-100 text-orange-800',
+            room: 'bg-room-upcoming-today/15 text-room-upcoming-today ring-1 ring-inset ring-room-upcoming-today/40',
+        },
+        calendarDayClassName: 'border-room-upcoming-today/40 bg-room-upcoming-today/10 text-room-upcoming-today',
+        markClassName: 'bg-room-upcoming-today',
+    },
+    'upcoming-tomorrow': {
+        label: 'Zítra',
+        badgeClassNameByTone: {
+            light: 'bg-blue-100 text-blue-800',
+            room: 'bg-room-upcoming-tomorrow/15 text-room-upcoming-tomorrow ring-1 ring-inset ring-room-upcoming-tomorrow/40',
+        },
+        calendarDayClassName: 'border-room-upcoming-tomorrow/40 bg-room-upcoming-tomorrow/10 text-room-upcoming-tomorrow',
+        markClassName: 'bg-room-upcoming-tomorrow',
+    },
     // Note: This stays distinct from the ordinary upcoming cyan so the special badge is useful even when a reader
     //       cannot infer a date at a glance.
     'upcoming-next-week': {
diff --git a/components/workshops/workshopRoomTheme.css b/components/workshops/workshopRoomTheme.css
index 3f5f35d8211be102c381f56b40f2d3e79a68be31..47c55c58a0db06612e949785c95ffc205584b310
--- a/components/workshops/workshopRoomTheme.css
+++ b/components/workshops/workshopRoomTheme.css
@@ -19,6 +19,8 @@
     --room-success: 167 243 208;
     --room-warning: 253 230 138;
     --room-danger: 253 164 175;
+    --room-upcoming-today: 253 186 116;
+    --room-upcoming-tomorrow: 147 197 253;
     --room-upcoming: 196 181 253;
     --room-graph-pink: 244 114 182;
     --room-color-scheme: dark;
@@ -44,6 +46,8 @@
     --room-success: 6 95 70;
     --room-warning: 146 64 14;
     --room-danger: 159 18 57;
+    --room-upcoming-today: 154 52 18;
+    --room-upcoming-tomorrow: 30 64 175;
     --room-upcoming: 109 40 217;
     --room-graph-pink: 190 24 93;
     --room-color-scheme: light;
diff --git a/lib/workshops/workshopPhase.test.ts b/lib/workshops/workshopPhase.test.ts
index 746ba57a99a0364e632cefb24b1412a8ea7d26df..8b34cd8e7b7fe7caa4f15b8cf9d229c3c3b9bd14
--- a/lib/workshops/workshopPhase.test.ts
+++ b/lib/workshops/workshopPhase.test.ts
@@ -41,6 +41,14 @@
     startsAt: '2026-08-24T19:00:00+02:00',
     endsAt: '2026-08-24T20:30:00+02:00',
 };
+const UPCOMING_TODAY_WORKSHOP: WorkshopOccurrenceTiming = {
+    startsAt: '2026-08-21T21:00:00+02:00',
+    endsAt: '2026-08-21T22:00:00+02:00',
+};
+const UPCOMING_TOMORROW_WORKSHOP: WorkshopOccurrenceTiming = {
+    startsAt: '2026-08-22T19:00:00+02:00',
+    endsAt: '2026-08-22T20:00:00+02:00',
+};
 const LATER_UPCOMING_WORKSHOP: WorkshopOccurrenceTiming = {
     startsAt: '2026-10-10T19:00:00+02:00',
     endsAt: '2026-10-10T20:30:00+02:00',
@@ -54,11 +62,24 @@
     it('places an occurrence against the given moment', () => {
         expect(getWorkshopPhase(UPCOMING_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming');
         expect(getWorkshopPhase(UPCOMING_NEXT_WEEK_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming-next-week');
+        expect(getWorkshopPhase(UPCOMING_TODAY_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming-today');
+        expect(getWorkshopPhase(UPCOMING_TOMORROW_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming-tomorrow');
         expect(getWorkshopPhase(ONGOING_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('ongoing');
         expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('freshly-past');
         expect(getWorkshopPhase(PAST_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('past');
     });
 
+    it.each([
+        ['2026-08-21T21:59:59Z', '2026-08-21T22:30:00Z', 'upcoming-tomorrow'],
+        ['2026-08-21T22:00:00Z', '2026-08-21T22:30:00Z', 'upcoming-today'],
+        ['2026-12-31T22:30:00Z', '2026-12-31T23:30:00Z', 'upcoming-tomorrow'],
+        ['2026-03-28T00:15:00+01:00', '2026-03-29T23:30:00+02:00', 'upcoming-tomorrow'],
+        ['2026-03-28T23:30:00+01:00', '2026-03-30T00:15:00+02:00', 'upcoming-next-week'],
+        ['2026-10-25T00:15:00+02:00', '2026-10-25T23:30:00+01:00', 'upcoming-today'],
+    ])('uses Prague calendar days from %s to classify %s as %s', (currentTime, startsAt, expectedPhase) => {
+        expect(getWorkshopPhase({ startsAt, endsAt: null }, Date.parse(currentTime))).toBe(expectedPhase);
+    });
+
     it('keeps an occurrence freshly past for a whole day after the end recorded for it', () => {
         expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, Date.parse('2026-08-20T20:30:01+02:00'))).toBe('freshly-past');
         expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('freshly-past');
@@ -69,6 +90,8 @@
         expect(isWorkshopPhasePast('freshly-past')).toBe(true);
         expect(isWorkshopPhasePast('past')).toBe(true);
         expect(isWorkshopPhasePast('ongoing')).toBe(false);
+        expect(isWorkshopPhasePast('upcoming-today')).toBe(false);
+        expect(isWorkshopPhasePast('upcoming-tomorrow')).toBe(false);
         expect(isWorkshopPhasePast('upcoming-next-week')).toBe(false);
         expect(isWorkshopPhasePast('upcoming')).toBe(false);
     });
@@ -87,7 +110,9 @@
         expect(getWorkshopPhase(workshopAfterNextWeekBoundary, CURRENT_TIME_MILLISECONDS)).toBe('upcoming');
     });
 
-    it('counts both kinds of future term among the workshops which are still ahead', () => {
+    it('counts every kind of future term among the workshops which are still ahead', () => {
+        expect(isWorkshopPhaseUpcoming('upcoming-today')).toBe(true);
+        expect(isWorkshopPhaseUpcoming('upcoming-tomorrow')).toBe(true);
         expect(isWorkshopPhaseUpcoming('upcoming-next-week')).toBe(true);
         expect(isWorkshopPhaseUpcoming('upcoming')).toBe(true);
         expect(isWorkshopPhaseUpcoming('ongoing')).toBe(false);
@@ -106,7 +131,7 @@
         expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('ongoing');
         expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-12-24T18:00:00+01:00'))).toBe('ongoing');
         expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-08-21T18:59:59+02:00'))).toBe(
-            'upcoming-next-week',
+            'upcoming-today',
         );
     });
 
@@ -134,7 +159,7 @@
     it('keeps an occurrence ongoing until its very end and imminent until its very start', () => {
         expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T19:00:00+02:00'))).toBe('ongoing');
         expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T18:59:59+02:00'))).toBe(
-            'upcoming-next-week',
+            'upcoming-today',
         );
         expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('freshly-past');
     });
@@ -150,6 +175,8 @@
                 FRESHLY_PAST_WORKSHOP,
                 UPCOMING_WORKSHOP,
                 UPCOMING_NEXT_WEEK_WORKSHOP,
+                UPCOMING_TOMORROW_WORKSHOP,
+                UPCOMING_TODAY_WORKSHOP,
                 ONGOING_WORKSHOP,
             ],
             CURRENT_TIME_MILLISECONDS,
@@ -158,6 +185,8 @@
         expect(sortedWorkshops).toEqual([
             ONGOING_WORKSHOP,
             FRESHLY_PAST_WORKSHOP,
+            UPCOMING_TODAY_WORKSHOP,
+            UPCOMING_TOMORROW_WORKSHOP,
             UPCOMING_NEXT_WEEK_WORKSHOP,
             UPCOMING_WORKSHOP,
             LATER_UPCOMING_WORKSHOP,
@@ -183,6 +212,8 @@
                 FRESHLY_PAST_WORKSHOP,
                 UPCOMING_WORKSHOP,
                 UPCOMING_NEXT_WEEK_WORKSHOP,
+                UPCOMING_TOMORROW_WORKSHOP,
+                UPCOMING_TODAY_WORKSHOP,
                 ONGOING_WORKSHOP,
             ],
             CURRENT_TIME_MILLISECONDS,
@@ -191,6 +222,8 @@
         expect(workshopsByPhase).toEqual({
             ongoing: [ONGOING_WORKSHOP],
             'freshly-past': [FRESHLY_PAST_WORKSHOP],
+            'upcoming-today': [UPCOMING_TODAY_WORKSHOP],
+            'upcoming-tomorrow': [UPCOMING_TOMORROW_WORKSHOP],
             'upcoming-next-week': [UPCOMING_NEXT_WEEK_WORKSHOP],
             upcoming: [UPCOMING_WORKSHOP, LATER_UPCOMING_WORKSHOP],
             past: [PAST_WORKSHOP, OLDER_PAST_WORKSHOP],
@@ -199,6 +232,11 @@
 
     it('lets the most pressing phase speak for a group of occurrences', () => {
         expect(getMostProminentWorkshopPhase(['past', 'upcoming', 'ongoing'])).toBe('ongoing');
+        expect(getMostProminentWorkshopPhase(['upcoming-today', 'ongoing'])).toBe('ongoing');
+        expect(getMostProminentWorkshopPhase(['upcoming-tomorrow', 'upcoming-today', 'upcoming-next-week'])).toBe(
+            'upcoming-today',
+        );
+        expect(getMostProminentWorkshopPhase(['upcoming-next-week', 'upcoming-tomorrow'])).toBe('upcoming-tomorrow');
         expect(getMostProminentWorkshopPhase(['past', 'upcoming', 'upcoming-next-week'])).toBe('upcoming-next-week');
         expect(getMostProminentWorkshopPhase(['past', 'freshly-past', 'upcoming'])).toBe('freshly-past');
         expect(getMostProminentWorkshopPhase(['past', 'freshly-past'])).toBe('freshly-past');
diff --git a/lib/workshops/workshopPhase.ts b/lib/workshops/workshopPhase.ts
index 0ac9e8a2847c45355d50625381df66584f696536..ac1ea734d5ae6bdf4de3076aeeb2ce399051b59e
--- a/lib/workshops/workshopPhase.ts
+++ b/lib/workshops/workshopPhase.ts
@@ -1,3 +1,5 @@
+import { createCalendarDayKey } from '@/lib/calendar/calendarMonth';
+import { getRelativeCalendarDay } from '@/lib/calendar/czechRelativeDay';
 import {
     DEFAULT_WORKSHOP_DURATION_MINUTES,
     FRESHLY_PAST_WORKSHOP_HOURS,
@@ -6,6 +8,7 @@
 
 const MILLISECONDS_PER_MINUTE = 60 * 1000;
 const MILLISECONDS_PER_HOUR = 60 * MILLISECONDS_PER_MINUTE;
+const WORKSHOP_TIME_ZONE = 'Europe/Prague';
 
 /**
  * Where one occurrence currently stands in time, named from the most pressing phase to the least
@@ -15,10 +18,19 @@
  *       nothing to do with what they do with a workshop of last spring.
  * Note: An occurrence which starts during the next seven days is also a phase of its own, so a schedule can call
  *       attention to the terms somebody still has time to plan for without each surface calculating that window again.
+ *       Today and tomorrow take precedence within that window, using Prague calendar days rather than elapsed hours.
  * Note: This order is what ranks the phases wherever they are listed, coloured, or grouped, so a phase is placed among
  *       the others only here.
  */
-export const WORKSHOP_PHASE_VALUES = ['ongoing', 'freshly-past', 'upcoming-next-week', 'upcoming', 'past'] as const;
+export const WORKSHOP_PHASE_VALUES = [
+    'ongoing',
+    'freshly-past',
+    'upcoming-today',
+    'upcoming-tomorrow',
+    'upcoming-next-week',
+    'upcoming',
+    'past',
+] as const;
 
 export type WorkshopPhase = (typeof WORKSHOP_PHASE_VALUES)[number];
 
@@ -41,7 +53,12 @@
  *       badge.
  */
 export function isWorkshopPhaseUpcoming(phase: WorkshopPhase): boolean {
-    return phase === 'upcoming-next-week' || phase === 'upcoming';
+    return (
+        phase === 'upcoming-today' ||
+        phase === 'upcoming-tomorrow' ||
+        phase === 'upcoming-next-week' ||
+        phase === 'upcoming'
+    );
 }
 
 /**
@@ -127,6 +144,17 @@
 ): WorkshopPhase {
     const startsAtMilliseconds = Date.parse(occurrence.startsAt);
     if (isWorkshopStartingWithinNextWeek(startsAtMilliseconds, currentTimeMilliseconds)) {
+        const relativeDay = getRelativeCalendarDay(
+            createCalendarDayKey(occurrence.startsAt, WORKSHOP_TIME_ZONE),
+            createCalendarDayKey(new Date(currentTimeMilliseconds).toISOString(), WORKSHOP_TIME_ZONE),
+        );
+        if (relativeDay === 'today') {
+            return 'upcoming-today';
+        }
+        if (relativeDay === 'tomorrow') {
+            return 'upcoming-tomorrow';
+        }
+
         return 'upcoming-next-week';
     }
 
@@ -207,6 +235,8 @@
     const workshopsByPhase: Record<WorkshopPhase, TWorkshop[]> = {
         ongoing: [],
         'freshly-past': [],
+        'upcoming-today': [],
+        'upcoming-tomorrow': [],
         'upcoming-next-week': [],
         upcoming: [],
         past: [],
diff --git a/tailwind.config.ts b/tailwind.config.ts
index 8019f41f1539feedb45d402a70dd8ffff9aca8ad..db919851e4a1a55643569375d67dc665ab75a01b
--- a/tailwind.config.ts
+++ b/tailwind.config.ts
@@ -51,6 +51,8 @@
                     success: 'rgb(var(--room-success) / <alpha-value>)',
                     warning: 'rgb(var(--room-warning) / <alpha-value>)',
                     danger: 'rgb(var(--room-danger) / <alpha-value>)',
+                    'upcoming-today': 'rgb(var(--room-upcoming-today) / <alpha-value>)',
+                    'upcoming-tomorrow': 'rgb(var(--room-upcoming-tomorrow) / <alpha-value>)',
                     upcoming: 'rgb(var(--room-upcoming) / <alpha-value>)',
                 },
                 background: 'hsl(var(--background))',

 succeeded in 2047ms:
✔ No ESLint warnings or errors

 succeeded in 25604ms:
exec
/bin/zsh -lc "tail -18 /tmp/aldaron-today-tomorrow-build.log && git status --short && rg --files -g '*preview*' -g '*screenshot*' scripts | head -30 && cat tsconfig.json" in /Users/hejny/work/aldaron
 succeeded in 0ms:
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

 M AGENTS.md
 M businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
 M businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
 M businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
 M businesses/workshop-admin/WorkshopSelectorCardList.tsx
 M changelog/_current-preversion.md
 M components/events/EventTermOptionCard.tsx
 M components/workshops/WorkshopLinksPanel.test.tsx
 M components/workshops/workshopPhaseAppearance.ts
 M components/workshops/workshopRoomTheme.css
 M lib/workshops/workshopPhase.test.ts
 M lib/workshops/workshopPhase.ts
 M prompts/2026-09-0171-freshly-upcomming-events.md
 M tailwind.config.ts
{
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": [
        "./*"
      ],
      "@books/*": [
        "../books/*.book"
      ]
      // <- Note: [📖] Allow books to be imported
      // TODO: [🧵]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    "next-env.d.ts",
    "out/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "out/dev/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}

diff --git a/AGENTS.md b/AGENTS.md
index 8557778d230f0715e09a335fd303bf86015c32dd..d000c5fd0c0fe752490b216922648f5e0d80e798
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -21,8 +21,9 @@
   but all use one registration form. `/cs/online-workshop/dekujeme` is the
   full-load conversion page; `/participant` is the live room. Its waiting room
   offers every published term as the same term cards the landing page registers
-  with: running and upcoming ones first, with a special `Tento týden` badge for a
-  term beginning within the next seven rolling days, then the ones which ended
+  with: running and upcoming ones first, with `Dneska` and `Zítra` badges for terms
+  beginning today or tomorrow in Prague and `Tento týden` for the remaining terms
+  beginning within the next seven rolling days, then the ones which ended
   within the last day, and the older finished ones behind a disclosure.
   Picking one changes the room being connected to and the `workshop` parameter,
   without losing the name and e-mail already typed.
@@ -91,8 +92,9 @@
   a replay badge. Card data includes no feedback. Where a term stands in
   time is decided
   once, in `lib/workshops/workshopPhase.ts`, as one of
-  five phases: ongoing, freshly past while it ended within the last
-  `FRESHLY_PAST_WORKSHOP_HOURS`, upcoming within the next seven rolling days,
+  seven phases: ongoing, freshly past while it ended within the last
+  `FRESHLY_PAST_WORKSHOP_HOURS`, upcoming today or tomorrow by Prague calendar date,
+  other upcoming within the next seven rolling days,
   other upcoming, and past. Every list, badge, and calendar colour reads that one
   answer, and everything which opens after a workshop — the wrap-up, the feedback,
   the recording — treats freshly past as over. A term with a
@@ -121,7 +123,7 @@
   nothing about registrations at all. The registration block opens the exact
   filtered `/admin/contacts` list and its shared CSV, vCard, and Book exports;
   it never creates a second contact table or serializer in workshop administration.
-  Its term picker gives ongoing, freshly past, next-seven-day, and later upcoming
+  Its term picker gives ongoing, freshly past, today, tomorrow, next-seven-day, and later upcoming
   terms their own categories, because a term which has only just been held is
   still being wrapped up and one beginning soon needs preparation; only past terms
   stay behind its history disclosure. Its unobtrusive display-settings control
diff --git a/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx b/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
index 7f931fba445fad57265cd021c65bace471ba8e0b..e64332721f4035a7a4eb12cab7db6c3ae00a0e38
--- a/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
@@ -3,7 +3,7 @@
 import { createOnlineWorkshopTermNoteText } from '@/businesses/online-workshop/onlineWorkshopTerms';
 import { EventTermOptionList } from '@/components/events/EventTermOptionList';
 import type { EventOccurrence } from '@/lib/events/eventOccurrence';
-import { groupWorkshopsByPhase } from '@/lib/workshops/workshopPhase';
+import { groupWorkshopsByPhase, isWorkshopPhaseUpcoming, WORKSHOP_PHASE_VALUES } from '@/lib/workshops/workshopPhase';
 import { ChevronDown, Clock, History, Sparkles } from 'lucide-react';
 import { useId, useMemo, useState } from 'react';
 
@@ -65,11 +65,8 @@
         () => groupWorkshopsByPhase(terms, Date.parse(currentTime)),
         [currentTime, terms],
     );
-    const currentTerms = [
-        ...termsByPhase.ongoing,
-        ...termsByPhase['upcoming-next-week'],
-        ...termsByPhase.upcoming,
-    ];
+    const currentTerms = WORKSHOP_PHASE_VALUES.filter((phase) => phase === 'ongoing' || isWorkshopPhaseUpcoming(phase))
+        .flatMap((phase) => termsByPhase[phase]);
     const freshlyPastTerms = termsByPhase['freshly-past'];
     const { past: pastTerms } = termsByPhase;
     const isSelectedTermPast = pastTerms.some((term) => term.slug === selectedTermSlug);
diff --git a/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
index 57b8fcd8dd0773a357f9328322d8d2259cbebe4c..737f320838372e58dc3deb108ce2be6a53a267aa
--- a/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
@@ -79,6 +79,13 @@
     endsAt: '2026-09-11T11:00:00+02:00',
 });
 
+const TODAY_WORKSHOP = createOnlineWorkshopTerm({
+    slug: 'online-workshop-dnes-2026-09-10',
+    title: 'Dnešní workshop',
+    startsAt: '2026-09-10T19:00:00+02:00',
+    endsAt: '2026-09-10T20:00:00+02:00',
+});
+
 const LATER_UPCOMING_WORKSHOP = createOnlineWorkshopTerm({
     slug: 'online-workshop-kontext-projektu-2026-09-14',
     title: 'Kontext projektu a agenti',
@@ -167,12 +174,23 @@
         expect(screen.getByRole('button', { name: new RegExp(PAST_WORKSHOP.title) })).toBeDefined();
     });
 
-    it('marks a term starting during the next seven days in the waiting-room picker', () => {
-        renderWaitingRoom(LATER_UPCOMING_WORKSHOP);
+    it('keeps today and tomorrow selectable with their own badges before the other next-week terms', () => {
+        renderWaitingRoom(LATER_UPCOMING_WORKSHOP, [...PUBLISHED_WORKSHOPS, TODAY_WORKSHOP]);
 
         expect(
+            screen.getByRole('button', { name: new RegExp(TODAY_WORKSHOP.title) }).textContent,
+        ).toContain('Dneska');
+        expect(
             screen.getByRole('button', { name: new RegExp(NEAREST_UPCOMING_WORKSHOP.title) }).textContent,
+        ).toContain('Zítra');
+        expect(
+            screen.getByRole('button', { name: new RegExp(LATER_UPCOMING_WORKSHOP.title) }).textContent,
         ).toContain('Tento týden');
+
+        fireEvent.click(screen.getByRole('button', { name: new RegExp(TODAY_WORKSHOP.title) }));
+
+        expect(getOpenedWorkshopSlug()).toBe(TODAY_WORKSHOP.slug);
+        expect(window.location.search).toBe(`?workshop=${TODAY_WORKSHOP.slug}`);
     });
 
     it('names the workshop which has only just been held in the open, rather than filing it into the history', () => {
diff --git a/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx b/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
index 0532d6441fc320af25f7f81a71ff4a257b382efd..3bd0a65778edd8c7191ae34a712e8c3153a2bb0c
--- a/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
+++ b/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
@@ -43,6 +43,22 @@
     startsAt: '2026-08-24T19:00:00+02:00',
     endsAt: '2026-08-24T20:30:00+02:00',
 };
+const UPCOMING_TODAY_WORKSHOP: WorkshopAdminSummary = {
+    ...UPCOMING_WORKSHOP,
+    id: 'upcoming-today-workshop-id',
+    slug: 'produkcni-kod-2026-08-21-evening',
+    title: 'Večerní workshop dnes',
+    startsAt: '2026-08-21T21:00:00+02:00',
+    endsAt: '2026-08-21T22:00:00+02:00',
+};
+const UPCOMING_TOMORROW_WORKSHOP: WorkshopAdminSummary = {
+    ...UPCOMING_WORKSHOP,
+    id: 'upcoming-tomorrow-workshop-id',
+    slug: 'produkcni-kod-2026-08-22',
+    title: 'Workshop zítra',
+    startsAt: '2026-08-22T19:00:00+02:00',
+    endsAt: '2026-08-22T20:30:00+02:00',
+};
 const FRESHLY_PAST_WORKSHOP: WorkshopAdminSummary = {
     id: 'freshly-past-workshop-id',
     kind: 'workshop',
@@ -128,22 +144,30 @@
             FRESHLY_PAST_WORKSHOP,
             UPCOMING_WORKSHOP,
             UPCOMING_NEXT_WEEK_WORKSHOP,
+            UPCOMING_TOMORROW_WORKSHOP,
+            UPCOMING_TODAY_WORKSHOP,
             ONGOING_WORKSHOP,
         ]);
 
         expect(screen.getByRole('heading', { name: 'Probíhá (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Právě proběhlo (1)' })).not.toBeNull();
+        expect(screen.getByRole('heading', { name: 'Dneska (1)' })).not.toBeNull();
+        expect(screen.getByRole('heading', { name: 'Zítra (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Tento týden (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Nadchází (1)' })).not.toBeNull();
         expect(getWorkshopCards().map((workshopCard) => workshopCard.textContent)).toEqual([
             expect.stringContaining(ONGOING_WORKSHOP.title),
             expect.stringContaining(FRESHLY_PAST_WORKSHOP.title),
+            expect.stringContaining(UPCOMING_TODAY_WORKSHOP.title),
+            expect.stringContaining(UPCOMING_TOMORROW_WORKSHOP.title),
             expect.stringContaining(UPCOMING_NEXT_WEEK_WORKSHOP.title),
             expect.stringContaining(UPCOMING_WORKSHOP.title),
         ]);
 
         expect(getWorkshopCards()[1].textContent).toContain('Právě proběhlo');
-        expect(getWorkshopCards()[2].textContent).toContain('Tento týden');
+        expect(getWorkshopCards()[2].textContent).toContain('Dneska');
+        expect(getWorkshopCards()[3].textContent).toContain('Zítra');
+        expect(getWorkshopCards()[4].textContent).toContain('Tento týden');
         expect(screen.getByRole('button', { name: 'Historie (1)' }).getAttribute('aria-expanded')).toBe('false');
     });
 
diff --git a/businesses/workshop-admin/WorkshopSelectorCardList.tsx b/businesses/workshop-admin/WorkshopSelectorCardList.tsx
index 5b7e331aceddc897620dae58f248e2bc983896f5..aa2123738032474da72d18ca79338f95ec457fdc
--- a/businesses/workshop-admin/WorkshopSelectorCardList.tsx
+++ b/businesses/workshop-admin/WorkshopSelectorCardList.tsx
@@ -86,7 +86,7 @@
 }
 
 /**
- * Offers every occurrence as a card in the five shared time categories. An administrator gets the workshop that is
+ * Offers every occurrence as a card in the shared time categories. An administrator gets the workshop that is
  * running first, the one they are wrapping up next, then the terms to prepare soon and later, while the old archive
  * remains available on demand.
  */
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index df5b4612ecafacc477bfe8dbb97475db021af62b..83d8b0f693509e0926ab81b0ce15225503d91f9c
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,5 +1,9 @@
 # Current preversion
 
+- Added `Dneska` and `Zítra` event badges ahead of `Tento týden`, based on Prague calendar dates. Shared cards,
+  calendars, landing-page term choices, and the admin picker use the same phases and theme-aware colours. Terms
+  still switch to `Probíhá` at their start and remain eligible for waiting-room choices and follow-up recommendations.
+
 - Added the **Titulky** tab at `/admin/workshops?tab=subtitles` with private Czech, English and mixed-language tracks.
   Admins can fetch available YouTube captions, generate timed subtitles from an uploaded video/audio recording,
   import or edit SRT/WebVTT, and download either format. Long recordings are decoded in the browser and transcribed
diff --git a/components/events/EventTermOptionCard.tsx b/components/events/EventTermOptionCard.tsx
index ce65036825b967fb19601515127f7890cf8ff0bc..d6f100083c022187d95746b95f83f57e8d2dd676
--- a/components/events/EventTermOptionCard.tsx
+++ b/components/events/EventTermOptionCard.tsx
@@ -4,7 +4,7 @@
 import { formatEventPrice } from '@/lib/events/eventPrice';
 import { cn } from '@/lib/utils';
 import { formatCzechWorkshopRelativeDay, formatCzechWorkshopTimeRange } from '@/lib/workshops/workshopDate';
-import { getWorkshopPhase } from '@/lib/workshops/workshopPhase';
+import { getWorkshopPhase, isWorkshopPhaseUpcoming } from '@/lib/workshops/workshopPhase';
 import type { LucideIcon } from 'lucide-react';
 
 /**
@@ -175,7 +175,7 @@
     const appearanceClassNames = EVENT_TERM_OPTION_CARD_APPEARANCES[appearance];
     const densityClassNames = EVENT_TERM_OPTION_CARD_DENSITIES[density];
     const phase = getWorkshopPhase(occurrence, Date.parse(currentTime));
-    const isWorkshopStartingWithinNextWeek = phase === 'upcoming-next-week';
+    const isWorkshopStartingSoon = isWorkshopPhaseUpcoming(phase) && phase !== 'upcoming';
 
     return (
         <button
@@ -199,7 +199,7 @@
                     {formatCzechWorkshopRelativeDay(occurrence.startsAt, currentTime)} ·{' '}
                     {formatCzechWorkshopTimeRange(occurrence.startsAt, occurrence.endsAt)}
                 </span>
-                {isWorkshopStartingWithinNextWeek && (
+                {isWorkshopStartingSoon && (
                     <WorkshopPhaseBadge
                         phase={phase}
                         tone={appearance}
diff --git a/components/workshops/WorkshopLinksPanel.test.tsx b/components/workshops/WorkshopLinksPanel.test.tsx
index 0d3b760e290f4cf5027ca2364269abf8adacd1aa..9db3d59e76e3e4dff76d653ddb58c86d8ca06e70
--- a/components/workshops/WorkshopLinksPanel.test.tsx
+++ b/components/workshops/WorkshopLinksPanel.test.tsx
@@ -54,6 +54,15 @@
     endsAt: '2026-09-11T20:30:00+02:00',
 };
 
+const TODAY_WORKSHOP: WorkshopSummary = {
+    ...ONGOING_WORKSHOP,
+    id: 'today-workshop-id',
+    slug: 'production-ai-2026-09-10-evening',
+    title: 'Večerní workshop dnes',
+    startsAt: '2026-09-10T21:00:00+02:00',
+    endsAt: '2026-09-10T22:00:00+02:00',
+};
+
 const THIS_WEEK_WORKSHOP: WorkshopSummary = {
     ...ONGOING_WORKSHOP,
     id: 'this-week-workshop-id',
@@ -213,17 +222,27 @@
         expect(pastCard?.textContent).toContain('Proběhlo');
     });
 
-    it('gives a term in the next seven days its own badge and calendar colour', () => {
-        renderWorkshopLinksPanel([ONGOING_WORKSHOP, TOMORROW_WORKSHOP, UPCOMING_WORKSHOP]);
+    it('distinguishes today, tomorrow, and the rest of the next seven days on cards and the calendar', () => {
+        renderWorkshopLinksPanel([THIS_WEEK_WORKSHOP, TOMORROW_WORKSHOP, TODAY_WORKSHOP, UPCOMING_WORKSHOP]);
 
+        expect(findCalendarDay('2026-09-10').className).toContain(
+            getWorkshopPhaseAppearance('upcoming-today').calendarDayClassName,
+        );
         expect(findCalendarDay('2026-09-11').className).toContain(
+            getWorkshopPhaseAppearance('upcoming-tomorrow').calendarDayClassName,
+        );
+        expect(findCalendarDay('2026-09-12').className).toContain(
             getWorkshopPhaseAppearance('upcoming-next-week').calendarDayClassName,
         );
+        expect(screen.getAllByText('Dneska')).toHaveLength(2);
+        expect(screen.getAllByText('Zítra')).toHaveLength(2);
         expect(screen.getAllByText('Tento týden')).toHaveLength(2);
 
         showCardsView();
 
-        const [, upcomingNextWeekCard, upcomingCard] = findTermLinks();
+        const [todayCard, tomorrowCard, upcomingNextWeekCard, upcomingCard] = findTermLinks();
+        expect(todayCard?.textContent).toContain('Dneska');
+        expect(tomorrowCard?.textContent).toContain('Zítra');
         expect(upcomingNextWeekCard?.textContent).toContain('Tento týden');
         expect(upcomingCard?.textContent).toContain('Nadchází');
     });
diff --git a/components/workshops/workshopPhaseAppearance.ts b/components/workshops/workshopPhaseAppearance.ts
index 397626aeeca074142ce787ebea7da16101b8f4ee..81ed54d491ff2b28c62b9de95d4df343cb3676a5
--- a/components/workshops/workshopPhaseAppearance.ts
+++ b/components/workshops/workshopPhaseAppearance.ts
@@ -34,8 +34,8 @@
  * The one description of how every phase looks, wherever a term is listed
  *
  * Note: A list of cards and a calendar of the same terms say the very same thing with the very same colour - green
- *       runs right now, amber has only just been held, violet starts within a week, cyan is further ahead, and grey is
- *       history - because both of them read their colours here instead of choosing their own.
+ *       runs right now, amber has only just been held, orange starts today, blue tomorrow, violet within a week, cyan
+ *       further ahead, and grey is history - because both read their colours here instead of choosing their own.
  * Note: These colours live beside the components which wear them rather than among the rules of the application,
  *       because only the directories of the components are read for the styles the application is built with.
  */
@@ -61,6 +61,24 @@
         calendarDayClassName: 'border-room-warning/40 bg-room-warning/10 text-room-warning',
         markClassName: 'bg-room-warning',
     },
+    'upcoming-today': {
+        label: 'Dneska',
+        badgeClassNameByTone: {
+            light: 'bg-orange-100 text-orange-800',
+            room: 'bg-room-upcoming-today/15 text-room-upcoming-today ring-1 ring-inset ring-room-upcoming-today/40',
+        },
+        calendarDayClassName: 'border-room-upcoming-today/40 bg-room-upcoming-today/10 text-room-upcoming-today',
+        markClassName: 'bg-room-upcoming-today',
+    },
+    'upcoming-tomorrow': {
+        label: 'Zítra',
+        badgeClassNameByTone: {
+            light: 'bg-blue-100 text-blue-800',
+            room: 'bg-room-upcoming-tomorrow/15 text-room-upcoming-tomorrow ring-1 ring-inset ring-room-upcoming-tomorrow/40',
+        },
+        calendarDayClassName: 'border-room-upcoming-tomorrow/40 bg-room-upcoming-tomorrow/10 text-room-upcoming-tomorrow',
+        markClassName: 'bg-room-upcoming-tomorrow',
+    },
     // Note: This stays distinct from the ordinary upcoming cyan so the special badge is useful even when a reader
     //       cannot infer a date at a glance.
     'upcoming-next-week': {
diff --git a/components/workshops/workshopRoomTheme.css b/components/workshops/workshopRoomTheme.css
index 3f5f35d8211be102c381f56b40f2d3e79a68be31..47c55c58a0db06612e949785c95ffc205584b310
--- a/components/workshops/workshopRoomTheme.css
+++ b/components/workshops/workshopRoomTheme.css
@@ -19,6 +19,8 @@
     --room-success: 167 243 208;
     --room-warning: 253 230 138;
     --room-danger: 253 164 175;
+    --room-upcoming-today: 253 186 116;
+    --room-upcoming-tomorrow: 147 197 253;
     --room-upcoming: 196 181 253;
     --room-graph-pink: 244 114 182;
     --room-color-scheme: dark;
@@ -44,6 +46,8 @@
     --room-success: 6 95 70;
     --room-warning: 146 64 14;
     --room-danger: 159 18 57;
+    --room-upcoming-today: 154 52 18;
+    --room-upcoming-tomorrow: 30 64 175;
     --room-upcoming: 109 40 217;
     --room-graph-pink: 190 24 93;
     --room-color-scheme: light;
diff --git a/lib/workshops/workshopPhase.test.ts b/lib/workshops/workshopPhase.test.ts
index 746ba57a99a0364e632cefb24b1412a8ea7d26df..8b34cd8e7b7fe7caa4f15b8cf9d229c3c3b9bd14
--- a/lib/workshops/workshopPhase.test.ts
+++ b/lib/workshops/workshopPhase.test.ts
@@ -41,6 +41,14 @@
     startsAt: '2026-08-24T19:00:00+02:00',
     endsAt: '2026-08-24T20:30:00+02:00',
 };
+const UPCOMING_TODAY_WORKSHOP: WorkshopOccurrenceTiming = {
+    startsAt: '2026-08-21T21:00:00+02:00',
+    endsAt: '2026-08-21T22:00:00+02:00',
+};
+const UPCOMING_TOMORROW_WORKSHOP: WorkshopOccurrenceTiming = {
+    startsAt: '2026-08-22T19:00:00+02:00',
+    endsAt: '2026-08-22T20:00:00+02:00',
+};
 const LATER_UPCOMING_WORKSHOP: WorkshopOccurrenceTiming = {
     startsAt: '2026-10-10T19:00:00+02:00',
     endsAt: '2026-10-10T20:30:00+02:00',
@@ -54,11 +62,24 @@
     it('places an occurrence against the given moment', () => {
         expect(getWorkshopPhase(UPCOMING_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming');
         expect(getWorkshopPhase(UPCOMING_NEXT_WEEK_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming-next-week');
+        expect(getWorkshopPhase(UPCOMING_TODAY_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming-today');
+        expect(getWorkshopPhase(UPCOMING_TOMORROW_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming-tomorrow');
         expect(getWorkshopPhase(ONGOING_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('ongoing');
         expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('freshly-past');
         expect(getWorkshopPhase(PAST_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('past');
     });
 
+    it.each([
+        ['2026-08-21T21:59:59Z', '2026-08-21T22:30:00Z', 'upcoming-tomorrow'],
+        ['2026-08-21T22:00:00Z', '2026-08-21T22:30:00Z', 'upcoming-today'],
+        ['2026-12-31T22:30:00Z', '2026-12-31T23:30:00Z', 'upcoming-tomorrow'],
+        ['2026-03-28T00:15:00+01:00', '2026-03-29T23:30:00+02:00', 'upcoming-tomorrow'],
+        ['2026-03-28T23:30:00+01:00', '2026-03-30T00:15:00+02:00', 'upcoming-next-week'],
+        ['2026-10-25T00:15:00+02:00', '2026-10-25T23:30:00+01:00', 'upcoming-today'],
+    ])('uses Prague calendar days from %s to classify %s as %s', (currentTime, startsAt, expectedPhase) => {
+        expect(getWorkshopPhase({ startsAt, endsAt: null }, Date.parse(currentTime))).toBe(expectedPhase);
+    });
+
     it('keeps an occurrence freshly past for a whole day after the end recorded for it', () => {
         expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, Date.parse('2026-08-20T20:30:01+02:00'))).toBe('freshly-past');
         expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('freshly-past');
@@ -69,6 +90,8 @@
         expect(isWorkshopPhasePast('freshly-past')).toBe(true);
         expect(isWorkshopPhasePast('past')).toBe(true);
         expect(isWorkshopPhasePast('ongoing')).toBe(false);
+        expect(isWorkshopPhasePast('upcoming-today')).toBe(false);
+        expect(isWorkshopPhasePast('upcoming-tomorrow')).toBe(false);
         expect(isWorkshopPhasePast('upcoming-next-week')).toBe(false);
         expect(isWorkshopPhasePast('upcoming')).toBe(false);
     });
@@ -87,7 +110,9 @@
         expect(getWorkshopPhase(workshopAfterNextWeekBoundary, CURRENT_TIME_MILLISECONDS)).toBe('upcoming');
     });
 
-    it('counts both kinds of future term among the workshops which are still ahead', () => {
+    it('counts every kind of future term among the workshops which are still ahead', () => {
+        expect(isWorkshopPhaseUpcoming('upcoming-today')).toBe(true);
+        expect(isWorkshopPhaseUpcoming('upcoming-tomorrow')).toBe(true);
         expect(isWorkshopPhaseUpcoming('upcoming-next-week')).toBe(true);
         expect(isWorkshopPhaseUpcoming('upcoming')).toBe(true);
         expect(isWorkshopPhaseUpcoming('ongoing')).toBe(false);
@@ -106,7 +131,7 @@
         expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('ongoing');
         expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-12-24T18:00:00+01:00'))).toBe('ongoing');
         expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-08-21T18:59:59+02:00'))).toBe(
-            'upcoming-next-week',
+            'upcoming-today',
         );
     });
 
@@ -134,7 +159,7 @@
     it('keeps an occurrence ongoing until its very end and imminent until its very start', () => {
         expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T19:00:00+02:00'))).toBe('ongoing');
         expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T18:59:59+02:00'))).toBe(
-            'upcoming-next-week',
+            'upcoming-today',
         );
         expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('freshly-past');
     });
@@ -150,6 +175,8 @@
                 FRESHLY_PAST_WORKSHOP,
                 UPCOMING_WORKSHOP,
                 UPCOMING_NEXT_WEEK_WORKSHOP,
+                UPCOMING_TOMORROW_WORKSHOP,
+                UPCOMING_TODAY_WORKSHOP,
                 ONGOING_WORKSHOP,
             ],
             CURRENT_TIME_MILLISECONDS,
@@ -158,6 +185,8 @@
         expect(sortedWorkshops).toEqual([
             ONGOING_WORKSHOP,
             FRESHLY_PAST_WORKSHOP,
+            UPCOMING_TODAY_WORKSHOP,
+            UPCOMING_TOMORROW_WORKSHOP,
             UPCOMING_NEXT_WEEK_WORKSHOP,
             UPCOMING_WORKSHOP,
             LATER_UPCOMING_WORKSHOP,
@@ -183,6 +212,8 @@
                 FRESHLY_PAST_WORKSHOP,
                 UPCOMING_WORKSHOP,
                 UPCOMING_NEXT_WEEK_WORKSHOP,
+                UPCOMING_TOMORROW_WORKSHOP,
+                UPCOMING_TODAY_WORKSHOP,
                 ONGOING_WORKSHOP,
             ],
             CURRENT_TIME_MILLISECONDS,
@@ -191,6 +222,8 @@
         expect(workshopsByPhase).toEqual({
             ongoing: [ONGOING_WORKSHOP],
             'freshly-past': [FRESHLY_PAST_WORKSHOP],
+            'upcoming-today': [UPCOMING_TODAY_WORKSHOP],
+            'upcoming-tomorrow': [UPCOMING_TOMORROW_WORKSHOP],
             'upcoming-next-week': [UPCOMING_NEXT_WEEK_WORKSHOP],
             upcoming: [UPCOMING_WORKSHOP, LATER_UPCOMING_WORKSHOP],
             past: [PAST_WORKSHOP, OLDER_PAST_WORKSHOP],
@@ -199,6 +232,11 @@
 
     it('lets the most pressing phase speak for a group of occurrences', () => {
         expect(getMostProminentWorkshopPhase(['past', 'upcoming', 'ongoing'])).toBe('ongoing');
+        expect(getMostProminentWorkshopPhase(['upcoming-today', 'ongoing'])).toBe('ongoing');
+        expect(getMostProminentWorkshopPhase(['upcoming-tomorrow', 'upcoming-today', 'upcoming-next-week'])).toBe(
+            'upcoming-today',
+        );
+        expect(getMostProminentWorkshopPhase(['upcoming-next-week', 'upcoming-tomorrow'])).toBe('upcoming-tomorrow');
         expect(getMostProminentWorkshopPhase(['past', 'upcoming', 'upcoming-next-week'])).toBe('upcoming-next-week');
         expect(getMostProminentWorkshopPhase(['past', 'freshly-past', 'upcoming'])).toBe('freshly-past');
         expect(getMostProminentWorkshopPhase(['past', 'freshly-past'])).toBe('freshly-past');
diff --git a/lib/workshops/workshopPhase.ts b/lib/workshops/workshopPhase.ts
index 0ac9e8a2847c45355d50625381df66584f696536..ac1ea734d5ae6bdf4de3076aeeb2ce399051b59e
--- a/lib/workshops/workshopPhase.ts
+++ b/lib/workshops/workshopPhase.ts
@@ -1,3 +1,5 @@
+import { createCalendarDayKey } from '@/lib/calendar/calendarMonth';
+import { getRelativeCalendarDay } from '@/lib/calendar/czechRelativeDay';
 import {
     DEFAULT_WORKSHOP_DURATION_MINUTES,
     FRESHLY_PAST_WORKSHOP_HOURS,
@@ -6,6 +8,7 @@
 
 const MILLISECONDS_PER_MINUTE = 60 * 1000;
 const MILLISECONDS_PER_HOUR = 60 * MILLISECONDS_PER_MINUTE;
+const WORKSHOP_TIME_ZONE = 'Europe/Prague';
 
 /**
  * Where one occurrence currently stands in time, named from the most pressing phase to the least
@@ -15,10 +18,19 @@
  *       nothing to do with what they do with a workshop of last spring.
  * Note: An occurrence which starts during the next seven days is also a phase of its own, so a schedule can call
  *       attention to the terms somebody still has time to plan for without each surface calculating that window again.
+ *       Today and tomorrow take precedence within that window, using Prague calendar days rather than elapsed hours.
  * Note: This order is what ranks the phases wherever they are listed, coloured, or grouped, so a phase is placed among
  *       the others only here.
  */
-export const WORKSHOP_PHASE_VALUES = ['ongoing', 'freshly-past', 'upcoming-next-week', 'upcoming', 'past'] as const;
+export const WORKSHOP_PHASE_VALUES = [
+    'ongoing',
+    'freshly-past',
+    'upcoming-today',
+    'upcoming-tomorrow',
+    'upcoming-next-week',
+    'upcoming',
+    'past',
+] as const;
 
 export type WorkshopPhase = (typeof WORKSHOP_PHASE_VALUES)[number];
 
@@ -41,7 +53,12 @@
  *       badge.
  */
 export function isWorkshopPhaseUpcoming(phase: WorkshopPhase): boolean {
-    return phase === 'upcoming-next-week' || phase === 'upcoming';
+    return (
+        phase === 'upcoming-today' ||
+        phase === 'upcoming-tomorrow' ||
+        phase === 'upcoming-next-week' ||
+        phase === 'upcoming'
+    );
 }
 
 /**
@@ -127,6 +144,17 @@
 ): WorkshopPhase {
     const startsAtMilliseconds = Date.parse(occurrence.startsAt);
     if (isWorkshopStartingWithinNextWeek(startsAtMilliseconds, currentTimeMilliseconds)) {
+        const relativeDay = getRelativeCalendarDay(
+            createCalendarDayKey(occurrence.startsAt, WORKSHOP_TIME_ZONE),
+            createCalendarDayKey(new Date(currentTimeMilliseconds).toISOString(), WORKSHOP_TIME_ZONE),
+        );
+        if (relativeDay === 'today') {
+            return 'upcoming-today';
+        }
+        if (relativeDay === 'tomorrow') {
+            return 'upcoming-tomorrow';
+        }
+
         return 'upcoming-next-week';
     }
 
@@ -207,6 +235,8 @@
     const workshopsByPhase: Record<WorkshopPhase, TWorkshop[]> = {
         ongoing: [],
         'freshly-past': [],
+        'upcoming-today': [],
+        'upcoming-tomorrow': [],
         'upcoming-next-week': [],
         upcoming: [],
         past: [],
diff --git a/tailwind.config.ts b/tailwind.config.ts
index 8019f41f1539feedb45d402a70dd8ffff9aca8ad..db919851e4a1a55643569375d67dc665ab75a01b
--- a/tailwind.config.ts
+++ b/tailwind.config.ts
@@ -51,6 +51,8 @@
                     success: 'rgb(var(--room-success) / <alpha-value>)',
                     warning: 'rgb(var(--room-warning) / <alpha-value>)',
                     danger: 'rgb(var(--room-danger) / <alpha-value>)',
+                    'upcoming-today': 'rgb(var(--room-upcoming-today) / <alpha-value>)',
+                    'upcoming-tomorrow': 'rgb(var(--room-upcoming-tomorrow) / <alpha-value>)',
                     upcoming: 'rgb(var(--room-upcoming) / <alpha-value>)',
                 },
                 background: 'hsl(var(--background))',

codex
All 95 focused tests passed, including midnight, year rollover, and daylight-saving cases. Lint is clean, and the production build completed; I’m confirming the final TypeScript result.

exec
/bin/zsh -lc "git diff -- AGENTS.md components/events/EventTermOptionCard.tsx components/workshops/WorkshopLinksPanel.test.tsx businesses/workshop-admin/WorkshopSelectorCardList.test.tsx businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx components/workshops/workshopRoomTheme.css tailwind.config.ts && rg -n 'error|Error|warn|Warning|Compiled successfully' /tmp/aldaron-today-tomorrow-build.log" in /Users/hejny/work/aldaron
 succeeded in 0ms:
diff --git a/AGENTS.md b/AGENTS.md
index 8557778..d000c5f 100644
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -21,8 +21,9 @@ use cases, and audiences. Keep these rules current when behavior changes.
   but all use one registration form. `/cs/online-workshop/dekujeme` is the
   full-load conversion page; `/participant` is the live room. Its waiting room
   offers every published term as the same term cards the landing page registers
-  with: running and upcoming ones first, with a special `Tento týden` badge for a
-  term beginning within the next seven rolling days, then the ones which ended
+  with: running and upcoming ones first, with `Dneska` and `Zítra` badges for terms
+  beginning today or tomorrow in Prague and `Tento týden` for the remaining terms
+  beginning within the next seven rolling days, then the ones which ended
   within the last day, and the older finished ones behind a disclosure.
   Picking one changes the room being connected to and the `workshop` parameter,
   without losing the name and e-mail already typed.
@@ -91,8 +92,9 @@ use cases, and audiences. Keep these rules current when behavior changes.
   a replay badge. Card data includes no feedback. Where a term stands in
   time is decided
   once, in `lib/workshops/workshopPhase.ts`, as one of
-  five phases: ongoing, freshly past while it ended within the last
-  `FRESHLY_PAST_WORKSHOP_HOURS`, upcoming within the next seven rolling days,
+  seven phases: ongoing, freshly past while it ended within the last
+  `FRESHLY_PAST_WORKSHOP_HOURS`, upcoming today or tomorrow by Prague calendar date,
+  other upcoming within the next seven rolling days,
   other upcoming, and past. Every list, badge, and calendar colour reads that one
   answer, and everything which opens after a workshop — the wrap-up, the feedback,
   the recording — treats freshly past as over. A term with a
@@ -121,7 +123,7 @@ use cases, and audiences. Keep these rules current when behavior changes.
   nothing about registrations at all. The registration block opens the exact
   filtered `/admin/contacts` list and its shared CSV, vCard, and Book exports;
   it never creates a second contact table or serializer in workshop administration.
-  Its term picker gives ongoing, freshly past, next-seven-day, and later upcoming
+  Its term picker gives ongoing, freshly past, today, tomorrow, next-seven-day, and later upcoming
   terms their own categories, because a term which has only just been held is
   still being wrapped up and one beginning soon needs preparation; only past terms
   stay behind its history disclosure. Its unobtrusive display-settings control
diff --git a/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
index 57b8fcd..737f320 100644
--- a/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
@@ -79,6 +79,13 @@ const NEAREST_UPCOMING_WORKSHOP = createOnlineWorkshopTerm({
     endsAt: '2026-09-11T11:00:00+02:00',
 });
 
+const TODAY_WORKSHOP = createOnlineWorkshopTerm({
+    slug: 'online-workshop-dnes-2026-09-10',
+    title: 'Dnešní workshop',
+    startsAt: '2026-09-10T19:00:00+02:00',
+    endsAt: '2026-09-10T20:00:00+02:00',
+});
+
 const LATER_UPCOMING_WORKSHOP = createOnlineWorkshopTerm({
     slug: 'online-workshop-kontext-projektu-2026-09-14',
     title: 'Kontext projektu a agenti',
@@ -167,12 +174,23 @@ describe('online workshop waiting room', () => {
         expect(screen.getByRole('button', { name: new RegExp(PAST_WORKSHOP.title) })).toBeDefined();
     });
 
-    it('marks a term starting during the next seven days in the waiting-room picker', () => {
-        renderWaitingRoom(LATER_UPCOMING_WORKSHOP);
+    it('keeps today and tomorrow selectable with their own badges before the other next-week terms', () => {
+        renderWaitingRoom(LATER_UPCOMING_WORKSHOP, [...PUBLISHED_WORKSHOPS, TODAY_WORKSHOP]);
 
+        expect(
+            screen.getByRole('button', { name: new RegExp(TODAY_WORKSHOP.title) }).textContent,
+        ).toContain('Dneska');
         expect(
             screen.getByRole('button', { name: new RegExp(NEAREST_UPCOMING_WORKSHOP.title) }).textContent,
+        ).toContain('Zítra');
+        expect(
+            screen.getByRole('button', { name: new RegExp(LATER_UPCOMING_WORKSHOP.title) }).textContent,
         ).toContain('Tento týden');
+
+        fireEvent.click(screen.getByRole('button', { name: new RegExp(TODAY_WORKSHOP.title) }));
+
+        expect(getOpenedWorkshopSlug()).toBe(TODAY_WORKSHOP.slug);
+        expect(window.location.search).toBe(`?workshop=${TODAY_WORKSHOP.slug}`);
     });
 
     it('names the workshop which has only just been held in the open, rather than filing it into the history', () => {
diff --git a/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx b/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
index 0532d64..3bd0a65 100644
--- a/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
+++ b/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
@@ -43,6 +43,22 @@ const UPCOMING_NEXT_WEEK_WORKSHOP: WorkshopAdminSummary = {
     startsAt: '2026-08-24T19:00:00+02:00',
     endsAt: '2026-08-24T20:30:00+02:00',
 };
+const UPCOMING_TODAY_WORKSHOP: WorkshopAdminSummary = {
+    ...UPCOMING_WORKSHOP,
+    id: 'upcoming-today-workshop-id',
+    slug: 'produkcni-kod-2026-08-21-evening',
+    title: 'Večerní workshop dnes',
+    startsAt: '2026-08-21T21:00:00+02:00',
+    endsAt: '2026-08-21T22:00:00+02:00',
+};
+const UPCOMING_TOMORROW_WORKSHOP: WorkshopAdminSummary = {
+    ...UPCOMING_WORKSHOP,
+    id: 'upcoming-tomorrow-workshop-id',
+    slug: 'produkcni-kod-2026-08-22',
+    title: 'Workshop zítra',
+    startsAt: '2026-08-22T19:00:00+02:00',
+    endsAt: '2026-08-22T20:30:00+02:00',
+};
 const FRESHLY_PAST_WORKSHOP: WorkshopAdminSummary = {
     id: 'freshly-past-workshop-id',
     kind: 'workshop',
@@ -128,22 +144,30 @@ describe('workshop selector card list', () => {
             FRESHLY_PAST_WORKSHOP,
             UPCOMING_WORKSHOP,
             UPCOMING_NEXT_WEEK_WORKSHOP,
+            UPCOMING_TOMORROW_WORKSHOP,
+            UPCOMING_TODAY_WORKSHOP,
             ONGOING_WORKSHOP,
         ]);
 
         expect(screen.getByRole('heading', { name: 'Probíhá (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Právě proběhlo (1)' })).not.toBeNull();
+        expect(screen.getByRole('heading', { name: 'Dneska (1)' })).not.toBeNull();
+        expect(screen.getByRole('heading', { name: 'Zítra (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Tento týden (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Nadchází (1)' })).not.toBeNull();
         expect(getWorkshopCards().map((workshopCard) => workshopCard.textContent)).toEqual([
             expect.stringContaining(ONGOING_WORKSHOP.title),
             expect.stringContaining(FRESHLY_PAST_WORKSHOP.title),
+            expect.stringContaining(UPCOMING_TODAY_WORKSHOP.title),
+            expect.stringContaining(UPCOMING_TOMORROW_WORKSHOP.title),
             expect.stringContaining(UPCOMING_NEXT_WEEK_WORKSHOP.title),
             expect.stringContaining(UPCOMING_WORKSHOP.title),
         ]);
 
         expect(getWorkshopCards()[1].textContent).toContain('Právě proběhlo');
-        expect(getWorkshopCards()[2].textContent).toContain('Tento týden');
+        expect(getWorkshopCards()[2].textContent).toContain('Dneska');
+        expect(getWorkshopCards()[3].textContent).toContain('Zítra');
+        expect(getWorkshopCards()[4].textContent).toContain('Tento týden');
         expect(screen.getByRole('button', { name: 'Historie (1)' }).getAttribute('aria-expanded')).toBe('false');
     });
 
diff --git a/components/events/EventTermOptionCard.tsx b/components/events/EventTermOptionCard.tsx
index ce65036..d6f1000 100644
--- a/components/events/EventTermOptionCard.tsx
+++ b/components/events/EventTermOptionCard.tsx
@@ -4,7 +4,7 @@ import type { EventOccurrence } from '@/lib/events/eventOccurrence';
 import { formatEventPrice } from '@/lib/events/eventPrice';
 import { cn } from '@/lib/utils';
 import { formatCzechWorkshopRelativeDay, formatCzechWorkshopTimeRange } from '@/lib/workshops/workshopDate';
-import { getWorkshopPhase } from '@/lib/workshops/workshopPhase';
+import { getWorkshopPhase, isWorkshopPhaseUpcoming } from '@/lib/workshops/workshopPhase';
 import type { LucideIcon } from 'lucide-react';
 
 /**
@@ -175,7 +175,7 @@ export function EventTermOptionCard({
     const appearanceClassNames = EVENT_TERM_OPTION_CARD_APPEARANCES[appearance];
     const densityClassNames = EVENT_TERM_OPTION_CARD_DENSITIES[density];
     const phase = getWorkshopPhase(occurrence, Date.parse(currentTime));
-    const isWorkshopStartingWithinNextWeek = phase === 'upcoming-next-week';
+    const isWorkshopStartingSoon = isWorkshopPhaseUpcoming(phase) && phase !== 'upcoming';
 
     return (
         <button
@@ -199,7 +199,7 @@ export function EventTermOptionCard({
                     {formatCzechWorkshopRelativeDay(occurrence.startsAt, currentTime)} ·{' '}
                     {formatCzechWorkshopTimeRange(occurrence.startsAt, occurrence.endsAt)}
                 </span>
-                {isWorkshopStartingWithinNextWeek && (
+                {isWorkshopStartingSoon && (
                     <WorkshopPhaseBadge
                         phase={phase}
                         tone={appearance}
diff --git a/components/workshops/WorkshopLinksPanel.test.tsx b/components/workshops/WorkshopLinksPanel.test.tsx
index 0d3b760..9db3d59 100644
--- a/components/workshops/WorkshopLinksPanel.test.tsx
+++ b/components/workshops/WorkshopLinksPanel.test.tsx
@@ -54,6 +54,15 @@ const TOMORROW_WORKSHOP: WorkshopSummary = {
     endsAt: '2026-09-11T20:30:00+02:00',
 };
 
+const TODAY_WORKSHOP: WorkshopSummary = {
+    ...ONGOING_WORKSHOP,
+    id: 'today-workshop-id',
+    slug: 'production-ai-2026-09-10-evening',
+    title: 'Večerní workshop dnes',
+    startsAt: '2026-09-10T21:00:00+02:00',
+    endsAt: '2026-09-10T22:00:00+02:00',
+};
+
 const THIS_WEEK_WORKSHOP: WorkshopSummary = {
     ...ONGOING_WORKSHOP,
     id: 'this-week-workshop-id',
@@ -213,17 +222,27 @@ describe('workshop links panel', () => {
         expect(pastCard?.textContent).toContain('Proběhlo');
     });
 
-    it('gives a term in the next seven days its own badge and calendar colour', () => {
-        renderWorkshopLinksPanel([ONGOING_WORKSHOP, TOMORROW_WORKSHOP, UPCOMING_WORKSHOP]);
+    it('distinguishes today, tomorrow, and the rest of the next seven days on cards and the calendar', () => {
+        renderWorkshopLinksPanel([THIS_WEEK_WORKSHOP, TOMORROW_WORKSHOP, TODAY_WORKSHOP, UPCOMING_WORKSHOP]);
 
+        expect(findCalendarDay('2026-09-10').className).toContain(
+            getWorkshopPhaseAppearance('upcoming-today').calendarDayClassName,
+        );
         expect(findCalendarDay('2026-09-11').className).toContain(
+            getWorkshopPhaseAppearance('upcoming-tomorrow').calendarDayClassName,
+        );
+        expect(findCalendarDay('2026-09-12').className).toContain(
             getWorkshopPhaseAppearance('upcoming-next-week').calendarDayClassName,
         );
+        expect(screen.getAllByText('Dneska')).toHaveLength(2);
+        expect(screen.getAllByText('Zítra')).toHaveLength(2);
         expect(screen.getAllByText('Tento týden')).toHaveLength(2);
 
         showCardsView();
 
-        const [, upcomingNextWeekCard, upcomingCard] = findTermLinks();
+        const [todayCard, tomorrowCard, upcomingNextWeekCard, upcomingCard] = findTermLinks();
+        expect(todayCard?.textContent).toContain('Dneska');
+        expect(tomorrowCard?.textContent).toContain('Zítra');
         expect(upcomingNextWeekCard?.textContent).toContain('Tento týden');
         expect(upcomingCard?.textContent).toContain('Nadchází');
     });
diff --git a/components/workshops/workshopRoomTheme.css b/components/workshops/workshopRoomTheme.css
index 3f5f35d..47c55c5 100644
--- a/components/workshops/workshopRoomTheme.css
+++ b/components/workshops/workshopRoomTheme.css
@@ -19,6 +19,8 @@
     --room-success: 167 243 208;
     --room-warning: 253 230 138;
     --room-danger: 253 164 175;
+    --room-upcoming-today: 253 186 116;
+    --room-upcoming-tomorrow: 147 197 253;
     --room-upcoming: 196 181 253;
     --room-graph-pink: 244 114 182;
     --room-color-scheme: dark;
@@ -44,6 +46,8 @@
     --room-success: 6 95 70;
     --room-warning: 146 64 14;
     --room-danger: 159 18 57;
+    --room-upcoming-today: 154 52 18;
+    --room-upcoming-tomorrow: 30 64 175;
     --room-upcoming: 109 40 217;
     --room-graph-pink: 190 24 93;
     --room-color-scheme: light;
diff --git a/tailwind.config.ts b/tailwind.config.ts
index 8019f41..db91985 100644
--- a/tailwind.config.ts
+++ b/tailwind.config.ts
@@ -51,6 +51,8 @@ const config: Config = {
                     success: 'rgb(var(--room-success) / <alpha-value>)',
                     warning: 'rgb(var(--room-warning) / <alpha-value>)',
                     danger: 'rgb(var(--room-danger) / <alpha-value>)',
+                    'upcoming-today': 'rgb(var(--room-upcoming-today) / <alpha-value>)',
+                    'upcoming-tomorrow': 'rgb(var(--room-upcoming-tomorrow) / <alpha-value>)',
                     upcoming: 'rgb(var(--room-upcoming) / <alpha-value>)',
                 },
                 background: 'hsl(var(--background))',
13: ✓ Compiled successfully

diff --git a/AGENTS.md b/AGENTS.md
index 8557778d230f0715e09a335fd303bf86015c32dd..d000c5fd0c0fe752490b216922648f5e0d80e798
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -21,8 +21,9 @@
   but all use one registration form. `/cs/online-workshop/dekujeme` is the
   full-load conversion page; `/participant` is the live room. Its waiting room
   offers every published term as the same term cards the landing page registers
-  with: running and upcoming ones first, with a special `Tento týden` badge for a
-  term beginning within the next seven rolling days, then the ones which ended
+  with: running and upcoming ones first, with `Dneska` and `Zítra` badges for terms
+  beginning today or tomorrow in Prague and `Tento týden` for the remaining terms
+  beginning within the next seven rolling days, then the ones which ended
   within the last day, and the older finished ones behind a disclosure.
   Picking one changes the room being connected to and the `workshop` parameter,
   without losing the name and e-mail already typed.
@@ -91,8 +92,9 @@
   a replay badge. Card data includes no feedback. Where a term stands in
   time is decided
   once, in `lib/workshops/workshopPhase.ts`, as one of
-  five phases: ongoing, freshly past while it ended within the last
-  `FRESHLY_PAST_WORKSHOP_HOURS`, upcoming within the next seven rolling days,
+  seven phases: ongoing, freshly past while it ended within the last
+  `FRESHLY_PAST_WORKSHOP_HOURS`, upcoming today or tomorrow by Prague calendar date,
+  other upcoming within the next seven rolling days,
   other upcoming, and past. Every list, badge, and calendar colour reads that one
   answer, and everything which opens after a workshop — the wrap-up, the feedback,
   the recording — treats freshly past as over. A term with a
@@ -121,7 +123,7 @@
   nothing about registrations at all. The registration block opens the exact
   filtered `/admin/contacts` list and its shared CSV, vCard, and Book exports;
   it never creates a second contact table or serializer in workshop administration.
-  Its term picker gives ongoing, freshly past, next-seven-day, and later upcoming
+  Its term picker gives ongoing, freshly past, today, tomorrow, next-seven-day, and later upcoming
   terms their own categories, because a term which has only just been held is
   still being wrapped up and one beginning soon needs preparation; only past terms
   stay behind its history disclosure. Its unobtrusive display-settings control
diff --git a/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx b/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
index 7f931fba445fad57265cd021c65bace471ba8e0b..e64332721f4035a7a4eb12cab7db6c3ae00a0e38
--- a/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
@@ -3,7 +3,7 @@
 import { createOnlineWorkshopTermNoteText } from '@/businesses/online-workshop/onlineWorkshopTerms';
 import { EventTermOptionList } from '@/components/events/EventTermOptionList';
 import type { EventOccurrence } from '@/lib/events/eventOccurrence';
-import { groupWorkshopsByPhase } from '@/lib/workshops/workshopPhase';
+import { groupWorkshopsByPhase, isWorkshopPhaseUpcoming, WORKSHOP_PHASE_VALUES } from '@/lib/workshops/workshopPhase';
 import { ChevronDown, Clock, History, Sparkles } from 'lucide-react';
 import { useId, useMemo, useState } from 'react';
 
@@ -65,11 +65,8 @@
         () => groupWorkshopsByPhase(terms, Date.parse(currentTime)),
         [currentTime, terms],
     );
-    const currentTerms = [
-        ...termsByPhase.ongoing,
-        ...termsByPhase['upcoming-next-week'],
-        ...termsByPhase.upcoming,
-    ];
+    const currentTerms = WORKSHOP_PHASE_VALUES.filter((phase) => phase === 'ongoing' || isWorkshopPhaseUpcoming(phase))
+        .flatMap((phase) => termsByPhase[phase]);
     const freshlyPastTerms = termsByPhase['freshly-past'];
     const { past: pastTerms } = termsByPhase;
     const isSelectedTermPast = pastTerms.some((term) => term.slug === selectedTermSlug);
diff --git a/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
index 57b8fcd8dd0773a357f9328322d8d2259cbebe4c..737f320838372e58dc3deb108ce2be6a53a267aa
--- a/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
@@ -79,6 +79,13 @@
     endsAt: '2026-09-11T11:00:00+02:00',
 });
 
+const TODAY_WORKSHOP = createOnlineWorkshopTerm({
+    slug: 'online-workshop-dnes-2026-09-10',
+    title: 'Dnešní workshop',
+    startsAt: '2026-09-10T19:00:00+02:00',
+    endsAt: '2026-09-10T20:00:00+02:00',
+});
+
 const LATER_UPCOMING_WORKSHOP = createOnlineWorkshopTerm({
     slug: 'online-workshop-kontext-projektu-2026-09-14',
     title: 'Kontext projektu a agenti',
@@ -167,12 +174,23 @@
         expect(screen.getByRole('button', { name: new RegExp(PAST_WORKSHOP.title) })).toBeDefined();
     });
 
-    it('marks a term starting during the next seven days in the waiting-room picker', () => {
-        renderWaitingRoom(LATER_UPCOMING_WORKSHOP);
+    it('keeps today and tomorrow selectable with their own badges before the other next-week terms', () => {
+        renderWaitingRoom(LATER_UPCOMING_WORKSHOP, [...PUBLISHED_WORKSHOPS, TODAY_WORKSHOP]);
 
         expect(
+            screen.getByRole('button', { name: new RegExp(TODAY_WORKSHOP.title) }).textContent,
+        ).toContain('Dneska');
+        expect(
             screen.getByRole('button', { name: new RegExp(NEAREST_UPCOMING_WORKSHOP.title) }).textContent,
+        ).toContain('Zítra');
+        expect(
+            screen.getByRole('button', { name: new RegExp(LATER_UPCOMING_WORKSHOP.title) }).textContent,
         ).toContain('Tento týden');
+
+        fireEvent.click(screen.getByRole('button', { name: new RegExp(TODAY_WORKSHOP.title) }));
+
+        expect(getOpenedWorkshopSlug()).toBe(TODAY_WORKSHOP.slug);
+        expect(window.location.search).toBe(`?workshop=${TODAY_WORKSHOP.slug}`);
     });
 
     it('names the workshop which has only just been held in the open, rather than filing it into the history', () => {
diff --git a/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx b/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
index 0532d6441fc320af25f7f81a71ff4a257b382efd..3bd0a65778edd8c7191ae34a712e8c3153a2bb0c
--- a/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
+++ b/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
@@ -43,6 +43,22 @@
     startsAt: '2026-08-24T19:00:00+02:00',
     endsAt: '2026-08-24T20:30:00+02:00',
 };
+const UPCOMING_TODAY_WORKSHOP: WorkshopAdminSummary = {
+    ...UPCOMING_WORKSHOP,
+    id: 'upcoming-today-workshop-id',
+    slug: 'produkcni-kod-2026-08-21-evening',
+    title: 'Večerní workshop dnes',
+    startsAt: '2026-08-21T21:00:00+02:00',
+    endsAt: '2026-08-21T22:00:00+02:00',
+};
+const UPCOMING_TOMORROW_WORKSHOP: WorkshopAdminSummary = {
+    ...UPCOMING_WORKSHOP,
+    id: 'upcoming-tomorrow-workshop-id',
+    slug: 'produkcni-kod-2026-08-22',
+    title: 'Workshop zítra',
+    startsAt: '2026-08-22T19:00:00+02:00',
+    endsAt: '2026-08-22T20:30:00+02:00',
+};
 const FRESHLY_PAST_WORKSHOP: WorkshopAdminSummary = {
     id: 'freshly-past-workshop-id',
     kind: 'workshop',
@@ -128,22 +144,30 @@
             FRESHLY_PAST_WORKSHOP,
             UPCOMING_WORKSHOP,
             UPCOMING_NEXT_WEEK_WORKSHOP,
+            UPCOMING_TOMORROW_WORKSHOP,
+            UPCOMING_TODAY_WORKSHOP,
             ONGOING_WORKSHOP,
         ]);
 
         expect(screen.getByRole('heading', { name: 'Probíhá (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Právě proběhlo (1)' })).not.toBeNull();
+        expect(screen.getByRole('heading', { name: 'Dneska (1)' })).not.toBeNull();
+        expect(screen.getByRole('heading', { name: 'Zítra (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Tento týden (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Nadchází (1)' })).not.toBeNull();
         expect(getWorkshopCards().map((workshopCard) => workshopCard.textContent)).toEqual([
             expect.stringContaining(ONGOING_WORKSHOP.title),
             expect.stringContaining(FRESHLY_PAST_WORKSHOP.title),
+            expect.stringContaining(UPCOMING_TODAY_WORKSHOP.title),
+            expect.stringContaining(UPCOMING_TOMORROW_WORKSHOP.title),
             expect.stringContaining(UPCOMING_NEXT_WEEK_WORKSHOP.title),
             expect.stringContaining(UPCOMING_WORKSHOP.title),
         ]);
 
         expect(getWorkshopCards()[1].textContent).toContain('Právě proběhlo');
-        expect(getWorkshopCards()[2].textContent).toContain('Tento týden');
+        expect(getWorkshopCards()[2].textContent).toContain('Dneska');
+        expect(getWorkshopCards()[3].textContent).toContain('Zítra');
+        expect(getWorkshopCards()[4].textContent).toContain('Tento týden');
         expect(screen.getByRole('button', { name: 'Historie (1)' }).getAttribute('aria-expanded')).toBe('false');
     });
 
diff --git a/businesses/workshop-admin/WorkshopSelectorCardList.tsx b/businesses/workshop-admin/WorkshopSelectorCardList.tsx
index 5b7e331aceddc897620dae58f248e2bc983896f5..aa2123738032474da72d18ca79338f95ec457fdc
--- a/businesses/workshop-admin/WorkshopSelectorCardList.tsx
+++ b/businesses/workshop-admin/WorkshopSelectorCardList.tsx
@@ -86,7 +86,7 @@
 }
 
 /**
- * Offers every occurrence as a card in the five shared time categories. An administrator gets the workshop that is
+ * Offers every occurrence as a card in the shared time categories. An administrator gets the workshop that is
  * running first, the one they are wrapping up next, then the terms to prepare soon and later, while the old archive
  * remains available on demand.
  */
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index df5b4612ecafacc477bfe8dbb97475db021af62b..83d8b0f693509e0926ab81b0ce15225503d91f9c
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,5 +1,9 @@
 # Current preversion
 
+- Added `Dneska` and `Zítra` event badges ahead of `Tento týden`, based on Prague calendar dates. Shared cards,
+  calendars, landing-page term choices, and the admin picker use the same phases and theme-aware colours. Terms
+  still switch to `Probíhá` at their start and remain eligible for waiting-room choices and follow-up recommendations.
+
 - Added the **Titulky** tab at `/admin/workshops?tab=subtitles` with private Czech, English and mixed-language tracks.
   Admins can fetch available YouTube captions, generate timed subtitles from an uploaded video/audio recording,
   import or edit SRT/WebVTT, and download either format. Long recordings are decoded in the browser and transcribed
diff --git a/components/events/EventTermOptionCard.tsx b/components/events/EventTermOptionCard.tsx
index ce65036825b967fb19601515127f7890cf8ff0bc..d6f100083c022187d95746b95f83f57e8d2dd676
--- a/components/events/EventTermOptionCard.tsx
+++ b/components/events/EventTermOptionCard.tsx
@@ -4,7 +4,7 @@
 import { formatEventPrice } from '@/lib/events/eventPrice';
 import { cn } from '@/lib/utils';
 import { formatCzechWorkshopRelativeDay, formatCzechWorkshopTimeRange } from '@/lib/workshops/workshopDate';
-import { getWorkshopPhase } from '@/lib/workshops/workshopPhase';
+import { getWorkshopPhase, isWorkshopPhaseUpcoming } from '@/lib/workshops/workshopPhase';
 import type { LucideIcon } from 'lucide-react';
 
 /**
@@ -175,7 +175,7 @@
     const appearanceClassNames = EVENT_TERM_OPTION_CARD_APPEARANCES[appearance];
     const densityClassNames = EVENT_TERM_OPTION_CARD_DENSITIES[density];
     const phase = getWorkshopPhase(occurrence, Date.parse(currentTime));
-    const isWorkshopStartingWithinNextWeek = phase === 'upcoming-next-week';
+    const isWorkshopStartingSoon = isWorkshopPhaseUpcoming(phase) && phase !== 'upcoming';
 
     return (
         <button
@@ -199,7 +199,7 @@
                     {formatCzechWorkshopRelativeDay(occurrence.startsAt, currentTime)} ·{' '}
                     {formatCzechWorkshopTimeRange(occurrence.startsAt, occurrence.endsAt)}
                 </span>
-                {isWorkshopStartingWithinNextWeek && (
+                {isWorkshopStartingSoon && (
                     <WorkshopPhaseBadge
                         phase={phase}
                         tone={appearance}
diff --git a/components/workshops/WorkshopLinksPanel.test.tsx b/components/workshops/WorkshopLinksPanel.test.tsx
index 0d3b760e290f4cf5027ca2364269abf8adacd1aa..9db3d59e76e3e4dff76d653ddb58c86d8ca06e70
--- a/components/workshops/WorkshopLinksPanel.test.tsx
+++ b/components/workshops/WorkshopLinksPanel.test.tsx
@@ -54,6 +54,15 @@
     endsAt: '2026-09-11T20:30:00+02:00',
 };
 
+const TODAY_WORKSHOP: WorkshopSummary = {
+    ...ONGOING_WORKSHOP,
+    id: 'today-workshop-id',
+    slug: 'production-ai-2026-09-10-evening',
+    title: 'Večerní workshop dnes',
+    startsAt: '2026-09-10T21:00:00+02:00',
+    endsAt: '2026-09-10T22:00:00+02:00',
+};
+
 const THIS_WEEK_WORKSHOP: WorkshopSummary = {
     ...ONGOING_WORKSHOP,
     id: 'this-week-workshop-id',
@@ -213,17 +222,27 @@
         expect(pastCard?.textContent).toContain('Proběhlo');
     });
 
-    it('gives a term in the next seven days its own badge and calendar colour', () => {
-        renderWorkshopLinksPanel([ONGOING_WORKSHOP, TOMORROW_WORKSHOP, UPCOMING_WORKSHOP]);
+    it('distinguishes today, tomorrow, and the rest of the next seven days on cards and the calendar', () => {
+        renderWorkshopLinksPanel([THIS_WEEK_WORKSHOP, TOMORROW_WORKSHOP, TODAY_WORKSHOP, UPCOMING_WORKSHOP]);
 
+        expect(findCalendarDay('2026-09-10').className).toContain(
+            getWorkshopPhaseAppearance('upcoming-today').calendarDayClassName,
+        );
         expect(findCalendarDay('2026-09-11').className).toContain(
+            getWorkshopPhaseAppearance('upcoming-tomorrow').calendarDayClassName,
+        );
+        expect(findCalendarDay('2026-09-12').className).toContain(
             getWorkshopPhaseAppearance('upcoming-next-week').calendarDayClassName,
         );
+        expect(screen.getAllByText('Dneska')).toHaveLength(2);
+        expect(screen.getAllByText('Zítra')).toHaveLength(2);
         expect(screen.getAllByText('Tento týden')).toHaveLength(2);
 
         showCardsView();
 
-        const [, upcomingNextWeekCard, upcomingCard] = findTermLinks();
+        const [todayCard, tomorrowCard, upcomingNextWeekCard, upcomingCard] = findTermLinks();
+        expect(todayCard?.textContent).toContain('Dneska');
+        expect(tomorrowCard?.textContent).toContain('Zítra');
         expect(upcomingNextWeekCard?.textContent).toContain('Tento týden');
         expect(upcomingCard?.textContent).toContain('Nadchází');
     });
diff --git a/components/workshops/workshopPhaseAppearance.ts b/components/workshops/workshopPhaseAppearance.ts
index 397626aeeca074142ce787ebea7da16101b8f4ee..81ed54d491ff2b28c62b9de95d4df343cb3676a5
--- a/components/workshops/workshopPhaseAppearance.ts
+++ b/components/workshops/workshopPhaseAppearance.ts
@@ -34,8 +34,8 @@
  * The one description of how every phase looks, wherever a term is listed
  *
  * Note: A list of cards and a calendar of the same terms say the very same thing with the very same colour - green
- *       runs right now, amber has only just been held, violet starts within a week, cyan is further ahead, and grey is
- *       history - because both of them read their colours here instead of choosing their own.
+ *       runs right now, amber has only just been held, orange starts today, blue tomorrow, violet within a week, cyan
+ *       further ahead, and grey is history - because both read their colours here instead of choosing their own.
  * Note: These colours live beside the components which wear them rather than among the rules of the application,
  *       because only the directories of the components are read for the styles the application is built with.
  */
@@ -61,6 +61,24 @@
         calendarDayClassName: 'border-room-warning/40 bg-room-warning/10 text-room-warning',
         markClassName: 'bg-room-warning',
     },
+    'upcoming-today': {
+        label: 'Dneska',
+        badgeClassNameByTone: {
+            light: 'bg-orange-100 text-orange-800',
+            room: 'bg-room-upcoming-today/15 text-room-upcoming-today ring-1 ring-inset ring-room-upcoming-today/40',
+        },
+        calendarDayClassName: 'border-room-upcoming-today/40 bg-room-upcoming-today/10 text-room-upcoming-today',
+        markClassName: 'bg-room-upcoming-today',
+    },
+    'upcoming-tomorrow': {
+        label: 'Zítra',
+        badgeClassNameByTone: {
+            light: 'bg-blue-100 text-blue-800',
+            room: 'bg-room-upcoming-tomorrow/15 text-room-upcoming-tomorrow ring-1 ring-inset ring-room-upcoming-tomorrow/40',
+        },
+        calendarDayClassName: 'border-room-upcoming-tomorrow/40 bg-room-upcoming-tomorrow/10 text-room-upcoming-tomorrow',
+        markClassName: 'bg-room-upcoming-tomorrow',
+    },
     // Note: This stays distinct from the ordinary upcoming cyan so the special badge is useful even when a reader
     //       cannot infer a date at a glance.
     'upcoming-next-week': {
diff --git a/components/workshops/workshopRoomTheme.css b/components/workshops/workshopRoomTheme.css
index 3f5f35d8211be102c381f56b40f2d3e79a68be31..47c55c58a0db06612e949785c95ffc205584b310
--- a/components/workshops/workshopRoomTheme.css
+++ b/components/workshops/workshopRoomTheme.css
@@ -19,6 +19,8 @@
     --room-success: 167 243 208;
     --room-warning: 253 230 138;
     --room-danger: 253 164 175;
+    --room-upcoming-today: 253 186 116;
+    --room-upcoming-tomorrow: 147 197 253;
     --room-upcoming: 196 181 253;
     --room-graph-pink: 244 114 182;
     --room-color-scheme: dark;
@@ -44,6 +46,8 @@
     --room-success: 6 95 70;
     --room-warning: 146 64 14;
     --room-danger: 159 18 57;
+    --room-upcoming-today: 154 52 18;
+    --room-upcoming-tomorrow: 30 64 175;
     --room-upcoming: 109 40 217;
     --room-graph-pink: 190 24 93;
     --room-color-scheme: light;
diff --git a/lib/workshops/workshopPhase.test.ts b/lib/workshops/workshopPhase.test.ts
index 746ba57a99a0364e632cefb24b1412a8ea7d26df..8b34cd8e7b7fe7caa4f15b8cf9d229c3c3b9bd14
--- a/lib/workshops/workshopPhase.test.ts
+++ b/lib/workshops/workshopPhase.test.ts
@@ -41,6 +41,14 @@
     startsAt: '2026-08-24T19:00:00+02:00',
     endsAt: '2026-08-24T20:30:00+02:00',
 };
+const UPCOMING_TODAY_WORKSHOP: WorkshopOccurrenceTiming = {
+    startsAt: '2026-08-21T21:00:00+02:00',
+    endsAt: '2026-08-21T22:00:00+02:00',
+};
+const UPCOMING_TOMORROW_WORKSHOP: WorkshopOccurrenceTiming = {
+    startsAt: '2026-08-22T19:00:00+02:00',
+    endsAt: '2026-08-22T20:00:00+02:00',
+};
 const LATER_UPCOMING_WORKSHOP: WorkshopOccurrenceTiming = {
     startsAt: '2026-10-10T19:00:00+02:00',
     endsAt: '2026-10-10T20:30:00+02:00',
@@ -54,11 +62,24 @@
     it('places an occurrence against the given moment', () => {
         expect(getWorkshopPhase(UPCOMING_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming');
         expect(getWorkshopPhase(UPCOMING_NEXT_WEEK_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming-next-week');
+        expect(getWorkshopPhase(UPCOMING_TODAY_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming-today');
+        expect(getWorkshopPhase(UPCOMING_TOMORROW_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming-tomorrow');
         expect(getWorkshopPhase(ONGOING_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('ongoing');
         expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('freshly-past');
         expect(getWorkshopPhase(PAST_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('past');
     });
 
+    it.each([
+        ['2026-08-21T21:59:59Z', '2026-08-21T22:30:00Z', 'upcoming-tomorrow'],
+        ['2026-08-21T22:00:00Z', '2026-08-21T22:30:00Z', 'upcoming-today'],
+        ['2026-12-31T22:30:00Z', '2026-12-31T23:30:00Z', 'upcoming-tomorrow'],
+        ['2026-03-28T00:15:00+01:00', '2026-03-29T23:30:00+02:00', 'upcoming-tomorrow'],
+        ['2026-03-28T23:30:00+01:00', '2026-03-30T00:15:00+02:00', 'upcoming-next-week'],
+        ['2026-10-25T00:15:00+02:00', '2026-10-25T23:30:00+01:00', 'upcoming-today'],
+    ])('uses Prague calendar days from %s to classify %s as %s', (currentTime, startsAt, expectedPhase) => {
+        expect(getWorkshopPhase({ startsAt, endsAt: null }, Date.parse(currentTime))).toBe(expectedPhase);
+    });
+
     it('keeps an occurrence freshly past for a whole day after the end recorded for it', () => {
         expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, Date.parse('2026-08-20T20:30:01+02:00'))).toBe('freshly-past');
         expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('freshly-past');
@@ -69,6 +90,8 @@
         expect(isWorkshopPhasePast('freshly-past')).toBe(true);
         expect(isWorkshopPhasePast('past')).toBe(true);
         expect(isWorkshopPhasePast('ongoing')).toBe(false);
+        expect(isWorkshopPhasePast('upcoming-today')).toBe(false);
+        expect(isWorkshopPhasePast('upcoming-tomorrow')).toBe(false);
         expect(isWorkshopPhasePast('upcoming-next-week')).toBe(false);
         expect(isWorkshopPhasePast('upcoming')).toBe(false);
     });
@@ -87,7 +110,9 @@
         expect(getWorkshopPhase(workshopAfterNextWeekBoundary, CURRENT_TIME_MILLISECONDS)).toBe('upcoming');
     });
 
-    it('counts both kinds of future term among the workshops which are still ahead', () => {
+    it('counts every kind of future term among the workshops which are still ahead', () => {
+        expect(isWorkshopPhaseUpcoming('upcoming-today')).toBe(true);
+        expect(isWorkshopPhaseUpcoming('upcoming-tomorrow')).toBe(true);
         expect(isWorkshopPhaseUpcoming('upcoming-next-week')).toBe(true);
         expect(isWorkshopPhaseUpcoming('upcoming')).toBe(true);
         expect(isWorkshopPhaseUpcoming('ongoing')).toBe(false);
@@ -106,7 +131,7 @@
         expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('ongoing');
         expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-12-24T18:00:00+01:00'))).toBe('ongoing');
         expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-08-21T18:59:59+02:00'))).toBe(
-            'upcoming-next-week',
+            'upcoming-today',
         );
     });
 
@@ -134,7 +159,7 @@
     it('keeps an occurrence ongoing until its very end and imminent until its very start', () => {
         expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T19:00:00+02:00'))).toBe('ongoing');
         expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T18:59:59+02:00'))).toBe(
-            'upcoming-next-week',
+            'upcoming-today',
         );
         expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('freshly-past');
     });
@@ -150,6 +175,8 @@
                 FRESHLY_PAST_WORKSHOP,
                 UPCOMING_WORKSHOP,
                 UPCOMING_NEXT_WEEK_WORKSHOP,
+                UPCOMING_TOMORROW_WORKSHOP,
+                UPCOMING_TODAY_WORKSHOP,
                 ONGOING_WORKSHOP,
             ],
             CURRENT_TIME_MILLISECONDS,
@@ -158,6 +185,8 @@
         expect(sortedWorkshops).toEqual([
             ONGOING_WORKSHOP,
             FRESHLY_PAST_WORKSHOP,
+            UPCOMING_TODAY_WORKSHOP,
+            UPCOMING_TOMORROW_WORKSHOP,
             UPCOMING_NEXT_WEEK_WORKSHOP,
             UPCOMING_WORKSHOP,
             LATER_UPCOMING_WORKSHOP,
@@ -183,6 +212,8 @@
                 FRESHLY_PAST_WORKSHOP,
                 UPCOMING_WORKSHOP,
                 UPCOMING_NEXT_WEEK_WORKSHOP,
+                UPCOMING_TOMORROW_WORKSHOP,
+                UPCOMING_TODAY_WORKSHOP,
                 ONGOING_WORKSHOP,
             ],
             CURRENT_TIME_MILLISECONDS,
@@ -191,6 +222,8 @@
         expect(workshopsByPhase).toEqual({
             ongoing: [ONGOING_WORKSHOP],
             'freshly-past': [FRESHLY_PAST_WORKSHOP],
+            'upcoming-today': [UPCOMING_TODAY_WORKSHOP],
+            'upcoming-tomorrow': [UPCOMING_TOMORROW_WORKSHOP],
             'upcoming-next-week': [UPCOMING_NEXT_WEEK_WORKSHOP],
             upcoming: [UPCOMING_WORKSHOP, LATER_UPCOMING_WORKSHOP],
             past: [PAST_WORKSHOP, OLDER_PAST_WORKSHOP],
@@ -199,6 +232,11 @@
 
     it('lets the most pressing phase speak for a group of occurrences', () => {
         expect(getMostProminentWorkshopPhase(['past', 'upcoming', 'ongoing'])).toBe('ongoing');
+        expect(getMostProminentWorkshopPhase(['upcoming-today', 'ongoing'])).toBe('ongoing');
+        expect(getMostProminentWorkshopPhase(['upcoming-tomorrow', 'upcoming-today', 'upcoming-next-week'])).toBe(
+            'upcoming-today',
+        );
+        expect(getMostProminentWorkshopPhase(['upcoming-next-week', 'upcoming-tomorrow'])).toBe('upcoming-tomorrow');
         expect(getMostProminentWorkshopPhase(['past', 'upcoming', 'upcoming-next-week'])).toBe('upcoming-next-week');
         expect(getMostProminentWorkshopPhase(['past', 'freshly-past', 'upcoming'])).toBe('freshly-past');
         expect(getMostProminentWorkshopPhase(['past', 'freshly-past'])).toBe('freshly-past');
diff --git a/lib/workshops/workshopPhase.ts b/lib/workshops/workshopPhase.ts
index 0ac9e8a2847c45355d50625381df66584f696536..ac1ea734d5ae6bdf4de3076aeeb2ce399051b59e
--- a/lib/workshops/workshopPhase.ts
+++ b/lib/workshops/workshopPhase.ts
@@ -1,3 +1,5 @@
+import { createCalendarDayKey } from '@/lib/calendar/calendarMonth';
+import { getRelativeCalendarDay } from '@/lib/calendar/czechRelativeDay';
 import {
     DEFAULT_WORKSHOP_DURATION_MINUTES,
     FRESHLY_PAST_WORKSHOP_HOURS,
@@ -6,6 +8,7 @@
 
 const MILLISECONDS_PER_MINUTE = 60 * 1000;
 const MILLISECONDS_PER_HOUR = 60 * MILLISECONDS_PER_MINUTE;
+const WORKSHOP_TIME_ZONE = 'Europe/Prague';
 
 /**
  * Where one occurrence currently stands in time, named from the most pressing phase to the least
@@ -15,10 +18,19 @@
  *       nothing to do with what they do with a workshop of last spring.
  * Note: An occurrence which starts during the next seven days is also a phase of its own, so a schedule can call
  *       attention to the terms somebody still has time to plan for without each surface calculating that window again.
+ *       Today and tomorrow take precedence within that window, using Prague calendar days rather than elapsed hours.
  * Note: This order is what ranks the phases wherever they are listed, coloured, or grouped, so a phase is placed among
  *       the others only here.
  */
-export const WORKSHOP_PHASE_VALUES = ['ongoing', 'freshly-past', 'upcoming-next-week', 'upcoming', 'past'] as const;
+export const WORKSHOP_PHASE_VALUES = [
+    'ongoing',
+    'freshly-past',
+    'upcoming-today',
+    'upcoming-tomorrow',
+    'upcoming-next-week',
+    'upcoming',
+    'past',
+] as const;
 
 export type WorkshopPhase = (typeof WORKSHOP_PHASE_VALUES)[number];
 
@@ -41,7 +53,12 @@
  *       badge.
  */
 export function isWorkshopPhaseUpcoming(phase: WorkshopPhase): boolean {
-    return phase === 'upcoming-next-week' || phase === 'upcoming';
+    return (
+        phase === 'upcoming-today' ||
+        phase === 'upcoming-tomorrow' ||
+        phase === 'upcoming-next-week' ||
+        phase === 'upcoming'
+    );
 }
 
 /**
@@ -127,6 +144,17 @@
 ): WorkshopPhase {
     const startsAtMilliseconds = Date.parse(occurrence.startsAt);
     if (isWorkshopStartingWithinNextWeek(startsAtMilliseconds, currentTimeMilliseconds)) {
+        const relativeDay = getRelativeCalendarDay(
+            createCalendarDayKey(occurrence.startsAt, WORKSHOP_TIME_ZONE),
+            createCalendarDayKey(new Date(currentTimeMilliseconds).toISOString(), WORKSHOP_TIME_ZONE),
+        );
+        if (relativeDay === 'today') {
+            return 'upcoming-today';
+        }
+        if (relativeDay === 'tomorrow') {
+            return 'upcoming-tomorrow';
+        }
+
         return 'upcoming-next-week';
     }
 
@@ -207,6 +235,8 @@
     const workshopsByPhase: Record<WorkshopPhase, TWorkshop[]> = {
         ongoing: [],
         'freshly-past': [],
+        'upcoming-today': [],
+        'upcoming-tomorrow': [],
         'upcoming-next-week': [],
         upcoming: [],
         past: [],
diff --git a/tailwind.config.ts b/tailwind.config.ts
index 8019f41f1539feedb45d402a70dd8ffff9aca8ad..db919851e4a1a55643569375d67dc665ab75a01b
--- a/tailwind.config.ts
+++ b/tailwind.config.ts
@@ -51,6 +51,8 @@
                     success: 'rgb(var(--room-success) / <alpha-value>)',
                     warning: 'rgb(var(--room-warning) / <alpha-value>)',
                     danger: 'rgb(var(--room-danger) / <alpha-value>)',
+                    'upcoming-today': 'rgb(var(--room-upcoming-today) / <alpha-value>)',
+                    'upcoming-tomorrow': 'rgb(var(--room-upcoming-tomorrow) / <alpha-value>)',
                     upcoming: 'rgb(var(--room-upcoming) / <alpha-value>)',
                 },
                 background: 'hsl(var(--background))',

codex
Added **Dneska** and **Zítra** badges across event cards, calendars, and admin categories using Prague dates. **Tento týden** remains for other events within seven days.

Verified: 95 tests passed, plus lint, production build, and TypeScript checks.
diff --git a/AGENTS.md b/AGENTS.md
index 8557778d230f0715e09a335fd303bf86015c32dd..d000c5fd0c0fe752490b216922648f5e0d80e798
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -21,8 +21,9 @@
   but all use one registration form. `/cs/online-workshop/dekujeme` is the
   full-load conversion page; `/participant` is the live room. Its waiting room
   offers every published term as the same term cards the landing page registers
-  with: running and upcoming ones first, with a special `Tento týden` badge for a
-  term beginning within the next seven rolling days, then the ones which ended
+  with: running and upcoming ones first, with `Dneska` and `Zítra` badges for terms
+  beginning today or tomorrow in Prague and `Tento týden` for the remaining terms
+  beginning within the next seven rolling days, then the ones which ended
   within the last day, and the older finished ones behind a disclosure.
   Picking one changes the room being connected to and the `workshop` parameter,
   without losing the name and e-mail already typed.
@@ -91,8 +92,9 @@
   a replay badge. Card data includes no feedback. Where a term stands in
   time is decided
   once, in `lib/workshops/workshopPhase.ts`, as one of
-  five phases: ongoing, freshly past while it ended within the last
-  `FRESHLY_PAST_WORKSHOP_HOURS`, upcoming within the next seven rolling days,
+  seven phases: ongoing, freshly past while it ended within the last
+  `FRESHLY_PAST_WORKSHOP_HOURS`, upcoming today or tomorrow by Prague calendar date,
+  other upcoming within the next seven rolling days,
   other upcoming, and past. Every list, badge, and calendar colour reads that one
   answer, and everything which opens after a workshop — the wrap-up, the feedback,
   the recording — treats freshly past as over. A term with a
@@ -121,7 +123,7 @@
   nothing about registrations at all. The registration block opens the exact
   filtered `/admin/contacts` list and its shared CSV, vCard, and Book exports;
   it never creates a second contact table or serializer in workshop administration.
-  Its term picker gives ongoing, freshly past, next-seven-day, and later upcoming
+  Its term picker gives ongoing, freshly past, today, tomorrow, next-seven-day, and later upcoming
   terms their own categories, because a term which has only just been held is
   still being wrapped up and one beginning soon needs preparation; only past terms
   stay behind its history disclosure. Its unobtrusive display-settings control
diff --git a/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx b/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
index 7f931fba445fad57265cd021c65bace471ba8e0b..e64332721f4035a7a4eb12cab7db6c3ae00a0e38
--- a/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
@@ -3,7 +3,7 @@
 import { createOnlineWorkshopTermNoteText } from '@/businesses/online-workshop/onlineWorkshopTerms';
 import { EventTermOptionList } from '@/components/events/EventTermOptionList';
 import type { EventOccurrence } from '@/lib/events/eventOccurrence';
-import { groupWorkshopsByPhase } from '@/lib/workshops/workshopPhase';
+import { groupWorkshopsByPhase, isWorkshopPhaseUpcoming, WORKSHOP_PHASE_VALUES } from '@/lib/workshops/workshopPhase';
 import { ChevronDown, Clock, History, Sparkles } from 'lucide-react';
 import { useId, useMemo, useState } from 'react';
 
@@ -65,11 +65,8 @@
         () => groupWorkshopsByPhase(terms, Date.parse(currentTime)),
         [currentTime, terms],
     );
-    const currentTerms = [
-        ...termsByPhase.ongoing,
-        ...termsByPhase['upcoming-next-week'],
-        ...termsByPhase.upcoming,
-    ];
+    const currentTerms = WORKSHOP_PHASE_VALUES.filter((phase) => phase === 'ongoing' || isWorkshopPhaseUpcoming(phase))
+        .flatMap((phase) => termsByPhase[phase]);
     const freshlyPastTerms = termsByPhase['freshly-past'];
     const { past: pastTerms } = termsByPhase;
     const isSelectedTermPast = pastTerms.some((term) => term.slug === selectedTermSlug);
diff --git a/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
index 57b8fcd8dd0773a357f9328322d8d2259cbebe4c..737f320838372e58dc3deb108ce2be6a53a267aa
--- a/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
@@ -79,6 +79,13 @@
     endsAt: '2026-09-11T11:00:00+02:00',
 });
 
+const TODAY_WORKSHOP = createOnlineWorkshopTerm({
+    slug: 'online-workshop-dnes-2026-09-10',
+    title: 'Dnešní workshop',
+    startsAt: '2026-09-10T19:00:00+02:00',
+    endsAt: '2026-09-10T20:00:00+02:00',
+});
+
 const LATER_UPCOMING_WORKSHOP = createOnlineWorkshopTerm({
     slug: 'online-workshop-kontext-projektu-2026-09-14',
     title: 'Kontext projektu a agenti',
@@ -167,12 +174,23 @@
         expect(screen.getByRole('button', { name: new RegExp(PAST_WORKSHOP.title) })).toBeDefined();
     });
 
-    it('marks a term starting during the next seven days in the waiting-room picker', () => {
-        renderWaitingRoom(LATER_UPCOMING_WORKSHOP);
+    it('keeps today and tomorrow selectable with their own badges before the other next-week terms', () => {
+        renderWaitingRoom(LATER_UPCOMING_WORKSHOP, [...PUBLISHED_WORKSHOPS, TODAY_WORKSHOP]);
 
         expect(
+            screen.getByRole('button', { name: new RegExp(TODAY_WORKSHOP.title) }).textContent,
+        ).toContain('Dneska');
+        expect(
             screen.getByRole('button', { name: new RegExp(NEAREST_UPCOMING_WORKSHOP.title) }).textContent,
+        ).toContain('Zítra');
+        expect(
+            screen.getByRole('button', { name: new RegExp(LATER_UPCOMING_WORKSHOP.title) }).textContent,
         ).toContain('Tento týden');
+
+        fireEvent.click(screen.getByRole('button', { name: new RegExp(TODAY_WORKSHOP.title) }));
+
+        expect(getOpenedWorkshopSlug()).toBe(TODAY_WORKSHOP.slug);
+        expect(window.location.search).toBe(`?workshop=${TODAY_WORKSHOP.slug}`);
     });
 
     it('names the workshop which has only just been held in the open, rather than filing it into the history', () => {
diff --git a/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx b/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
index 0532d6441fc320af25f7f81a71ff4a257b382efd..3bd0a65778edd8c7191ae34a712e8c3153a2bb0c
--- a/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
+++ b/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
@@ -43,6 +43,22 @@
     startsAt: '2026-08-24T19:00:00+02:00',
     endsAt: '2026-08-24T20:30:00+02:00',
 };
+const UPCOMING_TODAY_WORKSHOP: WorkshopAdminSummary = {
+    ...UPCOMING_WORKSHOP,
+    id: 'upcoming-today-workshop-id',
+    slug: 'produkcni-kod-2026-08-21-evening',
+    title: 'Večerní workshop dnes',
+    startsAt: '2026-08-21T21:00:00+02:00',
+    endsAt: '2026-08-21T22:00:00+02:00',
+};
+const UPCOMING_TOMORROW_WORKSHOP: WorkshopAdminSummary = {
+    ...UPCOMING_WORKSHOP,
+    id: 'upcoming-tomorrow-workshop-id',
+    slug: 'produkcni-kod-2026-08-22',
+    title: 'Workshop zítra',
+    startsAt: '2026-08-22T19:00:00+02:00',
+    endsAt: '2026-08-22T20:30:00+02:00',
+};
 const FRESHLY_PAST_WORKSHOP: WorkshopAdminSummary = {
     id: 'freshly-past-workshop-id',
     kind: 'workshop',
@@ -128,22 +144,30 @@
             FRESHLY_PAST_WORKSHOP,
             UPCOMING_WORKSHOP,
             UPCOMING_NEXT_WEEK_WORKSHOP,
+            UPCOMING_TOMORROW_WORKSHOP,
+            UPCOMING_TODAY_WORKSHOP,
             ONGOING_WORKSHOP,
         ]);
 
         expect(screen.getByRole('heading', { name: 'Probíhá (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Právě proběhlo (1)' })).not.toBeNull();
+        expect(screen.getByRole('heading', { name: 'Dneska (1)' })).not.toBeNull();
+        expect(screen.getByRole('heading', { name: 'Zítra (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Tento týden (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Nadchází (1)' })).not.toBeNull();
         expect(getWorkshopCards().map((workshopCard) => workshopCard.textContent)).toEqual([
             expect.stringContaining(ONGOING_WORKSHOP.title),
             expect.stringContaining(FRESHLY_PAST_WORKSHOP.title),
+            expect.stringContaining(UPCOMING_TODAY_WORKSHOP.title),
+            expect.stringContaining(UPCOMING_TOMORROW_WORKSHOP.title),
             expect.stringContaining(UPCOMING_NEXT_WEEK_WORKSHOP.title),
             expect.stringContaining(UPCOMING_WORKSHOP.title),
         ]);
 
         expect(getWorkshopCards()[1].textContent).toContain('Právě proběhlo');
-        expect(getWorkshopCards()[2].textContent).toContain('Tento týden');
+        expect(getWorkshopCards()[2].textContent).toContain('Dneska');
+        expect(getWorkshopCards()[3].textContent).toContain('Zítra');
+        expect(getWorkshopCards()[4].textContent).toContain('Tento týden');
         expect(screen.getByRole('button', { name: 'Historie (1)' }).getAttribute('aria-expanded')).toBe('false');
     });
 
diff --git a/businesses/workshop-admin/WorkshopSelectorCardList.tsx b/businesses/workshop-admin/WorkshopSelectorCardList.tsx
index 5b7e331aceddc897620dae58f248e2bc983896f5..aa2123738032474da72d18ca79338f95ec457fdc
--- a/businesses/workshop-admin/WorkshopSelectorCardList.tsx
+++ b/businesses/workshop-admin/WorkshopSelectorCardList.tsx
@@ -86,7 +86,7 @@
 }
 
 /**
- * Offers every occurrence as a card in the five shared time categories. An administrator gets the workshop that is
+ * Offers every occurrence as a card in the shared time categories. An administrator gets the workshop that is
  * running first, the one they are wrapping up next, then the terms to prepare soon and later, while the old archive
  * remains available on demand.
  */
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index df5b4612ecafacc477bfe8dbb97475db021af62b..83d8b0f693509e0926ab81b0ce15225503d91f9c
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,5 +1,9 @@
 # Current preversion
 
+- Added `Dneska` and `Zítra` event badges ahead of `Tento týden`, based on Prague calendar dates. Shared cards,
+  calendars, landing-page term choices, and the admin picker use the same phases and theme-aware colours. Terms
+  still switch to `Probíhá` at their start and remain eligible for waiting-room choices and follow-up recommendations.
+
 - Added the **Titulky** tab at `/admin/workshops?tab=subtitles` with private Czech, English and mixed-language tracks.
   Admins can fetch available YouTube captions, generate timed subtitles from an uploaded video/audio recording,
   import or edit SRT/WebVTT, and download either format. Long recordings are decoded in the browser and transcribed
diff --git a/components/events/EventTermOptionCard.tsx b/components/events/EventTermOptionCard.tsx
index ce65036825b967fb19601515127f7890cf8ff0bc..d6f100083c022187d95746b95f83f57e8d2dd676
--- a/components/events/EventTermOptionCard.tsx
+++ b/components/events/EventTermOptionCard.tsx
@@ -4,7 +4,7 @@
 import { formatEventPrice } from '@/lib/events/eventPrice';
 import { cn } from '@/lib/utils';
 import { formatCzechWorkshopRelativeDay, formatCzechWorkshopTimeRange } from '@/lib/workshops/workshopDate';
-import { getWorkshopPhase } from '@/lib/workshops/workshopPhase';
+import { getWorkshopPhase, isWorkshopPhaseUpcoming } from '@/lib/workshops/workshopPhase';
 import type { LucideIcon } from 'lucide-react';
 
 /**
@@ -175,7 +175,7 @@
     const appearanceClassNames = EVENT_TERM_OPTION_CARD_APPEARANCES[appearance];
     const densityClassNames = EVENT_TERM_OPTION_CARD_DENSITIES[density];
     const phase = getWorkshopPhase(occurrence, Date.parse(currentTime));
-    const isWorkshopStartingWithinNextWeek = phase === 'upcoming-next-week';
+    const isWorkshopStartingSoon = isWorkshopPhaseUpcoming(phase) && phase !== 'upcoming';
 
     return (
         <button
@@ -199,7 +199,7 @@
                     {formatCzechWorkshopRelativeDay(occurrence.startsAt, currentTime)} ·{' '}
                     {formatCzechWorkshopTimeRange(occurrence.startsAt, occurrence.endsAt)}
                 </span>
-                {isWorkshopStartingWithinNextWeek && (
+                {isWorkshopStartingSoon && (
                     <WorkshopPhaseBadge
                         phase={phase}
                         tone={appearance}
diff --git a/components/workshops/WorkshopLinksPanel.test.tsx b/components/workshops/WorkshopLinksPanel.test.tsx
index 0d3b760e290f4cf5027ca2364269abf8adacd1aa..9db3d59e76e3e4dff76d653ddb58c86d8ca06e70
--- a/components/workshops/WorkshopLinksPanel.test.tsx
+++ b/components/workshops/WorkshopLinksPanel.test.tsx
@@ -54,6 +54,15 @@
     endsAt: '2026-09-11T20:30:00+02:00',
 };
 
+const TODAY_WORKSHOP: WorkshopSummary = {
+    ...ONGOING_WORKSHOP,
+    id: 'today-workshop-id',
+    slug: 'production-ai-2026-09-10-evening',
+    title: 'Večerní workshop dnes',
+    startsAt: '2026-09-10T21:00:00+02:00',
+    endsAt: '2026-09-10T22:00:00+02:00',
+};
+
 const THIS_WEEK_WORKSHOP: WorkshopSummary = {
     ...ONGOING_WORKSHOP,
     id: 'this-week-workshop-id',
@@ -213,17 +222,27 @@
         expect(pastCard?.textContent).toContain('Proběhlo');
     });
 
-    it('gives a term in the next seven days its own badge and calendar colour', () => {
-        renderWorkshopLinksPanel([ONGOING_WORKSHOP, TOMORROW_WORKSHOP, UPCOMING_WORKSHOP]);
+    it('distinguishes today, tomorrow, and the rest of the next seven days on cards and the calendar', () => {
+        renderWorkshopLinksPanel([THIS_WEEK_WORKSHOP, TOMORROW_WORKSHOP, TODAY_WORKSHOP, UPCOMING_WORKSHOP]);
 
+        expect(findCalendarDay('2026-09-10').className).toContain(
+            getWorkshopPhaseAppearance('upcoming-today').calendarDayClassName,
+        );
         expect(findCalendarDay('2026-09-11').className).toContain(
+            getWorkshopPhaseAppearance('upcoming-tomorrow').calendarDayClassName,
+        );
+        expect(findCalendarDay('2026-09-12').className).toContain(
             getWorkshopPhaseAppearance('upcoming-next-week').calendarDayClassName,
         );
+        expect(screen.getAllByText('Dneska')).toHaveLength(2);
+        expect(screen.getAllByText('Zítra')).toHaveLength(2);
         expect(screen.getAllByText('Tento týden')).toHaveLength(2);
 
         showCardsView();
 
-        const [, upcomingNextWeekCard, upcomingCard] = findTermLinks();
+        const [todayCard, tomorrowCard, upcomingNextWeekCard, upcomingCard] = findTermLinks();
+        expect(todayCard?.textContent).toContain('Dneska');
+        expect(tomorrowCard?.textContent).toContain('Zítra');
         expect(upcomingNextWeekCard?.textContent).toContain('Tento týden');
         expect(upcomingCard?.textContent).toContain('Nadchází');
     });
diff --git a/components/workshops/workshopPhaseAppearance.ts b/components/workshops/workshopPhaseAppearance.ts
index 397626aeeca074142ce787ebea7da16101b8f4ee..81ed54d491ff2b28c62b9de95d4df343cb3676a5
--- a/components/workshops/workshopPhaseAppearance.ts
+++ b/components/workshops/workshopPhaseAppearance.ts
@@ -34,8 +34,8 @@
  * The one description of how every phase looks, wherever a term is listed
  *
  * Note: A list of cards and a calendar of the same terms say the very same thing with the very same colour - green
- *       runs right now, amber has only just been held, violet starts within a week, cyan is further ahead, and grey is
- *       history - because both of them read their colours here instead of choosing their own.
+ *       runs right now, amber has only just been held, orange starts today, blue tomorrow, violet within a week, cyan
+ *       further ahead, and grey is history - because both read their colours here instead of choosing their own.
  * Note: These colours live beside the components which wear them rather than among the rules of the application,
  *       because only the directories of the components are read for the styles the application is built with.
  */
@@ -61,6 +61,24 @@
         calendarDayClassName: 'border-room-warning/40 bg-room-warning/10 text-room-warning',
         markClassName: 'bg-room-warning',
     },
+    'upcoming-today': {
+        label: 'Dneska',
+        badgeClassNameByTone: {
+            light: 'bg-orange-100 text-orange-800',
+            room: 'bg-room-upcoming-today/15 text-room-upcoming-today ring-1 ring-inset ring-room-upcoming-today/40',
+        },
+        calendarDayClassName: 'border-room-upcoming-today/40 bg-room-upcoming-today/10 text-room-upcoming-today',
+        markClassName: 'bg-room-upcoming-today',
+    },
+    'upcoming-tomorrow': {
+        label: 'Zítra',
+        badgeClassNameByTone: {
+            light: 'bg-blue-100 text-blue-800',
+            room: 'bg-room-upcoming-tomorrow/15 text-room-upcoming-tomorrow ring-1 ring-inset ring-room-upcoming-tomorrow/40',
+        },
+        calendarDayClassName: 'border-room-upcoming-tomorrow/40 bg-room-upcoming-tomorrow/10 text-room-upcoming-tomorrow',
+        markClassName: 'bg-room-upcoming-tomorrow',
+    },
     // Note: This stays distinct from the ordinary upcoming cyan so the special badge is useful even when a reader
     //       cannot infer a date at a glance.
     'upcoming-next-week': {
diff --git a/components/workshops/workshopRoomTheme.css b/components/workshops/workshopRoomTheme.css
index 3f5f35d8211be102c381f56b40f2d3e79a68be31..47c55c58a0db06612e949785c95ffc205584b310
--- a/components/workshops/workshopRoomTheme.css
+++ b/components/workshops/workshopRoomTheme.css
@@ -19,6 +19,8 @@
     --room-success: 167 243 208;
     --room-warning: 253 230 138;
     --room-danger: 253 164 175;
+    --room-upcoming-today: 253 186 116;
+    --room-upcoming-tomorrow: 147 197 253;
     --room-upcoming: 196 181 253;
     --room-graph-pink: 244 114 182;
     --room-color-scheme: dark;
@@ -44,6 +46,8 @@
     --room-success: 6 95 70;
     --room-warning: 146 64 14;
     --room-danger: 159 18 57;
+    --room-upcoming-today: 154 52 18;
+    --room-upcoming-tomorrow: 30 64 175;
     --room-upcoming: 109 40 217;
     --room-graph-pink: 190 24 93;
     --room-color-scheme: light;
diff --git a/lib/workshops/workshopPhase.test.ts b/lib/workshops/workshopPhase.test.ts
index 746ba57a99a0364e632cefb24b1412a8ea7d26df..8b34cd8e7b7fe7caa4f15b8cf9d229c3c3b9bd14
--- a/lib/workshops/workshopPhase.test.ts
+++ b/lib/workshops/workshopPhase.test.ts
@@ -41,6 +41,14 @@
     startsAt: '2026-08-24T19:00:00+02:00',
     endsAt: '2026-08-24T20:30:00+02:00',
 };
+const UPCOMING_TODAY_WORKSHOP: WorkshopOccurrenceTiming = {
+    startsAt: '2026-08-21T21:00:00+02:00',
+    endsAt: '2026-08-21T22:00:00+02:00',
+};
+const UPCOMING_TOMORROW_WORKSHOP: WorkshopOccurrenceTiming = {
+    startsAt: '2026-08-22T19:00:00+02:00',
+    endsAt: '2026-08-22T20:00:00+02:00',
+};
 const LATER_UPCOMING_WORKSHOP: WorkshopOccurrenceTiming = {
     startsAt: '2026-10-10T19:00:00+02:00',
     endsAt: '2026-10-10T20:30:00+02:00',
@@ -54,11 +62,24 @@
     it('places an occurrence against the given moment', () => {
         expect(getWorkshopPhase(UPCOMING_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming');
         expect(getWorkshopPhase(UPCOMING_NEXT_WEEK_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming-next-week');
+        expect(getWorkshopPhase(UPCOMING_TODAY_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming-today');
+        expect(getWorkshopPhase(UPCOMING_TOMORROW_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('upcoming-tomorrow');
         expect(getWorkshopPhase(ONGOING_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('ongoing');
         expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('freshly-past');
         expect(getWorkshopPhase(PAST_WORKSHOP, CURRENT_TIME_MILLISECONDS)).toBe('past');
     });
 
+    it.each([
+        ['2026-08-21T21:59:59Z', '2026-08-21T22:30:00Z', 'upcoming-tomorrow'],
+        ['2026-08-21T22:00:00Z', '2026-08-21T22:30:00Z', 'upcoming-today'],
+        ['2026-12-31T22:30:00Z', '2026-12-31T23:30:00Z', 'upcoming-tomorrow'],
+        ['2026-03-28T00:15:00+01:00', '2026-03-29T23:30:00+02:00', 'upcoming-tomorrow'],
+        ['2026-03-28T23:30:00+01:00', '2026-03-30T00:15:00+02:00', 'upcoming-next-week'],
+        ['2026-10-25T00:15:00+02:00', '2026-10-25T23:30:00+01:00', 'upcoming-today'],
+    ])('uses Prague calendar days from %s to classify %s as %s', (currentTime, startsAt, expectedPhase) => {
+        expect(getWorkshopPhase({ startsAt, endsAt: null }, Date.parse(currentTime))).toBe(expectedPhase);
+    });
+
     it('keeps an occurrence freshly past for a whole day after the end recorded for it', () => {
         expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, Date.parse('2026-08-20T20:30:01+02:00'))).toBe('freshly-past');
         expect(getWorkshopPhase(FRESHLY_PAST_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('freshly-past');
@@ -69,6 +90,8 @@
         expect(isWorkshopPhasePast('freshly-past')).toBe(true);
         expect(isWorkshopPhasePast('past')).toBe(true);
         expect(isWorkshopPhasePast('ongoing')).toBe(false);
+        expect(isWorkshopPhasePast('upcoming-today')).toBe(false);
+        expect(isWorkshopPhasePast('upcoming-tomorrow')).toBe(false);
         expect(isWorkshopPhasePast('upcoming-next-week')).toBe(false);
         expect(isWorkshopPhasePast('upcoming')).toBe(false);
     });
@@ -87,7 +110,9 @@
         expect(getWorkshopPhase(workshopAfterNextWeekBoundary, CURRENT_TIME_MILLISECONDS)).toBe('upcoming');
     });
 
-    it('counts both kinds of future term among the workshops which are still ahead', () => {
+    it('counts every kind of future term among the workshops which are still ahead', () => {
+        expect(isWorkshopPhaseUpcoming('upcoming-today')).toBe(true);
+        expect(isWorkshopPhaseUpcoming('upcoming-tomorrow')).toBe(true);
         expect(isWorkshopPhaseUpcoming('upcoming-next-week')).toBe(true);
         expect(isWorkshopPhaseUpcoming('upcoming')).toBe(true);
         expect(isWorkshopPhaseUpcoming('ongoing')).toBe(false);
@@ -106,7 +131,7 @@
         expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('ongoing');
         expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-12-24T18:00:00+01:00'))).toBe('ongoing');
         expect(getWorkshopPhase(OPEN_ENDED_WORKSHOP, Date.parse('2026-08-21T18:59:59+02:00'))).toBe(
-            'upcoming-next-week',
+            'upcoming-today',
         );
     });
 
@@ -134,7 +159,7 @@
     it('keeps an occurrence ongoing until its very end and imminent until its very start', () => {
         expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T19:00:00+02:00'))).toBe('ongoing');
         expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T18:59:59+02:00'))).toBe(
-            'upcoming-next-week',
+            'upcoming-today',
         );
         expect(getWorkshopPhase(ONGOING_WORKSHOP, Date.parse('2026-08-21T20:30:00+02:00'))).toBe('freshly-past');
     });
@@ -150,6 +175,8 @@
                 FRESHLY_PAST_WORKSHOP,
                 UPCOMING_WORKSHOP,
                 UPCOMING_NEXT_WEEK_WORKSHOP,
+                UPCOMING_TOMORROW_WORKSHOP,
+                UPCOMING_TODAY_WORKSHOP,
                 ONGOING_WORKSHOP,
             ],
             CURRENT_TIME_MILLISECONDS,
@@ -158,6 +185,8 @@
         expect(sortedWorkshops).toEqual([
             ONGOING_WORKSHOP,
             FRESHLY_PAST_WORKSHOP,
+            UPCOMING_TODAY_WORKSHOP,
+            UPCOMING_TOMORROW_WORKSHOP,
             UPCOMING_NEXT_WEEK_WORKSHOP,
             UPCOMING_WORKSHOP,
             LATER_UPCOMING_WORKSHOP,
@@ -183,6 +212,8 @@
                 FRESHLY_PAST_WORKSHOP,
                 UPCOMING_WORKSHOP,
                 UPCOMING_NEXT_WEEK_WORKSHOP,
+                UPCOMING_TOMORROW_WORKSHOP,
+                UPCOMING_TODAY_WORKSHOP,
                 ONGOING_WORKSHOP,
             ],
             CURRENT_TIME_MILLISECONDS,
@@ -191,6 +222,8 @@
         expect(workshopsByPhase).toEqual({
             ongoing: [ONGOING_WORKSHOP],
             'freshly-past': [FRESHLY_PAST_WORKSHOP],
+            'upcoming-today': [UPCOMING_TODAY_WORKSHOP],
+            'upcoming-tomorrow': [UPCOMING_TOMORROW_WORKSHOP],
             'upcoming-next-week': [UPCOMING_NEXT_WEEK_WORKSHOP],
             upcoming: [UPCOMING_WORKSHOP, LATER_UPCOMING_WORKSHOP],
             past: [PAST_WORKSHOP, OLDER_PAST_WORKSHOP],
@@ -199,6 +232,11 @@
 
     it('lets the most pressing phase speak for a group of occurrences', () => {
         expect(getMostProminentWorkshopPhase(['past', 'upcoming', 'ongoing'])).toBe('ongoing');
+        expect(getMostProminentWorkshopPhase(['upcoming-today', 'ongoing'])).toBe('ongoing');
+        expect(getMostProminentWorkshopPhase(['upcoming-tomorrow', 'upcoming-today', 'upcoming-next-week'])).toBe(
+            'upcoming-today',
+        );
+        expect(getMostProminentWorkshopPhase(['upcoming-next-week', 'upcoming-tomorrow'])).toBe('upcoming-tomorrow');
         expect(getMostProminentWorkshopPhase(['past', 'upcoming', 'upcoming-next-week'])).toBe('upcoming-next-week');
         expect(getMostProminentWorkshopPhase(['past', 'freshly-past', 'upcoming'])).toBe('freshly-past');
         expect(getMostProminentWorkshopPhase(['past', 'freshly-past'])).toBe('freshly-past');
diff --git a/lib/workshops/workshopPhase.ts b/lib/workshops/workshopPhase.ts
index 0ac9e8a2847c45355d50625381df66584f696536..ac1ea734d5ae6bdf4de3076aeeb2ce399051b59e
--- a/lib/workshops/workshopPhase.ts
+++ b/lib/workshops/workshopPhase.ts
@@ -1,3 +1,5 @@
+import { createCalendarDayKey } from '@/lib/calendar/calendarMonth';
+import { getRelativeCalendarDay } from '@/lib/calendar/czechRelativeDay';
 import {
     DEFAULT_WORKSHOP_DURATION_MINUTES,
     FRESHLY_PAST_WORKSHOP_HOURS,
@@ -6,6 +8,7 @@
 
 const MILLISECONDS_PER_MINUTE = 60 * 1000;
 const MILLISECONDS_PER_HOUR = 60 * MILLISECONDS_PER_MINUTE;
+const WORKSHOP_TIME_ZONE = 'Europe/Prague';
 
 /**
  * Where one occurrence currently stands in time, named from the most pressing phase to the least
@@ -15,10 +18,19 @@
  *       nothing to do with what they do with a workshop of last spring.
  * Note: An occurrence which starts during the next seven days is also a phase of its own, so a schedule can call
  *       attention to the terms somebody still has time to plan for without each surface calculating that window again.
+ *       Today and tomorrow take precedence within that window, using Prague calendar days rather than elapsed hours.
  * Note: This order is what ranks the phases wherever they are listed, coloured, or grouped, so a phase is placed among
  *       the others only here.
  */
-export const WORKSHOP_PHASE_VALUES = ['ongoing', 'freshly-past', 'upcoming-next-week', 'upcoming', 'past'] as const;
+export const WORKSHOP_PHASE_VALUES = [
+    'ongoing',
+    'freshly-past',
+    'upcoming-today',
+    'upcoming-tomorrow',
+    'upcoming-next-week',
+    'upcoming',
+    'past',
+] as const;
 
 export type WorkshopPhase = (typeof WORKSHOP_PHASE_VALUES)[number];
 
@@ -41,7 +53,12 @@
  *       badge.
  */
 export function isWorkshopPhaseUpcoming(phase: WorkshopPhase): boolean {
-    return phase === 'upcoming-next-week' || phase === 'upcoming';
+    return (
+        phase === 'upcoming-today' ||
+        phase === 'upcoming-tomorrow' ||
+        phase === 'upcoming-next-week' ||
+        phase === 'upcoming'
+    );
 }
 
 /**
@@ -127,6 +144,17 @@
 ): WorkshopPhase {
     const startsAtMilliseconds = Date.parse(occurrence.startsAt);
     if (isWorkshopStartingWithinNextWeek(startsAtMilliseconds, currentTimeMilliseconds)) {
+        const relativeDay = getRelativeCalendarDay(
+            createCalendarDayKey(occurrence.startsAt, WORKSHOP_TIME_ZONE),
+            createCalendarDayKey(new Date(currentTimeMilliseconds).toISOString(), WORKSHOP_TIME_ZONE),
+        );
+        if (relativeDay === 'today') {
+            return 'upcoming-today';
+        }
+        if (relativeDay === 'tomorrow') {
+            return 'upcoming-tomorrow';
+        }
+
         return 'upcoming-next-week';
     }
 
@@ -207,6 +235,8 @@
     const workshopsByPhase: Record<WorkshopPhase, TWorkshop[]> = {
         ongoing: [],
         'freshly-past': [],
+        'upcoming-today': [],
+        'upcoming-tomorrow': [],
         'upcoming-next-week': [],
         upcoming: [],
         past: [],
diff --git a/tailwind.config.ts b/tailwind.config.ts
index 8019f41f1539feedb45d402a70dd8ffff9aca8ad..db919851e4a1a55643569375d67dc665ab75a01b
--- a/tailwind.config.ts
+++ b/tailwind.config.ts
@@ -51,6 +51,8 @@
                     success: 'rgb(var(--room-success) / <alpha-value>)',
                     warning: 'rgb(var(--room-warning) / <alpha-value>)',
                     danger: 'rgb(var(--room-danger) / <alpha-value>)',
+                    'upcoming-today': 'rgb(var(--room-upcoming-today) / <alpha-value>)',
+                    'upcoming-tomorrow': 'rgb(var(--room-upcoming-tomorrow) / <alpha-value>)',
                     upcoming: 'rgb(var(--room-upcoming) / <alpha-value>)',
                 },
                 background: 'hsl(var(--background))',

tokens used
128,040
Added **Dneska** and **Zítra** badges across event cards, calendars, and admin categories using Prague dates. **Tento týden** remains for other events within seven days.

Verified: 95 tests passed, plus lint, production build, and TypeScript checks.
[1]-  Done                    bash "$1"

=== runner shell finished at 2026-09-21T14:22:42.683Z ===
Status: succeeded

=== test shell started at 2026-09-21T14:22:42.688Z ===
Script path: /Users/hejny/work/aldaron/.promptbook/coder-prompts/2026-09-0171-freshly-upcomming-events-3.test.sh

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
   Generating static pages (61/82) 
BenefitsSection rendered
IntegrationsSection rendered
BenefitsSection rendered
IntegrationsSection rendered
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
├ ○ /ai-ta-krajta                                                                         19.4 kB         146 kB          1h      1y
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
├ ƒ /cs/komunita                                                                            230 B         303 kB
├ ƒ /cs/komunita/calendar.ics                                                               414 B         102 kB
├ ƒ /cs/komunita/clenstvi                                                                 13.1 kB         155 kB
├ ○ /cs/komunita/clenstvi/opengraph-image                                                   414 B         102 kB
├ ○ /cs/komunita/opengraph-image                                                            414 B         102 kB
├ ƒ /cs/komunita/projects                                                                 6.77 kB         141 kB
├ ƒ /cs/komunita/projects/[projectId]                                                     2.94 kB         300 kB
├ ○ /cs/obchodni-podminky                                                                 2.52 kB         139 kB
├ ○ /cs/ochrana-osobnich-udaju                                                            2.52 kB         139 kB
├ ƒ /cs/online-workshop                                                                   13.2 kB         246 kB
├ ƒ /cs/online-workshop/dekujeme                                                          4.46 kB         152 kB
├ ○ /cs/online-workshop/opengraph-image                                                     414 B         102 kB
├ ƒ /cs/online-workshop/participant                                                       3.07 kB         300 kB
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

  ✓   1 tests/e2e/admin-autosave.spec.ts:52:5 › autosaves edits in order, protects reload while pending, and waits before navigating (7.7s)
  ✓   2 tests/e2e/admin-autosave.spec.ts:92:5 › retains a failed edit and retries it without leaving the settings (3.4s)
  ✓   3 tests/e2e/admin-autosave.spec.ts:109:5 › keeps invalid settings open and saves corrected settings before signing out (2.2s)
  ✓   4 tests/e2e/admin-modals.spec.ts:24:9 › edits and creates contacts in keyboard-accessible dialogs at 1440px (3.1s)
  ✓   5 tests/e2e/admin-modals.spec.ts:24:9 › edits and creates contacts in keyboard-accessible dialogs at 390px (2.4s)
  ✓   6 tests/e2e/admin-modals.spec.ts:77:5 › keeps failed discount creation visible in its dialog and autosaves later edits there (1.2s)
  ✓   7 tests/e2e/cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /cs (2.6s)
  ✓   8 tests/e2e/cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /en (2.1s)
  ✓   9 tests/e2e/cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /cs/ochrana-osobnich-udaju (1.7s)
  ✓  10 tests/e2e/cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /cs/komunita (3.5s)
  ✓  11 tests/e2e/cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /ai-supervize (2.8s)
  ✓  12 tests/e2e/cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /ai-supervize-mini (2.9s)
  ✓  13 tests/e2e/cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /ai-ta-krajta (2.5s)
  ✓  14 tests/e2e/cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /admin/login (1.1s)
  ✓  15 tests/e2e/cookie-consent.spec.ts:64:5 › cookie choices persist and the privacy link reopens settings after client navigation (3.0s)
  ✓  16 tests/e2e/cookie-consent.spec.ts:92:5 › cookie panel and coder badge clear a player opened later, resized and closed (1.7s)
  ✓  17 tests/e2e/cookie-consent.spec.ts:123:5 › a booking notice leaves cookie choices clickable and the footer can be scrolled clear (1.7s)
  ✓  18 tests/e2e/participant-promotion.spec.ts:50:9 › refreshes an author's pending total and submissions after trust on /cs/online-workshop/participant (2.2s)
  ✓  19 tests/e2e/participant-promotion.spec.ts:50:9 › refreshes an author's pending total and submissions after trust on /cs/komunita (3.4s)
  ✓  20 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs (885ms)
  ✓  21 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /en (854ms)
  ✓  22 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /pro-mesta (2.4s)
  ✓  23 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /for-agro (1.4s)
  ✓  24 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /for-industry (1.4s)
  ✓  25 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /ai-supervize (909ms)
  ✓  26 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /ai-supervize-mini (1.6s)
  ✓  27 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /ai-ta-krajta (1.0s)
  ✓  28 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /ai-ta-krajta/media-kit (1.5s)
  ✓  29 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /ai-ta-krajta/branding (1.3s)
  ✓  30 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /hackathon-factory (1.3s)
  ✓  31 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs/online-workshop (1.7s)
  ✓  32 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs/komunita/clenstvi (2.3s)
  ✓  33 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs/pavol (1.5s)
  ✓  34 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /en/pavol (1.8s)
  ✓  35 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs/ochrana-osobnich-udaju (666ms)
  ✓  36 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /en/privacy-policy (1.6s)
  ✓  37 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs/obchodni-podminky (1.3s)
  ✓  38 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /en/terms-and-conditions (1.2s)
  ✓  39 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /contact (1.3s)
  ✓  40 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /branding (2.7s)
  ✓  41 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /data-deletion (1.5s)
  ✓  42 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /old (2.2s)
  ✓  43 tests/e2e/public-pages.spec.ts:139:5 › AI ta Krajta collaboration section deep-links to its media kit (3.7s)
  ✓  44 tests/e2e/public-pages.spec.ts:150:5 › AI ta Krajta owns its metadata, icon and installable manifest and credits Promptbook coder (6.4s)
  ✓  45 tests/e2e/public-pages.spec.ts:246:5 › AI ta Krajta searches complete transcripts on the server without sending them to the browser (2.4s)
  ✓  46 tests/e2e/public-pages.spec.ts:264:9 › public address redirects to its page: / (11ms)
  ✓  47 tests/e2e/public-pages.spec.ts:264:9 › public address redirects to its page: /pavol (1.1s)
  ✓  48 tests/e2e/public-pages.spec.ts:264:9 › public address redirects to its page: /privacy (1.2s)
  ✓  49 tests/e2e/public-pages.spec.ts:264:9 › public address redirects to its page: /terms (669ms)
  ✓  50 tests/e2e/public-pages.spec.ts:264:9 › public address redirects to its page: /skoleni (708ms)
  ✓  51 tests/e2e/public-pages.spec.ts:278:5 › /skoleni carries a discount code to the workshop registration (22ms)
  ✓  52 tests/e2e/public-submissions.spec.ts:13:5 › submits the shared footer newsletter form (7.4s)
  ✓  53 tests/e2e/public-submissions.spec.ts:27:5 › submits the reusable get-started lead dialog (6.3s)
  ✓  54 tests/e2e/public-submissions.spec.ts:41:5 › submits the business lead dialog (1.5s)
  ✓  55 tests/e2e/public-submissions.spec.ts:55:5 › submits the homepage qualification lead flow (10.1s)
  ✓  56 tests/e2e/public-submissions.spec.ts:80:5 › submits Pavol’s personal contact form (4.5s)
  -  57 tests/e2e/public-submissions.spec.ts:96:5 › submits a published online-workshop registration
  ✓  58 tests/e2e/public-submissions.spec.ts:116:5 › personalizes and submits the 199 Kč Promptbook paid community membership (7.0s)
  ✓  59 tests/e2e/public-submissions.spec.ts:143:5 › submits an available AI Supervize Mini workshop registration (3.7s)
  ✓  60 tests/e2e/public-submissions.spec.ts:171:5 › submits the AI Supervize Mini future-term interest form (1.9s)
  ✓  61 tests/e2e/public-submissions.spec.ts:196:5 › submits the AI ta Krajta collaboration form (3.0s)
  ✓  62 tests/e2e/public-submissions.spec.ts:211:5 › plays the newest AI ta Krajta episode from the header (1.5s)
  ✓  63 tests/e2e/public-submissions.spec.ts:220:5 › resumes a half-played AI ta Krajta episode where its listener left it (2.5s)
  ✓  64 tests/e2e/public-submissions.spec.ts:254:5 › starts the AI ta Krajta minigame from its snake and keeps it local to the page (1.1s)
  ✓  65 tests/e2e/public-submissions.spec.ts:268:5 › filters the AI ta Krajta archive by a person and keeps its destination in the hash (1.5s)
  -  66 tests/e2e/public-submissions.spec.ts:280:5 › connects a public online-workshop participant
  ✓  67 tests/e2e/recording-studio.spec.ts:78:5 › requires admin authentication for the recording studio (10.6s)
  ✓  68 tests/e2e/recording-studio.spec.ts:83:5 › records separate sources, restores them, trims every track and exports playable editor material (16.3s)
  ✓  69 tests/e2e/recording-studio.spec.ts:164:5 › stops the whole take on disconnect and prevents a second tab from changing it (4.5s)
  ✓  70 tests/e2e/recording-studio.spec.ts:184:5 › recovers persisted chunks after an interrupted page and waits for stop before admin navigation (11.5s)
  ✓  71 tests/e2e/room-theme.spec.ts:96:5 › shares a saved room appearance, follows the device, and preserves the waiting-room form (14.1s)
  ✓  72 tests/e2e/room-theme.spec.ts:141:5 › themes connected rooms, materials, and portalled dialogs on desktop and mobile without losing drafts (11.7s)
  ✓  73 tests/e2e/workshop-agents.spec.ts:34:9 › defines a Book agent in the workshop administration (2.9s)
  ✓  74 tests/e2e/workshop-agents.spec.ts:34:9 › defines a Book agent in the community administration (7.0s)
  ✓  75 tests/e2e/workshop-repository-range.spec.ts:31:5 › edits independent commit bounds in workshop settings (4.3s)
  ✓  76 tests/e2e/workshop-repository-range.spec.ts:67:5 › previews the deployed app while browsing the highlighted workshop range (1.8s)
  ✓  77 tests/e2e/workshop-subtitles.spec.ts:63:5 › imports, autosaves, reloads and downloads private subtitles through the shared admin editor (2.4s)
  ✓  78 tests/e2e/workshop-subtitles.spec.ts:107:5 › decodes a long recording into bounded audio chunks and preserves multilingual timestamps (3.5s)
  ✓  79 tests/e2e/workshop-vercel-deployment.spec.ts:31:9 › deploys a workshop project and saves its ready URL through the existing settings form (6.2s)
  ✓  80 tests/e2e/workshop-vercel-deployment.spec.ts:31:9 › shows Vercel failure details and guidance, then saves the URL after retrying (11.2s)
  ✓  81 tests/e2e/workshop-wrap-up-pdf.spec.ts:34:5 › downloads the branded recap in the browser with local fonts, project preview, Git graph and short-link QR (2.6s)
Saved 76 E2E video(s) to tests/e2e/videos/.
Removed the E2E video(s) of 1 outdated run(s) from tests/e2e/videos/.

  2 skipped
  79 passed (4.6m)

> promptbook-landing-page@0.1.0 delete-test-data
> tsx scripts/delete-test-data.ts

Deleted 9 Contact row(s) and 0 workshop participant row(s) with an @example.com e-mail address.
[1]-  Done                    bash "$1"

=== test shell finished at 2026-09-21T14:27:44.406Z ===
Status: succeeded
````
