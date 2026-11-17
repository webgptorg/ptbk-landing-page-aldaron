# Pavol's AI avatar

The `cs/` and `en/` directories contain full authoritative Markdown for service terms and privacy notice edition `2026-11-17-v1`.

- Public hub: `https://pavolhejny.cz/avatar/legal` and the corresponding `.com` address.
- Terms: `/avatar/legal/terms/2026-11-17-v1`.
- Privacy: `/avatar/legal/privacy/2026-11-17-v1`.
- Brand: Pavol Hejný.
- Supplier and controller in this edition: **AI Web s.r.o., IČO 21012288**.

`lib/legal/productLegalAvatar.ts` loads these exact files. `avatarLegalContractSnapshot()` captures the complete terms, privacy notice, language and fixed seller in each accepted order. Order-specific price and included usage belong beside that snapshot.

A future OSVČ supplier requires a new edition and the applicable customer/payment/legal migration; never replace the supplier of old orders by changing a global variable. This product has no implied Promptbook licence or community purchase.

The chosen pilot defaults are 5 Free / 50 Light / 500 Full text requests per monthly period. Full starts at 1,000 CZK per month. Limits are configurable for new offers; accepted orders must freeze their actual allowance. Light is an eligible paid Developers-community benefit, not a standalone paid plan. No automatic overage charges or technical device/seat policing are introduced.

Consumer policy deliberately preserves a 14-day full refund even after requested immediate access. Refund administration must cancel only the avatar subscription. Contact: `legal@ptbk.io`. Privacy discloses authorised operator access to conversations, and requests for erasure go to `privacy@ptbk.io`; it does not promise an unimplemented automatic retention sweep.

Reference checks on 17 November 2026:

- [ČOI consumer guide](https://coi.gov.cz/pro-spotrebitele/spotrebitelsky-pruvodce/)
- [ČOI digital-service complaint timing](https://coi.gov.cz/pro-podnikatele/informace-pro-prodejce-zbozi-a-sluzeb/reklamace-zbozi-a-sluzeb/)
- [ČOI out-of-court resolution](https://adr.coi.cz/)
- [GDPR regulation](https://eur-lex.europa.eu/eli/reg/2016/679/oj)

The notice and conditions are implementation documents, not a claim of an independent legal audit.
