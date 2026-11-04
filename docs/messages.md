# Messages and shared agents

`/admin/messages` creates unlisted messages for `pavolhejny.cz` or `pavolhejny.com`. Creation is explicit. Existing
records autosave immediately through the common admin save queue, with no publication state. Step one holds the
full context. The explicit generation button derives a subject, editable message and opening chat turn from the
selected Book. Step two also offers the domain, editable kebab-case prefix and optional speech. Long contexts are
fetched only when opening an editor, rather than with every row in the list.

Step one also accepts a selected or dropped audio file (including Samsung Recorder M4A, up to 2 GB). Selecting one
explicitly starts ElevenLabs Scribe transcription with automatic language detection, speaker diarization and verbatim
output. The result is appended to the existing editable context under `Následuje přepsané audio: <filename>`; source
text and non-speech annotations are preserved, with stable numbered speaker labels rather than guessed identities.
The ordinary summary button still starts the next step. Source audio is never attached as the summary's narration.

The authenticated `/api/admin/messages/transcribe` endpoint uses the existing `messages` permission and server-only
`ELEVENLABS_API_KEY` to issue a 15-minute, single-use `batch_scribe` token. The browser uploads original audio directly
to ElevenLabs; large files never pass through a Vercel request body or a serverless transcription timeout. Progress
and failures stay in the editor, in-flight work participates in admin navigation/reload protection, and billed requests
are never retried automatically. The source file/token live only in memory and are not stored with a message. Only
the resulting context follows ordinary explicit creation/autosave. An oversized combined context retains its completed
transcript for copying or insertion after shortening the existing text, without paying for another transcription.
The original audio is sent to ElevenLabs when selected, using that service's configured retention settings.

The subject's normalized prefix is limited to 40 characters. `generateShortcode()` supplies the same eight-character
suffix as Shortener. `save_expanded_message` reserves the unique registry entry and message in one transaction,
retrying a creation collision without leaving orphan links. Editing a prefix or domain changes the address;
editing the subject does not automatically rename an existing customized prefix. All changes apply immediately.

Shortener lists these as **Zpráva** and links to Messages. Its PATCH and DELETE exclude message-owned entries.
The page at the short URL renders in place; `message.md`, `context.md`, `words.json`, `audio.mp3` are accessed under
`/api/messages/<shortcode>/`. Every read verifies the exact shortcode and selected domain, including www aliases.
A link may be forwarded: there is no recipient login, password or separate access level. Messages and their codes
are excluded from anonymous database lists, feeds and sitemaps. Social previews intentionally reveal the subject
and author, not excerpts of the wider context. A receiving platform can cache its preview independently of our site.

The public summary does not contain its own sharing URL. The export and admin **Kopírovat zprávu s odkazem** action
add it after an opening greeting, or at the start otherwise. The full context is exported unchanged. Public chat
combines the current shared Book with the current message and wider context; every new submitted question and actual server reply is stored privately in `message_chat_turns`. The Messages list
offers **Konverzace** for each message, with separate anonymous conversations, Prague timestamps, full paginated
transcripts, generation failures and copying. The public UI and anonymous access stay the same. Each opened page
gets a random chat identifier; closing/reopening its floating chat keeps the conversation, while reloading the page
starts a new one. No identity, IP address or account is recorded with the transcript. Client history is only model
input: its assistant turns are never imported as genuine replies. Questions are committed before generation and
replies before returning success; interrupted requests remain visibly incomplete. Request IDs deduplicate uncertain
network retries without calling the model again. Histories are available only to the existing `messages` admin
permission; neither public chat nor public Supabase roles expose a history-reading API. The additive migration
`2026-11-0200-message-chat-history.sql` runs through the existing startup runner. Deleting a message also deletes
its conversations. Conversations made before this feature was deployed cannot be recovered.
`/admin/agents` edits the same definitions used by workshop assignments, with no public agent endpoint.
Messages compile those Books with `@promptbook/core` and call Responses directly with `store: false`, preserving the
Book's model, personality and rules. The adapter omits sampling defaults rejected by reasoning models. It does not
execute Book tools or retrieve additional hosted knowledge: the message's supplied context is its factual source. Deleting a
referenced agent returns a conflict; disable it or change the reference first.

