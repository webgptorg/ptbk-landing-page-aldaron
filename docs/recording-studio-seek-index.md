# Recording studio seek index: analysis, contract and verification

The owner reported that studio recordings "often result in videos with broken index" and repaired them by hand:

```bash
for f in Zaznam-28-9-2026-12-52-35-316ef072-*.webm; do ffmpeg -i "$f" -map 0 -c copy "${f%.webm}-fixed.webm"; done
```

The filename pattern is `recordingOriginalFilename`/`recordingOriginalPartFilename` in
`lib/recording-studio/recordingStudioExport.ts`, so those were **individually downloaded originals**.

## What was actually broken

Nothing in the media. `ffmpeg -map 0 -c copy` re-encodes nothing; it only rewrites the container. What was missing
is the container's seek metadata, and it was missing by design:

- Capture uses `MediaRecorder` (`lib/recording-studio/RecordingStudioCapture.ts`), started with a timeslice so each
  chunk can be committed atomically to IndexedDB or to a selected directory.
- A `MediaRecorder` muxes for streaming. Its Matroska `Segment` element carries an **unknown size**, no `Cues`
  element is written, and `Info/Duration` is absent, because the browser does not know where the file ends while it
  is still being written. Safari's fragmented MP4 is the same story without an `mfra`/`sidx` index.
