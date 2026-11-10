// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { SiteLocaleProvider } from './LocaleProvider';
import { LeadCaptureProvider } from './LeadCapture';
import { NewLandingPage } from './NewLandingPage';
import { OpenSourcePage } from './OpenSourcePage';
import { AgendaPage, ComparisonsPage, ComparisonPage, PricingPage, StoryPage, SecurityPage, FaqPage } from './InformationPages';
import { NewLegalPage } from './NewLegalPage';
import { EconomicsCalculator } from './EconomicsCalculator';
import { createCalculationPdfDefinition } from './calculationPdf';
import { COMPARISONS, COMPARISON_ROWS, REBORN_SOURCE } from './comparisons';
import { NewSiteShell } from './NewSiteShell';
import { SCENARIOS, calculateEconomics, type ScenarioId } from './economics';
import { calculationShareUrl, defaultCalculatorState, parseCalculatorState } from './calculatorState';
import { localizedPath, localeFromPath, licencePrice, type SiteLocale } from './localization';
import { displayFieldValue, storedFieldValue } from './localizedCalculator';
vi.mock('./TechnologyIncubation', () => ({ TechnologyIncubation: () => null }));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams(), usePathname: () => '/en' }));
function html(node: ReactNode, locale: SiteLocale = 'en') {
    return renderToStaticMarkup(<SiteLocaleProvider locale={locale}><LeadCaptureProvider>{node}</LeadCaptureProvider></SiteLocaleProvider>);
}
function text(node: ReactNode) { const element = document.createElement('div'); element.innerHTML = html(node); return element.textContent ?? ''; }
// People keep their names in either language; only untranslated surrounding prose is a defect.
const remainingCzech = (value: string) => ['Jiří Jahn', 'Pavol Hejný', 'Jiří', 'Tomáš Studeník', 'Jan Šedo', 'Tereza Texlová', 'VŠEM', 'Šimon Podhajský', 'Šimon', 'Lucie Benešová', 'ŠP'].reduce((text, name) => text.replaceAll(name, ''), value).match(/[^.!?\n]*[čďěňřšťůž][^.!?\n]*/gi) ?? [];
describe('bilingual launch site', () => {
    it('keeps language paths and complete calculation state across language changes', () => {
        expect(localeFromPath('/en/pricing')).toBe('en');
        expect(localeFromPath('/engine')).toBe('cs');
        expect(localizedPath('/en/agendy/social','cs')).toBe('/cs/agendy/social');
        expect(localizedPath('/new/en/agendy/social','cs')).toBe('/cs/agendy/social');
        expect(localizedPath('/','en')).toBe('/en');
        expect(localizedPath('/cs/agendy/email?volume=47#detail','en')).toBe('/en/agendy/email?volume=47#detail');
        expect(localizedPath('/cs/pricing','en')).toBe('/en/pricing');
        expect(localizedPath('/en','cs')).toBe('/cs');
        expect(localizedPath('/new/en/kalkulacka?volume=47#vysledek','cs')).toBe('/cs/kalkulacka?volume=47#vysledek');
        const state=defaultCalculatorState('partner'); state.input.hostingCzk=654; state.input.exchangeRate=24;
        const url=new URL(calculationShareUrl(state,'en'));
        expect(url.pathname).toBe('/en/kalkulacka');
        expect(parseCalculatorState(url.searchParams)).toEqual(state);
    });
    it('shows matching prices and converts editable input units without changing the economic model', () => {
        expect(licencePrice('start','cs').replace(/\s/g,' ')).toBe('399 Kč');
        expect(licencePrice('business','cs').replace(/\s/g,' ')).toBe('1 999 Kč');
        expect(licencePrice('start','en')).toBe('$19');
        expect(licencePrice('business','en')).toBe('$100');
        expect(displayFieldValue('hourlyCost',550,'en',22)).toBe(25);
        expect(storedFieldValue('hourlyCost',25,'en',22)).toBe(550);
        expect(displayFieldValue('inputPriceUsd',3,'cs',22)).toBe(66);
        expect(storedFieldValue('inputPriceUsd',66,'cs',22)).toBe(3);
        expect(displayFieldValue('volume',300,'en',22)).toBe(300);
    });
    it.each(['cs', 'en'] as const)('shares Start and Business while keeping pricing details off the landing pages in %s', locale => {
        for (const [page, full] of [[<NewLandingPage/>, false], [<NewLandingPage partnership/>, false], [<PricingPage/>, true]] as const) {
            const element = document.createElement('div');
            element.innerHTML = html(page, locale);
            const plans = Array.from(element.querySelectorAll('[data-plan]'), card => card.getAttribute('data-plan'));
            expect(plans).toEqual(full ? ['free', 'start', 'business', 'enterprise'] : ['start', 'business']);
            const start = element.querySelector('[data-plan="start"]')!.textContent!;
            const business = element.querySelector('[data-plan="business"]')!.textContent!;
            expect(start).toContain(locale === 'cs' ? '3 aktivovaní odborní agenti' : '3 active specialist agents');
            expect(start).toContain(locale === 'cs' ? '1 ovládající uživatel' : '1 controlling user');
            expect(business).toContain(locale === 'cs' ? '10 aktivovaných odborných agentů' : '10 active specialist agents');
            expect(business).toContain(locale === 'cs' ? '5 ovládajících uživatelů' : '5 controlling users');
            const rates = Array.from(element.querySelectorAll('section[aria-labelledby="business-addons-title"] td')).map(cell => cell.textContent);
            expect(rates).toEqual(full ? (locale === 'cs' ? ['99 Kč', '99 Kč', '49 Kč'] : ['99 CZK', '99 CZK', '49 CZK']) : []);
            if (full) {
                expect(element.querySelector(`[data-plan="free"] a[href="/${locale}/open-source"]`)).not.toBeNull();
                expect(element.querySelector(`#partners a[href="/${locale}/partnership"]`)).not.toBeNull();
            } else {
                expect(element.querySelector(`#cenik a[href="/${locale}/pricing"]`)).not.toBeNull();
            }
        }
    });
    it.each([
        ['home',<NewLandingPage key="home"/>],['partners',<NewLandingPage key="partners" partnership/>],['open-source',<OpenSourcePage key="open-source"/>],['pricing',<PricingPage key="pricing"/>],['story',<StoryPage key="story"/>],['security',<SecurityPage key="security"/>],['FAQ',<FaqPage key="faq"/>],['comparisons',<ComparisonsPage key="comparisons"/>],['calculator',<EconomicsCalculator key="calculator" advanced/>],
        ...Object.keys(SCENARIOS).map(id=>[id,<AgendaPage key={id} scenarioId={id as ScenarioId}/>]),
        ...COMPARISONS.map(item=>[item.slug,<ComparisonPage key={item.slug} slug={item.slug}/>]),
    ])('renders %s in English from the initial render', (_name,node) => {
        expect(remainingCzech(text(node)), String(_name)).toEqual([]);
        const element=document.createElement('div'); element.innerHTML=html(node);
        const links=Array.from(element.querySelectorAll('a[href^="/"]'));
        expect(links.filter(link => !(link.getAttribute('href')?.startsWith('/en') || (
            link.getAttribute('hreflang') === 'cs' && (
                (_name === 'open-source' && link.getAttribute('href') === '/cs/terminal') ||
                (_name === 'home' && /^\/cs\/komunity\/promptbook(?:\/clanky\/cs\/[^/]+)?$/.test(link.getAttribute('href') ?? ''))
            )
        ))).map(link => link.getAttribute('href'))).toEqual([]);
    });
    it('retains localized legal documents and a sourced comparison table with every alternative', () => {
        expect(text(<NewLegalPage kind="privacyPolicy" language="en"/>)).toContain('Privacy');
        for (const kind of ['productTerms', 'partnerTerms', 'engineLicense'] as const) {
            const rendered=text(<NewLegalPage kind={kind} language="en"/>);
            expect(rendered).toContain('Version dated');
            expect(rendered).toContain('2026');
            expect(rendered).not.toContain('Návrh k projednání');
        }
        const element=document.createElement('div');element.innerHTML=html(<ComparisonsPage/>);
        expect(COMPARISONS.length).toBeGreaterThanOrEqual(13);
        expect(element.querySelectorAll('tbody tr').length).toBe(COMPARISONS.length + 1);
        for (const slug of ['grok-bot','openai-dots','meta-muse','chatgpt']) expect(element.querySelector(`a[href="/en/srovnani/${slug}"]`)).not.toBeNull();
        expect(element.querySelectorAll('tbody a[href^="https://"]').length).toBe(COMPARISONS.length);
    });
    it('links every comparison from the footer and renders a sourced head-to-head table in both languages', () => {
        const shell = document.createElement('div');
        shell.innerHTML = renderToStaticMarkup(<NewSiteShell><div /></NewSiteShell>);
        const nav = shell.querySelector('footer nav[aria-label="Promptbook versus"]');
        expect(nav?.querySelectorAll('li').length).toBe(COMPARISONS.length);

        for (const item of COMPARISONS) {
            expect(nav?.querySelector(`a[href="/en/srovnani/${item.slug}"]`)).not.toBeNull();
            for (const locale of ['cs', 'en'] as const) {
                const page = document.createElement('div');
                page.innerHTML = html(<ComparisonPage slug={item.slug} />, locale);
                expect(Array.from(page.querySelectorAll('thead th'), cell => cell.textContent)).toEqual([
                    locale === 'cs' ? 'Parametr' : 'Feature',
                    'Promptbook',
                    item.name,
                ]);
                expect(page.querySelectorAll('tbody th[scope="row"]').length).toBe(COMPARISON_ROWS.length);
                expect(page.querySelector(`a[href="${REBORN_SOURCE}"]`)).not.toBeNull();
                for (const [, href] of item.sources) expect(page.querySelector(`a[href="${href}"]`)).not.toBeNull();
            }
        }
    });
    it('exports the same calculation in localized currency, language and share URL', () => {
        const state=defaultCalculatorState();const before=calculateEconomics(state.input);
        const en=JSON.stringify(createCalculationPdfDefinition(state,'en'));
        const cs=JSON.stringify(createCalculationPdfDefinition(state,'cs'));
        expect(en).toContain('/en/kalkulacka?');expect(en).toContain('$100');expect(en).not.toContain(' Kč');
        expect(cs).toContain('1 999');expect(cs).toContain('Kč');
        expect(remainingCzech(en)).toEqual([]);
        expect(calculateEconomics(state.input)).toEqual(before);
    });
});
