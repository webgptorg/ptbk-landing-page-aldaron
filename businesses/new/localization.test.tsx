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
import { ComparisonTable } from './ComparisonTable';
import { EconomicsCalculator } from './EconomicsCalculator';
import { createCalculationPdfDefinition } from './calculationPdf';
import { COMPARISONS, COMPARISON_ROWS, REBORN_SOURCE } from './comparisons';
import { NewSiteShell } from './NewSiteShell';
import { SCENARIOS, calculateEconomics, type ScenarioId } from './economics';
import { calculationShareUrl, defaultCalculatorState, parseCalculatorState } from './calculatorState';
import { localizedPath, localeFromPath, licencePrice, type SiteLocale } from './localization';
import { displayFieldValue, storedFieldValue } from './localizedCalculator';
vi.mock('next/image', () => ({ default: ({ priority: _priority, ...props }: Record<string, unknown>) => <img {...props}/> }));
vi.mock('./typography', () => ({
    promptbookHeading: { variable: 'font-promptbook-heading' },
    promptbookBody: { variable: 'font-promptbook-body' },
}));
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
        for (const [page, full] of [[<NewLandingPage key="home"/>, false], [<NewLandingPage key="partners" partnership/>, false], [<PricingPage key="pricing"/>, true]] as const) {
            const element = document.createElement('div');
            element.innerHTML = html(page, locale);
            const plans = Array.from(element.querySelectorAll('[data-plan]'), card => card.getAttribute('data-plan'));
            expect(plans).toEqual(full ? ['free', 'start', 'business', 'enterprise'] : ['start', 'business']);
            const start = element.querySelector('[data-plan="start"]')!.textContent!;
            const business = element.querySelector('[data-plan="business"]')!.textContent!;
            expect(start).toContain(locale === 'cs' ? '3 aktivovaní odborní agenti' : '3 active specialist agents');
            expect(start).toContain(full ? (locale === 'cs' ? '1 ovládající uživatel' : '1 controlling user') : (locale === 'cs' ? '1 místo v komunitě Promptbook' : '1 Promptbook community seat'));
            expect(business).toContain(locale === 'cs' ? '10 aktivovaných odborných agentů' : '10 active specialist agents');
            expect(business).toContain(full ? (locale === 'cs' ? '5 ovládajících uživatelů' : '5 controlling users') : (locale === 'cs' ? '10 míst v komunitě Promptbook' : '10 Promptbook community seats'));
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
    it('retains localized legal documents', () => {
        expect(text(<NewLegalPage kind="privacyPolicy" language="en"/>)).toContain('Privacy');
        for (const kind of ['productTerms', 'partnerTerms', 'engineLicense'] as const) {
            const rendered=text(<NewLegalPage kind={kind} language="en"/>);
            expect(rendered).toContain('Version dated');
            expect(rendered).toContain('2026');
            expect(rendered).not.toContain('Návrh k projednání');
        }
    });
    it.each(['cs', 'en'] as const)('compares both Promptbook variants and every alternative by feature in %s', locale => {
        const element = document.createElement('div');
        element.innerHTML = html(<ComparisonTable/>, locale);
        const table = element.querySelector('table')!;
        const columns = Array.from(table.querySelectorAll('thead th[scope="col"]'), cell => cell.textContent);
        expect(columns).toEqual([
            locale === 'cs' ? 'Parametr' : 'Feature', 'Promptbook App', 'Promptbook Open Source',
            ...COMPARISONS.map(item => item.name),
        ]);
        expect(COMPARISONS.length).toBeGreaterThanOrEqual(13);
        for (const { slug } of COMPARISONS) expect(table.querySelector(`thead a[href="/${locale}/srovnani/${slug}"]`)).not.toBeNull();
        const rows = Array.from(table.querySelectorAll('tbody tr'));
        expect(rows).toHaveLength(15);
        for (const row of rows) {
            expect(row.querySelectorAll('th[scope="row"]')).toHaveLength(1);
            expect(row.querySelectorAll('td')).toHaveLength(COMPARISONS.length + 2);
        }
        const technicalLabels = locale === 'cs'
            ? ['Integrace', 'Hesla a přístupy', 'Trust model', 'Ovládání z mobilu', 'AI nástroje a jejich výběr', 'Kde jsou Vaše data', 'AI modely']
            : ['Integrations', 'Passwords and credentials', 'Trust model', 'Mobile and remote control', 'AI tools and selection', 'Where your data lives', 'AI models'];
        for (const label of technicalLabels) {
            const row = rows.find(row => row.querySelector('th')?.textContent === label)!;
            expect(row, label).toBeDefined();
            expect(Array.from(row.querySelectorAll('td')).every(cell => Boolean(cell.textContent?.trim()))).toBe(true);
        }
        const appText = rows.map(row => row.querySelector('td')?.textContent).join(' ');
        for (const term of ['Claude', 'GPT', 'Gemini', 'Qwen', 'Codex', 'Wallet', 'Zero Trust', 'E2E', 'Git']) expect(appText).toContain(term);
        expect(element.textContent).toContain(locale === 'cs' ? 'Externí AI a služby dostávají povolené vstupy.' : 'External AI and services receive authorized inputs.');
        const price = rows.find(row => row.querySelector('th')?.textContent === (locale === 'cs' ? 'Příklad ceny' : 'Example price'))!;
        const paid = price.querySelector('td:nth-child(2)')!;
        const free = price.querySelector('td:nth-child(3)')!;
        expect(paid.textContent).toContain(locale === 'cs' ? '399 Kč' : '$19');
        expect(free.textContent).toContain(locale === 'cs' ? '0 Kč za povolené použití' : '$0 for permitted use');
        expect(price.querySelectorAll('a')).toHaveLength(0);
        expect(element.querySelectorAll('details a[href^="https://"]')).toHaveLength(COMPARISONS.length);
    });
    it.each(['cs', 'en'] as const)('mounts the adviser only in the comparison overview in %s', locale => {
        const overview = document.createElement('div'); overview.innerHTML = html(<ComparisonsPage />, locale);
        expect(overview.querySelector('h1')?.textContent).toBe('Promptbook versus');
        const label = locale === 'cs' ? 'Poradit s výběrem AI' : 'Help me choose an AI tool';
        expect(overview.querySelector(`button[aria-label="${label}"]`)).not.toBeNull();
        const detail = document.createElement('div'); detail.innerHTML = html(<ComparisonPage slug="n8n" />, locale);
        expect(detail.querySelector(`button[aria-label="${label}"]`)).toBeNull();
    });
    it('shows six comparisons and an overview link in the footer and renders sourced details in both languages', () => {
        const shell = document.createElement('div');
        shell.innerHTML = renderToStaticMarkup(<NewSiteShell><div /></NewSiteShell>);
        const nav = shell.querySelector('footer nav[aria-label="Promptbook versus"]');
        expect(Array.from(nav?.querySelectorAll('a') ?? [], link => link.getAttribute('href'))).toEqual([
            '/en/srovnani',
            ...COMPARISONS.slice(0, 6).map(({ slug }) => `/en/srovnani/${slug}`),
        ]);
        expect(nav?.querySelector('a[href="/en/srovnani"]')?.textContent).toBe('Promptbook versus');

        for (const item of COMPARISONS) {
            for (const locale of ['cs', 'en'] as const) {
                const page = document.createElement('div');
                page.innerHTML = html(<ComparisonPage slug={item.slug} />, locale);
                expect(page.querySelector('header a')?.getAttribute('href')).toBe(`/${locale}/srovnani`);
                expect(Array.from(page.querySelectorAll('section > p'), paragraph => paragraph.textContent)).toContain(item.advantage[locale]);
                expect(Array.from(page.querySelectorAll('section > p'), paragraph => paragraph.textContent)).toContain(item.rows.fit[locale]);
                expect(Array.from(page.querySelectorAll('thead th'), cell => cell.textContent)).toEqual([
                    locale === 'cs' ? 'Parametr' : 'Feature',
                    'Promptbook',
                    item.name,
                ]);
                for (const row of Array.from(page.querySelectorAll('tbody tr'))) {
                    expect(Array.from(row.querySelectorAll('td')).every(cell => Boolean(cell.textContent?.trim())), item.slug).toBe(true);
                }
                expect(page.textContent).toContain(locale === 'cs' ? 'Lokální šifrovaný Wallet' : 'Local encrypted Wallet');
                expect(page.textContent).toContain('Zero Trust');
                const sameHosting = item.summary.runtime.status === 'yes';
                expect(page.querySelectorAll('tbody th[scope="row"]').length).toBe(COMPARISON_ROWS.length + Number(sameHosting));
                const advantage = page.querySelectorAll('tbody tr[data-comparison-advantage="true"]');
                expect(advantage).toHaveLength(1);
                expect(Array.from(advantage[0].querySelectorAll('[data-status]'), cell => cell.getAttribute('data-status')))
                    .toEqual(['yes', sameHosting ? 'partial' : 'no']);
                expect(page.querySelector(`a[href="${REBORN_SOURCE}"]`)).not.toBeNull();
                for (const [, href] of item.sources) expect(page.querySelector(`a[href="${href}"]`)).not.toBeNull();
            }
        }
    });
    it.each(['cs', 'en'] as const)('names both a personal laptop and a company server in the %s homepage hero', locale => {
        const element = document.createElement('div');
        element.innerHTML = html(<NewLandingPage/>, locale);
        const hero = element.querySelector('[data-landing-hero]')!;
        expect(hero.textContent).toContain(locale === 'cs'
            ? 'Tým agentů si spustíte na vlastním notebooku nebo firemním serveru.'
            : 'Run your team of agents on your own laptop or a company server.');
        expect(hero.textContent).not.toContain('VPS');
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
