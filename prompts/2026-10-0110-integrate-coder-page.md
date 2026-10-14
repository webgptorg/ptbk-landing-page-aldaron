[-]

[✨🗂] Integrate the existing Coder landing page into the main Promptbook website

- **Requested outcome:** take the existing presentation at [coder.ptbk.io](https://coder.ptbk.io/) and make it an internal page of the Promptbook website maintained in this repository.
- **Reference:** the existing page has its source and page specifications in `apps/coder-landing` of [webgptorg/promptbook](https://github.com/webgptorg/promptbook). Inspect the current page and source before implementation; reuse its content and behavior rather than inventing a new product presentation.
- **Proposed placement:** `/coder`, following this website's routing and localization conventions. The address and language scope are provisional until clarified.
- **Page behavior:** retain the Coder explanation, getting-started instructions, relevant sections, links, and interactive examples. Integrate the page with the main site's navigation and footer while keeping the Coder presentation coherent. Preserve working mobile and keyboard interactions.
- **Internal links:** once the destination is agreed, links to the Coder presentation from this website should lead to that page. The existing shared Coder link is defined in `components/promptbook-coder/promptbookCoderAnimation.ts`.
- **Open decision:** does "internal" mean a public subpage within `ptbk.io`, or a page restricted to authenticated users? Do not introduce or remove access restrictions until this is clarified. Keep this PRD in draft status meanwhile.
- **Domain transition:** the handling of the existing `coder.ptbk.io` address remains undecided; do not assume its removal or a redirect is part of this request.
- **Acceptance criteria:**
    - The agreed route renders the transferred Coder presentation within the main website.
    - Its content, examples, navigation, and relevant links remain usable on desktop and mobile.
    - Access follows the confirmed interpretation of "internal".
    - Existing pages and unrelated branded domains retain their behavior.
- This task concerns the website presentation; it does not add functionality to the Coder CLI.
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do an analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](../changelog/_current-preversion.md).
