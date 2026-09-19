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
