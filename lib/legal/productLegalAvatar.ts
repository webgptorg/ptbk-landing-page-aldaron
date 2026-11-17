import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { loadProductLegalMarkdown, readProductLegalMarkdown } from './productLegalMarkdown';

export const AVATAR_LEGAL_VERSION = '2026-11-17-v1';
export const AVATAR_TERMS_PATH = '/avatar/legal/terms/2026-11-17-v1';
export const AVATAR_PRIVACY_PATH = '/avatar/legal/privacy/2026-11-17-v1';
export const AVATAR_LEGAL_KINDS = ['terms', 'privacy'] as const;
export type AvatarLegalKind = typeof AVATAR_LEGAL_KINDS[number];
type AvatarLegalSeller = {
    legalName: string; companyId: string; address: string; register: string;
};
export function isAvatarLegalKind(kind: string): kind is AvatarLegalKind {
    return AVATAR_LEGAL_KINDS.some((value) => value === kind);
}
export function loadAvatarLegalDocument(
    kind: AvatarLegalKind, language: SupportedHomepageLanguage, version = AVATAR_LEGAL_VERSION,
) {
    if (version !== AVATAR_LEGAL_VERSION || !isAvatarLegalKind(kind) || !['cs', 'en'].includes(language)) {
        throw new Error('Unknown avatar legal edition');
    }
    const relativePath = `pavol-avatar/${language}/${kind}-${version}.md`;
    const document = loadProductLegalMarkdown(relativePath);
    const metadata = JSON.parse(readFileSync(join(process.cwd(), 'legal', relativePath.replace(/\.md$/, '.meta.json')), 'utf8')) as {
        seller: AvatarLegalSeller;
    };
    return {
        title: document.title, markdown: readProductLegalMarkdown(relativePath), document,
        version, seller: metadata.seller, path: `/avatar/legal/${kind}/${version}`,
    };
}
export function avatarLegalContractSnapshot(language: SupportedHomepageLanguage = 'cs') {
    const terms = loadAvatarLegalDocument('terms', language);
    const privacy = loadAvatarLegalDocument('privacy', language);
    return {
        version: AVATAR_LEGAL_VERSION, language, seller: terms.seller,
        terms: { path: terms.path, markdown: terms.markdown },
        privacy: { path: privacy.path, markdown: privacy.markdown },
    };
}
