'use client';

import { useSiteLocale } from './LocaleProvider';
import { ComparisonTable } from './ComparisonTable';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getLegalDocument } from '@/lib/legal/legalDocuments';
import type { LegalDocumentKind } from '@/lib/legal/legalPagePaths';
import { AgendaShowcase } from './AgendaShowcase';
import { Founders } from './Founders';
import { StoryTimeline } from './StoryTimeline';
import { LeadButton } from './LeadCapture';
import { ClosingCta, PricingCards } from './MarketingSections';
import { OwnershipScene } from './OwnershipScene';
import { COMMERCIAL_TERMS, ENGINE_REPOSITORY } from './commercialTerms';
import { SCENARIOS, type ScenarioId } from './economics';
import { changeScenario, defaultCalculatorState, calculatorPath } from './calculatorState';
import { COMPARISONS, COMPARISON_REVIEW_DATE } from './comparisons';
import { sitePath } from './siteConfig';
import s from './site.module.css';

export function PageIntro({title,children}:{title:string;children?:React.ReactNode}) {
    const { t, locale, path } = useSiteLocale();
return <header className={s.pageIntro}><Link className={s.breadcrumb} href={path()}>{t("← Promptbook")}</Link><h1>{t(title)}</h1>{children && <p>{t(children)}</p>}</header>;}

export function PricingPage() {
    const { t, locale, path } = useSiteLocale();
return <><PageIntro title={t("Licence pro vaši firemní agendu.")}>{t("Vyzkoušejte ji v reálném provozu. Potom pokračujte měsíčně, bez ročního závazku.")}</PageIntro><PricingCards full/><div className={s.prose}>
    <h2>{t("Jak se plány účtují")}</h2><p>{t("Start je jeden produkční pilot na 30 dní, dostupný jednou pro koncového klienta. Automaticky se neobnovuje; pokračování v rámci komerční licence vyžaduje objednání Business. Business lze ukončit pro další fakturační období.")}</p>
    <h3>{t("Co je klientské prostředí?")}</h3><p>{t(COMMERCIAL_TERMS.instance)}</p>
    <h2>{t("Celkové náklady, ne jen licence")}</h2><p>{t(COMMERCIAL_TERMS.exclusions)}</p><p>{t("AI a infrastrukturu hradí klient, případně partner podle dohody. Promptbook neprodává spravovaný hosting. Cena nezahrnuje správu serveru, instalaci aktualizací, zakázkový vývoj ani neomezené konzultace.")}</p><p>{t("Aktualizace vycházejí ve standardních vydáních. Předplatné není objednávkou samostatné distribuce ani individuálního plánu oprav.")}</p><p>{t("Automatické aktualizace enginu řídí nastavení projektu. Lidská správa serveru a servisní práce partnera jsou samostatné služby.")} <Link href={path('bezpecnost#aktualizace')}>{t("Jak fungují automatické aktualizace →")}</Link></p><Link href={path('kalkulacka')}>{t("Spočítat kompletní náklady a přínosy →")}</Link>
    <h2>{t("Podpora Business")}</h2><p>{t(COMMERCIAL_TERMS.support)}</p><p>{t(COMMERCIAL_TERMS.supportWindow)}</p><p>{t("Běžnou péči zajišťuje partner. Za klientské prostředí s námi komunikuje jeden pověřený technický kontakt. Hlášení problémů platformy přijímáme na ")}{t(COMMERCIAL_TERMS.contact)}{t(".")}</p><p>{t(COMMERCIAL_TERMS.supportLimits)}</p>
    <h2>{t("Veřejný kód a vlastní nasazení")}</h2><p>{t(COMMERCIAL_TERMS.publicLicence)}</p><p>{t(COMMERCIAL_TERMS.productionLicence)}</p><p><a href={`${ENGINE_REPOSITORY}/blob/main/LICENSE.md`}>{t("Veřejná licence enginu ↗")}</a></p>
    <h2>{t("Více prostředí nebo jiný rozsah?")}</h2><p>{t("Připravíme individuální nabídku. Nepřetržitou lidskou podporu nenabízíme. Přesná oprávnění a podmínky stanoví objednávka, licenční smlouva a případně partnerská dohoda.")}</p><div className={s.actions}><LeadButton topic={t("Individuální rozsah a více klientských prostředí")}>{t("Probrat požadavky")}</LeadButton></div>
</div></>;}

