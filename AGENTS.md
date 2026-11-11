## Context

This repository contains Promptbook landing pages for different businesses,
use cases, and audiences. Keep these rules current when behavior changes.

### Public routes

- The final approved 3 November v5 offer is per engine project: Start 399 Kč / $19 monthly with
  3 specialists, 1 controlling human, 1 harness instance and 1 browser profile; Business 1 999 Kč / $100
  with 10 specialists, 5 humans, 5 profiles and no licence count limit on harness instances. Core roles
  do not use specialist capacity. Extra Business capacity costs 99/99/49 Kč by activated time, with
  explicit prior approval and budget, never automatic overage. Commission includes all paid software
  add-ons within the original 24 months. Public copy, legal terms and calculator scope follow
  `specs/new-commercial-offer.md`; this website does not implement engine metering or billing.

- Czech Start and Business online billing opens only after its deployment configuration is enabled. It uses
  hosted Stripe Checkout for Czech and Slovak consumers and businesses, editable billing details, private order and invoice records,
  versioned accepted terms and a separate Promptbook portal configuration. Existing community purchases and
  English enquiries use their own flows. Discount administration shares one code registry. Promptbook scopes
  require explicit selection and an atomic reservation that freezes the terms for each Stripe session. The
  member area confirms paid periods from verified Stripe events and optional onboarding comes after checkout.
  IČO is optional; register lookup fills editable billing details. Orders from 11 November use online-v2 with
  consumer withdrawal rights and a downloadable full contract; online-v1 keeps its original wording and URL.
  Immediate-start requests do not waive the consumer’s 14-day withdrawal/full-refund right.
  See `docs/promptbook-billing.md` for activation, testing, invoices and VAT changes.

- The owner's latest 3 November 2026 instruction publishes current legal texts at `/cs/legal/*` and
  `/en/legal/*`, with dated versions, canonical metadata, indexable sitemap entries and legacy redirects.
  Public documents, metadata, link labels and release-support policy have no discussion-draft status.
  A current public version does not itself conclude an order, sign the bilateral controller arrangement,
  withdraw older rights or rewrite an accepted agreement. Changes follow the agreed notice mechanism.
  Keep bilateral Neonmedia economics, buyouts and negotiating questions outside this public repository.
  Referral commission is a uniform 20% of actually paid eligible software prices excluding VAT, for all
  current/future plans and billing schedules. Pay within 30 days of receipt, subject to earlier mandatory law;
  annual commission is not paid in twelve portions. The 3 November follow-up approves 24 calendar months from first paid activation per licence,
  without restarting for tariff changes or payment interruptions; preserve older accepted rights. New, unconfirmed referrals may be closed prospectively
  on 30 days' notice while confirmed deals retain their agreed rights. Calculators and exports use 20%.
  The main footer puts all legal documents in one dedicated column; releases belong with product resources.
  Release lines start at 0.115 and group major.minor with the latest stable patch. Prerelease candidates
  stay explicitly labelled and open by default if no stable release exists; do not invent stable 0.115.0. Support
  runs at least 90 days from the first actual stable publication, not restarted by patches; existing higher
  promises remain. LTS is informational. Never turn prereleases into stable versions or claim a stable
  release exists when the catalogue has none. Six-hourly sync preserves history and support extensions.

- `/book` is the primary-domain common-knowledge catalogue with English source Books. Readable topics live at
  `/book/<slug>`; latest `/book/<slug>.book` and immutable `/book/<slug>/<version>.book` return identical
  committed UTF-8 source for the current release, with public CORS, SHA-256 ETags and distinct caching.
  Knowledge releases are independent of engine versions. Preserve released source bytes; publish revisions as
  new files through `lib/common-knowledge/catalog.ts`. Unknown topics/releases return 404. Pages share brand
  assets, dedicated social cards and sitemap entries. No account, premium billing or engine implementation is
  introduced. See `docs/common-knowledge.md`.

