import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { NewLandingPage } from '@/businesses/new/NewLandingPage';
import { OpenSourcePage } from '@/businesses/new/OpenSourcePage';
import { AgendasPage, AgendaPage, ComparisonsPage, ComparisonPage, PricingPage, StoryPage, SecurityPage, FaqPage, NewLegalPage, PageIntro } from '@/businesses/new/InformationPages';
import { EconomicsCalculator } from '@/businesses/new/EconomicsCalculator';
import { CalculatorUrlSync } from '@/businesses/new/CalculatorUrlSync';
import { COMPARISONS } from '@/businesses/new/comparisons';
import { SCENARIOS, type ScenarioId } from '@/businesses/new/economics';
import { newPageMetadata, OPEN_SOURCE_PAGE_COPY, NEW_PAGE_DEFINITIONS, PARTNERSHIP_PAGE_DEFINITIONS, NEW_EN_METADATA, PARTNERSHIP_EN_METADATA } from '@/businesses/new/newMetadata';
import { translate } from '@/businesses/new/localization';
import s from '@/businesses/new/site.module.css';
const pages: Record<string, [string, string]> = {
    '': [NEW_PAGE_DEFINITIONS.en.title, NEW_PAGE_DEFINITIONS.en.description],
    partnership: [PARTNERSHIP_PAGE_DEFINITIONS.en.title, PARTNERSHIP_PAGE_DEFINITIONS.en.description],
    agendy: ['Choose your workflow', 'Explore email, accounting documents, social content, video and website maintenance workflows.'],
    cenik: ['Pricing and support', 'Start: $19 for one 30-day pilot. Business: $100 monthly per client environment. Full terms and product support.'],
    kalkulacka: ['Cost and benefit calculator', 'Calculate the complete economics of your workflow or partner service. Edit assumptions, share a link and download a PDF.'],
    srovnani: ['Compare AI approaches', 'Compare Promptbook with coding agents, workflow platforms and personal assistants in one table and individual guides.'],
    'o-nas': ['Our story and founders', 'Jiří Jahn and Pavol Hejný, equal cofounders of Promptbook. From website chatbots to ongoing business workflows.'],
    bezpecnost: ['Your data and security', 'Your own working context, end-to-end encrypted controls and clear boundaries for external models and tools.'],
    faq: ['Questions and answers', 'Practical answers about deployment, data, models, licences and support before your first workflow.'],
    soukromi: ['Privacy policy', 'Personal data processing policy of AI Web s.r.o., operator of Promptbook.'],
    podminky: ['Website terms', 'Terms of use for the Promptbook website operated by AI Web s.r.o.'],
    'open-source': [...OPEN_SOURCE_PAGE_COPY.en],
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
    if (pages[key]) return newPageMetadata(key, ...pages[key], 'en');
    if (route.length === 2 && route[0] === 'agendy' && Object.hasOwn(SCENARIOS, route[1])) {
        const item = SCENARIOS[route[1] as ScenarioId];
        return newPageMetadata(key, translate(item.title, 'en'), translate(item.description, 'en'), 'en');
    }
    const item = route.length === 2 && route[0] === 'srovnani' ? COMPARISONS.find(item => item.slug === route[1]) : undefined;
    return item ? newPageMetadata(key, `Promptbook and ${item.name}`, translate(item.question, 'en'), 'en') : {};
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
        case 'open-source': return <OpenSourcePage/>;
        case 'agendy': return <AgendasPage/>;
        case 'cenik': return <PricingPage/>;
        case 'srovnani': return <ComparisonsPage/>;
        case 'o-nas': return <StoryPage/>;
        case 'bezpecnost': return <SecurityPage/>;
        case 'faq': return <FaqPage/>;
        case 'soukromi': return <NewLegalPage kind="privacyPolicy"/>;
        case 'podminky': return <NewLegalPage kind="termsAndConditions"/>;
        case 'kalkulacka': return <><PageIntro title="See the whole picture.">Licence, AI, operations, your time and setup. Every assumption in one place.</PageIntro><Suspense fallback={null}><CalculatorUrlSync/></Suspense><div className={s.calculatorPage}><EconomicsCalculator advanced/></div></>;
        default: notFound();
    }
}
