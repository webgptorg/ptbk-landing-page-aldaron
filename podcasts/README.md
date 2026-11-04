# Manual podcast transcript pilot

The pilot contains ten complete recordings selected in `transcripts/index.json`: seven AI ta Krajta episodes
(65, 64, 63, 62, 61, 57 and 56) and three external appearances (Zátiší on 3 January 2024,
Pitchuj about Collboard, and Youngschooler's 5). Their reviewed running time is about 6.67 hours.
NatřiAI 36 is excluded because its complete publicly downloadable source has not been verified.
Number 60 is excluded because its title explicitly describes a first part.
Data Talk 157 was processed successfully by the provider, but a connection failure lost the response before its
transcription ID reached the client. It is not a completed local archive and was not billed again. The attempt and
provider trace reference are retained in `transcripts/attempts.json`; episode 56 replaces it in this pilot.

`transcribed` means the complete word-timed provider result, canonical VTT and speaker review have been imported.
`pending` means this has not happened; it must never be interpreted as a completed transcription.

## Data and compatibility

- One recording has one UTF-8 `.vtt` with real intervals and `<v speaker-id>` spans. Preserve the entire conversation.
- `pavol-hejny` is the stable identity for Pavol. All unidentified speakers get recording-local IDs.
- Retain each original paid Scribe JSON losslessly as `transcripts/raw/<id>.scribe.json.gz`.
- The index carries the show, publication date, exact source URL, reviewed duration and provider/import provenance.
- Point-timed interjections retain their own voice span inside a neighboring cue bounded by actual provider times.
  Their original word-level point timings remain in the raw JSON; no duration is invented or word omitted.
- Where an MP3 container estimate is inaccurate (Zátiší), the decoded PCM sample count verifies the full duration.
- A migrated Krajta entry uses `transcriptFile` in the existing episode JSON. Unmigrated entries retain `transcript` unchanged.
- Only server-side archive search calls `readPodcastTranscript`. Page metadata and browser props contain neither complete
  text nor filesystem references. The public search endpoint, player and UI retain their existing contracts.
- Existing subtitle parsing is reused only to produce plain search text. It does not rewrite the original voice-labelled VTT.
- VTT files are explicitly included in the search function's deployment file tracing.
- An episode with no inline transcript and no VTT is allowed and contributes no transcript matches.

## Explicit processing

Use original single-speaker speech, not a synthetic preview of a cloned TTS voice. The pilot uses the original
39.7-second `Recording 1.mp3` sample belonging to Pavol's existing ElevenLabs voice. Its SHA-256 and provider sample
reference are recorded with each acoustic review; the private reference audio and biometric embeddings are not published.
Each recording is compared against five disjoint reference intervals with WeSpeaker ResNet34. The index records the
matched provider label, cosine similarity, competing labels and checked source intervals. Cosines are similarity
scores, not probabilities. The first full dialogue was also checked against its spoken introduction. Other people
remain anonymous. Inspect ambiguous, short and overlapping passages rather than guessing an author from the roster.

ElevenLabs speaker-library matching is requested when a registered profile is available, but it is not required.
The manual offline reviewer can establish an explicit mapping from original audio and an existing Scribe result:

```sh
# Separate manual environment, not website dependencies:
python3 -m pip install numpy==2.5.4 onnxruntime==1.31.1 kaldi-native-fbank==1.22.5
python3 scripts/podcasts/review-speakers.py youngschoolers-5 \
  --model /private/voxceleb_resnet34.onnx --reference /private/pavol-original-reference.mp3 \
  --audio /private/youngschoolers-5.mp3 --transcript .tmp/podcast-transcriptions/youngschoolers-5.scribe.json \
  --output .tmp/podcast-transcriptions/youngschoolers-5.speaker-review.json
```

The model comes from `https://huggingface.co/Wespeaker/wespeaker-voxceleb-resnet34` (Apache 2.0).
The reviewer checks its SHA-256 (`9fea6516d7ad6bf0a76c7689f5a49b65d330fad6dde96c91bb4435ffbfe056a1`)
before inference and follows the upstream Hamming-window, 80-bin Kaldi fbank preprocessing with utterance mean
normalization. It only outputs evidence; it never changes speaker identities or requests paid transcription.

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

Some podcast hosts reject a provider's URL fetch. After confirming an HTTP 400 rejection in Request Log and that
no transcript exists, retain that attempt's marker under a separate rejected-attempt filename. A subsequent explicit
`--run --file /private/reviewed-original.mp3` uploads the already downloaded and duration-checked source instead.
This is a manual recovery step; the CLI never clears request guards or retries automatically.

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
