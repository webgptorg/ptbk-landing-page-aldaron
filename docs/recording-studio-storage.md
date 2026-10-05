# Recording studio storage: investigation and verification

Investigation date: 2026-09-27. This extends `/admin/recording-studio`, originating in
`prompts/2026-09-0440-admin-recording-studio.md` (marked implemented) and its archived trace.

**Update 2026-10-05.** The selected-directory capture destination which this investigation added was retired by
`prompts/2026-10-0070-studio-browser-only-recording-storage.md`. IndexedDB is the only capture destination again,
and it is not offered as a choice. [Storage and failure contract](#storage-and-failure-contract) describes the
studio as it is now. The investigation, the research and the dated validation results below are kept as they were
written, so where they mention recording into a folder they describe a feature which no longer exists.

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
  The global pause added later (`recording-studio-monitoring-pause-append.md`) closes and commits its parts on
  this clock and through this storage contract; pause timing is never inferred from capacity telemetry.
- `navigator.storage.persist()` is invoked only by its explicit button. Granted, denied, unsupported and error
  states are separate. The existing origin can still be cleared manually or hit a write limit.
- Every take is recorded into IndexedDB, in atomic chunk/counter transactions of about one second per source.
  There is no other capture destination and no control which chooses, reconnects or imports one. A fresh low
  origin estimate can stop/prevent capture with a 64 MiB reserve. A high estimate never guarantees a successful
  write. Actual ten-hour performance is not yet validated. Browser-internal MediaRecorder buffering is outside
  the application's bound.
- Recording into a selected folder is gone together with its checkpoint format, its reconnect cache and its
  import. Database schema 4 removes what that destination left in the browser, in the same version change which
  creates the schema: the store of folder handles, and the description of every take explicitly marked as
  directory-backed, including orphaned descriptions with no handle store. Other metadata and stores are retained.
  Such a take never had media in IndexedDB, so nothing recorded into the browser is removed, and no folder or file on
  disk is opened, changed or deleted. A studio opened afterwards lists only takes it can read and asks for no
  folder. Nothing converts or restores a folder-backed take; its files stay where the administrator keeps them.
- The application retains at most 64 MiB of pending chunks. Backlog overflow or a quota, permission or disk
  failure stops all recorders through the existing barrier and drains earlier queued writes, while a lost source
  stops only its own track (`recording-studio-alerts.md`). After a failed chunk,
  later chunks are not appended beyond a hole. Previously committed prefixes remain available. Final checkpoint
  failure leaves an interrupted take, never a false success. Recovery uses the last committed transaction even
  when saving a recovery status in a full origin fails. The failure reaches the shared sound/notification channel.
  A source that supplied no media makes the whole take interrupted, even if its recorder reported a normal stop.
- `captureEndSeconds` and manifest `missingRanges` use source IDs and seconds on the same session timeline.
  An unclean crash has an unknown tail end (`null`). Common recoverable duration is the last point all sources
  have committed, and no source is moved left to conceal a gap. Files can still need player/container repair
  after interruption; the studio does not promise every truncated codec stream will decode.
- Recovery never overwrites media, obtains unrelated permissions, or deletes recordings to reclaim space.
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
browser version and archives a video. One case records, pauses, reloads, previews and exports three sources in a
browser which offers a directory picker and checks that the picker is never called, that no folder is offered and
that all media is in IndexedDB. Another opens the studio on a schema 3 database holding a folder-backed take which
was still being recorded, and checks that it starts without that take or a request for its folder, keeps the
browser-recorded take beside it exportable and leaves the files of the folder as they were; an **OPFS folder stands
in for a folder on disk** there. Unit tests inject quota/disk-write/permission failures, absent and stale APIs,
denied persistence, constant/changing quota reports, aggregate VBR, bounded backlogs, failed finalization, the
  schema 4 upgrade (including missing handle stores and preservation of unrelated metadata) and safe-integer boundaries.
The simulated ten-hour case advances the capture clock and virtual byte sizes; it is **not a real soak test**.

Platform execution results and the remaining manual protocol are recorded below. No test file is a certification
that all OS free space is available to a web page. The results are those of 2026-09-27, when a folder could still
be recorded into; their folder cases are history rather than coverage of the present studio.

**Browser-only verification, 2026-10-05 (macOS / Playwright Chromium):**

- `npm test -- lib/recording-studio components/recording-studio`: all 274 tests passed across 25 files. Cleanup
  removes only explicit directory-backed descriptions, including orphaned ones, and retains unrelated metadata,
  stores, authority generations and IndexedDB media.
- Eighteen targeted cases from `tests/e2e/recording-studio.spec.ts` passed. They cover three-source capture,
  pause/resume, append, reload, preview, obsolete-folder metadata, constant/missing quota estimates, a real
  transaction abort, sound and notification alerts, recovery and cross-tab takeover/fencing. The hidden-tab
  storage-failure case uses the real browser notification API.
- Download and streaming-export coverage retains original/prepared ZIP output, seek-index repair and its
  temporary-write failure fallback. Real OPFS file handles stand in for the native save-file picker.
- `npm run test-types` completed the production build followed by TypeScript; `npm run lint` passed with existing
  warnings. These checks do not establish physical device behavior or a long capture soak.
- The complete `npm run check` passed after fixing the material-order test's off-screen/stale drag coordinates
  and the whitepaper's first-click hydration race. Its unchanged scope includes lint, production build, TypeScript,
  the full browser suite (179 passed, one skipped, no retries) and the standard test-data cleanup.

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
| Removable-disk-full/unplug of an export destination, >4 GiB actual exported entry | Not run; injected failure/counter tests are additional coverage only |

For the Firefox follow-up, the cookie panel was dismissed before operating studio controls; the active capture
clock advanced while committed bytes stayed zero. A standalone headless canvas/MediaRecorder probe also failed to
finish normally and was terminated. This does not establish a Firefox storage/quota bug or behavior on real camera
hardware. Chromium/Edge remain the verified recording paths. The empty-source guard ensures that a normal stop
with absent media cannot label such a take complete. An earlier Edge run required a fresh-context retry for a
startup readiness timeout; the latest run needed none. Failed-attempt traces follow Playwright's standard policy;
no assertion was weakened to claim a pass.

Manual completion protocol: record macOS version (`sw_vers`), browser About version, browsing mode and filesystem.
On an adequately provisioned disk, select multiple independent camera/screen/audio sources and record for
ten real hours with actual committed bytes above 10 GB. At startup, periodically and after finalization, record
studio committed/pending counts, raw API usage/quota, OS free space, process memory/CPU and dropped-source/errors.
Preserve the manifest and all originals. Export through the native save picker and play/seek every source near
start, middle, the 10 GB crossing and end in an external player/editor; compare visible timecode/audible references.
Repeat a short recovery run in a disposable browser profile on a realistically full test volume (never fill the
user's working disk with dummy files). Verify the last committed prefixes, labelled
missing tails and unchanged prior takes. Repeat supported paths on Windows and another supported OS, documenting
unavailable APIs explicitly. Attach evidence before changing any unrun status above.
