# Vlastní instalace enginu

`/cs/open-source` a `/en/open-source` jsou technickým vstupem k vlastnímu provozu enginu. Obsah navazuje na společnou myšlenku autonomní agendy a kontroly nad AI. Nabídka celé aplikace, podpory a partnerství zůstává dostupná přes jazykově odpovídající odkazy; návštěvník může přímo otevřít stávající kontakt s tématem pomoci s instalací.

## Instalace

Tři přístupné záložky: **npm**, **Shell**, **Windows EXE**. Klávesnice používá šipky, Home a End, každý tab má svůj panel. npm ukazuje `npm install --global ptbk`, ověření verze, vytvoření složky a `ptbk init`. Shell je skutečný Bash/Zsh postup přes npm s kontrolou dostupnosti Node.js, npm a Gitu; nevymýšlí se neexistující curl instalátor. Předpoklady odpovídají enginu: Node.js řady 22 od 22.13 nebo 24+, npm 10+, Git.

Windows odkazuje na veřejná GitHub Releases včetně předběžných vydání. Návštěvník vybere asset `Promptbook-Setup-<version>-windows-x64.exe`; stránka nevymýšlí pevnou nejnovější verzi ani přímý odkaz na neexistující asset. Instalátor doplní chybějící předpoklady a předá první projekt průvodci.

Příkazy jsou vždy čitelné a označitelné. Kopírování používá společný clipboard helper, potvrzuje pouze skutečný úspěch a při chybě nabízí ruční kopírování. `ptbk init` připraví projekt a spustí agendu na pozadí. `ptbk dashboard`, `ptbk chat`, `ptbk stop` a `ptbk start` vysvětlují základní ovládání. Zavření dashboardu neukončuje engine.

## Důvěra a návaznost

Stránka vysvětluje čitelné soubory, Git historii a volbu podporovaných AI napojení. Účet poskytovatele, modelové vstupy a provozní náklady jsou oddělené. Odkazy vedou na zdrojový kód, README, whitepaper a partnerství. Podmínky BUSL-1.1 se nemění a odkazují na licenční soubor konkrétního repozitáře; stránka neslibuje neomezené produkční oprávnění.

Metadata mají vlastní český a anglický titulek, canonical a obě jazykové alternativy. Obě stránky jsou v sitemap. `/open-source` se jako ostatní marketingové vstupy bez jazyka přesměruje podle `Accept-Language`, včetně zachování query. Značkové domény, API a jiné aplikace tím nezískávají cizí routy.
