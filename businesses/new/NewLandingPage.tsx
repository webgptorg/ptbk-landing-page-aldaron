import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, BookOpen, Check, Code2, FileText, Handshake, Layers3, LockKeyhole, Mail, Server, ShieldCheck, Smartphone, Workflow } from 'lucide-react';
import { EconomicsCalculator } from './EconomicsCalculator';
import { SCENARIOS } from './economics';
import { COMMERCIAL_TERMS as terms, PRODUCT_AVAILABILITY, ENGINE_REPOSITORY, enquiry } from './commercialTerms';
import s from './new.module.css';
import u from './refresh.module.css';

function Pricing() {
    const plans = [
        { name: 'Start', price: terms.startUsd, period: 'za 30 dní · jednorázově', tag: 'Ověřte jednu agendu',
            description: 'Produkční pilot pro jednoho koncového klienta.',
            points: ['Jedna klientská instance na dobu pilotu', 'Dostupný jednou pro koncového klienta', 'Bez produktové podpory Promptbooku a bez SLA', 'Bez automatické obnovy nebo přechodu na Business'], action: 'Domluvit Start' },
        { name: 'Business', price: terms.businessUsd, period: 'měsíčně za instanci', tag: 'Průběžný firemní provoz',
            description: 'Komerční licence a první posouzení problémů platformy.',
            points: ['Jedna klientská instance po dobu předplatného', 'První věcná reakce do 16 pracovních hodin', 'Měsíčně, bez ročního závazku', 'Ukončení pro další fakturační období'], action: 'Probrat Business' },
    ];
    return <section id="cenik" className={s.section} aria-labelledby="pricing-title">
        <div className={s.sectionHeading}><span className={s.eyebrow}>DVA PLÁNY. ODDĚLENÉ NÁKLADY.</span>
            <h2 id="pricing-title">Licence pro firemní AI agenty.</h2>
            <p>Klient platí licenci přímo Promptbooku. Návrh řešení a práci platí zvlášť agentuře. Neprodáváme spravovaný hosting ani kompletní koncovou službu.</p>
        </div>
        <div className={s.twoGrid}>{plans.map((plan) => <article key={plan.name} className={`${s.priceCard} ${plan.name === 'Business' ? s.featured : ''}`}>
            <span className={s.pill}>{plan.tag}</span><h3>{plan.name}</h3>
            <div className={s.price}>{plan.price} USD</div><p className={u.pricePeriod}>{plan.period} · bez DPH</p>
            <p>{plan.description}</p><ul>{plan.points.map((point) => <li key={point}><Check size={16} aria-hidden="true" />{point}</li>)}</ul>
            <a className={plan.name === 'Business' ? s.button : s.secondaryButton} href={enquiry(`Promptbook — ${plan.action}`)}>{plan.action}<ArrowUpRight size={17} /></a>
        </article>)}</div>
        <div className={s.callout}><strong>Instance není server. Ani jeden agent.</strong><p>{terms.instance}</p></div>
        <p className={s.finePrint}>Start se po 30 dnech neobnovuje. Pokračování v rámci této komerční licence vyžaduje objednání Business. Návrh nabídky v1.0 z 15. října 2026 nenahrazuje licenční smlouvu ani partnerskou dohodu.</p>
        <details className={s.inputDetails}><summary>Co není v ceně licence?</summary>
            <p>{terms.exclusions} Hradí je klient, případně agentura nebo provozní partner podle dohody.</p>
            <p>Předplatné nezahrnuje správu serveru, instalaci aktualizací, zakázkový vývoj ani neomezené konzultace. Aktualizace se přebírají ze standardně zveřejňovaných vydání; nejde o samostatnou distribuci nebo individuální plán oprav.</p>
        </details>
        <div className={s.engineStrip}><Code2 size={30} aria-hidden="true" /><div><h3>Veřejný kód a vlastní nasazení</h3>
            <p>{terms.publicLicence}</p><details><summary>Jak je to s produkčním provozem?</summary><p>{terms.productionLicence}</p></details>
        </div><a className={s.textLink} href={`${ENGINE_REPOSITORY}/blob/main/LICENSE.md`}>Veřejná licence <ArrowUpRight size={17} /></a></div>
        <p className={s.finePrint}>Více instancí nebo nestandardní požadavky? <a href={enquiry('Promptbook — individuální rozsah')}>Domluvme individuální nabídku.</a> Nepřetržitou podporu nenabízíme.</p>
    </section>;
}