export function StoryPage(){
    const { t, locale } = useSiteLocale();
    const en = locale === 'en';
    return <>
        <PageIntro title={en ? 'Our story' : 'Náš příběh'}>{en ? 'From the first AI-generated websites to agents that take care of ongoing work.' : 'Od prvních webů vytvořených AI k agentům, kteří se průběžně starají o práci.'}</PageIntro>
        <StoryTimeline/>
        <section className={s.section}><div className={s.sectionTitle}><h2>{t("Dva rovnocenní spoluzakladatelé.")}</h2><p>{t("Jiří vede obchodní spolupráci. Pavol vede technologii. Promptbook tvoříme společně.")}</p></div><Founders/></section>
        <ClosingCta/>
    </>;
}

export function SecurityPage(){
    const { t, path, locale } = useSiteLocale();
    return <>
        <PageIntro title={t("Kontext zůstává váš.")}>{t("Vlastní soubory a agenti. Oddělené ovládání. Jasná hranice mezi přenosem do aplikace a použitím AI modelu.")}</PageIntro>
        <OwnershipScene />
        <div className={s.prose}>
            <h2>{t("Engine pracuje ve vašem prostředí")}</h2>
            <p>{t("Engine běží na Vašem počítači, firemním serveru nebo pronajatém serveru pod Vaší kontrolou. Tady jsou pracovní soubory, pravidla a kontext agend. Zavření aplikace, odhlášení, ztráta zařízení ani výpadek spojení samy o sobě neruší zadanou práci. Stroj s enginem musí zůstat dostupný.")}</p>
            <h2>{t("Soubory, které otevřete i bez Promptbooku")}</h2>
            <p>{t("Agenti, úkoly a konverzace jsou čitelné soubory ve složkách agents/, tasks/ a chats/. Nastavení projektu najdete v ptbk.json. Obsah můžete prohlížet, upravovat, zálohovat a přenést na jiný stroj běžnými nástroji.")}</p>
            <h2>{t("Změny mají historii")}</h2>
            <p>{t("Engine standardně ukládá dokončené změny projektu do Gitu. Můžete porovnat verze souborů a dohledat, co se při práci změnilo. Dostupné záznamy úloh pomáhají vysvětlit jejich průběh. Návrat k předchozí verzi souborů ale nevezme zpět už odeslaný e-mail nebo jinou akci v externím systému.")}</p>
            <h2>{t("Dva vaše konce. Šifrované spojení mezi nimi.")}</h2>
            <p>{t("Aplikace a engine spolu komunikují end-to-end šifrovaně. Klíče k pracovnímu obsahu zůstávají na Vašich koncových zařízeních. Přenosová služba i centrální backend předávají šifrovaný pracovní obsah bez jeho dešifrování. To je princip zero trust: přenosové službě nemusíte svěřovat obsah své práce.")}</p>
            <p>{t("Stejná ochrana platí pro chat, přenášené soubory, Wallet s přístupy i případný servisní terminál. Přístup k projektu se ověřuje i u šifrovaného spojení. Účet, předplatné a potřebné provozní údaje jsou od pracovního obsahu oddělené.")}</p>
            <p>{t("Lokální dashboard a rozhraní enginu jsou přístupné pouze na stroji s enginem a nevyžadují párování. Vzdálená aplikace používá samostatné ověřené a šifrované spojení. Kvůli vzdálenému ovládání nevystavujete lokální rozhraní do internetu.")}</p>
            <h2>{t("Model si vybíráte vy")}</h2>
            <p>{t("Promptbook není vázaný na jediného poskytovatele AI. Volíte podporovaný harness a model; vaše role, pravidla a soubory zůstávají součástí projektu. Lokální model lze zapojit přes kompatibilní napojení podporovaného harnessu. Vhodnost pro konkrétní agendu závisí na modelu, hardwaru a nástrojích.")}</p>
            <p>{t("Při použití externího modelu se potřebné vstupy odesílají přímo jeho poskytovateli z vašeho prostředí. End-to-end šifrování ovládacího kanálu neznamená, že poskytovatel AI tyto vstupy nevidí. Totéž platí pro nástroje, kterým dovolíte s daty pracovat.")}</p>
            <p>{t("Lokální model odstraňuje potřebu posílat vstupy externímu modelovému poskytovateli. Jeho vhodnost závisí na schopnostech modelu, hardwaru a úloze; napojené externí nástroje se tím automaticky nestávají lokálními.")}</p>
            <h2>{t("Oprávnění a kontrola patří vám")}</h2>
            <p>{t("S partnerem nastavíte, ke kterým účtům agenda smí, co může provést sama a kdy si vyžádá schválení. Návrh odpovědi a její odeslání jsou odlišné kroky. Citlivé operace nemusíte pouštět bez kontroly.")}</p>
            <h2 id="pravidla">{t("Agenti se učí. Pevná pravidla určujete Vy.")}</h2>
            <p>{t("Agenti mohou zlepšovat své postupy a znalosti v mezích, které jim určíte. Pevné cíle, zákazy a hranice schvalování si sami nemění. Platí to i při automatické opravě nebo aktualizaci. Změnu takového pravidla zadáváte Vy.")}</p>
            <p>{t("U každého agenta určíte, zda se smí učit a které části zadání může měnit. Uzavřené zadání agent sám nepřepisuje. Otevřené dovoluje učení v povolených mezích; agent si toto omezení nemůže sám zrušit. Pokud pevné pravidlo brání dokončení práce, požádá o potřebné rozhodnutí a pokračuje v nezávislých úkolech.")}</p>
            <h2 id="aktualizace">{t("Aktualizace podle Vašich pravidel")}</h2>
            <p>{t("Automatické aktualizace jsou ve výchozím nastavení zapnuté. Engine vybírá stabilní opravné a menší verze v rámci stejné hlavní verze a počká, až má pro bezpečný přechod volné ruce. Automatiku můžete vypnout nebo připnout konkrétní verzi. Aktualizace zachovává ruční pauzu i zastavení projektu.")}</p>
            <p>{t("Ve výchozím nastavení automatika nepřechází na novou hlavní verzi. Ze stabilní verze sama nevstoupí do předběžných vydání. Pokud jste si předběžnou verzi sami zvolili, engine sleduje další předběžná vydání téže verze a následně přejde na její stabilní vydání. Potom zůstává u stabilních verzí.")}</p>
            <p>{t("Projekty mohou používat samostatné instalace a různé verze enginu. Pokud sdílejí jednu instalaci, připnutí verze u jediného projektu brání její změně i ostatními. Potřebné převody projektových souborů se zapisují do Gitu; při selhání aktualizace se engine pokusí obnovit funkční provoz.")}</p>
            <p>{t("Vlastní provoz znamená také odpovědnost za přístupová práva, aktualizace, zálohy a zařízení, na kterém obsah zobrazujete. Veřejný kód umožňuje kontrolu implementace; sám o sobě není bezpečnostní certifikací.")}</p>
            <h2>{locale === 'en' ? 'Want to look under the hood?' : 'Chcete znát technické detaily?'}</h2>
            <p><a href={ENGINE_REPOSITORY}>{locale === 'en' ? 'Explore the public code on GitHub' : 'Prohlédněte si veřejný kód na GitHubu'} ↗</a></p>
            <div className={s.actions}><LeadButton topic={locale === 'en' ? 'Architecture and data control — a question for Pavol' : 'Architektura a kontrola nad daty — dotaz pro Pavola'}>{locale === 'en' ? 'Ask Pavol about the architecture' : 'Probrat architekturu s Pavolem'}</LeadButton></div>
            <h2>{t("Data v této kalkulačce")}</h2>
            <p>{t("Výpočet probíhá v prohlížeči. Sdílený odkaz pokročilé kalkulačky obsahuje zadané parametry. Po vyžádání PDF uložíme e-mail a odkaz na výpočet do našeho kontaktního systému; nejde o přihlášení k newsletteru. E-mail do sdíleného odkazu ani PDF nevkládáme.")}</p>
            <Link href={path('soukromi')}>{t("Jak zpracováváme osobní údaje →")}</Link>
        </div>
        <ClosingCta />
    </>;
}

