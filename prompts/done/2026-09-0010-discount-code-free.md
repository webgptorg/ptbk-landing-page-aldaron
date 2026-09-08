[x] by Claude Code `claude-opus-5` thinking `max` - Implementation 0.59 5 hours; Testing 6 minutes

[✨🥝] When there is a discount code with 100% of discount, which is valid forever (not for a limited time), do not even ask for a card.

- So it can be effectively handled as a voucher.
- When there is a limited time of this code ask for a card because after the free period the card would be purchased.
- You are working with page `/cs/komunita` membership modal
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

![alt text](prompts/screenshots/2026-09-0010-discount-code-free.png)
![alt text](prompts/screenshots/2026-09-0010-discount-code-free-1.png)

