# Společná kvalita a akceptace webu

## Izolovaný rozsah

Veškerý nový web žije pod `/new`. Změny se týkají jeho rout, vlastní obchodní prezentace, kalkulačky a příslušných specifikací/testů. Stávající homepage, značkové domény, administrace a jiné formuláře se nemění. Sdílené kontaktní a právní mechanismy se používají beze změny kontraktu.

Prefix cest má jeden zdroj, aby budoucí přesun nebyl ruční hledání desítek odkazů. Přesun rout, canonical URL a změna indexace na `/` je samostatná operace. Do té doby žádné přesměrování původní homepage. Neznámý detail agendy nebo srovnání vrátí 404 s cestou zpět do nového webu.

## Vzhled a navigace

Jednotný prémiový světlý vizuální jazyk: téměř bílé pozadí, tmavý text, indigově modré akcenty vycházející z existujícího loga, výrazná typografická hierarchie a dostatek prostoru. Inspirace produktovými landing pages Applu spočívá v čistotě a soustředění na ukázku, nikoli v kopírování značky. Méně vnořených rámečků; každá agenda má vlastní kompozici s jemnou prostorovou hloubkou. Žádné prázdné marketingové štítky, přehnané poznámky pod každou kartou nebo dlouhý technický manuál v úvodu. Vlastní formát book se na marketingových stránkách nevysvětluje ani nevyžaduje.

V horní navigaci logo/úvod, agendy, partnerství, ceník, srovnání, příběh a kontaktní akce. Mobil má přístupné rozbalitelné menu, ne zcela zmizelou navigaci. Interní marketingové odkazy zůstávají pod `/new`. Žádný odkaz „současný web“ a žádné veřejné označení „dnes / připravujeme / vize“.

Kalkulačka je samostatná výrazná karta s velkým zaoblením a stínem, ne další nerozlišený blok. Výsledná částka tvoří větu s benefitem a obdobím. Pokročilé parametry netvoří vstupní formulář homepage.

Zjednodušení podle zadání 17. října 2026: hero, ukázky i sekce o datech plynou na stejném světlém pozadí. Ukázky a bezpečnost nemají vlastní tmavý zaoblený kontejner; žádné úzké bílé mezery mezi tmavými ostrovy. Hloubku tvoří jednotlivé pracovní objekty, jemné stíny a stávající 3D scroll. Ovládání ukázek používá jednoduché podtržení a čtyři kroky bez číselných odznaků. Zůstává čitelné označení „Ukázka“, přehrávání, přeskočení připnuté scény a odkaz na detail; zmizí dekorativní čítač, opakované stavové věty a vysvětlení pod plátnem. Ceník a portréty na úvodu jsou otevřené kompozice, dominantní samostatnou kartou zůstává kalkulačka. České i anglické texty se zkracují společně.

## Zakladatelé a firma

Pavol Hejný a Jiří Jahn jsou rovnocenní spoluzakladatelé. Oba mají stejnou vizuální prioritu, skutečný portrét, jméno, roli a možnost kontaktu. Pavol: technologie; Jiří: obchod. Jediné jméno v konfiguraci SLA nesmí znamenat jediného zakladatele na webu.

Patička přebírá oficiální údaje ze stávajícího repozitáře: **AI Web s.r.o., IČO 21012288, datová schránka hzuu4yn**, odkazy na rejstřík, právní kontakt a osobní údaje. Nepřepisovat je podle nepřesného hlasového přepisu názvu firmy a nevymýšlet adresu nebo DIČ. Právní dokumenty používají existující společné znění.

## Přístupnost

Jeden H1 na stránce, logická hierarchie, označené navigace, přeskočení na obsah, viditelný fokus. Taby mají aktivní stav, vazbu na panel, přepínání šipkami a Home/End. Pohyb je omezený a lze jej pozastavit; redukovaný pohyb neomezuje čitelnost.

Každé pole má label a jednotku, výsledky mají slovní interpretaci. Modál má správný fokus, titulek, popis, chyby a stav práce. Rychlé změny kalkulace ani selhání PDF nezničí vstupy. Mobil od 375 px musí fungovat bez horizontálního přetékání celé stránky; případný široký obsah smí mít vlastní ovladatelný kontejner.

## Metadata a URL

