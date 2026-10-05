# Taking Studio over from another tab

`Převzít studio v této kartě` is available beside the blocking/deactivation message on both Studio workspace routes.
It operates entirely from the requesting tab. It never closes, navigates or refreshes the owner. Opening, focusing,
reloading a deactivated page, switching sections, polling or receiving a stale message cannot silently take ownership.
The workspace layout retains one hook across the setup and recording editor sections.

The confirmation shows the owner's last reported phase, recorded time, file-work and unsaved-editor indicators.
An unanswered state query is explicitly unknown, never proof that an owner is dead. Confirmation warns about stopping
recording, exports, generation and uploads and losing an uncommitted tail. Dismissing it sends no handover request.
Cancelling an outstanding request before stopping leaves the owner unchanged. After stopping starts, cancellation
cannot resume the old take; the old page remains the owner if it can safely keep ownership and the requester gave up.

## Cooperative protocol and actual ownership

`RecordingStudioOwnership` addresses a document instance and a random request identity on a versioned, validated
BroadcastChannel. The confirmation is bound to the owner/generation it displayed, so simultaneous requesters cannot
quietly confirm different successive owners. A request joins the actual Web Locks queue, asks that owner for acceptance,
and confirms back that the requester is still waiting. Only then does the owner stop accepting new work. This extra
acknowledgement prevents a suspended owner from acting on a cancelled, queued request when it wakes up. Duplicate,
finished, wrong-generation and unrelated messages have no effect; a competing requester gets a visible failure.

`recordingStudioHandover.ts` uses the capture coordinator's real Start/pause/resume/Stop barrier, including final
MediaRecorder data events and its bounded persistence queue. A handover-stopped take is interrupted with a specific
reason. A failed final checkpoint is reported to the requester; an in-memory result is never called persisted.
Camera, microphone, screen and cloned preview tracks are released. The work registry cancels jobs and awaits their
actual settlement. Native permission/file pickers cannot be dismissed programmatically, so waiting behind one can
make cooperative cleanup slow. A device returned later is immediately released rather than installed in a stale page.

The existing admin save queue flushes editor drafts separately from explicit jobs, avoiding an export waiting on its
own navigation protection. Invalid or failed saves refuse handover and retain the editor draft in the owner. B can
retry, or explicitly confirm discarding those changes; the release report records that discard. Forced revocation has
its own explicit loss warning. The old page disables recording, editing and destructive controls and remembers its
deactivation in tab-local session storage. The previous authority also prevents automatic acquisition if a suspended
owner is refreshed after revocation but before it could receive the deactivation message.

Only after cleanup does A resolve its lifetime lock callback. Its release report is posted after `navigator.locks.request`
settles, and B still must obtain the actual exclusive lock, claim storage authority and reload authoritative recordings.
B can recover an owner that closes/crashes while waiting, but cannot recover A's take during its cooperative finalization.
A stopped take opens in B's existing recording workspace without a refresh. Saved source intent is reused, streams are
not transferred, devices need reconnection, screen capture needs the browser picker, and Start remains explicit.

There is a five-second answer budget, a thirty-second cleanup budget, a bounded release/lock-acquisition wait and an
eight-second revocation budget. A timeout displays failure/wait/retry/cancel/force choices; it is not a success indicator.
Late acknowledgements cannot activate an abandoned request. A closed requester loses its actual place in the lock queue;
an owner additionally checks a renewed request before releasing.

## Fencing and the limits of force

Web Locks and BroadcastChannel are scoped to the same origin, browser profile and storage partition. They do not
coordinate other devices, other origins or applications. IndexedDB schema 3 adds an authority store in the existing
browser database; no server schema or media storage is added. Schema 4 only removes what the retired folder
destination left behind and keeps that store and its generation, so a tab which was fenced stays fenced. Like every
schema change it is made only by the tab which is becoming the studio; a tab of an earlier deployment can no longer
open the upgraded database and has to be reloaded.

