'use client';

import { useId, useRef, useState, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Copy, Github, Terminal } from 'lucide-react';
import { TERMINAL_TOUR_PATH, TERMINAL_TOUR_STEPS, TERMINAL_TOUR_VIDEO_PATH } from '@/businesses/terminal-tour/terminalTour';
import { useCopyTextToClipboard } from '@/hooks/useCopyTextToClipboard';
import { LeadButton } from './LeadCapture';
import { useSiteLocale } from './LocaleProvider';
import { getInstallationWalkthrough, type InstallMethod, type InstallTarget } from './installationWalkthrough';
import type { ProductRelease } from '@/lib/releases/catalog';
import s from './open-source.module.css';

/** Shared, inspectable installation resources. */
const REPOSITORY = 'https://github.com/webgptorg/promptbook';
const SERVER_GUIDE = `${REPOSITORY}/blob/reborn/2026-10/deploy/README.md`;
const INSTALLER_URL = 'https://www.ptbk.io/install.sh';
const SHELL_COMMAND = `curl -fsSL ${INSTALLER_URL} | bash`;
const AZURE_DEPLOY = `https://portal.azure.com/#create/Microsoft.Template/uri/${encodeURIComponent('https://raw.githubusercontent.com/webgptorg/promptbook/reborn/2026-10/deploy/azure/azuredeploy.json')}`;
const METHODS: readonly InstallMethod[] = ['ai', 'npm', 'shell', 'windows', 'macos', 'server'];

