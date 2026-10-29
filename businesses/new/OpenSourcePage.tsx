'use client';

import { useId, useRef, useState, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Copy, Download, FolderOpen, GitBranch, Github, Server, Terminal } from 'lucide-react';
import { useCopyTextToClipboard } from '@/hooks/useCopyTextToClipboard';
import { LeadButton } from './LeadCapture';
import { useSiteLocale } from './LocaleProvider';
import s from './open-source.module.css';

/** Installation methods supported by the published engine and release workflow. */
type InstallMethod = 'npm' | 'shell' | 'windows' | 'server';

/** Stable repository destinations, including prereleases that /releases/latest would omit. */
const REPOSITORY = 'https://github.com/webgptorg/promptbook';
const RELEASES = `${REPOSITORY}/releases`;
const SERVER_GUIDE = `${REPOSITORY}/blob/reborn/2026-10/deploy/README.md`;
const AZURE_DEPLOY = `https://portal.azure.com/#create/Microsoft.Template/uri/${encodeURIComponent('https://raw.githubusercontent.com/webgptorg/promptbook/reborn/2026-10/deploy/azure/azuredeploy.json')}`;
const METHODS: readonly InstallMethod[] = ['npm', 'shell', 'windows', 'server'];

/** Authored translations keep technical commands identical in both languages. */
const COPY = {
    cs: {
        back: '← Promptbook', eyebrow: 'Promptbook Engine', title: 'Vaše AI.', accent: 'Na vašem stroji.',
        intro: 'Předáte agendu, nastavíte pravidla a engine pokračuje v práci. Agenti, úkoly a výsledky žijí v přehledné složce pod vaší kontrolou.',
        repository: 'Prohlédnout zdrojový kód', star: 'Líbí se vám tento přístup? Dejte nám hvězdičku na GitHubu.',
        install: 'Začněte u sebe.', installIntro: 'Vyberte si způsob instalace. Průvodce pak připraví projekt, připojení AI a první agendu.',
        methods: 'Způsob instalace', npmTitle: 'Pár příkazů. Vlastní engine.',
        npmText: 'Pro macOS, Linux i Windows. Před instalací potřebujete Node.js 22.13+ v řadě 22 nebo verzi 24+, npm 10+ a Git.',
        shellTitle: 'Od prázdné složky k první agendě.',
        shellText: 'Zkopírujte příkazy do Bash nebo Zsh. Používají npm; Node.js a Git musí být nainstalované předem.',
        windowsTitle: 'Průvodce instalací pro Windows.',
        serverTab: 'VPS / cloud', serverTitle: 'Vlastní server. Připravený k nastavení.',
        serverText: 'Začněte s DigitalOcean Dropletem, nebo zvolte Azure či AWS. Všechny postupy připraví Ubuntu server s trvalými daty a enginem. DigitalOcean vyžaduje vložení startovacího skriptu, Azure otevře přímo formulář a AWS potřebuje nahrát šablonu.',
        serverDigitalOcean: 'Připravit DigitalOcean Droplet', serverDigitalOceanHint: 'Vložte připravený startovací skript do formuláře nového Dropletu.',
        serverAws: 'Připravit AWS EC2', serverAwsHint: 'Nahrajte připravenou šablonu do CloudFormation.',
        serverDeploy: 'Nasadit na Azure', serverGuide: 'Mám vlastní VPS — otevřít návod',
        serverSetup: 'Po nasazení se připojte přes SSH a dokončete ptbk init i přihlášení k vybranému AI nástroji. Samotné tlačítko ještě nespustí Vaši agendu.',
        serverCost: 'Server, disk a IP adresa jsou placené služby poskytovatele. Před potvrzením zkontrolujte cenu. Zadáváte veřejný SSH klíč a svou IP adresu; přístup k dashboardu zůstává soukromý. Projektová data přežijí běžný restart, zálohy si zajistěte zvlášť.',
        windowsText: 'Na stránce vydání vyberte EXE pro Windows x64. Instalátor doplní chybějící Node.js, npm a Git, nainstaluje engine a nabídne vytvoření prvního projektu.',
        download: 'Vybrat Windows EXE', releaseHint: 'U zvolené verze otevřete Assets a stáhněte soubor:',
        releaseNote: 'Některá vydání jsou označená jako předběžná. Vyberte verzi podle poznámek k vydání.',
        terminal: 'Terminál', copy: 'Kopírovat příkazy', copied: 'Zkopírováno', copyFailed: 'Kopírování se nezdařilo. Označte příkazy a zkopírujte je ručně.',
        firstStart: 'Co se stane při prvním spuštění?',
        firstText: 'V ptbk init popíšete agendu a projdete nastavení. Vyberete podporované připojení k AI a prohlížeč; průvodce připraví projekt a spustí práci na pozadí.',
        providerNote: 'Účet u vybraného poskytovatele AI, jeho náklady a případný server řešíte samostatně. Odesílané vstupy zpracovává zvolený model.',
        controlsTitle: 'Zůstaňte v obraze.', controlsText: 'Tyto příkazy spouštějte jednotlivě. Dashboard ukazuje postup; před otevřením chatu jej zavřete nebo použijte další terminál. Zavření dashboardu nezastaví engine. Příkaz ptbk stop práci řádně zastaví, ptbk start ji znovu spustí.',
        files: 'Soubory, kterým rozumíte.', filesText: 'Definice agentů, úkoly a konverzace jsou čitelné texty. Můžete je upravovat, verzovat a přenést dál.',
        history: 'Historie práce patří vám.', historyText: 'Git zachovává změny projektových souborů. Dostupné záznamy průběhu práce doplňují traces.',
        models: 'AI podle vašeho výběru.', modelsText: 'Použijte podporované napojení na Codex, Claude Code nebo další harnessy. Volba modelu zůstává oddělená od vašich agentů a kontextu.',
        docs: 'README a technická dokumentace', apt: 'Jak funguje Agent–Project–Task',
        appTitle: 'Stejný engine. Pohodlné ovládání.', appText: 'Promptbook propojuje vlastní engine s ovládací aplikací a podporou. Pokud chcete celé řešení nebo pomoc s nasazením, ozvěte se nám.',
        help: 'Pomozte mi s nasazením', helpTopic: 'Pomoc s vlastní instalací enginu — open-source stránka', product: 'Prohlédnout celý Promptbook',
        partner: 'Nasazujete klientům? Prohlédněte si partnerství',
        licence: 'Licence enginu', licenceText: 'Business Source License 1.1 (BUSL-1.1). Podmínky konkrétní verze najdete v repozitáři.',
    },
    en: {
        back: '← Promptbook', eyebrow: 'Promptbook Engine', title: 'Your AI.', accent: 'On your machine.',
        intro: 'Hand over an ongoing responsibility, set the rules and let the engine keep working. Agents, tasks and results live in a readable folder under your control.',
        repository: 'Explore the source code', star: 'Like this approach? Give us a star on GitHub.',
        install: 'Start on your machine.', installIntro: 'Choose an installation method. The setup guide prepares your project, AI connection and first workflow.',
        methods: 'Installation method', npmTitle: 'A few commands. Your own engine.',
        npmText: 'For macOS, Linux and Windows. Install Node.js 22.13+ in the 22.x release line or version 24+, npm 10+ and Git first.',
        shellTitle: 'From an empty folder to your first workflow.',
        shellText: 'Copy these commands into Bash or Zsh. They use npm; Node.js and Git must already be installed.',
        windowsTitle: 'Guided installation for Windows.',
        serverTab: 'VPS / cloud', serverTitle: 'Your own server. Ready for setup.',
        serverText: 'Start with a DigitalOcean Droplet, or choose Azure or AWS. Every path prepares an Ubuntu server with persistent data and the engine. DigitalOcean requires pasting a startup script, Azure opens its form directly and AWS requires a template upload.',
        serverDigitalOcean: 'Prepare a DigitalOcean Droplet', serverDigitalOceanHint: 'Paste the prepared startup script into the new Droplet form.',
        serverAws: 'Prepare AWS EC2', serverAwsHint: 'Upload the prepared template to CloudFormation.',
        serverDeploy: 'Deploy to Azure', serverGuide: 'I have a VPS — open the guide',
        serverSetup: 'After deployment, connect over SSH and complete ptbk init and sign-in to your chosen AI tool. The button alone does not start your agenda.',
        serverCost: 'The server, disk and IP address are paid provider services. Review the cost before confirming. Supply your public SSH key and client IP; dashboard access stays private. Project data survives a normal restart; arrange backups separately.',
        windowsText: 'Choose the Windows x64 EXE on the releases page. The installer adds missing Node.js, npm and Git, installs the engine and offers to create your first project.',
        download: 'Choose a Windows EXE', releaseHint: 'Open Assets for your chosen version and download:',
        releaseNote: 'Some releases are marked as prereleases. Choose a version using its release notes.',
        terminal: 'Terminal', copy: 'Copy commands', copied: 'Copied', copyFailed: 'Copying failed. Select the commands and copy them manually.',
        firstStart: 'What happens on first launch?',
        firstText: 'In ptbk init, describe your ongoing responsibility and follow setup. Choose a supported AI connection and browser; the guide prepares the project and starts work in the background.',
        providerNote: 'Your chosen AI account, its costs and any server are separate. The selected model processes the inputs sent to it.',
        controlsTitle: 'Keep an eye on progress.', controlsText: 'Run these commands one at a time. The dashboard shows progress; close it or use another terminal before opening chat. Closing the dashboard does not stop the engine. Use ptbk stop to shut down gracefully and ptbk start to resume.',
        files: 'Files you can understand.', filesText: 'Agent definitions, tasks and conversations are readable text. Edit them, version them and take them with you.',
        history: 'The work history is yours.', historyText: 'Git keeps changes to project files. Traces add the available records of how work was carried out.',
        models: 'Your choice of AI.', modelsText: 'Use a supported connection to Codex, Claude Code or other harnesses. The model choice stays separate from your agents and context.',
        docs: 'README and technical documentation', apt: 'How Agent–Project–Task works',
        appTitle: 'The same engine. Comfortable controls.', appText: 'Promptbook brings your own engine together with an app and support. Get in touch if you want the complete solution or help setting it up.',
        help: 'Help me get started', helpTopic: 'Help with self-hosted engine installation — open-source page', product: 'Explore the complete Promptbook',
        partner: 'Deploying for clients? Explore the partnership',
        licence: 'Engine licence', licenceText: 'Business Source License 1.1 (BUSL-1.1). Find the terms for your version in the repository.',
    },
} as const;

