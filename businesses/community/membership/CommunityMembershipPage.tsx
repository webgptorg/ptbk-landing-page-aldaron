'use client';

import { COMMUNITY_PATH } from '@/businesses/community/config';
import { ScrollToRegistrationSection } from '@/components/discounts/ScrollToRegistrationSection';
import { Header } from '@/components/header';
import { MinimalFooter } from '@/components/minimal-footer';
import { Button } from '@/components/ui/button';
import type { CommunityPreview } from '@/lib/community/communityPreviewTypes';
import type { ActiveDiscountByPlaceId } from '@/lib/discounts/discountCode';
import { REGISTRATION_SECTION_ID } from '@/lib/discounts/discountCodeConstants';
import { useDiscountCodeValidation } from '@/lib/discounts/useDiscountCodeValidation';
import { cn } from '@/lib/utils';
import {
    ArrowRight,
    BookOpenCheck,
    Check,
    Code2,
    Crown,
    FolderGit2,
    LockKeyhole,
    MessageSquareText,
    ShieldCheck,
    Video,
    type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { CommunityMembershipActivitySection } from './CommunityMembershipActivitySection';
import {
    COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID,
    CURRENT_PAID_COMMUNITY_MEMBERSHIP_MONTHLY_PRICE_CZK,
    getCommunityMembershipFeature,
    type CommunityMembershipFeatureId,
} from './communityMembershipConfig';
import { CommunityMembershipLivePreview } from './CommunityMembershipLivePreview';
import { CommunityMembershipRegistrationForm } from './CommunityMembershipRegistrationForm';
import { CommunityMembershipWebinarArchive } from './CommunityMembershipWebinarArchive';
import { formatCommunityMembershipPrice } from './communityMembershipPrice';

type CommunityMembershipPageProps = {
    readonly initialFullname: string;
    readonly initialEmail: string;
    readonly initialDiscountCode: string;
    readonly initialActiveDiscountByPlaceId: ActiveDiscountByPlaceId;

    /**
     * The community as it really is right now, which the page shows instead of an imagined one
     */
    readonly communityPreview: CommunityPreview;
};

type BenefitCard = {
    readonly icon: LucideIcon;
    readonly title: string;
    readonly description: string;
};

type MembershipOption = {
    readonly id: 'free' | 'paid';
    readonly icon: LucideIcon;
    readonly title: string;
    readonly description: string;
    readonly price: string;
    readonly priceDetail: string;
    readonly featureIds: readonly CommunityMembershipFeatureId[];
    readonly isHighlighted: boolean;
};

const BENEFIT_CARDS: readonly BenefitCard[] = [
    {
        icon: Video,
        title: 'Záznamy po vysílání',
        description: 'Po vysílání přidáme záznam do archivu. Starší webináře v něm zůstávají.',
    },
    {
        icon: FolderGit2,
        title: 'Materiály k webinářům',
        description: 'Návody, repozitáře a checklisty k jednotlivým tématům.',
    },
    {
        icon: MessageSquareText,
        title: 'Dotaz předem',
        description: 'Pošlete ho před vysíláním. V živém chatu ho vezmeme přednostně.',
    },
    {
        icon: Code2,
        title: 'Discord pro členy',
        description: 'Vstup do placené části komunitního Discordu.',
    },
];

const CURRENT_PAID_MEMBERSHIP_PRICE_LABEL = formatCommunityMembershipPrice(
    CURRENT_PAID_COMMUNITY_MEMBERSHIP_MONTHLY_PRICE_CZK,
);

const FREE_MEMBERSHIP_FEATURE_IDS = [
    'live-workshops',
    'community-materials',
    'member-discussion',
] as const satisfies readonly CommunityMembershipFeatureId[];

const PAID_MEMBERSHIP_FEATURE_IDS = [
    'workshop-recordings',
    'exclusive-content',
    'workshop-question-priority',
    'paid-discord',
] as const satisfies readonly CommunityMembershipFeatureId[];

const MEMBERSHIP_OPTIONS: readonly MembershipOption[] = [
    {
        id: 'free',
        icon: Code2,
        title: 'Komunita zdarma',
        description: 'Živá vysílání a komunita.',
        price: '0 Kč',
        priceDetail: 'bez platebních údajů',
        featureIds: FREE_MEMBERSHIP_FEATURE_IDS,
        isHighlighted: false,
    },
    {
        id: 'paid',
        icon: Crown,
        title: 'Placené členství',
        description: 'Záznamy, materiály a dotazy předem i po vysílání.',
        price: CURRENT_PAID_MEMBERSHIP_PRICE_LABEL,
        priceDetail: 'zrušení e-mailem',
        featureIds: PAID_MEMBERSHIP_FEATURE_IDS,
        isHighlighted: true,
    },
];

function createCommunityRoomHref(fullname: string, email: string): string {
    const searchParameters = new URLSearchParams();
    if (fullname) {
        searchParameters.set('fullname', fullname);
    }
    if (email) {
        searchParameters.set('email', email);
    }

    const query = searchParameters.toString();
    return query ? `${COMMUNITY_PATH}?${query}` : COMMUNITY_PATH;
}

function MembershipOptionCard({
    option,
    basicHref,
    onSelectPaidMembership,
}: {
    option: MembershipOption;
    basicHref: string;
    onSelectPaidMembership: () => void;
}) {
    return (
        <article
            className={cn(
                'relative flex h-full flex-col rounded-[2rem] border bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-7',
                option.isHighlighted ? 'border-cyan-400 ring-4 ring-cyan-100/70' : 'border-slate-200',
            )}
        >
            {option.isHighlighted && (
                <div className="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                    <Check className="h-3.5 w-3.5 text-cyan-300" /> {CURRENT_PAID_MEMBERSHIP_PRICE_LABEL} za měsíc
                </div>
            )}

            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-bold text-slate-950">{option.title}</h3>
                    <p className="mt-2 min-h-12 text-sm leading-relaxed text-slate-500">{option.description}</p>
                </div>
                <div
                    className={cn(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
                        option.isHighlighted ? 'bg-slate-950 text-cyan-200' : 'bg-slate-100 text-slate-600',
                    )}
                >
                    <option.icon className="h-5 w-5" />
                </div>
            </div>

            <div className="mt-7 border-t border-slate-100 pt-6">
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold tracking-tight text-slate-950">{option.price}</span>
                    {option.id === 'paid' && <span className="text-sm text-slate-500">/ měsíc</span>}
                </div>
                <p className="mt-2 text-xs text-slate-500">{option.priceDetail}</p>
            </div>

            <div className="mt-6 flex-1 border-t border-slate-100 pt-6">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    {option.id === 'paid' ? 'Co získáte navíc' : 'Co máte zdarma'}
                </p>
                <ul className="mt-4 space-y-3">
                    {option.featureIds.map((featureId) => (
                        <li key={featureId} className="flex gap-3 text-sm leading-relaxed text-slate-700">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                            <span>{getCommunityMembershipFeature(featureId).label}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {option.id === 'free' ? (
                <Button asChild variant="outline" className="mt-7 h-11 rounded-full border-slate-300">
                    <Link href={basicHref}>Vstoupit zdarma</Link>
                </Button>
            ) : (
                <Button
                    type="button"
                    onClick={onSelectPaidMembership}
                    className="mt-7 h-11 rounded-full bg-slate-950 text-white hover:bg-slate-800"
                >
                    Chci záznamy a materiály <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            )}
        </article>
    );
}

function SimpleMembershipComparison({
    basicHref,
    onSelectPaidMembership,
}: {
    basicHref: string;
    onSelectPaidMembership: () => void;
}) {
    return (
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2 md:items-stretch">
            {MEMBERSHIP_OPTIONS.map((option) => (
                <MembershipOptionCard
                    key={option.id}
                    option={option}
                    basicHref={basicHref}
                    onSelectPaidMembership={onSelectPaidMembership}
                />
            ))}
        </div>
    );
}

export function CommunityMembershipPage({
    initialFullname,
    initialEmail,
    initialDiscountCode,
    initialActiveDiscountByPlaceId,
    communityPreview,
}: CommunityMembershipPageProps) {
    const discountCodeValidation = useDiscountCodeValidation({
        initialDiscountCode,
        initialActiveDiscountByPlaceId,
        discountPlaceId: COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID,
    });
    const basicHref = useMemo(
        () => createCommunityRoomHref(initialFullname, initialEmail),
        [initialEmail, initialFullname],
    );
    const personalizedHeroTitle = initialFullname
        ? `${initialFullname}, živé webináře máte zdarma.`
        : 'Živé webináře máte zdarma.';
    const personalizedRegistrationTitle = initialFullname
        ? `${initialFullname}, chcete se k webinářům vracet?`
        : 'Chcete se k webinářům vracet?';

    const selectPaidMembership = () => {
        window.requestAnimationFrame(() => {
            document.getElementById(REGISTRATION_SECTION_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    };

    return (
        <main className="min-h-screen bg-white text-slate-900">
            <ScrollToRegistrationSection
                isScrollRequested={initialDiscountCode !== ''}
                registrationSectionId={REGISTRATION_SECTION_ID}
            />
            <Header
                language="cs"
                brandHref="/cs"
                brandContext={{ label: 'Vývojáři', href: COMMUNITY_PATH }}
                centerContent={
                    <>
                        <Video className="h-4 w-4 text-emerald-600" />
                        <span>Komunita pro práci s AI</span>
                    </>
                }
                secondaryAction={{ label: 'Otevřít komunitu', href: basicHref }}
                primaryAction={{
                    label: `Členství za ${CURRENT_PAID_MEMBERSHIP_PRICE_LABEL}`,
                    mobileLabel: CURRENT_PAID_MEMBERSHIP_PRICE_LABEL,
                    href: `#${REGISTRATION_SECTION_ID}`,
                }}
            />

            <section className="relative overflow-hidden bg-[#071923] pt-24 text-white sm:pt-28">
                <div
                    className="pointer-events-none absolute inset-0 opacity-70"
                    aria-hidden="true"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at 12% 20%, rgba(54, 211, 238, 0.18), transparent 30%), radial-gradient(circle at 84% 25%, rgba(167, 139, 250, 0.16), transparent 27%), linear-gradient(rgba(122, 235, 255, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(122, 235, 255, 0.035) 1px, transparent 1px)',
                        backgroundSize: 'auto, auto, 44px 44px, 44px 44px',
                    }}
                />
                <div className="container relative mx-auto grid items-center gap-14 px-4 pb-20 pt-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:pb-28 lg:pt-16">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100/15 bg-cyan-200/10 px-4 py-2 text-sm font-semibold text-cyan-100">
                            <Video className="h-4 w-4" /> Když vysílání skončí
                        </div>
                        <h1 className="mt-6 text-4xl font-bold leading-[1.07] tracking-tight text-white sm:text-5xl lg:text-6xl">
                            {personalizedHeroTitle}
                        </h1>
                        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
                            Na živé vysílání přijďte zdarma. Za {CURRENT_PAID_MEMBERSHIP_PRICE_LABEL} měsíčně získáte
                            záznamy, archiv, materiály a možnost poslat dotaz předem.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Button
                                asChild
                                size="lg"
                                className="h-13 rounded-full bg-cyan-300 px-7 text-base font-bold text-slate-950 hover:bg-cyan-200"
                            >
                                <Link href={`#${REGISTRATION_SECTION_ID}`}>
                                    Chci záznamy a materiály <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="h-13 rounded-full border-white/20 bg-white/5 px-7 text-base text-white hover:bg-white/10 hover:text-white"
                            >
                                <Link href="#ceny">Srovnat možnosti</Link>
                            </Button>
                        </div>
                        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
                            {[
                                'Živě zdarma',
                                `${CURRENT_PAID_MEMBERSHIP_PRICE_LABEL} / měsíc`,
                                'Zrušení e-mailem',
                            ].map((item) => (
                                <span key={item} className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-emerald-300" /> {item}
                                </span>
                            ))}
                        </div>
                    </div>
                    <CommunityMembershipLivePreview preview={communityPreview} />
                </div>
            </section>

            <section id="vyhody" className="bg-white py-20 sm:py-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl">
                        <p className="text-sm font-bold uppercase tracking-[0.14em] text-cyan-700">Po vysílání</p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                            Webinář skončí. Záznam zůstane.
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed text-slate-600">
                            Členství využijete, když si chcete webinář pustit znovu, stáhnout materiály nebo poslat dotaz
                            ještě před začátkem.
                        </p>
                    </div>
                    <div className="mt-10 grid gap-5 md:grid-cols-2">
                        {BENEFIT_CARDS.map((benefit) => (
                            <article
                                key={benefit.title}
                                className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6"
                            >
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-cyan-700 shadow-sm ring-1 ring-slate-200">
                                    <benefit.icon className="h-5 w-5" />
                                </div>
                                <h3 className="mt-5 text-xl font-bold text-slate-950">{benefit.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">{benefit.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <CommunityMembershipWebinarArchive preview={communityPreview} />

            <CommunityMembershipActivitySection preview={communityPreview} communityHref={basicHref} />

            <section id="ceny" className="bg-white py-20 sm:py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="text-sm font-bold uppercase tracking-[0.14em] text-cyan-700">
                            Vyberte si, co potřebujete
                        </p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                            Živě zdarma. Záznamy a materiály za {CURRENT_PAID_MEMBERSHIP_PRICE_LABEL} měsíčně.
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed text-slate-600">
                            Chcete jen přijít na webinář a být v komunitě? Nic neplaťte. Členství si aktivujte, až budete
                            chtít záznamy, archiv, materiály nebo posílat dotazy předem.
                        </p>
                    </div>
                    <SimpleMembershipComparison basicHref={basicHref} onSelectPaidMembership={selectPaidMembership} />
                </div>
            </section>

            <section id={REGISTRATION_SECTION_ID} className="scroll-mt-20 bg-white py-20 sm:py-24">
                <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(430px,1fr)] lg:items-start">
                    <div className="lg:sticky lg:top-28">
                        <p className="text-sm font-bold uppercase tracking-[0.14em] text-cyan-700">Přihláška</p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                            {personalizedRegistrationTitle}
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed text-slate-600">
                            Pošlete jméno a e-mail. Potvrzení, platební údaje i další krok k aktivaci pošleme e-mailem.
                        </p>
                        <div className="mt-8 space-y-4">
                            {[
                                {
                                    icon: ShieldCheck,
                                    title: '199 Kč za měsíc',
                                    text: 'Neplatíte nic na rok dopředu.',
                                },
                                {
                                    icon: LockKeyhole,
                                    title: 'Zrušení e-mailem',
                                    text: 'Napište nám. Členství doběhne do konce zaplaceného období.',
                                },
                                {
                                    icon: BookOpenCheck,
                                    title: 'Po aktivaci',
                                    text: 'Odemknou se záznamy, archiv, materiály a přednostní dotazy.',
                                },
                            ].map((item) => (
                                <div key={item.title} className="flex gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-950">{item.title}</h3>
                                        <p className="mt-1 text-sm text-slate-500">{item.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <CommunityMembershipRegistrationForm
                        initialFullname={initialFullname}
                        initialEmail={initialEmail}
                        discountCodeValidation={discountCodeValidation}
                    />
                </div>
            </section>

            <section className="border-t border-slate-200 bg-slate-50 py-12">
                <div className="container mx-auto px-4">
                    <div className="mx-auto flex max-w-4xl items-start gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:p-6">
                        <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
                        <div>
                            <h2 className="font-bold text-slate-950">Jak členství zrušit</h2>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                Členství stojí {CURRENT_PAID_MEMBERSHIP_PRICE_LABEL} měsíčně. Když ho budete chtít
                                zrušit, napište nám e-mail. Přístup vám zůstane do konce zaplaceného období. Podrobnosti
                                najdete v obchodních podmínkách.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <MinimalFooter />
        </main>
    );
}
