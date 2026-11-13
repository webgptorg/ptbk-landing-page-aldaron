import type { ComparisonValue } from './comparisons';
import type { SiteLocale } from './localization';

type Copy = Readonly<Record<SiteLocale, string>>;
export type CapabilityRow = 'integrations' | 'credentials' | 'trust' | 'remote' | 'harnesses';
type Capabilities = Record<CapabilityRow, ComparisonValue>;
const v = (cs: string, en: string, status?: ComparisonValue['status']): ComparisonValue => ({ cs, en, status });

export const CAPABILITY_REVIEW_DATE = { cs: '11. listopadu 2026', en: '11 November 2026' };
const ENGINE_SOURCE = 'https://github.com/webgptorg/promptbook/blob/3ed6803dd62e04433fa5ab3b7d8c19af1aa5c4ed/specs';
export const PROMPTBOOK_CAPABILITY_SOURCES: readonly [string, string][] = [
    ['Promptbook browser', `${ENGINE_SOURCE}/cli/browser.md`],
    ['Promptbook Wallet', `${ENGINE_SOURCE}/cli/wallet.md`],
    ['Promptbook local encryption', `${ENGINE_SOURCE}/cli/project-encryption.md`],
    ['Promptbook App and Zero Trust', `${ENGINE_SOURCE}/app/integration.md`],
    ['Promptbook harness selection', `${ENGINE_SOURCE}/cli/harnesses.md`],
    ['Promptbook automatic model selection', `${ENGINE_SOURCE}/agents/core-agents/router.md`],
];

export const CAPABILITY_ROWS: ReadonlyArray<{ id: CapabilityRow; label: Copy; promptbook: Copy }> = [
    {
        id: 'integrations', label: { cs: 'Integrace', en: 'Integrations' },
        promptbook: {
            cs: 'Univerzální prohlížeč ovládá webové aplikace podobně jako člověk, i bez hotového konektoru nebo API. Možnosti závisejí na přístupu, oprávněních a omezeních konkrétní služby.',
            en: 'A universal browser operates web apps much like a person, including services without a ready-made connector or API. Capabilities depend on access, permissions and each service’s restrictions.',
        },
    },
    {
        id: 'credentials', label: { cs: 'Hesla a přístupy', en: 'Passwords and credentials' },
        promptbook: {
            cs: 'Wallet je šifrovaná peněženka přístupů u Vás, oddělená od Gitu. Chráněná integrace vyplní heslo do ověřeného přihlášení; agent ho nedostává do svého kontextu. Ochrana vyžaduje dodržet oddělení Wallet od nástrojů agenta.',
            en: 'Wallet is an encrypted credential vault on your host, separate from Git. A protected integration fills verified sign-in forms without putting passwords in the agent’s context. Protection requires keeping Wallet isolated from agent tools.',
        },
    },
    {
        id: 'trust', label: { cs: 'Trust model', en: 'Trust model' },
        promptbook: {
            cs: 'Zero Trust pro spojení App–engine: pracovní obsah je šifrovaný mezi koncovými zařízeními a relay ani centrální backend jej nedešifrují. Externí AI a nástroje dostávají povolené vstupy; účetní a provozní metadata jsou samostatná.',
            en: 'Zero Trust for the App–engine connection: working content is encrypted between endpoints, and neither the relay nor central backend decrypts it. External AI and tools receive authorized inputs; account and operational metadata remain separate.',
        },
    },
    {
        id: 'remote', label: { cs: 'Ovládání z mobilu', en: 'Mobile and remote control' },
        promptbook: {
            cs: 'Vzdálenou ovládací appku připravujeme. Ověřené E2E spojení přes relay již existuje, samotné propojení však neznamená hotové ovládání. Dnes použijte lokální Console; její zavření běh enginu nezastaví.',
            en: 'The remote control app is in preparation. Authenticated E2E relay connectivity exists, but connectivity alone is not finished control. Today use the local Console; closing it does not stop the engine.',
        },
    },
    {
        id: 'harnesses', label: { cs: 'AI nástroje a jejich výběr', en: 'AI tools and selection' },
        promptbook: {
            cs: 'Codex, Claude Code, Gemini CLI, Qwen Code, OpenCode, GitHub Copilot, … Další integrace připojuje společné rozhraní. Promptbook automaticky volí vhodný dostupný nástroj i model podle úlohy, schopností a nastavených účtů; respektuje Vaši volbu i limity.',
            en: 'Codex, Claude Code, Gemini CLI, Qwen Code, OpenCode, GitHub Copilot, … A shared interface supports further integrations. Promptbook automatically chooses a suitable available tool and model for the task, capabilities and configured accounts, respecting your choices and limits.',
        },
    },
];

