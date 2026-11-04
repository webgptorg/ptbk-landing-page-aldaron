'use client';

import { useSiteLocale } from './LocaleProvider';
import { ArrowRight, Check, LockKeyhole, Server, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { LeadButton } from './LeadCapture';
import { licencePrice } from './localization';
import { COMMERCIAL_TERMS } from './commercialTerms';
import { sitePath } from './siteConfig';
import s from './site.module.css';
import pricing from './pricing.module.css';

export function SecuritySection() {
    const { t, locale, path } = useSiteLocale();

    return <section className={s.security} aria-labelledby="security-title"><div><h2 id="security-title">{t("Vaše data.")}<br /><span className={s.softHeading}>{t("Opravdu vaše.")}</span></h2><p>{t("Agenti a soubory zůstávají na vašem serveru. Spojení s aplikací chrání end-to-end šifrování.")}</p><Link className={s.textLink} href={path('bezpecnost')}>{t("Jak chráníme vaše data ")}<ArrowRight size={18} /></Link></div><div className={s.securityDiagram}><div className={s.securityNode}><Server size={30} /><div><b>{t("Váš server")}</b></div></div><div className={s.encryptedLine}><LockKeyhole size={17} />{t(" End-to-end šifrovaný přenos")}</div><div className={s.securityNode}><Smartphone size={30} /><div><b>{t("Vaše aplikace")}</b></div></div><p className={s.small}>{t("AI si vybíráte sami. Externí model dostává jen vstupy, které mu vaše agenda odešle.")}</p></div></section>;
}

/** The same two commercial plans are shown on the product, partner and pricing pages. */
export function PricingCards({ full = false }: { full?: boolean }) {
    const { t, locale, path } = useSiteLocale();
    const en = locale === 'en';
    const start = COMMERCIAL_TERMS.startCapacity;
    const business = COMMERCIAL_TERMS.businessCapacity;
    const addons = COMMERCIAL_TERMS.businessAddonsCzk;
    const plans = [
        {
            id: 'start' as const,
            name: 'Start',
            purpose: en ? 'A small team for ongoing work' : 'Menší tým pro průběžnou práci',
            period: en ? 'per month · per engine project' : 'měsíčně · za projekt enginu',
            features: [
                en ? `${start.specialists} active specialist agents` : `${start.specialists} aktivovaní odborní agenti`,
                en ? `${start.users} controlling user` : `${start.users} ovládající uživatel`,
                en ? `${start.harnesses} attached harness instance` : `${start.harnesses} připojená instance harnessu`,
                en ? `${start.browserProfiles} separate browser profile` : `${start.browserProfiles} oddělený webový profil`,
                en ? 'Core and system roles do not use specialist places' : 'Core a systémové role mimo limit odborníků',
                en ? 'Scheduling and continuous operation' : 'Pravidelné spouštění i nepřetržitý provoz',
            ],
            support: en ? 'Manufacturer support without a guaranteed response time' : 'Podpora výrobce bez garantované reakce',
            note: en ? 'No annual commitment. More capacity by upgrading to Business.' : 'Bez ročního závazku. Další kapacita přechodem na Business.',
            action: t('Začít se Startem'),
            topic: `Start · ${licencePrice('start', locale)} / ${t('měsíc')}`,
        },
        {
            id: 'business' as const,
            name: 'Business',
            purpose: en ? 'A larger team with approved capacity add-ons' : 'Větší tým s povolenými kapacitními příplatky',
            period: en ? 'per month · per engine project' : 'měsíčně · za projekt enginu',
            features: [
                en ? `${business.specialists} active specialist agents included` : `${business.specialists} aktivovaných odborných agentů v ceně`,
                en ? `${business.users} controlling users included` : `${business.users} ovládajících uživatelů v ceně`,
                en ? 'Harness instances without a licence count limit' : 'Instance harnessů bez licenčního limitu počtu',
                en ? `${business.browserProfiles} separate browser profiles included` : `${business.browserProfiles} oddělených webových profilů v ceně`,
                en ? 'Core and system roles do not use specialist places' : 'Core a systémové role mimo limit odborníků',
                en ? 'Scheduling and continuous operation' : 'Pravidelné spouštění i nepřetržitý provoz',
            ],
            support: en ? `First substantive response within ${COMMERCIAL_TERMS.responseWorkingHours} working hours` : `První věcná reakce do ${COMMERCIAL_TERMS.responseWorkingHours} pracovních hodin`,
            note: en ? 'No annual commitment. Extra capacity requires your prior approval.' : 'Bez ročního závazku. Rozšíření jen s Vaším předchozím souhlasem.',
            action: t('Probrat Business'),
            topic: t('Business — firemní provoz Promptbooku'),
        },
    ];

    return <div className={pricing.pricing}>
        <div className={pricing.plans}>
            {plans.map(plan => <article key={plan.id} className={`${pricing.plan} ${plan.id === 'business' ? pricing.business : ''}`} data-plan={plan.id}>
                <div className={pricing.planHeading}>
                    <h3>{plan.name}</h3>
                    <p>{plan.purpose}</p>
                </div>
                <div className={pricing.priceBlock}>
                    <strong className={pricing.amount}>{licencePrice(plan.id, locale)}</strong>
                    <span className={pricing.period}>{plan.period}</span>
                </div>
                <LeadButton secondary={plan.id === 'start'} className={pricing.action} topic={plan.topic}>{plan.action}</LeadButton>
                <ul className={pricing.features}>
                    {plan.features.map(feature => <li key={feature}><Check size={17} aria-hidden="true"/><span>{feature}</span></li>)}
                    <li className={plan.id === 'start' ? pricing.excluded : ''}>
                        {plan.id === 'start' ? <span className={pricing.dash} aria-hidden="true">—</span> : <Check size={17} aria-hidden="true"/>}
                        <span>{plan.support}</span>
                    </li>
                </ul>
                <p className={pricing.planNote}>{plan.note}</p>
            </article>)}
        </div>
        <section className={pricing.addons} aria-labelledby="business-addons-title">
            <h3 id="business-addons-title">{en ? 'Business capacity add-ons' : 'Kapacitní příplatky Businessu'}</h3>
            <div className={pricing.tableScroll}>
                <table>
                    <thead><tr><th scope="col">{en ? 'Capacity above the included allocation' : 'Kapacita nad zahrnutý základ'}</th><th scope="col">{en ? 'Monthly rate, excluding VAT' : 'Měsíční sazba bez DPH'}</th></tr></thead>
                    <tbody>
                        <tr><th scope="row">{en ? 'Additional specialist agent' : 'Další odborný agent'}</th><td>{addons.specialist} {en ? 'CZK' : 'Kč'}</td></tr>
                        <tr><th scope="row">{en ? 'Additional controlling user' : 'Další ovládající uživatel'}</th><td>{addons.user} {en ? 'CZK' : 'Kč'}</td></tr>
                        <tr><th scope="row">{en ? 'Additional separate browser profile' : 'Další oddělený webový profil'}</th><td>{addons.browserProfile} {en ? 'CZK' : 'Kč'}</td></tr>
                    </tbody>
                </table>
            </div>
            <p>{en ? 'Charged proportionally for the time extra capacity is active, with your prior approval and an agreed monthly budget. No automatic overage. The order confirms the billing currency; these approved add-on rates are in CZK.' : 'Poměrně podle doby aktivace další kapacity, s Vaším předchozím souhlasem a dohodnutým měsíčním rozpočtem. Bez automatického přečerpání.'}</p>
            <LeadButton secondary topic={en ? 'Larger project capacity' : 'Větší kapacita projektu'}>{en ? 'Need more capacity? Let’s talk.' : 'Potřebujete větší rozsah? Domluvme se.'}</LeadButton>
        </section>
        <div className={pricing.terms}>
            <p>{en ? 'Excluding VAT. AI, infrastructure and partner services are charged separately.' : 'Bez DPH. AI, infrastruktura a práce partnera se hradí zvlášť.'}</p>
            {!full && <Link href={path('cenik')}>{en ? 'Full pricing and terms' : 'Celý ceník a podmínky'}<ArrowRight size={15} aria-hidden="true"/></Link>}
        </div>
    </div>;
}

export function AudienceSection() {
    const { t, locale, path } = useSiteLocale();

    return <section className={`${s.section} ${s.audienceSection}`}><div className={s.sectionTitle}><h2>{t("Máte práci, která se pořád vrací?")}</h2></div><div className={s.audience}>
        <div><h3>{t("Pro vás, když…")}</h3><p>{t("Opakovaná práce, vlastní data a jasná pravidla. Nastavení i péči můžete svěřit partnerovi.")}</p></div>
        <div><h3>{t("Spíš ne, když…")}</h3><p>{t("Hledáte jednorázovou odpověď nebo očekáváte bezchybnost bez lidské kontroly.")}</p></div>
    </div></section>;
}

export function ClosingCta({ partner = false }: { partner?: boolean }) {
    const { t, locale, path } = useSiteLocale();

    return <section className={s.ctaBand}><div><h2>{t(partner ? 'Začněme vaším prvním klientem.' : 'Kterou práci předáte jako první?')}</h2><p>{t(partner ? 'Probereme agendu, nasazení i rozdělení péče.' : 'Popište nám svůj proces. Najdeme vhodnou cestu k nasazení.')}</p></div><LeadButton topic={t(partner ? 'Partnerství — první klientská agenda' : 'Konzultace první agendy')}>{t(partner ? 'Probrat partnerství' : 'Pojďme se spojit')}</LeadButton></section>;
}
