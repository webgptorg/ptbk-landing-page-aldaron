# Online předplatné Promptbooku

České platební odkazy se zobrazí po zapnutí prodeje. Start stojí 399 Kč měsíčně za projekt a Business 1 999 Kč. Anglický web vede na poptávku. Objednávka dovoluje přepnout tarif bez ztráty vyplněných údajů. Spotřebitelé i podnikatelé z Česka a Slovenska mohou nakoupit; IČO se vyplňuje jen při nákupu na firmu. Fakturační jméno nebo název a adresu lze vyplnit ručně. Vyhledání IČO doplní údaje z ARES nebo slovenského Registru účtovných závierok a zákazník je může opravit. IČ DPH slouží k ověření příslušného daňového režimu ve VIES, nikoli jako podmínka spotřebitelského nákupu. Volitelná poznámka se uchovává s objednávkou.

## Spotřebitelské objednávky a podmínky

Nové objednávky přijímají znění `2026-11-11-online-v2`. Starší znění `2026-11-09-online-v1` zůstává beze změny na původní adrese i u objednávek, které je přijaly. Zákazník si v členské sekci může stáhnout potvrzení s údaji objednávky a úplným zněním přijatých podmínek do samostatného souboru. Do nové smlouvy se nepřenášejí aktuální úpravy právních textů namísto skutečně přijatého znění.

Spotřebitel žádá výslovně o okamžité zpřístupnění předplatného. Tato volba neruší právo odstoupit do 14 dnů od uzavření smlouvy. AI Web vrací při takovém odstoupení celou přijatou cenu bez poměrné srážky. Odstoupení se vyřizuje ručně přes `legal@ptbk.io`: dohledat objednávku, ukončit předplatné i budoucí obnovování a vrátit platbu stejným způsobem bez zbytečného odkladu, nejpozději do 14 dnů. Vzor odstoupení, reklamace a informace o ADR ČOI jsou v online-v2. Není implementována automatická vratka ani odeslání smlouvy e-mailem; dostupnost stažitelného potvrzení a přístup přes kód je nutné ověřit.

Pro elektronicky poskytované služby slovenským spotřebitelům evidujte zemi zákazníka a souhrn přeshraničních prodejů. Výjimka do 10 000 EUR se posuzuje pro aktuální i předchozí kalendářní rok společně s příslušnými ostatními přeshraničními B2C plněními do EU. Při překročení limitu nebo dřívější volbě zdanění v zemi spotřeby je nutné odpovídající zahraniční DPH/OSS nebo jiný použitelný režim; identifikovaná osoba sama o sobě neznamená plátcovství české DPH. Aktuální celkový obrat a případnou volbu režimu musí potvrdit účetnictví.

## Příprava účtu

