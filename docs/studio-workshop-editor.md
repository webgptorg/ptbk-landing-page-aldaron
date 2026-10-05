# Studio: workshop projects and direct storage uploads

## Analysis of the existing implementation

The implementation was inspected before changing it. `RecordingStudio` and `useRecordingStudio` already own capture,
the browser lock, takeover, IndexedDB persistence and admin navigation protection. `RecordingEditor` already has
one `RecordingStudioTransport`, source offsets/segments, a zoomable timeline, common trim, derived tracks, workshop
metadata and bounded original/prepared exports. It edits one `StudioRecording`; it did not assemble independent
recordings or external sources. `RecordingWorkshopEditor` stores reviewed workshop annotations, rather than rendering
a composition. `RecordingStudioPublish` prepares and publishes a recording explicitly through the hosted workshop
service. Its upload client sends media bodies through the application server; it is not direct browser-to-S3.

Studio extends those concepts. Projects add a metadata assembly above immutable source recordings; their source
placements adapt to the existing transport and `recordingStudioSessionTime`. The old raw recording editor, source
downloads, prepared exports, YouTube settings and participant publication/access checks remain available. The new
independent asset-upload service shares hosted storage configuration and multipart primitives. It does not create
a workshop, publish a room, or reuse the old application-server media-body route.

## Navigation, authority and local persistence

- `/admin/studio` opens `/admin/studio/recording` (**Nahrávání**).
- `/admin/studio/recording/<recordingId>` opens the existing raw recording workspace/export tools.
- `/admin/studio/editor` opens **Střižna**, its project list and completed recording library.
- `/admin/studio/editor/<projectId>` opens one independent workshop project.
- Authenticated legacy `/admin/recording-studio` and `/admin/recording-studio/<recordingId>` addresses permanently
  redirect to the corresponding recording view. The existing capture probe and transcription API retain their URLs.

The common layout mounts one Studio owner across both sections. Only section links explicitly marked as preserving
Studio bypass waiting for a capture's long-running operation; they still flush editor drafts. Capture continues when
the editor section is visible, and project changes/uploads stay disabled until capture finishes. Other navigation,
sign-out, reload, takeover, exports and writes retain the shared protection and generation fencing. Editing does not
initialize capture devices or require camera/microphone permission; capture capability is checked when used.
Both browser-local editor views load on demand without server rendering, keeping their media/analysis dependencies
out of the server rendering graph while leaving the common owner mounted.

IndexedDB schema 5 adds `projects`, `assets` and `assetUploads`. These contain small versioned recipes, file handles
and upload manifests, not imported media. Existing chunk records gain a byte-offset index; migration only updates
their metadata. It preserves schema 4's retirement of folder recording. A Studio-scoped service worker streams local
recording ranges in bounded windows from the same chunks after checking the admin session. It stores no media cache
and has no notification/push role.

**Otevřít ve střižně** deterministically creates or reopens the recording's project. It references the existing
recording/track/part IDs and never copies chunks, downloads a ZIP or uploads anything. Another recording can be added
from the source library. Appended takes require **Přidat nově donahrané části**; old cuts and metadata retain their
pinned timing/revision. Interrupted sources expose their committed ranges and are labelled. Deleting a recipe or
removing a part does not remove media. Recorder deletion atomically checks project references and refuses a referenced
source, including when its current playback location is remote.

Projects remain local to a browser/profile. A project URL does not synchronize metadata or trigger bulk downloads.
A missing project/source is explicit. Importing a portable recipe into another profile is not implemented; the export
provides source identities, timing and relink instructions for other tools.

## Sources, assembly and composition

An asset has a stable ID, immutable original identity/timing and a separate current location. Its original may be
an IndexedDB recording part, a read-only local file, or a direct HTTPS URL. File pickers/drop use a
`FileSystemFileHandle` when available. Restored handles query read permission; **Povolit čtení** requests it from an
explicit click. Without a persistent handle, the original `File` is session-local and must be reselected after reload.
Object URLs are disposable playback resources, never saved identities. Relinking checks size, modification time,
bounded head/tail signature and measured timing. Changed files do not inherit existing cuts. This follows the
[Chrome File System Access guidance](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access).

