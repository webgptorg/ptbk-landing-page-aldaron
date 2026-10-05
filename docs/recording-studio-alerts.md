# Recording studio alerts: delayed test, notification delivery and verification

An administrator records a workshop while working in another tab, another application or another macOS Space. The
studio therefore announces every failure three ways — on its page, as a synthesized sound, and as a notification of
the browser — and offers **Otestovat výstrahu** to rehearse that before a recording.

Two things were wrong with the rehearsal. It fired the instant its button was clicked, which only proves that an
alert reaches somebody who is looking at the studio. And the page said things it could not know: _"výstraha dorazí i
mimo tuto kartu"_, _"dostanete upozornění prohlížeče, i když máte otevřenou jinou aplikaci"_.

## What existed before

| Area | Before | Consequence |
| --- | --- | --- |
| Test | `announceTestAlert` raised the alert synchronously in the click | The alert could never be observed from anywhere but the studio tab |
| Notification result | `showRecordingAlertNotification` returned a boolean which the hook ignored | A refused or failed notification looked exactly like a delivered one |
| Notification events | Only `onclick` was handled | A `show` or `error` reported by the browser was lost |
| Wording | Unconditional delivery promises | The page vouched for the browser, the system and the administrator's own eyes |
| Severity of a test | `critical`, the same as a stopped recording | Same red row, same alarm melody, a notification worded like a failure |
| Permission | Read once when the studio opened | A permission revoked in the browser's settings stayed "granted" on the page |
| Sound | A new `AudioContext` per alert, then `await context.resume()` without a bound | In a document nobody has clicked, `resume()` never settles, so the alert sound never reported anything |

Real failures were, and still are, announced the moment they are reported by `RecordingStudioCapture`; nothing in this
work changes their timing.

## What the studio does now

### The test counts down against a deadline

`lib/recording-studio/recordingStudioAlertTest.ts` holds `RecordingAlertTestCountdown`, a class without React or DOM.

- **Otestovat výstrahu** starts a five-second countdown (`RECORDING_ALERT_TEST_COUNTDOWN_MILLISECONDS`). The notice
  says to switch to another tab, application or desktop, shows the remaining time and offers **Zrušit test**.
- The countdown is a deadline on the monotonic clock. Every tick asks how far away the deadline is; no tick is
  counted. The deadline has one timer of its own, armed from the click, because a browser throttles a chain of
  timers in a hidden tab much harder than a single one. A timer which runs early re-arms for the remainder.
- Nothing listens to focus or visibility in order to cancel or pause. Returning to the page (`visibilitychange`,
  `pageshow`) only makes the countdown look at its deadline again.
- A second click starts nothing: the button is disabled, and `start()` refuses while a test is pending, which also
  covers clicks that arrive before the page re-renders.
- At expiry exactly one alert is raised through `announceFailure`, the same function every real failure uses. The
  delay past the deadline is measured; from two seconds up the alert says so, because that is what a throttled tab did.
- The countdown lives in `useRecordingStudioAlerts`, which `RecordingStudio` owns from the `(workspace)` layout. It
  therefore survives moving between the setup view and a recording's editor. It is cancelled when the studio is
  unmounted, when the sign-out form is submitted, on `pagehide`, and by `cancelTestAlert`, which `useRecordingStudio`
  calls when the studio becomes `unavailable`. Signing out is recognised by its form rather than by the page going
  away, because the page lives on until the server answers and a test must not fire into that gap. A studio
  deactivated by a future takeover has to call the same `cancelTestAlert`.

What is deliberately **not** promised: an exact moment. Background throttling delays timers, and no timer runs while
the computer sleeps, the page is frozen or the browser is closed. The notice says this in the administrator's words.

### Whatever needs a click is asked for by the click

`RecordingAlertTestCountdown.start()` calls `prepare()` synchronously, inside the click handler:

- **Sound.** `retainRecordingAlertSound()` opens (or wakes) the one `AudioContext` of the alert channel and keeps it
  awake until the test has fired or was cancelled. `startRecording` and re-enabling the sound checkbox call
  `prepareRecordingAlertSound()` for the same reason: they are the last clicks before a real failure.
- **Permission.** If notifications are enabled in the studio and the browser has never been asked, the click asks.
  The state becomes `awaiting-permission`, and the full five seconds start only after the answer — reading the
  question costs none of the countdown. Nothing ever asks when the timer runs out. The explicit **Povolit upozornění
  prohlížeče** button stays.

### One alert, two channels, and what is known about each

`announceFailure` appends the alert to the history first and then hands it to each enabled channel independently. A
channel which is switched off, refused, unsupported or failing never stops the other one or removes the alert.

`lib/recording-studio/recordingStudioAlertDelivery.ts` keeps, beside every alert, how far each channel got:

