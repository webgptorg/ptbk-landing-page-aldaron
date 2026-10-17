'use client';

import { useSiteLocale } from './LocaleProvider';
import { licencePrice, formatCurrency } from './localization';
import { COMMERCIAL_TERMS } from './commercialTerms';
import Link from 'next/link';
import { ArrowRight, Handshake, Layers, Users } from 'lucide-react';
import { AgendaShowcase } from './AgendaShowcase';
import { EconomicsCalculator } from './EconomicsCalculator';
import { Founders } from './Founders';
import { LeadButton } from './LeadCapture';
import { AudienceSection, ClosingCta, PricingCards, SecuritySection } from './MarketingSections';
import { sitePath } from './siteConfig';
import s from './site.module.css';

export function NewLandingPage({ partnership = false }: { partnership?: boolean }) {
    const { t, locale, path } = useSiteLocale();

    if (partnership) return <>
        <section className={s.hero}><h1>{t("Vaši klienti.")}<br />{t("Vaše služby.")}<br /><em>{t("Naše technologie.")}</em></h1><p>{t("Nabídněte klientům AI agendy, které obstarávají opakovanou práci. Vy dodáváte řešení a zůstáváte jejich kontaktem. My stojíme za technologií.")}</p><div className={s.actions}><LeadButton topic={t("Zájem o partnerskou spolupráci")}>{t("Stát se partnerem")}</LeadButton><a className={s.secondaryButton} href="#kalkulacka">{t("Spočítat můj přínos ")}<ArrowRight size={17}/></a></div></section>
        <section className={s.section}><div className={s.threeColumns}>
            <article className={s.card}><Users/><h3>{t("Klient a vztah jsou vaše")}</h3><p>{t("Navrhnete agendu, nastavíte ji a staráte se o klienta. Cenu implementace a servisu určujete vy.")}</p></article>
            <article className={s.card}><Layers/><h3>{t("Technologie je na nás")}</h3><p>{t("Dodáváme engine, aplikaci a produktovou podporu podle plánu. Nemusíte stavět celou platformu od nuly.")}</p></article>
            <article className={s.card}><Handshake/><h3>{t("Vyděláváte i průběžně")}</h3><p>{t("Vedle vlastní práce získáváte pevný 20% podíl z uhrazených licencí přivedených klientů.")}</p></article>
        </div></section>
        <div className={s.wideLink}><div><h2>{t("20 % pro vás.")}<br />{t("Bez partnerského paušálu.")}</h2><p>{t("Klient platí licenci nám. My vyplácíme podíl vám. Vy navíc fakturujete své služby.")}</p></div><div><div className={s.numberHighlight}>{licencePrice('business', locale)} → {formatCurrency(COMMERCIAL_TERMS.businessUsd * COMMERCIAL_TERMS.displayCzkPerUsd * COMMERCIAL_TERMS.partnerSharePercent / 100, locale)}</div><p className={s.small}>{t("Příklad měsíční platby Business bez DPH a vratek.")}</p></div></div>
        <section className={s.section}><div className={s.sectionTitle}><h2>{t("Jedna dobrá agenda.")}<br />{t("Potom další klient.")}</h2></div><div className={s.storySteps}><article><span>{t("01")}</span><h3>{t("Vyberete proces")}</h3><p>{t("Začněte prací, které rozumíte. Třeba vlastní komunikací nebo obsahem.")}</p></article><article><span>{t("02")}</span><h3>{t("Nastavíte provoz")}</h3><p>{t("S klientem domluvíte přístupy, pravidla, cenu i to, kdo řeší výjimky.")}</p></article><article><span>{t("03")}</span><h3>{t("Dodáváte službu")}</h3><p>{t("Pečujete o agendu a vztah. Osvědčený postup můžete nabídnout dalším klientům.")}</p></article></div></section>
        <EconomicsCalculator initialMode="partner" />
        <section className={s.section}><div className={s.sectionTitle}><h2>{t("Od freelancera po agenturu.")}</h2><p>{t("Velikost týmu nerozhoduje. Důležitá je schopnost dodat klientovi fungující proces a dlouhodobě se o něj starat.")}</p></div><div className={s.audience}><div><h3>{t("Dává smysl")}</h3><p>{t("Máte klienty, znáte jejich opakovanou práci a chcete vedle webu nebo kampaní dodávat průběžnou AI službu.")}</p></div><div><h3>{t("Není to bezpracná provize")}</h3><p>{t("Nasazení a péče něco stojí. Kalkulačka proto odečítá váš čas, akvizici i režii, nejen sčítá tržby.")}</p></div></div></section>
        <div className={s.faq}><details><summary>{t("Jak funguje partnerský podíl?")}</summary><p>{t("20 % ze skutečně uhrazených licenčních plateb bez DPH po odečtení vratek. Pro Start i Business, po dobu placeného užívání a trvání dohody. Podíl se nepočítá z hostingu, AI ani vaší práce. Přiřazení klientů a splatnost stanoví partnerská dohoda.")}</p></details><details><summary>{t("Musím předem kupovat licence?")}</summary><p>{t("Ne. Žádný partnerský paušál ani povinný balík licencí. Klient platí přímo Promptbooku; vlastní produkční používání partnera se řídí stejnou licencí.")}</p></details><details><summary>{t("Chci Promptbook pouze doporučovat.")}</summary><p>{t("Ozvěte se nám a probereme formu spolupráce. Podmínky implementačního partnerství nepřenášíme automaticky na každého tvůrce nebo doporučovací kanál.")}</p><div className={s.actions}><LeadButton secondary topic={t("Doporučování Promptbooku — spolupráce tvůrce")}>{t("Probrat doporučování")}</LeadButton></div></details></div>
        <section className={s.section}><div className={s.wideLink}><div><h3>{t("Stejná technologie. Jasná cena pro klienta.")}</h3><p>Start {licencePrice('start', locale)} {t('na 30 dní. Business')} {licencePrice('business', locale)} {t('měsíčně za klientské prostředí.')}</p></div><Link className={s.textLink} href={path('cenik')}>{t("Ceník a podpora ")}<ArrowRight size={18}/></Link></div></section><ClosingCta partner />
    </>;
    return <>
        <section className={s.hero}><h1>{t("Dřív jste AI úkolovali.")}<br /><em>{t("Teď pracuje pro vás.")}</em></h1><p>{t("E-maily, doklady, obsah a údržba webu. Předáte agendu, nastavíte pravidla a Promptbook se vrací k práci za vás.")}</p><div className={s.actions}><LeadButton>{t("Vybrat první agendu")}</LeadButton><Link className={s.secondaryButton} href={path('partnership')}>{t("Nasazuji řešení klientům ")}<ArrowRight size={17}/></Link></div></section>
        <AgendaShowcase />
        <SecuritySection />
        <AudienceSection />
        <div className={s.wideLink}><div><h3>{t("Ne každý proces potřebuje stejný nástroj.")}</h3><p>{t("Porovnejte Promptbook s vývojovými agenty, workflow platformami a osobními asistenty.")}</p></div><Link className={s.textLink} href={path('srovnani')}>{t("Najít správný přístup ")}<ArrowRight size={18}/></Link></div>
        <section className={s.section} id="cenik"><div className={s.sectionTitle}><h2>{t("Začněte jednou agendou.")}</h2></div><PricingCards /></section>
        <EconomicsCalculator />
        <section className={s.section}><div className={s.sectionTitle}><h2>{t("Za Promptbookem stojíme oba.")}</h2><p>{t("Jiří Jahn a Pavol Hejný. Dva spoluzakladatelé, jeden cíl: aby se AI posunula od odpovědí ke skutečné práci.")}</p><div className={s.actions}><Link className={s.textLink} href={path('o-nas')}>{t("Náš příběh ")}<ArrowRight size={17}/></Link></div></div><Founders /></section>
        <ClosingCta />
    </>;
}
