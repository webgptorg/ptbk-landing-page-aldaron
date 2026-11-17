import { loadProductLegalMarkdown } from './productLegalMarkdown';

/** Authoritative editable text is in legal/promptbook/; migration parity is verified in productLegalMarkdown.test.tsx. */
export const PRIVACY_POLICY_DOCUMENTS = {
    cs: loadProductLegalMarkdown('promptbook/cs/privacy-policy.md'),
    en: loadProductLegalMarkdown('promptbook/en/privacy-policy.md'),
} as const;
