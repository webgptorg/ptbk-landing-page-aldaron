# New Promptbook proposition

The complete product/partner landing-page specification is in [`specs/_main.md`](../../specs/_main.md), including source precedence, every section, commercial terms, calculator inputs/formulas, acceptance criteria and deferred claims. Read it before changing this feature.

`/new` and `/new/partnership` are mutually linked Czech public review pages; they remain noindex and do not replace the indexed homepages. The customer pays Promptbook for a commercial client-environment licence, and pays the agency separately for delivery/care. The MangoWeb app is explicitly upcoming, not a currently purchasable interface. Enquiries go to Jiří Jahn at jiri@ptbk.io; there is no new checkout, registration, payment, lead database or running agent.

`commercialTerms.ts` owns the October 15, 2026 v1.0 proposal: Start $19 once for a 30-day production pilot, once per end client; Business $100 per client environment/month; 20% partner share of licence payments actually collected excluding VAT and refunds, during paid use and the partner agreement. Business offers a first substantive response within 16 working hours, not resolution or uptime. The open-code/non-production path is not a third plan. Upstream licences and previously granted rights are unchanged.

`economics.ts` is the pure calculation/export model. Start is always one period/one environment, never MRR or an assumed conversion. Business horizon and environment count are explicit. All non-licence workload and infrastructure inputs are totals for ONE client, not each environment. Partner share is fixed and not arbitrarily limited to 12 months. Payments/refunds affect the share base. If a partner pays AI/infrastructure as part of its retainer, those costs reduce partner contribution and are not billed to the client twice.

Workload volumes, labour rates, model prices, FX, hosting and agency fees are illustrative editable assumptions, not measured savings or tariffs. Exports are local UTF-8 text including every normalized input/result and offer version. Freed capacity is not payroll cash savings; recurring revenue is not profit. No fabricated pilot evidence, model claims or competitor comparisons are published.

Verification: `npx vitest run businesses/new`, focused `tests/e2e/new-landing.spec.ts`, scoped Next lint, production build, then `npx tsc --noEmit`. The pre-existing Linux Sharp preparation script remains unchanged.
