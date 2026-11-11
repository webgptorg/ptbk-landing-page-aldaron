export type InstallMethod = 'ai' | 'npm' | 'shell' | 'windows' | 'macos' | 'server';
export type InstallTarget = 'local' | 'server';
type WalkthroughKey = Exclude<InstallMethod, 'ai'> | 'ai-local' | 'ai-server';
type Walkthrough = { name: string; steps: readonly { title: string; text: string }[] };

/** Instructions follow the selected installer, including the AI prompt's destination. */
const WALKTHROUGHS = {
    cs: {
        'ai-local': { name: 'AI agent · Váš počítač', steps: [
            { title: 'Zkopírujte prompt', text: 'Nahoře vyberte Váš počítač a zkopírujte celý prompt.' },
            { title: 'Vložte ho do AI agenta', text: 'Použijte Claude Code, Codex nebo jiného agenta s přístupem k terminálu na svém počítači.' },
            { title: 'Dokončete nastavení', text: 'Odpovězte na otázky k projektu a dokončete přihlášení vybraného AI nástroje.' },
        ] },
        'ai-server': { name: 'AI agent · VPS přes SSH', steps: [
            { title: 'Zkopírujte prompt pro VPS', text: 'Nahoře vyberte VPS přes SSH. Připravte si adresu existujícího serveru a SSH uživatele.' },
            { title: 'Spusťte svého AI agenta', text: 'Prompt vložte do agenta na svém počítači. Připojí se na VPS Vaším místním SSH přístupem.' },
            { title: 'Dokončete přihlášení', text: 'Otevřete přihlašovací odkaz AI nástroje a dokončete průvodce projektem přes SSH.' },
        ] },
        npm: { name: 'npm', steps: [
            { title: 'Otevřete terminál', text: 'Připravte Node.js, npm a Git podle požadavků výše.' },
            { title: 'Nainstalujte balíček', text: 'Spusťte zobrazený příkaz npm install --global ptbk se zvolenou verzí.' },
            { title: 'Založte projekt', text: 'Spusťte ptbk init a projděte nastavením agendy a AI nástroje.' },
        ] },
        shell: { name: 'Shell · Ubuntu VPS', steps: [
            { title: 'Připojte se přes SSH', text: 'Použijte Ubuntu 24.04 x64 se systemd a účet root nebo sudo.' },
            { title: 'Spusťte instalační příkaz', text: 'Vložte příkaz výše do SSH terminálu. Skript připraví závislosti a otevře ptbk init.' },
            { title: 'Dokončete průvodce', text: 'Popište agendu a přihlaste AI nástroj pod serverovým účtem promptbook.' },
        ] },
        windows: { name: 'Windows EXE', steps: [
            { title: 'Stáhněte EXE', text: 'Použijte tlačítko ke stažení Windows instalátoru výše.' },
            { title: 'Spusťte instalátor', text: 'Ponechte vybranou desktopovou aplikaci. Instalátor doplní potřebné závislosti.' },
            { title: 'Otevřete Promptbook', text: 'V aplikaci dokončete nastavení projektu a vyberte svůj AI nástroj.' },
        ] },
        macos: { name: 'macOS DMG', steps: [
            { title: 'Stáhněte DMG pro svůj Mac', text: 'Vyberte Apple Silicon pro čipy M1 a novější, nebo Intel pro Mac s procesorem Intel.' },
            { title: 'Přetáhněte aplikaci do Aplikací', text: 'Otevřete stažený DMG a přetáhněte Promptbook do složky Aplikace.' },
            { title: 'Spusťte Promptbook', text: 'Otevřete ho ze složky Aplikace a dokončete nastavení projektu. Pokud chybí Git, doplňte Apple Command Line Tools.' },
        ] },
        server: { name: 'VPS / cloud', steps: [
            { title: 'Vyberte poskytovatele', text: 'Otevřete návod pro DigitalOcean, Azure nebo AWS výše a vytvořte svůj server.' },
            { title: 'Připravte server', text: 'Použijte startovací skript nebo šablonu z návodu pro vybraného poskytovatele.' },
            { title: 'Dokončete nastavení přes SSH', text: 'Připojte se na server, spusťte instalační příkaz a dokončete projekt i přihlášení AI nástroje.' },
        ] },
    },
    en: {
        'ai-local': { name: 'AI agent · Your computer', steps: [
            { title: 'Copy the prompt', text: 'Select Your computer above and copy the complete prompt.' },
            { title: 'Paste it into your AI agent', text: 'Use Claude Code, Codex or another agent with terminal access on your computer.' },
            { title: 'Complete setup', text: 'Answer the project questions and finish signing in to your selected AI tool.' },
        ] },
        'ai-server': { name: 'AI agent · VPS over SSH', steps: [
            { title: 'Copy the VPS prompt', text: 'Select VPS over SSH above. Have your existing server address and SSH user ready.' },
            { title: 'Run your local AI agent', text: 'Paste the prompt into the agent on your computer. It connects using your local SSH access.' },
            { title: 'Finish signing in', text: 'Open the AI tool’s login link and complete project setup over SSH.' },
        ] },
        npm: { name: 'npm', steps: [
            { title: 'Open your terminal', text: 'Have Node.js, npm and Git ready according to the requirements above.' },
            { title: 'Install the package', text: 'Run the npm install --global ptbk command above with your selected version.' },
            { title: 'Create a project', text: 'Run ptbk init and complete agenda and AI tool setup.' },
        ] },
        shell: { name: 'Shell · Ubuntu VPS', steps: [
            { title: 'Connect over SSH', text: 'Use Ubuntu 24.04 x64 with systemd and root or sudo access.' },
            { title: 'Run the installation command', text: 'Paste the command above into the SSH terminal. It prepares dependencies and opens ptbk init.' },
            { title: 'Complete the wizard', text: 'Describe your agenda and sign in to the AI tool as the promptbook server user.' },
        ] },
        windows: { name: 'Windows EXE', steps: [
            { title: 'Download the EXE', text: 'Use the Windows installer download button above.' },
            { title: 'Run the installer', text: 'Keep the desktop app selected. The installer adds the required dependencies.' },
            { title: 'Open Promptbook', text: 'Complete project setup and select your AI tool in the app.' },
        ] },
        macos: { name: 'macOS DMG', steps: [
            { title: 'Download the DMG for your Mac', text: 'Choose Apple Silicon for M1 and newer chips, or Intel for a Mac with an Intel processor.' },
            { title: 'Drag the app into Applications', text: 'Open the downloaded DMG and drag Promptbook into Applications.' },
            { title: 'Launch Promptbook', text: 'Open it from Applications and complete project setup. If Git is missing, install Apple Command Line Tools.' },
        ] },
        server: { name: 'VPS / cloud', steps: [
            { title: 'Choose a provider', text: 'Open the DigitalOcean, Azure or AWS guide above and create your server.' },
            { title: 'Prepare the server', text: 'Use the startup script or deployment template in your selected provider’s guide.' },
            { title: 'Finish setup over SSH', text: 'Connect to the server, run the installation command, then complete project setup and AI sign-in.' },
        ] },
    },
} as const satisfies Record<'cs' | 'en', Record<WalkthroughKey, Walkthrough>>;

export function getInstallationWalkthrough(locale: 'cs' | 'en', method: InstallMethod, target: InstallTarget) {
    const key: WalkthroughKey = method === 'ai' ? `ai-${target}` : method;
    return WALKTHROUGHS[locale][key];
}
