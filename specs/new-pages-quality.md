# Společná kvalita a akceptace webu

## Veřejné cesty po přepnutí 23. října 2026

Na výslovný pokyn vlastníka žije český web na `/cs` a anglický na `/en`, včetně marketingových podstránek. Kořen `/` a marketingové cesty bez jazykového prefixu přesměrovávají podle `Accept-Language`; explicitní jazykové URL se nemění. Původní `/new` adresy se trvale přesměrují se zachováním query parametrů. Značkové domény, články, workshopy, administrace a jiné formuláře se nemění. Sdílené kontaktní a právní mechanismy se používají beze změny kontraktu.

Veřejné cesty mají jeden zdroj. České `/cs` routy sdílejí implementaci kořenové skupiny `app/(marketing)` a anglické mají samostatnou catch-all routu vedle explicitních existujících článků a whitepaperu. Ostatní stránky zachovávají své směrování. Jazyková přesměrování mají stav 307, zachovávají query a používají `Vary: Accept-Language` spolu s `Cache-Control: private, no-store`. Chybějící či nepodporovaný jazyk volí angličtinu. Canonical, jazykové alternativy, sociální obrázky, navigace a sdílené kalkulace používají `/cs` a `/en`. Neznámý detail agendy nebo srovnání vrátí 404 s cestou zpět do nového webu.

## Vzhled a navigace — aktuální zadání 24. října 2026

Hlavní i partnerská landing page mají stejný světlý vizuální jazyk: téměř bílé pozadí, černý text, modrá původního loga (`#000080`), Outfit pro nadpisy a Inter pro text. Hlavička i patička obsahují původní symbol a slovo `promptbook` bez tečky; `prompt` je černě a `book` modře. Hero nadpisy nemají závěrečné tečky. Otevřené kompozice a jemně tónované pásy neskládají stránku do řady tmavých krabic. Prostorové objekty mají tenké světlé hrany, měkké stíny a jemnou paralaxu, bez tvrdých extruzí. Technické podrobnosti nepřebírají hero.

Tři pracovní příběhy jsou v jediném kompaktním karuselu hned za hero. Nejnovější zadání z 25. října 2026 vybírá světlý blueprint: konkrétní vstup, práce a výsledek jsou přímo ve vizualizaci. Kolem jsou pouze taby a pozastavení, bez titulků, popisů, časové osy či patičky. Čtvrtá propojená scéna aplikace a enginu používá stejný styl a dva nezávislé selecty zařízení; související feature trio se odstraní. Scroll normálně posouvá stránku bez připnutí. Modelový charakter ukázek se označuje uvnitř SVG, přístupný popis obsahuje podmínku nastavených přístupů/pravidel. Původní pětizáložkové demo zůstává na přehledu agend a detailech podle [specifikace produktu](new-product-page.md).

Hero má jedno výrazné tlačítko nezávazného zájmu, pod ním menší instalační odkaz a stručnou informaci o kontaktu a dostupnosti aplikace. Na konci stránky je navíc přímo viditelný formulář, který zachovává stávající modál a používá stejnou kontaktní evidenci. Žádné roadmapové odznaky, termín dokončení nebo odkaz „současný web“. Formulář nepředstírá dostupný účet. Navigace i mobilní rozbalitelné menu poskytují podstránky a instalaci. Všechny interní odkazy používají správný jazykový prefix.

Kalkulačka zůstává výraznou samostatnou kartou s popsaným přínosem a obdobím. Pokročilé parametry nezatěžují úvod. Start a Business mají klasické cenové karty s jasně porovnatelnou cenou a obsahem, na mobilu v jednom sloupci. Česká nabídka má přímo ceny v Kč, bez vysvětlivky kurzu. Ikona i text „Obnovit příklad“ zůstávají na jednom řádku uvnitř jednoho tlačítka. Redakční zkrácení nemění ceny, podíl, matematiku, dostupnost podstránek nebo zákonné údaje.

## Zakladatelé a firma

