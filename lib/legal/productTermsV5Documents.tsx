import { loadProductLegalMarkdown } from './productLegalMarkdown';

/** Authoritative editable text is in legal/promptbook/; migration parity is verified in productLegalMarkdown.test.tsx. */
export const PRODUCT_TERMS_V5_DOCUMENTS = {
    cs: loadProductLegalMarkdown('promptbook/cs/product-terms-2026-11-03-v5.md'),
    en: loadProductLegalMarkdown('promptbook/en/product-terms-2026-11-03-v5.md'),
} as const;
