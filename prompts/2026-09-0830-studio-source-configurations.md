[x] by Developer on OpenAI Codex `gpt-6-luna` thinking `max` (ChatGPT account) - Implementation ~$0.8271 an hour; Testing 26 minutes

[✨🎛️] Retain recording-source configuration after stopping and across browser visits

- In the existing recording studio, the owner can configure several sources successfully, but stopping a recording resets that configuration. Persist the setup in the browser so the next recording starts with the same configured sources, without recreating them from scratch.
- The source-selection problems were reported on **macOS**. Preserve Windows and other supported platforms; browser permissions and device availability must be tested rather than assumed identical.
- Separate three lifecycles: the saved source configuration, a currently authorized live capture stream, and a recording session. Stopping/finalizing a session must not delete the configuration or imply that a new session has begun.
    - Persist source kinds, stable logical source IDs, user labels, order, enabled capture choices, selected camera/microphone preferences and existing quality/audio settings. Respect [camera-with-audio defaults](2026-09-0820-studio-camera-with-audio.md).
    - Persist after configuration changes, not only after a successful recording. Support removing sources and an explicit reset of the saved setup.
    - Use the existing local settings/storage layer with a versioned schema and migrations. Store only serializable preferences, not MediaStreams, track objects, blob URLs, permission grants or raw media in localStorage.
    - Keep configuration scoped to the correct origin/browser/profile and authenticated admin context where appropriate. It is not automatically available on another machine; do not sync device identifiers to contact records or public APIs.
- Keep the configured source cards visible after Stop and when opening a new recording. State whether each source is ready, needs permission/reselection, is disconnected, or is unavailable.
    - Stopping the recorder need not discard a still-authorized preview stream in the same open page. If retaining previews, visibly distinguish `Náhled aktivní` from recording and provide an explicit release-capture action. Release hardware on page/session teardown as appropriate.
    - After reload, restore cards/preferences without starting recording or secretly activating capture. Acquire the required live sources on deliberate user action.
    - Reuse an available camera/microphone ID only where permitted. If it changed or disappeared, ask for a replacement while retaining the rest of the setup; do not silently record from a different device.
    - A saved screen/window/tab preference is a source intent, not a persisted capture permission. Use supported selection hints and show the old label to help reselection; do not promise restoration of an ended display stream without the browser chooser.
    - Make multi-source reacquisition staged and clear. Each display capture may need a fresh user gesture; do not assume one click can reliably spawn an arbitrary sequence of permission dialogs.
- Fail safely: cancelling one permission dialog or failing one source does not delete all preferences, duplicate cards, start a partial session unnoticed, or invalidate other ready sources. Show a readiness check before Start.
- Acceptance criteria:
    - Configure camera+microphone, standalone audio and window/screen capture; record, stop, open a new session and confirm every intended setting remains.
    - Test reload, browser restart, cancelled permission, revoked permission, renamed/disconnected hardware, corrupted/older settings and explicit reset.
    - No recording starts from restoration alone. Verify capture indicators and hardware cleanup independently from persisted cards.
    - Test the owner's macOS scenario and supported Windows/other-platform paths; document any required reauthorization honestly.
- Reuse the existing recording studio discovered through `prompts/2026-09-0440-admin-recording-studio.md` and the current implementation; do not introduce a parallel recorder or global source registry unrelated to it.
- See [Screen Capture](https://www.w3.org/TR/screen-capture/) for the distinction between source intent and renewed display permission. Check the current browser implementation.
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do an analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](../changelog/_current-preversion.md).

---

[x] by Developer on OpenAI Codex `gpt-6-luna` thinking `max` (ChatGPT account) - Implementation ~$0.3505 28 minutes; Testing 28 minutes

[✨♻️] Reuse the source configuration of an existing recording

- Follow-up to the previous prompt in THIS file. Reuse its saved-configuration schema and acquisition/readiness UI. Verify that foundation exists before implementing this section; do not build a second restoration path or rerun completed work.
- Add `Použít tuto konfiguraci zdrojů` to the recording detail/editor and, where appropriate, its list actions.
    - Each newly recorded session stores an immutable snapshot of the intended source configuration, separate from the browser's mutable last-used setup.
    - Clicking the action loads that snapshot as the setup for a NEW recording, without overwriting the original recording, its sources, media, timeline or edits.
    - Preserve labels/order, camera and microphone choices, audio-on/off state, capture kinds and relevant quality settings. Do not copy transient streams or permission state.
    - If the current setup would be replaced, show that clearly and request confirmation when there are changes to lose. Default to replacement rather than silently duplicating all sources into the current list.
- Respect capture/security boundaries.
    - The reported workflow is on **macOS**. Existing usable device preferences may reduce manual work, but a saved window name is not an authorization token or a reliable persistent window ID.
    - Reuse a live authorized stream only if still valid and appropriate. For ended display captures, guide the user through browser selection with the saved source label/kind as a hint; do not bypass the chooser or silently share a whole screen instead.
    - A successful configuration restore is distinct from fully acquired sources and distinct from recording. Display the remaining permission/reselection steps, and never start recording merely by clicking the reuse action.
    - Missing/renamed devices are handled individually without throwing away other restored preferences. Persist the confirmed new setup through the same service as manual configuration.
- Older recordings without complete configuration metadata remain usable. Reconstruct only the fields genuinely stored, clearly identify unavailable details, and ask the user to fill them in. Do not invent historic microphone or window identities.
- This action starts another recording with the same setup. Appending a synchronized take to the SAME recording is a different explicit action specified in [recording controls](2026-09-0860-studio-monitoring-pause-and-append.md).
- Acceptance criteria:
    - Restore a multi-source setup from recording A, resolve any permissions, and record B with the expected sources; A remains byte-for-byte unmodified by the reuse action.
    - Test a different current setup, cancellation, missing devices, legacy recordings, and retry without duplicate cards.
    - Verify on macOS that the UI accurately distinguishes reusable device preferences from screen/window choices that require renewed approval; regression-test other supported platforms.
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do an analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](../changelog/_current-preversion.md).


