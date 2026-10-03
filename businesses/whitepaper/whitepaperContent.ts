import type { SupportedHomepageLanguage } from '@/lib/homepage-language';

const ENGLISH_WHITEPAPER_CONTENT = {
    navigation: {
        label: 'Whitepaper navigation',
        skip: 'Skip to content',
        language: 'Language',
        framework: 'The framework',
        idea: 'The idea',
        cycle: 'The cycle',
        history: 'Continuity',
        practice: 'In practice',
        read: 'Read the paper',
    },
    hero: {
        eyebrow: 'A new relationship with AI',
        title: ['From AI tasks.', 'To autonomous agendas.'],
        description:
            'Give your project a purpose. Give its agents the context to act. Discover a framework for work that continues beyond the next prompt.',
        explore: 'Explore the framework',
        read: 'Read the whitepaper',
        edition: 'Whitepaper',
        date: 'October 2, 2026',
    },
    framework: {
        eyebrow: '01 / The APT framework',
        title: 'Three parts. One living context.',
        description:
            'Who does the work. What they work on. What needs to happen. Connected, versioned, and built to stay together.',
        hint: 'Select a layer to explore',
        scroll: 'Scroll to unfold',
        relation: 'A connected system, not a sequence of steps.',
        parts: {
            agent: {
                letter: 'A',
                name: 'Agent',
                question: 'Who, and why?',
                title: 'A role with a lasting purpose.',
                description:
                    'An agent carries a goal, rules, expertise, and tools. Its identity lives in its definition, not in a particular model or conversation.',
                file: 'Agents/developer.book',
                example: 'Keep the product reliable. Improve it within the project’s rules.',
                detail: 'Shared instructions can be inherited from Adam, the base agent, and specialized for each role.',
                chapter: 2,
            },
            project: {
                letter: 'P',
                name: 'Project',
                question: 'What, and where?',
                title: 'Context that outlives a conversation.',
                description:
                    'The project holds the materials, decisions, and meaning of the work. A Git repository brings the context and its history together.',
                file: 'README.md · src/ · docs/',
                example: 'The product, its intent, its documentation, and its checks.',
                detail: 'A project can also hold accounting materials or communication rules. Secrets stay outside Git; external data needs traceable references.',
                chapter: 3,
            },
            task: {
                letter: 'T',
                name: 'Task',
                question: 'What happens next?',
                title: 'Intent becomes verifiable work.',
                description:
                    'A task describes a concrete outcome, its constraints, and how to verify it. It is a readable, versioned part of the project.',
                file: 'prompts/2026-10-002-dashboard.md',
                example: 'Add a customer dashboard. Verify access and the empty state.',
                detail: 'Priorities, dependencies, assigned roles, and time conditions decide when work is eligible. Agents can create follow-up tasks too.',
                chapter: 4,
            },
        },
        deeper: 'Read the chapter',
    },
    idea: {
        eyebrow: '02 / A different starting point',
        title: ['AI can do the task.', 'Who finds the next one?'],
        description:
            'A longer AI run still begins with someone giving it work. Promptbook explores a different relationship: entrusting an ongoing area of responsibility to a project and its agents.',
        before: 'Task by task',
        after: 'An ongoing agenda',
        beforeSteps: ['You write a prompt', 'AI completes the task', 'It waits for you'],
        afterSteps: ['A need is observed', 'Agents create and verify work', 'The project carries it forward'],
        conclusion: 'You own the intent, the rules, and the responsibility.',
        note: 'Autonomy also means knowing when no useful, authorized work is needed.',
    },
    cycle: {
        eyebrow: '03 / The controlled work cycle',
        title: ['Intelligence does the work.', 'Checks earn the commit.'],
        description:
            'Agents propose and make changes. A deterministic orchestrator selects eligible work, runs checks, and records accepted results.',
        demo: 'Interactive model · no agents are running',
        scenario: 'Choose what the checks find',
        scenarios: ['Checks pass', 'A repair is needed', 'Repairs keep failing'],
        next: 'Next step',
        restart: 'Start again',
        start: 'Start the cycle',
        step: 'Step',
        stateLabel: 'Project state',
        pending: 'Not accepted',
        accepted: 'Accepted together',
        paused: 'Paused for the owner',
        files: ['Dashboard implementation', 'Task completion'],
        stages: {
            observe: {
                title: 'Check the starting point.',
                description:
                    'The initial project checks pass in this example. If they fail, repair work must come first.',
                label: 'Observe',
            },
            select: {
                title: 'Choose eligible work.',
                description:
                    'Select the dashboard task only after its priority, dependencies, and time conditions allow it.',
                label: 'Select',
            },
            work: {
                title: 'Let the agent work.',
                description:
                    'The developer prepares the dashboard and its tests. The task is still open; the work has not been accepted.',
                label: 'Work',
            },
            verify: {
                title: 'Verify the actual result.',
                description:
                    'Run project checks and the task’s acceptance criteria against the same changes that will be committed.',
                label: 'Verify',
            },
            repair: {
                title: 'A failed check becomes repair work.',
                description:
                    'The empty-state test failed. Repair the implementation, then check the result again. No accepted commit yet.',
                label: 'Repair',
            },
            recheck: {
                title: 'Check the repaired result.',
                description:
                    'Run the checks again on the repaired files. An earlier successful test would not verify this new version.',
                label: 'Recheck',
            },
            commit: {
                title: 'One accepted transition.',
                description:
                    'The orchestrator records the implementation, tests, and completed task in one commit. Deployment remains a separate action.',
                label: 'Commit',
            },
            pause: {
                title: 'Stop when the repair budget is spent.',
                description:
                    'In this example, the second check still fails. A bounded retry policy pauses work and brings the unresolved problem to the owner.',
                label: 'Pause',
            },
        },
        note: 'Passing checks means passing the conditions you defined, not proving perfection. Retry budgets and escalation are recommended safeguards; verify their enforcement in the version you deploy.',
    },
    history: {
        eyebrow: '04 / Continuity by design',
        title: ['The work and its result.', 'One shared history.'],
        description:
            'Keep the task beside the materials it changes. A commit can capture both the result and the fact that the task was completed.',
        controls: 'Explore repository states',
        states: ['Before', 'Accepted', 'Reverted'],
        demo: 'Illustrative history',
        task: 'Add a customer dashboard',
        implementation: 'Dashboard',
        taskLabel: 'Task',
        historyLabel: 'Git history',
        externalLabel: 'Email outside Git',
        implementationStates: ['Not added yet', 'Implementation + tests', 'Original files restored'],
        taskStates: ['Open', 'Complete', 'Open again'],
        historyStates: ['Starting commit', 'A new accepted commit', 'A new revert commit'],
        externalStates: ['Not sent', 'Sent after acceptance', 'Still sent'],
        explanations: [
            'The task already exists and is open. Its implementation has not been added.',
            'The result and the completed task are recorded together. The email shown here is a separate, later external action.',
            'A full revert restores these files and reopens this pre-existing task. It adds history; it does not erase it or recall the email.',
        ],
        note: 'This example assumes a complete, conflict-free revert of a task that already existed. A task created and completed in the same commit may disappear on revert. Partial reverts and dependent changes need review; external actions must be reconciled before retrying.',
    },
    continuity: {
        eyebrow: 'Keep what matters',
        title: 'Models change. Context stays.',
        preservedTitle: 'The lasting investment',
        preserved: ['Purpose and decisions', 'Agent definitions and rules', 'Materials, tasks, checks, and history'],
        replaceableTitle: 'The replaceable runtime',
        replaceable: [
            'Model and provider',
            'Tool adapters and execution environment',
            'Rebuildable caches and indexes',
        ],
        note: 'Preserving a definition does not guarantee identical behavior. Validate a new model against representative tasks. Important evidence of external actions belongs in durable records, not disposable cache.',
    },
    practice: {
        eyebrow: '05 / Beyond the codebase',
        title: 'One architecture. Many kinds of work.',
        description:
            'APT organizes responsibility, not a particular industry. These scenarios illustrate the model; they are not claims of available integrations.',
        choose: 'Choose an example',
        labels: ['Agent', 'Project', 'Task'],
        trigger: 'The signal',
        check: 'The verification',
        boundary: 'The boundary',
        scenarios: [
            {
                name: 'A web application',
                signal: 'Monitoring reports a recurring error.',
                parts: [
                    'Developer + security reviewer',
                    'Source code, documentation, product intent',
                    'Reproduce the error, fix it, add a regression test',
                ],
                check: 'Verify the fix and the project checks before accepting the commit.',
                boundary: 'A successful commit is not proof of successful deployment.',
            },
            {
                name: 'Accounting materials',
                signal: 'A new invoice arrives with missing information.',
                parts: [
                    'Accounting agent + specialist reviewer',
                    'Invoices, bank records, documented procedures',
                    'Find the missing information and prepare reconciled materials',
                ],
                check: 'Check totals, formal consistency, and links between records.',
                boundary:
                    'Preparation, professional approval, and submission have separate permissions. Technical checks do not replace professional judgment.',
            },
            {
                name: 'Customer communication',
                signal: 'Several customers ask the same question.',
                parts: [
                    'Support agent + copywriter',
                    'Product knowledge, communication rules, accessible history',
                    'Draft a reply and propose a documentation improvement',
                ],
                check: 'Review accuracy, tone, and whether the recurring cause was addressed.',
                boundary:
                    'Drafting a reply and sending it are distinct operations. Sending has an effect outside the repository.',
            },
        ],
    },
    boundaries: {
        title: 'Autonomy has a mandate.',
        description:
            'Goals do not grant permissions. A trustworthy agenda needs limited access, protected checks, bounded costs, durable records of external actions, and a way for its owner to stop or redirect it.',
        link: 'Explore the operating safeguards',
    },
    status: {
        eyebrow: 'An honest view of the roadmap',
        title: 'The foundation. The next steps. The vision.',
        cards: [
            {
                label: 'Described core',
                title: 'Context and execution.',
                description:
                    '.book agents, Markdown tasks, selection rules, a check-and-repair cycle, shared commits, follow-up work, and server execution, as described by the concept’s author.',
            },
            {
                label: 'Planned',
                title: 'More reusable expertise.',
                description:
                    'Tasks in .book format, agent-based reviews alongside deterministic checks, and an installable agent catalog. No release date is assigned here.',
            },
            {
                label: 'Long-term vision',
                title: 'An agenda with continuity.',
                description:
                    'A project that recognizes needs, develops, operates, and calls on its owner for exceptions within an explicit mandate.',
            },
        ],
        note: 'Version 0.1 is a conceptual and technical account, not an independent implementation audit or a benchmark. Connectors, scheduler behavior, and safeguards need version-specific verification.',
    },
    reader: {
        eyebrow: '06 / The complete whitepaper',
        title: 'Go a layer deeper.',
        description:
            'The full argument, the trade-offs, and the details. Read one chapter or settle in for the whole paper.',
        by: 'Concept by',
        translation: 'English translation of the Czech original.',
        contents: 'Chapters',
        expand: 'Expand all',
        collapse: 'Collapse all',
        download: 'Download Markdown',
        source: 'Czech original',
        appendix: 'Appendix',
        abstract: 'Abstract',
    },
    closing: {
        title: ['Own the intent.', 'Let the work continue.'],
        description: 'Explore Promptbook and help shape what an autonomous agenda can become.',
        repository: 'Explore on GitHub',
        contact: 'Talk to us',
    },
};