function Support() {
    return <section id="podpora" className={s.section} aria-labelledby="support-title">
        <div className={s.sectionHeading}><span className={s.eyebrow}>PROVOZ NENÍ TOTÉŽ CO PODPORA</span>
            <h2 id="support-title">Jasně dané hranice péče.</h2><p>Agenti mohou pracovat na pozadí i v noci. To neznamená nepřetržitou podporu Promptbooku.</p>
        </div>
        <div className={s.twoGrid}><article className={s.card}><Handshake className={s.cardIcon} />
            <h3>Agentura je první kontakt</h3><p>Běžné uživatelské dotazy a péči o konkrétní řešení zajišťuje agentura podle dohody s klientem. Za každou instanci komunikuje s Promptbookem jeden pověřený technický kontakt, typicky z agentury.</p>
        </article><article className={s.card}><ShieldCheck className={s.cardIcon} />
            <h3>Business: {terms.responseWorkingHours} pracovních hodin</h3><p>{terms.support}</p>
            <p>Hlášení na <a href={`mailto:${terms.contact}`}>{terms.contact}</a>. {terms.supportWindow}</p>
        </article></div>
        <p className={s.finePrint}>{terms.supportLimits} Start produktovou podporu ani SLA neobsahuje.</p>
    </section>;
}

function PartnershipModel() {
    return <section className={s.section} id="partnerstvi">
        <div className={s.sectionHeading}><span className={s.eyebrow}>VAŠE SLUŽBA. NÁŠ TECHNOLOGICKÝ ZÁKLAD.</span>
            <h2>Z jednorázové zakázky<br />k dlouhodobé spolupráci.</h2>
            <p>Začněte vlastní agendou, ověřte ji v pilotu a potom ji nasaďte klientovi. Za řešení a běžnou péči jedná s klientem vaše agentura, ne Promptbook.</p>
        </div>
        <div className={s.threeGrid}>
            <article className={s.card}><Handshake className={s.cardIcon} /><h3>Partner dodává řešení</h3><p>Výběr agendy, návrh, instalace, integrace, školení a průběžná péče. Svou práci a servis si naceníte sami.</p></article>
            <article className={s.card}><Layers3 className={s.cardIcon} /><h3>Promptbook dodává software</h3><p>Komerční licenci a u Business první posouzení hlášených problémů platformy. Ne správu serveru nebo neomezené konzultace.</p></article>
            <article className={s.card}><Server className={s.cardIcon} /><h3>Klient má vlastní prostředí</h3><p>Licenci platí přímo Promptbooku, práci zvlášť agentuře. Úhradu AI a infrastruktury si dohodne s agenturou nebo provozním partnerem.</p></article>
        </div>
        <div className={s.callout}><strong>Promptbook platí podíl agentuře. Ne naopak.</strong><p>Žádný partnerský paušál ani povinný nákup balíku klientských licencí. Když agentura používá Promptbook pro svůj vlastní produkční provoz, je sama koncovým klientem podle podmínek licence.</p></div>
        <div className={s.twoGrid}>
            <article className={s.card}><span className={s.eyebrow}>PODÍL Z LICENCE</span><h3>{terms.partnerSharePercent} % pro partnera</h3><p>{terms.share}</p><p>{terms.shareTerm}</p></article>
            <article className={s.card}><span className={s.eyebrow}>PŘÍKLAD BEZ DPH A VRATEK</span><h3>100 USD → 20 USD</h3><p>Jeden uhrazený Business: klient zaplatí 100 USD Promptbooku, Promptbook vyplatí 20 USD agentuře. Jeden uhrazený Start: z 19 USD náleží partnerovi 3,80 USD.</p><p>Implementace a pravidelný servis jsou vaše další, samostatně účtované příjmy. Tržby nejsou zisk — kalkulačka odečítá i vaše náklady.</p></article>
        </div>
        <details className={s.inputDetails}><summary>Doporučujete Promptbook obsahem, ale nenasazujete ho?</summary>
            <p>Strategie počítá také s doporučováním přes tvůrce a další agentury. Samoobslužný affiliate program se připravuje; registraci, přiřazování a podmínky pro tvůrce zatím domlouváme individuálně. Nenahrazuje implementační partnerství.</p>
            <a className={s.textLink} href={enquiry('Promptbook — doporučování a spolupráce s tvůrci')}>Probrat doporučování <ArrowUpRight size={17} /></a>
        </details>
    </section>;
}

