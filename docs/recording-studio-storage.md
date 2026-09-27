# Recording studio storage: investigation and verification

Investigation date: 2026-09-27. This extends `/admin/recording-studio`, originating in
`prompts/2026-09-0440-admin-recording-studio.md` (marked implemented) and its archived trace.

## What caused the misleading display

The owner's observation is **about 70 GB free in macOS, about 10 GB continually displayed by the studio**.
The exact macOS release and browser name/version have been requested and are **not yet supplied**. The browsing
mode is also unknown.
No claim is made that this observation reproduces a recording failure or establishes a 10 GB recording limit.

The pre-change call chain was `RecordingStudio.tsx` → `useRecordingStudio.ts` →
`estimateRecordingStorage()` in `recordingStudioStorage.ts`. It used
`navigator.storage.estimate().quota - usage` directly, with no numerical fallback. Missing APIs yielded null.
The hook refreshed every five seconds, on initial recovery, and after capture/library operations. The UI called
the result free space and derived a precise `HH:MM:SS` remaining-time estimate from it. The known application bug
was treating origin headroom as a usable capacity measurement. There was no hard-coded 10 GB ceiling, no directory
capacity measurement, and no evidence that polling state alone caused the owner's constant number. Units were
already binary KiB/MiB/GiB, whereas the macOS observation was expressed as GB; 10 GiB is 10.73741824 decimal GB.

Capture used one `RecordingStudioCapture` with a monotonic common clock and sequential IndexedDB transactions
containing both media and counters. Normal chunks arrived about once a second. The 64 MiB write limit previously
stopped only after retaining the excess chunk. Export already used ZIP64 and a native save picker when available;
trim used OPFS temporary files. The capture destination was exclusively IndexedDB. No selected-directory capture
backend existed to reuse. The storage services, existing lock, source IDs, editor, ZIP library and capture
coordinator are retained, and storage routing is added there.

## Primary research and version-specific evidence

