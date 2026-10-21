# Manual article publishing and audio production

The audio, mapping and manifest commands below are explicitly invoked editorial commands. They are
never imported by a Next.js build, `prebuild`, a request handler or a file watcher. Ordinary builds neither contact ElevenLabs nor
validate the passive hash manifest. Changing Markdown does not regenerate or invalidate audio.

`publish-assets.ts` is only a file-copy packaging step before dev/build: it copies the published
download allowlist into ignored `public/article-assets/`, leaving the committed originals untouched.
Audio is served directly as a static CDN file with byte ranges, without Next.js's 20 MB ISR body limit.
This packaging step never generates audio, captions, PDFs or hashes and never compares the manifest.

## Current first article

`articles/spec-driven-anchoring-cs/content.md` contains the complete Czech original, with its
technical caveats and author biography. `article.pdf` is the original supplied PDF.
`audio/script.txt` is the exact speech adaptation submitted to ElevenLabs Studio on 2026-10-21.
The complete narration uses the verified **Pavol Hejný 2026** voice (`I2zA26JYXwtZmPCZflQY`)
and Eleven v4. `audio/generation.json` records the Studio project, exact script hash, source export,
and normalization to one continuous 128 kbps mono MP3 with a seek index. The actual duration is
2294.778776 seconds. Both Czech feeds and the website use that identical committed file.

`subtitles.vtt` contains 839 real ElevenLabs Scribe cue intervals. They are **not individual word
intervals**. The full provider word-level JSON export still needs importing and mapping to visual
words; until then tracking is unavailable and the player remains an ordinary podcast player.
Never invent word timestamps by subdividing these cues.

The already produced binary can be transferred through the manual **Import reviewed article audio**
GitHub Actions workflow. `audio/import.json` identifies ordered Git blobs and the exact file's byte
length, SHA-256 and Git object hash. `import-audio-blobs.mjs` verifies the complete transfer before
writing and refuses a different existing recording. This is a one-time editorial file import,
never a build hook, a speech generator or a hash check during ordinary builds. Re-running with the
exact file already present is a no-op. It requires only the same repository's scoped `GITHUB_TOKEN`.

## Passive SHA-256 manifest

From the repository root:

```sh
node scripts/articles/generate-manifest.mjs spec-driven-anchoring-cs
```

This writes deterministic file records (`path`, `sha256`, actual `bytes`, `mimeType`) into
`metadata.json` while retaining audio provenance. It includes the Markdown, human metadata,
PDF, script, images and any finished recording/timing files. It excludes `metadata.json` itself
to avoid a self-referential hash, and ignores hidden temporary files/directories. Do not place
secrets anywhere in an article folder. Run this after the final editorial changes, before committing.

An optional, explicit audit compares the current files with that recorded snapshot:

```sh
node scripts/articles/generate-manifest.mjs spec-driven-anchoring-cs --audit
```

Only that requested audit fails on changed, missing or added files. It generates no media.
Neither command is part of a regular build.

## Secure access and read-only verification

Use a secret manager or a secure shell session to provide `ELEVENLABS_API_KEY` as an environment
variable. Never put a key in chat, command arguments, source files, committed `.env` files or logs.
The tool does not print keys, request headers or API response bodies.

```sh
node scripts/articles/prepare-audio.mjs spec-driven-anchoring-cs --check
```

This verifies that exactly one accessible voice is named **Pavol Hejný 2026**, records its real
voice ID in the console, checks the currently returned model list for Czech support, reads the
model's actual request limit and reports the planned request count. It generates no speech.
If exact names are duplicated, select the verified ID explicitly with `--voice-id ID`.
The default model is `eleven_multilingual_v2`; `--model ID` and `--language cs` are explicit choices.
No unverified expressive tags are inserted; intended delivery comes from the reviewed prose,
punctuation, paragraph pauses and the selected voice. Any pronunciation or expressive changes
must be made in the exact script before the one-time generation and verified by listening.

## One-time generation

Requires Node.js with `fetch`, repository dependencies, `ffmpeg`, `ffprobe`, a connected API key,
and explicit editorial intention to incur ElevenLabs usage. This is a separate command:

