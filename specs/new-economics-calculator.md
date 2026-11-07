# Kalkulačka: rychlá a pokročilá

## Účel

Vyčíslit úplné náklady, hodnotu uvolněné práce a ekonomiku partnerské služby. Nikoli pouze licenci Promptbooku. Výpočet je deterministický v prohlížeči, nevolá AI nebo živý cenový API endpoint a nezakládá objednávku.

Oba režimy používají stejný model. **Pro mou firmu** porovnává ruční práci s automatizací včetně lidské kontroly. **Nasazuji klientům** ukazuje implementaci, servis a 20% licenční podíl proti partnerovým nákladům. Tržby nejsou zisk, uvolněné hodiny nejsou automaticky ušetřené mzdy.

## Rychlá kalkulačka

Na `/[locale]` výchozí firemní režim; na `/[locale]/partnership` partnerský. Výchozí scénář sociální sítě (včetně jejich pracovních odhadů), první také v seznamu, plán Business, horizont 12 měsíců. Karta jasně vystupuje ze stránky: velké kulaté rohy, stín, jeden společný tmavě modrý povrch pro nadpis, vstupy, výsledek a akce. Výsledek odděluje jemná linka, nemá další zaoblenou kartu ani vlastní stín. Působí jako interaktivní finanční kalkulačka, ne jako další textová sekce.

Viditelný vstup je scénář a u firmy objem práce nebo u partnera počet aktivních klientů. Objem i počet klientů lze upravit číslem nebo posuvníkem. Náklad na člověka, cenu servisu a další předpoklady lze upravit v pokročilé kalkulačce. Podíl zůstává pevně 20 %.

Přínos musí být zřejmý při rychlém skenování: **„Za 12 měsíců můžete ušetřit v hodnotě práce 100 854 Kč“** nebo **„Za 12 měsíců vám může zbýt po nákladech … Kč“**. Částka není vytržená z věty a zvoleného období. Při záporném výsledku se věta změní na převýšení nákladů a výsledek se nezakrývá.

Rychlá kalkulačka ukazuje hlavní odhad a krátkou poznámku o zvoleném předplatném a kapacitních příplatcích. Uvolněné hodiny, provoz, tržby i náklady obsluhy jsou v pokročilé kalkulačce.

**Pokročilá kalkulačka** otevře `/[locale]/kalkulacka` se všemi rozpracovanými hodnotami v GET, ne prázdný nový příklad. **Stáhnout PDF výpočet** otevře kontaktní e-mailovou bránu. **Obnovit příklad** vrátí výchozí odhady a scénář, zachová režim. Ikona a text jsou uvnitř jednoho tlačítka na jednom řádku, bez zalomení či odděleného klikacího prvku i na mobilu.

## Pokročilá kalkulačka `/[locale]/kalkulacka`

Přebírá stejné primární ovládání a výsledkovou kartu. K tomu plán a logicky pojmenované rozbalovací skupiny: práce a kontrola; AI a externí služby; server a provoz; nasazení, servis a licence; partnerovy náklady a úhrady. Partner má navíc objem práce jednoho klienta. V každé skupině jsou významy a jednotky vstupů.

Plné výsledky ukazují i nákladové mezisoučty, ruční základ, zbývající práci, jednorázové nasazení a návratnost. Partnerský pohled odděluje servis, podíl, obsluhu, implementaci, akvizici a horizont. Rozpad klientových nákladů je dostupný také partnerovi.

GET a PDF jsou úplně specifikované v [kontaktu a exportu](new-contact-and-pdf.md). Změna scénáře přepíše jen pracovní předpoklady níže, nikoli plán, tokenové ceny, kurz, servisní cenu nebo partnerské vstupy. Přepínání režimů uchová model.

## Pevná nabídka

Start **399 Kč**, Business **1 999 Kč za projekt a měsíc**, oba průběžně; anglické ceny zůstávají **19 / 100 USD měsíčně**. Podíl je **20 % po 24 měsíců**. Tyto hodnoty nejsou vstupy a URL je nesmí přepsat. Přesné právní podmínky určuje [obchodní nabídka](new-commercial-offer.md). V kalkulačce neexistuje třetí bezplatný ani libovolně nacenitelný tarif.

Ostatní hodnoty jsou editovatelné ilustrativní odhady, ne průzkum mezd, skutečné tarify providerů nebo zaručená úspora. Částky jsou v Kč bez DPH. USD převádí editovatelný modelový kurz, nikoli aktuální kurzová služba.

## Období a projekty

Start i Business: měsíční období a zvolený horizont. Počet samostatných projektů jednoho klienta násobí **jen základní předplatné**. Kapacitní příplatky nejsou součástí modelu; toto omezení se uvádí viditelně v rychlé i pokročilé kalkulačce, textovém exportu a PDF. Provize se obchodně vztahuje i na všechny placené softwarové příplatky v původním 24měsíčním okně, ale model počítá jen zadané základní licence. Veškerá práce, AI, hosting a jiné náklady se zadávají za **celého klienta**, ne automaticky za každou instanci.

