# Úplná specifikace kalkulačky ekonomiky

## Účel a dva pohledy

Kalkulačka na obou stránkách porovnává úplné náklady s ekonomickým přínosem. Nevyčísluje jen peníze pro Promptbook. Je deterministická, funguje v prohlížeči, nevolá AI ani API ceníků a nezakládá objednávku.

Tab **Mám vlastní agendu**: cena licence + AI + provoz + partner + zbývající lidská práce proti nákladům téže ruční práce. Výstupem je uvolněná kapacita, čistý přínos a návratnost nasazení, nikoli automatický přírůstek tržeb.

Tab **Nasazuji klientům**: vlastní implementace, servis a 20% podíl z licencí proti nákladům partnera. Výstupy odlišují tržby a příspěvek po zadaných nákladech. Klientem hrazená licence není celou svou hodnotou tržbou agentury.

Na `/new` je výchozí první tab, na `/new/partnership` druhý. Přepínání tabů zachová rozpracované hodnoty. Kalkulačka je stejná, liší se počáteční pohled. Obnovení příkladu vrátí Business, účetní podklady a všechny výchozí vstupy; zachová aktuální tab. Nové načtení stránky obnoví výchozí stav; hodnoty se neukládají do účtu, URL nebo úložiště prohlížeče.

## Nabídka versus modelové odhady

Obchodní konstanty vycházejí z L v1.0: Start **19 USD / 30 dní jednorázově**, Business **100 USD / instanci / měsíc**, podíl **20 %**. Nejsou volnými posuvníky návštěvníka. V UI jsou přesně dva licenční plány. Individuální nabídka a veřejný neprodukční kód nejsou další číselné tarify.

Ostatní předvyplněné hodnoty jsou ilustrativní, editovatelné a nejsou mzdovým průzkumem, ceníkem poskytovatele nebo garantovanou úsporou. Výpočet je v Kč bez DPH; USD se převádí editovatelným ilustrativním kurzem. Nezahrnuje daň z příjmů, financování, nevyplněné režie ani automaticky odhadnuté dodatečné tržby.

## Jednotka a období

Business: jedna klientská instance, měsíční období. Více instancí u téhož klienta násobí **jen licenci**. Ostatní náklady, objem práce a čas se zadávají za **celého jednoho klienta**, včetně jeho případných více instancí. Sdílený server se uvádí odpovídajícím podílem nákladů, nikoli zaměňuje s licencí.

Start: vždy jedna instance pro jednoho koncového klienta a přesně jeden 30denní pilot. Horizont i počet instancí jsou ve výpočtu pevně 1; příslušná pole se skryjí. Vstupy objemu, práce, AI a ostatních služeb se interpretují za celých 30 dní. Při návratu na Business zůstanou dříve zadaný horizont a počet instancí zachovány. Start nepřidá další měsíce nebo automatický Business. Každý klient v pilotním partnerském portfoliu musí mít vlastní nárok na svůj jediný pilot; kalkulačka nárok neověřuje ani neuděluje.

## Scénáře a výchozí pracovní předpoklady

| Scénář | Položek za období | Jednotek na položku | Ruční minuty na celou položku | Kč/h | Zbylá práce | Dohled h | Vstupní / výstupní tokeny na jednotku | Další služby Kč/jednotku | Hosting Kč |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | ---: | ---: |
| E-maily a komunikace | 500 e-mailů | 3 zprávy v kontextu | 6 | 500 | 30 % | 2 | 4 000 / 600 | 0 | 500 |
| Účetní podklady | 300 dokladů | 2 strany | 8 | 550 | 25 % | 2 | 5 000 / 800 | 0 | 500 |
| Sociální sítě | 20 témat | 3 sítě | 90 | 700 | 25 % | 2 | 16 000 / 4 000 | 10 | 500 |
| Video → obsah | 8 videí | 30 minut videa | 240 | 800 | 25 % | 2 | 2 000 / 600 | 1 | 900 |
| Web, který se udržuje | 12 úkolů | 1 web | 75 | 1 200 | 30 % | 2 | 180 000 / 18 000 | 0 | 900 |

Tokeny pokrývají celý pracovní postup na jednotku, včetně kontextu a nástrojových kroků, ne jen jednu modelovou odpověď. Ruční čas se naopak zadává za **celou položku**. Například 90 minut pro sociální sítě již pokrývá celé téma pro všechny zadané sítě; nenásobí se počtem sítí znovu.

Změna scénáře přepíše jen pracovní předpoklady uvedené v tabulce. Zachová plán, kurz, způsob placení AI, vlastní tokenové ceny, servis, nasazení, horizont i partnerské hodnoty. Výchozí scénář jsou účetní podklady.

## Všechny vstupy

### Společné a pracovní

Scénář; plán; způsob placení AI (**tokeny / vlastní předplatné / lokální model**); plátce AI a ostatního provozu (**klient samostatně / partner v ceně servisu**). Výchozí Business, tokeny, klient samostatně.