function HowItWorks() {
    return <section id="jak-to-funguje" className={s.section}>
        <div className={s.sectionHeading}><span className={s.eyebrow}>PROČ PROMPTBOOK</span><h2>Jednou napíšete knihu.<br />Práce podle ní pokračuje.</h2>
            <p>Komunikace s účetní, e-maily, obsah nebo údržba webu drží firmu při životě. Nemusí vám ale zabrat všechen čas na práci, která ji posouvá dál.</p>
        </div>
        <div className={s.threeGrid}>{[
            [BookOpen, '01 · Napíšete knihu', 'S partnerem popíšete firemní kontext, pravidla a konkrétní práci, která se má dělat.'],
            [Workflow, '02 · Promptbook pracuje', 'Agenti zpracovávají nastavenou agendu na pozadí. Nemusíte každý úkol znovu předávat do chatu.'],
            [FileText, '03 · Vidíte výsledky', 'Máte přehled o provedené práci. Agent se ptá u kroků, pro které nastavíte schvalování.'],
        ].map(([Icon, title, text]) => {
            const StepIcon = Icon as typeof BookOpen;
            return <article className={s.card} key={String(title)}><StepIcon className={s.cardIcon} /><h3>{String(title)}</h3><p>{String(text)}</p></article>;
        })}</div>
    </section>;
}

function UseCases() {
    return <section id="agenti" className={s.section}>
        <div className={s.sectionHeading}><span className={s.eyebrow}>DEJTE KAŽDÉMU AGENTOVI PRÁCI</span><h2>Začněte tím, co vás brzdí.</h2>
            <p>E-maily, obsah z videa a účetní podklady jsou první okruhy. Rozsah, přístupy a pravidla konkrétního nasazení stanovíte s partnerem.</p></div>
        <div className={s.twoGrid}>{Object.entries(SCENARIOS).map(([key, scenario], index) => <article id={`agent-${key}`} className={s.useCase} key={key}>
            <span className={s.caseNumber}>0{index + 1}</span><div><h3>{scenario.title}</h3><p>{scenario.description}</p>
                <details className={u.caseDetail}><summary>Jak může agenda vypadat</summary><p>{scenario.example}</p>
                    <p>Nejde o hotový konektor pro každý uvedený systém ani o ověřování správnosti mimo kód. Dostupné připojení a lidskou kontrolu ověřte v pilotu.</p>
                    <a className={s.textLink} href="#kalkulacka">Spočítat celý provoz <ArrowRight size={16} /></a>
                </details>
            </div>
        </article>)}</div>
    </section>;
}

function ControlAndAvailability() {
    return <>
        <section className={`${s.section} ${s.architecture}`} id="kontrola">
            <div><span className={s.eyebrow}>MODELY SE MĚNÍ. KONTEXT ZŮSTÁVÁ.</span><h2>Vaše pravidla.<br />Vaše firemní soubory.</h2>
                <p>Agenti a jejich kontext jsou uložené v prostředí firmy. Model vybíráte podle úkolu; nejste vázaní na jednoho dodavatele.</p>
                <a className={s.textLink} href={ENGINE_REPOSITORY}>Prohlédnout veřejné jádro <ArrowUpRight size={17} /></a>
            </div>
            <div className={s.architectureCards}>
                <div className={s.architectureCard}><ShieldCheck /><div><h3>Co smí a kdy se ptá</h3><p>Nastavte oprávnění, rozpočet a schvalování. Návrh a odeslání jsou odlišné kroky. Průběh práce musí zůstat dohledatelný a provoz musí jít zastavit.</p></div></div>
                <div className={s.architectureCard}><Server /><div><h3>Engine pracuje u klienta</h3><p>Vlastní soubory, firemní znalosti a nástroje. Provoz není závislý na otevřeném okně aplikace; počítač nebo server s enginem ale musí běžet.</p></div></div>
                <div className={s.architectureCard}><Smartphone /><div><h3>Aplikace se připravuje</h3><p>Připravované webové a mobilní ovládání od MangoWebu má usnadnit obsluhu netechnickým lidem. Dnes ho neprodáváme jako již dostupné rozhraní.</p></div></div>
                <p className={s.finePrint}><LockKeyhole size={15} /> Párování a end-to-end šifrované spojení patří do návrhu připravované aplikace. Její finální datový tok je potřeba ověřit. Při použití externí AI dostává poskytovatel modelu potřebné vstupy přímo z enginu; vlastní soubory neznamenají, že data nikdy neopustí firmu. Lokální model závisí na schopnostech hardwaru a modelu.</p>
            </div>
        </section>
        <section id="dostupnost" className={s.section}>
            <div className={s.sectionHeading}><span className={s.eyebrow}>DNES · BRZY · VIZE</span><h2>Co je k dispozici a co teprve přijde.</h2></div>
            <div className={s.threeGrid}>
                <article className={s.card}><span className={u.status}>Dnes</span><h3>Engine a firemní kontext</h3><p>Dlouhodobé agendy, pravidla a kontext v souborech, výběr modelu a ovládání přes terminál. Konkrétní proces si ověříte v pilotu s partnerem.</p></article>
                <article className={s.card}><span className={u.status}>Připravujeme</span><h3>Aplikace a doporučování</h3><p>{PRODUCT_AVAILABILITY.app}</p><p>Připravuje se také samoobslužný program pro doporučování. Aktuálně se partnerství domlouvá přímo.</p></article>
                <article className={s.card}><span className={u.status}>Vize, ne dostupná funkce</span><h3>Vlastní agenti v každé firmě</h3><p>Stejně samozřejmí jako firemní web. Do budoucna také katalog agentů a agenda, která si sama najde další práci. Dnes tyto schopnosti neslibujeme.</p></article>
            </div>
        </section>
    </>;
}

