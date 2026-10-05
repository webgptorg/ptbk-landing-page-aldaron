# Recording studio: monitoring, pause and append

## Existing model and the change

The studio already had one authenticated workspace, one browser lock, stable recording and source IDs, a shared
session clock, browser-local chunk storage, and a synchronized preparation editor. Source configuration, live
`MediaStream` permissions, and a recording session have separate lifetimes. The editor's recipe maps each source
to session seconds and preserves gaps. The new controls use that project and clock; no server media or second
playback timeline was introduced.

The [MediaStream Recording specification](https://www.w3.org/TR/mediastream-recording/) says `pause()` stops
gathering into the current blob and `resume()` continues it, while their events are queued asynchronously. Its
`timeslice` is a minimum collection interval rather than a precise sample boundary. It does not promise that
separate recorder calls share a hardware clock. For this reason a global pause stops all current recorders,
awaits their final `dataavailable`/`stop` events and the bounded write queue, then saves one checkpoint. Resume
validates every required track before creating and starting a new recorder for every armed source. Each part is
an independently playable container with a stable ID, take ID, observed start time and byte counts. After all
final chunks have been committed, the studio inspects encoded audio/video timestamps in each closed container.
The next common boundary uses the longest measured source end; a shorter source tail remains a real gap. The
session clock excludes paused wall time from every part mapping and the edit recipe. Browser-observed start offsets
remain visible as genuine leading gaps. A part also retains its own audio and nominal video settings, so a later
camera replacement does not change the interpretation of earlier files. The editor's 100 ms settled
playback target and 50 ms prepared-file boundary tolerance are separate from any claim of hardware genlock.

The live monitor stores grid/focus/pinned layout, hidden and minimized tiles, preview sound, and camera mirror
preferences in a separate local key from saved capture intent. A tile can be hidden while its video/audio element
and recorder stay mounted; a pinned primary tile stays available. The status line reports every armed source.
Only preview CSS applies mirroring. No monitor choice changes a `MediaStreamTrack`, its recorder, raw media, or
which originals ZIP exports.

The **Donahrát** action starts from editing, flushes the existing edit, loads the latest take's intended source
snapshot, and requires each missing device or display source to be selected again. Permission selection does not
start a take. An explicit Start saves a new take under the same recording ID at the previous recorded session
end. A changed source set needs an explicit checkbox; earlier or later absence is represented by a real lane gap.
Pause/Resume makes parts inside the current take; Donahrát makes a new take. The separate source-configuration
reuse action still prepares a different recording. Existing parts, title and edit recipe are retained. An
untouched full-session trim extends after append, while a custom selection stays fixed.

The finalizing phase holds navigation protection until all recorder tails and storage writes settle. A full queue,
missing media, or failed checkpoint stops every recorder, while a failed source stops only its own track and leaves
the take running on the remaining ones. Either marks the project interrupted and retains acknowledged
chunks. IndexedDB commits a
chunk and its counters in one transaction. Exports package every part as an original plus a versioned recipe.
One prepared file is offered only when the selected interval lies in one playable part; crossing a pause or take
boundary currently yields explicit originals plus recipe, without silently joining containers or shifting gaps.
Older recordings with several separated timeline intervals in a single file keep those internal intervals if
appended. Their gaps remain gaps, and that file is not split or rewritten.

## Reproduction and limits

The browser fixture replaces only physical camera, microphone and display selection. It uses canvas video and
synthesized audio; real MediaRecorder, codecs, storage, synchronized editor, and ZIP export remain in use. The
focused browser scenario changes layouts while three sources record, pauses twice with a visible clock, appends
a take, reloads the same project, and inspects every exported part and the retained custom trim. It compares
each saved part's mapping to its encoded duration within 100 ms and checks camera audio/video markers. Unit cases also
cover a delayed pause flush followed by Stop, a failed recorder restart, Stop during the first checkpoint, and
recovery when a deliberate source-set change leaves an earlier track absent from the appended take.

| Environment | Evidence |
| --- | --- |
| Windows, Playwright Chromium | Three-source monitor, pause, append, reload and real-codec ZIP scenario passed. Denied display reselection keeps Start blocked. A tab switch was exercised, but this headless run still reported the capture page as `visible`. |
| Windows, installed Edge and Playwright Firefox | The same three-source synthetic-media scenario passed after the metadata and legacy-map refinements. |
| Owner's macOS setup | Physical cameras, microphones, display picker, Spaces transitions and sleep have not been tested here. |

An initial Chromium run exposed a race between a monitor-layout click and reload. Preferences now save in the
click action; the repeat Chromium run, Edge and Firefox passed on their first attempts. The 107 studio unit cases
also passed, including restoration when a later take's partial device snapshot follows a deliberate source-set
change and extension of a full-session edit recipe without a separate trim field. These are Windows synthetic-media
results, not physical-device measurements.
Three additional Chromium cases passed for a missing required microphone, source termination with the cross-tab
lock, and recovery after a real IndexedDB transaction abort.

To reproduce physically on the owner's Mac, connect a camera with audio, a second camera or microphone, and a
screen/window source. Record while switching grid, focus, pinned view, browser visibility and Spaces. Pause twice
with a visible and audible marker, stop, append after reselection, reload, and inspect each ZIP part's decoded
markers and `recording.json` gaps against the 100 ms editor target. Repeat a denied selection and revoked source.

Actual hidden-tab behavior, physical capture on the owner's Mac, moving between macOS Spaces, OS sleep, revoked permission, native picker
behavior, and microphone/speaker latency require reproduction on that machine. The synthetic browser fixture
does not establish those results. A browser or OS interruption stops the entire take and exposes recoverable
committed prefixes and any missing tail; it cannot guarantee continuation across sleep or a revoked permission.
