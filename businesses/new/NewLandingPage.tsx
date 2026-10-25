'use client';

import Link from 'next/link';
import { ArrowRight, Handshake, Layers, Users } from 'lucide-react';
import { useSiteLocale } from './LocaleProvider';
import { licencePrice, formatCurrency } from './localization';
import { COMMERCIAL_TERMS } from './commercialTerms';
import { EconomicsCalculator } from './EconomicsCalculator';
import { Founders } from './Founders';
import { BrandActions } from './BrandActions';
import { BrandStories } from './BrandStories';
import { OwnershipScene } from './OwnershipScene';
import { BrandTestimonials } from './BrandTestimonials';
import { PricingCards } from './MarketingSections';
import { InlineContactForm } from './InlineContactForm';
import b from './brand.module.css';

/** One product story, adapted to people running agendas and partners delivering them. */
export function NewLandingPage({ partnership = false, showTestimonials = true }: { partnership?: boolean; showTestimonials?: boolean }) {
    const { locale, path } = useSiteLocale();
    const en = locale === 'en';
    return <div className={b.brandPage}>
        <section className={b.hero} aria-labelledby="brand-heading" data-testid="brand-hero">
            <h1 id="brand-heading">{partnership ? (en ? 'Your clients. Your services' : 'Vaši klienti. Vaše služby') : (en ? 'You used to give AI tasks' : 'Dřív jste AI úkolovali')}<span className={b.heroReveal}>{partnership ? (en ? 'Our technology' : 'Naše technologie') : (en ? 'Now it works for you' : 'Teď pracuje pro vás')}</span></h1>
            <p className={`${b.promise} ${b.heroPromise}`}>{en ? 'Your AI. On your machine. Under your control.' : 'Vaše AI. Na vašem stroji. Pod vaší kontrolou.'}</p>
            <p className={b.intro}>{partnership
                ? (en ? 'Bring clients AI that takes care of ongoing work. You know their business. We provide the engine, app and product support. You earn from your services and a share of their licence.' : 'Dodávejte klientům AI, která se průběžně stará o jejich práci. Vy znáte jejich podnikání. My dodáváme engine, aplikaci a produktovou podporu. Vyděláváte na svých službách i podílu z licence.')
                : (en ? 'Hand over a responsibility, set the rules and let work move forward. Your agents follow up, find the next step and bring you the decisions that need you.' : 'Předáte agendu, nastavíte pravidla a práce pokračuje. Vaši agenti navazují, hledají další kroky a přinášejí vám rozhodnutí, ke kterým potřebují vás.')}</p>
            <BrandActions partner={partnership}/>
            <Link className={b.partnerLink} href={path(partnership ? '' : 'partnership')}>
                {partnership ? (en ? 'Explore Promptbook' : 'Prohlédnout Promptbook') : (en ? 'For partners · 20% licence share' : 'Pro partnery · 20% podíl z licencí')}<ArrowRight size={15}/>
            </Link>
        </section>
        <BrandStories partnership={partnership}/>
        <OwnershipScene/>
        {partnership && <PartnerOffer/>}
        <section className={b.pricing} id="cenik" aria-labelledby="pricing-heading">
            <h2 id="pricing-heading">{en ? 'Plans' : 'Ceník'}</h2>
            <PricingCards/>
        </section>
        <EconomicsCalculator initialMode={partnership ? 'partner' : 'company'}/>
        {partnership && <PartnerQuestions/>}
        {showTestimonials && <BrandTestimonials/>}
        <section className={b.founders} id="kontakt" aria-labelledby="contact-heading">
            <div className={b.foundersIntro}><h2 id="contact-heading">{en ? 'Contact' : 'Kontakt'}</h2></div>
            <Founders compact/>
            <div className={b.storyLink}><Link href={path('o-nas')}>{en ? 'Our story' : 'Náš příběh'}<ArrowRight size={16}/></Link></div>
        </section>
        <InlineContactForm partnership={partnership}/>
    </div>;
}

