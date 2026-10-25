# Kalkulačka: rychlá a pokročilá

## Účel

Vyčíslit úplné náklady, hodnotu uvolněné práce a ekonomiku partnerské služby. Nikoli pouze licenci Promptbooku. Výpočet je deterministický v prohlížeči, nevolá AI nebo živý cenový API endpoint a nezakládá objednávku.

Oba režimy používají stejný model. **Pro mou firmu** porovnává ruční práci s automatizací včetně lidské kontroly. **Nasazuji klientům** ukazuje implementaci, servis a 20% licenční podíl proti partnerovým nákladům. Tržby nejsou zisk, uvolněné hodiny nejsou automaticky ušetřené mzdy.

## Rychlá kalkulačka

Na `/[locale]` výchozí firemní režim; na `/[locale]/partnership` partnerský. Výchozí scénář sociální sítě (včetně jejich pracovních odhadů), první také v seznamu, plán Business, horizont 12 měsíců. Karta jasně vystupuje ze stránky: velké kulaté rohy, stín, jeden společný tmavě modrý povrch pro nadpis, vstupy, výsledek a akce. Výsledek odděluje jemná linka, nemá další zaoblenou kartu ani vlastní stín. Působí jako interaktivní finanční kalkulačka, ne jako další textová sekce.

Viditelné vstupy jsou pouze scénář a nejdůležitější čísla. Firma: objem práce a náklad na člověka za hodinu. Partner: počet aktivních klientů a servis za klienta. Objem/počet klientů lze upravit číslem i posuvníkem. Partnerský podíl je viditelně **pevně 20 %**, bez výběru.

Přínos musí být zřejmý při rychlém skenování: **„Za 12 měsíců můžete ušetřit v hodnotě práce 100 854 Kč“** nebo **„Za 12 měsíců vám může zbýt po nákladech … Kč“**. Částka není vytržená z věty a zvoleného období. Při záporném výsledku se věta změní na převýšení nákladů a výsledek se nezakrývá.

Doplňkové metriky: u firmy uvolněné hodiny a provoz bez interní práce; u partnera tržby a náklady obsluhy za období. Stručná poznámka vysvětluje odhad a rozdíl mezi kapacitou/hotovostí nebo tržbami/ziskem. Není zde plný formulář tokenů, vratek, režie, akvizice a implementace.

**Pokročilá kalkulačka** otevře `/[locale]/kalkulacka` se všemi rozpracovanými hodnotami v GET, ne prázdný nový příklad. **Stáhnout PDF výpočet** otevře kontaktní e-mailovou bránu. **Obnovit příklad** vrátí výchozí odhady a scénář, zachová režim. Ikona a text jsou uvnitř jednoho tlačítka na jednom řádku, bez zalomení či odděleného klikacího prvku i na mobilu.

## Pokročilá kalkulačka `/[locale]/kalkulacka`

Přebírá stejné primární ovládání a výsledkovou kartu. K tomu plán a logicky pojmenované rozbalovací skupiny: práce a kontrola; AI a externí služby; server a provoz; nasazení, servis a licence; partnerovy náklady a úhrady. Partner má navíc objem práce jednoho klienta. V každé skupině jsou významy a jednotky vstupů.

Plné výsledky ukazují i nákladové mezisoučty, ruční základ, zbývající práci, jednorázové nasazení a návratnost. Partnerský pohled odděluje servis, podíl, obsluhu, implementaci, akvizici a horizont. Rozpad klientových nákladů je dostupný také partnerovi.

GET a PDF jsou úplně specifikované v [kontaktu a exportu](new-contact-and-pdf.md). Změna scénáře přepíše jen pracovní předpoklady níže, nikoli plán, tokenové ceny, kurz, servisní cenu nebo partnerské vstupy. Přepínání režimů uchová model.

## Pevná nabídka

Start **19 USD jednorázově na 30 dní**, Business **100 USD za prostředí a měsíc**, podíl **20 %**. Tyto hodnoty nejsou vstupy a URL je nesmí přepsat. Přesné právní podmínky určuje [obchodní nabídka](new-commercial-offer.md). V kalkulačce neexistuje třetí bezplatný ani libovolně nacenitelný tarif.

Ostatní hodnoty jsou editovatelné ilustrativní odhady, ne průzkum mezd, skutečné tarify providerů nebo zaručená úspora. Částky jsou v Kč bez DPH. USD převádí editovatelný modelový kurz, nikoli aktuální kurzová služba.

