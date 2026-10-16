# Hlavní web, agendy a podpůrné stránky

## Hlavní stránka `/new`

Úvod musí jít pochopit rychlým prohlédnutím. Nepřepisuje dokumentaci, obchodní smlouvu ani všechny otázky do jedné dlouhé stránky. Podrobnosti patří na navazující podstránky.

### Pořadí bloků

1. Společná navigace a hero: **„Dřív jste AI úkolovali. Teď pracuje pro vás.“** Jedna věta o e-mailech, dokladech, obsahu a údržbě. Hlavní akce **Vybrat první agendu** otevře kontakt; vedle vede odkaz **Nasazuji řešení klientům** na partnerství. Bez nadpisových marketingových štítků, upozornění na vývoj aplikace nebo požadavku psát book.
2. Přepínatelné názorné ukázky pěti agend. Příklady mají vysvětlit výstup pohledem na práci, nikoli dalšími slogany.
3. Jeden hlavní blok **„Vaše data. Opravdu vaše.“** Obsahuje vlastní server a end-to-end šifrovaný kanál do aplikace. Jednoduché schéma server → šifrovaný přenos → aplikace. Jasně odliší vstupy odeslané externímu modelu. Odkaz na bezpečnost; bezpečnostní argument se znovu nerozepisuje v každém následujícím bloku.
4. **Pro koho / pro koho ne.** Vhodné pro opakovanou firemní práci, klientovo vlastnictví dat a ochotu nastavit pravidla a provoz. Nevhodné pro pouhý jednorázový chat nebo očekávání bezchybnosti bez kontrol a odpovědné péče.
5. Stručný přechod ke srovnání přístupů. Bez šestisloupcové tabulky, cen konkurence nebo konkurentů v hero.
6. Krátký ceník se dvěma kartami Start/Business. Zachovat cenu, období, účel a kontakt; jednou uvést DPH a samostatné AI/provoz/služby. Vysvětlení instance, práv, všech výluk a pracovního okna podpory je na `/new/cenik`, ne na úvodu.
7. Samostatná výrazná karta rychlé kalkulačky podle [specifikace ekonomiky](new-economics-calculator.md).
8. Oba zakladatelé ve stejném vizuálním postavení, reálné portréty, role, kontaktní akce a odkaz **Náš příběh**.
9. Krátká závěrečná kontaktní výzva a společná patička.

Nad rámec této struktury nepřidávat na úvod plné SLA, dlouhé FAQ, kapitoly o interním formátu, podrobnou roadmapu nebo opakované výhrady. Hlavní stránka nepoužívá výraz „instance není server ani agent“.

## Ukázky agend

Vizuální princip: přehledné záložky podobné volbě nástroje v Canvě a pod nimi velké živě působící pracovní plátno. Nejde o screenshot dostupného klientského účtu, videopřehrávač bez videa ani produkční telemetrii. Označení **Ukázka** je malé, ale čitelné. Data jsou syntetická.

Záložky: **E-maily**, **Účetní podklady**, **Sociální sítě**, **Video → obsah**, **Údržba webu**. Aktivní záložka je rozlišitelná bez spoléhání jen na barvu. Přepnutí změní nejen titulek, ale celé plátno a průběh práce.

- E-maily: doručené zprávy, vybraný dotaz, návrh odpovědi z firemního kontextu, pravidla odeslání.
- Účetní podklady: originální doklad a jeho strukturované údaje, výsledek připravený účetní. Nevydávat přípravu podkladů za převzetí účetní odpovědnosti.
- Sociální sítě: varianty tématu pro Facebook, Instagram a LinkedIn, text i vizuál a naplánovaná publikace.
- Video: vstupní video, navazující článek a další výstupy, například přepis, popis a příspěvky. Přehrávání ukázky nepřehrává neexistující skutečné video.
- Web: změna kódu, testy a náhled opraveného formuláře. Dokončení testů neznamená záruku absence všech chyb.

