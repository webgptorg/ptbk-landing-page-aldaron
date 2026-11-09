# Online předplatné Promptbooku

České platební odkazy se zobrazí po zapnutí prodeje. Start stojí 399 Kč měsíčně za projekt a Business 1 999 Kč. Anglický web vede na poptávku. První režim je pro podnikatele. Slovensko má samostatný přepínač. Český nákup ověřuje IČO v ARES. Slovenský ověřuje IČO v Registru účtovných závierok a příslušné IČ DPH ve VIES před otevřením platební brány. Nesoulad či výpadek ověření objednávku zastaví. Spotřebitelský prodej vyžaduje vlastní podmínky, daňové nastavení a postup pro odstoupení.

## Příprava účtu

1. Potvrďte konkrétní vydání, produkční oprávnění AI Webu a kontaktní e-mail, na kterém tým zajistí u Businessu první věcnou reakci do 16 pracovních hodin.
2. Ve stávajícím Stripe účtu vytvořte šablonu faktury Promptbook CZ a samostatnou šablonu pro SK. Na vzorových PDF zkontrolujte identitu AI Webu, identitu odběratele, jazyk, období služby, číslo dokladu, měnu, slevu a cenu. Pro SK zkontrolujte obě DIČ a poznámku o přenesení daňové povinnosti. Ověřte, že faktury mohou přijít zákazníkovi e-mailem. Šablona se přiřazuje jen novým zákazníkům tohoto prodeje. Číslování a identita dodavatele vycházejí z účtu Stripe.
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
| `PROMPTBOOK_BILLING_SK_ENABLED` | `true` po ověření VIES a slovenského dokladu včetně souhrnného hlášení. |
| `PROMPTBOOK_BILLING_SK_INVOICE_TEMPLATE_ID`, `PROMPTBOOK_BILLING_SUPPLIER_TAX_ID` | Slovenská šablona a platné DIČ AI Webu uváděné na dokladu. |
| `PROMPTBOOK_BILLING_EMAIL_VERIFICATION_ENABLED` | `true` po ověření e-mailové obnovy přístupu v Supabase. |
| `PROMPTBOOK_TWENTY_API_KEY` | Volitelné zapnutí synchronizace firem, kontaktů a nákupů do firemního Twenty. Zápis do stávajících kontaktů funguje samostatně. |

## Ověření a evidence

Použijte místní server a Stripe Sandbox. Stripe CLI přepošle sandboxové webhooky na `http://localhost:4009/api/stripe/webhook`. Ověřte první úhradu, tři zlevněné faktury a čtvrtou za běžnou cenu, zrušení k obnově, neúspěšné stržení, vratku, vypršení relace, opakované a obráceně doručené webhooky. V sandboxu ověřte i nulový průchod s časově omezeným 100% kódem. Ostré nasazení použijte pro skutečné nákupy zákazníků.

Tabulky `promptbook_orders` a `promptbook_invoices` slouží k párování. Ve výsledcích pilotu filtrujte ostré objednávky a skutečné platby kartou po odečtení vratek. Nulové faktury samy o sobě nezakládají placenou konverzi. Pro první úhradu za standardní cenu vycházejte z faktury za obnovu a ze sjednané ceny objednávky. Provizi počítejte ze způsobilé částky bez DPH po slevách a přípustných vratkách. Aktivační stav a účetní doklady čtěte ze Stripe.

Pro přechod k plátcovství jsou ceny ve Stripe uloženy jako základy bez daně. Před změnou potvrďte účinnost a daňový režim s účetní, informujte zákazníky dle sjednaných podmínek, nastavte režim u nových i běžících předplatných a upravte text šablon i existujících zákazníků. Před účinností zkontrolujte náhled dalších faktur včetně zachování slevy a správného režimu SK.
