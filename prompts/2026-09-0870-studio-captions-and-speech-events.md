[x] by Developer on OpenAI Codex `gpt-6-sol` thinking `max` (ChatGPT account) - Implementation ~$0.5831 35 minutes; Testing 34 minutes

[✨📝] Generate separate subtitle and speech-event tracks from a chosen recorded audio source

- Extend [the synchronized recording editor](2026-09-0850-studio-synchronized-editor.md) with two DISTINCT derived track types: subtitles (what was said) and speech-activity events (when speech/silence occurred). Keep them separate in the timeline, data model, controls and export.
- Generate from existing, finalized recording data on explicit user action. Real-time captioning during capture is not required. A paused but unfinalized recording must not be treated as a complete immutable source without a safely finalized snapshot.
- Let the user select the audio source separately for each generation request.
    - Eligible inputs include standalone audio and the audio stream inside camera/screen recordings where one exists. Show source labels and actual audio availability; video-only sources cannot be selected as if they contained speech.
    - Do not silently mix all microphones or transcribe whichever preview is audible. Preserve the selected source ID, recording/media revision, language setting and processing parameters as provenance.
    - Reuse existing transcription/media-analysis utilities, provider configuration, job handling and storage. Investigate them before adding a dependency or a second API client.
    - If external processing is used, make that explicit before sending recorded audio and use the existing authorized server path. Never expose API secrets or silently upload every source just by opening the editor. No new paid service or account should be activated implicitly.
- Subtitle track:
    - Generate timed text from the selected audio, with appropriate source language handling, including Czech. Show editable cues with start/end, text, enable/disable and preview synchronized to the common playhead.
    - Allow correcting words/times and deleting/adding a cue without modifying the original media. Persist edits with the existing autosave status and undo behavior.
    - Keep regenerated suggestions distinct from manual edits; replacing edited captions requires confirmation or creates a new revision. Do not silently discard corrections.
    - Show generation progress, cancellation, actionable failure and retry. Chunk long sessions with bounded resources and reconcile chunk boundaries so words/cues are not duplicated or lost.
- Speech-event track:
    - Represent speech intervals and silence intervals, with start/end-of-speech boundaries derived consistently from them. These are activity metadata, not a duplicate transcript.
    - Analyze the explicitly chosen audio with an appropriate speech-activity detector. Record threshold/minimum-duration or smoothing settings and confidence only when actually available.
    - A raw loudness threshold alone is not proof of speech. Cover music, background noise, breath and quiet speech, and label uncertain classification honestly.
    - Represent missing/unavailable audio as `unknown` or a data gap, not confidently as silence. Keep that distinct from actual captured silence and from a globally paused recording interval.
    - Show intervals/events as a separate timeline lane with useful labels, inspection and corrections; preserve generated versus manual provenance. Other semantic video-event detectors are out of scope for this first implementation.
- Both track types use the editor's shared original-session clock.
    - Account for source offsets, global pause removal and appended takes. Times must describe the actual corresponding recorded moment, not the wall clock or a private per-file zero.
    - Seek/playback and timeline zoom remain shared with the raw media tracks. Metadata visibility does not alter playback timing or delete data.
    - Version generation inputs. If the chosen source, recording takes or relevant timing change during processing, do not install stale results as current; mark them stale and offer regeneration without destroying valid manual work.
- Export sidecars alongside the independent source files, NOT a final flattened video.
    - Provide subtitle files in standard SRT and WebVTT with UTF-8 text, valid cue times and stable filenames linked to the source/project.
    - Export activity metadata in documented JSON and a practical CSV form: source ID, event/interval type, start/end, time unit, confidence when available, and provenance/settings. No fabricated confidence values.
    - Apply the SAME selected interval and original-to-export time mapping as the media export. Clip overlapping cues/intervals, omit out-of-range entries, and rebase to export time zero consistently.
    - Keep untrimmed originals/metadata available, with the manifest explicitly distinguishing original and prepared time coordinates. Do not burn subtitles into videos or convert silence detection into automatic destructive cuts.
- Acceptance criteria:
    - Generate both track types from one selected camera-audio source, then independently from another microphone; provenance and timing follow the actual selected source.
    - Use reference recordings with known speech/silence boundaries and Czech speech; test noise, music, quiet speech, missing audio and long/chunked input. Measure timing errors rather than asserting perfect recognition.
    - Verify edit/regenerate/cancel/failure/retry and stale-result behavior without loss of manual corrections or original media.
    - Trim and export a recording containing a pause and an appended take; subtitle cues and events line up with every corresponding prepared source file, including cues crossing trim boundaries.
    - Ensure browser-local media is processed through an explicit authorized path, and platform tests include the owner's macOS workflow plus supported Windows/other platforms.
- Keep in mind the DRY _(don't repeat yourself)_ principle. Share jobs, timing maps and exports without conflating subtitles with speech-activity events.
- Do an analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](../changelog/_current-preversion.md).

