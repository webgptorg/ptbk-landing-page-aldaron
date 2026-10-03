import type { SupportedHomepageLanguage } from '@/lib/homepage-language';

export type HomepageAgendaExample = {
    id: 'software' | 'communication' | 'administration' | 'operations';
    label: string;
    responsibility: string;
    context: string;
    steps: readonly { title: string; description: string }[];
    humanDecision: string;
};

export type HomepageContent = {
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
        exampleLabel: string;
        exampleTitle: string;
        cycle: readonly string[];
        outcome: string;
        decision: string;
        continuation: string;
    };
    comparison: {
        heading: string;
        oneShot: { label: string; request: string; steps: readonly string[]; ending: string };
        agenda: { label: string; request: string; steps: readonly string[]; ending: string };
        bridge: string;
    };
    model: {
        heading: string;
        definition: string;
        parts: readonly { title: string; description: string }[];
        cycleLabel: string;
        cycle: readonly string[];
        outcomes: string;
        human: string;
        humanActions: readonly string[];
    };
    examples: {
        heading: string;
        exampleLabel: string;
        contextLabel: string;
        decisionLabel: string;
        items: readonly HomepageAgendaExample[];
        conclusion: string;
    };
    technology: {
        heading: string;
        harnessTitle: string;
        harnessDescription: string;
        harnessScope: string;
        workspaceTitle: string;
        workspaceDescription: string;
        workspaceLabel: string;
        folders: readonly string[];
        independence: string;
        documentation: string;
    };
    team: { title: string; description: string; jiriDescription: string; pavolDescription: string };
    contact: { heading: string; description: string; companyPageLabel: string; companyPageLink: string };
    footer: { claim: string; model: string; companyPage: string; documentation: string; branding: string };
    enquiry: {
        title: string;
        description: string;
        responsibility: string;
        responsibilityPlaceholder: string;
        fullname: string;
        company: string;
        email: string;
        phone: string;
        submitting: string;
        error: string;
        close: string;
    };
    confirmation: {
        title: string;
        description: string;
        steps: readonly { title: string; description: string }[];
        emailLabel: string;
        back: string;
    };
};