Kurz USD → Kč: **22**, bez živé aktualizace. Počet instancí na klienta: **1**. Objem položek, jednotek na položku, ruční minuty na položku, plně zatížený hodinový náklad člověka, procento zbývající lidské práce a dodatečný dohled: podle tabulky scénářů.

Hodinový náklad může představovat zaměstnance včetně souvisejících nákladů nebo sazbu externího dodavatele: asistent, účetní, social media manažer, copywriter nebo vývojář. Bez nesprávného ztotožnění hrubé mzdy a úplných nákladů firmy.

### AI

Vstupní a výstupní tokeny na jednotku; ceny za milion tokenů: **3 / 15 USD**. Cena vlastního AI předplatného: **1 500 Kč za období**, používá se jen v režimu předplatného. Další služby za jednotku podle scénáře (např. OCR, obrázky, přepis). Rezerva na měřenou spotřebu: **25 %**.

Předplatné nahrazuje tokenový účet, nepřičítá se k němu. Dostupnou kapacitu, automatizovaný provoz a další poplatky ověřuje uživatel u poskytovatele; příplatky může zahrnout do ostatních nástrojů. Lokální model má nulový externí tokenový účet, ale nikoli nulový hardware, energii nebo server. Výkon a kvalita nejsou garantované.

### Provoz za celého klienta a období

Hosting: podle scénáře. Databáze: **0 Kč**, pokud je již v serveru. Zálohy a úložiště: **100 Kč**. Ostatní nástroje: **0 Kč** (licence, monitoring, doména, e-mailing, rendering). Elektřina: **0 Kč**, pokud je již v hostingu. Rozpočítaný hardware: **0 Kč**; ekonomický náklad, ne nutně výdaj tohoto měsíce. Položky nemají být započítané zároveň v pronájmu i samostatně.

Cena servisu partnera: **2 500 Kč za klienta a období**. Při vlastní správě ji lze nastavit na nulu a zahrnout vlastní čas do dohledu. Plátce „partner v ceně servisu“ znamená, že tato cena obsahuje všechny rozepsané AI a provozní položky, nejde o další přirážku automaticky připočtenou nad servis.

Cena nasazení účtovaná klientovi: **15 000 Kč**, jednou. Horizont Business: **12 měsíců**, editovatelný; Start vždy 30 dní.

### Partnerské vstupy

Počet aktivních klientů: **10**. Skutečně uhrazená část licencí: **100 %**. Vratky z uhrazených licencí: **0 %**. Tyto dvě hodnoty ovlivňují podíl partnera, nikoli standardní cenový odhad licence jednoho klienta.

Obsluha jednoho klienta: **2 hodiny za období**. Interní náklad partnera: **600 Kč/h**. Implementace jednoho klienta: **12 hodin**. Náklady na získání jednoho klienta: **2 000 Kč jednorázově**. Další režie celého portfolia: **2 000 Kč za období**, ne za každého klienta.

Výše 20% podílu je viditelná pevná podmínka. Pole délky provize nebo 12měsíční strop neexistují. Výpočet předpokládá trvající placené užívání a partnerskou dohodu po celý zvolený horizont; zobrazený horizont není příslibem doživotních plateb.

## Vzorce klientské ekonomiky

Označení: `V` položek, `U` jednotek na položku, `I/O` tokenů na jednotku, `Pi/Po` USD za milion tokenů, `K` Kč/USD, `M` počet období (Start 1), `N` instancí (Start 1).

- Licence = `(Start 19, Business 100) × N × K`.
- Jednotky = `V × U`.
- Tokeny = `V × U × (I × Pi + O × Po) / 1 000 000 × K`.
- AI = tokeny, nebo uvedené předplatné, nebo nula pro lokální model.
- Další služby = `V × U × cena služby za jednotku`.
- Rezerva = `(měřený tokenový účet + další služby) × rezerva %`; pevné AI předplatné a fixní infrastruktura se do rezervy nezapočítají.
- Ostatní provoz = AI + další služby + rezerva + hosting + databáze + zálohy/úložiště + elektřina + rozpočítaný hardware + ostatní nástroje.
- Klientský provoz bez interní práce = licence + servis + ostatní provoz **jen když ho klient platí samostatně**.
- Ruční hodiny = `V × ruční minuty celé položky / 60`.
- Zbývající hodiny = ruční hodiny × ponechaná práce % + dodatečný dohled.
- Uvolněná kapacita = ruční hodiny − zbývající hodiny; může být záporná.
- Výchozí náklad práce = ruční hodiny × hodinový náklad.
- Zbývající práce = zbývající hodiny × stejný hodinový náklad.
- Celkový ekonomický náklad = klientský provoz bez interní práce + zbývající práce.
- Přínos za období = výchozí náklad práce − celkový ekonomický náklad.
- Náklad za horizont = ekonomický náklad × M + jednorázové nasazení.
- Přínos za horizont = výchozí náklad práce × M − náklad za horizont.
- Návratnost = jednorázové nasazení / kladný přínos za období. Při nekladném přínosu „Nevychází“. Nulové nasazení při kladném přínosu: „Bez vstupního nákladu“.

