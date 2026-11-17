# Pavol avatar: isolated subscription billing

The avatar is a separate product sold by AI Web s.r.o. and branded as Pavol's avatar. It shares the existing Stripe account and signed `/api/stripe/webhook`, but never writes Promptbook orders, community memberships or another product's portal configuration.

## Activation

Apply the versioned avatar migrations through the repository's normal migration runner. Set `PAVOL_AVATAR_ENABLED=true` to expose the new account experience. Set `PAVOL_AVATAR_BILLING_ENABLED=true` only with the existing live Stripe key, configured signing secret and working email verification. Production rejects test-mode checkout. Existing paid users may still manage their subscriptions when new purchases are disabled.

The default monthly allowances are 5 Free, 50 Light and 500 Full requests, shared across channels and reset at the UTC calendar-month boundary. They can be configured using `PAVOL_AVATAR_{FREE,LIGHT,FULL}_MONTHLY_LIMIT`. Each Full order records its accepted allowance; later environment changes do not silently replace that allowance for the paid order.

## Shared webhook preflight before checkout

Before creating an avatar order, Stripe customer or Checkout Session, the server verifies the existing shared webhook. This avoids requiring the operator to reveal the Stripe key outside the production server or manually configure normal existing installations.

The server lists enabled webhook endpoints in the current Stripe mode and accepts only HTTPS endpoints on the known ecosystem hosts with the exact path `/api/stripe/webhook`. There must be exactly one match. Optional `PAVOL_AVATAR_STRIPE_WEBHOOK_URL` selects an exact trusted URL when different trusted endpoints coexist; it cannot disambiguate duplicate endpoint IDs with the same URL.

An endpoint already subscribed to `*` or all avatar event types remains untouched. Otherwise the server refreshes that endpoint and **appends only missing event types**, preserving its existing event list. It never creates or deletes an endpoint, changes the endpoint URL/status, rotates a signing secret, or modifies an unrelated endpoint. The required events cover checkout completion/asynchronous success/failure/expiry, subscription updates/deletion, paid/failed invoices and refunds.

An ambiguous, untrusted, disabled or unreadable endpoint causes a generic 503 **before any order/customer/checkout creation**. A restricted Stripe key needs webhook endpoint read permission and, only when events are missing, update permission. No secret or Stripe provider response is returned to the browser.

## Dedicated customer portal

A manually created portal is optional. On the first authenticated portal request for an **exact owned avatar order ID**, the server creates an avatar-only portal configuration with an idempotency key scoped to test/live mode. It persists the winning ID in private `avatar_settings` and reuses it thereafter. Concurrent first requests cannot overwrite the stored configuration.

This configuration permits invoice history, payment-method updates and cancellation at the end of the paid period. Product changes and customer identity changes are disabled. Its terms/privacy links point to the avatar's fixed legal edition. No account-wide default or Promptbook/community portal is updated.

`PAVOL_AVATAR_PORTAL_CONFIGURATION_ID` remains an optional explicit dedicated override.

## Identity, contracts and accounting

Only a verified mailbox may receive an avatar session. Existing shared Supabase numeric-OTP templates remain unchanged. Optional `PAVOL_AVATAR_EMAIL_API_KEY` and `PAVOL_AVATAR_EMAIL_FROM` enable avatar-branded one-time links through Resend; otherwise the account screen uses the existing email-code delivery.

The order freezes the legal seller, payer identity, accepted full legal texts, price, allowance and immediate-start request. A database trigger prevents rewriting these accepted fields. The authenticated owner may download the stored order/legal snapshot and invoice ledger from `/api/pavol-avatar/confirmation?id=<order UUID>`.

Each avatar order uses its own Stripe customer/subscription. Returning from Checkout never grants access from a URL or typed email. Signed Stripe reconciliation records paid periods and refunds in avatar-only tables. A database trigger prevents late or concurrent invoice snapshots from reducing confirmed refunds. Full refunds remove the corresponding paid entitlement; cancellation preserves the paid period.

Slovak checkout is disabled unless `PAVOL_AVATAR_SK_ENABLED=true`. Slovak business reverse-charge billing also requires `PAVOL_AVATAR_SUPPLIER_VAT_ID` and successful existing payer validation. Optional `PAVOL_AVATAR_CZ_INVOICE_TEMPLATE_ID` and `PAVOL_AVATAR_SK_INVOICE_TEMPLATE_ID` select dedicated rendering templates without changing other products.