/** Localized instructions share the same executable commands. */
const COPY = {
    cs: {
        back: '← Promptbook', title: 'Instalace Promptbooku', intro: 'Vyberte si způsob instalace.',
        tourTitle: 'Instalace krok za krokem',
        tourDescription: 'Od instalace přes npm po založení projektu a zadání první agendy.',
        tourGuide: 'Otevřít návod se snímky terminálu',
        repository: 'GitHub', methods: 'Způsob instalace',
        aiTitle: 'Instalace přes AI agenta',
        aiText: 'Vložte prompt do Claude Code, Codexu nebo jiného agenta s přístupem k terminálu.',
        aiPermissions: 'Prompt obsahuje výchozí odpovědi na běžné instalační otázky. Povinná potvrzení Vašeho AI nástroje a přihlášení může být potřeba dokončit osobně.',
        aiTarget: 'Kam instalovat', aiLocal: 'Váš počítač', aiServer: 'VPS přes SSH',
        aiPromptTitle: 'Prompt', copyPrompt: 'Kopírovat prompt',
        aiLocalPrompt: `Nainstaluj mi Promptbook na tento počítač podle aktuálního README:
${REPOSITORY}/blob/reborn/2026-10/README.md

Pravidla instalace a předem zodpovězené otázky:
- Provedení: tímto povoluji běžné kroky nutné k instalaci Promptbooku a jeho závislostí, jejich stažení z oficiálních zdrojů, vytvoření složky projektu a potřebnou úpravu uživatelského PATH. Proveď je bez opakovaných dotazů „mohu pokračovat?“. Tento souhlas platí pro instalaci, ne pro pozdější úkoly agentů.
- Systém: sám zjisti operační systém, architekturu, shell, dostupné nástroje a jejich verze. Použij nativní postup pro tento počítač; lokální instalaci nenahrazuj instalací do dočasného cloudu nebo kontejneru.
- Chybějící Node.js nebo npm: existující podporované verze ponech. Jinak bez dotazu doplň kompatibilní LTS podle aktuálního README a požadavků balíčku. Upřednostni uživatelskou instalaci vedle stávající verze, aby dál fungovaly ostatní projekty.
- Git a prohlížeč: použij existující podporovaný Git a Chrome, Chromium nebo Edge; chybějící závislosti doplň z oficiálních zdrojů. Zachovej profily prohlížeče i přihlášení.
- Verze Promptbooku: použij instalační příkaz na konci tohoto promptu. Není-li uveden, vyber doporučenou publikovanou verzi podle README a npm. Pokud uvedená verze není dostupná nebo kompatibilní, můžeš bez dotazu zvolit novější kompatibilní publikované vydání stejné produktové řady; změnu vysvětli ve výsledku. Nevymýšlej verze ani nepřecházej na starou generaci enginu.
- Oprávnění a PATH: při chybě globální instalace npm použij podporovaný uživatelský prefix nebo správce verzí a zajisti dostupnost ptbk v novém terminálu. Systémové kroky proveď jen s dostupným oprávněním; samotný engine spouštěj pod běžným uživatelem.
- Umístění projektu: pokud jsem zadal cestu, použij ji; jinak zvol ~/promptbook/my-agenda. Je-li tam ptbk.json, zachovej projekt bez nové inicializace a bez změny jeho stavu spuštění. Obsazenou složku bez projektu nepřepisuj, vytvoř vedle ní my-agenda-2, případně další volné číslo. Ostatní projekty, nastavení a data zachovej.
- První agenda: použij moje zadání z této konverzace, pokud jsem nějaké poskytl. Jinak připrav zkušební agendu „Ověř, že Promptbook funguje, a potom čekej na moje zadání; neprováděj externí akce.“ Na název a složku se znovu neptej. Běžné volby ptbk init vyřeš doporučenými výchozími hodnotami přes podporované parametry nebo interaktivní terminál; existenci parametrů ověř v nápovědě.
- AI nástroj a model: přednost má moje výslovná volba, potom podporovaný nástroj již přihlášený pod účtem enginu, potom podporovaný nástroj, ve kterém běží tato konverzace. Není-li žádný dostupný, připrav Codex s nativním přihlášením. Zvol doporučený dostupný model a znovu se na tuto volbu neptej. Zachovej existující přihlášení; nové dokončím v nativním přihlašovacím okně. Hesla, tokeny ani API klíče nechtěj v chatu a placené API nezapínej místo přihlášení k předplatnému.
- Běžné chyby: sám oprav chybějící závislost, neaktuální PATH, oprávnění uživatelské instalace nebo obsazený lokální port. Použij volný lokální port, zachovej soukromý přístup a funkční služby. Neinstaluj Docker, pokud jej aktuální oficiální postup nevyžaduje. Při nepodporovaném systému nebo skutečné překážce popiš konkrétní důvod a nejmenší nutný zásah.
- Kdy mě potřebuješ: pouze kvůli povinnému potvrzení nástroje či systému, přihlášení nebo rozhodnutí, které nelze odvodit a nemá výše výchozí odpověď. Respektuj sandbox a povinná schválení; jejich vypnutí není součástí tohoto pokynu. Případné nezbytné otázky spoj do jedné zprávy. Mazání dat, nákupy a změny nesouvisejících projektů nejsou povolené.
- Dokončení: ověř skutečnou verzi a cestu ptbk, stav enginu, přístup k dashboardu a dostupnost zvoleného AI nástroje. Nový zkušební projekt spusť, stávající pozastavený projekt ponech pozastavený. Otevři terminálový dashboard a uveď projekt, použité verze, způsob opětovného otevření a případné zbývající ruční kroky. Instalaci označ za dokončenou až podle ověřeného výsledku.`,
        aiServerPrompt: `Z tohoto počítače mi nainstaluj Promptbook na existující VPS podle aktuálního návodu:
${SERVER_GUIDE}

Pravidla instalace a předem zodpovězené otázky:
- Provedení: tímto povoluji běžnou přípravu existujícího VPS, instalaci Promptbooku a potřebných závislostí z oficiálních zdrojů, vytvoření účtu promptbook a složky projektu podle návodu. Tyto kroky proveď bez opakovaného konverzačního potvrzování. Souhlas platí pro instalaci, ne pro pozdější úkoly agentů; nový server nekupuj.
- SSH: použij adresu, uživatele a port z mého zadání nebo jednoznačně určené místní SSH konfigurace. Port bez jiné konfigurace je 22. Pokud cíl chybí nebo je nejednoznačný, zeptej se jednou společně na potřebné údaje; server nehádej. Použij moje místní SSH připojení a ověř identitu serveru; nevypínej kontrolu hostitelského klíče. Soukromý klíč ani heslo nechtěj v chatu.
- Podpora systému: ověř Ubuntu 24.04 x86-64 se systemd a dostupným root nebo sudo. Při jiném systému nepouštěj nepodporovaný instalátor; zjisti oficiálně podporovanou cestu, případně popiš konkrétní překážku.
- Chybějící závislosti: prohlédni sdílený instalátor a použij ho k doplnění kompatibilního Node.js, npm, Gitu, Chromu a publikovaného ptbk. Nemusíš se ptát, zda tyto nutné závislosti doplnit. Zachovej podporované existující verze a potřeby ostatních projektů; systémové změny omez na oficiální instalační postup.
- Verze Promptbooku: použij příkaz na konci tohoto promptu. Není-li uveden, vyber doporučenou publikovanou verzi podle návodu a npm. Není-li uvedená verze dostupná nebo kompatibilní, můžeš bez dotazu použít novější kompatibilní publikované vydání stejné produktové řady; změnu vysvětli ve výsledku. Nevymýšlej verze ani nepřecházej na starou generaci enginu.
- Účty a oprávnění: root nebo sudo použij jen k přípravě systému. Engine, projekt, prohlížeč i AI přihlášení patří pod stejný běžný účet promptbook. Běžné chyby PATH a oprávnění vyřeš sám v rámci tohoto účtu.
- Projekt: použij mnou zadanou cestu, jinak ~/projects/my-agenda pod účtem promptbook. Existující ptbk.json zachovej bez reinicializace a změny stavu spuštění. Obsazenou složku bez projektu nepřepisuj, zvol my-agenda-2 nebo další volné číslo. Zachovej ostatní projekty, data a přihlášení.
- První agenda: použij moje zadání, jinak zkušební agendu „Ověř, že Promptbook funguje, a potom čekej na moje zadání; neprováděj externí akce.“ Na název a složku se znovu neptej. Doporučené výchozí hodnoty ptbk init vyber přes parametry ověřené v nápovědě nebo interaktivní SSH terminál s headless prohlížečem.
- AI nástroj a model: přednost má moje volba, potom podporovaný nástroj již přihlášený na VPS pod účtem promptbook, jinak nástroj z této konverzace, pokud ho VPS podporuje, a nakonec Codex. Zvol doporučený dostupný model. Pro Codex použij codex login --device-auth; odkaz a kód dokončím na počítači nebo telefonu. Pro Claude Code použij claude auth login a nativní odkaz, případný návratový kód zadám přímo do terminálu. Zachovej existující přihlášení, nechtěj tajné údaje v chatu a nevynucuj placené API místo přihlášení k předplatnému.
- Síť a služby: zachovej soukromý dashboard i existující služby. Obsazený port řeš jiným volným lokálním portem. Pro vzdálený přístup použij SSH tunel podle návodu, bez veřejného vystavení dashboardu nebo vypínání firewallu. Registraci startu po restartu proveď podle sdíleného návodu; kvůli testu server nerestartuj.
- Kdy mě potřebuješ: jen pro chybějící jednoznačný SSH cíl, přihlášení, povinné potvrzení systému či nástroje nebo jinou skutečnou překážku bez výchozí odpovědi. Respektuj sandbox a povinná schválení; jejich vypnutí není součástí tohoto pokynu. Nezbytné otázky spoj do jedné zprávy. Mazání dat, nákupy a změny nesouvisejících služeb nejsou povolené.
- Dokončení: ověř verzi a cestu ptbk, běžící engine, přístup k dashboardu přes SSH a registraci startu po restartu. Nový zkušební projekt spusť, stávající pozastavený projekt ponech pozastavený. Předej terminálový dashboard a uveď projekt, verze, způsob opětovného připojení a zbývající ruční kroky. Registrace služby sama neprokazuje otestovaný restart; neověřené výsledky jasně označ.`,
        npmTitle: 'Máte Node.js a npm',
        npmText: 'macOS, Linux nebo Windows. Node.js 22.13+ v řadě 22 nebo 24+, npm 10+ a Git.',
        shellTitle: 'Čisté VPS bez Node.js',
        shellText: 'Ubuntu 24.04 x64, root nebo sudo. Vložte příkaz do SSH terminálu. Skript doplní Node.js, npm, Git, Chrome a Promptbook a otevře ptbk init.',
        shellSource: 'Zdroj instalačního skriptu',
        shellLogin: 'Přihlášení AI na VPS',
        shellLoginText: 'Odkaz otevřete na svém počítači nebo telefonu. Přihlašujte se pod účtem promptbook, pod kterým běží engine.',
        codexLogin: 'Codex: přihlášení jednorázovým kódem',
        claudeLogin: 'Claude Code: odkaz a případný návratový kód',
        windowsTitle: 'Windows instalátor',
        windowsText: 'Stáhněte EXE z GitHub Releases. Doplní potřebné závislosti a otevře nastavení projektu.',
        download: 'Vybrat Windows EXE',
        macosTitle: 'Aplikace pro macOS',
        macosText: 'Stáhněte DMG pro svůj Mac, otevřete ho a přetáhněte Promptbook do složky Aplikace.',
        macosArm64: 'Stáhnout pro Apple Silicon', macosX64: 'Stáhnout pro Intel',
        macosReleases: 'Vybrat macOS DMG na GitHubu',
        macosUnsigned: 'Tato zkušební aplikace není podepsaná. macOS může při prvním otevření vyžadovat povolení v Nastavení systému → Soukromí a zabezpečení.',
        serverTab: 'VPS / cloud', serverTitle: 'Nový server',
        serverText: 'Vyberte poskytovatele. Po vytvoření serveru se připojte přes SSH a dokončete nastavení.',
        digitalOceanHint: 'Vložit startovací skript', awsHint: 'Nahrát CloudFormation šablonu', azureHint: 'Otevřít formulář nasazení',
        serverCost: 'Server platíte poskytovateli.', serverGuide: 'Návod pro VPS',
        terminal: 'Terminál', copy: 'Kopírovat příkaz', copied: 'Zkopírováno',
        copyFailed: 'Kopírování se nezdařilo. Text můžete označit a zkopírovat ručně.',
        docs: 'Dokumentace', help: 'Pomoc s instalací', helpTopic: 'Pomoc s vlastní instalací enginu — open-source stránka',
    },
    en: {
        back: '← Promptbook', title: 'Install Promptbook', intro: 'Choose an installation method.',
        tourTitle: 'Installation step by step',
        tourDescription: 'Czech recording · Install with npm, create a project and describe its first job.',
        tourGuide: 'Open the illustrated guide (in Czech)',
        repository: 'GitHub', methods: 'Installation method',
        aiTitle: 'Install with your AI agent',
        aiText: 'Paste the prompt into Claude Code, Codex or another agent with terminal access.',
        aiPermissions: 'The prompt includes defaults for routine installation questions. Mandatory approvals in your AI tool and sign-in may still need your input.',
        aiTarget: 'Install on', aiLocal: 'Your computer', aiServer: 'VPS over SSH',
        aiPromptTitle: 'Prompt', copyPrompt: 'Copy prompt',
        aiLocalPrompt: `Install Promptbook on this computer using the current README:
${REPOSITORY}/blob/reborn/2026-10/README.md

Installation rules and questions answered in advance:
- Authorization: I authorize the routine steps needed to install Promptbook and its dependencies, downloads from official sources, project directory creation and necessary user PATH changes. Carry these out without repeatedly asking whether to continue. This authorization covers installation, not the agents' subsequent work.
- System: detect the operating system, architecture, shell, available tools and versions yourself. Use the native installation path for this computer; do not substitute a temporary cloud environment or container for the local installation.
- Missing Node.js or npm: retain supported existing versions. Otherwise install a compatible LTS version according to the current README and package requirements without asking. Prefer a user-scoped installation alongside the existing version so other projects keep working.
- Git and browser: reuse supported Git and Chrome, Chromium or Edge; install missing dependencies from official sources. Preserve browser profiles and sign-ins.
- Promptbook version: use the installation command at the end of this prompt. If absent, select the recommended published version using the README and npm. If the specified version is unavailable or incompatible, you may choose a newer compatible published release in the same product line without asking; explain the substitution in the result. Do not invent versions or switch to an old engine generation.
- Permissions and PATH: if global npm installation fails, use a supported user-scoped prefix or version manager and make ptbk available in a new terminal. Perform system steps only with available privileges; run the engine as an ordinary user.
- Project location: use my specified path, otherwise ~/promptbook/my-agenda. If it contains ptbk.json, preserve the project without reinitializing it or changing its running state. Do not overwrite an occupied directory without a project; use my-agenda-2 or the next available number beside it. Preserve other projects, settings and data.
- First agenda: use an agenda I supplied in this conversation. Otherwise prepare this trial agenda: "Verify that Promptbook works, then wait for my instructions; perform no external actions." Do not ask again about the name or folder. Resolve routine ptbk init choices with recommended defaults through supported arguments or an interactive terminal; verify arguments in the help output.
- AI tool and model: prefer my explicit choice, then a supported tool already authenticated under the engine account, then the tool running this conversation if supported. Otherwise prepare Codex with native sign-in. Choose the recommended available model without asking again. Preserve existing authentication; let me complete new sign-in in its native window. Never request passwords, tokens or API keys in chat, and do not enable paid API billing instead of subscription sign-in.
- Routine errors: resolve missing dependencies, stale PATH, user installation permissions or a busy local port yourself. Use a free local port, preserve private access and functioning services. Install Docker only if the current official procedure requires it. For an unsupported system or a real blocker, explain the specific reason and smallest required intervention.
- When to involve me: only for mandatory tool or system approval, sign-in, or a decision that cannot be inferred and has no default above. Respect the sandbox and mandatory approvals; disabling them is outside this instruction. Group unavoidable questions in one message. Data deletion, purchases and changes to unrelated projects are not authorized.
- Completion: verify the actual ptbk version and executable path, engine state, dashboard access and selected AI tool availability. Start a new trial project; keep an existing paused project paused. Open the terminal dashboard and report the project, installed versions, how to reopen it and any remaining manual steps. Claim completion only after verifying the result.`,
        aiServerPrompt: `From this computer, install Promptbook on an existing VPS using the current guide:
${SERVER_GUIDE}

Installation rules and questions answered in advance:
- Authorization: I authorize routine preparation of the existing VPS, installation of Promptbook and required dependencies from official sources, and creation of the promptbook account and project directory according to the guide. Carry these out without repeated conversational confirmation. Authorization covers installation, not subsequent agent work; do not purchase a server.
- SSH: use the host, user and port from my instructions or unambiguous local SSH configuration. The default port is 22 unless configured otherwise. If the destination is missing or ambiguous, ask once for the required details together; do not guess the server. Use my local SSH connection and verify server identity; do not disable host-key checking. Never request a private key or password in chat.
- System support: verify Ubuntu 24.04 x86-64 with systemd and root or sudo access. On another system, do not run an unsupported installer; find an officially supported path or explain the specific blocker.
- Missing dependencies: inspect and use the shared installer to add compatible Node.js, npm, Git, Chrome and the published ptbk package. Do not ask whether to install these required dependencies. Preserve supported existing versions and other projects' requirements; limit system changes to the official installation procedure.
- Promptbook version: use the command at the end of this prompt. If absent, select the recommended published version using the guide and npm. If the specified version is unavailable or incompatible, you may use a newer compatible published release in the same product line without asking; explain the substitution in the result. Do not invent versions or switch to an old engine generation.
- Accounts and permissions: use root or sudo only for system preparation. Run the engine, project, browser and AI authentication under the same ordinary promptbook account. Resolve routine PATH and permission issues within this account yourself.
- Project: use my specified path, otherwise ~/projects/my-agenda under the promptbook account. Preserve an existing ptbk.json without reinitialization or running-state changes. Do not overwrite an occupied directory without a project; use my-agenda-2 or the next available number. Preserve other projects, data and sign-ins.
- First agenda: use my supplied agenda, otherwise: "Verify that Promptbook works, then wait for my instructions; perform no external actions." Do not ask again about the name or folder. Choose recommended ptbk init defaults through arguments verified in help or an interactive SSH terminal with a headless browser.
- AI tool and model: prefer my choice, then a supported tool already authenticated on the VPS as promptbook, then the tool running this conversation if supported on the VPS, and finally Codex. Choose the recommended available model. For Codex, use codex login --device-auth; I will complete the link and code on my computer or phone. For Claude Code, use claude auth login and the native URL; I will enter any return code directly in the terminal. Preserve existing sign-ins, never request secrets in chat and do not force paid API billing instead of subscription authentication.
- Network and services: preserve the private dashboard and existing services. Resolve a busy port with another free local port. Use an SSH tunnel according to the guide for remote access, without publicly exposing the dashboard or disabling the firewall. Register boot-start according to the shared guide; do not reboot the server to test it.
- When to involve me: only for a missing unambiguous SSH destination, sign-in, mandatory system or tool approval, or another real blocker without a default above. Respect the sandbox and mandatory approvals; disabling them is outside this instruction. Group unavoidable questions in one message. Data deletion, purchases and changes to unrelated services are not authorized.
- Completion: verify the ptbk version and executable path, running engine, dashboard access over SSH and boot-start registration. Start a new trial project; keep an existing paused project paused. Hand over the terminal dashboard and report the project, versions, how to reconnect and remaining manual steps. Service registration alone does not prove a tested reboot; clearly label unverified results.`,
        npmTitle: 'Node.js and npm already installed',
        npmText: 'macOS, Linux or Windows. Node.js 22.13+ in the 22.x line or 24+, npm 10+ and Git.',
        shellTitle: 'Fresh VPS without Node.js',
        shellText: 'Ubuntu 24.04 x64, root or sudo. Paste into your SSH terminal. The script installs Node.js, npm, Git, Chrome and Promptbook, then opens ptbk init.',
        shellSource: 'Installer source',
        shellLogin: 'AI sign-in on a VPS',
        shellLoginText: 'Open the link on your computer or phone. Sign in as promptbook, the same account that runs the engine.',
        codexLogin: 'Codex: sign in with a one-time code',
        claudeLogin: 'Claude Code: login link and optional return code',
        windowsTitle: 'Windows installer',
        windowsText: 'Download the EXE from GitHub Releases. It adds the required dependencies and opens project setup.',
        download: 'Choose a Windows EXE',
        macosTitle: 'macOS application',
        macosText: 'Download the DMG for your Mac, open it and drag Promptbook into Applications.',
        macosArm64: 'Download for Apple Silicon', macosX64: 'Download for Intel',
        macosReleases: 'Choose a macOS DMG on GitHub',
        macosUnsigned: 'This preview application is unsigned. On first launch, macOS may require approval in System Settings → Privacy & Security.',
        serverTab: 'VPS / cloud', serverTitle: 'New server',
        serverText: 'Choose a provider. After creating the server, connect over SSH and finish setup.',
        digitalOceanHint: 'Paste the startup script', awsHint: 'Upload the CloudFormation template', azureHint: 'Open the deployment form',
        serverCost: 'You pay the provider for the server.', serverGuide: 'VPS guide',
        terminal: 'Terminal', copy: 'Copy command', copied: 'Copied',
        copyFailed: 'Copying failed. Select the text and copy it manually.',
        docs: 'Documentation', help: 'Installation help', helpTopic: 'Help with self-hosted engine installation — open-source page',
    },
} as const;