HTTPS imports probe bounded ranges and then use native progressive media playback. They require readable 206
`Content-Range`, exposed range headers, CORS and supported indexed media. No whole remote download is made into a Blob.
Inaccessible, expired, unindexed or unsupported sources report an individual error while retaining the recipe. A new
URL must match the source signature, dimensions and timing. All arbitrary URL reads occur in the browser; server
verification reads only authorized object keys from configured storage.

Projects separate reusable assets, named logical tracks/roles, linked part groups, clip placements and scenes. All
times are explicit seconds. A common part trim/cut/reorder moves simultaneous sources together. External sources
are aligned manually within a chosen group; drop order and filenames never establish synchronization. Up to eight
logical tracks are active. Overlapping groups or clips on one track are invalid drafts and cannot save/export.
Their preview shows no winning source while the administrator fixes the overlap.
Shorter tracks and explicit gaps remain empty, with no held stale frame. Invalid numeric drafts stay editable and
dirty without sending non-finite positions to the transport.

One composite canvas draws the same native video decoders used by the raw monitors. The composition track stores
hard-cut scene boundaries, background/overlay/audio references, normalized coordinates, rectangle/circle mask and
contain/cover fit. The fullscreen, rectangular camera and circular camera presets are metadata only. A scene chooses
one audible source; raw-monitor listening is separate and does not change the recipe. Source changes at part joins
join the same decoder barrier. A gap, lost source or waiting decoder leaves the preview empty. The existing post-settle
target is 100 ms, not hardware synchronization.

Scene boundaries have draggable and keyboard-accessible handles on the shared timeline, constrained to their linked
part and neighboring cuts. One drag is one undo step. Removing a clip or an unused logical track only changes the
recipe; it does not remove its source asset. The same undo history covers linked assembly and composition changes.

Pinned event markers, activity ranges, private derived subtitles, Auto-view choices and commit anchors map through
the same group trim and assembly. Source-specific derived cues additionally follow manual clip alignment from their
immutable original placement. Unknown revision/source mappings are labelled unavailable. A project recipe includes
original/project/prepared coordinates; prepared metadata is clipped to the common IN/OUT and rebased by its start.
The portable JSON strips file handles and signed/query authorization URLs, includes relink information and keeps S3
references as stable object identities. It neither publishes private subtitles nor requires a flattened video export.
Original and prepared source exports remain in the recording workspace.

## Explicit direct browser-to-S3 conversion

**Nahrát na CDN** uploads one or selected local assets only after capture. A project can stay local or mix local,
external HTTPS and private storage sources. Local originals remain intact after successful conversion; no automatic
local cleanup or external-file deletion is offered. **Použít místní originál** explicitly restores the original
playback location after checking it is still readable, while retaining the verified remote object.

The client first hashes bounded 8 MiB portions and persists their SHA-256 manifest. The authenticated server allocates
an immutable `studio-assets/<uuid>` key/upload identity and signs parts for ten minutes. Two bounded parts can upload
concurrently, directly from Chromium to the storage origin, with per-file/total progress, four attempts per failed
part, refreshed signatures and pause/cancellation. No media-body proxy or server temporary upload file is used.
On resume the client revalidates the source and reconciles storage's part numbers, lengths and checksums; different
bytes cannot join the same upload. This uses the [S3 multipart model](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html).

Completion claims a conditional lease, checks every expected part and independently verifies HEAD size, immutable
source metadata, the SHA-256 composite of part digests, media bounds and ranged packet seeking. A multipart ETag is
not a whole-file checksum. The browser additionally checks remote ranges and native seeks at 25%/98%. Only then does
a fenced local transaction change the asset's location. Its ID, source timestamps, cuts, scenes and audio selection
remain unchanged. Failure, pause and cancellation keep the original active. Lost allocation/completion/cancellation
responses have persisted recovery descriptors; uncertain outcomes remain fenced until independently reconciled.

