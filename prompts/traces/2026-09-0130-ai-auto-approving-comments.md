# Run trace of `prompts/2026-09-0130-ai-auto-approving-comments.md#1`

-   **Prompt:** There should be a mechanism for auto-approving the comments.
-   **Outcome:** Succeeded
-   **Runner:** Developer on OpenAI Codex `gpt-6-astra` thinking `max` (ChatGPT account)
-   **Attempts:** 1
-   **Steps:** Implementation ~$0.0932 a minute; Testing 15 minutes
-   **Verification command:** `npm run test-for-ptbk-coder`
-   **Started:** 2026-09-17T02:53:49.908Z
-   **Finished:** 2026-09-17T03:09:47.774Z
-   **Duration:** 16 minutes

## Runtime log

````text
=== runner shell started at 2026-09-17T02:53:50.155Z ===
Script path: /c/Users/me/work/promptbook-experiments-and-landing-pages/aldaron/.promptbook/coder-prompts/2026-09-0130-ai-auto-approving-comments.sh

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
    -C /c/Users/me/work/promptbook-experiments-and-landing-pages/aldaron \
    --skip-git-repo-check \
    <<'CODEX_PROMPT'

## Your Task

There should be a mechanism for auto-approving the comments.

- There should be some AI mechanism to auto-approve the chat messages and other materials which require approval 
- You are working with page `/cs/online-workshop/participant?workshop=` and `/cs/komunita`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

## Your Behavior

You are Developer

### Rules

