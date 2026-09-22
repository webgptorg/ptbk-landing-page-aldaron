[x] by Developer on OpenAI Codex `gpt-5.6-terra` thinking `max` (ChatGPT account) - Implementation ~$0.2143 7 minutes; Testing 16 minutes

[✨🍎] Multiplier factor to the hosts of the podcast

- Hosts are ordered weighted-random by their number of appearances in the podcast episodes
- Add `factor` to each person, default is 1
- Katka should have factor 1.7
- Tomáš Mikolov shoould have factor 5
- Pavol should have factor 0.8
- Factor will multiply the number of episodes before the weighted-random  algorithm is applied. 
- After the change, Katka and Tomáš will be more likely on top of the hosts
- You are working with page `/ai-ta-krajta`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)