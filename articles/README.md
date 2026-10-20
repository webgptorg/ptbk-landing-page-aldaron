# Articles

Each language variant has one folder, one stable ID, its own audio and PDF, and an independent author and language. `content.md` is the source of truth for the written article. A translation is a new folder and variant ID with the same `translationGroupId`; an absent translation is never published as a placeholder.

```text
articles/<variant-id>/
  content.md
  metadata.yaml
  metadata.json
  article.pdf
  images/                 # optional committed artwork
  interactive/            # optional article-specific explanatory assets
  audio/
    script.txt            # adapted spoken text, separate from the written article
    narration.mp3         # final recording, only after an explicit editorial generation
    subtitles.vtt         # real recorded timing
    words.json            # reviewed word-to-written-text mapping
```

## Editorial metadata

`metadata.yaml` uses the fields below. Quote dates so YAML keeps them as ISO strings.

```yaml
id: spec-driven-anchoring-cs
translationGroupId: spec-driven-anchoring
authorId: pavol-hejny
language: cs
slug: co-prichazi-po-generovani-kodu
title: 'The complete authored headline'
perex: 'The authored introduction'
publishedAt: '2026-10-20T21:00:00+02:00'
# updatedAt: '2026-10-21T12:00:00+02:00'
status: published # or draft
tags: [AI, Programování]
# coverImage: images/cover.png
```

Authors are defined once in `lib/articles/authors.ts`, with a stable identity, localized bio, photograph, social links and canonical domains by language. Adding another author does not require encoding a language or website in the author ID. Promptbook lists every published variant in the appropriate language. The current personal publication filters Pavol's author ID and language. Add an actual author's publication and domain routing only when their site exists.

Czech author originals are canonical on `pavolhejny.cz`, English originals on `pavolhejny.com`. Promptbook copies retain that same canonical. Only existing translations produce language alternates. Article metadata and sharing cards use the site's existing shared PNG renderer.

## Technical provenance and audio

`metadata.json` is a passive manifest. Its `files` array records `{path, sha256, bytes, mimeType}` for relevant committed files, excluding the manifest itself. Optional `audio` records the real voice, model, settings, generation date and provenance.

A pending narration has `audio.status: pending`. It has no playable URL, no fabricated word timings and no podcast enclosure. Once the recording and reviewed mapping exist, the technical metadata uses:

```json
{
  "audio": {
    "status": "ready",
    "file": "audio/narration.mp3",
    "durationSeconds": 123.45,
    "wordsFile": "audio/words.json",
    "subtitlesFile": "audio/subtitles.vtt",
    "voiceName": "Pavol Hejný 2026",
    "voiceId": "actual-provider-voice-id",
    "modelId": "actual-provider-model",
    "createdAt": "2026-10-20T20:00:00Z"
  }
}
```

Those values are illustrative, not a recording. The loader only exposes a ready recording when its actual file and a positive duration exist, and reads the actual byte length. Both podcast feeds and the player use the exact same `https://ptbk.io/article-assets/<id>/audio/narration.mp3` URL and stable variant GUID.

Generation and alignment are explicit, one-time editorial commands. See `scripts/articles/README.md` for provider verification, secure credentials, review and mapping. Build and request paths never call ElevenLabs or generate PDF/audio. The speech script is marked as prepared until the exact submitted input is known; preserve the actual submitted input with the recording.

Record hashes explicitly after the editorial work:

```bash
node scripts/articles/generate-manifest.mjs spec-driven-anchoring-cs
```

An audit is opt-in and read-only:

```bash
node scripts/articles/generate-manifest.mjs spec-driven-anchoring-cs --audit
```

Neither command is part of `build`. A text/hash mismatch never implicitly fails a build, regenerates speech or calls an external service.

## Publication and feeds

A publication is a Git commit and deployment, without a database, CMS, user accounts or runtime publishing state. Article pages server-render the committed Markdown as readable, indexable HTML. Their surrounding layout remains aware of the requested domain, as the existing shared application requires; it is not forced into a host-blind static layout. Downloads and committed podcast artwork are served unchanged through static routes. RSS is generated at build time. No RSS XML is committed. `articles/_podcasts/` stores the 1600-square podcast artwork, prepared once from existing brand marks and the existing author portrait.

| Publication | Article index | Podcast feed |
| --- | --- | --- |
| Promptbook CZ | `https://ptbk.io/cs/articles` | `https://ptbk.io/cs/articles/podcast.xml` |
| Promptbook EN | `https://ptbk.io/en/articles` | `https://ptbk.io/en/articles/podcast.xml` |
| Pavol Hejný CZ | `https://pavolhejny.cz/articles` | `https://pavolhejny.cz/articles/podcast.xml` |
| Pavol Hejný EN | `https://pavolhejny.com/articles` | `https://pavolhejny.com/articles/podcast.xml` |

Only actual ready recordings appear as episodes. Empty feeds remain valid. Equal GUIDs across independent podcasts do not promise client deduplication or synchronized listening history. Browser positions remain local to each domain. AI ta Krajta continues to use its existing feed and does not publish these articles.

Before publishing, check source fidelity, canonical metadata, real PDF/audio downloads, RSS validity, desktop/mobile layout and the shared player's navigation and paused refresh behavior. Relevant automated checks:

```bash
npx vitest run lib/articles middleware.test.ts lib/domains/publicDomainRouting.test.ts app/sitemap.test.ts
```
