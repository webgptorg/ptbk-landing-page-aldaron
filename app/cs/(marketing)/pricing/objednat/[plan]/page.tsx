import { PromptbookCheckout } from '@/businesses/new/PromptbookCheckout';
import { loadActiveDiscountsByPlace, loadPromotedDiscountsByPlace } from '@/lib/discounts/discountCodeDatabase';
import { MAXIMAL_DISCOUNT_CODE_LENGTH } from '@/lib/discounts/discountCodeConstants';
import { getPromptbookDiscountPlaceId } from '@/lib/discounts/discountPlaces';
import { getPromptbookBillingAvailability } from '@/lib/promptbook-billing/config';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Objednávka předplatného Promptbook',
    robots: { index: false, follow: false },
    referrer: 'no-referrer',
};

type CheckoutPageProps = {
    readonly params: Promise<{ plan: string }>;
    readonly searchParams: Promise<{ code?: string; stav?: string }>;
};

export default async function CheckoutPage({ params, searchParams }: CheckoutPageProps) {
    const { plan } = await params;
    if (plan !== 'start' && plan !== 'business') {
        notFound();
    }

    const availability = getPromptbookBillingAvailability();
    const query = await searchParams;
    const initialDiscountCode = typeof query.code === 'string' ? query.code.slice(0, MAXIMAL_DISCOUNT_CODE_LENGTH) : '';
    const discountPlaceId = getPromptbookDiscountPlaceId(plan);
    const [promotion, discount] = availability.enabled
        ? await Promise.all([
              loadPromotedDiscountsByPlace(),
              initialDiscountCode ? loadActiveDiscountsByPlace(initialDiscountCode, [discountPlaceId]) : null,
          ])
        : [null, null];

    return (
        <PromptbookCheckout
            plan={plan}
            availability={availability}
            promotion={promotion?.activeDiscountByPlaceId[discountPlaceId] ?? null}
            initialDiscountCode={initialDiscountCode}
            initialActiveDiscountByPlaceId={discount?.errorMessage === null ? discount.activeDiscountByPlaceId : {}}
            canceled={query.stav === 'zruseno'}
        />
    );
}
