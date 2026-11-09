import { createCommunityCalendarResponse } from '@/businesses/community/communityCalendar';
import { getCommunityById } from '@/businesses/community/config';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ community: string }> }) {
    const definition = getCommunityById((await params).community);
    if (definition === undefined) {
        notFound();
    }

    return createCommunityCalendarResponse(definition.id);
}
