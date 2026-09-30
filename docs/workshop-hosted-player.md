# Hosted workshop player

## Existing behavior reviewed before implementation

The room already selected video, presentation or repository through `WorkshopStage` and used one server-side paid
replay rule for room JSON and hosted requests. Hosted publication already verified a schema 5 manifest, prepared files
and optional workshop sidecar, then exposed complete private files through authenticated byte ranges. The participant
player used one of its native video elements as the changing clock source. It had no camera overlay, activity speed,
timeline event markers or commit selection. Its live slider and unrestricted byte ranges allowed a free live viewer
to read the complete recording, even while the browser controls were supposed to represent live viewing.

## Playback and timing

`HostedRecordingTransport` owns the only session playhead. All screen and camera media settle at the same prepared
export second before playback starts; decoder drift is corrected within the studio's 100 ms target. Buffering hides an
unready frame. Seeking back into a track's covered time can recover it after a gap. Auto uses reviewed scene
transitions and falls back to the first ready editor, application or camera track, in that order; a manual tab reports
its missing, gap or buffering state. The camera is a bottom-right overlay
only when it is ready and another track fills Auto. The camera's audio is preferred when available, otherwise the
first audio-bearing track; all other tracks stay muted. No subtitle sidecar enters the player.

Activity intervals are half-open. Active and unclassified seconds run at 1× in Auto speed; reviewed automatic-coding
seconds advance at up to 10×. Each accelerated step advances only after all available decoders settle, so slow
hardware reduces effective throughput rather than displaying an old picture at a new session time. Audio is muted
during those steps. Manual speed stays fixed. View Auto and speed Auto are independent choices. The selected commit
comes from the published starting SHA and reviewed anchors; an unavailable SHA or changed repository is shown as
unavailable while playback continues. Exploring the repository graph never seeks the video.

## Delivery and access

The authorized manifest identifies a full-file or live-window delivery mode using the membership and workshop phase
already used by the room. Members receive the full published file with byte-range seeking. A free live viewer receives
only the completed segment covering the delayed playhead, with segments capped at two seconds and cut at studio take
boundaries. The playhead is normally two seconds behind the workshop clock. The server
remuxes that segment with a `shrink` copy boundary so it cannot include earlier or future key frames, verifies its
duration and first frame, and bounds source reads, result size and cache. Each manifest, full-file, segment, HEAD and
byte-range request rechecks the existing room session and membership. A free request for the complete file or any
earlier or future segment is refused. The browser's live timeline, speed and pause controls are locked as a second
layer; reconnecting selects the current server-authorized segment. The delay is applied to wall time, so a studio
pause plays the last completed segment before showing a waiting state until the next segment is complete. After the
last segment's delayed playback ends, the free live route closes even if the workshop itself has not ended yet. An
unaligned key frame, slow remux or absent segment is reported as unavailable or buffering; the player retries the
current segment and does not show a stale image.
The final partial segment becomes available when its media end is reached and plays through the same delay while the
workshop remains ongoing.

Only a complete, verified revision can be published. This delivery path schedules playback of that completed upload
against the workshop clock. It does not ingest new media during an ongoing event, and it cannot serve a segment that
has not been published. Operators should verify key-frame alignment at every segment boundary, including partial take
endings, on the target MP4 or WebM files; a source that cannot produce an independent segment will show buffering
during free live viewing.
Because the free window is two seconds behind, set the workshop's recorded end at least two seconds after the
prepared media end if the final tail should be seen before the shared wrap-up and paid replay gate take effect.
The paid replay, teaser and wrap-up still follow the existing stage and room policy. The YouTube embed and
presentation/repository primary stages are unchanged.

## Verification

Unit tests exercise delayed decoder settling against the 100 ms tolerance, Auto speed changes at boundaries and
after seeks, pause-aware live clock mapping, scene fallbacks, anchored commit selection, direct-file/old/future
segment denial and real remuxing of a WebM fixture. Browser codec and device behavior, production S3 latency and
physical capture alignment still require a live rehearsal with the files selected for publication.
