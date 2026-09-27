[x] by Developer on OpenAI Codex `gpt-6-astra` thinking `max` (ChatGPT account) - Implementation ~$0.4569 an hour; Testing 42 minutes

[✨💽] Report recording storage honestly and support long multi-source sessions beyond 10 GB

- Improve the existing workshop-admin recording studio, not a separate recorder. The owner reports this on **macOS**: roughly 70 GB free in the operating system, but the studio continuously reports roughly 10 GB available, even during a long recording. This is a reported observation, not a reproduced test or proof of a 10 GB recording limit. Record the actual macOS and browser versions when investigating.
- The intended workload is approximately ten hours of several simultaneous video/audio sources and more than 10 GB of recorded data. Do not impose an arbitrary 10 GB ceiling or promise that all free disk space is available to a web page.
- Investigate the current storage backend, estimator, fallbacks, units and update schedule first. Find the implementation originating from `prompts/2026-09-0440-admin-recording-studio.md`, or its archived successor, and reuse its storage services.
    - Trace the displayed number to its origin: a hard-coded fallback, stale state, IndexedDB/OPFS quota estimate, selected-directory capacity, or another value. Do not assume a macOS-specific bug just because that is where it was reported.
    - Investigate Chromium's documented proposal to report an artificial quota of usage plus 10 GiB. That would make quota minus usage remain constant while writes succeed. Check the shipped behavior of the actual browser/version; the historical proposal alone is not proof that this user's browser implements it.
    - Distinguish physical disk free space, browser-origin quota estimates, bytes actually written by this studio, queued/uncommitted bytes, and export/temporary-space requirements. An API estimate is not a guarantee that a write will succeed.
- Replace the misleading single free-disk figure with meaningful, compact information.
    - Show actual recorded bytes, the active storage destination, and the browser-provided estimate with an accurate label such as `Odhad prostoru pro web`, including its limitations.
    - Refresh measured usage during recording and after finalization, deletion, recovery and destination changes. Keep GB/GiB labels and conversions consistent.
    - Do not relabel an unchanging/artificial API estimate as exact remaining disk space, and do not manufacture a decreasing disk figure by subtracting recording bytes from an already usage-adjusted quota.
    - Where true remaining capacity is unavailable, show `Skutečné volné místo nelze v tomto prohlížeči zjistit` and useful measured recording-size/bitrate data instead of a false precise countdown.
    - Derive any remaining-time estimate from the aggregate bitrate of ALL recorded sources and a defensible capacity estimate, with a safety margin. Show an uncertain/unknown state where the inputs do not support an estimate. Recording start-up, pause and variable bitrate must not produce infinity, NaN or misleading precision.
- Maximize supported recording capacity through supported APIs.
    - Where appropriate, offer persistent browser storage with `navigator.storage.persist()` and display its real granted/denied/unsupported result. Explain that persistence addresses eviction; it is not a request for an arbitrary quota and does not reveal physical free space.
    - Evaluate the existing backend's ability to stream chunks to a user-selected directory through supported File System Access APIs, without first retaining the entire session in RAM or browser-origin storage. Reuse an existing implementation if present; provide this path where feasible and feature-detect it.
    - Distinguish user-selected filesystem access from OPFS, which still belongs to the origin's storage system. Do not claim that requesting an OPFS directory bypasses the origin quota.
    - Do not promise a universal `Increase to 70 GB` button. Document tested browser-specific options and honest fallbacks rather than requiring extensions, browser flags, a native companion or a new cloud service.
    - Do not allocate giant dummy files to discover capacity. Support files/sessions larger than 4 GB without 32-bit counters or an in-memory ZIP bottleneck.
- Prioritize recovery and source synchronization when storage runs out.
    - Persist chunks incrementally with bounded buffering/backpressure; finalizing or exporting must not require an undisclosed second full-session copy.
    - Handle quota errors, real disk-full errors, write failures and revoked filesystem permission. Coordinate stopping/pausing all sources, retain already committed data, identify incomplete ranges, and offer recovery/export. Never silently drop one source while calling the session complete.
    - Do not delete existing recordings or request unrelated permissions automatically to obtain more space.
- Acceptance criteria:
    - Automated cases cover constant usage-plus-10-GiB estimates, changing estimates, missing APIs, denied persistence, stale estimates, low actual capacity, write failure and counter overflow boundaries.
    - Verify measured-byte updates and aggregate bitrate estimates with several sources and variable bitrate. A fixed estimate is explained rather than displayed as a guaranteed physical-disk measurement.
    - Perform a genuine macOS multi-source session crossing 10 GB and a ten-hour soak test on an adequately provisioned test machine; report browser/version, backend, resource use, recovery and actual playable output. Simulated time is additional coverage, not evidence of a real soak test.
    - Also test supported browsers on Windows and a representative other supported platform. Mark unavailable platform tests as not run; do not claim macOS behavior is universal.
    - Include the investigated root cause and a brief capability/limitation note with reproducible evidence. Where the browser withholds capacity information, the improved UI and failure handling still ship.
- Primary research starting points, to recheck against supported browser versions:
    - [Chromium predictable reported quota discussion](https://groups.google.com/a/chromium.org/g/blink-dev/c/7q0YGQNVkjs/m/BJH9kfmIEgAJ).
    - [Storage Standard](https://storage.spec.whatwg.org/) and [WebKit storage policy](https://webkit.org/blog/14403/updates-to-storage-policy/).
    - [Chrome File System Access API](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access).
- Coordinate the storage and failure model with [the synchronized editor](2026-09-0850-studio-synchronized-editor.md) and [recording controls](2026-09-0860-studio-monitoring-pause-and-append.md); do not create separate session clocks or incompatible recording formats.
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do an analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](../changelog/_current-preversion.md).

