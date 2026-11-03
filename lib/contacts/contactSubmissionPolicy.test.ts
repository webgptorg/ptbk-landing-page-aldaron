import { describe, expect, it } from 'vitest';
import { createContactNoticeFields, readContactSubmissionEvidence } from './contactSubmissionPolicy';

describe('purpose-specific public submission evidence', () => {
    it('does not turn an enquiry into newsletter permission', () => {
        const evidence = readContactSubmissionEvidence(createContactNoticeFields('en'), 'PavolPersonalPage-en');
        expect(evidence).toMatchObject({ purpose: 'request', marketingConsent: false, consentText: null, emailVerified: false });
        expect(readContactSubmissionEvidence(createContactNoticeFields('en', true), 'PavolPersonalPage-en')).toBeNull();
    });
    it('requires an explicit choice for the particular newsletter', () => {
        expect(readContactSubmissionEvidence(createContactNoticeFields(), 'newsletter-footer')).toBeNull();
        const evidence = readContactSubmissionEvidence(createContactNoticeFields('cs', true), 'AiTaKrajtaEmailSubscription');
        expect(evidence?.consentText).toContain('AI ta Krajta');
        expect(evidence?.consentText).not.toContain('Neonmedia');
    });
    it('rejects missing, stale or unrecognised notices and sources', () => {
        for (const body of [{}, { ...createContactNoticeFields(), noticeVersion: 'old' }, { ...createContactNoticeFields(), noticeLanguage: 'xx' }]) {
            expect(readContactSubmissionEvidence(body, 'new-website-contact')).toBeNull();
        }
        expect(readContactSubmissionEvidence(createContactNoticeFields(), 'forged-source')).toBeNull();
        expect(readContactSubmissionEvidence(createContactNoticeFields(), '__proto__')).toBeNull();
    });
    it('uses server time and canonical text rather than forged evidence', () => {
        const evidence = readContactSubmissionEvidence({ ...createContactNoticeFields(), receivedAt: '2000', controller: 'Other', noticeText: 'fake', emailVerified: true }, 'new-calculator-pdf', new Date('2026-11-03T15:00:00Z'));
        expect(evidence).toMatchObject({ receivedAt: '2026-11-03T15:00:00.000Z', controller: 'AI Web s.r.o.', purpose: 'pdf', emailVerified: false });
        expect(evidence?.noticeText).not.toContain('fake');
    });
});
