# Slevové kódy napříč ekosystémem

Administrace: `/admin/discount-codes`. Rozšíření nevytváří žádný konkrétní kód ani nákup.

## Nastavení

Každý kód má samostatně nastavenou časovou platnost pro získání slevy, počet použití,
rozsah produktů a délku účinku v předplatném. Prázdná délka znamená trvale; dočasná
sleva trvá 1–36 měsíců. Výpočet ceny lze přepínat mezi:

| Nastavení | Příklad | Cena z původních 5 000 Kč |
| --- | --- | --- |
| Procentní sleva | 30 % | 3 500 Kč |
| Pevná výsledná cena | 20 Kč | 20 Kč |
| Odečtení částky | 200 Kč | 4 800 Kč |
| Vlastní vzorec výsledné ceny | `price * 0.01 + 1` | 51 Kč |

`price` i `cena` znamenají původní cenu konkrétního nákupu v Kč, u měsíčního
předplatného původní měsíční cenu. Podporované operace: `+ - * / % ^`, závorky,
funkce `min`, `max`, `round`, `floor`, `ceil`, `abs`. Oddělovačem desetinných míst
je tečka; například `round(price * 0.7 + 1, 2)`. Výsledek se omezí na interval
0 až původní cena a zaokrouhlí na haléře. Dělení nulou a nečíselné nebo příliš
velké výsledky kód pro danou cenu zneplatní; nikdy nezpůsobí bezplatný nákup.
Procentní pravidla pro původní workshopy a komunitu si zachovávají původní
zaokrouhlení na celé koruny.

Náhled v editoru lze vyzkoušet s libovolnou původní cenou. Zákaznické pole
popisuje slevu lidsky a u vzorce zobrazí zvýhodněnou cenu; samotný matematický
zápis se nevypisuje do zákaznického textu. Souhrn nákupu uvádí konkrétní částku,
délku zvýhodnění a případný návrat k běžné ceně.

## Rozsah

Nová výslovná volba **Všechna místa** zahrnuje celý ekosystém: licence Start a
Business, komunitu, varianty AI Supervize Mini a Full avatara na osobních webech.
Místo toho lze zaškrtnout konkrétní nabídky. Nové nabídky se registrují jednou v
`lib/discounts/discountPlaces.ts` a globální kódy je zahrnou automaticky.

Historická prázdná pole míst v databázi nezahrnovala licence Promptbooku.
Migrace tato pravidla nerozšiřuje. Editor je označí jako původní rozsah a nabízí
samostatné výslovné rozšíření na celý ekosystém. Starý API klient, který nové
pole neposílá, rovněž nezmění uložený rozsah ani vlastní vzorec.

## Přijaté podmínky a opakování plateb

Každá definice má verzi. Změna pravidla, délky, rozsahu nebo dostupnosti zvýší
verzi, spotřebování použití ji nemění. Nové nákupy ukládají kopii pravidla,
verze, kódu, původní/výsledné částky v haléřích, měny a délky slevy.
Objednávkové kopie jsou neměnné; oddělená soukromá historie uchovává také
jednotlivé přijaté nabídky při opětovném použití řádku komunitního členství.
Historické nákupy se nedoplňují odhadem a nijak nepřepočítávají.

Licenční a avatarové checkouty atomicky rezervují použití a vracejí stejnou
kopii při opakování stejného pokusu, i když byl původní kód upraven, vypnut
nebo smazán. Změněnou nabídku mezi náhledem a rezervací je potřeba znovu
potvrdit. Nejasný výsledek síťového požadavku na Stripe zachová rezervaci
a stejný klíč idempotence; jisté vypršení ji uvolní nejvýše jednou.

Stripe dostává samostatný kupón pro konkrétní předplatné. U procent zůstává
původní procentní kupón, u ostatních pravidel je předána vypočtená částka
odpočtu s přijatou délkou. Základní měsíční cena je součástí konkrétního
předplatného, nikoli odkaz na měnitelnou veřejnou nabídku. Vzorec se nevyhodnocuje
znovu podle pozdější definice kódu. Editace nemění již zaplacená předplatná.
Komunitní checkout rovněž drží vlastní kupón a uložené podmínky; pozdější
evidence použití kódu nepřepočítává zaplacenou cenu.

