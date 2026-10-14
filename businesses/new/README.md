# New Promptbook proposition

`/new` and `/new/partnership` are Czech, mutually linked public review pages. They do not replace `/cs`, `/en` or `/cs/pro-firmy`. They deliberately remain noindex while the positioning and commercial terms are being reviewed. Social cards reuse the site's renderer.

The customer owns the engine instance and pays the app licence, AI provider and infrastructure separately. Partners own delivery and the primary customer relationship. The engine is not a hosted SaaS free tier or an expiring trial. The current upstream LICENSE.md names BUSL-1.1: do not promise unrestricted open-source production licensing without resolving that discrepancy upstream. No licence is changed here.

App prices ($10 Starter, $100 Business per connected instance/month) are proposals, not checkout products. Business support scope and response times require agreement; do not promise end-to-end uptime of customer infrastructure or external models. CTAs open an email enquiry to the existing public contact, not a non-existent purchase flow. The displayed operational queue is explicitly an illustration, not live telemetry.

## Calculator

`economics.ts` is the only calculation and app-price source. All money is CZK excluding VAT; USD conversion is editable and not a live FX quote. All scenario volumes, token use, labour rates, infrastructure rates and a 20%/12-month partner commission are synthetic, editable examples, not provider tariffs, benchmarks or confirmed partner terms. The calculator does not call AI or a pricing API.

- Tokens: items × units per item × (input tokens × input USD price + output tokens × output USD price) / 1e6 × CZK/USD. Token estimates cover the whole workflow per unit, not a single model call.
- Subscription replaces (does not add to) the token bill. Check provider allowances and limits separately. Local inference has no token bill but still includes the explicitly entered hardware, energy and hosting.
- Retry reserve applies only to metered AI and per-unit external services.
- Human baseline: items × minutes per complete item / 60 × fully loaded hourly cost. Units per item affect token/external costs, not this independently specified complete-item time.
- Remaining human work: baseline hours × retained-work percentage + monthly oversight. This is valued at the same hourly rate. Freed capacity is not automatically payroll cash saved.
- Operating total includes app, AI, external services, reserve, server, backups, energy, hardware allocation, other tools and partner retainer. Economic total adds remaining human work.
- Net monthly benefit = baseline human cost − economic total. Horizon benefit = net monthly benefit × months − one-off setup. Payback only exists for a positive net monthly benefit. Negative results are retained.
- Partner revenue is retainer + app revenue share; the customer-paid app licence, tokens and hosting are not partner turnover. Partner contribution deducts delivery labour, overhead, setup labour and acquisition. Commission stops after the entered term. Every client starts at month one and remains active for the chosen horizon; this is not a churn/growth forecast. Setup income is never counted as MRR.

Inputs are not submitted by the calculator. Export is generated in the browser. Existing site-wide consent/analytics behavior remains unchanged. No database, payment settings, agent execution, or customer data are modified.

Run `npx vitest run businesses/new` and the focused `tests/e2e/new-landing.spec.ts` browser tests. Update the calculator and its tests together when commercial assumptions change.
