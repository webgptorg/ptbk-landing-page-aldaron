# Twenty contact synchronization

The worker reads committed contact forms, community and workshop attendance, workshop feedback, live paid
community memberships, and paid Promptbook orders. Existing Supabase writes and form responses are independent of
the worker. Feedback, membership and paid-order onboarding changes after the cutover update the same source record.
Contact edits, deletions and marketing outreach
are separate operations. Meta, Gmail and Google Contacts are outside this worker's data flow.

## Deployment

1. In Twenty, configure the `contactSources` object with `externalId` as unique text, `sourceType` and `sourceName`
   as text, `sourceUrl` and `details` as text, `occurredAt` as date and time, and `person` as a many-to-one relation to
   People. The API key's role requires People read/create and contact sources read/create/update. Confirm the schema in
   the workspace API documentation and ensure the production worker can reach it over HTTPS.
2. Record a timezone-qualified cutover at or before the start of the historical read. Use `web:contact:<id>`,
   `web:attendance:<id>`, `web:feedback:<id>`, and `web:membership:<id>` in both paths. The worker accepts source rows
   at or after the cutover, so reviewed historical overlap is safe and rows committed during the rollout are covered.
   Use the reviewed cutover for production. An older cutover replays the whole eligible interval and requires the same
   review of relevance, matching and suppression as the historical import. Contact rows without a timestamp require
   explicit historical review.
3. Deploy the database migration through the normal production deployment. Set `TWENTY_CONTACT_SYNC_API_KEY`,
   `TWENTY_CONTACT_SYNC_FROM`, and a long random `CRON_SECRET` as production-only variables. The worker uses the
   existing `DATABASE_URL`. `TWENTY_CONTACT_SYNC_URL` defaults to `https://crm.ptbk.io` and accepts an HTTPS origin.
   For the Promptbook CRM ingress, set `TWENTY_CONTACT_SYNC_INGRESS_KEY` as a sensitive production variable.
   This is a separate key for the reverse proxy. Twenty still checks its own scoped API key.
   The worker is inactive without its API key and cutover, and in Vercel Preview.
