# Společná kvalita a akceptace webu

## Veřejné cesty po přepnutí 23. října 2026

Na výslovný pokyn vlastníka žije český web na `/cs` a anglický na `/en`, včetně marketingových podstránek. Kořen `/` a marketingové cesty bez jazykového prefixu přesměrovávají podle `Accept-Language`; explicitní jazykové URL se nemění. Původní `/new` adresy se trvale přesměrují se zachováním query parametrů. Značkové domény, články, workshopy, administrace a jiné formuláře se nemění. Sdílené kontaktní a právní mechanismy se používají beze změny kontraktu.

Veřejné cesty mají jeden zdroj. České `/cs` routy sdílejí implementaci kořenové skupiny `app/(marketing)` a anglické mají samostatnou catch-all routu vedle explicitních existujících článků a whitepaperu. Ostatní stránky zachovávají své směrování. Jazyková přesměrování mají stav 307, zachovávají query a používají `Vary: Accept-Language` spolu s `Cache-Control: private, no-store`. Chybějící či nepodporovaný jazyk volí angličtinu. Canonical, jazykové alternativy, sociální obrázky, navigace a sdílené kalkulace používají `/cs` a `/en`. Neznámý detail agendy nebo srovnání vrátí 404 s cestou zpět do nového webu.

## Vzhled a navigace — aktuální zadání 23. října 2026

Hlavní i partnerská landing page mají stejný prémiový světlý vizuální jazyk: téměř bílé pozadí, tmavý text, indigo původního loga, Outfit pro nadpisy, Inter pro text a velkorysé rozestupy. Otevřené kompozice a jemně tónované pásy neskládají stránku do řady tmavých krabic. Prostorové objekty mají tenké světlé hrany, měkké stíny a jemnou paralaxu, bez tvrdých extruzí. Technické podrobnosti nepřebírají hero.

Tři nové scrollové příběhy a scéna vlastnictví používají společný 2.5D styl na obou stránkách. Každý příběh ukazuje konkrétní práci, vstup i výsledek. Aplikace a engine jsou dva samostatně volitelné objekty. Modelová povaha ukázek a podmínka nastavených přístupů/pravidel zůstávají čitelné. Původní pětizáložkové demo má nadále místo na přehledu agend a detailech; jeho ovládání upravuje [specifikace produktu](new-product-page.md).

Hlavní kontaktní blok má jedno výrazné tlačítko nezávazného zájmu, pod ním menší instalační odkaz a stručnou informaci o kontaktu a dostupnosti aplikace. Žádné roadmapové odznaky, termín dokončení nebo odkaz „současný web“. Formulář nepředstírá dostupný účet. Navigace i mobilní rozbalitelné menu poskytují podstránky a instalaci. Všechny interní odkazy používají správný jazykový prefix.

Kalkulačka zůstává výraznou samostatnou kartou s popsaným přínosem a obdobím. Pokročilé parametry nezatěžují úvod. Ceník je otevřený, na mobilu v jednom sloupci. Redakční zkrácení nemění ceny, podíl, matematiku, dostupnost podstránek nebo zákonné údaje.

## Zakladatelé a firma

Pavol Hejný a Jiří Jahn jsou rovnocenní spoluzakladatelé. Oba mají stejnou vizuální prioritu, skutečný portrét, jméno, roli a možnost kontaktu. Pavol: technologie; Jiří: obchod. Jediné jméno v konfiguraci SLA nesmí znamenat jediného zakladatele na webu.

Patička přebírá oficiální údaje ze stávajícího repozitáře: **AI Web s.r.o., IČO 21012288, datová schránka hzuu4yn**, odkazy na rejstřík, právní kontakt a osobní údaje. Nepřepisovat je podle nepřesného hlasového přepisu názvu firmy a nevymýšlet adresu nebo DIČ. Právní dokumenty používají existující společné znění.

## Reference a podpora projektu

Produktová reference Slezské univerzity je oddělená od pěti původních referencí o osobní spolupráci s Pavolem Hejným. Všechny citace, jména, role a fotografie se zachovávají; osobní zkušenost se nevydává za používání Promptbooku. Samostatná produktová datová kopie neimportuje osobní konfiguraci a nepřebírá automaticky budoucí změny. Všechny reference jsou dostupné, bez karuselu skrývajícího obsah. Praha 13 nesmí figurovat v žádném veřejném textu, metadatech ani logu.

Společná patička zachovává původní obrázek `public/sponsors/CI-Technology-Incubation.png` a přesné původní české/anglické znění podpory CzechInvest Technologická inkubace. Není nahrazeno novým logem nebo přepsaným příslibem podpory.

## Přístupnost a pohyb

Jeden H1, logická hierarchie, označené navigace, přeskočení na obsah a viditelný fokus. Taby mají aktivní stav, vazbu na panel a klávesy šipky/Home/End. Volby aplikace a enginu mají srozumitelný stisknutý stav. Scroll se nepřebírá; ruční krok lze prohlížet bez nuceného pokračování a k přirozenému scrollu se lze vrátit. Příběhy lze přeskočit.

