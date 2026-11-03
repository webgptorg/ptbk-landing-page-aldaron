# Obchodní nabídka, licence a servisní SLA

Autorita: navazující rozhodnutí vlastníka z 3. listopadu 2026; aktuální nabídka sama neuzavírá konkrétní smlouvu. Stejné částky a podmínky platí v obou stránkách, metadatech, kalkulačce a exportu.

## Nabídka má přesně dva plány

Aktuální rozhodnutí vlastníka z 3. listopadu 2026 nahrazuje dřívější pilot a cenové údaje. Web publikuje aktuální nabídku, ne návrh. Před spuštěním lze ceník a rozlišení dále iterovat; přijaté objednávky mají vlastní sjednaná pravidla změn.

| Vlastnost | Start | Business |
| --- | --- | --- |
| Cena bez DPH | 399 Kč měsíčně za klientské prostředí | 1 999 Kč měsíčně za klientské prostředí |
| Anglická nabídka | 19 USD měsíčně | 100 USD měsíčně |
| Účel | Průběžný provoz ve vlastní režii | Průběžný provoz s produktovou podporou |
| Licence | Jedno klientské prostředí, více agentů | Jedno klientské prostředí, více agentů |
| Produktová podpora | Není zahrnuta | Posouzení hlášených problémů platformy |
| SLA | Žádné produktové SLA | První věcná reakce do 16 pracovních hodin |

Oba plány mohou běžet trvale a standardně se obnovují měsíčně, bez ročního závazku. Obnovení lze zrušit pro další fakturační období. Start nemá jednorázový nárok, třicetidenní limit ani povinný přechod na Business. Další rozlišení plánů je otevřené rozhodnutí; nevymýšlet nové funkční či početní limity. Horizont kalkulačky není smluvní závazek.

## Co znamená instance

Samostatné prostředí jednoho koncového klienta, nikoli fyzický server, jeden agent nebo jeden spuštěný úkol. Instance může obsahovat více agentů. Každé další samostatné produkční prostředí vyžaduje samostatnou licenci. Společný server pro více klientů neznamená jednu sdílenou licenci. Neuvádět starý limit deseti agentů ani nekonečné klientské prostředí za jednu licenci.

Web nenastavuje limity výkonu ani neimplementuje vymáhání licence. Předmět a rozsah oprávnění stanoví objednávka a licenční podmínky konkrétního nasazení.

## Co se platí mimo licenci

Hosting, databáze, úložiště, AI modely a externí služby. Platí je klient, případně agentura nebo provozní partner podle dohody. Samostatně se platí návrh řešení, instalace, integrace, školení a průběžná práce agentury. Web proto zobrazuje úplnou ekonomiku, ne pouze cenu licence.

Promptbook neprodává spravovaný hosting nebo kompletní koncovou službu. Předplatné nezahrnuje správu serveru, instalaci aktualizací, zakázkový vývoj ani neomezené konzultace. Aktualizace pocházejí ze standardně zveřejňovaných vydání; předplatné neobjednává samostatnou distribuci nebo individuální plán oprav.

## Partnerství a tok plateb

Klient → Promptbook: licence. Klient → agentura: její vlastní práce a servis. Klient, agentura nebo provozní partner → vybraní poskytovatelé: AI a infrastruktura dle dohody. Promptbook → agentura: partnerský podíl.

Agentura neplatí partnerský paušál ani předem nenakupuje balík klientských licencí. To neznamená bezplatné vlastní produkční používání: v takovém případě je agentura sama koncovým klientem podle licence. Podmínky podílu z vlastní licence ani vícestupňové provize nejsou touto specifikací uděleny.

Podíl je **20 % ze skutečně uhrazených licenčních plateb přivedeného klienta, bez DPH a po odečtení vratek**. Zahrnuje Start i Business. Nezahrnuje hosting, spotřebu modelů, práci agentury nebo jiná plnění. Vyplácí se z ceny licence, nepřičítá se klientovi znovu.

