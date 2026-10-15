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
    if (partnership) return <>
        <section className={s.hero}><h1>Vaši klienti.<br />Vaše služby.<br /><em>Naše technologie.</em></h1><p>Nabídněte klientům AI agendy, které obstarávají opakovanou práci. Vy dodáváte řešení a zůstáváte jejich kontaktem. My stojíme za technologií.</p><div className={s.actions}><LeadButton topic="Zájem o partnerskou spolupráci">Stát se partnerem</LeadButton><a className={s.secondaryButton} href="#kalkulacka">Spočítat můj přínos <ArrowRight size={17}/></a></div></section>
        <section className={s.section}><div className={s.threeColumns}>
            <article className={s.card}><Users/><h3>Klient a vztah jsou vaše</h3><p>Navrhnete agendu, nastavíte ji a staráte se o klienta. Cenu implementace a servisu určujete vy.</p></article>
            <article className={s.card}><Layers/><h3>Technologie je na nás</h3><p>Dodáváme engine, aplikaci a produktovou podporu podle plánu. Nemusíte stavět celou platformu od nuly.</p></article>
            <article className={s.card}><Handshake/><h3>Vyděláváte i průběžně</h3><p>Vedle vlastní práce získáváte pevný 20% podíl z uhrazených licencí přivedených klientů.</p></article>
        </div></section>
        <div className={s.wideLink}><div><h2>20 % pro vás.<br />Bez partnerského paušálu.</h2><p>Klient platí licenci nám. My vyplácíme podíl vám. Vy navíc fakturujete své služby.</p></div><div><div className={s.numberHighlight}>100 → 20 USD</div><p className={s.small}>Příklad měsíční platby Business bez DPH a vratek.</p></div></div>
        <section className={s.section}><div className={s.sectionTitle}><h2>Jedna dobrá agenda.<br />Potom další klient.</h2></div><div className={s.storySteps}><article><span>01</span><h3>Vyberete proces</h3><p>Začněte prací, které rozumíte. Třeba vlastní komunikací nebo obsahem.</p></article><article><span>02</span><h3>Nastavíte provoz</h3><p>S klientem domluvíte přístupy, pravidla, cenu i to, kdo řeší výjimky.</p></article><article><span>03</span><h3>Dodáváte službu</h3><p>Pečujete o agendu a vztah. Osvědčený postup můžete nabídnout dalším klientům.</p></article></div></section>
        <EconomicsCalculator initialMode="partner" />
        <section className={s.section}><div className={s.sectionTitle}><h2>Od freelancera po agenturu.</h2><p>Velikost týmu nerozhoduje. Důležitá je schopnost dodat klientovi fungující proces a dlouhodobě se o něj starat.</p></div><div className={s.audience}><div><h3>Dává smysl</h3><p>Máte klienty, znáte jejich opakovanou práci a chcete vedle webu nebo kampaní dodávat průběžnou AI službu.</p></div><div><h3>Není to bezpracná provize</h3><p>Nasazení a péče něco stojí. Kalkulačka proto odečítá váš čas, akvizici i režii, nejen sčítá tržby.</p></div></div></section>
        <div className={s.faq}><details><summary>Jak funguje partnerský podíl?</summary><p>20 % ze skutečně uhrazených licenčních plateb bez DPH po odečtení vratek. Pro Start i Business, po dobu placeného užívání a trvání dohody. Podíl se nepočítá z hostingu, AI ani vaší práce. Přiřazení klientů a splatnost stanoví partnerská dohoda.</p></details><details><summary>Musím předem kupovat licence?</summary><p>Ne. Žádný partnerský paušál ani povinný balík licencí. Klient platí přímo Promptbooku; vlastní produkční používání partnera se řídí stejnou licencí.</p></details><details><summary>Chci Promptbook pouze doporučovat.</summary><p>Ozvěte se nám a probereme formu spolupráce. Podmínky implementačního partnerství nepřenášíme automaticky na každého tvůrce nebo doporučovací kanál.</p><div className={s.actions}><LeadButton secondary topic="Doporučování Promptbooku — spolupráce tvůrce">Probrat doporučování</LeadButton></div></details></div>
        <section className={s.section}><div className={s.wideLink}><div><h3>Stejná technologie. Jasná cena pro klienta.</h3><p>Start 19 USD na 30 dní. Business 100 USD měsíčně za klientské prostředí.</p></div><Link className={s.textLink} href={sitePath('cenik')}>Ceník a podpora <ArrowRight size={18}/></Link></div></section><ClosingCta partner />
    </>;
    return <>
        <section className={s.hero}><h1>Dřív jste AI úkolovali.<br /><em>Teď pracuje pro vás.</em></h1><p>E-maily, doklady, obsah a údržba webu. Předáte agendu, nastavíte pravidla a Promptbook se vrací k práci za vás.</p><div className={s.actions}><LeadButton>Vybrat první agendu</LeadButton><Link className={s.secondaryButton} href={sitePath('partnership')}>Nasazuji řešení klientům <ArrowRight size={17}/></Link></div></section>
        <AgendaShowcase />
        <SecuritySection />
        <AudienceSection />
        <div className={s.wideLink}><div><h3>Ne každý proces potřebuje stejný nástroj.</h3><p>Porovnejte Promptbook s vývojovými agenty, workflow platformami a osobními asistenty.</p></div><Link className={s.textLink} href={sitePath('srovnani')}>Najít správný přístup <ArrowRight size={18}/></Link></div>
        <section className={s.section} id="cenik"><div className={s.sectionTitle}><h2>Začněte jednou agendou.</h2></div><PricingCards /></section>
        <EconomicsCalculator />
        <section className={s.section}><div className={s.sectionTitle}><h2>Za Promptbookem stojíme oba.</h2><p>Jiří Jahn a Pavol Hejný. Dva spoluzakladatelé, jeden cíl: aby se AI posunula od odpovědí ke skutečné práci.</p><div className={s.actions}><Link className={s.textLink} href={sitePath('o-nas')}>Náš příběh <ArrowRight size={17}/></Link></div></div><Founders /></section>
        <ClosingCta />
    </>;
}
