'use client';
import Link from 'next/link';
import { useSiteLocale } from './LocaleProvider';
import { FAQ } from './faqData';
import { PurchaseActions } from './PurchaseActions';
import s from './site.module.css';
import x from './launch.module.css';
const trialFaq = {
    cs: [
        [
            'Kdy začíná 14denní zkouška?',
            'Až ji výslovně spustíte v členské sekci po přípravě enginu. Kartu nepotřebujete. Po skončení nic automaticky nestrhneme; placené pokračování sami objednáte.',
        ],
        [
            'Co licence zahrnuje a co platím zvlášť?',
            'Start i Business jsou softwarové licence s komunitou a podporou. AI účty, API a případný server si hradíte sami. Business zkouška má po dobu zkoušky stejný rozsah včetně 10 komunitních míst.',
        ],
    ],
    en: [
        [
            'How can I get started?',
            'Tell us which ongoing responsibility you want to hand over. Online purchasing currently serves Czechia and Slovakia through the Czech website; English enquiries go to our team.',
        ],
        [
            'What does the licence include?',
            'Software, community access and product support. You pay for your own AI accounts, API usage and any server separately.',
        ],
    ],
};
export function RulesSection() {
    const { locale, path } = useSiteLocale();
    const en = locale === 'en';
    return (
        <section className={s.section} id="pravidla">
            <div className={s.sectionTitle}>
                <h2>
                    {en ? 'Your rules. A team that works by them.' : 'Vaše pravidla. Tým, který podle nich pracuje.'}
                </h2>
                <p>
                    {en
                        ? 'Describe the ongoing responsibility, give the team context and set boundaries. Agents keep track of work, share roles and bring exceptions back to you. Your feedback shapes the next run.'
                        : 'Popíšete dlouhodobou agendu, předáte kontext a nastavíte hranice. Agenti si rozdělí role, navazují na rozpracovanou práci a vracejí vám výjimky. Vaše zpětná vazba ovlivní další běh.'}
                </p>
            </div>
            <Link className={s.textLink} href={path('co-umi')}>
                {en ? 'Explore how it works →' : 'Co Promptbook umí →'}
            </Link>
        </section>
    );
}
export function QuickStartTeaser() {
    const { locale, path } = useSiteLocale();
    const en = locale === 'en';
    return (
        <section className={x.quickStart}>
            <div>
                <h2>{en ? 'Start with one ongoing responsibility' : 'Jak rychle začít'}</h2>
                <p>
                    {en
                        ? 'Prepare the engine, sign in to your AI and give the team its first agenda.'
                        : 'Připravte engine, přihlaste svou AI a předejte týmu první agendu.'}
                </p>
            </div>
            <Link className={s.textLink} href={path('navody')}>
                {en ? 'Open the quickstart →' : 'Otevřít rychlý start →'}
            </Link>
        </section>
    );
}
export function LaunchFaq() {
    const { locale, t, path } = useSiteLocale();
    const selected = FAQ.filter(([q]) =>
        [
            'Musím umět programovat?',
            'Funguje to i s vypnutým notebookem?',
            'Co když AI udělá chybu?',
            'Kam jdou naše data?',
            'Jak svou agendu ovládám?',
        ].includes(q),
    );
    return (
        <section className={s.section}>
            <div className={s.sectionTitle}>
                <h2>{locale === 'en' ? 'Before your first agenda' : 'Než předáte první agendu'}</h2>
            </div>
            <div className={s.faq}>
                {[...trialFaq[locale], ...selected].map(([q, a]) => (
                    <details key={q}>
                        <summary>{t(q)}</summary>
                        <p>{t(a)}</p>
                    </details>
                ))}
            </div>
            <Link className={s.textLink} href={path('faq')}>
                {locale === 'en' ? 'All questions →' : 'Všechny otázky →'}
            </Link>
        </section>
    );
}
export function LaunchClosing() {
    const { locale } = useSiteLocale();
    return (
        <section className={s.ctaBand}>
            <div>
                <h2>
                    {locale === 'en'
                        ? 'Hand over your first ongoing responsibility'
                        : 'Předejte první agendu ještě dnes.'}
                </h2>
                <p>
                    {locale === 'en'
                        ? 'Discuss the work you want your agent team to keep looking after.'
                        : '14 dní Business bez karty. Zkoušku spustíte, až budete připraveni.'}
                </p>
            </div>
            <PurchaseActions />
        </section>
    );
}