- The [Chromium discussion](https://groups.google.com/a/chromium.org/g/blink-dev/c/7q0YGQNVkjs/m/BJH9kfmIEgAJ)
  proposed reporting usage plus 10 GiB, independently of enforcement. Its initial milestone was a proposal,
  not evidence about the owner's browser.
- [Chromium's March 2026 change](https://chromium.googlesource.com/chromium/src/+/5ea1a8173ecce289953d0e3f23a869e7389e8bdb%5E%21/)
  enables `StaticStorageQuota` by default and describes Finch activation for M144–M148.
  [Quota calculation source](https://chromium.googlesource.com/chromium/src/+/main/storage/browser/quota/quota_manager_impl.cc)
  includes usage plus 10 GiB and a rounded smaller value for small reported disks. Field trials, release and
  browsing mode still matter; a feature announcement is not a measurement of an individual installation.
- The [Storage Standard](https://storage.spec.whatwg.org/#usage-and-quota) defines usage and quota as estimates;
  neither exposes physical free space. [WebKit's policy](https://webkit.org/blog/14403/updates-to-storage-policy/)
  describes per-origin/overall quotas and requires handling actual quota failures. A browser may fail a write
  before an advertised quota is used up.
- [Chrome's File System Access documentation](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access)
  describes user-selected handles, permissions and writable-file commit on close. This is distinct from
  `navigator.storage.getDirectory()`, which opens OPFS and remains within origin storage. Persistence prevents
  automatic eviction; it is not an arbitrary quota request or a disk-capacity API.

The small reproducible API diagnostic is `node scripts/checkRecordingStudioStorage.mjs`. It launches new persistent
profiles, writes two **1 MiB** blobs to an isolated local test origin and samples usage/quota after each commit.
It does not find capacity, allocate giant probe files, change browser quota flags, or test recording endurance.
The [raw results](recording-studio-storage-probe-2026-09-27.json) record OS, exact versions, mode, API capabilities
and all estimates. The machine is **Windows 10 Pro 10.0.19045**, not macOS; WebKit's Mac-shaped user agent is not
evidence of running macOS or shipping Safari.

| Actual engine/browser on Windows | Fresh persistent profile result |
| --- | --- |
| Playwright Chromium 151.0.7922.34 | Usage 816 → 1,050,739 → 2,099,905 B; headroom stayed exactly 10,737,418,240 B |
| Installed Microsoft Edge 154.0.4258.37 | Usage 816 → 1,050,731 → 2,099,897 B; headroom stayed exactly 10,737,418,240 B |
| Playwright Firefox 153.0 | Quota stayed 10,737,418,240 B; usage increased and headroom decreased |
| Playwright WebKit 26.5 Windows build | This build exposed none of estimate, persist, or OPFS; missing API fallback applies |

Thus constant artificial headroom is reproduced on these **Windows Chromium/Edge versions**. It is a plausible
explanation of the owner's number, not a confirmed diagnosis of their unknown Mac/browser combination. The small
writes do not prove that a recording can exceed 10 GB or that the machine has enough space for a ten-hour take.

## Storage and failure contract

- `Odhad prostoru pro web` reports only current origin headroom. Raw usage/quota and update time are available in
  the details. There is no physical-disk countdown: **Skutečné volné místo nelze v tomto prohlížeči zjistit**.
  Stale, invalid, missing, rejected and timed-out estimates become unknown. The fixed-10-GiB explanation is a
  possibility, not browser detection. Recorded bytes are never subtracted from already usage-adjusted headroom.
- Committed media bytes come from acknowledged storage checkpoints; queued bytes are distinct. Combined VBR uses
  all source bytes on the existing session clock over a bounded window. Startup or a stalled/paused input yields
  no current rate, never infinity. The configured rate includes embedded audio and every selected source.
  There is currently no pause/resume implementation: the related editor/control prompts are still marked TODO.
  They must reuse this clock and storage contract, not infer pause timing from capacity telemetry.
- `navigator.storage.persist()` is invoked only by its explicit button. Granted, denied, unsupported and error
  states are separate. The existing origin can still be cleared manually or hit a write limit.
- Browser storage retains the original atomic IndexedDB chunk/counter transactions. A fresh low origin estimate
  can stop/prevent origin capture with a 64 MiB reserve. A high estimate never guarantees a successful write.
- Selected-directory capture creates one uniquely named session subfolder. Every normally five-second source
  fragment is closed, then a small manifest replacement is closed; only then are those bytes acknowledged.
  No growing-file `keepExistingData` copy and no full-session assembly occurs at finalization. Directory media
  does not enter IndexedDB/OPFS. The origin still needs space for a small initial metadata/handle registration;
  later cache-write failure cannot roll back the authoritative directory checkpoint.
- Import recovery requests read access and does not rewrite the folder checkpoint. It retains readable metadata
  and the selected handle for the current visit even if origin registration fails, so a full disk/origin cannot
  block streaming out already committed media. If the browser cannot remember the handle, select that same
  recording subfolder again next visit. Editing/deletion still require write permission and successful writes;
  the explicit reconnect action can request that permission. A new studio visit reloads the cache under its lock.
- File counts grow with duration/source count (about 7,200 parts per source in ten hours at regular five-second
  delivery). Filesystem latency/antivirus and encoder bursts can therefore matter; this tradeoff favors bounded
  commits and crash recovery over keeping huge uncommitted writable files open. Actual ten-hour performance is
  not yet validated. Browser-internal MediaRecorder buffering is outside the application's bound.
- The application retains at most 64 MiB of pending chunks. Backlog overflow, quota, permission, disk or source
  failure stops all recorders through the existing barrier and drains earlier queued writes. After a failed chunk,
  later chunks are not appended beyond a hole. Previously committed prefixes remain available. Final checkpoint
  failure leaves an interrupted take, never a false success. Recovery uses the last checkpoint even when saving
  a recovery status in a full origin fails.
  A source that supplied no media makes the whole take interrupted, even if its recorder reported a normal stop.
- `captureEndSeconds` and manifest `missingRanges` use source IDs and seconds on the same session timeline.
  An unclean crash has an unknown tail end (`null`). Common recoverable duration is the last point all sources
  have committed, and no source is moved left to conceal a gap. Files can still need player/container repair
  after interruption; the studio does not promise every truncated codec stream will decode.
- A crash after closing a part but before checkpointing may leave an **unindexed part**. It is preserved in the
  directory but is not claimed as recoverable timed media. Do not delete it if external repair is needed. Recovery
  never overwrites media, obtains unrelated permissions, or deletes recordings to reclaim space.
- ZIP64 reads original chunks serially with backpressure; byte counters are exact JavaScript safe integers, not
  signed/unsigned 32-bit integers. A ZIP needs destination space for its outputs. A trimmed ZIP adds trimmed
  outputs plus one temporary trimmed track in OPFS. That temporary space is explicitly disclosed. Individual
  original downloads use disk-backed Blob references when a native save picker is unavailable; the browser's own
  large-Blob/media limits still apply. Only the buffered ZIP fallback is capped (256 MiB), not capture size.
  **Stáhnout údaje o stopách** downloads the same versioned manifest for the separately named original files,
  keeping offsets, source IDs, trim and missing ranges available without creating a ZIP.

## Validation and remaining hardware work

Automated suites: `npm test -- lib/recording-studio` and
`npm run test-e2e -- tests/e2e/recording-studio.spec.ts`. The browser suite records real canvas video and synthesized
audio; it uses actual recording, IndexedDB, file commits, codecs and ZIP extraction. Each attempt attaches OS and
browser version and archives a video. The directory integration substitutes an **OPFS handle for the native picker**:
it tests streaming/checkpoint routing and that media does not enter IndexedDB, **not selected-disk capacity or
quota bypass**. Unit tests inject quota/disk-write/permission failures, absent and stale APIs, denied persistence,
constant/changing quota reports, aggregate VBR, bounded backlogs, failed finalization, and safe-integer boundaries.
The simulated ten-hour case advances the capture clock and virtual byte sizes; it is **not a real soak test**.

Platform execution results and the remaining manual protocol are recorded below. No test file is a certification
that all OS free space is available to a web page.

For installed Edge on Windows, set `$env:E2E_BROWSER_CHANNEL = 'msedge'` in PowerShell before running the same
browser suite; remove that environment variable for the default Playwright Chromium. These tests use fresh
temporary browser contexts. The quota diagnostic above deliberately uses fresh persistent profiles instead;
their estimates need not match the temporary contexts. Both record the browser version actually launched.

| Validation | Status |
| --- | --- |
| `npm run test-types` (production build followed by TypeScript) | Passed |
| `npm run lint` | Passed with the existing unrelated `no-img-element` warning in `components/public-web-page-preview-image.tsx` |
| Unit storage/capture/export/timing suite, including non-destructive v1 IndexedDB upgrade and recovery when both folder/origin writes fail | 45 cases passed on Windows |
| Chromium 151.0.7922.34, Windows, real short five-source recording, trim/ZIP/playable outputs, recovery, UI and folder-API integration | 8 E2E cases passed; latest run 3.8 minutes, including folder recovery/export with both folder and origin-cache writes rejected |
| Edge 154.0.4258.37, Windows, same E2E suite | Latest run: all 8 cases passed first attempt in 3.4 minutes, including read-only recovery/export after both destinations reject further writes |
| Firefox 153.0, Windows | API diagnostic passed. Camera-only fallback recording test failed on both attempts: no committed chunks within 30 seconds; playable output not validated on this headless build |
| WebKit 26.5, Windows | API diagnostic only; no recording certification and no Safari/macOS coverage |
| macOS exact version and owner's browser | Not supplied; no macOS machine available; not run |
| Genuine macOS multi-source recording crossing 10 GB | Not run |
| Genuine continuous ten-hour multi-source soak and resource measurements | Not run |
| Representative other OS (e.g. Linux) | Not run; WSL lists no distributions and the local Docker daemon is unavailable |
| Native OS folder selection, removable-disk-full/unplug, >4 GiB actual exported entry | Not run; directory API integration and injected failure/counter tests are additional coverage only |

For the Firefox follow-up, the cookie panel was dismissed before operating studio controls; the active capture
clock advanced while committed bytes stayed zero. A standalone headless canvas/MediaRecorder probe also failed to
finish normally and was terminated. This does not establish a Firefox storage/quota bug or behavior on real camera
hardware. Chromium/Edge remain the verified recording paths. The empty-source guard ensures that a normal stop
with absent media cannot label such a take complete. An earlier Edge run required a fresh-context retry for a
startup readiness timeout; the latest run needed none. Failed-attempt traces follow Playwright's standard policy;
no assertion was weakened to claim a pass.

Manual completion protocol: record macOS version (`sw_vers`), browser About version, browsing mode, filesystem and
backend. On an adequately provisioned disk, select multiple independent camera/screen/audio sources and record for
ten real hours with actual committed bytes above 10 GB. At startup, periodically and after finalization, record
studio committed/pending counts, raw API usage/quota, OS free space, process memory/CPU and dropped-source/errors.
Preserve the manifest and all originals. Export through the native save picker and play/seek every source near
start, middle, the 10 GB crossing and end in an external player/editor; compare visible timecode/audible references.
Repeat a short recovery run using only a disposable test folder/volume, with revoked access or a realistically full
test volume (never fill the user's working disk with dummy files). Verify the last committed prefixes, labelled
missing tails and unchanged prior takes. Repeat supported paths on Windows and another supported OS, documenting
unavailable APIs explicitly. Attach evidence before changing any unrun status above.
