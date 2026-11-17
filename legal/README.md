# Legal documents by product

This directory is the editable source catalogue for the website ecosystem.

- [Promptbook](promptbook/README.md): software, licence, partner and existing website privacy documents.
- [Community and workshops](community/README.md): the existing shared community/workshop general conditions.
- [Pavol's AI avatar](pavol-avatar/README.md): a separate product with its own terms, privacy notice and fixed supplier per edition.
- [Shared campaigns](shared-campaigns/README.md): the separately scoped joint-controller arrangement.

## Static text is authoritative here

Static published documents live in language directories as full Markdown, with publication metadata in adjacent `.meta.json` files. Existing `lib/legal/*Documents` exports are compatibility wrappers that load these files. Existing public URLs and callers remain unchanged.

Edit the applicable product and language. Do not silently replace accepted historical wording: add a new dated edition for contractual changes. Supplier data is frozen in the relevant document/edition rather than inherited from a future global operator setting.

## Programmatically composed documents

A few current documents genuinely compose or amend prior editions in code. Their Markdown entries are explicitly labelled **source index only** and name the exact implementation. Those explanatory files do not render as a contract and are never accepted at checkout.

## Migration verification

`_migration/parity-before.json` contains SHA-256 evidence captured from the pre-migration rendered documents at commit `330580b673b0b93d434421e937b10fa3c7b9ca7d`. The parity check covers the complete ordered visible wording, section titles, links and publication metadata; it ignores presentation whitespace only.

Run `npx vitest run lib/legal/productLegalMarkdown.test.tsx lib/legal/legalRoutes.test.tsx lib/legal/publicLegalTerms.test.tsx`. The first migration passed all 14 complete document comparisons. Do not update this evidence merely to make an unintentional wording change pass.

Runtime code reads the repository-owned Markdown only through `lib/legal/productLegalMarkdown.ts`; arbitrary URL input never becomes a filesystem path.