- Messages are database-backed, unlisted pages at `/<prefix>-<shortcode>` on one selected personal domain.
  They reserve the same eight-character codes with `generateShortcode()` and the same unique `ShortcodeLink` registry
  as ordinary links, with `sourceApp=messages`. Middleware and public routes recheck domain scope; messages render
  in place instead of redirecting. `/admin/messages` owns their two-step editor, explicit creation/deletion and
  immediate shared autosave, with no draft/publish states. Context stays separate from the title, short Markdown
  message and message-specific chat introduction. Explicit generation uses the selected shared Book agent.
  Context may also come from selected or dropped audio files (including Samsung M4A) and supported video files.
  The editor lets the user order these files before explicitly transcribing them in sequence into one context.
  A failure stops the queue so the user can resume with the remaining files without paying again for completed parts.
  The browser extracts a video's primary audio track before requesting an ElevenLabs `batch_scribe` single-use token.
  Only the extracted or original audio (up to 2 GB) uploads directly from the browser, never through Vercel's media
  body limits. Failed local extraction never uploads the source video. Scribe v2 verbatim text and numbered diarized speakers append to existing
  context under a filename heading. Missing/incompatible diarization preserves the original text. Transcription is
  explicit, protected as pending admin work and never retried automatically. Retain completed text if it exceeds the
  context limit. External-file audio/token are not stored or reused for summary narration; subsequent summary/speech controls
  retain their existing behavior. Transcription uses the existing server-only ElevenLabs key independently of storage.
  The context editor leads with Meeting Studio; file import and manual context are separate secondary views.
  Meeting Studio is a fullscreen, focus-trapped recorder with a large record/pause/resume control, recorded-content
  clock, microphone level, protected navigation and explicit confirmation before stopping for paid transcription.
  Pause/resume uses the same MediaRecorder and container; there is no periodic file rotation. Actual interruptions
  resume as new immutable parts of the same meeting. New meetings always use new IDs and never replace earlier audio.
  Every delivered chunk commits directly to Recording Studio's existing IndexedDB together with its byte counters,
  using its existing browser lock and fenced authority. Each message recording is an ordinary single-microphone take,
  labelled `Messages recording · <agent> · <meeting>`; source preferences and existing studio setup are never changed.
  Message metadata and cached paid transcripts remain separate; local legacy audio migrates idempotently into the
  studio without deleting its earlier bytes. Manual deletion in Recording Studio is respected and never undone by
  migration. Refresh/crash recovery retains the committed prefix. Storage failure stops capture, preserving that
  prefix and offering an emergency tail download. Finalization waits for final dataavailable and committed writes.
  Automatic server/CDN audio backup is retired, including writes from older tabs (authenticated 410 responses);
  historical private backups stay readable. Raw audio leaves the browser only for explicit transcription or export.
  Background visibility by itself does not stop recording. Wake Lock is best effort: closing/reloading a tab ends
  microphone capture, and mobile screen locking or OS suspension can pause capture or chunk delivery. Never promise
  uninterrupted recording across those events. Saved audio and paid text survive transcription and message deletion;
  only the Recording Studio's ordinary explicit deletion removes its raw backup. The ordered transcription path
  shares file-import logic, retains paid results before context validation, and never automatically retries billing.
  See `docs/message-meeting-recorder.md` for implementation, recovery, limits and checks.
  The sender's copy/export adds the current URL at the start or after a greeting; the public text remains clean.
  Shortener lists message entries with a Messages edit link; its mutation API cannot edit/delete them. Private
  `messages` rows and their codes are hidden from anonymous database enumeration; a known URL alone grants access.
  No old `/messages/<capability>` route or compatibility redirect is retained. Pages stay outside sitemaps and feeds,
  noindex/no-store with no third-party analytics or cookie panel. Dynamic social cards use the actual subject,
  expansion arrows and Pavol's portrait. Metadata/image requests do not record a tracked navigation.
  Saving a message prepares its Markdown links through the workshop material parser, safe title fetch/fallback and
  ad hoc shortener. Raw URLs become titled Markdown; authored labels remain. Existing registered short URLs stay
  unchanged; code and images remain untouched. Only save paths prepare links, never public reads or a bulk backfill.
  Destination links are ordinary `admin-shortener` ad hoc redirects; `sourceApp=messages` remains reserved for the
  unlisted message page. Server-normalized Markdown returns to the editor without replacing newer typing.
  Audio is optional and generated only by its authenticated button, never autosave or build. New narration omits
  raw HTTP(S)/www URLs and reads only Markdown link labels, with original visual IDs retained for measured alignment.
  Existing recordings, scripts and timing are never regenerated or invalidated just by deploying these rules.
  Supabase Storage's
  private shared `OBJECT_STORAGE_BUCKET` holds immutable MP3s, with short signed CDN reads and native byte ranges.
  A text hash hides stale audio and timing after text edits. Exact provider character alignment maps to renderer
  words; absent or incompatible alignment disables tracking. Explicit migration reuses the original recording and
  reviewed timings with checksum verification. The public player and floating, draft-preserving chat retain the
  article components and existing design. Chat combines the current agent Book and this message's current context;
  it cannot claim new decisions or a live connection to the author. New anonymous chat questions and actual server
  replies are persisted in private `message_chat_turns`, grouped by a browser-local random conversation ID and shown
  through the Messages row's Konverzace action. Request IDs deduplicate retries; questions save before generation,
  replies before success. Failure/interruption stays visible. History APIs require the existing messages permission;
  public/database anonymous roles cannot read transcripts. Pagination retains complete history independently of the
  model context window. One current conversation per message or personal-homepage language, its draft and uncertain
  retry IDs survive refresh in localStorage. New chat replaces only that local conversation with a new ID; it never
  deletes the recorded administration history. Full visible history stays independent of the bounded model window.
  Context and chat reuse the same Download/Copy format menus: Book first, Markdown, plain text, plus download-only
  PDF. Book exports use canonical AGENT/KNOWLEDGE or CHAT/MEMBER/MESSAGE with safe literal content and NOTE provenance;
  Markdown uses an attribution comment, plain text a footnote, PDF a subtle personal-domain footer. PDF rendering
  reuses the workshop's local fonts and shared browser engine. Full context is fetched only on explicit export.
  Public chat accepts picked/dropped files and pasted screenshots: four images/PDFs/UTF-8 text files of at most
  4 MiB per question (text at most 60,000 characters). Bounded same-origin/domain-scoped uploads use the existing
  private CDN bucket. File records are private and scoped to the source/conversation; IDs are resolved server-side
  before question recording or model use. Draft and sent-file metadata persist locally; original files appear on
  their recorded admin question even after generation failure. Images/PDFs are actual Responses media inputs,
  text is quoted input; the bounded model window retains at most eight files / 16 MiB. Never persist signed URLs.
  Public random file-ID links recheck source domain; admin links require messages permission. Export links use
  durable IDs. No account or storage/API credential changes are introduced.
  Message deletion cascades to its history. No login is introduced. See `docs/messages.md` for configuration.
