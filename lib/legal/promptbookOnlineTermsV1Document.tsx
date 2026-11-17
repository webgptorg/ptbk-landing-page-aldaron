import { loadProductLegalMarkdown } from './productLegalMarkdown';

/** Authoritative editable text is in legal/promptbook/; migration parity is verified in productLegalMarkdown.test.tsx. */
export const PROMPTBOOK_ONLINE_TERMS_V1_DOCUMENT = loadProductLegalMarkdown('promptbook/cs/online-terms-2026-11-09-online-v1.md');
