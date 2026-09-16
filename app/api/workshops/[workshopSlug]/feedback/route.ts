import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { WORKSHOP_FEEDBACK_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import { mapWorkshopFeedbackRow, mapWorkshopRow, type WorkshopFeedbackRow } from '@/lib/workshops/workshopDatabase';
import { getWorkshopPhase, isWorkshopPhasePast } from '@/lib/workshops/workshopPhase';
import { getAuthenticatedWorkshopRequest, isAuthenticatedWorkshopRequest } from '@/lib/workshops/workshopRequest';
import { workshopFeedbackUpdateSchema } from '@/lib/workshops/workshopSchemas';
import { createWorkshopFeedbackUpdateDatabaseValues } from '@/lib/workshops/workshopValues';
import { NextRequest, NextResponse } from 'next/server';

type WorkshopFeedbackRouteContext = {
    readonly params: Promise<{ readonly workshopSlug: string }>;
};

/**
 * Persists one step of the participant's post-workshop feedback.
 *
 * A score initializes the one row for a participant. The optional text fields deliberately update that row afterwards,
 * allowing each answer to survive independently if the participant does not continue through the whole form.
 */
export async function PATCH(request: NextRequest, context: WorkshopFeedbackRouteContext) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse) {
        return crossSiteResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = workshopFeedbackUpdateSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json(
            { error: parsedResult.error.issues[0]?.message ?? 'Feedback is not valid' },
            { status: 400 },
        );
    }

    const { workshopSlug } = await context.params;
    const authenticatedRequest = await getAuthenticatedWorkshopRequest(request, workshopSlug);
    if (!isAuthenticatedWorkshopRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }

    if (
        authenticatedRequest.workshopRow.room_kind !== 'workshop' ||
        !isWorkshopPhasePast(getWorkshopPhase(mapWorkshopRow(authenticatedRequest.workshopRow)))
    ) {
        return NextResponse.json({ error: 'Feedback is available after the workshop ends' }, { status: 403 });
    }

    const values = createWorkshopFeedbackUpdateDatabaseValues(parsedResult.data);
    const feedbackQuery =
        parsedResult.data.rating === undefined
            ? authenticatedRequest.supabase
                  .from(WORKSHOP_FEEDBACK_TABLE_NAME)
                  .update(values)
                  .eq('workshop_id', authenticatedRequest.workshopRow.id)
                  .eq('participant_id', authenticatedRequest.participant.id)
            : authenticatedRequest.supabase
                  .from(WORKSHOP_FEEDBACK_TABLE_NAME)
                  .upsert(
                      {
                          workshop_id: authenticatedRequest.workshopRow.id,
                          participant_id: authenticatedRequest.participant.id,
                          ...values,
                      },
                      { onConflict: 'workshop_id,participant_id' },
                  );
    const { data, error } = await feedbackQuery.select('id, workshop_id, participant_id, rating, what_was_good, what_was_bad, note, created_at, updated_at').maybeSingle();
    if (error) {
        console.error('Failed to save workshop feedback:', error.message);
        return NextResponse.json({ error: 'Feedback could not be saved' }, { status: 500 });
    }
    if (data === null) {
        return NextResponse.json({ error: 'Please choose a rating before answering the questions' }, { status: 409 });
    }

    return NextResponse.json({ feedback: mapWorkshopFeedbackRow(data as WorkshopFeedbackRow) });
}
