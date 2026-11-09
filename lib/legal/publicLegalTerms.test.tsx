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
        expect(html).toContain('po všech uplatněných slevách včetně slevových kódů');
        expect(html).toContain('do 30 kalendářních dnů');
        expect(html).toContain('Roční provize se nevyplácí po dvanáctinách');
        expect(html).toContain('již potvrzených obchodů');
        expect(html).toContain('povinné informační povinnosti');
    });
    it.each(['cs', 'en'] as const)('keeps paid capacity subject to approval and inside the original commission window in %s', language => {
        const product = renderToStaticMarkup(<NewLegalPage kind="productTerms" language={language}/>);
        const partner = renderToStaticMarkup(<NewLegalPage kind="partnerTerms" language={language}/>);
        expect(product).toContain('2026-11-03-v5');
        expect(partner).toContain('2026-11-09-v6');
        expect(product).toContain(language === 'cs' ? 'předem výslovně povolit' : 'explicit prior approval');
        expect(product).toContain(language === 'cs' ? 'poměrně podle doby' : 'proportionally to the time');
        expect(product).toContain(language === 'cs' ? 'bez automatického přečerpání' : 'no automatic overage');
        expect(partner).toContain(language === 'cs' ? 'všech placených softwarových příplatků' : 'all paid Promptbook software add-ons');
        expect(partner).toContain(language === 'cs' ? 'upgrade ani přidání kapacity toto okno neobnovují' : 'upgrades and capacity additions do not restart it');
    });
});
