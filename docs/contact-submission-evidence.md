# Purpose and consent evidence for new contact forms

The 3 November 2026 owner instruction applies to the shared ptbk.io, pavolhejny.cz, pavolhejny.com and ai-ta-krajta.cz build. Historical rows are not backfilled. This change does not send newsletters or verification email.

Every public caller of `/api/waitlist` sends the current notice version, language and actual marketing choice through `subscribeToWaitlist`. The fixed-source paid workshop and community registration endpoints use the same contract. Source values are allowlisted in `lib/contacts/contactSubmissionPolicy.ts`.

The server validates the source and version before inserting a contact, derives the canonical wording and purpose, and timestamps receipt. `submissionEvidence` is written atomically on the same Contact row. An SQL trigger prevents later evidence edits, including retrospectively filling historical NULLs. The regular administrative fields remain editable. Existing tabs with old form code get an explicit reload error; missing evidence is not accepted as consent.

Newsletter choices are specific to AI Web s.r.o. and either Promptbook or AI ta Krajta. Neither enquiry, PDF download, registration nor acceptance of event terms grants marketing permission. There is no grant for Neonmedia's unrelated marketing. Both newsletter checkboxes begin unchecked and submit their actual state.

The common notice names the controller and links purposes, recipients, retention and rights. Administrative source histories and individual contact editors show the evidence read-only. CSV and Book source-history exports retain the originating record and its evidence; grouped contacts never manufacture a single cross-purpose consent.

`emailVerified: false` is deliberate: a checkbox is not proof of mailbox ownership. An old affirmative choice is also not proof that consent has not since been withdrawn. A sending system must separately honour withdrawals/suppression and the appropriate legal basis; the recorded choice is not an automatic campaign entitlement. Double opt-in is a separate operational decision before a campaign, not silently claimed by this patch.

## Public entrypoints

- Main/partner inline enquiry and modal; calculator PDF modal.
- Personal Czech/English contact forms.
- Podcast collaboration enquiry and both podcast newsletter placements.
- Shared footer newsletter.
- Free workshop registration and paid workshop interest form.
- Qualification enquiry/popup, specialized business modal and legacy availability modal.
- Paid AI Supervize Mini and community membership registration endpoints.

## Verification

Focused API tests cover refusal without newsletter consent, enquiry without a newsletter choice, stale notices and ignored forged server evidence. PGlite executes the migration and verifies NULL historical rows, same-row insertion, normal note editing and refusal to mutate evidence. Browser/component tests cover the actual checkbox states. Production test leads must never be inserted.

Runtime startup uses the existing checksum-checked migration runner. Deploy the new migration and new server/client contracts together. The current schema migration is `2026-11-0300-contact-submission-evidence.sql`.
