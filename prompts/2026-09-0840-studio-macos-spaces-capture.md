[x] by Developer on OpenAI Codex `gpt-6-luna` thinking `max` (ChatGPT account) - Implementation ~$0.7047 31 minutes; Testing 27 minutes

[✨🖥️] Resolve or clearly explain missing capture windows from other macOS Spaces

- The owner uses multiple **macOS virtual desktops/Spaces**. In the recording studio, whole-display and Chrome-tab selection work, but an application window such as VS Code on another Space is absent from the window chooser. The desired workflow keeps the studio on one Space and VS Code on another.
- Investigate and implement the best supported behavior. If the limitation belongs to the browser or macOS and cannot be fixed by this web application, ship a clear explanation and tested workaround instead of declaring success with no product change.
- Reproduce precisely and distinguish related situations.
    - Record macOS version, browser/version, selected capture kind, app permissions and whether the missing window is on another Space, minimized, a fullscreen Space, a different monitor or hidden. These are not interchangeable.
    - Inspect the studio's existing `getDisplayMedia` options and compare with a minimal standard capture test on the same machine. Determine whether the app itself is filtering or influencing the choices unnecessarily.
    - Check supported browser capture options and current official browser/OS documentation or issue reports. Record evidence and dates; do not treat a historical limitation as current proof.
    - Verify not only whether a window appears in the chooser, but whether its captured video continues updating after changing Spaces. A selectable window with frozen frames does not solve the workflow.
- Where this is app-fixable, correct the existing shared acquisition path, feature-detect optional APIs and preserve screen, window and tab selection on other platforms.
    - A web application does not own the browser/OS picker. Do not implement fake window enumeration, promise arbitrary system-wide access, force an undisclosed switch to entire-display sharing, or bypass browser consent.
    - Do not make private APIs, disabling browser security, an extension or a native helper mandatory in this task. A separate future native option may be documented only as such.
- Provide contextual help beside screen/window source selection when appropriate.
    - Explain the tested limitation in concrete terms and identify the affected browser/OS combinations. Avoid claiming it affects every Mac or Windows browser.
    - Test possible workflows such as selecting the window while it is on the same Space and then moving it, arranging windows on one Space, or using another supported browser. Present only verified workflows as working solutions.
    - If capture cannot survive the intended Space arrangement, say so directly and offer a tested alternative. Whole-display recording is an explicit alternative with a privacy warning, not an automatic fallback.
    - Handle cancellation, ended/muted tracks and interrupted capture with actionable UI. Do not mistake temporary source unavailability for intentional recording pause or hide missing data.
- Reuse [source restoration](2026-09-0830-studio-source-configurations.md), [camera acquisition](2026-09-0820-studio-camera-with-audio.md) and [recording controls](2026-09-0860-studio-monitoring-pause-and-append.md). Keep the macOS explanation available during manual selection, last-setup restoration and reuse from a historic recording.
- Acceptance criteria:
    - Supply a compact reproduction matrix including same-Space versus another-Space VS Code windows, fullscreen/minimized cases, browser versions, actual chooser visibility and ongoing capture behavior.
    - A code change is demonstrated to improve the real workflow, OR the delivered UI and investigation note accurately explain the external limitation and a verified workaround. State the remaining limitation explicitly.
    - Validate common screen/tab/window capture on supported Windows and other platforms; no macOS-only workaround may break them.
    - Permission dialogs remain user-controlled. No false statement that a saved configuration can resurrect an ended window stream without reselection.
- Primary starting point: [W3C Screen Capture](https://www.w3.org/TR/screen-capture/), particularly source selection and inaccessible display surfaces. Consult browser/macOS primary sources for the actual Space behavior; the specification alone does not establish it.
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do an analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](../changelog/_current-preversion.md).