export const PROMPTBOOK_CAPABILITIES: Capabilities = {
    integrations: v('Univerzální prohlížeč. Webové aplikace i bez konektoru.', 'Universal browser. Web apps even without a connector.'),
    credentials: v('Lokální šifrovaný Wallet; hesla mimo kontext agenta.', 'Local encrypted Wallet; passwords outside the agent’s context.'),
    trust: v('Zero Trust: E2E App–engine. Relay pracovní obsah nečte.', 'Zero Trust: E2E App–engine. The relay cannot read working content.'),
    remote: v('Vzdálenou appku připravujeme; lokální Console je dostupná', 'Remote app in preparation; local Console available', 'conditional'),
    harnesses: v('Codex, Claude Code, Gemini CLI, Qwen Code, OpenCode, … Automatická volba podle úlohy a dostupnosti.', 'Codex, Claude Code, Gemini CLI, Qwen Code, OpenCode, … Automatic choice by task and availability.'),
};

/** Describe trust boundaries, rather than scoring all cloud services as insecure. */
export const ALTERNATIVE_CAPABILITIES = {
    'grok-bot': {
        integrations: v('Prohlížeč, připojené aplikace a desktopové příkazy', 'Browser, connected apps and desktop commands'),
        credentials: v('Přihlášení sdílená boty účtu na cloudovém počítači', 'Account bots share sign-ins on the cloud computer'),
        trust: v('Důvěra v cloud xAI; izolovaný počítač a oprávnění', 'Trust in xAI cloud; isolated computer and permissions'),
        remote: v('Grok Bot app, Slack nebo X Chat', 'Grok Bot app, Slack or X Chat', 'yes'),
        harnesses: v('Vestavěný Grok Bot', 'Built-in Grok Bot'),
    },
    openclaw: {
        integrations: v('Prohlížeč, pluginy, MCP a komunikační kanály', 'Browser, plugins, MCP and messaging channels'),
        credentials: v('Úložiště Gateway; také externí správci tajemství', 'Gateway stores; external secret providers also supported'),
        trust: v('Vlastní Gateway jako hranice důvěry; párování a oprávnění', 'Own Gateway as the trust boundary; pairing and permissions'),
        remote: v('Kanály a klienti; VPN/SSH, volitelně šifrovaný tunel', 'Channels and clients; VPN/SSH, optional encrypted tunnel', 'yes'),
        harnesses: v('Vlastní runtime, Codex/Claude a další integrace; routing a fallback', 'Own runtime, Codex/Claude and other integrations; routing and fallback'),
    },
    'openai-dots': {
        integrations: v('Pluginy, prohlížeč a delegování do Work/Codex', 'Plugins, browser and delegation to Work/Codex'),
        credentials: v('Chráněná uložená hesla pro podporované weby; model je nevidí', 'Protected saved passwords for supported sites; hidden from the model'),
        trust: v('Důvěra v cloud OpenAI; pravidla, oprávnění a kontrola akcí', 'Trust in OpenAI cloud; rules, permissions and action review'),
        remote: v('ChatGPT a propojená zařízení', 'ChatGPT and connected devices', 'yes'),
        harnesses: v('Vestavěný dot; deleguje do ChatGPT Work a Codex', 'Built-in dot; delegates to ChatGPT Work and Codex'),
    },
    'meta-muse': {
        integrations: v('Prohlížeč, konektory a vlastní API/CLI nástroje', 'Browser, connectors and custom API/CLI tools'),
        credentials: v('Oddělená služba přístupů v cloudové VM; agent nevidí hesla', 'Separate credential service in cloud VM; passwords hidden from agent'),
        trust: v('Cloudová VM, izolace a nezávislý Sentinel pro akce', 'Cloud VM, isolation and independent Sentinel for actions'),
        remote: v('Web a aplikace iOS/Android', 'Web and iOS/Android apps', 'yes'),
        harnesses: v('Vestavěný runtime Muse', 'Built-in Muse runtime'),
    },
    chatgpt: {
        integrations: v('Aplikace/pluginy, MCP a prohlížeč v agentním režimu', 'Apps/plugins, MCP and browser in agent mode'),
        credentials: v('Připojené účty; chráněné přihlášení převzetím prohlížeče', 'Connected accounts; protected sign-in via browser takeover'),
        trust: v('Důvěra v cloud OpenAI; oprávnění a schvalování akcí', 'Trust in OpenAI cloud; permissions and action approvals'),
        remote: v('Web, mobilní a desktopová aplikace', 'Web, mobile and desktop apps', 'yes'),
        harnesses: v('Režimy ChatGPT, Work a Codex podle plánu', 'ChatGPT, Work and Codex modes depending on plan'),
    },
    'google-workspace': {
        integrations: v('Google Workspace, podporované konektory a kroky', 'Google Workspace, supported connectors and steps'),
        credentials: v('Účty Google a oprávnění připojených služeb', 'Google accounts and connected-service permissions'),
        trust: v('Důvěra v cloud Google; firemní oprávnění a datové zásady', 'Trust in Google cloud; company permissions and data policies'),
        remote: v('Aplikace Workspace; správa toků ve Workspace Studio', 'Workspace apps; flow management in Workspace Studio', 'conditional'),
        harnesses: v('Vestavěné Gemini a kroky Workspace Studio', 'Built-in Gemini and Workspace Studio steps'),
    },
    'claude-cowork': {
        integrations: v('Konektory/MCP, prohlížeč a povolené složky přes Desktop', 'Connectors/MCP, browser and permitted folders through Desktop'),
        credentials: v('Připojené účty a oprávnění; přihlášení v prohlížeči', 'Connected accounts and permissions; browser sign-ins'),
        trust: v('Důvěra v cloud Anthropic; izolované relace a oprávnění', 'Trust in Anthropic cloud; isolated sessions and permissions'),
        remote: v('Web a mobil; místní zdroje potřebují běžící Desktop', 'Web and mobile; local resources need Desktop running', 'yes'),
        harnesses: v('Vestavěný Cowork s Claude', 'Built-in Cowork with Claude'),
    },
    'claude-code': {
        integrations: v('MCP, terminál a Chrome přes podporované rozšíření', 'MCP, terminal and Chrome through a supported extension'),
        credentials: v('Nativní přihlášení/API klíče; přístupy MCP dle serveru', 'Native sign-in/API keys; MCP credentials depend on server'),
        trust: v('Lokální běh; Remote Control přes TLS, přepisy na serverech Anthropic.', 'Local execution; Remote Control over TLS, transcripts on Anthropic servers.'),
        remote: v('Remote Control ve webu a mobilu; host musí běžet', 'Remote Control on web and mobile; host must stay on', 'yes'),
        harnesses: v('Claude Code; připojení Anthropic či podporovaný cloud', 'Claude Code; Anthropic or supported cloud connections'),
    },
    codex: {
        integrations: v('MCP, pluginy, terminál a prohlížeč podle prostředí', 'MCP, plugins, terminal and browser depending on environment'),
        credentials: v('Nativní přihlášení/API klíče a přístupy připojeného prostředí', 'Native sign-in/API keys and connected-environment credentials'),
        trust: v('Lokální nebo cloudový běh; vstupy zpracovává vybraný model', 'Local or cloud execution; selected model processes inputs'),
        remote: v('Mobilní přístup k hostiteli nebo cloudové úlohy dle prostředí', 'Mobile host access or cloud tasks depending on environment', 'conditional'),
        harnesses: v('Codex CLI/app/cloud; možnosti dle konfigurace', 'Codex CLI/app/cloud; capabilities vary by configuration'),
    },
    n8n: {
        integrations: v('Hotové uzly, HTTP/API, MCP a vlastní kód', 'Ready-made nodes, HTTP/API, MCP and custom code'),
        credentials: v('Šifrované přístupy v databázi instance; vlastní klíč', 'Encrypted credentials in the instance database; own key'),
        trust: v('Vlastní instance nebo důvěra v n8n Cloud; správa TLS a přístupů', 'Own instance or trust in n8n Cloud; TLS and access administration'),
        remote: v('Webové rozhraní; vzdálený přístup zabezpečujete u vlastní instance', 'Web UI; secure remote access yourself when self-hosting', 'conditional'),
        harnesses: v('AI uzly, agenti a směrování ve workflow; vlastní kód', 'AI nodes, agents and workflow routing; custom code'),
    },
    make: {
        integrations: v('Hotové moduly, HTTP/API, MCP a vlastní připojení', 'Ready-made modules, HTTP/API, MCP and custom connections'),
        credentials: v('Připojení a klíče spravované v Make', 'Connections and keys managed in Make'),
        trust: v('Důvěra v cloud Make; oprávnění a šifrování služby', 'Trust in Make cloud; service permissions and encryption'),
        remote: v('Webové rozhraní Make; nejde o lokální engine', 'Make web interface; no local engine', 'yes'),
        harnesses: v('Make AI Agents a modelová připojení ve scénářích', 'Make AI Agents and model connections in scenarios'),
    },
    paperclip: {
        integrations: v('Konektory, pluginy a nástroje připojených agentů', 'Connectors, plugins and connected-agent tools'),
        credentials: v('Lokálně šifrovaná tajemství; za běhu předaná procesu agenta', 'Locally encrypted secrets; passed to the agent process at runtime'),
        trust: v('Vlastní server; autentizace a HTTPS/VPN dle nasazení', 'Own server; authentication and HTTPS/VPN by deployment'),
        remote: v('Web; u vlastní instance nastavení HTTPS nebo Tailscale', 'Web; configure HTTPS or Tailscale when self-hosting', 'conditional'),
        harnesses: v('Claude Code, Codex, Gemini CLI, OpenCode, … dle adaptéru', 'Claude Code, Codex, Gemini CLI, OpenCode, … by adapter'),
    },
    'microsoft-copilot-studio': {
        integrations: v('Konektory, HTTP/API, MCP a nástroje Power Platform', 'Connectors, HTTP/API, MCP and Power Platform tools'),
        credentials: v('Připojení služeb, identity a správa tajemství Microsoftu', 'Service connections, identities and Microsoft secret management'),
        trust: v('Důvěra v cloud Microsoft; Entra, datové zásady a volitelné vlastní klíče', 'Trust in Microsoft cloud; Entra, data policies and optional customer keys'),
        remote: v('Teams, web a další publikované kanály', 'Teams, web and other published channels', 'yes'),
        harnesses: v('Orchestrace Copilot Studio, toky a připojení agenti', 'Copilot Studio orchestration, flows and connected agents'),
    },
} satisfies Record<string, Capabilities>;