/** Partner responsibilities and the existing, fixed commercial share. */
function PartnerOffer() {
    const { locale, t } = useSiteLocale();
    const en = locale === 'en';
    const values = [
        {Icon:Users,title:en?'Your client. Your expertise.':'Váš klient. Vaše odbornost.',text:en?'Choose a useful responsibility, connect the client’s systems and define what the agents may do. You deliver setup, training and ongoing care.':'Vyberete smysluplnou agendu, připojíte klientovy systémy a nastavíte, co agenti smějí. Dodáte nasazení, zaškolení i průběžnou péči.'},
        {Icon:Layers,title:en?'Engine, app and support.':'Engine, aplikace a podpora.',text:en?'A common foundation for each deployment. The engine works in the client’s environment, the app provides control, and we provide the agreed product support.':'Společný základ pro každé nasazení. Engine pracuje u klienta, aplikace slouží k ovládání a my zajišťujeme sjednanou produktovou podporu.'},
        {Icon:Handshake,title:en?'A service that continues.':'Služba, která pokračuje.',text:en?'Charge for your implementation and ongoing work. Alongside it, receive a fixed share of paid Promptbook licences from clients you bring.':'Fakturujete vlastní implementaci a průběžnou práci. Vedle toho získáváte pevný podíl z uhrazených licencí Promptbooku od klientů, které přivedete.'},
    ];
    return <>
        <section className={b.section}><div className={b.sectionIntro}><h2>{en?'Partnership':'Partnerství'}</h2><p>{en?'For agencies, freelancers and integrators. Keep your client relationship and your own pricing, with a platform you can understand and operate.':'Pro agentury, freelancery a integrátory. Klientský vztah i ceny vašich služeb zůstávají vám. Pod nimi stojí platforma, které rozumíte a kterou můžete sami provozovat.'}</p></div><div className={b.valueGrid}>{values.map(({Icon,title,text})=><article key={title} className={b.value}><Icon aria-hidden="true"/><h3>{title}</h3><p>{text}</p></article>)}</div></section>
        <section className={b.partnerEconomy} aria-labelledby="partner-share-title">
            <div><h2 id="partner-share-title">{en?'20% for you.':'20 % pro vás.'}<br/><span>{en?'No partner subscription.':'Bez partnerského paušálu.'}</span></h2><p>{en?'The client pays their Promptbook licence directly to us. We pay your partner share. You set the price of your own implementation and service.':'Klient platí licenci Promptbooku přímo nám. My vám vyplácíme partnerský podíl. Cenu vlastní implementace a servisu určujete vy.'}</p><p className={b.finePrint}>{t(COMMERCIAL_TERMS.share)} {t(COMMERCIAL_TERMS.shareTerm)}</p></div>
            <div className={b.shareIllustration}><div className={b.shareRow}><div className={b.shareTile}><span>{en?'Business licence':'Licence Business'}</span><strong>{licencePrice('business',locale)}</strong><small>{en?'per month / client environment':'měsíčně / klientské prostředí'}</small></div><ArrowRight size={22}/><div className={b.shareTile}><span>{en?'Your 20% share':'Váš 20% podíl'}</span><strong>{formatCurrency(COMMERCIAL_TERMS.businessUsd*COMMERCIAL_TERMS.displayCzkPerUsd*COMMERCIAL_TERMS.partnerSharePercent/100,locale)}</strong><small>{en?'plus your own services':'navíc k vašim službám'}</small></div></div><p>{en?'Example before VAT and refunds.':'Příklad bez DPH a vratek.'}</p></div>
        </section>

    </>;
}

/** Practical questions with unchanged commercial terms. */
function PartnerQuestions() {
    const { locale, path, t } = useSiteLocale(); const en=locale==='en';
    const questions=[
        [en?'Who is the partnership for?':'Pro koho je partnerství?',en?'Agencies, freelancers and integrators who know their clients and can deliver setup and ongoing care. Your team’s size matters less than your ability to run a useful service.':'Pro agentury, freelancery a integrátory, kteří znají klienty a dokážou zajistit nasazení i průběžnou péči. Velikost týmu není zásadní. Důležitá je schopnost dodávat užitečnou službu.'],
        [en?'How does the partner share work?':'Jak funguje partnerský podíl?',`${t(COMMERCIAL_TERMS.share)} ${t(COMMERCIAL_TERMS.shareTerm)}`],
        [en?'Do I need to buy licences in advance?':'Musím předem kupovat licence?',en?'There is no partner subscription or mandatory licence bundle. The client pays Promptbook directly. Your own production use follows the licence terms of the version you use.':'Žádný partnerský paušál ani povinný balík licencí. Klient platí přímo Promptbooku. Vlastní produkční používání se řídí licenčními podmínkami dané verze.'],
        [en?'Who handles support?':'Kdo zajišťuje podporu?',en?'You take care of the client’s deployment and everyday service. Promptbook provides agreed product support. Business includes an initial substantive response within 16 working hours; it is not round-the-clock human support.':'Vy pečujete o klientovo nasazení a běžný provoz. Promptbook dodává sjednanou produktovou podporu. Business zahrnuje první věcnou reakci do 16 pracovních hodin; nepřetržitou lidskou pohotovost neposkytuje.'],
        [en?'Can I just recommend Promptbook?':'Mohu Promptbook jen doporučovat?',en?'Yes, get in touch and we’ll discuss a suitable collaboration. Implementation-partner terms do not automatically apply to every referral or creator.':'Ano, ozvěte se a domluvíme vhodnou spolupráci. Podmínky implementačního partnerství se automaticky nevztahují na každé doporučení nebo tvůrce.'],
    ];
    return <section className={b.section}><div className={b.sectionIntro}><h2>{en?'A clear agreement.':'Jasná dohoda.'}<br/><span>{en?'Room for your own services.':'Prostor pro vaše služby.'}</span></h2></div><div className={b.faq}>{questions.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}<details><summary>{en?'Where are the full pricing and support terms?':'Kde najdu celý ceník a podmínky podpory?'}</summary><p><Link href={path('cenik')}>{en?'See pricing, included support and separate costs.':'Prohlédnout ceník, zahrnutou podporu a samostatné náklady.'}</Link></p></details></div></section>;
}