4. Schedule authenticated `GET /api/cron/twenty-contact-sync` every five minutes with `Authorization: Bearer`
   followed by `CRON_SECRET`. If using Vercel Cron, confirm Pro or Enterprise before adding the five-minute schedule.
   Vercel supplies the header automatically after production deployment. [Vercel Cron schedule limits](https://vercel.com/docs/schedules/cron-jobs/usage-and-pricing)
5. Confirm an authorized request with `?verify=1` returns `connected: true`. This checks read access to both CRM
   objects without writing records. Then confirm a normal invocation returns HTTP 200 and that a newly received source appears in
   both systems. Simulate CRM failure and retry in a separate environment. Use the same cutover on retries and after
   rolling back or redeploying.

## Operation

- A small PostgreSQL ledger records delivery per stable source key. The worker queries all eligible source rows and
  skips those already delivered at the same version. Equal timestamps and late commits are covered without advancing a
  cursor. It serializes runs with a PostgreSQL advisory lock, and Twenty UUIDs and the unique external source key protect
  against retries after an uncertain response.
- HTTP 502 and the runtime log identify delivery failures with aggregate counts. Configure the deployment's monitor to
  alert on these and missing runs. `last_error`, `attempts` and `next_attempt_at` in `public.twenty_contact_sync` identify
  rows waiting for retry or operator review. The original input remains in Supabase. After reviewing and resolving an
  identity or schema issue, set `next_attempt_at = now()` for the specific affected ledger row to reprocess it.
- The worker preserves the existing Person relation and CRM profile fields. It puts a source with a shared, ambiguous or
  invalid address into Twenty without a Person relation and records the reason in its details for review. Known test
  addresses and payment test records are excluded. Source URLs omit query strings and fragments. The details retain
  only validated values from `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, and `utm_id`. The projection keeps
  recorded purpose-specific evidence and selected context. It omits IP addresses, browser strings, session tokens,
  detailed interaction telemetry, free-text staff notes, invoice details, discount codes, and Stripe identifiers.
- A Promptbook order uses its existing `web:contact:<id>` key once a positive live card payment is recorded. Its
  source shows the plan, first paid date, registered company name, country and company registration number. Optional
  onboarding phone and message update that source when supplied or cleared. Tax IDs, billing addresses and invoice
  URLs stay in the billing system. The source also includes `paidCustomer`, `subscriptionStatus`,
  `cancelAtPeriodEnd`, `paidThrough` and `paymentHistory`. Payment and refund amounts use minor currency units
  with an explicit currency; no Stripe identifiers or payment-method data are copied. Changes invalidate the
  delivery version, including cancellations, renewals and refunds. The existing People and contact sources permissions cover this projection.

## Explicit historical paid-customer import

Run `node --import tsx scripts/crm/import-stripe-paid-customers.ts` in the configured production environment
for an aggregate dry run. Add `--apply` for the explicitly approved import. It reads live positive paid Stripe
invoices, uses the existing web source for known orders and memberships, and imports older recognized subscriptions
under stable `stripe:subscription:<id>` keys. Unrecognized payments are reported and left for review. Existing
People are matched by primary or secondary email; ambiguous/shared identities remain flagged for review. No
payment, subscription, consent, campaign or Person profile is changed. A replay verifies the same source IDs,
relations and details. Logs contain aggregate counts only.

## Customer purchases and lifetime spending

The commerce projection is separate from contact provenance and is gated by
`TWENTY_COMMERCE_SYNC_ENABLED=true` (production only). Keep it disabled until schema setup and a verified initial
import have succeeded. It adds native **Nákupy** (`ptbkPurchases`) and **Platby** (`ptbkPayments`) objects. A recurring
subscription is one purchase with separate successful payment receipts. One-time charges are separate purchases.
The canonical receipt is the captured, positive, live Stripe charge, with a deterministic opaque external key;
seeing the same receipt through an invoice and the charges API cannot add it twice. Stripe identifiers stay outside
CRM. Paid invoices without an identifiable Stripe receipt stop the projection for review; they never fabricate
customer spending. Test, declined and uncaptured charges do not count. No charge, refund, email or payout is created.

**Celkem zaplaceno** measures the customer's gross paid amount, including any tax, before processing fees. Refunds
are separate and do not reduce this measure of willingness to pay. Company totals combine all receipts billed to
that legal entity. A Person's **Nákupy přes kontakt – celkem** is a contact-context view of the same receipts;
**Z toho vlastní nákupy** excludes company purchases. Never sum Person and Company card totals together. A sole
trader is a Company linked to the human Person, using the same receipts, just like other business payers.
A purchase has independent company and contact relations, so a contact can represent several firms even though
Twenty's native employment relation has one company. Existing employment is preserved. Company registration and
billing country form the legal key; no email-domain or fuzzy-name matching is used. An existing company with the same name but no verified legal key requires review instead of an automatic merger.
Ambiguous identities require review, never a guessed merger.

Totals are fully recomputed and overwritten from canonical receipts, never incremented. Each currency stays
separate. A single-currency card has a native Currency field; a multi-currency card leaves that scalar empty and
shows exact amounts per currency in **Zaplaceno podle měny**. Payouts from Stripe are never customer receipts.
Future bank settlement should reconcile with these receipts; a Stripe payout must never create a second sale.

### Activation and access

On 11 November the current production key could read People but `GET /rest/companies` returned
`PERMISSION_DENIED`. The Nginx ingress also returned HTTP 403 for `/rest/metadata/objects`.
These access gaps were resolved during the verified production activation on 13 November 2026.

1. In Twenty administration, extend **Promptbook · synchronizace kontaktů** only as needed: People read/create/update,
   Companies read/create/update, and purchases/payments read/create/update. Deletion is unnecessary. Schema setup
   separately needs administrative data-model permissions. Keep those temporary setup permissions separate from
   the normal worker wherever possible.
2. On DigitalOcean droplet `promptbook-crm` (`610990828`), inspect the actual Nginx ingress rules. Allow only the
   required authenticated commerce object routes and the temporary schema setup routes. Preserve both ingress
   authentication and Twenty's own scoped authorization; do not remove the gate or expose anonymous APIs.
3. Run `node --import tsx scripts/crm/sync-customer-purchases.ts --dry-run` in production for aggregate source counts.
4. Run `node --import tsx scripts/crm/sync-customer-purchases.ts --apply --setup --verify` with authorized schema access.
   This creates only missing fields/objects, imports historical receipts, re-reads saved amounts and card totals,
   and replays the import. `replayWrites: 0` confirms unchanged records on a second pass.
5. Inspect both objects and a business/sole-trader Person and Company in the CRM UI. Confirm visible relations and
   card totals before setting `TWENTY_COMMERCE_SYNC_ENABLED=true` in Vercel production and redeploying. The existing
   five-minute contact cron then also runs commerce synchronization. Remove temporary schema permissions after setup.

### Owner-only production operator

If production Secrets cannot be pulled locally, enable `TWENTY_COMMERCE_OPERATOR_ENABLED=true` for one production deployment and open `/admin/twenty-commerce` while signed in as the environment superadmin. The existing admin guard rejects delegated users and cross-site requests. GET is read-only. Explicit same-origin form POST actions separately run source inspection, idempotent schema setup, and verified import/replay in the existing production environment; no credentials leave that environment. Responses contain aggregate counts and allowlisted error codes only. Preview/development and disabled deployments return 404. Schema operations allow 30 seconds per request; the normal contact API retains its four-second timeout. After verification, remove the temporary data-model permission and schema routes, set the operator flag to false, enable the regular commerce flag, and redeploy. No build hook imports customer data.

### Activation checkpoint · 13 November 2026

Production import and readback succeeded for **6 purchases, 11 unique Stripe receipts, 6 contacts and 1 company buyer**. Gross captured receipts total **CZK 2,209.90**; refunds total CZK 0.00. Stored receipt totals and contact totals match the Stripe snapshot. Both verification passes completed with **writes: 0**, **verified: 11**, **needsReview: 0**, and **replayWrites: 0** after the historical import. The Company card and its contact show the same underlying business purchase; the contact's own-purchase total remains empty for that business receipt.

The scoped integration role has read/update access only to People, Companies, Contact Sources, Purchases and Payments; deletion stays disabled. Temporary Data model permission has been removed (no settings permission flags remain), and Nginx uses the permanent commerce ingress without metadata setup routes. Anonymous commerce and metadata requests return HTTP 403. The existing ingress gate and Twenty authorization remain active.

Vercel production is configured with `TWENTY_COMMERCE_SYNC_ENABLED=true` and `TWENTY_COMMERCE_OPERATOR_ENABLED=false`. The existing `*/5 * * * *` cron performs regular synchronization after deployment. Successful commerce runs log only aggregate purchase/payment counts, writes and review count under `TWENTY_COMMERCE_SYNC`; no contact identities or financial amounts are logged there.

Native Twenty REST details covered by regression checks: metadata APIs support both direct and legacy envelopes with pagination; full Person snapshots retain scalar company IDs so employment is preserved; an empty Currency is compared consistently with Twenty's null-subfield representation, preventing repeated writes to a business contact's empty personal-spend field.
