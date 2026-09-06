[x] by Claude Code `claude-opus-5` thinking `max` - Implementation 7.43 26 minutes; Testing 7 minutes

[✨🧞] Show number of registered participants of each event

- There are 2 different numbers:
    1. Registered participants through the landing page
    2. Participant who entered workshop through the participant app
- The `/admin/workshops` displays only the (2) but it should show both (1) and (2)
- Keep the gathering and recording of contacts same `/admin/contacts`, just show the number of registered participants on `/admin/workshops`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

![workshop landing page (show only as contact)](prompts/screenshots/2026-09-0020-show-number-of-registered-1.png)
![participant app (from which the number of participants is shown in admin)](prompts/screenshots/2026-09-0020-show-number-of-registered-2.png)
![alt text](prompts/screenshots/2026-09-0020-show-number-of-registered.png)

---

[ ]

[✨🧞] Allow to show and export registered participants of each event in admin

- There are 2 different numbers:
    1. Registered participants through the landing page
    2. Participant who entered workshop through the participant app (which is currently only contacts exportable from the event admin page)
- The `/admin/workshops` allows to list and export only the (2) but it should show both (1) and (2)
- Keep the gathering and recording of contacts same `/admin/contacts`, just show the number of registered participants on `/admin/workshops`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
    - The contact exports and listings should reuse same code, also reuse the logic with `/admin/contacts`
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)
