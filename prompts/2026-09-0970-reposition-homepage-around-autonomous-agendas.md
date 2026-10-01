[x] (2 attempts) by Developer on Claude Code `claude-opus-5` thinking `max` - Implementation 0.27 an hour; Testing 2 hours; Fixing 0.32 an hour; Testing an hour

[✨⚙️] Reposition the main Promptbook homepage around autonomous agendas

- Replace the **main Promptbook homepage proposition** with the product model described below. This is a conceptual repositioning, not a cosmetic copy refresh.
- Prerequisite/context: the previous PRD preserves today's Czech company-data landing page at `/cs/pro-firmy`. Do not delete that proposition while redesigning the main homepage.
- The central mental model must change from **"AI agent / virtual employee that answers questions over documents"** to **"Promptbook turns powerful AI agents into long-running agendas/responsibilities that operate in the background."**
- Core idea to communicate:
    - Modern coding agents/harnesses can already perform remarkably complex one-shot tasks.
    - A company or project does not primarily need more impressive one-shot prompts. It needs important responsibilities to be handled reliably over time.
    - Promptbook packages those responsibilities as an **agenda**: a bounded area of responsibility with its own context, goals, recurring and one-off tasks, agents, rules and tools.
    - Multiple agents can work inside one agenda. The agenda is the durable unit; an individual agent or prompt is an implementation detail.
    - The agenda should be able to keep running in the background instead of requiring a human to repeatedly open a chat, restate context and ask for the next action.
    - Human interaction still matters: people can inspect, correct, approve, steer and change the agenda. The promise is not "humans disappear"; it is that routine continuation does not require continuous prompting.
- A useful framing is: **companies are made of agendas / responsibilities, not prompts**. A healthy company resembles a well-running machine because its recurring responsibilities keep being handled. Promptbook should make more of those responsibilities executable by AI.
- Avoid presenting "agenda" as merely a synonym for a scheduled task. An agenda can contain many goals and many tasks with different lifecycles. For example, accounting is an agenda; VAT filing, deadline monitoring and document processing are tasks/goals within it.
- Examples are important for comprehension, but the homepage must not make Promptbook look like a single-purpose accounting, inbox or website product. Use examples to reveal the general principle, then return to the abstraction.
- Strong example to feature: **a website/application that maintains itself**.
    - One-shot website/app generators can create an impressive initial result, but a real website or application needs ongoing maintenance and evolution.
    - Promptbook can use strong coding harnesses to turn "maintain and evolve this application" into an ongoing agenda: understand the repository, work through changes, maintain quality, test, fix, update and continue over time.
    - The user should perceive the maintained product/responsibility, not be forced to operate the underlying coding harness manually.
- Other illustrative agendas can include customer communication / keeping an inbox handled, accounting/administrative responsibilities, content or website operations, and company-specific operational responsibilities. Keep examples credible and avoid claiming unsupported fully autonomous/legal/accounting capabilities as already guaranteed.
- Product differentiation to communicate without turning the hero into a technical feature list:
    - **Professional/project context:** designed for real company/project responsibilities, not only personal background automations.
    - **Vendor independence:** the durable agenda is not conceptually tied to one model vendor. Promptbook can orchestrate different capable models/coding harnesses (for example OpenAI Codex, Claude Code and OpenCode) as implementation choices. Verify the exact supported integrations in the repository/product before making named compatibility claims.
    - **Coding harnesses as leverage:** Promptbook deliberately builds on very strong coding agents/harnesses. Code can exist under the hood when it is the best way to execute an agenda, without exposing that complexity as the user's primary interface.
    - **Git/repository as durable workspace:** where appropriate, explain that an agenda can live in a folder/Git repository containing durable context, agent definitions, instructions/PRDs/tasks and history. Do not require a nontechnical visitor to understand Git before they understand the product.
- Messaging hierarchy:
    1. First make the visitor understand the outcome: **a responsibility can keep being handled in the background**.
    2. Then introduce the word **agenda** and explain it as a durable area of responsibility.
    3. Show how an agenda contains context + goals/tasks + agents/tools and persists over time.
    4. Show concrete examples, with self-maintaining software/web as the strongest/most native example.
    5. Only after the concept is clear explain the technical leverage: strong coding harnesses, repositories, multiple models/vendors.