Na telefonu/tabletu a při redukovaném pohybu jsou nové příběhy dokončené a ručně ovladatelné bez připnutí, nucené časové animace a nadbytečné scrollovací vzdálenosti. Redukovaný pohyb vypíná perspektivní animace/paralaxu. Od šířky 375 px nepřetéká celá stránka; široké dílčí prvky mohou mít vlastní ovladatelný kontejner. Ověřit čitelnost obsahu, oba jazyky a režim vynucených barev.

Pole mají labely a jednotky, výsledky slovní interpretaci. Modál má titulek, popis, fokus, validaci, chyby a stav práce; chyba zachová údaje. Rychlé změny výpočtu ani selhání PDF nesmějí zničit vstupy. Instalační taby a kopírování příkazů jsou dostupné klávesnicí a při nedostupné schránce zůstávají příkazy ručně kopírovatelné.

## Metadata a URL

Každá stránka má vlastní titulek, popis a canonical URL bez výpočtových parametrů. Podstránky používají sdílený značkový social preview; hlavní stránka a partnerství vlastní existující renderer. Nenahlašovat neexistující jazykové alternativy. Obsah má českou a anglickou verzi.

Po přepnutí jsou veřejné marketingové stránky indexovatelné a zahrnuté v sitemap s jazykovými alternativami; staré `/new` URL jsou přesměrování. Referrer pro nové stránky je omezen na stejný origin, aby finanční parametry nebyly běžným referrerem externích odkazů. Kalkulace v URL je přesto viditelná držiteli odkazu, prohlížeči a provozním logům; není to tajné úložiště.

## Akceptace

- Hlavní i partnerská stránka obsahují všechny tři nové příběhy, vlastní čtyřkroková plátna a nezávislé volby aplikace/enginu. Ruční, scrollové, mobilní a redukované zobrazení dávají smysl.
- Zavření aplikace ilustruje pokračování enginu na dostupném hostiteli. E2E kanál, vlastní soubory/Git a externí modelové/nástrojové vstupy jsou přesně rozlišené; scéna není skutečný ovladač nebo audit.
- Původních pět agend a jejich správné detaily zůstává funkčních. Modelová data se nevydávají za zákaznické výsledky.
- Hlavní kontaktní akce sbírá nezávazný zájem a uvádí dostupnost aplikace; menší odkaz vede na lokalizovanou instalaci s npm, shell a Windows EXE volbami.
- Oba zakladatelé mají rovnocenné role, skutečné portréty a kontakty. Produktové/osobní reference mají správný kontext, Praha 13 se veřejně nevyskytuje a Technologická inkubace zůstává v patičce.
- Ceny zůstávají Start 19 USD na 30 dní a Business 100 USD za prostředí/měsíc; české zobrazení používá společný modelový kurz. Podíl 20 %, smluvní podmínky, SLA a BUSL se brandingem nemění.
- Srovnání mají primární zdroje a skutečné datum kontroly, bez popírání schopností alternativ.
- Mini kalkulačka má jen hlavní vstupy, správně popsaný benefit a přechod na pokročilou. Parametry se zachovají včetně neviditelných.
- URL round-trip, reload a historie obnoví všechna známá pole. Neznámé hodnoty, NaN/Infinity, prototype keys a přepis provize jsou odmítnuté/normalizované.
- Start nikdy negeneruje roční pilot, automatický Business, MRR nebo návratnost mimo dobu pilotu. 20 % je konstanta, nikoli uživatelská volba.
- Náklady na AI/provoz, implementaci a lidskou práci nejsou vynechané nebo započtené dvakrát. Režie při nule klientů zůstává. Záporný výsledek je vidět.
- Kontakt používá existující endpoint/evidenci. Chyba zachová údaje; kontaktní úspěch se nepotvrdí před backendem. Newsletter se nezapíná.
- PDF brána vyžádá e-mail v obou kalkulačkách. Po chybě kontaktu se PDF nestáhne. Po chybě PDF lze opakovat bez druhého zápisu uloženého kontaktu. PDF je skutečný čitelný soubor s českými znaky, kompletním rozkladem a použitelným share linkem.

## Ověření

Cílené kontroly změněného chování, ekonomiky, URL parseru a PDF; lint, produkční build a TypeScript podle pracovního postupu. Prohlédnout skutečně vykreslený desktop, tablet a telefon v obou jazycích, ruční/scrollové kroky, nezávislé volby vlastnictví, redukovaný pohyb, formulář a instalační taby. Kontaktní backend v prohlížečových testech mockovat; nikdy neposílat testovací leady na produkci. U PDF ověřit renderovaný soubor, ne jen definici.

Ověření webu neprokazuje dokončené párování/E2E v enginu ani plnou regresní sadu ostatních aplikací. Zveřejnění je již autorizované; nejnovější kontaktní text poctivě rozlišuje zájem a informaci o dostupnosti aplikace.
