[ ]

[✨🧺] Remove recording-to-folder and make browser-local recording the only capture workflow

- Simplify the recording studio: all new capture is stored in the existing browser-local IndexedDB backend. Remove the selected-local-directory recording feature completely, not just its default selection. The owner has backed up existing recordings and explicitly does not require compatibility, migration or recovery support for the retired directory-backed format.
- Remove the capture destination selector, choose-folder and reconnect/import-old-recording-folder actions, folder status/help text, and directory-specific capture warnings. Do not replace a two-option selector with a one-option `Úložiště prohlížeče` selector or a redundant permanent explanation that this is the only destination. Storage is an implementation detail during normal recording; useful capacity and failure information may remain.
- Verified entry points: `components/recording-studio/useRecordingStudio.ts`, `components/recording-studio/RecordingStudio.tsx`, `lib/recording-studio/RecordingStudioCapture.ts`, `lib/recording-studio/recordingStudioStorage.ts`, `lib/recording-studio/recordingStudioDirectory.ts`, `lib/recording-studio/recordingStudioTypes.ts` and `lib/recording-studio/recordingStudioCapacity.ts`.
    - Remove directory handles/checkpoints, reconnect caches, recording-destination branches and types from the capture/storage lifecycle. Simplify creation, append, pause/resume, reading, recovery, deletion and export input resolution around the remaining IndexedDB recording model.
    - Remove code and tests dedicated solely to the retired recording backend and update current documentation. Historical PRDs remain historical; do not rewrite their implementation history.
    - No compatibility layer, conversion wizard or folder restoration UI is required for old directory-backed entries. Obsolete browser-local metadata may be omitted or cleaned up without breaking the library. Do not use this as permission to delete files from the user's filesystem, clear unrelated browser storage, or indiscriminately erase valid IndexedDB recordings.
- Preserve the working local recorder: synchronized raw tracks, microphone capture, source preferences, pause/append behavior, atomic chunk-and-counter commits, bounded write queues, saved takes after reload, recovery of committed prefixes and existing single-instance protection. Storage failures must still stop recording safely and reach the shared sound/system-notification channel.
- Keep accurate recorded/queued byte counts and actionable quota/persistence errors. Do not confuse browser origin quota with physical disk capacity or bring back an inaccurate remaining-time estimate. Necessary diagnostics are not a new destination choice.
- This removes a **capture destination**, not all filesystem APIs:
    - Preserve ordinary downloads, original/prepared exports, seek-index repair, ZIP/sidecar output, save-file pickers and bounded export temporary files where still needed. Never pretend WebM bytes became MP4 merely by changing their extension.
    - The separate [Studio/editor PRD](2026-10-0080-studio-workshop-editing-and-direct-s3-upload.md) may reference externally recorded local files by read-only handles and upload media after recording. That is not recording directly into a selected folder. Do not remove those capabilities or introduce cloud upload during capture.
- Acceptance criteria:
    - A fresh installation records, pauses/resumes, stops, reloads, previews and exports a multi-track IndexedDB recording without ever choosing or reconnecting a recording folder.
    - No capture destination selector, directory-recording copy or directory-backed recording path remains. The same is true in browsers that support directory pickers.
    - Existing valid IndexedDB recordings remain accessible. An obsolete directory-backed record does not crash startup or display a reconnect prompt; no compatibility with its media is promised.
    - A simulated quota/write failure preserves committed chunks and triggers the existing real alert channel. Cross-tab protection remains effective.
    - Existing file downloads and streaming exports still work, including save-file-picker and temporary-file paths. Remove obsolete directory-capture tests without deleting unrelated filesystem/export coverage.
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do an analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](../changelog/_current-preversion.md).