| Notification status | Meaning | What it does **not** mean |
| --- | --- | --- |
| `disabled` | Switched off in the studio's own settings | — |
| `unsupported` | The browser has no Notifications API | — |
| `permission-missing` | The browser was never asked, or the question was dismissed | — |
| `permission-denied` | The site is blocked in the browser | — |
| `dispatch-failed` | The constructor threw, or the browser fired `error` afterwards | — |
| `dispatched` | The constructor returned | That anything was displayed |
| `displayed` | The browser fired `show` | That a banner appeared: Chrome fires it within a millisecond, whatever the system then does |
| `activated` | The administrator clicked the notification | — this is the only in-page evidence of delivery |

| Sound status | Meaning |
| --- | --- |
| `disabled` / `unsupported` | Switched off in the studio / no `AudioContext` |
| `pending` | Being played |
| `played` | The browser rendered the pattern into its output. Whether anybody heard it depends on the computer's volume, the output device and a muted site, none of which a page can read |
| `blocked` | The output did not start within one second, or refused |

The panel's status line names the one reason the next notification would not be sent (unsupported, switched off,
denied, missing permission, last dispatch failed) and otherwise says only that the browser may send it.

### A test is a level of its own

`RecordingAlertSeverity` is now `critical | warning | test`. A test has its own colour in the history, its own rising
three-tone pattern at exactly the loudness of the two alarms, and a title whose first words are _"Zkouška výstrahy
studia · nic se nepokazilo"_.

### Two forms of a notification, and one rule for both

A stopped recording waits on the screen until it is dismissed (`requireInteraction: true`); a source lost while the
take goes on is a passing banner, so it does not sit on a screen which is being recorded. `isRecordingAlertKeptOnScreen`
decides that once, and stores the answer on the alert as `isKeptOnScreen`.

A test obeys the same rule from what the studio is doing when it fires: before a recording it takes the waiting form,
during one the passing form. That matters because the system delivers the two separately — see below.

### Stale permission, clicked notification

- `watchRecordingNotificationPermission` re-reads the permission on window `focus`, `pageshow`, a tab becoming
  visible, and on the Permissions API's own `change` event. Every announced alert re-reads it too.
- Clicking a notification calls `window.focus()`, closes the notification, marks the alert `activated`, and the
  panel scrolls to and focuses that alert's row.

### No service worker, no push

A notification here is a notification of the page, raised with the `Notification` constructor while the studio is
open. That is all the use case needs and all a desktop browser requires. Mobile browsers refuse the constructor and
want `ServiceWorkerRegistration.showNotification()`; the studio captures screens and does not run there, so that
refusal is reported as `dispatch-failed` with the browser's own message. There is no push server and no subscription,
and nothing is announced once the recording browser is closed.

## What was checked, and what it showed

Environment of every check below: macOS 27.0.1 (26A434), Google Chrome 154.0.8037.95, Playwright 1.62.1 with
Chromium 151.0.7922.34, on 2026-10-05.

### The focus hypothesis is not the cause

The suspicion was that a focused document keeps its own notification back. It does not:

- The studio contains no condition on `document.hasFocus()` or `visibilityState` on the way to the constructor, and
  a unit test fails if one is added.
- In the installed Chrome, with the studio tab focused and visible in the frontmost window, the production code
  raised the notification, Chrome fired `show`, and macOS `usernoted` logged `Delivering … to [ .alert .lockScreen
  .notificationCenter ]` — identically to the hidden-tab and other-application runs.

### `show` is not a banner — and here is what actually hid it

During those same runs a macOS Focus mode was active on the machine. For every notification the system logged:

```
[com.apple.donotdisturb:BehaviorResolution] Resolved event behavior=<DNDClientEventBehavior: …;
    interruptionSuppression: delay delivery; … resolutionReason: mode configuration type; activeModeUUID: …>
[com.apple.unc:application] addOrUpdate listItem: … canDisplayWhileCenterIsClosed: false, visibility: []
```

So the browser reported `show`, the system accepted the notification, and **no banner was presented** — it went
straight to Notification Center. The page had no way to know. This is the concrete reason the wording no longer
promises delivery, and why only a click counts as delivered.

### The two forms are two different macOS applications

Chrome's bundle declares the main application with `NSUserNotificationAlertStyle = banner` and a helper,
_Google Chrome Helper (Alerts)_ (`com.google.Chrome.framework.AlertNotificationService`), with `alert`. The system log
confirms the split: `requireInteraction: false` arrived as `com.google.Chrome`, `requireInteraction: true` as the
helper. Each has its own entry and its own switches in **System Settings → Notifications**, so one can work while the
other is off. Both entries exist on this machine. Other Chromium browsers ship an equivalent helper; that was not
checked.

### A hidden tab is slow, not stopped

