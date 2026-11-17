import { loadProductLegalMarkdown } from './productLegalMarkdown';

/** Authoritative editable text is in legal/community/; migration parity is verified in productLegalMarkdown.test.tsx. */
export const TERMS_AND_CONDITIONS_DOCUMENTS = {
    cs: loadProductLegalMarkdown('community/cs/terms-and-conditions.md'),
    en: loadProductLegalMarkdown('community/en/terms-and-conditions.md'),
} as const;
