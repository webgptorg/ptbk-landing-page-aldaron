# Nastavení platební brány pro členství v komunitě

Placené členství komunity Vývojáři se kupuje přímo v `/cs/komunity/vyvojari`. Připojený člen vidí v místnosti popup **Placené členství komunity**,
zadá jen slevový kód a potvrdí podmínky – jméno ani e-mail už se ho neptáme, protože je místnost zná. Platba pak
proběhne na zabezpečené stránce Stripe a člen se vrátí zpět do místnosti. Veřejná stránka členství je na `/cs/komunity/vyvojari/clenstvi`.

**Dokud nenastavíte klíče níže, aplikace o placeném členství v místnosti nic neříká** – nikde se neobjeví tlačítko,
které by nemohlo fungovat. Nic se tedy nerozbije, jen se členství nebude dát koupit.

## 1. Databáze

Migrace `migrations/2026-11-0902-scoped-community-memberships.sql` přiřadí stávající předplatná komunitě Vývojáři a ponechá původní Stripe identifikátory. Server použije migrace při startu. Ruční spuštění:

```bash
npm run migrate-database
```

## 2. Klíče do `.env`

```bash
# Stripe – tajný klíč účtu. `sk_test_…` = testovací brána, `sk_live_…` = ostrá.
STRIPE_SECRET_KEY=sk_test_...

# Stripe – podpis webhooku (viz krok 3). Bez něj platby fungují, jen se o zrušení dozvíme později.
STRIPE_WEBHOOK_SIGNING_SECRET=whsec_...
```

Tajný klíč najdete v Stripe Dashboardu v **Developers → API keys**:

- testovací: <https://dashboard.stripe.com/test/apikeys>
- ostrý: <https://dashboard.stripe.com/apikeys>

Přepínač **Test mode** vpravo nahoře rozhoduje, který klíč vidíte. Produkty ani ceny ve Stripe zakládat nemusíte –
cenu členství (dnes 199 Kč / měsíc) i slevové kódy určuje aplikace a posílá je do Stripe s každou platbou, takže se
cena mění v `businesses/community/membership/communityMembershipConfig.ts`, ne v Stripe.

## 3. Customer Portal Stripe

Tlačítko **Spravovat platbu ve Stripe** v popupu členství otevírá [Customer Portal Stripe](https://docs.stripe.com/customer-management/integrate-customer-portal).
V Dashboardu Stripe proto v každém režimu zvlášť (testovacím i ostrém) vytvořte a aktivujte výchozí konfiguraci
Customer Portalu. Vyberte v ní, co má člen spravovat, například platební kartu a historii faktur; aplikace při každém
kliknutí vytvoří novou krátkodobou adresu pro právě připojeného člena a po návratu ho pošle zpět do `/cs/komunita`.

Zrušení a obnovení další platby zůstává přímo v popupu aplikace, nezávisle na funkcích zapnutých v Customer Portalu.
Změna provedená ve Stripe se do členství propíše přes webhook níže.

## 4. Webhook

Webhook není nutný k tomu, aby platba prošla (návrat z brány si aplikace ověří sama), ale je potřeba, aby se komunita
dozvěděla o zrušení členství, neúspěšné platbě nebo o platbě dokončené později.

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. Adresa: `https://ptbk.io/api/stripe/webhook`
3. Události:
    - `checkout.session.completed`
    - `checkout.session.async_payment_succeeded`
    - `checkout.session.async_payment_failed`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
4. Zkopírujte **Signing secret** (`whsec_…`) do `STRIPE_WEBHOOK_SIGNING_SECRET`.

Webhook s neplatným podpisem se odmítne, takže na tuto adresu nikdo cizí nic nezapíše.

## 5. Testování testovací kartou

1. Do `.env` dejte testovací klíč (`sk_test_…`) a spusťte `npm run dev`.
2. Otevřete `http://localhost:4009/cs/komunita` a připojte se jménem a e-mailem.
3. V popupu členství uvidíte žlutou poznámku, že jde o testovací režim – tu na ostrých klíčích aplikace nikdy neukáže.
4. Zaplaťte kartou:
    - **úspěch:** `4242 4242 4242 4242`
    - **potvrzení v bance (3D Secure):** `4000 0025 0000 3155`
    - **zamítnutá karta:** `4000 0000 0000 9995`
    - datum expirace cokoliv v budoucnosti, CVC cokoliv, PSČ cokoliv
5. Po zaplacení se vrátíte do místnosti, kde se objeví „Platba proběhla“ a badge v hlavičce se změní na
   **Placené členství**.

Webhooky na localhost přepošlete Stripe CLI:

```bash
stripe login
stripe listen --forward-to localhost:4009/api/stripe/webhook
```

CLI vypíše vlastní `whsec_…` – ten patří do `STRIPE_WEBHOOK_SIGNING_SECRET` po dobu lokálního testování.

Testovací platby vidíte na <https://dashboard.stripe.com/test/payments>, testovací předplatná na
<https://dashboard.stripe.com/test/subscriptions>.

## 6. Přechod na ostrý provoz

Vyměňte `STRIPE_SECRET_KEY` za `sk_live_…` a `STRIPE_WEBHOOK_SIGNING_SECRET` za podpis ostrého webhooku. Poznámka
o testovacím režimu z místnosti zmizí sama. Testovací a ostrá data se v databázi nepletou – u každého členství je
uloženo, na které bráně vzniklo.

## 7. Co je dobré vědět

- **Zrušení členství** může člen potvrdit přímo v popupu členství. Tím zastaví jen další obnovení a výhody mu zůstanou
  do konce již zaplaceného období; před tímto dnem je může stejným popupem zase obnovit. Customer Portal Stripe je
  vedle toho cesta ke kartě, fakturám a dalším funkcím, které jste v něm zapnuli.
- **Neúspěšná platba** členství hned nebere – místnost napíše, že poslední platba neprošla, a přístup drží, dokud to
  Stripe nevzdá.
- **Slevový kód** se odečítá z opakované měsíční ceny, takže sleva členovi zůstává, dokud členství trvá. Kód se
  spotřebuje až po zaplacení, ne při otevření brány. Pozor na velmi vysoké slevy: minimální částka, kterou umí Stripe
  v CZK strhnout, je 15 Kč.
- **Měna** je CZK. Účet Stripe ji musí mít povolenou (české účty ji mají).

## Ověření e-mailu pro placený přístup

Před zapnutím `COMMUNITY_EMAIL_VERIFICATION_ENABLED=true` nastavte v Supabase Auth vlastní SMTP,
povolte přihlášení e-mailem a použijte `{{ .Token }}` v šabloně přihlašovacího e-mailu. Ověřte doručení
a ověření kódu na běžné adrese mimo tým Supabase. Nastavení vyžaduje stávající veřejný URL a anon klíč
Supabase i serverový service role klíč.

Se zapnutým ověřením se pro placené materiály, záznamy a správu předplatného vyžaduje ověření e-mailu.
Bez zapnutého ověření běží stávající přístup k předplatnému Vývojářů přes relaci místnosti se zadaným e-mailem.
Nové placené články vyžadují ověřenou relaci i aktivní placené členství v dané komunitě.
