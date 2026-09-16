[x] by qwen code manuallly

[✨📛] Allow to mark materials as only for paid members.

- Mark the materials with a badge or label indicating they are for paid members only.
- Also, the paid members should have unlocked the video after the workshop is over.
    - For these paid members keep the wrap up screen with feedback but also put some button to watch the video again.
- For all non paid members, there should be some indication that here is the place where the paid materials are, but they are not showing with button to purchase the membership and unlock the paid materials.
- You are working with page `/cs/online-workshop/participant` and `/cs/komunita`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

---

[x] by Claude Code `claude-opus-5` thinking `max` - Implementation $7.71 17 minutes; Testing 6 minutes

[✨📛] Materials for paid members only - show preview

- Show a title of the material which is for paid members only for non-paid members to see as a preview.
- This should serve as a teaser for non-paid members, encouraging them to purchase the membership to access the full content.
- You are working with page `/cs/online-workshop/participant` and `/cs/komunita`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

---

[x] by Claude Code `claude-opus-5` thinking `max` - Implementation $21.66 2 hours; Testing 6 minutes

[✨📛] Video for paid members only

- When the member is not a paid member, there should be an option to set a preview of the video, showing a teaser or snippet to encourage them to purchase the membership to access the full video.
- There should be a clear indication that the full video is only available to paid members, along with a call-to-action to purchase the membership.
- During the webinar (between start and end), non-paid members see the full video same as payed members
- After the webinar is over, non-paid members should only see the preview (if there is this video set in administration), while paid members can access the full video (and doesnt see the preview).
- If the preview is not set in the administration, non-paid members should see a message indicating that the full video is only available to paid members (similar to the teaser message for payed materials).
- You are working with page `/cs/online-workshop/participant`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

---

[-]

[✨📛] Video for paid members only should have graphically more pleasing lock

![alt text](prompts/screenshots/2026-09-0000-payed-members-materials.png)
