[ ] use `gpt-6-sol`

[✨⏯️] Add configurable live monitoring, synchronized pause/resume and append recording to the shared studio

- Extend [the synchronized multi-track workspace](2026-09-0850-studio-synchronized-editor.md). Establish its stable recording ID, source IDs and common time model first; do not introduce an unrelated second studio or independent playback timeline.
- Make recording and editing clear modes of the same project workspace: setup/ready, recording, paused, finalizing, editing and exporting. Mode transitions must not unmount and accidentally destroy active recorders or data.
- Improve the live view as the owner's monitoring/mirror screen.
    - Offer a responsive grid with useful large source tiles, a focused single-source view, and pinning one primary source while retaining access to the others.
    - Make source names, recording/paused/error state and audio activity easy to identify. Persist view preferences separately from the actual capture configuration where useful.
    - Hiding a tile, pinning, changing layout, preview muting or minimizing a preview must NEVER stop, pause, replace or down-select the underlying recorded sources.
    - All configured/armed sources continue recording, including those not currently visible. Show the full recording-source count/status even in single-source view.
    - Distinguish mirror preview transforms from recorded output transforms. Do not burn a camera mirror, grid or pinned layout into the raw source files.
- Add one global Pause/Resume control for the session.
    - Starting, pausing, resuming and stopping coordinate every recorded track, including camera audio. There is no independent per-source recording pause that can desynchronize the project.
    - Use a shared state machine and timeline mapping, not independent per-tile toggles. Guard rapid repeated clicks and asynchronous transitions; the displayed state reflects the whole session's actual state.
    - Session time counts recorded content, excluding globally paused wall-clock intervals. Apply the same pause boundaries to every source and export time mapping.
    - Investigate MediaRecorder timing and capabilities; if native per-recorder pause/resume cannot maintain the promised common timeline, record aligned take segments and assemble/map them with explicit timing. Merely issuing API calls back-to-back is not proof of sample synchronization.
    - During pause, live previews may continue as a clearly labelled preview, but no source accumulates recorded content for the paused interval. Do not use CSS hiding or muted playback to simulate recording pause.
    - If a source fails to enter the required state, coordinate a safe pause/stop for the session, preserve committed data and show the affected range/source. No silent partial resumption.
- Allow appending another take to an existing recording/project.
    - From editing, provide a distinct `Donahrát` action. It prepares the project’s intended sources, checks permissions/storage and appends a NEW synchronized take at the recorded session end on explicit Start.
    - Do not append at the current playhead, overwrite previous media, splice automatically into a trim selection, or silently create an unrelated project. The recording ID remains the same; each take/segment has its own stable identity and timestamps.
    - Reuse [source configuration and historical setup restoration](2026-09-0830-studio-source-configurations.md), including renewed screen/window selection when required. Permission selection itself never starts a new take.
    - Keep the source set consistent by default. Deliberately replacing a missing source or introducing a new one must be explicit, with absence in earlier/later takes shown as a real timeline gap, not time-shifted footage.
    - Preserve previous raw media and edit recipes. Make inclusion of appended footage in the export range explicit: extend an untouched full-session range, but do not silently overwrite a user's custom trim boundaries.
    - Global recording Pause/Resume continues a current take/session; `Donahrát` after finalization is an appended take. `Použít tuto konfiguraci zdrojů` creates a DIFFERENT recording. Keep those actions visibly distinct.
    - Return to editing only after all source segments have flushed and their shared timing is recoverably stored. Do not call a project safely saved before finalization succeeds.
- Keep the long-session design bounded in memory and stable while switching view layouts, changing browser visibility or moving between macOS Spaces. Do not promise capture will survive OS sleep or a revoked permission; detect/report interruptions and preserve recoverable media.
- Acceptance criteria:
    - Record at least three sources; change grid/focus/pinned layouts repeatedly and verify all source outputs remain present, continuous and aligned.
    - Pause with a visible clock and audible reference, resume several times, and verify the same pause intervals are removed from all exported sources. Measure boundaries/drift against the editor's declared tolerance.
    - Finalize, edit, append a synchronized take, reload and export; the new segment begins at the same project time in every source and earlier media/edits remain intact.
    - Cover rapid controls, denied reselection, missing devices, source termination, write failure, pause-then-stop, interrupted finalization and a custom trim range before append.
    - Reproduce on the owner's **macOS** setup and test supported Windows/other-platform browsers. Clearly separate actual cross-platform evidence from assumptions.
- Research starting point: [MediaStream Recording](https://www.w3.org/TR/mediastream-recording/). Share storage/error handling with [the storage PRD](2026-09-0810-studio-storage-capacity.md) and platform-specific selection help with [the macOS Spaces PRD](2026-09-0840-studio-macos-spaces-capture.md).
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do an analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](../changelog/_current-preversion.md).