An unindexed recording part uses the existing forced packet-copy index rebuild, with one disclosed OPFS working file,
without re-encoding or timestamp shift. Index inspection reads only the structural head/tail; preparation reads
bounded IndexedDB ranges through the shared packet-copy input, without first collecting every chunk into a Blob.
Its prepared bytes and small identity manifest survive upload pause/reload;
regenerating different container bytes cannot silently resume an existing upload. The working file is removed after
verified conversion or explicit cancellation. Importing external files does not use this preparation or write their
media to IndexedDB/OPFS. Unsupported preparation reports its limitation and leaves the source local.

Control endpoints are under `/api/admin/studio/assets`: registration/configuration, asset status/completion/cancellation,
`<assetId>/parts/<partNumber>` signing, and `<assetId>/read` private playback signing. `/api/admin/studio/projects/<projectId>/references`
registers retention. All require the existing admin cookie/origin guard; registration JSON is bounded to 1 MB.
Private read signatures expire after ten minutes and refresh from stable IDs. Signatures and credentials never enter
portable recipes. No participant route gains access through a Studio upload.

`2026-10-0500-studio-media-assets.sql` adds private asset/reference tables and serialized reference/cleanup functions.
Use the repository migration command at deployment; this work did not migrate the production database. The existing
hosted cleanup scheduler also checks Studio's separate namespace: referenced objects are protected, unreferenced
pending objects have a seven-day retention window and verified unreferenced objects thirty days. Explicit project
deletion releases references after local deletion; failed reconciliation conservatively retains objects. Cleanup aborts
unregistered abandoned multipart uploads and verifies existing objects before deleting them. Referenced pending
uploads are retained for explicit resume/cancellation. Ordinary autosave never releases remote references.

## Deployment and CORS

Reuse the server-only `HOSTED_RECORDING_S3_ENDPOINT`, `HOSTED_RECORDING_S3_BUCKET`, `HOSTED_RECORDING_S3_REGION`,
`HOSTED_RECORDING_S3_ACCESS_KEY_ID` and `HOSTED_RECORDING_S3_SECRET_ACCESS_KEY`. The same server identity needs object
put/get/delete, multipart listing/abort and bucket multipart listing for `studio-assets/` as well as the existing
`workshop-recordings/` namespace. Missing storage/database configuration disables this integration, not local editing.

Optional `HOSTED_RECORDING_S3_PLAYBACK_ENDPOINT`, `HOSTED_RECORDING_S3_PLAYBACK_REGION` and
`HOSTED_RECORDING_S3_PLAYBACK_PATH_STYLE` configure a different read hostname before signing (path style defaults true).
It must serve the same private objects and honor SigV4. An arbitrary public CDN hostname is not a substitute; changing
a signed hostname afterwards invalidates authorization. The bucket stays private.

Configure the actual deployment origin on both upload and playback endpoints. An AWS-style example is:

```json
[
  {
    "AllowedOrigins": ["https://ptbk.io"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["Range", "Content-Type", "x-amz-*"],
    "ExposeHeaders": ["ETag", "Accept-Ranges", "Content-Range", "Content-Length", "x-amz-checksum-sha256"],
    "MaxAgeSeconds": 600
  }
]
```

