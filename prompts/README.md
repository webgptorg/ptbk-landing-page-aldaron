<!--ptbk-coder-ignore-->

# Implementation prompts (PRDs)

This directory is the versioned implementation backlog for this repository: features, bug fixes, refactors, and the history of their implementation. A PRD (Product Requirements Document) describes a specific change, the behavior to preserve, and how to verify the result. It is also the prompt handed to a coding agent.

The workflow uses [Promptbook Coder](https://coder.ptbk.io/), but the requirements are ordinary Markdown. They can be implemented by another coding agent or by a human without installing Coder. These are development instructions, not the application's runtime prompts or a complete specification of its current state.

**Writing a PRD and implementing it are separate tasks.** When asked only to prepare requirements, change the requested documentation, not application code, and do not mark the feature as implemented. Publishing a ready prompt makes it eligible for a subsequent Coder run; keep unfinished or unapproved work as a draft.

## Directory layout

```text
prompts/
    README.md                         This guide, excluded from the execution queue
    YYYY-MM-NNNN-descriptive-slug.md   Active tasks, drafts, and work awaiting review
    templates/common.md               Shared authoring template
    screenshots/                      Referenced images and visual requirements
    done/                             Verified, archived prompt files
    traces/                           Coder-generated execution traces, when produced
```

Coder scans Markdown files directly in `prompts/`, not recursively through its subdirectories. Completed files can therefore remain in the active directory until they have been reviewed; being outside `done/` does not mean that every task is unfinished.

This README starts with the `<!--ptbk-coder-ignore-->` marker so Coder excludes it from its queues. Keep that marker in documentation containing prompt examples, but **do not copy it into an actual task file**, or that task will be ignored.

## Read the repository context first

Use [AGENTS.md](../AGENTS.md) for current repository behavior and implementation rules, the [root README](../README.md) for application setup, and [agents/developer.book](../agents/developer.book) for the shared developer instructions. Follow applicable directory-level instructions too.

The selected PRD supplies the requested change; the existing code establishes what is already implemented. Older PRDs explain intent and history, not necessarily today's behavior. Read related tasks without implementing their entire scope as part of the selected one. Investigate contradictions instead of silently discarding requirements or treating a previous completion marker as proof that a reported bug cannot exist.

## File names and task boundaries

Use the existing naming convention:

```text
YYYY-MM-NNNN-descriptive-slug.md
2026-09-0710-public-domain-page-isolation.md
```

`YYYY-MM` is the year and month, `NNNN` is a zero-padded sequence number, and the slug describes the change. The sequence is not a day or deadline. Numbers are commonly spaced by ten; inspect the existing files before choosing the next available name. Do not overwrite another task or renumber history to insert a new one.

For a filled-in example, see the [public-domain isolation PRD](./2026-09-0710-public-domain-page-isolation.md).

Prefer **one independently reviewable change per file**. Keep unrelated requests separate, and link related tasks or prerequisites explicitly. A reference is context, not an automatically enforced dependency: do not release a dependent task to the queue before its prerequisites are ready.

Some existing files contain several prompt sections separated by a standalone `---` line. Each section has its own status and can run independently. Coder's parser treats that line as a separator even inside a code fence, so do not use it as decorative Markdown or YAML frontmatter inside a single task. New unrelated work should normally get a new file instead.

## Writing a PRD

Follow the style of the recent filled-in prompts: English requirements, a status line, a short action-oriented title with an emoji tag, and concrete bullets. Czech interface labels can remain in Czech. Keep the task understandable without the conversation that produced it.

Start from [templates/common.md](./templates/common.md), or use this draft shape:

```markdown
[-]

[✨🧩] Describe the requested user-visible change

- Problem and intended outcome: @@@
- Scope: the affected page, users, and workflow.
- Required behavior:
    - Describe the normal interaction and important state transitions.
    - Cover errors, empty states, permissions, and relevant edge cases.
- Preserve the existing behavior that must not change.
- Reuse the existing components/services; name verified entry points.
- Out of scope: identify adjacent work this task must not implement.
- Acceptance criteria:
    - State observable outcomes and the checks that demonstrate them.
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do an analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](../changelog/_current-preversion.md).
```

Replace the example title and every `@@@`, remove irrelevant bullets, and add the actual requirements before changing `[-]` to `[ ]`. The emoji tag is a recognizable label, not a status or priority; use a fresh one rather than copying another task's identifier.

Describe the requested outcome before prescribing a solution. Inspect the repository to name real files and reusable helpers. Clearly distinguish a suspected bug cause from an established one. For UI changes, describe loading, success, failure, keyboard/mobile behavior, and live updates where relevant. For data changes, describe authorization, persistence, migration, and compatibility requirements where relevant.

Keep permanent coding rules in the shared context and recurring authoring guidance in the template rather than copying whole manuals into every PRD. Use repository-relative code paths, working Markdown links, and screenshots in `screenshots/` when they clarify the requirement. Relative Markdown links are resolved from the document's directory; commands in this guide run from the repository root.

## Statuses and priority

Put the status on the **first non-empty line of each prompt section**, before the title. Use `[ ]`, not a Markdown list item such as `- [ ]`, and do not put arbitrary commentary after a ready/draft marker.

| Marker | Meaning | What to do |
| --- | --- | --- |
| `[-]` | Draft, deferred, or otherwise not ready. | Finish or approve the requirements before releasing it. |
| `[.]` | Historical alternative to `[-]`. | Treat it as not ready; prefer `[-]` for new drafts. |
| `[ ]` | Ready for implementation. | Eligible when there are no authoring placeholders and the runner filters match. |
| `[^]` | Implementation/testing in progress, or an interrupted run. | Check the active process and working tree before taking over. |
| `[x]` | The implementation run completed successfully. | Review the result against the PRD before archiving. |
| `[!]` | A failed run. | Inspect the failure and partial changes before retrying. |

A section containing `@@@` is considered not fully written and is not runnable even when marked `[ ]`. A section **without a recognized status line can be treated as ready at priority zero**, so omitting the marker is not a way to keep a draft out of the queue.

Priority is the number of exclamation marks following the ready marker:

```text
[ ]       Priority 0
[ ] !     Priority 1
[ ] !!!   Priority 3
```

The explanations above are not part of the status line: write only the marker and exclamation marks in a real prompt. `[ ] !` is a ready priority-one task; `[!]` is a failed task.

Coder selects higher priority first. At equal priority it follows the sorted filenames and then section order within a file, subject to eligibility and any model/harness or priority filters. A sentence such as `Priority: LOW` in the body informs a reader but **does not change the scheduler**. Use the marker priority or keep work deferred as `[-]` when execution order matters.

Coder may append the agent, harness, model, timing, cost, or current step to in-progress/completed/failed status lines. Preserve genuine metadata. A manual contributor must not invent measurements or claim checks that were not run.

## Using Promptbook Coder

Promptbook Coder coordinates the queue, shared context, a coding harness, test feedback, and Git operations. The harness is the tool that performs the code changes, such as Claude Code or OpenAI Codex; Coder is not a separate coding model. See the [upstream overview](https://github.com/webgptorg/promptbook#-promptbook-coder) and [runner documentation](https://github.com/webgptorg/promptbook/blob/main/scripts/run-codex-prompts/README.md).

### Prepare and inspect

Work from the repository root, install the project dependencies, configure the application's development/test environment, and authenticate the selected coding harness. Use a branch whose changes you intend to publish and start with a clean working tree. Do not run two workers against the same checkout or task.

```bash
npm ci
npx ptbk coder --help
npx ptbk coder run --help
npx ptbk coder run --dry-run
```

Inspect the queue before execution. The project is already initialized; running `coder init` is not required just to use these prompts.

### Project commands

The actual configuration lives in [package.json](../package.json). Prefer these scripts over copying older command examples from documentation; use the installed CLI's `--help` to check supported flags.

| Command | Purpose in this repository |
| --- | --- |
| `npm run coder:generate-boilerplates` | Generate draft files using `prompts/templates/common.md`. |
| `npm run coder:add` | Add one prompt from a description using that template; review the generated status and requirements before execution. |
| `npm run coder:run` | Process the queue using the configured Claude Code harness. |
| `npm run coder:run:openai` | Use the configured OpenAI Codex harness instead. |
| `npm run coder:verify` | Interactively review completed work, starting with the latest files, and record/archive the decisions. |
| `npm run coder:find-refactor-candidates` | Generate proposed refactoring tasks; review their relevance and scope before execution. |

The two run scripts currently provide `agents/developer.book`, `AGENTS.md`, a configured model/thinking level, the `test-for-ptbk-coder` verification command, baseline testing with `yes-and-fix`, and both `--auto-pull` and `--auto-push`. Model names and flags belong in `package.json`, not in each PRD.

**These run scripts can change code, create commits, pull, and push.** Without a limit, normal automatic mode continues through eligible tasks; it is not a one-file preview. Coder's generic push behavior is opt-in, but these project scripts already opt in. Review the branch, remote, and script before starting, and use an explicit CLI invocation without remote-sync flags when remote changes are not intended.

To bound a run rather than process the whole queue:

```bash
npm run coder:run -- --limit 1
```

This limits prompt runs; it does not select a filename. With the configured baseline-repair mode, fixing existing test failures may precede feature work. To control other behavior, inspect `npx ptbk coder run --help` instead of guessing flags.

### Execution, verification, and repairs

The usual lifecycle is draft `[-]`, ready `[ ]`, running `[^]`, successful `[x]`, then review and archival under `done/`. A failed run uses `[!]`. An interrupted process deliberately leaves `[^]` behind and is not silently picked as a fresh task.

During a run, Coder supplies the task and shared context to the harness, runs the configured checks, and can feed failures back for repair. On success it records the status and makes the implementation commit; these project scripts then push it. Runner traces, when generated, live in `traces/`; failure logs and the working-tree diff can explain an unsuccessful attempt.

There are **two different kinds of verification**:

- The configured test command checks each implementation attempt. In this repository, `test-for-ptbk-coder` runs lint, stops anything on port 4009, runs the build/type checks and end-to-end tests, then cleans up test data. Use the intended test environment. It does not include the separate Vitest `npm test` suite, so run relevant unit tests too.
- `npm run coder:verify` is an **interactive review workflow**, not a substitute for those tests or for inspecting the UI. Check whether the requested behavior actually exists. Verified files are archived; incomplete results receive a repair follow-up. The project verification script also commits and synchronizes its changes.

Do not read `[x]` as proof of independent acceptance or production deployment. Keep the original requirements and implementation history when adding a repair section or follow-up file; say exactly what is still wrong and link the earlier task. Archive only when every relevant section is complete and verified. When moving a file manually, check its relative links and update references to its new location.

Before resuming a `[^]` task, make sure its original worker has stopped and inspect the partial changes. The current Coder supports `--git-changes continue` to resume exactly one interrupted task. Consult the installed help and preserve the existing work; do not blindly reset the marker or discard the working tree. Failed work should likewise be diagnosed before being deliberately requeued.

## Using another agent or implementing manually

No proprietary format conversion or Coder account is needed to read these requirements. The essential workflow is the same; without Coder, you are responsible for selecting the task, maintaining its status, running checks, and handling Git.

1. Select one ready, fully written PRD and read the whole file, its references, and the shared repository/developer instructions. Check dependencies and confirm another worker is not already implementing it.
2. Work on a clean, appropriate branch. Mark the selected section `[^]` when implementation begins. For a file with several sections, identify the exact section rather than replaying completed work.
3. Analyze the existing implementation, then make the scoped change using the existing abstractions. Add or update tests and the requested changelog entry. Update shared context only when behavior actually changes.
4. Run the relevant checks and exercise the acceptance criteria. Use a real browser for visual or interaction requirements; passing type checks does not demonstrate that a flicker or layout bug is fixed.
5. Report what changed, which checks passed/failed/were not run, and any remaining limitations. Mark `[x]` only after successful implementation and the required available checks; do not claim completion when acceptance is still blocked. Use `[!]` with a factual note for a failed attempt.
6. Review the diff and commit only the intended changes under the agreed Git workflow. Push only when authorized. After acceptance, archive the task or add an explicit repair follow-up as described above.

A copyable handoff for an agent with repository access:

```text
Implement only the task in prompts/<selected-file>.md.

Read prompts/README.md, AGENTS.md, agents/developer.book, the complete selected
PRD, and any referenced code or documents before editing. If the file has several
sections, work only on the selected ready section. Do not implement unrelated PRDs.

Analyze the current behavior first. Follow the PRD's scope, preservation rules,
reuse requirements, and acceptance criteria. Maintain its status honestly: [^]
while working, [x] after successful implementation and required checks, or [!]
with the failure reason. Preserve existing task history and genuine run metadata.

Run the relevant tests and report their actual results, including anything not
run. Add the requested changelog entry. Do not invent test results, timing, or
cost metadata. Do not archive before the result has been accepted, and follow
the owner's agreed branch, commit, and push instructions.
```

Replace `<selected-file>` with an actual filename. When the agent cannot access the repository directly, provide the full PRD, shared instructions, relevant source files, and referenced screenshots rather than only its title or a conversation summary.

Typical implementation checks, from the repository root:

```bash
npm run lint
npm test
npm run test-types
npm run test-e2e
```

`test-types` builds before running TypeScript, as required by `AGENTS.md`. End-to-end tests and cleanup require the project's configured test environment. Run the checks relevant to the change, follow any additional PRD requirements, and disclose unavailable infrastructure instead of reporting a false pass.

## Keeping this guide accurate

Keep requirements separate from run output, preserve useful history, and leave verified work discoverable through Git and `done/`. Do not add credentials, production contact data, or unnecessary personal information to PRDs, screenshots, or committed logs.

When Coder or the project scripts change, update this guide against [package.json](../package.json) and the installed CLI. For the underlying mechanism, see Coder's [file loader](https://github.com/webgptorg/promptbook/blob/main/scripts/run-codex-prompts/prompts/loadPromptFiles.ts), [section/status parser](https://github.com/webgptorg/promptbook/blob/main/scripts/run-codex-prompts/prompts/parsePromptFile.ts), and [verification command](https://github.com/webgptorg/promptbook/blob/main/src/cli/cli-commands/coder/verify.ts).
