'use client';

import {
    CURRENT_PAID_COMMUNITY_MEMBERSHIP_BILLING_PERIOD,
    CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN,
    CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID,
    getCommunityMembershipFeature,
    type CommunityMembershipFeatureId,
} from '@/businesses/community/membership/communityMembershipConfig';
import {
    createCommunityMembershipPrice,
    formatCommunityMembershipPrice,
} from '@/businesses/community/membership/communityMembershipPrice';
import { CommunityMembershipPriceDisplay } from '@/businesses/community/membership/CommunityMembershipPriceDisplay';
import { CommunityMembershipTestModeNote } from '@/businesses/community/membership/CommunityMembershipTestModeNote';
import { DiscountCodeField } from '@/components/discounts/DiscountCodeField';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { COMMUNITY_MEMBERSHIP_MESSAGES } from '@/lib/community-membership/communityMembershipMessages';
import {
    isSubscriptionDiscountFullAndPermanent,
    type ActiveDiscountByPlaceId,
} from '@/lib/discounts/discountCode';
import { COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID } from '@/lib/discounts/discountPlaces';
import {
    isDiscountCodeReadyForSubmission,
    useDiscountCodeValidation,
} from '@/lib/discounts/useDiscountCodeValidation';
import { getLegalLink } from '@/lib/legal/legalLinks';
import {
    BookOpenCheck,
    Check,
    CreditCard,
    Crown,
    FolderGit2,
    Loader2,
    MessageSquareText,
    Rss,
    ShieldCheck,
    Sparkles,
    Ticket,
    Video,
    type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';

/**
 * No code is prefilled inside the room, so the same empty answer is reused instead of a new object on every render.
 */
const NO_INITIAL_ACTIVE_DISCOUNTS: ActiveDiscountByPlaceId = {};

/** The offer keeps its feature names in the shared membership registry; this only gives each current benefit a visual cue. */
const PAID_MEMBERSHIP_FEATURE_ICON_BY_ID: Readonly<Partial<Record<CommunityMembershipFeatureId, LucideIcon>>> = {
    'paid-discord': MessageSquareText,
    'workshop-recordings': Video,
    'exclusive-content': BookOpenCheck,
    'creation-showcase': Sparkles,
    'workshop-question-priority': Crown,
    'materials-rss': Rss,
};

const COMMUNITY_MEMBERSHIP_BENEFITS_TITLE_ID = 'community-membership-benefits-title';

type CommunityMembershipPurchasePanelProps = {
    readonly isPaymentInTestMode: boolean;
    readonly isPurchaseStarting: boolean;
    readonly errorMessage: string | null;
    readonly onPurchase: (discountCode: string) => void;
};

/**
 * What the one button of the offer says and promises
 */
type CommunityMembershipPurchaseAction = {
    readonly ActionIcon: LucideIcon;
    readonly label: string;
    readonly startedLabel: string;

    /** The tail of the sentence which follows the link to the terms and conditions */
    readonly termsNote: string;
    readonly assurance: string;
};

function getPaidMembershipFeatureIcon(featureId: CommunityMembershipFeatureId): LucideIcon {
    return PAID_MEMBERSHIP_FEATURE_ICON_BY_ID[featureId] ?? FolderGit2;
}

/**
 * How the offer reads, which is decided by whether anything is ever going to be charged for it.
 *
 * Note: A code which takes the whole price for as long as the membership lasts is a voucher: it is redeemed here and
 *       now, and no card is asked for, because there will never be anything to charge one for. Every other offer,
 *       including a code which takes the whole price for a few months only, opens the payment gate as before.
 */
function createCommunityMembershipPurchaseAction(
    isCoveredByDiscountCode: boolean,
    monthlyPriceCzk: number,
): CommunityMembershipPurchaseAction {
    if (isCoveredByDiscountCode) {
        return {
            ActionIcon: Ticket,
            label: 'Aktivovat členství zdarma',
            startedLabel: 'Aktivuji členství…',
            termsNote: 'a beru na vědomí, že slevový kód pokrývá celé členství, takže se nic neplatí.',
            assurance: 'Slevový kód pokrývá celé členství – kartu ani platbu po vás nechceme. Členství máte hned.',
        };
    }

    return {
        ActionIcon: CreditCard,
        label: `Zaplatit ${formatCommunityMembershipPrice(monthlyPriceCzk)} / měsíc`,
        startedLabel: 'Otevírám platbu…',
        termsNote: 'a beru na vědomí, že platba se opakuje každý měsíc.',
        assurance:
            'Platíte přes zabezpečenou bránu Stripe, kartu nikdy nevidíme. Zrušit můžete kdykoli přímo v komunitě.',
    };
}

function CommunityMembershipFeatureCard({ featureId }: { readonly featureId: CommunityMembershipFeatureId }) {
    const feature = getCommunityMembershipFeature(featureId);
    const FeatureIcon = getPaidMembershipFeatureIcon(featureId);

    return (
        <li className="group relative min-h-28 overflow-hidden rounded-2xl border border-room-border/10 bg-room-inset/[0.34] p-4 shadow-sm shadow-slate-950/20 transition duration-300 hover:-translate-y-0.5 hover:border-room-accent/35 hover:bg-room-overlay/[0.08] hover:shadow-lg hover:shadow-cyan-950/20">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-6 -top-8 h-20 w-20 rounded-full bg-room-accent/[0.06] blur-2xl transition group-hover:bg-room-accent/[0.12]"
            />
            <div className="relative flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-room-accent/15 bg-room-accent/10 text-room-accent shadow-inner shadow-cyan-100/10">
                    <FeatureIcon className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
                </span>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-room-accent/20 bg-room-accent/10 text-room-accent">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
            </div>
            <p className="relative mt-4 pr-2 text-sm font-semibold leading-5 text-room-heading">{feature.label}</p>
        </li>
    );
}

function CommunityMembershipFeatureGrid() {
    const featureIds = CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN.addedFeatureIds;

    return (
        <section
            aria-labelledby={COMMUNITY_MEMBERSHIP_BENEFITS_TITLE_ID}
            className="relative overflow-hidden rounded-[1.75rem] border border-room-accent/20 bg-gradient-to-br from-room-accent/[0.16] via-room-surface to-room-surface p-4 shadow-2xl shadow-cyan-950/30 sm:p-5"
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-room-accent/[0.12] blur-3xl"
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(176,244,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(176,244,255,0.06)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent_42%)]" />
            <div className="relative">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-room-border/10 pb-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-room-accent">Členství zahrnuje</p>
                        <h3 id={COMMUNITY_MEMBERSHIP_BENEFITS_TITLE_ID} className="mt-1 text-xl font-bold tracking-tight text-room-heading">
                            Vše, co využijete i po vysílání
                        </h3>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-room-accent/20 bg-room-accent/10 px-3 py-1.5 text-xs font-semibold text-room-accent shadow-sm shadow-cyan-950/20">
                        <Crown className="h-3.5 w-3.5 text-room-warning" aria-hidden="true" />
                        {featureIds.length} výhod v ceně
                    </span>
                </div>

                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    {featureIds.map((featureId) => (
                        <CommunityMembershipFeatureCard key={featureId} featureId={featureId} />
                    ))}
                </ul>
            </div>
        </section>
    );
}

