# Synchronized source preparation

## Analysis before implementation (2026-09-28)

The implementation originating in `prompts/2026-09-0440-admin-recording-studio.md` is
`app/admin/recording-studio/page.tsx` → `RecordingStudio` → `useRecordingStudio`.
`RecordingLibrary` opens `RecordingEditor` in `AdminEditorButton`. Each review element
currently has native independent controls. The two numeric trim inputs are already
session-wide, not per-source. There is no spatial image-crop implementation in these paths.

`RecordingStudioCapture` creates a UUID per take and retains source configuration IDs.
Its monotonic clock records start-call offsets and acknowledged chunk durations. These
are browser observations, not hardware timestamps. Failures stop all sources; recovery
retains committed prefixes. `durationSeconds` is the shortest common committed end,
while `captureEndSeconds` and individual track ends can extend beyond it. The editor
must not hide those tails or stretch encoder duration to match a wall clock.

IndexedDB v2 uses recording IDs and `[recordingId, trackId, sequence]` chunk keys. Directory
recordings use an authoritative JSON checkpoint, immutable parts and a cached handle.
Existing IDs must remain unchanged: no rekeying, media copying or database migration is
needed. Older edit state is a nullable shared `trim`; adaptation can derive a versioned
recipe on read and persist it only on editing. Directory validation must preserve it.
(Directory recordings were retired on 2026-10-05; see `recording-studio-storage.md`.
This analysis and the results below describe the studio as it was when they were written.)

`recordingStudioExport.ts` already streams ZIP64 and individual originals, with a 256 MiB
buffered ZIP limit. `recordingStudioTrim.ts` uses Mediabunny and one OPFS temporary file.
Its conversion defaults allow copied media boundaries to expand. Prepared output must
use exact timestamp-preserving transcoding, validate every audio/video component, report
actual output bounds, and explicitly fall back to originals/recipe for unsupported or
discontinuous media. Never conceal a hole by concatenating samples.

The browser-wide lock and shared admin save queue already cover capture/recovery,
editing, deletion and export. A persistent route-group shell will retain their owner
across setup/editor navigation, excluding the independent capture diagnostic.

## Timing contract

All API/model/manifest times are seconds. The timeline is the original session clock.
Source-local zero is mapped by recorded segments (legacy: start-call offset, rate 1).
Container timestamps, including the first timestamp, remain distinct from source-local
time. A shorter decoder duration clips availability; it never rescales or shifts media.
Prepared time zero denotes the common selection start. Unknown capture tails remain unknown.
Prepared video resamples to the recorded nominal frame rate when one exists and records
that rate/processing in the manifest; unknown rates retain original cadence. This gives
WebM a definite final-frame duration without collapsing session gaps. Unmodified originals
remain available with every original frame and its original cadence.

Preview target: at most 100 ms media-clock error after seeks settle; this is not a
claim of hardware genlock or identical physical device latency. A shared monotonic
transport waits for asynchronous seeks/buffering, corrects drift, and hides unavailable
frames. Decoder/frame-rate and device-latency limitations are reported separately.
Playback starts are a separate barrier: decoders start at rate zero, and only after their
play promises settle does the transport release the common rate and clock. Timeout,
cancellation and retry retain that session position. Pausing and revealing a hidden
source request a decoder seek even when its media clock already reports the target;
the last rendered frame can otherwise lag behind that clock. Small ongoing drift uses
a temporary rate adjustment bounded to 15% of the requested speed, returning to that
speed within the 25 ms seek tolerance. Larger drift or unavailable decoder data uses
the shared barrier. Frames outside the alignment window stay hidden while correcting.