- The page must clearly contrast:
    - **one-shot AI:** "do this task now" / impressive but ends after the task,
    - **agenda:** "take responsibility for this area over time" / continues, observes, acts and escalates when needed.
- Do not frame ChatGPT, Codex, Claude Code, OpenCode or other strong agents as bad or obsolete. The positioning is explicitly that these systems are excellent and Promptbook **builds on their strength** to make them persistent and operational.
- Avoid generic AI-marketing language such as "revolutionize your business", "AI employee for everything", or unsupported claims of total autonomy.
- Avoid over-indexing on the term "agent". A visitor should leave remembering **their agenda/responsibility**, not Promptbook's internal agent taxonomy.
- Avoid automatically adding supporting copy, subheadlines or explanatory filler under every heading. If text does not add new information, omit it. The heading and UI/visual itself should carry the idea whenever possible.
- Design direction:
    - Reuse the existing Promptbook visual language where it helps, but redesign sections whose current structure is coupled to the old company-document proposition.
    - Prefer a visual explanation of the model over walls of prose.
    - Consider a simple diagram/interactive composition such as `Agenda → context + tasks/goals + agents/tools → continuous background work → outcomes/escalations`, but implement the clearest solution consistent with the current design system.
    - Make "one-shot → ongoing agenda" visually obvious above the fold or immediately after the hero.
    - The page must remain polished and understandable on mobile, not only desktop.
- Information architecture:
    - `/cs` becomes the new Czech agenda-based main homepage.
    - `/en` should express the same product positioning in natural English, not a literal awkward translation. Use "agenda", "area of responsibility", "ongoing responsibility" or another clear formulation as needed, while preserving the product concept.
    - Root language redirect behavior in `app/page.tsx` must continue to work.
    - Update homepage metadata, descriptions, keywords, Open Graph/social preview copy/artwork and structured SEO data so they no longer describe the main product only as company-document Q&A.
    - Keep the preserved Czech company-focused/data-focused proposition accessible at `/cs/pro-firmy`.
- Conversion:
    - Keep a clear primary CTA, but make its surrounding copy fit the new proposition.
    - Inspect the current strategic-call/qualification flow and reuse it if it still makes sense. Do not silently break lead capture.
    - Do not manufacture scarcity, metrics, testimonials, customer claims, security claims or capabilities that are not supported by the current product/content.
- Existing content:
    - Audit `businesses/homepage/homepageContent.tsx` rather than mechanically rewriting strings in place. The current section model (`painPoints`, `solution`, `enemy`, etc.) was built for the previous proposition and may need a cleaner new composition.
    - Preserve genuinely reusable pieces such as header/footer, team, lead flow and design primitives where appropriate.
    - The old company-data content should belong to the preserved `/pro-firmy` page rather than being mixed into the new root merely because components already exist.
- Acceptance criteria:
    - A first-time nontechnical visitor can explain, after scanning the top of the page, that Promptbook lets a company/project hand an ongoing **responsibility/agenda** to AI instead of repeatedly prompting an agent for individual tasks.
    - The page makes the distinction between a one-shot task and a long-running agenda explicit.
    - The page explains that one agenda can contain multiple goals/tasks, context and multiple agents/tools.
    - At least one concrete flow demonstrates ongoing maintenance of a website/application rather than only initial generation.
    - Examples demonstrate breadth without redefining Promptbook as accounting software, an inbox assistant or a website builder.
    - Vendor/model independence and the use of powerful coding harnesses are explained after the core value proposition, with only verified compatibility claims.
    - `/cs` and `/en` have coherent localized copy and correct homepage metadata/social previews.
    - `/cs/pro-firmy` remains available with the previous company-data proposition.
    - Existing lead/CTA flows used by the new homepage work end-to-end.
    - No generic filler copy is added solely to occupy layout space.
    - Relevant automated tests are updated/added, including route/metadata behavior where practical; existing tests remain green.
    - The final implementation is manually checked at representative mobile and desktop widths.
- Relevant current entry points include `app/page.tsx`, `app/cs/page.tsx`, `app/en/page.tsx`, `businesses/homepage/_Homepage.tsx`, `businesses/homepage/homepageContent.tsx`, `businesses/homepage/homepageMetadata.ts` and the homepage section components imported by `_Homepage.tsx`. Inspect current code and tests before implementing; do not assume this list is exhaustive.
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do an analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](../changelog/_current-preversion.md).