Follow the provider's [CORS configuration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ManageCorsUsing.html)
and test it from the real origin. Do not apply the old workshop one-day incomplete-upload lifecycle rule to all Studio
uploads; it would invalidate protected resumable uploads. The integration fixture uses a private MinIO build from
[official commit 07c3a429bfed](https://github.com/minio/minio/tree/07c3a429bfed), corresponding to its 2025-09-07 release.
That build returned `NotImplemented` for bucket CORS configuration; its native API CORS middleware was configured with
`MINIO_API_CORS_ALLOW_ORIGIN=http://127.0.0.1:4009`. This provider-specific result is not a claim that every S3 endpoint
has the same configuration or checksum support. Unsupported checksum/CORS behavior fails verification and keeps local
media available.

## Google Drive feasibility

The supported [Drive download API](https://developers.google.com/workspace/drive/api/guides/manage-downloads) provides
binary content through `files.get` with `alt=media` and supports Range requests. It also requires download capability
and authorized access. A preview iframe/sharing URL cannot join the native multitrack transport; assigning a URL to a
native media element does not provide OAuth Authorization headers. A viable adapter needs minimum file access
(`drive.file` for explicitly selected files), refreshed authorization, bounded ranged delivery to a native decoder,
and measured seeking across long-source joins.

The available Drive connector exposes metadata and complete-file downloads, without browser OAuth credentials or
an authorized ranged-media transport. It cannot establish this editor's private native-video interoperability.
No application OAuth configuration or explicitly selected video test grant was supplied. Actual authorized ranged
reads and synchronized seeking/composition therefore remain unproven. Direct Drive URLs are explicitly refused
with local-file/CDN relinking guidance; the adapter is disabled. This is a configuration/testing limit, not a claim
that the supported Drive API cannot range-read private binary video. No private recording is made public and no Drive
manager or guessed download URL is introduced.

## Verification and reproducibility

The ordinary unit suite covers source identity/permissions, range parsing, linked trim/reorder/split, pinned metadata,
portable recipe coordinates, resumable parts/cancellation/wrong-source checks, operation recovery and authenticated
allocation/signing/completion/read routes. PostgreSQL-compatible migration tests exercise immutable identities,
private grants and reference/cleanup serialization. Existing hosted publication/access tests run alongside it.
The final ordinary run passed 2,231 tests; the two opt-in real-storage tests were run separately. Lint and
the required production build followed by TypeScript checking passed, with existing lint warnings unchanged.

The check-reliability rerun on 2026-10-06 passed the unchanged `npm run check`: lint, production build followed by
TypeScript, 183 browser tests (four existing conditional skips), and test-data cleanup. No test retried and the server
did not restart, including during the previously interrupted metadata/domain check. Next's trace recorded 477 requests
and a peak used heap of 6,535 MiB with the explicit E2E budget. The focused Studio/hosted-recording unit run passed
282 tests; its two opt-in storage tests were not configured for this rerun. The separately measured long-media,
MinIO and Drive feasibility results below are not additional claims from this check-reliability rerun.

Browser tests cover editor-only operation without capture APIs, real recorded-source discovery/open/reopen without
chunk copies, composition/reload/joins, HTTPS 206 seeking and CORS/range/expiry failures, active capture section
navigation, native rendered timecodes/prepared exports and cross-tab takeover. Run:

```sh
npx vitest run lib/recording-studio lib/workshops/hostedRecording
E2E_BASE_URL=http://127.0.0.1:4009 npx playwright test tests/e2e/studio-projects.spec.ts
```

Use a development server with the in-memory test database, never a production database for browser fixtures:

```sh
DATABASE_URL='' SUPABASE_SERVICE_ROLE_KEY='' E2E_IN_MEMORY_SUPABASE=true E2E_KEEP_COMPILED_ROUTES=true npx next dev --disable-source-maps -p 4009
```

Playwright uses that same Next development flag to omit Node's additional source-map cache across the full retained
route graph. Its owned E2E server also defaults to a 10 GiB old-space heap budget; Next's normal half-of-RAM default
could restart during late metadata requests even after editor loading was made lazy. An explicit heap limit in
`NODE_OPTIONS` is preserved, as are other Node options. Allow RAM for the browser and other processes in addition to
the server; an external test server owns its own resource configuration. Browser source maps, failed-attempt traces,
assertions, Next's memory safeguards and the complete aggregate check remain enabled.

Generate long containers with `node scripts/generateStudioIntegrationFixtures.mjs <temporary-directory>`, then run
the five-hour test with `STUDIO_LONG_MEDIA_DIRECTORY` pointing there. The measured project had three 6,001-second
containers in Chromium 151.0.7922.34 on macOS arm64,
four tracks per part, and 18,001 seconds after a linked trim and reorder. An application clip was aligned by
0.25 seconds and all scenes selected one audio track. Six settled seeks covered both joins and the end: native
media-clock deviation was 0 ms, decoded editor-frame deviation 0–20 ms, seek settling 88–133 ms, four active media
elements and approximately 116 MB reported Chromium JS heap. Imported media bytes in IndexedDB were zero. The files contain repeated
encoded fixture content (about 473 MiB across four unique files). This establishes long-container range/assembly/seek
behavior, not a five-hour capture/playback soak, high-bitrate workshop run or physical device synchronization.

A separate 6,001-second WebM generated with FFmpeg's `-live 1` had neither a stored duration nor a seek index.
The recorder-library test opened its existing IndexedDB chunk directly and checked native playback clocks and decoded
frame timecodes at 1, 3,000 and 5,999 seconds against the 100 ms target. All three passed; opening/seeking added no
media chunks or bytes. This verifies that container's browser seeking, rather than a five-hour recorder soak. Reproduce
with a temporary file and the same isolated development server:

```sh
ffmpeg -stream_loop -1 -i tests/e2e/fixtures/recording-studio/screen.webm -t 6001 -map 0 -c copy -live 1 /tmp/studio-live.webm
STUDIO_UNINDEXED_MEDIA_FILE=/tmp/studio-live.webm E2E_BASE_URL=http://127.0.0.1:4009 npx playwright test tests/e2e/studio-projects.spec.ts --grep 'long unindexed recorder'
```

The opt-in `studioS3.integration.test.ts` uses a real Chromium file, native storage PUTs/reads and the actual control
handlers against a conditional-row test database. Its separate migration test exercises SQL permissions/retention.
Provide `STUDIO_S3_TEST_CONFIGURATION` as a private JSON file with endpoint/bucket/region/accessKeyId/secretAccessKey,
`STUDIO_S3_TEST_DIRECTORY` as a temporary directory and `STUDIO_INTEGRATION_BASE_URL` as the running origin. Never use
a production bucket. It hashes and uploads a valid indexed MP4 extended with a legal sparse `free` atom to
2 GiB + 1 byte. It pauses after two storage receipts, reloads/reselects/resumes, rejects a changed middle byte even
when the bounded import identity still matches, and makes an actual one-second presigned URL expire before its native
PUT. Storage returns 403 and the client refreshes that part's signature. The full bytes actually traverse the network;
the encoded video itself is short, so this is not multi-gigabyte high-bitrate decoder evidence.

The private MinIO run completed 257 parts in approximately 103 seconds, with 259 direct browser storage PUT attempts
(including retry/in-flight requests). Its largest application control body was 12,720 bytes. Storage checksum/length
verification and native remote seeking passed; anonymous object access returned 403. The asset ID, original source,
clip bounds and recipe remained intact through conversion, with zero imported media bytes in IndexedDB. A separate
16 MiB endpoint fixture exercised native presigned PUTs, real multipart abort (`NoSuchUpload` afterward), failed media
timing verification, and refusal of concurrent/cancel/late completion claims. Those actual control handlers use the
same conditional-row test database; immutable grants and reference retention are separately tested with PGlite.
No production database or bucket was used.

An earlier artificial WebM fixture with over 2 GiB of sparse EBML padding passed server packet/checksum validation
but timed out in Chromium's near-end native seek. The editor kept its local source and refused the location change.
The successful MP4 run must not be generalized to every container; native seek verification remains a required gate.

Unavailable checks: production endpoint/CORS deployment, physical file-picker permission behavior across OS/profile
changes, a five-hour capture/playback soak, and authorized Google Drive interoperability. Short fixtures and simulated
timelines are kept separate from those claims.
