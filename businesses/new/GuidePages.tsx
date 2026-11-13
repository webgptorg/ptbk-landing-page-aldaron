'use client';
import Link from 'next/link';
import { PageIntro } from './InformationPages';
import { useSiteLocale } from './LocaleProvider';
import { PurchaseActions } from './PurchaseActions';
import { LeadButton } from './LeadCapture';
import { COMMERCIAL_TERMS } from './commercialTerms';
import s from './site.module.css';
export function GuidesPage() {
    const { locale, path } = useSiteLocale();
    const en = locale === 'en';
    const steps = en
        ? [
              [
                  'Prepare your engine',
                  'Use the current Windows or macOS installer, npm, or the documented Ubuntu server installation. Keep the machine running when you want agents to work.',
              ],
              [
                  'Connect your own AI',
                  'Sign in to a supported AI tool or configure your API access. AI subscriptions and usage are separate from the Promptbook licence. Never paste credentials into a chat.',
              ],
              [
                  'Give the team one ongoing responsibility',
                  'Describe the outcome, recurring inputs, roles and rules. Begin with preparation and review; allow external actions only within your chosen permissions.',
              ],
              [
                  'Review and continue',
                  'Check real results in the local Console. Give feedback and let the next run build on it. Czech trial users start their 14 days explicitly after setup.',
              ],
          ]
        : [
              [
                  'Připravte engine',
                  'Použijte aktuální instalátor pro Windows nebo macOS, npm či popsanou instalaci na Ubuntu server. Stroj nechte běžet, když mají agenti pracovat.',
              ],
              [
                  'Přihlaste svou AI',
                  'Připojte podporovaný AI nástroj nebo vlastní API přístup. Předplatné AI a spotřeba se hradí zvlášť od licence Promptbooku. Hesla a klíče nevkládejte do chatu.',
              ],
              [
                  'Předejte jednu dlouhodobou agendu',
                  'Popište výsledek, opakované vstupy, role a pravidla. Začněte přípravou a kontrolou výstupů; externí akce povolujte podle svých potřeb.',
              ],
              [
                  'Zkontrolujte výsledek a pokračujte',
                  'Práci sledujete v lokální Console. Zpětná vazba se promítne do dalších běhů. Až budete mít engine připravený, výslovně spustíte 14denní zkoušku v členské sekci.',
              ],
          ];
    return (
        <>
            <PageIntro title={en ? 'Quickstart and guides' : 'Návody a rychlý start'}>
                {en ? 'From installation to an ongoing agenda.' : 'Od instalace k agendě, která pokračuje.'}
            </PageIntro>
            <div className={s.prose}>
                {steps.map(([q, a], i) => (
                    <section key={q}>
                        <h2>
                            {i + 1}. {q}
                        </h2>
                        <p>{a}</p>
                    </section>
                ))}
                <p>
                    {en
                        ? 'The remote app is in preparation. Today use the local terminal or desktop Console.'
                        : 'Vzdálenou appku připravujeme. Dnes použijte lokální terminálovou nebo desktopovou Console.'}
                </p>
                <div className={s.actions}>
                    <Link className={s.button} href={path('open-source')}>
                        {en ? 'Choose an installation method' : 'Vybrat způsob instalace'}
                    </Link>
                    <Link className={s.secondaryButton} href={path('agendy')}>
                        {en ? 'Choose an agenda' : 'Vybrat agendu'}
                    </Link>
                </div>
                <h2>{en ? 'Concrete walkthroughs' : 'Konkrétní postupy'}</h2>
                {[
                    ['pece-o-kontakty', 'Péče o kontakty', 'Contact care'],
                    ['sprava-podcastu', 'Správa podcastů', 'Podcast management'],
                    ['udrzba-webu', 'Údržba webu', 'Website maintenance'],
                ].map(([slug, cs, eng]) => (
                    <p key={slug}>
                        <Link href={'/cs/komunity/promptbook/clanky/cs/' + slug} hrefLang="cs">
                            {en ? eng + ' (Czech)' : cs} →
                        </Link>
                    </p>
                ))}
                <p>
                    {en
                        ? 'Project file history helps review changes; reverting a file does not undo an email or a publication in another system.'
                        : 'Historie souborů pomáhá kontrolovat změny. Návrat souboru nevrátí odeslaný e-mail ani publikaci v jiném systému.'}
                </p>
                <PurchaseActions />
            </div>
        </>
    );
}
export function CapabilitiesPage() {
    const { locale, path } = useSiteLocale();
    const en = locale === 'en';
    const blocks = en
        ? [
              [
                  'An ongoing responsibility',
                  'A team keeps working on an agenda over days and weeks: new inputs, scheduled tasks, exceptions and feedback.',
              ],
              [
                  'Your rules and context',
                  'Assign roles, fixed boundaries and access. Agent, task and chat Books are linked files in your project, not a single document you must learn to write.',
              ],
              [
                  'Your environment',
                  'Run the engine on your computer or server. Work continues with the controls closed as long as the engine host remains available.',
              ],
              [
                  'Your model choice',
                  'Use supported AI tools and models. External providers receive the inputs you send; control-channel encryption does not hide them from the chosen model.',
              ],
          ]
        : [
              [
                  'Dlouhodobá odpovědnost',
                  'Tým se stará o agendu po dny a týdny: nové podklady, pravidelné úkoly, výjimky a vaše zpětná vazba.',
              ],
              [
                  'Vaše pravidla a kontext',
                  'Rozdělíte role, pevné hranice a přístupy. Agenti, úkoly a chaty jsou propojené soubory projektu; jejich formát nemusíte znát, abyste předali práci.',
              ],
              [
                  'Vaše prostředí',
                  'Engine spustíte na svém počítači nebo serveru. I po zavření ovládání pokračuje, pokud jeho stroj běží a je dostupný.',
              ],
              [
                  'Vlastní výběr AI',
                  'Použijete podporované AI nástroje a modely. Externí poskytovatel dostává vstupy, které mu odešlete; šifrování ovládacího kanálu je před ním neskrývá.',
              ],
          ];
    return (
        <>
            <PageIntro title={en ? 'What Promptbook does' : 'Co Promptbook umí'}>
                {en ? 'Your rules. A team that works by them.' : 'Vaše pravidla. Tým, který podle nich pracuje.'}
            </PageIntro>
            <section className={s.section}>
                <div className={s.twoColumns}>
                    {blocks.map(([q, a]) => (
                        <article key={q} className={s.card}>
                            <h2>{q}</h2>
                            <p>{a}</p>
                        </article>
                    ))}
                </div>
                <div className={s.actions}>
                    {[
                        ['agendy', en ? 'Use cases' : 'Příklady použití'],
                        ['srovnani', 'Promptbook versus'],
                        ['bezpecnost', en ? 'Data and security' : 'Data a bezpečnost'],
                        ['navody', en ? 'Quickstart' : 'Rychlý start'],
                    ].map(([slug, label]) => (
                        <Link key={slug} className={s.textLink} href={path(slug)}>
                            {label} →
                        </Link>
                    ))}
                </div>
                <PurchaseActions />
            </section>
        </>
    );
}
export function ReferralPage() {
    const { locale, path, t } = useSiteLocale();
    const en = locale === 'en';
    return (
        <>
            <PageIntro title={en ? 'Refer Promptbook' : 'Doporučování Promptbooku'}>
                {en
                    ? 'Recommend useful ongoing automation and keep your own client services.'
                    : 'Doporučujte užitečnou automatizaci a rozvíjejte vlastní služby klientům.'}
            </PageIntro>
            <div className={s.prose}>
                <p>{t(COMMERCIAL_TERMS.share)}</p>
                <p>{t(COMMERCIAL_TERMS.shareTerm)}</p>
                <h2>{en ? 'How to start' : 'Jak začít'}</h2>
                <p>
                    {en
                        ? 'Tell us who you want to help. After agreeing the cooperation we assign a referral code. The code records attribution; a specific deal and commission remain subject to manual confirmation and the agreed terms.'
                        : 'Napište nám, komu chcete pomoci. Po domluvě spolupráce přidělíme doporučovací kód. Kód eviduje původ zájemce; konkrétní obchod i provizi potvrzujeme ručně podle sjednaných podmínek.'}
                </p>
                <p>
                    {en
                        ? 'Referral and discount codes are separate. A customer may use both; the commission uses the amount actually paid after discount.'
                        : 'Doporučovací a slevový kód jsou dvě různé věci. Zákazník může použít oba; provize vychází ze skutečně zaplacené ceny po slevě.'}
                </p>
                <p>
                    {en
                        ? 'Agencies can apply for a manual premium community grant without buying a licence. Automated payouts and an earnings dashboard are not offered yet.'
                        : 'Agentury mohou získat prémiový komunitní přístup ručním udělením i bez nákupu licence. Automatické výplaty ani přehled výdělků zatím nenabízíme.'}
                </p>
                <LeadButton
                    topic={en ? 'Promptbook referral cooperation' : 'Doporučování Promptbooku — žádost o spolupráci'}
                    heading={en ? 'Refer Promptbook' : 'Chci doporučovat Promptbook'}
                >
                    {en ? 'I want to refer Promptbook' : 'Chci doporučovat Promptbook'}
                </LeadButton>
                <p>
                    <Link href={path('partnerske-podminky')}>
                        {en ? 'Full partner terms →' : 'Úplné partnerské podmínky →'}
                    </Link>
                </p>
            </div>
        </>
    );
}
