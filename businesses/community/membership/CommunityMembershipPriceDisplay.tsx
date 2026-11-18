import { describeDiscount } from '@/lib/discounts/discountPricing';
import { FORM_SURFACE_CLASS_NAMES, type FormSurfaceAppearance } from '@/components/forms/formSurfaceAppearance';
import {
    formatSubscriptionDiscountDurationMonthCount,
    isSubscriptionDiscountFullAndPermanent,
    type ActiveDiscount,
} from '@/lib/discounts/discountCode';
import { cn } from '@/lib/utils';
import {
    getCommunityMembershipPlan,
    type CommunityMembershipBillingPeriod,
    type PaidCommunityMembershipPlanId,
} from './communityMembershipConfig';
import {
    createCommunityMembershipPrice,
    formatCommunityMembershipPrice,
    type CommunityMembershipPrice,
} from './communityMembershipPrice';

type CommunityMembershipPriceDisplayProps = {
    readonly planId: PaidCommunityMembershipPlanId;
    readonly billingPeriod: CommunityMembershipBillingPeriod;
    readonly activeDiscount: ActiveDiscount | null;
    readonly className?: string;
    readonly appearance?: FormSurfaceAppearance;
};

/**
 * What the price under the amount says: how often it is paid, and what a discount code does to it.
 *
 * Note: A code which takes the whole price for as long as the membership lasts leaves nothing to be paid at all, so
 *       such a membership is not described as one which is paid every month.
 */
function createCommunityMembershipPriceDescription(
    price: CommunityMembershipPrice,
    billingPeriod: CommunityMembershipBillingPeriod,
    activeDiscount: ActiveDiscount | null,
): string {
    if (isSubscriptionDiscountFullAndPermanent(activeDiscount, Math.round(price.baseMonthlyEquivalentCzk * 100))) {
        return 'Slevový kód pokrývá celé členství, takže neplatíte nic.';
    }

    const billingDescription =
        billingPeriod === 'yearly'
            ? `Platba ${formatCommunityMembershipPrice(price.finalBillingPriceCzk)} jednou ročně.`
            : 'Platba každý měsíc.';
    if (activeDiscount === null) {
        return billingDescription;
    }

    const subscriptionDiscountDurationMonths = activeDiscount.subscriptionDiscountDurationMonths;
    if (activeDiscount.priceRule) {
        const effect = describeDiscount(activeDiscount, 'cs', Math.round(price.finalMonthlyEquivalentCzk * 100));
        return subscriptionDiscountDurationMonths === null ? `${billingDescription} ${effect} po celou dobu členství.` :
            `${billingDescription} ${effect} na první ${formatSubscriptionDiscountDurationMonthCount(subscriptionDiscountDurationMonths)}. Poté ${formatCommunityMembershipPrice(price.baseMonthlyEquivalentCzk)} měsíčně.`;
    }

    return subscriptionDiscountDurationMonths === null
        ? `${billingDescription} Slevový kód přidává dalších ${activeDiscount.percent} % trvale po dobu členství.`
        : `${billingDescription} Slevový kód přidává dalších ${activeDiscount.percent} % na první ` +
              `${formatSubscriptionDiscountDurationMonthCount(subscriptionDiscountDurationMonths)}. Poté bude cena ` +
              `${formatCommunityMembershipPrice(price.baseMonthlyEquivalentCzk)} měsíčně.`;
}

/** Price is always led by its monthly equivalent, including when the visitor pays once a year. */
export function CommunityMembershipPriceDisplay({
    planId,
    billingPeriod,
    activeDiscount,
    className,
    appearance = 'light',
}: CommunityMembershipPriceDisplayProps) {
    const plan = getCommunityMembershipPlan(planId);
    const price = createCommunityMembershipPrice(planId, billingPeriod, activeDiscount);
    const isOriginalMonthlyPriceShown = billingPeriod === 'yearly' || activeDiscount !== null;
    const surfaceClassNames = FORM_SURFACE_CLASS_NAMES[appearance];

    return (
        <div className={className}>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                {isOriginalMonthlyPriceShown && (
                    <span className={cn('text-base font-medium line-through', surfaceClassNames.strikethroughText)}>
                        {formatCommunityMembershipPrice(plan.monthlyPriceCzk)}
                    </span>
                )}
                <span className={cn('text-4xl font-bold tracking-tight', surfaceClassNames.heading)}>
                    {formatCommunityMembershipPrice(price.finalMonthlyEquivalentCzk)}
                </span>
                <span className={cn('text-sm', surfaceClassNames.mutedText)}>/ měsíc</span>
            </div>
            <p className={cn('mt-2 text-xs leading-relaxed', surfaceClassNames.mutedText)}>
                {createCommunityMembershipPriceDescription(price, billingPeriod, activeDiscount)}
            </p>
        </div>
    );
}
