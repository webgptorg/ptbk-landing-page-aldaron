import type { QualificationPopupContent } from '@/components/qualification-popup';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';

export type AgendaExample = {
    id: string;
    label: string;
    title: string;
    goal: string;
    context: string;
    steps: { title: string; detail: string }[];
    approval: string;
    outcome: string;
};

type HomepageContent = {
    skipLink: string;
    navigation: { model: string; examples: string; technology: string; language: string };
    callToAction: string;
    mobileCallToAction: string;
    hero: {
        eyebrow: string;
        heading: string;
        emphasis: string;
        description: string;
        secondaryAction: string;
        callNote: string;
        illustration: string;
        oneShotLabel: string;
        oneShotPrompt: string;
        oneShotSteps: string[];
        agendaLabel: string;
        agendaPrompt: string;
        agendaSteps: string[];
        continuation: string;
        human: string;
    };
    model: {
        eyebrow: string;
        title: string;
        description: string;
        parts: { title: string; description: string; example: string }[];
        work: string[];
        results: string;
        controlTitle: string;
        controlDescription: string;
    };
    examples: {
        eyebrow: string;
        title: string;
        selector: string;
        illustration: string;
        context: string;
        approval: string;
        outcome: string;
        items: AgendaExample[];
        conclusion: string;
    };
    technology: {
        eyebrow: string;
        title: string;
        description: string;
        harnessTitle: string;
        harnessDescription: string;
        vendorDescription: string;
        workspaceTitle: string;
        workspaceDescription: string;
        folder: string;
        files: { name: string; description: string }[];
        link: string;
    };
    team: { title: string; description: null; jiriDescription: string; pavolDescription: string };
    contact: { title: string; description: string; steps: string[]; companyLink: string };
    footer: { productLinks: { href: string; text: string }[]; claim: string };
    qualification: QualificationPopupContent;
    confirmation: {
        title: string;
        description: string;
        steps: { title: string; description: string }[];
        email: string;
        back: string;
    };
};

