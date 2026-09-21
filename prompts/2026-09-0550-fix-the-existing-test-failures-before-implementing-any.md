[x] by Developer on OpenAI Codex `gpt-6-astra` thinking `max` (ChatGPT account) - Implementation ~$0.2331 12 minutes; Testing 7 minutes

[✨🔴] Fix the existing test failures before implementing any queued coding tasks.

The verification command `npm run test-for-ptbk-coder` failed before coding started. Fix the underlying failure without weakening or removing the tests, and leave the project ready for the remaining coding prompts.

## Verification output

```
[..., test output truncated to the last 12000 characters...]
te sources, restores them, trims every track and exports playable editor material (7.2s)
  ✘  71 tests/e2e/recording-studio.spec.ts:81:5 › records separate sources, restores them, trims every track and exports playable editor material (retry #1) (7.2s)
  ✓  72 tests/e2e/recording-studio.spec.ts:162:5 › stops the whole take on disconnect and prevents a second tab from changing it (4.7s)
  ✓  73 tests/e2e/recording-studio.spec.ts:182:5 › recovers persisted chunks after an interrupted page and waits for stop before admin navigation (11.7s)
  ✓  74 tests/e2e/room-theme.spec.ts:96:5 › shares a saved room appearance, follows the device, and preserves the waiting-room form (14.4s)
  ✓  75 tests/e2e/room-theme.spec.ts:141:5 › themes connected rooms, materials, and portalled dialogs on desktop and mobile without losing drafts (13.1s)
  ✓  76 tests/e2e/workshop-agents.spec.ts:34:9 › defines a Book agent in the workshop administration (2.9s)
  ✓  77 tests/e2e/workshop-agents.spec.ts:34:9 › defines a Book agent in the community administration (6.5s)
  ✓  78 tests/e2e/workshop-repository-range.spec.ts:31:5 › edits independent commit bounds in workshop settings (2.9s)
  ✓  79 tests/e2e/workshop-repository-range.spec.ts:67:5 › previews the deployed app while browsing the highlighted workshop range (3.3s)
  ✓  80 tests/e2e/workshop-subtitles.spec.ts:63:5 › imports, autosaves, reloads and downloads private subtitles through the shared admin editor (2.5s)
  ✓  81 tests/e2e/workshop-subtitles.spec.ts:107:5 › decodes a long recording into bounded audio chunks and preserves multilingual timestamps (2.8s)
  ✓  82 tests/e2e/workshop-vercel-deployment.spec.ts:31:9 › deploys a workshop project and saves its ready URL through the existing settings form (6.3s)
  ✓  83 tests/e2e/workshop-vercel-deployment.spec.ts:31:9 › shows Vercel failure details and guidance, then saves the URL after retrying (11.6s)
  ✓  84 tests/e2e/workshop-wrap-up-pdf.spec.ts:34:5 › downloads the branded recap in the browser with local fonts, project preview, Git graph and short-link QR (2.8s)
Saved 79 E2E video(s) to tests/e2e/videos/.
Removed the E2E video(s) of 1 outdated run(s) from tests/e2e/videos/.


  1) tests/e2e/recording-studio.spec.ts:81:5 › records separate sources, restores them, trims every track and exports playable editor material 

    Error: expect(received).toHaveLength(expected)

    Expected length: 5
    Received length: 2
    Received array:  ["originals/01-camera.webm", "originals/02-camera.webm"]

       97 |     await page.getByRole('button', { name: 'Originály ZIP', exact: true }).click();
       98 |     const originals = await readArchive((await (await originalDownload).path())!);
    >  99 |     expect(Array.from(originals.keys()).filter((name) => name.startsWith('originals/'))).toHaveLength(5);
          |                                                                                          ^
      100 |     // Exercise the streaming disk path with a real writable file, without automating an OS save dialog.
      101 |     await page.evaluate(() => Object.defineProperty(window, 'showSaveFilePicker', {
      102 |         configurable: true, value: async () => (await navigator.storage.getDirectory()).getFileHandle('test-studio-export.zip', { create: true }),
        at /Users/hejny/work/aldaron/tests/e2e/recording-studio.spec.ts:99:90

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material/video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material/error-context.md

    attachment #4: trace (application/zip) ─────────────────────────────────────────────────────────
    tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material/trace.zip
    Usage:

        npx playwright show-trace tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

    Retry #1 ───────────────────────────────────────────────────────────────────────────────────────

    Error: expect(received).toHaveLength(expected)

    Expected length: 5
    Received length: 2
    Received array:  ["originals/01-camera.webm", "originals/02-camera.webm"]

       97 |     await page.getByRole('button', { name: 'Originály ZIP', exact: true }).click();
       98 |     const originals = await readArchive((await (await originalDownload).path())!);
    >  99 |     expect(Array.from(originals.keys()).filter((name) => name.startsWith('originals/'))).toHaveLength(5);
          |                                                                                          ^
      100 |     // Exercise the streaming disk path with a real writable file, without automating an OS save dialog.
      101 |     await page.evaluate(() => Object.defineProperty(window, 'showSaveFilePicker', {
      102 |         configurable: true, value: async () => (await navigator.storage.getDirectory()).getFileHandle('test-studio-export.zip', { create: true }),
        at /Users/hejny/work/aldaron/tests/e2e/recording-studio.spec.ts:99:90

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material-retry1/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material-retry1/video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material-retry1/error-context.md

    attachment #4: trace (application/zip) ─────────────────────────────────────────────────────────
    tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material-retry1/trace.zip
    Usage:

        npx playwright show-trace tests/e2e/.artifacts/recording-studio-records-s-695a6-ts-playable-editor-material-retry1/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

  2) tests/e2e/participant-promotion.spec.ts:50:9 › refreshes an author's pending total and submissions after trust on /cs/online-workshop/participant 

    Error: page.goto: net::ERR_NETWORK_IO_SUSPENDED at http://127.0.0.1:4009/cs/online-workshop/participant
    Call log:
      - navigating to "http://127.0.0.1:4009/cs/online-workshop/participant", waiting until "load"


      82 |         });
      83 |
    > 84 |         const response = await page.goto(pathname);
         |                                     ^
      85 |         test.skip(response?.status() === 404, 'The configured database has no published room for this route.');
      86 |         await expect(page.getByText(`Čeká na schválení: ${isCommunity ? 3 : 2}`, { exact: true })).toBeVisible();
      87 |         const authorProject = page.getByRole('article').filter({ has: page.getByRole('heading', { name: PROJECT_TITLE }) });
        at /Users/hejny/work/aldaron/tests/e2e/participant-promotion.spec.ts:84:37

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    tests/e2e/.artifacts/participant-promotion-refr-c986f-online-workshop-participant/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    tests/e2e/.artifacts/participant-promotion-refr-c986f-online-workshop-participant/video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: tests/e2e/.artifacts/participant-promotion-refr-c986f-online-workshop-participant/error-context.md

    attachment #4: trace (application/zip) ─────────────────────────────────────────────────────────
    tests/e2e/.artifacts/participant-promotion-refr-c986f-online-workshop-participant/trace.zip
    Usage:

        npx playwright show-trace tests/e2e/.artifacts/participant-promotion-refr-c986f-online-workshop-participant/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

  3) tests/e2e/participant-promotion.spec.ts:50:9 › refreshes an author's pending total and submissions after trust on /cs/komunita 

    Test timeout of 180000ms exceeded.

    Error: expect(locator).toBeVisible() failed

    Locator: getByText('Čeká na schválení: 3', { exact: true })
    Expected: visible
    Timeout: 30000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 30000ms
      - waiting for getByText('Čeká na schválení: 3', { exact: true })


      84 |         const response = await page.goto(pathname);
      85 |         test.skip(response?.status() === 404, 'The configured database has no published room for this route.');
    > 86 |         await expect(page.getByText(`Čeká na schválení: ${isCommunity ? 3 : 2}`, { exact: true })).toBeVisible();
         |                                                                                                    ^
      87 |         const authorProject = page.getByRole('article').filter({ has: page.getByRole('heading', { name: PROJECT_TITLE }) });
      88 |         if (isCommunity) await expect(authorProject.getByText('Čeká na schválení', { exact: true })).toBeVisible();
      89 |
        at /Users/hejny/work/aldaron/tests/e2e/participant-promotion.spec.ts:86:100

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    tests/e2e/.artifacts/participant-promotion-refr-a049d--after-trust-on-cs-komunita/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    tests/e2e/.artifacts/participant-promotion-refr-a049d--after-trust-on-cs-komunita/video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: tests/e2e/.artifacts/participant-promotion-refr-a049d--after-trust-on-cs-komunita/error-context.md

    attachment #4: trace (application/zip) ─────────────────────────────────────────────────────────
    tests/e2e/.artifacts/participant-promotion-refr-a049d--after-trust-on-cs-komunita/trace.zip
    Usage:

        npx playwright show-trace tests/e2e/.artifacts/participant-promotion-refr-a049d--after-trust-on-cs-komunita/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

  1 failed
    tests/e2e/recording-studio.spec.ts:81:5 › records separate sources, restores them, trims every track and exports playable editor material 
  2 flaky
    tests/e2e/participant-promotion.spec.ts:50:9 › refreshes an author's pending total and submissions after trust on /cs/online-workshop/participant 
    tests/e2e/participant-promotion.spec.ts:50:9 › refreshes an author's pending total and submissions after trust on /cs/komunita 
  2 skipped
  76 passed (21.0m)
[1]-  Exit 1                  bash "$1"
```

-   Keep in mind the DRY _(don't repeat yourself)_ principle.
-   Do a proper analysis of the current functionality before you start implementing.
-   Add the changes into the [changelog](CHANGELOG.md)
-   Update the [README](README.md) if needed.
-   Update the [AGENTS.md](AGENTS.md) for the next job to be done if it makes sense.

