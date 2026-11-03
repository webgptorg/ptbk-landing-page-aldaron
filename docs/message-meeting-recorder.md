# Meeting recorder in Messages

The first context step in `/admin/messages` offers **Nahrát meeting** before the existing external-file upload.
Name the meeting, start the microphone and keep the phone unlocked with the browser in front. The recorder shows
elapsed recorded time, the microphone level when Web Audio is available, committed local block/byte counts and
server acknowledgement counts. **Ukončit nahrávání** finalizes audio without starting any billable processing.
Choose **Přepsat všechny části do kontextu** afterwards. External recordings still use their existing upload flow.

## Preservation and recovery

- Delivered MediaRecorder blobs are split into at most 1 MiB blocks. Each block and its monotonically increasing
  counters commit atomically with strict durability in the separate `ptbk-message-recordings-v1` IndexedDB database.
  Capture requests two-second delivery; browsers can delay it. No delivery interval is a guarantee of captured bytes.
- Five-minute recording containers limit the amount dependent on an unfinished container. The next encoder starts
  before the previous one stops, allowing a short boundary overlap instead of an intentional capture gap. Times are
  actual per-part wall-clock boundaries, not sample-accurate encoded timestamps. A refreshed/interrupted session
  can be continued only by an explicit microphone action, retaining the group ID and creating a fresh part ID/header.
  No recovery action replaces or concatenates separate containers as if they were one valid audio file.
- A background queue sends original bounded blocks to the existing private `OBJECT_STORAGE_BUCKET`. The new private
  `message_recording_parts` and `message_recording_chunks` tables retain grouping, ordering, SHA-256 and transcripts.
  Upload identities contain part, sequence and digest. Lost responses retry idempotently; conflicting originals are
  refused. Acknowledgements become local receipts only after successful server responses. Offline capture stays local.
  Backup resumes when this editor is open and the connection returns; closed browsers cannot upload pending bytes.
- The last uncommitted/delivered tail is retained in memory after a storage failure and has an emergency download
  action including its committed container prefix. A hard browser/OS failure can still lose bytes never delivered or
  committed; a damaged unfinished container may require media repair. Existing committed bytes are never rewritten.
- Remote downloads verify sequence completeness, expected counts when known, byte lengths and SHA-256 before
  assembling the original file. Open/interrupted server-only records may only contain the backed-up prefix. Their
  unknown final count is not a claim that the whole meeting was recovered. Keep the original browser until backup
  counts match. Raw audio and transcript downloads remain independent of context limits and message creation.
- No automatic cleanup, message-delete cascade, public media route or audio narration reuse applies to these originals.
  Library access uses the existing Messages administration permission; delegated administrators with that permission
  can access this shared recording archive. Local data belongs to this browser profile and origin. Use one admin
  hostname consistently; server backups appear across authorized hosts/devices.

## Interruption and processing

Web Locks reject a second capture on the same origin. Screen Wake Lock is best effort and reacquired when visible.
A muted/ended microphone, recorder error, excessive pending-write memory or a 20-second delivery stall stops capture.
Stop waits for `dataavailable`, `stop`, and persistence before releasing the microphone/lock. Administration's existing
draft protection and busy-dialog close guard prevent accidental controlled dismissal. Forced reload cannot be stopped
reliably on mobile and never resumes microphone access silently.

Paid transcription is the existing direct browser-to-ElevenLabs one-use-token path. Parts process in time order.
Each successful transcript is stored before adding it to context. Cached text is reusable without another provider
request, including after a context-length failure. A previous attempt without stored text requires explicit confirmation
before a new paid attempt. Speaker numbering is independent within each part; speaker identities are not inferred
across separate files. No new API credential or provider is introduced.

## Verification

Vitest exercises durable reopen and ordered original bytes, rejected gaps/overwrites, final-event stop ordering,
independent container rotation, interrupted continuation and cross-tab microphone exclusion. PGlite checks the real
migration, database privacy and preservation constraints. Existing file-transcription/editor tests cover the shared
processing flow. These checks do not establish physical Samsung/browser background behavior or a long-duration soak.

Physical acceptance: record a few minutes on the intended phone, verify the microphone level and backup receipts,
interrupt/reload, select the retained meeting, download both originals, continue, then transcribe the ordered parts.
Repeat with lost network and restore it before leaving the editor. Do not use screen-lock behavior as an unattended
recording guarantee.