In a tab the browser itself reports as hidden, a 200 ms interval ran about once a second, and a five-second timeout
fired 0.2–0.8 s late. The end-to-end test measured 5 780 ms from the click to the real `Notification` request.

### Sound after a delay

Measured silently (an oscillator into an analyser behind a zero gain) in the installed Chrome:

| Situation | Result |
| --- | --- |
| Document never clicked | `AudioContext` is `suspended`; `resume()` **never settles** |
| Output opened in the click, used 5 s later in a hidden tab | `running` throughout, samples rendered |
| New output created 5 s after the click, hidden tab | `running` — Chrome is content with any earlier click |
| Output suspended, then resumed without a new click, hidden tab | resumes, samples rendered |

So in Chrome the delay alone does not block the sound once the page has been clicked. The output is nevertheless
opened in the click and kept, because a stricter browser wants exactly that, and the unbounded wait is gone.

### A page outlives the click on sign-out

A page keeps running its timers between a form being submitted and the server answering: with a six-second answer,
a 500 ms interval of the old page ran twelve more times. A test whose deadline fell into that wait would therefore
have fired after the administrator had already signed out, which is why the sign-out form itself cancels it.

### What a test browser can and cannot show

- The headless shell the suite normally runs in reports `Notification.permission === 'denied'` whatever is granted,
  and answers a constructed notification with `error`. It is used as a genuine blocked browser, and elsewhere the
  API is replaced by a stand-in. Those tests are labelled **API-path check**.
- Playwright presents every page as focused and visible and disables background throttling. The two tests which need
  a really hidden tab launch the full Chromium with throttling left on and attach to its default context with
  `noDefaults`, an undocumented Playwright option. If a later version ignores it, those tests fail on their explicit
  "the page is hidden" check instead of passing for the wrong reason.

## Automated tests

| File | Covers |
| --- | --- |
| `lib/recording-studio/recordingStudioAlertTest.test.ts` | Countdown, single expiry, repeated clicks, cancel, dispose, late and early timers, `refresh`, the permission wait |
| `lib/recording-studio/recordingStudioAlertNotification.test.ts` | Permission states, request, dispatch, `show`, `error`, refused constructor, click, focus independence, stale permission |
| `lib/recording-studio/recordingStudioAlertSound.test.ts` | Output opened in the click, one shared output, bounded wait, rest and wake, patterns and loudness |
| `lib/recording-studio/recordingStudioAlertDelivery.test.ts` | Channel state, wording which calls only a click delivered |
| `lib/recording-studio/recordingStudioAlerts.test.ts` | Test severity and wording, the kept-on-screen rule |
| `components/recording-studio/useRecordingStudioAlerts.test.tsx` | The channel as a whole: unmount, sign-out, `pagehide`, leaving the tab, a real failure during the countdown, independent channels |
| `components/recording-studio/RecordingAlertPanel.test.tsx` | Notice, remaining time, **Zrušit test**, status wording, history rows, focus after activation |
| `tests/e2e/recording-studio.spec.ts` | See below |

End-to-end, in a browser:

| Test | Notification API | Page state |
| --- | --- | --- |
| Countdown, one alert, deadline respected, click focuses the row | stand-in (API-path check) | visible |
| Repeated clicks, **Zrušit test** | stand-in | visible |
| Test during a recording leaves the take running and complete | stand-in | visible |
| Real failure announced while a test is counting down | stand-in | visible |
| Pending test survives a change of studio view | stand-in | visible |
| Pending test is cancelled the moment the sign-out form is submitted | stand-in | visible |
| Permission asked by the click, countdown after the answer | stand-in | visible |
| Refused dispatch, failed display, revoked permission, sound off | stand-in | visible |
| Notifications really blocked by the browser | **real** (headless shell) | visible |
| Test alert from a hidden tab, exactly one request | **real** | **really hidden**, throttled |
| Lost source and refused storage write from a hidden tab | **real** | **really hidden**, throttled |
| Lost source keeps the other tracks; IndexedDB abort keeps committed media | stand-in | visible |

The storage failure is a real IndexedDB transaction abort. No disk is filled.

## Record of the test on macOS

### What was performed, and by whom

Performed on 2026-10-05 between 06:56 and 06:58 local time **by the implementing agent through automation**, not by a
person. The installed Google Chrome was started with a temporary profile and no automation switches, opened the real
studio page from the local server with nothing in it replaced, and the real **Otestovat výstrahu** button was clicked.
Notification permission for the site was granted through the browser's own permission store rather than by a person
answering the prompt.

Settings found at the time: system output **muted, volume 0**; a macOS **Focus mode active**; both Chrome entries
present in the system's notification preferences. The Focus mode's name and schedule are not readable without access
the agent does not have.