/** A real clipboard action with selectable source and an explicit failure state. */
function CommandBlock({ commands, title, labels, copyable = true }: { commands: string; title: string; labels: typeof COPY.cs | typeof COPY.en; copyable?: boolean }) {
    const { copyStatus, copyText } = useCopyTextToClipboard();
    return <div className={s.terminal}>
        <div className={s.terminalHeader}><span><Terminal size={15} aria-hidden="true" />{title}</span>
            {copyable && <button type="button" onClick={() => void copyText(commands)} aria-label={labels.copy}>
                {copyStatus === 'copied' ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
                {copyStatus === 'copied' ? labels.copied : labels.copy}
            </button>}
        </div>
        <pre tabIndex={0}><code>{commands}</code></pre>
        <span className={s.copyStatus} role="status">{copyStatus === 'failed' ? labels.copyFailed : copyStatus === 'copied' ? labels.copied : ''}</span>
    </div>;
}

/** Self-hosted entry point shared by the Czech and English marketing routes. */
export function OpenSourcePage() {
    const { locale, path } = useSiteLocale();
    const copy = COPY[locale];
    const [method, setMethod] = useState<InstallMethod>('npm');
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const id = useId();

    /** Follows the WAI-ARIA tabs keyboard pattern, with selection following focus. */
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
            <p className={s.eyebrow}>{copy.eyebrow}</p>
            <h1>{copy.title}<br /><span>{copy.accent}</span></h1>
            <p className={s.intro}>{copy.intro}</p>
            <a className={s.repoLink} href={REPOSITORY}><Github size={19} aria-hidden="true" />{copy.repository}<ArrowRight size={17} aria-hidden="true" /></a>
        </header>

        <section className={s.install} aria-labelledby={`${id}-install`}>
            <div className={s.sectionIntro}><h2 id={`${id}-install`}>{copy.install}</h2><p>{copy.installIntro}</p></div>
            <div className={s.installer}>
                <div className={s.tabs} role="tablist" aria-label={copy.methods}>
                    {METHODS.map((item, index) => <button key={item} ref={element => { tabRefs.current[index] = element; }}
                        id={`${id}-${item}`} type="button" role="tab" aria-selected={method === item}
                        aria-controls={`${id}-panel-${item}`} tabIndex={method === item ? 0 : -1}
                        onClick={() => setMethod(item)} onKeyDown={event => moveTab(event, index)}>
                        {item === 'npm' ? 'npm' : item === 'shell' ? 'Shell' : item === 'server' ? copy.serverTab : 'Windows EXE'}
                    </button>)}
                </div>
                {METHODS.map(item => <div key={item} hidden={method !== item} id={`${id}-panel-${item}`} role="tabpanel" aria-labelledby={`${id}-${item}`} tabIndex={0} className={s.panel}>
                    <div className={s.methodIntro}><h3>{item === 'npm' ? copy.npmTitle : item === 'shell' ? copy.shellTitle : item === 'server' ? copy.serverTitle : copy.windowsTitle}</h3>
                        <p>{item === 'npm' ? copy.npmText : item === 'shell' ? copy.shellText : item === 'server' ? copy.serverText : copy.windowsText}</p>
                    </div>
                    {item === 'server' ? <div className={s.windows}>
                        <div className={s.downloadIcon}><Server size={34} strokeWidth={1.3} aria-hidden="true" /></div>
                        <a href={`${SERVER_GUIDE}#digitalocean`} className={s.downloadLink} aria-describedby={`${id}-digitalocean-hint`}>{copy.serverDigitalOcean}<ArrowRight size={17} aria-hidden="true" /></a>
                        <small id={`${id}-digitalocean-hint`}>{copy.serverDigitalOceanHint}</small>
                        <a href={AZURE_DEPLOY} className={s.repoLink}>{copy.serverDeploy}<ArrowRight size={17} aria-hidden="true" /></a>
                        <a href={`${SERVER_GUIDE}#aws`} className={s.repoLink} aria-describedby={`${id}-aws-hint`}>{copy.serverAws}<ArrowRight size={17} aria-hidden="true" /></a>
                        <small id={`${id}-aws-hint`}>{copy.serverAwsHint}</small>
                        <p>{copy.serverSetup}</p>
                        <a href={SERVER_GUIDE} className={s.repoLink}>{copy.serverGuide}<ArrowRight size={15} aria-hidden="true" /></a>
                        <small>{copy.serverCost}</small>
                    </div> : item === 'windows' ? <div className={s.windows}>
                        <div className={s.downloadIcon}><Download size={34} strokeWidth={1.3} aria-hidden="true" /></div>
                        <p>{copy.releaseHint}</p><code>Promptbook-Setup-&lt;version&gt;-windows-x64.exe</code>
                        <a href={RELEASES} className={s.downloadLink}>{copy.download}<ArrowRight size={17} aria-hidden="true" /></a>
                        <small>{copy.releaseNote}</small>
                    </div> : <CommandBlock key={item} title={item === 'shell' ? 'Bash / Zsh' : copy.terminal} labels={copy}
                        commands={item === 'npm' ? 'npm install --global ptbk\nptbk --version\n\nmkdir my-agenda\ncd my-agenda\nptbk init' : 'node --version\nnpm --version\ngit --version\n\nnpm install --global ptbk\nmkdir my-agenda && cd my-agenda\nptbk init'} />}
                </div>)}
            </div>
            <div className={s.afterInstall}><div><h3>{copy.firstStart}</h3><p>{copy.firstText}</p><p className={s.note}>{copy.providerNote}</p></div>
                <div><h3>{copy.controlsTitle}</h3><p>{copy.controlsText}</p><CommandBlock title="ptbk" labels={copy} copyable={false} commands={'ptbk dashboard\nptbk chat\nptbk stop\nptbk start'} /></div>
            </div>
        </section>

        <section className={s.ownership}>
            <article><FolderOpen aria-hidden="true" strokeWidth={1.3} /><h3>{copy.files}</h3><p>{copy.filesText}</p></article>
            <article><GitBranch aria-hidden="true" strokeWidth={1.3} /><h3>{copy.history}</h3><p>{copy.historyText}</p></article>
            <article><Terminal aria-hidden="true" strokeWidth={1.3} /><h3>{copy.models}</h3><p>{copy.modelsText}</p></article>
        </section>
        <div className={s.resources}><a href={`${REPOSITORY}/tree/reborn/2026-10`}>{copy.docs}<ArrowRight size={15} aria-hidden="true" /></a><Link href={path('whitepaper')}>{copy.apt}<ArrowRight size={15} aria-hidden="true" /></Link></div>

        <section className={s.help}><div><h2>{copy.appTitle}</h2><p>{copy.appText}</p></div><div className={s.helpActions}>
            <LeadButton topic={copy.helpTopic}>{copy.help}</LeadButton><Link href={path()}>{copy.product}<ArrowRight size={15} aria-hidden="true" /></Link><Link href={path('partnership')}>{copy.partner}<ArrowRight size={15} aria-hidden="true" /></Link>
        </div></section>
        <div className={s.licence}><div><strong>{copy.licence}</strong><p>{copy.licenceText} <a href={`${REPOSITORY}/blob/reborn/2026-10/LICENSE.md`}>LICENSE.md</a></p></div><a href={REPOSITORY} className={s.star}><Github size={17} aria-hidden="true" />{copy.star}</a></div>
    </div>;
}
