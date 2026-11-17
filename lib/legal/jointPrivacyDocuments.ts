import { loadProductLegalMarkdown } from './productLegalMarkdown';

/** Authoritative editable text is in legal/shared-campaigns/; migration parity is verified in productLegalMarkdown.test.tsx. */
export const JOINT_PRIVACY_DOCUMENTS = {
    cs: loadProductLegalMarkdown('shared-campaigns/cs/joint-processing.md'),
    en: loadProductLegalMarkdown('shared-campaigns/en/joint-processing.md'),
} as const;
