import type { SiteLocale } from './localization';

type Copy = Readonly<Record<SiteLocale, string>>;
type ComparisonRow = 'runtime' | 'continuity' | 'workspace' | 'model' | 'automation';
export type ComparisonStatus = 'yes' | 'no' | 'conditional' | 'unknown';
export type ComparisonValue = Copy & { status?: ComparisonStatus };
type ComparisonSummary = Record<ComparisonRow, ComparisonValue> & { useCase: Copy };

const value = (cs: string, en: string, status?: ComparisonStatus): ComparisonValue => ({ cs, en, status });

export type Comparison = {
    slug: string;
    name: string;
    sources: readonly [string, string][];
    advantage: Copy;
    summary: ComparisonSummary;
    rows: Record<ComparisonRow | 'fit', Copy>;
};

export const COMPARISON_REVIEW_DATE = { cs: '10. listopadu 2026', en: '10 November 2026' };

export const REBORN_SOURCE = 'https://github.com/webgptorg/promptbook/blob/1292ef33153efe17ea2886f1d2a569ff6c3c0e9e/README.md';

export const COMPARISON_ROWS: ReadonlyArray<{ id: ComparisonRow; label: Copy; promptbook: Copy }> = [
    {
        id: 'runtime',
        label: { cs: 'Vlastní provoz', en: 'Self-hosting' },
        promptbook: {
            cs: 'Engine, který spouští a plánuje práci agentů, běží na Vašem počítači, firemním serveru nebo VPS ve Vaší správě.',
            en: 'The engine that runs and schedules agent work lives on your computer, company server or VPS under your control.',
        },
    },
    {
        id: 'continuity',
        label: { cs: 'Běh při vypnutém počítači', en: 'Runs with your computer off' },
        promptbook: {
            cs: 'Zavření ovládacího okna práci nepřeruší. Vypnutí stroje s enginem ji zastaví. Engine na běžícím serveru může pracovat dál.',
            en: 'Closing the controls leaves work running. Shutting down the engine host stops it. An engine on a running server can continue.',
        },
    },
    {
        id: 'workspace',
        label: { cs: 'Pracovní prostředí', en: 'Workspace' },
        promptbook: {
            cs: 'Agenti, úkoly a konverzace jsou čitelné soubory ve Vašem projektu. Změny souborů vidíte v Gitu a průběh práce v záznamech úloh.',
            en: 'Agents, tasks and conversations are readable files in your project. Review file changes in Git and inspect task traces.',
        },
    },
    {
        id: 'model',
        label: { cs: 'AI model', en: 'AI model' },
        promptbook: {
            cs: 'Volíte podporovaný nástroj a model. Externí služby dostávají potřebné vstupy. Použití lokálního modelu závisí na adaptéru a úloze.',
            en: 'Choose a supported AI tool and model. External services receive the inputs they need. Local model use depends on the adapter and task.',
        },
    },
    {
        id: 'automation',
        label: { cs: 'Úlohy podle plánu', en: 'Scheduled tasks' },
        promptbook: {
            cs: 'Svěříte týmu agentů průběžnou agendu s cílem a pravidly. Engine spouští jednotlivé i opakované úlohy.',
            en: 'Give a team of agents an ongoing responsibility, goal and rules. The engine runs one-off and recurring tasks.',
        },
    },
];

export const PROMPTBOOK_SUMMARY: ComparisonSummary = {
    useCase: value('Průběžné firemní agendy', 'Ongoing business operations'),
    runtime: value('Váš počítač nebo server', 'Your computer or server', 'yes'),
    continuity: value('Pokud běží na jiném stroji', 'When hosted elsewhere', 'conditional'),
    workspace: value('Soubory projektu a Git', 'Project files and Git'),
    model: value('Volba nástroje a modelu', 'Choice of tool and model'),
    automation: value('Opakované úlohy agentů', 'Recurring agent tasks', 'yes'),
};