-   Keep in mind the DRY _(don't repeat yourself)_ principle.
-   Keep in mind the SOLID principles.
-   Do a proper analysis of the current functionality before you start implementing.
-   Keep small responsibilities of functions and classes, avoid creating big functions or classes that do many things.
-   Constants should always be `UPPER_SNAKE_CASE`.
-   Boolean variables should always be prefixed with `is`, for example `isUserChatJobLeaseExpired` or `IS_DEBUG_MODE`.
-   Do not use abbreviations, for example use `isExpired` instead of `isExp`, `translateMessage` instead of `t`, etc.
It is fine to use well-known abbreviations, for example `id`, `url`, `html`, etc.

### Prompt suffix
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
  with: running and upcoming ones first, then the ones which ended within the
  last day, and the older finished ones behind a disclosure.
  Picking one changes the room being connected to and the `workshop` parameter,
  without losing the name and e-mail already typed. Once a term has its recorded
  end, its participant wrap-up offers a locally generated PDF using only the
  attendee-visible description, key takeaways and shared materials; it creates
  no administrative setting or database record.
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
  shared mini card is drawn, it may also show its anonymous star-rating aggregate
  and a preview of its connected project, while an ended term may show the length
  of its replay after the configured recording start offset. Where a term stands in
  time is decided
  once, in `lib/workshops/workshopPhase.ts`, as one of
  four phases: upcoming, ongoing, freshly past while it ended within the last
  `FRESHLY_PAST_WORKSHOP_HOURS`, and past. Every list, badge, and calendar colour
  reads that one answer, and everything which opens after a workshop — the
  wrap-up, the feedback, the recording — treats freshly past as over. A term with a
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
  Its term picker leads with the ongoing, upcoming, and freshly past terms
  together, because a term which has only just been held is still being wrapped
  up; only past terms stay behind its history disclosure.
- `/admin/community` manages the permanent community, including polls, project
  moderation, participants, memberships, payments, and room analytics.
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
  it is pending until a moderator decides about it, while a trusted member and a
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
  moderation; trusted members and moderators are approved immediately. Pending
  projects remain visible to their author and moderators.
- A live workshop room has countdown, YouTube stage, reactions, watching count,
  moderated chat, timed materials, and attached poll aggregates. An open-ended
  term runs until its recorded end; its stage does not end automatically. Admins
  can select, replace, clear, or create the displayed comment through the same
  private realtime channel used by reactions.
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
- Trusted participants remain invisible and their messages are auto-approved.
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
  independent and each archives one recording in `tests/e2e/videos/`, retaining
  only recent runs.

CODEX_PROMPT

--- raw output ---
.env: line 27: app: command not found
ptbk-codex-login-method: chatgpt
Reading prompt from stdin...
OpenAI Codex v0.154.0
--------
workdir: C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
model: gpt-6-astra
provider: openai
approval: never
sandbox: danger-full-access
reasoning effort: max
reasoning summaries: none
session id: 01a0ad49-0a78-7362-b8bc-2ad73abcf59e
--------
user

## Your Task

There should be a mechanism for auto-approving the comments.

- There should be some AI mechanism to auto-approve the chat messages and other materials which require approval 
- You are working with page `/cs/online-workshop/participant?workshop=` and `/cs/komunita`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

## Your Behavior

You are Developer

### Rules

-   Keep in mind the DRY _(don't repeat yourself)_ principle.
-   Keep in mind the SOLID principles.
-   Do a proper analysis of the current functionality before you start implementing.
-   Keep small responsibilities of functions and classes, avoid creating big functions or classes that do many things.
-   Constants should always be `UPPER_SNAKE_CASE`.
-   Boolean variables should always be prefixed with `is`, for example `isUserChatJobLeaseExpired` or `IS_DEBUG_MODE`.
-   Do not use abbreviations, for example use `isExpired` instead of `isExp`, `translateMessage` instead of `t`, etc.
It is fine to use well-known abbreviations, for example `id`, `url`, `html`, etc.

### Prompt suffix
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
  with: running and upcoming ones first, then the ones which ended within the
  last day, and the older finished ones behind a disclosure.
  Picking one changes the room being connected to and the `workshop` parameter,
  without losing the name and e-mail already typed. Once a term has its recorded
  end, its participant wrap-up offers a locally generated PDF using only the
  attendee-visible description, key takeaways and shared materials; it creates
  no administrative setting or database record.
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
  shared mini card is drawn, it may also show its anonymous star-rating aggregate
  and a preview of its connected project, while an ended term may show the length
  of its replay after the configured recording start offset. Where a term stands in
  time is decided
  once, in `lib/workshops/workshopPhase.ts`, as one of
  four phases: upcoming, ongoing, freshly past while it ended within the last
  `FRESHLY_PAST_WORKSHOP_HOURS`, and past. Every list, badge, and calendar colour
  reads that one answer, and everything which opens after a workshop — the
  wrap-up, the feedback, the recording — treats freshly past as over. A term with a
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
  Its term picker leads with the ongoing, upcoming, and freshly past terms
  together, because a term which has only just been held is still being wrapped
  up; only past terms stay behind its history disclosure.
- `/admin/community` manages the permanent community, including polls, project
  moderation, participants, memberships, payments, and room analytics.
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
  it is pending until a moderator decides about it, while a trusted member and a
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
  moderation; trusted members and moderators are approved immediately. Pending
  projects remain visible to their author and moderators.
- A live workshop room has countdown, YouTube stage, reactions, watching count,
  moderated chat, timed materials, and attached poll aggregates. An open-ended
  term runs until its recorded end; its stage does not end automatically. Admins
  can select, replace, clear, or create the displayed comment through the same
  private realtime channel used by reactions.
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
- Trusted participants remain invisible and their messages are auto-approved.
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
  independent and each archives one recording in `tests/e2e/videos/`, retaining
  only recent runs.


codex
I’ll trace how chat messages, poll answers, and projects enter moderation, then check the existing AI integration. I’ll use that analysis to build a shared approval mechanism and update the changelog.

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command 'rg -n "workshopSubmissionStatus|pending|auto.?approv|OpenAI|openai|anthropic|generateText|chatCompletion" lib/workshops lib/community app/api package.json .env.example' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command "Get-Location; git status --short; rg --files -g AGENTS.md -g package.json -g '*moder*' -g '*Moder*' -g '*Submission*' -g '*ai*' -g '*AI*' -g '*env*' -g '*preversion*'" in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 902ms:

 M prompts/2026-09-0130-ai-auto-approving-comments.md
tailwind.config.ts
scripts\_cutAiTaKrajtaPeoplePortraits.mjs
public\people\tomas-mikolov-portrait.png
public\people\tomas-kroupa-portrait.png
public\people\tomas-koblizek-portrait.png
public\people\simon-podhajsky-portrait.png
public\people\roman-baranovic-portrait.png
public\people\richard-mladek-portrait.png
public\people\prokop-simek-portrait.png
public\people\petr-simecek-portrait.png
public\people\petr-glaser-portrait.png
public\people\petr-brzek-portrait.png
public\people\pavol-hejny-portrait.png
public\people\pavel-ungr-portrait.png
public\people\patrik-braborec-portrait.png
public\people\ondrej-sukac-portrait.png
public\people\ondra-portrait.png
public\people\matyas-krecek-portrait.png
public\people\matous-havlena-portrait.png
public\people\lukas-caha-portrait.png
public\people\lenka-sefcakova-portrait.png
public\people\katka-fajmanova-portrait.png
public\people\jiri-jahn-portrait.png
public\people\jan-cienciala-portrait.png
public\people\jacek-soubusta-portrait.png
public\people\dalibor-krejci-portrait.png
public\people\adam-zvada-portrait.png
lib\workshops\workshopSubmissionStatus.ts
public\pavol\media\ai-ta-krajta.jpg
lib\isEmailAddressValid.ts
lib\workshops\workshopEventCardDetails.test.ts
lib\workshops\workshopCommentModeration.ts
lib\waitlist.ts
lib\subscription\subscribeToWaitlist.ts
tests\e2e\videos\2026-09-17T02-38-13-384Z-25-public-pages-public-landin-8f0af-loads-ai-ta-krajta-branding-video.webm
tests\e2e\videos\2026-09-17T02-38-13-384Z-24-public-pages-public-landin-8e3c0-ion-page-loads-ai-supervize-video.webm
tests\e2e\videos\2026-09-17T02-38-13-384Z-18-public-pages-public-landin-3ec6a-age-loads-ai-supervize-mini-video.webm
tests\e2e\videos\2026-09-17T02-38-13-384Z-16-public-pages-public-landin-323ab-oads-ai-ta-krajta-media-kit-video.webm
tests\e2e\videos\2026-09-17T02-38-13-384Z-14-public-pages-ai-ta-krajta-f35b1-deep-links-to-its-media-kit-video.webm
tests\e2e\videos\2026-09-17T02-38-13-384Z-13-public-pages-ai-ta-krajta-de1fa-nd-credits-promptbook-coder-video.webm
tests\e2e\videos\2026-09-17T02-38-13-384Z-12-public-pages-ai-ta-krajta-75a31-sending-them-to-the-browser-video.webm
tests\e2e\videos\2026-09-17T02-38-13-384Z-10-cookie-consent-cookie-cont-f354c-viewports-ai-supervize-mini-video.webm
tests\e2e\videos\2026-09-17T02-38-13-384Z-08-cookie-consent-cookie-cont-ce748-cape-viewports-ai-ta-krajta-video.webm
tests\e2e\videos\2026-09-17T02-38-13-384Z-03-cookie-consent-cookie-cont-0cf23-cape-viewports-ai-supervize-video.webm
tests\e2e\videos\2026-09-17T02-25-21-013Z-10-cookie-consent-cookie-cont-f354c-viewports-ai-supervize-mini-video.webm
tests\e2e\videos\2026-09-17T02-25-21-013Z-08-cookie-consent-cookie-cont-ce748-cape-viewports-ai-ta-krajta-video.webm
tests\e2e\videos\2026-09-17T02-25-21-013Z-03-cookie-consent-cookie-cont-0cf23-cape-viewports-ai-supervize-video.webm
tests\e2e\videos\2026-09-17T02-53-39-362Z-14-public-pages-ai-ta-krajta-f35b1-deep-links-to-its-media-kit-video.webm
tests\e2e\videos\2026-09-17T02-53-39-362Z-13-public-pages-ai-ta-krajta-de1fa-nd-credits-promptbook-coder-video.webm
tests\e2e\videos\2026-09-17T02-53-39-362Z-12-public-pages-ai-ta-krajta-75a31-sending-them-to-the-browser-video.webm
tests\e2e\videos\2026-09-17T02-53-39-362Z-10-cookie-consent-cookie-cont-f354c-viewports-ai-supervize-mini-video.webm
tests\e2e\videos\2026-09-17T02-53-39-362Z-08-cookie-consent-cookie-cont-ce748-cape-viewports-ai-ta-krajta-video.webm
tests\e2e\videos\2026-09-17T02-53-39-362Z-03-cookie-consent-cookie-cont-0cf23-cape-viewports-ai-supervize-video.webm
tests\e2e\videos\2026-09-17T02-38-13-384Z-32-public-pages-public-landin-edafc-ion-page-loads-ai-ta-krajta-video.webm
tests\e2e\videos\2026-09-17T02-53-39-362Z-24-public-pages-public-landin-8e3c0-ion-page-loads-ai-supervize-video.webm
tests\e2e\videos\2026-09-17T02-53-39-362Z-18-public-pages-public-landin-3ec6a-age-loads-ai-supervize-mini-video.webm
tests\e2e\videos\2026-09-17T02-53-39-362Z-16-public-pages-public-landin-323ab-oads-ai-ta-krajta-media-kit-video.webm
tests\e2e\videos\2026-09-17T02-53-39-362Z-32-public-pages-public-landin-edafc-ion-page-loads-ai-ta-krajta-video.webm
tests\e2e\videos\2026-09-17T02-53-39-362Z-25-public-pages-public-landin-8f0af-loads-ai-ta-krajta-branding-video.webm
tests\e2e\videos\2026-09-17T02-53-39-362Z-40-public-submissions-persona-dd42e-k-paid-community-membership-video.webm
lib\workshops\workshopPaidMembersContent.ts
lib\workshops\workshopPaidMembersContent.test.ts
lib\workshops\workshopModeration.ts
lib\workshops\workshopModeration.test.ts
lib\workshops\workshopEventCardDetails.ts
lib\workshops\workshopParticipantEmail.ts
lib\workshops\workshopPaidMembersVideo.ts
lib\workshops\workshopPaidMembersVideo.test.ts
lib\workshops\workshopParticipantModeration.ts
lib\workshops\workshopPollOptionModeration.ts
public\backgrounds\ai-supervize.svg
next-env.d.ts
public\integrations\gmail.png
migrations\2026-09-0300-workshop-paid-members-video-preview.sql
migrations\2026-09-0200-workshop-content-paid-members-only.sql
migrations\2026-09-0120-community-poll-shared-email-votes.sql
migrations\2026-08-3020-community-project-moderation.sql
migrations\2026-08-2420-ai-supervize-mini-waitlist.sql
migrations\2026-08-1000-workshop-moderators.sql
migrations\2026-08-0600-ai-supervize-mini-discount-codes.sql
prompts\2026-08-0641-unslop-ai-supervize-mini-participant.md
prompts\2026-08-0530-ai-ta-krajta.notes.md.txt
prompts\2026-08-0530-ai-ta-krajta.md
prompts\2026-08-0530-ai-ta-krajta-partnerstvi-handoff.md.txt
prompts\2026-08-0090-online-workshop-ai-participants-and-moderators.md
prompts\2026-04-0080-aita-stream.md
package.json
prompts\2026-08-0641-unslop-ai-ta-krajta-media-kit.md
prompts\2026-08-0641-unslop-ai-supervize.md
prompts\2026-08-0641-unslop-ai-supervize-mini.md
prompts\2026-09-0130-ai-auto-approving-comments.md
prompts\2026-08-0641-unslop-ai-ta-krajta.md
prompts\2026-09-0150-ai-auto-reply-in-workshops-and-komunita.md
config\ai-supervize\aiSupervizeBenefits.tsx
businesses\workshop-admin\WorkshopCommentModeration.tsx
businesses\workshop-admin\WorkshopCommentModeration.test.tsx
components\waitlist-popup.tsx
prompts\prompts\screenshots\2026-09-0060-allow-to-pick-workshop-from-waitingroom.png
prompts\prompts\screenshots\2026-08-0530-ai-ta-krajta.png
prompts\prompts\screenshots\2026-08-0530-ai-ta-krajta-9.png
prompts\prompts\screenshots\2026-08-0530-ai-ta-krajta-8.png
prompts\prompts\screenshots\2026-08-0530-ai-ta-krajta-7.png
prompts\prompts\screenshots\2026-08-0530-ai-ta-krajta-6.png
prompts\prompts\screenshots\2026-08-0530-ai-ta-krajta-5.png
prompts\prompts\screenshots\2026-08-0530-ai-ta-krajta-4.png
prompts\prompts\screenshots\2026-08-0530-ai-ta-krajta-3.png
prompts\prompts\screenshots\2026-08-0530-ai-ta-krajta-2.png
prompts\prompts\screenshots\2026-08-0530-ai-ta-krajta-16.png
prompts\prompts\screenshots\2026-08-0530-ai-ta-krajta-15.png
prompts\prompts\screenshots\2026-08-0530-ai-ta-krajta-14.png
prompts\prompts\screenshots\2026-08-0530-ai-ta-krajta-13.png
prompts\prompts\screenshots\2026-08-0530-ai-ta-krajta-12.png
prompts\prompts\screenshots\2026-08-0530-ai-ta-krajta-11.png
prompts\prompts\screenshots\2026-08-0530-ai-ta-krajta-10.png
prompts\prompts\screenshots\2026-08-0530-ai-ta-krajta-1.png
prompts\prompts\screenshots\2026-08-0290-ai-supervize-mini-full.png
prompts\prompts\screenshots\2026-08-0080-online-workshop-trusted-and-moderator.png
prompts\prompts\screenshots\2026-04-0050-ai-supervize-mini.png
prompts\prompts\screenshots\2026-04-0050-ai-supervize-mini-4.png
prompts\prompts\screenshots\2026-04-0050-ai-supervize-mini-3.png
prompts\prompts\screenshots\2026-04-0050-ai-supervize-mini-2.png
prompts\prompts\screenshots\2026-04-0050-ai-supervize-mini-1.png
components\pain-points-section.tsx
businesses\online-workshop\participant\WorkshopPollOptionModeration.tsx
businesses\online-workshop\participant\WorkshopPaidMembersVideoNotice.tsx
businesses\online-workshop\participant\WorkshopModerationAction.tsx
businesses\online-workshop\participant\WorkshopChatMessageModeration.tsx
prompts\done\new-main-landing-page-company-knowledge.md
prompts\done\ai-supervize.md
prompts\done\ai-supervize-skoleni.md
prompts\done\2026-09-0060-allow-to-pick-workshop-from-waitingroom.md
prompts\done\2026-08-0642-unslop-ai-ta-krajta-branding.md
prompts\done\2026-08-0561-fix-the-existing-test-failures-before-implementing-any.md
prompts\done\2026-08-0560-fix-the-existing-test-failures-before-implementing-any copy.md
prompts\done\2026-08-0550-fix-the-existing-test-failures-before-implementing-any.md
prompts\done\2026-08-0410-fix-the-existing-test-failures-before-implementing-any.md
prompts\done\2026-08-0350-fix-the-existing-test-failures-before-implementing-any.md
prompts\done\2026-08-0290-ai-supervize-mini-full.md
prompts\done\2026-08-0080-online-workshop-trusted-and-moderator.md
prompts\done\2026-08-0040-ai-supervize-mini-for-workshop.md
prompts\done\2026-08-0000-ai-ta-krajta.md
prompts\done\2026-04-0050-ai-supervize-mini.md
prompts\done\2026-04-0000-ai-supervize-skoleni.md
prompts\2026-09-0310-link-komunita-and-workshops-to-ai-ta-krajta.md
prompts\2026-09-0300-link-ai-ta-krajta-to-komunita.md
components\admin\AdminContactDetails.tsx
changelog\_current-preversion.md
lib\community-projects\communityProjectModeration.ts
businesses\community\projects\CommunityProjectModeration.tsx
businesses\community\projects\CommunityProjectDetailsPanel.tsx
businesses\ai-supervize\aiSupervizeTestimonials.tsx
businesses\ai-supervize\aiSupervizePricing.ts
businesses\ai-supervize\aiSupervizeMetadata.ts
businesses\ai-supervize\aiSupervizeConversation.ts
businesses\ai-supervize\aiSupervizeContent.tsx
businesses\ai-supervize\aiSupervizeChatbot.tsx
businesses\ai-supervize\aiSupervizeBenefits.tsx
.env
AGENTS.md
businesses\community\membership\useIsPaidCommunityMember.ts
businesses\community\membership\CommunityPaidMembersNotice.tsx
businesses\ai-ta-krajta\aiTaKrajtaEpisodeTranscriptSearch.test.ts
businesses\ai-ta-krajta\aiTaKrajtaEpisodeSearchApi.ts
businesses\ai-ta-krajta\aiTaKrajtaEpisodes.json
businesses\ai-ta-krajta\aiTaKrajtaEpisodePeople.ts
businesses\ai-ta-krajta\aiTaKrajtaEpisodePeople.test.ts
businesses\ai-ta-krajta\aiTaKrajtaViewState.ts
businesses\ai-ta-krajta\aiTaKrajtaViewState.test.ts
businesses\ai-ta-krajta\aiTaKrajtaTextSearch.ts
businesses\ai-ta-krajta\aiTaKrajtaSnakeSimulation.ts
businesses\ai-ta-krajta\aiTaKrajtaSnakeSimulation.test.ts
businesses\ai-ta-krajta\aiTaKrajtaSnakeLogoPose.ts
businesses\ai-ta-krajta\aiTaKrajtaSnakeLogoPose.test.ts
businesses\ai-ta-krajta\aiTaKrajtaSnakeBody.ts
businesses\ai-ta-krajta\aiTaKrajtaSnakeBody.test.ts
businesses\ai-ta-krajta\aiTaKrajtaPublicPlatformStatistics.ts
businesses\ai-ta-krajta\aiTaKrajtaPublicPlatformStatistics.test.ts
businesses\ai-ta-krajta\aiTaKrajtaPeopleOrder.ts
businesses\ai-ta-krajta\aiTaKrajtaPeopleOrder.test.ts
businesses\ai-ta-krajta\aiTaKrajtaPeople.ts
businesses\ai-ta-krajta\aiTaKrajtaPeople.test.ts
businesses\ai-ta-krajta\aiTaKrajtaMetadata.ts
businesses\ai-ta-krajta\aiTaKrajtaMetadata.test.ts
businesses\ai-ta-krajta\aiTaKrajtaMediaKitContent.ts
businesses\ai-ta-krajta\aiTaKrajtaMediaKitContent.test.ts
businesses\ai-ta-krajta\aiTaKrajtaMarkCanvas.ts
businesses\ai-ta-krajta\aiTaKrajtaMarkArtwork.ts
businesses\ai-ta-krajta\aiTaKrajtaMarkArtwork.test.ts
businesses\ai-ta-krajta\aiTaKrajtaInternalEpisodes.ts
businesses\ai-ta-krajta\aiTaKrajtaInternalEpisodes.test.ts
businesses\ai-ta-krajta\aiTaKrajtaIcon.ts
businesses\ai-ta-krajta\aiTaKrajtaIcon.test.ts
businesses\ai-ta-krajta\aiTaKrajtaFormatting.ts
businesses\ai-ta-krajta\aiTaKrajtaEpisodeTranscriptSearch.ts
businesses\ai-ta-krajta\aiTaKrajtaEpisodeLink.ts
businesses\ai-ta-krajta\aiTaKrajtaEpisodeHosts.ts
businesses\ai-ta-krajta\aiTaKrajtaEpisodeHosts.test.ts
businesses\ai-ta-krajta\aiTaKrajtaBrandAssets.ts
businesses\ai-ta-krajta\aiTaKrajtaBrandAssets.test.ts
businesses\ai-ta-krajta\aiTaKrajtaAudienceStatistics.ts
businesses\ai-ta-krajta\aiTaKrajtaAudienceStatistics.test.ts
businesses\ai-ta-krajta\aiTaKrajtaArchive.ts
businesses\ai-supervize-mini\aiSupervizeMiniTestimonials.ts
businesses\ai-supervize-mini\aiSupervizeMiniMetadata.ts
businesses\ai-supervize-mini\aiSupervizeMiniContent.tsx
Path
----
C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron


 exited 1 in 2047ms:
rg: .env.example: The system cannot find the file specified. (os error 2)
package.json:22:        "coder:run:openai": "npx ptbk coder run --harness openai-codex --model gpt-5.6-terra --thinking-level max --agent agents/developer.book --context AGENTS.md --test npm run test-for-ptbk-coder --test-before yes-and-fix  --auto-push --auto-pull",
app/api\workshops\[workshopSlug]\comments\route.ts:14:import { getWorkshopParticipantSubmissionStatus } from '@/lib/workshops/workshopSubmissionStatus';
app/api\workshops\[workshopSlug]\comments\route.ts:114:        console.error('Failed to save a pending workshop comment:', error?.message ?? 'No comment returned');
app/api\workshops\komunita\projects\[projectId]\route.ts:21: * pending chat message there.
app/api\admin\workshops\[workshopId]\route.ts:50:        requestedCommentStatus ?? 'pending',
app/api\admin\community\projects\route.ts:4:import { isWorkshopSubmissionStatus } from '@/lib/workshops/workshopSubmissionStatus';
app/api\admin\community\projects\route.ts:27:    const { projects, errorMessage } = await loadAdminCommunityProjects(supabase, requestedStatus ?? 'pending');
lib/workshops\workshopCommentThreads.test.ts:108:        const pendingAnswer = createComment({
lib/workshops\workshopCommentThreads.test.ts:109:            id: 'pending-answer',
lib/workshops\workshopCommentThreads.test.ts:111:            status: 'pending',
lib/workshops\workshopCommentThreads.test.ts:114:        const threads = buildWorkshopCommentThreads([QUESTION, EARLY_ANSWER, pendingAnswer], 'recent');
lib/workshops\workshopCommentThreads.test.ts:117:        expect(threads[0]?.replies.map((reply) => reply.id)).toEqual(['early-answer', 'pending-answer']);
lib/workshops\workshopDatabase.ts:42:import { getWorkshopParticipantSubmissionStatus } from '@/lib/workshops/workshopSubmissionStatus';
lib/workshops\workshopDatabase.ts:255:    readonly status: 'pending' | 'approved' | 'rejected';
lib/workshops\workshopDatabase.ts:2510:    const pendingCommentsQuery = supabase
lib/workshops\workshopDatabase.ts:2514:        .eq('status', 'pending')
lib/workshops\workshopDatabase.ts:2560:        pendingCommentsResult,
lib/workshops\workshopDatabase.ts:2586:        isModerationOffered ? pendingCommentsQuery : pendingCommentsQuery.eq('participant_id', participant.id),
lib/workshops\workshopDatabase.ts:2610:        pendingCommentsResult.error ??
lib/workshops\workshopDatabase.ts:2670:            ...((pendingCommentsResult.data ?? []) as WorkshopCommentRow[]),
lib/workshops\workshopMigration.test.ts:247:    it('defaults chat messages to pending and atomically limits action bursts', () => {
lib/workshops\workshopMigration.test.ts:248:        expect(MIGRATION_SQL).toContain("status text NOT NULL DEFAULT 'pending'");
lib/workshops\workshopMigration.test.ts:624:            "CHECK (status IN ('pending', 'approved', 'rejected'))",
lib/workshops\workshopMigration.test.ts:641:            "IF target_other_option_status IS NULL OR target_other_option_status NOT IN ('pending', 'approved') THEN",
lib/workshops\workshopMigration.test.ts:646:            "OR (poll_option.status = 'pending' AND poll_option.author_email = normalized_voter_email)",
lib/workshops\workshopPollSharing.test.ts:135:        status: 'pending',
lib/workshops\workshopPollSharing.test.ts:258:            target_other_option_status: 'pending',
lib/workshops\workshopPollSharing.test.ts:279:            target_other_option_status: 'pending',
lib/workshops\workshopRequest.test.ts:2:import { getWorkshopParticipantSubmissionStatus } from '@/lib/workshops/workshopSubmissionStatus';
lib/workshops\workshopRequest.test.ts:29:        expect(getWorkshopParticipantSubmissionStatus(createParticipant(false))).toBe('pending');
lib/workshops\workshopSchemas.test.ts:80:        expect(workshopCommentUpdateSchema.safeParse({ status: 'pending' }).success).toBe(false);
lib/workshops\workshopSubmissionStatus.ts:31:    return participant.isTrusted || participant.isModerator ? 'approved' : 'pending';
lib/workshops\workshopTypes.ts:25:export const WORKSHOP_SUBMISSION_STATUS_VALUES = ['pending', 'approved', 'rejected'] as const;

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command "Get-Content lib/workshops/workshopSubmissionStatus.ts; Get-Content -LiteralPath 'app/api/workshops/[workshopSlug]/comments/route.ts'; Get-Content lib/community-projects/communityProjectModeration.ts; Get-Content lib/workshops/workshopPollOptionModeration.ts; Get-Content lib/workshops/workshopCommentModeration.ts" in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command "rg -n \"OpenAI|openai|chat\\.completions|responses\\.create|promptbook|Llm|LLM|generateText|ANTHROPIC|GEMINI|AI_\" lib app/api config README.md .github -g '"'!*.svg'"'; rg --files lib/community-projects app/api/workshops tests | Select-Object -First 100" in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command '$INSTRUCTION_PATHS = @('"'C:/AGENTS.md','C:/Users/AGENTS.md','C:/Users/me/AGENTS.md','C:/Users/me/work/AGENTS.md','C:/Users/me/work/promptbook-experiments-and-landing-pages/AGENTS.md'); foreach ("'$INSTRUCTION_PATH in $INSTRUCTION_PATHS) { if (Test-Path -LiteralPath $INSTRUCTION_PATH) { Write-Output $INSTRUCTION_PATH; Get-Content -LiteralPath $INSTRUCTION_PATH } }; rg --files -g '"'*jest*' -g '*vitest*' -g 'tsconfig*' -g '*test*' app/api lib/community-projects | Select-Object -First 100" in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command 'Get-Content AGENTS.md; Get-Content package.json; Get-Content changelog/_current-preversion.md -TotalCount 100' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 2166ms:
lib/community-projects\communityProjectService.test.ts
lib/community-projects\communityProjectPreview.test.ts
app/api\workshops\[workshopSlug]\polls\[pollId]\votes\route.test.ts
app/api\workshops\[workshopSlug]\membership\portal\route.test.ts
app/api\workshops\[workshopSlug]\membership\cancellation\route.test.ts
app/api\workshops\[workshopSlug]\comments\[commentId]\material\route.test.ts
app/api\waitlist\route.test.ts
app/api\contacts\route.test.ts
app/api\contacts\export\[formatId]\route.test.ts
app/api\community\membership\registration\route.test.ts
app/api\ai-ta-krajta\episodes\search\route.test.ts
app/api\ai-supervize-mini\registration\route.test.ts
app/api\admin\workshops\[workshopId]\stage-comment\route.test.ts
app/api\admin\workshops\[workshopId]\route.test.ts
app/api\admin\workshops\[workshopId]\participants\route.test.ts
app/api\admin\workshops\[workshopId]\feedback\route.test.ts
app/api\admin\workshops\[workshopId]\comments\[commentId]\material\route.test.ts
app/api\admin\workshops\route.test.ts
app/api\admin\shortener\[shortcodeLinkId]\route.test.ts
app/api\admin\shortener\[shortcodeLinkId]\clicks\route.test.ts
app/api\admin\shortener\route.test.ts
app/api\admin\session\route.test.ts
app/api\admin\community\memberships\route.test.ts

 succeeded in 2369ms:
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
  with: running and upcoming ones first, then the ones which ended within the
  last day, and the older finished ones behind a disclosure.
  Picking one changes the room being connected to and the `workshop` parameter,
  without losing the name and e-mail already typed. Once a term has its recorded
  end, its participant wrap-up offers a locally generated PDF using only the
  attendee-visible description, key takeaways and shared materials; it creates
  no administrative setting or database record.
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
  shared mini card is drawn, it may also show its anonymous star-rating aggregate
  and a preview of its connected project, while an ended term may show the length
  of its replay after the configured recording start offset. Where a term stands in
  time is decided
  once, in `lib/workshops/workshopPhase.ts`, as one of
  four phases: upcoming, ongoing, freshly past while it ended within the last
  `FRESHLY_PAST_WORKSHOP_HOURS`, and past. Every list, badge, and calendar colour
  reads that one answer, and everything which opens after a workshop — the
  wrap-up, the feedback, the recording — treats freshly past as over. A term with a
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
  Its term picker leads with the ongoing, upcoming, and freshly past terms
  together, because a term which has only just been held is still being wrapped
  up; only past terms stay behind its history disclosure.
- `/admin/community` manages the permanent community, including polls, project
  moderation, participants, memberships, payments, and room analytics.
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
  it is pending until a moderator decides about it, while a trusted member and a
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
  moderation; trusted members and moderators are approved immediately. Pending
  projects remain visible to their author and moderators.
- A live workshop room has countdown, YouTube stage, reactions, watching count,
  moderated chat, timed materials, and attached poll aggregates. An open-ended
  term runs until its recorded end; its stage does not end automatically. Admins
  can select, replace, clear, or create the displayed comment through the same
  private realtime channel used by reactions.
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
- Trusted participants remain invisible and their messages are auto-approved.
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
  independent and each archives one recording in `tests/e2e/videos/`, retaining
  only recent runs.
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
        "moment": "^2.30.1",
        "next": "15.2.6",
        "next-themes": "^0.4.6",
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
        "@eslint/eslintrc": "^3",
        "@playwright/test": "^1.62.1",
        "@testing-library/jest-dom": "^6.6.3",
        "@testing-library/react": "^16.3.0",
        "@total-typescript/ts-reset": "^0.6.1",
        "@types/js-yaml": "^4.0.9",
        "@types/lodash": "^4.17.20",
        "@types/node": "^20",
        "@types/pg": "^8.15.5",
        "@types/react": "^19",
        "@types/react-dom": "^19",
        "autoprefixer": "^10.4.21",
        "eslint": "^9",
        "eslint-config-next": "15.2.4",
        "jsdom": "^26.0.0",
        "postcss": "^8.5.3",
        "ptbk": "0.114.0-39",
        "raw-loader": "^4.0.2",
        "tailwindcss": "^3.4.17",
        "tailwindcss-animate": "^1.0.7",
        "tsx": "^4.19.4",
        "typescript": "^5",
        "vitest": "^3.1.1"
    }
}
# Current preversion

- Replaced the centered cookie popup on every page with a shallow desktop strip
  and an inset mobile panel. The banner and its settings now use
  light, workshop, or podcast colors together, with clearer button hierarchy,
  keyboard focus, and scrollable settings on short screens. One shared measurement
  hook keeps the banner, podcast player, coder badge, booking notice, and admin
  table scrollbar clear of each other as they appear or resize; reserved space
  keeps footer links reachable. Existing Czech/English copy, saved choices, and
  the privacy page's cookie settings link remain available across all pages.

- Put the answers members write into a community poll through the very same moderation a chat message goes through. An
  `Other` answer written in `/cs/komunita` or in an attached `/cs/online-workshop/participant?workshop=` is no longer
  public the moment it is written: it waits for a decision, while a trusted member and a moderator have theirs approved
  as they write it, because a chat message, a shared project and now a poll answer are all decided by one shared
  submission policy rather than by a rule each surface wrote for itself. The member who wrote the answer keeps seeing
  it, marked `Čeká na schválení`, and their vote is counted for them straight away, so waiting for a moderator never
  costs anybody their own choice; everybody else receives neither the answer nor its vote until it is approved, which
  keeps a poll's total honest without a second counting rule. A rejected answer leaves the poll for everybody including
  its writer, exactly as a rejected message leaves the chat. Deciding about an answer is offered where the decision
  belongs: a moderator of the room which owns the poll approves or rejects it from the poll itself, by the same quiet
  buttons which moderate a chat message, while a moderator of an occurrence the poll is merely about reads the same
  answers every other member does, because a poll is administered by its community rather than by whichever room it is
  attached to. `/admin/workshops` and `/admin/community` additionally say who wrote each answer, with the name and
  normalized e-mail they connected with and the moment they wrote it, and can reword it, reject it, or remove it
  together with the votes cast for it. A prepared choice of the administration is untouched by all of this: it is still
  edited as part of its question, stays public, and is never attributed to a member. An answer written before this
  change keeps being public, and its writer is recovered from the first vote it ever received, which is the vote the
  writing itself cast.

- Let an administrator write the start of a paid replay on a clock. The stage settings of `/admin/workshops` now ask
  for `Začít záznam od` in its own `Hodiny`, `Minuty` and `Sekundy` boxes instead of in one number of seconds, so the
  moment the workshop itself begins at is written as `0 : 1 : 15` rather than counted out as `75`. Nothing about the
  offset itself changed: it is held, saved, exported and read by `/cs/online-workshop/participant?workshop=` in exactly
  the same seconds as before, the field says underneath which number of seconds it is about to save, and a term which
  was given its offset before this change opens on the very same position of its recording.

- Let the project a term is about run in more than one place. The project settings of `/admin/workshops` now take one
  address of a deployment per line instead of a single address altogether, and
  `/cs/online-workshop/participant?workshop=` opens every one of them beside the repository the workshop follows. A
  project deployed in one place is still simply its `Živá aplikace`, exactly as it was; several deployments are named
  by the addresses they are reached at — `workshop.example/app` beside `staging.workshop.example/app` — because one
  repeated name would say nothing about which of them a participant is opening. The compact card of the term in
  `/cs/komunita` is previewed from the first written address, so a card still costs one request however many places
  the project runs at, and the settings export writes them all on one line. Every deployment belongs to the connected
  repository exactly as its branch patterns already did: they are written, changed and cleared as one connection, so
  clearing the repository can leave behind no address of a project nobody is connected to. An address which cannot be
  opened, and a second address which means the very same page, are refused when written and left out when read, while
  an address stored before this change keeps its place as the first deployment of its project.

- An administrator in `/admin/workshops` or a moderator in
  `/cs/online-workshop/participant?workshop=` can now turn any chat comment into an immediately available material.
  The source comment remains in the chat untouched; the new material keeps its complete Markdown body and names its
  chat author in the title. Both entry points use the ordinary material-creation path, so its short links, live room
  refresh, publication and member access behave exactly like a material created in the content editor.

- Made the compact cards of the published terms in `/cs/komunita` tell more of the story of an event without giving
  the calendar and the card-list two versions of it: the same card is shown below a selected calendar day, below a
  month, and in the `Karty` view, and can now show the anonymous average of the star ratings with its count, a visual
  preview of the project the workshop followed, and the real replay length. That length is the total public YouTube
  duration less the start offset an administrator set to remove the waiting room, so `1:30:00` with a `75`-second
  offset is named `1:28:45` rather than pretending the whole live stream is replay. Ratings are reduced before the
  browser receives them — no response, author, or e-mail is published — and the raw recording identifier stays on the
  server as well. A missing rating, project, deploy-preview, video, or public duration simply leaves that small part
  off the card; the ordinary event link, calendar subscription, and membership gate keep exactly their former jobs.

- A term which has only just been held is no longer one more term of the history. Where an event stands in time is now
  one of four things instead of three — it is still ahead, it runs right now, it is freshly past while less than a day
  has gone by since the end recorded for it, or it is past — and that is answered in the single place which already
  answered the other three, so no list, badge, or colour can decide it on its own. In `/cs/komunita` such a term wears
  its own amber `Právě proběhlo` badge, colours its own day of the calendar, is named in the legend beside the three
  others, and is listed after what is ahead rather than at the head of the archive. In
  `/cs/online-workshop/participant?workshop=` it is offered in the open under `Právě proběhlo`, between the workshops
  which run or are coming and the `Proběhlé workshopy` disclosure, so somebody who was at last night's workshop finds
  the room they have just left without unfolding the whole history to look for it. `/admin/workshops` lists such a term
  under `Aktuální a nadcházející`, after what runs and what is coming, because the workshop of last night is the one an
  administrator is still working on — reading its participants, moderating its comments, publishing its recording — and
  its `Historie` now holds only the terms nobody is wrapping up any more, so opening a freshly held term no longer
  unfolds that archive either. Everything which opens only after a workshop is over is untouched: the wrap-up, its PDF,
  the feedback, and the paid recording all read a freshly past term as exactly as finished as one from last spring.

- A term near enough to be looked forward to is now named rather than merely dated. One held today reads
  `dnes, úterý 15. 9. 2026 · 11:11`, one held tomorrow `zítra, středa 16. 9. 2026 · 11:11`, and one held later in the
  same week `tento čtvrtek 17. 9. 2026 · 11:11` — in the gender the name of that weekday has in Czech, so that
  `tento čtvrtek` stands beside `tato středa` and `toto úterý`. A week runs from Monday to Sunday, as it does in the
  Czech Republic, and a term further away than that stays the plain date it always was, so a list of distant terms
  does not grow a weekday it never showed. The waiting room and the term picker of `/cs/online-workshop/participant`,
  the cards and the calendar day of `/cs/komunita`, the header, hero, term picker and chosen-term line of
  `/cs/online-workshop`, its thank-you page, and the term picker of `/ai-supervize-mini` all say it, because how near a
  day is is worked out once, from the day a term falls on in Prague and the day the page was built on. That day comes
  from the server rather than from the browser, so a page says exactly what it was sent as instead of renaming its
  terms the instant it hydrates. Nothing which is not a term read against today changed: the times of chat messages and
  materials, the dates a membership is paid to, the printed participant sheet, the published calendar, and the notes a
  registration is counted by are untouched.

- Moved the community polls attached to an occurrence to the bottom of `/cs/online-workshop/participant?workshop=`.
  A participant now reads the stage, the invitation, and everything the workshop hands over in its materials first, and
  is asked for their vote below them, because a poll a workshop is merely the subject of matters less to its
  participant than the materials they came for. The poll itself, its options, its written answers and the one shared
  e-mail-owned vote are unchanged, and `/cs/komunita` keeps its own polls above its materials, because that is where

 succeeded in 2460ms:
import {
    WORKSHOP_SUBMISSION_STATUS_VALUES,
    type WorkshopParticipant,
    type WorkshopSubmissionStatus,
} from '@/lib/workshops/workshopTypes';

/**
 * Recognizes the shared moderation lifecycle of a participant submission without tying project routes to chat-only
 * naming.
 */
export function isWorkshopSubmissionStatus(value: string | null): value is WorkshopSubmissionStatus {
    return value !== null && WORKSHOP_SUBMISSION_STATUS_VALUES.includes(value as WorkshopSubmissionStatus);
}

/**
 * Where one thing a participant submits starts its life
 *
 * Note: A moderator submits into the room they moderate, so their own contribution never waits for the moderation they
 *       would do themselves. Chat messages, community projects, and the answers members write into a poll all use this
 *       exact policy, so trust can never approve one kind of submission differently from another.
 * Note: This is deliberately free of anything a server alone can do, because the room itself asks the same question to
 *       tell a member in advance whether what they are about to write waits for a decision.
 */
export function getWorkshopParticipantSubmissionStatus(
    participant: Pick<WorkshopParticipant, 'isInteractionBanned' | 'isTrusted' | 'isModerator'>,
): WorkshopSubmissionStatus {
    if (participant.isInteractionBanned) {
        return 'rejected';
    }

    return participant.isTrusted || participant.isModerator ? 'approved' : 'pending';
}
import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { WORKSHOP_COMMENT_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import {
    createWorkshopCommentAuthor,
    mapWorkshopCommentRow,
    WORKSHOP_COMMENT_COLUMNS,
    type WorkshopCommentRow,
} from '@/lib/workshops/workshopDatabase';
import { areWorkshopCommentLinksEnabled } from '@/lib/workshops/workshopCommentLinks';
import { materializeWorkshopCommentShortLinks } from '@/lib/workshops/workshopMaterialLinks';
import { isWorkshopParticipantModerating } from '@/lib/workshops/workshopModeration';
import { getDisabledWorkshopPanelResponseOrNull } from '@/lib/workshops/workshopParticipantInteraction';
import { getWorkshopParticipantSubmissionStatus } from '@/lib/workshops/workshopSubmissionStatus';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import {
    getAuthenticatedWorkshopRequest,
    isAuthenticatedWorkshopRequest,
    type AuthenticatedWorkshopRequest,
} from '@/lib/workshops/workshopRequest';
import { workshopCommentSchema } from '@/lib/workshops/workshopSchemas';
import { NextRequest, NextResponse } from 'next/server';

const COMMENT_RATE_LIMIT_ERROR = 'WORKSHOP_COMMENT_RATE_LIMITED';

type WorkshopCommentsRouteContext = {
    readonly params: Promise<{ readonly workshopSlug: string }>;
};

/**
 * Refuses a reply which does not answer an approved comment opening a thread of this very room
 *
 * Note: The room offers an answer only under such a comment, so this rejects a stale or a forged request.
 */
async function getUnanswerableWorkshopCommentResponseOrNull(
    authenticatedRequest: AuthenticatedWorkshopRequest,
    parentCommentId: string,
): Promise<NextResponse | null> {
    const { data, error } = await authenticatedRequest.supabase
        .from(WORKSHOP_COMMENT_TABLE_NAME)
        .select('id, parent_comment_id')
        .eq('id', parentCommentId)
        .eq('workshop_id', authenticatedRequest.workshopRow.id)
        .eq('status', 'approved')
        .maybeSingle();

    if (error) {
        console.error('Failed to check the answered workshop comment:', error.message);
        return NextResponse.json({ error: 'Answered comment could not be checked' }, { status: 500 });
    }
    if (data === null) {
        return NextResponse.json({ error: 'Answered comment not found' }, { status: 404 });
    }
    if (data.parent_comment_id !== null) {
        return NextResponse.json({ error: 'A reply cannot be answered by another reply' }, { status: 400 });
    }

    return null;
}

export async function POST(request: NextRequest, context: WorkshopCommentsRouteContext) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse) {
        return crossSiteResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopCommentSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json({ error: 'Comment must contain 1 to 2,000 characters' }, { status: 400 });
    }

    const { workshopSlug } = await context.params;
    const authenticatedRequest = await getAuthenticatedWorkshopRequest(request, workshopSlug);
    if (!isAuthenticatedWorkshopRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }

    const disabledChatResponse = getDisabledWorkshopPanelResponseOrNull(authenticatedRequest.workshopRow, 'chat');
    if (disabledChatResponse) {
        return disabledChatResponse;
    }

    const { parentCommentId } = parsedResult.data;
    if (parentCommentId !== null) {
        const unanswerableCommentResponse = await getUnanswerableWorkshopCommentResponseOrNull(
            authenticatedRequest,
            parentCommentId,
        );
        if (unanswerableCommentResponse) {
            return unanswerableCommentResponse;
        }
    }

    const commentStatus = getWorkshopParticipantSubmissionStatus(authenticatedRequest.participant);

    const { data, error } = await authenticatedRequest.supabase
        .from(WORKSHOP_COMMENT_TABLE_NAME)
        .insert({
            workshop_id: authenticatedRequest.workshopRow.id,
            participant_id: authenticatedRequest.participant.id,
            parent_comment_id: parentCommentId,
            author_name: authenticatedRequest.participant.fullname,
            body: parsedResult.data.body,
            status: commentStatus,
        })
        .select(WORKSHOP_COMMENT_COLUMNS)
        .single();

    if (error?.message.includes(COMMENT_RATE_LIMIT_ERROR)) {
        return NextResponse.json({ error: 'Please wait before sending another comment' }, { status: 429 });
    }
    if (error || data === null) {
        console.error('Failed to save a pending workshop comment:', error?.message ?? 'No comment returned');
        return NextResponse.json({ error: 'Comment could not be saved' }, { status: 500 });
    }

    const { participant } = authenticatedRequest;
    let commentRow = data as WorkshopCommentRow;
    if (areWorkshopCommentLinksEnabled({ isArtificial: false, isAuthorModerator: participant.isModerator })) {
        const materializedComment = await materializeWorkshopCommentShortLinks(authenticatedRequest.supabase, {
            workshopSlug: authenticatedRequest.workshopRow.slug,
            workshopKind: authenticatedRequest.workshopRow.room_kind,
            commentId: commentRow.id,
            bodyMarkdown: commentRow.body,
        });
        if (materializedComment.errorMessage !== null) {
            // The comment itself was persisted. State loading retries the same
            // materializer, and the chat renderer never activates an unshortened URL.
            console.error('Failed to prepare short links for a moderator comment:', materializedComment.errorMessage);
        } else if (materializedComment.bodyMarkdown !== null) {
            commentRow = { ...commentRow, body: materializedComment.bodyMarkdown };
        }
    }

    // The participant who just wrote this message is the only author it can have, so it is described from them.
    const comment = mapWorkshopCommentRow(commentRow, false, {
        pinnedCommentId: authenticatedRequest.workshopRow.pinned_comment_id,
        authorByParticipantId: new Map([[participant.id, createWorkshopCommentAuthor(participant)]]),
        isModerationOffered: isWorkshopParticipantModerating(participant),
    });

    if (commentStatus === 'approved') {
        await broadcastWorkshopEvent(authenticatedRequest.supabase, authenticatedRequest.workshopRow, {
            kind: 'state-changed',
        });
    }

    return NextResponse.json(
        {
            comment,
        },
        { status: 201 },
    );
}
import { COMMUNITY_PROJECT_TABLE_NAME } from '@/lib/community-projects/communityProjectConstants';
import type { CommunityProjectModerationStatus } from '@/lib/community-projects/communityProjectTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ModeratedCommunityProject = {
    readonly projectId: string;
    readonly status: CommunityProjectModerationStatus;
};

type ModeratedCommunityProjectRow = {
    readonly id: string;
    readonly status: CommunityProjectModerationStatus;
};

/**
 * Writes one final approval decision for a community project. The community-room route and the administration use
 * this exact mutation, so their decision cannot diverge.
 */
export async function moderateCommunityProject(
    supabase: SupabaseClient,
    projectId: string,
    status: CommunityProjectModerationStatus,
): Promise<{ readonly project: ModeratedCommunityProject | null; readonly errorMessage: string | null }> {
    const { data, error } = await supabase
        .from(COMMUNITY_PROJECT_TABLE_NAME)
        .update({ status })
        .eq('id', projectId)
        .select('id, status')
        .maybeSingle();

    if (error) {
        return { project: null, errorMessage: error.message };
    }
    if (data === null) {
        return { project: null, errorMessage: null };
    }

    const project = data as ModeratedCommunityProjectRow;
    return { project: { projectId: project.id, status: project.status }, errorMessage: null };
}
import type { workshopPollOptionUpdateSchema } from '@/lib/workshops/workshopSchemas';
import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import type { z } from 'zod';

export type WorkshopPollOptionModerationValues = z.infer<typeof workshopPollOptionUpdateSchema>;

type WorkshopPollOptionErrorKind = 'not-found' | 'duplicate' | 'invalid' | 'database';

export type WorkshopPollOptionModerationResult =
    | { readonly isSuccessful: true; readonly optionId: string }
    | {
          readonly isSuccessful: false;
          readonly errorKind: WorkshopPollOptionErrorKind;
          readonly errorMessage: string;
      };

const WORKSHOP_POLL_OPTION_ERROR_KIND_BY_DATABASE_MESSAGE: Readonly<
    Record<string, Exclude<WorkshopPollOptionErrorKind, 'database'>>
> = {
    WORKSHOP_POLL_OPTION_NOT_FOUND: 'not-found',
    WORKSHOP_POLL_OPTION_DUPLICATE: 'duplicate',
    WORKSHOP_POLL_OPTION_INVALID: 'invalid',
};

function createFailedWorkshopPollOptionResult(error: PostgrestError): WorkshopPollOptionModerationResult {
    return {
        isSuccessful: false,
        errorKind: WORKSHOP_POLL_OPTION_ERROR_KIND_BY_DATABASE_MESSAGE[error.message] ?? 'database',
        errorMessage: error.message,
    };
}

/**
 * Decides about one member-written poll answer and corrects its wording.
 *
 * Note: The administration and a moderator of the room moderate exactly the same way; only what each of them may write
 *       differs, and that difference stays in `workshopModeration` alone, exactly as it does for a chat message.
 * Note: The database owns the whole rule: the answer has to belong to this poll, the poll to this community, and the
 *       answer has to be one a member wrote, because a prepared choice is only ever edited together with its poll.
 */
export async function moderateWorkshopPollOption(
    supabase: SupabaseClient,
    workshopId: string,
    pollId: string,
    optionId: string,
    values: WorkshopPollOptionModerationValues,
): Promise<WorkshopPollOptionModerationResult> {
    const { data: moderatedOptionId, error } = await supabase.rpc('moderate_community_workshop_poll_option', {
        target_workshop_id: workshopId,
        target_poll_id: pollId,
        target_option_id: optionId,
        target_status: values.status ?? null,
        target_label: values.label ?? null,
    });
    if (error) {
        return createFailedWorkshopPollOptionResult(error);
    }
    if (moderatedOptionId === null) {
        return { isSuccessful: false, errorKind: 'not-found', errorMessage: 'WORKSHOP_POLL_OPTION_NOT_FOUND' };
    }

    return { isSuccessful: true, optionId: moderatedOptionId as string };
}

/**
 * Removes one member-written poll answer together with the votes cast for it.
 */
export async function deleteWorkshopPollOption(
    supabase: SupabaseClient,
    workshopId: string,
    pollId: string,
    optionId: string,
): Promise<WorkshopPollOptionModerationResult> {
    const { data: deletedOptionId, error } = await supabase.rpc('delete_community_workshop_poll_option', {
        target_workshop_id: workshopId,
        target_poll_id: pollId,
        target_option_id: optionId,
    });
    if (error) {
        return createFailedWorkshopPollOptionResult(error);
    }
    if (deletedOptionId === null) {
        return { isSuccessful: false, errorKind: 'not-found', errorMessage: 'WORKSHOP_POLL_OPTION_NOT_FOUND' };
    }

    return { isSuccessful: true, optionId: deletedOptionId as string };
}
import { WORKSHOP_COMMENT_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import { updatePinnedWorkshopComment } from '@/lib/workshops/workshopDatabase';
import type { workshopCommentUpdateSchema } from '@/lib/workshops/workshopSchemas';
import type { WorkshopCommentStatus } from '@/lib/workshops/workshopTypes';
import { createWorkshopCommentUpdateDatabaseValues, getWorkshopCommentPinChange } from '@/lib/workshops/workshopValues';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { z } from 'zod';

type WorkshopCommentUpdateValues = z.infer<typeof workshopCommentUpdateSchema>;

/**
 * One message of a chat after it was moderated
 */
export type ModeratedWorkshopComment = {
    readonly commentId: string;
    readonly status: WorkshopCommentStatus;
    readonly body: string;
};

type ModeratedWorkshopCommentRow = {
    readonly id: string;
    readonly status: WorkshopCommentStatus;
    readonly body: string;
};

type LoadedModeratedWorkshopComment = {
    readonly data: ModeratedWorkshopCommentRow | null;
    readonly error: { readonly message: string } | null;
};

const MODERATED_WORKSHOP_COMMENT_COLUMNS = 'id, status, body';

/**
 * Writes the changed fields of a comment and reads it back, or only reads it when nothing but its pin changes
 *
 * Note: Reading the comment back proves that it belongs to this very workshop before its pin is moved.
 */
async function loadModeratedWorkshopComment(
    supabase: SupabaseClient,
    workshopId: string,
    commentId: string,
    commentDatabaseValues: Readonly<Record<string, unknown>>,
): Promise<LoadedModeratedWorkshopComment> {
    const commentTable = supabase.from(WORKSHOP_COMMENT_TABLE_NAME);

    if (Object.keys(commentDatabaseValues).length === 0) {
        return await commentTable
            .select(MODERATED_WORKSHOP_COMMENT_COLUMNS)
            .eq('id', commentId)
            .eq('workshop_id', workshopId)
            .maybeSingle();
    }

    return await commentTable
        .update(commentDatabaseValues)
        .eq('id', commentId)
        .eq('workshop_id', workshopId)
        .select(MODERATED_WORKSHOP_COMMENT_COLUMNS)
        .maybeSingle();
}

/**
 * Moderates one message of one chat: its decision, its text, and the top of the chat it holds
 *
 * Note: The administration and a moderator of the room moderate exactly the same way, only what each of them may write
 *       differs, so both of them come here and the difference stays in `workshopModeration` alone.
 * Note: A comment which belongs to no such workshop is reported as no comment at all rather than as a failure.
 */
export async function moderateWorkshopComment(
    supabase: SupabaseClient,
    workshopId: string,
    commentId: string,
    values: WorkshopCommentUpdateValues,
): Promise<{ readonly comment: ModeratedWorkshopComment | null; readonly errorMessage: string | null }> {
    const { data, error } = await loadModeratedWorkshopComment(
        supabase,
        workshopId,
        commentId,
        createWorkshopCommentUpdateDatabaseValues(values),
    );
    if (error) {
        return { comment: null, errorMessage: error.message };
    }
    if (data === null) {
        return { comment: null, errorMessage: null };
    }

    const pinChange = getWorkshopCommentPinChange(values);
    if (pinChange !== null) {
        const { errorMessage } = await updatePinnedWorkshopComment(supabase, workshopId, commentId, pinChange);
        if (errorMessage !== null) {
            return { comment: null, errorMessage };
        }
    }

    return { comment: { commentId: data.id, status: data.status, body: data.body }, errorMessage: null };
}

 succeeded in 2531ms:
app/api\workshops\[workshopSlug]\polls\[pollId]\votes\route.test.ts:78:    return new NextRequest(`https://promptbook.studio/api/workshops/${WORKSHOP_SLUG}/polls/${POLL_ID}/votes`, {
README.md:3:    <img src="./public/logo/promptbook-logo-blue-transparent-1024.png" width="160" alt="Promptbook">
app/api\admin\workshops\[workshopId]\stage-comment\route.test.ts:46:    return new NextRequest(`https://promptbook.studio/api/admin/workshops/${WORKSHOP_ID}/stage-comment`, {
app/api\admin\workshops\[workshopId]\route.test.ts:37:    return new NextRequest(`https://promptbook.studio/api/admin/workshops/${WORKSHOP_ID}`, { method: 'DELETE' });
app/api\admin\workshops\[workshopId]\participants\route.test.ts:63:    return new NextRequest('https://promptbook.studio/api/admin/workshops/community-id/participants');
app/api\admin\workshops\[workshopId]\feedback\route.test.ts:46:    return new NextRequest('https://promptbook.studio/api/admin/workshops/workshop-1/feedback');
app/api\workshops\[workshopSlug]\comments\[commentId]\material\route.test.ts:50:    return new NextRequest(`https://promptbook.studio/api/workshops/${WORKSHOP_SLUG}/comments/${COMMENT_ID}/material`, {
app/api\ai-supervize-mini\registration\route.ts:2:    AI_SUPERVIZE_MINI_WORKSHOP_REGISTRATION_PLACE_NAME,
app/api\ai-supervize-mini\registration\route.ts:222:        placeName: AI_SUPERVIZE_MINI_WORKSHOP_REGISTRATION_PLACE_NAME,
app/api\ai-ta-krajta\episodes\search\route.ts:3:    AI_TA_KRAJTA_EPISODE_SEARCH_QUERY_PARAMETER_NAME,
app/api\ai-ta-krajta\episodes\search\route.ts:4:    MAXIMAL_AI_TA_KRAJTA_EPISODE_SEARCH_QUERY_LENGTH,
app/api\ai-ta-krajta\episodes\search\route.ts:12:    const searchQuery = request.nextUrl.searchParams.get(AI_TA_KRAJTA_EPISODE_SEARCH_QUERY_PARAMETER_NAME);
app/api\ai-ta-krajta\episodes\search\route.ts:14:    if (searchQuery === null || searchQuery.length > MAXIMAL_AI_TA_KRAJTA_EPISODE_SEARCH_QUERY_LENGTH) {
app/api\workshops\[workshopSlug]\membership\portal\route.test.ts:95:    return new NextRequest(`https://promptbook.studio/api/workshops/${workshopSlug}/membership/portal`, {
app/api\workshops\[workshopSlug]\membership\portal\route.test.ts:132:            return_url: 'https://promptbook.studio/cs/komunita',
app/api\workshops\[workshopSlug]\membership\portal\route.test.ts:149:            return_url: 'https://promptbook.studio/cs/online-workshop/participant?workshop=produkcni-kod-s-ai-agenty',
app/api\workshops\[workshopSlug]\membership\cancellation\route.test.ts:92:    return new NextRequest(`https://promptbook.studio/api/workshops/${workshopSlug}/membership/cancellation`, {
app/api\admin\workshops\[workshopId]\comments\[commentId]\material\route.test.ts:48:        `https://promptbook.studio/api/admin/workshops/${WORKSHOP_ID}/comments/${COMMENT_ID}/material`,
app/api\admin\workshops\route.test.ts:47:    return new NextRequest('https://promptbook.studio/api/admin/workshops', {
app/api\admin\shortener\[shortcodeLinkId]\route.test.ts:77:    return new NextRequest(`https://promptbook.studio/api/admin/shortener/${shortcodeLinkId}`, {
app/api\admin\shortener\[shortcodeLinkId]\clicks\route.test.ts:44:    return new NextRequest(`https://promptbook.studio/api/admin/shortener/${shortcodeLinkId}/clicks`, {
app/api\admin\shortener\route.test.ts:93:    return new NextRequest('https://promptbook.studio/api/admin/shortener', {
app/api\admin\session\route.test.ts:10:const ADMIN_SESSION_API_URL = 'https://promptbook.studio/api/admin/session';
app/api\admin\community\memberships\route.test.ts:47:        'https://promptbook.studio/api/admin/community/memberships?membershipStatus=active&membershipTest=false',
lib\book-registry.ts:1:import type { string_book } from '@promptbook/types';
lib\api\api.test.ts:82:        const request = new NextRequest('https://promptbook.studio/api/workshops/example/comments', {
lib\api\api.test.ts:83:            headers: { origin: 'https://promptbook.studio', 'sec-fetch-site': 'same-origin' },
lib\api\api.test.ts:98:        const request = new NextRequest('https://promptbook.studio/api/workshops/example/comments', {
lib\api\api.test.ts:106:        const request = new NextRequest('https://promptbook.studio/api/workshops/example/comments', {
lib\api\api.test.ts:107:            headers: { origin: 'https://other.promptbook.studio', 'sec-fetch-site': 'same-site' },
lib\api\api.test.ts:114:        const request = new NextRequest('https://promptbook.studio/api/workshops/example/comments');
lib\admin\adminSession.ts:14:const ADMIN_SESSION_SIGNATURE_NAMESPACE = 'promptbook-admin-session:';
lib\admin\adminApiGuard.test.ts:9:const ADMIN_API_URL = 'https://promptbook.studio/api/admin/workshops';
lib\contacts\contacts.test.ts:437:            getContactLink(buildContact({ referrer: 'https://example.com/search?q=promptbook' }), 'referrer'),
lib\contacts\contacts.test.ts:439:            href: 'https://example.com/search?q=promptbook',
lib\discounts\discountPlaces.ts:16:export const AI_SUPERVIZE_MINI_PATH = '/ai-supervize-mini';
lib\discounts\discountPlaces.ts:19:export const AI_SUPERVIZE_MINI_ONSITE_DISCOUNT_PLACE_ID = 'ai-supervize-mini-onsite';
lib\discounts\discountPlaces.ts:20:export const AI_SUPERVIZE_MINI_ONLINE_DISCOUNT_PLACE_ID = 'ai-supervize-mini-online';
lib\discounts\discountPlaces.ts:25:        id: AI_SUPERVIZE_MINI_ONSITE_DISCOUNT_PLACE_ID,
lib\discounts\discountPlaces.ts:28:        pagePath: AI_SUPERVIZE_MINI_PATH,
lib\discounts\discountPlaces.ts:32:        id: AI_SUPERVIZE_MINI_ONLINE_DISCOUNT_PLACE_ID,
lib\discounts\discountPlaces.ts:35:        pagePath: AI_SUPERVIZE_MINI_PATH,
lib\discounts\discountPlaces.test.ts:2:    AI_SUPERVIZE_MINI_PATH,
lib\discounts\discountPlaces.test.ts:15:            `${AI_SUPERVIZE_MINI_PATH}?code=WEBINAR%202026#registrace`,
lib\workshops\workshopValues.test.ts:72:                    name: 'promptbook',
lib\workshops\workshopValues.test.ts:78:            github_repository: 'hejny/promptbook',
lib\workshops\workshopValues.test.ts:94:                    name: 'promptbook',
lib\workshops\workshopValues.test.ts:100:            github_repository: 'hejny/promptbook',
lib\workshops\workshopValues.test.ts:106:                repository: { owner: 'hejny', name: 'promptbook', branch: '*', deploymentUrls: [] },
lib\workshops\workshopValues.test.ts:109:            github_repository: 'hejny/promptbook',
lib\workshops\workshopSchemas.test.ts:170:                    url: 'https://github.com/hejny/promptbook/tree/main',
lib\workshops\workshopSchemas.test.ts:177:            name: 'promptbook',
lib\workshops\workshopSchemas.test.ts:181:        expect(workshopUpdateSchema.parse({ repository: { url: 'hejny/promptbook' } }).repository).toEqual({
lib\workshops\workshopSchemas.test.ts:183:            name: 'promptbook',
lib\workshops\workshopSchemas.test.ts:193:                    url: 'hejny/promptbook',
lib\workshops\workshopSchemas.test.ts:199:            name: 'promptbook',
lib\workshops\workshopSchemas.test.ts:206:                    url: 'hejny/promptbook',
lib\workshops\workshopSchemas.test.ts:216:                repository: { url: 'hejny/promptbook', branch: ['main', 'client-*', 'feature/*'] },
lib\workshops\workshopSchemas.test.ts:220:            name: 'promptbook',
lib\workshops\workshopSchemas.test.ts:224:        expect(workshopUpdateSchema.parse({ repository: { url: 'hejny/promptbook', branch: '*' } }).repository).toEqual(
lib\workshops\workshopSchemas.test.ts:227:            name: 'promptbook',
lib\workshops\workshopSchemas.test.ts:232:        expect(workshopUpdateSchema.parse({ repository: { url: 'hejny/promptbook', branch: [] } }).repository).toEqual({
lib\workshops\workshopSchemas.test.ts:234:            name: 'promptbook',
lib\workshops\workshopSchemas.test.ts:240:                repository: { url: 'hejny/promptbook', branch: ['main', 'main'] },
lib\workshops\workshopSchemas.test.ts:256:            workshopUpdateSchema.safeParse({ repository: { url: 'hejny/promptbook', branch: 'main..x' } }).success,
lib\workshops\workshopSchemas.test.ts:259:            workshopUpdateSchema.safeParse({ repository: { url: 'hejny/promptbook', branch: 'feature/?' } }).success,
lib\workshops\workshopSchemas.test.ts:263:                repository: { url: 'hejny/promptbook', deploymentUrls: ['javascript:alert(1)'] },
lib\workshops\workshopSchemas.test.ts:268:                repository: { url: 'hejny/promptbook', deploymentUrls: ['https://workshop.example/app', ''] },
lib\workshops\workshopRepositoryMonitor.test.ts:22:    name: 'promptbook',
lib\workshops\workshopRepositoryMonitor.test.ts:29:    name: 'promptbook-notifications',
lib\workshops\workshopRepository.test.ts:8:                repository: 'hejny/promptbook',
lib\workshops\workshopRepository.test.ts:14:            name: 'promptbook',
lib\workshops\workshopRepository.test.ts:23:                repository: 'hejny/promptbook',
lib\workshops\workshopRepository.test.ts:29:            name: 'promptbook',
lib\workshops\workshopRepository.test.ts:38:                repository: 'hejny/promptbook',
lib\workshops\workshopRepository.test.ts:44:            name: 'promptbook',
lib\workshops\workshopRepository.test.ts:49:            createWorkshopRepositoryOrNull({ repository: 'hejny/promptbook', branch: [], deploymentUrls: null }),
lib\workshops\workshopRepository.test.ts:50:        ).toEqual({ owner: 'hejny', name: 'promptbook', branch: '*', deploymentUrls: [] });
lib\workshops\workshopRepository.test.ts:72:                repository: 'https://github.com/hejny/promptbook',
lib\workshops\workshopRepository.test.ts:78:            name: 'promptbook',
lib\workshops\workshopRegistrations.test.ts:18:const AI_SUPERVIZE_MINI_TERM: WorkshopRegistrationTerm = {
lib\workshops\workshopRegistrations.test.ts:53:                JSON.stringify({ selectedDateId: AI_SUPERVIZE_MINI_TERM.slug, participantCount: 4 }),
lib\workshops\workshopRegistrations.test.ts:55:        ).toEqual({ termId: AI_SUPERVIZE_MINI_TERM.slug, participantCount: 4 });
lib\workshops\workshopRegistrations.test.ts:126:                JSON.stringify({ selectedDateId: AI_SUPERVIZE_MINI_TERM.slug, participantCount: 3 }),
lib\workshops\workshopRegistrations.test.ts:133:        expect(getRegisteredParticipantCount(registeredParticipantCountByTermId, AI_SUPERVIZE_MINI_TERM)).toBe(3);
lib\workshops\workshopRegistrations.test.ts:140:                JSON.stringify({ selectedDateId: AI_SUPERVIZE_MINI_TERM.slug, participantCount: 1 }),
lib\workshops\workshopRegistrations.test.ts:144:        expect(getRegisteredParticipantCount(registeredParticipantCountByTermId, AI_SUPERVIZE_MINI_TERM)).toBe(5);
lib\workshops\workshopRegistrations.test.ts:163:        expect(getWorkshopRegistrationTermIds(AI_SUPERVIZE_MINI_TERM)).toEqual([
lib\workshops\workshopRegistrations.test.ts:164:            AI_SUPERVIZE_MINI_TERM.slug,
lib\workshops\workshopRegistrations.test.ts:169:            getWorkshopRegistrationTermIds({ slug: '2026-09-09', startsAt: AI_SUPERVIZE_MINI_TERM.startsAt }),
lib\workshops\workshopParticipantLink.ts:10:const SITE_RELATIVE_URL_ORIGIN = 'https://promptbook.invalid';
lib\workshops\workshopMaterialLinkSyntax.ts:8:const WORKSHOP_MATERIAL_LINK_BASE_URL = 'https://www.promptbook.studio';
lib\workshops\workshopMaterialLinks.ts:26:const WORKSHOP_UTM_SOURCE = 'promptbook';
lib\workshops\workshopMaterialLinks.test.ts:41:        expect(parsedUrl.searchParams.get('utm_source')).toBe('promptbook');
lib\workshops\workshopMaterialLinks.test.ts:177:                'https://example.com/material?download=1&utm_source=promptbook&utm_medium=workshop&utm_campaign=production-ai-2026-08-24&utm_content=content-44',
lib\workshops\workshopMaterialLinks.test.ts:261:                'https://example.com/guide?utm_source=promptbook&utm_medium=workshop&utm_campaign=production-ai-2026-08-25&utm_content=comment-45',
lib\workshops\workshopKindCapabilities.test.ts:106:                repository: { owner: 'hejny', name: 'promptbook', branch: null, deploymentUrls: [] },
lib\workshops\workshopKindCapabilities.test.ts:125:                repository: { owner: 'hejny', name: 'promptbook', branch: 'main', deploymentUrls: [] },
lib\workshops\workshopEventCardDetails.test.ts:26:        owner: 'promptbook',
lib\workshops\workshopEventCardDetails.test.ts:55:                repositoryName: 'promptbook/automation-dashboard',
lib\workshops\workshopEventCardDetails.test.ts:78:                title: 'promptbook/automation-dashboard',
lib\workshops\workshopEventCardDetails.test.ts:81:                repositoryName: 'promptbook/automation-dashboard',
lib\workshops\workshopAdminExports.test.ts:171:                    name: 'promptbook',
lib\workshops\workshopAdminExports.test.ts:180:            '"hejny/promptbook","main, feature/rooms","https://workshop.example/app, https://staging.workshop.example/app"',
lib\workshops\fetchWorkshopRepositoryProgress.test.ts:42:    return { owner: 'hejny', name: 'promptbook', branch, deploymentUrls: [] };
lib\tracking\trackingExclusions.ts:45:            typeof window === 'undefined' ? 'https://www.promptbook.studio' : window.location.origin,
lib\tracking\trackingExclusions.test.ts:26:            'https://promptbook.studio/admin?token=secret&email=jane%40example.com&view=workshops',
lib\tracking\trackingExclusions.test.ts:29:        expect(sanitizedUrl).toBe('https://promptbook.studio/admin?view=workshops');
lib\metadata\site-config.ts:21:export const SITE_TWITTER_HANDLE = '@promptbook';
lib\metadata\site-config.ts:36:export const SITE_LOGO_PATH = '/logo/promptbook-logo-blue-transparent-1024.png';
lib\metadata\site-config.ts:85:    'https://github.com/webgptorg/promptbook',
lib\metadata\site-config.ts:86:    'https://linkedin.com/company/promptbook',
lib\metadata\page-registry.ts:1:import { AI_SUPERVIZE_MINI_PAGE_DEFINITION } from '@/businesses/ai-supervize-mini/aiSupervizeMiniMetadata';
lib\metadata\page-registry.ts:2:import { AI_SUPERVIZE_PAGE_DEFINITION } from '@/businesses/ai-supervize/aiSupervizeMetadata';
lib\metadata\page-registry.ts:4:    AI_TA_KRAJTA_BRANDING_PAGE_DEFINITION,
lib\metadata\page-registry.ts:5:    AI_TA_KRAJTA_MEDIA_KIT_PAGE_DEFINITION,
lib\metadata\page-registry.ts:6:    AI_TA_KRAJTA_PAGE_DEFINITION,
lib\metadata\page-registry.ts:36:    AI_SUPERVIZE_PAGE_DEFINITION,
lib\metadata\page-registry.ts:37:    AI_SUPERVIZE_MINI_PAGE_DEFINITION,
lib\metadata\page-registry.ts:41:    AI_TA_KRAJTA_PAGE_DEFINITION,
lib\metadata\page-registry.ts:42:    AI_TA_KRAJTA_MEDIA_KIT_PAGE_DEFINITION,
lib\metadata\page-registry.ts:43:    AI_TA_KRAJTA_BRANDING_PAGE_DEFINITION,
lib\exports\workshopWrapUpPdf.ts:310:    page.context.fillText('promptbook.studio', PDF_PAGE_MARGIN_PIXELS, PDF_PAGE_FOOTER_TOP_PIXELS + 16);
lib\github\githubCommitFeed.test.ts:6:  <id>tag:github.com,2008:/hejny/promptbook/commits/main</id>
lib\github\githubCommitFeed.test.ts:7:  <title>hejny/promptbook:main commits</title>
lib\github\githubCommitFeed.test.ts:10:    <link type="text/html" rel="alternate" href="https://github.com/hejny/promptbook/commit/6dcb09b5b57875f334f61aebed695e2e4193db5e"/>
lib\github\githubCommitFeed.test.ts:20:    <link type="text/html" rel="alternate" href="https://github.com/hejny/promptbook/commit/1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d"/>
lib\legal\cookieConsentAppearance.ts:1:import { AI_TA_KRAJTA_COLORS, AI_TA_KRAJTA_PATH } from '@/businesses/ai-ta-krajta/config';
lib\legal\cookieConsentAppearance.ts:10:    '--cookie-surface': AI_TA_KRAJTA_COLORS.MOSS_DEEP,
lib\legal\cookieConsentAppearance.ts:11:    '--cookie-accent': AI_TA_KRAJTA_COLORS.CORAL,
lib\legal\cookieConsentAppearance.ts:12:    '--cookie-accent-text': AI_TA_KRAJTA_COLORS.MOSS_DEEP,
lib\legal\cookieConsentAppearance.ts:19:    if (isWithinPath(AI_TA_KRAJTA_PATH)) return 'podcast';
lib\github\githubRepository.test.ts:21:const PROMPTBOOK_REPOSITORY = { owner: 'hejny', name: 'promptbook' };
lib\github\githubRepository.test.ts:26:            'hejny/promptbook',
lib\github\githubRepository.test.ts:27:            'https://github.com/hejny/promptbook',
lib\github\githubRepository.test.ts:28:            'https://www.github.com/hejny/promptbook/',
lib\github\githubRepository.test.ts:29:            'https://github.com/hejny/promptbook.git',
lib\github\githubRepository.test.ts:30:            'https://github.com/hejny/promptbook/tree/main/src',
lib\github\githubRepository.test.ts:31:            'git@github.com:hejny/promptbook.git',
lib\github\githubRepository.test.ts:32:            '  https://github.com/hejny/promptbook  ',
lib\github\githubRepository.test.ts:39:        expect(extractGithubRepository('hejny/promptbook.io_2-0')).toEqual({
lib\github\githubRepository.test.ts:41:            name: 'promptbook.io_2-0',
lib\github\githubRepository.test.ts:52:            'hejny/promptbook/issues',
lib\github\githubRepository.test.ts:53:            'https://gitlab.com/hejny/promptbook',
lib\github\githubRepository.test.ts:56:            'https://example.com/github.com/hejny/promptbook',
lib\github\githubRepository.test.ts:64:        expect(formatGithubRepositoryName(PROMPTBOOK_REPOSITORY)).toBe('hejny/promptbook');
lib\github\githubRepository.test.ts:127:        expect(createGithubRepositoryUrl(PROMPTBOOK_REPOSITORY)).toBe('https://github.com/hejny/promptbook');
lib\github\githubRepository.test.ts:129:            'https://github.com/hejny/promptbook/commit/a1b2c3d',
lib\github\githubRepository.test.ts:134:        expect(createGithubCommitsUrl(PROMPTBOOK_REPOSITORY, null)).toBe('https://github.com/hejny/promptbook/commits');
lib\github\githubRepository.test.ts:136:            'https://github.com/hejny/promptbook/commits.atom',
lib\github\githubRepository.test.ts:139:            'https://github.com/hejny/promptbook/commits/feature/rooms.atom',
lib\github\githubRepository.test.ts:142:            'https://github.com/hejny/promptbook/commits/feature/rooms',
lib\github\githubRepository.test.ts:145:            'https://github.com/hejny/promptbook/commits',
lib\github\githubRepository.test.ts:148:            'https://github.com/hejny/promptbook/commits',
lib\events\eventTypes.ts:1:import { AI_SUPERVIZE_MINI_WORKSHOP_REGISTRATION_PLACE_NAME } from '@/businesses/ai-supervize-mini/config';
lib\events\eventTypes.ts:7:import { AI_SUPERVIZE_MINI_PATH } from '@/lib/discounts/discountPlaces';
lib\events\eventTypes.ts:74:        landingPagePath: AI_SUPERVIZE_MINI_PATH,
lib\events\eventTypes.ts:75:        registrationPlaceName: AI_SUPERVIZE_MINI_WORKSHOP_REGISTRATION_PLACE_NAME,
lib\podcast\podcastPlaybackProgressStorage.test.ts:12:const STORAGE_KEY = 'promptbook.test-playback-progress.v1';
lib\github\githubRepository.ts:262: * Writes a repository the way GitHub names it, for example `hejny/promptbook`
app/api/workshops\[workshopSlug]\state\route.ts
app/api/workshops\[workshopSlug]\repository\route.ts
app/api/workshops\[workshopSlug]\reactions\route.ts
app/api/workshops\[workshopSlug]\presence\route.ts
tests\e2e\support\submissions.ts
tests\e2e\public-submissions.spec.ts
tests\e2e\public-pages.spec.ts
tests\e2e\globalTeardown.ts
tests\e2e\cookie-consent.spec.ts
app/api/workshops\[workshopSlug]\feedback\route.ts
app/api/workshops\[workshopSlug]\polls\[pollId]\votes\route.ts
app/api/workshops\[workshopSlug]\polls\[pollId]\votes\route.test.ts
app/api/workshops\[workshopSlug]\connect\route.ts
app/api/workshops\[workshopSlug]\comments\route.ts
app/api/workshops\[workshopSlug]\polls\[pollId]\options\[optionId]\route.ts
app/api/workshops\[workshopSlug]\participant\route.ts
app/api/workshops\[workshopSlug]\comments\[commentId]\upvotes\route.ts
app/api/workshops\[workshopSlug]\comments\[commentId]\route.ts
app/api/workshops\[workshopSlug]\participants\[participantId]\route.ts
app/api/workshops\[workshopSlug]\comments\[commentId]\material\route.ts
app/api/workshops\[workshopSlug]\comments\[commentId]\material\route.test.ts
app/api/workshops\[workshopSlug]\membership\route.ts
app/api/workshops\[workshopSlug]\membership\cancellation\route.ts
app/api/workshops\[workshopSlug]\membership\cancellation\route.test.ts
app/api/workshops\[workshopSlug]\membership\portal\route.ts
app/api/workshops\[workshopSlug]\membership\portal\route.test.ts
app/api/workshops\[workshopSlug]\membership\checkout\route.ts
app/api/workshops\komunita\projects\preview\route.ts
app/api/workshops\komunita\projects\[projectId]\vote\route.ts
app/api/workshops\komunita\projects\[projectId]\route.ts
app/api/workshops\komunita\projects\route.ts
app/api/workshops\[workshopSlug]\membership\checkout\confirmation\route.ts
app/api/workshops\komunita\projects\[projectId]\connect\route.ts
lib/community-projects\communityProjectUrl.ts
lib/community-projects\communityProjectTypes.ts
lib/community-projects\communityProjectService.ts
lib/community-projects\communityProjectService.test.ts
lib/community-projects\communityProjectSchemas.ts
lib/community-projects\communityProjectPreview.ts
lib/community-projects\communityProjectPreview.test.ts
lib/community-projects\communityProjectModeration.ts
lib/community-projects\communityProjectDatabase.ts
lib/community-projects\communityProjectConstants.ts

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command 'Get-Content package.json; Get-Content changelog/_current-preversion.md -TotalCount 45; Get-Content README.md -TotalCount 140' in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command "Get-Content lib/community-projects/communityProjectService.ts; Get-Content -LiteralPath 'app/api/workshops/[workshopSlug]/polls/[pollId]/votes/route.ts'; Get-Content lib/workshops/workshopRequest.ts; Get-Content lib/workshops/workshopRealtime.ts -TotalCount 160" in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command "rg -n 'OpenAI|openai|chat\\.completions|responses\\.create|Llm|LLM|generateText|ANTHROPIC|GEMINI|AI_' lib app/api config README.md .github -g '"'!*.svg'"'; rg --files -g '*jest*' -g '*vitest*' -g 'tsconfig*' -g '*env*' -g '"'!public/**'"'; rg -n 'getWorkshopParticipantSubmissionStatus|export async function|status:' lib/community-projects/communityProjectService.ts lib/workshops/workshopDatabase.ts app/api/workshops/komunita/projects/route.ts" in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 705ms:
app/api\ai-ta-krajta\episodes\search\route.ts:3:    AI_TA_KRAJTA_EPISODE_SEARCH_QUERY_PARAMETER_NAME,
app/api\ai-ta-krajta\episodes\search\route.ts:4:    MAXIMAL_AI_TA_KRAJTA_EPISODE_SEARCH_QUERY_LENGTH,
app/api\ai-ta-krajta\episodes\search\route.ts:12:    const searchQuery = request.nextUrl.searchParams.get(AI_TA_KRAJTA_EPISODE_SEARCH_QUERY_PARAMETER_NAME);
app/api\ai-ta-krajta\episodes\search\route.ts:14:    if (searchQuery === null || searchQuery.length > MAXIMAL_AI_TA_KRAJTA_EPISODE_SEARCH_QUERY_LENGTH) {
app/api\ai-supervize-mini\registration\route.ts:2:    AI_SUPERVIZE_MINI_WORKSHOP_REGISTRATION_PLACE_NAME,
app/api\ai-supervize-mini\registration\route.ts:222:        placeName: AI_SUPERVIZE_MINI_WORKSHOP_REGISTRATION_PLACE_NAME,
lib\metadata\page-registry.ts:1:import { AI_SUPERVIZE_MINI_PAGE_DEFINITION } from '@/businesses/ai-supervize-mini/aiSupervizeMiniMetadata';
lib\metadata\page-registry.ts:2:import { AI_SUPERVIZE_PAGE_DEFINITION } from '@/businesses/ai-supervize/aiSupervizeMetadata';
lib\metadata\page-registry.ts:4:    AI_TA_KRAJTA_BRANDING_PAGE_DEFINITION,
lib\metadata\page-registry.ts:5:    AI_TA_KRAJTA_MEDIA_KIT_PAGE_DEFINITION,
lib\metadata\page-registry.ts:6:    AI_TA_KRAJTA_PAGE_DEFINITION,
lib\metadata\page-registry.ts:36:    AI_SUPERVIZE_PAGE_DEFINITION,
lib\metadata\page-registry.ts:37:    AI_SUPERVIZE_MINI_PAGE_DEFINITION,
lib\metadata\page-registry.ts:41:    AI_TA_KRAJTA_PAGE_DEFINITION,
lib\metadata\page-registry.ts:42:    AI_TA_KRAJTA_MEDIA_KIT_PAGE_DEFINITION,
lib\metadata\page-registry.ts:43:    AI_TA_KRAJTA_BRANDING_PAGE_DEFINITION,
lib\legal\cookieConsentAppearance.ts:1:import { AI_TA_KRAJTA_COLORS, AI_TA_KRAJTA_PATH } from '@/businesses/ai-ta-krajta/config';
lib\legal\cookieConsentAppearance.ts:10:    '--cookie-surface': AI_TA_KRAJTA_COLORS.MOSS_DEEP,
lib\legal\cookieConsentAppearance.ts:11:    '--cookie-accent': AI_TA_KRAJTA_COLORS.CORAL,
lib\legal\cookieConsentAppearance.ts:12:    '--cookie-accent-text': AI_TA_KRAJTA_COLORS.MOSS_DEEP,
lib\legal\cookieConsentAppearance.ts:19:    if (isWithinPath(AI_TA_KRAJTA_PATH)) return 'podcast';
lib\workshops\workshopRegistrations.test.ts:18:const AI_SUPERVIZE_MINI_TERM: WorkshopRegistrationTerm = {
lib\workshops\workshopRegistrations.test.ts:53:                JSON.stringify({ selectedDateId: AI_SUPERVIZE_MINI_TERM.slug, participantCount: 4 }),
lib\workshops\workshopRegistrations.test.ts:55:        ).toEqual({ termId: AI_SUPERVIZE_MINI_TERM.slug, participantCount: 4 });
lib\workshops\workshopRegistrations.test.ts:126:                JSON.stringify({ selectedDateId: AI_SUPERVIZE_MINI_TERM.slug, participantCount: 3 }),
lib\workshops\workshopRegistrations.test.ts:133:        expect(getRegisteredParticipantCount(registeredParticipantCountByTermId, AI_SUPERVIZE_MINI_TERM)).toBe(3);
lib\workshops\workshopRegistrations.test.ts:140:                JSON.stringify({ selectedDateId: AI_SUPERVIZE_MINI_TERM.slug, participantCount: 1 }),
lib\workshops\workshopRegistrations.test.ts:144:        expect(getRegisteredParticipantCount(registeredParticipantCountByTermId, AI_SUPERVIZE_MINI_TERM)).toBe(5);
lib\workshops\workshopRegistrations.test.ts:163:        expect(getWorkshopRegistrationTermIds(AI_SUPERVIZE_MINI_TERM)).toEqual([
lib\workshops\workshopRegistrations.test.ts:164:            AI_SUPERVIZE_MINI_TERM.slug,
lib\workshops\workshopRegistrations.test.ts:169:            getWorkshopRegistrationTermIds({ slug: '2026-09-09', startsAt: AI_SUPERVIZE_MINI_TERM.startsAt }),
lib\events\eventTypes.ts:1:import { AI_SUPERVIZE_MINI_WORKSHOP_REGISTRATION_PLACE_NAME } from '@/businesses/ai-supervize-mini/config';
lib\events\eventTypes.ts:7:import { AI_SUPERVIZE_MINI_PATH } from '@/lib/discounts/discountPlaces';
lib\events\eventTypes.ts:74:        landingPagePath: AI_SUPERVIZE_MINI_PATH,
lib\events\eventTypes.ts:75:        registrationPlaceName: AI_SUPERVIZE_MINI_WORKSHOP_REGISTRATION_PLACE_NAME,
lib\discounts\discountPlaces.ts:16:export const AI_SUPERVIZE_MINI_PATH = '/ai-supervize-mini';
lib\discounts\discountPlaces.ts:19:export const AI_SUPERVIZE_MINI_ONSITE_DISCOUNT_PLACE_ID = 'ai-supervize-mini-onsite';
lib\discounts\discountPlaces.ts:20:export const AI_SUPERVIZE_MINI_ONLINE_DISCOUNT_PLACE_ID = 'ai-supervize-mini-online';
lib\discounts\discountPlaces.ts:25:        id: AI_SUPERVIZE_MINI_ONSITE_DISCOUNT_PLACE_ID,
lib\discounts\discountPlaces.ts:28:        pagePath: AI_SUPERVIZE_MINI_PATH,
lib\discounts\discountPlaces.ts:32:        id: AI_SUPERVIZE_MINI_ONLINE_DISCOUNT_PLACE_ID,
lib\discounts\discountPlaces.ts:35:        pagePath: AI_SUPERVIZE_MINI_PATH,
lib\discounts\discountPlaces.test.ts:2:    AI_SUPERVIZE_MINI_PATH,
lib\discounts\discountPlaces.test.ts:15:            `${AI_SUPERVIZE_MINI_PATH}?code=WEBINAR%202026#registrace`,
vitest.config.ts
tsconfig.tsbuildinfo
tsconfig.json
next-env.d.ts
.env
lib/workshops/workshopDatabase.ts:42:import { getWorkshopParticipantSubmissionStatus } from '@/lib/workshops/workshopSubmissionStatus';
lib/workshops/workshopDatabase.ts:255:    readonly status: 'pending' | 'approved' | 'rejected';
lib/workshops/workshopDatabase.ts:421:    readonly status: WorkshopSubmissionStatus;
lib/workshops/workshopDatabase.ts:489:    return NextResponse.json({ error: WORKSHOP_DATABASE_UNAVAILABLE_MESSAGE }, { status: 503 });
lib/workshops/workshopDatabase.ts:627:export async function loadWorkshopFeedbackSummaries(
lib/workshops/workshopDatabase.ts:706:        status: row.status,
lib/workshops/workshopDatabase.ts:781:export async function loadWorkshopCommentReference(
lib/workshops/workshopDatabase.ts:925:        status: row.status,
lib/workshops/workshopDatabase.ts:1011:export async function saveWorkshopPollVote(
lib/workshops/workshopDatabase.ts:1023:        target_other_option_status: getWorkshopParticipantSubmissionStatus(participant),
lib/workshops/workshopDatabase.ts:1046:export async function createWorkshopReaction(
lib/workshops/workshopDatabase.ts:1076:export async function findWorkshopBySlug(
lib/workshops/workshopDatabase.ts:1105:export async function findUpcomingPublishedWorkshops(
lib/workshops/workshopDatabase.ts:1139:export async function findMostRecentPublishedWorkshop(
lib/workshops/workshopDatabase.ts:1210:export async function findPublishedWorkshops(
lib/workshops/workshopDatabase.ts:1232:export async function findPublishedWorkshopEventCardRows(
lib/workshops/workshopDatabase.ts:1252:export async function findPublishedCommunity(supabase: SupabaseClient): Promise<WorkshopRow | null> {
lib/workshops/workshopDatabase.ts:1275:export async function findWorkshopById(supabase: SupabaseClient, workshopId: string): Promise<WorkshopRow | null> {
lib/workshops/workshopDatabase.ts:1299:export async function copyWorkshopPollAttachments(
lib/workshops/workshopDatabase.ts:1348:export async function loadWorkshopAdminSummaries(
lib/workshops/workshopDatabase.ts:1402:export async function countWatchingWorkshopParticipants(
lib/workshops/workshopDatabase.ts:1615:        isWorkshopPollOptionReadableBy({ status: optionRow.status, authorEmail: optionRow.author_email }, reader),
lib/workshops/workshopDatabase.ts:1743:export async function loadWorkshopPolls(
lib/workshops/workshopDatabase.ts:1785:export async function loadWorkshopAdminPolls(
lib/workshops/workshopDatabase.ts:1815:export async function loadWorkshopAttachedAdminPolls(
lib/workshops/workshopDatabase.ts:1845:export async function loadWorkshopAdminParticipantPage(
lib/workshops/workshopDatabase.ts:1896:export async function loadWorkshopAdminParticipantTimeline(
lib/workshops/workshopDatabase.ts:1984:            status: comment.status,
lib/workshops/workshopDatabase.ts:2064:export async function loadWorkshopAdminAnalytics(
lib/workshops/workshopDatabase.ts:2116:export async function loadWorkshopAdminParticipantsForExport(
lib/workshops/workshopDatabase.ts:2154:export async function loadWorkshopAdminCommentsForExport(
lib/workshops/workshopDatabase.ts:2226:export async function loadWorkshopAdminReactionsForExport(
lib/workshops/workshopDatabase.ts:2288:export async function loadWorkshopAdminContentForExport(
lib/workshops/workshopDatabase.ts:2329:export async function loadWorkshopAdminFeedback(
lib/workshops/workshopDatabase.ts:2429:export async function updatePinnedWorkshopComment(
lib/workshops/workshopDatabase.ts:2455:export async function updateWorkshopStageComment(
lib/workshops/workshopDatabase.ts:2472:export async function loadWorkshopPublicState(
lib/workshops/workshopDatabase.ts:2809:export async function loadWorkshopAdminSnapshot(
lib/community-projects/communityProjectService.ts:13:import { getWorkshopParticipantSubmissionStatus } from '@/lib/workshops/workshopSubmissionStatus';
lib/community-projects/communityProjectService.ts:44:    readonly status: WorkshopSubmissionStatus;
lib/community-projects/communityProjectService.ts:419:export async function createCommunityProjectInTransaction(
lib/community-projects/communityProjectService.ts:428:    const status = getWorkshopParticipantSubmissionStatus({
lib/community-projects/communityProjectService.ts:504:export async function createCommunityProject(
lib/community-projects/communityProjectService.ts:522:export async function connectCommunityProjectDiscussionInTransaction(
lib/community-projects/communityProjectService.ts:596:export async function connectCommunityProjectDiscussion(
lib/community-projects/communityProjectService.ts:619:export async function deleteCommunityParticipantWithProjectVotesInTransaction(
lib/community-projects/communityProjectService.ts:668:export async function deleteCommunityParticipantWithProjectVotes(communityParticipantId: string): Promise<{
lib/community-projects/communityProjectService.ts:690:export async function setCommunityProjectVoteInTransaction(
lib/community-projects/communityProjectService.ts:746:export async function setCommunityProjectVote(
app/api/workshops/komunita/projects/route.ts:29:export async function GET(request: NextRequest) {
app/api/workshops/komunita/projects/route.ts:38:        return NextResponse.json({ error: 'Project limit must be from 1 to 5' }, { status: 400 });
app/api/workshops/komunita/projects/route.ts:48:        return NextResponse.json({ error: 'Community projects could not be loaded' }, { status: 500 });
app/api/workshops/komunita/projects/route.ts:60:export async function POST(request: NextRequest) {
app/api/workshops/komunita/projects/route.ts:74:        return NextResponse.json({ error: 'Doplňte platnou URL, název a popis projektu.' }, { status: 400 });
app/api/workshops/komunita/projects/route.ts:79:        return NextResponse.json({ error: 'URL projektu musí začínat na http:// nebo https://.' }, { status: 400 });
app/api/workshops/komunita/projects/route.ts:90:            { status: 422 },
app/api/workshops/komunita/projects/route.ts:103:        return NextResponse.json({ error: 'Projekt se nepodařilo uložit.' }, { status: 500 });
app/api/workshops/komunita/projects/route.ts:113:        return NextResponse.json({ error: 'Projekt byl uložen, ale nepodařilo se ho načíst.' }, { status: 500 });
app/api/workshops/komunita/projects/route.ts:116:    return NextResponse.json({ project: loadedProject.project }, { status: 201 });

 succeeded in 960ms:
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
        "moment": "^2.30.1",
        "next": "15.2.6",
        "next-themes": "^0.4.6",
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
        "@eslint/eslintrc": "^3",
        "@playwright/test": "^1.62.1",
        "@testing-library/jest-dom": "^6.6.3",
        "@testing-library/react": "^16.3.0",
        "@total-typescript/ts-reset": "^0.6.1",
        "@types/js-yaml": "^4.0.9",
        "@types/lodash": "^4.17.20",
        "@types/node": "^20",
        "@types/pg": "^8.15.5",
        "@types/react": "^19",
        "@types/react-dom": "^19",
        "autoprefixer": "^10.4.21",
        "eslint": "^9",
        "eslint-config-next": "15.2.4",
        "jsdom": "^26.0.0",
        "postcss": "^8.5.3",
        "ptbk": "0.114.0-39",
        "raw-loader": "^4.0.2",
        "tailwindcss": "^3.4.17",
        "tailwindcss-animate": "^1.0.7",
        "tsx": "^4.19.4",
        "typescript": "^5",
        "vitest": "^3.1.1"
    }
}
# Current preversion

- Replaced the centered cookie popup on every page with a shallow desktop strip
  and an inset mobile panel. The banner and its settings now use
  light, workshop, or podcast colors together, with clearer button hierarchy,
  keyboard focus, and scrollable settings on short screens. One shared measurement
  hook keeps the banner, podcast player, coder badge, booking notice, and admin
  table scrollbar clear of each other as they appear or resize; reserved space
  keeps footer links reachable. Existing Czech/English copy, saved choices, and
  the privacy page's cookie settings link remain available across all pages.

- Put the answers members write into a community poll through the very same moderation a chat message goes through. An
  `Other` answer written in `/cs/komunita` or in an attached `/cs/online-workshop/participant?workshop=` is no longer
  public the moment it is written: it waits for a decision, while a trusted member and a moderator have theirs approved
  as they write it, because a chat message, a shared project and now a poll answer are all decided by one shared
  submission policy rather than by a rule each surface wrote for itself. The member who wrote the answer keeps seeing
  it, marked `Čeká na schválení`, and their vote is counted for them straight away, so waiting for a moderator never
  costs anybody their own choice; everybody else receives neither the answer nor its vote until it is approved, which
  keeps a poll's total honest without a second counting rule. A rejected answer leaves the poll for everybody including
  its writer, exactly as a rejected message leaves the chat. Deciding about an answer is offered where the decision
  belongs: a moderator of the room which owns the poll approves or rejects it from the poll itself, by the same quiet
  buttons which moderate a chat message, while a moderator of an occurrence the poll is merely about reads the same
  answers every other member does, because a poll is administered by its community rather than by whichever room it is
  attached to. `/admin/workshops` and `/admin/community` additionally say who wrote each answer, with the name and
  normalized e-mail they connected with and the moment they wrote it, and can reword it, reject it, or remove it
  together with the votes cast for it. A prepared choice of the administration is untouched by all of this: it is still
  edited as part of its question, stays public, and is never attributed to a member. An answer written before this
  change keeps being public, and its writer is recovered from the first vote it ever received, which is the vote the
  writing itself cast.

- Let an administrator write the start of a paid replay on a clock. The stage settings of `/admin/workshops` now ask
  for `Začít záznam od` in its own `Hodiny`, `Minuty` and `Sekundy` boxes instead of in one number of seconds, so the
  moment the workshop itself begins at is written as `0 : 1 : 15` rather than counted out as `75`. Nothing about the
  offset itself changed: it is held, saved, exported and read by `/cs/online-workshop/participant?workshop=` in exactly
  the same seconds as before, the field says underneath which number of seconds it is about to save, and a term which
  was given its offset before this change opens on the very same position of its recording.

- Let the project a term is about run in more than one place. The project settings of `/admin/workshops` now take one
  address of a deployment per line instead of a single address altogether, and
  `/cs/online-workshop/participant?workshop=` opens every one of them beside the repository the workshop follows. A
  project deployed in one place is still simply its `Živá aplikace`, exactly as it was; several deployments are named
  by the addresses they are reached at — `workshop.example/app` beside `staging.workshop.example/app` — because one
  repeated name would say nothing about which of them a participant is opening. The compact card of the term in
  `/cs/komunita` is previewed from the first written address, so a card still costs one request however many places
  the project runs at, and the settings export writes them all on one line. Every deployment belongs to the connected
<p align="center">
  <a href="https://ptbk.io">
    <img src="./public/logo/promptbook-logo-blue-transparent-1024.png" width="160" alt="Promptbook">
  </a>
</p>

<h1 align="center">Promptbook website</h1>

<p align="center">
  The Czech-first web platform behind <a href="https://ptbk.io">Promptbook</a>: landing pages, live AI workshops, a community, and the operations tools that make them run.
</p>

<p align="center">
  <a href="https://github.com/webgptorg/aldaron">Repository</a>
  ·
  <a href="#quick-start">Quick start</a>
  ·
  <a href="#database-and-migrations">Database</a>
  ·
  <a href="#verification">Verification</a>
</p>

## What this repository contains

This is a production Next.js application, not a collection of static marketing pages. It brings together:

- Czech and English Promptbook homepages, plus focused pages for businesses, cities, agriculture, industry, workshops, and individual experts.
- Registration and contact flows, waitlists, discount-code validation, legal pages, analytics, and social metadata.
- Live workshop rooms with a video stage, presence, reactions, moderated chat, polls, materials, feedback, and participant moderation.
- The Czech Promptbook community, including memberships, workshop links, polls, project publishing, project discussion, and voting.
- An authenticated operations area for workshops, community administration, contacts, discount codes, and short links with QR codes and click tracking.

| Area | Main paths |
| --- | --- |
| Homepages | `/` redirects by `Accept-Language`; `/cs` is the Czech source of truth and `/en` is its localized variant. |
| Audience pages | `/pro-mesta`, `/for-agro`, `/for-industry`, `/ai-supervize`, `/ai-supervize-mini`, and related campaign routes. |
| Workshops and community | `/cs/online-workshop`, `/cs/online-workshop/participant`, `/cs/komunita`, and `/cs/komunita/projects`. |
| Operations | `/admin`, `/admin/workshops`, `/admin/community`, `/admin/contacts`, `/admin/discount-codes`, and `/admin/shortener`. |
| Public short links | `/<shortcode>` resolves a managed short link; `/shortener` leads to its administration. |

## Technology

- **Next.js 15** App Router, React, and TypeScript
- **Tailwind CSS** and Radix-based reusable UI components
- **PostgreSQL** migrations and server-side access through `pg`
- **Supabase** clients for data-backed public and administrative workflows
- **Vitest** unit/component tests and **Playwright** end-to-end tests

## Quick start

### Prerequisites

- Node.js 20 or newer (Next.js 15 also supports Node.js 18.18+)
- npm
- A PostgreSQL database and Supabase project when working on data-backed flows

Install the locked dependency set and start the development server:

```bash
npm ci
npm run dev
```

Open [http://localhost:4009](http://localhost:4009). The development command frees port `4009` before starting Next.js, so do not use it for another local service at the same time.

The visual site can be explored without database credentials. Without the relevant configuration, database migrations are skipped in development and database-backed API routes are unavailable.

## Configuration

Create an ignored `.env` file for local server and command-line workflows. Next.js also reads `.env.local`, but the repository's maintenance scripts explicitly load `.env`.

```dotenv
# Required for migrations and production startup
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# Required for browser-facing Supabase access
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY

# Required by server-side workflows that access protected Supabase data
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# Enables the single /admin account (username: admin)
ADMIN_PASSWORD=CHOOSE_A_LONG_RANDOM_VALUE

# Optional convenience switch for preview URLs; it is public, not access control
NEXT_PUBLIC_SKIP_WAITLIST_TOKEN=
```

`NEXT_PUBLIC_` variables are included in the browser bundle. Never place database passwords, service-role keys, or administrator credentials in them. With no `ADMIN_PASSWORD`, the administration remains closed.

## Database and migrations

The application applies pending migrations automatically when a Node.js server starts. You can also run them directly:

```bash
npm run migrate-database
```

The migration runner always processes `migrations/_initialize.sql` first, then the remaining `.sql` files in filename order. Each applied file name and SHA-256 checksum is recorded in `public."Migration"`.

That makes migration files immutable once deployed:

1. Add a new migration for every schema or data change.
2. Never rename, delete, or edit a migration that a database may already have applied.
3. Run `npm run migrate-database` against the intended database before relying on the new schema.

In production, a missing `DATABASE_URL` stops startup rather than serving an outdated schema. In development, migrations are intentionally skipped when that variable is absent so that page work can continue without a database.

### Maintenance commands

| Command | Purpose |
| --- | --- |
| `npm run backup-database` | Writes a timestamped PostgreSQL archive under `backups/`. Requires `pg_dump` on `PATH`. |
| `npm run backup-database:verify` | Verifies a database backup. Requires PostgreSQL client tools on `PATH`. |
| `npm run delete-test-data` | Removes E2E data matching the test email pattern from the configured database. Use only against an intended environment. |

## Verification

| Command | What it checks |
| --- | --- |
| `npm run test` | Vitest unit and component tests. |
| `npm run test-types` | A production build followed by TypeScript checking. The build refreshes Next.js route types before `tsc` runs. |
| `npm run test-e2e` | Playwright public-flow tests on port `4009`. Each public-page route and each public submission is checked independently, every test is given enough time for the development server to compile the route it reaches first, and without a configured Supabase service-role key it uses an isolated in-memory Supabase-compatible store. Recordings of the most recent runs are kept in `tests/e2e/videos/`. |
| `npm run lint` | The configured Next.js lint command. |
| `npm run test-for-ptbk-coder` | The repository's full automated-agent verification sequence. |

For a production-like local run:

```bash
npm run build
npm run start
```

`npm run start` uses Next.js's default port. Pass `-- -p 4009` if you want it to match development.

## Where changes belong

| Need | Location |
| --- | --- |

 succeeded in 1002ms:
import {
    COMMUNITY_PROJECT_DISCUSSION_PARTICIPANT_TABLE_NAME,
    COMMUNITY_PROJECT_TABLE_NAME,
    COMMUNITY_PROJECT_VOTE_TABLE_NAME,
} from '@/lib/community-projects/communityProjectConstants';
import {
    getCommunityProjectDatabaseVote,
    getCommunityProjectVoteFromDatabaseValue,
    type CommunityProjectVote,
} from '@/lib/community-projects/communityProjectTypes';
import { runDatabaseTransaction, type DatabaseTransaction } from '@/lib/database/runDatabaseTransaction';
import { WORKSHOP_PARTICIPANT_TABLE_NAME, WORKSHOP_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import { getWorkshopParticipantSubmissionStatus } from '@/lib/workshops/workshopSubmissionStatus';
import { createWorkshopSessionToken, hashWorkshopSessionToken } from '@/lib/workshops/workshopSession';
import type { WorkshopSubmissionStatus } from '@/lib/workshops/workshopTypes';
import { randomUUID } from 'node:crypto';

const COMMUNITY_PROJECT_OPERATION_NAME = 'change community projects';
const COMMUNITY_ROOM_KIND = 'community';
const PROJECT_ROOM_KIND = 'project';
const PROJECT_DISCUSSION_SLUG_PREFIX = 'community-project-';
const COMMUNITY_PROJECT_TABLE_REFERENCE = `public.${COMMUNITY_PROJECT_TABLE_NAME}`;
const COMMUNITY_PROJECT_VOTE_TABLE_REFERENCE = `public.${COMMUNITY_PROJECT_VOTE_TABLE_NAME}`;
const COMMUNITY_PROJECT_DISCUSSION_PARTICIPANT_TABLE_REFERENCE = `public.${COMMUNITY_PROJECT_DISCUSSION_PARTICIPANT_TABLE_NAME}`;
const WORKSHOP_TABLE_REFERENCE = `public.${WORKSHOP_TABLE_NAME}`;
const WORKSHOP_PARTICIPANT_TABLE_REFERENCE = `public.${WORKSHOP_PARTICIPANT_TABLE_NAME}`;

type CommunityParticipantRow = {
    readonly id: string;
    readonly fullname: string;
    readonly email: string;
    readonly is_interaction_banned: boolean;
    readonly is_trusted: boolean;
    readonly is_moderator: boolean;
};

type CommunityProjectDiscussionRow = {
    readonly discussion_workshop_id: string;
    readonly discussion_workshop_slug: string;
    readonly author_community_participant_id: string;
};

type CommunityProjectVoteCountsRow = {
    readonly status: WorkshopSubmissionStatus;
    readonly upvote_count: number;
    readonly downvote_count: number;
};

type CommunityProjectVoteRow = {
    readonly vote: number;
};

type CommunityProjectVoteForCommunityParticipantDeletionRow = {
    readonly project_id: string;
    readonly vote: number;
    readonly upvote_count: number;
    readonly downvote_count: number;
};

type CommunityProjectDiscussionParticipantMappingRow = {
    readonly discussion_participant_id: string;
};

type DiscussionParticipantRow = {
    readonly id: string;
    readonly is_moderator: boolean;
};

type CommunityProjectMutationErrorKind =
    'not-found' | 'member-invalid' | 'community-participant-missing' | 'discussion-participant-invalid';

type CommunityParticipantLockKind = 'key-share' | 'update';

const COMMUNITY_PARTICIPANT_LOCK_SQL_BY_KIND: Readonly<Record<CommunityParticipantLockKind, string>> = {
    'key-share': 'FOR KEY SHARE OF community_participant',
    update: 'FOR UPDATE OF community_participant',
};

class CommunityProjectMutationError extends Error {
    public constructor(
        public readonly kind: CommunityProjectMutationErrorKind,
        message: string,
    ) {
        super(message);
        this.name = 'CommunityProjectMutationError';
    }
}

export type CommunityProjectCreationValues = {
    readonly communityParticipantId: string;
    readonly url: string;
    readonly title: string;
    readonly description: string;
    readonly previewImageUrl: string | null;
};

export type CommunityProjectDiscussionConnection = {
    readonly discussionWorkshopId: string;
    readonly discussionWorkshopSlug: string;
    readonly discussionParticipantId: string;
};

export type CommunityProjectVoteSaveResult = {
    readonly vote: CommunityProjectVote | null;
    readonly upvoteCount: number;
    readonly downvoteCount: number;
};

type CommunityProjectMutationFailure = {
    readonly errorMessage: string;
    readonly isProjectMissing: boolean;
};

function getMutationErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

function createCommunityProjectMutationFailure(error: unknown): CommunityProjectMutationFailure {
    const isProjectMissing = error instanceof CommunityProjectMutationError && error.kind === 'not-found';

    return {
        errorMessage: getMutationErrorMessage(error),
        isProjectMissing,
    };
}

function createCommunityProjectDiscussionSlug(discussionWorkshopId: string): string {
    return `${PROJECT_DISCUSSION_SLUG_PREFIX}${discussionWorkshopId.replace(/-/g, '')}`;
}

function createInitialDiscussionSessionTokenHash(): string {
    return hashWorkshopSessionToken(createWorkshopSessionToken());
}

function createCurrentTimestamp(): string {
    return new Date().toISOString();
}

function getVoteCountChanges(
    previousVote: CommunityProjectVote | null,
    nextVote: CommunityProjectVote | null,
): { readonly upvoteCountChange: number; readonly downvoteCountChange: number } {
    const upvoteCountChange = Number(nextVote === 'up') - Number(previousVote === 'up');
    const downvoteCountChange = Number(nextVote === 'down') - Number(previousVote === 'down');

    return { upvoteCountChange, downvoteCountChange };
}

async function loadCommunityParticipant(
    transaction: DatabaseTransaction,
    communityParticipantId: string,
    lockKind: CommunityParticipantLockKind = 'key-share',
): Promise<CommunityParticipantRow | null> {
    const { rows } = await transaction.query<CommunityParticipantRow>(
        `
            SELECT
                community_participant.id,
                community_participant.fullname,
                community_participant.email,
                community_participant.is_interaction_banned,
                community_participant.is_trusted,
                community_participant.is_moderator
            FROM ${WORKSHOP_PARTICIPANT_TABLE_REFERENCE} AS community_participant
            INNER JOIN ${WORKSHOP_TABLE_REFERENCE} AS community_room
                ON community_room.id = community_participant.workshop_id
            WHERE community_participant.id = $1
              AND community_room.room_kind = $2
            LIMIT 1
            ${COMMUNITY_PARTICIPANT_LOCK_SQL_BY_KIND[lockKind]};
        `,
        [communityParticipantId, COMMUNITY_ROOM_KIND],
    );

    return rows[0] ?? null;
}

async function requireCommunityParticipant(
    transaction: DatabaseTransaction,
    communityParticipantId: string,
): Promise<CommunityParticipantRow> {
    const communityParticipant = await loadCommunityParticipant(transaction, communityParticipantId);
    if (communityParticipant === null) {
        throw new CommunityProjectMutationError('member-invalid', 'COMMUNITY_PROJECT_MEMBER_INVALID');
    }

    return communityParticipant;
}

async function loadProjectDiscussionForUpdate(
    transaction: DatabaseTransaction,
    projectId: string,
): Promise<CommunityProjectDiscussionRow | null> {
    const { rows } = await transaction.query<CommunityProjectDiscussionRow>(
        `
            SELECT
                community_project.discussion_workshop_id,
                discussion_workshop.slug AS discussion_workshop_slug,
                community_project.author_community_participant_id
            FROM ${COMMUNITY_PROJECT_TABLE_REFERENCE} AS community_project
            INNER JOIN ${WORKSHOP_TABLE_REFERENCE} AS discussion_workshop
                ON discussion_workshop.id = community_project.discussion_workshop_id
            WHERE community_project.id = $1
              AND discussion_workshop.room_kind = $2
              AND discussion_workshop.is_published
              AND community_project.status = $3
            FOR UPDATE OF community_project;
        `,
        [projectId, PROJECT_ROOM_KIND, 'approved'],
    );

    return rows[0] ?? null;
}

async function requireProjectDiscussionForUpdate(
    transaction: DatabaseTransaction,
    projectId: string,
): Promise<CommunityProjectDiscussionRow> {
    const projectDiscussion = await loadProjectDiscussionForUpdate(transaction, projectId);
    if (projectDiscussion === null) {
        throw new CommunityProjectMutationError('not-found', 'COMMUNITY_PROJECT_NOT_FOUND');
    }

    return projectDiscussion;
}

async function loadProjectVoteCountsForUpdate(
    transaction: DatabaseTransaction,
    projectId: string,
): Promise<CommunityProjectVoteCountsRow | null> {
    const { rows } = await transaction.query<CommunityProjectVoteCountsRow>(
        `
            SELECT status, upvote_count, downvote_count
            FROM ${COMMUNITY_PROJECT_TABLE_REFERENCE}
            WHERE id = $1
            FOR UPDATE;
        `,
        [projectId],
    );

    return rows[0] ?? null;
}

async function requireProjectVoteCountsForUpdate(
    transaction: DatabaseTransaction,
    projectId: string,
): Promise<CommunityProjectVoteCountsRow> {
    const projectVoteCounts = await loadProjectVoteCountsForUpdate(transaction, projectId);
    if (projectVoteCounts === null || projectVoteCounts.status !== 'approved') {
        throw new CommunityProjectMutationError('not-found', 'COMMUNITY_PROJECT_NOT_FOUND');
    }

    return projectVoteCounts;
}

async function loadCommunityProjectVote(
    transaction: DatabaseTransaction,
    projectId: string,
    communityParticipantId: string,
): Promise<CommunityProjectVote | null> {
    const { rows } = await transaction.query<CommunityProjectVoteRow>(
        `
            SELECT vote
            FROM ${COMMUNITY_PROJECT_VOTE_TABLE_REFERENCE}
            WHERE project_id = $1
              AND community_participant_id = $2
            LIMIT 1;
        `,
        [projectId, communityParticipantId],
    );

    return getCommunityProjectVoteFromDatabaseValue(rows[0]?.vote ?? null);
}

async function loadCommunityProjectVotesForCommunityParticipantDeletion(
    transaction: DatabaseTransaction,
    communityParticipantId: string,
): Promise<readonly CommunityProjectVoteForCommunityParticipantDeletionRow[]> {
    const { rows } = await transaction.query<CommunityProjectVoteForCommunityParticipantDeletionRow>(
        `
            SELECT
                community_project_vote.project_id,
                community_project_vote.vote,
                community_project.upvote_count,
                community_project.downvote_count
            FROM ${COMMUNITY_PROJECT_VOTE_TABLE_REFERENCE} AS community_project_vote
            INNER JOIN ${COMMUNITY_PROJECT_TABLE_REFERENCE} AS community_project
                ON community_project.id = community_project_vote.project_id
            WHERE community_project_vote.community_participant_id = $1
            ORDER BY community_project_vote.project_id
            FOR UPDATE OF community_project;
        `,
        [communityParticipantId],
    );

    return rows;
}

async function loadDiscussionParticipantMapping(
    transaction: DatabaseTransaction,
    projectId: string,
    communityParticipantId: string,
): Promise<CommunityProjectDiscussionParticipantMappingRow | null> {
    const { rows } = await transaction.query<CommunityProjectDiscussionParticipantMappingRow>(
        `
            SELECT discussion_participant_id
            FROM ${COMMUNITY_PROJECT_DISCUSSION_PARTICIPANT_TABLE_REFERENCE}
            WHERE project_id = $1
              AND community_participant_id = $2
            LIMIT 1;
        `,
        [projectId, communityParticipantId],
    );

    return rows[0] ?? null;
}

async function loadDiscussionParticipant(
    transaction: DatabaseTransaction,
    discussionParticipantId: string,
    discussionWorkshopId: string,
): Promise<DiscussionParticipantRow | null> {
    const { rows } = await transaction.query<DiscussionParticipantRow>(
        `
            SELECT id, is_moderator
            FROM ${WORKSHOP_PARTICIPANT_TABLE_REFERENCE}
            WHERE id = $1
              AND workshop_id = $2
            LIMIT 1
            FOR UPDATE;
        `,
        [discussionParticipantId, discussionWorkshopId],
    );

    return rows[0] ?? null;
}

async function insertDiscussionParticipant(
    transaction: DatabaseTransaction,
    values: {
        readonly discussionParticipantId: string;
        readonly discussionWorkshopId: string;
        readonly fullname: string;
        readonly email: string;
        readonly isModerator: boolean;
        readonly timestamp: string;
    },
): Promise<void> {
    await transaction.query(
        `
            INSERT INTO ${WORKSHOP_PARTICIPANT_TABLE_REFERENCE} (
                id,
                workshop_id,
                fullname,
                email,
                session_token_hash,
                is_moderator,
                connected_at,
                last_seen_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $7);
        `,
        [
            values.discussionParticipantId,
            values.discussionWorkshopId,
            values.fullname,
            values.email,
            createInitialDiscussionSessionTokenHash(),
            values.isModerator,
            values.timestamp,
        ],
    );
}

async function insertDiscussionParticipantMapping(
    transaction: DatabaseTransaction,
    projectId: string,
    communityParticipantId: string,
    discussionParticipantId: string,
    timestamp: string,
): Promise<void> {
    await transaction.query(
        `
            INSERT INTO ${COMMUNITY_PROJECT_DISCUSSION_PARTICIPANT_TABLE_REFERENCE} (
                project_id,
                community_participant_id,
                discussion_participant_id,
                created_at
            )
            VALUES ($1, $2, $3, $4);
        `,
        [projectId, communityParticipantId, discussionParticipantId, timestamp],
    );
}

async function saveCommunityProjectVoteCounts(
    transaction: DatabaseTransaction,
    values: {
        readonly projectId: string;
        readonly upvoteCount: number;
        readonly downvoteCount: number;
        readonly timestamp: string;
    },
): Promise<void> {
    await transaction.query(
        `
            UPDATE ${COMMUNITY_PROJECT_TABLE_REFERENCE}
            SET upvote_count = $2,
                downvote_count = $3,
                updated_at = $4
            WHERE id = $1;
        `,
        [values.projectId, values.upvoteCount, values.downvoteCount, values.timestamp],
    );
}

/**
 * Creates a card, its private project room, and the author's moderator identity as one backend transaction.
 */
export async function createCommunityProjectInTransaction(
    transaction: DatabaseTransaction,
    values: CommunityProjectCreationValues,
): Promise<string> {
    const communityParticipant = await requireCommunityParticipant(transaction, values.communityParticipantId);
    const projectId = randomUUID();
    const discussionWorkshopId = randomUUID();
    const discussionWorkshopSlug = createCommunityProjectDiscussionSlug(discussionWorkshopId);
    const discussionParticipantId = randomUUID();
    const status = getWorkshopParticipantSubmissionStatus({
        isInteractionBanned: communityParticipant.is_interaction_banned,
        isTrusted: communityParticipant.is_trusted,
        isModerator: communityParticipant.is_moderator,
    });
    const timestamp = createCurrentTimestamp();

    await transaction.query(
        `
            INSERT INTO ${WORKSHOP_TABLE_REFERENCE} (
                id,
                slug,
                room_kind,
                title,
                description,
                starts_at,
                ends_at,
                is_published,
                created_at,
                updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, NULL, true, $6, $6);
        `,
        [discussionWorkshopId, discussionWorkshopSlug, PROJECT_ROOM_KIND, values.title, values.description, timestamp],
    );

    await transaction.query(
        `
            INSERT INTO ${COMMUNITY_PROJECT_TABLE_REFERENCE} (
                id,
                author_community_participant_id,
                discussion_workshop_id,
                url,
                title,
                description,
                preview_image_url,
                status,
                upvote_count,
                downvote_count,
                created_at,
                updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, 0, $9, $9);
        `,
        [
            projectId,
            values.communityParticipantId,
            discussionWorkshopId,
            values.url,
            values.title,
            values.description,
            values.previewImageUrl,
            status,
            timestamp,
        ],
    );

    await insertDiscussionParticipant(transaction, {
        discussionParticipantId,
        discussionWorkshopId,
        fullname: communityParticipant.fullname,
        email: communityParticipant.email,
        isModerator: true,
        timestamp,
    });
    await insertDiscussionParticipantMapping(
        transaction,
        projectId,
        values.communityParticipantId,
        discussionParticipantId,
        timestamp,
    );

    return projectId;
}

export async function createCommunityProject(
    values: CommunityProjectCreationValues,
): Promise<{ readonly projectId: string | null; readonly errorMessage: string | null }> {
    try {
        const projectId = await runDatabaseTransaction(COMMUNITY_PROJECT_OPERATION_NAME, (transaction) =>
            createCommunityProjectInTransaction(transaction, values),
        );

        return { projectId, errorMessage: null };
    } catch (error) {
        return { projectId: null, errorMessage: getMutationErrorMessage(error) };
    }
}

/**
 * Reuses the member's community identity in one project room. Locking the project row serializes mapping creation, so
 * two browser tabs cannot create two discussion participants for the same member.
 */
export async function connectCommunityProjectDiscussionInTransaction(
    transaction: DatabaseTransaction,
    projectId: string,
    communityParticipantId: string,
): Promise<CommunityProjectDiscussionConnection> {
    const communityParticipant = await requireCommunityParticipant(transaction, communityParticipantId);
    const projectDiscussion = await requireProjectDiscussionForUpdate(transaction, projectId);
    const isProjectAuthor = projectDiscussion.author_community_participant_id === communityParticipantId;
    const existingMapping = await loadDiscussionParticipantMapping(transaction, projectId, communityParticipantId);

    if (existingMapping !== null) {
        const existingDiscussionParticipant = await loadDiscussionParticipant(
            transaction,
            existingMapping.discussion_participant_id,
            projectDiscussion.discussion_workshop_id,
        );
        if (existingDiscussionParticipant === null) {
            throw new CommunityProjectMutationError(
                'discussion-participant-invalid',
                'COMMUNITY_PROJECT_DISCUSSION_PARTICIPANT_INVALID',
            );
        }

        const isModerator = existingDiscussionParticipant.is_moderator || isProjectAuthor;
        await transaction.query(
            `
                UPDATE ${WORKSHOP_PARTICIPANT_TABLE_REFERENCE}
                SET fullname = $2,
                    email = $3,
                    is_moderator = $4
                WHERE id = $1
                  AND workshop_id = $5;
            `,
            [
                existingDiscussionParticipant.id,
                communityParticipant.fullname,
                communityParticipant.email,
                isModerator,
                projectDiscussion.discussion_workshop_id,
            ],
        );

        return {
            discussionWorkshopId: projectDiscussion.discussion_workshop_id,
            discussionWorkshopSlug: projectDiscussion.discussion_workshop_slug,
            discussionParticipantId: existingDiscussionParticipant.id,
        };
    }

    const discussionParticipantId = randomUUID();
    const timestamp = createCurrentTimestamp();
    await insertDiscussionParticipant(transaction, {
        discussionParticipantId,
        discussionWorkshopId: projectDiscussion.discussion_workshop_id,
        fullname: communityParticipant.fullname,
        email: communityParticipant.email,
        isModerator: isProjectAuthor,
        timestamp,
    });
    await insertDiscussionParticipantMapping(
        transaction,
        projectId,
        communityParticipantId,
        discussionParticipantId,
        timestamp,
    );

    return {
        discussionWorkshopId: projectDiscussion.discussion_workshop_id,
        discussionWorkshopSlug: projectDiscussion.discussion_workshop_slug,
        discussionParticipantId,
    };
}

export async function connectCommunityProjectDiscussion(
    projectId: string,
    communityParticipantId: string,
): Promise<{
    readonly connection: CommunityProjectDiscussionConnection | null;
    readonly errorMessage: string | null;
    readonly isProjectMissing: boolean;
}> {
    try {
        const connection = await runDatabaseTransaction(COMMUNITY_PROJECT_OPERATION_NAME, (transaction) =>
            connectCommunityProjectDiscussionInTransaction(transaction, projectId, communityParticipantId),
        );

        return { connection, errorMessage: null, isProjectMissing: false };
    } catch (error) {
        return { connection: null, ...createCommunityProjectMutationFailure(error) };
    }
}

/**
 * Removes a community member's votes before deleting their identity. The member row is locked first, which makes
 * ongoing and future vote transactions finish or stop before their cached totals can be changed.
 */
export async function deleteCommunityParticipantWithProjectVotesInTransaction(
    transaction: DatabaseTransaction,
    communityParticipantId: string,
): Promise<string> {
    const communityParticipant = await loadCommunityParticipant(transaction, communityParticipantId, 'update');
    if (communityParticipant === null) {
        throw new CommunityProjectMutationError('community-participant-missing', 'COMMUNITY_PROJECT_MEMBER_NOT_FOUND');
    }

    const projectVotes = await loadCommunityProjectVotesForCommunityParticipantDeletion(
        transaction,
        communityParticipantId,
    );
    await transaction.query(
        `
            DELETE FROM ${COMMUNITY_PROJECT_VOTE_TABLE_REFERENCE}
            WHERE community_participant_id = $1;
        `,
        [communityParticipantId],
    );

    const timestamp = createCurrentTimestamp();
    for (const projectVote of projectVotes) {
        const previousVote = getCommunityProjectVoteFromDatabaseValue(projectVote.vote);
        const { upvoteCountChange, downvoteCountChange } = getVoteCountChanges(previousVote, null);
        await saveCommunityProjectVoteCounts(transaction, {
            projectId: projectVote.project_id,
            upvoteCount: Math.max(0, projectVote.upvote_count + upvoteCountChange),
            downvoteCount: Math.max(0, projectVote.downvote_count + downvoteCountChange),
            timestamp,
        });
    }

    const { rows } = await transaction.query<{ readonly id: string }>(
        `
            DELETE FROM ${WORKSHOP_PARTICIPANT_TABLE_REFERENCE}
            WHERE id = $1
            RETURNING id;
        `,
        [communityParticipantId],
    );
    const deletedParticipant = rows[0];
    if (deletedParticipant === undefined) {
        throw new CommunityProjectMutationError('community-participant-missing', 'COMMUNITY_PROJECT_MEMBER_NOT_FOUND');
    }

    return deletedParticipant.id;
}

export async function deleteCommunityParticipantWithProjectVotes(communityParticipantId: string): Promise<{
    readonly participantId: string | null;
    readonly errorMessage: string | null;
    readonly isParticipantMissing: boolean;
}> {
    try {
        const participantId = await runDatabaseTransaction(COMMUNITY_PROJECT_OPERATION_NAME, (transaction) =>
            deleteCommunityParticipantWithProjectVotesInTransaction(transaction, communityParticipantId),
        );

        return { participantId, errorMessage: null, isParticipantMissing: false };}

/**
 * Applies one Reddit-style vote transition and its cached card totals under the same row lock. The counts remain fast
 * to sort by without needing a trigger to interpret inserts, updates, and deletes.
 */
export async function setCommunityProjectVoteInTransaction(
    transaction: DatabaseTransaction,
    projectId: string,
    communityParticipantId: string,
    vote: CommunityProjectVote,
): Promise<CommunityProjectVoteSaveResult> {
    await requireCommunityParticipant(transaction, communityParticipantId);
    const currentVoteCounts = await requireProjectVoteCountsForUpdate(transaction, projectId);
    const previousVote = await loadCommunityProjectVote(transaction, projectId, communityParticipantId);
    const timestamp = createCurrentTimestamp();
    const selectedVote = previousVote === vote ? null : vote;

    if (previousVote === null) {
        await transaction.query(
            `
                INSERT INTO ${COMMUNITY_PROJECT_VOTE_TABLE_REFERENCE} (
                    project_id,
                    community_participant_id,
                    vote,
                    created_at,
                    updated_at
                )
                VALUES ($1, $2, $3, $4, $4);
            `,
            [projectId, communityParticipantId, getCommunityProjectDatabaseVote(vote), timestamp],
        );
    } else if (selectedVote === null) {
        await transaction.query(
            `
                DELETE FROM ${COMMUNITY_PROJECT_VOTE_TABLE_REFERENCE}
                WHERE project_id = $1
                  AND community_participant_id = $2;
            `,
            [projectId, communityParticipantId],
        );
    } else {
        await transaction.query(
            `
                UPDATE ${COMMUNITY_PROJECT_VOTE_TABLE_REFERENCE}
                SET vote = $3,
                    updated_at = $4
                WHERE project_id = $1
                  AND community_participant_id = $2;
            `,
            [projectId, communityParticipantId, getCommunityProjectDatabaseVote(selectedVote), timestamp],
        );
    }

    const { upvoteCountChange, downvoteCountChange } = getVoteCountChanges(previousVote, selectedVote);
    const upvoteCount = Math.max(0, currentVoteCounts.upvote_count + upvoteCountChange);
    const downvoteCount = Math.max(0, currentVoteCounts.downvote_count + downvoteCountChange);
    await saveCommunityProjectVoteCounts(transaction, { projectId, upvoteCount, downvoteCount, timestamp });

    return { vote: selectedVote, upvoteCount, downvoteCount };
}

export async function setCommunityProjectVote(
    projectId: string,
    communityParticipantId: string,
    vote: CommunityProjectVote,
): Promise<{
    readonly result: CommunityProjectVoteSaveResult | null;
    readonly errorMessage: string | null;
    readonly isProjectMissing: boolean;
}> {
    try {
        const result = await runDatabaseTransaction(COMMUNITY_PROJECT_OPERATION_NAME, (transaction) =>
            setCommunityProjectVoteInTransaction(transaction, projectId, communityParticipantId, vote),
        );

        return { result, errorMessage: null, isProjectMissing: false };
    } catch (error) {
        return { result: null, ...createCommunityProjectMutationFailure(error) };
    }
}
import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import {
    loadWorkshopPolls,
    saveWorkshopPollVote,
} from '@/lib/workshops/workshopDatabase';
import { isWorkshopPollVisibleInRoom } from '@/lib/workshops/workshopKindCapabilities';
import { getWorkshopInteractionBanResponseOrNull } from '@/lib/workshops/workshopParticipantInteraction';
import { broadcastWorkshopEvent } from '@/lib/workshops/workshopRealtime';
import { getAuthenticatedWorkshopRequest, isAuthenticatedWorkshopRequest } from '@/lib/workshops/workshopRequest';
import { workshopPollVoteSchema } from '@/lib/workshops/workshopSchemas';
import { NextRequest, NextResponse } from 'next/server';

type WorkshopPollVoteRouteContext = {
    readonly params: Promise<{ readonly workshopSlug: string; readonly pollId: string }>;
};

/**
 * Records one member's choice in a community poll from either its owner room or an occurrence it is attached to. The
 * database makes the normalized e-mail the one voter identity, so changing an option in either room changes the one
 * shared choice rather than adding another secret vote.
 */
export async function POST(request: NextRequest, context: WorkshopPollVoteRouteContext) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse) {
        return crossSiteResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopPollVoteSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json({ error: 'Invalid poll vote' }, { status: 400 });
    }

    const { workshopSlug, pollId } = await context.params;
    const authenticatedRequest = await getAuthenticatedWorkshopRequest(request, workshopSlug);
    if (!isAuthenticatedWorkshopRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }
    if (!isWorkshopPollVisibleInRoom(authenticatedRequest.workshopRow.room_kind)) {
        return NextResponse.json({ error: 'Polls are not available in this room' }, { status: 404 });
    }

    const interactionBanResponse = getWorkshopInteractionBanResponseOrNull(authenticatedRequest.participant);
    if (interactionBanResponse) {
        return interactionBanResponse;
    }

    const voteResult = await saveWorkshopPollVote(
        authenticatedRequest.supabase,
        authenticatedRequest.workshopRow,
        authenticatedRequest.participant,
        pollId,
        parsedResult.data,
    );
    if (!voteResult.isSuccessful) {
        if (voteResult.errorKind === 'not-found') {
            return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
        }
        if (voteResult.errorKind === 'closed') {
            return NextResponse.json({ error: 'Poll has already ended' }, { status: 409 });
        }
        if (voteResult.errorKind === 'invalid-vote') {
            return NextResponse.json({ error: 'This poll does not accept another option' }, { status: 409 });
        }

        console.error('Failed to save a workshop poll vote:', voteResult.errorMessage);
        return NextResponse.json({ error: 'Poll vote could not be saved' }, { status: 500 });
    }

    const { polls, errorMessage } = await loadWorkshopPolls(
        authenticatedRequest.supabase,
        authenticatedRequest.workshopRow,
        authenticatedRequest.participant,
    );
    if (errorMessage !== null) {
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
    const updatedPoll = polls.find((currentPoll) => currentPoll.id === pollId);
    if (updatedPoll === undefined) {
        return NextResponse.json({ error: 'Poll could not be loaded' }, { status: 500 });
    }

    await broadcastWorkshopEvent(authenticatedRequest.supabase, authenticatedRequest.workshopRow, {
        kind: 'state-changed',
    });
    return NextResponse.json({ poll: updatedPoll }, { headers: { 'Cache-Control': 'no-store' } });
}
import {
    createWorkshopDatabaseUnavailableResponse,
    findWorkshopBySlug,
    getWorkshopDatabaseOrNull,
    type WorkshopRow,
} from '@/lib/workshops/workshopDatabase';
import { isWorkshopParticipantModerating } from '@/lib/workshops/workshopModeration';
import { authenticateWorkshopParticipant } from '@/lib/workshops/workshopSession';
import type { WorkshopParticipant } from '@/lib/workshops/workshopTypes';
import type { SupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export type AuthenticatedWorkshopRequest = {
    readonly supabase: SupabaseClient;
    readonly workshopRow: WorkshopRow;
    readonly participant: WorkshopParticipant;
};

export async function getAuthenticatedWorkshopRequest(
    request: NextRequest,
    workshopSlug: string,
): Promise<AuthenticatedWorkshopRequest | NextResponse> {
    const supabase = getWorkshopDatabaseOrNull();
    if (supabase === null) {
        return createWorkshopDatabaseUnavailableResponse();
    }

    const workshopRow = await findWorkshopBySlug(supabase, workshopSlug, true);
    if (workshopRow === null) {
        return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }

    const participant = await authenticateWorkshopParticipant(supabase, request, workshopRow.id, workshopRow.slug);
    if (participant === null) {
        return NextResponse.json({ error: 'Workshop connection required' }, { status: 401 });
    }

    return { supabase, workshopRow, participant };
}

/**
 * The very same request, but only from somebody who moderates this room
 *
 * Note: Moderating is refused for everybody else, so the room never has to hide a moderation route to keep it closed.
 */
export async function getModeratingWorkshopRequest(
    request: NextRequest,
    workshopSlug: string,
): Promise<AuthenticatedWorkshopRequest | NextResponse> {
    const authenticatedRequest = await getAuthenticatedWorkshopRequest(request, workshopSlug);
    if (!isAuthenticatedWorkshopRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }

    return isWorkshopParticipantModerating(authenticatedRequest.participant)
        ? authenticatedRequest
        : NextResponse.json({ error: 'Moderování této místnosti není pro tento účet dostupné.' }, { status: 403 });
}

export function isAuthenticatedWorkshopRequest(
    value: AuthenticatedWorkshopRequest | NextResponse,
): value is AuthenticatedWorkshopRequest {
    return !(value instanceof NextResponse);
}
import { getWorkshopRealtimeTopic, WORKSHOP_REALTIME_EVENT_NAME } from '@/lib/workshops/workshopConstants';
import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import type { WorkshopKind, WorkshopRealtimeEvent } from '@/lib/workshops/workshopTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * As much of a room as a broadcast needs: the topic it belongs to and whether anybody in it listens at all
 */
type BroadcastingWorkshopRoom = {
    readonly room_kind: WorkshopKind;
    readonly slug: string;
};

/**
 * Send a private, server-authored event. Persistence remains the source of truth;
 * a failed broadcast is harmless because clients periodically refresh as a fallback.
 *
 * Note: A room which does not update itself live opens no channel, so nothing is sent to it. That keeps a write in a
 *       calm room from waiting for a broadcast which nobody would receive.
 */
export async function broadcastWorkshopEvent(
    supabase: SupabaseClient,
    workshopRoom: BroadcastingWorkshopRoom,
    event: WorkshopRealtimeEvent,
): Promise<void> {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey || !getWorkshopKindCapabilities(workshopRoom.room_kind).isRealtime) {
        return;
    }

    const channel = supabase.channel(getWorkshopRealtimeTopic(workshopRoom.slug), { config: { private: true } });

    try {
        await supabase.realtime.setAuth(serviceRoleKey);
        await channel.httpSend(WORKSHOP_REALTIME_EVENT_NAME, event);
    } catch (error) {
        console.error('Failed to broadcast a workshop change:', error);
    } finally {
        await supabase.removeChannel(channel);
    }
}

codex
The three submission types already share a trust policy: ordinary members’ posts wait for moderation, trusted members and moderators get immediate approval, and silenced members are rejected. I found no existing AI reviewer. I’m checking where to add one so uncertain results stay pending and AI cannot override a moderator’s decision.

exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command "rg -n 'getWorkshopParticipantSubmissionStatus|createCommunityProject|saveWorkshopPollVote' lib/community-projects/communityProjectService.ts lib/workshops/workshopDatabase.ts app/api/workshops/komunita/projects/route.ts; rg -n -i '\\b(openai|anthropic|gemini|llm|ai_url|agent_url|chat\\.completions)\\b' lib app/api config; Get-Content vitest.config.ts; Get-Content lib/workshops/workshopParticipantInteraction.ts; Get-Content lib/community-projects/communityProjectSchemas.ts" in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command "Get-Content -LiteralPath 'app/api/workshops/komunita/projects/route.ts'; Get-Content lib/community-projects/communityProjectService.ts | Select-Object -First 190; Get-Content lib/community-projects/communityProjectService.ts | Select-Object -Skip 540 -First 105" in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
exec
"C:\\Program Files\\PowerShell\\7\\pwsh.exe" -Command "rg -n 'poll.*(select|COLUMNS)|WORKSHOP_POLL_OPTION_COLUMNS|saveWorkshopPollVote' lib/workshops/workshopDatabase.ts; Get-Content lib/workshops/workshopPollSharing.test.ts | Select-Object -Skip 150 -First 180; rg -n 'getWorkshopParticipantSubmissionStatus|schvál|moder' businesses/online-workshop/participant/WorkshopChat* businesses/community/projects/CommunityProject*; Get-Content C:/Users/me/.codex/skills/.system/openai-docs/SKILL.md -TotalCount 230" in C:\Users\me\work\promptbook-experiments-and-landing-pages\aldaron
 succeeded in 900ms:
import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import {
    loadCommunityProjectById,
    loadCommunityProjects,
} from '@/lib/community-projects/communityProjectDatabase';
import { createCommunityProject } from '@/lib/community-projects/communityProjectService';
import {
    isAuthenticatedCommunityRequest,
    getAuthenticatedCommunityRequest,
} from '@/lib/community/communityRequest';
import { scrapeCommunityProjectPreview } from '@/lib/community-projects/communityProjectPreview';
import { normalizeCommunityProjectUrl } from '@/lib/community-projects/communityProjectUrl';
import { isWorkshopParticipantModerating } from '@/lib/workshops/workshopModeration';
import { communityProjectCreateSchema } from '@/lib/community-projects/communityProjectSchemas';
import { NextRequest, NextResponse } from 'next/server';

const MAXIMAL_COMMUNITY_PROJECT_HOME_COUNT = 5;

function readProjectLimit(value: string | null): number | null {
    if (value === null) {
        return null;
    }

    const limit = Number(value);
    return Number.isSafeInteger(limit) && limit >= 1 && limit <= MAXIMAL_COMMUNITY_PROJECT_HOME_COUNT ? limit : null;
}

export async function GET(request: NextRequest) {
    const authenticatedRequest = await getAuthenticatedCommunityRequest(request);
    if (!isAuthenticatedCommunityRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }

    const requestedLimit = request.nextUrl.searchParams.get('limit');
    const limit = readProjectLimit(requestedLimit);
    if (requestedLimit !== null && limit === null) {
        return NextResponse.json({ error: 'Project limit must be from 1 to 5' }, { status: 400 });
    }

    const { projects, errorMessage } = await loadCommunityProjects(
        authenticatedRequest.supabase,
        authenticatedRequest.participant,
        limit,
    );
    if (projects === null) {
        console.error('Failed to load community projects:', errorMessage);
        return NextResponse.json({ error: 'Community projects could not be loaded' }, { status: 500 });
    }

    return NextResponse.json(
        {
            projects,
            isModerationOffered: isWorkshopParticipantModerating(authenticatedRequest.participant),
        },
        { headers: { 'Cache-Control': 'no-store' } },
    );
}

export async function POST(request: NextRequest) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse) {
        return crossSiteResponse;
    }

    const authenticatedRequest = await getAuthenticatedCommunityRequest(request);
    if (!isAuthenticatedCommunityRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = communityProjectCreateSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json({ error: 'Doplňte platnou URL, název a popis projektu.' }, { status: 400 });
    }

    const normalizedUrl = normalizeCommunityProjectUrl(parsedResult.data.url);
    if (normalizedUrl === null) {
        return NextResponse.json({ error: 'URL projektu musí začínat na http:// nebo https://.' }, { status: 400 });
    }

    let preview;
    try {
        // The image is freshly scraped once more at save time. A forged request can therefore change only the title
        // and description which the wizard explicitly lets a member edit, never point a card at an arbitrary image.
        preview = await scrapeCommunityProjectPreview(normalizedUrl);
    } catch {
        return NextResponse.json(
            { error: 'Náhled projektu se nepodařilo načíst. Zkontrolujte, že je stránka veřejně dostupná.' },
            { status: 422 },
        );
    }

    const createdProject = await createCommunityProject({
        communityParticipantId: authenticatedRequest.participant.id,
        url: preview.url,
        title: parsedResult.data.title,
        description: parsedResult.data.description,
        previewImageUrl: preview.previewImageUrl,
    });
    if (createdProject.projectId === null) {
        console.error('Failed to create community project:', createdProject.errorMessage);
        return NextResponse.json({ error: 'Projekt se nepodařilo uložit.' }, { status: 500 });
    }

    const loadedProject = await loadCommunityProjectById(
        authenticatedRequest.supabase,
        createdProject.projectId,
        authenticatedRequest.participant,
    );
    if (loadedProject.project === null) {
        console.error('Failed to load created community project:', loadedProject.errorMessage);
        return NextResponse.json({ error: 'Projekt byl uložen, ale nepodařilo se ho načíst.' }, { status: 500 });
    }

    return NextResponse.json({ project: loadedProject.project }, { status: 201 });
}
import {
    COMMUNITY_PROJECT_DISCUSSION_PARTICIPANT_TABLE_NAME,
    COMMUNITY_PROJECT_TABLE_NAME,
    COMMUNITY_PROJECT_VOTE_TABLE_NAME,
} from '@/lib/community-projects/communityProjectConstants';
import {
    getCommunityProjectDatabaseVote,
    getCommunityProjectVoteFromDatabaseValue,
    type CommunityProjectVote,
} from '@/lib/community-projects/communityProjectTypes';
import { runDatabaseTransaction, type DatabaseTransaction } from '@/lib/database/runDatabaseTransaction';
import { WORKSHOP_PARTICIPANT_TABLE_NAME, WORKSHOP_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import { getWorkshopParticipantSubmissionStatus } from '@/lib/workshops/workshopSubmissionStatus';
import { createWorkshopSessionToken, hashWorkshopSessionToken } from '@/lib/workshops/workshopSession';
import type { WorkshopSubmissionStatus } from '@/lib/workshops/workshopTypes';
import { randomUUID } from 'node:crypto';

const COMMUNITY_PROJECT_OPERATION_NAME = 'change community projects';
const COMMUNITY_ROOM_KIND = 'community';
const PROJECT_ROOM_KIND = 'project';
const PROJECT_DISCUSSION_SLUG_PREFIX = 'community-project-';
const COMMUNITY_PROJECT_TABLE_REFERENCE = `public.${COMMUNITY_PROJECT_TABLE_NAME}`;
const COMMUNITY_PROJECT_VOTE_TABLE_REFERENCE = `public.${COMMUNITY_PROJECT_VOTE_TABLE_NAME}`;
const COMMUNITY_PROJECT_DISCUSSION_PARTICIPANT_TABLE_REFERENCE = `public.${COMMUNITY_PROJECT_DISCUSSION_PARTICIPANT_TABLE_NAME}`;
const WORKSHOP_TABLE_REFERENCE = `public.${WORKSHOP_TABLE_NAME}`;
const WORKSHOP_PARTICIPANT_TABLE_REFERENCE = `public.${WORKSHOP_PARTICIPANT_TABLE_NAME}`;

type CommunityParticipantRow = {
    readonly id: string;
    readonly fullname: string;
    readonly email: string;
    readonly is_interaction_banned: boolean;
    readonly is_trusted: boolean;
    readonly is_moderator: boolean;
};

type CommunityProjectDiscussionRow = {
    readonly discussion_workshop_id: string;
    readonly discussion_workshop_slug: string;
    readonly author_community_participant_id: string;
};

type CommunityProjectVoteCountsRow = {
    readonly status: WorkshopSubmissionStatus;
    readonly upvote_count: number;
    readonly downvote_count: number;
};

type CommunityProjectVoteRow = {
    readonly vote: number;
};

type CommunityProjectVoteForCommunityParticipantDeletionRow = {
    readonly project_id: string;
    readonly vote: number;
    readonly upvote_count: number;
    readonly downvote_count: number;
};

type CommunityProjectDiscussionParticipantMappingRow = {
    readonly discussion_participant_id: string;
};

type DiscussionParticipantRow = {
    readonly id: string;
    readonly is_moderator: boolean;
};

type CommunityProjectMutationErrorKind =
    'not-found' | 'member-invalid' | 'community-participant-missing' | 'discussion-participant-invalid';

type CommunityParticipantLockKind = 'key-share' | 'update';

const COMMUNITY_PARTICIPANT_LOCK_SQL_BY_KIND: Readonly<Record<CommunityParticipantLockKind, string>> = {
    'key-share': 'FOR KEY SHARE OF community_participant',
    update: 'FOR UPDATE OF community_participant',
};

class CommunityProjectMutationError extends Error {
    public constructor(
        public readonly kind: CommunityProjectMutationErrorKind,
        message: string,
    ) {
        super(message);
        this.name = 'CommunityProjectMutationError';
    }
}

export type CommunityProjectCreationValues = {
    readonly communityParticipantId: string;
    readonly url: string;
    readonly title: string;
    readonly description: string;
    readonly previewImageUrl: string | null;
};

export type CommunityProjectDiscussionConnection = {
    readonly discussionWorkshopId: string;
    readonly discussionWorkshopSlug: string;
    readonly discussionParticipantId: string;
};

export type CommunityProjectVoteSaveResult = {
    readonly vote: CommunityProjectVote | null;
    readonly upvoteCount: number;
    readonly downvoteCount: number;
};

type CommunityProjectMutationFailure = {
    readonly errorMessage: string;
    readonly isProjectMissing: boolean;
};

function getMutationErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

function createCommunityProjectMutationFailure(error: unknown): CommunityProjectMutationFailure {
    const isProjectMissing = error instanceof CommunityProjectMutationError && error.kind === 'not-found';

    return {
        errorMessage: getMutationErrorMessage(error),
        isProjectMissing,
    };
}

function createCommunityProjectDiscussionSlug(discussionWorkshopId: string): string {
    return `${PROJECT_DISCUSSION_SLUG_PREFIX}${discussionWorkshopId.replace(/-/g, '')}`;
}

function createInitialDiscussionSessionTokenHash(): string {
    return hashWorkshopSessionToken(createWorkshopSessionToken());
}

function createCurrentTimestamp(): string {
    return new Date().toISOString();
}

function getVoteCountChanges(
    previousVote: CommunityProjectVote | null,
    nextVote: CommunityProjectVote | null,
): { readonly upvoteCountChange: number; readonly downvoteCountChange: number } {
    const upvoteCountChange = Number(nextVote === 'up') - Number(previousVote === 'up');
    const downvoteCountChange = Number(nextVote === 'down') - Number(previousVote === 'down');

    return { upvoteCountChange, downvoteCountChange };
}

async function loadCommunityParticipant(
    transaction: DatabaseTransaction,
    communityParticipantId: string,
    lockKind: CommunityParticipantLockKind = 'key-share',
): Promise<CommunityParticipantRow | null> {
    const { rows } = await transaction.query<CommunityParticipantRow>(
        `
            SELECT
                community_participant.id,
                community_participant.fullname,
                community_participant.email,
                community_participant.is_interaction_banned,
                community_participant.is_trusted,
                community_participant.is_moderator
            FROM ${WORKSHOP_PARTICIPANT_TABLE_REFERENCE} AS community_participant
            INNER JOIN ${WORKSHOP_TABLE_REFERENCE} AS community_room
                ON community_room.id = community_participant.workshop_id
            WHERE community_participant.id = $1
              AND community_room.room_kind = $2
            LIMIT 1
            ${COMMUNITY_PARTICIPANT_LOCK_SQL_BY_KIND[lockKind]};
        `,
        [communityParticipantId, COMMUNITY_ROOM_KIND],
    );

    return rows[0] ?? null;
}

async function requireCommunityParticipant(
    transaction: DatabaseTransaction,
    communityParticipantId: string,
): Promise<CommunityParticipantRow> {
    const communityParticipant = await loadCommunityParticipant(transaction, communityParticipantId);
    if (communityParticipant === null) {
        throw new CommunityProjectMutationError('member-invalid', 'COMMUNITY_PROJECT_MEMBER_INVALID');
    }

    return communityParticipant;
}

async function loadProjectDiscussionForUpdate(
    transaction: DatabaseTransaction,
                'COMMUNITY_PROJECT_DISCUSSION_PARTICIPANT_INVALID',
            );
        }

        const isModerator = existingDiscussionParticipant.is_moderator || isProjectAuthor;
        await transaction.query(
            `
                UPDATE ${WORKSHOP_PARTICIPANT_TABLE_REFERENCE}
                SET fullname = $2,
                    email = $3,
                    is_moderator = $4
                WHERE id = $1
                  AND workshop_id = $5;
            `,
            [
                existingDiscussionParticipant.id,
                communityParticipant.fullname,
                communityParticipant.email,
                isModerator,
                projectDiscussion.discussion_workshop_id,
            ],
        );

        return {
            discussionWorkshopId: projectDiscussion.discussion_workshop_id,
            discussionWorkshopSlug: projectDiscussion.discussion_workshop_slug,
            discussionParticipantId: existingDiscussionParticipant.id,
        };
    }

    const discussionParticipantId = randomUUID();
    const timestamp = createCurrentTimestamp();
    await insertDiscussionParticipant(transaction, {
        discussionParticipantId,
        discussionWorkshopId: projectDiscussion.discussion_workshop_id,
        fullname: communityParticipant.fullname,
        email: communityParticipant.email,
        isModerator: isProjectAuthor,
        timestamp,
    });
    await insertDiscussionParticipantMapping(
        transaction,
        projectId,
        communityParticipantId,
        discussionParticipantId,
        timestamp,
    );

    return {
        discussionWorkshopId: projectDiscussion.discussion_workshop_id,
        discussionWorkshopSlug: projectDiscussion.discussion_workshop_slug,
        discussionParticipantId,
    };
}

export async function connectCommunityProjectDiscussion(
    projectId: string,
    communityParticipantId: string,
): Promise<{
    readonly connection: CommunityProjectDiscussionConnection | null;
    readonly errorMessage: string | null;
    readonly isProjectMissing: boolean;
}> {
    try {
        const connection = await runDatabaseTransaction(COMMUNITY_PROJECT_OPERATION_NAME, (transaction) =>
            connectCommunityProjectDiscussionInTransaction(transaction, projectId, communityParticipantId),
        );

        return { connection, errorMessage: null, isProjectMissing: false };
    } catch (error) {
        return { connection: null, ...createCommunityProjectMutationFailure(error) };
    }
}

/**
 * Removes a community member's votes before deleting their identity. The member row is locked first, which makes
 * ongoing and future vote transactions finish or stop before their cached totals can be changed.
 */
export async function deleteCommunityParticipantWithProjectVotesInTransaction(
    transaction: DatabaseTransaction,
    communityParticipantId: string,
): Promise<string> {
    const communityParticipant = await loadCommunityParticipant(transaction, communityParticipantId, 'update');
    if (communityParticipant === null) {
        throw new CommunityProjectMutationError('community-participant-missing', 'COMMUNITY_PROJECT_MEMBER_NOT_FOUND');
    }

    const projectVotes = await loadCommunityProjectVotesForCommunityParticipantDeletion(
        transaction,
        communityParticipantId,
    );
    await transaction.query(
        `
            DELETE FROM ${COMMUNITY_PROJECT_VOTE_TABLE_REFERENCE}
            WHERE community_participant_id = $1;
        `,
        [communityParticipantId],
    );

    const timestamp = createCurrentTimestamp();
    for (const projectVote of projectVotes) {
        const previousVote = getCommunityProjectVoteFromDatabaseValue(projectVote.vote);
        const { upvoteCountChange, downvoteCountChange } = getVoteCountChanges(previousVote, null);
        await saveCommunityProjectVoteCounts(transaction, {
            projectId: projectVote.project_id,

 succeeded in 873ms:
428:const WORKSHOP_POLL_OPTION_COLUMNS =
1011:export async function saveWorkshopPollVote(
1625:    let pollQuery = supabase.from(WORKSHOP_POLL_TABLE_NAME).select(WORKSHOP_POLL_COLUMNS);
1659:        .select(WORKSHOP_POLL_OPTION_COLUMNS)
    mutableSupabase.rpc = async (functionName) => {
        if (functionName === 'get_workshop_poll_option_vote_counts') {
            return { data: [{ option_id: SELECTED_OPTION_ID, vote_count: 1 }], error: null };
        }

        return { data: [], error: null };
    };

    return supabase;
}

describe('shared community poll votes', () => {
    it('asks the database to copy only existing poll attachments for a duplicated workshop', async () => {
        const rpc = vi.fn().mockResolvedValue({ error: null });
        const targetWorkshopId = 'duplicate-workshop-id';

        const errorMessage = await copyWorkshopPollAttachments(
            { rpc } as unknown as SupabaseClient,
            WORKSHOP_ROW.id,
            targetWorkshopId,
        );

        expect(errorMessage).toBeNull();
        expect(rpc).toHaveBeenCalledWith('copy_workshop_poll_attachments', {
            source_workshop_id: WORKSHOP_ROW.id,
            target_workshop_id: targetWorkshopId,
        });
    });

    it('loads the same visible poll selection and aggregate in the community and its attached workshop', async () => {
        const supabase = await createAttachedPollSupabase();

        const [communityPollResult, workshopPollResult] = await Promise.all([
            loadWorkshopPolls(supabase, COMMUNITY_ROW, { ...MEMBER, email: MEMBER_EMAIL.toUpperCase() }),
            loadWorkshopPolls(supabase, WORKSHOP_ROW, MEMBER),
        ]);

        expect(communityPollResult.errorMessage).toBeNull();
        expect(workshopPollResult).toEqual(communityPollResult);
        expect(workshopPollResult.polls).toEqual([
            expect.objectContaining({
                id: POLL_ID,
                question: 'Které téma chcete probrat?',
                attachedWorkshops: [expect.objectContaining({ id: WORKSHOP_ROW.id, slug: WORKSHOP_ROW.slug })],
                options: [
                    expect.objectContaining({
                        id: SELECTED_OPTION_ID,
                        voteCount: 1,
                        isVotedByParticipant: true,
                    }),
                    expect.objectContaining({
                        id: OTHER_OPTION_ID,
                        voteCount: 0,
                        isVotedByParticipant: false,
                    }),
                ],
            }),
        ]);
    });

    it('never shows an answer waiting for a decision to anybody but its writer', async () => {
        const supabase = await createAttachedPollSupabase();

        const [writerPollResult, otherMemberPollResult, moderatorPollResult] = await Promise.all([
            loadWorkshopPolls(supabase, COMMUNITY_ROW, { ...MEMBER, email: OTHER_MEMBER_EMAIL }),
            loadWorkshopPolls(supabase, COMMUNITY_ROW, MEMBER),
            loadWorkshopPolls(supabase, COMMUNITY_ROW, { ...MEMBER, isModerator: true }),
        ]);

        const getOptionIds = (polls: Awaited<ReturnType<typeof loadWorkshopPolls>>['polls']) =>
            polls[0]?.options.map((option) => option.id);

        expect(getOptionIds(writerPollResult.polls)).toEqual([
            SELECTED_OPTION_ID,
            OTHER_OPTION_ID,
            WAITING_OPTION_ID,
        ]);
        expect(getOptionIds(otherMemberPollResult.polls)).toEqual([SELECTED_OPTION_ID, OTHER_OPTION_ID]);
        expect(getOptionIds(moderatorPollResult.polls)).toEqual([
            SELECTED_OPTION_ID,
            OTHER_OPTION_ID,
            WAITING_OPTION_ID,
        ]);
    });

    it('leaves an answer waiting for a decision out of an attached workshop even for its moderator', async () => {
        const supabase = await createAttachedPollSupabase();

        const result = await loadWorkshopPolls(supabase, WORKSHOP_ROW, { ...MEMBER, isModerator: true });

        expect(result.polls[0]?.options.map((option) => option.id)).toEqual([SELECTED_OPTION_ID, OTHER_OPTION_ID]);
    });

    it('passes the verified e-mail and current participant to the one shared vote procedure', async () => {
        const rpc = vi.fn().mockResolvedValue({ error: null });
        const supabase = { rpc } as unknown as SupabaseClient;

        const result = await saveWorkshopPollVote(supabase, WORKSHOP_ROW, MEMBER, POLL_ID, {
            optionId: SELECTED_OPTION_ID,
        });

        expect(result).toEqual({ isSuccessful: true });
        expect(rpc).toHaveBeenCalledWith('set_community_workshop_poll_vote', {
            target_room_id: WORKSHOP_ROW.id,
            target_poll_id: POLL_ID,
            target_option_id: SELECTED_OPTION_ID,
            target_other_option_label: null,
            target_other_option_status: 'pending',
            target_participant_id: 'workshop-participant-id',
            target_voter_name: 'Jana Nováková',
            target_voter_email: MEMBER_EMAIL,
        });
    });

    it('passes a member-written answer to the same shared vote procedure without inventing a second endpoint', async () => {
        const rpc = vi.fn().mockResolvedValue({ error: null });
        const supabase = { rpc } as unknown as SupabaseClient;

        const result = await saveWorkshopPollVote(supabase, WORKSHOP_ROW, MEMBER, POLL_ID, {
            otherOptionLabel: 'Bezpečnost',
        });

        expect(result).toEqual({ isSuccessful: true });
        expect(rpc).toHaveBeenCalledWith('set_community_workshop_poll_vote', {
            target_room_id: WORKSHOP_ROW.id,
            target_poll_id: POLL_ID,
            target_option_id: null,
            target_other_option_label: 'Bezpečnost',
            target_other_option_status: 'pending',
            target_participant_id: 'workshop-participant-id',
            target_voter_name: 'Jana Nováková',
            target_voter_email: MEMBER_EMAIL,
        });
    });

    it('has a trusted member write an answer which is public at once, exactly as their chat message is', async () => {
        const rpc = vi.fn().mockResolvedValue({ error: null });
        const supabase = { rpc } as unknown as SupabaseClient;

        await saveWorkshopPollVote(
            supabase,
            WORKSHOP_ROW,
            { ...MEMBER, isTrusted: true },
            POLL_ID,
            { otherOptionLabel: 'Bezpečnost' },
        );

        expect(rpc).toHaveBeenCalledWith(
            'set_community_workshop_poll_vote',
            expect.objectContaining({ target_other_option_status: 'approved' }),
        );
    });

    it('shows the same shared aggregate to the community and attached-workshop administrations', async () => {
        const supabase = await createAttachedPollSupabase();

        const [communityAdminPollResult, workshopAdminPollResult] = await Promise.all([
            loadWorkshopAdminPolls(supabase, COMMUNITY_ROW),
            loadWorkshopAttachedAdminPolls(supabase, WORKSHOP_ROW),
        ]);

        expect(communityAdminPollResult.errorMessage).toBeNull();
        expect(workshopAdminPollResult).toEqual(communityAdminPollResult);
        expect(workshopAdminPollResult.polls[0]?.options[0]).toEqual(
            expect.objectContaining({
                id: SELECTED_OPTION_ID,
                voteCount: 1,
                artificialVoteCount: 0,
            }),
        );
    });

    it('keeps a shared poll when one attached workshop is soft-deleted, without showing the removed occurrence', async () => {
        const supabase = await createAttachedPollSupabase({ ...WORKSHOP_ROW, is_deleted: true });

        const result = await loadWorkshopAdminPolls(supabase, COMMUNITY_ROW);

        expect(result.errorMessage).toBeNull();
        expect(result.polls).toEqual([
            expect.objectContaining({
rg: businesses/online-workshop/participant/WorkshopChat*: The filename, directory name, or volume label syntax is incorrect. (os error 123)
rg: businesses/community/projects/CommunityProject*: The filename, directory name, or volume label syntax is incorrect. (os error 123)
---
name: "openai-docs"
description: "Use for Codex models/pricing, scheduled tasks, skills, settings, setup, troubleshooting, customization, automations, and self-knowledge—including 'you,' 'your,' 'this app,' or 'this coding agent' when they refer to Codex—and for OpenAI APIs/products and ChatGPT Work. Also use for model choice/migration, prompting, SDKs, Responses, Realtime, agents, evals, and Chat/Work/Codex comparisons. Do not use for generic app/software tasks that merely mention Codex."
metadata:
  short-description: "Codex models/pricing, scheduled tasks, skills, settings, setup, troubleshooting, and self-knowledge; OpenAI APIs and ChatGPT Work. 'You'/'this app' means Codex only."
---

# OpenAI Docs

Provide current, cited OpenAI product, API, model, and Codex guidance. Read zero or one primary reference.

**First substantive action:** Search the user's exact requested official OpenAI documentation topic and any explicitly named model using a concise, topic-specific query of 2-6 essential terms. When an already-available direct official documentation search and page-retrieval capability is present, use it first: search, then fetch or open the matching official page before general web search. Otherwise, immediately use official-domain web search, then actually open or fetch the relevant official page. Complete this source order before reading a reference, inspecting local or repository files, running a Codex manual or model resolver, drafting a plan, or answering from memory. Use the actual fetched page, not a search snippet or an unopened link. If one official search or page does not establish the answer, search another appropriate official domain and actually open or fetch the result. Preserve the exact requested model; never substitute a newer model.

**Only exception:** An explicitly requested, genuinely broad, cross-topic Codex setup, orientation, or system-map synthesis may use the manual first when shell execution and an allowed temporary cache are available. A specific Codex feature, setting, command, error, model, or requested citation remains docs-first. Mixed Chat/Work/Codex comparisons are official documentation questions, not manual-first Codex requests.

For generic software tasks, answer the software task directly. OpenAI implementation, debugging, SDK, API, prompting, agent, and eval requests are not generic.

For a straightforward factual or citation-only request, follow the source order and do not read a route reference. This includes straightforward API facts, ChatGPT Work or mixed Chat/Work/Codex comparisons, model tiers, aliases, Pro mode, reasoning settings, factual migration baselines, and narrow Codex facts. Prioritize `learn.chatgpt.com` for ChatGPT Work.

## Choose one primary route

Use the first matching route, and read its reference only when the requested task needs that specialized workflow:

- **Explicitly requested local documentation integration:** Read [integration guidance](references/mcp-diagnostics.md) only when the user explicitly requests that local integration.
- **Model migration, upgrades, or model-specific prompting:** Read [model-migration.md](references/model-migration.md) for actual migration planning, implementation, dynamic target resolution, or prompt changes. Preserve an explicitly requested target.
- **Model selection and comparisons:** Read [model-selection.md](references/model-selection.md) only when nuanced current, latest, default, cost, latency, quality, or modality tradeoffs need more guidance. Do not run a migration resolver for selection alone.
- **Product, API, ChatGPT Work, and mixed Chat/Work/Codex documentation:** Read [official-docs.md](references/official-docs.md) only when fetched official pages leave source selection, API schemas, or the requested implementation unresolved. This route is not manual-first.
- **Explicitly broad Codex setup, orientation, or cross-topic synthesis:** Read [codex-self-knowledge.md](references/codex-self-knowledge.md) when the eligible Codex manual or deeper Codex procedures are needed.

Read at most one primary reference. Do not open every route, bundled model guide, or helper script. Read a supporting reference or run a helper only when the chosen workflow demonstrably needs it.

## Source and execution boundaries

- Search, open, fetch, and cite only `developers.openai.com`, `platform.openai.com`, and `learn.chatgpt.com`. Cite the page that supports the claim. State uncertainty when official sources do not establish pricing, availability, account access, limits, or behavior.
- Preserve an explicitly requested model for selection, migration, and prompting. Resolve an unspecified latest or current migration target only after searching and fetching current official guidance.
- Use `references/latest-model.md` only as a disclosed fallback after current official model guidance does not answer the question. Read `references/upgrading-to-gpt-6-astra.md` only for an actual, requested GPT-6 migration; read `references/prompting-guide.md` only for requested prompting work.
- Before building, running, editing, debugging, or testing an API-backed app or tool, use `openai-platform-api-key` first when available. Documentation, conceptual examples, model selection, and read-only guidance do not require an API key.
- Say "OpenAI Docs" or "official OpenAI documentation" in user-facing answers. Keep exact official citations and examples concise.

 succeeded in 947ms:
app/api/workshops/komunita/projects/route.ts:7:import { createCommunityProject } from '@/lib/community-projects/communityProjectService';
app/api/workshops/komunita/projects/route.ts:94:    const createdProject = await createCommunityProject({
lib/workshops/workshopDatabase.ts:42:import { getWorkshopParticipantSubmissionStatus } from '@/lib/workshops/workshopSubmissionStatus';
lib/workshops/workshopDatabase.ts:1011:export async function saveWorkshopPollVote(
lib/workshops/workshopDatabase.ts:1023:        target_other_option_status: getWorkshopParticipantSubmissionStatus(participant),
lib/community-projects/communityProjectService.ts:13:import { getWorkshopParticipantSubmissionStatus } from '@/lib/workshops/workshopSubmissionStatus';
lib/community-projects/communityProjectService.ts:118:function createCommunityProjectMutationFailure(error: unknown): CommunityProjectMutationFailure {
lib/community-projects/communityProjectService.ts:127:function createCommunityProjectDiscussionSlug(discussionWorkshopId: string): string {
lib/community-projects/communityProjectService.ts:419:export async function createCommunityProjectInTransaction(
lib/community-projects/communityProjectService.ts:426:    const discussionWorkshopSlug = createCommunityProjectDiscussionSlug(discussionWorkshopId);
lib/community-projects/communityProjectService.ts:428:    const status = getWorkshopParticipantSubmissionStatus({
lib/community-projects/communityProjectService.ts:504:export async function createCommunityProject(
lib/community-projects/communityProjectService.ts:509:            createCommunityProjectInTransaction(transaction, values),
lib/community-projects/communityProjectService.ts:611:        return { connection: null, ...createCommunityProjectMutationFailure(error) };
lib/community-projects/communityProjectService.ts:762:        return { result: null, ...createCommunityProjectMutationFailure(error) };
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
import type { WorkshopRow } from '@/lib/workshops/workshopDatabase';
import { isWorkshopPanelOffered, type WorkshopPanelKey } from '@/lib/workshops/workshopPanels';
import type { WorkshopParticipant } from '@/lib/workshops/workshopTypes';
import { NextResponse } from 'next/server';

export function getWorkshopInteractionBanResponseOrNull(participant: WorkshopParticipant): NextResponse | null {
    return participant.isInteractionBanned
        ? NextResponse.json(
              { error: 'Interakce nejsou pro tento účet dostupné.' },
              { status: 403 },
          )
        : null;
}

/**
 * Refuses an action of a participant which the room does not offer anymore
 *
 * Note: The room already takes away a switched-off panel and one its kind never had, so this only rejects a stale or
 *       a forged request.
 * Note: Only participants are held back here. The administration writes through its own routes and therefore keeps
 *       reacting and moderating in a room whose panels are switched off.
 */
export function getDisabledWorkshopPanelResponseOrNull(
    workshopRow: WorkshopRow,
    panelKey: WorkshopPanelKey,
): NextResponse | null {
    return isWorkshopPanelOffered(workshopRow.room_kind, workshopRow.disabled_panels, panelKey)
        ? null
        : NextResponse.json({ error: 'Tato část workshopu je právě vypnutá.' }, { status: 403 });
}
import { isCommunityProjectUrl } from '@/lib/community-projects/communityProjectUrl';
import {
    COMMUNITY_PROJECT_MODERATION_STATUS_VALUES,
    COMMUNITY_PROJECT_VOTE_VALUES,
} from '@/lib/community-projects/communityProjectTypes';
import { z } from 'zod';

export const MAXIMAL_COMMUNITY_PROJECT_URL_LENGTH = 2_048;
export const MAXIMAL_COMMUNITY_PROJECT_TITLE_LENGTH = 200;
export const MAXIMAL_COMMUNITY_PROJECT_DESCRIPTION_LENGTH = 2_000;

const COMMUNITY_PROJECT_URL_SCHEMA = z
    .string()
    .trim()
    .min(1)
    .max(MAXIMAL_COMMUNITY_PROJECT_URL_LENGTH)
    .refine(isCommunityProjectUrl);

export const communityProjectIdSchema = z.string().uuid();

export const communityProjectPreviewSchema = z.object({
    url: COMMUNITY_PROJECT_URL_SCHEMA,
});

export const communityProjectCreateSchema = z.object({
    url: COMMUNITY_PROJECT_URL_SCHEMA,
    title: z.string().trim().min(1).max(MAXIMAL_COMMUNITY_PROJECT_TITLE_LENGTH),
    description: z.string().trim().max(MAXIMAL_COMMUNITY_PROJECT_DESCRIPTION_LENGTH),
});

export const communityProjectVoteSchema = z.object({
    vote: z.enum(COMMUNITY_PROJECT_VOTE_VALUES),
});

/**
 * A pending project is resolved into one final moderation decision, mirroring the decisions available for chat
 * messages.
 */
export const communityProjectModerationSchema = z.object({
    status: z.enum(COMMUNITY_PROJECT_MODERATION_STATUS_VALUES),
});

ERROR: You've hit your usage limit. Upgrade to Pro (https://chatgpt.com/explore/pro), visit https://chatgpt.com/codex/settings/usage to purchase more credits or try again at 9:09 AM.
ERROR: You've hit your usage limit. Upgrade to Pro (https://chatgpt.com/explore/pro), visit https://chatgpt.com/codex/settings/usage to purchase more credits or try again at 9:09 AM.
tokens used
43,855

=== runner shell finished at 2026-09-17T02:55:08.627Z ===
Status: succeeded

=== test shell started at 2026-09-17T02:55:08.642Z ===
Script path: /c/Users/me/work/promptbook-experiments-and-landing-pages/aldaron/.promptbook/coder-prompts/2026-09-0130-ai-auto-approving-comments.test.sh

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
   Generating static pages (0/78) ...
BenefitsSection rendered
IntegrationsSection rendered
BenefitsSection rendered
IntegrationsSection rendered
   Generating static pages (19/78) 
BenefitsSection rendered
BenefitsSection rendered
IntegrationsSection rendered
BenefitsSection rendered
IntegrationsSection rendered
   Generating static pages (38/78) 
   Generating static pages (58/78) 
 ✓ Generating static pages (78/78)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                                                                  Size  First Load JS  Revalidate  Expire
┌ ƒ /                                                                                       388 B         102 kB
├ ○ /_not-found                                                                             388 B         102 kB
├ ƒ /[shortcode]                                                                          2.31 kB         142 kB
├ ƒ /admin                                                                                  175 B         105 kB
├ ƒ /admin/community                                                                      7.79 kB         328 kB
├ ƒ /admin/contacts                                                                         37 kB         197 kB
├ ƒ /admin/discount-codes                                                                 9.87 kB         119 kB
├ ƒ /admin/login                                                                            388 B         102 kB
├ ƒ /admin/shortener                                                                      64.6 kB         174 kB
├ ƒ /admin/workshops                                                                        217 B         321 kB
├ ○ /ai-supervize                                                                           16 kB         239 kB
├ ƒ /ai-supervize-mini                                                                    17.1 kB         232 kB
├ ○ /ai-supervize-mini/opengraph-image                                                      388 B         102 kB
├ ƒ /ai-supervize-mini/participant                                                        2.51 kB         139 kB
├ ○ /ai-supervize/opengraph-image                                                           388 B         102 kB
├ ○ /ai-ta-krajta                                                                         19.1 kB         146 kB          1h      1y
├ ○ /ai-ta-krajta/branding                                                                  204 B         122 kB
├ ○ /ai-ta-krajta/logo.png                                                                  388 B         102 kB
├ ○ /ai-ta-krajta/logo.svg                                                                  388 B         102 kB
├ ○ /ai-ta-krajta/manifest.webmanifest                                                      388 B         102 kB
├ ○ /ai-ta-krajta/media-kit                                                               3.63 kB         125 kB
├ ○ /ai-ta-krajta/opengraph-image                                                           388 B         102 kB
├ ƒ /api/admin/community/memberships                                                        388 B         102 kB
├ ƒ /api/admin/community/projects                                                           388 B         102 kB
├ ƒ /api/admin/community/projects/[projectId]                                               388 B         102 kB
├ ƒ /api/admin/discount-codes                                                               388 B         102 kB
├ ƒ /api/admin/discount-codes/[discountCodeId]                                              388 B         102 kB
├ ƒ /api/admin/session                                                                      388 B         102 kB
├ ƒ /api/admin/session/sign-out                                                             388 B         102 kB
├ ƒ /api/admin/shortener                                                                    388 B         102 kB
├ ƒ /api/admin/shortener/[shortcodeLinkId]                                                  388 B         102 kB
├ ƒ /api/admin/shortener/[shortcodeLinkId]/clicks                                           388 B         102 kB
├ ƒ /api/admin/workshops                                                                    388 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]                                                       388 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/analytics                                             388 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/artificial-reactions                                  388 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/comments                                              388 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/comments/[commentId]                                  388 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/comments/[commentId]/artificial-upvotes               388 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/comments/[commentId]/material                         388 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/content                                               388 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/content/[contentId]                                   388 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/exports/[exportKind]                                  388 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/feedback                                              388 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/participants                                          388 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/participants/[participantId]                          388 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/participants/[participantId]/timeline                 388 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/polls                                                 388 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/polls/[pollId]                                        388 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/polls/[pollId]/options/[optionId]                     388 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/polls/[pollId]/options/[optionId]/artificial-votes    388 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/reactions                                             388 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/stage-comment                                         388 B         102 kB
├ ƒ /api/ai-supervize-mini/registration                                                     388 B         102 kB
├ ƒ /api/ai-ta-krajta/episodes/search                                                       388 B         102 kB
├ ƒ /api/community/membership/registration                                                  388 B         102 kB
├ ƒ /api/contacts                                                                           388 B         102 kB
├ ƒ /api/contacts/export/[formatId]                                                         388 B         102 kB
├ ƒ /api/discount-codes/validate                                                            388 B         102 kB
├ ƒ /api/stripe/webhook                                                                     388 B         102 kB
├ ƒ /api/track-click                                                                        388 B         102 kB
├ ƒ /api/waitlist                                                                           388 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/comments                                                  388 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/comments/[commentId]                                      388 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/comments/[commentId]/material                             388 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/comments/[commentId]/upvotes                              388 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/connect                                                   388 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/feedback                                                  388 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership                                                388 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership/cancellation                                   388 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership/checkout                                       388 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership/checkout/confirmation                          388 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership/portal                                         388 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/participant                                               388 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/participants/[participantId]                              388 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/polls/[pollId]/options/[optionId]                         388 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/polls/[pollId]/votes                                      388 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/presence                                                  388 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/reactions                                                 388 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/repository                                                388 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/state                                                     388 B         102 kB
├ ƒ /api/workshops/komunita/projects                                                        388 B         102 kB
├ ƒ /api/workshops/komunita/projects/[projectId]                                            388 B         102 kB
├ ƒ /api/workshops/komunita/projects/[projectId]/connect                                    388 B         102 kB
├ ƒ /api/workshops/komunita/projects/[projectId]/vote                                       388 B         102 kB
├ ƒ /api/workshops/komunita/projects/preview                                                388 B         102 kB
├ ○ /branding                                                                             4.75 kB         141 kB
├ ○ /contact                                                                              2.54 kB         163 kB
├ ○ /cs                                                                                     169 B         240 kB
├ ƒ /cs/komunita                                                                            230 B         301 kB
├ ƒ /cs/komunita/calendar.ics                                                               388 B         102 kB
├ ƒ /cs/komunita/clenstvi                                                                 13.1 kB         155 kB
├ ○ /cs/komunita/clenstvi/opengraph-image                                                   388 B         102 kB
├ ○ /cs/komunita/opengraph-image                                                            388 B         102 kB
├ ƒ /cs/komunita/projects                                                                  3.1 kB         139 kB
├ ƒ /cs/komunita/projects/[projectId]                                                     2.91 kB         299 kB
├ ○ /cs/obchodni-podminky                                                                 2.52 kB         139 kB
├ ○ /cs/ochrana-osobnich-udaju                                                            2.52 kB         139 kB
├ ƒ /cs/online-workshop                                                                   13.2 kB         245 kB
├ ƒ /cs/online-workshop/dekujeme                                                          4.01 kB         152 kB
├ ○ /cs/online-workshop/opengraph-image                                                     388 B         102 kB
├ ƒ /cs/online-workshop/participant                                                       2.84 kB         298 kB
├ ○ /cs/online-workshop/participant/opengraph-image                                         388 B         102 kB
├ ○ /cs/opengraph-image                                                                     388 B         102 kB
├ ○ /cs/pavol                                                                               158 B         203 kB
├ ○ /cs/pavol/opengraph-image                                                               388 B         102 kB
├ ○ /data-deletion                                                                        2.51 kB         139 kB
├ ○ /dekujeme                                                                             3.71 kB         151 kB
├ ○ /en                                                                                     169 B         240 kB
├ ○ /en/opengraph-image                                                                     388 B         102 kB
├ ○ /en/pavol                                                                               158 B         203 kB
├ ○ /en/pavol/opengraph-image                                                               388 B         102 kB
├ ○ /en/privacy-policy                                                                    2.52 kB         139 kB
├ ○ /en/terms-and-conditions                                                              2.52 kB         139 kB
├ ○ /for-agro                                                                             7.31 kB         268 kB
├ ○ /for-agro/opengraph-image                                                               388 B         102 kB
├ ○ /for-industry                                                                         7.92 kB         269 kB
├ ○ /for-industry/opengraph-image                                                           388 B         102 kB
├ ○ /hackathon-factory                                                                      15 kB         252 kB
├ ○ /hackathon-factory/opengraph-image                                                      388 B         102 kB
├ ƒ /k/[...shortFileUrlParts]                                                               388 B         102 kB
├ ○ /manifest.webmanifest                                                                   388 B         102 kB
├ ○ /old                                                                                  20.5 kB         245 kB
├ ○ /opengraph-image                                                                        388 B         102 kB
├ ƒ /pavol                                                                                  388 B         102 kB
├ ƒ /privacy                                                                                388 B         102 kB
├ ƒ /pro-firmy                                                                              388 B         102 kB
├ ○ /pro-mesta                                                                            6.39 kB         267 kB
├ ○ /pro-mesta/opengraph-image                                                              388 B         102 kB
├ ○ /robots.txt                                                                             388 B         102 kB
├ ○ /shortener                                                                              388 B         102 kB
├ ○ /sitemap.xml                                                                            388 B         102 kB
├ ƒ /skoleni                                                                                388 B         102 kB
├ ƒ /terms                                                                                  388 B         102 kB
└ ○ /test/hopko                                                                           4.62 kB         106 kB
+ First Load JS shared by all                                                              102 kB
  ├ chunks/1684-6c8ee981b3c4cfc9.js                                                       45.8 kB
  ├ chunks/4bd1b696-56d776b9b579ad04.js                                                   53.3 kB
  └ other shared chunks (total)                                                           2.53 kB


ƒ Middleware                                                                              30.9 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand


> promptbook-landing-page@0.1.0 test-e2e
> playwright test

[WebServer] Database migrations skipped: DATABASE_URL is not configured.

Running 58 tests using 1 worker

  ✓   1 tests\e2e\cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /cs (19.1s)
  ✓   2 tests\e2e\cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /en (8.7s)
  ✓   3 tests\e2e\cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /cs/ochrana-osobnich-udaju (7.9s)
  ✓   4 tests\e2e\cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /cs/komunita (21.3s)
  ✓   5 tests\e2e\cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /ai-supervize (12.2s)
  ✓   6 tests\e2e\cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /ai-supervize-mini (9.3s)
  ✓   7 tests\e2e\cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /ai-ta-krajta (10.8s)
  ✓   8 tests\e2e\cookie-consent.spec.ts:40:9 › cookie controls fit desktop, phone and landscape viewports: /admin/login (6.9s)
  ✓   9 tests\e2e\cookie-consent.spec.ts:64:5 › cookie choices persist and the privacy link reopens settings after client navigation (8.6s)
  ✓  10 tests\e2e\cookie-consent.spec.ts:92:5 › cookie panel and coder badge clear a player opened later, resized and closed (7.3s)
  ✓  11 tests\e2e\cookie-consent.spec.ts:123:5 › a booking notice leaves cookie choices clickable and the footer can be scrolled clear (6.5s)
  ✓  12 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /cs (4.6s)
  ✓  13 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /en (5.9s)
  ✓  14 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /pro-mesta (8.8s)
  ✓  15 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /for-agro (8.0s)
  ✓  16 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /for-industry (7.9s)
  ✓  17 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /ai-supervize (3.9s)
  ✓  18 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /ai-supervize-mini (6.8s)
  ✓  19 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /ai-ta-krajta (3.8s)
  ✓  20 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /ai-ta-krajta/media-kit (6.1s)
  ✓  21 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /ai-ta-krajta/branding (6.2s)
  ✓  22 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /hackathon-factory (6.2s)
  ✓  23 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /cs/online-workshop (10.0s)
  ✓  24 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /cs/komunita/clenstvi (15.4s)
  ✓  25 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /cs/pavol (8.4s)
  ✓  26 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /en/pavol (8.9s)
  ✓  27 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /cs/ochrana-osobnich-udaju (3.4s)
  ✓  28 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /en/privacy-policy (10.6s)
  ✓  29 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /cs/obchodni-podminky (5.6s)
  ✓  30 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /en/terms-and-conditions (6.6s)
  ✓  31 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /contact (7.6s)
  ✓  32 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /branding (7.7s)
  ✓  33 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /data-deletion (9.3s)
  ✓  34 tests\e2e\public-pages.spec.ts:134:9 › public landing and information page loads: /old (19.9s)
  ✓  35 tests\e2e\public-pages.spec.ts:139:5 › AI ta Krajta collaboration section deep-links to its media kit (16.3s)
  ✓  36 tests\e2e\public-pages.spec.ts:150:5 › AI ta Krajta owns its metadata, icon and installable manifest and credits Promptbook coder (14.7s)
  ✓  37 tests\e2e\public-pages.spec.ts:246:5 › AI ta Krajta searches complete transcripts on the server without sending them to the browser (9.8s)
  ✓  38 tests\e2e\public-pages.spec.ts:264:9 › public address redirects to its page: / (65ms)
  ✓  39 tests\e2e\public-pages.spec.ts:264:9 › public address redirects to its page: /pavol (5.7s)
  ✓  40 tests\e2e\public-pages.spec.ts:264:9 › public address redirects to its page: /privacy (3.1s)
  ✓  41 tests\e2e\public-pages.spec.ts:264:9 › public address redirects to its page: /terms (5.1s)
  ✓  42 tests\e2e\public-pages.spec.ts:264:9 › public address redirects to its page: /skoleni (4.7s)
  ✓  43 tests\e2e\public-pages.spec.ts:278:5 › /skoleni carries a discount code to the workshop registration (172ms)
  ✓  44 tests\e2e\public-submissions.spec.ts:13:5 › submits the shared footer newsletter form (1.2m)
  ✓  45 tests\e2e\public-submissions.spec.ts:27:5 › submits the reusable get-started lead dialog (17.4s)
  ✓  46 tests\e2e\public-submissions.spec.ts:41:5 › submits the business lead dialog (6.9s)
  ✓  47 tests\e2e\public-submissions.spec.ts:55:5 › submits the homepage qualification lead flow (49.6s)
  ✓  48 tests\e2e\public-submissions.spec.ts:80:5 › submits Pavol’s personal contact form (7.5s)
  ✓  49 tests\e2e\public-submissions.spec.ts:96:5 › submits a published online-workshop registration (38.5s)
  ✓  50 tests\e2e\public-submissions.spec.ts:116:5 › personalizes and submits the 199 Kč Promptbook paid community membership (13.4s)
  ✓  51 tests\e2e\public-submissions.spec.ts:143:5 › submits an available AI Supervize Mini workshop registration (26.3s)
  ✓  52 tests\e2e\public-submissions.spec.ts:171:5 › submits the AI Supervize Mini future-term interest form (5.4s)
  ✓  53 tests\e2e\public-submissions.spec.ts:196:5 › submits the AI ta Krajta collaboration form (6.3s)
  ✓  54 tests\e2e\public-submissions.spec.ts:211:5 › plays the newest AI ta Krajta episode from the header (6.1s)
  ✓  55 tests\e2e\public-submissions.spec.ts:220:5 › resumes a half-played AI ta Krajta episode where its listener left it (9.2s)
  ✓  56 tests\e2e\public-submissions.spec.ts:254:5 › starts the AI ta Krajta minigame from its snake and keeps it local to the page (4.9s)
  ✓  57 tests\e2e\public-submissions.spec.ts:268:5 › filters the AI ta Krajta archive by a person and keeps its destination in the hash (5.6s)
  -  58 tests\e2e\public-submissions.spec.ts:280:5 › connects a public online-workshop participant
Saved 52 E2E video(s) to tests/e2e/videos/.
Removed the E2E video(s) of 1 outdated run(s) from tests/e2e/videos/.

  1 skipped
  57 passed (11.6m)

> promptbook-landing-page@0.1.0 delete-test-data
> tsx scripts/delete-test-data.ts

Deleted 10 Contact row(s) and 0 workshop participant row(s) with an @example.com e-mail address.

=== test shell finished at 2026-09-17T03:09:45.933Z ===
Status: succeeded
````
