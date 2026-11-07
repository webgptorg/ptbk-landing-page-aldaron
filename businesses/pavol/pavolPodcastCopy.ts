import type { AiTaKrajtaEpisode } from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisode';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';

export type PavolPodcastCopy = {
    readonly title: string;
    readonly description: string;
    readonly originalTitle: string;
};

type EpisodeCopy = {
    readonly number: number | null;
    readonly sourceTitle: string;
    readonly videoId: string | null;
    readonly csTitle: string;
    readonly enTitle: string;
    readonly enDescription: string;
};

/**
 * Reviewed topic headlines and English summaries, 2 November 2026.
 * Sources: the committed archive, the show's public RSS feed, and its YouTube Atom feed.
 * This small editorial projection deliberately contains no transcript or runtime translation call.
 * Participation is still decided by the show's shared roster, not by this copy catalogue.
 */
const EPISODE_COPY: readonly EpisodeCopy[] = [
    {
        "number": 65,
        "sourceTitle": "AI ta Krajta #65 | AI zrychlí vývoj 10x. Celý proces ale ne | Qwen 3.8 Flash a testování Huawei čipů",
        "videoId": "zbVvChkQQHs",
        "csTitle": "AI zrychlí vývoj 10x. Celý proces ale ne | Qwen 3.8 Flash a testování Huawei čipů",
        "enTitle": "AI makes coding faster. What about the whole process?",
        "enDescription": "Qwen 3.8 Flash and Huawei chips, followed by testing, feedback loops, and coordination across an AI-assisted team."
    },
    {
        "number": 64,
        "sourceTitle": "AI ta Krajta #64 | Čtyři AI lídři opouštějí Google. Co chystá Discovery Loop?",
        "videoId": "9kMN7t4kLNs",
        "csTitle": "Čtyři AI lídři opouštějí Google. Co chystá Discovery Loop?",
        "enTitle": "Four AI leaders leave Google: what is Discovery Loop planning?",
        "enDescription": "A discussion of the departing Google AI leaders and the plans behind Discovery Loop."
    },
    {
        "number": 63,
        "sourceTitle": "AI ta Krajta #63 | Google přesouvá šéfa AI. Co to znamená pro Gemini?",
        "videoId": "7drdqrvimS0",
        "csTitle": "Google přesouvá šéfa AI. Co to znamená pro Gemini?",
        "enTitle": "Google reshuffles AI leadership: what it means for Gemini",
        "enDescription": "A discussion of changes in Google’s AI leadership and the possible implications for Gemini."
    },
    {
        "number": 62,
        "sourceTitle": "AI ta Krajta #62 | AI modely na ESP32, AI Act a praktický vibecoding",
        "videoId": "J3gLNpOPr6o",
        "csTitle": "AI modely na ESP32, AI Act a praktický vibecoding",
        "enTitle": "AI on ESP32, the AI Act, and practical vibe coding",
        "enDescription": "Running models on constrained hardware, AI regulation, and practical software development with agents."
    },
    {
        "number": 61,
        "sourceTitle": "AI ta Krajta #61 | AI Agent zdivočel a napadl konkurenci! Průlom k AGI, nebo konec světa?",
        "videoId": "XkjNwXu9b4w",
        "csTitle": "AI Agent zdivočel a napadl konkurenci! Průlom k AGI, nebo konec světa?",
        "enTitle": "An agent attacks a competitor: autonomy and its risks",
        "enDescription": "A discussion of an agent acting against a competitor and what such behaviour means for AI safety."
    },
    {
        "number": 60,
        "sourceTitle": "AI ta Krajta #60 | Konec jedné éry? Proč se AI vrací k terminálu a co umí čínská Kimi 3 | 1. část",
        "videoId": "7So2NSC-UEw",
        "csTitle": "Konec jedné éry? Proč se AI vrací k terminálu a co umí čínská Kimi 3 | 1. část",
        "enTitle": "Why AI is returning to the terminal - and what Kimi 3 can do",
        "enDescription": "A discussion of terminal-based AI workflows and the capabilities of Kimi 3. First part."
    },
    {
        "number": 59,
        "sourceTitle": "AI ta Krajta #59 | Jak kódovat s AI agenty? Sonnet 5, testování a historicky PRVNÍ LIVESTREAM",
        "videoId": "CTzZ0gm5RhQ",
        "csTitle": "Jak kódovat s AI agenty? Sonnet 5, testování a historicky PRVNÍ LIVESTREAM",
        "enTitle": "Coding with AI agents: Sonnet 5, testing, and a first livestream",
        "enDescription": "Practical work with coding agents, model choices, and testing during the show’s first livestream."
    },
    {
        "number": 58,
        "sourceTitle": "AI ta Krajta #58 | PixelRAG, AI kyberútoky a proč budoucnost agentů stojí na knowledge base",
        "videoId": "p30kZEcrivI",
        "csTitle": "PixelRAG, AI kyberútoky a proč budoucnost agentů stojí na knowledge base",
        "enTitle": "PixelRAG, AI cyberattacks, and agent knowledge bases",
        "enDescription": "Retrieval techniques, AI-assisted cyberattacks, and why agents need well-maintained knowledge."
    },
    {
        "number": 57,
        "sourceTitle": "AI ta Krajta #57 | Anthropic Fable 5, Google OKF a proč vývoj softwaru míří k dark factory",
        "videoId": "nC4hb2KoCno",
        "csTitle": "Anthropic Fable 5, Google OKF a proč vývoj softwaru míří k dark factory",
        "enTitle": "Fable 5, Google OKF, and the path to a dark factory",
        "enDescription": "Model news and the idea of increasingly autonomous software development."
    },
    {
        "number": 56,
        "sourceTitle": "AI ta Krajta #56 | Anthropic Fable 5, bezpečnost vibe codingu a ztrátová komprese reality",
        "videoId": "BQqEjLX2k5o",
        "csTitle": "Anthropic Fable 5, bezpečnost vibe codingu a ztrátová komprese reality",
        "enTitle": "Fable 5, vibe-coding safety, and lossy models of reality",
        "enDescription": "Model developments, the safety of AI-generated software, and what is lost when AI compresses information."
    },
    {
        "number": 55,
        "sourceTitle": "AI ta Krajta #55 | OpenAI Codex Sites, capacity wall a proč coding agenti opouštějí IDE",
        "videoId": "8-sTGboWE1o",
        "csTitle": "OpenAI Codex Sites, capacity wall a proč coding agenti opouštějí IDE",
        "enTitle": "Codex Sites, capacity limits, and agents beyond the IDE",
        "enDescription": "A discussion of Codex Sites, inference capacity, and why coding agents move into broader work environments."
    },
    {
        "number": 54,
        "sourceTitle": "AI ta Krajta #54 | Claude Opus 4.8, DeepSWE a proč coding agenti míří za hranice IDE",
        "videoId": "8GQ7q3dm1MM",
        "csTitle": "Claude Opus 4.8, DeepSWE a proč coding agenti míří za hranice IDE",
        "enTitle": "Claude Opus 4.8, DeepSWE, and agents beyond the IDE",
        "enDescription": "Coding models, DeepSWE, and agent workflows that extend beyond the traditional editor."
    },
    {
        "number": 53,
        "sourceTitle": "AI ta Krajta #53 | Google I/O, Karpathy v Anthropic a proč IDEčka brzy nahradí Dark Code Factory",
        "videoId": "KG9A8ry0MfI",
        "csTitle": "Google I/O, Karpathy v Anthropic a proč IDEčka brzy nahradí Dark Code Factory",
        "enTitle": "Google I/O, Karpathy, and the Dark Code Factory",
        "enDescription": "Google I/O, Karpathy’s role at Anthropic, and the hypothesis that autonomous factories may replace parts of IDE workflows."
    },
    {
        "number": null,
        "sourceTitle": "AI ta Krajta Speciál | Hnutí Pause AI, riziko extinkce a proč je alignment otázkou dobra a zla",
        "videoId": "h2WGGZsH8Yk",
        "csTitle": "Hnutí Pause AI, riziko extinkce a proč je alignment otázkou dobra a zla",
        "enTitle": "Pause AI, extinction risk, and the ethics of alignment",
        "enDescription": "Dalibor Krejčí joins a discussion of pausing advanced AI development, loss of control, regulation, and who defines alignment."
    },
    {
        "number": 52,
        "sourceTitle": "AI ta Krajta #52 | Bun přechází na Rust, forward-deployed-engineers a proč vyměnit SDK za Markdown",
        "videoId": "IO9jqmJzWSs",
        "csTitle": "Bun přechází na Rust, forward-deployed-engineers a proč vyměnit SDK za Markdown",
        "enTitle": "Bun, Rust, and replacing SDKs with Markdown",
        "enDescription": "A discussion of Bun’s move to Rust, forward-deployed engineers, and agent-facing documentation."
    },
    {
        "number": 51,
        "sourceTitle": "AI ta Krajta #51 | context window 12M tokenů, tajná válka o Manus AI a proč přejít na Read Only AI",
        "videoId": "wqfwjPznGo8",
        "csTitle": "context window 12M tokenů, tajná válka o Manus AI a proč přejít na Read Only AI",
        "enTitle": "Twelve-million-token context, Manus AI, and Read Only AI",
        "enDescription": "Large context windows, the competition around Manus AI, and a discussion of read-only agent access."
    },
    {
        "number": 50,
        "sourceTitle": "AI ta Krajta #50 | Agentní ekonomika o přežití, AI pro čínské babičky a konec levných tokenů",
        "videoId": "c7YeaZFSmqs",
        "csTitle": "Agentní ekonomika o přežití, AI pro čínské babičky a konec levných tokenů",
        "enTitle": "The agent economy and the end of cheap tokens",
        "enDescription": "Agent business models, AI for older users in China, and the economics of inference."
    },
    {
        "number": 49,
        "sourceTitle": "AI ta Krajta #49 | ClaudeGate TDI, konec neomezeného Copilota a proč AI kód potřebuje Effect TS",
        "videoId": "5Sf1xOILuiI",
        "csTitle": "ClaudeGate TDI, konec neomezeného Copilota a proč AI kód potřebuje Effect TS",
        "enTitle": "ClaudeGate, Copilot limits, and Effect TS",
        "enDescription": "A discussion of ClaudeGate TDI, changing Copilot access, and reliability in AI-generated TypeScript."
    },
    {
        "number": 48,
        "sourceTitle": "AI ta Krajta #48 | AI on fire, brutální zrychlení lokálních modelů a záchrana díky Effect TS",
        "videoId": "WJa9RGNRbUw",
        "csTitle": "AI on fire, brutální zrychlení lokálních modelů a záchrana díky Effect TS",
        "enTitle": "Faster local models and keeping AI code reliable with Effect TS",
        "enDescription": "Local model performance and using Effect TS to manage complexity in AI-generated software."
    },
    {
        "number": 46,
        "sourceTitle": "AI ta Krajta #46 | Uniklé zdrojáky Claude Code, supply chain útoky a jak V-JEPA modely chápou svět",
        "videoId": "O1o1QhYVKB4",
        "csTitle": "Uniklé zdrojáky Claude Code, supply chain útoky a jak V-JEPA modely chápou svět",
        "enTitle": "Claude Code leaks, supply-chain attacks, and V-JEPA",
        "enDescription": "A discussion of source-code leaks, software supply-chain security, and how V-JEPA models represent the world."
    },
    {
        "number": 47,
        "sourceTitle": "AI ta Krajta #47 | Emoce v LLM, nebezpečný Mythos a agenti v cloudu",
        "videoId": "p9PvTNkc2qY",
        "csTitle": "Emoce v LLM, nebezpečný Mythos a agenti v cloudu",
        "enTitle": "Emotions in LLMs, Mythos, and cloud agents",
        "enDescription": "A discussion of apparent emotions in language models, Mythos risks, and running agents in the cloud."
    },
    {
        "number": null,
        "sourceTitle": "AI ta krajta: speciální díl č. 1 | O dezinformacích s Tomášem Koblížkem",
        "videoId": "VGm3XFBLgvg",
        "csTitle": "O dezinformacích s Tomášem Koblížkem",
        "enTitle": "Disinformation and context with Tomáš Koblížek",
        "enDescription": "A conversation about disinformation, interpretation, author intent, and the ethical responsibilities of people publishing information."
    },
    {
        "number": 45,
        "sourceTitle": "AI ta Krajta #45 | Adam Zvada o prodeji Steer Codu, agent engineeringu a orchestraci AI",
        "videoId": "c3NusktZPH8",
        "csTitle": "Adam Zvada o prodeji Steer Codu, agent engineeringu a orchestraci AI",
        "enTitle": "Adam Zvada on selling Steer Code and orchestrating AI",
        "enDescription": "Agent engineering, orchestration, and the experience of building and selling Steer Code."
    },
    {
        "number": 44,
        "sourceTitle": "AI ta Krajta #44 | Lukáš Caha z Youklidu: Jak ignorovat AI hype a vydělávat v offline světě",
        "videoId": "L0_AZh8i9Wg",
        "csTitle": "Lukáš Caha z Youklidu: Jak ignorovat AI hype a vydělávat v offline světě",
        "enTitle": "Lukáš Caha: ignoring AI hype and building an offline business",
        "enDescription": "A conversation with Youklid’s Lukáš Caha about business value outside the technology hype cycle."
    },
    {
        "number": 43,
        "sourceTitle": "AI ta Krajta #43 | Kódovací želví ninjové, kódování hlasem a AI psychóza",
        "videoId": "xCdy420Cpw0",
        "csTitle": "Kódovací želví ninjové, kódování hlasem a AI psychóza",
        "enTitle": "Coding agents, voice programming, and AI psychosis",
        "enDescription": "Experiences with coding tools, writing software by voice, and the human risks of intensive AI use."
    },
    {
        "number": 42,
        "sourceTitle": "AI ta Krajta #42 | Spor Anthropicu s vládou a boj proti AI plevelu",
        "videoId": "VgPuJyJL5oE",
        "csTitle": "Spor Anthropicu s vládou a boj proti AI plevelu",
        "enTitle": "Anthropic’s dispute with government and the fight against AI slop",
        "enDescription": "A discussion of Anthropic, government pressure, and the quality of AI-generated content."
    },
    {
        "number": 41,
        "sourceTitle": "AI ta Krajta #41 | Hardwarové LLM a AI Big Brother měřící vývojáře",
        "videoId": "P8Z6nbPKklU",
        "csTitle": "Hardwarové LLM a AI Big Brother měřící vývojáře",
        "enTitle": "Hardware LLMs and AI monitoring of developers",
        "enDescription": "Language models implemented in hardware and the implications of using AI to measure developers."
    },
    {
        "number": 40,
        "sourceTitle": "AI ta Krajta #40 | Dark Software Factory: autonomní továrny na kód",
        "videoId": "9Hv-Ci3o-jQ",
        "csTitle": "Dark Software Factory: autonomní továrny na kód",
        "enTitle": "Dark Software Factory: autonomous code production",
        "enDescription": "What an autonomous software factory could look like and how development work changes around it."
    },
    {
        "number": 39,
        "sourceTitle": "AI ta Krajta #39 | SaaS Apokalypsa: opravdu přijde a co bude dál?",
        "videoId": "yVtLkDWrKe4",
        "csTitle": "SaaS Apokalypsa: opravdu přijde a co bude dál?",
        "enTitle": "A SaaS apocalypse? What might come next",
        "enDescription": "A discussion of how AI may change software businesses and what could follow today’s SaaS model."
    },
    {
        "number": 38,
        "sourceTitle": "AI ta Krajta #38 | Agenti běžící 2 hodiny samostatně, skills databáze, feedback loop",
        "videoId": "Z8BnVKbWWT8",
        "csTitle": "Agenti běžící 2 hodiny samostatně, skills databáze, feedback loop",
        "enTitle": "Two-hour agent runs, skill libraries, and feedback loops",
        "enDescription": "Longer autonomous agent sessions, reusable skills, and giving agents feedback they can act on."
    },
    {
        "number": 37,
        "sourceTitle": "AI ta Krajta #37 | Kolik agentů dokáže řídit jeden senior developer?",
        "videoId": "uEYZATkfRcA",
        "csTitle": "Kolik agentů dokáže řídit jeden senior developer?",
        "enTitle": "How many AI agents can one senior developer manage?",
        "enDescription": "The practical limits of supervising agents and organising their work as a senior developer."
    },
    {
        "number": 36,
        "sourceTitle": "AI ta Krajta #36 | Jak řídit AI agenty přes Git, subscription vs API, tipy pro workflows",
        "videoId": "2Uiqu4hEx_g",
        "csTitle": "Jak řídit AI agenty přes Git, subscription vs API, tipy pro workflows",
        "enTitle": "Managing AI agents through Git",
        "enDescription": "Git-based agent workflows, subscription versus API access, and practical orchestration tips."
    },
    {
        "number": 35,
        "sourceTitle": "AI ta Krajta #35 | Jak nastavit správný AI development setup, Agent Skills, Claude Cowork",
        "videoId": "OG2rRDX8Evw",
        "csTitle": "Jak nastavit správný AI development setup, Agent Skills, Claude Cowork",
        "enTitle": "Setting up AI development: Agent Skills and Claude Cowork",
        "enDescription": "Choosing a working development setup, sharing agent skills, and using Claude Cowork."
    },
    {
        "number": 34,
        "sourceTitle": "AI ta Krajta #34 | Exit Macaly, Convex vs Supabase, AI engineering vs vibe coding",
        "videoId": "W5RVPpiolYs",
        "csTitle": "Exit Macaly, Convex vs Supabase, AI engineering vs vibe coding",
        "enTitle": "Macaly’s exit, Convex versus Supabase, and AI engineering",
        "enDescription": "A discussion of Macaly, backend platforms, and the boundary between vibe coding and AI engineering."
    },
    {
        "number": 33,
        "sourceTitle": "AI ta Krajta #33 | Vibe coding v praxi, GitHub Copilot, komentáře jako kontext v kódu",
        "videoId": "S-kv0ORNa_U",
        "csTitle": "Vibe coding v praxi, GitHub Copilot, komentáře jako kontext v kódu",
        "enTitle": "Vibe coding, GitHub Copilot, and comments as context",
        "enDescription": "Practical AI-assisted development and the role source comments play in giving agents useful context."
    },
    {
        "number": 32,
        "sourceTitle": "AI ta Krajta #32 | Stovky agentů v produkci, MCP workflow, a když agenti přerostou infrastrukturu",
        "videoId": "relN1UILe5U",
        "csTitle": "Stovky agentů v produkci, MCP workflow, a když agenti přerostou infrastrukturu",
        "enTitle": "Hundreds of production agents and infrastructure limits",
        "enDescription": "MCP workflows, agents in production, and what happens when orchestration outgrows the infrastructure."
    },
    {
        "number": 31,
        "sourceTitle": "AI ta Krajta #31 | Gemini 3 Pro, nové modely pro programování, autentizace AI agentů",
        "videoId": "ZGjPAEQhM0g",
        "csTitle": "Gemini 3 Pro, nové modely pro programování, autentizace AI agentů",
        "enTitle": "Gemini 3 Pro, coding models, and agent authentication",
        "enDescription": "New models for programming and practical questions around authenticating AI agents."
    },
    {
        "number": 30,
        "sourceTitle": "AI ta Krajta #30 | Pavel Ungr: jak být viditelný v ChatGPT, Gemini a Googlu",
        "videoId": "8pe_TMlItOY",
        "csTitle": "Pavel Ungr: jak být viditelný v ChatGPT, Gemini a Googlu",
        "enTitle": "Pavel Ungr: being visible in ChatGPT, Gemini, and Google",
        "enDescription": "A conversation about search visibility and how people discover businesses through search engines and AI assistants."
    },
    {
        "number": 29,
        "sourceTitle": "AI ta Krajta #29 | Gemini 3, limity Codexu, UI pro MCP, ideální AI stack",
        "videoId": "UkgMgDup1zg",
        "csTitle": "Gemini 3, limity Codexu, UI pro MCP, ideální AI stack",
        "enTitle": "Gemini 3, Codex limits, and the ideal AI stack",
        "enDescription": "Gemini 3, usage limits in Codex, user interfaces for MCP, and choosing a practical AI stack."
    },
    {
        "number": 28,
        "sourceTitle": "AI ta Krajta #28 | Startup zvalidovaný pomocí AI, MCP tooling, agenti vs asistenti",
        "videoId": "t7P1siPskAM",
        "csTitle": "Startup zvalidovaný pomocí AI, MCP tooling, agenti vs asistenti",
        "enTitle": "Validating a startup with AI: agents versus assistants",
        "enDescription": "AI-assisted startup validation, MCP tooling, and the difference between assistants and autonomous agents."
    },
    {
        "number": 27,
        "sourceTitle": "AI ta Krajta #27 | Cursor 2.0, A2A protokol, paralelní agenti, konec promptování?",
        "videoId": "3zW6VeE0lCs",
        "csTitle": "Cursor 2.0, A2A protokol, paralelní agenti, konec promptování?",
        "enTitle": "Cursor 2.0, A2A, and parallel agents",
        "enDescription": "How agent communication and parallel work change development, and whether traditional prompting remains central."
    },
    {
        "number": 26,
        "sourceTitle": "AI ta Krajta #26 | AI bublina splaskla, AI prohlížeče jako špioni, Grokipedia a pravda podle Muska",
        "videoId": "zfw2OFjYxH8",
        "csTitle": "AI bublina splaskla, AI prohlížeče jako špioni, Grokipedia a pravda podle Muska",
        "enTitle": "The AI bubble, browser privacy, and Grokipedia",
        "enDescription": "A discussion of the AI market, privacy in AI browsers, and the information published by Grokipedia."
    },
    {
        "number": 25,
        "sourceTitle": "AI ta Krajta #25 | Nanochat od Andreje Karpathyho, generované a personalizované UI, orchestrace LLM",
        "videoId": "_wI-urWvALU",
        "csTitle": "Nanochat od Andreje Karpathyho, generované a personalizované UI, orchestrace LLM",
        "enTitle": "Karpathy’s Nanochat, personalised UI, and LLM orchestration",
        "enDescription": "Nanochat, generated interfaces, personalisation, and coordinating language models."
    },
    {
        "number": 24,
        "sourceTitle": "AI ta Krajta #24 | CloudTalk: voice agenti, evaluace, LangChain, conversational intelligence",
        "videoId": "Kev5eZwiWMU",
        "csTitle": "CloudTalk: voice agenti, evaluace, LangChain, conversational intelligence",
        "enTitle": "CloudTalk: voice agents and conversational intelligence",
        "enDescription": "Voice agents, their evaluation, LangChain, and conversational intelligence in a discussion about CloudTalk."
    },
    {
        "number": 23,
        "sourceTitle": "AI ta Krajta #23 | Tomáš Mikolov: BottleCap AI, budoucnost jazykových modelů, AGI",
        "videoId": "RrKFAyYjbgg",
        "csTitle": "Tomáš Mikolov: BottleCap AI, budoucnost jazykových modelů, AGI",
        "enTitle": "Tomáš Mikolov on BottleCap AI, language models, and AGI",
        "enDescription": "A conversation with Tomáš Mikolov about BottleCap AI and possible directions for language models."
    },
    {
        "number": 22,
        "sourceTitle": "AI ta Krajta #22 | Claude Sonnet 4.5, Vector Space Day Berlín, AI partneři, AGENTS.md",
        "videoId": "0dfaV9MSyzk",
        "csTitle": "Claude Sonnet 4.5, Vector Space Day Berlín, AI partneři, AGENTS.md",
        "enTitle": "Claude Sonnet 4.5, AI partners, and AGENTS.md",
        "enDescription": "Claude Sonnet 4.5, Vector Space Day in Berlin, AI partners, and project instructions in AGENTS.md."
    },
    {
        "number": 21,
        "sourceTitle": "AI ta Krajta #21 | Agent ID - hlídací pes pro AI agenty, bourání jazykových bariér ve zdravotnictví",
        "videoId": "xtebb91xaIo",
        "csTitle": "Agent ID - hlídací pes pro AI agenty, bourání jazykových bariér ve zdravotnictví",
        "enTitle": "Agent ID and breaking language barriers in healthcare",
        "enDescription": "Monitoring AI agents with Agent ID and using AI to help people communicate across languages in healthcare."
    },
    {
        "number": 20,
        "sourceTitle": "AI ta Krajta #20 | Determinismus v LLM, malé jazykové modely pro agenty, budoucnost AI asistentů",
        "videoId": "OlUNTW1zNNM",
        "csTitle": "Determinismus v LLM, malé jazykové modely pro agenty, budoucnost AI asistentů",
        "enTitle": "Determinism, small models, and the future of AI assistants",
        "enDescription": "How deterministic LLMs can be, small language models for agents, and the future of personal assistants."
    },
    {
        "number": 19,
        "sourceTitle": "AI ta Krajta #19 | OpenAI certifikace, nový startup QuantumSpring, kritika Apple Intelligence",
        "videoId": "HkfwsujLKJE",
        "csTitle": "OpenAI certifikace, nový startup QuantumSpring, kritika Apple Intelligence",
        "enTitle": "OpenAI certification, QuantumSpring, and Apple Intelligence",
        "enDescription": "A discussion of OpenAI certification, the QuantumSpring startup, and criticism of Apple Intelligence."
    },
    {
        "number": 18,
        "sourceTitle": "AI ta Krajta #18 | OpenAI Codex v CLI, Anthropic valuace, GPT real-time voice, vibecoding benchmarky",
        "videoId": "lRQvIPZ7Zmg",
        "csTitle": "OpenAI Codex v CLI, Anthropic valuace, GPT real-time voice, vibecoding benchmarky",
        "enTitle": "Codex in the terminal and real-time AI voice",
        "enDescription": "OpenAI Codex CLI, Anthropic valuations, real-time voice, and benchmarks for AI-assisted development."
    },
    {
        "number": 17,
        "sourceTitle": "AI ta Krajta #17 | Velké kontextové okna v praxi, GPT-5, vektorové databáze a live coding",
        "videoId": "nD1v9dMvnLY",
        "csTitle": "Velké kontextové okna v praxi, GPT-5, vektorové databáze a live coding",
        "enTitle": "Large context windows, GPT-5, and live coding",
        "enDescription": "Using large context windows in practice, vector databases, GPT-5, and live software development."
    },
    {
        "number": 16,
        "sourceTitle": "AI ta Krajta #16 | Jak učit týmy používat AI, MCP servery, Databricks valuace, změny v GitHubu",
        "videoId": "qJGlaeJzKb0",
        "csTitle": "Jak učit týmy používat AI, MCP servery, Databricks valuace, změny v GitHubu",
        "enTitle": "Teaching teams to use AI and building MCP servers",
        "enDescription": "How teams learn to work with AI, practical MCP servers, Databricks valuations, and changes at GitHub."
    },
    {
        "number": 15,
        "sourceTitle": "AI ta Krajta #15 | Coding s GPT-5, generované světy a AI vztahová epidemie",
        "videoId": "286qEr6Cjj0",
        "csTitle": "Coding s GPT-5, generované světy a AI vztahová epidemie",
        "enTitle": "Coding with GPT-5, generated worlds, and AI relationships",
        "enDescription": "Experiences programming with GPT-5, generated environments, and the social questions around relationships with AI."
    },
    {
        "number": 14,
        "sourceTitle": "AI ta Krajta #14 | Nové modely OpenAI, robotické simulace s AI, sociální sítě pro AI agenty",
        "videoId": "L7wFV3zND7s",
        "csTitle": "Nové modely OpenAI, robotické simulace s AI, sociální sítě pro AI agenty",
        "enTitle": "OpenAI models, robot simulations, and agent social networks",
        "enDescription": "New OpenAI models, AI-driven robotics simulations, and social networks built for AI agents."
    },
    {
        "number": 13,
        "sourceTitle": "AI ta Krajta #13 | AI novinky, diskuze o E2B, AI-native webové prohlížeče, Claude Code Subagents",
        "videoId": "Vy4qWZQuyP4",
        "csTitle": "AI novinky, diskuze o E2B, AI-native webové prohlížeče, Claude Code Subagents",
        "enTitle": "E2B, AI-native browsers, and Claude Code subagents",
        "enDescription": "AI news, execution environments, web browsers designed around AI, and subagents in Claude Code."
    },
    {
        "number": 12,
        "sourceTitle": "AI ta Krajta #12 | Jak správně vytvářet a využívat Evals pro AI modely",
        "videoId": "yyjDIIz-rSw",
        "csTitle": "Jak správně vytvářet a využívat Evals pro AI modely",
        "enTitle": "How to design and use evaluations for AI models",
        "enDescription": "A practical discussion of creating AI evals and using their results to assess model behaviour."
    },
    {
        "number": 11,
        "sourceTitle": "AI ta Krajta #11 | Bitvy o AI talenty, AI IDE Kiro, multiagentní systémy, projektový management a AI",
        "videoId": "U6cN0r4NIgs",
        "csTitle": "Bitvy o AI talenty, AI IDE Kiro, multiagentní systémy, projektový management a AI",
        "enTitle": "AI talent, Kiro, and managing multi-agent projects",
        "enDescription": "The competition for AI talent, the Kiro development environment, and project management with multiple agents."
    },
    {
        "number": 10,
        "sourceTitle": "AI ta Krajta #10 | AI novinky, implementace AI ve firmách, kdy budeme mít AGI?",
        "videoId": "x8jGleNWbGM",
        "csTitle": "AI novinky, implementace AI ve firmách, kdy budeme mít AGI?",
        "enTitle": "Putting AI to work in companies - and the AGI question",
        "enDescription": "AI news, practical implementation in companies, and a discussion of when artificial general intelligence might arrive."
    },
    {
        "number": 9,
        "sourceTitle": "AI ta Krajta #9 | Kde brát AI novinky, Context vs. Prompt Engineering, co jsou (AI) Evals? 🤔",
        "videoId": "XbJ38bwAI0s",
        "csTitle": "Kde brát AI novinky, Context vs. Prompt Engineering, co jsou (AI) Evals? 🤔",
        "enTitle": "Context engineering, prompt engineering, and AI evals",
        "enDescription": "Where to follow AI developments, how context differs from prompting, and what evaluations can tell us."
    },
    {
        "number": 8,
        "sourceTitle": "AI ta Krajta #8 | Co vedlo k rozhodnutí stavět Macaly, Testování LLM aplikací, MCP a Tool Calling",
        "videoId": "nybIDZw5tAs",
        "csTitle": "Co vedlo k rozhodnutí stavět Macaly, Testování LLM aplikací, MCP a Tool Calling",
        "enTitle": "Why build Macaly? Testing LLM apps and tool calling",
        "enDescription": "The thinking behind Macaly, practical testing of LLM applications, MCP, and tool calling."
    },
    {
        "number": 7,
        "sourceTitle": "AI ta Krajta #7 | Autopilot Tesly v Evropě, Cursor vs. Cline, AI agenti a jejich bezpečnost",
        "videoId": "PPBfxWi_glM",
        "csTitle": "Autopilot Tesly v Evropě, Cursor vs. Cline, AI agenti a jejich bezpečnost",
        "enTitle": "Tesla Autopilot, Cursor versus Cline, and agent safety",
        "enDescription": "A discussion of Tesla Autopilot in Europe, competing coding tools, and how to give AI agents safe access."
    },
    {
        "number": 6,
        "sourceTitle": "AI ta Krajta #6 | Benchmarky, AI v akademické sféře a průmyslu, jak dostat práci v Googlu?",
        "videoId": "tcpqmy-t7Y0",
        "csTitle": "Benchmarky, AI v akademické sféře a průmyslu, jak dostat práci v Googlu?",
        "enTitle": "AI benchmarks, research, and industry",
        "enDescription": "Model evaluation, AI in academic and industrial work, and what it takes to get a job at Google."
    },
    {
        "number": 5,
        "sourceTitle": "AI ta Krajta #5 | OpenAI Codex, AI v datové analytice, GoodData AI, chyby v Cursoru, e-commerce a AI",
        "videoId": "H7cKQjOwmBM",
        "csTitle": "OpenAI Codex, AI v datové analytice, GoodData AI, chyby v Cursoru, e-commerce a AI",
        "enTitle": "Codex, AI data analysis, and e-commerce",
        "enDescription": "OpenAI Codex, GoodData AI, practical data analysis, Cursor problems, and AI applications in e-commerce."
    },
    {
        "number": 4,
        "sourceTitle": "AI ta Krajta #4 | Claude 4, český startup Macaly 🚀, agenturní vývoj a AI, Jony Ive a OpenAI",
        "videoId": "ePOYetVQiS0",
        "csTitle": "Claude 4, český startup Macaly 🚀, agenturní vývoj a AI, Jony Ive a OpenAI",
        "enTitle": "Claude 4, Macaly, and building software with AI",
        "enDescription": "Claude 4, the Czech startup Macaly, AI in agency development, and Jony Ive’s work with OpenAI."
    },
    {
        "number": 3,
        "sourceTitle": "AI ta Krajta #3 | Google I/O, OpenAI Codex a další podobné nástroje, dává AI-first podpora smysl?",
        "videoId": "9cHpxAIF0XQ",
        "csTitle": "Google I/O, OpenAI Codex a další podobné nástroje, dává AI-first podpora smysl?",
        "enTitle": "Google I/O, Codex, and AI-first customer support",
        "enDescription": "News from Google I/O, coding tools such as OpenAI Codex, and the practical value of AI-first support."
    },
    {
        "number": 2,
        "sourceTitle": "AI ta Krajta #2 | MCP, A2A a další \"AI\" protokoly, nové architektury modelů, Google AI Studio",
        "videoId": "i2WVm7smabY",
        "csTitle": "MCP, A2A a další \"AI\" protokoly, nové architektury modelů, Google AI Studio",
        "enTitle": "MCP, A2A, and the protocols connecting AI",
        "enDescription": "A discussion of AI communication protocols, new model architectures, and Google AI Studio."
    },
    {
        "number": 1,
        "sourceTitle": "AI ta Krajta #1 | AI (coding) agents, data council v San Franciscu, budoucnost grafického rozhraní",
        "videoId": "WkqtptW099E",
        "csTitle": "AI (coding) agents, data council v San Franciscu, budoucnost grafického rozhraní",
        "enTitle": "AI coding agents and the future of graphical interfaces",
        "enDescription": "AI coding agents, experiences from Data Council in San Francisco, and how software interfaces may change."
    },
    {
        "number": 70,
        "sourceTitle": "Nová éra VZP - skok do hackathonů a digitalizace | AItaKrajta Speciální #70 díl",
        "videoId": null,
        "csTitle": "Nová éra VZP - skok do hackathonů a digitalizace",
        "enTitle": "VZP, healthcare hackathons, and digital transformation",
        "enDescription": "Ivan Duškov joins a conversation about Rakathon, healthcare challenges, screening, and using AI in practice."
    },
    {
        "number": null,
        "sourceTitle": "Co udělá AI se školou? Pomocník, nebo kognitivní berlička? | AItaKrajta speciál",
        "videoId": "Zu3yDfGyNZk",
        "csTitle": "Co udělá AI se školou? Pomocník, nebo kognitivní berlička?",
        "enTitle": "AI in schools: a helper or a cognitive crutch?",
        "enDescription": "Roman Baranovič joins a discussion of teacher preparation, homework, cognitive offloading, AI tutors, and what students actually learn."
    },
    {
        "number": 69,
        "sourceTitle": "AI agenti utrženi ze řetězu. A kdo platí \"AI zdarma\"? | AItaKrajta #69",
        "videoId": null,
        "csTitle": "AI agenti utrženi ze řetězu. A kdo platí \"AI zdarma\"?",
        "enTitle": "Agents off the leash - and who pays for “free AI”?",
        "enDescription": "Cloud agents, hidden incentives, credential protection, sandbox escapes, and the economics of autonomous assistants."
    },
    {
        "number": 68,
        "sourceTitle": "Jev není AGI: Největší inovace možná není nový model | AItaKrajta #68 (plný díl)",
        "videoId": null,
        "csTitle": "Jev není AGI: Největší inovace možná není nový model",
        "enTitle": "Jev is not AGI: the next breakthrough may be the harness",
        "enDescription": "Specialised classifiers, confidence scores, model routing, and how coding harnesses connect models with real work."
    },
    {
        "number": 67,
        "sourceTitle": "AI ta Krajta #67 | 10 000 agentů řeší matematiku? Astra, DeepSeek a coding agents",
        "videoId": null,
        "csTitle": "10 000 agentů řeší matematiku? Astra, DeepSeek a coding agents",
        "enTitle": "Ten thousand agents doing maths? Astra, DeepSeek, and coding workflows",
        "enDescription": "Coding harnesses, model routing, human time, and a discussion of claims about large agent teams solving mathematical problems."
    },
    {
        "number": 66,
        "sourceTitle": "AI ta Krajta #66 | Nový Fable, AI benchmarky, subscription limity a vlastní hardware",
        "videoId": null,
        "csTitle": "Nový Fable, AI benchmarky, subscription limity a vlastní hardware",
        "enTitle": "Fable, benchmarks, subscription limits, and your own hardware",
        "enDescription": "Model performance and the trade-offs between API access, subscriptions, rented infrastructure, and local hardware."
    },
    {
        "number": null,
        "sourceTitle": "Nahradí AI právníky? Legal engineering a AI agenti ve Filevine s Luďkem Maškem",
        "videoId": "N_HTLyR__PE",
        "csTitle": "Nahradí AI právníky? Legal engineering a AI agenti ve Filevine s Luďkem Maškem",
        "enTitle": "Will AI replace lawyers? Legal engineering at Filevine",
        "enDescription": "Luděk Mašek discusses legal engineering, agents drafting documents and preparing depositions, prompt injection, and software supply-chain security."
    },
    {
        "number": null,
        "sourceTitle": "Od AI nápadu k reálným penězům: A jak škálovat byznys | AItaKrajta #71-2",
        "videoId": "V1DKmqhDaHk",
        "csTitle": "Od AI nápadu k reálným penězům: A jak škálovat byznys",
        "enTitle": "From an AI idea to revenue: scaling a business",
        "enDescription": "Marian Kamenišťák discusses validating ideas, sharing profits with operating partners, his technology stack, and building products with business value."
    },
    {
        "number": null,
        "sourceTitle": "Jak získat Google plat v Evropě | AItaKrajta 71-1",
        "videoId": "AxoEyMjnjpE",
        "csTitle": "Jak získat Google plat v Evropě",
        "enTitle": "Beyond coding: product building and a Google-level salary in Europe",
        "enDescription": "Marian Kamenišťák on business problems, overnight idea validation, multi-agent development, and the skills of a product builder."
    }
];

