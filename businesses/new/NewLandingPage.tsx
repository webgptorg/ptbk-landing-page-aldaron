import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, CheckCheck, CircleDot, Code2, FileText, GitBranch, Handshake, Layers3, LockKeyhole, MessageSquare, Play, Server, ShieldCheck, Smartphone, Sparkles, Workflow } from 'lucide-react';
import { EconomicsCalculator } from './EconomicsCalculator';
import { APP_PRICES_USD, SCENARIOS } from './economics';
import s from './new.module.css';

const REPO = 'https://github.com/webgptorg/promptbook';
const enquiry = (subject: string) => `mailto:pavol@ptbk.io?subject=${encodeURIComponent(subject)}`;

function Pricing() {
    const plans = [
        { name: 'Starter', price: `${APP_PRICES_USD.starter} $`, tag: 'Na vlastní vyzkoušení', description: 'Pohodlné ovládání bez smluvní podpory.',
            points: ['Webová a mobilní aplikace', '1 připojený server, až 10 agentů', 'Vlastní AI účet a infrastruktura', 'Komunitní podpora bez SLA'], action: 'Mám zájem o Starter' },
        { name: 'Business', price: `${APP_PRICES_USD.business} $`, tag: 'Pro firemní agendu', description: 'Aplikace a podpora pro skutečný provoz.',
            points: ['Licence aplikace pro 1 instanci', 'Podpora aplikace i enginu', 'Rozsah podpory sjednaný předem', 'Nasazení a správa přes partnera'], action: 'Probrat firemní nasazení' },
        { name: 'Individuálně', price: 'Pojďme mluvit', tag: 'Pro náročnější provoz', description: 'Větší rozsah a konkrétní požadavky.',
            points: ['Individuální rozsah a SLA', 'Více instancí a partnerské balíčky', 'Bezpečnostní a provozní požadavky', 'Integrace s vhodným partnerem'], action: 'Probrat požadavky' },
    ];
    return <section id="cenik" className={s.section} aria-labelledby="pricing-title">
        <div className={s.sectionHeading}><span className={s.eyebrow}>JASNÁ CENA TECHNOLOGIE</span>
            <h2 id="pricing-title">Platíte za aplikaci.<br />Ne za přeprodej tokenů.</h2>
            <p>Engine, aplikace a provoz jsou oddělené. Vyberte si pohodlí a úroveň podpory, kterou potřebujete.</p></div>
        <div className={s.pricing}>{plans.map((plan, index) => <article className={`${s.priceCard} ${index === 1 ? s.featured : ''}`} key={plan.name}>
            <span className={s.pill}>{plan.tag}</span><h3>{plan.name}</h3>
            <div className={s.price}>{plan.price}{index < 2 && <span> / měsíc</span>}</div><p>{plan.description}</p>
            <ul>{plan.points.map((point) => <li key={point}><Check size={16} aria-hidden="true" />{point}</li>)}</ul>
            <a className={index === 1 ? s.button : s.secondaryButton} href={enquiry(`Promptbook — ${plan.action}`)}>{plan.action}<ArrowUpRight size={17} aria-hidden="true" /></a>
        </article>)}</div>
        <p className={s.finePrint}>Orientační návrh cen bez DPH. AI, server a služby partnera nejsou v licenci. Konkrétní rozsah podpory, reakční doby a partnerské podmínky sjednáváme předem. Nejde o garanci dostupnosti vašeho serveru ani externích modelů.</p>
        <div className={s.engineStrip}><Code2 size={30} aria-hidden="true" /><div><h3>Otevřený engine. Vlastní provoz.</h3><p>Pro technické uživatele: CLI a API, bez placené aplikace a smluvní podpory. Není to časově omezený SaaS trial. Podmínky bezplatného i produkčního použití určuje <a href={`${REPO}/blob/main/LICENSE.md`}>licence repozitáře</a>.</p></div><a className={s.textLink} href={REPO}>Prohlédnout GitHub <ArrowUpRight size={17} aria-hidden="true" /></a></div>
    </section>;
}

