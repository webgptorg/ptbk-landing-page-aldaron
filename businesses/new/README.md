# Promptbook public website

The launch website is published at `/cs` and `/en`. `/` and unprefixed marketing paths choose a language from `Accept-Language`; old `/new` paths redirect permanently, preserving queries. Czech routes reuse `app/(marketing)` and the English catch-all owns only marketing pages. Other branded sites, articles, workshops and administration retain their routes. Public marketing pages are indexable with canonical URLs and language alternates.

The specification entry is [`../../specs/_main.md`](../../specs/_main.md). The latest owner feedback is dated 24 October 2026 and applies equally to the product and partnership pages.

## Shared presentation

- The header and footer pair the original mark with `promptbook`: black `prompt`, logo-blue `book` (`#000080`), no trailing dot.
- The hero leads directly into one compact carousel with podcast, CRM outreach and overnight repair scenes. Playback starts when the scene becomes readable; on mobile each panel reveals on reaching it. The page keeps moving normally. No pinned story tracks or forced tab progression.
- A separate app/engine scene shows independent device choices and continuing engine work when the app sleeps. The former files, Git history and model-choice feature trio is removed.
- Start and Business use conventional plan cards. Czech prices are 400 Kč / 2 200 Kč; English prices are $19 / $100. Public pricing contains no exchange-rate disclaimer.
- All six unchanged testimonials share one grid. Founders have mirrored, enlarged portraits flush with the card bottoms and verified email/phone contacts.
- A visible contact form supplements the existing modal at the bottom of both pages.

Scenes remain keyboard-operable, responsive and usable with reduced motion. Sample data is labeled. The original five-agenda demo in `AgendaScenes.tsx` remains on agenda overview/detail routes, with its existing playback and scrolling behavior. Target paired/E2E architecture is distinguished from data sent to external models and tools; a website illustration is not a security audit.

## Commercial and contact contracts

`commercialTerms.ts` retains the October 15 offer: Start $19 once/30 days, Business $100/environment/month, fixed 20% share on paid licences net of refunds. `economics.ts` remains the calculation source; `calculatorState.ts` round-trips all allowlisted inputs. Start stays one period with no MRR. Display currency conversion and the editable model exchange rate keep their existing meanings; assumptions remain explicit in the calculator.

The inline form and `LeadCaptureProvider` both use `subscribeToWaitlist` → `/api/waitlist` → Contact (`new-website-contact`). Success requires backend acceptance; errors preserve drafts and busy submissions cannot duplicate requests. PDF capture keeps its separate source and frozen calculation link, generating the file locally after acceptance. PDF retries do not duplicate an accepted lead. No newsletter subscription, account, invoice, AI execution or payment is created. Never submit test contacts against production.

Both cofounders retain equal prominence, the original quotes and Technology Incubation acknowledgement remain intact, and BUSL is unchanged. The source of ordinary contacts is `components/team-section.tsx`.

## Verification

Run focused Vitest tests in `businesses/new`, applicable Playwright landing/branding tests, lint, the production build and then TypeScript. Inspect desktop/mobile layouts in both languages, normal scroll through the carousel, keyboard and reduced-motion behavior, inline/modal forms, pricing and reset-button wrapping. Mock contact submissions during browser tests. Inspect generated PDF when export changes.

`LocaleProvider` and `locales/en.json` localize initial React renders. `localization.ts` owns localized links and display currency; `localizedCalculator.ts` converts input presentation while query v2 and stored CZK units remain stable. The language switch preserves path, query and fragment. Comparison facts retain their own source review dates.

The evening 25 October refinement stages the hero text without moving its layout, uses descriptive work tabs, presents one elevated calculator surface and anchors Jiří’s mobile contact block at the bottom right. The story link follows the founders; `/[locale]/o-nas` shows sourced milestones for 2023, 2024, 2025 and 2026. The 400 Kč Start price is the Czech public offer; the editable USD-based calculation model remains unchanged.

The 26 October hero uses one complete-sentence subtitle instead of two explanations. `HeroHeadline.tsx` owns the visible-time-only robot and activity rotation, with stable layout and a static reduced-motion phrase. The benefit CTA opens the existing lead capture with a workflow question. Scene examples use one short heading without explanatory filler.

The subsequent visual correction uses `PromptbookRobot.tsx`, a faceted blue-cube character carrying the original mark, above a compact two-line headline. The text has a readable ink guide while writing; the subtitle finishes its sentence reveal within about 1.5 seconds. Mobile keeps the full working promise together. The active-time rotation and static reduced-motion behavior remain.