const FAQ = [
    ['Musím umět programovat?', 'Pro běžné ovládání ne. Technické nastavení a připojení vašich systémů může vyřešit partner. Vy určíte práci, pravidla a hranice schvalování.'],
    ['Čím se agenda liší od chatbota?', 'Chat obvykle začíná otázkou. Agenda má vymezenou dlouhodobou práci a reaguje na další podklady nebo naplánované úkoly. Není potřeba znovu popisovat každý jednotlivý krok.'],
    ['Funguje to i s vypnutým notebookem?', 'Ano, pokud engine běží na jiném dostupném stroji, například na vašem serveru. Když vypnete přímo počítač s enginem, zastaví se i jeho práce.'],
    ['Co když AI udělá chybu?', 'Nastavíte oprávnění a schvalování citlivých kroků, počítáte s kontrolou výstupů a řešením výjimek. Autonomie neznamená bezchybnost ani převzetí odborné odpovědnosti.'],
    ['Kam jdou naše data?', 'Pracovní kontext a soubory jsou ve Vašem prostředí. Aplikace a engine spolu komunikují end-to-end šifrovaně; relay ani centrální backend tento pracovní obsah nedešifrují. Účet a předplatné jsou oddělené. Externí modely a připojené nástroje dostávají vstupy, které jim Vaše agenda odešle.'],
    ['Mohou si agenti měnit naše pravidla?', 'Postupy a znalosti mohou zlepšovat jen v mezích, které jim určíte. Pevné cíle, zákazy a hranice schvalování sami nemění, ani při opravě nebo aktualizaci. Můžete také uzavřít celé zadání agenta proti automatickému přepisování. Pevná pravidla měníte Vy.'],
    ['Mohu si své agenty a práci odnést?', 'Ano. Agenti, úkoly, konverzace a nastavení jsou čitelné soubory ve vašem projektu. Můžete je otevřít běžným editorem, zálohovat a přenést. Promptbook při dokončených změnách standardně vytváří Git historii, takže vidíte i předchozí verze.'],
    ['Mohu změnit AI nebo použít lokální model?', 'Ano, v rámci podporovaných harnessů a modelů. Role, pravidla a soubory přitom zůstávají ve vašem projektu. Lokální model vyžaduje kompatibilní napojení harnessu a odpovídající hardware; kvalitu a schopnost pracovat s nástroji ověřte na své agendě. Externí nástroje mohou data odesílat i při použití lokálního modelu.'],
    ['Jak svou agendu ovládám?', 'V aplikaci zadáváte práci chatem a projekt můžete spustit, pozastavit, obnovit, zastavit nebo restartovat. Lokální dashboard otevřete přímo na stroji s enginem bez párování; vzdálené ovládání používá ověřené end-to-end šifrované spojení.'],
    ['Co když aplikaci zavřu nebo ztratím spojení?', 'Engine pokračuje na svém dostupném stroji podle zadaných pravidel i po zavření aplikace, odhlášení nebo ztrátě zařízení. Nedostupné spojení samo o sobě neznamená zastavený projekt. Ruční pauza přeruší automatickou práci, ale ponechá chat a ovládání dostupné; zastavení ukončí běh enginu.'],
    ['Jak fungují automatické aktualizace?', 'Ve výchozím nastavení engine ve volné chvíli instaluje stabilní opravné a menší verze v rámci stejné hlavní verze. Automatiku můžete vypnout nebo připnout verzi. Předběžná vydání se sama nezapínají; pokud už na jednom jste, postupujete po něm ke stabilní verzi a pak zůstáváte na stabilních vydáních. Ruční pauza i zastavení zůstávají platné.'],
    ['Jak začnu na vlastním serveru?', 'V aplikaci získáte příkaz pro svůj VPS. Po připojení pokračujete nastavením první agendy a přihlášením k vybraným AI nástrojům. Přihlašovací kroky dokončujete Vy v chráněném rozhraní nebo terminálu; hesla ani přihlašovací kódy neposíláte do běžného chatu. S nasazením může pomoci partner.'],
    ['Je engine zdarma?', 'Veřejný kód má vlastní licenční podmínky. Samostatný vývoj a neprodukční testování jsou bez licenčního poplatku podle licence dané verze. Produkční použití se řídí právy konkrétní verze a případnou komerční licencí Start či Business.'],
    ['Co znamená jedno klientské prostředí?', COMMERCIAL_TERMS.instance],
    ['Znamená 24/7 provoz i podporu v noci?', 'Ne. Business má první věcnou reakci do 16 pracovních hodin v definovaném pracovním okně, nikoli nepřetržitou pohotovost, garanci opravy nebo dostupnosti. Podrobnosti jsou v ceníku.'],
    ['Kdo nám řešení nasadí?', 'Partner, který s vámi vybere agendu a postará se o nastavení i běžnou péči podle dohody. Promptbook poskytuje technologii a licenční produktovou podporu. Samostatné technické nasazení je také možné.'],
    ['Musím odejít od svých současných nástrojů?', 'Ne nutně. Podívejte se na srovnání jednotlivých přístupů. Některé nástroje, například coding harnessy, mohou být součástí vašeho řešení s Promptbookem.'],
] as const;
export function FaqPage(){
    const { t, locale, path } = useSiteLocale();
return <><PageIntro title={t("Otázky před první agendou.")}/><div className={s.faq}>{FAQ.map(([question,answer]) => <details key={question}><summary>{t(question)}</summary><p>{t(answer)}</p></details>)}</div><section className={s.section}><div className={s.actions}><Link className={s.secondaryButton} href={path('cenik')}>{t("Ceník a SLA")}</Link><Link className={s.secondaryButton} href={path('bezpecnost')}>{t("Data a bezpečnost")}</Link></div></section><ClosingCta/></>;}

