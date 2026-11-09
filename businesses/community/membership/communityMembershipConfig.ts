import { COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID, COMMUNITY_MEMBERSHIP_PATH } from '@/lib/discounts/discountPlaces';

/** Plans kept for members who joined under the previous offer. */
export type LegacyCommunityMembershipPlanId = 'basic' | 'standard' | 'premium';
export type CurrentPaidCommunityMembershipPlanId = 'membership';
export type CommunityMembershipPlanId = LegacyCommunityMembershipPlanId | CurrentPaidCommunityMembershipPlanId;
export type PaidCommunityMembershipPlanId = Exclude<CommunityMembershipPlanId, 'basic'>;
export type CommunityMembershipBillingPeriod = 'monthly' | 'yearly';

export type CommunityMembershipPlan = {
    readonly id: CommunityMembershipPlanId;
    readonly name: string;
    readonly description: string;
    readonly monthlyPriceCzk: number;
    /** Null means that the plan is deliberately not available with yearly billing. */
    readonly yearlyPriceCzk: number | null;
    readonly addedFeatureIds: readonly CommunityMembershipFeatureId[];
};

export type CommunityMembershipFeatureId =
    | 'live-workshops'
    | 'community-materials'
    | 'starter-repositories'
    | 'member-discussion'
    | 'paid-discord'
    | 'workshop-recordings'
    | 'exclusive-content'
    | 'creation-showcase'
    | 'workshop-question-priority'
    | 'materials-rss'
    | 'monthly-meetups'
    | 'premium-priority';

export type CommunityMembershipFeature = {
    readonly id: CommunityMembershipFeatureId;
    readonly label: string;
    readonly shortLabel: string;
};

/**
 * How the one membership of this community is named wherever it is bought, recorded, or charged for
 */
export const COMMUNITY_MEMBERSHIP_NAME = 'Vývojáři';

export const COMMUNITY_MEMBERSHIP_TRIAL_DAY_COUNT = 7;
export const COMMUNITY_MEMBERSHIP_YEARLY_MONTH_COUNT = 12;
export const COMMUNITY_MEMBERSHIP_YEARLY_FREE_MONTH_COUNT = 2;
export const CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID: CurrentPaidCommunityMembershipPlanId = 'membership';

/**
 * The one billing period the current paid membership is offered with, read by everything which prices it
 */
export const CURRENT_PAID_COMMUNITY_MEMBERSHIP_BILLING_PERIOD: CommunityMembershipBillingPeriod = 'monthly';
export const CURRENT_PAID_COMMUNITY_MEMBERSHIP_MONTHLY_PRICE_CZK = 199;
const COMMUNITY_MEMBERSHIP_YEARLY_CHARGED_MONTH_COUNT =
    COMMUNITY_MEMBERSHIP_YEARLY_MONTH_COUNT - COMMUNITY_MEMBERSHIP_YEARLY_FREE_MONTH_COUNT;
export const COMMUNITY_MEMBERSHIP_REGISTRATION_TYPE = 'COMMUNITY_MEMBERSHIP_REGISTRATION';
export const COMMUNITY_MEMBERSHIP_REGISTRATION_PLACE_NAME = 'CommunityMembershipRegistration';
export const COMMUNITY_MEMBERSHIP_REGISTRATION_API_PATH = '/api/community/membership/registration';
export { COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID, COMMUNITY_MEMBERSHIP_PATH };

export const COMMUNITY_MEMBERSHIP_FEATURES: readonly CommunityMembershipFeature[] = [
    { id: 'live-workshops', label: 'Živé AI webináře zdarma', shortLabel: 'Živé webináře' },
    { id: 'community-materials', label: 'Základní materiály komunity', shortLabel: 'Materiály komunity' },
    { id: 'starter-repositories', label: 'Startovací repozitáře', shortLabel: 'Starter repozitáře' },
    { id: 'member-discussion', label: 'Diskuze s ostatními členy', shortLabel: 'Komunitní diskuze' },
    { id: 'paid-discord', label: 'Placená část komunitního Discordu', shortLabel: 'Členský Discord' },
    { id: 'workshop-recordings', label: 'Záznamy a archiv webinářů', shortLabel: 'Záznamy webinářů' },
    { id: 'exclusive-content', label: 'Praktické materiály k tématům', shortLabel: 'Materiály' },
    { id: 'creation-showcase', label: 'Prostor sdílet vlastní tvorbu', shortLabel: 'Sdílení vlastní tvorby' },
    {
        id: 'workshop-question-priority',
        label: 'Přednost pro dotazy před vysíláním i během něj',
        shortLabel: 'Přednostní dotazy',
    },
    { id: 'materials-rss', label: 'Soukromý RSS kanál s materiály', shortLabel: 'RSS s materiály' },
    { id: 'monthly-meetups', label: 'Pozvánka na osobní setkání každý měsíc', shortLabel: 'Měsíční setkání' },
    {
        id: 'premium-priority',
        label: 'Nejvyšší priorita u materiálů a zapojení do diskuze',
        shortLabel: 'Premium priorita',
    },
];