- `/admin/agents` administers the existing shared `workshop_agents` Books, including Pavol Hejný. Internal UUIDs
  have no public agent route. Editing reuses the workshop Book editor; room assignments remain separate. Used agents
  cannot be deleted out from under messages/history; they can be disabled or reassigned. Separate `messages` and
  `agents` delegated permissions guard their pages and APIs.
- `/cs/pribeh` is the miniapp for the `story` event type. The existing workshop term, name/e-mail session,
  participant trust and moderation govern creative actions on the server. Public readers can see stories and the
  cast. Approved participants edit room Books in the shared highlighted BookEditor with debounced, ordered autosave.
  Closing flushes the latest draft; a stale revision or an invalid Book keeps the draft available. Build and development
  serve the pinned Monaco runtime from the same origin. Edits to prepared roles belong to the term, while managed agent
  Books remain private. Free-text descriptions generate moderated Books. Turns from a portrait or contextual cast
  selection append at most one moderated sentence under the same lease. The automatic turn is the first portrait-sized
  control on the stage. A temporary chat bubble shows the selected character, or an unknown speaker during contextual
  selection. Only approved, saved lines become permanent. Both cast controls share one stage membership action. Character
  Books own the accent (`META COLOR`) and approved workshop portrait (`META IMAGE`).
  Newly generated Books are playable while a request-scoped portrait job draws and stores their images. A failed job
  leaves the Book available and can be retried by an approved participant. The event owns a shortener link for sharing,
  QR and the PDF follow-up.
  Story Books can set a local `META VOICE` with an ElevenLabs voice ID. The default narrator and Pavol role
  use the configured Pavol Hejný 2026 voice. New fictional characters get an original Czech Voice Design voice
  in the background. Approved room entry warms existing roles, and playback can prepare a missing voice when needed.
  The private story audio cache reserves each voice under a separate provider-resource key and prevents
  concurrent designs for the same role, including across workshops.
  Reuse the existing server-only ElevenLabs key with Voice Design, voice lookup and speech permissions.
  Speech uses the actor's voice and omits speaker labels from narration. When Voice Design fails or is cooling
  down, the narrator reads the affected line. The fallback is cached separately from the actor's own recording.
  A pending design can finish first, after which each requested line can render independently. The shared player assembles the private
  immutable clips into one seekable track and offsets their measured word timings. A voice change invalidates the
  affected clip. The room is excluded from analytics.
  Other event miniapps can use the event type registry and the same workshop entry/moderation endpoints.

