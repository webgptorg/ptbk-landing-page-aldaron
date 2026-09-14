[x] by OpenAI Codex `gpt-5.6-terra` thinking `max` (ChatGPT account) - Implementation ~$0.4005 12 minutes; Testing 6 minutes

[✨🦒] Allow top duplicate workshop in admin

- You are working with `/admin/workshops`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.

---

[x] by OpenAI Codex `gpt-5.6-luna` thinking `max` (ChatGPT account) - Implementation ~$0.6039 14 minutes; Testing 9 minutes

[✨🦒] When creating or duplicating events, the duplicated event should be published by default, and only not published when duplicating a non-published event.

- Also, when duplicating a workshop, duplicate the attached polls.

---

[x] by OpenAI Codex `gpt-5.6-terra` thinking `max` (ChatGPT account) - Implementation $2.23 20 minutes; Testing 8 minutes

[✨🦒] When duplicating a workshop, the attached polls shouldn't be duplicated

- Only the connection to the already existing poll should be preserved in the duplicate.

---

[x] (2 attempts) by OpenAI Codex `gpt-5.6-terra` thinking `max` (ChatGPT account) - Implementation ~$0.5243 13 minutes; Testing 6 minutes; Fixing ~$0.4098 16 minutes; Testing 2 minutes

[✨🦒] Alongside the new workshop and duplicate workshop, add a button to delete the workshop.

- When deleting a workshop, do not remove the attached polls
- Deletion of the workshop should be a "soft delete", they should be still in the database, but flagged as deleted.


