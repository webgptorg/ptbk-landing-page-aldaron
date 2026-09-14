# Run trace of `prompts/2026-09-0090-komunita-as-special-material.md#1`

-   **Prompt:** The link to the community should be shown alongside materials and behave like kinda a special material.
-   **Outcome:** Succeeded
-   **Runner:** OpenAI Codex `gpt-5.6-terra` thinking `max` (ChatGPT account)
-   **Attempts:** 1
-   **Steps:** Implementation ~$0.2687 6 minutes; Testing 3 minutes
-   **Verification command:** `npm run test-for-ptbk-coder`
-   **Started:** 2026-09-14T15:04:02.392Z
-   **Finished:** 2026-09-14T15:12:52.877Z
-   **Duration:** 9 minutes

## Runtime log

```text
=== runner shell started at 2026-09-14T15:04:02.454Z ===
Script path: /Users/hejny/work/aldaron/.promptbook/coder-prompts/2026-09-0090-komunita-as-special-material.sh

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

The link to the community should be shown alongside materials and behave like kinda a special material.

- It should appear alongside the materials as a material for all participants (both paying and non-paying)
- You are working with page `/cs/online-workshop/participant?workshop=`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

![alt text](prompts/screenshots/2026-09-0090-komunita-as-special-material.png)

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
session id: 01a0a072-5635-7d51-bd3f-8ef9b6efb0e3
--------
user

## Your Task

The link to the community should be shown alongside materials and behave like kinda a special material.

- It should appear alongside the materials as a material for all participants (both paying and non-paying)
- You are working with page `/cs/online-workshop/participant?workshop=`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

![alt text](prompts/screenshots/2026-09-0090-komunita-as-special-material.png)

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
I’ll first trace how the participant room builds and gates its material list, then make the community entry use that same path so it stays consistent for every participant.
exec
/bin/zsh -lc "pwd && git status --short && rg -n -i \"materials|material|komunit|community\" app components lib tests --glob '"'!node_modules'"' --glob '"'!*.map'"' | head -n 300" in /Users/hejny/work/aldaron
 succeeded in 0ms:
/Users/hejny/work/aldaron
 M prompts/2026-09-0090-komunita-as-special-material.md
tests/e2e/public-pages.spec.ts:33:    '/cs/komunita/clenstvi',
tests/e2e/public-submissions.spec.ts:116:test('personalizes and submits the 199 Kč Promptbook paid community membership', async ({ page }) => {
tests/e2e/public-submissions.spec.ts:117:    const fullname = 'E2E Community Member';
tests/e2e/public-submissions.spec.ts:118:    const email = createE2eTestEmail('community-membership');
tests/e2e/public-submissions.spec.ts:120:        `/cs/komunita/clenstvi?fullname=${encodeURIComponent(fullname)}&email=${encodeURIComponent(email)}`,
tests/e2e/public-submissions.spec.ts:133:    await submitAndExpectApiSuccess(page, '/api/community/membership/registration', () =>
lib/metadata/page-registry.ts:8:import { COMMUNITY_MEMBERSHIP_PAGE_DEFINITION } from '@/businesses/community/membership/communityMembershipMetadata';
lib/metadata/page-registry.ts:39:    COMMUNITY_MEMBERSHIP_PAGE_DEFINITION,
lib/calendar/create-calendar-links.test.ts:76:            'https://ptbk.io/cs/komunita/calendar.ics',
lib/calendar/create-calendar-links.test.ts:79:        expect(webcalUrl).toBe('webcal://ptbk.io/cs/komunita/calendar.ics');
lib/shortener/shortcodeLink.ts:8:export const SHORTCODE_LINK_SOURCE_APP_VALUES = ['admin-shortener', 'online-workshop', 'community'] as const;
lib/shortener/shortcodeLink.ts:17:    community: 'Community',
lib/legal/privacyPolicyDocuments.tsx:179:                    'To register you for a workshop or another event, issue an invoice, and send you the materials - based on the performance of the contract and our legal obligations.',
lib/shortener/shortcodeLinkAdHoc.ts:22: * deliberately server-only: public material rendering may request a link, but
lib/metadata/social-preview-artwork.tsx:16:    'community',
lib/metadata/social-preview-artwork.tsx:466: * Represents people connecting around a shared discussion and shared material.
lib/metadata/social-preview-artwork.tsx:468:function CommunityArtwork({ palette }: { readonly palette: SocialPreviewPalette }) {
lib/metadata/social-preview-artwork.tsx:799:            {kind === 'community' && <CommunityArtwork palette={palette} />}
lib/community-membership/communityMembershipCheckout.ts:2:    COMMUNITY_MEMBERSHIP_CANCELLED_RESULT,
lib/community-membership/communityMembershipCheckout.ts:3:    COMMUNITY_MEMBERSHIP_CHECKOUT_SESSION_PARAMETER_NAME,
lib/community-membership/communityMembershipCheckout.ts:4:    COMMUNITY_MEMBERSHIP_PAID_RESULT,
lib/community-membership/communityMembershipCheckout.ts:5:    COMMUNITY_MEMBERSHIP_RESULT_PARAMETER_NAME,
lib/community-membership/communityMembershipCheckout.ts:6:} from '@/businesses/community/config';
lib/community-membership/communityMembershipCheckout.ts:8:    COMMUNITY_MEMBERSHIP_NAME,
lib/community-membership/communityMembershipCheckout.ts:9:    CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN,
lib/community-membership/communityMembershipCheckout.ts:10:} from '@/businesses/community/membership/communityMembershipConfig';
lib/community-membership/communityMembershipCheckout.ts:11:import type { CommunityMembershipPrice } from '@/businesses/community/membership/communityMembershipPrice';
lib/community-membership/communityMembershipCheckout.ts:13:    normalizeCommunityMemberEmail,
lib/community-membership/communityMembershipCheckout.ts:14:    type CommunityMembershipMember,
lib/community-membership/communityMembershipCheckout.ts:15:} from '@/lib/community-membership/communityMembershipTypes';
lib/community-membership/communityMembershipCheckout.ts:49:export const COMMUNITY_MEMBERSHIP_METADATA_KEYS = {
lib/community-membership/communityMembershipCheckout.ts:50:    memberEmail: 'communityMemberEmail',
lib/community-membership/communityMembershipCheckout.ts:51:    memberFullname: 'communityMemberFullname',
lib/community-membership/communityMembershipCheckout.ts:52:    participantId: 'communityParticipantId',
lib/community-membership/communityMembershipCheckout.ts:53:    planId: 'communityMembershipPlanId',
lib/community-membership/communityMembershipCheckout.ts:54:    discountCode: 'communityMembershipDiscountCode',
lib/community-membership/communityMembershipCheckout.ts:57:export type CommunityMembershipCheckoutUrls = {
lib/community-membership/communityMembershipCheckout.ts:72:function createCommunityMembershipReturnUrl(roomUrl: string, checkoutResult: string): string {
lib/community-membership/communityMembershipCheckout.ts:74:    returnUrl.searchParams.set(COMMUNITY_MEMBERSHIP_RESULT_PARAMETER_NAME, checkoutResult);
lib/community-membership/communityMembershipCheckout.ts:85:export function createCommunityMembershipCheckoutUrls(roomUrl: string): CommunityMembershipCheckoutUrls {
lib/community-membership/communityMembershipCheckout.ts:88:            `${createCommunityMembershipReturnUrl(roomUrl, COMMUNITY_MEMBERSHIP_PAID_RESULT)}` +
lib/community-membership/communityMembershipCheckout.ts:89:            `&${COMMUNITY_MEMBERSHIP_CHECKOUT_SESSION_PARAMETER_NAME}=${STRIPE_CHECKOUT_SESSION_ID_PLACEHOLDER}`,
lib/community-membership/communityMembershipCheckout.ts:90:        cancelUrl: createCommunityMembershipReturnUrl(roomUrl, COMMUNITY_MEMBERSHIP_CANCELLED_RESULT),
lib/community-membership/communityMembershipCheckout.ts:94:function createCommunityMembershipMetadata(
lib/community-membership/communityMembershipCheckout.ts:95:    member: CommunityMembershipMember,
lib/community-membership/communityMembershipCheckout.ts:99:        [COMMUNITY_MEMBERSHIP_METADATA_KEYS.memberEmail]: normalizeCommunityMemberEmail(member.email),
lib/community-membership/communityMembershipCheckout.ts:100:        [COMMUNITY_MEMBERSHIP_METADATA_KEYS.memberFullname]: member.fullname,
lib/community-membership/communityMembershipCheckout.ts:101:        [COMMUNITY_MEMBERSHIP_METADATA_KEYS.participantId]: member.participantId,
lib/community-membership/communityMembershipCheckout.ts:102:        [COMMUNITY_MEMBERSHIP_METADATA_KEYS.planId]: CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN.id,
lib/community-membership/communityMembershipCheckout.ts:103:        [COMMUNITY_MEMBERSHIP_METADATA_KEYS.discountCode]: discountCode ?? '',
lib/community-membership/communityMembershipCheckout.ts:112:function createCommunityMembershipSubscriptionCouponParameters(
lib/community-membership/communityMembershipCheckout.ts:133:async function createCommunityMembershipSubscriptionCoupon(
lib/community-membership/communityMembershipCheckout.ts:139:        : gateway.stripe.coupons.create(createCommunityMembershipSubscriptionCouponParameters(activeDiscount));
lib/community-membership/communityMembershipCheckout.ts:143: * Opens the checkout of the payment gate for one member of the community.
lib/community-membership/communityMembershipCheckout.ts:149:export async function createCommunityMembershipCheckoutSession(
lib/community-membership/communityMembershipCheckout.ts:151:    member: CommunityMembershipMember,
lib/community-membership/communityMembershipCheckout.ts:152:    price: CommunityMembershipPrice,
lib/community-membership/communityMembershipCheckout.ts:154:    urls: CommunityMembershipCheckoutUrls,
lib/community-membership/communityMembershipCheckout.ts:156:    const metadata = createCommunityMembershipMetadata(member, activeDiscount?.code ?? null);
lib/community-membership/communityMembershipCheckout.ts:157:    const subscriptionCoupon = await createCommunityMembershipSubscriptionCoupon(gateway, activeDiscount);
lib/community-membership/communityMembershipCheckout.ts:162:        customer_email: normalizeCommunityMemberEmail(member.email),
lib/community-membership/communityMembershipCheckout.ts:174:                        name: `${COMMUNITY_MEMBERSHIP_NAME} – ${CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN.name}`,
lib/community-membership/communityMembershipCheckout.ts:175:                        description: CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN.description,
lib/community-membership/communityMembershipRoomRequest.ts:1:import { COMMUNITY_MEMBERSHIP_MESSAGES } from '@/lib/community-membership/communityMembershipMessages';
lib/community-membership/communityMembershipRoomRequest.ts:15: * Note: The membership belongs to the address that member connected with, so the community and a workshop occurrence
lib/community-membership/communityMembershipRoomRequest.ts:30:        : NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.membershipNotOfferedInRoom }, { status: 404 });
components/header.tsx:154:                    {/* Brand trail: the optional context is used by product-area pages such as the community. */}
lib/community-membership/communityMembershipAdminQuery.ts:2:    STORED_COMMUNITY_MEMBERSHIP_STATUS_VALUES,
lib/community-membership/communityMembershipAdminQuery.ts:3:    type StoredCommunityMembershipStatus,
lib/community-membership/communityMembershipAdminQuery.ts:4:} from '@/lib/community-membership/communityMembershipTypes';
lib/community-membership/communityMembershipAdminQuery.ts:6:export const COMMUNITY_MEMBERSHIP_ADMIN_SORT_BY_VALUES = [
lib/community-membership/communityMembershipAdminQuery.ts:18:export type CommunityMembershipAdminSortBy = (typeof COMMUNITY_MEMBERSHIP_ADMIN_SORT_BY_VALUES)[number];
lib/community-membership/communityMembershipAdminQuery.ts:20:export const COMMUNITY_MEMBERSHIP_ADMIN_SORT_DIRECTION_VALUES = ['ASCENDING', 'DESCENDING'] as const;
lib/community-membership/communityMembershipAdminQuery.ts:22:export type CommunityMembershipAdminSortDirection = (typeof COMMUNITY_MEMBERSHIP_ADMIN_SORT_DIRECTION_VALUES)[number];
lib/community-membership/communityMembershipAdminQuery.ts:24:export type CommunityMembershipAdminQuery = {
lib/community-membership/communityMembershipAdminQuery.ts:26:    readonly status: StoredCommunityMembershipStatus | null;
lib/community-membership/communityMembershipAdminQuery.ts:28:    readonly sortBy: CommunityMembershipAdminSortBy;
lib/community-membership/communityMembershipAdminQuery.ts:29:    readonly sortDirection: CommunityMembershipAdminSortDirection;
lib/community-membership/communityMembershipAdminQuery.ts:34:export const DEFAULT_COMMUNITY_MEMBERSHIP_ADMIN_QUERY: CommunityMembershipAdminQuery = {
lib/community-membership/communityMembershipAdminQuery.ts:44:export const MAXIMAL_COMMUNITY_MEMBERSHIP_ADMIN_PAGE_SIZE = 200;
lib/community-membership/communityMembershipAdminQuery.ts:46:const COMMUNITY_MEMBERSHIP_ADMIN_QUERY_PARAMETER_NAMES = {
lib/community-membership/communityMembershipAdminQuery.ts:89:function readStoredStatusOrNull(value: string | null): StoredCommunityMembershipStatus | null {
lib/community-membership/communityMembershipAdminQuery.ts:95:        STORED_COMMUNITY_MEMBERSHIP_STATUS_VALUES.find(
lib/community-membership/communityMembershipAdminQuery.ts:105:export function parseCommunityMembershipAdminQuery(searchParams: URLSearchParams): CommunityMembershipAdminQuery {
lib/community-membership/communityMembershipAdminQuery.ts:108:            searchParams.get(COMMUNITY_MEMBERSHIP_ADMIN_QUERY_PARAMETER_NAMES.searchQuery)?.trim().slice(0, 200) ?? '',
lib/community-membership/communityMembershipAdminQuery.ts:109:        status: readStoredStatusOrNull(searchParams.get(COMMUNITY_MEMBERSHIP_ADMIN_QUERY_PARAMETER_NAMES.status)),
lib/community-membership/communityMembershipAdminQuery.ts:110:        isTestPayment: readBooleanOrNull(searchParams.get(COMMUNITY_MEMBERSHIP_ADMIN_QUERY_PARAMETER_NAMES.isTestPayment)),
lib/community-membership/communityMembershipAdminQuery.ts:112:            searchParams.get(COMMUNITY_MEMBERSHIP_ADMIN_QUERY_PARAMETER_NAMES.sortBy),
lib/community-membership/communityMembershipAdminQuery.ts:113:            COMMUNITY_MEMBERSHIP_ADMIN_SORT_BY_VALUES,
lib/community-membership/communityMembershipAdminQuery.ts:114:            DEFAULT_COMMUNITY_MEMBERSHIP_ADMIN_QUERY.sortBy,
lib/community-membership/communityMembershipAdminQuery.ts:117:            searchParams.get(COMMUNITY_MEMBERSHIP_ADMIN_QUERY_PARAMETER_NAMES.sortDirection),
lib/community-membership/communityMembershipAdminQuery.ts:118:            COMMUNITY_MEMBERSHIP_ADMIN_SORT_DIRECTION_VALUES,
lib/community-membership/communityMembershipAdminQuery.ts:119:            DEFAULT_COMMUNITY_MEMBERSHIP_ADMIN_QUERY.sortDirection,
lib/community-membership/communityMembershipAdminQuery.ts:122:            searchParams.get(COMMUNITY_MEMBERSHIP_ADMIN_QUERY_PARAMETER_NAMES.page),
lib/community-membership/communityMembershipAdminQuery.ts:123:            DEFAULT_COMMUNITY_MEMBERSHIP_ADMIN_QUERY.page,
lib/community-membership/communityMembershipAdminQuery.ts:127:            searchParams.get(COMMUNITY_MEMBERSHIP_ADMIN_QUERY_PARAMETER_NAMES.pageSize),
lib/community-membership/communityMembershipAdminQuery.ts:128:            DEFAULT_COMMUNITY_MEMBERSHIP_ADMIN_QUERY.pageSize,
lib/community-membership/communityMembershipAdminQuery.ts:129:            MAXIMAL_COMMUNITY_MEMBERSHIP_ADMIN_PAGE_SIZE,
lib/community-membership/communityMembershipAdminQuery.ts:138:export function serializeCommunityMembershipAdminQuery(
lib/community-membership/communityMembershipAdminQuery.ts:139:    query: CommunityMembershipAdminQuery,
lib/community-membership/communityMembershipAdminQuery.ts:144:        [COMMUNITY_MEMBERSHIP_ADMIN_QUERY_PARAMETER_NAMES.searchQuery]: query.searchQuery || null,
lib/community-membership/communityMembershipAdminQuery.ts:145:        [COMMUNITY_MEMBERSHIP_ADMIN_QUERY_PARAMETER_NAMES.status]: query.status,
lib/community-membership/communityMembershipAdminQuery.ts:146:        [COMMUNITY_MEMBERSHIP_ADMIN_QUERY_PARAMETER_NAMES.isTestPayment]:
lib/community-membership/communityMembershipAdminQuery.ts:148:        [COMMUNITY_MEMBERSHIP_ADMIN_QUERY_PARAMETER_NAMES.sortBy]:
lib/community-membership/communityMembershipAdminQuery.ts:149:            query.sortBy === DEFAULT_COMMUNITY_MEMBERSHIP_ADMIN_QUERY.sortBy ? null : query.sortBy,
lib/community-membership/communityMembershipAdminQuery.ts:150:        [COMMUNITY_MEMBERSHIP_ADMIN_QUERY_PARAMETER_NAMES.sortDirection]:
lib/community-membership/communityMembershipAdminQuery.ts:151:            query.sortDirection === DEFAULT_COMMUNITY_MEMBERSHIP_ADMIN_QUERY.sortDirection
lib/community-membership/communityMembershipAdminQuery.ts:154:        [COMMUNITY_MEMBERSHIP_ADMIN_QUERY_PARAMETER_NAMES.page]:
lib/community-membership/communityMembershipAdminQuery.ts:155:            query.page === DEFAULT_COMMUNITY_MEMBERSHIP_ADMIN_QUERY.page ? null : String(query.page),
lib/community-membership/communityMembershipAdminQuery.ts:156:        [COMMUNITY_MEMBERSHIP_ADMIN_QUERY_PARAMETER_NAMES.pageSize]:
lib/community-membership/communityMembershipAdminQuery.ts:157:            query.pageSize === DEFAULT_COMMUNITY_MEMBERSHIP_ADMIN_QUERY.pageSize ? null : String(query.pageSize),
lib/community-membership/communityMembershipActivation.ts:1:import { COMMUNITY_MEMBERSHIP_METADATA_KEYS } from '@/lib/community-membership/communityMembershipCheckout';
lib/community-membership/communityMembershipActivation.ts:3:    loadCommunityMembershipByCheckoutSession,
lib/community-membership/communityMembershipActivation.ts:4:    loadCommunityMembershipByEmail,
lib/community-membership/communityMembershipActivation.ts:5:    markCommunityMembershipPaid,
lib/community-membership/communityMembershipActivation.ts:6:    saveCommunityMembershipSubscriptionState,
lib/community-membership/communityMembershipActivation.ts:7:    type CommunityMembershipRecord,
lib/community-membership/communityMembershipActivation.ts:8:} from '@/lib/community-membership/communityMembershipDatabase';
lib/community-membership/communityMembershipActivation.ts:10:    readCommunityMembershipSubscriptionState,
lib/community-membership/communityMembershipActivation.ts:12:} from '@/lib/community-membership/communityMembershipSubscription';
lib/community-membership/communityMembershipActivation.ts:13:import { COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID } from '@/lib/discounts/discountPlaces';
lib/community-membership/communityMembershipActivation.ts:19:export type CommunityMembershipActivationResult = {
lib/community-membership/communityMembershipActivation.ts:20:    readonly membership: CommunityMembershipRecord | null;
lib/community-membership/communityMembershipActivation.ts:26:        checkoutSession.metadata?.[COMMUNITY_MEMBERSHIP_METADATA_KEYS.memberEmail] ??
lib/community-membership/communityMembershipActivation.ts:46:): Promise<CommunityMembershipActivationResult> {
lib/community-membership/communityMembershipActivation.ts:47:    const byCheckoutSession = await loadCommunityMembershipByCheckoutSession(supabase, checkoutSession.id);
lib/community-membership/communityMembershipActivation.ts:57:        : loadCommunityMembershipByEmail(supabase, memberEmail);
lib/community-membership/communityMembershipActivation.ts:66:async function consumeCommunityMembershipDiscountCode(discountCode: string): Promise<void> {
lib/community-membership/communityMembershipActivation.ts:67:    const consumption = await consumeDiscountCode(discountCode, COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID);
lib/community-membership/communityMembershipActivation.ts:70:            `Failed to record the use of the community membership discount code: ${
lib/community-membership/communityMembershipActivation.ts:83:export async function activateCommunityMembershipFromCheckoutSession(
lib/community-membership/communityMembershipActivation.ts:87:): Promise<CommunityMembershipActivationResult> {
lib/community-membership/communityMembershipActivation.ts:94:    const subscriptionState = subscription === null ? null : readCommunityMembershipSubscriptionState(subscription);
lib/community-membership/communityMembershipActivation.ts:95:    const paidResult = await markCommunityMembershipPaid(supabase, membership.id, {
lib/community-membership/communityMembershipActivation.ts:107:        await consumeCommunityMembershipDiscountCode(membership.discountCode);
lib/community-membership/communityMembershipActivation.ts:110:    return loadCommunityMembershipByCheckoutSession(supabase, checkoutSession.id);
lib/community-membership/communityMembershipActivation.ts:115: * stopped working stops being a paid membership in the community as well.
lib/community-membership/communityMembershipActivation.ts:117:export async function applyCommunityMembershipSubscriptionChange(
lib/community-membership/communityMembershipActivation.ts:121:    const subscriptionState = readCommunityMembershipSubscriptionState(subscription);
lib/community-membership/communityMembershipActivation.ts:122:    const { isMembershipFound, errorMessage } = await saveCommunityMembershipSubscriptionState(
lib/community-membership/communityMembershipActivation.ts:132:        // a membership of this community and must not silently become one.
lib/community-membership/communityMembershipActivation.ts:133:        console.warn(`No community membership belongs to the Stripe subscription ${subscription.id}.`);
components/admin/DiscountCodeAdmin.tsx:22:    COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID,
components/admin/DiscountCodeAdmin.tsx:66:    const isValidForCommunityMembership =
components/admin/DiscountCodeAdmin.tsx:68:        discountCode.placeIds.includes(COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID);
components/admin/DiscountCodeAdmin.tsx:70:    if (!isValidForCommunityMembership) {
lib/community-membership/communityMembershipTypes.ts:6:export const COMMUNITY_MEMBERSHIP_TABLE_NAME = 'community_memberships';
lib/community-membership/communityMembershipTypes.ts:14:export const STORED_COMMUNITY_MEMBERSHIP_STATUS_VALUES = ['pending', 'active', 'past-due', 'canceled'] as const;
lib/community-membership/communityMembershipTypes.ts:16:export const COMMUNITY_MEMBERSHIP_STATUS_VALUES = [
lib/community-membership/communityMembershipTypes.ts:18:    ...STORED_COMMUNITY_MEMBERSHIP_STATUS_VALUES,
lib/community-membership/communityMembershipTypes.ts:21:export type CommunityMembershipStatus = (typeof COMMUNITY_MEMBERSHIP_STATUS_VALUES)[number];
lib/community-membership/communityMembershipTypes.ts:26:export type StoredCommunityMembershipStatus = (typeof STORED_COMMUNITY_MEMBERSHIP_STATUS_VALUES)[number];
lib/community-membership/communityMembershipTypes.ts:29: * What the community room is told about the membership of the member reading it
lib/community-membership/communityMembershipTypes.ts:34:export type CommunityMembershipRoomState = {
lib/community-membership/communityMembershipTypes.ts:35:    readonly status: CommunityMembershipStatus;
lib/community-membership/communityMembershipTypes.ts:78:export type CommunityMembershipMember = {
lib/community-membership/communityMembershipTypes.ts:90:export type CommunityMembershipPurchaseResult = {
lib/community-membership/communityMembershipTypes.ts:99:    readonly membership: CommunityMembershipRoomState | null;
lib/community-membership/communityMembershipTypes.ts:102:export function isCommunityMembershipStatus(value: unknown): value is CommunityMembershipStatus {
lib/community-membership/communityMembershipTypes.ts:103:    return COMMUNITY_MEMBERSHIP_STATUS_VALUES.includes(value as CommunityMembershipStatus);
lib/community-membership/communityMembershipTypes.ts:110: *       expired overnight is not somebody leaving the community.
lib/community-membership/communityMembershipTypes.ts:112:export function isPaidCommunityMembershipStatus(status: CommunityMembershipStatus): boolean {
lib/community-membership/communityMembershipTypes.ts:116:type CommunityMembershipSubscriptionManagementCandidate = {
lib/community-membership/communityMembershipTypes.ts:117:    readonly status: CommunityMembershipStatus;
lib/community-membership/communityMembershipTypes.ts:124:export function isCommunityMembershipSubscriptionManageable(
lib/community-membership/communityMembershipTypes.ts:125:    membership: CommunityMembershipSubscriptionManagementCandidate | null,
lib/community-membership/communityMembershipTypes.ts:126:): membership is CommunityMembershipSubscriptionManagementCandidate & { readonly stripeSubscriptionId: string } {
lib/community-membership/communityMembershipTypes.ts:130:        isPaidCommunityMembershipStatus(membership.status)
lib/community-membership/communityMembershipTypes.ts:134:type CommunityMembershipDiscountCoverageCandidate = {
lib/community-membership/communityMembershipTypes.ts:135:    readonly status: CommunityMembershipStatus;
lib/community-membership/communityMembershipTypes.ts:145:export function isCommunityMembershipCoveredByDiscountCode(
lib/community-membership/communityMembershipTypes.ts:146:    membership: CommunityMembershipDiscountCoverageCandidate | null,
lib/community-membership/communityMembershipTypes.ts:152:        isPaidCommunityMembershipStatus(membership.status)
lib/community-membership/communityMembershipTypes.ts:160:export function normalizeCommunityMemberEmail(email: string): string {
lib/community-membership/communityMembershipSubscription.test.ts:2:    readCommunityMembershipSubscriptionState,
lib/community-membership/communityMembershipSubscription.test.ts:4:} from '@/lib/community-membership/communityMembershipSubscription';
lib/community-membership/communityMembershipSubscription.test.ts:19:describe('community membership subscription', () => {
lib/community-membership/communityMembershipSubscription.test.ts:36:            readCommunityMembershipSubscriptionState(createSubscription([1_790_000_000], { isCancellationScheduled: true })),
lib/community-membership/communityMembershipSubscription.test.ts:46:            readCommunityMembershipSubscriptionState(
lib/legal/termsAndConditionsDocuments.tsx:24:        perex: `Tyto obchodní podmínky upravují, za jakých pravidel používáte web ${SITE_HOST} a služby Promptbook a jak spolu uzavíráme smlouvu, když se registrujete na workshop, aktivujete členství v komunitě nebo si objednáte konzultaci.`,
lib/legal/termsAndConditionsDocuments.tsx:39:                    'Podmínky se vztahují na návštěvu a používání webu, na registraci na workshopy, školení a online akce, na členství v komunitě Promptbooku, na objednávku konzultací a na přihlášení k odběru novinek.',
lib/legal/termsAndConditionsDocuments.tsx:68:                heading: 'Členství v komunitě Promptbooku',
lib/legal/termsAndConditionsDocuments.tsx:70:                    'Stránka členství popisuje bezplatnou komunitu a aktuální placené členství. Živé online AI webináře zůstávají zdarma; placené členství dává přístup hlavně k záznamům, materiálům a dalšímu obsahu.',
lib/legal/termsAndConditionsDocuments.tsx:146:        perex: `These terms and conditions set out the rules under which you use the ${SITE_HOST} website and the Promptbook services, and how we enter into a contract when you register for a workshop, activate a community membership, or order a consultation.`,
lib/legal/termsAndConditionsDocuments.tsx:161:                    'These terms apply to visiting and using the website, to registering for workshops, trainings, and online events, to membership in the Promptbook community, to ordering consultations, and to subscribing to our news.',
lib/legal/termsAndConditionsDocuments.tsx:190:                heading: 'Promptbook community membership',
lib/legal/termsAndConditionsDocuments.tsx:192:                    'The membership page describes the free community and the current paid membership. Live online AI webinars remain free; paid membership primarily gives access to recordings, materials, and additional content.',
lib/legal/termsAndConditionsDocuments.tsx:196:                    'For operational, technical, security, legal, economic, or content-related reasons, we may change the composition of plans or benefits or replace an individual benefit. We notify a member of a material change by e-mail at least 30 days in advance, and the member may terminate without penalty before it takes effect. Where legal, security, or technical reasons require immediate action, we may make the change or suspend the service immediately and give notice without undue delay.',
lib/legal/termsAndConditionsDocuments.tsx:197:                    'We may terminate the contract without stating a reason on 30 days’ notice. For serious legal, security, or technical reasons, or a material breach of these terms, we may terminate the contract or suspend membership immediately.',
lib/legal/termsAndConditionsDocuments.tsx:218:                    'The content of the website, the workshop materials, texts, graphics, and software are protected by copyright and belong to the operator or to its partners.',
lib/legal/termsAndConditionsDocuments.tsx:219:                    'You may use the materials you receive from us for your own needs and for the needs of your company. You must not distribute, sell, or build your own training on them without our written consent.',
lib/community-membership/communityMembershipRoomPath.ts:1:import { COMMUNITY_PATH } from '@/businesses/community/config';
lib/community-membership/communityMembershipRoomPath.ts:12: *       community, because leaving the room they were watching is not what buying a membership is for. A room without
lib/community-membership/communityMembershipRoomPath.ts:13: *       a public address of its own leads to the community, which is where the membership is always at home.
lib/community-membership/communityMembershipRoomPath.ts:15:export function createCommunityMembershipRoomPath(workshop: WorkshopSummary): string {
lib/community-membership/communityMembershipRoomPath.ts:16:    return workshop.kind === 'community' ? COMMUNITY_PATH : (createPublicEventLinkOrNull(workshop) ?? COMMUNITY_PATH);
lib/community-membership/communityMembershipRoomPath.ts:22:export function createCommunityMembershipRoomUrl(request: NextRequest, workshopRow: WorkshopRow): string {
lib/community-membership/communityMembershipRoomPath.ts:23:    return createRequestSiteUrl(request, createCommunityMembershipRoomPath(mapWorkshopSummaryRow(workshopRow)));
lib/community-membership/communityMembershipMessages.ts:2: * What the community says about a membership which could not be bought, read once by every endpoint of the membership
lib/community-membership/communityMembershipMessages.ts:5:export const COMMUNITY_MEMBERSHIP_MESSAGES = {
components/admin/adminNavigationConfig.ts:1:import { COMMUNITY_ADMIN_PATH } from '@/businesses/community/config';
components/admin/adminNavigationConfig.ts:40:        path: COMMUNITY_ADMIN_PATH,
components/admin/adminNavigationConfig.ts:41:        label: 'Komunita',
components/admin/adminNavigationConfig.ts:42:        title: 'Komunita Promptbooku',
components/admin/adminNavigationConfig.ts:43:        description: 'Stálá komunitní místnost, její jeviště, účastníci a moderace.',
lib/community-membership/communityMembershipCheckout.test.ts:1:import type { CommunityMembershipPrice } from '@/businesses/community/membership/communityMembershipPrice';
lib/community-membership/communityMembershipCheckout.test.ts:6:    createCommunityMembershipCheckoutSession,
lib/community-membership/communityMembershipCheckout.test.ts:7:    createCommunityMembershipCheckoutUrls,
lib/community-membership/communityMembershipCheckout.test.ts:9:} from './communityMembershipCheckout';
lib/community-membership/communityMembershipCheckout.test.ts:21:    successUrl: 'https://ptbk.io/cs/komunita?membership=paid&checkoutSession={CHECKOUT_SESSION_ID}',
lib/community-membership/communityMembershipCheckout.test.ts:22:    cancelUrl: 'https://ptbk.io/cs/komunita?membership=cancelled',
lib/community-membership/communityMembershipCheckout.test.ts:25:const DISCOUNTED_PRICE: CommunityMembershipPrice = {
lib/community-membership/communityMembershipCheckout.test.ts:57:describe('community membership checkout', () => {
lib/community-membership/communityMembershipCheckout.test.ts:66:        await createCommunityMembershipCheckoutSession(
lib/community-membership/communityMembershipCheckout.test.ts:93:        await createCommunityMembershipCheckoutSession(
lib/community-membership/communityMembershipCheckout.test.ts:111:        await createCommunityMembershipCheckoutSession(createGateway(), MEMBER, DISCOUNTED_PRICE, null, CHECKOUT_URLS);
lib/community-membership/communityMembershipCheckout.test.ts:127:const COMMUNITY_ROOM_URL = 'https://ptbk.io/cs/komunita';
lib/community-membership/communityMembershipCheckout.test.ts:131:    it('adds the result to the address of the community room', () => {
lib/community-membership/communityMembershipCheckout.test.ts:132:        expect(createCommunityMembershipCheckoutUrls(COMMUNITY_ROOM_URL)).toEqual({
lib/community-membership/communityMembershipCheckout.test.ts:133:            successUrl: `${COMMUNITY_ROOM_URL}?membership=paid&checkoutSession=${STRIPE_CHECKOUT_SESSION_ID_PLACEHOLDER}`,
lib/community-membership/communityMembershipCheckout.test.ts:134:            cancelUrl: `${COMMUNITY_ROOM_URL}?membership=cancelled`,
lib/community-membership/communityMembershipCheckout.test.ts:139:        const { successUrl, cancelUrl } = createCommunityMembershipCheckoutUrls(WORKSHOP_ROOM_URL);
lib/community-membership/communityMembershipCheckout.test.ts:155:        const { successUrl } = createCommunityMembershipCheckoutUrls(WORKSHOP_ROOM_URL);
lib/discounts/discountPlaces.test.ts:3:    COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID,
lib/discounts/discountPlaces.test.ts:4:    COMMUNITY_MEMBERSHIP_PATH,
lib/discounts/discountPlaces.test.ts:27:    it('offers a registration-prefilled link for community membership', () => {
lib/discounts/discountPlaces.test.ts:28:        const communityMembershipPlace = DISCOUNT_PLACES.find(
lib/discounts/discountPlaces.test.ts:29:            (place) => place.id === COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID,
lib/discounts/discountPlaces.test.ts:32:        expect(communityMembershipPlace).toBeDefined();
lib/discounts/discountPlaces.test.ts:33:        expect(createDiscountCodeUrl(communityMembershipPlace!, 'COMMUNITY 10')).toBe(
lib/discounts/discountPlaces.test.ts:34:            `${COMMUNITY_MEMBERSHIP_PATH}?code=COMMUNITY%2010#registrace`,
lib/community-membership/communityMembershipRedemption.ts:2:    CURRENT_PAID_COMMUNITY_MEMBERSHIP_BILLING_PERIOD,
lib/community-membership/communityMembershipRedemption.ts:3:    CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID,
lib/community-membership/communityMembershipRedemption.ts:4:} from '@/businesses/community/membership/communityMembershipConfig';
lib/community-membership/communityMembershipRedemption.ts:5:import { createCommunityMembershipPrice } from '@/businesses/community/membership/communityMembershipPrice';
lib/community-membership/communityMembershipRedemption.ts:7:    loadCommunityMembershipByEmail,
lib/community-membership/communityMembershipRedemption.ts:8:    saveRedeemedCommunityMembership,
lib/community-membership/communityMembershipRedemption.ts:9:    type CommunityMembershipRecord,
lib/community-membership/communityMembershipRedemption.ts:10:} from '@/lib/community-membership/communityMembershipDatabase';
lib/community-membership/communityMembershipRedemption.ts:11:import type { CommunityMembershipMember } from '@/lib/community-membership/communityMembershipTypes';
lib/community-membership/communityMembershipRedemption.ts:14:import { COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID } from '@/lib/discounts/discountPlaces';
lib/community-membership/communityMembershipRedemption.ts:21:export type CommunityMembershipRedemptionStatus = 'redeemed' | 'discount-code-refused' | 'not-redeemed';
lib/community-membership/communityMembershipRedemption.ts:23:export type CommunityMembershipRedemptionResult = {
lib/community-membership/communityMembershipRedemption.ts:24:    readonly status: CommunityMembershipRedemptionStatus;
lib/community-membership/communityMembershipRedemption.ts:25:    readonly membership: CommunityMembershipRecord | null;
lib/community-membership/communityMembershipRedemption.ts:39:export async function redeemCommunityMembership(
lib/community-membership/communityMembershipRedemption.ts:41:    member: CommunityMembershipMember,
lib/community-membership/communityMembershipRedemption.ts:45:): Promise<CommunityMembershipRedemptionResult> {
lib/community-membership/communityMembershipRedemption.ts:46:    const consumption = await consumeDiscountCode(discountCodeValue, COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID);
lib/community-membership/communityMembershipRedemption.ts:48:        console.error(`Failed to take the use of a community membership voucher: ${consumption.errorMessage}`);
lib/community-membership/communityMembershipRedemption.ts:61:    const price = createCommunityMembershipPrice(
lib/community-membership/communityMembershipRedemption.ts:62:        CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID,
lib/community-membership/communityMembershipRedemption.ts:63:        CURRENT_PAID_COMMUNITY_MEMBERSHIP_BILLING_PERIOD,
lib/community-membership/communityMembershipRedemption.ts:66:    const { errorMessage } = await saveRedeemedCommunityMembership(supabase, existingMembershipId, {
lib/community-membership/communityMembershipRedemption.ts:69:        planId: CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID,
lib/community-membership/communityMembershipRedemption.ts:82:    const { membership } = await loadCommunityMembershipByEmail(supabase, member.email);
lib/community-membership/communityMembershipStatus.test.ts:1:import { createCommunityMembershipStatusFromSubscription } from '@/lib/community-membership/communityMembershipStatus';
lib/community-membership/communityMembershipStatus.test.ts:4:describe('community membership status', () => {
lib/community-membership/communityMembershipStatus.test.ts:6:        expect(createCommunityMembershipStatusFromSubscription('active')).toBe('active');
lib/community-membership/communityMembershipStatus.test.ts:7:        expect(createCommunityMembershipStatusFromSubscription('trialing')).toBe('active');
lib/community-membership/communityMembershipStatus.test.ts:11:        expect(createCommunityMembershipStatusFromSubscription('past_due')).toBe('past-due');
lib/community-membership/communityMembershipStatus.test.ts:12:        expect(createCommunityMembershipStatusFromSubscription('unpaid')).toBe('past-due');
lib/community-membership/communityMembershipStatus.test.ts:16:        expect(createCommunityMembershipStatusFromSubscription('incomplete')).toBe('pending');
lib/community-membership/communityMembershipStatus.test.ts:20:        expect(createCommunityMembershipStatusFromSubscription('canceled')).toBe('canceled');
lib/community-membership/communityMembershipStatus.test.ts:21:        expect(createCommunityMembershipStatusFromSubscription('incomplete_expired')).toBe('canceled');
lib/community-membership/communityMembershipStatus.test.ts:22:        expect(createCommunityMembershipStatusFromSubscription('paused')).toBe('canceled');
lib/legal/legalPageMetadata.ts:37:                'Pravidla používání webu a služeb Promptbook, členství v komunitě, registrace na workshopy, platby a odstoupení od smlouvy.',
lib/legal/legalPageMetadata.ts:42:                'The rules for using the Promptbook website and services, community membership, event registrations, payments, and withdrawal.',
lib/api/createRequestSiteUrl.test.ts:6:const COMMUNITY_PATH = '/cs/komunita';
lib/api/createRequestSiteUrl.test.ts:20:        expect(createRequestSiteUrl(createRequest('https://forged.example.com/cs/komunita'), COMMUNITY_PATH)).toBe(
lib/api/createRequestSiteUrl.test.ts:21:            `${SITE_URL}${COMMUNITY_PATH}`,
lib/api/createRequestSiteUrl.test.ts:28:        expect(createRequestSiteUrl(createRequest('http://127.0.0.1:4009/cs/komunita'), COMMUNITY_PATH)).toBe(
lib/api/createRequestSiteUrl.test.ts:29:            `http://127.0.0.1:4009${COMMUNITY_PATH}`,
lib/community-membership/communityMembershipSubscription.ts:1:import { createCommunityMembershipStatusFromSubscription } from '@/lib/community-membership/communityMembershipStatus';
lib/community-membership/communityMembershipSubscription.ts:3:    isPaidCommunityMembershipStatus,
lib/community-membership/communityMembershipSubscription.ts:4:    type StoredCommunityMembershipStatus,
lib/community-membership/communityMembershipSubscription.ts:5:} from '@/lib/community-membership/communityMembershipTypes';
lib/community-membership/communityMembershipSubscription.ts:8:export type CommunityMembershipSubscriptionState = {
lib/community-membership/communityMembershipSubscription.ts:9:    readonly status: StoredCommunityMembershipStatus;
lib/community-membership/communityMembershipSubscription.ts:40: * Reads the small part of a Stripe subscription which the community mirrors for its member-facing state.
lib/community-membership/communityMembershipSubscription.ts:42:export function readCommunityMembershipSubscriptionState(
lib/community-membership/communityMembershipSubscription.ts:44:): CommunityMembershipSubscriptionState {
lib/community-membership/communityMembershipSubscription.ts:45:    const status = createCommunityMembershipStatusFromSubscription(subscription.status);
lib/community-membership/communityMembershipSubscription.ts:50:        isCancellationScheduled: subscription.cancel_at_period_end === true && isPaidCommunityMembershipStatus(status),
lib/community-membership/communityMembershipAdminLinks.test.ts:2:    createCommunityMembershipAdminPath,
lib/community-membership/communityMembershipAdminLinks.test.ts:3:    readCommunityMembershipAdminMemberEmail,
lib/community-membership/communityMembershipAdminLinks.test.ts:4:} from '@/lib/community-membership/communityMembershipAdminLinks';
lib/community-membership/communityMembershipAdminLinks.test.ts:7:describe('community membership administration links', () => {
lib/community-membership/communityMembershipAdminLinks.test.ts:8:    it('uses the durable normalized e-mail to open a membership from its community participant', () => {
lib/community-membership/communityMembershipAdminLinks.test.ts:9:        expect(createCommunityMembershipAdminPath('memberships', ' Jana@Example.COM ')).toBe(
lib/community-membership/communityMembershipAdminLinks.test.ts:10:            '/admin/community?tab=memberships&member=jana%40example.com',
lib/community-membership/communityMembershipAdminLinks.test.ts:15:        expect(createCommunityMembershipAdminPath('participants')).toBe('/admin/community?tab=participants');
lib/community-membership/communityMembershipAdminLinks.test.ts:19:        expect(readCommunityMembershipAdminMemberEmail(new URLSearchParams('member=Jana%40Example.COM'))).toBe(
lib/community-membership/communityMembershipAdminLinks.test.ts:22:        expect(readCommunityMembershipAdminMemberEmail(new URLSearchParams())).toBeNull();
components/admin/DiscountCodeForm.tsx:16:import { COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID, DISCOUNT_PLACES } from '@/lib/discounts/discountPlaces';
components/admin/DiscountCodeForm.tsx:97:    const isCommunityMembershipSelected =
components/admin/DiscountCodeForm.tsx:98:        isValidForAllPlaces || values.placeIds.includes(COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID);
components/admin/DiscountCodeForm.tsx:301:            {isCommunityMembershipSelected && (
components/admin/DiscountCodeForm.tsx:305:                        Toto nastavení se použije pouze pro placené členství komunity. Platnost kódu určuje, dokdy lze
lib/community-membership/communityMembershipRoomState.ts:1:import type { CommunityMembershipRecord } from '@/lib/community-membership/communityMembershipDatabase';

exec
/bin/zsh -lc "rg --files app components lib tests | rg 'online-workshop|participant|Workshop.*Material|material'" in /Users/hejny/work/aldaron
 succeeded in 0ms:
app/ai-supervize-mini/participant/page.tsx
app/cs/online-workshop/page.tsx
app/cs/online-workshop/opengraph-image.tsx
app/cs/online-workshop/participant/page.tsx
app/cs/online-workshop/participant/opengraph-image.tsx
app/cs/online-workshop/dekujeme/page.tsx
app/api/workshops/[workshopSlug]/participant/route.ts
app/api/workshops/[workshopSlug]/participants/[participantId]/route.ts
app/api/admin/workshops/[workshopId]/participants/route.test.ts
app/api/admin/workshops/[workshopId]/participants/route.ts
app/api/admin/workshops/[workshopId]/participants/[participantId]/route.ts
app/api/admin/workshops/[workshopId]/participants/[participantId]/timeline/route.ts

exec
/bin/zsh -lc "sed -n '1,260p' app/cs/online-workshop/participant/page.tsx && rg -n \"Material|material\" components app/cs/online-workshop lib/workshops --glob '*.tsx' --glob '*.ts'" in /Users/hejny/work/aldaron
 succeeded in 0ms:
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
lib/workshops/workshopPaidMembersContent.ts:4: * What decides whether the materials reserved for paid members reach the member reading the room
lib/workshops/workshopPaidMembersContent.ts:19: * The materials of a room as one member is given them: the ones they may read, and the ones they are merely told about
lib/workshops/workshopPaidMembersContent.ts:31: * Divides the materials a paid member would read into the ones this member receives and the ones which are only named
lib/workshops/workshopPaidMembersContent.ts:35: *       disagree. A material is withheld with everything but its title, which is the teaser the room shows instead.
lib/workshops/workshopPaidMembersContent.ts:36: * Note: A room which offers no membership has nothing a purchase could unlock, so it keeps such a material hidden
lib/workshops/workshopSchemas.test.ts:298:    it('writes which materials only paid members may see and refuses a content request without that answer', () => {
lib/workshops/workshopSchemas.test.ts:323:    it('keeps a selected follow-up material in the ordinary content request and normalizes optional feedback text', () => {
lib/workshops/workshopValues.test.ts:109:    it('writes a follow-up flag as part of one ordinary material and only the feedback fields that changed', () => {
lib/workshops/workshopValues.test.ts:127:    it('writes only the fields of a material which changed, including who may see it', () => {
lib/workshops/workshopMaterialLinks.ts:23:type WorkshopMaterialLinkRange = {
lib/workshops/workshopMaterialLinks.ts:38: * Materials and eligible chat messages differ only by this durable mapping;
lib/workshops/workshopMaterialLinks.ts:71:function getWorkshopMaterialLinkBaseUrl(): string {
lib/workshops/workshopMaterialLinks.ts:120:function collectMarkdownInlineLinkRanges(markdown: string): readonly WorkshopMaterialLinkRange[] {
lib/workshops/workshopMaterialLinks.ts:121:    const ranges: WorkshopMaterialLinkRange[] = [];
lib/workshops/workshopMaterialLinks.ts:192:function collectHtmlLinkRanges(markdown: string): readonly WorkshopMaterialLinkRange[] {
lib/workshops/workshopMaterialLinks.ts:193:    const ranges: WorkshopMaterialLinkRange[] = [];
lib/workshops/workshopMaterialLinks.ts:232:function collectAutolinkRanges(markdown: string): readonly WorkshopMaterialLinkRange[] {
lib/workshops/workshopMaterialLinks.ts:233:    const ranges: WorkshopMaterialLinkRange[] = [];
lib/workshops/workshopMaterialLinks.ts:254: * bare HTTP(S) URL too. Materialization must therefore match that rendered
lib/workshops/workshopMaterialLinks.ts:257:function collectBareUrlRanges(markdown: string): readonly WorkshopMaterialLinkRange[] {
lib/workshops/workshopMaterialLinks.ts:258:    const ranges: WorkshopMaterialLinkRange[] = [];
lib/workshops/workshopMaterialLinks.ts:276:function collectReferenceDefinitionRanges(markdown: string): readonly WorkshopMaterialLinkRange[] {
lib/workshops/workshopMaterialLinks.ts:277:    const ranges: WorkshopMaterialLinkRange[] = [];
lib/workshops/workshopMaterialLinks.ts:303:function collectWorkshopMaterialLinkRanges(markdown: string): readonly WorkshopMaterialLinkRange[] {
lib/workshops/workshopMaterialLinks.ts:317:    const nonOverlappingRanges: WorkshopMaterialLinkRange[] = [];
lib/workshops/workshopMaterialLinks.ts:328:function getTrackableWorkshopMaterialUrl(destinationUrl: string): string | null {
lib/workshops/workshopMaterialLinks.ts:334:        const parsedUrl = new URL(destinationUrl, getWorkshopMaterialLinkBaseUrl());
lib/workshops/workshopMaterialLinks.ts:352:    const trackableUrl = getTrackableWorkshopMaterialUrl(destinationUrl);
lib/workshops/workshopMaterialLinks.ts:366: * The material-specific name remains available to callers which describe a
lib/workshops/workshopMaterialLinks.ts:369:export function createWorkshopMaterialTrackingUrl(
lib/workshops/workshopMaterialLinks.ts:378: * Lists the HTTP(S) destinations written in a material, regardless of whether
lib/workshops/workshopMaterialLinks.ts:385:            collectWorkshopMaterialLinkRanges(bodyMarkdown)
lib/workshops/workshopMaterialLinks.ts:387:                .filter((destination) => getTrackableWorkshopMaterialUrl(destination) !== null),
lib/workshops/workshopMaterialLinks.ts:392:export function getWorkshopMaterialLinkDestinations(bodyMarkdown: string): readonly string[] {
lib/workshops/workshopMaterialLinks.ts:399:            collectWorkshopMaterialLinkRanges(bodyMarkdown)
lib/workshops/workshopMaterialLinks.ts:402:                .filter((destination) => getTrackableWorkshopMaterialUrl(destination) !== null),
lib/workshops/workshopMaterialLinks.ts:416:    const trackableUrl = getTrackableWorkshopMaterialUrl(destinationUrl);
lib/workshops/workshopMaterialLinks.ts:428:    const trackableUrl = getTrackableWorkshopMaterialUrl(destinationUrl);
lib/workshops/workshopMaterialLinks.ts:452:    const ranges = collectWorkshopMaterialLinkRanges(bodyMarkdown);
lib/workshops/workshopMaterialLinks.ts:471:export function replaceWorkshopMaterialLinkDestinations(
lib/workshops/workshopMaterialLinks.ts:482:export function getWorkshopMaterialShortcodeSourceApp(workshopKind: WorkshopKind): ShortcodeLinkSourceApp {
lib/workshops/workshopMaterialLinks.ts:572:async function materializeWorkshopShortLinks(
lib/workshops/workshopMaterialLinks.ts:673: * Makes sure every trackable URL in one material has one ad hoc short link,
lib/workshops/workshopMaterialLinks.ts:676:export async function materializeWorkshopMaterialShortLinks(
lib/workshops/workshopMaterialLinks.ts:685:    return materializeWorkshopShortLinks(supabase, context, {
lib/workshops/workshopMaterialLinks.ts:689:        note: `Ad hoc material link for ${context.workshopSlug}`,
lib/workshops/workshopMaterialLinks.ts:694: * Materializes the links of an eligible chat message through the same persisted
lib/workshops/workshopMaterialLinks.ts:695: * ad hoc-shortcode path as materials. A normal participant never calls this:
lib/workshops/workshopMaterialLinks.ts:698:export async function materializeWorkshopCommentShortLinks(
lib/workshops/workshopMaterialLinks.ts:707:    return materializeWorkshopShortLinks(supabase, context, {
lib/workshops/workshopMaterialLinks.ts:716: * Prepares a material as soon as an administrator saves it. Participant-facing
lib/workshops/workshopMaterialLinks.ts:717: * reads call the same materializer as a recovery path for links which existed
lib/workshops/workshopMaterialLinks.ts:720:export async function ensureWorkshopMaterialShortLinks(
lib/workshops/workshopMaterialLinks.ts:729:    const { errorMessage } = await materializeWorkshopMaterialShortLinks(supabase, context);
lib/workshops/workshopMaterialLinks.ts:747:    const { errorMessage } = await materializeWorkshopCommentShortLinks(supabase, context);
lib/workshops/workshopMaterialLinks.test.ts:2:    createWorkshopMaterialTrackingUrl,
lib/workshops/workshopMaterialLinks.test.ts:3:    getWorkshopMaterialLinkDestinations,
lib/workshops/workshopMaterialLinks.test.ts:4:    getWorkshopMaterialShortcodeSourceApp,
lib/workshops/workshopMaterialLinks.test.ts:5:    materializeWorkshopCommentShortLinks,
lib/workshops/workshopMaterialLinks.test.ts:6:    materializeWorkshopMaterialShortLinks,
lib/workshops/workshopMaterialLinks.test.ts:7:    replaceWorkshopMaterialLinkDestinations,
lib/workshops/workshopMaterialLinks.test.ts:9:} from '@/lib/workshops/workshopMaterialLinks';
lib/workshops/workshopMaterialLinks.test.ts:31:describe('workshop material tracking links', () => {
lib/workshops/workshopMaterialLinks.test.ts:33:        const trackingUrl = createWorkshopMaterialTrackingUrl(
lib/workshops/workshopMaterialLinks.test.ts:34:            'https://example.com/material?download=1&utm_source=old-source',
lib/workshops/workshopMaterialLinks.test.ts:48:        expect(createWorkshopMaterialTrackingUrl('#slides', 'workshop', 'content')).toBe('#slides');
lib/workshops/workshopMaterialLinks.test.ts:49:        expect(createWorkshopMaterialTrackingUrl('mailto:hello@example.com', 'workshop', 'content')).toBe(
lib/workshops/workshopMaterialLinks.test.ts:54:    it('finds every ordinary material link while leaving images, e-mail links, and code samples alone', () => {
lib/workshops/workshopMaterialLinks.test.ts:55:        const materialMarkdown = [
lib/workshops/workshopMaterialLinks.test.ts:66:        expect(getWorkshopMaterialLinkDestinations(materialMarkdown)).toEqual([
lib/workshops/workshopMaterialLinks.test.ts:76:        const materialMarkdown =
lib/workshops/workshopMaterialLinks.test.ts:78:        const materialWithShortLinks = replaceWorkshopMaterialLinkDestinations(
lib/workshops/workshopMaterialLinks.test.ts:79:            materialMarkdown,
lib/workshops/workshopMaterialLinks.test.ts:90:        expect(materialWithShortLinks).toBe(
lib/workshops/workshopMaterialLinks.test.ts:97:            replaceWorkshopMaterialLinkDestinations(
lib/workshops/workshopMaterialLinks.test.ts:109:    it('labels automatic material links by the app which created them', () => {
lib/workshops/workshopMaterialLinks.test.ts:110:        expect(getWorkshopMaterialShortcodeSourceApp('workshop')).toBe('online-workshop');
lib/workshops/workshopMaterialLinks.test.ts:111:        expect(getWorkshopMaterialShortcodeSourceApp('community')).toBe('community');
lib/workshops/workshopMaterialLinks.test.ts:112:        expect(getWorkshopMaterialShortcodeSourceApp('project')).toBe('community');
lib/workshops/workshopMaterialLinks.test.ts:115:    it('creates and returns an ad hoc short link instead of exposing a material destination', async () => {
lib/workshops/workshopMaterialLinks.test.ts:140:                        in: vi.fn(async () => ({ data: [{ id: 44, shortcode: 'material-44' }], error: null })),
lib/workshops/workshopMaterialLinks.test.ts:151:                shortcode: 'material-44',
lib/workshops/workshopMaterialLinks.test.ts:152:                urls: ['https://example.com/material'],
lib/workshops/workshopMaterialLinks.test.ts:161:        const materializedLink = await materializeWorkshopMaterialShortLinks(
lib/workshops/workshopMaterialLinks.test.ts:167:                bodyMarkdown: '[Otevřít materiál](https://example.com/material?download=1)',
lib/workshops/workshopMaterialLinks.test.ts:171:        expect(materializedLink).toEqual({
lib/workshops/workshopMaterialLinks.test.ts:172:            bodyMarkdown: '[Otevřít materiál](https://ptbk.io/material-44)',
lib/workshops/workshopMaterialLinks.test.ts:177:                'https://example.com/material?download=1&utm_source=promptbook&utm_medium=workshop&utm_campaign=production-ai-2026-08-24&utm_content=content-44',
lib/workshops/workshopMaterialLinks.test.ts:179:            note: 'Ad hoc material link for production-ai-2026-08-24',
lib/workshops/workshopMaterialLinks.test.ts:185:                destination_url: 'https://example.com/material?download=1',
lib/workshops/workshopMaterialLinks.test.ts:192:    it('reuses the persisted material short-link path for an artificial or moderator chat message', async () => {
lib/workshops/workshopMaterialLinks.test.ts:245:        const materializedLink = await materializeWorkshopCommentShortLinks(
lib/workshops/workshopMaterialLinks.test.ts:255:        expect(materializedLink).toEqual({
lib/workshops/workshopMaterialLinks.test.ts:318:        const materializedLink = await materializeWorkshopMaterialShortLinks(
lib/workshops/workshopMaterialLinks.test.ts:328:        expect(materializedLink).toEqual({
lib/workshops/workshopDatabase.ts:33:import { materializeWorkshopMaterialShortLinks } from '@/lib/workshops/workshopMaterialLinks';
lib/workshops/workshopDatabase.ts:34:import { materializeWorkshopCommentShortLinks } from '@/lib/workshops/workshopMaterialLinks';
lib/workshops/workshopDatabase.ts:1634: * material links are shareable, so they correctly belong to the material-wide
lib/workshops/workshopDatabase.ts:2027: * Loads all content blocks with their measured material-link clicks for the content CSV export.
lib/workshops/workshopDatabase.ts:2233:    // Note: The membership decides which materials a member sees, so the room asks about it before it assembles what
lib/workshops/workshopDatabase.ts:2235:    //       not arrive keeps the paid materials hidden rather than letting them escape.
lib/workshops/workshopDatabase.ts:2265:    // Note: A member who does not pay for the membership is never told that a material of the paid ones unlocks next,
lib/workshops/workshopDatabase.ts:2276:    // Note: The materials are read as a paid member would read them, whoever is reading the room. Which of them reach
lib/workshops/workshopDatabase.ts:2277:    //       this member and which are only named to them is then decided once, so the room cannot hide a material it
lib/workshops/workshopDatabase.ts:2314:        // A selected follow-up remains a normal material before the end, including its scheduled unlock. Once the
lib/workshops/workshopDatabase.ts:2316:        // scheduled materials keep their own timing.
lib/workshops/workshopDatabase.ts:2372:    // Only what this member may read is prepared for them; a withheld material never has its links materialized,
lib/workshops/workshopDatabase.ts:2386:    const materializedContentResults = await Promise.all(
lib/workshops/workshopDatabase.ts:2389:            ...(await materializeWorkshopMaterialShortLinks(supabase, {
lib/workshops/workshopDatabase.ts:2397:    const materializationErrorMessage = materializedContentResults.find(
lib/workshops/workshopDatabase.ts:2398:        (materializedContentResult) => materializedContentResult.errorMessage !== null,
lib/workshops/workshopDatabase.ts:2400:    if (materializationErrorMessage !== null && materializationErrorMessage !== undefined) {
lib/workshops/workshopDatabase.ts:2401:        return { state: null, errorMessage: materializationErrorMessage };
lib/workshops/workshopDatabase.ts:2403:    const materializedContentBlocks = materializedContentResults.map((materializedContentResult) => ({
lib/workshops/workshopDatabase.ts:2404:        ...materializedContentResult.contentBlock,
lib/workshops/workshopDatabase.ts:2405:        bodyMarkdown: materializedContentResult.bodyMarkdown ?? materializedContentResult.contentBlock.bodyMarkdown,
lib/workshops/workshopDatabase.ts:2439:    const materializedCommentResults = await Promise.all(
lib/workshops/workshopDatabase.ts:2456:                ...(await materializeWorkshopCommentShortLinks(supabase, {
lib/workshops/workshopDatabase.ts:2465:    const commentMaterializationErrorMessage = materializedCommentResults.find(
lib/workshops/workshopDatabase.ts:2466:        (materializedCommentResult) => materializedCommentResult.errorMessage !== null,
lib/workshops/workshopDatabase.ts:2468:    if (commentMaterializationErrorMessage !== null && commentMaterializationErrorMessage !== undefined) {
lib/workshops/workshopDatabase.ts:2469:        return { state: null, errorMessage: commentMaterializationErrorMessage };
lib/workshops/workshopDatabase.ts:2471:    const materializedCommentRows = materializedCommentResults.map((materializedCommentResult) => ({
lib/workshops/workshopDatabase.ts:2472:        ...materializedCommentResult.commentRow,
lib/workshops/workshopDatabase.ts:2473:        body: materializedCommentResult.bodyMarkdown ?? materializedCommentResult.commentRow.body,
lib/workshops/workshopDatabase.ts:2482:            contentBlocks: materializedContentBlocks,
lib/workshops/workshopDatabase.ts:2491:                materializedCommentRows.map((row) =>
lib/workshops/workshopPaidMembersContent.test.ts:7:        id: 'material-1',
lib/workshops/workshopPaidMembersContent.test.ts:9:        bodyMarkdown: '[Materiál](https://ptbk.io/material-abc123)',
lib/workshops/workshopPaidMembersContent.test.ts:22:const FREE_CONTENT_BLOCK = createContentBlock({ id: 'material-free', title: 'Podklady z workshopu' });
lib/workshops/workshopPaidMembersContent.test.ts:24:    id: 'material-paid',
lib/workshops/workshopPaidMembersContent.test.ts:29:describe('the materials one member of a room is given', () => {
lib/workshops/workshopPaidMembersContent.test.ts:30:    it('hands a paid member every material and names none of them as locked', () => {
lib/workshops/workshopPaidMembersContent.test.ts:40:    it('withholds a paid material from everybody else while naming it as a teaser', () => {
lib/workshops/workshopPaidMembersContent.test.ts:48:            { id: 'material-paid', title: 'Bonusové podklady' },
lib/workshops/workshopPaidMembersContent.test.ts:52:    it('lets nothing of a withheld material but its title leave the room', () => {
lib/workshops/workshopPaidMembersContent.test.ts:61:    it('hides a paid material without naming it in a room which offers no membership at all', () => {
lib/workshops/workshopPaidMembersContent.test.ts:71:    it('keeps the order the materials were read in', () => {
lib/workshops/workshopPaidMembersContent.test.ts:73:            id: 'material-paid-2',
lib/workshops/workshopMigration.test.ts:64:    'migrations/2026-08-1700-online-workshop-shortcode-material-links.sql',
lib/workshops/workshopMigration.test.ts:246:    it('stores trusted moderation, active time, and material link clicks in the final migration', () => {
lib/workshops/workshopMigration.test.ts:618:    it('selects one ordinary follow-up material and keeps feedback private and attributable', () => {
lib/workshops/workshopMigration.test.ts:639:    it('marks a material as one which only paid members may see', () => {
lib/workshops/workshopMigration.test.ts:656:    it('routes material analytics through persisted ad hoc short links rather than a participant browser event', () => {
lib/workshops/workshopMigration.test.ts:672:        expect(SHORTCODE_MATERIAL_LINK_MIGRATION_SQL).toContain('material_shortcode_link.shortcode_link_id');
lib/workshops/workshopTypes.ts:280:     * The one ordinary material selected to lead the post-workshop follow-up.
lib/workshops/workshopTypes.ts:285:     * Whether this material is reserved for the members who pay for the community membership
lib/workshops/workshopTypes.ts:288:     *       there, so the material itself never reaches a member who has not unlocked it.
lib/workshops/workshopTypes.ts:297: * As much of a withheld material as the member who may not read it is told
lib/workshops/workshopTypes.ts:299: * Note: Nothing but the title of such a material ever leaves the server, so the room names what is waiting behind the
lib/workshops/workshopTypes.ts:483:     * The materials which only paid members may see, named for a member who is not one of them
lib/workshops/workshopTypes.ts:485:     * Note: The materials themselves stay out of `contentBlocks`, so this list is what lets the room say where the
lib/workshops/workshopTypes.ts:486:     *       paid materials are, what they are called and how to unlock them. It is empty for a member who already paid

exec
/bin/zsh -lc "rg --files businesses | rg 'online-workshop|workshop.*room|Room' && sed -n '1,340p' businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.tsx && sed -n '220,540p' lib/workshops/workshopTypes.ts && sed -n '2200,2520p' lib/workshops/workshopDatabase.ts" in /Users/hejny/work/aldaron
 succeeded in 0ms:
businesses/community/membership/communityMembershipRoomApi.ts
businesses/community/membership/CommunityMembershipRoomProvider.tsx
businesses/community/CommunityRoomInvitation.tsx
businesses/online-workshop/_OnlineWorkshopThankYouPage.tsx
businesses/online-workshop/onlineWorkshopMetadata.test.ts
businesses/online-workshop/OnlineWorkshopRegistrationForm.tsx
businesses/online-workshop/onlineWorkshopTestimonials.ts
businesses/online-workshop/_OnlineWorkshopPage.tsx
businesses/online-workshop/config.ts
businesses/online-workshop/onlineWorkshopContent.tsx
businesses/online-workshop/onlineWorkshopTerms.ts
businesses/online-workshop/OnlineWorkshopRegistrationForm.test.tsx
businesses/online-workshop/onlineWorkshopMetadata.ts
businesses/online-workshop/participant/useWorkshopAttendanceTracker.ts
businesses/online-workshop/participant/WorkshopReactions.tsx
businesses/online-workshop/participant/WorkshopChatMessageModeration.tsx
businesses/online-workshop/participant/WorkshopParticipantBadge.tsx
businesses/online-workshop/participant/WorkshopFeedback.tsx
businesses/online-workshop/participant/WorkshopChatThread.tsx
businesses/online-workshop/participant/useWorkshopParticipant.ts
businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx
businesses/online-workshop/participant/WorkshopServerConnectionStatus.tsx
businesses/online-workshop/participant/WorkshopPaidMembersVideoNotice.tsx
businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.tsx
businesses/online-workshop/participant/WorkshopStage.test.tsx
businesses/online-workshop/participant/WorkshopWatchingBadge.test.tsx
businesses/online-workshop/participant/useWorkshopParticipantOfflineSupport.ts
businesses/online-workshop/participant/WorkshopContent.test.tsx
businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker.tsx
businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
businesses/online-workshop/participant/useWorkshopRepositoryProgress.ts
businesses/online-workshop/participant/WorkshopStageComment.tsx
businesses/online-workshop/participant/WorkshopChatComposer.tsx
businesses/online-workshop/participant/useWorkshopParticipant.test.tsx
businesses/online-workshop/participant/WorkshopRepositoryCommitCard.tsx
businesses/online-workshop/participant/workshopRoomBadge.ts
businesses/online-workshop/participant/workshopParticipantStateCache.ts
businesses/online-workshop/participant/useWorkshopReactionAnimations.ts
businesses/online-workshop/participant/WorkshopPolls.tsx
businesses/online-workshop/participant/useWorkshopRepositoryCommitNotification.ts
businesses/online-workshop/participant/WorkshopContent.tsx
businesses/online-workshop/participant/WorkshopWatchingBadge.tsx
businesses/online-workshop/participant/workshopWatchingCountLabel.ts
businesses/online-workshop/participant/workshopParticipantStateCache.test.ts
businesses/online-workshop/participant/WorkshopFeedback.test.tsx
businesses/online-workshop/participant/WorkshopStage.tsx
businesses/online-workshop/participant/WorkshopChat.tsx
businesses/online-workshop/participant/WorkshopChat.test.tsx
businesses/online-workshop/participant/WorkshopCalendarInvitation.test.tsx
businesses/online-workshop/participant/WorkshopConnectionForm.tsx
businesses/online-workshop/participant/workshopParticipantApi.ts
businesses/online-workshop/participant/WorkshopPolls.test.tsx
businesses/online-workshop/participant/WorkshopReactions.test.tsx
businesses/online-workshop/participant/workshopPanelAppearance.ts
businesses/online-workshop/participant/WorkshopWrapUp.tsx
businesses/online-workshop/participant/WorkshopRepositoryCommitNotification.tsx
businesses/online-workshop/participant/WorkshopChatMessage.tsx
businesses/online-workshop/participant/WorkshopCalendarInvitation.tsx
businesses/online-workshop/participant/WorkshopRepositoryGraph.tsx
businesses/online-workshop/participant/workshopWatchingCountLabel.test.ts
businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
businesses/online-workshop/participant/WorkshopParticipantBadge.test.tsx
businesses/online-workshop/participant/WorkshopRepositoryPanel.tsx
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
    readonly timeline: readonly WorkshopAdminTimelinePoint[];
    readonly reactionCounts: readonly WorkshopReactionCount[];
    readonly commentSamples: readonly WorkshopAdminCommentSample[];

    /**
     * Whether every message of the room could be sampled, or the oldest ones had to be left out of a very busy room
     */
    readonly isCommentSampleComplete: boolean;
};

export type WorkshopContentBlock = {
    readonly id: string;
    readonly title: string;
    readonly bodyMarkdown: string;
    readonly unlockAt: string;
    readonly sortOrder: number;
    readonly isPublished: boolean;

    /**
     * The one ordinary material selected to lead the post-workshop follow-up.
     */
    readonly isFollowUp: boolean;

    /**
     * Whether this material is reserved for the members who pay for the community membership
     *
     * Note: A room which offers the membership keeps it out of the state of everybody else and only says that it is
     *       there, so the material itself never reaches a member who has not unlocked it.
     */
    readonly isPaidMembersOnly: boolean;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly linkClickCount: number;
};

/**
 * As much of a withheld material as the member who may not read it is told
 *
 * Note: Nothing but the title of such a material ever leaves the server, so the room names what is waiting behind the
 *       membership without handing over any of it.
 */
export type WorkshopContentPreview = {
    readonly id: string;
    readonly title: string;
};

/**
 * As much of a withheld recording as the member who may not play it is given
 *
 * Note: The recording itself never leaves the server for such a member. Only the teaser an administrator published for
 *       it does, which is what the room shows on the closing stage instead, and which is `null` while none was
 *       published at all.
 */
export type WorkshopPaidMembersVideo = {
    readonly previewYoutubeVideoId: string | null;
};

/**
 * A participant's progressively saved reflection after one workshop.
 *
 * The score creates the record; every written answer is optional and can then arrive independently, so somebody who
 * only answers the first question is still represented faithfully.
 */
export type WorkshopFeedback = {
    readonly rating: number;
    readonly whatWasGood: string | null;
    readonly whatWasBad: string | null;
    readonly note: string | null;
    readonly createdAt: string;
    readonly updatedAt: string;
};

/**
 * The admin-only form of feedback, attributable to its participant and joinable to the private contact projection.
 */
export type WorkshopAdminFeedback = WorkshopFeedback &
    AdminContactJoin & {
        readonly id: string;
        readonly participantId: string;
        readonly fullname: string;
        readonly email: string;
    };

/**
 * Who wrote a message, as far as somebody moderating the room may know them
 *
 * Note: Only a moderator receives this, so an ordinary participant never learns which invisible moderation state the
 *       author of a message carries, nor the identity behind their name.
 */
export type WorkshopCommentAuthor = {
    readonly participantId: string;
    readonly isTrusted: boolean;
    readonly isInteractionBanned: boolean;
    readonly isModerator: boolean;
};

export type WorkshopComment = {
    readonly id: string;
    readonly authorName: string;
    readonly body: string;
    readonly status: WorkshopCommentStatus;
    readonly upvoteCount: number;
    readonly isUpvotedByParticipant: boolean;
    readonly createdAt: string;

    /**
     * Whether a moderator of the room wrote this message, which the whole room sees on it
     */
    readonly isAuthorModerator: boolean;

    /**
     * Whether the administration created this message without a participant
     */
    readonly isArtificial: boolean;

    /**
     * The author as a moderator of the room may act on them, or `null` for everybody else
     */
    readonly moderatedAuthor: WorkshopCommentAuthor | null;

    /**
     * The comment this one answers, or `null` when it opens its own thread
     */
    readonly parentCommentId: string | null;

    /**
     * Whether an admin pinned this message to the top of the chat
     *
     * Note: A room has at most one pinned message, because the pin is remembered by the workshop itself.
     */
    readonly isPinned: boolean;
};

/**
 * A comment together with the answers it received
 *
 * Note: The chat is exactly one level deep, so a reply never carries replies of its own.
 */
export type WorkshopCommentThread = {
    readonly comment: WorkshopComment;
    readonly replies: readonly WorkshopComment[];
};

export type WorkshopReaction = {
    readonly id: string;
    readonly emoji: string;
    readonly createdAt: string;
};

/**
 * The number of times one exact reaction has been sent in a workshop
 *
 * Note: This counts reaction actions, rather than distinct people. A participant who reacts twice therefore adds two
 *       to the total, exactly as the room celebrated two reactions.
 */
export type WorkshopReactionCount = {
    readonly emoji: string;
    readonly count: number;
};

/**
 * One answer a member can choose in a poll. The room only receives aggregate counts and whether its own participant
 * chose this option, never the identities behind any other vote.
 */
export type WorkshopPollOption = {
    readonly id: string;
    readonly label: string;
    readonly sortOrder: number;
    readonly voteCount: number;
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
    readonly id: string;
    readonly authorName: string;
    readonly body: string;
};

export type WorkshopAdminComment = Omit<WorkshopComment, 'isUpvotedByParticipant'> & {
    readonly participantId: string | null;
    readonly realUpvoteCount: number;
    readonly artificialUpvoteCount: number;
    readonly parentComment: WorkshopCommentReference | null;
};

export type WorkshopAdminSnapshot = {
    readonly workshop: WorkshopDetails;
    readonly contentBlocks: readonly WorkshopContentBlock[];
    readonly polls: readonly WorkshopAdminPoll[];

    /**
     * The community polls asked about this room, which a room administering polls of its own never has
     *
): Promise<{ readonly errorMessage: string | null }> {
    const { error } = await supabase
        .from(WORKSHOP_TABLE_NAME)
        .update({ stage_comment_id: stageCommentId })
        .eq('id', workshopId);
    if (error) {
        console.error('Failed to change the comment on a workshop stage:', error.message);
        return { errorMessage: 'Stage comment could not be changed' };
    }

    return { errorMessage: null };
}

export async function loadWorkshopPublicState(
    supabase: SupabaseClient,
    workshopRow: WorkshopRow,
    participant: WorkshopParticipant,
    commentSort: WorkshopCommentSort,
): Promise<LoadedWorkshopPublicState> {
    const contentVisibilityCutoff = new Date().toISOString();
    const workshop = mapWorkshopRow(workshopRow);
    const isWorkshopPast = workshopRow.room_kind === 'workshop' && getWorkshopPhase(workshop) === 'past';

    // Note: The reactions which flew over the stage recently are replayed for somebody entering the room. A room
    //       without that panel therefore does not load them, exactly as it does not count them.
    const isReactionsPanelOffered = isWorkshopPanelOffered(
        workshopRow.room_kind,
        workshopRow.disabled_panels,
        'reactions',
    );
    const roomCapabilities = getWorkshopKindCapabilities(workshopRow.room_kind);
    const isStageOffered = roomCapabilities.isStageOffered;

    // Note: The membership decides which materials a member sees, so the room asks about it before it assembles what
    //       is visible. A room which does not offer the membership has nothing to unlock, and an answer which does
    //       not arrive keeps the paid materials hidden rather than letting them escape.
    let isPaidMember = false;
    if (roomCapabilities.isMembershipOffered) {
        const { membership, errorMessage: membershipErrorMessage } = await loadCommunityMembershipByEmail(
            supabase,
            participant.email,
        );
        if (membershipErrorMessage !== null) {
            console.error('Failed to load the community membership of a workshop participant:', membershipErrorMessage);
        }
        isPaidMember = membership !== null && isPaidCommunityMembershipStatus(membership.status);
    }

    // Note: A moderator is shown every message which waits for a decision, because making that decision is exactly
    //       what they are in the room for. Everybody else only ever sees the messages they wrote themselves.
    const isModerationOffered = isWorkshopParticipantModerating(participant);
    const pendingCommentsQuery = supabase
        .from(WORKSHOP_COMMENT_TABLE_NAME)
        .select(WORKSHOP_COMMENT_COLUMNS)
        .eq('workshop_id', workshopRow.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(MAXIMAL_VISIBLE_PENDING_COMMENT_COUNT);
    const commentsQuery = supabase
        .from(WORKSHOP_COMMENT_TABLE_NAME)
        .select(WORKSHOP_COMMENT_COLUMNS)
        .eq('workshop_id', workshopRow.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(MAXIMAL_VISIBLE_COMMENT_COUNT);
    // Note: A member who does not pay for the membership is never told that a material of the paid ones unlocks next,
    //       because that countdown would promise them something a purchase alone cannot open.
    const nextContentUnlockBaseQuery = supabase
        .from(WORKSHOP_CONTENT_TABLE_NAME)
        .select('unlock_at')
        .eq('workshop_id', workshopRow.id)
        .eq('is_published', true)
        .gt('unlock_at', contentVisibilityCutoff);
    const nextContentUnlockQuery = isPaidMember
        ? nextContentUnlockBaseQuery
        : nextContentUnlockBaseQuery.eq('is_paid_members_only', false);
    // Note: The materials are read as a paid member would read them, whoever is reading the room. Which of them reach
    //       this member and which are only named to them is then decided once, so the room cannot hide a material it
    //       says nothing about or name one it also hands over.
    const visibleContentQuery = supabase
        .from(WORKSHOP_CONTENT_TABLE_NAME)
        .select(WORKSHOP_CONTENT_COLUMNS)
        .eq('workshop_id', workshopRow.id)
        .eq('is_published', true)
        .lte('unlock_at', contentVisibilityCutoff)
        .order('sort_order', { ascending: true })
        .order('unlock_at', { ascending: true });
    const futureFollowUpContentQuery = supabase
        .from(WORKSHOP_CONTENT_TABLE_NAME)
        .select(WORKSHOP_CONTENT_COLUMNS)
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
            ...((pendingCommentsResult.data ?? []) as WorkshopCommentRow[]),
        ],
        pinnedCommentRow,
    );
    const commentIds = commentRows.map(({ id }) => id);
    let upvotedCommentIds = new Set<string>();

    if (commentIds.length > 0) {
        const { data: upvoteRows, error: upvoteError } = await supabase
            .from(WORKSHOP_UPVOTE_TABLE_NAME)
            .select('comment_id')
            .eq('workshop_id', workshopRow.id)
            .eq('participant_id', participant.id)
            .in('comment_id', commentIds);

        if (upvoteError) {
            return { state: null, errorMessage: upvoteError.message };
        }

        upvotedCommentIds = new Set((upvoteRows ?? []).map(({ comment_id }) => comment_id as string));
    }

    const authorByParticipantId = await loadWorkshopCommentAuthors(supabase, workshopRow.id, commentRows);
    const roomContext: WorkshopCommentRoomContext = {
        pinnedCommentId: workshopRow.pinned_comment_id,
        authorByParticipantId,
        isModerationOffered,
    };
    const materializedCommentResults = await Promise.all(
        commentRows.map(async (commentRow) => {
            const author =
                commentRow.participant_id === null
                    ? undefined
                    : authorByParticipantId.get(commentRow.participant_id);
            if (
                !areWorkshopCommentLinksEnabled({
                    isArtificial: commentRow.is_artificial,
                    isAuthorModerator: author?.isModerator ?? false,
                })
            ) {
                return { commentRow, bodyMarkdown: commentRow.body, errorMessage: null };
            }

            return {
                commentRow,
                ...(await materializeWorkshopCommentShortLinks(supabase, {
                    workshopSlug: workshopRow.slug,
                    workshopKind: workshopRow.room_kind,
                    commentId: commentRow.id,
                    bodyMarkdown: commentRow.body,
                })),
            };
        }),
    );
    const commentMaterializationErrorMessage = materializedCommentResults.find(
        (materializedCommentResult) => materializedCommentResult.errorMessage !== null,
    )?.errorMessage;
    if (commentMaterializationErrorMessage !== null && commentMaterializationErrorMessage !== undefined) {
        return { state: null, errorMessage: commentMaterializationErrorMessage };
    }
    const materializedCommentRows = materializedCommentResults.map((materializedCommentResult) => ({
        ...materializedCommentResult.commentRow,
        body: materializedCommentResult.bodyMarkdown ?? materializedCommentResult.commentRow.body,
    }));

    return {
        state: {
            serverTime: new Date().toISOString(),
            workshop: { ...workshop, ...readableVideo },
            participant,
            watchingParticipantCount,
            contentBlocks: materializedContentBlocks,
            nextContentUnlockAt: (nextUnlockResult.data?.unlock_at as string | undefined) ?? null,
            paidMembersOnlyContentPreviews,
            paidMembersOnlyVideo,
            feedback:
                feedbackResult.data === null
                    ? null
                    : mapWorkshopFeedbackRow(feedbackResult.data as WorkshopFeedbackRow),
            comments: sortWorkshopComments(
                materializedCommentRows.map((row) =>
                    mapWorkshopCommentRow(row, upvotedCommentIds.has(row.id), roomContext),
                ),
                commentSort,
            ),
            stageComment: stageCommentResult.comment,
            recentReactions: ((reactionsResult.data ?? []) as WorkshopReactionRow[]).map(mapWorkshopReactionRow),
            reactionCounts: reactionCountsResult.reactionCounts,
            polls: pollsResult.polls,
        },
        errorMessage: null,
    };
}

/**
 * Loads the comments answered by the listed ones, so moderation of a reply sees the question it answers
 *
 * Note: The listed comments are filtered by one moderation status, so an answered comment is almost never among them.
 * Note: Missing context must never take the whole administration down with it, so a failure is reported as no context.
 */
async function loadAnsweredWorkshopComments(
    supabase: SupabaseClient,
    workshopId: string,
    commentRows: readonly WorkshopCommentRow[],
): Promise<ReadonlyMap<string, WorkshopCommentReference>> {
    const answeredCommentIds = Array.from(
        new Set(
            commentRows
                .map((commentRow) => commentRow.parent_comment_id)
                .filter((parentCommentId): parentCommentId is string => parentCommentId !== null),

exec
/bin/zsh -lc "sed -n '1,420p' businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx && sed -n '1,420p' businesses/online-workshop/participant/WorkshopContent.tsx && sed -n '1,260p' businesses/community/CommunityRoomInvitation.tsx && sed -n '1,220p' businesses/community/config.ts && sed -n '1,280p' lib/workshops/workshopKindCapabilities.ts" in /Users/hejny/work/aldaron
 succeeded in 0ms:
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
                    {/*
                      * Note: The community lists the terms and leads a member into the room of each of them, and this
                      *       is the way back out of such a room. It closes the main column rather than competing with
                      *       the stage, because it says where to go next rather than what is happening now.
                      */}
                    {roomCapabilities.isCommunityInvitationOffered && (
                        <CommunityRoomInvitation participantIdentity={state.participant} />
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
'use client';

import { CommunityPaidMembersNotice } from '@/businesses/community/membership/CommunityPaidMembersNotice';
import { useCommunityMembershipPurchaseOffer } from '@/businesses/community/membership/useCommunityMembershipPurchaseOffer';
import { MarkdownContent } from '@/components/markdown-content';
import { PromptbookQrCode } from '@/components/promptbook-qr-code';
import type { WorkshopContentBlock, WorkshopContentPreview } from '@/lib/workshops/workshopTypes';
import { motion, useReducedMotion } from 'framer-motion';
import { Clock3, Crown, ExternalLink, Lock, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
    title = 'Materiály z workshopu',
}: WorkshopContentProps) {
    const isReducedMotionPreferred = useReducedMotion() === true;

    // Note: The purchase is only offered while a gate is configured and the member has not paid yet, which is exactly
    //       when the server keeps the paid materials hidden, so the notice and the hidden materials cannot disagree.
    const membershipPurchaseOffer = useCommunityMembershipPurchaseOffer();
    const isPaidMembersContentNoticeShown =
        paidMembersOnlyContentPreviews.length > 0 && membershipPurchaseOffer !== null;

    if (contentBlocks.length === 0 && nextContentUnlockAt === null && !isPaidMembersContentNoticeShown) {
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
        <section
            aria-labelledby={COMMUNITY_ROOM_INVITATION_TITLE_ID}
            className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5"
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
                        <h2 id={COMMUNITY_ROOM_INVITATION_TITLE_ID} className="mt-1 text-sm font-bold text-white">
                            {CZECH_COMMUNITY_INVITATION_COPY.title}
                        </h2>
                        <p className="mt-1 text-xs leading-5 text-slate-400">
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
        </section>
    );
}
import {
    createParticipantIdentityPath,
    type WorkshopParticipantIdentity,
} from '@/lib/workshops/workshopParticipantLink';

/**
 * Czech community entry point. Future localized routes can reuse the room component while supplying their own path
 * and copy, without changing the stable community room in the database.
 */
export const COMMUNITY_PATH = '/cs/komunita';

/**
 * The public index of creations shared by community members.
 */
export const COMMUNITY_PROJECTS_PATH = `${COMMUNITY_PATH}/projects`;

/**
 * The published calendar of every term the community lists, which a calendar application subscribes to.
 */
export const COMMUNITY_CALENDAR_PATH = `${COMMUNITY_PATH}/calendar.ics`;

/**
 * How a calendar application names this subscription among the calendars of its owner.
 */
export const COMMUNITY_CALENDAR_NAME = 'Termíny akcí Promptbooku';

/**
 * Name of the calendar file itself, which is what a browser downloading it saves.
 */
export const COMMUNITY_CALENDAR_FILE_NAME = 'promptbook-terminy-akci.ics';

/**
 * The persistent room which the community migration creates and protects from being renamed.
 */
export const COMMUNITY_WORKSHOP_SLUG = 'komunita';

/**
 * Community project routes stay below the community workshop API path, which is also where the narrowly scoped
 * community session cookie is sent.
 */
export const COMMUNITY_PROJECTS_API_PATH = `/api/workshops/${COMMUNITY_WORKSHOP_SLUG}/projects`;

/**
 * How the payment gate returns a member to the room, which the room reads to celebrate or to say nothing happened.
 *
 * Note: A returning browser carries the id of the finished checkout, which is what lets the room confirm a payment
 *       against the gate itself rather than believing an address which anybody could type.
 */
export const COMMUNITY_MEMBERSHIP_RESULT_PARAMETER_NAME = 'membership';
export const COMMUNITY_MEMBERSHIP_CHECKOUT_SESSION_PARAMETER_NAME = 'checkoutSession';
export const COMMUNITY_MEMBERSHIP_PAID_RESULT = 'paid';
export const COMMUNITY_MEMBERSHIP_CANCELLED_RESULT = 'cancelled';

/**
 * Internal dashboard for the one community room.
 */
export const COMMUNITY_ADMIN_PATH = '/admin/community';

export function createCommunityProjectPath(projectId: string): string {
    return `${COMMUNITY_PROJECTS_PATH}/${encodeURIComponent(projectId)}`;
}

/**
 * Where the permanent community is entered from another room, carrying the identity that room already verified.
 *
 * Note: This is the other direction of the very same hand-off which leads a member of the community into the room of a
 *       term it lists, see `createWorkshopRoomLink`. Both carry the connected member on, so neither room asks somebody
 *       who is already connected for their name and address a second time.
 */
export function createCommunityRoomLink(participantIdentity: WorkshopParticipantIdentity): string {
    return createParticipantIdentityPath(COMMUNITY_PATH, participantIdentity);
}
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

exec
/bin/zsh -lc "rg -n -C 14 \"CommunityRoomInvitation|WorkshopContent\" businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx && sed -n '1,460p' businesses/online-workshop/participant/WorkshopContent.tsx && sed -n '1,300p' businesses/community/communityContent.ts" in /Users/hejny/work/aldaron
 succeeded in 0ms:
1-'use client';
2-
3:import { CommunityRoomInvitation } from '@/businesses/community/CommunityRoomInvitation';
4-import { CommunityMembershipBadge } from '@/businesses/community/membership/CommunityMembershipBadge';
5-import { CommunityMembershipModal } from '@/businesses/community/membership/CommunityMembershipModal';
6-import { CommunityMembershipRoomProvider } from '@/businesses/community/membership/CommunityMembershipRoomProvider';
7-import { WorkshopCalendarInvitation } from '@/businesses/online-workshop/participant/WorkshopCalendarInvitation';
8-import { WorkshopChat } from '@/businesses/online-workshop/participant/WorkshopChat';
9-import {
10-    WorkshopConnectionForm,
11-    type WorkshopConnectionDetails,
12-} from '@/businesses/online-workshop/participant/WorkshopConnectionForm';
13:import { WorkshopContent } from '@/businesses/online-workshop/participant/WorkshopContent';
14-import { WorkshopParticipantBadge } from '@/businesses/online-workshop/participant/WorkshopParticipantBadge';
15-import { WorkshopPolls } from '@/businesses/online-workshop/participant/WorkshopPolls';
16-import { WorkshopReactions } from '@/businesses/online-workshop/participant/WorkshopReactions';
17-import { WorkshopRepositoryPanel } from '@/businesses/online-workshop/participant/WorkshopRepositoryPanel';
18-import { WorkshopStage } from '@/businesses/online-workshop/participant/WorkshopStage';
19-import { WorkshopServerConnectionStatus } from '@/businesses/online-workshop/participant/WorkshopServerConnectionStatus';
20-import { WorkshopWatchingBadge } from '@/businesses/online-workshop/participant/WorkshopWatchingBadge';
21-import { useWorkshopParticipantOfflineSupport } from '@/businesses/online-workshop/participant/useWorkshopParticipantOfflineSupport';
22-import { useWorkshopParticipant } from '@/businesses/online-workshop/participant/useWorkshopParticipant';
23-import { useWorkshopRepositoryProgress } from '@/businesses/online-workshop/participant/useWorkshopRepositoryProgress';
24-import { WorkshopLinksPanel } from '@/components/workshops/WorkshopLinksPanel';
25-import { getWorkshopKindCapabilities, isWorkshopPollVisibleInRoom } from '@/lib/workshops/workshopKindCapabilities';
26-import { isWorkshopParticipantModerating } from '@/lib/workshops/workshopModeration';
27-import { isWorkshopPanelOffered, type WorkshopPanelKey } from '@/lib/workshops/workshopPanels';
--
358-                    {isPanelOffered('reactions') && (
359-                        <WorkshopReactions
360-                            emojis={state.workshop.allowedReactions}
361-                            reactionCounts={state.reactionCounts}
362-                            isInteractionBanned={state.participant.isInteractionBanned}
363-                            onReact={controller.react}
364-                        />
365-                    )}
366-                    {/*
367-                      * Note: The community lists the terms and leads a member into the room of each of them, and this
368-                      *       is the way back out of such a room. It closes the main column rather than competing with
369-                      *       the stage, because it says where to go next rather than what is happening now.
370-                      */}
371-                    {roomCapabilities.isCommunityInvitationOffered && (
372:                        <CommunityRoomInvitation participantIdentity={state.participant} />
373-                    )}
374-                </div>
375-
376-                <WorkshopChat
377-                    className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1"
378-                    comments={state.comments}
379-                    commentSort={controller.commentSort}
380-                    isEnabled={isPanelOffered('chat')}
381-                    isInteractionBanned={state.participant.isInteractionBanned}
382-                    isModerating={isModerating}
383-                    onChangeSort={controller.changeCommentSort}
384-                    onSubmitComment={controller.submitComment}
385-                    onUpvoteComment={controller.upvoteComment}
386-                    onModerateComment={controller.moderateComment}
387-                    onModerateAuthor={controller.moderateAuthor}
388-                />
389-
390-                {isMaterialsShown && (
391-                    <div className="min-w-0 lg:col-start-1 lg:row-start-2">
392:                        <WorkshopContent
393-                            contentBlocks={state.contentBlocks}
394-                            nextContentUnlockAt={state.nextContentUnlockAt}
395-                            newlyUnlockedContentBlockIds={controller.newlyUnlockedContentBlockIds}
396-                            paidMembersOnlyContentPreviews={state.paidMembersOnlyContentPreviews}
397-                            title={materialsTitle}
398-                        />
399-                    </div>
400-                )}
401-            </main>
402-        </div>
403-    );
404-
405-    /*
406-     * Note: The membership of a member is one membership wherever they read it from, and every surface of the room
'use client';

import { CommunityPaidMembersNotice } from '@/businesses/community/membership/CommunityPaidMembersNotice';
import { useCommunityMembershipPurchaseOffer } from '@/businesses/community/membership/useCommunityMembershipPurchaseOffer';
import { MarkdownContent } from '@/components/markdown-content';
import { PromptbookQrCode } from '@/components/promptbook-qr-code';
import type { WorkshopContentBlock, WorkshopContentPreview } from '@/lib/workshops/workshopTypes';
import { motion, useReducedMotion } from 'framer-motion';
import { Clock3, Crown, ExternalLink, Lock, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
    title = 'Materiály z workshopu',
}: WorkshopContentProps) {
    const isReducedMotionPreferred = useReducedMotion() === true;

    // Note: The purchase is only offered while a gate is configured and the member has not paid yet, which is exactly
    //       when the server keeps the paid materials hidden, so the notice and the hidden materials cannot disagree.
    const membershipPurchaseOffer = useCommunityMembershipPurchaseOffer();
    const isPaidMembersContentNoticeShown =
        paidMembersOnlyContentPreviews.length > 0 && membershipPurchaseOffer !== null;

    if (contentBlocks.length === 0 && nextContentUnlockAt === null && !isPaidMembersContentNoticeShown) {
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
import { COMMUNITY_CALENDAR_PATH } from '@/businesses/community/config';
import type { WorkshopConnectionDetails } from '@/businesses/online-workshop/participant/WorkshopConnectionForm';
import { createAbsoluteUrl } from '@/lib/metadata/site-config';
import type { WorkshopDetails } from '@/lib/workshops/workshopTypes';

/**
 * What the door of the community says, wherever it is offered
 *
 * Note: The connection form of the community and the invitation which leads to it from another room are the same door,
 *       so they say the same words rather than two variations of them.
 */
const CZECH_COMMUNITY_ENTRY_LABEL = 'Vstoupit do komunity';

/**
 * Keeps Czech community copy beside the Czech route. A future English route can provide its own factory without
 * duplicating the room mechanics or tying a translation to a database row.
 */
export function createCzechCommunityConnectionDetails(community: WorkshopDetails): WorkshopConnectionDetails {
    return {
        title: community.title,
        description: community.description,
        dateLabel: 'Kdykoli online',
        durationLabel: 'Stálý přístup',
        roomLabel: 'Komunita Promptbooku',
        connectionHeading: 'Připojit se do komunity',
        connectionDescription: 'Jméno se zobrazí u vašich komentářů. E-mail ostatní členové komunity neuvidí.',
        submitLabel: CZECH_COMMUNITY_ENTRY_LABEL,
        language: 'cs',
    };
}

/**
 * How the permanent community names its own sections
 *
 * Note: Every section of the community is named exactly once here, so an invitation into the community from elsewhere
 *       promises what is waiting there under the very name it carries once a member arrives.
 */
export const CZECH_COMMUNITY_ROOM_COPY = {
    roomSubtitle: 'Komunita Promptbooku',
    materialsTitle: 'Materiály komunity',
    projectsTitle: 'Projekty komunity',
    unavailableConnectionMessage: 'Připojení ke komunitě se nepodařilo ověřit.',
} as const;

export const CZECH_COMMUNITY_WORKSHOP_NAVIGATION_COPY = {
    title: 'Termíny akcí Promptbooku',
    description:
        'Vyberte si termín v kalendáři nebo v kartách. Odkaz vás vezme přímo do místnosti workshopu se stejnými údaji, u placených akcí na jejich stránku.',
    emptyMessage: 'Zatím není publikovaný žádný termín. Další sem přidáme hned po zveřejnění.',
    locale: 'cs-CZ',
    timeZone: 'Europe/Prague',
    calendarFeedUrl: createAbsoluteUrl(COMMUNITY_CALENDAR_PATH),
} as const;

/**
 * How a room which is no community itself invites its participants into the permanent one
 *
 * Note: What waits there is named by the sections of the community room rather than by words written here, so the
 *       invitation can never promise something the community itself calls differently.
 */
export const CZECH_COMMUNITY_INVITATION_COPY = {
    eyebrow: CZECH_COMMUNITY_ROOM_COPY.roomSubtitle,
    title: 'Pokračujte s námi v komunitě',
    description:
        'Workshop jednou skončí, komunita běží pořád. Chat zůstává otevřený, ostatní členové tam sdílejí, na čem pracují, a všechny další termíny najdete na jednom místě.',
    sectionTitles: [
        CZECH_COMMUNITY_ROOM_COPY.projectsTitle,
        CZECH_COMMUNITY_ROOM_COPY.materialsTitle,
        CZECH_COMMUNITY_WORKSHOP_NAVIGATION_COPY.title,
    ],
    linkLabel: CZECH_COMMUNITY_ENTRY_LABEL,
} as const;

codex
The current room already has a reusable community hand-off, but it is rendered in the main column before the separate materials column. I’m checking its existing tests and visual conventions now so the move preserves identity hand-off and paid-material gating.
exec
/bin/zsh -lc "sed -n '1,460p' businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx && sed -n '1,440p' businesses/online-workshop/participant/WorkshopContent.test.tsx && sed -n '1,300p' businesses/online-workshop/participant/OnlineWorkshopSelectedTermRoom.test.tsx && rg -n \"CommunityRoomInvitation|CZECH_COMMUNITY_INVITATION_COPY|community-room-invitation|Pokračujte s námi|Vstoupit do komunity\" --glob '*.{ts,tsx}'" in /Users/hejny/work/aldaron
 succeeded in 0ms:
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

        expect(screen.getByRole('link', { name: /Vstoupit do komunity/ }).getAttribute('href')).toBe(
            '/cs/komunita?email=jana%40example.com&fullname=Jana+Nov%C3%A1kov%C3%A1',
        );
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
/**
 * @vitest-environment jsdom
 */

import { WorkshopContent } from '@/businesses/online-workshop/participant/WorkshopContent';
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
) {
    return render(
        <WorkshopContent
            contentBlocks={contentBlocks}
            nextContentUnlockAt={null}
            newlyUnlockedContentBlockIds={new Set()}
            paidMembersOnlyContentPreviews={paidMembersOnlyContentPreviews}
        />,
    );
}

afterEach(() => {
    cleanup();
    membershipRoomMock.membershipRoom = null;
});

describe('workshop materials', () => {
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
businesses/community/communityContent.ts:12:const CZECH_COMMUNITY_ENTRY_LABEL = 'Vstoupit do komunity';
businesses/community/communityContent.ts:61:export const CZECH_COMMUNITY_INVITATION_COPY = {
businesses/community/communityContent.ts:63:    title: 'Pokračujte s námi v komunitě',
businesses/community/CommunityRoomInvitation.tsx:1:import { CZECH_COMMUNITY_INVITATION_COPY } from '@/businesses/community/communityContent';
businesses/community/CommunityRoomInvitation.tsx:7:const COMMUNITY_ROOM_INVITATION_TITLE_ID = 'community-room-invitation-title';
businesses/community/CommunityRoomInvitation.tsx:9:type CommunityRoomInvitationProps = {
businesses/community/CommunityRoomInvitation.tsx:23:export function CommunityRoomInvitation({ participantIdentity }: CommunityRoomInvitationProps) {
businesses/community/CommunityRoomInvitation.tsx:36:                            {CZECH_COMMUNITY_INVITATION_COPY.eyebrow}
businesses/community/CommunityRoomInvitation.tsx:39:                            {CZECH_COMMUNITY_INVITATION_COPY.title}
businesses/community/CommunityRoomInvitation.tsx:42:                            {CZECH_COMMUNITY_INVITATION_COPY.description}
businesses/community/CommunityRoomInvitation.tsx:45:                            {CZECH_COMMUNITY_INVITATION_COPY.sectionTitles.map((sectionTitle) => (
businesses/community/CommunityRoomInvitation.tsx:60:                    {CZECH_COMMUNITY_INVITATION_COPY.linkLabel}
businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx:380:        expect(screen.getByRole('link', { name: /Vstoupit do komunity/ }).getAttribute('href')).toBe(
businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx:387:        expect(screen.queryByRole('link', { name: /Vstoupit do komunity/ })).toBeNull();
businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx:392:        expect(screen.queryByRole('link', { name: /Vstoupit do komunity/ })).toBeNull();
businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx:3:import { CommunityRoomInvitation } from '@/businesses/community/CommunityRoomInvitation';
businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx:372:                        <CommunityRoomInvitation participantIdentity={state.participant} />

exec
/bin/zsh -lc "sed -n '260,620p' businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx && find prompts/screenshots -maxdepth 1 -type f | rg '2026-09-0090' && ls -lh prompts/screenshots/2026-09-0090-komunita-as-special-material.png && sed -n '1,260p' prompts/2026-09-0090-komunita-as-special-material.md && sed -n '1,220p' changelog/_current-preversion.md" in /Users/hejny/work/aldaron
 exited 1 in 0ms:
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

        expect(screen.getByRole('link', { name: /Vstoupit do komunity/ }).getAttribute('href')).toBe(
            '/cs/komunita?email=jana%40example.com&fullname=Jana+Nov%C3%A1kov%C3%A1',
        );
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

exec
/bin/zsh -lc "if [ -f prompts/screenshots/2026-09-0090-komunita-as-special-material.png ]; then ls -lh prompts/screenshots/2026-09-0090-komunita-as-special-material.png; else echo 'screenshot not present in workspace'; fi
sed -n '1,260p' prompts/2026-09-0090-komunita-as-special-material.md
sed -n '1,260p' changelog/_current-preversion.md" in /Users/hejny/work/aldaron
 succeeded in 0ms:
screenshot not present in workspace
[^] by OpenAI Codex `gpt-5.6-terra` thinking `max` - Implementation in progress

[✨🚌] The link to the community should be shown alongside materials and behave like kinda a special material.

- It should appear alongside the materials as a material for all participants (both paying and non-paying)
- You are working with page `/cs/online-workshop/participant?workshop=`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

![alt text](prompts/screenshots/2026-09-0090-komunita-as-special-material.png)

# Current preversion
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

- Added Playwright end-to-end coverage for the public site without touching `/admin`: the smoke test opens the public landing and information routes, while real `@example.com` submissions cover the footer newsletter, generic and business lead dialogs, qualification flow, podcast subscription, Pavol contact form, online workshop registration, AI Supervize Mini registration and its future-term interest form. The public workshop-room connection is covered too when a published room is available. `npm run test-e2e` runs headlessly, `npm run test-e2e:headed` opens the browser, both terminal shortcuts are available, and every run archives timestamped `.webm` recordings under the git-ignored `tests/e2e/videos/` directory. `npm run delete-test-data` is the separate, deliberate garbage collector: it removes `@example.com` Contact and workshop-participant records through `DATABASE_URL`, letting database cascades remove their dependent workshop activity without deleting data at the end of a test run.

- Added `npm run backup-database` and its terminal shortcut: `pg_dump` now writes the complete PostgreSQL database, including schema and data, as a timestamped custom-format archive under the git-ignored `backups/` directory, using the same server-only `DATABASE_URL` resolution as migrations and leaving no final file when the dump fails. If the PostgreSQL client is missing, the command explains how to install it on Windows, macOS, or Linux.
- Added one shared database migration runner: Node.js startup now applies `_initialize.sql` and then the remaining pending `migrations/*.sql` files in filename order, tracks their immutable names and SHA-256 checksums in `public."Migration"`, and refuses a changed or missing applied file. The same operation is available explicitly as `npm run migrate-database` and from the terminal shortcut, while a PostgreSQL advisory lock and one transaction keep concurrent server starts and failed migrations safe.
- Said the short link itself under "Your shortened link is ready!" in `/admin/shortener`, which until now read out the display text of the created link — most often the domain of the destination — so the result looked like the very address which had just been shortened, and only the QR code and the snippets below it carried the new one. The display text still wraps the short link in the HTML and the Markdown snippet, and copying the result into an application which takes nothing but plain text now hands over the short address instead of that label alone.
- Gave `/admin/shortener` the links it had been creating: every short link there is is now listed with what it leads to, when it was made and whether it greets its visitor with a landing page, is searched for by its shortcode, its destinations or its private note, and is edited or deleted from that very list. Editing keeps the address which has already been handed out and rewrites the destinations, the note and the landing page of a link, so a printed QR code can be pointed somewhere else instead of a second link being made for it; a link of the old Promptbook Studio system is neither retyped nor disowned by being edited here. Until now the page could only ever add one more link and never say which ones existed.

exec
/bin/zsh -lc "sed -n '330,470p' businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx && rg -n \"<WorkshopContent|WorkshopContent\\(\" --glob '*.{ts,tsx}' && rg -n \"CommunityRoomInvitation\" --glob '*.{ts,tsx}' && git log --oneline -12" in /Users/hejny/work/aldaron
 succeeded in 67ms:
lib/workshops/workshopPaidMembersContent.test.ts:5:function createContentBlock(contentBlock: Partial<WorkshopContentBlock>): WorkshopContentBlock {
businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx:3:import { CommunityRoomInvitation } from '@/businesses/community/CommunityRoomInvitation';
businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx:372:                        <CommunityRoomInvitation participantIdentity={state.participant} />
businesses/community/CommunityRoomInvitation.tsx:9:type CommunityRoomInvitationProps = {
businesses/community/CommunityRoomInvitation.tsx:23:export function CommunityRoomInvitation({ participantIdentity }: CommunityRoomInvitationProps) {
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
50906fd Prompts

exec
/bin/zsh -lc "git branch --all --contains HEAD && git log --all --oneline --grep='community.*material\\|material.*community\\|komunit.*materi' -i && git show --stat --oneline HEAD && rg -n \"special material|zvláštní materiál|Pokračujte s námi\" prompts changelog --glob '*.md'" in /Users/hejny/work/aldaron
 succeeded in 130ms:
* main
d3dba4d [✨🥇] Simplify (and unbullshitify) `/cs/komunita/clenstvi`
c5a35d0 [✨🥇] Create `/cs/komunita/clenstvi`
5d57cc0 [✨🥇] Create `/cs/komunita/clenstvi`
deefc13 [✨🐪] Alongside all the materials, show the QR code when showing the desktop version of the workshop participant app or community.
f4a21f8 [✨🐪] The link tracking and tracking of the clicks in materials of the online workshop and community should be done through the shortener.
3c0aa2d Prompts
 .../2026-09-0090-komunita-as-special-material.md    |  6 +++---
 .../2026-09-0100-repository-as-special-material.md  |  7 +++----
 ...2026-09-0110-presentation-as-special-material.md |  6 ++++--
 prompts/2026-09-0120-ai-agent-participants.md       |  9 ---------
 prompts/2026-09-0130-ai-auto-approving-comments.md  | 10 +++++-----
 .../2026-09-0140-upcomming-events-and-comunity.md   | 14 +++++++++-----
 ...-0150-ai-auto-reply-in-workshops-and-komunita.md | 21 ++++++++++++++++++---
 7 files changed, 42 insertions(+), 31 deletions(-)
prompts/2026-09-0100-repository-as-special-material.md:3:[✨🧽] Linked repository should appear alongside the materials as a kind of special material.
prompts/2026-09-0090-komunita-as-special-material.md:3:[✨🚌] The link to the community should be shown alongside materials and behave like kinda a special material.

exec
/bin/zsh -lc "sed -n '1,200p' prompts/2026-09-0100-repository-as-special-material.md && sed -n '1,200p' prompts/2026-09-0110-presentation-as-special-material.md && rg -n \"special material\" prompts -g '*.md'" in /Users/hejny/work/aldaron
 succeeded in 0ms:
[ ]

[✨🧽] Linked repository should appear alongside the materials as a kind of special material.

- It should appear alongside the materials as a material for all participants (both paying and non-paying)
- You are working with page `/cs/online-workshop/participant?workshop=`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

![alt text](prompts/screenshots/2026-09-0100-repository-as-special-material.png)
![alt text](prompts/screenshots/2026-09-0100-repository-as-special-material-1.png)
[ ]

[✨💻] Add option to link presentation of the workshop

- Presentation is a similar concept to a connected repository or workshop video.
- The presentation should appear alongside the materials as a material for all participants (both paying and non-paying)
- Presentation can be both a PDF, PPT or link to the GitHub Markdown. 
- You are working with page `/cs/online-workshop/participant?workshop=`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

![alt text](prompts/screenshots/2026-09-0110-presentation-as-special-material.png)prompts/2026-09-0100-repository-as-special-material.md:3:[✨🧽] Linked repository should appear alongside the materials as a kind of special material.
prompts/2026-09-0090-komunita-as-special-material.md:3:[✨🚌] The link to the community should be shown alongside materials and behave like kinda a special material.

exec
/bin/zsh -lc "git ls-tree -r HEAD --name-only | rg '2026-09-0090|2026-09-0100|screenshots' | head -n 80 && rg -n \"material\" businesses/online-workshop/participant/workshopPanelAppearance.ts components/workshops --glob '*.{ts,tsx}' && sed -n '1,260p' businesses/online-workshop/participant/workshopPanelAppearance.ts" in /Users/hejny/work/aldaron
 exited 1 in 0ms:
migrations/2026-09-0100-discount-code-wildcards.sql
prompts/2026-09-0090-komunita-as-special-material.md
prompts/2026-09-0100-repository-as-special-material.md
prompts/prompts/screenshots/2026-04-0050-ai-supervize-mini-1.png
prompts/prompts/screenshots/2026-04-0050-ai-supervize-mini-2.png
prompts/prompts/screenshots/2026-04-0050-ai-supervize-mini-3.png
prompts/prompts/screenshots/2026-04-0050-ai-supervize-mini-4.png
prompts/prompts/screenshots/2026-04-0050-ai-supervize-mini.png
prompts/prompts/screenshots/2026-04-0060-scrolling-terminal.png
prompts/prompts/screenshots/2026-04-0070-pavol-hejny-page-1.png
prompts/prompts/screenshots/2026-04-0070-pavol-hejny-page-2.png
prompts/prompts/screenshots/2026-04-0070-pavol-hejny-page-3.png
prompts/prompts/screenshots/2026-04-0070-pavol-hejny-page-4.png
prompts/prompts/screenshots/2026-04-0070-pavol-hejny-page-5.png
prompts/prompts/screenshots/2026-04-0070-pavol-hejny-page-6.png
prompts/prompts/screenshots/2026-04-0070-pavol-hejny-page-7.png
prompts/prompts/screenshots/2026-04-0070-pavol-hejny-page-8.png
prompts/prompts/screenshots/2026-04-0070-pavol-hejny-page-9.png
prompts/prompts/screenshots/2026-04-0070-pavol-hejny-page.png
prompts/prompts/screenshots/2026-07-0020-better-og-and-meta.png
prompts/prompts/screenshots/2026-07-0030-contact-filters.png
prompts/prompts/screenshots/2026-07-0040-workshop-participant-page-1.png
prompts/prompts/screenshots/2026-07-0040-workshop-participant-page-2.png
prompts/prompts/screenshots/2026-07-0040-workshop-participant-page-3.png
prompts/prompts/screenshots/2026-07-0040-workshop-participant-page-4.png
prompts/prompts/screenshots/2026-07-0040-workshop-participant-page.png
prompts/prompts/screenshots/2026-08-0020-privacy-policy-1.png
prompts/prompts/screenshots/2026-08-0020-privacy-policy.png
prompts/prompts/screenshots/2026-08-0030-fix-newsletter.png
prompts/prompts/screenshots/2026-08-0050-online-workshop-wrap-up-and-feedback-1.png
prompts/prompts/screenshots/2026-08-0050-online-workshop-wrap-up-and-feedback.png
prompts/prompts/screenshots/2026-08-0080-online-workshop-trusted-and-moderator.png
prompts/prompts/screenshots/2026-08-0120-online-workshop-admin-prehled-1.png
prompts/prompts/screenshots/2026-08-0120-online-workshop-admin-prehled.png
prompts/prompts/screenshots/2026-08-0130-online-workshop-link-tracking-and-QR-1.png
prompts/prompts/screenshots/2026-08-0130-online-workshop-link-tracking-and-QR-2.png
prompts/prompts/screenshots/2026-08-0130-online-workshop-link-tracking-and-QR.png
prompts/prompts/screenshots/2026-08-0140-online-workshop-video-subtitles-1.png
prompts/prompts/screenshots/2026-08-0140-online-workshop-video-subtitles.png
prompts/prompts/screenshots/2026-08-0150-komunita-1.png
prompts/prompts/screenshots/2026-08-0150-komunita.png
prompts/prompts/screenshots/2026-08-0160-shortener.png
prompts/prompts/screenshots/2026-08-0170-join-contacts-1.png
prompts/prompts/screenshots/2026-08-0170-join-contacts-2.png
prompts/prompts/screenshots/2026-08-0170-join-contacts-3.png
prompts/prompts/screenshots/2026-08-0170-join-contacts.png
prompts/prompts/screenshots/2026-08-0220-admin-menu-1.png
prompts/prompts/screenshots/2026-08-0220-admin-menu.png
prompts/prompts/screenshots/2026-08-0230-admin-login-1.png
prompts/prompts/screenshots/2026-08-0230-admin-login-2.png
prompts/prompts/screenshots/2026-08-0230-admin-login.png
prompts/prompts/screenshots/2026-08-0260-comunity-poling-1.png
prompts/prompts/screenshots/2026-08-0260-comunity-poling.png
prompts/prompts/screenshots/2026-08-0290-ai-supervize-mini-full.png
prompts/prompts/screenshots/2026-08-0342-komunita-clenstvi-in-app-payment-gate-1.png
prompts/prompts/screenshots/2026-08-0342-komunita-clenstvi-in-app-payment-gate-2.png
prompts/prompts/screenshots/2026-08-0342-komunita-clenstvi-in-app-payment-gate-3.png
prompts/prompts/screenshots/2026-08-0342-komunita-clenstvi-in-app-payment-gate-4.png
prompts/prompts/screenshots/2026-08-0342-komunita-clenstvi-in-app-payment-gate-5.png
prompts/prompts/screenshots/2026-08-0342-komunita-clenstvi-in-app-payment-gate-6.png
prompts/prompts/screenshots/2026-08-0342-komunita-clenstvi-in-app-payment-gate-7.png
prompts/prompts/screenshots/2026-08-0342-komunita-clenstvi-in-app-payment-gate-8.png
prompts/prompts/screenshots/2026-08-0342-komunita-clenstvi-in-app-payment-gate.png
prompts/prompts/screenshots/2026-08-0360-qr-code-number-of-clicks.png
prompts/prompts/screenshots/2026-08-0380-lot-of-workshops-1.png
prompts/prompts/screenshots/2026-08-0380-lot-of-workshops.png
prompts/prompts/screenshots/2026-08-0530-ai-ta-krajta-1.png
prompts/prompts/screenshots/2026-08-0530-ai-ta-krajta-10.png
prompts/prompts/screenshots/2026-08-0530-ai-ta-krajta-11.png
prompts/prompts/screenshots/2026-08-0530-ai-ta-krajta-12.png
prompts/prompts/screenshots/2026-08-0530-ai-ta-krajta-13.png
prompts/prompts/screenshots/2026-08-0530-ai-ta-krajta-14.png
prompts/prompts/screenshots/2026-08-0530-ai-ta-krajta-15.png
prompts/prompts/screenshots/2026-08-0530-ai-ta-krajta-16.png
prompts/prompts/screenshots/2026-08-0530-ai-ta-krajta-2.png
prompts/prompts/screenshots/2026-08-0530-ai-ta-krajta-3.png
prompts/prompts/screenshots/2026-08-0530-ai-ta-krajta-4.png
prompts/prompts/screenshots/2026-08-0530-ai-ta-krajta-5.png
prompts/prompts/screenshots/2026-08-0530-ai-ta-krajta-6.png
prompts/prompts/screenshots/2026-08-0530-ai-ta-krajta-7.png

codex
Analysis complete: the community card is already available to every workshop participant and already carries the verified name/e-mail safely, but it sits outside `WorkshopContent`. I’ll move it through a generic “special materials” slot, so the material list remains the single layout owner and future special materials can use the same extension point.
apply patch
patch: completed
/Users/hejny/work/aldaron/businesses/community/CommunityRoomInvitation.tsx
/Users/hejny/work/aldaron/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
/Users/hejny/work/aldaron/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
/Users/hejny/work/aldaron/businesses/online-workshop/participant/WorkshopContent.test.tsx
/Users/hejny/work/aldaron/businesses/online-workshop/participant/WorkshopContent.tsx
/Users/hejny/work/aldaron/changelog/_current-preversion.md
diff --git a/businesses/community/CommunityRoomInvitation.tsx b/businesses/community/CommunityRoomInvitation.tsx
index e5c815fadafb69efa4e3fcd4169fbbecf8da6733..a1758b237293bf977b06039d4b9e86fb3535307f
--- a/businesses/community/CommunityRoomInvitation.tsx
+++ b/businesses/community/CommunityRoomInvitation.tsx
@@ -22,9 +22,9 @@
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
@@ -35,10 +35,10 @@
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
@@ -61,6 +61,6 @@
                     <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                 </Link>
             </div>
-        </section>
+        </article>
     );
 }
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
index c526df583d0fbb3da587f49d1362252befc3705c..5684eb96398f064bad79e53b14f72b4b850c94b5
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
@@ -377,9 +377,31 @@
     it('leads from a workshop into the permanent community with that very same identity', () => {
         renderParticipantRoom(WORKSHOP);
 
-        expect(screen.getByRole('link', { name: /Vstoupit do komunity/ }).getAttribute('href')).toBe(
+        const communityLink = screen.getByRole('link', { name: /Vstoupit do komunity/ });
+        const materialsSection = screen.getByRole('heading', { name: 'Materiály z workshopu' }).closest('section');
+
+        expect(communityLink.getAttribute('href')).toBe(
             '/cs/komunita?email=jana%40example.com&fullname=Jana+Nov%C3%A1kov%C3%A1',
         );
+        expect(materialsSection).toContainElement(communityLink);
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
index 54dc309fddc99b5dd029d05c9b08ba06f9eabb39..82bd5e1d0309dc4a7351be84301f542c2b40077c
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
@@ -229,6 +229,14 @@
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
@@ -363,14 +371,6 @@
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
@@ -394,6 +394,7 @@
                             nextContentUnlockAt={state.nextContentUnlockAt}
                             newlyUnlockedContentBlockIds={controller.newlyUnlockedContentBlockIds}
                             paidMembersOnlyContentPreviews={state.paidMembersOnlyContentPreviews}
+                            specialMaterials={specialMaterials}
                             title={materialsTitle}
                         />
                     </div>
diff --git a/businesses/online-workshop/participant/WorkshopContent.test.tsx b/businesses/online-workshop/participant/WorkshopContent.test.tsx
index 168112cd9529653a66e6f9de60457a4a09f0f3d0..15ad5693080165f3c0be4ccdcf3f8c2156b95ba3
--- a/businesses/online-workshop/participant/WorkshopContent.test.tsx
+++ b/businesses/online-workshop/participant/WorkshopContent.test.tsx
@@ -5,6 +5,7 @@
 import { WorkshopContent } from '@/businesses/online-workshop/participant/WorkshopContent';
 import type { CommunityMembershipRoomState } from '@/lib/community-membership/communityMembershipTypes';
 import type { WorkshopContentBlock, WorkshopContentPreview } from '@/lib/workshops/workshopTypes';
+import type { WorkshopSpecialMaterial } from '@/businesses/online-workshop/participant/WorkshopContent';
 import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
 import { afterEach, describe, expect, it, vi } from 'vitest';
 
@@ -76,6 +77,7 @@
 function renderWorkshopContent(
     contentBlocks: readonly WorkshopContentBlock[],
     paidMembersOnlyContentPreviews: readonly WorkshopContentPreview[] = [],
+    specialMaterials: readonly WorkshopSpecialMaterial[] = [],
 ) {
     return render(
         <WorkshopContent
@@ -83,6 +85,7 @@
             nextContentUnlockAt={null}
             newlyUnlockedContentBlockIds={new Set()}
             paidMembersOnlyContentPreviews={paidMembersOnlyContentPreviews}
+            specialMaterials={specialMaterials}
         />,
     );
 }
@@ -93,6 +96,18 @@
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
index 26c67e3d2040ce103da367540f8f604ba790942f..e484fda33fd54e0783c379775c0e38106889ce14
--- a/businesses/online-workshop/participant/WorkshopContent.tsx
+++ b/businesses/online-workshop/participant/WorkshopContent.tsx
@@ -7,7 +7,19 @@
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
@@ -20,6 +32,14 @@
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
 
@@ -207,6 +227,7 @@
     nextContentUnlockAt,
     newlyUnlockedContentBlockIds,
     paidMembersOnlyContentPreviews,
+    specialMaterials = [],
     title = 'Materiály z workshopu',
 }: WorkshopContentProps) {
     const isReducedMotionPreferred = useReducedMotion() === true;
@@ -216,8 +237,14 @@
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
 
@@ -273,6 +300,10 @@
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
index 7ffe0e93e525b5741a708c2287d2d92aa155cfdb..4ee8fbecc56c2657b616810871a480acd67dcd8f
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

diff --git a/businesses/community/CommunityRoomInvitation.tsx b/businesses/community/CommunityRoomInvitation.tsx
index e5c815fadafb69efa4e3fcd4169fbbecf8da6733..a1758b237293bf977b06039d4b9e86fb3535307f
--- a/businesses/community/CommunityRoomInvitation.tsx
+++ b/businesses/community/CommunityRoomInvitation.tsx
@@ -22,9 +22,9 @@
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
@@ -35,10 +35,10 @@
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
@@ -61,6 +61,6 @@
                     <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                 </Link>
             </div>
-        </section>
+        </article>
     );
 }
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
index c526df583d0fbb3da587f49d1362252befc3705c..5684eb96398f064bad79e53b14f72b4b850c94b5
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
@@ -377,9 +377,31 @@
     it('leads from a workshop into the permanent community with that very same identity', () => {
         renderParticipantRoom(WORKSHOP);
 
-        expect(screen.getByRole('link', { name: /Vstoupit do komunity/ }).getAttribute('href')).toBe(
+        const communityLink = screen.getByRole('link', { name: /Vstoupit do komunity/ });
+        const materialsSection = screen.getByRole('heading', { name: 'Materiály z workshopu' }).closest('section');
+
+        expect(communityLink.getAttribute('href')).toBe(
             '/cs/komunita?email=jana%40example.com&fullname=Jana+Nov%C3%A1kov%C3%A1',
         );
+        expect(materialsSection).toContainElement(communityLink);
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
index 54dc309fddc99b5dd029d05c9b08ba06f9eabb39..82bd5e1d0309dc4a7351be84301f542c2b40077c
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
@@ -229,6 +229,14 @@
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
@@ -363,14 +371,6 @@
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
@@ -394,6 +394,7 @@
                             nextContentUnlockAt={state.nextContentUnlockAt}
                             newlyUnlockedContentBlockIds={controller.newlyUnlockedContentBlockIds}
                             paidMembersOnlyContentPreviews={state.paidMembersOnlyContentPreviews}
+                            specialMaterials={specialMaterials}
                             title={materialsTitle}
                         />
                     </div>
diff --git a/businesses/online-workshop/participant/WorkshopContent.test.tsx b/businesses/online-workshop/participant/WorkshopContent.test.tsx
index 168112cd9529653a66e6f9de60457a4a09f0f3d0..15ad5693080165f3c0be4ccdcf3f8c2156b95ba3
--- a/businesses/online-workshop/participant/WorkshopContent.test.tsx
+++ b/businesses/online-workshop/participant/WorkshopContent.test.tsx
@@ -5,6 +5,7 @@
 import { WorkshopContent } from '@/businesses/online-workshop/participant/WorkshopContent';
 import type { CommunityMembershipRoomState } from '@/lib/community-membership/communityMembershipTypes';
 import type { WorkshopContentBlock, WorkshopContentPreview } from '@/lib/workshops/workshopTypes';
+import type { WorkshopSpecialMaterial } from '@/businesses/online-workshop/participant/WorkshopContent';
 import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
 import { afterEach, describe, expect, it, vi } from 'vitest';
 
@@ -76,6 +77,7 @@
 function renderWorkshopContent(
     contentBlocks: readonly WorkshopContentBlock[],
     paidMembersOnlyContentPreviews: readonly WorkshopContentPreview[] = [],
+    specialMaterials: readonly WorkshopSpecialMaterial[] = [],
 ) {
     return render(
         <WorkshopContent
@@ -83,6 +85,7 @@
             nextContentUnlockAt={null}
             newlyUnlockedContentBlockIds={new Set()}
             paidMembersOnlyContentPreviews={paidMembersOnlyContentPreviews}
+            specialMaterials={specialMaterials}
         />,
     );
 }
@@ -93,6 +96,18 @@
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
index 26c67e3d2040ce103da367540f8f604ba790942f..e484fda33fd54e0783c379775c0e38106889ce14
--- a/businesses/online-workshop/participant/WorkshopContent.tsx
+++ b/businesses/online-workshop/participant/WorkshopContent.tsx
@@ -7,7 +7,19 @@
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
@@ -20,6 +32,14 @@
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
 
@@ -207,6 +227,7 @@
     nextContentUnlockAt,
     newlyUnlockedContentBlockIds,
     paidMembersOnlyContentPreviews,
+    specialMaterials = [],
     title = 'Materiály z workshopu',
 }: WorkshopContentProps) {
     const isReducedMotionPreferred = useReducedMotion() === true;
@@ -216,8 +237,14 @@
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
 
@@ -273,6 +300,10 @@
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
index 7ffe0e93e525b5741a708c2287d2d92aa155cfdb..4ee8fbecc56c2657b616810871a480acd67dcd8f
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
/bin/zsh -lc "git diff --check && git diff -- businesses/online-workshop/participant/WorkshopContent.tsx businesses/community/CommunityRoomInvitation.tsx businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx businesses/online-workshop/participant/WorkshopContent.test.tsx businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx changelog/_current-preversion.md && cat package.json | sed -n '1,180p'" in /Users/hejny/work/aldaron
 exited 2 in 0ms:
prompts/2026-09-0090-komunita-as-special-material.md:12: new blank line at EOF.

diff --git a/businesses/community/CommunityRoomInvitation.tsx b/businesses/community/CommunityRoomInvitation.tsx
index e5c815fadafb69efa4e3fcd4169fbbecf8da6733..a1758b237293bf977b06039d4b9e86fb3535307f
--- a/businesses/community/CommunityRoomInvitation.tsx
+++ b/businesses/community/CommunityRoomInvitation.tsx
@@ -22,9 +22,9 @@
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
@@ -35,10 +35,10 @@
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
@@ -61,6 +61,6 @@
                     <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                 </Link>
             </div>
-        </section>
+        </article>
     );
 }
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
index c526df583d0fbb3da587f49d1362252befc3705c..5684eb96398f064bad79e53b14f72b4b850c94b5
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
@@ -377,9 +377,31 @@
     it('leads from a workshop into the permanent community with that very same identity', () => {
         renderParticipantRoom(WORKSHOP);
 
-        expect(screen.getByRole('link', { name: /Vstoupit do komunity/ }).getAttribute('href')).toBe(
+        const communityLink = screen.getByRole('link', { name: /Vstoupit do komunity/ });
+        const materialsSection = screen.getByRole('heading', { name: 'Materiály z workshopu' }).closest('section');
+
+        expect(communityLink.getAttribute('href')).toBe(
             '/cs/komunita?email=jana%40example.com&fullname=Jana+Nov%C3%A1kov%C3%A1',
         );
+        expect(materialsSection).toContainElement(communityLink);
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
index 54dc309fddc99b5dd029d05c9b08ba06f9eabb39..82bd5e1d0309dc4a7351be84301f542c2b40077c
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
@@ -229,6 +229,14 @@
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
@@ -363,14 +371,6 @@
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
@@ -394,6 +394,7 @@
                             nextContentUnlockAt={state.nextContentUnlockAt}
                             newlyUnlockedContentBlockIds={controller.newlyUnlockedContentBlockIds}
                             paidMembersOnlyContentPreviews={state.paidMembersOnlyContentPreviews}
+                            specialMaterials={specialMaterials}
                             title={materialsTitle}
                         />
                     </div>
diff --git a/businesses/online-workshop/participant/WorkshopContent.test.tsx b/businesses/online-workshop/participant/WorkshopContent.test.tsx
index 168112cd9529653a66e6f9de60457a4a09f0f3d0..15ad5693080165f3c0be4ccdcf3f8c2156b95ba3
--- a/businesses/online-workshop/participant/WorkshopContent.test.tsx
+++ b/businesses/online-workshop/participant/WorkshopContent.test.tsx
@@ -5,6 +5,7 @@
 import { WorkshopContent } from '@/businesses/online-workshop/participant/WorkshopContent';
 import type { CommunityMembershipRoomState } from '@/lib/community-membership/communityMembershipTypes';
 import type { WorkshopContentBlock, WorkshopContentPreview } from '@/lib/workshops/workshopTypes';
+import type { WorkshopSpecialMaterial } from '@/businesses/online-workshop/participant/WorkshopContent';
 import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
 import { afterEach, describe, expect, it, vi } from 'vitest';
 
@@ -76,6 +77,7 @@
 function renderWorkshopContent(
     contentBlocks: readonly WorkshopContentBlock[],
     paidMembersOnlyContentPreviews: readonly WorkshopContentPreview[] = [],
+    specialMaterials: readonly WorkshopSpecialMaterial[] = [],
 ) {
     return render(
         <WorkshopContent
@@ -83,6 +85,7 @@
             nextContentUnlockAt={null}
             newlyUnlockedContentBlockIds={new Set()}
             paidMembersOnlyContentPreviews={paidMembersOnlyContentPreviews}
+            specialMaterials={specialMaterials}
         />,
     );
 }
@@ -93,6 +96,18 @@
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
index 26c67e3d2040ce103da367540f8f604ba790942f..e484fda33fd54e0783c379775c0e38106889ce14
--- a/businesses/online-workshop/participant/WorkshopContent.tsx
+++ b/businesses/online-workshop/participant/WorkshopContent.tsx
@@ -7,7 +7,19 @@
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
@@ -20,6 +32,14 @@
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
 
@@ -207,6 +227,7 @@
     nextContentUnlockAt,
     newlyUnlockedContentBlockIds,
     paidMembersOnlyContentPreviews,
+    specialMaterials = [],
     title = 'Materiály z workshopu',
 }: WorkshopContentProps) {
     const isReducedMotionPreferred = useReducedMotion() === true;
@@ -216,8 +237,14 @@
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
 
@@ -273,6 +300,10 @@
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
index 7ffe0e93e525b5741a708c2287d2d92aa155cfdb..4ee8fbecc56c2657b616810871a480acd67dcd8f
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
/bin/zsh -lc "git diff -- businesses/online-workshop/participant/WorkshopContent.tsx businesses/community/CommunityRoomInvitation.tsx businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx businesses/online-workshop/participant/WorkshopContent.test.tsx businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx changelog/_current-preversion.md
sed -n '1,180p' package.json" in /Users/hejny/work/aldaron
 succeeded in 0ms:
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
index c526df5..5684eb9 100644
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
+        expect(materialsSection).toContainElement(communityLink);
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
index 168112c..15ad569 100644
--- a/businesses/online-workshop/participant/WorkshopContent.test.tsx
+++ b/businesses/online-workshop/participant/WorkshopContent.test.tsx
@@ -5,6 +5,7 @@
 import { WorkshopContent } from '@/businesses/online-workshop/participant/WorkshopContent';
 import type { CommunityMembershipRoomState } from '@/lib/community-membership/communityMembershipTypes';
 import type { WorkshopContentBlock, WorkshopContentPreview } from '@/lib/workshops/workshopTypes';
+import type { WorkshopSpecialMaterial } from '@/businesses/online-workshop/participant/WorkshopContent';
 import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
 import { afterEach, describe, expect, it, vi } from 'vitest';
 
@@ -76,6 +77,7 @@ const PAID_MEMBERS_ONLY_CONTENT_PREVIEWS: readonly WorkshopContentPreview[] = [
 function renderWorkshopContent(
     contentBlocks: readonly WorkshopContentBlock[],
     paidMembersOnlyContentPreviews: readonly WorkshopContentPreview[] = [],
+    specialMaterials: readonly WorkshopSpecialMaterial[] = [],
 ) {
     return render(
         <WorkshopContent
@@ -83,6 +85,7 @@ function renderWorkshopContent(
             nextContentUnlockAt={null}
             newlyUnlockedContentBlockIds={new Set()}
             paidMembersOnlyContentPreviews={paidMembersOnlyContentPreviews}
+            specialMaterials={specialMaterials}
         />,
     );
 }
@@ -93,6 +96,18 @@ afterEach(() => {
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
        "ptbk": "^0.114.0-35",
        "raw-loader": "^4.0.2",
        "tailwindcss": "^3.4.17",
        "tailwindcss-animate": "^1.0.7",
        "tsx": "^4.19.4",
        "typescript": "^5",
        "vitest": "^3.1.1"
    }
}

diff --git a/businesses/community/CommunityRoomInvitation.tsx b/businesses/community/CommunityRoomInvitation.tsx
index e5c815fadafb69efa4e3fcd4169fbbecf8da6733..a1758b237293bf977b06039d4b9e86fb3535307f
--- a/businesses/community/CommunityRoomInvitation.tsx
+++ b/businesses/community/CommunityRoomInvitation.tsx
@@ -22,9 +22,9 @@
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
@@ -35,10 +35,10 @@
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
@@ -61,6 +61,6 @@
                     <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                 </Link>
             </div>
-        </section>
+        </article>
     );
 }
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
index c526df583d0fbb3da587f49d1362252befc3705c..5684eb96398f064bad79e53b14f72b4b850c94b5
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
@@ -377,9 +377,31 @@
     it('leads from a workshop into the permanent community with that very same identity', () => {
         renderParticipantRoom(WORKSHOP);
 
-        expect(screen.getByRole('link', { name: /Vstoupit do komunity/ }).getAttribute('href')).toBe(
+        const communityLink = screen.getByRole('link', { name: /Vstoupit do komunity/ });
+        const materialsSection = screen.getByRole('heading', { name: 'Materiály z workshopu' }).closest('section');
+
+        expect(communityLink.getAttribute('href')).toBe(
             '/cs/komunita?email=jana%40example.com&fullname=Jana+Nov%C3%A1kov%C3%A1',
         );
+        expect(materialsSection).toContainElement(communityLink);
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
index 54dc309fddc99b5dd029d05c9b08ba06f9eabb39..82bd5e1d0309dc4a7351be84301f542c2b40077c
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
@@ -229,6 +229,14 @@
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
@@ -363,14 +371,6 @@
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
@@ -394,6 +394,7 @@
                             nextContentUnlockAt={state.nextContentUnlockAt}
                             newlyUnlockedContentBlockIds={controller.newlyUnlockedContentBlockIds}
                             paidMembersOnlyContentPreviews={state.paidMembersOnlyContentPreviews}
+                            specialMaterials={specialMaterials}
                             title={materialsTitle}
                         />
                     </div>
diff --git a/businesses/online-workshop/participant/WorkshopContent.test.tsx b/businesses/online-workshop/participant/WorkshopContent.test.tsx
index 168112cd9529653a66e6f9de60457a4a09f0f3d0..15ad5693080165f3c0be4ccdcf3f8c2156b95ba3
--- a/businesses/online-workshop/participant/WorkshopContent.test.tsx
+++ b/businesses/online-workshop/participant/WorkshopContent.test.tsx
@@ -5,6 +5,7 @@
 import { WorkshopContent } from '@/businesses/online-workshop/participant/WorkshopContent';
 import type { CommunityMembershipRoomState } from '@/lib/community-membership/communityMembershipTypes';
 import type { WorkshopContentBlock, WorkshopContentPreview } from '@/lib/workshops/workshopTypes';
+import type { WorkshopSpecialMaterial } from '@/businesses/online-workshop/participant/WorkshopContent';
 import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
 import { afterEach, describe, expect, it, vi } from 'vitest';
 
@@ -76,6 +77,7 @@
 function renderWorkshopContent(
     contentBlocks: readonly WorkshopContentBlock[],
     paidMembersOnlyContentPreviews: readonly WorkshopContentPreview[] = [],
+    specialMaterials: readonly WorkshopSpecialMaterial[] = [],
 ) {
     return render(
         <WorkshopContent
@@ -83,6 +85,7 @@
             nextContentUnlockAt={null}
             newlyUnlockedContentBlockIds={new Set()}
             paidMembersOnlyContentPreviews={paidMembersOnlyContentPreviews}
+            specialMaterials={specialMaterials}
         />,
     );
 }
@@ -93,6 +96,18 @@
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
index 26c67e3d2040ce103da367540f8f604ba790942f..e484fda33fd54e0783c379775c0e38106889ce14
--- a/businesses/online-workshop/participant/WorkshopContent.tsx
+++ b/businesses/online-workshop/participant/WorkshopContent.tsx
@@ -7,7 +7,19 @@
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
@@ -20,6 +32,14 @@
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
 
@@ -207,6 +227,7 @@
     nextContentUnlockAt,
     newlyUnlockedContentBlockIds,
     paidMembersOnlyContentPreviews,
+    specialMaterials = [],
     title = 'Materiály z workshopu',
 }: WorkshopContentProps) {
     const isReducedMotionPreferred = useReducedMotion() === true;
@@ -216,8 +237,14 @@
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
 
@@ -273,6 +300,10 @@
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
index 7ffe0e93e525b5741a708c2287d2d92aa155cfdb..4ee8fbecc56c2657b616810871a480acd67dcd8f
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

codex
The implementation now uses the existing identity-preserving invitation as a material-card entry, rather than duplicating a second community link or changing paid-content rules. I’ve added coverage for empty material lists and paid members; I’m running the focused checks next.
exec
/bin/zsh -lc 'npm test -- businesses/online-workshop/participant/WorkshopContent.test.tsx businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx' in /Users/hejny/work/aldaron
 exited 1 in 2508ms:

> promptbook-landing-page@0.1.0 test
> vitest run businesses/online-workshop/participant/WorkshopContent.test.tsx businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx


 RUN  v3.2.4 /Users/hejny/work/aldaron

 ✓ businesses/online-workshop/participant/WorkshopContent.test.tsx (13 tests) 80ms
 ❯ businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx (20 tests | 1 failed) 370ms
   ✓ online workshop participant room > gathers a workshop occurrence around its stage, its reactions, and its watching count 58ms
   ✓ online workshop participant room > leaves a permanent room without the stage, the reactions, and the watching count of a live occurrence 7ms
   ✓ online workshop participant room > shows the project a workshop is about, together with what has been committed in it 20ms
   ✓ online workshop participant room > shows nothing about a project in a room which is about none, and in a room which cannot be about one 11ms
   ✓ online workshop participant room > lets a member vote on a visible community poll attached to a workshop 18ms
   ✓ online workshop participant room > leads from a permanent room to a workshop with the identity the room already verified 13ms
   × online workshop participant room > leads from a workshop into the permanent community with that very same identity 12ms
     → Invalid Chai property: toContainElement
   ✓ online workshop participant room > keeps the community material available to a paying member as well 22ms
   ✓ online workshop participant room > invites nobody into the community from the community itself, nor from a project discussion inside it 6ms
   ✓ online workshop participant room > keeps the chat and the materials of the shared room in a permanent room 5ms
   ✓ online workshop participant room > places room-specific membership information beside the participant badge 3ms
   ✓ online workshop participant room > says in a workshop occurrence which membership its member has and offers the paid one there 50ms
   ✓ online workshop participant room > lets a paying member manage the very same membership from a workshop occurrence 30ms
   ✓ online workshop participant room > shows the one membership of the member in the permanent community room as well 8ms
   ✓ online workshop participant room > asks about no membership in a project discussion, which is opened from the community itself 2ms
   ✓ online workshop participant room > keeps a cached room calm with a compact header status instead of an in-content outage warning 5ms
   ✓ online workshop participant room > names the paid materials and opens the membership offer for a member who has not paid 28ms
   ✓ online workshop participant room > teases the withheld recording of an ended workshop and opens the membership which unlocks it 27ms
   ✓ online workshop participant room > says the recording is for paid members even when no teaser of it was published 13ms
   ✓ online workshop participant room > shows no paid-materials notice to a member whose membership already unlocked them, nor in a room with none 33ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx > online workshop participant room > leads from a workshop into the permanent community with that very same identity
Error: Invalid Chai property: toContainElement
 ❯ businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx:386:32
    384|             '/cs/komunita?email=jana%40example.com&fullname=Jana+Nov%C…
    385|         );
    386|         expect(materialsSection).toContainElement(communityLink);
       |                                ^
    387|         expect(communityLink.closest('article')).not.toBeNull();
    388|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 1 passed (2)
      Tests  1 failed | 32 passed (33)
   Start at  17:08:03
   Duration  1.71s (transform 376ms, setup 0ms, collect 1.07s, tests 450ms, environment 713ms, prepare 108ms)


diff --git a/businesses/community/CommunityRoomInvitation.tsx b/businesses/community/CommunityRoomInvitation.tsx
index e5c815fadafb69efa4e3fcd4169fbbecf8da6733..a1758b237293bf977b06039d4b9e86fb3535307f
--- a/businesses/community/CommunityRoomInvitation.tsx
+++ b/businesses/community/CommunityRoomInvitation.tsx
@@ -22,9 +22,9 @@
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
@@ -35,10 +35,10 @@
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
@@ -61,6 +61,6 @@
                     <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                 </Link>
             </div>
-        </section>
+        </article>
     );
 }
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
index c526df583d0fbb3da587f49d1362252befc3705c..5684eb96398f064bad79e53b14f72b4b850c94b5
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
@@ -377,9 +377,31 @@
     it('leads from a workshop into the permanent community with that very same identity', () => {
         renderParticipantRoom(WORKSHOP);
 
-        expect(screen.getByRole('link', { name: /Vstoupit do komunity/ }).getAttribute('href')).toBe(
+        const communityLink = screen.getByRole('link', { name: /Vstoupit do komunity/ });
+        const materialsSection = screen.getByRole('heading', { name: 'Materiály z workshopu' }).closest('section');
+
+        expect(communityLink.getAttribute('href')).toBe(
             '/cs/komunita?email=jana%40example.com&fullname=Jana+Nov%C3%A1kov%C3%A1',
         );
+        expect(materialsSection).toContainElement(communityLink);
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
index 54dc309fddc99b5dd029d05c9b08ba06f9eabb39..82bd5e1d0309dc4a7351be84301f542c2b40077c
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
@@ -229,6 +229,14 @@
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
@@ -363,14 +371,6 @@
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
@@ -394,6 +394,7 @@
                             nextContentUnlockAt={state.nextContentUnlockAt}
                             newlyUnlockedContentBlockIds={controller.newlyUnlockedContentBlockIds}
                             paidMembersOnlyContentPreviews={state.paidMembersOnlyContentPreviews}
+                            specialMaterials={specialMaterials}
                             title={materialsTitle}
                         />
                     </div>
diff --git a/businesses/online-workshop/participant/WorkshopContent.test.tsx b/businesses/online-workshop/participant/WorkshopContent.test.tsx
index 168112cd9529653a66e6f9de60457a4a09f0f3d0..15ad5693080165f3c0be4ccdcf3f8c2156b95ba3
--- a/businesses/online-workshop/participant/WorkshopContent.test.tsx
+++ b/businesses/online-workshop/participant/WorkshopContent.test.tsx
@@ -5,6 +5,7 @@
 import { WorkshopContent } from '@/businesses/online-workshop/participant/WorkshopContent';
 import type { CommunityMembershipRoomState } from '@/lib/community-membership/communityMembershipTypes';
 import type { WorkshopContentBlock, WorkshopContentPreview } from '@/lib/workshops/workshopTypes';
+import type { WorkshopSpecialMaterial } from '@/businesses/online-workshop/participant/WorkshopContent';
 import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
 import { afterEach, describe, expect, it, vi } from 'vitest';
 
@@ -76,6 +77,7 @@
 function renderWorkshopContent(
     contentBlocks: readonly WorkshopContentBlock[],
     paidMembersOnlyContentPreviews: readonly WorkshopContentPreview[] = [],
+    specialMaterials: readonly WorkshopSpecialMaterial[] = [],
 ) {
     return render(
         <WorkshopContent
@@ -83,6 +85,7 @@
             nextContentUnlockAt={null}
             newlyUnlockedContentBlockIds={new Set()}
             paidMembersOnlyContentPreviews={paidMembersOnlyContentPreviews}
+            specialMaterials={specialMaterials}
         />,
     );
 }
@@ -93,6 +96,18 @@
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
index 26c67e3d2040ce103da367540f8f604ba790942f..e484fda33fd54e0783c379775c0e38106889ce14
--- a/businesses/online-workshop/participant/WorkshopContent.tsx
+++ b/businesses/online-workshop/participant/WorkshopContent.tsx
@@ -7,7 +7,19 @@
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
@@ -20,6 +32,14 @@
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
 
@@ -207,6 +227,7 @@
     nextContentUnlockAt,
     newlyUnlockedContentBlockIds,
     paidMembersOnlyContentPreviews,
+    specialMaterials = [],
     title = 'Materiály z workshopu',
 }: WorkshopContentProps) {
     const isReducedMotionPreferred = useReducedMotion() === true;
@@ -216,8 +237,14 @@
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
 
@@ -273,6 +300,10 @@
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
index 7ffe0e93e525b5741a708c2287d2d92aa155cfdb..4ee8fbecc56c2657b616810871a480acd67dcd8f
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

apply patch
patch: completed
/Users/hejny/work/aldaron/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
/Users/hejny/work/aldaron/businesses/online-workshop/participant/WorkshopContent.test.tsx
diff --git a/businesses/community/CommunityRoomInvitation.tsx b/businesses/community/CommunityRoomInvitation.tsx
index e5c815fadafb69efa4e3fcd4169fbbecf8da6733..a1758b237293bf977b06039d4b9e86fb3535307f
--- a/businesses/community/CommunityRoomInvitation.tsx
+++ b/businesses/community/CommunityRoomInvitation.tsx
@@ -22,9 +22,9 @@
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
@@ -35,10 +35,10 @@
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
@@ -61,6 +61,6 @@
                     <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                 </Link>
             </div>
-        </section>
+        </article>
     );
 }
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
index c526df583d0fbb3da587f49d1362252befc3705c..c8df97e15ec5e8ee846737e95e33682a1303e23d
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
@@ -377,9 +377,31 @@
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
index 54dc309fddc99b5dd029d05c9b08ba06f9eabb39..82bd5e1d0309dc4a7351be84301f542c2b40077c
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
@@ -229,6 +229,14 @@
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
@@ -363,14 +371,6 @@
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
@@ -394,6 +394,7 @@
                             nextContentUnlockAt={state.nextContentUnlockAt}
                             newlyUnlockedContentBlockIds={controller.newlyUnlockedContentBlockIds}
                             paidMembersOnlyContentPreviews={state.paidMembersOnlyContentPreviews}
+                            specialMaterials={specialMaterials}
                             title={materialsTitle}
                         />
                     </div>
diff --git a/businesses/online-workshop/participant/WorkshopContent.test.tsx b/businesses/online-workshop/participant/WorkshopContent.test.tsx
index 168112cd9529653a66e6f9de60457a4a09f0f3d0..b7866e1b85091530124ad0fd8cec49cb630b683d
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
@@ -76,6 +79,7 @@
 function renderWorkshopContent(
     contentBlocks: readonly WorkshopContentBlock[],
     paidMembersOnlyContentPreviews: readonly WorkshopContentPreview[] = [],
+    specialMaterials: readonly WorkshopSpecialMaterial[] = [],
 ) {
     return render(
         <WorkshopContent
@@ -83,6 +87,7 @@
             nextContentUnlockAt={null}
             newlyUnlockedContentBlockIds={new Set()}
             paidMembersOnlyContentPreviews={paidMembersOnlyContentPreviews}
+            specialMaterials={specialMaterials}
         />,
     );
 }
@@ -93,6 +98,18 @@
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
index 26c67e3d2040ce103da367540f8f604ba790942f..e484fda33fd54e0783c379775c0e38106889ce14
--- a/businesses/online-workshop/participant/WorkshopContent.tsx
+++ b/businesses/online-workshop/participant/WorkshopContent.tsx
@@ -7,7 +7,19 @@
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
@@ -20,6 +32,14 @@
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
 
@@ -207,6 +227,7 @@
     nextContentUnlockAt,
     newlyUnlockedContentBlockIds,
     paidMembersOnlyContentPreviews,
+    specialMaterials = [],
     title = 'Materiály z workshopu',
 }: WorkshopContentProps) {
     const isReducedMotionPreferred = useReducedMotion() === true;
@@ -216,8 +237,14 @@
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
 
@@ -273,6 +300,10 @@
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
index 7ffe0e93e525b5741a708c2287d2d92aa155cfdb..4ee8fbecc56c2657b616810871a480acd67dcd8f
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

diff --git a/businesses/community/CommunityRoomInvitation.tsx b/businesses/community/CommunityRoomInvitation.tsx
index e5c815fadafb69efa4e3fcd4169fbbecf8da6733..a1758b237293bf977b06039d4b9e86fb3535307f
--- a/businesses/community/CommunityRoomInvitation.tsx
+++ b/businesses/community/CommunityRoomInvitation.tsx
@@ -22,9 +22,9 @@
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
@@ -35,10 +35,10 @@
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
@@ -61,6 +61,6 @@
                     <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                 </Link>
             </div>
-        </section>
+        </article>
     );
 }
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
index c526df583d0fbb3da587f49d1362252befc3705c..c8df97e15ec5e8ee846737e95e33682a1303e23d
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
@@ -377,9 +377,31 @@
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
index 54dc309fddc99b5dd029d05c9b08ba06f9eabb39..82bd5e1d0309dc4a7351be84301f542c2b40077c
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
@@ -229,6 +229,14 @@
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
@@ -363,14 +371,6 @@
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
@@ -394,6 +394,7 @@
                             nextContentUnlockAt={state.nextContentUnlockAt}
                             newlyUnlockedContentBlockIds={controller.newlyUnlockedContentBlockIds}
                             paidMembersOnlyContentPreviews={state.paidMembersOnlyContentPreviews}
+                            specialMaterials={specialMaterials}
                             title={materialsTitle}
                         />
                     </div>
diff --git a/businesses/online-workshop/participant/WorkshopContent.test.tsx b/businesses/online-workshop/participant/WorkshopContent.test.tsx
index 168112cd9529653a66e6f9de60457a4a09f0f3d0..b7866e1b85091530124ad0fd8cec49cb630b683d
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
@@ -76,6 +79,7 @@
 function renderWorkshopContent(
     contentBlocks: readonly WorkshopContentBlock[],
     paidMembersOnlyContentPreviews: readonly WorkshopContentPreview[] = [],
+    specialMaterials: readonly WorkshopSpecialMaterial[] = [],
 ) {
     return render(
         <WorkshopContent
@@ -83,6 +87,7 @@
             nextContentUnlockAt={null}
             newlyUnlockedContentBlockIds={new Set()}
             paidMembersOnlyContentPreviews={paidMembersOnlyContentPreviews}
+            specialMaterials={specialMaterials}
         />,
     );
 }
@@ -93,6 +98,18 @@
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
index 26c67e3d2040ce103da367540f8f604ba790942f..e484fda33fd54e0783c379775c0e38106889ce14
--- a/businesses/online-workshop/participant/WorkshopContent.tsx
+++ b/businesses/online-workshop/participant/WorkshopContent.tsx
@@ -7,7 +7,19 @@
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
@@ -20,6 +32,14 @@
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
 
@@ -207,6 +227,7 @@
     nextContentUnlockAt,
     newlyUnlockedContentBlockIds,
     paidMembersOnlyContentPreviews,
+    specialMaterials = [],
     title = 'Materiály z workshopu',
 }: WorkshopContentProps) {
     const isReducedMotionPreferred = useReducedMotion() === true;
@@ -216,8 +237,14 @@
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
 
@@ -273,6 +300,10 @@
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
index 7ffe0e93e525b5741a708c2287d2d92aa155cfdb..4ee8fbecc56c2657b616810871a480acd67dcd8f
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
/bin/zsh -lc 'npm test -- businesses/online-workshop/participant/WorkshopContent.test.tsx businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx' in /Users/hejny/work/aldaron
 succeeded in 2084ms:

> promptbook-landing-page@0.1.0 test
> vitest run businesses/online-workshop/participant/WorkshopContent.test.tsx businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx


 RUN  v3.2.4 /Users/hejny/work/aldaron

 ✓ businesses/online-workshop/participant/WorkshopContent.test.tsx (13 tests) 85ms
 ✓ businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx (20 tests) 386ms

 Test Files  2 passed (2)
      Tests  33 passed (33)
   Start at  17:08:17
   Duration  1.51s (transform 369ms, setup 0ms, collect 888ms, tests 471ms, environment 482ms, prepare 76ms)


diff --git a/businesses/community/CommunityRoomInvitation.tsx b/businesses/community/CommunityRoomInvitation.tsx
index e5c815fadafb69efa4e3fcd4169fbbecf8da6733..a1758b237293bf977b06039d4b9e86fb3535307f
--- a/businesses/community/CommunityRoomInvitation.tsx
+++ b/businesses/community/CommunityRoomInvitation.tsx
@@ -22,9 +22,9 @@
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
@@ -35,10 +35,10 @@
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
@@ -61,6 +61,6 @@
                     <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                 </Link>
             </div>
-        </section>
+        </article>
     );
 }
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
index c526df583d0fbb3da587f49d1362252befc3705c..c8df97e15ec5e8ee846737e95e33682a1303e23d
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
@@ -377,9 +377,31 @@
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
index 54dc309fddc99b5dd029d05c9b08ba06f9eabb39..82bd5e1d0309dc4a7351be84301f542c2b40077c
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
@@ -229,6 +229,14 @@
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
@@ -363,14 +371,6 @@
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
@@ -394,6 +394,7 @@
                             nextContentUnlockAt={state.nextContentUnlockAt}
                             newlyUnlockedContentBlockIds={controller.newlyUnlockedContentBlockIds}
                             paidMembersOnlyContentPreviews={state.paidMembersOnlyContentPreviews}
+                            specialMaterials={specialMaterials}
                             title={materialsTitle}
                         />
                     </div>
diff --git a/businesses/online-workshop/participant/WorkshopContent.test.tsx b/businesses/online-workshop/participant/WorkshopContent.test.tsx
index 168112cd9529653a66e6f9de60457a4a09f0f3d0..b7866e1b85091530124ad0fd8cec49cb630b683d
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
@@ -76,6 +79,7 @@
 function renderWorkshopContent(
     contentBlocks: readonly WorkshopContentBlock[],
     paidMembersOnlyContentPreviews: readonly WorkshopContentPreview[] = [],
+    specialMaterials: readonly WorkshopSpecialMaterial[] = [],
 ) {
     return render(
         <WorkshopContent
@@ -83,6 +87,7 @@
             nextContentUnlockAt={null}
             newlyUnlockedContentBlockIds={new Set()}
             paidMembersOnlyContentPreviews={paidMembersOnlyContentPreviews}
+            specialMaterials={specialMaterials}
         />,
     );
 }
@@ -93,6 +98,18 @@
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
index 26c67e3d2040ce103da367540f8f604ba790942f..e484fda33fd54e0783c379775c0e38106889ce14
--- a/businesses/online-workshop/participant/WorkshopContent.tsx
+++ b/businesses/online-workshop/participant/WorkshopContent.tsx
@@ -7,7 +7,19 @@
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
@@ -20,6 +32,14 @@
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
 
@@ -207,6 +227,7 @@
     nextContentUnlockAt,
     newlyUnlockedContentBlockIds,
     paidMembersOnlyContentPreviews,
+    specialMaterials = [],
     title = 'Materiály z workshopu',
 }: WorkshopContentProps) {
     const isReducedMotionPreferred = useReducedMotion() === true;
@@ -216,8 +237,14 @@
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
 
@@ -273,6 +300,10 @@
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
index 7ffe0e93e525b5741a708c2287d2d92aa155cfdb..4ee8fbecc56c2657b616810871a480acd67dcd8f
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
/bin/zsh -lc 'npm run lint' in /Users/hejny/work/aldaron
 succeeded in 1629ms:
✔ No ESLint warnings or errors

diff --git a/businesses/community/CommunityRoomInvitation.tsx b/businesses/community/CommunityRoomInvitation.tsx
index e5c815fadafb69efa4e3fcd4169fbbecf8da6733..a1758b237293bf977b06039d4b9e86fb3535307f
--- a/businesses/community/CommunityRoomInvitation.tsx
+++ b/businesses/community/CommunityRoomInvitation.tsx
@@ -22,9 +22,9 @@
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
@@ -35,10 +35,10 @@
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
@@ -61,6 +61,6 @@
                     <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                 </Link>
             </div>
-        </section>
+        </article>
     );
 }
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
index c526df583d0fbb3da587f49d1362252befc3705c..c8df97e15ec5e8ee846737e95e33682a1303e23d
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
@@ -377,9 +377,31 @@
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
index 54dc309fddc99b5dd029d05c9b08ba06f9eabb39..82bd5e1d0309dc4a7351be84301f542c2b40077c
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
@@ -229,6 +229,14 @@
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
@@ -363,14 +371,6 @@
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
@@ -394,6 +394,7 @@
                             nextContentUnlockAt={state.nextContentUnlockAt}
                             newlyUnlockedContentBlockIds={controller.newlyUnlockedContentBlockIds}
                             paidMembersOnlyContentPreviews={state.paidMembersOnlyContentPreviews}
+                            specialMaterials={specialMaterials}
                             title={materialsTitle}
                         />
                     </div>
diff --git a/businesses/online-workshop/participant/WorkshopContent.test.tsx b/businesses/online-workshop/participant/WorkshopContent.test.tsx
index 168112cd9529653a66e6f9de60457a4a09f0f3d0..b7866e1b85091530124ad0fd8cec49cb630b683d
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
@@ -76,6 +79,7 @@
 function renderWorkshopContent(
     contentBlocks: readonly WorkshopContentBlock[],
     paidMembersOnlyContentPreviews: readonly WorkshopContentPreview[] = [],
+    specialMaterials: readonly WorkshopSpecialMaterial[] = [],
 ) {
     return render(
         <WorkshopContent
@@ -83,6 +87,7 @@
             nextContentUnlockAt={null}
             newlyUnlockedContentBlockIds={new Set()}
             paidMembersOnlyContentPreviews={paidMembersOnlyContentPreviews}
+            specialMaterials={specialMaterials}
         />,
     );
 }
@@ -93,6 +98,18 @@
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
index 26c67e3d2040ce103da367540f8f604ba790942f..e484fda33fd54e0783c379775c0e38106889ce14
--- a/businesses/online-workshop/participant/WorkshopContent.tsx
+++ b/businesses/online-workshop/participant/WorkshopContent.tsx
@@ -7,7 +7,19 @@
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
@@ -20,6 +32,14 @@
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
 
@@ -207,6 +227,7 @@
     nextContentUnlockAt,
     newlyUnlockedContentBlockIds,
     paidMembersOnlyContentPreviews,
+    specialMaterials = [],
     title = 'Materiály z workshopu',
 }: WorkshopContentProps) {
     const isReducedMotionPreferred = useReducedMotion() === true;
@@ -216,8 +237,14 @@
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
 
@@ -273,6 +300,10 @@
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
index 7ffe0e93e525b5741a708c2287d2d92aa155cfdb..4ee8fbecc56c2657b616810871a480acd67dcd8f
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

codex
The focused tests and lint pass. I’m doing the repository’s required build-backed type check now, then I’ll review the final diff for scope and changelog accuracy.
exec
/bin/zsh -lc 'npm run test-types' in /Users/hejny/work/aldaron
diff --git a/businesses/community/CommunityRoomInvitation.tsx b/businesses/community/CommunityRoomInvitation.tsx
index e5c815fadafb69efa4e3fcd4169fbbecf8da6733..a1758b237293bf977b06039d4b9e86fb3535307f
--- a/businesses/community/CommunityRoomInvitation.tsx
+++ b/businesses/community/CommunityRoomInvitation.tsx
@@ -22,9 +22,9 @@
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
@@ -35,10 +35,10 @@
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
@@ -61,6 +61,6 @@
                     <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                 </Link>
             </div>
-        </section>
+        </article>
     );
 }
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
index c526df583d0fbb3da587f49d1362252befc3705c..c8df97e15ec5e8ee846737e95e33682a1303e23d
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
@@ -377,9 +377,31 @@
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
index 54dc309fddc99b5dd029d05c9b08ba06f9eabb39..82bd5e1d0309dc4a7351be84301f542c2b40077c
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
@@ -229,6 +229,14 @@
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
@@ -363,14 +371,6 @@
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
@@ -394,6 +394,7 @@
                             nextContentUnlockAt={state.nextContentUnlockAt}
                             newlyUnlockedContentBlockIds={controller.newlyUnlockedContentBlockIds}
                             paidMembersOnlyContentPreviews={state.paidMembersOnlyContentPreviews}
+                            specialMaterials={specialMaterials}
                             title={materialsTitle}
                         />
                     </div>
diff --git a/businesses/online-workshop/participant/WorkshopContent.test.tsx b/businesses/online-workshop/participant/WorkshopContent.test.tsx
index 168112cd9529653a66e6f9de60457a4a09f0f3d0..b7866e1b85091530124ad0fd8cec49cb630b683d
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
@@ -76,6 +79,7 @@
 function renderWorkshopContent(
     contentBlocks: readonly WorkshopContentBlock[],
     paidMembersOnlyContentPreviews: readonly WorkshopContentPreview[] = [],
+    specialMaterials: readonly WorkshopSpecialMaterial[] = [],
 ) {
     return render(
         <WorkshopContent
@@ -83,6 +87,7 @@
             nextContentUnlockAt={null}
             newlyUnlockedContentBlockIds={new Set()}
             paidMembersOnlyContentPreviews={paidMembersOnlyContentPreviews}
+            specialMaterials={specialMaterials}
         />,
     );
 }
@@ -93,6 +98,18 @@
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
index 26c67e3d2040ce103da367540f8f604ba790942f..e484fda33fd54e0783c379775c0e38106889ce14
--- a/businesses/online-workshop/participant/WorkshopContent.tsx
+++ b/businesses/online-workshop/participant/WorkshopContent.tsx
@@ -7,7 +7,19 @@
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
@@ -20,6 +32,14 @@
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
 
@@ -207,6 +227,7 @@
     nextContentUnlockAt,
     newlyUnlockedContentBlockIds,
     paidMembersOnlyContentPreviews,
+    specialMaterials = [],
     title = 'Materiály z workshopu',
 }: WorkshopContentProps) {
     const isReducedMotionPreferred = useReducedMotion() === true;
@@ -216,8 +237,14 @@
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
 
@@ -273,6 +300,10 @@
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
index 7ffe0e93e525b5741a708c2287d2d92aa155cfdb..4ee8fbecc56c2657b616810871a480acd67dcd8f
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

 succeeded in 32785ms:

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
IntegrationsSection rendered
   Generating static pages (38/78) 
BenefitsSection rendered
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


exec
/bin/zsh -lc 'git diff --check -- businesses/community/CommunityRoomInvitation.tsx businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx businesses/online-workshop/participant/WorkshopContent.tsx businesses/online-workshop/participant/WorkshopContent.test.tsx changelog/_current-preversion.md
git status --short
git diff --stat' in /Users/hejny/work/aldaron
 succeeded in 0ms:
 M businesses/community/CommunityRoomInvitation.tsx
 M businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
 M businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
 M businesses/online-workshop/participant/WorkshopContent.test.tsx
 M businesses/online-workshop/participant/WorkshopContent.tsx
 M changelog/_current-preversion.md
 M prompts/2026-09-0090-komunita-as-special-material.md
 businesses/community/CommunityRoomInvitation.tsx   | 12 ++++----
 .../OnlineWorkshopParticipantPage.test.tsx         | 24 ++++++++++++++-
 .../participant/OnlineWorkshopParticipantPage.tsx  | 17 ++++++-----
 .../participant/WorkshopContent.test.tsx           | 19 +++++++++++-
 .../participant/WorkshopContent.tsx                | 35 ++++++++++++++++++++--
 changelog/_current-preversion.md                   |  6 ++++
 .../2026-09-0090-komunita-as-special-material.md   |  3 +-
 7 files changed, 97 insertions(+), 19 deletions(-)

diff --git a/businesses/community/CommunityRoomInvitation.tsx b/businesses/community/CommunityRoomInvitation.tsx
index e5c815fadafb69efa4e3fcd4169fbbecf8da6733..a1758b237293bf977b06039d4b9e86fb3535307f
--- a/businesses/community/CommunityRoomInvitation.tsx
+++ b/businesses/community/CommunityRoomInvitation.tsx
@@ -22,9 +22,9 @@
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
@@ -35,10 +35,10 @@
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
@@ -61,6 +61,6 @@
                     <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                 </Link>
             </div>
-        </section>
+        </article>
     );
 }
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
index c526df583d0fbb3da587f49d1362252befc3705c..c8df97e15ec5e8ee846737e95e33682a1303e23d
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
@@ -377,9 +377,31 @@
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
index 54dc309fddc99b5dd029d05c9b08ba06f9eabb39..82bd5e1d0309dc4a7351be84301f542c2b40077c
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
@@ -229,6 +229,14 @@
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
@@ -363,14 +371,6 @@
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
@@ -394,6 +394,7 @@
                             nextContentUnlockAt={state.nextContentUnlockAt}
                             newlyUnlockedContentBlockIds={controller.newlyUnlockedContentBlockIds}
                             paidMembersOnlyContentPreviews={state.paidMembersOnlyContentPreviews}
+                            specialMaterials={specialMaterials}
                             title={materialsTitle}
                         />
                     </div>
diff --git a/businesses/online-workshop/participant/WorkshopContent.test.tsx b/businesses/online-workshop/participant/WorkshopContent.test.tsx
index 168112cd9529653a66e6f9de60457a4a09f0f3d0..b7866e1b85091530124ad0fd8cec49cb630b683d
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
@@ -76,6 +79,7 @@
 function renderWorkshopContent(
     contentBlocks: readonly WorkshopContentBlock[],
     paidMembersOnlyContentPreviews: readonly WorkshopContentPreview[] = [],
+    specialMaterials: readonly WorkshopSpecialMaterial[] = [],
 ) {
     return render(
         <WorkshopContent
@@ -83,6 +87,7 @@
             nextContentUnlockAt={null}
             newlyUnlockedContentBlockIds={new Set()}
             paidMembersOnlyContentPreviews={paidMembersOnlyContentPreviews}
+            specialMaterials={specialMaterials}
         />,
     );
 }
@@ -93,6 +98,18 @@
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
index 26c67e3d2040ce103da367540f8f604ba790942f..e484fda33fd54e0783c379775c0e38106889ce14
--- a/businesses/online-workshop/participant/WorkshopContent.tsx
+++ b/businesses/online-workshop/participant/WorkshopContent.tsx
@@ -7,7 +7,19 @@
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
@@ -20,6 +32,14 @@
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
 
@@ -207,6 +227,7 @@
     nextContentUnlockAt,
     newlyUnlockedContentBlockIds,
     paidMembersOnlyContentPreviews,
+    specialMaterials = [],
     title = 'Materiály z workshopu',
 }: WorkshopContentProps) {
     const isReducedMotionPreferred = useReducedMotion() === true;
@@ -216,8 +237,14 @@
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
 
@@ -273,6 +300,10 @@
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
index 7ffe0e93e525b5741a708c2287d2d92aa155cfdb..4ee8fbecc56c2657b616810871a480acd67dcd8f
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

codex
The build-backed type check also passes. I noticed the repository’s route-behavior guide still says this invitation closes the main column, so I’m updating that one rule to match the new materials placement.
apply patch
patch: completed
/Users/hejny/work/aldaron/AGENTS.md
diff --git a/AGENTS.md b/AGENTS.md
index 4035dd562136b38e494b0a2034bff38d357d7ffe..5490191d7ea270f1a59cd3bea90b4a35fec1264e
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -112,10 +112,11 @@
 ### Shared community and workshop behavior
 
 - Rooms lead to each other in both directions, through one identity hand-off. The
-  community lists the terms and opens the room of each; every other room closes
-  its main column with an invitation into the community. Both carry the connected
-  member's name and email on, and an incomplete identity carries nothing rather
-  than half of it. Which rooms invite is answered by
+  community lists the terms and opens the room of each; an invited workshop room
+  places its community link beside its materials as a special material for every
+  participant, regardless of paid membership. Both carry the connected member's
+  name and email on, and an incomplete identity carries nothing rather than half
+  of it. Which rooms invite is answered by
   `lib/workshops/workshopKindCapabilities.ts`; the community and project
   discussions do not. The invitation names the community's sections by the names
   the community itself uses.
diff --git a/businesses/community/CommunityRoomInvitation.tsx b/businesses/community/CommunityRoomInvitation.tsx
index e5c815fadafb69efa4e3fcd4169fbbecf8da6733..a1758b237293bf977b06039d4b9e86fb3535307f
--- a/businesses/community/CommunityRoomInvitation.tsx
+++ b/businesses/community/CommunityRoomInvitation.tsx
@@ -22,9 +22,9 @@
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
@@ -35,10 +35,10 @@
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
@@ -61,6 +61,6 @@
                     <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                 </Link>
             </div>
-        </section>
+        </article>
     );
 }
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
index c526df583d0fbb3da587f49d1362252befc3705c..c8df97e15ec5e8ee846737e95e33682a1303e23d
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
@@ -377,9 +377,31 @@
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
index 54dc309fddc99b5dd029d05c9b08ba06f9eabb39..82bd5e1d0309dc4a7351be84301f542c2b40077c
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
@@ -229,6 +229,14 @@
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
@@ -363,14 +371,6 @@
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
@@ -394,6 +394,7 @@
                             nextContentUnlockAt={state.nextContentUnlockAt}
                             newlyUnlockedContentBlockIds={controller.newlyUnlockedContentBlockIds}
                             paidMembersOnlyContentPreviews={state.paidMembersOnlyContentPreviews}
+                            specialMaterials={specialMaterials}
                             title={materialsTitle}
                         />
                     </div>
diff --git a/businesses/online-workshop/participant/WorkshopContent.test.tsx b/businesses/online-workshop/participant/WorkshopContent.test.tsx
index 168112cd9529653a66e6f9de60457a4a09f0f3d0..b7866e1b85091530124ad0fd8cec49cb630b683d
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
@@ -76,6 +79,7 @@
 function renderWorkshopContent(
     contentBlocks: readonly WorkshopContentBlock[],
     paidMembersOnlyContentPreviews: readonly WorkshopContentPreview[] = [],
+    specialMaterials: readonly WorkshopSpecialMaterial[] = [],
 ) {
     return render(
         <WorkshopContent
@@ -83,6 +87,7 @@
             nextContentUnlockAt={null}
             newlyUnlockedContentBlockIds={new Set()}
             paidMembersOnlyContentPreviews={paidMembersOnlyContentPreviews}
+            specialMaterials={specialMaterials}
         />,
     );
 }
@@ -93,6 +98,18 @@
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
index 26c67e3d2040ce103da367540f8f604ba790942f..e484fda33fd54e0783c379775c0e38106889ce14
--- a/businesses/online-workshop/participant/WorkshopContent.tsx
+++ b/businesses/online-workshop/participant/WorkshopContent.tsx
@@ -7,7 +7,19 @@
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
@@ -20,6 +32,14 @@
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
 
@@ -207,6 +227,7 @@
     nextContentUnlockAt,
     newlyUnlockedContentBlockIds,
     paidMembersOnlyContentPreviews,
+    specialMaterials = [],
     title = 'Materiály z workshopu',
 }: WorkshopContentProps) {
     const isReducedMotionPreferred = useReducedMotion() === true;
@@ -216,8 +237,14 @@
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
 
@@ -273,6 +300,10 @@
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
index 7ffe0e93e525b5741a708c2287d2d92aa155cfdb..4ee8fbecc56c2657b616810871a480acd67dcd8f
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

diff --git a/AGENTS.md b/AGENTS.md
index 4035dd562136b38e494b0a2034bff38d357d7ffe..5490191d7ea270f1a59cd3bea90b4a35fec1264e
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -112,10 +112,11 @@
 ### Shared community and workshop behavior
 
 - Rooms lead to each other in both directions, through one identity hand-off. The
-  community lists the terms and opens the room of each; every other room closes
-  its main column with an invitation into the community. Both carry the connected
-  member's name and email on, and an incomplete identity carries nothing rather
-  than half of it. Which rooms invite is answered by
+  community lists the terms and opens the room of each; an invited workshop room
+  places its community link beside its materials as a special material for every
+  participant, regardless of paid membership. Both carry the connected member's
+  name and email on, and an incomplete identity carries nothing rather than half
+  of it. Which rooms invite is answered by
   `lib/workshops/workshopKindCapabilities.ts`; the community and project
   discussions do not. The invitation names the community's sections by the names
   the community itself uses.
diff --git a/businesses/community/CommunityRoomInvitation.tsx b/businesses/community/CommunityRoomInvitation.tsx
index e5c815fadafb69efa4e3fcd4169fbbecf8da6733..a1758b237293bf977b06039d4b9e86fb3535307f
--- a/businesses/community/CommunityRoomInvitation.tsx
+++ b/businesses/community/CommunityRoomInvitation.tsx
@@ -22,9 +22,9 @@
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
@@ -35,10 +35,10 @@
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
@@ -61,6 +61,6 @@
                     <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                 </Link>
             </div>
-        </section>
+        </article>
     );
 }
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
index c526df583d0fbb3da587f49d1362252befc3705c..c8df97e15ec5e8ee846737e95e33682a1303e23d
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
@@ -377,9 +377,31 @@
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
index 54dc309fddc99b5dd029d05c9b08ba06f9eabb39..82bd5e1d0309dc4a7351be84301f542c2b40077c
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
@@ -229,6 +229,14 @@
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
@@ -363,14 +371,6 @@
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
@@ -394,6 +394,7 @@
                             nextContentUnlockAt={state.nextContentUnlockAt}
                             newlyUnlockedContentBlockIds={controller.newlyUnlockedContentBlockIds}
                             paidMembersOnlyContentPreviews={state.paidMembersOnlyContentPreviews}
+                            specialMaterials={specialMaterials}
                             title={materialsTitle}
                         />
                     </div>
diff --git a/businesses/online-workshop/participant/WorkshopContent.test.tsx b/businesses/online-workshop/participant/WorkshopContent.test.tsx
index 168112cd9529653a66e6f9de60457a4a09f0f3d0..b7866e1b85091530124ad0fd8cec49cb630b683d
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
@@ -76,6 +79,7 @@
 function renderWorkshopContent(
     contentBlocks: readonly WorkshopContentBlock[],
     paidMembersOnlyContentPreviews: readonly WorkshopContentPreview[] = [],
+    specialMaterials: readonly WorkshopSpecialMaterial[] = [],
 ) {
     return render(
         <WorkshopContent
@@ -83,6 +87,7 @@
             nextContentUnlockAt={null}
             newlyUnlockedContentBlockIds={new Set()}
             paidMembersOnlyContentPreviews={paidMembersOnlyContentPreviews}
+            specialMaterials={specialMaterials}
         />,
     );
 }
@@ -93,6 +98,18 @@
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
index 26c67e3d2040ce103da367540f8f604ba790942f..e484fda33fd54e0783c379775c0e38106889ce14
--- a/businesses/online-workshop/participant/WorkshopContent.tsx
+++ b/businesses/online-workshop/participant/WorkshopContent.tsx
@@ -7,7 +7,19 @@
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
@@ -20,6 +32,14 @@
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
 
@@ -207,6 +227,7 @@
     nextContentUnlockAt,
     newlyUnlockedContentBlockIds,
     paidMembersOnlyContentPreviews,
+    specialMaterials = [],
     title = 'Materiály z workshopu',
 }: WorkshopContentProps) {
     const isReducedMotionPreferred = useReducedMotion() === true;
@@ -216,8 +237,14 @@
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
 
@@ -273,6 +300,10 @@
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
index 7ffe0e93e525b5741a708c2287d2d92aa155cfdb..4ee8fbecc56c2657b616810871a480acd67dcd8f
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
/bin/zsh -lc 'git diff --check -- AGENTS.md businesses/community/CommunityRoomInvitation.tsx businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx businesses/online-workshop/participant/WorkshopContent.tsx businesses/online-workshop/participant/WorkshopContent.test.tsx changelog/_current-preversion.md
git diff -- AGENTS.md businesses/community/CommunityRoomInvitation.tsx businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx businesses/online-workshop/participant/WorkshopContent.tsx changelog/_current-preversion.md
git status --short' in /Users/hejny/work/aldaron
 succeeded in 0ms:
diff --git a/AGENTS.md b/AGENTS.md
index 4035dd5..5490191 100644
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -112,10 +112,11 @@ use cases, and audiences. Keep these rules current when behavior changes.
 ### Shared community and workshop behavior
 
 - Rooms lead to each other in both directions, through one identity hand-off. The
-  community lists the terms and opens the room of each; every other room closes
-  its main column with an invitation into the community. Both carry the connected
-  member's name and email on, and an incomplete identity carries nothing rather
-  than half of it. Which rooms invite is answered by
+  community lists the terms and opens the room of each; an invited workshop room
+  places its community link beside its materials as a special material for every
+  participant, regardless of paid membership. Both carry the connected member's
+  name and email on, and an incomplete identity carries nothing rather than half
+  of it. Which rooms invite is answered by
   `lib/workshops/workshopKindCapabilities.ts`; the community and project
   discussions do not. The invitation names the community's sections by the names
   the community itself uses.
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
 M AGENTS.md
 M businesses/community/CommunityRoomInvitation.tsx
 M businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
 M businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
 M businesses/online-workshop/participant/WorkshopContent.test.tsx
 M businesses/online-workshop/participant/WorkshopContent.tsx
 M changelog/_current-preversion.md
 M prompts/2026-09-0090-komunita-as-special-material.md

diff --git a/AGENTS.md b/AGENTS.md
index 4035dd562136b38e494b0a2034bff38d357d7ffe..5490191d7ea270f1a59cd3bea90b4a35fec1264e
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -112,10 +112,11 @@
 ### Shared community and workshop behavior
 
 - Rooms lead to each other in both directions, through one identity hand-off. The
-  community lists the terms and opens the room of each; every other room closes
-  its main column with an invitation into the community. Both carry the connected
-  member's name and email on, and an incomplete identity carries nothing rather
-  than half of it. Which rooms invite is answered by
+  community lists the terms and opens the room of each; an invited workshop room
+  places its community link beside its materials as a special material for every
+  participant, regardless of paid membership. Both carry the connected member's
+  name and email on, and an incomplete identity carries nothing rather than half
+  of it. Which rooms invite is answered by
   `lib/workshops/workshopKindCapabilities.ts`; the community and project
   discussions do not. The invitation names the community's sections by the names
   the community itself uses.
diff --git a/businesses/community/CommunityRoomInvitation.tsx b/businesses/community/CommunityRoomInvitation.tsx
index e5c815fadafb69efa4e3fcd4169fbbecf8da6733..a1758b237293bf977b06039d4b9e86fb3535307f
--- a/businesses/community/CommunityRoomInvitation.tsx
+++ b/businesses/community/CommunityRoomInvitation.tsx
@@ -22,9 +22,9 @@
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
@@ -35,10 +35,10 @@
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
@@ -61,6 +61,6 @@
                     <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                 </Link>
             </div>
-        </section>
+        </article>
     );
 }
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
index c526df583d0fbb3da587f49d1362252befc3705c..c8df97e15ec5e8ee846737e95e33682a1303e23d
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
@@ -377,9 +377,31 @@
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
index 54dc309fddc99b5dd029d05c9b08ba06f9eabb39..82bd5e1d0309dc4a7351be84301f542c2b40077c
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
@@ -229,6 +229,14 @@
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
@@ -363,14 +371,6 @@
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
@@ -394,6 +394,7 @@
                             nextContentUnlockAt={state.nextContentUnlockAt}
                             newlyUnlockedContentBlockIds={controller.newlyUnlockedContentBlockIds}
                             paidMembersOnlyContentPreviews={state.paidMembersOnlyContentPreviews}
+                            specialMaterials={specialMaterials}
                             title={materialsTitle}
                         />
                     </div>
diff --git a/businesses/online-workshop/participant/WorkshopContent.test.tsx b/businesses/online-workshop/participant/WorkshopContent.test.tsx
index 168112cd9529653a66e6f9de60457a4a09f0f3d0..b7866e1b85091530124ad0fd8cec49cb630b683d
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
@@ -76,6 +79,7 @@
 function renderWorkshopContent(
     contentBlocks: readonly WorkshopContentBlock[],
     paidMembersOnlyContentPreviews: readonly WorkshopContentPreview[] = [],
+    specialMaterials: readonly WorkshopSpecialMaterial[] = [],
 ) {
     return render(
         <WorkshopContent
@@ -83,6 +87,7 @@
             nextContentUnlockAt={null}
             newlyUnlockedContentBlockIds={new Set()}
             paidMembersOnlyContentPreviews={paidMembersOnlyContentPreviews}
+            specialMaterials={specialMaterials}
         />,
     );
 }
@@ -93,6 +98,18 @@
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
index 26c67e3d2040ce103da367540f8f604ba790942f..e484fda33fd54e0783c379775c0e38106889ce14
--- a/businesses/online-workshop/participant/WorkshopContent.tsx
+++ b/businesses/online-workshop/participant/WorkshopContent.tsx
@@ -7,7 +7,19 @@
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
@@ -20,6 +32,14 @@
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
 
@@ -207,6 +227,7 @@
     nextContentUnlockAt,
     newlyUnlockedContentBlockIds,
     paidMembersOnlyContentPreviews,
+    specialMaterials = [],
     title = 'Materiály z workshopu',
 }: WorkshopContentProps) {
     const isReducedMotionPreferred = useReducedMotion() === true;
@@ -216,8 +237,14 @@
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
 
@@ -273,6 +300,10 @@
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
index 7ffe0e93e525b5741a708c2287d2d92aa155cfdb..4ee8fbecc56c2657b616810871a480acd67dcd8f
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

codex
Implemented the community link as a special material in the participant room.

- It now appears inside the materials list, including when no ordinary material is unlocked.
- It remains available to both free and paid members and preserves the existing identity hand-off.
- Added a reusable special-material slot in [WorkshopContent.tsx](/Users/hejny/work/aldaron/businesses/online-workshop/participant/WorkshopContent.tsx).
- Updated [changelog](/Users/hejny/work/aldaron/changelog/_current-preversion.md) and the behavior rule in [AGENTS.md](/Users/hejny/work/aldaron/AGENTS.md).

Verified with focused tests (33 passing), `npm run lint`, and `npm run test-types`.
diff --git a/AGENTS.md b/AGENTS.md
index 4035dd562136b38e494b0a2034bff38d357d7ffe..5490191d7ea270f1a59cd3bea90b4a35fec1264e
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -112,10 +112,11 @@
 ### Shared community and workshop behavior
 
 - Rooms lead to each other in both directions, through one identity hand-off. The
-  community lists the terms and opens the room of each; every other room closes
-  its main column with an invitation into the community. Both carry the connected
-  member's name and email on, and an incomplete identity carries nothing rather
-  than half of it. Which rooms invite is answered by
+  community lists the terms and opens the room of each; an invited workshop room
+  places its community link beside its materials as a special material for every
+  participant, regardless of paid membership. Both carry the connected member's
+  name and email on, and an incomplete identity carries nothing rather than half
+  of it. Which rooms invite is answered by
   `lib/workshops/workshopKindCapabilities.ts`; the community and project
   discussions do not. The invitation names the community's sections by the names
   the community itself uses.
diff --git a/businesses/community/CommunityRoomInvitation.tsx b/businesses/community/CommunityRoomInvitation.tsx
index e5c815fadafb69efa4e3fcd4169fbbecf8da6733..a1758b237293bf977b06039d4b9e86fb3535307f
--- a/businesses/community/CommunityRoomInvitation.tsx
+++ b/businesses/community/CommunityRoomInvitation.tsx
@@ -22,9 +22,9 @@
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
@@ -35,10 +35,10 @@
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
@@ -61,6 +61,6 @@
                     <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                 </Link>
             </div>
-        </section>
+        </article>
     );
 }
diff --git a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
index c526df583d0fbb3da587f49d1362252befc3705c..c8df97e15ec5e8ee846737e95e33682a1303e23d
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.test.tsx
@@ -377,9 +377,31 @@
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
index 54dc309fddc99b5dd029d05c9b08ba06f9eabb39..82bd5e1d0309dc4a7351be84301f542c2b40077c
--- a/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
+++ b/businesses/online-workshop/participant/OnlineWorkshopParticipantPage.tsx
@@ -229,6 +229,14 @@
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
@@ -363,14 +371,6 @@
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
@@ -394,6 +394,7 @@
                             nextContentUnlockAt={state.nextContentUnlockAt}
                             newlyUnlockedContentBlockIds={controller.newlyUnlockedContentBlockIds}
                             paidMembersOnlyContentPreviews={state.paidMembersOnlyContentPreviews}
+                            specialMaterials={specialMaterials}
                             title={materialsTitle}
                         />
                     </div>
diff --git a/businesses/online-workshop/participant/WorkshopContent.test.tsx b/businesses/online-workshop/participant/WorkshopContent.test.tsx
index 168112cd9529653a66e6f9de60457a4a09f0f3d0..b7866e1b85091530124ad0fd8cec49cb630b683d
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
@@ -76,6 +79,7 @@
 function renderWorkshopContent(
     contentBlocks: readonly WorkshopContentBlock[],
     paidMembersOnlyContentPreviews: readonly WorkshopContentPreview[] = [],
+    specialMaterials: readonly WorkshopSpecialMaterial[] = [],
 ) {
     return render(
         <WorkshopContent
@@ -83,6 +87,7 @@
             nextContentUnlockAt={null}
             newlyUnlockedContentBlockIds={new Set()}
             paidMembersOnlyContentPreviews={paidMembersOnlyContentPreviews}
+            specialMaterials={specialMaterials}
         />,
     );
 }
@@ -93,6 +98,18 @@
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
index 26c67e3d2040ce103da367540f8f604ba790942f..e484fda33fd54e0783c379775c0e38106889ce14
--- a/businesses/online-workshop/participant/WorkshopContent.tsx
+++ b/businesses/online-workshop/participant/WorkshopContent.tsx
@@ -7,7 +7,19 @@
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
@@ -20,6 +32,14 @@
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
 
@@ -207,6 +227,7 @@
     nextContentUnlockAt,
     newlyUnlockedContentBlockIds,
     paidMembersOnlyContentPreviews,
+    specialMaterials = [],
     title = 'Materiály z workshopu',
 }: WorkshopContentProps) {
     const isReducedMotionPreferred = useReducedMotion() === true;
@@ -216,8 +237,14 @@
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
 
@@ -273,6 +300,10 @@
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
index 7ffe0e93e525b5741a708c2287d2d92aa155cfdb..4ee8fbecc56c2657b616810871a480acd67dcd8f
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

tokens used
126,470
Implemented the community link as a special material in the participant room.

- It now appears inside the materials list, including when no ordinary material is unlocked.
- It remains available to both free and paid members and preserves the existing identity hand-off.
- Added a reusable special-material slot in [WorkshopContent.tsx](/Users/hejny/work/aldaron/businesses/online-workshop/participant/WorkshopContent.tsx).
- Updated [changelog](/Users/hejny/work/aldaron/changelog/_current-preversion.md) and the behavior rule in [AGENTS.md](/Users/hejny/work/aldaron/AGENTS.md).

Verified with focused tests (33 passing), `npm run lint`, and `npm run test-types`.
[1]-  Done                    bash "$1"

=== runner shell finished at 2026-09-14T15:10:14.487Z ===
Status: succeeded

=== test shell started at 2026-09-14T15:10:14.504Z ===
Script path: /Users/hejny/work/aldaron/.promptbook/coder-prompts/2026-09-0090-komunita-as-special-material.test.sh

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
BenefitsSection rendered
IntegrationsSection rendered
   Generating static pages (19/78) 
BenefitsSection rendered
IntegrationsSection rendered
BenefitsSection rendered
   Generating static pages (38/78) 
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

  ✓   1 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs (3.2s)
  ✓   2 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /en (961ms)
  ✓   3 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /pro-mesta (1.4s)
  ✓   4 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /for-agro (1.3s)
  ✓   5 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /for-industry (1.6s)
  ✓   6 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /ai-supervize (1.7s)
  ✓   7 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /ai-supervize-mini (3.6s)
  ✓   8 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /ai-ta-krajta (1.8s)
  ✓   9 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /ai-ta-krajta/media-kit (1.7s)
  ✓  10 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /ai-ta-krajta/branding (1.7s)
  ✓  11 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /hackathon-factory (1.4s)
  ✓  12 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs/online-workshop (2.3s)
  ✓  13 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs/komunita/clenstvi (3.5s)
  ✓  14 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs/pavol (1.6s)
  ✓  15 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /en/pavol (1.3s)
  ✓  16 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs/ochrana-osobnich-udaju (915ms)
  ✓  17 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /en/privacy-policy (1.6s)
  ✓  18 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /cs/obchodni-podminky (1.5s)
  ✓  19 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /en/terms-and-conditions (1.4s)
  ✓  20 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /contact (1.3s)
  ✓  21 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /branding (2.0s)
  ✓  22 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /data-deletion (1.4s)
  ✓  23 tests/e2e/public-pages.spec.ts:134:9 › public landing and information page loads: /old (1.6s)
  ✓  24 tests/e2e/public-pages.spec.ts:139:5 › AI ta Krajta collaboration section deep-links to its media kit (1.5s)
  ✓  25 tests/e2e/public-pages.spec.ts:150:5 › AI ta Krajta owns its metadata, icon and installable manifest and credits Promptbook coder (2.8s)
  ✓  26 tests/e2e/public-pages.spec.ts:246:5 › AI ta Krajta searches complete transcripts on the server without sending them to the browser (2.1s)
  ✓  27 tests/e2e/public-pages.spec.ts:264:9 › public address redirects to its page: / (12ms)
  ✓  28 tests/e2e/public-pages.spec.ts:264:9 › public address redirects to its page: /pavol (636ms)
  ✓  29 tests/e2e/public-pages.spec.ts:264:9 › public address redirects to its page: /privacy (589ms)
  ✓  30 tests/e2e/public-pages.spec.ts:264:9 › public address redirects to its page: /terms (534ms)
  ✓  31 tests/e2e/public-pages.spec.ts:264:9 › public address redirects to its page: /skoleni (492ms)
  ✓  32 tests/e2e/public-pages.spec.ts:278:5 › /skoleni carries a discount code to the workshop registration (22ms)
  ✓  33 tests/e2e/public-submissions.spec.ts:13:5 › submits the shared footer newsletter form (9.0s)
  ✓  34 tests/e2e/public-submissions.spec.ts:27:5 › submits the reusable get-started lead dialog (7.3s)
  ✓  35 tests/e2e/public-submissions.spec.ts:41:5 › submits the business lead dialog (2.0s)
  ✓  36 tests/e2e/public-submissions.spec.ts:55:5 › submits the homepage qualification lead flow (8.7s)
  ✓  37 tests/e2e/public-submissions.spec.ts:80:5 › submits Pavol’s personal contact form (3.6s)
  ✓  38 tests/e2e/public-submissions.spec.ts:96:5 › submits a published online-workshop registration (16.3s)
  ✓  39 tests/e2e/public-submissions.spec.ts:116:5 › personalizes and submits the 199 Kč Promptbook paid community membership (5.6s)
  ✓  40 tests/e2e/public-submissions.spec.ts:143:5 › submits an available AI Supervize Mini workshop registration (3.8s)
  ✓  41 tests/e2e/public-submissions.spec.ts:171:5 › submits the AI Supervize Mini future-term interest form (2.0s)
  ✓  42 tests/e2e/public-submissions.spec.ts:190:5 › submits the AI ta Krajta collaboration form (3.1s)
  ✓  43 tests/e2e/public-submissions.spec.ts:205:5 › plays the newest AI ta Krajta episode from the header (1.6s)
  ✓  44 tests/e2e/public-submissions.spec.ts:214:5 › resumes a half-played AI ta Krajta episode where its listener left it (2.8s)
  ✓  45 tests/e2e/public-submissions.spec.ts:248:5 › starts the AI ta Krajta minigame from its snake and keeps it local to the page (1.5s)
  ✓  46 tests/e2e/public-submissions.spec.ts:262:5 › filters the AI ta Krajta archive by a person and keeps its destination in the hash (1.7s)
  -  47 tests/e2e/public-submissions.spec.ts:274:5 › connects a public online-workshop participant
Saved 41 E2E video(s) to tests/e2e/videos/.
Removed the E2E video(s) of 1 outdated run(s) from tests/e2e/videos/.

  1 skipped
  46 passed (2.2m)

> promptbook-landing-page@0.1.0 delete-test-data
> tsx scripts/delete-test-data.ts

Deleted 10 Contact row(s) and 0 workshop participant row(s) with an @example.com e-mail address.
[1]-  Done                    bash "$1"

=== test shell finished at 2026-09-14T15:12:52.089Z ===
Status: succeeded
```