## Storage

The existing Supabase project's Storage service is the shared object store. `site-assets` is a private bucket.
The app uses its Storage API via the existing server-side service key; Supabase also exposes an interoperable S3
endpoint for other clients. This does not require a second storage subscription or a Vercel Blob store.

Vercel configuration:

- `NEXT_PUBLIC_SUPABASE_URL`: existing project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: existing server credential, never a public environment variable.
- `OBJECT_STORAGE_BUCKET=site-assets`: shared bucket, configured for production, preview and development.
- `OPENAI_API_KEY`: existing production agent credential. No new OpenAI key is required.

`lib/storage/objectStorage.ts` owns immutable upload, removal and short-lived signed reads. Message media lives
under `messages/<internal-id>/<revision>.mp3`. The browser gets a temporary CDN URL from the application endpoint;
media bytes and range requests go directly to Storage. Objects are not made public or copied into Git. Future large
video uploads should use direct resumable/multipart uploads rather than sending video bodies through a Vercel function.
The existing workshop video integration additionally needs its own documented S3 credentials and capability checks.

To connect a fresh Supabase project, create the private bucket through Storage or `storage.createBucket`, inject the
three variables above, and redeploy. Existing project credentials are sufficient for the native API. S3 clients use
the endpoint and S3 access keys from Supabase's Storage settings; these are separate from the native API service key.

## ElevenLabs

New speech requires server-only `ELEVENLABS_API_KEY`. Optional settings:

- `ELEVENLABS_VOICE_NAME` defaults to `Pavol Hejný 2026`. If `ELEVENLABS_VOICE_ID` is absent, generation resolves one
  exact matching voice before charging for speech. Set `ELEVENLABS_VOICE_ID` if that name is ambiguous.
- `ELEVENLABS_MODEL_ID` defaults to `eleven_multilingual_v2`, using the timestamps endpoint.
- `ELEVENLABS_TRANSCRIPTION_MODEL_ID` defaults to `scribe_v2`, independently of the narration model. The existing
  ElevenLabs key must allow Speech to Text and single-use token creation. Transcription needs no object-storage setup.

The control reports missing configuration and messages work without audio. No generation happens on save, page
load, migration or build. A database lease prevents simultaneous billable requests for the same message. Requests
are never automatically retried. On an uncertain failure, check ElevenLabs history before explicitly trying again.
This MVP caps the spoken text at 10,000 characters. MP3 duration is read from the result; tracking uses actual
character timestamps only. Audio is bound to the exact Markdown version, and hidden after text changes until
regenerated. Updating only the full context does not invalidate otherwise matching speech.

## Migration and checks

The public chat remembers one conversation per message (and per homepage language) in browser localStorage,
including drafts, conversation/request identifiers and the complete visible transcript. Only the recent bounded
window is sent to the model. `Nový chat` replaces that local conversation without removing any administration
record. Interrupted network retries retain their original request ID even after refresh. Disabled/full browser
storage leaves chat usable and reports that persistence failed. No server-side history retrieval is added.

Context, short-message and current-chat exports share `MessageExportActions` and one document serializer. The
always-visible Download/Copy buttons open format menus ordered Book, Markdown and plain text; only Download also
offers PDF. Source context is fetched on demand through the same domain-scoped, no-store asset API. Context Books
declare an agent with literal KNOWLEDGE; conversation Books use CHAT/MEMBER/MESSAGE and preserve speaker order.
Literal fences grow beyond any pasted fence, so quoted Book controls stay data. NOTE, an HTML comment, a text
footnote and a quiet PDF footer carry Pavol's attribution and the personal-domain source. Browser PDF generation
shares the existing local Unicode fonts, Markdown renderer and PDF engine with workshop exports.

Chat file input accepts a picker, a drop anywhere in the conversation body and pasted screenshots (Ctrl/Cmd+V).
Up to four PNG/JPEG/WebP/GIF images, PDFs or UTF-8 TXT/Markdown/Book/CSV/JSON files can accompany a question,
each at most 4 MiB; text files additionally stay within 60,000 characters. The small-file upload route bounds
the request before parsing it, validates actual bytes and stores immutable objects in the existing private
`OBJECT_STORAGE_BUCKET`. Anonymous uploads use the same-origin/domain-scoped message or personal-homepage source
and the existing per-instance rate bound. No storage configuration or new API key is introduced.

