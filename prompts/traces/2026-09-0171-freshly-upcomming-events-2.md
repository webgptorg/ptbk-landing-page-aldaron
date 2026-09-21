# Run trace of `prompts/2026-09-0171-freshly-upcomming-events.md#17`

-   **Prompt:** Change the "Do týdne" badge to "Tento týden"
-   **Prompt section:** 2 of 2
-   **Outcome:** Succeeded
-   **Runner:** Developer on OpenAI Codex `gpt-6-astra` thinking `max` (ChatGPT account)
-   **Attempts:** 1
-   **Steps:** Implementation ~$0.1240 2 minutes; Testing 6 minutes
-   **Verification command:** `npm run test-for-ptbk-coder`
-   **Started:** 2026-09-21T01:16:17.216Z
-   **Finished:** 2026-09-21T01:23:33.686Z
-   **Duration:** 7 minutes

## Runtime log

````text
=== runner shell started at 2026-09-21T01:16:17.294Z ===
Script path: /Users/hejny/work/aldaron/.promptbook/coder-prompts/2026-09-0171-freshly-upcomming-events-2.sh

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

Change the "Do týdne" badge to "Tento týden"

![alt text](prompts/screenshots/2026-09-0171-freshly-upcomming-events.png)

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
  with: running and upcoming ones first, with a special `Do týdne` badge for a
  term beginning within the next seven rolling days, then the ones which ended
  within the last day, and the older finished ones behind a disclosure.
  Picking one changes the room being connected to and the `workshop` parameter,
  without losing the name and e-mail already typed.
  After the recorded end, its wrap-up offers a PDF generated in the browser from a fresh authenticated room response.
  The recap uses the existing description and material text for its summary and key points, includes accessible
  materials and public presentation/project links, and preserves the room's publication, unlock and membership rules.
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
  Everyone in the roster shows a normalized, transparent PNG portrait. The source
  crop is recorded by `scripts/_cutAiTaKrajtaPeoplePortraits.mjs`, from the
  episode cover the show itself published them on or from the picture they publish
  of themselves when no cover carries them; the final alpha PNG is named by the
  roster and a test verifies its format and transparent pixels. Portrait frames
  supply subtle, stable neutral-gradient variations and a restrained hover cue,
  so photographed backgrounds never compete with the page. The one people list
  is drawn anew
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
  address, and the first of them is the one a term card is previewed from.
  With a repository and no deployment URL, administration offers direct Vercel deployment using private `VERCEL_TOKEN`
  and optional `VERCEL_TEAM_ID`. One Vercel project per repository stays connected to its original GitHub source and
  deploys its production branch (initially the default branch), independently of the workshop's history selection.
  Administration polls the build and fills in its assigned production alias only when ready; the ordinary settings
  save publishes that URL. Manual URLs, a changed repository, and switching rooms discard stale pending results.
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

- Admin creation and editing use the shared `AdminEditorDialog` (and `AdminEditorButton` for a local trigger).
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
session id: 01a0c189-0568-7293-bb1c-9b49119725d5
--------
user

## Your Task

Change the "Do týdne" badge to "Tento týden"

![alt text](prompts/screenshots/2026-09-0171-freshly-upcomming-events.png)

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
  with: running and upcoming ones first, with a special `Do týdne` badge for a
  term beginning within the next seven rolling days, then the ones which ended
  within the last day, and the older finished ones behind a disclosure.
  Picking one changes the room being connected to and the `workshop` parameter,
  without losing the name and e-mail already typed.
  After the recorded end, its wrap-up offers a PDF generated in the browser from a fresh authenticated room response.
  The recap uses the existing description and material text for its summary and key points, includes accessible
  materials and public presentation/project links, and preserves the room's publication, unlock and membership rules.
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
  Everyone in the roster shows a normalized, transparent PNG portrait. The source
  crop is recorded by `scripts/_cutAiTaKrajtaPeoplePortraits.mjs`, from the
  episode cover the show itself published them on or from the picture they publish
  of themselves when no cover carries them; the final alpha PNG is named by the
  roster and a test verifies its format and transparent pixels. Portrait frames
  supply subtle, stable neutral-gradient variations and a restrained hover cue,
  so photographed backgrounds never compete with the page. The one people list
  is drawn anew
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
  address, and the first of them is the one a term card is previewed from.
  With a repository and no deployment URL, administration offers direct Vercel deployment using private `VERCEL_TOKEN`
  and optional `VERCEL_TEAM_ID`. One Vercel project per repository stays connected to its original GitHub source and
  deploys its production branch (initially the default branch), independently of the workshop's history selection.
  Administration polls the build and fills in its assigned production alias only when ready; the ordinary settings
  save publishes that URL. Manual URLs, a changed repository, and switching rooms discard stale pending results.
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

- Admin creation and editing use the shared `AdminEditorDialog` (and `AdminEditorButton` for a local trigger).
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
I’ll find where the badge text is defined, change it to “Tento týden,” and check the affected references.

exec
/bin/zsh -lc 'pwd && git status --short' in /Users/hejny/work/aldaron
 succeeded in 0ms:
/Users/hejny/work/aldaron
 M prompts/2026-09-0171-freshly-upcomming-events.md

exec
/bin/zsh -lc "rg --files -g AGENTS.md -g package.json -g '*workshopPhase*' -g '*freshly-upcomming*' -g '*jest*' -g '*vitest*' -g '*mocha*'" in /Users/hejny/work/aldaron
 succeeded in 0ms:
vitest.config.ts
AGENTS.md
prompts/prompts/screenshots/2026-09-0171-freshly-upcomming-events.png
prompts/2026-09-0171-freshly-upcomming-events.md
package.json
prompts/traces/2026-09-0171-freshly-upcomming-events.md
components/workshops/workshopPhaseAppearance.ts
lib/workshops/workshopPhase.test.ts
lib/workshops/workshopPhase.ts

exec
/bin/zsh -lc "rg -n --hidden -g '"'!node_modules'"' -g '"'!.git'"' -g '"'!.next'"' 'Do týdne|do týdne|Tento týden' ." in /Users/hejny/work/aldaron
 succeeded in 0ms:
./AGENTS.md:24:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./changelog/_current-preversion.md:79:  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./components/workshops/workshopPhaseAppearance.ts:67:        label: 'Do týdne',
./components/workshops/WorkshopLinksPanel.test.tsx:221:        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./components/workshops/WorkshopLinksPanel.test.tsx:226:        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./businesses/workshop-admin/WorkshopSelectorCardList.test.tsx:136:        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
./businesses/workshop-admin/WorkshopSelectorCardList.test.tsx:146:        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/2026-09-0171-freshly-upcomming-events.md:19:[✨🌷] Change the "Do týdne" badge to "Tento týden"
./prompts/traces/2026-09-0440-admin-recording-studio.md:162:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0440-admin-recording-studio.md:587:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0440-admin-recording-studio.md:939:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0440-admin-recording-studio.md:1469:  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0440-admin-recording-studio.md:32210:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0440-admin-recording-studio.md:32635:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0440-admin-recording-studio.md:33533:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx:175:        ).toContain('Do týdne');
./prompts/traces/2026-09-0410-workshop-project-auto-deployment-vercel.md:157:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0410-workshop-project-auto-deployment-vercel.md:577:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0410-workshop-project-auto-deployment-vercel.md:1080:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0410-workshop-project-auto-deployment-vercel.md:3262:  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0430-admin-modals.md:157:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0430-admin-modals.md:577:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0430-admin-modals.md:1744:  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:7078:"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command "Get-Content lib/workshops/workshopDate.ts; Get-Content lib/workshops/workshopDate.test.ts; rg -n \"next week|příští týden|do týdne|tento týden|týden\" businesses components lib --glob '"'!node_modules'"'" in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:7368:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:7544:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:7975:        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:8483:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:8759:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:9165:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:9554:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:11143:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:11545:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:11937:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:12458:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:13307:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:13832:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:14416:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:14837:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:15066:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:15484:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:15713:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:16134:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:16339:+        expect(screen.getByText('Do týdne')).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:16344:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:16404:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:16822:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:17027:+        expect(screen.getByText('Do týdne')).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:17032:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:17092:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:17455:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:17532:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:17737:+        expect(screen.getByText('Do týdne')).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:17742:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:17802:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:18162:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:18239:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:18444:+        expect(screen.getByText('Do týdne')).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:18449:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:18509:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:19023:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:19100:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:19305:+        expect(screen.getByText('Do týdne')).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:19310:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:19370:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:19701:The shared state and UI wiring are now in place: a term starting within seven rolling days is `upcoming-next-week`, has the violet `Do týdne` badge, and uses that same state in the community calendar/cards, participant term picker, admin selector, and follow-up recommendations. I’m validating the affected behavior next.
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:19734:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:19811:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:20016:+        expect(screen.getByText('Do týdne')).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:20021:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:20081:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:20441:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:20518:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:20723:+        expect(screen.getByText('Do týdne')).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:20728:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:20788:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:21138:     → Found multiple elements with the text: Do týdne
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:21150:  [0mDo týdne[0m
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:21157:  [0mDo týdne[0m
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:21337:TestingLibraryElementError: Found multiple elements with the text: Do týdne
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:21349:  [0mDo týdne[0m
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:21356:  [0mDo týdne[0m
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:21530:    222|         expect(screen.getByText('Do týdne')).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:21560:     → Found multiple elements with the text: Do týdne
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:21572:  [0mDo týdne[0m
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:21579:  [0mDo týdne[0m
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:21759:TestingLibraryElementError: Found multiple elements with the text: Do týdne
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:21771:  [0mDo týdne[0m
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:21778:  [0mDo týdne[0m
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:21952:    222|         expect(screen.getByText('Do týdne')).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:21996:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:22073:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:22278:+        expect(screen.getByText('Do týdne')).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:22283:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:22343:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:22706:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:22783:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:22988:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:22993:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:23053:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:23413:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:23490:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:23695:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:23700:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:23760:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:24105:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:24171:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:24248:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:24395:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:24470:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:24475:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:24535:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:24899:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:24965:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:25042:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:25189:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:25264:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:25269:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:25329:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:25715:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:25781:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:25858:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:26005:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:26080:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:26085:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:26145:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:26530:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:26736:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:26835:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:27004:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:27070:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:27147:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:27294:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:27369:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:27374:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:27434:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:27802:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:27868:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:27932:+        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:27945:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:28110:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:28185:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:28190:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:28250:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:28614:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:28680:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:28744:+        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:28757:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:28922:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:28997:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:29002:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:29062:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:29428:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:29494:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:29558:+        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:29571:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:29736:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:29811:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:29816:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:29876:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:30240:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:30306:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:30370:+        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:30383:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:30548:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:30623:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:30628:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:30688:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:31055:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:31121:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:31185:+        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:31198:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:31363:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:31438:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:31443:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:31503:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:31867:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:31933:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:31997:+        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:32010:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:32175:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:32250:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:32255:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:32315:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:32704:  Name "Do týdne (1)":
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:32741:  Name "Do týdne (1)":
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:32766:  Name "Seznam workshopů: Do týdne":
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:32768:    [33maria-label[39m=[32m"Seznam workshopů: Do týdne"[39m
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:32818:  Name "Produkční kód s AI agenty tento týden Do týdne 24.08.26 19:00 1 registrovaný 3 účastníci":
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:33027:  Name "Do týdne (1)":
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:33064:  Name "Do týdne (1)":
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:33089:  Name "Seznam workshopů: Do týdne":
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:33091:    [33maria-label[39m=[32m"Seznam workshopů: Do týdne"[39m
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:33141:  Name "Produkční kód s AI agenty tento týden Do týdne 24.08.26 19:00 1 registrovaný 3 účastníci":
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:33316:    136|         expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).…
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:33371:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:33437:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:33501:+        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:33514:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:33679:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:33754:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:33759:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:33819:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:34187:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:34253:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:34317:+        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:34330:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:34495:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:34570:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:34575:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:34635:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:34999:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:35065:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:35129:+        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:35142:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:35307:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:35382:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:35387:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:35447:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:35830:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:35896:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:35960:+        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:35973:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:36138:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:36213:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:36218:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:36278:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:36715:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:36781:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:36845:+        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:36858:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:37023:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:37098:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:37103:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:37163:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:37529:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:37595:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:37659:+        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:37672:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:37837:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:37912:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:37917:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:37977:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:38341:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:38407:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:38471:+        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:38484:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:38649:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:38724:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:38729:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:38789:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:40120:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:40186:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:40250:+        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:40263:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:40428:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:40503:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:40508:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:40568:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:40932:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:40998:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:41062:+        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:41075:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:41240:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:41315:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:41320:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:41380:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:41744:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:41810:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:41874:+        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:41887:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:42052:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:42127:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:42132:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:42192:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:42556:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:42622:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:42686:+        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:42699:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:42864:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:42939:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:42944:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:43004:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:43370:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:43436:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:43500:+        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:43513:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:43678:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:43753:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:43758:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:43818:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:44663:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:44729:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:44793:+        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:44806:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:44971:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:45046:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:45051:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:45111:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:45475:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:45541:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:45605:+        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:45618:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:45783:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:45858:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:45863:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:45923:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:46287:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:46353:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:46417:+        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:46430:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:46595:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:46670:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:46675:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:46735:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:47099:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:47165:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:47229:+        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:47242:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:47407:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:47482:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:47487:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:47547:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:47913:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:47979:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:48043:+        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:48056:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:48221:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:48296:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:48301:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:48361:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:48725:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:48791:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:48855:+        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:48868:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:49033:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:49108:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:49113:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:49173:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:49537:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:49603:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:49667:+        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:49680:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:49845:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:49920:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:49925:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:49985:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:50349:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:50415:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:50479:+        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:50492:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:50657:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:50732:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:50737:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:50797:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:51521:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:51587:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:51651:+        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:51664:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:51829:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:51904:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:51909:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:51969:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:52373:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:52439:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:52503:+        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:52516:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:52681:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:52756:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:52761:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:52821:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:53333:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:53399:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:53463:+        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:53476:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:53641:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:53716:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:53721:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:53781:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:54138:- `/cs/online-workshop/participant` and `/cs/komunita` show the violet `Do týdne` badge; community calendar uses the matching colour.
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:54159:+  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:54225:+        ).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:54289:+        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:54302:+        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:54467:+  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:54542:+        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:54547:+        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:54607:+        label: 'Do týdne',
./prompts/traces/2026-09-0171-freshly-upcomming-events.md:54965:- `/cs/online-workshop/participant` and `/cs/komunita` show the violet `Do týdne` badge; community calendar uses the matching colour.
./prompts/traces/2026-09-0420-admin-autosave.md:156:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0420-admin-autosave.md:575:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0420-admin-autosave.md:1583:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0420-admin-autosave.md:1981:  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0420-admin-autosave.md:115397:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0420-admin-autosave.md:115816:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0420-admin-autosave.md:116736:  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0420-admin-autosave.md:117025:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0230-workshop-cards-2.md:158:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0230-workshop-cards-2.md:554:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0230-workshop-cards-2.md:1100:  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0230-workshop-cards-2.md:2075:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0230-workshop-cards-2.md:2725:  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0230-workshop-cards-2.md:3156:        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./prompts/traces/2026-09-0230-workshop-cards-2.md:3161:        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
./prompts/traces/2026-09-0400-workshop-project-commits-from-to+auto.md:164:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0400-workshop-project-commits-from-to+auto.md:591:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0400-workshop-project-commits-from-to+auto.md:2111:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0400-workshop-project-commits-from-to+auto.md:5262:  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0240-wrap-up-pdf.md:156:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0240-wrap-up-pdf.md:551:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0240-wrap-up-pdf.md:2308:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0240-wrap-up-pdf.md:2732:  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0240-wrap-up-pdf.md:4105:  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0390-trusted-to-approve.md:156:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0390-trusted-to-approve.md:564:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0390-trusted-to-approve.md:1569:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0390-trusted-to-approve.md:4010:  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0390-trusted-to-approve.md:5999:  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0380-light-mode.md:155:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0380-light-mode.md:549:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0380-light-mode.md:1529:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0380-light-mode.md:1974:  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0380-light-mode.md:3327:        label: 'Do týdne',
./prompts/traces/2026-09-0380-light-mode.md:11388:         label: 'Do týdne',
./prompts/traces/2026-09-0380-light-mode.md:14527:        label: 'Do týdne',
./prompts/traces/2026-09-0380-light-mode.md:58552:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0380-light-mode.md:59102:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0380-light-mode.md:59720:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0380-light-mode.md:63022:         label: 'Do týdne',
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:162:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:568:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:908:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:3510:  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:44305:24-  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:48331:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:49180:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:50063:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:50943:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:51895:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:52779:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:53659:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:54554:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:55443:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:56332:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:57221:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:58105:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:58985:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:60067:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:60951:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:61841:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:62911:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:63793:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:64673:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:65568:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:66450:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:67330:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:68219:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:69110:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:70962:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:71845:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:72728:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:73629:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:74724:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:75607:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:76492:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:77391:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:77659:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:78457:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:79345:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:80241:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:81140:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:82083:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:82989:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:83892:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:84798:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:85704:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:86617:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:87640:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:88205:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:89169:   now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./prompts/traces/2026-09-0350-hide-artificial-options-in-admin.md:105693:  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term

exec
/bin/zsh -lc 'cat AGENTS.md package.json vitest.config.ts' in /Users/hejny/work/aldaron
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
  with: running and upcoming ones first, with a special `Do týdne` badge for a
  term beginning within the next seven rolling days, then the ones which ended
  within the last day, and the older finished ones behind a disclosure.
  Picking one changes the room being connected to and the `workshop` parameter,
  without losing the name and e-mail already typed.
  After the recorded end, its wrap-up offers a PDF generated in the browser from a fresh authenticated room response.
  The recap uses the existing description and material text for its summary and key points, includes accessible
  materials and public presentation/project links, and preserves the room's publication, unlock and membership rules.
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
  Everyone in the roster shows a normalized, transparent PNG portrait. The source
  crop is recorded by `scripts/_cutAiTaKrajtaPeoplePortraits.mjs`, from the
  episode cover the show itself published them on or from the picture they publish
  of themselves when no cover carries them; the final alpha PNG is named by the
  roster and a test verifies its format and transparent pixels. Portrait frames
  supply subtle, stable neutral-gradient variations and a restrained hover cue,
  so photographed backgrounds never compete with the page. The one people list
  is drawn anew
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
  address, and the first of them is the one a term card is previewed from.
  With a repository and no deployment URL, administration offers direct Vercel deployment using private `VERCEL_TOKEN`
  and optional `VERCEL_TEAM_ID`. One Vercel project per repository stays connected to its original GitHub source and
  deploys its production branch (initially the default branch), independently of the workshop's history selection.
  Administration polls the build and fills in its assigned production alias only when ready; the ordinary settings
  save publishes that URL. Manual URLs, a changed repository, and switching rooms discard stale pending results.
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

- Admin creation and editing use the shared `AdminEditorDialog` (and `AdminEditorButton` for a local trigger).
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

exec
/bin/zsh -lc 'cat components/workshops/workshopPhaseAppearance.ts lib/workshops/workshopPhase.ts' in /Users/hejny/work/aldaron
exec
/bin/zsh -lc "rg -n -C 4 -g '"'!prompts/**'"' -g '"'!node_modules/**'"' -g '"'!.next/**'"' 'Do týdne|do týdne|workshopPhaseAppearance|WORKSHOP_PHASE_APPEARANCE' components businesses lib tests changelog/_current-preversion.md" in /Users/hejny/work/aldaron
 succeeded in 0ms:
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
        label: 'Do týdne',
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

 succeeded in 0ms:
changelog/_current-preversion.md-75-  settings icon away and keeps its intentional state in the shareable address as `artopts=on` or `artopts=off`; it
changelog/_current-preversion.md-76-  changes no stored room data.
changelog/_current-preversion.md-77-
changelog/_current-preversion.md-78-- Added a fifth shared time state for event terms: a published term that begins within the next seven rolling days is
changelog/_current-preversion.md:79:  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
changelog/_current-preversion.md-80-  picker of `/cs/online-workshop/participant?workshop=`, while `/admin/workshops` gives ongoing, freshly past,
changelog/_current-preversion.md-81-  next-seven-day, later upcoming, and historical terms their own ordered categories. The shared future-term helper
changelog/_current-preversion.md-82-  keeps these imminent terms eligible for the post-workshop recommendation too, so highlighting a near event never
changelog/_current-preversion.md-83-  makes it disappear as the next workshop.
--
businesses/workshop-admin/WorkshopSelectorCardList.tsx-1-'use client';
businesses/workshop-admin/WorkshopSelectorCardList.tsx-2-
businesses/workshop-admin/WorkshopSelectorCardList.tsx-3-import { WorkshopSelectorCard } from '@/businesses/workshop-admin/WorkshopSelectorCard';
businesses/workshop-admin/WorkshopSelectorCardList.tsx-4-import { Input } from '@/components/ui/input';
businesses/workshop-admin/WorkshopSelectorCardList.tsx:5:import { getWorkshopPhaseAppearance } from '@/components/workshops/workshopPhaseAppearance';
businesses/workshop-admin/WorkshopSelectorCardList.tsx-6-import {
businesses/workshop-admin/WorkshopSelectorCardList.tsx-7-    getWorkshopPhase,
businesses/workshop-admin/WorkshopSelectorCardList.tsx-8-    groupWorkshopsByPhase,
businesses/workshop-admin/WorkshopSelectorCardList.tsx-9-    WORKSHOP_PHASE_VALUES,
--
businesses/workshop-admin/WorkshopSelectorCardList.test.tsx-132-        ]);
businesses/workshop-admin/WorkshopSelectorCardList.test.tsx-133-
businesses/workshop-admin/WorkshopSelectorCardList.test.tsx-134-        expect(screen.getByRole('heading', { name: 'Probíhá (1)' })).not.toBeNull();
businesses/workshop-admin/WorkshopSelectorCardList.test.tsx-135-        expect(screen.getByRole('heading', { name: 'Právě proběhlo (1)' })).not.toBeNull();
businesses/workshop-admin/WorkshopSelectorCardList.test.tsx:136:        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
businesses/workshop-admin/WorkshopSelectorCardList.test.tsx-137-        expect(screen.getByRole('heading', { name: 'Nadchází (1)' })).not.toBeNull();
businesses/workshop-admin/WorkshopSelectorCardList.test.tsx-138-        expect(getWorkshopCards().map((workshopCard) => workshopCard.textContent)).toEqual([
businesses/workshop-admin/WorkshopSelectorCardList.test.tsx-139-            expect.stringContaining(ONGOING_WORKSHOP.title),
businesses/workshop-admin/WorkshopSelectorCardList.test.tsx-140-            expect.stringContaining(FRESHLY_PAST_WORKSHOP.title),
--
businesses/workshop-admin/WorkshopSelectorCardList.test.tsx-142-            expect.stringContaining(UPCOMING_WORKSHOP.title),
businesses/workshop-admin/WorkshopSelectorCardList.test.tsx-143-        ]);
businesses/workshop-admin/WorkshopSelectorCardList.test.tsx-144-
businesses/workshop-admin/WorkshopSelectorCardList.test.tsx-145-        expect(getWorkshopCards()[1].textContent).toContain('Právě proběhlo');
businesses/workshop-admin/WorkshopSelectorCardList.test.tsx:146:        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
businesses/workshop-admin/WorkshopSelectorCardList.test.tsx-147-        expect(screen.getByRole('button', { name: 'Historie (1)' }).getAttribute('aria-expanded')).toBe('false');
businesses/workshop-admin/WorkshopSelectorCardList.test.tsx-148-    });
businesses/workshop-admin/WorkshopSelectorCardList.test.tsx-149-
businesses/workshop-admin/WorkshopSelectorCardList.test.tsx-150-    it('leaves the history closed while the selected workshop has only just been held', () => {
--
components/workshops/workshopPhaseAppearance.ts-38- *       history - because both of them read their colours here instead of choosing their own.
components/workshops/workshopPhaseAppearance.ts-39- * Note: These colours live beside the components which wear them rather than among the rules of the application,
components/workshops/workshopPhaseAppearance.ts-40- *       because only the directories of the components are read for the styles the application is built with.
components/workshops/workshopPhaseAppearance.ts-41- */
components/workshops/workshopPhaseAppearance.ts:42:const WORKSHOP_PHASE_APPEARANCES: Readonly<Record<WorkshopPhase, WorkshopPhaseAppearance>> = {
components/workshops/workshopPhaseAppearance.ts-43-    ongoing: {
components/workshops/workshopPhaseAppearance.ts-44-        label: 'Probíhá',
components/workshops/workshopPhaseAppearance.ts-45-        badgeClassNameByTone: {
components/workshops/workshopPhaseAppearance.ts-46-            light: 'bg-emerald-100 text-emerald-800',
--
components/workshops/workshopPhaseAppearance.ts-63-    },
components/workshops/workshopPhaseAppearance.ts-64-    // Note: This stays distinct from the ordinary upcoming cyan so the special badge is useful even when a reader
components/workshops/workshopPhaseAppearance.ts-65-    //       cannot infer a date at a glance.
components/workshops/workshopPhaseAppearance.ts-66-    'upcoming-next-week': {
components/workshops/workshopPhaseAppearance.ts:67:        label: 'Do týdne',
components/workshops/workshopPhaseAppearance.ts-68-        badgeClassNameByTone: {
components/workshops/workshopPhaseAppearance.ts-69-            light: 'bg-violet-100 text-violet-800',
components/workshops/workshopPhaseAppearance.ts-70-            room: 'bg-room-upcoming/15 text-room-upcoming ring-1 ring-inset ring-room-upcoming/40',
components/workshops/workshopPhaseAppearance.ts-71-        },
--
components/workshops/workshopPhaseAppearance.ts-92-    },
components/workshops/workshopPhaseAppearance.ts-93-};
components/workshops/workshopPhaseAppearance.ts-94-
components/workshops/workshopPhaseAppearance.ts-95-export function getWorkshopPhaseAppearance(phase: WorkshopPhase): WorkshopPhaseAppearance {
components/workshops/workshopPhaseAppearance.ts:96:    return WORKSHOP_PHASE_APPEARANCES[phase];
components/workshops/workshopPhaseAppearance.ts-97-}
--
components/workshops/WorkshopLinksPanel.test.tsx-5-import { WorkshopLinksPanel } from '@/components/workshops/WorkshopLinksPanel';
components/workshops/WorkshopLinksPanel.test.tsx-6-import { formatCalendarDayTitle } from '@/lib/calendar/calendarMonth';
components/workshops/WorkshopLinksPanel.test.tsx-7-import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
components/workshops/WorkshopLinksPanel.test.tsx-8-import { formatEventPrice } from '@/lib/events/eventPrice';
components/workshops/WorkshopLinksPanel.test.tsx:9:import { getWorkshopPhaseAppearance } from '@/components/workshops/workshopPhaseAppearance';
components/workshops/WorkshopLinksPanel.test.tsx-10-import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';
components/workshops/WorkshopLinksPanel.test.tsx-11-import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
components/workshops/WorkshopLinksPanel.test.tsx-12-import { afterEach, describe, expect, it } from 'vitest';
components/workshops/WorkshopLinksPanel.test.tsx-13-
--
components/workshops/WorkshopLinksPanel.test.tsx-217-
components/workshops/WorkshopLinksPanel.test.tsx-218-        expect(findCalendarDay('2026-09-11').className).toContain(
components/workshops/WorkshopLinksPanel.test.tsx-219-            getWorkshopPhaseAppearance('upcoming-next-week').calendarDayClassName,
components/workshops/WorkshopLinksPanel.test.tsx-220-        );
components/workshops/WorkshopLinksPanel.test.tsx:221:        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
components/workshops/WorkshopLinksPanel.test.tsx-222-
components/workshops/WorkshopLinksPanel.test.tsx-223-        showCardsView();
components/workshops/WorkshopLinksPanel.test.tsx-224-
components/workshops/WorkshopLinksPanel.test.tsx-225-        const [, upcomingNextWeekCard, upcomingCard] = findTermLinks();
components/workshops/WorkshopLinksPanel.test.tsx:226:        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
components/workshops/WorkshopLinksPanel.test.tsx-227-        expect(upcomingCard?.textContent).toContain('Nadchází');
components/workshops/WorkshopLinksPanel.test.tsx-228-    });
components/workshops/WorkshopLinksPanel.test.tsx-229-
components/workshops/WorkshopLinksPanel.test.tsx-230-    it('shows the created-project preview and replay length without review feedback on the mini card', () => {
--
components/workshops/WorkshopPhaseBadge.tsx-1-import {
components/workshops/WorkshopPhaseBadge.tsx-2-    getWorkshopPhaseAppearance,
components/workshops/WorkshopPhaseBadge.tsx-3-    type WorkshopPhaseTone,
components/workshops/WorkshopPhaseBadge.tsx:4:} from '@/components/workshops/workshopPhaseAppearance';
components/workshops/WorkshopPhaseBadge.tsx-5-import { classNames } from '@/lib/classNames';
components/workshops/WorkshopPhaseBadge.tsx-6-import type { WorkshopPhase } from '@/lib/workshops/workshopPhase';
components/workshops/WorkshopPhaseBadge.tsx-7-
components/workshops/WorkshopPhaseBadge.tsx-8-type WorkshopPhaseBadgeProps = {
--
components/workshops/WorkshopCalendarMonth.tsx-1-'use client';
components/workshops/WorkshopCalendarMonth.tsx-2-
components/workshops/WorkshopCalendarMonth.tsx-3-import { WorkshopCalendarDay } from '@/components/workshops/WorkshopCalendarDay';
components/workshops/WorkshopCalendarMonth.tsx-4-import { WorkshopEventCardList } from '@/components/workshops/WorkshopEventCardList';
components/workshops/WorkshopCalendarMonth.tsx:5:import { getWorkshopPhaseAppearance } from '@/components/workshops/workshopPhaseAppearance';
components/workshops/WorkshopCalendarMonth.tsx-6-import {
components/workshops/WorkshopCalendarMonth.tsx-7-    createCalendarMonthWeeks,
components/workshops/WorkshopCalendarMonth.tsx-8-    createCalendarWeekDayLabels,
components/workshops/WorkshopCalendarMonth.tsx-9-    formatCalendarDayTitle,
--
components/workshops/WorkshopCalendarDay.tsx:1:import { getWorkshopPhaseAppearance } from '@/components/workshops/workshopPhaseAppearance';
components/workshops/WorkshopCalendarDay.tsx-2-import { getCalendarDayNumber, type CalendarDayKey } from '@/lib/calendar/calendarMonth';
components/workshops/WorkshopCalendarDay.tsx-3-import { classNames } from '@/lib/classNames';
components/workshops/WorkshopCalendarDay.tsx-4-import type { EventListing } from '@/lib/events/eventListing';
components/workshops/WorkshopCalendarDay.tsx-5-import { getMostProminentWorkshopPhase, type WorkshopPhase } from '@/lib/workshops/workshopPhase';
--
businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx-171-        renderWaitingRoom(LATER_UPCOMING_WORKSHOP);
businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx-172-
businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx-173-        expect(
businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx-174-            screen.getByRole('button', { name: new RegExp(NEAREST_UPCOMING_WORKSHOP.title) }).textContent,
businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx:175:        ).toContain('Do týdne');
businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx-176-    });
businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx-177-
businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx-178-    it('names the workshop which has only just been held in the open, rather than filing it into the history', () => {
businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx-179-        renderWaitingRoom(LATER_UPCOMING_WORKSHOP, [...PUBLISHED_WORKSHOPS, FRESHLY_PAST_WORKSHOP]);

exec
/bin/zsh -lc "sed -n '295,420p' AGENTS.md" in /Users/hejny/work/aldaron
 succeeded in 0ms:
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

- Admin creation and editing use the shared `AdminEditorDialog` (and `AdminEditorButton` for a local trigger).
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
/bin/zsh -lc 'cat package.json vitest.config.ts components/workshops/workshopPhaseAppearance.ts components/workshops/WorkshopPhaseBadge.tsx' in /Users/hejny/work/aldaron
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
        label: 'Do týdne',
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
    getWorkshopPhaseAppearance,
    type WorkshopPhaseTone,
} from '@/components/workshops/workshopPhaseAppearance';
import { classNames } from '@/lib/classNames';
import type { WorkshopPhase } from '@/lib/workshops/workshopPhase';

type WorkshopPhaseBadgeProps = {
    readonly phase: WorkshopPhase;

    /**
     * Background this badge is placed on
     */
    readonly tone?: WorkshopPhaseTone;
    readonly className?: string;
};

/**
 * Says where one term stands in time, in the one colour that phase is drawn with everywhere
 */
export function WorkshopPhaseBadge({ phase, tone = 'light', className }: WorkshopPhaseBadgeProps) {
    const { label, badgeClassNameByTone } = getWorkshopPhaseAppearance(phase);

    return (
        <span
            className={classNames(
                'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold',
                badgeClassNameByTone[tone],
                className,
            )}
        >
            {label}
        </span>
    );
}

exec
/bin/zsh -lc "rg -n -g '"'!prompts/**'"' -g '"'!package-lock.json'"' 'Do týdne|do týdne|Tento týden' ." in /Users/hejny/work/aldaron
 succeeded in 0ms:
./AGENTS.md:24:  with: running and upcoming ones first, with a special `Do týdne` badge for a
./businesses/workshop-admin/WorkshopSelectorCardList.test.tsx:136:        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
./businesses/workshop-admin/WorkshopSelectorCardList.test.tsx:146:        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
./changelog/_current-preversion.md:79:  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
./businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx:175:        ).toContain('Do týdne');
./components/workshops/workshopPhaseAppearance.ts:67:        label: 'Do týdne',
./components/workshops/WorkshopLinksPanel.test.tsx:221:        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
./components/workshops/WorkshopLinksPanel.test.tsx:226:        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');

codex
The badge text comes from one shared definition used by event cards, the calendar, and the admin selector. I’ll update it there, along with the existing test expectations and documentation.

apply patch
patch: completed
/Users/hejny/work/aldaron/AGENTS.md
/Users/hejny/work/aldaron/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
/Users/hejny/work/aldaron/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
/Users/hejny/work/aldaron/changelog/_current-preversion.md
/Users/hejny/work/aldaron/components/workshops/WorkshopLinksPanel.test.tsx
/Users/hejny/work/aldaron/components/workshops/workshopPhaseAppearance.ts
diff --git a/AGENTS.md b/AGENTS.md
index a0de414676668d087267fc9c73a1f289a13469a8..16d7db22fac141d0412e3de0bf4d19342e7e37a8
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -21,7 +21,7 @@
   but all use one registration form. `/cs/online-workshop/dekujeme` is the
   full-load conversion page; `/participant` is the live room. Its waiting room
   offers every published term as the same term cards the landing page registers
-  with: running and upcoming ones first, with a special `Do týdne` badge for a
+  with: running and upcoming ones first, with a special `Tento týden` badge for a
   term beginning within the next seven rolling days, then the ones which ended
   within the last day, and the older finished ones behind a disclosure.
   Picking one changes the room being connected to and the `workshop` parameter,
diff --git a/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
index 4458aa8b7e1202ae0308d7f90b2cec1832d2701e..57b8fcd8dd0773a357f9328322d8d2259cbebe4c
--- a/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
@@ -172,7 +172,7 @@
 
         expect(
             screen.getByRole('button', { name: new RegExp(NEAREST_UPCOMING_WORKSHOP.title) }).textContent,
-        ).toContain('Do týdne');
+        ).toContain('Tento týden');
     });
 
     it('names the workshop which has only just been held in the open, rather than filing it into the history', () => {
diff --git a/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx b/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
index efe13e33491b637e401bb31a467b2134de7cadcd..0532d6441fc320af25f7f81a71ff4a257b382efd
--- a/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
+++ b/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
@@ -133,7 +133,7 @@
 
         expect(screen.getByRole('heading', { name: 'Probíhá (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Právě proběhlo (1)' })).not.toBeNull();
-        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
+        expect(screen.getByRole('heading', { name: 'Tento týden (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Nadchází (1)' })).not.toBeNull();
         expect(getWorkshopCards().map((workshopCard) => workshopCard.textContent)).toEqual([
             expect.stringContaining(ONGOING_WORKSHOP.title),
@@ -143,7 +143,7 @@
         ]);
 
         expect(getWorkshopCards()[1].textContent).toContain('Právě proběhlo');
-        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
+        expect(getWorkshopCards()[2].textContent).toContain('Tento týden');
         expect(screen.getByRole('button', { name: 'Historie (1)' }).getAttribute('aria-expanded')).toBe('false');
     });
 
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index db5a8c24b143aaca5b1db4cf1d5b53a37c44980a..7e18ee78f90fe0b51996999912b65b8b334b3843
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -76,7 +76,7 @@
   changes no stored room data.
 
 - Added a fifth shared time state for event terms: a published term that begins within the next seven rolling days is
-  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
+  now marked `Tento týden`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
   picker of `/cs/online-workshop/participant?workshop=`, while `/admin/workshops` gives ongoing, freshly past,
   next-seven-day, later upcoming, and historical terms their own ordered categories. The shared future-term helper
   keeps these imminent terms eligible for the post-workshop recommendation too, so highlighting a near event never
diff --git a/components/workshops/WorkshopLinksPanel.test.tsx b/components/workshops/WorkshopLinksPanel.test.tsx
index bc1e7733fe36b184928c8dd695011359a9cc869a..910569a5fa3cca869d187532520626b767c7d43b
--- a/components/workshops/WorkshopLinksPanel.test.tsx
+++ b/components/workshops/WorkshopLinksPanel.test.tsx
@@ -218,12 +218,12 @@
         expect(findCalendarDay('2026-09-11').className).toContain(
             getWorkshopPhaseAppearance('upcoming-next-week').calendarDayClassName,
         );
-        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
+        expect(screen.getAllByText('Tento týden')).toHaveLength(2);
 
         showCardsView();
 
         const [, upcomingNextWeekCard, upcomingCard] = findTermLinks();
-        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
+        expect(upcomingNextWeekCard?.textContent).toContain('Tento týden');
         expect(upcomingCard?.textContent).toContain('Nadchází');
     });
 
diff --git a/components/workshops/workshopPhaseAppearance.ts b/components/workshops/workshopPhaseAppearance.ts
index b0af480e1efbdfc5350bbef73f634b159f131cff..397626aeeca074142ce787ebea7da16101b8f4ee
--- a/components/workshops/workshopPhaseAppearance.ts
+++ b/components/workshops/workshopPhaseAppearance.ts
@@ -64,7 +64,7 @@
     // Note: This stays distinct from the ordinary upcoming cyan so the special badge is useful even when a reader
     //       cannot infer a date at a glance.
     'upcoming-next-week': {
-        label: 'Do týdne',
+        label: 'Tento týden',
         badgeClassNameByTone: {
             light: 'bg-violet-100 text-violet-800',
             room: 'bg-room-upcoming/15 text-room-upcoming ring-1 ring-inset ring-room-upcoming/40',

diff --git a/AGENTS.md b/AGENTS.md
index a0de414676668d087267fc9c73a1f289a13469a8..16d7db22fac141d0412e3de0bf4d19342e7e37a8
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -21,7 +21,7 @@
   but all use one registration form. `/cs/online-workshop/dekujeme` is the
   full-load conversion page; `/participant` is the live room. Its waiting room
   offers every published term as the same term cards the landing page registers
-  with: running and upcoming ones first, with a special `Do týdne` badge for a
+  with: running and upcoming ones first, with a special `Tento týden` badge for a
   term beginning within the next seven rolling days, then the ones which ended
   within the last day, and the older finished ones behind a disclosure.
   Picking one changes the room being connected to and the `workshop` parameter,
diff --git a/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
index 4458aa8b7e1202ae0308d7f90b2cec1832d2701e..57b8fcd8dd0773a357f9328322d8d2259cbebe4c
--- a/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
@@ -172,7 +172,7 @@
 
         expect(
             screen.getByRole('button', { name: new RegExp(NEAREST_UPCOMING_WORKSHOP.title) }).textContent,
-        ).toContain('Do týdne');
+        ).toContain('Tento týden');
     });
 
     it('names the workshop which has only just been held in the open, rather than filing it into the history', () => {
diff --git a/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx b/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
index efe13e33491b637e401bb31a467b2134de7cadcd..0532d6441fc320af25f7f81a71ff4a257b382efd
--- a/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
+++ b/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
@@ -133,7 +133,7 @@
 
         expect(screen.getByRole('heading', { name: 'Probíhá (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Právě proběhlo (1)' })).not.toBeNull();
-        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
+        expect(screen.getByRole('heading', { name: 'Tento týden (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Nadchází (1)' })).not.toBeNull();
         expect(getWorkshopCards().map((workshopCard) => workshopCard.textContent)).toEqual([
             expect.stringContaining(ONGOING_WORKSHOP.title),
@@ -143,7 +143,7 @@
         ]);
 
         expect(getWorkshopCards()[1].textContent).toContain('Právě proběhlo');
-        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
+        expect(getWorkshopCards()[2].textContent).toContain('Tento týden');
         expect(screen.getByRole('button', { name: 'Historie (1)' }).getAttribute('aria-expanded')).toBe('false');
     });
 
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index db5a8c24b143aaca5b1db4cf1d5b53a37c44980a..7e18ee78f90fe0b51996999912b65b8b334b3843
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -76,7 +76,7 @@
   changes no stored room data.
 
 - Added a fifth shared time state for event terms: a published term that begins within the next seven rolling days is
-  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
+  now marked `Tento týden`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
   picker of `/cs/online-workshop/participant?workshop=`, while `/admin/workshops` gives ongoing, freshly past,
   next-seven-day, later upcoming, and historical terms their own ordered categories. The shared future-term helper
   keeps these imminent terms eligible for the post-workshop recommendation too, so highlighting a near event never
diff --git a/components/workshops/WorkshopLinksPanel.test.tsx b/components/workshops/WorkshopLinksPanel.test.tsx
index bc1e7733fe36b184928c8dd695011359a9cc869a..910569a5fa3cca869d187532520626b767c7d43b
--- a/components/workshops/WorkshopLinksPanel.test.tsx
+++ b/components/workshops/WorkshopLinksPanel.test.tsx
@@ -218,12 +218,12 @@
         expect(findCalendarDay('2026-09-11').className).toContain(
             getWorkshopPhaseAppearance('upcoming-next-week').calendarDayClassName,
         );
-        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
+        expect(screen.getAllByText('Tento týden')).toHaveLength(2);
 
         showCardsView();
 
         const [, upcomingNextWeekCard, upcomingCard] = findTermLinks();
-        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
+        expect(upcomingNextWeekCard?.textContent).toContain('Tento týden');
         expect(upcomingCard?.textContent).toContain('Nadchází');
     });
 
diff --git a/components/workshops/workshopPhaseAppearance.ts b/components/workshops/workshopPhaseAppearance.ts
index b0af480e1efbdfc5350bbef73f634b159f131cff..397626aeeca074142ce787ebea7da16101b8f4ee
--- a/components/workshops/workshopPhaseAppearance.ts
+++ b/components/workshops/workshopPhaseAppearance.ts
@@ -64,7 +64,7 @@
     // Note: This stays distinct from the ordinary upcoming cyan so the special badge is useful even when a reader
     //       cannot infer a date at a glance.
     'upcoming-next-week': {
-        label: 'Do týdne',
+        label: 'Tento týden',
         badgeClassNameByTone: {
             light: 'bg-violet-100 text-violet-800',
             room: 'bg-room-upcoming/15 text-room-upcoming ring-1 ring-inset ring-room-upcoming/40',

exec
/bin/zsh -lc 'git diff --check && git diff --stat && git diff -- AGENTS.md changelog/_current-preversion.md components/workshops/workshopPhaseAppearance.ts components/workshops/WorkshopLinksPanel.test.tsx businesses/workshop-admin/WorkshopSelectorCardList.test.tsx businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx' in /Users/hejny/work/aldaron
 exited 2 in 0ms:
prompts/2026-09-0171-freshly-upcomming-events.md:22: new blank line at EOF.

exec
/bin/zsh -lc 'npm test -- components/workshops/WorkshopLinksPanel.test.tsx businesses/workshop-admin/WorkshopSelectorCardList.test.tsx businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx' in /Users/hejny/work/aldaron
diff --git a/AGENTS.md b/AGENTS.md
index a0de414676668d087267fc9c73a1f289a13469a8..16d7db22fac141d0412e3de0bf4d19342e7e37a8
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -21,7 +21,7 @@
   but all use one registration form. `/cs/online-workshop/dekujeme` is the
   full-load conversion page; `/participant` is the live room. Its waiting room
   offers every published term as the same term cards the landing page registers
-  with: running and upcoming ones first, with a special `Do týdne` badge for a
+  with: running and upcoming ones first, with a special `Tento týden` badge for a
   term beginning within the next seven rolling days, then the ones which ended
   within the last day, and the older finished ones behind a disclosure.
   Picking one changes the room being connected to and the `workshop` parameter,
diff --git a/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
index 4458aa8b7e1202ae0308d7f90b2cec1832d2701e..57b8fcd8dd0773a357f9328322d8d2259cbebe4c
--- a/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
@@ -172,7 +172,7 @@
 
         expect(
             screen.getByRole('button', { name: new RegExp(NEAREST_UPCOMING_WORKSHOP.title) }).textContent,
-        ).toContain('Do týdne');
+        ).toContain('Tento týden');
     });
 
     it('names the workshop which has only just been held in the open, rather than filing it into the history', () => {
diff --git a/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx b/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
index efe13e33491b637e401bb31a467b2134de7cadcd..0532d6441fc320af25f7f81a71ff4a257b382efd
--- a/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
+++ b/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
@@ -133,7 +133,7 @@
 
         expect(screen.getByRole('heading', { name: 'Probíhá (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Právě proběhlo (1)' })).not.toBeNull();
-        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
+        expect(screen.getByRole('heading', { name: 'Tento týden (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Nadchází (1)' })).not.toBeNull();
         expect(getWorkshopCards().map((workshopCard) => workshopCard.textContent)).toEqual([
             expect.stringContaining(ONGOING_WORKSHOP.title),
@@ -143,7 +143,7 @@
         ]);
 
         expect(getWorkshopCards()[1].textContent).toContain('Právě proběhlo');
-        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
+        expect(getWorkshopCards()[2].textContent).toContain('Tento týden');
         expect(screen.getByRole('button', { name: 'Historie (1)' }).getAttribute('aria-expanded')).toBe('false');
     });
 
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index db5a8c24b143aaca5b1db4cf1d5b53a37c44980a..7e18ee78f90fe0b51996999912b65b8b334b3843
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -76,7 +76,7 @@
   changes no stored room data.
 
 - Added a fifth shared time state for event terms: a published term that begins within the next seven rolling days is
-  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
+  now marked `Tento týden`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
   picker of `/cs/online-workshop/participant?workshop=`, while `/admin/workshops` gives ongoing, freshly past,
   next-seven-day, later upcoming, and historical terms their own ordered categories. The shared future-term helper
   keeps these imminent terms eligible for the post-workshop recommendation too, so highlighting a near event never
diff --git a/components/workshops/WorkshopLinksPanel.test.tsx b/components/workshops/WorkshopLinksPanel.test.tsx
index bc1e7733fe36b184928c8dd695011359a9cc869a..910569a5fa3cca869d187532520626b767c7d43b
--- a/components/workshops/WorkshopLinksPanel.test.tsx
+++ b/components/workshops/WorkshopLinksPanel.test.tsx
@@ -218,12 +218,12 @@
         expect(findCalendarDay('2026-09-11').className).toContain(
             getWorkshopPhaseAppearance('upcoming-next-week').calendarDayClassName,
         );
-        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
+        expect(screen.getAllByText('Tento týden')).toHaveLength(2);
 
         showCardsView();
 
         const [, upcomingNextWeekCard, upcomingCard] = findTermLinks();
-        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
+        expect(upcomingNextWeekCard?.textContent).toContain('Tento týden');
         expect(upcomingCard?.textContent).toContain('Nadchází');
     });
 
diff --git a/components/workshops/workshopPhaseAppearance.ts b/components/workshops/workshopPhaseAppearance.ts
index b0af480e1efbdfc5350bbef73f634b159f131cff..397626aeeca074142ce787ebea7da16101b8f4ee
--- a/components/workshops/workshopPhaseAppearance.ts
+++ b/components/workshops/workshopPhaseAppearance.ts
@@ -64,7 +64,7 @@
     // Note: This stays distinct from the ordinary upcoming cyan so the special badge is useful even when a reader
     //       cannot infer a date at a glance.
     'upcoming-next-week': {
-        label: 'Do týdne',
+        label: 'Tento týden',
         badgeClassNameByTone: {
             light: 'bg-violet-100 text-violet-800',
             room: 'bg-room-upcoming/15 text-room-upcoming ring-1 ring-inset ring-room-upcoming/40',

 succeeded in 2452ms:

 RUN  v3.2.4 /Users/hejny/work/aldaron

 ✓ businesses/workshop-admin/WorkshopSelectorCardList.test.tsx (11 tests) 127ms
 ✓ components/workshops/WorkshopLinksPanel.test.tsx (16 tests) 352ms
 ✓ businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx (8 tests) 134ms

 Test Files  3 passed (3)
      Tests  35 passed (35)
   Start at  03:17:34
   Duration  1.62s (transform 432ms, setup 0ms, collect 1.10s, tests 612ms, environment 958ms, prepare 102ms)


exec
/bin/zsh -lc 'git diff --check -- AGENTS.md changelog/_current-preversion.md components/workshops/workshopPhaseAppearance.ts components/workshops/WorkshopLinksPanel.test.tsx businesses/workshop-admin/WorkshopSelectorCardList.test.tsx businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx && git diff -- AGENTS.md changelog/_current-preversion.md components/workshops/workshopPhaseAppearance.ts components/workshops/WorkshopLinksPanel.test.tsx businesses/workshop-admin/WorkshopSelectorCardList.test.tsx businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx && git status --short' in /Users/hejny/work/aldaron
 succeeded in 0ms:
diff --git a/AGENTS.md b/AGENTS.md
index a0de414..16d7db2 100644
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -21,7 +21,7 @@ use cases, and audiences. Keep these rules current when behavior changes.
   but all use one registration form. `/cs/online-workshop/dekujeme` is the
   full-load conversion page; `/participant` is the live room. Its waiting room
   offers every published term as the same term cards the landing page registers
-  with: running and upcoming ones first, with a special `Do týdne` badge for a
+  with: running and upcoming ones first, with a special `Tento týden` badge for a
   term beginning within the next seven rolling days, then the ones which ended
   within the last day, and the older finished ones behind a disclosure.
   Picking one changes the room being connected to and the `workshop` parameter,
diff --git a/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
index 4458aa8..57b8fcd 100644
--- a/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
@@ -172,7 +172,7 @@ describe('online workshop waiting room', () => {
 
         expect(
             screen.getByRole('button', { name: new RegExp(NEAREST_UPCOMING_WORKSHOP.title) }).textContent,
-        ).toContain('Do týdne');
+        ).toContain('Tento týden');
     });
 
     it('names the workshop which has only just been held in the open, rather than filing it into the history', () => {
diff --git a/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx b/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
index efe13e3..0532d64 100644
--- a/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
+++ b/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
@@ -133,7 +133,7 @@ describe('workshop selector card list', () => {
 
         expect(screen.getByRole('heading', { name: 'Probíhá (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Právě proběhlo (1)' })).not.toBeNull();
-        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
+        expect(screen.getByRole('heading', { name: 'Tento týden (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Nadchází (1)' })).not.toBeNull();
         expect(getWorkshopCards().map((workshopCard) => workshopCard.textContent)).toEqual([
             expect.stringContaining(ONGOING_WORKSHOP.title),
@@ -143,7 +143,7 @@ describe('workshop selector card list', () => {
         ]);
 
         expect(getWorkshopCards()[1].textContent).toContain('Právě proběhlo');
-        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
+        expect(getWorkshopCards()[2].textContent).toContain('Tento týden');
         expect(screen.getByRole('button', { name: 'Historie (1)' }).getAttribute('aria-expanded')).toBe('false');
     });
 
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index db5a8c2..7e18ee7 100644
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -76,7 +76,7 @@
   changes no stored room data.
 
 - Added a fifth shared time state for event terms: a published term that begins within the next seven rolling days is
-  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
+  now marked `Tento týden`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
   picker of `/cs/online-workshop/participant?workshop=`, while `/admin/workshops` gives ongoing, freshly past,
   next-seven-day, later upcoming, and historical terms their own ordered categories. The shared future-term helper
   keeps these imminent terms eligible for the post-workshop recommendation too, so highlighting a near event never
diff --git a/components/workshops/WorkshopLinksPanel.test.tsx b/components/workshops/WorkshopLinksPanel.test.tsx
index bc1e773..910569a 100644
--- a/components/workshops/WorkshopLinksPanel.test.tsx
+++ b/components/workshops/WorkshopLinksPanel.test.tsx
@@ -218,12 +218,12 @@ describe('workshop links panel', () => {
         expect(findCalendarDay('2026-09-11').className).toContain(
             getWorkshopPhaseAppearance('upcoming-next-week').calendarDayClassName,
         );
-        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
+        expect(screen.getAllByText('Tento týden')).toHaveLength(2);
 
         showCardsView();
 
         const [, upcomingNextWeekCard, upcomingCard] = findTermLinks();
-        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
+        expect(upcomingNextWeekCard?.textContent).toContain('Tento týden');
         expect(upcomingCard?.textContent).toContain('Nadchází');
     });
 
diff --git a/components/workshops/workshopPhaseAppearance.ts b/components/workshops/workshopPhaseAppearance.ts
index b0af480..397626a 100644
--- a/components/workshops/workshopPhaseAppearance.ts
+++ b/components/workshops/workshopPhaseAppearance.ts
@@ -64,7 +64,7 @@ const WORKSHOP_PHASE_APPEARANCES: Readonly<Record<WorkshopPhase, WorkshopPhaseAp
     // Note: This stays distinct from the ordinary upcoming cyan so the special badge is useful even when a reader
     //       cannot infer a date at a glance.
     'upcoming-next-week': {
-        label: 'Do týdne',
+        label: 'Tento týden',
         badgeClassNameByTone: {
             light: 'bg-violet-100 text-violet-800',
             room: 'bg-room-upcoming/15 text-room-upcoming ring-1 ring-inset ring-room-upcoming/40',
 M AGENTS.md
 M businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
 M businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
 M changelog/_current-preversion.md
 M components/workshops/WorkshopLinksPanel.test.tsx
 M components/workshops/workshopPhaseAppearance.ts
 M prompts/2026-09-0171-freshly-upcomming-events.md

diff --git a/AGENTS.md b/AGENTS.md
index a0de414676668d087267fc9c73a1f289a13469a8..16d7db22fac141d0412e3de0bf4d19342e7e37a8
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -21,7 +21,7 @@
   but all use one registration form. `/cs/online-workshop/dekujeme` is the
   full-load conversion page; `/participant` is the live room. Its waiting room
   offers every published term as the same term cards the landing page registers
-  with: running and upcoming ones first, with a special `Do týdne` badge for a
+  with: running and upcoming ones first, with a special `Tento týden` badge for a
   term beginning within the next seven rolling days, then the ones which ended
   within the last day, and the older finished ones behind a disclosure.
   Picking one changes the room being connected to and the `workshop` parameter,
diff --git a/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
index 4458aa8b7e1202ae0308d7f90b2cec1832d2701e..57b8fcd8dd0773a357f9328322d8d2259cbebe4c
--- a/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
@@ -172,7 +172,7 @@
 
         expect(
             screen.getByRole('button', { name: new RegExp(NEAREST_UPCOMING_WORKSHOP.title) }).textContent,
-        ).toContain('Do týdne');
+        ).toContain('Tento týden');
     });
 
     it('names the workshop which has only just been held in the open, rather than filing it into the history', () => {
diff --git a/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx b/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
index efe13e33491b637e401bb31a467b2134de7cadcd..0532d6441fc320af25f7f81a71ff4a257b382efd
--- a/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
+++ b/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
@@ -133,7 +133,7 @@
 
         expect(screen.getByRole('heading', { name: 'Probíhá (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Právě proběhlo (1)' })).not.toBeNull();
-        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
+        expect(screen.getByRole('heading', { name: 'Tento týden (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Nadchází (1)' })).not.toBeNull();
         expect(getWorkshopCards().map((workshopCard) => workshopCard.textContent)).toEqual([
             expect.stringContaining(ONGOING_WORKSHOP.title),
@@ -143,7 +143,7 @@
         ]);
 
         expect(getWorkshopCards()[1].textContent).toContain('Právě proběhlo');
-        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
+        expect(getWorkshopCards()[2].textContent).toContain('Tento týden');
         expect(screen.getByRole('button', { name: 'Historie (1)' }).getAttribute('aria-expanded')).toBe('false');
     });
 
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index db5a8c24b143aaca5b1db4cf1d5b53a37c44980a..7e18ee78f90fe0b51996999912b65b8b334b3843
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -76,7 +76,7 @@
   changes no stored room data.
 
 - Added a fifth shared time state for event terms: a published term that begins within the next seven rolling days is
-  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
+  now marked `Tento týden`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
   picker of `/cs/online-workshop/participant?workshop=`, while `/admin/workshops` gives ongoing, freshly past,
   next-seven-day, later upcoming, and historical terms their own ordered categories. The shared future-term helper
   keeps these imminent terms eligible for the post-workshop recommendation too, so highlighting a near event never
diff --git a/components/workshops/WorkshopLinksPanel.test.tsx b/components/workshops/WorkshopLinksPanel.test.tsx
index bc1e7733fe36b184928c8dd695011359a9cc869a..910569a5fa3cca869d187532520626b767c7d43b
--- a/components/workshops/WorkshopLinksPanel.test.tsx
+++ b/components/workshops/WorkshopLinksPanel.test.tsx
@@ -218,12 +218,12 @@
         expect(findCalendarDay('2026-09-11').className).toContain(
             getWorkshopPhaseAppearance('upcoming-next-week').calendarDayClassName,
         );
-        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
+        expect(screen.getAllByText('Tento týden')).toHaveLength(2);
 
         showCardsView();
 
         const [, upcomingNextWeekCard, upcomingCard] = findTermLinks();
-        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
+        expect(upcomingNextWeekCard?.textContent).toContain('Tento týden');
         expect(upcomingCard?.textContent).toContain('Nadchází');
     });
 
diff --git a/components/workshops/workshopPhaseAppearance.ts b/components/workshops/workshopPhaseAppearance.ts
index b0af480e1efbdfc5350bbef73f634b159f131cff..397626aeeca074142ce787ebea7da16101b8f4ee
--- a/components/workshops/workshopPhaseAppearance.ts
+++ b/components/workshops/workshopPhaseAppearance.ts
@@ -64,7 +64,7 @@
     // Note: This stays distinct from the ordinary upcoming cyan so the special badge is useful even when a reader
     //       cannot infer a date at a glance.
     'upcoming-next-week': {
-        label: 'Do týdne',
+        label: 'Tento týden',
         badgeClassNameByTone: {
             light: 'bg-violet-100 text-violet-800',
             room: 'bg-room-upcoming/15 text-room-upcoming ring-1 ring-inset ring-room-upcoming/40',

codex
Changed the shared badge text from “Do týdne” to “Tento týden” everywhere it’s used.

Updated documentation and existing test expectations. All 35 affected tests pass.
diff --git a/AGENTS.md b/AGENTS.md
index a0de414676668d087267fc9c73a1f289a13469a8..16d7db22fac141d0412e3de0bf4d19342e7e37a8
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -21,7 +21,7 @@
   but all use one registration form. `/cs/online-workshop/dekujeme` is the
   full-load conversion page; `/participant` is the live room. Its waiting room
   offers every published term as the same term cards the landing page registers
-  with: running and upcoming ones first, with a special `Do týdne` badge for a
+  with: running and upcoming ones first, with a special `Tento týden` badge for a
   term beginning within the next seven rolling days, then the ones which ended
   within the last day, and the older finished ones behind a disclosure.
   Picking one changes the room being connected to and the `workshop` parameter,
diff --git a/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
index 4458aa8b7e1202ae0308d7f90b2cec1832d2701e..57b8fcd8dd0773a357f9328322d8d2259cbebe4c
--- a/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
@@ -172,7 +172,7 @@
 
         expect(
             screen.getByRole('button', { name: new RegExp(NEAREST_UPCOMING_WORKSHOP.title) }).textContent,
-        ).toContain('Do týdne');
+        ).toContain('Tento týden');
     });
 
     it('names the workshop which has only just been held in the open, rather than filing it into the history', () => {
diff --git a/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx b/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
index efe13e33491b637e401bb31a467b2134de7cadcd..0532d6441fc320af25f7f81a71ff4a257b382efd
--- a/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
+++ b/businesses/workshop-admin/WorkshopSelectorCardList.test.tsx
@@ -133,7 +133,7 @@
 
         expect(screen.getByRole('heading', { name: 'Probíhá (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Právě proběhlo (1)' })).not.toBeNull();
-        expect(screen.getByRole('heading', { name: 'Do týdne (1)' })).not.toBeNull();
+        expect(screen.getByRole('heading', { name: 'Tento týden (1)' })).not.toBeNull();
         expect(screen.getByRole('heading', { name: 'Nadchází (1)' })).not.toBeNull();
         expect(getWorkshopCards().map((workshopCard) => workshopCard.textContent)).toEqual([
             expect.stringContaining(ONGOING_WORKSHOP.title),
@@ -143,7 +143,7 @@
         ]);
 
         expect(getWorkshopCards()[1].textContent).toContain('Právě proběhlo');
-        expect(getWorkshopCards()[2].textContent).toContain('Do týdne');
+        expect(getWorkshopCards()[2].textContent).toContain('Tento týden');
         expect(screen.getByRole('button', { name: 'Historie (1)' }).getAttribute('aria-expanded')).toBe('false');
     });
 
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index db5a8c24b143aaca5b1db4cf1d5b53a37c44980a..7e18ee78f90fe0b51996999912b65b8b334b3843
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -76,7 +76,7 @@
   changes no stored room data.
 
 - Added a fifth shared time state for event terms: a published term that begins within the next seven rolling days is
-  now marked `Do týdne`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
+  now marked `Tento týden`. The violet badge and calendar colour appear consistently in `/cs/komunita` and the term
   picker of `/cs/online-workshop/participant?workshop=`, while `/admin/workshops` gives ongoing, freshly past,
   next-seven-day, later upcoming, and historical terms their own ordered categories. The shared future-term helper
   keeps these imminent terms eligible for the post-workshop recommendation too, so highlighting a near event never
diff --git a/components/workshops/WorkshopLinksPanel.test.tsx b/components/workshops/WorkshopLinksPanel.test.tsx
index bc1e7733fe36b184928c8dd695011359a9cc869a..910569a5fa3cca869d187532520626b767c7d43b
--- a/components/workshops/WorkshopLinksPanel.test.tsx
+++ b/components/workshops/WorkshopLinksPanel.test.tsx
@@ -218,12 +218,12 @@
         expect(findCalendarDay('2026-09-11').className).toContain(
             getWorkshopPhaseAppearance('upcoming-next-week').calendarDayClassName,
         );
-        expect(screen.getAllByText('Do týdne')).toHaveLength(2);
+        expect(screen.getAllByText('Tento týden')).toHaveLength(2);
 
         showCardsView();
 
         const [, upcomingNextWeekCard, upcomingCard] = findTermLinks();
-        expect(upcomingNextWeekCard?.textContent).toContain('Do týdne');
+        expect(upcomingNextWeekCard?.textContent).toContain('Tento týden');
         expect(upcomingCard?.textContent).toContain('Nadchází');
     });
 
diff --git a/components/workshops/workshopPhaseAppearance.ts b/components/workshops/workshopPhaseAppearance.ts
index b0af480e1efbdfc5350bbef73f634b159f131cff..397626aeeca074142ce787ebea7da16101b8f4ee
--- a/components/workshops/workshopPhaseAppearance.ts
+++ b/components/workshops/workshopPhaseAppearance.ts
@@ -64,7 +64,7 @@
     // Note: This stays distinct from the ordinary upcoming cyan so the special badge is useful even when a reader
     //       cannot infer a date at a glance.
     'upcoming-next-week': {
-        label: 'Do týdne',
+        label: 'Tento týden',
         badgeClassNameByTone: {
             light: 'bg-violet-100 text-violet-800',
             room: 'bg-room-upcoming/15 text-room-upcoming ring-1 ring-inset ring-room-upcoming/40',

tokens used
58,340
Changed the shared badge text from “Do týdne” to “Tento týden” everywhere it’s used.

Updated documentation and existing test expectations. All 35 affected tests pass.
[1]-  Done                    bash "$1"

=== runner shell finished at 2026-09-21T01:17:53.400Z ===
Status: succeeded

=== test shell started at 2026-09-21T01:17:53.419Z ===
Script path: /Users/hejny/work/aldaron/.promptbook/coder-prompts/2026-09-0171-freshly-upcomming-events-2.test.sh

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
   Generating static pages (61/82) 
BenefitsSection rendered
IntegrationsSection rendered
BenefitsSection rendered
IntegrationsSection rendered
BenefitsSection rendered
BenefitsSection rendered
IntegrationsSection rendered
BenefitsSection rendered
IntegrationsSection rendered
 ✓ Generating static pages (82/82)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                                                                  Size  First Load JS  Revalidate  Expire
┌ ƒ /                                                                                       400 B         102 kB
├ ○ /_not-found                                                                             400 B         102 kB
├ ƒ /[shortcode]                                                                          2.31 kB         142 kB
├ ƒ /admin                                                                                  176 B         105 kB
├ ƒ /admin/community                                                                      7.77 kB         367 kB
├ ƒ /admin/contacts                                                                       24.9 kB         200 kB
├ ƒ /admin/discount-codes                                                                 8.35 kB         138 kB
├ ƒ /admin/login                                                                            400 B         102 kB
├ ƒ /admin/recording-studio                                                               89.8 kB         220 kB
├ ƒ /admin/shortener                                                                      49.5 kB         193 kB
├ ƒ /admin/workshops                                                                        219 B         360 kB
├ ○ /ai-supervize                                                                           16 kB         239 kB
├ ƒ /ai-supervize-mini                                                                    17.2 kB         233 kB
├ ○ /ai-supervize-mini/opengraph-image                                                      400 B         102 kB
├ ƒ /ai-supervize-mini/participant                                                        2.51 kB         139 kB
├ ○ /ai-supervize/opengraph-image                                                           400 B         102 kB
├ ○ /ai-ta-krajta                                                                         19.6 kB         146 kB          1h      1y
├ ○ /ai-ta-krajta/branding                                                                  203 B         122 kB
├ ○ /ai-ta-krajta/logo.png                                                                  400 B         102 kB
├ ○ /ai-ta-krajta/logo.svg                                                                  400 B         102 kB
├ ○ /ai-ta-krajta/manifest.webmanifest                                                      400 B         102 kB
├ ○ /ai-ta-krajta/media-kit                                                               3.63 kB         125 kB
├ ○ /ai-ta-krajta/opengraph-image                                                           400 B         102 kB
├ ƒ /api/admin/community/memberships                                                        400 B         102 kB
├ ƒ /api/admin/community/projects                                                           400 B         102 kB
├ ƒ /api/admin/community/projects/[projectId]                                               400 B         102 kB
├ ƒ /api/admin/discount-codes                                                               400 B         102 kB
├ ƒ /api/admin/discount-codes/[discountCodeId]                                              400 B         102 kB
├ ƒ /api/admin/session                                                                      400 B         102 kB
├ ƒ /api/admin/session/sign-out                                                             400 B         102 kB
├ ƒ /api/admin/shortener                                                                    400 B         102 kB
├ ƒ /api/admin/shortener/[shortcodeLinkId]                                                  400 B         102 kB
├ ƒ /api/admin/shortener/[shortcodeLinkId]/clicks                                           400 B         102 kB
├ ƒ /api/admin/workshops                                                                    400 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]                                                       400 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/agents                                                400 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/agents/[agentId]                                      400 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/agents/audio                                          400 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/agents/audio-session                                  400 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/analytics                                             400 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/artificial-reactions                                  400 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/comments                                              400 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/comments/[commentId]                                  400 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/comments/[commentId]/artificial-upvotes               400 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/comments/[commentId]/material                         400 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/content                                               400 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/content/[contentId]                                   400 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/exports/[exportKind]                                  400 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/feedback                                              400 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/participants                                          400 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/participants/[participantId]                          400 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/participants/[participantId]/timeline                 400 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/polls                                                 400 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/polls/[pollId]                                        400 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/polls/[pollId]/options/[optionId]                     400 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/polls/[pollId]/options/[optionId]/artificial-votes    400 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/reactions                                             400 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/stage-comment                                         400 B         102 kB
├ ƒ /api/admin/workshops/repository/commit                                                  400 B         102 kB
├ ƒ /api/admin/workshops/repository/deployment                                              400 B         102 kB
├ ƒ /api/ai-supervize-mini/registration                                                     400 B         102 kB
├ ƒ /api/ai-ta-krajta/episodes/search                                                       400 B         102 kB
├ ƒ /api/community/membership/registration                                                  400 B         102 kB
├ ƒ /api/contacts                                                                           400 B         102 kB
├ ƒ /api/contacts/export/[formatId]                                                         400 B         102 kB
├ ƒ /api/discount-codes/validate                                                            400 B         102 kB
├ ƒ /api/stripe/webhook                                                                     400 B         102 kB
├ ƒ /api/track-click                                                                        400 B         102 kB
├ ƒ /api/waitlist                                                                           400 B         102 kB
├ ƒ /api/workshop-agents/run                                                                400 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/comments                                                  400 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/comments/[commentId]                                      400 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/comments/[commentId]/material                             400 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/comments/[commentId]/upvotes                              400 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/connect                                                   400 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/feedback                                                  400 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership                                                400 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership/cancellation                                   400 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership/checkout                                       400 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership/checkout/confirmation                          400 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership/portal                                         400 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/participant                                               400 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/participants/[participantId]                              400 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/polls/[pollId]/options/[optionId]                         400 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/polls/[pollId]/votes                                      400 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/presence                                                  400 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/reactions                                                 400 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/repository                                                400 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/state                                                     400 B         102 kB
├ ƒ /api/workshops/komunita/projects                                                        400 B         102 kB
├ ƒ /api/workshops/komunita/projects/[projectId]                                            400 B         102 kB
├ ƒ /api/workshops/komunita/projects/[projectId]/connect                                    400 B         102 kB
├ ƒ /api/workshops/komunita/projects/[projectId]/vote                                       400 B         102 kB
├ ƒ /api/workshops/komunita/projects/preview                                                400 B         102 kB
├ ○ /branding                                                                             4.74 kB         141 kB
├ ○ /contact                                                                              2.54 kB         164 kB
├ ○ /cs                                                                                     172 B         241 kB
├ ƒ /cs/komunita                                                                            230 B         302 kB
├ ƒ /cs/komunita/calendar.ics                                                               400 B         102 kB
├ ƒ /cs/komunita/clenstvi                                                                 13.1 kB         155 kB
├ ○ /cs/komunita/clenstvi/opengraph-image                                                   400 B         102 kB
├ ○ /cs/komunita/opengraph-image                                                            400 B         102 kB
├ ƒ /cs/komunita/projects                                                                 6.75 kB         141 kB
├ ƒ /cs/komunita/projects/[projectId]                                                     2.94 kB         299 kB
├ ○ /cs/obchodni-podminky                                                                 2.52 kB         139 kB
├ ○ /cs/ochrana-osobnich-udaju                                                            2.52 kB         139 kB
├ ƒ /cs/online-workshop                                                                   13.2 kB         246 kB
├ ƒ /cs/online-workshop/dekujeme                                                          4.46 kB         152 kB
├ ○ /cs/online-workshop/opengraph-image                                                     400 B         102 kB
├ ƒ /cs/online-workshop/participant                                                       3.05 kB         299 kB
├ ○ /cs/online-workshop/participant/opengraph-image                                         400 B         102 kB
├ ○ /cs/opengraph-image                                                                     400 B         102 kB
├ ○ /cs/pavol                                                                               157 B         203 kB
├ ○ /cs/pavol/opengraph-image                                                               400 B         102 kB
├ ○ /data-deletion                                                                        2.51 kB         139 kB
├ ○ /dekujeme                                                                             4.23 kB         151 kB
├ ○ /en                                                                                     172 B         241 kB
├ ○ /en/opengraph-image                                                                     400 B         102 kB
├ ○ /en/pavol                                                                               158 B         203 kB
├ ○ /en/pavol/opengraph-image                                                               400 B         102 kB
├ ○ /en/privacy-policy                                                                    2.52 kB         139 kB
├ ○ /en/terms-and-conditions                                                              2.52 kB         139 kB
├ ○ /for-agro                                                                             7.31 kB         268 kB
├ ○ /for-agro/opengraph-image                                                               400 B         102 kB
├ ○ /for-industry                                                                         7.91 kB         269 kB
├ ○ /for-industry/opengraph-image                                                           400 B         102 kB
├ ○ /hackathon-factory                                                                      15 kB         252 kB
├ ○ /hackathon-factory/opengraph-image                                                      400 B         102 kB
├ ƒ /k/[...shortFileUrlParts]                                                               400 B         102 kB
├ ○ /manifest.webmanifest                                                                   400 B         102 kB
├ ○ /old                                                                                  17.8 kB         246 kB
├ ○ /opengraph-image                                                                        400 B         102 kB
├ ƒ /pavol                                                                                  400 B         102 kB
├ ƒ /privacy                                                                                400 B         102 kB
├ ƒ /pro-firmy                                                                              400 B         102 kB
├ ○ /pro-mesta                                                                            6.39 kB         267 kB
├ ○ /pro-mesta/opengraph-image                                                              400 B         102 kB
├ ○ /robots.txt                                                                             400 B         102 kB
├ ○ /shortener                                                                              400 B         102 kB
├ ○ /sitemap.xml                                                                            400 B         102 kB
├ ƒ /skoleni                                                                                400 B         102 kB
├ ƒ /terms                                                                                  400 B         102 kB
└ ○ /test/hopko                                                                           4.62 kB         106 kB
+ First Load JS shared by all                                                              102 kB
  ├ chunks/1684-da5c21b68f3b188c.js                                                       45.8 kB
  ├ chunks/4bd1b696-cf2681237822a0c6.js                                                   53.3 kB
  └ other shared chunks (total)                                                           2.62 kB


ƒ Middleware                                                                                31 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand


> promptbook-landing-page@0.1.0 test-e2e
> playwright test

[WebServer] Database migrations skipped: DATABASE_URL is not configured.

Running 77 tests using 1 worker

  ✓   1 tests/e2e/admin-autosave.spec.ts:50:5 › autosaves edits in order, protects reload while pending, and waits before navigating (8.5s)
  ✓   2 tests/e2e/admin-autosave.spec.ts:93:5 › retains a failed edit and retries it without leaving the settings (3.3s)
  ✓   3 tests/e2e/admin-autosave.spec.ts:109:5 › keeps invalid settings open and saves corrected settings before signing out (2.5s)
  ✓   4 tests/e2e/admin-modals.spec.ts:24:9 › edits and creates contacts in keyboard-accessible dialogs at 1440px (3.6s)
  ✓   5 tests/e2e/admin-modals.spec.ts:24:9 › edits and creates contacts in keyboard-accessible dialogs at 390px (2.5s)
  ✓   6 tests/e2e/admin-modals.spec.ts:77:5 › keeps failed discount creation visible in its dialog and autosaves later edits there (1.2s)
  ✓   7 tests/e2e/cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /cs (2.7s)
  ✓   8 tests/e2e/cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /en (2.1s)
  ✓   9 tests/e2e/cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /cs/ochrana-osobnich-udaju (1.8s)
  ✓  10 tests/e2e/cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /cs/komunita (4.4s)
  ✓  11 tests/e2e/cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /ai-supervize (3.2s)
  ✓  12 tests/e2e/cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /ai-supervize-mini (3.7s)
  ✓  13 tests/e2e/cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /ai-ta-krajta (2.6s)
  ✓  14 tests/e2e/cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /admin/login (1.2s)
  ✓  15 tests/e2e/cookie-consent.spec.ts:64:5 › cookie choices persist and the privacy link reopens settings after client navigation (2.2s)
  ✓  16 tests/e2e/cookie-consent.spec.ts:92:5 › cookie panel and coder badge clear a player opened later, resized and closed (1.5s)
  ✓  17 tests/e2e/cookie-consent.spec.ts:123:5 › a booking notice leaves cookie choices clickable and the footer can be scrolled clear (1.8s)
  ✓  18 tests/e2e/participant-promotion.spec.ts:50:9 › refreshes an author's pending total and submissions after trust on /cs/online-workshop/participant (2.7s)
  ✓  19 tests/e2e/participant-promotion.spec.ts:50:9 › refreshes an author's pending total and submissions after trust on /cs/komunita (2.9s)
  ✓  20 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs (1.1s)
  ✓  21 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /en (1.2s)
  ✓  22 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /pro-mesta (1.7s)
  ✓  23 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /for-agro (1.5s)
  ✓  24 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /for-industry (1.6s)
  ✓  25 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /ai-supervize (1.2s)
  ✓  26 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /ai-supervize-mini (1.6s)
  ✓  27 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /ai-ta-krajta (897ms)
  ✓  28 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /ai-ta-krajta/media-kit (1.5s)
  ✓  29 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /ai-ta-krajta/branding (1.4s)
  ✓  30 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /hackathon-factory (1.4s)
  ✓  31 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs/online-workshop (1.6s)
  ✓  32 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs/komunita/clenstvi (2.9s)
  ✓  33 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs/pavol (1.6s)
  ✓  34 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /en/pavol (2.2s)
  ✓  35 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs/ochrana-osobnich-udaju (753ms)
  ✓  36 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /en/privacy-policy (1.3s)
  ✓  37 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs/obchodni-podminky (1.3s)
  ✓  38 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /en/terms-and-conditions (1.3s)
  ✓  39 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /contact (1.2s)
  ✓  40 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /branding (3.2s)
  ✓  41 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /data-deletion (1.4s)
  ✓  42 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /old (2.8s)
  ✓  43 tests/e2e/public-pages.spec.ts:139:5 › AI ta Krajta collaboration section deep-links to its media kit (1.7s)
  ✓  44 tests/e2e/public-pages.spec.ts:150:5 › AI ta Krajta owns its metadata, icon and installable manifest and credits Promptbook coder (4.7s)
  ✓  45 tests/e2e/public-pages.spec.ts:246:5 › AI ta Krajta searches complete transcripts on the server without sending them to the browser (6.4s)
  ✓  46 tests/e2e/public-pages.spec.ts:264:9 › public address redirects to its page: / (142ms)
  ✓  47 tests/e2e/public-pages.spec.ts:264:9 › public address redirects to its page: /pavol (6.1s)
  ✓  48 tests/e2e/public-pages.spec.ts:264:9 › public address redirects to its page: /privacy (816ms)
  ✓  49 tests/e2e/public-pages.spec.ts:264:9 › public address redirects to its page: /terms (687ms)
  ✓  50 tests/e2e/public-pages.spec.ts:264:9 › public address redirects to its page: /skoleni (701ms)
  ✓  51 tests/e2e/public-pages.spec.ts:278:5 › /skoleni carries a discount code to the workshop registration (26ms)
  ✓  52 tests/e2e/public-submissions.spec.ts:13:5 › submits the shared footer newsletter form (7.3s)
  ✓  53 tests/e2e/public-submissions.spec.ts:27:5 › submits the reusable get-started lead dialog (13.3s)
  ✓  54 tests/e2e/public-submissions.spec.ts:41:5 › submits the business lead dialog (1.6s)
  ✓  55 tests/e2e/public-submissions.spec.ts:55:5 › submits the homepage qualification lead flow (11.3s)
  ✓  56 tests/e2e/public-submissions.spec.ts:80:5 › submits Pavol’s personal contact form (3.3s)
  ✓  57 tests/e2e/public-submissions.spec.ts:96:5 › submits a published online-workshop registration (18.9s)
  ✓  58 tests/e2e/public-submissions.spec.ts:116:5 › personalizes and submits the 199 Kč Promptbook paid community membership (10.2s)
  ✓  59 tests/e2e/public-submissions.spec.ts:143:5 › submits an available AI Supervize Mini workshop registration (4.2s)
  ✓  60 tests/e2e/public-submissions.spec.ts:171:5 › submits the AI Supervize Mini future-term interest form (1.9s)
  ✓  61 tests/e2e/public-submissions.spec.ts:196:5 › submits the AI ta Krajta collaboration form (4.4s)
  ✓  62 tests/e2e/public-submissions.spec.ts:211:5 › plays the newest AI ta Krajta episode from the header (1.5s)
  ✓  63 tests/e2e/public-submissions.spec.ts:220:5 › resumes a half-played AI ta Krajta episode where its listener left it (3.0s)
  ✓  64 tests/e2e/public-submissions.spec.ts:254:5 › starts the AI ta Krajta minigame from its snake and keeps it local to the page (1.1s)
  ✓  65 tests/e2e/public-submissions.spec.ts:268:5 › filters the AI ta Krajta archive by a person and keeps its destination in the hash (2.5s)
  -  66 tests/e2e/public-submissions.spec.ts:280:5 › connects a public online-workshop participant
  ✓  67 tests/e2e/recording-studio.spec.ts:76:5 › requires admin authentication for the recording studio (15.7s)
  ✓  68 tests/e2e/recording-studio.spec.ts:81:5 › records separate sources, restores them, trims every track and exports playable editor material (19.7s)
  ✓  69 tests/e2e/recording-studio.spec.ts:162:5 › stops the whole take on disconnect and prevents a second tab from changing it (5.6s)
  ✓  70 tests/e2e/recording-studio.spec.ts:182:5 › recovers persisted chunks after an interrupted page and waits for stop before admin navigation (11.3s)
  ✓  71 tests/e2e/room-theme.spec.ts:96:5 › shares a saved room appearance, follows the device, and preserves the waiting-room form (10.8s)
  ✓  72 tests/e2e/room-theme.spec.ts:141:5 › themes connected rooms, materials, and portalled dialogs on desktop and mobile without losing drafts (10.4s)
  ✓  73 tests/e2e/workshop-agents.spec.ts:34:9 › defines a Book agent in the workshop administration (4.2s)
  ✓  74 tests/e2e/workshop-agents.spec.ts:34:9 › defines a Book agent in the community administration (14.6s)
  ✓  75 tests/e2e/workshop-repository-range.spec.ts:25:5 › edits independent commit bounds in workshop settings (5.1s)
  ✓  76 tests/e2e/workshop-repository-range.spec.ts:62:5 › opens on the highlighted workshop range and expands its branch graph (1.4s)
  ✓  77 tests/e2e/workshop-vercel-deployment.spec.ts:30:5 › deploys a workshop project and saves its ready URL through the existing settings form (5.0s)
Saved 72 E2E video(s) to tests/e2e/videos/.
Removed the E2E video(s) of 1 outdated run(s) from tests/e2e/videos/.

  1 skipped
  76 passed (5.2m)

> promptbook-landing-page@0.1.0 delete-test-data
> tsx scripts/delete-test-data.ts

Deleted 10 Contact row(s) and 0 workshop participant row(s) with an @example.com e-mail address.
[1]-  Done                    bash "$1"

=== test shell finished at 2026-09-21T01:23:33.662Z ===
Status: succeeded
````