export type WhitepaperContent = typeof ENGLISH_WHITEPAPER_CONTENT;

const CZECH_WHITEPAPER_CONTENT: WhitepaperContent = {
    navigation: {
        label: 'Navigace whitepaperu',
        skip: 'Přejít na obsah',
        language: 'Jazyk',
        framework: 'Framework',
        idea: 'Myšlenka',
        cycle: 'Pracovní cyklus',
        history: 'Kontinuita',
        practice: 'V praxi',
        read: 'Číst whitepaper',
    },
    hero: {
        eyebrow: 'Nový vztah s umělou inteligencí',
        title: ['Od úkolování AI.', 'K autonomním agendám.'],
        description:
            'Dejte projektu záměr. Jeho agentům kontext k jednání. Objevte framework pro práci, která pokračuje i bez dalšího promptu.',
        explore: 'Prozkoumat framework',
        read: 'Číst whitepaper',
        edition: 'Whitepaper',
        date: '2. října 2026',
    },
    framework: {
        eyebrow: '01 / APT framework',
        title: 'Tři části. Jeden živý kontext.',
        description: 'Kdo pracuje. Nad čím pracuje. Co se má stát. Propojené, verzované a připravené zůstat pohromadě.',
        hint: 'Vyberte vrstvu a prozkoumejte ji',
        scroll: 'Rozbalte posouváním',
        relation: 'Propojený celek, nikoli posloupnost kroků.',
        parts: {
            agent: {
                letter: 'A',
                name: 'Agent',
                question: 'Kdo a proč?',
                title: 'Role s dlouhodobým cílem.',
                description:
                    'Agent nese cíl, pravidla, znalosti a nástroje. Jeho identita žije v definici, ne v konkrétním modelu nebo konverzaci.',
                file: 'Agents/developer.book',
                example: 'Udržuj produkt spolehlivý. Rozvíjej ho v mezích pravidel projektu.',
                detail: 'Společné instrukce lze dědit od základního agenta Adama a specializovat pro jednotlivé role.',
                chapter: 2,
            },
            project: {
                letter: 'P',
                name: 'Projekt',
                question: 'Co a kde?',
                title: 'Kontext, který přežije konverzaci.',
                description:
                    'Projekt uchovává materiály, rozhodnutí a smysl práce. Git repozitář propojuje tento kontext s jeho historií.',
                file: 'README.md · src/ · docs/',
                example: 'Produkt, jeho záměr, dokumentace a kontroly.',
                detail: 'Projektem mohou být i účetní podklady nebo komunikační pravidla. Tajemství patří mimo Git; externí data potřebují dohledatelné odkazy.',
                chapter: 3,
            },
            task: {
                letter: 'T',
                name: 'Úkol',
                question: 'Co bude dál?',
                title: 'Ze záměru ověřitelná práce.',
                description:
                    'Úkol popisuje konkrétní výsledek, jeho omezení a způsob ověření. Je čitelnou a verzovanou součástí projektu.',
                file: 'prompts/2026-10-002-dashboard.md',
                example: 'Přidej zákaznický dashboard. Ověř přístup a prázdný stav.',
                detail: 'Priority, závislosti, přiřazené role a časové podmínky určují způsobilost práce. Agenti mohou vytvářet i navazující úkoly.',
                chapter: 4,
            },
        },
        deeper: 'Přečíst kapitolu',
    },
    idea: {
        eyebrow: '02 / Jiný výchozí bod',
        title: ['AI zvládne úkol.', 'Kdo najde ten další?'],
        description:
            'I dlouhý běh AI začíná tím, že jí někdo zadá práci. Promptbook zkoumá jiný vztah: svěřit projektu a jeho agentům dlouhodobou agendu.',
        before: 'Úkol po úkolu',
        after: 'Průběžná agenda',
        beforeSteps: ['Člověk zadá prompt', 'AI splní úkol', 'Čeká na člověka'],
        afterSteps: ['Objeví se potřeba', 'Agenti vytvoří a ověří práci', 'Projekt pokračuje dál'],
        conclusion: 'Vy vlastníte záměr, pravidla a odpovědnost.',
        note: 'Autonomie znamená i rozpoznat, kdy žádná přínosná a oprávněná práce není potřeba.',
    },
    cycle: {
        eyebrow: '03 / Kontrolovaný pracovní cyklus',
        title: ['Inteligence dělá práci.', 'Kontroly otevírají cestu ke commitu.'],
        description:
            'Agenti navrhují a provádějí změny. Deterministický orchestrátor vybírá způsobilou práci, spouští kontroly a zaznamenává přijaté výsledky.',
        demo: 'Interaktivní model · žádní agenti právě neběží',
        scenario: 'Vyberte výsledek kontrol',
        scenarios: ['Kontroly projdou', 'Je potřeba oprava', 'Opravy stále selhávají'],
        next: 'Další krok',
        restart: 'Spustit znovu',
        start: 'Spustit cyklus',
        step: 'Krok',
        stateLabel: 'Stav projektu',
        pending: 'Zatím nepřijato',
        accepted: 'Přijato společně',
        paused: 'Pozastaveno pro vlastníka',
        files: ['Implementace dashboardu', 'Dokončení úkolu'],
        stages: {
            observe: {
                title: 'Ověřit výchozí stav.',
                description:
                    'Výchozí kontroly projektu v této ukázce projdou. Pokud selžou, musí nejprve vzniknout opravná práce.',
                label: 'Pozorovat',
            },
            select: {
                title: 'Vybrat způsobilou práci.',
                description:
                    'Úkol na dashboard lze vybrat, až když to dovolí jeho priorita, závislosti a časové podmínky.',
                label: 'Vybrat',
            },
            work: {
                title: 'Nechat agenta pracovat.',
                description:
                    'Developer připraví dashboard a jeho testy. Úkol zůstává otevřený; práce ještě není přijatá.',
                label: 'Provést',
            },
            verify: {
                title: 'Ověřit skutečný výsledek.',
                description:
                    'Projektové kontroly a akceptační kritéria úkolu běží nad stejnými změnami, které se mají commitnout.',
                label: 'Ověřit',
            },
            repair: {
                title: 'Neúspěšná kontrola vytvoří opravnou práci.',
                description:
                    'Test prázdného stavu selhal. Opravte implementaci a znovu ověřte výsledek. Přijatý commit zatím nevznikl.',
                label: 'Opravit',
            },
            recheck: {
                title: 'Ověřit opravený výsledek.',
                description:
                    'Kontroly znovu běží nad opravenými soubory. Dřívější úspěšný test by tuto novou verzi neověřil.',
                label: 'Znovu ověřit',
            },
            commit: {
                title: 'Jeden přijatý přechod.',
                description:
                    'Orchestrátor uloží implementaci, testy a dokončený úkol do jednoho commitu. Nasazení zůstává samostatnou akcí.',
                label: 'Zaznamenat',
            },
            pause: {
                title: 'Vyčerpaný rozpočet oprav znamená zastavení.',
                description:
                    'V této ukázce selže i druhá kontrola. Omezený počet pokusů pozastaví práci a předá nevyřešený problém vlastníkovi.',
                label: 'Pozastavit',
            },
        },
        note: 'Úspěšné kontroly znamenají splnění definovaných podmínek, nikoli důkaz bezchybnosti. Rozpočty oprav a eskalace jsou doporučené pojistky; jejich vynucování ověřte v nasazované verzi.',
    },
    history: {
        eyebrow: '04 / Kontinuita v základech',
        title: ['Práce i její výsledek.', 'Jedna společná historie.'],
        description:
            'Uchovávejte úkol vedle materiálů, které mění. Commit může zachytit výsledek i záznam o tom, že je úkol dokončený.',
        controls: 'Prozkoumat stavy repozitáře',
        states: ['Před změnou', 'Přijato', 'Vráceno'],
        demo: 'Ilustrační historie',
        task: 'Přidat zákaznický dashboard',
        implementation: 'Dashboard',
        taskLabel: 'Úkol',
        historyLabel: 'Historie Gitu',
        externalLabel: 'E-mail mimo Git',
        implementationStates: ['Zatím nepřidán', 'Implementace + testy', 'Původní soubory obnoveny'],
        taskStates: ['Otevřený', 'Dokončený', 'Znovu otevřený'],
        historyStates: ['Výchozí commit', 'Nový přijatý commit', 'Nový revert commit'],
        externalStates: ['Neodeslán', 'Odeslán po přijetí', 'Stále odeslán'],
        explanations: [
            'Úkol už existuje a je otevřený. Jeho implementace zatím nebyla přidána.',
            'Výsledek a dokončený úkol jsou uloženy společně. Zobrazený e-mail je samostatná, pozdější externí akce.',
            'Úplný revert obnoví soubory a znovu otevře tento dříve existující úkol. Přidá historii; nemaže ji ani neodvolá e-mail.',
        ],
        note: 'Ukázka předpokládá úplný revert bez konfliktů u dříve existujícího úkolu. Úkol vytvořený a dokončený ve stejném commitu může revertem zmizet. Částečné reverty a závislé změny potřebují kontrolu; před opakováním je nutné ověřit externí účinky.',
    },
    continuity: {
        eyebrow: 'Uchovejte to podstatné',
        title: 'Modely se mění. Kontext zůstává.',
        preservedTitle: 'Dlouhodobá hodnota',
        preserved: ['Záměr a rozhodnutí', 'Definice agentů a pravidla', 'Materiály, úkoly, kontroly a historie'],
        replaceableTitle: 'Vyměnitelný běh',
        replaceable: ['Model a poskytovatel', 'Adaptéry nástrojů a běhové prostředí', 'Obnovitelné cache a indexy'],
        note: 'Zachovaná definice nezaručuje stejné chování. Nový model ověřte na reprezentativních úkolech. Důležité záznamy o externích akcích patří do trvalé evidence, ne do zahoditelné cache.',
    },
    practice: {
        eyebrow: '05 / I za hranicemi kódu',
        title: 'Jedna architektura. Mnoho podob práce.',
        description:
            'APT organizuje odpovědnost, ne konkrétní obor. Scénáře ilustrují model; nejsou tvrzením o dostupných integracích.',
        choose: 'Vyberte příklad',
        labels: ['Agent', 'Projekt', 'Úkol'],
        trigger: 'Podnět',
        check: 'Ověření',
        boundary: 'Hranice',
        scenarios: [
            {
                name: 'Webová aplikace',
                signal: 'Monitoring hlásí opakovanou chybu.',
                parts: [
                    'Developer + bezpečnostní reviewer',
                    'Zdrojové soubory, dokumentace, produktový záměr',
                    'Reprodukovat chybu, opravit ji a doplnit regresní test',
                ],
                check: 'Před přijetím commitu ověřit opravu i projektové kontroly.',
                boundary: 'Úspěšný commit není důkazem úspěšného nasazení.',
            },
            {
                name: 'Účetní podklady',
                signal: 'Přichází nová faktura s chybějícími údaji.',
                parts: [
                    'Účetní agent + odborný reviewer',
                    'Faktury, bankovní podklady, dokumentované postupy',
                    'Dohledat chybějící informaci a připravit sladěné podklady',
                ],
                check: 'Ověřit součty, formální konzistenci a návaznosti mezi záznamy.',
                boundary:
                    'Příprava, odborné schválení a podání mají odlišné pravomoci. Technické kontroly nenahrazují odborný úsudek.',
            },
            {
                name: 'Zákaznická komunikace',
                signal: 'Několik zákazníků se ptá na stejnou věc.',
                parts: [
                    'Agent podpory + copywriter',
                    'Znalosti o produktu, pravidla komunikace, dostupná historie',
                    'Navrhnout odpověď a zlepšení dokumentace',
                ],
                check: 'Ověřit správnost, tón a řešení příčiny opakujících se dotazů.',
                boundary: 'Návrh odpovědi a její odeslání jsou odlišné operace. Odeslání má účinek mimo repozitář.',
            },
        ],
    },
    boundaries: {
        title: 'Autonomie má svůj mandát.',
        description:
            'Cíle neudělují oprávnění. Důvěryhodná agenda potřebuje omezený přístup, chráněné kontroly, rozpočty, trvalé záznamy externích akcí a možnost vlastníka běh zastavit nebo přesměrovat.',
        link: 'Prozkoumat provozní pojistky',
    },
    status: {
        eyebrow: 'Otevřený pohled na další vývoj',
        title: 'Základ. Další kroky. Vize.',
        cards: [
            {
                label: 'Popsané jádro',
                title: 'Kontext a vykonávání.',
                description:
                    'Agenti v .book, Markdown úkoly, pravidla výběru, kontrolní a opravný cyklus, společné commity, navazující práce a serverový běh podle popisu autora koncepce.',
            },
            {
                label: 'Plánováno',
                title: 'Více přenositelné expertizy.',
                description:
                    'Úkoly ve formátu .book, agentní review vedle deterministických kontrol a instalovatelný katalog agentů. Bez přiřazeného data vydání.',
            },
            {
                label: 'Dlouhodobá vize',
                title: 'Agenda s vlastní kontinuitou.',
                description:
                    'Projekt, který rozpoznává potřeby, rozvíjí se, zajišťuje provoz a v rámci výslovného mandátu zapojuje vlastníka při výjimkách.',
            },
        ],
        note: 'Verze 0.1 je koncepční a technický popis, nikoli nezávislý audit implementace nebo benchmark. Konektory, plánovač i pojistky je nutné ověřit pro konkrétní verzi.',
    },
    reader: {
        eyebrow: '06 / Kompletní whitepaper',
        title: 'O vrstvu hlouběji.',
        description:
            'Celá argumentace, kompromisy i podrobnosti. Přečtěte si jednu kapitolu nebo se ponořte do celého dokumentu.',
        by: 'Autor koncepce',
        translation: 'Původní české znění.',
        contents: 'Kapitoly',
        expand: 'Rozbalit vše',
        collapse: 'Sbalit vše',
        download: 'Stáhnout Markdown',
        source: 'Český originál',
        appendix: 'Příloha',
        abstract: 'Abstrakt',
    },
    closing: {
        title: ['Vlastněte záměr.', 'Ať práce pokračuje.'],
        description: 'Prozkoumejte Promptbook a pomozte utvářet budoucnost autonomních agend.',
        repository: 'Prozkoumat na GitHubu',
        contact: 'Spojte se s námi',
    },
};

export const WHITEPAPER_CONTENT: Readonly<Record<SupportedHomepageLanguage, WhitepaperContent>> = {
    en: ENGLISH_WHITEPAPER_CONTENT,
    cs: CZECH_WHITEPAPER_CONTENT,
};