`2026-11-0302-message-chat-attachments.sql` adds private, source/conversation-scoped file records and an attachments
column on existing chat turns. The server resolves every file ID back to its authoritative metadata in that same
chat before recording/generating. Current draft files and sent-file metadata survive local refresh. Only original
file IDs and names/types/sizes are persisted; temporary CDN signatures are created on demand. Images and PDFs
reach the existing Responses adapter as actual multimodal input, while text bytes are quoted source material.
The recent model window includes at most eight attachments / 16 MiB, independently of the full visible history.
Administration shows the attachments on the original question, including failed turns, with protected thumbnail
and download links. Public file links are random unlisted capabilities rechecked against the source's domain;
exports preserve these stable links. New chat and removing a draft attachment do not delete recorded history.

The original recording, message and reviewed word map are imported once with:

```sh
node --env-file=.env.local --conditions=react-server --import tsx scripts/messages/import-legacy-message.ts \
  /private/source/message.json /private/source/audio.mp3 /private/source/checkpoint.json
```

Source and checkpoint must be outside the public checkout. The importer creates a normal message via the shared
transaction, keeps an external checkpoint for resuming, uploads the existing bytes, verifies the downloaded SHA-256
and compares the full text/context/timing values. No legacy capability or plaintext source is committed. The old
capability route is removed, with no compatibility redirect.

The SQL migration is immutable and runs through the existing startup migration runner. Tests cover transaction
rollback/collisions, shared suffix retention and domain changes, anonymous read restrictions, Book/context chat
isolation, stale audio, character timing, exports, and normal Shortener behavior.
`2026-11-0100-message-audio-generation-lease.sql` also repairs deployed Messages tables missing either audio lease
column, preserving existing content, recordings and active leases. It reloads the PostgREST schema after the repair.
The speech lease uses two atomic conditional updates (unclaimed, then expired), avoiding PostgREST issue
[#3707](https://github.com/PostgREST/postgrest/issues/3707). Older versions reapply mutation OR filters to the returned
row: this can report a nonexistent column or hide a successful claim after updating its expiry. Selecting the expiry
alone does not fix that second failure. Regression checks exercise the serialized Supabase requests against PostgreSQL,
including simultaneous claims and expired leases.

References: [Supabase S3 compatibility](https://supabase.com/docs/guides/storage/s3/compatibility),
[S3 authentication](https://supabase.com/docs/guides/storage/s3/authentication),
[ElevenLabs timestamp synthesis](https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps).
Audio context uses [single-use tokens](https://elevenlabs.io/docs/api-reference/tokens/create) and
[batch transcription](https://elevenlabs.io/docs/api-reference/speech-to-text/convert).

## Link preparation and new narration

Every explicit creation or autosave prepares the short message Markdown with the existing workshop-material
destination parser, safe page-title scraper/fallback, Markdown escaping and ad hoc shortener. Raw HTTP(S) URLs
become `[page title](short URL)`; authored link labels remain. Registered short links on any enabled public-domain
alias are left byte-for-byte unchanged. Duplicate destinations share a replacement. Failed saves retain the draft,
and retries can reuse already-created ad hoc links. A failed metadata fetch uses the destination hostname.
Context and chat introduction remain source text. Public reads, git-backed article Markdown and historical messages
are not rewritten. Destination links retain ordinary redirect provenance (`admin-shortener`, ad hoc, message note);
the `messages` source app is reserved for the message page itself.

New audio omits bare HTTP(S)/www addresses and autolinks, including URL-only labels. Named inline/reference links
read their label. The speech script retains renderer word IDs across silent URLs, so character timing attaches
only to actually spoken words. Missing or incompatible provider alignment still disables tracking. New requests
explicitly enable ElevenLabs text normalization for numbers, dates and currencies. Neither deployment nor saving
automatically calls ElevenLabs; stored audio and timing remain unchanged until the existing explicit controls act.
