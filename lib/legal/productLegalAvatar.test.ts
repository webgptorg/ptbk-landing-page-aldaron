import { describe, expect, it } from 'vitest';
import { avatarLegalContractSnapshot, loadAvatarLegalDocument } from './productLegalAvatar';

describe('avatar legal editions', () => {
    for (const language of ['cs', 'en'] as const) it(`freezes full supplier and accepted text in ${language}`, () => {
        const snapshot = avatarLegalContractSnapshot(language);
        expect(snapshot.version).toBe('2026-11-17-v1');
        expect(snapshot.seller.companyId).toBe('21012288');
        expect(snapshot.terms.markdown).toContain('AI Web s.r.o.');
        expect(snapshot.privacy.markdown).toContain('privacy@ptbk.io');
        expect(snapshot.terms.markdown.length).toBeGreaterThan(6000);
        expect(snapshot.privacy.markdown.length).toBeGreaterThan(3000);
        expect(loadAvatarLegalDocument('terms', language).document.sections.length).toBe(9);
        expect(loadAvatarLegalDocument('privacy', language).document.sections.length).toBe(7);
    });
    it('never silently substitutes the latest edition for an unknown historical one', () => {
        expect(() => loadAvatarLegalDocument('terms', 'cs', '2030-01-01-v2')).toThrow();
        expect(() => loadAvatarLegalDocument('../privacy' as 'terms', 'cs')).toThrow();
    });
});