Business návratnost je v měsících a předpokládá rovnoměrný přínos. Start může uvést návratnost ve dnech (`podíl období × 30`) pouze do 30 dní; jinak „Nevychází“. Levný pilot se nikdy neextrapoluje do dalších měsíců.

## Vzorce partnera

Označení `C` počet klientů. Stejný klientský profil platí pro všechny, nejde o simulaci růstu nebo směs typů klientů.

- Čisté uhrazené licence = `C × cena licence × uhrazená část % × (1 − vratky %)`.
- Partnerský podíl = čisté uhrazené licence × **20 %**.
- Servisní tržby = `C × cena servisu`.
- Tržby za období bez implementace = servisní tržby + partnerský podíl.
- Náklady na AI/provoz hrazené partnerem = `C × ostatní provoz`, pouze když je zvolen plátce partner; jinak nula.
- Náklad obsluhy období = `C × hodiny obsluhy × interní hodinový náklad + režie portfolia + provoz hrazený partnerem`.
- Příspěvek období = tržby období − náklad obsluhy období.
- Implementační tržby = `C × cena nasazení`.
- Náklady implementace/akvizice = `C × (implementační hodiny × interní hodinový náklad + náklad získání klienta)`.
- Tržby za horizont = tržby období × M + implementační tržby.
- Náklady za horizont = náklady obsluhy × M + náklady implementace/akvizice.
- Příspěvek za horizont = tržby za horizont − náklady za horizont, před daní z příjmů.

Business MRR = tržby období bez implementace, za předpokladu pokračujícího placení a dohody. **Start MRR = 0**. Pilot má samostatný výsledek za 30 dní a jednorázovou implementaci. Případné pokračování na Business vyžaduje nové rozhodnutí/objednávku a nepromítá se do výsledku Startu.

Licence hrazená klientem Promptbooku je v partnerském výsledku pouze informativní základ podílu, ne další servisní tržba. Pokud partner přebírá AI/provoz do vlastní ceny, klient nesmí dostat tyto náklady přičtené podruhé a partner je musí mít odečtené od svého výsledku.

## Zobrazení výsledků

Klient: výrazný přínos za období, uvolněné hodiny, návratnost, srovnávací pruhy ruční práce / práce s agendou, úplný rozpad nákladů, jednorázové nasazení a čistý přínos za horizont. Výslovně označit kapacitu versus hotovostní úsporu mezd; nepředpovídat konverze, nové tržby nebo automatické snižování počtu zaměstnanců.

Partner: výrazné tržby za období, zvlášť služby, základ podílu a podíl; náklady obsluhy, režie a případný vlastní provoz; příspěvek; jednorázové nasazení; celkový výsledek za horizont. Rozbalitelný úplný klientský rozpad. Start výslovně ukazuje nulové opakované měsíční tržby.

Rozpad ukazuje součásti AI a infrastruktury i při plátci partner; jsou označené jako zahrnuté v jeho servisu. Mezivýsledky nejsou další náklady. Partnerský podíl se klientovi nepřičítá.

Záporné výsledky nezakrývat ani nezastropovat na nule. Finanční částky se v UI zaokrouhlují na celé Kč, hodiny/návratnost na jedno desetinné místo; výpočty a export zachovávají nekrácené hodnoty. Dílčí zaokrouhlení se mohou lišit od součtu o korunu.

## Formulář, limity a export

Základní vstupy jsou viditelné, tokeny, infrastruktura a detailní partnerské náklady v pojmenovaných rozbalovacích blocích. U vstupů jsou jednotky a vysvětlení předpokladů. Prázdná rozpracovaná číselná hodnota nemění výsledek na NaN; při opuštění pole se vrátí poslední platná hodnota.

Běžná čísla: 0 až 1e9, záporné na 0, nečíselné/ne-konečné při přímém výpočtu na 0. Kurz 0,01 až 1 000. Horizont Business celé 1–120, instance celé 1–100, klienti celí 0–5 000. Procenta zbývající práce, plateb a vratek 0–100, rezerva 0–500. Nuloví klienti znamenají nulové tržby, ale zachování uvedené fixní režie.

„Stáhnout výpočet“ vytvoří UTF-8 textový soubor `promptbook-{company|partner}-{scenario}.txt` lokálně. Obsahuje scénář, režim, verzi obchodního modelu, období, podmínky podílu, upozornění a všechny normalizované vstupy i výsledky. Úspěch a selhání mají přístupnou zprávu; selhání nemaže výpočet. „Ověřit předpoklady“ otevře e-mail na jiri@ptbk.io s názvem scénáře v předmětu, neposílá automaticky všechny hodnoty.
