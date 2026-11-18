# Přihlášení odkazem a kódem v celém ekosystému

Revize vlastníka z 18. listopadu 2026: každý přihlašovací e-mail obsahuje klikací přihlášení i dosavadní číselný kód. Odkaz vrací na přesnou stránku a doménu, odkud uživatel přihlášení vyžádal, včetně query a sekce. Neexistuje jeden globální návrat do Promptbooku.

| Místo žádosti | Relace po ověření |
|---|---|
| Promptbook: nákup, trial, členský účet | Dosavadní podepsaná členská cookie a licenční identita |
| Avatar na pavolhejny.cz / pavolhejny.com | Pouze relace avatara |
| Komunitní a workshopové místnosti | Dosavadní ověřený e-mail komunity; účastnická relace místnosti zůstává samostatná |

Všechny tři odesílací cesty používají `createEmailLoginRedirect`. Noví klienti posílají svou skutečnou adresu v `returnTo`; starší používají stejnodoménový Referer a poté kontextový fallback. Povoleny jsou registrované domény ekosystému a jejich www varianty, stávající alias new.ptbk.io, přesně nakonfigurované preview a místní vývoj. Neznámý host se odmítne. Návrat na jiný origin nebo API se nepřebírá.

`/api/auth/email` funguje na všech vlastních doménách bez přepisování do značkových stránek. GET/HEAD vrací pouze soukromou statickou stránku a nikdy nespotřebuje token. Token je ve fragmentu odkazu, ne v serverové URL. Stránka fragment odstraní z historie, předá token jedním stejnodoménovým POST a po ověření přesměruje na původní místo. Používá CSP s nonce, no-store/no-referrer/noindex a žádnou analytiku ani externí zdroje. Použité nebo prošlé odkazy nabídnou návrat pro nový e-mail nebo ruční kód. GET prefetch nespotřebuje přihlášení; skener spouštějící JavaScript může stejně jako uživatelský prohlížeč vyvolat ověření.

Relace vzniká až z poskytovatelem ověřeného, potvrzeného e-mailu. Token není oprávnění k placenému produktu ani k nákupu. Ověření kódem a odkazem spotřebovává stejný jednorázový token; po jednom úspěšném použití druhá možnost přestane platit. Původní číselné formuláře zůstávají funkční. Nové odkazy nevyžadují localStorage ani původní kartu. Komunitní místnost v novém zařízení může stále potřebovat svou obvyklou účastnickou identitu.

## Povinné produkční nastavení Supabase

Nasazení zdrojů webu **nemění externí šablony Supabase Auth**. Ve správném projektu podle produkčního `NEXT_PUBLIC_SUPABASE_URL`:

1. Soukromě zálohujte pouze obě dotčené šablony, předměty a povolené návraty.
2. Do **Magic Link / OTP** i **Confirm signup** vložte přesně `config/supabase-email-otp.html`. Oběma nastavte předmět „Váš přihlašovací odkaz a kód“. Management API používá `mailer_templates_magic_link_content`, `mailer_templates_confirmation_content`, `mailer_subjects_magic_link` a `mailer_subjects_confirmation`.
3. Zachovejte všechny dosavadní povolené návratové URL. Přidejte cestu `https://<host>/api/auth/email**` pro ptbk.io, www.ptbk.io, new.ptbk.io, pavolhejny.cz, www.pavolhejny.cz, pavolhejny.com, www.pavolhejny.com, ai-ta-krajta.cz a www.ai-ta-krajta.cz. Wildcard je omezen na tuto callback cestu a pokrývá její query. Nepovolujte obecné cizí domény. Produkční Site URL zůstává beze změny.
4. Nastavení znovu přečtěte a ověřte shodu. Neměňte SMTP, klíče, uživatele, doby platnosti ani ostatní ochrany Auth.
5. Vyžádejte nový e-mail z konkrétního místa a zkontrolujte cíl tlačítka, kliknutí, skutečnou relaci a přesný návrat. Samostatným novým e-mailem ověřte ruční kód a poté neplatnost již použitého odkazu. Dříve odeslané e-maily se zpětně nezmění.

Připravený operátorský příkaz `node scripts/auth/configure-email-login.mjs` načte aktuální konfiguraci a ukáže jen souhrn potřebných změn. Potřebuje `NEXT_PUBLIC_SUPABASE_URL` a oprávněný `SUPABASE_ACCESS_TOKEN` v prostředí. S `--apply` nejdříve zapíše soukromou zálohu dotčených polí do ignorované `.tmp/auth-email/`, změní jen tato pole a seznam návratů a provede readback. Nespouští se při buildu ani automaticky.

Volitelný samostatný odesílatel avatara používá stejný callback a přidává v textu i číselný kód. Nemění odesílatele jiných produktů. Starší avatarové odkazy s `#login_token` zůstávají zpracovatelné.

Dokumentace: [šablony](https://supabase.com/docs/guides/auth/auth-email-templates), [návratové URL](https://supabase.com/docs/guides/auth/redirect-urls), [Management API](https://supabase.com/docs/reference/api/v1-update-auth-service-config).