function Faq({ partnership }: { partnership: boolean }) {
    const common = [
        ['Je to další chatbot?', 'Chat čeká na další zprávu. Promptbook dostává kontext, pravidla a vymezenou agendu, podle kterých pracuje dlouhodobě. Nejde o slib, že si dnes agent sám najde libovolnou práci.'],
        ['Musím umět programovat nebo terminál?', 'Dnes se engine ovládá přes terminál a nasazení vyžaduje technické nastavení. To s klientem řeší partner. Aplikace od MangoWebu pro netechnickou obsluhu se připravuje; registrace do ní zatím není součástí této nabídky.'],
        ['Kam jdou firemní data?', 'Agenti a kontext jsou ve vlastních souborech v prostředí klienta. Externí model a připojené služby ale mohou dostávat vstupy potřebné pro práci. Vlastní provoz ani plánované šifrování aplikace nejsou slib, že žádná data nikdy neopustí firmu.'],
        ['Jaký model si mohu vybrat?', 'Promptbook není svázaný s jedním poskytovatelem. Konkrétní dostupný model, včetně lokálního, zvolte podle podpory v enginu, kvality a kapacity. AI náklady nejsou v licenci Promptbooku.'],
        ['Poběží to i s vypnutým počítačem?', 'Ano, pokud engine běží na jiném zapnutém serveru. Pokud je vypnutý stroj, na kterém engine běží, agenti nepracují. Provoz na pozadí není garance dostupnosti infrastruktury.'],
        ['Co když AI udělá chybu?', 'Pravidla a schvalování nastavte podle rizika. Běžnou péči a výjimky řešíte s agenturou; hlášení problému platformy u Business eskaluje pověřený technický kontakt. Neprodáváme neomylnost ani garanci věcné správnosti všech výstupů.'],
        ['Je licence jen poplatek za aplikaci?', 'Ne. Aktuální nabídka je komerční licence Start nebo Business pro klientskou instanci. Aplikace se připravuje. Produkční vlastní hosting posuzujte podle veřejné licence konkrétní verze; již udělená práva zůstávají zachována.'],
        ['Je veřejné jádro bezplatný plán?', `${terms.publicLicence} ${terms.productionLicence}`],
        ['Co přesně znamená SLA?', `${terms.support} ${terms.supportWindow} ${terms.supportLimits}`],
    ];
    const partnerQuestions = [
        ['Musí agentura kupovat balík licencí?', 'Ne. Agentura neplatí partnerský paušál a nemusí nakupovat balík klientských licencí. Koncový klient platí licenci přímo Promptbooku. Vlastní produkční používání agentury je samostatné klientské nasazení.'],
        ['Jak dlouho dostává partner svůj podíl?', `${terms.share} ${terms.shareTerm} Není stanovený automatický konec po 12 měsících ani bezpodmínečný doživotní nárok.`],
        ['Je partnerství i pro freelancery?', 'Ano. Texty míří především na majitele menší agentury, ale spolupráce je otevřená i freelancerům a integrátorům. Partner musí umět zajistit nasazení a běžnou péči, případně s technickým spolupracovníkem.'],
    ];
    return <section className={s.section} aria-labelledby="faq-title"><div className={s.sectionHeading}>
        <span className={s.eyebrow}>PŘED PRVNÍM NASAZENÍM</span><h2 id="faq-title">Na co se ptáte.</h2></div>
        <div className={s.faq}>{[...(partnership ? partnerQuestions : []), ...common].map(([question, answer]) =>
            <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>,
        )}</div>
    </section>;
}