- Git-backed articles live in `articles/<variant-id>/`: authored Markdown and YAML, a passive JSON provenance manifest,
  committed PDF, and separately prepared audio assets. They retain their original placements, canonical URLs and
  feed GUIDs. Missing translations are never invented. An admin placement overlay can also publish a Git article
  in either community and select its canonical URL while preserving both original blog links. New articles are edited
  in `/admin/articles` with one source, author, independent publication destinations and one selected canonical. Both language versions of the Promptbook
  and Pavol blogs can publish any registered author's articles. Community publication is independent and can use a
  community room session or a verified paid entitlement. Access is selected per destination; a public placement
  makes the shared text and media public and requires a public canonical. Drafts and restricted placements stay
  out of public indexing and feeds. Free member articles in the Promptbook community expose their title, perex and
  opening paragraph before entry. The inline name and email form opens that room and refreshes the current article.
  The remaining text and downloads still require its own session.
  The language-matched Pavol blog also lists Pavol's published Promptbook community articles automatically and
  links syndicated cards to the selected canonical URL. Members-only previews supply just the public card, with
  no private body or recording. The personal RSS adds syndicated articles only with public, current audio and
  links to the same canonical URL, retaining the article ID even if its destinations change.
  The Promptbook community has its own podcast at `/cs/komunity/promptbook/podcast.xml`. It uses the same
  episode format, GUID and audio URL for articles publicly placed in that community, and links to the selected
  canonical address. The room offers the shared subscription dialog before and after joining.
  Fenced Book examples in the full article use the existing light, read-only BookEditor when near the viewport.
  The server-rendered source remains the fallback and preserves word tracking during narration.
  Article images and links to image files open a keyboard-accessible preview on the article page.
  Standalone MP4, WebM, Ogg video and YouTube links have inline players. YouTube loads on explicit play and
  both kinds retain the original link. These presentation options keep Markdown and narration word IDs intact.
  The Czech Promptbook articles about contacts, podcast production, and web maintenance link to the public
  terminal recording from their free previews and from their setup sections, before the article's own agenda frame.
  A collapsed disclosure below the agenda frame contains the shared installation, console, new project and result frames.
  The public `/cs/terminal` page presents the genuine CLI capture, five walkthrough frames and two alternate
  agenda frames. It describes project setup without an AI tool and the environment-specific IPC startup failure.
  Its MP4 and WebP files are public static assets under `/terminal-tour/`.
  The four `articles/podcast.xml` routes still have deterministic initial prerenders and refresh hourly for admin
  publications. Only reviewed, existing audio becomes an episode. Managed audio, PDF, timing and subtitles use
  immutable uploads to the private shared object bucket and are served from checked publication routes, with byte
  ranges for streaming and no public storage URLs. Text edits invalidate stale media and replacing audio invalidates
  old timing and subtitles. ElevenLabs and manifest auditing are explicit editorial commands
  in `scripts/articles`, never build hooks. The root audio provider owns one persistent media element, local per-track
  history, paused refresh restoration and Media Session. AI ta Krajta retains its original visible controls; article
  and personal-podcast controls offer source navigation in the same place as the follow-text toggle. Follow text
  appears only on the currently playing article with reviewed timing. Elsewhere, same-site source links use Next
  navigation and keep the audio owner mounted; other sites open a new tab with noopener/noreferrer. Canonical www
  aliases count as the same site. The recording title follows the same navigation rules.
  Article tracking uses reviewed real word timing and a single toggle. While enabled, it keeps narrated text in the readable
  viewport above the player, briefly yielding to manual gestures and resuming after they finish. Turning the toggle
  off disables both highlighting and automatic follow. Mobile article controls form a floating card with a compact
  follow toggle under the title and a full-width timeline; touch controls keep their own hit areas.
  Sentence highlighting uses native text ranges to include authored spaces across inline links and emphasis;
  the current word paints above it. Browsers without Custom Highlight API retain per-word highlighting.
  The first Czech narration is a committed ElevenLabs Studio recording with Scribe sentence/cue captions and
  separately computed acoustic CTC word alignment of the final MP3. Its reviewed map covers title (`t…`), perex
  (`p…`) and body (`w…`) without renumbering body words. Cue intervals are never subdivided into guessed timings.
  A restored player's tracking capability refreshes when that article's valid alignment loads, without autoplay or
  a seek. Timing JSON is same-origin on every publication. Public narration keeps a shared stable URL.
  Text seeks land at most one millisecond inside the aligned interval so a paused media clock cannot round below it.
  Written text and IDs must both match before tracking attaches. Explicit editorial binary import can use the manual
  `article-audio-import` workflow; it verifies transfer integrity and never runs during a normal build or generates speech.
  `publish-assets.ts` copies only allowed downloads of published articles unchanged into ignored `public/article-assets/`
  before dev/build. Keep large Git-backed MP3s as CDN static files; managed media streams from dynamic routes.
  This file copy performs no hash audit or generation; stable download URLs support cross-origin reads and byte ranges.
  Media duration changes after MP3 seeking update the shared timeline and Media Session without seeking or autoplaying.
  Articles count as complete on the real `ended` event; AI ta Krajta keeps its established 30-second outro tolerance
  and five-second resume rewind. Reload restores the exact saved position in pause. Direct public-path Next links
  keep the root owner alive when opening the podcast's media and branding pages.

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
  Registered short links are shared across hosts according to their per-link domain scope; the middleware checks
  their existence before rewriting to the dedicated short-link route, and the page/image recheck the current host.
  Middleware overwrites `x-promptbook-shortlink-host` on every page request to retain that host across Next rewrites;
  shortcode names beginning with api remain covered while actual `/api` routes bypass middleware.
  Unknown links still receive the requested brand’s 404. Their own robots files and sitemaps list only their pages; Promptbook's sitemap lists only
  Promptbook pages. Shared build output, known public assets and used APIs remain available,
  with admin APIs still authenticated. Only the primary domain redirects the legacy branded
  paths across sites; a same-brand nested path normalizes to that brand's public path.
  Cross-site navigation uses canonical absolute URLs from `createPublicUrl`.
