# Pavol avatar paid pilot

Pavol's personal brand, legally sold by AI Web s.r.o. on the company's existing Stripe account.
This is a separate product from Promptbook engine licences and Developers membership.
Existing accepted contracts, prices, grants, community payments and public chat placements remain unchanged.

## Enable

Deploy all avatar migrations and code together. Production deployment uses the repository's normal immutable migration runner.
Set PAVOL_AVATAR_ENABLED=true to expose the account interface and route the existing full-avatar endpoints through verified account authorization.
Without this flag, the previous anonymous /avatar experience stays available exactly as before.
Set PAVOL_AVATAR_BILLING_ENABLED=true to open new monthly purchases after testing.
The server uses the existing Stripe key and signed shared webhook. It provisions and persists its own portal configuration lazily; it never changes the Promptbook portal.
An optional PAVOL_AVATAR_PORTAL_CONFIGURATION_ID can select an already-created avatar-only portal.

The first edition costs CZK 1,000 monthly. Its licence covers one person, including a company-funded purchase.
There are no device, IP-count, session-count or seat-enforcement restrictions.
The provisional included monthly allowances are Free 5, Light 50 and Full 500 successful text consultations.
Web, MCP and Telegram share the account allowance. Failed calls release their reservation once.
Allowances use UTC calendar months and do not carry over; subscriptions renew on Stripe's payment schedule.
Paid orders record the accepted allowance; changing defaults must not retroactively change it.
No automatic overage charge is implemented. Usage cannot be reset by deleting a conversation.

Light is derived read-only from the same verified mailbox's active paid Developers membership.
The free Promptbook community does not grant Light in this edition.
A community benefit never creates an avatar Stripe subscription and cancelling Full never cancels a community membership.

## Authentication

The existing Supabase project and SMTP numeric OTP template continue working without modification.
Passwords are not introduced. Cookies contain opaque revocable account-session tokens; only hashes are stored.
A verified mailbox is required even for Free to enforce account-based allowances.
Set PAVOL_AVATAR_EMAIL_API_KEY and PAVOL_AVATAR_EMAIL_FROM for avatar-branded one-time Resend links.
Link credentials use an immediately removed URL fragment, not a query string; the server verifies the Supabase token before issuing its own session.
Without this optional sender, the interface accurately offers an email code instead.
Authentication does not grant Full; separate product invoices and paid periods determine access.

## Checkout and records

The avatar checkout reuses company-search components and billing validation, with a separate product payload and consent.
Czech individuals and companies can buy. Slovakia is hidden until PAVOL_AVATAR_SK_ENABLED and the required supplier tax identity are configured.
Accepted seller, payer, price, allowance and full legal Markdown snapshots are immutable.
Each avatar purchase has its own Stripe customer and subscription. No existing customer is rewritten or reassigned.
The shared signed webhook dispatches explicit avatar metadata independently of Promptbook and community handlers.
Current provider state and paid invoice periods are reconciled; duplicate delivery does not create another order.
Cancellation preserves the paid period; full refund removes the corresponding access.
The customer can download the original accepted contract and invoice ledger and open the exact avatar order's payment portal.

Legal sources live under legal/<product>. See docs/legal-product-registry.md.
A future personal sole-trader edition requires new seller/Stripe configuration and new accepted contracts; old AI Web records must retain their supplier.

## Conversation data

Only the current server-managed, public-redacted avatar Book is used. Changes in /admin/agents apply to subsequent consultations on every channel.
No automatic private archive ingestion or live-web research is claimed.
Customer transcripts and uploads are private per account and are never another customer's knowledge.
The browser composer, drafts, Markdown, attachments, export and retry behavior reuse the shared chat.
Server history lets the same verified mailbox reopen conversations on another device.
Paid/account files use distinct avatar-account-cs/en sources and require the owning conversation before a short CDN read can be issued.
Deleting a conversation deletes its transcript and private uploads; billing records and monthly counters remain.
The author/operator's ability to read stored conversations is explicitly disclosed.

Voice changes elsewhere in the repository remain intact. This paid pilot does not enable voice; it is described as a later extension.
No autonomous code execution, repository edits or third-party actions are included.

## Integrations

See docs/pavol-avatar-integrations.md for remote MCP, generated SKILL.md, client setup and Telegram bot provisioning.
Connector secrets are shown once, stored hashed and independently revocable. A downloaded skill contains no token or local copy of the expert knowledge.
Every remote consultation rechecks current Full access and the same allowance.
Telegram requires a dedicated bot token, username and webhook secret. Until configured, the interface says the connection is not open.

## Verification

Focused tests cover verified identity, provider failures, cross-account ownership, checkout consent, contract snapshots,
Stripe product isolation, refunds and renewal, atomic quota reservations, retries, one-time connector tokens,
both MCP protocol eras, Telegram replay/leases, private files and unchanged legal-document text/link/publication parity.
Run npm run test-types after building, plus the focused Vitest suites and existing chat/payment/domain regressions.
Use test Stripe credentials only in isolated development. Never create test leads or send model prompts into the production customer archive.
