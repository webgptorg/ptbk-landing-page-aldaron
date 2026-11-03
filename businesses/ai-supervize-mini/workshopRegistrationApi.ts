import { createContactNoticeFields } from '@/lib/contacts/contactSubmissionPolicy';
import type {
    AiSupervizeMiniWorkshopAvailability,
    AiSupervizeMiniWorkshopPrice,
    AiSupervizeMiniWorkshopRegistrationRequest,
} from '@/businesses/ai-supervize-mini/workshopRegistration';

const AI_SUPERVIZE_MINI_WORKSHOP_REGISTRATION_API_PATH = '/api/ai-supervize-mini/registration';

type AiSupervizeMiniWorkshopRegistrationResponse = {
    readonly isWaitlisted: boolean;
    readonly workshopAvailabilities: readonly AiSupervizeMiniWorkshopAvailability[];
    readonly workshopPrice: AiSupervizeMiniWorkshopPrice;
};

type AiSupervizeMiniWorkshopRegistrationErrorResponse = {
    readonly error?: unknown;
    readonly workshopAvailabilities?: unknown;
};

export class AiSupervizeMiniWorkshopRegistrationError extends Error {
    public readonly workshopAvailabilities: readonly AiSupervizeMiniWorkshopAvailability[] | null;

    public constructor(message: string, workshopAvailabilities: readonly AiSupervizeMiniWorkshopAvailability[] | null) {
        super(message);
        Object.setPrototypeOf(this, AiSupervizeMiniWorkshopRegistrationError.prototype);
        this.workshopAvailabilities = workshopAvailabilities;
    }
}

function getWorkshopAvailabilitiesOrNull(
    value: unknown,
): readonly AiSupervizeMiniWorkshopAvailability[] | null {
    return Array.isArray(value) ? (value as AiSupervizeMiniWorkshopAvailability[]) : null;
}

export async function submitAiSupervizeMiniWorkshopRegistration(
    registrationRequest: AiSupervizeMiniWorkshopRegistrationRequest,
): Promise<AiSupervizeMiniWorkshopRegistrationResponse> {
    const response = await fetch(AI_SUPERVIZE_MINI_WORKSHOP_REGISTRATION_API_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...registrationRequest, ...createContactNoticeFields() }),
    });
    const responseBody = (await response.json().catch(() => ({}))) as AiSupervizeMiniWorkshopRegistrationErrorResponse &
        Partial<AiSupervizeMiniWorkshopRegistrationResponse>;

    if (!response.ok) {
        throw new AiSupervizeMiniWorkshopRegistrationError(
            typeof responseBody.error === 'string'
                ? responseBody.error
                : `Request failed with status ${response.status}`,
            getWorkshopAvailabilitiesOrNull(responseBody.workshopAvailabilities),
        );
    }

    if (
        typeof responseBody.isWaitlisted !== 'boolean' ||
        responseBody.workshopAvailabilities === undefined ||
        responseBody.workshopPrice === undefined
    ) {
        throw new AiSupervizeMiniWorkshopRegistrationError('Odpověď registrace není úplná.', null);
    }

    return responseBody as AiSupervizeMiniWorkshopRegistrationResponse;
}
