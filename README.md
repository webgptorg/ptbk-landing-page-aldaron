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
| Operations | `/admin`, `/admin/workshops`, `/admin/community`, `/admin/recording-studio`, `/admin/contacts`, `/admin/discount-codes`, and `/admin/shortener`. |
| Public short links | `/<shortcode>` resolves a managed short link; `/shortener` leads to its administration. |

## Local recording studio

`/admin/recording-studio` uses the existing admin login. Add each camera or screen share separately; a microphone
can be added as its own audio file. A new camera records the selected microphone in the same video file by default;
turn off **Nahrávat zvuk** for an intentional silent camera. Camera previews are muted. Screen audio is requested
when enabled, but the browser and operating system may not provide an audio track for the chosen surface. All
sources start and stop in the same JavaScript turn. This is software synchronization, not hardware genlock; the
editor's manifest records measured start-call offsets.

The studio keeps versioned source preferences in this origin's browser profile: source IDs, labels, order, enabled
state, selected camera/microphone, and audio choices. They are not sent to an API. No stream, media, or permission
grant is saved by the app; the browser controls whether camera/microphone access needs another prompt. Stopping a take
finalizes only that recording; an authorized preview may remain active and is marked
**Náhled aktivní** until **Uvolnit všechna zařízení** or page teardown. On a later visit, the cards return without
opening devices. Reconnect each camera or microphone deliberately; an unavailable exact device stays selected
until you choose a replacement. Each display source needs a fresh browser chooser from its own **Připojit** action.
Its remembered surface type and label only help with reselection. The [Screen Capture specification](https://www.w3.org/TR/screen-capture/)
requires renewed user consent for display capture; the browser may treat a supported surface type as a hint and may
ignore it. See also [MDN's current `getDisplayMedia()` reference](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia).

Recordings default to IndexedDB in the same browser profile, device, and site origin. Where `showDirectoryPicker`
is available, **Vybrat složku pro nahrávání** records directly to a user-selected filesystem directory instead.
Nothing is sent to the server. IndexedDB chunks and metadata commit atomically. Directory recordings close small
immutable `.part` files (normally five seconds per source), then atomically replace a small `recording.json`
checkpoint. They do not keep a whole take in RAM, copy a growing file on every append, or need a second copy to
finalize. The folder checkpoint is authoritative; IndexedDB stores only its handle and a metadata cache. Even if
that cache runs out of quota, committed folder data remains usable. Keep the whole recording subfolder: the parts
are fragments of each original media stream, not standalone movies. Use the studio to export playable originals.
**Obnovit záznam ze složky** opens that recording's subfolder, including after the site's metadata was cleared.
Recovery only reads the folder; it can offer export even when a full disk or origin refuses further writes. If the
browser cannot cache the handle, select the same recording subfolder again next visit.
**Připojit složku znovu** renews access to a known folder; permissions are never requested silently on recovery.
Incomplete takes retain successfully committed chunks after reopening.
One browser tab holds the studio lock, including while recovering, editing, exporting, or deleting takes. Normal
admin navigation and sign-out wait for recording or export to finish, and closing/reloading during capture shows the
existing browser warning.

Losing a source does not end the recording. When a camera, a shared window or a required microphone stops, only that
source's recorder is closed: its media up to that moment is kept, the rest of the session stays a gap in its lane,
and every other source records on without a break on the same session clock. The take itself ends only when no
source is left to record, when a chunk cannot be saved, or when the origin runs out of space — the failures which
affect all tracks at once. Such a take is saved as **Přerušený záznam** and names every source it lost.

Because an administrator is normally working inside the application being recorded, every failure is also announced
outside the studio tab: an alert sound and a browser notification, beside the message on the failing source's card
and at the top of the page. **Povolit upozornění prohlížeče** asks for the permission, both channels can be turned
off separately, and the settings stay in this browser profile only. **Otestovat výstrahu** raises a real alert
through the real channels, which is the way to find a muted tab or a refused permission before a recording needs
them. A refused or unsupported channel leaves the others announcing; the studio page keeps the last twenty alerts
with their times.

Use a current desktop Chrome or Edge over HTTPS (localhost also works). Device limits, codecs, and screen/audio
capture depend on the browser and operating system. **Odhad prostoru pro web** is the reported origin quota minus
reported usage, not physical free disk space or the capacity of a selected folder. The API can deliberately keep
this number at 10 GiB while successful writes continue. No 10 GB recording ceiling is imposed. Committed bytes,
queued bytes, destination, configured total bitrate and measured aggregate bitrate are shown separately. Estimates
refresh every five seconds and after finalization, recovery, deletion, export and destination changes; failed,
missing or stale measurements become unknown. Because neither supported backend exposes defensible physical
capacity, remaining time is explicitly unknown. The studio never subtracts its media bytes from already-adjusted
headroom. A low fresh origin estimate conservatively reserves 64 MiB for origin recording; it does not block a
selected folder. The pending-write queue is bounded to 64 MiB; overflow or a failed write stops all sources and
marks the uncommitted tail in the same session clock, without adding a pause timeline or silently dropping a source.
The browser itself may emit a larger-than-requested MediaRecorder chunk; this is rejected as an interrupted take
rather than retained in an unbounded queue. Persistence is an explicit button with granted/denied/unsupported/error
feedback. It protects origin data from eviction, does not request a chosen quota, and reveals no disk free space.
Download takes you want to keep. See [investigation and verification evidence](docs/recording-studio-storage.md).

**Náhled a ořez** opens `/admin/recording-studio/<recordingId>` in the studio's persistent workspace shell.
The existing recording/source IDs, original bytes and saved selection survive reload and back navigation. These
authenticated URLs identify data in this browser profile; another computer shows a missing-local-recording state.
The timeline has a lane per source, sparse decoded thumbnails/audio samples, zoom/scroll, an hours-inclusive clock,
one transport and a shared IN/OUT selection. Drag either handle or use arrows (Shift: 10 s, Alt: 0.01 s), Home/End,
or the precise second fields. Undo/reset and the existing autosave/error/navigation protection apply to edit metadata.
Native independent playback controls are absent. A common monotonic clock waits for decoder seeks/buffering,
corrects drift and maps recorded offsets/segments without stretching durations or closing gaps. The preview target
is at most 100 ms error after settling, not hardware synchronization. Hidden and solo video monitoring are separate
from audio mute/solo; only one audio source is audible initially to avoid echo. Monitoring never excludes an export.

The live monitor offers a grid, one focused source, and a pinned primary source with the other sources still
available. Hide, minimize, preview sound, and camera mirroring affect only this browser's monitor; the source list
and every armed recorder remain intact. Monitor preferences are stored separately from capture preferences. The
status line always shows the armed source count. **Pozastavit všechny stopy** closes every source's current media
part and saves its shared boundary. Live previews may keep running while the session clock is paused. **Pokračovat
ve všech stopách** starts new playable parts at the next shared session time, excluding the paused wall time; a
failure stops the whole take as interrupted. After final chunks flush, encoded media timestamps set the common
next boundary and shorter tails remain gaps. MediaRecorder start/stop call times are browser observations, not
hardware synchronization or a promise that capture survives sleep or revoked permission.

In a recording's workspace, **Donahrát do tohoto projektu** restores the latest intended source setup, then waits
for each required device or display chooser and an explicit **Start**. The new take keeps the same recording ID and
begins at the saved session end. New or missing sources require explicit confirmation and show real timeline gaps.
An untouched full-session selection extends to the appended end; a custom IN/OUT selection stays as it was.
**Použít tuto konfiguraci zdrojů** prepares a separate new recording instead. Each paused section and appended
take is an independent playable original in the ZIP with its own ID and time mapping; preparation across these
boundaries is labelled originals plus recipe until a safe join is available. See
[monitoring, pause and append design and verification](docs/recording-studio-monitoring-pause-append.md).

ZIP exports always contain unchanged `originals/` and a version 3 `recording.json`, including the versioned edit
recipe, source IDs, source-to-session segments, seconds as the time unit, common selection, prepared time zero,
missing ranges and processing results. Existing records derive the recipe without copying media; the first edit
persists it. This is temporal trimming; there was no spatial crop in the original studio.
**ZIP s ořezem** produces separate `trimmed/` copies using browser transcoding, preserving dimensions and
embedded audio. Video uses the source's recorded nominal frame rate when available, with resampling and the applied
`videoFrameRate` explicitly recorded in the manifest. Unknown rates retain the source cadence. Every component's
output bounds are checked within 50 ms of the common selection. Codec padding
and frame granularity are included in the actual per-component timestamps in the manifest. Gaps, unsupported
codecs or unavailable processing produce an explicitly labelled original-and-recipe fallback for that source,
never a falsely successful trimmed file. Originals remain the highest-quality material. **Stáhnout ořez** also
downloads an individual prepared source and JSON sidecar. Cancel/retry leaves original media and the recipe intact.
When direct disk saving is unavailable, individual prepared downloads are limited to 256 MiB and detached from
the temporary file before cleanup; larger outputs require a disk stream or the labelled originals/recipe fallback.
Conversion uses temporary files in the origin-private filesystem, requiring room for one trimmed track at a time;
temporary files are removed after processing or on the next studio visit following an interrupted export.

ZIP64 archives stream directly to the chosen file when the browser offers the save-file picker, so large archives
need no full-memory buffer; original media is read one committed chunk at a time. Other browsers use a ZIP download
fallback capped at 256 MiB to avoid exhausting memory, with **Stáhnout originál** for each source using local Blob
references instead of a whole-session archive. **Stáhnout údaje o stopách** retains the same versioned timing,
trim and missing-range metadata for those individual files. Moving to another browser does not transfer IndexedDB recordings.
ZIP output needs destination space for the originals plus any trimmed copies; trimmed export additionally needs
origin space for one temporary trimmed track. OPFS remains subject to origin quota and is not a quota bypass.
Capture and local export need no server storage. Publishing a prepared recording to a workshop uses the separate
private hosted-recording service described below.

### Hosted synchronized workshop recordings

In `/admin/workshops`, select a workshop and use **Hostovaný synchronizovaný záznam** to upload prepared `editor`,
`application`, and/or `camera` files independently. Include their schema 5 studio manifest (one combined file or the
individual manifests from separate prepared exports); select the matching source ID if a filename changed. Optional
prepared workshop metadata, activity/event/commit JSON and SRT/WebVTT subtitle sidecars are imported but subtitles
are not shown in the participant player. The server checks the shared export clock, per-track timing and codecs and
returns a report and admin preview. **Publikovat záznam** then atomically switches the workshop to the verified revision.
The studio editor also has **Publikovat do workshopu**, using the same server upload and validation path. A studio
project is not needed to import previously exported files on another device. The admin page can reopen an interrupted
or verified unpublished revision after a reload; reselect the original files to resume matching SHA-256 chunks, or
remove one draft file to replace it. Studio publication prepares each selected video source from one continuous
playable part; a selection crossing recorded pause/append parts needs separately prepared continuous files before
direct admin import.

Use a **private AWS S3 bucket** for durable media. The app sends 8 MiB SHA-256 checked chunks through authenticated
Node.js routes, and proxies authorized 4 MiB byte ranges back to viewers. The bucket must deny public access and
allow the server identity `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`,
`s3:AbortMultipartUpload`, and `s3:ListMultipartUploadParts` on the `workshop-recordings/` objects, plus
`s3:ListBucketMultipartUploads` on the bucket. Configure the hosting ingress to accept 8 MiB request bodies and permit 60-second
upload calls and a 300-second verification call. No browser-to-bucket URL or CDN cache is used for paid bytes.

```dotenv
HOSTED_RECORDING_S3_BUCKET=YOUR_PRIVATE_BUCKET
HOSTED_RECORDING_S3_REGION=YOUR_AWS_REGION
HOSTED_RECORDING_S3_ACCESS_KEY_ID=YOUR_SERVER_ONLY_ACCESS_KEY
HOSTED_RECORDING_S3_SECRET_ACCESS_KEY=YOUR_SERVER_ONLY_SECRET
# Optional for a compatible S3 endpoint; keep the bucket private
# HOSTED_RECORDING_S3_ENDPOINT=https://YOUR_PRIVATE_ENDPOINT
HOSTED_RECORDING_CLEANUP_SECRET=YOUR_RANDOM_SCHEDULER_SECRET
```

Schedule `POST /api/hosted-recordings/cleanup` with
`Authorization: Bearer <HOSTED_RECORDING_CLEANUP_SECRET>` at least daily. It claims and removes abandoned revisions
after 24 hours and unpublished ready or superseded revisions after seven days, never the current published pointer.
It also aborts old
multipart uploads left before a database row could be written. Add an S3 lifecycle rule to abort incomplete multipart
uploads after one day as a second recovery path if the scheduler is unavailable. Keep old revisions for at least the
seven-day retention window; a connected viewer may request its superseded revision for 24 hours after replacement.
Each media request is still checked
against the workshop session and paid membership. The YouTube URL, replay offset, teaser, and stage choice remain
stored when the hosted source is selected. Prepared hosted media starts at export zero; the YouTube replay offset is
never applied to it. The administrator aligns export zero with the workshop's live clock, and recorded pauses retain
their wall-clock gaps.

The participant player uses one session playhead for the editor, application and camera files. Auto follows reviewed
scene choices, overlays the camera and selects one audible file. Reviewed automatic-coding intervals advance in
decoded steps at up to 10×; when decoding is slow, the playhead waits for the frame instead of showing stale video.
Events and verified commit anchors share those session seconds. The existing YouTube player remains active for
YouTube-only workshops.

A non-paying live viewer receives only the completed segment at the delayed playhead, normally two seconds behind the
workshop clock. Segments are capped at two seconds and split at recorded take boundaries, so the wall-time delay follows
studio pauses. Each request remuxes a self-contained MP4 or WebM segment from the already published private file,
requires a key-frame-aligned segment boundary, and rechecks the current server time and room access before
returning bytes. An unaligned or unavailable segment buffers or falls back to another ready track; no earlier or
future segment and no full-file byte range is served to that viewer. Publish the complete prepared media before the
workshop starts. This is scheduled playback of a complete upload, not incremental live capture or upload. Members
can seek the full revision. See `docs/workshop-hosted-player.md` for timing and delivery limits.

Its E2E tests supply canvas video and synthesized audio with a silent Web Audio output, so they need no physical
camera, microphone, or working speaker device. Recording, storage, codecs, trimming, and ZIP exports remain real.
The editor additionally uses reproducible 25/30 fps timecode/clap files and an independent FFmpeg export checker.
See [editor analysis, timing contract and verification](docs/recording-studio-editor.md) for evidence and platform limits.

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

### Branded domains

Attach `ai-ta-krajta.cz`, `pavolhejny.cz`, and `pavolhejny.com` to the same production deployment as `ptbk.io`.
The application routes their roots to the existing AI ta Krajta, Czech Pavol Hejný, and English Pavol Hejný pages;
the old `ptbk.io/ai-ta-krajta`, `ptbk.io/cs/pavol`, and `ptbk.io/en/pavol` addresses permanently redirect to them.
DNS and the hosting provider's domain attachment remain deployment configuration, not application secrets.

### Workshop project deployment on Vercel

In `/admin/workshops`, the project settings offer **Nasadit na Vercel** when a valid GitHub repository is entered and
the deployment URL field is empty. Configure these private server variables:

```dotenv
VERCEL_TOKEN=YOUR_VERCEL_ACCESS_TOKEN
# Optional: the team that owns the workshop deployments
VERCEL_TEAM_ID=team_...
```

The token must be able to create projects and deployments in that account, and its Vercel GitHub integration must have
access to the repository. The action imports the original repository and starts a production deployment using
[Vercel's project API](https://vercel.com/docs/rest-api/projects/create-a-new-project) and
[deployment API](https://vercel.com/docs/rest-api/deployments/create-a-new-deployment). Each repository has a stable
project name, shared across workshop terms and retries. Existing projects must still be linked to that repository.

Vercel deploys its project's production branch (the repository's default branch on initial import), including subsequent
pushes. The workshop's branch patterns and commit bounds continue to control the displayed history independently.
Vercel uses the repository's build configuration; projects needing secrets or a monorepo root must be configured in
Vercel. Failed deployments show Vercel's reported error code and message, distinguish canceled/blocked builds and
production-address assignment failures, and offer Czech recovery steps for the reported problem. Build errors include
an expandable excerpt of the last 30 log lines (at most 6,000 characters), fetched only after failure through Vercel's
[build events API](https://vercel.com/docs/rest-api/deployments/get-deployment-events). Diagnostics strip terminal
formatting, configured Vercel credentials and recognizable secret assignments before reaching the signed-in admin;
other provider metadata is omitted. Missing logs or error details leave fallback checks and the Vercel inspector
(or project dashboard) available. Fix the reported problem before retrying; status checks can be resumed after a
connection failure without starting another build.

Once the build is ready and its production alias is assigned, the form fills in that public URL. Shared admin autosave
saves it through the existing repository/deployment validation and makes it available to participants. A manual URL,
repository change or room switch discards the previous form's pending result; it does not cancel the remote build.
No workshop schema or database migration is needed. The landing application's environment variables are never sent to
the workshop deployment. Missing credentials leave manual deployment URLs available.

### Automatic submission approval

Chat in workshop/community rooms (including project discussions), member-written poll answers, and community project
submissions share one server-side AI review. Apply the database migrations, then set this private variable to enable it:

```dotenv
WORKSHOP_AUTO_APPROVAL_API_KEY=YOUR_OPENAI_API_KEY

# Optional; defaults shown
WORKSHOP_AUTO_APPROVAL_MODEL=gpt-4.1-mini-2025-04-14
WORKSHOP_AUTO_APPROVAL_BASE_URL=https://api.openai.com/v1
```

An alternative HTTPS endpoint must support the same Chat Completions request and strict JSON schema response format.
The default model supports [structured outputs](https://developers.openai.com/api/docs/models/gpt-4.1-mini);
responses are also validated locally, including [refusals and incomplete output](https://developers.openai.com/api/docs/guides/structured-outputs).

Only pending contributions are reviewed, after successful persistence and the existing authentication/validation.
Trusted members and moderators still publish immediately, and banned participants cannot gain AI approval. The reviewer
can approve clearly suitable text or leave it for a human; it never rejects, edits, pins, or changes participant trust.
Only the contribution text/URLs and, for poll answers, the question are sent to the configured provider. Participant
names, e-mails and session data are not added to the request, although a member's text may itself contain personal data.
Project preview URLs are included as metadata; linked pages and images are not fetched or visually reviewed by the AI.

Each review has an eight-second timeout and no retries. Missing configuration, unavailable AI, or uncertain/invalid
responses leave the saved contribution pending in the existing moderator queue. Removing the key disables AI review.
Existing pending items are not bulk-processed. Concurrent edits, moderation decisions, deletion, or an author ban prevent
approval of the stale submission. Successful approvals record only the item kind/id, configured model and time in the
private `workshop_submission_auto_approvals` table. Existing visibility, poll votes, refreshes and manual moderation remain
the source of truth. This feature introduces no participant-facing AI configuration.

### Book agents in workshop and community chat

Apply the pending migrations through `npm run migrate-database`, including the Book-agent schema and live-session
publication migration. The **Agenti** tab in
`/admin/workshops` and `/admin/community` creates reusable personalities using `BookEditor` from
[`@promptbook/components`](https://github.com/webgptorg/promptbook). A definition's name, source Book and global enabled
switch are shared. Reply/listening switches and cooldowns apply only to the selected room. New definitions are assigned
only to the room where they were created; select an existing agent in another room to enable it there. Turning both
room switches off removes its participation while preserving its history.

```dotenv
OPENAI_API_KEY=YOUR_OPENAI_API_KEY

# Optional: override the model declared in source Books (normally leave unset)
# WORKSHOP_AGENT_MODEL=gpt-4.1-mini

# Optional speech-to-text model; default shown
WORKSHOP_AGENT_TRANSCRIPTION_MODEL=gpt-4o-mini-transcribe

# Optional scheduler credential for hosts that suspend idle processes
# WORKSHOP_AGENT_CRON_SECRET=YOUR_RANDOM_SECRET
# WORKSHOP_AGENT_BACKGROUND_WORKER=false
```

The server creates a fresh `LiteAgent` from `@promptbook/node` for each reply, using the saved source Book and its
personality, goals, rules and model. Context includes the room description, approved chat names/text and recent live
speech; it excludes participant email/session records, pending messages and paid materials. There is no fallback
personality or model call when the key is missing. Books are private, administrator-controlled agent configuration.

Only newly approved comments trigger replies, through the same database trigger for human moderation, automatic
approval, trusted participants, artificial comments and agent output. Old comments are not backfilled. At most two
agents answer a human/artificial message, and one other agent may respond to each reply, stopping after two agent
turns. Per-agent cooldowns, a single in-flight generation per room, leases and unique reply keys bound activity and
prevent duplicates. An agent can return `[SKIP]`. Calls time out after 25 seconds and failed jobs retry at most three
times; comment jobs expire after 30 minutes and live-question jobs after two minutes. Publication rechecks the Book,
assignment, room, source text, moderation and author ban. Bots have no participant session, votes or membership access.

Participant chat uses the existing rendering and moderation controls. Admin comment badges and CSV exports distinguish
`user`, `artificial` and `agent`, with agent/run identifiers. Books, private transcripts and execution snapshots are
stored in service-role-only tables. The legacy `is_artificial` flag remains true for both synthetic origins, so existing
link handling and analytics continue to work.

For live questions, enable listening on an agent during an ongoing workshop, then click **Sdílet zvuk workshopu**
and select the browser tab playing the stream with **Share tab audio** checked. Alternatively choose **Použít mikrofon**
on the presenter's device. Use a browser supporting tab-audio capture, such as desktop Chrome/Edge. The admin page and
its Agents tab must remain open; navigating away or pressing Stop ends capture. Only audio is uploaded, in independently
decodable 15-second segments. OpenAI's [transcription endpoint](https://developers.openai.com/api/docs/guides/speech-to-text)
produces a private rolling context for questions; audio itself is never stored. Transcripts remain in the private
database history, with only the last five minutes from the current, unexpired capture supplied to an active live room.
Restarting capture never inherits the previous session's speech. One capture session per room and
deduplicated sequence numbers prevent duplicate transcription. Stopping capture, replacing the session, ending the
workshop or disabling listening prevents an in-flight live question from publishing. Publication locks the capture
session so a concurrent Stop cannot slip between its validity check and the saved question. This does not automatically
extract audio from the cross-origin YouTube iframe; the presenter explicitly selects the live audio source.

Persistent Node.js servers poll the durable queue every five seconds; authenticated room requests also schedule work
with Next.js `after()`. On hosts that suspend idle processes, configure a scheduler to `POST /api/workshop-agents/run`
with `Authorization: Bearer <WORKSHOP_AGENT_CRON_SECRET>` at the desired cadence (e.g. every minute). Each call handles
up to two jobs and needs a 60-second execution budget; the audio upload route allows 90 seconds for transcription and
follow-up work. `WORKSHOP_AGENT_BACKGROUND_WORKER=false` disables only the persistent timer. The entire feature stays
inactive without `OPENAI_API_KEY`, and project discussions and externally organized events do not offer agents.

Queue integration tests run the actual migration/functions in an isolated in-memory PostgreSQL (PGlite), without
connecting to `DATABASE_URL` or making billable model calls. Audio and model tests use mocked providers.

## Workshop video subtitles

Open `/admin/workshops?tab=subtitles`, select a workshop, and use **Přidat titulky**. Each independent track can be
Czech, English or mixed Czech/English. Import an SRT/WebVTT file, paste timed subtitles, or load the selected language
from the workshop's YouTube video. Authored captions take precedence over automatic captions. The public mobile player
response is tried first, with the watch page as a fallback. This integration needs no API key, but YouTube may block
server requests, withhold tracks or return empty captions;
the editor reports this and keeps file import and transcription available. It does not translate missing languages.

**Vygenerovat titulky z nahrávky** uses the existing private `OPENAI_API_KEY` and the
[OpenAI transcription endpoint](https://developers.openai.com/api/docs/guides/speech-to-text) with `whisper-1`,
which supports segment timestamps. Choose the original video/audio file including its intro. The existing Mediabunny
browser decoder extracts its primary audio track into 90-second mono WAV chunks below 3 MB; audio goes to OpenAI,
never into database or file storage. Chrome/Edge and a decodable audio codec are required; WAV is a useful fallback.
The transcription route needs a 90-second execution budget per chunk. Keep the page open until it finishes or cancel
the operation; failures leave existing tracks unchanged. Mixed-language transcription omits a forced language hint.

Review the generated draft and explicitly add it. Existing tracks autosave in the shared admin dialog and download
as UTF-8 WebVTT or SRT. Times always refer to the original recording, independent of its playback start offset.
Changing a workshop's video retains old tracks with a warning. Subtitles live in the new private `workshop_subtitles`
table (migration `2026-09-2600-workshop-subtitles.sql`), are not copied when duplicating a term, and are not exposed by
participant APIs or public database roles. They are separate from the ephemeral live transcripts used by Book agents.

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
| Page, route handler, metadata route, or redirect | `app/` |
| Reusable presentation component | `components/` |
| Domain behavior, validation, database access, API helpers, or shared types | `lib/` |
| Database schema and data evolution | `migrations/` |
| Operational scripts | `scripts/` |
| Unit and component tests | Beside the code as `*.test.ts` or `*.test.tsx` |
| Browser-level regression tests | `tests/e2e/` |
| Static assets | `public/` |

Keep the generic homepage in sync across languages: `/cs` defines its structure and source copy, while `/en` is the English localized counterpart. Keep domain rules in `lib/` and let route handlers and components stay focused on transport and presentation.

## Contributing

1. Read [AGENTS.md](./AGENTS.md) for the route map and repository-specific constraints.
2. Make the smallest focused change and add or update the closest relevant test.
3. Run the verification commands appropriate to the change.
4. Keep credentials and production data out of commits; `.env`, backups, and E2E artifacts are intentionally ignored.

## License

This repository is available under the [Apache License 2.0](./LICENSE.md).