Pavol Hejný a Jiří Jahn jsou rovnocenní spoluzakladatelé. Oba mají stejnou vizuální prioritu, větší skutečný portrét, jméno, roli a ověřený e-mail/telefon. Jiří je vlevo od svého textu; Pavol vpravo od svého textu. Karty jsou zrcadlově uspořádané a spodní okraje portrétů lícují se spodní hranou karet. Jednoduchý nadpis „Kontakt“ nahrazuje větu „Za Promptbookem stojíme oba“. Pavol: technologie; Jiří: obchod. Jediné jméno v konfiguraci SLA nesmí znamenat jediného zakladatele na webu.

Patička přebírá oficiální údaje ze stávajícího repozitáře: **AI Web s.r.o., IČO 21012288, datová schránka hzuu4yn**, odkazy na rejstřík, právní kontakt a osobní údaje. Nepřepisovat je podle nepřesného hlasového přepisu názvu firmy a nevymýšlet adresu nebo DIČ. Právní dokumenty používají existující společné znění.

## Reference a podpora projektu

Produktová reference Slezské univerzity a pět původních referencí o osobní spolupráci s Pavolem Hejným tvoří jednu společnou mřížku stejných karet. Jedna karta obsahuje jednu citaci s jejím autorem. Žádné oddělovací nadpisy pro univerzitu a osobní zkušenosti. Všechny citace, jména, role a fotografie se zachovávají; díky nezměněnému znění a atribuci se osobní zkušenost nevydává za používání Promptbooku. Samostatná produktová datová kopie neimportuje osobní konfiguraci a nepřebírá automaticky budoucí změny. Všechny reference jsou dostupné, bez karuselu skrývajícího obsah. Praha 13 nesmí figurovat v žádném veřejném textu, metadatech ani logu.

Společná patička zachovává původní obrázek `public/sponsors/CI-Technology-Incubation.png` a přesné původní české/anglické znění podpory CzechInvest Technologická inkubace. Není nahrazeno novým logem nebo přepsaným příslibem podpory.

## Přístupnost a pohyb

Jeden H1, logická hierarchie, označené navigace, přeskočení na obsah a viditelný fokus. Taby mají aktivní stav, vazbu na panel a klávesy šipky/Home/End. Selecty aplikace a enginu mají přístupné názvy a vybranou hodnotu; uspání a pozastavení mají stisknutý stav. Karusel je ovladatelný klávesnicí a viditelné ovladače mají srozumitelné názvy. Scroll se nikdy nepřebírá, stránka se při každém běžném scrollování pohybuje a ukázky nepřipínají uživatele na místě. Pozastavený stav lze prohlížet bez nuceného pokračování.

Na všech velikostech jsou nové příběhy bez připnutí a nadbytečné scrollovací vzdálenosti. Automatickou animaci lze zastavit; mimo viewport a ve skryté kartě se zastaví sama. Na telefonu/tabletu a při redukovaném pohybu zůstávají čitelné a ručně ovladatelné. Redukovaný pohyb vypíná animace a ukazuje dokončený stav. Od šířky 375 px nepřetéká celá stránka; široké dílčí prvky mohou mít vlastní ovladatelný kontejner. Ověřit čitelnost obsahu, oba jazyky a režim vynucených barev.

Pole mají labely a jednotky, výsledky slovní interpretaci. Modál má titulek, popis, fokus, validaci, chyby a stav práce; chyba zachová údaje. Rychlé změny výpočtu ani selhání PDF nesmějí zničit vstupy. Instalační taby a kopírování příkazů jsou dostupné klávesnicí a při nedostupné schránce zůstávají příkazy ručně kopírovatelné.

## Metadata a URL

Každá stránka má vlastní titulek, popis a canonical URL bez výpočtových parametrů. Podstránky používají sdílený značkový social preview; hlavní stránka a partnerství vlastní existující renderer. Nenahlašovat neexistující jazykové alternativy. Obsah má českou a anglickou verzi.

Po přepnutí jsou veřejné marketingové stránky indexovatelné a zahrnuté v sitemap s jazykovými alternativami; staré `/new` URL jsou přesměrování. Referrer pro nové stránky je omezen na stejný origin, aby finanční parametry nebyly běžným referrerem externích odkazů. Kalkulace v URL je přesto viditelná držiteli odkazu, prohlížeči a provozním logům; není to tajné úložiště.