export const COMMUNITY_MEMBERSHIP_PLANS: readonly CommunityMembershipPlan[] = [
    {
        id: 'basic',
        name: 'Basic',
        description: 'Pro vstup do komunity a účast na živých workshopech.',
        monthlyPriceCzk: 0,
        yearlyPriceCzk: 0,
        addedFeatureIds: ['live-workshops', 'community-materials', 'starter-repositories', 'member-discussion'],
    },
    {
        id: 'standard',
        name: 'Standard',
        description: 'Pro pravidelné učení, záznamy a sdílení vlastní práce.',
        monthlyPriceCzk: 180,
        yearlyPriceCzk: 180 * COMMUNITY_MEMBERSHIP_YEARLY_CHARGED_MONTH_COUNT,
        addedFeatureIds: [
            'paid-discord',
            'workshop-recordings',
            'exclusive-content',
            'creation-showcase',
            'workshop-question-priority',
            'materials-rss',
        ],
    },
    {
        id: 'premium',
        name: 'Premium',
        description: 'Pro ty, kdo chtějí být komunitě blíž a potkávat se i osobně.',
        monthlyPriceCzk: 900,
        yearlyPriceCzk: 900 * COMMUNITY_MEMBERSHIP_YEARLY_CHARGED_MONTH_COUNT,
        addedFeatureIds: ['monthly-meetups', 'premium-priority'],
    },
];

/**
 * The current public offer has its own id so historic Standard and Premium agreements retain their agreed prices
 * and billing terms. It intentionally has no yearly price or free trial.
 */
export const CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN: CommunityMembershipPlan = {
    id: CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID,
    name: 'Placené členství',
    description: 'Záznamy, archiv, materiály a přednost pro dotazy k živým webinářům.',
    monthlyPriceCzk: CURRENT_PAID_COMMUNITY_MEMBERSHIP_MONTHLY_PRICE_CZK,
    yearlyPriceCzk: null,
    addedFeatureIds: [
        'paid-discord',
        'workshop-recordings',
        'exclusive-content',
        'creation-showcase',
        'workshop-question-priority',
        'materials-rss',
    ],
};

export function getCommunityMembershipPlan(planId: CommunityMembershipPlanId): CommunityMembershipPlan {
    if (planId === CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID) {
        return CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN;
    }

    const plan = COMMUNITY_MEMBERSHIP_PLANS.find((candidate) => candidate.id === planId);

    if (plan === undefined) {
        throw new Error(`Unknown community membership plan: ${planId}`);
    }

    return plan;
}

export function isPaidCommunityMembershipPlanId(value: unknown): value is PaidCommunityMembershipPlanId {
    return value === CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID || value === 'standard' || value === 'premium';
}

export function isCurrentPaidCommunityMembershipPlanId(value: unknown): value is CurrentPaidCommunityMembershipPlanId {
    return value === CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID;
}

export function isLegacyPaidCommunityMembershipPlanId(value: unknown): value is Exclude<
    PaidCommunityMembershipPlanId,
    CurrentPaidCommunityMembershipPlanId
> {
    return value === 'standard' || value === 'premium';
}

export function isCommunityMembershipBillingPeriod(value: unknown): value is CommunityMembershipBillingPeriod {
    return value === 'monthly' || value === 'yearly';
}

export function isCommunityMembershipBillingPeriodSupportedForPlan(
    planId: PaidCommunityMembershipPlanId,
    billingPeriod: CommunityMembershipBillingPeriod,
): boolean {
    return planId !== CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID || billingPeriod === 'monthly';
}

/**
 * Expands inherited features once from the ordered plan registry. Cards and the comparison table therefore cannot
 * disagree about what "everything from the lower plan" means.
 */
export function getCommunityMembershipFeatureIds(
    planId: LegacyCommunityMembershipPlanId,
): readonly CommunityMembershipFeatureId[] {
    const selectedPlanIndex = COMMUNITY_MEMBERSHIP_PLANS.findIndex((plan) => plan.id === planId);

    return COMMUNITY_MEMBERSHIP_PLANS.slice(0, selectedPlanIndex + 1).flatMap((plan) => plan.addedFeatureIds);
}

export function getCurrentPaidCommunityMembershipFeatureIds(): readonly CommunityMembershipFeatureId[] {
    return [...getCommunityMembershipFeatureIds('basic'), ...CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN.addedFeatureIds];
}

export function getCommunityMembershipFeature(featureId: CommunityMembershipFeatureId): CommunityMembershipFeature {
    const feature = COMMUNITY_MEMBERSHIP_FEATURES.find((candidate) => candidate.id === featureId);

    if (feature === undefined) {
        throw new Error(`Unknown community membership feature: ${featureId}`);
    }

    return feature;
}