| Situation before the deadline | Page reported by Chrome | Studio's own row | macOS log |
| --- | --- | --- | --- |
| Studio tab focused, Chrome frontmost | focused, visible | notification `displayed`, sound `played` | Delivered as _Google Chrome Helper (Alerts)_; Focus: `delay delivery`; not presented |
| Another tab active | not focused, hidden | notification `displayed`, sound `played` | same |
| Another application frontmost (Visual Studio Code) | not focused, hidden | notification `displayed`, sound `played` | same |
| Site permission revoked while the studio stayed open | — | status line changed to "zakázaná" by itself, no reload or click | — |
| Notifications blocked for the site | focused, visible | notification `permission-denied`, sound `played` | no request reached the system |

All three alerts appeared five to six seconds after the click.

The system's side of that table was read from the unified log for the seconds of each run, which needs no access to
the screen and can be repeated beside any of the steps below:

```bash
/usr/bin/log show --start "2026-10-05 06:56:15" --end "2026-10-05 06:57:30" --style compact \
    --predicate '(process == "usernoted" OR process == "NotificationCenter") AND eventMessage CONTAINS[c] "chrome"'
```

`Delivering <NotificationRecord app:"…" … req:"…promptbook-recording-studio-alert-…">` names the application the
system received the notification from, the `donotdisturb:BehaviorResolution` line says what a Focus mode decided
about it, and `canDisplayWhileCenterIsClosed` says whether it was allowed onto the screen. In `zsh` the full path
matters, because `log` alone is a shell builtin.

### What this does and does not establish

Established: the production path reaches the operating system from a focused tab, a hidden tab and behind another
application; a blocked site sends nothing and still sounds and records the alert; a revoked permission is noticed
without a reload.

**Not verified — no person observed any of it:**

- **No banner was seen.** None could have been: the active Focus mode kept all three off the screen.
- **No sound was heard.** None could have been: the output was muted. `played` is the browser's report only.
- **Another macOS Space** was not tested. Switching Spaces needs a person or accessibility control.
- **Clicking a delivered notification** was not tested on the system. The click path is covered against a stand-in.
- **With Focus off**, and **while a screen is being shared**, nothing was tested. macOS has a separate setting for
  notifications while mirroring or sharing the display; whether a Chrome screen capture triggers it is unknown.
- **A real camera or screen source failing** in the installed Chrome was not tested; it needs capture permissions a
  person grants. The controlled source and storage failures ran in Chromium with synthetic media.
- **Edge, Safari and Firefox** were not tested.

The run left three test notifications in the machine's Notification Center, because the Focus mode filed them there
and nothing closed them. They are titled _"Zkouška výstrahy studia · nic se nepokazilo"_ and can be cleared.

### Steps for a person

Use the browser and profile you record with. Note the result of each step.

1. Note the versions (**About This Mac**, `chrome://version`), whether a Focus mode is on, the output volume, and in
   **System Settings → Notifications** the state of both _Google Chrome_ and _Google Chrome Helper (Alerts)_ and of
   the option for notifications when mirroring or sharing the display.
2. Open `/admin/recording-studio`. If the panel says the browser has no permission, click **Otestovat výstrahu**,
   allow the prompt, and check that the countdown starts only after you answered.
3. **Same tab.** Click **Otestovat výstrahu** and stay. Expected: the countdown, then the sound, a notification which
   stays on the screen, and a cyan row. This is the focus hypothesis, checked by eye.
4. **Another application.** Click, switch to another application within five seconds. Expected: sound and
   notification over that application.
5. **Another Space.** Click, switch to another Space within five seconds. Expected: the same on that Space.
6. **Activation.** Click the notification. Expected: Chrome comes to the front on the studio tab, the row is focused
   and reads _"doručeno, otevřeli jste je kliknutím"_.
7. **Cancel.** Click, then **Zrušit test**. Expected: nothing arrives, also after ten seconds.
8. **Blocked.** Block notifications for the site from the address bar and return. Expected: the status line says
   _"zakázaná"_ without a reload; a test still sounds and the row says the notification was not sent. Allow again.
9. **During a recording with a shared screen.** Start a recording which includes a screen source, then test.
   Expected: a passing banner, delivered as _Google Chrome_ rather than the helper; the take keeps running and is
   saved as **Uloženo**. If no banner appears, check the mirroring-or-sharing option from step 1.
10. **Source failure.** Record a camera and a shared window, then stop sharing from the browser's own bar. Expected:
    a passing banner _"… selhal · záznam pokračuje"_, the warning sound, the camera still recording.
11. **Last source.** Stop the remaining source. Expected: a notification which stays, _"… záznam se zastavil"_, the
    alarm sound, the take saved as **Přerušený záznam** with its committed media downloadable.

A storage failure cannot be provoked by hand without filling a disk; do not do that. It is covered by the real
IndexedDB abort in the end-to-end tests.
