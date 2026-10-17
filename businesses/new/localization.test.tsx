// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { SiteLocaleProvider } from './LocaleProvider';
import { LeadCaptureProvider } from './LeadCapture';
import { NewLandingPage } from './NewLandingPage';
import { AgendaPage, ComparisonsPage, ComparisonPage, PricingPage, StoryPage, SecurityPage, FaqPage, NewLegalPage } from './InformationPages';
import { EconomicsCalculator } from './EconomicsCalculator';
import { createCalculationPdfDefinition } from './calculationPdf';
import { COMPARISONS } from './comparisons';
import { SCENARIOS, calculateEconomics, type ScenarioId } from './economics';
import { calculationShareUrl, defaultCalculatorState, parseCalculatorState } from './calculatorState';
import { localizedPath, localeFromPath, licencePrice, type SiteLocale } from './localization';
import { displayFieldValue, storedFieldValue } from './localizedCalculator';
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams() }));
function html(node: ReactNode, locale: SiteLocale = 'en') {
    return renderToStaticMarkup(<SiteLocaleProvider locale={locale}><LeadCaptureProvider>{node}</LeadCaptureProvider></SiteLocaleProvider>);
}
function text(node: ReactNode) { const element = document.createElement('div'); element.innerHTML = html(node); return element.textContent ?? ''; }
const remainingCzech = (value: string) => value.replaceAll('Jiří Jahn','').replaceAll('Pavol Hejný','').replaceAll('Jiří','').match(/[^.!?\n]*[čďěňřšťůž][^.!?\n]*/gi) ?? [];
describe('bilingual launch site', () => {
    it('keeps language paths and complete calculation state across language changes', () => {
        expect(localeFromPath('/new/en/cenik')).toBe('en');
        expect(localeFromPath('/new/engine')).toBe('cs');
        expect(localizedPath('/new/en/agendy/social','cs')).toBe('/new/agendy/social');
        const state=defaultCalculatorState('partner'); state.input.hostingCzk=654; state.input.exchangeRate=24;
        const url=new URL(calculationShareUrl(state,'en'));
        expect(url.pathname).toBe('/new/en/kalkulacka');
        expect(parseCalculatorState(url.searchParams)).toEqual(state);
    });
    it('shows matching prices and converts editable input units without changing the economic model', () => {
        expect(licencePrice('start','cs').replace(/\s/g,' ')).toBe('418 Kč');
        expect(licencePrice('business','cs').replace(/\s/g,' ')).toBe('2 200 Kč');
        expect(licencePrice('start','en')).toBe('$19');
        expect(licencePrice('business','en')).toBe('$100');
        expect(displayFieldValue('hourlyCost',550,'en',22)).toBe(25);
        expect(storedFieldValue('hourlyCost',25,'en',22)).toBe(550);
        expect(displayFieldValue('inputPriceUsd',3,'cs',22)).toBe(66);
        expect(storedFieldValue('inputPriceUsd',66,'cs',22)).toBe(3);
        expect(displayFieldValue('volume',300,'en',22)).toBe(300);
    });
    it.each([
        ['home',<NewLandingPage/>],['partners',<NewLandingPage partnership/>],['pricing',<PricingPage/>],['story',<StoryPage/>],['security',<SecurityPage/>],['FAQ',<FaqPage/>],['comparisons',<ComparisonsPage/>],['calculator',<EconomicsCalculator advanced/>],
        ...Object.keys(SCENARIOS).map(id=>[id,<AgendaPage scenarioId={id as ScenarioId}/>]),
        ...COMPARISONS.map(item=>[item.slug,<ComparisonPage slug={item.slug}/>]),
    ])('renders %s in English from the initial render', (_name,node) => {
        expect(remainingCzech(text(node)), String(_name)).toEqual([]);
        const element=document.createElement('div'); element.innerHTML=html(node);
        const links=Array.from(element.querySelectorAll('a[href^="/new"]')).map(a=>a.getAttribute('href'));
        expect(links.every(link=>link?.startsWith('/new/en'))).toBe(true);
    });
    it('retains localized legal documents and a sourced comparison table with all ten alternatives', () => {
        expect(text(<NewLegalPage kind="privacyPolicy"/>)).toContain('Privacy');
        const element=document.createElement('div');element.innerHTML=html(<ComparisonsPage/>);
        expect(element.querySelectorAll('tbody tr').length).toBe(11);
        for (const slug of ['grok-bot','openai-dots','meta-muse','chatgpt']) expect(element.querySelector(`a[href="/new/en/srovnani/${slug}"]`)).not.toBeNull();
        expect(element.querySelectorAll('tbody a[href^="https://"]').length).toBe(10);
    });
    it('exports the same calculation in localized currency, language and share URL', () => {
        const state=defaultCalculatorState();const before=calculateEconomics(state.input);
        const en=JSON.stringify(createCalculationPdfDefinition(state,'en'));
        const cs=JSON.stringify(createCalculationPdfDefinition(state,'cs'));
        expect(en).toContain('/new/en/kalkulacka?');expect(en).toContain('$100');expect(en).not.toContain(' Kč');
        expect(cs).toContain('2 200');expect(cs).toContain('Kč');
        expect(remainingCzech(en)).toEqual([]);
        expect(calculateEconomics(state.input)).toEqual(before);
    });
});
