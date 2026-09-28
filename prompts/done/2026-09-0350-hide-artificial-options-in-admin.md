[x] (2 attempts) by Developer on OpenAI Codex `gpt-5.6-terra` thinking `max` (ChatGPT account) - Implementation ~$0.6263 23 minutes; Testing 16 minutes; Fixing ~$0.8356 2 hours; Testing 17 minutes

[✨🍲] In the admin, there should be toggle, which hides artificial options.

-There are multiple things like artificial chat comments, artificial number of viewers, and artificial likes, etc...
- All of these things can be set and managed through the admin interface.
- But when I am doing the live stream, and I am sharing screen, it isn't looking very good, that I have these artificial options there
- The toggle should allow me to hide / show all of these artificial options.
- This toggle should be easily accessible but not obvious for everyone.
- Whether the toggle is on or off, it should remember in GET search parameters - `?artopts=on` / `?artopts=off`
- By default, the toggle should be off, meaning artificial options are not shown.
- You are not changing anything in the database or data structure, just changing what the admin renders.
- You are working with page `/admin`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)