export function AgendasPage(){
    const { t, locale, path } = useSiteLocale();
return <><PageIntro title={t("Vyberte práci, která se vrací.")}>{t("Začněte jedním procesem. Uvidíte, jaké podklady potřebuje a co po jeho zpracování dostanete.")}</PageIntro><AgendaShowcase/><section className={s.section}><div className={s.twoColumns}>{Object.entries(SCENARIOS).map(([id,scenario]) => <article className={s.card} key={id}><h3>{t(scenario.title)}</h3><p>{t(scenario.description)}</p><Link className={s.textLink} href={path(`agendy/${id}`)}>{t("Prohlédnout agendu ")}<ArrowRight size={17}/></Link></article>)}</div></section></>;}

const AGENDA_DETAILS:Record<ScenarioId,[string,string,string]> = {
    email:['Firemní znalosti, pravidla komunikace a přístup ke schránce.', 'Třídění zpráv, hledání souvislostí a příprava odpovědí. Odesílání se řídí nastavenými oprávněními.', 'Vyřízené rutinní dotazy a výjimky, u kterých potřebujete rozhodnout.'],
    documents:['Doklady z e-mailu nebo složky a požadovaný formát podkladů.', 'Příjem a vytěžení údajů, uspořádání originálů a příprava dat pro účetní.', 'Přehledné podklady. Účetní posuzuje výjimky a zůstává odborně odpovědná.'],
    social:['Obsahový plán, styl značky, podklady a přístupy k vybraným sítím.', 'Příprava variant pro Facebook, Instagram a LinkedIn, schvalování a naplánování publikace.', 'Obsah připravený pro jednotlivé sítě, ne jen stejný text zkopírovaný všude.'],
    video:['Zdrojové video, publikační záměr a styl vašeho obsahu.', 'Přepis a zpracování obsahu do článku, popisu videa a příspěvků. Publikace následuje vaše pravidla.', 'Z jedné nahrávky více použitelných výstupů pro YouTube, web a sociální sítě.'],
    coding:['Repozitář webu, zadání údržby, přístupy a pravidla nasazování.', 'Aktualizace, návrhy oprav a automatické testy. Důležité změny mohou čekat na vaši kontrolu.', 'Udržovaný web s dohledatelnými změnami. Testy nejsou zárukou absence všech chyb.'],
};
export function AgendaPage({scenarioId}:{scenarioId:ScenarioId}){
    const { t, locale, path } = useSiteLocale();
const scenario=SCENARIOS[scenarioId];return <><PageIntro title={t(scenario.title)}>{t(scenario.description)}</PageIntro><AgendaShowcase initialScenario={scenarioId}/><section className={s.section}><div className={s.threeColumns}>{['Co předáte','Co se děje','Co dostanete'].map((title,i) => <article className={s.card} key={title}><h3>{t(title)}</h3><p>{t(AGENDA_DETAILS[scenarioId][i])}</p></article>)}</div><div className={s.actions}><LeadButton topic={t(`Nasazení agendy — ${t(scenario.title)}`)}>{t("Probrat tuto agendu")}</LeadButton><Link className={s.secondaryButton} href={calculatorPath(changeScenario(defaultCalculatorState(),scenarioId),locale)}>{t("Spočítat tuto agendu ")}<ArrowRight size={17}/></Link></div></section></>;}

