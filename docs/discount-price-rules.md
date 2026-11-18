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

Cenu 1 Kč nebo 10 Kč lze definovat a zobrazit v náhledu. Současná korunová
platba kartou odmítne kladnou částku pod 15 Kč s jasnou chybou. Nikdy částku
automaticky nezvýší. Pro skutečné malé kartové platby lze zvolit například 20 Kč.
Trvalá nulová cena nepotřebuje kartu; dočasná nulová cena ji vyžaduje kvůli
následným běžným obnovám. Platba i přístupy nadále podléhají stávajícímu
ověření serverem a Stripe.

## Nasazení a ověření

Migrace `2026-11-1810-discount-price-rules.sql` přidává sloupce, soukromou historii
a nové verze odpovědí RPC. Původní RPC podpisy, definice a stará data zůstávají.
Produkční `prebuild` používá běžný kontrolovaný migrační runner repozitáře.
Ověření pokrývá parser, přesné částky, veřejné popisy, ochranu ceny a identity
objednávky, Stripe parametry, editor, historické procentní nabídky a skutečné
PostgreSQL provedení migrace v PGlite, včetně oprávnění, verzování a opakování
rezervace po změně či smazání kódu. Testy Stripe používají simulovanou bránu;
neprovádějí ostré nákupy ani stržení karty.
