# Obchodní nabídka, licence a servisní SLA

Autorita: konečné schválení vlastníka z 3. listopadu 2026, znění **2026-11-03-v5**. Web publikuje aktuální nabídku. Přijaté objednávky mají vlastní sjednaný mechanismus změn; nové zveřejnění je zpětně nepřepisuje.

## Dva plány za projekt enginu

| Parametr | Start | Business |
| --- | --- | --- |
| Cena měsíčně bez DPH | 399 Kč | 1 999 Kč |
| Anglická základní nabídka | 19 USD | 100 USD |
| Aktivovaní odborní agenti | 3 | 10 v ceně |
| Ovládající uživatelé | 1 | 5 v ceně |
| Připojené instance harnessů | 1 | Bez licenčního limitu počtu |
| Oddělené webové profily | 1 | 5 v ceně |
| Core a systémové role | Mimo limit odborníků | Mimo limit odborníků |
| Pravidelné spouštění a nepřetržitý provoz | Ano | Ano |
| Podpora výrobce | Bez garantované reakce | První věcné posouzení do 16 pracovních hodin |
| Další kapacita | Přechodem na Business | Předem povolenými příplatky |

Oba plány jsou dlouhodobě použitelná měsíční předplatná bez ročního závazku. Start nemá povinný konec po 30 dnech. Obnovení lze zrušit před dalším obdobím. Oba může spravovat klient sám nebo agentura.

Jednotkou je samostatný **projekt enginu** s vlastními agenty, pravidly a oprávněními. Agenda je příklad použití, ne smluvní hranice. Firma může kombinovat více projektů obou plánů. Server, firma, jednotlivý úkol ani přihlášení nejsou jednotkou licence. Migrace ani přejmenování nový projekt nevytvářejí. Interní parametr kalkulačky `instancesPerClient` zůstává kompatibilní a nově je popsaný jako počet projektů.

## Počítání kapacity

- Odborník je aktivovaná pracovní role i při čekání. Archivované definice a šablony nečerpají kapacitu. Výměna role nevytváří další celý měsíční poplatek. Core komunikace, směrování, učení a oprav je mimo limit; rozhoduje skutečná funkce, ne název.
- Ovládající uživatel je konkrétní oprávněný člověk zadávající nebo měnící práci. Více zařízení je jeden člověk. Technik agentury se počítá stejně jako klientův člověk; pouhý příjemce výstupu ani kontakt s podporou místo nečerpá.
- Instance harnessu je aktivní připojená konfigurace a přihlašovací kontext. Úlohy a relace nad stejnou konfigurací nejsou další instance. Vlastní pravidla a úhrady poskytovatelů platí samostatně.
- Webový profil odděluje přihlašovací identitu. Jeden profil může používat mnoho webů, záložek a integrací bez jejich samostatného započtení.

## Příplatky Businessu

| Další kapacita nad základ | Kč měsíčně bez DPH |
| --- | ---: |
| Odborný agent | 99 |
| Ovládající uživatel | 99 |
| Oddělený webový profil | 49 |

Účtuje se kapacita nad základ **poměrně podle doby aktivace** v období, nikoli vytížení nebo zprávy. Polovina období znamená polovinu sazby. Placené rozšíření potřebuje předchozí výslovný souhlas klienta a dohodnutý měsíční rozpočet. Výchozí je bez automatického přečerpání: upozornění před limitem, nepovolená kapacita se neaktivuje a cena se sama nemění. Rozpracované úlohy se neruší. Podklad vyúčtování je kontrolovatelný záznam kapacity a doby.

Za celý měsíc: 15 odborníků a 7 lidí = 1 999 + 5 × 99 + 2 × 99 = **2 692 Kč**, provize **538,40 Kč** v původním 24měsíčním okně. Anglický web ponechá základ $19/$100, ale nové příplatky uvádí v přesně schválených Kč; měnu fakturace určí objednávka. Nevytvářet vlastní dolarové sazby.

Upgrade zachová projekt a data, vyžaduje potvrzení placené změny. Downgrade nastane v dalším období až po splnění kapacit Startu. Upgrade ani příplatky neobnovují provizní okno. Nezavádět licenční kvóty úloh, tokenů, souběhu, normostran znalostí nebo kontextu.

## Oddělené platby a podpora

Klient platí licenci Promptbooku, samostatně agentuře za návrh, instalaci, integrace, školení a péči. AI účty, tokeny, hosting, databáze, úložiště a externí služby platí klient nebo partner podle dohody. Podpora výrobce je odlišná od práce agentury. Licence neposkytuje spravovaný hosting, správu serveru ani individuální distribuční větev.

Business poskytuje první věcné posouzení hlášení platformy, žádost o nezbytné podklady nebo návrh dalšího postupu do **16 pracovních hodin**, pondělí–pátek **9:00–17:00 Europe/Prague mimo české svátky**. Automatická doručenka nestačí. Jeden technický kontakt klienta nebo agentury, **jiri@ptbk.io**. Nejde o garanci termínu opravy, dostupnosti nebo nepřetržitou pohotovost. Podporovanou verzi určí objednávka; pravidla vydání se touto změnou nemění.

## Partnerská provize

Jednotných **20 % skutečně zaplacené softwarové ceny včetně všech placených softwarových příplatků Promptbooku**, bez DPH po slevách a přípustných vratkách; poplatek brány základ nesnižuje. Stejně pro všechny současné i budoucí plány a fakturační režimy. AI, infrastruktura a vlastní práce jsou mimo základ.

Prvních **24 kalendářních měsíců od první placené aktivace konkrétní licence**, bez restartu při změně plánu, rozšíření nebo přerušení. Přesahující roční platba má poměrný základ. Splatnost do 30 dní od inkasa, s předností dřívější kogentní lhůty; roční provize se nevyplácí po dvanáctinách. Starší přijaté odlišné dohody zůstávají zachovány. Agentura nemá partnerský paušál ani povinné balíky licencí. Vlastní služby může poskytovat i po skončení provize.

## Web a hranice implementace

Hlavní a partnerská stránka ukazují karty Start a Business a odkazují na společný ceník `/cs/pricing` a `/en/pricing`. Ten navíc uvádí Free pro vlastní instalaci podle veřejné licence dané verze, individuálně sjednávaný Enterprise, kapacitní příplatky a partnerský podíl. Kalkulačka, textový export a PDF počítají základ vybraného předplatného Start nebo Business. Kapacitní příplatky jsou samostatná položka. CZ licence jsou pevně v Kč a EN základ v USD. Uložené jednotky, kurz pro externí náklady a query zůstávají kompatibilní.

Tato změna publikuje nabídku a podmínky; neimplementuje měření kapacity, vymáhání licence v enginu ani Stripe. Před provozním účtováním rozšíření musí existovat souhlas, záznam aktivace, ochrana proti dvojímu účtování a kontrolovatelné vyúčtování respektující rozpočet.

Samostatný vývoj a neprodukční testování v nabídce Free se řídí veřejnou licencí konkrétní verze. Přesný grant stanoví licence a objednávka. Neveřejné podíly, rozpočty a odkupy Neonmedia zůstávají mimo tento repozitář.