export function ComparisonsPage(){
    const { t, locale, path } = useSiteLocale();
return <><PageIntro title={t("Vyberte přístup. Ne nálepku.")}>{t("Vývojový agent, vizuální workflow, osobní asistent nebo dlouhodobá firemní agenda. Rozdíl je v tom, jakou práci potřebujete předat.")}</PageIntro><div className={s.prose}><p>{t("Promptbook stavíme pro dlouhodobé agendy na klientově infrastruktuře s odděleným ovládáním a partnerským nasazením. Není jediný nástroj, který umí pracovat na pozadí. A někdy dává smysl používat více nástrojů společně.")}</p></div><ComparisonTable/><div className={s.sectionTitle}><h2>{t("Podrobně, přístup po přístupu.")}</h2></div><div className={s.twoColumns}>{COMPARISONS.map(item => <article className={s.card} key={item.slug}><h3>{t("Promptbook a ")}{t(item.name)}</h3><p>{t(item.capability)}</p><Link className={s.textLink} href={path(`srovnani/${item.slug}`)}>{t("Kdy zvolit který ")}<ArrowRight size={17}/></Link><div className={s.sources}><a href={item.source}>{t(item.sourceTitle)}{t(" ↗")}</a></div></article>)}</div><p className={`${s.small} ${s.section}`}>{t("Srovnání podle oficiálních zdrojů, kontrola ")}{t(COMPARISON_REVIEW_DATE)}{t(". Doporučení vhodnosti je náš pohled, ne výkonnostní benchmark. Nezaměňujeme „neuvedeno ve zdroji“ za „produkt to neumí“.")}</p><ClosingCta/></>;}
export function ComparisonPage({slug}:{slug:string}){
    const { t, locale, path } = useSiteLocale();
const item=COMPARISONS.find(item=>item.slug===slug)!;return <><PageIntro title={t(`Promptbook a ${item.name}`)}>{t(item.question)}</PageIntro><div className={s.twoColumns}><article className={s.card}><h2>{t(item.name)}</h2><p style={{marginTop:20}}>{t(item.capability)}</p><div className={s.sources}><a href={item.source}>{t(item.sourceTitle)}{t(" ↗")}</a></div></article><article className={s.card}><h2>{t("Promptbook")}</h2><p style={{marginTop:20}}>{t("Dlouhodobá agenda nad vašimi pracovními soubory a kontextem. Engine běží ve vašem prostředí, ovládání je oddělené a nasazení může zajistit partner, který zná vaši firmu.")}</p></article></div><div className={s.prose}><h2>{t("Kdy zvažovat ")}{t(item.name)}</h2><p>{t(item.fit)}</p><h2>{t("Kdy zvažovat Promptbook")}</h2><p>{t(item.difference)}</p><h2>{t("Vyzkoušejte stejný proces")}</h2><p>{t("Porovnejte na vlastních podkladech kvalitu výsledku, potřebný dohled, celkové náklady a způsob předání do provozu. Nejen cenu licence nebo jeden hezký výstup.")}</p><div className={s.actions}><LeadButton topic={t(`Srovnání Promptbooku a ${item.name}`)}>{t("Probrat můj use case")}</LeadButton><Link className={s.textLink} href={path('srovnani')}>{t("Všechna srovnání ")}<ArrowRight size={17}/></Link></div><div className={s.sources}><p>{t("Podklad: ")}<a href={item.source}>{t(item.sourceTitle)}</a>{t(". Kontrola ")}{t('reviewed' in item ? item.reviewed : '15. října 2026')}{t(". Popis alternativy vychází z jejího zdroje; vhodnost a vymezení Promptbooku jsou naše produktové doporučení. Nejde o nezávislý test nebo přehled všech funkcí.")}</p></div></div></>;}

/** Reuse the canonical legal document data unchanged, inside the /new navigation shell. */
export function NewLegalPage({kind}:{kind:LegalDocumentKind}){
    const { t, locale, path } = useSiteLocale();
const doc=getLegalDocument(kind,locale);return <><PageIntro title={t(doc.title)}/><article className={s.prose}><div>{t(doc.perex)}</div>{doc.sections.map((section,i) => <section key={section.heading}><h2>{i+1}{t(". ")}{t(section.heading)}</h2>{section.paragraphs?.map((paragraph,j)=><p key={j}>{t(paragraph)}</p>)}{section.bullets && <ul>{section.bullets.map((bullet,j)=><li key={j}>{t(bullet)}</li>)}</ul>}</section>)}</article></>;}