- `/cs` publishes the Czech website from `businesses/new`; `/en` is its full English localization.
  `/` and unprefixed marketing pages redirect to `/cs` or `/en` according to `Accept-Language`, preserving queries.
  Language-dependent redirects are temporary and private; explicit language URLs stay stable.
  `/cs/open-source` and `/en/open-source` open on **Claude Code / Codex / AI**, with readable, copyable local-computer
  and existing-VPS-over-SSH prompts for a coding agent running on the user's computer. Preserve existing setup, use
  native headless authentication under the engine account, and hand over a verified terminal dashboard. Prompt copy
  feedback follows the selected target and reports real clipboard failure. Other tabs retain npm, the Ubuntu VPS shell bootstrap, Windows EXE releases
  and the engine's shared Ubuntu installer guide. DigitalOcean is the first cloud option and opens its Droplet
  startup-script guide; Azure opens the paid deployment form and AWS opens the EC2 CloudFormation upload guide.
  Label the copy/upload steps. AI sign-in and agenda setup remain attended over SSH; both languages share resources.
  The installation page keeps the terminal recording next to its method tabs and selected command or prompt.
  The English installation page labels the Czech recording explicitly. The steps link to `/cs/terminal`.
  Shell uses /install.sh, a thin attended wrapper over the engine installer, then opens ordinary ptbk init as
  promptbook with /dev/tty restored; failures never initialize a project. Ubuntu 24.04 x86-64, systemd and
  root/sudo are explicit. Native VPS AI login instructions live in a disclosure. Omit repeated product,
  ownership and sales sections.
  Marketing subpages use root paths, canonical/alternate metadata and indexable sitemap entries.
  `/new` and its children permanently redirect to the corresponding public paths, preserving queries.
  Czech `/cs` routes re-export the shared `app/(marketing)` pages; English uses its dedicated `/en` catch-all;
  article, workshop, administration and independently branded routes keep their owners.
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
  published in Czech only and names no language alternate. Its composition, words and default qualification
  behaviour remain independent of the new `/cs` and `/en` autonomous-agenda homepages.
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
  Their homepages show `#articles` before `#podcasts`, articles limited to ten and podcasts to four server-rendered items with a localized
  Show more link. Articles retain newest-first matching-language publication and the existing audio button;
  podcasts combine editorial prominence, recency and show diversity before taking four, including one AI ta Krajta episode. Header and footer links scroll to those
  homepage sections. `/articles` and `/podcasts` list only their own complete type; the podcast archive retains
  its sort selector, hourly sources, shared player, localized metadata and sitemap entries. Archive navigation
  returns to homepage anchors and preserves client-side playback, while language links keep the archive path.
  Podcasts live separately at `#podcasts`: reviewed external episodes refresh their selected RSS enclosures and
  retain verified recordings during outages; AI ta Krajta reads the shared merged episodes without audience-profile
  fetches and filters by the resolved `pavol-hejny` roster entry. Both homepages revalidate hourly, so new credited
  episodes appear without a second editorial entry or deployment. Show links stay canonical on `ai-ta-krajta.cz`.
  The English homepage marks original Czech recordings with a flag. Personal podcasts use the persistent article
  player and shared history; AI ta Krajta keeps its own controls. Missing public audio retains a publisher link.
  All personal podcast appearances share Smart ordering by default: the newest episode stays first,
  then each position takes the newest remaining episode from a different show whenever possible. Each show's own
  order stays newest first; after other shows run out, the remaining episodes continue by date. A localized native
  selector also offers strict newest-first and oldest-first ordering, without changing playback or open descriptions.
  Ordering receives only metadata and server-rendered episode content; the default list is readable without JavaScript.
  Small covers, short excerpts and native full-description disclosures sit in simple separator rows, without
  show-specific groups, archives or nested cards. Full descriptions also remain readable without JavaScript.
  Provenance and unresolved research are documented in `businesses/pavol/pavolPodcastSources.md`.
  Their shared ivory, forest-green and gold design uses the existing portrait and project marks, with a featured
  project, static editorial testimonials and responsive section layouts; visual tokens stay in `layout.ts` and `pavol.css`.
  `/projects` lists the verified public project catalogue; private Sites and unresolved authorship stay out of the publication.
  The three compact service cards cover agent delivery with partners, consulting, and training. Approved training formats are behind a disclosure; the consulting deliverables and a separate process section await editorial approval. Introductory-call actions preselect a call while preserving custom drafts. Three concise experience metrics replace the combined audience/training count. Collboard and H-edu have separate real interface screenshots; H-edu has an editorial teaching frame and Promptbook reuses the existing blueprint scenario in compact landscape form. Three case studies are integrated into project cards and expanded in the archive. Project feature selection, articles, media and podcasts
  accept editorial `prominence` (1 neutral, 0 omitted from homepage); two years halves temporal rank. Chronological
  podcast sorting remains available. Both podcast archives share ArchiveSearchField and accent-insensitive matching.
  `/talks` and its homepage preview read the same public workshop summaries as the community calendar. Only the
  online-workshop kind (whose lecturer is Pavol) and explicit PAVOL_EVENT_PARTICIPATION slugs enter his personal list;
  another community speaker's event never implies his participation. Three real owned archival speaking photos are
  captioned without an invented venue, date or photographer. The event gallery now uses three varied real photographs from AI Tinkerers and CASSINI in 2024 and Rakathon in 2025, linking to documented events/posts rather than image files. Public sources are in docs/pavol-portfolio.md.
  Personal articles/podcast.xml subscriptions now combine matching-language articles with Pavol's filtered appearances,
  refresh hourly, preserve article GUIDs and canonical source audio, and identify original recording languages.
  Their AI ta Krajta items prefix the topic with the show name and the published number, including split parts. Unnumbered specials use the show name alone.
  These items use the matching YouTube episode thumbnail in a 1400-pixel square JPEG that preserves the whole frame.
  Missing videos or thumbnails use the publisher's full-bleed square show cover. The artwork route is scoped to the personal domains.
  They are linked from both archives and the footer through a subscription dialog with copy, explicit XML and supported Subscribe on Android actions. The footer label is Podcast. Personal feeds use the versioned portrait-led podcast cover; feed URLs and GUIDs stay stable. Promptbook article-only feeds stay independent.
  Their compact header offers canonical language links, a keyboard skip link, and a native mobile navigation menu with reduced-motion-aware icon and panel transitions.
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
  Podcast transcript migration is manual and per recording. `podcasts/transcripts/index.json` tracks the ten-recording
  pilot; `pending` entries are not completed transcripts. Migrated Krajta rows may reference a committed speaker-labelled
  WebVTT through `transcriptFile`, while other rows retain their original inline `transcript`. Server search alone loads
  VTT text through `readPodcastTranscript`; source text and file paths never enter browser props. Keep the search API,
  player and page controls unchanged. Raw Scribe output is retained with each completed import; no paid processing runs
  during builds or on a schedule. See `podcasts/README.md` for explicit commands and speaker-attribution checks.
  The completed pilot uses acoustic comparisons with Pavol's original single-speaker sample for its stable
  `pavol-hejny` identity. Review evidence stays in the index; private reference audio and embeddings are not published.
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
  keeps initials on that same background. The visible team is Pavol, Petr, Jiří and Katka. A native Zobrazit více
  disclosure shows Šimon and Jacek first, then former contributors (including Prokop and Patrik) with grayscale
  portraits and an explicit former-member label. Guests remain in their own collapsible list. Editorial `teamStatus`
  in the roster owns these groups. The order within each group is drawn anew for every visit, weighted by how many episodes of the archive name each
  person after their roster factor is applied (one by default), so somebody heard
  often comes up high far more often than someone in one díl without the list ever becoming a ranking. The draw is local state and
  is made in the browser; the page itself is built in the order the draw leans
  towards, from the most often named person to the least often named one, so the
  browser hydrates into the list it was sent.
  Collaboration submissions use `/admin/contacts`. The 4 November simplification removes the podcast's
  newsletter signup from the homepage and footer; historical contact sources and records remain intact.
  The homepage previews five episodes; Zobrazit více opens the full `/episodes` archive with the current filters
  and shared player preserved. `/episodes` has its own canonical metadata, sharing card and podcast-only sitemap entry.
  Homepage, archive, collaboration and brand-kit headers share compact navigation to the two main internal pages,
  Díly and Spolupráce. Listening platforms stay outside the header. The podcast footer links only the
  canonical privacy notice, not Promptbook's product/legal catalogue. The podcast tab icon uses
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
  differently than the page names itself. Both share the homepage navigation and footer.
  The collaboration page is labelled Spolupráce and keeps the existing `/media-kit` URL and inquiry deep links.
  Its concise guest/topic guidance, approved partner offers and editorial rules precede one contact form;
  dated audience figures and brand downloads sit in an optional media-kit detail. The homepage's Zjistit víc
  opens that explanation, while Napsat nám opens the contact form. The brand-kit heading uses the canonical
  `AI_TA_KRAJTA_NAME` spelling. The brand kit hands out the logo the
  site already serves at `/ai-ta-krajta/logo.svg`, `.png` and the cover artwork,
  publishes no colour outside `AI_TA_KRAJTA_COLORS`, and says how the name is
  written; it asks for nothing and sends visitors to the media-kit form.
