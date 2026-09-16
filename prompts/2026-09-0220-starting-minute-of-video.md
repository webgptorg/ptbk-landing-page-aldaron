[x] by OpenAI Codex `gpt-5.6-terra` thinking `max` (ChatGPT account) - Implementation ~$0.00 18 minutes; Testing 8 minutes

[✨🦵] Allow setting the starting time of the workshop video.

- Before the workshop, there is a countdown, and nothing changes there.
- During the workshop, there is a live video, and nothing changes there.
- After the workshop, for the paid members, there is a video, and this video should have been able to have some specific offset set in the administration.
- The video should start from there. Before this time, it's often just an empty room with "started streaming"
- we don't want to reupload the same video twice to cut off the beginning.
- You are working with page `/cs/online-workshop/participant?workshop=`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

---

[x] by Developer on Claude Code `claude-opus-5` thinking `max` - Implementation $4.87 4 hours; Testing 10 minutes
[✨🦵] The "Začít záznam od (sekundy)" field in should have hour:minute:second picker.

- Do not change anything in the data, just change the picker.

