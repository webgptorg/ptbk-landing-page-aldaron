# Run trace of `prompts/2026-09-0100-repository-as-special-material.md#1`

-   **Prompt:** Linked repository should appear alongside the materials as a kind of special material.
-   **Outcome:** Succeeded
-   **Runner:** OpenAI Codex `gpt-5.6-terra` thinking `max` (ChatGPT account)
-   **Attempts:** 1
-   **Steps:** Implementation ~$0.3132 6 minutes; Testing 4 minutes
-   **Verification command:** `npm run test-for-ptbk-coder`
-   **Started:** 2026-09-14T15:12:53.276Z
-   **Finished:** 2026-09-14T15:22:18.759Z
-   **Duration:** 9 minutes

## Runtime log

```text
=== runner shell started at 2026-09-14T15:12:53.324Z ===
Script path: /Users/hejny/work/aldaron/.promptbook/coder-prompts/2026-09-0100-repository-as-special-material.sh

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
    -C /Users/hejny/work/aldaron \
    --skip-git-repo-check \
    <<'CODEX_PROMPT'

## Your Task

Linked repository should appear alongside the materials as a kind of special material.

- It should appear alongside the materials as a material for all participants (both paying and non-paying)
- You are working with page `/cs/online-workshop/participant?workshop=`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

![alt text](prompts/screenshots/2026-09-0100-repository-as-special-material.png)
![alt text](prompts/screenshots/2026-09-0100-repository-as-special-material-1.png)

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
  with: running and upcoming ones first, finished ones behind a disclosure.
  Picking one changes the room being connected to and the `workshop` parameter,
  without losing the name and e-mail already typed.
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
  updates. Terms show event kind, format/place, price, and status. A term with a
  live room links there; otherwise it links to its landing page. The calendar
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
  community lists the terms and opens the room of each; every other room closes
  its main column with an invitation into the community. Both carry the connected
  member's name and email on, and an incomplete identity carries nothing rather
  than half of it. Which rooms invite is answered by
  `lib/workshops/workshopKindCapabilities.ts`; the community and project
  discussions do not. The invitation names the community's sections by the names
  the community itself uses.
- Community polls attached to workshops are shared. A normalized email gives a
  member one vote across the community and all attached workshops. Workshops
  may display and accept votes, but the community owns administration.
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
  the default branch, one selected branch, several selected branches, or all
  branches, and an optional deployment URL — so it is set, changed, and unset at
  once and neither branch selection nor deployment outlives its repository. Room
  kinds which offer it are named in `lib/workshops/workshopKindCapabilities.ts`.
  The room shows the repository, its links, and the newest commits, marking those
  which arrive while a participant watches; a newly found commit is broadcast to
  active rooms and appears on the stage for ten seconds. Multiple branch selections
  are shown as a commit graph. Commits come from the public commit feed or keyless
  API, pooled once per server and cached through the revalidation window; an
  unreadable feed still leaves the room naming its project.
- Paid-only materials are decided on the server in one pass. Members receive
  unlocked material; others receive only the published titles as an offer. An
  untitled item is not named, items are not named before their unlock time, and a
  room without membership hides paid-only items without naming them.
- After a workshop ends, its recording is server-gated to members. Others receive
  the published teaser, or a generic offer when no teaser exists; a term without
  a recording offers nothing.
- Trusted participants remain invisible and their messages are auto-approved.
  Moderators see pending messages, can approve/reject/correct/pin them, and can
  trust or silence authors. Workshop and community moderators are appointed in
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
- Which term a registration belongs to is decided once, in
  `lib/workshops/workshopRegistrations.ts`. A term is recognised by its slug, by
  its Prague day, and by the moment it begins at, so registrations written before
  terms had slugs keep counting. Registration forms write the term through the
  same line prefixes that rule reads back. Contacts are still gathered, recorded
  and shown only by `/admin/contacts`; counting reads nothing but their notes.
  The registration actions in workshop administration carry that same term filter
  into the contacts list and its exports.
- Workshop polls are read-only in workshop administration. Creating a new event
  publishes it by default; duplicating an event keeps it published unless the
  source is unpublished. Duplicating a workshop preserves its connections to
  the already existing attached polls; it creates no polls, options, votes, or room history. Stage settings contain
  the live stream and recording teaser, and project settings the repository the
  term is about, written as an address or as `owner/name`, together with its branch
  selection. An end may be empty;
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
ptbk-codex-login-method: chatgpt
Reading prompt from stdin...
OpenAI Codex v0.154.0
--------
workdir: /Users/hejny/work/aldaron
model: gpt-5.6-terra
provider: openai
approval: never
sandbox: danger-full-access
reasoning effort: max
reasoning summaries: none
session id: 01a0a07a-6f37-7391-886e-7341c92208ff
--------
user

## Your Task

Linked repository should appear alongside the materials as a kind of special material.

- It should appear alongside the materials as a material for all participants (both paying and non-paying)
- You are working with page `/cs/online-workshop/participant?workshop=`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

![alt text](prompts/screenshots/2026-09-0100-repository-as-special-material.png)
![alt text](prompts/screenshots/2026-09-0100-repository-as-special-material-1.png)

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
  with: running and upcoming ones first, finished ones behind a disclosure.
  Picking one changes the room being connected to and the `workshop` parameter,
  without losing the name and e-mail already typed.
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
  updates. Terms show event kind, format/place, price, and status. A term with a
  live room links there; otherwise it links to its landing page. The calendar
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
  community lists the terms and opens the room of each; every other room closes
  its main column with an invitation into the community. Both carry the connected
  member's name and email on, and an incomplete identity carries nothing rather
  than half of it. Which rooms invite is answered by
  `lib/workshops/workshopKindCapabilities.ts`; the community and project
  discussions do not. The invitation names the community's sections by the names
  the community itself uses.
- Community polls attached to workshops are shared. A normalized email gives a
  member one vote across the community and all attached workshops. Workshops
  may display and accept votes, but the community owns administration.
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
  the default branch, one selected branch, several selected branches, or all
  branches, and an optional deployment URL — so it is set, changed, and unset at
  once and neither branch selection nor deployment outlives its repository. Room
  kinds which offer it are named in `lib/workshops/workshopKindCapabilities.ts`.
  The room shows the repository, its links, and the newest commits, marking those
  which arrive while a participant watches; a newly found commit is broadcast to
  active rooms and appears on the stage for ten seconds. Multiple branch selections
  are shown as a commit graph. Commits come from the public commit feed or keyless
  API, pooled once per server and cached through the revalidation window; an
  unreadable feed still leaves the room naming its project.
- Paid-only materials are decided on the server in one pass. Members receive
  unlocked material; others receive only the published titles as an offer. An
  untitled item is not named, items are not named before their unlock time, and a
  room without membership hides paid-only items without naming them.
- After a workshop ends, its recording is server-gated to members. Others receive
  the published teaser, or a generic offer when no teaser exists; a term without
  a recording offers nothing.
- Trusted participants remain invisible and their messages are auto-approved.
  Moderators see pending messages, can approve/reject/correct/pin them, and can
  trust or silence authors. Workshop and community moderators are appointed in
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
- Which term a registration belongs to is decided once, in
  `lib/workshops/workshopRegistrations.ts`. A term is recognised by its slug, by
  its Prague day, and by the moment it begins at, so registrations written before
  terms had slugs keep counting. Registration forms write the term through the
  same line prefixes that rule reads back. Contacts are still gathered, recorded
  and shown only by `/admin/contacts`; counting reads nothing but their notes.
  The registration actions in workshop administration carry that same term filter
  into the contacts list and its exports.
- Workshop polls are read-only in workshop administration. Creating a new event
  publishes it by default; duplicating an event keeps it published unless the
  source is unpublished. Duplicating a workshop preserves its connections to
  the already existing attached polls; it creates no polls, options, votes, or room history. Stage settings contain
  the live stream and recording teaser, and project settings the repository the
  term is about, written as an address or as `owner/name`, together with its branch
  selection. An end may be empty;
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
I’ll trace how workshop project links and participant materials are currently assembled, then make the smallest shared change so the repository is exposed as an always-available special material.
exec
/bin/zsh -lc "pwd && git status --short && rg -n \"material|Material|repository|Repository|project\" app lib components tests --glob '*.{ts,tsx,js,jsx}' | head -n 300" in /Users/hejny/work/aldaron
 succeeded in 0ms:
/Users/hejny/work/aldaron
 M prompts/2026-09-0100-repository-as-special-material.md
tests/e2e/globalTeardown.ts:11: *       machine which verifies the project - and a full disk fails the run it was supposed to record.
app/ai-ta-krajta/logo.svg/route.ts:8: * Next.js reserves the `icon` metadata convention for an image checked into the repository, so an icon drawn from the
components/footer.tsx:40:    projectFundingText?: ReactNode;
components/footer.tsx:88:        projectFundingText: (
components/footer.tsx:90:                This project was implemented with funding from the national budget
components/footer.tsx:138:        projectFundingText: (
components/footer.tsx:169:        projectFundingText = defaults.projectFundingText,
components/footer.tsx:331:                                    {projectFundingText}
lib/network/feedMediaTypes.ts:4: * Note: A YouTube channel and the commits of a GitHub repository are both published as Atom, so both of them ask for
lib/metadata/social-preview-artwork.tsx:466: * Represents people connecting around a shared discussion and shared material.
app/api/admin/community/projects/route.ts:2:import { loadAdminCommunityProjects } from '@/lib/community-projects/communityProjectDatabase';
app/api/admin/community/projects/route.ts:8: * Lists one moderation queue of community projects for the administration. The regular community API never returns
app/api/admin/community/projects/route.ts:27:    const { projects, errorMessage } = await loadAdminCommunityProjects(supabase, requestedStatus ?? 'pending');
app/api/admin/community/projects/route.ts:28:    if (projects === null) {
app/api/admin/community/projects/route.ts:29:        console.error('Failed to load community projects for administration:', errorMessage);
app/api/admin/community/projects/route.ts:33:    return NextResponse.json({ projects }, { headers: { 'Cache-Control': 'no-store' } });
app/api/admin/community/projects/[projectId]/route.ts:3:import { moderateCommunityProject } from '@/lib/community-projects/communityProjectModeration';
app/api/admin/community/projects/[projectId]/route.ts:7:} from '@/lib/community-projects/communityProjectSchemas';
app/api/admin/community/projects/[projectId]/route.ts:12:    readonly params: Promise<{ readonly projectId: string }>;
app/api/admin/community/projects/[projectId]/route.ts:16: * Uses the same project moderation service as a community moderator, behind the separate administrator session.
app/api/admin/community/projects/[projectId]/route.ts:24:    const { projectId } = await context.params;
app/api/admin/community/projects/[projectId]/route.ts:25:    if (!communityProjectIdSchema.safeParse(projectId).success) {
app/api/admin/community/projects/[projectId]/route.ts:40:    const { project, errorMessage } = await moderateCommunityProject(supabase, projectId, parsedResult.data.status);
app/api/admin/community/projects/[projectId]/route.ts:42:        console.error('Failed to moderate community project from administration:', errorMessage);
app/api/admin/community/projects/[projectId]/route.ts:45:    if (project === null) {
app/api/admin/community/projects/[projectId]/route.ts:49:    return NextResponse.json(project, { headers: { 'Cache-Control': 'no-store' } });
lib/legal/privacyPolicyDocuments.tsx:179:                    'To register you for a workshop or another event, issue an invoice, and send you the materials - based on the performance of the contract and our legal obligations.',
lib/text/descriptionText.ts:7: *       compilation target than this project uses.
lib/github/githubRepository.test.ts:7:    createGithubRepositoryUrl,
lib/github/githubRepository.test.ts:14:    extractGithubRepository,
lib/github/githubRepository.test.ts:16:    formatGithubRepositoryName,
lib/github/githubRepository.test.ts:18:} from '@/lib/github/githubRepository';
lib/github/githubRepository.test.ts:23:describe('the repository one workshop is about', () => {
lib/github/githubRepository.test.ts:24:    it('is read from every way a repository is written down', () => {
lib/github/githubRepository.test.ts:33:        ].forEach((writtenRepository) => {
lib/github/githubRepository.test.ts:34:            expect(extractGithubRepository(writtenRepository)).toEqual(PROMPTBOOK_REPOSITORY);
lib/github/githubRepository.test.ts:38:    it('keeps a repository which is named with dots, dashes and underscores', () => {
lib/github/githubRepository.test.ts:39:        expect(extractGithubRepository('hejny/promptbook.io_2-0')).toEqual({
lib/github/githubRepository.test.ts:45:    it('is nothing when what was written names no repository on GitHub', () => {
lib/github/githubRepository.test.ts:58:        ].forEach((writtenRepository) => {
lib/github/githubRepository.test.ts:59:            expect(extractGithubRepository(writtenRepository)).toBeNull();
lib/github/githubRepository.test.ts:64:        expect(formatGithubRepositoryName(PROMPTBOOK_REPOSITORY)).toBe('hejny/promptbook');
lib/github/githubRepository.test.ts:71:        expect(extractGithubBranchName('  feature/repository-panel  ')).toBe('feature/repository-panel');
lib/github/githubRepository.test.ts:98:        expect(doesGithubBranchNameMatchPattern('feature/repository/panel', 'feature/*')).toBe(true);
lib/github/githubRepository.test.ts:125:describe('the addresses of a connected repository', () => {
lib/github/githubRepository.test.ts:126:    it('are all built from the repository itself, so a room can only ever link into it', () => {
lib/github/githubRepository.test.ts:127:        expect(createGithubRepositoryUrl(PROMPTBOOK_REPOSITORY)).toBe('https://github.com/hejny/promptbook');
lib/github/githubRepository.test.ts:133:    it('follow the branch of the workshop, or the branch of the repository itself when it follows none', () => {
lib/github/githubCommitApi.ts:1:import { extractGithubBranchName, type GithubBranch } from '@/lib/github/githubRepository';
lib/github/githubCommitFeed.ts:4: * One commit of a repository, as far as the published feed of its commits describes it
lib/github/githubCommitFeed.ts:6: * Note: The address of the commit is deliberately not read from the feed. It is built from the repository and this
lib/github/githubCommitFeed.ts:7: *       identifier instead, so a room can only ever link into the very repository its administrator connected.
lib/github/githubCommitFeed.ts:127: * Reads the commits of a repository out of its published feed
lib/github/githubCommitFeed.ts:130: * @returns commits of the repository, newest first
lib/legal/termsAndConditionsDocuments.tsx:192:                    'The membership page describes the free community and the current paid membership. Live online AI webinars remain free; paid membership primarily gives access to recordings, materials, and additional content.',
lib/legal/termsAndConditionsDocuments.tsx:196:                    'For operational, technical, security, legal, economic, or content-related reasons, we may change the composition of plans or benefits or replace an individual benefit. We notify a member of a material change by e-mail at least 30 days in advance, and the member may terminate without penalty before it takes effect. Where legal, security, or technical reasons require immediate action, we may make the change or suspend the service immediately and give notice without undue delay.',
lib/legal/termsAndConditionsDocuments.tsx:197:                    'We may terminate the contract without stating a reason on 30 days’ notice. For serious legal, security, or technical reasons, or a material breach of these terms, we may terminate the contract or suspend membership immediately.',
lib/legal/termsAndConditionsDocuments.tsx:218:                    'The content of the website, the workshop materials, texts, graphics, and software are protected by copyright and belong to the operator or to its partners.',
lib/legal/termsAndConditionsDocuments.tsx:219:                    'You may use the materials you receive from us for your own needs and for the needs of your company. You must not distribute, sell, or build your own training on them without our written consent.',
lib/contacts/serializeContactsAsCsv.ts:28: * Serialize the admin's grouped contact projection, including source records that do not live in the Contact table.
lib/github/githubCommitFeed.test.ts:11:    <title>Add the repository panel of the room</title>
lib/github/githubCommitFeed.test.ts:21:    <title>Read the commits of a repository &amp; show them</title>
lib/github/githubCommitFeed.test.ts:33:describe('the published commits of a repository', () => {
lib/github/githubCommitFeed.test.ts:48:            message: 'Read the commits of a repository & show them',
lib/github/fetchGithubRepository.ts:8:    type GithubRepository,
lib/github/fetchGithubRepository.ts:9:} from '@/lib/github/githubRepository';
lib/github/fetchGithubRepository.ts:18:const GITHUB_USER_AGENT = 'Promptbook Workshop Repository/1.0';
lib/github/fetchGithubRepository.ts:23:export type FetchGithubRepositoryOptions = {
lib/github/fetchGithubRepository.ts:24:    readonly repository: GithubRepository;
lib/github/fetchGithubRepository.ts:32:export type FetchGithubCommitsOptions = FetchGithubRepositoryOptions & {
lib/github/fetchGithubRepository.ts:34:     * The branch whose commits are read, `null` for the branch the repository is read at by default
lib/github/fetchGithubRepository.ts:39:export type FetchGithubBranchCommitsOptions = FetchGithubRepositoryOptions & {
lib/github/fetchGithubRepository.ts:65: * Reads the newest commits of a repository from the feed GitHub publishes them in
lib/github/fetchGithubRepository.ts:68: *       handful of newest commits which say how a project is advancing.
lib/github/fetchGithubRepository.ts:70: * @returns commits of the repository, newest first, an empty list when the feed could not be read
lib/github/fetchGithubRepository.ts:72:export async function fetchGithubRepositoryCommits(
lib/github/fetchGithubRepository.ts:76:        url: createGithubCommitFeedUrl(options.repository, options.branch),
lib/github/fetchGithubRepository.ts:86: * Reads every branch of a repository through the keyless public API, keeping each page cached independently. The
lib/github/fetchGithubRepository.ts:89:export async function fetchGithubRepositoryBranches(
lib/github/fetchGithubRepository.ts:90:    options: FetchGithubRepositoryOptions,
lib/github/fetchGithubRepository.ts:96:            createGithubApiBranchesUrl(options.repository, page, GITHUB_API_BRANCH_PAGE_SIZE),
lib/github/fetchGithubRepository.ts:121:export async function fetchGithubRepositoryBranchCommits(
lib/github/fetchGithubRepository.ts:126:            options.repository,
lib/github/fetchGithubRepository.ts:139: * repository has many active branches. Each URL is still cached by `fetchCachedText`, so participants do not multiply
lib/github/fetchGithubRepository.ts:142:export async function fetchGithubRepositoryBranchHistories(
lib/github/fetchGithubRepository.ts:143:    options: FetchGithubRepositoryOptions & { readonly branches: readonly GithubBranch[] },
lib/github/fetchGithubRepository.ts:160:                commits: await fetchGithubRepositoryBranchCommits({
lib/github/fetchGithubRepository.ts:161:                    repository: options.repository,
lib/github/githubRepository.ts:2: * A repository is named by the account which owns it and by its own name, exactly as GitHub writes it in a URL
lib/github/githubRepository.ts:4: * Note: This is the whole identity of a repository. Every address of it — the page, the commits, the feed of them and
lib/github/githubRepository.ts:7:export type GithubRepository = {
lib/github/githubRepository.ts:15: * Note: `null` keeps the original meaning of following the repository's default branch. A string or non-empty array
lib/github/githubRepository.ts:27: * How GitHub itself writes an account name and a repository name
lib/github/githubRepository.ts:29: * Note: An account is letters, digits and hyphens, a repository additionally a dot and an underscore. A repository
lib/github/githubRepository.ts:30: *       named `.` or `..` would be a path rather than a repository, which is why a name has to carry at least one
lib/github/githubRepository.ts:37: * The branches of a repository which may be followed
lib/github/githubRepository.ts:39: * Note: A branch name may carry slashes, which is what makes `feature/repository-panel` one name rather than two, and
lib/github/githubRepository.ts:46:/** A branch pattern which follows every branch of a repository. */
lib/github/githubRepository.ts:55:function createGithubRepositoryOrNull(owner: string | undefined, name: string | undefined): GithubRepository | null {
lib/github/githubRepository.ts:56:    // Note: The address `git clone` is given ends with `.git`, which is not a part of the name of the repository.
lib/github/githubRepository.ts:74: * Reads the repository an administrator wrote, however they wrote it
lib/github/githubRepository.ts:76: * Note: `owner/name`, the address of the repository page, the address a branch or a file of it is read at, and the
lib/github/githubRepository.ts:77: *       address `git clone` was given all name one and the same repository, so all of them are accepted and read as
lib/github/githubRepository.ts:78: *       that repository. Anything else is refused rather than stored as a repository which does not exist.
lib/github/githubRepository.ts:80: * @returns the repository, `null` when the value names none
lib/github/githubRepository.ts:82:export function extractGithubRepository(value: string | null | undefined): GithubRepository | null {
lib/github/githubRepository.ts:93:        return createGithubRepositoryOrNull(owner, name);
lib/github/githubRepository.ts:98:        return remainingSegments.length > 0 ? null : createGithubRepositoryOrNull(owner, name);
lib/github/githubRepository.ts:112:    // Note: Whatever leads deeper into the repository — a branch, a file, an issue — still names this very repository,
lib/github/githubRepository.ts:113:    //       so it is read as the repository rather than refused.
lib/github/githubRepository.ts:115:    return createGithubRepositoryOrNull(owner, name);
lib/github/githubRepository.ts:262: * Writes a repository the way GitHub names it, for example `hejny/promptbook`
lib/github/githubRepository.ts:264:export function formatGithubRepositoryName({ owner, name }: GithubRepository): string {
lib/github/githubRepository.ts:276:export function createGithubRepositoryUrl(repository: GithubRepository): string {
lib/github/githubRepository.ts:277:    return `https://github.com/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}`;
lib/github/githubRepository.ts:281: * The page listing the commits of a repository, of one branch of it when a branch is followed
lib/github/githubRepository.ts:283:export function createGithubCommitsUrl(repository: GithubRepository, branch: string | null): string {
lib/github/githubRepository.ts:284:    const commitsUrl = `${createGithubRepositoryUrl(repository)}/commits`;
lib/github/githubRepository.ts:291:export function createGithubCommitFeedUrl(repository: GithubRepository, branch: string | null): string {
lib/github/githubRepository.ts:292:    return `${createGithubCommitsUrl(repository, branch)}.atom`;
lib/github/githubRepository.ts:295:function createGithubApiRepositoryUrl(repository: GithubRepository): string {
lib/github/githubRepository.ts:296:    return `${GITHUB_API_URL}${GITHUB_API_REPOSITORY_PATH_PREFIX}/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}`;
lib/github/githubRepository.ts:300: * The keyless GitHub API address which lists the branches of a repository
lib/github/githubRepository.ts:302:export function createGithubApiBranchesUrl(repository: GithubRepository, page: number, pageSize: number): string {
lib/github/githubRepository.ts:303:    const url = new URL(`${createGithubApiRepositoryUrl(repository)}/branches`);
lib/github/githubRepository.ts:313:    repository: GithubRepository,
lib/github/githubRepository.ts:318:    const url = new URL(`${createGithubApiRepositoryUrl(repository)}/commits`);
lib/github/githubRepository.ts:326: * Links to the commits selected by a workshop, with a repository-wide page for more than one branch
lib/github/githubRepository.ts:329:    repository: GithubRepository,
lib/github/githubRepository.ts:334:        repository,
lib/github/githubRepository.ts:339:export function createGithubCommitUrl(repository: GithubRepository, commitSha: string): string {
lib/github/githubRepository.ts:340:    return `${createGithubRepositoryUrl(repository)}/commit/${encodeURIComponent(commitSha)}`;
lib/workshops/fetchWorkshopRepositoryProgress.test.ts:1:import type { GithubBranch } from '@/lib/github/githubRepository';
lib/workshops/fetchWorkshopRepositoryProgress.test.ts:3:import { fetchWorkshopRepositoryProgress } from '@/lib/workshops/fetchWorkshopRepositoryProgress';
lib/workshops/fetchWorkshopRepositoryProgress.test.ts:4:import type { WorkshopRepository } from '@/lib/workshops/workshopRepository';
lib/workshops/fetchWorkshopRepositoryProgress.test.ts:8:    fetchGithubRepositoryBranchesMock,
lib/workshops/fetchWorkshopRepositoryProgress.test.ts:9:    fetchGithubRepositoryBranchHistoriesMock,
lib/workshops/fetchWorkshopRepositoryProgress.test.ts:10:    fetchGithubRepositoryCommitsMock,
lib/workshops/fetchWorkshopRepositoryProgress.test.ts:12:    fetchGithubRepositoryBranchesMock: vi.fn(),
lib/workshops/fetchWorkshopRepositoryProgress.test.ts:13:    fetchGithubRepositoryBranchHistoriesMock: vi.fn(),
lib/workshops/fetchWorkshopRepositoryProgress.test.ts:14:    fetchGithubRepositoryCommitsMock: vi.fn(),
lib/workshops/fetchWorkshopRepositoryProgress.test.ts:17:vi.mock('@/lib/github/fetchGithubRepository', () => ({
lib/workshops/fetchWorkshopRepositoryProgress.test.ts:18:    fetchGithubRepositoryBranches: fetchGithubRepositoryBranchesMock,
lib/workshops/fetchWorkshopRepositoryProgress.test.ts:19:    fetchGithubRepositoryBranchHistories: fetchGithubRepositoryBranchHistoriesMock,
lib/workshops/fetchWorkshopRepositoryProgress.test.ts:20:    fetchGithubRepositoryCommits: fetchGithubRepositoryCommitsMock,
lib/workshops/fetchWorkshopRepositoryProgress.test.ts:41:function createRepository(branch: WorkshopRepository['branch']): WorkshopRepository {
lib/workshops/fetchWorkshopRepositoryProgress.test.ts:45:describe('workshop repository progress branch patterns', () => {
lib/workshops/fetchWorkshopRepositoryProgress.test.ts:47:        fetchGithubRepositoryBranchesMock.mockReset();
lib/workshops/fetchWorkshopRepositoryProgress.test.ts:48:        fetchGithubRepositoryBranchHistoriesMock.mockReset();
lib/workshops/fetchWorkshopRepositoryProgress.test.ts:49:        fetchGithubRepositoryCommitsMock.mockReset();
lib/workshops/fetchWorkshopRepositoryProgress.test.ts:50:        fetchGithubRepositoryBranchesMock.mockResolvedValue(AVAILABLE_BRANCHES);
lib/workshops/fetchWorkshopRepositoryProgress.test.ts:51:        fetchGithubRepositoryBranchHistoriesMock.mockImplementation(
lib/workshops/fetchWorkshopRepositoryProgress.test.ts:58:        const progress = await fetchWorkshopRepositoryProgress(createRepository(['main', 'client-*', 'feature/*']));
lib/workshops/fetchWorkshopRepositoryProgress.test.ts:60:        expect(fetchGithubRepositoryBranchesMock).toHaveBeenCalledOnce();
lib/workshops/fetchWorkshopRepositoryProgress.test.ts:61:        expect(fetchGithubRepositoryBranchHistoriesMock).toHaveBeenCalledWith(
lib/workshops/fetchWorkshopRepositoryProgress.test.ts:80:        await fetchWorkshopRepositoryProgress(createRepository('*'));
lib/workshops/fetchWorkshopRepositoryProgress.test.ts:82:        expect(fetchGithubRepositoryBranchHistoriesMock).toHaveBeenCalledWith(
lib/workshops/fetchWorkshopRepositoryProgress.test.ts:85:        expect(fetchGithubRepositoryCommitsMock).not.toHaveBeenCalled();
app/cs/komunita/projects/page.tsx:1:import { CommunityProjectsListingPage } from '@/businesses/community/projects/CommunityProjectsListingPage';
app/cs/komunita/projects/page.tsx:5:    path: '/cs/komunita/projects',
app/api/admin/workshops/[workshopId]/content/route.ts:12:import { ensureWorkshopMaterialShortLinks } from '@/lib/workshops/workshopMaterialLinks';
app/api/admin/workshops/[workshopId]/content/route.ts:56:    const materialShortLinkErrorMessage = await ensureWorkshopMaterialShortLinks(supabase, {
app/api/admin/workshops/[workshopId]/content/route.ts:62:    if (materialShortLinkErrorMessage !== null) {
app/api/admin/workshops/[workshopId]/content/route.ts:65:        console.error('Failed to prepare short links for workshop material:', materialShortLinkErrorMessage);
app/cs/komunita/projects/[projectId]/page.tsx:1:import { CommunityProjectDiscussionPage } from '@/businesses/community/projects/CommunityProjectDiscussionPage';
app/cs/komunita/projects/[projectId]/page.tsx:3:import { loadCommunityProjectById } from '@/lib/community-projects/communityProjectDatabase';
app/cs/komunita/projects/[projectId]/page.tsx:4:import { communityProjectIdSchema } from '@/lib/community-projects/communityProjectSchemas';
app/cs/komunita/projects/[projectId]/page.tsx:8:    readonly params: Promise<{ readonly projectId: string }>;
app/cs/komunita/projects/[projectId]/page.tsx:14:    const { projectId } = await params;
app/cs/komunita/projects/[projectId]/page.tsx:15:    if (!communityProjectIdSchema.safeParse(projectId).success) {
app/cs/komunita/projects/[projectId]/page.tsx:24:    const { project } = await loadCommunityProjectById(supabase, projectId, null);
app/cs/komunita/projects/[projectId]/page.tsx:25:    if (project === null) {
app/cs/komunita/projects/[projectId]/page.tsx:29:    return <CommunityProjectDiscussionPage project={project} />;
app/api/admin/workshops/[workshopId]/content/[contentId]/route.ts:12:import { ensureWorkshopMaterialShortLinks } from '@/lib/workshops/workshopMaterialLinks';
app/api/admin/workshops/[workshopId]/content/[contentId]/route.ts:68:    const materialShortLinkErrorMessage = await ensureWorkshopMaterialShortLinks(workshopResult.supabase, {
app/api/admin/workshops/[workshopId]/content/[contentId]/route.ts:74:    if (materialShortLinkErrorMessage !== null) {
app/api/admin/workshops/[workshopId]/content/[contentId]/route.ts:75:        console.error('Failed to prepare short links for workshop material:', materialShortLinkErrorMessage);
lib/community-projects/communityProjectPreview.test.ts:1:import { extractCommunityProjectPreview } from '@/lib/community-projects/communityProjectPreview';
lib/community-projects/communityProjectPreview.test.ts:2:import { normalizeCommunityProjectUrl } from '@/lib/community-projects/communityProjectUrl';
lib/community-projects/communityProjectPreview.test.ts:5:describe('community project preview metadata', () => {
lib/community-projects/communityProjectPreview.test.ts:6:    it('uses Open Graph title, description, and a relative image for the project card', () => {
lib/community-projects/communityProjectPreview.test.ts:13:                '<meta property="og:image" content="/images/project-card.png">',
lib/community-projects/communityProjectPreview.test.ts:17:            'https://example.com/projects/one?source=community#details',
lib/community-projects/communityProjectPreview.test.ts:21:            url: 'https://example.com/projects/one?source=community',
lib/community-projects/communityProjectPreview.test.ts:24:            previewImageUrl: 'https://example.com/images/project-card.png',
lib/community-projects/communityProjectPreview.test.ts:42:describe('community project URL normalization', () => {
lib/shortener/shortcodeLinkAdHoc.ts:22: * deliberately server-only: public material rendering may request a link, but
lib/community-projects/communityProjectSchemas.ts:1:import { isCommunityProjectUrl } from '@/lib/community-projects/communityProjectUrl';
lib/community-projects/communityProjectSchemas.ts:5:} from '@/lib/community-projects/communityProjectTypes';
lib/community-projects/communityProjectSchemas.ts:36: * A pending project is resolved into one final moderation decision, mirroring the decisions available for chat
lib/workshops/workshopRepositoryMonitor.test.ts:1:import type { WorkshopRepository } from '@/lib/workshops/workshopRepository';
lib/workshops/workshopRepositoryMonitor.test.ts:2:import type { WorkshopRepositoryProgress } from '@/lib/workshops/workshopRepositoryProgress';
lib/workshops/workshopRepositoryMonitor.test.ts:6:const { fetchWorkshopRepositoryProgressMock, broadcastWorkshopEventMock } = vi.hoisted(() => ({
lib/workshops/workshopRepositoryMonitor.test.ts:7:    fetchWorkshopRepositoryProgressMock: vi.fn(),
lib/workshops/workshopRepositoryMonitor.test.ts:11:vi.mock('@/lib/workshops/fetchWorkshopRepositoryProgress', () => ({
lib/workshops/workshopRepositoryMonitor.test.ts:12:    fetchWorkshopRepositoryProgress: fetchWorkshopRepositoryProgressMock,
lib/workshops/workshopRepositoryMonitor.test.ts:18:import { watchWorkshopRepository } from '@/lib/workshops/workshopRepositoryMonitor';
lib/workshops/workshopRepositoryMonitor.test.ts:20:const REPOSITORY: WorkshopRepository = {
lib/workshops/workshopRepositoryMonitor.test.ts:27:const REPOSITORY_WITH_NOTIFICATIONS: WorkshopRepository = {
lib/workshops/workshopRepositoryMonitor.test.ts:32:const OLD_PROGRESS: WorkshopRepositoryProgress = {
lib/workshops/workshopRepositoryMonitor.test.ts:43:const NEW_PROGRESS: WorkshopRepositoryProgress = {
lib/workshops/workshopRepositoryMonitor.test.ts:59:describe('workshop repository monitor', () => {
lib/workshops/workshopRepositoryMonitor.test.ts:63:        fetchWorkshopRepositoryProgressMock.mockReset();
lib/workshops/workshopRepositoryMonitor.test.ts:72:    it('shares one repository read between rooms during the cache window', async () => {
lib/workshops/workshopRepositoryMonitor.test.ts:73:        fetchWorkshopRepositoryProgressMock.mockResolvedValue(OLD_PROGRESS);
lib/workshops/workshopRepositoryMonitor.test.ts:76:            watchWorkshopRepository({ repository: REPOSITORY, room: createRoom('first-room'), supabase: {} as never }),
lib/workshops/workshopRepositoryMonitor.test.ts:77:            watchWorkshopRepository({ repository: REPOSITORY, room: createRoom('second-room'), supabase: {} as never }),
lib/workshops/workshopRepositoryMonitor.test.ts:80:        expect(fetchWorkshopRepositoryProgressMock).toHaveBeenCalledOnce();
lib/workshops/workshopRepositoryMonitor.test.ts:83:        await watchWorkshopRepository({ repository: REPOSITORY, room: createRoom('first-room'), supabase: {} as never });
lib/workshops/workshopRepositoryMonitor.test.ts:84:        expect(fetchWorkshopRepositoryProgressMock).toHaveBeenCalledOnce();
lib/workshops/workshopRepositoryMonitor.test.ts:88:        fetchWorkshopRepositoryProgressMock.mockResolvedValueOnce(OLD_PROGRESS).mockResolvedValueOnce(NEW_PROGRESS);
lib/workshops/workshopRepositoryMonitor.test.ts:90:        await watchWorkshopRepository({
lib/workshops/workshopRepositoryMonitor.test.ts:91:            repository: REPOSITORY_WITH_NOTIFICATIONS,
lib/workshops/workshopRepositoryMonitor.test.ts:96:        await watchWorkshopRepository({
lib/workshops/workshopRepositoryMonitor.test.ts:97:            repository: REPOSITORY_WITH_NOTIFICATIONS,
lib/workshops/workshopRepositoryMonitor.test.ts:102:        expect(fetchWorkshopRepositoryProgressMock).toHaveBeenCalledTimes(2);
lib/workshops/workshopRepositoryMonitor.test.ts:108:            { kind: 'repository-commit', commit: NEW_PROGRESS.commits[0] },
lib/workshops/workshopRepositoryMonitor.test.ts:114:            { kind: 'repository-commit', commit: NEW_PROGRESS.commits[0] },
lib/workshops/workshopRepositoryProgress.ts:2:import type { GithubBranch } from '@/lib/github/githubRepository';
lib/workshops/workshopRepositoryProgress.ts:4:export type WorkshopRepositoryCommitListener = (commit: GithubCommit) => void;
lib/workshops/workshopRepositoryProgress.ts:9:export type SubscribeToWorkshopRepositoryCommits = (listener: WorkshopRepositoryCommitListener) => () => void;
lib/workshops/workshopRepositoryProgress.ts:11:export type WorkshopRepositoryBranch = GithubBranch;
lib/workshops/workshopRepositoryProgress.ts:14: * The commits of the project of a workshop, as its public feed publishes them
lib/workshops/workshopRepositoryProgress.ts:17: *       repository feed could not be read at all and the room says so instead of claiming that nothing was committed.
lib/workshops/workshopRepositoryProgress.ts:19:export type WorkshopRepositoryProgress = {
lib/workshops/workshopRepositoryProgress.ts:26:    readonly branches?: readonly WorkshopRepositoryBranch[];
lib/workshops/workshopRepositoryProgress.ts:29:export type WorkshopRepositoryBranchHistory = {
lib/workshops/workshopRepositoryProgress.ts:30:    readonly branch: WorkshopRepositoryBranch;
lib/workshops/workshopRepositoryProgress.ts:50:export function mergeWorkshopRepositoryBranchHistories(
lib/workshops/workshopRepositoryProgress.ts:51:    histories: readonly WorkshopRepositoryBranchHistory[],
lib/workshops/workshopRepositoryProgress.ts:52:): { readonly commits: readonly GithubCommit[]; readonly branches: readonly WorkshopRepositoryBranch[] } {
lib/workshops/workshopRepositoryProgress.ts:77:export function createWorkshopRepositoryBranch(
lib/workshops/workshopRepositoryProgress.ts:80:): WorkshopRepositoryBranch {
lib/workshops/workshopRepositoryProgress.ts:85: * The commits which arrived since the room last read the repository
lib/workshops/workshopRepositoryProgress.ts:90:export function selectNewWorkshopRepositoryCommitShas(
lib/workshops/workshopRepositoryProgress.ts:94:    return selectNewWorkshopRepositoryCommits(knownCommitShas, commits).map((commit) => commit.sha);
lib/workshops/workshopRepositoryProgress.ts:98: * Selects the complete commits which were not in the room's previous repository answer
lib/workshops/workshopRepositoryProgress.ts:100:export function selectNewWorkshopRepositoryCommits(
lib/community-projects/communityProjectModeration.ts:1:import { COMMUNITY_PROJECT_TABLE_NAME } from '@/lib/community-projects/communityProjectConstants';
lib/community-projects/communityProjectModeration.ts:2:import type { CommunityProjectModerationStatus } from '@/lib/community-projects/communityProjectTypes';
lib/community-projects/communityProjectModeration.ts:6:    readonly projectId: string;
lib/community-projects/communityProjectModeration.ts:16: * Writes one final approval decision for a community project. The community-room route and the administration use
lib/community-projects/communityProjectModeration.ts:21:    projectId: string,
lib/community-projects/communityProjectModeration.ts:23:): Promise<{ readonly project: ModeratedCommunityProject | null; readonly errorMessage: string | null }> {
lib/community-projects/communityProjectModeration.ts:27:        .eq('id', projectId)
lib/community-projects/communityProjectModeration.ts:32:        return { project: null, errorMessage: error.message };
lib/community-projects/communityProjectModeration.ts:35:        return { project: null, errorMessage: null };
lib/community-projects/communityProjectModeration.ts:38:    const project = data as ModeratedCommunityProjectRow;
lib/community-projects/communityProjectModeration.ts:39:    return { project: { projectId: project.id, status: project.status }, errorMessage: null };
lib/workshops/workshopRepository.test.ts:1:import { createWorkshopRepositoryOrNull } from '@/lib/workshops/workshopRepository';
lib/workshops/workshopRepository.test.ts:4:describe('the stored project of a workshop', () => {
lib/workshops/workshopRepository.test.ts:5:    it('is read as the repository, the branch which is followed, and where the project runs', () => {
lib/workshops/workshopRepository.test.ts:7:            createWorkshopRepositoryOrNull({
lib/workshops/workshopRepository.test.ts:8:                repository: 'hejny/promptbook',
lib/workshops/workshopRepository.test.ts:22:            createWorkshopRepositoryOrNull({
lib/workshops/workshopRepository.test.ts:23:                repository: 'hejny/promptbook',
lib/workshops/workshopRepository.test.ts:34:            createWorkshopRepositoryOrNull({ repository: 'hejny/promptbook', branch: [], deploymentUrl: null }),
lib/workshops/workshopRepository.test.ts:38:    it('is no project at all for a room which is about none', () => {
lib/workshops/workshopRepository.test.ts:40:            createWorkshopRepositoryOrNull({ repository: null, branch: null, deploymentUrl: null }),
lib/workshops/workshopRepository.test.ts:44:    it('is no project when what is stored names no repository, whatever else is stored beside it', () => {
lib/workshops/workshopRepository.test.ts:46:            createWorkshopRepositoryOrNull({
lib/workshops/workshopRepository.test.ts:47:                repository: 'not a repository',
lib/workshops/workshopRepository.test.ts:54:    it('keeps the repository while leaving out a branch or a deployment which cannot be read', () => {
lib/workshops/workshopRepository.test.ts:56:            createWorkshopRepositoryOrNull({
lib/workshops/workshopRepository.test.ts:57:                repository: 'https://github.com/hejny/promptbook',
lib/community-projects/communityProjectConstants.ts:1:export const COMMUNITY_PROJECT_TABLE_NAME = 'community_projects';
lib/community-projects/communityProjectConstants.ts:2:export const COMMUNITY_PROJECT_VOTE_TABLE_NAME = 'community_project_votes';
lib/community-projects/communityProjectConstants.ts:3:export const COMMUNITY_PROJECT_DISCUSSION_PARTICIPANT_TABLE_NAME = 'community_project_discussion_participants';
lib/community-projects/communityProjectTypes.ts:2: * A member's one possible reaction to a shared project. Repeating the same action removes it, while choosing the
lib/community-projects/communityProjectTypes.ts:10: * A decision a moderator or an administrator may make about a project. The database defaults a new project to
lib/community-projects/communityProjectTypes.ts:36: * The card-shaped public projection of a project. It intentionally carries no e-mail address or internal discussion
lib/community-projects/communityProjectDatabase.ts:4:} from '@/lib/community-projects/communityProjectConstants';
lib/community-projects/communityProjectDatabase.ts:9:} from '@/lib/community-projects/communityProjectTypes';
lib/community-projects/communityProjectDatabase.ts:41:    readonly project_id: string;
lib/community-projects/communityProjectDatabase.ts:55:function getProjectIdChunks(projectIds: readonly string[]): readonly string[][] {
lib/community-projects/communityProjectDatabase.ts:57:    for (let fromIndex = 0; fromIndex < projectIds.length; fromIndex += COMMUNITY_PROJECT_SUPPLEMENTAL_QUERY_PAGE_SIZE) {
lib/community-projects/communityProjectDatabase.ts:58:        chunks.push(projectIds.slice(fromIndex, fromIndex + COMMUNITY_PROJECT_SUPPLEMENTAL_QUERY_PAGE_SIZE));
lib/community-projects/communityProjectDatabase.ts:65:    project: CommunityProjectRow,
lib/community-projects/communityProjectDatabase.ts:68:    if (project.status === 'approved') {
lib/community-projects/communityProjectDatabase.ts:73:        project.status === 'pending' &&
lib/community-projects/communityProjectDatabase.ts:75:        (project.author_community_participant_id === communityParticipant.id ||
lib/community-projects/communityProjectDatabase.ts:116:        'community projects',
lib/community-projects/communityProjectDatabase.ts:135:    // queue. They are kept separate from the compact approved-card limit, so a draft never hides a shared project.
lib/community-projects/communityProjectDatabase.ts:175:    projectIds: readonly string[],
lib/community-projects/communityProjectDatabase.ts:179:    if (communityParticipantId === null || projectIds.length === 0) {
lib/community-projects/communityProjectDatabase.ts:183:    for (const projectIdChunk of getProjectIdChunks(projectIds)) {
lib/community-projects/communityProjectDatabase.ts:186:            .select('project_id, vote')
lib/community-projects/communityProjectDatabase.ts:188:            .in('project_id', projectIdChunk);
lib/community-projects/communityProjectDatabase.ts:193:        ((data ?? []) as readonly CommunityProjectVoteRow[]).forEach((projectVote) => {
lib/community-projects/communityProjectDatabase.ts:194:            const vote = getCommunityProjectVoteFromDatabaseValue(projectVote.vote);
lib/community-projects/communityProjectDatabase.ts:196:                voteByProjectId.set(projectVote.project_id, vote);
lib/community-projects/communityProjectDatabase.ts:214:            .eq('room_kind', 'project');
lib/community-projects/communityProjectDatabase.ts:229:    projectRows: readonly CommunityProjectRow[],
lib/community-projects/communityProjectDatabase.ts:231:): Promise<{ readonly projects: readonly CommunityProject[] | null; readonly errorMessage: string | null }> {
lib/community-projects/communityProjectDatabase.ts:232:    if (projectRows.length === 0) {
lib/community-projects/communityProjectDatabase.ts:233:        return { projects: [], errorMessage: null };
lib/community-projects/communityProjectDatabase.ts:239:            projectRows.map((projectRow) => projectRow.author_community_participant_id),
lib/community-projects/communityProjectDatabase.ts:243:            projectRows.map((projectRow) => projectRow.id),
lib/community-projects/communityProjectDatabase.ts:248:            projectRows.map((projectRow) => projectRow.discussion_workshop_id),
lib/community-projects/communityProjectDatabase.ts:253:        return { projects: null, errorMessage };

exec
/bin/zsh -lc "rg --files | rg '([Pp]articipant|[Ww]orkshop.*[Rr]oom|[Rr]oom.*[Mm]aterial|[Mm]aterial)' | sort" in /Users/hejny/work/aldaron
 succeeded in 0ms:
app/ai-supervize-mini/participant/page.tsx
app/api/admin/workshops/[workshopId]/participants/[participantId]/route.ts
app/api/admin/workshops/[workshopId]/participants/[participantId]/timeline/route.ts
app/api/admin/workshops/[workshopId]/participants/route.test.ts
app/api/admin/workshops/[workshopId]/participants/route.ts
app/api/workshops/[workshopSlug]/participant/route.ts
app/api/workshops/[workshopSlug]/participants/[participantId]/route.ts
app/cs/online-workshop/participant/opengraph-image.tsx
app/cs/online-workshop/participant/page.tsx
businesses/ai-supervize-mini/_AiSupervizeMiniParticipantPage.tsx
businesses/community/CommunityParticipantPage.test.tsx
businesses/community/CommunityParticipantPage.tsx
businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.tsx
businesses/online-workshop/participant/WorkshopCalendarInvitation.test.tsx
businesses/online-workshop/participant/WorkshopCalendarInvitation.tsx
businesses/online-workshop/participant/WorkshopChat.test.tsx
businesses/online-workshop/participant/WorkshopChat.tsx
businesses/online-workshop/participant/WorkshopChatComposer.tsx
businesses/online-workshop/participant/WorkshopChatMessage.tsx
businesses/online-workshop/participant/WorkshopChatMessageModeration.tsx
businesses/online-workshop/participant/WorkshopChatThread.tsx
businesses/online-workshop/participant/WorkshopConnectionForm.tsx
businesses/online-workshop/participant/WorkshopContent.test.tsx
businesses/online-workshop/participant/WorkshopContent.tsx
businesses/online-workshop/participant/WorkshopFeedback.test.tsx
businesses/online-workshop/participant/WorkshopFeedback.tsx
businesses/online-workshop/participant/WorkshopPaidMembersVideoNotice.tsx
businesses/online-workshop/participant/WorkshopParticipantBadge.test.tsx
businesses/online-workshop/participant/WorkshopParticipantBadge.tsx
businesses/online-workshop/participant/WorkshopPolls.test.tsx
businesses/online-workshop/participant/WorkshopPolls.tsx
businesses/online-workshop/participant/WorkshopReactions.test.tsx
businesses/online-workshop/participant/WorkshopReactions.tsx
businesses/online-workshop/participant/WorkshopRepositoryCommitCard.tsx
businesses/online-workshop/participant/WorkshopRepositoryCommitNotification.tsx
businesses/online-workshop/participant/WorkshopRepositoryGraph.tsx
businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
businesses/online-workshop/participant/WorkshopServerConnectionStatus.tsx
businesses/online-workshop/participant/WorkshopStage.test.tsx
businesses/online-workshop/participant/WorkshopStage.tsx
businesses/online-workshop/participant/WorkshopStageComment.tsx
businesses/online-workshop/participant/WorkshopWatchingBadge.test.tsx
businesses/online-workshop/participant/WorkshopWatchingBadge.tsx
businesses/online-workshop/participant/WorkshopWrapUp.tsx
businesses/online-workshop/participant/useWorkshopAttendanceTracker.ts
businesses/online-workshop/participant/useWorkshopParticipant.test.tsx
businesses/online-workshop/participant/useWorkshopParticipant.ts
businesses/online-workshop/participant/useWorkshopParticipantOfflineSupport.ts
businesses/online-workshop/participant/useWorkshopReactionAnimations.ts
businesses/online-workshop/participant/useWorkshopRepositoryCommitNotification.ts
businesses/online-workshop/participant/useWorkshopRepositoryProgress.ts
businesses/online-workshop/participant/workshopPanelAppearance.ts
businesses/online-workshop/participant/workshopParticipantApi.ts
businesses/online-workshop/participant/workshopParticipantStateCache.test.ts
businesses/online-workshop/participant/workshopParticipantStateCache.ts
businesses/online-workshop/participant/workshopRoomBadge.ts
businesses/online-workshop/participant/workshopWatchingCountLabel.test.ts
businesses/online-workshop/participant/workshopWatchingCountLabel.ts
businesses/workshop-admin/WorkshopParticipantFilters.tsx
businesses/workshop-admin/WorkshopParticipantList.tsx
businesses/workshop-admin/WorkshopParticipantPagination.tsx
businesses/workshop-admin/WorkshopParticipantTimeline.test.tsx
businesses/workshop-admin/WorkshopParticipantTimeline.tsx
lib/workshops/workshopAdminParticipantQuery.test.ts
lib/workshops/workshopAdminParticipantQuery.ts
lib/workshops/workshopMaterialLinks.test.ts
lib/workshops/workshopMaterialLinks.ts
lib/workshops/workshopParticipantEmail.ts
lib/workshops/workshopParticipantFullname.ts
lib/workshops/workshopParticipantInteraction.ts
lib/workshops/workshopParticipantLink.test.ts
lib/workshops/workshopParticipantLink.ts
lib/workshops/workshopParticipantModeration.ts
lib/workshops/workshopParticipantRename.ts
migrations/2026-08-0700-workshop-admin-participant-counts.sql
migrations/2026-08-0800-workshop-admin-participant-page-ordering.sql
migrations/2026-08-1100-workshop-admin-participant-page-variable-conflict.sql
migrations/2026-08-1700-online-workshop-shortcode-material-links.sql
prompts/2026-08-0090-online-workshop-ai-participants-and-moderators.md
prompts/2026-08-0641-unslop-ai-supervize-mini-participant.md
prompts/2026-09-0000-payed-members-materials.md
prompts/2026-09-0090-komunita-as-special-material.md
prompts/2026-09-0100-repository-as-special-material.md
prompts/2026-09-0110-presentation-as-special-material.md
prompts/done/2026-07-0040-workshop-participant-page.md
prompts/done/2026-09-0060-allow-to-pick-workshop-from-waitingroom.md
prompts/prompts/screenshots/2026-07-0040-workshop-participant-page-1.png
prompts/prompts/screenshots/2026-07-0040-workshop-participant-page-2.png
prompts/prompts/screenshots/2026-07-0040-workshop-participant-page-3.png
prompts/prompts/screenshots/2026-07-0040-workshop-participant-page-4.png
prompts/prompts/screenshots/2026-07-0040-workshop-participant-page.png
prompts/prompts/screenshots/2026-09-0000-payed-members-materials.png
prompts/prompts/screenshots/2026-09-0060-allow-to-pick-workshop-from-waitingroom.png
prompts/prompts/screenshots/2026-09-0090-komunita-as-special-material.png
prompts/prompts/screenshots/2026-09-0100-repository-as-special-material-1.png
prompts/prompts/screenshots/2026-09-0100-repository-as-special-material.png
prompts/prompts/screenshots/2026-09-0110-presentation-as-special-material.png
prompts/traces/2026-09-0090-komunita-as-special-material.md
public/workshop-participant-service-worker.js

exec
/bin/zsh -lc "sed -n '1,260p' businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.tsx && sed -n '1,260p' businesses/online-workshop/participant/WorkshopContent.tsx && sed -n '1,260p' businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx && sed -n '1,220p' lib/workshops/workshopMaterialLinks.ts && sed -n '1,220p' prompts/2026-09-0100-repository-as-special-material.md && sed -n '1,220p' prompts/2026-09-0090-komunita-as-special-material.md" in /Users/hejny/work/aldaron
 succeeded in 0ms:
'use client';

import {
    ONLINE_WORKSHOP_HOST_FULLNAME,
    ONLINE_WORKSHOP_PARTICIPANT_PATH,
} from '@/businesses/online-workshop/config';
import { createOnlineWorkshopConnectionDetails } from '@/businesses/online-workshop/onlineWorkshopTerms';
import { OnlineWorkshopParticipantPage } from '@/businesses/online-workshop/participant/OnlineWorkshopParticipantPage';
import { OnlineWorkshopRoomTermPicker } from '@/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker';
import type { EventOccurrence } from '@/lib/events/eventOccurrence';
import { createWorkshopSelectionPath } from '@/lib/workshops/workshopParticipantLink';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';
import { useState } from 'react';

/**
 * How many terms it takes for a participant to be offered a choice at all
 *
 * Note: One term is no choice, and a room which offers a list of exactly the workshop it already describes would only
 *       ask a participant to confirm what they have been told.
 */
const MINIMAL_PICKED_ONLINE_WORKSHOP_COUNT = 2;

type OnlineWorkshopSelectedTermRoomProps = {
    /**
     * The term this address opened, which is the one a participant connects to unless they pick another
     */
    readonly openedWorkshop: WorkshopSummary;

    /**
     * Every published term of the online workshop, which is what a participant picks from
     */
    readonly workshops: readonly EventOccurrence[];

    /**
     * Moment the server built this page at, which places every offered term in time
     */
    readonly currentTime: string;
    readonly initialEmail: string;
    readonly initialFullname: string;
};

/**
 * Keeps the address of the room on the term which is really being entered, so reloading the waiting room or sharing
 * its address opens the workshop a participant picked rather than the one they were offered first.
 */
function rememberPickedWorkshopInAddress(workshopSlug: string): void {
    const roomPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.history.replaceState(window.history.state, '', createWorkshopSelectionPath(roomPath, workshopSlug));
}

/**
 * The room of one term of the online workshop, together with the choice of which term that is
 *
 * Note: The choice lives here rather than in the shared room, because only this business surface knows which terms
 *       belong to the online workshop. The room below is the very same audited participant room every other kind of
 *       event uses.
 */
export function OnlineWorkshopSelectedTermRoom({
    openedWorkshop,
    workshops,
    currentTime,
    initialEmail,
    initialFullname,
}: OnlineWorkshopSelectedTermRoomProps) {
    const [pickedWorkshopSlug, setPickedWorkshopSlug] = useState(openedWorkshop.slug);

    // Note: A term which is not among the published ones leaves the room exactly where the address put it, so an
    //       address opening a term this list does not carry still enters that very term.
    const selectedWorkshop =
        workshops.find((workshop) => workshop.slug === pickedWorkshopSlug) ?? openedWorkshop;
    const isChoiceOffered = workshops.length >= MINIMAL_PICKED_ONLINE_WORKSHOP_COUNT;

    const pickWorkshop = (workshop: EventOccurrence) => {
        setPickedWorkshopSlug(workshop.slug);
        rememberPickedWorkshopInAddress(workshop.slug);
    };

    return (
        <OnlineWorkshopParticipantPage
            workshopSlug={selectedWorkshop.slug}
            connectionDetails={createOnlineWorkshopConnectionDetails(selectedWorkshop)}
            calendarDetails={{
                hostFullname: ONLINE_WORKSHOP_HOST_FULLNAME,
                participantPath: ONLINE_WORKSHOP_PARTICIPANT_PATH,
            }}
            initialEmail={initialEmail}
            initialFullname={initialFullname}
            connectionTermPicker={
                isChoiceOffered ? (
                    <OnlineWorkshopRoomTermPicker
                        terms={workshops}
                        selectedTermSlug={selectedWorkshop.slug}
                        onSelectTerm={pickWorkshop}
                        currentTime={currentTime}
                    />
                ) : undefined
            }
        />
    );
}
'use client';

import { CommunityPaidMembersNotice } from '@/businesses/community/membership/CommunityPaidMembersNotice';
import { useCommunityMembershipPurchaseOffer } from '@/businesses/community/membership/useCommunityMembershipPurchaseOffer';
import { MarkdownContent } from '@/components/markdown-content';
import { PromptbookQrCode } from '@/components/promptbook-qr-code';
import type { WorkshopContentBlock, WorkshopContentPreview } from '@/lib/workshops/workshopTypes';
import { motion, useReducedMotion } from 'framer-motion';
import { Clock3, Crown, ExternalLink, Lock, Sparkles } from 'lucide-react';
import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * A participant-facing card which belongs in the material list without being an administrator-managed material.
 *
 * Note: A room can lead someone to a durable place such as the community without turning that link into content that
 *       is stored, timed, paid-only, or measured as an ordinary workshop material. Keeping these cards in the one
 *       material list still gives every participant the same predictable place to find them.
 */
export type WorkshopSpecialMaterial = {
    readonly id: string;
    readonly content: ReactNode;
};

type WorkshopContentProps = {
    readonly contentBlocks: readonly WorkshopContentBlock[];
    readonly nextContentUnlockAt: string | null;
    readonly newlyUnlockedContentBlockIds: ReadonlySet<string>;

    /**
     * The paid materials the room hides from the member reading it, by their titles alone. The materials themselves
     * never reach this component for such a member; this is only the place where the room names them and offers the
     * key.
     */
    readonly paidMembersOnlyContentPreviews: readonly WorkshopContentPreview[];

    /**
     * Cards which share the materials placement but have their own source and access rules.
     *
     * Note: The room which knows whether a card applies supplies it here. This component only owns the common list,
     *       so it cannot accidentally make a special material conditional on paid-material visibility.
     */
    readonly specialMaterials?: readonly WorkshopSpecialMaterial[];
    readonly title?: string;
};

type WorkshopMaterialBodyProps = {
    readonly contentBlock: WorkshopContentBlock;
};

type WorkshopMaterialLink = {
    readonly href: string;
    readonly label: string;
};

const CZECH_DATE_TIME_FORMAT = new Intl.DateTimeFormat('cs-CZ', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Prague',
});
const MATERIAL_CALL_TO_ACTION_LABEL = 'Otevřít materiál';
const MATERIAL_LINK_SELECTOR = 'a[href]:not([data-workshop-material-call-to-action])';
const MATERIAL_QR_CODE_SIZE = 144;

function configureMaterialLink(linkElement: HTMLAnchorElement): void {
    // The server has already replaced the href with a persisted short link.
    // This only preserves the existing new-tab behavior; it never observes or
    // reports a click, so copied and forwarded links use the same tracking path.
    linkElement.target = '_blank';
    linkElement.rel = 'noopener noreferrer';
}

function getWorkshopMaterialLinks(linkElements: readonly HTMLAnchorElement[]): readonly WorkshopMaterialLink[] {
    return linkElements.map((linkElement) => ({
        href: linkElement.href,
        label: linkElement.textContent?.trim() || MATERIAL_CALL_TO_ACTION_LABEL,
    }));
}

function areWorkshopMaterialLinkListsEqual(
    currentMaterialLinks: readonly WorkshopMaterialLink[],
    nextMaterialLinks: readonly WorkshopMaterialLink[],
): boolean {
    return currentMaterialLinks.length === nextMaterialLinks.length && currentMaterialLinks.every(
        (currentMaterialLink, index) =>
            currentMaterialLink.href === nextMaterialLinks[index]?.href &&
            currentMaterialLink.label === nextMaterialLinks[index]?.label,
    );
}

/**
 * Every QR code carries the persisted short link already present in a material. On a desktop it gives the person
 * reading the room the same tracked destination on their phone without sending mobile layouts through an extra panel.
 */
function WorkshopMaterialQrCodes({ materialLinks }: { readonly materialLinks: readonly WorkshopMaterialLink[] }) {
    return (
        <aside
            aria-label="QR kódy materiálů"
            className="hidden shrink-0 lg:flex lg:flex-col lg:items-center lg:gap-4"
        >
            {materialLinks.map((materialLink, index) => (
                <figure
                    key={`${materialLink.href}-${index}`}
                    aria-label={`QR kód materiálu: ${materialLink.label}`}
                    className="w-44"
                >
                    <PromptbookQrCode
                        value={materialLink.href}
                        size={MATERIAL_QR_CODE_SIZE}
                        className="mx-auto overflow-hidden rounded-xl bg-white shadow-lg shadow-cyan-300/10"
                    />
                    {materialLinks.length > 1 && (
                        <figcaption
                            className="mt-2 truncate text-center text-xs font-semibold leading-5 text-slate-400"
                            title={materialLink.label}
                        >
                            {materialLink.label}
                        </figcaption>
                    )}
                </figure>
            ))}
        </aside>
    );
}

function WorkshopMaterialBody({ contentBlock }: WorkshopMaterialBodyProps) {
    const materialBodyReference = useRef<HTMLDivElement>(null);
    const [materialLinks, setMaterialLinks] = useState<readonly WorkshopMaterialLink[]>([]);
    const singleMaterialLink = materialLinks.length === 1 ? materialLinks[0] : null;

    useEffect(() => {
        const materialBodyElement = materialBodyReference.current;
        if (materialBodyElement === null) {
            return;
        }

        const configureMaterialLinks = () => {
            const linkElements = Array.from(materialBodyElement.querySelectorAll<HTMLAnchorElement>(MATERIAL_LINK_SELECTOR));
            linkElements.forEach((linkElement) => {
                configureMaterialLink(linkElement);
            });

            const nextMaterialLinks = getWorkshopMaterialLinks(linkElements);
            setMaterialLinks((currentMaterialLinks) =>
                areWorkshopMaterialLinkListsEqual(currentMaterialLinks, nextMaterialLinks)
                    ? currentMaterialLinks
                    : nextMaterialLinks,
            );
        };

        configureMaterialLinks();
        const observer = new MutationObserver(configureMaterialLinks);
        observer.observe(materialBodyElement, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [contentBlock.bodyMarkdown]);

    return (
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-8">
            <div ref={materialBodyReference} className="min-w-0 break-words">
                <MarkdownContent
                    content={contentBlock.bodyMarkdown}
                    theme="DARK"
                    className="max-w-none leading-7 text-slate-200 [--chat-md-link-color:#f1f5f9] [&_a]:font-semibold [&_code]:break-words [&_code]:text-cyan-100 [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_img]:max-w-full [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto"
                />
                {singleMaterialLink && (
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                        <a
                            href={singleMaterialLink.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-workshop-material-call-to-action
                            aria-label={`${MATERIAL_CALL_TO_ACTION_LABEL}: ${singleMaterialLink.label}`}
                            className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-300/10 transition hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07151d]"
                        >
                            {MATERIAL_CALL_TO_ACTION_LABEL}
                            <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        </a>
                    </div>
                )}
            </div>
            {materialLinks.length > 0 && <WorkshopMaterialQrCodes materialLinks={materialLinks} />}
        </div>
    );
}

/**
 * Where the paid materials are, for the members who cannot see them. The materials themselves stay on the server;
 * this card only names them, says that they are here and opens the very same membership popup the badge in the header
 * opens.
 */
function WorkshopPaidMembersContentNotice({
    contentPreviews,
    onUnlockPaidMaterials,
}: {
    readonly contentPreviews: readonly WorkshopContentPreview[];
    readonly onUnlockPaidMaterials: () => void;
}) {
    // A material an administrator left untitled has nothing to tease with, so it keeps this card without being named
    // in it.
    const namedContentPreviews = contentPreviews.filter((contentPreview) => contentPreview.title.trim() !== '');

    return (
        <CommunityPaidMembersNotice
            title="Materiály pro placené členy"
            description="Na tomto místě jsou materiály dostupné jen pro placené členy komunity. Odemknete je měsíčním placeným členstvím."
            onUnlockPaidMembership={onUnlockPaidMaterials}
            unlockedLabel="Co odemknete"
            unlockedContent={
                namedContentPreviews.length === 0 ? undefined : (
                    <ul aria-label="Náhled materiálů pro placené členy" className="space-y-2">
                        {namedContentPreviews.map((contentPreview) => (
                            <li key={contentPreview.id} className="flex items-start gap-2">
                                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-200/70" aria-hidden="true" />
                                <span className="min-w-0 break-words text-sm font-semibold leading-6 text-amber-50">
                                    {contentPreview.title}
                                </span>
                            </li>
                        ))}
                    </ul>
                )
            }
        />
    );
}

export function WorkshopContent({
    contentBlocks,
    nextContentUnlockAt,
    newlyUnlockedContentBlockIds,
    paidMembersOnlyContentPreviews,
    specialMaterials = [],
    title = 'Materiály z workshopu',
}: WorkshopContentProps) {
    const isReducedMotionPreferred = useReducedMotion() === true;

    // Note: The purchase is only offered while a gate is configured and the member has not paid yet, which is exactly
    //       when the server keeps the paid materials hidden, so the notice and the hidden materials cannot disagree.
    const membershipPurchaseOffer = useCommunityMembershipPurchaseOffer();
    const isPaidMembersContentNoticeShown =
        paidMembersOnlyContentPreviews.length > 0 && membershipPurchaseOffer !== null;
    const isSpecialMaterialShown = specialMaterials.length > 0;

    if (
        contentBlocks.length === 0 &&
        nextContentUnlockAt === null &&
        !isPaidMembersContentNoticeShown &&
        !isSpecialMaterialShown
    ) {
        return null;
    }

    return (
        <section className="mt-8" aria-labelledby="workshop-materials-title">
            <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-300" />
                <h2 id="workshop-materials-title" className="text-xl font-bold text-white">
                    {title}
                </h2>
            </div>

            <div className="space-y-4">
'use client';

import { WorkshopRepositoryCommitCard } from '@/businesses/online-workshop/participant/WorkshopRepositoryCommitCard';
import { WorkshopRepositoryGraph } from '@/businesses/online-workshop/participant/WorkshopRepositoryGraph';
import type { WorkshopRepositoryProgressController } from '@/businesses/online-workshop/participant/useWorkshopRepositoryProgress';
import {
    createGithubCommitsUrlForBranchSelection,
    createGithubRepositoryUrl,
    formatGithubRepositoryName,
    getGithubBranchSelectionPatterns,
    isGithubMultipleBranchesSelection,
} from '@/lib/github/githubRepository';
import { formatCzechCountedNoun } from '@/lib/language/czechNumbers';
import type { WorkshopRepository } from '@/lib/workshops/workshopRepository';
import type { WorkshopRepositoryBranch } from '@/lib/workshops/workshopRepositoryProgress';
import { ExternalLink, Github, RefreshCw, Rocket } from 'lucide-react';

type WorkshopRepositoryPanelProps = {
    /**
     * The project this workshop is about, as its administration connected it
     */
    readonly repository: WorkshopRepository;
    readonly progressController: Pick<
        WorkshopRepositoryProgressController,
        'progress' | 'isProgressRead' | 'newCommitShas'
    >;
};

/**
 * Names the commits which arrived while this participant watched the workshop
 */
function formatNewCommitCount(commitCount: number): string {
    return formatCzechCountedNoun(commitCount, ['nový commit', 'nové commity', 'nových commitů']);
}

/**
 * The project one workshop is about, together with what is being committed in it while the workshop runs
 *
 * Note: The connection itself comes with the state of the room, while the commits are read from GitHub on their own,
 *       see `useWorkshopRepositoryProgress`. That is why the repository and its links are shown even when GitHub
 *       cannot be reached.
 */
export function WorkshopRepositoryPanel({ repository, progressController }: WorkshopRepositoryPanelProps) {
    const { progress, isProgressRead, newCommitShas } = progressController;
    const repositoryName = formatGithubRepositoryName(repository);
    const isMultipleBranchSelection = isGithubMultipleBranchesSelection(repository.branch);
    const graphBranches: readonly WorkshopRepositoryBranch[] =
        progress?.branches ??
        getGithubBranchSelectionPatterns(repository.branch).map((branchName) => ({ name: branchName, headSha: null }));

    return (
        <section
            aria-label="Projekt workshopu"
            className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
        >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4">
                <div className="min-w-0">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
                        <Github className="h-4 w-4" aria-hidden="true" /> Projekt workshopu
                    </p>
                    <h2 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
                        {repositoryName}
                    </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {newCommitShas.size > 0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-amber-300/10 px-2.5 py-1 text-xs font-bold text-amber-200">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-300" aria-hidden="true" />
                            {formatNewCommitCount(newCommitShas.size)}
                        </span>
                    )}
                    <a
                        href={createGithubRepositoryUrl(repository)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-slate-950/40 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-200/70 hover:bg-slate-900"
                    >
                        <Github className="h-3.5 w-3.5" aria-hidden="true" /> Repozitář
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                    {repository.deploymentUrl !== null && (
                        <a
                            href={repository.deploymentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full bg-cyan-300 px-3 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-200"
                        >
                            <Rocket className="h-3.5 w-3.5" aria-hidden="true" /> Živá aplikace
                            <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                    )}
                </div>
            </div>

            <div className="space-y-3 px-5 py-4">
                {!isProgressRead ? (
                    <p className="flex items-center gap-2 text-sm text-slate-400">
                        <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" /> Načítám commity…
                    </p>
                ) : progress === null ? (
                    <p className="text-sm leading-6 text-slate-400">
                        Commity repozitáře se teď nepodařilo načíst. Odkaz na projekt funguje dál a commity se objeví,
                        jakmile bude repozitář znovu dostupný.
                    </p>
                ) : (
                    <>
                        {progress.commits.length > 0 && (
                            isMultipleBranchSelection ? (
                                <WorkshopRepositoryGraph
                                    repository={repository}
                                    commits={progress.commits}
                                    branches={graphBranches}
                                    newCommitShas={newCommitShas}
                                />
                            ) : (
                                <ol className="space-y-2">
                                    {progress.commits.map((commit) => (
                                        <li key={commit.sha}>
                                            <WorkshopRepositoryCommitCard
                                                repository={repository}
                                                commit={commit}
                                                isNew={newCommitShas.has(commit.sha)}
                                            />
                                        </li>
                                    ))}
                                </ol>
                            )
                        )}
                        <a
                            href={createGithubCommitsUrlForBranchSelection(repository, repository.branch)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-200 underline underline-offset-4 hover:text-cyan-100"
                        >
                            Všechny commity na GitHubu <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                    </>
                )}
            </div>
        </section>
    );
}
import { createAdHocShortcodeLink } from '@/lib/shortener/shortcodeLinkAdHoc';
import {
    createPublicShortcodeLinkUrl,
    type ShortcodeLinkSourceApp,
} from '@/lib/shortener/shortcodeLink';
import { SHORTCODE_LINK_TABLE_NAME } from '@/lib/shortener/shortcodeLinkConstants';
import { fetchPublicWebPageTitle } from '@/lib/network/publicWebPagePreview';
import {
    WORKSHOP_COMMENT_SHORTCODE_LINK_TABLE_NAME,
    WORKSHOP_CONTENT_SHORTCODE_LINK_TABLE_NAME,
} from '@/lib/workshops/workshopConstants';
import type { WorkshopKind } from '@/lib/workshops/workshopTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

const WORKSHOP_UTM_SOURCE = 'promptbook';
const WORKSHOP_UTM_MEDIUM = 'workshop';
const WORKSHOP_MATERIAL_HASH_LINK_PREFIX = '#';
const WORKSHOP_MATERIAL_ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);
const WORKSHOP_MATERIAL_LINK_BASE_URL = 'https://www.promptbook.studio';
const WORKSHOP_MATERIAL_BARE_URL_PATTERN = /(^|\s)(https?:\/\/[^\s<>()\[\]"']+)/gm;
const WORKSHOP_MATERIAL_BARE_URL_TRAILING_PUNCTUATION_PATTERN = /[.,;:!?]+$/;

type WorkshopMaterialLinkRange = {
    readonly destination: string;
    readonly start: number;
    readonly end: number;
    readonly isTitleRequired: boolean;
};

type WorkshopShortcodeLinkMappingRow = {
    readonly destination_url: string;
    readonly destination_title?: string | null;
    readonly shortcode_link_id: number | string;
};

/**
 * One persisted source record whose URLs are handed out as public short links.
 * Materials and eligible chat messages differ only by this durable mapping;
 * parsing, UTM values, collision handling, and URL replacement stay shared.
 */
type WorkshopShortcodeLinkOwner = {
    readonly id: string;
    readonly mappingTableName: string;
    readonly mappingOwnerColumnName: string;
    readonly note: string;
};

type ShortcodeLinkReferenceRow = {
    readonly id: number | string;
    readonly shortcode: string;
};

export type WorkshopShortcodeLinkPresentation = {
    readonly shortUrl: string;
    readonly title: string;
};

type WorkshopShortcodeLinkReplacement = string | WorkshopShortcodeLinkPresentation;

type LoadedWorkshopShortcodeLink = WorkshopShortcodeLinkPresentation & {
    readonly isTitleStored: boolean;
};

type LoadedWorkshopShortcodeLinks =
    | {
          readonly shortcodeLinkByDestination: ReadonlyMap<string, LoadedWorkshopShortcodeLink>;
          readonly errorMessage: null;
      }
    | { readonly shortcodeLinkByDestination: null; readonly errorMessage: string };

function getWorkshopMaterialLinkBaseUrl(): string {
    return WORKSHOP_MATERIAL_LINK_BASE_URL;
}

function isEscaped(text: string, index: number): boolean {
    let precedingBackslashCount = 0;

    for (let cursor = index - 1; cursor >= 0 && text[cursor] === '\\'; cursor--) {
        precedingBackslashCount++;
    }

    return precedingBackslashCount % 2 === 1;
}

function isWithinFencedCodeBlock(markdown: string, position: number): boolean {
    const precedingText = markdown.slice(0, position);
    const fenceCount = Array.from(precedingText.matchAll(/^ {0,3}(?:`{3,}|~{3,})/gm)).length;

    return fenceCount % 2 === 1;
}

function isWithinInlineCode(markdown: string, position: number): boolean {
    const lineStart = markdown.lastIndexOf('\n', position - 1) + 1;
    const precedingLineText = markdown.slice(lineStart, position);
    let unescapedBacktickCount = 0;

    for (let cursor = 0; cursor < precedingLineText.length; cursor++) {
        if (precedingLineText[cursor] === '`' && !isEscaped(precedingLineText, cursor)) {
            unescapedBacktickCount++;
        }
    }

    return unescapedBacktickCount % 2 === 1;
}

function isInsideCode(markdown: string, position: number): boolean {
    return isWithinFencedCodeBlock(markdown, position) || isWithinInlineCode(markdown, position);
}

function findUnescapedCharacter(text: string, character: string, start: number): number {
    for (let cursor = start; cursor < text.length; cursor++) {
        if (text[cursor] === character && !isEscaped(text, cursor)) {
            return cursor;
        }
    }

    return -1;
}

function collectMarkdownInlineLinkRanges(markdown: string): readonly WorkshopMaterialLinkRange[] {
    const ranges: WorkshopMaterialLinkRange[] = [];

    for (let openingBracket = markdown.indexOf('['); openingBracket !== -1; openingBracket = markdown.indexOf('[', openingBracket + 1)) {
        if (
            (openingBracket > 0 && markdown[openingBracket - 1] === '!') ||
            isEscaped(markdown, openingBracket) ||
            isInsideCode(markdown, openingBracket)
        ) {
            continue;
        }

        const closingBracket = findUnescapedCharacter(markdown, ']', openingBracket + 1);
        if (closingBracket === -1 || markdown[closingBracket + 1] !== '(') {
            continue;
        }

        let destinationStart = closingBracket + 2;
        while (/\s/.test(markdown[destinationStart] ?? '')) {
            destinationStart++;
        }

        if (markdown[destinationStart] === '<') {
            const closingAngleBracket = findUnescapedCharacter(markdown, '>', destinationStart + 1);
            if (closingAngleBracket === -1) {
                continue;
            }

            const destination = markdown.slice(destinationStart + 1, closingAngleBracket);
            if (destination !== '') {
                ranges.push({
                    destination,
                    start: destinationStart + 1,
                    end: closingAngleBracket,
                    isTitleRequired: false,
                });
            }
            continue;
        }

        let parenthesisDepth = 0;
        let destinationEnd = destinationStart;
        for (; destinationEnd < markdown.length; destinationEnd++) {
            const character = markdown[destinationEnd];
            if (isEscaped(markdown, destinationEnd)) {
                continue;
            }
            if (character === '(') {
                parenthesisDepth++;
                continue;
            }
            if (character === ')') {
                if (parenthesisDepth === 0) {
                    break;
                }
                parenthesisDepth--;
                continue;
            }
            if (parenthesisDepth === 0 && /\s/.test(character)) {
                break;
            }
        }

        const destination = markdown.slice(destinationStart, destinationEnd);
        if (destination !== '') {
            ranges.push({ destination, start: destinationStart, end: destinationEnd, isTitleRequired: false });
        }
    }

    return ranges;
}

function collectHtmlLinkRanges(markdown: string): readonly WorkshopMaterialLinkRange[] {
    const ranges: WorkshopMaterialLinkRange[] = [];
    const openingAnchorPattern = /<a\b[^>]*>/gi;
    const hrefPattern = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;

    for (const openingAnchorMatch of Array.from(markdown.matchAll(openingAnchorPattern))) {
        const openingAnchor = openingAnchorMatch[0];
        const openingAnchorIndex = openingAnchorMatch.index ?? 0;
        if (isInsideCode(markdown, openingAnchorIndex)) {
            continue;
        }

        const hrefMatch = hrefPattern.exec(openingAnchor);
        if (hrefMatch === null) {
            continue;
        }

        const destination = hrefMatch[1] ?? hrefMatch[2] ?? hrefMatch[3];
        if (!destination) {
            continue;
        }

        const hrefText = hrefMatch[0];
        const destinationIndexInHref = hrefText.lastIndexOf(destination);
        if (destinationIndexInHref === -1) {
            continue;
        }

        const hrefIndexInAnchor = hrefMatch.index;
[^] by OpenAI Codex `gpt-5.6-terra` thinking `max` - Implementation in progress

[✨🧽] Linked repository should appear alongside the materials as a kind of special material.

- It should appear alongside the materials as a material for all participants (both paying and non-paying)
- You are working with page `/cs/online-workshop/participant?workshop=`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

![alt text](prompts/screenshots/2026-09-0100-repository-as-special-material.png)
![alt text](prompts/screenshots/2026-09-0100-repository-as-special-material-1.png)

[x] by OpenAI Codex `gpt-5.6-terra` thinking `max` (ChatGPT account) - Implementation ~$0.2687 6 minutes; Testing 3 minutes

[✨🚌] The link to the community should be shown alongside materials and behave like kinda a special material.

- It should appear alongside the materials as a material for all participants (both paying and non-paying)
- You are working with page `/cs/online-workshop/participant?workshop=`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

![alt text](prompts/screenshots/2026-09-0090-komunita-as-special-material.png)


exec
/bin/zsh -lc "sed -n '220,520p' businesses/online-workshop/participant/WorkshopContent.tsx
sed -n '1,360p' businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
sed -n '1,300p' app/cs/online-workshop/participant/page.tsx
sed -n '1,260p' lib/workshops/workshopTypes.ts
sed -n '1,220p' lib/workshops/workshopRepository.ts" in /Users/hejny/work/aldaron
 succeeded in 0ms:
            }
        />
    );
}

export function WorkshopContent({
    contentBlocks,
    nextContentUnlockAt,
    newlyUnlockedContentBlockIds,
    paidMembersOnlyContentPreviews,
    specialMaterials = [],
    title = 'Materiály z workshopu',
}: WorkshopContentProps) {
    const isReducedMotionPreferred = useReducedMotion() === true;

    // Note: The purchase is only offered while a gate is configured and the member has not paid yet, which is exactly
    //       when the server keeps the paid materials hidden, so the notice and the hidden materials cannot disagree.
    const membershipPurchaseOffer = useCommunityMembershipPurchaseOffer();
    const isPaidMembersContentNoticeShown =
        paidMembersOnlyContentPreviews.length > 0 && membershipPurchaseOffer !== null;
    const isSpecialMaterialShown = specialMaterials.length > 0;

    if (
        contentBlocks.length === 0 &&
        nextContentUnlockAt === null &&
        !isPaidMembersContentNoticeShown &&
        !isSpecialMaterialShown
    ) {
        return null;
    }

    return (
        <section className="mt-8" aria-labelledby="workshop-materials-title">
            <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-300" />
                <h2 id="workshop-materials-title" className="text-xl font-bold text-white">
                    {title}
                </h2>
            </div>

            <div className="space-y-4">
                {contentBlocks.map((contentBlock) => {
                    const isNewlyUnlocked = newlyUnlockedContentBlockIds.has(contentBlock.id);
                    const isFollowUp = contentBlock.isFollowUp;
                    const isPaidMembersOnly = contentBlock.isPaidMembersOnly;
                    return (
                        <motion.article
                            key={contentBlock.id}
                            id={`workshop-material-${contentBlock.id}`}
                            initial={isNewlyUnlocked && !isReducedMotionPreferred ? { opacity: 0, y: 24, scale: 0.97 } : false}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: isReducedMotionPreferred ? 0 : 0.55, ease: 'easeOut' }}
                            className={`relative scroll-mt-5 overflow-hidden rounded-2xl border bg-white/[0.045] p-5 text-slate-200 shadow-lg transition-colors sm:p-8 ${isNewlyUnlocked ? 'border-cyan-300/60 pt-16 shadow-cyan-300/10 sm:pt-8' : isFollowUp || isPaidMembersOnly ? 'border-amber-300/60 shadow-amber-300/10' : 'border-white/10'}`}
                        >
                            {isNewlyUnlocked && (
                                <span className="absolute right-4 top-4 rounded-full bg-cyan-300 px-3 py-1 text-xs font-bold text-slate-950 shadow-lg">
                                    Právě odemčeno
                                </span>
                            )}
                            {(isFollowUp || isPaidMembersOnly) && (
                                <div className="mb-4 flex flex-wrap gap-2">
                                    {isFollowUp && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/30 bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-100">
                                            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Navazující materiál
                                        </span>
                                    )}
                                    {isPaidMembersOnly && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/30 bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-100">
                                            <Crown className="h-3.5 w-3.5" aria-hidden="true" /> Pro placené členy
                                        </span>
                                    )}
                                </div>
                            )}
                            {contentBlock.title && (
                                <h3 className="mb-5 text-xl font-bold text-white">{contentBlock.title}</h3>
                            )}
                            <WorkshopMaterialBody
                                contentBlock={contentBlock}
                            />
                        </motion.article>
                    );
                })}

                {specialMaterials.map((specialMaterial) => (
                    <Fragment key={specialMaterial.id}>{specialMaterial.content}</Fragment>
                ))}

                {nextContentUnlockAt && (
                    <div className="flex items-start gap-3 rounded-xl border border-dashed border-cyan-300/20 bg-cyan-300/[0.04] px-5 py-4 text-sm text-slate-400">
                        <Clock3 className="h-5 w-5 shrink-0 text-cyan-300" />
                        <span className="min-w-0">
                            Další materiál se automaticky odemkne{' '}
                            {CZECH_DATE_TIME_FORMAT.format(new Date(nextContentUnlockAt))}.
                        </span>
                    </div>
                )}

                {isPaidMembersContentNoticeShown && membershipPurchaseOffer !== null && (
                    <WorkshopPaidMembersContentNotice
                        contentPreviews={paidMembersOnlyContentPreviews}
                        onUnlockPaidMaterials={membershipPurchaseOffer.openMembershipModal}
                    />
                )}
            </div>
        </section>
    );
}
'use client';

import { CommunityRoomInvitation } from '@/businesses/community/CommunityRoomInvitation';
import { CommunityMembershipBadge } from '@/businesses/community/membership/CommunityMembershipBadge';
import { CommunityMembershipModal } from '@/businesses/community/membership/CommunityMembershipModal';
import { CommunityMembershipRoomProvider } from '@/businesses/community/membership/CommunityMembershipRoomProvider';
import { WorkshopCalendarInvitation } from '@/businesses/online-workshop/participant/WorkshopCalendarInvitation';
import { WorkshopChat } from '@/businesses/online-workshop/participant/WorkshopChat';
import {
    WorkshopConnectionForm,
    type WorkshopConnectionDetails,
} from '@/businesses/online-workshop/participant/WorkshopConnectionForm';
import { WorkshopContent } from '@/businesses/online-workshop/participant/WorkshopContent';
import { WorkshopParticipantBadge } from '@/businesses/online-workshop/participant/WorkshopParticipantBadge';
import { WorkshopPolls } from '@/businesses/online-workshop/participant/WorkshopPolls';
import { WorkshopReactions } from '@/businesses/online-workshop/participant/WorkshopReactions';
import { WorkshopRepositoryPanel } from '@/businesses/online-workshop/participant/WorkshopRepositoryPanel';
import { WorkshopStage } from '@/businesses/online-workshop/participant/WorkshopStage';
import { WorkshopServerConnectionStatus } from '@/businesses/online-workshop/participant/WorkshopServerConnectionStatus';
import { WorkshopWatchingBadge } from '@/businesses/online-workshop/participant/WorkshopWatchingBadge';
import { useWorkshopParticipantOfflineSupport } from '@/businesses/online-workshop/participant/useWorkshopParticipantOfflineSupport';
import { useWorkshopParticipant } from '@/businesses/online-workshop/participant/useWorkshopParticipant';
import { useWorkshopRepositoryProgress } from '@/businesses/online-workshop/participant/useWorkshopRepositoryProgress';
import { WorkshopLinksPanel } from '@/components/workshops/WorkshopLinksPanel';
import { getWorkshopKindCapabilities, isWorkshopPollVisibleInRoom } from '@/lib/workshops/workshopKindCapabilities';
import { isWorkshopParticipantModerating } from '@/lib/workshops/workshopModeration';
import { isWorkshopPanelOffered, type WorkshopPanelKey } from '@/lib/workshops/workshopPanels';
import { WORKSHOP_SEARCH_PARAMETER_NAME } from '@/lib/workshops/workshopParticipantLink';
import type { SubscribeToWorkshopRepositoryCommits } from '@/lib/workshops/workshopRepositoryProgress';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';
import { RefreshCw, Radio } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, type ReactNode } from 'react';

/**
 * What it takes to offer this workshop to the calendar of a participant
 */
export type WorkshopCalendarDetails = {
    readonly hostFullname: string;
    readonly participantPath: string;
};

/**
 * Optional hand-off from a persistent room to the terms of every kind of event. The shared participant room only needs
 * the data required to keep a participant identity in those links, never business-specific UI knowledge.
 *
 * Note: Where one term leads is decided by the kind of event it is a term of, so this hand-off never names a path and
 *       a kind of event added later is led to without changing anything here.
 */
export type WorkshopNavigationDetails = {
    readonly workshops: readonly WorkshopSummary[];
    readonly title: string;
    readonly description: string;
    readonly emptyMessage: string;
    readonly locale: string;
    readonly timeZone: string;

    /**
     * Absolute url of the published calendar of these terms, which a room without one leaves out
     */
    readonly calendarFeedUrl?: string;
};

type OnlineWorkshopParticipantPageProps = {
    readonly workshopSlug: string;
    readonly connectionDetails: WorkshopConnectionDetails;
    readonly calendarDetails: WorkshopCalendarDetails | null;

    /**
     * Identity carried here by the link which opened the room, offered to the connection form
     *
     * Note: This only ever prefills that form. A connected participant is described by the loaded room itself, so a
     *       returning member who opened no such link is known just as well.
     */
    readonly initialEmail: string;
    readonly initialFullname: string;
    readonly roomSubtitle?: string;
    readonly isWorkshopSelectionInUrl?: boolean;
    readonly workshopNavigation?: WorkshopNavigationDetails;
    readonly materialsTitle?: string;
    readonly unavailableConnectionMessage?: string;

    /**
     * Optional room-specific member information shown next to the connected participant. This keeps the shared room
     * layout unaware of the business surface that supplied the information.
     *
     * Note: The membership of the member is deliberately not supplied this way. It belongs to every room which offers
     *       it rather than to one business surface, so the room draws it itself just above this supplement.
     */
    readonly participantHeaderSupplement?: ReactNode;

    /**
     * Optional community-specific content placed after room navigation and before materials. It lets the permanent
     * community add a surface without copying the secured participant-room layout.
     */
    readonly mainContentAfterWorkshopNavigation?: ReactNode;

    /**
     * A project discussion has no materials of its own, while the shared community room continues to show them.
     */
    readonly isMaterialsShown?: boolean;

    /**
     * A room may require a domain-specific reconnection flow instead of the general name-and-email form.
     */
    readonly connectionRequiredContent?: ReactNode;

    /**
     * Optional choice of the term to connect to, offered by the connection form of this room
     *
     * Note: Which terms can be entered and what picking one changes is known by the business surface which owns them,
     *       so the room only carries that choice to the one screen where a participant is choosing at all.
     */
    readonly connectionTermPicker?: ReactNode;
};

export function OnlineWorkshopParticipantPage({
    workshopSlug,
    connectionDetails,
    calendarDetails,
    initialEmail,
    initialFullname,
    roomSubtitle = 'Online workshop · Promptbook',
    isWorkshopSelectionInUrl = true,
    workshopNavigation,
    materialsTitle,
    unavailableConnectionMessage = 'Připojení k workshopu se nepodařilo ověřit.',
    participantHeaderSupplement,
    mainContentAfterWorkshopNavigation,
    isMaterialsShown = true,
    connectionRequiredContent,
    connectionTermPicker,
}: OnlineWorkshopParticipantPageProps) {
    const controller = useWorkshopParticipant(workshopSlug);
    useWorkshopParticipantOfflineSupport();
    const isRepositoryProgressEnabled =
        controller.state !== null &&
        getWorkshopKindCapabilities(controller.state.workshop.kind).isRepositoryOffered &&
        controller.state.workshop.repository !== null;
    const repositoryProgressController = useWorkshopRepositoryProgress(workshopSlug, isRepositoryProgressEnabled);
    const subscribeToRepositoryCommits = useCallback<SubscribeToWorkshopRepositoryCommits>(
        (listener) => {
            const unsubscribeFromRealtime = controller.subscribeToRepositoryCommits?.(listener) ?? (() => undefined);
            const unsubscribeFromPolling =
                repositoryProgressController.subscribeToNewCommits?.(listener) ?? (() => undefined);

            return () => {
                unsubscribeFromRealtime();
                unsubscribeFromPolling();
            };
        },
        [controller.subscribeToRepositoryCommits, repositoryProgressController.subscribeToNewCommits],
    );

    useEffect(() => {
        if (controller.state === null) {
            return;
        }

        const sanitizedUrl = new URL(window.location.href);
        const isWorkshopSelectionChanged = sanitizedUrl.searchParams.get(WORKSHOP_SEARCH_PARAMETER_NAME) !== workshopSlug;
        const isUrlChanged =
            (isWorkshopSelectionInUrl && isWorkshopSelectionChanged) ||
            (!isWorkshopSelectionInUrl && sanitizedUrl.searchParams.has(WORKSHOP_SEARCH_PARAMETER_NAME)) ||
            sanitizedUrl.searchParams.has('email') ||
            sanitizedUrl.searchParams.has('fullname');
        sanitizedUrl.searchParams.delete('email');
        sanitizedUrl.searchParams.delete('fullname');
        if (isWorkshopSelectionInUrl) {
            sanitizedUrl.searchParams.set(WORKSHOP_SEARCH_PARAMETER_NAME, workshopSlug);
        } else {
            sanitizedUrl.searchParams.delete(WORKSHOP_SEARCH_PARAMETER_NAME);
        }
        if (isUrlChanged) {
            window.history.replaceState(
                window.history.state,
                '',
                `${sanitizedUrl.pathname}${sanitizedUrl.search}${sanitizedUrl.hash}`,
            );
        }
    }, [controller.state, isWorkshopSelectionInUrl, workshopSlug]);

    if (controller.isCheckingConnection && controller.state === null) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#07151d] text-cyan-200">
                <RefreshCw className="h-7 w-7 animate-spin" aria-label="Ověřuji připojení" />
            </main>
        );
    }

    if (controller.isConnectionRequired) {
        return (
            connectionRequiredContent ?? (
                <WorkshopConnectionForm
                    connectionDetails={connectionDetails}
                    initialEmail={initialEmail}
                    initialFullname={initialFullname}
                    errorMessage={controller.errorMessage}
                    onConnect={controller.connect}
                    connectionTermPicker={connectionTermPicker}
                />
            )
        );
    }

    if (controller.state === null) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#07151d] px-6 text-center text-slate-200">
                <div className="max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl">
                    <Radio className="mx-auto h-9 w-9 text-cyan-300" />
                    <h1 className="mt-5 text-2xl font-bold text-white">Místnost teď není dostupná</h1>
                    <p className="mt-3 text-sm leading-6 text-slate-400">
                        {controller.errorMessage ?? unavailableConnectionMessage}
                    </p>
                    <button
                        type="button"
                        onClick={() => void controller.refresh()}
                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-200"
                    >
                        <RefreshCw className="h-4 w-4" /> Zkusit znovu
                    </button>
                </div>
            </main>
        );
    }

    const { state } = controller;
    const roomCapabilities = getWorkshopKindCapabilities(state.workshop.kind);
    const isWorkshopPollVisible = isWorkshopPollVisibleInRoom(state.workshop.kind);
    const isModerating = isWorkshopParticipantModerating(state.participant);
    const followUpContentBlock = state.contentBlocks.find((contentBlock) => contentBlock.isFollowUp) ?? null;
    const specialMaterials = roomCapabilities.isCommunityInvitationOffered
        ? [
              {
                  id: 'community',
                  content: <CommunityRoomInvitation participantIdentity={state.participant} />,
              },
          ]
        : [];

    // Note: What the kind of this room has and what an administrator switched off is asked here once, so a new panel
    //       is one line of the room.
    const isPanelOffered = (panelKey: WorkshopPanelKey) =>
        isWorkshopPanelOffered(state.workshop.kind, state.workshop.disabledPanels, panelKey);

    const roomLayout = (
        <div className="min-h-screen bg-[#06131b] text-slate-200">
            <header className="border-b border-white/[0.07] bg-[#071820]/90 backdrop-blur">
                <div className="mx-auto flex max-w-[1500px] flex-col items-stretch gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-8">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <Image
                            src="/logo/promptbook-logo-blue-white-256.png"
                            alt="Promptbook"
                            width={36}
                            height={36}
                            className="h-9 w-9 rounded-lg"
                        />
                        <div className="min-w-0">
                            <p className="break-words text-sm font-bold text-white">{state.workshop.title}</p>
                            <p className="hidden text-xs text-slate-500 sm:block">{roomSubtitle}</p>
                        </div>
                    </div>
                    <div className="flex min-w-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
                        {isPanelOffered('watching-count') && (
                            <WorkshopWatchingBadge watchingParticipantCount={state.watchingParticipantCount} />
                        )}
                        {/*
                          * Note: Who the participant is connected as, and both ways of changing that — renaming
                          *       themselves and signing out — belong to the room they are connected to, so every room
                          *       offers them from this one badge.
                          */}
                        <WorkshopParticipantBadge
                            fullname={state.participant.fullname}
                            isInteractionBanned={state.participant.isInteractionBanned}
                            isModerating={isModerating}
                            isRefreshing={controller.isRefreshing}
                            onChangeFullname={controller.changeFullname}
                            onDisconnect={roomCapabilities.isDisconnectionOffered ? controller.disconnect : undefined}
                        />
                        {/*
                          * Note: Every room which offers the membership says which one its member has and lets them
                          *       buy or manage it with the very same badge and modal instead of a surface of its own.
                          */}
                        <CommunityMembershipBadge />
                        <CommunityMembershipModal />
                        {participantHeaderSupplement}
                        <WorkshopServerConnectionStatus
                            isUsingCachedState={controller.isUsingCachedState}
                            isRefreshing={controller.isRefreshing}
                            unavailableMessage={controller.isUsingCachedState ? controller.errorMessage : null}
                            onRefresh={() => void controller.refresh()}
                        />
                    </div>
                </div>
            </header>

            <main className="mx-auto grid w-full min-w-0 max-w-[1500px] grid-cols-1 gap-5 px-4 py-4 sm:px-8 sm:py-5 lg:grid-cols-[minmax(0,1fr)_390px]">
                <div className="min-w-0 lg:col-start-1 lg:row-start-1">
                    {controller.errorMessage && !controller.isUsingCachedState ? (
                        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.08] px-4 py-3 text-sm text-rose-200">
                            <span className="min-w-0 flex-1 break-words">{controller.errorMessage}</span>
                            <button
                                type="button"
                                onClick={() => void controller.refresh()}
                                className="shrink-0 font-semibold underline underline-offset-4"
                            >
                                Zkusit znovu
                            </button>
                        </div>
                    ) : null}

                    {roomCapabilities.isStageOffered && (
                        <WorkshopStage
                            workshop={state.workshop}
                            serverTime={state.serverTime}
                            subscribeToReactions={controller.subscribeToReactions}
                            repository={state.workshop.repository}
                            subscribeToRepositoryCommits={subscribeToRepositoryCommits}
                            feedback={state.feedback}
                            followUpContentBlock={followUpContentBlock}
                            stageComment={state.stageComment}
                            paidMembersOnlyVideo={state.paidMembersOnlyVideo}
                            onSaveFeedback={controller.saveFeedback}
                        />
                    )}
                    {/*
                      * Note: A term is about a project only while its administration connected one, so a room which is
                      *       about no project shows nothing about one rather than an empty panel.
                      */}
                    {roomCapabilities.isRepositoryOffered && state.workshop.repository !== null && (
                        <WorkshopRepositoryPanel
                            repository={state.workshop.repository}
                            progressController={repositoryProgressController}
                        />
                    )}
                    {calendarDetails !== null && (
                        <WorkshopCalendarInvitation
                            workshop={state.workshop}
                            serverTime={state.serverTime}
                            hostFullname={calendarDetails.hostFullname}
                            participantPath={calendarDetails.participantPath}
                            participantIdentity={state.participant}
                        />
                    )}
                    {isWorkshopPollVisible && (
                        <WorkshopPolls
                            polls={state.polls}
                            isInteractionBanned={state.participant.isInteractionBanned}
                            onVote={controller.voteOnPoll}
                        />
                    )}
                    {workshopNavigation !== undefined && (
                        <WorkshopLinksPanel
                            workshops={workshopNavigation.workshops}
                            participantIdentity={state.participant}
                            title={workshopNavigation.title}
                            description={workshopNavigation.description}
                            emptyMessage={workshopNavigation.emptyMessage}
                            locale={workshopNavigation.locale}
                            timeZone={workshopNavigation.timeZone}
import { ONLINE_WORKSHOP_EVENT_TYPE } from '@/businesses/online-workshop/config';
import { OnlineWorkshopSelectedTermRoom } from '@/businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom';
import { ONLINE_WORKSHOP_PARTICIPANT_METADATA } from '@/businesses/online-workshop/onlineWorkshopMetadata';
import {
    readWorkshopParticipantIdentity,
    readWorkshopSlug,
} from '@/lib/workshops/workshopParticipantLink';
import { loadPublishedEventSummaries, loadSelectedPublishedWorkshop } from '@/lib/workshops/workshopPublic';
import { notFound } from 'next/navigation';

type OnlineWorkshopParticipantRouteProps = {
    readonly searchParams: Promise<{
        readonly email?: string | string[];
        readonly fullname?: string | string[];
        readonly workshop?: string | string[];
    }>;
};

export const metadata = ONLINE_WORKSHOP_PARTICIPANT_METADATA;
export const dynamic = 'force-dynamic';

export default async function OnlineWorkshopParticipantRoute({ searchParams }: OnlineWorkshopParticipantRouteProps) {
    const resolvedSearchParams = await searchParams;
    const participantIdentity = readWorkshopParticipantIdentity(
        resolvedSearchParams.email,
        resolvedSearchParams.fullname,
    );

    // Note: The term of the address decides which room is opened, while every published term of this very event is
    //       what the waiting room offers instead of it.
    const [openedWorkshop, workshops] = await Promise.all([
        loadSelectedPublishedWorkshop(readWorkshopSlug(resolvedSearchParams.workshop), ONLINE_WORKSHOP_EVENT_TYPE),
        loadPublishedEventSummaries(ONLINE_WORKSHOP_EVENT_TYPE),
    ]);
    if (openedWorkshop === null) {
        notFound();
    }

    return (
        <OnlineWorkshopSelectedTermRoom
            openedWorkshop={openedWorkshop}
            workshops={workshops}
            currentTime={new Date().toISOString()}
            initialEmail={participantIdentity.email}
            initialFullname={participantIdentity.fullname}
        />
    );
}
import type { AdminContactJoin } from '@/lib/admin/adminContactJoin';
import type { CommunityMembershipStatus } from '@/lib/community-membership/communityMembershipTypes';
import type { EventDetails } from '@/lib/events/event';
import type { GithubCommit } from '@/lib/github/githubCommitFeed';
import type { WorkshopPanelKey } from '@/lib/workshops/workshopPanels';
import type { WorkshopRepository } from '@/lib/workshops/workshopRepository';

/**
 * A live room is normally one workshop occurrence. The community uses the same resilient room infrastructure, but
 * remains a single, separately administered room across all occurrences.
 */
export const WORKSHOP_KIND_VALUES = ['workshop', 'community', 'project'] as const;

export type WorkshopKind = (typeof WORKSHOP_KIND_VALUES)[number];

export function isWorkshopKind(value: string): value is WorkshopKind {
    return WORKSHOP_KIND_VALUES.includes(value as WorkshopKind);
}

/**
 * The lifecycle of something a participant submits for moderation. Chat messages and community projects deliberately
 * use these same states, so trust and moderator privileges never approve one kind of submission differently from the
 * other.
 */
export const WORKSHOP_SUBMISSION_STATUS_VALUES = ['pending', 'approved', 'rejected'] as const;

export type WorkshopSubmissionStatus = (typeof WORKSHOP_SUBMISSION_STATUS_VALUES)[number];

/**
 * A chat message keeps this alias because it is the public type used by the existing room API.
 */
export type WorkshopCommentStatus = WorkshopSubmissionStatus;
export type WorkshopCommentSort = 'recent' | 'upvotes';

export type WorkshopSummary = {
    readonly id: string;
    readonly kind: WorkshopKind;
    readonly slug: string;
    readonly title: string;

    /**
     * What this very term is about, in the words an administrator wrote about it
     *
     * Note: Terms of one event each have a subject of their own, so a list of them says what every single one is
     *       about rather than describing them all by the event they belong to. The room and the list read the very
     *       same words, so a term is never described in two different ways.
     */
    readonly description: string;
    readonly startsAt: string;
    readonly endsAt: string | null;
    readonly isPublished: boolean;

    /**
     * The event this room is a term of, or `null` for a permanent room which is no event at all
     *
     * Note: Every kind of event is administered in the very same place and stored in the very same table, so a page
     *       listing terms only ever asks which kind of event it wants to list.
     */
    readonly event: EventDetails | null;
};

/**
 * One occurrence as the administration lists it, together with the audience it gathered
 *
 * Note: The participant count deliberately stays out of `WorkshopSummary`, so no public list of terms exposes how
 *       many people registered for them.
 */
export type WorkshopAdminSummary = WorkshopSummary & {
    readonly participantCount: number;

    /**
     * How many people registered for this term on the landing page of its event, or `null` for a room which is no term
     * of an event and therefore has no registration form at all
     *
     * Note: This is a different audience from `participantCount`, which counts the people who really entered the room.
     *       Somebody can register and never come, and somebody can be handed a link into a room they never registered
     *       for, so neither number can be derived from the other.
     */
    readonly registeredParticipantCount: number | null;
};

export type WorkshopDetails = WorkshopSummary & {
    /** Number of artificial viewers added to the live watching badge by an administrator. */
    readonly artificialWatchingParticipantCount?: number;
    readonly youtubeVideoId: string | null;

    /**
     * The teaser of that stream which stands in for it once the workshop is over, or `null` while none was published
     *
     * Note: The recording of an ended workshop is unlocked by the paid membership, and this is the snippet of it which
     *       an administrator lets everybody else watch instead. It is deliberately a second video rather than a part
     *       of the first one, so nothing of the recording itself has to reach a member who has not unlocked it.
     */
    readonly previewYoutubeVideoId: string | null;

    /**
     * The project this workshop is about, or `null` while no project is connected to it
     *
     * Note: This is the whole connection — the repository, its branch selection, and the address the project runs at
     *       — so the administration sets, changes, and unsets it as one thing. What has been committed in it is
     *       deliberately not part of it: that is read from GitHub, see `fetchWorkshopRepositoryProgress`.
     */
    readonly repository: WorkshopRepository | null;
    readonly allowedReactions: readonly string[];

    /**
     * The panels of the room an admin switched off for this workshop
     *
     * Note: Everything not listed here is offered, so a panel added later starts switched on for every workshop.
     */
    readonly disabledPanels: readonly WorkshopPanelKey[];
    readonly createdAt: string;
    readonly updatedAt: string;
};

export type WorkshopParticipant = {
    readonly id: string;
    readonly fullname: string;

    /**
     * Contact address this participant connected with
     *
     * Note: A room only ever describes the very participant reading it, so this address never reaches anybody else. It
     *       is what lets a room hand a verified identity on, for example into the link leading to another room.
     */
    readonly email: string;
    readonly connectedAt: string;
    readonly isInteractionBanned: boolean;

    /**
     * Whether the messages of this participant are approved as they are written
     *
     * Note: Trust stays invisible in the room. Nothing but the approval of their own messages tells a participant or
     *       anybody else that they were trusted.
     */
    readonly isTrusted: boolean;

    /**
     * Whether this participant moderates the room, which the room says with a badge
     */
    readonly isModerator: boolean;
};

export type WorkshopAdminParticipant = WorkshopParticipant &
    AdminContactJoin & {
    readonly lastSeenAt: string;
    readonly activeDurationSeconds: number;
    readonly commentCount: number;
    readonly reactionCount: number;
    readonly upvoteCount: number;

    /**
     * Present when the participant is listed inside the community administration. A community membership belongs to
     * their e-mail address rather than to this particular room session, so ordinary workshop participant data does
     * not fetch or expose it.
     */
    readonly communityMembershipStatus?: CommunityMembershipStatus;
};

/**
 * One server-paged slice of participants, keeping large workshops responsive in the administration.
 */
export type WorkshopAdminParticipantPage = {
    readonly participants: readonly WorkshopAdminParticipant[];
    readonly totalCount: number;
};

/**
 * One timestamped activity attributable to a participant.
 *
 * Note: These are assembled from the existing audited source records. They deliberately do not introduce a second
 * event store which could disagree with comments, reactions, or votes.
 */
export type WorkshopParticipantTimelineEvent =
    | {
          readonly kind: 'joined' | 'last-seen';
          readonly id: string;
          readonly occurredAt: string;
      }
    | {
          readonly kind: 'comment';
          readonly id: string;
          readonly occurredAt: string;
          readonly body: string;
          readonly status: WorkshopCommentStatus;
      }
    | {
          readonly kind: 'reaction';
          readonly id: string;
          readonly occurredAt: string;
          readonly emoji: string;
      }
    | {
          readonly kind: 'upvote';
          readonly id: string;
          readonly occurredAt: string;
          readonly commentId: string;
          readonly commentAuthorName: string | null;
          readonly commentBody: string | null;
      };

export type WorkshopAdminParticipantTimeline = {
    readonly participant: WorkshopAdminParticipant;
    readonly events: readonly WorkshopParticipantTimelineEvent[];
};

/**
 * Activity totals inside one compact bucket of the workshop-wide timeline.
 */
export type WorkshopAdminTimelinePoint = {
    readonly startsAt: string;

    /**
     * How many people had the room open during this bucket, which is the audience rather than an action
     *
     * Note: This is counted from the presence the room reports while it is open, so a workshop which was held before
     *       the room started reporting it has an audience of nobody however many people really watched it.
     */
    readonly watchingParticipantCount: number;

    /**
     * How many of the watching people were really at their computer during this bucket, and how many only had the room
     * open, which together are the whole audience of it
     *
     * Note: How that is told apart is decided by `workshopAttendance`, and a bucket which was measured before the
     *       attendance of a room was measured at all is passive throughout.
     */
    readonly activelyWatchingParticipantCount: number;
    readonly passivelyWatchingParticipantCount: number;

    /**
     * How many people registered into the room during this bucket
     */
    readonly participantCount: number;
    readonly commentCount: number;
    readonly reactionCount: number;
    readonly upvoteCount: number;
    readonly linkClickCount: number;

    /**
     * How many times each reaction was sent during this bucket, so a graph can draw one of them alone
     */
    readonly reactionCountsByEmoji: Readonly<Record<string, number>>;
};

/**
 * One message with the moment it was written, which is everything a metric counting words in the chat needs
 *
 * Note: The administration counts the matches of a regular expression in the browser, so that an expression which is
 *       still being typed answers immediately and never reaches the database.
 */
export type WorkshopAdminCommentSample = {
    readonly occurredAt: string;
    readonly body: string;
};

export type WorkshopAdminAnalytics = {
    readonly timelineStartsAt: string;
    readonly timelineEndsAt: string;
    readonly bucketDurationSeconds: number;
import {
    extractGithubBranchSelection,
    extractGithubRepository,
    type GithubBranchSelection,
    type GithubRepository,
} from '@/lib/github/githubRepository';
import { normalizePublicWebPageUrl } from '@/lib/network/publicWebPageUrl';

/**
 * The project one workshop is about
 *
 * Note: A term either is about a project or is about none, so the branch selection and the address the project runs at
 *       belong to the repository rather than standing beside it. That is what lets the administration set, change, and
 *       unset the whole connection at once, and what keeps a room from following a branch of a repository nobody
 *       connected.
 */
export type WorkshopRepository = GithubRepository & {
    /**
     * The branch selection the workshop follows. `null` is the repository default branch; strings may be literal
     * branch names or patterns such as `client-*`, `feature/*`, and `*`.
     */
    readonly branch: GithubBranchSelection;

    /**
     * Where the project of the workshop runs, `null` when it is published nowhere
     */
    readonly deploymentUrl: string | null;
};

/**
 * The stored connection of one room to a project, as far as it can be trusted
 *
 * Note: A repository which the application cannot read as a repository is deliberately read as no connection at all,
 *       rather than as a made-up one, so a room never links to a project which does not exist. The branch and the
 *       deployment are the same: what cannot be read is left out of the connection instead of taking it down.
 */
export function createWorkshopRepositoryOrNull(values: {
    readonly repository: string | null;
    readonly branch: string | readonly string[] | null;
    readonly deploymentUrl: string | null;
}): WorkshopRepository | null {
    const repository = extractGithubRepository(values.repository);
    if (repository === null) {
        if (values.repository !== null && values.repository !== '') {
            console.error(`Unknown GitHub repository "${values.repository}" was read from the database.`);
        }
        return null;
    }

    return {
        ...repository,
        branch: extractGithubBranchSelection(values.branch),
        deploymentUrl: values.deploymentUrl === null ? null : normalizePublicWebPageUrl(values.deploymentUrl),
    };
}

exec
/bin/zsh -lc "sed -n '360,760p' businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
sed -n '1,300p' businesses/community/CommunityRoomInvitation.tsx
sed -n '1,320p' businesses/online-workshop/participant/WorkshopContent.test.tsx
sed -n '1,360p' businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx" in /Users/hejny/work/aldaron
 succeeded in 0ms:
                            timeZone={workshopNavigation.timeZone}
                            serverTime={state.serverTime}
                            calendarFeedUrl={workshopNavigation.calendarFeedUrl}
                        />
                    )}
                    {mainContentAfterWorkshopNavigation}
                    {isPanelOffered('reactions') && (
                        <WorkshopReactions
                            emojis={state.workshop.allowedReactions}
                            reactionCounts={state.reactionCounts}
                            isInteractionBanned={state.participant.isInteractionBanned}
                            onReact={controller.react}
                        />
                    )}
                </div>

                <WorkshopChat
                    className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1"
                    comments={state.comments}
                    commentSort={controller.commentSort}
                    isEnabled={isPanelOffered('chat')}
                    isInteractionBanned={state.participant.isInteractionBanned}
                    isModerating={isModerating}
                    onChangeSort={controller.changeCommentSort}
                    onSubmitComment={controller.submitComment}
                    onUpvoteComment={controller.upvoteComment}
                    onModerateComment={controller.moderateComment}
                    onModerateAuthor={controller.moderateAuthor}
                />

                {isMaterialsShown && (
                    <div className="min-w-0 lg:col-start-1 lg:row-start-2">
                        <WorkshopContent
                            contentBlocks={state.contentBlocks}
                            nextContentUnlockAt={state.nextContentUnlockAt}
                            newlyUnlockedContentBlockIds={controller.newlyUnlockedContentBlockIds}
                            paidMembersOnlyContentPreviews={state.paidMembersOnlyContentPreviews}
                            specialMaterials={specialMaterials}
                            title={materialsTitle}
                        />
                    </div>
                )}
            </main>
        </div>
    );

    /*
     * Note: The membership of a member is one membership wherever they read it from, and every surface of the room
     *       which needs to know it — the badge and the modal in the header, the paid materials and the video which a
     *       paid member unlocks after the workshop — asks this one controller instead of loading a membership of its
     *       own.
     */
    return (
        <CommunityMembershipRoomProvider
            workshopSlug={workshopSlug}
            isMembershipOffered={roomCapabilities.isMembershipOffered}
        >
            {roomLayout}
        </CommunityMembershipRoomProvider>
    );
}
import { CZECH_COMMUNITY_INVITATION_COPY } from '@/businesses/community/communityContent';
import { createCommunityRoomLink } from '@/businesses/community/config';
import type { WorkshopParticipantIdentity } from '@/lib/workshops/workshopParticipantLink';
import { ArrowUpRight, Users } from 'lucide-react';
import Link from 'next/link';

const COMMUNITY_ROOM_INVITATION_TITLE_ID = 'community-room-invitation-title';

type CommunityRoomInvitationProps = {
    /**
     * The member as the room they are reading already verified them, which the community is entered with
     */
    readonly participantIdentity: WorkshopParticipantIdentity;
};

/**
 * The way from a room which ends into the permanent community, which is where everything outlasting one term is kept.
 *
 * Note: This is the second half of one hand-off rather than a surface of its own: the community leads its members into
 *       the rooms of the terms it lists, and such a room leads back into the community. Both directions carry the
 *       identity the member is already connected with, so neither room asks the same person for it twice.
 */
export function CommunityRoomInvitation({ participantIdentity }: CommunityRoomInvitationProps) {
    return (
        <article
            aria-labelledby={COMMUNITY_ROOM_INVITATION_TITLE_ID}
            className="relative scroll-mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-5 text-slate-200 shadow-lg sm:p-8"
        >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200">
                        <Users className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">
                            {CZECH_COMMUNITY_INVITATION_COPY.eyebrow}
                        </p>
                        <h3 id={COMMUNITY_ROOM_INVITATION_TITLE_ID} className="mt-1 text-xl font-bold text-white">
                            {CZECH_COMMUNITY_INVITATION_COPY.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                            {CZECH_COMMUNITY_INVITATION_COPY.description}
                        </p>
                        <ul className="mt-3 flex flex-wrap gap-2">
                            {CZECH_COMMUNITY_INVITATION_COPY.sectionTitles.map((sectionTitle) => (
                                <li
                                    key={sectionTitle}
                                    className="rounded-full border border-white/10 bg-slate-950/40 px-2.5 py-1 text-xs text-slate-300"
                                >
                                    {sectionTitle}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <Link
                    href={createCommunityRoomLink(participantIdentity)}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06131b]"
                >
                    {CZECH_COMMUNITY_INVITATION_COPY.linkLabel}
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
            </div>
        </article>
    );
}
/**
 * @vitest-environment jsdom
 */

import {
    WorkshopContent,
    type WorkshopSpecialMaterial,
} from '@/businesses/online-workshop/participant/WorkshopContent';
import type { CommunityMembershipRoomState } from '@/lib/community-membership/communityMembershipTypes';
import type { WorkshopContentBlock, WorkshopContentPreview } from '@/lib/workshops/workshopTypes';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * The room as far as the material list is concerned: the membership it already loaded and the modal it can open
 */
const membershipRoomMock = vi.hoisted(() => ({
    membershipRoom: null as null | {
        membership: CommunityMembershipRoomState | null;
        openMembershipModal: () => void;
    },
}));

vi.mock('@/businesses/community/membership/CommunityMembershipRoomProvider', () => ({
    useCommunityMembershipRoom: () => membershipRoomMock.membershipRoom,
}));

vi.mock('@/components/markdown-content', () => ({
    MarkdownContent: ({ content, className }: { readonly content: string; readonly className?: string }) => {
        const markdownLinks = Array.from(content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g));

        return (
            <div data-testid="markdown-content" className={className}>
                {markdownLinks.map((markdownLink) => (
                    <a key={markdownLink[2]} href={markdownLink[2]}>
                        {markdownLink[1]}
                    </a>
                ))}
            </div>
        );
    },
}));

vi.mock('@/components/promptbook-qr-code', () => ({
    PromptbookQrCode: ({ value, size, className }: { readonly value: string; readonly size?: number; readonly className?: string }) => (
        <span data-testid="workshop-material-qr-code" data-value={value} data-size={size} className={className} />
    ),
}));

const CONTENT_BLOCK: WorkshopContentBlock = {
    id: 'material-1',
    title: '',
    bodyMarkdown: '[Zjistit více](https://ptbk.io/material-abc123)',
    unlockAt: '2026-08-20T19:00:00.000Z',
    sortOrder: 0,
    isPublished: true,
    isFollowUp: false,
    isPaidMembersOnly: false,
    createdAt: '2026-08-20T18:00:00.000Z',
    updatedAt: '2026-08-20T18:00:00.000Z',
    linkClickCount: 0,
};

const FREE_PURCHASABLE_MEMBERSHIP: CommunityMembershipRoomState = {
    status: 'none',
    monthlyPriceCzk: null,
    currentPeriodEndsAt: null,
    isCancellationScheduled: false,
    isPurchaseOffered: true,
    isSubscriptionManagementOffered: false,
    isCoveredByDiscountCode: false,
    isPaymentInTestMode: false,
};

const PAID_MEMBERS_ONLY_CONTENT_PREVIEWS: readonly WorkshopContentPreview[] = [
    { id: 'paid-material-1', title: 'Bonusové podklady' },
];

function renderWorkshopContent(
    contentBlocks: readonly WorkshopContentBlock[],
    paidMembersOnlyContentPreviews: readonly WorkshopContentPreview[] = [],
    specialMaterials: readonly WorkshopSpecialMaterial[] = [],
) {
    return render(
        <WorkshopContent
            contentBlocks={contentBlocks}
            nextContentUnlockAt={null}
            newlyUnlockedContentBlockIds={new Set()}
            paidMembersOnlyContentPreviews={paidMembersOnlyContentPreviews}
            specialMaterials={specialMaterials}
        />,
    );
}

afterEach(() => {
    cleanup();
    membershipRoomMock.membershipRoom = null;
});

describe('workshop materials', () => {
    it('keeps a special material in the material list even when no ordinary material is unlocked', () => {
        renderWorkshopContent([], [], [
            {
                id: 'community',
                content: <article aria-label="Komunita Promptbooku">Komunita Promptbooku</article>,
            },
        ]);

        expect(screen.getByRole('heading', { name: 'Materiály z workshopu' })).not.toBeNull();
        expect(screen.getByRole('article', { name: 'Komunita Promptbooku' })).not.toBeNull();
    });

    it('offers a prominent short-link call to action when a material has one link', async () => {
        renderWorkshopContent([CONTENT_BLOCK]);

        const callToAction = await screen.findByRole('link', { name: /Otevřít materiál: Zjistit více/ });

        expect(callToAction.getAttribute('href')).toBe('https://ptbk.io/material-abc123');
        expect(callToAction.getAttribute('target')).toBe('_blank');
        expect(callToAction.getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('shows each material short link as a desktop-only QR code for opening on a phone', async () => {
        const secondContentBlock: WorkshopContentBlock = {
            ...CONTENT_BLOCK,
            id: 'material-2',
            bodyMarkdown: '[Stáhnout podklady](https://ptbk.io/material-def456)',
        };
        renderWorkshopContent([CONTENT_BLOCK, secondContentBlock]);

        const qrCodes = await screen.findAllByTestId('workshop-material-qr-code');

        expect(qrCodes.map((qrCode) => qrCode.getAttribute('data-value'))).toEqual([
            'https://ptbk.io/material-abc123',
            'https://ptbk.io/material-def456',
        ]);
        expect(qrCodes.every((qrCode) => qrCode.getAttribute('data-size') === '144')).toBe(true);
        expect(screen.getAllByLabelText('QR kódy materiálů')).toHaveLength(2);
        expect(screen.getAllByLabelText('QR kódy materiálů').every((qrCodes) => qrCodes.className.includes('hidden'))).toBe(
            true,
        );
        expect(screen.getAllByLabelText('QR kódy materiálů').every((qrCodes) => qrCodes.className.includes('lg:flex'))).toBe(
            true,
        );
    });

    it('uses the QR renderer quiet zone without an extra frame or redundant phone prompt', async () => {
        renderWorkshopContent([CONTENT_BLOCK]);

        const qrCode = await screen.findByTestId('workshop-material-qr-code');
        const qrCodeFigure = screen.getByLabelText('QR kód materiálu: Zjistit více');

        expect(qrCode.parentElement).toBe(qrCodeFigure);
        expect(qrCode.className).toContain('mx-auto');
        expect(qrCode.className).not.toMatch(/(?:^|\s)p-\S+/);
        expect(screen.queryByText('Otevřít v telefonu')).toBeNull();
    });

    it('keeps multiple material links as light underlined links without a call to action', async () => {
        const contentBlockWithMultipleLinks: WorkshopContentBlock = {
            ...CONTENT_BLOCK,
            bodyMarkdown: '[První materiál](https://example.com/one) a [druhý materiál](https://example.com/two)',
        };
        const { container } = renderWorkshopContent([contentBlockWithMultipleLinks]);

        await waitFor(() => expect(container.querySelectorAll('a')).toHaveLength(2));

        expect(screen.queryByRole('link', { name: /Otevřít materiál/ })).toBeNull();
        expect(screen.getByTestId('markdown-content').className).toContain('[--chat-md-link-color:#f1f5f9]');
    });

    it('keeps every link of a multi-link material available through its own QR code', async () => {
        const contentBlockWithMultipleLinks: WorkshopContentBlock = {
            ...CONTENT_BLOCK,
            bodyMarkdown: '[První materiál](https://ptbk.io/material-one) a [druhý materiál](https://ptbk.io/material-two)',
        };
        renderWorkshopContent([contentBlockWithMultipleLinks]);

        const qrCodes = await screen.findAllByTestId('workshop-material-qr-code');

        expect(qrCodes.map((qrCode) => qrCode.getAttribute('data-value'))).toEqual([
            'https://ptbk.io/material-one',
            'https://ptbk.io/material-two',
        ]);
        expect(screen.getByLabelText('QR kód materiálu: První materiál')).not.toBeNull();
        expect(screen.getByLabelText('QR kód materiálu: druhý materiál')).not.toBeNull();
    });

    it('marks the selected follow-up material while it stays in the ordinary material list', () => {
        renderWorkshopContent([{ ...CONTENT_BLOCK, isFollowUp: true, title: 'Další krok' }]);

        expect(screen.getByText('Navazující materiál')).not.toBeNull();
        expect(screen.getByRole('heading', { name: 'Další krok' })).not.toBeNull();
    });

    it('marks a material which only paid members may see while it stays in the list of a member who paid', () => {
        renderWorkshopContent([{ ...CONTENT_BLOCK, isPaidMembersOnly: true, title: 'Bonusové podklady' }]);

        expect(screen.getByText('Pro placené členy')).not.toBeNull();
        expect(screen.getByRole('heading', { name: 'Bonusové podklady' })).not.toBeNull();
    });

    it('says where the paid materials are and offers the membership which unlocks them to a member who has not paid', () => {
        const openMembershipModal = vi.fn();
        membershipRoomMock.membershipRoom = { membership: FREE_PURCHASABLE_MEMBERSHIP, openMembershipModal };
        renderWorkshopContent([CONTENT_BLOCK], PAID_MEMBERS_ONLY_CONTENT_PREVIEWS);

        expect(screen.getByText('Materiály pro placené členy')).not.toBeNull();
        fireEvent.click(screen.getByRole('button', { name: /Koupit placené členství/ }));

        expect(openMembershipModal).toHaveBeenCalledOnce();
    });

    it('names every hidden paid material as a teaser of what the membership unlocks', () => {
        membershipRoomMock.membershipRoom = { membership: FREE_PURCHASABLE_MEMBERSHIP, openMembershipModal: vi.fn() };
        renderWorkshopContent(
            [CONTENT_BLOCK],
            [...PAID_MEMBERS_ONLY_CONTENT_PREVIEWS, { id: 'paid-material-2', title: 'Nahrávka workshopu' }],
        );

        const contentPreviewTitles = Array.from(
            screen.getByLabelText('Náhled materiálů pro placené členy').querySelectorAll('li'),
        ).map((listItem) => listItem.textContent);

        expect(contentPreviewTitles).toEqual(['Bonusové podklady', 'Nahrávka workshopu']);
        expect(screen.getByText('Co odemknete')).not.toBeNull();
    });

    it('keeps saying where the paid materials are when none of them has a title to tease with', () => {
        membershipRoomMock.membershipRoom = { membership: FREE_PURCHASABLE_MEMBERSHIP, openMembershipModal: vi.fn() };
        renderWorkshopContent([], [{ id: 'paid-material-1', title: '' }]);

        expect(screen.getByText('Materiály pro placené členy')).not.toBeNull();
        expect(screen.queryByLabelText('Náhled materiálů pro placené členy')).toBeNull();
    });

    it('keeps saying where the paid materials are even when nothing else is unlocked yet', () => {
        membershipRoomMock.membershipRoom = { membership: FREE_PURCHASABLE_MEMBERSHIP, openMembershipModal: vi.fn() };
        renderWorkshopContent([], PAID_MEMBERS_ONLY_CONTENT_PREVIEWS);

        expect(screen.getByText('Materiály pro placené členy')).not.toBeNull();
    });

    it('shows no paid-materials notice while the membership is still unknown or cannot be bought', () => {
        renderWorkshopContent([CONTENT_BLOCK], PAID_MEMBERS_ONLY_CONTENT_PREVIEWS);
        expect(screen.queryByText('Materiály pro placené členy')).toBeNull();
        expect(screen.queryByText('Bonusové podklady')).toBeNull();

        membershipRoomMock.membershipRoom = {
            membership: { ...FREE_PURCHASABLE_MEMBERSHIP, isPurchaseOffered: false },
            openMembershipModal: vi.fn(),
        };
        renderWorkshopContent([CONTENT_BLOCK], PAID_MEMBERS_ONLY_CONTENT_PREVIEWS);
        expect(screen.queryByText('Materiály pro placené členy')).toBeNull();
        expect(screen.queryByText('Bonusové podklady')).toBeNull();
    });
});
/**
 * @vitest-environment jsdom
 */

import type { CommunityMembershipRoomState } from '@/lib/community-membership/communityMembershipTypes';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import type {
    WorkshopContentPreview,
    WorkshopDetails,
    WorkshopPaidMembersVideo,
    WorkshopPoll,
    WorkshopPublicState,
} from '@/lib/workshops/workshopTypes';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The room as far as this page is concerned: a loaded state and the actions it offers
 */
const participantMocks = vi.hoisted(() => ({ controller: null as unknown }));

vi.mock('@/businesses/online-workshop/participant/useWorkshopParticipant', () => ({
    useWorkshopParticipant: () => participantMocks.controller,
}));

/**
 * What the room was told about the project of the workshop, which is read from GitHub rather than from the room
 */
const repositoryProgressMocks = vi.hoisted(() => ({
    controller: {
        progress: null as unknown,
        isProgressRead: true,
        newCommitShas: new Set<string>(),
    },
}));

vi.mock('@/businesses/online-workshop/participant/useWorkshopRepositoryProgress', () => ({
    useWorkshopRepositoryProgress: () => repositoryProgressMocks.controller,
}));

const fetchCommunityMembership = vi.fn<(workshopSlug: string) => Promise<CommunityMembershipRoomState>>();

vi.mock('@/businesses/community/membership/communityMembershipRoomApi', () => ({
    fetchCommunityMembership: (workshopSlug: string) => fetchCommunityMembership(workshopSlug),
    confirmCommunityMembershipCheckout: vi.fn(),
    openCommunityMembershipSubscriptionPortal: vi.fn(),
    scheduleCommunityMembershipCancellation: vi.fn(),
    reactivateCommunityMembership: vi.fn(),
    startCommunityMembershipPurchase: vi.fn(),
}));

// The checkbox of the design system measures itself, which the test document cannot do.
vi.mock('@/components/ui/checkbox', () => ({
    Checkbox: ({
        checked,
        onCheckedChange,
        ...props
    }: InputHTMLAttributes<HTMLInputElement> & {
        checked?: boolean;
        onCheckedChange?: (isChecked: boolean) => void;
    }) => (
        <input
            {...props}
            type="checkbox"
            checked={checked}
            onChange={(event) => onCheckedChange?.(event.currentTarget.checked)}
        />
    ),
}));

import {
    OnlineWorkshopParticipantPage,
    type WorkshopNavigationDetails,
} from '@/businesses/online-workshop/participant/OnlineWorkshopParticipantPage';

const WORKSHOP: WorkshopDetails = {
    id: '5a7eb2ad-2583-4e98-9640-50bc773b5fde',
    kind: 'workshop',
    event: DEFAULT_EVENT_DETAILS,
    slug: 'produkcni-kod-2026-08-21',
    title: 'Produkční kód s AI agenty',
    description: 'Online workshop s Pavolem Hejným a Jiřím Jahnem.',
    startsAt: '2026-08-21T19:00:00+02:00',
    endsAt: '2026-08-21T20:30:00+02:00',
    youtubeVideoId: 'dQw4w9WgXcQ',
    previewYoutubeVideoId: null,
    repository: null,
    isPublished: true,
    allowedReactions: ['👍'],
    disabledPanels: [],
    createdAt: '2026-08-01T10:00:00+02:00',
    updatedAt: '2026-08-01T10:00:00+02:00',
};

/**
 * Note: The community deliberately keeps a stored stream and a stored start, so these tests prove that the kind of
 *       the room takes the stage and the countdown away rather than an empty setting doing it by accident.
 */
const COMMUNITY: WorkshopDetails = {
    ...WORKSHOP,
    id: '0d6b0f1c-9b0a-4b7e-9c02-6f2f7a3f5f31',
    kind: 'community',
    slug: 'komunita',
    title: 'Komunita Promptbooku',
};

/**
 * A project discussion is the one room which is nobody's membership surface, because it is opened from the community
 * which already showed it.
 */
const PROJECT_DISCUSSION: WorkshopDetails = {
    ...WORKSHOP,
    id: '9b4c1f7e-24a8-4de6-9a1f-0f3f9c5a71d2',
    kind: 'project',
    slug: 'projekt-diskuze',
    title: 'Projekt komunity',
};

const FREE_MEMBERSHIP: CommunityMembershipRoomState = {
    status: 'none',
    monthlyPriceCzk: null,
    currentPeriodEndsAt: null,
    isCancellationScheduled: false,
    isPurchaseOffered: true,
    isSubscriptionManagementOffered: false,
    isCoveredByDiscountCode: false,
    isPaymentInTestMode: false,
};

/**
 * The paid materials of a room as far as a member who has not paid is told about them
 */
const PAID_MEMBERS_ONLY_CONTENT_PREVIEWS: readonly WorkshopContentPreview[] = [
    { id: 'paid-material-1', title: 'Bonusové podklady' },
];

/**
 * An occurrence which is already over by the moment the room is rendered at, so its stage is the closing wrap-up
 *
 * Note: Its stream is deliberately absent, exactly as the server hands the room to a member whose membership does not
 *       unlock the recording of it.
 */
const ENDED_WORKSHOP_WITHOUT_ITS_RECORDING: WorkshopDetails = {
    ...WORKSHOP,
    endsAt: '2026-08-21T19:10:00+02:00',
    youtubeVideoId: null,
};

/**
 * A term which is about a project, together with the branch it follows and where that project runs
 */
const WORKSHOP_ABOUT_A_PROJECT: WorkshopDetails = {
    ...WORKSHOP,
    repository: {
        owner: 'hejny',
        name: 'promptbook',
        branch: 'main',
        deploymentUrl: 'https://workshop.example/app',
    },
};

const ATTACHED_COMMUNITY_POLL: WorkshopPoll = {
    id: 'poll-id',
    question: 'Co si z workshopu odnášíte?',
    isClosed: false,
    isVisible: true,
    createdAt: '2026-08-21T19:00:00+02:00',
    updatedAt: '2026-08-21T19:00:00+02:00',
    options: [
        { id: 'option-1', label: 'Praktické tipy', sortOrder: 0, voteCount: 7, isVotedByParticipant: false },
        { id: 'option-2', label: 'Nové nápady', sortOrder: 1, voteCount: 4, isVotedByParticipant: false },
    ],
    attachedWorkshops: [],
};

/**
 * The workshops a permanent room such as the community leads to
 */
const WORKSHOP_NAVIGATION: WorkshopNavigationDetails = {
    workshops: [
        {
            id: WORKSHOP.id,
            kind: WORKSHOP.kind,
            event: WORKSHOP.event,
            slug: WORKSHOP.slug,
            title: WORKSHOP.title,
            description: WORKSHOP.description,
            startsAt: WORKSHOP.startsAt,
            endsAt: WORKSHOP.endsAt,
            isPublished: WORKSHOP.isPublished,
        },
    ],
    title: 'Workshopy Promptbooku',
    description: 'Vyberte si workshop.',
    emptyMessage: 'Žádný workshop není dostupný.',
    locale: 'cs-CZ',
    timeZone: 'Europe/Prague',
};

function renderParticipantRoom(
    workshop: WorkshopDetails,
    workshopNavigation?: WorkshopNavigationDetails,
    isUsingCachedState = false,
    participantHeaderSupplement?: ReactNode,
    polls: readonly WorkshopPoll[] = [],
    paidMembersOnlyContentPreviews: readonly WorkshopContentPreview[] = [],
    paidMembersOnlyVideo: WorkshopPaidMembersVideo | null = null,
) {
    const state: WorkshopPublicState = {
        serverTime: '2026-08-21T19:30:00+02:00',
        workshop,
        participant: {
            id: 'participant-id',
            fullname: 'Jana Nováková',
            email: 'jana@example.com',
            connectedAt: '2026-08-21T19:20:00+02:00',
            isInteractionBanned: false,
            isTrusted: true,
            isModerator: false,
        },
        watchingParticipantCount: 3,
        contentBlocks: [],
        nextContentUnlockAt: null,
        paidMembersOnlyContentPreviews,
        paidMembersOnlyVideo,
        feedback: null,
        comments: [],
        stageComment: null,
        recentReactions: [],
        reactionCounts: [],
        polls,
    };

    participantMocks.controller = {
        state,
        commentSort: 'recent',
        isCheckingConnection: false,
        isConnectionRequired: false,
        isRefreshing: false,
        isUsingCachedState,
        errorMessage: isUsingCachedState
            ? 'Spojení s workshopem je dočasně nedostupné. Zobrazuje se naposledy uložená verze.'
            : null,
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

    // Note: A member returning to a permanent room opens it without any parameters at all, so the room is rendered
    //       without them here and every identity it shows can only have come from the loaded room itself.
    return render(
        <OnlineWorkshopParticipantPage
            workshopSlug={workshop.slug}
            connectionDetails={{
                title: workshop.title,
                description: workshop.description,
                dateLabel: 'Kdykoli online',
                durationLabel: 'Stálý přístup',
            }}
            calendarDetails={null}
            initialEmail=""
            initialFullname=""
            participantHeaderSupplement={participantHeaderSupplement}
            workshopNavigation={workshopNavigation}
        />,
    );
}

beforeEach(() => {
    window.history.replaceState({}, '', '/cs/online-workshop/participant');
    fetchCommunityMembership.mockResolvedValue(FREE_MEMBERSHIP);
    repositoryProgressMocks.controller = { progress: null, isProgressRead: true, newCommitShas: new Set<string>() };
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('online workshop participant room', () => {
    it('gathers a workshop occurrence around its stage, its reactions, and its watching count', () => {
        const { container } = renderParticipantRoom(WORKSHOP);

        expect(container.querySelector('iframe')).not.toBeNull();
        expect(screen.queryByRole('button', { name: /Reagovat/ })).not.toBeNull();
        expect(screen.queryByText('Sledují 3 lidé')).not.toBeNull();
        expect(screen.getByRole('status', { name: 'Připojeno k serveru' })).not.toBeNull();
    });

    it('leaves a permanent room without the stage, the reactions, and the watching count of a live occurrence', () => {
        const { container } = renderParticipantRoom(COMMUNITY);

        expect(container.querySelector('iframe')).toBeNull();
        expect(screen.queryByRole('button', { name: /Reagovat/ })).toBeNull();
        expect(screen.queryByText('Sledují 3 lidé')).toBeNull();
    });

    it('shows the project a workshop is about, together with what has been committed in it', () => {
        repositoryProgressMocks.controller = {
            progress: {
                // Keep the fields from the former response shape here to ensure the panel only presents commits.
                details: {
                    description: 'A/B testing landing page for Promptbook',
                    defaultBranch: 'main',
                    primaryLanguage: 'TypeScript',
                    starCount: 1,
                },
                commits: [
                    {
                        sha: '6dcb09b5b57875f334f61aebed695e2e4193db5e',
                        message: 'Přidat panel repozitáře',
                        authorName: 'Pavol Hejný',
                        committedAt: '2026-08-21T19:25:00+02:00',
                    },
                ],
                commitCountSinceStart: 2,
                isCommitCountSinceStartComplete: true,
            },
            isProgressRead: true,
            newCommitShas: new Set(['6dcb09b5b57875f334f61aebed695e2e4193db5e']),
        };

        renderParticipantRoom(WORKSHOP_ABOUT_A_PROJECT);

        expect(screen.getByText('hejny/promptbook')).not.toBeNull();
        expect(screen.getByText('Přidat panel repozitáře')).not.toBeNull();
        expect(screen.getByText('Nový')).not.toBeNull();
        expect(screen.getByRole('link', { name: /Živá aplikace/ }).getAttribute('href')).toBe(
            'https://workshop.example/app',
        );

        const repositoryPanel = screen.getByLabelText('Projekt workshopu');
        expect(repositoryPanel.textContent).not.toContain('A/B testing landing page for Promptbook');
        expect(repositoryPanel.textContent).not.toContain('Od začátku workshopu');
        expect(repositoryPanel.textContent).not.toContain('main');
        expect(repositoryPanel.textContent).not.toContain('TypeScript');
        expect(within(repositoryPanel).queryByText('1')).toBeNull();
    });

    it('shows nothing about a project in a room which is about none, and in a room which cannot be about one', () => {
        renderParticipantRoom(WORKSHOP);
        expect(screen.queryByLabelText('Projekt workshopu')).toBeNull();

        cleanup();

        renderParticipantRoom({ ...COMMUNITY, repository: WORKSHOP_ABOUT_A_PROJECT.repository });
        expect(screen.queryByLabelText('Projekt workshopu')).toBeNull();
    });


exec
/bin/zsh -lc "sed -n '360,820p' businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
sed -n '1,260p' lib/workshops/workshopKindCapabilities.ts
sed -n '1,260p' prompts/2026-09-0110-presentation-as-special-material.md
sed -n '1,260p' changelog/_current-preversion.md" in /Users/hejny/work/aldaron
 succeeded in 0ms:

    it('lets a member vote on a visible community poll attached to a workshop', () => {
        renderParticipantRoom(WORKSHOP, undefined, false, undefined, [ATTACHED_COMMUNITY_POLL]);

        expect(screen.getByText('Co si z workshopu odnášíte?')).not.toBeNull();
        expect(screen.getByText('7 · 64 %')).not.toBeNull();
        expect(screen.getByRole('button', { name: /Praktické tipy/ }).hasAttribute('disabled')).toBe(false);
    });

    it('leads from a permanent room to a workshop with the identity the room already verified', () => {
        renderParticipantRoom(COMMUNITY, WORKSHOP_NAVIGATION);

        expect(screen.getByRole('link', { name: new RegExp(WORKSHOP.title) }).getAttribute('href')).toBe(
            `/cs/online-workshop/participant?workshop=${WORKSHOP.slug}&email=jana%40example.com&fullname=Jana+Nov%C3%A1kov%C3%A1`,
        );
    });

    it('leads from a workshop into the permanent community with that very same identity', () => {
        renderParticipantRoom(WORKSHOP);

        const communityLink = screen.getByRole('link', { name: /Vstoupit do komunity/ });
        const materialsSection = screen.getByRole('heading', { name: 'Materiály z workshopu' }).closest('section');

        expect(communityLink.getAttribute('href')).toBe(
            '/cs/komunita?email=jana%40example.com&fullname=Jana+Nov%C3%A1kov%C3%A1',
        );
        expect(materialsSection?.contains(communityLink)).toBe(true);
        expect(communityLink.closest('article')).not.toBeNull();
    });

    it('keeps the community material available to a paying member as well', async () => {
        fetchCommunityMembership.mockResolvedValue({
            status: 'active',
            monthlyPriceCzk: 199,
            currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
            isCancellationScheduled: false,
            isPurchaseOffered: false,
            isSubscriptionManagementOffered: true,
            isCoveredByDiscountCode: false,
            isPaymentInTestMode: false,
        });
        renderParticipantRoom(WORKSHOP);

        await screen.findByRole('button', { name: 'Placené členství. Otevřít stav členství' });
        expect(screen.getByRole('link', { name: /Vstoupit do komunity/ })).not.toBeNull();
    });

    it('invites nobody into the community from the community itself, nor from a project discussion inside it', () => {
        renderParticipantRoom(COMMUNITY);
        expect(screen.queryByRole('link', { name: /Vstoupit do komunity/ })).toBeNull();

        cleanup();

        renderParticipantRoom(PROJECT_DISCUSSION);
        expect(screen.queryByRole('link', { name: /Vstoupit do komunity/ })).toBeNull();
    });

    it('keeps the chat and the materials of the shared room in a permanent room', () => {
        renderParticipantRoom(COMMUNITY);

        expect(screen.queryByText(COMMUNITY.title)).not.toBeNull();
        expect(screen.queryByRole('textbox')).not.toBeNull();
    });

    it('places room-specific membership information beside the participant badge', () => {
        renderParticipantRoom(COMMUNITY, undefined, false, <span>Free členství</span>);

        expect(screen.getByText('Free členství')).toBeTruthy();
    });

    it('says in a workshop occurrence which membership its member has and offers the paid one there', async () => {
        renderParticipantRoom(WORKSHOP);

        const membershipBadge = await screen.findByRole('button', { name: 'Free členství. Otevřít možnosti členství' });
        expect(fetchCommunityMembership).toHaveBeenCalledWith(WORKSHOP.slug);
        expect(screen.queryByRole('dialog')).toBeNull();

        fireEvent.click(membershipBadge);

        expect(await screen.findByRole('dialog', { name: 'Placené členství komunity' })).toBeDefined();
        expect(screen.getByRole('button', { name: 'Zaplatit 199 Kč / měsíc' })).toBeDefined();
    });

    it('lets a paying member manage the very same membership from a workshop occurrence', async () => {
        fetchCommunityMembership.mockResolvedValue({
            status: 'active',
            monthlyPriceCzk: 199,
            currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
            isCancellationScheduled: false,
            isPurchaseOffered: false,
            isSubscriptionManagementOffered: true,
            isCoveredByDiscountCode: false,
            isPaymentInTestMode: false,
        });
        renderParticipantRoom(WORKSHOP);

        fireEvent.click(await screen.findByRole('button', { name: 'Placené členství. Otevřít stav členství' }));

        expect(await screen.findByRole('dialog', { name: 'Placené členství je aktivní' })).toBeDefined();
        expect(screen.getByRole('button', { name: 'Zrušit placené členství' })).toBeDefined();
    });

    it('shows the one membership of the member in the permanent community room as well', async () => {
        renderParticipantRoom(COMMUNITY);

        expect(await screen.findByRole('button', { name: 'Free členství. Otevřít možnosti členství' })).toBeDefined();
        expect(fetchCommunityMembership).toHaveBeenCalledWith(COMMUNITY.slug);
        expect(fetchCommunityMembership).toHaveBeenCalledTimes(1);
    });

    it('asks about no membership in a project discussion, which is opened from the community itself', async () => {
        renderParticipantRoom(PROJECT_DISCUSSION);

        await vi.waitFor(() => expect(screen.queryByText(/členství/i)).toBeNull());
        expect(fetchCommunityMembership).not.toHaveBeenCalled();
    });

    it('keeps a cached room calm with a compact header status instead of an in-content outage warning', () => {
        renderParticipantRoom(COMMUNITY, undefined, true);

        expect(screen.getByRole('button', { name: /Spojení nedostupné/ })).not.toBeNull();
        expect(
            screen.queryByText('Spojení s workshopem je dočasně nedostupné. Zobrazuje se naposledy uložená verze.'),
        ).toBeNull();
    });

    it('names the paid materials and opens the membership offer for a member who has not paid', async () => {
        renderParticipantRoom(WORKSHOP, undefined, false, undefined, [], PAID_MEMBERS_ONLY_CONTENT_PREVIEWS);

        const unlockButton = await screen.findByRole('button', { name: /Koupit placené členství/ });
        expect(screen.getByText('Materiály pro placené členy')).toBeDefined();
        expect(screen.getByText('Bonusové podklady')).toBeDefined();

        fireEvent.click(unlockButton);

        expect(await screen.findByRole('dialog', { name: 'Placené členství komunity' })).toBeDefined();
    });

    it('teases the withheld recording of an ended workshop and opens the membership which unlocks it', async () => {
        const { container } = renderParticipantRoom(
            ENDED_WORKSHOP_WITHOUT_ITS_RECORDING,
            undefined,
            false,
            undefined,
            [],
            [],
            { previewYoutubeVideoId: 'dQw4w9WgXcQ' },
        );

        const unlockButton = await screen.findByRole('button', { name: /Koupit placené členství/ });
        expect(screen.getByRole('heading', { name: 'Děkujeme, že jste byli u toho!' })).toBeDefined();
        expect(screen.getByText('Záznam workshopu je pro placené členy')).toBeDefined();
        expect(container.querySelector('iframe')?.getAttribute('src')).toContain(
            'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
        );

        fireEvent.click(unlockButton);

        expect(await screen.findByRole('dialog', { name: 'Placené členství komunity' })).toBeDefined();
    });

    it('says the recording is for paid members even when no teaser of it was published', async () => {
        const { container } = renderParticipantRoom(
            ENDED_WORKSHOP_WITHOUT_ITS_RECORDING,
            undefined,
            false,
            undefined,
            [],
            [],
            { previewYoutubeVideoId: null },
        );

        await screen.findByRole('button', { name: /Koupit placené členství/ });
        expect(screen.getByText('Záznam workshopu je pro placené členy')).toBeDefined();
        expect(container.querySelector('iframe')).toBeNull();
    });

    it('shows no paid-materials notice to a member whose membership already unlocked them, nor in a room with none', async () => {
        fetchCommunityMembership.mockResolvedValue({
            status: 'active',
            monthlyPriceCzk: 199,
            currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
            isCancellationScheduled: false,
            isPurchaseOffered: false,
            isSubscriptionManagementOffered: true,
            isCoveredByDiscountCode: false,
            isPaymentInTestMode: false,
        });
        renderParticipantRoom(WORKSHOP, undefined, false, undefined, [], PAID_MEMBERS_ONLY_CONTENT_PREVIEWS);

        await screen.findByRole('button', { name: 'Placené členství. Otevřít stav členství' });
        expect(screen.queryByText('Materiály pro placené členy')).toBeNull();

        fetchCommunityMembership.mockResolvedValue(FREE_MEMBERSHIP);
        cleanup();
        renderParticipantRoom(WORKSHOP);

        await screen.findByRole('button', { name: 'Free členství. Otevřít možnosti členství' });
        expect(screen.queryByText('Materiály pro placené členy')).toBeNull();
    });
});
import type { WorkshopKind } from '@/lib/workshops/workshopTypes';

/**
 * What a room of one kind is, so that a screen asks for the capability it needs instead of naming the kind itself
 */
export type WorkshopKindCapabilities = {
    /**
     * Whether exactly one room of this kind exists, so nothing offers a choice between rooms or the creation of another
     */
    readonly isSingleton: boolean;

    /**
     * Whether the URL of a room is decided once and for all, so its administration neither offers it nor lets an edit
     * disconnect the links leading to it
     */
    readonly isSlugFixed: boolean;

    /**
     * Whether a room happens at a time, so it has a start, an end, and a countdown towards it
     */
    readonly isScheduled: boolean;

    /**
     * Whether a room is one term of a public event, so it says which kind of event it is, where it is held, what it
     * costs, and how many people fit into it
     */
    readonly isEvent: boolean;

    /**
     * Whether a room gathers its participants around a shared stage with a video stream
     */
    readonly isStageOffered: boolean;

    /**
     * Whether a room can be about a project, so its administration connects a repository to it and the room shows what
     * is being built in that repository while the room runs
     */
    readonly isRepositoryOffered: boolean;

    /**
     * Whether the room offers member polls, which are currently the permanent community's way to make a decision
     * together without turning an individual live workshop into a survey.
     */
    readonly isPollsOffered: boolean;

    /**
     * Whether this room can show a community poll which is attached to it. A workshop occurrence is the subject of
     * such a poll rather than its owner, so it shows and changes the one common e-mail-owned vote there.
     */
    readonly isAttachedCommunityPollsShown: boolean;

    /**
     * Whether a room says which membership of the community the connected member has, and lets them buy and manage it
     * without leaving the room
     *
     * Note: The membership belongs to the address a member connects with rather than to one room, so every room which
     *       offers it reads and changes the very same membership.
     */
    readonly isMembershipOffered: boolean;

    /**
     * Whether a room leads its participants on into the permanent community, which is where everything outlasting one
     * term is kept
     *
     * Note: The community never invites anybody into itself, and a project discussion is opened from the community
     *       which already showed that project, so only a room a member can reach without the community offers the way
     *       there.
     */
    readonly isCommunityInvitationOffered: boolean;

    /**
     * Whether a participant can end their own session in this room and be offered its connection form again, which
     * they read as signing out of it
     *
     * Note: Only a room a participant connected to themselves is left this way. The session of a project discussion is
     *       made out of the community session which opened it, so signing out there would be undone by the very next
     *       visit; a member of a project discussion signs out of the community instead.
     */
    readonly isDisconnectionOffered: boolean;

    /**
     * Whether a room updates itself while it is open, which its broadcast, its reactions, and its watching count need
     */
    readonly isRealtime: boolean;
};

/**
 * Every room kind together with what it is
 *
 * Note: A workshop occurrence is the live event this infrastructure was built for. The community reuses the very same
 *       secured room, but is one permanent, calm space rather than an occurrence which starts, streams, and ends.
 * Note: This is the one place a room kind is described. Every screen reads it, so a kind added later needs no change
 *       of the room, of its administration, or of the routes behind them.
 */
const WORKSHOP_KIND_CAPABILITY_DEFINITIONS: Readonly<Record<WorkshopKind, WorkshopKindCapabilities>> = {
    workshop: {
        isSingleton: false,
        isSlugFixed: false,
        isScheduled: true,
        isEvent: true,
        isStageOffered: true,
        isRepositoryOffered: true,
        isPollsOffered: false,
        isAttachedCommunityPollsShown: true,
        isMembershipOffered: true,
        isCommunityInvitationOffered: true,
        isDisconnectionOffered: true,
        isRealtime: true,
    },
    community: {
        isSingleton: true,
        isSlugFixed: true,
        isScheduled: false,
        isEvent: false,
        isStageOffered: false,
        isRepositoryOffered: false,
        isPollsOffered: true,
        isAttachedCommunityPollsShown: false,
        isMembershipOffered: true,
        isCommunityInvitationOffered: false,
        isDisconnectionOffered: true,
        isRealtime: false,
    },
    project: {
        isSingleton: false,
        isSlugFixed: true,
        isScheduled: false,
        isEvent: false,
        isStageOffered: false,
        isRepositoryOffered: false,
        isPollsOffered: false,
        isAttachedCommunityPollsShown: false,
        isMembershipOffered: false,
        isCommunityInvitationOffered: false,
        isDisconnectionOffered: false,
        isRealtime: false,
    },
};

export function getWorkshopKindCapabilities(workshopKind: WorkshopKind): WorkshopKindCapabilities {
    return WORKSHOP_KIND_CAPABILITY_DEFINITIONS[workshopKind];
}

/**
 * Whether a member room can show and vote on visible community polls. Community owns and administers them, while a
 * workshop occurrence can use the same vote only for polls the community attached to it.
 */
export function isWorkshopPollVisibleInRoom(workshopKind: WorkshopKind): boolean {
    const { isPollsOffered, isAttachedCommunityPollsShown } = getWorkshopKindCapabilities(workshopKind);
    return isPollsOffered || isAttachedCommunityPollsShown;
}

/**
 * The settings of a room which its kind does not have at all
 */
const WORKSHOP_SCHEDULE_FIELD_NAMES = ['startsAt', 'endsAt'] as const;
const WORKSHOP_STAGE_FIELD_NAMES = ['youtubeVideoId', 'previewYoutubeVideoId'] as const;
const WORKSHOP_REPOSITORY_FIELD_NAMES = ['repository'] as const;
const WORKSHOP_SLUG_FIELD_NAMES = ['slug'] as const;
const WORKSHOP_EVENT_FIELD_NAMES = [
    'eventType',
    'locationKind',
    'locationLabel',
    'priceCzk',
    'maximumParticipantCount',
] as const;

/**
 * The written settings which the kind of a room does not have
 *
 * Note: The administration already leaves these settings out of its form, so this only refuses a stale or a forged
 *       request which would give a calm room a schedule, a stage, or a project that nothing in it could ever show, or
 *       move the only room of its kind to an address every link to it would miss.
 */
export function getUnsupportedWorkshopKindFieldNames(
    workshopKind: WorkshopKind,
    values: Readonly<Record<string, unknown>>,
): readonly string[] {
    const capabilities = getWorkshopKindCapabilities(workshopKind);
    const unsupportedFieldNames = [
        ...(capabilities.isScheduled ? [] : WORKSHOP_SCHEDULE_FIELD_NAMES),
        ...(capabilities.isEvent ? [] : WORKSHOP_EVENT_FIELD_NAMES),
        ...(capabilities.isStageOffered ? [] : WORKSHOP_STAGE_FIELD_NAMES),
        ...(capabilities.isRepositoryOffered ? [] : WORKSHOP_REPOSITORY_FIELD_NAMES),
        ...(capabilities.isSlugFixed ? WORKSHOP_SLUG_FIELD_NAMES : []),
    ];

    return unsupportedFieldNames.filter((fieldName) => values[fieldName] !== undefined);
}
[ ]

[✨💻] Add option to link presentation of the workshop

- Presentation is a similar concept to a connected repository or workshop video.
- The presentation should appear alongside the materials as a material for all participants (both paying and non-paying)
- Presentation can be both a PDF, PPT or link to the GitHub Markdown. 
- You are working with page `/cs/online-workshop/participant?workshop=`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

![alt text](prompts/screenshots/2026-09-0110-presentation-as-special-material.png)# Current preversion
- Moved the community hand-off in `/cs/online-workshop/participant` into the materials list as a dedicated
  community material. It is shown even before an administrator has unlocked any ordinary material and remains
  available to free and paid members alike, while carrying the participant identity through the existing shared
  community link. The material list now has one reusable special-material slot for room features that belong beside
  ordinary materials without becoming timed or membership-gated workshop content.

- Let an administrator make a prefix discount code by ending it in `*`: `SUMMER*` now gives its configured discount
  to every submitted code starting with `SUMMER`. The same database resolver supplies form previews and the atomic
  registration consumption, so one path cannot accept a code which the other would reject; an exact code takes
  precedence over a pattern, then the more specific prefix wins.

- Let `/admin/workshops` reopen a workshop by clearing its recorded end, and give an open-ended workshop quick choices to end now, one hour after its start, or two hours after its start; each choice uses the existing live update, so `/cs/online-workshop/participant` immediately keeps or replaces the stream accordingly.
- Let a paid community member open their Stripe Customer Portal from the membership popup of `/cs/komunita`, through
  a new short-lived, authenticated link which belongs only to that member and returns them to the community. The
  portal is now available alongside, rather than instead of, the confirmed in-app cancellation and reactivation of
  the next renewal, so card and invoice management stays with Stripe while the simple cancellation remains where the
  member already sees their membership.

- Let a paid member manage renewal directly in the membership popup of `/cs/komunita`: after an explicit confirmation,
  they can stop the next Stripe payment without losing the days they have already paid for. The modal and its header
  badge say that the membership is ending and name the last paid day, then offer one-click reactivation until that day.
  The room saves and reads this intent through the same subscription-state mapping as the Stripe webhook, so a refresh,
  a later payment event and the member-facing state cannot disagree.

- Moved the community membership surface out of the `/cs/komunita` content column into the room’s shared popup
  modal. Both the `Free členství` and `Placené členství` header badges now open it, so a member can see their current
  status or the paid plan, agree to the terms, apply a discount, and enter the same Stripe checkout without leaving
  the community or scrolling past its materials. A return from Stripe opens that modal as well, preserving the clear
  paid or cancelled result the in-page surface previously showed.

- Added the paid-membership administration to `/admin/community`: its new `Placená členství` tab pages, filters and
  sorts the durable payment records by name, e-mail, lifecycle status and Stripe environment, shows the price,
  discount, payment identifiers and important lifecycle dates, and opens the exact checkout or subscription in Stripe
  for the payment changes which Stripe remains authoritative for. The existing `Účastníci` table now gives every
  community session the same shared membership-status badge, including the explicit free state, from one batched
  e-mail lookup. Each badge opens that member's payment record and each payment record opens their community
  participant history, so the two administration views stay directly connected without pretending one room session is
  the durable paid membership.

- Show every visible community poll attached to an occurrence inside that occurrence's participant room, including its
  current aggregate and the same attached-workshop labels the community and administration use. The workshop room reads
  the poll without copying it or inventing a second voting system: polls remain owned and edited in the community,
  while one e-mail-owned vote is shown and counted consistently wherever that attached poll is visible.

- Let a member buy the paid community membership inside `/cs/komunita` itself, through the Stripe payment gate, without
  ever leaving for the public membership page. The room already knows who is reading it, so it asks for nothing but a
  discount code and the agreement to its terms, then opens the gate for the monthly price this application decides -
  including a code's permanent discount or the temporary discount it grants for its configured first monthly renewals.
  The membership of a member is the same membership however often they reconnect, because it belongs to the address
  they connect with. A
  member who comes back from the gate has their payment confirmed against it immediately, while the webhook of the gate
  keeps following the subscription afterwards, so a cancelled membership, a failed payment and a payment which finished
  after the browser was closed all reach the room. The badge in the room header now says which membership its member
  has and leads a free member to that offer instead of to the landing page, a paying member is never sold the same
  membership again, and a member whose payment failed keeps their membership while the gate is still trying. A server
  which was given no Stripe key offers nothing at all rather than a button which cannot work, and a server on test keys
  says so beside the payment and names the test card, so a rehearsal is never mistaken for a real payment. How to
  configure the gate is written in `AGENT_MESSAGE.md`.

- Put community projects through the same moderation lifecycle as chat messages. A regular member's newly shared
  project waits for a community moderator or an administrator, while a trusted member or moderator has their project
  approved immediately by the same shared submission policy. Pending cards stay visible only to their author and the
  moderators deciding them; until approved they cannot be voted on or opened into a public project discussion. A
  community moderator can decide from the project gallery, and `/admin/community` now has the complete project queue,
  including rejected cards, so an administrator can approve, reject, and audit every decision.

- Made the material QR codes in the workshop and community rooms compact and square. Their shared renderer now owns
  the exact canvas dimensions and removes browser baseline space, while each material uses only the code's built-in
  scannable white quiet zone rather than a second padded white card. The redundant `Otevřít v telefonu` caption is
  gone; when one material has several links, the short label below each code remains to distinguish them.

- Made every wide table in the administration usable without travelling to its last row first: a shared table viewport
  now mirrors horizontal scrolling into a clearly visible bar fixed to the bottom of the screen while that table is in
  view, yet keeps the native scrollbar as a fallback. The participant, contact, discount-code and short-link tables
  all use it, and their useful identity column — the participant or contact name, a discount code, or a shortcode —
  stays pinned while the rest is explored.
- Said on every term of `/cs/online-workshop` which workshop it is. Each card of the picker now names the workshop
  held on that date and says what it is about, in the very words `/admin/workshops` wrote about that term, so a
  visitor chooses a subject rather than guessing behind which of four dates the topic they came for is hiding. What a
  term is about is read from the term itself and is now part of every list of terms rather than of the live room
  alone, so the room and the list can never describe one term in two different ways. Both landing pages which let a
  visitor choose between the terms of their event now offer them with the very same card: `/ai-supervize-mini` keeps
  choosing its terms by when and where they are held, because its terms are the same workshop in another form, and
  reads their form and price from the administered event instead of from words written into the page.

- Put the terms listed on `/cs/komunita` into a calendar. The terms of every kind of event are now read as a month of
  a Czech calendar, which is what the room opens on: its weeks start on Monday, its days are dated in Prague, and each
  day is coloured by whether what is held on it is over, running, or still ahead. Choosing a day narrows the cards
  under the month to that day, and a day nothing is held on cannot be chosen at all. The very same terms are still
  read as cards, which now carry that same colour as a badge saying where the term stands in time, so the calendar and
  the cards can never say two different things about one term. A month a member is in which has no term at all is not
  opened on — the calendar opens on the month of the term which matters most instead of on an empty grid.

- Offered the whole calendar of those terms to the calendar application of a member. It is published at
  `/cs/komunita/calendar.ics` and taken either into Google Calendar or into any application which subscribes to
  `webcal:`, so a term which is published, moved or withdrawn later reaches everybody who took it without anybody
  deploying anything. The published calendar names no member: it carries neither an e-mail nor a name, leads to the
  public page of every term, leaves out the permanent community room which is no term of anything, and identifies each
  term by its own slug, so a renamed or moved term is corrected in a calendar which already knows it rather than
  appearing in it twice.

- Put the real community on `/cs/komunita/clenstvi`. The window in its header is no longer an invented conversation:
  it says how many members the community has, shows the newest approved messages of its chat in the order they were
  written, marks the moderators among their authors, and counts the messages and reactions the members really sent.
  Only the flight of the reactions is still made up, because nobody is reacting while a landing page is being read —
  which reactions fly is read from the ones the rooms celebrated most recently.

- Said the rest of the community on the same page out of the same source. The archive block now names the webinars
  which are really published, each with the day it is held on, and says how many have already been broadcast instead
  of listing four topics written by hand. A new section below it counts the members, the broadcast webinars, the
  messages and the reactions, shows the projects members shared with their preview, author and support, and gives the
  most chosen answers of the community poll. Nothing of it is claimed when it did not happen: a total of nothing is
  left out, a poll nobody answered is not shown, and the whole section disappears when the community has nothing to
  show yet. A member is named by their first name alone, so a page anybody can open never carries more of an identity
  than the room already showed.

- Replaced the stack of repeated registration forms on `/cs/online-workshop` with one clear term picker and one shared
  form. Every published online workshop is now a selectable date-and-time card, modelled after the picker on
  `/ai-supervize-mini`; choosing another card keeps the already entered name, e-mail and phone number, updates the
  selected workshop summary, and records that exact term in the registration and confirmation link. When no term is
  published, the page still shows a notice rather than a form that cannot be submitted.

- Let the host put a question on the live stage from `/admin/workshops`. In the `Komentáře` section, any attendee
  question which has not been rejected can now be sent above the stream of `/cs/online-workshop/participant`, replaced
  with another question, or hidden again; the artificial-comment form also has one action which creates arbitrary text
  and sends it to the stage immediately. Every connected attendee receives the change through the same private live
  channel as reactions, while the selected comment is kept as the room's current stage question so late joiners and
  reconnecting attendees see the same thing instead of missing a transient announcement. The database retains one
  comment reference rather than duplicating a message body, refuses a question from another workshop or a rejected
  comment, and clears a selected question if it is later rejected or deleted.

- Told apart the people who really attend a workshop from the people who only have it running. The room of
  `/cs/online-workshop/participant` now watches whether somebody is at their computer or phone at all — whether they
  move a pointer, type, scroll or touch the screen — and says so in the presence heartbeat it already sends, so every
  measured minute of a room is either actively or passively attended. Somebody who is watching without moving a hand
  for a while stays active, because the room waits two minutes of complete stillness before it decides that a chair is
  empty; somebody who left the tab open and walked away becomes passive and turns active again the moment they come
  back. Nothing new is asked of the browser and nothing is stored twice: the very same presence sample which already
  counted the audience now also remembers how that minute was attended.

  The overview graph of `/admin/workshops` and `/admin/community` draws it: next to `Diváci`, which is everybody who
  had the room open, there are now `Aktivní diváci` and `Pasivní diváci`, dashed in the colour of the audience they
  are a part of so that a reader sees at a glance how much of the room was really watching. The active audience is
  drawn from the start and the passive one is one click away, both are exported into the CSV and the picture of the
  graph like every other line, and which of them a graph draws travels in its link as usual. The time an individual
  participant is listed with is now named `Čas v místnosti` throughout the administration and its exports, because it
  has always meant how long that person had the room open rather than how attentively they watched it.

- Let a workshop have no end at all. A term whose end is left empty in `/admin/workshops` now runs from its start for
  as long as it takes: `/cs/online-workshop/participant` keeps its stream on the stage and its room open indefinitely
  instead of declaring the workshop over an hour after it started, which is what an unwritten end used to mean. The
  settings of such a running term offer an `Ukončit workshop` button which writes the current moment as its end, so
  the room replaces the stage with the closing wrap-up and its feedback the moment the workshop really ends, and the
  administration lists the term as finished. An end is still typed in by hand whenever it is known in advance, and a
  term whose end is open is still announced with the usual length of a workshop where a duration has to be named
  before the fact, such as in a calendar invitation.

- Made every event term of every kind of event administered from the one place and stored in the one table. A room
  which happens at a time is now a term of an event: it says which kind of event it is, whether it is held online or
  at a place, what one seat costs, and how many people fit into it. The administration of workshops asks these
  questions in the very same fields whether a term is being created or edited, and offering another kind of event
  means describing it in the event registry of the application rather than migrating the database or changing any
  page which lists terms.

- Removed the hard-coded terms of `/ai-supervize-mini` from the application. The page now lists the terms which the
  administration really published: its header, its hero, its dates, places, prices, capacities, the FAQ answers about
  the schedule, the capacity and the price, the registration form and the participant information page all read the
  same administered terms, so a term added, moved, withdrawn or repriced changes the page without a deploy. A term
  which is held somewhere names that place, a term held online says so, and a price of zero is presented as a free
  event. While no term is published, the page offers a short notice instead of a form nobody could submit. The seats
  already reserved keep being counted against the very same terms, because a registration written before this change
  named its term by the day it is held on and that identifier is still honoured.

- Listed the terms of every kind of event on `/cs/komunita`, each with the kind of event it is, its form and place,
  and its price. Where a term leads is now decided by the kind of event it is a term of: a term with a live room
  leads into that room carrying the already verified identity of the member, while a term without one leads to its
  landing page. Community polls about terms follow the same rule, so a poll about a paid workshop no longer offers a
  room that workshop does not have.

- Added a clickable `Free členství` badge beside the signed-in member information in `/cs/komunita`. It opens the
  existing membership page with the benefits of the paid membership, while the shared participant-room header now
  exposes a reusable slot for room-specific member information instead of duplicating its layout for the community.

- Simplified `/cs/komunita/clenstvi` to two easy-to-understand choices: the community and live AI webinars remain
  free, while one paid membership costs 199 Kč per month and can be cancelled anytime. The paid offer now focuses on
  webinar recordings and their archive, practical materials, additional content, priority questions and the existing
  paid-member Discord/community features; it no longer presents Standard versus Premium, annual billing or a free
  trial. New registrations are stored as a monthly payment request without a trial under a new plan id, while the
  legacy Standard/Premium plans, their billing terms and previously agreed prices remain supported for existing
  registrations. Discount codes, personalized name copy and e-mail prefilling continue to work.

- Added click analytics to `/admin/shortener`: every short link now shows its count of recorded public navigations,
  and its clickable count opens a private, newest-first history with timestamps, IP addresses, referrers, user agents,
  languages, platforms, and—for landing pages—the time the visitor opened the destination. The list search, provenance
  filters, sorting, and selected click history are all held in GET parameters, so an administrator can bookmark or
  share the exact view without exposing click metadata through the public short-link endpoint.

- Moved every community-project mutation out of PostgreSQL procedures and triggers into backend-owned transactions.
  Creating a project now generates its UUIDs and initial session hash in Node, makes the project room and author
  moderator together, and validates the member identity there; opening a discussion reuses or creates exactly one mapped room
  identity; and voting calculates the Reddit-style transition and both cached totals under a locked project row. The
  forward migration removes the old project-specific RPCs, identity/count/timestamp triggers, and the extension-backed
  project-ID default, so `gen_random_bytes(integer)` is no longer evaluated by this flow while foreign keys, uniqueness,
  RLS, and column constraints remain the database's storage boundary. Deleting a community member now removes their
  votes and reconciles the affected totals in that same backend transaction; a restrictive foreign key prevents a
  cascading delete from silently bypassing that reconciliation.

- Let a community poll be about workshop occurrences. The editor of `/admin/community?tab=polls` now offers every
  workshop beside the question and its choices; one poll can name several occurrences and one occurrence can be the
  subject of several polls. The shared transaction writes those attachments together with a poll and its settings.
  `/admin/workshops` now shows an attached community poll in a read-only `Ankety` section with its running result
  and a link to where it is administered, so no poll is editable from two places. Members of `/cs/komunita` see the
  published attached workshops beneath the poll as identity-prefilled room links, while drafts remain admin-only. The
  database enforces the many-to-many relationship, accepts only workshop occurrences as subjects, and removes an
  attachment when either its poll or workshop is removed.

- Added community project sharing to `/cs/komunita`: the room now places a three-column project gallery directly below
  the workshop links and above the materials, ordered by upvotes. Its home view shows the five strongest projects and a
  sixth “Další projekty” card which opens `/cs/komunita/projects` for the whole gallery. Members can vote one way per
  project with Reddit-style up/down controls, changing or removing their own vote without creating duplicate records.
  A two-step popup starts with only a URL, safely fetches its public Open Graph title, description and image, then lets
  the member edit the copy before saving the card. Every project also has `/cs/komunita/projects/<project_id>`, where
  the preview sits beside the existing moderated workshop chat; the author is connected as that discussion’s moderator
  automatically, while all project sessions still derive from the member’s existing community identity rather than
  creating a parallel sign-in system.

- Made community polls fully manageable from `/admin/community?tab=polls`: an administrator can now edit a question,
  preserve, add, remove or reorder its choices, switch voting and member visibility independently, and permanently
  delete a poll with all of its votes. The same shared poll editor supports both new and existing polls, so the
  community keeps using the workshop-room administration rather than growing a parallel dashboard. Each option also
  has a separately recorded artificial aggregate which can be adjusted without impersonating a member; create a poll
  hidden, seed those counts, then publish it to start the community with prepared results. Members of `/cs/komunita`
  see only visible polls and the combined anonymous totals, while database-side locking keeps a concurrent close or
  hide from accepting a last vote.

- Added `npm run backup-database:verify` and its terminal shortcut. It has `pg_restore` read the catalogue of the newest completed `.dump` archive in `backups/`, excluding interrupted temporary files, without connecting to or changing a database. Backup and verification share PostgreSQL-client invocation and platform-specific missing-client instructions, and the backup shortcut now calls only the canonical backup command instead of producing a duplicate `backup.sql`.

- Let moderators and administration-created artificial messages of `/cs/online-workshop/participant` and `/cs/komunita` carry active links while keeping every normal participant's URLs inert text. Eligible links now follow the same persisted ad hoc `ptbk.io` shortener path as materials, including their UTM source record and shortener redirect click measurement; the safe chat renderer opens only those already-shortened URLs in a new tab, so a raw destination cannot become an untracked active link.

- Made the workshop-feedback star picker preview the score under the pointer: empty stars now fill through the hovered score, so choosing a rating is visible before it is saved; the same preview appears while a keyboard user focuses a star.

- Added `/cs/komunita/clenstvi`, the Czech Premium membership landing page for developers, creators and small-business owners. Basic, Standard and Premium come from one inherited feature catalogue and a responsive comparison table; the page defaults to the concrete yearly prices of 1,800 Kč and 9,000 Kč, always shows their monthly equivalent beside the crossed-out monthly price, lets visitors switch to monthly billing, and gives both paid plans a seven-day trial. `fullname` personalizes the page, `fullname` and `email` pre-fill its registration, and the existing workshop `</>` and emoji animations form the community illustration. Community discount codes now validate and combine with the yearly price, limited codes are consumed by the server, and the accepted plan, trial, discount and guaranteed price are recorded with the Contact registration for e-mail activation because this application has no payment provider. The membership terms now cover the price guarantee and operator changes, suspension or termination while preserving non-waivable consumer rights.

- Added community polls to `/cs/komunita`: a signed-in administrator creates a question and two to eight choices from the new `Ankety` section of `/admin/community`, members choose one answer and may change that answer while voting remains open, and everybody sees only the aggregate result rather than who chose it. Ending a poll leaves its result readable and atomically refuses any last-moment vote. The community uses the existing shared room and administration rather than a parallel page, while the new RLS-secured tables, composite foreign keys, transactional poll creation and database-side vote guard keep every choice inside its community and attributable only to its own member.

- Put a branded QR code beside every linked material on the desktop layouts of `/cs/online-workshop/participant` and `/cs/komunita`. Each code carries the persisted public short URL prepared when `/admin/workshops` saves the material, so scanning it on a phone follows the exact same redirect and click tracking as opening, copying, or forwarding the material link; mobile layouts keep the panel out of the way. The shortener and the shared participant room now both use one client-only Promptbook QR renderer instead of loading separate implementations.

- Routed every HTTP(S) material link of `/cs/online-workshop/participant` and `/cs/komunita` through a persisted ad hoc `ptbk.io` short link, including ordinary Markdown, HTML, reference, autolink and bare-URL forms. The participant room no longer posts browser click events: opening, copying or forwarding the same short address is measured only by the shortener redirect, and `/admin/workshops` now derives material totals and its activity graph from those redirect records. Per-participant material-click figures were removed because a shareable public link cannot honestly identify the workshop participant who opened it. The shortener now records whether a link was manually created or ad hoc and which application created it, and `/admin/shortener` can display, filter and sort by both properties.

- Made `/cs/online-workshop/participant` survive a temporary overloaded or unavailable backend after it has been opened once: every successful room snapshot is now kept in the browser under its own workshop slug, for no longer than the participant session, and a failed refresh leaves the stream, countdown, chat and materials on the last known version instead of replacing the room with an error. A small shared status dot in the upper-right corner now quietly changes from green “Připojeno” to amber while the saved version is shown, keeps the detailed explanation in its tooltip and accessible label, and lets a participant retry immediately; it also serves `/cs/komunita` through the common participant room. The room keeps trying with a jittered exponential backoff rather than sending a whole audience back every half minute, and pauses nonessential presence reports until the service answers again; an authoritative missing-room or missing-session answer removes the private saved copy. The `state-changed` broadcasts already sent for every content and setting change in `/admin/workshops` make the next successful refresh replace that copy, so no second cache or migration is needed there.

- Added a small service worker for the online-workshop funnel: the landing page, confirmation and room prepare the already loaded Next.js assets, and every canonical participant document (`?workshop=…`) is saved network-first under that exact workshop selection. When the application server answers with an overload error or cannot be reached, a visitor who has opened that term before receives their local application shell and its matching room snapshot; prefilled e-mail/name URLs and legacy links without a selected workshop are deliberately never reused as a cached page.

- Added the third, post-workshop stage to `/cs/online-workshop/participant`: when an occurrence ends, the live video is replaced with a thank-you wrap-up, a progressively saved star review (low scores ask what to improve first; high scores ask what helped first), and a direct link to the chosen follow-up material. Chat and reactions remain available throughout. One ordinary Markdown material can now be marked as the follow-up; it is highlighted in the material list before the end and is enforced as a single selection per workshop in the database.

- Added the private `Zpětná vazba` section to `/admin/workshops`, with each rating, partial written response, and its linked Contact context. The same feedback joins the existing contact projection, so `/admin/contacts` and its CSV, vCard, and Book exports show a person's workshop feedback beside their Contact records and attendance history without duplicating source data.

- Verified `npm run test-for-ptbk-coder` locally: ESLint, TypeScript, the production build, and the public Playwright suite complete successfully. The two published-online-workshop scenarios remain intentionally skipped when no published workshop is available, while the other nine public scenarios pass.


codex
The existing room already has a reusable `specialMaterials` slot: it keeps links like the community hand-off in the same list as materials without subjecting them to timed or paid-member gating. I’m now checking the repository data path and the intended card treatment so the repository uses that same seam instead of adding a second materials system.
exec
/bin/zsh -lc "rg -n \"<OnlineWorkshopParticipantPage|isMaterialsShown|specialMaterials|WorkshopRepositoryPanel\" --glob '*.{ts,tsx}' . --glob '"'!node_modules/**'"' && rg -n \"repository\" businesses/workshop-admin lib/workshops app/api/admin/workshops --glob '*.{ts,tsx}' | head -n 300 && rg -n \"WorkshopContent\" --glob '*.{ts,tsx}'" in /Users/hejny/work/aldaron
 succeeded in 0ms:
./businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx:263:        <OnlineWorkshopParticipantPage
./businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.tsx:79:        <OnlineWorkshopParticipantPage
./businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx:18:type WorkshopRepositoryPanelProps = {
./businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx:43:export function WorkshopRepositoryPanel({ repository, progressController }: WorkshopRepositoryPanelProps) {
./businesses/online-workshop/participant/WorkshopContent.tsx:42:    readonly specialMaterials?: readonly WorkshopSpecialMaterial[];
./businesses/online-workshop/participant/WorkshopContent.tsx:230:    specialMaterials = [],
./businesses/online-workshop/participant/WorkshopContent.tsx:240:    const isSpecialMaterialShown = specialMaterials.length > 0;
./businesses/online-workshop/participant/WorkshopContent.tsx:303:                {specialMaterials.map((specialMaterial) => (
./businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx:17:import { WorkshopRepositoryPanel } from '@/businesses/online-workshop/participant/WorkshopRepositoryPanel';
./businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx:101:    readonly isMaterialsShown?: boolean;
./businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx:130:    isMaterialsShown = true,
./businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx:232:    const specialMaterials = roomCapabilities.isCommunityInvitationOffered
./businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx:331:                        <WorkshopRepositoryPanel
./businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx:390:                {isMaterialsShown && (
./businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx:397:                            specialMaterials={specialMaterials}
./businesses/online-workshop/participant/WorkshopContent.test.tsx:82:    specialMaterials: readonly WorkshopSpecialMaterial[] = [],
./businesses/online-workshop/participant/WorkshopContent.test.tsx:90:            specialMaterials={specialMaterials}
./businesses/community/projects/CommunityProjectDiscussionPage.tsx:89:        <OnlineWorkshopParticipantPage
./businesses/community/projects/CommunityProjectDiscussionPage.tsx:108:            isMaterialsShown={false}
./businesses/community/CommunityParticipantPage.tsx:32:        <OnlineWorkshopParticipantPage
businesses/workshop-admin/WorkshopSettingsForm.tsx:67:    const [repositoryDraft, setRepositoryDraft] = useState(() => createWorkshopRepositoryDraft(workshop.repository));
businesses/workshop-admin/WorkshopSettingsForm.tsx:100:        setRepositoryDraft(createWorkshopRepositoryDraft(workshop.repository));
businesses/workshop-admin/WorkshopSettingsForm.tsx:136:                ? { repository: createWorkshopRepositoryWriteValues(repositoryDraft) }
businesses/workshop-admin/WorkshopSettingsForm.tsx:280:                    <WorkshopRepositoryFields repository={repositoryDraft} onChange={setRepositoryDraft} />
lib/workshops/fetchWorkshopRepositoryProgress.test.ts:45:describe('workshop repository progress branch patterns', () => {
lib/workshops/workshopRepositoryMonitor.test.ts:59:describe('workshop repository monitor', () => {
lib/workshops/workshopRepositoryMonitor.test.ts:72:    it('shares one repository read between rooms during the cache window', async () => {
lib/workshops/workshopRepositoryMonitor.test.ts:76:            watchWorkshopRepository({ repository: REPOSITORY, room: createRoom('first-room'), supabase: {} as never }),
lib/workshops/workshopRepositoryMonitor.test.ts:77:            watchWorkshopRepository({ repository: REPOSITORY, room: createRoom('second-room'), supabase: {} as never }),
lib/workshops/workshopRepositoryMonitor.test.ts:83:        await watchWorkshopRepository({ repository: REPOSITORY, room: createRoom('first-room'), supabase: {} as never });
lib/workshops/workshopRepositoryMonitor.test.ts:91:            repository: REPOSITORY_WITH_NOTIFICATIONS,
lib/workshops/workshopRepositoryMonitor.test.ts:97:            repository: REPOSITORY_WITH_NOTIFICATIONS,
lib/workshops/workshopRepositoryMonitor.test.ts:108:            { kind: 'repository-commit', commit: NEW_PROGRESS.commits[0] },
lib/workshops/workshopRepositoryMonitor.test.ts:114:            { kind: 'repository-commit', commit: NEW_PROGRESS.commits[0] },
lib/workshops/workshopRepositoryProgress.ts:17: *       repository feed could not be read at all and the room says so instead of claiming that nothing was committed.
lib/workshops/workshopRepositoryProgress.ts:85: * The commits which arrived since the room last read the repository
lib/workshops/workshopRepositoryProgress.ts:98: * Selects the complete commits which were not in the room's previous repository answer
businesses/workshop-admin/workshopAdminSnapshot.test.ts:19:            repository: null,
lib/workshops/workshopRepository.test.ts:5:    it('is read as the repository, the branch which is followed, and where the project runs', () => {
lib/workshops/workshopRepository.test.ts:8:                repository: 'hejny/promptbook',
lib/workshops/workshopRepository.test.ts:23:                repository: 'hejny/promptbook',
lib/workshops/workshopRepository.test.ts:34:            createWorkshopRepositoryOrNull({ repository: 'hejny/promptbook', branch: [], deploymentUrl: null }),
lib/workshops/workshopRepository.test.ts:40:            createWorkshopRepositoryOrNull({ repository: null, branch: null, deploymentUrl: null }),
lib/workshops/workshopRepository.test.ts:44:    it('is no project when what is stored names no repository, whatever else is stored beside it', () => {
lib/workshops/workshopRepository.test.ts:47:                repository: 'not a repository',
lib/workshops/workshopRepository.test.ts:54:    it('keeps the repository while leaving out a branch or a deployment which cannot be read', () => {
lib/workshops/workshopRepository.test.ts:57:                repository: 'https://github.com/hejny/promptbook',
lib/workshops/workshopRepositoryGraph.test.ts:19:describe('the workshop repository commit graph', () => {
lib/workshops/workshopSchemas.test.ts:137:    it('reads the project of a term out of whatever address names its repository', () => {
lib/workshops/workshopSchemas.test.ts:141:                repository: {
lib/workshops/workshopSchemas.test.ts:146:            }).repository,
lib/workshops/workshopSchemas.test.ts:153:        expect(workshopUpdateSchema.parse({ repository: { url: 'hejny/promptbook' } }).repository).toEqual({
lib/workshops/workshopSchemas.test.ts:164:                repository: { url: 'hejny/promptbook', branch: ['main', 'client-*', 'feature/*'] },
lib/workshops/workshopSchemas.test.ts:165:            }).repository,
lib/workshops/workshopSchemas.test.ts:172:        expect(workshopUpdateSchema.parse({ repository: { url: 'hejny/promptbook', branch: '*' } }).repository).toEqual({
lib/workshops/workshopSchemas.test.ts:178:        expect(workshopUpdateSchema.parse({ repository: { url: 'hejny/promptbook', branch: [] } }).repository).toEqual({
lib/workshops/workshopSchemas.test.ts:186:                repository: { url: 'hejny/promptbook', branch: ['main', 'main'] },
lib/workshops/workshopSchemas.test.ts:192:        expect(workshopCreateSchema.parse(VALID_WORKSHOP).repository).toBeNull();
lib/workshops/workshopSchemas.test.ts:193:        expect(workshopUpdateSchema.parse({ repository: null }).repository).toBeNull();
lib/workshops/workshopSchemas.test.ts:196:    it('refuses a project which names no repository, no branch, or no reachable deployment', () => {
lib/workshops/workshopSchemas.test.ts:197:        expect(workshopUpdateSchema.safeParse({ repository: { url: 'https://gitlab.com/hejny/x' } }).success).toBe(
lib/workshops/workshopSchemas.test.ts:200:        expect(workshopUpdateSchema.safeParse({ repository: { url: 'hejny' } }).success).toBe(false);
lib/workshops/workshopSchemas.test.ts:202:            workshopUpdateSchema.safeParse({ repository: { url: 'hejny/promptbook', branch: 'main..x' } }).success,
lib/workshops/workshopSchemas.test.ts:205:            workshopUpdateSchema.safeParse({ repository: { url: 'hejny/promptbook', branch: 'feature/?' } }).success,
lib/workshops/workshopSchemas.test.ts:209:                repository: { url: 'hejny/promptbook', deploymentUrl: 'javascript:alert(1)' },
businesses/workshop-admin/workshopAdminApiClient.ts:56:     *       request and branch selection or a deployment can never outlive the repository it belongs to.
businesses/workshop-admin/workshopAdminApiClient.ts:58:    readonly repository?: WorkshopRepositoryWriteValues | null;
businesses/workshop-admin/workshopAdminApiClient.ts:63: * The project of one term as its administration writes it, before the server reads the repository out of it
businesses/workshop-admin/workshopAdminApiClient.ts:67:     * The repository, written either as its address or as `owner/name`
lib/workshops/workshopConstants.ts:51: * How many of the newest commits of the connected repository one room lists
lib/workshops/workshopConstants.ts:58:/** How long the server remembers commit identifiers while a repository monitor is active */
lib/workshops/workshopConstants.ts:63:/** How long a room remains a target of a repository monitor without another repository request */
lib/workshops/workshopSchemas.ts:78: * Note: The branch selection and the deployment belong to the repository, so they are written together with it and
lib/workshops/workshopSchemas.ts:79: *       cannot be left behind by unsetting it. A repository, a branch, or an address which cannot be read is refused
lib/workshops/workshopSchemas.ts:96:        const repository = extractGithubRepository(values.url);
lib/workshops/workshopSchemas.ts:97:        if (repository === null) {
lib/workshops/workshopSchemas.ts:101:                message: 'A valid GitHub repository URL or owner/name is required',
lib/workshops/workshopSchemas.ts:131:        return { ...repository, branch, deploymentUrl } satisfies WorkshopRepository;
lib/workshops/workshopSchemas.ts:390:        repository: nullableWorkshopRepositorySchema.default(null),
lib/workshops/workshopSchemas.ts:426:        repository: nullableWorkshopRepositorySchema.optional(),
lib/workshops/workshopAdminExports.test.ts:23:    repository: null,
lib/workshops/workshopAdminExports.test.ts:163:                repository: {
businesses/workshop-admin/workshopCreateDraft.test.ts:28:    repository: {
businesses/workshop-admin/workshopCreateDraft.test.ts:42: * The connected project as it is written again, which names the repository by its address rather than by the two words
businesses/workshop-admin/workshopCreateDraft.test.ts:75:            repository: DUPLICATED_WORKSHOP_REPOSITORY,
businesses/workshop-admin/workshopCreateDraft.test.ts:88:        expect(createWorkshopDuplicateDraft({ ...WORKSHOP, repository: null })?.repository).toBeNull();
businesses/workshop-admin/workshopCreateDraft.test.ts:124:            repository: DUPLICATED_WORKSHOP_REPOSITORY,
businesses/workshop-admin/WorkshopRepositoryFields.tsx:9:    readonly repository: WorkshopRepositoryDraft;
businesses/workshop-admin/WorkshopRepositoryFields.tsx:10:    readonly onChange: (repository: WorkshopRepositoryDraft) => void;
businesses/workshop-admin/WorkshopRepositoryFields.tsx:16: * Note: The repository is read here exactly as the server reads it when it is saved, so an administrator sees which
businesses/workshop-admin/WorkshopRepositoryFields.tsx:19:export function WorkshopRepositoryFields({ repository, onChange }: WorkshopRepositoryFieldsProps) {
businesses/workshop-admin/WorkshopRepositoryFields.tsx:20:    const connectedRepository = extractGithubRepository(repository.repositoryUrl);
businesses/workshop-admin/WorkshopRepositoryFields.tsx:27:                    value={repository.repositoryUrl}
businesses/workshop-admin/WorkshopRepositoryFields.tsx:29:                        onChange({ ...repository, repositoryUrl: changeEvent.target.value })
businesses/workshop-admin/WorkshopRepositoryFields.tsx:35:                    {repository.repositoryUrl.trim() === ''
businesses/workshop-admin/WorkshopRepositoryFields.tsx:46:                <label htmlFor="workshop-repository-branches">Větve repozitáře</label>
businesses/workshop-admin/WorkshopRepositoryFields.tsx:48:                    id="workshop-repository-branches"
businesses/workshop-admin/WorkshopRepositoryFields.tsx:49:                    value={repository.branch}
businesses/workshop-admin/WorkshopRepositoryFields.tsx:50:                    onChange={(changeEvent) => onChange({ ...repository, branch: changeEvent.target.value })}
businesses/workshop-admin/WorkshopRepositoryFields.tsx:65:                    value={repository.deploymentUrl}
businesses/workshop-admin/WorkshopRepositoryFields.tsx:66:                    onChange={(changeEvent) => onChange({ ...repository, deploymentUrl: changeEvent.target.value })}
businesses/workshop-admin/workshopRepositoryDraft.test.ts:15:describe('the workshop repository administration draft', () => {
businesses/workshop-admin/workshopRepositoryDraft.test.ts:20:            repositoryUrl: 'https://github.com/hejny/promptbook',
businesses/workshop-admin/workshopRepositoryDraft.test.ts:34:                repositoryUrl: 'hejny/promptbook',
businesses/workshop-admin/workshopRepositoryDraft.test.ts:41:                repositoryUrl: 'hejny/promptbook',
lib/workshops/workshopAdminExports.ts:87:                              item.repository === null ? null : formatGithubRepositoryName(item.repository),
lib/workshops/workshopAdminExports.ts:92:                              item.repository === null ? null : formatGithubBranchSelection(item.repository.branch),
lib/workshops/workshopAdminExports.ts:96:                          getValue: (item: WorkshopDetails) => item.repository?.deploymentUrl ?? null,
lib/workshops/workshopKindCapabilities.test.ts:101:                repository: { owner: 'hejny', name: 'promptbook', branch: null, deploymentUrl: null },
lib/workshops/workshopKindCapabilities.test.ts:103:        ).toEqual(['startsAt', 'endsAt', 'youtubeVideoId', 'previewYoutubeVideoId', 'repository', 'slug']);
lib/workshops/workshopKindCapabilities.test.ts:110:                repository: { owner: 'hejny', name: 'promptbook', branch: 'main', deploymentUrl: null },
lib/workshops/workshopRepositoryMonitor.ts:28:    readonly repository: WorkshopRepository;
lib/workshops/workshopRepositoryMonitor.ts:41:    readonly repository: WorkshopRepository;
lib/workshops/workshopRepositoryMonitor.ts:52:const repositoryMonitorsByKey = new Map<string, WorkshopRepositoryMonitor>();
lib/workshops/workshopRepositoryMonitor.ts:54:function createWorkshopRepositoryMonitorKey(repository: WorkshopRepository): string {
lib/workshops/workshopRepositoryMonitor.ts:55:    const branchPatterns = [...getGithubBranchSelectionPatterns(repository.branch)].sort().join(',');
lib/workshops/workshopRepositoryMonitor.ts:56:    const isDefaultBranchSelected = repository.branch === null;
lib/workshops/workshopRepositoryMonitor.ts:57:    return `${repository.owner}/${repository.name}|${isDefaultBranchSelected ? 'default' : branchPatterns}`;
lib/workshops/workshopRepositoryMonitor.ts:60:function getOrCreateWorkshopRepositoryMonitor(repository: WorkshopRepository): WorkshopRepositoryMonitor {
lib/workshops/workshopRepositoryMonitor.ts:61:    const key = createWorkshopRepositoryMonitorKey(repository);
lib/workshops/workshopRepositoryMonitor.ts:62:    const existingMonitor = repositoryMonitorsByKey.get(key);
lib/workshops/workshopRepositoryMonitor.ts:69:        repository,
lib/workshops/workshopRepositoryMonitor.ts:79:    repositoryMonitorsByKey.set(key, monitor);
lib/workshops/workshopRepositoryMonitor.ts:128:                    kind: 'repository-commit',
lib/workshops/workshopRepositoryMonitor.ts:175:    monitor.readPromise = fetchWorkshopRepositoryProgress(monitor.repository)
lib/workshops/workshopRepositoryMonitor.ts:177:            console.error('Failed to monitor a workshop repository:', error);
lib/workshops/workshopRepositoryMonitor.ts:205:            repositoryMonitorsByKey.delete(monitor.key);
lib/workshops/workshopRepositoryMonitor.ts:215: * Reads a repository through a per-server monitor and keeps every active room watching that repository as a target.
lib/workshops/workshopRepositoryMonitor.ts:217: * The browser still polls this function's route as a fallback. The monitor adds the fast path: one active repository
lib/workshops/workshopRepositoryMonitor.ts:224:    const monitor = getOrCreateWorkshopRepositoryMonitor(options.repository);
lib/workshops/workshopClientState.test.ts:84:                kind: 'repository-commit',
lib/workshops/workshopClientState.test.ts:114:                kind: 'repository-commit',
lib/workshops/workshopKindCapabilities.ts:35:     * Whether a room can be about a project, so its administration connects a repository to it and the room shows what
lib/workshops/workshopKindCapabilities.ts:36:     * is being built in that repository while the room runs
lib/workshops/workshopKindCapabilities.ts:158:const WORKSHOP_REPOSITORY_FIELD_NAMES = ['repository'] as const;
lib/workshops/workshopValues.test.ts:58:                repository: {
lib/workshops/workshopValues.test.ts:66:            github_repository: 'hejny/promptbook',
lib/workshops/workshopValues.test.ts:67:            github_repository_branches: ['main'],
lib/workshops/workshopValues.test.ts:70:        expect(createWorkshopUpdateDatabaseValues({ repository: null })).toEqual({
lib/workshops/workshopValues.test.ts:71:            github_repository: null,
lib/workshops/workshopValues.test.ts:72:            github_repository_branches: null,
lib/workshops/workshopValues.test.ts:80:                repository: {
lib/workshops/workshopValues.test.ts:88:            github_repository: 'hejny/promptbook',
lib/workshops/workshopValues.test.ts:89:            github_repository_branches: ['main', 'feature/*'],
lib/workshops/workshopValues.test.ts:94:                repository: { owner: 'hejny', name: 'promptbook', branch: '*', deploymentUrl: null },
lib/workshops/workshopValues.test.ts:97:            github_repository: 'hejny/promptbook',
lib/workshops/workshopValues.test.ts:98:            github_repository_branches: ['*'],
lib/workshops/workshopValues.ts:28: *       deployment of a repository which is no longer connected behind.
lib/workshops/workshopValues.ts:30:function createWorkshopRepositoryDatabaseValues(repository: WorkshopRepository | null) {
lib/workshops/workshopValues.ts:32:        github_repository: repository === null ? null : formatGithubRepositoryName(repository),
lib/workshops/workshopValues.ts:33:        github_repository_branches: repository === null ? null : serializeGithubBranchSelection(repository.branch),
lib/workshops/workshopValues.ts:34:        deployment_url: repository?.deploymentUrl ?? null,
lib/workshops/workshopValues.ts:53:        ...createWorkshopRepositoryDatabaseValues(values.repository),
lib/workshops/workshopValues.ts:81:        ...(values.repository === undefined ? {} : createWorkshopRepositoryDatabaseValues(values.repository)),
lib/workshops/workshopMigration.test.ts:79:    'migrations/2026-09-0800-workshop-repository.sql',
lib/workshops/workshopMigration.test.ts:84:    'migrations/2026-09-1200-workshop-repository-multiple-branches.sql',
lib/workshops/workshopMigration.test.ts:697:        expect(WORKSHOP_REPOSITORY_MIGRATION_SQL).toContain('ADD COLUMN IF NOT EXISTS github_repository text');
lib/workshops/workshopMigration.test.ts:698:        expect(WORKSHOP_REPOSITORY_MIGRATION_SQL).toContain('ADD COLUMN IF NOT EXISTS github_repository_branch text');
lib/workshops/workshopMigration.test.ts:703:    it('lets neither a branch nor a deployment outlive the repository they belong to', () => {
lib/workshops/workshopMigration.test.ts:705:            'DROP CONSTRAINT IF EXISTS workshops_repository_connection;',
lib/workshops/workshopMigration.test.ts:708:            'ADD CONSTRAINT workshops_repository_connection CHECK (',
lib/workshops/workshopMigration.test.ts:711:            'OR (github_repository_branch IS NULL AND deployment_url IS NULL)',
lib/workshops/workshopMigration.test.ts:715:    it('migrates the repository branch into one array which distinguishes selected branches from all branches', () => {
lib/workshops/workshopMigration.test.ts:717:            'ADD COLUMN IF NOT EXISTS github_repository_branches text[]',
lib/workshops/workshopMigration.test.ts:720:            'SET github_repository_branches = ARRAY[github_repository_branch]',
lib/workshops/workshopMigration.test.ts:723:            'DROP COLUMN IF EXISTS github_repository_branch',
lib/workshops/workshopMigration.test.ts:726:            'cardinality(github_repository_branches) <= 50',
lib/workshops/workshopMigration.test.ts:730:    it('keeps branch selection and deployment tied to a connected repository after migration', () => {
lib/workshops/workshopMigration.test.ts:732:            'OR (github_repository_branches IS NULL AND deployment_url IS NULL)',
lib/workshops/workshopDatabase.ts:100:    readonly github_repository?: string | null;
lib/workshops/workshopDatabase.ts:101:    readonly github_repository_branches?: readonly string[] | null;
lib/workshops/workshopDatabase.ts:103:    readonly github_repository_branch?: string | null;
lib/workshops/workshopDatabase.ts:442:        repository: createWorkshopRepositoryOrNull({
lib/workshops/workshopDatabase.ts:443:            repository: row.github_repository ?? null,
lib/workshops/workshopDatabase.ts:445:                row.github_repository_branches === undefined
lib/workshops/workshopDatabase.ts:446:                    ? row.github_repository_branch ?? null
lib/workshops/workshopDatabase.ts:447:                    : row.github_repository_branches,
lib/workshops/fetchWorkshopRepositoryProgress.ts:27: * Note: A repository which publishes no readable commits produces no answer, so the room can say that the commit feed
lib/workshops/fetchWorkshopRepositoryProgress.ts:33:    repository: WorkshopRepository,
lib/workshops/fetchWorkshopRepositoryProgress.ts:35:    if (isGithubMultipleBranchesSelection(repository.branch)) {
lib/workshops/fetchWorkshopRepositoryProgress.ts:36:        return fetchMultipleWorkshopRepositoryBranchProgress(repository);
lib/workshops/fetchWorkshopRepositoryProgress.ts:40:        repository,
lib/workshops/fetchWorkshopRepositoryProgress.ts:41:        branch: getGithubBranchSelectionPatterns(repository.branch)[0] ?? null,
lib/workshops/fetchWorkshopRepositoryProgress.ts:55:    repository: WorkshopRepository,
lib/workshops/fetchWorkshopRepositoryProgress.ts:57:    const branches = await resolveWorkshopRepositoryBranches(repository);
lib/workshops/fetchWorkshopRepositoryProgress.ts:64:        repository,
lib/workshops/fetchWorkshopRepositoryProgress.ts:85:    repository: WorkshopRepository,
lib/workshops/fetchWorkshopRepositoryProgress.ts:87:    const branchPatterns = getGithubBranchSelectionPatterns(repository.branch);
lib/workshops/fetchWorkshopRepositoryProgress.ts:89:    if (!doesGithubBranchSelectionUseWildcard(repository.branch)) {
lib/workshops/fetchWorkshopRepositoryProgress.ts:94:        repository,
lib/workshops/fetchWorkshopRepositoryProgress.ts:98:        .filter((branch) => doesGithubBranchNameMatchSelection(branch.name, repository.branch))
lib/workshops/workshopTypes.ts:99:     * Note: This is the whole connection — the repository, its branch selection, and the address the project runs at
lib/workshops/workshopTypes.ts:103:    readonly repository: WorkshopRepository | null;
lib/workshops/workshopTypes.ts:568:    | { readonly kind: 'repository-commit'; readonly commit: GithubCommit };
lib/workshops/workshopRepository.ts:13: *       belong to the repository rather than standing beside it. That is what lets the administration set, change, and
lib/workshops/workshopRepository.ts:14: *       unset the whole connection at once, and what keeps a room from following a branch of a repository nobody
lib/workshops/workshopRepository.ts:19:     * The branch selection the workshop follows. `null` is the repository default branch; strings may be literal
lib/workshops/workshopRepository.ts:33: * Note: A repository which the application cannot read as a repository is deliberately read as no connection at all,
lib/workshops/workshopRepository.ts:38:    readonly repository: string | null;
lib/workshops/workshopRepository.ts:42:    const repository = extractGithubRepository(values.repository);
lib/workshops/workshopRepository.ts:43:    if (repository === null) {
lib/workshops/workshopRepository.ts:44:        if (values.repository !== null && values.repository !== '') {
lib/workshops/workshopRepository.ts:45:            console.error(`Unknown GitHub repository "${values.repository}" was read from the database.`);
lib/workshops/workshopRepository.ts:51:        ...repository,
lib/workshops/workshopClientState.ts:48:    if (value.kind === 'repository-commit') {
businesses/workshop-admin/workshopRepositoryDraft.ts:11: * Note: The form keeps written text rather than a read repository, so an address which is still being typed stays
businesses/workshop-admin/workshopRepositoryDraft.ts:15:    readonly repositoryUrl: string;
businesses/workshop-admin/workshopRepositoryDraft.ts:16:    /** Branch patterns separated by lines or commas; an empty value follows the repository default branch. */
businesses/workshop-admin/workshopRepositoryDraft.ts:22:    repositoryUrl: '',
businesses/workshop-admin/workshopRepositoryDraft.ts:30:export function createWorkshopRepositoryDraft(repository: WorkshopRepository | null): WorkshopRepositoryDraft {
businesses/workshop-admin/workshopRepositoryDraft.ts:31:    if (repository === null) {
businesses/workshop-admin/workshopRepositoryDraft.ts:36:        repositoryUrl: createGithubRepositoryUrl(repository),
businesses/workshop-admin/workshopRepositoryDraft.ts:37:        branch: getGithubBranchSelectionPatterns(repository.branch).join('\n'),
businesses/workshop-admin/workshopRepositoryDraft.ts:38:        deploymentUrl: repository.deploymentUrl ?? '',
businesses/workshop-admin/workshopRepositoryDraft.ts:50: * The project of one term as it is saved, or `null` when the form names no repository
businesses/workshop-admin/workshopRepositoryDraft.ts:52: * Note: A branch or a deployment written beside an empty repository is dropped together with it, so clearing the
businesses/workshop-admin/workshopRepositoryDraft.ts:53: *       repository really disconnects the project instead of leaving half of it behind.
businesses/workshop-admin/workshopRepositoryDraft.ts:58:    const repositoryUrl = draft.repositoryUrl.trim();
businesses/workshop-admin/workshopRepositoryDraft.ts:59:    if (repositoryUrl === '') {
businesses/workshop-admin/workshopRepositoryDraft.ts:66:        url: repositoryUrl,
businesses/workshop-admin/workshopCreateDraft.ts:40:    readonly repository: WorkshopRepositoryWriteValues | null;
businesses/workshop-admin/workshopCreateDraft.ts:88:        repository: null,
businesses/workshop-admin/workshopCreateDraft.ts:120:        repository: createWorkshopRepositoryWriteValues(createWorkshopRepositoryDraft(workshop.repository)),
businesses/workshop-admin/workshopCreateDraft.ts:149:        repository: draft.repository,
businesses/workshop-admin/CreateWorkshopForm.test.tsx:22:    repository: null,
businesses/workshop-admin/WorkshopSettingsForm.test.tsx:22:    repository: { owner: 'hejny', name: 'promptbook', branch: 'main', deploymentUrl: 'https://workshop.example/app' },
businesses/workshop-admin/WorkshopSettingsForm.test.tsx:39:    repository: null,
businesses/workshop-admin/WorkshopSettingsForm.test.tsx:250:                    repository: {
businesses/workshop-admin/WorkshopSettingsForm.test.tsx:271:                    repository: {
businesses/workshop-admin/WorkshopSettingsForm.test.tsx:290:                    repository: {
businesses/workshop-admin/WorkshopSettingsForm.test.tsx:300:    it('disconnects the whole project once the repository is cleared', async () => {
businesses/workshop-admin/WorkshopSettingsForm.test.tsx:308:        await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ repository: null })));
businesses/workshop-admin/workshopAdminSnapshot.ts:1:import type { WorkshopAdminSnapshot, WorkshopContentBlock, WorkshopDetails } from '@/lib/workshops/workshopTypes';
businesses/workshop-admin/workshopAdminSnapshot.ts:11:    currentContentBlocks: readonly WorkshopContentBlock[],
businesses/workshop-admin/workshopAdminSnapshot.ts:12:    loadedContentBlocks: readonly WorkshopContentBlock[],
businesses/workshop-admin/workshopAdminSnapshot.ts:13:): readonly WorkshopContentBlock[] {
businesses/workshop-admin/WorkshopContentEditor.tsx:3:import type { WorkshopContentWriteValues } from '@/businesses/workshop-admin/workshopAdminApiClient';
businesses/workshop-admin/WorkshopContentEditor.tsx:8:import type { WorkshopContentBlock } from '@/lib/workshops/workshopTypes';
businesses/workshop-admin/WorkshopContentEditor.tsx:12:type WorkshopContentEditorProps = {
businesses/workshop-admin/WorkshopContentEditor.tsx:13:    readonly contentBlock: WorkshopContentBlock | null;
businesses/workshop-admin/WorkshopContentEditor.tsx:16:    readonly onSave: (values: WorkshopContentWriteValues) => Promise<boolean>;
businesses/workshop-admin/WorkshopContentEditor.tsx:21:export function WorkshopContentEditor({
businesses/workshop-admin/WorkshopContentEditor.tsx:28:}: WorkshopContentEditorProps) {
businesses/workshop-admin/workshopAdminApiClient.ts:13:    WorkshopContentBlock,
businesses/workshop-admin/workshopAdminApiClient.ts:106:export type WorkshopContentWriteValues = {
businesses/workshop-admin/workshopAdminApiClient.ts:270:export async function createAdminWorkshopContent(
businesses/workshop-admin/workshopAdminApiClient.ts:272:    values: WorkshopContentWriteValues,
businesses/workshop-admin/workshopAdminApiClient.ts:273:): Promise<WorkshopContentBlock> {
businesses/workshop-admin/workshopAdminApiClient.ts:274:    const result = await requestAdminJson<{ readonly contentBlock: WorkshopContentBlock }>(
businesses/workshop-admin/workshopAdminApiClient.ts:281:export async function updateAdminWorkshopContent(
businesses/workshop-admin/workshopAdminApiClient.ts:284:    values: WorkshopContentWriteValues,
businesses/workshop-admin/workshopAdminApiClient.ts:285:): Promise<WorkshopContentBlock> {
businesses/workshop-admin/workshopAdminApiClient.ts:286:    const result = await requestAdminJson<{ readonly contentBlock: WorkshopContentBlock }>(
businesses/workshop-admin/workshopAdminApiClient.ts:293:export async function deleteAdminWorkshopContent(workshopId: string, contentId: string): Promise<void> {
lib/workshops/workshopPaidMembersContent.ts:1:import type { WorkshopContentBlock, WorkshopContentPreview } from '@/lib/workshops/workshopTypes';
lib/workshops/workshopPaidMembersContent.ts:22:    readonly readableContentBlocks: readonly WorkshopContentBlock[];
lib/workshops/workshopPaidMembersContent.ts:23:    readonly paidMembersOnlyContentPreviews: readonly WorkshopContentPreview[];
lib/workshops/workshopPaidMembersContent.ts:26:function toWorkshopContentPreview(contentBlock: WorkshopContentBlock): WorkshopContentPreview {
lib/workshops/workshopPaidMembersContent.ts:39:export function selectWorkshopContentForMember(
lib/workshops/workshopPaidMembersContent.ts:40:    contentBlocks: readonly WorkshopContentBlock[],
lib/workshops/workshopPaidMembersContent.ts:51:            : contentBlocks.filter((contentBlock) => contentBlock.isPaidMembersOnly).map(toWorkshopContentPreview),
businesses/workshop-admin/WorkshopAdminDashboard.tsx:10:    createAdminWorkshopContent,
businesses/workshop-admin/WorkshopAdminDashboard.tsx:14:    deleteAdminWorkshopContent,
businesses/workshop-admin/WorkshopAdminDashboard.tsx:26:    updateAdminWorkshopContent,
businesses/workshop-admin/WorkshopAdminDashboard.tsx:32:    type WorkshopContentWriteValues,
businesses/workshop-admin/WorkshopAdminDashboard.tsx:44:import { WorkshopContentAdmin } from '@/businesses/workshop-admin/WorkshopContentAdmin';
businesses/workshop-admin/WorkshopAdminDashboard.tsx:380:    const handleCreateContent = (values: WorkshopContentWriteValues) =>
businesses/workshop-admin/WorkshopAdminDashboard.tsx:383:            : runAndReload(() => createAdminWorkshopContent(snapshot.workshop.id, values));
businesses/workshop-admin/WorkshopAdminDashboard.tsx:384:    const handleUpdateContent = (contentId: string, values: WorkshopContentWriteValues) =>
businesses/workshop-admin/WorkshopAdminDashboard.tsx:387:            : runAndReload(() => updateAdminWorkshopContent(snapshot.workshop.id, contentId, values));
businesses/workshop-admin/WorkshopAdminDashboard.tsx:390:            await runAndReload(() => deleteAdminWorkshopContent(snapshot.workshop.id, contentId));
businesses/workshop-admin/WorkshopAdminDashboard.tsx:404:            updateAdminWorkshopContent(snapshot.workshop.id, contentId, {
businesses/workshop-admin/WorkshopAdminDashboard.tsx:713:                                <WorkshopContentAdmin
lib/workshops/workshopValues.test.ts:3:    createWorkshopContentDatabaseValues,
lib/workshops/workshopValues.test.ts:4:    createWorkshopContentUpdateDatabaseValues,
lib/workshops/workshopValues.test.ts:111:            createWorkshopContentDatabaseValues({
lib/workshops/workshopValues.test.ts:128:        expect(createWorkshopContentUpdateDatabaseValues({ isPaidMembersOnly: true })).toEqual({
lib/workshops/workshopValues.test.ts:131:        expect(createWorkshopContentUpdateDatabaseValues({ isFollowUp: false })).toEqual({ is_follow_up: false });
businesses/workshop-admin/WorkshopContentAdmin.tsx:1:import type { WorkshopContentWriteValues } from '@/businesses/workshop-admin/workshopAdminApiClient';
businesses/workshop-admin/WorkshopContentAdmin.tsx:2:import { WorkshopContentEditor } from '@/businesses/workshop-admin/WorkshopContentEditor';
businesses/workshop-admin/WorkshopContentAdmin.tsx:3:import type { WorkshopContentBlock } from '@/lib/workshops/workshopTypes';
businesses/workshop-admin/WorkshopContentAdmin.tsx:5:type WorkshopContentAdminProps = {
businesses/workshop-admin/WorkshopContentAdmin.tsx:10:    readonly contentBlocks: readonly WorkshopContentBlock[];
businesses/workshop-admin/WorkshopContentAdmin.tsx:11:    readonly onCreate: (values: WorkshopContentWriteValues) => Promise<boolean>;
businesses/workshop-admin/WorkshopContentAdmin.tsx:12:    readonly onUpdate: (contentId: string, values: WorkshopContentWriteValues) => Promise<boolean>;
businesses/workshop-admin/WorkshopContentAdmin.tsx:17:export function WorkshopContentAdmin({
businesses/workshop-admin/WorkshopContentAdmin.tsx:24:}: WorkshopContentAdminProps) {
businesses/workshop-admin/WorkshopContentAdmin.tsx:34:                    <WorkshopContentEditor
businesses/workshop-admin/WorkshopContentAdmin.tsx:44:                <WorkshopContentEditor
lib/workshops/workshopPaidMembersContent.test.ts:1:import { selectWorkshopContentForMember } from '@/lib/workshops/workshopPaidMembersContent';
lib/workshops/workshopPaidMembersContent.test.ts:2:import type { WorkshopContentBlock } from '@/lib/workshops/workshopTypes';
lib/workshops/workshopPaidMembersContent.test.ts:5:function createContentBlock(contentBlock: Partial<WorkshopContentBlock>): WorkshopContentBlock {
lib/workshops/workshopPaidMembersContent.test.ts:31:        const selection = selectWorkshopContentForMember([FREE_CONTENT_BLOCK, PAID_CONTENT_BLOCK], {
lib/workshops/workshopPaidMembersContent.test.ts:41:        const selection = selectWorkshopContentForMember([FREE_CONTENT_BLOCK, PAID_CONTENT_BLOCK], {
lib/workshops/workshopPaidMembersContent.test.ts:53:        const { paidMembersOnlyContentPreviews } = selectWorkshopContentForMember([PAID_CONTENT_BLOCK], {
lib/workshops/workshopPaidMembersContent.test.ts:62:        const selection = selectWorkshopContentForMember([FREE_CONTENT_BLOCK, PAID_CONTENT_BLOCK], {
lib/workshops/workshopPaidMembersContent.test.ts:77:        const { paidMembersOnlyContentPreviews } = selectWorkshopContentForMember(
lib/workshops/workshopDatabase.ts:40:import { selectWorkshopContentForMember } from '@/lib/workshops/workshopPaidMembersContent';
lib/workshops/workshopDatabase.ts:63:    WorkshopContentBlock,
lib/workshops/workshopDatabase.ts:163:type WorkshopContentRow = {
lib/workshops/workshopDatabase.ts:294:type WorkshopContentLinkClickTotalsRow = {
lib/workshops/workshopDatabase.ts:499:export function mapWorkshopContentRow(row: WorkshopContentRow, linkClickCount = 0): WorkshopContentBlock {
lib/workshops/workshopDatabase.ts:2032:): Promise<{ readonly contentBlocks: readonly WorkshopContentBlock[] | null; readonly errorMessage: string | null }> {
lib/workshops/workshopDatabase.ts:2048:        ((contentLinkClickTotalsResult.data ?? []) as WorkshopContentLinkClickTotalsRow[]).map(
lib/workshops/workshopDatabase.ts:2057:        contentBlocks: ((contentResult.data ?? []) as WorkshopContentRow[]).map((contentBlock) =>
lib/workshops/workshopDatabase.ts:2058:            mapWorkshopContentRow(contentBlock, linkClickCountByContentBlockId.get(contentBlock.id) ?? 0),
lib/workshops/workshopDatabase.ts:2363:        ...((contentResult.data ?? []) as WorkshopContentRow[]),
lib/workshops/workshopDatabase.ts:2364:        ...(futureFollowUpContentResult.data === null ? [] : [futureFollowUpContentResult.data as WorkshopContentRow]),
lib/workshops/workshopDatabase.ts:2371:        .map(mapWorkshopContentRow);
lib/workshops/workshopDatabase.ts:2374:    const { readableContentBlocks, paidMembersOnlyContentPreviews } = selectWorkshopContentForMember(rawContentBlocks, {
lib/workshops/workshopDatabase.ts:2651:        ((contentLinkClickTotalsResult.data ?? []) as WorkshopContentLinkClickTotalsRow[]).map(
lib/workshops/workshopDatabase.ts:2663:            contentBlocks: ((contentResult.data ?? []) as WorkshopContentRow[]).map((contentBlock) =>
lib/workshops/workshopDatabase.ts:2664:                mapWorkshopContentRow(contentBlock, linkClickCountByContentBlockId.get(contentBlock.id) ?? 0),
lib/workshops/workshopAdminExports.ts:8:    WorkshopContentBlock,
lib/workshops/workshopAdminExports.ts:218:export function serializeWorkshopAdminContentAsCsv(contentBlocks: readonly WorkshopContentBlock[]): string {
lib/workshops/workshopAdminExports.ts:279:        readonly contentBlocks?: readonly WorkshopContentBlock[];
lib/workshops/workshopValues.ts:17:type WorkshopContentCreateValues = z.infer<typeof workshopContentCreateSchema>;
lib/workshops/workshopValues.ts:18:type WorkshopContentUpdateValues = z.infer<typeof workshopContentUpdateSchema>;
lib/workshops/workshopValues.ts:88:export function createWorkshopContentDatabaseValues(values: WorkshopContentCreateValues) {
lib/workshops/workshopValues.ts:100:export function createWorkshopContentUpdateDatabaseValues(values: WorkshopContentUpdateValues) {
lib/workshops/workshopTypes.ts:271:export type WorkshopContentBlock = {
lib/workshops/workshopTypes.ts:302:export type WorkshopContentPreview = {
lib/workshops/workshopTypes.ts:479:    readonly contentBlocks: readonly WorkshopContentBlock[];
lib/workshops/workshopTypes.ts:489:    readonly paidMembersOnlyContentPreviews: readonly WorkshopContentPreview[];
lib/workshops/workshopTypes.ts:535:    readonly contentBlocks: readonly WorkshopContentBlock[];
businesses/online-workshop/_OnlineWorkshopPage.tsx:5:    onlineWorkshopContentItems,
businesses/online-workshop/_OnlineWorkshopPage.tsx:14:} from '@/businesses/online-workshop/onlineWorkshopContent';
businesses/online-workshop/_OnlineWorkshopPage.tsx:251:                        {onlineWorkshopContentItems.map((item) => (
businesses/online-workshop/onlineWorkshopContent.tsx:144:export const onlineWorkshopContentItems: ContentItem[] = [
businesses/online-workshop/participant/useWorkshopParticipant.ts:49:import type { WorkshopCommentSort, WorkshopContentBlock, WorkshopPublicState } from '@/lib/workshops/workshopTypes';
businesses/online-workshop/participant/useWorkshopParticipant.ts:193:        (contentBlocks: readonly WorkshopContentBlock[]) => {
businesses/online-workshop/participant/WorkshopStage.test.tsx:12:import type { WorkshopCommentReference, WorkshopContentBlock, WorkshopDetails } from '@/lib/workshops/workshopTypes';
businesses/online-workshop/participant/WorkshopStage.test.tsx:95:const FOLLOW_UP_CONTENT: WorkshopContentBlock = {
businesses/online-workshop/participant/WorkshopContent.test.tsx:6:    WorkshopContent,
businesses/online-workshop/participant/WorkshopContent.test.tsx:8:} from '@/businesses/online-workshop/participant/WorkshopContent';
businesses/online-workshop/participant/WorkshopContent.test.tsx:10:import type { WorkshopContentBlock, WorkshopContentPreview } from '@/lib/workshops/workshopTypes';
businesses/online-workshop/participant/WorkshopContent.test.tsx:50:const CONTENT_BLOCK: WorkshopContentBlock = {
businesses/online-workshop/participant/WorkshopContent.test.tsx:75:const PAID_MEMBERS_ONLY_CONTENT_PREVIEWS: readonly WorkshopContentPreview[] = [
businesses/online-workshop/participant/WorkshopContent.test.tsx:79:function renderWorkshopContent(
businesses/online-workshop/participant/WorkshopContent.test.tsx:80:    contentBlocks: readonly WorkshopContentBlock[],
businesses/online-workshop/participant/WorkshopContent.test.tsx:81:    paidMembersOnlyContentPreviews: readonly WorkshopContentPreview[] = [],
businesses/online-workshop/participant/WorkshopContent.test.tsx:85:        <WorkshopContent
businesses/online-workshop/participant/WorkshopContent.test.tsx:102:        renderWorkshopContent([], [], [
businesses/online-workshop/participant/WorkshopContent.test.tsx:114:        renderWorkshopContent([CONTENT_BLOCK]);
businesses/online-workshop/participant/WorkshopContent.test.tsx:124:        const secondContentBlock: WorkshopContentBlock = {
businesses/online-workshop/participant/WorkshopContent.test.tsx:129:        renderWorkshopContent([CONTENT_BLOCK, secondContentBlock]);
businesses/online-workshop/participant/WorkshopContent.test.tsx:148:        renderWorkshopContent([CONTENT_BLOCK]);
businesses/online-workshop/participant/WorkshopContent.test.tsx:160:        const contentBlockWithMultipleLinks: WorkshopContentBlock = {
businesses/online-workshop/participant/WorkshopContent.test.tsx:164:        const { container } = renderWorkshopContent([contentBlockWithMultipleLinks]);
businesses/online-workshop/participant/WorkshopContent.test.tsx:173:        const contentBlockWithMultipleLinks: WorkshopContentBlock = {
businesses/online-workshop/participant/WorkshopContent.test.tsx:177:        renderWorkshopContent([contentBlockWithMultipleLinks]);
businesses/online-workshop/participant/WorkshopContent.test.tsx:190:        renderWorkshopContent([{ ...CONTENT_BLOCK, isFollowUp: true, title: 'Další krok' }]);
businesses/online-workshop/participant/WorkshopContent.test.tsx:197:        renderWorkshopContent([{ ...CONTENT_BLOCK, isPaidMembersOnly: true, title: 'Bonusové podklady' }]);
businesses/online-workshop/participant/WorkshopContent.test.tsx:206:        renderWorkshopContent([CONTENT_BLOCK], PAID_MEMBERS_ONLY_CONTENT_PREVIEWS);
businesses/online-workshop/participant/WorkshopContent.test.tsx:216:        renderWorkshopContent(
businesses/online-workshop/participant/WorkshopContent.test.tsx:231:        renderWorkshopContent([], [{ id: 'paid-material-1', title: '' }]);
businesses/online-workshop/participant/WorkshopContent.test.tsx:239:        renderWorkshopContent([], PAID_MEMBERS_ONLY_CONTENT_PREVIEWS);
businesses/online-workshop/participant/WorkshopContent.test.tsx:245:        renderWorkshopContent([CONTENT_BLOCK], PAID_MEMBERS_ONLY_CONTENT_PREVIEWS);
businesses/online-workshop/participant/WorkshopContent.test.tsx:253:        renderWorkshopContent([CONTENT_BLOCK], PAID_MEMBERS_ONLY_CONTENT_PREVIEWS);
businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx:13:import { WorkshopContent } from '@/businesses/online-workshop/participant/WorkshopContent';
businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx:392:                        <WorkshopContent
businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx:8:    WorkshopContentPreview,
businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx:134:const PAID_MEMBERS_ONLY_CONTENT_PREVIEWS: readonly WorkshopContentPreview[] = [
businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx:207:    paidMembersOnlyContentPreviews: readonly WorkshopContentPreview[] = [],
businesses/online-workshop/participant/WorkshopContent.tsx:7:import type { WorkshopContentBlock, WorkshopContentPreview } from '@/lib/workshops/workshopTypes';
businesses/online-workshop/participant/WorkshopContent.tsx:24:type WorkshopContentProps = {
businesses/online-workshop/participant/WorkshopContent.tsx:25:    readonly contentBlocks: readonly WorkshopContentBlock[];
businesses/online-workshop/participant/WorkshopContent.tsx:34:    readonly paidMembersOnlyContentPreviews: readonly WorkshopContentPreview[];
businesses/online-workshop/participant/WorkshopContent.tsx:47:    readonly contentBlock: WorkshopContentBlock;
businesses/online-workshop/participant/WorkshopContent.tsx:194:    readonly contentPreviews: readonly WorkshopContentPreview[];
businesses/online-workshop/participant/WorkshopContent.tsx:225:export function WorkshopContent({
businesses/online-workshop/participant/WorkshopContent.tsx:232:}: WorkshopContentProps) {
businesses/online-workshop/participant/WorkshopWrapUp.tsx:7:    WorkshopContentBlock,
businesses/online-workshop/participant/WorkshopWrapUp.tsx:15:    readonly followUpContentBlock: WorkshopContentBlock | null;
app/api/admin/workshops/[workshopId]/content/route.ts:8:    mapWorkshopContentRow,
app/api/admin/workshops/[workshopId]/content/route.ts:14:import { createWorkshopContentDatabaseValues } from '@/lib/workshops/workshopValues';
app/api/admin/workshops/[workshopId]/content/route.ts:17:type AdminWorkshopContentRouteContext = {
app/api/admin/workshops/[workshopId]/content/route.ts:21:export async function POST(request: NextRequest, context: AdminWorkshopContentRouteContext) {
app/api/admin/workshops/[workshopId]/content/route.ts:49:        .insert({ workshop_id: workshopId, ...createWorkshopContentDatabaseValues(parsedResult.data) })
app/api/admin/workshops/[workshopId]/content/route.ts:69:    return NextResponse.json({ contentBlock: mapWorkshopContentRow(data) }, { status: 201 });
businesses/online-workshop/participant/WorkshopStage.tsx:19:    WorkshopContentBlock,
businesses/online-workshop/participant/WorkshopStage.tsx:52:    readonly followUpContentBlock?: WorkshopContentBlock | null;
app/api/admin/workshops/[workshopId]/content/[contentId]/route.ts:8:    mapWorkshopContentRow,
app/api/admin/workshops/[workshopId]/content/[contentId]/route.ts:14:import { createWorkshopContentUpdateDatabaseValues } from '@/lib/workshops/workshopValues';
app/api/admin/workshops/[workshopId]/content/[contentId]/route.ts:17:type AdminWorkshopContentItemRouteContext = {
app/api/admin/workshops/[workshopId]/content/[contentId]/route.ts:33:export async function PATCH(request: NextRequest, context: AdminWorkshopContentItemRouteContext) {
app/api/admin/workshops/[workshopId]/content/[contentId]/route.ts:56:        .update(createWorkshopContentUpdateDatabaseValues(parsedResult.data))
app/api/admin/workshops/[workshopId]/content/[contentId]/route.ts:79:    return NextResponse.json({ contentBlock: mapWorkshopContentRow(data) });
app/api/admin/workshops/[workshopId]/content/[contentId]/route.ts:82:export async function DELETE(request: NextRequest, context: AdminWorkshopContentItemRouteContext) {

exec
/bin/zsh -lc "sed -n '1,160p' businesses/community/projects/CommunityProjectDiscussionPage.tsx
sed -n '1,120p' businesses/community/CommunityParticipantPage.tsx
sed -n '1,260p' businesses/online-workshop/participant/useWorkshopRepositoryProgress.ts
sed -n '430,520p' lib/workshops/workshopTypes.ts
git log --oneline -12" in /Users/hejny/work/aldaron
 succeeded in 0ms:
'use client';

import { COMMUNITY_PATH } from '@/businesses/community/config';
import { connectToCommunityProjectDiscussion } from '@/businesses/community/projects/communityProjectsApi';
import { CommunityProjectDetailsPanel } from '@/businesses/community/projects/CommunityProjectDetailsPanel';
import { OnlineWorkshopParticipantPage } from '@/businesses/online-workshop/participant/OnlineWorkshopParticipantPage';
import type { CommunityProject } from '@/lib/community-projects/communityProjectTypes';
import { ArrowLeft, LoaderCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

type CommunityProjectDiscussionPageProps = {
    readonly project: CommunityProject;
};

function CommunityProjectDiscussionAccess({
    errorMessage,
    isConnecting,
    onConnect,
}: {
    readonly errorMessage: string | null;
    readonly isConnecting: boolean;
    readonly onConnect: () => Promise<void>;
}) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#07151d] px-6 text-slate-200">
            <div className="max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl">
                <h1 className="text-2xl font-bold text-white">Diskuze projektu je pro členy komunity</h1>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                    {errorMessage ?? 'Ověřujeme vaše připojení do komunity.'}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => void onConnect()}
                        disabled={isConnecting}
                        className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-200 disabled:opacity-60"
                    >
                        {isConnecting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        Ověřit připojení
                    </button>
                    <Link
                        href={COMMUNITY_PATH}
                        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-bold text-slate-100 hover:bg-white/10"
                    >
                        <ArrowLeft className="h-4 w-4" /> Otevřít komunitu
                    </Link>
                </div>
            </div>
        </main>
    );
}

/**
 * Project discussions bootstrap their own narrowly scoped workshop session from the member's community session, then
 * hand off to the proven workshop participant room. The author record created with the project is already a moderator
 * of that room, so the normal chat moderation UI needs no special project branch.
 */
export function CommunityProjectDiscussionPage({ project }: CommunityProjectDiscussionPageProps) {
    const [isConnecting, setIsConnecting] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [sessionVersion, setSessionVersion] = useState(0);

    const connect = useCallback(async () => {
        setIsConnecting(true);
        setErrorMessage(null);
        try {
            await connectToCommunityProjectDiscussion(project.id);
            setIsConnected(true);
            setSessionVersion((currentVersion) => currentVersion + 1);
        } catch {
            setIsConnected(false);
            setErrorMessage('Nejdřív se připojte do komunity. Potom se sem můžete vrátit a otevřít diskuzi projektu.');
        } finally {
            setIsConnecting(false);
        }
    }, [project.id]);

    useEffect(() => {
        void connect();
    }, [connect]);

    if (!isConnected) {
        return <CommunityProjectDiscussionAccess errorMessage={errorMessage} isConnecting={isConnecting} onConnect={connect} />;
    }

    return (
        <OnlineWorkshopParticipantPage
            key={sessionVersion}
            workshopSlug={project.discussionWorkshopSlug}
            connectionDetails={{
                title: project.title,
                description: project.description,
                dateLabel: 'Komunitní diskuze',
                durationLabel: 'Přístup pro členy',
                roomLabel: 'Projekt komunity',
                connectionHeading: 'Připojit se do diskuze',
                connectionDescription: 'Diskuze projektu navazuje na vaše připojení do komunity.',
                submitLabel: 'Otevřít diskuzi',
                language: 'cs',
            }}
            calendarDetails={null}
            initialEmail=""
            initialFullname=""
            roomSubtitle="Projekt komunity · Promptbook"
            isWorkshopSelectionInUrl={false}
            isMaterialsShown={false}
            mainContentAfterWorkshopNavigation={<CommunityProjectDetailsPanel project={project} />}
            connectionRequiredContent={
                <CommunityProjectDiscussionAccess
                    errorMessage="Připojení do diskuze vypršelo. Obnovíme ho podle vašeho členství v komunitě."
                    isConnecting={isConnecting}
                    onConnect={connect}
                />
            }
            unavailableConnectionMessage="Diskuze projektu se nepodařila načíst."
        />
    );
}
import {
    CZECH_COMMUNITY_ROOM_COPY,
    CZECH_COMMUNITY_WORKSHOP_NAVIGATION_COPY,
    createCzechCommunityConnectionDetails,
} from '@/businesses/community/communityContent';
import { CommunityProjectsSection } from '@/businesses/community/projects/CommunityProjectsSection';
import { OnlineWorkshopParticipantPage } from '@/businesses/online-workshop/participant/OnlineWorkshopParticipantPage';
import type { WorkshopDetails, WorkshopSummary } from '@/lib/workshops/workshopTypes';

type CommunityParticipantPageProps = {
    readonly community: WorkshopDetails;
    readonly workshops: readonly WorkshopSummary[];
    readonly initialEmail: string;
    readonly initialFullname: string;
};

/**
 * Community-specific data and Czech copy on top of the shared participant room. The room itself remains the same
 * audited workshop infrastructure rather than a parallel implementation, while the `community` kind of the room takes
 * away what only a live occurrence has: its stage, its schedule, and its live updates.
 *
 * Note: The membership of the member is shown, bought and managed by the shared room itself, so the community adds
 *       nothing of its own for it and reads exactly the same membership as every other room which offers it.
 */
export function CommunityParticipantPage({
    community,
    workshops,
    initialEmail,
    initialFullname,
}: CommunityParticipantPageProps) {
    return (
        <OnlineWorkshopParticipantPage
            workshopSlug={community.slug}
            connectionDetails={createCzechCommunityConnectionDetails(community)}
            calendarDetails={null}
            initialEmail={initialEmail}
            initialFullname={initialFullname}
            roomSubtitle={CZECH_COMMUNITY_ROOM_COPY.roomSubtitle}
            isWorkshopSelectionInUrl={false}
            materialsTitle={CZECH_COMMUNITY_ROOM_COPY.materialsTitle}
            unavailableConnectionMessage={CZECH_COMMUNITY_ROOM_COPY.unavailableConnectionMessage}
            workshopNavigation={{
                workshops,
                ...CZECH_COMMUNITY_WORKSHOP_NAVIGATION_COPY,
            }}
            mainContentAfterWorkshopNavigation={<CommunityProjectsSection isLimited />}
        />
    );
}
'use client';

import { fetchWorkshopRepositoryProgress } from '@/businesses/online-workshop/participant/workshopParticipantApi';
import {
    selectNewWorkshopRepositoryCommits,
    type WorkshopRepositoryCommitListener,
    type SubscribeToWorkshopRepositoryCommits,
    type WorkshopRepositoryProgress,
} from '@/lib/workshops/workshopRepositoryProgress';
import { WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS } from '@/lib/workshops/workshopConstants';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * How often an open room asks what has been committed in the project of the workshop
 *
 * Note: The server reuses one answer of GitHub for a while, see `WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS`, so
 *       asking this often costs one request of this application per participant and no more requests to GitHub.
 */
const WORKSHOP_REPOSITORY_REFRESH_INTERVAL_MILLISECONDS = WORKSHOP_REPOSITORY_COMMIT_REVALIDATE_SECONDS * 1_000;

export type WorkshopRepositoryProgressController = {
    /**
     * How far the project has come, `null` while it is still being read or while GitHub could not be read at all
     */
    readonly progress: WorkshopRepositoryProgress | null;

    /**
     * Whether the room already has an answer about the repository, whatever that answer was
     */
    readonly isProgressRead: boolean;

    /**
     * The commits which arrived while this participant had the room open
     */
    readonly newCommitShas: ReadonlySet<string>;

    /**
     * Lets the stage hear about a commit as soon as the repository monitor or the polling fallback finds it
     */
    readonly subscribeToNewCommits: SubscribeToWorkshopRepositoryCommits;
};

/**
 * Follows the project of one workshop while its room is open
 *
 * Note: The commits which were already there when somebody entered the room are not new to them, so only what arrives
 *       afterwards is marked. A room which is not in front of anybody stops asking, exactly as the rest of the room
 *       does, and keeps the last answer it received rather than emptying itself when GitHub cannot be reached.
 */
export function useWorkshopRepositoryProgress(
    workshopSlug: string,
    isEnabled = true,
): WorkshopRepositoryProgressController {
    const [progress, setProgress] = useState<WorkshopRepositoryProgress | null>(null);
    const [isProgressRead, setIsProgressRead] = useState(false);
    const [newCommitShas, setNewCommitShas] = useState<ReadonlySet<string>>(new Set());
    const commitListenersRef = useRef(new Set<WorkshopRepositoryCommitListener>());
    /**
     * Every commit this room has already read, which is nothing at all until it has read the repository once
     */
    const knownCommitShasRef = useRef<Set<string> | null>(null);

    useEffect(() => {
        let isCurrentWorkshop = true;
        let isReadingProgress = false;
        knownCommitShasRef.current = null;
        setProgress(null);
        setIsProgressRead(false);
        setNewCommitShas(new Set());

        if (!isEnabled) {
            return;
        }

        const rememberArrivedCommits = (readProgress: WorkshopRepositoryProgress | null) => {
            const commits = readProgress?.commits ?? [];
            const knownCommitShas = knownCommitShasRef.current;

            if (knownCommitShas === null) {
                knownCommitShasRef.current = new Set(commits.map((commit) => commit.sha));
                return;
            }

            const arrivedCommits = selectNewWorkshopRepositoryCommits(knownCommitShas, commits);
            if (arrivedCommits.length === 0) {
                return;
            }

            arrivedCommits.forEach((commit) => knownCommitShas.add(commit.sha));
            setNewCommitShas((previousCommitShas) => {
                const markedCommitShas = new Set<string>();
                previousCommitShas.forEach((commitSha) => markedCommitShas.add(commitSha));
                arrivedCommits.forEach((commit) => markedCommitShas.add(commit.sha));
                return markedCommitShas;
            });

            // The response is newest-first. Announcing oldest-first leaves the newest commit on top when several
            // commits arrived between two reads, while the persistent list still marks all of them.
            [...arrivedCommits].reverse().forEach((commit) => {
                commitListenersRef.current.forEach((listener) => listener(commit));
            });
        };

        // Note: A reading which is still waiting for an answer is left to finish rather than being asked again beside
        //       itself, so a GitHub which answers slowly is asked once instead of once per elapsed interval.
        const readRepositoryProgress = async () => {
            if (isReadingProgress) {
                return;
            }

            isReadingProgress = true;
            try {
                const { progress: readProgress } = await fetchWorkshopRepositoryProgress(workshopSlug);
                if (!isCurrentWorkshop) {
                    return;
                }

                rememberArrivedCommits(readProgress);
                setProgress(readProgress);
            } catch (repositoryError) {
                console.error('Failed to read the repository of the workshop:', repositoryError);
            } finally {
                isReadingProgress = false;
                if (isCurrentWorkshop) {
                    setIsProgressRead(true);
                }
            }
        };

        void readRepositoryProgress();
        const intervalId = window.setInterval(() => {
            if (document.visibilityState === 'visible') {
                void readRepositoryProgress();
            }
        }, WORKSHOP_REPOSITORY_REFRESH_INTERVAL_MILLISECONDS);

        return () => {
            isCurrentWorkshop = false;
            window.clearInterval(intervalId);
        };
    }, [isEnabled, workshopSlug]);

    const subscribeToNewCommits = useCallback<SubscribeToWorkshopRepositoryCommits>((listener) => {
        commitListenersRef.current.add(listener);
        return () => {
            commitListenersRef.current.delete(listener);
        };
    }, []);

    return { progress, isProgressRead, newCommitShas, subscribeToNewCommits };
}
    readonly isVotedByParticipant: boolean;
};

/**
 * The administrative view additionally separates the member votes from the explicitly seeded aggregate. The member
 * room deliberately keeps receiving only `WorkshopPollOption`, so an artificial starting count does not expose its
 * origin to the people taking part in the poll.
 */
export type WorkshopAdminPollOption = WorkshopPollOption & {
    readonly realVoteCount: number;
    readonly artificialVoteCount: number;
};

/**
 * A community question prepared by an administrator. Poll infrastructure is shared with the room model, while the
 * room-kind capability decides which kinds offer it.
 */
export type WorkshopPoll = {
    readonly id: string;
    readonly question: string;
    readonly isClosed: boolean;
    readonly isVisible: boolean;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly options: readonly WorkshopPollOption[];

    /**
     * The workshop occurrences this poll is about
     *
     * Note: A poll keeps belonging to the community which administers it. An attached occurrence is the subject of the
     *       question, which is what lets its room receive the poll and what lets the administration of that occurrence
     *       see the question asked about it. Members are only ever told about published occurrences.
     */
    readonly attachedWorkshops: readonly WorkshopSummary[];
};

export type WorkshopAdminPoll = Omit<WorkshopPoll, 'options'> & {
    readonly options: readonly WorkshopAdminPollOption[];
};

export type WorkshopPublicState = {
    readonly serverTime: string;
    readonly workshop: WorkshopDetails;
    readonly participant: WorkshopParticipant;

    /**
     * How many participants had the room open recently, including the one this state was loaded for
     */
    readonly watchingParticipantCount: number;
    readonly contentBlocks: readonly WorkshopContentBlock[];
    readonly nextContentUnlockAt: string | null;

    /**
     * The materials which only paid members may see, named for a member who is not one of them
     *
     * Note: The materials themselves stay out of `contentBlocks`, so this list is what lets the room say where the
     *       paid materials are, what they are called and how to unlock them. It is empty for a member who already paid
     *       and in a room which offers no membership at all.
     */
    readonly paidMembersOnlyContentPreviews: readonly WorkshopContentPreview[];

    /**
     * The recording which the paid membership would unlock for this member, or `null` while nothing of the video is
     * being withheld from them
     *
     * Note: The stream of the occurrence stays out of `workshop` while this is set, so the room cannot play a recording
     *       it also offers to sell. It is `null` for everybody who may watch it — during the workshop itself, for a
     *       member who paid, and in a room which offers no membership — and for an occurrence which carries no video
     *       at all, because there would be nothing for a purchase to unlock.
     */
    readonly paidMembersOnlyVideo: WorkshopPaidMembersVideo | null;
    readonly feedback: WorkshopFeedback | null;
    readonly comments: readonly WorkshopComment[];

    /**
     * The one question the host selected for the shared stage, or `null` while no question is being answered
     *
     * Note: This is a reference to the ordinary comment which supplied the question. Keeping that comment as the
     *       source of truth lets an attendee and the host read the same words without copying a second message body
     *       into a stage-only record.
     */
    readonly stageComment: WorkshopCommentReference | null;
    readonly recentReactions: readonly WorkshopReaction[];
    readonly reactionCounts: readonly WorkshopReactionCount[];
    readonly polls: readonly WorkshopPoll[];
};

/**
 * As much of an answered comment as the moderation of a reply needs to judge it
 */
export type WorkshopCommentReference = {
fcabdb4 [✨🚌] The link to the community should be shown alongside materials and behave like kinda a special material.
3c0aa2d Prompts
c650c48 Prompts
d4c9ea7 [✨🤌] Allow multiple branches or wildcards for the project connected to the workshop.
24742ff [✨🦒] Alongside the new workshop and duplicate workshop, add a button to delete the workshop.
d918c8b Update Promptbook
16c3f0b [✨🦒] When duplicating a workshop, the attached polls shouldn't be duplicated
08fb2ac [✨🛬] Remove some texts from polls
b70e2cc Prompts
d04d23a Prompts
f2ec37b Prompts
399ae12 Revert "[✨👇] The placement of the cookies bar is very ugly and not very aware of the page placed in, enhance it"

exec
/bin/zsh -lc 'git show --stat --oneline fcabdb4 && git show --format=fuller --find-renames --find-copies fcabdb4 -- businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx businesses/online-workshop/participant/WorkshopContent.tsx businesses/community/CommunityRoomInvitation.tsx businesses/online-workshop/participant/WorkshopContent.test.tsx businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx changelog/_current-preversion.md' in /Users/hejny/work/aldaron
 succeeded in 0ms:
fcabdb4 [✨🚌] The link to the community should be shown alongside materials and behave like kinda a special material.
 AGENTS.md                                          |     9 +-
 businesses/community/CommunityRoomInvitation.tsx   |    12 +-
 .../OnlineWorkshopParticipantPage.test.tsx         |    24 +-
 .../participant/OnlineWorkshopParticipantPage.tsx  |    17 +-
 .../participant/WorkshopContent.test.tsx           |    19 +-
 .../participant/WorkshopContent.tsx                |    35 +-
 changelog/_current-preversion.md                   |     6 +
 .../2026-09-0090-komunita-as-special-material.md   |     3 +-
 .../2026-09-0090-komunita-as-special-material.md   | 10185 +++++++++++++++++++
 9 files changed, 10287 insertions(+), 23 deletions(-)
commit fcabdb44dbc52d9f5db55d7be3c133f2f131ae75
Author:     Pavol Hejný <me@pavolhejny.com>
AuthorDate: Mon Sep 14 17:12:53 2026 +0200
Commit:     Pavol Hejný <me@pavolhejny.com>
CommitDate: Mon Sep 14 17:12:53 2026 +0200

    [✨🚌] The link to the community should be shown alongside materials and behave like kinda a special material.
    
    - It should appear alongside the materials as a material for all participants (both paying and non-paying)
    - You are working with page `/cs/online-workshop/participant?workshop=`
    - Keep in mind the DRY _(don't repeat yourself)_ principle.
    - Do a analysis of the current functionality before you start implementing.
    - Add the changes into the [changelog](./changelog/_current-preversion.md)
    
    ![alt text](prompts/screenshots/2026-09-0090-komunita-as-special-material.png)

diff --git a/businesses/community/CommunityRoomInvitation.tsx b/businesses/community/CommunityRoomInvitation.tsx
index e5c815f..a1758b2 100644
--- a/businesses/community/CommunityRoomInvitation.tsx
+++ b/businesses/community/CommunityRoomInvitation.tsx
@@ -22,9 +22,9 @@ type CommunityRoomInvitationProps = {
  */
 export function CommunityRoomInvitation({ participantIdentity }: CommunityRoomInvitationProps) {
     return (
-        <section
+        <article
             aria-labelledby={COMMUNITY_ROOM_INVITATION_TITLE_ID}
-            className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5"
+            className="relative scroll-mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-5 text-slate-200 shadow-lg sm:p-8"
         >
             <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                 <div className="flex min-w-0 items-start gap-3">
@@ -35,10 +35,10 @@ export function CommunityRoomInvitation({ participantIdentity }: CommunityRoomIn
                         <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">
                             {CZECH_COMMUNITY_INVITATION_COPY.eyebrow}
                         </p>
-                        <h2 id={COMMUNITY_ROOM_INVITATION_TITLE_ID} className="mt-1 text-sm font-bold text-white">
+                        <h3 id={COMMUNITY_ROOM_INVITATION_TITLE_ID} className="mt-1 text-xl font-bold text-white">
                             {CZECH_COMMUNITY_INVITATION_COPY.title}
-                        </h2>
-                        <p className="mt-1 text-xs leading-5 text-slate-400">
+                        </h3>
+                        <p className="mt-2 text-sm leading-6 text-slate-400">
                             {CZECH_COMMUNITY_INVITATION_COPY.description}
                         </p>
                         <ul className="mt-3 flex flex-wrap gap-2">
@@ -61,6 +61,6 @@ export function CommunityRoomInvitation({ participantIdentity }: CommunityRoomIn
                     <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                 </Link>
             </div>
-        </section>
+        </article>
     );
 }
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
index c526df5..c8df97e 100644
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
@@ -377,9 +377,31 @@ describe('online workshop participant room', () => {
     it('leads from a workshop into the permanent community with that very same identity', () => {
         renderParticipantRoom(WORKSHOP);
 
-        expect(screen.getByRole('link', { name: /Vstoupit do komunity/ }).getAttribute('href')).toBe(
+        const communityLink = screen.getByRole('link', { name: /Vstoupit do komunity/ });
+        const materialsSection = screen.getByRole('heading', { name: 'Materiály z workshopu' }).closest('section');
+
+        expect(communityLink.getAttribute('href')).toBe(
             '/cs/komunita?email=jana%40example.com&fullname=Jana+Nov%C3%A1kov%C3%A1',
         );
+        expect(materialsSection?.contains(communityLink)).toBe(true);
+        expect(communityLink.closest('article')).not.toBeNull();
+    });
+
+    it('keeps the community material available to a paying member as well', async () => {
+        fetchCommunityMembership.mockResolvedValue({
+            status: 'active',
+            monthlyPriceCzk: 199,
+            currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
+            isCancellationScheduled: false,
+            isPurchaseOffered: false,
+            isSubscriptionManagementOffered: true,
+            isCoveredByDiscountCode: false,
+            isPaymentInTestMode: false,
+        });
+        renderParticipantRoom(WORKSHOP);
+
+        await screen.findByRole('button', { name: 'Placené členství. Otevřít stav členství' });
+        expect(screen.getByRole('link', { name: /Vstoupit do komunity/ })).not.toBeNull();
     });
 
     it('invites nobody into the community from the community itself, nor from a project discussion inside it', () => {
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
index 54dc309..82bd5e1 100644
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
@@ -229,6 +229,14 @@ export function OnlineWorkshopParticipantPage({
     const isWorkshopPollVisible = isWorkshopPollVisibleInRoom(state.workshop.kind);
     const isModerating = isWorkshopParticipantModerating(state.participant);
     const followUpContentBlock = state.contentBlocks.find((contentBlock) => contentBlock.isFollowUp) ?? null;
+    const specialMaterials = roomCapabilities.isCommunityInvitationOffered
+        ? [
+              {
+                  id: 'community',
+                  content: <CommunityRoomInvitation participantIdentity={state.participant} />,
+              },
+          ]
+        : [];
 
     // Note: What the kind of this room has and what an administrator switched off is asked here once, so a new panel
     //       is one line of the room.
@@ -363,14 +371,6 @@ export function OnlineWorkshopParticipantPage({
                             onReact={controller.react}
                         />
                     )}
-                    {/*
-                      * Note: The community lists the terms and leads a member into the room of each of them, and this
-                      *       is the way back out of such a room. It closes the main column rather than competing with
-                      *       the stage, because it says where to go next rather than what is happening now.
-                      */}
-                    {roomCapabilities.isCommunityInvitationOffered && (
-                        <CommunityRoomInvitation participantIdentity={state.participant} />
-                    )}
                 </div>
 
                 <WorkshopChat
@@ -394,6 +394,7 @@ export function OnlineWorkshopParticipantPage({
                             nextContentUnlockAt={state.nextContentUnlockAt}
                             newlyUnlockedContentBlockIds={controller.newlyUnlockedContentBlockIds}
                             paidMembersOnlyContentPreviews={state.paidMembersOnlyContentPreviews}
+                            specialMaterials={specialMaterials}
                             title={materialsTitle}
                         />
                     </div>
diff --git a/businesses/online-workshop/participant/WorkshopContent.test.tsx b/businesses/online-workshop/participant/WorkshopContent.test.tsx
index 168112c..b7866e1 100644
--- a/businesses/online-workshop/participant/WorkshopContent.test.tsx
+++ b/businesses/online-workshop/participant/WorkshopContent.test.tsx
@@ -2,7 +2,10 @@
  * @vitest-environment jsdom
  */
 
-import { WorkshopContent } from '@/businesses/online-workshop/participant/WorkshopContent';
+import {
+    WorkshopContent,
+    type WorkshopSpecialMaterial,
+} from '@/businesses/online-workshop/participant/WorkshopContent';
 import type { CommunityMembershipRoomState } from '@/lib/community-membership/communityMembershipTypes';
 import type { WorkshopContentBlock, WorkshopContentPreview } from '@/lib/workshops/workshopTypes';
 import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
@@ -76,6 +79,7 @@ const PAID_MEMBERS_ONLY_CONTENT_PREVIEWS: readonly WorkshopContentPreview[] = [
 function renderWorkshopContent(
     contentBlocks: readonly WorkshopContentBlock[],
     paidMembersOnlyContentPreviews: readonly WorkshopContentPreview[] = [],
+    specialMaterials: readonly WorkshopSpecialMaterial[] = [],
 ) {
     return render(
         <WorkshopContent
@@ -83,6 +87,7 @@ function renderWorkshopContent(
             nextContentUnlockAt={null}
             newlyUnlockedContentBlockIds={new Set()}
             paidMembersOnlyContentPreviews={paidMembersOnlyContentPreviews}
+            specialMaterials={specialMaterials}
         />,
     );
 }
@@ -93,6 +98,18 @@ afterEach(() => {
 });
 
 describe('workshop materials', () => {
+    it('keeps a special material in the material list even when no ordinary material is unlocked', () => {
+        renderWorkshopContent([], [], [
+            {
+                id: 'community',
+                content: <article aria-label="Komunita Promptbooku">Komunita Promptbooku</article>,
+            },
+        ]);
+
+        expect(screen.getByRole('heading', { name: 'Materiály z workshopu' })).not.toBeNull();
+        expect(screen.getByRole('article', { name: 'Komunita Promptbooku' })).not.toBeNull();
+    });
+
     it('offers a prominent short-link call to action when a material has one link', async () => {
         renderWorkshopContent([CONTENT_BLOCK]);
 
diff --git a/businesses/online-workshop/participant/WorkshopContent.tsx b/businesses/online-workshop/participant/WorkshopContent.tsx
index 26c67e3..e484fda 100644
--- a/businesses/online-workshop/participant/WorkshopContent.tsx
+++ b/businesses/online-workshop/participant/WorkshopContent.tsx
@@ -7,7 +7,19 @@ import { PromptbookQrCode } from '@/components/promptbook-qr-code';
 import type { WorkshopContentBlock, WorkshopContentPreview } from '@/lib/workshops/workshopTypes';
 import { motion, useReducedMotion } from 'framer-motion';
 import { Clock3, Crown, ExternalLink, Lock, Sparkles } from 'lucide-react';
-import { useEffect, useRef, useState } from 'react';
+import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
+
+/**
+ * A participant-facing card which belongs in the material list without being an administrator-managed material.
+ *
+ * Note: A room can lead someone to a durable place such as the community without turning that link into content that
+ *       is stored, timed, paid-only, or measured as an ordinary workshop material. Keeping these cards in the one
+ *       material list still gives every participant the same predictable place to find them.
+ */
+export type WorkshopSpecialMaterial = {
+    readonly id: string;
+    readonly content: ReactNode;
+};
 
 type WorkshopContentProps = {
     readonly contentBlocks: readonly WorkshopContentBlock[];
@@ -20,6 +32,14 @@ type WorkshopContentProps = {
      * key.
      */
     readonly paidMembersOnlyContentPreviews: readonly WorkshopContentPreview[];
+
+    /**
+     * Cards which share the materials placement but have their own source and access rules.
+     *
+     * Note: The room which knows whether a card applies supplies it here. This component only owns the common list,
+     *       so it cannot accidentally make a special material conditional on paid-material visibility.
+     */
+    readonly specialMaterials?: readonly WorkshopSpecialMaterial[];
     readonly title?: string;
 };
 
@@ -207,6 +227,7 @@ export function WorkshopContent({
     nextContentUnlockAt,
     newlyUnlockedContentBlockIds,
     paidMembersOnlyContentPreviews,
+    specialMaterials = [],
     title = 'Materiály z workshopu',
 }: WorkshopContentProps) {
     const isReducedMotionPreferred = useReducedMotion() === true;
@@ -216,8 +237,14 @@ export function WorkshopContent({
     const membershipPurchaseOffer = useCommunityMembershipPurchaseOffer();
     const isPaidMembersContentNoticeShown =
         paidMembersOnlyContentPreviews.length > 0 && membershipPurchaseOffer !== null;
+    const isSpecialMaterialShown = specialMaterials.length > 0;
 
-    if (contentBlocks.length === 0 && nextContentUnlockAt === null && !isPaidMembersContentNoticeShown) {
+    if (
+        contentBlocks.length === 0 &&
+        nextContentUnlockAt === null &&
+        !isPaidMembersContentNoticeShown &&
+        !isSpecialMaterialShown
+    ) {
         return null;
     }
 
@@ -273,6 +300,10 @@ export function WorkshopContent({
                     );
                 })}
 
+                {specialMaterials.map((specialMaterial) => (
+                    <Fragment key={specialMaterial.id}>{specialMaterial.content}</Fragment>
+                ))}
+
                 {nextContentUnlockAt && (
                     <div className="flex items-start gap-3 rounded-xl border border-dashed border-cyan-300/20 bg-cyan-300/[0.04] px-5 py-4 text-sm text-slate-400">
                         <Clock3 className="h-5 w-5 shrink-0 text-cyan-300" />
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 7ffe0e9..4ee8fbe 100644
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,4 +1,10 @@
 # Current preversion
+- Moved the community hand-off in `/cs/online-workshop/participant` into the materials list as a dedicated
+  community material. It is shown even before an administrator has unlocked any ordinary material and remains
+  available to free and paid members alike, while carrying the participant identity through the existing shared
+  community link. The material list now has one reusable special-material slot for room features that belong beside
+  ordinary materials without becoming timed or membership-gated workshop content.
+
 - Let an administrator make a prefix discount code by ending it in `*`: `SUMMER*` now gives its configured discount
   to every submitted code starting with `SUMMER`. The same database resolver supplies form previews and the atomic
   registration consumption, so one path cannot accept a code which the other would reject; an exact code takes

exec
/bin/zsh -lc "node -e \"const packageJson=require('./package.json'); console.log(JSON.stringify(Object.fromEntries(Object.entries(packageJson.scripts).filter(([name]) => /test|lint|type/.test(name))), null, 2))\" && git status --short && git diff -- prompts/2026-09-0100-repository-as-special-material.md" in /Users/hejny/work/aldaron
 succeeded in 0ms:
{
  "lint": "next lint",
  "test": "vitest run",
  "test-e2e": "playwright test",
  "test-e2e:headed": "playwright test --headed",
  "test-types": "npm run build && tsc",
  "delete-test-data": "tsx scripts/delete-test-data.ts",
  "test-for-ptbk-coder": "npm run lint && npx kill-port 4009 && npm run test-types && npm run test-e2e && npm run delete-test-data"
}
 M prompts/2026-09-0100-repository-as-special-material.md
diff --git a/prompts/2026-09-0100-repository-as-special-material.md b/prompts/2026-09-0100-repository-as-special-material.md
index 177626f..916795b 100644
--- a/prompts/2026-09-0100-repository-as-special-material.md
+++ b/prompts/2026-09-0100-repository-as-special-material.md
@@ -1,4 +1,4 @@
-[ ]
+[^] by OpenAI Codex `gpt-5.6-terra` thinking `max` - Implementation in progress
 
 [✨🧽] Linked repository should appear alongside the materials as a kind of special material.
 
@@ -10,3 +10,4 @@
 
 ![alt text](prompts/screenshots/2026-09-0100-repository-as-special-material.png)
 ![alt text](prompts/screenshots/2026-09-0100-repository-as-special-material-1.png)
+

exec
/bin/zsh -lc "rg -n \"Projekt workshopu|hejny/promptbook|WorkshopRepositoryPanel\" --glob '*.{test,spec}.{ts,tsx}' --glob '*test.tsx' --glob '*test.ts'" in /Users/hejny/work/aldaron
 succeeded in 0ms:
businesses/workshop-admin/workshopCreateDraft.test.ts:46:    url: 'https://github.com/hejny/promptbook',
businesses/workshop-admin/workshopRepositoryDraft.test.ts:20:            repositoryUrl: 'https://github.com/hejny/promptbook',
businesses/workshop-admin/workshopRepositoryDraft.test.ts:25:            url: 'https://github.com/hejny/promptbook',
businesses/workshop-admin/workshopRepositoryDraft.test.ts:34:                repositoryUrl: 'hejny/promptbook',
businesses/workshop-admin/workshopRepositoryDraft.test.ts:38:        ).toEqual({ url: 'hejny/promptbook', branch: '*', deploymentUrl: null });
businesses/workshop-admin/workshopRepositoryDraft.test.ts:41:                repositoryUrl: 'hejny/promptbook',
businesses/workshop-admin/workshopRepositoryDraft.test.ts:45:        ).toEqual({ url: 'hejny/promptbook', branch: null, deploymentUrl: null });
businesses/workshop-admin/WorkshopSettingsForm.test.tsx:89:        expect(screen.queryByDisplayValue('https://github.com/hejny/promptbook')).not.toBeNull();
businesses/workshop-admin/WorkshopSettingsForm.test.tsx:251:                        url: 'https://github.com/hejny/promptbook',
businesses/workshop-admin/WorkshopSettingsForm.test.tsx:272:                        url: 'https://github.com/hejny/promptbook',
businesses/workshop-admin/WorkshopSettingsForm.test.tsx:291:                        url: 'https://github.com/hejny/promptbook',
businesses/workshop-admin/WorkshopSettingsForm.test.tsx:303:        fireEvent.change(screen.getByDisplayValue('https://github.com/hejny/promptbook'), {
lib/github/githubCommitFeed.test.ts:6:  <id>tag:github.com,2008:/hejny/promptbook/commits/main</id>
lib/github/githubCommitFeed.test.ts:7:  <title>hejny/promptbook:main commits</title>
lib/github/githubCommitFeed.test.ts:10:    <link type="text/html" rel="alternate" href="https://github.com/hejny/promptbook/commit/6dcb09b5b57875f334f61aebed695e2e4193db5e"/>
lib/github/githubCommitFeed.test.ts:20:    <link type="text/html" rel="alternate" href="https://github.com/hejny/promptbook/commit/1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d"/>
lib/workshops/workshopRepository.test.ts:8:                repository: 'hejny/promptbook',
lib/workshops/workshopRepository.test.ts:23:                repository: 'hejny/promptbook',
lib/workshops/workshopRepository.test.ts:34:            createWorkshopRepositoryOrNull({ repository: 'hejny/promptbook', branch: [], deploymentUrl: null }),
lib/workshops/workshopRepository.test.ts:57:                repository: 'https://github.com/hejny/promptbook',
businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx:336:        expect(screen.getByText('hejny/promptbook')).not.toBeNull();
businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx:343:        const repositoryPanel = screen.getByLabelText('Projekt workshopu');
businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx:353:        expect(screen.queryByLabelText('Projekt workshopu')).toBeNull();
businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx:358:        expect(screen.queryByLabelText('Projekt workshopu')).toBeNull();
lib/workshops/workshopSchemas.test.ts:142:                    url: 'https://github.com/hejny/promptbook/tree/main',
lib/workshops/workshopSchemas.test.ts:153:        expect(workshopUpdateSchema.parse({ repository: { url: 'hejny/promptbook' } }).repository).toEqual({
lib/workshops/workshopSchemas.test.ts:164:                repository: { url: 'hejny/promptbook', branch: ['main', 'client-*', 'feature/*'] },
lib/workshops/workshopSchemas.test.ts:172:        expect(workshopUpdateSchema.parse({ repository: { url: 'hejny/promptbook', branch: '*' } }).repository).toEqual({
lib/workshops/workshopSchemas.test.ts:178:        expect(workshopUpdateSchema.parse({ repository: { url: 'hejny/promptbook', branch: [] } }).repository).toEqual({
lib/workshops/workshopSchemas.test.ts:186:                repository: { url: 'hejny/promptbook', branch: ['main', 'main'] },
lib/workshops/workshopSchemas.test.ts:202:            workshopUpdateSchema.safeParse({ repository: { url: 'hejny/promptbook', branch: 'main..x' } }).success,
lib/workshops/workshopSchemas.test.ts:205:            workshopUpdateSchema.safeParse({ repository: { url: 'hejny/promptbook', branch: 'feature/?' } }).success,
lib/workshops/workshopSchemas.test.ts:209:                repository: { url: 'hejny/promptbook', deploymentUrl: 'javascript:alert(1)' },
lib/github/githubRepository.test.ts:26:            'hejny/promptbook',
lib/github/githubRepository.test.ts:27:            'https://github.com/hejny/promptbook',
lib/github/githubRepository.test.ts:28:            'https://www.github.com/hejny/promptbook/',
lib/github/githubRepository.test.ts:29:            'https://github.com/hejny/promptbook.git',
lib/github/githubRepository.test.ts:30:            'https://github.com/hejny/promptbook/tree/main/src',
lib/github/githubRepository.test.ts:31:            'git@github.com:hejny/promptbook.git',
lib/github/githubRepository.test.ts:32:            '  https://github.com/hejny/promptbook  ',
lib/github/githubRepository.test.ts:39:        expect(extractGithubRepository('hejny/promptbook.io_2-0')).toEqual({
lib/github/githubRepository.test.ts:52:            'hejny/promptbook/issues',
lib/github/githubRepository.test.ts:53:            'https://gitlab.com/hejny/promptbook',
lib/github/githubRepository.test.ts:56:            'https://example.com/github.com/hejny/promptbook',
lib/github/githubRepository.test.ts:64:        expect(formatGithubRepositoryName(PROMPTBOOK_REPOSITORY)).toBe('hejny/promptbook');
lib/github/githubRepository.test.ts:127:        expect(createGithubRepositoryUrl(PROMPTBOOK_REPOSITORY)).toBe('https://github.com/hejny/promptbook');
lib/github/githubRepository.test.ts:129:            'https://github.com/hejny/promptbook/commit/a1b2c3d',
lib/github/githubRepository.test.ts:134:        expect(createGithubCommitsUrl(PROMPTBOOK_REPOSITORY, null)).toBe('https://github.com/hejny/promptbook/commits');
lib/github/githubRepository.test.ts:136:            'https://github.com/hejny/promptbook/commits.atom',
lib/github/githubRepository.test.ts:139:            'https://github.com/hejny/promptbook/commits/feature/rooms.atom',
lib/github/githubRepository.test.ts:142:            'https://github.com/hejny/promptbook/commits/feature/rooms',
lib/github/githubRepository.test.ts:145:            'https://github.com/hejny/promptbook/commits',
lib/github/githubRepository.test.ts:148:            'https://github.com/hejny/promptbook/commits',
lib/workshops/workshopAdminExports.test.ts:173:        expect(settingsCsv).toContain('"hejny/promptbook","main, feature/rooms","https://workshop.example/app"');
lib/workshops/workshopValues.test.ts:66:            github_repository: 'hejny/promptbook',
lib/workshops/workshopValues.test.ts:88:            github_repository: 'hejny/promptbook',
lib/workshops/workshopValues.test.ts:97:            github_repository: 'hejny/promptbook',

exec
/bin/zsh -lc "rg -n -C 3 \"repository|materials|community link|invitation\" AGENTS.md | head -n 180 && sed -n '1,120p' AGENTS.md" in /Users/hejny/work/aldaron
 succeeded in 0ms:
1-## Context
2-
3:This repository contains Promptbook landing pages for different businesses,
4-use cases, and audiences. Keep these rules current when behavior changes.
5-
6-### Public routes
--
71-  publishes no colour outside `AI_TA_KRAJTA_COLORS`, and says how the name is
72-  written; it asks for nothing and sends visitors to the media-kit form.
73-- `/cs/komunita` is the permanent Czech community room. It has chat, polls,
74:  projects, materials, and published terms, but no schedule, stage, or live
75-  updates. Terms show event kind, format/place, price, and status. A term with a
76-  live room links there; otherwise it links to its landing page. The calendar
77-  opens on the member's month, can filter by day, and uses the same terms and
--
84-  the author moderates their own discussion.
85-- `/cs/komunita/clenstvi` offers free community access and the 199 Kč monthly
86-  membership. Webinars remain free; paid access adds recordings, archive,
87:  materials, extra content, priority questions, and Discord/community features.
88-  The page is prefilled from `fullname` and `email`, supports community discount
89-  codes, has no new annual plan or trial, and allows cancellation.
90-- `/cs/komunita/calendar.ics` publishes the same terms by stable slug, so moved
--
113-
114-- Rooms lead to each other in both directions, through one identity hand-off. The
115-  community lists the terms and opens the room of each; an invited workshop room
116:  places its community link beside its materials as a special material for every
117-  participant, regardless of paid membership. Both carry the connected member's
118-  name and email on, and an incomplete identity carries nothing rather than half
119-  of it. Which rooms invite is answered by
120-  `lib/workshops/workshopKindCapabilities.ts`; the community and project
121:  discussions do not. The invitation names the community's sections by the names
122-  the community itself uses.
123-- Community polls attached to workshops are shared. A normalized email gives a
124-  member one vote across the community and all attached workshops. Workshops
--
140-  moderation; trusted members and moderators are approved immediately. Pending
141-  projects remain visible to their author and moderators.
142-- A live workshop room has countdown, YouTube stage, reactions, watching count,
143:  moderated chat, timed materials, and attached poll aggregates. An open-ended
144-  term runs until its recorded end; its stage does not end automatically. Admins
145-  can select, replace, clear, or create the displayed comment through the same
146-  private realtime channel used by reactions.
147:- A term can be about a project. The connection is one value — GitHub repository,
148-  the default branch, and one or more branch patterns such as `main`, `client-*`,
149-  `feature/*`, or `*` for all branches, plus an optional deployment URL — so it is
150-  set, changed, and unset at once and neither branch selection nor deployment
151:  outlives its repository. Room kinds which offer it are named in
152:  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository, its
153-  links, and the newest commits, marking those which arrive while a participant
154-  watches; a newly found commit is broadcast to active rooms and appears on the
155-  stage for ten seconds. A selection resolving to multiple branches is shown as a
156-  commit graph. Commits come from the public commit feed or keyless API, pooled
157-  once per server and cached through the revalidation window; an
158-  unreadable feed still leaves the room naming its project.
159:- Paid-only materials are decided on the server in one pass. Members receive
160-  unlocked material; others receive only the published titles as an offer. An
161-  untitled item is not named, items are not named before their unlock time, and a
162-  room without membership hides paid-only items without naming them.
--
194-  publishes it by default; duplicating an event keeps it published unless the
195-  source is unpublished. Duplicating a workshop preserves its connections to
196-  the already existing attached polls; it creates no polls, options, votes, or room history. Stage settings contain
197:  the live stream and recording teaser, and project settings the repository the
198-  term is about, written as an address or as `owner/name`, together with its branch
199-  patterns. Deleting a workshop is a soft deletion: its room data and attached
200-  community polls stay stored, but the term leaves normal public and administrative
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
  with: running and upcoming ones first, finished ones behind a disclosure.
  Picking one changes the room being connected to and the `workshop` parameter,
  without losing the name and e-mail already typed.
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
  updates. Terms show event kind, format/place, price, and status. A term with a
  live room links there; otherwise it links to its landing page. The calendar
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

- Rooms lead to each other in both directions, through one identity hand-off. The
  community lists the terms and opens the room of each; an invited workshop room
  places its community link beside its materials as a special material for every
  participant, regardless of paid membership. Both carry the connected member's
  name and email on, and an incomplete identity carries nothing rather than half
  of it. Which rooms invite is answered by
  `lib/workshops/workshopKindCapabilities.ts`; the community and project

exec
/bin/zsh -lc "sed -n '2290,2410p' lib/workshops/workshopDatabase.ts
sed -n '1,150p' app/api/workshops/[workshopSlug]/participant/route.ts
sed -n '1,180p' businesses/online-workshop/participant/workshopParticipantApi.ts" in /Users/hejny/work/aldaron
 succeeded in 0ms:
        .eq('workshop_id', workshopRow.id)
        .eq('is_published', true)
        .eq('is_follow_up', true)
        .gt('unlock_at', contentVisibilityCutoff);

    const [
        contentResult,
        nextUnlockResult,
        futureFollowUpContentResult,
        feedbackResult,
        commentsResult,
        pendingCommentsResult,
        reactionsResult,
        reactionCountsResult,
        watchingParticipantCount,
        pinnedCommentRow,
        stageCommentResult,
        pollsResult,
    ] = await Promise.all([
        visibleContentQuery,
        (isWorkshopPast ? nextContentUnlockQuery.eq('is_follow_up', false) : nextContentUnlockQuery)
            .order('unlock_at', { ascending: true })
            .limit(1)
            .maybeSingle(),
        // A selected follow-up remains a normal material before the end, including its scheduled unlock. Once the
        // wrap-up starts it must be available for the stage link even if its ordinary unlock time is later; unrelated
        // scheduled materials keep their own timing.
        isWorkshopPast ? futureFollowUpContentQuery.maybeSingle() : Promise.resolve({ data: null, error: null }),
        workshopRow.room_kind === 'workshop'
            ? supabase
                  .from(WORKSHOP_FEEDBACK_TABLE_NAME)
                  .select(WORKSHOP_FEEDBACK_COLUMNS)
                  .eq('workshop_id', workshopRow.id)
                  .eq('participant_id', participant.id)
                  .maybeSingle()
            : Promise.resolve({ data: null, error: null }),
        commentsQuery,
        isModerationOffered ? pendingCommentsQuery : pendingCommentsQuery.eq('participant_id', participant.id),
        isReactionsPanelOffered
            ? supabase
                  .from(WORKSHOP_REACTION_TABLE_NAME)
                  .select('id, emoji, created_at')
                  .eq('workshop_id', workshopRow.id)
                  .order('created_at', { ascending: false })
                  .limit(MAXIMAL_RECENT_REACTION_COUNT)
            : Promise.resolve({ data: [], error: null }),
        loadWorkshopReactionCounts(supabase, workshopRow),
        countWatchingWorkshopParticipants(supabase, workshopRow),
        loadPinnedWorkshopCommentRowOrNull(supabase, workshopRow),
        isStageOffered && workshopRow.stage_comment_id !== null
            ? loadWorkshopCommentReference(supabase, workshopRow.id, workshopRow.stage_comment_id)
            : Promise.resolve({ comment: null, errorMessage: null }),
        loadWorkshopPolls(supabase, workshopRow, participant.email),
    ]);

    const stateQueryError =
        contentResult.error ??
        nextUnlockResult.error ??
        futureFollowUpContentResult.error ??
        feedbackResult.error ??
        commentsResult.error ??
        pendingCommentsResult.error ??
        reactionsResult.error;
    const errorMessage =
        stateQueryError?.message ??
        reactionCountsResult.errorMessage ??
        stageCommentResult.errorMessage ??
        pollsResult.errorMessage;
    if (errorMessage !== null) {
        return { state: null, errorMessage };
    }

    const rawContentBlocks = [
        ...((contentResult.data ?? []) as WorkshopContentRow[]),
        ...(futureFollowUpContentResult.data === null ? [] : [futureFollowUpContentResult.data as WorkshopContentRow]),
    ]
        .sort(
            (firstContentBlock, secondContentBlock) =>
                firstContentBlock.sort_order - secondContentBlock.sort_order ||
                Date.parse(firstContentBlock.unlock_at) - Date.parse(secondContentBlock.unlock_at),
        )
        .map(mapWorkshopContentRow);
    // Only what this member may read is prepared for them; a withheld material never has its links materialized,
    // because nothing of it but its title is going to leave the server.
    const { readableContentBlocks, paidMembersOnlyContentPreviews } = selectWorkshopContentForMember(rawContentBlocks, {
        isPaidMember,
        isMembershipOffered: roomCapabilities.isMembershipOffered,
    });
    // The recording of an ended workshop is decided here for the very same reason: a member who has not unlocked it
    // receives the teaser published for it instead of the stream, rather than the room merely not playing what it
    // still handed over.
    const { readableVideo, paidMembersOnlyVideo } = selectWorkshopVideoForMember(workshop, {
        isWorkshopPast,
        isPaidMember,
        isMembershipOffered: roomCapabilities.isMembershipOffered,
    });
    const materializedContentResults = await Promise.all(
        readableContentBlocks.map(async (contentBlock) => ({
            contentBlock,
            ...(await materializeWorkshopMaterialShortLinks(supabase, {
                workshopSlug: workshopRow.slug,
                workshopKind: workshopRow.room_kind,
                contentBlockId: contentBlock.id,
                bodyMarkdown: contentBlock.bodyMarkdown,
            })),
        })),
    );
    const materializationErrorMessage = materializedContentResults.find(
        (materializedContentResult) => materializedContentResult.errorMessage !== null,
    )?.errorMessage;
    if (materializationErrorMessage !== null && materializationErrorMessage !== undefined) {
        return { state: null, errorMessage: materializationErrorMessage };
    }
    const materializedContentBlocks = materializedContentResults.map((materializedContentResult) => ({
        ...materializedContentResult.contentBlock,
        bodyMarkdown: materializedContentResult.bodyMarkdown ?? materializedContentResult.contentBlock.bodyMarkdown,
    }));

    const commentRows = withPinnedWorkshopCommentRow(
        [
            ...((commentsResult.data ?? []) as WorkshopCommentRow[]),
zsh:2: no matches found: app/api/workshops/[workshopSlug]/participant/route.ts
import type { WorkshopRepositoryProgress } from '@/lib/workshops/workshopRepositoryProgress';
import type {
    WorkshopComment,
    WorkshopCommentSort,
    WorkshopCommentStatus,
    WorkshopFeedback,
    WorkshopParticipant,
    WorkshopPoll,
    WorkshopPublicState,
    WorkshopReaction,
} from '@/lib/workshops/workshopTypes';

/**
 * What the room sends when a participant writes into the chat
 *
 * Note: A `parentCommentId` turns the message into a reply below that very comment.
 */
export type WorkshopCommentValues = {
    readonly body: string;
    readonly parentCommentId: string | null;
};

/**
 * What a moderator changes about one message of the chat, see `workshopCommentUpdateSchema`
 */
export type WorkshopCommentModerationValues = {
    readonly status?: Exclude<WorkshopCommentStatus, 'pending'>;
    readonly body?: string;
    readonly isPinned?: boolean;
};

/**
 * What a moderator changes about one author of the chat, see `workshopParticipantUpdateSchema`
 *
 * Note: A moderator never appoints another moderator, so nothing here can carry that.
 */
export type WorkshopAuthorModerationValues = {
    readonly isTrusted?: boolean;
    readonly isInteractionBanned?: boolean;
};

/**
 * One heartbeat of an open room, see `workshopPresenceSchema`
 *
 * Note: How the room was attended is measured by `workshopAttendance`, so the browser says what it observed and the
 *       server decides nothing about it.
 */
export type WorkshopPresenceValues = {
    readonly activeDurationSeconds: number;
    readonly isActivelyAttending: boolean;
};

/**
 * One independently persisted step of post-workshop feedback.
 */
export type WorkshopFeedbackValues = {
    readonly rating?: number;
    readonly whatWasGood?: string;
    readonly whatWasBad?: string;
    readonly note?: string;
};

export class WorkshopApiError extends Error {
    public constructor(
        message: string,
        public readonly status: number,
    ) {
        super(message);
        this.name = 'WorkshopApiError';
    }
}

async function readResponseJson<ResponseBody>(response: Response): Promise<ResponseBody> {
    const body = (await response.json().catch(() => ({}))) as { readonly error?: unknown } & ResponseBody;
    if (!response.ok) {
        throw new WorkshopApiError(
            typeof body.error === 'string' ? body.error : 'Požadavek se nepovedl.',
            response.status,
        );
    }
    return body;
}

function getWorkshopApiUrl(workshopSlug: string, path: string): string {
    return `/api/workshops/${encodeURIComponent(workshopSlug)}/${path}`;
}

export async function connectToWorkshop(
    workshopSlug: string,
    values: { readonly fullname: string; readonly email: string },
): Promise<{ readonly state: WorkshopPublicState | null }> {
    const response = await fetch(getWorkshopApiUrl(workshopSlug, 'connect'), {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
    });
    return readResponseJson(response);
}

export async function changeWorkshopParticipantFullname(
    workshopSlug: string,
    fullname: string,
): Promise<{ readonly participant: WorkshopParticipant }> {
    const response = await fetch(getWorkshopApiUrl(workshopSlug, 'participant'), {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname }),
    });
    return readResponseJson(response);
}

/**
 * Ends the session of this browser in the room, which the connected member reads as signing out of it
 */
export async function disconnectFromWorkshop(workshopSlug: string): Promise<void> {
    const response = await fetch(getWorkshopApiUrl(workshopSlug, 'participant'), {
        method: 'DELETE',
        credentials: 'same-origin',
    });
    await readResponseJson(response);
}

export async function fetchWorkshopState(
    workshopSlug: string,
    commentSort: WorkshopCommentSort,
): Promise<WorkshopPublicState> {
    const searchParameters = new URLSearchParams({ sort: commentSort });
    const response = await fetch(`${getWorkshopApiUrl(workshopSlug, 'state')}?${searchParameters}`, {
        credentials: 'same-origin',
        cache: 'no-store',
    });
    return readResponseJson(response);
}

/**
 * Reads how far the project of this workshop has come
 *
 * Note: This is asked for on its own rather than with the state of the room, because it is read from GitHub instead of
 *       from the room itself, and a slow answer of GitHub must not hold up the chat, the materials, or the stage.
 */
export async function fetchWorkshopRepositoryProgress(
    workshopSlug: string,
): Promise<{ readonly progress: WorkshopRepositoryProgress | null }> {
    const response = await fetch(getWorkshopApiUrl(workshopSlug, 'repository'), {
        credentials: 'same-origin',
        cache: 'no-store',
    });
    return readResponseJson(response);
}

export async function submitWorkshopComment(
    workshopSlug: string,
    values: WorkshopCommentValues,
): Promise<{ readonly comment: WorkshopComment }> {
    const response = await fetch(getWorkshopApiUrl(workshopSlug, 'comments'), {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
    });
    return readResponseJson(response);
}

export async function upvoteWorkshopComment(
    workshopSlug: string,
    commentId: string,
): Promise<{ readonly commentId: string; readonly upvoteCount: number; readonly isUpvotedByParticipant: boolean }> {
    const response = await fetch(getWorkshopApiUrl(workshopSlug, `comments/${encodeURIComponent(commentId)}/upvotes`), {
        method: 'POST',
        credentials: 'same-origin',
    });
    return readResponseJson(response);
}

/**
 * Chooses one option of a community poll. Repeating the request with another option changes the participant's own
 * choice, and the returned compact poll makes the optimistic room state authoritative again.
 */

codex
Analysis complete: the repository is already included in the participant state independently of the server’s paid-material filtering, while `WorkshopContent` renders special materials unconditionally. I’ll reuse that slot, preserve the existing live-commit panel and links, and move it into the materials list rather than creating a parallel repository card or access path.
apply patch
patch: completed
/Users/hejny/work/aldaron/AGENTS.md
/Users/hejny/work/aldaron/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
/Users/hejny/work/aldaron/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
/Users/hejny/work/aldaron/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
/Users/hejny/work/aldaron/changelog/_current-preversion.md
diff --git a/AGENTS.md b/AGENTS.md
index 5490191d7ea270f1a59cd3bea90b4a35fec1264e..627be626bbdd1109da0ac266cfbb4edcc6781710
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -149,13 +149,14 @@
   `feature/*`, or `*` for all branches, plus an optional deployment URL — so it is
   set, changed, and unset at once and neither branch selection nor deployment
   outlives its repository. Room kinds which offer it are named in
-  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository, its
-  links, and the newest commits, marking those which arrive while a participant
-  watches; a newly found commit is broadcast to active rooms and appears on the
-  stage for ten seconds. A selection resolving to multiple branches is shown as a
-  commit graph. Commits come from the public commit feed or keyless API, pooled
-  once per server and cached through the revalidation window; an
-  unreadable feed still leaves the room naming its project.
+  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository as a
+  special material beside its ordinary materials for every participant, with its
+  links and newest commits, marking those which arrive while a participant watches;
+  a newly found commit is broadcast to active rooms and appears on the stage for
+  ten seconds. A selection resolving to multiple branches is shown as a commit
+  graph. Commits come from the public commit feed or keyless API, pooled once per
+  server and cached through the revalidation window; an unreadable feed still
+  leaves the room naming its project.
 - Paid-only materials are decided on the server in one pass. Members receive
   unlocked material; others receive only the published titles as an offer. An
   untitled item is not named, items are not named before their unlock time, and a
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
index c8df97e15ec5e8ee846737e95e33682a1303e23d..8b209f67961717c498a57c1defeafefebe23f7a7
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
@@ -306,7 +306,7 @@
         expect(screen.queryByText('Sledují 3 lidé')).toBeNull();
     });
 
-    it('shows the project a workshop is about, together with what has been committed in it', () => {
+    it('shows the project a workshop is about as a special material, together with what has been committed in it', () => {
         repositoryProgressMocks.controller = {
             progress: {
                 // Keep the fields from the former response shape here to ensure the panel only presents commits.
@@ -341,6 +341,10 @@
         );
 
         const repositoryPanel = screen.getByLabelText('Projekt workshopu');
+        const materialsSection = screen.getByRole('heading', { name: 'Materiály z workshopu' }).closest('section');
+
+        expect(materialsSection?.contains(repositoryPanel)).toBe(true);
+        expect(repositoryPanel.tagName).toBe('ARTICLE');
         expect(repositoryPanel.textContent).not.toContain('A/B testing landing page for Promptbook');
         expect(repositoryPanel.textContent).not.toContain('Od začátku workshopu');
         expect(repositoryPanel.textContent).not.toContain('main');
@@ -348,6 +352,23 @@
         expect(within(repositoryPanel).queryByText('1')).toBeNull();
     });
 
+    it('keeps the repository material available to a paying participant', async () => {
+        fetchCommunityMembership.mockResolvedValue({
+            status: 'active',
+            monthlyPriceCzk: 199,
+            currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
+            isCancellationScheduled: false,
+            isPurchaseOffered: false,
+            isSubscriptionManagementOffered: true,
+            isCoveredByDiscountCode: false,
+            isPaymentInTestMode: false,
+        });
+        renderParticipantRoom(WORKSHOP_ABOUT_A_PROJECT);
+
+        await screen.findByRole('button', { name: 'Placené členství. Otevřít stav členství' });
+        expect(screen.getByLabelText('Projekt workshopu')).not.toBeNull();
+    });
+
     it('shows nothing about a project in a room which is about none, and in a room which cannot be about one', () => {
         renderParticipantRoom(WORKSHOP);
         expect(screen.queryByLabelText('Projekt workshopu')).toBeNull();
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
index 82bd5e1d0309dc4a7351be84301f542c2b40077c..f3dd3a74f87783d5c567e38739a34697aee7f195
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
@@ -229,14 +229,30 @@
     const isWorkshopPollVisible = isWorkshopPollVisibleInRoom(state.workshop.kind);
     const isModerating = isWorkshopParticipantModerating(state.participant);
     const followUpContentBlock = state.contentBlocks.find((contentBlock) => contentBlock.isFollowUp) ?? null;
-    const specialMaterials = roomCapabilities.isCommunityInvitationOffered
-        ? [
-              {
-                  id: 'community',
-                  content: <CommunityRoomInvitation participantIdentity={state.participant} />,
-              },
-          ]
-        : [];
+    const repository = roomCapabilities.isRepositoryOffered ? state.workshop.repository : null;
+    const specialMaterials = [
+        ...(repository === null
+            ? []
+            : [
+                  {
+                      id: 'repository',
+                      content: (
+                          <WorkshopRepositoryPanel
+                              repository={repository}
+                              progressController={repositoryProgressController}
+                          />
+                      ),
+                  },
+              ]),
+        ...(roomCapabilities.isCommunityInvitationOffered
+            ? [
+                  {
+                      id: 'community',
+                      content: <CommunityRoomInvitation participantIdentity={state.participant} />,
+                  },
+              ]
+            : []),
+    ];
 
     // Note: What the kind of this room has and what an administrator switched off is asked here once, so a new panel
     //       is one line of the room.
@@ -321,16 +337,6 @@
                             stageComment={state.stageComment}
                             paidMembersOnlyVideo={state.paidMembersOnlyVideo}
                             onSaveFeedback={controller.saveFeedback}
-                        />
-                    )}
-                    {/*
-                      * Note: A term is about a project only while its administration connected one, so a room which is
-                      *       about no project shows nothing about one rather than an empty panel.
-                      */}
-                    {roomCapabilities.isRepositoryOffered && state.workshop.repository !== null && (
-                        <WorkshopRepositoryPanel
-                            repository={state.workshop.repository}
-                            progressController={repositoryProgressController}
                         />
                     )}
                     {calendarDetails !== null && (
diff --git a/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx b/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
index 96cc8e7f32180728917294223502e69edced4e6b..e2e141daebd05e3d20ca791f2013189bc91e884d
--- a/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
+++ b/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
@@ -49,18 +49,18 @@
         getGithubBranchSelectionPatterns(repository.branch).map((branchName) => ({ name: branchName, headSha: null }));
 
     return (
-        <section
+        <article
             aria-label="Projekt workshopu"
-            className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
+            className="relative scroll-mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
         >
             <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4">
                 <div className="min-w-0">
                     <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
                         <Github className="h-4 w-4" aria-hidden="true" /> Projekt workshopu
                     </p>
-                    <h2 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
+                    <h3 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
                         {repositoryName}
-                    </h2>
+                    </h3>
                 </div>
                 <div className="flex flex-wrap items-center gap-2">
                     {newCommitShas.size > 0 && (
@@ -137,6 +137,6 @@
                     </>
                 )}
             </div>
-        </section>
+        </article>
     );
 }
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 4ee8fbecc56c2657b616810871a480acd67dcd8f..1b9e0df7e45563956015e9d529126853c2a3e470
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,4 +1,9 @@
 # Current preversion
+- Moved a connected GitHub repository in `/cs/online-workshop/participant` into the materials list as a special
+  material. Its existing repository, deployment, and live-commit links now stay with ordinary workshop materials,
+  are visible even when no ordinary material has been unlocked, and remain available to both free and paid
+  participants without turning the repository into timed or membership-gated content.
+
 - Moved the community hand-off in `/cs/online-workshop/participant` into the materials list as a dedicated
   community material. It is shown even before an administrator has unlocked any ordinary material and remains
   available to free and paid members alike, while carrying the participant identity through the existing shared

diff --git a/AGENTS.md b/AGENTS.md
index 5490191d7ea270f1a59cd3bea90b4a35fec1264e..627be626bbdd1109da0ac266cfbb4edcc6781710
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -149,13 +149,14 @@
   `feature/*`, or `*` for all branches, plus an optional deployment URL — so it is
   set, changed, and unset at once and neither branch selection nor deployment
   outlives its repository. Room kinds which offer it are named in
-  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository, its
-  links, and the newest commits, marking those which arrive while a participant
-  watches; a newly found commit is broadcast to active rooms and appears on the
-  stage for ten seconds. A selection resolving to multiple branches is shown as a
-  commit graph. Commits come from the public commit feed or keyless API, pooled
-  once per server and cached through the revalidation window; an
-  unreadable feed still leaves the room naming its project.
+  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository as a
+  special material beside its ordinary materials for every participant, with its
+  links and newest commits, marking those which arrive while a participant watches;
+  a newly found commit is broadcast to active rooms and appears on the stage for
+  ten seconds. A selection resolving to multiple branches is shown as a commit
+  graph. Commits come from the public commit feed or keyless API, pooled once per
+  server and cached through the revalidation window; an unreadable feed still
+  leaves the room naming its project.
 - Paid-only materials are decided on the server in one pass. Members receive
   unlocked material; others receive only the published titles as an offer. An
   untitled item is not named, items are not named before their unlock time, and a
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
index c8df97e15ec5e8ee846737e95e33682a1303e23d..8b209f67961717c498a57c1defeafefebe23f7a7
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
@@ -306,7 +306,7 @@
         expect(screen.queryByText('Sledují 3 lidé')).toBeNull();
     });
 
-    it('shows the project a workshop is about, together with what has been committed in it', () => {
+    it('shows the project a workshop is about as a special material, together with what has been committed in it', () => {
         repositoryProgressMocks.controller = {
             progress: {
                 // Keep the fields from the former response shape here to ensure the panel only presents commits.
@@ -341,6 +341,10 @@
         );
 
         const repositoryPanel = screen.getByLabelText('Projekt workshopu');
+        const materialsSection = screen.getByRole('heading', { name: 'Materiály z workshopu' }).closest('section');
+
+        expect(materialsSection?.contains(repositoryPanel)).toBe(true);
+        expect(repositoryPanel.tagName).toBe('ARTICLE');
         expect(repositoryPanel.textContent).not.toContain('A/B testing landing page for Promptbook');
         expect(repositoryPanel.textContent).not.toContain('Od začátku workshopu');
         expect(repositoryPanel.textContent).not.toContain('main');
@@ -348,6 +352,23 @@
         expect(within(repositoryPanel).queryByText('1')).toBeNull();
     });
 
+    it('keeps the repository material available to a paying participant', async () => {
+        fetchCommunityMembership.mockResolvedValue({
+            status: 'active',
+            monthlyPriceCzk: 199,
+            currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
+            isCancellationScheduled: false,
+            isPurchaseOffered: false,
+            isSubscriptionManagementOffered: true,
+            isCoveredByDiscountCode: false,
+            isPaymentInTestMode: false,
+        });
+        renderParticipantRoom(WORKSHOP_ABOUT_A_PROJECT);
+
+        await screen.findByRole('button', { name: 'Placené členství. Otevřít stav členství' });
+        expect(screen.getByLabelText('Projekt workshopu')).not.toBeNull();
+    });
+
     it('shows nothing about a project in a room which is about none, and in a room which cannot be about one', () => {
         renderParticipantRoom(WORKSHOP);
         expect(screen.queryByLabelText('Projekt workshopu')).toBeNull();
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
index 82bd5e1d0309dc4a7351be84301f542c2b40077c..f3dd3a74f87783d5c567e38739a34697aee7f195
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
@@ -229,14 +229,30 @@
     const isWorkshopPollVisible = isWorkshopPollVisibleInRoom(state.workshop.kind);
     const isModerating = isWorkshopParticipantModerating(state.participant);
     const followUpContentBlock = state.contentBlocks.find((contentBlock) => contentBlock.isFollowUp) ?? null;
-    const specialMaterials = roomCapabilities.isCommunityInvitationOffered
-        ? [
-              {
-                  id: 'community',
-                  content: <CommunityRoomInvitation participantIdentity={state.participant} />,
-              },
-          ]
-        : [];
+    const repository = roomCapabilities.isRepositoryOffered ? state.workshop.repository : null;
+    const specialMaterials = [
+        ...(repository === null
+            ? []
+            : [
+                  {
+                      id: 'repository',
+                      content: (
+                          <WorkshopRepositoryPanel
+                              repository={repository}
+                              progressController={repositoryProgressController}
+                          />
+                      ),
+                  },
+              ]),
+        ...(roomCapabilities.isCommunityInvitationOffered
+            ? [
+                  {
+                      id: 'community',
+                      content: <CommunityRoomInvitation participantIdentity={state.participant} />,
+                  },
+              ]
+            : []),
+    ];
 
     // Note: What the kind of this room has and what an administrator switched off is asked here once, so a new panel
     //       is one line of the room.
@@ -321,16 +337,6 @@
                             stageComment={state.stageComment}
                             paidMembersOnlyVideo={state.paidMembersOnlyVideo}
                             onSaveFeedback={controller.saveFeedback}
-                        />
-                    )}
-                    {/*
-                      * Note: A term is about a project only while its administration connected one, so a room which is
-                      *       about no project shows nothing about one rather than an empty panel.
-                      */}
-                    {roomCapabilities.isRepositoryOffered && state.workshop.repository !== null && (
-                        <WorkshopRepositoryPanel
-                            repository={state.workshop.repository}
-                            progressController={repositoryProgressController}
                         />
                     )}
                     {calendarDetails !== null && (
diff --git a/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx b/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
index 96cc8e7f32180728917294223502e69edced4e6b..e2e141daebd05e3d20ca791f2013189bc91e884d
--- a/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
+++ b/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
@@ -49,18 +49,18 @@
         getGithubBranchSelectionPatterns(repository.branch).map((branchName) => ({ name: branchName, headSha: null }));
 
     return (
-        <section
+        <article
             aria-label="Projekt workshopu"
-            className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
+            className="relative scroll-mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
         >
             <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4">
                 <div className="min-w-0">
                     <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
                         <Github className="h-4 w-4" aria-hidden="true" /> Projekt workshopu
                     </p>
-                    <h2 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
+                    <h3 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
                         {repositoryName}
-                    </h2>
+                    </h3>
                 </div>
                 <div className="flex flex-wrap items-center gap-2">
                     {newCommitShas.size > 0 && (
@@ -137,6 +137,6 @@
                     </>
                 )}
             </div>
-        </section>
+        </article>
     );
 }
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 4ee8fbecc56c2657b616810871a480acd67dcd8f..1b9e0df7e45563956015e9d529126853c2a3e470
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,4 +1,9 @@
 # Current preversion
+- Moved a connected GitHub repository in `/cs/online-workshop/participant` into the materials list as a special
+  material. Its existing repository, deployment, and live-commit links now stay with ordinary workshop materials,
+  are visible even when no ordinary material has been unlocked, and remain available to both free and paid
+  participants without turning the repository into timed or membership-gated content.
+
 - Moved the community hand-off in `/cs/online-workshop/participant` into the materials list as a dedicated
   community material. It is shown even before an administrator has unlocked any ordinary material and remains
   available to free and paid members alike, while carrying the participant identity through the existing shared

exec
/bin/zsh -lc 'git diff --check && git diff -- AGENTS.md businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx changelog/_current-preversion.md && git status --short' in /Users/hejny/work/aldaron
 exited 2 in 0ms:
prompts/2026-09-0100-repository-as-special-material.md:13: new blank line at EOF.

diff --git a/AGENTS.md b/AGENTS.md
index 5490191d7ea270f1a59cd3bea90b4a35fec1264e..627be626bbdd1109da0ac266cfbb4edcc6781710
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -149,13 +149,14 @@
   `feature/*`, or `*` for all branches, plus an optional deployment URL — so it is
   set, changed, and unset at once and neither branch selection nor deployment
   outlives its repository. Room kinds which offer it are named in
-  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository, its
-  links, and the newest commits, marking those which arrive while a participant
-  watches; a newly found commit is broadcast to active rooms and appears on the
-  stage for ten seconds. A selection resolving to multiple branches is shown as a
-  commit graph. Commits come from the public commit feed or keyless API, pooled
-  once per server and cached through the revalidation window; an
-  unreadable feed still leaves the room naming its project.
+  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository as a
+  special material beside its ordinary materials for every participant, with its
+  links and newest commits, marking those which arrive while a participant watches;
+  a newly found commit is broadcast to active rooms and appears on the stage for
+  ten seconds. A selection resolving to multiple branches is shown as a commit
+  graph. Commits come from the public commit feed or keyless API, pooled once per
+  server and cached through the revalidation window; an unreadable feed still
+  leaves the room naming its project.
 - Paid-only materials are decided on the server in one pass. Members receive
   unlocked material; others receive only the published titles as an offer. An
   untitled item is not named, items are not named before their unlock time, and a
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
index c8df97e15ec5e8ee846737e95e33682a1303e23d..8b209f67961717c498a57c1defeafefebe23f7a7
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
@@ -306,7 +306,7 @@
         expect(screen.queryByText('Sledují 3 lidé')).toBeNull();
     });
 
-    it('shows the project a workshop is about, together with what has been committed in it', () => {
+    it('shows the project a workshop is about as a special material, together with what has been committed in it', () => {
         repositoryProgressMocks.controller = {
             progress: {
                 // Keep the fields from the former response shape here to ensure the panel only presents commits.
@@ -341,6 +341,10 @@
         );
 
         const repositoryPanel = screen.getByLabelText('Projekt workshopu');
+        const materialsSection = screen.getByRole('heading', { name: 'Materiály z workshopu' }).closest('section');
+
+        expect(materialsSection?.contains(repositoryPanel)).toBe(true);
+        expect(repositoryPanel.tagName).toBe('ARTICLE');
         expect(repositoryPanel.textContent).not.toContain('A/B testing landing page for Promptbook');
         expect(repositoryPanel.textContent).not.toContain('Od začátku workshopu');
         expect(repositoryPanel.textContent).not.toContain('main');
@@ -348,6 +352,23 @@
         expect(within(repositoryPanel).queryByText('1')).toBeNull();
     });
 
+    it('keeps the repository material available to a paying participant', async () => {
+        fetchCommunityMembership.mockResolvedValue({
+            status: 'active',
+            monthlyPriceCzk: 199,
+            currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
+            isCancellationScheduled: false,
+            isPurchaseOffered: false,
+            isSubscriptionManagementOffered: true,
+            isCoveredByDiscountCode: false,
+            isPaymentInTestMode: false,
+        });
+        renderParticipantRoom(WORKSHOP_ABOUT_A_PROJECT);
+
+        await screen.findByRole('button', { name: 'Placené členství. Otevřít stav členství' });
+        expect(screen.getByLabelText('Projekt workshopu')).not.toBeNull();
+    });
+
     it('shows nothing about a project in a room which is about none, and in a room which cannot be about one', () => {
         renderParticipantRoom(WORKSHOP);
         expect(screen.queryByLabelText('Projekt workshopu')).toBeNull();
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
index 82bd5e1d0309dc4a7351be84301f542c2b40077c..f3dd3a74f87783d5c567e38739a34697aee7f195
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
@@ -229,14 +229,30 @@
     const isWorkshopPollVisible = isWorkshopPollVisibleInRoom(state.workshop.kind);
     const isModerating = isWorkshopParticipantModerating(state.participant);
     const followUpContentBlock = state.contentBlocks.find((contentBlock) => contentBlock.isFollowUp) ?? null;
-    const specialMaterials = roomCapabilities.isCommunityInvitationOffered
-        ? [
-              {
-                  id: 'community',
-                  content: <CommunityRoomInvitation participantIdentity={state.participant} />,
-              },
-          ]
-        : [];
+    const repository = roomCapabilities.isRepositoryOffered ? state.workshop.repository : null;
+    const specialMaterials = [
+        ...(repository === null
+            ? []
+            : [
+                  {
+                      id: 'repository',
+                      content: (
+                          <WorkshopRepositoryPanel
+                              repository={repository}
+                              progressController={repositoryProgressController}
+                          />
+                      ),
+                  },
+              ]),
+        ...(roomCapabilities.isCommunityInvitationOffered
+            ? [
+                  {
+                      id: 'community',
+                      content: <CommunityRoomInvitation participantIdentity={state.participant} />,
+                  },
+              ]
+            : []),
+    ];
 
     // Note: What the kind of this room has and what an administrator switched off is asked here once, so a new panel
     //       is one line of the room.
@@ -321,16 +337,6 @@
                             stageComment={state.stageComment}
                             paidMembersOnlyVideo={state.paidMembersOnlyVideo}
                             onSaveFeedback={controller.saveFeedback}
-                        />
-                    )}
-                    {/*
-                      * Note: A term is about a project only while its administration connected one, so a room which is
-                      *       about no project shows nothing about one rather than an empty panel.
-                      */}
-                    {roomCapabilities.isRepositoryOffered && state.workshop.repository !== null && (
-                        <WorkshopRepositoryPanel
-                            repository={state.workshop.repository}
-                            progressController={repositoryProgressController}
                         />
                     )}
                     {calendarDetails !== null && (
diff --git a/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx b/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
index 96cc8e7f32180728917294223502e69edced4e6b..e2e141daebd05e3d20ca791f2013189bc91e884d
--- a/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
+++ b/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
@@ -49,18 +49,18 @@
         getGithubBranchSelectionPatterns(repository.branch).map((branchName) => ({ name: branchName, headSha: null }));
 
     return (
-        <section
+        <article
             aria-label="Projekt workshopu"
-            className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
+            className="relative scroll-mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
         >
             <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4">
                 <div className="min-w-0">
                     <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
                         <Github className="h-4 w-4" aria-hidden="true" /> Projekt workshopu
                     </p>
-                    <h2 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
+                    <h3 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
                         {repositoryName}
-                    </h2>
+                    </h3>
                 </div>
                 <div className="flex flex-wrap items-center gap-2">
                     {newCommitShas.size > 0 && (
@@ -137,6 +137,6 @@
                     </>
                 )}
             </div>
-        </section>
+        </article>
     );
 }
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 4ee8fbecc56c2657b616810871a480acd67dcd8f..1b9e0df7e45563956015e9d529126853c2a3e470
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,4 +1,9 @@
 # Current preversion
+- Moved a connected GitHub repository in `/cs/online-workshop/participant` into the materials list as a special
+  material. Its existing repository, deployment, and live-commit links now stay with ordinary workshop materials,
+  are visible even when no ordinary material has been unlocked, and remain available to both free and paid
+  participants without turning the repository into timed or membership-gated content.
+
 - Moved the community hand-off in `/cs/online-workshop/participant` into the materials list as a dedicated
   community material. It is shown even before an administrator has unlocked any ordinary material and remains
   available to free and paid members alike, while carrying the participant identity through the existing shared

exec
/bin/zsh -lc 'git diff -- AGENTS.md businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx changelog/_current-preversion.md
git diff --check -- AGENTS.md businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx changelog/_current-preversion.md
git status --short' in /Users/hejny/work/aldaron
 succeeded in 0ms:
diff --git a/AGENTS.md b/AGENTS.md
index 5490191..627be62 100644
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -149,13 +149,14 @@ use cases, and audiences. Keep these rules current when behavior changes.
   `feature/*`, or `*` for all branches, plus an optional deployment URL — so it is
   set, changed, and unset at once and neither branch selection nor deployment
   outlives its repository. Room kinds which offer it are named in
-  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository, its
-  links, and the newest commits, marking those which arrive while a participant
-  watches; a newly found commit is broadcast to active rooms and appears on the
-  stage for ten seconds. A selection resolving to multiple branches is shown as a
-  commit graph. Commits come from the public commit feed or keyless API, pooled
-  once per server and cached through the revalidation window; an
-  unreadable feed still leaves the room naming its project.
+  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository as a
+  special material beside its ordinary materials for every participant, with its
+  links and newest commits, marking those which arrive while a participant watches;
+  a newly found commit is broadcast to active rooms and appears on the stage for
+  ten seconds. A selection resolving to multiple branches is shown as a commit
+  graph. Commits come from the public commit feed or keyless API, pooled once per
+  server and cached through the revalidation window; an unreadable feed still
+  leaves the room naming its project.
 - Paid-only materials are decided on the server in one pass. Members receive
   unlocked material; others receive only the published titles as an offer. An
   untitled item is not named, items are not named before their unlock time, and a
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
index c8df97e..8b209f6 100644
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
@@ -306,7 +306,7 @@ describe('online workshop participant room', () => {
         expect(screen.queryByText('Sledují 3 lidé')).toBeNull();
     });
 
-    it('shows the project a workshop is about, together with what has been committed in it', () => {
+    it('shows the project a workshop is about as a special material, together with what has been committed in it', () => {
         repositoryProgressMocks.controller = {
             progress: {
                 // Keep the fields from the former response shape here to ensure the panel only presents commits.
@@ -341,6 +341,10 @@ describe('online workshop participant room', () => {
         );
 
         const repositoryPanel = screen.getByLabelText('Projekt workshopu');
+        const materialsSection = screen.getByRole('heading', { name: 'Materiály z workshopu' }).closest('section');
+
+        expect(materialsSection?.contains(repositoryPanel)).toBe(true);
+        expect(repositoryPanel.tagName).toBe('ARTICLE');
         expect(repositoryPanel.textContent).not.toContain('A/B testing landing page for Promptbook');
         expect(repositoryPanel.textContent).not.toContain('Od začátku workshopu');
         expect(repositoryPanel.textContent).not.toContain('main');
@@ -348,6 +352,23 @@ describe('online workshop participant room', () => {
         expect(within(repositoryPanel).queryByText('1')).toBeNull();
     });
 
+    it('keeps the repository material available to a paying participant', async () => {
+        fetchCommunityMembership.mockResolvedValue({
+            status: 'active',
+            monthlyPriceCzk: 199,
+            currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
+            isCancellationScheduled: false,
+            isPurchaseOffered: false,
+            isSubscriptionManagementOffered: true,
+            isCoveredByDiscountCode: false,
+            isPaymentInTestMode: false,
+        });
+        renderParticipantRoom(WORKSHOP_ABOUT_A_PROJECT);
+
+        await screen.findByRole('button', { name: 'Placené členství. Otevřít stav členství' });
+        expect(screen.getByLabelText('Projekt workshopu')).not.toBeNull();
+    });
+
     it('shows nothing about a project in a room which is about none, and in a room which cannot be about one', () => {
         renderParticipantRoom(WORKSHOP);
         expect(screen.queryByLabelText('Projekt workshopu')).toBeNull();
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
index 82bd5e1..f3dd3a7 100644
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
@@ -229,14 +229,30 @@ export function OnlineWorkshopParticipantPage({
     const isWorkshopPollVisible = isWorkshopPollVisibleInRoom(state.workshop.kind);
     const isModerating = isWorkshopParticipantModerating(state.participant);
     const followUpContentBlock = state.contentBlocks.find((contentBlock) => contentBlock.isFollowUp) ?? null;
-    const specialMaterials = roomCapabilities.isCommunityInvitationOffered
-        ? [
-              {
-                  id: 'community',
-                  content: <CommunityRoomInvitation participantIdentity={state.participant} />,
-              },
-          ]
-        : [];
+    const repository = roomCapabilities.isRepositoryOffered ? state.workshop.repository : null;
+    const specialMaterials = [
+        ...(repository === null
+            ? []
+            : [
+                  {
+                      id: 'repository',
+                      content: (
+                          <WorkshopRepositoryPanel
+                              repository={repository}
+                              progressController={repositoryProgressController}
+                          />
+                      ),
+                  },
+              ]),
+        ...(roomCapabilities.isCommunityInvitationOffered
+            ? [
+                  {
+                      id: 'community',
+                      content: <CommunityRoomInvitation participantIdentity={state.participant} />,
+                  },
+              ]
+            : []),
+    ];
 
     // Note: What the kind of this room has and what an administrator switched off is asked here once, so a new panel
     //       is one line of the room.
@@ -323,16 +339,6 @@ export function OnlineWorkshopParticipantPage({
                             onSaveFeedback={controller.saveFeedback}
                         />
                     )}
-                    {/*
-                      * Note: A term is about a project only while its administration connected one, so a room which is
-                      *       about no project shows nothing about one rather than an empty panel.
-                      */}
-                    {roomCapabilities.isRepositoryOffered && state.workshop.repository !== null && (
-                        <WorkshopRepositoryPanel
-                            repository={state.workshop.repository}
-                            progressController={repositoryProgressController}
-                        />
-                    )}
                     {calendarDetails !== null && (
                         <WorkshopCalendarInvitation
                             workshop={state.workshop}
diff --git a/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx b/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
index 96cc8e7..e2e141d 100644
--- a/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
+++ b/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
@@ -49,18 +49,18 @@ export function WorkshopRepositoryPanel({ repository, progressController }: Work
         getGithubBranchSelectionPatterns(repository.branch).map((branchName) => ({ name: branchName, headSha: null }));
 
     return (
-        <section
+        <article
             aria-label="Projekt workshopu"
-            className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
+            className="relative scroll-mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
         >
             <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4">
                 <div className="min-w-0">
                     <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
                         <Github className="h-4 w-4" aria-hidden="true" /> Projekt workshopu
                     </p>
-                    <h2 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
+                    <h3 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
                         {repositoryName}
-                    </h2>
+                    </h3>
                 </div>
                 <div className="flex flex-wrap items-center gap-2">
                     {newCommitShas.size > 0 && (
@@ -137,6 +137,6 @@ export function WorkshopRepositoryPanel({ repository, progressController }: Work
                     </>
                 )}
             </div>
-        </section>
+        </article>
     );
 }
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 4ee8fbe..1b9e0df 100644
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,4 +1,9 @@
 # Current preversion
+- Moved a connected GitHub repository in `/cs/online-workshop/participant` into the materials list as a special
+  material. Its existing repository, deployment, and live-commit links now stay with ordinary workshop materials,
+  are visible even when no ordinary material has been unlocked, and remain available to both free and paid
+  participants without turning the repository into timed or membership-gated content.
+
 - Moved the community hand-off in `/cs/online-workshop/participant` into the materials list as a dedicated
   community material. It is shown even before an administrator has unlocked any ordinary material and remains
   available to free and paid members alike, while carrying the participant identity through the existing shared
 M AGENTS.md
 M businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
 M businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
 M businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
 M changelog/_current-preversion.md
 M prompts/2026-09-0100-repository-as-special-material.md

diff --git a/AGENTS.md b/AGENTS.md
index 5490191d7ea270f1a59cd3bea90b4a35fec1264e..627be626bbdd1109da0ac266cfbb4edcc6781710
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -149,13 +149,14 @@
   `feature/*`, or `*` for all branches, plus an optional deployment URL — so it is
   set, changed, and unset at once and neither branch selection nor deployment
   outlives its repository. Room kinds which offer it are named in
-  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository, its
-  links, and the newest commits, marking those which arrive while a participant
-  watches; a newly found commit is broadcast to active rooms and appears on the
-  stage for ten seconds. A selection resolving to multiple branches is shown as a
-  commit graph. Commits come from the public commit feed or keyless API, pooled
-  once per server and cached through the revalidation window; an
-  unreadable feed still leaves the room naming its project.
+  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository as a
+  special material beside its ordinary materials for every participant, with its
+  links and newest commits, marking those which arrive while a participant watches;
+  a newly found commit is broadcast to active rooms and appears on the stage for
+  ten seconds. A selection resolving to multiple branches is shown as a commit
+  graph. Commits come from the public commit feed or keyless API, pooled once per
+  server and cached through the revalidation window; an unreadable feed still
+  leaves the room naming its project.
 - Paid-only materials are decided on the server in one pass. Members receive
   unlocked material; others receive only the published titles as an offer. An
   untitled item is not named, items are not named before their unlock time, and a
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
index c8df97e15ec5e8ee846737e95e33682a1303e23d..8b209f67961717c498a57c1defeafefebe23f7a7
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
@@ -306,7 +306,7 @@
         expect(screen.queryByText('Sledují 3 lidé')).toBeNull();
     });
 
-    it('shows the project a workshop is about, together with what has been committed in it', () => {
+    it('shows the project a workshop is about as a special material, together with what has been committed in it', () => {
         repositoryProgressMocks.controller = {
             progress: {
                 // Keep the fields from the former response shape here to ensure the panel only presents commits.
@@ -341,6 +341,10 @@
         );
 
         const repositoryPanel = screen.getByLabelText('Projekt workshopu');
+        const materialsSection = screen.getByRole('heading', { name: 'Materiály z workshopu' }).closest('section');
+
+        expect(materialsSection?.contains(repositoryPanel)).toBe(true);
+        expect(repositoryPanel.tagName).toBe('ARTICLE');
         expect(repositoryPanel.textContent).not.toContain('A/B testing landing page for Promptbook');
         expect(repositoryPanel.textContent).not.toContain('Od začátku workshopu');
         expect(repositoryPanel.textContent).not.toContain('main');
@@ -348,6 +352,23 @@
         expect(within(repositoryPanel).queryByText('1')).toBeNull();
     });
 
+    it('keeps the repository material available to a paying participant', async () => {
+        fetchCommunityMembership.mockResolvedValue({
+            status: 'active',
+            monthlyPriceCzk: 199,
+            currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
+            isCancellationScheduled: false,
+            isPurchaseOffered: false,
+            isSubscriptionManagementOffered: true,
+            isCoveredByDiscountCode: false,
+            isPaymentInTestMode: false,
+        });
+        renderParticipantRoom(WORKSHOP_ABOUT_A_PROJECT);
+
+        await screen.findByRole('button', { name: 'Placené členství. Otevřít stav členství' });
+        expect(screen.getByLabelText('Projekt workshopu')).not.toBeNull();
+    });
+
     it('shows nothing about a project in a room which is about none, and in a room which cannot be about one', () => {
         renderParticipantRoom(WORKSHOP);
         expect(screen.queryByLabelText('Projekt workshopu')).toBeNull();
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
index 82bd5e1d0309dc4a7351be84301f542c2b40077c..f3dd3a74f87783d5c567e38739a34697aee7f195
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
@@ -229,14 +229,30 @@
     const isWorkshopPollVisible = isWorkshopPollVisibleInRoom(state.workshop.kind);
     const isModerating = isWorkshopParticipantModerating(state.participant);
     const followUpContentBlock = state.contentBlocks.find((contentBlock) => contentBlock.isFollowUp) ?? null;
-    const specialMaterials = roomCapabilities.isCommunityInvitationOffered
-        ? [
-              {
-                  id: 'community',
-                  content: <CommunityRoomInvitation participantIdentity={state.participant} />,
-              },
-          ]
-        : [];
+    const repository = roomCapabilities.isRepositoryOffered ? state.workshop.repository : null;
+    const specialMaterials = [
+        ...(repository === null
+            ? []
+            : [
+                  {
+                      id: 'repository',
+                      content: (
+                          <WorkshopRepositoryPanel
+                              repository={repository}
+                              progressController={repositoryProgressController}
+                          />
+                      ),
+                  },
+              ]),
+        ...(roomCapabilities.isCommunityInvitationOffered
+            ? [
+                  {
+                      id: 'community',
+                      content: <CommunityRoomInvitation participantIdentity={state.participant} />,
+                  },
+              ]
+            : []),
+    ];
 
     // Note: What the kind of this room has and what an administrator switched off is asked here once, so a new panel
     //       is one line of the room.
@@ -321,16 +337,6 @@
                             stageComment={state.stageComment}
                             paidMembersOnlyVideo={state.paidMembersOnlyVideo}
                             onSaveFeedback={controller.saveFeedback}
-                        />
-                    )}
-                    {/*
-                      * Note: A term is about a project only while its administration connected one, so a room which is
-                      *       about no project shows nothing about one rather than an empty panel.
-                      */}
-                    {roomCapabilities.isRepositoryOffered && state.workshop.repository !== null && (
-                        <WorkshopRepositoryPanel
-                            repository={state.workshop.repository}
-                            progressController={repositoryProgressController}
                         />
                     )}
                     {calendarDetails !== null && (
diff --git a/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx b/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
index 96cc8e7f32180728917294223502e69edced4e6b..e2e141daebd05e3d20ca791f2013189bc91e884d
--- a/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
+++ b/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
@@ -49,18 +49,18 @@
         getGithubBranchSelectionPatterns(repository.branch).map((branchName) => ({ name: branchName, headSha: null }));
 
     return (
-        <section
+        <article
             aria-label="Projekt workshopu"
-            className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
+            className="relative scroll-mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
         >
             <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4">
                 <div className="min-w-0">
                     <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
                         <Github className="h-4 w-4" aria-hidden="true" /> Projekt workshopu
                     </p>
-                    <h2 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
+                    <h3 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
                         {repositoryName}
-                    </h2>
+                    </h3>
                 </div>
                 <div className="flex flex-wrap items-center gap-2">
                     {newCommitShas.size > 0 && (
@@ -137,6 +137,6 @@
                     </>
                 )}
             </div>
-        </section>
+        </article>
     );
 }
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 4ee8fbecc56c2657b616810871a480acd67dcd8f..1b9e0df7e45563956015e9d529126853c2a3e470
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,4 +1,9 @@
 # Current preversion
+- Moved a connected GitHub repository in `/cs/online-workshop/participant` into the materials list as a special
+  material. Its existing repository, deployment, and live-commit links now stay with ordinary workshop materials,
+  are visible even when no ordinary material has been unlocked, and remain available to both free and paid
+  participants without turning the repository into timed or membership-gated content.
+
 - Moved the community hand-off in `/cs/online-workshop/participant` into the materials list as a dedicated
   community material. It is shown even before an administrator has unlocked any ordinary material and remains
   available to free and paid members alike, while carrying the participant identity through the existing shared

codex
The repository panel is now supplied through the shared special-material collection, so it keeps its existing GitHub/deployment/commit behavior but no longer renders in a separate part of the room. I’ve added coverage for its placement and paid-member visibility; next I’m running the focused participant-room tests.
exec
/bin/zsh -lc 'npm test -- businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx businesses/online-workshop/participant/WorkshopContent.test.tsx' in /Users/hejny/work/aldaron
 succeeded in 2254ms:

> promptbook-landing-page@0.1.0 test
> vitest run businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx businesses/online-workshop/participant/WorkshopContent.test.tsx


 RUN  v3.2.4 /Users/hejny/work/aldaron

 ✓ businesses/online-workshop/participant/WorkshopContent.test.tsx (13 tests) 81ms
 ✓ businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx (21 tests) 411ms

 Test Files  2 passed (2)
      Tests  34 passed (34)
   Start at  17:16:43
   Duration  1.63s (transform 365ms, setup 0ms, collect 955ms, tests 492ms, environment 648ms, prepare 96ms)


diff --git a/AGENTS.md b/AGENTS.md
index 5490191d7ea270f1a59cd3bea90b4a35fec1264e..627be626bbdd1109da0ac266cfbb4edcc6781710
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -149,13 +149,14 @@
   `feature/*`, or `*` for all branches, plus an optional deployment URL — so it is
   set, changed, and unset at once and neither branch selection nor deployment
   outlives its repository. Room kinds which offer it are named in
-  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository, its
-  links, and the newest commits, marking those which arrive while a participant
-  watches; a newly found commit is broadcast to active rooms and appears on the
-  stage for ten seconds. A selection resolving to multiple branches is shown as a
-  commit graph. Commits come from the public commit feed or keyless API, pooled
-  once per server and cached through the revalidation window; an
-  unreadable feed still leaves the room naming its project.
+  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository as a
+  special material beside its ordinary materials for every participant, with its
+  links and newest commits, marking those which arrive while a participant watches;
+  a newly found commit is broadcast to active rooms and appears on the stage for
+  ten seconds. A selection resolving to multiple branches is shown as a commit
+  graph. Commits come from the public commit feed or keyless API, pooled once per
+  server and cached through the revalidation window; an unreadable feed still
+  leaves the room naming its project.
 - Paid-only materials are decided on the server in one pass. Members receive
   unlocked material; others receive only the published titles as an offer. An
   untitled item is not named, items are not named before their unlock time, and a
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
index c8df97e15ec5e8ee846737e95e33682a1303e23d..8b209f67961717c498a57c1defeafefebe23f7a7
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
@@ -306,7 +306,7 @@
         expect(screen.queryByText('Sledují 3 lidé')).toBeNull();
     });
 
-    it('shows the project a workshop is about, together with what has been committed in it', () => {
+    it('shows the project a workshop is about as a special material, together with what has been committed in it', () => {
         repositoryProgressMocks.controller = {
             progress: {
                 // Keep the fields from the former response shape here to ensure the panel only presents commits.
@@ -341,6 +341,10 @@
         );
 
         const repositoryPanel = screen.getByLabelText('Projekt workshopu');
+        const materialsSection = screen.getByRole('heading', { name: 'Materiály z workshopu' }).closest('section');
+
+        expect(materialsSection?.contains(repositoryPanel)).toBe(true);
+        expect(repositoryPanel.tagName).toBe('ARTICLE');
         expect(repositoryPanel.textContent).not.toContain('A/B testing landing page for Promptbook');
         expect(repositoryPanel.textContent).not.toContain('Od začátku workshopu');
         expect(repositoryPanel.textContent).not.toContain('main');
@@ -348,6 +352,23 @@
         expect(within(repositoryPanel).queryByText('1')).toBeNull();
     });
 
+    it('keeps the repository material available to a paying participant', async () => {
+        fetchCommunityMembership.mockResolvedValue({
+            status: 'active',
+            monthlyPriceCzk: 199,
+            currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
+            isCancellationScheduled: false,
+            isPurchaseOffered: false,
+            isSubscriptionManagementOffered: true,
+            isCoveredByDiscountCode: false,
+            isPaymentInTestMode: false,
+        });
+        renderParticipantRoom(WORKSHOP_ABOUT_A_PROJECT);
+
+        await screen.findByRole('button', { name: 'Placené členství. Otevřít stav členství' });
+        expect(screen.getByLabelText('Projekt workshopu')).not.toBeNull();
+    });
+
     it('shows nothing about a project in a room which is about none, and in a room which cannot be about one', () => {
         renderParticipantRoom(WORKSHOP);
         expect(screen.queryByLabelText('Projekt workshopu')).toBeNull();
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
index 82bd5e1d0309dc4a7351be84301f542c2b40077c..f3dd3a74f87783d5c567e38739a34697aee7f195
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
@@ -229,14 +229,30 @@
     const isWorkshopPollVisible = isWorkshopPollVisibleInRoom(state.workshop.kind);
     const isModerating = isWorkshopParticipantModerating(state.participant);
     const followUpContentBlock = state.contentBlocks.find((contentBlock) => contentBlock.isFollowUp) ?? null;
-    const specialMaterials = roomCapabilities.isCommunityInvitationOffered
-        ? [
-              {
-                  id: 'community',
-                  content: <CommunityRoomInvitation participantIdentity={state.participant} />,
-              },
-          ]
-        : [];
+    const repository = roomCapabilities.isRepositoryOffered ? state.workshop.repository : null;
+    const specialMaterials = [
+        ...(repository === null
+            ? []
+            : [
+                  {
+                      id: 'repository',
+                      content: (
+                          <WorkshopRepositoryPanel
+                              repository={repository}
+                              progressController={repositoryProgressController}
+                          />
+                      ),
+                  },
+              ]),
+        ...(roomCapabilities.isCommunityInvitationOffered
+            ? [
+                  {
+                      id: 'community',
+                      content: <CommunityRoomInvitation participantIdentity={state.participant} />,
+                  },
+              ]
+            : []),
+    ];
 
     // Note: What the kind of this room has and what an administrator switched off is asked here once, so a new panel
     //       is one line of the room.
@@ -321,16 +337,6 @@
                             stageComment={state.stageComment}
                             paidMembersOnlyVideo={state.paidMembersOnlyVideo}
                             onSaveFeedback={controller.saveFeedback}
-                        />
-                    )}
-                    {/*
-                      * Note: A term is about a project only while its administration connected one, so a room which is
-                      *       about no project shows nothing about one rather than an empty panel.
-                      */}
-                    {roomCapabilities.isRepositoryOffered && state.workshop.repository !== null && (
-                        <WorkshopRepositoryPanel
-                            repository={state.workshop.repository}
-                            progressController={repositoryProgressController}
                         />
                     )}
                     {calendarDetails !== null && (
diff --git a/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx b/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
index 96cc8e7f32180728917294223502e69edced4e6b..e2e141daebd05e3d20ca791f2013189bc91e884d
--- a/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
+++ b/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
@@ -49,18 +49,18 @@
         getGithubBranchSelectionPatterns(repository.branch).map((branchName) => ({ name: branchName, headSha: null }));
 
     return (
-        <section
+        <article
             aria-label="Projekt workshopu"
-            className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
+            className="relative scroll-mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
         >
             <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4">
                 <div className="min-w-0">
                     <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
                         <Github className="h-4 w-4" aria-hidden="true" /> Projekt workshopu
                     </p>
-                    <h2 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
+                    <h3 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
                         {repositoryName}
-                    </h2>
+                    </h3>
                 </div>
                 <div className="flex flex-wrap items-center gap-2">
                     {newCommitShas.size > 0 && (
@@ -137,6 +137,6 @@
                     </>
                 )}
             </div>
-        </section>
+        </article>
     );
 }
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 4ee8fbecc56c2657b616810871a480acd67dcd8f..1b9e0df7e45563956015e9d529126853c2a3e470
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,4 +1,9 @@
 # Current preversion
+- Moved a connected GitHub repository in `/cs/online-workshop/participant` into the materials list as a special
+  material. Its existing repository, deployment, and live-commit links now stay with ordinary workshop materials,
+  are visible even when no ordinary material has been unlocked, and remain available to both free and paid
+  participants without turning the repository into timed or membership-gated content.
+
 - Moved the community hand-off in `/cs/online-workshop/participant` into the materials list as a dedicated
   community material. It is shown even before an administrator has unlocked any ordinary material and remains
   available to free and paid members alike, while carrying the participant identity through the existing shared

exec
/bin/zsh -lc 'npm run lint' in /Users/hejny/work/aldaron
 succeeded in 1647ms:
✔ No ESLint warnings or errors

diff --git a/AGENTS.md b/AGENTS.md
index 5490191d7ea270f1a59cd3bea90b4a35fec1264e..627be626bbdd1109da0ac266cfbb4edcc6781710
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -149,13 +149,14 @@
   `feature/*`, or `*` for all branches, plus an optional deployment URL — so it is
   set, changed, and unset at once and neither branch selection nor deployment
   outlives its repository. Room kinds which offer it are named in
-  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository, its
-  links, and the newest commits, marking those which arrive while a participant
-  watches; a newly found commit is broadcast to active rooms and appears on the
-  stage for ten seconds. A selection resolving to multiple branches is shown as a
-  commit graph. Commits come from the public commit feed or keyless API, pooled
-  once per server and cached through the revalidation window; an
-  unreadable feed still leaves the room naming its project.
+  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository as a
+  special material beside its ordinary materials for every participant, with its
+  links and newest commits, marking those which arrive while a participant watches;
+  a newly found commit is broadcast to active rooms and appears on the stage for
+  ten seconds. A selection resolving to multiple branches is shown as a commit
+  graph. Commits come from the public commit feed or keyless API, pooled once per
+  server and cached through the revalidation window; an unreadable feed still
+  leaves the room naming its project.
 - Paid-only materials are decided on the server in one pass. Members receive
   unlocked material; others receive only the published titles as an offer. An
   untitled item is not named, items are not named before their unlock time, and a
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
index c8df97e15ec5e8ee846737e95e33682a1303e23d..8b209f67961717c498a57c1defeafefebe23f7a7
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
@@ -306,7 +306,7 @@
         expect(screen.queryByText('Sledují 3 lidé')).toBeNull();
     });
 
-    it('shows the project a workshop is about, together with what has been committed in it', () => {
+    it('shows the project a workshop is about as a special material, together with what has been committed in it', () => {
         repositoryProgressMocks.controller = {
             progress: {
                 // Keep the fields from the former response shape here to ensure the panel only presents commits.
@@ -341,6 +341,10 @@
         );
 
         const repositoryPanel = screen.getByLabelText('Projekt workshopu');
+        const materialsSection = screen.getByRole('heading', { name: 'Materiály z workshopu' }).closest('section');
+
+        expect(materialsSection?.contains(repositoryPanel)).toBe(true);
+        expect(repositoryPanel.tagName).toBe('ARTICLE');
         expect(repositoryPanel.textContent).not.toContain('A/B testing landing page for Promptbook');
         expect(repositoryPanel.textContent).not.toContain('Od začátku workshopu');
         expect(repositoryPanel.textContent).not.toContain('main');
@@ -348,6 +352,23 @@
         expect(within(repositoryPanel).queryByText('1')).toBeNull();
     });
 
+    it('keeps the repository material available to a paying participant', async () => {
+        fetchCommunityMembership.mockResolvedValue({
+            status: 'active',
+            monthlyPriceCzk: 199,
+            currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
+            isCancellationScheduled: false,
+            isPurchaseOffered: false,
+            isSubscriptionManagementOffered: true,
+            isCoveredByDiscountCode: false,
+            isPaymentInTestMode: false,
+        });
+        renderParticipantRoom(WORKSHOP_ABOUT_A_PROJECT);
+
+        await screen.findByRole('button', { name: 'Placené členství. Otevřít stav členství' });
+        expect(screen.getByLabelText('Projekt workshopu')).not.toBeNull();
+    });
+
     it('shows nothing about a project in a room which is about none, and in a room which cannot be about one', () => {
         renderParticipantRoom(WORKSHOP);
         expect(screen.queryByLabelText('Projekt workshopu')).toBeNull();
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
index 82bd5e1d0309dc4a7351be84301f542c2b40077c..f3dd3a74f87783d5c567e38739a34697aee7f195
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
@@ -229,14 +229,30 @@
     const isWorkshopPollVisible = isWorkshopPollVisibleInRoom(state.workshop.kind);
     const isModerating = isWorkshopParticipantModerating(state.participant);
     const followUpContentBlock = state.contentBlocks.find((contentBlock) => contentBlock.isFollowUp) ?? null;
-    const specialMaterials = roomCapabilities.isCommunityInvitationOffered
-        ? [
-              {
-                  id: 'community',
-                  content: <CommunityRoomInvitation participantIdentity={state.participant} />,
-              },
-          ]
-        : [];
+    const repository = roomCapabilities.isRepositoryOffered ? state.workshop.repository : null;
+    const specialMaterials = [
+        ...(repository === null
+            ? []
+            : [
+                  {
+                      id: 'repository',
+                      content: (
+                          <WorkshopRepositoryPanel
+                              repository={repository}
+                              progressController={repositoryProgressController}
+                          />
+                      ),
+                  },
+              ]),
+        ...(roomCapabilities.isCommunityInvitationOffered
+            ? [
+                  {
+                      id: 'community',
+                      content: <CommunityRoomInvitation participantIdentity={state.participant} />,
+                  },
+              ]
+            : []),
+    ];
 
     // Note: What the kind of this room has and what an administrator switched off is asked here once, so a new panel
     //       is one line of the room.
@@ -321,16 +337,6 @@
                             stageComment={state.stageComment}
                             paidMembersOnlyVideo={state.paidMembersOnlyVideo}
                             onSaveFeedback={controller.saveFeedback}
-                        />
-                    )}
-                    {/*
-                      * Note: A term is about a project only while its administration connected one, so a room which is
-                      *       about no project shows nothing about one rather than an empty panel.
-                      */}
-                    {roomCapabilities.isRepositoryOffered && state.workshop.repository !== null && (
-                        <WorkshopRepositoryPanel
-                            repository={state.workshop.repository}
-                            progressController={repositoryProgressController}
                         />
                     )}
                     {calendarDetails !== null && (
diff --git a/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx b/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
index 96cc8e7f32180728917294223502e69edced4e6b..e2e141daebd05e3d20ca791f2013189bc91e884d
--- a/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
+++ b/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
@@ -49,18 +49,18 @@
         getGithubBranchSelectionPatterns(repository.branch).map((branchName) => ({ name: branchName, headSha: null }));
 
     return (
-        <section
+        <article
             aria-label="Projekt workshopu"
-            className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
+            className="relative scroll-mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
         >
             <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4">
                 <div className="min-w-0">
                     <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
                         <Github className="h-4 w-4" aria-hidden="true" /> Projekt workshopu
                     </p>
-                    <h2 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
+                    <h3 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
                         {repositoryName}
-                    </h2>
+                    </h3>
                 </div>
                 <div className="flex flex-wrap items-center gap-2">
                     {newCommitShas.size > 0 && (
@@ -137,6 +137,6 @@
                     </>
                 )}
             </div>
-        </section>
+        </article>
     );
 }
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 4ee8fbecc56c2657b616810871a480acd67dcd8f..1b9e0df7e45563956015e9d529126853c2a3e470
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,4 +1,9 @@
 # Current preversion
+- Moved a connected GitHub repository in `/cs/online-workshop/participant` into the materials list as a special
+  material. Its existing repository, deployment, and live-commit links now stay with ordinary workshop materials,
+  are visible even when no ordinary material has been unlocked, and remain available to both free and paid
+  participants without turning the repository into timed or membership-gated content.
+
 - Moved the community hand-off in `/cs/online-workshop/participant` into the materials list as a dedicated
   community material. It is shown even before an administrator has unlocked any ordinary material and remains
   available to free and paid members alike, while carrying the participant identity through the existing shared

exec
/bin/zsh -lc 'npm run test-types' in /Users/hejny/work/aldaron
 succeeded in 22587ms:

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
   Generating static pages (19/78) 
   Generating static pages (38/78) 
BenefitsSection rendered
IntegrationsSection rendered
BenefitsSection rendered
BenefitsSection rendered
IntegrationsSection rendered
BenefitsSection rendered
IntegrationsSection rendered
BenefitsSection rendered
IntegrationsSection rendered
   Generating static pages (58/78) 
 ✓ Generating static pages (78/78)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                                                                  Size  First Load JS  Revalidate  Expire
┌ ƒ /                                                                                       377 B         102 kB
├ ○ /_not-found                                                                             377 B         102 kB
├ ƒ /[shortcode]                                                                          2.31 kB         142 kB
├ ƒ /admin                                                                                  176 B         105 kB
├ ƒ /admin/community                                                                      7.73 kB         325 kB
├ ƒ /admin/contacts                                                                       36.9 kB         196 kB
├ ƒ /admin/discount-codes                                                                 9.86 kB         119 kB
├ ƒ /admin/login                                                                            377 B         102 kB
├ ƒ /admin/shortener                                                                      64.6 kB         174 kB
├ ƒ /admin/workshops                                                                        215 B         317 kB
├ ○ /ai-supervize                                                                           16 kB         239 kB
├ ƒ /ai-supervize-mini                                                                    17.1 kB         231 kB
├ ○ /ai-supervize-mini/opengraph-image                                                      377 B         102 kB
├ ƒ /ai-supervize-mini/participant                                                        2.51 kB         139 kB
├ ○ /ai-supervize/opengraph-image                                                           377 B         102 kB
├ ○ /ai-ta-krajta                                                                         18.9 kB         146 kB          1h      1y
├ ○ /ai-ta-krajta/branding                                                                  203 B         121 kB
├ ○ /ai-ta-krajta/logo.png                                                                  377 B         102 kB
├ ○ /ai-ta-krajta/logo.svg                                                                  377 B         102 kB
├ ○ /ai-ta-krajta/manifest.webmanifest                                                      377 B         102 kB
├ ○ /ai-ta-krajta/media-kit                                                               3.63 kB         125 kB
├ ○ /ai-ta-krajta/opengraph-image                                                           377 B         102 kB
├ ƒ /api/admin/community/memberships                                                        377 B         102 kB
├ ƒ /api/admin/community/projects                                                           377 B         102 kB
├ ƒ /api/admin/community/projects/[projectId]                                               377 B         102 kB
├ ƒ /api/admin/discount-codes                                                               377 B         102 kB
├ ƒ /api/admin/discount-codes/[discountCodeId]                                              377 B         102 kB
├ ƒ /api/admin/session                                                                      377 B         102 kB
├ ƒ /api/admin/session/sign-out                                                             377 B         102 kB
├ ƒ /api/admin/shortener                                                                    377 B         102 kB
├ ƒ /api/admin/shortener/[shortcodeLinkId]                                                  377 B         102 kB
├ ƒ /api/admin/shortener/[shortcodeLinkId]/clicks                                           377 B         102 kB
├ ƒ /api/admin/workshops                                                                    377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]                                                       377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/analytics                                             377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/artificial-reactions                                  377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/comments                                              377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/comments/[commentId]                                  377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/comments/[commentId]/artificial-upvotes               377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/content                                               377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/content/[contentId]                                   377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/exports/[exportKind]                                  377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/feedback                                              377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/participants                                          377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/participants/[participantId]                          377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/participants/[participantId]/timeline                 377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/polls                                                 377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/polls/[pollId]                                        377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/polls/[pollId]/options/[optionId]/artificial-votes    377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/reactions                                             377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/stage-comment                                         377 B         102 kB
├ ƒ /api/ai-supervize-mini/registration                                                     377 B         102 kB
├ ƒ /api/ai-ta-krajta/episodes/search                                                       377 B         102 kB
├ ƒ /api/community/membership/registration                                                  377 B         102 kB
├ ƒ /api/contacts                                                                           377 B         102 kB
├ ƒ /api/contacts/export/[formatId]                                                         377 B         102 kB
├ ƒ /api/discount-codes/validate                                                            377 B         102 kB
├ ƒ /api/stripe/webhook                                                                     377 B         102 kB
├ ƒ /api/track-click                                                                        377 B         102 kB
├ ƒ /api/waitlist                                                                           377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/comments                                                  377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/comments/[commentId]                                      377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/comments/[commentId]/upvotes                              377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/connect                                                   377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/feedback                                                  377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership                                                377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership/cancellation                                   377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership/checkout                                       377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership/checkout/confirmation                          377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership/portal                                         377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/participant                                               377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/participants/[participantId]                              377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/polls/[pollId]/votes                                      377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/presence                                                  377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/reactions                                                 377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/repository                                                377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/state                                                     377 B         102 kB
├ ƒ /api/workshops/komunita/projects                                                        377 B         102 kB
├ ƒ /api/workshops/komunita/projects/[projectId]                                            377 B         102 kB
├ ƒ /api/workshops/komunita/projects/[projectId]/connect                                    377 B         102 kB
├ ƒ /api/workshops/komunita/projects/[projectId]/vote                                       377 B         102 kB
├ ƒ /api/workshops/komunita/projects/preview                                                377 B         102 kB
├ ○ /branding                                                                             4.74 kB         141 kB
├ ○ /contact                                                                              2.54 kB         163 kB
├ ○ /cs                                                                                     170 B         239 kB
├ ƒ /cs/komunita                                                                            231 B         294 kB
├ ƒ /cs/komunita/calendar.ics                                                               377 B         102 kB
├ ƒ /cs/komunita/clenstvi                                                                 13.2 kB         154 kB
├ ○ /cs/komunita/clenstvi/opengraph-image                                                   377 B         102 kB
├ ○ /cs/komunita/opengraph-image                                                            377 B         102 kB
├ ƒ /cs/komunita/projects                                                                 2.83 kB         139 kB
├ ƒ /cs/komunita/projects/[projectId]                                                     3.02 kB         291 kB
├ ○ /cs/obchodni-podminky                                                                 2.52 kB         139 kB
├ ○ /cs/ochrana-osobnich-udaju                                                            2.52 kB         139 kB
├ ƒ /cs/online-workshop                                                                   13.1 kB         244 kB
├ ƒ /cs/online-workshop/dekujeme                                                          4.01 kB         152 kB
├ ○ /cs/online-workshop/opengraph-image                                                     377 B         102 kB
├ ƒ /cs/online-workshop/participant                                                       2.72 kB         291 kB
├ ○ /cs/online-workshop/participant/opengraph-image                                         377 B         102 kB
├ ○ /cs/opengraph-image                                                                     377 B         102 kB
├ ○ /cs/pavol                                                                               157 B         203 kB
├ ○ /cs/pavol/opengraph-image                                                               377 B         102 kB
├ ○ /data-deletion                                                                        2.51 kB         139 kB
├ ○ /dekujeme                                                                             3.72 kB         151 kB
├ ○ /en                                                                                     169 B         239 kB
├ ○ /en/opengraph-image                                                                     377 B         102 kB
├ ○ /en/pavol                                                                               158 B         203 kB
├ ○ /en/pavol/opengraph-image                                                               377 B         102 kB
├ ○ /en/privacy-policy                                                                    2.52 kB         139 kB
├ ○ /en/terms-and-conditions                                                              2.52 kB         139 kB
├ ○ /for-agro                                                                             7.31 kB         268 kB
├ ○ /for-agro/opengraph-image                                                               377 B         102 kB
├ ○ /for-industry                                                                         7.92 kB         269 kB
├ ○ /for-industry/opengraph-image                                                           377 B         102 kB
├ ○ /hackathon-factory                                                                      15 kB         252 kB
├ ○ /hackathon-factory/opengraph-image                                                      377 B         102 kB
├ ƒ /k/[...shortFileUrlParts]                                                               377 B         102 kB
├ ○ /manifest.webmanifest                                                                   377 B         102 kB
├ ○ /old                                                                                  20.5 kB         245 kB
├ ○ /opengraph-image                                                                        377 B         102 kB
├ ƒ /pavol                                                                                  377 B         102 kB
├ ƒ /privacy                                                                                377 B         102 kB
├ ƒ /pro-firmy                                                                              377 B         102 kB
├ ○ /pro-mesta                                                                            6.39 kB         267 kB
├ ○ /pro-mesta/opengraph-image                                                              377 B         102 kB
├ ○ /robots.txt                                                                             377 B         102 kB
├ ○ /shortener                                                                              377 B         102 kB
├ ○ /sitemap.xml                                                                            377 B         102 kB
├ ƒ /skoleni                                                                                377 B         102 kB
├ ƒ /terms                                                                                  377 B         102 kB
└ ○ /test/hopko                                                                           4.62 kB         106 kB
+ First Load JS shared by all                                                              102 kB
  ├ chunks/1684-6c8ee981b3c4cfc9.js                                                       45.8 kB
  ├ chunks/4bd1b696-56d776b9b579ad04.js                                                   53.3 kB
  └ other shared chunks (total)                                                            2.5 kB


ƒ Middleware                                                                                31 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand


diff --git a/AGENTS.md b/AGENTS.md
index 5490191d7ea270f1a59cd3bea90b4a35fec1264e..627be626bbdd1109da0ac266cfbb4edcc6781710
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -149,13 +149,14 @@
   `feature/*`, or `*` for all branches, plus an optional deployment URL — so it is
   set, changed, and unset at once and neither branch selection nor deployment
   outlives its repository. Room kinds which offer it are named in
-  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository, its
-  links, and the newest commits, marking those which arrive while a participant
-  watches; a newly found commit is broadcast to active rooms and appears on the
-  stage for ten seconds. A selection resolving to multiple branches is shown as a
-  commit graph. Commits come from the public commit feed or keyless API, pooled
-  once per server and cached through the revalidation window; an
-  unreadable feed still leaves the room naming its project.
+  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository as a
+  special material beside its ordinary materials for every participant, with its
+  links and newest commits, marking those which arrive while a participant watches;
+  a newly found commit is broadcast to active rooms and appears on the stage for
+  ten seconds. A selection resolving to multiple branches is shown as a commit
+  graph. Commits come from the public commit feed or keyless API, pooled once per
+  server and cached through the revalidation window; an unreadable feed still
+  leaves the room naming its project.
 - Paid-only materials are decided on the server in one pass. Members receive
   unlocked material; others receive only the published titles as an offer. An
   untitled item is not named, items are not named before their unlock time, and a
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
index c8df97e15ec5e8ee846737e95e33682a1303e23d..8b209f67961717c498a57c1defeafefebe23f7a7
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
@@ -306,7 +306,7 @@
         expect(screen.queryByText('Sledují 3 lidé')).toBeNull();
     });
 
-    it('shows the project a workshop is about, together with what has been committed in it', () => {
+    it('shows the project a workshop is about as a special material, together with what has been committed in it', () => {
         repositoryProgressMocks.controller = {
             progress: {
                 // Keep the fields from the former response shape here to ensure the panel only presents commits.
@@ -341,6 +341,10 @@
         );
 
         const repositoryPanel = screen.getByLabelText('Projekt workshopu');
+        const materialsSection = screen.getByRole('heading', { name: 'Materiály z workshopu' }).closest('section');
+
+        expect(materialsSection?.contains(repositoryPanel)).toBe(true);
+        expect(repositoryPanel.tagName).toBe('ARTICLE');
         expect(repositoryPanel.textContent).not.toContain('A/B testing landing page for Promptbook');
         expect(repositoryPanel.textContent).not.toContain('Od začátku workshopu');
         expect(repositoryPanel.textContent).not.toContain('main');
@@ -348,6 +352,23 @@
         expect(within(repositoryPanel).queryByText('1')).toBeNull();
     });
 
+    it('keeps the repository material available to a paying participant', async () => {
+        fetchCommunityMembership.mockResolvedValue({
+            status: 'active',
+            monthlyPriceCzk: 199,
+            currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
+            isCancellationScheduled: false,
+            isPurchaseOffered: false,
+            isSubscriptionManagementOffered: true,
+            isCoveredByDiscountCode: false,
+            isPaymentInTestMode: false,
+        });
+        renderParticipantRoom(WORKSHOP_ABOUT_A_PROJECT);
+
+        await screen.findByRole('button', { name: 'Placené členství. Otevřít stav členství' });
+        expect(screen.getByLabelText('Projekt workshopu')).not.toBeNull();
+    });
+
     it('shows nothing about a project in a room which is about none, and in a room which cannot be about one', () => {
         renderParticipantRoom(WORKSHOP);
         expect(screen.queryByLabelText('Projekt workshopu')).toBeNull();
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
index 82bd5e1d0309dc4a7351be84301f542c2b40077c..f3dd3a74f87783d5c567e38739a34697aee7f195
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
@@ -229,14 +229,30 @@
     const isWorkshopPollVisible = isWorkshopPollVisibleInRoom(state.workshop.kind);
     const isModerating = isWorkshopParticipantModerating(state.participant);
     const followUpContentBlock = state.contentBlocks.find((contentBlock) => contentBlock.isFollowUp) ?? null;
-    const specialMaterials = roomCapabilities.isCommunityInvitationOffered
-        ? [
-              {
-                  id: 'community',
-                  content: <CommunityRoomInvitation participantIdentity={state.participant} />,
-              },
-          ]
-        : [];
+    const repository = roomCapabilities.isRepositoryOffered ? state.workshop.repository : null;
+    const specialMaterials = [
+        ...(repository === null
+            ? []
+            : [
+                  {
+                      id: 'repository',
+                      content: (
+                          <WorkshopRepositoryPanel
+                              repository={repository}
+                              progressController={repositoryProgressController}
+                          />
+                      ),
+                  },
+              ]),
+        ...(roomCapabilities.isCommunityInvitationOffered
+            ? [
+                  {
+                      id: 'community',
+                      content: <CommunityRoomInvitation participantIdentity={state.participant} />,
+                  },
+              ]
+            : []),
+    ];
 
     // Note: What the kind of this room has and what an administrator switched off is asked here once, so a new panel
     //       is one line of the room.
@@ -321,16 +337,6 @@
                             stageComment={state.stageComment}
                             paidMembersOnlyVideo={state.paidMembersOnlyVideo}
                             onSaveFeedback={controller.saveFeedback}
-                        />
-                    )}
-                    {/*
-                      * Note: A term is about a project only while its administration connected one, so a room which is
-                      *       about no project shows nothing about one rather than an empty panel.
-                      */}
-                    {roomCapabilities.isRepositoryOffered && state.workshop.repository !== null && (
-                        <WorkshopRepositoryPanel
-                            repository={state.workshop.repository}
-                            progressController={repositoryProgressController}
                         />
                     )}
                     {calendarDetails !== null && (
diff --git a/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx b/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
index 96cc8e7f32180728917294223502e69edced4e6b..e2e141daebd05e3d20ca791f2013189bc91e884d
--- a/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
+++ b/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
@@ -49,18 +49,18 @@
         getGithubBranchSelectionPatterns(repository.branch).map((branchName) => ({ name: branchName, headSha: null }));
 
     return (
-        <section
+        <article
             aria-label="Projekt workshopu"
-            className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
+            className="relative scroll-mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
         >
             <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4">
                 <div className="min-w-0">
                     <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
                         <Github className="h-4 w-4" aria-hidden="true" /> Projekt workshopu
                     </p>
-                    <h2 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
+                    <h3 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
                         {repositoryName}
-                    </h2>
+                    </h3>
                 </div>
                 <div className="flex flex-wrap items-center gap-2">
                     {newCommitShas.size > 0 && (
@@ -137,6 +137,6 @@
                     </>
                 )}
             </div>
-        </section>
+        </article>
     );
 }
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 4ee8fbecc56c2657b616810871a480acd67dcd8f..1b9e0df7e45563956015e9d529126853c2a3e470
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,4 +1,9 @@
 # Current preversion
+- Moved a connected GitHub repository in `/cs/online-workshop/participant` into the materials list as a special
+  material. Its existing repository, deployment, and live-commit links now stay with ordinary workshop materials,
+  are visible even when no ordinary material has been unlocked, and remain available to both free and paid
+  participants without turning the repository into timed or membership-gated content.
+
 - Moved the community hand-off in `/cs/online-workshop/participant` into the materials list as a dedicated
   community material. It is shown even before an administrator has unlocked any ordinary material and remains
   available to free and paid members alike, while carrying the participant identity through the existing shared

apply patch
patch: completed
/Users/hejny/work/aldaron/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
/Users/hejny/work/aldaron/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
diff --git a/AGENTS.md b/AGENTS.md
index 5490191d7ea270f1a59cd3bea90b4a35fec1264e..627be626bbdd1109da0ac266cfbb4edcc6781710
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -149,13 +149,14 @@
   `feature/*`, or `*` for all branches, plus an optional deployment URL — so it is
   set, changed, and unset at once and neither branch selection nor deployment
   outlives its repository. Room kinds which offer it are named in
-  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository, its
-  links, and the newest commits, marking those which arrive while a participant
-  watches; a newly found commit is broadcast to active rooms and appears on the
-  stage for ten seconds. A selection resolving to multiple branches is shown as a
-  commit graph. Commits come from the public commit feed or keyless API, pooled
-  once per server and cached through the revalidation window; an
-  unreadable feed still leaves the room naming its project.
+  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository as a
+  special material beside its ordinary materials for every participant, with its
+  links and newest commits, marking those which arrive while a participant watches;
+  a newly found commit is broadcast to active rooms and appears on the stage for
+  ten seconds. A selection resolving to multiple branches is shown as a commit
+  graph. Commits come from the public commit feed or keyless API, pooled once per
+  server and cached through the revalidation window; an unreadable feed still
+  leaves the room naming its project.
 - Paid-only materials are decided on the server in one pass. Members receive
   unlocked material; others receive only the published titles as an offer. An
   untitled item is not named, items are not named before their unlock time, and a
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
index c8df97e15ec5e8ee846737e95e33682a1303e23d..83f958689fc6061482e913342b05af6d7acb7391
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
@@ -306,7 +306,7 @@
         expect(screen.queryByText('Sledují 3 lidé')).toBeNull();
     });
 
-    it('shows the project a workshop is about, together with what has been committed in it', () => {
+    it('shows the project a workshop is about as a special material, together with what has been committed in it', async () => {
         repositoryProgressMocks.controller = {
             progress: {
                 // Keep the fields from the former response shape here to ensure the panel only presents commits.
@@ -333,6 +333,8 @@
 
         renderParticipantRoom(WORKSHOP_ABOUT_A_PROJECT);
 
+        await screen.findByRole('button', { name: 'Free členství. Otevřít možnosti členství' });
+
         expect(screen.getByText('hejny/promptbook')).not.toBeNull();
         expect(screen.getByText('Přidat panel repozitáře')).not.toBeNull();
         expect(screen.getByText('Nový')).not.toBeNull();
@@ -341,6 +343,10 @@
         );
 
         const repositoryPanel = screen.getByLabelText('Projekt workshopu');
+        const materialsSection = screen.getByRole('heading', { name: 'Materiály z workshopu' }).closest('section');
+
+        expect(materialsSection?.contains(repositoryPanel)).toBe(true);
+        expect(repositoryPanel.tagName).toBe('ARTICLE');
         expect(repositoryPanel.textContent).not.toContain('A/B testing landing page for Promptbook');
         expect(repositoryPanel.textContent).not.toContain('Od začátku workshopu');
         expect(repositoryPanel.textContent).not.toContain('main');
@@ -348,6 +354,23 @@
         expect(within(repositoryPanel).queryByText('1')).toBeNull();
     });
 
+    it('keeps the repository material available to a paying participant', async () => {
+        fetchCommunityMembership.mockResolvedValue({
+            status: 'active',
+            monthlyPriceCzk: 199,
+            currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
+            isCancellationScheduled: false,
+            isPurchaseOffered: false,
+            isSubscriptionManagementOffered: true,
+            isCoveredByDiscountCode: false,
+            isPaymentInTestMode: false,
+        });
+        renderParticipantRoom(WORKSHOP_ABOUT_A_PROJECT);
+
+        await screen.findByRole('button', { name: 'Placené členství. Otevřít stav členství' });
+        expect(screen.getByLabelText('Projekt workshopu')).not.toBeNull();
+    });
+
     it('shows nothing about a project in a room which is about none, and in a room which cannot be about one', () => {
         renderParticipantRoom(WORKSHOP);
         expect(screen.queryByLabelText('Projekt workshopu')).toBeNull();
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
index 82bd5e1d0309dc4a7351be84301f542c2b40077c..ce280dcb7b86b63fc94b361a322ee9e3b444c088
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
@@ -229,14 +229,30 @@
     const isWorkshopPollVisible = isWorkshopPollVisibleInRoom(state.workshop.kind);
     const isModerating = isWorkshopParticipantModerating(state.participant);
     const followUpContentBlock = state.contentBlocks.find((contentBlock) => contentBlock.isFollowUp) ?? null;
-    const specialMaterials = roomCapabilities.isCommunityInvitationOffered
-        ? [
-              {
-                  id: 'community',
-                  content: <CommunityRoomInvitation participantIdentity={state.participant} />,
-              },
-          ]
-        : [];
+    const connectedRepository = roomCapabilities.isRepositoryOffered ? state.workshop.repository : null;
+    const specialMaterials = [
+        ...(connectedRepository === null
+            ? []
+            : [
+                  {
+                      id: 'repository',
+                      content: (
+                          <WorkshopRepositoryPanel
+                              repository={connectedRepository}
+                              progressController={repositoryProgressController}
+                          />
+                      ),
+                  },
+              ]),
+        ...(roomCapabilities.isCommunityInvitationOffered
+            ? [
+                  {
+                      id: 'community',
+                      content: <CommunityRoomInvitation participantIdentity={state.participant} />,
+                  },
+              ]
+            : []),
+    ];
 
     // Note: What the kind of this room has and what an administrator switched off is asked here once, so a new panel
     //       is one line of the room.
@@ -321,16 +337,6 @@
                             stageComment={state.stageComment}
                             paidMembersOnlyVideo={state.paidMembersOnlyVideo}
                             onSaveFeedback={controller.saveFeedback}
-                        />
-                    )}
-                    {/*
-                      * Note: A term is about a project only while its administration connected one, so a room which is
-                      *       about no project shows nothing about one rather than an empty panel.
-                      */}
-                    {roomCapabilities.isRepositoryOffered && state.workshop.repository !== null && (
-                        <WorkshopRepositoryPanel
-                            repository={state.workshop.repository}
-                            progressController={repositoryProgressController}
                         />
                     )}
                     {calendarDetails !== null && (
diff --git a/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx b/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
index 96cc8e7f32180728917294223502e69edced4e6b..e2e141daebd05e3d20ca791f2013189bc91e884d
--- a/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
+++ b/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
@@ -49,18 +49,18 @@
         getGithubBranchSelectionPatterns(repository.branch).map((branchName) => ({ name: branchName, headSha: null }));
 
     return (
-        <section
+        <article
             aria-label="Projekt workshopu"
-            className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
+            className="relative scroll-mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
         >
             <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4">
                 <div className="min-w-0">
                     <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
                         <Github className="h-4 w-4" aria-hidden="true" /> Projekt workshopu
                     </p>
-                    <h2 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
+                    <h3 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
                         {repositoryName}
-                    </h2>
+                    </h3>
                 </div>
                 <div className="flex flex-wrap items-center gap-2">
                     {newCommitShas.size > 0 && (
@@ -137,6 +137,6 @@
                     </>
                 )}
             </div>
-        </section>
+        </article>
     );
 }
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 4ee8fbecc56c2657b616810871a480acd67dcd8f..1b9e0df7e45563956015e9d529126853c2a3e470
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,4 +1,9 @@
 # Current preversion
+- Moved a connected GitHub repository in `/cs/online-workshop/participant` into the materials list as a special
+  material. Its existing repository, deployment, and live-commit links now stay with ordinary workshop materials,
+  are visible even when no ordinary material has been unlocked, and remain available to both free and paid
+  participants without turning the repository into timed or membership-gated content.
+
 - Moved the community hand-off in `/cs/online-workshop/participant` into the materials list as a dedicated
   community material. It is shown even before an administrator has unlocked any ordinary material and remains
   available to free and paid members alike, while carrying the participant identity through the existing shared

diff --git a/AGENTS.md b/AGENTS.md
index 5490191d7ea270f1a59cd3bea90b4a35fec1264e..627be626bbdd1109da0ac266cfbb4edcc6781710
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -149,13 +149,14 @@
   `feature/*`, or `*` for all branches, plus an optional deployment URL — so it is
   set, changed, and unset at once and neither branch selection nor deployment
   outlives its repository. Room kinds which offer it are named in
-  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository, its
-  links, and the newest commits, marking those which arrive while a participant
-  watches; a newly found commit is broadcast to active rooms and appears on the
-  stage for ten seconds. A selection resolving to multiple branches is shown as a
-  commit graph. Commits come from the public commit feed or keyless API, pooled
-  once per server and cached through the revalidation window; an
-  unreadable feed still leaves the room naming its project.
+  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository as a
+  special material beside its ordinary materials for every participant, with its
+  links and newest commits, marking those which arrive while a participant watches;
+  a newly found commit is broadcast to active rooms and appears on the stage for
+  ten seconds. A selection resolving to multiple branches is shown as a commit
+  graph. Commits come from the public commit feed or keyless API, pooled once per
+  server and cached through the revalidation window; an unreadable feed still
+  leaves the room naming its project.
 - Paid-only materials are decided on the server in one pass. Members receive
   unlocked material; others receive only the published titles as an offer. An
   untitled item is not named, items are not named before their unlock time, and a
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
index c8df97e15ec5e8ee846737e95e33682a1303e23d..83f958689fc6061482e913342b05af6d7acb7391
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
@@ -306,7 +306,7 @@
         expect(screen.queryByText('Sledují 3 lidé')).toBeNull();
     });
 
-    it('shows the project a workshop is about, together with what has been committed in it', () => {
+    it('shows the project a workshop is about as a special material, together with what has been committed in it', async () => {
         repositoryProgressMocks.controller = {
             progress: {
                 // Keep the fields from the former response shape here to ensure the panel only presents commits.
@@ -333,6 +333,8 @@
 
         renderParticipantRoom(WORKSHOP_ABOUT_A_PROJECT);
 
+        await screen.findByRole('button', { name: 'Free členství. Otevřít možnosti členství' });
+
         expect(screen.getByText('hejny/promptbook')).not.toBeNull();
         expect(screen.getByText('Přidat panel repozitáře')).not.toBeNull();
         expect(screen.getByText('Nový')).not.toBeNull();
@@ -341,6 +343,10 @@
         );
 
         const repositoryPanel = screen.getByLabelText('Projekt workshopu');
+        const materialsSection = screen.getByRole('heading', { name: 'Materiály z workshopu' }).closest('section');
+
+        expect(materialsSection?.contains(repositoryPanel)).toBe(true);
+        expect(repositoryPanel.tagName).toBe('ARTICLE');
         expect(repositoryPanel.textContent).not.toContain('A/B testing landing page for Promptbook');
         expect(repositoryPanel.textContent).not.toContain('Od začátku workshopu');
         expect(repositoryPanel.textContent).not.toContain('main');
@@ -348,6 +354,23 @@
         expect(within(repositoryPanel).queryByText('1')).toBeNull();
     });
 
+    it('keeps the repository material available to a paying participant', async () => {
+        fetchCommunityMembership.mockResolvedValue({
+            status: 'active',
+            monthlyPriceCzk: 199,
+            currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
+            isCancellationScheduled: false,
+            isPurchaseOffered: false,
+            isSubscriptionManagementOffered: true,
+            isCoveredByDiscountCode: false,
+            isPaymentInTestMode: false,
+        });
+        renderParticipantRoom(WORKSHOP_ABOUT_A_PROJECT);
+
+        await screen.findByRole('button', { name: 'Placené členství. Otevřít stav členství' });
+        expect(screen.getByLabelText('Projekt workshopu')).not.toBeNull();
+    });
+
     it('shows nothing about a project in a room which is about none, and in a room which cannot be about one', () => {
         renderParticipantRoom(WORKSHOP);
         expect(screen.queryByLabelText('Projekt workshopu')).toBeNull();
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
index 82bd5e1d0309dc4a7351be84301f542c2b40077c..ce280dcb7b86b63fc94b361a322ee9e3b444c088
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
@@ -229,14 +229,30 @@
     const isWorkshopPollVisible = isWorkshopPollVisibleInRoom(state.workshop.kind);
     const isModerating = isWorkshopParticipantModerating(state.participant);
     const followUpContentBlock = state.contentBlocks.find((contentBlock) => contentBlock.isFollowUp) ?? null;
-    const specialMaterials = roomCapabilities.isCommunityInvitationOffered
-        ? [
-              {
-                  id: 'community',
-                  content: <CommunityRoomInvitation participantIdentity={state.participant} />,
-              },
-          ]
-        : [];
+    const connectedRepository = roomCapabilities.isRepositoryOffered ? state.workshop.repository : null;
+    const specialMaterials = [
+        ...(connectedRepository === null
+            ? []
+            : [
+                  {
+                      id: 'repository',
+                      content: (
+                          <WorkshopRepositoryPanel
+                              repository={connectedRepository}
+                              progressController={repositoryProgressController}
+                          />
+                      ),
+                  },
+              ]),
+        ...(roomCapabilities.isCommunityInvitationOffered
+            ? [
+                  {
+                      id: 'community',
+                      content: <CommunityRoomInvitation participantIdentity={state.participant} />,
+                  },
+              ]
+            : []),
+    ];
 
     // Note: What the kind of this room has and what an administrator switched off is asked here once, so a new panel
     //       is one line of the room.
@@ -321,16 +337,6 @@
                             stageComment={state.stageComment}
                             paidMembersOnlyVideo={state.paidMembersOnlyVideo}
                             onSaveFeedback={controller.saveFeedback}
-                        />
-                    )}
-                    {/*
-                      * Note: A term is about a project only while its administration connected one, so a room which is
-                      *       about no project shows nothing about one rather than an empty panel.
-                      */}
-                    {roomCapabilities.isRepositoryOffered && state.workshop.repository !== null && (
-                        <WorkshopRepositoryPanel
-                            repository={state.workshop.repository}
-                            progressController={repositoryProgressController}
                         />
                     )}
                     {calendarDetails !== null && (
diff --git a/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx b/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
index 96cc8e7f32180728917294223502e69edced4e6b..e2e141daebd05e3d20ca791f2013189bc91e884d
--- a/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
+++ b/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
@@ -49,18 +49,18 @@
         getGithubBranchSelectionPatterns(repository.branch).map((branchName) => ({ name: branchName, headSha: null }));
 
     return (
-        <section
+        <article
             aria-label="Projekt workshopu"
-            className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
+            className="relative scroll-mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
         >
             <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4">
                 <div className="min-w-0">
                     <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
                         <Github className="h-4 w-4" aria-hidden="true" /> Projekt workshopu
                     </p>
-                    <h2 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
+                    <h3 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
                         {repositoryName}
-                    </h2>
+                    </h3>
                 </div>
                 <div className="flex flex-wrap items-center gap-2">
                     {newCommitShas.size > 0 && (
@@ -137,6 +137,6 @@
                     </>
                 )}
             </div>
-        </section>
+        </article>
     );
 }
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 4ee8fbecc56c2657b616810871a480acd67dcd8f..1b9e0df7e45563956015e9d529126853c2a3e470
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,4 +1,9 @@
 # Current preversion
+- Moved a connected GitHub repository in `/cs/online-workshop/participant` into the materials list as a special
+  material. Its existing repository, deployment, and live-commit links now stay with ordinary workshop materials,
+  are visible even when no ordinary material has been unlocked, and remain available to both free and paid
+  participants without turning the repository into timed or membership-gated content.
+
 - Moved the community hand-off in `/cs/online-workshop/participant` into the materials list as a dedicated
   community material. It is shown even before an administrator has unlocked any ordinary material and remains
   available to free and paid members alike, while carrying the participant identity through the existing shared

exec
/bin/zsh -lc 'npm test' in /Users/hejny/work/aldaron
 succeeded in 11153ms:

 RUN  v3.2.4 /Users/hejny/work/aldaron

 ✓ businesses/online-workshop/participant/WorkshopParticipantBadge.test.tsx (12 tests) 195ms
 ✓ businesses/workshop-admin/WorkshopCommentModeration.test.tsx (7 tests) 270ms
 ✓ businesses/online-workshop/participant/WorkshopChat.test.tsx (14 tests) 361ms
 ✓ components/workshops/WorkshopLinksPanel.test.tsx (9 tests) 447ms
 ✓ businesses/online-workshop/participant/WorkshopStage.test.tsx (13 tests) 241ms
 ✓ components/shortener/ShortcodeLinkAdmin.test.tsx (3 tests) 622ms
   ✓ shortcode link administration > opens one click history and saves the history and list filters into the URL  371ms
 ✓ businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx (5 tests) 257ms
 ✓ businesses/workshop-admin/WorkshopOverviewChart.test.tsx (7 tests) 321ms
 ✓ businesses/workshop-admin/WorkshopSelectorCardList.test.tsx (9 tests) 336ms
 ✓ businesses/community/membership/CommunityMembershipBadge.test.tsx (5 tests) 301ms
 ✓ components/url-shortener.test.tsx (4 tests) 226ms
 ✓ businesses/online-workshop/participant/useWorkshopParticipant.test.tsx (5 tests) 258ms
 ✓ businesses/workshop-admin/WorkshopPollAdmin.test.tsx (8 tests) 459ms
 ✓ businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx (21 tests) 1126ms
 ✓ businesses/workshop-admin/WorkshopArtificialComment.test.tsx (2 tests) 122ms
 ✓ businesses/community/membership/CommunityMembershipRegistrationForm.test.tsx (2 tests) 113ms
 ✓ businesses/workshop-admin/CreateWorkshopForm.test.tsx (4 tests) 163ms
 ✓ businesses/community/membership/CommunityMembershipPage.test.tsx (2 tests) 232ms
 ✓ businesses/community/membership/CommunityMembershipModal.test.tsx (15 tests) 1985ms
   ✓ community membership modal > asks for no card at all when a code covers the whole membership for as long as it lasts  370ms
   ✓ community membership modal > keeps asking for a card when a code covers the membership for its first months only  358ms
   ✓ community membership modal > names no test card for a membership which never reaches the gate  351ms
   ✓ community membership modal > hands over the membership a voucher covers without sending the member anywhere  369ms
 ✓ components/footer.test.tsx (1 test) 133ms
 ✓ businesses/workshop-admin/WorkshopSettingsForm.test.tsx (19 tests) 708ms
 ✓ businesses/ai-supervize-mini/AiSupervizeMiniRegistrationForm.test.tsx (3 tests) 257ms
 ✓ businesses/online-workshop/participant/WorkshopFeedback.test.tsx (4 tests) 191ms
 ✓ businesses/online-workshop/participant/WorkshopReactions.test.tsx (2 tests) 140ms
 ✓ businesses/online-workshop/OnlineWorkshopRegistrationForm.test.tsx (3 tests) 119ms
 ✓ businesses/workshop-admin/WorkshopOverviewChartRangeControls.test.tsx (3 tests) 135ms
 ✓ components/admin/DiscountCodeForm.test.tsx (1 test) 128ms
 ✓ businesses/online-workshop/participant/WorkshopPolls.test.tsx (4 tests) 181ms
 ✓ businesses/online-workshop/participant/WorkshopCalendarInvitation.test.tsx (3 tests) 70ms
 ✓ businesses/workshop-admin/WorkshopEventLinks.test.tsx (5 tests) 128ms
 ✓ businesses/workshop-admin/WorkshopParticipantTimeline.test.tsx (2 tests) 214ms
 ✓ businesses/community/membership/CommunityMembershipActivitySection.test.tsx (4 tests) 218ms
 ✓ components/workshop-comment-markdown.test.tsx (3 tests) 76ms
 ✓ businesses/ai-ta-krajta/AiTaKrajtaPeopleSection.test.tsx (1 test) 71ms
 ✓ businesses/online-workshop/participant/WorkshopContent.test.tsx (13 tests) 230ms
 ✓ businesses/ai-ta-krajta/AiTaKrajtaEpisodeCard.test.tsx (6 tests) 144ms
 ✓ businesses/online-workshop/participant/WorkshopWatchingBadge.test.tsx (2 tests) 125ms
 ✓ businesses/community/CommunityParticipantPage.test.tsx (3 tests) 38ms
 ✓ components/workshops/WorkshopReactionStream.test.tsx (5 tests) 70ms
 ✓ businesses/workshop-admin/WorkshopRegistrationContacts.test.tsx (2 tests) 201ms
 ✓ businesses/ai-ta-krajta/useAiTaKrajtaOrderedPeople.test.tsx (3 tests) 47ms
 ✓ businesses/community/membership/CommunityMembershipLivePreview.test.tsx (3 tests) 92ms
 ✓ hooks/useUrlSynchronizedViewState.test.tsx (1 test) 35ms
 ✓ hooks/usePodcastPlaybackProgress.test.tsx (4 tests) 12ms
 ✓ lib/podcast/podcastPlaybackProgressStorage.test.ts (5 tests) 3ms
 ✓ businesses/online-workshop/participant/workshopParticipantStateCache.test.ts (5 tests) 3ms
 ✓ lib/youtube/youtubePlayerCommands.test.ts (5 tests) 4ms
 ✓ businesses/community/membership/CommunityMembershipWebinarArchive.test.tsx (3 tests) 89ms
 ✓ hooks/useSynchronizedHorizontalScroll.test.tsx (1 test) 26ms
 ✓ lib/database/backupDatabase.test.ts (12 tests) 77ms
 ✓ businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork.test.ts (3 tests) 60ms
 ✓ lib/e2e/inMemorySupabase.test.ts (1 test) 4ms
 ✓ lib/database/postgresCli.test.ts (1 test) 64ms
 ✓ lib/calendar/calendarMonth.test.ts (7 tests) 19ms
 ✓ businesses/ai-ta-krajta/aiTaKrajtaPeople.test.ts (52 tests) 563ms
 ✓ lib/workshops/workshopPollValues.test.ts (2 tests) 1ms
 ✓ businesses/ai-ta-krajta/aiTaKrajtaEpisodePeople.test.ts (16 tests) 11ms
 ✓ lib/events/eventListing.test.ts (6 tests) 26ms
 ✓ lib/workshops/workshopReactionAnimations.test.ts (13 tests) 11ms
 ✓ businesses/ai-ta-krajta/aiTaKrajtaPublicPlatformStatistics.test.ts (11 tests) 9ms
 ✓ businesses/ai-ta-krajta/aiTaKrajtaIcon.test.ts (5 tests) 16ms
 ✓ app/api/admin/workshops/route.test.ts (2 tests) 14ms
 ✓ lib/community-membership/communityMembershipRedemption.test.ts (5 tests) 3ms
 ✓ app/cs/komunita/calendar.ics/route.test.ts (4 tests) 20ms
 ✓ lib/workshops/workshopSchemas.test.ts (28 tests) 15ms
 ✓ businesses/ai-ta-krajta/aiTaKrajtaSnakeSimulation.test.ts (9 tests) 17ms
 ✓ lib/workshops/workshopReactionAnimationStyle.test.ts (7 tests) 22ms
stderr | app/api/contacts/export/[formatId]/route.test.ts > the export of the contacts served in a new tab > says that the contacts cannot be reached without the service role key
⚠️ The contacts cannot be reached, set SUPABASE_SERVICE_ROLE_KEY - the "Contact" table is closed by row level security

 ✓ app/api/contacts/export/[formatId]/route.test.ts (12 tests) 26ms
stderr | lib/contacts/contacts.test.ts > sortContacts > keeps a contact whose date cannot be read at the end in both directions
Deprecation warning: value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are discouraged. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.
Arguments: 
[0] _isAMomentObject: true, _isUTC: false, _useUTC: false, _l: undefined, _i: nobody knows when, _f: undefined, _strict: undefined, _locale: [object Object]
Error: 
    at hooks.createFromInputFallback (/Users/hejny/work/aldaron/node_modules/moment/moment.js:324:25)
    at configFromString (/Users/hejny/work/aldaron/node_modules/moment/moment.js:2613:19)
    at configFromInput (/Users/hejny/work/aldaron/node_modules/moment/moment.js:3056:13)
    at prepareConfig (/Users/hejny/work/aldaron/node_modules/moment/moment.js:3039:13)
    at createFromConfig (/Users/hejny/work/aldaron/node_modules/moment/moment.js:3006:44)
    at createLocalOrUTC (/Users/hejny/work/aldaron/node_modules/moment/moment.js:3100:16)
    at createLocal (/Users/hejny/work/aldaron/node_modules/moment/moment.js:3104:16)
    at hooks (/Users/hejny/work/aldaron/node_modules/moment/moment.js:16:29)
    at parseContactDate (/Users/hejny/work/aldaron/lib/contacts/contactDates.ts:57:25)
    at getContactSortValue (/Users/hejny/work/aldaron/lib/contacts/contactValues.ts:100:16)

 ✓ lib/contacts/contacts.test.ts (68 tests) 29ms
 ✓ app/api/admin/workshops/[workshopId]/participants/route.test.ts (3 tests) 8ms
 ✓ lib/database/migrateDatabase.test.ts (5 tests) 17ms
stderr | app/api/ai-supervize-mini/registration/route.test.ts > AI Supervize Mini registration endpoint > does not store a registration when its submitted discount cannot be verified
Failed to validate AI Supervize Mini registration discount code: Database not configured

 ✓ app/api/ai-supervize-mini/registration/route.test.ts (5 tests) 9ms
 ✓ businesses/online-workshop/participant/workshopWatchingCountLabel.test.ts (4 tests) 11ms
 ✓ app/api/admin/session/route.test.ts (7 tests) 13ms
 ✓ lib/discounts/discountCodeWildcardMigration.test.ts (1 test) 1ms
 ✓ lib/workshops/workshopMigration.test.ts (46 tests) 6ms
stderr | app/api/admin/shortener/[shortcodeLinkId]/route.test.ts > one admin shortcode link > reports a shortcode taken by another link as a conflict
⚠️ The database refused the editing of a short link: duplicate key value
   Error code: 23505

stderr | app/api/admin/shortener/[shortcodeLinkId]/route.test.ts > one admin shortcode link > says that a short link still referenced elsewhere could not be removed
⚠️ The database refused the deletion of a short link: violates foreign key constraint
   Error code: 23503

 ✓ app/api/admin/shortener/[shortcodeLinkId]/route.test.ts (10 tests) 21ms
 ✓ app/api/admin/workshops/[workshopId]/route.test.ts (4 tests) 9ms
 ✓ app/api/admin/workshops/[workshopId]/feedback/route.test.ts (2 tests) 7ms
stderr | app/api/admin/shortener/route.test.ts > admin shortcode link collection > reports an unavailable service-role database instead of falling back to the public client
⚠️ The short links cannot be written, set SUPABASE_SERVICE_ROLE_KEY - only the service role may write the "ShortcodeLink" table

stderr | app/api/admin/shortener/route.test.ts > admin shortcode link collection > allows an administrator to choose another preview when the shortcode already exists
⚠️ The database refused the creation of a short link: duplicate key value
   Error code: 23505

 ✓ lib/workshops/fetchWorkshopRepositoryProgress.test.ts (2 tests) 19ms
 ✓ app/api/admin/shortener/route.test.ts (7 tests) 15ms
 ✓ lib/admin/adminContactJoin.test.ts (4 tests) 7ms
stderr | app/api/waitlist/route.test.ts > gathering a contact from a public form > says that the contact was not saved when the service role key is missing
⚠️ The contacts cannot be reached, set SUPABASE_SERVICE_ROLE_KEY - the "Contact" table is closed by row level security

 ✓ app/api/waitlist/route.test.ts (12 tests) 16ms
 ✓ lib/workshops/workshopMaterialLinks.test.ts (9 tests) 8ms
 ✓ lib/github/githubCommitFeed.test.ts (3 tests) 17ms
 ✓ app/api/admin/community/memberships/route.test.ts (2 tests) 9ms
 ✓ app/api/community/membership/registration/route.test.ts (7 tests) 21ms
 ✓ lib/github/githubCommitApi.test.ts (3 tests) 42ms
 ✓ lib/workshops/workshopRepositoryProgress.test.ts (3 tests) 10ms
 ✓ app/api/ai-ta-krajta/episodes/search/route.test.ts (2 tests) 24ms
stderr | app/api/contacts/route.test.ts > contact mutations > says that the contacts cannot be reached when updating without the service role key
⚠️ The contacts cannot be reached, set SUPABASE_SERVICE_ROLE_KEY - the "Contact" table is closed by row level security

stderr | app/api/contacts/route.test.ts > contact mutations > says that the contacts cannot be reached when deleting without the service role key
⚠️ The contacts cannot be reached, set SUPABASE_SERVICE_ROLE_KEY - the "Contact" table is closed by row level security

 ✓ app/api/admin/workshops/[workshopId]/stage-comment/route.test.ts (3 tests) 11ms
 ✓ app/api/contacts/route.test.ts (9 tests) 13ms
 ✓ lib/workshops/workshopOverviewSeriesPoints.test.ts (16 tests) 35ms
stderr | lib/network/fetchCachedText.test.ts > fetchCachedText > gives the caller nothing when a publisher answers with an error
https://publisher.example/feed.xml answered with the status 503

stderr | lib/network/fetchCachedText.test.ts > fetchCachedText > gives the caller nothing when a publisher cannot be reached at all
https://publisher.example/feed.xml could not be read Error: ECONNREFUSED
    at /Users/hejny/work/aldaron/lib/network/fetchCachedText.test.ts:82:19
    at mockCall (file:///Users/hejny/work/aldaron/node_modules/@vitest/spy/dist/index.js:96:15)
    at spy (file:///Users/hejny/work/aldaron/node_modules/tinyspy/dist/index.js:47:80)
    at fetchCachedText (/Users/hejny/work/aldaron/lib/network/fetchCachedText.ts:49:32)
    at /Users/hejny/work/aldaron/lib/network/fetchCachedText.test.ts:85:22
    at file:///Users/hejny/work/aldaron/node_modules/@vitest/runner/dist/chunk-hooks.js:155:11
    at file:///Users/hejny/work/aldaron/node_modules/@vitest/runner/dist/chunk-hooks.js:752:26
    at file:///Users/hejny/work/aldaron/node_modules/@vitest/runner/dist/chunk-hooks.js:1897:20
    at new Promise (<anonymous>)
    at runWithTimeout (file:///Users/hejny/work/aldaron/node_modules/@vitest/runner/dist/chunk-hooks.js:1863:10)

stderr | lib/network/fetchCachedText.test.ts > fetchCachedText > gives the caller nothing when the bound cancels a publisher which stayed silent
https://publisher.example/feed.xml could not be read DOMException [TimeoutError]: The operation was aborted due to timeout
    at new DOMException (node:internal/per_context/domexception:76:18)
    at /Users/hejny/work/aldaron/lib/network/fetchCachedText.test.ts:90:19
    at mockCall (file:///Users/hejny/work/aldaron/node_modules/@vitest/spy/dist/index.js:96:15)
    at spy (file:///Users/hejny/work/aldaron/node_modules/tinyspy/dist/index.js:47:80)
    at fetchCachedText (/Users/hejny/work/aldaron/lib/network/fetchCachedText.ts:49:32)
    at /Users/hejny/work/aldaron/lib/network/fetchCachedText.test.ts:93:22
    at file:///Users/hejny/work/aldaron/node_modules/@vitest/runner/dist/chunk-hooks.js:155:11
    at file:///Users/hejny/work/aldaron/node_modules/@vitest/runner/dist/chunk-hooks.js:752:26
    at file:///Users/hejny/work/aldaron/node_modules/@vitest/runner/dist/chunk-hooks.js:1897:20
    at new Promise (<anonymous>)

 ✓ lib/network/fetchCachedText.test.ts (7 tests) 8ms
 ✓ lib/admin/adminApiGuard.test.ts (5 tests) 24ms
 ✓ businesses/workshop-admin/workshopCreateDraft.test.ts (7 tests) 6ms
 ✓ businesses/community/membership/communityMembershipPrice.test.ts (7 tests) 6ms
 ✓ app/api/admin/shortener/[shortcodeLinkId]/clicks/route.test.ts (3 tests) 9ms
 ✓ lib/calendar/create-calendar-links.test.ts (6 tests) 4ms
 ✓ lib/workshops/workshopValues.test.ts (11 tests) 4ms
 ✓ businesses/ai-ta-krajta/aiTaKrajtaMetadata.test.ts (3 tests) 3ms
 ✓ lib/workshops/workshopChatInteractivity.test.ts (4 tests) 4ms
 ✓ lib/workshops/workshopPollSharing.test.ts (5 tests) 7ms
 ✓ lib/api/api.test.ts (16 tests) 12ms
 ✓ app/api/workshops/[workshopSlug]/membership/cancellation/route.test.ts (6 tests) 14ms
 ✓ businesses/ai-ta-krajta/aiTaKrajtaSnakeBody.test.ts (5 tests) 6ms
 ✓ lib/community-membership/communityMembershipSubscription.test.ts (5 tests) 7ms
 ✓ lib/workshops/workshopRegistrations.test.ts (14 tests) 7ms
 ✓ app/api/workshops/[workshopSlug]/polls/[pollId]/votes/route.test.ts (3 tests) 9ms
 ✓ lib/workshops/workshopRequest.test.ts (3 tests) 4ms
 ✓ lib/workshops/workshopAdminViewState.test.ts (12 tests) 6ms
 ✓ businesses/ai-ta-krajta/aiTaKrajtaBrandAssets.test.ts (6 tests) 4ms
 ✓ lib/community-projects/communityProjectService.test.ts (10 tests) 9ms
 ✓ app/api/workshops/[workshopSlug]/membership/portal/route.test.ts (6 tests) 12ms
 ✓ lib/podcast/parsePodcastRssFeed.test.ts (12 tests) 5ms
 ✓ lib/podcast/mergePodcastEpisodes.test.ts (9 tests) 3ms
 ✓ lib/admin/adminSession.test.ts (10 tests) 5ms
 ✓ lib/api/createRequestSiteUrl.test.ts (2 tests) 1ms
 ✓ businesses/ai-ta-krajta/aiTaKrajtaInternalEpisodes.test.ts (19 tests) 2ms
 ✓ lib/workshops/workshopAdminExports.test.ts (7 tests) 3ms
 ✓ lib/admin/adminContactDatabase.test.ts (1 test) 3ms
 ✓ lib/workshops/workshopPhase.test.ts (9 tests) 4ms
 ✓ app/sitemap.test.ts (2 tests) 7ms
 ✓ lib/community-membership/communityMembershipAdminQuery.test.ts (3 tests) 1ms
 ✓ lib/workshops/workshopModeration.test.ts (6 tests) 2ms
 ✓ lib/workshops/workshopAdminParticipantQuery.test.ts (3 tests) 4ms
 ✓ lib/discounts/useDiscountCodeValidation.test.ts (5 tests) 1ms
 ✓ businesses/online-workshop/onlineWorkshopMetadata.test.ts (1 test) 3ms
 ✓ businesses/community/membership/communityMembershipMetadata.test.ts (3 tests) 3ms
 ✓ businesses/ai-ta-krajta/aiTaKrajtaSnakeLogoPose.test.ts (3 tests) 3ms
 ✓ lib/workshops/workshopOverviewRangeNavigation.test.ts (4 tests) 2ms
 ✓ lib/community-projects/communityProjectPreview.test.ts (3 tests) 2ms
 ✓ lib/discounts/discountCodeSchema.test.ts (5 tests) 5ms
 ✓ lib/workshops/workshopRepositoryMonitor.test.ts (2 tests) 9ms
 ✓ businesses/ai-ta-krajta/aiTaKrajtaEpisodeHosts.test.ts (4 tests) 3ms
 ✓ businesses/ai-ta-krajta/config.test.ts (1 test) 5ms
 ✓ lib/workshops/workshopRepositoryGraph.test.ts (2 tests) 3ms
 ✓ lib/community/communityPreviewValues.test.ts (10 tests) 4ms
 ✓ lib/community-membership/communityMembershipCheckout.test.ts (6 tests) 5ms
 ✓ lib/discounts/discountCodeDatabase.test.ts (1 test) 5ms
 ✓ lib/language/pageLanguage.test.ts (5 tests) 2ms
 ✓ lib/workshops/workshopCalendar.test.ts (7 tests) 3ms
 ✓ businesses/community/membership/communityMembershipCheckoutReturn.test.ts (4 tests) 2ms
 ✓ businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder.test.ts (7 tests) 6ms
 ✓ lib/workshops/workshopSession.test.ts (2 tests) 4ms
 ✓ lib/shortener/shortcodeLandingPageMetadata.test.ts (3 tests) 5ms
 ✓ lib/discounts/discountCode.test.ts (7 tests) 4ms
 ✓ lib/supabase/loadAllSupabaseRows.test.ts (3 tests) 5ms
 ✓ lib/exports/svgChartExport.test.ts (4 tests) 3ms
 ✓ lib/github/githubRepository.test.ts (11 tests) 5ms
 ✓ lib/workshops/workshopKindCapabilities.test.ts (13 tests) 5ms
 ✓ lib/payments/stripeConfiguration.test.ts (5 tests) 2ms
 ✓ lib/workshops/workshopPaidMembersContent.test.ts (5 tests) 2ms
 ✓ lib/community-membership/communityMembershipAdminMigration.test.ts (2 tests) 4ms
 ✓ lib/workshops/workshopRegistrationTiming.test.ts (3 tests) 3ms
 ✓ lib/workshops/workshopCommentThreads.test.ts (7 tests) 3ms
 ✓ lib/community-membership/communityMembershipRoomState.test.ts (9 tests) 2ms
 ✓ lib/youtube/youtubeChannelFeed.test.ts (9 tests) 2ms
 ✓ businesses/workshop-admin/workshopRepositoryDraft.test.ts (3 tests) 2ms
 ✓ lib/workshops/workshopPanels.test.ts (8 tests) 3ms
 ✓ lib/random/shuffleByWeight.test.ts (6 tests) 4ms
 ✓ lib/supabase/reportSupabaseError.test.ts (6 tests) 3ms
 ✓ lib/community-membership/communityMembershipAdminLinks.test.ts (3 tests) 3ms
 ✓ lib/contacts/serializeContactsAsBook.test.ts (1 test) 5ms
stderr | lib/workshops/workshopRepository.test.ts > the stored project of a workshop > is no project when what is stored names no repository, whatever else is stored beside it
Unknown GitHub repository "not a repository" was read from the database.

 ✓ lib/workshops/workshopRepository.test.ts (5 tests) 3ms
 ✓ businesses/ai-ta-krajta/aiTaKrajtaEpisodeTranscriptSearch.test.ts (2 tests) 2ms
 ✓ businesses/ai-supervize-mini/workshopRegistration.test.ts (5 tests) 11ms
 ✓ businesses/ai-ta-krajta/aiTaKrajtaAudienceStatistics.test.ts (3 tests) 2ms
 ✓ businesses/workshop-admin/workshopAdminSnapshot.test.ts (3 tests) 2ms
 ✓ lib/workshops/workshopActiveStatusQuery.test.ts (3 tests) 5ms
 ✓ lib/podcast/podcastPlaybackProgress.test.ts (17 tests) 2ms
 ✓ lib/workshops/workshopClientState.test.ts (8 tests) 5ms
 ✓ lib/workshops/workshopPaidMembersVideo.test.ts (7 tests) 2ms
 ✓ lib/metadata/create-page-metadata.test.ts (4 tests) 5ms
 ✓ businesses/ai-ta-krajta/aiTaKrajtaViewState.test.ts (7 tests) 19ms
 ✓ lib/youtube/youtube.test.ts (6 tests) 4ms
 ✓ lib/workshops/workshopAttendance.test.ts (6 tests) 4ms
 ✓ lib/payments/stripeAmount.test.ts (3 tests) 2ms
 ✓ businesses/ai-ta-krajta/aiTaKrajtaMediaKitContent.test.ts (4 tests) 3ms
 ✓ lib/discounts/discountPlaces.test.ts (3 tests) 1ms
 ✓ lib/workshops/workshopParticipantLink.test.ts (3 tests) 5ms
 ✓ lib/community-membership/communityMembershipStripeDashboard.test.ts (3 tests) 1ms
 ✓ lib/discounts/discountCodeAnyWildcardMigration.test.ts (1 test) 2ms
 ✓ lib/tracking/trackingExclusions.test.ts (3 tests) 1ms
 ✓ lib/community-membership/communityMembershipCancellationMigration.test.ts (1 test) 1ms
 ✓ lib/community-membership/communityMembershipStatus.test.ts (4 tests) 1ms
 ✓ lib/discounts/discountCodeSubscriptionDurationMigration.test.ts (1 test) 1ms

 Test Files  187 passed (187)
      Tests  1211 passed (1211)
   Start at  17:17:47
   Duration  10.61s (transform 5.98s, setup 0ms, collect 24.30s, tests 13.71s, environment 14.20s, prepare 9.16s)


diff --git a/AGENTS.md b/AGENTS.md
index 5490191d7ea270f1a59cd3bea90b4a35fec1264e..627be626bbdd1109da0ac266cfbb4edcc6781710
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -149,13 +149,14 @@
   `feature/*`, or `*` for all branches, plus an optional deployment URL — so it is
   set, changed, and unset at once and neither branch selection nor deployment
   outlives its repository. Room kinds which offer it are named in
-  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository, its
-  links, and the newest commits, marking those which arrive while a participant
-  watches; a newly found commit is broadcast to active rooms and appears on the
-  stage for ten seconds. A selection resolving to multiple branches is shown as a
-  commit graph. Commits come from the public commit feed or keyless API, pooled
-  once per server and cached through the revalidation window; an
-  unreadable feed still leaves the room naming its project.
+  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository as a
+  special material beside its ordinary materials for every participant, with its
+  links and newest commits, marking those which arrive while a participant watches;
+  a newly found commit is broadcast to active rooms and appears on the stage for
+  ten seconds. A selection resolving to multiple branches is shown as a commit
+  graph. Commits come from the public commit feed or keyless API, pooled once per
+  server and cached through the revalidation window; an unreadable feed still
+  leaves the room naming its project.
 - Paid-only materials are decided on the server in one pass. Members receive
   unlocked material; others receive only the published titles as an offer. An
   untitled item is not named, items are not named before their unlock time, and a
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
index c8df97e15ec5e8ee846737e95e33682a1303e23d..83f958689fc6061482e913342b05af6d7acb7391
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
@@ -306,7 +306,7 @@
         expect(screen.queryByText('Sledují 3 lidé')).toBeNull();
     });
 
-    it('shows the project a workshop is about, together with what has been committed in it', () => {
+    it('shows the project a workshop is about as a special material, together with what has been committed in it', async () => {
         repositoryProgressMocks.controller = {
             progress: {
                 // Keep the fields from the former response shape here to ensure the panel only presents commits.
@@ -333,6 +333,8 @@
 
         renderParticipantRoom(WORKSHOP_ABOUT_A_PROJECT);
 
+        await screen.findByRole('button', { name: 'Free členství. Otevřít možnosti členství' });
+
         expect(screen.getByText('hejny/promptbook')).not.toBeNull();
         expect(screen.getByText('Přidat panel repozitáře')).not.toBeNull();
         expect(screen.getByText('Nový')).not.toBeNull();
@@ -341,6 +343,10 @@
         );
 
         const repositoryPanel = screen.getByLabelText('Projekt workshopu');
+        const materialsSection = screen.getByRole('heading', { name: 'Materiály z workshopu' }).closest('section');
+
+        expect(materialsSection?.contains(repositoryPanel)).toBe(true);
+        expect(repositoryPanel.tagName).toBe('ARTICLE');
         expect(repositoryPanel.textContent).not.toContain('A/B testing landing page for Promptbook');
         expect(repositoryPanel.textContent).not.toContain('Od začátku workshopu');
         expect(repositoryPanel.textContent).not.toContain('main');
@@ -348,6 +354,23 @@
         expect(within(repositoryPanel).queryByText('1')).toBeNull();
     });
 
+    it('keeps the repository material available to a paying participant', async () => {
+        fetchCommunityMembership.mockResolvedValue({
+            status: 'active',
+            monthlyPriceCzk: 199,
+            currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
+            isCancellationScheduled: false,
+            isPurchaseOffered: false,
+            isSubscriptionManagementOffered: true,
+            isCoveredByDiscountCode: false,
+            isPaymentInTestMode: false,
+        });
+        renderParticipantRoom(WORKSHOP_ABOUT_A_PROJECT);
+
+        await screen.findByRole('button', { name: 'Placené členství. Otevřít stav členství' });
+        expect(screen.getByLabelText('Projekt workshopu')).not.toBeNull();
+    });
+
     it('shows nothing about a project in a room which is about none, and in a room which cannot be about one', () => {
         renderParticipantRoom(WORKSHOP);
         expect(screen.queryByLabelText('Projekt workshopu')).toBeNull();
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
index 82bd5e1d0309dc4a7351be84301f542c2b40077c..ce280dcb7b86b63fc94b361a322ee9e3b444c088
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
@@ -229,14 +229,30 @@
     const isWorkshopPollVisible = isWorkshopPollVisibleInRoom(state.workshop.kind);
     const isModerating = isWorkshopParticipantModerating(state.participant);
     const followUpContentBlock = state.contentBlocks.find((contentBlock) => contentBlock.isFollowUp) ?? null;
-    const specialMaterials = roomCapabilities.isCommunityInvitationOffered
-        ? [
-              {
-                  id: 'community',
-                  content: <CommunityRoomInvitation participantIdentity={state.participant} />,
-              },
-          ]
-        : [];
+    const connectedRepository = roomCapabilities.isRepositoryOffered ? state.workshop.repository : null;
+    const specialMaterials = [
+        ...(connectedRepository === null
+            ? []
+            : [
+                  {
+                      id: 'repository',
+                      content: (
+                          <WorkshopRepositoryPanel
+                              repository={connectedRepository}
+                              progressController={repositoryProgressController}
+                          />
+                      ),
+                  },
+              ]),
+        ...(roomCapabilities.isCommunityInvitationOffered
+            ? [
+                  {
+                      id: 'community',
+                      content: <CommunityRoomInvitation participantIdentity={state.participant} />,
+                  },
+              ]
+            : []),
+    ];
 
     // Note: What the kind of this room has and what an administrator switched off is asked here once, so a new panel
     //       is one line of the room.
@@ -321,16 +337,6 @@
                             stageComment={state.stageComment}
                             paidMembersOnlyVideo={state.paidMembersOnlyVideo}
                             onSaveFeedback={controller.saveFeedback}
-                        />
-                    )}
-                    {/*
-                      * Note: A term is about a project only while its administration connected one, so a room which is
-                      *       about no project shows nothing about one rather than an empty panel.
-                      */}
-                    {roomCapabilities.isRepositoryOffered && state.workshop.repository !== null && (
-                        <WorkshopRepositoryPanel
-                            repository={state.workshop.repository}
-                            progressController={repositoryProgressController}
                         />
                     )}
                     {calendarDetails !== null && (
diff --git a/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx b/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
index 96cc8e7f32180728917294223502e69edced4e6b..e2e141daebd05e3d20ca791f2013189bc91e884d
--- a/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
+++ b/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
@@ -49,18 +49,18 @@
         getGithubBranchSelectionPatterns(repository.branch).map((branchName) => ({ name: branchName, headSha: null }));
 
     return (
-        <section
+        <article
             aria-label="Projekt workshopu"
-            className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
+            className="relative scroll-mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
         >
             <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4">
                 <div className="min-w-0">
                     <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
                         <Github className="h-4 w-4" aria-hidden="true" /> Projekt workshopu
                     </p>
-                    <h2 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
+                    <h3 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
                         {repositoryName}
-                    </h2>
+                    </h3>
                 </div>
                 <div className="flex flex-wrap items-center gap-2">
                     {newCommitShas.size > 0 && (
@@ -137,6 +137,6 @@
                     </>
                 )}
             </div>
-        </section>
+        </article>
     );
 }
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 4ee8fbecc56c2657b616810871a480acd67dcd8f..1b9e0df7e45563956015e9d529126853c2a3e470
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,4 +1,9 @@
 # Current preversion
+- Moved a connected GitHub repository in `/cs/online-workshop/participant` into the materials list as a special
+  material. Its existing repository, deployment, and live-commit links now stay with ordinary workshop materials,
+  are visible even when no ordinary material has been unlocked, and remain available to both free and paid
+  participants without turning the repository into timed or membership-gated content.
+
 - Moved the community hand-off in `/cs/online-workshop/participant` into the materials list as a dedicated
   community material. It is shown even before an administrator has unlocked any ordinary material and remains
   available to free and paid members alike, while carrying the participant identity through the existing shared

codex
Verification is clean so far: the focused tests, the full Vitest suite, lint, and the production build/type check have all passed. I’m doing a final static type pass after the last small test refinement, then I’ll review the exact diff and leave the pre-existing prompt-file edit untouched.
exec
/bin/zsh -lc 'npx tsc' in /Users/hejny/work/aldaron
 succeeded in 2926ms:
diff --git a/AGENTS.md b/AGENTS.md
index 5490191d7ea270f1a59cd3bea90b4a35fec1264e..627be626bbdd1109da0ac266cfbb4edcc6781710
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -149,13 +149,14 @@
   `feature/*`, or `*` for all branches, plus an optional deployment URL — so it is
   set, changed, and unset at once and neither branch selection nor deployment
   outlives its repository. Room kinds which offer it are named in
-  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository, its
-  links, and the newest commits, marking those which arrive while a participant
-  watches; a newly found commit is broadcast to active rooms and appears on the
-  stage for ten seconds. A selection resolving to multiple branches is shown as a
-  commit graph. Commits come from the public commit feed or keyless API, pooled
-  once per server and cached through the revalidation window; an
-  unreadable feed still leaves the room naming its project.
+  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository as a
+  special material beside its ordinary materials for every participant, with its
+  links and newest commits, marking those which arrive while a participant watches;
+  a newly found commit is broadcast to active rooms and appears on the stage for
+  ten seconds. A selection resolving to multiple branches is shown as a commit
+  graph. Commits come from the public commit feed or keyless API, pooled once per
+  server and cached through the revalidation window; an unreadable feed still
+  leaves the room naming its project.
 - Paid-only materials are decided on the server in one pass. Members receive
   unlocked material; others receive only the published titles as an offer. An
   untitled item is not named, items are not named before their unlock time, and a
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
index c8df97e15ec5e8ee846737e95e33682a1303e23d..83f958689fc6061482e913342b05af6d7acb7391
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
@@ -306,7 +306,7 @@
         expect(screen.queryByText('Sledují 3 lidé')).toBeNull();
     });
 
-    it('shows the project a workshop is about, together with what has been committed in it', () => {
+    it('shows the project a workshop is about as a special material, together with what has been committed in it', async () => {
         repositoryProgressMocks.controller = {
             progress: {
                 // Keep the fields from the former response shape here to ensure the panel only presents commits.
@@ -333,6 +333,8 @@
 
         renderParticipantRoom(WORKSHOP_ABOUT_A_PROJECT);
 
+        await screen.findByRole('button', { name: 'Free členství. Otevřít možnosti členství' });
+
         expect(screen.getByText('hejny/promptbook')).not.toBeNull();
         expect(screen.getByText('Přidat panel repozitáře')).not.toBeNull();
         expect(screen.getByText('Nový')).not.toBeNull();
@@ -341,6 +343,10 @@
         );
 
         const repositoryPanel = screen.getByLabelText('Projekt workshopu');
+        const materialsSection = screen.getByRole('heading', { name: 'Materiály z workshopu' }).closest('section');
+
+        expect(materialsSection?.contains(repositoryPanel)).toBe(true);
+        expect(repositoryPanel.tagName).toBe('ARTICLE');
         expect(repositoryPanel.textContent).not.toContain('A/B testing landing page for Promptbook');
         expect(repositoryPanel.textContent).not.toContain('Od začátku workshopu');
         expect(repositoryPanel.textContent).not.toContain('main');
@@ -348,6 +354,23 @@
         expect(within(repositoryPanel).queryByText('1')).toBeNull();
     });
 
+    it('keeps the repository material available to a paying participant', async () => {
+        fetchCommunityMembership.mockResolvedValue({
+            status: 'active',
+            monthlyPriceCzk: 199,
+            currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
+            isCancellationScheduled: false,
+            isPurchaseOffered: false,
+            isSubscriptionManagementOffered: true,
+            isCoveredByDiscountCode: false,
+            isPaymentInTestMode: false,
+        });
+        renderParticipantRoom(WORKSHOP_ABOUT_A_PROJECT);
+
+        await screen.findByRole('button', { name: 'Placené členství. Otevřít stav členství' });
+        expect(screen.getByLabelText('Projekt workshopu')).not.toBeNull();
+    });
+
     it('shows nothing about a project in a room which is about none, and in a room which cannot be about one', () => {
         renderParticipantRoom(WORKSHOP);
         expect(screen.queryByLabelText('Projekt workshopu')).toBeNull();
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
index 82bd5e1d0309dc4a7351be84301f542c2b40077c..ce280dcb7b86b63fc94b361a322ee9e3b444c088
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
@@ -229,14 +229,30 @@
     const isWorkshopPollVisible = isWorkshopPollVisibleInRoom(state.workshop.kind);
     const isModerating = isWorkshopParticipantModerating(state.participant);
     const followUpContentBlock = state.contentBlocks.find((contentBlock) => contentBlock.isFollowUp) ?? null;
-    const specialMaterials = roomCapabilities.isCommunityInvitationOffered
-        ? [
-              {
-                  id: 'community',
-                  content: <CommunityRoomInvitation participantIdentity={state.participant} />,
-              },
-          ]
-        : [];
+    const connectedRepository = roomCapabilities.isRepositoryOffered ? state.workshop.repository : null;
+    const specialMaterials = [
+        ...(connectedRepository === null
+            ? []
+            : [
+                  {
+                      id: 'repository',
+                      content: (
+                          <WorkshopRepositoryPanel
+                              repository={connectedRepository}
+                              progressController={repositoryProgressController}
+                          />
+                      ),
+                  },
+              ]),
+        ...(roomCapabilities.isCommunityInvitationOffered
+            ? [
+                  {
+                      id: 'community',
+                      content: <CommunityRoomInvitation participantIdentity={state.participant} />,
+                  },
+              ]
+            : []),
+    ];
 
     // Note: What the kind of this room has and what an administrator switched off is asked here once, so a new panel
     //       is one line of the room.
@@ -321,16 +337,6 @@
                             stageComment={state.stageComment}
                             paidMembersOnlyVideo={state.paidMembersOnlyVideo}
                             onSaveFeedback={controller.saveFeedback}
-                        />
-                    )}
-                    {/*
-                      * Note: A term is about a project only while its administration connected one, so a room which is
-                      *       about no project shows nothing about one rather than an empty panel.
-                      */}
-                    {roomCapabilities.isRepositoryOffered && state.workshop.repository !== null && (
-                        <WorkshopRepositoryPanel
-                            repository={state.workshop.repository}
-                            progressController={repositoryProgressController}
                         />
                     )}
                     {calendarDetails !== null && (
diff --git a/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx b/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
index 96cc8e7f32180728917294223502e69edced4e6b..e2e141daebd05e3d20ca791f2013189bc91e884d
--- a/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
+++ b/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
@@ -49,18 +49,18 @@
         getGithubBranchSelectionPatterns(repository.branch).map((branchName) => ({ name: branchName, headSha: null }));
 
     return (
-        <section
+        <article
             aria-label="Projekt workshopu"
-            className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
+            className="relative scroll-mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
         >
             <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4">
                 <div className="min-w-0">
                     <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
                         <Github className="h-4 w-4" aria-hidden="true" /> Projekt workshopu
                     </p>
-                    <h2 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
+                    <h3 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
                         {repositoryName}
-                    </h2>
+                    </h3>
                 </div>
                 <div className="flex flex-wrap items-center gap-2">
                     {newCommitShas.size > 0 && (
@@ -137,6 +137,6 @@
                     </>
                 )}
             </div>
-        </section>
+        </article>
     );
 }
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 4ee8fbecc56c2657b616810871a480acd67dcd8f..1b9e0df7e45563956015e9d529126853c2a3e470
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,4 +1,9 @@
 # Current preversion
+- Moved a connected GitHub repository in `/cs/online-workshop/participant` into the materials list as a special
+  material. Its existing repository, deployment, and live-commit links now stay with ordinary workshop materials,
+  are visible even when no ordinary material has been unlocked, and remain available to both free and paid
+  participants without turning the repository into timed or membership-gated content.
+
 - Moved the community hand-off in `/cs/online-workshop/participant` into the materials list as a dedicated
   community material. It is shown even before an administrator has unlocked any ordinary material and remains
   available to free and paid members alike, while carrying the participant identity through the existing shared

exec
/bin/zsh -lc 'git diff --check -- AGENTS.md businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx changelog/_current-preversion.md
git diff --stat
git status --short
git diff --numstat -- AGENTS.md businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx changelog/_current-preversion.md' in /Users/hejny/work/aldaron
 succeeded in 0ms:
 AGENTS.md                                          | 15 ++++----
 .../OnlineWorkshopParticipantPage.test.tsx         | 25 ++++++++++++-
 .../participant/OnlineWorkshopParticipantPage.tsx  | 42 ++++++++++++----------
 .../participant/WorkshopRepositoryPanel.tsx        | 10 +++---
 changelog/_current-preversion.md                   |  5 +++
 .../2026-09-0100-repository-as-special-material.md |  3 +-
 6 files changed, 68 insertions(+), 32 deletions(-)
 M AGENTS.md
 M businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
 M businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
 M businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
 M changelog/_current-preversion.md
 M prompts/2026-09-0100-repository-as-special-material.md
8	7	AGENTS.md
24	1	businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
24	18	businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
5	5	businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
5	0	changelog/_current-preversion.md

diff --git a/AGENTS.md b/AGENTS.md
index 5490191d7ea270f1a59cd3bea90b4a35fec1264e..627be626bbdd1109da0ac266cfbb4edcc6781710
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -149,13 +149,14 @@
   `feature/*`, or `*` for all branches, plus an optional deployment URL — so it is
   set, changed, and unset at once and neither branch selection nor deployment
   outlives its repository. Room kinds which offer it are named in
-  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository, its
-  links, and the newest commits, marking those which arrive while a participant
-  watches; a newly found commit is broadcast to active rooms and appears on the
-  stage for ten seconds. A selection resolving to multiple branches is shown as a
-  commit graph. Commits come from the public commit feed or keyless API, pooled
-  once per server and cached through the revalidation window; an
-  unreadable feed still leaves the room naming its project.
+  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository as a
+  special material beside its ordinary materials for every participant, with its
+  links and newest commits, marking those which arrive while a participant watches;
+  a newly found commit is broadcast to active rooms and appears on the stage for
+  ten seconds. A selection resolving to multiple branches is shown as a commit
+  graph. Commits come from the public commit feed or keyless API, pooled once per
+  server and cached through the revalidation window; an unreadable feed still
+  leaves the room naming its project.
 - Paid-only materials are decided on the server in one pass. Members receive
   unlocked material; others receive only the published titles as an offer. An
   untitled item is not named, items are not named before their unlock time, and a
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
index c8df97e15ec5e8ee846737e95e33682a1303e23d..83f958689fc6061482e913342b05af6d7acb7391
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
@@ -306,7 +306,7 @@
         expect(screen.queryByText('Sledují 3 lidé')).toBeNull();
     });
 
-    it('shows the project a workshop is about, together with what has been committed in it', () => {
+    it('shows the project a workshop is about as a special material, together with what has been committed in it', async () => {
         repositoryProgressMocks.controller = {
             progress: {
                 // Keep the fields from the former response shape here to ensure the panel only presents commits.
@@ -333,6 +333,8 @@
 
         renderParticipantRoom(WORKSHOP_ABOUT_A_PROJECT);
 
+        await screen.findByRole('button', { name: 'Free členství. Otevřít možnosti členství' });
+
         expect(screen.getByText('hejny/promptbook')).not.toBeNull();
         expect(screen.getByText('Přidat panel repozitáře')).not.toBeNull();
         expect(screen.getByText('Nový')).not.toBeNull();
@@ -341,6 +343,10 @@
         );
 
         const repositoryPanel = screen.getByLabelText('Projekt workshopu');
+        const materialsSection = screen.getByRole('heading', { name: 'Materiály z workshopu' }).closest('section');
+
+        expect(materialsSection?.contains(repositoryPanel)).toBe(true);
+        expect(repositoryPanel.tagName).toBe('ARTICLE');
         expect(repositoryPanel.textContent).not.toContain('A/B testing landing page for Promptbook');
         expect(repositoryPanel.textContent).not.toContain('Od začátku workshopu');
         expect(repositoryPanel.textContent).not.toContain('main');
@@ -348,6 +354,23 @@
         expect(within(repositoryPanel).queryByText('1')).toBeNull();
     });
 
+    it('keeps the repository material available to a paying participant', async () => {
+        fetchCommunityMembership.mockResolvedValue({
+            status: 'active',
+            monthlyPriceCzk: 199,
+            currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
+            isCancellationScheduled: false,
+            isPurchaseOffered: false,
+            isSubscriptionManagementOffered: true,
+            isCoveredByDiscountCode: false,
+            isPaymentInTestMode: false,
+        });
+        renderParticipantRoom(WORKSHOP_ABOUT_A_PROJECT);
+
+        await screen.findByRole('button', { name: 'Placené členství. Otevřít stav členství' });
+        expect(screen.getByLabelText('Projekt workshopu')).not.toBeNull();
+    });
+
     it('shows nothing about a project in a room which is about none, and in a room which cannot be about one', () => {
         renderParticipantRoom(WORKSHOP);
         expect(screen.queryByLabelText('Projekt workshopu')).toBeNull();
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
index 82bd5e1d0309dc4a7351be84301f542c2b40077c..ce280dcb7b86b63fc94b361a322ee9e3b444c088
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
@@ -229,14 +229,30 @@
     const isWorkshopPollVisible = isWorkshopPollVisibleInRoom(state.workshop.kind);
     const isModerating = isWorkshopParticipantModerating(state.participant);
     const followUpContentBlock = state.contentBlocks.find((contentBlock) => contentBlock.isFollowUp) ?? null;
-    const specialMaterials = roomCapabilities.isCommunityInvitationOffered
-        ? [
-              {
-                  id: 'community',
-                  content: <CommunityRoomInvitation participantIdentity={state.participant} />,
-              },
-          ]
-        : [];
+    const connectedRepository = roomCapabilities.isRepositoryOffered ? state.workshop.repository : null;
+    const specialMaterials = [
+        ...(connectedRepository === null
+            ? []
+            : [
+                  {
+                      id: 'repository',
+                      content: (
+                          <WorkshopRepositoryPanel
+                              repository={connectedRepository}
+                              progressController={repositoryProgressController}
+                          />
+                      ),
+                  },
+              ]),
+        ...(roomCapabilities.isCommunityInvitationOffered
+            ? [
+                  {
+                      id: 'community',
+                      content: <CommunityRoomInvitation participantIdentity={state.participant} />,
+                  },
+              ]
+            : []),
+    ];
 
     // Note: What the kind of this room has and what an administrator switched off is asked here once, so a new panel
     //       is one line of the room.
@@ -321,16 +337,6 @@
                             stageComment={state.stageComment}
                             paidMembersOnlyVideo={state.paidMembersOnlyVideo}
                             onSaveFeedback={controller.saveFeedback}
-                        />
-                    )}
-                    {/*
-                      * Note: A term is about a project only while its administration connected one, so a room which is
-                      *       about no project shows nothing about one rather than an empty panel.
-                      */}
-                    {roomCapabilities.isRepositoryOffered && state.workshop.repository !== null && (
-                        <WorkshopRepositoryPanel
-                            repository={state.workshop.repository}
-                            progressController={repositoryProgressController}
                         />
                     )}
                     {calendarDetails !== null && (
diff --git a/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx b/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
index 96cc8e7f32180728917294223502e69edced4e6b..e2e141daebd05e3d20ca791f2013189bc91e884d
--- a/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
+++ b/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
@@ -49,18 +49,18 @@
         getGithubBranchSelectionPatterns(repository.branch).map((branchName) => ({ name: branchName, headSha: null }));
 
     return (
-        <section
+        <article
             aria-label="Projekt workshopu"
-            className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
+            className="relative scroll-mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
         >
             <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4">
                 <div className="min-w-0">
                     <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
                         <Github className="h-4 w-4" aria-hidden="true" /> Projekt workshopu
                     </p>
-                    <h2 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
+                    <h3 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
                         {repositoryName}
-                    </h2>
+                    </h3>
                 </div>
                 <div className="flex flex-wrap items-center gap-2">
                     {newCommitShas.size > 0 && (
@@ -137,6 +137,6 @@
                     </>
                 )}
             </div>
-        </section>
+        </article>
     );
 }
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 4ee8fbecc56c2657b616810871a480acd67dcd8f..1b9e0df7e45563956015e9d529126853c2a3e470
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,4 +1,9 @@
 # Current preversion
+- Moved a connected GitHub repository in `/cs/online-workshop/participant` into the materials list as a special
+  material. Its existing repository, deployment, and live-commit links now stay with ordinary workshop materials,
+  are visible even when no ordinary material has been unlocked, and remain available to both free and paid
+  participants without turning the repository into timed or membership-gated content.
+
 - Moved the community hand-off in `/cs/online-workshop/participant` into the materials list as a dedicated
   community material. It is shown even before an administrator has unlocked any ordinary material and remains
   available to free and paid members alike, while carrying the participant identity through the existing shared

exec
/bin/zsh -lc "nl -ba businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx | sed -n '224,270p'
nl -ba businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx | sed -n '44,75p'
nl -ba businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx | sed -n '300,380p'
nl -ba changelog/_current-preversion.md | sed -n '1,12p'" in /Users/hejny/work/aldaron
 succeeded in 0ms:
   224	        );
   225	    }
   226	
   227	    const { state } = controller;
   228	    const roomCapabilities = getWorkshopKindCapabilities(state.workshop.kind);
   229	    const isWorkshopPollVisible = isWorkshopPollVisibleInRoom(state.workshop.kind);
   230	    const isModerating = isWorkshopParticipantModerating(state.participant);
   231	    const followUpContentBlock = state.contentBlocks.find((contentBlock) => contentBlock.isFollowUp) ?? null;
   232	    const connectedRepository = roomCapabilities.isRepositoryOffered ? state.workshop.repository : null;
   233	    const specialMaterials = [
   234	        ...(connectedRepository === null
   235	            ? []
   236	            : [
   237	                  {
   238	                      id: 'repository',
   239	                      content: (
   240	                          <WorkshopRepositoryPanel
   241	                              repository={connectedRepository}
   242	                              progressController={repositoryProgressController}
   243	                          />
   244	                      ),
   245	                  },
   246	              ]),
   247	        ...(roomCapabilities.isCommunityInvitationOffered
   248	            ? [
   249	                  {
   250	                      id: 'community',
   251	                      content: <CommunityRoomInvitation participantIdentity={state.participant} />,
   252	                  },
   253	              ]
   254	            : []),
   255	    ];
   256	
   257	    // Note: What the kind of this room has and what an administrator switched off is asked here once, so a new panel
   258	    //       is one line of the room.
   259	    const isPanelOffered = (panelKey: WorkshopPanelKey) =>
   260	        isWorkshopPanelOffered(state.workshop.kind, state.workshop.disabledPanels, panelKey);
   261	
   262	    const roomLayout = (
   263	        <div className="min-h-screen bg-[#06131b] text-slate-200">
   264	            <header className="border-b border-white/[0.07] bg-[#071820]/90 backdrop-blur">
   265	                <div className="mx-auto flex max-w-[1500px] flex-col items-stretch gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-8">
   266	                    <div className="flex min-w-0 flex-1 items-center gap-3">
   267	                        <Image
   268	                            src="/logo/promptbook-logo-blue-white-256.png"
   269	                            alt="Promptbook"
   270	                            width={36}
    44	    const { progress, isProgressRead, newCommitShas } = progressController;
    45	    const repositoryName = formatGithubRepositoryName(repository);
    46	    const isMultipleBranchSelection = isGithubMultipleBranchesSelection(repository.branch);
    47	    const graphBranches: readonly WorkshopRepositoryBranch[] =
    48	        progress?.branches ??
    49	        getGithubBranchSelectionPatterns(repository.branch).map((branchName) => ({ name: branchName, headSha: null }));
    50	
    51	    return (
    52	        <article
    53	            aria-label="Projekt workshopu"
    54	            className="relative scroll-mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
    55	        >
    56	            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4">
    57	                <div className="min-w-0">
    58	                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
    59	                        <Github className="h-4 w-4" aria-hidden="true" /> Projekt workshopu
    60	                    </p>
    61	                    <h3 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
    62	                        {repositoryName}
    63	                    </h3>
    64	                </div>
    65	                <div className="flex flex-wrap items-center gap-2">
    66	                    {newCommitShas.size > 0 && (
    67	                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-amber-300/10 px-2.5 py-1 text-xs font-bold text-amber-200">
    68	                            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-300" aria-hidden="true" />
    69	                            {formatNewCommitCount(newCommitShas.size)}
    70	                        </span>
    71	                    )}
    72	                    <a
    73	                        href={createGithubRepositoryUrl(repository)}
    74	                        target="_blank"
    75	                        rel="noopener noreferrer"
   300	
   301	    it('leaves a permanent room without the stage, the reactions, and the watching count of a live occurrence', () => {
   302	        const { container } = renderParticipantRoom(COMMUNITY);
   303	
   304	        expect(container.querySelector('iframe')).toBeNull();
   305	        expect(screen.queryByRole('button', { name: /Reagovat/ })).toBeNull();
   306	        expect(screen.queryByText('Sledují 3 lidé')).toBeNull();
   307	    });
   308	
   309	    it('shows the project a workshop is about as a special material, together with what has been committed in it', async () => {
   310	        repositoryProgressMocks.controller = {
   311	            progress: {
   312	                // Keep the fields from the former response shape here to ensure the panel only presents commits.
   313	                details: {
   314	                    description: 'A/B testing landing page for Promptbook',
   315	                    defaultBranch: 'main',
   316	                    primaryLanguage: 'TypeScript',
   317	                    starCount: 1,
   318	                },
   319	                commits: [
   320	                    {
   321	                        sha: '6dcb09b5b57875f334f61aebed695e2e4193db5e',
   322	                        message: 'Přidat panel repozitáře',
   323	                        authorName: 'Pavol Hejný',
   324	                        committedAt: '2026-08-21T19:25:00+02:00',
   325	                    },
   326	                ],
   327	                commitCountSinceStart: 2,
   328	                isCommitCountSinceStartComplete: true,
   329	            },
   330	            isProgressRead: true,
   331	            newCommitShas: new Set(['6dcb09b5b57875f334f61aebed695e2e4193db5e']),
   332	        };
   333	
   334	        renderParticipantRoom(WORKSHOP_ABOUT_A_PROJECT);
   335	
   336	        await screen.findByRole('button', { name: 'Free členství. Otevřít možnosti členství' });
   337	
   338	        expect(screen.getByText('hejny/promptbook')).not.toBeNull();
   339	        expect(screen.getByText('Přidat panel repozitáře')).not.toBeNull();
   340	        expect(screen.getByText('Nový')).not.toBeNull();
   341	        expect(screen.getByRole('link', { name: /Živá aplikace/ }).getAttribute('href')).toBe(
   342	            'https://workshop.example/app',
   343	        );
   344	
   345	        const repositoryPanel = screen.getByLabelText('Projekt workshopu');
   346	        const materialsSection = screen.getByRole('heading', { name: 'Materiály z workshopu' }).closest('section');
   347	
   348	        expect(materialsSection?.contains(repositoryPanel)).toBe(true);
   349	        expect(repositoryPanel.tagName).toBe('ARTICLE');
   350	        expect(repositoryPanel.textContent).not.toContain('A/B testing landing page for Promptbook');
   351	        expect(repositoryPanel.textContent).not.toContain('Od začátku workshopu');
   352	        expect(repositoryPanel.textContent).not.toContain('main');
   353	        expect(repositoryPanel.textContent).not.toContain('TypeScript');
   354	        expect(within(repositoryPanel).queryByText('1')).toBeNull();
   355	    });
   356	
   357	    it('keeps the repository material available to a paying participant', async () => {
   358	        fetchCommunityMembership.mockResolvedValue({
   359	            status: 'active',
   360	            monthlyPriceCzk: 199,
   361	            currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
   362	            isCancellationScheduled: false,
   363	            isPurchaseOffered: false,
   364	            isSubscriptionManagementOffered: true,
   365	            isCoveredByDiscountCode: false,
   366	            isPaymentInTestMode: false,
   367	        });
   368	        renderParticipantRoom(WORKSHOP_ABOUT_A_PROJECT);
   369	
   370	        await screen.findByRole('button', { name: 'Placené členství. Otevřít stav členství' });
   371	        expect(screen.getByLabelText('Projekt workshopu')).not.toBeNull();
   372	    });
   373	
   374	    it('shows nothing about a project in a room which is about none, and in a room which cannot be about one', () => {
   375	        renderParticipantRoom(WORKSHOP);
   376	        expect(screen.queryByLabelText('Projekt workshopu')).toBeNull();
   377	
   378	        cleanup();
   379	
   380	        renderParticipantRoom({ ...COMMUNITY, repository: WORKSHOP_ABOUT_A_PROJECT.repository });
     1	# Current preversion
     2	- Moved a connected GitHub repository in `/cs/online-workshop/participant` into the materials list as a special
     3	  material. Its existing repository, deployment, and live-commit links now stay with ordinary workshop materials,
     4	  are visible even when no ordinary material has been unlocked, and remain available to both free and paid
     5	  participants without turning the repository into timed or membership-gated content.
     6	
     7	- Moved the community hand-off in `/cs/online-workshop/participant` into the materials list as a dedicated
     8	  community material. It is shown even before an administrator has unlocked any ordinary material and remains
     9	  available to free and paid members alike, while carrying the participant identity through the existing shared
    10	  community link. The material list now has one reusable special-material slot for room features that belong beside
    11	  ordinary materials without becoming timed or membership-gated workshop content.
    12	

diff --git a/AGENTS.md b/AGENTS.md
index 5490191d7ea270f1a59cd3bea90b4a35fec1264e..627be626bbdd1109da0ac266cfbb4edcc6781710
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -149,13 +149,14 @@
   `feature/*`, or `*` for all branches, plus an optional deployment URL — so it is
   set, changed, and unset at once and neither branch selection nor deployment
   outlives its repository. Room kinds which offer it are named in
-  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository, its
-  links, and the newest commits, marking those which arrive while a participant
-  watches; a newly found commit is broadcast to active rooms and appears on the
-  stage for ten seconds. A selection resolving to multiple branches is shown as a
-  commit graph. Commits come from the public commit feed or keyless API, pooled
-  once per server and cached through the revalidation window; an
-  unreadable feed still leaves the room naming its project.
+  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository as a
+  special material beside its ordinary materials for every participant, with its
+  links and newest commits, marking those which arrive while a participant watches;
+  a newly found commit is broadcast to active rooms and appears on the stage for
+  ten seconds. A selection resolving to multiple branches is shown as a commit
+  graph. Commits come from the public commit feed or keyless API, pooled once per
+  server and cached through the revalidation window; an unreadable feed still
+  leaves the room naming its project.
 - Paid-only materials are decided on the server in one pass. Members receive
   unlocked material; others receive only the published titles as an offer. An
   untitled item is not named, items are not named before their unlock time, and a
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
index c8df97e15ec5e8ee846737e95e33682a1303e23d..83f958689fc6061482e913342b05af6d7acb7391
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
@@ -306,7 +306,7 @@
         expect(screen.queryByText('Sledují 3 lidé')).toBeNull();
     });
 
-    it('shows the project a workshop is about, together with what has been committed in it', () => {
+    it('shows the project a workshop is about as a special material, together with what has been committed in it', async () => {
         repositoryProgressMocks.controller = {
             progress: {
                 // Keep the fields from the former response shape here to ensure the panel only presents commits.
@@ -333,6 +333,8 @@
 
         renderParticipantRoom(WORKSHOP_ABOUT_A_PROJECT);
 
+        await screen.findByRole('button', { name: 'Free členství. Otevřít možnosti členství' });
+
         expect(screen.getByText('hejny/promptbook')).not.toBeNull();
         expect(screen.getByText('Přidat panel repozitáře')).not.toBeNull();
         expect(screen.getByText('Nový')).not.toBeNull();
@@ -341,6 +343,10 @@
         );
 
         const repositoryPanel = screen.getByLabelText('Projekt workshopu');
+        const materialsSection = screen.getByRole('heading', { name: 'Materiály z workshopu' }).closest('section');
+
+        expect(materialsSection?.contains(repositoryPanel)).toBe(true);
+        expect(repositoryPanel.tagName).toBe('ARTICLE');
         expect(repositoryPanel.textContent).not.toContain('A/B testing landing page for Promptbook');
         expect(repositoryPanel.textContent).not.toContain('Od začátku workshopu');
         expect(repositoryPanel.textContent).not.toContain('main');
@@ -348,6 +354,23 @@
         expect(within(repositoryPanel).queryByText('1')).toBeNull();
     });
 
+    it('keeps the repository material available to a paying participant', async () => {
+        fetchCommunityMembership.mockResolvedValue({
+            status: 'active',
+            monthlyPriceCzk: 199,
+            currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
+            isCancellationScheduled: false,
+            isPurchaseOffered: false,
+            isSubscriptionManagementOffered: true,
+            isCoveredByDiscountCode: false,
+            isPaymentInTestMode: false,
+        });
+        renderParticipantRoom(WORKSHOP_ABOUT_A_PROJECT);
+
+        await screen.findByRole('button', { name: 'Placené členství. Otevřít stav členství' });
+        expect(screen.getByLabelText('Projekt workshopu')).not.toBeNull();
+    });
+
     it('shows nothing about a project in a room which is about none, and in a room which cannot be about one', () => {
         renderParticipantRoom(WORKSHOP);
         expect(screen.queryByLabelText('Projekt workshopu')).toBeNull();
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
index 82bd5e1d0309dc4a7351be84301f542c2b40077c..ce280dcb7b86b63fc94b361a322ee9e3b444c088
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
@@ -229,14 +229,30 @@
     const isWorkshopPollVisible = isWorkshopPollVisibleInRoom(state.workshop.kind);
     const isModerating = isWorkshopParticipantModerating(state.participant);
     const followUpContentBlock = state.contentBlocks.find((contentBlock) => contentBlock.isFollowUp) ?? null;
-    const specialMaterials = roomCapabilities.isCommunityInvitationOffered
-        ? [
-              {
-                  id: 'community',
-                  content: <CommunityRoomInvitation participantIdentity={state.participant} />,
-              },
-          ]
-        : [];
+    const connectedRepository = roomCapabilities.isRepositoryOffered ? state.workshop.repository : null;
+    const specialMaterials = [
+        ...(connectedRepository === null
+            ? []
+            : [
+                  {
+                      id: 'repository',
+                      content: (
+                          <WorkshopRepositoryPanel
+                              repository={connectedRepository}
+                              progressController={repositoryProgressController}
+                          />
+                      ),
+                  },
+              ]),
+        ...(roomCapabilities.isCommunityInvitationOffered
+            ? [
+                  {
+                      id: 'community',
+                      content: <CommunityRoomInvitation participantIdentity={state.participant} />,
+                  },
+              ]
+            : []),
+    ];
 
     // Note: What the kind of this room has and what an administrator switched off is asked here once, so a new panel
     //       is one line of the room.
@@ -321,16 +337,6 @@
                             stageComment={state.stageComment}
                             paidMembersOnlyVideo={state.paidMembersOnlyVideo}
                             onSaveFeedback={controller.saveFeedback}
-                        />
-                    )}
-                    {/*
-                      * Note: A term is about a project only while its administration connected one, so a room which is
-                      *       about no project shows nothing about one rather than an empty panel.
-                      */}
-                    {roomCapabilities.isRepositoryOffered && state.workshop.repository !== null && (
-                        <WorkshopRepositoryPanel
-                            repository={state.workshop.repository}
-                            progressController={repositoryProgressController}
                         />
                     )}
                     {calendarDetails !== null && (
diff --git a/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx b/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
index 96cc8e7f32180728917294223502e69edced4e6b..e2e141daebd05e3d20ca791f2013189bc91e884d
--- a/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
+++ b/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
@@ -49,18 +49,18 @@
         getGithubBranchSelectionPatterns(repository.branch).map((branchName) => ({ name: branchName, headSha: null }));
 
     return (
-        <section
+        <article
             aria-label="Projekt workshopu"
-            className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
+            className="relative scroll-mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
         >
             <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4">
                 <div className="min-w-0">
                     <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
                         <Github className="h-4 w-4" aria-hidden="true" /> Projekt workshopu
                     </p>
-                    <h2 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
+                    <h3 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
                         {repositoryName}
-                    </h2>
+                    </h3>
                 </div>
                 <div className="flex flex-wrap items-center gap-2">
                     {newCommitShas.size > 0 && (
@@ -137,6 +137,6 @@
                     </>
                 )}
             </div>
-        </section>
+        </article>
     );
 }
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 4ee8fbecc56c2657b616810871a480acd67dcd8f..1b9e0df7e45563956015e9d529126853c2a3e470
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,4 +1,9 @@
 # Current preversion
+- Moved a connected GitHub repository in `/cs/online-workshop/participant` into the materials list as a special
+  material. Its existing repository, deployment, and live-commit links now stay with ordinary workshop materials,
+  are visible even when no ordinary material has been unlocked, and remain available to both free and paid
+  participants without turning the repository into timed or membership-gated content.
+
 - Moved the community hand-off in `/cs/online-workshop/participant` into the materials list as a dedicated
   community material. It is shown even before an administrator has unlocked any ordinary material and remains
   available to free and paid members alike, while carrying the participant identity through the existing shared

codex
Implemented the repository as an always-available special material in the participant room.

- Reused the existing `specialMaterials` flow, so repository links and live commits now appear inside “Materiály z workshopu” for free and paid participants: [OnlineWorkshopParticipantPage.tsx](/Users/hejny/work/aldaron/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx:232).
- Kept the existing repository panel behavior, adapting it to a material-card semantic: [WorkshopRepositoryPanel.tsx](/Users/hejny/work/aldaron/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx:52).
- Added free/paid placement coverage and updated [the changelog](/Users/hejny/work/aldaron/changelog/_current-preversion.md:1).

Verified with `npm test` (1,211 tests), `npm run lint`, `npm run test-types`, and `npx tsc`.
diff --git a/AGENTS.md b/AGENTS.md
index 5490191d7ea270f1a59cd3bea90b4a35fec1264e..627be626bbdd1109da0ac266cfbb4edcc6781710
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -149,13 +149,14 @@
   `feature/*`, or `*` for all branches, plus an optional deployment URL — so it is
   set, changed, and unset at once and neither branch selection nor deployment
   outlives its repository. Room kinds which offer it are named in
-  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository, its
-  links, and the newest commits, marking those which arrive while a participant
-  watches; a newly found commit is broadcast to active rooms and appears on the
-  stage for ten seconds. A selection resolving to multiple branches is shown as a
-  commit graph. Commits come from the public commit feed or keyless API, pooled
-  once per server and cached through the revalidation window; an
-  unreadable feed still leaves the room naming its project.
+  `lib/workshops/workshopKindCapabilities.ts`. The room shows the repository as a
+  special material beside its ordinary materials for every participant, with its
+  links and newest commits, marking those which arrive while a participant watches;
+  a newly found commit is broadcast to active rooms and appears on the stage for
+  ten seconds. A selection resolving to multiple branches is shown as a commit
+  graph. Commits come from the public commit feed or keyless API, pooled once per
+  server and cached through the revalidation window; an unreadable feed still
+  leaves the room naming its project.
 - Paid-only materials are decided on the server in one pass. Members receive
   unlocked material; others receive only the published titles as an offer. An
   untitled item is not named, items are not named before their unlock time, and a
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
index c8df97e15ec5e8ee846737e95e33682a1303e23d..83f958689fc6061482e913342b05af6d7acb7391
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
@@ -306,7 +306,7 @@
         expect(screen.queryByText('Sledují 3 lidé')).toBeNull();
     });
 
-    it('shows the project a workshop is about, together with what has been committed in it', () => {
+    it('shows the project a workshop is about as a special material, together with what has been committed in it', async () => {
         repositoryProgressMocks.controller = {
             progress: {
                 // Keep the fields from the former response shape here to ensure the panel only presents commits.
@@ -333,6 +333,8 @@
 
         renderParticipantRoom(WORKSHOP_ABOUT_A_PROJECT);
 
+        await screen.findByRole('button', { name: 'Free členství. Otevřít možnosti členství' });
+
         expect(screen.getByText('hejny/promptbook')).not.toBeNull();
         expect(screen.getByText('Přidat panel repozitáře')).not.toBeNull();
         expect(screen.getByText('Nový')).not.toBeNull();
@@ -341,6 +343,10 @@
         );
 
         const repositoryPanel = screen.getByLabelText('Projekt workshopu');
+        const materialsSection = screen.getByRole('heading', { name: 'Materiály z workshopu' }).closest('section');
+
+        expect(materialsSection?.contains(repositoryPanel)).toBe(true);
+        expect(repositoryPanel.tagName).toBe('ARTICLE');
         expect(repositoryPanel.textContent).not.toContain('A/B testing landing page for Promptbook');
         expect(repositoryPanel.textContent).not.toContain('Od začátku workshopu');
         expect(repositoryPanel.textContent).not.toContain('main');
@@ -348,6 +354,23 @@
         expect(within(repositoryPanel).queryByText('1')).toBeNull();
     });
 
+    it('keeps the repository material available to a paying participant', async () => {
+        fetchCommunityMembership.mockResolvedValue({
+            status: 'active',
+            monthlyPriceCzk: 199,
+            currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
+            isCancellationScheduled: false,
+            isPurchaseOffered: false,
+            isSubscriptionManagementOffered: true,
+            isCoveredByDiscountCode: false,
+            isPaymentInTestMode: false,
+        });
+        renderParticipantRoom(WORKSHOP_ABOUT_A_PROJECT);
+
+        await screen.findByRole('button', { name: 'Placené členství. Otevřít stav členství' });
+        expect(screen.getByLabelText('Projekt workshopu')).not.toBeNull();
+    });
+
     it('shows nothing about a project in a room which is about none, and in a room which cannot be about one', () => {
         renderParticipantRoom(WORKSHOP);
         expect(screen.queryByLabelText('Projekt workshopu')).toBeNull();
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
index 82bd5e1d0309dc4a7351be84301f542c2b40077c..ce280dcb7b86b63fc94b361a322ee9e3b444c088
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
@@ -229,14 +229,30 @@
     const isWorkshopPollVisible = isWorkshopPollVisibleInRoom(state.workshop.kind);
     const isModerating = isWorkshopParticipantModerating(state.participant);
     const followUpContentBlock = state.contentBlocks.find((contentBlock) => contentBlock.isFollowUp) ?? null;
-    const specialMaterials = roomCapabilities.isCommunityInvitationOffered
-        ? [
-              {
-                  id: 'community',
-                  content: <CommunityRoomInvitation participantIdentity={state.participant} />,
-              },
-          ]
-        : [];
+    const connectedRepository = roomCapabilities.isRepositoryOffered ? state.workshop.repository : null;
+    const specialMaterials = [
+        ...(connectedRepository === null
+            ? []
+            : [
+                  {
+                      id: 'repository',
+                      content: (
+                          <WorkshopRepositoryPanel
+                              repository={connectedRepository}
+                              progressController={repositoryProgressController}
+                          />
+                      ),
+                  },
+              ]),
+        ...(roomCapabilities.isCommunityInvitationOffered
+            ? [
+                  {
+                      id: 'community',
+                      content: <CommunityRoomInvitation participantIdentity={state.participant} />,
+                  },
+              ]
+            : []),
+    ];
 
     // Note: What the kind of this room has and what an administrator switched off is asked here once, so a new panel
     //       is one line of the room.
@@ -321,16 +337,6 @@
                             stageComment={state.stageComment}
                             paidMembersOnlyVideo={state.paidMembersOnlyVideo}
                             onSaveFeedback={controller.saveFeedback}
-                        />
-                    )}
-                    {/*
-                      * Note: A term is about a project only while its administration connected one, so a room which is
-                      *       about no project shows nothing about one rather than an empty panel.
-                      */}
-                    {roomCapabilities.isRepositoryOffered && state.workshop.repository !== null && (
-                        <WorkshopRepositoryPanel
-                            repository={state.workshop.repository}
-                            progressController={repositoryProgressController}
                         />
                     )}
                     {calendarDetails !== null && (
diff --git a/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx b/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
index 96cc8e7f32180728917294223502e69edced4e6b..e2e141daebd05e3d20ca791f2013189bc91e884d
--- a/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
+++ b/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
@@ -49,18 +49,18 @@
         getGithubBranchSelectionPatterns(repository.branch).map((branchName) => ({ name: branchName, headSha: null }));
 
     return (
-        <section
+        <article
             aria-label="Projekt workshopu"
-            className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
+            className="relative scroll-mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#081a24] shadow-lg"
         >
             <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4">
                 <div className="min-w-0">
                     <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
                         <Github className="h-4 w-4" aria-hidden="true" /> Projekt workshopu
                     </p>
-                    <h2 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
+                    <h3 className="mt-2 break-all font-mono text-lg font-bold leading-6 text-white">
                         {repositoryName}
-                    </h2>
+                    </h3>
                 </div>
                 <div className="flex flex-wrap items-center gap-2">
                     {newCommitShas.size > 0 && (
@@ -137,6 +137,6 @@
                     </>
                 )}
             </div>
-        </section>
+        </article>
     );
 }
diff --git a/changelog/_current-preversion.md b/changelog/_current-preversion.md
index 4ee8fbecc56c2657b616810871a480acd67dcd8f..1b9e0df7e45563956015e9d529126853c2a3e470
--- a/changelog/_current-preversion.md
+++ b/changelog/_current-preversion.md
@@ -1,4 +1,9 @@
 # Current preversion
+- Moved a connected GitHub repository in `/cs/online-workshop/participant` into the materials list as a special
+  material. Its existing repository, deployment, and live-commit links now stay with ordinary workshop materials,
+  are visible even when no ordinary material has been unlocked, and remain available to both free and paid
+  participants without turning the repository into timed or membership-gated content.
+
 - Moved the community hand-off in `/cs/online-workshop/participant` into the materials list as a dedicated
   community material. It is shown even before an administrator has unlocked any ordinary material and remains
   available to free and paid members alike, while carrying the participant identity through the existing shared

tokens used
147,377
Implemented the repository as an always-available special material in the participant room.

- Reused the existing `specialMaterials` flow, so repository links and live commits now appear inside “Materiály z workshopu” for free and paid participants: [OnlineWorkshopParticipantPage.tsx](/Users/hejny/work/aldaron/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx:232).
- Kept the existing repository panel behavior, adapting it to a material-card semantic: [WorkshopRepositoryPanel.tsx](/Users/hejny/work/aldaron/businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx:52).
- Added free/paid placement coverage and updated [the changelog](/Users/hejny/work/aldaron/changelog/_current-preversion.md:1).

Verified with `npm test` (1,211 tests), `npm run lint`, `npm run test-types`, and `npx tsc`.
[1]-  Done                    bash "$1"

=== runner shell finished at 2026-09-14T15:18:44.958Z ===
Status: succeeded

=== test shell started at 2026-09-14T15:18:44.966Z ===
Script path: /Users/hejny/work/aldaron/.promptbook/coder-prompts/2026-09-0100-repository-as-special-material.test.sh

--- raw input ---
cd "/Users/hejny/work/aldaron"
npm run test-for-ptbk-coder

--- raw output ---

> promptbook-landing-page@0.1.0 test-for-ptbk-coder
> npm run lint && npx kill-port 4009 && npm run test-types && npm run test-e2e && npm run delete-test-data


> promptbook-landing-page@0.1.0 lint
> next lint

✔ No ESLint warnings or errors
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
   Generating static pages (0/78) ...
BenefitsSection rendered
IntegrationsSection rendered
   Generating static pages (19/78) 
BenefitsSection rendered
   Generating static pages (38/78) 
BenefitsSection rendered
IntegrationsSection rendered
BenefitsSection rendered
IntegrationsSection rendered
BenefitsSection rendered
IntegrationsSection rendered
   Generating static pages (58/78) 
 ✓ Generating static pages (78/78)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                                                                  Size  First Load JS  Revalidate  Expire
┌ ƒ /                                                                                       377 B         102 kB
├ ○ /_not-found                                                                             377 B         102 kB
├ ƒ /[shortcode]                                                                          2.31 kB         142 kB
├ ƒ /admin                                                                                  176 B         105 kB
├ ƒ /admin/community                                                                      7.73 kB         325 kB
├ ƒ /admin/contacts                                                                       36.9 kB         196 kB
├ ƒ /admin/discount-codes                                                                 9.86 kB         119 kB
├ ƒ /admin/login                                                                            377 B         102 kB
├ ƒ /admin/shortener                                                                      64.6 kB         174 kB
├ ƒ /admin/workshops                                                                        215 B         317 kB
├ ○ /ai-supervize                                                                           16 kB         239 kB
├ ƒ /ai-supervize-mini                                                                    17.1 kB         231 kB
├ ○ /ai-supervize-mini/opengraph-image                                                      377 B         102 kB
├ ƒ /ai-supervize-mini/participant                                                        2.51 kB         139 kB
├ ○ /ai-supervize/opengraph-image                                                           377 B         102 kB
├ ○ /ai-ta-krajta                                                                         18.9 kB         146 kB          1h      1y
├ ○ /ai-ta-krajta/branding                                                                  203 B         121 kB
├ ○ /ai-ta-krajta/logo.png                                                                  377 B         102 kB
├ ○ /ai-ta-krajta/logo.svg                                                                  377 B         102 kB
├ ○ /ai-ta-krajta/manifest.webmanifest                                                      377 B         102 kB
├ ○ /ai-ta-krajta/media-kit                                                               3.63 kB         125 kB
├ ○ /ai-ta-krajta/opengraph-image                                                           377 B         102 kB
├ ƒ /api/admin/community/memberships                                                        377 B         102 kB
├ ƒ /api/admin/community/projects                                                           377 B         102 kB
├ ƒ /api/admin/community/projects/[projectId]                                               377 B         102 kB
├ ƒ /api/admin/discount-codes                                                               377 B         102 kB
├ ƒ /api/admin/discount-codes/[discountCodeId]                                              377 B         102 kB
├ ƒ /api/admin/session                                                                      377 B         102 kB
├ ƒ /api/admin/session/sign-out                                                             377 B         102 kB
├ ƒ /api/admin/shortener                                                                    377 B         102 kB
├ ƒ /api/admin/shortener/[shortcodeLinkId]                                                  377 B         102 kB
├ ƒ /api/admin/shortener/[shortcodeLinkId]/clicks                                           377 B         102 kB
├ ƒ /api/admin/workshops                                                                    377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]                                                       377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/analytics                                             377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/artificial-reactions                                  377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/comments                                              377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/comments/[commentId]                                  377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/comments/[commentId]/artificial-upvotes               377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/content                                               377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/content/[contentId]                                   377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/exports/[exportKind]                                  377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/feedback                                              377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/participants                                          377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/participants/[participantId]                          377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/participants/[participantId]/timeline                 377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/polls                                                 377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/polls/[pollId]                                        377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/polls/[pollId]/options/[optionId]/artificial-votes    377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/reactions                                             377 B         102 kB
├ ƒ /api/admin/workshops/[workshopId]/stage-comment                                         377 B         102 kB
├ ƒ /api/ai-supervize-mini/registration                                                     377 B         102 kB
├ ƒ /api/ai-ta-krajta/episodes/search                                                       377 B         102 kB
├ ƒ /api/community/membership/registration                                                  377 B         102 kB
├ ƒ /api/contacts                                                                           377 B         102 kB
├ ƒ /api/contacts/export/[formatId]                                                         377 B         102 kB
├ ƒ /api/discount-codes/validate                                                            377 B         102 kB
├ ƒ /api/stripe/webhook                                                                     377 B         102 kB
├ ƒ /api/track-click                                                                        377 B         102 kB
├ ƒ /api/waitlist                                                                           377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/comments                                                  377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/comments/[commentId]                                      377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/comments/[commentId]/upvotes                              377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/connect                                                   377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/feedback                                                  377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership                                                377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership/cancellation                                   377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership/checkout                                       377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership/checkout/confirmation                          377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/membership/portal                                         377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/participant                                               377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/participants/[participantId]                              377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/polls/[pollId]/votes                                      377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/presence                                                  377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/reactions                                                 377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/repository                                                377 B         102 kB
├ ƒ /api/workshops/[workshopSlug]/state                                                     377 B         102 kB
├ ƒ /api/workshops/komunita/projects                                                        377 B         102 kB
├ ƒ /api/workshops/komunita/projects/[projectId]                                            377 B         102 kB
├ ƒ /api/workshops/komunita/projects/[projectId]/connect                                    377 B         102 kB
├ ƒ /api/workshops/komunita/projects/[projectId]/vote                                       377 B         102 kB
├ ƒ /api/workshops/komunita/projects/preview                                                377 B         102 kB
├ ○ /branding                                                                             4.74 kB         141 kB
├ ○ /contact                                                                              2.54 kB         163 kB
├ ○ /cs                                                                                     170 B         239 kB
├ ƒ /cs/komunita                                                                            231 B         294 kB
├ ƒ /cs/komunita/calendar.ics                                                               377 B         102 kB
├ ƒ /cs/komunita/clenstvi                                                                 13.2 kB         154 kB
├ ○ /cs/komunita/clenstvi/opengraph-image                                                   377 B         102 kB
├ ○ /cs/komunita/opengraph-image                                                            377 B         102 kB
├ ƒ /cs/komunita/projects                                                                 2.83 kB         139 kB
├ ƒ /cs/komunita/projects/[projectId]                                                     3.02 kB         291 kB
├ ○ /cs/obchodni-podminky                                                                 2.52 kB         139 kB
├ ○ /cs/ochrana-osobnich-udaju                                                            2.52 kB         139 kB
├ ƒ /cs/online-workshop                                                                   13.1 kB         244 kB
├ ƒ /cs/online-workshop/dekujeme                                                          4.01 kB         152 kB
├ ○ /cs/online-workshop/opengraph-image                                                     377 B         102 kB
├ ƒ /cs/online-workshop/participant                                                       2.72 kB         291 kB
├ ○ /cs/online-workshop/participant/opengraph-image                                         377 B         102 kB
├ ○ /cs/opengraph-image                                                                     377 B         102 kB
├ ○ /cs/pavol                                                                               157 B         203 kB
├ ○ /cs/pavol/opengraph-image                                                               377 B         102 kB
├ ○ /data-deletion                                                                        2.51 kB         139 kB
├ ○ /dekujeme                                                                             3.72 kB         151 kB
├ ○ /en                                                                                     169 B         239 kB
├ ○ /en/opengraph-image                                                                     377 B         102 kB
├ ○ /en/pavol                                                                               158 B         203 kB
├ ○ /en/pavol/opengraph-image                                                               377 B         102 kB
├ ○ /en/privacy-policy                                                                    2.52 kB         139 kB
├ ○ /en/terms-and-conditions                                                              2.52 kB         139 kB
├ ○ /for-agro                                                                             7.31 kB         268 kB
├ ○ /for-agro/opengraph-image                                                               377 B         102 kB
├ ○ /for-industry                                                                         7.92 kB         269 kB
├ ○ /for-industry/opengraph-image                                                           377 B         102 kB
├ ○ /hackathon-factory                                                                      15 kB         252 kB
├ ○ /hackathon-factory/opengraph-image                                                      377 B         102 kB
├ ƒ /k/[...shortFileUrlParts]                                                               377 B         102 kB
├ ○ /manifest.webmanifest                                                                   377 B         102 kB
├ ○ /old                                                                                  20.5 kB         245 kB
├ ○ /opengraph-image                                                                        377 B         102 kB
├ ƒ /pavol                                                                                  377 B         102 kB
├ ƒ /privacy                                                                                377 B         102 kB
├ ƒ /pro-firmy                                                                              377 B         102 kB
├ ○ /pro-mesta                                                                            6.39 kB         267 kB
├ ○ /pro-mesta/opengraph-image                                                              377 B         102 kB
├ ○ /robots.txt                                                                             377 B         102 kB
├ ○ /shortener                                                                              377 B         102 kB
├ ○ /sitemap.xml                                                                            377 B         102 kB
├ ƒ /skoleni                                                                                377 B         102 kB
├ ƒ /terms                                                                                  377 B         102 kB
└ ○ /test/hopko                                                                           4.62 kB         106 kB
+ First Load JS shared by all                                                              102 kB
  ├ chunks/1684-6c8ee981b3c4cfc9.js                                                       45.8 kB
  ├ chunks/4bd1b696-56d776b9b579ad04.js                                                   53.3 kB
  └ other shared chunks (total)                                                            2.5 kB


ƒ Middleware                                                                                31 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand


> promptbook-landing-page@0.1.0 test-e2e
> playwright test

[WebServer] Database migrations skipped: DATABASE_URL is not configured.

Running 47 tests using 1 worker

  ✓   1 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs (3.7s)
  ✓   2 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /en (635ms)
  ✓   3 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /pro-mesta (1.7s)
  ✓   4 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /for-agro (1.5s)
  ✓   5 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /for-industry (1.9s)
  ✓   6 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /ai-supervize (2.1s)
  ✓   7 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /ai-supervize-mini (3.0s)
  ✓   8 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /ai-ta-krajta (1.6s)
  ✓   9 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /ai-ta-krajta/media-kit (1.6s)
  ✓  10 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /ai-ta-krajta/branding (1.7s)
  ✓  11 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /hackathon-factory (1.4s)
  ✓  12 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs/online-workshop (2.5s)
  ✓  13 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs/komunita/clenstvi (3.7s)
  ✓  14 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs/pavol (1.7s)
  ✓  15 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /en/pavol (1.2s)
  ✓  16 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs/ochrana-osobnich-udaju (1.1s)
  ✓  17 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /en/privacy-policy (1.6s)
  ✓  18 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs/obchodni-podminky (1.4s)
  ✓  19 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /en/terms-and-conditions (1.8s)
  ✓  20 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /contact (1.3s)
  ✓  21 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /branding (2.5s)
  ✓  22 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /data-deletion (2.2s)
  ✓  23 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /old (2.2s)
  ✓  24 tests/e2e/public-pages.spec.ts:139:5 › AI ta Krajta collaboration section deep-links to its media kit (2.2s)
  ✓  25 tests/e2e/public-pages.spec.ts:150:5 › AI ta Krajta owns its metadata, icon and installable manifest and credits Promptbook coder (3.8s)
  ✓  26 tests/e2e/public-pages.spec.ts:246:5 › AI ta Krajta searches complete transcripts on the server without sending them to the browser (2.3s)
  ✓  27 tests/e2e/public-pages.spec.ts:264:9 › public address redirects to its page: / (12ms)
  ✓  28 tests/e2e/public-pages.spec.ts:264:9 › public address redirects to its page: /pavol (768ms)
  ✓  29 tests/e2e/public-pages.spec.ts:264:9 › public address redirects to its page: /privacy (698ms)
  ✓  30 tests/e2e/public-pages.spec.ts:264:9 › public address redirects to its page: /terms (575ms)
  ✓  31 tests/e2e/public-pages.spec.ts:264:9 › public address redirects to its page: /skoleni (530ms)
  ✓  32 tests/e2e/public-pages.spec.ts:278:5 › /skoleni carries a discount code to the workshop registration (22ms)
  ✓  33 tests/e2e/public-submissions.spec.ts:13:5 › submits the shared footer newsletter form (13.4s)
  ✓  34 tests/e2e/public-submissions.spec.ts:27:5 › submits the reusable get-started lead dialog (12.3s)
  ✓  35 tests/e2e/public-submissions.spec.ts:41:5 › submits the business lead dialog (2.9s)
  ✓  36 tests/e2e/public-submissions.spec.ts:55:5 › submits the homepage qualification lead flow (13.5s)
  ✓  37 tests/e2e/public-submissions.spec.ts:80:5 › submits Pavol’s personal contact form (4.2s)
  ✓  38 tests/e2e/public-submissions.spec.ts:96:5 › submits a published online-workshop registration (12.3s)
  ✓  39 tests/e2e/public-submissions.spec.ts:116:5 › personalizes and submits the 199 Kč Promptbook paid community membership (7.7s)
  ✓  40 tests/e2e/public-submissions.spec.ts:143:5 › submits an available AI Supervize Mini workshop registration (5.7s)
  ✓  41 tests/e2e/public-submissions.spec.ts:171:5 › submits the AI Supervize Mini future-term interest form (2.4s)
  ✓  42 tests/e2e/public-submissions.spec.ts:190:5 › submits the AI ta Krajta collaboration form (3.7s)
  ✓  43 tests/e2e/public-submissions.spec.ts:205:5 › plays the newest AI ta Krajta episode from the header (2.5s)
  ✓  44 tests/e2e/public-submissions.spec.ts:214:5 › resumes a half-played AI ta Krajta episode where its listener left it (5.4s)
  ✓  45 tests/e2e/public-submissions.spec.ts:248:5 › starts the AI ta Krajta minigame from its snake and keeps it local to the page (1.8s)
  ✓  46 tests/e2e/public-submissions.spec.ts:262:5 › filters the AI ta Krajta archive by a person and keeps its destination in the hash (2.0s)
  -  47 tests/e2e/public-submissions.spec.ts:274:5 › connects a public online-workshop participant
Saved 41 E2E video(s) to tests/e2e/videos/.
Removed the E2E video(s) of 1 outdated run(s) from tests/e2e/videos/.

  1 skipped
  46 passed (3.1m)

> promptbook-landing-page@0.1.0 delete-test-data
> tsx scripts/delete-test-data.ts

Deleted 10 Contact row(s) and 0 workshop participant row(s) with an @example.com e-mail address.
[1]-  Done                    bash "$1"

=== test shell finished at 2026-09-14T15:22:18.182Z ===
Status: succeeded
```
