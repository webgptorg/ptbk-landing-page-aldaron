# Product-scoped legal sources

See [the legal catalogue](../legal/README.md).

Static text now has one editable Markdown source, adjacent frozen publication metadata, and compatibility exports for existing page/rendering APIs. The migration checked complete visible wording, link destinations, section order and publication status for fourteen documents before replacing the old static bodies. The existing legal-route and public-terms tests also passed unchanged.

Genuinely composed current product terms and online-v3 remain code-generated. Visible Markdown source-index entries explain the composition; runtime and order confirmation do not load those entries.

Avatar pages use the personal brand and their own versioned legal addresses. The seller is fixed inside the edition, not inferred from the personal domain. Accepted order snapshots contain full terms/privacy Markdown and fixed seller, so publishing a future edition cannot change a customer's prior contract.

New source tracing must include `legal/**/*.md` and `legal/**/*.meta.json` for dynamic serverless order-confirmation routes. Existing shared public URL/canonical/redirect behavior remains unchanged.

Checks:

```sh
npx vitest run lib/legal/productLegalMarkdown.test.tsx lib/legal/productLegalAvatar.test.ts lib/legal/legalRoutes.test.tsx lib/legal/publicLegalTerms.test.tsx
```