Každá stránka má vlastní titulek, popis a canonical URL bez výpočtových parametrů. Podstránky používají sdílený značkový social preview; hlavní stránka a partnerství vlastní existující renderer. Nenahlašovat neexistující jazykové alternativy. Nový obsah je český.

Pod `/new` zůstává technický `noindex` a žádné zařazení do sitemap. To není veřejný badge ani zajištění utajení. Referrer pro nové stránky je omezen na stejný origin, aby finanční parametry nebyly běžným referrerem externích odkazů. Kalkulace v URL je přesto viditelná držiteli odkazu, prohlížeči a provozním logům; není to tajné úložiště.

## Akceptace

- Homepage je stručná; podrobnosti mají funkční samostatné cesty. Žádné zadané zakázané slogany, psaní knihy, roadmapové štítky nebo CTA `mailto`.
- Pět funkčních ukázek má rozdílné vizualizace, správný aktivní stav a vazbu na detail agendy. Modelová data se nevydávají za zákaznické výsledky.
- Oba zakladatelé mají stejné role spoluzakladatelů a skutečné portréty. Právní údaje souhlasí se zdrojem.
- Ceník obsahuje Start 19 USD jednorázově na 30 dní, Business 100 USD měsíčně za prostředí. Plné právní nuance a SLA jsou dostupné na cenové stránce a FAQ, ne opakované všude.
- Bezpečnost rozlišuje E2E ovládací přenos, vlastní pracovní úložiště a odesílání vstupů externím modelům/nástrojům.
- Ve srovnáních jsou primární zdroje a datum; žádné nepravdivé tvrzení, že všechny alternativy vyžadují permanentní ruční ovládání.
- Mini kalkulačka má jen hlavní vstupy, správně popsaný benefit a přechod na pokročilou. Parametry se zachovají včetně neviditelných.
- URL round-trip, reload a historie obnoví všechna známá pole. Neznámé hodnoty, NaN/Infinity, prototype keys a přepis provize jsou odmítnuté/normalizované.
- Start nikdy negeneruje roční pilot, automatický Business, MRR nebo návratnost mimo dobu pilotu. 20 % je konstanta, nikoli uživatelská volba.
- Náklady na AI/provoz, implementaci a lidskou práci nejsou vynechané nebo započtené dvakrát. Režie při nule klientů zůstává. Záporný výsledek je vidět.
- Kontakt používá existující endpoint/evidenci. Chyba zachová údaje; kontaktní úspěch se nepotvrdí před backendem. Newsletter se nezapíná.
- PDF brána vyžádá e-mail v obou kalkulačkách. Po chybě kontaktu se PDF nestáhne. Po chybě PDF lze opakovat bez druhého zápisu uloženého kontaktu. PDF je skutečný čitelný soubor s českými znaky, kompletním rozkladem a použitelným share linkem.

## Ověření před přepnutím

Cílené jednotkové testy ekonomiky, URL parseru a PDF definice; prohlížečové testy interakcí, kontaktu/PDF, mobilu a rout; lint; produkční build a potom TypeScript. Prohlédnout skutečné screenshoty a renderovaný PDF report, ne jen zdrojový kód. Produkční GET ověří obsah stejného commitu; testovací kontakty neposílat na skutečnou produkci. Netvrdit plnou regresní sadu všech ostatních aplikací, pokud běží jen cílené testy.

Před finálním přesunem na `/` vlastník ověří skutečnou připravenost aplikace, párování a E2E implementace, schvalování, dostupný onboarding a smluvní podmínky. Cílové znění stránky tyto technické a obchodní kontroly nenahrazuje; tato změna je neimplementuje uvnitř enginu.

## Mobilní doladění — 17. října 2026

Ukázky mají souvislý světle modrošedý pás přes šířku stránky, další hlavní sekce jemné dělicí linky. Nevznikají oddělené tmavé ostrovy. Mobilní nadpisy a bezpečnostní schéma jsou vycentrované; ceník je pod 760 px v jednom sloupci. Texty uvnitř pracovních ukázek zůstávají čitelné, jejich ovládání je dostupné nad scénou. Časové přehrávání se na kompaktních displejích nespouští samo. Ověření musí zahrnovat skutečné vykreslení při šířkách telefonu, tabletu a desktopu; samotná desktopová kontrola nestačí. Náhledy různých CSS viewportů nejsou test fyzických zařízení ani jiných prohlížečových enginů.