Každá záložka ukáže čtyři kroky, které mění samotnou práci na plátně, nejen indikátor postupu. E-mail propojí dotaz, kontext a odpověď; papírová faktura se přemění na strukturovaná data; každá sociální síť dostane vlastní kompozici a schvalovací stav; video přejde přes časovou osu a přepis k článku; úprava kódu přes testy k opravenému formuláři. Animace je omezená na jeden průchod po výběru, s pozastavením a opakováním. Kliknutí na krok zastaví přehrávání a dovolí výsledek prohlédnout. Přehrávání se pozastaví mimo viewport i na skryté kartě. Jemný 3D pohyb vrstev reaguje na přirozený scroll bez jeho přebírání; neprovádí pracovní kroky. Mobil zachová vstupy i všechny tři sociální sítě v čitelné kompozici. Redukovaný pohyb zobrazí dokončený stav bez časové animace. Šipky, Home/End a fokus fungují podle vzoru tabů. Pod plátnem je jedna vysvětlující věta a odkaz na odpovídající detail agendy.

## `/new/agendy` a detaily

Přehled obsahuje stejné ukázky a odkazy na pět agend. Detail uvádí vstup, postup a výstup, zobrazí správnou výchozí záložku a nabídne kontakt s názvem agendy i kalkulačku předvyplněnou pro tento scénář. Po přepnutí scénáře přímo v ukázce odkaz pod plátnem vždy odpovídá aktivní záložce.

Všechny scénáře počítají s nakonfigurovanými přístupy a pravidly, ne s univerzálním přístupem ke každé službě. Nezobrazovat logo externí platformy jako důkaz certifikovaného konektoru nebo smluvního partnerství.

## `/new/bezpecnost`

Plný popis: pracovní prostředí na klientově počítači/serveru/VPS; oddělená aplikace; párování; end-to-end šifrování pracovního obsahu v ovládacím kanálu; dešifrování na klientském zařízení; odlišení účtu/předplatného od pracovního obsahu. Engine může běžet bez otevřeného ovládání, ale hostitelský stroj musí být dostupný.

Externí AI dostává potřebné vstupy z klientova prostředí. Šifrované ovládání neukrývá tyto vstupy před zvoleným poskytovatelem modelu ani před nástrojem, kterému jsou odeslané. Lokální inference tento externí modelový tok odstraňuje, ne automaticky všechny další externí nástroje. Vhodnost lokálního modelu závisí na úloze a hardwaru.

Oprávnění, schvalování, aktualizace, zálohy a bezpečnost zařízení patří do nasazení. Veřejný kód není sám o sobě bezpečnostní certifikace. Popis šifrování vychází z vlastníkem potvrzené cílové architektury; implementace webu nepředstavuje kryptografický audit.

Samostatně vysvětlit údaje v kalkulačce, veřejnost sdíleného odkazu a uložení kontaktní žádosti při vyžádání PDF.

## `/new/o-nas`

Příběh vychází z popisu zakladatele v konverzaci: od chatbotů na webu přes jednotlivé agentní úkoly k dlouhodobým agendám. Opakované zadávání zůstávalo problémem, proto má agent průběžný okruh práce. Technologie stojí na coding harnesses a pracovních souborech; partner zajišťuje konkrétní klientské řešení. Vlastní pracovní kontext a možnost volby modelu jsou záměr produktu.

Nevymýšlet letopočty, první zákazníky, obraty, osobní historky ani přímé citace. Bez cizích referencí či statistik jako náhražky příběhu.

**Jiří Jahn — spoluzakladatel · obchod** a **Pavol Hejný — spoluzakladatel · technologie** mají stejnou velikost karty, portrétu, jména a CTA. Oba jsou rovnocenní zakladatelé. Použít fotografie a e-maily ze stávajícího webu. Marketingová tlačítka jsou kontaktní formuláře s tématem a jménem adresáta, nikoli `mailto`.

## `/new/faq`

Běžná obsluha bez programování; agenda vs. chatbot; vypnutý notebook vs. server; chyby a schvalování; kam jdou data; veřejná licence; klientské prostředí; SLA vs. noční běh; partnerské nasazení; kombinace s ostatními nástroji. Odpovědi odkazují na ceník, bezpečnost a srovnání a neobnovují zamítnutou roadmapu nebo požadavek znalosti book.

## Právní stránky

`/new/soukromi` a `/new/podminky` vykreslují stejné stávající právní dokumenty společnosti v novém rámu. Žádné zkrácení práv, nová licence nebo nové právní tvrzení odvozené pouze z marketingového copy. Právní odkazy v původním obsahu se zachovávají.
