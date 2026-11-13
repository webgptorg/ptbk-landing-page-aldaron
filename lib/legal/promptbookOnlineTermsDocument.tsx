import type { LegalDocument } from './legalDocument';
import { PROMPTBOOK_ONLINE_TERMS_V1_DOCUMENT } from './promptbookOnlineTermsV1Document';
import { PROMPTBOOK_ONLINE_TERMS_V2_DOCUMENT } from './promptbookOnlineTermsV2Document';
import { PROMPTBOOK_ONLINE_TERMS_V3_DOCUMENT } from './promptbookOnlineTermsV3Document';
import {
    PROMPTBOOK_ONLINE_TERMS_V1_VERSION,
    PROMPTBOOK_ONLINE_TERMS_V2_VERSION,
    PROMPTBOOK_ONLINE_TERMS_VERSION,
} from './promptbookOnlineTermsVersion';
export const PROMPTBOOK_ONLINE_TERMS_DOCUMENT = PROMPTBOOK_ONLINE_TERMS_V3_DOCUMENT;
export function getPromptbookOnlineTermsDocument(version: string): LegalDocument | null {
    if (version === PROMPTBOOK_ONLINE_TERMS_V1_VERSION) return PROMPTBOOK_ONLINE_TERMS_V1_DOCUMENT;
    if (version === PROMPTBOOK_ONLINE_TERMS_V2_VERSION) return PROMPTBOOK_ONLINE_TERMS_V2_DOCUMENT;
    if (version === PROMPTBOOK_ONLINE_TERMS_VERSION) return PROMPTBOOK_ONLINE_TERMS_V3_DOCUMENT;
    return null;
}
