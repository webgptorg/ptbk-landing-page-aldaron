import { PROMPTBOOK_SUMMARY } from './comparisons';
import { COMMERCIAL_TERMS } from './commercialTerms';
import { licencePrice, type SiteLocale } from './localization';

export const PUBLIC_ENGINE_SUMMARY = {
    ...PROMPTBOOK_SUMMARY,
    useCase: { cs: 'Vývoj a testování u sebe', en: 'Development and testing on your own host' },
    remote: { cs: 'Lokální Console; použití vzdálené Appky dle licence', en: 'Local Console; remote App use subject to licence', status: 'conditional' as const },
};

export const PUBLIC_ENGINE_TERMS = {
    price: { cs: '0 Kč za povolené použití', en: '$0 for permitted use' },
    billing: { cs: 'Vlastní hosting a AI', en: 'Your hosting and AI' },
    allowance: { cs: 'Bez produktové podpory a SLA', en: 'No product support or SLA' },
    licensing: { cs: 'Veřejná licence dané verze', en: 'Version-specific public licence' },
};

export function getPromptbookAppTerms(locale: SiteLocale) {
    const start = licencePrice('start', locale);
    const business = licencePrice('business', locale);
    const { startCapacity, businessCapacity } = COMMERCIAL_TERMS;
    const agentCount = `${startCapacity.specialists} / ${businessCapacity.specialists}`;
    const userCount = `${startCapacity.users} / ${businessCapacity.users}`;
    return {
        price: { cs: `Start ${start} · Business ${business} za měsíc`, en: `Start ${start} · Business ${business} per month` },
        billing: { cs: 'Za projekt enginu. AI a infrastruktura zvlášť.', en: 'Per engine project. AI and infrastructure separate.' },
        allowance: { cs: `Start / Business: ${agentCount} odborných agentů, ${userCount} uživatelů`, en: `Start / Business: ${agentCount} specialist agents, ${userCount} users` },
        licensing: { cs: 'Produkční licence Start / Business', en: 'Start / Business production licence' },
    };

}