- `readRecordingPart` concatenates the committed chunks verbatim, so an exported original was exactly those live
  bytes. Players that scan (including this studio's own mediabunny-based preview) cope; editors that rely on the
  index cannot seek.

So this was never an intermittent fault — **every** WebM the studio handed out was unseekable, and "often" reflects
which downstream tool noticed.

## Why prevention cannot happen inside the recorder

`MediaRecorder` exposes no option to write an index, and its muxer is not replaceable. The only ways to obtain one
are to write the container ourselves (WebCodecs plus a muxer, which would give up the browser's proven capture path
and its Safari fallback) or to rewrite the container after the recorder has closed a part.

Rewriting the committed media in place was rejected: an 8 Mbit/s screen share is about 1 MB/s, so a one-hour part is
around 3.6 GB. Doubling that transiently is not acceptable against the browser's ~10 GiB origin estimate, it would
add minutes to **Stop**, and for a selected-directory destination it would have to overwrite the immutable fragments
that crash recovery depends on. Committed capture bytes therefore stay untouched.

## What the studio does instead

### One home for the question

`lib/recording-studio/recordingStudioIndex.ts` is the only place that decides what a usable index is. It has no
dependencies: it reads at most 256 KiB of the container head plus 64 KiB of its tail through `Blob.slice`, walks the
EBML or ISOBMFF element headers, and never touches media bytes.

| Status | Meaning |
| --- | --- |
| `indexed` | Matroska with `Cues` (or a `SeekHead` entry pointing at them) **and** a stored `Duration`; or MP4 with a non-zero `mvhd` duration and either sample tables or `mfra`/`sidx` |
| `unindexed` | A live container: an unknown-size `Segment`, missing `Cues`, or a missing/zero duration |
| `unknown` | Not Matroska or MP4, empty, or a header that does not fit the read window — never raises an alarm |

`RECORDING_INDEX_REPAIR_COMMAND` and the two message builders live there too, so the recorded reason, the alert and
the archive README all say the same thing.

### A check immediately after recording, and the alert

`RecordingStudioCapture.verifyPartIndex` runs as each part closes — at a global pause and at Stop, beside the
existing `measurePart` — and stores the verdict on `RecordingMediaPart.indexStatus`.

A part without an index is the ordinary outcome, so it is recorded rather than announced; alerting on every take
would make the sound and the browser notification worthless. Two outcomes do reach
`lib/recording-studio/recordingStudioAlerts.ts`, both with the new `recording-kept` impact (warning severity, title
`… je uložený · potřebuje opravu`):

- the container has no index **and** `canRebuildRecordingIndex` reports that this browser could not build one, so
  only `ffmpeg` will repair it — the message names the exact command;
- the container could not be checked at all.

`recording-kept` is announced but deliberately **not** written into the take's `errorMessage`: nothing was lost and
nothing stopped, so a complete take stays `complete` and remains valid for `Donahrát`. Where the work is needed is
recorded on the part it concerns. Rebuild support is probed once per MIME type per take.

### The index is written on the way out

`deliverRecordingOriginal` in `recordingStudioExport.ts` is the single rule for handing over recorded media, used by
both the individual original download and the ZIP's `originals/` entries. When the stored part is `unindexed` it
calls `withRebuiltRecordingIndex` (`recordingStudioReindex.ts`), which is the browser's own `-map 0 -c copy`:

- `Conversion` with `copy: { mode: 'forced', shiftTolerance: 0 }` — a codec that would need transcoding discards its
  track instead of silently producing different media, and no timestamp may shift, because the take's session
  mapping was measured against the recorded ones;
- output through the shared seekable OPFS working file (`recordingStudioTemporaryFile.ts`, extracted from the trim
  path so trimming and reindexing share one temporary-file and cleanup implementation);
- the result is accepted only after it reports `indexed` and its bounds match the part's measured `mediaBounds`
  within 50 ms with the same component count.

Any failure — unsupported codec, missing OPFS, a rebuilt file over the 256 MiB detached-download limit with no disk
picker, or failed verification — falls back to the recorder's own bytes and records the reason. Each
`recording.json` `originalParts` entry carries `status`, `isIndexRebuilt` and that `reason`, and `README.txt`
explains both cases and names the ffmpeg command.

Prepared (trimmed) files were already written by mediabunny and always carried an index; nothing about them changed.

## Limits

- Committed capture bytes are never rewritten, so a recording restored from IndexedDB or a selected directory is
  still a live container until it is exported. The studio's own preview does not need the index.
- A rebuild costs one full read plus one OPFS-sized write per part, which is why the ZIP and the individual download
  disclose their temporary-space needs exactly as trimming already did.
- Unknown containers are reported as `unknown` and handed over untouched. That is not a claim that they are fine.
- Safari's fragmented MP4 path is implemented against the specification and covered by fixtures, but was not
  verified on a physical Mac; only Chromium/Edge WebM output was exercised end to end.

## Verification

- `npm test -- lib/recording-studio` (156 tests) — the container parser is covered by deterministic byte fixtures
  built with the shared encoders in `recordingStudioTestUtilities.ts`: a live Segment with both the eight-byte and
  Chrome's single-byte unknown size, a remuxed container, `Cues` before the clusters, a missing duration, missing
  `Cues`, a header outgrowing the read window, an empty part, foreign bytes, a fragmented MP4 with and without a
  reachable `mfro`, a plain MP4, a long-form (64-bit) `mvhd`, an `mvhd` too short to hold its duration, and a `moov`
  past the window. Capture tests cover the recorded verdict per part, the single storage read shared by measuring and
  checking, the alert for a non-rebuildable index, the alert for an uncheckable container, an already indexed
  container, and a pause closing two parts. Export tests cover a rebuilt individual download, the fallback with its
  reason, and the manifest entries.
- `npm run test-e2e -- tests/e2e/recording-studio.spec.ts` — against real `MediaRecorder` output rather than
  fixtures:
  - every one of the five `originals/` entries in an archive is asserted `indexed`, and its manifest entry is
    asserted to report `status: 'indexed'` with `isIndexRebuilt: true`;
  - the individual **Stáhnout originál** download is asserted byte-identical to the archive's entry for the same
    part, so one recorded part cannot leave the studio as two different containers;
  - a seeded already-indexed fixture is still handed over byte-identical to what was stored, so a container which
    needs nothing is not remuxed;
  - a recording imported read-only from a folder whose writes all fail is asserted to hand over the recorder's own
    `unindexed` bytes, to say so in its status line, and to still carry the same track count and a duration within
    50 ms of the indexed copy in the archive.
