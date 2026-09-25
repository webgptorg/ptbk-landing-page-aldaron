[ ]

[✨📬] Let listeners subscribe to AI ta Krajta by email and collect them in the existing contacts inbox

- Add a simple, visible email-subscription form to the AI ta Krajta website. Listeners should be able to ask for new episodes/news by email without using the sponsorship or partnership inquiry form.
- This is contact collection for podcast emailing, not a new standalone CRM or a complete email-campaign sending system.
- Provide a compact, branded entry point on the podcast homepage, placed naturally near listening/subscription options or the episode content.
    - Use direct Czech copy such as `AI ta Krajta do e-mailu` and `Odebírat e-mailem`.
    - Email is the only required contact field. Do not require a name, phone, company, message, account or paid membership just to subscribe.
    - Keep the interaction unobtrusive; do not interrupt listening, the miniplayer or the snake game with a forced modal.
    - Use the site's existing visual tokens and accessible form patterns. Labels and the form itself should explain the action without generic supporting copy.
- Submit through the existing shared contact-collection pipeline.
    - Reuse `lib/subscription/subscribeToWaitlist.ts` and `/api/waitlist`, which already write to the contacts inbox shown at `/admin/contacts`.
    - `businesses/ai-ta-krajta/AiTaKrajtaCollaborationForm.tsx` is the existing example on this brand, but do not copy its required sponsorship/message fields into the subscription flow.
    - Use a dedicated, shared podcast-emailing `placeName` constant in the brand configuration, distinct from the collaboration source, and a clear subscription-purpose note.
    - Preserve the pipeline's source URL/referrer/UTM handling and server-derived metadata. Do not write directly to the database from the browser or create a new public contact table.
    - The admin must be able to distinguish/filter these contacts as AI ta Krajta email subscribers through the existing contacts source/filter/export mechanisms.
    - Preserve existing contact history and collaboration inquiries. Do not overwrite unrelated notes or enroll old sponsorship contacts simply because their email is known.
- Make the submission intent clear and use the existing privacy/consent components and conventions.
    - Record that this submission requests AI ta Krajta email updates, rather than treating it as consent to every unrelated Promptbook campaign.
    - Link to the applicable existing privacy information with a correct canonical URL from this domain. Do not rely on cross-domain routing fallbacks.
    - Do not add fabricated legal assurances, a promised sending frequency or an automatic mailing integration that does not exist.
- Include complete form states.
    - Validate the address on the client and through the existing server validation; handle surrounding whitespace consistently with the shared pipeline.
    - Disable repeated submission while a request is in flight and avoid duplicate writes from double clicks or repeated event handlers. Follow the contacts system's existing repeated-submission semantics rather than adding a conflicting global email-upsert rule.
    - Only show success after the server confirms persistence. An error must keep the typed email and allow retry, with no false subscription confirmation.
    - Keep the listener on the podcast page after success. Do not navigate to a generic Promptbook thank-you page, reset episode filters or stop playback.
    - Do not place the submitted email into public URLs, analytics event payloads or a publicly readable subscriber list.
- Start with `businesses/ai-ta-krajta/_AiTaKrajtaPage.tsx`, `AiTaKrajtaCollaborationForm.tsx`, `config.ts`, `components/legal/PersonalDataConsentNote`, `lib/subscription/subscribeToWaitlist.ts` and `app/api/waitlist/route.ts`.
    - This is the concrete specification for the emailing idea also named by the older `2026-09-0610-ai-ta-krajta-emailing.md` placeholder; do not implement two competing subscription forms.
    - Coordinate with `2026-09-0710-public-domain-page-isolation.md`: the podcast-domain form must retain access to its shared API, while explicit privacy/community links use their real destination domains.
- Acceptance criteria:
    - A valid submission from the canonical podcast domain and its existing `www.` alias reaches the usual admin contacts inbox with the dedicated source and subscription intent.
    - Email-only submission works; invalid input, server failure, retry and double click behave correctly.
    - Verify source filtering/export compatibility without mixing these records with partnership inquiries.
    - Test mobile/keyboard use and confirm submitting does not interrupt playback, move the visitor to Promptbook or expose the email publicly.
    - Existing sponsorship/contact forms continue to work unchanged. No campaign is sent merely by implementing or testing this collection feature.
- Keep in mind the DRY _(don't repeat yourself)_ principle. Reuse the existing contacts and consent infrastructure.
- Do an analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](../changelog/_current-preversion.md).
