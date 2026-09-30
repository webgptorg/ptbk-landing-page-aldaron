[x] (2 attempts) by Developer on Claude Code `claude-opus-5` thinking `max` - Implementation $33.64 8 hours; Testing 33 minutes; Fixing $4.37 12 minutes; Testing 33 minutes

[✨🦇] Recording studio often results in videos with broken index.

This is how I fix it:

```bash
for f in Zaznam-28-9-2026-12-52-35-316ef072-*.webm; do ffmpeg -i "$f" -map 0 -c copy "${f%.webm}-fixed.webm"; done
```

- The videos are working, and they are recorded, but the index is broken.
- The broken index can be fixed using `ffmpeg` as shown above.
- But in the first place, try to prevent the index from breaking during the recording.
- Consider adding automated checks to detect broken indexes immediately after recording.
- There is a system of alerts. Use this alert when there is some failure in the indexing during the recording.
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

