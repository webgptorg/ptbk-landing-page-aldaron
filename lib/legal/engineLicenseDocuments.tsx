import { loadProductLegalMarkdown } from './productLegalMarkdown';

/** Authoritative editable text is in legal/promptbook/; migration parity is verified in productLegalMarkdown.test.tsx. */
export const ENGINE_LICENSE_DOCUMENTS = {
    cs: loadProductLegalMarkdown('promptbook/cs/engine-license.md'),
    en: loadProductLegalMarkdown('promptbook/en/engine-license.md'),
} as const;
