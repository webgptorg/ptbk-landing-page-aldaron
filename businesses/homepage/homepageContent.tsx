import type { QualificationPopupContent } from '@/components/qualification-popup';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import type { ReactNode } from 'react';

/**
 * Language the main homepage is published in
 */
export type HomepageLanguage = SupportedHomepageLanguage;

/**
 * Where one task of an agenda stands right now
 *
 * Note: These four states are the whole promise of the page in one vocabulary - an agenda keeps working, finishes
 *       things, has more of them waiting and asks a person when it must not decide alone.
 */
export type HomepageAgendaTaskState = 'done' | 'running' | 'scheduled' | 'escalated';

/**
 * One task or goal living inside an agenda
 */
export type HomepageAgendaTask = {
    /**
     * What the task is about, written the way the responsible person would say it
     */
    readonly label: string;

    /**
     * When or how often it happens, shown beside the task
     */
    readonly cadence: string;

    /**
     * Where the task stands
     */
    readonly state: HomepageAgendaTaskState;
};

/**
 * An agenda as it is drawn on the page: its name, the context it owns and the tasks inside it
 *
 * Note: The very same shape is drawn large in the hero and compact in the examples, so an agenda never looks like
 *       two different things on one page.
 */
export type HomepageAgendaPreview = {
    /**
     * Name of the area of responsibility
     */
    readonly name: string;

    /**
     * One line saying which area this is, shown under the name
     */
    readonly scope: string;

    /**
     * Durable context the agenda carries, listed as short chips
     */
    readonly context: readonly string[];

    /**
     * Goals and tasks of different lifecycles which live inside this one agenda
     */
    readonly tasks: readonly HomepageAgendaTask[];

    /**
     * Word on the badge saying the agenda is not waiting to be started
     */
    readonly runningLabel: string;

    /**
     * What the agenda is doing right now, shown in its footer
     */
    readonly status: string;
};

/**
 * One row of the contrast between a one-shot task and a long-running agenda
 */
export type HomepageContrastRow = {
    /**
     * What is being compared, for example who starts the work
     */
    readonly aspect: string;

    /**
     * How a one-shot task behaves
     */
    readonly oneShot: string;

    /**
     * How an agenda behaves
     */
    readonly agenda: string;
};

/**
 * One of the parts an agenda is made of
 */
export type HomepageAgendaPart = {
    readonly title: string;
    readonly description: string;
};

/**
 * One step of a flow which the page walks the reader through
 */
export type HomepageFlowStep = {
    readonly title: string;
    readonly description: string;
};

/**
 * One example agenda, offered to show breadth rather than to redefine the product
 */
export type HomepageExample = {
    /**
     * Name of the area of responsibility
     */
    readonly name: string;

    /**
     * What the agenda keeps an eye on
     */
    readonly watches: string;

    /**
     * A few goals and tasks which live inside it
     */
    readonly tasks: readonly string[];

    /**
     * Whether this example is the one the page explains in depth below
     */
    readonly isFeatured?: boolean;
};

/**
 * One reason the durable agenda is not tied to one vendor or one harness
 */
export type HomepageLeverageBlock = {
    readonly title: string;
    readonly description: ReactNode;

    /**
     * Short, verifiable facts shown as chips under the description
     */
    readonly facts: readonly string[];
};

/**
 * Every word of the main Promptbook homepage, in each language it is published in
 *
 * Note: This is the agenda proposition and nothing else. The company-data proposition - firemní dokumenty, virtuální
 *       zaměstnanec, GDPR - is preserved at `/cs/pro-firmy` and owns its own content in
 *       `businesses/pro-firmy/proFirmyContent.tsx`; neither page may reach into the other's words.
 */