## Období a prostředí

Business: měsíční období a zvolený horizont. Počet samostatných prostředí jednoho klienta násobí **jen licenci**. Veškerá práce, AI, hosting a jiné náklady se zadávají za **celého klienta**, ne automaticky za každou instanci.

Start: vždy jedna instance a jeden 30denní pilot. Měsíční pracovní/nákladové vstupy se interpretují za celých 30 dní. Skutečný výpočet normalizuje horizont a instance na 1 a tato pole při Startu nejsou aktivní. Formulář a URL ale uchovají předchozí Business hodnoty pro návrat k Business. Start se neprodlouží, nepřevede automaticky a nikdy nevytvoří MRR. Každý klient musí mít nárok na svůj jediný Start; kalkulačka oprávnění neuděluje ani neověřuje.

## Scénáře a odhady

| Scénář | Položky / měsíc | Jednotky / položku | Minuty ručně / celou položku | Kč/h | Zbylá práce | Dohled h | Vstupní / výstupní tokeny na jednotku | Externí služba Kč/jednotku | Hosting Kč |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | ---: | ---: |
| E-maily | 500 | 3 zprávy | 6 | 500 | 30 % | 2 | 4 000 / 600 | 0 | 500 |
| Účetní podklady | 300 | 2 strany | 8 | 550 | 25 % | 2 | 5 000 / 800 | 0 | 500 |
| Sociální sítě | 20 témat | 3 sítě | 90 | 700 | 25 % | 2 | 16 000 / 4 000 | 10 | 500 |
| Video → obsah | 8 videí | 30 minut | 240 | 800 | 25 % | 2 | 2 000 / 600 | 1 | 900 |
| Web | 12 úkolů | 1 web | 75 | 1 200 | 30 % | 2 | 180 000 / 18 000 | 0 | 900 |

Ruční čas je za **celou položku**, například celé téma pro všechny sítě, a počtem sítí se znovu nenásobí. Tokeny pokrývají celý postup na jednotku včetně kontextu a nástrojových kroků. Nejde jen o jeden modelový dotaz.

## Úplné vstupy a jejich výchozí hodnoty

Společné enumy: režim firma/partner; scénář výše; plán Business/Start; AI **tokeny / předplatné / lokální model** (výchozí tokeny); plátce AI/provozu **klient samostatně / partner v ceně servisu** (výchozí klient).

Číselné vstupy:

| Skupina | Hodnoty |
| --- | --- |
| Období a licence | kurz USD/Kč 22; prostředí na klienta 1; horizont Business 12 měsíců |
| Práce | objem, jednotky na položku, ruční minuty celé položky, celkový hodinový náklad, zbylá lidská práce %, dohled — podle scénáře |
| AI | vstup 3 USD / milion; výstup 15 USD / milion; tokeny podle scénáře; předplatné 1 500 Kč/měsíc; rezerva 25 %; externí služba podle scénáře |
| Provoz | server podle scénáře; databáze 0; zálohy/úložiště 100; jiné nástroje 0; elektřina 0; rozpočítaný hardware 0 Kč/měsíc |
| Služby | servis partnera 2 500 Kč za klienta/měsíc; nasazení 15 000 Kč jednorázově |
| Partner | klienti 10; uhrazené licence 100 %; vratky 0 %; obsluha 2 h/klienta/měsíc; interní náklad 600 Kč/h; implementace 12 h/klienta; akvizice 2 000 Kč/klienta; režie portfolia 2 000 Kč/měsíc |

Hodinový náklad představuje celkový náklad zaměstnavatele nebo sazbu externího dodavatele, ne automaticky hrubou mzdu. Při samostatné správě lze servis dát na 0 a vlastní práci uvést do dohledu. Režie portfolia se neúčtuje znovu za každého klienta.

AI předplatné **nahrazuje tokenový účet**, nepřičítá se. Příplatky a podporovaný automatizovaný provoz musí uživatel ověřit u poskytovatele. Příplatky lze zadat do ostatních nástrojů. Lokální režim má nulový externí tokenový účet, ale stále uvedené náklady hardwaru a provozu. Co je v hostingu, nezapočítávat znovu zvlášť.

## Výpočet klienta

`V` položek, `U` jednotek na položku, `I/O` tokenů na jednotku, `Pi/Po` cena USD/milion, `K` Kč/USD, `M` období, `N` licencovaných prostředí. U Startu `M=N=1`.