function ActivityPreview({ partnership }: { partnership: boolean }) {
    return <aside className={s.preview} aria-label="Ilustrace fungování agendy">
        <div className={s.previewTop}><span><span className={s.statusDot} />{partnership ? 'Vaše partnerská služba' : 'Vaše obsahová agenda'}</span><span className={s.demoLabel}>Modelová ukázka</span></div>
        <div className={s.previewBody}><div className={s.previewTitle}><span className={s.previewIcon}><Workflow size={26} /></span><div><h2>Práce nekončí odpovědí.</h2><p>Od události k hotovému výsledku.</p></div></div>
            <div className={s.activity}><span className={s.activityIcon}><Play size={16} /></span><div><strong>Nové video na YouTube</strong><p>Agenda zachytí nový podklad.</p></div><CheckCheck size={17} /></div>
            <div className={s.activity}><span className={s.activityIcon}><FileText size={16} /></span><div><strong>Článek a příspěvky</strong><p>Vzniknou návrhy pro web a sociální sítě.</p></div><CheckCheck size={17} /></div>
            <div className={`${s.activity} ${s.activityReview}`}><span className={s.activityIcon}><ShieldCheck size={16} /></span><div><strong>Vaše pravidla. Vaše schválení.</strong><p>Citlivý krok počká na člověka.</p></div><CircleDot size={17} /></div>
            <div className={s.loopLine}><GitBranch size={16} /><span>Výsledek se uloží. Agenda čeká na další událost.</span></div>
        </div><div className={s.previewBottom}><span><Server size={15} /> Váš engine</span><span><LockKeyhole size={14} /> Párování</span><span><Smartphone size={15} /> Vaše aplikace</span></div>
    </aside>;
}

