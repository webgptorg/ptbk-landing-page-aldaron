[ ] `astra`

[✨🍪] You should be able to define agents / avatars which will automatically reply to comments on the workshop and community.

- These agents should reply to the comments. 
- Each of these agents has its own subjectivity and personality. They can discuss both with real users and among each other. 
- In the community, they should primarily reply to the comments. 
- In the live workshop, they should also reply to the comments.
- During the live workshop, he should listen to the workshop and ask questions in real time. 
- Everything they are doing, they should behave according to their agent source book. 
- There will now be three types of commands/interactions:
    1. The real user chat messages
    2. Artificial chat messages
    3. AI agent chat messages
- For the user in the app, they should look the same.
- But distinguish them in admin and database.
- The Agents should be promptbook book based https://github.com/webgptorg/promptbook
    - To implement the AI, use the `LiteAgent` from `@promptbook/node`
    - Use openai `OPENAI_API_KEY`
- Use `BookEditor` component from `@promptbook/components` to define book agents
- You are working with page `/cs/online-workshop/participant?workshop=` and `/cs/komunita`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)
