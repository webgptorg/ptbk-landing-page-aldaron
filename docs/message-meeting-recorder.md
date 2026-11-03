# Meeting Studio for Messages

`/admin/messages` leads with **Otevřít Meeting Studio**. Importing an audio file and writing/editing the long context are separate secondary views. Finishing a meeting returns the transcript to that editor and appends it to its existing context using the same ElevenLabs file transcription function.

## Recording screen

Meeting Studio is a fullscreen dialog in the current tab. It hides the underlying message editor, traps focus, has no backdrop dismissal or ordinary close icon, and starts with the microphone control rather than a focused text field/mobile keyboard. It shows the selected agent, meeting title, recorded-content timer, recording/paused/interrupted state, and microphone level. The large central control starts, pauses and resumes capture. Pausing freezes the timer and uses `MediaRecorder.pause()` / `resume()` on the same encoder and container. There is no five-minute rotation.

**Dokončit a přepsat** first asks for confirmation; cancelling leaves capture running. Confirming stops the encoder, waits for its final data and local commits, and explicitly starts the shared paid transcription. The browser sends audio directly to ElevenLabs with the existing single-use token; no CDN copy is made. Successful transcripts are cached before applying the message context, so a full context or failed save does not require another paid request. An uncertain attempt requires an explicit retry confirmation. A failed result never removes the audio. **Zpět ke zprávě** requires confirmation while recording and saves without transcription. Escape and browser Back cannot dismiss an active recording. Administration's existing unload/sign-out protections remain active while capture, transcription or an uncommitted emergency tail is pending.

## One local audio backup, shared with Recording Studio

`MessageMeetingCapture` acquires Recording Studio's existing `promptbook-recording-studio` Web Lock and fenced storage authority. It never takes ownership from another active studio automatically. If that studio is open elsewhere, the user must finish its work and close it before recording here. Recording, recovery and ordinary studio edits/deletions cannot race.

Each message recording is a normal `StudioRecording` containing one microphone track, titled `Messages recording · <agent name> · <meeting title>`. No special recording schema, project or saved source configuration is introduced. Meeting Studio never loads, saves or replaces the user's existing camera/microphone/screen setup. The standard Recording Studio library, editor, original download and export paths can read the new track.

During upgrades, capture also holds the former recorder's `ptbk-message-meeting-capture` lock. Migration acquires that same lock before reading legacy audio, so an older open tab must finish its live capture before its backup is migrated. No migration marks another live legacy recording as interrupted or ignores its subsequently delivered chunks.

Two-second delivered chunks are saved in the studio's existing IndexedDB. Audio bytes and their counters commit in the same fenced transaction. The small `ptbk-message-recordings-v1` database stores only message associations and cached transcripts for new recordings, with a `studioRecordingId` reference. It does not hold a second copy of new audio. Chunk sequences are append-only. Every new recording gets a fresh UUID; a new meeting never overwrites previous recordings. After a genuine interruption, continuing a meeting creates another independent part under the same meeting UUID. Ordinary pauses do not split the file.

Finishing, transcription, generating a message, closing the editor and deleting a message never delete the raw studio recording. Only explicit manual deletion in Recording Studio removes it. Browser-local storage means the same origin, browser profile and device; it is not synchronization between `ptbk.io` and personal domains, between www/non-www, or between devices. Clearing browser data removes the local recordings. Persistent-storage requests report the browser's behavior and cannot prevent explicit deletion.

## Existing audio and migration

On opening Meeting Studio or activating Recording Studio, `preserveMessageRecordingsInStudio` migrates the former recorder's local audio into ordinary studio recordings. The deterministic studio ID equals the old part ID; interruption resumes the committed prefix without duplication. Source byte counts are checked, chunk and description commits remain atomic, and the original legacy chunks and cached transcripts are retained. No original file is decoded, re-encoded or changed. Older captures without recorded agent provenance are labelled `původní záznam` rather than inventing an agent. Once linked, a manually deleted studio recording is never reconstructed by migration.

Automatic server/CDN audio backup is disabled. The old client sync entry point does nothing, and authenticated POST/PUT backup requests return 410 so an older open tab cannot continue uploading. Historical private manifests/downloads remain available; no server data or immutable SQL migration is deleted. New studio-linked recordings never fall back to a server download when their local audio is missing. Message audio playback, chat attachments and other existing CDN features are unaffected.

## Interruption and platform limits

Chunk delivery is best effort. Android Chrome may delay `dataavailable` while the screen is locked; hiding a tab alone therefore never triggers a stop. The recorder flushes on visibility/pagehide where the browser allows it, requests Screen Wake Lock and reacquires it on return. A muted microphone is shown explicitly and can recover after unmute. A disconnected microphone, failed encoder, failed local write or bounded write-queue overflow stops capture and retains the committed prefix. Failed writes remain available as an emergency download containing the original prefix and uncommitted tail.

Closing/reloading the document destroys its microphone stream. A website cannot continue recording after its tab closes; service workers cannot own this microphone recorder. Locking the screen, an incoming call, browser eviction or OS suspension can interrupt capture and delay both JS and storage. Wake Lock does not override manual locking. A crash may lose audio not yet delivered/committed. On return the existing audio remains available; the user can explicitly continue with a new part. The UI does not promise uninterrupted screen-off recording. A physical mobile/long-recording test remains necessary to characterize a particular browser and phone.

## Verification

Targeted tests cover final-chunk ordering, shared-studio byte compatibility, one-file pause/resume and frozen pause clock, no periodic rotation, preservation across a second meeting, background delivery delays, microphone loss, exclusive capture, storage failure/emergency tail, idempotent legacy migration, manual deletion, cached paid transcript reuse, explicit stop/transcribe confirmation and cancellation, and retired server writes. Existing message editor/storage/transcription and Recording Studio storage/authority checks also apply. Mocked browser tests establish state transitions and committed bytes; they do not establish physical screen-lock or long-duration microphone behavior.