- `/cs/komunity` links to the two permanent Czech rooms, `/cs/komunity/vyvojari` and
  `/cs/komunity/promptbook`. The registry in `businesses/community/config.ts` owns both public addresses
  and their stable database room slugs. Individual room pages omit the link back to the community directory.
  The former `/cs/komunita` and its subpages permanently redirect to
  Vývojáři, except for the historical calendar feed, which continues to serve the same calendar.
  Room participants, moderation, chat, polls and materials are separate. The administration groups related
  participation by normalized contact email, with independent room sessions. Contacts shows participants with no
  contact submission in a separate read-only view, preserving the contact and consent history. Vývojáři keeps the
  existing project gallery and paid membership. Promptbook starts with free access.
  A published event can appear in either calendar, both, or neither, using one event and registration.
  Existing events default to Vývojáři. AI Supervize Mini cannot be listed in Promptbook.
  Terms show event kind, format/place, price, and status; wherever their
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
- `/cs/komunity/vyvojari/projects` is the full project gallery, ordered by upvotes.
  `/cs/komunity/vyvojari/projects/<project_id>` shows scraped project details and a
  moderated discussion. Project-room sessions derive from the Vývojáři room session;
  the author moderates their own discussion.
- `/cs/komunity/vyvojari/clenstvi` offers free community access and the 199 Kč monthly
  membership. Webinars remain free; paid access adds recordings, archive,
  materials, extra content, priority questions, and Discord/community features.
  The page is prefilled from `fullname` and `email`, supports community discount
  codes, has no new annual plan or trial, and allows cancellation.
