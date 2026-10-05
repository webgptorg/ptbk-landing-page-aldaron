## Context

This repository contains Promptbook landing pages for different businesses,
use cases, and audiences. Keep these rules current when behavior changes.

### Public routes

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
- `/admin/recording-studio` records any number of available cameras, screen shares,
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
  IndexedDB commits each chunk together with its counters; a feature-detected selected-directory destination
  closes immutable media fragments before its small authoritative checkpoint and stores only handles/metadata in
  IndexedDB. Recovery can reconnect or import that folder without moving its media into origin storage; read-only
  import still offers export when further folder or origin-cache writes fail. An exclusive
  browser lock protects recording, recovery, editing and deletion across tabs. Committed bytes, queued bytes,
  destination and aggregate bitrate are separate from the browser's labelled origin quota estimate. That estimate
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
  `/admin/recording-studio/<recordingId>` workspace, sharing the setup/recording shell and its browser lock. Existing
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

### Shared community and workshop behavior

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
  Recorded A/V markers are checked from decoded sample timestamps rather than speaker-output latency. The preparation
  fixture additionally carries readable/binary timecodes and claps at 25/30 fps with distinct startup offsets.
  Simulated ten-hour mappings and decoder delays do not establish a ten-hour capture soak or physical macOS behavior.