1. Potvrďte konkrétní vydání, produkční oprávnění AI Webu a kontaktní e-mail, na kterém tým zajistí u Businessu první věcnou reakci do 16 pracovních hodin.
2. Ve stávajícím Stripe účtu vytvořte šablonu faktury Promptbook CZ a samostatnou šablonu pro SK. Na vzorových PDF zkontrolujte identitu AI Webu, identitu odběratele, jazyk, období služby, číslo dokladu, měnu, slevu a cenu. Pro SK podnikatelské plnění s přenesením daňové povinnosti zkontrolujte obě DIČ a příslušnou poznámku; na spotřebitelský doklad ji neuvádějte. Ověřte, že faktury mohou přijít zákazníkovi e-mailem. Šablona se přiřazuje jen novým zákazníkům tohoto prodeje. Číslování a identita dodavatele vycházejí z účtu Stripe.
3. Vytvořte oddělenou konfiguraci portálu Promptbooku. Povolte změnu karty, faktury a ukončení na konci období. Úpravu fakturační země, daňové identity a produktu přes portál vypněte, protože tyto změny vyžadují nové ověření. Přímý odkaz Stripe pro přihlášení e-mailem může zvolit jiné předplatné na stejný e-mail. Přístup k přesné objednávce používá kód doručený e-mailem přes Supabase Auth. Ověřte SMTP, šablonu s `{{ .Token }}` a doručení mimo tým Supabase.
4. U existujícího podepsaného webhooku `/api/stripe/webhook` zachovejte události komunity. Přidejte `invoice.paid`, `invoice.payment_failed`, `charge.refunded` a `checkout.session.expired`. Pro předplatné jsou dále nutné `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `customer.subscription.updated` a `customer.subscription.deleted`. Produkční migrace se aplikují při nasazení.
5. V administraci slev vytvořte jeden přesný kód s 30 % na 3 měsíce, platností kampaně a explicitním rozsahem Start a Business. Zapněte nabídku na platební stránce. Datum konce kampaně řídí nové objednávky. Tříměsíční sleva na už založené měsíční předplatné doběhne i po úpravě kódu. Jedna objednávka uplatní jeden kód.

## Nastavení nasazení

| Proměnná | Hodnota nebo účel |
|---|---|
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SIGNING_SECRET` | Stávající Stripe účet a podpis webhooku. Pro místní test použijte testovací klíče a oddělenou databázi. |
| `PROMPTBOOK_BILLING_ENABLED` | `true` až po ověření migrací, účtu, faktur, obnovy přístupu a zrušení. |
| `PROMPTBOOK_BILLING_ENGINE_VERSION` | Výslovně podporovaná verze enginu. |
| `PROMPTBOOK_BILLING_ENGINE_LICENCE_URL` | Odkaz na licenci dodanou s danou verzí pod neměnným Git SHA v repozitáři Promptbook. |
| `PROMPTBOOK_BILLING_SUPPORT_EMAIL` | Funkční kontakt uvedený ve smluvním potvrzení. |
| `PROMPTBOOK_BILLING_ACCESS_SECRET` | Samostatná náhodná serverová hodnota o alespoň 32 znacích pro podpis relací. |
| `PROMPTBOOK_BILLING_PORTAL_CONFIGURATION_ID` | Konfigurace portálu vyhrazená pro tarify Promptbook. |
| `PROMPTBOOK_BILLING_CZ_INVOICE_TEMPLATE_ID` | Šablona pro faktury v Česku. |
| `PROMPTBOOK_BILLING_SK_ENABLED` | `true` po ověření slovenských dokladů pro použitý režim; VIES a souhrnné hlášení se týkají příslušných podnikatelských plnění. |
| `PROMPTBOOK_BILLING_SK_INVOICE_TEMPLATE_ID`, `PROMPTBOOK_BILLING_SUPPLIER_TAX_ID` | Slovenská šablona a platné DIČ AI Webu uváděné na dokladu. |
| `PROMPTBOOK_BILLING_EMAIL_VERIFICATION_ENABLED` | `true` po ověření e-mailové obnovy přístupu v Supabase. |
| `PROMPTBOOK_TWENTY_API_KEY` | Volitelný klíč s vlastními oprávněními pro přímý zápis firem, obchodních případů a poznámek do Twenty. Standardní synchronizace zdrojů kontaktů používá stávající úlohu a tento klíč nepotřebuje. |

## Ověření a evidence

Použijte místní server a Stripe Sandbox. Stripe CLI přepošle sandboxové webhooky na `http://localhost:4009/api/stripe/webhook`. Ověřte první úhradu, tři zlevněné faktury a čtvrtou za běžnou cenu, zrušení k obnově, neúspěšné stržení, vratku, vypršení relace, opakované a obráceně doručené webhooky. V sandboxu ověřte i nulový průchod s časově omezeným 100% kódem. Ostré nasazení použijte pro skutečné nákupy zákazníků.

Tabulky `promptbook_orders` a `promptbook_invoices` slouží k párování. Ve výsledcích pilotu filtrujte ostré objednávky a skutečné platby kartou po odečtení vratek. Nulové faktury samy o sobě nezakládají placenou konverzi. Pro první úhradu za standardní cenu vycházejte z faktury za obnovu a ze sjednané ceny objednávky. Provizi počítejte ze způsobilé částky bez DPH po slevách a přípustných vratkách. Aktivační stav a účetní doklady čtěte ze Stripe.

Ve Stripe se dosavadní ceny uchovávají jako základy bez daně; objednávka musí před platbou vždy ukázat skutečnou celkovou částku. Pro přechod k plátcovství před změnou potvrďte účinnost a daňový režim s účetní, informujte zákazníky dle sjednaných podmínek, nastavte režim u nových i běžících předplatných a upravte text šablon i existujících zákazníků. Před účinností zkontrolujte náhled dalších faktur včetně zachování slevy a správného režimu SK.
