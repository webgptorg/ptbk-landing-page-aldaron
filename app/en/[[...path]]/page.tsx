import { getInstallationReleases } from '@/lib/releases/catalog';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { NewLandingPage } from '@/businesses/new/NewLandingPage';
import { OpenSourcePage } from '@/businesses/new/OpenSourcePage';
import { AgendasPage, AgendaPage, ComparisonsPage, ComparisonPage, PricingPage, StoryPage, SecurityPage, FaqPage, PageIntro } from '@/businesses/new/InformationPages';
import { EconomicsCalculator } from '@/businesses/new/EconomicsCalculator';
import { CalculatorUrlSync } from '@/businesses/new/CalculatorUrlSync';
import { COMPARISONS } from '@/businesses/new/comparisons';
import { SCENARIOS, type ScenarioId } from '@/businesses/new/economics';
import { newPageMetadata, OPEN_SOURCE_PAGE_COPY, NEW_PAGE_DEFINITIONS, PARTNERSHIP_PAGE_DEFINITIONS, NEW_EN_METADATA, PARTNERSHIP_EN_METADATA } from '@/businesses/new/newMetadata';
import { licencePrice, translate } from '@/businesses/new/localization';
import { NewLegalPage } from '@/businesses/new/NewLegalPage';
import { LEGAL_PAGE_METADATA } from '@/lib/legal/legalPageMetadata';
import s from '@/businesses/new/site.module.css';
const pages: Record<string, [string, string]> = {
    '': [NEW_PAGE_DEFINITIONS.en.title, NEW_PAGE_DEFINITIONS.en.description],
    partnership: [PARTNERSHIP_PAGE_DEFINITIONS.en.title, PARTNERSHIP_PAGE_DEFINITIONS.en.description],
    agendy: ['Choose your workflow', 'Explore email, accounting documents, social content, video and website maintenance workflows.'],
    pricing: ['Pricing and support', `Free for self-installation, Start at ${licencePrice('start', 'en')} and Business at ${licencePrice('business', 'en')} monthly per engine project, custom Enterprise and partner terms.`],
    kalkulacka: ['Cost and benefit calculator', 'Calculate the complete economics of your workflow or partner service. Edit assumptions, share a link and download a PDF.'],
    srovnani: ['Compare AI approaches', 'Compare Promptbook with coding agents, workflow platforms and personal assistants in one table and individual guides.'],
    'o-nas': ['Our story and founders', 'Jiří Jahn and Pavol Hejný, equal cofounders of Promptbook. From website chatbots to ongoing business workflows.'],
    bezpecnost: ['Your data and security', 'Your own working context, end-to-end encrypted controls and clear boundaries for external models and tools.'],
    faq: ['Questions and answers', 'Practical answers about deployment, data, models, licences and support before your first workflow.'],
    soukromi: ['Privacy policy', 'Personal data processing policy of AI Web s.r.o., operator of Promptbook.'],
    podminky: ['Website terms', 'Terms of use for the Promptbook website operated by AI Web s.r.o.'],
    'open-source': [...OPEN_SOURCE_PAGE_COPY.en],
    'podminky-produktu': ['Product terms', 'Current subscription and product support terms.'],
    'partnerske-podminky': ['Partner terms', 'Current agency programme terms.'],
    licence: ['Engine licence', 'Version-specific licensing and commercial terms.'],
};
type Props = { params: Promise<{ path?: string[] }>; searchParams: Promise<{ testimonials?: string | string[] }> };
export function generateStaticParams() {
    return [...Object.keys(pages).map(path => ({ path: path ? path.split('/') : [] })), ...Object.keys(SCENARIOS).map(id => ({ path: ['agendy', id] })), ...COMPARISONS.map(item => ({ path: ['srovnani', item.slug] }))];
}
export async function generateMetadata({ params }: Props) {
    const route = (await params).path ?? [];
    const key = route.join('/');
    if (key === '') return NEW_EN_METADATA;
    if (key === 'partnership') return PARTNERSHIP_EN_METADATA;
    if (key === 'podminky-produktu') return LEGAL_PAGE_METADATA.productTerms.en;
    if (key === 'partnerske-podminky') return LEGAL_PAGE_METADATA.partnerTerms.en;
    if (key === 'licence') return LEGAL_PAGE_METADATA.engineLicense.en;
    if (pages[key]) return newPageMetadata(key, ...pages[key], 'en');
    if (route.length === 2 && route[0] === 'agendy' && Object.hasOwn(SCENARIOS, route[1])) {
        const item = SCENARIOS[route[1] as ScenarioId];
        return newPageMetadata(key, translate(item.title, 'en'), translate(item.description, 'en'), 'en');
    }
    const item = route.length === 2 && route[0] === 'srovnani' ? COMPARISONS.find(item => item.slug === route[1]) : undefined;
    return item ? newPageMetadata(key, `Promptbook versus ${item.name}`, item.advantage.en, 'en') : {};
}
export default async function Page({ params, searchParams }: Props) {
    const route = (await params).path ?? [];
    const key = route.join('/');
    const query = await searchParams;
    if (route.length === 2 && route[0] === 'agendy' && Object.hasOwn(SCENARIOS, route[1])) return <AgendaPage scenarioId={route[1] as ScenarioId}/>;
    if (route.length === 2 && route[0] === 'srovnani' && COMPARISONS.some(item => item.slug === route[1])) return <ComparisonPage slug={route[1]}/>;
    switch (key) {
        case '': return <NewLandingPage showTestimonials={query.testimonials === '1'}/>;
        case 'partnership': return <NewLandingPage partnership/>;
        case 'open-source': return <OpenSourcePage {...getInstallationReleases()} />;
        case 'agendy': return <AgendasPage/>;
        case 'pricing': return <PricingPage/>;
        case 'srovnani': return <ComparisonsPage/>;
        case 'o-nas': return <StoryPage/>;
        case 'bezpecnost': return <SecurityPage/>;
        case 'faq': return <FaqPage/>;
        case 'soukromi': return <NewLegalPage kind="privacyPolicy" language="en"/>;
        case 'podminky': return <NewLegalPage kind="termsAndConditions" language="en"/>;
        case 'podminky-produktu': return <NewLegalPage kind="productTerms" language="en"/>;
        case 'partnerske-podminky': return <NewLegalPage kind="partnerTerms" language="en"/>;
        case 'licence': return <NewLegalPage kind="engineLicense" language="en"/>;
        case 'kalkulacka': return <><PageIntro title="See the whole picture.">Licence, AI, operations, your time and setup. Every assumption in one place.</PageIntro><Suspense fallback={null}><CalculatorUrlSync/></Suspense><div className={s.calculatorPage}><EconomicsCalculator advanced/></div></>;
        default: notFound();
    }
}
