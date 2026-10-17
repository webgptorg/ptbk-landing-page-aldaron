'use client';

import { useSiteLocale } from './LocaleProvider';
import { ArrowRight, Check, LockKeyhole, Server, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { LeadButton } from './LeadCapture';
import { licencePrice } from './localization';
import { COMMERCIAL_TERMS } from './commercialTerms';
import { sitePath } from './siteConfig';
import s from './site.module.css';

export function SecuritySection() {
    const { t, locale, path } = useSiteLocale();

    return <section className={s.security} aria-labelledby="security-title"><div><h2 id="security-title">{t("Vaše data.")}<br />{t("Opravdu vaše.")}</h2><p>{t("Agenti a soubory zůstávají na vašem serveru. Spojení s aplikací chrání end-to-end šifrování.")}</p><Link className={s.textLink} href={path('bezpecnost')}>{t("Jak chráníme vaše data ")}<ArrowRight size={18} /></Link></div><div className={s.securityDiagram}><div className={s.securityNode}><Server size={30} /><div><b>{t("Váš server")}</b></div></div><div className={s.encryptedLine}><LockKeyhole size={17} />{t(" End-to-end šifrovaný přenos")}</div><div className={s.securityNode}><Smartphone size={30} /><div><b>{t("Vaše aplikace")}</b></div></div><p className={s.small}>{t("AI si vybíráte sami. Externí model dostává jen vstupy, které mu vaše agenda odešle.")}</p></div></section>;
}

export function PricingCards({ full = false }: { full?: boolean }) {
    const { t, locale, path } = useSiteLocale();

    return <><div className={s.pricingSummary}>
        <article className={s.priceCard}><h3>{t("Start")}</h3><div className={s.price}>{licencePrice('start', locale)} <span>{t("/ 30 dní jednorázově")}</span></div><p>{t("Vyzkoušejte jednu agendu v reálném provozu.")}</p>{full && <ul>{['Jedno klientské prostředí', 'Bez automatické obnovy', 'Bez produktové podpory a SLA'].map(item => <li key={item}><Check size={16}/>{t(item)}</li>)}</ul>}<LeadButton topic={`${t('Start — produkční pilot')} · ${licencePrice('start',locale)} / ${t('30 dní')}`}>{t("Začít se Startem")}</LeadButton></article>
        <article className={s.priceCard}><h3>{t("Business")}</h3><div className={s.price}>{licencePrice('business', locale)} <span>{t("/ měsíc za klientské prostředí")}</span></div><p>{t("Průběžný provoz s produktovou podporou.")}</p>{full && <ul>{['Více agentů v jednom prostředí', 'Bez ročního závazku', 'První věcná reakce do 16 pracovních hodin'].map(item => <li key={item}><Check size={16}/>{t(item)}</li>)}</ul>}<LeadButton topic={t("Business — firemní provoz Promptbooku")}>{t("Probrat Business")}</LeadButton></article>
    </div><p className={s.priceNote}>{t("Bez DPH. AI, server a práce partnera se platí zvlášť. ")}{!full && <Link className={s.textLink} href={path('cenik')}>{t("Celý ceník a podmínky ")}<ArrowRight size={14}/></Link>}</p>{locale === 'cs' && <p className={s.priceNote}>Přepočet nabídky při 22 Kč/USD. Konečné platební podmínky stanoví objednávka.</p>}</>;
}

export function AudienceSection() {
    const { t, locale, path } = useSiteLocale();

    return <section className={s.section}><div className={s.sectionTitle}><h2>{t("Máte práci, která se pořád vrací?")}</h2></div><div className={s.audience}>
        <div><h3>{t("Pro vás, když…")}</h3><p>{t("Opakovaná práce, vlastní data a jasná pravidla. Nastavení i péči můžete svěřit partnerovi.")}</p></div>
        <div><h3>{t("Spíš ne, když…")}</h3><p>{t("Hledáte jednorázovou odpověď nebo očekáváte bezchybnost bez lidské kontroly.")}</p></div>
    </div></section>;
}

export function ClosingCta({ partner = false }: { partner?: boolean }) {
    const { t, locale, path } = useSiteLocale();

    return <section className={s.ctaBand}><div><h2>{t(partner ? 'Začněme vaším prvním klientem.' : 'Kterou práci předáte jako první?')}</h2><p>{t(partner ? 'Probereme agendu, nasazení i rozdělení péče.' : 'Popište nám svůj proces. Najdeme vhodnou cestu k nasazení.')}</p></div><LeadButton topic={t(partner ? 'Partnerství — první klientská agenda' : 'Konzultace první agendy')}>{t(partner ? 'Probrat partnerství' : 'Pojďme se spojit')}</LeadButton></section>;
}