/** Selectable source with copy feedback tied to the displayed text. */
function CommandBlock({ commands, title, labels, prompt = false }: { commands: string; title: string; labels: typeof COPY.cs | typeof COPY.en; prompt?: boolean }) {
    const { copyStatus, copyText } = useCopyTextToClipboard();
    return <div className={`${s.terminal}${prompt ? ` ${s.prompt}` : ''}`}>
        <div className={s.terminalHeader}>
            <span><Terminal size={15} aria-hidden="true" />{title}</span>
            <button type="button" onClick={() => void copyText(commands)} aria-label={prompt ? labels.copyPrompt : labels.copy}>
                {copyStatus === 'copied' ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
                {copyStatus === 'copied' ? labels.copied : prompt ? labels.copyPrompt : labels.copy}
            </button>
        </div>
        {prompt ? <div className={s.promptText} tabIndex={0}>{commands}</div> : <pre tabIndex={0}><code>{commands}</code></pre>}
        <span className={s.copyStatus} role="status">{copyStatus === 'failed' ? labels.copyFailed : copyStatus === 'copied' ? labels.copied : ''}</span>
    </div>;
}

/** Shared Czech/English installation page. */
export function OpenSourcePage({ stable, preview }: { stable?: ProductRelease; preview?: ProductRelease } = {}) {
    const { locale, path } = useSiteLocale();
    const copy = COPY[locale];
    const [usePreview, setUsePreview] = useState(false);
    const release = usePreview ? preview : stable ?? preview;
    const npmCommand = `npm install --global ptbk${release ? `@${release.version}` : ''}`;
    const shellCommand = release ? `${SHELL_COMMAND} -s -- --version ${release.version}` : SHELL_COMMAND;
    const windows = release?.downloads?.windows;
    const macos = release?.downloads?.macos;
    const [method, setMethod] = useState<InstallMethod>('ai');
    const [target, setTarget] = useState<InstallTarget>('local');
    const walkthrough = getInstallationWalkthrough(locale, method, target);
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const id = useId();

    /** WAI-ARIA tabs: arrow keys wrap, Home/End reach the first/last method. */
    function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
        let next: number;
        if (event.key === 'ArrowRight') next = (index + 1) % METHODS.length;
        else if (event.key === 'ArrowLeft') next = (index + METHODS.length - 1) % METHODS.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = METHODS.length - 1;
        else return;
        event.preventDefault();
        setMethod(METHODS[next]);
        tabRefs.current[next]?.focus();
    }

    return <div className={s.page}>
        <header className={s.hero}>
            <Link className={s.back} href={path()}>{copy.back}</Link>
            <h1>{copy.title}</h1>
            <p>{copy.intro}</p>
            {release && <p>
                <strong>{release.prerelease
                    ? (locale === 'cs' ? 'Verze k vyzkoušení' : 'Preview release')
                    : (locale === 'cs' ? 'Doporučená stabilní verze' : 'Recommended stable release')} {release.version}</strong>
                {' · '}<Link href={path('releases')}>{locale === 'cs' ? 'Vydání a podpora' : 'Releases and support'}</Link>
            </p>}
            {stable && preview && <label>
                <input type="checkbox" checked={usePreview} onChange={event => setUsePreview(event.target.checked)} />
                {' '}{locale === 'cs' ? 'Vyzkoušet verzi' : 'Try preview'} {preview.version}
            </label>}
        </header>
        <section className={s.installer} aria-label={copy.methods}>
            <div className={s.tabs} role="tablist" aria-label={copy.methods}>
                {METHODS.map((item, index) => <button key={item} ref={element => { tabRefs.current[index] = element; }}
                    id={`${id}-${item}`} type="button" role="tab" aria-selected={method === item}
                    aria-controls={`${id}-panel-${item}`} tabIndex={method === item ? 0 : -1}
                    onClick={() => setMethod(item)} onKeyDown={event => moveTab(event, index)}>
                    {item === 'ai' ? 'Claude Code / Codex / AI' : item === 'npm' ? 'npm' : item === 'shell' ? 'Shell' : item === 'server' ? copy.serverTab : item === 'macos' ? 'macOS DMG' : 'Windows EXE'}
                </button>)}
            </div>
            {METHODS.map(item => <div key={item} hidden={method !== item} id={`${id}-panel-${item}`} role="tabpanel" aria-labelledby={`${id}-${item}`} tabIndex={0} className={s.panel}>
                <div className={s.methodIntro}>
                    <h2>{item === 'ai' ? copy.aiTitle : item === 'npm' ? copy.npmTitle : item === 'shell' ? copy.shellTitle : item === 'server' ? copy.serverTitle : item === 'macos' ? copy.macosTitle : copy.windowsTitle}</h2>
                    <p>{item === 'ai' ? copy.aiText : item === 'npm' ? copy.npmText : item === 'shell' ? copy.shellText : item === 'server' ? copy.serverText : item === 'macos' ? copy.macosText : copy.windowsText}</p>
                    {item === 'ai' && <p>{copy.aiPermissions}</p>}
                </div>
                {item === 'ai' ? <>
                    <fieldset className={s.targetChoice}>
                        <legend>{copy.aiTarget}</legend>
                        {(['local', 'server'] as const).map(value => <label key={value}>
                            <input type="radio" name={`${id}-target`} value={value} checked={target === value} onChange={() => setTarget(value)} />
                            <span>{value === 'local' ? copy.aiLocal : copy.aiServer}</span>
                        </label>)}
                    </fieldset>
                    <CommandBlock key={target} title={copy.aiPromptTitle} labels={copy} prompt commands={[
                        target === 'local' ? copy.aiLocalPrompt : copy.aiServerPrompt,
                        release && (locale === 'cs' ? 'Instalační příkaz pro zvolenou verzi (případnou náhradu řeš podle pravidel výše):' : 'Installation command for the selected version (handle any substitution according to the rules above):'),
                        release && (target === 'local' ? npmCommand : shellCommand),
                    ].filter(Boolean).join('\n\n')} />
                </> : item === 'shell' ? <>
                    <CommandBlock title="Bash / SSH" labels={copy} commands={shellCommand} />
                    <a className={s.textLink} href="https://github.com/webgptorg/ptbk-landing-page-aldaron/blob/main/public/install.sh">{copy.shellSource}<ArrowRight size={14} aria-hidden="true" /></a>
                    <details className={s.login}>
                        <summary>{copy.shellLogin}</summary>
                        <p>{copy.shellLoginText}</p>
                        <a href="https://developers.openai.com/codex/auth/#login-on-headless-devices">{copy.codexLogin}</a>
                        <CommandBlock title="Codex" labels={copy} commands="codex login --device-auth" />
                        <a href="https://code.claude.com/docs/en/authentication">{copy.claudeLogin}</a>
                        <CommandBlock title="Claude Code" labels={copy} commands="claude auth login" />
                    </details>
                </> : item === 'npm' ? <CommandBlock title={copy.terminal} labels={copy} commands={`${npmCommand}\nptbk init`} />
                    : item === 'windows' ? <div className={s.download}>
                        <a href={windows?.url ?? `${REPOSITORY}/releases`} className={s.primaryLink}>{copy.download}{windows && ` · ${release?.version}`}<ArrowRight size={17} aria-hidden="true" /></a>
                        {windows && <a href={windows.checksumUrl}>SHA-256</a>}
                        {!windows && <code>Promptbook-Setup-&lt;version&gt;-windows-x64.exe</code>}
                    </div> : item === 'macos' ? <>
                        {(['arm64', 'x64'] as const).map(arch => {
                            const download = macos?.[arch];
                            return download && <div key={arch} className={s.download}>
                                <a href={download.url} className={s.primaryLink}>{arch === 'arm64' ? copy.macosArm64 : copy.macosX64} · {release?.version}<ArrowRight size={17} aria-hidden="true" /></a>
                                <a href={download.checksumUrl} aria-label={`SHA-256 · ${arch === 'arm64' ? 'Apple Silicon' : 'Intel'}`}>SHA-256</a>
                            </div>;
                        })}
                        {!macos?.arm64 && !macos?.x64 && <a href={release?.githubUrl ?? `${REPOSITORY}/releases`} className={s.primaryLink}>{copy.macosReleases}<ArrowRight size={17} aria-hidden="true" /></a>}
                        {(macos?.arm64?.unsigned || macos?.x64?.unsigned) && <p className={s.note}>{copy.macosUnsigned}</p>}
                    </> : <>
                        <div className={s.providers}>
                            <a href={`${SERVER_GUIDE}#digitalocean`}><strong>DigitalOcean</strong><span>{copy.digitalOceanHint}</span><ArrowRight size={17} aria-hidden="true" /></a>
                            <a href={AZURE_DEPLOY}><strong>Azure</strong><span>{copy.azureHint}</span><ArrowRight size={17} aria-hidden="true" /></a>
                            <a href={`${SERVER_GUIDE}#aws`}><strong>AWS</strong><span>{copy.awsHint}</span><ArrowRight size={17} aria-hidden="true" /></a>
                        </div>
                        <p className={s.note}>{copy.serverCost} <a href={SERVER_GUIDE}>{copy.serverGuide}</a></p>
                        {release && <CommandBlock title="Bash / SSH" labels={copy} commands={shellCommand} />}
                    </>}
            </div>)}
        </section>
        <section className={`${s.tour}${method === 'npm' ? ` ${s.tourWithVideo}` : ''}`} aria-labelledby={`${id}-tour-title`}>
            <div className={s.tourCopy}>
                <h2 id={`${id}-tour-title`}>{copy.tourTitle} · {walkthrough.name}</h2>
                <ol className={s.tourSteps} role="list">
                    {walkthrough.steps.map(step => <li key={step.title}>
                        <h3>{step.title}</h3><p>{step.text}</p>
                    </li>)}
                </ol>
                {method === 'npm' && <>
                    <p id={`${id}-tour-description`}>{copy.tourDescription}</p>
                    <Link className={s.textLink} href={TERMINAL_TOUR_PATH} hrefLang="cs">
                        {copy.tourGuide}<ArrowRight size={14} aria-hidden="true" />
                    </Link>
                </>}
                {method === 'macos' && <a className={s.textLink} href={`${REPOSITORY}/blob/reborn/2026-10/apps/desktop/README.md#macos-installation`}>
                    {locale === 'cs' ? 'Podrobný návod pro macOS' : 'Detailed macOS guide'}<ArrowRight size={14} aria-hidden="true" />
                </a>}
            </div>
            {method === 'npm' && <video className={s.tourVideo} aria-labelledby={`${id}-tour-title`} aria-describedby={`${id}-tour-description`}
                controls playsInline preload="none" poster={TERMINAL_TOUR_STEPS[1].imagePath}>
                <source src={TERMINAL_TOUR_VIDEO_PATH} type="video/mp4" />
            </video>}
        </section>
        <footer className={s.resources}>
            <a href={REPOSITORY}><Github size={16} aria-hidden="true" />{copy.repository}</a>
            <a href={`${REPOSITORY}/blob/reborn/2026-10/README.md`}>{copy.docs}</a>
            <a href={`${REPOSITORY}/blob/reborn/2026-10/LICENSE.md`}>BUSL-1.1</a>
            <LeadButton secondary className={s.helpLink} topic={copy.helpTopic}>{copy.help}</LeadButton>
        </footer>
    </div>;
}