type HomepageContent = {
    /**
     * Copy of the site header this page wears instead of the shared default
     */
    readonly header: {
        /**
         * Line shown in the middle of the header, in place of the shared scarcity note
         */
        readonly note: string;
        readonly ctaMobile: string;
        readonly ctaDesktop: string;
        readonly languageSwitcherLabel: string;
    };

    readonly hero: {
        readonly eyebrow: string;
        readonly heading: ReactNode;
        readonly description: ReactNode;
        readonly cta: string;
        readonly secondaryCta: string;
        readonly agenda: HomepageAgendaPreview;
    };

    readonly contrast: {
        readonly eyebrow: string;
        readonly heading: ReactNode;
        readonly oneShotLabel: string;
        readonly oneShotClaim: string;
        readonly agendaLabel: string;
        readonly agendaClaim: string;
        readonly rows: readonly HomepageContrastRow[];
    };

    readonly anatomy: {
        readonly eyebrow: string;
        readonly heading: ReactNode;
        readonly agendaLabel: string;
        readonly parts: readonly HomepageAgendaPart[];
        readonly backgroundLabel: string;
        readonly backgroundDescription: string;
        readonly outcomeLabel: string;
        readonly outcomeDescription: string;
        readonly humanLoop: string;

        /**
         * The one sentence which keeps an agenda from being read as a scheduled task
         */
        readonly notATask: ReactNode;
    };

    readonly examples: {
        readonly eyebrow: string;
        readonly heading: ReactNode;
        readonly featuredLabel: string;
        readonly watchesLabel: string;
        readonly items: readonly HomepageExample[];

        /**
         * The return to the abstraction, after the examples have done their work
         */
        readonly abstraction: ReactNode;
    };

    readonly maintainedApplication: {
        readonly eyebrow: string;
        readonly heading: ReactNode;
        readonly description: ReactNode;
        readonly steps: readonly HomepageFlowStep[];
        readonly loopLabel: string;
        readonly selfReference: ReactNode;
    };

    readonly leverage: {
        readonly eyebrow: string;
        readonly heading: ReactNode;
        readonly blocks: readonly HomepageLeverageBlock[];
    };

    readonly team: {
        readonly title: string;
        readonly description: ReactNode;
        readonly jiriDescription: ReactNode;
        readonly pavolDescription: ReactNode;
    };

    readonly finalCta: {
        readonly heading: ReactNode;
        readonly description: string;
        readonly cta: string;

        /**
         * What actually happens on the call, in place of a capacity bar
         */
        readonly expectations: readonly string[];
    };

    readonly qualificationPopup: QualificationPopupContent;
};

/**
 * Contact source under which a lead from the homepage is recorded, kept apart from the company-data page's own source
 * so that `/admin/contacts` can still tell which proposition the visitor answered
 */
export const HOMEPAGE_QUALIFICATION_PLACE_NAME = 'homepage-agenda-call';

/**
 * Identifier of the section the hero's secondary action scrolls to
 */
export const HOMEPAGE_AGENDA_SECTION_ID = 'agenda';