/**
 * The offer of the paid membership as a connected member meets it: what it adds, what it costs them, and the one
 * button which opens the payment gate.
 *
 * Note: Neither a name nor an address is asked for again. The room already knows who is reading it, which is exactly
 *       what buying the membership here instead of on a public page is for.
 */
export function CommunityMembershipPurchasePanel({
    isPaymentInTestMode,
    isPurchaseStarting,
    errorMessage,
    onPurchase,
}: CommunityMembershipPurchasePanelProps) {
    const [areTermsAccepted, setAreTermsAccepted] = useState(false);
    const [isValidationShown, setIsValidationShown] = useState(false);
    const discountCodeValidation = useDiscountCodeValidation({
        initialDiscountCode: '',
        initialActiveDiscountByPlaceId: NO_INITIAL_ACTIVE_DISCOUNTS,
        discountPlaceId: COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID,
    });
    // The button asks for exactly what the card will be charged, discount included, rather than for the list price.
    const price = createCommunityMembershipPrice(
        CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID,
        CURRENT_PAID_COMMUNITY_MEMBERSHIP_BILLING_PERIOD,
        discountCodeValidation.activeDiscount,
    );
    const isCoveredByDiscountCode = isSubscriptionDiscountFullAndPermanent(discountCodeValidation.activeDiscount);
    const purchaseAction = createCommunityMembershipPurchaseAction(
        isCoveredByDiscountCode,
        price.finalMonthlyEquivalentCzk,
    );
    const PurchaseActionIcon = purchaseAction.ActionIcon;

    const isDiscountCodeReady = isDiscountCodeReadyForSubmission(discountCodeValidation);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!areTermsAccepted || !isDiscountCodeReady) {
            setIsValidationShown(true);
            return;
        }

        setIsValidationShown(false);
        onPurchase(discountCodeValidation.discountCode);
    };

    return (
        <form onSubmit={handleSubmit} className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]" noValidate>
            <CommunityMembershipFeatureGrid />

            <div className="relative overflow-hidden rounded-[1.75rem] border border-room-accent/20 bg-gradient-to-b from-room-surface to-room-background p-4 shadow-2xl shadow-slate-950/40 sm:p-5">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-room-accent/[0.12] blur-3xl"
                />
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-room-accent/70 to-transparent" />
                <div className="relative">
                    <div className="overflow-hidden rounded-2xl border border-room-accent/15 bg-gradient-to-br from-room-accent/[0.09] to-room-overlay/[0.025] p-4 shadow-lg shadow-cyan-950/20">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-room-accent">
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-room-warning/20 bg-room-warning/10 text-room-warning shadow-inner shadow-amber-100/10">
                                    <Crown className="h-4 w-4" aria-hidden="true" />
                                </span>
                                Placené členství
                            </div>
                            <span className="rounded-full border border-room-accent/15 bg-room-inset/20 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-room-accent/80">
                                Měsíční
                            </span>
                        </div>
                        <CommunityMembershipPriceDisplay
                            className="mt-5"
                            planId={CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID}
                            billingPeriod={CURRENT_PAID_COMMUNITY_MEMBERSHIP_BILLING_PERIOD}
                            activeDiscount={discountCodeValidation.activeDiscount}
                            appearance="room"
                        />
                        <div className="mt-4 flex items-center gap-2 border-t border-room-border/10 pt-3 text-xs font-medium text-room-accent/80">
                            <Check className="h-4 w-4 shrink-0 text-room-accent" aria-hidden="true" />
                            {isCoveredByDiscountCode
                                ? 'Přístup ke všem výhodám hned po aktivaci'
                                : 'Přístup ke všem výhodám hned po platbě'}
                        </div>
                    </div>

                    <div className="mt-4">
                        <DiscountCodeField
                            inputId="community-room-membership-discount-code"
                            validation={discountCodeValidation}
                            appearance="room"
                        />
                    </div>

                    <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-room-border/10 bg-room-overlay/[0.035] p-3.5 text-sm leading-6 text-room-text transition hover:border-room-accent/20 hover:bg-room-overlay/[0.05]">
                        <Checkbox
                            checked={areTermsAccepted}
                            onCheckedChange={(checked) => setAreTermsAccepted(checked === true)}
                            className="mt-1 border-room-border/25 data-[state=checked]:border-room-accent data-[state=checked]:bg-room-action data-[state=checked]:text-room-action-foreground"
                            aria-label="Souhlasím s obchodními podmínkami"
                        />
                        <span>
                            Souhlasím s{' '}
                            <Link
                                href={getLegalLink('termsAndConditions', 'cs').href}
                                className="font-semibold text-room-accent underline underline-offset-4"
                            >
                                obchodními podmínkami
                            </Link>{' '}
                            {purchaseAction.termsNote}
                        </span>
                    </label>
                    {isValidationShown && (!areTermsAccepted || !isDiscountCodeReady) && (
                        <p className="mt-1 text-xs text-room-danger">
                            {areTermsAccepted
                                ? COMMUNITY_MEMBERSHIP_MESSAGES.discountCodeNotUsable
                                : COMMUNITY_MEMBERSHIP_MESSAGES.termsNotAccepted}
                        </p>
                    )}

                    {errorMessage !== null && (
                        <p
                            role="alert"
                            className="mt-4 rounded-xl border border-room-danger/25 bg-room-danger/10 px-3 py-2 text-sm text-room-danger"
                        >
                            {errorMessage}
                        </p>
                    )}

                    <Button
                        type="submit"
                        disabled={isPurchaseStarting || discountCodeValidation.isValidationPending}
                        className="mt-4 h-12 w-full rounded-full border border-room-accent/35 bg-gradient-to-r from-room-action via-room-action-hover to-room-action text-base font-bold text-room-action-foreground shadow-lg shadow-cyan-400/20 transition hover:-translate-y-0.5 hover:from-room-action-hover hover:via-room-action-hover hover:to-room-action hover:shadow-cyan-300/30"
                    >
                        {isPurchaseStarting ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <PurchaseActionIcon className="mr-2 h-5 w-5" />
                        )}
                        {isPurchaseStarting ? purchaseAction.startedLabel : purchaseAction.label}
                    </Button>
                    <p className="mt-3 flex gap-2 text-xs leading-5 text-room-muted">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-room-accent" aria-hidden="true" />
                        {purchaseAction.assurance}
                    </p>

                    {/* Nothing goes through the gate for a membership a voucher covers, so its rehearsal is not named
                        beside one either. */}
                    <CommunityMembershipTestModeNote
                        isPaymentInTestMode={isPaymentInTestMode && !isCoveredByDiscountCode}
                    />
                </div>
            </div>
        </form>
    );
}
