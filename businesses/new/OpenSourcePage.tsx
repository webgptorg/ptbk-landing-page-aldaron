'use client';

import { useId, useRef, useState, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Copy, Github, Terminal } from 'lucide-react';
import { TERMINAL_TOUR_PATH, TERMINAL_TOUR_STEPS, TERMINAL_TOUR_VIDEO_PATH } from '@/businesses/terminal-tour/terminalTour';
import { useCopyTextToClipboard } from '@/hooks/useCopyTextToClipboard';
import { LeadButton } from './LeadCapture';
import { useSiteLocale } from './LocaleProvider';
import type { ProductRelease } from '@/lib/releases/catalog';
import s from './open-source.module.css';

/** Direct installation choices; AI-assisted setup stays first. */
type InstallMethod = 'ai' | 'npm' | 'shell' | 'windows' | 'macos' | 'server';
/** Destination for the user's local coding agent. */
type InstallTarget = 'local' | 'server';

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
        tourTitle: 'Instalace krok za krokem ve videu',
        tourDescription: 'Od instalace přes npm po založení projektu a zadání první agendy.',
        tourGuide: 'Otevřít návod se snímky terminálu',
        repository: 'GitHub', methods: 'Způsob instalace',
        aiTitle: 'Instalace přes AI agenta',
        aiText: 'Vložte prompt do Claude Code, Codexu nebo jiného agenta s přístupem k terminálu.',
        aiTarget: 'Kam instalovat', aiLocal: 'Váš počítač', aiServer: 'VPS přes SSH',
        aiPromptTitle: 'Prompt', copyPrompt: 'Kopírovat prompt',
        aiLocalPrompt: `Nainstaluj mi Promptbook na tento počítač podle aktuálního README:
${REPOSITORY}/blob/reborn/2026-10/README.md

Zjisti operační systém, doplň chybějící Node.js, npm, Git a podporovaný prohlížeč a nainstaluj publikovaný balíček ptbk. Zachovej existující projekty, nastavení a přihlášení.

Proveď mě ptbk init: zeptej se na agendu a umístění projektu, připrav vybraný AI nástroj přes nativní přihlášení a otevři terminálový dashboard. Přihlašovací kroky nech dokončit mě; hesla ani tokeny nechtěj v chatu. Ověř, že engine běží, a pojmenuj případné zbývající kroky.`,
        aiServerPrompt: `Z tohoto počítače mi nainstaluj Promptbook na existující VPS podle aktuálního návodu:
${SERVER_GUIDE}

Zeptej se na SSH host, uživatele a případný port. Použij moje místní SSH připojení; soukromý klíč ani heslo nechtěj v chatu. Nový server nekupuj.

Ověř Ubuntu 24.04 x86-64 se systemd. Prohlédni sdílený instalátor a použij ho k doplnění Node.js, npm, Gitu, Chromu a publikovaného ptbk. Engine i AI přihlášení patří pod stejný běžný účet promptbook; root použij jen pro přípravu systému. Zachovej existující data a soukromé porty.

Zeptej se na první agendu a spusť ptbk init v interaktivním SSH terminálu s headless prohlížečem. Pro Codex použij codex login --device-auth; odkaz a kód dokončím na svém počítači nebo telefonu. Pro Claude Code použij nativní přihlašovací odkaz a případný kód vložený do terminálu. Případné překážky řeš podle oficiální dokumentace, bez vynucení API klíče.

Ověř běžící engine i registraci spuštění po restartu a předej mi terminálový dashboard přes SSH. Jasně pojmenuj neověřené a zbývající ruční kroky.`,
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
        tourTitle: 'Terminal walkthrough',
        tourDescription: 'Czech recording · Install with npm, create a project and describe its first job.',
        tourGuide: 'Open the illustrated guide (in Czech)',
        repository: 'GitHub', methods: 'Installation method',
        aiTitle: 'Install with your AI agent',
        aiText: 'Paste the prompt into Claude Code, Codex or another agent with terminal access.',
        aiTarget: 'Install on', aiLocal: 'Your computer', aiServer: 'VPS over SSH',
        aiPromptTitle: 'Prompt', copyPrompt: 'Copy prompt',
        aiLocalPrompt: `Install Promptbook on this computer using the current README:
${REPOSITORY}/blob/reborn/2026-10/README.md

Detect the operating system, add missing Node.js, npm, Git and a supported browser, and install the published ptbk package. Preserve existing projects, settings and sign-ins.

Guide me through ptbk init: ask about my ongoing responsibility and project location, prepare my selected AI tool with native authentication and open the terminal dashboard. Let me complete sign-in steps; never ask for passwords or tokens in chat. Verify that the engine is running and identify any remaining steps.`,
        aiServerPrompt: `From this computer, install Promptbook on an existing VPS using the current guide:
${SERVER_GUIDE}

Ask for the SSH host, user and any custom port. Use my local SSH connection; never ask for a private key or password in chat. Do not purchase a server.

Verify Ubuntu 24.04 x86-64 with systemd. Inspect the shared installer and use it to add Node.js, npm, Git, Chrome and the published ptbk package. Run the engine and AI sign-in under the same ordinary promptbook account; use root only for system preparation. Preserve existing data and private ports.

Ask about my first ongoing responsibility and run ptbk init in an interactive SSH terminal with a headless browser. For Codex, use codex login --device-auth; I will complete the link and code on my computer or phone. For Claude Code, use its native login URL and any code pasted back into the terminal. Resolve blockers using official documentation without forcing API-key billing.

Verify the running engine and boot-start registration, then hand over the terminal dashboard over SSH. Clearly identify unverified results and any remaining manual steps.`,
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
                        release && (locale === 'cs' ? 'Použij přesně tento instalační příkaz' : 'Use this exact installation command'),
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
        <section className={s.tour} aria-labelledby={`${id}-tour-title`}>
            <div className={s.tourCopy}>
                <h2 id={`${id}-tour-title`}>{copy.tourTitle}</h2>
                <p id={`${id}-tour-description`}>{copy.tourDescription}</p>
                <Link className={s.textLink} href={TERMINAL_TOUR_PATH} hrefLang="cs">
                    {copy.tourGuide}<ArrowRight size={14} aria-hidden="true" />
                </Link>
            </div>
            <video className={s.tourVideo} aria-labelledby={`${id}-tour-title`} aria-describedby={`${id}-tour-description`}
                controls playsInline preload="none" poster={TERMINAL_TOUR_STEPS[1].imagePath}>
                <source src={TERMINAL_TOUR_VIDEO_PATH} type="video/mp4" />
            </video>
        </section>
        <footer className={s.resources}>
            <a href={REPOSITORY}><Github size={16} aria-hidden="true" />{copy.repository}</a>
            <a href={`${REPOSITORY}/blob/reborn/2026-10/README.md`}>{copy.docs}</a>
            <a href={`${REPOSITORY}/blob/reborn/2026-10/LICENSE.md`}>BUSL-1.1</a>
            <LeadButton secondary className={s.helpLink} topic={copy.helpTopic}>{copy.help}</LeadButton>
        </footer>
    </div>;
}
