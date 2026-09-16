import { AiSupervizeMiniPage } from '@/businesses/ai-supervize-mini/_AiSupervizeMiniPage';
import { AI_SUPERVIZE_MINI_METADATA } from '@/businesses/ai-supervize-mini/aiSupervizeMiniMetadata';
import { AI_SUPERVIZE_MINI_DISCOUNT_PLACE_IDS } from '@/businesses/ai-supervize-mini/config';
import {
    loadAiSupervizeMiniEvents,
    loadAiSupervizeMiniWorkshopAvailability,
} from '@/businesses/ai-supervize-mini/workshopRegistrationDatabase';
import { readFirstSearchParameter, type SearchParameterValue } from '@/lib/api/readFirstSearchParameter';
import { DISCOUNT_CODE_QUERY_PARAMETER } from '@/lib/discounts/discountCodeConstants';
import { loadActiveDiscountsByPlace } from '@/lib/discounts/discountCodeDatabase';

export const metadata = AI_SUPERVIZE_MINI_METADATA;
export const dynamic = 'force-dynamic';

type AiSupervizeMiniRouteProps = {
    readonly searchParams: Promise<Readonly<Record<string, SearchParameterValue>>>;
};

export default async function AiSupervizeMiniRoute({ searchParams }: AiSupervizeMiniRouteProps) {
    const resolvedSearchParams = await searchParams;
    const initialDiscountCode = readFirstSearchParameter(resolvedSearchParams[DISCOUNT_CODE_QUERY_PARAMETER]) ?? '';
    const [events, initialDiscountResult] = await Promise.all([
        loadAiSupervizeMiniEvents(),
        loadActiveDiscountsByPlace(initialDiscountCode, AI_SUPERVIZE_MINI_DISCOUNT_PLACE_IDS),
    ]);
    const workshopAvailabilities = await loadAiSupervizeMiniWorkshopAvailability(events);

    if (initialDiscountResult.errorMessage !== null) {
        console.error('Failed to load the initial AI Supervize Mini discount:', initialDiscountResult.errorMessage);
    }

    return (
        <AiSupervizeMiniPage
            events={events}
            initialDiscountCode={initialDiscountCode}
            initialActiveDiscountByPlaceId={initialDiscountResult.activeDiscountByPlaceId}
            workshopAvailabilities={workshopAvailabilities}
            currentTime={new Date().toISOString()}
        />
    );
}