- Each community's `calendar.ics` publishes its assigned terms by stable slug, so moved or renamed terms update
  existing subscriptions. Feeds contain only event terms and public destinations, never subscriber identity.
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
- `/admin/community` switches between the configured rooms. Each has its own polls, participants and analytics.
  Vývojáři also offers project moderation, memberships and payments.
- `/admin/articles` manages one article, one author and its publication destinations. Public destinations are the
  Promptbook blog, the language-matched personal blog, Vývojáři and Promptbook. A published article has exactly one
  canonical destination. Git articles keep their existing public URLs and audio, with editable community placement
  and canonical selection in administration. Preserve existing podcast episode IDs when adding destinations.
  Managed articles use the same reader and player. Editors explicitly attach PDF, narration, subtitles and reviewed
  word timing. The primary action generates narration, measured word timing and WebVTT together using the Messages
  ElevenLabs narrator and reader word IDs. It runs only on an explicit click, after content saves. A fenced generation
  lease and article revision prevent concurrent billed requests and stale attachments. Manual audio and sidecars stay
  in a secondary disclosure. Private article text and media use the exact community session, with verified email and
  live membership required for paid content. The public feed and public media endpoint serve only public publications.
- `/admin/studio` contains addressable `Nahrávání` at `/admin/studio/recording` and `Uložené projekty` at
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
  unsupported until authorized large-file ranges and native synchronized seeks are proven. Recording URLs and existing project URLs now use the same preview-based editor. Its composite scene track
  draws shared decoders with normalized fullscreen/rectangular/circular presets, a single saved global smooth/fade/cut transition and one audio source;
  monitor audio stays separate and gaps never hold old frames. Metadata and portable recipes map original/project/
  prepared coordinates consistently, retaining unavailable mappings and excluding credentials/serialized permissions.
  Explicit post-capture CDN upload uses bounded direct browser-to-S3 multipart PUTs, short-lived part/read signatures,
  immutable manifests, verified completion/ranged seeking, retry/resume/cancel and fenced uncertain-outcome recovery.
  Only successful verification changes a stable asset's location; local originals remain. Its private asset/reference
  migration and separate cleanup namespace protect project objects and never publish to participants. Local editing
  works without S3/Drive configuration. Design, actual long-container measurements, provider CORS and integration
  limits are in `docs/studio-workshop-editor.md`. The simple editor's shared selection trims export; removing it
  ripple-cuts every synchronized source through immutable group mappings with undo. Scene settings, source mapping,
  imports and original downloads stay behind disclosures. Smart layout samples at most 120 small screen frames per
  group locally and proposes camera introduction then screen plus circular camera; ambiguous static introductions
  remain camera until manually placed. It never infers the speech's meaning or uploads frames. Preview and local
  WebM export share `studioComposition.ts`; export resamples sequential decoded frames (never sparse GOP timestamp
  batches) to 1080p/30 fps VP8 and one 48 kHz stereo Opus
  audio track into OPFS, checks duration, then saves to disk (buffered downloads are capped at 256 MiB).
  Export, cancellation, autosave and takeover use the existing work/authority boundaries. Details and verification
  are in `docs/studio-simple-editor.md`.
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
  by `/[shortcode]`; `/shortener` redirects to the admin page. A nullable `domains` array means all domains for every
  existing and newly created link, including automatic room links. Creation/editing may select a nonempty subset of
  the configured public sites; www and the existing new.ptbk.io alias follow their canonical scope. Copy/open/QR and
  room material references use an enabled domain. Scope checks precede redirects, click recording and metadata/image
  generation; omission by a legacy PATCH client preserves an existing scope. Public page routes keep precedence.
- `/admin/login` authenticates the environment-backed `admin` superadmin with `ADMIN_PASSWORD`, or a private
  `admin_users` account with its salted scrypt password hash. Only the environment account manages `/admin/users`;
  it cannot be renamed, disabled or deleted in the website. Delegated accounts get explicit section permissions. Shortener access additionally separates
  view/create/update/delete/click-history actions; each action includes list access, and the legacy `shortener` grant
  retains full access. The account editor expands that grant before removing individual actions. These grants
  filter navigation and dashboard cards and are enforced by `requireAdminSignedIn` on pages and the awaited
  `getUnauthorizedResponseOrNull` in API handlers. Unknown API sections remain superadmin-only. Shared workshop APIs
  check the stored room kind rather than a caller's hint. Read current account permissions on every request;
  never cache them between requests or trust them in cookies. Password/enabled-state changes rotate the database
  session version, and deletion revokes the account. The separate signed user-cookie format never grants superadmin
  access. All cookies still depend on `ADMIN_PASSWORD`; legacy environment-admin cookies retain their meaning.
  Account/password creation is explicit, profile/access edits use the shared autosave/dialog conventions, and private
  account projections never return password hashes or session versions. `/admin` is the post-login dashboard.