/** Czech is the source of truth. Examples describe bounded agendas, not preconnected services or a live dashboard. */
const HOMEPAGE_CONTENT: Record<SupportedHomepageLanguage, HomepageContent> = {
    cs: {
        skipLink: 'Přejít na obsah',
        navigation: {
            model: 'Jak funguje agenda',
            examples: 'Příklady',
            technology: 'Pod kapotou',
            language: 'English',
        },
        callToAction: 'Probrat naši první agendu',
        mobileCallToAction: 'Začít',
        hero: {
            eyebrow: 'Promptbook pro firmy a projekty',
            heading: 'Svěřte AI agendu.',
            emphasis: 'Ať práce pokračuje.',
            description:
                'Údržba aplikace, komunikace se zákazníky nebo provoz firmy. Promptbook mění jednotlivé AI úkoly v dlouhodobou odpovědnost, která se řeší na pozadí. Bez nového zadání pro každý další krok.',
            secondaryAction: 'Podívat se, jak to funguje',
            callNote: 'Na strategickém hovoru zdarma vybereme vhodnou agendu a její hranice.',
            illustration: 'Od jednoho úkolu k průběžné péči',
            oneShotLabel: 'Jednorázový úkol',
            oneShotPrompt: '„Vytvoř mi web.“',
            oneShotSteps: ['Zadání', 'Výsledek', 'Hotovo'],
            agendaLabel: 'Dlouhodobá agenda',
            agendaPrompt: '„Starej se o náš web a rozvíjej ho.“',
            agendaSteps: ['Sleduje změny', 'Pracuje', 'Ověřuje'],
            continuation: 'Další změna. Stejný kontext. Práce pokračuje.',
            human: 'Vy určujete směr a schvalujete důležité kroky.',
        },
        model: {
            eyebrow: 'Co je agenda',
            title: 'Firma funguje díky odpovědnostem, které někdo průběžně řeší.',
            description:
                'Agenda je vymezená oblast odpovědnosti s vlastní pamětí, cíli a pravidly. Obsahuje jednorázové i opakované úkoly. Jednotlivý úkol skončí; agenda má na co navázat.',
            parts: [
                {
                    title: 'Kontext a pravidla',
                    description: 'Co má znát, kam smí zasáhnout a kdy se má zeptat.',
                    example: 'Znalosti · historie · hranice',
                },
                {
                    title: 'Cíle a úkoly',
                    description: 'Více cílů, průběžná péče i úkoly s konkrétním termínem.',
                    example: 'Záměr · plán · další kroky',
                },
                {
                    title: 'Agenti a nástroje',
                    description: 'V jedné agendě může spolupracovat více agentů. Každý podle své role.',
                    example: 'Realizace · kontrola · připojené nástroje',
                },
            ],
            work: ['Sleduje podněty', 'Volí další krok', 'Pracuje a ověřuje', 'Navazuje'],
            results: 'Výsledky průběžně. Otázky a rozhodnutí, když je potřeba člověk.',
            controlTitle: 'Běžný další krok bez dalšího promptu. Směr zůstává na vás.',
            controlDescription:
                'Nahlížíte do práce, opravujete zadání, měníte priority a schvalujete kroky podle domluvených pravidel. Rozsah samostatné práce vychází z přístupů, nástrojů a hranic konkrétní agendy.',
        },
        examples: {
            eyebrow: 'Jedna myšlenka, různé odpovědnosti',
            title: 'Vytvořit aplikaci je začátek. Udržovat ji je agenda.',
            selector: 'Vybrat příklad agendy',
            illustration: 'Ilustrační průběh agendy',
            context: 'Co si agenda nese dál',
            approval: 'Kdy vstupuje člověk',
            outcome: 'O co je postaráno',
            items: [
                {
                    id: 'software',
                    label: 'Web a aplikace',
                    title: 'Udržovat a rozvíjet naši aplikaci',
                    goal: 'První verzi už máme. Teď potřebujeme vyřizovat změny, opravovat chyby a držet kvalitu i za měsíc.',
                    context: 'Repozitář, produktové zadání, pravidla kvality, testy a historie rozhodnutí.',
                    steps: [
                        {
                            title: 'Porozumět aplikaci',
                            detail: 'Zorientovat se v kódu, zadání a dosavadních rozhodnutích.',
                        },
                        {
                            title: 'Zpracovat další změnu',
                            detail: 'Vzít požadavek nebo chybu a navrhnout konkrétní postup.',
                        },
                        {
                            title: 'Upravit a otestovat',
                            detail: 'Využít silné nástroje pro vývoj, spustit testy a opravit nalezené problémy.',
                        },
                        {
                            title: 'Předat změnu ke kontrole',
                            detail: 'Ukázat výsledek a podle pravidel vyžádat schválení před nasazením.',
                        },
                        {
                            title: 'Pokračovat v péči',
                            detail: 'Navázat další opravou, aktualizací nebo rozvojem se stejným kontextem.',
                        },
                    ],
                    approval:
                        'Změnu priorit, nejasné zadání nebo nasazení řešíte podle dohodnutých pravidel. Nemusíte ručně spouštět každý vývojový úkol.',
                    outcome: 'Aplikace, o kterou se průběžně pečuje. Nejen její první vygenerovaná verze.',
                },
                {
                    id: 'communication',
                    label: 'Zákaznická komunikace',
                    title: 'Průběžně vyřizovat zákaznické dotazy',
                    goal: 'Příchozí zprávy potřebují kontext, návaznost a jasná pravidla pro odpovědi.',
                    context: 'Informace o službě, historie komunikace, tón odpovědí a oprávnění.',
                    steps: [
                        { title: 'Roztřídit příchozí zprávy', detail: 'Rozpoznat téma a to, co je potřeba vyřešit.' },
                        { title: 'Připravit odpověď', detail: 'Doplnit souvislosti z dostupných podkladů.' },
                        {
                            title: 'Předat výjimky',
                            detail: 'Nejasnosti a závazky vůči zákazníkovi dát člověku ke schválení.',
                        },
                        {
                            title: 'Navázat na otevřené případy',
                            detail: 'Udržet přehled o tom, co čeká na odpověď nebo další krok.',
                        },
                    ],
                    approval:
                        'Odesílání a přístupy se nastavují pro konkrétní agendu. Sporné případy a nové závazky zůstávají u člověka.',
                    outcome: 'Komunikace s návazností i mezi jednotlivými zprávami.',
                },
                {
                    id: 'administration',
                    label: 'Účetní administrativa',
                    title: 'Udržovat podklady a termíny v pořádku',
                    goal: 'Účetnictví je agenda. Příprava podkladů k DPH, zpracování dokladů a hlídání termínů jsou její různé úkoly.',
                    context: 'Dostupné doklady, interní postupy, kalendář termínů a odpovědné osoby.',
                    steps: [
                        { title: 'Zpracovat dostupné doklady', detail: 'Uspořádat je a označit chybějící údaje.' },
                        { title: 'Sledovat termíny', detail: 'Připomenout, co se blíží a které podklady ještě chybí.' },
                        {
                            title: 'Připravit podklady ke kontrole',
                            detail: 'Dát účetnímu přehled a nejasnosti k rozhodnutí.',
                        },
                        { title: 'Pokračovat dalším obdobím', detail: 'Navázat na dosavadní postupy a nové doklady.' },
                    ],
                    approval:
                        'Odborné posouzení, schválení a zákonná podání zůstávají na odpovědném člověku. Konkrétní napojení se domlouvá při zavedení.',
                    outcome: 'Průběžně připravené podklady pro kontrolu účetním.',
                },
                {
                    id: 'content',
                    label: 'Obsah a provoz webu',
                    title: 'Udržovat informace na webu aktuální',
                    goal: 'Napsat jeden článek nestačí. Informace, odkazy a publikační plán potřebují průběžnou péči.',
                    context: 'Schválené zdroje, styl komunikace, struktura webu a publikační pravidla.',
                    steps: [
                        { title: 'Projít domluvené zdroje', detail: 'Najít změny, které se mají promítnout na web.' },
                        { title: 'Připravit úpravy', detail: 'Aktualizovat návrhy textů a související odkazy.' },
                        {
                            title: 'Předložit obsah ke schválení',
                            detail: 'Ukázat, co se mění a z jakých podkladů to vychází.',
                        },
                        { title: 'Vrátit se k další kontrole', detail: 'Pokračovat podle plánu i nových podnětů.' },
                    ],
                    approval:
                        'Vy určujete důvěryhodné zdroje a pravidla publikace. Citlivé informace a veřejná tvrzení procházejí kontrolou.',
                    outcome: 'Obsah, který nezůstane stát po prvním zveřejnění.',
                },
            ],
            conclusion:
                'Stejný princip platí i pro vaši vlastní provozní agendu: jasná odpovědnost, trvalý kontext a práce, která má na co navazovat.',
        },
        technology: {
            eyebrow: 'Na čem Promptbook staví',
            title: 'Silné AI nástroje. Trvalé zadání.',
            description:
                'Dnešní AI zvládá složité jednorázové úkoly výborně. Promptbook na této schopnosti staví a zasazuje ji do dlouhodobé práce pro firmu nebo projekt.',
            harnessTitle: 'Schopnosti pod kapotou',
            harnessDescription:
                'Promptbook Coder zapojuje tyto vývojové nástroje. Mohou psát kód, spouštět testy a provádět změny tam, kde je to pro agendu nejlepší cesta.',
            vendorDescription:
                'Agenda není vázaná na jednoho dodavatele modelu. Nástroje a modely jsou volba pro konkrétní práci; cíle a kontext patří agendě. Vy řešíte výsledek.',
            workspaceTitle: 'Pracovní prostor, který přetrvá',
            workspaceDescription:
                'Tam, kde to dává smysl, žije agenda ve složce nebo Git repozitáři. Kontext, definice agentů, zadání a historie tak zůstávají pohromadě i mezi jednotlivými běhy.',
            folder: 'vaše-agenda/',
            files: [
                { name: 'kontext/', description: 'znalosti a souvislosti' },
                { name: 'cíle-a-úkoly/', description: 'zadání, plán a priority' },
                { name: 'agenti/', description: 'role, instrukce a nástroje' },
                { name: 'historie/', description: 'změny a rozhodnutí' },
            ],
            link: 'Prozkoumat Promptbook Coder',
        },
        team: {
            title: 'Lidé za Promptbookem',
            description: null,
            jiriDescription: 'Matematik a spoluzakladatel Promptbooku.',
            pavolDescription: 'Vývojář a spoluzakladatel Promptbooku.',
        },
        contact: {
            title: 'Která agenda by měla pokračovat i bez vás u klávesnice?',
            description:
                'Začněme jednou konkrétní odpovědností. Společně vybereme první krok a ověříme, co pro něj Promptbook potřebuje.',
            steps: ['Vymezíme cíl', 'Projdeme nástroje a přístupy', 'Domluvíme hranice a schvalování'],
            companyLink: 'Hledáte odpovědi nad firemními dokumenty? Promptbook pro firmy',
        },
        footer: {
            productLinks: [
                { href: '#kontakt', text: 'Probrat agendu' },
                { href: '/cs/pro-firmy', text: 'Firemní data a dokumenty' },
                { href: 'https://coder.ptbk.io/', text: 'Promptbook Coder' },
                { href: 'https://github.com/webgptorg/promptbook', text: 'Dokumentace' },
                { href: '/branding', text: 'Branding' },
            ],
            claim: 'AI pro agendy, které pokračují.',
        },
        qualification: {
            dialogTitle: 'Proberme vaši první agendu',
            intro: 'Pomozte nám připravit strategický hovor o vaší agendě.',
            questions: [
                {
                    id: 'agenda',
                    question: 'O kterou oblast se má AI průběžně starat?',
                    type: 'single',
                    options: [
                        'Web nebo aplikace',
                        'Zákaznická komunikace',
                        'Účetní administrativa',
                        'Obsah a provoz webu',
                        'Jiná firemní nebo projektová agenda',
                    ],
                },
                {
                    id: 'support',
                    question: 'S čím chcete začít?',
                    type: 'single',
                    options: [
                        'Vybrat vhodnou agendu a její hranice',
                        'Navázat na existující projekt nebo proces',
                        'Probrat možnosti a konkrétní napojení',
                    ],
                },
                {
                    id: 'urgency',
                    question: 'Kdy byste chtěli začít?',
                    type: 'single',
                    options: ['Co nejdřív', 'Příští kvartál', 'Zatím zkoumáme možnosti'],
                },
                {
                    id: 'contact',
                    question: 'Kam se vám ozveme?',
                    type: 'contact',
                    subtitle: 'Domluvíme termín hovoru. Vaše odpovědi nám pomohou se připravit.',
                    fields: [
                        { id: 'name', label: 'Jméno', type: 'text', placeholder: 'Jan Novák' },
                        {
                            id: 'company',
                            label: 'Firma nebo projekt',
                            type: 'text',
                            placeholder: 'Název firmy nebo projektu',
                        },
                        { id: 'email', label: 'E-mail', type: 'email', placeholder: 'jan@firma.cz' },
                        {
                            id: 'phone',
                            label: 'Telefon',
                            type: 'tel',
                            inputMode: 'tel',
                            placeholder: '+420 777 123 456',
                        },
                    ],
                },
            ],
            close: 'Zavřít',
            stepLabel: (step, total) => `Krok ${step + 1} z ${total}`,
            submitting: 'Odesílám…',
            submit: 'Domluvit hovor zdarma',
            back: 'Zpět',
        },
        confirmation: {
            title: 'Děkujeme za váš zájem',
            description: 'Vaše odpovědi jsme přijali. Teď spolu najdeme první smysluplnou agendu.',
            steps: [
                {
                    title: 'Ozveme se vám',
                    description: 'Projdeme vaše odpovědi a domluvíme termín strategického hovoru.',
                },
                {
                    title: 'Vymezíme první agendu',
                    description: 'Probereme cíl, dostupné nástroje a kroky, které mají vyžadovat váš souhlas.',
                },
                {
                    title: 'Dohodneme další postup',
                    description: 'Společně posoudíme proveditelnost a navrhneme konkrétní první krok.',
                },
            ],
            email: 'Kontaktní e-mail',
            back: 'Zpět na hlavní stránku',
        },
    },
    en: {
        skipLink: 'Skip to content',
        navigation: {
            model: 'How agendas work',
            examples: 'Examples',
            technology: 'Under the hood',
            language: 'Česky',
        },
        callToAction: 'Discuss your first agenda',
        mobileCallToAction: 'Let’s talk',
        hero: {
            eyebrow: 'Promptbook for companies and projects',
            heading: 'Give AI a responsibility.',
            emphasis: 'Let the work continue.',
            description:
                'Maintaining an application, handling customer communication, keeping operations moving. Promptbook turns individual AI tasks into ongoing responsibilities that run in the background. Without a fresh prompt for every next step.',
            secondaryAction: 'See how it works',
            callNote: 'A free strategy call to choose your first agenda and define its boundaries.',
            illustration: 'From a single task to ongoing care',
            oneShotLabel: 'One-shot task',
            oneShotPrompt: '“Build me a website.”',
            oneShotSteps: ['Request', 'Result', 'Done'],
            agendaLabel: 'Ongoing agenda',
            agendaPrompt: '“Maintain and improve our website.”',
            agendaSteps: ['Observe', 'Act', 'Check'],
            continuation: 'Next change. Same context. The work continues.',
            human: 'You set the direction and approve important steps.',
        },
        model: {
            eyebrow: 'Meet the agenda',
            title: 'Companies run on responsibilities that keep getting handled.',
            description:
                'An agenda is a defined area of responsibility with its own context, goals and rules. It holds both one-off and recurring tasks. A task ends; the agenda carries the work forward.',
            parts: [
                {
                    title: 'Context and rules',
                    description: 'What it needs to know, what it may change, and when to ask.',
                    example: 'Knowledge · history · boundaries',
                },
                {
                    title: 'Goals and tasks',
                    description: 'Multiple goals, ongoing care and individual tasks with their own deadlines.',
                    example: 'Purpose · plan · next steps',
                },
                {
                    title: 'Agents and tools',
                    description: 'Several agents can work within one agenda, each with a different role.',
                    example: 'Implementation · review · connected tools',
                },
            ],
            work: ['Observe changes', 'Choose a next step', 'Work and verify', 'Continue'],
            results: 'Results along the way. Questions and decisions when a person is needed.',
            controlTitle: 'Routine work moves on. You still set the direction.',
            controlDescription:
                'Inspect the work, correct instructions, change priorities and approve steps under agreed rules. How much an agenda can do on its own depends on its access, tools and boundaries.',
        },
        examples: {
            eyebrow: 'One idea, different responsibilities',
            title: 'Building an app is a start. Maintaining it is an agenda.',
            selector: 'Choose an example agenda',
            illustration: 'Illustrative agenda workflow',
            context: 'Context that carries forward',
            approval: 'Where a person steps in',
            outcome: 'The responsibility being handled',
            items: [
                {
                    id: 'software',
                    label: 'Websites & apps',
                    title: 'Maintain and improve our application',
                    goal: 'The first version exists. Now we need changes handled, bugs fixed and quality maintained next month, too.',
                    context: 'The repository, product requirements, quality rules, tests and past decisions.',
                    steps: [
                        {
                            title: 'Understand the application',
                            detail: 'Get familiar with the code, requirements and decisions made so far.',
                        },
                        {
                            title: 'Work through the next change',
                            detail: 'Take a request or a bug and work out a concrete approach.',
                        },
                        {
                            title: 'Implement and test',
                            detail: 'Use capable coding tools, run tests and fix problems they uncover.',
                        },
                        {
                            title: 'Bring the change for review',
                            detail: 'Show the result and request approval before release when the rules require it.',
                        },
                        {
                            title: 'Continue the maintenance',
                            detail: 'Move on to the next fix, update or improvement with the same context.',
                        },
                    ],
                    approval:
                        'Changes in priority, unclear requirements and releases follow the rules you agree on. You do not have to launch every coding task yourself.',
                    outcome: 'An application that keeps being cared for, beyond its first generated version.',
                },
                {
                    id: 'communication',
                    label: 'Customer communication',
                    title: 'Keep customer enquiries moving',
                    goal: 'Incoming messages need context, follow-through and clear rules for replies.',
                    context: 'Service information, conversation history, tone of voice and permissions.',
                    steps: [
                        {
                            title: 'Sort incoming messages',
                            detail: 'Identify the topic and what needs to be resolved.',
                        },
                        { title: 'Prepare a reply', detail: 'Bring in context from the information available.' },
                        {
                            title: 'Escalate exceptions',
                            detail: 'Bring uncertainty and new customer commitments to a person for approval.',
                        },
                        {
                            title: 'Follow up on open cases',
                            detail: 'Keep track of what still needs a reply or another step.',
                        },
                    ],
                    approval:
                        'Sending permissions and access are configured for each agenda. Disputes and new commitments stay with a person.',
                    outcome: 'Communication with continuity between individual messages.',
                },
                {
                    id: 'administration',
                    label: 'Accounting admin',
                    title: 'Keep records and deadlines in order',
                    goal: 'Accounting is an agenda. Preparing VAT documents, processing records and monitoring deadlines are different tasks within it.',
                    context: 'Available records, internal procedures, deadlines and the people responsible.',
                    steps: [
                        {
                            title: 'Organise available records',
                            detail: 'Put documents in order and flag missing information.',
                        },
                        { title: 'Monitor deadlines', detail: 'Surface upcoming dates and the records still needed.' },
                        {
                            title: 'Prepare for professional review',
                            detail: 'Give the accountant an overview and questions that need a decision.',
                        },
                        {
                            title: 'Continue into the next period',
                            detail: 'Carry the established procedures forward as new records arrive.',
                        },
                    ],
                    approval:
                        'Professional judgement, approval and statutory filings remain with the responsible person. Specific connections are agreed during setup.',
                    outcome: 'Records kept ready for an accountant’s review.',
                },
                {
                    id: 'content',
                    label: 'Content operations',
                    title: 'Keep website information up to date',
                    goal: 'Writing one article is only part of the job. Information, links and publishing plans need ongoing attention.',
                    context: 'Approved sources, editorial style, site structure and publishing rules.',
                    steps: [
                        {
                            title: 'Review agreed sources',
                            detail: 'Find changes that should be reflected on the website.',
                        },
                        { title: 'Prepare updates', detail: 'Revise draft copy and related links.' },
                        {
                            title: 'Bring content for approval',
                            detail: 'Show what changed and which sources support it.',
                        },
                        {
                            title: 'Return for the next review',
                            detail: 'Continue on a schedule and respond to new information.',
                        },
                    ],
                    approval:
                        'You choose trusted sources and publishing rules. Sensitive information and public claims go through review.',
                    outcome: 'Content that continues to receive attention after publication.',
                },
            ],
            conclusion:
                'The same principle applies to your own operational responsibilities: a clear scope, lasting context and work that carries forward.',
        },
        technology: {
            eyebrow: 'What Promptbook builds on',
            title: 'Powerful AI tools. A lasting brief.',
            description:
                'Today’s AI is excellent at complex one-shot tasks. Promptbook builds on that ability to support ongoing work for a company or project.',
            harnessTitle: 'Capability under the hood',
            harnessDescription:
                'Promptbook Coder supports these coding tools. They can write code, run tests and make changes when that is the best way to carry out an agenda.',
            vendorDescription:
                'The agenda is not tied to one model vendor. Models and tools are choices for the work at hand; the goals and context belong to the agenda. You focus on the outcome.',
            workspaceTitle: 'A workspace that lasts',
            workspaceDescription:
                'Where it makes sense, an agenda lives in a folder or Git repository. Context, agent definitions, requirements and history stay together across individual runs.',
            folder: 'your-agenda/',
            files: [
                { name: 'context/', description: 'knowledge and background' },
                { name: 'goals-and-tasks/', description: 'requirements, plans and priorities' },
                { name: 'agents/', description: 'roles, instructions and tools' },
                { name: 'history/', description: 'changes and decisions' },
            ],
            link: 'Explore Promptbook Coder',
        },
        team: {
            title: 'The people behind Promptbook',
            description: null,
            jiriDescription: 'Mathematician and co-founder of Promptbook.',
            pavolDescription: 'Developer and co-founder of Promptbook.',
        },
        contact: {
            title: 'What should keep moving when you step away?',
            description:
                'Start with one real responsibility. We’ll choose a first step together and work out what Promptbook needs to handle it.',
            steps: ['Define the goal', 'Review tools and access', 'Agree boundaries and approvals'],
            companyLink: 'Looking for answers from company documents? Promptbook for companies (Czech)',
        },
        footer: {
            productLinks: [
                { href: '#kontakt', text: 'Discuss an agenda' },
                { href: '/cs/pro-firmy', text: 'Company data & documents (Czech)' },
                { href: 'https://coder.ptbk.io/', text: 'Promptbook Coder' },
                { href: 'https://github.com/webgptorg/promptbook', text: 'Documentation' },
                { href: '/branding', text: 'Branding' },
            ],
            claim: 'AI for responsibilities that keep moving.',
        },
        qualification: {
            dialogTitle: 'Discuss your first agenda',
            intro: 'Help us prepare a strategy call about your ongoing responsibility.',
            questions: [
                {
                    id: 'agenda',
                    question: 'What should AI take ongoing responsibility for?',
                    type: 'single',
                    options: [
                        'A website or application',
                        'Customer communication',
                        'Accounting administration',
                        'Content operations',
                        'Another company or project responsibility',
                    ],
                },
                {
                    id: 'support',
                    question: 'Where would you like to start?',
                    type: 'single',
                    options: [
                        'Choose an agenda and define its boundaries',
                        'Build on an existing project or process',
                        'Discuss possibilities and specific connections',
                    ],
                },
                {
                    id: 'urgency',
                    question: 'When would you like to start?',
                    type: 'single',
                    options: ['As soon as possible', 'Next quarter', 'We’re exploring for now'],
                },
                {
                    id: 'contact',
                    question: 'How can we reach you?',
                    subtitle: 'We’ll arrange a call. Your answers will help us prepare.',
                    type: 'contact',
                    fields: [
                        { id: 'name', label: 'Name', type: 'text', placeholder: 'Alex Smith' },
                        {
                            id: 'company',
                            label: 'Company or project',
                            type: 'text',
                            placeholder: 'Your company or project',
                        },
                        { id: 'email', label: 'Email', type: 'email', placeholder: 'alex@company.com' },
                        { id: 'phone', label: 'Phone', type: 'tel', inputMode: 'tel', placeholder: '+44 7700 900000' },
                    ],
                },
            ],
            close: 'Close',
            stepLabel: (step, total) => `Step ${step + 1} of ${total}`,
            submitting: 'Sending…',
            submit: 'Arrange a free call',
            back: 'Back',
        },
        confirmation: {
            title: 'Thank you for getting in touch',
            description: 'We’ve received your answers. Let’s find the right first agenda together.',
            steps: [
                { title: 'We’ll get in touch', description: 'We’ll review your answers and arrange a strategy call.' },
                {
                    title: 'Define your first agenda',
                    description: 'We’ll discuss the goal, available tools and steps that should need your approval.',
                },
                {
                    title: 'Agree on what comes next',
                    description: 'Together we’ll assess feasibility and propose a concrete first step.',
                },
            ],
            email: 'Contact email',
            back: 'Back to the homepage',
        },
    },
};

export function getHomepageContent(language: SupportedHomepageLanguage): HomepageContent {
    return HOMEPAGE_CONTENT[language];
}