Every ownership claim compares the generation it saw *before* requesting the lock and atomically advances it.
Every media/chunk/checkpoint, recovery, deletion and editor transaction includes that same authority store. A native
unique-key constraint on the revoked generation aborts stale transactions at commit, even when JavaScript has not
received a revocation message. Data and counters stay atomic. Authority loss immediately abandons the old coordinator,
cancels work and releases its streams as soon as its JavaScript can execute. B fences first, then uses `steal: true`,
then verifies authority while holding the real Web Lock. A failed compare or unconfirmed storage write takes no lock
away. The [Web Locks specification](https://www.w3.org/TR/web-locks/#api-lockmanager-request) explicitly warns that
stealing does not stop the old callback.
Before the old document can explicitly reacquire, it also waits for admitted editor saves to settle after discarding
their superseded drafts, so an old callback cannot inherit a new token in that same document.

Export output and Studio server/upload/publication operations cannot be
part of an IndexedDB media transaction. `RecordingStudioAuthorityKeeper.commit` first persists a pending-operation
marker through the same fenced authority transaction. Ownership claims check it atomically with the generation and
refuse revocation while the external effect is pending. Owner discovery, ordinary media writes and cooperative cleanup
remain responsive; no long-running IndexedDB transaction is held open around a network request. The marker is removed
only after the effect settles. Suspension, a crash or an unknown result cannot make it look safe. B remains blocked with
a concrete error and retry. An orphaned uncertainty marker requires inspection/reconciliation of the external destination;
this version deliberately offers no unsafe button to clear it or bypass it. Do not erase browser data to fix this,
because it also contains original recordings. An old pre-fencing deployment can only cooperate/close; forcing an owner
without the authority schema is refused rather than upgrading a recording owner's database behind its back.

Exports settle after stream close/abort and temporary-file cleanup. Studio uploads cancel between acknowledged server
requests rather than aborting fetch and assuming the server stopped. Immutable multipart IDs/parts remain on the server;
the browser retains recording/workshop/revision/source identifiers, without credentials or signed URLs, so B can retry
the same upload. Verification/publication/cancellation requests run behind the same ownership commit. Network uncertainty
fails closed. Independent workshop administration retains its existing upload behavior.

**Logical revocation is not physical device termination.** No browser API used here guarantees that a suspended tab's
camera/microphone has been killed, and an unflushed media tail cannot be promised saved. B displays this explicitly.
Chrome may refuse lifecycle freezing for an actively capturing tab; automated delayed-owner tests instead pause its
JavaScript with CDP Debugger and resume it after takeover. This proves storage fencing and application cleanup, not
physical camera LEDs, OS picker behavior, macOS Spaces continuity or other engines' suspension behavior.

## Verification protocol

Automated cases use real cross-tab Web Locks, IndexedDB, MediaRecorder, persistence, codecs and ordinary workspace
navigation. Only physical devices and selected failure/delay points are synthetic. Tests cover confirmation cancellation,
idle/recording/paused owners, recorder transitions, failed editor/final checkpoint writes, two requesters, repeated
handovers, delayed cancellation, owner closure, and suspended capture resuming after revocation. A browser test pauses
a real media write after it captured A's token but before its native transaction, then verifies that IndexedDB rejects
that transaction after B revokes A. Storage unit tests
also queue writes around a claim and refuse stale media, saves, finalization, recovery, deletion and external commits.

Local verification passed `npm run test-types` (build, then TypeScript), `npm run lint` with existing warnings, and
`npm test -- --maxWorkers=4` (2,212 tests). Twenty distinct Studio browser cases passed across the selected suite and
follow-up runs, including eighteen takeover cases and the existing real export/derived-media regressions. One forced
case encountered a development-server reload during editing and passed its configured fresh-context retry; all four
forced-revocation/upload follow-up cases then passed without retries. A separate admitted-editor-save case also passed.

For physical/browser verification, use two windows in one profile and origin:

1. Start A with a camera, standalone microphone and screen; put A on another desktop. Confirm takeover only in B.
   Check A's tab stays open at the same URL, its preview/cloned tracks end, B opens the committed take and only one
   Web Lock is held. Reconnect devices in B and verify the screen picker appears and nothing starts recording itself.
2. Repeat idle, paused, during Start/pause/Stop, with a long export, subtitle generation, an upload and a dirty edit.
   Cancel before confirmation and after acceptance; check the distinct warnings and preserved committed media.
3. Block an editor/checkpoint write. Confirm that B cannot report a clean release. Retry or explicitly discard edits;
   a forced recovery must still refuse an unresolved external commit/publication.
4. Suspend A's JavaScript, wait for B's timeout, confirm force, then resume A. Check old writes/finalization are refused
   and its capture stops when it runs again. Do not interpret a device LED remaining lit during suspension as a failure
   of fencing, or a test-double stream stopping as physical-device verification.
5. Close/crash A and close/cancel a requester mid-request. Open two simultaneous confirmation dialogs and confirm both.
   Only the addressed generation can win. Repeat A→B→A and refresh a deactivated A while B is active and after B closes.

Physical capture on macOS/Chrome/Safari/Edge, hidden-window scheduling and an actual S3 endpoint interruption/resume
remain manual verification; the synthetic browser suite does not establish these behaviors.