/** Czech owns the composition; English expresses the same product model in its own words. */
export const HOMEPAGE_CONTENT: Readonly<Record<SupportedHomepageLanguage, HomepageContent>> = {
    cs: {
        skipLink: 'Přejít na obsah',
        navigation: { model: 'Jak funguje agenda', examples: 'Příklady', technology: 'Pod kapotou', language: 'Jazyk' },
        callToAction: 'Domluvit hovor zdarma',
        mobileCallToAction: 'Probrat agendu',
        hero: {
            eyebrow: 'Promptbook pro firmy a projekty',
            heading: 'Svěřte AI odpovědnost.',
            emphasis: 'Práce pokračuje na pozadí.',
            description:
                'Údržba aplikace, komunikace se zákazníky nebo provoz firmy. Promptbook z nich dělá agendy, které mohou pokračovat bez toho, abyste pokaždé otevírali chat a zadávali další krok.',
            secondaryAction: 'Podívat se, jak to funguje',
            exampleLabel: 'Příklad agendy',
            exampleTitle: 'Udržovat a rozvíjet naši aplikaci',
            cycle: ['Sledovat změny', 'Opravit a otestovat', 'Pokračovat'],
            outcome: 'Oprava připravená, testy prošly',
            decision: 'Větší změna? Vyžádat vaše schválení.',
            continuation: 'Kontext zůstává. Přichází další práce.',
        },
        comparison: {
            heading: 'Firma se skládá z odpovědností. Dejte je do pohybu.',
            oneShot: {
                label: 'Jednorázový úkol',
                request: '„Vytvoř mi aplikaci.“',
                steps: ['Zadání', 'Práce AI', 'Výsledek'],
                ending: 'Úkol hotový. Další krok znovu zadáváte vy.',
            },
            agenda: {
                label: 'Průběžná agenda',
                request: '„Starej se o naši aplikaci.“',
                steps: ['Kontext', 'Práce AI', 'Výsledek', 'Další krok'],
                ending: 'Odpovědnost trvá. Agenda pokračuje a ozve se, když potřebuje vaše rozhodnutí.',
            },
            bridge: 'Silní AI agenti už zvládají složité úkoly. Promptbook na jejich schopnostech staví a propojuje je v práci, která pokračuje v čase.',
        },
        model: {
            heading: 'Jedna agenda. Mnoho úkolů. Kontext zůstává.',
            definition:
                'Agenda je vymezená oblast odpovědnosti s vlastními cíli, kontextem a pravidly. Úkoly vznikají a končí. Agenda zůstává.',
            parts: [
                {
                    title: 'Kontext',
                    description: 'Co má firma nebo projekt za sebou, co potřebuje a kde jsou podklady.',
                },
                {
                    title: 'Cíle a úkoly',
                    description: 'Dlouhodobé cíle, opakovaná práce i jednorázové změny v jedné agendě.',
                },
                {
                    title: 'Agenti a nástroje',
                    description: 'Více agentů může spolupracovat. Každý s nástroji pro svou část práce.',
                },
                {
                    title: 'Pravidla a hranice',
                    description: 'Co se smí stát samostatně a co vyžaduje člověka nebo schválení.',
                },
            ],
            cycleLabel: 'Práce na pozadí podle pravidel agendy',
            cycle: ['Sleduje', 'Plánuje', 'Jedná', 'Kontroluje', 'Navazuje'],
            outcomes: 'Výsledky a rozhodnutí, která potřebují vás',
            human: 'Směr držíte vy.',
            humanActions: ['Nahlédnout', 'Opravit', 'Schválit', 'Změnit směr'],
        },
        examples: {
            heading: 'Co by u vás mělo pokračovat i po zavření chatu?',
            exampleLabel: 'Ilustrační průběh agendy',
            contextLabel: 'Co agenda zná',
            decisionLabel: 'Kde rozhoduje člověk',
            items: [
                {
                    id: 'software',
                    label: 'Web a aplikace',
                    responsibility: 'Udržovat a rozvíjet naši aplikaci.',
                    context: 'Repozitář, zadání produktu, historie změn a pravidla kvality.',
                    steps: [
                        { title: 'Porozumět produktu', description: 'Projít kód, zadání a otevřené požadavky.' },
                        { title: 'Pracovat na změně', description: 'Připravit opravu, novou funkci nebo aktualizaci.' },
                        {
                            title: 'Ověřit kvalitu',
                            description: 'Spustit testy, zkontrolovat výsledek a opravit nalezené chyby.',
                        },
                        {
                            title: 'Navázat další prací',
                            description:
                                'Uchovat kontext a historii. Pokračovat s dalším požadavkem nebo pravidelnou kontrolou.',
                        },
                    ],
                    humanDecision:
                        'Změna směru produktu nebo zveřejnění podle dohodnutých pravidel. Vy sledujete udržovanou aplikaci, nemusíte ručně obsluhovat každý běh coding agenta.',
                },
                {
                    id: 'communication',
                    label: 'Komunikace',
                    responsibility: 'Udržovat zákaznickou komunikaci vyřízenou.',
                    context: 'Historie komunikace, informace o službách a pravidla odpovídání.',
                    steps: [
                        {
                            title: 'Zpracovat nové zprávy',
                            description: 'Rozlišit běžný dotaz, návaznou domluvu a výjimku.',
                        },
                        {
                            title: 'Připravit odpověď',
                            description: 'Použít souvislosti a podklady konkrétního zákazníka.',
                        },
                        {
                            title: 'Předat výjimky',
                            description: 'Nestandardní závazek nebo citlivou situaci dát člověku k rozhodnutí.',
                        },
                        {
                            title: 'Hlídání pokračuje',
                            description: 'Sledovat otevřené konverzace a navazující úkoly podle nastavených pravidel.',
                        },
                    ],
                    humanDecision:
                        'Citlivé odpovědi a nové závazky. Přístup ke schránce a oprávnění je potřeba nastavit pro konkrétní agendu.',
                },
                {
                    id: 'administration',
                    label: 'Administrativa',
                    responsibility: 'Udržovat účetní podklady a termíny v pořádku.',
                    context: 'Doklady, přehled povinností a postupy dohodnuté s účetní.',
                    steps: [
                        {
                            title: 'Zpracovat podklady',
                            description: 'Roztřídit dostupné doklady a označit chybějící údaje.',
                        },
                        {
                            title: 'Hlídání termínů',
                            description: 'Udržovat úkoly k uzávěrce, DPH a dalším povinnostem.',
                        },
                        {
                            title: 'Připravit ke kontrole',
                            description: 'Dát účetní přehled podkladů a otevřených otázek.',
                        },
                        {
                            title: 'Další období',
                            description: 'Stejná odpovědnost pokračuje s novými doklady a novými termíny.',
                        },
                    ],
                    humanDecision:
                        'Účetní kontrola a podání zůstávají odborníkovi. Účetnictví je agenda; příprava DPH je jeden z jejích úkolů.',
                },
                {
                    id: 'operations',
                    label: 'Provoz firmy',
                    responsibility: 'Udržovat obsah a provozní informace aktuální.',
                    context: 'Zdroje informací, publikační plán a interní postupy firmy.',
                    steps: [
                        {
                            title: 'Zachytit změnu',
                            description: 'Podle dostupných zdrojů zjistit, co je potřeba aktualizovat.',
                        },
                        { title: 'Připravit úpravy', description: 'Promítnout změnu do obsahu a navazujících úkolů.' },
                        {
                            title: 'Zkontrolovat souvislosti',
                            description: 'Zachovat konzistenci informací a upozornit na rozpory.',
                        },
                        {
                            title: 'Udržovat dál',
                            description: 'Vracet se k odpovědnosti, když dorazí změna nebo nastane čas kontroly.',
                        },
                    ],
                    humanDecision:
                        'Publikace a výjimky podle vašich pravidel. Zdroje, nástroje i rozsah práce vymezíme pro váš provoz.',
                },
            ],
            conclusion:
                'Stejný princip pro různé odpovědnosti. Rozsah, nástroje a míru samostatnosti nastavujeme pro konkrétní firmu nebo projekt.',
        },
        technology: {
            heading: 'Silné nástroje pod kapotou. Vaše agenda v popředí.',
            harnessTitle: 'Stavíme na schopnostech coding agentů',
            harnessDescription:
                'Kód může být nejlepší cesta, jak práci vykonat. Promptbook Coder umí práci předávat těmto nástrojům:',
            harnessScope:
                'Volba nástroje a modelu patří k nastavení práce. Agenda není svázaná s jedním dodavatelem AI.',
            workspaceTitle: 'Kontext, který nezmizí s jedním chatem',
            workspaceDescription:
                'Tam, kde to dává smysl, je pracovním prostorem složka nebo Git repozitář. Drží pohromadě kontext, definice agentů, zadání, úkoly a historii. Pro porozumění agendě nemusíte znát Git.',
            workspaceLabel: 'Příklad trvalého pracovního prostoru',
            folders: [
                'Kontext a podklady',
                'Cíle a zadání',
                'Opakované i jednorázové úkoly',
                'Definice agentů a pravidla',
                'Historie práce',
            ],
            independence: 'Nástroje se mohou měnit. Odpovědnost, kontext a historie zůstávají základem agendy.',
            documentation: 'Otevřít dokumentaci Promptbooku',
        },
        team: {
            title: 'S kým proberete svou agendu',
            description: 'Propojíme potřeby vašeho projektu s konkrétním technickým postupem.',
            jiriDescription: 'Jiří Jahn vede Promptbook. Doktor matematiky, dříve výzkumník v IT4I.',
            pavolDescription: 'Pavol Hejný vyvíjí Promptbook a jeho nástroje pro práci s AI.',
        },
        contact: {
            heading: 'Začněme jednou odpovědností.',
            description:
                'Na strategickém hovoru vymezíme první agendu: co má zvládat, jaké potřebuje podklady a kdy má zapojit vás.',
            companyPageLabel: 'Hledáte odpovědi nad firemními dokumenty?',
            companyPageLink: 'Promptbook pro firemní data',
        },
        footer: {
            claim: 'Odpovědnosti, které mohou pokračovat na pozadí.',
            model: 'Jak fungují agendy',
            companyPage: 'Pro firemní data',
            documentation: 'Dokumentace',
            branding: 'Branding',
        },
        enquiry: {
            title: 'Proberme vaši první agendu',
            description: 'Napište, o co se má AI průběžně starat. Ozveme se a domluvíme strategický hovor.',
            responsibility: 'Jakou odpovědnost chcete předat?',
            responsibilityPlaceholder: 'Například údržbu naší aplikace a práci na dalších změnách…',
            fullname: 'Jméno a příjmení',
            company: 'Firma nebo projekt',
            email: 'E-mail',
            phone: 'Telefon (nepovinný)',
            submitting: 'Odesílám…',
            error: 'Poptávku se nepodařilo odeslat. Vaše údaje zůstaly vyplněné. Zkuste to prosím znovu.',
            close: 'Zavřít',
        },
        confirmation: {
            title: 'Děkujeme za poptávku.',
            description: 'Vaši odpovědnost i kontaktní údaje máme. Dalším krokem je společně vymezit první agendu.',
            steps: [
                { title: 'Domluvíme si hovor', description: 'Ozveme se na uvedený kontakt a dohodneme vhodný termín.' },
                {
                    title: 'Vymezíme odpovědnost',
                    description: 'Probereme cíle, dostupné podklady a hranice samostatné práce.',
                },
                {
                    title: 'Navrhneme další krok',
                    description: 'Dohodneme, co má první agenda dělat a co má nechat na vás.',
                },
            ],
            emailLabel: 'Kontaktní e-mail',
            back: 'Zpět na hlavní stránku',
        },
    },
    en: {
        skipLink: 'Skip to content',
        navigation: {
            model: 'How agendas work',
            examples: 'Examples',
            technology: 'Under the hood',
            language: 'Language',
        },
        callToAction: 'Book a free strategy call',
        mobileCallToAction: 'Talk to us',
        hero: {
            eyebrow: 'Promptbook for companies and projects',
            heading: 'Give AI a responsibility.',
            emphasis: 'Let the work keep going.',
            description:
                'Maintaining an application, handling customer communication, keeping operations on track. Promptbook turns these into agendas that can keep working in the background, without another chat and another prompt for every next step.',
            secondaryAction: 'See how it works',
            exampleLabel: 'Example agenda',
            exampleTitle: 'Maintain and improve our application',
            cycle: ['Watch for changes', 'Fix and test', 'Continue'],
            outcome: 'Fix ready, tests passed',
            decision: 'A bigger change? Ask for your approval.',
            continuation: 'Context stays. The next task arrives.',
        },
        comparison: {
            heading: 'Companies run on responsibilities. Put yours to work.',
            oneShot: {
                label: 'One-shot task',
                request: '“Build me an application.”',
                steps: ['Request', 'AI work', 'Result'],
                ending: 'Task complete. You prompt the next step.',
            },
            agenda: {
                label: 'Ongoing agenda',
                request: '“Take care of our application.”',
                steps: ['Context', 'AI work', 'Result', 'Next step'],
                ending: 'The responsibility continues. The agenda carries on and asks when it needs your decision.',
            },
            bridge: 'Powerful AI agents already handle complex tasks. Promptbook builds on that strength to connect individual runs into work that continues over time.',
        },
        model: {
            heading: 'One agenda. Many tasks. Context that lasts.',
            definition:
                'An agenda is a bounded area of responsibility with its own goals, context and rules. Tasks come and go. The agenda stays.',
            parts: [
                {
                    title: 'Context',
                    description: 'What the company or project knows, what it needs and where the information lives.',
                },
                {
                    title: 'Goals and tasks',
                    description: 'Long-term goals, recurring work and one-off changes within the same agenda.',
                },
                {
                    title: 'Agents and tools',
                    description: 'Multiple agents can work together, each with tools for its part of the work.',
                },
                {
                    title: 'Rules and boundaries',
                    description: 'What can happen independently and what needs a person or an approval.',
                },
            ],
            cycleLabel: 'Background work within the agenda’s rules',
            cycle: ['Observe', 'Plan', 'Act', 'Check', 'Continue'],
            outcomes: 'Outcomes and decisions that need you',
            human: 'You set the direction.',
            humanActions: ['Inspect', 'Correct', 'Approve', 'Change course'],
        },
        examples: {
            heading: 'What should keep moving after you close the chat?',
            exampleLabel: 'Illustrative agenda workflow',
            contextLabel: 'What the agenda knows',
            decisionLabel: 'Where a person decides',
            items: [
                {
                    id: 'software',
                    label: 'Web and applications',
                    responsibility: 'Maintain and improve our application.',
                    context: 'The repository, product requirements, change history and quality standards.',
                    steps: [
                        {
                            title: 'Understand the product',
                            description: 'Read the code, requirements and open requests.',
                        },
                        { title: 'Make a change', description: 'Prepare a fix, a feature or an update.' },
                        {
                            title: 'Verify quality',
                            description: 'Run tests, review the result and fix the issues found.',
                        },
                        {
                            title: 'Keep the work moving',
                            description:
                                'Retain context and history. Continue with the next request or a recurring check.',
                        },
                    ],
                    humanDecision:
                        'Product direction and releases follow your agreed approval rules. You work with the maintained application, without manually operating every coding-agent run.',
                },
                {
                    id: 'communication',
                    label: 'Communication',
                    responsibility: 'Keep customer communication handled.',
                    context: 'Conversation history, service information and rules for replying.',
                    steps: [
                        {
                            title: 'Process new messages',
                            description: 'Identify a routine question, a follow-up or an exception.',
                        },
                        {
                            title: 'Prepare a reply',
                            description: 'Use the context and information relevant to that customer.',
                        },
                        {
                            title: 'Escalate exceptions',
                            description: 'Bring unusual commitments and sensitive situations to a person.',
                        },
                        {
                            title: 'Follow through',
                            description: 'Keep track of open conversations and follow-up tasks under the agreed rules.',
                        },
                    ],
                    humanDecision:
                        'Sensitive replies and new commitments need a person. Inbox access and permissions are configured for each agenda.',
                },
                {
                    id: 'administration',
                    label: 'Administration',
                    responsibility: 'Keep accounting records and deadlines in order.',
                    context: 'Documents, a list of obligations and procedures agreed with your accountant.',
                    steps: [
                        {
                            title: 'Process documents',
                            description: 'Organize available records and flag missing information.',
                        },
                        {
                            title: 'Track deadlines',
                            description: 'Maintain tasks for period closing, VAT preparation and other obligations.',
                        },
                        {
                            title: 'Prepare for review',
                            description: 'Give the accountant an overview of records and unresolved questions.',
                        },
                        {
                            title: 'Continue next period',
                            description: 'The same responsibility continues with new documents and deadlines.',
                        },
                    ],
                    humanDecision:
                        'Professional review and filing stay with the accountant. Accounting is the agenda; VAT preparation is one task within it.',
                },
                {
                    id: 'operations',
                    label: 'Company operations',
                    responsibility: 'Keep content and operational information up to date.',
                    context: 'Information sources, a publishing plan and the company’s internal procedures.',
                    steps: [
                        {
                            title: 'Notice a change',
                            description: 'Use the available sources to identify what needs updating.',
                        },
                        {
                            title: 'Prepare updates',
                            description: 'Carry the change through to content and related tasks.',
                        },
                        {
                            title: 'Check consistency',
                            description: 'Keep information aligned and flag conflicting details.',
                        },
                        {
                            title: 'Keep maintaining',
                            description: 'Return to the responsibility when something changes or a review is due.',
                        },
                    ],
                    humanDecision:
                        'Publishing and exceptions follow your rules. Sources, tools and scope are defined for your operation.',
                },
            ],
            conclusion:
                'Different responsibilities, the same principle. Scope, tools and independence are set for each company or project.',
        },
        technology: {
            heading: 'Powerful tools underneath. Your agenda up front.',
            harnessTitle: 'Built on the strength of coding agents',
            harnessDescription:
                'Code can be the best way to get work done. Promptbook Coder can delegate work to these tools:',
            harnessScope:
                'The tool and model are execution choices. The durable agenda does not belong to one AI vendor.',
            workspaceTitle: 'Context that outlives a chat',
            workspaceDescription:
                'Where appropriate, a folder or Git repository is the durable workspace. It holds context, agent definitions, requirements, tasks and history together. You do not need to understand Git to understand an agenda.',
            workspaceLabel: 'Example durable workspace',
            folders: [
                'Context and reference material',
                'Goals and requirements',
                'Recurring and one-off tasks',
                'Agent definitions and rules',
                'Work history',
            ],
            independence: 'Tools can change. Responsibility, context and history remain the foundation of the agenda.',
            documentation: 'Read the Promptbook documentation',
        },
        team: {
            title: 'The people behind your first agenda',
            description: 'We connect your project’s needs with a practical technical approach.',
            jiriDescription: 'Jiří Jahn leads Promptbook. A mathematics PhD and former researcher at IT4I.',
            pavolDescription: 'Pavol Hejný develops Promptbook and its tools for working with AI.',
        },
        contact: {
            heading: 'Start with one responsibility.',
            description:
                'On a strategy call, we will define your first agenda: what it should handle, the context it needs and when it should involve you.',
            companyPageLabel: 'Looking for answers from company documents?',
            companyPageLink: 'Promptbook for company data (Czech)',
        },
        footer: {
            claim: 'Ongoing responsibilities, working in the background.',
            model: 'How agendas work',
            companyPage: 'Company data (Czech)',
            documentation: 'Documentation',
            branding: 'Branding',
        },
        enquiry: {
            title: 'Let’s discuss your first agenda',
            description: 'Tell us what AI should keep taking care of. We will get in touch to arrange a strategy call.',
            responsibility: 'What responsibility would you like to hand over?',
            responsibilityPlaceholder: 'For example, maintaining our application and working through changes…',
            fullname: 'Full name',
            company: 'Company or project',
            email: 'Email',
            phone: 'Phone (optional)',
            submitting: 'Sending…',
            error: 'We could not send your enquiry. Your details are still here. Please try again.',
            close: 'Close',
        },
        confirmation: {
            title: 'Thank you for your enquiry.',
            description:
                'We have your responsibility and contact details. Next, we will define the first agenda together.',
            steps: [
                {
                    title: 'Arrange a call',
                    description: 'We will get in touch using your contact details to find a suitable time.',
                },
                {
                    title: 'Define the responsibility',
                    description: 'We will discuss goals, available context and boundaries for independent work.',
                },
                {
                    title: 'Agree on the next step',
                    description: 'We will outline what the first agenda should handle and what stays with you.',
                },
            ],
            emailLabel: 'Contact email',
            back: 'Back to the homepage',
        },
    },
};

export function getHomepageContent(language: SupportedHomepageLanguage): HomepageContent {
    return HOMEPAGE_CONTENT[language];
}
