# Manual podcast transcript pilot

The pilot contains ten complete recordings selected in `transcripts/index.json`: six AI ta Krajta episodes
(65, 64, 63, 62, 61 and 57) and four external appearances (Data Talk 157, Zátiší on 3 January 2024,
Pitchuj about Collboard, and Youngschooler's 5). Their reviewed running time is about 8.07 hours.
NatřiAI 36 is excluded because its complete publicly downloadable source has not been verified.
Number 60 is excluded because its title explicitly describes a first part.

`pending` means no full word-timed transcript has been imported. It must never be interpreted as a completed transcription.
The initial index is preparation; no placeholder VTT, guessed times or inferred speaker names are published.

## Data and compatibility

- One recording has one UTF-8 `.vtt` with real intervals and `<v speaker-id>` spans. Preserve the entire conversation.
- `pavol-hejny` is the stable identity for Pavol. All unidentified speakers get recording-local IDs.
- Retain each original paid Scribe JSON losslessly as `transcripts/raw/<id>.scribe.json.gz`.
- The index carries the show, publication date, exact source URL, reviewed duration and provider/import provenance.
- A migrated Krajta entry uses `transcriptFile` in the existing episode JSON. Unmigrated entries retain `transcript` unchanged.
- Only server-side archive search calls `readPodcastTranscript`. Page metadata and browser props contain neither complete
  text nor filesystem references. The public search endpoint, player and UI retain their existing contracts.
- Existing subtitle parsing is reused only to produce plain search text. It does not rewrite the original voice-labelled VTT.
- VTT files are explicitly included in the search function's deployment file tracing.
- An episode with no inline transcript and no VTT is allowed and contributes no transcript matches.

## Explicit processing

Register a verified 10-60 second single-speaker recording as `pavol-hejny` in ElevenLabs Speech to Text / Speakers.
Use original speech, not the synthetic preview of a cloned TTS voice. Record the actual enrollment source and interval
when enrollment succeeds. Other people can remain anonymous. Check known-voice matching on the first full dialogue
before processing the remaining selected recordings. Inspect ambiguous and overlapping passages rather than guessing an author.

The command has a read-only local default:

```sh
node scripts/podcasts/transcribe.mjs youngschoolers-5 --check
```

Supply the existing or explicitly approved, narrowly scoped `ELEVENLABS_API_KEY` through a private environment or
secret manager. Never commit credentials, copy keys into command arguments, or recover an unrelated credential from
an old URL. A paid request is explicit, and exactly one selected recording is processed:

```sh
node scripts/podcasts/transcribe.mjs youngschoolers-5 --run
node scripts/podcasts/import-scribe.mjs youngschoolers-5 .tmp/podcast-transcriptions/youngschoolers-5.scribe.json
```

The requester saves original results before local validation. A retained started request without a confirmed result
stops another request: check provider history first. No automatic billed retries, feed polling, scheduled jobs,
build hooks, new public transcript pages or new search features are introduced.

The importer requires actual word timings, a positively identified Pavol, and coverage compatible with the reviewed
full recording. Review and store an explicit `speakerMapping` when a provider-local label needs mapping; never map a
speaker solely because the person appears in the episode roster. It preserves raw output, writes the canonical VTT,
migrates only that Krajta entry and records the completed import in the index. Other episode metadata and old inline transcripts stay intact.

## Verification

Run the focused tests before committing imports:

```sh
npx vitest run lib/podcast businesses/ai-ta-krajta scripts/podcasts app/api/ai-ta-krajta/episodes/search
npm run test-types
```

Also verify all ten VTT files exist, every imported file contains `pavol-hejny`, recording-local speaker IDs do not
collide between recordings, source durations match, and complete source texts are absent from browser page props.
Automatic checks establish format and search compatibility; they do not establish speaker-recognition accuracy.