Relevant primary documentation: [Mediabunny conversion](https://mediabunny.dev/guide/converting-media-files),
[copy boundary policy](https://mediabunny.dev/api/ConversionCopyOptions),
and [bounded media sample retrieval](https://mediabunny.dev/guide/media-sinks).
The [HTML media standard](https://html.spec.whatwg.org/multipage/media.html#dom-media-playbackrate)
defines playing at rate zero without advancing the media position. This is a decoder
start barrier, not a measurement of hardware capture latency.

## Verification

Verification on 2026-09-28 used Windows with Playwright Chromium 151.0.7922.34
and installed Edge 154.0.4258.37.

- All 90 studio unit tests passed, including legacy IndexedDB migration, directory
  checkpoints, segment gaps, delayed seeks/starts, buffering, drift, cancellation,
  timeout/retry and large byte counters.
- The initial 21-case studio browser suite completed with 20 passes and one timecode
  test passing on retry. The first attempt exposed a stale screen frame 308 ms behind
  an already-correct media clock after pausing. This was fixed by forcing a decoded
  seek and adding the playback-start barrier. All four affected browser cases then
  passed on their first attempts, including a delayed real-decoder acknowledgment.
- Edge exposed a further startup-clock delay around 117 ms at 2x speed. Seeking on
  every small deviation repeated that delay; bounded rate correction now closes it
  while the master continues. Three other Edge preparation cases passed, and the
  synchronization/export case passed on its first attempt after this correction.
  The test resets its short fixture interval before checking speed so it does not
  attempt to pause a clip that has already ended.
- The fixture has screen video at 25 fps, camera plus audio at 30 fps with a 0.37 s
  startup offset, and standalone audio with a 0.71 s offset. Rendered timecodes at
  session seconds 1, 2, 4 and 7 differed by at most 30 ms; after playback and pause
  the largest observed frame error in the final Chromium run was 28.2 ms (38.5 ms
  in Edge). Live source-clock samples in Chromium were within 36.2 ms of the shared
  displayed time. Audio seek mappings matched the requested times. The target remains
  100 ms after settling; these are measurements of the fixture, not all hardware.
- The browser cases also cover hide/solo/mute, common pointer/keyboard trim and undo,
  autosave failure/retry, refreshed and back-navigated deep links, missing local data,
  corrupt media/retry, cancelled exports, individual downloads and a 390 px layout.
  An incomplete trim draft blocks export even while the export locks the form fields;
  disabled native inputs never turn an empty time into a saved zero.
  A segmented fixture seeks to 09:59:51 and retains the preceding gap; it does not
  contain ten hours of captured media.
- FFmpeg 7.1 independently decoded the exported 1.25–6.25 s interval. Both videos
  began at prepared time zero and ended at exactly 5.000 s after nominal-cadence
  preparation. Both audio streams decoded to 5.0135 s. Five claps in each audio
  stream were within 1.05 ms of their expected prepared positions. First/last video
  timecodes were 1.24/6.24 s. This confirms the declared 50 ms export tolerance,
  separate assets and retained camera audio; it is not a human NLE review.
- A direct OPFS probe confirmed that deleting a temporary backing file invalidates
  subsequent reads through both its `File` and a wrapping `Blob`. Individual prepared
  downloads therefore finish streaming to a selected destination before cleanup, or
  detach at most 256 MiB into a small download Blob. Larger files without a disk picker
  explicitly require originals plus recipe, avoiding a large hidden memory copy.
- A real synthetic-camera capture occasionally failed the strict 50 ms boundary
  check and correctly exported the original/recipe fallback. The captured regression
  fixture has a long frame from 2.410 to 2.531 s crossing OUT at 2.5 s. WebM SimpleBlocks
  do not store that last frame's duration; a variable-cadence output could end early.
  Explicit nominal-cadence preparation now retains the selected duration and discloses
  resampling. The dedicated browser regression checks video, embedded audio and its
  downloaded JSON sidecar against that same captured input.

Reproduce the media check after the fixture browser test:

```powershell
npm test -- lib/recording-studio
npm run test-e2e -- tests/e2e/recording-studio.spec.ts
# FFMPEG_PATH may name an installed FFmpeg binary when it is not on PATH.
node scripts/checkRecordingStudioEditor.mjs tests/e2e/.artifacts/recording-studio-synchroni-79a50-pared-separate-source-files/prepared-fixture.zip
```

Physical macOS/Safari, physical Windows devices/pickers, Linux, a genuine ten-hour
capture/greater-than-10-GB soak, and manual professional-editor import were **not run**.
Device capture uses canvas video and synthesized audio in these tests; filesystem,
MediaRecorder, decoders, transcoding and ZIP output remain real. Browser automation
and simulated long timestamps do not establish hardware synchronization or Mac behavior.
