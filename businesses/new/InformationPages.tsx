'use client';

import { useSiteLocale } from './LocaleProvider';
import { ComparisonTable, ProductComparisonTable } from './ComparisonTable';
import Link from 'next/link';
import { SiteAgentChat } from '@/components/agents/SiteAgentChat';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { AgendaShowcase } from './AgendaShowcase';
import { Founders } from './Founders';
import { StoryTimeline } from './StoryTimeline';
import { LeadButton } from './LeadCapture';
import { ClosingCta, PricingCards } from './MarketingSections';
import { OwnershipScene } from './OwnershipScene';
import { COMMERCIAL_TERMS, ENGINE_REPOSITORY } from './commercialTerms';
import { SCENARIOS, type ScenarioId } from './economics';
import { changeScenario, defaultCalculatorState, calculatorPath } from './calculatorState';
import { COMPARISONS, COMPARISON_REVIEW_DATE, REBORN_SOURCE } from './comparisons';
import { CAPABILITY_REVIEW_DATE, PROMPTBOOK_CAPABILITY_SOURCES } from './comparisonCapabilities';
import { sitePath } from './siteConfig';
import s from './site.module.css';
import { FAQ } from './faqData';
import { ComparisonOverview, ComparisonContext } from './ComparisonOverview';
import { PurchaseActions } from './PurchaseActions';

export function PageIntro({title,children}:{title:string;children?:React.ReactNode}) {
    const { t, locale, path } = useSiteLocale();
return <header className={s.pageIntro}><Link className={s.breadcrumb} href={path()}>{t("← Promptbook")}</Link><h1>{t(title)}</h1>{children && <p>{t(children)}</p>}</header>;}