Start používá stejnou práci s horizontem a počtem licencovaných prostředí jako Business. Není jednorázový pilot a vytváří MRR. Přepnutí plánu nesmaže zadané předpoklady. Kalkulačka nepřiznává oprávnění ani neimplementuje licenční omezení.

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
| Období a licence | kurz USD/Kč 22; prostředí na klienta 1; horizont obou plánů 12 měsíců |
| Práce | objem, jednotky na položku, ruční minuty celé položky, celkový hodinový náklad, zbylá lidská práce %, dohled — podle scénáře |
| AI | vstup 3 USD / milion; výstup 15 USD / milion; tokeny podle scénáře; předplatné 1 500 Kč/měsíc; rezerva 25 %; externí služba podle scénáře |
| Provoz | server podle scénáře; databáze 0; zálohy/úložiště 100; jiné nástroje 0; elektřina 0; rozpočítaný hardware 0 Kč/měsíc |
| Služby | servis partnera 2 500 Kč za klienta/měsíc; nasazení 15 000 Kč jednorázově |
| Partner | klienti 10; uhrazené licence 100 %; vratky 0 %; obsluha 2 h/klienta/měsíc; interní náklad 600 Kč/h; implementace 12 h/klienta; akvizice 2 000 Kč/klienta; režie portfolia 2 000 Kč/měsíc |

Hodinový náklad představuje celkový náklad zaměstnavatele nebo sazbu externího dodavatele, ne automaticky hrubou mzdu. Při samostatné správě lze servis dát na 0 a vlastní práci uvést do dohledu. Režie portfolia se neúčtuje znovu za každého klienta.

AI předplatné **nahrazuje tokenový účet**, nepřičítá se. Příplatky a podporovaný automatizovaný provoz musí uživatel ověřit u poskytovatele. Příplatky externího AI poskytovatele lze zadat do ostatních nástrojů; kapacitní příplatky Promptbooku se takto nezadávají, protože by se nesprávně vyloučily z provizního základu. Lokální režim má nulový externí tokenový účet, ale stále uvedené náklady hardwaru a provozu. Co je v hostingu, nezapočítávat znovu zvlášť.

## Výpočet klienta

`V` položek, `U` jednotek na položku, `I/O` tokenů na jednotku, `Pi/Po` cena USD/milion, `K` Kč/USD, `M` období, `N` licencovaných prostředí. Oba plány používají zvolené `M` a `N`.

- Česká licence = `(Start 399 nebo Business 1999) × N`; anglická licence = `(Start 19 nebo Business 100) × N × K`.
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
- Návratnost = nasazení / kladný přínos období. Při nekladném přínosu není. Při nasazení 0 a kladném přínosu je bez vstupního nákladu. Oba plány uvádějí návratnost v měsících.

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
- Celkové tržby = servisní tržby × M + licenční podíl × min(M, 24) + implementační tržby. Model začíná první placenou aktivací; provizní okno se neobnovuje.
- Celkové náklady = náklad obsluhy × M + náklad implementace.
- Výsledek horizontu = celkové tržby − celkové náklady, před daní z příjmů.
- MRR obou plánů během provizního okna = tržby období bez implementace. Po 24 měsících zůstávají pouze servisní tržby; tuto mez uvádí UI a PDF.

Podíl není další poplatek klientovi. Celá klientova licence není tržbou agentury. Při plátci partner je uvedený servis včetně AI/provozu; model tyto náklady nepřičte klientovi podruhé, ale odečte partnerovi. Více klientů neodstraňuje náklad času a servisu.

## Vstupní validace a zobrazení

Běžná čísla 0–1e9; kurz 0,01–1 000; horizont obou plánů celé 1–120; prostředí celé 1–100; klienti celí 0–5 000. Zbylá práce/úhrady/vratky 0–100 %, rezerva 0–500 %. Přímý výpočet normalizuje ne-konečné a záporné hodnoty; URL parser používá výchozí hodnoty pro nečíselné vstupy. Podíl není editable pole.

Rozpracované prázdné číselné pole nesmí vyvolat NaN/Infinity. Záporné výsledky jsou skutečně zobrazené a doplněné správným slovním významem. Nuloví klienti mají nulové tržby, ale zachovanou fixní režii. Nulový objem práce nevynuluje fixní náklady a dohled.

Kč v UI zaokrouhlit na celé koruny, čas/návratnost na jedno desetinné místo. Výpočet zachovává přesné hodnoty, PDF může ukázat haléře. Součet jednotlivě zaokrouhlených řádků se může o korunu lišit; mezisoučty se znovu nepřičítají jako další náklady. Výše úspor není slibem nových tržeb z publikovaného obsahu.

Večerní upřesnění 25. října 2026: „pop-up“ zde znamená vizuálně vystupující panel v běžném toku stránky, nikoli modální okno. Formulář, jeho chování a původní jednotky/model zůstávají zachované; sjednocuje se prezentace celého nástroje.
