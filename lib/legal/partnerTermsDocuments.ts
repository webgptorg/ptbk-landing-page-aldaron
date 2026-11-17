import { loadProductLegalMarkdown } from './productLegalMarkdown';

/** Authoritative editable text is in legal/promptbook/; migration parity is verified in productLegalMarkdown.test.tsx. */
export const PARTNER_TERMS_DOCUMENTS = {
    cs: loadProductLegalMarkdown('promptbook/cs/partner-terms.md'),
    en: loadProductLegalMarkdown('promptbook/en/partner-terms.md'),
} as const;
