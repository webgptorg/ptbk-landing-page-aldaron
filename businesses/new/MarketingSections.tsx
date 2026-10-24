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
    const plans = [
        {
            id: 'start' as const,
            name: 'Start',
            purpose: en ? 'Try one agenda in real operations' : 'Vyzkoušejte jednu agendu v provozu',
            period: en ? 'one-off · 30 days' : 'jednorázově · 30 dní',
            features: [
                en ? 'One client environment' : 'Jedno klientské prostředí',
                en ? 'A 30-day production pilot' : 'Produkční pilot na 30 dní',
                en ? 'No automatic renewal' : 'Bez automatické obnovy',
            ],
            support: en ? 'Product support and SLA not included' : 'Bez produktové podpory a SLA',
            note: en ? 'Available once per end client' : 'Jednou pro koncového klienta',
            action: t('Začít se Startem'),
            topic: `${t('Start — produkční pilot')} · ${licencePrice('start', locale)} / ${t('30 dní')}`,
        },
        {
            id: 'business' as const,
            name: 'Business',
            purpose: en ? 'Ongoing operations with product support' : 'Průběžný provoz s produktovou podporou',
            period: en ? 'per month · per client environment' : 'měsíčně · za klientské prostředí',
            features: [
                en ? 'One client environment' : 'Jedno klientské prostředí',
                en ? 'Multiple agents in one environment' : 'Více agentů v jednom prostředí',
                en ? 'No annual commitment' : 'Bez ročního závazku',
            ],
            support: en ? `First substantive response within ${COMMERCIAL_TERMS.responseWorkingHours} working hours` : `První věcná reakce do ${COMMERCIAL_TERMS.responseWorkingHours} pracovních hodin`,
            note: en ? 'Cancel for the next billing period' : 'Ukončení pro další fakturační období',
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
