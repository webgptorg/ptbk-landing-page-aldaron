import { CZECH_COMMUNITY_ENTRY_LABEL } from '@/businesses/community/communityContent';
import { COMMUNITIES, createCommunityRoomLink, type CommunityId } from '@/businesses/community/config';
import type { WorkshopParticipantIdentity } from '@/lib/workshops/workshopParticipantLink';
import { ArrowUpRight, Users } from 'lucide-react';
import Link from 'next/link';

type CommunityRoomInvitationProps = {
    readonly participantIdentity: WorkshopParticipantIdentity;
    readonly communityIds: readonly CommunityId[];
};

/** Workshop members can continue in any community where the term was published. */
export function CommunityRoomInvitation({ participantIdentity, communityIds }: CommunityRoomInvitationProps) {
    return (
        <article
            aria-labelledby="community-room-invitation-title"
            className="relative scroll-mt-5 overflow-hidden rounded-2xl border border-room-border/10 bg-room-overlay/[0.045] p-5 text-room-text shadow-lg sm:p-8"
        >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-room-accent/10 text-room-accent">
                        <Users className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                        <h3 id="community-room-invitation-title" className="text-xl font-bold text-room-heading">
                            {communityIds.length === 1 ? 'Pokračujte v komunitě' : 'Pokračujte v komunitách'}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-room-muted">Diskuze, materiály a další termíny.</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {communityIds.map((id) => (
                        <Link
                            key={id}
                            href={createCommunityRoomLink(participantIdentity, id)}
                            aria-label={`${CZECH_COMMUNITY_ENTRY_LABEL} ${COMMUNITIES[id].name}`}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-room-action px-5 py-2.5 text-sm font-bold text-room-action-foreground transition hover:bg-room-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-room-accent focus-visible:ring-offset-2 focus-visible:ring-offset-room-background"
                        >
                            {COMMUNITIES[id].name}
                            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                    ))}
                </div>
            </div>
        </article>
    );
}
