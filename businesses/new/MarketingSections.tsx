import { ArrowRight, Check, LockKeyhole, Server, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { LeadButton } from './LeadCapture';
import { COMMERCIAL_TERMS } from './commercialTerms';
import { sitePath } from './siteConfig';
import s from './site.module.css';

export function SecuritySection() {
    return <section className={s.security} aria-labelledby="security-title"><div><h2 id="security-title">Vaše data.<br />Opravdu vaše.</h2><p>Agenti i pracovní soubory běží na vašem serveru. Obsah mezi enginem a aplikací chrání end-to-end šifrování: rozšifruje se až na vašem zařízení.</p><Link className={s.textLink} href={sitePath('bezpecnost')}>Jak chráníme vaše data <ArrowRight size={18} /></Link></div><div className={s.securityDiagram}><div className={s.securityNode}><Server size={30} /><div><b>Váš server</b><span>Agenti · soubory · firemní kontext</span></div></div><div className={s.encryptedLine}><LockKeyhole size={17} /> End-to-end šifrovaný přenos</div><div className={s.securityNode}><Smartphone size={30} /><div><b>Vaše aplikace</b><span>Přehled a ovládání na vašem zařízení</span></div></div><p className={s.small}>AI si vybíráte sami. Externí model dostává jen vstupy, které mu vaše agenda odešle.</p></div></section>;
}

export function PricingCards({ full = false }: { full?: boolean }) {
    return <><div className={s.pricingSummary}>
        <article className={s.priceCard}><h3>Start</h3><div className={s.price}>{COMMERCIAL_TERMS.startUsd} USD <span>/ 30 dní jednorázově</span></div><p>Vyzkoušejte jednu agendu v reálném provozu.</p>{full && <ul>{['Jedno klientské prostředí', 'Bez automatické obnovy', 'Bez produktové podpory a SLA'].map(item => <li key={item}><Check size={16}/>{item}</li>)}</ul>}<LeadButton topic="Start — produkční pilot za 19 USD na 30 dní">Začít se Startem</LeadButton></article>
        <article className={s.priceCard}><h3>Business</h3><div className={s.price}>{COMMERCIAL_TERMS.businessUsd} USD <span>/ měsíc za klientské prostředí</span></div><p>Průběžný provoz s produktovou podporou.</p>{full && <ul>{['Více agentů v jednom prostředí', 'Bez ročního závazku', 'První věcná reakce do 16 pracovních hodin'].map(item => <li key={item}><Check size={16}/>{item}</li>)}</ul>}<LeadButton topic="Business — firemní provoz Promptbooku">Probrat Business</LeadButton></article>
    </div><p className={s.priceNote}>Bez DPH. AI, server a práce partnera se platí zvlášť. {!full && <Link className={s.textLink} href={sitePath('cenik')}>Celý ceník a podmínky <ArrowRight size={14}/></Link>}</p></>;
}

export function AudienceSection() {
    return <section className={s.section}><div className={s.sectionTitle}><h2>Máte práci, která se pořád vrací?</h2><p>Právě tam dává dlouhodobá agenda největší smysl.</p></div><div className={s.audience}>
        <div><h3>Pro vás, když…</h3><p>Se pravidelně vracíte k e-mailům, dokladům, obsahu nebo údržbě webu.</p><p>Chcete mít data pod kontrolou a nastavení i péči svěřit sobě nebo partnerovi.</p></div>
        <div><h3>Spíš ne, když…</h3><p>Potřebujete jen jednorázovou odpověď nebo si chcete popovídat s AI.</p><p>Očekáváte bezchybnost bez pravidel, kontroly citlivých kroků a odpovědného člověka.</p></div>
    </div></section>;
}

export function ClosingCta({ partner = false }: { partner?: boolean }) {
    return <section className={s.ctaBand}><div><h2>{partner ? 'Začněme vaším prvním klientem.' : 'Kterou práci předáte jako první?'}</h2><p>{partner ? 'Probereme agendu, nasazení i rozdělení péče.' : 'Popište nám svůj proces. Najdeme vhodnou cestu k nasazení.'}</p></div><LeadButton topic={partner ? 'Partnerství — první klientská agenda' : 'Konzultace první agendy'}>{partner ? 'Probrat partnerství' : 'Pojďme se spojit'}</LeadButton></section>;
}
