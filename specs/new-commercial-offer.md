# Obchodní nabídka, licence a servisní SLA

Autorita: podklad L, verze 1.0 z 15. října 2026; jde o návrh nabídky, nikoli novou smlouvu. Stejné částky a podmínky platí v obou stránkách, metadatech, kalkulačce a exportu.

## Nabídka má přesně dva plány

| Vlastnost | Start | Business |
| --- | --- | --- |
| Cena bez DPH | 19 USD za 30 dní, jednorázově | 100 USD měsíčně za instanci |
| Účel | Vyzkoušení jedné agendy v reálném provozu | Průběžný firemní provoz |
| Licence | Jedna klientská instance po dobu pilotu | Jedna klientská instance po dobu předplatného |
| Produktová podpora Promptbooku | Není zahrnuta | První posouzení hlášených problémů platformy |
| SLA | Žádné | První věcná reakce do 16 pracovních hodin |

Start je dostupný jednou pro koncového klienta. Po 30 dnech se automaticky neobnovuje. Pokračování v rámci této komerční licence vyžaduje objednání Business. Web ani kalkulačka nepředpokládají automatický převod, opakované piloty, roční Start nebo bezplatné tokeny. Pilot je produkční, nikoli pouze demo.

Business se platí měsíčně, bez ročního závazku; lze jej ukončit pro další fakturační období. Neexistuje roční sleva, závazek na rok nebo nově vymyšlená garance vrácení peněz. Horizont kalkulačky není smluvní závazek.

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

Vyúčtování je měsíční po dobu placeného užívání a trvání partnerské dohody. Není zde automatický konec po 12 měsících ani bezpodmínečný doživotní nárok. Přiřazení klienta, splatnost a ukončení nároku upraví partnerská dohoda. Nepřidávat cookie okna, pravidla last-click, výplatní minima, certifikační stupně nebo další partnerské sazby.

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

## Jazykové zobrazení cen — 24. října 2026

Hlavní, partnerská a cenová stránka používají klasické porovnatelné karty dvou plánů Start a Business. Na českých stránkách se nabídka prezentuje přímo jako Start 400 Kč na 30 dní a Business 2 200 Kč měsíčně za prostředí, bez DPH. Bez poznámky „přepočet při 22 Kč/USD“ a bez výplňkových vysvětlivek o převodu. Anglická verze používá původních 19 / 100 USD. Partnerský příklad je 2 200 → 440 Kč, respektive 100 → 20 USD. Ceny, obsah nabídky, interní převodní konstanta, výpočet, editovatelný modelový kurz, zaokrouhlení a uložené parametry zůstávají beze změny. Kalkulačka a PDF zachovávají podstatné výpočetní předpoklady. Konečné platební podmínky stanoví objednávka.

Večerní cenové rozhodnutí 25. října 2026: česká veřejná nabídka Start je zaokrouhlena na **400 Kč**; anglická zůstává **19 USD**. Business zůstává 2 200 Kč / 100 USD. Jde o samostatnou českou nabídkovou cenu, nikoli změnu interního kurzu nebo původního editovatelného USD modelu kalkulačky.