export function NewLandingPage({ partnership = false }: { partnership?: boolean }) {
    const faqs = partnership ? [
        ['Je to affiliate program?', 'Nejen doporučovací odkaz. Partner navrhuje řešení, nasazuje ho a zůstává hlavním kontaktem klienta. Promptbook dodává technologii a sjednanou produktovou podporu.'],
        ['Kdo komu platí?', 'Klient hradí aplikaci Promptbooku, implementaci a servis partnerovi a AI i infrastrukturu vybraným poskytovatelům. Partnerský podíl z licence není další poplatek přidaný klientovi.'],
        ['Z čeho partner vydělává?', 'Z jednorázového nasazení, pravidelného servisu a případně sjednaného podílu z licence. Výši servisu určujete vy. Procento a dobu podílu v kalkulačce berte jako model, ne potvrzené podmínky.'],
        ['Je partnerství i pro freelancery?', 'Ano, má smysl začít jedním dobře zvládnutým nasazením. Důležitější než velikost týmu je schopnost navrhnout bezpečný proces, dodat řešení a dlouhodobě se o klienta starat.'],
        ['Co když klient změní agenturu?', 'Model počítá s klientovým vlastnictvím dat, infrastruktury a účtů. Přístupy, dokumentaci a podmínky předání jinému partnerovi je potřeba nastavit už při implementaci.'],
    ] : [
        ['Čím se agenda liší od chatbota?', 'Chatbot obvykle čeká na otázku. Agenda má dlouhodobý okruh odpovědnosti: přijímá podklady, odbavuje úkoly a vrací se k další práci. Konkrétní oprávnění, spouštění a kontroly nastavíte pro daný proces.'],
        ['Musím rozumět terminálu a repozitáři?', 'Ne při běžné obsluze přes aplikaci. Technické nasazení, připojení účtů a nastavení pravidel s vámi může vyřešit partner. Samotný engine je určený i k samostatnému technickému provozu.'],
        ['Znamená šifrování, že data nikdy nikam neodcházejí?', 'Ne. Oddělení aplikace a enginu neznamená, že externí AI nic neuvidí. Při použití externího modelu dostává jeho poskytovatel data potřebná pro daný úkol. Rozsah závisí na konfiguraci, nástrojích a vašich pravidlech.'],
        ['Nahradí to účetní nebo dohled nad firmou?', 'Automatizujte vymezené kroky, ne odpovědnost. Počítejte s kontrolou výstupů, řešením výjimek a schvalováním citlivých akcí. Kalkulačka proto zahrnuje i zbývající lidskou práci a dohled.'],
        ['Mohu používat jen engine?', 'Ano, bez placené aplikace a bez smluvní podpory podle licence dané verze. Aktuální veřejný repozitář uvádí BUSL-1.1; podmínky pro produkční použití je potřeba ověřit v licenci.'],
    ];
    return <div className={s.page} lang="cs">
        <a className={s.skipLink} href="#obsah">Přejít na obsah</a>
        <header className={s.header}><div className={s.headerInner}>
            <Link href="/new" className={s.logo} aria-label="Promptbook — produkt"><Image src="/logo/promptbook-logo-blue-transparent-128.png" width={34} height={34} alt="" /><span>promptbook<span className={s.logoDot}>.</span></span></Link>
            <nav className={s.nav} aria-label="Hlavní navigace"><Link href="/new" aria-current={!partnership ? 'page' : undefined}>Produkt</Link><Link href="/new/partnership" aria-current={partnership ? 'page' : undefined}>Partnerství</Link><a href="#cenik">Ceník</a><a href="#kalkulacka">Kalkulačka</a></nav>
            <a className={s.headerCta} href={enquiry(partnership ? 'Partnerství s Promptbookem' : 'Nasazení Promptbooku')}>Pojďme se spojit <ArrowUpRight size={16} /></a>
        </div></header>
        <main id="obsah" className={s.container}>
            <section className={s.hero}><div className={s.heroCopy}><span className={s.pill}><span className={s.smallDot} />{partnership ? 'Pro agentury, freelancery a integrátory' : 'Dlouhodobé AI agendy pro firmy'}</span>
                <h1>{partnership ? <>Vaši klienti.<br />Vaše služby.<br /><em>Naše technologie.</em></> : <>AI, která se stará.<br /><em>Nejen odpovídá.</em></>}</h1>
                <p className={s.heroLead}>{partnership ? 'Rozšiřte své služby o AI agendy, které pracují dlouhodobě. Vy dodáte řešení a zůstanete kontaktem klienta. My jsme váš technologický partner.' : 'Doklady, obsah, e-maily nebo údržba webu. Promptbook pomáhá obstarávat opakující se práci na vašem serveru. Vy ji řídíte z přehledné aplikace.'}</p>
                <div className={s.actions}><a className={s.button} href="#kalkulacka">{partnership ? 'Spočítat partnerský přínos' : 'Spočítat náklady a přínos'}<ArrowRight size={18} /></a><Link className={s.secondaryButton} href={partnership ? '/new' : '/new/partnership'}>{partnership ? 'Prohlédnout produkt' : 'Nasazuji řešení klientům'}<ArrowUpRight size={17} /></Link></div>
                <p className={s.heroNote}>{partnership ? 'Vlastní cena implementace a servisu. Oddělená licence pro klienta.' : 'Váš provoz. Vlastní AI účet. Partner, který pomůže s nasazením.'}</p>
            </div><ActivityPreview partnership={partnership} /></section>

            <div className={s.proofStrip}><span><Workflow />Dlouhodobá práce, ne jednorázový chat</span><span><Server />Engine na vaší infrastruktuře</span><span><Handshake />Nasazení s partnerem</span></div>

            {partnership ? <section className={s.section} id="partnerstvi"><div className={s.sectionHeading}><span className={s.eyebrow}>VZTAH S KLIENTEM ZŮSTÁVÁ VÁŠ</span><h2>Vy dodáváte službu.<br />My technologický základ.</h2><p>Neprodáváte jen další licenci. Pomáháte klientovi dlouhodobě zvládat konkrétní část jeho práce.</p></div>
                <div className={s.threeGrid}>{[
                    { icon: Handshake, title: 'Partner', tag: 'Implementace a vztah', text: 'Výběr agendy, nastavení, zaškolení, každodenní komunikace a servis. Své služby a jejich cenu určujete vy.' },
                    { icon: Layers3, title: 'Promptbook', tag: 'Technologie a podpora', text: 'Engine, aplikace a produktová podpora v dohodnutém rozsahu. Produktový problém řešíte s námi.' },
                    { icon: ShieldCheck, title: 'Klient', tag: 'Data a rozhodování', text: 'Vlastní infrastruktura, AI účty a data. Aplikaci platí přímo, citlivé kroky zůstávají pod jeho kontrolou.' },
                ].map(({ icon: Icon, title, tag, text }) => <article className={s.card} key={title}><Icon className={s.cardIcon} /><span className={s.eyebrow}>{tag}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
                <div className={s.callout}><strong>Začněte jedním dobře fungujícím nasazením.</strong><p>Není potřeba předem nakupovat zásobu licencí. Vybereme vhodnou agendu, dohodneme hranice podpory a společně ověříme provoz. Podmínky podílu z licence nastavíme před spoluprací.</p></div>
            </section> : <section className={s.section} id="vyhody"><div className={s.sectionHeading}><span className={s.eyebrow}>MÉNĚ RUTINY. VÍCE KONTROLY.</span><h2>Nepotřebujete další chat.<br />Potřebujete hotovou práci.</h2></div>
                <div className={s.fourGrid}>{[
                    { icon: Workflow, title: 'Práce pokračuje', text: 'Agenda zpracovává další události a úkoly. Nemusíte každý jednotlivý krok znovu zadávat do chatu.' },
                    { icon: Server, title: 'Váš provoz', text: 'Engine pracuje na vašem počítači nebo serveru. Data a pracovní kontext zůstávají ve vašem prostředí.' },
                    { icon: Smartphone, title: 'Přehledná aplikace', text: 'Běžnou práci řídíte přes rozhraní, ne příkazy v terminálu. Engine může fungovat i samostatně.' },
                    { icon: ShieldCheck, title: 'Pravidla předem', text: 'Oprávnění, kontrola a schvalování citlivých kroků patří do návrhu každé agendy. Autonomie není práce bez hranic.' },
                ].map(({ icon: Icon, title, text }) => <article className={s.card} key={title}><Icon className={s.cardIcon} /><h3>{title}</h3><p>{text}</p></article>)}</div>
            </section>}

            <section className={s.section} id="agendy"><div className={s.sectionHeading}><span className={s.eyebrow}>ZAČNĚTE KONKRÉTNÍM PROBLÉMEM</span><h2>Jedna agenda.<br />Méně práce každý měsíc.</h2><p>Příklady procesů k nasazení — ne univerzální automat na všechno. Rozsah a míru samostatnosti nastavíte s partnerem.</p></div>
                <div className={s.twoGrid}>{Object.entries(SCENARIOS).map(([id, scenario], index) => <article className={s.useCase} key={id}><span className={s.caseNumber}>0{index + 1}</span><div><h3>{scenario.title}</h3><p>{scenario.description}</p><span className={s.caseExample}>{scenario.example}</span></div></article>)}</div>
            </section>

            <section className={`${s.section} ${s.architecture}`} id="jak-to-funguje"><div><span className={s.eyebrow}>DVĚ ČÁSTI. JASNÉ HRANICE.</span><h2>Síla enginu.<br />Pohodlí aplikace.</h2><p>Výpočetní práci dělá engine u klienta. Aplikace je ovládací panel. Neprodáváme vám tokeny s přirážkou.</p><a className={s.textLink} href={REPO}>Podívat se pod kapotu <ArrowUpRight size={17} /></a></div>
                <div className={s.architectureCards}><div className={s.architectureCard}><Server /><div><h3>Engine · váš server</h3><p>Agenti, složka nebo repozitář, pracovní kontext a připojené nástroje. Samostatný provoz přes CLI a API.</p></div></div>
                    <div className={s.connection}><LockKeyhole size={15} /> Párování aplikace a enginu · princip end-to-end šifrování</div>
                    <div className={s.architectureCard}><Smartphone /><div><h3>Aplikace · vaše ovládání</h3><p>Webové a mobilní rozhraní. Přehled práce bez nastavování vlastní domény pro ovládací panel.</p></div></div>
                    <p className={s.finePrint}>Při použití externího modelu odcházejí potřebné vstupy jeho poskytovateli, ne přes přeprodej tokenů Promptbookem. Lokální inference je možnost podle schopností modelu a hardwaru, nikoli slib stejného výkonu. Konkrétní bezpečnostní režim ověřte při nasazení.</p>
                </div></section>

            <Pricing />
            <EconomicsCalculator initialMode={partnership ? 'partner' : 'company'} />

            <section className={s.section} aria-labelledby="faq-title"><div className={s.sectionHeading}><span className={s.eyebrow}>BEZ MALÝCH PÍSMENEK</span><h2 id="faq-title">Dobré otázky před začátkem.</h2></div><div className={s.faq}>{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>
            <section className={s.finalCta}><div><span className={s.eyebrow}>{partnership ? 'ZAČNĚME PARTNERSTVÍM' : 'ZAČNĚME JEDNOU AGENDOU'}</span><h2>{partnership ? 'Další služba pro vaše klienty.' : 'Kterou práci už nechcete dělat ručně?'}</h2><p>{partnership ? 'Napište, komu pomáháte a co chcete automatizovat. Najdeme první smysluplné nasazení.' : 'Popište nám proces. Společně ověříme vhodnost a propojíme vás s partnerem pro nasazení.'}</p></div><a className={s.button} href={enquiry(partnership ? 'Chci nasazovat Promptbook klientům' : 'Chci automatizovat firemní agendu')}>Napsat o {partnership ? 'partnerství' : 'nasazení'}<ArrowUpRight size={18} /></a></section>
        </main>
        <footer className={s.footer}><div><strong>promptbook.</strong><p>Technologie pro agendy, které pokračují.</p></div><nav aria-label="Patička"><Link href="/new">Produkt</Link><Link href="/new/partnership">Partnerství</Link><a href={REPO}>GitHub</a><Link href="/privacy">Soukromí</Link><Link href="/cs">Současný web</Link></nav><span>Vytvořeno v Česku.</span></footer>
    </div>;
}