export const COMPARISONS: readonly Comparison[] = [
    {
        slug: 'grok-bot',
        name: 'Grok Bot',
        sources: [
            ['Grok Bot FAQ', 'https://docs.x.ai/grok-bot/faq'],
            ['Grok Bot computer and apps', 'https://docs.x.ai/grok-bot/computer-and-apps'],
        ],
        advantage: {
            cs: 'Když má agenda běžet u Vás. Třeba pravidelná kontrola dokladů ze sdílené složky, kde tým agentů používá stejný pracovní projekt i záznamy úloh.',
            en: 'When the operation should run on your own host. For example, agents can review invoices from a shared folder using the same working project and task history.',
        },
        summary: {
            useCase: value('AI kolegové v chatu', 'AI teammates in chat'),
            runtime: value('Cloud xAI, přístup k desktopu', 'xAI cloud, desktop access', 'no'),
            continuity: value('Cloudové rutiny', 'Cloud routines', 'yes'),
            workspace: value('Sdílený cloudový počítač', 'Shared cloud computer'),
            model: value('Grok', 'Grok'),
            automation: value('Rutiny botů', 'Bot routines', 'yes'),
        },
        rows: {
            runtime: { cs: 'Boti běží na trvalém cloudovém počítači služby. Na Vašem desktopu mohou s povolením spouštět jednotlivé příkazy.', en: 'Bots run on the service’s persistent cloud computer. With permission, they can run individual commands on your desktop.' },
            continuity: { cs: 'Cloudová práce a rutiny pokračují. Příkaz na desktopu potřebuje dostupný desktop.', en: 'Cloud work and routines continue. A desktop command needs the desktop to be available.' },
            workspace: { cs: 'Boti účtu sdílejí soubory, prohlížeč a přihlášení na cloudovém počítači.', en: 'Bots on the account share files, a browser and sign-ins on the cloud computer.' },
            model: { cs: 'AI zajišťuje služba Grok Bot.', en: 'AI is provided by the Grok Bot service.' },
            automation: { cs: 'Boti mohou spolupracovat, pracovat na pozadí a spouštět rutiny podle plánu.', en: 'Bots can collaborate, work in the background and run routines on a schedule.' },
            fit: { cs: 'Když chcete tým botů s hotovým cloudovým počítačem. Boti mohou vyřizovat rutiny a můžete s nimi mluvit ve Slacku nebo X Chatu.', en: 'When you want bots with a ready-made cloud computer. They can run routines, and you can talk to them in Slack or X Chat.' },
        },
    },
    {
        slug: 'openclaw',
        name: 'OpenClaw',
        sources: [
            ['OpenClaw Gateway', 'https://docs.openclaw.ai/gateway'],
            ['OpenClaw local models', 'https://docs.openclaw.ai/gateway/local-models'],
            ['OpenClaw automations', 'https://docs.openclaw.ai/cron'],
            ['OpenClaw multi-agent routing', 'https://docs.openclaw.ai/multi-agent'],
            ['OpenClaw workspace setup', 'https://docs.openclaw.ai/start/openclaw'],
        ],
        advantage: {
            cs: 'Když chcete týmu předat celou agendu, třeba zpracování podcastu od přepisu po podklady k publikaci. Role, úkoly a konverzace jsou soubory jednoho projektu a změny můžete projít v Gitu.',
            en: 'When you want a team to take over an entire operation, such as turning podcast recordings into transcripts and publishing materials. Roles, tasks and conversations are files in one project, with changes you can review in Git.',
        },
        summary: {
            useCase: value('Asistenti v komunikačních kanálech', 'Assistants in messaging channels'),
            runtime: value('Vlastní Gateway', 'Your own Gateway', 'yes'),
            continuity: value('Pokud Gateway běží jinde', 'When Gateway runs elsewhere', 'conditional'),
            workspace: value('Adresáře a relace agentů', 'Agent workspaces and sessions'),
            model: value('Cloudové i lokální', 'Cloud and local'),
            automation: value('Plánované úlohy Gateway', 'Gateway scheduled jobs', 'yes'),
        },
        rows: {
            runtime: { cs: 'Gateway provozujete na vlastním zařízení nebo vzdáleném hostiteli. Řídí relace, kanály a plánování.', en: 'Run the Gateway on your own device or a remote host. It coordinates sessions, channels and scheduling.' },
            continuity: { cs: 'Vzdálená Gateway může běžet dál. Plánované úlohy potřebují běžící Gateway.', en: 'A remote Gateway can keep running. Scheduled jobs need the Gateway to be running.' },
            workspace: { cs: 'Každý agent může mít vlastní pracovní adresář a relace. Dokumentace doporučuje uložit instrukce a paměť pracovního adresáře do soukromého repozitáře v Gitu.', en: 'Each agent can have its own workspace and sessions. The docs recommend backing up workspace instructions and memory in a private Git repository.' },
            model: { cs: 'Volba externích i lokálních modelů, včetně vlastního serveru nebo Ollama.', en: 'A choice of hosted and local models, including your own server or Ollama.' },
            automation: { cs: 'Gateway plánuje úlohy, uchovává jejich historii a doručuje výstupy do vybraných kanálů.', en: 'The Gateway schedules jobs, keeps their history and delivers results to selected channels.' },
            fit: { cs: 'Když chcete asistenty přímo ve WhatsAppu nebo Slacku a nastavit, který agent odpovídá v kterém kanálu. Na vlastní Gateway můžete provozovat více agentů i plánované úlohy.', en: 'When you want assistants inside WhatsApp or Slack and control over which agent answers in each channel. Your own Gateway can run multiple agents and scheduled jobs.' },
        },
    },
    {
        slug: 'openai-dots',
        name: 'OpenAI Dots',
        sources: [
            ['Introducing dots', 'https://openai.com/index/introducing-dots/'],
            ['Getting started with your dot', 'https://help.openai.com/en/articles/20001530-getting-started-with-your-dot'],
        ],
        advantage: {
            cs: 'Když má jednu firemní agendu převzít více rolí. Třeba aby jeden agent zpracoval podklady a druhý zkontroloval výsledek, se společnými pravidly v projektu na Vašem stroji.',
            en: 'When several roles should own one business operation. One agent can prepare the materials and another can review the result, with shared rules in a project on your own host.',
        },
        summary: {
            useCase: value('Osobní cíle a delegování v ChatGPT', 'Personal goals and delegation in ChatGPT'),
            runtime: value('Cloud OpenAI', 'OpenAI cloud', 'no'),
            continuity: value('Cloudový počítač dotu', 'Cloud computer for each dot', 'yes'),
            workspace: value('Připojené aplikace a podklady', 'Connected apps and files'),
            model: value('GPT-6 Astra', 'GPT-6 Astra'),
            automation: value('Připomínky a opakované kontroly', 'Reminders and recurring checks', 'yes'),
        },
        rows: {
            runtime: { cs: 'Dot má vlastní cloudový počítač v prostředí OpenAI.', en: 'A dot has its own cloud computer in OpenAI’s environment.' },
            continuity: { cs: 'Práce na cloudovém počítači může pokračovat bez zapnutého desktopu.', en: 'Cloud computer work can continue with your desktop switched off.' },
            workspace: { cs: 'Pracuje s podklady a aplikacemi připojenými k dotu. Firemní nastavení určuje workspace.', en: 'It works with material and apps connected to the dot. The workspace governs enterprise settings.' },
            model: { cs: 'OpenAI pro doty uvádí GPT-6 Astra.', en: 'OpenAI lists GPT-6 Astra as the model powering dots.' },
            automation: { cs: 'Průběžná práce na cílech, plánované kontroly a možnost delegovat do vláken ChatGPT Work nebo Codex.', en: 'Ongoing goal-based work, scheduled checks and delegation to ChatGPT Work or Codex threads.' },
            fit: { cs: 'Když chcete osobního asistenta v ChatGPT, který hlídá cíle a připomínky a podle potřeby deleguje práci do ChatGPT Work nebo Codexu.', en: 'When you want a personal assistant in ChatGPT to track goals and reminders and delegate to ChatGPT Work or Codex as needed.' },
        },
    },
    {
        slug: 'meta-muse',
        name: 'Meta Muse',
        sources: [
            ['Introducing Muse', 'https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/'],
            ['How Meta built safety into Muse', 'https://research.meta.ai/blog/security-and-safety-for-ai-agents-our-approach-with-muse'],
        ],
        advantage: {
            cs: 'Když chcete opakující se firemní proces rozdělit mezi více agentů. Například aby pravidelně připravovali podklady z firemní schránky a ukládali je do projektu, který spravujete.',
            en: 'When you want multiple agents to handle a recurring company process, such as preparing materials from a company inbox and saving them in a project you manage.',
        },
        summary: {
            useCase: value('Osobní organizace přes WhatsApp', 'Personal organization through WhatsApp'),
            runtime: value('Cloud Meta', 'Meta cloud', 'no'),
            continuity: value('Cloudové relace', 'Cloud sessions', 'yes'),
            workspace: value('Prohlížeč a připojené aplikace', 'Browser and connected apps'),
            model: value('Muse Spark', 'Muse Spark'),
            automation: value('Ověřená je práce na cílech', 'Goal-based work is documented', 'unknown'),
        },
        rows: {
            runtime: { cs: 'Agent běží v dedikovaném cloudovém prostředí Muse Secure VM spravovaném službou Meta.', en: 'The agent runs in a dedicated cloud environment, Muse Secure VM, managed by Meta.' },
            continuity: { cs: 'Muse pracuje na pozadí na svém cloudovém počítači.', en: 'Muse works in the background on its cloud computer.' },
            workspace: { cs: 'Vlastní prohlížeč a připojené aplikace v Muse Secure VM. Přístupy udělujete v Muse.', en: 'Its own browser and connected apps in Muse Secure VM. You grant access in Muse.' },
            model: { cs: 'Muse Spark od Meta.', en: 'Meta’s Muse Spark.' },
            automation: { cs: 'Muse plánuje kroky k osobním cílům a u citlivých akcí si vyžádá souhlas.', en: 'Muse plans steps toward personal goals and asks for consent on sensitive actions.' },
            fit: { cs: 'Když chcete přes WhatsApp nebo aplikaci Muse plánovat cestu, domlouvat termíny nebo si zorganizovat osobní úkoly a máte ke službě přístup.', en: 'When you want to plan travel, arrange appointments or organize personal tasks through WhatsApp or the Muse app where the service is available.' },
        },
    },
    {
        slug: 'chatgpt',
        name: 'ChatGPT',
        sources: [
            ['ChatGPT agent', 'https://help.openai.com/en/articles/11752874-chatgpt-agent'],
            ['Scheduled tasks in ChatGPT', 'https://help.openai.com/en/articles/10291617-scheduled-tasks-in-chatgpt'],
            ['ChatGPT workspace agents', 'https://openai.com/business/workspace-agents/'],
        ],
        advantage: {
            cs: 'Když chcete předat třeba pravidelnou údržbu webu a mít zadání agentů, úkoly i pracovní soubory v jednom projektu na stroji, který spravujete.',
            en: 'When you want to delegate recurring website maintenance and keep agent instructions, tasks and working files in one project on a host you manage.',
        },
        summary: {
            useCase: value('Univerzální asistent a agenti v cloudu', 'General assistant and cloud agents'),
            runtime: value('Cloud OpenAI', 'OpenAI cloud', 'no'),
            continuity: value('Plánované úlohy', 'Scheduled tasks', 'yes'),
            workspace: value('Chaty, soubory a aplikace', 'Chats, files and apps'),
            model: value('Podle plánu a režimu', 'Varies by plan and mode'),
            automation: value('Plánované úlohy a agenti', 'Scheduled tasks and agents', 'yes'),
        },
        rows: {
            runtime: { cs: 'ChatGPT je služba OpenAI. Režim agenta má vlastní virtuální prohlížeč pro online úlohy.', en: 'ChatGPT is an OpenAI service. Agent mode has a virtual browser for online tasks.' },
            continuity: { cs: 'Plánované úlohy služby mohou běžet i při vypnutém počítači.', en: 'The service’s scheduled tasks can run with your computer switched off.' },
            workspace: { cs: 'Konverzace a soubory v ChatGPT, připojené aplikace a nástroje podle režimu, plánu a oprávnění.', en: 'Conversations and files in ChatGPT, plus connected apps and tools depending on mode, plan and permissions.' },
            model: { cs: 'Modely dostupné v ChatGPT podle režimu a plánu.', en: 'Models available in ChatGPT for the selected mode and plan.' },
            automation: { cs: 'Běžný chat reaguje na zprávy. Plánované úlohy a agenti pracovního prostoru pokrývají opakovanou práci.', en: 'Ordinary chats respond to messages. Scheduled tasks and workspace agents cover recurring work.' },
            fit: { cs: 'Když chcete jedno místo pro dotazy, rešerše a práci s dokumenty. Pro opakovanou práci můžete využít plánované úlohy nebo agenty pracovního prostoru.', en: 'When you want one place for questions, research and document work. For recurring work, use scheduled tasks or workspace agents.' },
        },
    },
    {
        slug: 'google-workspace',
        name: 'Gemini for Google Workspace (Duet AI)',
        sources: [
            ['Google: Duet AI becomes Gemini for Google Workspace', 'https://blog.google/products-and-platforms/products/workspace/google-gemini-workspace/'],
            ['Google Workspace Studio', 'https://workspace.google.com/studio/'],
            ['Workspace Studio starters and steps', 'https://support.google.com/workspace-studio/table/17176961?hl=en'],
        ],
        advantage: {
            cs: 'Když jedna agenda potřebuje firemní složky, terminál i webové nástroje. Třeba když agent přepíše lokální nahrávku, připraví článek a předá ho do redakčního systému.',
            en: 'When an operation needs company folders, a terminal and web tools. For example, an agent can transcribe a local recording, draft an article and hand it off to your CMS.',
        },
        summary: {
            useCase: value('Automatizace práce v Google Workspace', 'Google Workspace automation'),
            runtime: value('Cloud Google', 'Google cloud', 'no'),
            continuity: value('Postupy ve Workspace Studio', 'Workspace Studio flows', 'yes'),
            workspace: value('Gmail, Disk a integrace', 'Gmail, Drive and integrations'),
            model: value('Gemini', 'Gemini'),
            automation: value('Workspace Studio', 'Workspace Studio', 'yes'),
        },
        rows: {
            runtime: { cs: 'V asistenci a automatizaci Google Workspace. Pro opakované postupy slouží Workspace Studio.', en: 'Within Google Workspace assistance and automation. Workspace Studio handles recurring workflows.' },
            continuity: { cs: 'Postupy ve Workspace Studio se spouštějí ve službě Google podle nastavených spouštěčů.', en: 'Workspace Studio flows run in Google’s service when their configured triggers fire.' },
            workspace: { cs: 'Nástroje Google Workspace jako Gmail a Disk, případně další podporované kroky a integrace.', en: 'Google Workspace tools such as Gmail and Drive, plus supported steps and integrations.' },
            model: { cs: 'Gemini v Google Workspace.', en: 'Gemini in Google Workspace.' },
            automation: { cs: 'Workspace Studio skládá postupy ze spouštěčů a kroků, včetně kroků Gemini.', en: 'Workspace Studio builds flows from triggers and steps, including Gemini steps.' },
            fit: { cs: 'Když se práce odehrává hlavně v Gmailu a na Disku. Třeba když chcete z příchozích zpráv vytahovat údaje a ukládat je do Tabulek pomocí Workspace Studia.', en: 'When work mainly takes place in Gmail and Drive. For example, use Workspace Studio to extract information from incoming messages and save it to Sheets.' },
        },
    },
    {
        slug: 'claude-cowork',
        name: 'Claude Cowork',
        sources: [
            ['Getting started with Claude Cowork', 'https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork'],
            ['Cowork on web, desktop and mobile', 'https://support.claude.com/en/articles/15520349-use-claude-cowork-on-web-desktop-and-mobile'],
        ],
        advantage: {
            cs: 'Když stejná agenda každý týden pracuje s místními podklady. Engine naplánuje úlohy a pracuje se soubory na svém hostiteli i po zavření ovládací aplikace.',
            en: 'When the same operation uses local material every week. The engine schedules tasks and works with files on its host even when you close the controls.',
        },
        summary: {
            useCase: value('Delegovaná práce s dokumenty a aplikacemi', 'Delegated work across documents and apps'),
            runtime: value('Cloud Anthropic, přístup přes Desktop', 'Anthropic cloud, Desktop access', 'no'),
            continuity: value('Cloudové úlohy', 'Cloud tasks', 'yes'),
            workspace: value('Aplikace a vybrané složky', 'Apps and selected folders'),
            model: value('Claude', 'Claude'),
            automation: value('Plánované úlohy', 'Scheduled tasks', 'yes'),
        },
        rows: {
            runtime: { cs: 'Relace běží na serverech Anthropic. Claude Desktop zprostředkuje přístup k povoleným lokálním zdrojům.', en: 'Sessions run on Anthropic’s servers. Claude Desktop bridges access to permitted local resources.' },
            continuity: { cs: 'Cloudová relace pokračuje. Přístup k místním souborům a prohlížeči přes Desktop potřebuje běžící aplikaci.', en: 'The cloud session continues. Access to local files and the browser through Desktop needs the app to stay open.' },
            workspace: { cs: 'Cloudové relace, připojené aplikace a vybrané složky z místního počítače přes Claude Desktop.', en: 'Cloud sessions, connected apps and selected local folders through Claude Desktop.' },
            model: { cs: 'Claude v prostředí Anthropic.', en: 'Claude in Anthropic’s environment.' },
            automation: { cs: 'Delegované úlohy, podagenti a plánované úlohy běžící na dálku.', en: 'Delegated tasks, subagents and remotely scheduled tasks.' },
            fit: { cs: 'Když chcete zadat třeba rešerši nebo přípravu prezentace a výsledek zkontrolovat z webu či telefonu. Pro práci s připojenými místními složkami nechte běžet Claude Desktop.', en: 'When you want to delegate research or a presentation and review the result from the web or your phone. Keep Claude Desktop open for work that needs connected local folders.' },
        },
    },
    {
        slug: 'claude-code',
        name: 'Claude Code',
        sources: [
            ['Claude Code overview', 'https://code.claude.com/docs/en/overview'],
            ['Run prompts on a schedule', 'https://code.claude.com/docs/en/scheduled-tasks'],
            ['Run Claude Code programmatically', 'https://code.claude.com/docs/en/headless'],
        ],
        advantage: {
            cs: 'Když Claude Code má být součástí průběžné údržby webu. V Promptbooku mu můžete vyhradit roli pro úpravy kódu a řídit ve stejném projektu i pravidelné kontroly a předání výsledků.',
            en: 'When Claude Code is part of ongoing website maintenance. Give it a coding role in Promptbook and coordinate recurring checks and handoffs in the same project.',
        },
        summary: {
            useCase: value('Vývoj v terminálu a ve skriptech', 'Development in the terminal and scripts'),
            runtime: value('Vlastní terminál, volitelně cloud', 'Local CLI, optional cloud', 'yes'),
            continuity: value('Vzdálené relace', 'Remote sessions', 'conditional'),
            workspace: value('Repozitář a terminál', 'Repository and terminal'),
            model: value('Claude', 'Claude'),
            automation: value('Relace, Desktop i cloud', 'Session, Desktop and cloud', 'yes'),
        },
        rows: {
            runtime: { cs: 'CLI spouštíte ve svém terminálu nebo CI. Anthropic nabízí i samostatné webové prostředí.', en: 'Run the CLI in your terminal or CI. Anthropic also offers a separate web environment.' },
            continuity: { cs: 'Lokální běh vyžaduje zapnutý hostitelský stroj. Vzdálený běh závisí na svém hostiteli.', en: 'Local work requires the host machine to stay on. Remote work depends on its own host.' },
            workspace: { cs: 'Při lokálním běhu pracuje s repozitářem a nástroji v povoleném pracovním prostředí.', en: 'In a local run it works with the repository and tools in its permitted workspace.' },
            model: { cs: 'Modely Claude. Připojení a volba modelu se řídí konfigurací Claude Code.', en: 'Claude models. Connection and model choice follow the Claude Code configuration.' },
            automation: { cs: 'Úlohy lze naplánovat v relaci, desktopové aplikaci i cloudu. Claude Code lze také spouštět ze skriptů nebo CI.', en: 'Schedule tasks in a session, on Desktop or in the cloud. Claude Code can also run from scripts or CI.' },
            fit: { cs: 'Když chcete řešit změny v repozitáři přímo z terminálu nebo přidat Claude do vlastního skriptu či CI.', en: 'When you want to work on a repository from the terminal or add Claude to your own script or CI.' },
        },
    },
    {
        slug: 'codex',
        name: 'Codex',
        sources: [
            ['Using Codex with your ChatGPT plan', 'https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan'],
            ['Using Codex Cloud', 'https://help.openai.com/en/articles/20001545-using-codex-cloud'],
            ['Scheduled tasks', 'https://learn.chatgpt.com/docs/automations?surface=app'],
        ],
        advantage: {
            cs: 'Když chcete Codex zapojit jako specialistu do celé agendy. Jeden agent může pravidelně vyhodnocovat podněty a Codex dostane vybrané úpravy kódu v rámci stejného projektu.',
            en: 'When you want Codex as a specialist in a broader operation. One agent can regularly triage requests and pass selected code changes to Codex within the same project.',
        },
        summary: {
            useCase: value('Vývoj a revize kódu', 'Coding and code review'),
            runtime: value('Vlastní terminál, volitelně cloud', 'Local CLI, optional cloud', 'yes'),
            continuity: value('Codex Cloud', 'Codex Cloud', 'conditional'),
            workspace: value('Lokální nebo cloudový repozitář', 'Local or cloud repository'),
            model: value('Podle režimu a konfigurace', 'Varies by mode and configuration'),
            automation: value('Plánované úlohy v aplikaci', 'Scheduled tasks in the app', 'yes'),
        },
        rows: {
            runtime: { cs: 'Codex má lokální režim pro vývojové prostředí a Codex Cloud pro úlohy na počítačích OpenAI.', en: 'Codex has a local mode for your development environment and Codex Cloud for tasks on OpenAI-managed computers.' },
            continuity: { cs: 'Vypnutí lokálního hostitele zastaví práci na něm. Codex Cloud na něm nezávisí.', en: 'Shutting down a local host stops work on it. Codex Cloud runs independently of it.' },
            workspace: { cs: 'V lokálním režimu povolené soubory na stroji. V cloudu izolované pracovní prostředí se zdroji připojenými k úloze.', en: 'Permitted files on the machine in local mode. An isolated workspace with task resources in cloud mode.' },
            model: { cs: 'Modely dostupné v Codexu podle zvoleného režimu a konfigurace.', en: 'Models available to Codex for the selected mode and configuration.' },
            automation: { cs: 'Vedle vývojových úloh v aplikaci, CLI a cloudu lze nastavit opakované úlohy. Ty s lokálním projektem potřebují zapnutý stroj a běžící aplikaci.', en: 'Alongside coding tasks in the app, CLI and cloud, you can schedule recurring work. Local project tasks need the machine and app running.' },
            fit: { cs: 'Když potřebujete hlavně napsat nebo zkontrolovat změnu v repozitáři a chcete si pro vývojovou úlohu vybrat lokální prostředí nebo Codex Cloud.', en: 'When you mainly need to write or review a repository change and want to choose between a local environment and Codex Cloud.' },
        },
    },
    {
        slug: 'n8n',
        name: 'n8n',
        sources: [
            ['n8n platform and self-hosting', 'https://github.com/n8n-io/n8n'],
            ['n8n self-hosted AI starter kit', 'https://docs.n8n.io/deploy/host-n8n/deploy-with-the-ai-starter-kit.md'],
            ['n8n Schedule Trigger', 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/'],
        ],
        advantage: {
            cs: 'Když další krok závisí na tom, co agent najde. Třeba při zpracování nejednotných dokladů dostane pravidla pro třídění i výjimky a podle výsledku zvolí další krok.',
            en: 'When the next step depends on what the agent finds. For example, give it rules for sorting nonstandard invoices and handling exceptions, and let it choose how to proceed.',
        },
        summary: {
            useCase: value('Vizuální workflow ve vlastní správě', 'Visual workflows with self-hosting'),
            runtime: value('Vlastní instance nebo n8n Cloud', 'Own instance or n8n Cloud', 'yes'),
            continuity: value('Pokud instance běží jinde', 'When hosted elsewhere', 'conditional'),
            workspace: value('Vizuální workflow a uzly', 'Visual workflows and nodes'),
            model: value('Více poskytovatelů, i lokálně', 'Multiple providers, including local'),
            automation: value('Plán a události', 'Schedules and events', 'yes'),
        },
        rows: {
            runtime: { cs: 'n8n Cloud nebo vlastní instance n8n.', en: 'n8n Cloud or your own n8n instance.' },
            continuity: { cs: 'Rozhoduje dostupnost instance a připojených systémů. n8n Cloud nezávisí na Vašem desktopu.', en: 'Depends on the instance and connected systems. n8n Cloud is independent of your desktop.' },
            workspace: { cs: 'Vizuální workflow, data a přístupy napojených uzlů, případně vlastní kód.', en: 'Visual workflows, data and access from connected nodes, and optional custom code.' },
            model: { cs: 'Více poskytovatelů. Sada pro vlastní provoz nabízí i Ollama.', en: 'Multiple providers. The self-hosted starter kit also offers Ollama.' },
            automation: { cs: 'Publikované workflow spouštěné plánem či událostí, s volitelnými uzly AI agentů.', en: 'Published workflows started by schedules or events, with optional AI agent nodes.' },
            fit: { cs: 'Když chcete vidět každý krok a větev procesu. Třeba jak se nový kontakt zapíše do CRM a odešle oznámení. Do konkrétního kroku můžete přidat AI.', en: 'When you want to see each step and branch, such as writing a new contact to your CRM and sending a notification. Add AI to the steps that need it.' },
        },
    },
    {
        slug: 'make',
        name: 'Make',
        sources: [
            ['Make AI Agents', 'https://help.make.com/introduction-to-make-ai-agent-new'],
            ['Make on-premise agent', 'https://help.make.com/on-premise-agent'],
            ['Schedule a Make scenario', 'https://help.make.com/schedule-a-scenario'],
        ],
        advantage: {
            cs: 'Když práce vyžaduje místní podklady a prohlížeč na stroji, který spravujete. Třeba když tým zpracuje nahrávku z firemní složky a připraví výstupy pro několik publikačních kanálů.',
            en: 'When work needs local files and a browser on a host you manage. For example, the team can process a recording from a company folder and prepare material for several publishing channels.',
        },
        summary: {
            useCase: value('Vizuální integrace v cloudu', 'Visual cloud integrations'),
            runtime: value('Cloud Make, síťový konektor', 'Make cloud, network connector', 'no'),
            continuity: value('Cloudové scénáře', 'Cloud scenarios', 'yes'),
            workspace: value('Scénáře a moduly', 'Scenarios and modules'),
            model: value('Podle připojení agenta', 'Varies by agent connection'),
            automation: value('Plán a události', 'Schedules and events', 'yes'),
        },
        rows: {
            runtime: { cs: 'Scénáře běží v Make. Enterprise konektor zprostředkuje přístup k podporovaným systémům ve vlastní síti.', en: 'Scenarios run in Make. The Enterprise connector bridges access to supported systems on your own network.' },
            continuity: { cs: 'Scénáře ve službě mohou běžet bez desktopu. Kroky přes místní konektor potřebují dostupný konektor.', en: 'Service scenarios can run without your desktop. Steps through an on-premise connector need it to be available.' },
            workspace: { cs: 'Scénáře, moduly a data připojených aplikací. Místní konektor podporuje rozhraní HTTP.', en: 'Scenarios, modules and data from connected apps. The on-premise connector supports HTTP interfaces.' },
            model: { cs: 'Možnosti modelů určuje nastavení AI agenta a připojení v Make.', en: 'Model options follow the agent and connection settings in Make.' },
            automation: { cs: 'Scénáře mohou běžet podle plánu nebo události a používat AI agenty jako součást postupu.', en: 'Scenarios can run on a schedule or event and use AI agents as part of the flow.' },
            fit: { cs: 'Když chcete rychle propojit existující aplikace hotovými moduly. Třeba po odeslání formuláře zapsat kontakt a vytvořit úkol.', en: 'When you want to connect existing apps quickly with ready-made modules, such as adding a contact and creating a task after a form submission.' },
        },
    },
    {
        slug: 'paperclip',
        name: 'Paperclip',
        sources: [
            ['Paperclip project and self-hosting', 'https://github.com/PaperclipAI/paperclip'],
            ['Paperclip core concepts', 'https://github.com/paperclipai/paperclip/blob/master/docs/start/core-concepts.md'],
        ],
        advantage: {
            cs: 'Když chcete nasadit jednu konkrétní firemní agendu a předat ji lidem, kteří ji budou spravovat. Role, pravidla a úkoly dostanou v čitelných souborech projektu s historií v Gitu. S nasazením může pomoct partner.',
            en: 'When you want to deploy a specific business operation and hand it over to the people who will run it. They get roles, rules and tasks in readable project files with Git history. An implementation partner can help.',
        },
        summary: {
            useCase: value('Řízení organizace agentů a rozpočtů', 'Agent organizations and budgets'),
            runtime: value('Vlastní instance', 'Own instance', 'yes'),
            continuity: value('Pokud běží na jiném stroji', 'When hosted elsewhere', 'conditional'),
            workspace: value('Role, cíle a rozpočty', 'Roles, goals and budgets'),
            model: value('Podle adaptéru', 'Varies by adapter'),
            automation: value('Plán a události', 'Schedules and events', 'yes'),
        },
        rows: {
            runtime: { cs: 'Paperclip lze hostovat u sebe. Adaptéry mohou spouštět agenty lokálně nebo je volat přes vzdálené rozhraní.', en: 'Paperclip can be self-hosted. Adapters can run agents locally or call them through a remote interface.' },
            continuity: { cs: 'Práce závisí na běžícím Paperclipu a dostupnosti konkrétního běhového prostředí agenta.', en: 'Work depends on Paperclip staying up and the specific agent runtime being available.' },
            workspace: { cs: 'Organizace, cíle, úkoly a rozpočty v Paperclipu. Pracovní prostředí agenta se řídí adaptérem.', en: 'Organizations, goals, tasks and budgets in Paperclip. Agent workspaces depend on the adapter.' },
            model: { cs: 'Výběr nástroje a modelu závisí na adaptéru, například Claude Code nebo Codex.', en: 'Tool and model choice depends on the adapter, for example Claude Code or Codex.' },
            automation: { cs: 'Plánované nebo událostní probouzení agentů, práce s přidělenými úkoly a rozpočty.', en: 'Scheduled or event-driven agent wakeups, assigned tasks and budgets.' },
            fit: { cs: 'Když chcete řídit agenty jako celou organizaci a potřebujete organizační hierarchii, vazbu úkolů na firemní cíle a měsíční rozpočty jednotlivých agentů.', en: 'When you want to run agents as a whole organization with reporting lines, tasks tied to company goals, and monthly budgets per agent.' },
        },
    },
    {
        slug: 'microsoft-copilot-studio',
        name: 'Microsoft Copilot Studio',
        sources: [
            ['Microsoft: autonomous agents', 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/autonomous-agents'],
            ['Microsoft: event triggers', 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-triggers-about'],
        ],
        advantage: {
            cs: 'Když má agenda spojit místní soubory, web a nástroje z více prostředí. Role a pravidla spravujete v jednom projektu na vlastním stroji.',
            en: 'When an operation combines local files, the web and tools from several environments. Manage roles and rules in one project on your own host.',
        },
        summary: {
            useCase: value('Agenti pro Microsoft 365 a Power Platform', 'Agents for Microsoft 365 and Power Platform'),
            runtime: value('Microsoft Power Platform', 'Microsoft Power Platform', 'no'),
            continuity: value('Cloudové toky', 'Cloud flows', 'yes'),
            workspace: value('Znalosti, nástroje a konektory', 'Knowledge, tools and connectors'),
            model: value('Podle konfigurace', 'Varies by configuration'),
            automation: value('Události a plánované toky', 'Events and scheduled flows', 'yes'),
        },
        rows: {
            runtime: { cs: 'Agenti jsou nasazení v prostředí Microsoft Copilot Studio a Power Platform.', en: 'Agents are deployed in Microsoft Copilot Studio and Power Platform environments.' },
            continuity: { cs: 'Služba může spouštět agenta na základě událostí i bez zapnutého desktopu.', en: 'The service can trigger agents on events with your desktop switched off.' },
            workspace: { cs: 'Znalosti, nástroje a konektory nakonfigurované v prostředí Microsoftu.', en: 'Knowledge, tools and connectors configured in the Microsoft environment.' },
            model: { cs: 'Model a orchestrace podle nastavení a dostupnosti v Copilot Studio.', en: 'Model and orchestration depend on Copilot Studio settings and availability.' },
            automation: { cs: 'Událostní spouštěče a toky pro samostatnou práci na základě události nebo plánu.', en: 'Event triggers and flows for autonomous work on an event or schedule.' },
            fit: { cs: 'Když už pracujete v Microsoft 365 a chcete, aby událost v Power Platform spustila agenta s firemními konektory a existující správou prostředí.', en: 'When you already use Microsoft 365 and want a Power Platform event to trigger an agent with company connectors and existing environment administration.' },
        },
    },
];
