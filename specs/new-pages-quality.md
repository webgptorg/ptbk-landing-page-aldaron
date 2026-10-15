# Společné chování a akceptace

## Rozsah a navigace

Existují dvě přímé veřejné cesty `/new` a `/new/partnership`, včetně obvyklé normalizace koncového lomítka. Produkt a partnerství jsou propojené horní navigací a patičkou; produkt navíc partnerskou výzvou v obsahu. Žádné nové vlastní domény, přesměrování hlavní homepage nebo zásahy do ostatních značkových domén.

Kotvy: obsah, agenti, jak to funguje, kontrola, dostupnost, ceník, kalkulačka, podpora a zdroje; partnerská stránka navíc partnerství. Každý odkaz směřuje na existující kotvu, stávající veřejnou stránku, upstream repozitář nebo e-mailovou domluvu. Nedostupná aplikace nemá aktivní registrační tlačítko.

## Vzhled a přístupnost

Zachovat stávající světlý vizuální jazyk revizních stránek, logo Promptbooku, typografii, čitelné rozestupy a rozlišení textu, ilustrací, cen a výsledků. Ceník má dvě hlavní karty, individuální rozsah a veřejný kód jsou pod ním. Stejný vizuální základ pro obě publika.

Responzivita od šířky 375 px; sloupce se na mobilu skládají bez horizontálního přetékání. Navigace i oba taby musí být dosažitelné na mobilu. Dlouhá jména, pracovní podmínky a částky nesmějí překrývat ovládání.

Jeden hlavní nadpis, logická hierarchie sekcí, označené navigace a odkaz pro přeskočení na obsah. Číselná a výběrová pole mají label, hint je programově spojený s polem. Taby mají role, stav výběru a vztah k panelu; šipky přepínají mezi nimi, Home/End volí první/poslední a přesouvají fokus. Rozbalení detailů a FAQ musí fungovat klávesnicí. Stav exportu a hlavní přepočítané výsledky jsou přístupné čtečkám. Ilustrace není skutečný stav klienta. Pohyb není podmínkou čitelnosti, respektovat redukovaný pohyb.

## Metadata a veřejné sliby

Obě stránky mají vlastní titulek, popis, kanonickou URL a sdílecí kartu; používají již existující společný renderer 1200 × 630 a značku. Sdílecí text odpovídá aktuální nabídce a nepředstírá dostupnou aplikaci. České texty mají lokální označení jazyka. Nenahlašovat neexistující anglickou alternativu.

Revizní stránky zůstávají `noindex`, nevstupují do sitemap a nenahrazují indexované domovské stránky. Nejde o utajení: každý s URL je může otevřít. Při budoucím veřejném uvedení je indexace samostatné rozhodnutí.

Kontaktní CTA je `mailto:jiri@ptbk.io` s odpovídajícím předmětem, nikoli Stripe checkout, odeslaný e-mail nebo registrace. Není vytvořen nový formulář, databáze kontaktů, partnerský účet, faktura nebo transakce. Podmínky jsou označené jako návrh nabídky, právní dokumenty webu nenahrazují licenci a objednávku.

## Soukromí

Kalkulačka neodesílá vstupy, nevolá modely, neukládá je do veřejné URL a nevytváří tracking partnerů. Export zůstává lokální. Existující celowebový souhlas a analytika se nemění; neslibovat, že celá stránka je bez jakýchkoli analytických požadavků. Předvyplněné e-mailové odkazy obsahují téma/scénář, nikoli celý finanční profil návštěvníka.

Veřejný kód a vlastní soubory neprokazují samy o sobě, že všechna data vždy zůstávají ve firmě. Jasně rozlišit modelového poskytovatele a připravovanou aplikaci. Zdrojové PDF se nevkládají do veřejných downloadů.

## Akceptační scénáře

- Obě URL fungují, propojují se a původní homepage zůstává beze změny.
- V obou cenících je Start 19 USD / 30 dní a Business 100 USD / instanci / měsíc. Žádný Starter za 10 USD, třetí bezplatný plán nebo deset-agentový limit.
- Instance je klientské prostředí a více prostředí na jednom serveru je více licencí.
- Start má explicitně 30 dní, jednou pro klienta, bez obnovy, podpory a SLA. Business první věcnou reakci do 16 pracovních hodin; přesné pracovní okno, české svátky a žádnou garanci opravy/dostupnosti.
- Aplikace je připravovaná, datum orientační, CTA nezve do již dostupné aplikace. Samostatné hledání práce je jen vize. Bez nepodloženého klientského důkazu, videa nebo konkurenčních statistik.
- Partnerství: přímo placená klientská licence, žádný partnerský paušál, pevný 20% podíl ze skutečných plateb po vratkách pro oba plány. Žádný automatický 12měsíční konec.
- Každý z pěti scénářů mění pracovní vstupy a konečný výsledek. Taby zachovávají hodnoty, reset obnoví výchozí příklad.
- Start ignoruje delší horizont/více instancí i při přímém volání výpočtu; neextrapoluje návratnost přes 30 dní a nikdy negeneruje MRR.
- Business počítá celý zvolený horizont včetně 24 měsíců za předpokladu pokračující dohody. Nulové platby nebo plné vratky znamenají nulový licenční podíl.
- AI předplatné nenásobí retry rezerva a nepřičítají se k němu tokeny. Lokální režim zahrnuje uvedenou infrastrukturu. Další jednotky nemultiplikují čas již uvedený za celou položku.
- Partnerem hrazený provoz se odečte partnerovi a nepřipočte klientovi dvakrát. Databáze, nasazení a režie se počítají jednou.
- Nulový objem a nákladné varianty mohou mít záporný přínos; nuloví klienti zachovají režii. Nevalidní čísla nezpůsobují NaN/Infinity v UI.
- Export obsahuje verzi, všechny vstupy a výsledky a po změně plánu správné období. Ovládání funguje klávesnicí a na mobilu.

## Ověření implementace

Cílené jednotkové testy ekonomiky a prohlížečové testy obou stránek; lint nových součástí; produkční build a TypeScript (build před kontrolou typů podle pravidel repozitáře). Prohlédnout rozložení na desktopu a mobilu, při chybě opravovat, ne pouze zakrývat přetečení. Ověřit nasazení stejného commitu na produkčním projektu a HTTP obou URL. Neprohlašovat plnou regresní sadu ostatních aplikací za provedenou, pokud běžely jen cílené testy.
