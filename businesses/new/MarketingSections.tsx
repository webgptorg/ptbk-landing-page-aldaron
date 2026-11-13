'use client';

import { useSiteLocale } from './LocaleProvider';
import { ArrowRight, Check, LockKeyhole, Server, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { PurchaseActions } from './PurchaseActions';
import { LeadButton } from './LeadCapture';
import { formatCurrency, licencePrice } from './localization';
import { COMMERCIAL_TERMS } from './commercialTerms';
import s from './site.module.css';
import pricing from './pricing.module.css';

export function SecuritySection() {
    const { t, locale, path } = useSiteLocale();

    return <section className={s.security} aria-labelledby="security-title"><div><h2 id="security-title">{t("Vaše data.")}<br /><span className={s.softHeading}>{t("Opravdu vaše.")}</span></h2><p>{t("Agenti a soubory zůstávají na vašem serveru. Spojení s aplikací chrání end-to-end šifrování.")}</p><Link className={s.textLink} href={path('bezpecnost')}>{t("Jak chráníme vaše data ")}<ArrowRight size={18} /></Link></div><div className={s.securityDiagram}><div className={s.securityNode}><Server size={30} /><div><b>{t("Váš server")}</b></div></div><div className={s.encryptedLine}><LockKeyhole size={17} />{t(" End-to-end šifrovaný přenos")}</div><div className={s.securityNode}><Smartphone size={30} /><div><b>{t("Vaše aplikace")}</b></div></div><p className={s.small}>{t("AI si vybíráte sami. Externí model dostává jen vstupy, které mu vaše agenda odešle.")}</p></div></section>;
}

/** The landing pages show the two subscriptions. The full pricing page also covers self-installation and custom offers. */
export function PricingCards({ full = false, checkoutEnabled = false, showActions = true }: { full?: boolean; checkoutEnabled?: boolean; showActions?: boolean }) {
    const { t, locale, path } = useSiteLocale();
    const en = locale === 'en';
    const canCheckOut = !en && checkoutEnabled;
    const start = COMMERCIAL_TERMS.startCapacity;
    const business = COMMERCIAL_TERMS.businessCapacity;
    const addons = COMMERCIAL_TERMS.businessAddonsCzk;
    const paidPlans = [
        {
            id: 'start' as const,
            name: 'Start',
            amount: licencePrice('start', locale),
            purpose: en ? 'A small team for ongoing work' : 'Menší tým pro průběžnou práci',
            period: en ? 'per month · per engine project' : 'měsíčně · za projekt enginu',
            features: [
                en ? `${start.specialists} active specialist agents` : `${start.specialists} aktivovaní odborní agenti`,
                en ? `${start.users} controlling user` : `${start.users} ovládající uživatel`,
                en ? `${start.harnesses} attached harness instance` : `${start.harnesses} připojená instance harnessu`,
                en ? `${start.browserProfiles} separate browser profile` : `${start.browserProfiles} oddělený webový profil`,
                en ? 'Core and system roles do not use specialist places' : 'Core a systémové role mimo limit odborníků',
                en ? 'Scheduling and continuous operation' : 'Pravidelné spouštění i nepřetržitý provoz',
                en ? '1 Promptbook community seat' : '1 místo v komunitě Promptbook',
            ],
            support: en ? 'Manufacturer support without a guaranteed response time' : 'Podpora výrobce bez garantované reakce',
            note: en ? 'No annual commitment. More capacity by upgrading to Business.' : 'Bez ročního závazku. Další kapacita přechodem na Business.',
            action: canCheckOut
                ? <CheckoutLink plan="start" />
                : <LeadButton secondary className={pricing.action} topic={`Start · ${licencePrice('start', locale)} / ${t('měsíc')}`}>{t('Začít se Startem')}</LeadButton>,
        },
        {
            id: 'business' as const,
            name: 'Business',
            amount: licencePrice('business', locale),
            purpose: en ? 'A larger team with room to grow' : 'Větší tým s prostorem pro růst',
            period: en ? 'per month · per engine project' : 'měsíčně · za projekt enginu',
            features: [
                en ? `${business.specialists} active specialist agents included` : `${business.specialists} aktivovaných odborných agentů v ceně`,
                en ? `${business.users} controlling users included` : `${business.users} ovládajících uživatelů v ceně`,
                en ? 'Harness instances without a licence count limit' : 'Instance harnessů bez licenčního limitu počtu',
                en ? `${business.browserProfiles} separate browser profiles included` : `${business.browserProfiles} oddělených webových profilů v ceně`,
                en ? 'Core and system roles do not use specialist places' : 'Core a systémové role mimo limit odborníků',
                en ? 'Scheduling and continuous operation' : 'Pravidelné spouštění i nepřetržitý provoz',
                en ? '10 Promptbook community seats' : '10 míst v komunitě Promptbook',
            ],
            support: en ? `First substantive response within ${COMMERCIAL_TERMS.responseWorkingHours} working hours` : `První věcná reakce do ${COMMERCIAL_TERMS.responseWorkingHours} pracovních hodin`,
            note: en ? 'No annual commitment. Extra capacity requires your prior approval.' : 'Bez ročního závazku. Rozšíření jen s Vaším předchozím souhlasem.',
            action: !en
                ? <PurchaseActions compact />
                : <LeadButton className={pricing.action} topic={t('Business — firemní provoz Promptbooku')}>{t('Probrat Business')}</LeadButton>,
        },
    ];
    const plans = full ? [
        {
            id: 'free',
            name: en ? 'Public source' : 'Veřejný kód',
            amount: formatCurrency(0, locale),
            purpose: en ? 'Install the public engine in your own environment' : 'Nainstalujte si veřejně dostupný engine u sebe',
            period: en ? 'licence fee for permitted use' : 'licenční poplatek za povolené použití',
            features: en ? ['Development and non-production testing', 'Your own AI and infrastructure', 'Setup and maintenance in your hands'] : ['Vývoj a neprodukční testování', 'Vlastní AI a infrastruktura', 'Nasazení a správa ve Vaší režii'],
            action: <Link className={`${pricing.action} ${pricing.linkAction}`} href={path('open-source')}>{en ? 'Install the engine' : 'Nainstalovat engine'}<ArrowRight size={15} aria-hidden="true"/></Link>,
            note: en ? 'The licence of each version defines the scope of use.' : 'Rozsah použití určuje licence konkrétní verze.',
        },
        ...paidPlans,
        {
            id: 'enterprise',
            name: 'Enterprise',
            amount: en ? 'Custom' : 'Na míru',
            purpose: en ? 'An individual offer for more complex needs' : 'Individuální nabídka pro složitější požadavky',
            period: en ? 'pricing by agreement' : 'cena dle dohody',
            features: en ? ['Scope and capacity for your projects', 'Deployment and support requirements'] : ['Rozsah a kapacita pro Vaše projekty', 'Požadavky na nasazení a podporu'],
            action: <LeadButton secondary className={pricing.action} topic={en ? 'Enterprise — scope and requirements' : 'Enterprise — rozsah a požadavky'}>{en ? 'Discuss requirements' : 'Probrat požadavky'}</LeadButton>,
            note: en ? 'Your order specifies the agreed scope and terms.' : 'Dohodnutý rozsah a podmínky upřesní objednávka.',
        },
    ] : paidPlans;
    const PlanHeading = full ? 'h2' : 'h3';

    return <div className={`${pricing.pricing} ${full ? pricing.full : ''}`}>
        <div className={pricing.plans}>
            {plans.map(plan => <article key={plan.id} className={`${pricing.plan} ${plan.id === 'business' ? pricing.business : ''}`} data-plan={plan.id}>
                <div className={pricing.planHeading}>
                    <PlanHeading>{plan.name}</PlanHeading>
                    <p>{plan.purpose}</p>
                </div>
                <div className={pricing.priceBlock}>
                    <strong className={pricing.amount}>{plan.amount}</strong>
                    <span className={pricing.period}>{plan.period}</span>
                </div>
                {showActions && plan.action}
                <ul className={pricing.features}>
                    {(full ? plan.features : [plan.features[0], locale === 'en' ? `${plan.id === 'business' ? 10 : 1} Promptbook community ${plan.id === 'business' ? 'seats' : 'seat'}` : `${plan.id === 'business' ? 10 : 1} ${plan.id === 'business' ? 'míst' : 'místo'} v komunitě Promptbook`, locale === 'en' ? 'Recurring work in your own environment' : 'Dlouhodobé agendy ve vašem prostředí']).map(feature => <li key={feature}><Check size={17} aria-hidden="true"/><span>{feature}</span></li>)}
                    {full && 'support' in plan && <li className={plan.id === 'start' ? pricing.excluded : ''}>
                        {plan.id === 'start' ? <span className={pricing.dash} aria-hidden="true">—</span> : <Check size={17} aria-hidden="true"/>}
                        <span>{plan.support}</span>
                    </li>}
                </ul>
                <p className={pricing.planNote}>{plan.note}</p>
            </article>)}
        </div>
        <div className={pricing.terms}>
            <p>{en ? 'Excluding VAT. AI, infrastructure and partner services are charged separately.' : 'Bez DPH. AI, infrastruktura a práce partnera se hradí zvlášť.'}</p>
            {!full && <Link href={path('pricing')}>{en ? 'Full pricing and terms' : 'Celý ceník a podmínky'}<ArrowRight size={15} aria-hidden="true"/></Link>}
            {full && canCheckOut && <a href={path('pricing/predplatne')}>Spravovat předplatné<ArrowRight size={15} aria-hidden="true"/></a>}
        </div>
        {full && <div className={pricing.details}>
            <section className={pricing.detail} aria-labelledby="business-addons-title">
                <h2 id="business-addons-title">{en ? 'Business capacity add-ons' : 'Kapacitní příplatky Businessu'}</h2>
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
            </section>
            <section className={pricing.detail} id="partners" aria-labelledby="pricing-partners-title">
                <h2 id="pricing-partners-title">{en ? 'For partners' : 'Pro partnery'}</h2>
                <p>{t(COMMERCIAL_TERMS.share)}</p>
                <p>{t(COMMERCIAL_TERMS.shareTerm)}</p>
                <Link className={s.textLink} href={path('partnership')}>{en ? 'Explore the partner programme' : 'Prohlédnout partnerský program'}<ArrowRight size={15} aria-hidden="true"/></Link>
            </section>
        </div>}
    </div>;
}

/** A full navigation unloads third-party scripts before any billing data is entered. */
function CheckoutLink({ plan }: { readonly plan: 'start' | 'business' }) {
    const { path } = useSiteLocale();
    const isStart = plan === 'start';
    return <a className={`${isStart ? s.secondaryButton : s.button} ${pricing.action}`} href={path(`pricing/objednat/${plan}`)}>
        {isStart ? 'Koupit Start' : 'Koupit Business rovnou'}<ArrowRight size={17} aria-hidden="true" />
    </a>;
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
