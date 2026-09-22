# Run trace of `prompts/2026-09-0560-ai-ta-krajta-people-factor.md#1`

-   **Prompt:** Multiplier factor to the hosts of the podcast
-   **Outcome:** Succeeded
-   **Runner:** Developer on OpenAI Codex `gpt-5.6-terra` thinking `max` (ChatGPT account)
-   **Attempts:** 1
-   **Steps:** Implementation ~$0.2143 7 minutes; Testing 16 minutes
-   **Verification command:** `npm run test-for-ptbk-coder`
-   **Started:** 2026-09-22T11:44:15.689Z
-   **Finished:** 2026-09-22T12:07:56.407Z
-   **Duration:** 24 minutes

## Runtime log

````text
=== runner shell started at 2026-09-22T11:44:16.054Z ===
Script path: /c/Users/me/work/promptbook-experiments-and-landing-pages/aldaron/.promptbook/coder-prompts/2026-09-0560-ai-ta-krajta-people-factor.sh

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
    exec --model gpt-5.6-terra \
    --local-provider none \
    --sandbox danger-full-access \
    -C /c/Users/me/work/promptbook-experiments-and-landing-pages/aldaron \
    --skip-git-repo-check \
    <<'CODEX_PROMPT'

## Your Task

Multiplier factor to the hosts of the podcast

- Hosts are ordered weighted-random by their number of appearances in the podcast episodes
- Add `factor` to each person, default is 1
- Katka should have factor 1.7
- Tomáš Mikolov shoould have factor 5
- Pavol should have factor 0.8
- Factor will multiply the number of episodes before the weighted-random  algorithm is applied. 
- After the change, Katka and Tomáš will be more likely on top of the hosts
- You are working with page `/ai-ta-krajta`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

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
  Its term picker gives ongoing, freshly past, today, tomorrow, next-seven-day, and later upcoming
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
- Recording-studio E2E sources use canvas video and synthesized audio with a silent Web Audio output, independent
  of physical audio-device clocks. Keep recording, storage, codecs, trimming, and ZIP exports real in these tests.

CODEX_PROMPT

--- raw output ---
.env: line 27: app: command not found
ptbk-codex-login-method: chatgpt
Reading prompt from stdin...
OpenAI Codex v0.155.1
--------
workdir: C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
model: gpt-5.6-terra
provider: openai
approval: never
sandbox: danger-full-access
reasoning effort: max
reasoning summaries: none
session id: 01a0c8ee-6fa2-7121-98ca-3a8c8cfc3e2d
--------
user

## Your Task

Multiplier factor to the hosts of the podcast

- Hosts are ordered weighted-random by their number of appearances in the podcast episodes
- Add `factor` to each person, default is 1
- Katka should have factor 1.7
- Tomáš Mikolov shoould have factor 5
- Pavol should have factor 0.8
- Factor will multiply the number of episodes before the weighted-random  algorithm is applied. 
- After the change, Katka and Tomáš will be more likely on top of the hosts
- You are working with page `/ai-ta-krajta`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

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
  Its term picker gives ongoing, freshly past, today, tomorrow, next-seven-day, and later upcoming
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
- Recording-studio E2E sources use canvas video and synthesized audio with a silent Web Audio output, independent
  of physical audio-device clocks. Keep recording, storage, codecs, trimming, and ZIP exports real in these tests.


codex
I’ll first trace how `/ai-ta-krajta` builds and shuffles its host roster, then make the weighting change at its single source of truth, add focused coverage, and update the current changelog.
exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command "rg -n --hidden --glob '"'!node_modules'"' \"weighted|random|shuffle|aiTaKrajtaPeople|AI_TA_KRAJTA.*PEOPLE|People\" app businesses components lib tests changelog" in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 2463ms:
changelog\_current-preversion.md:479:  project-ID default, so `gen_random_bytes(integer)` is no longer evaluated by this flow while foreign keys, uniqueness,
tests\e2e\workshop-subtitles.spec.ts:42:                const track = { ...request.postDataJSON(), id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
app\[shortcode]\page.tsx:55:        const randomIndex = Math.floor(Math.random() * data.url.length);
app\[shortcode]\page.tsx:56:        const selectedUrl = data.url[randomIndex];
businesses\workshop-admin\WorkshopPollAdmin.tsx:44:    return options.map((option) => ({ ...option, draftId: option.id ?? crypto.randomUUID() }));
app\test\hopko\HopkoExperiment.tsx:43:        description: 'A gentle shuffle creates momentum. Nobody knows why. The data is compelling.',
businesses\workshop-admin\agents\WorkshopAgentAudioCapture.ts:15:    private readonly sessionId = crypto.randomUUID();
businesses\pavol\pavolContent.tsx:255:            title: 'People I have worked with',
businesses\online-workshop\participant\useWorkshopParticipant.ts:176:        Math.random() * UNAVAILABLE_REFRESH_JITTER_MILLISECONDS
businesses\online-workshop\participant\useWorkshopParticipant.ts:363:        const delayMilliseconds = Math.random() * REALTIME_INVALIDATION_JITTER_MILLISECONDS;
businesses\online-workshop\participant\useWorkshopParticipant.ts:515:              ? DISCONNECTED_REFRESH_MINIMUM_MILLISECONDS + Math.random() * DISCONNECTED_REFRESH_JITTER_MILLISECONDS
businesses\online-workshop\participant\useWorkshopParticipant.ts:516:              : CONNECTED_REFRESH_MINIMUM_MILLISECONDS + Math.random() * CONNECTED_REFRESH_JITTER_MILLISECONDS;
businesses\homepage\homepageContent.tsx:641:                        "People paste work into public ChatGPT, sensitive company documents included. Public AI doesn't know your company. When it doesn't have the answer, it makes one up.",
businesses\homepage\homepageContent.tsx:719:                    title: 'People ask questions',
businesses\homepage\homepageContent.tsx:855:                        'People spend hours searching for documents',
businesses\ai-ta-krajta\_AiTaKrajtaPage.tsx:11:import { AiTaKrajtaPeopleSection } from '@/businesses/ai-ta-krajta/AiTaKrajtaPeopleSection';
businesses\ai-ta-krajta\_AiTaKrajtaPage.tsx:34:                    <AiTaKrajtaPeopleSection />
businesses\ai-ta-krajta\useAiTaKrajtaOrderedPeople.ts:3:import { AI_TA_KRAJTA_PEOPLE, type AiTaKrajtaPerson } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
businesses\ai-ta-krajta\useAiTaKrajtaOrderedPeople.ts:5:    orderAiTaKrajtaPeopleByAppearances,
businesses\ai-ta-krajta\useAiTaKrajtaOrderedPeople.ts:6:    shuffleAiTaKrajtaPeopleByAppearances,
businesses\ai-ta-krajta\useAiTaKrajtaOrderedPeople.ts:7:} from '@/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder';
businesses\ai-ta-krajta\useAiTaKrajtaOrderedPeople.ts:23:export function useAiTaKrajtaOrderedPeople(
businesses\ai-ta-krajta\useAiTaKrajtaOrderedPeople.ts:26:    const [orderedPeople, setOrderedPeople] = useState<readonly AiTaKrajtaPerson[]>(() =>
businesses\ai-ta-krajta\useAiTaKrajtaOrderedPeople.ts:27:        orderAiTaKrajtaPeopleByAppearances(AI_TA_KRAJTA_PEOPLE, episodeCountByPersonId),
businesses\ai-ta-krajta\useAiTaKrajtaOrderedPeople.ts:31:        setOrderedPeople(
businesses\ai-ta-krajta\useAiTaKrajtaOrderedPeople.ts:32:            shuffleAiTaKrajtaPeopleByAppearances(AI_TA_KRAJTA_PEOPLE, episodeCountByPersonId, Math.random),
businesses\ai-ta-krajta\useAiTaKrajtaOrderedPeople.ts:36:    return orderedPeople;
businesses\ai-ta-krajta\useAiTaKrajtaOrderedPeople.test.tsx:5:import { AI_TA_KRAJTA_PEOPLE } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
businesses\ai-ta-krajta\useAiTaKrajtaOrderedPeople.test.tsx:6:import { orderAiTaKrajtaPeopleByAppearances } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder';
businesses\ai-ta-krajta\useAiTaKrajtaOrderedPeople.test.tsx:7:import { useAiTaKrajtaOrderedPeople } from '@/businesses/ai-ta-krajta/useAiTaKrajtaOrderedPeople';
businesses\ai-ta-krajta\useAiTaKrajtaOrderedPeople.test.tsx:21:const PERSON_IDS_OF_ROSTER = AI_TA_KRAJTA_PEOPLE.map((person) => person.id);
businesses\ai-ta-krajta\useAiTaKrajtaOrderedPeople.test.tsx:31:function renderPeopleOrders(): readonly (readonly string[])[] {
businesses\ai-ta-krajta\useAiTaKrajtaOrderedPeople.test.tsx:34:    function PeopleOrderProbe() {
businesses\ai-ta-krajta\useAiTaKrajtaOrderedPeople.test.tsx:35:        renderedOrders.push(useAiTaKrajtaOrderedPeople(EPISODE_COUNT_BY_PERSON_ID).map((person) => person.id));
businesses\ai-ta-krajta\useAiTaKrajtaOrderedPeople.test.tsx:40:    render(<PeopleOrderProbe />);
businesses\ai-ta-krajta\useAiTaKrajtaOrderedPeople.test.tsx:48:function renderDrawnPeopleOrder(): readonly string[] {
businesses\ai-ta-krajta\useAiTaKrajtaOrderedPeople.test.tsx:49:    const renderedOrders = renderPeopleOrders();
businesses\ai-ta-krajta\useAiTaKrajtaOrderedPeople.test.tsx:54:describe('useAiTaKrajtaOrderedPeople', () => {
businesses\ai-ta-krajta\useAiTaKrajtaOrderedPeople.test.tsx:56:        const [firstRenderedOrder] = renderPeopleOrders();
businesses\ai-ta-krajta\useAiTaKrajtaOrderedPeople.test.tsx:59:            orderAiTaKrajtaPeopleByAppearances(AI_TA_KRAJTA_PEOPLE, EPISODE_COUNT_BY_PERSON_ID).map(
businesses\ai-ta-krajta\useAiTaKrajtaOrderedPeople.test.tsx:67:        const renderedOrders = renderPeopleOrders();
businesses\ai-ta-krajta\useAiTaKrajtaOrderedPeople.test.tsx:70:        expect([...renderDrawnPeopleOrder()].sort()).toEqual([...PERSON_IDS_OF_ROSTER].sort());
businesses\ai-ta-krajta\useAiTaKrajtaOrderedPeople.test.tsx:74:        const drawnOrders = Array.from({ length: MOUNT_COUNT }, () => renderDrawnPeopleOrder().join(' '));
businesses\ai-ta-krajta\config.ts:300:    { label: 'Kdo v tom jede', href: `#${AI_TA_KRAJTA_SECTION_IDS.PEOPLE}` },
businesses\ai-ta-krajta\aiTaKrajtaViewState.ts:1:import { getAiTaKrajtaPersonById } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
businesses\ai-ta-krajta\aiTaKrajtaSnakeSimulation.ts:1:import type { CreateRandomNumber } from '@/lib/random/CreateRandomNumber';
businesses\ai-ta-krajta\aiTaKrajtaSnakeSimulation.test.ts:14: * A source of random numbers which always answers the same, so that a test plays the same game twice
businesses\ai-ta-krajta\AiTaKrajtaSnakeGame.tsx:215:        let state = createSnakeState(bounds, Math.random, createAiTaKrajtaSnakeLogoPose(initialMarkFrame));
businesses\ai-ta-krajta\AiTaKrajtaSnakeGame.tsx:229:                createRandomNumber: Math.random,
businesses\ai-ta-krajta\aiTaKrajtaPortraits.md:11:were prepared by `scripts/_cutAiTaKrajtaPeoplePortraits.mjs`, which records the original
businesses\ai-ta-krajta\aiTaKrajtaPortraits.md:91:gradient, outline, or hover effect into the PNG. `aiTaKrajtaPeople.test.ts` checks every
businesses\ai-ta-krajta\AiTaKrajtaPersonCard.tsx:3:import type { AiTaKrajtaPerson } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
businesses\ai-ta-krajta\AiTaKrajtaPersonAvatar.tsx:3:import { getAiTaKrajtaPersonPhotoPath, type AiTaKrajtaPerson } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
businesses\ai-ta-krajta\AiTaKrajtaPersonAvatar.tsx:39: * Keeps each person's neutral background the same in cards and episode credits, even when the roster is shuffled.
businesses\ai-ta-krajta\AiTaKrajtaPeopleSection.tsx:4:import { countAiTaKrajtaEpisodesByPerson } from '@/businesses/ai-ta-krajta/aiTaKrajtaEpisodePeople';
businesses\ai-ta-krajta\AiTaKrajtaPeopleSection.tsx:6:import { useAiTaKrajtaOrderedPeople } from '@/businesses/ai-ta-krajta/useAiTaKrajtaOrderedPeople';
businesses\ai-ta-krajta\AiTaKrajtaPeopleSection.tsx:11: * People of the show, each of them a button which narrows the archive down to their episodes
businesses\ai-ta-krajta\AiTaKrajtaPeopleSection.tsx:13:export function AiTaKrajtaPeopleSection() {
businesses\ai-ta-krajta\AiTaKrajtaPeopleSection.tsx:18:    const orderedPeople = useAiTaKrajtaOrderedPeople(episodeCountByPersonId);
businesses\ai-ta-krajta\AiTaKrajtaPeopleSection.tsx:30:            id={AI_TA_KRAJTA_SECTION_IDS.PEOPLE}
businesses\ai-ta-krajta\AiTaKrajtaPeopleSection.tsx:44:                    {orderedPeople.map((person) => (
businesses\ai-ta-krajta\AiTaKrajtaPeopleSection.test.tsx:5:import type { AiTaKrajtaPerson } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
businesses\ai-ta-krajta\AiTaKrajtaPeopleSection.test.tsx:10:    orderedPeople: [] as readonly { readonly id: string; readonly name: string }[],
businesses\ai-ta-krajta\AiTaKrajtaPeopleSection.test.tsx:22:vi.mock('@/businesses/ai-ta-krajta/useAiTaKrajtaOrderedPeople', () => ({
businesses\ai-ta-krajta\AiTaKrajtaPeopleSection.test.tsx:23:    useAiTaKrajtaOrderedPeople: () => PEOPLE_SECTION_MOCKS.orderedPeople,
businesses\ai-ta-krajta\AiTaKrajtaPeopleSection.test.tsx:30:import { AiTaKrajtaPeopleSection } from './AiTaKrajtaPeopleSection';
businesses\ai-ta-krajta\AiTaKrajtaPeopleSection.test.tsx:54:    PEOPLE_SECTION_MOCKS.orderedPeople = ORDERED_PEOPLE;
businesses\ai-ta-krajta\AiTaKrajtaPeopleSection.test.tsx:64:        render(<AiTaKrajtaPeopleSection />);
businesses\ai-ta-krajta\aiTaKrajtaPeopleOrder.ts:1:import type { AiTaKrajtaPerson } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
businesses\ai-ta-krajta\aiTaKrajtaPeopleOrder.ts:2:import type { CreateRandomNumber } from '@/lib/random/CreateRandomNumber';
businesses\ai-ta-krajta\aiTaKrajtaPeopleOrder.ts:3:import { shuffleByWeight } from '@/lib/random/shuffleByWeight';
businesses\ai-ta-krajta\aiTaKrajtaPeopleOrder.ts:24: *       People heard equally often keep the order of the roster, because sorting here never moves what it does not
businesses\ai-ta-krajta\aiTaKrajtaPeopleOrder.ts:27:export function orderAiTaKrajtaPeopleByAppearances(
businesses\ai-ta-krajta\aiTaKrajtaPeopleOrder.ts:45:export function shuffleAiTaKrajtaPeopleByAppearances(
businesses\ai-ta-krajta\aiTaKrajtaPeopleOrder.ts:50:    return shuffleByWeight(people, {
businesses\ai-ta-krajta\aiTaKrajtaPeopleOrder.test.ts:1:import type { AiTaKrajtaPerson } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
businesses\ai-ta-krajta\aiTaKrajtaPeopleOrder.test.ts:3:    orderAiTaKrajtaPeopleByAppearances,
businesses\ai-ta-krajta\aiTaKrajtaPeopleOrder.test.ts:4:    shuffleAiTaKrajtaPeopleByAppearances,
businesses\ai-ta-krajta\aiTaKrajtaPeopleOrder.test.ts:5:} from '@/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder';
businesses\ai-ta-krajta\aiTaKrajtaPeopleOrder.test.ts:45:        shuffleAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID, Math.random).forEach((person, place) =>
businesses\ai-ta-krajta\aiTaKrajtaPeopleOrder.test.ts:53:describe('orderAiTaKrajtaPeopleByAppearances', () => {
businesses\ai-ta-krajta\aiTaKrajtaPeopleOrder.test.ts:55:        const ordered = orderAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID);
businesses\ai-ta-krajta\aiTaKrajtaPeopleOrder.test.ts:66:        const ordered = orderAiTaKrajtaPeopleByAppearances(PEOPLE, new Map());
businesses\ai-ta-krajta\aiTaKrajtaPeopleOrder.test.ts:72:        orderAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID);
businesses\ai-ta-krajta\aiTaKrajtaPeopleOrder.test.ts:78:describe('shuffleAiTaKrajtaPeopleByAppearances', () => {
businesses\ai-ta-krajta\aiTaKrajtaPeopleOrder.test.ts:80:        const shuffled = shuffleAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID, Math.random);
businesses\ai-ta-krajta\aiTaKrajtaPeopleOrder.test.ts:82:        expect(new Set(shuffled.map((person) => person.id)).size).toBe(PEOPLE.length);
businesses\ai-ta-krajta\aiTaKrajtaPeopleOrder.test.ts:88:            () => shuffleAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID, Math.random)[0].id,
businesses\ai-ta-krajta\aiTaKrajtaPeopleOrder.test.ts:115:        const firstDraw = shuffleAiTaKrajtaPeopleByAppearances(
businesses\ai-ta-krajta\aiTaKrajtaPeopleOrder.test.ts:120:        const secondDraw = shuffleAiTaKrajtaPeopleByAppearances(
businesses\ai-ta-krajta\aiTaKrajtaPeople.ts:56: * Note: This is the roster, not the order the page shows it in - `aiTaKrajtaPeopleOrder.ts` draws that one. The order
businesses\ai-ta-krajta\aiTaKrajtaPeople.ts:59:export const AI_TA_KRAJTA_PEOPLE: readonly AiTaKrajtaPerson[] = [
businesses\ai-ta-krajta\aiTaKrajtaPeople.ts:315:    return AI_TA_KRAJTA_PEOPLE.find((person) => person.id === personId) ?? null;
businesses\ai-ta-krajta\aiTaKrajtaPeople.test.ts:2:    AI_TA_KRAJTA_PEOPLE,
businesses\ai-ta-krajta\aiTaKrajtaPeople.test.ts:5:} from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
businesses\ai-ta-krajta\aiTaKrajtaPeople.test.ts:35:describe('AI_TA_KRAJTA_PEOPLE', () => {
businesses\ai-ta-krajta\aiTaKrajtaPeople.test.ts:38:    it.each(AI_TA_KRAJTA_PEOPLE)(
businesses\ai-ta-krajta\aiTaKrajtaPeople.test.ts:62:        const photoFileNames = AI_TA_KRAJTA_PEOPLE.map((person) => person.photoFileName);
businesses\ai-ta-krajta\AiTaKrajtaPageState.tsx:9:import { filterAiTaKrajtaEpisodes } from '@/businesses/ai-ta-krajta/aiTaKrajtaEpisodePeople';
businesses\ai-ta-krajta\AiTaKrajtaMiniPlayer.tsx:5:import { getAiTaKrajtaEpisodePeople } from '@/businesses/ai-ta-krajta/aiTaKrajtaEpisodePeople';
businesses\ai-ta-krajta\AiTaKrajtaMiniPlayer.tsx:108:    const people = getAiTaKrajtaEpisodePeople(playingEpisode);
businesses\ai-ta-krajta\aiTaKrajtaInternalEpisodes.ts:35:     * People known to have been at the microphone, written by their published names
businesses\ai-ta-krajta\AiTaKrajtaFooter.tsx:87:                                    href={AI_TA_KRAJTA_PATH + '#' + AI_TA_KRAJTA_SECTION_IDS.PEOPLE}
businesses\ai-ta-krajta\aiTaKrajtaEpisodes.json:9:        "transcript": "Tak ahoj. Dneska tady máme takový skromnej díl. Potkali jsme se tady jenom s Kačkou. Je to 65. díl IT Cry. Nevznikla by bez podpory prombooku, za kterým stojí právě Pavol a Jirka, který tady s náma dneska nejsou, ale určitě se na ně eh podívejte a teďkom se pustíme do novinek. Máš něco, Kačko? Jo, tak já můžu začít jenom rychlou novinkou a to jsem včera si jenom stihla rychle přečíst na linkáči, že vyšel tady ten novej Qen model Quen 38 Flash Next. Tady to mám napsaný, ale moc jsem toho o něm zatím zjistit nestihla. >> Já jsem na něj už koukal. Za mě je zajímavý, že oni tvrděj, že je to něco z rodiny Kven 4, přestože číslování má stále Kven 38. Co oni tam zavedli, je, že to není jenom klasický model, který má celkový parametry a aktivní parametry, ale že tam mají něco, čemu říkají engram layers. Musím to tam někde najít. On je vlastně speciální tím, že má 51 miliard layers. Tady to mají celkem má teda 125 miliard parametrů, aktivních šest, ale ještě k tomu má 51 miliard edingu a 4 miliardy multi token prediction. Takže ten model vlastně jako zapíká strašně moc věcí dohromady. Přestože je to jenom 125 miliardový model, tak se nevejde na jeden spark v čtyřbitový kvantizaci. Aspoň teda zatím. Uvidíme, jestli tam budou nějaký posuny. Tak jsem zvědavej. Chystám se to vyzkoušet. Teďkom jsem narazil i na nějakou službu, která by ho měla mít zdarma tady ten kven, takže za mě se to posouvá hezky. A pokud ty benchmarky jsou pravda, tak tady máme jako opus 46, která běží doma. >> Cool teda skoro mi přijde, že to začíná bejt takovej trend, že jsou vlastně takovýhle větší modely, který se chovaj jako menší na těch, aby se vešly na ty menší device, že jo, že ta GEMA E4B taky je něčím podobná. Ta zase na to jde trošku jinak a No, skoro mi přijde, že to je trend. >> Jo, jako takhle tady ten model je jako větší díky těm 51 miliardám ngramů. Ale podle všeho by to mělo pomoct právě s tím, že on si vlastně jakoby pasivně do sebe zakeashovává takový ty fáze jako def, function a podobný záležitosti, takže pak nemusí řešit jenom tokeny, ale má to rozsekaný hezky po nějakejch, řekněme frázích by to tak mělo bejt. Tak se nám připojil Pavol a já budu pokračovat s mojí novinkou, protože ten kven není jediná záležitost. Určitě jste mnozí zaznamenali, že v posledním týdnu bylo k dispozici něco, co se nazývalo Ox Alfa, což bylo hodně šílený, protože spousta lidí nevěděla, co je to za vlastně za model, protože providerři řekli, že máme k dispozici 100 bilionů tokenů denně zdarma. Dali to na Open router, dali to na open code, dali to do Kinu, úplně všude možně a nevědělo se, co to je. Navíc ten model fungoval velice dobře. Podle některejch benchmarků byl jako na úrovni opusu 46. Záleželo na tom, co se s tím dělalo. Na Open Routeru se protočilo hezkejch pár bilionů tokenů, takže když to převádíme mezi anglickou českou soustavou, tak uvidíte, že to bylo trilions v angličtině. Včera bylo odhalený, co je to za model. Je to GLM53 Flash, což je hustý, že je to zase flash model, který by měl jet na dvou spárcích nebo něčem podobným, ale to za mě není to nejepičtější, protože je to první multimodální model od GLM, kterej prý už má i followera, měl by vyjít GLM 53 Omni. Ale mnohem zajímavější je, že proč oni dávali tolik tokenů zadarmo, je, že se rozhodli testovat Huawei chipy. Celá ta inference těch 100 bilionů tokenů za den měla šlapat na Huawei. Žádná Nvidia, žádný zápaďácký grafiky, všechno Ascent GPUs od Huawee. >> Cool. >> A pokud to je skutečně pravda, tak je to šílený. Všichni říkali, to musí být kurzor, nový fine tunovaný model od kurzoru, který bude stavět nad nějakým čínským modelem, protože kdo jiný má kapacity na to servírovat tolik tokenů jen tak. A nakonec to všechny překvapilo. >> Zkoušeli jste ten Ox Alpha? >> Ne. Já jsem teď nestihla asi tak tejden moc sledovat novinky, takže ne. A co ty na to říkáš teda? >> Mě ten Oxalpa strašně bavil. Je to prostě step up toho, co bylo s GLM v některejch ohledech, v některejch samozřejmě ne. Je to furt flash model, ale bylo to jako spolehlivý, bylo to rychlý a napříč různýma providerama se to chovalo víceméně konzistentně. Já jsem dělal i benchmarky, záleželo, jak to kdo vrapoval. Nose Research, což jsou autoři, kteří jsou za Hermesem. Ti byli jedni z těch stabilnějších a samozřejmě Open Code Go byl super. Na Open Router mně to dávalo 429 strašně často, protože jsem to prostě zkoušel používat se supagentama. Co je ale hustý, tak jsou statistiky, který teďkom vydal Open Routroer. Ten tvrdí, že jenom přes Open Router se za těch 6 dnů protočilo 23,2 bilionů tokenů na ten Ox alfa. Takže přeskočil Deep Seek Flash, přeskočil mimo od Xiaomi. To je jenom kapacita na Open routeru. Samozřejmě část se protočila na Open Code Go a na dalších. Člověk, kterýho sleduju, tak ten říká, že on to jako škáloval do absurdních rozměrů. Byl zodpovědný za každý jeden z 644 tokenů, který byly protočený. >> Myslíš i v coding jako úplně celkově nebo jenom v codingu? >> Prostě on to používá na coding, skáluje tím všechny možný věci. To je člověk, kterej si platí z vlastní kapsy 13 000 dolarů měsíčně za subscription. prej protočil 36 miliard tokenů za těch pt dnů. >> To je dost nepředstavitelný. >> Jako vždycky to jde vytočit do šílenejch rozměrů. Já jsem si s tím hrál taky. Protočil jsem tam nějakou tu jako miliardu. E super bylo, že jak byl zdarma a zároveň to byl čínskej model, tak neodmítal takový ty věci jako dekompilace, reverse engineering. Takže jsem si s tím hrál na tyhle věci. Byla to byla to velká zábava. Ten model mě bavil. Určitě budu pokračovat v jeho používání. No tak to taky musím zkusit teda, jestli to ještě jde. >> Právě to včera vypadlo z těch free usitů, >> ale když si zaplatíš Open Code Go, tak oni mají teďkom akci, že za 5 dolarů máš jako přístup právě ke Kimi, k Deep Seeku a i k tomu GLM 53 Flash. Je to za mě super subscription, ve kterým si můžeš vyzkoušet spoustu open weights modelů. >> Mhm. >> Mají to spolehlivý, mají to rychlý. Teďkom dokonce měli něco, čemu říkali operation cheep Seek, protože potom, co Deep Seek bude zvedat ceny za API, tak oni se rozhodli najít způsob, jak provozovat profitabilně Deep Seek i za původní ceny a říkali, že se jim to povedlo, tak jsem zvědavej, jestli se jim to povede dlouhodobě, ale jako wow. A kdyby ses to provozoval zcela na nějaký jako vlastní infrastruktuře nebo na nějakém vlastním cloudu, tak kolik by ten GLM 53 flash byl reálně nákladovej? >> Hele, toho, co jsem koukal, tak k tomu potřebuješ dva sparky nebo jedno nový Mac Studio. Speaking of, máme tady další novinku. Apple včera vařil. Vyšlo nový, vyšly nový zařízení o teplu. Nejzajímavější je tam za mě zdaleka Mac Studio, který oproti předchozím rumors, tak se bude prodávat i v 512 GB verzi. Mac Studio M5 Ultra. Propustnost bude 1,2 tera za sekundu u těch pamětí. Ta nejvyšší verze teda půjde do prodeje, myslím, až v říjnu. Teďkom už jsou ale vyprodaný ty 256 GB, který mají překvapivě dobrou cenu. Pohybujou se kolem 10 000 dolarů. Což je za mě jako velice hezká cena. Vlastně se to vyrovná dvoum sparkům a mám to v jednom počítači. Nemusím tam řešit nějaký propojování a tak. >> No, člověk chvíli dává pozor a děje se takových věcí. To je hrůza. >> No, byl to divokej týden, ne? Že ne? >> Jako Frontierlabs mlčí, ale open weights jedou v tuhle chvíli. Tak jsem zvědavj, s čím nás odzbrojí, protože teďkom jsou zas nějaký jako šeptandy, že takhle včera předevčírem Tibo, kterej je zodpovědnej za resety v kodexu, tak sdílel, že dobrý produkty vyžadují alespoň 34 dnů k tomu, aby dozráli. Takže se začíná mluvit o tom, že by měla vyjít GPT6 nebo GPT 57, která má coden name Astra. Prej už mají dokončený i trénink modelu, který bude OP j po Astře a teďkom právě dělají fine tuning a všechny možný věci, aby tam aby tam byly jako guard rails a tak dále. >> Když mluvíme o tom Open AA kodexu, tak ty k těm resetům máš nějak jakoby víc víc deep info, protože mě to zároveň těžší a zároveň mě to vždycky hrozně irituje, protože je to takový neprediktibilní. Je to s těma resetama těžký, protože oni na jednu stranu zavedli ty bankovaný resety, že si to můžeš resetovat, kdy chceš, ale ty mají limitaci měsíc, takže už mi některý resety propadly, protože jsem zrovna byl na prázdninách a tak, takže jsem to nevyužil. Pak mají klasický resety. Nejlepší je asi sledovat Tiba na Xu. Nicméně on občas napíše, jo, zejtra večer bude reset a pak ten reset udělá o 6 hodin dřív. Takže lidi, kteří si dali třeba joby na to, aby vysáli maximálně ty limity, tak jim to běží, dostanou novej reset a vysajou ten novej reset. Mně mně jakoby čím dál tím víc přijde, že je to jako strašný kasino tyhlety subscriptions a vlastně já jako přemýšlím, co je ten důvod. Já si jako myslím, že jeden z nich bude ten, že oni jako vědí, že to pak ty lidi sledujou a že to opravdu, že ten dashboard jako hypnotizujou očima. Ale vlastně zároveň mě to hrozně štve tohleto, protože nevím, jak se toho, jak to jako rozumně automatizovat, obzvlášť tím, že je to jako neprediktibilní, ale teďka jsem něj dal nějakej tip a zkusím dát nějakýmu miniagentíkovi za úkol sledovat tady ten tady ten exkovej účet, aby se podle toho řídil, zda se mně povede utratit víc nebo míň. A možná když už jsme teda u toho, jak se snažíme co nejvíc využít ty subscriptiony a být co nejvíc efektivní, tak bych navázala tématem, který jsem chtěla dneska probrat. Vlastně je to taková moje krátká prezentace, kterou jsem měla někdy předevčírem na firemním meetingu, protože a je to vlastně téma, který už jsem tady rozebírala několikrát. Prostě s kolegama jsme teď všichni děsně efektivní, každej zvlášť, ale snažíme se nějak spolupracovat a přijít na to, jak to udělat, aby vlastně to ve výsledku nevedlo k větší neefektivitě. Když vlastně kolega si něco dělá v apině, něco prostě na frontendu, já zase si tam orchestruju ty agenty a musíme se nějak sladit. Kdysi jsem tady vyprávěla o tom, jak mi začal posílat prostě mardown fily od Cloda, co si tam mám u sebe v tom rapu spravit. Já jsem mu pak řekla, tak to můžeš spravit rovnou, že jo, když už jako na to ty tokeny vypálil. Já to teda nasdílím rychlou obrazovku. A vlastně prezentaci jsem pojmenovala Kozel za hradníkem a hlavolám, kterj teď řešej všechny týmy. A tohle je reálná hra, co existuje, co máme tady na chalupě. A o co v tý hře jde, jo, že tam jsou takový jakoby posuvný políčka, podle kterjch, který se mají posouvat a sestavovat různý konfigurace a je tam vlastně vždycky i řešení ke každý tý úloze, ale to, co teď ty týmy chtějí najít, vlastně není to řešení, ale ta konfigurace, do jakých se chtějí dostat. A já teda tady přestanu mlžit s divnými pojmy a popíšu to rovnou na tom obrázku. Tady ten kozel, jo, to je vývojář a je na tý svojí zahrádce a dejme tomu, že to je Franta, frontend vývojář. Všimněte si, že vlastně ze všech těch zelenejch políček, což jsou hlávky zelí, má vlastně to v tý svojí ohrádce jenom ty dvě a to je ten jeho frontend a ty ostatní hlávky zelí, to je třeba ta apina, to jsou devopsy, to je prostě všechno ostatní. No, ale tím, že Franta teď má vlastně ty svoje agenty a může si kódit, tak vlastně mu to umožní dostat se i do každýho toho dalšího repa a vlastně něco tam udělat. A teď Franta, že jo, zkušený vývojář to je, ale přece jenom ve všech těch ostatních částech tý Codebase je to tak trochu kozel zahradníkem, protože vlastně neví, jaký tam platěj prostě ty pravidla, co si tam každej v tom svým rapu určuje. No a takovejhle vývojářů je tam teď spousta, že jo. Všichni vlastně teď můžou těmi agenty řešit tu fečuru napříč celou toubase. Teď já nevím, jestli jako můžou, nemůžou. To asi jako záleží na tom daným týmu, jak si to rozvrhne, no. A pak to prostě vypadá nějak takhle. Ta úloha je, že vlastně potřebujou se spolu nějak sladit a domluvit, jak to dělat, aby si do toho sice mohli lejst do toho svýho zelí vzájemně, ale aby se domluvili. >> Kačka se nám odpojila. Každopádně mně se to mně se to, co nám tady ukazovala, líbilo strašně moc. E, protože to úplně geniálně ilustruje přesně ten problém, že si každý může lízt do svýho, ale zároveň lízt i do cizího. Je to o nějaký transformaci. Já teďko něco podobnýho právě řeším s klientama, že je potřeba se podívat do nejenom toho, pojďme zefektivnit vývoj, ale pojďme zefektivnit celý SDLC. A najednou se začínají objevovat takový krásný termíny, který tady byly už dlouho, ale pro spoustu lidí byly sprostý slovo, jako shift left, jako třeba TDD, který hodně prosazuje Karel Smutnej ze Scramdow, že jo. E, kdysi dávno tak byl i event, že jo, s Prokopem z DX Heroes, tak se dělalo AI Coding dožo. Takže začínají se zase vracet na výslunní termíny, který tady byly už dávno v minulosti. nebyl na ně prostor mi přijde, že to začíná mít čím dál tím větší sílu, protože koho z vás, pokud jste to někdy zkoušeli, bavilo dělat TDD? Nikoho. Neznám nikoho, koho bavilo TDD. >> Já s tím absolutně souhlasím a připadá mě, že pro ty agenty opravdu vzniknou nějaký jako metodiky. A možná Kačko, pokračuj a znovu to vydílej. Jo, já už jsem vlastně pak v tý prezentaci, to už byl konec prezentace. Já jsem pak chtěla říct, že nevím, jestli ten názor vlastně na to, že má každej nebo že může každej vlastně šahat všude, je kontroverzní nebo není a že nevím vlastně, jak by s tím kdo souhlasil a že my teda se snažíme, my chceme jako, protože, že jo, pak je ten tým strašně efektivní, když si každej vezme tu jednu feature a implementuje ji skrz naskrz. Nemusí se prostě čekat na to, že hele, tady prostě potřebuju v tý apině tohle. Jo, jasně, za chvilku ti to dodám, ale mezitím ještě musím udělat těch 10 věcí, co tady mám, že jo, a jde to hrozně rychle, ale zároveň to může vejst k tomu, že se celá ta co rozbije, když se to dělá špatně, jo. Protože my teď jako dáváme si nějaký pravidla, že si vždycky eh vlastně informujeme se o stavu té v uvozovkách zahrádky, v jaké v jaké jsme jako tu třeba tu Apinu, jak v jakým jsem jí teď jako do jakého stavu já jsem tu Apinu uvedla a co jsem tam udělala, říkám kolegovi. A ani si to teda zatím jako neschvalujem, jo? Vždycky si řeknem, co budem dělat a pak si to oznámíme. No, >> mně přijde, že klíčová věc, kterou tady je potřeba dodržet, je brutálně zainvestovat do různejch kód quality enforcementu. >> Hm. >> A to je přesně to, co dělám na svejch projektech, to, co řeším s klientama. Řešili jsme to xkrát tady v minulosti. Můj oblíbenej stack. Udělejte feedback loop rychlou. Pokud váš agent bude čekat hodinu na review, tak ten agent jako oni se snažej s tím pracovat, ale nejlepší s čím přišli, je, že ten agent prostě poluje. Takže vy si pálíte tokeny na tom, že ten agent říká: \"Hm, už tam je review, ne? Není. Tak já ještě počkám.\" A je to vlastně strašně špatně. Přitom se to dá udělat mnohem jako líp, mnohem víc deterministický a prostě z toho udělám nějaký workflow. To je jedna věc a druhá věc je, že to udělám rychlý. Takže jsem přešel z ES lintu na oxlint, přešel jsem z pritýru na oxformát a takhle postupně tvořím další a další věci v tom mým toolingu a zároveň závisí jako na stavu Codbase. Pokud mám Coase, která je relativně Greenfield, nebo tam můžu dělat nějaký masivnější změny, tak si dovolím aktivovat pravidla, který pozvednou úroveň tý Codebase, ale může bejt codebase už v takovým stavu, že mi to vyhodí prostě 10 000 errorů. Jo, byl jsem na projektu, kde jsme zapli PHP stan j nejnižší úroveň kontroly, co v PHP je. A vyhodilo to 16 000 errorů. Jo, bavil jsem se s týpkem, ten říkal:„Jo, my jsme to zapli taky a crashlo nám to PHP stan. Prostě byl out of memory. Takže jsou projekty ve fakt špatným stavu. A pak je potřeba s tím pracovat trošku jinak, protože to, že mi 10 000 chybí středník na konci řádku k JavaScriptu vlastně není problém. Jsou tam mnohem důležitější věci. Takže je to o nějaký prioritizaci. To je další věc, na kterou dělám tu link, protože jsem se rozhodl poskládat ty nástroje pro kopače zlata, kteří jako těžej hromadu věcí z AI, takže řeším tool, kterej bude prioritizovat to, co má smysl fixovat, to, co je skutečně důležitý. Můžou to být security věci, můžou to být performance věci, může to být už aplikace Linteru, protože už ta co by je v dobrým stavu. Jde o to dát jasnou prioritu a umět to komunikovat i s člověkem i s tím agentem, protože oni potřebujou to jako komunikovat jinak. Zároveň jeden z možnejch výstupů, kterej hodlám testovat, tak je, že to pomůže CTO a technickým lidem komunikovat směrem k byznysu. Proč to má smysl fixnout? Protože na spoustě projektech jsem potkal to, že hm na to není budget, to je refactoring, proč bysme to dělali. A pak se management ptá a proč tahle fečura letos trvá měsíc, když minulej rok jste to na jiným projektu měli za týden? >> No, protože nám dovolil tam naházet hromadu sraček a nedovolils nám to uklidit, protože dal deadline včera bylo pozdě. >> Tohle to podle mě, co říkáš, je úplně totálně kruciální. Já bych možná ještě jako předřadil před ten bod mít ty testy rychlý, tak mít je zcela automatizovat, protože ve chvíli, když ten agent tu věc má zcela ten feedback loop má zcela automatizovanej a je tam co nejmíň lidskýho zásahu, ideálně žádnej lidskej zásah je až po nějaký jako další práce agenta. Pak podle mě to, že to trvá dlouho, je trochu menší issue, než že to musí člověk vyvisitovat. Druhá věc, co bych k tomu možná doplnil, je ta, že kvality check nebo automatizovaný test v tý pipelině, tak to může být opravdu všechno možný i nemožný. To může být linting, type check, nějaký quality check, různý checky závislostí. Napadá mě všechno, integrační testy, unit testy, jako napadá mě opravdu všechno možný a nemožný, co se dá do tady tý kategorie dát. Obecně moje taková heuristika je, že vždycky se to má dělat od toho nejjednoduššího po ten po ten nejtěžší, aby to selhalo co nejdřív a ten agent to mohl zase zpátky začít fixovat a zároveň by to v tý pipeline mělo být udělaný nějak automatizovaně, ne? Ne tak, aby se ten agent rozhodl, zase se ten dust spustí nebo ne, ale aby vždycky předtím, než to posílá, tak aby se to muselo prostě jako, aby to muselo projít testama. A my jak máme našeho kodéra, já ho tady dám tady dám do odkazu, tak tak ten dělá vlastně ještě navíc takový sendvič. On vždycky, když něco začne implementovat, tak on má šňůru věcí, co má naimplementovat a on si ze začátku spustí testy. Pokud to neprojde, tak si rovnou vyrobí první PRD na to, aby to opravil, ať už je to jako jakákoliv malá věc. Pokud ty testy projdou, tak implementuje první PRD, pak znovu pouští testy, komituje to, co to, co udělal v PRD. komituje další PR, implementuje další PRD, komituje, co udělal v tom v tom PRD, zkobituje spouští vždycky vlastně cihlí to, že dělá implementaci testy, implementaci testy, implementaci testy a vždycky ty testy jsou zasandvičovaný z obou stran, aby měl agendistotu, že začal a skončil s funkčním stavem, ať už v těch testech je cokoliv a v těchcích cokoliv. A možná jako otázka na vás, jak to nazývat, protože já vždycky říkám testy, akorát oni to nejsou jenom testy, ono jsou tu i jako různý druhy kvality checku. >> Jo, by nebyl lepší název. >> Různý asi pravidla specifický pro to daný repo myslíš? Jo, nebo quality taky. No, tak to je otázka. Ale je dobrá otázka, protože kdysi ta situace byla jednoduchá, kdysi byly integrační testy, unit testy, linting, možná type check, ale >> jo, jako, ale teďka mně přijde, že vlastně tady to všechno by mělo mít nějakej jeden velkej souhrnej název, protože tohleto všechno by se mělo udělat předtím, než agent udělá komitet. Jako já nemám název, ale mám příklad ještě asi, že třeba já když vlezu kolegovi do toho frontendu, tak ze začátku se nám prostě stávalo, tam máme nějaký widgety, že jo. Každej ten widget musí mít nějaký svoje vlastnosti, jo, ale to ví jenom ten kolega, že jo, ten to vždycky jako si zkontroluje a zařídí. A já o tom nevím a můj agent taky ne. On to vlastně ani neměl nikde napsaný, protože to měl v hlavě. Takže já jsem mu tam vždycky udělala něco prostě, co pak vypadalo ošklivě na tom frontendu. Já jsem to ani nevěděla, že to vypadá ošklivě, protože to jako on ví. Takže takhle mi asi dvakrát nadával, když teda jsme si to tam někam jako napsali jako pravidlo, no. Takže to asi jako bude součást těch nějakejch kvalityčeků, no. >> Eh, já přemýšlím, jestli by to nemělo být nějaká součást end to end test. >> Jo, to jako asi jo, jako to jsme zjistili, že máme málo testů, když jsme s tím začli. No se jako >> mimochodem jako pro typ jako zvlášť u Typescriptovejch a javascriptovjch repozitářů sám agent umí strašně dobře jako inicializovat ty playwrightový end to testy. Prostě udělejte mu PRD a řekněte mu, že chcete do projektu přidat jako dobrý pokrytí end to end testama napsaný v playwitu ať to přidá do všech pipeline a už na to soul. Sice spotřebujete polovinu svýho svýho limitu, ale to jako nevadí. Pro jakýkoliv další příští úkol se vám to bude dělat líp. >> A tím možná jako si jo, promiň. >> A já pak mám ještě jeden perch, kterej my teďka zkoušíme a vlastně mě fascinuje, že to funguje, ale možná ty říkej a pak řeknu já. No, mě napadlo, že úplně si tím nahrál na téma, který jsme tady předtím jenom tak rychle probrali tady s Petrem, což je, že vlastně ten cloud v Chromu nebo jakjkoliv agent prostě v prohlížeči, tak je hrozně super na různý testování a já třeba jsem jako říkala, že teď to používám strašně moc konkrétně toho cloud in Chrome, prostě ať mi všechno prokliká a otestuje, abych to nemusela dělat já, ale zároveň jako se děsím toho, aby to bylo dost bezpečný, protože není, že jo. A tak jsem se ptala, jak to udělat nějak bezpečně. No. >> No a ty mi úplně čteš myšlenky, protože já jsem vlastně chtěl říct podobnou věc, že my jsme si jako my máme klasický end to test je prostě úplně jako nuda napsaná v Typescriptu a v Playwritu jako která říkáklikni na tlačítko, který má napsáno tohle, pak očekává bejt na stránce tohle, pak udělají tohle, pak pohoni mýší sem. Ale my jsme udělali takovou věc, že jsme z těch PRDs, který píšeme, vyrobili markdowný dokument, kterj popisuje to chování tý stránky lidským jazykem. Prostě na stránce se má uživatel možnost přihlásit jménem, admin a heslem test. Tím se proklikne do adminskýho panelu, tam by měl vidět graf interakcí, ten by se měl umět přiblížit a něco prostě takhle popsaná jako lidsky. To tady ten dokument by normálně měly klasický lidský testovací klikači a já jsem tohleto dal agentovi, ale přidal jsem to do tý pipeliny. Takže vlastně jako součástí tý testovací pipeline je to, že se spustí jako jinej jiná instance kodexu nebo cloud kóda, která má za úkolné ne udělat něco v tom projektu, ale jenom vytvořit soubor, kterej udělá nějakej report z tady toho testu a na konci tady toho souboru je OK nebo fail. a tím tím se to automaticky očekuje. Z mýho asi měsíčního testování tady toho přístupu mně přijde, že to funguje strašně dobře, že je to jako strašně dobrá další vrstva nad těmi jako klasickými end testy. >> Jo, ono jako je toho strašně moc, s čím se dá pracovat. Dokonce. Tak zase se vracíme k tomu. Už to tady bylo. Máme tady historicky věci typu Gerkin, který specifikuje nějakou řekněme jako gramatiku pro to, jak psát scénáře. Takže je tam taková ta klasika given, when, then. A tímhle způsobem já jsem schopnej to popsat tak, že tomu rozumí byznysák, že tomu rozumí agent a pak to prostě umím spouštět. Dokonce už jako zase existují nějaký nástroje a mám je v pipelineě na testování, takže nevím, jak jsou jak jsou stabilní, kterým prostě předložím takhle Gerkinovy scénáře a oni mi takhle procházejí tu apku automaticky. A teď jako začínáme docházet k tomu, že ano, je to super, protože já ty Gerkin scénáře pak dávám rovnou jako třeba do toho Playwrighto. Je to nějakej v rapper nad Playwrightem, kterej to kombinuje s AIem. Potom to mám ale na úrovni Codebase a teď jak spolupracovat s netechnickýma lidma? Budu je učit, co je to terminál a co je to GitHub, nebo zkusím vymyslet nějakou jinou abstrakci? >> Mimochodem ta pohádka, to už tady bylo, to je to je jako velmi obehraný v IT světě. To si myslím, že vůbec není nový, to nepřišlo s Aikem. A mimochodem Basic a Koball, to jsou úplně jako jsou jazyky, o který podle mě jako většina lidí ani nebude vědět, že existujou. Tak vlastně ta jejich původní idea byla, že by se programy měly psát v přirozený angličtině, že by se to nemělo psát v nějakých složitých systémových instrukcích, ale že by měly existovat nějaký instrukce, který zněj jako přirozená angličtina. A myslím si, že když dneska někdo ukáže Cobol Basic a možná je to SQLko, co má vlastně jako velmi podobnou story, si myslím, že nikdo neřekne, že tohleto není pro odborníky, ale ale pro běžný lidi. Já si dokonce myslím, že bude existovat odborní jakože pokud se nějakej takovejhle agentickej způsob testování ujme, což si myslím, že se skoro jistě ujme, tak ty dokumenty, ty scénáře, to taky budou psát lidi, co tomu rozumí. To taky bude nějaká odbornost, která bude umět správně popsat chování. Akorát prostě ty lidi nebudou muset umět psát X path selectory, jako budou muset mít tu odbornost jako testovat aplikace. >> Já si jako nemyslím, že to musí bejt nutně jako člověk na tohle specializovanej. Ostatně existuje, že jo, říká se tomu trio, že je tam tester, produkťák a vývojář. Ty jo, jak se to jmenuje? Má to nějaký nějaký název product trio, že jo. A to je víceméně to jsou víceméně ti lidi, kteří by měli být schopní napsat tady ten popisek, kteří to popíšou a kteří si vzájemně mezi sebou zvalidujou, že je to OK po stránce produktu, OK po stránce vývoje, OK po stránce UX. A to je něco, kde se zase přesouvá a transformuje celý to SDLC. už to není. A ono to jako dlouhou dobu nemělo být o tom, že si přehazujem balíčky. Jakože teďkon právě jsem byl na pokecu s Karlemným a on říká: „No, tak tam než se dostane tiket k vývojáři v některých bankách léta páně 2015, tak dostane vytištěnou byznys analýzu, kde jsou normálně PSQL dotazy napsaný na papíře. Takže ten člověk to jenom přepisuje. A analytik e když dostal dotaz, hele, a proč to jako rovnou nenaprogramuješ? To ne, já nejsem programátor, to musej dělat ti vývojáři. A ano, oni to musejí dělat vývojáři, protože z Wordu fakt nezkontroluju, jestli se ten kód zkompiluje. Je to blbě, jo, ale když se to jako posune od toho, že nebudeme si takhle házet balíčky jako na tady máš analýzu, na tady máš specifikaci, na tady máš kód k otestování, tak je to mnohem lepší. Jo, místo toho, když testér dostane kód k testování a jediný instrukce jsou, tady máš tiket, počkej si, než se ti vytočí prostředí, tak to prostě nemůže fungovat. A nebo když to je ještě jako horší příklad, kdy se ten vývojář řekne tomu testerovi, co má testovat. No samozřejmě, že ten vývojář mu neřekne, tady to nějak blbne. Většinou, většinou jako jsem ve firmách potkával, kdy mu dá jako instrukce k tý Happy PAF a nebo k těm pár jako unhappy PAF, ale rozhodně tam pak není ta invence. A to je důvod, proč jsou ty role rozdělený, že jo, protože tester má jinej mindset než vývojář a je potřeba s tím pracovat. Ve spoustě firmách je to o masivní transformaci celýho procesu. A i když my na krásně zrychlíme vývoj desetinásobně, tak to neznamená, že zrychlíme celej proces desetinásobně. >> Hm. >> Jo, nám se to jako hezky mluví. Myslím si, že my všichni vlastně jsme v týmech, který jsou docela AI capable, ale pak tady máme projekty, kde je stakeholder třetí strana, která jim lidem řekne, no tady máte jenom ret only access na Figmu a udělejte to nějak podle toho, ale nemusí to bejt 1:1, protože jsme to prostě tam naklikali rychle a podobný věci, jo. Takže my máme obrovskou výhodu. Uvidíme, jak se to jako promítne. Někde se to mění do toho, že se vytvářej nějaký jako mini týmy, který mají třeba tři lidi, kdy všichni jako úzce spolupracujou. Jinde se s tím pracuje tak, že se dělá obrovskej e backlock, kdy všichni to odbavujou tu jednu věc. To je zase to je zase další záležitost, kterou mi řekl e Karel. Existuje něco, co se nazývá les. Slyšeli jste někdy o les a nemyslím tý CSSkový eh preprocessingový knihovně? Ne, >> je to large scale scramp a princip toho je, že všichni mají jeden obrovskj backlock a odbavujou to tak, aby dosáhli toho cílenýho výsledku. Není to tak, že ty řešíš tady daňovej modul, ty řešíš tady design systém, ty řešíš tohle, ale všichni budujou jeden produkt, všichni odbavujou to, aby to šlapalo. Ta myšlenka zatím je geniální, ale vidět to aplikovaný v praxi, ještě jsem takovou firmu nepotkal, ale Karel tvrdí, že nějaký takový existujou. >> Tak ono taky možná ne všichni jako i chtěj bejt tak strašně efektivní. Pro někoho možná pro některý firmy bude možná jako výhodnější s tím až tak jako nespěchat, s tou snahou bejt efektivní. No nevím, jakože ne všude, ne všude to je výhoda totiž asi si myslím. >> E, já si jako uvědomuju, že jsem na tý absolutní hranici. Mně jde o to trošku i nabourat ten mindset. Proto proto vlastně o tom mluvím tímhle způsobem. Mám teda jako štěstí na klienty, kde nemusím bojovat s takhle šílenou byrokracií často, nebo je tam aspoň nějaká vůle optimalizovat jiný části. Jo, všude se na něco narazí, ne? Že ne, ať už je to prostě mateřská společnost nám přikázala, že i po zvednutí cen musíme používat Gitubilo. Nebo je to stakeholder tady trvá tři týdny, než nám pošle reakci na úpravu požadavky. Jo, ale to neznamená, že se nedá transformovat jiná část toho vývoje. Jedna z věcí, kterou já mám jako extrémně oblíbenou, quitujou to i a mám to právě od lidí z Bit Dance, kteří stojí za packem a tak, tak oni říkali, hele, jedna z největších věcí, kterou pro mě AI změnilo, je jak moc můžu zkoumat konkurenční implementace. Dělají na compilerech, kompilátorech a podobnejch věcech. V minulosti to bylo tak. Hele, podívám se na to, jak to dělají v C a podívám se na to, jak to dělají v C++ a budu mít nějakou dobrou výchozí pozici, protože tohle jsou dostatečně vyspělý ekosystémy na to, aby měli asi zvládnutej compiler. Dneska je to tak, že z AI prozkoumají 30 různejch implementací, z Rust, CO, Odin a X milion další začnou distilovat ty myšlenky do tý svojí vlastní e potřeby. A to je něco, co se strašně moc podceňuje. Jak moc můžu prozkoumat, jak to dělá konkurence, ať už algoritmicky nebo po stránce UXI. Takže to zase má dopad na celý SDLC. Můžu se podívat na to, jak se testujou apky jinde, že se dělají někde už jenom vizuální testy, protože člověk vlastně taky funguje na bázi vizuálních testů a svojí nějaký vlastní paměti. My rozhodně neříkáme jako klikni na tlačítko střídou tečka něco a tak. Takže ten posun je extrémně širokej a je to jenom o tom si najít místečko, kde to může fungovat. To mě přivedlo na video, který tady nasdílím. dáme ho pak do materiálu a to je zase můj oblíbený Theo Brown, který jako získává spoustu hejtů od různých lidí, ale on mluví o jedný důležitý věci a to je to, že my máme nějakou škálu. Ta škála je prostě slop stránka, kdy si to navajbuju v makali nebo v něčem takovým. A pak je to software, kterej běží v kardiostimulátorech a podobnejch věcech. A spousta lidí přeceňuje, jak moc je důležitej ten jejich kód. Spousta lidí si říká, no to je strašně důležitý ten kód, nemůžou tam být chyby a tak dále, ale realita je taková, že většina projektů nestojí lidský životy, když se něco podělá. Ale to je jenom část toho příběhu. Druhá část je, že i když jsem na tom extrémně náročným kódu, kde to může stát lidi životy a napíšu 200 řádků za den, tak to neznamená, že já nemůžu použít AI k tomu, abych podpořil tu moji snahu, že budu najednou generovat 2000 supportních řádků, budu si dělat nějakej fazy testing, budu dělat chaos testing, zkusím si odstřelit nějaký části servis. A to jsou věci, který se nikdy nemusejí dostat do tý produkční části, ale můžu si tím extrémně vylepšit celou COD base, protože ji posílím. Jeden z takovejch jako typů, kterej nestojí 2000 řádku, ale já to říkám všude, je, pokud máte testy, zapněte fully parallel módgu, a zapněte paralelizaci na n-1 vláken, který na počítači máte. Takže třeba na m Macu to pojede na devíti vláknech. Na když máte Thread riper, tak to pojede klidně 63 testů paralelně a tak a v tu chvíli poznáte, jak moc jsou vaše testy stabilní a jak moc jsou na sobě závislý. A taky zjistíte, jak moc se dá zrychlit CICD, když tam dáte jako silnější stroj s větším množstvím paralyzace a tak. To je to je hrozně zajímavá myšlenka, že vlastně se dá dělat strašně moc různých řekněme experimentů, který by člověk prostě dřív nedělal, protože na to neměl čas, protože musel psát jako ten kód svůj, ale teď prostě si může vymejšlet všechno možný a jenom přijít na to, co zkoušet. No, >> zkoušet se dá úplně všechno. Jo, jako prozkoumáš konkurenci, prozkoumáš prostě uděláš uděláš si blbej deep research na to, jak zlepšit kvalitu kódu. Jo, máš tam máš tam jako milion věcí. Antropic měl článek právě zaměřený na fázi testing, to myslím bylo, nebo property based testing, kdy principem právě je, že nemám definovaný hodnoty, se kterejma ten kód testuju, ale jedu na nějakým jako tom intervalu. Takže vím, že prostě tahle funkce bere 1 až 100 a druhej parametr je jedno písmeno z abecedy. Blbost, jo, ale plácnu to. A místo toho, abych si vydefinoval, ok, tak otestuju pětku a ačko, tak prostě ten fazy testing nebo property based testing mi tam bude dávat random inputy v tý validní kombinaci a budu hledat, jestli tam nejsou nějaký issues, jestli třeba nějaká kombinace není problematická nebo jestli to mám naspecifikovaný správně. Jo, moje můj oblíbenej test, e, kterým jako odhaluju mindset testera, je máš input na číslo. Co tam zkusíš zadat, abys to rozbil jako první? Já bych tam zkusila nezadat nic teda. >> OK, to neřeš. Ber to jako ber to jako HTML input prostě na frontendu. Neřeš jako co je na backendu. Nadáváš to tam jako testér. >> OK. OK. Hele, to se mi to jsem jako to je většinou ošetřený, ale co je strašně často rozbitý, zejména pokud to jsou jakoby ty manažovaný inputy, tak je když udělám exponenciální zápis čísla. Já napíšu, že si chci koupit 1 E5 produktů a viděl jsem apky, kde tady tenhle zápis crashnul celej frontend. Prostě mi to crashnulo celej prohlížeč, ne tab, ale celej ten frontend vy vystoupal do takový úrovně, že mi systém zabil prohlížeč. Takže to je jako taková myšlenka na závěr. Zkustte přemýšlet nad tím, jakjma všema způsobama můžete vylepšit kvalitu vašich aplikací. A nemusí to bejt vždycky ty ordinérní, který jste navnímali za svou kariéru. Je toho spousta, co je neobjevenýho. Teď je ten nejlepší čas objevovat všechno možný. >> To je hezkj závěr. [smích] >> Ahoj. >> Ahoj."
businesses\ai-ta-krajta\aiTaKrajtaEpisodes.json:99:        "transcript": "Vítám vás u 55. dílu ITA K. Dneska zase v tradiční sestavě s Petrem a Jirkou. Já bych na začátek poděkoval Prombooku a Prombook z AI Supervise za to, že nás podporujou. Rovnou začněme novinkama, který byly tenhle týden a není jich málo. Kdo z vás chce začít? >> Já to asi začnu pálit. Rovnou. Začnu tím, co eh podle mě spoustu lidí čekalo. Já jsem popravdě čekal, že první, kdo to vydá, bude eh Antropic, protože tam se o tom mluvilo taky. Bylo to vidět jako ve zdrojácích Cloud Coda, že na něčem podobným dělaj, ale eh udělali to první Open AI udělali sites. A součástí kódexu je, že můžu přímo použít sits a ono to jako e udělá kompletní webovčetně u roll adresy. A v tuhle chvíli je to teda dostupný jenom proznys a enterprise, ale v principu řeknu, hele, potřebuju nějakou mikrosajitu, ono mi to udělá. Kodex má už integrovanej prohlížeč nějakou dobu, eh, takže všechno to dělám z jednoho místa. Jsem zvědavej, jak moc se jim podaří bojovat s tím, aby to byl takovej ten jako klasickej eh AI slop, protože ruku na srdce, kodex stále není nejlepší v dělání hezkýho UI, ale to, co tady prezentujou, tak není vůbec špatný. Tak pokud se jim to povedlo jako vylepšit, tak wow. >> Dokážu si tam přidat nějaký jako MCP server skills nebo nějakej jako dodatečnej kontext, aby mi to dělalo ty věci hezky. >> Hele, normálně z kodexky. Jediný, co uděláš, je podle všeho, že napíšeš zavináč sites, ale můžeš tam normálně referencovat skilly a tak dále. >> A jde na to použít yolo mód, že bych jako vysloveně, >> že bych jako jel od začátku do konce. V tom případě jakoby máme tady něco, řekněme jako dark factory? >> To si nemyslím. Myslím si, že je to prostě, když jako klikneš tady, tak tady máš klasický jako e ask for approval nebo tomu můžeš nastavit jako jiný varianty. Je to prostě jenom jako skill, kterej umí i deployovat. Podle mě to není jako nic jinýho, že udělali nějaký jako hosting k tomu, ale je to spíš jako zjednodušení celýho toho procesu, než že by to bylo jiný workflow, což mi přijde super v tom, že Open AI naprosto skvěle konsoliduje věci do kodex apky, zatímco Antropic je hm uděláme kovor, uděláme designer, uděláme tohle a tamhleto a jsou strašně rozstřelení, kdež to open AI ty věci jako velice dobře konsoliduje do jednoho místa a jediný, co mi tam zatím chybí, je eh mít možnost vyloženě chatu z chatu GPT uvnitř kodexu, že na mobilu v tuhle chvíli už se jako můžu přepnout z chatu GPT do kodexu, kterej je připojenej u mě na počítači. Na počítači zatím nemám součástí Kodex appy chaty z chatu GPT, což je poslední věc, která mi tam jako chybí. Myslím si, že se tomu trošku budou bránit kvůli tomu, že ve chvíli, kdy to udělají, tak budeš moct přidat MCP servery a podobný věci, GPT 5500 Pro a to je zabije na nákladech. Takže myslím si, že hlavní důvod je ten, že pokud to povlej, tak extrémně drahej model bude dostupnej na mnohem víc úkolů, než který dělá v browseru. >> Je třeba známý na jakých serverech ty sites budou běžet, kde se to bude deplojovat. >> Zatím o tom nemám žádný další informace. Eh, ale mají k tomu blogový článek, takže uvidíme. >> Jo, jo, vš používají lidi v zapíru, e, a vytahují právě informace jako ze sleku a tak, takže normálně tu link tam půjde se vším všudy. Tohle mně přijde, že vlastně se se hýbeme tím směrem, který jsme tady už i třeba s Adamem s Vadou řešili, že vlastně to těžiště toho provozu nebudou ty plovable, prostě user interface, ale bude to budou to ty ty computy, na kterých to bude běžet dlouhodobě, jakože vlastně to bude ten byznys, za kterej se budou vydávat peníze. >> No to za mě jako rozhodně. Ono to, ono to jako souvisí s tím, co představili jako dál, že udělali roll specific pluginy. A když se podíváte na ten vizuál, tak ono to vlastně vypadá úplně stejně. Prostě mám jako data analytics s nějakou ikonkou, takže tady udělali jakože různý věci, creative production a jsou to prostě spíš jako nějaký rolový pluginy, skilly, který aktivuju jako conditionally, že to prostě zavolám a ono mi to aktivuje celou sadu věcí. Tady mají jakože mají nějaký sales plugin, který můžu použít product design, kde zas pracuju s nějakýma jako userfows, nějakej public investing plugin, investment banking. Takže podle mě je to prostě jenom jako další soubor věcí, že to není jako jenom skill, ale že je to fakt jako celej plugin včetně MCPček a tak, který já můžu podmíně zavolat. Jo a tady je vidět, že už vlastně renderujou přímo UI přímo v chatu GPT, takže se to jako posouvá extrémně jako dopředu do tý jednotný integrovaný vrstvy. >> To je něco, co asi není možná úplně velký překvapení. E mě vlastně to přivádí na další jako téma, který jsem chtěl tady nakousnout a to je právě, že něco, čemu se říká capacity wall. Jde vlastně o to, co jsme zmínili, že ve skutečnosti jako když se podíváme na historii, řekněme nějakýho hospodářskýho vývoje třeba v Evropě, jakou roli hrálo třeba uhlí a jakou roli bude hrát dejme tomu compute nebo proxy toho může být jako elektřina, tak [odkašlání] mám takový pocit, že to může být zrovna oblast, ve který ta špatná Evropská unie, která je strašně neefektivní, může hrát nějakou významn Ou, roli. E, m třeba zaujalo, že Richard Mládek, kterýho jsme tu měli v Krajtě nedávno, tak má k tomu zajímavej článek, kterej doporučuju třeba přečíst o tom, jakým způsobem tohleto může hrát roli prostě v budoucnosti, řekněme, nějakýho našeho růstu hospodářskýho. Přijde mi to zajímavý. Já si jako myslím, že ta jako celková integrace bude hrát jako strašně velkou roli, protože myslím si, že jako obzvlášť my jako programátoři tohle hrozně podceňujeme, že si říkáme, že přece jako každý ty věci dokáže jako vzít, vyexportovat nebo nasadit, kam potřebuje, ale to podle mě jako reálně drtivá většina lidí neudělá. Jakože tady jsou možnosti, když bude horší, tak >> i kdyby ten boxing byl dv dvakrát dražší a dvakrát horší, tak to stejně lidi použijou to defaultní. >> Jo, jednoznačně. Já jsem se jako byla to nejpoptávanější věc, co jsem měl na Vipe Coding kurzech, jako nejvíc času a nejvíc dotazů bylo na to, jak to nasadit a prostě bavili jsme se o tom jakože Vercell, Cloudfare a nějaký podobný věci a eh všichni tímhle všichni tímhle směrem jdou, že to jako zjednodušujou, eh integrujou to přímo a myslím si, že eh ve srovnání třeba s Lavable, tak tam jako hodně ztrácí tu jako půdu pod nohama, pokud nemají jasně definovanou cílovku. Tam si jako myslím, že třeba Makali to má jako velice dobře uchopený, že oni si rovnou řekli, hele, my budeme jako e tam umět zpracovávat všechno i videa a tak dále, což teďkom jsou ty nový věci, který oni tam hodně jako přidávají, aby tam ten člověk mohl nasypat cokoliv, dostat hezkej výsledek. To si myslím, že je jedna z těch cest, jak se jako vyprofilovat, ale nesleduju tolik lavable, ale nepřijde mi, že by, že by oni měli ten jako jasný profiling, tak jako makali. >> Podobně. Oni ho do jistý míry být nemusej, protože oni tím, že oni jsou ten jako the brand toho jako vibe codingu těch webů, tak oni můžou být v tý šedý zóně. Nebo těžko římit můžou, ale minimálně jsou. Jako oni jsou takový jako nemastný, neslaný vlastně jako od nich se všichni ostatní jako odpíchávají a odví. >> Někdo je koupí, to je v pohodě. Hele, já si myslím, že je to to, jak jsme řešili. Prostě Lavable už teďkom otočilo k tomu, že jejich hlavní profit nebo jejich směr je, že budou taky hostovat ty apky. Jo. A souvisí to trošku i s tou jako další novinkou, co mám. Lavable teďkom přešlo z čistýho ví na tanak start, takže všechny nový projekty používají tantack start, což má ohromnou výhodu a zároveň jako můžu už házet míň špíny na lavable. Už to je serverově renderovaný. Takže když udělám marketingovou stránku v Lavable, tak nemusím prostě se bát toho, že to bude mít jako velký dopad na performance, že crawlery nic neuviděj. Takže to, co byla dlouhou dobu velká výhoda Makali, že jsem měl jako full server side rendering díky Nextu, tak Lavable teďkom jako dohnalo a troufám si říct, že tantack start je lepší než next. Je tam mnohem míň foods a někdo by řekl, hele, tak jako na Next je přece víc dát, že jo. Jenže next díky tomu přechodu na React Server Components a novej updirectory, když teďko chvilku budu jako hodně technickej, tak odstřihl strašně moc věcí a ti agenti v tom prostě dělají chyby. Tuck start k tomuhle má mnohem střízlivější přístup, takže pro ty agenty je to mnohem menší chaos. Takže za mě jako parádní volba. Jsem zvědavej, jak se k tomu jako vmaly postavy, eh, protože v tuhle chvíli SFAignou jedou stále na Nextu a nemají tam jako nic jinýho. >> To je zajímavý, jakože mně přijde, že všichni dělají totéž. Eh, není to totéž úplně. Další novinka, kterou jsem chtěl říct, je, že jsem zaregistroval takový zajímavý benchmark, kterej publikoval Tesla IO, kterým se tady taky občas zmiňujeme. Je to něco jako, nevím, k čemu bych to přirovnal, ale tenhle benchmark prostě testuje to, jak moc se nějakej model řekněme zlepší, když mu dodáš správný kontext. To znamená, že oni ty úkoly spouští v podstatě dvakrát jednou. bez kontextu, takže zkouší prostě syrový model bez nějakých jako dodatečných informací a potom mu přidají nějaký návod v uvozovkách, jak nějakej problém vyřešit a sledujou, o kolik se to jako zlepší. To znamená, že to dělá jako něco trošku jinýho než obvyklý benchmarky. A ta meteorologie je teda jako dobře popsána tady v tomhletom článku a přijde mě zajímavý, že to prostě otáčí malinko to pořadí, tak jako jsme viděli minulej týden, když jsme srovnávali Deep SWE nebo jsme se na něho koukali, myslím, že to bylo v minulým díle, tam to pořadí bylo prakticky jako opačný, ale tady je vidět, že ten lift nebo to zlepšení je vlastně jako docela zanedbatelný, že jako. Tak to je jenom taková alternativa k jiným situacím. E taky tam upozorňuju na to, že clot 48 je pomalejší o dost ve srovnání třeba, já nevím, s komposerem 25 nebo 25 fast. >> Tam je tam je vlastně přěrhle tohle měřit a nejenom to měřit eh a analyzovat, ale teďkom se kolem toho vyrojily i nějaký další toly. E, Microsoft něco vydal, teďka si nevzpomenu na název, ale v principu je snaha a Tesla to říká na těch stránkách, jako máte skilly, ale používají je ti agenti, zlepšujou se ty skilly, vylepšujete je iterativně a s tím teďkom jako čím dál tím víc e projektů pracuje. Microsoft něco vydal. Eh, kolem DSPY community se dějou věci na tomhle poli, takže eh nějaké jako self evolving AI začíná bejt čím dál tím reálnější. A teď jako říkám AI jako balíček, ale reálně se děje to, že spíš než bysme šli cestou sebezlepšovacích se jazykovejch modelů, tak zlepšujeme ten ekosystém kolem. Zlepšujeme to, jak jsou popsaný tool cally, jak jsou popsaný skilly. Detekujeme, jak moc se skilly používají, jestli agent na základě traců třeba to nevolá špatně, nepoužívá špatně nebo něco. Takže jdeme spíš jako tou vrstvou k, protože je to výrazně levnější. Je to takový kosmetický vylepšování, řekněme. A ono je to myslím i celkem vidět na tom, že rozdíl mezi clódem 47 a 48 není zas tak velkej, ať už se podíváme na téměř jakjkoliv benchmark. Podle mě >> m skoro jako připadá, že jako 4/8, jako trošku si do nich ríknu teďka, ale skoro mně připadá, že 4/8 byla vedaná jenom proto, že prostě museli něco vydat a zároveň potřebujou jako potřebujou prostě ty věci valit dopředu, tak jako něco vydali. v nějakých žíslech je lepší, ale nevím, nemá nemám z toho jako pocit, že by že jako přijde mi, že je hrozná inflace toho jako vydávání, ať už od Open AI nebo od Antropo. >> To já jako doufám, že Open AI zase něco vydá. Furt čekám na pět šestku, protože co se týče jako modelů, tak teďkom jako svou odpověď nevydali na 48. Na druhou stranu já nemám ten pocit, že by to jako potřebovali a nevím, jaký máte pocit vy teďko jako oproti 48, když už jste si ho jako zkoušeli, ale spousta lidí v mým okolí říká, že stejně se držej čtyři sedmičky nebo dokonce čtyřišestky a dokonce dokonce jako někteří lidi v Americe, eh když nepotřebujou, aby to měli rychle, tak na to hoděj opus 41. >> Jo jo, to dává dává smysl. Minimálně prostě překvěše pro některý úlohy nebo pro velkou část úloh to zlepšení není až tak až tak veliký. H je pravda, že jsem se nekoukal, jestli tam došlo k nějakýmu pohybu v cenách za input, output tokeny 48. To teďka fakt nevím. Nevíte náhodou, jestli se to třeba zlevnilo trošku nebo naopak zdražilo? Myslím si, že to zůstalo stejný, ale a tam je teďkom, najdu to na ar je to je to stejný, je ta cena stejná a to mě jako překvapilo, že to nevyužili k zdražení, ale nevím. Já jsem si všim, myslím, že to je takový jako jenom subjektivní pozorování, ale když se občas kouknete na tu usage v Antropic účtu, pokud máte předplatní, teda já to jako dělám tak, že tam mám nějaký nabitý nabitý eh nabitou [odkašlání] usage a mám předmotný a zdá se mi, že ta 47 začala konzumovat ten usage malej od od vydání 48. Nevím, >> ne? Já teďkom jsem to konečně našel na artificial analysis. Tady je eh srovnání. Oni mají vlastně několik srovnání. Tady to je na output tokens a tam je vidět, že absolutně nejravější jako Deep Seek 4 Flash, kterej prostě svou inteligenci supluje reasoningem. Ten prostě na celej ten benchmark spotřebuje 227 milionů tokenů ve srovnání s GPT 55, tak ta spotřebuje 68 milionů. To je jako brutální rozdíl, ale dipsík je zase jako extrémně levný. Nicméně teď je tady ta druhá část. Pojďme se podívat na cost efficiency. Nejhorší je opust 47, opust 48, Sonet 46 a pak až je GPT 55 x high x high, pak je tam jako 54 mini nebo jako Gemyite 35 flash, která jako taky zas eh hodně jako stojí. A pak když půjdeme jako níž, tak tam se jako pohybujem na něčem úplně jiným. A ten rozdíl v ceně je jako brutální. Takže ano, 47 versus 48 je tam pokles necelých 500 dolarů a nebo můžu použít open AI a ušetřím 1800 doarů. Jo, tady mají inteligence versus náklady. Tak co je tam, co tam jako vychází nejlíp? Tak úplně jako ta špatná část frontieru jsou jako antropic modely. Pak jako mistral tady a když se podíváme na ty, který jsou jako na tom líp, tak úplně jako nejlíp ve vztahu k tý inteligenci, tak je tam jako 55 a pakř teda jako Gemyight 31 Pro, který je výrazně levnější, ale na úrovni jako 54 x High. To už je jako subjektivní v tom, nakolik si myslíme, že že Gemini jako se vyrovná 54. Za mě Gemina je extrémně extrémně harness dependent, ale pokud jí dám dobrou harness, tak nemusí bejt vůbec špatná. >> E, já taky očekávám, když ty očekáváš pětšest, já očekávám 35 pro nebo takhle jako nezaznamenal jsem ještě, že by bylo někde použitelný nebo snad >> a Google IO říkali, že bude za měsíc až za dva. >> Hm. E jsem zvědavej, jak moc navýšejí ten index, protože když se podíváme, tak 3.5 Flash je horší a dražší než 31 pro, jo? Ona stojí prostě o 700 dolarů víc a má jako nižší ten index inteligence. >> Hm. Jo, já bych řekl, že se to posune víc do toho zelenýho pole, ale těžko říct. Můžem se tady za tři měsíce nebo za dva měsíce podívat na to, jak se to posunulo. Mimochodem, když ukazujete tady ty grafy, já jako já mám úplný dežavý asi jako z 2 a pů roku dozadu, kdy jsme byli na jako v Londýně jako mentoři na Hekatonu, kde byl mimochodem i Antropik a tehdy to bylo tak, že Antropic vlastně jako byla ta nezajímavá firma, jako tehdy prostě všechno bylo chat GPT v podstatě jakoby ne jako neexistovalo prakticky nic jinýho kromě chatu GPT jako pro pro běžný lidi, ale jako cloud modely reálně už byly dobrý. možná jako srovnatelně dobrý s těma s těma GPTýma, ale nikdo se o ně nezajímal. A teďka mně připadá, že to úplně obrátila, že jako Open AI je vlastně jako dobrý, nevím, jestli jako lepší, ale jako minimálně stejně dobrý. Ale v podstatě já když se teďka bavím třeba v rámci jako super vize jako s firmami a koukám se na to, co lidi používaj, tak je to reálně tak, že ten jako clot úplně brutálně jako všuda, že v podstatě jako spíš raditně vidím cokoliv jinýho než clot. A je to strašně podobný jako před těma 2 a pů lety, kde v podstatě všechno bylo to GPT a cokoliv jinýho byla úplná rareta. Já myslím, že Antropiků se podařilo vzbudit takový ten dojem, že jsou prostě open AI nebo něco takovýho, >> což si myslím, že se jim jako podařilo zkombinovat i s tím, že open AI vlastně uzavřelo jako e deal s americkou vládou a tak. Takže ten sentiment jako e Antropic velice dobře oznámil eh jako použil. Přivedlo mě to ale jako na další novinku, protože tenhle týden byl jako extrémně nabitej. Open AI modely jsou na bedrocku. Vydali to dva dny zpátky a to byl jeden z klíčovejch, absolutně klíčovejch věcí k tomu, aby se antropic tak moc rozlezli, jo, protože majorita firem, ať chceme nebo ne, tak stále jede na bedrocku. I velký korporáty teďkom migrujou z Azure na bedrock. A to, že já můžu už jako mít všechno v jednom tenantu, tak je naprosto neskutečný. A myslím si, že teďkom se možná trošku jako karta obrátí, protože jak jsem říkal, Microsoft už není výhradní provider Open AI. Open AI může bejt na jinejch cloudech a Open AI se vyvázalo z toho svazku s Microsoftem tak moc, že jako Microsoft téměř jako utřel. Takže tam si myslím, že se jako v Enterpriseu začne karta taky docela rychle jako obracet, protože eh Open AI teďkom má něco, co už dlouho Antropic měl a můžou jenom získat. A já se možná jako ještě mojí novinkou vrátím k všem těm věcem předtím a taky k Microsoftu, protože Microsoft vydal Scout, což je jako v podstatě Open Claw pro firmy a mně připadá, že se jako, že to má nějakou paralelu mezi tím jako Antropicem a Open AI, co jsem říkal, protože mně přijde, že Antropic to teďka vyhrává ne kvůli tomu, že by měl jako lepší jako že by ho měl lepšího klóa na webu, že jako neudělal jako ekvivalent. Chat GPT, kterj by porazil Chat GPT. On si jako začal hrát úplně jinou hru a to jako hru těchhletěch jako coding a vibe coding agentů. A já si myslím, že jakoby Microsoft se teďka do tý hry chce vrátit tím, že oni jako říkaj always on personal agent, ten se podle to dělá open claw. A myslím si, že tyhlety jako my tomu promku říkáme dlouho žijící agent nebo jako forever žijící agent, tak eh tohleto podle mě bude nový hřiště. Myslím, že to bude jako novej jako nová kategorie produktů, která bude jiná a bude zase vnímána jednou matrikou. Co tu myslíte? >> Ono to není něco jako open claw. On je to open claw. Vyloženě i Peter Steinberger říkal, je to Enterprise Open Claw. A tohle je leak z copilot.com, kde máte jako integrovanýho GitHub copilota s autopilotem, což je ten jako scout, kterej bude dělat tyhle věci furt a můžete mu zadávat tady prostě nějaký tky a tak dále. A Microsoft se rozhodl, že udělá kvalitní super appku. Tohle je první screenshot, kterej máme. Já tomu jenom fandím. Já jako dlouhodobě říkám, že super app jsou jedna z klíčových věcí, který my na západě neumíme dělat. Kdež to v Asii je to naprosto běžná věc. >> Zkus trochu přiblížit, co myslíš tím super apka. Jakože to je nějaká hluboká integrace. Hele, super aplikace jsou koncept, který vlastně kombinuje typicky, ne vždycky, ale typicky kombinuje to s modul Federation, kdy vlastně já mám jednu aplikaci, která je ale složená z více různejch aplikací, který mají samostatnej deployment life cycle, což e ti přináší to, že ty týmy na sobě nejsou závislý, když se odstřelí jedna apka, neodstřelí se všechny další, ale pro uživatele to působí jednotně. Nevím, jak je copilot e na pozadí implementovanj v tomhle případě, ale mluví se o tom, že to bude jako super apka. Když uvedu nějakej jako konkrétní příklad, tak kdo jste někdy byli v Asii, tak Grab, Bolt a podobný, to jsou typický příklady superaplikací, kdy z jednoho místa si objednám auto, objednám hotel, objednám jídlo a eh vlastně to mám všechno na jednom místě. A samozřejmě jedna věc je ta architektura na pozadí, druhá věc je to, jak to působí na toho uživatele. A teďkom se to jako děje čím dál tím víc i u nás na západě. Škodovka, tak mám apku, ve který eh řeším auto, ale mám tam i objednávání parkování a placení jako za lístky a tak dále. A tohle se všechno vlastně konsoliduje, protože pro ty firmy je to neskutečně cenný. Já jako firma uzavřu toho člověka ve svým ekosystému a on si pak navykne, že spouští jenom ten. >> Jo, já mám přesně tenhleten pocit, kdykoliv jdeme někam do firmy s Prombookem, tak h to je vlastně jedna velká hromada jako aplikací, který spolu vůbec nekomunikujou a přesně tenhleten Super App je tam potřeba. Přijde mě, že jako Microsoft ještě stále má před sebou hodně práce v tomhletom. >> Já si naopak jako myslím, že teďka jde nějakej prostor pro něco, čemu by se bylo nazvat super agent, kdy jako reálně jako reálně v Evropě takový ty jako velký superabky, který jsou v Asáii, nemáme. Jako reálně to jde v Evropě. Jsme zvyklí na to, že prostě jako různý věci děláme přes různý aplikace, jako i přesto, že existujou tyhlety jako velký, řekněme jako pokusení. Ale myslím si, že jako agentů a těch osobních agentů hlavně to může být fakt jako jinak, protože pokud jako bude někdo jako přes koho půjde ten trafik a ten někdo ti dokáže jako naplánovat výlet, objednat letenky, zarezervovat hotel, nevím, naplánovat autoservis, udělat vlastně jako cokoliv, tak si myslím, že jakoby je tady nějakej potenciál, aby prostě si všechno dělal přes jedno místo a to pak přináší nějaký nevýhody a nějaký jako rezek. Ale konc to může stát. >> A já si myslím, že ten superagent není závislej na tom, aby to byl jeden provider, protože to už dneska uděláš jako prostě pomocí MCPček a nějakejch konektorů, takže nemusí nutně bejt jako záležitost jedný firmy. Kdežto ta super apka být musela. >> Hele, já bych tam jako hrozně rozlišoval dvě věci. Já bych hrozně rozlišoval nějakou jako technickou závislost a tu jako byznysovou vnímanou závislost. Já dám jako takový trošku možná směšný příklad. Portál Pražana nebo portál občana. Portál občana. To je jako lepší ještě eh jako vnímaně to je to jedno místo, kde jsou všechny jako government up. AP je to taková jako government super apka česká. Reálně to jako to obsahuje v podstatě jako odkazy na všechny ty ostatní věci, případně jako embedovaný iframe jako všude možně. Plus tak divně zbaslenou datovou schránku. Ale jako pro běžnýho člověka je to vnímaný jako to místo, kam jako jde vyřešit ty státní věci. Myslím si, že pokud budeš mít IA agenta, kterej třeba jako komunikuje s MCP serverama jako různýma, technicky různýma, na různých serverech, prostě jako něco objedná dohlíku, tak to pošle úplně jinam, než když kupuje letenky. Ale myslím si, že pro člověka to bude vynímaný jako ten superagent, to jedno místo, kam jde řešit věci. >> A já si myslím, že to bude spíš jako o osobních superagentech. e, než o nějakým jako tom providerovi a je jako je jakože jak jsi říkal, prostě máš tam jako tu technickou vrstvu a tu jako uživatelskou. Za mě, ale obojí bude spíš na straně toho uživatele. >> Zároveň jako co se co si myslím, že jako stále je jako že já nejsem Apple, já nejsem Apple user, ale co si myslím, že podle mě stále tady jako máme nějakýho jako černýho koně, kterej když vystartuje, tak najednou klidně může bejt jako první. Jako ve chvíli, když Apple udělá tu sérii jako dobrou, tak v tu chvíli jako minimálně u iPhone uživatelů má vyhrán. >> Jo, stále mají spoustu oveček. A takhle a tím vůbec neříkám, že ta série bude lepší než nějaký jiný agent. Já si jako vůbec nemyslím, že série musí být nutně lepší, výkonnější, líp v benchmarkích. Myslím, že to je každýmu úplně jedno. Jakože ve chvíli, když to bude na iPhonu, tak by to muselo být výravně horší na to, aby ty lidi byli ochotný si tam nainstalovat nějakýho jinýho agenta. >> Plus je tam ještě to, že Apple samozřejmě tam jako jiný konkurenty nepustí tak hluboko integrovaný. Takže jako Apple ano má obrovskou výhodu v distribuci. a má obrovskou výhodu v tom, že má uzavřenou platformu a jedinej, kdo mu do toho může promlouvat, je, že řekne Evropská unie, hele, jako musíš to zpřístupnit a Apple řekne:„No, tak vám vypnem něco jinýho a bude dělat naschvály, protože to je přesně to, co Apple dělá. Když dostal nařízený jako USBC, tak rozdrbal PVA, jo. A prostě Apple se v tomhle ohledu chová jak absolutní banda děcek, kterým ji sebral hračku. Otázka je, jestli to jako zvládne protlačit a vyhrát v tomhle ohledu. >> Jako já si myslím, že my se na to díváme hrozně technicky, že já jsem se na to vždycky taky takhle díval, ale jakoby já bych se na to zkusil podívat i jako byznysově. Já si myslím, že oni prostě tím, že mají ten ekosystém, tak oni prostě ten ekosystém chtějí těžit. Oni jako vědí, že ten jako, že teďka jsou na vrcholu těch jako telefonů, že teďka prostě z toho ekosystému jako musí těžit, protože jako na těch na jak se jmenujou ty AR glassesich, na tom jako nevydělaj nic, na tom prostě krvácej. Oni jako mají tu jednu jako svojí jako krávu zlatou a ten iPhone a ten potřebujou vytěžit, co to jde. Si ale myslíš, že myslím, že jako narážíš na to, že Apple má mnohem omezenější možnosti, jak těžit než ostatní firmy, protože Apple velkou část svojí důvěry má postavený na tom, že je to private. I u AIK říkali private compute a tak dále. Takže otázka je, jak moc to budou moct vytěžit, aby z toho měli tu přidanou hodnotu. >> Já si myslím, že stále se jako bavíme jako nebo stále přemýšlíme o tom paradigmatu, že jako potřebuješ jako zpracovávat data, ale ty jako já si jako úplně klidně myslím, že oni jako můžou udělat tobě a oni to reálně už dělají teďka do nějaký míry, že si koupí jako Gemini nebo prostě si koupí nějaký generickj model jako od někoho. Budou to běžet na nějakých Amazonních serverech. Ale daj tomu nálepku Sy. Podle mě to může být klidně technicky jako jako na úrovni toho, co by tady zvládl každej člověk udělat na jako hecatonu za víkend. Ale tím, že to bude Apple, tím, že to bude v tom iPhonu defultně, tak jako tak to má ten výtlak. Jakože reálně, když Apple jako když Apple udělá cokoliv, tak aby to aspoň jako trochu tak to najednou jako má úplně jako milásobně větší výtlak, než jako jakjkoliv startup. To dokáže dělat. Je tady ještě jeden jeden důležitý moment podle mě a to je to jsou malý jazykový modely nebo lokální prostě modely a tam si myslím, že se taky jako pomalu suneme někam, co co bude reálně použitelný na těch zařízeních jako už docela brzo. Můj typ a myslím, že na to tak čekají, >> ale nepodnikají pro to nic nebo aspoň jako zdánlivě jako nic. A já bych jako já bych strašně rád viděl větší důraz jako na ty lokální modely, aby to eh skutečně skutečně mělo tu přidanou hodnotu, protože najednou jako s tím můžu pracovat kdekoliv, nemusím se bát, co do toho narvu a má to strašně moc přidaný hodnoty, ale v tuhle chvíli používat lokální AI stojí strašně strašně moc síly, eh, a vlastně i strašně moc výkonu. Já o tom budu mluvit a teď udělám trošku promo. eh na AI Monday vhlavě eh 226, tak budu mluvit právě o lokálních modelech, eh, a jaký tam jsou limitace, na co jsem přišel a v tuhle chvíli, pokud člověk fakt jako chce mít dobrej model a rychlej model, který mu bude dávat jako odpovědi za rozumnej čas, tak potřebuje zařízení za 50+ 1000. A ten tlak tam samozřejmě jako je. Ta laťka stále klesá a další novinka Nvidia představila něco v týhle oblasti a představili nějaký jakože myslím, že tomu říkají RTX Spark nebo něco takovýho. Je to nějaká jako kombinace pro notebooky, která by tohle měla jako řešit. Takže posouváme se tam. Ale kdo to nejvíc tlačí po hardwarový stránce, tak je Nvidia, AMD. A jinak nevím o ničem jako dalším, co by se co by se nějak jako masivně prosadilo. Qualcom s jejich jejich Nuvia čipama tak nějak neprosadil ani jako na systémový desktopový úrovni. E a co se týče AIčka, tak tam jako nemáme prakticky žádnou jako konkurenci. Tam prostě se jako pošťuchuje AMD, NVIDIA a Apple těží z toho, co bylo v minulosti. Zatímco co co se týče současnosti, tak to jenom zařezává. Nový Mac Studio bude mít míň ramky, jo, už řekli, že nebude mít 512 GB RAM a stále to jako srážej dolů, takže já vidím o Teplu spíš jako snahu to zhoršit, než zlepšit. Přitom oni měli jako tři kroky na to, aby s tím něco udělali. Ještě jsem nejmenoval, co se děje v Armu, jaký jaký výzkum tam třeba dělají a s čím můžou přijít. Ale ok, nechme se překvapit, uvidíme. Já bych tam k tomu jako řekl možná to, že mně se lokální model strašně líbí a bych ještě jako řekl jeden takovj jako pojem, který s tím podle mě souvisí, ale myslím, že je úplně jednak jedný a to jsou jako self contained jako agentně systémy, kdy mě jako nám třeba z prombooku, my se jako hodně s touhletou myšlenkou hrajeme a myslím si, že jako to bude velká věc, kdy budeš prostě mít nějakou jednu krabičku, nějaký jako jedno místo, na kterým ti prostě ten agent jako jede a běží a ne tak, že ti posílá jako apy queries prostě někam. tam někam do Amazonu nebo do open, ale opravdu, že to prostě běží na tý krabičce někde tam. A tohleto je podle mě strašně silá myšlenka, která v tuhletu chvíli vlastně naráží na dvě bariéry. Ta jedna je, že ta krabička by musela být v tuhle chvíli hrozně drahá, jak na provoz, tak na koupit. A ta druhá je ta, že jako v tuhletu chvíli kdokoliv, kdo jede jak tokeny, tak subscription u tý subscription ještě jako výrazně víc, tak prostě strašně těží ty VC many eh jako třeba jako ekvivalent tý situace by byl, kdybychom tady měli jako zadarmo elektřinu, protože prostě se vláda rozhodla jí dotovat, tak eh v tu chvíli najednou jako spoustu jako ekonomických kalkulací, který bychom jako normálně normálně museli dělat a normálně bychom museli třeba přemýšlet o tom, že jestli jako se vyplatí, já nevím, zhasínat světla nebo ne a jestli se vyplatí víc topit nebo víc topit, tak najednou jako přestávají hrát roli a to samý se děje s těma tokenama, že vlastně jako spoustu lidí jako tím jako mířem hodně do našich řad a asi i do vašich diváci jako prostě jed agenty 247 prostě pálí to kliny úplně nesmyslelně, ale kdyby to měli platit, kdyby jako reálně viděli ten účet, tak by to Jako tak by nad tím strašně přemýšlel nad každým jako úkolem, každou věcí, ale jako tím, že je to 10 dolarů, 20 dolarů, 5 dolarů za měsíc, tak jako whatever. Můžu si jako jet kolik chci. Nic mě to nestojí. >> Jako musím říct, že pálím absurdním způsobem, dokud to mám zdarma. Jako prostě no zdarma prostě jako ano, většinu toho mám zdarma, za většinu z toho neplatím. Eh, a ta jako usage je usič je absurdní. Na druhou stranu já tu usage abusuju i k tomu, abych si tvořil dataset pro lokální modely. Já si všechno ukládám. V tuhle chvíli moje Kodex složka má 68 GB textu. Nemažu to. >> Mě to trošku připomíná situaci. Já jsem tohleto hodně abuzoval, když byly ještě obrázkový modely jako ještě předtím, než jsme začali dělat agenty textový modely, tak já jsem byl úplně největším nadšencem jako Mid Journey, když když jako byla a prostě jako byly to první jako modely, kdy opravdu ty obrázky, co z toho padaly, byly hezký. >> A já jsem měl jako script, kterej mě vlastně jako vytvořil v podstatě jako celej jako takovej jako můj malej pomyslnej vektorovej prostor všech možnejch věcí. Já jsem do toho automatickým scriptem ládoval a dokázal jsem vygenerovat asi jako 150 000 obrázků za tu měsíční subscription. Nevím, proč tam neměli žádný jako limity na tohleto, protože to prostě není jako normální chování. A eh stále mě to zabírá jako 20 % mýho jako velkýho jako diskovýho pole a nechce se mi to smazat, protože prostě jako jsem na to hrdej, že jsem to udělal. Palte dokud můžete, zaznamenávejte všechno, co můžete, pak mi budete vděční. Tohle je rada, kterou, kterou jako lidem dám. Prostě nebojte se to jako abuzovat. >> Já bych tady možná ještě jako zvedl jednu otázku, která mě vlastně strašně zajímá od vás. Já jsem teďka měl eh nedávno přednášku na Plzeňským Barkampu. Eh plzeňským, Kolínským barcampu i Plzeňským, ale teďka to byl Kolínskej a tam vlastně jako se zvedla taková otázka, že jestli ty modely jako budou nebo nebudou jako levnější. A jakoby já jsem byl takovej jako osobní typ, se kterým na kterém jsme tam debatovali a jako hodně mě zajímalo, jestli se mnou souhlasíte nebo ne. Já osobně si myslím, že jako teďka je to tak, že ty modely jsou dotovaný a v podstatě jako musí dlou musí třeba v horizontu jako půl roku zdražet, že jako, že jinak nejde, aby to jakože prostě dřív či pozdějš to zdraží, ať už zdraží subscriptions nebo jako se zvednou ty limity, prostě nějakým způsobem to zdraží, ale v horizontu třeba z pěti let, tak ty věci zlevní a to kvůli tomu, že jako ten ekonomický tlak na to, aby ty věci šly dělat efektivněj, bude tak strašně velkej, na nějaký z těch úrovní, ať už prostě na tý hardvarový nebo na tom cashingu nebo prostě jako někde, tak jako k dojde k průlomům a ty věci jako dlouhodobě budou směřovat k tomu, že budou levnější, že to bude mít nějakej jako hue ushape, jak já si myslím, že to zdaleka není jako jasně daný a že vlastně jak jsi mluvil o té elektřině a bavili jsme se tady o tom o té ceně h toho computu, závisí to všechno na tom, jak hustou síť eh jak vlastně se nám podaří vybudovat tu infrastrukturu. Podle mě e když jsi mluvil o elektřině a o tom, že dneska nemáme ve zvyku úplně přemýšlet nad tím, jestli máme rozsvícenou žárovku v jedné a v druhé místnosti současně, tak je to tím, že máme vybudovanou prostě síť, která e poměrně spolehlivě a poměrně levně vyrábí elektřinu. A myslím si, že eh dříve jsme stavěli prostě vedení, který přenášelo tu elektřinu. Teďka budeme stavět to vedení, který bude obsahovat jednotlivý elektrárny. V podstatě malý jaderný reaktory budem potřebovat. Já jsem jako ještě já jako přemýšlím, jestli jsou tokeny nebo AIO víc jako elektřina nebo víc jako procesory, protože u energie, já dám příklad s autama, ale jako je to velmi jako ekvivalentní prostě u spalovacích motorů prostě přesně víme jako kolik joulů energie obsahuje ten litr benzínu. A taky u spalovacích motorů poměrně přesně víme, že jako, že to nemůže být efektivnější víc než 42 %. je nemůže. A zároveň víme, že třeba ten současný motor, co mě tady teďka jede jako dolů a tuduje to tady dole člověk, tak prostě má efektivitu. Teď nevím kolik, ale prostě plác 0 %. To znamená, že prostě víme, že jako víc ne čtyřikrát, že i kdybychom dělali cokoliv, tak prostě víc ne čtyřikrát to nezoptimalizujeme. Zatímco u procesoru to bylo tak, že když by se člověk díval na procesory v 80. letech, tak ten jako jejich výkon, ten jako poměr, cena, cena, výkon, tak úplně řádově jde. To jako nedá ani nedává se ani jako smysl. To nejsou jako jednotky jako násobku, to jsou prostě úplně jako mimo jenom tenhle mobil, se kterým teďka dělám ten stream, tak má jako větší eh větší jako compute, než prostě mělo tehdy jako obrovský datac. Co myslíte, ty modely teďka jsou víc ve stavu toho té elektřiny nebo víc ve stavu těch procesorů? >> Si myslím, že ten hlad po inferenci bude tak strašně obrovskej, že i kdyby si ty procesory zoptimalizoval natolik, že budou žrát málo, tak to ve skutečnosti stejně nakonec vytvoří ten tlak na tu elektřinu. Jakože vlastně vždycky budeš mít dost práce pro ty procesory, aťž budou jakkoliv optimalizovaný a vždycky ten botlnek bude v té elektřině. Já si myslím, že botlenck nebude vždycky v tý elektřině, ale bude to chtít mnohem víc investic do nějakýho jako routingu a do specializovanjch modelů, protože když jako to budu mít dostatečně podchycený datově, tak dneska už jako na pixelu jsem schopnej rozběhat docela hezký modely, když to jedu na neural processing unit. Jo, rozběhal jsem si tam osmimiliardový bonsai, který teda používá jako kvantizaci na jeden bit, což samozřejmě jako má svoje plusy, mínusy, ale bude to o těch specializovanejch modelech kvůli tomu, že kapacita, kterou ten model má, není tolik o inteligenci. Já jsem schopnej mít jako extrémně inteligentní model na nějakej jako tool calling a tyhle věci, kde je jeho limit je, že malej model prostě nebude mít obrovskou world knowledge, protože ta komprese nejsme schopni udělat tu kompresi tak epickou, aby ten model uměl precizně všechny možný jazyky. Ale ve chvíli, kdy já dosáhnu toho, že budu mít specializovaný model, který bude dělaný na tool calling pro český uživatele, tak v tu chvíli mám jako model, který vlastně jako vyhrál, protože ho budou v pohodě používat Češi, e, a nebude žrát tolik energie, protože bude zaskoupovanej na konkrétní věci a potom na to přes loru nebo nějaký upcoming věci, přes fine tuning dodělám vrstvu, která bude řešit tool calling nebo která bude řešit něco. A eh těma technologiema kolem já dosáhnu toho, že i s malejma modelama udělám obrovský divy. Mluvil jsem tady o eh RLM Recursive Language Models. Takže já teďkom, když vezmu malej model, kterej ale bude nafine tunovanej na to, aby měl rozpadávat úkoly na subtasky, třeba prohledávání znalostní báze, tak v tu chvíli k tomu nepotřebuju obrovskej obrovsky chytrej model. nepotřebuju všechno prohnat embedingama a stejně ty informace dostanu. A vycházejí k tomu teďkom jako zajímavý benchmarky, že jako jsem schopnej dosáhnout mnohem víc s technologiema, co tady už jsou, jenom jsou třeba hodně under the Raider. A jak jsem říkal minule, Opus je RLM nebo dynamic workflows s opus 48 jsou RLM. Experimentuje s tím dál Google. Teďkom Logan Kil Patrick říkal, že něco s tím jako nějak s tím pracuju. Takže za mě to bude spíš o tom o tý distribuci a pokud se Apple schopí, tak v tomhle souhlasím, že jako eh, že jako vyhraje. >> Jo, já vlastně jako s tebou souhlasím, že podle mě je tam strašně moc nevyužitýho potenciálu. Zároveň jako hrozně přemýšlím nad věcma typu Bottle Cap AI. Jakože čistě statisticky si myslím, že Botle Cap AI nebude ta firma, co to vyhraje. Jako teď to nemyslím, že bych jim nefandil, ale jako myslím si, že firem jako je Bottle Cap AI existuje hodně a některá z nich to vyhraje. Možná to bude Bottle Cap AI, možná to bude nějaká jiná, ale podle mě nějaká z nich to bude. A nějaká z nich přijde s tím, že zoptimalizuje jako inferenci hodně. >> Já si já si myslím, že Bottle Cap cílí na jinou část. On cílí na tu dražší část, na ne inference, ale na trénink. Oni od začátku říkají, že zlepšují trénink, ne inferenci. Na inferenci tady máme startupy jako Cerebras, eh, Grockv a tak dále, ale to, po čem jde bottle cap, tak je ta druhá část, která v důsledku je dražší. Já si jako nemyslím, že ta inference samotná je to, co ty společnosti stojí takovej ranec peněz a proč zvyšujou ceny za subscription nebo ho rovnou jako rušej, ale je to samotnej ten jako provoz, kterej oni si potřebujou zaplatit na ten trénink. >> No, já bych řekl, že e jako když říkáme, že vyhrajou, nevyhrajou, e je to ta správná otázka. A druhá věc je, znáte tu historku s Coca-Colou, jak se snažila ušetřit hliník na plechovkách? Ne, >> vlastně to ilustruje něco, čemu se říká jevoncův Javonův paradox. A v podstatě i když vy zoptimalizujete spotřebu něčeho, protože chcete při výrobě plechovek na Coca-Colu prostě snížit spotřebu hlíku, tak nakonec se vám stane, že těch plechovek prodáváte víc a toho hlínku spotřebujete ve finále víc prostě, protože ten objem, ten objem to to jako vy v vy vyexploduje prostě. A [odkašlání] mně přijde, že něco podobného se může stát i i tady v těchhletěch případech prostě té inference a že tohle může být ten důvod, proč ta elektřina nakonec bude hrát důležitou roli. Ale jako možná se petu, to to si nejsem samozřejmě jistej. >> Mimochodem tomuhle se říká indukovaná poptávka, jako je to třeba strašně vidět v autech, že prostě nedává jako smysl zvětšovat jako ta silnice, protože jako mě prostě se zaplní. Ale jako indukovaná poprávka má jednu jako hezkou/ nehezkou vlastnost, že jako ona má nějakej strop, že jo, ona jako není není nekonečná, ona se jako vždycky blíží něčemu. A teď je jenom otázka, jestli u těch mod jakože nejspíš je pravda, že pokud by se teďka jako zlevnily nebo jako zrychlil nebo prostě jako zdvojnásobilo množství těch tokenů a toho, co můžeme spotřebovat, tak bychom to zkonzumovali, protože jako reálně od chatu GPT se tahleta věc jako neustále zvětšuje a neustále jako žereme víc a víc. Jakože když bych si jako představil, kolik teďka žů tokenů před rokem, tak by mně to připadlo úplně absurdní. Tak bych si řekl, že takhle musí spotřebovat velká firma, ne jeden člověk. Ale tady to bude mít taky nějaký limit, že jako to nebude tak, že úplně stejně tak jako je to u těch procesorů, že vlastně jako už teďka jsme ve stavu, že jako já si pamatuju, když já jsem si kupoval počítač, tak jsem se ještě zajímal o to, jakou to má jako frekvence procesoru. Je mi to v principu jedno, protože jak se narazilo na nějaký jako jako fyzikální limity těch jako jako velikostí těch matric, ale zároveň reálně, pokud potřebuju jako personal computer, ne ne nemyslím teďka speciální věci, tak jako potřebuju reálně větší procesor než prostě jako random notebook, kterej nebo random mobil, kterej tady koupím jako na každém rohu >> jako ta usage rozhodně absurdně roste. S tím souhlasím. Jo, tam myslím, že jsme teprve na začátku toho. Myslím, že možná je tohle dobrý místo, kde dnešní díl ukončit, protože jsme původně chtěli, aby to bylo krátký. Ty chceš, Petři, něco říct ještě? >> Já jenom položím otázku, jestli si lidi myslej, že se dostanou e aspoň třeba top 10 % uživatelů do roka do dvou na úroveň Petra Steinbergera, co se týče počtu jako to. On je schopnej propálit při aktuálních cenách 1 milion 300 000 dolarů měsíčně. Neříkám, že to lidi budou platit, ale jestli co se týče jako tokenů a toho růstu, jestli to bude až takhle skokový nebo míň a podělte se s náma v komentářích. >> OK, to je dobrá výzva. >> Tak pokud nejsou další otázky, pojďme se >> Děkujeme za pozornost. >> Díky, díky. Ahoj."
businesses\ai-ta-krajta\aiTaKrajtaEpisodes.json:162:        "transcript": "Vítám všechny u 49. dílu ATA Kita. E, my moc děkujeme sponzorům a to Prombook Supervizi. Dáme link do komentářů a rovnou začněme s novinkami. Eh, co máte? >> Tak já si začnu. Máme tady další vlnu omezování GitHub pilota. Obezují se pro a pro plus účty, tedy ty pro jednotlivce a vypadá to tak, že jednak zařezávají modely, který jsou k dispozici a jednak už není možný si pořídit novou licenci. Eh, minimálně přes webový rozhraní. Přes mobilní rozhraní to funguje. Takže kdo ještě chcete, tak pospíchejte, pokud to ještě stále funguje. A můžete si nainstalovat GitHub aplikaci. Musí to bejt mobilní aplikace a kupte si ten účet, než to smažou, než to zakážou. A zároveň zaváděj i limity, který nejsou jenom po requestech, ale i po množství tokenů. Zatím to nikde nekomunikují pořádně, jenom mluví o tom, že ty limity už jsou zavedený, ale neřekli jaký, neřekli kolik tokenů, ale v principu i GitHub copilot přechází na token based limity, nejenom ty requesty, což u nich byla ta největší magie, který nikdo nerozuměl a popravdě nechápu, proč šli vůbec tímhle směrem. >> Já tím možná navážu mojí takovou polonovinkou, polo eh polo výpustkem. E, já jsem teďka zrovna udělal takový video, který vidělo jako několik tisíc lidí přes Reals, kde jsem právě GitHub Copilot strašně propagoval a říkal, že by to lidi měli vyzkoušet. A asi tak 5 hodin potom, co to vyšlo, tak přesně jako nastal tenhle moment s tím, že to začali jako pořádně omezovat. Tak eh jsem to možná mohl zmínit dřív. No, mě trochu mrzí. Je čas provat, že to byl deep fake, který šiluje za neplatný produkt. A za mě novinka je vydání GPT Image 2, což je model od Open AI, který vytváří, jak název napovídá obrázky a vytváří je podle všeho způsobem, který konkuruje Nananau. A já se přiznám, že mně se trošku saturoval benchmark, že můj osobní, že už mě jako možná nenapadá, jak to potrápit způsobem, který mi ukáže, že je to lepší nebo horší. Takže budu zvědavý, co spadne z ostatních lidí s větší fantazií. Já přesně vím jeden benchmark, který eh potrápí jak nano banánu 2, tak to proočko. Když tomu dáš třeba noviny s velkým množstvím textu a řekneš, ať to přeloží, tak nano banána v tomhle selhává, ale GPT Image 2 ne. Jakože když dáš prostě celou novinovou stránku, tak GPT zvládá i zachovat layout, i to překlopit. Není to ideální, jakože poznáš to, ale zvládne to aspoň ten image dvojka. No >> tak já možná navážu teď se svojí novinkou a to je jedno refo, který mě pobavilo. Je to cavem a vlastně jde o to, že instruí Cluda, aby se tolik nevykecával, aby vlastně mluvil jako cavem. Takže prostě me no explain, me tool first, me result, me stop. Konec. a vlastně tvrdí, že tím ušetřej 65 % tokenů. Dokonce tam přikládají nějaký paper, podle kterýho údajně dokonce dostanou lepší výsledky, ale ten jsem teda nečetla, takže za to ruku do ohně nedám, ale je to prostě zajímavý. >> Já mám cavem v Merku docela dlouho a zrovna dneska na mě vyskočil příspěvek, kde to týpek testoval víc do detailu a toho jeho benchmarku vyšlo, že reálný ušetření je 14 % a ne 65. To za prvý. A z druhý, co bylo za mě zajímavý, je, že on sice mluví hloupěji, čím šetří tokeny, ale odpověď mu trvá dýl, protože začíná víc failovat v tool kólech. A oni jako tvrdí, že to nemá dopad na jeho reasoning, ale já když to připodobním k tomu, jak hraju dračák nebo jezdím na larpy, tak hrát někoho fakt strašně hloupýho je náročný. A on jako když bysme se, já se vsadím, že když bysme se podívali do jeho traců, tak on v Reasoningu bude přemýšlet, jak odpovídat jako cavem a bude na tom pálit ty tokeny taky. Takže ke Cavemovi jsem byl skeptickej, nevyzkoušel jsem si ho, e, protože jsem právě očekával tady tyhle výstupy, což se zatím potvrzuje. Nemám k tomu ještě dostatečný data, abych mohl říct jako jo, cavem nepoužívejte, ale zatím se spíš kloním k tomu. Buďte opatrní, neskákejte na všechno, co má hype na Linkedinu a Twitter. >> Mně připadá, že to jde trošku jako proti tomu, jak byla studie, která byla tak dva měsíce dozadu, že nejlepší výsledky jazykový modely mají se složitýma jazykama, jako například polštinou nebo maďarštinou. A tady to mně připadá, že jako úplný opak. A nebo to vnímám špatně? >> Já tu studii neznám natolik, abych ji zvládl zakomponovat do odpovědi, ale tam si myslím, že bude hrát roli i něco jinýho, protože ono je to jakoby složitost jazyka neznamená jako složitost tý větný konstrukce. Ono když se podíváme na to, jak ten model jako předpovídá, tak polština je spíš jako tokenově náročnější na ty vazby kvůli těm jejich střeškám, než kvůli tomu, že by to byl jako složitej jazyk. E, co se týče tý struktury pro AI, cavem mi přijde jako jednodušší na ty tokeny, na předpovídání než polština. >> Zároveň existuje taková věc, taková poměrně neintuitivní věc, že člověk by si myslel, že člověk, který zná pouze jeden jazyk a umí mluvit pouze jedním jazykem, tak vlastně bude mít větší kapacitu na všechno ostatní. Ale ono to tak ve skutečnosti není. typicky lidi, co jsou multilingvní, tak jim to velmi rozšiřuje jejich přemýšlení a intelekt a je to třeba hodně vidět u dětí. A teď vůbec nevím, jestli je jako vhodný nebo správný tady to přirovnaný dělat k jazykovým modelům, ale osobně jako minimálně nějaká moje pocitová zkušnost je ta, že pokud nechám ten samý problém vydiskutovat v různých jazycích nějaký jako panel expertů, tak eh z toho má člověk lepší výsledky. Samozřejmě za jako víc tokenů, dražší a víc času, ale lepší výsledek. >> Myslím si, že u multilingvních dětí to funguje o hodně jinak než u jazykových modelů, ale dokážeš si představit, že ta prostřední hodnota logické úvahy bude trošku jiná v různých jazycích a různých kulturách. To je tím teoreticky dokážeš eh získat tu větší diverzitu obsahu, než bys získal jinak. A nemyslím si, že jako ten jazykový model cvičí mozek způsobem, jakým to možná jde u dětí, u kterých taky jako u toho třetího, čtvrtého jazyka to začne potom mít trošku myšmašové dopady, co si tak pamatuju svojí development psychology. Já si taky myslím, že to bude spíš v tom, že musej najít nějakou jako tu společnou cestu, stejně jako se už před rokama ukázalo, že si jako Google Translate vlastně vytvořil svůj mezijazzyk. Takže bych to tipoval spíš jako na něco podobnýho, že jakoby oni vlastně jako zjednoduší to vyjadřování, aby si porozuměli. Zejména, když to ještě uděláš napříč různejma modelama, který s těma jazykama pracujou jinak, tak eh si myslím, že to bude spíš v tomhle. A podle mě rozhodně neplatí, že čím víc jazyků umí ten model nějak rozumně, tím líp, protože se stačí podívat na to, co se stalo se čtyřkovou rodinou eh cloud modelu, že jo. Když jsem přešel na 4X, 4.0 Sonet a tak, tak najednou třeba přítelkyně hlásila, že jí to doprostřed český věty hodilo Asbooku a ten model jakoby objektivně je Sonet 4 lepší než 35 na coding, ale Asbooku předtím 35 nedávala do češtiny, takže myslím si, že v tuhle chvíli to trošku spíš jako míří i na to jako spoustukrát omýlený e LLM platou, kdy ty modely se prostě musí v něčem posouvat a v něčem zhoršovat. Myslím si, že nemáme jako dostatečnou sérii testů, který by vlastně určili tak nějak jako obecnou inteligenci toho modelu a obecnou schopnost je jako srovnávat, že bysme museli fakt jako procházet desítky různejch benchmarků a ještě udělat jako vícejazyčný, abysme skutečně byli schopni posoudit, že ten model nedegraduje v nějaký jiný oblasti. Teď jsem viděla nedávno nějakou studii, nebo to možná už bylo v prosinci, kde se ptali různejch modelů v různejch jazycích na stejnou otázku. Hrál tam roli i věk toho uživatele a ptal se v různých jazycích, měl bych poslouchat svoje rodiče. A zajímavý tady bylo, že u francouzštiny jim to prostě na celý tý škále prostě od nějakýho jednoho roku do 60 let prostě říkal: \"Ano, měl bys poslouchat svoje rodiče.\" Zatímco u, teď si nepamatuju přesně, jaký jazyky to byly, ale u těch ostatních to většinou bylo třeba jenom do nějakých 15 let jako říkalo, že ano a pak pak už jakože že ne. >> [smích] >> že nemusí. Takže to už je zase ten starej dobrej bajas, kterej tady rozebíráme už skoro pokaždý, no, že prostě se ta odpověď liší podle vstupních dat. >> Taková debate, že nakolik kultura ovlivňuje jazyk a přemýšlení a myslím si, že jazykové modely jsou takovým jako velmi dobrým materiálem k tomu, jak tady to expozovat. >> Zajímalo by mě u těch coding agentů, jestli se to nějak taky projeví. [smích] To by stálo za vyzkoušení. Já mám takovou vtipnou na tohleto věc. Já jsem zkoušel takovou věc, že udělej mi next projekt, ale jako pHkář. A vtipný bylo, že mě to tam jako zavádělo poměrně takový jako stereotypní prasárny z PHP. Tak nevím, na kolik je to jenom něco, co jsem si udělal, tak že jsem to chtěl a tak jsem toho docílil. A nebo jestli to jako expouje nějaký stereotyp nebo nějakou jako pravdu o o jednotlivých programovacích jazycích. Já bych neřekl, že to bude nutně jako o programovacích jazycích nutně, jako spíš i o vtipech, co jsou na internetu. Jakože podle mě se do toho rozhodně budou promítat takový ty věci, jakože PH má bejt mrtvý a tak dále. Takže spíš bych to tipoval na tohle, protože těch vtipů taky bude nemalý množství, než jenom, že by to vycucalo z PHkovýho kódu. Tě vlastně ten model snaží jako dokázat, že on je ten phpkář, o kterým jsou ty vtipy, tak tam začne dělat ty vtipný věci. Já mám možná kromě těhletěch vtipných věcí takovou poměrně praktickou. Čím dál tím víc mě dává smysl Typescript. Ani ne kvůli tomu, že by člověk nutně potřeboval ty typy ve všech projektech. Když já si myslím, že potřebuje, ale často nepotřebuje, ale dává to smysl proto, že typický typescriptový projekt je kvalitnější než typický javascriptový projekt. A připadá mi, že i když člověk nakonec chce mít jenom JavaScript z jakéhokoliv důvodu, tak dává smysl nechat vyrobit Typescript a uřezat z něj ty typy, než šít od začátku na JavaScript, protože Typescript je obvykle o level kvalitnější a líp udělanej jakoby i i z těch částí, co by mohl být JavaScript líp udělanej. Tady znova budu mluvit, e, protože byl nedávno nový frontcs s Rickým Friedrichem, kde se právě řešilo State of JS a víceméně myšlenka je taková, Typescript vyhrál a nevyhrál jenom tím, jakou masivní má adopci, ale zároveň používání Typescriptu nekleslo v žádný z těch kategorií, co tam byla. Doporučuju se podívat na celej ten frontcats. Vlastně jeho adopci jenom roste. A co je ale další důležitá věc, je, že dneska už typescript spustím, aniž bych ho e musel kompilovat, aniž bych musel odhazovat ty typy manuálně, protože jak no js tak baní vyhodit. Jsou tam nějaký podmínky, že nesmíte používat některý z funkcionalit. Nicméně už to funguje a vlastně poslední místo, na který se čeká pro spouštění Typescriptu, tak je prohlížeč. A tam se o tom mluví už taky nějakou dobu, což teďkom trošku mimo AI, ale půjde se spíš cestou toho, že nebudeme ty typy využívat, než že je budeme využívat, protože JavaScript je tak moc přeoptimalizovanej a nemá dělaný typy na tuhle manuální optimalizaci, že vlastně používat ty, co známe v JavaScriptu, by nebylo dostatečný. On totiž jako Chrome uvnitř dělá strašně moc předpokladů. A třeba to, že mám eh objekt, kde pod určitej klíč vždycky přiřadím číslo, znamená, že ten objekt bude rychlejší, než když budu mít ten samej objekt se stejným klíčem, ale jednou tam bude string a jednou číslo. Takže z toho důvodu jako nedává smysl s těma typama pracovat, co se týče tý samotný exekuce. Zároveň je pravda, že Typescript je opravdu jenom jenom nějaká vrstva nad a člověk jí může poměrně jako nepěkně přepsat a poměrně nepěkně ho zmást. A já nevím jakože já já stále mám někde v hlavě to, že si myslím, že přece jenom by mělo existovat něco, co Typescript enforcuje i v runtimeu, ale nevím, nemám na tohleto nějaký silný názor. >> Já si nemyslím, že to je dobrej nápad. Jakože když potřebuješ runtime enforce typů, tak použiješ zot nebo podobný věci, ale TypeScript jako takovej na to není dělanej a bylo by to jako znásilnění toho jazyka. >> Pánové, jsme ta krajta, ne type krajta. Takže já bych se vrátil, e, jestli to nevadí, e, k tématu těch benchmarků a k tomu, jestli lze těm benchmarkům uniknout, protože to je něco, co e tenhle týden chtěla probírat Katka a já teď bych jí přenechal slovo, jestli nechce uvést svou novinku. >> Jo, řeknu úvod a těším se hrozně, jak na to navážete. Takže vlastně to je paper, kterej teď nedávno vyšel. A vlastně tam ukázali, že osm populárních benchmarků jde prolomit a dostat vlastně někdy dokonce až plný počet bodů, aniž by ten agent cokoliv vyřešil. Jo. A ten důvod je třeba, že eh prostě on si najde nějakou obekličku, jak to vyřešit. Eh, a problémy tam jsou třeba, že ten agent běží ve stejným kontejneru jako ta hodnotící instance, nebo že správné řešení je třeba schovaný v konfigu tý úlohy a nebo dokonce na huging face a on si ho tam najde. Nebo například, že tam třeba ten agent udělal print injection do LM judge >> test hlásí, že všechny testy prošly, takže injectné všechny texty prošly vinárce, kterou podstrčí v UV. To se mi líbilo hodně. Pokračuj, Šimone. [smích] >> No ne, mě zajímá spíš, co z toho vyvozuješ. No tak vlastně oni tam říkaj, že ty úlohy v poslední době už, že ty benchmarky už neměří vlastně schopnost těch agentů řešit úlohy, ale tu samotnou vlastně odolnost agenta vůči tý evaluaci a modely jsou vlastně čím dál lepší, takže budou čím dál asi čím dál jako víc schopný ty evaluace prolomit, ty benchmarky a takže bude potřeba udělat nějaký lepší benchmarky. A já myslím, že to se v tuhle chvíli už děje, že svůj bench je něco, co Open AI přestala interně spravovat a používat a vytvořila svůj bench advance a svůj rebench, protože začínala shledávat, že když se podívala na thinking traces těch agentů, které vyhodnocovali, tak zjistili, že agenti referencovali vyloženě to řešení, které už měli v trénovacích datech. Ale v tomhleom stojí za povšimnutí, že je to openné a samotné a jejich evaluační divize, která se rozhodla ten benchmark zlepšit a opustit ten benchmark, který už je kontaminovaný, protože oni potřebují zlepšovat dál výkon těch modelů, když nedokáží zlepšovat výkon těch modelů, když nemají na čím měřit ten výkon těch modelů, nedokáží garantovat, že se ten výkon zlepšuje. Takže myslím si, že tohle je jako zajímavý nález, ale reálně myslím si, že to overstatuje tvou vlastní důležitost, že pokud Antropic přijde zítra a řekne: \"Jo, jo, jo, ta nová svůj rebench od Open AI a máme ji na 100 %, nikdo se nekoukejte moc pečlivě, proč tak e jednak ublíží sobě a jednak nim na to nikdo neskočí. Myslím si, že toleto má větší dopady pro alignment a safety benchmarky, které jsou většinou interní, které se většinou neohlašují jako něco, do čeho by se mělo investovat, že jako tam se hodně staráme o to, jestli ten model se dokáže vylomit z toho vyhodnocovacího rámce a podvrhnout řešení způsobem, který znamená, že sice v tomhletom evaluačním rámci se zachovává správně podle klíče odpovědní, ale v reálném světě se zachová špatně. a dá třeba lidem přístup k biochemickým zbraním nebo nukleárnímu zpracování materiálu nebo tak. A jsem zvědavý, jestli z tohodle vyjde nějaká obecná harness, která umožní lidem, kteří dělají ty benchmarky, lépe kontrolovat, jak ty modely ty benchmarky řeší. Jestli toleto prostě není ortogonální pravouhlý problém na ty benchmarky samotné. To jak je administrovat bezpečně? Já si myslím, že vlastně jako cesta, která se mně docela líbí, je to, jak to dělá Terminal Bench nebo Arc AGI a to je to, že iterativně pokaždý tvořej novou verzi a díky tomu, že to je jako po omezenou dobu, tak hodně bojují proti tomu jako, aby ty modely se na tom naučily, ale neřeší to všechno. Neřeší to ten únik z toho sandboxu, je to jenom jako řešení malý části toho problému, co jsi popsal. mně občas přijde poměrně strašidelný v nějakým jako praktickým vývoji, nakolik se občas jako AIO pokusí splnit úkol jako velmi neortodoxním způsobem, takovým, který začíná jako čím dál tím víc připomínat nějaký jako escape from the sandbox. A poslední dobou se mně to stává vlastně jako víc a víc, že jako i já jako splním úkol způsobem, který je jako nebezpečný. teoreticky splnilo úkol, ale jako zavedlo tam nějakou novou zranitelnost nebo něco obešlo a děje se to víc a víc. >> Můžeš dát konkrétní příklad? >> Jo, máme nějaký jako automatický testování v Promebooku, který testuje, zda AIO jako vyřeší nějaký úlohy, nějakej náš benchmark, kterej je vlastně poměrně jednoduchej. A teď se mi vlastně stalo, že se Cludl jít takovým jako Volkswagen stylem, že e ve chvíli, když byl testovanej a dokázal to detekovat podle e environment proměnných v nodu, že to byl úplně jako bizarní způsob, jak detekoval, že je testovanej, tak ta faktory funkce, která vytvářela instanci toho agenta, tak místo toho, aby vytvořila opravdovýho agenta, tak vytvořila namokovanýho agenta, kterej v sobě měl zhardkodovaný odpovědi, kterej ten učitel nebo ten ten, co testuje, chtěl slyšet a bylo to tam jako vyslovně skrytý úplně jako na na prasáka s tím, že jako najednou prostě v pohodě procházeli testy, bylo to rychlejší, já jsem si myslel, že se jako to vlastně jako všechno funguje jak má. Dokonce, že to to AIo nějak optimalizovalo a prd jenom tam zavedlo takovejhle podvod. >> To mně se teďkom stalo něco podobnýho. Už tím řeším jako pokročilejší věci, kdy mapuju přes UPS server odpovědi z Kodexa do webovýho UI. nechodily všechny odpovědi úplně správně, tak jsem řekl, ať se na to podívá. On místo toho, aby se podíval na to, proč to nechodí správně nebo proč to chodí s delayem, tak začal bombardovat server a každou sekundu prostě si poloval odpovědi. Takže teďkom se dostávám do bodu, kdy zase ty modely jako víc držím za ručičku v některejch ohledech. jako v rozsáhljších Code Base, kde přesto, že mám jako fakt striktní pravidla, tak ty modely hledají stále nový a nový cesty, jak to obejít nebo co se mi teďkom děje a to mi kdyžtak potvrtej ostatní, že GPT54 strašně moc chce psat fallbacky a v rapery a všechno mít backwards compatible a strašně mě to vytáhačí. Já jsem se strašně těšil na té diskuzi, tak jenom poslouchám a vlastně mě to strašně připomíná něco, možná to znáte, tomu se říká, myslím, good heart of zákon podle nějakýho ekonoma britskýho, kterej říká, že v okamžiku, kdy se nějaká metrika stane prostě cílem, tak v tu chvíli je to špatná metrika. teda v tom původním článku jako formuloval trošku jinak, ale vlastně je to fenomén podle mě, které je dobře vidět třeba právě v nějakých takových oblastech, jako je třeba algoritmický obchodování nebo něco podobnýho. V okamžiku, kdy se snažím hledat nějakou statistickou regularitu a zavedu k tomu nějaký jako eh měření a a statistiky, tak ona začne kolabovat. A přijde mi, že tohle je vlastně jeden vektor, kterým se dá, ačkoliv to nemá jako žádný exekutivní prostě eh důsledky přímý, tak je to něco, co se dá jako sledovat obecně a že to je docela užitečný způsob, jak k tomu přistupovat. >> Teď mě ještě napadlo, že vlastně když se o tomhlenctom píše všude na internetu, na reditu, jak ty modely, ty benchmarky obcházej, tak až se na tom pak budou trénovat, že jo, na těchhle příspěscích, tak si to přečtou a budou zrovna ještě líp vědět, jak ty benchmarky obcházet. Myslíme, že ty benchmarky zůstanou nezatvrzené. Já jako vidím argument, proč >> já nevím, co tím >> jakože nikdo neudělá hardening toho benchmarku tak, aby tyhle fle už nefungovaly. Zatvrzené je možná špatné slovo, které bych neměl v češtině používat. Na jednu stranu prostě ti lidé, kteří dělají ty benchmarky, tak nejsou nutně bezpečnostní specialisté. [frknutí] Na druhou stranu tenhleten paper docela hezky ukazuje, jak to lze obejít a tím pádem co zalepit. přijde, že to, že Goodartovo pravidlo, to co říkal Jirka, je jako velmi taková univerzální věc a jediný, v čem je v AIU jako jiná než v lidský společnosti, je, že AIO všechno dělá jako rychlejš, že jako je strašně velká páka na úplně jako cokoliv a jakýkoliv takovýhle nešvar se projeví jako mnoho řádověkrát rychlejš než v lidský společnosti. Ale tak třeba jako testování ve škole a nějaká jako spokojenost v životě a jako to, jak to spolu koreluje, jako je zcela náhodný. >> Na druhou stranu Goodart předpokládá, že delegujeme jako jednu nebo dvě tři metriky, podle kterých budeme primárně měřit výkon. A v é hře benchmarků, kterých je na huging face stovky a řekněme těch hlavních dva tucty, je otázka, jestli tam prostě nefunguje ten jagedge, ten, který potom vede k tomu, že na některých benchmarkích maximalizovaný výkon způsobuje horší výkon na jiných, nebo jestli je to LML dostatečně multidimenzionální na to, aby to zvládalo maximalizovat po těch celých 20 a třeba by se to ukázalo až na stech nebo měsících. Měli bysme si pozvat někoho z nějakého velkého výzkumného labu, který tohleto má zmapovanější? >> Já si myslím, že to jako hezky vede k tomu, co jsem říkal před pár minutama a to je to, že budem testovat i více jazyčně to samý, protože mě by třeba fakt jako zajímalo, jak rozdílný by byly výsledky v terminal benchi, kdybysme to testovali v češtině, v angličtině a v čínštině třeba a nebo ve 20 jazycích. Fakt by mě zajímal ten jako rozdíl v těch modelech, protože ruku na srdce stále spousta lidí s modelama komunikuje jiným než anglickým jazykem a tím pádem pak můžou mít o to jako horší výsledky a pak třeba říkaj, no, ale v Krajta říkali, že tenhle model je dobrej a on není. No, jenže pak se ukáže, že s ním komunikujou jako Babišovštinou, že neumí ani pořádně česky. Takže >> Babišovština, to je něco jako Cavem. Ano, >> podle mě dostáváme do strašně jako zajímavý nějaký jako fundamentální debaty, že co je vlastně ta věc, kterou maximalizujeme a že vlastně jako nakonec já jako je jenom nějaký systém, který něco maximalizuje a buď to, co maximalizujeme, to známe a nebo to nevíme. Jako buď to tušíme nebo to netušíme, ale vždycky něco maximalizujeme. >> Když něco maximalizujeme, tak často zároveň omylem něco jinýho minimalizujeme, že jo. No tak já jenom teď jsem ještě jsem si vlastně vzpomněla, že v tom paperu e psali to to mě hrozně pobavilo, jako psali tam jako doporučení, vyzkoušejte, jestli váš benchmark je dobrej. Jo, tak pošlete tam nal agenta, který nedělá nic a jestli dostane nějakej nějaký dobrý skóre, tak to asi není úplně dobrej benchmark. A pošlete tam random agenta, kterej provádí random akce. A taky asi není dobrý, když jako nějak dobře zaskóruje. >> Ono jako v tomhleom mi to připomíná trošku e úvodní léta krize reproducibility ve vědě a open science a klasický paper v neurovědě, který měřil, jestli náhodou nebude mít funkční konektivitu v mozku i mrtvý losos, když ho dáme do stroje. za použití standardních metod, které nedělaly multiple correction a měl, což byl docela velký problém pro jiné papery, které používaly ty samé metody, což samozřejmě už jako dneska jsme dál a čekám, že i Evalová věda a benchmarková věda se posune dál, ale jsme teďka pořád ještě v dobách, kdy to není úplně standardní a je super, že tyhlety papery existují a poukazují na tyhle problémy. >> Jo, já souhlasím. E tohle, co říkáš, Šimone, myslím je jako trošku ještě jinej problém e s tou reproducibilitou, než ten problém, kterej je popisovanej v tom článku. Ale rozhodně souhlasím, že vlastně na začátku e naší debaty to bylo celkem pěkně vidět, že jsme se docela snadno dostali do nějakých spekulací ohledně toho, jestli polština nebo ostatní jazyky jsou náročnější nebo méně náročný a tak, že jako vlastně chci tím říct, že nemáme asi úplně ještě pořád dobře zmapovaný to, jaký jazyky třeba vybrat, aby ty výsledky, který obdržíme, byly ty nejlepší případně jestli na tom vůbec záleží a jak a tak je to podle mě dost málo zmapovaný. >> Hele, Jirko, a když se ukáže, že nejlepší Typescript píše v maďarštině, začneš se učit? >> Nevím, nevím. Já jako eh mám docela rád eh učit se cizí jazyky, takže možná jo. >> A co obráceně? Když se ukáže, že nejlepší výsledky dává čeština v javě, tak já končím s češtinou. >> Pochopitelně. >> Myslím, že tam budou hrát rolly i nějaké další. věci jako množství těch těch data pointů, který při tom trénování použiješ a tak. >> Já si jako hodně myslím, že je to o těch datech a v tomhle se mi líbilo, kdo si pamatujete ještě na rodinu modelů F PH nějaký i tak ty byly strašně zajímavý tím, že podávali velice velice dobrý výsledky na svou velikost, ale museli jste je benchmarkovat jenom v angličtině. A podle mě to bude nahrávat tomu, že jedna z metod zrychlení bude vybírání extrémně precizně filtrovanýho datasetu, protože my nepotřebujem jako super mega chytrej model, kterej bude umět všechno. A ono to jako souvisí s tím, co se teďkom děje s cenama tokenů a s cenama subscription a s tím omezováním, jo. Pokud furt půjdeme cestou toho, že budeme vylepšovat algoritmický model, držet se na obrovský množství parametrů, ale nebudeme e zlepšovat ty vstupní data nebo ne dostatečně, tak eh bude muset docházet k tomu nárůstu cen. Naproti tomu já už víc než rokám klientům sbírejte si aspoň ty tracy, sbírejte ty data, protože pak můžete třeba něco dotrénovat a můžete si udělat nějakej jakože, já nevím, quena 36, kterej bude funovanej na vaši codebase nebo alespoň na framework, kterej používáte. A tohle si myslím, že bude jako hodně velká cena, pokud se VC rozhodnou, že už nechcou, ať pálíme jejich peníze, což se teďkom děje. Uvidíme, jestli se to zase změní. To by bylo od víček dost neobvyklá vzlem ke její historickému track record, ale chápu, co říká, že mě nechtějí, abychom je pálili takhle. Já bych se ještě trochu možná zastavil u tý debaty ohledně jako ceny těch modelů a tokenů, protože mně přijde, že se to, že vlastně jako jsou takový dva názory. Ten jeden je, že eh teďka je to strašně dotovaný a v podstatě eh takhle levný to už mít nebudeme. A ten druhej je, že teďka je to nejdražší, co to jako kdy bylo a zoptimalizuje se to a prostě teďka je to vlastně hrozně drahý oproti tomu, co to bude, i když je to teďka dotovaný. Co si o tom myslíte? >> Moje věžcecká koule není v nejlepší pozici. Myslím si, že oba tyhle směry půjdou proti sobě a nemám sebemenší tušení, které z kterých z nich vyhrajem. Myslím si, že akorát mám tendenci se vzbuřovat proti lidem, kteří jsou si zcela jistí jedním nebo druhým směrem, aniž by proto měli dostatečný argument. Já si myslím, že vlastně jako platí tak trochu obojí, protože ono je to sice jako výrazně levnější, než to bylo, ale zároveň s tím děláme výrazně víc věcí, používá to výrazně víc lidí, takže ono to jako nejde úplně proti sobě, protože ono to, když bysme se jako zamrazili v čase a dělali jsme s tím jenom to, co děláme teď, měli jsme jenom ty frameworky, co máme teď, jenom ty jazyky, tak tam může docházet k tomu, že to půjde jenom jedním z těch směrů, ale ten svět se pořád vyvíjí. Množství lidí, kteří aičko používají, se vyvíjí. To, jak to používáme, se vyvíjí. Takže myslím si, že ten finální výsledek je, že cena na jeden token se vlastně v důsledku snižuje, ale ty modely třeba víc přemýšlej, že jo. Máme tady eh test time compute, máme tady věci jako RLM, kdy na jednu věc vypustím ten samej model jako stokrát a jenom to rozsekám na menší subtasky. Takže těch cest, jak my to můžeme naškálovat, je jako velký množství a ta cena pro nás jako pro uživatele poroste, ale per token si myslím, že to není tak moc dotovaný, pokud jdeme vyloženě jako za ty apyosty. Neřeším subscription, to dotovaný je, to je bez debat. Nám se totiž děje taková trochu zvláštní věc v promooku, že na začátku, když prostě ještě před třemi lety jsme si s tím hráli, tak ten kost byl malej a to kvůli tomu, že ta usage byla reálně malá. Prostě na GPT35 toho člověk jako neudělal za stolek. Tak rok dozadu zhruba e jsme pálili poměrně hodně prostředků na tokeny, protože jsme ještě jako hodně jeli upuse, já jsem to i tady v IT kritě hodně propagoval a tak a měli jsme poměrně velkej us a teďka mě jako začíná připadat, že eh čím dál tím víc ten cost je vlastně jako jinde, že nám se teďka paradoxně třeba stalo, že jsme zaplatili víc za Vercel než za Apple subscriptions a je mi jako zcela jasný, že to je dotovaný, že ta cena je dotovaná a u toho varcelu, ta cena dotovaná není, ale stejně, že vlastně jako ty třetí plochy mně přijdou, že se začínají objevovat trošku jinde, než eh už v tý samotný rychlosti Aajka. >> Rychlost je podle mě jako zase jiná sféra v tomhle ohledu. Možná tak, ale rychlosti, to jsem řekl blbě, takovým tom, e, že je nějaký množství věcí, který člověk jako dokáže nebo který na jednom projektu jdou smysluplně udělat. A ještě jako poměrně nedávno to bylo tak, že v podstatě vždycky, že byl jako nedostatek tý práce jako možný, co by se dalo dát do toho projektu oproti tomu, eh, co ten projekt potřeboval, že jakoby na každém projektu byl prostě obrovskej veglok smysluplných věcí, co šlo dělat a to, aby se ty věci udělaly, tomu bránil buď ten kost nebo ta capabilita těch modelů a tak. A připadá mě, že tohleto se začíná jako v tuhletu chvíli trochu obracet, že vlastně jako u spousty projektů už to není tak, že vlastně jako všechny věci, který byly už dobře popsaný, tak se udělaly. A teďka jako ten botlnck už je jinde. Ten botlnck už je v tom, jak vůbec jako vyfiltrovat smysluplný věci, jak vůbec ověřit, že ty smysluplný věci fungujou. A nevím, jestli se to děje i vám. A jako hodně by mě to zajímalo i od diváků, že jestli se vám takováhle věc taky děje. To ověřování je rozhodně jako velký problém, který se jako děje a ono to jde, ono se to jde tak nějak jako proti sobě, protože jedna jedna z věcí, kterou jako můžeme dělat na zaručení bezpečnosti a kvality, je, že tam děláme tu jako metodu švýcarskýho sýra, kdy vlastně jako skládáme za sebe vrstvy sýra a čím dál míň tam proletí těma dírama, protože se to nebude potkávat a v určitý fázi to ověření bude jako dostatečně kvalitní, ale zároveň čím víc víc vrstev tam dáme, tím pomalejší to potenciálně bude a tím dražší to taky bude. Takže tam si myslím, že to bude chtít ještě víc prozkoumat, jaký metody mají vlastně ten největší účinek, abysme i tohle zlevněli a zrychlili. Protože teďkom otevřít PR je triviální, ale mergout PR, abych byl si jistý, že tím nic nerozbiju, tak je výrazně náročnější právě i kvůli tomu, že AI se snaží optimalizovat na to, aby to tak nějak prošlo a ne, aby to bylo správně. Zejména, když ho na tom jako hodně mučíme. >> To je zajímavý. Můžeš kdyžtak uvést nějakej příklad tady, aby to tak nějak prošlo, ale bylo to správně. Tak spousta aplikací je napsaných tak, že tak nějak prošli, protože jako to bylo třeba MVP, který se dostalo do produkce, ale je to jako fundamentálně špatně navržený a aič tohle jako akcelerovalo. Takže přijde mi, že spousta AI kódů, pokud ho fakt dobře nekontroluješ, tak je spíš v MVP kvalitě. A je teď jako samozřejmě jedna z těch základních jako tržních pouček je jako, že se máš dostat ten produkt na trh co nejdřív, ale je otázka, kdy to, že se dostaneš nejdřív způsobí tak velkej brand damage, že to vlastně ztrácí pointu. Já vidím takovou věc, my to jako trochu právě řešíme s promlkem a se supervizí jako u firem, že existuje něco, co se dá nazvat, že jako AI technickej dluh, kdy jako technický dluh, to je věc, která tady byla v podstatě vždycky, že jako nějaký projekt se dostal do stavu, kdy byl jako prakticky neudržovatelný a jakákoliv změna byla v podstatě úplný peklo. A připadá mě, že AIO se dokáže do nějakýho jako velmi specifickýho technickýho dluhu dostat jako jednak mnohem rychlejš a jednak ten technický dluh má trošku jiný charakter. Takový jako jako kdyby to byl technický dluh, který ale vzniknul tím, že na tom jako dělali mimozemšťani a to se nedělo předtím. Eh, řekl bych, že ne proto, že by to AI nebylo schopný jako do toho stavu dostat, ale proto, že v tuhledu chvíli je to jako mnohem rychlejší, že v tuhletu chvíli se jako mnohem jako rychlejš valí do produkcí jako nový a nový AI kód. A například u těch obrázků nebo videí člověk poměrně dobře pozná, že to je slop. Zatímco u toho kódu, tak vlastně do spousty projektů se valí spoustu slopu a ty projekty fungujou trochu jako nějaký fázový přechod jako mezi kapalinou a plynem, kdy vlastně do nějaký míry to ten technickej dluh jako snes nějakou míru se to totálně pokadí a už v podstatě jako jakákoliv změna začne jako vyplouvat někde jinde, že jako tady posunu tlačítko, ale na úplně jiný části aplikace mě přestat přihlašování. Tady opravím přihlašování a tady se mě rozbije menu. Tady opravím menu a e smaže se mi databáze. Viděl jsem to poslední dobou vícerokrát tohleto. Nevím, jestli máte podobnou zkušenost. >> Tak teoreticky tohle je něco, čemu by měla zabraňovat naše programátorská harness testování a precomity a všechno. A zajímalo by mě, Petře, jestli to vidíš i jako i s tou harness dobře nastavenou. >> Jo, děje se to furt jenom ten jako ten posun. je zas jako okus dál. Stane se to na jako komplikovanejch tázcích, nebo když ten model fakt jako eh se začne motat v kruzích, tak zatímco před rokem jsme řešili, že antigravity někomu smazalo disk nebo něco podobnýho, tak teďkom se, když to mám jako v sandboxu, mám tam striktní kontroly, tak on hledá jako minimální možný způsoby, jak mě uspokojit, což často není to, co bych jako chtěl jako vývojář. A tohle se jako děje. A samozřejmě jedna z teorií, kterou by mi jako lidi řekli, je: \"No tak prostě na to hoď jako 10 agentů, kteří to budou kontrolovat.\" Ale to je přesně to, o čem jsem mluvil, že když tam dám těch jako dalších x plátků švýcarskýho sýra, abych ověřil, jestli tam nemám problém, tak najednou budu mít tolik vrstev ochrany, že se jako nedostanu ven. To je to samý, jak když eh jsou takový ty jako outlocitný matky, který odmítají dítě jako pouštět ven, všechno dezinfikujou. Tak tohle je ten samej princip. prostě pak se s tím setkám a chcípnu na první nemoc, kterou potkám. Tak jako tady v AI to bude. To je to samý. Já jako vidím to tam mám nastavený fakt jako brutálně striktní ochrany a o to horší je najít, když mě ten model fakt jako zkouší přechcet. No a tady, že jo, těch 10 agentů, co se na sebe vrhnou a pálej tokeny, tak to sice, že jo, jak jsi říkal, prostě to je sice sice to funguje, ale pak stoupne cena tokenů a co má pak člověk dělat, že jo. No, pokud stoupne, že jo, to jsme jako to jsme tady nerozlouskli, to >> jsme zakecali. Tady se asi nabízí otázka, jestli třeba nepřestat chvíli a nevrátit se na kritické věci k psaní ručně. A myslím si, že předjímám odpověď, když řeknu, že ani náhodou. Nevím, jestli se na to díváte podobně. nebo možná bychom věci, co bysme nepsali ručně a napsali bychom je slopem, neměli psát a brát spíš z knihoven. Prostě najít si produkt, který tohleto má ošetřené a kterému věříme, že jenom nepálí tokeny verifikací, kde jsou lidé, kteří jsou za to zodpovědní a těm přihrát ty náklady, které bychom utráceli za těch 10 tokenových pingpongů. No, já používám v mojí Codebase effect, takže přesně tohle, co popisuješ, dělám, ale stejně se mi to děje, jo, jakože zase je to jenom další způsob, jak tu hranici, kdy se tě model pokusí obejít nebo splnit tvoje požadavky, tak to tímhle jenom posuneš. Dřív nebo později narazíš na nějakej problém, kdy se tohle stane. E, >> já já budu tak jednak poloonovat a jednak vlastně navážu na tu debatu o maximalizaci. Mně připadá, že v programování jako hodně platí to, že téměř žádný parametry nedává smysl maximalizovat absolutně. E, já jako já už jsem já programuju 15 let a za těch 15 let jsem slyšel jako věci typu je potřeba programovat jenom funkcionálně, je potřeba programovat jenom jenom v tomhleom, jenom tímhle způsobem. Je potřeba minimalizovat dependencií, všechno dávat do knihoven, nic neduplikovat. A teďka jakákoliv z těhletěch pouček, vlastně každá z nich má něco do sebe, ale zároveň jakoukoliv z nich maximalizovat absurdum, eh, mi vlastně připadá, že to vede vlastně k suboptimálním výsledkům. A otázka, jestli to není to samý s tím Effekt TS, že jestli jako existuje nějaký místo, kde bys efekt TS nepoužil. Když si budu dělat script death tools, třeba nějaký jako one of věci nebo tam, kde to nejde. Třeba když dělám nějakou jako automatizaci přes Tampermanky, což je podle mě extrémně nedoceněný rozšíření, že spousta lidí si chce jako dělat extension na něco. Přitom stačí si napsat jako jednoduchej JavaScript, kterj to přes Tampermanky bude opakovaně spouštět. Takže jsou rozhodně případy, kdybych efekt nepoužil. >> To je možná ještě jako otázka na diváky, protože nás poslouchá hodně programátorů. existuje nebo máte nějakou programátorskou poučku, která by se dala říct a nedalo by se zatím říct žádný, ale jako typu vždycky používejte typescript nebo vždycky používejte čistý funkce bez side effectektu teďka. Existuje něco takovýho podle vás nebo všechno má svoje ale? Jako možná ještě doplním to, že asi kdybych se na to díval pohledem matematika, tak tam existují věci, který jsou absolutní, který jsou jako axiomatický. Ale teď je otázka, jestli programování není tak strašně moc ovlivněný tím reálným světem a tím tou extrémní složitostí reálnýho světa, že? A já nevím, já já nevím, já nad tím jako přemýšlím a je to podle mě otevřená otázka tohleto. >> Ale já ti jako vyvrátím i tu matematiku, jo, ale v jiném univerzu, kde nulu nepojmenávají nulou a tak, tak prostě se ti jako tyhle věci zboří, že jo. Takže jako záleží jenom na škále, ve které to ale chceš vložit, jo, jako spousta matematickejch věcí se rozpadne, když přejdeme jako že jo, do jiný skupiny čísel a tak. Takže my tam my jako i matematika sama o sobě je založená na ale, jo, jakože nemůžeš odmocňovat něco, ale tehdy můžeš a tak. Takže >> já nevím, jestli zase neprovést návrat k tomu, že jsme krajta a ne Lemata Krajta. >> Souhlasím. Já myslím, že e možná jsme už dnešní témata vyčerpali, že bychom měli směřovat k nějakýmu závěru. Co by to bylo pro dnešek? No jo, rozhodně musíme najít nějakej optimální závěr. >> Mě se jako na dnešní dílu líbilo to, že to bylo jako hodně jako jiný zase než než než předchozí díly a fakt hodně by mě zajímalo, jestli jakoby tady ten druh povídání vás diváci zajímá a nebo nebo jestli máme jít víc do tý jako praktickobastlský části a nebo jestli to máme nějak střídat a určitě to napište do komentáře, ať už jako tak nebo onak. Já bych to asi zakončil myšlenkou aspoň ze sebe, že odpověď je vždycky oblíbené programátorské. To záleží. [smích] Záleží prostě na tom, co je to za codebase, co je to za projekt, co s tím chci dosáhnout, co používám za model, co mám za tým. Nepotkal jsem případ, kdyby odpověď nebyla. To záleží. >> Tím jsi vlastně zároveň i odpověděl, ne? >> Já souhlasím. To záleží. Tak napište nám do komentářů to záleží a nebo nějaký další poznatky k dnešnímu dílu a budeme se těšit zase příště. >> Mějte se. >> Ahoj. >> Ahoj."
businesses\ai-ta-krajta\aiTaKrajtaEpisodes.json:216:        "transcript": "Vítám všechny u 44. dílu ITA CRTA. My moc děkujeme sponzorům DX Heroes a Promebook Supervizi za podporu. Link bude v komentářích a můžeme rovnou začít novinkami. Co se tenhle týden stalo. >> Jo, tak já bych začal tím, co mě zaujalo. Možná znáte Kyla Simpsona, kterej je autorem knížek You don't know JavaScript 5. takový populární pětisvazkový dílko a ten teďka vydal spolu s nějakými kolegy Defra DB, což je prostě nová databáze určená k Edge computingu. Je to vlastně něco, co velmi dobře zapadá do Talas AI, o kterým jsme se tady bavili dva díly zpátky, kdy máte neuronku zapečenou na nějakým specializovaným čipu. A tohleto je něco, co k tomu může dodatou jako datovou vrstvu teoreticky. Takže funguje to na nějakým jako Merkel Daggu a řešení konfliktů. Tak taková silná věc, zajímavá. Tak to je jedna novinka. Pak jsem si všimnul trošku blíž novýho startupu, kterej založil Jan Leekun v v Paříži. To jste asi slyšeli. Je to poměrně stará zpráva. Není to ve skutečnosti taková novinka. Týká se to toho jeho slavnýho jepa, Joint Embeding Predictive Architecture, což je jako něco velmi slibnýho a myslím, že o tom ještě párkrát uslyšíme. Nevím, jak moc chcete jít do detailů. >> Hele, já bych si musel tu defru víc nastudovat, ale to, jak j to popsal, tak mi hodně připomíná český Evolu od Dana Steigerwalda. Nejsem si jistej, nakolik to bude jiný, ale právě taky jako Dan řeší nějakou jako replikaci, že je to peer to peer, ale zároveň je tam nějakj synchronizační server, protože ve chvíli, kdy on to teda má jako volitelný, že i ten synchronizační server je kompletně stejnej jako ostatní, se chová stejně, pokud vím, ale je to kvůli škálování, protože když byste dělali peer to peer komunikaci s milion klientama, tak to bude jako docela vražda. Takže proto tam i s tímhle pracuje. Ale musel bych tu defru víc prostudovat. Přiznám se, že Killa nesleduju od tý doby, co zoufale lovil práci a nebyl schopnej ji najít, protože není ochotnej se přesťovat z Austinu a mít míň jak 300 000 dolarů ročně. Takže >> jo, jo, to je známej příběh poměrně. E, ok. E, Daniel Štegerwald. Daniel, říkáš? >> Ano, přesně tak. >> Tenhleten projekt neznám, ale rád se na to kouknu a můžem to kdyžtak srovnat. v některým z příštích dílů. A pojďme kdyžtak na další novinku. Jestli k tomuhle nic nemáte, >> tak já si to vezmu. Tak jo, já mám novinku o podvodech, protože možná jste někteří zaznamenali, že se objevil novej coding agent, kterej hnedka získal první místo v Terminal benchi. Je to OB1 a já jsem byl i na jejich sleku. Dostal jsem přístup do bety, ale nějak jsem ho nevyužil a pak ke mně tak nějak jako úplně z boku přiletěla zpráva, že absolutně oskamovali celej terminal bench, protože oni to na něm iterovali takovým způsobem, že si pak eh uložili ty zadání, oditerovali si to bokem a pak do Jason filu vyloženě zapekli celý řešení včetně reasoningu a ten commandinovej nástroj potom detekoval, že běží v terminal benche v podstatě si jako natahal celej reasoning a jenom tam randomizovali časy, aby nebylo podezřelý, že všechno trvá 10 minut, takže to trvalo 8 až 15 minut. Je o to moc pěkný Twitter trad, takže to určitě přiložíme do materiálu, ale mě by zajímalo, jestli třeba víte o nějakejch dalších podobnejch pojebech vyloženě za účelem marketingu a benchmarku. Já bych do tady toho skočil s tím, že já jsem dlouhodobý uživatel kurzoru, s tím, že oni nikdy, ne, že by nějak podváděli, ale nezveřejňovali, když si třeba udělají vlastní model, tak jak se ten jejich model porovná s tím vlastně, co je frontier aktuálně. A teďka jsem zaznamenal v posledním týdnu, že už jako vyhodili nějaký benchmarky právě Composer 1,5 s ostatníma modelama a samozřejmě furt jsou to jejich jako benchmarky, kterým se dá málo co věřit, ale ale už to aspoň normálnímu uživateli jako dá na mapu zhruba, kam se třeba ten jejich model, kterej vlastně se nedostane na takový ty LM arény a podobný benchmarky, tak jak se srovnává cenově, rychlostně a vlastně tím tou inteligencí s těma ostatníma modelama. E což samozřejmě furt je to trošku přibarvený a ale to když si firma udělá svůj benchmark, tak se to dá čekat. No >> to jsem vůbec nezaznamenal. To musím víc procedurovat. >> Mimochodem já mám organizační poznámku jednu. My jsme vůbec nepřivítali našeho speciálního hosta dneska, e, kterým je Lukáš Cahá z JuLidiru. Lukáši, ahoj. Ještě jednou vítej tady. >> Ahoj. A možná ještě než se vrátíme k tý novince, o který se teďka bavíte, že bychom jenom v rychlosti představili Lukáše, můžeš k tomu něco Lukáši říct? >> Mhm. Tak ahoj, já jsem Lukáš a vlastně poslední čtyři roky tak se věnuju e startupu firmě Uklid a my děláme úklid domácností, takže něco úplně mimo tady ten obor všeho exciting ohledně jako AI a podobně. s tím, že předtím jsem dělal dva roky v agentuře na virtuální realitu. Oni dneska trošku pivotli a dělají taky AIO, takže kdybych tam zůstal, tak jsem taky asi na na v předních liniích. Ale a já jsem se rozhodl dělat tady ten offlinovej byznys s tím, že e offlinovej znamená, že někdo chodí někde v offlineu, něco dělá, ale hodně toho, co já vlastně dělám na denní bázi, tak je online od toho, aby si ten člověk mohl objednat a přišel mu tam někdo spolehlivě a zaplatil všechno kartou a celá ta logistika. Tak eh řekl bych, že aktuálně jsme ve fázi takového jako early day dáme jídlo nebo rohlíku a kdy minimálně to to, co třeba dělá Tomáš UPR, tak by byl náš cíl, ale samozřejmě to potrvá ještě roky, než se tam dostanem se zkušenostma a s tím provozem celým. Takže tolik o firmě a o mě taky. Jinak jinak jsem nadšený PHP programátor. O tom určitě víc později. >> OK, super. Děkujem. Já jenom k tý novince, že jsem teprve před čtyřmi dny znovu vyzkoušel takový ten automód v kurzoru, protože jsem měl už vyčerpaný všechny AP call a tak a zbývalo mi tam hodně toho toho volnýho. E víte co myslím? To se součástí toho toho plánu. H tak jsem to chtěl zkusit a byl jsem překvapenej, že to je poměrně dobrý. Tak neviděl jsem ty benchmarky teda, ale řekl jsem si, že to budu používat častějc, abych to vyčerpal úplně vždycky, než se mi to resetne. Já samozřejmě nemám taky benchmarky někde z kapsy vytažený, ale e co je takovej jako můj feeling, já jsem naopak teďka mi docházel ten included e spend, tak jsem začal používat ty API modely a vlastně jak Opus 46, tak Codex teďka novej, tak oni jsou na mě hrozně pomalý, protože vlastně ten e kurzory composer e tak oba dva, jak jednička, tak 1,5, tak byly hrozně rychlý. Oni sice byli trošku jako hloupější pár měsíců pozpátky, ale já vlastně si k tomu sednu a napíšu tam prostě plán. Teď hele, vyhotov mi ten plán a že si půjdu třeba, nevím, pro jídlo nebo něco, že jo, na na pár minut a než se zvednu z tý židle, tak ono to je hotový, jo. Což mě vždycky jako překvapí, ale trošku taky naštve. Ta ta rychlost si myslím, že právě pro to každodenní použití je ta největší výhoda, i když je to třeba šest měsíců jako hloupější než ty ostatní modely. Já jsem nenašel jako tolik use case zase pro rychlý modely, protože aspoň moje zkušenost a ono se to jako proměnilo tím, jak k tomu AI nakládám víc a víc, tak e když dostanu rychle strašnou blbost, tak mi je to k ničemu. V tomhle ohledu eh jasně experimentuju s tím, ale nikdy jsem nepřišel na chuť tomu flow, že bych jako definoval tak detailně plán, aby to zvládl hloupjý model exekuovat. Takže moje flow spíš je přesně opačný, než popisuješ. A já si udělám jako diskuzi, a jedu třeba pět plánovacích session, vždycky si to přečtu, odpálím jednu a jedu dál. A takhle jako to můžu pálit ve velkým a potom to třeba jede 4 5 hodin a je mi to vlastně jedno, že je to pomalý, protože vím, že ten výsledek je tak moc ready a když tam použiju i skill, tak on si oditeruje i code review s jiným agentem přes Gidapull requesty. Takže ta rychlost u mě naopak není takovej problém. Naopak jsem narazil na to, že když je model rychlej, že ho nestíhám číst, tak ho eh nezkoriguju v průběhu. E tím, že používám efekt TS na backendu, kterej je pro AI hodně eh neznámej, tak zejména v některejch jako začátcích projektu, tak hodně koriguju typu, já nevím, zrovna vyšla nová verze modelu a začala používat JSkový importy, protože si blbě nastavila TS Config. A jsou to věci, který samozřejmě podchytávám ve svejch šablonách, čím dál tím víc, ale ne všechno zvládnu podchytit na první dobrou. Takže mně naopak jako vyhovuje mít ten pomalejší model, do kterýho můžu zasáhnout a nějak ho zkorigovat. A představa, že budu mít jako těch, já nevím, ten composer má 200, 300 tokenů za sekundu, tak to se ještě dá. Ale kdybych jel jako Cerebras a měl jako 1500 tokenů za sekundu, tak to už e jako absolutně nezkorigovatelný a pak dostanu jako hromadu blbostí strašně rychle. >> Hm. >> Já možná tady doplním ještě do tady toho ten můj vlastně povahu tý práce, tak co jsem zjistil vlastně z diskuze se všema AI e používajícíma lidma, tak já vlastně nedělám nic složitýho, já dělám jenom CRUD aplikace. To znamená, že mám databázi a mám něco, co prezentuju uživateli a já jenom překládám tady ty dvě věci, což je vlastně extrémně jednoduchá věc. Dokonce e už jako tady koluje, že jakoby máme AGI pro e tady ty crude aplikace a to znamená, že pro mě těch šest měsíců starej model vlastně, tak znamená, že tak jako barle to zvládá. A můj největší challenge, tak co je, tak je UX vlastně, co ty jak ty lidi s tím interagujou. Máme vedle toho, že jo, branding, protože vlastně půlka práce je frontend nějakej. A všechno to musí být správně barevný, kulatý a nesmí to vypadat hnusně. Což dneska ty modely zase nezvládají tolik. Samozřejmě na to je nějakej jako tooling, ale že ho musím držet vlastně v tý lidskosti primárně a a opravdu potom ty táky jako nejsou tak složitý, takže vlastně i zvládne, ale chápu, že pamatuju si třeba když jsem si inicioval projekt, tak prostě mi nainstaloval Tailwind 3, i když dávno Tailwind 4 prostě tady je všude a jenom to prostě nevěděl. Ale potom, když si to člověk vyladí přesně, jak říkáš v těch šablonách, to dělám vlastně taky, že mám ty starter kity vupku, tak za mě super. No, ale ale nedokážu si tím představit, že bych udělal třeba jako AI aplikaci pomocí AI, protože to je prostě moc nový na to. >> OK. Eh, mě na tom fascinuje na týhletý debatě, nakolik je to vlastně implementační detail, eh, jestli používá člověk tenhleten přístup nebo ten druhej přístup. Ty jsi Lukáši říkal, že mně to vlastně přijde strašně zajímavý, že máš nějaký offline byznys, e, který zároveň tak trošku online. Ty jsi říkal, že si firma vašeho typu může dovolit zaspat nějaký technologický inovace a stále vyjít jako vítěz. Jak jak jsi tohle myslel? Mně přijde docela dobrý. Tam tam je na tom super to, že já e obecně bych neřekl, že jsem co se týče tady toho e bytí na co největších novinkách jako nějak aktuální, jo. Takže radši si eh budu pracovat na těch starších technologiích, který už jsou trošku prozkoumaný a a je to trošku jednodušší. A vlastně technologicky, tak eh my jsme hrozně starý. To je prostě PHP z moje SQL a to jsme se už s Petrem kolikrát bavili, že jako on má celej ten novej JavaScript a shiny, všechno dobrý a já na to prostě nejsem schopnej přijít. Já teďka prožuju vlastně ze všechasů, co mám tak react, protože já jsem se ho nikdy nenaučil pořádně a nevidím tam ten use case. Takže jakoby v tady tom to myslím tak, že já já klidně můžu tady vzít eh PHP, dát tomu ještě jako SQL a hostovat to prostě na VPSu s Apachem skoro až a já jsem pomocí jako a neindexoval si jako databázy, to jsem reálně dělal jako prvních šest měsíců, tak nebyly indexy databázy a bylo to na sdíleným hostingu, kterej mě stál jako 100 Kč za měsíc, protože jsem si připlatil za prémium Vedosu místo toho, abych si zaplatil těch 30 korunovej. A my jsme na tom udělali několik milionů obratu. Takže jakoby to je samozřejmě potom to začne škálovat a je potřeba některý věci jako dělat pořádněji a aby třeba databáze nepadala a tak. Ale jako ten jako kolik se dá vyrobit peněz, e, jenom tím, že prostě se podpoří nějaká aktivita, něco se někam přepošle chytře a takhle zase krut databází, tak je až jako neuvěřitelný s jako jakovou houpou technologií, jo, že my my kdybysme teďka 10 let neimplementovali AI chatbota pro klienty nebo někoho, kdo takhle bude něco to a bude sedět tady nějakej člověk, kterej bude jako odpovídat, tak ten break event toho ROI, kde ten člověk bere prostě nějaký fixní peníze za měsíc versus že by nějaký developři vlastně implementovali toho AIBO, ladili ho a platili jsme za inference u toho. Tak já fakt reálně 5 10 let teďka můžu počkat, než se to všechno vyladí, než tady e géové typu právě Petera takhle odladí ty solutions a všechny ty open source vyrobí a já si můžu tak jako hloupě přijít a potom si to jenom od nich stáhnout, protože už to všechno bude hotový. Takže tímhlenctím si myslím, že my klidně můžem zaspat a stejně jakoby vyrábět peníze. >> Jakákoliv věc, která se dělá dneska, tak je stokrát dražší než za rok, že jako úplně jakákoliv fečura, kterou jako dneska chce někdo vyvinout, tak je úplně jasný, že s tím bude mnohem víc problémů, mnohem víc starostí, mnohem víc potenciálních bugů, než když počkáme na model, který je za rok nebo tol, kterj je za rok. A je pravda, že firmy musí jako umět balancovat meziitím, vyplatí se nám to mít teďka a už teďka se s tím hrát, už teďka mít tu technologii, už teďka s tím mít ty zkušenosti a nebo tohleto pro nás není kritický a to, jestli to budeme mít dneska nebo za dva měsíce nebo tři měsíce nebo rok, je vlastně jako vesměs jedno, ale není jedno to, jestli to bude stát milion nebo jestli to bude krabicový řešení za tisícovku měsíčně. >> Přesně tak. Ono kdysi byl takovej ten fyzik, co vypočítal, že na nejbližší hvězdu, kam má jako cenu letět, tak nemá teďka cenu letět asi jako 600 let něco takovýho. A že právě ty rakety se budou zrychlovat tak rychle, že tam se ta matika vlastně protne ani za 600 let, takže ta raketa tak jakoby každej rok bude o 1,4 % rychlejší. Něco takovýho jako e mu jako vyšlo z toho, co byl tenkrát jako trend. S tím, že teďka přesně Pavle, jak říkáš, tak já jsem viděl statistiku, nemám ji podpořenou, tak ale že inference tak každý rok je devětkrát až 900kát jako levnější. To si myslím, že jsme tak asi všichni zaznamenali zhruba tady ty čísla a jedno, jestli to je jakoby dvakrát, devětkrát nebo 90krát, ale jako není to 1,4 %, že nemusíš jakoby čekat těch 600 let na to, protože vlastně super pro lidi, jako jsem já, který, já se rád na to podívám, rád si to zkusím, rád se o tom pobavíám jako s těma lidma, ale eh abych do toho investoval jako firemní peníze, tak není nutno vlastně. No, >> my máme v promebooku takovej kouzelnej šuplíček, ve kterým jsou všechny věci, které ještě dneska neumí dobře udělat současný nástroje. A vždycky, když přijde něco nového, teďka to typicky bývá buď kodex nebo cloud, jako jeden z nich, tak to na to pustíme a vždycky se stane, že z toho šuplíčku pár těch věcí jako najednou jde. A jako my říkáme, že úplně brutálně chceme prioritizovat to, abychom do toho dali co nejmíň lidskýho času. Protože jako co je drahý, je ten lidskej čas. Co je drahý, je to, pokud bych se teďka tady týdencal s něčím, co mě za měsíc vyřeší GPT 57. Ale jako je pár věcí, který se vyplatí prorvat i dneska celou. A řekl bych, že co se jako liší mezi námi, je to, že u nás těch větí, co se vyplatí prodávovat, silou, bude asi trošku víc, protože jsme jako víc technologická firma. Zatímco u firem, který tu technologii maj jako ten tool, kterej jim má poskytnout, tak tam těch věcí bude nejspíš míň a spíš se jim vyplatí čekat. A skoro bych řekl, že se vyplatí mít někoho, kdo říká, nebojte se, ten čas přijde, kdy se to uděle jako teďka nasazovat chatbota, to jenom naštvete všechny svoje zákazníky, bude vás to stát milion a stejně ten chatbot bude blbej a za rok ho stejně nahradíte něčím lepším na nějaký lepší technologie. >> Přesně to jsme teďka udělali. My jsme teďka vypínali chatbase na našeho hospodně. Oni si s tím mohli povídat o čemkoliv, ale co se stalo, je, že tam byly dvě jakoby to byl vlastně i Felstrom nakonec. E, buď došli do toho, že se to nedá vyřešit a mají nám napsat na WhatsAppu, nebo jakože jo, chápu tady tu tvoji išsu, že jsi frustrovaný s tím, že nemůžeš to, napiš nám na WhatsAppu. A nebo si to s nima povídal o legislativě, což bylo super, ale těch konverzací tam o legislativě bylo třeba sedm měsíčně, jo. To znamená jako, že nikdo nechápal, jak platí odvody, tak mu to tam trpělivě vysvětlilo. To bylo super. Ale zároveň na stejnou věci můžou jít na svoje chat GPT, no freeščkový chat GPT a nemusíme za to za tisícovku platit prostě to každej měsíc. No, >> mně tenhle nápad prostě spojit offlinovej byznys s něčím jako super cool připadá strašně strašně sexy, protože to je takovej hedging, jakože vlastně přesně jak říkáš, že ty jako i kdyby se cokoliv jako podělalo, tak pořád ještě máš nějakej nějakej byznys, do kterýho můžeš investovat svůj čas. Eh, tipnul bych si, že co je u vás nejnáročnější z hlediska škálování, bude to organizace času těch lidí, který dělají ty úklidy. Eh, pletu se nebo je tam Jak to řešíte? Těch škálovacích problémů tam samozřejmě není úplně málo. E my jsme teďka, já bych si troufil říct, že jsme překročili způsob, jak škálovat to vůbec jako jejich nabírání, jo, že dělali jsme třeba věc, že jsme si je zvali vlastně k někomu z nás domů, abysme tomu udělali takzvanou praktickou zkoušku a nám prostě došly nemovitosti, jakože nemáme dost lidí v kanclu na to, abysme tam každej tejden,že se nedá uklízet víc než jako jednou za tejden, prostě protočili ty lidi a protože prostě těch praktickejch zkoušek bylo víc, tak jsme si tady pořídili jakou místnost, řekli jsme, že to je sklející středisko a dali jsme tam na zem dvě podlahy prostě dřevěnou a plastovou a teď zkoušej vytírat a ukaž nám to. Popovídáme si o tom. A takže tohlencto si myslím, že jsme teďka vyřešili a to bylo teďka nás trápilo rok dva a ten zbytek tam toho zadání je vlastně hrozně jednoduchý, jo, že když si vezmeme nějaký rozvoz, tak tam teď těch jako lokal se dá projet 40 za ten den a už jsme tam u nějakýho travelling salesman problému, e, který je samozřejmě neřešitelnej, ale je aproximatelnej. všechno tohlencto super, ale my ty úklidy máme dvě denně na tom člověku, protože prostě on trvá třič hodiny. Eh, takže můj traveling salsman problém je vlastně jako primitivní a ještě tam máme pravidelný zákazníky, kterým to nemůžem měnit ty lidi. To znamená, že já ten traveling salesman problém bych mohl udělat na papíře každej den. Takže tady ty věci, co vypadají neškálovatelně, tak vlastně jsou v pohodě škálovatelní. Teďka si myslím, že jsme eh dorazili eh na a to je zase to není jakoby technickej problém, je to spíš byznysovej problém na že jsme vyčerpali jako early adoptery, jo, že jsme si v těch lokalitách, kde jsme a tak jsme si vyzobali takový ty lidi, co prostě to musí hnedka zkusit a už je to trošku jako náročnější na tý klientský stránce, ale myslím si, že teďka e v další iteraci s trošku vypolishováním tý zákaznický toho UX u vlastně e v tom, jak se cítí během tý journey a e co se dozví a jak jim to vlastně prodáme, proč je to jako výhodný kupovat ten úklid, tak tohlencto taky e vyřešíme a tak. No možná kdybych měl jít úplně do detailu, tak ty věci, co jsou žel pro každou firmu, neboli prostě cashflow, nabírání schopnejch lidí, legislativa, tady ty klasický věci, jo, že že není tam žádnej moc jinej problém, kterj by právě byl neřešitelnej, což je super, protože právě potom se člověk může soustředit na ty hezký věci. >> To je super. Já mám k tomu ještě takovou otázku jakože ve srovnání s rohlíkem třeba mně přijde, že na tomhletom způsobu podnikání je strašně super, že přesně, že jako z logistickýho hlediska ty nemusíš stavět žádný sklady a dělat mezitím žádný jako super optimalizace, protože prostě nemusíš. To je to je fajn a zajímalo by mě, kam se vám to podaří dovíst. Zeptal bych se na to, že v čem se vlastně ten zážitek liší teda od běžný úklidový firmy, že jako představuju si nějakýho e šéfa SVJ, kterj potřebuje uklidovou firmu, tak co ho naláká na to, že má zvolit? >> Tam je e spoustu těch věcí, co si vlastně pojmenal, co budou jiné nebo stejné. Tak my jsme to od začátku designovali, aby to bylo eh ne, že je low effort, ale takovej jako, že nemáme třeba auta, nám prostě ty lidi jezdí MHD a protože kdyby měli auta, tak to je samozřejmě liability. A my jsme začínali hlavně na na úklidu domácností, kam jsme řekli, hele, nemusíte tah vybavení, ten klient má všechno doma. Kdyžtak si koupí jenom balíček, kterej prostě váží 4, 5 kg, ten tam donesete jednou a už ho tam má prostě na půl roku dopředu. E, takže jakoby my jsme se to snažili snížit co nejvíc takhle, protože kolegové předtím tak měli vlastně firmu na úklid Airbnb a tam tady ta logistika naopak byla velice náročná, protože tam se vozilo prádlo, vozil se klíče, někdo tam uklízel, občas eh to nezvládl uklidně, takže a jelo to ve dne v noci 247 e včetně Vánoc, Silvestru a všeho. A protože Airbnb prostě ty hosti jezdí hlavně v ty momenty, kdy vy chcete mít dovolenou taky. E, tak tam to bylo náročnější, ale tady to právě z té zkušenosti, jak je designovaný jednak na kvalitu. To znamená, že e ty lidi jsou jako špičkově proškolený, jo, že bereme prostě pár procent z těch lidí, co by chtěl u nás uklízet a taky jsou potom za to odměnění. tady tím jako flipnutím narativu, tak my jsme se omylem dostali do toho luxusního segmentu, kde právě ty ty luxusní značky taky Rolex vlastně neřeší jako kde bude vyrábět v továrně, protože tam prostě na to prostor to vymyslet je vždycky. >> OK. Eh, co je Funder DNA aplikace? [smích] >> E, já jsem naposílal do tady témat pár takovejch věcí. Já jsem měl v prosinci, to určitě budete relatovat tady tomu, znát ten podobnej pocit. Já jsem v prosinct měl takový, ne, že vyhoření, ale trošku jsem si potřeboval odpočinout od toho vývoje a vlastně už jsem ani nevěděl, jak ten prompt má začít, abych tam tu fečaturu vyrobil, protože tam zrovna jsem psal eh něco složitějšího jako na na jádru toho, jak to zpracovává objednávky a já vůbec jsem netušil, kudy začít a někdy 5. prosince to začlo a já jsem potom měsíc fakt nebyl schopnej do toho projektu se vrátit, tak jsem začal dělat jako random projekty. To znamená, že jsem si rychle spinapnul nějakej e codebase a rychle jsem s AIem z toho něco vytvořil a právě vznikaly projekty typu Founder DNA, když jsem chtěl nějaký myšlenky jako zachytit vlastně na papír, dělat takový to, co ty lidi normálně dělají z lavable, jo, že hele, chtěl si tady prostě apku, kde moji kamarádi něco, ukládá se whatever fitness, cokoliv. A tohlencto konkrétně je případ, kdy kdy jsem chtěl vlastně tady ty debaty, kdy se lidi baví, tak vím, že minimálně tady se jako neshodneme na tom, jak bysme věci programovali, na tom, jak bysme podnikali. Vlastně kdybyste každej dostal zadání udělat úklidovou firmu, tak skončíte na úplně něčím jiným. Někdo bude mít firmu, někdo bude mít platformu, někdo bude mezinárodní, někdo bude jenom v Česku a někdo vůbec nebude dělat úkol, začne dělat třeba kurýry. A právě tohlencto konkrétně, tak bylo takový jako dvouvečerovj projekt, kdy jsem chtěl zkusit nějakýma jednoduchýma otázkama, takový jako 16 personalities, ale jako na to jako jakj jste founder, tak to rozřadit jako jestli jste spíš ten Zuckerberg nebo jestli jste spíš ten Peter Levels nebo jestli jste DH a takže to to když si tam vyplníte eh tak to můžete zjistit, k čemu se jako blížíte a právě se to ptá na věci jako typu jste spíš pro technologie nebo spíš pro design. Jo, tam je takovej ten jobsovskej směr versus takový třeba ten IBM směr. Potom se to ptá jako na to, jak byste to třeba marketovali a vyjde vám jedna z 27 kategorií, kde jsou potom nějaký zdroje, knihy a tak, protže to mě to mě vždycky bavilo jako, když jsem začínal podnikat, tak si číst o tady těch lidech, co to dělali přede mnou, e, protože tam je prostě spoustu informací a i ty filmy okolo toho a podcasty vlastně s těma lidma, tak jsou prostě sranda. Takže to je napůl je to test na porovnání se s kamarádama na napůl je to databáze znalostí pro foundery. >> Super. Tak hodíme odkaz do popisku pod video potom >> můžete teďka to z dvou uživatelů bude mít najednou víc. Já se vás možná rovnou všech zeptám na to jako e, že s AIem jsme tady kolik? tři roky, čtyři roky, záleží jak moc intenzivně kdo. E, měli jste nějakej takovejhle jako random projekt, co by vás prostě napadlo, hele, bylo by super, kdyby potom jste to vyplivli, rychle jste to deplojnul, ale vlastně je to jako malinká srandička, která úplně nemá nic prodávat. Je to prostě jenom taková jako hračka, která vlastně i toho uživatele zabaví fakt jako na 5t minut. Vyrobil jste něco takovýho a případně co to bylo třeba? Já jsem vyloženě asi takovou hračku jako nikdy nevyrobil, protože já jsem jako došel k tomu, že vždycky z toho omylem udělám něco strašně velkého. [smích] Takže já jako udělal jsem takový jako blbosti, na kterejch mi nezáleželo a to bylo to, že jsem třeba eh já jsem strašnej fanda Modul Federation, protože si myslím, že na škále některejch aplikací je to eh fakt zásadní věc. A modul Federation teď funguje i na Node JS. V principu je to, že si můžete dynamicky načítat části aplikace a měnit je klidně i za runtimu a řeší to jako škálu na úrovni týmu a tak dále. Je to spíš pro velký firmy. Nicméně mě to zajímá i jako z hlediska AI, protože tam je pro to potenciál, že můžu vlastně vyříznout chunk aplikace a vibe codit jenom na něm, aniž bych rozbil cokoliv jinýho. Takže mě to zajímá spíš z tohohle hlediska. No a ono to funguje teď už i na backendu, teda module federation. Nicméně nefunguje s banem, funguje jenom s No JS. Tak jsem si řekl, dobře, tak to zkusím jen tak z zprovoznit. A řekl jsem: Codex plus, make it work. A už jsem kontributor do tří by dance projektů, protože jsem našel reálný issues a řekl jsem kodexu, hele, zjevně se to neděje jenom nám. Kriticky vyhodnoť, jestli to eh splňuje jejich standardy ten náš patch, jestli to eh je relevantní na to to někam postnout. A teď už jsem i v Pechnotes do velkýho projektu jako kráva, do firmy, která stojí za TikTokem. Takže můj fun project, který jsem jako vystřelil, mi vynesl tohle na na GitHubu. Takže to byl můj takovej funny project. >> OK. Já možná jako to vrátím zpátky trochu víc na zem, protože pokud jde o tyhlety zábavný projekty, tak eh vzhledem k tomu, že jsem táta tří kluků, tak jsem vyrobil takovýho toho offline dinosaura. Když vám vypadne wifina, tak co máte v Googlu nebo Super Maria a takový takový srandy. Eh, takže nemám v tomhleom směru nic úplně super převratnýho. >> Ty to dopln jenom ty hry jsou super, jakože já jsem já jsem dřív zkoušel dělat hry. Ono to teda vůbec není jednoduchý, protože to není jako programovací obor, to je jako artistickej obor, ale umět se jako odevzdat na pár večerů, pár víkendu jenom tomu zkusit takhle i na viby nějakou hru, tak to je přesně jako skvělej relax, že jo. Člověk to nejde hrát, on to prostě jde vyrobit, že jo. Potom to pošlo pár kamarádům, p 10 lidí si to zahraje a potom už to nikdy nikdo neuvidí. To na to mně přijde úplně jako nádherný, že můžeme udělat projekt tady toho typu teďka a zaplatíme za něj 2 t dolary. Je to tak. Ale má to i nějaký benefity po straní jako dobrý dobrý účinky, že třeba nejstarší syn teďka píše v techu úlohy pro svoje spolužáky do matematiky. Tak to je jako takový eh jsem rád, že že ho to chytlo. No, teďka zrovna řeší klokana. Tys tam měl ještě jedno téma s WordPressem a s tím, jak WordPress historicky je jedna z hypotéz, že jako hodně programátorů začíná na WordPressu. Možná a možná taky ne. Můžem to zkusit tady vybrainstormovat, protože mě tak jako napadlo, že teďka je velkej jako inflax obecně lidí do softwaru. Zároveň možná není jakože možná je tohlencto iluze. Všichni jsme viděli takovou tu grafiku od Microsoftu, jak je tam těch hodně čtverečků a jsou tam ty zabarvený vpravo dole. A možná pojďme zkusit vymyslet, jestli vymyslíme lepší influx programátorů nejenom na web obecně jako než než WordPress teďka za posledních 50 let. Ale já možná udělám jako jinou věc. Trošku do toho hodím Vidle, protože pokud jsou to ty čtverečky, co si myslím, že kolovali teďkom všude po Linkáči, tak zdravím Marka Zobače, kterj to debankoval, protože to jeá blbost. >> Prostě uděláme statistiku, abysme lidem řekli, že je vlastně všechno v pohodě, ale ta statistika je úplně jiná, protože je to jako o něčem jiným. Takže podívejte, kdo jste to neviděli, nebudu to tady duplikovat, protože bych to nezduplikoval přesně, ale podívejte se na profil Marka. Ten tohle debankoval, protože ta statistika je jako velice flot, jak jako ostatně strašně moc statistik, který se pohybujou v každým nahypovaným odvětví. Já doplním k tady tomu. Já jsem accidentally byl první člověk, co to co to nazdil, protože já jsem to viděl na Twitteru na Xu hrozně brzo a potom mě něco vyrušilo, protože já vlastně farmařím Karmu a kamarády na LinkedInu tím, že tam přesdílívám jako věci z Xu a chci být jako ten první a rozdmíchat tam tady ty témata, protože tam prostě ty témata jsou o tři dny dřív. To je jako fakt. A tak jsem si to právě v pátek vyscreenshotoval a teďka v sobotu ráno jsem se probudil, že možná už to napíšu. Někdo to tam poslal a už se tam jako strhla předtím, hele, to je blbost tohlencto, co to tady jakoby šíří za fake news. Tak jsem jako tak rád, že jsem unikl fakt o vlásek jako tomu, že kdyby mě něco nevyrušilo v ten pátek večer, tak jsem mohl být tady markem vyhejtěnej já. Jako >> možná tak to si možná dáme na nějakej achievement list. Vyhejtil mě Marek a vyhejtil mě Adam Veseckj. >> Zkuste trochu víc přiblížit, o co tam šlo v těch čtverečkách. Jakože >> já to možná možná to nasdílíme nebo jestli to máš Lukáši po ruce. Já teď ne. >> Já to mám na mobilu z kterýho teďka telefonu, takže to určitě nepůde. Ale když dáš Microsoft AI usage statistic, tak to podle mě najdeš, protže já si myslím, že to je původně od Microsoftu, že to je nějakej jejich výzkum. Tím, že teda primárně jde o to, že tam je čtvereček pro každý asi miliardu, ne miliardu, pro každý milion jako lidí na světě a ilustruje to, kolik lidí tak existuje, kolik lidí tak se dotklo AI, kolik lidí za něj platí a kolik lidí nějak s ním pracuje nebo něco takovýho. Uvidíme, co tam je přesně za ty kategorie. Každopádně v tom poměru těch lidí, tak to vypadá hrozně, že AI se nikdo jako nedotkl. Ale vlastně, když se potom podíváme, kolik je uživatelů internetu nebo nějaký třeba Facebooku a takhle, tak ty švéšky se hrozně zmenší a už jenom to, že prostě [odkašlání] velká část internetu, tak vidí AI shrnutí od Googlu každej den prostě ve vyhledávání, tak eh jako dokazuje to, že prostě to není tak, že by se lidi úplně vyhýbali AI, že 90 % lidí nikdy nevidělo AI, 99 % ho za nikdo nezaplatilo. Jo, tady tady tohle, když to jako zazoomuju, tak je tam jakože 8,1 miliardy lidí. Eh, a podle barvy jsou to ti nejpokročilejší. A tady je vidět, že prostě uses e coding scaffold 2 až 5 milionů a pak tady jako free chatbot users a tady je hromada lidí, kteří AI jako nikdy nepoužili, ale když se do toho podíváme, tak eh jsou tam strašně moc dětí nebo osob do 14 let a pak strašně moc starších lidí. Eh, plus a to je za mě nejdůležitější, protože to, že je někdo mladej nebo starý, nehraje zas takovou roli v mých očích, ale to, že nemá přístup k internetu, tak se docela blbě používá AI bez internetu. Eh, pro ty z nás, co to neznáme, stačí jezdit českejma dráhama a hnedka uvidíte, jaký je to používat svět bez internetu. Eh, ale eh, jo, Marek to krásně ukazuje. Eh, mě by spíš zajímaly ty jako finální byznysový statistiky, eh, který mají ten jako skutečnej dopad, protože to, jestli něco používám, neznamená, jestli to používám k něčemu. Jo, [frknutí] tady bych mohl si trošku zahjtit bring for back lidi, kteří se stali na modelu 4o závislý. To jsme taky řešili v nějakým sdílu tu psychózu. Takže to samotný používání podle mě nemá jako přidanou hodnotu, ale korporáty v tom strašně rády jedou, >> že jsme jako udělali synonym používání chatbota a používání AI, ale jako nevím proč jako AI bude přesně zaintegrovaný do spoustu věcí, kde člověk ani nemusí mít jako explicitní pocit, že já se tady bavím s nějakým chatbotem, ale může to být nějaká automatická sumarizace nebo jako vyrábění titulků nebo to, že to, že bude líp mob mobil poznámkova z hovoru a už ai používám, akorát to tak explizitně nevidím. Já bych k tomu ještě přidal jednu věc a to je to, že já jsem kdysi asi, já nevím, rok zpátky řekl, že si nemyslím, že bude existovat eh v následujících pěti letech profese, který se AI nedotkne. A dostal jsem za to strašnej hejt, ale v důsledku se jako na to podíváme, že můžu mít prostě nějaký plánovací moduly. Tak když vezmu fakt jako to široký AI, ne LMka, tak si nemyslím, že bude jako existovat jako relevantní množství profesí, kterých se jako AI nedotkne, aspoň jako z nějakýho externa, prostě z nějakýho plánování. Ale je potřeba to vzít z tý šířky a ne jakože chat GPT mi sebralo práci. >> Doplním z reálného světa. My jsme eh zjistili vlastně už je to trošku delší dobu, ale že lidi, když u nás čekají na pohovor eh na na hospodyni, tak oni mají pravděpodobně iPhone e a už tam scrollujou nějakej Instagram, TikTok nebo něco a tam samozřejm AI content. To znamená, že už jenom jako tady tím, tak se tam dostanou a že vlastně i jako sem k nám to dorazilo. Sice některý ty lidi s tím mobilem nejsou úplně jako super seznámený, ale ty velký aplikace, těch největších pět aplikací, tak používají všichni a tam to AIO fakt jenom prostě může vygenerovat obrázek. A ten člověk je vlastně ne, že uživatelem, ale konzumentem AIKA právě proto, že už se třeba nechal ošálit nějakýma fake news a někdo vygeneroval někde. Takže už za mě tohlencto je jako ovlivnění, což přesně jak říkáš, Petře, nebo před rokem jsi říkal, tak tohlencto úplně bohatě stačí, protože toho člověka je 100 ze 100 obrázků jeho jeden ovlivní natolik, že to i tu jeho práci ovlit fakt může. Mně ještě přijde jedna věc, že velmi často slyším takovou zkratku, že haa, tady jsem vyzkoušel chat GPT a on prostě vůbec neuměl napsat smlouvu, nebo tady jsem vyzkoušel kodex. Aha, on mě tady jako vůbec neuměl pohnout projektem. A maj nějakej jako jeden izolovanej case s nějakým ne úplně ideálním využitím, kterej zrovna v danou chvíli nefungoval. A z toho to generalizuju na to, že hm, AI je blbost, AI nefunguje, moji práce to někde nenahradí, jsem v pohodě. Prostě jako programovat to neumí, já programovat umím, jsem v pohodě. >> No, já jsem tu statistiku od Marka Zobače taky viděl, taky jsem tam psal nějakej koment a byl to trošku jako counter opinion, že vlastně mně přijde strašně snadný kritizovat tyhle statistiky za to, že jako debankovat to a že to je blbost. Asi to je blbost do nějaký míry ty data nejsou přesný. Ale zároveň mně přijde, že jako ten trh je obrovskj, ten trh je nenasycenej v tuhle chvíli a to je prostě pointa toho, co to chtělo říct ta zpráva původní, aspoň myslím. Ale ok. Eh, to mně přijde jako fér to, co říkáte. Zároveň jsem na to trošku alergickej z toho důvodu, že třeba když jsme začínali s Pavlem WebGPT před třemi lety generovat webový stránky s prostě s pomocí AI, tak nám všichni říkali, že to je obrovská blbost a že to nikdy nebude životaschopnej byznys. A dneska tady máme Lavable Makali, base 44 a já nevím co všechno, tak jsem na to už trošku opatrnější. Jako mně z tý statistiky přijde jako jedna jako zajímavá, opravdu zajímavá informace a to ta, že je tam poměrně málo platících uživatelů, že je tam poměrně jako špatnej ten poměr mezi lidmi, co to používaj a co za to opravdu platí. A tím pádem si jako myslím, že tohleto inherentně směřuje k tomu, že se opět stane to, co se stalo se sociálníma sítťma, že uživatelé nebudou zákazníci, že zákazníci bude někdo jinej, třeba ten, kdo tomu bude vpašovávat kontext. nebo dávat tam reklamu, nebo vpašovávat nějakou svojí agendu, ať už byznysovou nebo politickou. A ty běžní lidé používající chat GPT budou vlastně předmětem týhletý agendy. A na druhý straně tady budou firmy, který si to budou platit, aby měly ten svůj nástroj, do kterýho tu svojí agendu daj. Ale jako nevidím v tuhletu chvíli žádnej způsob, jak by běžní lidi platili chat GPT podobně, jak se platí třeba z mobilního operátora. tohlencto do toho skočím jako zástupce firmy. E, já si teďka nejsem jistý, jestli ten Jet GPT tak ty reklamy už zavedl nebo ne a jestli budou na Ameriku nebo ne. Jestli už to je možný jako tady. >> Myslím si, že to ještě není. Dokonce se neslo Etherem, že to snad zrušili tady ty efforts, takže ono se to jako mění prostě podle mě to jako vypustili tak nějak jako, aby otestovali vody a pak zjistili, že to jako nefungovalo stejně jako spousta leaků. Prostě není leak. Je to jakože pojďme otestovat, jak se na to komunita cítí. >> Každopádně až tohlencto přijde, až to přijde primář do Český republiky, kde my podnikáme, tak jestli tam e jako na tom bude ten byznys, toho, že když to někomu ukážou, tak ten člověk to potom koupí nebo nějakej konverzní poměr, tak e my do toho jako jsme ochotní nalít celej marketingovej budget, půlku, třetinu. Záleží jako jak to bude efektivní, jak to bude stabilní, ale jako je mi to jedno, protože tu službu e klidně přest to budu prodávat. jakoby tam na tom nevidím nic špatnýho, protože ještě ještě ten chat mu to jako vysvětlí, proč my jsme ta jako lepší volba, že to je pro nás historicky, my jsme jenom ta další uklidovka vlastně, ale nejsme a tohlencto jako vysvětlit na tom webu, kde mi tam zůstane prostě 7 vteřin, tak jako nejde, ale když mu to takhle jako podsune, tak jako here we go, jako to je tohl chci koupit právě proto, že e chci, aby prodal ty moje výhody, který jsou jako skutečný. E, i když vlastně ta konkurence má třeba jiný výhody, ale ale prostě já tam budu první na těch reklamách tady tom a já jako vím. >> Já se jako ještě myslím, že jako majitel firmy v principu jako děláš dvě věci, který jsou jako různý. Ta jedna je, že chceš ten tvůj záměr, ten svůj go vpašovat pomocí třeba z nějakýho reklamního budgetu do toho generickýho nástroje, ať už je to chat GPT nebo Google Gemini nebo tak. Ale druhá věc, že chceš, aby pro tvoje zaměstnance a nějaký jako lidi, co chceš ty mít do nějaký míry do nějaký míry jim ty určovat agendu, aby těmhletěm lidem tohleto nevpašovával někdo jinej. A jako potřebuješ pokrýt obě ty věci, potřebuješ pokrýt to, aby ty jsi se dostal někam, ale zároveň aby se někdo nedostal k tobě. Kdyby jsme zjistili, že tohlo je riziko a můžem za to taky zaplatit, tak jakoby jsme za to taky zaplatili, ale to ještě ještě uvidíme, protože ono když je ten člověk zaměstnanej a tak, tak eh jako ano, dá se na něj zamávat vyšší hodinovkou, e tak může jít tam, ale zase zároveň eh ta věrnost [odkašlání] té firmě, tak je jedno, co to naruší, protože teďka my nemáme dlouhý jako lifetime na těch hospodních. To prostě v tady té profesi tak se to nenosí. Jo, jakože modrý límečky, tak eh nezůstávají u vás jako 10 let. To se prostě jako nestane. A vlastně to ani pořádně nejsou ty dva roky. To je u nějakejch těch jako eh top procent. Eh takže ano, zaplatil bych za to, kdyby to šlo jako limitovat, ale also, tak je to něco, s čím počítáme. Každopádně za ty reklamy, jak na nábor, tak na na to, aby si nás klienti kupovali, tak jako říkám, budu první v řadě >> tam. Já já bych k tomu možná vlastně ještě doplnit, že je pravda, že vy možná nejste úplně jako dobrej dobrej target k tomu druhýmu účelu, jak jsem říkal, ale já to třeba vidím u právních firem, že e najednou e, že spoustu lidí interně používá chat GPT, dokonce se ho klidně platí, ale je to prostě stále chat GPT. A teďka jako pokud mám opravdu nějakej jako spis klienta nebo jako něco, co by se fakt nemělo dostat ven, tak jako nahraju to do chatu GPT. Teďka jako jako ještě obzvlášť za tý situace, kde jako víme, že Open A jako krvácí, že potřebuje někde ty peníze nabrat a jako jaký mám možnosti? Buď tam má možnost vpašovávat agendu, nebo má možnost využívat moje data nebo ty data má možnost někomu prodávat, kdo zaplatí. To podle mě není dobrý. Jako podle mě mnohem lepší je, když jako jsem v situaci, že opravdu je pro mě to AI do nějaký míry strategický jako uvnitř tý firmy, tak zařídit si to tak, abych to AI měl pod kontrolou, abych měl pod kontrolou to, jaký má záměr, co dělá, co jako do tý firmy tlačí, kam jdou ty data, kde se zpracovávaj, eh v jaký kurisdikci se zpracovávají. A tohleto jsou věci, který si myslím, že ani není tak jako důležitý mít něco lepšího než chat GPT, ale jako důležitý je mít něco aspoň tak dobrýho jako chat GPT s tím, že vím, jak se tam všechny tyhlety věci odehrávají. A je možná pravda, že u vás to jako umím si představit, že třeba u vás by to mohlo mohlo souvisit s nějakým, kdyby se třeba někdo, kdo uklízí radil s chatem GPT ohledně nějakýho problému, který má někdo doma, tak že by nemuselo být úplně dobrý, aby se to posílalo do chatu GPT, ale to je možná jako taková okrajovka. Tam tam se dá tohlencto uplatnit na na lidi, co u nás pracují v kanceláři, protože oni samozřejmě to jako použijí na denní bázi. Už jenom protože teďka jsme od novýho roku, tak mezinárodní tým, tak už e s naším portugalským kolegou si prostě ty věci překládáme, protože on si radši s tím ekem povídá v portugalštině a jako jsou tam tady ty faktory, ale tady to je obrovská výhra, že máme Gemini. E, Gemini. Eh, asi je frontier, asi není Frontier, to je jedno. Každopádně good enough a nám teda s workspaceem aspoň slibuje, že ty data prostě nejsou použitý k trénování, což může znamenat cokoliv. Oni můžou používat na cokoliv jinýho. E, ale doufal bych, tam nejsou žádný nastavení, nemůžu si pořídit nic jinýho. Doufal bych, že o ty data takhle nepřijdu. Takže takový ty jakože přeformátuj mi tady tabulku s klientama. Jasně. A potom to vypadá tak, že chodím po kanclu, koukám, hele, ty seš na osobním profilu, okamžitě si se přepni, prostě to tady nechci vidět, že jo. A chodím tam jak pešek a všechny tam jako po rameni, to nejde takhle a dělají to, ale všichni včetně společ, že jo. Hele, to nejde prostě, kterej má to vlastně na ten osobní profil taky zaplacený, ale to není ten firemní. To znamená, že tam už se to zase jakoby dostává do těch trénovacích dat, jo. Nebo minimálně podle toho labelu, co je dole, tak eh kterej tam teda není na tom jeho osobním. Ale já jsem jako teďkom na tuhle otázku trošku narazil s klientem. Ono je to vlastně taky jako docela diskutabilní, protože eh a já jsem vyjádřil jako myšlenku, když budu jako zmrt, kdo mi dokáže, že jsem to líaknul já. Jo, jakože eh to, že leka, tak jednak se to tam objeví třeba za rok, než se to jako dotrénuje. Pravděpodobně by někdo musel vyloženě provádět fakt jako cílenej útok, aby získal ty data o mně a byl schopnej je ke mně přiřadit. Takže z tohohle hlediska a samozřejmě jako na úrovni korporátů, který si to jako nemůžou dovolit, protože by dostali obrovský pokuty, i kdyby se o tom začalo mluvit, tak to nemusí bejt pokuta. Může to bejt prostě pád akcí jenom na základě toho, že ó, jemy mi vyplivlo tabulku zaměstnanců a reklo, něco podobnýho. Tak tam to riziko samozřejmě je, ale většina firem není v pozici toho, aby to, že se za dva roky objeví kus jejich kódu, kus dokumentace, kus něčeho v datasetu, tak aby je to ohrozilo a aby to byli schopni k nim přiřadit. >> Doplním teďka jednu věc, co jsem zase zaznamenal a nemám ji ozdrojovanou. Myslím si, že jsem slyšel, že clo tak ukazuje lidem cizí PDF nějak při procesu jako povídání si. Říkám to správně? >> Myslím si, že ne. Ono totiž jako byla taková jako kauza, která byla vlastně hrozně vtipná a to ta, že on ukazoval nějaký cizí PDFka. Jenomže ono to zjevně nebyly jako reálný privátní data. Ono to zjevně byly vyhalucinovaný data, který on si vymyslel a vypadaly jako reálný a dokázal ty lidi natolik přesvědčit, že že to jsou reálný data, že si myslel, že leje data. Ale >> já bych jako možná ještě k tomu, co jsi říkal, Petře. Já s tebou jako nesouhlasím, že tohle je jedna nebo nula. Já si myslím, že ty jakoby když řídíš organizaci, tak spíš jako nějak statisticky se snažíš snižovat pravděpodobnosti, že se něco stane, že ty jako nikdy nezařídíš jako a to ani jako v úplně těch jako top top security jako věcech, jakože tam nebude někdo, kdo jako líkuje, ale spíš jde o to jako tak nějak systematicky dělat kroky k tomu, aby se za nějakou jako cost effective cenu snížila pravděpodobnost. třeba jako a to ať už pomocí jako dobrýho softwaru, školení, toho, že těm lidem ten software poskytnu já, ne že si ho budou sami někde prostě dávat jako přes svůj osobní počítač. A myslím si, že tohleto není tak, že to dokážeš jako zapnout absolutně, že to prostě jakože každým tímhletím krokem snižuješ nějakou šanci toho, že nastane nějakej průšvih v budoucnu. >> Jo. Hele, já s tebou v tomhle souhlasím, že to není 01. Já jsem se s tím spíš snažil jako ilustrovat to, že mám nějakou jako cost of mist opportunity a to, jestli si připustím do svojí organizace AI nebo ne, tak mě může stát celej byznys, což je mnohem víc než to, že na mě přijde jako bu bu, my jsme našli tvoje data. A myslím si, že se jako v tomhle ohledu stává nejenom z AI, ale i z některých jako další nebo nejenom z LLMek, ale i z dalších věcí, tak se stává jako klíčová technologická výhoda, kdy to, že si to nepřipustím a odmítám riziko 0,01 %, tak mě tak moc zabije, že to bude problém. A když bych to vztáhl jako na, já třeba strašně rád to přirovnávám k Nokii, i když je to trošku jako stretched, tak Nokia prostě měla dotykovej telefon. Oni ho měli už jako dávno, Microsoft taky v nějakejch jako prototypech a nešli s tím ven, protože se báli těch reakcí. A tady když se budu bát toho, co mi řekne, já nevím, Legals na používání AI, tak můžu dopadnout stejně. Jako vždycky je to nějakej tradeof. E největší dopad to podle mě má na ty jako publicly traded companies, protože tam jenom rumor může mít jako katastrofický dopad. Ale jako kdo z nás má publicly traded company? >> Mně to hodně připomíná to to, co říká Kir Juran, že jako právníci, advokáti často zabíjí byznys, protože tě upozorňujou jenom na rizika, ale jako neuvědomujou si, že jako vždycky je všechno jenom o tom tradeoffu, ne? Ne o tom, že musíš absolutně vyiminovat rizika. Já si jako myslím, že úplně nejhorší věc je, pokud a to taky vidím ve firmách, že řeknou, my AI nepoužíváme, nesmíte AI koudit, nesmíte používat GPT absolutní zákaz. Ono to stejně je tak, že ty lidi mají pracovní počítače, na kterým to nemaj. Tady mají mobil, na kterým to maj a screenshoty dělají tak, že to prostě jako jenom kopírujou přes kameru a jako vlastně ničeho tím nedosáhnou. Akorát ty zaměstnance zpomalí, ale jako stejně ty informace jdou do toho >> OK. Eh, pojďme to uzavřít tenhle dnešní díl něčím optimistickým. Eh, Lukáši, e, kdyby ji měl říct tři byznysový nápady, který za tebe jsou, který bys dělal, kdyby se nedělal uklid, tak co by to bylo? No tak kdybych nedělal úklid, tak hodím nějaký jiný offline, jakože nevím, péči o seniory, rozvoz nákupu je blbost, to už tady je, že jo. Ale určitě bych šel asi tady tím směrem, eh, protože ta neřešitelnost té logistiky, eh, vlastně toho propojení toho reálnýho světa s tím IT, tak je něco, co vlastně vám dá hrozně rychle jako z nuly na 100, jo, že my jsme byli schopný eh první jako 100 000 vytěžit za fakt pár měsíců už jenom proto, že prostě ta služba jako je reálná. Není to žádný nástroj, který vlastně on tu hodnotu má, jako když uděláme tady nějaký softwarový nástroj, někomu to prodáme a potom to jako zvládnem vyškat líp, ale ten začátek je prostě jako kritickej pro spoustu těch byznysů, že že bych šel udělat cokoliv bez toho, aby tam bylo nějaká infrastruktur, nějakej kód, celý to může stát na Google formuláři a jedný rychlý webový stránce, tak jsem na tom byl schopnej vydělat prvních 100 000, ať je to prostě úklid, nebo je to cokoliv, co když zadáte, nevím, řemeslo nebo manuální práce, nebo ani to nemusí musí být manuální práce, může to být eh nějaký prostě poradenství, jo, prostě to jsou lidi, který vlastně dělají znalostní práci, ale ta hodnota je tam ihnad. Tak e šel bych do něčeho takovýho, kde i když by mi nefungovaly ty chytrý věci, co dělám na pozadí, tak mi to furt jako může vynést. Já bych řekl, že bez nějakýho většího effortu, tak se dostanete třeba na 200 milionů jako ročního obratu. Za za pár let se to prostě stane ať děláte, co děláte. Super, díky. Jsou nějaký dotazy ještě? Máte někdo něco? >> Já si myslím, že tohle byl úplně jako skvělý závěr našeho téměř nejdelšího dílu podle mě. >> OK. Tak jo, tak děkuju všem. Mějte se hezky. Budeme rádi, když nám napíšete do komentářů, eh, ať už to děláme dobře nebo špatně, taky tipy na další témata a hosty. A my moc děkujeme Lukáši, že seš zase připojil a držíme palce v uklidu. Já děkuju, že jste měli a určitě kdo poslouchá a kouká tam na špinavý hrnky a špinavou podlahu okolo vás, tak si objednejte úklid, protože neřekl bych, že existuje služba, která vám zvýší kvalitu života tak levně a tak rychle, jako jsme zrovna my. OK. Díky. Ah."
businesses\ai-ta-krajta\aiTaKrajtaEpisodes.json:351:        "transcript": "To mi přijde strašně důležitý, protože tohle, já jsem to zmiňoval v minulým díle, Michael Arnaldin, kterj stojí za Efekt TS, tak v podstatě má vypnutý i suggestions, protože on buď chce psát kód sám na sebe a nebo chce mít ty agenty. A proto podle mě to dává smysl rozdělit. Nad tím mám kurzor, což je prostě jenom plugin do VS cou a kurzor umí používat libovolnej model, nebo asi ne úplně libovolnej, ale má tam jako adaptér pro různý modely a tam jako hodně zkouším jako tam jako reálně to mám tak, že každý týden jako jedu přes třeba tři různý modely a jako poměrně jako hluboko je zkouším a snažím se zjišťovat jejich hranice. Co když to bude přesně opačně, že pokud by AI agenti měli opravdu takovou autonomii a takovou míru jako spolehlivosti, tak e oni můžou vlastně dělat úkoly bez jakýhokoliv UI a to UI se může stát velice snadno zbytečný úplně. Dámy a pánové, vítejte u dalšího dílu ATA Kajta. Dneska je to 29. díl, takže téměř jubilejní 30. Ale ten bude až příště, takže dneska zůstaneme u 29 a pojďme to rovnou vykopnout nějakýma novinkama. Myslím, že dneska je 1911, včera bylo 18 a Google Gul něco oznámil. Je to asi jedna z největších novinek, ale pokud má někdo ještě něco jinýho, tak klidně to vykopněte jiným tématem, než se vrhneme na Google. >> Já mám jednu drobnost. To je to, jestli kdo používáte kodex, tak se teďkom řešilo, že se trošku jako debilizoval tool calling kodexu, protože mu omezili množství outputu na 256 řádků. Ani tokenů, ale fakt řádku. Takže lidi začali si pokládat na reditu otázky, to mám jako svůj kód minifikovat na jeden řádek nebo co? Takže to bylo docela jako vtipný. To je jako taková moje mikro novinka, ale taky mám Google. Tak jo, tak pojďme se vrhnout na ten Google. Já jsem to dneska trochu zkoušel si v tom něco udělat. Hlavně jako v tom novém ID antigravity, což je vlastně fork v codu. Eh, bylo to jako hodně zajímavé. Víceméně všechno, co jsem chtěl, bylo jako na one shot, což asi bylo právě způsobené tím modelem, který je jako fakt dobrý, ale to jde samo o sobě. Líbí se mi ten jako rozdělný přístup, že tam máte ten jako agent view, kde teoreticky můžete řídit ty agenty, pak máte normálně to ide, ale jak psal ty Petře, v nějakém vlákně, tak je to děsně zabugované. Prostě několikrát se mi stalo, že nešlo něco otevřít, něco spadlo, něco nefungovalo a tak. Což jako mně to nevadí a chápu, že to je jako nějaká nějaký jako prvotní prototyp, který chtěli vyzkoušet, takže jsem s tím úplně v pohodě. Ale jaká je vaše zkušenost? Já jsem to jako ID nezkoušel zatím. Zatím jsem si spíš pohrával jenom se samotným Gemini. Snažil jsem se ho nachytat a myslím, že se mi to povedlo. Třeba jsem zkoušel takovej oblíbenej test. Jak máte ty, jmenuje se to Millerův test, jak máte takový ty dvě šipečky. Už jsme se tady o tom v jednom díle bavili, že oni jsou obě vlastně úsečky, z nichž jedna má takhle jako zubák na jednu stranu a druhá má zobák na druhou stranu. Oni jsou stejně dlouhý, ale prostě optickej klam způsobuje, že připadají eh jako tomu recipientovi stejně dlouhý. A lidi napadlo udělat takovej trik, že jako udělat je ve skutečnosti nestejně dlouhý a dát to Aaju, co co na to řekne. A tohle jsem udělal s Googlem a zeptal jsem se ho, jak dlouhý jsou ty úsečky. On říkal, že to je známý optický klam a že jsou ve skutečnosti stejně dlouhý, ačkoliv v mém případě schválně nebyly stejně dlouhý, takže prostě, ale to je samozřejmě jako jenom to je jenom spíš taková kuriozita, bych řek. Samozřejmě ve skutečnosti vnímám to, že je to asi nějakej pokrok, je to příliš čerstvý na to, aby to bylo podrobený nějakým benchmarkům, ale bude mě zajímat srovnání třeba s se s se Sonetem 45 nebo prostě podobnýma nástrojema. Je to příliš čerstvý. Teďka můj oblíbený kanál AI Explained teprve před hodinu vydal video o Gemini 3, protože měl nějaký technický problémy se zpracováním toho videa. >> Jo jo. Mohl za to Cloudfire nebo byl to nějaký jiný problém? >> Si dělám srandu. >> Ale že tam bylo víc problémů. No >> jo jo. Tak jo. Tak dobře. Tak třeba Pavle, ty jsi zkoušel brát s Gemini nebo s antygravity? >> Já jsem zkoušel. Zkoušel jsem Antigravity. Eh, hodně jsem zkoušel Gemini, ale vlastně mě neskutečně irituje, že jako přibývaj další a další. Připadá mi, že toho je hrozně moc a že bude muset přijít nějaká konsolidace. >> Já jsem viděl dobrý vtip nebo to je jakože na nějakém jako videu, že vlastně jak v roce 2020 vznikaly JS frameworky skoro každý den, tak teďka vznikají každý den eh AI ids a [smích] a je to rozporná situace, no. Takže možná možná nevím, vznikne nějaký eh Uber framework nebo Uber ide a všechno se to změní. Mně na tom přijde vlastně vtipný to, že je to jako zabugovaný strašně, ale když se podíváte na nějaký jako věci víc pod kapotu, tak občas se tam objeví jako buildwi cascade a tak, takže zcela zjevně je to fork wind surfu, kterj jako tady ty bugy neměl, takže oni to tak jako hrnuli dopředu, až tam jako ty bugy znova vytvořili. >> Asi to vipouili, no. Takže >> no a tak my bychom měli říct, co by byl takovej váš jako programátor ultimátní IDE. Eh, kdybyste chtěli všechny ID, který znáte, slepit do jednoho super, e, vzít všechny dobrý fečatury, který ty stávající mají a vyrobit něco, co vám chybí, co by to bylo? >> Já si myslím, že to je jako hodně o těch vrstvách, že mně jakoby připadá, že je tady nějaká vrstva agentů, nějaká vrstva modelů a nějaká vrstva IDček. A jako já strašně doufám, že se tyhlety věci rozlepí, že ono nebude, že tady bude jeden guláš všeho a druhej guláš všeho, ale že budu používat nejlepší model s nejlepším agentem na nejlepším ID. To si myslím, že k tomu trošku jako míří ten agent client protokol, co jsme řešili už v minulých dílech od zedu, protože tam by to mělo jako tam je to ta mezivrstva, která to bude lepit, kam je potřeba. Čeho se trošku ale bojím, je, že v tuhle chvíli tak si každej jakoby to wsoute upravuje jinak. A když se podíváme na to, jak je tam implementovaný třeba Tra, jak je implementovanj teďkom ten Google a další, tak každej si tam jako něco lepí trošku jinak. Takže ono to jako je způsobený tím, jak je vlastně VSO samo o sobě slepený, že ho nejde jako upravit tolik. V ideálním případě by to šlo řešit extensionama, ale vzhledem k tomu, že to s nima nejde řešit, tak si každej dělá svůj fork, cože je to důsledku jako jednodušší. Takže já si myslím, že cesta je, abyste jakoby přidali nějaký mezi vrstvy k VS codu, jak pro tu integraci agentů, tak pro integraci exchangeů přímo do toho, aby to bylo v důsledku svobodnější. Trošku mi to připomíná, jak když jsme kdysi dávno, kdo ještě pamatuje Sublime text, kdo používal, >> tak tam se taky jako vykreslovali věci tak nějak jako magicky, protože na to nebylo apíčko. A něco podobnýho vidíme ve Vsod i mimo agenty. E je extensioner, který se jmenuje Pretty Typescript Errors a oni potřebovali vykreslovat barevný věci do tý nápovědy. a v důsledku, aby to udělali, tak musej ten kód převíst na highlightovanej kód, to převíst na obrázek a pak zobrazovat obrázek, protože eh nebo jako SVG obarvený, protože to jinak nejde. Takže podle mě musí přibýt nějaká pořádná customizovatelná vrstva do VS kódu, pořádný appy, který umožní i takovýhle heavy úpravy. >> Otázka, jestli je jejich motivace to tam jako přidávat VS kódu. A pak mě ještě napadlo, jak o tom Petře mluvil, jestli třeba se nepůjde úplně jinou cestou, že jo. Pak jsou tady ide jako EZ a podobně, kteří to úplně není to ani VS Code a jestli tam vznikne prostě úplně něco novýho, možná jo, jako přemýšlím nahlas, tak bude to jako zajímavá doma. No to sledovat, kam se to bude >> to mi připomněl, tos mi připomněl zapomenutou věc, kterou která umřela v prachu času a je to editor, kterej se jmenoval Oni vím a bylo to napsaný vemlu, což byla ta právě věc, která způsobila jeho pád, ale oni udělali plně kompatibilní vrstvu z VS Code Extensions, ale bylo to jakoby eh first class WIM IDE, což bylo strašně zajímavý. Protože do VS codu můžete dodat keybindy, ale nefunguje to jako na všechno. Kdežto tady to bylo nativní na ty všechny módy, co vym má včetně skriptování a tak, ale zároveň to bylo kompatibilní s VS codem, což byl za mě takovej ten jako trošku zlatej grál, kterej eh teďkom je jako pryč a každej si to dělá po svým. Mohlo by to podle mě dopadnout tím, že by jak to máme v prohlížečích. Prostě Chrom něco prosadil čistou silou vůle a Vsout je teď podle mě jako v podobný pozici a ostatní jsou na něm jako hodně závislí, protože furt jako je to schválený v korporátech a tak. Schválit něco novýho je prostě těžký. >> Jo, jo, to určitě jo. No, tak jako uvidíme. No, mě třeba eh ještě zaujalo, eh, nevím, jestli jste to zkoušeli, ale Kurzor vlastně taky vydával novou verzi před týdnem nebo dvouma. A já se teďka trochu vracím k té Jirkové otázce, jak by jako vypadal ten jako ideál, to ideální ide a podle mě ten kurzor jako k tomu je jako nejblíž, že tam máš jako ten to agent view, kde jenom prostě píšeš a už tě v podstatě jako nezajímá ten kód do nějakého jako detailu a myslím si, že to je ta cesta. Myslím si, že vlastně antigravity se to rozhodlo dělat jako s podobným stylem, ale úplně ty dvě věci jako rozdělily, že máte jako jedno jeden window pro řekněme agenty a druhý pro ten kód a a jako je to je to separátně. Eh, ze začátku mi to přišlo dost hrozný a nelíbilo se mi to, ale čím víc jsem to jako používal, tak mi to vlastně dávalo smysl, že ty dvě věci jako nejsou spolu a jedno řešíte tam, jedno jedno tam. Tak je to jak když jako já jsem zase zvyklej třeba používat jako terminál a mít jako ID otevřené jako úplo. Tak takhle mi to jako nějak připadalo, že UXov je jako podobná situace. To mi přijde strašně důležitý, protože tohle, já jsem to zmiňoval v minulým díle, Michael Arnalding, kterej stojí za effects, tak v podstatě má vypnutý i suggestions, protože on buď chce psát kód sám na sebe a nebo chce mít ty agenty. A proto podle mě to dává smysl rozdělit, protože ty modely, který dělají tu suggestion, tak inherentně musej bejt blbější, protože musej bejt rychlejší. >> Jo, to je strašně dobrý point. teďka říkal, protože jako ty sestina těch modelů úplně nesnáším a většinou jakože už je nebo ne, většinou jako ignoruju jako nějakou část, protože to je fakt blbost a nelíbí se mi to a někdy mě to i otravuje, protože vím, že nějakou věc jako napíšu třeba rychlej, třeba typicky nějaký jako HTML stale windowem je strašně rychlej jako napsat, když už když už to jako umíte, že to tam prostě nasekáte a tak, ale jakmile to začne doplňovat ty klásy a tak a není to přesně ta, tak vlastně tam zpátky, tam zpátky, tak tak mi to přijde to flow jako pomalejší s tím s tím agentním doplňováním, než kdybych si to napsal sám. No ok, tak pojďme dál. Tak máme tady jednu takovou otázku, nad kterou jsme se domluvili asi těsně před nahráváním, ale položil jsem ji já, protože vlastně teďka jsem dva týdny nesledoval vůbec nic ohledně AI a chtěl jsem i tento díl využít k tomu, abych se trochu nachytřil a využil vás. A napadlo mě, že za dva týdny se toho určitě stalo tolik, že v tomto světě je to tak dva roky. Tak mě napadlo se vás zeptat, pokud byste teďka stavili e nějakou jako aplikaci, tak řekněme jako jaký AI nebo celkově jaký stack byste k tomu zvolili, jak byste postupovali a podobně. Klidně to někdo vykopněte a můžeme pak se o tom pobavit víc třeba do detailu. >> Asi podle mě hodně záleží, že co za aplikace bys stavil. Bude to chatbot nebo nějaký našeptávač nebo agent. To strašně záleží, >> jo? Tak řekněme nějakou prostě klasickou club aplikaci, kde chci nějakou websitu nějakou webovou apku, kde nevím se budou ukládat nějaké data a to se následně uloží databáze, lidi se tam budou moct přihlásit a prostě takovou normálně nějakou SAS, řekněme aplikaci, >> jo, že teďka vlastně myslíš využití AI k vi codingu, že potřebuješ udělat klasickou aplikaci pomocí AI, ne dát AI do klasický aplikace. Jo, můžeme začít tím jako využitím, ale i tím stackem jako třeba, který bys pro to použil, protože hádám, že nebo jsem četl jako, že je lepší třeba využít určité frameworky nebo určité technologie, protože jsou lepší kvůli tomu, že mají třeba víc exampleů na webu a podobně, takže já s tím dokážu líp pracovat nebo mají lepší dokumentaci a podobně. >> Já můžu dát za mě úplně jako konkrétní stack. Prototyp bych udělal přes makaly. To bych si stáhnul k sobě a do Kinu ve VS Codu bych si dal bych využil Gemini 3. Teďka to úplně nový a vlastně bych to vibe codoval pomocí Gemini 3, ale hodně bych se dával pozor na tu architekturu. Připadá mě, že pokud jako, že člověk musí rozumět tý architektuře, protože vždycky narazí na nějakej pomyslnej strop jako do kterýho to AI dokáže táhnout a jako hodně bych tohleto řešil. A zároveň bych měl hodně dobře zmenežovanjý git, protože to je prostě něco, kde člověk musí mít pořádek, když dělá přes AI. Jo, jsem se chtěl jako zeptat, že Makali využívá stack, že jo, využívají jako NextJz, myslím. Pak mají konvex na backendu a nevím, jestli použ no konvex vlastně i zároveň jako databáze, že jo. No, mají jakože nějakou databázi tam, takže Takže to je všechno. Takže s tímto stackem bys byl jako v pohodě, jo, že seš jako rozhodnutý, že dál s tím pracovaty. Jo, jakože já bych, já jako většinu stacku teďka používám super base, ale jako nejsem serverář, z toho to možná jako vychází. Zároveň mě připadá, že jako ten next je podle mě jako úplně jednoznačná volba jako dneska na webovou aplikaci a určitě bych použil Typescript jako pro jakoukoliv velkou aplikaci si myslím, že prostě to je úplně bez diskuse. A pokud by tam v tý aplikaci byla nějaká integrace AI, to asi záleží, jako buď by to byla klasická aplikace jenom udělaná pomocí AI, ale pokud bych do toho ještě zároveň měl třeba nějakej chat nebo nějaký jako něco, tak bych si hodně dával pozor na to oddělení tý vrstvy těch promptů a tý vrstvy toho běžnýho kódu. To mně přijde, že se dneska hrozně podceňuje. >> To je zajímavej point. Mě mě já bych se doptal k tomu, e, proč bys z jakýho důvodu dáváš přednost Gemini 3? Mám s tím hlubokou zkušenost. Dneska jsem to zkoušel. Teda takhle já jako to mám tak, že já se vždycky snažím jako rozdělovat tu, jak jsem na začátku říkal, že prostě mně přijde, že ta vrstva toho modelu, toho agenta je jako něco jinýho a já jako na jako jako editor kódu používám VS Code, protože prostě v něm mám všechno a jako nechce se mě úplně přecházet do jako do kurzoru nebo do těch jako nových. Nad tím mám kurzor, což je prostě jenom plugin do VS codu a kurzor umí používat libovolnej model, nebo asi ne úplně libovolnej, ale má tam jako adaptér pro různý modely a tam jako hodně zkouším jako tam jako reálně to mám tak, že každej den nebo každý týden jako jedu přes třeba tři různý modely a jako poměrně jako hluboko je zkouším a snažím se zjišťovat jejich hranice a už to mám nějak jako probádaný, že co, že kterej model je dobrej na co a tím, že Gemina je tady od včerejška, tak jsem to jako dneska zkoušel a připadá mě, že ten Gemina je hodně silnej. >> Řekl bys, že je v něčím lepší než Solid 4,5. >> Asi těžko říct, jak oba ty modle jsou strašně silný, jako je levnější na tu samou věc. >> OK. Eh, já k téhleté otázce moc ne jakože asi by bylo potřeba jí nějak víc specifikovat, protože já se přece jenom pořád cítím jak spíš jako backendista, takže nevím úplně k k databázovým webovým aplikacím jako jak jak se jak se vyjádřit ke zbytku toho stacku, ale jako jasný, prostě přijde mi, že to, co říká Pavel, asi mám takový bias k tomu, že asi bych šel do JavaScriptových stacků obecně a tak. Jo, myslím, že doby PHP jsou prostě v tomhletom odvětví už asi pryč, nebo možná se pletu, dost stránek na něm ještě běží, ale je to spíš takový legacy, bych řekl. No. >> Počkej, React is New PHP, ne? >> E, ne, jako já souhlasím s Pavolem v tom, že bych udělal prototyp v Makali. To je prostě je to super. Já jsem rád, že jsem vlastně v tom dílu, kde jsme měli Petra Brska, tak jsem ho přesvědčil, že konvex je dobrá volba, protože to pak jako začali integrovat a ono je to strašně super. Dává to fakt jako hezkou administraci i přímo v tom makali na tu databázi, takže na rychlý iterace i na to, aby nemusel vkládat data přes a do databáze, je to úplně boží. A hlavně konvex se rozjede úplně triviálně, i když to chcu spustit u sebe. Supase, když jsem se bavil s lidma, tak je třeba osm dokrovejch kontejnerů a je to docela jako magie pospojovat dohromady, když to chcete selholstovat. Convex teďkom udělal to, že už to není ani doker, ale už mají i jako binárku, kterou takhle spustíte anticks, což je za mě strašně silný. A zároveň konvex je vlastně jako nadstavba nad MySQL nebo nad Postgressem. Oni teďkom jedou na planet scaleu, ale když to selfostujete, tak můžete vlastně jako cokoliv, což je za mě velká síla. No a když bych to jako rozšířil, jakj bych dal jzek, tak nextj bych asi zachoval, e, protože bych ho už měl z makali, ale na některý věci bych jako uvažoval, jestli ho dělat nebo ne. Teďkom bych dal šanci tanak start, protože už má stable verzi 1.0 konečně, nebo už má beta verzi, myslím, nevím, jestli už je stable. A tam jako jediný, s čím bojuju, je ví. Mně prostě v nepřirostlo k srdci. Pokaždý, když jsem s ním něco zkoušel v monorapu, tak tam byly nějaký problémy a jako třeba, že to nepodporuje eh Note 2. Prefixy pro importy jako FS a podobných věcí. Eh, což by se teďko mohlo změnit s rollownem, kterej jako snad brzo bude. No a další, tak ono se dá strašně moc minimalizovat ten stack, když do něj přihodíte ten stack a efekt a pak nepotřebujete zot, nepotřebujete jako x dalších knihoven a e vyřeší to strašně moc věcí, jo, ten stack tam má, že jo, tabulku, má tam i nějakou tu e knihovnu na rate limity a má tam ten stack query a podobný. A efekt ten zas řeší strašně moc ty serverový záležitosti. A rok zpátky bych řekl, že pokud chcete dělat s efektem, tak nebo s ačkem, tak efekt není dobrá cesta, protože to aičko v tom dělá strašný vrkule. Jenže teď se to začíná pushovat stále víc dopředu a Michael Arnaldy na zdil super lifehack, kterj se jako strašně rozšířil po Twitteru a to je to, že on si do submodulu naklonuje celý efekt repo a potom řekne aičku, tady se uč, tohle je prostě ta best practice. A doporučujou to i na další knihovny. Jako když ta knihovna nemá dostatečně dobrou dokumentaci nebo je moc komplikovaná, tak prostě vezmu GPT5 Codex, udělám ten submodul a řeknu jako make a zrovna kodex je v tomhle extrémně silnej. On si prostě jako prochází sám node modules a když to dám takhle ještě bokem, tak to bude o to silnější. Ty jo, to je fakt super point, jakože takže ty prakticky si jenom jako uděláš submodul, řekneš jako jáu, hele, tady to prostě dělej to podle tady tohoto, de it a už jako je to v pohodě, jo, už to nevyrábí nějaké blbosti, >> jo, protože to má jako jasný příklady a hlavně efekt má spoustu věcí nezdokumentovanejch nebo jsou jako tam někde strčený třeba práce se streamama a podobný věci a v důsledku i lidi, co dělají s efektem dlouho, jako Dylon Malero, kterej teďkom přešel s Vercelu do Cloudfu, tak eh říká jako, že jeho zdroj pravdy je prostě si otevřít Repo. Mě to trošku připomíná, jak když jsem jako před sedmi rokama pracoval s Ray, taky nejjednodušší bylo si otevřít repo Relay, než se snažit číst dokumentaci Facebooku. >> Tak možná zmizí potřeba eh developer dokumentací a bude jenom kód, no, který jako vlastně zdroj pravdy největší pro tyto repozitáře. Mě k tomu vlastně jako ještě napadá taková jako věc, že tady ten problém vlastně developeři často řeší jako ze dvou různých stran. Ta jako jedna strana je taková, že mám nějakou knihovnu, kterou chce použít, ale jako není k ní dobrá dokumentace nebo prostě není to, není to NextJS nebo React jako se kterým jako umí každej model pracovat, ale je to prostě efekt TS nebo jako něco specifickýho a já potřebuju, aby ten jako můj model s tím jako uměl dobře pracovat, aby mě tam necpalo něco generickýho, ale to, co já chci. A pak jako ten samej problém z druhý strany je, že já sám vyvíjím knihovnu nebo nějakou technologii a potřebuju, aby moje AI nebo aby obecně AI rozumělo týhle tý mý knihovně a umělo s ní pracovat a nenaměňovalo mě ji za něco jinýho. A a a a a připadá mě, že jako vysloveně, jak existovalo třeba Cell, tak nebo developer eh developer relations, tak jako bude existovat někdo, kdo bude jako na produkty třetích stran psát návody, který budou specificky pro AI, že to jako, že nějaká takováhle potřeba na tom trhu vzniká. To si myslím, že už jako začínáme přeskakovat, že jako dřív než se to objeví, tak to zmizí, protože jak se bude vyvíjet rychlost eh toho developmentu, tak ten člověk prostě nebude stíhat držet tempo a bude v důsledku rychlejší, aby to AI zobalo rovnou z kódu, když to bude dostatečně stabilní. A to mě trošku přináší na přivádí na věc, kterou jsem zapomněl a to je code wiki od Googleu. Je to něco jako deep wiki a tam prostě nahodíte repo dělá přímo z toho repa dokumentaci a nějaký vizualizaci a tak dále. To si myslím, že bude jako hodně souvisit s tím směrem. Oznámili, že to bude brzo fungovat i na private repozitáře, že si z toho budete moct udělat takovouhle dokumentaci. >> Mhm. To je zajímavý. Mně v téhle souvislosti se připomněl startup Tesle IO, který vznikl asi před rokem a půl možná a oni podle mě dělají něco něco podobnýho a řekl bych, že může jim to přinýst, pokud by se tady tahleta Viky rozběhla, může jim to přinýst nějaký potíže, jenom odbočka. >> A co dělá Tesla AI? Jakože podobně to co Kwicky, jo, že ti to z kód vygeneruje dokumentaci. Eh, v podstatě to dělá takový, jo, takový snipety, který jsou AI friendly a na základě nich můžeš poměrně efektivně vytvářet jako kód spolehlivě, že, že vlastně dokumentují knihovny v podstatě nějakýma útržkama relevantním. Já mám ještě Petře, tys tady posílal do chatu, že používáte Zig. Tak mě možná jenom zajímalo, jako nikdy jsem to nepoužíval, znám to, ale jako ten use case a jak AI pracuje se Zigem, jestli jako v rychlosti to můžeš nějak jenom okomentovat. >> Jo, já jsem tam ten Zig uvedl čistě jako pro formu, kdybych potřeboval něco high performance. Ono to má několik důvodů. Ban je v zigu, takže ten bridge je tam jako triviální a zig, tak je takový jako lepší céčko. Teď mě jako céčkaři ukamenujou samozřejmě, ale eh ono jako zig přirovnává spíš k c, kdež to rast k C++. Takže když už bych potřeboval performance, tak jdu do zigu. Když nepotřebuju performance tolik, tak mi stačí ban, protože ban je jako pekelnej. jako Jaret je magor a to co s tím jako dělá, že eh tam jako v některejch benchmarkích třeba i na e httpý server a tak, tak ban už je na úrovni Goučka. Proč bych já přicházel o benefit absolutního totálního typescriptu s performance modulama v Zigu, když jako tam není důvod, jo, prostě Typescript vyhrál a efekt na to sází. >> Cool. Tak jo, tak díky za komentování. E, dává to smysl. A tak pojďme se trochu přesunout k té druhé části té otázky, co jsem měl. Probrali jsme ten jako stack, co byste použili, takže next, konvex, podobně. A teďka spíš jako jak byste vyvíjeli, jako jaké to byste použili, proč a a podobně? >> Je to zatížený podle mě, že každej z nás má nějaký oblíbený kombo a asi tím, jak si to vyladíš, tak potom se toho nechceš vzdát, pokud tomu nemáš fakt dobrej důvod. E řekl bych, že jak se tak dívám, tak každý z nás používá nějakou jinou kombinaci, že třeba vím, že Pavol používá Cline hodně. E, Petře, ty nevím. Já třeba používám jako kurzor a cloud code a teďka nevím, no. Hm. Asi by bylo dobrý to nějak porovnat systematicky, >> ale podle mě to jako nejde srovnat, protože tam furt jako měněj ty věci na pozadí, ať už jsou to systémový prompty nebo nějaký implementace nebo něco. Ale já bych ještě chvilku zpátky řekl, kodex je super, protože za mě kodex s kodexem funguje jako velice dobře, ale pak se jako podíváš na to, co tam udělali s tou limitací toho to a už je to zase vá. Takže proto říkám, že bych použil to nejlepší. A jak bych to určil? No, takže bych si jako firma vytvořil nějakou sadu benchmarku na ten můj stack a s tím bych pracoval a potom bych to jako evaluoval. A pak mi je jako v důsledku jedno, co to bude zejména u těch terminálovejch nástrojů, protože eh u ID chápu, že lidi jako nechcou switchnout, protože mají svoje klávesový zkratky, mají svoje rozložení, na který jsou zvyklí a jsou lidi, kteří doteďka používají ideu. Já nechápu proč, ale budiž. Nicméně, nicméně když najela vlna AI, tak někteří mi klienti přešli do duálního módu, že ideu používají na ty manuální věci, ale VSout a terminálový věci používají na ačka. Jak byste třeba přistoupili k psaní těch jako instruction files, jako je Agents MD a podobně, protože s tím jako hodně teďka neexperimentuju, ale četl jsem si nějaké články, že jsou i firmy, které jako se snaží ten Agents MD nebo jakýkoliv jako jiný název vyladit úplně do toho detailu, že udělají nějaký jako prototyp a pak si jako právě evaluují právě jaký kód jim to generuje a tak se to jako snaží jako jako vylepšit. Tak eh máte s tímto nějaké zkušenosti přímo? No jako napadlo mě to párkrát udělat a myslím, že jako zrovna já pracuju na cokích jejž rozsahu tohleto nedává úplně velkej smysl, ale umím si představit, že jakože ono to je ono to je trošku možná dražší ze začátku, než si než si několikrát zopakuješ, uděláš si nějaký statistiky a tak, ale dokážu si představit, že se to může vyplatit, zvlášť u velkých CB a jako když je tam toho kódu fakt Fakt fakt hodně. >> Já si jako myslím, že >> ono je to vlastně strašně těžký, protože už teďkom eh znám lidi, kteří mají samostatnej cloud MD a samostatnej agents MD file s j s jinejma instrukcema, protože to prostě jinak funguje s těma modelama. A >> teď je jako otázka, jestli se budu unifikovat na jeden stack a vymazlím si jedno řešení a pak vyjde Sonec 46 nebo GPT 51 a zas to budu muset promutovat jinak. A nebo to prostě pohrnu tak, že pojedu dopředu, nastavím tam striktní kontroly a vlastně jako mně v tuhle chvíli je jako relativně jedno, jestli ten task zabere 10 nebo 30 minut, protože jich prostě jenom nastartuju víc. >> Do nějaký míry řešíme vlastně jako podobnej problém v prombooku, akorát ne v tý doméně programování, ale jako obecně v jakýkoliv expertní doméně. A připadá mě, že jako programátoři nebo obecně vývojáři maj jako jako výhodu a nevýhodu. Ta výhoda je, že jako že se s tím chtějí hrát a jako rozumí tomu, jak to funguje a vědí, jak ty instrukce psát a rádi si s tím hračičkujou. Podle mě jako z toho vyplývá jako výhoda, že to umí a nevýhoda je, že se v tom strašně hrabou a že vlastně jako není nějaká potřeba, aby tam vznikla jako rozumnější abstrakce. Připadá mě, že zase já jsem jako strašnej tlačič abstrakcí, ale připadá mě, že je tady nějakj jako model. Nad tím modelem ježí nějaký systém, ten má nějaký jako nějaký instrukce a teďka a pak je tady nějaká jako doménová potřeba tý firmy a teďka ty instrukce by se měly jako přepisovat z tý doménový potřeby tý firmy, ne? Já by si to jako, že připadá mě, že to, že si jako firmy teďka píšou agents MD a instruction file a ještě něco, je na podobnej způsob, jako kdyby si každá webová stránka psala svůj vlastní JavaScriptovej framework do nějaký míry, což se dělo jako před 10 lety. To je zajímavý jakože jestli jestli to, co to co říkáš opravdu je to na na až na takový úrovni e abstrakce nebo nebo ne. Já to neumím rozhodnout v tuhle chvíli. >> Já jsem v tomhle jako hodně radikální. Já jsem jako hodně radikální prosazovač abstrakcí a vrstev, ale ale jako je pravda, že možná jako možná jdu někde jako přes čáru. Možná jako někde někde to vnímám jako výrazně víc, než by to jako mělo být. Za mě jako ty abstrakce, tak jako na ty taky bacha, že jo. Dneska se podívejme na firmy, který se rozhodly jít do Longchainu a tam jako zejména Longchain s Typescriptem, to je jako bylo to peklo tehdy a vlastně se to jako nezměnilo. Takže jako abstrakce, ano, ale do jaký úrovně a kdy to dává smysl? Jo, za mě jako mezi těma abstrakcema musí bejt nějakej bridge, kterej bude fungovat. Proto jsem jako zmiňoval to e ACP, proto tady máme nějaký jako A2A, MCP a tak. Takže myslím si, že pokud tam vznikne nějakej jako standard, kterej tohle bude umožňovat, aby to nebylo vázaný na jednoho providera, tak to bude OK. Ale do tý dobych jako nezvedal ty jako úrovně abstrakce. pokud bych jako se do něčeho vendorlokoval, jo, mám třeba klienty, kteří by jako strašně rádi zmigrovali některý věci a velkou část Coase mají ve 4GL, protože je to prostě jazyk, o kterým IBM řeklo v 90, je to poslední jazyk, kterej kdy budete potřebovat. Akorát to mysleli tím špatným způsobem. Jo, jo, takových posledních jazyků už bylo, ale to by mě jako zajímalo, jako, že nad tím často přemýšlím, jestli vlastně fakt vznikne jenom to, co psal jako Andrej Karpaty už před dvěma lety, že jako English the hot test new programming language a nebo nebo to půjde úplně jiným směrem, že vzniknou jako programovací jazyky nebo další programovací jazyky jako eh, které půjdou třeba nevím jako plácám strašně směrem jako víc jako nějakých AI feč Čur, nevím, ale no jestli jestli jako už nebudou vzníkat programovací jazyky a nebo zůstaneme zůstaneme u toho klasického, že za dva roky zase se vydrá něco jinýho, za pět něco jinýho a tak a vlastně ten vývoj půjde dopředu, ale jenom ten jako jenom to AI vlastně bude nám pomáhat s tím vývojem toho kódu. bych byl jako vždycky hodně opatrný v tom říkat, že tohleto je poslední věc, protože jako to neplatí jenom v programování, vyřešením každý potřeby vzniká jako sada novejch potřeb a jako spoustu věcí, který my řešíme dneska, tak jako vůbec nebyly jako potřeba před 30 lety a myslím si, že za 30 let budeme jako potřebu řešit něco, co jako bude stavět na tom, co se dneska vyřeší vlastně a už a už to nebude potřeba. >> Je tak. No vždycky jako je těžký odhadnout e dnešní z dnešní jako úrovní informací, které máme nebo znalostma, co bude potřeba za 10 a jak vlastně celý svět bude vypadat. Možná možná to bude možná když si pustíme pak ten díl za 10 let, tak tady budem placet úplné blbosti, což dost pravděpodobně budeme eh v kontextu toho světa za 10 let. >> Jako vítáme vás u 660. dílu Cry. Pojďme se podívat na to, co jsme řekli před 10 lety. >> Jo, jo, checking. Sputný. V čem jsme se mýlili. Tak já mám ještě takovou jednu věc, která je taková jako adhoc, která mě teďka napadla, ale vracím se poslední dobou k čerpání novinek na e Hacker News. Určitě to jako známý e všichni znáte a začínám jako si všímat, že je strašně jako užitečné aspoň pro mě si číst e ty komentáře, jako vždycky, když tam je nějakej nový model, tak jako ani se nedívám vlastně na tu novinku, ale jenom pak si přečtu jako komentáře těch lidí, co o tom píšou a tak a je to jako poměrně zajímavý jako zdroj informací, protože jednak to vypadá, že to píšou lidi a ne jak na jiných jako eh sociálních sítích, kde prostě tu důvěru už to nemám, že to píšou jako lidi. Tak jak k tomu přistupujete vy možná jako kde čerpáte jako novinky? Vím, že Petr několikrát zmiňoval eh Twitter a linkedy toho eh pána, co dělá co dělá ty. >> Jo, jo. Ale tak máte nějaké další tipy, kde kde to sledujete a nacházíte novinky? Kromě kromě newsletterů, který odebírám a substu oblíbených autorů, tam asi e asi nevím. Já bych spíš řekl, že důležitý je co jako vnímám jako hodně hodně zajímavou součást toho téc AI bubliny je, že ty můžeš dneska spoustu věcí vyzkoušet díky AIU sám, který, který si předtím by ti zabralo třeba několik dní, než by sis nastudoval, jak se to dělá. A mně přijde, mně přijde, snažím se využívat toho prostě víc experimentovat, víc si hrát s věcma. Mně přijde jako dobreý zdroj informací, že vlastně No, tak přijde taková jako meta metavěc, že je podle mě strašně důležitý rozlišovat důležitý věci a nějakou pěnu dní s tím, že já jako já se snažím mít ten filtr nastavenej hodně nahrubo, že jako to, že jsem zrovna dneska jako opravdu intenzivně zkoušel Jemini, tak byla spíš náhoda. Ale ale jako opravdu se snažím rozlišovat to, co je jako fundamentální změna a co je prostě věc, co za co za měsíc už nikoho nebude zajímat. >> A jak to jak to poznáš? Máš jakože už nějaký báas, že toto víš, že prostě bullshit a už to prostě nebudu ani vnímat, nebo >> to je strašně dobrá otázka. Jakoby řekl bych, že jako ve většině případů mě to vychází, ale pak mám jako místa, kde jsem se jako fakt hrubé seknul. Takový jedno místo je jako když přišlo chat GPT. Já když vyšel chat GPT, tak já jsem byl trochu smutný, protože jsem si myslel, že mně přišel přístup do dalí, ale nebo že přišel přišel nějaký lepší dal říkal jsem si, ježišmarja, vždyť jako chat GPT, vždyť to je přece jako to samý, co můžu udělat už v GPT playgroundu, akorát je to zavalený v takhle jako blbým Uku a blbým UX. A strašně jsem jako podcenil ten fonfaktor toho toho chatování. A pak bych řekl, že jsem jako naopak strašně jako moc vnímal každou jako věc, každou novinku, každou jako blbost, ale jako do velký míry mně přijde, že ty jako důležitý trendy, to, že jakoby je třeba z reg, že že přišly MCP servery a tak, tak jsem jako chytil v tu v tu správnou chvíli. Pro mě jo, >> já to jako asi mám můj filtr je v tom, když to zmíní dost dostatečně relevantních lidí, který sledujou, tak tomu třeba dám nějakou váhu. Jo, jako když AI Coutking řekne tohle je nejlepší nástroj, tak řeknu hahaha, gratuluju. Ale když jako vidím lidi jako je, já nevím, Mitko, tam je to teda u těch lokálních věcí, on ty on ty jako Cloudovi nejede, když vidím, co používá eh Zakar Jackson z Bite Dance, e co používá Teas Kumar a Michael Arnaldy. A takhle, když se to jako prolne, tak ty typy vlastně nějak pospojuju do nějakýho celku, ale nemám jako jednoznačnej framework, kterým bych určil, že to je relevantní a zároveň někdy jedu jakoby strašně under the raider věci, jo. Já teďkom eh testuju nějaký nástroje už nebo už nějakou dobu, už jsem o tom mluvil přes ty git work trees, jo, tak teď to jako začal masivně propagovat kurzor, ale já jsem to testoval jako x měsíců zpátky, jo. Takže asi nemůžu říct, že je to jako zdroj novinek, protože často to nejsou jako novinky, který by vešly ve známost, ale spíš jako někde jsem na to u někoho natrefil, přijde mi to cool, dělá to nějakj random Němec jako garážovku. Tak to vyzkouší. >> OK. Jasně. No, prostě zkoušet nový věci, něco většina možná stojí za ale některé jsou prostě dobrý a a uchytí se to jakože asi tak, ne? A ještě jeden jako filtr mám, který u mě začíná být docela zásadní a to je to, jestli je to open source nebo ne, protože s množstvím AI slopů a podobnejch věcí, tak je strašně jednoduchý, jako je to blbý říct, ale je jako jednoduchý se dostat do Y combinatoru. Uděláte prostě chat IDE, který bude jako vám pouštět tiktokový reklamy, zatímco vám běží agent a dostanete se tam, protože je to jako virální blbost. Za mě jako filtr je, abych byl schopný v tom případně pokračovat, když to pro mě bude zásadní a nějak to jako dál rozvíjet a nebo abych tam mohl opravit nějaký věci, jo? Kdyby kodex nebyl open source, tak tam lidi neopravíj ten tool call. u Cloud COD, tak tam je jako ten problém, že oni to sice jako tlačej dopředu. Stále je to jeden stop nástrojů, ale komunita nad tím má jako relativně malou moc, takže nad tím spíš vznikají nadstavby. >> Já bych řekl, že je strašně jako důležitý umět jako rozlišit to, co je nějaká jenom prezentace a jako za čím je nějaká jako zajímavá a hluboká myšlenka. A já jsem se jakoby už třeba před pěti lety jsem jako pokud byla nějaká technologie, která mě fakt zajímala, tak to byl blockchain. A jako to už teďka ani neříkám moc veřejně, protože většina lidí si do dneska spojuje s různými schemy a podvody, ale tam mně přijde, že ten trh jako absolutně neumí jako, ale úplně zoufale neumí jako odfiltrovat to, že co je co je něco, za čím je zajímavá myšlenka a co je něco, co je jako jenom totální slop. A já mám jako trochu problém, že mně připadá, že se tohle začíná dít v AI, že jakoby, že že přesně jak jsi říkal, že vlastně jako plácne se prostě správný chatovací agentický rozhraní na úplně obyčejnej chat GPT a teďka jako najednou eh a najednou je z toho velkej hype, zatímco jako na druhý straně tady je někdo, kdo má třeba jako zajímavou myšlenku, jak to dělat jako jinak a vlastně na něm není vůbec žádná pozornost. To jo. No to je Ale tak to prostě asi bylo vždycky, bych řekl jakože s těmahle novýma jako technologiema. Vždycky tam bylo spoustu jako řekněme bullshitu a pak prostě po čase se to odfiltrovalo a začaly vznikat ty primární hráči. Já si myslím jako, že to bylo i stejně, když si pamatuju prezentaci eh z firmy, kde jsem pracoval, tak to bylo nějak vím, že ta prezentace byla z roku 2010 a tehdy byl strašný boom jako sociálních sítí a Facebooku a každé aplikace do sebe začaly jako implementovat ten jako social jako eh network jako nějaký nějaký jako vibe, že to tam jako vidíš, že můžeš chatovat s někým a vidíš tam svoje přátele a tak a byl okolo toho vlastně jako velký hype a dneska Dneska už to vlastně nikdo nedělá, protože proč jakože protože to nedávalo smysl a jenom tehdy prostě všichni chtěli mít jako sociální síť, tak to přidávali úplně do všeho i tam, kde to vůbec nedávalo jako smysl. >> No, nikdo to nedělá. Vrátili se lidé. Pozor na to. >> Jo, jo, jo, jo. [smích] To je novinka, kterou jsme měli e zmínit. Už tam máte profil? Ne, >> ne, ne, >> ne, ne, ne. OK. Tak jo. Hele, tak máme asi místo na poslední téma a to je tvoje, Petře, cos teďka napsal ještě? tak to klidně eh nějak rozveď. >> Jo, mě tam jako k tomu zase přivedla naše diskuze a to je jako formor chatování, jestli jako to je ten směr, protože samozřejmě tam jako tlačí věci máme jako MCPUI. Už jsem si zahrál svou první e City Explore game, kdy připojíte MCPUI do chatu GPT, řeknete, kde jste a ono to vyloženě tam jako generuje kus UI a vy tam jako nahrajete, hele, teď jsem tady a ono ti to řekne, to je Karlův most, pojď dál a dá ti to jako nějakou trasu. A teď je otázka jako tohle je chatování, do kterýho ale dáváme grafický rozhraní a je to vlastně ta správná forma a do jaký úrovně. Jo >> jo, jakože jestli to chápu dobře, takže ty něco napíšeš, ono ti to vygeneruje jako UI a ty pak jako napíšeš dál a takhle to jako postupuje, jo? Nebo >> jo jo a ono to jako umí interagovat zpátky, že když v tom UI klikneš na tlačítko, tak to vlastně pošle message do toho chatu. Takže je to vlastně jako obousměrná komunikace, jak přes tu psanou podobu, tak přes tu grafickou. A ono se o to snažilo jako dřív jakože AISDK bylo zajímavý už před dvouma rokama tím, že jste si mohli jako tam generovat kusy UI přímo do toho chatovýho rozhraní. A teď už to jako začíná bejt standard. Hostman to podporuje, chat GPT to podporuje a začínají to jako podporovat i další. A za mě je to strašně super tam jako mít tu možnost toho bohatýho rozhraní, protože třeba když bych jako vykresloval grafy, tak já nechcu, ať to dostanu v chatový odpovědi. Chci vidět v něčem, co se snadno zpracovává v nějaký infografice nebo v něčem. Na druhou stranu, když zadávám jako práci agentovi, tak ve většině případů mu to dám v textový podobě, ale pak tady máme make it real od TL draw, kde jako nakreslím ten diagram toho, co vlastně chci a ono mi to z toho plyve. Co je ta správná úroveň abstrakce podle vás? Já mám k tomu jako jenom point, že si myslím, že ta budoucnost, kdy to v podstatě toho UI jako generované jako on demand, jak ty ty vlastně používáš nevím co tu aplikaci, je jako ta budoucnost, že to bude jako hodně jako personalizovaná, nevím, jaké je to správné slovo. Přesně myslím, že to tady zmiňoval i Tomáš Mikulovk jsme ho tady měli něco něco podobnýho a jako dává dává mi to jako smysl, že jo. Ono se o to jako dlouhou dobu snažili všechny velké korporace jako Google a tak, že měli různé AB testy a prostě zkoušeli, která bara zebere nejvíc a tak. A tohle je jenom jako další forma nějakého tlaku na ty uživatele, aby udělali tu akci, kterou ten člověk jako potřebuje. A tím, že to UI se dokáže teďka měnit jako pod rukama těch uživatelů, tak si myslím, že to je cesta jako, kterou se kterou se půjde. No tak nebo tak to vnímám. Chci říct jenom v rychlosti, že co když to bude přesně opačně, že pokud by AI agenti měli opravdu takovou autonomii a takovou míru jako spolehlivosti, tak oni můžou vlastně dělat úkoly bez jakýhokoliv UI a to UI se může stát velice snadno zbytečný. Úplně >> to je to je na to jako vykonávání akcí, že jo. Ale teď jako co když to potřebuje konzumovat ten jako vnější svět, jo? To MCPUI je ta jako další úroveň. Samozřejmě jako jedna úroveň je, že budem muset nějak ovládat ty aplikaci. Tam souhlasím s tím, že to UI je spíš jako přežitek, i když jako šance, že by se do abry nebo pohody dostalo MCP je nulová. Jo, ale tam jako jdeme cestou nějakýho computer usage a podobnejch věcí. Nicméně, když to potřebuju prezentovat člověkovi, tak buď budu mít nějaký jako rigidní UI, do kterýho to budu lifrovat, nebo budu e mít předpřipravenou sadu komponent, kterou budu upravovat, což je podle mě ta jako smysluplnější cesta, než generovat UI úplně jako z ničeho. Protože když generuju UI z ničeho, tak tam to bude jako nepřístupný, budou tam prostě trapla s kontrastem nebo něco. Vždycky se tam něco najde. Kdežto když použiju ten náš jako design systém nějakej firemní nebo něco předpřipravenýho a budu tam mít ty constraints, tak mám jako větší šanci, že ten výsledek bude dávat smysl. A ano, na něco bych to asi klidně generoval, jakože čistě od nuly, ale spíš ne, spíš bych se držel nějakejch jako mantinelů, který mi zajistěj, že to bude použitelný a nebo že mě Evropská unie nebude soudit, protože můj eshop není přístupnej. Já bych jako řekl, že vlastně jako bych fakt rozděloval ty dvě jako vrstvy, že ta jedna vrstva je ten agent a ta jeho jako duše a to, jak on jakoby interně přemýšlí a pak jako z něj vede jako z něj vedou různý kanály, s ním se dá komunikovat přes web, přes email, může vygenerovat nějaký UI, dá se mu zatelefonovat, může se mu napsat na WhatsApp, ale stále je to ten samej agent, že jako bude podle mě muset vzniknout nějaká takováhle bariéra, si myslím. Tak to jako mi svádí na to, že prostě ten ager má nějaké appy a pak už je ti jako jedno, jestli s ním jako komunikuješ řekněme přes WhatsApp nebo přes UI nebo email. Tak jak >> zároveň tam jako asi budou určitý jako různý modality, že to nebude jenom ta modalita chatování, to se dá napojit přes jako různý appy na WhatsApp nebo email, ale budou tam třeba i modality toho jako mluvení nebo modalita toho jako generování kódu a tak. Jo. A další věc je, že jako jak říká Jan Lekun, který teďka odchází z z mety, že jako kterej blázen by založil nějakou rozumnou umělou inteligenci na LLMcích, jakože vlastně my jsme možná moc fascinovaní tímhle touhletou technologií zatím. A to je to, co říká Petr, že budem potřebovat nějaký jako senzorický napojení AI na reálnej svět. Tak uvidíme, jak to bude. Každopádně dneska už to ukončíme. Můžeme všem tyto věci prodat minule. Ještě jsme zapomněli zmínit DX Heroes, kterým děkujeme za za podporu. Zdáme do popisku. Nezapomeňte nás odbírat na YouTube a uslyšíme se a uvidíme se příště. Tak jo, díky, mějte se. Yeah."
businesses\ai-ta-krajta\aiTaKrajtaEpisodes.json:468:        "transcript": "Dámy a pánové, vítejte u nového dílu Ata. Dneska je to 16. díl a takže už je to vlastně skoro tři měsíce, co tady tuto věc provozujem, což jsme super rádi. E, všem děkuju za účast. E, na začátek jenom zmíním, že nás stále podporují Dex Heroes, z jsme super rádi. Prokope, chceš k tomu ještě něco říct, nějak nalákat lidi, proč by vás měli používat? >> E, díky Patriku. Já jsem rád, že se tady můžem scházet a jsem rád, že ten podcast může dál pokračovat, že máme posluchače, který to baví. Takže moc děkuji i vám za to, že tady se můžeme scházet a sdílet naše myšlenky, nápady. Super. Tak kdybyste potřebovali pomoct s čímkoliv ohledně developer experience nebo vývoj ve firmy, tak se určitě v Prokopovi a my můžeme začít s tradičkovým kolečkem. Tak co vás překvapilo minulý týden nebo v poslední době ohledně AI? Třeba Šimone, ty můžeš to vykopnout? Já jsem právě uvažoval, jestli se pro mě stalo něco takhle podstatného tenhle týden. Hodně jsem uvažoval o tom, jak určit horní hranice pro užívání AI naivními uživateli, ale to není úplně novinka. Myslím, že databich se stal Decaornem, to je fajn, ale nevím, jestli je to jejich valuace primárně kvůli jejim EA službám, nebo jestli prostě akorát dělají dobrou práci. Tak jo, ale data breaks nejsou na burze. To je jenom jako valuacea investory a jejich OK >> a horní hranice myslel sorry. >> Jestli můžu, tak já na to rovnou navážu, protože přesně tole jsem chtěl říct. Respektive včera vyšel příspěvek od CEO Data Bricks a Lihho Gocy ho a eh rozjížděj CD CD sk a cílej na víc než 100 miliardovou e valuaci a ta propozice týdle tý série, jsou tam jakoby dva zásadní milestoney, který chtěj doručit a jeden z nich je právě nějak podpora budování agentickejch systému. Data bricks je dlouhodobě silná v oblasti AI. Měly i akvizice, který s tím souvisej, takže todle je jako logický. Eh a druhá se týká nějaký e, myslím si, nedávný akvizice firmy, která dodávala něco jako transakční databázi postavenou na Postgresu a Data Bricks chce dodat, kde definitivně vyřeší problém separace computu a storage u OLTP databáze, jo, jako u data warehousu je to už jako běžný poměrně dlouhou dobu, ale u transakčních databází, kde se bavíme o velmi nízkech latencích a velmi vysoký konkurenci, je to neobvyklý. Moc takovejch produktů na trhu není. Takže todle je určitě zajímavý a myslím si, že to přidělalo vrásky na čele spoustě lidem, spoustě startupům, který se snažej budovat produkty v oblasti agentickejch systémů, že se objevil takhle silnej hráč, kterj zatím takhle silně jde a bude na to samozřejmě mít i spoustu peněz. Takže přetáhne spoustu kvalitních lidí, jak se to teď děje. E, tak uvidíme, co z toho bude. No, mně se zároveň líbí, že data bricks, když už jsme u nich, tak silně podporujou DSPY, který teď spadá podně. E, mají skvělej kurz na data learning pro ty, kdo byste se chtěli v tom zlepšit. Takže doporučuju, já ho teď zrovna absolvuju a za mě, za mě paráda. Takže takový jako praktický vhled. OK, super. Tak jo. Tak eh, to je zajímavé. Tak Jirko, třeba klidně ty pokračuj s novinkou. >> Jo, já teďka možná zabrusím e nebo zůstanu trošku v nějakých akvizicích. E, mě poměrně ne, že překvapilo, ale možná jste zaznamenali, že Thomas Domke, CEO GitHubu, e, vydal vyjádření, že chce odstoupit z funkce a souvisí to nějak s tím, že GitHub přestane být přestane být tou jakoby nějakou nezávislou, e, ne úplně formálně závislou institucí na Microsoftu a vlastně bude vstřebán do jejich AI divize, myslím, že Core AI se to jmenuje. Tak to je poměrně taková zpráva. Stará se 10 dní. Já myslím, že to vyvolalo docela docela jako velký reakce v v open source komunitě a tak je spousta lidí vyjadřuje obavy z toho, jestli jestli už teďka je definitivně prostě GUP jenom zdrojem dat, který Microsoft využije na trénování modelů a a podobně a a všechno bude za PayPem a já nevím co všechno. Takže to je takový docela zajímavý. A pak mě zaujala jedna studie, kterou vydal Meter, což je možná Šimu neznáš, model Evaluation and Research, prostě nějaká neziskovka založená jedním člověkem, který byl jako alignment researcher v Open AI. A ti vydali teďka článek o tom, že poměrně překvapivě používání modelů na zpracování tasku na velkých codebasích zpomaluje vývojáře. A to byla taková jako randomizovaná studie, kdy oni vzali, myslím 16 vývojářů, dali jim asi 246 tasků, kterých, kterých jako náhodně dovolili použít a nepoužít AI a nechali ty vývojáře odhadnout, jak moc si myslí, že je to AI zrychlí. A ve skutečnosti to dopadlo tak, že to asi o nějakých 19 % zpomalého průměru. Eh, což je jako zajímavý. eh interpretace těch výsledků jsou jako různorodý a možná, že těch faktorů, který tam hrajou roli, je hodně a je to takový jako ještě ne neprozkoumaný, ale rozhodně je to věc, kterou stojí za to sledovat. A vlastně přesně, když se tady bavíme o DX Heroes a a a tak, tak jako určitě určitě je dobrý e při adopci AI do do velkých Colbasí tohleto tohleto e sledovat. A já se vlastně těším na to, co Jacek řekne e jako svoje téma, protože to s tím nějak souvisí a myslím, že i Petr říkal, že že něco podobnýho dělaj. Tak konec pro slovo. Díky. >> Jasně, úplně v pohodě. Tak pojďme do to kolečko novinek a potom se vrhneme na to hlavní téma, které zatím necháme jako překvapení. A tak Prokope, můžeš ještě můžeš ještě zmínit nějakou tvoji novinku? Já zíním asi dvě novinky. První vezmu velmi zkrátka a to je, že jsem si všiml, že na Reditu každý začínal pomlouvat a nenávidět Kiro editor. A to z toho důvodu, že oni vlastně jako naonboardovali do toho do nějakýho beta testu spoustu, e, řekněme vývojářů, uživatelů a teďkom vydali pricing, kterej je nějakým způsobem netransparentní. Já přesně nevím detaily, ale vlastně mě to zaujalo, že mi vyskakujou pořád notifikace, že eh je to scam a že to podělali tím pricingem a tak dál. Takže tolencto mě docela zaujalo, že docela nadějnej nadějný ide eh si takhle podrazilo nohy. E ta druhá věc, kterou bych zmínil, tak je cloud code, kterej tady docela často probíráme. E vlastně docela sleduju, co se okolo něj děje, jak se to vyvíjí. A poslední dobou mě zaujali, že si tam můžete definovat vlastní output styles, což už asi nějakou dobu tam je. A to znamená, že pokud chcete výstupem jenom třeba analýzu a nějakou dokumentaci a nechcete implementaci, tak vám to cloud code připraví. Nicméně vůbec celkově ta práce, přesně Jirko, jak říkáš, že některý úkoly zpomalujou vývojáře, tak já si já se domnívám, že to je taky způsobený tím, že třeba O+ 4 a jiný takovýdle velký modely jsou docela pomalý na ten API Response a takže si hraju s myšlenkou, že bych Cloud Code e vlastně poslal na nějakej vlastní běžící model nebo na Open AI nebo cokoliv jinýho. Jimine 25 Flash a trošku jsem to zkoumal. Zajímavý je, že musíte vlastně mít nějakej middlevar, kterej má jinej respons, jinou odpověď, ale eh chtěl jsem se zeptat vás, jestli jste to třeba už na to nenarazili, neřešili a protože si myslím, že by to výrazně zrychlilo vlastně tu práci s cloud code. >> Tam podle mě záleží, jak k tomu jako přistupuješ. Ano. Eh, já jsem nad tím přemýšlel a na spoustu věcí, zejména když používám jako novější knihovny, já nevím, tantack form, mistak hook form a tak, tak to prostě zpomaluje. Musím to strašně moc instruovat a tak. Takže tam rozhodně to zpomalení cítím a nemyslím si, že zrovna tohle vyřeší menší modely. E můj přístup, který k tomu mám, je spíš, že chci jako paralelizovat, takže jet jako, já nevím, 10, 15 agentů paralelně, pak to kontrolovat nebo dalším agentem to ještě kontrolovat a tak. e, což je taková jako spíš úspora z rozsahu. E, co chci spíš zkusit v týhle oblasti, je nahodit 3 koder na cerebras, e, protože jako 2000 tokenů za sekundu je docela juicy a e teďkom jako lidi Quen 3 koder hodně dobře hodnotěj. Eh, a uvidíme, co se vyklube, protože a to je to je moje novinka, kterou řeknu až za chvilku, ať nekradu nekradu debatu. Já nutně neříkám, že by ten model musel být menší, jo, ale vlastně ve spojení s tím dynamickým měněním modelů podle toho, jestli plánuješ, co se má stát za kroky v rámci opus 4 plus codingu Sonet 4, co teďkon Cloud Code podporuje ten to přepínání, tak vlastně mít možnost využít opus 4 například na to plánování a potom nějakej, jak říkáš, GVEN trojku na na tu implementaci, tak si myslím, že tam jako to zrychlení nějaký bejt může. že nemám to ověřený jenom jako zatím je to v myšlence. >> No tak jo, tak to budeme sledovat a uvidíme. Jsem zvědavý, co Petře, řekneš na Quen 3 kóder, protože to chci taky zkusit. Tak tak se kdyžtak na tom ještě můžem povit. Každopádně, Petře, pokračuj, když už začal s s tou tvojí zmínou novinkou, jestli to je ta eh No, ta novinka, kterou ještě nemám otestovanou, je, že před 15 hodinama vyšel Deep Seek 31, eh, kterej zatím nemá produktovou kartu, nemá žádnej popisek, eh, a zároveň je označenej jako base, ale je v něm zapečenej reasoning, tak to docela jako máte lidi, že je to jako asi hybridní model. E a podle všeho je to sloučení jako R1 a V3, ale žádný informace k tomu zatím nemáme, takže na to jsem jako hodně zvědavej. E, ale vzhledem k tomu, že to, že to není eh srovnaný, tak mám ještě jednu menší novinku, která mi ale přijde zajímavější a to je srovnáváte někdy jako modely napříč nástrojem? Eh, protože jsem viděl parádní video, kde eh Gosuoder srovnával e function calling malýho Kena Quen eh A3B 30B toho toho mixture of experts a došel k tomu, že v RWat je ten model extrémně slabj, ale když ho používá třeba v open code, tak je mnohem lepší a to protože open code používá native function calling, kdežto ruk to dává do promptu. Mhm. Jo. No jako já osobně to nějak nesrovnávám. Nevím, jestli ostatní mají nějakou zkušenost, kterou můžou zasílet a nesrovnával jsem je takhle jako pečlivě, ale todle je super, že prostě někdo dělá ten benchmark napříč způsoby využívání a napříč tule. Tam se mi právě líbí ten jako Gosukoder, protože on na to dělá docela jako hezký žebříček a říkal, že je to poprvý, e, co se lokální modely, který jsme schopni rozjet na relativně běžnejch mašinách, dostali přes skóre 20 000, což je taky za mě jako docela docela klíčovej poznatek a říkal, že už je to jako konečně model, kterej se nebojí eh z těch lokálních pouštět i na složitější věci. A ty nůžky se za mě jako docela uzavíraj. Přijde mi, že nějaký jako skokový zlepšení v těch e frontier modelech vlastně nebylo. I když se všichni jako kasají tím, jak je to geniální, tak tam stále nevidím jako extrémní skok dopředu. >> Jo a to myslíš ty fronter modery jako Cloud, Open a podobně, jo, od těchle společností. OK. >> Tak jo. Tak dobrý. Tak máme úvodní kolečko. Zvládli jsme to docela rychle. A Jacku, můžeš vykopnout tvoje téma, o kterém jsme se bavili a zazdí nám tvoji zkušenost s učením lidí ve firmě používat AI. Jo. No a řekl bych, že jsme teprve na začátku, že to je tak, jak jsem si na začátku čet články o tom, že to je minimálně na rok eh úsilovný práce, tak teď po řekněme dvou měsících s tím začínám jako souhlasit. Eh co jsme za poslední dva měsíce udělali? E já jsem si vlastně i já jsem to konzultoval i s těch GPT mimochodem jakou taktiku jako zvolit na ty naše vývojáře. A e nakonec jsme se rozhodli zvolit kombinaci jako přístupů. Jeden přístup sedět s těma týmama, e druhej přístup připravit jim nějaký artefakty, aby byly úspěšnější. A to tam jsme na začátku a budeme pracovat na tom dál. Já o tom za chvilku něco řeknu. A komunikace e na všech možnejch frontách, jak ve sleku, tak máme třeba jako architecture club každej tejden. E shodou okolností za hodinu a půl. Eh o těhletěch věcech tam znova jako budu všem vývojářům něco říkat. E a kromě toho jsme ještě udělali servery a tam zase jako s pomocí chatpt a částečně z vlastní hlavy jsem vymyslel sadu otázek a a nějakejch jako možností na výběr a poslali jsme to všem vývojářům a pak jsme udělali detailní vyhodnocení. Povedlo se nám přesvědčit asi 80%, možná 85% vývojářů, aby to vyplnili, takže ty výsledky jsou docela hodnotný. No a teď vám teda řeknu, jak to jako dopadlo. Eh, je to tak zaprvý, že jo, good data jako je poměrně hodně komplexní ekosystém. E, máme dokonce jako dvě různý platformy, starou a novou, a lidi pracujou jako na všech možnejch technologiích a všech možnejch koutech firmy. A to AI se používá jenom v tom novým světě, v tom starým vůbec, ale to jsme jako tak nějak čekali. A přišlo nám jako, že větší adopce je v UI než na backendu, což má nějaký jako poměrně logický důvody. ty frontendový technologie jsou jako mnohem blíž jako těm LLMkům, mnohem víc trénovacích dat jakoby z nějakejch UI aplikací, frontendovejch aplikací. My máme poměrně jako vzácnej backend technologicky. Máme ho napsanej primárně v Kotlinu, e, ne v Javě, protože kotlin je jako přívětivější syntaxí a spoustou dalších věcí. A to je vzácná věc. Takže LLMka o tom vědí prd. A ta komplexita je taky hodně veliká. Asi si umíte představit jakože analytická platforma typu gooddata, co všechno jako musí dělat za složitý věci. My máme vlastně i vlastní jakoby metrikovej jazyk e místo se, abysme to uživatelům zjednodušili, což je jako další obrovská úroveň komplexity. Máme jakoby napsaný vlastní velice komplexní cashování, eh, postavený na Apachi er. E, takže ta komplexita je tam obrovská a ty ty ID a ty AI asistenti v ID si s tím jako nevědí moc rady a ty vývojáři udělali většinou jako dost špatnou zkušenost a pak k tomu získali nedůvěru a teď se jim do toho nechce a já to jako musím zlomit. Jo a v tý servě to bylo vidět, jo, jakože poměrně relativně dost procent, jakože třeba řeknu 70 souhlasilo s tím, že je to super na učení novejch věcí a na onboarding do těch komplexních codebasí. Na tom se shodli skoro všichni a furt ještě většina, ale už ne tak výrazná, se shodla na tom, že na dělání jednoduchejch jakoby gera ticketů, řekněme, je to taky furt ještě jako dobrý, že jim to jako víc pomáhá, než jim to ubližuje. Ale na komplexnější věci, eh, tam asi jenom 19 nebo 18 % lidí jako řeklo, že jsou schopný občas udělat s tím i něco komplexního, což je jako děsivý. Je to hrozně nízký a je to vlastně ten primární ta primární oblast, kam se teďka jako potřebujeme, na co se potřebujeme zaměřit a co potřebujeme zlepšit, aby ty vývojáři byli úspěšní i v týhle oblasti. A ještě jako jednu věc řeknu z tý servy, která byla úplně vlastně to je jako logický, ale přece jenom nás to trošku překvapilo a koukali jsme vlastně, jaký faktory, jaký aspekty těch vývojářů hrajou roli v tý úspěšnosti, jo, že vývojáři, který řekli, že jsou jako úspěšný, cejtěj jako, že jim to nejvíc pomáhá, tak čím se vyznačujou? vyznačujou se jako tím, že jsou na frontendu, nebo vyznačujou se tím, že používají nějakej programovací jazyk nebo prostě a těch aspektů tam bylo asi šest nebo sedm a ukázalo se, že nehraje roli vůbec nic kromě jedný jediný věci. A teď si tipněte, co to bylo. >> Seniorita toho člověka, >> ne? >> Taky si myslím, >> seniorita to není. Nevím, jestli se to dá jako kvantifikovat nějak jako v testu, ale jakože jak jsou jako otevření k novým technologiím nebo jakože zkoušet nové věci? Hm. To to jsme se jich neptali a může to jako hrát roli. Eh, tak já to řeknu, je to prostě jak moc tomu dávají šanci. E, >> jo, já jsem chtěl říct ochota věnovat se novejm věcema zadání. Jo, prostě ukázalo se, že lidi, který e jakoby odreportovali v tý survey e jako nejvyšší procento používání ze svýho vlastního jako developerskýho času, tak zároveň reportovali, že jsou s tím jako úspěšnější než ty ostatní. A to je vlastně jedinej faktor a to jsme i jako odprezentovali všem developerům, jako znovu jsme se s nima se všema sešli, prezentovali jsme jim výsledky tý servi a todle byla věc, kterou jsme asi nejvíc zdůrazňovali a říkali jsme jim, hele, podívejte se, když tomu dáte šanci, když to budete hodně používat, hodněkrát sfeilujete, tak se budete zlepšovat a nakonec dojdete jakoby do fáze, kdy už vám to jako bude víc přenášet e než vás to jako bude trápit, jo. Takže todle todle mi přijde jako naprosto klíčový a já to omlacuju vo hlavu těm našim vývojářům neustále. >> Jo, já mám takový jako navazující dotaz, že jak víš, že oni jakže nebo jak jste ověřovali, že oni jsou jako s tím úspěšnější, protože když tomu jako věnuješ víc času, tak máš takovej ten confirmation bias, že jako když do něčeho jako víc investuješ, tak tím jako to vrací jako ten jako reward a ty si myslíš, že seš úspěšnější, ale nemusí bejt jako úplná pravda. Tak jakože jaké tam bylo točně jako kritérium toho, že seš jako opravdu úspěšnější. >> Jo jo jo jo, to je dobrej point. A my jsme to v tý prezentaci potom zdůrazňovali, že eh jako je faktem, že se cejtíj úspěšnější, ale samozřejmě to nemusí znamenat, že jsou úspěšnější a že to budeme jako zkoumat v dalších iteracích. To je jako pravda. Ale už to, že se cejtěj úspěšnější, že tomu častěji dávají šanci, je pro nás jako pozitivní pozitivní fakt, s kterým chceme jako intenzivně pracovat, že jo, protože a já doufám, že se tady všichni jako shodneme, že objektivně lze říct, že eh je potřeba prostě do toho investovat co nejvíc času, aby se to člověk naučil, jo, že prostě to učení se jakoby správně pokládat otázky a rozumět jakoby tomu, jakým způsobem e s ním interagovat, jak ho nutit třeba ty věci rozsekávat a tak dále. Todle všechno jsou skilly, který můžeme napsat na papír, ale když to lidi nebudou intenzivně dělat. To je jako když řídíte auto, jo? Můžete řídit auto první, druhej, třetí den a nějak jako dojedete do cíle a bude to strašnej stres a jakoby budete dělat spoustu chyb a budete rádi, že jste přežili. A když už máte ujetch 100 000 km, tak řídíte to úplně automaticky a vůbec nepřemýšlíte nad tím, že ho máte to AI na začátku požádat, aby to rozsekal na kusy nebo aby udělal jako něco něco jinýho. Prostě ty best practicesis už máte zažitý pod kůží a ani vlastně o nich nepřemjšlíte. A ty lidi, který tomu dají šanci jednou za tejden tolety instinkty nemaj a vlastně je to hrozně bolí a oni sam nechce se jim do toho, protože eh ten začátek je vždycky strašně obtížnej. No, >> mě by u tohodle dělala starosti kauzalita, že jako lidi, kterým se daří líp od začátku, pravděpodobně stráví víc času na tom. A zajímalo by mě, jestli je teda učíte tydlety best practices, nebo jestli nemůže všich. Jo. Tak já teďka ještě teda řeknu nějak rychle tu druhou půlku toho, co jsem chtěl říct. Eh, a to je eh, co dalšího jsme s těma lidma dělali nebo děláme. Eh, tak první věc jako, kterou jsem udělal, je nějakej centrální dokument, kde neustále všechny tydlety postřehy a bez practices a prostě jak používat ty idee, jak s nima komunikovat, jak je konfigurovat, tole všechno se tam permanentně materializuje. máme na to dedikovanej slekovej kanál, kde už jsou všichni vývojáři, úplně všichni a a opravdu se na to dívaj a sledujou ty změny, sledujou jakoby poznámky e nebo nějaký postřehy moje, který tam jako pravidelně dávám. E, třetí věc, rozhodli jsme se, už jsem o tom mluvil, že si i s těma týmama sedneme, takže já jsem strávil se čtyřma týmama s každým dva dny a skutečně jsem jim seděl za a koukal jsem, jak fungujou a občas jsem je jako prudil, že eh mají víc používat AI a pak jsem jim vlastně radil jako jak ho použít, jak se ptát, jak iterovat a docela A jako ta zpětná vazba potom byla taková, že to vnímali docela pozitivně, že je to vlastně nějkam posunulo, že jim to ukázalo, že když se jako ptaj správným způsobem, takže jsou jako výrazně úspěšnější a že s tím vlastně můžou dělat i větší věci, než si mysleli, že tomu jako můžou dávat větší šanci. Takže to sezení s těma týmama v tom já chci i pokračovat, protože máme víc než čtyři týmy. E vybíral jsem si záměrně jakoby mix frontendovejch a backendovejch týmů a což bylo pro mě bolestivý, protože frontendů vůbec nerozumím. A e takže todleto určitě bylo hodně hodnotný. A poslední věc jsou ty artefakty, o kterejch jsem mluvil. Jo, já už jsem potom tady myslím mluvil jednou, že děláme nějaký kurzorul fily a podobně. To je věc, v který jako intenzivně pokračuju a mám z toho několik jako rychlejch postřehů. E, vymyslel jsem nějakej jako novej design těch rule filů a aby tomu vývojářovi co nejvíc pomáhali. Jsou tam samozřejmě nějaký doménový rule filly, který popisujou jakoby ten background toho repozitáře, ale pak jsou tam i rule filly, který vlastně říkají kurzoru, jak se má chovat, například jak má vyhledávat jiný rule fily nebo jak je má vytvářet nový rule filly a tak podobně. Todle se mi povedlo udělat pro jako podstatnou část naší code basee. To znamená pro celej backend a úplně celej frontend. E na tom frontendu jsem samozřejmě iteroval s frontendovýma lidma, protože tomu nerozumím. Na druhou stranu 90 % těch rule filů jsem vlastně vytvořil tak, že jsem nechal kurzor nebo winserf to vytvořit a pak už jsem to jenom korigoval. Eh, a pak jsem to samozřejmě nechal zrebulovat ty frontendový lidi a je to zamergeovaný a těm lidem to už jako pomáhá, ale je to jenom první krok, jo. Eh, ukazuje se, že některý ide třeba vůbec nepodporujou koncept jako více rů filu, který se aktivujou jakoby s různejma eh typama triggerů. Eh, například Intellig Juni to neumí, to má jenom jeden obrovskej markdown, což je nepoužitelný. Ale ukazuje se, že co všechny ID podporujou, je MCP server, jo? Takže já teďka vážně uvažuju o tom, že jako další krok eh z těch rule filů udělám MCP server tím způsobem, že vlastně ty rule fily budou buď resourcey nebo tooly. A to mi nejenom umožní to dát do jakýhokoliv idee, ale co je ještě zajímavější, je, že vlastně ten MCP server může jako dělat nějakou logiku navíc, jo, takže ten systém výběru třeba těch pravidel a inkorporávání jakoby tý knowledge jako prompturu do do těch AI assistentů ID může bejt mnohem dynamičtější a mnohem silnější. Je to jako hypotéza. rád jakoby si poslechnu i váš feedback, co si o tom myslíte, ale tole bych chtěl asi udělat jako další krok, hned první a tím vlastně začít podporovat úplně všechno. No a a pak dál budu pokračovat v tom, co jsem tady dělal, jo, prostě furt pracovat s těma lidma, furt do nich jako šťouchat, furt je pozorovat, furt jim radit. E, to bude ještě trvat měsíce a a vlastně je to docela zábavná činnost ty lidi pozorovat. Můj ještě poslední postřeh možná je, že při všem tomhleom, co jsem teďka dělal, jsem se toho strašně moc naučil, jo. Například mám mnohem větší vhled toho našeho UI stacku, jo, to jsem předtím jako vůbec neměl a obecně při vlastně revizi těch RU filů a při interakci s těma vývojářema jsem proniknul do spousty částí platformy, kde kterou jsem jako zapomněl a takže mě samotnýho to hrozně obohatilo. Já mám k tomu jeden ten point ještě k těm jakože díky za to za to za to, cos říkal jakože spoustu zajímavých věcí, které i já sám teďka určitě využiju, ale jedna věc, co mě zaujala s tím MCP serverem, že mi přijde, že by to bylo super fakt mít, protože jako dost často přemýšlím nad tím jako jak pak vytvořit v repozitáři, kde e který používá víc lidí, používají kurz a pak v surva různé prostě ide, tak jakože mít jeden MCP server, který jak říkáš má jeho logiku a based on jako ID si pak stáhn ty ty ecule fily nebo instruction MD pro VS a podobně by bylo asi jako to nejlepší řešení, které teďka jako jako vidím, což je super point. Ještě jsem zapomněl zapomněl jsem ještě podotknout, že jsem nechal AI napsat pythonovej a javascriptovej script e a precomit hook, takže winserfový e rule fily se automaticky konvertujou z kurzorovejch rule filů. A když člověk lokálně dělá comit a něco se změní v těch kurzorovch, který jsou teda primární. E, ale je to přesně tak, jak říkáš. A hlavně tam je problém jako cross repository, jo? Už teď vlastně v tom backendu a frontendu existujou skoro duplicitní rule fily, takový ty obecný pravidla, že jo, jak se má chovat a udržovat to duplicitně oprus. Takže ten MCP server vlastně řeší i tenhle problém, když máš těch repozitářů hodně. s tímhle s tímhle jako sdílením a přepisováním, tak tam já teďkom plánuju vyzkoušet a posílal jsem link, tak to dáme do popisku. Je to repozitář Ruler a cílem je právě umožnit ty pravidla přeposílat mezi jednotlivejma e systémama a mají tam jako docela širokou podporu. Mají tam od GitHub copilota až po GUS a mají tam nějakejch jako eh, já nevím 15 skoro 20 e systémů na podporu, takže to se rozhodně chystám vyzkoušet i kvůli tomu, že sjednocují konfiguraci MCP, což je taky eh za mě důležitý. Včera jsem si hrál s Kodexem a kterýho idiota z Open AI napadlo, že všichni jedou Jason a oni si tam jebnou Tomou prostě jako WTF. >> Todle je přece todle je přece známej problém, že každej druhej vývojář potřebuje takzvaně proti větru a udělat to líp než všichni ostatní. >> Tole bude peprnej podcast díl. Hele, e, ono ještě kromě jako sdílenejch pravidel, tak já vlastně jako řeším eh, taky zatím neaktivně, ale už jsme s jedním zákazníkem řešili nejenom pravidla, ale vlastně identitu toho uživatele, kterej to AI právě používá. To nejenom identitu, že seš, nevím, Petr, Jacek nebo Jirka, ale vlastně tvůj ton ofice, tvojí historii a tvůj vlastně jako kategorii toho, co ty zrovna potřebuješ. Protože pokud prostě píšeš celkově, jo, ty MCP servisy se dají používat kdekoliv, pokud ty píšeš nějakej dokument, nevím, řekněme nabídku, potřebuješ to mít v nějakým stylu. Pokud ale píšeš kód, tak seš JavaScriptťák, Typescripťák, nevím, miluješ eny, třeba všude dáváš eny, tak prostě je to tvůj styl a vlastně mít i todlencto v rámci nějaký identity, tak e tošíme právě taky. Tak nevím, jestli třeba i Petře, když jsi posílal ruler, že plánuješ vyzkoušet si nezahlíd něco směrem k tý zprávě identit v rámci MCP. Ne, to jsem nějak jako do detailu nezkoumal, ale když si když jsi zmínil to nějaký jako ukládání toho stylu a tak, tak mi vyvstal na mysli refect AI, kterej jednu dobu byl docela vysoko v SW bench a oni jsou zajímavý v tom, že si to můžete spustit na AVSu, spouštět si tam i lokální modely a že si to vlastně tvoří postupně tu eh paměť eh o těch lidech a jsou tam i veškerý statistiky používání a tak. Takže myslím si, že tohle je docela jako undere explored area. >> No, já jsem teda teďka zaznamenal eh zaprvý teda ještě jsem chtěl říct jako, že jsem změnil názor na to, co je prioritní ide eh v posledních týdnech a začal jsem našim vývojářům doporučovat kurzor a ne Winserf. A důvod není ten, co se teď kolem Winserfu děje, ale důvod je ten, že jak to hrozně intenzivně používám oboje, tak jsem zjistil, že ten kurzor začíná bejt opravdu jako lepší, rychlejší, prostě eh funkčnější, stabilnější než ten winserf. Jo, to je první věc. A druhá věc a to jsem chtěl právě reagovat tady na to, co jste říkali. Začaly mi tam vyskakovat žádosti na ukládání Memories. Memories je jako další fečatura, že jo, kterou oni maj. Dlouho jsem si ji nevšímal, ale teď to začlo jako na mě víc jako tlačit, ať to nějakým způsobem manažuju. A to souvisí s tímhletím, že jo, že vlastně si jakoby personalizuješ to tím, že si ukládáš ty memories, takže tvoje osobní rozhodnutí mají vliv potom na to, jak s tím kódem pracuješ a můžou bejt jiný než u jinýho vývojáře. Zároveň se mluvilo v minulosti o tom, že bys mohl na to udělat i server a že by se ty memori sdílely a že by se nějakým komplexním způsobem manažovali. A to už je možná to, co dělá ten refect AI, jestli jsem to dobře pochopil a asi se na to teda podívám, protože to sdílení těhletěch jako konkrétních rozhodnutí taktickejch během řešení jako konkrétních use casů, konkrétních jako gera ticketů, to je něco, co jako nemůžeš materializovat staticky do roll filu, že jo. To prostě vzniká za pochodu a je to hodně use case oriented, takže tady hraje, tady mi dává větší smysl featura tohodle typu. >> S tím kurzorem versus Winurf. Ještě bych chtěl dodat, eh, my třeba nám se stává, že nebo i vývojáři u nás nebo vývojáři u zákazníků, tak mají velkej problém vůbec jako eh přesedlat ze svýho oblíbeného ID na jiný ide. Takže třeba tam je skoro nemožný jako doporučovat kurzor nebo jim ukázat, hele, todlencto je ta cesta, kurzory nejlepší, protože mají prostě jako velkou velkou rezistenci v tom. Co mě ale teďkon zaujalo teda taky, když už do toho dodám, že kurzor vydal CL, jestli se nepletu. Zkoušeli jste ho? >> No vím, že ho vydal, ale nezkoušel. No >> to by to totiž je cesta, že jo. Cličko si pustíš clot code nebo kurzor Cla v čemkoliv a zkombinovat to vlastně s s Intelij nebo s VS codem, tak to je jako jedna z možností, jak bejt e nezávislej na tom, co který používáš. >> Hm. To je zajímavý. Takže jinými slovy říkáš, že když použiju kurzor CLI, tak dokážu ten kurzor embedovat jako do Intelij. Já jsem ten kurzor CLI nezkoušel, ale vím, že cloud code pustíš v jakýmkoliv terminálu a má konectne se na to ide, ve kterým běží. Mají vlastně jako když pustíš v kurzoru clot code, tak se připojí, ví, ve kterým seš souboru. Takže bych tolencto očekával i od kurzor CLI a dalších podobných nástrojů. No, ale furt, že jo, takový to, kdy ti to navrhne změny ve spoustě souborch jako v tom repozitáři a ty to potom reviewuješ v tom editoru, vidíš ten div a hezky jako můžeš e akceptovat, rejectovat jednotlivý části, tak takhle úzkou integraci s tím ide ti todleto nedá, že jo. >> To to nedá. To kurzor taky nemá. Tak já já jedu podle gitu, no. >> Mhm. Jo, já bych řekl, že jako časem se to tam dostane. Tam v tuhle chvíli jsme jako eh i v tý válce, že jo, eh Microsoft s VS Codem, tak má svoje apíko, který ostatní Extension nemají k dispozici eh na rozdíl od Gidabilota. Takže tam si myslím, že je to stále ještě jako ta válka toho, jako, že každej má svoje pravidla, každej má svojí konfiguraci, každej má svoje rozšíření VS kódu a ještě je v tom docela jako chaos. No, >> ale jak jste ještě, jak jste ještě zmínili ty jako ide agnostic řešení, tak tam mě právě zaujalo, co si tvoří e jeden týpek z Discordu e u Davida Strejce, tak on e oni ve firmě tvořej právě eh ide agnostic asistenta a to z toho důvodu, že tím, že už sami používají mírně obskurní jazyk closure, tak tam mají i velkou variabilitu lidí, takže potřebujou podporovat i EMAX a vím. A to už jako s tím pohoří většina nástrojů, takže eh do tohož jdou tak, že vytvořej to jádro a potom to adaptujou na ty další eh na ty další ID, což mi přijde vlastně jako eh super přístup eh pro to, aby eh se sjednotila ta interní technologie, která se dá rozvinout, ale zároveň se nemuseli eh lidi přečovat. Ono jako skočit z vsoudu na kurzor je vlastně jako strašně jednoduchý, zvlášť s těma jako migracema a tak, ale představa, že bych jako měl vzít nějakýho vimovýho fanatika a říct mu VM nemůžeš používat, tak e hledám jako kdy za mnou chodí nějakej vrah. >> Hm. To je to je fakt extrém. No, ale u nás jako stejnej problém existuje jako VS Code versus Intelij. Je to ještě okořeněný tím, že používáme ten cotlin, který funguje dobře jenom v Intellig Jay, takže tam jediná cesta byla je v tom nechat, v tom ide a jediný, co dneska jim funguje, je ten Winserf plugin, kterej je ale hrozně nestabilní a jako lidi, je to jeden z důvodů, proč lidi, co používají Intelij, tak míň používaj jako ty AI assistenty. No a Intelligent Juni stojí za prd stále ještě furt. Eh, takže to je prostě problém. No a MCP server by to samozřejmě taky řešil nebo něco takovýho. >> Já jsem třeba u klientů došel k tomu, že eh někteří jejich lidi fakt jako přešli do duálního módu. Prostě mají intelij na většinu, na co jsou zvyklí, ale aičko běhaj běhají v jinejch editorech. >> U nás je to naopak. U nás je to naopak. U nás je to tak, že A to je komický. Jo, já to sledoval. jsem to teď, když jsem seděl s těma týmama, jo. Eh eh primárně používají kurzor a dělají v něm tu AI práci a generujou třeba i kotlinovej kód a pak když chtějí udělat comit, když chtěj jako udělat gitovou práci, tak udělaj alt tabtigj, protože tam ten git management je tisíckrát jako víc convenient než v tom posraným VS codu. A udělaj to tam, že jo. Dodělaj to tam. Plus samozřejmě e tam dodělají i nějaký věci jako advance typu jako, že si pustěj nějaký komponent testy přímo z ID nebo udělají remote debug dokeru, že jo, na nějakou kotlinovou mikroservisu a takovýhle věci a prostě to dočistili to, co jako vyrobilo to AI. No, ale ten git management mě pobavil prostě jako ta developer convenience v tom Intel je obrovská. A je to fakt jako super, jo, pro prostě naprostýho lajka. Je to úplně jednoduchý na použití a má to neuvěřitelně velkej vliv jako na to, co se vývojář rozhodne použít. To by mě fakt zajímalo, co mají vlastně za gitový výhody, protože já jako jediný, co si vybavuju, je, že oni používají shelf místo stš a je to nějaká jako jejich alternativa a z toho jsem jako strašně roztl, ale >> tam je tam je to fakt jenom o tom jakoby, když máš ty změny a jdeš jakoby do toho gitagementu ve VS codu, tak musíš jako ty filly ručně stageovat, což když jako vyrobíš hodně změn s pomocí AI, tak je vlastně jako e, kterj jako nemusíš vůbec v inteligi řešit. A pak ta revize toho, co se stalo, je jako extrémně přívětivá a pak jako nedejbože uděláš commit a rebase a máš tam konflikt a řešení konfliktu ve vsu je jako prostě noční můra. To je jako prostě strašný. A ta developer experience nebo to UX jako v Intellig na jako řešení konfliktu je jako kulervoucí. To je prostě fakt jako nádherná věc, no. Jo, já jsem se teďkom konflikty snažil řešit tím, že jsem si nainstaloval novou strategy na řešení merch konfliktu a ta fungovala zatím jako velice přívěttivě. Teďkom si ho nevybavím z hlavy, ale pošlu j pošlu potom. E a zvládla řešit jako konflikty i tam, kde tam, kde ostatní jako strategie pohořely. No. >> No tak jo. Tak e tu strategii, to jsem zvědavej. Jakože to je tak, že ti to jako za tebe vyřeší jako kurzor, jo, v podstatě všechny konflikty. >> Jo. Můžeš říct víc o tom, jak ses ní nainstaloval? jestli je to jako git setting nebo >> v podstatě je to jako git setting. Ty můžeš jako nastavit nastavit, co se používá na mergeování a historicky tak Git podporoval podporoval e různý jako eh varianty na řešení konfliktu a tady ta je jako relativně relativně nová. Já nevím, jestli je to jako pár let. Eh, a ona zapojuje i jako znalostí jazyka, takže vlastně tam, kde by to pohořelo na tom, že je to vlastně jenom textovej rozdíl, tak ono to, pokud jsem to pochopil správně, tak to jako funguje až na úrovni jako AST, že to tam jako řeší ty konflikty, aby to jako ujasnilo si ty si ty rozdíly a to, kde by mohl nastat ten problém. OK, tak to seš asi hardcore git, no, uživatel a tomhle ani nevěděl, že existuje. Každopádně e jo. Tak jo. Tak máme ještě něco na probrání, nebo je to dneska všechno? Chce ještě někdo něco zasdílet důležitého? Možná ještě poslední věc jsem ještě jednu věc jsem neřek a ta vlastně proto, že to šlo mimo mě trochu. Eh, a náš jakoby infrastructure obsteam se rozhodl jako jednat sám beze mě v uvozovkách a začli jako zkoumat e různý jako AI nástroje a a jak by je mohli použít jako v oblasti operations, což je jako další velice zajímavý téma. objevili spoustu open source MCP serverů jako který jim umožňj třeba integrovat nějaký use casey jako s grafánou jo, a s Pager duty a s Gou, že jo, a s confluence prostě a tak dále a přemejšlej jako nad use casama typu eh dojde k nějaký anomálii prostě na produkci, e což bude řešit spíš nějakej tradiční machine learning třeba nebo nějaký i jednodušší algoritmy a kopne vnese do nějakýho MCP serveru nebo do cloud kódu prostě do nějakýho komplexního systému a ten jako začne obcházet, najde si kuchařku v confluence, jo, najde si prostě vytvoří díru třeba, jo, nebo e obslouží a knowledge pager duty, že jo. a takovejch jako use casů je tam mraky a kluci o tom teď jako hodně intenzivně přemejšlej, vytvářej nějakej vlastní dokument, kde tydlety věci popisujou a je to jako další eh další jako směr, kterým určitě dává smysl se vydat a může to pak korelovat vlastně i s těma vývojářema do určitý míry, že jo, že jako věci, který eh nejdou vyřešit automaticky, tak se rovnou hoděj nějakýmu vývojářovi a ten už bude mít celej ten kontext, stejně jako jeho kurzor a začne dělat ten fix, že jo, jako mnohem rychlejš, přesnějš a tak dále, no. >> Mhm. >> To je dobrý. Tak to je jakože i nějak dobrý jako třeba po pro takový jako pro nějakou podporu, že ti to jako e když když řešíš nějaký jako ty na podpoře, tak ti to tak jako dokáže dodat veškerý kontext, dokážeš pak třeba líp odpovědět tomu zákazníkovi a podobně. Ne, nemusí to jenom jako kvůli kvůli backfixu. >> Je to tak. No a obecně jsem tím chtěl říct jako a tím bych to uzavřel jednu věc. Eh, jako je potřeba vykročit jako eh opustit ten píseček jako developeru, developerů a myslet jako jako think big. Jo, prostě to není jenom o tom, že vývojáři v kurzoru jsou úspěšnější, ale může to být třeba o tom, že eh se to spojí jako s produktovým světem, jo, a produkťáci, který mají ty svoje figmy a další věci a tak zase na to jsou MCP servery a zase to je nějakej zdroj informací, který potřebuješ. Stejně tak to OBS třeba může bejt zdrojem a tam jsou zase jiný typy zdrojů. Eh, zdrojem může být i support, jo, zdrojem může bejt ty zdroje můžou být v celý firmě a zapojit je do toho procesu jako rozvoje e vlastního produktu dává smysl, jo. Takže není to jenom o tý codebasy a takže já se začínám právě intenzivněji bavit jakoby s produktem a a s OBS třeba teďka, ale i se supportem a výhledově v podstatě s každým. >> Tak jo, to je hezký závěr. Fing big. A příště zase na viděnou. Díky a uvidíme se >> čau. >> Ahoj."
businesses\ai-ta-krajta\aiTaKrajtaEpisodePeople.ts:2:import { AI_TA_KRAJTA_PEOPLE, getAiTaKrajtaPersonById, isAiTaKrajtaPersonNamedByText, type AiTaKrajtaPerson } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
businesses\ai-ta-krajta\aiTaKrajtaEpisodePeople.ts:38:    return AI_TA_KRAJTA_PEOPLE.filter(
businesses\ai-ta-krajta\aiTaKrajtaEpisodePeople.ts:44: * People of one episode, an empty list when the episode names nobody
businesses\ai-ta-krajta\aiTaKrajtaEpisodePeople.ts:46:export function getAiTaKrajtaEpisodePeople(episode: AiTaKrajtaEpisode): readonly AiTaKrajtaPerson[] {
businesses\ai-ta-krajta\aiTaKrajtaEpisodePeople.test.ts:5:    getAiTaKrajtaEpisodePeople,
businesses\ai-ta-krajta\aiTaKrajtaEpisodePeople.test.ts:7:} from '@/businesses/ai-ta-krajta/aiTaKrajtaEpisodePeople';
businesses\ai-ta-krajta\aiTaKrajtaEpisodePeople.test.ts:9:import { AI_TA_KRAJTA_PEOPLE, isAiTaKrajtaPersonNamedByText } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
businesses\ai-ta-krajta\aiTaKrajtaEpisodePeople.test.ts:81:describe('getAiTaKrajtaEpisodePeople', () => {
businesses\ai-ta-krajta\aiTaKrajtaEpisodePeople.test.ts:85:        expect(getAiTaKrajtaEpisodePeople(episode).map((person) => person.name)).toEqual(['Pavol Hejný']);
businesses\ai-ta-krajta\aiTaKrajtaEpisodePeople.test.ts:97:                if (!AI_TA_KRAJTA_PEOPLE.some((person) => isAiTaKrajtaPersonNamedByText(person, hostName))) {
businesses\ai-ta-krajta\aiTaKrajtaEpisodePeople.test.ts:107:        const collidingNames = AI_TA_KRAJTA_PEOPLE.flatMap((person) =>
businesses\ai-ta-krajta\aiTaKrajtaEpisodePeople.test.ts:108:            AI_TA_KRAJTA_PEOPLE.filter(
businesses\ai-ta-krajta\AiTaKrajtaEpisodeList.tsx:6:import { getAiTaKrajtaPersonById } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
businesses\ai-ta-krajta\aiTaKrajtaEpisodeHosts.ts:1:import { AI_TA_KRAJTA_PEOPLE, isAiTaKrajtaPersonNamedByText } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
businesses\ai-ta-krajta\aiTaKrajtaEpisodeHosts.ts:39:    return AI_TA_KRAJTA_PEOPLE.find((person) => isAiTaKrajtaPersonNamedByText(person, hostName))?.name ?? hostName;
businesses\ai-ta-krajta\AiTaKrajtaEpisodeCard.tsx:5:import { getAiTaKrajtaEpisodePeople } from '@/businesses/ai-ta-krajta/aiTaKrajtaEpisodePeople';
businesses\ai-ta-krajta\AiTaKrajtaEpisodeCard.tsx:197:    const people = getAiTaKrajtaEpisodePeople(episode);
businesses\ai-ta-krajta\aiTaKrajtaArchive.ts:4:import { resolveAiTaKrajtaEpisodePersonIds } from '@/businesses/ai-ta-krajta/aiTaKrajtaEpisodePeople';
lib\database\backupDatabase.ts:1:import { randomUUID } from 'node:crypto';
lib\database\backupDatabase.ts:59:    const temporaryFilePath = `${filePath}.tmp-${process.pid}-${randomUUID()}`;
lib\community-projects\communityProjectService.ts:16:import { randomUUID } from 'node:crypto';
lib\community-projects\communityProjectService.ts:424:    const projectId = randomUUID();
lib\community-projects\communityProjectService.ts:425:    const discussionWorkshopId = randomUUID();
lib\community-projects\communityProjectService.ts:427:    const discussionParticipantId = randomUUID();
lib\community-projects\communityProjectService.ts:571:    const discussionParticipantId = randomUUID();
lib\community-projects\communityProjectService.test.ts:125:        expect(queryCalls.some(({ queryText }) => queryText.includes('gen_random'))).toBe(false);
lib\workshops\agents\workshopAgentQueue.test.ts:19:CREATE TABLE workshop_comments (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), workshop_id uuid NOT NULL REFERENCES workshops(id),
lib\workshops\agents\workshopAgentQueue.test.ts:180:        "UPDATE workshop_agent_audio_sessions SET session_id = gen_random_uuid()",
lib\workshops\agents\workshopAgentQueue.test.ts:193:        expect((await database.query<{ is_started: boolean }>('SELECT start_workshop_agent_audio($1, gen_random_uuid()) AS is_started', [ROOM_ID])).rows[0]!.is_started).toBe(false);
lib\workshops\workshopParticipantApproval.test.ts:23:    CREATE TABLE workshop_comments (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), workshop_id uuid NOT NULL REFERENCES workshops(id),
lib\workshops\workshopParticipantApproval.test.ts:29:    CREATE TABLE workshop_poll_options (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), poll_id uuid REFERENCES workshop_polls(id),
lib\workshops\workshopParticipantApproval.test.ts:33:    CREATE TABLE community_projects (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
components\booking-notification.tsx:26:        // Pick a random notification
components\booking-notification.tsx:27:        const randomNotif = notifications[Math.floor(Math.random() * notifications.length)];
components\booking-notification.tsx:28:        setNotification(randomNotif);
lib\shortener\shortcodeLink.ts:50:     * Where the short link leads; a visitor of a link with more than one destination reaches a random one of them
lib\shortener\generateShortcode.ts:6: * uniqueness check, so callers retry a collision instead of treating a random
lib\shortener\generateShortcode.ts:10:    const randomValues = new Uint32Array(length);
lib\shortener\generateShortcode.ts:11:    globalThis.crypto.getRandomValues(randomValues);
lib\shortener\generateShortcode.ts:13:    return Array.from(randomValues, (randomValue) => SHORTCODE_CHARACTERS[randomValue % SHORTCODE_CHARACTERS.length]).join(
components\shortener\ShortcodeLinkUrlListInput.tsx:64:                    <strong>Multiple URLs detected:</strong> When someone visits your short link, they will be randomly
lib\recording-studio\recordingStudioTrim.ts:27:    const filename = crypto.randomUUID();
lib\recording-studio\recordingStudioDevices.ts:21:    return { id: crypto.randomUUID(), kind, label: track.label || { camera: 'Kamera', screen: 'Obrazovka', microphone: 'Mikrofon' }[kind], stream };
lib\recording-studio\RecordingStudioCapture.ts:51:                id: crypto.randomUUID(), title: `Záznam ${new Date().toLocaleString('cs-CZ')}`, createdAt: new Date().toISOString(),
lib\random\shuffleByWeight.ts:1:import type { CreateRandomNumber } from '@/lib/random/CreateRandomNumber';
lib\random\shuffleByWeight.ts:6: * Note: This is the exponential ordering of Efraimidis and Spirakis. Sorting by `random ^ (1 / weight)` gives exactly
lib\random\shuffleByWeight.ts:8: *       is a single pass and needs no running total. A heavier item raises its random number to a smaller power, which
lib\random\shuffleByWeight.ts:24:export function shuffleByWeight<TItem>(
lib\random\shuffleByWeight.test.ts:1:import type { CreateRandomNumber } from '@/lib/random/CreateRandomNumber';
lib\random\shuffleByWeight.test.ts:2:import { shuffleByWeight } from '@/lib/random/shuffleByWeight';
lib\random\shuffleByWeight.test.ts:14: * A source of random numbers which always answers the same, so that a test draws the same order twice
lib\random\shuffleByWeight.test.ts:30:    return shuffleByWeight([HEAVY_ITEM, LIGHT_ITEM], { getWeight: (item) => item.weight, createRandomNumber })[0].name;
lib\random\shuffleByWeight.test.ts:33:describe('shuffleByWeight', () => {
lib\random\shuffleByWeight.test.ts:37:        const shuffled = shuffleByWeight(items, { getWeight: () => 1, createRandomNumber: Math.random });
lib\random\shuffleByWeight.test.ts:39:        expect([...shuffled].sort()).toEqual(items);
lib\random\shuffleByWeight.test.ts:45:        shuffleByWeight(items, { getWeight: () => 1, createRandomNumber: Math.random });
lib\random\shuffleByWeight.test.ts:67:        //       source of random numbers and still narrow enough to catch a shuffle which stopped weighing anything.
lib\random\shuffleByWeight.test.ts:75:        const shuffled = shuffleByWeight(items, { getWeight: (item) => item.weight, createRandomNumber: Math.random });
lib\random\shuffleByWeight.test.ts:77:        expect(shuffled[shuffled.length - 1].name).toBe('nothing');
lib\random\CreateRandomNumber.ts:2: * A source of random numbers between zero and one, handed in so that a test can repeat the same draw
lib\random\CreateRandomNumber.ts:4: * Note: `Math.random` is one of these. Everything which draws something takes this instead of reaching for
lib\random\CreateRandomNumber.ts:5: *       `Math.random` on its own, so that a test can hand it a sequence it already knows the outcome of.
lib\workshops\workshopSession.ts:11:import { createHash, randomBytes } from 'node:crypto';
lib\workshops\workshopSession.ts:35:    return randomBytes(WORKSHOP_SESSION_TOKEN_BYTES).toString('base64url');

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command "Get-Content -Path 'businesses/ai-ta-krajta/aiTaKrajtaPeople.ts'" in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 381ms:
import { normalizeAiTaKrajtaSearchText } from '@/businesses/ai-ta-krajta/aiTaKrajtaTextSearch';

/**
 * Normalized transparent portraits, kept separate from source photos used elsewhere on the site.
 */
const PERSON_PHOTO_DIRECTORY_PATH = '/people/ai-ta-krajta';

export type AiTaKrajtaPerson = {
    /**
     * Identifier which the filter of the episode list carries in the address of the page
     */
    readonly id: string;

    readonly name: string;

    /**
     * What the person does, in one line and only as far as the episodes of the show actually say it
     */
    readonly headline: string;

    /**
     * Where the person can be found, `null` when they publish no page of their own
     */
    readonly url: string | null;

    /**
     * File of `public/people/ai-ta-krajta` the portrait is drawn from, `null` when the page draws their initials.
     *
     * Sources and the transparent-cutout workflow are recorded in `aiTaKrajtaPortraits.md` beside this roster.
     */
    readonly photoFileName: string | null;

    /**
     * Pieces of text which name this person in an episode title or description, including Czech declensions
     *
     * Note: They are matched without regard to letter case, so `koblíž` finds both `Koblížek` and `Koblížkem`. Keep
     *       them long enough not to match a different word - a wrong face next to an episode is worse than none.
     */
    readonly mentionPatterns: readonly string[];

    /**
     * Episodes this person took part in but which do not name them
     *
     * Note: The podcast feed is the source of truth and most descriptions do name who is at the microphone. This list
     *       is here for the rest, so an editor can attribute an episode by hand without touching any component.
     */
    readonly episodeNumbers: readonly number[];
};

/**
 * Everyone the show has introduced by name
 *
 * Note: Every line here is taken from the episode descriptions of the show or from the site itself. Nobody is given a
 *       title the show has not given them.
 *
 * Note: This is the roster, not the order the page shows it in - `aiTaKrajtaPeopleOrder.ts` draws that one. The order
 *       written down here is only what people the archive names equally often fall back on.
 */
export const AI_TA_KRAJTA_PEOPLE: readonly AiTaKrajtaPerson[] = [
    {
        id: 'pavol-hejny',
        name: 'Pavol Hejný',
        headline: 'AI konzultant a vývojář. Staví AI agenty a v dílech je rozebírá z praxe.',
        url: 'https://www.ptbk.io/pavol',
        photoFileName: 'pavol-hejny.png',
        // Note: `pavlem` is the same ending as the one a description uses before the surname of a Pavel it talks
        //       about, as in `speciálním hostem Pavlem Ungrem`. The comma and the conjunction are what say that the
        //       sentence is listing who sat at the microphone, the same way `petrem,` does for Petr Glaser.
        mentionPatterns: ['pavol', 'pavlem,', 'pavlem a ', 'hejn'],
        episodeNumbers: [],
    },
    {
        id: 'jiri-jahn',
        name: 'Jiří Jahn',
        headline: 'Řeší, co z AI firma reálně použije. Tahá debatu k praktickým otázkám.',
        url: 'https://www.ptbk.io/jirka',
        photoFileName: 'jiri-jahn.png',
        mentionPatterns: ['jirka', 'jirkou', 'jirkovi', 'jiří jahn', 'jiřím jahnem'],
        episodeNumbers: [],
    },
    {
        id: 'petr-glaser',
        name: 'Petr Glaser',
        headline: 'Vývojář, píše bleeding.dev. Testuje nové modely dřív, než se o nich začne psát.',
        url: 'https://bleeding.dev/',
        photoFileName: 'petr-glaser.png',
        // Note: Plain `petrem` would also catch the díl with Petrem Brzkem, so the patterns keep the comma and the
        //       conjunction which the descriptions write when they list who sat at the microphone.
        mentionPatterns: ['glaser', 'petrem,', 'petrem a '],
        episodeNumbers: [],
    },
    {
        id: 'patrik-braborec',
        name: 'Patrik Braborec',
        headline: 'Součást klasické sestavy podcastu. Drží díly pohromadě a hlídá, aby debata nesklouzla do hype.',
        url: null,
        photoFileName: 'patrik-braborec.png',
        mentionPatterns: ['patrik', 'patrikem', 'braborec'],
        episodeNumbers: [],
    },
    {
        id: 'jacek-soubusta',
        name: 'Jacek Soubusta',
        headline: 'Data a nástroje kolem AI. Umí veřejně přiznat, že vlastní MCP server spláchl do záchodu.',
        url: null,
        photoFileName: 'jacek-soubusta.png',
        mentionPatterns: ['jacek', 'jackem', 'soubust'],
        episodeNumbers: [],
    },
    {
        id: 'simon-podhajsky',
        name: 'Šimon Podhajský',
        headline: 'Přednášel na AI Engineer o read-only AI a kognitivních výparech. Nejskeptičtější hlas u stolu.',
        url: null,
        photoFileName: 'simon-podhajsky.png',
        mentionPatterns: ['šimon', 'šimonov', 'podhajsk'],
        episodeNumbers: [],
    },
    {
        id: 'roman-baranovic',
        name: 'Roman Baranovič',
        headline: 'Expert na digitální transformaci školství. Vrací se do dílů o AI ve školách.',
        url: 'https://narnia.sk/employees/roman-baranovic-2/',
        photoFileName: 'roman-baranovic.png',
        mentionPatterns: ['baranovi'],
        episodeNumbers: [],
    },
    {
        id: 'katka-fajmanova',
        name: 'Katka Fajmanová',
        headline: 'Architektura a interpretabilita modelů. Díl o tom, co se děje uvnitř sítě.',
        url: null,
        photoFileName: 'katka-fajmanova.png',
        mentionPatterns: ['fajman'],
        episodeNumbers: [],
    },
    {
        id: 'prokop-simek',
        name: 'Prokop Simek',
        headline: 'Šéf DX Heroes, prvního sponzora podcastu. V IT je 13 let napříč vývojem, marketingem a byznysem.',
        url: 'https://prokopsimek.cz/en',
        photoFileName: 'prokop-simek.png',
        mentionPatterns: ['prokop'],
        episodeNumbers: [],
    },
    {
        id: 'matyas-krecek',
        name: 'Matyáš Křeček',
        headline: 'I on je z DX Heroes. Pomáhá firmám zavést AI do celého vývojového procesu, dřív sám vyvíjel.',
        url: 'https://cz.linkedin.com/in/matyas-krecek',
        photoFileName: 'matyas-krecek.png',
        mentionPatterns: ['matyáš', 'křečk'],
        episodeNumbers: [],
    },
    {
        id: 'tomas-koblizek',
        name: 'Tomáš Koblížek',
        headline: 'Analytický filozof, spoluautor knihy Dezinformace a Hate Speech.',
        url: null,
        photoFileName: 'tomas-koblizek.png',
        mentionPatterns: ['koblíž'],
        episodeNumbers: [],
    },
    {
        id: 'adam-zvada',
        name: 'Adam Zvada',
        headline: 'Prodal Steer Code firmě Expo. Mluvil o agent engineeringu a orchestraci agentů.',
        url: null,
        photoFileName: 'adam-zvada.png',
        mentionPatterns: ['zvad'],
        episodeNumbers: [],
    },
    {
        id: 'lukas-caha',
        name: 'Lukáš Caha',
        headline: 'Zakladatel Youklidu. Ukázal, že se dá růst i tak, že AI hype ignorujete.',
        url: 'https://youklid.cz/',
        photoFileName: 'lukas-caha.png',
        mentionPatterns: ['caha', 'cahou', 'youklid'],
        episodeNumbers: [],
    },
    {
        id: 'richard-mladek',
        name: 'Richard Mládek',
        headline: 'Staví autonomní kódovací agenty ovládané přes Telegram. Díl o AI psychóze z produktivity.',
        url: null,
        photoFileName: 'richard-mladek.png',
        mentionPatterns: ['mládek', 'mládk'],
        episodeNumbers: [],
    },
    {
        id: 'dalibor-krejci',
        name: 'Dalibor Krejčí',
        headline: 'Česká odnož hnutí PAUSE AI. Přišel obhájit moratorium na vývoj pokročilých modelů.',
        url: null,
        photoFileName: 'dalibor-krejci.png',
        mentionPatterns: ['dalibor', 'krejčí', 'krejčího'],
        episodeNumbers: [],
    },
    {
        id: 'petr-brzek',
        name: 'Petr Brzek',
        headline: 'Macaly, český AI startup. Díl o tom, co drží second time founders nad vodou.',
        url: null,
        photoFileName: 'petr-brzek.png',
        // Note: Only the instrumental case, because that is how a description says that the show talked with him.
        //       The nominative also appears in a díl which only mentions him as an example.
        mentionPatterns: ['brzkem'],
        episodeNumbers: [],
    },
    {
        id: 'petr-simecek',
        name: 'Petr Šimeček',
        headline: 'V Googlu dělal časové řady a predikci návštěvnosti. Host dílu o tom, jak se do Googlu dostat.',
        url: 'https://about.me/petr',
        // Note: Díl #6 has no guest portrait on its cover; his published conference portrait supplies this cutout.
        photoFileName: 'petr-simecek.png',
        mentionPatterns: ['šimeček'],
        episodeNumbers: [],
    },
    {
        id: 'tomas-kroupa',
        name: 'Tomáš Kroupa',
        headline: 'CTO Agent ID, který hlídá AI agenty deterministickými limity a auditovatelností.',
        url: 'https://cz.linkedin.com/in/tom-kroupa',
        photoFileName: 'tomas-kroupa.png',
        mentionPatterns: ['kroup'],
        episodeNumbers: [],
    },
    {
        id: 'ondrej-sukac',
        name: 'Ondřej Sukač',
        headline: 'Spoluzakladatel Galenia, které bourá jazykové bariéry ve zdravotnictví. Studuje právo v Brně.',
        url: 'https://cz.linkedin.com/in/ondrej-sukac',
        photoFileName: 'ondrej-sukac.png',
        mentionPatterns: ['sukač'],
        episodeNumbers: [],
    },
    {
        id: 'tomas-mikolov',
        name: 'Tomáš Mikolov',
        headline: 'Spoluzakladatel BottleCap AI. V Googlu zažil doby, kdy se stavěly základy dnešních modelů.',
        url: 'https://bottlecapai.com/',
        photoFileName: 'tomas-mikolov.png',
        // Note: No `mikolov` pattern, because the show talks about him in later díly he never sat in - a description
        //       which only quotes what BottleCap AI or he himself published is not a person at the microphone.
        mentionPatterns: [],
        episodeNumbers: [23],
    },
    {
        id: 'jan-cienciala',
        name: 'Jan Cienciala',
        headline: 'V AI týmu CloudTalku dělá research a prototypy, které kolegové dotáhnou do produkce.',
        url: 'https://cz.linkedin.com/in/cienciala',
        photoFileName: 'jan-cienciala.png',
        // Note: The transcript of díl #24 hears him as `Činčala`; he spells his own surname without háčky.
        mentionPatterns: ['ciencial', 'činčal'],
        episodeNumbers: [],
    },
    {
        id: 'lenka-sefcakova',
        name: 'Lenka Šefčáková',
        headline: 'V CloudTalku vyvíjí a prototypuje jejich AI funkce, třeba detekci hlasové schránky.',
        url: 'https://sk.linkedin.com/in/lenkasefcakova',
        photoFileName: 'lenka-sefcakova.png',
        mentionPatterns: ['šefčák'],
        episodeNumbers: [],
    },
    {
        id: 'pavel-ungr',
        name: 'Pavel Ungr',
        headline: 'SEO konzultant s dvacetiletou praxí. Říkal, jak zviditelnit web v ChatGPT, Geminu i u Googlu.',
        url: 'https://www.pavelungr.cz/',
        photoFileName: 'pavel-ungr.png',
        mentionPatterns: ['ungr'],
        episodeNumbers: [],
    },
    {
        id: 'matous-havlena',
        name: 'Matouš Havlena',
        headline: 'Spoluzakladatel a CTO Apoca, s IBM Research dělá aplikovaný výzkum. Host dílu o emocích v LLM.',
        url: 'https://www.havlena.com/about',
        photoFileName: 'matous-havlena.png',
        mentionPatterns: ['havlen'],
        episodeNumbers: [],
    },
    {
        id: 'ondra',
        name: 'Ondra',
        headline: 'CTO startupu, který se snaží pomocí AI zlepšit život mladým lidem a pomoct jim s administrativou.',
        url: null,
        photoFileName: 'ondra.png',
        // Note: The show never says his surname, so nothing here may match on a first name: `Ondra` is also what the
        //       host of díl #21 calls Ondřej Sukač. The díl he sat in is what attributes him.
        mentionPatterns: [],
        episodeNumbers: [58],
    },
];

/**
 * Address the browser loads the portrait of a person from
 *
 * @returns the address, `null` for a person the show has no picture of
 */
export function getAiTaKrajtaPersonPhotoPath(person: AiTaKrajtaPerson): string | null {
    return person.photoFileName === null ? null : `${PERSON_PHOTO_DIRECTORY_PATH}/${person.photoFileName}`;
}

/**
 * Finds the person a link or a filter names
 *
 * @returns the person, `null` when nobody of that identifier is in the roster
 */
export function getAiTaKrajtaPersonById(personId: string | null): AiTaKrajtaPerson | null {
    return AI_TA_KRAJTA_PEOPLE.find((person) => person.id === personId) ?? null;
}

/**
 * Whether a piece of text names a person, either by their published name or by one of their mention patterns
 *
 * Note: This is the one rule which decides that a name written by a publisher and a line of the roster are the same
 *       person. Both the roster reading of a description and the credit list of an episode ask it, so the two can
 *       never disagree about who is who.
 */
export function isAiTaKrajtaPersonNamedByText(person: AiTaKrajtaPerson, text: string): boolean {
    const normalizedText = normalizeAiTaKrajtaSearchText(text);

    return (
        normalizedText === normalizeAiTaKrajtaSearchText(person.name) ||
        person.mentionPatterns.some((pattern) => normalizedText.includes(normalizeAiTaKrajtaSearchText(pattern)))
    );
}

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command "Get-Content -Path 'businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts'" in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 264ms:
import type { AiTaKrajtaPerson } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
import type { CreateRandomNumber } from '@/lib/random/CreateRandomNumber';
import { shuffleByWeight } from '@/lib/random/shuffleByWeight';

/**
 * Chance a person carries before a single episode of theirs is counted in
 *
 * Note: Without it somebody the archive names in no episode would weigh nothing and could never come out anywhere but
 *       last. One episode is therefore worth twice as much as none rather than infinitely more.
 */
const BASE_PERSON_WEIGHT = 1;

/**
 * How much of the front of the list one person has a chance at, which is how often the show has them on
 */
function getPersonWeight(person: AiTaKrajtaPerson, episodeCountByPersonId: ReadonlyMap<string, number>): number {
    return BASE_PERSON_WEIGHT + (episodeCountByPersonId.get(person.id) ?? 0);
}

/**
 * The people of the show from the most often heard to the least often heard
 *
 * Note: This is the order the draw below leans towards and the one the page is built in before anybody draws anything.
 *       People heard equally often keep the order of the roster, because sorting here never moves what it does not
 *       have to.
 */
export function orderAiTaKrajtaPeopleByAppearances(
    people: readonly AiTaKrajtaPerson[],
    episodeCountByPersonId: ReadonlyMap<string, number>,
): readonly AiTaKrajtaPerson[] {
    return [...people].sort(
        (firstPerson, secondPerson) =>
            getPersonWeight(secondPerson, episodeCountByPersonId) -
            getPersonWeight(firstPerson, episodeCountByPersonId),
    );
}

/**
 * The people of the show in a freshly drawn order which still leans on how often they are heard
 *
 * Note: A roster written down once has the same person on top of it every single time, which reads as a ranking the
 *       show never made. The draw keeps the list alive between visits while somebody who is on every other episode
 *       still comes up high far more often than somebody named in one díl.
 */
export function shuffleAiTaKrajtaPeopleByAppearances(
    people: readonly AiTaKrajtaPerson[],
    episodeCountByPersonId: ReadonlyMap<string, number>,
    createRandomNumber: CreateRandomNumber,
): readonly AiTaKrajtaPerson[] {
    return shuffleByWeight(people, {
        getWeight: (person) => getPersonWeight(person, episodeCountByPersonId),
        createRandomNumber,
    });
}

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command "Get-Content -Path 'businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts'" in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 369ms:
import type { AiTaKrajtaPerson } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
import {
    orderAiTaKrajtaPeopleByAppearances,
    shuffleAiTaKrajtaPeopleByAppearances,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder';
import { describe, expect, it } from 'vitest';

/**
 * How many times a test which watches the draw itself repeats it
 */
const DRAW_COUNT = 500;

function createPerson(id: string): AiTaKrajtaPerson {
    return {
        id,
        name: id,
        headline: 'Mluví do mikrofonu.',
        url: null,
        photoFileName: null,
        mentionPatterns: [],
        episodeNumbers: [],
    };
}

const PEOPLE: readonly AiTaKrajtaPerson[] = [
    createPerson('one-episode-contributor'),
    createPerson('never-named'),
    createPerson('frequent-contributor'),
    createPerson('returning-contributor'),
];

const EPISODE_COUNT_BY_PERSON_ID: ReadonlyMap<string, number> = new Map([
    ['one-episode-contributor', 1],
    ['frequent-contributor', 40],
    ['returning-contributor', 3],
]);

/**
 * Draws the roster over and over and writes down every place each person ever took
 */
function collectPlacesByPersonId(): ReadonlyMap<string, ReadonlySet<number>> {
    const placesByPersonId = new Map(PEOPLE.map((person) => [person.id, new Set<number>()]));

    for (let drawIndex = 0; drawIndex < DRAW_COUNT; drawIndex++) {
        shuffleAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID, Math.random).forEach((person, place) =>
            placesByPersonId.get(person.id)!.add(place),
        );
    }

    return placesByPersonId;
}

describe('orderAiTaKrajtaPeopleByAppearances', () => {
    it('leads with the person the archive names most often', () => {
        const ordered = orderAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID);

        expect(ordered.map((person) => person.id)).toEqual([
            'frequent-contributor',
            'returning-contributor',
            'one-episode-contributor',
            'never-named',
        ]);
    });

    it('keeps the order of the roster between people who are named equally often', () => {
        const ordered = orderAiTaKrajtaPeopleByAppearances(PEOPLE, new Map());

        expect(ordered.map((person) => person.id)).toEqual(PEOPLE.map((person) => person.id));
    });

    it('leaves the roster it was given alone', () => {
        orderAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID);

        expect(PEOPLE[0].id).toBe('one-episode-contributor');
    });
});

describe('shuffleAiTaKrajtaPeopleByAppearances', () => {
    it('shows everybody of the roster exactly once', () => {
        const shuffled = shuffleAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID, Math.random);

        expect(new Set(shuffled.map((person) => person.id)).size).toBe(PEOPLE.length);
    });

    it('puts the person of the most episodes on top far more often than the person of a single one', () => {
        const topPersonIds = Array.from(
            { length: DRAW_COUNT },
            () => shuffleAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID, Math.random)[0].id,
        );

        const frequentContributorTopCount = topPersonIds.filter(
            (personId) => personId === 'frequent-contributor',
        ).length;
        const oneEpisodeContributorTopCount = topPersonIds.filter(
            (personId) => personId === 'one-episode-contributor',
        ).length;

        expect(frequentContributorTopCount).toBeGreaterThan(oneEpisodeContributorTopCount * 3);

        // Note: Leaning towards somebody is not a ranking of them, so even the most frequently named person has to be
        //       overtaken now and then.
        expect(frequentContributorTopCount).toBeLessThan(DRAW_COUNT);
    });

    it('moves even somebody the archive never names around the list', () => {
        const placesOfNeverNamed = collectPlacesByPersonId().get('never-named')!;

        expect(placesOfNeverNamed.size).toBeGreaterThan(1);
        expect(placesOfNeverNamed.has(0)).toBe(true);
    });

    it('draws the same order twice out of the same numbers', () => {
        const createConstantRandomNumber = () => 0.5;

        const firstDraw = shuffleAiTaKrajtaPeopleByAppearances(
            PEOPLE,
            EPISODE_COUNT_BY_PERSON_ID,
            createConstantRandomNumber,
        );
        const secondDraw = shuffleAiTaKrajtaPeopleByAppearances(
            PEOPLE,
            EPISODE_COUNT_BY_PERSON_ID,
            createConstantRandomNumber,
        );

        expect(firstDraw.map((person) => person.id)).toEqual(secondDraw.map((person) => person.id));
    });
});

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command "Get-Content -Path 'lib/random/shuffleByWeight.ts'" in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 259ms:
import type { CreateRandomNumber } from '@/lib/random/CreateRandomNumber';

/**
 * The place one item drew for itself, the highest key ending up first
 *
 * Note: This is the exponential ordering of Efraimidis and Spirakis. Sorting by `random ^ (1 / weight)` gives exactly
 *       the same result as drawing the items one after another, each with a chance proportional to its weight, but it
 *       is a single pass and needs no running total. A heavier item raises its random number to a smaller power, which
 *       pulls the number closer to one, which is why weight leans on the order without ever deciding it.
 */
function createDrawnSortKey(weight: number, createRandomNumber: CreateRandomNumber): number {
    return createRandomNumber() ** (1 / weight);
}

/**
 * Shuffles a list so that a heavier item is more likely to come out near its front
 *
 * @param items the list to draw an order for, which is left as it is
 * @param getWeight how much of a chance one item has, which should be greater than zero - an item of no weight at all
 *                  can only ever come last
 * @param createRandomNumber where the draw takes its numbers from
 * @returns a new list holding every item exactly once
 */
export function shuffleByWeight<TItem>(
    items: readonly TItem[],
    {
        getWeight,
        createRandomNumber,
    }: {
        readonly getWeight: (item: TItem) => number;
        readonly createRandomNumber: CreateRandomNumber;
    },
): readonly TItem[] {
    return items
        .map((item) => ({ item, sortKey: createDrawnSortKey(getWeight(item), createRandomNumber) }))
        .sort((firstDraw, secondDraw) => secondDraw.sortKey - firstDraw.sortKey)
        .map((draw) => draw.item);
}

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command "Get-Content -Path 'businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts'" in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 296ms:
import {
    AI_TA_KRAJTA_PEOPLE,
    getAiTaKrajtaPersonPhotoPath,
    type AiTaKrajtaPerson,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

const PUBLIC_DIRECTORY = path.resolve(__dirname, '../../public');

function createPerson(photoFileName: string | null): AiTaKrajtaPerson {
    return {
        id: 'someone',
        name: 'Někdo Nový',
        headline: 'Přišel na jeden díl.',
        url: null,
        photoFileName,
        mentionPatterns: [],
        episodeNumbers: [],
    };
}

describe('getAiTaKrajtaPersonPhotoPath', () => {
    it('addresses a portrait inside the normalized podcast portrait folder', () => {
        expect(getAiTaKrajtaPersonPhotoPath(createPerson('someone.png'))).toBe('/people/ai-ta-krajta/someone.png');
    });

    it('has no address for a person the show has no picture of', () => {
        expect(getAiTaKrajtaPersonPhotoPath(createPerson(null))).toBeNull();
    });
});

describe('AI_TA_KRAJTA_PEOPLE', () => {
    // Note: A portrait which is only named and never cut breaks in the browser and nowhere else, which is why the
    //       roster is read against `public` here rather than trusted.
    it.each(AI_TA_KRAJTA_PEOPLE)(
        'has a normalized transparent PNG portrait for $name',
        async (person) => {
            const photoPath = getAiTaKrajtaPersonPhotoPath(person);
            expect(photoPath).not.toBeNull();
            const filePath = path.join(PUBLIC_DIRECTORY, photoPath!);
            expect(existsSync(filePath)).toBe(true);

            const portrait = sharp(filePath);
            const metadata = await portrait.metadata();
            expect(metadata).toMatchObject({ format: 'png', width: 320, height: 320, hasAlpha: true });

            // An alpha channel filled with opaque pixels is still a background, not a cutout.
            const { channels } = await portrait.stats();
            const alpha = channels[3];
            expect(alpha.min).toBe(0);
            // Palette compression may round fully opaque alpha down by a couple of levels.
            expect(alpha.max).toBeGreaterThanOrEqual(250);
            expect(alpha.mean).toBeGreaterThan(50);
            expect(alpha.mean).toBeLessThan(230);
        },
    );

    it('draws no two people from the same portrait', () => {
        const photoFileNames = AI_TA_KRAJTA_PEOPLE.map((person) => person.photoFileName);

        expect(new Set(photoFileNames).size).toBe(photoFileNames.length);
    });
});

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command "Get-Content -Path 'businesses/ai-ta-krajta/useAiTaKrajtaOrderedPeople.ts'" in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 244ms:
'use client';

import { AI_TA_KRAJTA_PEOPLE, type AiTaKrajtaPerson } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
import {
    orderAiTaKrajtaPeopleByAppearances,
    shuffleAiTaKrajtaPeopleByAppearances,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder';
import { useEffect, useState } from 'react';

/**
 * The whole roster of the show in the order this one visit shows it in
 *
 * Note: The order is drawn, so the server cannot be the one drawing it - it would send one order, the browser would
 *       hydrate into another and React would throw the section away and build it again. The page is therefore rendered
 *       in the order the draw leans towards, from the most often heard person to the least often heard one, and the
 *       draw itself is made once the section is alive in the browser.
 *
 * Note: The drawn order is deliberately not in the address bar. A shared link is about an episode or about a person,
 *       never about who happened to come out on top of the roster this time.
 *
 * @param episodeCountByPersonId how many episodes of the archive each person is named in
 */
export function useAiTaKrajtaOrderedPeople(
    episodeCountByPersonId: ReadonlyMap<string, number>,
): readonly AiTaKrajtaPerson[] {
    const [orderedPeople, setOrderedPeople] = useState<readonly AiTaKrajtaPerson[]>(() =>
        orderAiTaKrajtaPeopleByAppearances(AI_TA_KRAJTA_PEOPLE, episodeCountByPersonId),
    );

    useEffect(() => {
        setOrderedPeople(
            shuffleAiTaKrajtaPeopleByAppearances(AI_TA_KRAJTA_PEOPLE, episodeCountByPersonId, Math.random),
        );
    }, [episodeCountByPersonId]);

    return orderedPeople;
}

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command 'git status --short' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 252ms:
 M prompts/2026-09-0560-ai-ta-krajta-people-factor.md

codex
The current design has one shared weighting function: it gives everyone a base weight of 1, then adds their episode count; that function powers both the hydration-safe initial order and the client-side weighted shuffle. I’ll extend that shared calculation so the multiplier applies only to episode appearances, leaving the base chance intact for people with no credited episode.
exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command "rg -n --glob '"'!node_modules'"' \"factor \\?\\?|factor:|Factor\" businesses lib tests | Select-Object -First 200" in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 356ms:
lib\database\migrateDatabase.ts:72:    readonly clientFactory?: (databaseUrl: string) => Promise<MigrationDatabaseClient>;
lib\database\migrateDatabase.ts:333:    const client = await (options.clientFactory ?? createPostgresClient)(databaseUrl);
lib\metadata\page-registry.ts:11:import { HACKATHON_FACTORY_PAGE_DEFINITION } from '@/businesses/hackathon-factory/hackathonFactoryMetadata';
businesses\hackathon-factory\_HackathonFactoryPage.tsx:5:    hackathonFactoryAudience,
businesses\hackathon-factory\_HackathonFactoryPage.tsx:6:    hackathonFactoryHighlights,
businesses\hackathon-factory\_HackathonFactoryPage.tsx:7:    hackathonFactoryPrinciples,
businesses\hackathon-factory\_HackathonFactoryPage.tsx:8:    hackathonFactoryPrinciplesNote,
businesses\hackathon-factory\_HackathonFactoryPage.tsx:9:    hackathonFactoryProcess,
businesses\hackathon-factory\_HackathonFactoryPage.tsx:10:    hackathonFactoryProcessNote,
businesses\hackathon-factory\_HackathonFactoryPage.tsx:11:    hackathonFactorySituations,
businesses\hackathon-factory\_HackathonFactoryPage.tsx:12:} from '@/businesses/hackathon-factory/hackathonFactoryContent';
businesses\hackathon-factory\_HackathonFactoryPage.tsx:13:import { hackathonFactoryConversation } from '@/businesses/hackathon-factory/hackathonFactoryConversation';
businesses\hackathon-factory\_HackathonFactoryPage.tsx:15:    hackathonFactoryPricing,
businesses\hackathon-factory\_HackathonFactoryPage.tsx:16:    hackathonFactoryPricingFootnotes,
businesses\hackathon-factory\_HackathonFactoryPage.tsx:17:} from '@/businesses/hackathon-factory/hackathonFactoryPricing';
businesses\hackathon-factory\_HackathonFactoryPage.tsx:21:import { HackathonFactoryLogo } from '@/components/hackathon-factory-logo';
businesses\hackathon-factory\_HackathonFactoryPage.tsx:34:export function HackathonFactoryPage() {
businesses\hackathon-factory\_HackathonFactoryPage.tsx:41:                    placeName="HackathonFactoryPage"
businesses\hackathon-factory\_HackathonFactoryPage.tsx:64:                        <HackathonFactoryLogo
businesses\hackathon-factory\_HackathonFactoryPage.tsx:72:                            Hackathon <span className="text-slate-900">Factory</span>
businesses\hackathon-factory\_HackathonFactoryPage.tsx:79:                        conversation={hackathonFactoryConversation}
businesses\hackathon-factory\_HackathonFactoryPage.tsx:85:                                        <HackathonFactoryLogo
businesses\hackathon-factory\_HackathonFactoryPage.tsx:90:                                        Hackathon Factory: skutečné problémy a lidé, kteří je umějí řešit
businesses\hackathon-factory\_HackathonFactoryPage.tsx:150:                            {hackathonFactoryHighlights.map((highlight, index) => (
businesses\hackathon-factory\_HackathonFactoryPage.tsx:175:                    title="Jak Hackathon Factory funguje"
businesses\hackathon-factory\_HackathonFactoryPage.tsx:177:                    note={hackathonFactoryProcessNote}
businesses\hackathon-factory\_HackathonFactoryPage.tsx:178:                    cards={hackathonFactoryProcess}
businesses\hackathon-factory\_HackathonFactoryPage.tsx:186:                    title="Pro koho je Hackathon Factory"
businesses\hackathon-factory\_HackathonFactoryPage.tsx:188:                    cards={hackathonFactoryAudience}
businesses\hackathon-factory\_HackathonFactoryPage.tsx:196:                    cards={hackathonFactorySituations}
businesses\hackathon-factory\_HackathonFactoryPage.tsx:204:                    note={hackathonFactoryPrinciplesNote}
businesses\hackathon-factory\_HackathonFactoryPage.tsx:205:                    cards={hackathonFactoryPrinciples}
businesses\hackathon-factory\_HackathonFactoryPage.tsx:214:                            Za Hackathon Factory stojí <strong>AI Web s.r.o.</strong>, tedy Jiří Jahn a Pavol Hejný.
businesses\hackathon-factory\_HackathonFactoryPage.tsx:217:                            technologický hype. Hackathon Factory stavíme z jednoduchého důvodu: novou technologii
businesses\hackathon-factory\_HackathonFactoryPage.tsx:242:                    plans={hackathonFactoryPricing}
businesses\hackathon-factory\_HackathonFactoryPage.tsx:243:                    footnotes={hackathonFactoryPricingFootnotes}
businesses\hackathon-factory\_HackathonFactoryPage.tsx:245:                    openSourceGuaranteeText="Úvodní 30min konzultace je zdarma a bez závazků. Když zadání pro Hackathon Factory nesedí, řekneme to rovnou a doporučíme jiný postup."
businesses\hackathon-factory\hackathonFactoryPricing.ts:4:export const hackathonFactoryPricingFootnotes: PricingFootnote[] = [
businesses\hackathon-factory\hackathonFactoryPricing.ts:11:export const hackathonFactoryPricing: PricingPlan[] = [
businesses\hackathon-factory\hackathonFactoryMetadata.ts:9:    title: 'Hackathon Factory | Skutečné problémy, použitelné výstupy',
businesses\hackathon-factory\hackathonFactoryMetadata.ts:10:    socialTitle: 'Hackathon Factory',
businesses\hackathon-factory\hackathonFactoryMetadata.ts:12:        'Hackathon Factory spojuje lidi s konkrétními problémy s developery, kteří během krátkého sprintu připraví prototyp, podklad pro rozhodnutí nebo plán.',
businesses\hackathon-factory\hackathonFactoryMetadata.ts:15:    socialPreviewImageAlt: 'Hackathon Factory - skutečné problémy, použitelné výstupy',
businesses\hackathon-factory\hackathonFactoryConversation.ts:6:export const hackathonFactoryConversation = {
businesses\hackathon-factory\hackathonFactoryConversation.ts:20:            fullname: 'Jirka, Hackathon Factory',
businesses\hackathon-factory\hackathonFactoryConversation.ts:30:                Chceme do Hackathon Factory přihlásit zadání.
businesses\hackathon-factory\hackathonFactoryConversation.ts:52:                Tohle je dobrý kandidát pro Hackathon Factory. Převedu ho do briefu:
businesses\hackathon-factory\hackathonFactoryContent.tsx:4:export interface HackathonFactoryHighlight {
businesses\hackathon-factory\hackathonFactoryContent.tsx:10:export const hackathonFactoryHighlights: HackathonFactoryHighlight[] = [
businesses\hackathon-factory\hackathonFactoryContent.tsx:28:export const hackathonFactoryProcessNote = (
businesses\hackathon-factory\hackathonFactoryContent.tsx:35:export const hackathonFactoryProcess: FeatureCard[] = [
businesses\hackathon-factory\hackathonFactoryContent.tsx:74:export const hackathonFactoryAudience: FeatureCard[] = [
businesses\hackathon-factory\hackathonFactoryContent.tsx:105:export const hackathonFactorySituations: FeatureCard[] = [
businesses\hackathon-factory\hackathonFactoryContent.tsx:138:export const hackathonFactoryPrinciplesNote = (
businesses\hackathon-factory\hackathonFactoryContent.tsx:139:    <>Když zadání pro Hackathon Factory nesedí, řekneme to rovnou a doporučíme jiný postup.</>
businesses\hackathon-factory\hackathonFactoryContent.tsx:142:export const hackathonFactoryPrinciples: FeatureCard[] = [
businesses\ai-ta-krajta\aiTaKrajtaEpisodes.json:18:        "transcript": "Ahoj, vítáme vás u 64. dílu IT City. Máme naše kulatiny. Vydrželi jsme dýl než většina podcastů, co kdy začala vznikat a to by nebylo možný bez podpory Prownbooku, e, díky kterýmu máme skvělýho střihače a kteří pořádají událost, kterou si kdyžtak přibližte, kluci. Eh, měli jsme teďka online webinář na AI vibe coding a to jaký jaký tam jsou všechny problém, mělo to dost úspěch a tak děláme round 2 a dáváme odkaz do komentáře. A já bych rovnou začal novinkami. Eh, má někdo z vás novinky? >> Já jsem měl novinky, který jsem posílal v době, kdy byly novinky. Nevím, jestli jste je někdo zmiňovali. Eh, předčasy v Googlu jste řešili. >> Částečně jsme je řešili v minulým díle s Romanem Paradobičem, ale klidně přidej svoji trošku do mlýna. No, vypadá to, že v Googlu se to hodně otřásá. Odešly jim tam čtyři velký AI mozky. S tím, že jeden člověk byl v Googlu jako jeden z top zaměstnanců, co tam doteď byli. Byl tam 25 let a byl prakticky u všeho. U vyhledávání, u AI a u všeho možnýho. Ti se teďkom rozhodli si založit vlastní startup, kterj se jmenuje Discovery Loop a tam mě zaujalo to samotná ta existence toho startupu. je prémisou toho, ne, že budou dělat AI asistovanej výzkum, ale že budou mít AI powered výzkum a postaví na tom jako existenci tý firmy a budou prostě docfudovat ty modely, aby jim ta firma e rostla, fungovala líp a tak dále. Tak jsem zvědavej, kam to dopracujou. >> Jo. E, má tohle být nějak jako semi autonomní vývoj nebo research, nebo jak to je to myšlený vlastně? Budou do toho lidi zasahovat? >> Z toho, co víme, má to bejt fakt jako autonomní záležitost. Oni už mají i stránky, tak já je teďkom nasdílím. Jmenuje se to Discovery Loop a je to fakt automatic automatic discovery to accelerate science and engineering for the world. Oni vyloženě chcou fakt jako jít potom vyzkoumávat nový věci, automatizovat je a tak. Otázka je nakolik tam jako kde bude hrát roli ten člověk. Tam to podle mě nějakou dobu ještě nezjistíme. Na druhou stranu s těma jménama, co tam šly, tak to se rajuje samo. Prostě člověk řekne čtyři ex Google lidi, >> jak já to vnímám, tak jde vlastně o to nechat AIO generovat nějaký nápady, něco, co by člověka třeba nenapadlo tak rychle úplně, ne? Druhá důležitá věc bude podle mě ta potom to nějak zvalidovat, nějak to jako střed s realitou. Oni tady píšou, že jako propose run and learn from evaluations a bude to parallel execution of thousands of experiments. Tak uvidíme, jak to dopadne. Myslím si, že jako v research je to stále docela underutilized. >> Shodou shodou okolností jsme minulej týden řešili to, že já nevím, třeba Antropic dělá pokroky, mírný pokroky v matematice třeba a tak, ale jo, tohle je určitě důležitej směr. Myslím, že není náhoda, že ty lidi pochází z Googlu. Hm. No, já jsem zvědavej, jak to bude dál s Googlem, protože >> No, já možná možná přidám svoji novinku, že Open AI teďka oficiálně, ono to s ním trochu souvisí e jako ostatně vždycky, oficiálně zveřejnili nebo překlonili se prostě k tomu, co už dlouho je ve vzduchu, to, že zpomalí AI vývoj. Nevíme přesně, co to bude znamenat, jak moc to myslí vážně. Řekl bych, že to je takový jako nějak nějaká stylizace do něčeho, že na jednu stranu se tím zbavuješ tlaku neustále vydávat nějaký novinky a na druhou stranu můžeš klidu někde pod střechou vyvíjet nějaký super ničivý modely, který všechno rozbijou. Nevím, co si o tom myslíte. >> Já jsem k tomuhle takovej jako skeptickej, co zatím vlastně jako sledujou. Na jednu stranu, jak říkáš, prostě to, že to jako pozastavj na papíře, nemusí znamenat, že to pozastavěj v reálu. Druhá si myslím, že to je trošku politická snaha pomaly ty ostatní, že řeknou, myy jsme to udělali, tak vy přece můžete taky. Tím, co teďkom předvedl jako novej Quen 38, tak to je jako neskutečný. Ten model je brutální. Počk, že tady není kačka. Ta si myslím, že by z toho byla nadšená. >> Už jste ho zkoušeli? >> Zkoušeli. A to je úplně brutální. Mně připadá, že ti činěinně začínají být stejně do nebo už jsou stejně dobrý a už je to prostě na tutovku. >> Je to tak. No, >> já se přiznám, že jsem ještě [odkašlání] tenhleten model nezkoušel na programování, žádný otázky, ale zajímalo by mě docela, jak třeba dokázali byste nějak srovnat třeba GPT 56, třeba řekněme s E v nějakým médium režimu nebo high režimu s tímhletím zvířatem, >> ne? Z toho, co jsem testoval já, tak eh samozřejmě klasickej problém menších modelů nekomunikovat s tím v jiným jazyci, než v angličtině nebo v čínštině, pokud někdo umíte. chvíli, kdy člověk dodržuje jakoby ty to, že se posune trošku dozadu s tím, jak s tím komunikuje, že tomu nedává moc volnosti pro výklad, tak ten model je neskutečně silnej, chlape docela hezky. Jedinej problém je, že tím, že je to dance model, tak na Mau je jako šíleně šíleně pomalej. Naproti tomu, když vydali ten A3B 35B, A3B i 36 a 37 generaci, tak ten mi přišel jako zajímavější na MacBooku, kdežto ty dance modely prostě potřebujou pořádnej výkon těch grafik, takže na Mau to není úplně použitelný. >> OK. >> Mně tam přijde jako jedna věc a to ta, že ono nutně to, že ten model se dá stáhnout, nemusí nemusí znamenat, že si ho rovnou stáhnu a provozuju lokálně. Ono to vůbec neznamená tu opcionalitou, že to můžu udělat, protože pokud mi vypnou soul nebo fable, tak s tím nic neudělám. Jenomže model, kterej už je takhle vypuštěnej, tak si ho vždycky můžu někde lokálně spustit, i když si ho zrovna teďka lokálně nezpouštím. A ono ještě je něco mezi, jako já ho můžu spustit na svém vlastním cloudu. I když to je taky poměrně drahý. Jo, jako já teďkom přemýšlím, že si právě koupím dva sparky právě kvůli provozování některejch modelů a kvůli věcem, který s cloudovejma vůbec neudělám, nebo ne s cloudovejma, který si nenasazuju sám někam. Třeba nějaký security sceny, tak teďkom Open AI tak specifikovalo, že mají klasickej model a pak máte daybreak blue a daybreak red a k tomu červenýmu se prakticky nedá dostat jako jednotlivec, pokud nemáte nějakej track of record. Takže tam jsem se nedostal, ale Daybreak Blue mám schválenj. Tam vám stačí normálně projít klasickým KYC občankou a tak. Jsem schopný s tím jako dělat něco, ale že bych vyloženě jako zkusil pen testovat naši infra, to neprojde. >> Bych řekl, že je obecně další jako zajímavý okruh témat a to AI modely a security a to co povolujou a nepovolujou, protože mně přijde, že že začíná být strašně těžký rozlišit, zda daná věc je legit a jenom jako opravuje chyby v mým vlastním softwaru a nebo zda provádím nějaký útok. A já my sami s tím začínáme mít poměrně problémy, protože model, který je dobý v security, tak je dobý i v hackování a viceverza. Jo, jako teďkom teďk zrovna jsem viděl, že Stefan z Outsers, tak měli přednášku o tom, že hacknuli různý modely a donutili je dělat jako nepřístojnosti. Co bylo zajímavý, že Jemy Knight tím, že je jako hodně prosociální, tak tam když člověk jako specifikoval, že je holka ze Severní Koreje a potřebuje jako utýct a k tomu musí sestavit bombu, tak najednou Jeminaj, ale prosím, beze všeho. Takže je jako zajímavý, jak i to vlastně nastavení toho modelu promítá do toho, jak ho hacknete. Mně přijde jako úplně fascinující, jak tyhlety pohádky okolo vlastně jako konzistentně fungujou a konzistentně fungujou už od prostě GPT 3 a pů a stále je to stejně platný, že vlastně jako čistě tím, co co mucám, mu dokážu zvýšit ochotu nebo schopnosti toho, co on udělá. A mimochodem, já mám takovou jako jednoduš jednodušší jako tu, ono když mám nějaký repozitář, tak já mu buď můžu říct, ne ho hackne a nebo můžu říct, ne ho fixne. Jenomže ono velmi často je to v podstatě ekvivalent. My jsme teďka taky potřebovali ověřit nějakou naší apku, protože my teďka, jak jsme dělali ten první webinář, tak nám to celý spravoval agent. Jsme udělali takovej experiment, že emaily posílal agent, webovku tvořil agent. Byl to jako jeden agent, kterej to, který si to všechno manažoval a jakoby přece jenom člověk má jako důvěřovat prověřovat, tak jsem si to chtěl nechat prověřit, zda ta zda tam nejsou nějaký chyby, protože minimálně nějaký tam nasekal. Když jsem mu to řekl tak, že to má hacknout, tak tak jako absolutně, že já ani ty čínský modely mě řekl, že ne, ale jakmile jsem mu říkal, že se na to má podívat, abychom to mohli opravit a že nám má udělat full request, aby to opravil, tak to v pohodě udělal. Ale ono je to vlastně ekvivalentní práce. Jedno a druhý je to samý, akorát jinej pohled na tu samou věc. >> Často. Jo, ale jsou věci, který jako neuděláš bez toho, abys ho donutil jako hackovat. Pokud chceš dělat vyloženě nějakej jako blackbo box testing tvojí infra, tak tam potřebuješ ten agent jako toho agenta donutit, se pustil do toho útoku. A to je jeden z důvodů, proč chci právě si nakoupit ten spark. Vlastně to teďkom řeším i s klientama. Na některý věci to prostě dává smysl. i když je to třeba pomalejší na tu propustnost, tak pokud to pustím jako nějakej overnight scanner, kterej mi bude dělat nějaký automatizace, kde mi nevadí, že to jede 10 tokenů za sekundu a nebo budu mít nějakej jako long testing mojí infrastruktury po stránce bezpečnosti. Já jenom potřebuju, aby to manažovalo ty existující nástroje na hackování. Tam se to jako vyplatí a nevadí mi, že to, že to pojede pomalu a nemusím hnedka investovat do grafiky za 230 000. Jo, no. No, často stačí, aby to vůbec jelo, protože jako u spousty úkolů je ti jedno, jak rychle nebo úplně jedno, ne, ale u spousty úkolů nezáleží na tom, že to jede dlouho, ale že se to udělá dobře a že to nemusíš supervizovat a babysitovat. >> Je to tak. Teďkom, teďkom právě co skládám je propojit dvakrát Spark, ale další experiment, který uvidím, jestli k tomu přesvědčím klienty, je, že jsou i metody, jak zřetězit osm sparků do sebe. Potřebujete k tomu teda sice jako brutální krotik, kterej sám o sobě stojí tolik co jeden ze Sparku, pak jste schopni mít 8x 128 GB ramek, AV ramek vlastně a tam už se dá provozovat třeba Kimika 2,5. Tu trojku tam nerozjedete, ta je obrovská, ale 2 a půlka rozhodne. >> No, máš, Petře, nějaký tipy, jak donutit agenty, aby začali hackovat pro tebe? >> Hele, právě si je provozovat lokálně a vzít abliterated verzi, jo? Koho to zajímá, tak si najděte na Hugging Face, teďkom se tomu říká abliterated a tam jsou odstraněný veškerý zábrany a je to dělaný trošku jinak. V minulosti se totiž tady tyhle modely dělaly tím, že jste udělali fine tuning, kde jste ten model jako přesvědčili, že je v pořádku dělat, já nevím, hacky, návody na bomby a tak, ale teďkom oni přišli s nějakým výzkumem a zkusím ho kdyžtak pak nalinkovat do komentářů, kterej vlastně odstraňuje ty bezpečnostní vrstvy místo toho, aby je přeučoval. >> OK. To může být rozhodně zajímavý. Nevím, jestli Pavol už řekl svoji novinku. Pavle, máš něco? E, nemám přímo asi novinku, jakože hodně teďka sleduju to, co se děje v Open AI s Astrou a vlastně nejspíš s GPT 56 a vůbec jako všechny věci, co se kolem toho melou, ale nemám tam asi nic, co bych do toho já sám mohl přihodit. Zase není není novinka globální, ale spíš taková naše, že jsme použili agenta a dali jsme mu jako mnohem větší autonomii, než kdykoliv předtím. Vzniklo z toho několik takovejch hrozně zajímavejch překvapení. ještě evaluujeme vlastně, jestli to byl dobrej nápad nebo ne, ale minimálně za tenhle tejden jsem odeslal víc personalizovanejch emailů, než podle mě za můj jako minulej zbejvající život. Zbejvající za můj předchozí život. zbejvající, doufám, ne, protože dělá, protože jsme dělali workshop a ještě budeme dělat workshop a původně jsme chtěli udělat prostě klasickou emailovou pipelineu, takovou tu takovou tu klasickou nudu, že jakoby přistane ve formuláři nějaký email, po hnedka se odesílá jeden email, po pár hodinách se odesílá další, pak další a je to úplně jako hloupě nastavený časově jako template. Ale místo toho jsme udělali to, že jsme si vyrobili agenta, kterej má napojení napojení na gmailový appy, takže umí ovládat vlastně Gmail. Nemáme tam tolik, máme tam asi 1000 lidí, takže, takže se to ještě dalo dělat tímhle způsobem. Když jich tam budeme mít víc, tak to bude muset být přes něco jinýho než Gmail. A ten měl prostě za úkol těma lidma komunikovat. Nebyl omezenej tím, kdy, co musí a jak poslat, ale jako měl za úkol, má měl za úkol ty lidi tam dostat. Některým lidem psal víc emailů, některým míň emailů, některejch hodně ujel teda, což mně přišlo vtipný. Co mě úplně nejvíc zarazilo, bylo to spoustu těch emailů, co jsem odeslal nebo co můj agent odeslal, tak já sám bych je v životě jako takhle neformuloval nebo nebyl bych takhle invazivní a drzej, protože on si třeba ty lidi trošku překlepl, zjistil, že danej člověk třeba pracuje s Power BI a tak ten jel jako hodně personalizoval tak, aby to jako mířilo na toho konkrétního člověka. A co mě překvapilo, že jako přesto, že to byl hromadný email, tak fakt hodně lidí odpovědělo jako kdyby to nebyl hromadný email, protože ono to tak vůbec nepůsobilo. Další věc, kterou ten agent dělal, bylo, že si automaticky vytvářel web k tomu k tomu webináři, ty všechny věci, tak aby byly připravený k tomu, aby to běželo dobře a měl jako úplnou volnost. Mohl mohl jako libovolně dávat do toho jako repozitáře, co chtěl. mohl dělat databázový migrace. Já jsem to samozřejmě potom na konci ověřil, že je to všechno dobrý, že tam nejsou žádný keksy, že tam nějaká bezpečnostní zranitelnost a tak, ale překvapilo mě, nakolik to fungovalo dobře. Vlastně jako kdybych měl opravdu externího zaměstnance, kterej mně pomohl s workshopem a já jsem v principu jenom viděl, jak nám odpovídají lidi a přihlašujou se nám tam lidi. To mě zajímá, jestli jak jste to jako skládali, jestli jste tam třeba měli fakt jako nějaký i feedback loop na to, jak je to formulovaný, protože na mě vyskočila samozřejmě ta stránka k tomu workshopu. První, co na mě vyskočilo, bylo kde se agenti lámou. A já úplně panebože, to je tak moc AI fráze a to mě jako to mě jako zabolelo u srdíčka a říkal jsem si, že zrovna tohle jako bych čekal, že že se jako podchytí. Já mám právě jako i killy, který dělaj jako antiagentní češtinu, angličtinu a formulování a tak. Ono totiž ono to celý ten proces byl vlastně jako rozdělený v principu na dvě části. Na tu část tý jako landing page a reklamy. To dělal vlastně neonméia, naše reklamní agendura a teda udělali to dobře, protože se tam jako měli jsme strašně dobrou cenu za člověka a za prok. Ale je pravda, že to vypadá hodně AI. To si myslím, že je jenom o tom, že že jako, že jinýho našeho agenta na to pošlu, než tyhlety jako AI traces jako z toho vymaže, že jako my na to máme nějaký prostě jako mechanismy, jak tyhley AIOV tracy zmazat, aby to prostě člověka netrigrovalo. Ale já si myslím, nebo aspoň jako z mý zkušeností, tohleto víc triggruje nás než jako běžnou populace. >> Asi jo. No >> kurem. Já třeba osobně e já úplně jako nesnáším jako já osobně jsem úplně e rudej, když na mě vyběhne, jak je takovej ten týpek, myslím, že ne Pavel Nedvěd, Honza Nedvěd se jmenujal. >> Jo a tak to je to je jako figurka na český marketingový scéně, která je jako speciální. >> Jo, ale zjevně jako zjevně mu to funguje takhle. On je extrém. On je úplně totální bizární extrém. Já jsem nebo aspoň doposud jsem byl na tom úplně opačným extrému. Já jsem vždycky před každým emailem, před každou komunikací, co jsem posílal, jsem si řík, to je blbý, přece takhle bych to neformuloval a mám tomu člověku tykat nebo vykat. Není blbý říkat dobrý den, Petře. A mně přijde, že jako člověk musí být někde mezitím. A jedna z věcí, v čem mě ten agent pomohl, je jsem ty emaily neodesíkal Lea. Prostě se to stalo a teď já si říkám: „Ty vole, to já jsem fakt odeslal, jakože tohleto jsme opravdu vypustili. Tady je takováhle věc a já mám problém s tím, že já kdybych nad tím přemýšlel moc, tak takovouhle věc jako neudělám. To se mě to prostě nepovedou. >> Jo, jako rozhodně ten agent jako pomůže pomůže zbořit některý bariéry >> a hlavně ti omůže si uvědomit, že některý věci jsou opravdu jenom v tvojí hlavě, že často spousta lidí to vnímá úplně, ale úplně jinak než ty. Čím přesně dokázal bys to nějak líp formovat? Čím přesně tě trigruje ten styl Honzy Nedvěda? že jako mně přijde, že on ačkoliv je jako vlastně lidskej hodně, tak v nějakým smyslu je takovej jako právě tímhletím AI. >> Hele, mě v principu jako netrigruje on, protože mám odblok. Lidi, co ho nemají, on je přesně ten případ jakože otevřu dveře, medvěd, otevřu ledničku, nedvěd, bojím se jít na záchod prostě. Jo a on jako seěně nebojí mluvit o tom, jak moc pálí prostě peněz na reklamu, jak se jim to stejně vyplatí. Já si jako na tohle bych potřeboval nějakj jako názor fakt reálnejch markeťáků. Na druhou stranu dlouhodobě mu to funguje. Kdyby sypal takový prachy a nevynášelo mu to, tak je to prostě. Takže myslím si, že je to prostě speciální figurka na český scéně, která má svůj styl. Stejně jako v minulosti byl, že jo, info marketing toho Davida, teď si nevzpomenu na jméno, >> Kirše. >> Jo, >> že jo. >> Tak to byl podobnej styl. Taky to prostě je přinesený z Ameriky, agresivní styl a tak. No, já mám takovou hypotézu, že možná často nezáleží ani tak na kvalitě těch těch zpráv, který posíláš nebo který vysíláš, ale možná na té konzistenci a na tom na té frekvenci, jakože to mně přijde jeden z velkých významných faktorů u toho úspěchu a to se právě, jestli medvědovi daří. No ok, nevím, co k tomu máte další. >> Já tuhle debatu trošku ohnu k programování, ale paradoxně zůstanu od tématu. Já často vidím takovj jeden jako zajímavý efekt ve firmách, kdy vlastně je firma, ta má produkt, ta firma funguje velmi dobře, produkt funguje velmi dobře, ale adopce AI je v podstatě nul. A to proto, že ty seniorní programátoři, kteří tam jsou, tak vlastně mají ten pocit nebo jakoby naráží na tu bariéru, že na to, aby EA dobře fungovalo, tak je mu potřeba nechat určitou volbnost. Je potřeba udělat jako pravidla okolo. Je je potřeba jako vystavět tu pipelinu, která to celý kontroluje, ale zároveň je tomu AIKu potřeba nechat, aby běželo, aby fungovalo. Jenomže často ti lidi, kteří strávili roky pyipláním nad tím jako dokonalým produktem, tak vlastně mají pocit, že hm, ale teďka tam jdou nějaký, teďka tam prostě jde jako 1000 novejch řádek kódu a my jsme si je všechny neprohlídli. Tady to by mohlo být trošku jinak. Tady ta funkce je napsaná jako špatnou notací. Tady to je pojmenovaný trochu mimo náš manuál a vlastně nedokážou úplně jako vzdát tu kontrolu a tím pádem to Aik jim reálně jenom přidělává práce. Myslím si, že jedna jako z nejtěžších nebo největších bariér adopce AI ve firmě, která už funguje, není to jako 150 triků, jak správně promptovat, ale je nějakým způsobem rozumně vybalancovat to vzdání tý kontrole. >> Jo, ono to platí všude, nejenom jako marketing, vývoj, vlastně všude, všude je tam nějakj ten překryv. A mně přijde, že u sebe třeba víc jako pozoruju tu volnost v tom jako kódu. že tam sice jako jsem pověnoval se hodně tomu, abych měl nějaký quality a tak, ale je to díky tomu, že tam mám expertzu, kdežto marketingu v sales a tak expertzu nemám, takže se mi jako na jednu stranu z nás vzdává kontroly, protože nemám co kontrolovat, na druhou stranu tam mnohem víc vidím to, co nefunguje u ostatních, kteří to jako automatizujou a nechciu spadnout do týhle škatulky. Takže je to takový jako oboustranný za mě. Možná to je jenom můj problém, že jako tam, kde nemám expertízu, tak nechci být tolik náchylný k tomu, co AI jako vymyslí za slovo. >> To je mimochodem hrozně jako zajímavý, že jako existuje Ding Krueger effect a teďka problém je v tom, že člověk sám vůbec neví jako kde na tý škále je. Ne, nejvýhoda, že já jako tohle strašně posiluj, že najednou u věcí, kde člověk reálně tu expertzu má, tak jako mu to a já jako připadá v spoustě věcech blbý a třeba ho potřebuje strašně moc kontrolovat, nedá mu tak, nedá mu jako zdaleka takovou volnost. Tím pádem ty lidi, kteří v tom mají menší expertízu, tak toho udělají vlastně paradoxně mnohem víc, protože tomu AI nechaj nechají volnost a třeba ta věc bude udělaná trošku hůř. Čistě rychlostí tý exekuce to prostě předeženou. Na druhou stranu jako u každé věci asi existují nějaký oblasti, kde je potřeba vyjet, kde hrozí průšvihy. Třeba se mě přijde, že taková jako úplně úplná klasika je teďka super base a nezabezpečený tabulky a to my jsme tím taky vinný, což je jako hrozný, protože já vím, o co se jedná. Akorát jako znám lidi, co mají reálně apky, který jako mají poměrně hodně uživatelů a vůbec netuší, o co se jedná. Mají tam tady ten bug a ani jako neví, že to je problém. Ne, ne, ne, že jakoby si uvědomujou, že ok, je to nějaký acceptable risk nebo že něco, ale prostě ani netuší, co to je databáza. Ale maj apku. [vzdechy] >> Chceš vydat seznam těchhletěch aplikací? >> Já jsem nikdy nebyl, já nejsem dobrej hacker nebo já jako ne nemám úplný duši hacker. Já jako mě nikdy nelákalo věci prolamot. Mě vždycky bavilo ty věc, ty jako nový věci vyrábět. Takže kdybych byl víc hacker, tak si udělám nějakýho agenta, kterej jednak obejde ty ochrany open antropicu, případně pod nějakým žínským modelem a bude automaticky hackovat. Ale mě to vůbec neláká tohleto dělat. A >> já mám ještě jednu poznámku k tomu, co jsi říkal, že lze dohnat nedostatek expertízy rychlostí exekuce nebo nějak nějakým smysu to kompenzovat. Mně přijde, že co často vidím je, že když ty necháš tomu AIU volnost, ono něco udělá, nějak se to prostě zexekuje, v nějaký kvalitě se to vyrobí, ale jsou tam třeba nějaký nedostatky, které seniorní vývoř prostě opraví. Ty pokud nevíš, co se děje přesně, tak příště, když to budeš dělat podobnou věc, tak ty stejný chyby tam prostě nasekáš znovu. Pokud si nevytvoříš nějakej loop, kterej to AIO dokáže nějakým způsobem internalizovat ten obsah těch připomínek, který měl ten seniorní vývoř a příště už tu chybu neudělá. Prostě jde mi o to, to je důležitej mechanismus, jak se člověk zlepšuje a učí učí se novým věcem. Jenomže asi to bude mít nějakej strop ta rychlost tý exekuce. >> E to jsme tady řešili už v nějakým díle, že třeba pozoruju hodně u Onicu, kdy oni jako chrlej různý varianty a pak nás jako přesvědčujou, že to je správně. Já třeba jako nechápu smysl tagu jakože ve sleku toho jejich bota prostě. What the A přitom oni jako nás přesvědčujou. Ostatně Karpaty si jednu chvíli, nevím jestli to stále platí, zavřel profil, protože lidi ho začali hejtit, že se nechal nahajrovat, aby šiloval za na produkty antropiku. A mně prostě jako přijde, že je tam určitej strop, kdy můžeš jako zkoušet ty limity lidí. Stejně jako v emailingu, když jsme ho tady řešili, tak taky jako můžeš jet super agresivně nebo můžeš bejt trošku jemnější. A otázka je, jak ti to přetřese ten list, kolik lidí tě nahlásí, jako spam, kolik lidí se odhlásí a tak dále. Takže je to je to prostě nějakej trashhold, který ještě navíc k tomu kulturně závislej. Já když jsem řešil před rokem a půl nějakou emailovou kampaň, tak jsem si prošel, jak se to dělá jako v Americe a tak a tam jako na jednu kampaň, která trvá třeba měsíc, pošleš osm emailů, 10. A v Česku jsou lidi nasraní jako po třech až pěti. No to je těžký problém, jak to celý optimalizovat tyhlety tradeofy. Myslím, že není jako obtížně se to měří, obtížně se to vyhodnocuje a dělá se nad tím nějaká statistika. Je to prostě takový trošku umění. >> Já myslím, že do nějaký míry člověk obzvlášť jako v takhle rychle měnícím světě ty hrany člověk jako musí trochu testovat. Jedna z věcí, co my třeba jako velmi systematicky děláme, je to, že snažíme na AIU delegovat asi trochu víc zodpovědnosti a trochu víc autonomie, než je v danou dobu běžný. Samozřejmě narážíme jako samozřejmě máme spoustu faktů. Spíš si říkáme, že je dobrý mít nějaký jako mechan jako jednak tu zkušenost, protože teďka teďka se hraje to jako kdo kdo se na tom polu etabluje a zároveň je dobrý mít nějaký jako mechanismy, jak neudělat mega průšvih, jak udělat jenom mikroprůšvih. >> Tím se vlastně vracíme trošku na začátek, jak Petr mluvil o autonomním, o tom novým startupu, kterej se oddělil od od Googlu. Pokud je to tak, že ten human in the loop je schopný si vzít ponaušení a udělat to příště líp, nebo testuje hranice a něco novýho se tím dozví, tak si myslím, že to je úplně v pohodě. A přesně takhle se prostě dělají nový věci, který třeba lidi nenapadnou, dokud to nezkusíš, dokud těch vapů nemáš prostě desítky. To se to mě třeba baví strašně moc. Je to ten rozdíl mezi nějakým, řekněme, thinking modelem, kterj podle mě tuhletu schopnost stále ještě nemá, jakole nějaké jako reflexe, hlubší nebo nějakýho odstupu a podívání se na ty věci a zhodnocení, že jako no nevím, jestli to říkám nějak srozumitelně, ale prostě tohle je takovej pocit, kterj myslím, že kdyby se objevil nějaký skutečný AGI, tak by tohleto muselo umět. Ono je to, ono je to strašně těžký, jako třeba, že jo, Google už má, už má přes rok ten výzkum, kdy jsou schopni měnit ty váhy toho modelu a dávat nějak mu nějak memory a tak dále, ale reálně jsem to jako v praxi neviděl. Jednu dobu to vypadalo, že oni začali razit, že ten model bude personalizovanej i podle vaší historie, prohlížeči a tak. Tak jsem si říkal, jo, to zní jako něco, že už aplikujou ten svůj výzkum, ale reálně jako Jemine je 100 let za opicema, prakticky využití je jako tady tu funkcionalitu jsem ani neviděl, že by se vůbec zapla. Je možný, že je to samozřejmě kvůli Evropský unii, která řekla:„No tak teda ne, jako nebudete tady personalizovat podle veškerý historie, co u vás jako mají.\" Ne, že by se to nedělo, jenom to nesmí dělat v felalemkách, protože ty jsou teďkom pod drobnohledem AI actu a podobnejch věcí. >> Nevím. No jako souhlasím s tím, že aby to skutečně mohlo dojít k nějakýmu AGI, tak to musí mít schopnost se učit a jako aktivně učit. Nejenom jako, že uděláme RCK s nějakejma markdown filama nebo něco podobnýho, protože to je jasná ukázka toho, když mám malej model, on prostě nebude mít tu dostatečnou work knowledge a nebude umět ty abstrakce. Takže Kven je sice jako skvělej, když se vrátím k tomu tématu, ale aby uměl jako dobře generalizovat mezi programovacíma jazykama, tak to už je u něj jako horší, stejně jako generalizace mezi normálníma jazykama. Přitom už máme z minulosti vypozorovaný, že Google Translate tak si vytvořil, že jo, svou jako mezivrstvu pro překlady mezi mezi jazykama a to už je jako x let zpátky. z určitejch důvodů a ty důvody jsou jako nepochopitelně nebo pochopitelně validní, tak nechcou tohle vypustit, že jo. Microsoft měl ten svůj model, kterej se aktivně učil z toho, co lidi napsali a během chvilky z toho bylcek, kterej požadoval vytání židů. Je to prostě o tom, že dostanou se k tomu lidi, kteří budou testovat ty hranice. >> Mně přijde, že existuje ještě jedna taková. Já já to jsem to teda už zmiňoval jako mnoho mnohokrát, ale připadá mě, že je to jako opět relevantní taková ta metrika. Jak dlouho dokáže agent běžet bez zásahu člověka? Já si myslím, že tady to není zase jedna nebo nula. My jsme my se jako my postupně tenhle čas prodlužujeme, že jako vlastně my jsme třeba teďka s Jirkou udělali experiment, že jsme nechali agenta běžt v podstatě zcela bez zásahu týden, aby spravoval nějakou agendu a on samozřejmě někam trošku oddriftoval, kam bychom nechtěli. Podle mě úplně ultimate goal je jako mít nebo těžko říct, že ultimate goal, ale jakože je jedna z jedna jako strašně cool věcí by bylo mít agenta, kterej opravdu jede zcela bezahově a může jako běžet jako 10 let po smrti člověka klidně, což teďka podle mě reálně ještě není možný. Pro nás ten nejdelší horizont, co nám nějakej agent smysluplně běžel, podle mě důležitý je to slovo smysluplně, protože jakoby to, aby něco běželo týden, je v pohodě. udělat, ale aby to opravdu udělalo jako nějakou práci, kde bychom si řekli, jo, to mělo smysl tohletu nechat jako spuštěný, tak bylo teďka ten týden. >> Záleží, no, jakože u inýu je to podle mě jako jednodušší, protože seš schopnej udělat jako plán a striktní feedback, že to klidně bude i přes týden, ale musí to bejt fakt jako už komplexní záležitost. U jinejch věcí, tak ten týden je jako docela jako hranice, která si myslím, že je na většinu projektů bude smysluplná. že že nezačne moc driftovat. >> Já mám ještě jednu takovou vtipnou věc. To už je před dvou týdnů, kdy já jsem jako schválně dal našemu jako agentovi, protože mně jakoby vždycky vždycky na těch vibecingových platformách vadí to, oni umí strašně dobře udělat ten projekt do toho zadání, protože je to nějakej repozitář, možná někde byl publikovanej. Jenomže typicky projekt nekončí tím, že je publikovanej. Typicky o projektu je potřeba dát vědět lidem, je potřeba nasbírat nějakej feedback, je potřeba odpovídat na support, je potřeba udělat strašně moc těch věcí jako potom. A já jsem jako schválně chtěl zkusit udělat takový, já jsem jako využil Maky pro vyrobení toho projektu nebo můj agent využil Makali, ale eh pak ještě jako měl pár dní, co ten projekt měl propagovat, měl ho někomu jako postovat a tak docela vtipný, co si vymyslel, že má udělat za projekt, aby zaobalo co nejvíc lidí. Tak e ty můžete hádat jako co za projekt vymyslel agent, tak aby zaujal co nejvíc lidí. Eh, souvisí to s nějakým nějakým sexuálním obsahem, >> ne? Ale jsi blí nějaký fitness, něco takovýho nebo vydělání peněz. Buď hubnutí nebo peníze, >> ne? Eh, vyrobil eh mapu vražd v český republice a v příběhu k nim. >> A já jsem říkal, to koho by tohleto mohlo sakra zajímat? A on to jako napostoval do jako různých jako mým jménem do různých lokálních skupin, takových jako Praha, Praha Klánovice, Praha Dolní Počernice a vždycky jakože tady se stalo tohle tam. A já mě překvapilo, tolik lidí se zajímá o to, kde se staly nějaký vraždy, že protože nemají nic jinýho na práci. Vždyť nadávají na politiku u piva nebo řešej vraždy na TNCZcz. popravdě, ale já jsem se na to taky koukal a říkal: \"Ty jo, opravdu tady byl zakopanj ten poklad, kvůli kterýmu se vraždilo v klanovickém lese tehdy, jak to bylo >> jako >> samotný mě to zaujalo. >> Mě jako nezajímají třeba vraždy jako obecně, ale já zas jako ujíždím na tématu jako mafie a podsvětí a tak dále, takže bych tam asi jako taky zabloudil, ale spíš jako za jiným účelem. A pokud tam budeš mít zmapovaný až jako vyschne orlík, tak tam půjdu určitě. >> To je dobrý. No, >> mně právě připadá, že jakože já mám úplně strašně jako takovej, že chtěl bych někdy mít spuštěnou Dark Factory, která prostě jako jede, vytváří věci, který ty lidi zajímají, jsou zajímavý a jako atraktivní, užitečný. Já nejsem ten, co musí jako řešit tu obslužnou práci okolo toho. Já jsem jenom ten, co třeba určuje ten morální kodex toho celýho nebo ty úplně základní jako boundaries z toho celýho, ale ne ty jako detaily typu, že tak jako jaká konkrétní apka se obdělá, na jaký doméně poběží a jakým způsobem eh na ní poběží reklamní kampaň. To mě třeba jako vůbec nezajímá. To nech to nech si vyřeší ta Dark Factory sama. Jako určitě by to byl zajímavý experiment to fakt jako dotáhnout do next levelu. Můžem na to někdy sednout a zkusit to jako rozjet fakt naplno. >> Myslíš Dark Factory enable stránku o vrajdách? Hele, Dark Factory, která bude fakt jako precizně connectit všechny možný data a vytahovat prostě věci z Google Analytics a nějakejch jako SEO programů a všeho možnýho, tak to by mi přišlo jako fakt zajímavej experiment, protože nevím na kolik tys to, Pavle napojil na nějaký jako reálný data sources, z čeho to vycházelo, ale myslím si, že když by to vyloženě bylo Dark Factory, která bude mapovat aktuální trendy na sociálních sítích ve vyhled a tak a bude promptně reagovat na to, aby tam lidi jako chodili, že to je něco, co je zrovna trendy, mu rychle udělá web, naplní to datama, ty ověří a všechno. Tak by to mohl bejt jako hodně zajímavej experiment i z hlediska toho, kam až seš schopnej dostat stránku, která vlastně má nulovou historii. >> Hm. Když se bavíme o Dark Factories, v některých dílech jsme tady řešili autonomní agenty pro výrobu softwaru, tak jaký jsou, změnily se vaše odhady od minule? Teďk mám rozkliklou sérii článků právě od lidí v Americe. Chystám si ji přečíst, takže až ji přečtu, tak o ní kdyžtak budu mluvit v nějakým z dalších dílů. Ale právě se tam jako mluvilo o tom, že Dark Factory jsou často spíš sen, než něco, co se dá zrealizovat, protože je to přesně o tom, co jsme si jako už xkrát říkali. Když mám úspěšnost 99 %, tak je to hezký. Ale pokud složím 60 kroků, kde mám úspěšnost 99 %, tak ten výsledek už je jako mnohem horší. Takže podle mě tam jako jsou ještě některý věci, který jako chyběj k tomu, aby to mohlo skutečně projít. A proto teďkom jako to kterej dělám pro Dark Factory softwarový, tak není o tom, že udělám dobrou sadu nějakejch promptů všeho, ale že buduju tu feedback loop. buduju prioritizační tool, který fakt jako projde všechny možný chyby, který mám a jsou to lintovací chyby, security chyby, nějaký SEO věci typu chybí nám nějaký descriptiony a podobný věci, nebo nemáme canonical části HTML a podobný. A dá mi to prioritizaci toho, protože on je strašně jednoduchý říct, tady máš 50 000 chyb ve tvým kódu. Už není jednoduchý říct, tohle je actually důležitý. Takže tohle je teďkom jako můj fokus. Druhej fokus je samozřejmě nějaká optimalizace usage. >> Jo, to je další velmi důležitý téma, s kterým se i my setkáváme velmi často, že nejenom, že není těžký vyrobit agenta, kterej autonomě týden běží, ale vůbec není těžký prostě spálit na něm prakticky neomezený množství tokenů a veškerej benefit, který ti to přinese, je téměř nulovej. Tak tomuhletu se snažíme samozřejmě vyhnout. Pro proto jsem říkal jako smyslný využití a ještě nejvíc je potřeba mít jako na paměti to, že jako teďka je ta cena jako strašně dotavaná, že jakoby to, co se dneska může zdát jako smysluplný využití, vlastně nemusí být smysluplný využití, ale pálit token narmo, to je jednoduchý. To je jako skoro lepší těžit bitcoin, jako udělat něco jako pustit agenta na smysluplnou práci, tak aby ta práce vyžadovala co nejmíň lidský intervence. To bych řekl jako velkej úkol. Jo, tohle mi zní jako docela dobrej závěr dnešního dílu, pokud nemáme něco dalšího. >> Já už nic nemám. Musím říct, že teďkom ten rozjezd za mě byl trošku pomalejší. Příště přijdu připravenější i s novinkama a tak, ale jsem rád, že jsem zase v krajě zpátky. >> Jo, to mi taky. Super. >> Tak jo, tak budeme rádi za komentáře. Budeme se těšit na další díl. >> Ahoj. >> Ahoj. >> Díky. Cčia"
businesses\ai-ta-krajta\aiTaKrajtaEpisodes.json:81:        "transcript": "Dobrý den, vítejte u 57. dílu našeho podcastu Ata Kajta. Dnes s Pavelem a s Jirkou my děkujeme sponzorům promuku a AI supervizi. A jdeme na novinky. Tak Pavle, co tam máš novýho? Já si myslím, že dneska nemůžu začít vůbec s ničím jiným, než s tou anabází okolo antropiku, Fablu, jeho bombastickým vypuštěním a následným zákazem a vůbec e toho, co to znamená pro nás, co to znamená pro Antropik, jaký všechny konsekvence a věci z toho vyplývají. >> Já jsem záměrně říkal, co máš za novinku, protože jsem tušil, že budeš chtít mluvit o tomhletom. Je to velmi vtipný podle mě a myslím, že už se tím ani nenechávám příliš moc vzrušovat, že se něco takovýho děje. Nevím, jak moc je to projev nějaké otupělosti, ale příjemně, že kdybych byl zastánce konspiračních teorií, tak si budu myslet, že Donald Trump akcie Antropu a že poté, co poté co Antropic vstoupí na burzu, o čem jsme se tady bavili minule, tak ty akcie prostě stoupnou na ceně, protože on ten mitos prostě znovu nechá otevřít a nebo spustit. Pojďme se zamyslet nad těma důsledkama. Pojďme to trošku systematičtěji rozebrat. Já bych tam viděl takový dvě linky toho celýho, nějakou prouitickou a faktickou. Já bych možná jenom trošku shrnul tu faktickou, protože přenom jsme měli nějaký, nevím, jestli dva nebo tři dny, co jsme se mohli Fable zkoušet a my jsme to sami hodně intenzivně udělali. Ty sis s tím rovnou vyrobil full aplikaci pro zákazníka. Já jsem pustil prombu koder s fablem a eh vypotřeboval jsem spoustu placnejch tokenů. Jako moje osobní zkušenost je [odkašlání] ta, že je to srovnatelný s GPT 55. Teď mě určitě jako spoustu lidí rozebere v komentářích, ale já teďka opravdu týden čtu všech sítích, že jak je to absolutně totální přelomový moment, kterej zase jako totálně změnil svět. Mně to tak nepřijde. Tím jako nechci říkat, že ten model nebyl není dobrý nebo že jako nebyl lepší než plus 48, ale jako buď to překročilo nějakou úroveň toho, na který to já umím použít a využít, nebo je to do nějaký míry velmi dobře prkově prodaný. Jo. >> Hele, já si myslím, že to, v čem to je rozdílný nebo lepší možná než předchozí modely, je věc, kterou my asi standardně nepoužíváme a proto nám to přijde lehce. jako neviditelný nebo naší rozlišovací schopností. Toho jsme se vlastně už dotýkali v tom minulým díle, kdy jsme vlastně Fable čerstvě vypuštěnej do světa rozebírali. Dneska rozebíráme čerstvě Fable staženej ze světa. Myslím si, že kdy že bychom byli etický hackři nebo prostě měli firmu založenou byznysu tohodle stylu typu, tak bychom třeba přišli na nějaký rozdíly, ale jako já mám podobnej pocit vlastně ač velmi nerad, tak s tebou souhlasím, protože mně přijde, že to je takový nudný, že v tomhletom prostě nevidím až příliš moc velkých rozdílů mezi třeba kódem 48 a Fablem. Možná, co mě přijde zajímavý, jsou ty důvody, ty oficiální důvody toho stažení toho zákazu. Mně to přijde jako trošku nedůvěryhodný. Vlastně mě to trošičku připomíná celkové americký administrativy a a Donalda Trumpa. Takový to jakože vlastně my jsme se dohodli a ty lidi, s kterýma jsme se dohodli, o tom sice vůbec neví, ale prostě jsme se dohodli a a ono to tak nakonec bude. Mě by zajímalo, jestli teda můžeš třeba nějak pro posluchače shrnout ty oficiálně deklarovaný důvody a pak pojďme třeba zkusit rozebrat a trošku se zaspekulovat o tom, co jsou možná ty skutečný důvody. Ten oficiální deklarovaný důvod je bezpečnost a to, že to umí bypassovat jako některý jako věci. Zajímavý, že s tím přišly lidi z Amazonu, který ve skutečnosti by měl mít důvod k tomu, aby Antropik slavil úspěch. Takže vlastně sám jako nevím, jestli tady ten krok, co se stal, je pro Antropik spíš jako dobře nebo spíš špatně. To je vlastně jako zajímavý, že myslím si, že jako tady to má celkově jako několik jako různejch hledek. Myslím si, že pro koho je to naprosto jednoznačně špatně a absolutně jako brutální budíček, je pro nás pro Evropu. Protože teďka ta jedna z nejdůležitých technologií, která je, která nejspíš bude opravdu rozhodovat jako budoucnost toho, jak tady vůbec bude vypadat ekonomika, společnost a jako všechno další jako desítky let, tak tuhletu technologii my máme absolutně ne pod kontrolou a měli jsme takovou jako zvláštní iluzi, že ji pod kontrolou máme, protože přece jenom se dostaneme k stejným modulům, můžeme je stejně používat, eh platíme za ně stejně, ale není to tak. Zen se může stát, že my o ně přijdeme a někdo jinej na druhý straně světa o ně nepřijde a tím pádem my přijdeme o velmi zásadní výhodu, která z toho může vyplývat. Druhá věc je, že si myslím, že v tuhletu chvíli konkrétně z Fablu nevyplývaly takovýhle zásadní výhody, ale ono se jako může stát to, že tady ten zákaz nebo tady ta věc eh se postupně bude aplikovat na nový a nový modely a ve chvíli, když tímhletím způsobem my budeme eh třeba z půl roku pozadu oproti tomu, co je v Americe, tak to může poměrně hodně poškodit naši ekonomiku a jako celkově to, jak tady firmy fungujou, jak jsou konkurenci velice schopný a tak jako pro mě je zajímavý to, že vlastně velmi podobný bezpečnostní problémy, řekněme ty, který aspoň byly deklarovaný v tý v tý zprávě, tak se dají velmi dobře uplatnit i na GPT 54 a 55. Ale opět mně přijde, že se dostáváme k tomu, že myos je strašně dobře prvě zahraný příběh, kdy před tím zhruba měsícem vyšel Antropic s tím, že má úplně jako model totálně nový kategorie, který objevil bezpečnostní zranitelnosti v mnoha různých softvérech a udělal okolo toho obrovskej příběh, na kterém je podle mě tohleto do velký mě stavěný, ale myslím, že úplně ten samý mý příběhy veselo říkat o jiných modelech. Akorát se prostě o nich neříká. Teďka zrovna je na na koni antropic, ne? No na úplnej jáj. Nevím, jestli to vidíš stejně nebo >> Jo, já se pořád nemůžu trochu zbavit domů, že ve skutečnosti se nakonec ukáže, že pro Antropik tohleto bylo dobře a že to je jenom prostě nějaká epizoda v nějakým delším příběhu. Mám pocit, popravdě jako nechápu, proč se takhle měří dvojím metrem. dvěma různým společnostem, který mají velmi podobný produkty a který jako vlastně nejsou až tak rozdílný. Jako nemám pro to žádný vysvětlení, ani nutně ho nehledám a počkám si na ten vývoj. >> [frknutí] >> E, co mě přijde jako vlastně fajn, je, že pro Evropu je to velká a dobrá příležitost a jak se říkal budíček a nemyslím si, že by to bylo něco fatálního, protože myslím si, že ta ekonomika bude neuprostná, že ty společnosti stále potřebují trh, jako je Evropa nebo Evropská unie. A když je, když všechny ty modely budou nedostupný pro Evropu, tak to pro ně bude znamenat, řekněme velký omezení. A popravdě si nevím moc představit, že by to takhle jako mohlo dopadnout dlouhodobě. Takže e vlastně vidím to spíš pozitivně. Vidím to tak, že zatím se nás to až tak moc nedotýká, protože srovnatelně výkonný modely stále máme k dispozici a řekl bych, že je to vlastně spíše dobře, protože máme tady firmy jako je Bottlec AI, e, Tomáše Mikolova, který prostě zareagovali na tuhle zprávu očekávaným způsobem, že máme čekat další zprávy od nich. Tak já se těším, já se těším na to, s jakýma zprávama přijdou a vlastně mě to připomíná to, jak jsme se bavili před natáčením, že když v 70. letech byla ropná krize, tak zatímco Sovětskej svaz reagoval tak, že svým satelitům dodával levnou ropu a všechno tak nějak saturoval přirozeně, tak v Americe to byl prostě velkej problém. A skončilo to tak, že osobní počítače vznikly prostě v Americe a internet vznikl v Americe, ne ve Sovětským svazu. >> Jako co já úplně neumím rozplíst, co co vlastně do doteď moc nechápu, je to, zda tahleta celá věc je pro antropik dobře nebo špatně. absolutně netuším a vlastně by mě strašně zajímalo jako od vás diváků, nech nám jako napíšete na to názor. Já absolutně netuším, jestli tahleta věc, protože na jednu stranu je to určitý jako mytický příběh o antropiku se strašně silným modelem Mytos, který se tímhletím jenom posílil a na druhou stranu jako konkrétní produkt, kterej jako zjevně chtěli vydat, tak teďka najednou ho museli stáhnout. Eh, netuším, netuším, jestli je to dobře pro Open AI, který jako na jednu stranu ty jeho modely nejsou zakázaný, na druhou stranu kolem těch jeho modelů denně zdaleka takovej hype. A stejně tak si nejsem úplně jistej, na kolik je to dobře pro Ameriku a pro Trumpa. Tram na tom asi nějak jako vydělá, těžko říct, ale co jsem si jako téměř jistej, že je to jako průšvih, totální průšvih pro nás a já to rozhodně nevidím takhle růžově. Mně přijde, že budíček, já si myslím, že budíček tady měl být před jako třemi lety nebo pěti lety, protože tak jako úpřímně, když se podíváme na jako čísla a na firmy, tak e prakticky jako všechno dneska má Amerika a Čína. A jo, nechci křivdit Mistralu. Mistral je dobrý model a jsou tady v Evropě, ale to je všechno >> jako asi nelze zastírat, že obecně výzkum a vývoj těhletěch převratných technologií už dávno neprobíhá na vysokých školách a na univerzitách. E ten důvod je možná ten, že eh způsob, jakým se výzkum eh financuje na univerzitách, je prostě naprosto šílený a trýstný. nevydělávají na něm univerzity a vysoký školy, ale vydělávají na něm publikační domy typu Elswears, Springer a podobně. A je to velkej průšvih. A tady bych asi začal, kdybych byl ministrem školství a kdybych byl někým, kdo tohleto chce řešit, tak bych se tomuhle tomu podíval pořádně na zoubek. A je vlastně otázka, jak celé tohleto vzniklo. To mně přijde velmi fascinující historie, ale já si myslím, že prostě je to přirozený běh věcí a čekám, že to nakonec nedopadne asi tak špatně, jak to vypadá. Jako možná nemám pro to úplně silný argumenty v tuhle chvíli, ale prostě prostě bych řekl, že to tak, že to tak je. Je to vlastně podobný jako já nevím, k čemu bych to přirovnal. Možná když to je příliš silný přirovnání, ale když prostě se Churchill snažil zavléct Ruswelta do druhý světový války a nakonec se mu to podařilo, tak prostě tohle je možná podobná situace. >> Jakože jedna z věcí, že my my jako Evropa a my myslím si, že se tady vůbec nedává smysl bavit o o Česku a eh a o nějakým našem úplně jako lokálním rybníčku. Myslím si, že my bychom měli být v podstatě v rámci nějakýho jako bloku evropskýho, ve kterým se ty věci věci a ten ekosystém děje, což se do nějaký míry děje, ale do velmi jako malý oproti tý Americe. A jako my jako Evropa jsme do toho rybníčku vstupovali jako mnohem horší pozici, protože reálně ty velký systémy, tak e byly v Americe a něco v Číně, jakoby Google, Microsoft, eh Facebook, Amazon, všechny tyhlety jako velký firmy, ze kterých jako tečou ty velký peníze, to velký škálování, tak ty velký firmy nejsou tady, ale jsou tam. A tady v Evropě vzniká spoustu zajímavých věcí, ale jako typickj exit těhletěch věcí e není někam jako v rámci Evropy. Typickej exit týhletý věci je, že se prodá Microsoftu, Googlu, Amazonu, Appluu, nevím komu. A v podstatě jako když se člověk podívá na jako jakýkoliv technologický produkt, který za posledních 20 let používá, tak ty důležitý věci tam byly americký. Pak bylo spoustu apék a spoustu takových jako jako sekundárních věcí, sekundárních zajímavých věcí, který pocházely jako jak z Evropy, tak prostě ze zbytku světa, ale jako to gro bylo americký a mně přijde, že se úplně to samý děje s AIem, že jakoby to gro, ty velký modely, ten velkej výzkum, ty jako velký věci, ty jsou americký a teďka i čínský. Myslím si, že co je zajímavý na AIKU, je, že to je první věc, která opravdu jako masivně funguje v Číně srovnatelně dobře s Amerikou. Je přesto, že je to tam financovaný úplně jinak, ale co se týká Evropy, tak my máme mistral. To je jako jediná věc, co máme nebo jediná jako velká věc, co máme. >> Jo, zatím to tak je a nějakou dobu to tak ještě asi bude. Dobře, tak máme teda tím pádem nějaký oficiální důvody, proč byl Fl zakázaný. Ačkoliv, nevím, jestli jsme to řekli dostatečně přehledně, ale prostě dejme tomu, máme nějaký důsledky, co z toho možná plynul pro nás, ačkoliv na nich jsme se úplně nezhodli, co dál bychom mohli ještě v téhleté souvislosti probrat nebo jdeme na další téma. >> No jakože já to to je možná jako otázka na vás, na diváky, že nakolik vlastně se takovejmhle věcem jako víceméně ne technickejm, ale nějakým důsledkovejm máme věnovat. Já jsem v tomhle jako minimálně za ten poslední, já jsem jako něco takovýho čekal, to jsem jako nečekal, že to bude udělaný takhle explicitně, že se jako opravdu řekne, že to nesmí jít mimo Ameriku a ne americkým občanům. Ono tím, že to není úplně technicky docílitelný, tak oni to prostě jako preventivně vypli všem. Otázkou je, jestli to takhle bylo jako plánovaný, ale minimálně už vůbec to, že se to jako udělalo, už vůbec to, že se to stalo, je podle mě eh potenciální průšvih, [frknutí] protože eh pokud se tahleta vě jakože je možný, že tohle je izolovanej jako incident, je možný, že jako u dalších modelů se jako zavede něco a v podstatě nic takovýho se dálnit nebude. Ale tak je možný, že už od teď dál ty jako dobrý věci a dobrý modely a opravdu jako silný nástroje budou dostupný americkejm firmám a my tady v Evropě budeme mít smůlu. A myslím si, že to by mohl bejt jako velmi velkej průšvih. Hodně mě zajímá jako váš názor, diváci. >> Tak jo, napište do komentářů, co si o tom myslíte, jestli chcete, abychom tohleto dál nějak rozebírali. případně si pozvali nějaký hosty, který třeba mají větší zkušenosti s tímhletím tématem. E, pojďme na další věc. Eh, zjistili jsme, já jsem si to všiml dneska, že h vyšel OKF, což je Open Knowledge formát od Googleu. Je to vlastně věc, která v nějakým smyslu řeší problém předávání kontextu velkým jazykovým modelům. Je to vlastně taková jako velmi sofistikovaná forma, jak vyrobit vlastní wiky. Trošku to připomíná souborový systém v operačních systémech Unixovýho typu. všechno je soubor a zároveň jednotlivý soubory odpovídají takzvaným konceptům, přičemž koncepty jsou prostě nějaký primitiva, který jsou třeba nějaký tabulky nebo nebo nějaký rambúy prostě jak se máte zachovat v nějaký konkrétní situaci a ty jsou provázaný prostě normálně odkazama na sebe. Tak tohleto je v podstatě v kostce OKF. Je to myšlený jako nějaký přenositelný formát, jak předat kontext různým platformám, který vyvíjí ať už agenty nebo nějak pracujou s LMkama a chcete jim podat kvalitní, dobrej kontext. Tak Pavel, jak bys z tohleto okomentoval? >> Mně přijde, že e tohleto vůbec jako nějaký zaznamenávání, management, držba a aktualizace kontextu bude jako obrovská věc do budoucna. Skoro si myslím, že to bude jako větší věc než ty samotný modely. S tím, že já jako hodně přemýšlím nad tím, že jaký by to mělo mít formát a zároveň si nemyslím, že na to jedna správná odpověď. Myslím si, že těch možností, jak tohle dělat dobře, bude jako mnoho různých, pro mnoho různých jako konkrétních odvětví a problémů, který se řeší. Vtipný, že mě to do nějaký míry připomíná vlastně tu základní myšlenku webu, kdy vlastně přesně web měl být takováhle pavučina provázaných dokumentu přes odkazy. A dneska tady to asi nejvíc připomíná ta Wikipedie. Co mně přijde jako druhá zajímavá věc z toho celýho je ta, že Markdown jako formátovací jazyk se vlastně úplně univerzálně ujal a vlastně jako neexistuje prakticky jako není není nic takhle strašně prevalentního, čím by ty modely uměly dobře pracovat. třeba z Antropic, když vycházely ty jeho první modely, jako byl Claude ještě dvojka, tak měl nějakej způsob, jak nepoužívat e Markdown, ale XMLko, ale to mně přijde, že úplně umřelo, že jako v principu ten Markdown to totálně převálcoval a No, pak se Markdown učí používat i lidi, co by předtím v životě takovouhle věc nepsali. Na druhou stranu, čeho já se trošku obávám a vidím v tom nějaký případný botlnack, je to, že když se koukneme na Wikipedii, tak tu spravuje armáda dobrovolníků několik desítek let. Díky tomu je to relativně spolehlivý zdroj informací, který má nějaký svoje pravidla, je spravovaný, je udržovaný. Eh, trošku si kladu otázku, kdo bude vyrábět tyhlety Wikipedie ve firmách. Eh, vypadá mi, že to nějakým vzdáleným způsobem může souviset i s nově vznikající profesí, kterou jsme zaznamenali Howard Depoy Engineer. prostě kdybych byl kdybych byl lehce eh cenickej, tak bych řekl, že prostě inženýři, kteří nemají teďka práci díky AI, jsou vysílaný firmama do terénu, aby aby zjišťovali kontext a asi ho budou ukládat do těch letěch Wikipedií, do toho toho OKFa, pak to budou posílat do Open AI nebo do Antropicu, aby si s tím poradili. mě, že to je jako zajímavý tuhletu linku trošku dál pronásledovat, jestli takhle může být nebo co jsou tam za překážky. To si o tom j myslíš, ne? >> Přijde mi, že to má vlastně, že jsou takový jako dvě roviny toho celýho a to, jak tenhleten kontext bude vznikat slaktualizovat se, ještě jako odbočka. Přijde mě, že je věc, co se dá poměrně dobře udělat. Poměrně dobře se dá eh takováhle věc udělat nanovo, aby byla hezká, funkční, krásná. Ale copak jako je problém, který z toho vzniká, který jako vzniká inherentně ve všech IT projektech, ale teď bude vznikat i jako v non IT projektech, je to, co je ten jako source of the truth, že co je to místo, který je pravdivý, že co když ta dokumentace, co když ten jako popis tý firby najednou nebude odpovídat realitě a jakým způsobem se ta realita bude propisovat do toho kontextu nebo kontext do tý reality. A myslím si, že myslím si, že jako strategie, jak tohle dělat, jak dělat ty aktualizace, tak bude spoustu různejch firem, který vzniknou, který tohleto budou dělat tím či oným způsobem. Ostatně jako něco takovýho děláme i my do nějaký míry a myslím si, že je jako ohromnej prostor na tom trhu dělat. A druhá věc, co mně přijde, je ta, že když máš jakýkoliv kontext, tak ten může být jako v různých formátech nebo v různých strukturách. A připadá mě hodně zajímavý na takovouhle věc zvolit grafovou dokumentovou vky strukturu. Myslím, že to má nějaký svý výhody a nějaký svý nevýhody a já si myslím, že jsou lepší způsoby, jak to dělat. >> Myslíš lepší způsoby, než je OKF? >> Těžko říct, jestli přímlu než OKF. tím, že >> nebo obecně Wikipedie. >> Jo, jo. Eh, jo, asi bych řekl obecně než Wikipedie. Jako já bych tam rozdělil několik věcí. Eh, rozdělil bych to, že ty jednotlivý dokumenty jsou notovaný v Marku. To si myslím, že jako skoro jedno, jestli by to bylo jako Mark nebo HTML pro tady ten můj příklad nehraje roli. Co je podle mě jako podstatný, je to, že je to nějaká jako směrová grafová struktura, kde máš vlastně jako mnoho různých bodů a každej může odkazovat na libovolný jiný bod. a vlastně tvoří to nějaký jako velký směrový graf. Myslím si, že pro většinu firem nebo pro většinu problémů bude dávat mnohem větší smysl nějaký jako mít strukturovaný formát a ty jednotlivý kousky těch informací mít nějak jakoby víc volnějš, než je mít zařazený v nějaký takovýhle struktuře. Ale nejsem si úplně jistej, jestli by to mělo být lineární nebo embedovaný v nějakým prostoru nebo nebo co by měla být ta věc. A druhá věc si myslím, že podle mě dává smysl tam mít a což ten OK formát má nějaký primitivy typu nebo primitivy nějaký jako předem nastavený guideline, jak tuhletu věc dělat typu slovník pojmů, typu repozitáře. >> Rozumím. Podle mě je velmi důležitý to, co jsi říkal předtím. Vlastně je tady vidět takovej trend, myslím si, a to je, že postupně se přesouváme od programování, který bylo jako velkým botoneckem do éry Context engineeringu ve smyslu ve smyslu, že ta znalost toho správnýho kontextu a toho, jak to ve skutečnosti v těch firmách funguje, je to, co je teďka to nejdůležitější a nejcennější a nejvíc důležitý. A myslím si, že podobně jako ty jsi to měl kdysi na jednom slaju, když když jsem byl na eh Atlast konferenci v 16. Řína 2025 v Ostravě, tak tam měl takovej slaj, že jak je vývoj těch programovacích jazyků, nultá generace, první generace, pak jsou pak jsou nějaký vysokoňový jazyky a končilo to tím, že launch base je vlastně nějaký nový médium nějaký, který bude teď předmětem zájmu všech inženýrů. Už to nebude, už to nebude ID a v něm nějaký kód, ale bude to nějaký podobný editor a v něm nějaká knowledge base, která se bude prostě stavět a která se bude vyvíjet a na který se bude pracovat. To mně přijde jako vlastně ta budoucnost. E, jsem velmi zvědavý na to, jaký eh formy tohleto nabde a asi máš pravdu, že prostě nějaký usměrněný a acyklický gra nebo ať už tomu budem říkat jakolik, možná nemusí být acyklický, to ještě nevím v tuhle chvíli, ale že možná na některý případy to není úplně vhodnej formál. Trošku mi to připomíná takový ten takový ten hype kolem ontologií a kolem těch těch legrací jako poměrně ne úplně vyřešený, bych řekl problémy. Myslím, že jako ten správnej přístup bude muset kombinovat ty nejlepší věci těchhletěch dělů nějakých světů, možná více více světů. >> To jsme se o tom bavili v minulým díle. Existují podle mě jako dobrý dobrý paralely mezi tím klasickým světem a tím AI světem. A jedna jedna jako z takových věcí je, že stejně tak jako prostě v klasický aplikace měli nějaký úložiště, ať už to byly soubory nebo databáze nebo jako whatever, co, tak ty jako AI systémy, ty budou mít taky jako svoje určitý úložiště. A myslím si, že podle mě zase jako je na čase nebo určitým způsobem zase bude nějaká nová soutěž o to, která ta forma uložiště bude ta ona. A minimálně v počítačovým světě, v tom jako klasickým, se podle mě jako velmi dobře ujaly jako tři takový struktury. Řekněme. Ta jedna struktura jsou jako souborový systémy, což je v podstatě jako strom, kde nejsou cykly. Pokud teda neberu nějaký jako odkazy jako lidi, co jsou hardcore linuxáci, tak by mně řekli něco jinýho, ale mně přijde, že obecně jako linky a semlinky jako není něco, s čím se jako běžnej uživatel úplně jako setká a pracuje, ale lidi umějí velmi dobře pracovat s takovouhle hierarchickou strukturou. To je něco, co jako velmi dobře funguje a myslím si, že bude existovat přesně jakoby on ten OKF to do nějaký míry dělá tohleto. Ten OKF do nějaký míry přesně dělá nějakou jako poměrně jasnou strukturu, do který ty zasazuj jednotlivý dokumenty. Podle mě jako druhej typ struktury, která je velmi jako běžně používaná a úspěšná, jsou jako klasický tabulkový databáze, kdy jako mezi nima můžeš mít ještě nějaký relace a tak. Myslím si, že tabulkový databáze je něco nebo běžný relační SQL databáze jsou něco, co v AI světě nebude mít zdaleka takovou roli, jak mělo v tom klasickým světě. Myslím si, že ta výhoda tý rigidní struktury se jako totálně rozplývá při nárazu dů jazykovejch modelů. A pak je tady nějaká třetí struktura a to jsou grafy, ať už jako směrový nebo nesměrový. A tam mně naopak přijde, že v tom běžným světě se dá říct, že web byl takovýmhle grafem. Ale co se týká grafových databází, například v rámci jedný aplikace, tak znám poměrně málo aplikací, který by to reálně používali. Já jsem třeba jako obrovským fanouškem Neo forgj databáze, která umí ukládat jako v záznamy přesně do takovejchhle jako struktur grafovejch, ale jako prakticky jsem to v životě použil v jedný aplikace. Myslím si, že co se týká AI, tak tyhlety grafový struktury můžou být zajímavý, ale zároveň co si myslím, že že můžou být zajímavý struktury, který budou jako úplně totálně nestrukturovaný jako typu halda dokumentů, který jako mezi sebou nemají vůbec žádnej jako formální způsob provazování. Prostě tady máš haldu dokumentů, dělej si s tím, co chceš a ten význam se mezi nima bude hledat tak, že se buď budou embedovat do nějakýho prostoru a nebo ten harness si s tím jako udělá, co potřebuje. Dá se je do nějakých souborů, udělá si s tím, co potřebuje. >> To je zajímavá myšlenka. To byl OKF. Vlastně ještě je docela zajímavý probrat, jak to souvisí i třeba s promukem. Tam si myslím, že je to velmi dobrý doplnění a a nevím, nevím, jak moc to tady máme probírat. Možná kdyžtak mě zastavte, ale přijde mi, že to je velmi dobrej způsob, jak nějakým smyslu komprimovat prostě kontext a znalost a klidněji předávat i promooku, kterej s ním může dál pracovat. A nejenom nejenom prohook, ale samozřejmě i další platformy na stavbu agentů, nějakých autonomních prostě systémů. Tak jo, možná bychom mohli přejít ještě k další novince. Tou je to, že XAI Elon Musk kupuje kurzor podle všeho. To je věc, kterou jsem zaznamenal zaprvé dneska. Nevím úplně přesně, co to bude znamenat. E, zvlášť pro kurzor a jeho uživatele, jestli to bude podobný podobný převzetí, jako když [smích] nast vzal Twitter, odešla z něho většina uživatelů. To je věc, kterou se asi budeme muset trošku počkat, než j budeme mít schopní vyhodnotit. Mask přebíral Twitter teďka X. Přemýšlím, já vlastně myslím si, že je to poměrně jako logickej krok. Hon jako buduje určitý portfolio a dává to podle mě jako úplnej smysl, protože kurzor je jeden z těch jeden z těch jako nástrojů, který přišly s tou jako vibec coding revolucí. Tak nějak obecně mě připadá, že se my jako mnohem víc bavíme a teď myslím jako jak my dva, tak jako společnost celkově mnohem víc bavíme o modelech, než o těch věcech, co jsou nad tím. A zároveň si myslím, že ty věci nad tím jsou často stejně tak zajímavý, jak ty samotný modely. A kurzor je podle mě přesně jeden z těch příkladů, kdy oni nebyla firma, který, který mají model. Oni jsou firma, který maj jako to všechno nad tím modelem. Trošku mně přijde, že na tom je podobně třeba z Perplex City taky nemaj. >> Jo, mně se vlastně líbí kurzor, jakým směrem on se vyvíjí. teď nedávno teprve, no, je to asi tři týdny, co jsem vyzkoušel jejich multi task e režim, když jsem měl vlastně nějakých asi pět různých PRDs a nechal jsem je paralelně vyvíjet jako různýma agentama, který byly všechny založený na VPT 55 a vůbec jsem nějak jako neřešil, v jakým pořadí se ty PR mají zpracovávat. Prostě jsem nechal autonomě pracovat. A vlastně to bylo jako bylo to v podstatě pětkrát rychlejší, než by to bylo, kdybych to dělal postupně. Což je samozřejmě daví tím, že o jaký o jaký PRD se jednalo, to byly relativně malý atomický prostě tky, který se daly samostatně testovat. Jsou tam dobře napsaný testy v těch v Tebs a tak. Takže to bylo jako docela easy peasy. Takový, jak bych řek prostě embarassing paralel úloha, ale i tak mně přijde, že to, co Musk nedokázal zatím v oblasti autonomě řízených vozidel, tak by možná mohl vzorem dokázat v oblasti autonomních kodovacích agentů a jejich nějakých letek nebo fleet of AI coding agents. Ano, to mě mimochodem jako jedna z věcí, co co mě připadá na tomhletom jako zajímavá, je eh je ta, že poměrně často, když se jako mluví o AI programování a vibe codingu, tak eh tak je, že se mluví o tom jako kolik agentů člověk dokáže paralelně běžet a kolik PRDs udělal a kolik tokenů spálil. A já si jako čím dál tím víc říkám, že to je vlastně strašně jako blbá metrika nebo blbá metrika. Stává se z toho jist jistým jako jistým slova smyslu fetish, který programátoři mají hrozně rádi. Já si jako pamatuju na fetish třeba z pokrytí testy nebo eh na fetish eh load timey. Myslím si, že jsou případy, kdy dává smysl jako vyvíjet mnoho věcí paralelně, ale zároveň mě připadá, že je mnohem jako větší hodnotu než jako zrychlení vývoje. A teďka jako než samotný zrychlení vývoje dává jako vůbec jako zautomatizovaní celýho toho kolečka. Protože co podle mě je drahý na vývoji? Podle mě na vývoji není drahý to, e, jestli nějakou fečuru máš udělanou za hodinu nebo za den. Myslím si, že u drtivý většiny věcí je to jako jedno. Myslím, že u drtivý většiny projektů je to tak, že pokud máš pět feature, tak to jestli uděláš paralelně každou z nich. Každá se ti paralelně dělá hodinu a pak se nějak zmergeujou a nebo jestli se udělají za sebou za 5 hodin, tak bude, nebavím se o edge cases, ale prostě o drtivý většiny IT projektů, to je jedno. Na čem záleží? Záleží na tom, nech každá z těch feature lidskej čas na dní strávenej je co nejmenší, protože lidskej čas je drahej. A eh jedna jako z věcí, co mě připadá, je, že čím víc AI zapojujeme do vývoje, tak tím reálně jako víc řádek kódu se píše, tím víc řádek kódu vzniká a je mnohem větší tlak na tu, mysl kvalita je to správný slovo, ale vůbec na to jako řízení toho, jak tohleto jako omanžovat. >> Já s tím souhlasím. Vlastně mně přijde, že zase zase jsme svědky toho, že nějaká věc, která doteď byla relativně ne, že málo dostupná, ale možná vzácná, schopnost psát nějaký kód a psát ho kvalitně a možná i rychle se jako postupně zmenšuje nebo mizí a začíná být důležitý to nějaká řekněme zpráva jako akceptačních kritérií a toho, že ty chceš, ty chceš být schopnej nějak e poměrně spolehlivě a efektivně rozhodnout, jestli výstup, kterej jako doručí, jestli je to ten výstup, kterej ty jsi chtěl, aniž bys musel prohlížet tisíce řádků kódu a dívat se, jestli je to všechno v pořádku. Prostě ty chceš vědět, že to funguje, že ten úkol, kterej jsi zadral, takže byl doručen. >> A podle mě podle mě se ten batek zase přesouvá do ověřování těhletěch akceptačních kritérií, do jejich formulace. a následnýho ověřování. Pokud to dopadne tak, že bude obtížný ty věci ověřovat, tak v tu chvíli prostě nějaká rychlost přestane dávat smysl. Bude to úplně jedno, protože nakonec stejně se jenom maličko posuneme na tom dopravním pásu z jednoho místa na jiný místo a tam budeme přehrcení úplně stejně, jako jsme byli, když když jsme měli vře různý tázky, který jsme přijímali a prostě jsme je implementovali. To je jedna věc. A druhá věc je, že podle mě ještě důležitější, nebo možná ne důležitější, ale stejně tak důležitá, přinejměší věc, je ten vstup, kdy se rozhoduješ o tom, co vlastně budeš implementovat a jak to bude. A jakože mě, že to, co často slyším, je, že jak poznáš seniorního programátora nebo vůbec obecně seniorního inženýra od juniorního je, že ten seniorní je schopnej ti říct ne a má k tomu velmi dobrej důvod. Jo. A mně přijde, že eh se tady ukazuje, že jako to je velmi velmi důležitá schopnost a velmi důležitá věc, kterou možná možná ní teďka budeme mít mnohem víc času. [frknutí] Pak říká, ne? A prostě jako ano, mohli bychom to vyvinout, mohli bychom to udělat, ale proč bysme to dělali? To, že něco můžu udělat ještě neznamená, že to dělat mám. Jo jo. Mně připadá, že vlastně jedna jako z věcí, co se v Aiku děje, že se přesouváme do vyšších a vyšších metalopů, kdy před ještě pár lety jsme se bavili o tom, že ten jako základní loop byl ten toho generování těch tokenů, že jakoby měl měl jsi nějakj jako vstupní text a vždyť se na něj generoval ty tokeny. To byl takovej ten jako loop číslo nula. Pak jsme se přesunuli k nějakýmu jako loopu číslo jako jedna a loop číslo jna byl ten, že ok, že my už jakoby umíme, že už umíme doplňovat text, ale pojďme udělat nějaký jako thinking, kde ten model může promptovat sám sebe a může dělat nějaký jako chain of thought automaticky a běží to v nějakým loopu, kterej jako vyprodukuje ten jako výsledek, který chceme. Myslím, že teďka se bavíme nějakým jako loopem číslo dva nebo metaloop číslo dva, kdy pokud máš dobrej vstup, tak ten model ti udělá dostatečnej thinking, research, function calling, všechny tyhlety věci a v rámci toho volání ti vyrobí ten výstup. Ale mít tam ještě jako něco, co to nevím jako co je co je to správný, jako jak by to mělo být správně na setapováno, ale třeba se jako střídá role, že střídá roli člověka, kterej zjišťuje, co se má udělat a roli toho vývojáře, kterej to udělá a pak roli člověka, kterej to kontroluje. >> A pokud by tahleta věc dokázala běžet v automatickým loopu, tak vlastně ten loop číslo tva, tak už je jakási jako automatizovaná Dark Factory. A teď je otázka, jestli existují i věci nad tím. třeba loop, kterej spouští loopy nebo iteruje nad iterátorama, který vybíjí software. pochybně jako umím si představit, že takovej loop existuje. Eh, vlastně úplně ten multioop je takovej ten continuous delivery loop, že prostě ty implementuješ kód, pak ho testuješ, pak ho deployneš, pak implementuješ kód, testuješ, deployneš a jo, ta změna role, kdy ty vlastně musíš proti realitě otestovat, jestli tady to takovej ten double diamond vlastně, o kterým jsme se tady bavili i minule, jestli to celý dávalo smysl. Mně přijde, že vlastně v nějakým ohledu ten Forward deploade iner jako trošku dělá, ale ručně v tuhle chvíli. A ano, ano, to ano, to mě to je to mě mimochodem připadá hodně zajímavý, že vlastně vždycky orchestrátorem tý tý jako daný vrstvy, dokud ještě nebyla úplně jako promakaná, tak vždycky byl člověk, že v podstatě jako když vyšlo chat GPT, tak tady bylo jako spoustu návodů na to, jak v podstatě dělat jako ten thinking, jak manažovat ten thinking. Takže tak teď si otevřete nový vlákno chatu GPT a když mu z dáte slovo TLDR, tak on to zesumarizujete, mu zakopírujete do novýho. Pokud děláte tohle, tamto, tam to si teďka ten modeluje jako vysloveně sám tyhlety věci, ale přijde mi, že že teďka jsme jako v podobný situaci, že třeba mně se strašně líbí nástroje typu Makali nebo Lavable, kterým jako člověk může zadat cokoliv, ono ti to vyrobí webovou stránku nebo aplikace. Ale stále mně tam podle mě chybí to, že jako ty musíš vědět, co za aplikace chceš vyrobit. Musíš tomu dát aspoň [frknutí] kind of dobrý zadání. Už to začíná být poměrně rezistentní vůči jako blbejm zadáním, ale jako minimálně musíš nasměrovat jako co chceš dělat. Já myslím, že vím, vím o oblasti, kde by se to, co ty máš asi nejspíš na mysli, dalo dobře otestovat a to je, že bys nějak, že bys nechal AIO vyrobit nebo implementovat nějakej algoritmus automatickýho obchodování nějakýho aktiva na burze a pak ho tam s nějakým malým malýma šušněma pustil a nechal ho se v nějakým loopu prostě vylepšovat nebo třeba navrhovat nový algoritmy a ty znovu obchodovat a nějak by to prostě dopadlo. V okamžiku, kdyby tohleto dokázalo konzistentně generovat peníze, tak prostě eh to by asi byl to by asi byl velmi zajímavejch vývoj. >> Jsem z nějakýho důvodu člověk, kterýho vůbec neláká burza a a investování. Teď jako ne nemyslím to, že jako, že bych neměl investovaný peníze někde, ale spíš to, že jako dělat aktivní trading. >> Právě proto, chceš tvořit umělé inteligenci, přece. No, ale ne, co ne, co jsem tím, co jsem chtěl říct, co by mě přišlo třeba hrozně zajímavý, eh, jako mít jednoho agenta, kterej na product huntu, možná product hunt denně to dobrý místo, protože na product huntu už chodí lidi, co jsou geci a jako vědí, že hledají novej produkt. agenta, který jako kouší vůbec sondovat, který dělá nějaký sondování trhu a zjišťuje prostě tř, že my teďka tady natáčíme přes FMUX, předtím jsme to dělali přes Streamyard, ale ten software je jako na Úplně doslova ten software je fakt špatnej. Pokud by za námi teďka někdo přišel a řekl by, že má tady prostě nějaký, nevím, AIX si ho možná jako sami vyrobíme, něco takovýho, ale a jako za 30 dolarů na měsíc, tak to jako hnedka bereme a jako minimálně zkoušíme. A teď jde o to, že pokud by ten náš agent dokázal takovýhle jako tržní nýž vyzkoumat, dokázal by dobře vytvořit zadání, dokázal by dobře říct, co je na těch jako stávajících větech špatně, tohleto jakoby klidně hodil do laveblu nebo makali, klidně jako může využít ty věci, co jsou a udělal by i ten jako i ten deployment, že by jako zaregistroval doménu, spustil by to někde, napsal by to na FRA, dal by to na ten product hunt a vlastně takhle automaticky by dělal software. A nejenom, že by ten software jako programoval, ale by vůbec jako zjišťoval, co má programovat. A mně by tohle mně tohleto vysloveně připadá jako nějakej další krok, kterej jako možná už tady je spoust lidí, co něco takovýho rozběhlýho má, ale mně by přišlo hrozně zajímavý, hrozně zajímavý něco takovýho mít a jako vyzkoušet. Jo, to je řekněme náš společnej možná cíl Rbooku o kterým se bavíme už delší dobu, ale uvidíme. To je asi otevřená kapitola. Řekl bych, že zítra to mít nebudem takovouhle Dark Factory, ale doufám, že za pár měsíců bude všechno trochu jinak. Dobrá. Myslím, že je nejlepší čas skončit pro dnešek a poděkovat posluchačům za pozornost a těšíme se další díl. Napište nám do komentářů, co si myslíte o dnešní epizodě, co byste chtěli slyšet, co vás bavilo a nebavilo a uvidíme se příště. Možná, která z těch tří částí, která tady byla, byla jako dobrá a která byla špatná, protože jsme tady měli tři části, který byly každá úplně jiná a samotnýho by mě to hodně zajímalo. Ciaau >> [hudba]"
businesses\ai-ta-krajta\aiTaKrajtaEpisodes.json:112:        "title": "AI ta Krajta #53 | Google I/O, Karpathy v Anthropic a proč IDEčka brzy nahradí Dark Code Factory",
businesses\ai-ta-krajta\aiTaKrajtaEpisodes.json:135:        "transcript": "Vítám vás u 52. dílu Aita Kita. Tentokrát s Jirkou a Petrem. A ještě než začneme, tak bych rád poděkoval Prompbooku a AI supervisi za sponzoring. E odkaz bude dole v komentáři. Já bych rovnou začal novinkou. Kdo z vás má nějakou AI novinku? Já mám takovou napůl AI novinku, napůl technologickou, ale vzhledem k tomu, že se to týká antropiku potažmo banu, tak to tady zahrnu. Přišlo mi strašně zajímavý, že se už před asi týdnem, dvouma začalo řešit, že se objevil nějakej markdown dokument v repozitáři banu, kterej eh signalizoval, že by se ban měl přepsat do Rustu. Na začátku to bylo takový jako, že nikdo nic nevěděl a tak a potom se začal k tomu vyjadřovat přímo Jaret Samner, autor banu a nasdílel, že už ho nebaví řešit věčný sefolty a problémy s pamětí v Zigu a že by chtěl programovací jazyk, kterej mu dá aspoň nějaký záruky. On Zig je třeba o něco málo rychlejší, ale nedává tolik záruk, co se týče používání memory. A teďkom o dva týdny později říká, že už to prochází všechny testy na 64 bitovým, pak i na Armu i pro Alpine Linux i pro, myslím Windows tam ještě není, ale v podstatě jako většinu platform už jim prochází všechny testy a je to masivní přepis, v podstatě onehotovej pull request, kterej to celý mění na rast. Má to asi přes milion řádku změn, ale je to vyloženě port. Nedělej to jako nějaký refaktor, je to port a uvidíme, jak to dopadne. Ale Jared říkal, že zatím to vypadá, že ban 1.3.14 bude poslední verze napsaná v Zigu a další verze už budou napsaný v Rustu, což je podle mě věc jako naprosto nepředstavitelná udělat takovou migraci za dva týdny bez AI. >> Mhm. To vypadá impozentně. A jaký jsou teda, můžeš ještě jednou říct, jaký jsou ty výhody tohodle portování? >> Hele, nejsem low level inženýr, ale z toho, co jsem navnímal v diskuzi, tak by Rust měl dávat větší memory safety, e, protože tam počítá reference a mnohem líp pracuje s pamětí. Samozřejmě i v Rustu můžu jít do Unsafe territoria a pak tam ty záruky nemám. A pan má v tom novým přepisu fakt hodně unsafe territorií, ale Jaret zároveň říká, že se to bude zlepšovat, že to budou redukovat. Na druhou stranu, vzhledem k tomu, že musí pracovat s Webkit jádrem pro JavaScript nebo JSC Core se to myslím jmenuje, tak je tam spousta jako foreign function calling a tam tím pádem nemůžou zaručit tu safety, takže nějaký unsafe cally tam rozhodně budou muset být, ale měla by to být hlavně stabilita memoryi. A otázka je, jakej bude ten performance hit. Tam zatím nemáme žádný data, ale myslím si, že by ten performance zit neměl být tak velkej, protože v banu prostě jdou až psychopaticky po optimalizaci jakýhokoliv výkonu. >> OK. Já kdyžtak předám svoji novinku, co jsem zaznamenal teď v pondělí, e, 11. května. E, Open AI ohlásilo spuštění něčeho, čemu říkají Open AI deployment company. A to je vlastně taková analogie. Součástí jsou forward deploy engineers. Prostě představ si, že u sebe ve firmě chceš spustit nějaký masivní AI řešení, tak tobě naběhne armáda inženýrů z Open AI a začnou ti s tím pomáhat a začnou ti to implementovat. Vlastně to připomíná koncept Palantýru, jak vznikal před asi, no ty jo, možná 20 lety. Oni vlastně začínali podle mě docela podobně. Přijde mi to jako zajímavý pivot teďka trošku. >> Já mám takovou polonovinku a polo zajímavou myšlenku, kterou bych chtěl překlenout k tématu, který dneska máme a to, že jsme v prombooku zkusili takový trochu neobvyklý řešení jednoho problému a to řešení se zdá být strašně dobře fungující. My jsme původně používali buď Antropic SDK nebo Open AI agents SDK na to, abychom běželi agenty, ale jako měli jsme tam spoustu problémů hlavně s nějakýma jako dlouhodobě běžícíma věcma. Vyzkoušeli jsme takovou věc, že jsme vzali repozitář, do něj jsme udělali doslova složku, která se jmenuje Messages. V ní jsme pro každou zprávu, která přichází z chatu, vytvořili Markown soubor a Cloud COD dostal za úkol tyhlety zprávy doplnit. prostě jako jeho úkolem bylo podívej se do složky messages a dopisuj zprávy. Já jsem si říkal, že tam bude asi nějaký jako drop třeba z výkonu nebo prostě jako něčeho, ale co se týká nějaký jako kvality výstupu a to, jak to umí pracovat s informacemi a instrukcemi a vůbec jako s tím vším, tak je jako mnohem lepší. Je to úplně kvalitativně jiná úroveň, než jakkoliv jsme si to byli schopni zedrátovat jako s těma SDK. A já vlastně jako tenhle týden stále přemýšlím, že jako kde je tam ten skrytej ďábel, že jako že kde se stane nějakj jako problém jako na kterej narazíme a proč tenhleten přístup nepoužívá jako většina AI aplikací. A tímhletím bych vlastně jako rád překlenul tu debatu do jako něčeho, o čem jsme se bavili už jako v nějakých minulých dílech, ale jen jsme to tak naťukli, že vlastně jaký jsou nějaký jako úrovně toho, na kterým se jako vej pohybujeme, že jaký je rozdíl mezi modelem, chatovacím modelem, nějakým nastavením modelu, MCP serverem a těma harnessama nad tím a agentama a kde se ta linka láme a jakým způsobem to vnímáme. A přemýšlím, kde začít. Pokud víme, že to nikdo jinej takhle nedělá. To je jedna věc. A druhá věc je, že prakticky se ukazuje, že jako stáváme se konzumenty nějakých frontier modelů nebo hardnesses. >> To je jako velmi dobrá otázka, odkud víme, že to něikdo jiný nedělá. Ono to určitě někdo dělá, protože těch jako týmů, který pracujou na AI produktech na světě, je jako strašně moc a jsem si jistej, že tohleto dělá jako dalších 1000 týmů. Já jsem to spíš myslel tak, že to jako není mainstream, že vlastně jako kdykoliv se člověk podívá v podstatě do jakýhokoliv fóra, videa, radí se s někým, tak v podstatě vždycky je to o tom, jak si toho agenta seskládat přes to agent SDK nebo přes to Antrop SDK nebo přes to Versal AISDK. Ale tady to jsem jako moc nikde neviděl a vlastně ta myšlenka ani nepřišla ode mě. Tahleta myšlenka přišla od Mango Webu, který nám jako tohleto poradil, nech to zkusíme, nech zkusíme externalizovat jako běh našich agentů na nějaký úplně jiný runner. A mně to připadá jako, že se tady stal nějakej jako abstrakční posun zhruba podobnej, jak od GPT 2 k GPT3. A nevím, jestli jako zacházet k GPT2. Teď nemyslím GPT52, ale opravdu GPT2. jestli můžeš říct, Pavle, jak jsme ty runnery řešili předtím, že jako vlastně já mám trošku obavy z nějakýho vendorloku tady a vlastně bych byl rád, kdybychom tam měli více těch možností přepnout na různý runy. Já si jako myslím, že že tam je jako nějakj kvalitativní rozdíl jako že, že že vůbec v tom jako celém industry dochází k nějakýmu jako kvalitativnímu posunu od toho, že jako my se tady poslední tři roky jako hrajeme nad chatovacíma modelama a vlastně všechny ty věci, o o který jako řešíme, tak se vlastně primárně týkají chatovacích modelů. To znamená, jaký tooly tomu přiřadíme, jaký MCP server tomu přiřadíme, jak tam dáme prompt, system message a tyhlety věci. A vlastně jako ten samotný chatovací model je určitá abstrakce nad tím fundamentálním modelem, který tam někde je na pozadí a který v podstatě už dneska jako řeší poměrně málo lidí. Většinou jako lidi neřeší, jak se dotrénovat model. Většinou lidi řeší, jak postavit ten jako harness nad tím modelem a okolo toho modelu. A připadá mě, že co se teďka děje, je to, že ten samotnej harness už taky začíná být komodita a eh vlastně se jako přesouváme do jako do stavu, kdy modely jsou v podstatě komodita, harnesses se také stávají komoditou a to, co se liší, je vlastně ta lidsky napsaná instrukce nad tím. Tak tady s tebou podle mě nebudu souhlasit vůbec, protože podle mě eh harness má daleko do toho, aby to byla komodita. už jenom to, že nám Terminal Bench ukazuje, jak obrovský rozdíly Harness může udělat, nebo i nějaký další experimenty. Teďkom jsem viděl třeba e coding agenta, kterej byl specializovanej vyloženě na eh malý modely do nějakejch 30 miliard parametrů a dokázal, že když se použije specializovaná harness jenom na malý modely, že se tam trošku jinak pracuje s popiskama, pro túly a tak, tak se dá zvednout výkon klidně o 20 % v některejch benchmarkcích, což za mě naprosto ukazuje, že harness zdaleka není komodita. E, je tam kolem toho spousta experimentů a eh myslím si, že i kdybysme teď zastavili vývoj modelů a už žádnej nevydali, tak ještě minimálně dva roky se zvládneme posouvat nahoru v tom, co s tím dokážem. >> Já si rozumímu, co říkáš, e, vlastně těm důvodům, proč harness není komodita. A mě by zajímalo jako jaký tam teďka vidíte problémy, že OK, tak máme harnesses, který jsou prostě různě specializovaný na různý tázky a jako co dál? Mně právě trochu připadá, že ta specializace začíná, nechci říkat jako upadat, ale jako ten počet těch parametrů se strašně snižuje. S tím, že ještě před nějakou dobou to bylo tak, že vlastně jako na každej specifický účel bylo potřeba ten harness do nějaký míry postavit, jako do nějaký míry mu dát tooling, do nějaký míry mu dát skills, do nějaký míry prostě ho jako ohraničit. S tím, že ten model byl komoditou, jako to, jestli ten harness jako uvnitř používal jako clot nebo GPT nebo prostě něco nebo něco, tak to bylo jenom o tom, jestli to bude jako trochu větší tradeoff mezi nějakou jako cenou, rychlostí, e, soukromím a bezpečností. Ale ten model byl komoditou a podle mě se trošku podobná věc stává teďka s tím harness, že vlastně jako ten samotný harness je jako něco, co co jako dokáže jako jednat, konat na základě nějakejch instrukcí a už to jako jaký ty toly k tomu má vyskládaný, že že ty to samy o sobě jsou komunitou, že vlastně jako spoustu z těch věcí, který tam jsou, tak jsou eh tak vlastně jsou nějaký jako generický primitivy. typu potřebuju, aby mě uměl agent prohlížet web, potřebuju, aby agent uměl spouštět věci v potřebuju, aby agent uměl a teď takovejchhle věcí je poměrně jako pár a vlastně už se nehrajeme jako tolik na tom, že tady mám harness, který umí líp míň jako používat prohlížeč. prostě bude jako jeden harness, který bude umět používat bravůně prohlížeč, ale už si budeme hrát nad tím, že jakým způsobem se ten prohlížeč bude používat, co bude dělat, na jaký stránky bude chodit a bude to od nějaký jako úrovně nad tím. Aspoň jako to je moje teorie lomeno pozorování, co jako poslední dobou mám. E, >> vůbec vůbec jsi mě jako nepřesvědčil, že by to byla už jako komodita. A schválně jsem si ještě prošel svoje poznámky z tréninku z House of řezáč a jako pointa komodity je, že jsou vzájemně zaměnitelný. Jako když vezmu benzín a dám si do auta benzín 95 na benzínce A a na benzínce B, tak pokud to neředěj vodou, tak je to furt ten samej benzín. Ale když vezmu jako harness od gitub copilota a hardness od kodexu, tak se prostě budou chovat jinak. Mají jiný tooly a e jinak fungujou. Jakože ukazuje se, že třeba když napojíme eh do cloud code eh nějaký jako úplně jiný modely, tak to prostě nefunguje tak dobře, protože ty modely jsou stále trénovaný eh na ten konkrétní výstup, takže za mě to má jako daleko do tý zaměnitelnosti. To je jako dobrá podle mě připomínka s tím, že já vlastně jako je pravda, že jako ono to není 1 jako ono to nikdy není tak, že buď to je nebo není komodita, ale eh mně přesně připadá, že jako to, co jsi řekl, je vlastně podle mě jako dobrej příklad, že jakoby e agenti jsou jako strašně jako nekonkrétní a širokej pojem, ale řekněme, vydefinujme si to tak, že agent je pro nás něco, co pracuje v nějaký složce a dokáže tam jako číst a uprav upravovat soubory, spouštět BH a jako a pracovat nad nějakým projektem. [frknutí] A teďka mám tady cloud kod, teďka asi ten nejvíc default, o kterým se jako nejvíc mluví. Pak tady máme kodex, kterej je podle mě velmi relevantní konkurencí. Máme tady Ghup Copilot, který si myslím, že je velmi jako pod radarem, ale jako strašně zajímavej. A máme tady další Open Code, Kline a další. A teďka co mně připadá, že jasně, jakože je často jeden je lepší než druhej. A o tom jsme se jako v minulých epizodách bavili jakože v jakých úkolech jsou tyhlety jako lepší než než jiný. Ale fundamentálně mně přijde, že to směřuje k tomu, aby prostě jakýkoliv z nich byl jako dobrej pracovník, ať mu zadáš cokoliv, tak to umí vyřešit. Tady souhlasím jako s Petrem, že v podstatě to ukazuje podle mě na to, že je velmi těžký nebo extrémně těžký v tuhle chvíli. Kdybych šel zakládat novej startup, tak bych ho neudělal e jako startup typu chatbot nad vlastními daty nebo nějaký jako prostě tenký weapr kolem GPT nebo něco takovýho. A obecně tohle byla vysmívaná strategie už před dvěma lety a myslím, že dneska je to úplně mrtvá mrtvá věc a myslím si, že e ta budoucnost je v nějaký jako velmi hluboký integraci s napříč nějakou specifickou oblastí, kde propojíš jako několik těch, jak ty jsi říkal, primitivů, prostě postavíš jako nějakou šňůru, která bude automatizovat nějakou konkrétní pipeline. Tak to mně přijde jako vlastně velmi silný. A vlastně to je i to, co podle mě ten koncept těch inženýrů, armády inženýrů, který ti pošlou z Open AI, tak to je něco, co se v tuhle chvíli zatím řeší ještě lidskou silou. A myslím, že jako ta vize je to v budoucnu už i tohle nějak automatizovat. To je jako možná dobrá jako otázka, že podle mě třeba z u modelů jakoby když sestoupíme o tu jako abstrakční úroveň níž, tak si myslím, že v principu tam už existuje jako jeden jediný parametr plus nějaký jako fley. Ten jeden jedinej parametr je, jak je ten model vlastně jako výkonnej a schopnej. A ty flegy jsou typu jo, běží to v rámci Evropský unie, běží to tam a onam, trénovalo se to dobře nebo ne, ale dalo by se říct, že to měřítko toho, na kolik ten model je dobrej, jako je velmi lineární. Souhlasil byste s tím? >> Lineární k čemu? lineární k tomu, že například ještě u těch malejch modelů nebo před nějakou dobou to bylo tak, že tady byl prostě jeden model, kterej byl dobrej na angličtinu, druhej model, kterej byl dobrej na programování, třetí model, kterej byl dobrej na něco jinýho, čtvrtej byl lepší na reasoning a teďka jako každej z nich měl nějakej jako jinej parametr a vlastně se vůbec nedalo říct eh a srovnávat jako jeden s druhým, ne? nebyla tam nějaká jako měrná jednotka úplně dobře. A teďka mi připadá, že tady to srovnání se dá dělat mnohem líp, než se dalo dělat kdekoliv v minulosti. >> Jo, to bych řekl, že je v nějakým smyslu pravda a myslím, že na to narážel i Jacek v jednom z minulých dílů, kdy říkal, že staví asi nějakej monitoring business value. E a to mně přijde jako vlastně, že to je ta jednotka, kterou ty chceš měřit. Ty chceš, aby ta integrace nebo to řešení nějaký, který dodáš, mělo jasný, viditelný dopad na tvůj byznys. To je vlastně celý, co jako potřebuješ. E, that's it. >> To je takový to jako možná zase, abych jako já si nemyslím, že to je úplně jednodimenionální. třeba kdybych vzal jako elektřinu, tak tam je to a tam to to vlastně taky není jednodimenzionální úplně, protože jakoby může se lišit jako frekvence a můžou se lišit jako různý jako věci, který jsou v rámci toho, ale jako řekněme, že elektřina je strašně moc komoditizovaná. prostě to, kam jako zapojím jako ten počítač nebo bublel, tak mám poměrní jistotu, že to bude vlastně jako stejná elektřina, stejná věc, kterou dostávám tady v hotelu v Ostravě e u Jirky, jako někde v kanceláři. A připadá mě, že takováhle věc neplatila s model, že jakmile jsem měl nějakej software a byl postavenej na GPT 3,5, tak eh vůbec nebylo jako jednoduchý jako vzít to GPT 3,5 a jako plugnout tam cloud 2, chovalo se to úplně jinak, dělalo to úplně jiný věci a ten software se tím mohl úplně rozbít. Dneska je to tak, že když mám nějaký harness a jako vyberu z toho GPT 55 a dám do toho clot 47, tak to víceméně bude fungovat. Jo a to podle mě je věc, která smazává jednu z výhod, kterou Prombook měl a kterou třeba zrovna Mango web myslím na Prombooku oceňuje, že jako vlastně když si stavíš nějaký agentický workflow nějakým low level prostředí, e, chceš prohodit modely, tak typicky musíš upravit prompty, aby se to chovalo podobně nebo prostě něco se ti tam pokazí a musíš to jako hodně hodně upravovat. A Prombook dokázal udělat to, že se ty modely daly jako zaměnit relativně snadněji, řekněme. A teď si myslím, že už to jako přestává být úplně výhoda. >> Já si myslím, že to je furt velká věc. ať už jako v agentic codingu, tam jsem říkal prostě jinak editujou, jinak pracujou s tůlama, ale i když vyskočíme mimo, tak si myslím, že tam jako je stále hodně rozdílů. Jenom je to spíš o tom, že ty modely jsou obecně silnější, takže je jenom jako nepusujeme dost k těm limitům, aby se ukázalo, že ty rozdíly jsou tam obrovský. Teď si podle mě narazilo něco, co jak jsem říkal, že elektřina je modetizovaná, tak to vlastně taky není pravda, protože já jakmile třeba baterku táhnu na nějaký limit, tak taky to začíná narážet. Taky to není úplně jedna jedný. A možná jako podobná věc jako se dá udělat analogie s modelu, že e je pravda, že většina úkolů, na který ty modely dneska používáme, tak je jako velmi hluboce pod jejich nějakýma kognitivníma schopnostma. A dokud na tyhlety kognitivní schopnosti nenorazíme, tak vlastně jsme jako v určitý safe zóně, kde je vlastně jako skoro jedno, co tam použijeme. A možná by se to dalo třeba přirovnat k lidem, že jakoby pokud bych po někom chtěl umět číst nebo napsat větu nějakou, tak je to jako natolik jednoduchej task, že je vlastně jako skoro jedno, koho z nás si na to člověk vybere. Ale pokud bych potřeboval někoho, kdo prostě třeba umí jako špičkově dělat v Nextu, v Typescriptu, tak tam už to zdaleka takhle komoditizovaný není. A pokud bych chtěl někoho, kdo zná effect ts, tak v podstatě jako pokud si vybereš kohokoliv jinýho než tebe, jako z nás a možná jako z velmi jako široký skupiny lidí, tak v podstatě jako nedostaneš tak dobrej výsledek. To samý platí podle mě u modelu a zároveň si ale myslím, že tahleta věc neplatila u těch harnesses, ale u těch harnesses začíná platit nebo minimálně to to je možná vlastně jinej pohled na to celý. U těch modelů jsme byli poměrně dlouho už v nějaký safe zóně a u těch harness nebo u těch jako autonomních agentů, který třeba jako dlouhodobě něco programujou, tak jsme jako naráželi, ale jako i díky jako novejmulům, i díky jako novejm prostě pokrokům v tom, jak ty harnesses jsou dělaný. Tak se dostáváme už do tý safe zóny, že drtivá většina drtivý většiny aplikací, který člověk vyvíjí, tak je v rámci tady tý safe zóny. >> Já si nejsem jistej úplně, jakože musel bys mi ještě jednou říct, co ta safe zóna přesně znamená. >> Například eh podle mě už jako poměrně dlouho jsme v safe zóně crud aplikací. jakoby mám jednoduchou stránku, na který jsou jako položky vshopu. Já je potřebuju editovat, předávat, odebírat, kategorizovat do složek. To je jako úplně safe. To je skoro jedno, co na to použiju. Třeba od GPT5, že jakoby je úplně jedno, jestli na to použiju GPT 52 s Kinem nebo eh Google Gemini Flash 3 Pro nebo Cloud COD, nejnovější. Je to úplně fuk, všechno to udělá dobře. A pak tady mám nějakou situaci B. Potřebuju, nevím, přepsat bandorastu. To asi jako zdaleka nebude tak generický úkol. A tam může hrát ten jako výkon těch jednotlivých agentů velmi velkou roli. >> Jako safe zona se furt posouvá, o tom žádná, jo. Furt prostě s tím jako základem těch modelů, tak jsme schopni dělat víc a víc věcí, ale zároveň si myslím, že to není tak jednoznačný, jak říkáš. Vy třeba přechod na čtyřkovou rodinu Antropic modelů. e nebo cloud modelu, kdy najednou to začalo degradovat v češtině a začalo to tam házet azbooku. Takže podle mě je to vždycky něco za něco a další, co to potvrzuje, je třeba eh Factory AI, autoři Droida, tak dělali benchmark toho, kterej model dělá nejlepší Code reviews. A vyšla tam jako nejlepší GPT 52 a naproti tomu třeba GPT 55. tak byla příliš hr do toho reportovat chyby, ale měla vysoký procento false positives. Takže podle mě je ta jako to, co je skutečná safe zóna, je mnohem menší, než by se mohlo zdát, ale když bysme to podrobili precizním testům, tak si myslím, že je tam jako vždycky něco za něco, že ta jako skutečná safe zóna, něco, co zvládne každej frontier model, je vlastně docela malá. A to se bavíme jenom o frontier modelech. Když se přesunem jako mimo frontier modely, tak ta situace je úplně jinde. >> Jo, je pravda, že se asi teďka primárně bavíme o Frontier modelech, že vždycky, když jakoby zmiňuju nějaký čas dozadu, tak tím myslím jakoby frontier modely v tom daným čase. S tím, že ne, to je jako dobrá připomínka, co říkáš. Zároveň by mě to třeba jako hodně zajímalo i od diváků, že jestli jako máte nějaký jako typický úkol, který je jako úplně safe a v podstatě se jako vůbec ho nebojíte dát na yolo a jako jedete a nějaký úkol, u kterýho jako víte, že to nedá třeba v tom konkrétním vašem softwaru, protože minimálně já to mám tak, že já jsem se jakože mně se strašně líbí jedna metrika a to ta, jak dlouho umí ten agent jako programovací nebo obecně agent běžet a já sám sám to na sobě strašně vidím, jak se mě změnil jako způsob toho, jak pracuju, protože jako je úplně jinej styl práce, kdy člověk musí jako babysitovat model jako co 10 minut nebo prostě babysitovat daný tool co 10 minut a musí u něj de facto bejt. Akorát to má nějaká sestit a je úplně jiná situace, kde já můžu zadat jako 20 úkolů s tím, že jsem si jako téměř jistej, že jako většina z nich bude udělaná dobře, případně bude pokažená způsobem, že se dají velmi lehce oddělat. A připadá mě, že tohleto se za poslední dobu strašně změnilo, že ještě jako ještě když jsem tady ty věci řešil půl roku dozadu, tak to bylo tak, že vlastně u spousty věcí jsem si jako nebyl úplně jistej a mnohem víc jsem je kontroloval, mnohem jako míň jsem jel nějakej yolo mód, jako mnohem víc jsem jako byl opatrný na to, co a jak se tam zadává. Dneska je to tak, že v podstatě jako koukání se na jak kód, tak nějaký code review, tak jako vůbec nějaká manipulace s kódem jako lidskou silou. Mně připadá, že jako aspoň u nás strašně mizí. >> Otázka je, jak moc jsme eh typickej případ, to je jedna věc. No a já bych právě ale řekl, že jako typickej příklad, já bych právě řekl, že my jsme jako víc jako Outláu, že my budeme podle mě jako víc z tý safe zóny, než je typický projekt. Já si umím dneska představit situaci, kdy budou jako velký úspěšný softwarový projekty, který jako v životě neviděl programátor. >> E to je poměrně jako odvážný, ale myslím, že že možná časem jo. Hm, otázka je, že jak se začne do to na ten kód nabalovat spousta dalších věcí. To možná se začne komplikovat trošku, ale druhá věc, kterou jsem chtěl ještě říct, že dobře. A kde teda bude sídlit nějaký ten potenciální móde? Jakože to je takový hodně diskutovaný taky. A jako co je ta hodnota, kterou dodáváš navíc? To mně přijde jako poměrně děsivý tahleta otázka. Za mě ta hodnota hodnota navíc je tý schopnosti to spojit do funkčního celku. E a tam se bavíme o tom jakože co teďkom vidíme eh cloud desktop apka versus codex desktop apka. Tak tam je za mě třeba jasně vidět, že clot je prostě na vibe koděnej shit a kodex, tak tam si s tím jako fakt hrajou a fakt to jako optimalizujou, dělají to čím dál tím lepší a je to prostě o tom jako celku, o tom pocitu. A trošku si myslím, že vítěz v tomhle ohledu bude někdo, kdo bude mít přístup jako Apple, ale bude schopný zároveň jako iterovat rychle. Nicméně nebude to jako polofunkční shit, protože v tuhle chvíli tak my si můžem říct, ok, tak každý týden vydám ven nějaký software a budu prostě experimentovat jak antropic, co se chytne, co zvládnu všechno zabít za konkurenci nebo komu zvládnu snížit cenu akcí, vys třeba dopad na IBMku. Ale reálně, když se bavím s lidma, tak stejně jako většina lidí konverguje zpátky ke cloud code a eh nejdou jako cloud cowork, protože ta přidaná hodnota tam taková není. Přestože to jako antropic chrlí ve velkým a snaží se najít tu cestu, tak si nemyslím, že tady ta cesta je, když se to bude jako chrlit jako shit. >> Jo jo. H to je vlastně to, co jsem měl na mysli, když jsem mluvil o tý hluboký integraci. Mně přijde, že hm to je ta cesta a vlastně být na tý správní straně, že když se modely zlepší o 30 %, tak tvůj byznys se musí zlepšit prostě o 40 %. >> To jako podle mě obecně taková jako dobrá a zároveň si myslím, že opravdu jako trochu děsivá otázka, že jako kde je ta, že existuje vůbec nějaká hodnota v digitálním světě, která je jako natolik unikátní, že by byla jako dlouhodobě obhajitelná. Nevím, možná jako lepší slovo. >> Já si myslím, že existuje a to je to je to, že ty se věnuješ těm věcem, který to AIO zatím nezvládne. A to je právě kontakt s těma lidma a s tím, že jim pomáháš najít nějaký řešení jejich jako peu, který mají. Zatímco AI za tebe dělá jako tu prostě ten tu drudgery. >> Já si myslím, že je to jakoby v tý síle toho ekosystému, že když se podíváme jako zpátky na nějakou poslední revoluci, kdy se z něčeho stala komodita, tak je to cloud. Cloudu dneska máme spoustu, ale velkou část trhu stále s velkým náskokem ovládá Amazon. A to přesto, že to jejich UI je jako absolutní odpad, tak oni tam mají jako ten ekosystém. Oni tam jako není to, není to jenom cloud, není to prostě jenom eh samotný infrastructure as a service, ale je to v podstatě už platform as a service. A to mi připomněl článek, kde se rozebíralo to, že si TMobile vlastně tvoří svoje nový datacentrum, ale udělat data centrum a udělat e dobře cloud v tý základní podobě, že to mám třeba distribuovaný, mám to zálohovaný a tak, tak ne, že by to bylo triviální, rozhodně bych to nechtěl dělat a nezvládl bych to, ale eh furt je vlastně docela jako jednoduchý poskládat servery, zapojit to a říct jako no tak teď si s tím dělejte, co chcete, ale to, že tam mám nějakou e zastupitelnost, že tam mám nějaký zálohy napříč celým světem, e, že to mám distribuovaný pro případ nějakejch katastrof, tak to je ta ohromná výhoda. A pak další je ten ekosystém nad tím, protože AVS už není jenom jako cloud, ale tam je prostě hromada služeb, posílání, emailů a všechno. A v podstatě v tuhle chvíli mají jako firmy dvě možnosti nebo dvě možnosti, když se bavíme o cloudu. Buď budou jako cloud agnostic a pak si budou spoustu věcí muset naimplementovat sami a řešit teraformy a nějaký podobný věci a nebo se loknou do jednoho cloudu, do jednoho ekosystému a pojedou prostě v tom, že mají eh Amazon emailing, Amazon e Chronjoby a všechny tyhle věci a budou uzamčený jenom v tomhle ekosystému. A tam si myslím, že AI vlastně dospějem jako k podobnýmu bodu, že buď si někdo vytvoří dostatečně silnej ekosystém a ty lidi bude mít zavázaný a budou schopni tolerovat suboptimální UX nebo suboptimální ceny, protože v důsledku by ta cena toho bejt agnostickej byla vyšší eh než když se k někomu loknou. Mně s tím Amazonem přijde strašně jako mě napadla úplně analogie AVS a Vercell, kdy vlastně jako Vercell si uměl postavit jako něco, kde vlastně jako najednou nejsou komodita a přináší vlastně jako strašně velkou přenou hodnotu nad AVSem. A vlastně jako přemýšlím, v čem ta hodnota hlavně je. Já ji jako možná vidím v tý jednoduchosti toho celýho setupu, že jakoby úplně to samý bych se dokázal udělat bez Vercellu, ale jako asi bych se předtím zbláznil, než bych to udělal na jako v rozhraní Amazonu, >> ne? To je přesně, to je přesně ono jako Vercell je nějakej subset funkcí nebo dlouhou dobu byl, teď už maj svoje vlastní nadstavby, který mají jejich vlastní přidanou hodnotu, ale držme se starší verze Vercelu, která byla jenom subset AVS s hezkým UI eh a s přívětivým chováním vůči uživateli. Jo, tam se to samozřejmě jako mění, oni potřebujou nějak jako víc inovat, protože když seš jenom reseller někoho jinýho, tak on může prostě kdykoliv zvednout ceny, zaříznout tě, nebo když bysme to vztáhli na eh geopolitickou škálu, prostě Amerika řekne: \"OK, tak vypnem Evropu a hotovo.\" A my s tím vlastně moc neuděláme. Takže za mě je tam jako spousta rizik, ale zároveň spousta způsobů, jak na nějakou přechodnou dobu na tom vydělat. A teďkom jako si myslím, že kvaltujeme rychlejc a rychlejc dopředu. Takže mít dlouhodobej náskok dneska znamená mít náskok dva roky. Podle mě dřív to bylo jako třeba 10 let nebo víc. Samozřejmě se to jako mění v těch digitálních technologiích víc než kde jinde. >> Mně se strašně líbila jako ta myšlenka, co js říkal, že vlastně jako Vercel je dobrej v tom, co nemá, protože jako jo, je to tak, že že jako spoustu věcí na Vercelu já neudělám. Ale jako díky tomu je ten versel jednodušší a připadá mě, že to je určitá jakože tam je pak určitej prostor pro ten jako mohou těch jakovejch softwarů, protože budou tady softwaryy, který zapadnou do jako určitý níž a jako jasně, Google je jako nebo Google nebo Amazon a nebo jako Antropic jsou jako tisíckrát lepší, rychlejší všechno, ale prostě nejsou nejlepší chatbot pro český učitele matematiky nebo Pro člověka, kterej pracuje na podatelně městskýho úřadu. Připadá mě jako zajímavý na Vercelu to, že Vercel má tady to poměrně široký, že jako Vercel není úplně jako úzce specifikovaná věc, jako uřezává spoustu věcí, co má Amazon, to jako ne, že ne, ale [frknutí] zároveň je poměrně univerzální a stejně jako je to strašně validní alternativa oproti těm jako velkejm cloudovejm službám. Já si myslím, že to je ale jako doména Vercelu poslední doby, jo? Teďkom, teďkom jako se to rozšiřuje a na Vercelu uděláš mnohem víc věcí, ale v minulosti právě to jako osekání toho Vercelu vedlo k tomu, že když jsi potřeboval long running tasky, e, nebo nějaký triggery a podobný věci, tak jsi musel najednou kombinovat strašně moc věcí a vedlo to k tomu, co se teďkom děje s ačkem, když si necháš jako navipe kodit celej stack, tak prostě zjistíš, že máš jako NextJS zver Hercelem se Supase, pak máš tam, já nevím, třeba trigger, protože historicky bylo potřeba x milion součástek na to, aby to fungovalo. A já jako poslední dobou se vlastně víc a víc kloním k tomu, ne, že bych byl jeho fanda, ale kloním se k tomu, co říká jako DH, eh, autor Rubion Rails, kdy vlastně jako jeden server zvládne strašně moc a jakože kdo z nás tady i z všech účastníků Kryty, co jsme kdy měli, je na úrovni, kdy potřebuje tady tu brutáln í škálovatelnost. Samozřejmě Jacek, Gooddata, tam se o tom nebudem bavit, ale myslím si, že všechno ostatní, kde jsme jako se kdy pořádně podíleli v době krity, tak nepotřebuje tak obrovskou škálu. Nepotřebujeme prostě dostupnost po celým světě. Je to jako je to je to tradeof a já si musím vybrat, co chci vyměnit za co. A pokud jednoduchost serveru vyměním za to, že budu mít 10 různejch služeb na to, abych dokázal to, co potřebuju, tak si musím jako položit otázku, jestli to stojí za to. V tomhle se mi líbil přístup Lukáše Cahy, kterej prostě, no, tak to vezmu PH a hodím to na Hecner a I don't give a a je mi to jedno. >> Podle mě strašně jako míří jako to si myslím, že jako je jedna z nejvíc univerzálních pravd v programování, že jako vždycky záleží a všechno je nějakej kompromis mezi něčím. s tím, že vlastně jako my děláme teďka trošku podobnou věc, protože my jsme samozřejmě my jsme my samozřejmě taky jedeme na Vercelu, ale zjistili jsme, že pro to, co děláme vlastně jako Vercel je absolutně nevhodnej, protože my nepotřebujeme tu brutální škálovatelnost serverless funkcí, ale naopak potřebujeme ty long running věci, který jsou, který po jako oni jdou dělat, ale není doně ideální infrastruktura. A teďka vlastně přecházíme na Digital Ocean, co je vlastně jako bych řekl úplně jako obrácenej přístup a vlastně obrácenej v tom smyslu, že to jako je jednoduchá infrastruktura jednoho jako dropletu, kterej běží a můžeš si na ní dělat, co chceš. Co je na tom zajímavý, že to samý, co uděláš na digitalu, by ji uměl udělat i na tom AVSu, že to AVS vlastně umí dělat cokoliv. Ale stejně jsme si nezvolili AVS, ale digital option, protože zase jako než bychom přišli na to, jak to dobře udělat na AVSu a jak to naklikat, tak bychom se zbláznili, ale na tom Digital Oceanu je to fakt jednoduchý jako ta jedna věc. Jo, já třeba jakože jsem si hrál s Hecnerem a na to nahodit Zinops, kterej dělá v podstatě to samý jako Vercel, že udělá nějaký preview environmenty a vyřeší toho strašně moc, ale když se pak dostaneš do tý eh produkční škály, tak tohle řešení prostě nebude stačit zejména, pokud potřebuješ high availability a tak. Takže je to jako odpověď je, jak říkáš, to záleží. Potřebuju zajišťovat dostupnost 99,999, no tak potom asi potřebuju AVS, protože garantovat to na jednom serveru je sebevražda. >> My to máme spíš tak, že my jako dělíme server pro každýho zákazníka, že vlastně jako každý zákazník má svůj server a ty servery jsou v principu nezávislý a distribu se nezávisle, což je jako ono se takováhle věc dá do nějaký míry doceli na Vercelu, ale je to trochu porod. Zatímco na tom Digital Oceanu je to vlastně jako strašně jednoduchý. A jako a druhá věc jsou ty long running věci. Prostě jako potřebuješ, aby ti něco běželo prostě jako aby jsi měl nějakýho démona, kterj ti prostě stále běží a není to jako Kron nebo prostě něco, co je vytrigrovaný nějakou událostí, kterou ti udělá Vercel, ale prostě běží to a ty si s tím můžeš dělat, co chceš a má to nějakou dedekovanou nějaký dedekovaný CPU rá a tyhlety věci. Ale to jsme se vlastně od AI dostali poměrně daleko. Já bych to možná jako stáhl zase zpátky k AIU s tím, že přemýšlím, jestli jako zpátky jít k tý komoditizaci a nebo jestli máme ještě něco, co bychom chtěli probrat. Já si myslím, že s tím tradeofem a klasickým to záleží, bychom to mohli pro dnešek uzavřít, ale klidně řekněte, jestli máte ještě něco. >> Já bych do toho ještě hodil jednu věc e s těma jako tradeofama a mixováním a to je třeba jako příklad Cloudfareu, protože ten zas jako dává nějakej jinej přístup a to i ve světě AI. Oni vlastně jako jedou po tom, že vytěžujou ten svůj hardware na maximum napříč celým světem, což souvisí i s tím, jak nabízejí AI. Vytvořili si i vlastní inference engine, kterej je podle všeho fork VLM a nebo to začali tvořit úplně od nuly, ale inspirovali se VLLM. A tam mám už pak jako mnohem širší polepůsobnosti, co se týče AI. Nejsem už jako tolik vendor loknutj z pohledu modelů, jako když jsem třeba u Open AI, ale jsem zas víc loknutej na celou tu infrastrukturu Cloudfareu. To mě mimochodem připadá jako vlastně jedna jako z věcí, že mně připadá, že člověk se vždycky musí někde loknout. To je docela jako vtipný paradox, že spoustu lidí říká, já se nechci lokovat u nějakýho modelu, ale velmi často to loknutí jenom vymění za něco jinýho a připadá mi, že tohleto je velmi univerzální pattern, ať už v AIU, v programování a možná i jako celkově v životě. >> No a tíms mi tíms mi vlastně jako potvrdil to. Eh, tys předtím říkal, že už to jako přestává dávat smysl dělat bejt ta jako abstraktní vrstva, ale my jsme se vlastně dostali k tomu, že ta abstraktní vrstva se teďkom jako stala sama, aspoň co se týče jako API. Máme v tuhle chvíli jako dva směry. Buď máme jako cloud compatible API a nebo open AI compatible API. Google už od toho dávno stoupil. Ten jede open AI compatible end pointy. Eh, MCP tool calling, tak jsou taky víceméně standardizovaný. U tool callingu se o tom ještě dá jako pochybovat vzhledem k tomu, že třeba Gemy CLI nepodporuje všechny atributy jako ostatní. E, takže když mám třeba min, max length, tak ne zrovna tyhle atributy, ale nějaký jiný, který jsou součásti standardního schématu, tak stále nejsou podporovaný. A teď je jako ta finální otázka, co všechno potřebujeme standardizovat, jak moc potřebujeme bejt jako abstraktní a nezávislí a kdy už je ta cena jako příliš vysoká. To mě přivádí k myšlence, že vlastně ono vždycky někde jako vznikne nějaký úzký komoditezovaný hrdlo, že jako například může jich být více, například jedno komoditizovaný hrdlo je u těch modelů, který jsou do nějaký míry vyměnitelný, ale co už člověk postaví nad nima, jaký jim dá tooly, jak jim dá system message, jaký k nim připojí MCP servery, to jako najednou už komoditizovaný není. Ale podle mě jako druhý hrdlo je nějaký jako univerzální dobrý hardness se všemi těmahletěmi napojenými věcmi, ale na to, aby měl člověk nějaký mote, tak zase jako jak ho použije, v jakým kontextu, v jaký aplikaci běží, jakj mu dává ten kontext a teďka ne ten jako interní, ale nějakej jako externí. A vždycky je to tak, že u nějaký věci, nějakou věc vyberu komoditizovanou, ale na ní postavím něco, co komoditizovanýho není. A to je jako možná věc, že ty pravděpodobně to stavíš vlastně nad jiným úzkým hrdlem než my. A proto to jako my možná vnímáme, nebo já to možná vnímám jako jinak než ty, ale ne proto, že bychom jako neměli jeden nebo druhej pravdu, ale protože jako mám máme jiný to úzký hrdlo, máme jakoby jinej ten abstrakční level, ve kterém jsme si řekli, že ok, tady to je komodita a nad ním stavíme tu hodnotu. >> Jo, jako rozhodně z pozice toho kontrolování tý harness z externího pohledu, tak tam si myslím, že už je to z velký části zaměnitelný. Když to voláš jakoby přes exek nebo PP a vlastně si jenom necháš vrátit výsledek, tak tam si myslím, že je to jako jedno. Ale pokud s tím potřebuješ pracovat víc, že třeba potřebuješ tomu uživateli eh zpracovávat nějak zprávy, zobrazovat mu je, e nebo nad tím stavět nějaký UI, tak tam eh je stále ještě spousta rozdílů. Třeba když vezmem jako příklad TFE Code, kterej je eh v podstatě něco jako kodex apka, ale napříč různejma harnessama, kdy je to jenom UI not harnesses, nic víc. Tak tam se krásně ukazuje, že to nemusí bejt jenom ta samotná harness, ale ještě do toho promlouvá ACP jako ten standard od Zu, kterej vlastně můžu zaintegrovat do jakýhokoliv coding agenta a najednou mám podporu pro spoustu dalších věcí. Takže já osobně fandím tomu, aby vznikly právě takovýhle standardy, který umožní ty modely a ty harnessy swičovat. >> Mhm. To mi dává smysl. A vlastně mně přijde, že jak jsi Pavle mluvil o elektřině a nějaký analogii s tím, tam je strašně důležitý, že existuje rozvinutá právě nějaká infrastruktura a že můžeš poměrně snadno přejít. Já jako když to řeknu blbě odezu k nějakýmu Bohemia Energy třeba nebo něco takovýho a přijde mě, že tohle je možná jako něco, co tady taky řešíme. Specifickou tady toho tématu by mě fakt hodně zajímalo, co si myslíte vy diváci, že jako jak to máte jakoby nad čím stavíte, co je ten váš base level a co je ten váš med. A jako vlastně teďka specificky jsem na to strašně zvědavej jakoby v těch komentářích a byl bych strašně rád za diskusi nějakou a možná bychom to tímhletím mohli ukončit pro 52 díl. >> Taky si myslím, že to můžem ukončit. Případně ještě další pointa na diváky. Je vám teďkom po tomhle díle jasný, jaký je rozdíl mezi modelem harness a nějakýma standardama nebo pokusama o standardy kolem toho, nebo byste chtěli, ať to víc do hloubky vysvětlíme a je to černý na bílým popsaný, klidně jí nasdílíme obrazovku s nějakejma infografikama nebo něčím. Kdybyste to chtěli, tak se na to připravíme víc do hloubky, ať to není jenom povídání, ale ať je to nějaká strukturovaná ukázka toho, v jakým je to teď stavu. >> My jsme to teďka udělali tak nestrukturovaně, ale přesně jako máme někde v backlogu, že bychom to rádi udělali jako velmi strukturovaně, ale nejsme si vůbec jistý, jestli je o to zájem nebo ne, tak proto se ptáme. >> Tak jo, já popřeju hezkej zbytek dne ohledu na to, jaká část dne je, kdy posloucháte. A tímhle se rozloučím. Tak ahoj. >> Čau. >> Ahoj. Ah."
businesses\ai-ta-krajta\aiTaKrajtaEpisodes.json:153:        "transcript": "Vítáme vás všechny u 50. dílu IT Cry. Tentokrát jsme tady fakt velká nálož. Je nás tady na vás šest. Po nějaký době se vrátil i Jacek. Ale než se pustíme do našeho obvyklýho kolečka novinek, tak bych chtěl poděkovat Proudbooku za podporu IT Cry. Teď se pustíme do novinek. Tak ty jsi acku říkal, že máš něco hnedka na start. Tak >> jo, já jsem tady hrozně dlouho nebyl. Eh, já nejdřív řeknu, čemu jsem se věnoval a pak řeknu novinku. Jo, já už jsem tady mluvil o nějakým toolingu pro developery, kterej jsem dělal, nějakej MCP server a celý to dopadlo tak, že jsem ho spláchnul do záchoda, poté, co schopnosti eh nástrojů jako Cloud COD a dalších e se dostaly na úroveň, že jsem zjistil, že maintenovat vlastní nástroj nemá smysl. Jo, takže my teďka u nás u Good data jsme vyrobili marketplace pro cloda, kurzora a další a všechno jsme vlastně zkonvertovali do nějakejch pravidel, skillů, e, v případě clóda i hooků a doručujem to jako pluginy. E, takže je možný doručovat centrálně i nějaký přepoužitelný věci. Tak to je jako velká změna a já jsem se místo toho vrhnul na problém, který se jmenuje Code review, kterj se stal už dávno největším blokerem, protože vývojáři generujou obrovský množství změn a nikdo to nechce reviewovat. Takže teďka se věnuju jako výzkumu toho, jaký open source tooly jsou k dispozici a píšu si vlastní toolink nad tím, kterej customizuje to chování pro naše repozitáře. Tak to je jako velká věc. A ta novinka, ta novinka, to mě hrozně zaujalo, nemůžu úplně mluvit o detailech, ale bavil jsem se teď s lidma, který jsou aktivní v oblasti sítí, e, kde jsou jenom agenti a probíhá tam nějaká ekonomika. Přišlo mi to jako hrozně zajímavý. Na začátku ten agent má nějakej budget, třeba 50 dolarů na tokeny v Antropicu třeba a je napromptovanej, aby přežil. To znamená, aby mu prostě zůstaly hit pointy, tedy budget. A ten agent má nějaký kapability, který nabízí v té síti, prodává vlastně svoje služby a zároveň může sám sebe zlepšovat a přidávat si nový kapability a nebo zlepšovat ty existující. A vznikají tam jakoby celkem jako autonomně i nějaký jako agenti, který orchestrujou jiný agenty a venku do toho pak může vstoupit člověk a objednat si službu a nějakej agent může zorchestrovat jiný agenty a službu dodat rovnou dodat. Zároveň ještě v tý síti funguje vlastně stejný jakoby princip, který funguje na reditu. To znamená, že ty agenti si budujou karmu a potom v tý ekonomice vlastně jsou jako marketovaný, propagovaný ty agenti s vyšší karmou. Takže ty agenti jsou motivovaný nejenom jako shromažďovat peníze, aby přežili, ale i vlastně zlepšovat svoji karmu, aby byly víc vidět a aby byly víc nabízený a byli úspěšnější. Což mi celý přijde hrozně zajímavý. Bavili jsme se potom i o tom, jak by měla vypadat ta ekonomika a jak by třeba vypadalo B2B v takovýmhle případě, jo? To znamená, když by prostě nějaká velká organizace, velkej korporát chtěl používat služby v takovýhle síti, tak to samozřejmě má i nějaký compliance a security dopady. Takže jsme se bavili třeba o tom, jestli by ty agenti mohli běhat i on premise a jak by to vlastně celý fungovalo, aby to bylo použitelný i v nějakejch seriózních firmách. Takže todle celý mi přišlo hrozně zajímavý a chtěl jsem to tady sdílet. >> Já jsem natrefil na nějaký podobný projekty. Plus teďkom se kolem toho částečně motá i Gastown, kterej nejde úplně tím směrem, jakj popisuješ. Tam furt hraje svou roli e člověk, ale je to hodně o tom jako agentním dodávání. Já jsem v tomhle trošku skeptickej, protože si myslím, že je to důsledek levnejch tokenů, který nám pomalu končí. že jako lidi vymýšlej, kde všude pálit tokeny, stejně jako tady byl moldbook a tak. A já nevím, jakože já jsem vždycky měl tokenů málo a to jsem měl dvě GPT pro subscription a stejně jsem to byl schopnej drtit a otočit 5 000 dolarů za měsíc klidně. Takže tohle mi přijde jako strašný plejtování. Ale když to jako někdo nedělá za moje prachy, tak mi je to vlastně jedno. Je to zajímavý jako zjistit, co z toho bude. >> No, já si právě myslím, že ten cíl v tomhle případě je právě nechat autonomně ty agenty optimalizovat sami sebe a hledat tu cestu co nejefektivnější ekonomiky, jo? A ty agenti prostě nedokážou přežít, když bez hlavě pálej tokeny. Takže ty agenti jsou nucený přemjšlet o tom, za co nejmíň tokenů naimplementovat novou kapabilitu, rozšířit a zároveň jsou nucený uvažovat o tom, jestli to může nebo nemůže bejt ekonomicky úspěšný. Takže ty vlastně necháš autonomě v tý síti obrovský množství agentů hledat ty optimalizační cesty. Oni to jako dělají za tebe a ty se tím pak můžeš inspirovat teoreticky i jako člověk. Todle mi na tom přišlo asi nejzajímavější. >> Jo, tohle tohle podle mě může bejt hodně dobrý využití. Eh, tím přejdu ke svojí novince, eh, protože se to toho týká a to je právě nějaká jako optimalizace agentů a self optimalizace, kdy teďkom Hermes agent, eh, má svoji verzi, která má název Hermes agent selfolving nebo nějak tak. Navíc vyšel eh tool Halo od lidí, kteří se motají kolem DSPY. Princip je ten samej. bereme i tracy modelů a jsme schopni vylepšovat ten model nebo celý ten setup, protože to, jak funguje třeba Hermes agent, tak v tý selfolving verzi je schopnej si upravovat skilly na základě traců, jestli jsou ty skilly používaný ve správnou dobu, ale do budoucna by chtěly optimalizovat i prompty i další části. Vlastně e nejzajímavější mi tam přijde, že se dá optimalizovat tool calling podle toho, že detekuju, že to se lhává. Třeba já nevím, mám tool na editaci souboru a vím, že zrovna tenhle model, kterej používám, nejlíp funguje s patch tolem na div, tak vytuním to přesně na tenhle model. Ale zároveň víme, že některý jiný modely a to v minulosti ukazoval skvěle benchmark, fungují líp s jinýma nástrojema na editaci. Takže tohle mi na tom přijde strašně koužo. Vlastně mně stačí to používat asidis a ta hardness se mi sama vylepší, se to tam vlastně jako aplikuje. Zatím to podle mě není jako úplně dotažená myšlenka, ale začíná se toho objevat čím dál tím víc, kdy přesně tohle všechno jsme schopni optimalizovat. prompty, tooly, msepka, e, reasoning a vlastně všechno tak nějak dohromady, >> jo. Takže jestli to chápu dobře, tak prostě mají nějakou metriku, ty si prohodíš model za jinej a ono ti to zoptimalizuje vlastně úplně všechno. >> Nemusíš ani měnit ten model. On ten model může jakoby vlastně zpětně si projít svoje vlastní tracy a zjistí, že selhává v tool callingu třeba edit Toolu, tak změní popisek edit Toolu a díky tomu, že má všechny ty data, tak je schopnej to vlastně i jako znovu přehrát ty informace a zjistit, jestli ten model vlastně bude zase v tom selhávat nebo ne. Samozřejmě to má nějaký náklady na tu optimalizaci, ale pokud zvýším stabilitu tool callingu o 30 %, tak i ze střednědobýho hlediska, tak se mi vyplatí spálit nějaký ty tokeny na týhle optimalizaci. No, já možná navážu teda svojí novinkou, co mě teď zaujalo a vlastně není to úplně jakože směr modernizace nových modelů, ale je to zajímavý experiment, kdy jsem teď viděla, že vytrénovali model na datech jenom do roku 1930. Jo, žádný další znalosti z dalších let on prostě nezná. A zajímavý to je proto, že můžou potom na takovým modelu dělat různý experimenty. Například taková ta stará známá palčivá otázka, jestli ten model dokáže udělat nějaký vědecký objev, objevit něco novýho. Takže tady se to dá skvěle vyzkoušet. Případně můžou zkusit, jestli se model z roku 1930 jenom vlastně na základě kontextu dokáže naučit Python. to taky zkoušeli a vlastně to ukazuje, jak moc to AI reasonuje a jak moc vlastně si v uvozovkách pamatuje tu odpověď z těch dat, co vidělo. Takže to určitě pak e hodím odkaz dolů do odkazu. Je to opravdu zajímavý. Mají tam nějaký předběžný výsledky a bude zajímavý to sledovat. >> To mě přijde strašně zajímavý, ale strašně by mě zajímalo, proč vybrali rok 1930 jako tu hranici. Já teda, kdybych si mohl vybrat, tak bych si vybral rok 1904. těsně předtím, než vyšla speciální teorie relativity a fotoelektrický efekt a všechny věci od Einsteina a tam se, že jo, jako říká, že to bylo už zralý a že ten Einstein měl štěstí, že byl první. A tam by mě strašně zajímalo, jestli by ten model to jako dal a z těch vlastně už známejch výzkumů, který byly předtím, tak jestli by odvodil eh takovýdle věci. No >> určitě budu rád vždy na zděž, protože mně by tam přišlo jako za mě je v tomhle strašně podstatný na ty objevy, eh, aby dali vědět, kolik miliard těch dat vlastně dali dohromady v těch tokenech, protože přece jenom už teď se bavíme o tom, že nám jako data docházejí a vzhledem k tomu, že máme nějaký jako to optimální škálování modelů, kterým už před časem, že jo, vydal research Google, tak by mě zajímalo, jak velkej ten model může bejt, jestli ta jeho limitace vlastně nebude způsoben Á tím, že nemůžem udělat dostatečně jako capable model, protože nemáme dost dat pro daný období v digitální podobě. >> No oni jako měli těch dan docela dost. Já to tady mám otevřený a nemůžu to najít zrovna, ale ten model jako je to 13 bilionů parametrů a samozřejmě, no, museli prostě řešit OCR na všech těch starejch textech a kontrolovat, jestli ty texty opravdu jsou do toho danýho období. A stalo se jim tam, že jim tam omylem přeteklo něco z nějakýho prostě o pár let pozdějc. A bylo to určitě pěkně složitý ty data získat. Jo, tady to píšou. 260 bilionů tokenů. No, na historických anglických textech. >> Jo. E, ať nemystifikujem posluchače miliard, protože ty to předkládáš z angličtiny, že? >> A jo, ano, ano, to angličtině. Já bych tam měl ještě jednu takovou ani nevymysl obavu, ale tady takováhle věc se dělá často u akcí, že se jako vymyslí nějaká skvělá strategie a backtestuje se na tom, jak ten akciovej trh vypadal. A ono tohle moc nefunguje do budoucna potom. A mě by fakt hodně zajímalo, že jestli strategie, která je takhle back testovaná tímhletím způsobem, tak bude pak fungovat dál i na nový objevy. Jsem jako strašně zvědavej na tohleto. >> Já pořád přemýšlím nad tím, proč si vybrali to datum, jak se ptal Jacek 1930. Hm. To je jako vlastně těsně předtím, než já nevím, než vznikly takový objevy jako nebo byly publikovaný články o Touringových strojích a tak, jestli to s tím nějak souvisí. Každopádně abych možná uved svou novinku. Eh, my jsme před několika díly tady měli Matouše Hafenus Apoko. H, ono to s tím tak úplně nesouvisí možná, ale kdo ví. Redhead vydal open source, kterýmu říkají tankos. Nevím, jestli jste o tom slyšeli. Je to vlastně taková, představte si prostě jako sandbox, ve který má prostě hotový operační systém, kde už běží open clow. Je to takový jako bezpečnější sandboxovaný prostředí odvozený z Fedory, na který můžete jako demovat různý agentní chování, jako by to byl Open Claw. A přijde mě to docela zajímavý a tak nějak závě to souvisí s tím tématem té agentické ekonomiky, co se teď bavíme, takže odkaz určitě dáme do popisku. No, já jsem teďka někde, to mě kdyžtak opravte, jo, ale mám takový pocit, že jsem teďka někde čet, že je teďka obrovskj boom v Číně, kde vlastně chtěj co nejvíc lidí přesvědčit, aby používali nástroje, jako je OpenCla. Takže tam běžně prostě před offisama těch firem, který vlastně dělaj to AI v uvozovkách, tak tam prostě seděj zaměstnanci tý firmy a prostě stareým babičkám čínskejm prostě pomáhají instalovat OpenCla do notebooku, aby prostě to všichni měli. A ta motivace v tý Číně je samozřejmě je zřejmá, že to není motivace, není to svět, v kterým bychom chtěli žít. Ale přišlo mi hrozně zajímavý, jak vlastně se přeskakuje několik kroků a těm lidem, který vlastně vůbec jako nejsou e te savey, se tlačej tydlety věci na sílu, aby vlastně mohli úplně cokoliv dělat AI asistovaně, když to tak řeknu, jo, navzdory tomu, že ty lidi ještě jako v našem světě takový lidi mají telefon aligátor, že jo. Takže todle mi přišlo jako zajímavý. No, akorát ta motivace v tý Číně, že jo, tam je to o tom, že je budou sledovat a tak. No, to není hezký, ale je to zajímavý. >> Mě by ještě zajímalo, jestli jako krom toho, že je tam jako zapečený to sledování, tak já bych zatím viděl motivaci těch traců pro trénink. >> Hm. Protože ať chceme nebo ne, tak jako když se jde fakt jako na dřeň, tak i když vezmem ty nejlepší modely jako Kimi K26 Koder nebo něco, tak prostě ten reasoning je trošku dutej v porovnání jako s GPT 55 a podle mě se tímhle budou snažit získat ty data pro tu e ekonomiku samotnou, aby to dovedli vyškálovat. >> Jo, to je pravda. O tom tam psali taky. No >> to je to je zajímavej pohled, no. Protože internet už pročesali důkladně a kde teď sehnat ty další data, no to bude čím dál těžší. >> Hele, teď jsem si vzpomněl, já jsem se vás chtěl ještě zeptat na jednu věc. Co říkáte na to, že Amazon, respektive AWS začne nabízet Open AI GPT modely? Co si o tom myslíte? Za mě je to podle mě jako docela logický krok, že jo. Ono je to tak, že vlastně jako ty laboratoře v uvozovkách Antropic a Open AI ty věci vyvinou a pak reálně ty velký firmy to budou provozovat pravděpodobně ne skrz Open AI nebo Antropic nebo skrz Moonshot například, ale prostě přes tyhlety velký agregátory. A já už to jako vidím. My už jako občas vidíme, že je poptávka po tom, abychom tu věc spustili nad AWS nebo nad Azure, ne nad těma startupovýma ekosystémama. >> Jo, jo, to dává smysl. No, já se na to dívám tak, že tam velkou roli hrajou ty velký enterprisey a ta compliance, to, že to může běžet v bedrocku, v AVS, ve tvým VPC, tvým accountu AVSkovým jakoby on premise v uvozovkách je obrovská deviza samozřejmě. Jo, takže i my se na to taky takhle díváme, že to je vlastně příležitost pro nás a zákazníci, který nechtěj se gooddaty connectit do Open AI, eh, jsou velmi ochotní se konektit do bedrocku v AVS a protože to běží u nich v uvozovkách. >> Tam podle mě budou takový dva velký trendy. Ten jeden bude ty privátní jako privátní cloudy nebo zabezpečený cloudy, který si můžeš určit, jestli ti to běží ve Frankfurtu nebo kde. A poděkuju sdikcí a máš to všechno dohromady. A ta podle mě druhá velká věc, která přijde, tak bude nějaký edge computing, kde jako spoustu toho se dá offloadovat už na ty koncový zařízení, případně na nějaký prostě, nechci říkat CDN servery, protože to není CDN server, ale prostě něco jako ekvivalent CDN serveru, ale pro nějaký jako jednodušší model. Na tohle jsem jako zvědavý, protože mi to připomnělo Cloudfare, který teďka měl zajímavý článek o tom, že optimalizovali a udělali si vlastní VLLM, což je alternativa lama CPP a podobnejch nástrojů na spouštění modelů. A právě tam mluvili o tom, že jsou schopni on the edge pouštět i velký modely, jako je Kim 2,5 26. 26 v tý době ještě nebyla. Takže myslím si, že tímhle směrem to taky půjde, ale ta latence u těch jazykových modelů vlastně není to hlavní v tomhle ohledu, protože to, že to mám blíž, mi zas takovou rychlost nepřinese v těch token delivery. Takže tam mi přišlo mnohem zajímavější, že to optimalizovali ten celej inference engine na svůj stack. Oni jsou docela jako otevřeni v tom, co Cloudfare používá, že jo. Oni i s AMD řešili pečování nějakejch věcí na úrovni kernelu, takže tam by mě zajímalo, jestli něco z toho promítnou zpátky do open source, když vlastně stavěj nad VLLem nebo nad podobnejma nástrojema. Ale je to hodně vázaný na ty na ty jejich technologie, takže za mě to dává maximální smysl. E pro Enterprisey rozhodně. Já už to s klientama řeším. Otázka je, když se teďkom čím dál tím víc přechází na API usage. Jak moc drahý to pro ty firmy bude? Protože ty náklady to jde jako do 10 000 dolarů, co tak jako pozoruju. >> Když říkáš, že se víc přechází do API usage, teď myslíš ze subscription do API usage nebo z nějakýho on premise do API usage? Myslím tím jakože ty náklady se přechází prostě, že i GitHub copilot teďkom přechází na API usage based pricing a vlastně všichni to jako zařezávaj a myslím si, že i Antropic teďkom dokonce dělá to, že v enterprise sech pro nový zákazníky už nedává subscription, ale že už se jede čistě za API náklady, což je dost brutální, když vezmu firmu, která prostě měla 300 seatů třeba a najednou řeknou:„No, tak tady máte jenom APA usage a Decit. To je podle mě neudržitelný. My to třeší, to je teda fakt dostání. >> My to my to my to řešíme teďka jako aktuálně hodně intenzivně. My jsme vlastně odešli z kurzoru, protože byl předraženej a teď u toho Antropicu pozorujeme jako velmi podobný chování, kdy oni jako zdražujou a s každým novým modelem ti začínají ty tokeny jako vyprchávat mnohem rychlejš. Ale je to právě ten důvod, proč jsme nešli do Enterpriseu, i když bysme mohli, protože ten team plan je furt jako prostě za 200 dolarů dostaneš nějaký jako limity na 5 hodin a na tejden a do nich se většina lidí vejde a je to ekonomicky udržitelný a těch pár lidí, který jakoby jsou extrémně aktivní, tak vytečou jakoby z toho okna pětihodinovýho nebo tejdenního a přecházejí do toho usage base pricingu a tam uvidíme prostě, jak moc budou pálit ty peníze a jak moc Moc se to, ale obecně, co já teď pozoruju poslední tejdny a měsíce, tak je, že všichni ty vendoři postupně tlačej na pilu a zdražujou a ty tokeny rychlejš jako mizej. A je otázka jako kde kde je ten strop pro firmy, jako třeba je moje firma, co je udržitelný. Ale zároveň co já třeba pozoruju u nás ve firmě je, že vlastně náš top management naskočil na tu vlnu, kterou jako velmi hezky prezentoval šéf Nvidie. kterj prostě někde řek, že když člověk nespálí tokeny aspoň za stejný peníze, který bere jako plat, tak nemá právo pracovat v jeho firmě. Takže přijde mi, když dokážeš měřit tu hodnotu, kterou ti to dává, když ty lidi skutečně dodávají byznys hodnotu a zrychluje se dodávání těch feature v tý firmě, tak ten top management mávne rukou nad tím, jestli se spálí o 10 000 dolarů měsíčně víc nebo míň. mě to jako jedno, jo, protože 10 000 dolarů vypadá jako hodně peněz, ale když si to spočítáte, že máte prostě, já nevím, 100 vývojářů, který berou nějakej měsíční plat, tak 10 000 dolarů za měsíc je vlastně zanedbatelná částka, jo, takže člověk se na to musí dívat trochu i touhle optikou, jo, >> to je podle mě jako jak říkáš a ono tam říkali e mluvil kdysi Pavol, že vlastně dokud to pro něj má ten zisk, tak se to vyplatí. Za mě jako teďkom jsem seděl s lidma z Vercellu těsně před tím crashem vlastně vedle mě seděl Rich Harris, když jim tam přišlo to memo, že je hacknuli interně, tak říkal, že to bude zábavnej víkend. Ale chtěl jsem spíš mluvit o tom jako používání, že Vercel, tak má třeba interní žebříčky na to, kdo toho používá nejvíc a fakt to jako tlačej a překvapení nejvíc tokenů používá člověk, kterej stojí za vírou, protože ten to prostě jako jede absurdním způsobem. Nicméně za mě furt jako je to jak říkáš, ale zároveň už dává smysl pracovat s tím, že bych sbíral rozhodně všechny tracy, abych si pak mohl dofine tunovat vlastní model. K něčemu podobnýmu už došel kamarád, kterýho já zmiňuju několikrát. Scripted alchemy za Jackson, tak on teďkom už pálí tak neskutečným způsobem s tím, že furt dodává hodnotu, že mu radši pořídili B200 klustr s tabem ramek, aby si mohl hrát, protože ten člověk jako je schopnej propálit, když mu dal kurzor 60 000 dolarů, tak to spálil za měsíc na užitečnejch věcech. No to to je to jako ten náš top management chce vědět, že to je užitečný. A to je teda jako novinka, kterou jsem ještě neřekl. To je další věc, který se teď věnuju. Já už jsem tady asi mluvil o tom, že existuje projekt, kterej se jmenuje Git AI, kde ty si nainstaluješ klienta do clouda, kurzoru nebo čehokoliv a ono to vlastně sbírá telemetry, e, co děláš a pak to ty informace pushuje do gitu ve formě gitnes a ty to pak můžeš nad tím postavit jakoby nějakou observabilitu a nějakej monitoring, nějakou analytiku. Tak tole já se snažím teďka rozvíjet dál a vyvinul jsem si vlastní tool, který s pomocí LLMka evaluuje hodnotu PL requestu a jsem jako tak v půlce, bych řekl toho a otevírájí se tam jako hrozně zajímavý otázky, jo, příklad, jo, máme jako spoustu užitečnejch informací v díře, jo. E, ve chvíli, kdy spojím pl requesto, spojím to s nějakým highlevel projektem, mám tam jako t-shirt sizing, mám tam nějaký datumy, jako kdy se to mělo dodat a tak dále. Mám tam nějakou business value popsanou. Máme třeba next later road mapu od produktu, jo, která se mění jednou za kvartál. Všechen tenle kontext, když sesbíráš a na základě toho vyhodnotíš hodnotu pl requestu a pak tu analytiku postavíš nad tím, tak najednou to, že nějakej developer pálí hodně, není ten jedinej údaj, kterej máš, ale máš tam i tu business value, kterou dodává a seš hrozně dobře schopen detekovat, že ten člověk si třeba dělá pet projekty, jo, nebo že prostě furt refaktoruje ten stejnej kód úplně zbytečně, jo, a podobný věci. A to když dáš tomu top managementu, tak on najednou vidí, že ta business value tam je reálná a zároveň ty manažeři můžou jako challengeovat ty developery, jestli nedělají zbytečný věci. Vypadá to hrozně dobře, zároveň je to ale strašně strašidelný. vývojáři se toho trochu bojej, takže je to jako velký téma do budoucna pro mě a dá se na tom jako dál a dál jako pracovat a vlastně ta customizace toho kontextu, aby tam byla ta tvoje business value a ne nějaká obecná, kterou to LMko vyhaluzí, je ten klíč k tomu úspěchu, jo? A úplně to stejný je to u těch p requestů, u toho code review, o kterým jsem mluvil na začátku, jo, tam vlastně postupuju stejně, sesbírám Idhubovu historii a customizuju prompt pro code review na základě skutečnejch code review z historie, jo, takže to jako respektuje ty preference těch developerů. Třeba i jako per tým, per repozitář se to dá dělat. Tam už jako si můžeš sám říct, co chceš a máš to plně pod kontrolou a ne, že si tam nainstaluješ, my tam teď máme bugbota od kurzoru, ten to nějak jako dělá to COD review, je to drahý jako a 90 % vývojářů s tím není spokojenejch. To mi to mi připomnělo to, že zrovna včera vyšel znova článek od Factory AI, což jsou autoři droidu jako commandlinovýho nástroje a právě dělali žebříček na Code reviews, kolik to stálo a co to všechno našlo. A mluvili tam i o tom, že to třeba dělalo nějaký jako false positives a vlastně to tam za mě velice hezky rozvedli a podstatný bylo to, že třeba nejlepší model vyšel GPT 52, která už je jako docela řekněme letitá, e, co se týče AI a GPT 54 ta zas třeba jako na tom byla dobře, ale byla velice jako eager to overcomm. vlastně radši toho přidala víc >> a některý z toho byly jako nepravda. Takže pracuješ nějaký na úrovni toho, že používáte různý modely a vyhodnocuješ to, nebo tam ještě nejsi v tomhle? >> Jsem uprostřed eh divokýho testování a vypadávají z toho strašně zajímavý jako informace. Jo, já jsem nejdřív testoval nějaký open source nástroje, konkrétně třeba Roborev a PR agent. To jsou takový dva asi nejznámější open source projekty na COD review. A pak jsem zjistil, že mi nevyhovujou, tak jsem si to celý napsal sám a při tom psaní jsem zjistil, že eh napsat si harness pro COD review není jen tak. Není to úplně triviální úloha, jo. A pak jsem to testoval s různejma modelama a s různejma strategiema a třeba jsem zjistil jako, že Opus je levnější než Sonet. Jo a to ne proto, že by byl levnější, on je pětkrát dražší per token, ale protože je o tolik šitřejší, tak tu úlohu zvládne udělat mnohem efektivnějš a v konečným důsledku je Sonet o třetinu dražší, jo. Zároveň je Sonet o třetinu pomalejší, jo, při nad velkým pull requestem, protože prostě zase je míň efektivní, dělá to na víc kroků prostě a tak dále, takže nakonec zjistí, že je lepší použít prostě opust, což pro mě bylo obrovský překvapení. Jo, pak jsem zkoušel Codex jako ten background proces e s GPT modelem a tam to vyšlo ekonomicky líp, ale kvalitativně mnohem hůř, jo, takže, ale říkám, jsem na začátku, takže tam podle mě ještě objevím hrozně moc věcí. >> Hele, to jsem zvědavej na tvoje výsledky. Když budeš mít něco publikovatelnýho, tak za to určitě budu strašně rád, protože tady třeba oni zase jako ukazují eh nějakej jako kost a vlastně se chceš pohybovat co nejvíc tady nad tou linkou. e, kdy tam nejlepší výsledky podává GPT 52. Je tady vidět, že jako opus 46 i 47 už jsou jako v tý hranici diminishing returns, kdy nemají přidanou hodnotu ve srovnání s ostatníma, ale zároveň jsou jako výrazně dražší a když vezmu jako 4 dol per code review, to je docela už jako brutální darda, když tady prostě půjdu jinam. Tam je podle mě jako otázka, jakou máš tu, jakou máš tu harness kolem toho review, protože určitě se podívej, oni tady dole mají i, že open sourceovali ten jejich nástroj na code review. >> Mhm. Mhm. Já se na to určitě podívám. Tam jako bejvá problém ještě s licencema. třeba ten PR agent jakoby dneska už a toto to je obecně teďka trend, že ty open source projekty začnou s nějakou permisivní licencí typu Apage 2.0 nebo MIT a pak zjistěj, že vlastně by z toho chtěli udělat byznys a tak to forknou a dají tam jinou licenci a nad tím postavěj SAS a ten původní repozitář začne umírat. To je prostě jako asi běžnej trend a v týhle oblasti je teď velmi jako aktuální, no. Takže hodně často prostě narazíš do zdi, protože eh zjistíš, že to, co je použitelný, už je za špatnou licencí. E paradoxně i když to nedáváš do produktu, je to jenom jako podpora vývojářů, tak ty licence jsou napsaný tak dobře, že ani to nemůžeš dělat. >> Vždyť já jsem jenom se chtěla ještě vrátit k tý byznys hodnotě p requestu. Ten pojem mě hrozně zaujal. To je zajímavá metrika a vlastně mě napadlo, že to trošku souvisí i s tím, že já nevím, co si o tom myslíte vy, ale ono možná platit vývojáře za čas strávenej na tom programování už přestává trochu dávat smysl. A jestli teda jestli teda nebudou nás usuzovat podle byznys hodnoty půl requestu a jestli něco takovýho teda už existovalo předtím. Já nevím, já jsem přišla z akademický sféry, takže nevím, co myslíte. Už jsme už jsme dod zmiňovali několik dílů dozu. Je taková věc, která se jmenuje, že Good law nebo Goodartovo pravidlo, který vlastně říká, že jakákoliv betrika, která se nastaví jednoznačně, tak v podstatě neměří asi úplně to, co bychom chtěli. Že je úplně jedno, jestli budeme měřit p requesty nebo vydělaný peníze nebo spotřebovaný tokeny nebo poměr spotřebovaných tokenů a práce. Je to úplně jedno. Vždycky, pokud tam bude takováhle incentiva, tak vždycky tam budou lidi, co budou nejlepší, ale zároveň to nebude zjevně to, co chceme v tom byznyse. A mně se strašně líbilo to, co říkal Jacek, že jako ten problém jako to odvětví toho, jak jako nasazovat AI do vývoje, začíná být strašně komplexní, že to jako vůbec není už jenom o tom, že hm eh jakej nejlepší model zvolíme a jak napíšeme Agents MD, ale že tady to začíná mít strašně moc různejch jako vstupů a my se teďka na tom poli vlastně taky s Prombookem začínáme pohybovat a vlastně tuhletu věc taky jako tuhletu knoow transferujeme my taky do firem a o třeba z level menších než v Jacku, ale ale vlastně jako začíná to být napříč tím trhem jako velká hodnota tahleta věc. >> Já bych tomu jenom řek, zareagoval na to, co říkala Kačka. Já si myslím, že není důležitá jako ta absolutní metrika, ale ta změna v čase, jo. A dřív dřív, když nebyly LLMK, tak se měřily počty změněnejch řádek, počty komitů a tak dále a ty manažeři to chtěli a byl to nesmysl. A to AI je tady podle mě game changer, jo? A zatím to ještě jako neumíme dobře používat, ale to, že vlastně nějak něco jako LLM dokáže posoudit hodnotu a vzít v potaz nějakej kontext tý firmy je z mýho pohledu obrovská změna, jo. A furt bude platit to, co říká Pavol, jo. Furt budou existovat lidi, vývojáři, který to dokážou vojebat tu metriku a budou nejlepší, i když nejsou nejlepší. Jo, ale kvalitativně ta hodnota eh v tý metrice, kterou dneska dokážem vyrobit s pomocí AI, je řádově větší, než co jsme byli schopni měřit v minulosti. I >> já bych takhle, já bych jako vůbec neřekl ojivad. Já bych jako řekl, že jako když se nastaví incentivy nějakým způsobem, tak logicky se tomu lidi přizpůsobujou. A já jsem třeba teďka řešil daně a přesně jako vidím, že jo, jasně, záměr byl takovejhle, ale jako pokud bych to udělal takhle a tahle věc by byla udělaná jako půjčka, ne jako to a tohle by se udělalo takhle, tak by se vlastně platilo míň, i když je to fakticky to samý. A teďka jako jasně, to prostě ta incentiva je nastavená blbě a mně přijde, že úplně úplně jako to samý, úplně ekvivalent toho je, když se před jako 10 lety nastavila metrika, musíte mít alespoň nevím 10 000 řádků kódu napsaných za měsíc, tak to je incentiva, která je napsaná úplně dementně. Ale pokud Jensen Huang dneska říká, že jako vývojář musí pálit alespoň tolik a tolik na tokenech, tak z jeho pohledu dodává smysl, protože on je vlastník Nvidie a prostě jakoby on tu incentivu nastavuje dobře pro sebe, ale pro majitele firmy je to úplně dementně nastavená incentiva. >> Jo, jo, je to tak. >> Kdybych byl AVS, tak to samozřejmě sdílím. Kdybych byl Microsoft, tak to sdílím. Kdybych vyráběl čipy, tak to sdílím. Ale jako být nějakou firmou, která má AIO jako náklad, ne jako to, za co vydělává, tak mně to nepřijde úplně rozumný. >> To je dobrý. Todle to mě přivádí na myšlenku poprvý teda. Vždycky tady mě něco napadne. Ty jo, když se s váma bavím. To mě přivádí na myšlenku, že pull requesty, který měněj třeba clodový skilly, by měly jako být posuzovaný speciálním způsobem, protože ten dopad toho pů requestu může bejt, že ušetříte spoustu peněz nebo zrychlíte ten vývoj. A to je hodnota sama o sobě, i když vlastně to není podpořený žádným byznysovým zadáním. Jo. A stejný to může být třeba představte si, že zoptimalizujete pipeliny, CICD pipeliny a tím zvýšíte velocitu vývojářů. Jo, zase business value nula, ale dopad na firmu obrovskej a vlastně v přeneseným slova smyslu tam ta business value je. A todleten můj nástroj vůbec nebude brát v potaz. Sakra, to já budu muset nějak jako se nad tím zamyslet. Já si myslím, že tohle vytracovat je vlastně jako extrémně náročný, že jako ano, jsme schopni to podpořit velkým množstvím dat, ale jako u všeho je tam jako nějakej point of diminishing returns. A o tom mluvil třeba B dance, že jim se vyplatilo investovat jako 80 milionů dolarů do platu lidí, aby vyvinuli a pack, protože jenom na nákladech na CICD jim to cutnulo kosty, takže se jim to jako do půl roku nebo do roka vrátilo. Jenže teďkom jako jsme v řádu, kdy nám to zabírá jako milisekundy maximálně jako nižší desítky sekund i na obrovský codebasy. A tam, když to jako snížím o 10 %, tak už to jako nemá takovou hodnotu, jako když jdu z několika minut. A myslím si, že to samý bude i s těma tokenama nebo optimalizací skillů. Pokud já bych ti řekl, že jsem schopnej jako dlouhodobě optimalizovat token usage, ale zároveň jsem na tom vypálil přes ty iterace na ty self optimalizace a tak. e milion dolarů v tokenech, tak jako víš co, je to jako se vším. Prostě vždycky tam bude nějaký jako bod zlomu, spojit to všechno do sebe. Myslím si, že dává smysl se soustředit i tady u toho nástroje na to, kde to můžeš jako dobře měřit a jsou body, kde prostě budeš vědět, že seš slepej nebo jako poloslepej. >> Jo, jo, určitě. No to je mimochodem ještě jedna z věcí, kterou tam řeším a to je jak často se ten kód přepisuje a vrací z produkce a jak často se na něj reportujou bugy. Jo, to je jako další velký téma. Taky to není jednoduše spočítatelný, ale dá se to deterministicky bez AI i klidně. A je to důležitá metrika, jo, protože i když ten člověk dělá na byznysově prioritním projektu, tak když se takhle chová, že se mu to často vrací, tak je to znamení, že něco není v pořádku. No, je to komplexní. >> Jak by ten tvůj nástroj vyhodnotil ten MCP, tu link, co jsi zahodil, jak jsi říkal na začátku? Děláš na tom? >> To je dobrý. Jo, to teda mimochodem to jenom taková krátká poznámka, jo, já jsem to jako úplně ještě nezahodil a je to teďka tak, že část repozitářů je přemigrovaná čistě jako na skilly a část ne, tam je furt jako ten MCP server a testuju to a vlastně ty skilly fungujou dobře, nemusíš mít svůj tooling, je to jako dobrý, ale jedna nevýhoda se tam už projevila, jo. A to je context management, jo. A teď jak vlastně oni zdražujou a zrychlujou pálení tokenů ty vendoři jako antropik, tak se to začlo jako masivně projevovat. Ještě nota B, ne, když máš jednom milionový kontext Window, jo, třeba v opus 47, jo, a tam jsem odpozoroval, že ten můj MCP server se choval tak, že ten kontext dával jenom ten, který opravdu byl potřeba a občerstvoval ho jenom, když to bylo potřeba. A ten Cloud vlastně neměl žádný svoje kontext fily, nemohl nic načítat a ty jsi nad tím neměl kontrolu a tak. Jo, takže ten výsledek, když používáš ten MCP server, je, že mnohem pomaleji začneš zaplňovat to kontext Window. A ono to není jenom o tom, že hitneš ten 1 milion. Ono je to totiž i o tom, že když seš přes půl milionu, tak už je to dýchavičný a začne to dělat jako častěji chyby a tak, že jo. Takže pak jak debil furt dokola voláš lobeno kompakt a čekáš 3 minuty na kompakt, až zdržuje tě to, tě to a tak. A todle furt podle mě je ta velký benefit toho mýho přístupu, toho mýho MCP serveru. Takže já jako ten projekt vlastně nejsem si ještě stoprc jistej, že ho spláchnu do záchoda, ale prostě ty výhody, že využíváš ty nativní schopnosti nástrojů, jsou neoddiskutovatelný. Jo, jako nejlepší by bylo, kdyby prostě Antropik udělal něco podobnýho a oni se snažej v tom hardnessu tydlety věci jako dělat a je otázka, jak rychle a tam je problém s tou motivací, že jo. Oni asi nejsou moc motivovaný to řešit, protože jim to vydělává peníze, koneckonců, že? Takže >> mně tam v tom všem, co ty říkáš, přijde jako ještě jedna věc a to ta, že je strašně velkej prostor pro seniory v tady tom, že spoustu lidí má ten pocit, že jo, vždyť nám to kló celý vyřeší, ale je tam začíná mít tak strašně moc parametrů, že jako vyslovně vzniká nová role člověka, který rozumí tomuhle. >> Jo. Jo, todle platí obecně. To je jako pro mě taky obrovský téma, jak enablovat subject matter experty, jo. A zrovna jak jsme se bavili o tom kamarádovi Adamovi Feedlerovi před natáčením, tak ten přesně dělá v tý oblasti, která je nejsložitější v Gooddatě a nejproprietárnější. ty lolmka tomu málo rozuměj, jo? A já tomu třeba jako rozumím tak napůl, jo? Nejsem rozhodně subject matter expert a když tam dělám velký složitý zásahy, tak dělám chyby a dělám to špatně, jo? A tam, kdyby ten subject matter expert, který tomu fakt rozumí a zároveň by dobře uměl používat Cluda a používal ho jakoby intenzivně, tak to je ten svatej gral, že jo. To jo. A ty ty lidi, který budou mít tu znalost tý domény, budou furt ten diferenciátor tý firmy a budou to ty drivery prostě. A todle nezmizí. Tyhle lidi o práci nepřijdou. A ta krucinální otázka dneška zní, jak tydlety lidi přesvědčit, aby se naučili, aby získali ty zkušenosti při používání nástrojů, jako je Cloud COD a aby tomu dávali šanci. Protože co já tak pozoruju, tak tydle lidi častěji jsou jako rezistentní vůči tomu a nechce se jim do toho. Jo. A chce to čas asi. No, >> mimochodem tohleto mně připadá jako takovej zvláštní paradox, že velmi často nejvíc AI jsou nadšený junioři a paradoxy mně přijde, že nejvíc by z nich mohli benefitovat senioři a vůbec si nemyslím, že to platí jenom pro coding, že že myslím si, že teďka se bavíme o codingu, protože poslední rok byl v duchu prostě vibe codingu a toho, jaký úžasný věci se dají dělat. Ale tohle přijde i do jinýho odvětví, jako různý úředničina, advokacie, eh, všechny takovýhle věci, jako tam to přijde a tam to bude úplně stejná mala, jak je to v IT. Teďka >> já ti do toho rovnou skočím, protože jsi mě jako chytnul tím pojmem jako, že nejvíc to používají junioři. Já působím jako nějakou dobu v Junior Guruu. Tímhle zdravím Honzu Javorka, pokud nás poslouchá. A mezi těma juniorama to není takhle jakože ani zdaleka, protože pro ně je to jakoby obrovský náraz, protože oni investují čas, investují peníze do toho, aby se naučili ty základy a eh pomalu pozorují, jak se to jako promítá třeba do těch inzerátů firem, jak e se to promítá i do tý diskuze, co je jako veřejně na internetu. Takže za mě to jako rozhodně není o tom, že by juniři byli ti jako extrémní useři. Naopak ti junioři, kteří skutečně míří do IT, tak potřebujou najít cestu, aby jim to AI něco dávalo, ale zároveň, aby to nebylo o tom, že já jsem junior v rapper nad chat GPT, ahoj. Takže oni potřebují najít jako tu hodnotu a pro juniora, kterej skutečně chce pracovat v IT, tak je to je to jako o něčem jiným. Já si myslím, že jako ten jako skutečnej extrémní user AI je spíš někdo, kdo nemíří do IT, že by to chtěl skutečně vykonávat a nebo nějakej jakože už zaměstnanej junior medior, případně osvícení senioři. Ale jakože u seniorů eh vydá mnohem víc tu rezistenci, zejména u nějakejch jako doménovejch expertů, jak říkal jak říkal Jacek. No, já teďka jsem někdy před tejdnem, 14 dněma přednášel na ČVUT a příští měsíc budu přednášet na Matfizu. A to mě rovnou inspiruje k tomu, že tady zase na asi na závěr si zapláču nad naším akademickým školským systémem. Jo, já jsem třeba teďka se učil novou Codebase extrémně intenzivně. Použil jsem pluginy, jako je třeba Superpowers a instruoval jsem toho cloda, aby kromě toho, že bude řešit nějakou těžkou úlohu, tak aby mi ke každý tý kapitole napsal jako kapitolu, kde mě bude učit tu doménu a ty věci, jo? A pak jsem četl prostě ty markdownový filly. Bylo to nádherně tím AI vysvětlovaný. Všechny ty pojmy a prostě ty souvislosti a datovej model mi to krásně ukázal. Prostě úplně všechno s úplně nový byznysový domény, kterou vůbec neznám a strašně rychle jsem se učil. Jo. A ten způsob, jak instruovat to AI, aby mě učilo, by se měl učit na školách, jo? A todle je prostě obrovský pole působnosti. Tam je, jo, tam je obrovský množství jako detailů, který je u toho potřeba řešit. Určitě to nedělám ideálně. Dalo by se to určitě dělat i líp. Tole by někdo jako měl zkoumat a měl by prostě to propagovat vlastně do učení učitelů a do celýho toho systému, aby spíš dřív než později e vlastně ty lidi, který se stanou pak juniorama, o ktereých se tady teď bavíme, tak aby už byli vybavený těmahle skillama, že jo. Todle mi přijde tak strašně důležitý a tak strašně jako neřešený, že by se z toho jako měla stát priorita. No a třeba teďka vzhledem k tomu, že tam jako přicházejí nový lidi, je novej rektor ČVUT, že jo, kterj si pod sebe vzal lidi, který v týhle oblasti jsou aktivní, tak třeba je nějaká naděje, že se to jako začne zlepšovat. No uvidíme. >> Já mám nějakou interní zkušenost, kde já jsem nějakou dobu pracoval v Národním pedagogickým institutu a minimálně tam to docela intenzivně řeší nebo jako i řešili před už nějakou dobou a například Evene Časová dělá AI dětem. Ono to nemíří úplně na vibe coding takový ten jako o kterým se my bavíme, ale rozhodně to míří k tomu, aby děti uměly smysluplně používat nástroje, který jsou jim k dispozici. A možná by bylo hrozně zajímavý, jestli by vás diváci zajímalo někoho jako někoho, kdo nedělá AI coding, ale někoho, kdo se zabývá jak AI dostat dětem, mít tady jako hosta, tak nám to napište, protože jako minimálně by bylo nefér říct, že jako na různých místech se lidi nesnaží, tak protože jako viděl jsem, že snaží a viděl jsem, že to hodně řeší a už to je třeba jako dva roky dozadu, co se to jako řeší. Jo, jo. Není to černobílý. Určitě jsou takovýhle ostrůvky pozitivní deviace, ale zároveň když pak k nám do firmy choděj junioři a já se jich ptám, co jim v tomhle směru ve škole předali, tak 95 % lidí řekne, že nic. No, >> hele, já jsem jako známej tím, že už jako před čas AI jsem říkal, že jako rozporuju hodnotu univerzit pro většinu věcí v IT. Eh, já si myslím, že to stále má na některejch místech smysl. Ale třeba jedna z nich, kdy jsem říkal jako pokud chcete dělat AI, jděte na univerzitu, protože tam mají ty zdroje, tak teď už je lepší prostě jít někam, kde mají ty klustry, protože s tím, co se operuje teďkom jako v AI, tak se jako málokterá univerzita může měřit. Ale zároveň eh můj největší problém je jako ta zastaralost a jak složitý je to vlastně jako updatovat vzhledem k tomu, kolik lidí je v tom procesu zanesenejch. A když jsem, já nevím, 2015, ne 2016, tak jsem byl na univerzitě a tehdy byl jeden jedinej člověk, kterej nám řekl, ať používáme git. Ostatním jsme to odevzdávali v zipu >> a to prostě jako nemůže takhle fungovat. to jako a AI to jenom akceleruje. Takže za mě čím dál tím víc dává smysl jít fakt jako směrem, že to nebude jako o učení samotným na těch univerzitách nebo v těch jako programech klidně i soukromejch nebo i kurzech a tak dále, ale že to bude nějakej jako kurátor guidance a spíš jako průvodce, kterej s tím bude pomáhat, aby eh se použilo to AI jako správně a aby ten člověk měl spíš tu jako lidskou podporu, protože AI už teďkom podle mě umí učit líp než většina učitelů ve spoustě aspektech, ne ve všech, ale každej člověk je různej. A já si myslím jakože pro spoustu lidí ten lidskej kontakt je jako extrémně důležitej a nemáme prozkoumaný dlouhodobý dopady toho, jak by to vypadalo, kdybysme měli čistě AI driven školu, protože je to extrémně nový a zároveň jako chceme na někom skutečně experimentovat, že by byl jako 9t let na AI základce. H jako co to s ním může udělat, že jo. Takže ač jako moje duše by chtěla jako něco takovýho otestovat, tak vlastně nechci nikoho vystavit k tomu, že by že by si tímhle prošel, protože to může mít jako extrémní dopady na sociální život a všechno. >> No, já myslím, že to, že ta globální změna je nerealistická, to očekávat jakoby v nejbližších letech. Takže já tady spíš budu lobovat za intern čipy, jo, což je třeba to, co my děláme, snažíme se intenzivně nabírat interny a těm lidem jsme schopní opravdu hodně dát. A když toleto budou systematicky všechny firmy dělat a budou to dělat dobře, tak to do určitý míry bude suplementovat tu školu a půjde to rychle dopředu, si myslím, jo. Kdež to jako změnit celej školskej systém, je prostě jako obrovská výzva, že jo. Není to jako jednoduchý a ty rizika, který tady popisuješ v těch extrémních jakoby scénářích, jsou obrovský, že jo. Takže já bych takhle to viděl. Na tohle mi ještě přijde zajímavá Alpha School. Se to rozjíždí docela v Americe, kdy oni tam dělají nějakou jako docela chytrou kombinaci. A co je tam za mě zásadní, je, že součástí přímo toho vzdělávání je vystavování těch lidí reálnejm situacím, že třeba musí odprezentovat projekt, že musí něco vydiskutovat, vyjednat a tak dále. A to mi přijde tak jako extrémně podceněná věc bez ohledu na to, jestli tady máme nebo nemáme AI. Takže pokud někdy budeme mít jako hosta z týhle oblasti, tak bych se tomuhle rád pověnoval a tohle mě baví. Takže >> já bych možná řekl ještě pozitivní věc. Já mám takovou naopak pozitivní zkušenost úplně jako překvapivě. Já jsem jako 2013, to je to už je jako 13 let dozadu, tak jsem na pražským gympolu dělal na vlastním projektu, dělal jsem to v Gitu, bylo to psaný v JavaScriptu a bylo to součástí maturitní práce. A tehdy mně přišlo, že se tam jako používají zastaralý technologie, ale vlastně jako ze zpětnýho pohledu si říkám, že jsme byli jako brutálně progresivní škola, protože prostě tohle je fakt jako 13 let dozadu. >> Nakonec je to vždycky o lidech, že jo, v tomhle případě o tom profesorovi, že jo. Já jsem taky jako dělal maturitní práci na téma, jak opravit jako zprávy, který choděj z vesmíru a pomocí nějakejch jako násobení matic v podstatě, když to úplně zjednoduším, že jo. Jo, prostě něco ti přijde, ztratíš prostě 10, 20 % zprávy a dokážeš ji rekonstruovat, když něco na začátku a na konci uděláš. Extrémně zajímavá věc s přesahem jako do fyziky. Nadšený jsem byl a kdyby ten profesor tam nebyl a vlastně nevymyslel nebo mi nepomohl vymyslet tu úlohu a nevrl mě, tak by se to nikdy nestalo. Takže lidi, lidi, lidi, lidi. Jenže víš co, jak dostat takovýhle lidi jako do školskýho systému, když je postavenj, jak je postavenej, jo. A to platí pro celou státní správu. A to už se zas můžem bavit jako s Evou Pavlíkovou a dalšíma lidma o tom, že to taky jde, ale chce to čas. Možná to je taková poslední jako otázka na závěry pro diváky jako máme si sem takovýhle lidi zvát, protože jako za mě osobně by to přišlo hrozně zajímavý, ale jako spíš napište vy, co vás zajímá. >> Já bych to tímhle ukončil. E už všichni musíme pomalu letět. Všechno přidáme do materiálu. Určitě lajkujte, sdílejte, komentujte, co chcete, co nechcete, eh co vás nebavilo, co byste udělali jinak a když by vám chyběly nějaký odkazy nebo cokoliv, tak se určitě ozvěte. Za mě ahoj. >> A já bych dal ještě úplně poslední věc nebo PPS. Budeme party Greenhack Hackatonu a minimálně mě s Jirkou tam můžete potkat a dáme taky link do komentáře. Ahoj. >> Ahoj. >> Díky. Ahoj."
businesses\ai-ta-krajta\aiTaKrajtaEpisodes.json:180:        "transcript": "Ahoj, vítejte u 46. dílu ATA Kita. Děkujeme sponzorům DX Heroes, Promook a AI supervize a vítáme speciálního hosta Katku Fajmanovou, která sama bude natáčet. Ahoj, Katko. >> Ahoj všichni. >> Jestli chceš, můžeš nám o sobě říct pár slov. >> Tak já vás všechny zdravím. Pracuju v jednom AI startupu a vedle práce takovým hlavním tématem, který mě zajímá, jsou architektury modelů a především interpretabilita modelů. Takže tomu se věnuju hlavně ve svém volném čase a o tom bych tu asi chtěla mluvit. >> Vítej. >> Tak a pojďme na tradiční kolečko novinek. Kdo chce začít? Nestyďte se. Dneska toho je víc než dost. Tak já e možná bych začal tím, že unikly nějaký informace e z antropicu. Nějaký velmi zajímavý informace. Petře, máš k tomu víc? >> Antropic, respektive Claud Code, který slovy jejich tvůrců píše sám sebe ze 100 %, tak se rozhodl, že odhalí sám sebe ze 100 % a uploadnuli mapory na npmo, kompletní se vším všudy, takže máme plný zdrojáky cloud codu, což nám přineslo některý zajímavý věci, protože samozřejmě cloud code tím, že si ho nainstalujete, tak jste schopni z něj vytáhnout poměrně dost informací. Jenže Cloud Code samotnej je napsanej v a kompilovanej přes ban do single file executable binárky a oni tím pádem odstraňujou některý části, který jsou tajný přímo při runtimeu. Takže některý ty věci jsme dřív nebyli schopni vůbec odhalit, ale díky tomu, že unikly celý source mapy, tak víme, že mají třeba undercover móde, kterej není nikde zdokumentovanej, mají ho jenom zaměstnanci a ten o sobě má instrukce, že nemá nikde psat, že je cloud code, nemá psat, co používá za model. Má působit jako normální vývojář, kterej přispívá do open source repozitářů. Vyloženě takhle je to v instrukcích. Jsou tam nějaký líky na to, co nás dneska čeká na apríla. nějaký zvířátka a eh podobný blbosti, ale nejzajímavější asi byly názvy modelů, který nás čekaj, eh respektive pracovní. Je tam Kapibara, je tam už v procesu zmiňovali snad Sonet 48, což je o trošičku napřed oproti tomu, co víme. Takže tam se to tam se to podle mě jako toho ukázalo spousta. A zajímavej byl ten efekt, co nastal potom, protože samozřejmě my nemůžeme používat cloud code as it is, ale eh nemůžem ho nějak redistribuovat antropikus žhavý DMCA requesty. Nicméně komunita se toho chytla, vznikly eh forky, který okamžitě začaly přepisovat do jinýho jazyka. No a ono je to na debatu s právníkama, třeba to bude nějakej z dalších dílů, ale v principu eh se dá říct, že jedna jako řekněme z teorií je, že když napíšete proti tomu repozitáři, kterj unikl neprávem testy a potom napíšete novou implementaci, která už nebude znat původní zdrojáky, tak se dá říct, že to jako obchází copyright, protože v tu chvíli už jako neopisujete odčeho, co nemáte licenčně jako přístup řešit, čehož se komunita chytla a vznikl Python i Rust přepis se vším všudy, kde už procházejí všechny testy a vyletělo to úplně neskutečným způsobem. Některý repozitáře mají asi 50 000 stars na GitHubu, což je za mě docela hustý. Uvidíme, jak to dopadne. Uvidíme, co všechno se bude Antropic pokoušet sundat. Já bych viděl hlavní přínos v tom, že všechny ostatní harnessy mají teď příležitost se poučit od toho, co cloud code dělá dobře. A ať už se cloud code kopie nechají sundat nebo ne, tak ty lekce z té sdílené Kše pro subagenty a tak jsou pořád teďka přístupné open codu a a pidenti a tak podobně. Takže [frknutí] myslím, že se trošku sníží ten náskok, který Cad měl v Harnessu. Přestože vím, Petře, že se mnou nesouhlasíš v tom, jestli měl náskok i v tom modelu. >> Já si nemyslím, že má náskok ani v tom harnessu, protože jako Cloda musím vždycky vodit za ručičku jak malý děcko. Kodexu řeknu plz plzdu a on to udělá, což je otázka, jestli je to síla harnessu nebo toho modelu. No, ono se to jako stírá, což mě přivádí na jinou myšlenku. Neřekli jsme si to mezi novinkama, tak vás možná trošku odzbrojím, ale ty harnessy můžou bejt docela velká věc, e, protože teďkom vyšla optimalizace od Langsmith a Forge Code, který oba eh navýšili skóre v terminal benchi a to legitimním způsobem. Nebyl to žádnej případ jak OB1 a eh rozdíl je klidně 20 % v harnessu cloud codu a dostali se na nějakejch myslím Forge Code se dostal na 81,8 % s GPT 54 i s opusem 46 a řešili tam jiný problémy. Takže v tuhle chvíli je harness za mě ještě jako velká věc. Otázka, jak dlouho to vydrží. Podle mě >> mně to mimochodem připadá jako hrozně zajímavá věc, že já si pamatuju, jak nám s Jirkou všichni říkali, že pokud nebudete mít jako svůj vlastní model, tak vlastně jako to, jak to, co je udělané nad tím, to je v podstatě jenom jako něco nezajímavýho. A vždyť se jako začíná dít, že skoro zajímavější věci se dějou nad těma modelama, ne jako uvnitř těch modelů. Myslím, že zajímavé věci se teď děljí dějí docela všude a já tady navážu tu další zajímavostí, která je ještě trošku mimo AI svět, což je supply chain attack na Light LM a Axios. A ve světě Pythonu je ve světě JavaScriptu nebo Typescriptu. s tím, že sice to není přímo AI věc, ale Axios je častá dependence mezi balíčky, které se používají během wipe codingu a Lightem je explicitní dependence DSPI, což je optimalizační software pro prompty a optional dependency open claw. >> [frknutí] >> A a jedná se o jako ošklivé zero day exploityy, které sice byly objeveny během několika hodin, ale i během těch několika hodin dokáží napáchat docela dobrou škodu. Nechám slovo dalším. Teďka mám potom kdyžtak eh ještě to, jak to teďka řeším osobně a ve firmě, ale jsem zvědavý na vaše reakce. >> Já bych tam jako řekl, že Axios je zásadní pro AI. Proč ho tady rozebíráme je, že ta knihovna je tak extrémně populární, že je velice pravděpodobný, že vám to spousta coding agents dá do projektu a můžete spustit projekt a najednou mít problém, protože se to spouští jako post install, takže tam na to jako velkej pozor. Teď už je to zažehnaný, to nebezpečí, pokud jste v tom inkriminovaným období nedělali něco s tím projektem, aby se vám to nenainstalovalo. že doporučuju si zrotovat klíče, pokud jste eh nad tím pracovali, podívat se do kryptopeněženek, protože pokud vím, tak to eh targetovalo i je a dávat si na to pozor. A teď co dělat proti tomu, tak existuje několik věcí. První je, dá se nastavit minimálně v PNPM, nevím, jak je to v ostatních balíčkovacích systémech, eh, minimální stáří projektu, který se vám nainstaluje. Minimální stáří tý verze. Jedna věc. Eh, druhá věc, tak můžete používat eh NPQ. dáme odkaz do komentářů nebo do popisku videa, kterj taky dělá nějakej audit při instalaci Dependencies. A pak jsou ještě nástroje typu Ikikido nebo Socket Def nebo Snick, který vám skanují vaše dependence. Takže je docela dost aktivních způsobů obrany a tohle se prostě bude dít a dělo se to i předtím. Není to žádná novinka, není to vlivem AI. Jediný, co se jako děje vlivem AI, že tyhle knihovny a tyhle dopady mají dopad na mnohem víc lidí. Jedno doporučení, pokud jako používáte krypto, tak to mějte v trezoru, ne na počítači, kde prostě těch jako těch jako vektorů zranitelnosti je tolik, že jako nevíte, že teďka to bylo npmo, ale příště to bude něco jinýho. >> Já ještě doplním, že teda kromě PNPN a podobný exclude minimal age funguje i v jarnu, npm, UV i banu. A v npm se dá nastavit i to e defaultní vypnutí post installu, který používal ten Axios, což je další bezpečnostní prvek. >> Tak já možná tu mám novinku z jiného soudku, jestli už jsme teda uzavřeli tohle téma. A to je tenhle paper. Ten vyšel zhruba skoro před dvěma týdny. Je to paper nové verzi modelu VJPA a vlastně předchozí verze toho modelu skvěle chápala, co se děje na videu, ale měla problém s tím, kde přesně. A ta nová verze vlastně tohle nějakým způsobem opraví, což znamená, že roboti teď dochází eh líp chytat předměty a je to pořád stejná architektura, jenom lepší trénink. A o tom, co vlastně ta JPA je a co je na ní zajímavýho, tak o tom ještě dneska pak bych chtěla mluvit dál. >> Super, děkujem. E, já přidám svoji novinku, že 26. března, to znamená před týdnem zhruba vyšel Arc AGI 3, novj benchmark, na kterým nejlepší modely získaly asi 0,47% úspěšnosti. Takže zase jsme v situaci, kdy v porovnání s člověkem se ukazuje, že stále existují oblasti, kde lidem stačí poměrně málo na to, aby vyřešili nějakej problém. Zatímco jazykový modely prostě potřebujou brutální compute na to, aby byly aspoň trochu úspěšný v tom, tak dáme do popisku pod video nějaký detaily k tomu. Ještě někdo neměl novinku. >> Já ještě mám jako poslední novinku. Mně přišlo zajímavý, že se začíná propouštět. Opět se začíná propouštět. Tentokrát Oracle a u nás v Čechách pojišťovana Direct a určitě ještě další, ale tyhlety dvě teďka jako proběhly médii a neumím úplně rozlišit, jestli je to jenom nějakej teďka jako hype, který se z nějakýho důvodu chytl a nebo jestli je to jako nějaká první vlaštovka něčeho reálnýho. Co je jako zajímavý, že těm firmám se daří, že to není tak, že by to bylo propouštění, proto, že potřebujou redukovat stavy, ale že je to opravdu propouštění, kdy říkaj, že nám se daří, ale dokážeme spoustu pozic nahradit pomocí AI. A na rozdíl od toho předroku bych tomu i teďka věřil, >> ne? Tak to já ti to budu rovnou rozporovat z fleku, protože je to něco podobnýho jako když seš na Titanicu a prostě budeš říkat, že je všechno v pohodě. Ale když se podíváš na nějaký hlubší analýzy, tak to, co se děje, tak v případě Oraclu, tak oni jsou úplně v akciema. Oni díky tomu, co oznámili Deals Open AI, tak jejich akcie vyletěly minulej rok na nějakejch 340 dolarů a teď jsou myslím na 146, když jsem koukal před kitou. Takže je to 200 dolarů propad na akcií, jo. A oni potřebujou z něčeho zafinancovat ty data centra. A teď se na to jako podívejte. Oni mají deal s Open AI, který jim přislíbilo dat 60 miliard dolarů ročně po dobu pěti let, takže celkem 300 miliard dolarů. Oracle musí postavit data centra a ty datacentra plánuje zaplatit penězma od společnosti, která vydělala 15 miliard dolarů. Takže Open AI jim slíbilo, že jim bude dávat čtyřnásobek toho, co vydělali, aby to Oracle postavil. Zároveň eh je to jako podobný u Direktu, když tam jako nevidím do toho tolik. V případě Direktu nemá jako úplně uzavřenou eh nemá veřejnou uzávěrku a tak, pokud jsem koukal správně, ale v principu jako samozřejmě, že budu tvrdit, že se mi daří a že je to optimalizace, ale firmy extrémně přerostly během covidu. Extrémně. Jako stačí se podívat na statistiky. Doteďka se ty firmy nevrátily do normy. Je potřeba to jako zeštihlovat. Je potřeba to ořezávat. Navíc na papíře pro investory to vypadá strašně dobře. Nasazujeme AI, vyhazujeme lidi kvůli AI, ne? Vyhazuje se kvůli tomu, že potřebujou platit AI nebo potřebujou zaplatit tu investici, protože zákazníci to jako neberou tak moc, jak se to, jak se to počítalo. Však jsme to řešili minule s Lukášem Cahou, eh, chat base, jo, nasadíte to, vlastně vám to jenom tratí prachy. Takže ta rojka je pro většinu firem vlastně ještě jako tak negativní, že si to musej začít vybírat. >> Jakože já s tebou vlastně jako i souhlasím. Ono je to tak, že já sám jako nevím. Mně mně připadá, že když se tohleto tvrdilo před rokem, tak to bylo jako jednoznačný bullshit, protože prostě jako před rokem jsme tam ještě nebyli, ale jako dneska zase jako těžko říct, jsou jako takový zprávy, který mně nedávají moc smysl. Třeba jako to s tím nahrazováním kobolu, co si myslím, že jako není real, ale přesně jakoby já do toho zas tolik nevidím a je pravda, že jako motivace zakrýt jiný problémy tím, že budu říkat, že propouštím kůli já, je vlastně jako strašně cool, ale jako nevím, ne. Nevím jakože takhle já já kdybych byl investor, tak bych byl velmi podařilej, tak bych se na to stavil jako ty, Petře. Kdybych byl člověk, který pracuje v direktu nebo prostě v nějaký takovýhle firmě jako programátor a měl bych hypotéku na dalších 25 let, tak začínám bejt fakt nervózní. >> Jasně. Ale je otázka, jestli být nervózní kvůli tomu, že se na nás valí vlna AI nebo být nervózní kvůli tomu, že makroekonomické ukazatele eh v souvislosti s válkou Iránu půjdou do háje a eh Hopa půjde do stovek dolarů za kalón a tak. Jako máme spoustu důvodů být nervózní. >> Já bych jako mimo AI mimo AI rozhodně nakoupil zásobu potravin nějakejch trvanlivejch. To už se dostáváme trošku dál. >> Já mám jako jinej lifehack a vím, že spousta z vás už ho jako naplnila, ale jsme v Česku, jsme v Evropě. Pořiďte si dítě, oni vás nevyhoděj. Jděte prostě na odí. Tak jo. A tím jsme my s ním shrnuli novinky. Pořejďte si dítě. Slyšeli jste to tady poprvé? >> Nevím, jestli to je úplně ta správná motivace mít mít děti, ale ok. Pojďme pojďme teda rozebrat podrobnějc některý z těch témat a nebo případně jestli chcete nějaký další úplně jiný téma rozebrat. Pojďme do toho. >> Tak já se těším na ten paper. >> Mně to taky připadá jako hodně zajímavý, protože o jako videomodolech se tady nebo olech to dokážou rozpoznávat z videa, něco jako se moc nebavíme a právě proto to zkus nějak víc uvíst nebo jakoby říct, že jako co byl ten problém a v čem je to teďka jiný. >> Je to vlastně nějakou dobu, co jsem narazila na tenhle LinkedIn Post. Tenkrát vydali paperl JPA, což je Vision Language model. na kterým je zajímavý, jo, že že on predikuje vlastně abstraktní reprezentace toho, co text znamená. A tak jsem si řekla i v souvislosti s tím článkem, který jsem tady na začátku zmiňovala, e, že bych to mohla stručně vysvětlit, v čem jsou ty e JPA modely jiný a v čem jsou zajímavý. Je to vlastně celá rodina modelů a tak vám je ukážu vlastně od obrázku až po roboty. Vlastně teda klasický LLMka, ty fungujou tak, e, že predikují další token. Ale když chcete dělat to samý s obrázky a videem, tedy predikovat další jednotlivý pixely, tak je to velmi složitý. No a tady právě přicházejí ty JPA modely, který říkají nepredikuj ty pixely a predikuj význam. a patří vlastně do rodiny takzvaných self supervise modelů, což znamená, že při tom tréninku nepotřebujou označený data. Jak vlastně ty modely se učí, když jim nikdo ty obrázky neoznačí a neřekne, co jakj obrázek znamená, tak je to vlastně taková doplňovačka. Eh, při tréninku se část obrázku schová a část obrázku se modelu ukáže a model vlastně musí poznat, co ta schovaná část tady, což je tady ta červená, jo, a ta, co vidí, je ta modrá. Tak co vlastně na tý schovaný části je a když takových obrázků prostě vidí miliony, tak z toho pochopí, jak ten vizuální svět funguje. A ta JPA je speciální v tom, že ona nepredikuje teda pixely, ale predikuje abstraktní popis, jo, toho například obrázku v reprezentačním prostoru, jak tomu říkají v těch paperech. A co vlastně je ten reprezentační prostor? To se tady teď pokusím naznačit. Tady už jsem to teda naznačila, jo, na tom obrázku. Tady nějaký vektor, jo? A teď se to pokusím nějak naznačit vizuálně. Já jsem vzala hromadu obrázků z různých kategorií z toho známýho internet datasetu a poslala jsem to do EJPA nebo IJPA se to asi čte, ať si s tím poradí. No a ta IJP to teda vzala a já jsem vizualizovala, co ona predikuje. Takže jo, teď se to znova pustilo, ale prostě ona vlastně si jeden ten bod v tom gifu jeden obrázek a ona vlastně to roztřídí sama v tom reprezentačním prostoru. To, co vidíte, je vlastně ten reprezentační prostor. Takhle jsem se ho pokusila vizualizovat. A tady je teda ještě třeba zmínit, že ta JPA to nejsou generativní modely. predikujou význam, ale nevygenerujou vám obrázek ani text. Teď jsme to viděli u obrázku, jak se je roztřídí podle kategorií, ale u videa je to zajímavější, protože tam ten eh prostor není jen o tom, jak věci vypadají, ale i o tom, co se v tom prostoru děje. Tady jsem si vzala zase různý videa ze something to something datau a vlevo vidíte různý činnosti, jo, a vpravo vidíte zase ten eh reprezentační prostor a vlastně je tam zase vizualizovaný, kde se ty jednotlivý činnosti v tom prostoru nacházej, že to jsou vlastně oddělený klastry. A tohle byl VJP paper a ten teda ukázal, e, že jsou tyhle modely dobrý na klasikaci videí. A po tomhle paperu přišel další VJPA verze 2. Chtěli predikovat vlastně, co se stane přímo v tom prostoru, co se vlastně dalšího stane a i třeba plánovat činnosti. No a s tím modelem jsem si chtěla trošku pohrát a podívat se, co umí. No a kde jinde si pohrát s takovým modelem, než eh v dětský herničce. Takže jsem vzala model na hřiště. Hustí se mi to tady. Jo, takže to jsem o tom tady natočila takový video. Vzala jsem si tam pro jistotu ten článek, abych věděla, s čím si vlastně hraju. Tady zase já to pauznu. Hrála jsem si s kostičkama, natáčela jsem a vidíte, že ten model vlastně predikuje, co dělám. Pak jsem zkoušela různý činnosti dělat. Tady jsem třeba předstírala, že z konvičky nalejvám vodu do vaničky. No, tak tady už taky predikuje to tu činnost. Já vlastně jsem tímhle způsobem vytvořila takový menší dataset 100 různých činností, takže já vám pak dám nějakj odkaz na repo, kde si s tím hraju, kdybyste si s tím chtěli někdo hrát taky. No, tady jsem zkoušela tohle, pak jsem tomu ukázala prázdnou krabici. No a celou dobu, co jsem si s tím hrála, jsem vlastně přemýšlela, jak to vlastně bude vypadat, kdy vlastně si ty roboti začnou hrát s těma mýma dětma, až pomocí tady těchhle modelů budou schopný pozorovat, co se děje. No a jestli teda jo, tady zase jsem ukazovala, že něco je uvnitř něčeho. To jsou takový ty dětský pistolky na střílení. Tady jsem zkoušela, on ten model totiž vlastně umí poznat nejenom eh jaká činnost se děje, ale že i člověk tu činnost jenom předstírá, jo, a pozná to docela rychle. Takže tady jsem dala míček do krabičky, jo, takže tady predikuje, dává míček do krabičky. Tady jsem to jenom předstírala, jo, tady někde to už poznal, že jenom předstírám. No, to byla zábava. Přemýšlela jsem, to je vlastně budoucnost tý hry. a jestli časem teda děti budou ovládat ty roboty a hrát si s nima, no jak je to vlastně blízko. No teď teda ten článek, o kterým jsem mluvila, ta nová verze 2.1, co vyšel někdy před dvěma týdny, tak ta už vlastně ty reprezentace pryje tak přesně, že ten robot už to dokáže velmi přesně použít k uchopení předmětů. Oni to tam ukazujou na nějakejch benchmarkech, Grab benchmark. Teď jsem se vysá, jak se jak se jmenuje. A vlastně vlastně se to dá použít k plánování činností pro roboty. Třeba říct jim, dej ten hrneček támhle na tu poličku a ten model si vezme reprezentaci hrnečku tady na stole, reprezentaci hrnečku vlastně na tý poličce a naplánuje vlastně postup v tom reprezentačním prostoru, jak se k tomu dostat. Takže teď jsme se vlastně tímhle povídáním jsme se přesunuli. Já to ukážu ty články, protože si zasloužej pozornost. Takže tady si vlastně můžete kdyžt přečíst i ten abstrakth, jestli to tam teda uvidíte vždycky. No, přesunuli jsme se tady od článku, kde se vlastně naučili modely rozumět obrázkům, tak odtamtaď jsme se přesunuli k těm prvním vlastně videím eh a klasifikaci videí, pak těm VJPA vlastně druhý verzi, kde už jako řeší tu vlastně vidí ten model, vidí ten záměr, nejen ten nejen ten pohyb. Ještě jsem zmiňovala na začátku ten post, tak to byl tady tenhle článek, kde vlastně e ten model rozumí videu a dokáže o něm mluvit. A nejnovější byl tady ten článek, eh ten poslední model, který vlastně už ty reprezentace predikuje velice přesně. Tak jsem zvědavá, jak to půjde dál a kdy se to začne pořádně používat v praxi. To je všechno, co jsem teď chtěla říct. Co se asi musíme omluvit našim posluchačům, co jedou jen na Spotify. Tohle bude díl spíš na YouTube. E, Katko, máš nějakou představu o tom? E, nebo zeptám se nejdřív, když jsi říkala, že si s ním hraješ klidně na hřišti, to znamená, že ten model jede i na nějakém edge zařízení, >> ne? To vlastně já jsem tady tohle, já jsem si natočila ty videa a až potom jsem to jako expot, jsem si to doma jako predikovala. No to bych to bych potřeboval určitě GPU na tohlecto. Jo, to by >> to jsem pů udělat, ale já mám vlastně v plánu to udělat, ale jako to bude složitější. No >> a jak silnou mašinu máš doma, abys s tímhle experimentovala? >> No, já mám 470, to uvidím. Kdyžtak jako já dám tam vlastně kdyby někdo chtěl poslat půl request, já dám to repo, kde si s tím hraju, kdyžtak někam do komentářů. No >> paráda. Určitě dejme do popisku komentářů pod video na na to repove. A zároveň bych chtěl ještě udělat takový oslý můstek k projektu, který jsme tady společně s ATou, Kajou a s Katkou a dalšíma lidma naplánovali a to je Hackaton Factory, což je popis k tomuhle dáme taky pod video. Je to seriál nějakých hekatonů, který e jejichž cílem je propojit průmysl, kterej řeší nějaký problémy. A nejenom nemusí to být výrobní firmy, ale můžou to být jakýkoliv typy firem s vývojáři, kteří mají zájem e se pokusit ty problémy vyřešit aspoň v podobě nějakýho MVP, který se dá udržovat. Takže pokud by někdo měl zájem o spolupráci v rámci téhleté tohodle toho projektu Hecaton Factory, tak se nám klidně ozvěte a my rádi vám pomůžeme vymyslet Hekaton přímo na míru, který může pomoct vyřešit to, co potřebujete. >> Máme skupinu na LinkedInu, takže Heckaton Factory, kdyžtak si to najděte vlastně přes naše profily, že jo, to tam bude. >> Přesně tak. Tak jo, to je jedna eh taková novinka malá, kterou jsme zapomněli říct na začátku, tak ji dodáváme teďka. Co dalšího bychom chtěli probrat dneska? >> Já bych se ještě držel toho modelu. Mě mně vlastně přílo jako spoustu >> jako konsekvencí a spoustu jako věcí, který kde se to jako dá využít, kde se to dá zneužít. >> Já bych rozhodně chtěl vidět ty využití. Myslím si, že docela dobrý využití by to mohlo mít i v rámci obyčejnýho eh používání počítače a toho, co děláš jako na svý obrazovce třeba. To mně přijde jako docela cool věc. Vlastně bych byl rád, kdyby nějaký AIO dokázalo dlouhodobě pozorovat, co dělám a na základě toho mi navrhovalo nějaký automatizace a nějaký jako zkratky. Katko, můžeš mluvit trošku o tom předstírání a o tom, jak to detekovalo to předstírání a jak myslíš, že to předstírání a jeho detekce byla natrénovaná čistě z toho selfision. To mi přijde jako trošku magie. >> No jo. V tom ten something to something data se tam jako já myslím, že tam snad ježíš, teď abych nekecala, jo, ale třeba 200 000 krátkejch videí a různý kategorie a je to jsou to teda různý jakože akce s rukama prostě, no. podobný těm, co jsem ukazovala, jo. No a prostě z toho se to nějak naučilo, no. [smích] Ale detailnější analýzu jakoby, jak rychle toto předstírání pozná, to to jsem nedělala, ale vlastně by se to určitě dalo dohledat v těch čeláncích. >> Je to specificky dotrénovaný na e na nějaký jako person view pohled nebo eh dá se to použít jako na na celou kategorii jako vymání jakéhokoliv obrazu? Jo, teď nevím teda přesně, jak to myslíš tu otázku, >> že mě tam rovnou napadla taková věc, že jakoby, jak jsi ty říkala na dětským hřišti, mě, já nevím z jakýho důvodu mě napadly drony, který budou automaticky umět jako vybírat cíle. Já si na >> No [smích] vlastně by se to dalo asi natrénovat na jakýkoliv pohyb prostě ve fyzickým prostě prostoru, kde se potřebuje vlastně nějak víc chápat jako smysl toho prostoru, smysl těch akcí. To může být pohyb, pohyb čehokoliv, no, >> že právě já se vždycky u takovýchhle věcí, ne, že ani bojím, to není správný slovo. Já si vždycky říkám, že jestli primární využití je spíš to jako geekovský, nebo jestli je nějaký jako dobrý komerční využití nebo třeba jako v autonomním řízení a vždycky jako dojdu, že hm, že tady jako na tom bude mít strašně velkej zájem armáda, že tohleto je úplně jako top využití na jako třeba nějaký automatický navádění nebo obecně manipulaci s prostorem a porozumění prostoru, protože to je jako hrozně těžkej problém. obzvlášť jako právěže porozumění prostoru. Ano, to je právě jako to, v čem se ty modely odlišujou. No, >> mě tam rovnou napadá využití, se kterým jsem se potkal v rámci Checkinvestu, kdy tam byl jako startup, kterej se eh zabývá detekcí kolizí v továrnách, kdy je potřeba tohle řešit jako extrémně rychle. Tam je otázka, jak ty Jepa modely budou efektivní, ale oni v podstatě potřebují do 100 msund detekovat, že vysokozdvižnej vozík přejede člověka nebo že padá náklad nebo něco podobnýho. A zároveň tam potřebují typicky eh více zdrojovej více zdrojů obrazu, protože z některýho úhlu nemusím vidět, že nastává problém. Takže za mě bych chtěl vidět, jestli se tímhle směrem ta d bude taky ubírat, mít nějakou jako real time jepu, která to bude schopná vyhodnocovat z kamery a pak to bude docela creepy v rukou Číny, armády a tak. To samozřejmě jako ne, že ne, ale zároveň jestli to bude umět pracovat s více vstupnýma zdrojema, aby to posoudilo tu jednu situaci. >> Co si tak jako pamatuju z toho článku, tak nevím teď přesně na tu detekci, ale na to plánování činností. Vím, že ten model byl 16rát rychlejší. Tam psali, když nějaký ten teď běžný model, co se používá na jehožénu, si teď ale teda bohužel nevzpomenu. No a co se týče těch dat, co je potřeba, vlastně taky jich potřebuji míň, oni jsou ty modely natrénovaný na normálních jakože datasetech jako prostě z internetu a tím, že jako chápou ten prostor, tak pak nepotřebujou zas tolik dát na to, aby se to naučili na nějakou jinou specifickou činnost. No a na jiný specifický prostředí. Mně se úplně v hlavě jako eh rýsují věci typu psychopass anime, nevím, jestli ho někdo znáte, kde se jako predikuje to, že se bude jako konat nějakej zločin a zastavují se ti lidi a ještě předtím, než ten zločin udělají, tak si úplně jako říkám, že že vlastně přesně k tomuhle Jepa kind of může víst, že to jako natrénuju na situace prostě z loupéží a podobnejch věcí a budu predikovat, že se má stát zločin, že má bejt loupežný přepadení nebo něco. něco podobnýho a tohle je ten jako dobrej způsob využití. Ale otázka je, k čemu to může dospět. >> Jako mně to nepřijde jako dobrej způsob využití. Mě jako někoho usvědčit jako na základě toho, že splňuje nějakou charakteristiku, je fakt zvláštní. >> Já to neberu jako, že ho usvědčíš. Tam jde o to, o třeba nějakou jako predikci, na základě který můžeš, můžeš e tomu zabránit dřív, než to jako nastane. Neříkám, že budeme prostě dávat lidi na elektrický křesla, protože Jepa řekla, ale dovedu si představit validní i nevalidní casy. Tak >> no. Já bych se tady tole už nesíáme. >> Traž jako bál, protože jako vezmi si jako jaká bude pak realita? realita bude taková, že prostě eh se to nasadí jako všude možně a teď tam bude jako spoustu false positive jako flagů, protože prostě u každýho detekčního systému jsou nějaký false positive a nějaký false negative. A teďka jakoby jaká je míra jako lidí, který musíme jako jenom podezřívat z toho, že chtějí něco udělat, aby to bylo fakt špatný. Já si jako osobně myslím, že je mnohem lepší jako spíš někoho nechytit, než jako chytit někoho, kdo nebo jako byť ho jenom třeba jako vyslýchat, když jako nic nechce udělat. To mně přijde jako výrazně horší. Obecně tyhlety programy už eovaly, byly podrobené nějakým nějaké judikatuře. Obecně se naše soudní systémy nestaví moc pozitivně k tomu, abychom nějak postihovali občany, kteří ještě nic neudělali, ale mohli by. Čáě proto, že spousta těch dat, na kterých se trénuje, ať už Jepa nebo ty jiné prediktivní algoritmy, které jsou pravděpodobně spíš go fine, good old fashioned AI a jsou plné biasu vůči lidem, k na které si policie zase dává nejčastěji. Takže obecně bych k tomudle taky byl spíš opatrný, ale uvidíme. Já rozhodně jako neříkám, že se na to těším nebo že to budu prosazovat. Spíš jsem říkal jako, že si dovedu představit, že to bude legitimní, ale pokud vím, tak to stejně AI postihuje tohle. >> Skoro určitě bych doufal, že jo. >> Tohle podle mě bude v tý nejrizikovější kategorii. Stejně jako stejně jako tam bude nějaký monitorování zaměstnanců, jestli třeba nekradou na pokladně, tak přesně k tomuhle bych Jeepu taky použil, ale nemůžu v EU, pokud bych měl problém. Myslím, že dobře, že nemůžeš, protože já ti jako řeknu konkrétní příklad, kde si jako myslím, že to bude to to bylo ještě s GPT 3,5. My jsme jako dělali nějakej jako software pro školy a eh když jako ještě jako v completion modelu, jako ve starým completion modelu, ty dáš větu, eh, Petr Glaser, eh, Petr Glaser má nějaký problém s, nevím, se sčítání zlomku, bla bla bla bla bla bla. A když tam dáš takovouhle větu, tak on začne doplňovat nějaký poměrně rozumný didaktický zdůvodnění toho. Zatímco když tam dáš Anna Horvátová, tak to tam psalo jako devětkrát častějš jako různý psychiatrický a psychologický diagnózy. A teďka jako pokud u tý pokladny bude sedět někdo, kdo je jako Rom nebo Vietnamec nebo černoch, tak jako tak to zcela jistě bude mít bajes a jako a s tím nic neuděláš. A teďka jakoby a to je jako silver reinforcing, protože jako jasně, tyhlety lidi budou víc flegovaný. Tím, že budou víc flegovaný, tím se víc dostanou do jako vazby nebo nějaký předběžnýho zadržení, tím jako jim to ta společnost víc assignuje. Je to podle mě strašně problematický a já si jako myslím, že jako budu mnohem radši, když se sem tam něco v obchodě ukradne, než když se jako jeden člověk ofleguje jako špatně. >> Jo, já jenom ať to uvedu na pravou míru. Hraju tady roli ďáblova advokáta. nebudu si dávat kamery úplně všude, nebudu vás flegovat a podobný věci. Ono ostatně se něco podobnýho dělo i přes před jako masivním nasazením LLMek a tak a dalších systémů, kdy myslím v Holandsku, tak to nepřiznávalo, co to bylo, hypotéky nebo něco takovýho, tam byly ve vyhodnocování eh nebo příspěvky na školy. Eh dáme to kdyžtak do zdrojů, až to dohledám. Ale je v tom rozhodně spousta biasu a chtěl jsem tak trošku vyždímat z vás všechny ty možný casy, kdy se to může podělat a jsem rád, že to tady zaznělo. >> No, ten baas z modelech, to je opravdu hodně velký téma a taky jako je na to spousta výzkumů. K tomu bych klidně si připravila i něco napříště delšího, no, protože to je ten důvod, proč právě si myslím, že interpretabilita modelů je velice důležitý téma vědecký. No, >> já jsem viděl takovou jako hrozně zajímavou věc, která souvisí právě s videomodely a to tu, že to dokážu jako vzít jeden videostream a vyrobit to jiný video stream, kdy zachová určitý prvky a nahradí jiný. Eh, například eh zachová eh výraz tváře, ale jako změní všechny na biolochy nebo zachová výraz tváře, ale udělá nějakou jako věc. A teďka jako takováhle věc se poměrně dobře dá dělat v textu, ale s tím jako videem mně to přijde zajímavý, že vlastně jako člověk se jako může hrát i s tím, jaká do toho jako reálně ta informace jde, ale jako zase jako vždycky se něco zachová a jako z něčeho ten b jako může vyplynout jako a vždycky jako úplně nutně, jakmile je nějakej systém, kterej něco flaguje, tak vždycky bude mít nějaký jako false flagy jako není není to možný udělat bez toho jako obzvlášť na velkém vzorku. >> Jasně. A tam potom ta přijatelná false positive a false negative rat je nutná. Jako myslím si, že pokud říkáš, že není přijatelný ani jeden false positive, tak prostě tenhleten systém nelze nasadit. >> Ono jakoby ale když už se u toho tohle, když člověk řekne, tak začnou lidi argumentovat, no jo, ale tak lidi taky mají, že jo, prostě false positive rate, false negative rate, když něco hodně hodnotěj sami, že jo. Tak a teďko věřit víc. Jak to mám pojit v tom, že jako když máš člověka, tak to můžeš na někoho hodit a ve spoustě případů to skončí tím, že to hodíš na stát v Amerika a prostě se to jako někde zahrabe pod koberec. Ale když bys jako chtěla jít hodně do důsledku, tak se dá z toho vyvodit nějaká zodpovědnost, ale u těch modelů je to výrazně náročnější, stejně jako je to u samoříditelnejch aut, že prostě když způsobí nehodu, tak jako za kým to půjde a tady ten systém se podle mě bude muset ještě hodně právně prozkoumat, jaký tam budou ty jako finální dopady. Já si jako myslím, že je tam jako velký rozdíl, že jako lidi mají bias, to jako to je pravda, ale problém je v tom, že u těch modelů ten BES je jako mnohem víc amplifikovanej, že jakmile eh, že jako každý člověk má nějakej bes, někdo jako je trochu víc rasista, někdo trochu míň, někdo jako se pohlíží na nějakou věc divní, někdo nějakou jinou a mnohem víc se jako rozmělní ten jako ten jako systematickej problém. Zatímco jakmile tady bude jeden silnej model, kterej se nasadí do všech kamer ve městě, tak to může mnohem jako mnohem jako zvýraznit nějakej jeden konkrétní BS. A v tom si myslím, že je to mnohem problematičtější. >> No rozhodně, ale jsme si vědomí tohohle bajasu. Jsme schopni editovat videa. Proč najednou nevznikne syntetickej dataset kradnoucích bylochů? >> To je rozhodně area, do které by se mělo někdo pustit. No počkej, ale jakoby dokážeš potom jako udělat, dokážeš to pak vyvážet ve správným poměru? Nedostane to potom jako bajes jenom opačně, že víš, že >> aby to dopadlo jak Gemini modely, jo? No, že to bude generovat černý vy. >> Ona jedna možnost, že jo, je ten bajas se snažit tímhle způsobem na úrovni tréninku nějak jakože zmírnit. A pak právě, že druhá možnost, kam se ten výzkum taky ubírá, je vlastně vlízt do toho modelu a jakoby uvnitř toho modelu to nějakým způsobem jako eh jakože zmírňovat. Třeba tím, že nějaký ty attention heads, který prostě zrovna způsobou tenhle vaja, se zahoděj, že jo, nebo prostě eh, že se udělá steering nějakejch features, který, který to způsobujou jako no jakože tohle je prostě taky ten směr, no. Ale stejně jako člověk ten bias musí jako najít, jako je to složitý, no. A dokážeme v tuhle chvíli najít v těch velkých jazykových modelech a obecně obrovských modelech ty konkrétní attention heads, které tenhle problém mají. Jako je v tom ten aktivní výzkum úspěšný? >> Tak tady to se přiznám, že jako nevím, viděla jsem to u jakože menších modelů než těch jako obrovských. No >> jako já si pamatuju Golden Gate Cloud, který nějak extrahoval ten signál mluvení o Golden Gate Bridge v San Francisku, což je docela konkrétní věc. A potom pomocí toho e byl docela zajímavý experiment, kde nutili Cloda tím, že amplifikovali tydlety attention heads a aby mluvil o Golden Gate Bridgei, když se ho lidé ptají na něco úplně jiného. [frknutí] Ale mám pocit, že diskriminace je docela komplexnější věc než Golden Gate Bridge. Tak >> jako je, no, ale ten výzkum jde rychle kupředu, no. Tak tak uvidíme. Já tomu věřím tomuříme [smích] se palce. Tak jo, u tohodle bychom tedy mohli skončit. >> Já myslím, že jsme to završili hezky komplexní debatou a určitě budeme rádi za komentáře, budeme rádi za to, jak se vám líbil tenhle díl s praktickejma ukázkama. E, na Spotify si to kdyžtak pusťte s videem. Video tam bude uploadnutý. E, jenom prostě se to bude hůř poslouchat na motorce. >> Přesně tak. Tak [frknutí] jo, já myslím, že pro dnešek máme všechno a těšíme se na vás zase příští týden. >> Mějte se krásně. >> Děkujem. >> Ahoj. Ahoj. am"
businesses\ai-ta-krajta\aiTaKrajtaEpisodes.json:247:        "title": "AI ta Krajta #40 | Dark Software Factory: autonomní továrny na kód",
businesses\ai-ta-krajta\aiTaKrajtaEpisodes.json:252:        "transcript": "Vítám vás u 40. dílu IT City. My moc děkujeme DX Heroes za to, že nás podporují a rovnou začneme novinkami. Kdo z vás má něco tenhle týden? >> Mě popravdě zaujalo, že Peter Steinberger, tvůrce Open Claw, e teďka doplňuje tým Open AI, přidává se k nim. Otázka je, co to všechno bude znamenat. A jak říká na svým blogu, tak chce vytvořit agenta, kterého by mohla používat jeho máma. Tak to je velmi zajímavý směr vývoje. Podle mě >> mně tam přijde zajímavý to, jak to vlastně Antropic strašně dodrbal, protože místo toho, aby využil ten potenciál cloud bota, tak prostě poslal Cas and Desist a potom se o Petera přetahovala meta a open AI, což je za mě jako zajímavý, protože jsem vlastně rád, že skončil v Open AI a ne v Metě, protože meta mi nepřijde, že je teďkom jako relevantní hráč na poli AI a že by to stejně jako nějak dodrbala. eh, Open Clouy nevznikl bez kodexu. On to vlastně jako otevřeně říká, že je to spíš jako slopus než opus. >> Mhm. >> Jo, >> já mám takový podezření, jestli to celá není taková marketingová akce. Prostě eh přijde mi to jako poměrně pěkná shoda náhod, ale whatever. Prostě takhle to je a myslím, že se blížíme do nějakýho nového období, kdy prostě agenti, AI asistenti nebo jakkoliv tomu chceme říkat, budou dostupní a velmi snadno vytvořitelní, bez nějaký znalosti hlubší toho, co je na pozemí. >> To rozhodně bude jako marketingová věc. Já jsem se teďk na konferenci bavil s lidma, že jako je poměrně netriviální množství lidí, kteří jsou zaměstnáváni čistě proto, že jejich brand spojovanej s brandem tý firmy je mnohem jako výnosnější než tomu člověku platit milion dolarů ročně. Krásnou ukázkou je třeba centric, který zaměstnává jako spoustu lidí. >> Mně na tom přijde vtipný, že vlastně Open Claw dělá některý věci trochu líp než prombook, některý věci trochu hůř než promook. Akorát u prom booku není tak moc zatím vidět a slyšet. >> Já si myslím, že to bude podobný jako z Devin AI, že vlastně rok předtím, než vůbec jako přišel ten pojem pipecing, tak tady jako byla ohromná mánie okolo věci, která se jmenovala Devin, AI programátor, kterej vám udělá cokoliv. A to jako strašně vyšumělo. Respektive on ten produkt stále existuje, ale jako ten reálnej hype pak potom vzal jako cloud kod nebo open AI Codex. A to je vlastně jako i moje novinka, že, nebo novinka, taková jako věc, kterou teďka jako poslední dva týdny jedeme, že jako za únor minimálně v podstatě já jsem nenapsal téměř ani jeden řádek kódu, že jako víceméně jako všechno moje programování se zvrhlo v to, že jako že píšu product requests a ty mě pak jako v dlouhých chnůrách implementuje buď codex nebo cloud code. A poslední týden je to primárně Kodex GPT3, kterej je strašně dobrej. Eh, jakože zase bych řekl, že tam přišlo k nějakýmu skoku, jak jsem to říkal s tím, e, Gemini 3 Flash, že to byl nějakej jako podle mě vnímanej skok. Teďka si zase myslím, že je to nějakej vnímanej skok a jako dostáváme se do stavu, kdy v podstatě programování nebo jako práce vývojáře je úplně jiná, než byla před rokem, ale jako úplně totálně jiná, než byla. Jo, já bych týhle souvislosti nepoužíval slovo zvrhlo, že se to zvrhlo. Mně přijde, že to je přirozený vývoj a že to je vlastně dobře. A jenom se chci zeptat, jak soudíš rozdíl mezi antropickýma modelama 46 a versus GPT 53, jestli tam vidíš nějaký jako velký rozdíly. Já už jsem to říkal v tom díle, jak jsem jako dlou mluvil o tom, jak jak vyvíjíme. To je asi dva díly dozadu, ale jako co já hodně vnímám a jako pocitově mě připadá, nemám to teda jako úplně rigorózně změřený, tak je to, že cloud kod je opravdu dobrej, pokud člověk vykopává nějakej novej projekt a vlastně se tolik nezajímá o programování. E, spíš prostě jako chce vyrobit něco a z nějakýho důvodu nechce použít Mael nebo Lavable. Zatímco na údržbu už existujícího projektu, tak je podle mě lepší cloud code. >> Hele, to mně třeba přijde, že cloud code má jasný využití nebo ať oddělím model od CLI. CLI teďkom neřeším, ale opus 46, tak je za mě stále lepší na vizuální věci. Tam prostě ten výstup je jako mnohem kvalitnější a dostat něco zajímavýho z kodexu, tak je těžký, ale taky se to dá. Já jsem teďkom právě dělal s kodexem konečně frontend k tý mojí apce na řekněme production ready výstupy. K tomu se dostanem. A když jsem mu dal jasný zadání, že chcu Neo brutalist design, tak ten výstup byl vlastně docela OK. Bylo potřeba doladit věci, protože to tam strašně rád docpe rámečky a furt to jako vypadá AI, ale už se na to jako dá docela koukat. Nicméně opus je na tohle jako lepší hnedka na první dobrou. E a když mu přidáme, když mu přidáme frontend design skill od Antropicu, tak je to jako ultimátně lepší. Takže za mě jako tohle použití plus bych jako neřekl, že opus je lepší na udržování existující codebase. Jako dělal jsem x různých testů a opus prostě není jako production ready výstup. Musím ho strašně drtit na tom, aby testy nebyly blbost, eh, aby dodržoval existující věci. Musím mu nastavit spoustu MCPček a vlastně jako spoustu to kolem, kdež to kodex jako model je lepší by default. Jako já jenom takovou poznámku, že Pavol vlastně řekl dvakrát opus a asi chtěl říct kodex v tom v tom případě a teďka nejsem si jistej, jestli to myslel na údržbu stávající aplikace nebo vývoj nový. >> Přemýšlím, jestli jsem to nepamatoval nebo ne. Nepamatuju si, ale e myslím Open AI versus Antropic. Eh Antropic je jednoznačně lepší na dělání hezčích UI. Open AI je jednoznačně nejlepší na dělání jako heavy backendu. Teda když mám nějakou jako velmi jako složitou logiku jako nějakej jako tříc struktur něčeho, co mezi sebou komunikuje a ten frontend je jenom nějaká tenká krusta, řekněme. >> A tím pádem Open AI je lepší na údržbu už stávajícího kódu. >> No a a ano a to jsem možná vlastně jako řekl trochu špatně, že ono asi záleží, co ten stávající kód je. Pokud je to nějaká jako UI heavy aplikace jako typu prostě děláme tady třeba Streamyard, na kterým to teďka děláme, tak tam asi věci od Antropicu budou lepší, protože je tam jako spoustu tlačítek, spoustu jako různýho designu, spoustu jako X prvků. To, co děláme my, je pro Wbook a to jsou jako primárně agenti, u kterých je důležitý, aby fungovali dobře uvnitř. A to jako jak jsou zobrazený, jasně, je to jako důležitý, je tam jako nějaký UX důležitý, ale to většinou není to, co rozhoduje, jestli si to ten klient koupí nebo ne. Důležitý je to, jestli se to správně vyhledá dokument, jestli to jako správně udělá nějakou jako sebereflexe a tak. A na to nám funguje mnohem líp open AI. A pak je tady podle mě jako druhá věc, jako druhá metrika, která mě vlastně teďka v poslední době fakt hodně zaujala, to jak dlouho ta věc dokáže běžet bez toho, aby do ní kdokoliv zasáhl. A tohleto bych řekl, že se jako strašně prodlužuje. A konkrétně v tom našem případě to Open AI umí dělat jako mnohem líp. V tom našem případě to je tak, že Open AI umí jako jet ve šňůře prostě celou noc a jako naimplementovat nám jako spoustu věcí s tím, že jako velmi prediktivně se nad tím dá pracovat. Zatímco Clot od Antropicu, ten dělá jako to, že on možná i ten kód dělá lepší, jakože možná jako ta jeho celková kvalita kódu je lepší a on jako jednak velmi často eh zasáhne i jinam, než má. To znamená, že se ty věci jako blbě dělí na komity. A druhá věc je, že se častějč dostává do stavu, kdy potřebuje zásah člověka. To znamená, že pokud člověk pracuje hs on, jakoby sedím u toho a potřebuju rychle tady upravit nějakej soubor, vidím to jako na horním horním okně na dolním, jako upravuju v editoru, tak tam nevím. To vlastně jako proto tu moji zkušenost neříkám. Ta moje zkušenost je taková, že nám to běží prostě jako 8, 10, 15 hodin v kuse a po těch 15 hodinách potřebuju přijít k výsledku, který je takový, že ok, těhletěch jako 10 udělanejch věcí je udělanejch dobře a tahleta jako jedna, která je prostě někde hluboko v tý komitetový historii, tak tu revertuju a jdu dělat znovu a tak, aby ta moje režie byla jako absolutně minimální. To je vlastně jako ta metrika, kterou tam jako teďka primárně dávám, >> ne? Mně tam přijde jako, že je to, že je to vlastně jako mnohem víc multidimenzionální a já bych třeba Streamyard neoznačil za frontend heavy. To je prostě jenom jakože UI k tomu, aby streamy běžely hezky. Ale UI heavy, tak bych označil třeba Figmu a podobný věci. Ta je jako hodně UI heavy. Plus teda má samozřejmě jako obrovskou náročnost na úrovni nějakýho syn engineu a podobnejch věcí, takže tam si dovedu představit, že bych kombinoval oba modely. Ale co mi přijde jako takový krásnej příklad, tak my máme teďkom larpovej tábor. Děláme ho vždycky o prázdninách, trvá to dva týdny a jsou tam nějaký jako stromy, schopností, který si můžeš brát po sobě. A ono to v principu je docela jako jednoduchý, ale my ty stromy aktuálně máme prostě nakreslený ve figě exportovaný jako obrázek. Ono by si člověk řekl, že je to vlastně docela jednoduchý. Jo, i na to pochopení, když si tady třeba zobrazím legendu, tak ta vazba je tam vlastně docela jednoduchá. mám nějakou výchozí schopnost od zdola nahoru a mám tam nějakou cenu za to, že si vezmu tu další schopnost a mám tam nějaký vazby buď a nebo a případně tam mám nějakej požadavek, že musím mít jinou schopnost než jenom eh tady tu klasickou vazbu, ze který na to můžu jít. A ono je to vlastně docela triviální pro člověka, ale pro AI, tak jednak je potřeba, aby pochopilo ty vazby mezitím. To je první věc. A druhá násobně složitější, se kterou se perou i ty nejlepší modely, je, když řeknu, hele, já z toho chci editor, abych takovýhle stromy mohl tvořit a zároveň, aby ten editor nebyl jenom čistě vizuálně, ale aby se to perzistovalo do něčeho, co pak můžu vzít a říct, tady máte ty stromy ve statický podobě, ale zároveň máte klasickej levlící systém, kdy si hráči můžou ty schopnosti zaklikat, protože my aktuálně řešíme case na tom táboře, že je tam, já nevím, třeba 60 dětí a ty expy přidělujeme dynamick během toho dne v rámci tý hry a občas se prostě najde někdo, kdo si přidá jeden exp, dva a ono se to za těch 14 dní naskládá a my bysme chtěli mít přehled o tom, kdo má kolik expů, jestli někdo nějak výrazně neutíká a případně se s ním pobavit o tom, e, jak moc, eh, ty expy získává, jakým způsobem co dělá a tak dál. Takže já dělám teďkom apku, která tohle řeší a musel jsem vlastně restartovat celej přístup. Nejdřív jsem potřeboval jít na tu definici samotnejch těch vazeb a vynutit to striktně na typový úrovni, protože když to tam bylo jenom popsaný a fakt jako precizně popsaný, tak stejně to failovalo. Takže jsme se vrátili k tý datový struktuře a pak jsme šli až dál. Jako ano, je asi pravda, že jak jsem jako říkal, tak zrovna Streamyard má jako poměrně dobře obě ty složky, ale vlastně jako stále mě to připadá tak a to jako je možná jako otázka na vás dva, že myslím si, že jako AI začíná být fakt dobrý eh v dobře popsanejch jako složitejch nějakejch jako strukturách typu prostě jako mám tady spoustu objektů, který komunikujou mezi sebou. v čem jako stále AI není jako úplně jako ideální a to v nějakým jako UX pohledu na tu celou věc, že jako jeden web nebo jeden eshop to udělá jako dobře, ale vlastně nějaký jako globální přemýšlení nad UX celý tý aplikace tak často často nedává tak dobře, jak dává tu architekturu. Teda jinak řečeno, e, myslím si, že jako programátoři mají jistým způsobem větší problém, než mají Uxáci, že ta potřeba toho mít někoho, kdo jako programuje, tak má větší potenciál zmizet rychleji, než toho člověka, kterej se na to dokáže dívat z pohledu uživatele a tý jako použitelnosti. Jo, já myslím, že to je, já to vidím tak, že vlastně ta, ta róla se posouvá od toho programátora, který jenom naplňuje nějaký requirementy k někomu, kdo dokáže jako produktově přemýšlet nad tou aplikací a jenom AIU zadává requirementy, který to AIO prostě implementuje. Vlastně mám pocit, že tenhleten shift je strašně důležitej a bude hrát stále větší roli. Mimochodem k té fig, já nevím teďka, jestli používáte kurzor, ale třeba jsem si všiml, že teďka tam po updatu přistál nějaký jako plugin, nějaká možnost pluginů nových. Můžete ho propojit s Figmou zrovna. H já vlastně popravdě nevím, jak moc je Figma důležitá v tomhletom celým procesu, že jako přijde mi, nevím, nevím, nejsem úplně frontendá čistej, takže na tohle si netroufám úplně zhodnotit, ale přijde mi, že e v tom kódování jsou tyhlety user interfaces trošku v ohrožení. Hele, na tohle mám docela jako h výrazný názor, ale ono to má vždycky svojí odpověď. To záleží. Za mě Figma dává stále míň a míň smysl, protože je mnohem lepší a rychlejší si udělat interaktivní prototyp jako Vipe codingem. A já nemusím to hnedka jako dostávat do produkce, ale můžu prostě jako designér přijít s tím, hele, tady mám demo a hotovo. Já jsem teďkom zrovna zákazníkovi konzultoval, že říkali, no, jak máme dělat tady ty jako eh řekněme déma těch interaktivních věcí, když máme chatbota a potřebujem otestovat, že to uživateli udělá úplnou blbost. To prostě ve Figmě nenaprotypuju a nějž snažil jako sebevíc, tak jsem mu řekl jakože ať se vykašle na Figmu, že tady nedává smysl. Prostě ať udělá nějaký demo z AISD, hodí tam blbej model a hnedka uvidí, jak uživatelé reagujou. >> Jo. Jo, s tímhle souhlasím. A kde máš nějakej use case, kde Figma je ještě stále důležitá? Hele ten use case mám třeba v tom, že my teď děláme design systém a já jsem prvně jako šel tím směrem, že figmu vůbec nepotřebujem, ale narazili jsme na to, že pokud si nedáme fakt hodně záležet a nepustíme do tý tvorby toho design systému už jako grafika na začátku, tak jsme došli k tomu, že třeba máme jako čtyři různý varianty form inputu, protože máme, já nevím, range input a tak a podobný. A tam je to jako docela těžký zajistit správně. Plus tam stále ještě platí, že design systém není jenom vizuál webu, ale jsou to i prezentace, jsou to i nějaký brandový materiál, socky a podobný věci. A já ze svý technický pozice se snažím sám sebe jako svůj brand bleeding deh dostat do toho, že jsem teďkom vzal prezentace od Lukáše Chylíka, kterj to má dělaný čistě v CSSu a udělal jsem si z toho monorepo, vytáhl jsem z toho nějaký shart věci, že teďkom si tvořím svoje vlastní jako brandový monorepo, kde budu mít svoje presky, svůj osobní web, e, a budu i generovat, řekněme, posty na sodky po tý vizuální stránce v CCSK vtm protože je to za mě lepší, ale tady už se dostáváme do fáze, kdy to rozhodně není pro eh firmu, kde nemám všechny lidi aspoň jako capable of coding a musel bych zároveň investovat netriviální množství času jako firma do toho, aby ty brandový asety tomu vlastně odpovídaly, protože když to udělám tímhle směrem, tak já si to pohlídám, ale pohlídá si to sekretářka ve firmě, která má 10 000 lidí, že jí to tam prostě nezměnilo fond? No, asi ne. Takže myslím si, že design systémy mají stále svou obrovskou hodnotu ve figě, byť se ta hodnota jako čím dál tím víc přesouvá ve prospěch toho def přístupu. A jedna z mých jako variací, kam se budeme ubírat, je, že eh přibyde samozřejmě jako vývojářů, ale takovejch těch, kteří nikdy jako neprogramovali a budou to jako vibe kodeři, e a budou mít prostě jenom správný nástroj k dispozici a půjdou, budou s tím schopni dělat prezentace, budou s tím schopni dělat knowledge work a všechno možný. Je to jeden ze směrů, kterej si myslím, že se budou zkoušet firmy jako prosadit. Já si myslím, že j tam zmínil jednu jako úplně brutálně jako důležitou věc do budoucna, že vlastně jako dneska maj jako firmy design systémy právě proto, aby jako i jako ten zaměstnanec na pobočce v nějaký jiný zemi jako věděl, jakou barvu má dát na nadpis prezentací. prostě aby jako aby ta firma komunikovala nějakým jednotným jazykem, aby vlastně se tam držel ten jako brand tý celý firmy. A myslím si, že tady to celý se dá jako zobecnit, že vlastně jako každá firma nebo každá jako entita, každá nějaká subjektivita, ať už člověk nebo firma a asi v budoucnu nějakej agent, tak má nějaký jako věci, který jsou arbitrárně zvolený, že jako nejsou dobře nebo správně. Prostě Streamyard má v logu kachničku. Jako není to o nic lepší, než kdyby tam měl labuť nebo krechličku, ale aj ta krajta má v logu eh hada. Eh kdyby tam měla kozu, asi by to fungovalo stejně, ale prostě jako je tam velmi velká škála arbitrálních věcí, kterou si každá firma volí. A teďka tohleto se hodně uplatňuje v designu v tuhletu chvíli, ale ono jako ono tohleto bývá jako v dalších věcech typu jakým stylem píšeme na sociální sítě, jak se vyjadřujeme, e jak komunikujeme, jakým jakým pravidlem jako deplujeme kód. Jsme jako víc nastranutý jako security nebo víc nastranutý inovace. A takovejhle věcí je strašně moc jako tady ten jako celej komplex toho kontextu, tak je něco, co vlastně jako tvoří hodnotu tý firmy. A jedna z věcí, co si myslím, že jako v tuhletu chvíli vůbec není a v čem je úplně brutální jako komerční potenciál, co vlastně jako s promookem do nějaký míry děláme, je to, že jak tenhleten kontext vlastně přenýst do těch generickejch AI nástrojů, že já můžu psát posty na Facebook pomocí chatu GPT a spoustu lidí to dělá. Problém je, že to zní jako od chatu GPT. Já bych potřeboval psát posty na Facebook nebo LinkedIn, tak aby to vlastně jako napsalo dobrej post a mně to ušetřilo práci. Zároveň to dodržovalo pravidla tý jako daný oný sítě a komunikace, aby prostě na Facebooku bylo něco jiný než na LinkedInu tř. Ale zároveň já potřebuju, aby se mě do toho vnesly všechny ty moje kontexty, všechny ty mje pravidla, nějaký jako můj slovní styl, to jako to, jak se vyjadřuju, co dělám, jaký jsou moje myšlenky. A tohleto je něco, co kde ta customizace v tuhletu chvíli v těch AI nástrojích podle mě je strašně slabá a jako tam my právě jako jako hodně pracujeme na tom, aby byla jako o level lepší primárně pro pro firmy. >> Já si myslím, že vlastně narážíme jako na podobnej problém, ale přicházíme k tomu z opačný strany, protože jak říkáš, je to jako o tom kontextu a ten kontext je strašně moc věcí. Je to jako vizuál, je to komunikační styl, je to styl i odpovědí třeba supportu a podobný věci. A ten kontext se tam musí jako přenýst a je to vlastně jako ohromnej mol. A já jsem teďkom nedávno četl článek, kde se právě řešilo, že firmy jako investují ohromný množství do toho, aby se posunuli v AI a pomáhá jim to se spoustu věcí, jo, jakože nebudeme debatovat o tom, jestli AI má nebo nemá přínos. Prostě má. pokud ho používáte správně, čímž neříkám, že jako to nemůže dopadnout špatně, ale co si firmy jako neuvědomujou, je, že tím zrychlením těch výstupů a tím, co chrle, tak může udělat nějakou jako longterm brand damage a jsou firmy, který to prostě ustojej. Jsou firmy, kterým to v důsledku jako neuškodí, protože si na tom hodně jako stavěj brand, že jo, Tomáš Chuper, AI reklama, Vipe chodí do produkce a podobný věci. A jako ano, přiznávám, že prostě občas si říkám, ty vole, Čuper zase něco vipekodil na rohlíku, protože tam jako věci jsou čím dál tím rozbitější. Ale je to vlastně jako z pohledu tý firmy tak fatální riziko nebo ne? Pro někoho ano, pro spoustu firem si myslím, že ne. >> Já si, já jako myslím si, že jako my tady jako jak tady všichni tři sedíme, tak jsme jako hodně nahnutý k tý straně AI a já co jako třeba s Vidím u Rohlíku a jako zrovna u rohlíku jsem to zaznamenal z několika stran, protože já bydlím na jako úplně okraji Prahy a tady se rohlík objednává každej. Jako AI experiment je rohlíku tady s nebudu říkat to slovo jako většinu lidí. Já jsem jedinej, kterýmu to přijde jako zajímavý. E, myslím si, že jako dlouhodobě do budoucna je to tak, že jako 90% lidí vůbec nebude zajímat AI. 90 % lidí bude zajímat to, že si třeba dokážou objednat tím, že zavolaj na nějaký telefonní číslo a popíšou, že si chtěj objednat to, co minule, akorát o akorát dvakrát víc rohlíků například a ono jim to jako udělá. Ty lidi tam nevidí jako primárně, že to je AI, ale jako přinese jim to nějaký benefit, který by jim normálně přinesl i ten operátor na tý telefonní lince. Akorát prostě jako operátor na telefonní lince by se pro takovýhle účel nezaplatil. Mě právě proto trochu připadá, že jako vizuální AI nebo AI, která generuje nějaký jako obrazy, zvuky, videa, něco takovýho, tak má v tomhlom jako smyslu určitou nevýhodu, protože jako lidi na to začínají být hrozně alergiční. Zatímco ta textová AI, to je často jako mnohem skrytější. To jako já dokážu něco na vibe codovat a jako jasně tady na Feě Kry ti to řeknu, ukážu, jak to dělám, ale jako eh klientům to neříkám. Jako klientům neříkám to, že jsem tu funkci jako vyrobil eh jenom tím, že jsem něco někam zadal a ono se to naprogramovalo samo, protože jako jednoho klienta by to potěšilo a jako těch devět by to totálně zděsilo. >> Teď jsi to právě řekl. Jo, jenomže aj ITU KU poslouchá jenom nějaký jako výsek lidí jakoby. Myslím si, že kdokoliv z vás, kdo posloucháu Kitu, tak je jako strašně scute na tu stranu je super, změní to svět, jsme jako nadšený. Myslím si, že jako drtivá většina lidí to takhle nevnímá. Drtivá většina lidí to má tak, že ježišmarja, tady je spoustu AI slopů jako kde už to zmizí. A já si právě vůbec nemyslím, že to zmizí. Já si spíš myslím, že se to přesune jako někam na pozadí. Tak, že jako, že to lidi přestanou vnímat jako AI, možná trochu podobně jako počítače, že jako dneska člověk neříká jako jdu do práce a tam budu eh mít otevřenj počítač a zadávat do něj nějaký příkazy. Takhle to lidi vůbec nevnímají. Lidi prostě jako pracujou a úplně přirozená součást práce je to, že odpovídám na emaily. Ale jako není důležitý to, že to běží na eh procesoru s takovým výkonem a na eh na obrazovce s takovým jasem. Stejně tak jako v budoucnu nebude důležitý, že jako, že já odpovídám emaily přes Gemini 48 Flash Pro. Podle mě vůbec nikoho nebude zajímat. >> Jo, já myslím, že jsi narazil na něco důležitýho. To podle mě spočívá v tom, že ty věci fungujou na pozadí a dělají nějakou užitečnou věc, že ten form factor chatbot nebo něco takovýho není až tak úplně důležitej. On byl důležitej možná před dvěma lety nebo na začátku, když celý to všechno začalo, ale myslím, že stále víc je vidět, že to není jako to, o co tady jde úplně. >> Ono v důsledku je to prostě jenom další technologie a to, jestli se to dostane do mainstreamu mezi úplně všechny běžný lidi nebo budou hledat čistě tu hodnotu, kterou jim to přináší, tak stále jsme ještě podle mě v tý jako explorativní fázi. A on to krásně ukázal i ten open clop. Dostalo se to mezi hromadu hromadu lidí, což přineslo zároveň to, že vznikly firmy, který dělají oneclick setup. Až ty Pet záměrně říká, že to nechtěl jako oneclick setup, ať si lidi pročtou tu dokumentaci, protože pak dochází k tomu, že byl třeba scan, kdy bylo snad 900 000 open claw instancí otevřenejch siclíčem venku a tak dále. A i jako já si vlastně jako skrytě doufám, že spousta tady těch jako slop friendly indie hacker projektů dostane strašně přes držku, protože to, co dělaj, je za mě jako extrémně sprostý vůči lidem. Ale jako podle mě se to nestane jenom v to jako skrytě douf. >> Já jako vidím jako podle mě je to strašně jako silný power of defaults nebo jak se jako říká. mě, já jsem si hrozně vzpomněl na PHP, jak se dělaly weby před 20 lety, kdy typický způsob, jak se uchovávalo heslo, bylo buď jako PLX a nebo MD5. Ne, ne proto, že by to nešlo dělat líp. Jako už v tý době to šlo dělat líp. Všichni věděli, že to je nebo všichni všichni, co se tím zabývali, věděli, že to je průšvih. Jenomže tím, že to byla ta defaultní možnost, tak prostě tak to byla ta defaultní možnost. A myslím si, že úplně to samý s AI jakoby my jsme eh my jsme ještě tak před jako půl rokem jako měli s Jirkou takovej koncept, že jako eh, že my těm klientům dáme nástroj a ty svý agenty si budou moct psát v jakýmsi jako meta jazyce jménem Book. A byli jsme do toho hrozně nadšený a mysleli jsme, že jo, to je úplně super, že jako eh, že je to mnohem jednodušší na používání než nějaká system message, takže jako to všichni budou používat. Teďka jako zjišťujeme, že jako to lidi vůbec nezajímá. Lidi chtějí mít AI, kterým buď někdo setupuje a nebo se to naučí samo bez toho, aby o tom oni museli přemýšlet. A je strašně důležitý, jak se tam ty jako defaultní mechanismy nastaví, protože jako defaultní mechanismus reálně bude používat e jako absolutně drtěvá většina uživatelů. Ten nedefaultní mechanismus to bude používat ta úplně drobňoučká menšina, která jako se nad tím nějak zamýšlí. My teďka třeba řešíme nějaký šifrování a bezpečnost a tam jako třeba jako víme, že prostě pokud tam tohleto nedáme by default nějakým dobrým způsobem, tak si to prakticky nikdo nezapne. >> Petře, ty jsi ještě nezmínil svoji novinku nebo zmínil už? Já >> nezmínil. Zmínil. >> Pojď to. E, tak to rovnou ukážu, protože eh, já jsem včera, včera myslím vyšlo Gemini 31 Pro a samozřejmě Google to okamžitě zhoral, protože se mi povedlo vygenerovat jeden web. Od tý doby a zkouším to celej den, tak se mi nepovedlo vygenerovat nic dalšího, protože AI Studio si prostě řeklo, že sice mi z apíčka chodí ty respony, že to něco generuje, když jsem si otevřel Death Tools, ale furt mi to hlásí Untitled project. A je to úplně empty. A jeden jedno to generování mi běží 15 000 vteřin bez toho, abych měl jeden jedinej výstup pro ten projekt. Ale u jednoho se mi povedlo to jako vytvořit. A musím říct, že když jsme se bavili o tý síle toho vizuálu u opusu, tak Gemini podle mě má jako hodně velkej náskok teďkom, protože z poměrně jednoduchýho promptu, tak chtěl jsem jenom takovj jako experiment, že udělám Neo Brutalist Design, landing page pro moji Agentic Engineering platformu. Dostanem se k tomu později. Teď se podíváme na ten jako design samotnej, ale já jsem udělal něco takovýho a musel jsem tam poladit samozřejmě nějaký kontrasty, protože to nezvládlo jako úplně dokonale, ale ten Neobrutalist design je tam za mě jako úplně brutálně reflektovanej. Ta stránka je nejenom jako hezká, ale vlastně i funkční a vytvořilo to docela jako zajímavej styl. A já jsem tam pak dodělal jakože view pro řekněme vývojáře versus view pro běžný uživatele, že pro vývojáře jsem tam dal jako stop generating trash a to už jsou jako nějaký menší úpravy, co se týče kopy, ale co se týče toho, že mi to dalo takovejhle design, tak až na drobnost s vyladěním kontrastu, tak to udělalo takovejhle web. A zároveň ten web je jako docela funkčně responzivní. Teďkom jsem tam dělal nějakej update, takže mi uskočilo tlačítko, ale jinak to jako je poskládaný dobře, funguje to a jsem zvědavej, až bude 31 pro fungovat nějak stabilně jinde a budu si ho moct vyzkoušet, protože teďkom všichni hlásí, že to padá, ale za mě ten výstup jako z toho jsem si sedl na takže Neo Brutalist Design je něco jako docela netriviálního. Známej je tím třeba Postw, že něco podobnýho dělá, ale udělat to funkční v dark módu je ještě těžší. Mhm. To je super. My jsme vlastně chtěli dneska probrat téma, který, který jsme tak trošku nakousli tím, že AI agenti vytváří kód. Teďka Pavol mluvil o bezpečnosti, šifrování a a jako nějakej security. A teďka eh vlastně bych to chtěl trošku navázat. Production ready aplikace. Jaký kritéria musí splňovat, abyste byli ochotní ji vypustit do světa, když víte, že se na její vývoj podílel AI? Já potřebuju znát kontext. Je to production ready apka, která je pro osobní použití, nebo je to něco pro interní firemní nasazení, který nikdy nepůjde ven. A nebo je to public facing apka. A teď otázka je jako public facing, kterým směrem? Je to jako, že tam budou prostě stovky tisíce uživatelů, nebo je to public facing osobní webs formuláře? Takže tam se to jako docela dost liší, co má být pro tu jako production ready kvalitu. Takže na začátek bych řekl, to záleží. >> Já mám takovej takový jako bych to otočil trošku, že existuje něco, co byste AI vývojáři zatím nesvěřili? Je něco fakt jako těžkýho, s čím u čeho byste se báli? >> Ale tak obecně jako věci typu healthc, jako kardiostimulátory a podobný věci, tam jako úplně naveboval jsem ti fix na to, že ti to vyplo srdce. H ne, díky. >> Jasný. To to já bych to jako já bych to ještě jako posunul o jako já bych to rozdělil na dvě stage. Eh podle mě jako stage 1 je vyvíjím jako vibe codingem běžnou apku, která prostě by se dala vyvinout i normálně jako bez AI prostě třeba z web nebo nějakou platformu, která AI nemá v sobě uvnitř. A tam si myslím, že prostě jako ty kritéria mají být jako velmi podobný tomu, co už jsme měli. jakoby my jsme tady měli jako milion věcí, jak dobře dělat jako quality assurance a myslím si, že jediná věc dneska je ta, že se tady to stává mnohem mnohem mnohem, mnohem mnohem důležitější jako věci, jako jsou testy, dobrý komitování do gitu, eh nějaký jako linting, eh integrační testy, prostě všechny tyhlety věci okolo toho kódu jsou strašně důležitý a je potřeba, aby automatizovaně uměly tomu agentovi ty věci věci házet na hlavu a říct mu, ne, jako opravdu mě tady nebudeš jako psát magic numbers, hezky si to pojmenuj, ne, opravdu mi tady nebudeš dělat soubor, kterej má 1000 řádků. Hezky se to refakturuje, ale pak je tady druhej level a to aplikace, který jako v sobě nějak to AI jako maj, ať už třeba jako dělají sami o sobě nějakej vibe coding, ať už je to nějaký jako zapojení jazykovýho modelu a myslím si, že jako ultimátně, ať už je to nějakej jako žijící agent, kterej jako někde něco dělá a má nějakou odpovědnost. A my jsme na tohleto právě teďka narazili. Já jsem byl teďka přes týden na vibe coding hackatonu, kde vlastně většina lidí nebyla programátorům a dělala tam nějaký programování. A tak já jsem si řekl, že já to obrátím. Já jako programátor tam jsem ještě jako s někým udělal úplně jako nezávislou věc a udělali jsme AI advokáta a tam si právě říkám, že jestli jako tam nezacházíme už někam, kam by to AI nemělo jít. On teda říkal a vlastně mně to říkalo teďka za posledních dní několik lidí, že je to fakt dobrý, ale vlastně přesně nechce se mě to zatím nějak vypouštět. Nevím jako popravdě co s tím dělat, ale jako zjevně to dělá lepší odpovědi, než dělá chat GP. A vlastně to je možná otázka je na diváky, jestli jako někdo z vás se zabývá právem, advokací nebo něčím takovým. Co si o tom myslí? Co by si myslel o AI, který radí s právem? >> Vlastně to je obecnější otázka, kterou jsme možná chtěli dneska ještě probrat. Eh, a to je, že v tuhle chvíli máme wipecing v programování a jak dlouho potrvá, než se něco podobnýho prosadí i v dalších oborech, jako jsou jako je advokacie, právo, účetnictví, daňový poradenství, nevím, doplňte si sami. Přijde mi, že tady je stále ještě velká mezera v tom, že lidi mají obavy o tu spolehlivost a o to, aby výstupem toho nebyl bullshit. Jo, ale za mě jako bych se k tomuhle tématu vrátil, protože jsem ještě jako nezareagoval na Pavla. To přidání AI je podle mě zase další dimenzionalita, která se do toho promítá, ale zároveň to podle mě nehraje až takovou roli, jakože samozřejmě do toho, jestli nechám AI promptovat to, aby to dělalo další jako aby to byly prompty v apce, to je samozřejmě jiná věc. Tam jako stále ty výsledky jsou pochybný, protože to, co je v datasetu, je docela jako bída na tu kvalitu těch promptů, takže tam s tím souhlasím, že to jako asi není úplně ideální, ale k tomu, co podle mě má být řekněme součástí většiny aplikací, kdy se budeme bavit o řekněme webový appy celý úrovni a nepůjdeme do zdravotnictví a podobnejch fakt jako nebezpečnejch věcí, kde by to jako mohlo napáchat mnohem větší škody, než to, že mi jako nefunguje web. Tak eh tam když jako znova nasdílím ten eh můj web, co jsem jako udělal z Gemina, tak já za sebe z pozice vývojáře beru jako klíčový to, že tam mám nastavený nějaký lintování, formátování a teď to neberu kvůli tomu, že bych chtěl AI nutit podřádkovávat, ale kvůli tomu, že v Linteru se dají nastavit fakt moc pěkný věci a fakt jako tvrdě tam zakázat ty třeba jako magický eh konstanty a podobný věci. To je první část. Ale další věc, kterou opomí spousta spousta projektů, který jsou i reálně v produkci ještě z doby před A, tak je právě nějaká obzervabilita, jo? Potkal jsem spoustu projektů, kde obzervabilita byla ve stylu, no tak si otevřu obdobu Vercel logo a koukám se do jako konzol logo, co mi to vypsalo, ale není tam nic jako, co by to propojilo. Takže za mě tam přidat nějaký jako observabilitu, takže open telemetry, nějakou instrumentaci, která eh mi pomůže pochopit ten problém. Tím spíš, když tu apku tvořím z AI, protože pokud ji vyvíjím a mám to hluboký porozumění tý apky, tak na tom asi tolik nezáleží, nebo záleží na tom výrazně míň, ale když jsem ten kód nikdy neviděl, tak porozumět tomu, když nastane nějaká chyba a když se dostanu do fáze, že se AI zasekne a to se prostě děje i s těma nejlepšíma modelama stále ještě, tak je najednou mnohem těžší. Takže první věc je mít tam tady tu instrumentaci, měřit eh performance a podobný věci. A druhá je, že když už loguju, tak logovat ve stylu jako console log it works, tak je taky o něčem. Takže tady je podle mě ten aspekt tý hluboký diagnostiky, abych byl schopnej říct těch logů. A je skvělá stránka, která se jmenuje eh loging sucks. Doporučuju si to přečíst. Dáme to pak do zdrojů. A tam se mluví o tom, co je problém za problém s logováním a že vlastně já chci mít co nejvíc high cardinality data, přestože se jako dlouhodobě historicky třeba tvrdil opak, jo, protože já když nemám high cardinality data, tak pak mi přijde jakože nastala nějaká chyba a já nevím, kterýmu uživateli se to stalo, na jakým projektu se to stalo a jsem úplně slepej, protože musím jenom odhalovat jako hm tak někde v tady tom endpointu je chyba, ale já Naopak chci přesně být schopnej zacílit. Tomuhle uživateli se stala chyba. Byl to tenhle projekt, stalo se to v tenhle čas. A to je podle mě naprosto klíčovej aspekt, kterej jsem jako viděl třeba na dvou projektech implementovanej správně za 10letový kariéry. Jo, i pro nás v promuku je tohleto důležitý, protože přesně jak říkáš, ono vlastně ty výstupy a kvalita těch výstupů podle mýho názoru, nevím jestli mi to vyvrátíte, ale se dá měřit nebo nějak ošetřit. Jední tehdy, když máš dobře vytvořený ať už logy nebo prostě nějakej zápis interakcí s tím uživovatelem a můžeš nad tím dělat různý analýzy, můžeš nad tím dělat prostě měření a všechno možný. Přijde mi, že to je strašně důležitý. Já bych ještě řekl jako jedna věc, jak jsi říkal to High Cardinality, tak podle mě ještě jedna věc začíná být jako hodně důležitá a to jako dobře tam ty věci mít popsaný a pojmenovaný, protože jako v minulosti jako často šlo o to tam dát pouze ty podstatný věci, ale jako většinou se na to díval jako člověk, kterej tomu rozumí, zatímco teďka je to tak, že jako nevadí tolik, když je tam těch věcí jako hodně. třeba když jako vyloguješ nějakej velkej Jason nebo jako nějakou věc, která je jako fakt velká, ale naopak co je důležitý, je důležitý, aby jako z těch logů bylo jasný, v jakém kontextu je ten problém, proč třeba se tahleta jako chyba jako nastává, jaký je účel tady tý chyby a mít to popsaný lidskými slovy, že třeba my máme jako jedna z takovejch, dám úplně konkrétní příklad, jedna z takovejch chybu je taková, že my tam máme jakýsi objekt reprezentující LLM nástroje nebo LM model, který pod sebou agreguje vícero LLM modelů, teda 0 až N LLM model a ty do něj teoreticky můžeš dát nula. Jakoby dává smysl ho inicializovat s nulou a pak do ní apendnout nějakej jako další. Ale když ho chceš použít s tou nulou, tak to nedává smysl, protože on tam žádnej model nemá a tím pádem musí říct, že žádnej model, kterej mám, nedokáže splnit tvůj request. A tady tu chybu jsme jako měli takovým jako obyčejným způsobem, že there is no model which can which can execute your request. bez informace, že jich je tam nula. Prostě jako není tam žádnej, jich tam nula, takže žádnej není. Ale jako teď jsme to vyměnili za hlášku. Eh, tuhletu, ale je k tomu append, že jako you have initialized bla bla bla with zero. This tech, this is technically valid, but it doesn't make sense. This is how it works. Teďka jako je tam prostě jako tuna textu k tomu a díky tady tomu vlastně i ten náš vibe coding s tím dokáže líp pracovat, protože jako jemu se často stane, že to jako, že to použije špatně, ale jakmile to použije špatně a jako a selže mu to, tak v tom prvním případě on vlastně jako neví a třeba jako okolo toho chodí a prostě snaží se vymýšlit nějaký blbosti. Když mu tam tu hlášku dáme, tak on jako přesně ví, ok, jako někde se stalo, že jsem jako do tady toho objektu nenacpal ty ty modely. >> Hele, to podle mě to podle mě jako souvisí s tím, co jsme tady probírali už několikrát a jedna z těch věcí je type safe errory a já kvůli tomu zbožňuju efekt a není to jenom kvůli tomu, on má integrovaný open telemetry a spoustu dalších věcí. a tu platformu, kterou dělám, co je tady jako na screenu, eh, k tomu Landina, nějakej jako group of concept, tak dělám kompletně na efektu, dělám to kompletně types save a dávám tam i ty best practices prologování a podobný věci. A to je o tom, že error sám o sobě podle jména mi řekne, čeho se ta chyba týká a mám tam i nějaký do detailu. Případně tam mám stack trace, pokud je to unexpected. Jo, většina aplikací s tímhle nepracuje dobře. A já jsem teďkom byl na workshopu na Cityjs Singapur před dvouma týdnama a tam byl týpek eh, kterej, e, nastoupil do firmy jako staff inenýr a říkal nám, ta firma vydělává 30 milionů dolarů a za poslední rok jsme měli 2 miliony unikátních errorů, který jsou ve stylu jakože z toho nic nepoznám, nemají žádný testy, nemají žádný měření performance. Ta platforma je jako vlastní absolutní shit, ale vydělává obrovský prachy. Nicméně jeho práce je to teďkom stabilizovat a ukazoval nám, jak se jako zlepšil ten trend, kdy oni jako e začali zavádět nějaký séantický pojmenování erroru podle toho, jaký oblasti se to týká, že se to týká třeba payment modulů nebo zpracování PDF nebo něcoho jinýho. A tohle dává ještě větší význam pro LLMka, protože když mám type safe error, tak ho jenom vezmu a to LMko ho vyhledá. Nemusí, nemusí prostě dělat nějaký jako další věci. A plus ještě efekt má další nějaký qualitycky, e, který se hookujou přímo do Ty script compiler. >> Jo, tohle mně přijde extrémně důležitý, protože ti to vlastně umožňuje stavět tvoji vlastní firmu už téměř jako Dark Factory, jako software Dark Factory, jako prostě podle mě je to je to důležitej mezičlánek v tomhletom řetězci. jako možná taková poslední myšlenka, že jako myslím si, že jako ono to jako nikdy nebylo tak, že by technická kvalita a jako nějakej byznysovej úspěch jako musel jít úplně ruku v ruce, že jakoby velmi často jako ty věci, který jako vystřelily, tak má jako spoustu technickejch problémů. A teď je jenom otázka, jestli je jako jestli ty všechny problémy, který se vyrojily po tom úspěchu, tak jestli ten projekt zabijou nebo ne. A občas se stane, že zabijou, občas se stane, že nezabijou. Mně přišlo teďka hrozně vtipný, jak byla reklama na Superbowu na AICOM, který bylo, no to je možná taková vtipná vtipná jako povídka na závěr, jako někdo koupil doménu za ty jo a já ani nevím kolik prostě jako úplnej nesmysl jako pení 70 milionů dolarů nějakej kryptýpek. Pravděpodobně nikdo z nás nikdy neprodá firmu za jako tolik, co co oni koupili tu doménu, ale jako bylo to navipódovaný úplně jako shitovým způsobem a zároveň to běželo na cloudfir free plánu, kterej jako já já nevím, kolik by stálo, aby tam měli nějakj jako plán, kterj to zvládne, ale jako pravděpodobně by to nebylo e jako ani já ani nevím, ale bylo by to jako o tolik řádově míň, že to je jako nechat si sp jako zbořit dům Protože eh se mě nechtělo zapitulační páskou okno. >> Hele, jako jo, tohle byla tohle byla absolutní fraška. Eh, tam se prostě ukázalo, jak moc jako v kryptu jede jako spousta scamerů a ono se to pohybuje i kolem jako Štajpíta a podobných lidí, takže to je podle mě jako kapitola sama pro sebe v tomhle ohledu. >> Já bych, jak to takle, já bych jako ještě rozlišoval to, že podle mě jakoby Open Claw, ten měl jako milion problémů jako v rukávku, ale já si nemyslím, že problémy Open Claw byly způsobený nekompetencí. Já si myslím, že to spíš bylo způsobený tím, že prostě dělá to jeden člověk a ten jako e nemá jako ten nemá neměl kapacitu na to jako jak rychle to rostlo ty problémy řešit. Zatímco AICOM to byl jako úplně ukázkovej ukázkovej příklad toho, co se stane, když má člověk zdroje, ale je absolutně nekompetentní. >> Hele, já si myslím, že u Open Call to bylo o něčem jiným. On to prostě nepředpokládal, že to takhle vyletí. On to nikdy nevyvíjel jako virální záležitost. Jediný, o co mu šlo, je, že si tvořil svýho osobního asistenta. A protože předtím měl 43 projektů, který sdílel, o kterejch psal, tak to prostě vyletělo, protože se toho chytli nejdřív nějakcí jako def influencerři, potom se toho chytli AI bullshit influencerři, jako AI code king a podobní. A v tu chvíli už to explodovalo a v tu chvíli byl problém jako obrovskj, ale ne pro ten projekt samotnej, ale proto, že se k tomu dostali nekompetentní lidi, vznikly nekompetentní projekty, který nastavovaly to nebezpečně a youtubový návody říkaly prostě to dej public na svoji VPS. Ale nebylo to, nebylo to jako problém toho samotnýho projektu. K čemu bych se ještě vrátil, tak Jirko, ty jsi zmínil Dark Factory, ale nepopsals to, tak jednak přidáme článek do odkazu a jednak to trošku popiš, co to podle tebe je. >> Jo, e, je, je to, můžu to nasdílet, eh, inspirovaný takovým jako článkem od Danao. V podstatě je to úplně autonomní továrna na výrobu aplikací, můžeš říct. E asi samozřejmě záleží na tom, jaký typ aplikací to je, ale on teda předpokládá, že jsme teďka někde na úrovni čtyři, kdy prostě máte AIO, kterýmu můžete svěřit výrobu kódu a odejít na nějakou dobu a pak se vrátíte a je to hotový. A posledním posledním stádiem je prostě Dark Software Factory, kde jako všechno se děje úplně samo a když to AI něco rozbije, tak to, že to rozbilo se dozví z nějakýho logu, který mu přistane a ono ho samo spraví, protože tam bude mít dost semanticky bohaté informace, která mu pomůže se zorientovat, co se stalo a takhle bude samo vyvíjet apku a vy vlastně ani nebudete vědět, že se něco děje. Tak todle je koncept software, dark software factory a mně přijde fascinující a přijde mi, že bych chtěl někdy takovou Dark Factory postavit. >> Super. E, díky moc za vysvětlení. E, já doufám, že se dostanem k tomu, že e, to třeba bude k dispozici a doufám, že třeba já budu jeden z těch, u kterejch, eh, se to otestuje, protože přesně na tohle mířím, že tam budu mít právě dostatečný logy, eh dostatečný třeba jako feature, requesty a podobný věci. Tam si myslím, že jako na to, aby to existovalo plně autonomně, tak tam si ještě chvilku počkáme, ale aby to zvládalo opravovat chyby, rozvíjet nějaký jako drobnosti, tak tam si myslím, že už ty technologie v tuhle chvíli víceméně jsou nebo minimálně jsou tam ty primitiva k tomu, aby tohle mohlo vzniknout. Myslím, že jako odhadoval bych to tak, že možná chybí třeba rok, než něco takovýho bude spustit v nějakým úzkým oboru nějakých dobře definovatelných dobře definovaných e aplikací nebo třídy aplikací. Tak >> jo, to mi dává smysl. Já bych to tímhle ukončil. Dotkali jsme se spousty dalších témat, takže příště se můžete těšit na nějakej přesah vibe codingu do dalších profesí. příště až se sejdeme s Jirkou a Pavolem, protože je možný, že se tady potkáme zase s někým jiným. Díky za pozornost a budeme se těšit v dalším díle. Tak zatím >> mějte se. Čau."

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command "Get-Content -Path 'changelog/_current-preversion.md' -TotalCount 100" in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 270ms:
# Current preversion

- Added `Dneska` and `Zítra` event badges ahead of `Tento týden`, based on Prague calendar dates. Shared cards,
  calendars, landing-page term choices, and the admin picker use the same phases and theme-aware colours. Terms
  still switch to `Probíhá` at their start and remain eligible for waiting-room choices and follow-up recommendations.

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
  elapsed time, and an estimate of remaining browser storage time. Recording chunks persist locally in IndexedDB;
  a source failure or storage limit stops the whole take, interrupted takes can be recovered, and a browser-wide
  lock prevents another studio tab from changing an active recording. Saved recordings have shared autosaved
  trimming and previews, explicit deletion, and ZIP64 downloads containing untouched source files and timing
  metadata, optionally with separately trimmed copies for the editor. Large archives stream to disk where supported;
  trimming runs locally using browser codecs and temporary files. Admin navigation waits for active recording and
  export; reopening the studio waits for its previous instance to release local storage. No recording is uploaded
  to the server.

- Replaced inline admin creation and editing with shared, accessible popup dialogs across contacts, short links,
  discount codes, workshop/community settings, materials, polls and member answers, chat corrections, Book agents,
  artificial activity, and custom chart metrics. Lists now show summaries with explicit New/Edit actions; contact
  notes and contacted status use the same contact editor. Dialogs contain request errors, keep long forms scrollable
  on smaller screens, restore keyboard focus, and wait for autosave before closing while retaining invalid or failed drafts.

- Added shared autosaving throughout `/admin` for existing workshop/community settings, materials, polls and answers,
  chat corrections, Book agents, contacts, discount codes, and short links. Edits are debounced and saved in order;
  background refreshes and older responses preserve newer typing. Pending or failed edits trigger the browser's
  close/reload warning, while admin links, editor switches, and sign-out wait for saving. Validation and request
  errors retain the draft with retry controls; new records and destructive actions keep their explicit buttons.
  Immediate admin writes also protect the window while their requests are in progress.
  Newer edits continue saving if an earlier request fails, incomplete discount dates stay protected, and contact
  refreshes retain local changes. Unlocking materials uses their current draft; repeated poll saves preserve the
  generated IDs and votes of newly added choices.

- Added **Nasadit na Vercel** to project settings in `/admin/workshops` when a GitHub repository has no deployment URL.
  The authenticated server integration imports the original repository, reuses one Vercel project per repository,
  and deploys its production branch with future Git pushes connected. Administration shows progress and errors,
  supports resuming status checks, and fills in the assigned production URL only after a successful build. The existing
  settings save, validation, room links and previews handle the result; manual URLs and changed projects are preserved.
  Documented private `VERCEL_TOKEN` / optional `VERCEL_TEAM_ID` setup; no database migration is needed.

- Added independent starting and ending commit IDs to workshop project settings in `/admin/workshops`, with commit
  message, author and date previews and separate date-based autofill buttons. The participant project graph opens on
  the inclusive range and highlights it, with expansion and pagination for history outside it. Missing bounds leave
  their respective side open. All views and lookups retain the selected branch patterns; unrelated branches stay
  hidden. Commit IDs are validated and normalized on save, and the range is copied or cleared with its repository.
  Concurrent autofill preserves both bounds, changing the branch selection discards pending history responses, and
  temporary GitHub failures retain the loaded graph without announcing historical commits as new.

- Granting trust or moderator status now approves all pending submissions by that room participant: chat messages,
  custom poll answers (including shared polls), and community projects. Promotion and approval commit together;
  rejected submissions stay rejected and interaction bans still block automatic approval. Moderators on
  `/cs/online-workshop/participant` and `/cs/komunita`, and administrators in the participant list, see each author's
  complete pending count. The shared project gallery refreshes with the room after approval.

- Added light and dark modes to `/cs/komunita` and `/cs/online-workshop/participant`, including their waiting rooms
  and shared project views. One accessible appearance control follows the device setting by default and remembers an
  explicit choice across visits, tabs, and rooms. Shared palette tokens cover chat, polls, calendars, event cards,
  materials and Markdown, project and membership dialogs, and cookie controls without duplicating the room UI.
  Switching appearance preserves typed names, e-mails, chat drafts, and the connected session.

- Allowed one isolated E2E retry for transient development-server or external-database failures. Each retry runs
  the complete test with its original assertions; failed-attempt traces remain available for diagnosis.

- Improved the shared event mini cards on `/cs/komunita`: removed star ratings and their unused feedback queries,
  enlarged project previews with a wide image, readable title and description, and a repository fallback. Ended
  workshops show a replay-length badge using the total video duration minus the configured recording start offset.
  The calendar and card list use the same component and keep their existing destinations and participant hand-off.

- Added a downloadable Czech wrap-up PDF to the ended stage of `/cs/online-workshop/participant?workshop=`.
  It includes the workshop description, key points extracted from existing descriptions and materials, full readable
  materials with clickable links, and any presentation, repository, and deployments. The download refreshes the
  existing authenticated room state, preserving publication, unlock, and membership rules and refusing workshops
  that have not ended or have been reopened. PDFs support Czech text and multiple pages and are generated in the
  browser on demand, with no new administration, database fields, or saved documents.

- Added a quiet display-settings switch to `/admin/workshops` and `/admin/community` for screen sharing. Artificial
  controls stay hidden by default: prepared chat comments and reactions, synthetic viewer counts, and artificial
  comment and poll-vote adjustments no longer appear among ordinary moderation controls. The switch is one compact
  settings icon away and keeps its intentional state in the shareable address as `artopts=on` or `artopts=off`; it

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command "node -e \"const packageJson=require('./package.json'); console.log(JSON.stringify(packageJson.scripts,null,2))\"" in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 209ms:
{
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
}

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command "Get-Content -Path 'businesses/ai-ta-krajta/useAiTaKrajtaOrderedPeople.test.tsx'" in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 239ms:
/**
 * @vitest-environment jsdom
 */

import { AI_TA_KRAJTA_PEOPLE } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
import { orderAiTaKrajtaPeopleByAppearances } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder';
import { useAiTaKrajtaOrderedPeople } from '@/businesses/ai-ta-krajta/useAiTaKrajtaOrderedPeople';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

/**
 * How many times a test which watches the draw opens the section again
 */
const MOUNT_COUNT = 20;

/**
 * An archive which names one person far more often than anybody else, so that the leaning of the draw is visible
 */
const EPISODE_COUNT_BY_PERSON_ID: ReadonlyMap<string, number> = new Map([['petr-brzek', 99]]);

const PERSON_IDS_OF_ROSTER = AI_TA_KRAJTA_PEOPLE.map((person) => person.id);

afterEach(cleanup);

/**
 * Opens the section once and writes down the roster of every single render it made
 *
 * Note: The first of them is what the server sends and what the browser hydrates against, which is why the test reads
 *       the renders one by one instead of only their outcome.
 */
function renderPeopleOrders(): readonly (readonly string[])[] {
    const renderedOrders: (readonly string[])[] = [];

    function PeopleOrderProbe() {
        renderedOrders.push(useAiTaKrajtaOrderedPeople(EPISODE_COUNT_BY_PERSON_ID).map((person) => person.id));

        return null;
    }

    render(<PeopleOrderProbe />);

    return renderedOrders;
}

/**
 * The roster as it stands once the draw has been made
 */
function renderDrawnPeopleOrder(): readonly string[] {
    const renderedOrders = renderPeopleOrders();

    return renderedOrders[renderedOrders.length - 1];
}

describe('useAiTaKrajtaOrderedPeople', () => {
    it('renders the order the draw leans towards first, so that the browser hydrates into the built page', () => {
        const [firstRenderedOrder] = renderPeopleOrders();

        expect(firstRenderedOrder).toEqual(
            orderAiTaKrajtaPeopleByAppearances(AI_TA_KRAJTA_PEOPLE, EPISODE_COUNT_BY_PERSON_ID).map(
                (person) => person.id,
            ),
        );
        expect(firstRenderedOrder[0]).toBe('petr-brzek');
    });

    it('draws its own order once the section is alive in the browser', () => {
        const renderedOrders = renderPeopleOrders();

        expect(renderedOrders.length).toBeGreaterThan(1);
        expect([...renderDrawnPeopleOrder()].sort()).toEqual([...PERSON_IDS_OF_ROSTER].sort());
    });

    it('does not show the same order to every visit', () => {
        const drawnOrders = Array.from({ length: MOUNT_COUNT }, () => renderDrawnPeopleOrder().join(' '));

        expect(new Set(drawnOrders).size).toBeGreaterThan(1);
    });
});

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command 'npx vitest run businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 15186ms:

 RUN  v3.2.4 C:/Users/me/work/promptbook-experiments-and-landing-pages/aldaron

 ✓ businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts (7 tests) 12ms
 ✓ businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts (28 tests) 840ms

 Test Files  2 passed (2)
      Tests  35 passed (35)
   Start at  13:46:31
   Duration  2.29s (transform 207ms, setup 0ms, collect 487ms, tests 852ms, environment 1ms, prepare 1.31s)


exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command 'rg -n -C 2 "weighted by how many episodes" AGENTS.md' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 183ms:
57-  zoom only when reduced motion is not requested. A future person without a photo
58-  keeps initials on that same background. The one people list is drawn anew
59:  for every visit, weighted by how many episodes of the archive name each
60-  person, so somebody heard often comes up high far more often than someone in
61-  one díl without the list ever becoming a ranking. The draw is local state and

apply patch
patch: completed
C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron\AGENTS.md
C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron\businesses\ai-ta-krajta\aiTaKrajtaPeople.test.ts
C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron\businesses\ai-ta-krajta\aiTaKrajtaPeople.ts
C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron\businesses\ai-ta-krajta\aiTaKrajtaPeopleOrder.test.ts
C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron\businesses\ai-ta-krajta\aiTaKrajtaPeopleOrder.ts
C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron\changelog\_current-preversion.md
diff --git a/AGENTS.md b/AGENTS.md
index d000c5fd0c0fe752490b216922648f5e0d80e798..36e3a8519ecd39f0d8a925d8e7f8821c50be6e4c
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -57,7 +57,7 @@
   zoom only when reduced motion is not requested. A future person without a photo
   keeps initials on that same background. The one people list is drawn anew
   for every visit, weighted by how many episodes of the archive name each
-  person, so somebody heard often comes up high far more often than someone in
+  person after their roster factor is applied (one by default), so somebody heard often comes up high far more often than someone in
   one díl without the list ever becoming a ranking. The draw is local state and
   is made in the browser; the page itself is built in the order the draw leans
   towards, from the most often named person to the least often named one, so the
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
index 409d1caf0bc77cb7adf64cb527b4050f6b73369e..1f2984898a11cb0555b41680c6114d0e1f2ecad1
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
@@ -33,6 +33,18 @@
 });
 
 describe('AI_TA_KRAJTA_PEOPLE', () => {
+    it('sets the requested episode-appearance factors', () => {
+        const factoredPeople = AI_TA_KRAJTA_PEOPLE.filter((person) => person.factor !== undefined).map(
+            ({ id, factor }) => ({ id, factor }),
+        );
+
+        expect(factoredPeople).toEqual([
+            { id: 'pavol-hejny', factor: 0.8 },
+            { id: 'katka-fajmanova', factor: 1.7 },
+            { id: 'tomas-mikolov', factor: 5 },
+        ]);
+    });
+
     // Note: A portrait which is only named and never cut breaks in the browser and nowhere else, which is why the
     //       roster is read against `public` here rather than trusted.
     it.each(AI_TA_KRAJTA_PEOPLE)(
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
index 7c41d07a8690c6d211fd32ab581dbc9b654b7cad..d4d59c6a380035522099d63172eedb3c10ee16e6
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
@@ -14,6 +14,14 @@
     readonly name: string;
 
     /**
+     * Multiplier of this person's credited episode appearances when the roster is drawn
+     *
+     * Note: Omitting it keeps the ordinary factor of one. It affects only the chance of a person appearing near the
+     *       front of the roster; episode counts themselves stay exact.
+     */
+    readonly factor?: number;
+
+    /**
      * What the person does, in one line and only as far as the episodes of the show actually say it
      */
     readonly headline: string;
@@ -60,6 +68,7 @@
     {
         id: 'pavol-hejny',
         name: 'Pavol Hejný',
+        factor: 0.8,
         headline: 'AI konzultant a vývojář. Staví AI agenty a v dílech je rozebírá z praxe.',
         url: 'https://www.ptbk.io/pavol',
         photoFileName: 'pavol-hejny.png',
@@ -128,6 +137,7 @@
     {
         id: 'katka-fajmanova',
         name: 'Katka Fajmanová',
+        factor: 1.7,
         headline: 'Architektura a interpretabilita modelů. Díl o tom, co se děje uvnitř sítě.',
         url: null,
         photoFileName: 'katka-fajmanova.png',
@@ -239,6 +249,7 @@
     {
         id: 'tomas-mikolov',
         name: 'Tomáš Mikolov',
+        factor: 5,
         headline: 'Spoluzakladatel BottleCap AI. V Googlu zažil doby, kdy se stavěly základy dnešních modelů.',
         url: 'https://bottlecapai.com/',
         photoFileName: 'tomas-mikolov.png',
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
index eab515daf7a3dec85b218da514a41326b7e6675f..c074153e99ba597c811d828a5856efcd6ae72a8d
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
@@ -10,10 +10,11 @@
  */
 const DRAW_COUNT = 500;
 
-function createPerson(id: string): AiTaKrajtaPerson {
+function createPerson(id: string, factor?: number): AiTaKrajtaPerson {
     return {
         id,
         name: id,
+        factor,
         headline: 'Mluví do mikrofonu.',
         url: null,
         photoFileName: null,
@@ -68,6 +69,26 @@
         expect(ordered.map((person) => person.id)).toEqual(PEOPLE.map((person) => person.id));
     });
 
+    it('multiplies credited episode appearances by a person factor', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('frequent-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['frequent-contributor', 4],
+        ]);
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, episodeCountByPersonId);
+
+        expect(ordered.map((person) => person.id)).toEqual(['boosted-contributor', 'frequent-contributor']);
+    });
+
+    it('does not apply a person factor to the base chance without credited appearances', () => {
+        const people = [createPerson('ordinary-contributor'), createPerson('boosted-contributor', 5)];
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, new Map());
+
+        expect(ordered.map((person) => person.id)).toEqual(['ordinary-contributor', 'boosted-contributor']);
+    });
+
     it('leaves the roster it was given alone', () => {
         orderAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID);
 
@@ -102,6 +123,24 @@
         expect(frequentContributorTopCount).toBeLessThan(DRAW_COUNT);
     });
 
+    it('uses a person factor when drawing the weighted order', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('ordinary-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['ordinary-contributor', 1],
+        ]);
+        const randomNumbers = [0.1, 0.2];
+        let nextRandomNumberIndex = 0;
+
+        const shuffled = shuffleAiTaKrajtaPeopleByAppearances(
+            people,
+            episodeCountByPersonId,
+            () => randomNumbers[nextRandomNumberIndex++]!,
+        );
+
+        expect(shuffled.map((person) => person.id)).toEqual(['boosted-contributor', 'ordinary-contributor']);
+    });
+
     it('moves even somebody the archive never names around the list', () => {
         const placesOfNeverNamed = collectPlacesByPersonId().get('never-named')!;
 
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
index 516fd7222668e8843dd2c2b7e0a5224b5f990a3b..9e76389fc328b90c835b4a82dd5f94c1ec3ca8ea
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
@@ -11,10 +11,24 @@
 const BASE_PERSON_WEIGHT = 1;
 
 /**
+ * Multiplier used for a person whose roster entry does not set one
+ */
+const DEFAULT_PERSON_FACTOR = 1;
+
+/**
+ * Multiplier of a person's credited episode appearances when drawing the roster
+ */
+function getPersonFactor(person: AiTaKrajtaPerson): number {
+    return person.factor ?? DEFAULT_PERSON_FACTOR;
+}
+
+/**
  * How much of the front of the list one person has a chance at, which is how often the show has them on
  */
 function getPersonWeight(person: AiTaKrajtaPerson, episodeCountByPersonId: ReadonlyMap<string, number>): number {
-    return BASE_PERSON_WEIGHT + (episodeCountByPersonId.get(person.id) ?? 0);
+    const episodeCount = episodeCountByPersonId.get(person.id) ?? 0;
+
+    return BASE_PERSON_WEIGHT + episodeCount * getPersonFactor(person);
 }
 
 /**
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 83d8b0f693509e0926ab81b0ce15225503d91f9c..af4c5838b8655f74fa88c2bb085da45e78ef7274
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,5 +1,9 @@
 # Current preversion
 
+- Added per-host episode-appearance factors to the `/ai-ta-krajta` roster draw. Hosts still default to their exact
+  episode count, while Katka Fajmanová receives 1.7×, Tomáš Mikolov 5×, and Pavol Hejný 0.8× before weighted ordering.
+  The shared calculation affects both the hydration-safe initial order and each visitor's fresh randomized draw.
+
 - Added `Dneska` and `Zítra` event badges ahead of `Tento týden`, based on Prague calendar dates. Shared cards,
   calendars, landing-page term choices, and the admin picker use the same phases and theme-aware colours. Terms
   still switch to `Probíhá` at their start and remain eligible for waiting-room choices and follow-up recommendations.

diff --git a/AGENTS.md b/AGENTS.md
index d000c5fd0c0fe752490b216922648f5e0d80e798..36e3a8519ecd39f0d8a925d8e7f8821c50be6e4c
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -57,7 +57,7 @@
   zoom only when reduced motion is not requested. A future person without a photo
   keeps initials on that same background. The one people list is drawn anew
   for every visit, weighted by how many episodes of the archive name each
-  person, so somebody heard often comes up high far more often than someone in
+  person after their roster factor is applied (one by default), so somebody heard often comes up high far more often than someone in
   one díl without the list ever becoming a ranking. The draw is local state and
   is made in the browser; the page itself is built in the order the draw leans
   towards, from the most often named person to the least often named one, so the
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
index 409d1caf0bc77cb7adf64cb527b4050f6b73369e..1f2984898a11cb0555b41680c6114d0e1f2ecad1
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
@@ -33,6 +33,18 @@
 });
 
 describe('AI_TA_KRAJTA_PEOPLE', () => {
+    it('sets the requested episode-appearance factors', () => {
+        const factoredPeople = AI_TA_KRAJTA_PEOPLE.filter((person) => person.factor !== undefined).map(
+            ({ id, factor }) => ({ id, factor }),
+        );
+
+        expect(factoredPeople).toEqual([
+            { id: 'pavol-hejny', factor: 0.8 },
+            { id: 'katka-fajmanova', factor: 1.7 },
+            { id: 'tomas-mikolov', factor: 5 },
+        ]);
+    });
+
     // Note: A portrait which is only named and never cut breaks in the browser and nowhere else, which is why the
     //       roster is read against `public` here rather than trusted.
     it.each(AI_TA_KRAJTA_PEOPLE)(
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
index 7c41d07a8690c6d211fd32ab581dbc9b654b7cad..d4d59c6a380035522099d63172eedb3c10ee16e6
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
@@ -14,6 +14,14 @@
     readonly name: string;
 
     /**
+     * Multiplier of this person's credited episode appearances when the roster is drawn
+     *
+     * Note: Omitting it keeps the ordinary factor of one. It affects only the chance of a person appearing near the
+     *       front of the roster; episode counts themselves stay exact.
+     */
+    readonly factor?: number;
+
+    /**
      * What the person does, in one line and only as far as the episodes of the show actually say it
      */
     readonly headline: string;
@@ -60,6 +68,7 @@
     {
         id: 'pavol-hejny',
         name: 'Pavol Hejný',
+        factor: 0.8,
         headline: 'AI konzultant a vývojář. Staví AI agenty a v dílech je rozebírá z praxe.',
         url: 'https://www.ptbk.io/pavol',
         photoFileName: 'pavol-hejny.png',
@@ -128,6 +137,7 @@
     {
         id: 'katka-fajmanova',
         name: 'Katka Fajmanová',
+        factor: 1.7,
         headline: 'Architektura a interpretabilita modelů. Díl o tom, co se děje uvnitř sítě.',
         url: null,
         photoFileName: 'katka-fajmanova.png',
@@ -239,6 +249,7 @@
     {
         id: 'tomas-mikolov',
         name: 'Tomáš Mikolov',
+        factor: 5,
         headline: 'Spoluzakladatel BottleCap AI. V Googlu zažil doby, kdy se stavěly základy dnešních modelů.',
         url: 'https://bottlecapai.com/',
         photoFileName: 'tomas-mikolov.png',
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
index eab515daf7a3dec85b218da514a41326b7e6675f..c074153e99ba597c811d828a5856efcd6ae72a8d
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
@@ -10,10 +10,11 @@
  */
 const DRAW_COUNT = 500;
 
-function createPerson(id: string): AiTaKrajtaPerson {
+function createPerson(id: string, factor?: number): AiTaKrajtaPerson {
     return {
         id,
         name: id,
+        factor,
         headline: 'Mluví do mikrofonu.',
         url: null,
         photoFileName: null,
@@ -68,6 +69,26 @@
         expect(ordered.map((person) => person.id)).toEqual(PEOPLE.map((person) => person.id));
     });
 
+    it('multiplies credited episode appearances by a person factor', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('frequent-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['frequent-contributor', 4],
+        ]);
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, episodeCountByPersonId);
+
+        expect(ordered.map((person) => person.id)).toEqual(['boosted-contributor', 'frequent-contributor']);
+    });
+
+    it('does not apply a person factor to the base chance without credited appearances', () => {
+        const people = [createPerson('ordinary-contributor'), createPerson('boosted-contributor', 5)];
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, new Map());
+
+        expect(ordered.map((person) => person.id)).toEqual(['ordinary-contributor', 'boosted-contributor']);
+    });
+
     it('leaves the roster it was given alone', () => {
         orderAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID);
 
@@ -102,6 +123,24 @@
         expect(frequentContributorTopCount).toBeLessThan(DRAW_COUNT);
     });
 
+    it('uses a person factor when drawing the weighted order', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('ordinary-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['ordinary-contributor', 1],
+        ]);
+        const randomNumbers = [0.1, 0.2];
+        let nextRandomNumberIndex = 0;
+
+        const shuffled = shuffleAiTaKrajtaPeopleByAppearances(
+            people,
+            episodeCountByPersonId,
+            () => randomNumbers[nextRandomNumberIndex++]!,
+        );
+
+        expect(shuffled.map((person) => person.id)).toEqual(['boosted-contributor', 'ordinary-contributor']);
+    });
+
     it('moves even somebody the archive never names around the list', () => {
         const placesOfNeverNamed = collectPlacesByPersonId().get('never-named')!;
 
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
index 516fd7222668e8843dd2c2b7e0a5224b5f990a3b..9e76389fc328b90c835b4a82dd5f94c1ec3ca8ea
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
@@ -11,10 +11,24 @@
 const BASE_PERSON_WEIGHT = 1;
 
 /**
+ * Multiplier used for a person whose roster entry does not set one
+ */
+const DEFAULT_PERSON_FACTOR = 1;
+
+/**
+ * Multiplier of a person's credited episode appearances when drawing the roster
+ */
+function getPersonFactor(person: AiTaKrajtaPerson): number {
+    return person.factor ?? DEFAULT_PERSON_FACTOR;
+}
+
+/**
  * How much of the front of the list one person has a chance at, which is how often the show has them on
  */
 function getPersonWeight(person: AiTaKrajtaPerson, episodeCountByPersonId: ReadonlyMap<string, number>): number {
-    return BASE_PERSON_WEIGHT + (episodeCountByPersonId.get(person.id) ?? 0);
+    const episodeCount = episodeCountByPersonId.get(person.id) ?? 0;
+
+    return BASE_PERSON_WEIGHT + episodeCount * getPersonFactor(person);
 }
 
 /**
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 83d8b0f693509e0926ab81b0ce15225503d91f9c..af4c5838b8655f74fa88c2bb085da45e78ef7274
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,5 +1,9 @@
 # Current preversion
 
+- Added per-host episode-appearance factors to the `/ai-ta-krajta` roster draw. Hosts still default to their exact
+  episode count, while Katka Fajmanová receives 1.7×, Tomáš Mikolov 5×, and Pavol Hejný 0.8× before weighted ordering.
+  The shared calculation affects both the hydration-safe initial order and each visitor's fresh randomized draw.
+
 - Added `Dneska` and `Zítra` event badges ahead of `Tento týden`, based on Prague calendar dates. Shared cards,
   calendars, landing-page term choices, and the admin picker use the same phases and theme-aware colours. Terms
   still switch to `Probíhá` at their start and remain eligible for waiting-room choices and follow-up recommendations.

codex
Implementation is now in the roster model and the one shared weight calculation. The base weight remains independent of factors, so a factor changes only credited appearances as requested; the same rule automatically covers both server-rendered ordering and browser-side shuffling.
exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command 'npx vitest run businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts businesses/ai-ta-krajta/useAiTaKrajtaOrderedPeople.test.tsx' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 17732ms:

 RUN  v3.2.4 C:/Users/me/work/promptbook-experiments-and-landing-pages/aldaron

 ✓ businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts (10 tests) 14ms
 ✓ businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts (29 tests) 763ms
 ✓ businesses/ai-ta-krajta/useAiTaKrajtaOrderedPeople.test.tsx (3 tests) 71ms

 Test Files  3 passed (3)
      Tests  42 passed (42)
   Start at  13:47:53
   Duration  15.66s (transform 204ms, setup 0ms, collect 3.88s, tests 848ms, environment 10.97s, prepare 553ms)


diff --git a/AGENTS.md b/AGENTS.md
index d000c5fd0c0fe752490b216922648f5e0d80e798..36e3a8519ecd39f0d8a925d8e7f8821c50be6e4c
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -57,7 +57,7 @@
   zoom only when reduced motion is not requested. A future person without a photo
   keeps initials on that same background. The one people list is drawn anew
   for every visit, weighted by how many episodes of the archive name each
-  person, so somebody heard often comes up high far more often than someone in
+  person after their roster factor is applied (one by default), so somebody heard often comes up high far more often than someone in
   one díl without the list ever becoming a ranking. The draw is local state and
   is made in the browser; the page itself is built in the order the draw leans
   towards, from the most often named person to the least often named one, so the
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
index 409d1caf0bc77cb7adf64cb527b4050f6b73369e..1f2984898a11cb0555b41680c6114d0e1f2ecad1
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
@@ -33,6 +33,18 @@
 });
 
 describe('AI_TA_KRAJTA_PEOPLE', () => {
+    it('sets the requested episode-appearance factors', () => {
+        const factoredPeople = AI_TA_KRAJTA_PEOPLE.filter((person) => person.factor !== undefined).map(
+            ({ id, factor }) => ({ id, factor }),
+        );
+
+        expect(factoredPeople).toEqual([
+            { id: 'pavol-hejny', factor: 0.8 },
+            { id: 'katka-fajmanova', factor: 1.7 },
+            { id: 'tomas-mikolov', factor: 5 },
+        ]);
+    });
+
     // Note: A portrait which is only named and never cut breaks in the browser and nowhere else, which is why the
     //       roster is read against `public` here rather than trusted.
     it.each(AI_TA_KRAJTA_PEOPLE)(
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
index 7c41d07a8690c6d211fd32ab581dbc9b654b7cad..d4d59c6a380035522099d63172eedb3c10ee16e6
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
@@ -14,6 +14,14 @@
     readonly name: string;
 
     /**
+     * Multiplier of this person's credited episode appearances when the roster is drawn
+     *
+     * Note: Omitting it keeps the ordinary factor of one. It affects only the chance of a person appearing near the
+     *       front of the roster; episode counts themselves stay exact.
+     */
+    readonly factor?: number;
+
+    /**
      * What the person does, in one line and only as far as the episodes of the show actually say it
      */
     readonly headline: string;
@@ -60,6 +68,7 @@
     {
         id: 'pavol-hejny',
         name: 'Pavol Hejný',
+        factor: 0.8,
         headline: 'AI konzultant a vývojář. Staví AI agenty a v dílech je rozebírá z praxe.',
         url: 'https://www.ptbk.io/pavol',
         photoFileName: 'pavol-hejny.png',
@@ -128,6 +137,7 @@
     {
         id: 'katka-fajmanova',
         name: 'Katka Fajmanová',
+        factor: 1.7,
         headline: 'Architektura a interpretabilita modelů. Díl o tom, co se děje uvnitř sítě.',
         url: null,
         photoFileName: 'katka-fajmanova.png',
@@ -239,6 +249,7 @@
     {
         id: 'tomas-mikolov',
         name: 'Tomáš Mikolov',
+        factor: 5,
         headline: 'Spoluzakladatel BottleCap AI. V Googlu zažil doby, kdy se stavěly základy dnešních modelů.',
         url: 'https://bottlecapai.com/',
         photoFileName: 'tomas-mikolov.png',
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
index eab515daf7a3dec85b218da514a41326b7e6675f..c074153e99ba597c811d828a5856efcd6ae72a8d
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
@@ -10,10 +10,11 @@
  */
 const DRAW_COUNT = 500;
 
-function createPerson(id: string): AiTaKrajtaPerson {
+function createPerson(id: string, factor?: number): AiTaKrajtaPerson {
     return {
         id,
         name: id,
+        factor,
         headline: 'Mluví do mikrofonu.',
         url: null,
         photoFileName: null,
@@ -68,6 +69,26 @@
         expect(ordered.map((person) => person.id)).toEqual(PEOPLE.map((person) => person.id));
     });
 
+    it('multiplies credited episode appearances by a person factor', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('frequent-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['frequent-contributor', 4],
+        ]);
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, episodeCountByPersonId);
+
+        expect(ordered.map((person) => person.id)).toEqual(['boosted-contributor', 'frequent-contributor']);
+    });
+
+    it('does not apply a person factor to the base chance without credited appearances', () => {
+        const people = [createPerson('ordinary-contributor'), createPerson('boosted-contributor', 5)];
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, new Map());
+
+        expect(ordered.map((person) => person.id)).toEqual(['ordinary-contributor', 'boosted-contributor']);
+    });
+
     it('leaves the roster it was given alone', () => {
         orderAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID);
 
@@ -102,6 +123,24 @@
         expect(frequentContributorTopCount).toBeLessThan(DRAW_COUNT);
     });
 
+    it('uses a person factor when drawing the weighted order', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('ordinary-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['ordinary-contributor', 1],
+        ]);
+        const randomNumbers = [0.1, 0.2];
+        let nextRandomNumberIndex = 0;
+
+        const shuffled = shuffleAiTaKrajtaPeopleByAppearances(
+            people,
+            episodeCountByPersonId,
+            () => randomNumbers[nextRandomNumberIndex++]!,
+        );
+
+        expect(shuffled.map((person) => person.id)).toEqual(['boosted-contributor', 'ordinary-contributor']);
+    });
+
     it('moves even somebody the archive never names around the list', () => {
         const placesOfNeverNamed = collectPlacesByPersonId().get('never-named')!;
 
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
index 516fd7222668e8843dd2c2b7e0a5224b5f990a3b..9e76389fc328b90c835b4a82dd5f94c1ec3ca8ea
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
@@ -11,10 +11,24 @@
 const BASE_PERSON_WEIGHT = 1;
 
 /**
+ * Multiplier used for a person whose roster entry does not set one
+ */
+const DEFAULT_PERSON_FACTOR = 1;
+
+/**
+ * Multiplier of a person's credited episode appearances when drawing the roster
+ */
+function getPersonFactor(person: AiTaKrajtaPerson): number {
+    return person.factor ?? DEFAULT_PERSON_FACTOR;
+}
+
+/**
  * How much of the front of the list one person has a chance at, which is how often the show has them on
  */
 function getPersonWeight(person: AiTaKrajtaPerson, episodeCountByPersonId: ReadonlyMap<string, number>): number {
-    return BASE_PERSON_WEIGHT + (episodeCountByPersonId.get(person.id) ?? 0);
+    const episodeCount = episodeCountByPersonId.get(person.id) ?? 0;
+
+    return BASE_PERSON_WEIGHT + episodeCount * getPersonFactor(person);
 }
 
 /**
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 83d8b0f693509e0926ab81b0ce15225503d91f9c..af4c5838b8655f74fa88c2bb085da45e78ef7274
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,5 +1,9 @@
 # Current preversion
 
+- Added per-host episode-appearance factors to the `/ai-ta-krajta` roster draw. Hosts still default to their exact
+  episode count, while Katka Fajmanová receives 1.7×, Tomáš Mikolov 5×, and Pavol Hejný 0.8× before weighted ordering.
+  The shared calculation affects both the hydration-safe initial order and each visitor's fresh randomized draw.
+
 - Added `Dneska` and `Zítra` event badges ahead of `Tento týden`, based on Prague calendar dates. Shared cards,
   calendars, landing-page term choices, and the admin picker use the same phases and theme-aware colours. Terms
   still switch to `Probíhá` at their start and remain eligible for waiting-room choices and follow-up recommendations.

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command 'git diff --check' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 197ms:
diff --git a/AGENTS.md b/AGENTS.md
index d000c5fd0c0fe752490b216922648f5e0d80e798..36e3a8519ecd39f0d8a925d8e7f8821c50be6e4c
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -57,7 +57,7 @@
   zoom only when reduced motion is not requested. A future person without a photo
   keeps initials on that same background. The one people list is drawn anew
   for every visit, weighted by how many episodes of the archive name each
-  person, so somebody heard often comes up high far more often than someone in
+  person after their roster factor is applied (one by default), so somebody heard often comes up high far more often than someone in
   one díl without the list ever becoming a ranking. The draw is local state and
   is made in the browser; the page itself is built in the order the draw leans
   towards, from the most often named person to the least often named one, so the
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
index 409d1caf0bc77cb7adf64cb527b4050f6b73369e..1f2984898a11cb0555b41680c6114d0e1f2ecad1
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
@@ -33,6 +33,18 @@
 });
 
 describe('AI_TA_KRAJTA_PEOPLE', () => {
+    it('sets the requested episode-appearance factors', () => {
+        const factoredPeople = AI_TA_KRAJTA_PEOPLE.filter((person) => person.factor !== undefined).map(
+            ({ id, factor }) => ({ id, factor }),
+        );
+
+        expect(factoredPeople).toEqual([
+            { id: 'pavol-hejny', factor: 0.8 },
+            { id: 'katka-fajmanova', factor: 1.7 },
+            { id: 'tomas-mikolov', factor: 5 },
+        ]);
+    });
+
     // Note: A portrait which is only named and never cut breaks in the browser and nowhere else, which is why the
     //       roster is read against `public` here rather than trusted.
     it.each(AI_TA_KRAJTA_PEOPLE)(
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
index 7c41d07a8690c6d211fd32ab581dbc9b654b7cad..d4d59c6a380035522099d63172eedb3c10ee16e6
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
@@ -14,6 +14,14 @@
     readonly name: string;
 
     /**
+     * Multiplier of this person's credited episode appearances when the roster is drawn
+     *
+     * Note: Omitting it keeps the ordinary factor of one. It affects only the chance of a person appearing near the
+     *       front of the roster; episode counts themselves stay exact.
+     */
+    readonly factor?: number;
+
+    /**
      * What the person does, in one line and only as far as the episodes of the show actually say it
      */
     readonly headline: string;
@@ -60,6 +68,7 @@
     {
         id: 'pavol-hejny',
         name: 'Pavol Hejný',
+        factor: 0.8,
         headline: 'AI konzultant a vývojář. Staví AI agenty a v dílech je rozebírá z praxe.',
         url: 'https://www.ptbk.io/pavol',
         photoFileName: 'pavol-hejny.png',
@@ -128,6 +137,7 @@
     {
         id: 'katka-fajmanova',
         name: 'Katka Fajmanová',
+        factor: 1.7,
         headline: 'Architektura a interpretabilita modelů. Díl o tom, co se děje uvnitř sítě.',
         url: null,
         photoFileName: 'katka-fajmanova.png',
@@ -239,6 +249,7 @@
     {
         id: 'tomas-mikolov',
         name: 'Tomáš Mikolov',
+        factor: 5,
         headline: 'Spoluzakladatel BottleCap AI. V Googlu zažil doby, kdy se stavěly základy dnešních modelů.',
         url: 'https://bottlecapai.com/',
         photoFileName: 'tomas-mikolov.png',
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
index eab515daf7a3dec85b218da514a41326b7e6675f..c074153e99ba597c811d828a5856efcd6ae72a8d
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
@@ -10,10 +10,11 @@
  */
 const DRAW_COUNT = 500;
 
-function createPerson(id: string): AiTaKrajtaPerson {
+function createPerson(id: string, factor?: number): AiTaKrajtaPerson {
     return {
         id,
         name: id,
+        factor,
         headline: 'Mluví do mikrofonu.',
         url: null,
         photoFileName: null,
@@ -68,6 +69,26 @@
         expect(ordered.map((person) => person.id)).toEqual(PEOPLE.map((person) => person.id));
     });
 
+    it('multiplies credited episode appearances by a person factor', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('frequent-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['frequent-contributor', 4],
+        ]);
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, episodeCountByPersonId);
+
+        expect(ordered.map((person) => person.id)).toEqual(['boosted-contributor', 'frequent-contributor']);
+    });
+
+    it('does not apply a person factor to the base chance without credited appearances', () => {
+        const people = [createPerson('ordinary-contributor'), createPerson('boosted-contributor', 5)];
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, new Map());
+
+        expect(ordered.map((person) => person.id)).toEqual(['ordinary-contributor', 'boosted-contributor']);
+    });
+
     it('leaves the roster it was given alone', () => {
         orderAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID);
 
@@ -102,6 +123,24 @@
         expect(frequentContributorTopCount).toBeLessThan(DRAW_COUNT);
     });
 
+    it('uses a person factor when drawing the weighted order', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('ordinary-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['ordinary-contributor', 1],
+        ]);
+        const randomNumbers = [0.1, 0.2];
+        let nextRandomNumberIndex = 0;
+
+        const shuffled = shuffleAiTaKrajtaPeopleByAppearances(
+            people,
+            episodeCountByPersonId,
+            () => randomNumbers[nextRandomNumberIndex++]!,
+        );
+
+        expect(shuffled.map((person) => person.id)).toEqual(['boosted-contributor', 'ordinary-contributor']);
+    });
+
     it('moves even somebody the archive never names around the list', () => {
         const placesOfNeverNamed = collectPlacesByPersonId().get('never-named')!;
 
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
index 516fd7222668e8843dd2c2b7e0a5224b5f990a3b..9e76389fc328b90c835b4a82dd5f94c1ec3ca8ea
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
@@ -11,10 +11,24 @@
 const BASE_PERSON_WEIGHT = 1;
 
 /**
+ * Multiplier used for a person whose roster entry does not set one
+ */
+const DEFAULT_PERSON_FACTOR = 1;
+
+/**
+ * Multiplier of a person's credited episode appearances when drawing the roster
+ */
+function getPersonFactor(person: AiTaKrajtaPerson): number {
+    return person.factor ?? DEFAULT_PERSON_FACTOR;
+}
+
+/**
  * How much of the front of the list one person has a chance at, which is how often the show has them on
  */
 function getPersonWeight(person: AiTaKrajtaPerson, episodeCountByPersonId: ReadonlyMap<string, number>): number {
-    return BASE_PERSON_WEIGHT + (episodeCountByPersonId.get(person.id) ?? 0);
+    const episodeCount = episodeCountByPersonId.get(person.id) ?? 0;
+
+    return BASE_PERSON_WEIGHT + episodeCount * getPersonFactor(person);
 }
 
 /**
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 83d8b0f693509e0926ab81b0ce15225503d91f9c..af4c5838b8655f74fa88c2bb085da45e78ef7274
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,5 +1,9 @@
 # Current preversion
 
+- Added per-host episode-appearance factors to the `/ai-ta-krajta` roster draw. Hosts still default to their exact
+  episode count, while Katka Fajmanová receives 1.7×, Tomáš Mikolov 5×, and Pavol Hejný 0.8× before weighted ordering.
+  The shared calculation affects both the hydration-safe initial order and each visitor's fresh randomized draw.
+
 - Added `Dneska` and `Zítra` event badges ahead of `Tento týden`, based on Prague calendar dates. Shared cards,
   calendars, landing-page term choices, and the admin picker use the same phases and theme-aware colours. Terms
   still switch to `Probíhá` at their start and remain eligible for waiting-room choices and follow-up recommendations.

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command 'git diff -- AGENTS.md changelog/_current-preversion.md businesses/ai-ta-krajta/aiTaKrajtaPeople.ts businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 202ms:
diff --git a/AGENTS.md b/AGENTS.md
index d000c5f..36e3a85 100644
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -57,7 +57,7 @@ use cases, and audiences. Keep these rules current when behavior changes.
   zoom only when reduced motion is not requested. A future person without a photo
   keeps initials on that same background. The one people list is drawn anew
   for every visit, weighted by how many episodes of the archive name each
-  person, so somebody heard often comes up high far more often than someone in
+  person after their roster factor is applied (one by default), so somebody heard often comes up high far more often than someone in
   one díl without the list ever becoming a ranking. The draw is local state and
   is made in the browser; the page itself is built in the order the draw leans
   towards, from the most often named person to the least often named one, so the
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
index 409d1ca..1f29848 100644
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
@@ -33,6 +33,18 @@ describe('getAiTaKrajtaPersonPhotoPath', () => {
 });
 
 describe('AI_TA_KRAJTA_PEOPLE', () => {
+    it('sets the requested episode-appearance factors', () => {
+        const factoredPeople = AI_TA_KRAJTA_PEOPLE.filter((person) => person.factor !== undefined).map(
+            ({ id, factor }) => ({ id, factor }),
+        );
+
+        expect(factoredPeople).toEqual([
+            { id: 'pavol-hejny', factor: 0.8 },
+            { id: 'katka-fajmanova', factor: 1.7 },
+            { id: 'tomas-mikolov', factor: 5 },
+        ]);
+    });
+
     // Note: A portrait which is only named and never cut breaks in the browser and nowhere else, which is why the
     //       roster is read against `public` here rather than trusted.
     it.each(AI_TA_KRAJTA_PEOPLE)(
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
index 7c41d07..d4d59c6 100644
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
@@ -13,6 +13,14 @@ export type AiTaKrajtaPerson = {
 
     readonly name: string;
 
+    /**
+     * Multiplier of this person's credited episode appearances when the roster is drawn
+     *
+     * Note: Omitting it keeps the ordinary factor of one. It affects only the chance of a person appearing near the
+     *       front of the roster; episode counts themselves stay exact.
+     */
+    readonly factor?: number;
+
     /**
      * What the person does, in one line and only as far as the episodes of the show actually say it
      */
@@ -60,6 +68,7 @@ export const AI_TA_KRAJTA_PEOPLE: readonly AiTaKrajtaPerson[] = [
     {
         id: 'pavol-hejny',
         name: 'Pavol Hejný',
+        factor: 0.8,
         headline: 'AI konzultant a vývojář. Staví AI agenty a v dílech je rozebírá z praxe.',
         url: 'https://www.ptbk.io/pavol',
         photoFileName: 'pavol-hejny.png',
@@ -128,6 +137,7 @@ export const AI_TA_KRAJTA_PEOPLE: readonly AiTaKrajtaPerson[] = [
     {
         id: 'katka-fajmanova',
         name: 'Katka Fajmanová',
+        factor: 1.7,
         headline: 'Architektura a interpretabilita modelů. Díl o tom, co se děje uvnitř sítě.',
         url: null,
         photoFileName: 'katka-fajmanova.png',
@@ -239,6 +249,7 @@ export const AI_TA_KRAJTA_PEOPLE: readonly AiTaKrajtaPerson[] = [
     {
         id: 'tomas-mikolov',
         name: 'Tomáš Mikolov',
+        factor: 5,
         headline: 'Spoluzakladatel BottleCap AI. V Googlu zažil doby, kdy se stavěly základy dnešních modelů.',
         url: 'https://bottlecapai.com/',
         photoFileName: 'tomas-mikolov.png',
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
index eab515d..c074153 100644
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
@@ -10,10 +10,11 @@ import { describe, expect, it } from 'vitest';
  */
 const DRAW_COUNT = 500;
 
-function createPerson(id: string): AiTaKrajtaPerson {
+function createPerson(id: string, factor?: number): AiTaKrajtaPerson {
     return {
         id,
         name: id,
+        factor,
         headline: 'Mluví do mikrofonu.',
         url: null,
         photoFileName: null,
@@ -68,6 +69,26 @@ describe('orderAiTaKrajtaPeopleByAppearances', () => {
         expect(ordered.map((person) => person.id)).toEqual(PEOPLE.map((person) => person.id));
     });
 
+    it('multiplies credited episode appearances by a person factor', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('frequent-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['frequent-contributor', 4],
+        ]);
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, episodeCountByPersonId);
+
+        expect(ordered.map((person) => person.id)).toEqual(['boosted-contributor', 'frequent-contributor']);
+    });
+
+    it('does not apply a person factor to the base chance without credited appearances', () => {
+        const people = [createPerson('ordinary-contributor'), createPerson('boosted-contributor', 5)];
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, new Map());
+
+        expect(ordered.map((person) => person.id)).toEqual(['ordinary-contributor', 'boosted-contributor']);
+    });
+
     it('leaves the roster it was given alone', () => {
         orderAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID);
 
@@ -102,6 +123,24 @@ describe('shuffleAiTaKrajtaPeopleByAppearances', () => {
         expect(frequentContributorTopCount).toBeLessThan(DRAW_COUNT);
     });
 
+    it('uses a person factor when drawing the weighted order', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('ordinary-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['ordinary-contributor', 1],
+        ]);
+        const randomNumbers = [0.1, 0.2];
+        let nextRandomNumberIndex = 0;
+
+        const shuffled = shuffleAiTaKrajtaPeopleByAppearances(
+            people,
+            episodeCountByPersonId,
+            () => randomNumbers[nextRandomNumberIndex++]!,
+        );
+
+        expect(shuffled.map((person) => person.id)).toEqual(['boosted-contributor', 'ordinary-contributor']);
+    });
+
     it('moves even somebody the archive never names around the list', () => {
         const placesOfNeverNamed = collectPlacesByPersonId().get('never-named')!;
 
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
index 516fd72..9e76389 100644
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
@@ -10,11 +10,25 @@ import { shuffleByWeight } from '@/lib/random/shuffleByWeight';
  */
 const BASE_PERSON_WEIGHT = 1;
 
+/**
+ * Multiplier used for a person whose roster entry does not set one
+ */
+const DEFAULT_PERSON_FACTOR = 1;
+
+/**
+ * Multiplier of a person's credited episode appearances when drawing the roster
+ */
+function getPersonFactor(person: AiTaKrajtaPerson): number {
+    return person.factor ?? DEFAULT_PERSON_FACTOR;
+}
+
 /**
  * How much of the front of the list one person has a chance at, which is how often the show has them on
  */
 function getPersonWeight(person: AiTaKrajtaPerson, episodeCountByPersonId: ReadonlyMap<string, number>): number {
-    return BASE_PERSON_WEIGHT + (episodeCountByPersonId.get(person.id) ?? 0);
+    const episodeCount = episodeCountByPersonId.get(person.id) ?? 0;
+
+    return BASE_PERSON_WEIGHT + episodeCount * getPersonFactor(person);
 }
 
 /**
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 83d8b0f..af4c583 100644
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,5 +1,9 @@
 # Current preversion
 
+- Added per-host episode-appearance factors to the `/ai-ta-krajta` roster draw. Hosts still default to their exact
+  episode count, while Katka Fajmanová receives 1.7×, Tomáš Mikolov 5×, and Pavol Hejný 0.8× before weighted ordering.
+  The shared calculation affects both the hydration-safe initial order and each visitor's fresh randomized draw.
+
 - Added `Dneska` and `Zítra` event badges ahead of `Tento týden`, based on Prague calendar dates. Shared cards,
   calendars, landing-page term choices, and the admin picker use the same phases and theme-aware colours. Terms
   still switch to `Probíhá` at their start and remain eligible for waiting-room choices and follow-up recommendations.

diff --git a/AGENTS.md b/AGENTS.md
index d000c5fd0c0fe752490b216922648f5e0d80e798..36e3a8519ecd39f0d8a925d8e7f8821c50be6e4c
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -57,7 +57,7 @@
   zoom only when reduced motion is not requested. A future person without a photo
   keeps initials on that same background. The one people list is drawn anew
   for every visit, weighted by how many episodes of the archive name each
-  person, so somebody heard often comes up high far more often than someone in
+  person after their roster factor is applied (one by default), so somebody heard often comes up high far more often than someone in
   one díl without the list ever becoming a ranking. The draw is local state and
   is made in the browser; the page itself is built in the order the draw leans
   towards, from the most often named person to the least often named one, so the
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
index 409d1caf0bc77cb7adf64cb527b4050f6b73369e..1f2984898a11cb0555b41680c6114d0e1f2ecad1
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
@@ -33,6 +33,18 @@
 });
 
 describe('AI_TA_KRAJTA_PEOPLE', () => {
+    it('sets the requested episode-appearance factors', () => {
+        const factoredPeople = AI_TA_KRAJTA_PEOPLE.filter((person) => person.factor !== undefined).map(
+            ({ id, factor }) => ({ id, factor }),
+        );
+
+        expect(factoredPeople).toEqual([
+            { id: 'pavol-hejny', factor: 0.8 },
+            { id: 'katka-fajmanova', factor: 1.7 },
+            { id: 'tomas-mikolov', factor: 5 },
+        ]);
+    });
+
     // Note: A portrait which is only named and never cut breaks in the browser and nowhere else, which is why the
     //       roster is read against `public` here rather than trusted.
     it.each(AI_TA_KRAJTA_PEOPLE)(
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
index 7c41d07a8690c6d211fd32ab581dbc9b654b7cad..d4d59c6a380035522099d63172eedb3c10ee16e6
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
@@ -14,6 +14,14 @@
     readonly name: string;
 
     /**
+     * Multiplier of this person's credited episode appearances when the roster is drawn
+     *
+     * Note: Omitting it keeps the ordinary factor of one. It affects only the chance of a person appearing near the
+     *       front of the roster; episode counts themselves stay exact.
+     */
+    readonly factor?: number;
+
+    /**
      * What the person does, in one line and only as far as the episodes of the show actually say it
      */
     readonly headline: string;
@@ -60,6 +68,7 @@
     {
         id: 'pavol-hejny',
         name: 'Pavol Hejný',
+        factor: 0.8,
         headline: 'AI konzultant a vývojář. Staví AI agenty a v dílech je rozebírá z praxe.',
         url: 'https://www.ptbk.io/pavol',
         photoFileName: 'pavol-hejny.png',
@@ -128,6 +137,7 @@
     {
         id: 'katka-fajmanova',
         name: 'Katka Fajmanová',
+        factor: 1.7,
         headline: 'Architektura a interpretabilita modelů. Díl o tom, co se děje uvnitř sítě.',
         url: null,
         photoFileName: 'katka-fajmanova.png',
@@ -239,6 +249,7 @@
     {
         id: 'tomas-mikolov',
         name: 'Tomáš Mikolov',
+        factor: 5,
         headline: 'Spoluzakladatel BottleCap AI. V Googlu zažil doby, kdy se stavěly základy dnešních modelů.',
         url: 'https://bottlecapai.com/',
         photoFileName: 'tomas-mikolov.png',
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
index eab515daf7a3dec85b218da514a41326b7e6675f..c074153e99ba597c811d828a5856efcd6ae72a8d
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
@@ -10,10 +10,11 @@
  */
 const DRAW_COUNT = 500;
 
-function createPerson(id: string): AiTaKrajtaPerson {
+function createPerson(id: string, factor?: number): AiTaKrajtaPerson {
     return {
         id,
         name: id,
+        factor,
         headline: 'Mluví do mikrofonu.',
         url: null,
         photoFileName: null,
@@ -68,6 +69,26 @@
         expect(ordered.map((person) => person.id)).toEqual(PEOPLE.map((person) => person.id));
     });
 
+    it('multiplies credited episode appearances by a person factor', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('frequent-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['frequent-contributor', 4],
+        ]);
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, episodeCountByPersonId);
+
+        expect(ordered.map((person) => person.id)).toEqual(['boosted-contributor', 'frequent-contributor']);
+    });
+
+    it('does not apply a person factor to the base chance without credited appearances', () => {
+        const people = [createPerson('ordinary-contributor'), createPerson('boosted-contributor', 5)];
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, new Map());
+
+        expect(ordered.map((person) => person.id)).toEqual(['ordinary-contributor', 'boosted-contributor']);
+    });
+
     it('leaves the roster it was given alone', () => {
         orderAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID);
 
@@ -102,6 +123,24 @@
         expect(frequentContributorTopCount).toBeLessThan(DRAW_COUNT);
     });
 
+    it('uses a person factor when drawing the weighted order', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('ordinary-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['ordinary-contributor', 1],
+        ]);
+        const randomNumbers = [0.1, 0.2];
+        let nextRandomNumberIndex = 0;
+
+        const shuffled = shuffleAiTaKrajtaPeopleByAppearances(
+            people,
+            episodeCountByPersonId,
+            () => randomNumbers[nextRandomNumberIndex++]!,
+        );
+
+        expect(shuffled.map((person) => person.id)).toEqual(['boosted-contributor', 'ordinary-contributor']);
+    });
+
     it('moves even somebody the archive never names around the list', () => {
         const placesOfNeverNamed = collectPlacesByPersonId().get('never-named')!;
 
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
index 516fd7222668e8843dd2c2b7e0a5224b5f990a3b..9e76389fc328b90c835b4a82dd5f94c1ec3ca8ea
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
@@ -11,10 +11,24 @@
 const BASE_PERSON_WEIGHT = 1;
 
 /**
+ * Multiplier used for a person whose roster entry does not set one
+ */
+const DEFAULT_PERSON_FACTOR = 1;
+
+/**
+ * Multiplier of a person's credited episode appearances when drawing the roster
+ */
+function getPersonFactor(person: AiTaKrajtaPerson): number {
+    return person.factor ?? DEFAULT_PERSON_FACTOR;
+}
+
+/**
  * How much of the front of the list one person has a chance at, which is how often the show has them on
  */
 function getPersonWeight(person: AiTaKrajtaPerson, episodeCountByPersonId: ReadonlyMap<string, number>): number {
-    return BASE_PERSON_WEIGHT + (episodeCountByPersonId.get(person.id) ?? 0);
+    const episodeCount = episodeCountByPersonId.get(person.id) ?? 0;
+
+    return BASE_PERSON_WEIGHT + episodeCount * getPersonFactor(person);
 }
 
 /**
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 83d8b0f693509e0926ab81b0ce15225503d91f9c..af4c5838b8655f74fa88c2bb085da45e78ef7274
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,5 +1,9 @@
 # Current preversion
 
+- Added per-host episode-appearance factors to the `/ai-ta-krajta` roster draw. Hosts still default to their exact
+  episode count, while Katka Fajmanová receives 1.7×, Tomáš Mikolov 5×, and Pavol Hejný 0.8× before weighted ordering.
+  The shared calculation affects both the hydration-safe initial order and each visitor's fresh randomized draw.
+
 - Added `Dneska` and `Zítra` event badges ahead of `Tento týden`, based on Prague calendar dates. Shared cards,
   calendars, landing-page term choices, and the admin picker use the same phases and theme-aware colours. Terms
   still switch to `Probíhá` at their start and remain eligible for waiting-room choices and follow-up recommendations.

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command 'rg -n "exactOptionalPropertyTypes|strict" tsconfig.json' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 166ms:
11:    "strict": true,

diff --git a/AGENTS.md b/AGENTS.md
index d000c5fd0c0fe752490b216922648f5e0d80e798..36e3a8519ecd39f0d8a925d8e7f8821c50be6e4c
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -57,7 +57,7 @@
   zoom only when reduced motion is not requested. A future person without a photo
   keeps initials on that same background. The one people list is drawn anew
   for every visit, weighted by how many episodes of the archive name each
-  person, so somebody heard often comes up high far more often than someone in
+  person after their roster factor is applied (one by default), so somebody heard often comes up high far more often than someone in
   one díl without the list ever becoming a ranking. The draw is local state and
   is made in the browser; the page itself is built in the order the draw leans
   towards, from the most often named person to the least often named one, so the
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
index 409d1caf0bc77cb7adf64cb527b4050f6b73369e..1f2984898a11cb0555b41680c6114d0e1f2ecad1
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
@@ -33,6 +33,18 @@
 });
 
 describe('AI_TA_KRAJTA_PEOPLE', () => {
+    it('sets the requested episode-appearance factors', () => {
+        const factoredPeople = AI_TA_KRAJTA_PEOPLE.filter((person) => person.factor !== undefined).map(
+            ({ id, factor }) => ({ id, factor }),
+        );
+
+        expect(factoredPeople).toEqual([
+            { id: 'pavol-hejny', factor: 0.8 },
+            { id: 'katka-fajmanova', factor: 1.7 },
+            { id: 'tomas-mikolov', factor: 5 },
+        ]);
+    });
+
     // Note: A portrait which is only named and never cut breaks in the browser and nowhere else, which is why the
     //       roster is read against `public` here rather than trusted.
     it.each(AI_TA_KRAJTA_PEOPLE)(
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
index 7c41d07a8690c6d211fd32ab581dbc9b654b7cad..d4d59c6a380035522099d63172eedb3c10ee16e6
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
@@ -14,6 +14,14 @@
     readonly name: string;
 
     /**
+     * Multiplier of this person's credited episode appearances when the roster is drawn
+     *
+     * Note: Omitting it keeps the ordinary factor of one. It affects only the chance of a person appearing near the
+     *       front of the roster; episode counts themselves stay exact.
+     */
+    readonly factor?: number;
+
+    /**
      * What the person does, in one line and only as far as the episodes of the show actually say it
      */
     readonly headline: string;
@@ -60,6 +68,7 @@
     {
         id: 'pavol-hejny',
         name: 'Pavol Hejný',
+        factor: 0.8,
         headline: 'AI konzultant a vývojář. Staví AI agenty a v dílech je rozebírá z praxe.',
         url: 'https://www.ptbk.io/pavol',
         photoFileName: 'pavol-hejny.png',
@@ -128,6 +137,7 @@
     {
         id: 'katka-fajmanova',
         name: 'Katka Fajmanová',
+        factor: 1.7,
         headline: 'Architektura a interpretabilita modelů. Díl o tom, co se děje uvnitř sítě.',
         url: null,
         photoFileName: 'katka-fajmanova.png',
@@ -239,6 +249,7 @@
     {
         id: 'tomas-mikolov',
         name: 'Tomáš Mikolov',
+        factor: 5,
         headline: 'Spoluzakladatel BottleCap AI. V Googlu zažil doby, kdy se stavěly základy dnešních modelů.',
         url: 'https://bottlecapai.com/',
         photoFileName: 'tomas-mikolov.png',
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
index eab515daf7a3dec85b218da514a41326b7e6675f..c074153e99ba597c811d828a5856efcd6ae72a8d
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
@@ -10,10 +10,11 @@
  */
 const DRAW_COUNT = 500;
 
-function createPerson(id: string): AiTaKrajtaPerson {
+function createPerson(id: string, factor?: number): AiTaKrajtaPerson {
     return {
         id,
         name: id,
+        factor,
         headline: 'Mluví do mikrofonu.',
         url: null,
         photoFileName: null,
@@ -68,6 +69,26 @@
         expect(ordered.map((person) => person.id)).toEqual(PEOPLE.map((person) => person.id));
     });
 
+    it('multiplies credited episode appearances by a person factor', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('frequent-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['frequent-contributor', 4],
+        ]);
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, episodeCountByPersonId);
+
+        expect(ordered.map((person) => person.id)).toEqual(['boosted-contributor', 'frequent-contributor']);
+    });
+
+    it('does not apply a person factor to the base chance without credited appearances', () => {
+        const people = [createPerson('ordinary-contributor'), createPerson('boosted-contributor', 5)];
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, new Map());
+
+        expect(ordered.map((person) => person.id)).toEqual(['ordinary-contributor', 'boosted-contributor']);
+    });
+
     it('leaves the roster it was given alone', () => {
         orderAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID);
 
@@ -102,6 +123,24 @@
         expect(frequentContributorTopCount).toBeLessThan(DRAW_COUNT);
     });
 
+    it('uses a person factor when drawing the weighted order', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('ordinary-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['ordinary-contributor', 1],
+        ]);
+        const randomNumbers = [0.1, 0.2];
+        let nextRandomNumberIndex = 0;
+
+        const shuffled = shuffleAiTaKrajtaPeopleByAppearances(
+            people,
+            episodeCountByPersonId,
+            () => randomNumbers[nextRandomNumberIndex++]!,
+        );
+
+        expect(shuffled.map((person) => person.id)).toEqual(['boosted-contributor', 'ordinary-contributor']);
+    });
+
     it('moves even somebody the archive never names around the list', () => {
         const placesOfNeverNamed = collectPlacesByPersonId().get('never-named')!;
 
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
index 516fd7222668e8843dd2c2b7e0a5224b5f990a3b..9e76389fc328b90c835b4a82dd5f94c1ec3ca8ea
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
@@ -11,10 +11,24 @@
 const BASE_PERSON_WEIGHT = 1;
 
 /**
+ * Multiplier used for a person whose roster entry does not set one
+ */
+const DEFAULT_PERSON_FACTOR = 1;
+
+/**
+ * Multiplier of a person's credited episode appearances when drawing the roster
+ */
+function getPersonFactor(person: AiTaKrajtaPerson): number {
+    return person.factor ?? DEFAULT_PERSON_FACTOR;
+}
+
+/**
  * How much of the front of the list one person has a chance at, which is how often the show has them on
  */
 function getPersonWeight(person: AiTaKrajtaPerson, episodeCountByPersonId: ReadonlyMap<string, number>): number {
-    return BASE_PERSON_WEIGHT + (episodeCountByPersonId.get(person.id) ?? 0);
+    const episodeCount = episodeCountByPersonId.get(person.id) ?? 0;
+
+    return BASE_PERSON_WEIGHT + episodeCount * getPersonFactor(person);
 }
 
 /**
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 83d8b0f693509e0926ab81b0ce15225503d91f9c..af4c5838b8655f74fa88c2bb085da45e78ef7274
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,5 +1,9 @@
 # Current preversion
 
+- Added per-host episode-appearance factors to the `/ai-ta-krajta` roster draw. Hosts still default to their exact
+  episode count, while Katka Fajmanová receives 1.7×, Tomáš Mikolov 5×, and Pavol Hejný 0.8× before weighted ordering.
+  The shared calculation affects both the hydration-safe initial order and each visitor's fresh randomized draw.
+
 - Added `Dneska` and `Zítra` event badges ahead of `Tento týden`, based on Prague calendar dates. Shared cards,
   calendars, landing-page term choices, and the admin picker use the same phases and theme-aware colours. Terms
   still switch to `Probíhá` at their start and remain eligible for waiting-room choices and follow-up recommendations.

codex
Focused unit coverage now verifies the three configured values, the default behavior, the multiplication rule, and its use in the actual weighted shuffle. The relevant 42 tests pass; I’m doing the repository’s lint/type-oriented checks next and will correct any integration issue they expose.
apply patch
patch: completed
C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron\AGENTS.md
diff --git a/AGENTS.md b/AGENTS.md
index d000c5fd0c0fe752490b216922648f5e0d80e798..48cff802c904a42423498e64acfd3d8115bacb73
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -57,8 +57,8 @@
   zoom only when reduced motion is not requested. A future person without a photo
   keeps initials on that same background. The one people list is drawn anew
   for every visit, weighted by how many episodes of the archive name each
-  person, so somebody heard often comes up high far more often than someone in
-  one díl without the list ever becoming a ranking. The draw is local state and
+  person after their roster factor is applied (one by default), so somebody heard
+  often comes up high far more often than someone in one díl without the list ever becoming a ranking. The draw is local state and
   is made in the browser; the page itself is built in the order the draw leans
   towards, from the most often named person to the least often named one, so the
   browser hydrates into the list it was sent.
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
index 409d1caf0bc77cb7adf64cb527b4050f6b73369e..1f2984898a11cb0555b41680c6114d0e1f2ecad1
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
@@ -33,6 +33,18 @@
 });
 
 describe('AI_TA_KRAJTA_PEOPLE', () => {
+    it('sets the requested episode-appearance factors', () => {
+        const factoredPeople = AI_TA_KRAJTA_PEOPLE.filter((person) => person.factor !== undefined).map(
+            ({ id, factor }) => ({ id, factor }),
+        );
+
+        expect(factoredPeople).toEqual([
+            { id: 'pavol-hejny', factor: 0.8 },
+            { id: 'katka-fajmanova', factor: 1.7 },
+            { id: 'tomas-mikolov', factor: 5 },
+        ]);
+    });
+
     // Note: A portrait which is only named and never cut breaks in the browser and nowhere else, which is why the
     //       roster is read against `public` here rather than trusted.
     it.each(AI_TA_KRAJTA_PEOPLE)(
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
index 7c41d07a8690c6d211fd32ab581dbc9b654b7cad..d4d59c6a380035522099d63172eedb3c10ee16e6
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
@@ -14,6 +14,14 @@
     readonly name: string;
 
     /**
+     * Multiplier of this person's credited episode appearances when the roster is drawn
+     *
+     * Note: Omitting it keeps the ordinary factor of one. It affects only the chance of a person appearing near the
+     *       front of the roster; episode counts themselves stay exact.
+     */
+    readonly factor?: number;
+
+    /**
      * What the person does, in one line and only as far as the episodes of the show actually say it
      */
     readonly headline: string;
@@ -60,6 +68,7 @@
     {
         id: 'pavol-hejny',
         name: 'Pavol Hejný',
+        factor: 0.8,
         headline: 'AI konzultant a vývojář. Staví AI agenty a v dílech je rozebírá z praxe.',
         url: 'https://www.ptbk.io/pavol',
         photoFileName: 'pavol-hejny.png',
@@ -128,6 +137,7 @@
     {
         id: 'katka-fajmanova',
         name: 'Katka Fajmanová',
+        factor: 1.7,
         headline: 'Architektura a interpretabilita modelů. Díl o tom, co se děje uvnitř sítě.',
         url: null,
         photoFileName: 'katka-fajmanova.png',
@@ -239,6 +249,7 @@
     {
         id: 'tomas-mikolov',
         name: 'Tomáš Mikolov',
+        factor: 5,
         headline: 'Spoluzakladatel BottleCap AI. V Googlu zažil doby, kdy se stavěly základy dnešních modelů.',
         url: 'https://bottlecapai.com/',
         photoFileName: 'tomas-mikolov.png',
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
index eab515daf7a3dec85b218da514a41326b7e6675f..c074153e99ba597c811d828a5856efcd6ae72a8d
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
@@ -10,10 +10,11 @@
  */
 const DRAW_COUNT = 500;
 
-function createPerson(id: string): AiTaKrajtaPerson {
+function createPerson(id: string, factor?: number): AiTaKrajtaPerson {
     return {
         id,
         name: id,
+        factor,
         headline: 'Mluví do mikrofonu.',
         url: null,
         photoFileName: null,
@@ -68,6 +69,26 @@
         expect(ordered.map((person) => person.id)).toEqual(PEOPLE.map((person) => person.id));
     });
 
+    it('multiplies credited episode appearances by a person factor', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('frequent-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['frequent-contributor', 4],
+        ]);
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, episodeCountByPersonId);
+
+        expect(ordered.map((person) => person.id)).toEqual(['boosted-contributor', 'frequent-contributor']);
+    });
+
+    it('does not apply a person factor to the base chance without credited appearances', () => {
+        const people = [createPerson('ordinary-contributor'), createPerson('boosted-contributor', 5)];
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, new Map());
+
+        expect(ordered.map((person) => person.id)).toEqual(['ordinary-contributor', 'boosted-contributor']);
+    });
+
     it('leaves the roster it was given alone', () => {
         orderAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID);
 
@@ -102,6 +123,24 @@
         expect(frequentContributorTopCount).toBeLessThan(DRAW_COUNT);
     });
 
+    it('uses a person factor when drawing the weighted order', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('ordinary-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['ordinary-contributor', 1],
+        ]);
+        const randomNumbers = [0.1, 0.2];
+        let nextRandomNumberIndex = 0;
+
+        const shuffled = shuffleAiTaKrajtaPeopleByAppearances(
+            people,
+            episodeCountByPersonId,
+            () => randomNumbers[nextRandomNumberIndex++]!,
+        );
+
+        expect(shuffled.map((person) => person.id)).toEqual(['boosted-contributor', 'ordinary-contributor']);
+    });
+
     it('moves even somebody the archive never names around the list', () => {
         const placesOfNeverNamed = collectPlacesByPersonId().get('never-named')!;
 
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
index 516fd7222668e8843dd2c2b7e0a5224b5f990a3b..9e76389fc328b90c835b4a82dd5f94c1ec3ca8ea
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
@@ -11,10 +11,24 @@
 const BASE_PERSON_WEIGHT = 1;
 
 /**
+ * Multiplier used for a person whose roster entry does not set one
+ */
+const DEFAULT_PERSON_FACTOR = 1;
+
+/**
+ * Multiplier of a person's credited episode appearances when drawing the roster
+ */
+function getPersonFactor(person: AiTaKrajtaPerson): number {
+    return person.factor ?? DEFAULT_PERSON_FACTOR;
+}
+
+/**
  * How much of the front of the list one person has a chance at, which is how often the show has them on
  */
 function getPersonWeight(person: AiTaKrajtaPerson, episodeCountByPersonId: ReadonlyMap<string, number>): number {
-    return BASE_PERSON_WEIGHT + (episodeCountByPersonId.get(person.id) ?? 0);
+    const episodeCount = episodeCountByPersonId.get(person.id) ?? 0;
+
+    return BASE_PERSON_WEIGHT + episodeCount * getPersonFactor(person);
 }
 
 /**
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 83d8b0f693509e0926ab81b0ce15225503d91f9c..af4c5838b8655f74fa88c2bb085da45e78ef7274
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,5 +1,9 @@
 # Current preversion
 
+- Added per-host episode-appearance factors to the `/ai-ta-krajta` roster draw. Hosts still default to their exact
+  episode count, while Katka Fajmanová receives 1.7×, Tomáš Mikolov 5×, and Pavol Hejný 0.8× before weighted ordering.
+  The shared calculation affects both the hydration-safe initial order and each visitor's fresh randomized draw.
+
 - Added `Dneska` and `Zítra` event badges ahead of `Tento týden`, based on Prague calendar dates. Shared cards,
   calendars, landing-page term choices, and the admin picker use the same phases and theme-aware colours. Terms
   still switch to `Probíhá` at their start and remain eligible for waiting-room choices and follow-up recommendations.

diff --git a/AGENTS.md b/AGENTS.md
index d000c5fd0c0fe752490b216922648f5e0d80e798..48cff802c904a42423498e64acfd3d8115bacb73
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -57,8 +57,8 @@
   zoom only when reduced motion is not requested. A future person without a photo
   keeps initials on that same background. The one people list is drawn anew
   for every visit, weighted by how many episodes of the archive name each
-  person, so somebody heard often comes up high far more often than someone in
-  one díl without the list ever becoming a ranking. The draw is local state and
+  person after their roster factor is applied (one by default), so somebody heard
+  often comes up high far more often than someone in one díl without the list ever becoming a ranking. The draw is local state and
   is made in the browser; the page itself is built in the order the draw leans
   towards, from the most often named person to the least often named one, so the
   browser hydrates into the list it was sent.
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
index 409d1caf0bc77cb7adf64cb527b4050f6b73369e..1f2984898a11cb0555b41680c6114d0e1f2ecad1
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
@@ -33,6 +33,18 @@
 });
 
 describe('AI_TA_KRAJTA_PEOPLE', () => {
+    it('sets the requested episode-appearance factors', () => {
+        const factoredPeople = AI_TA_KRAJTA_PEOPLE.filter((person) => person.factor !== undefined).map(
+            ({ id, factor }) => ({ id, factor }),
+        );
+
+        expect(factoredPeople).toEqual([
+            { id: 'pavol-hejny', factor: 0.8 },
+            { id: 'katka-fajmanova', factor: 1.7 },
+            { id: 'tomas-mikolov', factor: 5 },
+        ]);
+    });
+
     // Note: A portrait which is only named and never cut breaks in the browser and nowhere else, which is why the
     //       roster is read against `public` here rather than trusted.
     it.each(AI_TA_KRAJTA_PEOPLE)(
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
index 7c41d07a8690c6d211fd32ab581dbc9b654b7cad..d4d59c6a380035522099d63172eedb3c10ee16e6
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
@@ -14,6 +14,14 @@
     readonly name: string;
 
     /**
+     * Multiplier of this person's credited episode appearances when the roster is drawn
+     *
+     * Note: Omitting it keeps the ordinary factor of one. It affects only the chance of a person appearing near the
+     *       front of the roster; episode counts themselves stay exact.
+     */
+    readonly factor?: number;
+
+    /**
      * What the person does, in one line and only as far as the episodes of the show actually say it
      */
     readonly headline: string;
@@ -60,6 +68,7 @@
     {
         id: 'pavol-hejny',
         name: 'Pavol Hejný',
+        factor: 0.8,
         headline: 'AI konzultant a vývojář. Staví AI agenty a v dílech je rozebírá z praxe.',
         url: 'https://www.ptbk.io/pavol',
         photoFileName: 'pavol-hejny.png',
@@ -128,6 +137,7 @@
     {
         id: 'katka-fajmanova',
         name: 'Katka Fajmanová',
+        factor: 1.7,
         headline: 'Architektura a interpretabilita modelů. Díl o tom, co se děje uvnitř sítě.',
         url: null,
         photoFileName: 'katka-fajmanova.png',
@@ -239,6 +249,7 @@
     {
         id: 'tomas-mikolov',
         name: 'Tomáš Mikolov',
+        factor: 5,
         headline: 'Spoluzakladatel BottleCap AI. V Googlu zažil doby, kdy se stavěly základy dnešních modelů.',
         url: 'https://bottlecapai.com/',
         photoFileName: 'tomas-mikolov.png',
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
index eab515daf7a3dec85b218da514a41326b7e6675f..c074153e99ba597c811d828a5856efcd6ae72a8d
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
@@ -10,10 +10,11 @@
  */
 const DRAW_COUNT = 500;
 
-function createPerson(id: string): AiTaKrajtaPerson {
+function createPerson(id: string, factor?: number): AiTaKrajtaPerson {
     return {
         id,
         name: id,
+        factor,
         headline: 'Mluví do mikrofonu.',
         url: null,
         photoFileName: null,
@@ -68,6 +69,26 @@
         expect(ordered.map((person) => person.id)).toEqual(PEOPLE.map((person) => person.id));
     });
 
+    it('multiplies credited episode appearances by a person factor', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('frequent-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['frequent-contributor', 4],
+        ]);
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, episodeCountByPersonId);
+
+        expect(ordered.map((person) => person.id)).toEqual(['boosted-contributor', 'frequent-contributor']);
+    });
+
+    it('does not apply a person factor to the base chance without credited appearances', () => {
+        const people = [createPerson('ordinary-contributor'), createPerson('boosted-contributor', 5)];
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, new Map());
+
+        expect(ordered.map((person) => person.id)).toEqual(['ordinary-contributor', 'boosted-contributor']);
+    });
+
     it('leaves the roster it was given alone', () => {
         orderAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID);
 
@@ -102,6 +123,24 @@
         expect(frequentContributorTopCount).toBeLessThan(DRAW_COUNT);
     });
 
+    it('uses a person factor when drawing the weighted order', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('ordinary-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['ordinary-contributor', 1],
+        ]);
+        const randomNumbers = [0.1, 0.2];
+        let nextRandomNumberIndex = 0;
+
+        const shuffled = shuffleAiTaKrajtaPeopleByAppearances(
+            people,
+            episodeCountByPersonId,
+            () => randomNumbers[nextRandomNumberIndex++]!,
+        );
+
+        expect(shuffled.map((person) => person.id)).toEqual(['boosted-contributor', 'ordinary-contributor']);
+    });
+
     it('moves even somebody the archive never names around the list', () => {
         const placesOfNeverNamed = collectPlacesByPersonId().get('never-named')!;
 
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
index 516fd7222668e8843dd2c2b7e0a5224b5f990a3b..9e76389fc328b90c835b4a82dd5f94c1ec3ca8ea
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
@@ -11,10 +11,24 @@
 const BASE_PERSON_WEIGHT = 1;
 
 /**
+ * Multiplier used for a person whose roster entry does not set one
+ */
+const DEFAULT_PERSON_FACTOR = 1;
+
+/**
+ * Multiplier of a person's credited episode appearances when drawing the roster
+ */
+function getPersonFactor(person: AiTaKrajtaPerson): number {
+    return person.factor ?? DEFAULT_PERSON_FACTOR;
+}
+
+/**
  * How much of the front of the list one person has a chance at, which is how often the show has them on
  */
 function getPersonWeight(person: AiTaKrajtaPerson, episodeCountByPersonId: ReadonlyMap<string, number>): number {
-    return BASE_PERSON_WEIGHT + (episodeCountByPersonId.get(person.id) ?? 0);
+    const episodeCount = episodeCountByPersonId.get(person.id) ?? 0;
+
+    return BASE_PERSON_WEIGHT + episodeCount * getPersonFactor(person);
 }
 
 /**
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 83d8b0f693509e0926ab81b0ce15225503d91f9c..af4c5838b8655f74fa88c2bb085da45e78ef7274
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,5 +1,9 @@
 # Current preversion
 
+- Added per-host episode-appearance factors to the `/ai-ta-krajta` roster draw. Hosts still default to their exact
+  episode count, while Katka Fajmanová receives 1.7×, Tomáš Mikolov 5×, and Pavol Hejný 0.8× before weighted ordering.
+  The shared calculation affects both the hydration-safe initial order and each visitor's fresh randomized draw.
+
 - Added `Dneska` and `Zítra` event badges ahead of `Tento týden`, based on Prague calendar dates. Shared cards,
   calendars, landing-page term choices, and the admin picker use the same phases and theme-aware colours. Terms
   still switch to `Probíhá` at their start and remain eligible for waiting-room choices and follow-up recommendations.

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command 'npm run lint' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 26003ms:

> promptbook-landing-page@0.1.0 lint
> next lint


./components/public-web-page-preview-image.tsx
33:13  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules

diff --git a/AGENTS.md b/AGENTS.md
index d000c5fd0c0fe752490b216922648f5e0d80e798..48cff802c904a42423498e64acfd3d8115bacb73
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -57,8 +57,8 @@
   zoom only when reduced motion is not requested. A future person without a photo
   keeps initials on that same background. The one people list is drawn anew
   for every visit, weighted by how many episodes of the archive name each
-  person, so somebody heard often comes up high far more often than someone in
-  one díl without the list ever becoming a ranking. The draw is local state and
+  person after their roster factor is applied (one by default), so somebody heard
+  often comes up high far more often than someone in one díl without the list ever becoming a ranking. The draw is local state and
   is made in the browser; the page itself is built in the order the draw leans
   towards, from the most often named person to the least often named one, so the
   browser hydrates into the list it was sent.
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
index 409d1caf0bc77cb7adf64cb527b4050f6b73369e..1f2984898a11cb0555b41680c6114d0e1f2ecad1
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
@@ -33,6 +33,18 @@
 });
 
 describe('AI_TA_KRAJTA_PEOPLE', () => {
+    it('sets the requested episode-appearance factors', () => {
+        const factoredPeople = AI_TA_KRAJTA_PEOPLE.filter((person) => person.factor !== undefined).map(
+            ({ id, factor }) => ({ id, factor }),
+        );
+
+        expect(factoredPeople).toEqual([
+            { id: 'pavol-hejny', factor: 0.8 },
+            { id: 'katka-fajmanova', factor: 1.7 },
+            { id: 'tomas-mikolov', factor: 5 },
+        ]);
+    });
+
     // Note: A portrait which is only named and never cut breaks in the browser and nowhere else, which is why the
     //       roster is read against `public` here rather than trusted.
     it.each(AI_TA_KRAJTA_PEOPLE)(
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
index 7c41d07a8690c6d211fd32ab581dbc9b654b7cad..d4d59c6a380035522099d63172eedb3c10ee16e6
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
@@ -14,6 +14,14 @@
     readonly name: string;
 
     /**
+     * Multiplier of this person's credited episode appearances when the roster is drawn
+     *
+     * Note: Omitting it keeps the ordinary factor of one. It affects only the chance of a person appearing near the
+     *       front of the roster; episode counts themselves stay exact.
+     */
+    readonly factor?: number;
+
+    /**
      * What the person does, in one line and only as far as the episodes of the show actually say it
      */
     readonly headline: string;
@@ -60,6 +68,7 @@
     {
         id: 'pavol-hejny',
         name: 'Pavol Hejný',
+        factor: 0.8,
         headline: 'AI konzultant a vývojář. Staví AI agenty a v dílech je rozebírá z praxe.',
         url: 'https://www.ptbk.io/pavol',
         photoFileName: 'pavol-hejny.png',
@@ -128,6 +137,7 @@
     {
         id: 'katka-fajmanova',
         name: 'Katka Fajmanová',
+        factor: 1.7,
         headline: 'Architektura a interpretabilita modelů. Díl o tom, co se děje uvnitř sítě.',
         url: null,
         photoFileName: 'katka-fajmanova.png',
@@ -239,6 +249,7 @@
     {
         id: 'tomas-mikolov',
         name: 'Tomáš Mikolov',
+        factor: 5,
         headline: 'Spoluzakladatel BottleCap AI. V Googlu zažil doby, kdy se stavěly základy dnešních modelů.',
         url: 'https://bottlecapai.com/',
         photoFileName: 'tomas-mikolov.png',
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
index eab515daf7a3dec85b218da514a41326b7e6675f..c074153e99ba597c811d828a5856efcd6ae72a8d
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
@@ -10,10 +10,11 @@
  */
 const DRAW_COUNT = 500;
 
-function createPerson(id: string): AiTaKrajtaPerson {
+function createPerson(id: string, factor?: number): AiTaKrajtaPerson {
     return {
         id,
         name: id,
+        factor,
         headline: 'Mluví do mikrofonu.',
         url: null,
         photoFileName: null,
@@ -68,6 +69,26 @@
         expect(ordered.map((person) => person.id)).toEqual(PEOPLE.map((person) => person.id));
     });
 
+    it('multiplies credited episode appearances by a person factor', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('frequent-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['frequent-contributor', 4],
+        ]);
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, episodeCountByPersonId);
+
+        expect(ordered.map((person) => person.id)).toEqual(['boosted-contributor', 'frequent-contributor']);
+    });
+
+    it('does not apply a person factor to the base chance without credited appearances', () => {
+        const people = [createPerson('ordinary-contributor'), createPerson('boosted-contributor', 5)];
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, new Map());
+
+        expect(ordered.map((person) => person.id)).toEqual(['ordinary-contributor', 'boosted-contributor']);
+    });
+
     it('leaves the roster it was given alone', () => {
         orderAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID);
 
@@ -102,6 +123,24 @@
         expect(frequentContributorTopCount).toBeLessThan(DRAW_COUNT);
     });
 
+    it('uses a person factor when drawing the weighted order', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('ordinary-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['ordinary-contributor', 1],
+        ]);
+        const randomNumbers = [0.1, 0.2];
+        let nextRandomNumberIndex = 0;
+
+        const shuffled = shuffleAiTaKrajtaPeopleByAppearances(
+            people,
+            episodeCountByPersonId,
+            () => randomNumbers[nextRandomNumberIndex++]!,
+        );
+
+        expect(shuffled.map((person) => person.id)).toEqual(['boosted-contributor', 'ordinary-contributor']);
+    });
+
     it('moves even somebody the archive never names around the list', () => {
         const placesOfNeverNamed = collectPlacesByPersonId().get('never-named')!;
 
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
index 516fd7222668e8843dd2c2b7e0a5224b5f990a3b..9e76389fc328b90c835b4a82dd5f94c1ec3ca8ea
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
@@ -11,10 +11,24 @@
 const BASE_PERSON_WEIGHT = 1;
 
 /**
+ * Multiplier used for a person whose roster entry does not set one
+ */
+const DEFAULT_PERSON_FACTOR = 1;
+
+/**
+ * Multiplier of a person's credited episode appearances when drawing the roster
+ */
+function getPersonFactor(person: AiTaKrajtaPerson): number {
+    return person.factor ?? DEFAULT_PERSON_FACTOR;
+}
+
+/**
  * How much of the front of the list one person has a chance at, which is how often the show has them on
  */
 function getPersonWeight(person: AiTaKrajtaPerson, episodeCountByPersonId: ReadonlyMap<string, number>): number {
-    return BASE_PERSON_WEIGHT + (episodeCountByPersonId.get(person.id) ?? 0);
+    const episodeCount = episodeCountByPersonId.get(person.id) ?? 0;
+
+    return BASE_PERSON_WEIGHT + episodeCount * getPersonFactor(person);
 }
 
 /**
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 83d8b0f693509e0926ab81b0ce15225503d91f9c..af4c5838b8655f74fa88c2bb085da45e78ef7274
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,5 +1,9 @@
 # Current preversion
 
+- Added per-host episode-appearance factors to the `/ai-ta-krajta` roster draw. Hosts still default to their exact
+  episode count, while Katka Fajmanová receives 1.7×, Tomáš Mikolov 5×, and Pavol Hejný 0.8× before weighted ordering.
+  The shared calculation affects both the hydration-safe initial order and each visitor's fresh randomized draw.
+
 - Added `Dneska` and `Zítra` event badges ahead of `Tento týden`, based on Prague calendar dates. Shared cards,
   calendars, landing-page term choices, and the admin picker use the same phases and theme-aware colours. Terms
   still switch to `Probíhá` at their start and remain eligible for waiting-room choices and follow-up recommendations.

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command 'npm run test-types' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
diff --git a/AGENTS.md b/AGENTS.md
index d000c5fd0c0fe752490b216922648f5e0d80e798..48cff802c904a42423498e64acfd3d8115bacb73
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -57,8 +57,8 @@
   zoom only when reduced motion is not requested. A future person without a photo
   keeps initials on that same background. The one people list is drawn anew
   for every visit, weighted by how many episodes of the archive name each
-  person, so somebody heard often comes up high far more often than someone in
-  one díl without the list ever becoming a ranking. The draw is local state and
+  person after their roster factor is applied (one by default), so somebody heard
+  often comes up high far more often than someone in one díl without the list ever becoming a ranking. The draw is local state and
   is made in the browser; the page itself is built in the order the draw leans
   towards, from the most often named person to the least often named one, so the
   browser hydrates into the list it was sent.
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
index 409d1caf0bc77cb7adf64cb527b4050f6b73369e..1f2984898a11cb0555b41680c6114d0e1f2ecad1
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
@@ -33,6 +33,18 @@
 });
 
 describe('AI_TA_KRAJTA_PEOPLE', () => {
+    it('sets the requested episode-appearance factors', () => {
+        const factoredPeople = AI_TA_KRAJTA_PEOPLE.filter((person) => person.factor !== undefined).map(
+            ({ id, factor }) => ({ id, factor }),
+        );
+
+        expect(factoredPeople).toEqual([
+            { id: 'pavol-hejny', factor: 0.8 },
+            { id: 'katka-fajmanova', factor: 1.7 },
+            { id: 'tomas-mikolov', factor: 5 },
+        ]);
+    });
+
     // Note: A portrait which is only named and never cut breaks in the browser and nowhere else, which is why the
     //       roster is read against `public` here rather than trusted.
     it.each(AI_TA_KRAJTA_PEOPLE)(
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
index 7c41d07a8690c6d211fd32ab581dbc9b654b7cad..d4d59c6a380035522099d63172eedb3c10ee16e6
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
@@ -14,6 +14,14 @@
     readonly name: string;
 
     /**
+     * Multiplier of this person's credited episode appearances when the roster is drawn
+     *
+     * Note: Omitting it keeps the ordinary factor of one. It affects only the chance of a person appearing near the
+     *       front of the roster; episode counts themselves stay exact.
+     */
+    readonly factor?: number;
+
+    /**
      * What the person does, in one line and only as far as the episodes of the show actually say it
      */
     readonly headline: string;
@@ -60,6 +68,7 @@
     {
         id: 'pavol-hejny',
         name: 'Pavol Hejný',
+        factor: 0.8,
         headline: 'AI konzultant a vývojář. Staví AI agenty a v dílech je rozebírá z praxe.',
         url: 'https://www.ptbk.io/pavol',
         photoFileName: 'pavol-hejny.png',
@@ -128,6 +137,7 @@
     {
         id: 'katka-fajmanova',
         name: 'Katka Fajmanová',
+        factor: 1.7,
         headline: 'Architektura a interpretabilita modelů. Díl o tom, co se děje uvnitř sítě.',
         url: null,
         photoFileName: 'katka-fajmanova.png',
@@ -239,6 +249,7 @@
     {
         id: 'tomas-mikolov',
         name: 'Tomáš Mikolov',
+        factor: 5,
         headline: 'Spoluzakladatel BottleCap AI. V Googlu zažil doby, kdy se stavěly základy dnešních modelů.',
         url: 'https://bottlecapai.com/',
         photoFileName: 'tomas-mikolov.png',
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
index eab515daf7a3dec85b218da514a41326b7e6675f..c074153e99ba597c811d828a5856efcd6ae72a8d
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
@@ -10,10 +10,11 @@
  */
 const DRAW_COUNT = 500;
 
-function createPerson(id: string): AiTaKrajtaPerson {
+function createPerson(id: string, factor?: number): AiTaKrajtaPerson {
     return {
         id,
         name: id,
+        factor,
         headline: 'Mluví do mikrofonu.',
         url: null,
         photoFileName: null,
@@ -68,6 +69,26 @@
         expect(ordered.map((person) => person.id)).toEqual(PEOPLE.map((person) => person.id));
     });
 
+    it('multiplies credited episode appearances by a person factor', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('frequent-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['frequent-contributor', 4],
+        ]);
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, episodeCountByPersonId);
+
+        expect(ordered.map((person) => person.id)).toEqual(['boosted-contributor', 'frequent-contributor']);
+    });
+
+    it('does not apply a person factor to the base chance without credited appearances', () => {
+        const people = [createPerson('ordinary-contributor'), createPerson('boosted-contributor', 5)];
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, new Map());
+
+        expect(ordered.map((person) => person.id)).toEqual(['ordinary-contributor', 'boosted-contributor']);
+    });
+
     it('leaves the roster it was given alone', () => {
         orderAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID);
 
@@ -102,6 +123,24 @@
         expect(frequentContributorTopCount).toBeLessThan(DRAW_COUNT);
     });
 
+    it('uses a person factor when drawing the weighted order', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('ordinary-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['ordinary-contributor', 1],
+        ]);
+        const randomNumbers = [0.1, 0.2];
+        let nextRandomNumberIndex = 0;
+
+        const shuffled = shuffleAiTaKrajtaPeopleByAppearances(
+            people,
+            episodeCountByPersonId,
+            () => randomNumbers[nextRandomNumberIndex++]!,
+        );
+
+        expect(shuffled.map((person) => person.id)).toEqual(['boosted-contributor', 'ordinary-contributor']);
+    });
+
     it('moves even somebody the archive never names around the list', () => {
         const placesOfNeverNamed = collectPlacesByPersonId().get('never-named')!;
 
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
index 516fd7222668e8843dd2c2b7e0a5224b5f990a3b..9e76389fc328b90c835b4a82dd5f94c1ec3ca8ea
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
@@ -11,10 +11,24 @@
 const BASE_PERSON_WEIGHT = 1;
 
 /**
+ * Multiplier used for a person whose roster entry does not set one
+ */
+const DEFAULT_PERSON_FACTOR = 1;
+
+/**
+ * Multiplier of a person's credited episode appearances when drawing the roster
+ */
+function getPersonFactor(person: AiTaKrajtaPerson): number {
+    return person.factor ?? DEFAULT_PERSON_FACTOR;
+}
+
+/**
  * How much of the front of the list one person has a chance at, which is how often the show has them on
  */
 function getPersonWeight(person: AiTaKrajtaPerson, episodeCountByPersonId: ReadonlyMap<string, number>): number {
-    return BASE_PERSON_WEIGHT + (episodeCountByPersonId.get(person.id) ?? 0);
+    const episodeCount = episodeCountByPersonId.get(person.id) ?? 0;
+
+    return BASE_PERSON_WEIGHT + episodeCount * getPersonFactor(person);
 }
 
 /**
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 83d8b0f693509e0926ab81b0ce15225503d91f9c..af4c5838b8655f74fa88c2bb085da45e78ef7274
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,5 +1,9 @@
 # Current preversion
 
+- Added per-host episode-appearance factors to the `/ai-ta-krajta` roster draw. Hosts still default to their exact
+  episode count, while Katka Fajmanová receives 1.7×, Tomáš Mikolov 5×, and Pavol Hejný 0.8× before weighted ordering.
+  The shared calculation affects both the hydration-safe initial order and each visitor's fresh randomized draw.
+
 - Added `Dneska` and `Zítra` event badges ahead of `Tento týden`, based on Prague calendar dates. Shared cards,
   calendars, landing-page term choices, and the admin picker use the same phases and theme-aware colours. Terms
   still switch to `Probíhá` at their start and remain eligible for waiting-room choices and follow-up recommendations.

codex
Lint completed successfully; it reports only an existing unrelated `<img>` performance warning. The full production build and TypeScript check are still running, which is the project’s required type-validation path.
diff --git a/AGENTS.md b/AGENTS.md
index d000c5fd0c0fe752490b216922648f5e0d80e798..48cff802c904a42423498e64acfd3d8115bacb73
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -57,8 +57,8 @@
   zoom only when reduced motion is not requested. A future person without a photo
   keeps initials on that same background. The one people list is drawn anew
   for every visit, weighted by how many episodes of the archive name each
-  person, so somebody heard often comes up high far more often than someone in
-  one díl without the list ever becoming a ranking. The draw is local state and
+  person after their roster factor is applied (one by default), so somebody heard
+  often comes up high far more often than someone in one díl without the list ever becoming a ranking. The draw is local state and
   is made in the browser; the page itself is built in the order the draw leans
   towards, from the most often named person to the least often named one, so the
   browser hydrates into the list it was sent.
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
index 409d1caf0bc77cb7adf64cb527b4050f6b73369e..1f2984898a11cb0555b41680c6114d0e1f2ecad1
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
@@ -33,6 +33,18 @@
 });
 
 describe('AI_TA_KRAJTA_PEOPLE', () => {
+    it('sets the requested episode-appearance factors', () => {
+        const factoredPeople = AI_TA_KRAJTA_PEOPLE.filter((person) => person.factor !== undefined).map(
+            ({ id, factor }) => ({ id, factor }),
+        );
+
+        expect(factoredPeople).toEqual([
+            { id: 'pavol-hejny', factor: 0.8 },
+            { id: 'katka-fajmanova', factor: 1.7 },
+            { id: 'tomas-mikolov', factor: 5 },
+        ]);
+    });
+
     // Note: A portrait which is only named and never cut breaks in the browser and nowhere else, which is why the
     //       roster is read against `public` here rather than trusted.
     it.each(AI_TA_KRAJTA_PEOPLE)(
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
index 7c41d07a8690c6d211fd32ab581dbc9b654b7cad..d4d59c6a380035522099d63172eedb3c10ee16e6
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
@@ -14,6 +14,14 @@
     readonly name: string;
 
     /**
+     * Multiplier of this person's credited episode appearances when the roster is drawn
+     *
+     * Note: Omitting it keeps the ordinary factor of one. It affects only the chance of a person appearing near the
+     *       front of the roster; episode counts themselves stay exact.
+     */
+    readonly factor?: number;
+
+    /**
      * What the person does, in one line and only as far as the episodes of the show actually say it
      */
     readonly headline: string;
@@ -60,6 +68,7 @@
     {
         id: 'pavol-hejny',
         name: 'Pavol Hejný',
+        factor: 0.8,
         headline: 'AI konzultant a vývojář. Staví AI agenty a v dílech je rozebírá z praxe.',
         url: 'https://www.ptbk.io/pavol',
         photoFileName: 'pavol-hejny.png',
@@ -128,6 +137,7 @@
     {
         id: 'katka-fajmanova',
         name: 'Katka Fajmanová',
+        factor: 1.7,
         headline: 'Architektura a interpretabilita modelů. Díl o tom, co se děje uvnitř sítě.',
         url: null,
         photoFileName: 'katka-fajmanova.png',
@@ -239,6 +249,7 @@
     {
         id: 'tomas-mikolov',
         name: 'Tomáš Mikolov',
+        factor: 5,
         headline: 'Spoluzakladatel BottleCap AI. V Googlu zažil doby, kdy se stavěly základy dnešních modelů.',
         url: 'https://bottlecapai.com/',
         photoFileName: 'tomas-mikolov.png',
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
index eab515daf7a3dec85b218da514a41326b7e6675f..c074153e99ba597c811d828a5856efcd6ae72a8d
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
@@ -10,10 +10,11 @@
  */
 const DRAW_COUNT = 500;
 
-function createPerson(id: string): AiTaKrajtaPerson {
+function createPerson(id: string, factor?: number): AiTaKrajtaPerson {
     return {
         id,
         name: id,
+        factor,
         headline: 'Mluví do mikrofonu.',
         url: null,
         photoFileName: null,
@@ -68,6 +69,26 @@
         expect(ordered.map((person) => person.id)).toEqual(PEOPLE.map((person) => person.id));
     });
 
+    it('multiplies credited episode appearances by a person factor', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('frequent-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['frequent-contributor', 4],
+        ]);
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, episodeCountByPersonId);
+
+        expect(ordered.map((person) => person.id)).toEqual(['boosted-contributor', 'frequent-contributor']);
+    });
+
+    it('does not apply a person factor to the base chance without credited appearances', () => {
+        const people = [createPerson('ordinary-contributor'), createPerson('boosted-contributor', 5)];
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, new Map());
+
+        expect(ordered.map((person) => person.id)).toEqual(['ordinary-contributor', 'boosted-contributor']);
+    });
+
     it('leaves the roster it was given alone', () => {
         orderAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID);
 
@@ -102,6 +123,24 @@
         expect(frequentContributorTopCount).toBeLessThan(DRAW_COUNT);
     });
 
+    it('uses a person factor when drawing the weighted order', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('ordinary-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['ordinary-contributor', 1],
+        ]);
+        const randomNumbers = [0.1, 0.2];
+        let nextRandomNumberIndex = 0;
+
+        const shuffled = shuffleAiTaKrajtaPeopleByAppearances(
+            people,
+            episodeCountByPersonId,
+            () => randomNumbers[nextRandomNumberIndex++]!,
+        );
+
+        expect(shuffled.map((person) => person.id)).toEqual(['boosted-contributor', 'ordinary-contributor']);
+    });
+
     it('moves even somebody the archive never names around the list', () => {
         const placesOfNeverNamed = collectPlacesByPersonId().get('never-named')!;
 
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
index 516fd7222668e8843dd2c2b7e0a5224b5f990a3b..9e76389fc328b90c835b4a82dd5f94c1ec3ca8ea
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
@@ -11,10 +11,24 @@
 const BASE_PERSON_WEIGHT = 1;
 
 /**
+ * Multiplier used for a person whose roster entry does not set one
+ */
+const DEFAULT_PERSON_FACTOR = 1;
+
+/**
+ * Multiplier of a person's credited episode appearances when drawing the roster
+ */
+function getPersonFactor(person: AiTaKrajtaPerson): number {
+    return person.factor ?? DEFAULT_PERSON_FACTOR;
+}
+
+/**
  * How much of the front of the list one person has a chance at, which is how often the show has them on
  */
 function getPersonWeight(person: AiTaKrajtaPerson, episodeCountByPersonId: ReadonlyMap<string, number>): number {
-    return BASE_PERSON_WEIGHT + (episodeCountByPersonId.get(person.id) ?? 0);
+    const episodeCount = episodeCountByPersonId.get(person.id) ?? 0;
+
+    return BASE_PERSON_WEIGHT + episodeCount * getPersonFactor(person);
 }
 
 /**
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 83d8b0f693509e0926ab81b0ce15225503d91f9c..af4c5838b8655f74fa88c2bb085da45e78ef7274
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,5 +1,9 @@
 # Current preversion
 
+- Added per-host episode-appearance factors to the `/ai-ta-krajta` roster draw. Hosts still default to their exact
+  episode count, while Katka Fajmanová receives 1.7×, Tomáš Mikolov 5×, and Pavol Hejný 0.8× before weighted ordering.
+  The shared calculation affects both the hydration-safe initial order and each visitor's fresh randomized draw.
+
 - Added `Dneska` and `Zítra` event badges ahead of `Tento týden`, based on Prague calendar dates. Shared cards,
   calendars, landing-page term choices, and the admin picker use the same phases and theme-aware colours. Terms
   still switch to `Probíhá` at their start and remain eligible for waiting-room choices and follow-up recommendations.

diff --git a/AGENTS.md b/AGENTS.md
index d000c5fd0c0fe752490b216922648f5e0d80e798..48cff802c904a42423498e64acfd3d8115bacb73
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -57,8 +57,8 @@
   zoom only when reduced motion is not requested. A future person without a photo
   keeps initials on that same background. The one people list is drawn anew
   for every visit, weighted by how many episodes of the archive name each
-  person, so somebody heard often comes up high far more often than someone in
-  one díl without the list ever becoming a ranking. The draw is local state and
+  person after their roster factor is applied (one by default), so somebody heard
+  often comes up high far more often than someone in one díl without the list ever becoming a ranking. The draw is local state and
   is made in the browser; the page itself is built in the order the draw leans
   towards, from the most often named person to the least often named one, so the
   browser hydrates into the list it was sent.
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
index 409d1caf0bc77cb7adf64cb527b4050f6b73369e..1f2984898a11cb0555b41680c6114d0e1f2ecad1
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
@@ -33,6 +33,18 @@
 });
 
 describe('AI_TA_KRAJTA_PEOPLE', () => {
+    it('sets the requested episode-appearance factors', () => {
+        const factoredPeople = AI_TA_KRAJTA_PEOPLE.filter((person) => person.factor !== undefined).map(
+            ({ id, factor }) => ({ id, factor }),
+        );
+
+        expect(factoredPeople).toEqual([
+            { id: 'pavol-hejny', factor: 0.8 },
+            { id: 'katka-fajmanova', factor: 1.7 },
+            { id: 'tomas-mikolov', factor: 5 },
+        ]);
+    });
+
     // Note: A portrait which is only named and never cut breaks in the browser and nowhere else, which is why the
     //       roster is read against `public` here rather than trusted.
     it.each(AI_TA_KRAJTA_PEOPLE)(
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
index 7c41d07a8690c6d211fd32ab581dbc9b654b7cad..d4d59c6a380035522099d63172eedb3c10ee16e6
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
@@ -14,6 +14,14 @@
     readonly name: string;
 
     /**
+     * Multiplier of this person's credited episode appearances when the roster is drawn
+     *
+     * Note: Omitting it keeps the ordinary factor of one. It affects only the chance of a person appearing near the
+     *       front of the roster; episode counts themselves stay exact.
+     */
+    readonly factor?: number;
+
+    /**
      * What the person does, in one line and only as far as the episodes of the show actually say it
      */
     readonly headline: string;
@@ -60,6 +68,7 @@
     {
         id: 'pavol-hejny',
         name: 'Pavol Hejný',
+        factor: 0.8,
         headline: 'AI konzultant a vývojář. Staví AI agenty a v dílech je rozebírá z praxe.',
         url: 'https://www.ptbk.io/pavol',
         photoFileName: 'pavol-hejny.png',
@@ -128,6 +137,7 @@
     {
         id: 'katka-fajmanova',
         name: 'Katka Fajmanová',
+        factor: 1.7,
         headline: 'Architektura a interpretabilita modelů. Díl o tom, co se děje uvnitř sítě.',
         url: null,
         photoFileName: 'katka-fajmanova.png',
@@ -239,6 +249,7 @@
     {
         id: 'tomas-mikolov',
         name: 'Tomáš Mikolov',
+        factor: 5,
         headline: 'Spoluzakladatel BottleCap AI. V Googlu zažil doby, kdy se stavěly základy dnešních modelů.',
         url: 'https://bottlecapai.com/',
         photoFileName: 'tomas-mikolov.png',
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
index eab515daf7a3dec85b218da514a41326b7e6675f..c074153e99ba597c811d828a5856efcd6ae72a8d
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
@@ -10,10 +10,11 @@
  */
 const DRAW_COUNT = 500;
 
-function createPerson(id: string): AiTaKrajtaPerson {
+function createPerson(id: string, factor?: number): AiTaKrajtaPerson {
     return {
         id,
         name: id,
+        factor,
         headline: 'Mluví do mikrofonu.',
         url: null,
         photoFileName: null,
@@ -68,6 +69,26 @@
         expect(ordered.map((person) => person.id)).toEqual(PEOPLE.map((person) => person.id));
     });
 
+    it('multiplies credited episode appearances by a person factor', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('frequent-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['frequent-contributor', 4],
+        ]);
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, episodeCountByPersonId);
+
+        expect(ordered.map((person) => person.id)).toEqual(['boosted-contributor', 'frequent-contributor']);
+    });
+
+    it('does not apply a person factor to the base chance without credited appearances', () => {
+        const people = [createPerson('ordinary-contributor'), createPerson('boosted-contributor', 5)];
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, new Map());
+
+        expect(ordered.map((person) => person.id)).toEqual(['ordinary-contributor', 'boosted-contributor']);
+    });
+
     it('leaves the roster it was given alone', () => {
         orderAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID);
 
@@ -102,6 +123,24 @@
         expect(frequentContributorTopCount).toBeLessThan(DRAW_COUNT);
     });
 
+    it('uses a person factor when drawing the weighted order', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('ordinary-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['ordinary-contributor', 1],
+        ]);
+        const randomNumbers = [0.1, 0.2];
+        let nextRandomNumberIndex = 0;
+
+        const shuffled = shuffleAiTaKrajtaPeopleByAppearances(
+            people,
+            episodeCountByPersonId,
+            () => randomNumbers[nextRandomNumberIndex++]!,
+        );
+
+        expect(shuffled.map((person) => person.id)).toEqual(['boosted-contributor', 'ordinary-contributor']);
+    });
+
     it('moves even somebody the archive never names around the list', () => {
         const placesOfNeverNamed = collectPlacesByPersonId().get('never-named')!;
 
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
index 516fd7222668e8843dd2c2b7e0a5224b5f990a3b..9e76389fc328b90c835b4a82dd5f94c1ec3ca8ea
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
@@ -11,10 +11,24 @@
 const BASE_PERSON_WEIGHT = 1;
 
 /**
+ * Multiplier used for a person whose roster entry does not set one
+ */
+const DEFAULT_PERSON_FACTOR = 1;
+
+/**
+ * Multiplier of a person's credited episode appearances when drawing the roster
+ */
+function getPersonFactor(person: AiTaKrajtaPerson): number {
+    return person.factor ?? DEFAULT_PERSON_FACTOR;
+}
+
+/**
  * How much of the front of the list one person has a chance at, which is how often the show has them on
  */
 function getPersonWeight(person: AiTaKrajtaPerson, episodeCountByPersonId: ReadonlyMap<string, number>): number {
-    return BASE_PERSON_WEIGHT + (episodeCountByPersonId.get(person.id) ?? 0);
+    const episodeCount = episodeCountByPersonId.get(person.id) ?? 0;
+
+    return BASE_PERSON_WEIGHT + episodeCount * getPersonFactor(person);
 }
 
 /**
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 83d8b0f693509e0926ab81b0ce15225503d91f9c..af4c5838b8655f74fa88c2bb085da45e78ef7274
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,5 +1,9 @@
 # Current preversion
 
+- Added per-host episode-appearance factors to the `/ai-ta-krajta` roster draw. Hosts still default to their exact
+  episode count, while Katka Fajmanová receives 1.7×, Tomáš Mikolov 5×, and Pavol Hejný 0.8× before weighted ordering.
+  The shared calculation affects both the hydration-safe initial order and each visitor's fresh randomized draw.
+
 - Added `Dneska` and `Zítra` event badges ahead of `Tento týden`, based on Prague calendar dates. Shared cards,
   calendars, landing-page term choices, and the admin picker use the same phases and theme-aware colours. Terms
   still switch to `Probíhá` at their start and remain eligible for waiting-room choices and follow-up recommendations.

 succeeded in 97004ms:

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
BenefitsSection rendered
IntegrationsSection rendered
BenefitsSection rendered
IntegrationsSection rendered
BenefitsSection rendered
BenefitsSection rendered
IntegrationsSection rendered
BenefitsSection rendered
IntegrationsSection rendered
   Generating static pages (20/82) 
   Generating static pages (40/82) 
   Generating static pages (61/82) 
 ✓ Generating static pages (82/82)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                                                                  Size  First Load JS  Revalidate  Expire
┌ ƒ /                                                                                       414 B         102 kB
├ ○ /_not-found                                                                             414 B         102 kB
├ ƒ /[shortcode]                                                                          2.31 kB         142 kB
├ ƒ /admin                                                                                  175 B         105 kB
├ ƒ /admin/community                                                                      7.78 kB         375 kB
├ ƒ /admin/contacts                                                                       24.9 kB         200 kB
├ ƒ /admin/discount-codes                                                                 8.35 kB         138 kB
├ ƒ /admin/login                                                                            414 B         102 kB
├ ƒ /admin/recording-studio                                                               89.8 kB         220 kB
├ ƒ /admin/shortener                                                                      49.5 kB         193 kB
├ ƒ /admin/workshops                                                                        220 B         368 kB
├ ○ /ai-supervize                                                                           16 kB         239 kB
├ ƒ /ai-supervize-mini                                                                    17.2 kB         233 kB
├ ○ /ai-supervize-mini/opengraph-image                                                      414 B         102 kB
├ ƒ /ai-supervize-mini/participant                                                        2.51 kB         139 kB
├ ○ /ai-supervize/opengraph-image                                                           414 B         102 kB
├ ○ /ai-ta-krajta                                                                         19.5 kB         146 kB          1h      1y
├ ○ /ai-ta-krajta/branding                                                                  204 B         122 kB
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
├ ○ /cs/pavol                                                                               158 B         203 kB
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
├ ○ /for-industry                                                                         7.92 kB         269 kB
├ ○ /for-industry/opengraph-image                                                           414 B         102 kB
├ ○ /hackathon-factory                                                                      15 kB         252 kB
├ ○ /hackathon-factory/opengraph-image                                                      414 B         102 kB
├ ƒ /k/[...shortFileUrlParts]                                                               414 B         102 kB
├ ○ /manifest.webmanifest                                                                   414 B         102 kB
├ ○ /old                                                                                  17.9 kB         246 kB
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
  └ other shared chunks (total)                                                           2.66 kB


ƒ Middleware                                                                              30.9 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand


diff --git a/AGENTS.md b/AGENTS.md
index d000c5fd0c0fe752490b216922648f5e0d80e798..48cff802c904a42423498e64acfd3d8115bacb73
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -57,8 +57,8 @@
   zoom only when reduced motion is not requested. A future person without a photo
   keeps initials on that same background. The one people list is drawn anew
   for every visit, weighted by how many episodes of the archive name each
-  person, so somebody heard often comes up high far more often than someone in
-  one díl without the list ever becoming a ranking. The draw is local state and
+  person after their roster factor is applied (one by default), so somebody heard
+  often comes up high far more often than someone in one díl without the list ever becoming a ranking. The draw is local state and
   is made in the browser; the page itself is built in the order the draw leans
   towards, from the most often named person to the least often named one, so the
   browser hydrates into the list it was sent.
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
index 409d1caf0bc77cb7adf64cb527b4050f6b73369e..1f2984898a11cb0555b41680c6114d0e1f2ecad1
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
@@ -33,6 +33,18 @@
 });
 
 describe('AI_TA_KRAJTA_PEOPLE', () => {
+    it('sets the requested episode-appearance factors', () => {
+        const factoredPeople = AI_TA_KRAJTA_PEOPLE.filter((person) => person.factor !== undefined).map(
+            ({ id, factor }) => ({ id, factor }),
+        );
+
+        expect(factoredPeople).toEqual([
+            { id: 'pavol-hejny', factor: 0.8 },
+            { id: 'katka-fajmanova', factor: 1.7 },
+            { id: 'tomas-mikolov', factor: 5 },
+        ]);
+    });
+
     // Note: A portrait which is only named and never cut breaks in the browser and nowhere else, which is why the
     //       roster is read against `public` here rather than trusted.
     it.each(AI_TA_KRAJTA_PEOPLE)(
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
index 7c41d07a8690c6d211fd32ab581dbc9b654b7cad..d4d59c6a380035522099d63172eedb3c10ee16e6
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
@@ -14,6 +14,14 @@
     readonly name: string;
 
     /**
+     * Multiplier of this person's credited episode appearances when the roster is drawn
+     *
+     * Note: Omitting it keeps the ordinary factor of one. It affects only the chance of a person appearing near the
+     *       front of the roster; episode counts themselves stay exact.
+     */
+    readonly factor?: number;
+
+    /**
      * What the person does, in one line and only as far as the episodes of the show actually say it
      */
     readonly headline: string;
@@ -60,6 +68,7 @@
     {
         id: 'pavol-hejny',
         name: 'Pavol Hejný',
+        factor: 0.8,
         headline: 'AI konzultant a vývojář. Staví AI agenty a v dílech je rozebírá z praxe.',
         url: 'https://www.ptbk.io/pavol',
         photoFileName: 'pavol-hejny.png',
@@ -128,6 +137,7 @@
     {
         id: 'katka-fajmanova',
         name: 'Katka Fajmanová',
+        factor: 1.7,
         headline: 'Architektura a interpretabilita modelů. Díl o tom, co se děje uvnitř sítě.',
         url: null,
         photoFileName: 'katka-fajmanova.png',
@@ -239,6 +249,7 @@
     {
         id: 'tomas-mikolov',
         name: 'Tomáš Mikolov',
+        factor: 5,
         headline: 'Spoluzakladatel BottleCap AI. V Googlu zažil doby, kdy se stavěly základy dnešních modelů.',
         url: 'https://bottlecapai.com/',
         photoFileName: 'tomas-mikolov.png',
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
index eab515daf7a3dec85b218da514a41326b7e6675f..c074153e99ba597c811d828a5856efcd6ae72a8d
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
@@ -10,10 +10,11 @@
  */
 const DRAW_COUNT = 500;
 
-function createPerson(id: string): AiTaKrajtaPerson {
+function createPerson(id: string, factor?: number): AiTaKrajtaPerson {
     return {
         id,
         name: id,
+        factor,
         headline: 'Mluví do mikrofonu.',
         url: null,
         photoFileName: null,
@@ -68,6 +69,26 @@
         expect(ordered.map((person) => person.id)).toEqual(PEOPLE.map((person) => person.id));
     });
 
+    it('multiplies credited episode appearances by a person factor', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('frequent-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['frequent-contributor', 4],
+        ]);
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, episodeCountByPersonId);
+
+        expect(ordered.map((person) => person.id)).toEqual(['boosted-contributor', 'frequent-contributor']);
+    });
+
+    it('does not apply a person factor to the base chance without credited appearances', () => {
+        const people = [createPerson('ordinary-contributor'), createPerson('boosted-contributor', 5)];
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, new Map());
+
+        expect(ordered.map((person) => person.id)).toEqual(['ordinary-contributor', 'boosted-contributor']);
+    });
+
     it('leaves the roster it was given alone', () => {
         orderAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID);
 
@@ -102,6 +123,24 @@
         expect(frequentContributorTopCount).toBeLessThan(DRAW_COUNT);
     });
 
+    it('uses a person factor when drawing the weighted order', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('ordinary-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['ordinary-contributor', 1],
+        ]);
+        const randomNumbers = [0.1, 0.2];
+        let nextRandomNumberIndex = 0;
+
+        const shuffled = shuffleAiTaKrajtaPeopleByAppearances(
+            people,
+            episodeCountByPersonId,
+            () => randomNumbers[nextRandomNumberIndex++]!,
+        );
+
+        expect(shuffled.map((person) => person.id)).toEqual(['boosted-contributor', 'ordinary-contributor']);
+    });
+
     it('moves even somebody the archive never names around the list', () => {
         const placesOfNeverNamed = collectPlacesByPersonId().get('never-named')!;
 
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
index 516fd7222668e8843dd2c2b7e0a5224b5f990a3b..9e76389fc328b90c835b4a82dd5f94c1ec3ca8ea
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
@@ -11,10 +11,24 @@
 const BASE_PERSON_WEIGHT = 1;
 
 /**
+ * Multiplier used for a person whose roster entry does not set one
+ */
+const DEFAULT_PERSON_FACTOR = 1;
+
+/**
+ * Multiplier of a person's credited episode appearances when drawing the roster
+ */
+function getPersonFactor(person: AiTaKrajtaPerson): number {
+    return person.factor ?? DEFAULT_PERSON_FACTOR;
+}
+
+/**
  * How much of the front of the list one person has a chance at, which is how often the show has them on
  */
 function getPersonWeight(person: AiTaKrajtaPerson, episodeCountByPersonId: ReadonlyMap<string, number>): number {
-    return BASE_PERSON_WEIGHT + (episodeCountByPersonId.get(person.id) ?? 0);
+    const episodeCount = episodeCountByPersonId.get(person.id) ?? 0;
+
+    return BASE_PERSON_WEIGHT + episodeCount * getPersonFactor(person);
 }
 
 /**
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 83d8b0f693509e0926ab81b0ce15225503d91f9c..af4c5838b8655f74fa88c2bb085da45e78ef7274
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,5 +1,9 @@
 # Current preversion
 
+- Added per-host episode-appearance factors to the `/ai-ta-krajta` roster draw. Hosts still default to their exact
+  episode count, while Katka Fajmanová receives 1.7×, Tomáš Mikolov 5×, and Pavol Hejný 0.8× before weighted ordering.
+  The shared calculation affects both the hydration-safe initial order and each visitor's fresh randomized draw.
+
 - Added `Dneska` and `Zítra` event badges ahead of `Tento týden`, based on Prague calendar dates. Shared cards,
   calendars, landing-page term choices, and the admin picker use the same phases and theme-aware colours. Terms
   still switch to `Probíhá` at their start and remain eligible for waiting-room choices and follow-up recommendations.

codex
The production build and TypeScript validation both completed successfully. I’m doing a final diff/status review now to confirm the change is limited to the roster behavior, tests, documentation, and changelog, while preserving your pre-existing prompt-file edit.
exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command 'git status --short' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 191ms:
 M AGENTS.md
 M businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
 M businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
 M businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
 M businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
 M changelog/_current-preversion.md
 M prompts/2026-09-0560-ai-ta-krajta-people-factor.md

diff --git a/AGENTS.md b/AGENTS.md
index d000c5fd0c0fe752490b216922648f5e0d80e798..48cff802c904a42423498e64acfd3d8115bacb73
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -57,8 +57,8 @@
   zoom only when reduced motion is not requested. A future person without a photo
   keeps initials on that same background. The one people list is drawn anew
   for every visit, weighted by how many episodes of the archive name each
-  person, so somebody heard often comes up high far more often than someone in
-  one díl without the list ever becoming a ranking. The draw is local state and
+  person after their roster factor is applied (one by default), so somebody heard
+  often comes up high far more often than someone in one díl without the list ever becoming a ranking. The draw is local state and
   is made in the browser; the page itself is built in the order the draw leans
   towards, from the most often named person to the least often named one, so the
   browser hydrates into the list it was sent.
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
index 409d1caf0bc77cb7adf64cb527b4050f6b73369e..1f2984898a11cb0555b41680c6114d0e1f2ecad1
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
@@ -33,6 +33,18 @@
 });
 
 describe('AI_TA_KRAJTA_PEOPLE', () => {
+    it('sets the requested episode-appearance factors', () => {
+        const factoredPeople = AI_TA_KRAJTA_PEOPLE.filter((person) => person.factor !== undefined).map(
+            ({ id, factor }) => ({ id, factor }),
+        );
+
+        expect(factoredPeople).toEqual([
+            { id: 'pavol-hejny', factor: 0.8 },
+            { id: 'katka-fajmanova', factor: 1.7 },
+            { id: 'tomas-mikolov', factor: 5 },
+        ]);
+    });
+
     // Note: A portrait which is only named and never cut breaks in the browser and nowhere else, which is why the
     //       roster is read against `public` here rather than trusted.
     it.each(AI_TA_KRAJTA_PEOPLE)(
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
index 7c41d07a8690c6d211fd32ab581dbc9b654b7cad..d4d59c6a380035522099d63172eedb3c10ee16e6
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
@@ -14,6 +14,14 @@
     readonly name: string;
 
     /**
+     * Multiplier of this person's credited episode appearances when the roster is drawn
+     *
+     * Note: Omitting it keeps the ordinary factor of one. It affects only the chance of a person appearing near the
+     *       front of the roster; episode counts themselves stay exact.
+     */
+    readonly factor?: number;
+
+    /**
      * What the person does, in one line and only as far as the episodes of the show actually say it
      */
     readonly headline: string;
@@ -60,6 +68,7 @@
     {
         id: 'pavol-hejny',
         name: 'Pavol Hejný',
+        factor: 0.8,
         headline: 'AI konzultant a vývojář. Staví AI agenty a v dílech je rozebírá z praxe.',
         url: 'https://www.ptbk.io/pavol',
         photoFileName: 'pavol-hejny.png',
@@ -128,6 +137,7 @@
     {
         id: 'katka-fajmanova',
         name: 'Katka Fajmanová',
+        factor: 1.7,
         headline: 'Architektura a interpretabilita modelů. Díl o tom, co se děje uvnitř sítě.',
         url: null,
         photoFileName: 'katka-fajmanova.png',
@@ -239,6 +249,7 @@
     {
         id: 'tomas-mikolov',
         name: 'Tomáš Mikolov',
+        factor: 5,
         headline: 'Spoluzakladatel BottleCap AI. V Googlu zažil doby, kdy se stavěly základy dnešních modelů.',
         url: 'https://bottlecapai.com/',
         photoFileName: 'tomas-mikolov.png',
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
index eab515daf7a3dec85b218da514a41326b7e6675f..c074153e99ba597c811d828a5856efcd6ae72a8d
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
@@ -10,10 +10,11 @@
  */
 const DRAW_COUNT = 500;
 
-function createPerson(id: string): AiTaKrajtaPerson {
+function createPerson(id: string, factor?: number): AiTaKrajtaPerson {
     return {
         id,
         name: id,
+        factor,
         headline: 'Mluví do mikrofonu.',
         url: null,
         photoFileName: null,
@@ -68,6 +69,26 @@
         expect(ordered.map((person) => person.id)).toEqual(PEOPLE.map((person) => person.id));
     });
 
+    it('multiplies credited episode appearances by a person factor', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('frequent-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['frequent-contributor', 4],
+        ]);
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, episodeCountByPersonId);
+
+        expect(ordered.map((person) => person.id)).toEqual(['boosted-contributor', 'frequent-contributor']);
+    });
+
+    it('does not apply a person factor to the base chance without credited appearances', () => {
+        const people = [createPerson('ordinary-contributor'), createPerson('boosted-contributor', 5)];
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, new Map());
+
+        expect(ordered.map((person) => person.id)).toEqual(['ordinary-contributor', 'boosted-contributor']);
+    });
+
     it('leaves the roster it was given alone', () => {
         orderAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID);
 
@@ -102,6 +123,24 @@
         expect(frequentContributorTopCount).toBeLessThan(DRAW_COUNT);
     });
 
+    it('uses a person factor when drawing the weighted order', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('ordinary-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['ordinary-contributor', 1],
+        ]);
+        const randomNumbers = [0.1, 0.2];
+        let nextRandomNumberIndex = 0;
+
+        const shuffled = shuffleAiTaKrajtaPeopleByAppearances(
+            people,
+            episodeCountByPersonId,
+            () => randomNumbers[nextRandomNumberIndex++]!,
+        );
+
+        expect(shuffled.map((person) => person.id)).toEqual(['boosted-contributor', 'ordinary-contributor']);
+    });
+
     it('moves even somebody the archive never names around the list', () => {
         const placesOfNeverNamed = collectPlacesByPersonId().get('never-named')!;
 
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
index 516fd7222668e8843dd2c2b7e0a5224b5f990a3b..9e76389fc328b90c835b4a82dd5f94c1ec3ca8ea
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
@@ -11,10 +11,24 @@
 const BASE_PERSON_WEIGHT = 1;
 
 /**
+ * Multiplier used for a person whose roster entry does not set one
+ */
+const DEFAULT_PERSON_FACTOR = 1;
+
+/**
+ * Multiplier of a person's credited episode appearances when drawing the roster
+ */
+function getPersonFactor(person: AiTaKrajtaPerson): number {
+    return person.factor ?? DEFAULT_PERSON_FACTOR;
+}
+
+/**
  * How much of the front of the list one person has a chance at, which is how often the show has them on
  */
 function getPersonWeight(person: AiTaKrajtaPerson, episodeCountByPersonId: ReadonlyMap<string, number>): number {
-    return BASE_PERSON_WEIGHT + (episodeCountByPersonId.get(person.id) ?? 0);
+    const episodeCount = episodeCountByPersonId.get(person.id) ?? 0;
+
+    return BASE_PERSON_WEIGHT + episodeCount * getPersonFactor(person);
 }
 
 /**
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 83d8b0f693509e0926ab81b0ce15225503d91f9c..af4c5838b8655f74fa88c2bb085da45e78ef7274
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,5 +1,9 @@
 # Current preversion
 
+- Added per-host episode-appearance factors to the `/ai-ta-krajta` roster draw. Hosts still default to their exact
+  episode count, while Katka Fajmanová receives 1.7×, Tomáš Mikolov 5×, and Pavol Hejný 0.8× before weighted ordering.
+  The shared calculation affects both the hydration-safe initial order and each visitor's fresh randomized draw.
+
 - Added `Dneska` and `Zítra` event badges ahead of `Tento týden`, based on Prague calendar dates. Shared cards,
   calendars, landing-page term choices, and the admin picker use the same phases and theme-aware colours. Terms
   still switch to `Probíhá` at their start and remain eligible for waiting-room choices and follow-up recommendations.

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command 'git diff --check' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 206ms:
diff --git a/AGENTS.md b/AGENTS.md
index d000c5fd0c0fe752490b216922648f5e0d80e798..48cff802c904a42423498e64acfd3d8115bacb73
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -57,8 +57,8 @@
   zoom only when reduced motion is not requested. A future person without a photo
   keeps initials on that same background. The one people list is drawn anew
   for every visit, weighted by how many episodes of the archive name each
-  person, so somebody heard often comes up high far more often than someone in
-  one díl without the list ever becoming a ranking. The draw is local state and
+  person after their roster factor is applied (one by default), so somebody heard
+  often comes up high far more often than someone in one díl without the list ever becoming a ranking. The draw is local state and
   is made in the browser; the page itself is built in the order the draw leans
   towards, from the most often named person to the least often named one, so the
   browser hydrates into the list it was sent.
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
index 409d1caf0bc77cb7adf64cb527b4050f6b73369e..1f2984898a11cb0555b41680c6114d0e1f2ecad1
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
@@ -33,6 +33,18 @@
 });
 
 describe('AI_TA_KRAJTA_PEOPLE', () => {
+    it('sets the requested episode-appearance factors', () => {
+        const factoredPeople = AI_TA_KRAJTA_PEOPLE.filter((person) => person.factor !== undefined).map(
+            ({ id, factor }) => ({ id, factor }),
+        );
+
+        expect(factoredPeople).toEqual([
+            { id: 'pavol-hejny', factor: 0.8 },
+            { id: 'katka-fajmanova', factor: 1.7 },
+            { id: 'tomas-mikolov', factor: 5 },
+        ]);
+    });
+
     // Note: A portrait which is only named and never cut breaks in the browser and nowhere else, which is why the
     //       roster is read against `public` here rather than trusted.
     it.each(AI_TA_KRAJTA_PEOPLE)(
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
index 7c41d07a8690c6d211fd32ab581dbc9b654b7cad..d4d59c6a380035522099d63172eedb3c10ee16e6
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
@@ -14,6 +14,14 @@
     readonly name: string;
 
     /**
+     * Multiplier of this person's credited episode appearances when the roster is drawn
+     *
+     * Note: Omitting it keeps the ordinary factor of one. It affects only the chance of a person appearing near the
+     *       front of the roster; episode counts themselves stay exact.
+     */
+    readonly factor?: number;
+
+    /**
      * What the person does, in one line and only as far as the episodes of the show actually say it
      */
     readonly headline: string;
@@ -60,6 +68,7 @@
     {
         id: 'pavol-hejny',
         name: 'Pavol Hejný',
+        factor: 0.8,
         headline: 'AI konzultant a vývojář. Staví AI agenty a v dílech je rozebírá z praxe.',
         url: 'https://www.ptbk.io/pavol',
         photoFileName: 'pavol-hejny.png',
@@ -128,6 +137,7 @@
     {
         id: 'katka-fajmanova',
         name: 'Katka Fajmanová',
+        factor: 1.7,
         headline: 'Architektura a interpretabilita modelů. Díl o tom, co se děje uvnitř sítě.',
         url: null,
         photoFileName: 'katka-fajmanova.png',
@@ -239,6 +249,7 @@
     {
         id: 'tomas-mikolov',
         name: 'Tomáš Mikolov',
+        factor: 5,
         headline: 'Spoluzakladatel BottleCap AI. V Googlu zažil doby, kdy se stavěly základy dnešních modelů.',
         url: 'https://bottlecapai.com/',
         photoFileName: 'tomas-mikolov.png',
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
index eab515daf7a3dec85b218da514a41326b7e6675f..c074153e99ba597c811d828a5856efcd6ae72a8d
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
@@ -10,10 +10,11 @@
  */
 const DRAW_COUNT = 500;
 
-function createPerson(id: string): AiTaKrajtaPerson {
+function createPerson(id: string, factor?: number): AiTaKrajtaPerson {
     return {
         id,
         name: id,
+        factor,
         headline: 'Mluví do mikrofonu.',
         url: null,
         photoFileName: null,
@@ -68,6 +69,26 @@
         expect(ordered.map((person) => person.id)).toEqual(PEOPLE.map((person) => person.id));
     });
 
+    it('multiplies credited episode appearances by a person factor', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('frequent-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['frequent-contributor', 4],
+        ]);
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, episodeCountByPersonId);
+
+        expect(ordered.map((person) => person.id)).toEqual(['boosted-contributor', 'frequent-contributor']);
+    });
+
+    it('does not apply a person factor to the base chance without credited appearances', () => {
+        const people = [createPerson('ordinary-contributor'), createPerson('boosted-contributor', 5)];
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, new Map());
+
+        expect(ordered.map((person) => person.id)).toEqual(['ordinary-contributor', 'boosted-contributor']);
+    });
+
     it('leaves the roster it was given alone', () => {
         orderAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID);
 
@@ -102,6 +123,24 @@
         expect(frequentContributorTopCount).toBeLessThan(DRAW_COUNT);
     });
 
+    it('uses a person factor when drawing the weighted order', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('ordinary-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['ordinary-contributor', 1],
+        ]);
+        const randomNumbers = [0.1, 0.2];
+        let nextRandomNumberIndex = 0;
+
+        const shuffled = shuffleAiTaKrajtaPeopleByAppearances(
+            people,
+            episodeCountByPersonId,
+            () => randomNumbers[nextRandomNumberIndex++]!,
+        );
+
+        expect(shuffled.map((person) => person.id)).toEqual(['boosted-contributor', 'ordinary-contributor']);
+    });
+
     it('moves even somebody the archive never names around the list', () => {
         const placesOfNeverNamed = collectPlacesByPersonId().get('never-named')!;
 
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
index 516fd7222668e8843dd2c2b7e0a5224b5f990a3b..9e76389fc328b90c835b4a82dd5f94c1ec3ca8ea
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
@@ -11,10 +11,24 @@
 const BASE_PERSON_WEIGHT = 1;
 
 /**
+ * Multiplier used for a person whose roster entry does not set one
+ */
+const DEFAULT_PERSON_FACTOR = 1;
+
+/**
+ * Multiplier of a person's credited episode appearances when drawing the roster
+ */
+function getPersonFactor(person: AiTaKrajtaPerson): number {
+    return person.factor ?? DEFAULT_PERSON_FACTOR;
+}
+
+/**
  * How much of the front of the list one person has a chance at, which is how often the show has them on
  */
 function getPersonWeight(person: AiTaKrajtaPerson, episodeCountByPersonId: ReadonlyMap<string, number>): number {
-    return BASE_PERSON_WEIGHT + (episodeCountByPersonId.get(person.id) ?? 0);
+    const episodeCount = episodeCountByPersonId.get(person.id) ?? 0;
+
+    return BASE_PERSON_WEIGHT + episodeCount * getPersonFactor(person);
 }
 
 /**
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 83d8b0f693509e0926ab81b0ce15225503d91f9c..af4c5838b8655f74fa88c2bb085da45e78ef7274
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,5 +1,9 @@
 # Current preversion
 
+- Added per-host episode-appearance factors to the `/ai-ta-krajta` roster draw. Hosts still default to their exact
+  episode count, while Katka Fajmanová receives 1.7×, Tomáš Mikolov 5×, and Pavol Hejný 0.8× before weighted ordering.
+  The shared calculation affects both the hydration-safe initial order and each visitor's fresh randomized draw.
+
 - Added `Dneska` and `Zítra` event badges ahead of `Tento týden`, based on Prague calendar dates. Shared cards,
   calendars, landing-page term choices, and the admin picker use the same phases and theme-aware colours. Terms
   still switch to `Probíhá` at their start and remain eligible for waiting-room choices and follow-up recommendations.

apply patch
patch: completed
C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron\changelog\_current-preversion.md
diff --git a/AGENTS.md b/AGENTS.md
index d000c5fd0c0fe752490b216922648f5e0d80e798..48cff802c904a42423498e64acfd3d8115bacb73
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -57,8 +57,8 @@
   zoom only when reduced motion is not requested. A future person without a photo
   keeps initials on that same background. The one people list is drawn anew
   for every visit, weighted by how many episodes of the archive name each
-  person, so somebody heard often comes up high far more often than someone in
-  one díl without the list ever becoming a ranking. The draw is local state and
+  person after their roster factor is applied (one by default), so somebody heard
+  often comes up high far more often than someone in one díl without the list ever becoming a ranking. The draw is local state and
   is made in the browser; the page itself is built in the order the draw leans
   towards, from the most often named person to the least often named one, so the
   browser hydrates into the list it was sent.
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
index 409d1caf0bc77cb7adf64cb527b4050f6b73369e..1f2984898a11cb0555b41680c6114d0e1f2ecad1
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
@@ -33,6 +33,18 @@
 });
 
 describe('AI_TA_KRAJTA_PEOPLE', () => {
+    it('sets the requested episode-appearance factors', () => {
+        const factoredPeople = AI_TA_KRAJTA_PEOPLE.filter((person) => person.factor !== undefined).map(
+            ({ id, factor }) => ({ id, factor }),
+        );
+
+        expect(factoredPeople).toEqual([
+            { id: 'pavol-hejny', factor: 0.8 },
+            { id: 'katka-fajmanova', factor: 1.7 },
+            { id: 'tomas-mikolov', factor: 5 },
+        ]);
+    });
+
     // Note: A portrait which is only named and never cut breaks in the browser and nowhere else, which is why the
     //       roster is read against `public` here rather than trusted.
     it.each(AI_TA_KRAJTA_PEOPLE)(
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
index 7c41d07a8690c6d211fd32ab581dbc9b654b7cad..d4d59c6a380035522099d63172eedb3c10ee16e6
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
@@ -14,6 +14,14 @@
     readonly name: string;
 
     /**
+     * Multiplier of this person's credited episode appearances when the roster is drawn
+     *
+     * Note: Omitting it keeps the ordinary factor of one. It affects only the chance of a person appearing near the
+     *       front of the roster; episode counts themselves stay exact.
+     */
+    readonly factor?: number;
+
+    /**
      * What the person does, in one line and only as far as the episodes of the show actually say it
      */
     readonly headline: string;
@@ -60,6 +68,7 @@
     {
         id: 'pavol-hejny',
         name: 'Pavol Hejný',
+        factor: 0.8,
         headline: 'AI konzultant a vývojář. Staví AI agenty a v dílech je rozebírá z praxe.',
         url: 'https://www.ptbk.io/pavol',
         photoFileName: 'pavol-hejny.png',
@@ -128,6 +137,7 @@
     {
         id: 'katka-fajmanova',
         name: 'Katka Fajmanová',
+        factor: 1.7,
         headline: 'Architektura a interpretabilita modelů. Díl o tom, co se děje uvnitř sítě.',
         url: null,
         photoFileName: 'katka-fajmanova.png',
@@ -239,6 +249,7 @@
     {
         id: 'tomas-mikolov',
         name: 'Tomáš Mikolov',
+        factor: 5,
         headline: 'Spoluzakladatel BottleCap AI. V Googlu zažil doby, kdy se stavěly základy dnešních modelů.',
         url: 'https://bottlecapai.com/',
         photoFileName: 'tomas-mikolov.png',
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
index eab515daf7a3dec85b218da514a41326b7e6675f..c074153e99ba597c811d828a5856efcd6ae72a8d
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
@@ -10,10 +10,11 @@
  */
 const DRAW_COUNT = 500;
 
-function createPerson(id: string): AiTaKrajtaPerson {
+function createPerson(id: string, factor?: number): AiTaKrajtaPerson {
     return {
         id,
         name: id,
+        factor,
         headline: 'Mluví do mikrofonu.',
         url: null,
         photoFileName: null,
@@ -68,6 +69,26 @@
         expect(ordered.map((person) => person.id)).toEqual(PEOPLE.map((person) => person.id));
     });
 
+    it('multiplies credited episode appearances by a person factor', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('frequent-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['frequent-contributor', 4],
+        ]);
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, episodeCountByPersonId);
+
+        expect(ordered.map((person) => person.id)).toEqual(['boosted-contributor', 'frequent-contributor']);
+    });
+
+    it('does not apply a person factor to the base chance without credited appearances', () => {
+        const people = [createPerson('ordinary-contributor'), createPerson('boosted-contributor', 5)];
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, new Map());
+
+        expect(ordered.map((person) => person.id)).toEqual(['ordinary-contributor', 'boosted-contributor']);
+    });
+
     it('leaves the roster it was given alone', () => {
         orderAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID);
 
@@ -102,6 +123,24 @@
         expect(frequentContributorTopCount).toBeLessThan(DRAW_COUNT);
     });
 
+    it('uses a person factor when drawing the weighted order', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('ordinary-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['ordinary-contributor', 1],
+        ]);
+        const randomNumbers = [0.1, 0.2];
+        let nextRandomNumberIndex = 0;
+
+        const shuffled = shuffleAiTaKrajtaPeopleByAppearances(
+            people,
+            episodeCountByPersonId,
+            () => randomNumbers[nextRandomNumberIndex++]!,
+        );
+
+        expect(shuffled.map((person) => person.id)).toEqual(['boosted-contributor', 'ordinary-contributor']);
+    });
+
     it('moves even somebody the archive never names around the list', () => {
         const placesOfNeverNamed = collectPlacesByPersonId().get('never-named')!;
 
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
index 516fd7222668e8843dd2c2b7e0a5224b5f990a3b..9e76389fc328b90c835b4a82dd5f94c1ec3ca8ea
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
@@ -11,10 +11,24 @@
 const BASE_PERSON_WEIGHT = 1;
 
 /**
+ * Multiplier used for a person whose roster entry does not set one
+ */
+const DEFAULT_PERSON_FACTOR = 1;
+
+/**
+ * Multiplier of a person's credited episode appearances when drawing the roster
+ */
+function getPersonFactor(person: AiTaKrajtaPerson): number {
+    return person.factor ?? DEFAULT_PERSON_FACTOR;
+}
+
+/**
  * How much of the front of the list one person has a chance at, which is how often the show has them on
  */
 function getPersonWeight(person: AiTaKrajtaPerson, episodeCountByPersonId: ReadonlyMap<string, number>): number {
-    return BASE_PERSON_WEIGHT + (episodeCountByPersonId.get(person.id) ?? 0);
+    const episodeCount = episodeCountByPersonId.get(person.id) ?? 0;
+
+    return BASE_PERSON_WEIGHT + episodeCount * getPersonFactor(person);
 }
 
 /**
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 83d8b0f693509e0926ab81b0ce15225503d91f9c..974fd05250e6726416d8866b07a4e9edac0cbb36
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,5 +1,10 @@
 # Current preversion
 
+- Added per-host episode-appearance factors to the `/ai-ta-krajta` roster draw. Hosts retain the ordinary 1×
+  contribution from their episode appearances, while Katka Fajmanová receives 1.7×, Tomáš Mikolov 5×, and Pavol Hejný
+  0.8× before weighted ordering.
+  The shared calculation affects both the hydration-safe initial order and each visitor's fresh randomized draw.
+
 - Added `Dneska` and `Zítra` event badges ahead of `Tento týden`, based on Prague calendar dates. Shared cards,
   calendars, landing-page term choices, and the admin picker use the same phases and theme-aware colours. Terms
   still switch to `Probíhá` at their start and remain eligible for waiting-room choices and follow-up recommendations.

diff --git a/AGENTS.md b/AGENTS.md
index d000c5fd0c0fe752490b216922648f5e0d80e798..48cff802c904a42423498e64acfd3d8115bacb73
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -57,8 +57,8 @@
   zoom only when reduced motion is not requested. A future person without a photo
   keeps initials on that same background. The one people list is drawn anew
   for every visit, weighted by how many episodes of the archive name each
-  person, so somebody heard often comes up high far more often than someone in
-  one díl without the list ever becoming a ranking. The draw is local state and
+  person after their roster factor is applied (one by default), so somebody heard
+  often comes up high far more often than someone in one díl without the list ever becoming a ranking. The draw is local state and
   is made in the browser; the page itself is built in the order the draw leans
   towards, from the most often named person to the least often named one, so the
   browser hydrates into the list it was sent.
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
index 409d1caf0bc77cb7adf64cb527b4050f6b73369e..1f2984898a11cb0555b41680c6114d0e1f2ecad1
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
@@ -33,6 +33,18 @@
 });
 
 describe('AI_TA_KRAJTA_PEOPLE', () => {
+    it('sets the requested episode-appearance factors', () => {
+        const factoredPeople = AI_TA_KRAJTA_PEOPLE.filter((person) => person.factor !== undefined).map(
+            ({ id, factor }) => ({ id, factor }),
+        );
+
+        expect(factoredPeople).toEqual([
+            { id: 'pavol-hejny', factor: 0.8 },
+            { id: 'katka-fajmanova', factor: 1.7 },
+            { id: 'tomas-mikolov', factor: 5 },
+        ]);
+    });
+
     // Note: A portrait which is only named and never cut breaks in the browser and nowhere else, which is why the
     //       roster is read against `public` here rather than trusted.
     it.each(AI_TA_KRAJTA_PEOPLE)(
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
index 7c41d07a8690c6d211fd32ab581dbc9b654b7cad..d4d59c6a380035522099d63172eedb3c10ee16e6
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
@@ -14,6 +14,14 @@
     readonly name: string;
 
     /**
+     * Multiplier of this person's credited episode appearances when the roster is drawn
+     *
+     * Note: Omitting it keeps the ordinary factor of one. It affects only the chance of a person appearing near the
+     *       front of the roster; episode counts themselves stay exact.
+     */
+    readonly factor?: number;
+
+    /**
      * What the person does, in one line and only as far as the episodes of the show actually say it
      */
     readonly headline: string;
@@ -60,6 +68,7 @@
     {
         id: 'pavol-hejny',
         name: 'Pavol Hejný',
+        factor: 0.8,
         headline: 'AI konzultant a vývojář. Staví AI agenty a v dílech je rozebírá z praxe.',
         url: 'https://www.ptbk.io/pavol',
         photoFileName: 'pavol-hejny.png',
@@ -128,6 +137,7 @@
     {
         id: 'katka-fajmanova',
         name: 'Katka Fajmanová',
+        factor: 1.7,
         headline: 'Architektura a interpretabilita modelů. Díl o tom, co se děje uvnitř sítě.',
         url: null,
         photoFileName: 'katka-fajmanova.png',
@@ -239,6 +249,7 @@
     {
         id: 'tomas-mikolov',
         name: 'Tomáš Mikolov',
+        factor: 5,
         headline: 'Spoluzakladatel BottleCap AI. V Googlu zažil doby, kdy se stavěly základy dnešních modelů.',
         url: 'https://bottlecapai.com/',
         photoFileName: 'tomas-mikolov.png',
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
index eab515daf7a3dec85b218da514a41326b7e6675f..c074153e99ba597c811d828a5856efcd6ae72a8d
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
@@ -10,10 +10,11 @@
  */
 const DRAW_COUNT = 500;
 
-function createPerson(id: string): AiTaKrajtaPerson {
+function createPerson(id: string, factor?: number): AiTaKrajtaPerson {
     return {
         id,
         name: id,
+        factor,
         headline: 'Mluví do mikrofonu.',
         url: null,
         photoFileName: null,
@@ -68,6 +69,26 @@
         expect(ordered.map((person) => person.id)).toEqual(PEOPLE.map((person) => person.id));
     });
 
+    it('multiplies credited episode appearances by a person factor', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('frequent-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['frequent-contributor', 4],
+        ]);
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, episodeCountByPersonId);
+
+        expect(ordered.map((person) => person.id)).toEqual(['boosted-contributor', 'frequent-contributor']);
+    });
+
+    it('does not apply a person factor to the base chance without credited appearances', () => {
+        const people = [createPerson('ordinary-contributor'), createPerson('boosted-contributor', 5)];
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, new Map());
+
+        expect(ordered.map((person) => person.id)).toEqual(['ordinary-contributor', 'boosted-contributor']);
+    });
+
     it('leaves the roster it was given alone', () => {
         orderAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID);
 
@@ -102,6 +123,24 @@
         expect(frequentContributorTopCount).toBeLessThan(DRAW_COUNT);
     });
 
+    it('uses a person factor when drawing the weighted order', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('ordinary-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['ordinary-contributor', 1],
+        ]);
+        const randomNumbers = [0.1, 0.2];
+        let nextRandomNumberIndex = 0;
+
+        const shuffled = shuffleAiTaKrajtaPeopleByAppearances(
+            people,
+            episodeCountByPersonId,
+            () => randomNumbers[nextRandomNumberIndex++]!,
+        );
+
+        expect(shuffled.map((person) => person.id)).toEqual(['boosted-contributor', 'ordinary-contributor']);
+    });
+
     it('moves even somebody the archive never names around the list', () => {
         const placesOfNeverNamed = collectPlacesByPersonId().get('never-named')!;
 
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
index 516fd7222668e8843dd2c2b7e0a5224b5f990a3b..9e76389fc328b90c835b4a82dd5f94c1ec3ca8ea
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
@@ -11,10 +11,24 @@
 const BASE_PERSON_WEIGHT = 1;
 
 /**
+ * Multiplier used for a person whose roster entry does not set one
+ */
+const DEFAULT_PERSON_FACTOR = 1;
+
+/**
+ * Multiplier of a person's credited episode appearances when drawing the roster
+ */
+function getPersonFactor(person: AiTaKrajtaPerson): number {
+    return person.factor ?? DEFAULT_PERSON_FACTOR;
+}
+
+/**
  * How much of the front of the list one person has a chance at, which is how often the show has them on
  */
 function getPersonWeight(person: AiTaKrajtaPerson, episodeCountByPersonId: ReadonlyMap<string, number>): number {
-    return BASE_PERSON_WEIGHT + (episodeCountByPersonId.get(person.id) ?? 0);
+    const episodeCount = episodeCountByPersonId.get(person.id) ?? 0;
+
+    return BASE_PERSON_WEIGHT + episodeCount * getPersonFactor(person);
 }
 
 /**
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 83d8b0f693509e0926ab81b0ce15225503d91f9c..974fd05250e6726416d8866b07a4e9edac0cbb36
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,5 +1,10 @@
 # Current preversion
 
+- Added per-host episode-appearance factors to the `/ai-ta-krajta` roster draw. Hosts retain the ordinary 1×
+  contribution from their episode appearances, while Katka Fajmanová receives 1.7×, Tomáš Mikolov 5×, and Pavol Hejný
+  0.8× before weighted ordering.
+  The shared calculation affects both the hydration-safe initial order and each visitor's fresh randomized draw.
+
 - Added `Dneska` and `Zítra` event badges ahead of `Tento týden`, based on Prague calendar dates. Shared cards,
   calendars, landing-page term choices, and the admin picker use the same phases and theme-aware colours. Terms
   still switch to `Probíhá` at their start and remain eligible for waiting-room choices and follow-up recommendations.

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command 'git diff --check' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 200ms:
diff --git a/AGENTS.md b/AGENTS.md
index d000c5fd0c0fe752490b216922648f5e0d80e798..48cff802c904a42423498e64acfd3d8115bacb73
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -57,8 +57,8 @@
   zoom only when reduced motion is not requested. A future person without a photo
   keeps initials on that same background. The one people list is drawn anew
   for every visit, weighted by how many episodes of the archive name each
-  person, so somebody heard often comes up high far more often than someone in
-  one díl without the list ever becoming a ranking. The draw is local state and
+  person after their roster factor is applied (one by default), so somebody heard
+  often comes up high far more often than someone in one díl without the list ever becoming a ranking. The draw is local state and
   is made in the browser; the page itself is built in the order the draw leans
   towards, from the most often named person to the least often named one, so the
   browser hydrates into the list it was sent.
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
index 409d1caf0bc77cb7adf64cb527b4050f6b73369e..1f2984898a11cb0555b41680c6114d0e1f2ecad1
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
@@ -33,6 +33,18 @@
 });
 
 describe('AI_TA_KRAJTA_PEOPLE', () => {
+    it('sets the requested episode-appearance factors', () => {
+        const factoredPeople = AI_TA_KRAJTA_PEOPLE.filter((person) => person.factor !== undefined).map(
+            ({ id, factor }) => ({ id, factor }),
+        );
+
+        expect(factoredPeople).toEqual([
+            { id: 'pavol-hejny', factor: 0.8 },
+            { id: 'katka-fajmanova', factor: 1.7 },
+            { id: 'tomas-mikolov', factor: 5 },
+        ]);
+    });
+
     // Note: A portrait which is only named and never cut breaks in the browser and nowhere else, which is why the
     //       roster is read against `public` here rather than trusted.
     it.each(AI_TA_KRAJTA_PEOPLE)(
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
index 7c41d07a8690c6d211fd32ab581dbc9b654b7cad..d4d59c6a380035522099d63172eedb3c10ee16e6
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
@@ -14,6 +14,14 @@
     readonly name: string;
 
     /**
+     * Multiplier of this person's credited episode appearances when the roster is drawn
+     *
+     * Note: Omitting it keeps the ordinary factor of one. It affects only the chance of a person appearing near the
+     *       front of the roster; episode counts themselves stay exact.
+     */
+    readonly factor?: number;
+
+    /**
      * What the person does, in one line and only as far as the episodes of the show actually say it
      */
     readonly headline: string;
@@ -60,6 +68,7 @@
     {
         id: 'pavol-hejny',
         name: 'Pavol Hejný',
+        factor: 0.8,
         headline: 'AI konzultant a vývojář. Staví AI agenty a v dílech je rozebírá z praxe.',
         url: 'https://www.ptbk.io/pavol',
         photoFileName: 'pavol-hejny.png',
@@ -128,6 +137,7 @@
     {
         id: 'katka-fajmanova',
         name: 'Katka Fajmanová',
+        factor: 1.7,
         headline: 'Architektura a interpretabilita modelů. Díl o tom, co se děje uvnitř sítě.',
         url: null,
         photoFileName: 'katka-fajmanova.png',
@@ -239,6 +249,7 @@
     {
         id: 'tomas-mikolov',
         name: 'Tomáš Mikolov',
+        factor: 5,
         headline: 'Spoluzakladatel BottleCap AI. V Googlu zažil doby, kdy se stavěly základy dnešních modelů.',
         url: 'https://bottlecapai.com/',
         photoFileName: 'tomas-mikolov.png',
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
index eab515daf7a3dec85b218da514a41326b7e6675f..c074153e99ba597c811d828a5856efcd6ae72a8d
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
@@ -10,10 +10,11 @@
  */
 const DRAW_COUNT = 500;
 
-function createPerson(id: string): AiTaKrajtaPerson {
+function createPerson(id: string, factor?: number): AiTaKrajtaPerson {
     return {
         id,
         name: id,
+        factor,
         headline: 'Mluví do mikrofonu.',
         url: null,
         photoFileName: null,
@@ -68,6 +69,26 @@
         expect(ordered.map((person) => person.id)).toEqual(PEOPLE.map((person) => person.id));
     });
 
+    it('multiplies credited episode appearances by a person factor', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('frequent-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['frequent-contributor', 4],
+        ]);
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, episodeCountByPersonId);
+
+        expect(ordered.map((person) => person.id)).toEqual(['boosted-contributor', 'frequent-contributor']);
+    });
+
+    it('does not apply a person factor to the base chance without credited appearances', () => {
+        const people = [createPerson('ordinary-contributor'), createPerson('boosted-contributor', 5)];
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, new Map());
+
+        expect(ordered.map((person) => person.id)).toEqual(['ordinary-contributor', 'boosted-contributor']);
+    });
+
     it('leaves the roster it was given alone', () => {
         orderAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID);
 
@@ -102,6 +123,24 @@
         expect(frequentContributorTopCount).toBeLessThan(DRAW_COUNT);
     });
 
+    it('uses a person factor when drawing the weighted order', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('ordinary-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['ordinary-contributor', 1],
+        ]);
+        const randomNumbers = [0.1, 0.2];
+        let nextRandomNumberIndex = 0;
+
+        const shuffled = shuffleAiTaKrajtaPeopleByAppearances(
+            people,
+            episodeCountByPersonId,
+            () => randomNumbers[nextRandomNumberIndex++]!,
+        );
+
+        expect(shuffled.map((person) => person.id)).toEqual(['boosted-contributor', 'ordinary-contributor']);
+    });
+
     it('moves even somebody the archive never names around the list', () => {
         const placesOfNeverNamed = collectPlacesByPersonId().get('never-named')!;
 
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
index 516fd7222668e8843dd2c2b7e0a5224b5f990a3b..9e76389fc328b90c835b4a82dd5f94c1ec3ca8ea
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
@@ -11,10 +11,24 @@
 const BASE_PERSON_WEIGHT = 1;
 
 /**
+ * Multiplier used for a person whose roster entry does not set one
+ */
+const DEFAULT_PERSON_FACTOR = 1;
+
+/**
+ * Multiplier of a person's credited episode appearances when drawing the roster
+ */
+function getPersonFactor(person: AiTaKrajtaPerson): number {
+    return person.factor ?? DEFAULT_PERSON_FACTOR;
+}
+
+/**
  * How much of the front of the list one person has a chance at, which is how often the show has them on
  */
 function getPersonWeight(person: AiTaKrajtaPerson, episodeCountByPersonId: ReadonlyMap<string, number>): number {
-    return BASE_PERSON_WEIGHT + (episodeCountByPersonId.get(person.id) ?? 0);
+    const episodeCount = episodeCountByPersonId.get(person.id) ?? 0;
+
+    return BASE_PERSON_WEIGHT + episodeCount * getPersonFactor(person);
 }
 
 /**
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 83d8b0f693509e0926ab81b0ce15225503d91f9c..974fd05250e6726416d8866b07a4e9edac0cbb36
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,5 +1,10 @@
 # Current preversion
 
+- Added per-host episode-appearance factors to the `/ai-ta-krajta` roster draw. Hosts retain the ordinary 1×
+  contribution from their episode appearances, while Katka Fajmanová receives 1.7×, Tomáš Mikolov 5×, and Pavol Hejný
+  0.8× before weighted ordering.
+  The shared calculation affects both the hydration-safe initial order and each visitor's fresh randomized draw.
+
 - Added `Dneska` and `Zítra` event badges ahead of `Tento týden`, based on Prague calendar dates. Shared cards,
   calendars, landing-page term choices, and the admin picker use the same phases and theme-aware colours. Terms
   still switch to `Probíhá` at their start and remain eligible for waiting-room choices and follow-up recommendations.

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command 'rg -n "factor|DEFAULT_PERSON_FACTOR|episode-appearance factors" businesses/ai-ta-krajta/aiTaKrajtaPeople.ts businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts changelog/_current-preversion.md AGENTS.md' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 225ms:
businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts:16:const DEFAULT_PERSON_FACTOR = 1;
businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts:22:    return person.factor ?? DEFAULT_PERSON_FACTOR;
AGENTS.md:12:  `/hackathon-factory`, and `/pavol` are specialized landing pages. `/pavol`
AGENTS.md:60:  person after their roster factor is applied (one by default), so somebody heard
changelog/_current-preversion.md:3:- Added per-host episode-appearance factors to the `/ai-ta-krajta` roster draw. Hosts retain the ordinary 1×
changelog/_current-preversion.md:587:- Rebuilt page metadata around one shared `createPageMetadata` factory, so every page derives its title, description, canonical, `hreflang` alternates, Open Graph and X card from a single definition instead of repeating them.
changelog/_current-preversion.md:589:- Generated on-brand sharing preview images for every landing page (`/cs`, `/en`, `/pro-mesta`, `/for-agro`, `/for-industry`, `/ai-supervize`, `/ai-supervize-mini`, `/cs/online-workshop`, `/hackathon-factory`, `/cs/pavol`, `/en/pavol`) from a derived palette, and dropped the duplicated `twitter-image` routes.
businesses/ai-ta-krajta/aiTaKrajtaPeople.ts:19:     * Note: Omitting it keeps the ordinary factor of one. It affects only the chance of a person appearing near the
businesses/ai-ta-krajta/aiTaKrajtaPeople.ts:22:    readonly factor?: number;
businesses/ai-ta-krajta/aiTaKrajtaPeople.ts:71:        factor: 0.8,
businesses/ai-ta-krajta/aiTaKrajtaPeople.ts:140:        factor: 1.7,
businesses/ai-ta-krajta/aiTaKrajtaPeople.ts:252:        factor: 5,

diff --git a/AGENTS.md b/AGENTS.md
index d000c5fd0c0fe752490b216922648f5e0d80e798..48cff802c904a42423498e64acfd3d8115bacb73
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -57,8 +57,8 @@
   zoom only when reduced motion is not requested. A future person without a photo
   keeps initials on that same background. The one people list is drawn anew
   for every visit, weighted by how many episodes of the archive name each
-  person, so somebody heard often comes up high far more often than someone in
-  one díl without the list ever becoming a ranking. The draw is local state and
+  person after their roster factor is applied (one by default), so somebody heard
+  often comes up high far more often than someone in one díl without the list ever becoming a ranking. The draw is local state and
   is made in the browser; the page itself is built in the order the draw leans
   towards, from the most often named person to the least often named one, so the
   browser hydrates into the list it was sent.
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
index 409d1caf0bc77cb7adf64cb527b4050f6b73369e..1f2984898a11cb0555b41680c6114d0e1f2ecad1
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
@@ -33,6 +33,18 @@
 });
 
 describe('AI_TA_KRAJTA_PEOPLE', () => {
+    it('sets the requested episode-appearance factors', () => {
+        const factoredPeople = AI_TA_KRAJTA_PEOPLE.filter((person) => person.factor !== undefined).map(
+            ({ id, factor }) => ({ id, factor }),
+        );
+
+        expect(factoredPeople).toEqual([
+            { id: 'pavol-hejny', factor: 0.8 },
+            { id: 'katka-fajmanova', factor: 1.7 },
+            { id: 'tomas-mikolov', factor: 5 },
+        ]);
+    });
+
     // Note: A portrait which is only named and never cut breaks in the browser and nowhere else, which is why the
     //       roster is read against `public` here rather than trusted.
     it.each(AI_TA_KRAJTA_PEOPLE)(
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
index 7c41d07a8690c6d211fd32ab581dbc9b654b7cad..d4d59c6a380035522099d63172eedb3c10ee16e6
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
@@ -14,6 +14,14 @@
     readonly name: string;
 
     /**
+     * Multiplier of this person's credited episode appearances when the roster is drawn
+     *
+     * Note: Omitting it keeps the ordinary factor of one. It affects only the chance of a person appearing near the
+     *       front of the roster; episode counts themselves stay exact.
+     */
+    readonly factor?: number;
+
+    /**
      * What the person does, in one line and only as far as the episodes of the show actually say it
      */
     readonly headline: string;
@@ -60,6 +68,7 @@
     {
         id: 'pavol-hejny',
         name: 'Pavol Hejný',
+        factor: 0.8,
         headline: 'AI konzultant a vývojář. Staví AI agenty a v dílech je rozebírá z praxe.',
         url: 'https://www.ptbk.io/pavol',
         photoFileName: 'pavol-hejny.png',
@@ -128,6 +137,7 @@
     {
         id: 'katka-fajmanova',
         name: 'Katka Fajmanová',
+        factor: 1.7,
         headline: 'Architektura a interpretabilita modelů. Díl o tom, co se děje uvnitř sítě.',
         url: null,
         photoFileName: 'katka-fajmanova.png',
@@ -239,6 +249,7 @@
     {
         id: 'tomas-mikolov',
         name: 'Tomáš Mikolov',
+        factor: 5,
         headline: 'Spoluzakladatel BottleCap AI. V Googlu zažil doby, kdy se stavěly základy dnešních modelů.',
         url: 'https://bottlecapai.com/',
         photoFileName: 'tomas-mikolov.png',
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
index eab515daf7a3dec85b218da514a41326b7e6675f..c074153e99ba597c811d828a5856efcd6ae72a8d
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
@@ -10,10 +10,11 @@
  */
 const DRAW_COUNT = 500;
 
-function createPerson(id: string): AiTaKrajtaPerson {
+function createPerson(id: string, factor?: number): AiTaKrajtaPerson {
     return {
         id,
         name: id,
+        factor,
         headline: 'Mluví do mikrofonu.',
         url: null,
         photoFileName: null,
@@ -68,6 +69,26 @@
         expect(ordered.map((person) => person.id)).toEqual(PEOPLE.map((person) => person.id));
     });
 
+    it('multiplies credited episode appearances by a person factor', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('frequent-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['frequent-contributor', 4],
+        ]);
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, episodeCountByPersonId);
+
+        expect(ordered.map((person) => person.id)).toEqual(['boosted-contributor', 'frequent-contributor']);
+    });
+
+    it('does not apply a person factor to the base chance without credited appearances', () => {
+        const people = [createPerson('ordinary-contributor'), createPerson('boosted-contributor', 5)];
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, new Map());
+
+        expect(ordered.map((person) => person.id)).toEqual(['ordinary-contributor', 'boosted-contributor']);
+    });
+
     it('leaves the roster it was given alone', () => {
         orderAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID);
 
@@ -102,6 +123,24 @@
         expect(frequentContributorTopCount).toBeLessThan(DRAW_COUNT);
     });
 
+    it('uses a person factor when drawing the weighted order', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('ordinary-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['ordinary-contributor', 1],
+        ]);
+        const randomNumbers = [0.1, 0.2];
+        let nextRandomNumberIndex = 0;
+
+        const shuffled = shuffleAiTaKrajtaPeopleByAppearances(
+            people,
+            episodeCountByPersonId,
+            () => randomNumbers[nextRandomNumberIndex++]!,
+        );
+
+        expect(shuffled.map((person) => person.id)).toEqual(['boosted-contributor', 'ordinary-contributor']);
+    });
+
     it('moves even somebody the archive never names around the list', () => {
         const placesOfNeverNamed = collectPlacesByPersonId().get('never-named')!;
 
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
index 516fd7222668e8843dd2c2b7e0a5224b5f990a3b..9e76389fc328b90c835b4a82dd5f94c1ec3ca8ea
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
@@ -11,10 +11,24 @@
 const BASE_PERSON_WEIGHT = 1;
 
 /**
+ * Multiplier used for a person whose roster entry does not set one
+ */
+const DEFAULT_PERSON_FACTOR = 1;
+
+/**
+ * Multiplier of a person's credited episode appearances when drawing the roster
+ */
+function getPersonFactor(person: AiTaKrajtaPerson): number {
+    return person.factor ?? DEFAULT_PERSON_FACTOR;
+}
+
+/**
  * How much of the front of the list one person has a chance at, which is how often the show has them on
  */
 function getPersonWeight(person: AiTaKrajtaPerson, episodeCountByPersonId: ReadonlyMap<string, number>): number {
-    return BASE_PERSON_WEIGHT + (episodeCountByPersonId.get(person.id) ?? 0);
+    const episodeCount = episodeCountByPersonId.get(person.id) ?? 0;
+
+    return BASE_PERSON_WEIGHT + episodeCount * getPersonFactor(person);
 }
 
 /**
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 83d8b0f693509e0926ab81b0ce15225503d91f9c..974fd05250e6726416d8866b07a4e9edac0cbb36
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,5 +1,10 @@
 # Current preversion
 
+- Added per-host episode-appearance factors to the `/ai-ta-krajta` roster draw. Hosts retain the ordinary 1×
+  contribution from their episode appearances, while Katka Fajmanová receives 1.7×, Tomáš Mikolov 5×, and Pavol Hejný
+  0.8× before weighted ordering.
+  The shared calculation affects both the hydration-safe initial order and each visitor's fresh randomized draw.
+
 - Added `Dneska` and `Zítra` event badges ahead of `Tento týden`, based on Prague calendar dates. Shared cards,
   calendars, landing-page term choices, and the admin picker use the same phases and theme-aware colours. Terms
   still switch to `Probíhá` at their start and remain eligible for waiting-room choices and follow-up recommendations.

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command "rg -n \"episodeCount \\* getPersonFactor|sets the requested|uses a person factor\" businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts" in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 214ms:
businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts:31:    return BASE_PERSON_WEIGHT + episodeCount * getPersonFactor(person);
businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts:36:    it('sets the requested episode-appearance factors', () => {
businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts:126:    it('uses a person factor when drawing the weighted order', () => {

diff --git a/AGENTS.md b/AGENTS.md
index d000c5fd0c0fe752490b216922648f5e0d80e798..48cff802c904a42423498e64acfd3d8115bacb73
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -57,8 +57,8 @@
   zoom only when reduced motion is not requested. A future person without a photo
   keeps initials on that same background. The one people list is drawn anew
   for every visit, weighted by how many episodes of the archive name each
-  person, so somebody heard often comes up high far more often than someone in
-  one díl without the list ever becoming a ranking. The draw is local state and
+  person after their roster factor is applied (one by default), so somebody heard
+  often comes up high far more often than someone in one díl without the list ever becoming a ranking. The draw is local state and
   is made in the browser; the page itself is built in the order the draw leans
   towards, from the most often named person to the least often named one, so the
   browser hydrates into the list it was sent.
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
index 409d1caf0bc77cb7adf64cb527b4050f6b73369e..1f2984898a11cb0555b41680c6114d0e1f2ecad1
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
@@ -33,6 +33,18 @@
 });
 
 describe('AI_TA_KRAJTA_PEOPLE', () => {
+    it('sets the requested episode-appearance factors', () => {
+        const factoredPeople = AI_TA_KRAJTA_PEOPLE.filter((person) => person.factor !== undefined).map(
+            ({ id, factor }) => ({ id, factor }),
+        );
+
+        expect(factoredPeople).toEqual([
+            { id: 'pavol-hejny', factor: 0.8 },
+            { id: 'katka-fajmanova', factor: 1.7 },
+            { id: 'tomas-mikolov', factor: 5 },
+        ]);
+    });
+
     // Note: A portrait which is only named and never cut breaks in the browser and nowhere else, which is why the
     //       roster is read against `public` here rather than trusted.
     it.each(AI_TA_KRAJTA_PEOPLE)(
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
index 7c41d07a8690c6d211fd32ab581dbc9b654b7cad..d4d59c6a380035522099d63172eedb3c10ee16e6
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
@@ -14,6 +14,14 @@
     readonly name: string;
 
     /**
+     * Multiplier of this person's credited episode appearances when the roster is drawn
+     *
+     * Note: Omitting it keeps the ordinary factor of one. It affects only the chance of a person appearing near the
+     *       front of the roster; episode counts themselves stay exact.
+     */
+    readonly factor?: number;
+
+    /**
      * What the person does, in one line and only as far as the episodes of the show actually say it
      */
     readonly headline: string;
@@ -60,6 +68,7 @@
     {
         id: 'pavol-hejny',
         name: 'Pavol Hejný',
+        factor: 0.8,
         headline: 'AI konzultant a vývojář. Staví AI agenty a v dílech je rozebírá z praxe.',
         url: 'https://www.ptbk.io/pavol',
         photoFileName: 'pavol-hejny.png',
@@ -128,6 +137,7 @@
     {
         id: 'katka-fajmanova',
         name: 'Katka Fajmanová',
+        factor: 1.7,
         headline: 'Architektura a interpretabilita modelů. Díl o tom, co se děje uvnitř sítě.',
         url: null,
         photoFileName: 'katka-fajmanova.png',
@@ -239,6 +249,7 @@
     {
         id: 'tomas-mikolov',
         name: 'Tomáš Mikolov',
+        factor: 5,
         headline: 'Spoluzakladatel BottleCap AI. V Googlu zažil doby, kdy se stavěly základy dnešních modelů.',
         url: 'https://bottlecapai.com/',
         photoFileName: 'tomas-mikolov.png',
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
index eab515daf7a3dec85b218da514a41326b7e6675f..c074153e99ba597c811d828a5856efcd6ae72a8d
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
@@ -10,10 +10,11 @@
  */
 const DRAW_COUNT = 500;
 
-function createPerson(id: string): AiTaKrajtaPerson {
+function createPerson(id: string, factor?: number): AiTaKrajtaPerson {
     return {
         id,
         name: id,
+        factor,
         headline: 'Mluví do mikrofonu.',
         url: null,
         photoFileName: null,
@@ -68,6 +69,26 @@
         expect(ordered.map((person) => person.id)).toEqual(PEOPLE.map((person) => person.id));
     });
 
+    it('multiplies credited episode appearances by a person factor', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('frequent-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['frequent-contributor', 4],
+        ]);
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, episodeCountByPersonId);
+
+        expect(ordered.map((person) => person.id)).toEqual(['boosted-contributor', 'frequent-contributor']);
+    });
+
+    it('does not apply a person factor to the base chance without credited appearances', () => {
+        const people = [createPerson('ordinary-contributor'), createPerson('boosted-contributor', 5)];
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, new Map());
+
+        expect(ordered.map((person) => person.id)).toEqual(['ordinary-contributor', 'boosted-contributor']);
+    });
+
     it('leaves the roster it was given alone', () => {
         orderAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID);
 
@@ -102,6 +123,24 @@
         expect(frequentContributorTopCount).toBeLessThan(DRAW_COUNT);
     });
 
+    it('uses a person factor when drawing the weighted order', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('ordinary-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['ordinary-contributor', 1],
+        ]);
+        const randomNumbers = [0.1, 0.2];
+        let nextRandomNumberIndex = 0;
+
+        const shuffled = shuffleAiTaKrajtaPeopleByAppearances(
+            people,
+            episodeCountByPersonId,
+            () => randomNumbers[nextRandomNumberIndex++]!,
+        );
+
+        expect(shuffled.map((person) => person.id)).toEqual(['boosted-contributor', 'ordinary-contributor']);
+    });
+
     it('moves even somebody the archive never names around the list', () => {
         const placesOfNeverNamed = collectPlacesByPersonId().get('never-named')!;
 
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
index 516fd7222668e8843dd2c2b7e0a5224b5f990a3b..9e76389fc328b90c835b4a82dd5f94c1ec3ca8ea
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
@@ -11,10 +11,24 @@
 const BASE_PERSON_WEIGHT = 1;
 
 /**
+ * Multiplier used for a person whose roster entry does not set one
+ */
+const DEFAULT_PERSON_FACTOR = 1;
+
+/**
+ * Multiplier of a person's credited episode appearances when drawing the roster
+ */
+function getPersonFactor(person: AiTaKrajtaPerson): number {
+    return person.factor ?? DEFAULT_PERSON_FACTOR;
+}
+
+/**
  * How much of the front of the list one person has a chance at, which is how often the show has them on
  */
 function getPersonWeight(person: AiTaKrajtaPerson, episodeCountByPersonId: ReadonlyMap<string, number>): number {
-    return BASE_PERSON_WEIGHT + (episodeCountByPersonId.get(person.id) ?? 0);
+    const episodeCount = episodeCountByPersonId.get(person.id) ?? 0;
+
+    return BASE_PERSON_WEIGHT + episodeCount * getPersonFactor(person);
 }
 
 /**
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 83d8b0f693509e0926ab81b0ce15225503d91f9c..974fd05250e6726416d8866b07a4e9edac0cbb36
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,5 +1,10 @@
 # Current preversion
 
+- Added per-host episode-appearance factors to the `/ai-ta-krajta` roster draw. Hosts retain the ordinary 1×
+  contribution from their episode appearances, while Katka Fajmanová receives 1.7×, Tomáš Mikolov 5×, and Pavol Hejný
+  0.8× before weighted ordering.
+  The shared calculation affects both the hydration-safe initial order and each visitor's fresh randomized draw.
+
 - Added `Dneska` and `Zítra` event badges ahead of `Tento týden`, based on Prague calendar dates. Shared cards,
   calendars, landing-page term choices, and the admin picker use the same phases and theme-aware colours. Terms
   still switch to `Probíhá` at their start and remain eligible for waiting-room choices and follow-up recommendations.

codex
Implemented `/ai-ta-krajta` host factors:

- Katka Fajmanová: `1.7`; Tomáš Mikolov: `5`; Pavol Hejný: `0.8`.
- Others default to `1`.
- Shared weighting is now `base + episodeCount × factor`, used by both hydration-safe ordering and browser-side weighted shuffling. See [aiTaKrajtaPeopleOrder.ts](/C:/Users/me/work/promptbook-experiments-and-landing-pages/aldaron/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts:31).
- Added focused tests and updated [the changelog](/C:/Users/me/work/promptbook-experiments-and-landing-pages/aldaron/changelog/_current-preversion.md:3).

Validated with targeted Vitest tests (42 passing), `npm run lint`, `npm run test-types`, and `git diff --check`. The pre-existing prompt-file edit was left untouched.
diff --git a/AGENTS.md b/AGENTS.md
index d000c5fd0c0fe752490b216922648f5e0d80e798..48cff802c904a42423498e64acfd3d8115bacb73
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -57,8 +57,8 @@
   zoom only when reduced motion is not requested. A future person without a photo
   keeps initials on that same background. The one people list is drawn anew
   for every visit, weighted by how many episodes of the archive name each
-  person, so somebody heard often comes up high far more often than someone in
-  one díl without the list ever becoming a ranking. The draw is local state and
+  person after their roster factor is applied (one by default), so somebody heard
+  often comes up high far more often than someone in one díl without the list ever becoming a ranking. The draw is local state and
   is made in the browser; the page itself is built in the order the draw leans
   towards, from the most often named person to the least often named one, so the
   browser hydrates into the list it was sent.
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
index 409d1caf0bc77cb7adf64cb527b4050f6b73369e..1f2984898a11cb0555b41680c6114d0e1f2ecad1
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts
@@ -33,6 +33,18 @@
 });
 
 describe('AI_TA_KRAJTA_PEOPLE', () => {
+    it('sets the requested episode-appearance factors', () => {
+        const factoredPeople = AI_TA_KRAJTA_PEOPLE.filter((person) => person.factor !== undefined).map(
+            ({ id, factor }) => ({ id, factor }),
+        );
+
+        expect(factoredPeople).toEqual([
+            { id: 'pavol-hejny', factor: 0.8 },
+            { id: 'katka-fajmanova', factor: 1.7 },
+            { id: 'tomas-mikolov', factor: 5 },
+        ]);
+    });
+
     // Note: A portrait which is only named and never cut breaks in the browser and nowhere else, which is why the
     //       roster is read against `public` here rather than trusted.
     it.each(AI_TA_KRAJTA_PEOPLE)(
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
index 7c41d07a8690c6d211fd32ab581dbc9b654b7cad..d4d59c6a380035522099d63172eedb3c10ee16e6
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeople.ts
@@ -14,6 +14,14 @@
     readonly name: string;
 
     /**
+     * Multiplier of this person's credited episode appearances when the roster is drawn
+     *
+     * Note: Omitting it keeps the ordinary factor of one. It affects only the chance of a person appearing near the
+     *       front of the roster; episode counts themselves stay exact.
+     */
+    readonly factor?: number;
+
+    /**
      * What the person does, in one line and only as far as the episodes of the show actually say it
      */
     readonly headline: string;
@@ -60,6 +68,7 @@
     {
         id: 'pavol-hejny',
         name: 'Pavol Hejný',
+        factor: 0.8,
         headline: 'AI konzultant a vývojář. Staví AI agenty a v dílech je rozebírá z praxe.',
         url: 'https://www.ptbk.io/pavol',
         photoFileName: 'pavol-hejny.png',
@@ -128,6 +137,7 @@
     {
         id: 'katka-fajmanova',
         name: 'Katka Fajmanová',
+        factor: 1.7,
         headline: 'Architektura a interpretabilita modelů. Díl o tom, co se děje uvnitř sítě.',
         url: null,
         photoFileName: 'katka-fajmanova.png',
@@ -239,6 +249,7 @@
     {
         id: 'tomas-mikolov',
         name: 'Tomáš Mikolov',
+        factor: 5,
         headline: 'Spoluzakladatel BottleCap AI. V Googlu zažil doby, kdy se stavěly základy dnešních modelů.',
         url: 'https://bottlecapai.com/',
         photoFileName: 'tomas-mikolov.png',
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
index eab515daf7a3dec85b218da514a41326b7e6675f..c074153e99ba597c811d828a5856efcd6ae72a8d
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts
@@ -10,10 +10,11 @@
  */
 const DRAW_COUNT = 500;
 
-function createPerson(id: string): AiTaKrajtaPerson {
+function createPerson(id: string, factor?: number): AiTaKrajtaPerson {
     return {
         id,
         name: id,
+        factor,
         headline: 'Mluví do mikrofonu.',
         url: null,
         photoFileName: null,
@@ -68,6 +69,26 @@
         expect(ordered.map((person) => person.id)).toEqual(PEOPLE.map((person) => person.id));
     });
 
+    it('multiplies credited episode appearances by a person factor', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('frequent-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['frequent-contributor', 4],
+        ]);
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, episodeCountByPersonId);
+
+        expect(ordered.map((person) => person.id)).toEqual(['boosted-contributor', 'frequent-contributor']);
+    });
+
+    it('does not apply a person factor to the base chance without credited appearances', () => {
+        const people = [createPerson('ordinary-contributor'), createPerson('boosted-contributor', 5)];
+
+        const ordered = orderAiTaKrajtaPeopleByAppearances(people, new Map());
+
+        expect(ordered.map((person) => person.id)).toEqual(['ordinary-contributor', 'boosted-contributor']);
+    });
+
     it('leaves the roster it was given alone', () => {
         orderAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID);
 
@@ -102,6 +123,24 @@
         expect(frequentContributorTopCount).toBeLessThan(DRAW_COUNT);
     });
 
+    it('uses a person factor when drawing the weighted order', () => {
+        const people = [createPerson('boosted-contributor', 5), createPerson('ordinary-contributor')];
+        const episodeCountByPersonId = new Map([
+            ['boosted-contributor', 1],
+            ['ordinary-contributor', 1],
+        ]);
+        const randomNumbers = [0.1, 0.2];
+        let nextRandomNumberIndex = 0;
+
+        const shuffled = shuffleAiTaKrajtaPeopleByAppearances(
+            people,
+            episodeCountByPersonId,
+            () => randomNumbers[nextRandomNumberIndex++]!,
+        );
+
+        expect(shuffled.map((person) => person.id)).toEqual(['boosted-contributor', 'ordinary-contributor']);
+    });
+
     it('moves even somebody the archive never names around the list', () => {
         const placesOfNeverNamed = collectPlacesByPersonId().get('never-named')!;
 
diff --git a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
index 516fd7222668e8843dd2c2b7e0a5224b5f990a3b..9e76389fc328b90c835b4a82dd5f94c1ec3ca8ea
--- a/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
+++ b/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts
@@ -11,10 +11,24 @@
 const BASE_PERSON_WEIGHT = 1;
 
 /**
+ * Multiplier used for a person whose roster entry does not set one
+ */
+const DEFAULT_PERSON_FACTOR = 1;
+
+/**
+ * Multiplier of a person's credited episode appearances when drawing the roster
+ */
+function getPersonFactor(person: AiTaKrajtaPerson): number {
+    return person.factor ?? DEFAULT_PERSON_FACTOR;
+}
+
+/**
  * How much of the front of the list one person has a chance at, which is how often the show has them on
  */
 function getPersonWeight(person: AiTaKrajtaPerson, episodeCountByPersonId: ReadonlyMap<string, number>): number {
-    return BASE_PERSON_WEIGHT + (episodeCountByPersonId.get(person.id) ?? 0);
+    const episodeCount = episodeCountByPersonId.get(person.id) ?? 0;
+
+    return BASE_PERSON_WEIGHT + episodeCount * getPersonFactor(person);
 }
 
 /**
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 83d8b0f693509e0926ab81b0ce15225503d91f9c..974fd05250e6726416d8866b07a4e9edac0cbb36
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,5 +1,10 @@
 # Current preversion
 
+- Added per-host episode-appearance factors to the `/ai-ta-krajta` roster draw. Hosts retain the ordinary 1×
+  contribution from their episode appearances, while Katka Fajmanová receives 1.7×, Tomáš Mikolov 5×, and Pavol Hejný
+  0.8× before weighted ordering.
+  The shared calculation affects both the hydration-safe initial order and each visitor's fresh randomized draw.
+
 - Added `Dneska` and `Zítra` event badges ahead of `Tento týden`, based on Prague calendar dates. Shared cards,
   calendars, landing-page term choices, and the admin picker use the same phases and theme-aware colours. Terms
   still switch to `Probíhá` at their start and remain eligible for waiting-room choices and follow-up recommendations.

Implemented `/ai-ta-krajta` host factors:

- Katka Fajmanová: `1.7`; Tomáš Mikolov: `5`; Pavol Hejný: `0.8`.
- Others default to `1`.
- Shared weighting is now `base + episodeCount × factor`, used by both hydration-safe ordering and browser-side weighted shuffling. See [aiTaKrajtaPeopleOrder.ts](/C:/Users/me/work/promptbook-experiments-and-landing-pages/aldaron/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.ts:31).
- Added focused tests and updated [the changelog](/C:/Users/me/work/promptbook-experiments-and-landing-pages/aldaron/changelog/_current-preversion.md:3).

Validated with targeted Vitest tests (42 passing), `npm run lint`, `npm run test-types`, and `git diff --check`. The pre-existing prompt-file edit was left untouched.
tokens used
100,844

=== runner shell finished at 2026-09-22T11:51:40.620Z ===
Status: succeeded

=== test shell started at 2026-09-22T11:51:40.635Z ===
Script path: /c/Users/me/work/promptbook-experiments-and-landing-pages/aldaron/.promptbook/coder-prompts/2026-09-0560-ai-ta-krajta-people-factor.test.sh

--- raw input ---
cd "/c/Users/me/work/promptbook-experiments-and-landing-pages/aldaron"
npm run test-for-ptbk-coder

--- raw output ---

> promptbook-landing-page@0.1.0 test-for-ptbk-coder
> npm run lint && npx kill-port 4009 && npm run test-types && npm run test-e2e && npm run delete-test-data


> promptbook-landing-page@0.1.0 lint
> next lint


./components/public-web-page-preview-image.tsx
33:13  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
Process on port 4009 killed

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
BenefitsSection rendered
IntegrationsSection rendered
BenefitsSection rendered
BenefitsSection rendered
IntegrationsSection rendered
BenefitsSection rendered
IntegrationsSection rendered
BenefitsSection rendered
IntegrationsSection rendered
   Generating static pages (20/82) 
   Generating static pages (40/82) 
   Generating static pages (61/82) 
 ✓ Generating static pages (82/82)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                                                                  Size  First Load JS  Revalidate  Expire
┌ ƒ /                                                                                       414 B         102 kB
├ ○ /_not-found                                                                             414 B         102 kB
├ ƒ /[shortcode]                                                                          2.31 kB         142 kB
├ ƒ /admin                                                                                  175 B         105 kB
├ ƒ /admin/community                                                                      7.78 kB         375 kB
├ ƒ /admin/contacts                                                                       24.9 kB         200 kB
├ ƒ /admin/discount-codes                                                                 8.35 kB         138 kB
├ ƒ /admin/login                                                                            414 B         102 kB
├ ƒ /admin/recording-studio                                                               89.8 kB         220 kB
├ ƒ /admin/shortener                                                                      49.5 kB         193 kB
├ ƒ /admin/workshops                                                                        220 B         368 kB
├ ○ /ai-supervize                                                                           16 kB         239 kB
├ ƒ /ai-supervize-mini                                                                    17.2 kB         233 kB
├ ○ /ai-supervize-mini/opengraph-image                                                      414 B         102 kB
├ ƒ /ai-supervize-mini/participant                                                        2.51 kB         139 kB
├ ○ /ai-supervize/opengraph-image                                                           414 B         102 kB
├ ○ /ai-ta-krajta                                                                         19.5 kB         146 kB          1h      1y
├ ○ /ai-ta-krajta/branding                                                                  204 B         122 kB
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
├ ○ /cs/pavol                                                                               158 B         203 kB
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
├ ○ /for-industry                                                                         7.92 kB         269 kB
├ ○ /for-industry/opengraph-image                                                           414 B         102 kB
├ ○ /hackathon-factory                                                                      15 kB         252 kB
├ ○ /hackathon-factory/opengraph-image                                                      414 B         102 kB
├ ƒ /k/[...shortFileUrlParts]                                                               414 B         102 kB
├ ○ /manifest.webmanifest                                                                   414 B         102 kB
├ ○ /old                                                                                  17.9 kB         246 kB
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
  └ other shared chunks (total)                                                           2.66 kB


ƒ Middleware                                                                              30.9 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand


> promptbook-landing-page@0.1.0 test-e2e
> playwright test

[WebServer] Database migrations skipped: DATABASE_URL is not configured.

Running 81 tests using 1 worker

  ✓   1 tests\e2e\admin-autosave.spec.ts:52:5 › autosaves edits in order, protects reload while pending, and waits before navigating (26.4s)
  ✓   2 tests\e2e\admin-autosave.spec.ts:92:5 › retains a failed edit and retries it without leaving the settings (9.5s)
  ✓   3 tests\e2e\admin-autosave.spec.ts:109:5 › keeps invalid settings open and saves corrected settings before signing out (8.8s)
  ✓   4 tests\e2e\admin-modals.spec.ts:24:9 › edits and creates contacts in keyboard-accessible dialogs at 1440px (7.6s)
  ✓   5 tests\e2e\admin-modals.spec.ts:24:9 › edits and creates contacts in keyboard-accessible dialogs at 390px (4.6s)
  ✓   6 tests\e2e\admin-modals.spec.ts:77:5 › keeps failed discount creation visible in its dialog and autosaves later edits there (2.9s)
  ✓   7 tests\e2e\cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /cs (8.8s)
  ✓   8 tests\e2e\cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /en (6.2s)
  ✓   9 tests\e2e\cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /cs/ochrana-osobnich-udaju (5.2s)
  ✓  10 tests\e2e\cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /cs/komunita (15.2s)
  ✓  11 tests\e2e\cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /ai-supervize (10.2s)
  ✓  12 tests\e2e\cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /ai-supervize-mini (8.0s)
  ✓  13 tests\e2e\cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /ai-ta-krajta (8.4s)
  ✓  14 tests\e2e\cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /admin/login (3.5s)
  ✓  15 tests\e2e\cookie-consent.spec.ts:64:5 › cookie choices persist and the privacy link reopens settings after client navigation (6.4s)
  ✓  16 tests\e2e\cookie-consent.spec.ts:92:5 › cookie panel and coder badge clear a player opened later, resized and closed (5.4s)
  ✓  17 tests\e2e\cookie-consent.spec.ts:123:5 › a booking notice leaves cookie choices clickable and the footer can be scrolled clear (5.6s)
  ✓  18 tests\e2e\participant-promotion.spec.ts:50:9 › refreshes an author's pending total and submissions after trust on /cs/online-workshop/participant (11.8s)
  ✓  19 tests\e2e\participant-promotion.spec.ts:50:9 › refreshes an author's pending total and submissions after trust on /cs/komunita (6.0s)
  ✓  20 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /cs (3.7s)
  ✓  21 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /en (3.9s)
  ✓  22 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /pro-mesta (5.5s)
  ✓  23 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /for-agro (4.9s)
  ✓  24 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /for-industry (6.4s)
  ✓  25 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /ai-supervize (3.6s)
  ✓  26 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /ai-supervize-mini (4.0s)
  ✓  27 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /ai-ta-krajta (3.1s)
  ✓  28 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /ai-ta-krajta/media-kit (4.5s)
  ✓  29 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /ai-ta-krajta/branding (5.4s)
  ✓  30 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /hackathon-factory (6.5s)
  ✓  31 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /cs/online-workshop (5.9s)
  ✓  32 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /cs/komunita/clenstvi (9.6s)
  ✓  33 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /cs/pavol (5.5s)
  ✓  34 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /en/pavol (5.9s)
  ✓  35 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /cs/ochrana-osobnich-udaju (2.2s)
  ✓  36 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /en/privacy-policy (4.6s)
  ✓  37 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /cs/obchodni-podminky (4.0s)
  ✓  38 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /en/terms-and-conditions (4.0s)
  ✓  39 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /contact (4.4s)
  ✓  40 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /branding (14.4s)
  ✓  41 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /data-deletion (5.1s)
  ✓  42 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /old (8.3s)
  ✓  43 tests\e2e\public-pages.spec.ts:139:5 › AI ta Krajta collaboration section deep-links to its media kit (4.6s)
  ✓  44 tests\e2e\public-pages.spec.ts:150:5 › AI ta Krajta owns its metadata, icon and installable manifest and credits Promptbook coder (12.9s)
  ✓  45 tests\e2e\public-pages.spec.ts:246:5 › AI ta Krajta searches complete transcripts on the server without sending them to the browser (23.3s)
  ✓  46 tests\e2e\public-pages.spec.ts:264:9 › public address redirects to its page: / (34ms)
  ✓  47 tests\e2e\public-pages.spec.ts:264:9 › public address redirects to its page: /pavol (4.3s)
  ✓  48 tests\e2e\public-pages.spec.ts:264:9 › public address redirects to its page: /privacy (3.2s)
  ✓  49 tests\e2e\public-pages.spec.ts:264:9 › public address redirects to its page: /terms (4.4s)
  ✓  50 tests\e2e\public-pages.spec.ts:264:9 › public address redirects to its page: /skoleni (3.3s)
  ✓  51 tests\e2e\public-pages.spec.ts:278:5 › /skoleni carries a discount code to the workshop registration (115ms)
  ✓  52 tests\e2e\public-submissions.spec.ts:13:5 › submits the shared footer newsletter form (46.0s)
  ✓  53 tests\e2e\public-submissions.spec.ts:27:5 › submits the reusable get-started lead dialog (31.0s)
  ✓  54 tests\e2e\public-submissions.spec.ts:41:5 › submits the business lead dialog (4.7s)
  ✓  55 tests\e2e\public-submissions.spec.ts:55:5 › submits the homepage qualification lead flow (32.1s)
  ✓  56 tests\e2e\public-submissions.spec.ts:80:5 › submits Pavol’s personal contact form (6.6s)
  -  57 tests\e2e\public-submissions.spec.ts:96:5 › submits a published online-workshop registration
  ✓  58 tests\e2e\public-submissions.spec.ts:116:5 › personalizes and submits the 199 Kč Promptbook paid community membership (22.9s)
  ✓  59 tests\e2e\public-submissions.spec.ts:143:5 › submits an available AI Supervize Mini workshop registration (11.0s)
  ✓  60 tests\e2e\public-submissions.spec.ts:171:5 › submits the AI Supervize Mini future-term interest form (4.9s)
  ✓  61 tests\e2e\public-submissions.spec.ts:196:5 › submits the AI ta Krajta collaboration form (4.9s)
  ✓  62 tests\e2e\public-submissions.spec.ts:211:5 › plays the newest AI ta Krajta episode from the header (4.1s)
  ✓  63 tests\e2e\public-submissions.spec.ts:220:5 › resumes a half-played AI ta Krajta episode where its listener left it (6.0s)
  ✓  64 tests\e2e\public-submissions.spec.ts:254:5 › starts the AI ta Krajta minigame from its snake and keeps it local to the page (3.4s)
  ✓  65 tests\e2e\public-submissions.spec.ts:268:5 › filters the AI ta Krajta archive by a person and keeps its destination in the hash (4.0s)
  -  66 tests\e2e\public-submissions.spec.ts:280:5 › connects a public online-workshop participant
  ✓  67 tests\e2e\recording-studio.spec.ts:78:5 › requires admin authentication for the recording studio (26.6s)
  ✓  68 tests\e2e\recording-studio.spec.ts:83:5 › records separate sources, restores them, trims every track and exports playable editor material (29.8s)
  ✓  69 tests\e2e\recording-studio.spec.ts:164:5 › stops the whole take on disconnect and prevents a second tab from changing it (9.1s)
  ✘  70 tests\e2e\recording-studio.spec.ts:184:5 › recovers persisted chunks after an interrupted page and waits for stop before admin navigation (50.5s)
  ✓  71 tests\e2e\recording-studio.spec.ts:184:5 › recovers persisted chunks after an interrupted page and waits for stop before admin navigation (retry #1) (13.7s)
  ✓  72 tests\e2e\room-theme.spec.ts:96:5 › shares a saved room appearance, follows the device, and preserves the waiting-room form (27.5s)
  ✓  73 tests\e2e\room-theme.spec.ts:141:5 › themes connected rooms, materials, and portalled dialogs on desktop and mobile without losing drafts (48.1s)
  ✓  74 tests\e2e\workshop-agents.spec.ts:34:9 › defines a Book agent in the workshop administration (7.4s)
  ✓  75 tests\e2e\workshop-agents.spec.ts:34:9 › defines a Book agent in the community administration (37.0s)
  ✓  76 tests\e2e\workshop-repository-range.spec.ts:31:5 › edits independent commit bounds in workshop settings (5.3s)
  ✓  77 tests\e2e\workshop-repository-range.spec.ts:67:5 › previews the deployed app while browsing the highlighted workshop range (5.0s)
  ✓  78 tests\e2e\workshop-subtitles.spec.ts:63:5 › imports, autosaves, reloads and downloads private subtitles through the shared admin editor (7.9s)
  ✓  79 tests\e2e\workshop-subtitles.spec.ts:107:5 › decodes a long recording into bounded audio chunks and preserves multilingual timestamps (5.7s)
  ✓  80 tests\e2e\workshop-vercel-deployment.spec.ts:31:9 › deploys a workshop project and saves its ready URL through the existing settings form (8.6s)
  ✓  81 tests\e2e\workshop-vercel-deployment.spec.ts:31:9 › shows Vercel failure details and guidance, then saves the URL after retrying (12.8s)
  ✓  82 tests\e2e\workshop-wrap-up-pdf.spec.ts:34:5 › downloads the branded recap in the browser with local fonts, project preview, Git graph and short-link QR (8.5s)
Saved 77 E2E video(s) to tests/e2e/videos/.
Removed the E2E video(s) of 1 outdated run(s) from tests/e2e/videos/.


  1) tests\e2e\recording-studio.spec.ts:184:5 › recovers persisted chunks after an interrupted page and waits for stop before admin navigation 

    Error: expect(page).toHaveURL(expected) failed

    Expected pattern: /\/admin$/
    Received string:  "http://127.0.0.1:4009/admin/recording-studio"
    Timeout: 30000ms

    Call log:
      - Expect "toHaveURL" with timeout 30000ms
        60 × locator resolved to <html lang="en" data-room-theme="dark">…</html>
           - unexpected value "http://127.0.0.1:4009/admin/recording-studio"


      202 |     await expect(page).toHaveURL(/\/admin\/recording-studio$/);
      203 |     await page.getByRole('button', { name: 'Zastavit všechny stopy', exact: true }).click();
    > 204 |     await expect(page).toHaveURL(/\/admin$/);
          |                        ^
      205 |     await page.getByRole('link', { name: 'Nahrávací studio', exact: true }).click();
      206 |     await expect(page.getByText('Uloženo', { exact: true })).toBeVisible();
      207 |     await expect(page.getByText('Přerušený záznam', { exact: true })).toBeVisible();
        at C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron\tests\e2e\recording-studio.spec.ts:204:24

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    tests\e2e\.artifacts\recording-studio-recovers--71e7c-top-before-admin-navigation\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    tests\e2e\.artifacts\recording-studio-recovers--71e7c-top-before-admin-navigation\video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: tests\e2e\.artifacts\recording-studio-recovers--71e7c-top-before-admin-navigation\error-context.md

    attachment #4: trace (application/zip) ─────────────────────────────────────────────────────────
    tests\e2e\.artifacts\recording-studio-recovers--71e7c-top-before-admin-navigation\trace.zip
    Usage:

        npx playwright show-trace tests\e2e\.artifacts\recording-studio-recovers--71e7c-top-before-admin-navigation\trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

  1 flaky
    tests\e2e\recording-studio.spec.ts:184:5 › recovers persisted chunks after an interrupted page and waits for stop before admin navigation 
  2 skipped
  78 passed (14.5m)

> promptbook-landing-page@0.1.0 delete-test-data
> tsx scripts/delete-test-data.ts

Deleted 9 Contact row(s) and 0 workshop participant row(s) with an @example.com e-mail address.

=== test shell finished at 2026-09-22T12:07:56.400Z ===
Status: succeeded
````