## Akceptace

- Hlavní i partnerská stránka mají jeden kompaktní karusel se všemi třemi příběhy a vlastními čtyřkrokovými scénami. Celá stránka se při scrollu normálně posouvá, bez připnutí nebo vynucených tabů. Taby, pozastavení, mobilní a redukované zobrazení dávají smysl; samostatná scéna zachovává nezávislé volby aplikace/enginu.
- Zavření aplikace ilustruje pokračování enginu na dostupném hostiteli. E2E kanál, vlastní soubory/Git a externí modelové/nástrojové vstupy jsou přesně rozlišené; scéna není skutečný ovladač nebo audit.
- Původních pět agend a jejich správné detaily zůstává funkčních. Modelová data se nevydávají za zákaznické výsledky.
- Hlavní kontaktní akce sbírá nezávazný zájem a uvádí dostupnost aplikace; menší odkaz vede na lokalizovanou instalaci s npm, shell a Windows EXE volbami.
- Oba zakladatelé mají rovnocenné role, větší zrcadlové portréty u spodní hrany karet a kontakty. Všech šest nezměněných referencí je v jedné mřížce se správnými atribucemi. Praha 13 se veřejně nevyskytuje a Technologická inkubace zůstává v patičce. Hlavička i patička mají původní logo a dvoubarevné `promptbook` bez tečky.
- Ceny v kartách zůstávají Start 400 Kč / 19 USD na 30 dní a Business 2 200 Kč / 100 USD za prostředí/měsíc. Česká veřejná nabídka neobsahuje vysvětlivku o přepočtu; interní převodní konstanta a model kalkulačky se nemění. Podíl 20 %, smluvní podmínky, SLA a BUSL se brandingem nemění.
- Srovnání mají primární zdroje a skutečné datum kontroly, bez popírání schopností alternativ.
- Mini kalkulačka má jen hlavní vstupy, správně popsaný benefit a přechod na pokročilou. Parametry se zachovají včetně neviditelných.
- URL round-trip, reload a historie obnoví všechna známá pole. Neznámé hodnoty, NaN/Infinity, prototype keys a přepis provize jsou odmítnuté/normalizované.
- Start nikdy negeneruje roční pilot, automatický Business, MRR nebo návratnost mimo dobu pilotu. 20 % je konstanta, nikoli uživatelská volba.
- Náklady na AI/provoz, implementaci a lidskou práci nejsou vynechané nebo započtené dvakrát. Režie při nule klientů zůstává. Záporný výsledek je vidět.
- Inline formulář i stávající modál používají existující endpoint/evidenci a `new-website-contact`. Chyba zachová údaje; kontaktní úspěch se nepotvrdí před backendem. Opakované kliknutí během odesílání nepřidá další požadavek. Newsletter se nezapíná.
- PDF brána vyžádá e-mail v obou kalkulačkách. Po chybě kontaktu se PDF nestáhne. Po chybě PDF lze opakovat bez druhého zápisu uloženého kontaktu. PDF je skutečný čitelný soubor s českými znaky, kompletním rozkladem a použitelným share linkem.

## Ověření

Cílené kontroly změněného chování, ekonomiky, URL parseru a PDF; lint, produkční build a TypeScript podle pracovního postupu. Prohlédnout skutečně vykreslený desktop, tablet a telefon v obou jazycích, taby, pozastavení a nezávislé volby zařízení, redukovaný pohyb, inline i modální formulář, jednorádkové tlačítko obnovy a instalační taby. Kontaktní backend v prohlížečových testech mockovat; nikdy neposílat testovací leady na produkci. U PDF ověřit renderovaný soubor, ne jen definici.

Ověření webu neprokazuje dokončené párování/E2E v enginu ani plnou regresní sadu ostatních aplikací. Zveřejnění je již autorizované; nejnovější kontaktní text poctivě rozlišuje zájem a informaci o dostupnosti aplikace.