type AlternativeSlug = keyof typeof ALTERNATIVE_CAPABILITIES;
export const ALTERNATIVE_MODELS: Record<AlternativeSlug, ComparisonValue> = {
    'grok-bot': v('Grok', 'Grok'),
    openclaw: v('Claude, GPT, Gemini, Qwen, … i lokální; routing a fallback', 'Claude, GPT, Gemini, Qwen, … including local; routing and fallback'),
    'openai-dots': v('Modely GPT řady 6', 'GPT 6-family models'),
    'meta-muse': v('Modely Muse od Meta', 'Meta’s Muse models'),
    chatgpt: v('Modely OpenAI podle plánu a režimu', 'OpenAI models by plan and mode'),
    'google-workspace': v('Gemini', 'Gemini'),
    'claude-cowork': v('Claude', 'Claude'),
    'claude-code': v('Claude; připojení dle konfigurace', 'Claude; connections by configuration'),
    codex: v('Modely dostupné v Codex; vlastní poskytovatel dle konfigurace CLI', 'Models available in Codex; custom provider via CLI configuration'),
    n8n: v('Claude, GPT, Gemini, Qwen, … i lokální přes Ollama', 'Claude, GPT, Gemini, Qwen, … including local via Ollama'),
    make: v('GPT, Claude, Gemini, … podle připojení a tarifu', 'GPT, Claude, Gemini, … depending on connection and plan'),
    paperclip: v('Claude, GPT, Gemini, Qwen, … dle připojeného nástroje', 'Claude, GPT, Gemini, Qwen, … depending on connected tool'),
    'microsoft-copilot-studio': v('Vybrané GPT, Claude, … dle oblasti a konfigurace', 'Selected GPT, Claude, … by region and configuration'),
};

