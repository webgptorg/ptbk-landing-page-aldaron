import { CZECH_COMMUNITY_INVITATION_COPY } from '@/businesses/community/communityContent';
import { createCommunityRoomLink } from '@/businesses/community/config';
import { WorkshopEventCard } from '@/components/workshops/WorkshopEventCard';
import { createCalendarDayKey } from '@/lib/calendar/calendarMonth';
import { createEventListings } from '@/lib/events/eventListing';
import { isEventFree } from '@/lib/events/eventPrice';
import { isExternalEventType } from '@/lib/events/eventTypes';
import type { WorkshopParticipantIdentity } from '@/lib/workshops/workshopParticipantLink';
import { isWorkshopPhaseUpcoming } from '@/lib/workshops/workshopPhase';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';
import { ArrowUpRight, Users } from 'lucide-react';
import Link from 'next/link';

const WORKSHOP_LOCALE = 'cs-CZ';
const WORKSHOP_TIME_ZONE = 'Europe/Prague';

type WorkshopWrapUpNavigationProps = {
    readonly workshops: readonly WorkshopSummary[];
    readonly participantIdentity: WorkshopParticipantIdentity;
    readonly currentWorkshopSlug: string;
    readonly serverTime: string;
};

/** Follow-up destinations use the same dates, prices, cards and identity hand-off as the community schedule. */
export function WorkshopWrapUpNavigation({
    workshops,
    participantIdentity,
    currentWorkshopSlug,
    serverTime,
}: WorkshopWrapUpNavigationProps) {
    const upcomingWorkshops = createEventListings({
        workshops: workshops.filter(
            (workshop) => workshop.isPublished && workshop.kind === 'workshop' && workshop.slug !== currentWorkshopSlug,
        ),
        participantIdentity,
        currentTimeMilliseconds: Date.parse(serverTime),
        timeZone: WORKSHOP_TIME_ZONE,
    }).filter((listing) => isWorkshopPhaseUpcoming(listing.phase) && !isExternalEventType(listing.event.type));
    const nextWorkshop = upcomingWorkshops[0];
    const nextPaidWorkshop = upcomingWorkshops.find((listing) => !isEventFree(listing.event.priceCzk));
    const isNextWorkshopPaid = nextWorkshop !== undefined && nextWorkshop === nextPaidWorkshop;
    const recommendations = [
        {
            label: isNextWorkshopPaid ? 'Další workshop (placený)' : 'Další workshop',
            listing: nextWorkshop,
            emptyMessage: 'Další termín workshopu připravujeme.',
        },
        ...(isNextWorkshopPaid
            ? []
            : [
                  {
                      label: 'Další placený workshop',
                      listing: nextPaidWorkshop,
                      emptyMessage: 'Další termín placeného workshopu připravujeme.',
                  },
              ]),
    ];
    const todayDayKey = createCalendarDayKey(serverTime, WORKSHOP_TIME_ZONE);

    return (
        <nav aria-label="Kam po workshopu" className="mt-6 space-y-5">
            <Link
                href={createCommunityRoomLink(participantIdentity)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-room-accent/40 bg-room-accent/10 px-5 py-2.5 text-sm font-bold text-room-accent transition hover:border-room-accent/70 hover:bg-room-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-room-accent focus-visible:ring-offset-2 focus-visible:ring-offset-room-surface"
            >
                <Users className="h-4 w-4" aria-hidden="true" />
                {CZECH_COMMUNITY_INVITATION_COPY.linkLabel}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <div className={`grid gap-4 ${recommendations.length > 1 ? 'sm:grid-cols-2' : ''}`}>
                {recommendations.map(({ label, listing, emptyMessage }) => (
                    <div key={label} className="min-w-0">
                        <h3 className="mb-2 text-sm font-bold text-room-heading">{label}</h3>
                        {listing === undefined ? (
                            <p className="text-sm leading-6 text-room-muted">{emptyMessage}</p>
                        ) : (
                            <WorkshopEventCard
                                listing={listing}
                                locale={WORKSHOP_LOCALE}
                                timeZone={WORKSHOP_TIME_ZONE}
                                todayDayKey={todayDayKey}
                            />
                        )}
                    </div>
                ))}
            </div>
        </nav>
    );
}