## Malé a nulové částky

Cenu 1 Kč nebo 10 Kč lze definovat a zobrazit v náhledu. U **jednorázového
nákupu** se nula i kladná částka pod minimem vybrané brány dokončí bez účtování.
Souhrn jasně říká „Zdarma (0 Kč)“, ukáže případnou prominutou částku a tlačítko
„Dokončit zdarma“. Nevzniká Stripe Checkout, platba kartou ani pozdější dluh.
Přesně 15 Kč už pod dnešní minimum nespadá a pokračuje původní cestou.

`lib/payments/paymentCollectionPolicy.ts` odděluje pravidlo produktu od omezení
brány: dnešní `STRIPE_CZK_PAYMENT_POLICY` stanoví 1 500 haléřů. Jiná brána nebo
měna dostane vlastní politiku a verzi. Rozhoduje celková cena objednávky po slevě
v haléřích, nikoli cena jednoho místa. Částka se nikdy nezvedá na minimum.

Aktuální jednorázová placená nabídka je registrace AI Supervize Mini. Její běžná
kladná cena se už dříve ukládala pro následné ruční vyřízení/fakturaci; tato
změna nezavádí nový kartový checkout. Když je cena pod minimem, server ji znovu
spočítá a uloží `Contact.oneTimePayment`. Databázový trigger v témže transakčním
zápisu vytvoří neměnný soukromý `internal_purchase_payments` se stavem `paid`,
způsobem `no_charge`, skutečně přijatou částkou 0 a částkou k úhradě 0. Uchová
odděleně cenu po slevě, prominutí, důvod, politiku brány, fakturační údaje,
celou registraci a přijatou kopii slevy. Selhání evidence úhrady vrátí zpět také
zápis kontaktu; server nikdy nevrátí úspěšný nákup bez uložené evidence.
Spotřeba použití kódu zachovává stávající samostatné atomické RPC.

Kontakt dál spouští dosavadní zpracování registrace, kapacitu a kontaktní outbox.
Čekací listina není dokončený nákup a placený záznam nevytváří. Editace ani smazání
kontaktu nemění kopii úhrady a fakturačních údajů. V administraci kontaktu je
vidět „Zaplaceno · bez účtování“. Budoucí generátor faktur musí zpracovávat i tyto
interní úhrady, vycházet z částky k úhradě 0 a uvést prominutí; nesmí čekat jen na
Stripe webhook nebo vykazovat původní 1 Kč jako přijaté peníze. Automatické
vystavení jednorázové faktury touto změnou nevzniká. Historické nákupy se nemění.

**Předplatné je samostatný případ:** u licencí, členství a avatara se kladná
podlimitní měsíční částka nadále odmítá. Trvalá nulová cena nepotřebuje kartu;
dočasná nulová cena ji vyžaduje kvůli následným běžným obnovám. Jednorázové
prominutí nesmí zrušit budoucí placené obnovy nebo změnit přijatou smlouvu.
Interní bezplatné dokončení testuje objednávku, evidenci a navazující kroky,
nikoli skutečné stržení kartou.

## Nasazení a ověření

Migrace `2026-11-1810-discount-price-rules.sql` přidává sloupce, soukromou historii
a nové verze odpovědí RPC. Původní RPC podpisy, definice a stará data zůstávají.
Produkční `prebuild` používá běžný kontrolovaný migrační runner repozitáře.
Ověření pokrývá parser, přesné částky, veřejné popisy, ochranu ceny a identity
objednávky, Stripe parametry, editor, historické procentní nabídky a skutečné
PostgreSQL provedení migrace v PGlite, včetně oprávnění, verzování a opakování
rezervace po změně či smazání kódu. Testy Stripe používají simulovanou bránu;
neprovádějí ostré nákupy ani stržení karty.