export const ALTERNATIVE_DATA_LOCATIONS: Record<AlternativeSlug, ComparisonValue> = {
    'grok-bot': v('Soubory a relace v cloudu xAI', 'Files and sessions in xAI cloud'),
    openclaw: v('U Vás: pracovní složky a relace Gateway; Git složek volitelně', 'On your host: workspaces and Gateway sessions; optional workspace Git'),
    'openai-dots': v('Kontext a cloudový počítač u OpenAI; připojené zdroje zvlášť', 'Context and cloud computer at OpenAI; connected sources separate'),
    'meta-muse': v('Data v přidělené cloudové VM služby', 'Data in a dedicated service cloud VM'),
    chatgpt: v('Chaty a nahrané soubory u OpenAI; připojené zdroje zvlášť', 'Chats and uploaded files at OpenAI; connected sources separate'),
    'google-workspace': v('Data ve službách Google Workspace a připojených systémech', 'Data in Google Workspace services and connected systems'),
    'claude-cowork': v('Cloud Anthropic; povolené místní soubory se zpracovávají v cloudu', 'Anthropic cloud; permitted local files are processed in the cloud'),
    'claude-code': v('Lokální projekt a relace; kontext odesílaný modelu. Volitelně cloud.', 'Local project and sessions; context sent to the model. Optional cloud.'),
    codex: v('Lokální projekt nebo Codex Cloud podle režimu; kontext u modelu', 'Local project or Codex Cloud by mode; context at the model'),
    n8n: v('Databáze a soubory vlastní instance nebo n8n Cloud', 'Own instance database and files, or n8n Cloud'),
    make: v('Scénáře a historie v cloudu Make; připojené zdroje zvlášť', 'Scenarios and history in Make cloud; connected sources separate'),
    paperclip: v('U Vás: databáze úkolů a místní soubory; také cloudová nabídka', 'On your host: task database and local files; cloud option also available'),
    'microsoft-copilot-studio': v('Prostředí Power Platform a připojené datové zdroje', 'Power Platform environment and connected data sources'),
};