Pro nové dohody je schváleno 24 kalendářních měsíců od první placené aktivace konkrétní licence. Změna plánu ani přerušení plateb lhůtu neobnovují. Započítává se jen zaplacená služba v tomto okně, u přesahující roční platby poměrná část. Provize se platí do 30 dnů od inkasa; roční provize se nerozkládá po měsících. Starší odlišně přijaté dohody zůstávají zachovány. Vlastní péče partnera má samostatnou objednávku a může pokračovat i po konci provize. Nepřidávat cookie okna, pravidla last-click, výplatní minima, certifikační stupně nebo další partnerské sazby.

Při úhradě bez vratek: Start 19 USD → 3,80 USD partnerovi; Business 100 USD → 20 USD partnerovi. Nad rámec toho agentura fakturuje vlastní práci podle své nabídky.

## Servisní SLA Business

Běžné dotazy a péči o řešení zajišťuje agentura. Za každou instanci má Promptbook jeden pověřený technický kontakt, typicky z agentury. Hlášení problému platformy se posílá na **jiri@ptbk.io**.

První věcná reakce do **16 pracovních hodin**: první posouzení, požadavek na potřebné podklady nebo návrh dalšího postupu. Automatická doručenka není reakcí.

Pracovní čas: **pondělí–pátek, 9:00–17:00, Europe/Prague, mimo české státní a ostatní svátky**. Nejde o 16 uplynulých hodin, 24/7 službu ani slib dvou kalendářních dnů. Podporovanou verzi a konfiguraci určí objednávka.

SLA negarantuje termín odstranění závady ani dostupnost serveru, aplikace nebo externích služeb. Bez nepřetržité pohotovosti, telefonní linky a servisu cizích systémů. Provoz agentů na pozadí v noci se nikdy nesmí zaměňovat s dostupností lidské podpory.

## Veřejný kód a individuální rozsah

Samostatný vývoj a neprodukční testování jsou bez licenčního poplatku za podmínek veřejné licence, bez produktové podpory a SLA. **Není to třetí cenový plán**, hostovaný SaaS free tier ani časově omezené hostované demo.

Pro produkční provoz včetně vlastního hostingu se nabízí Start nebo Business. Placená licence je potřebná v rozsahu, v němž produkční použití nepovoluje veřejná licence konkrétní verze. Již udělená práva a licence jednotlivých součástí nejsou dotčeny. Přesný rozsah oprávnění určí licenční podmínky a objednávka. Odkazovat na upstream `LICENSE.md`, neměnit jej ani tvrdit neomezené open-source produkční oprávnění.

Více instancí a nestandardní požadavky vedou k individuální nabídce, nikoli ke třetí kartě s vymyšlenou cenou nebo vyšším SLA. Nepřetržitou podporu nenabízíme. Kontaktem je Jiří Jahn, jiri@ptbk.io.

## Jazykové zobrazení a kalkulačka — 3. listopadu 2026

Ceník, karty, kalkulačka i PDF používají společné `commercialTerms.ts`. České licence se počítají pevně v Kč: Start 399, Business 1 999 za prostředí/měsíc. Anglické licence zůstávají 19 / 100 USD a do interních Kč se převedou zadaným kurzem. Kurz pro tokeny a další modelové USD náklady i uložené jednotky se nemění. České nabídky nezobrazují kurzový disclaimer. Příklady: 399 → 79,80 Kč partnerovi; 1 999 → 399,80 Kč, při plné úhradě bez vratek.

Platí jednotných 20 % pro všechny současné i budoucí softwarové plány bez rozlišování měsíční/roční sazby. Výplata do 30 dní od inkasa, s předností dřívější povinné zákonné lhůty. Nový schválený limit je 24 měsíců; samotná nová publikace nemění starší dohody. Veřejné dokumenty mají aktuální znění 2026-11-03-v4. Viz [právní stránky](new-contractual-pages.md).