export function NewLandingPage({ partnership = false }: { partnership?: boolean }) {
    return <div className={s.page} lang="cs">
        <a className={s.skipLink} href="#obsah">Přejít na obsah</a>
        <div className={u.offerStrip}>Start: {terms.startUsd} USD za {terms.startDays} dní v reálném provozu. Bez automatické obnovy. <a href="#cenik">Podmínky pilotu →</a></div>
        <header className={s.header}><div className={s.headerInner}>
            <Link className={s.logo} href="/new" aria-label="Promptbook — produkt"><Image src="/logo/promptbook-logo-blue-transparent-128.png" width={34} height={34} alt="" /><span>promptbook<span className={s.logoDot}>.</span></span></Link>
            <nav className={s.nav} aria-label="Hlavní navigace"><Link href="/new" aria-current={!partnership ? 'page' : undefined}>Produkt</Link><a href="#agenti">Agenti</a>
                <Link href="/new/partnership" aria-current={partnership ? 'page' : undefined}>Pro agentury</Link><a href="#cenik">Ceník</a><a href="#kalkulacka">Kalkulačka</a><a href="#zdroje">Zdroje</a></nav>
            <a className={s.headerCta} href={enquiry(partnership ? 'Partnerství s Promptbookem' : 'Promptbook — Start')}>{partnership ? 'Domluvit partnerství' : 'Domluvit pilot'} <ArrowUpRight size={16} /></a>
        </div></header>
        <main id="obsah" className={s.container}>
            <section className={s.hero}>
                <div className={s.heroCopy}><span className={s.pill}><span className={s.smallDot} />{partnership ? 'Pro agentury, freelancery a integrátory' : 'AI zaměstnanci pro vás i vaše klienty'}</span>
                    <h1>{partnership ? <>Dřív jste prodávali hodiny.<br /><em>Teď nabídněte AI služby.</em></> : <>Dřív jste AI úkolovali.<br /><em>Teď pracuje pro vás.</em></>}</h1>
                    <p className={s.heroLead}>{partnership
                        ? 'Postavte novou službu na agentech, kteří obstarávají firemní agendy na pozadí. Vy jste kontaktem klienta a dodáváte řešení. Promptbook je váš technologický partner.'
                        : 'Přestaňte AI pořád hlídat a zadávat jí stejnou práci. Nastavte kontext, pravidla a agendu. Promptbook pracuje na pozadí, abyste měli čas na to, co vás baví a vydělává.'}</p>
                    <div className={s.actions}><a className={s.button} href={enquiry(partnership ? 'Chci nasazovat Promptbook klientům' : 'Chci domluvit produkční pilot Start')}>{partnership ? 'Domluvit partnerství' : 'Domluvit Start za 19 USD'}<ArrowRight size={18} /></a>
                        {partnership ? <a className={s.secondaryButton} href="#kalkulacka">Spočítat partnerský přínos</a> : <Link className={s.secondaryButton} href="/new/partnership">Nasazuji řešení klientům <ArrowUpRight size={17} /></Link>}
                    </div>
                    <p className={s.heroNote}>Aplikace od MangoWebu se připravuje. Dnešní pilot domluvíte s námi a partnerem. <a href="#dostupnost">Co je dostupné?</a></p>
                    <p className={s.finePrint}>{PRODUCT_AVAILABILITY.enquiryOnly}</p>
                </div>
                <aside className={s.preview} aria-label="Modelová ukázka práce na pozadí">
                    <div className={s.previewTop}><span>Jedna kniha. Práce pokračuje.</span><span className={s.demoLabel}>Modelová ukázka</span></div>
                    <div className={s.previewBody}><div className={s.previewTitle}><span className={s.previewIcon}><BookOpen size={26} /></span><div><h2>Stop babysitting AI.</h2><p>Událost → práce → výsledek.</p></div></div>
                        {[
                            ['09:00', 'E-maily', 'Zpracování komunikace podle firemních pravidel.'],
                            ['14:00', 'Video → článek', 'Příprava navazujícího obsahu z dodaného videa.'],
                            ['22:00', 'Účetní podklady', 'Další podklady do nastavené agendy.'],
                        ].map(([time, title, text]) => <div className={s.activity} key={time}><span className={u.time}>{time}</span><div><strong>{title}</strong><p>{text}</p></div></div>)}
                        <p className={s.finePrint}>Ilustrace zadaných agend, ne živý přehled klienta ani automatické hledání nové práce. Schvalování určujete vy.</p>
                    </div><div className={s.previewBottom}><span><Server size={15} /> Vlastní prostředí</span><span><ShieldCheck size={15} /> Vaše pravidla</span></div>
                </aside>
            </section>
            <div className={s.proofStrip}><span><Workflow /> Dlouhodobá agenda, ne další chat</span><span><BookOpen /> Firemní kontext ve vlastních souborech</span><span><Handshake /> Partner pro nasazení a péči</span></div>
            {partnership && <PartnershipModel />}
            <HowItWorks />
            <UseCases />
            <ControlAndAvailability />
            {!partnership && <section className={s.callout}>
                <strong>Vaši klienti. Vaše služby. Naše technologie.</strong><p>Nasaďte agenty nejprve sobě a potom klientům. Vydělávejte na implementaci, servisu a sjednaném 20% podílu z uhrazených licencí.</p>
                <Link className={s.textLink} href="/new/partnership">Pro agentury a freelancery <ArrowUpRight size={17} /></Link>
            </section>}
            <Pricing />
            <EconomicsCalculator initialMode={partnership ? 'partner' : 'company'} />
            <Support />
            <Faq partnership={partnership} />
            <section id="zdroje" className={s.section}>
                <div className={s.sectionHeading}><span className={s.eyebrow}>POZNEJTE TECHNOLOGII</span><h2>Lidé a principy za Promptbookem.</h2>
                    <p>Za Promptbookem stojí Pavol Hejný a Jiří Jahn. Než nasadíte první agendu, poznejte její principy a ověřte konkrétní proces v pilotu.</p></div>
                <div className={s.actions}><Link className={s.secondaryButton} href="/cs/whitepaper">Přečíst whitepaper <BookOpen size={17} /></Link>
                    <a className={s.secondaryButton} href={ENGINE_REPOSITORY}>Kód a technické návody <Code2 size={17} /></a>
                    <Link className={s.textLink} href="/contact">O nás <ArrowUpRight size={17} /></Link></div>
            </section>
            <section className={s.finalCta}><div><span className={s.eyebrow}>{partnership ? 'ZAČNĚTE JEDNÍM KLIENTEM' : 'NAJMĚTE PRVNÍHO AGENTA'}</span>
                <h2>{partnership ? 'Nová služba. Dlouhodobý vztah.' : 'Kterou agendu už nechcete dělat ručně?'}</h2>
                <p>{partnership ? 'Popište své klienty a první agendu. Dohodneme pilot, rozdělení péče a partnerské podmínky.' : 'Domluvte jednu agendu na 30 dní. Ověřte skutečnou práci, náklady a přínos, ne jen hezkou ukázku.'}</p></div>
                <a className={s.button} href={enquiry(partnership ? 'Partnerství s Promptbookem' : 'Promptbook — produkční pilot Start')}>{partnership ? 'Napsat o partnerství' : 'Domluvit první pilot'} <Mail size={18} /></a>
            </section>
        </main>
        <footer className={s.footer}><div><strong>promptbook.</strong><p>Soustreďte se na práci, která vydělává.</p><p>Kontakt: Jiří Jahn · <a href={`mailto:${terms.contact}`}>{terms.contact}</a></p></div>
            <nav aria-label="Patička"><Link href="/new">Produkt</Link><Link href="/new/partnership">Pro agentury</Link><a href="#cenik">Ceník</a><Link href="/cs/whitepaper">Whitepaper</Link><a href={ENGINE_REPOSITORY}>GitHub</a><Link href="/privacy">Soukromí</Link><Link href="/terms">Podmínky webu</Link><Link href="/cs">Současný web</Link></nav>
            <span>Vytvořeno v Česku.</span>
        </footer>
    </div>;
}