const HOMEPAGE_CONTENT = {
    cs: {
        header: {
            note: 'Agendy, ne jednotlivé prompty',
            ctaMobile: 'Probrat agendu',
            ctaDesktop: 'Probrat konkrétní odpovědnost',
            languageSwitcherLabel: 'Jazyk stránky',
        },
        hero: {
            eyebrow: 'Pro firmy a projekty',
            heading: (
                <>
                    Dejte AI na starost celou oblast.
                    <br />
                    Ne jeden úkol.
                </>
            ),
            description: (
                <>
                    Dnešní kódovací agenti zvládnou na jedno zadání překvapivě složitou věc. Firmě ale nechybí lepší
                    zadání — chybí jí, aby se důležité věci řešily pořád. Promptbook drží takovou oblast v běhu na
                    pozadí a ozve se, když je potřeba rozhodnout.
                </>
            ),
            cta: 'Probrat konkrétní odpovědnost',
            secondaryCta: 'Co je agenda',
            agenda: {
                name: 'Údržba a rozvoj aplikace',
                scope: 'Interní objednávkový systém',
                context: ['Repozitář', 'Pravidla a architektura', 'Historie rozhodnutí', 'Testy'],
                tasks: [
                    { label: 'Aktualizovat závislosti a projít testy', cadence: 'každý týden', state: 'done' },
                    { label: 'Dodělat export objednávek do XML', cadence: 'zadáno v pátek', state: 'running' },
                    { label: 'Hlídat chyby z provozu a opravit regrese', cadence: 'průběžně', state: 'scheduled' },
                    { label: 'Změna fakturačních údajů — potvrdíte?', cadence: 'čeká na vás', state: 'escalated' },
                ],
                runningLabel: 'Běží',
                status: 'Běží na pozadí · poslední akce před 20 minutami',
            },
        },
        contrast: {
            eyebrow: 'Jednorázový úkol versus agenda',
            heading: (
                <>
                    Jedno zadání skončí hotové.
                    <br />
                    Agenda pokračuje.
                </>
            ),
            oneShotLabel: 'Jednorázový úkol',
            oneShotClaim: '„Udělej tohle teď.“',
            agendaLabel: 'Agenda',
            agendaClaim: '„Převezmi tuhle oblast.“',
            rows: [
                {
                    aspect: 'Kdo to rozjede',
                    oneShot: 'Člověk otevře chat a znovu vysvětlí situaci',
                    agenda: 'Agenda si kontext drží sama',
                },
                {
                    aspect: 'Rozsah',
                    oneShot: 'Jeden úkol',
                    agenda: 'Víc cílů a úkolů s různou životností',
                },
                {
                    aspect: 'Co se děje potom',
                    oneShot: 'Hotovo — a tím to končí',
                    agenda: 'Sleduje dál, pracuje a vrací se k tomu',
                },
                {
                    aspect: 'Když si není jistá',
                    oneShot: 'Odpoví i tak',
                    agenda: 'Eskaluje a čeká na rozhodnutí',
                },
                {
                    aspect: 'Co z toho zůstane',
                    oneShot: 'Výstup v historii chatu',
                    agenda: 'Oblast, která je pořád pokrytá',
                },
            ],
        },
        anatomy: {
            eyebrow: 'Co to je',
            heading: <>Agenda je ohraničená oblast odpovědnosti, která si drží všechno, co potřebuje.</>,
            agendaLabel: 'Agenda',
            parts: [
                {
                    title: 'Kontext',
                    description: 'Co ta oblast je, jak u vás funguje a co už bylo rozhodnuto.',
                },
                {
                    title: 'Cíle a úkoly',
                    description: 'Opakované i jednorázové, každý s vlastní životností.',
                },
                {
                    title: 'Agenti',
                    description: 'Uvnitř jedné agendy jich může pracovat víc, každý na svém.',
                },
                {
                    title: 'Pravidla a nástroje',
                    description: 'Co se smí, co se musí ověřit a kam agenda sahá.',
                },
            ],
            backgroundLabel: 'Běží na pozadí',
            backgroundDescription: 'Agenda si bere úkoly sama, pracuje a sleduje, co se v oblasti mění.',
            outcomeLabel: 'Výstupy a eskalace',
            outcomeDescription: 'Hotová práce — a tam, kde se nemá rozhodovat sama, otázka pro člověka.',
            humanLoop: 'Kdykoli do agendy vidíte, měníte zadání, schvalujete a opravujete.',
            notATask: (
                <>
                    Agenda není jiné slovo pro naplánovanou úlohu. Účetnictví je agenda; přiznání k DPH, hlídání
                    termínů a zpracování dokladů jsou úkoly uvnitř ní. Trvalá je ta agenda — který agent nebo prompt ji
                    právě vykonává, je technický detail.
                </>
            ),
        },
        examples: {
            eyebrow: 'Příklady',
            heading: <>Agendou může být jakákoli opakovaná odpovědnost.</>,
            featuredLabel: 'Rozebráno níž',
            watchesLabel: 'Hlídá',
            items: [
                {
                    name: 'Web nebo aplikace, která se udržuje sama',
                    watches: 'repozitář, provoz a nahlášené chyby',
                    tasks: [
                        'Zapracovat novou funkci podle zadání',
                        'Opravit regresi, než si jí všimnou uživatelé',
                        'Držet závislosti a testy v pořádku',
                    ],
                    isFeatured: true,
                },
                {
                    name: 'Zákaznická komunikace',
                    watches: 'příchozí poptávky a rozdělané konverzace',
                    tasks: [
                        'Připravit odpověď podle toho, co o zákazníkovi víme',
                        'Upozornit na konverzaci, která se zasekla',
                        'Předat dál, co má rozhodnout člověk',
                    ],
                },
                {
                    name: 'Administrativa a účetní podklady',
                    watches: 'doklady, termíny a chybějící podklady',
                    tasks: [
                        'Zpracovat doklady a zařadit je',
                        'Hlásit blížící se termín dopředu',
                        'Připravit podklady pro účetní ke kontrole',
                    ],
                },
                {
                    name: 'Obsah a provoz webu',
                    watches: 'stránky, odkazy a to, co je potřeba aktualizovat',
                    tasks: [
                        'Zapracovat změnu ceníku na všech místech',
                        'Najít stránky, které už neplatí',
                        'Připravit text k odsouhlasení',
                    ],
                },
                {
                    name: 'Provozní agenda vaší firmy',
                    watches: 'to, co u vás drží jeden člověk v hlavě',
                    tasks: [
                        'Opakovaná kontrola, na kterou není čas',
                        'Příprava podkladů, než je někdo potřebuje',
                        'Hlášení toho, co vybočilo',
                    ],
                },
            ],
            abstraction: (
                <>
                    Promptbook není nástroj na účetnictví, na e-maily ani na weby. Agenda je forma — co do ní patří,
                    určuje vaše firma. Firmy se skládají z odpovědností, ne z promptů, a zdravá firma funguje jako
                    stroj právě proto, že se ty opakované věci dál řeší.
                </>
            ),
        },
        maintainedApplication: {
            eyebrow: 'Nejblíž nám je tahle',
            heading: <>Aplikace, která se nejen vygeneruje, ale dál se udržuje.</>,
            description: (
                <>
                    Generátory webů a aplikací udělají působivý první výsledek. Skutečný web nebo aplikace ale potřebuje
                    opravy, změny a rozvoj ještě roky potom. Promptbook umí „udržuj a rozvíjej tuhle aplikaci“ držet
                    jako agendu — a vy u toho nemusíte ovládat kódovacího agenta. Vidíte udržovanou aplikaci.
                </>
            ),
            steps: [
                {
                    title: 'Agenda zná vaši aplikaci',
                    description:
                        'Repozitář, architektura, pravidla a to, co už bylo rozhodnuto. Kontext zůstává, nevysvětluje se znovu.',
                },
                {
                    title: 'Změna se zapíše jako úkol',
                    description: 'Ne jako prompt do chatu. Zadání zůstane v agendě i poté, co se na něj začne pracovat.',
                },
                {
                    title: 'Silný kódovací agent odvede práci',
                    description:
                        'Agenda si k úkolu pustí ten harness, který se na něj hodí. Kód vzniká pod kapotou, protože je to nejpřesnější způsob, jak tu práci udělat.',
                },
                {
                    title: 'Kvalita se ověří, než to jde dál',
                    description:
                        'Lint, typy, testy a end-to-end průchod. Co neprojde, se neodevzdá — agenda to řeší dál.',
                },
                {
                    title: 'A pokračuje se',
                    description:
                        'Změna se zapíše do historie, agenda si bere další úkol a sleduje, co se v aplikaci mezitím změnilo.',
                },
            ],
            loopLabel: 'A znovu, u dalšího úkolu',
            selfReference: (
                <>
                    Tahle stránka je taková agenda. Web, který právě čtete, se udržuje a rozvíjí přes{' '}
                    <code className="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-[0.85em] text-cyan-200">
                        ptbk coder
                    </code>{' '}
                    — zadání leží v repozitáři jako úkoly, agenda má svoje pravidla a každá změna musí projít testy,
                    než se odevzdá.
                </>
            ),
        },
        leverage: {
            eyebrow: 'Jak je to postavené',
            heading: <>Staví to na nejsilnějších agentech, které dneska existují.</>,
            blocks: [
                {
                    title: 'Silné kódovací agenty bereme jako páku',
                    description: (
                        <>
                            ChatGPT, Codex, Claude Code a podobné nástroje jsou vynikající a Promptbook je nenahrazuje.
                            Staví na jejich síle a dává jim trvalost a provoz — agendu, do které se vracejí, místo
                            okna, které se zavře.
                        </>
                    ),
                    facts: ['Práci dělá existující harness', 'Kód jen tam, kde je to nejlepší cesta'],
                },
                {
                    title: 'Agenda nepatří jednomu dodavateli',
                    description: (
                        <>
                            Trvalou částí je agenda, ne model pod ní. Který harness a který model ji právě vykonává, je
                            volba — tuhle stránku umí posouvat Claude Code i OpenAI Codex nad jedním a tím samým
                            zadáním.
                        </>
                    ),
                    facts: ['claude-code', 'openai-codex', 'Model je volba, ne závislost'],
                },
                {
                    title: 'Agenda žije ve složce',
                    description: (
                        <>
                            Kontext, definice agentů, zadání a historie leží jako soubory v jedné složce — u technického
                            projektu rovnou v Gitu. Je to vidět, dá se to opravit a je jasné, kdo co změnil. Vědět, jak
                            funguje Git, k tomu ale potřeba není.
                        </>
                    ),
                    facts: ['Kontext jako soubory', 'Dohledatelná historie'],
                },
            ],
        },
        team: {
            title: 'Kdo za tím stojí',
            description: <>Promptbook staví a provozuje malý tým, na který se dovoláte:</>,
            jiriDescription: <>Ph.D. v matematice, dřív výzkumník v Národním superpočítačovém centru IT4Innovations.</>,
            pavolDescription: <>Jeden z nejaktivnějších open-source vývojářů v ČR, 15+ let praxe.</>,
        },
        finalCta: {
            heading: <>Která odpovědnost by u vás měla běžet dál sama?</>,
            description:
                'Projdeme s vámi jednu konkrétní oblast a řekneme si na rovinu, jestli z ní dnes agenda udělat jde, nebo ještě ne.',
            cta: 'Probrat konkrétní odpovědnost',
            expectations: [
                '20 minut, konkrétní oblast, žádná prezentace',
                'Řekneme i to, co takhle zatím nefunguje',
                'Odnesete si návrh, jak tu oblast ohraničit',
            ],
        },
        qualificationPopup: {
            dialogTitle: 'Nezávazná konzultace',
            intro: '3 otázky, půl minuty. Ať víme, o čem s vámi mluvit.',
            questions: [
                {
                    id: 'agenda_area',
                    question: 'Co by u vás mělo běžet průběžně?',
                    type: 'single',
                    options: [
                        'Web nebo aplikace — údržba a rozvoj',
                        'Zákaznická komunikace',
                        'Administrativa a účetní podklady',
                        'Obsah a provoz webu',
                        'Něco jiného, co máme u nás',
                        'Zatím hledám, co by to mohlo být',
                    ],
                },
                {
                    id: 'agenda_today',
                    question: 'Jak se to řeší dneska?',
                    type: 'single',
                    options: [
                        'Dělá to člověk ručně',
                        'Pokaždé to znovu zadáváme do chatu s AI',
                        'Máme automatizace, ale neudrží se',
                        'Pořádně se to neřeší',
                    ],
                },
                {
                    id: 'agenda_scale',
                    question: 'Pro koho to řešíte?',
                    type: 'single',
                    options: ['Vlastní projekt', 'Firma do 10 lidí', '10 až 50 lidí', 'Víc než 50 lidí'],
                },
                {
                    id: 'contact',
                    question: 'Kam se vám ozveme?',
                    subtitle: 'Jirka se vám ozve do 24 hodin.',
                    type: 'contact',
                    fields: [
                        { id: 'name', label: 'Jméno', type: 'text', placeholder: 'Jan Novák' },
                        { id: 'company', label: 'Firma nebo projekt', type: 'text', placeholder: 'Název' },
                        { id: 'email', label: 'E-mail', type: 'email', placeholder: 'jan@firma.cz' },
                        {
                            id: 'phone',
                            label: 'Telefon',
                            type: 'tel',
                            placeholder: '+420 777 123 456',
                            inputMode: 'tel',
                        },
                    ],
                },
            ],
            requiredFieldError: 'Toto pole je povinné.',
            invalidEmailError: 'Zadejte prosím platný e-mail.',
            successTitle: (name) => `Díky, ${name}!`,
            successDescription: (
                <>
                    Do 24 hodin se vám ozve <strong className="text-[#0f172a]">Jirka</strong>. Projdeme tu oblast, kterou
                    jste vybrali, a řekneme si, co z ní jde udělat.
                </>
            ),
            successEmailPrefix: 'Potvrzení posíláme na',
            close: 'Zavřít',
            stepLabel: (currentStep, totalSteps) => `Krok ${currentStep + 1} z ${totalSteps}`,
            submitting: 'Odesílám...',
            submit: 'Odeslat',
            back: 'Zpět',
        },
    },
    en: {
        header: {
            note: 'Agendas, not individual prompts',
            ctaMobile: 'Book a call',
            ctaDesktop: 'Talk through one responsibility',
            languageSwitcherLabel: 'Page language',
        },
        hero: {
            eyebrow: 'For companies and projects',
            heading: (
                <>
                    Hand AI a whole area.
                    <br />
                    Not a single task.
                </>
            ),
            description: (
                <>
                    Today&rsquo;s coding agents handle remarkably complex work from a single prompt. What a company is
                    missing is not a better prompt — it is having the important things keep getting handled. Promptbook
                    keeps such an area running in the background and comes back to you when something needs deciding.
                </>
            ),
            cta: 'Talk through one responsibility',
            secondaryCta: 'What an agenda is',
            agenda: {
                name: 'Maintaining and evolving the app',
                scope: 'Internal ordering system',
                context: ['Repository', 'Rules and architecture', 'Past decisions', 'Tests'],
                tasks: [
                    { label: 'Update dependencies and run the tests', cadence: 'every week', state: 'done' },
                    { label: 'Finish the XML order export', cadence: 'filed on Friday', state: 'running' },
                    { label: 'Watch production errors and fix regressions', cadence: 'ongoing', state: 'scheduled' },
                    { label: 'Change to billing details — approve?', cadence: 'waiting for you', state: 'escalated' },
                ],
                runningLabel: 'Running',
                status: 'Running in the background · last action 20 minutes ago',
            },
        },
        contrast: {
            eyebrow: 'One-shot task versus agenda',
            heading: (
                <>
                    A prompt finishes and is done.
                    <br />
                    An agenda carries on.
                </>
            ),
            oneShotLabel: 'One-shot task',
            oneShotClaim: '“Do this now.”',
            agendaLabel: 'Agenda',
            agendaClaim: '“Take this area over.”',
            rows: [
                {
                    aspect: 'Who starts it',
                    oneShot: 'A person opens a chat and explains the situation again',
                    agenda: 'The agenda already holds its context',
                },
                {
                    aspect: 'Scope',
                    oneShot: 'One task',
                    agenda: 'Several goals and tasks with different lifecycles',
                },
                {
                    aspect: 'What happens next',
                    oneShot: 'Done — and that is the end of it',
                    agenda: 'Keeps watching, keeps working, comes back to it',
                },
                {
                    aspect: 'When it is unsure',
                    oneShot: 'Answers anyway',
                    agenda: 'Escalates and waits for a decision',
                },
                {
                    aspect: 'What is left behind',
                    oneShot: 'An answer in the chat history',
                    agenda: 'An area that stays covered',
                },
            ],
        },
        anatomy: {
            eyebrow: 'What it is',
            heading: <>An agenda is a bounded area of responsibility that holds everything it needs.</>,
            agendaLabel: 'Agenda',
            parts: [
                {
                    title: 'Context',
                    description: 'What the area is, how it works here and what has already been decided.',
                },
                {
                    title: 'Goals and tasks',
                    description: 'Recurring and one-off alike, each with its own lifecycle.',
                },
                {
                    title: 'Agents',
                    description: 'Several of them can work inside one agenda, each on its own part.',
                },
                {
                    title: 'Rules and tools',
                    description: 'What is allowed, what must be verified and how far the agenda reaches.',
                },
            ],
            backgroundLabel: 'Runs in the background',
            backgroundDescription: 'The agenda picks up its own tasks, works on them and watches what changes.',
            outcomeLabel: 'Outcomes and escalations',
            outcomeDescription: 'Finished work — and, where it must not decide alone, a question for a person.',
            humanLoop: 'You can look inside, change the brief, approve and correct at any point.',
            notATask: (
                <>
                    An agenda is not another word for a scheduled job. Accounting is an agenda; filing VAT, watching
                    deadlines and processing documents are tasks inside it. The agenda is the durable part — which agent
                    or prompt happens to be carrying it out is an implementation detail.
                </>
            ),
        },
        examples: {
            eyebrow: 'Examples',
            heading: <>Any recurring responsibility can become an agenda.</>,
            featuredLabel: 'Explained below',
            watchesLabel: 'Watches',
            items: [
                {
                    name: 'A website or app that maintains itself',
                    watches: 'the repository, production and reported bugs',
                    tasks: [
                        'Build a new feature from a written brief',
                        'Fix a regression before users run into it',
                        'Keep dependencies and tests healthy',
                    ],
                    isFeatured: true,
                },
                {
                    name: 'Customer communication',
                    watches: 'incoming enquiries and open conversations',
                    tasks: [
                        'Draft a reply from what we know about the customer',
                        'Flag a conversation that has stalled',
                        'Hand over whatever a person should decide',
                    ],
                },
                {
                    name: 'Administration and bookkeeping records',
                    watches: 'documents, deadlines and missing paperwork',
                    tasks: [
                        'Process documents and file them',
                        'Raise an approaching deadline in advance',
                        'Prepare records for the accountant to check',
                    ],
                },
                {
                    name: 'Content and website operations',
                    watches: 'pages, links and whatever needs updating',
                    tasks: [
                        'Apply a price change everywhere it appears',
                        'Find pages that are no longer true',
                        'Draft the wording for sign-off',
                    ],
                },
                {
                    name: 'An operational agenda of your own',
                    watches: 'the things one person currently keeps in their head',
                    tasks: [
                        'The recurring check nobody has time for',
                        'Preparing records before somebody needs them',
                        'Reporting whatever looks out of line',
                    ],
                },
            ],
            abstraction: (
                <>
                    Promptbook is not an accounting tool, an inbox assistant or a website builder. The agenda is the
                    form — what goes inside it is yours. Companies are made of responsibilities rather than prompts, and
                    a healthy company runs like a machine precisely because those recurring things keep being handled.
                </>
            ),
        },
        maintainedApplication: {
            eyebrow: 'The one closest to home',
            heading: <>An application that is not just generated, but kept alive.</>,
            description: (
                <>
                    Website and app generators produce an impressive first result. A real website or application,
                    though, needs fixes, changes and new work for years afterwards. Promptbook can hold
                    &ldquo;maintain and evolve this application&rdquo; as an agenda — and you do not have to operate a
                    coding agent to get it. You see the application being maintained.
                </>
            ),
            steps: [
                {
                    title: 'The agenda knows your application',
                    description:
                        'The repository, the architecture, the rules and what has already been decided. The context stays put instead of being re-explained.',
                },
                {
                    title: 'A change is written down as a task',
                    description:
                        'Not typed into a chat. The brief stays in the agenda even after the work on it has started.',
                },
                {
                    title: 'A strong coding agent does the work',
                    description:
                        'The agenda runs whichever harness suits the task. Code happens under the hood, because that is the most precise way to get the work done.',
                },
                {
                    title: 'Quality is checked before anything ships',
                    description:
                        'Lint, types, tests and an end-to-end run. What does not pass is not handed over — the agenda keeps at it.',
                },
                {
                    title: 'And it carries on',
                    description:
                        'The change goes into the history, the agenda picks up the next task and watches what changed in the meantime.',
                },
            ],
            loopLabel: 'And again, with the next task',
            selfReference: (
                <>
                    This page is one of those agendas. The site you are reading is maintained and evolved through{' '}
                    <code className="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-[0.85em] text-cyan-200">
                        ptbk coder
                    </code>{' '}
                    — the briefs sit in the repository as tasks, the agenda has rules of its own, and every change has
                    to pass the tests before it ships.
                </>
            ),
        },
        leverage: {
            eyebrow: 'How it is built',
            heading: <>It is built on the strongest agents available today.</>,
            blocks: [
                {
                    title: 'Strong coding agents are the leverage',
                    description: (
                        <>
                            ChatGPT, Codex, Claude Code and tools like them are excellent, and Promptbook does not
                            replace them. It builds on their strength and gives them persistence and operation — an
                            agenda to come back to instead of a window that closes.
                        </>
                    ),
                    facts: ['An existing harness does the work', 'Code only where it is the best route'],
                },
                {
                    title: 'The agenda belongs to no single vendor',
                    description: (
                        <>
                            The durable part is the agenda, not the model underneath it. Which harness and which model
                            carries it out is a choice — this very page can be moved forward by Claude Code and by
                            OpenAI Codex working from one and the same brief.
                        </>
                    ),
                    facts: ['claude-code', 'openai-codex', 'The model is a choice, not a dependency'],
                },
                {
                    title: 'An agenda lives in a folder',
                    description: (
                        <>
                            Context, agent definitions, briefs and history sit as files in one folder — for a technical
                            project, straight in Git. You can see it, correct it and tell who changed what. Knowing how
                            Git works is not a prerequisite.
                        </>
                    ),
                    facts: ['Context as files', 'A history you can follow'],
                },
            ],
        },
        team: {
            title: 'Who is behind it',
            description: <>Promptbook is built and run by a small team you can actually reach:</>,
            jiriDescription: (
                <>Ph.D. in Mathematics, former researcher at the IT4Innovations National Supercomputing Centre.</>
            ),
            pavolDescription: <>One of the most active open-source developers in Czechia, 15+ years of experience.</>,
        },
        finalCta: {
            heading: <>Which responsibility should keep running on its own?</>,
            description:
                'We will walk through one specific area with you and say plainly whether it can become an agenda today, or not yet.',
            cta: 'Talk through one responsibility',
            expectations: [
                '20 minutes, one concrete area, no slide deck',
                'We will also tell you what does not work this way yet',
                'You leave with a proposal for how to bound that area',
            ],
        },
        qualificationPopup: {
            dialogTitle: 'No-commitment consultation',
            intro: 'Three questions, half a minute. So we know what to talk about.',
            questions: [
                {
                    id: 'agenda_area',
                    question: 'What should keep running at your place?',
                    type: 'single',
                    options: [
                        'A website or app — maintenance and new work',
                        'Customer communication',
                        'Administration and bookkeeping records',
                        'Content and website operations',
                        'Something else specific to us',
                        'Still working out what it could be',
                    ],
                },
                {
                    id: 'agenda_today',
                    question: 'How is it handled today?',
                    type: 'single',
                    options: [
                        'A person does it by hand',
                        'We re-explain it to an AI chat every time',
                        'We have automations, but they do not hold up',
                        'It is not really handled',
                    ],
                },
                {
                    id: 'agenda_scale',
                    question: 'Who is this for?',
                    type: 'single',
                    options: ['A project of my own', 'A company of up to 10', '10 to 50 people', 'More than 50 people'],
                },
                {
                    id: 'contact',
                    question: 'Where should we reach you?',
                    subtitle: 'Jiří will get back to you within 24 hours.',
                    type: 'contact',
                    fields: [
                        { id: 'name', label: 'Name', type: 'text', placeholder: 'Jane Doe' },
                        { id: 'company', label: 'Company or project', type: 'text', placeholder: 'Name' },
                        { id: 'email', label: 'Email', type: 'email', placeholder: 'jane@company.com' },
                        {
                            id: 'phone',
                            label: 'Phone',
                            type: 'tel',
                            placeholder: '+420 777 123 456',
                            inputMode: 'tel',
                        },
                    ],
                },
            ],
            requiredFieldError: 'This field is required.',
            invalidEmailError: 'Please enter a valid email address.',
            successTitle: (name) => `Thanks, ${name}!`,
            successDescription: (
                <>
                    <strong className="text-[#0f172a]">Jiří</strong> will get back to you within 24 hours. We will go
                    through the area you picked and say what can be made of it.
                </>
            ),
            successEmailPrefix: 'We are sending a confirmation to',
            close: 'Close',
            stepLabel: (currentStep, totalSteps) => `Step ${currentStep + 1} of ${totalSteps}`,
            submitting: 'Sending...',
            submit: 'Send',
            back: 'Back',
        },
    },
} satisfies Record<HomepageLanguage, HomepageContent>;

/**
 * Reads every word of the homepage in the language the visitor is reading
 */
export function getHomepageContent(language: HomepageLanguage = 'cs'): HomepageContent {
    return HOMEPAGE_CONTENT[language];
}