- `/cs/branding` and `/en/branding` share the concise Promptbook brand kit in `businesses/branding`.
  Both use the launch shell, matching language switch/footer, canonical alternates and sharing images.
  Unprefixed `/branding` selects the browser language with a private 307. `lib/promptbook-brand/brand.json`
  owns product colors, messages, geometry and asset paths; `scripts/brand/generate.py` produces SVG/PNG,
  templates and public Markdown/JSON/CSS rules. The PB mark uses an exact regular-hexagon projection;
  the complete lockup has outlined Inter Medium / Bold lettering and is shared by the launch header, footer and kit.
  The kit shows full and lowercase Medium-only ptbk lockups on white, ink blue and black.
  Its localized PDF downloads print the same pages via `scripts/brand/export-guide.cjs`.
  Every asset stays individually downloadable; ZIP is optional. No BookEditor/MockedChat demo belongs here.
  The robot section projects five poses from the approved Robot Studio geometry and offers the editable
  working-pose GLB. Keep its on-page instructions, static illustrations and printed guide in sync.
  These product-only changes must never restyle AI ta Krajta or Pavol's personal sites or replace shared legacy assets.
- Other public/legal routes include `/contact`, `/data-deletion`, `/privacy`,
  `/terms`, `/dekujeme`, and the routes under `/k`, `/old`, and
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

- Global cookie consent starts as a 52-pixel cookie launcher, with a predefined conversation-style message after six seconds if no choice exists. It shares FloatingConversation's React shell, size and appearance with the message/homepage chat, but never calls an AI model. Necessary-only, all, and settings remain explicit choices; no optional tracking is enabled by opening or closing the panel. A saved choice removes the launcher; the footer #cookies link can reopen it. The automatic message waits while another floating conversation is open. Settings keep the page palette. The launcher measures fixed players and other bottom controls through useFixedControlClearance; launchers remain below modal overlays. Private message pages still have no cookie controls.

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
- The participant room owns the membership badge and popup. Paid memberships are keyed by community and normalized
  email. Existing subscriptions, legacy events and shared events use the Vývojáři offer. A Promptbook-only event
  follows the Promptbook offer, which is free at launch. Checkout returns to the room where it started.
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

### Contact forms revision of 3 November 2026

All four public domains share the versioned source/purpose registry in `lib/contacts/contactSubmissionPolicy.ts`.
New waitlist and both paid-registration submissions must send the current notice version/language. Newsletter sources
require their actual explicit consent; service enquiries, registrations and calculator PDF requests never imply it.
The server writes canonical text, purpose, language, receipt time and the actual choice atomically in Contact's
`submissionEvidence`. Existing rows remain null. A database trigger and admin input allowlists preserve this record;
source histories keep their own evidence when contacts are grouped. The recorded choice does not prove mailbox
ownership or override a subsequent withdrawal. No email confirmation or campaign sending is implemented here.
Use the shared notice on every new public contact form and register its source before accepting submissions.
Never fabricate consent for historical contacts or add Neonmedia's unrelated marketing to the grant.

Twenty receives an asynchronous projection of committed Contact rows, workshop attendance and feedback, paid
community memberships and live paid Promptbook orders. Order onboarding updates the same `web:contact:<id>` source.
Source writes have no dependency on Twenty. Keep the stable `web:<source>:<id>` keys and the
inclusive cutover when changing the projection. Preserve the purpose and evidence per submission and leave an
uncertain Person relation for review. Deployment and retry instructions are in `docs/twenty-contact-sync.md`.

### Administration and data rules

- `/admin/feeds` lists the ecosystem's public RSS and calendar subscriptions for signed-in admins.
  Use the existing publication addresses and Google Calendar subscription links in that directory.

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
- Community administration switches between the configured rooms before opening the shared workshop dashboard.
  This dashboard exposes no community creation, schedule, stage, reactions or editable room address.
  Its membership view filters Stripe lifecycle, prices, discounts, identifiers,
  dates, test/live mode, and links to the exact Stripe checkout/subscription.
  Community analytics cover all measured time and member details show seen times.
- Shortener search, provenance filters, sorting, and selected click history live
  in GET parameters. Editing changes only shortcode, destinations, note, and
  landing page and domain scope; deletion also deletes recorded clicks.

### Database and verification

- On Windows, enable repository-local `core.longpaths` before Coder checks (`git config --local core.longpaths true`).
  Private check worktrees live below `.git/ptbk-coder/check-views/`; Git otherwise omits dependency paths exceeding
  260 characters and the ignored-file consistency check fails before any check runs. Keep `.eslintrc.json` marked
  `root: true` so these nested copies resolve only their own ESLint plugins and rules.
- Put database changes in `migrations/*.sql`. Vercel production `prebuild`, Node.js startup and
  `npm run migrate-database` run `_initialize.sql`, then migrations in filename
  order, recording immutable filenames and checksums in `public."Migration"`.
  Preview and local builds skip production prebuild migrations. Changed or missing migrations fail, as do queries
  requiring an unapplied one.
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
