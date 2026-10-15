# Zdroje, rozhodnutí a otevřené body

## Dodané podklady

**L — „Promptbook - licence pro firemní AI agenty.pdf“**, dokument „Promptbook — licence pro firemní AI agenty“, finální návrh nabídky pro jednání, verze 1.0, 15. října 2026, 3 strany. S. 1: definice platformy, platby, Start/Business a instance. S. 2: náklady mimo cenu, partnerství a servisní SLA. S. 2–3: veřejný kód, produkční práva, individuální rozsah a kontakt. Dokument sám říká, že nenahrazuje licenční smlouvu ani partnerskou dohodu.

**W — „Web ptbk plus hlavní myšlenka ptbk.pdf“**, 10 stran. Body 1–4: důvod existence, změna práce, „babysitting AI“, mise a vize. Bod 5: agentury jako hlavní publikum, firmy jako klienti agentur, tvůrci a technická linie. Body 7–8: dnešní produkt, aplikace teprve v přípravě, neslibované funkce a odlišení. Body 9–11: rozpracované obchodní hypotézy, důkazy a vstupní cesta. S. 9–10: navržená struktura webu.

**C — zadání v této konverzaci:** dvě propojené stránky na `/new` a `/new/partnership`, úplný rozpad nákladů, kalkulačka vlastní agendy a partnerských nasazení, původní čtyři scénáře a přímé commitování do `main`. Nové PDF upřesňují a mění dřívější obchodní hypotézy.

Originální PDF se touto změnou nekopírují do veřejného repozitáře ani na web. Uvádíme jejich názvy, verzi a lokátory kvůli dohledatelnosti. Tato implementace neprovádí externí průzkum konkurence, právní revizi ani audit bezpečnostní architektury.

## Výslovná rozhodnutí při rozporech

| Téma | Rozpor nebo neúplnost | Rozhodnutí tohoto vydání |
| --- | --- | --- |
| Co se prodává | C: placená aplikace, W: různé úvahy o spotřebě, L: software a komerční licence | L, s. 1: licence klientské instance, nikoli pouze hezké UI |
| Cena vstupu | C: Starter 10 USD/měsíc, W: bezplatný trial nebo kredit | L, s. 1: Start 19 USD na 30 dní, jednorázově, jednou pro koncového klienta |
| Produkční tarif | W, s. 5: 5–10 tisíc Kč, čeká na ceník; C: orientační Business | L, s. 1: 100 USD měsíčně za instanci bez ročního závazku |
| Fakturace | W, bod 9: agenturní předplatné, spotřeba a otevřená přímá fakturace | L, s. 1–2: klient platí licenci Promptbooku, práci agentuře; agentura neplatí partnerský paušál |
| Podíl partnera | C: sazba experimentální a 12 měsíců; W: otevřené | L, s. 2: 20 % z uhrazených licencí bez DPH po vratkách, Start i Business, po dobu placeného užívání a trvání dohody |
| Jednotka | C: agenti, agenda nebo server | L, s. 1: samostatné klientské prostředí; více prostředí znamená více licencí i na jednom stroji |
| Veřejný engine | C/W: zkratka „open source zdarma“ | L, s. 2–3: neprodukční použití podle veřejné licence, produkční licence podle práv konkrétní verze; žádná změna již udělených práv |
| Dostupnost aplikace | W, s. 1 ji popisuje jako řešení obsluhy, s. 6 ji řadí do budoucnosti | Konkrétní stav produktu z bodu 7: dnešní terminál, aplikace MangoWeb v přípravě, orientačně kolem 20. 11. 2026 |
| CTA | W: registrovat zdarma a kredit na tokeny | Dokud není ověřená registrace a produkt připravený, poctivá e-mailová domluva pilotu za 19 USD; žádná fiktivní registrace nebo kredit |
| Podpora | C: širší garance a enterprise, W: „jede bez hlídání“ | L: první věcná reakce do 16 pracovních hodin u Business, žádné 24/7 SLA, provoz ani garance opravy |
| Data | W: všechna data zůstávají ve firmě; zároveň vyžaduje ověření toku aplikace | Oddělit uložení kontextu od odesílaných vstupů externím modelům a nástrojům; stav šifrování připravované aplikace označit jako návrh k ověření |
| Autonomie | W: „jednou nastavíš a jede“ | Vyjádřit méně opakovaného úkolování; nevydávat za bezchybnost, neomezenou samostatnost nebo konec péče partnera |
| Jazyky | W: angličtina jako základ | Současný rozsah C jsou dvě existující české revizní stránky; mezinárodní přepnutí celé prezentace je výslovně odložené |

L má pro konkrétní nabídku přednost: W sám označuje ceník a obchodní model jako otevřený. W řídí cílovku, argumentaci a kompozici, nikoli přepis přesných cen či SLA.

## Tvrzení, která se zatím nezveřejňují jako důkaz

- McKinsey 62 % / 23 %, tržní srovnání a ceny konkurence: podklad je zmiňuje, ale žádá ověření; tento úkol není externí průzkum. Nepublikovat je jako ověřené aktuální skutečnosti.
- „Neonmedia běží na Promptbooku“, výsledky pilotů, reference a úvodní video: bez dodaných schválených výstupů nezobrazovat logo jako důkaz, smyšlená čísla, reference ani falešný přehrávač.
- Schopnost agenta samostatně hledat práci, ověřování mimo kód a ranní souhrn: W, s. 7 výslovně říká neslibovat. Samostatné hledání práce smí být pouze označená vize.
- Vlastní příběh zakladatele, „co nikdy neuděláme“ a unikátnost kombinace výhod: zůstávají otevřené, bez vymyšlené autobiografie nebo tvrzení „jediní na trhu“.
- Pojmenované služby nejsou seznam ověřených hotových konektorů. Přístup a konfigurace se ověřují pro konkrétní nasazení.

## Co chybí pro další vydání

Ověřená URL a stav aplikace, konečná pravidla párování a datového toku, podporované verze/konfigurace, schválené objednávkové a partnerské podmínky, přiřazení klientů a splatnost podílů, podmínky pro samotné tvůrce, schválené důkazy z pilotů a videa. Tyto mezery neblokují revizní stránky, ale blokují příslušné silnější sliby, automatickou registraci a automatické platby.
