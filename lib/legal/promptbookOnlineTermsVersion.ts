/** Published editions stay available; an order always keeps the edition it accepted. */
export const PROMPTBOOK_ONLINE_TERMS_V1_VERSION = '2026-11-09-online-v1';
export const PROMPTBOOK_ONLINE_TERMS_V2_VERSION = '2026-11-11-online-v2';
export const PROMPTBOOK_ONLINE_TERMS_VERSION = PROMPTBOOK_ONLINE_TERMS_V2_VERSION;
export const PROMPTBOOK_ONLINE_TERMS_VERSIONS = [
    PROMPTBOOK_ONLINE_TERMS_V1_VERSION,
    PROMPTBOOK_ONLINE_TERMS_VERSION,
] as const;

export function getPromptbookOnlineTermsPath(version: string): string | null {
    return PROMPTBOOK_ONLINE_TERMS_VERSIONS.some(edition => edition === version)
        ? `/cs/legal/podminky-produktu/${version}`
        : null;
}

export const PROMPTBOOK_ONLINE_TERMS_PATH = `/cs/legal/podminky-produktu/${PROMPTBOOK_ONLINE_TERMS_VERSION}`;
