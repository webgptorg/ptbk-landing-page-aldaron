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
  amounts stay in the billing system. The existing People and contact sources permissions cover this projection.