export function PricingPage({ checkoutEnabled = false }: { checkoutEnabled?: boolean }) {
    const { t, locale, path } = useSiteLocale();
return <><PageIntro title={t('Ceník')}>{locale === 'en' ? 'Compare self-installation, subscriptions per engine project and a custom offer for your team.' : 'Porovnejte vlastní instalaci, předplatné za projekt enginu a nabídku na míru pro Váš tým.'}</PageIntro><PricingCards full checkoutEnabled={checkoutEnabled}/><div className={s.prose}>
    <h2>{t("Jak se plány účtují")}</h2><p>{t("Start i Business jsou průběžná měsíční předplatná za projekt enginu. Oba podporují pravidelné spouštění i nepřetržitý provoz a lze je používat dlouhodobě. Další obnovení lze zrušit před začátkem dalšího fakturačního období. Start má podporu výrobce bez garantované reakce; Business první věcné posouzení do 16 pracovních hodin.")}</p>
    <h3>{t("Co je jeden projekt?")}</h3><p>{t(COMMERCIAL_TERMS.instance)}</p>
    <h2>{t("Jak počítáme kapacitu")}</h2>
    <h3>{t("Odborní agenti a core role")}</h3><p>{t(COMMERCIAL_TERMS.specialists)}</p>
    <h3>{t("Ovládající uživatelé")}</h3><p>{t(COMMERCIAL_TERMS.users)}</p>
    <h3>{t("Připojené harnessy")}</h3><p>{t(COMMERCIAL_TERMS.harnesses)}</p>
    <h3>{t("Oddělené webové profily")}</h3><p>{t(COMMERCIAL_TERMS.browserProfiles)}</p>
    <h2>{t("Rozšíření, rozpočet a změna plánu")}</h2><p>{t(COMMERCIAL_TERMS.expansion)}</p>
    <p>{locale === 'en' ? 'CZK example for a full month: Business with 15 specialists and 7 controlling users costs CZK 1,999 + 5 × CZK 99 + 2 × CZK 99 = CZK 2,692 excluding VAT. The 20% agency share within the original 24-month window is CZK 538.40.' : 'Příklad za celý měsíc: Business s 15 odborníky a 7 ovládajícími uživateli stojí 1 999 + 5 × 99 + 2 × 99 = 2 692 Kč bez DPH. Partnerská provize 20 % v původním 24měsíčním okně je 538,40 Kč.'}</p>
    <p>{t(COMMERCIAL_TERMS.planChanges)}</p>
    <p>{t("Licenční kvóty neurčujeme pro počet úloh, souběžné běhy, tokeny, normostrany znalostí ani velikost kontextu. Skutečný výkon, cena AI a limity poskytovatelů se řídí zvoleným prostředím a jejich vlastními podmínkami.")}</p>
    <h2>{t("Celkové náklady, ne jen licence")}</h2><p>{t(COMMERCIAL_TERMS.exclusions)}</p><p>{t("AI a infrastrukturu hradí klient, případně partner podle dohody. Promptbook neprodává spravovaný hosting. Cena nezahrnuje správu serveru, instalaci aktualizací, zakázkový vývoj ani neomezené konzultace.")}</p><p>{t("Aktualizace vycházejí ve standardních vydáních. Předplatné není objednávkou samostatné distribuce ani individuálního plánu oprav.")}</p><p>{t("Automatické aktualizace enginu řídí nastavení projektu. Lidská správa serveru a servisní práce partnera jsou samostatné služby.")} <Link href={path('bezpecnost#aktualizace')}>{t("Jak fungují automatické aktualizace →")}</Link></p><Link href={path('kalkulacka')}>{t("Spočítat kompletní náklady a přínosy →")}</Link>
    <h2>{t("Podpora Business")}</h2><p>{t(COMMERCIAL_TERMS.support)}</p><p>{t(COMMERCIAL_TERMS.supportWindow)}</p><p>{t("Oba plány můžete spravovat sami nebo s agenturou. Licence Promptbooku, práce agentury a podpora výrobce jsou samostatné části. Za projekt s námi komunikuje jeden pověřený technický kontakt klienta nebo agentury. Hlášení problémů platformy přijímáme na ")}{t(COMMERCIAL_TERMS.contact)}{t(".")}</p><p>{t(COMMERCIAL_TERMS.supportLimits)}</p>
    <h2>{t("Veřejný kód a vlastní nasazení")}</h2><p>{t(COMMERCIAL_TERMS.publicLicence)}</p><p>{t(COMMERCIAL_TERMS.productionLicence)}</p><p><Link href={path('licence')}>{locale === 'en' ? 'Engine licence and commercial terms →' : 'Licence enginu a komerční podmínky →'}</Link></p>
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
        <p className={s.small}>{locale === 'en' ? 'The remote control app is in preparation. The diagram explains its architecture; today use the local Console.' : 'Vzdálenou ovládací appku připravujeme. Schéma vysvětluje její architekturu; dnes použijte lokální Console.'}</p><OwnershipScene />
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

export function FaqPage(){
    const { t, locale, path } = useSiteLocale();
return <><PageIntro title={t("Otázky před první agendou.")}/><div className={s.faq}>{FAQ.map(([question,answer]) => <details key={question}><summary>{t(question)}</summary><p>{t(answer)}</p></details>)}</div><section className={s.section}><div className={s.actions}><Link className={s.secondaryButton} href={path('pricing')}>{t("Ceník a SLA")}</Link><Link className={s.secondaryButton} href={path('bezpecnost')}>{t("Data a bezpečnost")}</Link></div></section><ClosingCta/></>;}

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

export function ComparisonsPage() {
    const { locale } = useSiteLocale();
    const cs = locale === 'cs';

    return <>
        <PageIntro title={'Promptbook versus'}>
            {cs ? 'Vyberte podle práce, kterou potřebujete dlouhodobě zajistit. Podrobné parametry a zdroje najdete o krok dál.' : 'Choose by the ongoing responsibility you need to cover. Detailed parameters and sources are one step away.'}
        </PageIntro>
        <ComparisonOverview />
        <SiteAgentChat embedId="comparison" language={locale} />
        <ClosingCta />
    </>;
}

export function ComparisonPage({ slug }: { slug: string }) {
    const { t, locale, path } = useSiteLocale();
    const item = COMPARISONS.find(comparison => comparison.slug === slug)!;
    const cs = locale === 'cs';

    return <>
        <header className={s.pageIntro}>
            <Link className={`${s.breadcrumb} ${s.comparisonBack}`} href={path('srovnani')}>
                <ArrowLeft size={16} aria-hidden="true" />{'Promptbook versus'}
            </Link>
            <h1>Promptbook versus {item.name}</h1>
        </header>
        <div className={s.comparisonChoices}>
            <section>
                <h2>{cs ? 'Kdy zvolit Promptbook' : 'When to choose Promptbook'}</h2>
                <p>{item.advantage[locale]}</p>
            </section>
            <section>
                <h2>{cs ? 'Kdy zvolit' : 'When to choose'} {item.name}</h2>
                <p>{item.rows.fit[locale]}</p>
            </section>
        </div>
        <ComparisonContext item={item}/><ProductComparisonTable item={item} />
        <div className={s.prose}>
            <div className={s.sources}>
                <p>{cs ? 'Základní parametry ověřeny' : 'Core features reviewed'} {COMPARISON_REVIEW_DATE[locale]}.{' '}{cs ? 'Integrace, modely a přístup ověřeny' : 'Integrations, models and access reviewed'} {CAPABILITY_REVIEW_DATE[locale]}.</p>
                <ul>
                    <li><a href={REBORN_SOURCE}>Promptbook Reborn · 1292ef3</a></li>
                    {[...PROMPTBOOK_CAPABILITY_SOURCES, ...item.sources].map(([title, href]) => <li key={href}><a href={href}>{title}</a></li>)}
                </ul>
            </div>
            <div className={s.actions}>
                <LeadButton topic={t(`Srovnání Promptbooku a ${item.name}`)}>{t('Probrat můj use case')}</LeadButton>
            </div>
        </div>
    </>;
}