export const CAPABILITY_SOURCES: Record<AlternativeSlug, readonly [string, string][]> = {
    'grok-bot': [['Grok Bot security', 'https://docs.x.ai/grok-bot/security-faq']],
    openclaw: [
        ['OpenClaw browser', 'https://docs.openclaw.ai/browser'],
        ['OpenClaw security', 'https://docs.openclaw.ai/gateway/security'],
        ['OpenClaw secrets', 'https://docs.openclaw.ai/gateway/security/secrets-and-storage'],
        ['OpenClaw remote access', 'https://docs.openclaw.ai/gateway/remote/index.html'],
        ['OpenClaw model providers', 'https://github.com/openclaw/openclaw/blob/main/docs/providers/models.md'],
        ['OpenClaw model fallback', 'https://docs.openclaw.ai/concepts/model-failover'],
    ],
    'openai-dots': [['Dots privacy and security', 'https://help.openai.com/en/articles/20001529-dots-privacy-security-and-safety-faqs']],
    'meta-muse': [['Muse capabilities', 'https://ai.meta.com/muse/']],
    chatgpt: [['ChatGPT connected apps', 'https://help.openai.com/en/articles/11487775-connected-apps-in-chatgpt']],
    'google-workspace': [['Google Workspace security', 'https://workspace.google.com/security/']],
    'claude-cowork': [['Use Cowork safely', 'https://support.claude.com/en/articles/13364135-use-claude-cowork-safely']],
    'claude-code': [
        ['Claude Code Remote Control', 'https://code.claude.com/docs/en/remote-control'],
        ['Claude Code Chrome', 'https://code.claude.com/docs/en/chrome'],
    ],
    codex: [['Codex remote connections', 'https://learn.chatgpt.com/docs/remote-connections']],
    n8n: [['n8n credential encryption', 'https://docs.n8n.io/hosting/configuration/configuration-examples/encryption-key/']],
    make: [
        ['Make connections', 'https://help.make.com/connections'],
        ['Make AI providers', 'https://help.make.com/ai-providers-and-data-zones-in-make'],
    ],
    paperclip: [
        ['Paperclip adapters', 'https://docs.paperclip.ing/reference/adapters/overview/'],
        ['Paperclip secrets', 'https://docs.paperclip.ing/reference/deploy/secrets/'],
        ['Paperclip remote HTTPS', 'https://docs.paperclip.ing/reference/deploy/https/'],
    ],
    'microsoft-copilot-studio': [
        ['Copilot Studio architecture', 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/architecture-overview'],
        ['Copilot Studio security', 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/security-faq'],
        ['Copilot Studio models', 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-select-agent-model'],
    ],
};
