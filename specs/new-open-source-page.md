# Instalace Promptbooku

`/cs/open-source` a `/en/open-source` jsou stručným instalačním rozcestníkem. Jeden nadpis, krátký pokyn, výběr způsobu instalace a obsah zvolené záložky. Bez opakovaného produktového hero, benefitů, přehledu ovládání, prodejních sekcí a výzvy ke hvězdičce. Dole pouze GitHub, dokumentace, BUSL-1.1 a stávající kontakt pro pomoc s instalací.

## Způsoby instalace

Pět přístupných záložek: **Claude Code / Codex / AI** (první a výchozí), **npm**, **Shell**, **Windows EXE**, **VPS / cloud**. Šipky cyklí volby, Home/End přejdou na první/poslední. Přesná vazba tab/panel, viditelné zaměření a vodorovně posuvné záložky na mobilu.

AI nabízí stručné lidsky čitelné prompty pro **Váš počítač** a **VPS přes SSH**, určené místnímu agentovi s terminálem. Obsahuje aktuální README/návod, zachování dat, doplnění předpokladů, publikovaný balíček, běžný init, nativní přihlášení, ověření výsledku a předání dashboardu. VPS používá existující SSH přístup, Ubuntu 24.04 x86-64, účet `promptbook` pro engine i harness, headless prohlížeč a nativní přihlašovací odkazy/kódy. Nekupuje server ani nevyžaduje tajné údaje v chatu. Celý zvolený prompt se kopíruje, při změně cíle se smaže staré potvrzení; cíl přetrvá změnu záložky.

npm je pro již připravené Node.js/npm/Git: `npm install --global ptbk` a `ptbk init`. Předpoklady zůstávají Node.js 22.13+ v řadě 22 nebo 24+, npm 10+, Git.

Shell je pro čisté **Ubuntu 24.04 x64 se systemd**, přes interaktivní SSH, jako root nebo s přístupem k sudo. Kopíruje `curl -fsSL https://www.ptbk.io/install.sh | bash`. Veřejný `public/install.sh` je skutečný tenký vstup nad sdíleným `deploy/ubuntu/install.sh` enginu; neimplementuje druhou instalaci Node.js/npm/Gitu/Chromu. Ověří podporu a terminál, stáhne celý skript a zkontroluje syntaxi, spustí systémovou přípravu a pouze po úspěchu přejde jako `promptbook` do `~/projects/my-agenda` a spustí `ptbk init --path "$PWD"`. Při existujícím `ptbk.json` otevře běžné `ptbk` bez reinicializace. Živý terminál obnoví z `/dev/tty`, takže vstup průvodce není roura staženého skriptu. Nepřijímá ani neloguje autentizační údaje. Chyba přípravy nepokračuje do init; dočasný soubor se uklidí. Bez terminálu nabídne interaktivní SSH, na nepodporovaném systému skončí před změnami. Zdroj skriptu je odkazovaný a cesta je v explicitním seznamu sdílených veřejných souborů.

Rozbalitelné přihlášení na VPS uvádí `codex login --device-auth` a `claude auth login` s odkazy na oficiální dokumentaci. Odkaz/kód dokončí uživatel na vlastním počítači nebo telefonu pod stejným serverovým účtem `promptbook`. Jde o dostupné nativní postupy, nikoliv tvrzení, že engine již automaticky implementuje všechny cílové požadavky onboardingu.

Windows odkazuje na veřejné GitHub Releases a pojmenování `Promptbook-Setup-<version>-windows-x64.exe`; nevymýšlí pevnou aktuální verzi ani neexistující asset.

Cloud ponechá **DigitalOcean první**, Azure a AWS. Každá volba má přímý odkaz a krátký popis skutečného kroku: vložení startovacího skriptu, formulář Azure, nahrání CloudFormation. Sdílí návod `deploy/README.md` a Azure ARM šablonu ve větvi `reborn/2026-10`. Server je placený a po jeho přípravě se inicializace a AI přihlášení dokončí přes SSH. Web server nezakládá ani nepřebírá klíče.

## Společné chování

Příkazy i prompty jsou označitelné a dostupné z klávesnice. Sdílený clipboard helper potvrdí pouze skutečné zkopírování; při chybě zůstane text čitelný s pokynem k ruční kopii. Oba jazyky mají stejné příkazy a zdroje. Metadata, canonical/alternates, sitemap, jazyková přesměrování a oddělené značkové domény se zachovají. Licence se nemění.