- Licence = `(Start 19 nebo Business 100) × N × K`.
- Jednotky = `V × U`; tokenový účet = `V × U × (I×Pi + O×Po) / 1 000 000 × K`.
- AI = tokenový účet, nebo cena předplatného, nebo 0 při lokálním modelu.
- Externí služby = `V × U × cena služby za jednotku`.
- Rezerva = `(jen měřený tokenový účet + externí služby) × rezerva %`. Nezvyšuje pevné předplatné ani fixní infrastrukturu.
- Infrastruktura = server + databáze + zálohy + elektřina + rozpočítaný hardware.
- Ostatní provoz = AI + externí služby + rezerva + infrastruktura + ostatní nástroje.
- Provoz placený klientem = licence + servis partnera + ostatní provoz **jen při plátci klient**.
- Ruční hodiny = `V × ruční minuty celé položky / 60`.
- Zbývající hodiny = ruční hodiny × zbylá práce % + dohled.
- Uvolněné hodiny = ruční hodiny − zbývající hodiny (mohou být záporné).
- Ruční náklad = ruční hodiny × hodinový náklad; zbývající práce = zbývající hodiny × stejný hodinový náklad.
- Celkový ekonomický náklad = provoz placený klientem + zbývající práce.
- Přínos období = ruční náklad − celkový ekonomický náklad.
- Náklad horizontu = ekonomický náklad × M + jednorázové nasazení.
- Přínos horizontu = přínos období × M − nasazení.
- Návratnost = nasazení / kladný přínos období. Při nekladném přínosu není. Při nasazení 0 a kladném přínosu je bez vstupního nákladu. Start neuvádí návratnost za více než 30 dní; vhodný podíl období převádí na dny.

## Výpočet partnera

`C` aktivních klientů se stejným profilem, od prvního měsíce a po celý horizont. Není to růstový model ani predikce odchodů.

- Čisté uhrazené licence = `C × licence × uhrazené % × (1 − vratky %)`.
- Podíl = čisté uhrazené licence × **20 %**.
- Servisní tržby = `C × cena servisu`.
- Tržby období bez implementace = servisní tržby + podíl.
- Provoz hrazený partnerem = `C × ostatní provoz`, pouze když je zvolen partner; jinak 0.
- Náklad obsluhy = `C × hodiny obsluhy × interní náklad/h + režie portfolia + provoz hrazený partnerem`.
- Příspěvek období = tržby období − náklad obsluhy.
- Implementační tržby = `C × cena nasazení`; náklad implementace = `C × (implementační hodiny × interní náklad/h + akvizice)`.
- Celkové tržby = tržby období × M + implementační tržby.
- Celkové náklady = náklad obsluhy × M + náklad implementace.
- Výsledek horizontu = celkové tržby − celkové náklady, před daní z příjmů.
- Business MRR = tržby období bez implementace; **Start MRR = 0**.

Podíl není další poplatek klientovi. Celá klientova licence není tržbou agentury. Při plátci partner je uvedený servis včetně AI/provozu; model tyto náklady nepřičte klientovi podruhé, ale odečte partnerovi. Více klientů neodstraňuje náklad času a servisu.

## Vstupní validace a zobrazení

Běžná čísla 0–1e9; kurz 0,01–1 000; Business horizont celé 1–120; prostředí celé 1–100; klienti celí 0–5 000. Zbylá práce/úhrady/vratky 0–100 %, rezerva 0–500 %. Přímý výpočet normalizuje ne-konečné a záporné hodnoty; URL parser používá výchozí hodnoty pro nečíselné vstupy. Podíl není editable pole.

Rozpracované prázdné číselné pole nesmí vyvolat NaN/Infinity. Záporné výsledky jsou skutečně zobrazené a doplněné správným slovním významem. Nuloví klienti mají nulové tržby, ale zachovanou fixní režii. Nulový objem práce nevynuluje fixní náklady a dohled.

Kč v UI zaokrouhlit na celé koruny, čas/návratnost na jedno desetinné místo. Výpočet zachovává přesné hodnoty, PDF může ukázat haléře. Součet jednotlivě zaokrouhlených řádků se může o korunu lišit; mezisoučty se znovu nepřičítají jako další náklady. Výše úspor není slibem nových tržeb z publikovaného obsahu.

Večerní upřesnění 25. října 2026: „pop-up“ zde znamená vizuálně vystupující panel v běžném toku stránky, nikoli modální okno. Formulář, jeho chování a původní jednotky/model zůstávají zachované; sjednocuje se prezentace celého nástroje.