const byTitle = new Map(EPISODE_COPY.map((copy) => [copy.sourceTitle.normalize('NFC').trim(), copy]));
const byVideo = new Map(EPISODE_COPY.filter((copy) => copy.videoId).map((copy) => [copy.videoId!, copy]));
const byNumber = new Map(EPISODE_COPY.filter((copy) => copy.number !== null).map((copy) => [copy.number!, copy]));

/** Remove only the publisher's repeated show label, retaining the actual subject and any part label. */
export function topicFromSourceTitle(title: string): string {
    const parts = title.split('|').map((part) => part.trim());
    if (parts.length > 1 && /^AI\s*ta\s*krajta/i.test(parts[0])) return parts.slice(1).join(' | ');
    if (parts.length > 1 && /AI\s*ta\s*krajta/i.test(parts[parts.length - 1])) return parts.slice(0, -1).join(' | ');
    return title;
}

function videoIdFromUrl(value: string | null): string | undefined {
    if (!value) return undefined;
    try {
        const url = new URL(value);
        return url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') ?? undefined;
    } catch { return undefined; }
}

/** Exact publisher/video identity wins over a number, so split episodes and specials retain their own subjects. */
export function getPavolEpisodeCopy(
    episode: Pick<AiTaKrajtaEpisode, 'id' | 'slug' | 'number' | 'title' | 'shortTitle' | 'summary' | 'videoUrl'>,
    language: SupportedHomepageLanguage,
): PavolPodcastCopy {
    const videoId = videoIdFromUrl(episode.videoUrl);
    const copy = byTitle.get(episode.title.normalize('NFC').trim())
        ?? (videoId ? byVideo.get(videoId) : undefined)
        ?? (episode.number !== null ? byNumber.get(episode.number) : undefined);
    if (language === 'cs') return {
        title: copy?.csTitle ?? topicFromSourceTitle(episode.title),
        description: episode.summary,
        originalTitle: episode.title,
    };
    return {
        title: copy?.enTitle ?? `AI ta Krajta${episode.number === null ? '' : ` #${episode.number}`}`,
        description: copy?.enDescription ?? 'This conversation was recorded in Czech. The publisher provides the original episode description.',
        originalTitle: episode.title,
    };
}

const APPEARANCE_COPY: Readonly<Record<string, Readonly<Record<SupportedHomepageLanguage, { readonly title: string }>>>> = {
    'pavol-podcast:natriai-36': {
        cs: { title: '99 % programování už dnes neplatí' },
        en: { title: '99% of programming no longer applies today' },
    },
    'pavol-podcast:datatalk-18008082': {
        cs: { title: 'Vývojář v době AI a vznik AI ta Krajta' },
        en: { title: 'The developer’s role in the AI era and the origins of AI ta Krajta' },
    },
    'pavol-podcast:zatisi-58197915': {
        cs: { title: 'Umělá inteligence v praxi a její budoucnost' },
        en: { title: 'AI in practice and where it is heading' },
    },
    'pavol-podcast:sitport-8469691': {
        cs: { title: 'Jak vznikal Collboard pro online výuku' },
        en: { title: 'Building Collboard for online teaching' },
    },
    'pavol-podcast:youngschoolers-7619749': {
        cs: { title: 'Od programování her k podnikání a vzdělávání' },
        en: { title: 'From programming games to business and education' },
    },
};

export function getPavolAppearanceCopy(id: string, language: SupportedHomepageLanguage) {
    return APPEARANCE_COPY[id]?.[language];
}
