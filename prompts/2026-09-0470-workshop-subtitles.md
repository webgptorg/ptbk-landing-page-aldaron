[ ]

[✨🐫] Add the video subtitles functionality

- Each online workshop can have video subtitles.
- Allow to auto-generate subtitles for the workshop videos.
    - If the video is YouTube, grab the subtitles directly from YouTube if available.
- For now the subtitles are only in admin but later they might be available for participants as well.
- You are creating page `/admin/workshops?tab=subtitles`
- Be aware that subtitles might be in both Czech and English.
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)
