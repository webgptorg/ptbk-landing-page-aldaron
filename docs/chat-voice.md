# Shared realtime voice chat

The existing FloatingAgentChat supports explicit microphone conversations on the full Pavol avatar, personal homepage, Messages and allowlisted site advisers. Voice uses the same managed Book, server-owned source context, browser conversation ID, request deduplication, attachment checks and private administration history as text.

## Provider and billing

This implementation uses the existing server-only ELEVENLABS_API_KEY for Scribe v2 Realtime and streamed Flash v2.5 TTS. It does not create an ElevenAgents agent, subscribe to Speech Engine, change plans, purchase credits, or enable auto top-up/usage billing.

These ordinary speech APIs consume the account's applicable credit allowance. Usage after that allowance depends on existing PAYG, auto top-up or legacy usage billing settings. No claim about the actual account balance or overage setting follows from installing this code. Text-model usage continues on the existing OPENAI_API_KEY and is separate from ElevenLabs. The earlier flat Speech Engine minute estimate does not describe this implementation.

Sources:
- https://elevenlabs.io/docs/overview/administration/billing
- https://elevenlabs.io/docs/overview/administration/pay-as-you-go
- https://elevenlabs.io/pricing/api

## Exact voice

Before issuing microphone-transcription access, the server resolves exactly one voice named Pavol Hejný 2026. If ELEVENLABS_VOICE_ID is configured, its actual provider name and ID are checked. A missing, ambiguous, inaccessible or differently named voice stops voice setup; there is no generic-voice fallback.

Existing narration settings remain unchanged. Optional ELEVENLABS_CHAT_MODEL_ID is separate and defaults to eleven_flash_v2_5. Choose a model compatible with the TTS stream/timestamps endpoint and mono PCM 24000 output. No new key is required; the existing key needs voice lookup, TTS and Speech to Text permissions.

## Audio and conversation lifecycle

1. Explicit Talk requests microphone permission and resumes Web Audio from the user gesture.
2. The server reuses the placement's domain/origin and enabled-agent checks, resolves Pavol's voice and issues a single-use realtime_scribe token plus an HMAC capability scoped to source, conversation, client address and ten minutes.
3. An AudioWorklet sends 16 kHz microphone PCM directly to Scribe. Language detection is automatic, including Czech speech on the English personal domain. VAD commits an utterance after a short pause; interim text is displayed without saving unstable revisions.
4. A committed utterance is submitted to the same chat endpoint. The current Book and source context remain server-owned. Responses text deltas are displayed immediately and short phrases feed streamed Pavol-voice PCM as generation continues.
5. Echo cancellation and noise suppression are requested. Nonempty partial speech interrupts both pending generation and queued playback. Recognized follow-up utterances wait for the previous local state update before submission.
6. Mute disables the microphone track. End, close, reset, unmount, pagehide, provider failure, or the ten-minute client timer releases capture, socket, scheduled audio and AudioContext. Only one voice session per same-origin browser tab set remains active. Stopping during the permission prompt also stops any track that resolves later.
7. Existing typed drafts are retained when speaking. Text, speech and file questions use one history. No raw audio is archived by the application; ElevenLabs retention follows the account's policy.

## Playback records and exports

The additive 2026-11-1700 migration adds voice_status and spoken_reply to private message_chat_turns. Existing replies, source keys, grants, RLS, legal texts and other data are unchanged.

The full generated answer remains separate from playback metadata. A phrase counts as confirmed played only after its last scheduled PCM sample ends. Interruption stops the remaining queue and reports the fully played prefix through a signed, source/conversation/turn-scoped, transcript-only acknowledgement. A partially audible final phrase is deliberately not guessed. The public history, administration, model context and all exports identify incomplete playback and retain the complete generated text.

A missing acknowledgement remains visibly unconfirmed. Network failure does not claim the server received it. Refresh retains locally committed transcript history; active microphone capture does not survive a reload.

## Bounds and verification

Setup: five starts per five minutes per address; voice questions: sixty per five minutes per address. These use the existing per-process limiter, not a distributed billing ledger. Browser duration and capability expiry are ten minutes. Single-use Scribe token access is not a hard global spending cap; account-side credit and top-up limits remain authoritative.

No automatic paid provider retry occurs. Credit, voice, permission or network errors leave text chat available.

Automated checks cover capability scope/expiry, exact voice selection, no billing changes, stream and audio accounting, credit failure, microphone cleanup, additive private migration, and existing text/file/export behavior. A physical Czech conversation on desktop and Android/iOS is still necessary to assess timbre, acoustic echo, interruption sensitivity and perceived latency; mocks and a successful build do not establish those properties.

API references:
- https://elevenlabs.io/docs/api-reference/tokens/create
- https://elevenlabs.io/docs/api-reference/speech-to-text/v-1-speech-to-text-realtime
- https://elevenlabs.io/docs/api-reference/text-to-speech/stream-with-timestamps
