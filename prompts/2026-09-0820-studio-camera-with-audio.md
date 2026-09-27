[x] by Developer on OpenAI Codex `gpt-6-luna` thinking `max` (ChatGPT account) - Implementation ~$0.00 an hour; Testing 29 minutes

[✨🎙️] Capture a webcam with microphone audio by default, while preserving standalone audio recording

- The owner reports on **macOS** that a webcam source currently records picture only. A separate audio source works, but the normal webcam action should create a camera recording WITH sound. Verify the current implementation and exact browser/version; do not assume this is an API or OS limitation.
- Make `Kamera + mikrofon` the default camera-addition workflow for newly configured camera sources.
    - Provide a camera selector, a microphone selector and an explicit `Nahrávat zvuk` option, enabled by default. A webcam does not necessarily contain a microphone; the default/system or chosen microphone may be a separate device.
    - Keep an intentional video-only choice and keep adding standalone microphone/audio sources as before. Do not automatically change existing saved silent recordings or override an explicit stored video-only preference.
    - Show the selected microphone, audio-track presence and a live level meter. A silent room is different from a missing or failed audio track.
- Use supported capture/recording capabilities, sharing the existing source-acquisition code.
    - Investigate requesting both audio and video through `getUserMedia`, or acquiring and combining the chosen tracks when needed. Preserve their A/V timing, record both in the camera source's exported media file, and negotiate a supported container/codec combination.
    - Do not merely play microphone audio in the UI or rely on a second file to make a supposedly sound-enabled camera file audible.
    - This is microphone sound, not automatically captured computer/system sound. Do not claim that selecting a microphone captures the audio of other applications.
    - Keep live camera preview muted to avoid feedback; muting the PREVIEW must not disable its recorded audio. Make any intentional audio-monitoring control separate and clear.
    - Reuse/clone a capture track safely when the same microphone is also selected independently; ownership and cleanup must not stop another source accidentally. Do not silently duplicate mixed audio or delete a deliberately configured standalone source.
- Handle permission and hardware failure explicitly.
    - Microphone denial, no microphone, busy devices, unsupported constraints and device disconnection must be distinguishable and actionable.
    - When combined acquisition fails, retain the user's requested configuration and offer retry, another microphone, or an explicit switch to video-only. Do not silently record an hour without audio while showing `Kamera + mikrofon`.
    - If a required track fails during recording, use the shared session failure policy and preserve sync/recovery information; never restart that source at an unrelated time zero.
    - Permissions are requested on deliberate user action. Do not ask for a microphone when the user explicitly chose video-only or selected another unrelated source.
- Integrate the audio choice and device preferences into [persisted source configurations](2026-09-0830-studio-source-configurations.md) and the recorded source metadata used by [the editor](2026-09-0850-studio-synchronized-editor.md). The latter must recognize the audio contained inside a camera file for playback and subsequent transcription.
- Acceptance criteria:
    - A new camera source defaults to video plus the selected microphone; an exported camera file demonstrably contains audible, synchronized audio.
    - Standalone audio and intentional silent video still work. Preview muting does not mute the recording.
    - Cover denied permission, absent/busy/unplugged devices, a shared microphone used by two sources, and saved configuration restoration.
    - Test on the reported macOS setup, and supported Windows/other-platform browsers; record exact tested versions and unsupported combinations.
    - Use a visible/audible clap or equivalent fixture to check A/V alignment at the beginning and end, not merely the existence of an audio track.
- Research starting points: [Media Capture and Streams](https://www.w3.org/TR/mediacapture-streams/) and [MediaStream Recording](https://www.w3.org/TR/mediastream-recording/). Verify browser support rather than assuming every format works everywhere.
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do an analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](../changelog/_current-preversion.md).

