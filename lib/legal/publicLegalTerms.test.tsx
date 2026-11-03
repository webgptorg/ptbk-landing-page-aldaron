import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { NewLegalPage } from '@/businesses/new/NewLegalPage';
import { LEGAL_DOCUMENT_KINDS } from './legalPagePaths';
import { getLegalDocument } from './legalDocuments';

describe('published legal versions', () => {
    it.each(['cs', 'en'] as const)('renders current documents without discussion-draft labels in %s', language => {
        for (const kind of LEGAL_DOCUMENT_KINDS) {
            const document = getLegalDocument(kind, language);
            expect(document.publication?.isDraft).not.toBe(true);
            const html = renderToStaticMarkup(<NewLegalPage kind={kind} language={language}/>);
            expect(html).not.toMatch(/discussion draft|non-effective|neúčinný návrh|návrh k projednání|17\s*%/i);
        }
    });
    it('retains annual payment and mandatory-law protections alongside the uniform rate', () => {
        const html = renderToStaticMarkup(<NewLegalPage kind="partnerTerms" language="cs"/>);
        expect(html).toContain('jednotných 20 %');
        expect(html).toContain('do 30 kalendářních dnů');
        expect(html).toContain('Roční provize se nevyplácí po dvanáctinách');
        expect(html).toContain('již potvrzených obchodů');
        expect(html).toContain('povinné informační povinnosti');
    });
});