```sh
node scripts/articles/prepare-audio.mjs spec-driven-anchoring-cs --generate
```

The tool splits the exact adapted script at paragraph/sentence boundaries within the actual
model limit (at most 4,000 characters per request). Concatenating submitted chunk texts gives
`script.txt` byte-for-byte. It calls the official timestamped speech endpoint and stores each
exact request, text, generated MP3, response ID and real character alignment under
`audio/generation/chunk-0001/`, etc. Continuity context is recorded in each request JSON.
Finished chunks are reused only when request inputs match. An incomplete request is never
silently retried: check ElevenLabs history before deciding whether to repeat a potentially billed request.
An existing `narration.mp3` is never automatically overwritten or regenerated.

Decoded PCM sample counts determine chunk offsets; the chunks are then encoded as one stable
`audio/narration.mp3` with seek metadata. The tool also writes:

- `generation.json`: real voice/model/settings, input/audio hashes, duration and provenance;
- `alignment.raw.json`: provider character alignment and actual spoken word timings;
- `subtitles.vtt`: spoken sentence captions using those real timings.

The MP3 and raw timing are editorial output awaiting listening review. Listen to pronunciation,
transitions, expressive delivery and sync, especially around chunk boundaries. Verify the exact
MP3 served by the web. Provider alignment is real timing, but it is **not automatically a reviewed
mapping to the original article**: the audio script intentionally differs from the written prose.
Metadata remains pending after generation.

## Explicit mapping to visual words and publication

The server renderer `businesses/articles/articleDocument.ts` is the source of stable visual IDs:
`w0`, `w1`, …, excluding title/perex only when they exactly match the cover metadata. Reuse that
renderer rather than another Markdown tokenizer.

```sh
npx tsx scripts/articles/map-alignment.mjs spec-driven-anchoring-cs --template
```

This creates an **unmapped** `audio/text-map.json` containing actual spoken tokens/times and
current visible word IDs. Map each original visual word to one or more consecutive spoken token
indexes. Example for an original `AI` whose actual speech is `ej aj`:

```json
{
  "wordId": "w17",
  "visualText": "AI",
  "spokenIndexes": [21, 22]
}
```

Those numbers are an example of the shape, **not a mapping for the first article**. Do not copy
example values into a published map. Adapted-only speech, title/perex narration and visual symbols
not spoken must be accounted for explicitly in `excludedSpokenWords` (`index`, `text`, `reason`)
or `excludedVisualWords` (`wordId`, `text`, `reason`). Do not use exclusions to hide missing alignment.
Sentence IDs come from the actual spoken transcript and its real character timing, not invented
intervals on the original prose. Set `reviewed`, `listeningReviewed`, `reviewedBy`, `reviewedAt`
only after a person/editor has verified the mapping and listened to the result.

```sh
npx tsx scripts/articles/map-alignment.mjs spec-driven-anchoring-cs --publish-reviewed
node scripts/articles/generate-manifest.mjs spec-driven-anchoring-cs
```

Publication checks exact article/script revisions, MP3 identity, mapping coverage and timing bounds.
It writes `words.json` in the player's version-1 schema and changes `metadata.json.audio` to `ready`.
This is an explicit one-time editorial action, not a normal-build constraint. Commit the final files,
run the project checks and deploy the commit. The player and both Czech feeds then reference the
same public `narration.mp3` and stable variant GUID. English feeds remain empty until an actual
English variant is authored. Never call generation during deployment.

## Checks

```sh
node --test scripts/articles/editorial.checks.mjs
```

These checks cover passive manifest differences, exact chunk preservation, real-array timing,
Unicode offsets, sentence/VTT output and invalid alignment. They make no API requests.

## Official API references verified 2026-10-20

- [List voices, with exact name filtering and pagination](https://elevenlabs.io/docs/api-reference/voices/search)
- [List models, supported languages and maximum request length](https://elevenlabs.io/docs/api-reference/models/list)
- [Create speech with timing](https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps)

The timestamped endpoint returns base64 audio plus original and normalized character alignment.
The workflow retains original alignment; it does not invent word times. It uses the default
`mp3_44100_128` output, which does not presume access to premium PCM formats. The actual selected
model and voice availability are rechecked at the explicit editorial step.
