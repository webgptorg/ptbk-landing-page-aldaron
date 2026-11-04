# AI ta Krajta: native partnership prototypes

Throwaway review branch, based on main `f8a1b0e`. Do not merge all three into production. Select a layout first and implement that decision separately.

Open `/ai-ta-krajta?variant=A`, `B`, or `C` in development or a Vercel preview. Production ignores the variant parameter. The bottom switcher and left/right arrow keys preserve the current page; editing a field does not trigger variant changes.

| Variant | Homepage | Business page |
| --- | --- | --- |
| A | Existing hero, direct partnership action, offer before episodes | Main offer first, existing contact form below |
| B | Existing episodes with a sticky partner panel; panel precedes episodes on mobile | Existing collaboration process and offer, then contact |
| C | Main partnership offer in the first section, episodes immediately after it | Offer and existing contact form together |

These are layouts of the current Next.js podcast page, not independent HTML mockups. They import the existing header, navigation, logo artwork, snake game, footer, episode list/cards, people section, page state, global player and collaboration form. The archive, portraits, platform destinations and commercial content come from the current production sources. Inter/Outfit, original greens/coral/indigo, max-w-6xl, section spacing, button shapes and card treatments are retained. The optional link context keeps prototype navigation on the preview host without changing normal public destinations.

The business form is the existing component. Its submission is intercepted before its real handler, so this preview cannot create contact records. Listening and filtering use the real existing behavior. All ancillary business information is consolidated into native disclosures on the business page; the logo links retain the original assets.

## Six thinking hats, reviewed and incorporated

| Hat | A | B | C |
| --- | --- | --- | --- |
| White: evidence | Reuse current offer, archive and components | Reuse current offer, archive and components | Reuse current offer, archive and components |
| Red: feeling | Preserve familiar podcast introduction | Preserve familiar cards and rhythm | Preserve identity while prioritizing a business visitor |
| Black: risks | Long hero could hide the offer: add a direct action and pre-episode strip | Sidebar could fall below all episodes on mobile: explicitly reorder it | Commercial hero could confuse listeners: retain header listening and direct archive access |
| Yellow: benefit | Small structural change for current listeners | Partnership remains available while browsing the archive | Main offer appears before any additional click |
| Green: alternatives | Consolidate statistics, guidelines and assets | Explain the existing collaboration process | Put offer and existing form side by side |
| Blue: evaluation | Track qualified inquiries and closed partnerships after selection | Also check listening remains usable | Validate stronger commercial priority against closed partnerships and listening |

The in-preview “6 klobouků” dialog contains the detailed critique and resulting changes for each variant. Conversion improvements are hypotheses; no conversion results are claimed.

## Validation

- Production build and TypeScript check passed in the task environment.
- Existing offer, episode-card and people-section checks: 11 passed.
- Review covers desktop and mobile layouts, internal navigation, variant controls, archive and stubbed form submission.

Only files under the AI ta Krajta business and its existing app route are changed. No database, environment, dependency or deployment-protection changes are required.
