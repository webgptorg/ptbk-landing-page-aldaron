[ ]

[✨🦇] bar


This is how I fix it:

```bash
for f in Zaznam-28-9-2026-12-52-35-316ef072-*.webm; do ffmpeg -i "$f" -map 0 -c copy "${f%.webm}-fixed.webm"; done
```

- @@@@@@@@
- You are working with page `/cs/@@@`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)