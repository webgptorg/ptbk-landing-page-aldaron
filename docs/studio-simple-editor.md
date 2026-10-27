# One local recording editor

Both `/admin/studio/recording/<id>` and existing `/admin/studio/editor/<id>` projects use `StudioProjectEditor`.
The recording library offers one **Náhled a střih** action. Opening a recording creates or reuses its stable,
small IndexedDB project by reference; no video is copied. Existing projects/cuts and original bytes remain intact.
A new project preserves the recording's prior trim. The former duplicate recording editor has been replaced.

The main view contains the composite preview, shared playback, source timeline with a composition lane,
IN/OUT, linked cut, layout buttons, global transition and local export. Detailed scenes, part assembly,
source roles/imports and original backups remain available in disclosures. The existing owner/transport,
autosave queue, navigation protection and work/authority fencing are retained.

## Editing

IN/OUT selects the exported range. **Vystřihnout vybraný úsek** splits its boundary groups, removes the selected
interval from all synchronized sources and shifts later groups by the same duration. Source coordinates and
recording snapshots remain immutable. Full removal is refused. Undo restores cuts, selections and layouts.

Layout buttons add or replace a scene at the shared playhead: camera, screen plus circular camera, or screen.
Composition-lane boundaries can be dragged. The camera's default lower-right box is square in the 16:9 output;
its center crop is circular. Advanced controls retain rectangular overlays, source choices, fits and positioning.

One saved project transition applies everywhere: smooth morph (default, 0.7 s), fade, or cut. Smooth morph
interpolates the camera's rectangle and rounded mask from fullscreen into the overlay. Trimming out a transition
does not replay it at export zero. Preview and export share the same drawing/geometry implementation.

## Smart layout

An explicit action samples screen video locally at 64×36, once per second, for at most 120 frames per group.
Two consecutive frames sufficiently different from the initial frame suggest the start of showing content.
Availability boundaries also return to camera during screen gaps. With an ambiguous unchanged screen it keeps
the camera, leaving a manual screen transition to the user. This is a reviewable visual heuristic, not semantic
recognition of speech. It changes only scene metadata, supports undo, and sends no media to an external model.

## Local export

`studioCompositionExport.ts` reads original IndexedDB media or an explicitly connected local file in bounded
ranges. It decodes active visible sources at the shared mapped time and encodes a 1920×1080, 30 fps VP8 WebM.
A single selected scene audio source is trimmed/mapped through the same edits, normalized to 48 kHz stereo Opus;
missing source intervals are silence. Rendering never relies on wall-clock MediaRecorder playback or screen capture.
A temporary seekable OPFS file holds output, so a long output is not accumulated in memory. After duration checks
for both audio and video, the result streams to the chosen disk file. Without a save picker, only downloads up to
256 MiB are detached into memory before temporary-file cleanup. Original sources are never overwritten or uploaded.
Browsers without the required encoders or OPFS report an explicit error. Progress and cancel remain available;
all producers, decoders, streams and temporary files settle before the work boundary releases.

Existing remote/import capabilities remain in advanced source tools; this new composition export deliberately
requires a local original and does not fetch remote-only media. No new server render/upload endpoint or migration
is added. Physical browser/device testing and a long recording/export soak remain separate from short fixtures.

## Verification

`studioComposition.test.ts` checks continuous geometry, global transition choices, source-coordinate preservation,
repeated linked cuts, smart layout availability/gaps and transition validation.
`studio-composition.spec.ts` uses real recorded fixture containers to cut all tracks, set camera-to-circle layout,
save/reload, export and check audio/video dimensions and duration, while confirming original stored byte counts.
Existing project and transport unit tests cover pinned mappings and asynchronous seek synchronization.
