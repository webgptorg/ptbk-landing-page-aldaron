import { CZECH_COMMUNITY_INVITATION_COPY } from '@/businesses/community/communityContent';
import { createCommunityRoomLink } from '@/businesses/community/config';
import type { WorkshopParticipantIdentity } from '@/lib/workshops/workshopParticipantLink';
import { ArrowUpRight, Users } from 'lucide-react';
import Link from 'next/link';

const COMMUNITY_ROOM_INVITATION_TITLE_ID = 'community-room-invitation-title';

type CommunityRoomInvitationProps = {
    /**
     * The member as the room they are reading already verified them, which the community is entered with
     */
    readonly participantIdentity: WorkshopParticipantIdentity;
};

/**
 * The way from a room which ends into the permanent community, which is where everything outlasting one term is kept.
 *
 * Note: This is the second half of one hand-off rather than a surface of its own: the community leads its members into
 *       the rooms of the terms it lists, and such a room leads back into the community. Both directions carry the
 *       identity the member is already connected with, so neither room asks the same person for it twice.
 */
export function CommunityRoomInvitation({ participantIdentity }: CommunityRoomInvitationProps) {
    return (
        <article
            aria-labelledby={COMMUNITY_ROOM_INVITATION_TITLE_ID}
            className="relative scroll-mt-5 overflow-hidden rounded-2xl border border-room-border/10 bg-room-overlay/[0.045] p-5 text-room-text shadow-lg sm:p-8"
        >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-room-accent/10 text-room-accent">
                        <Users className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-room-accent">
                            {CZECH_COMMUNITY_INVITATION_COPY.eyebrow}
                        </p>
                        <h3 id={COMMUNITY_ROOM_INVITATION_TITLE_ID} className="mt-1 text-xl font-bold text-room-heading">
                            {CZECH_COMMUNITY_INVITATION_COPY.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-room-muted">
                            {CZECH_COMMUNITY_INVITATION_COPY.description}
                        </p>
                        <ul className="mt-3 flex flex-wrap gap-2">
                            {CZECH_COMMUNITY_INVITATION_COPY.sectionTitles.map((sectionTitle) => (
                                <li
                                    key={sectionTitle}
                                    className="rounded-full border border-room-border/10 bg-room-inset/40 px-2.5 py-1 text-xs text-room-text"
                                >
                                    {sectionTitle}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <Link
                    href={createCommunityRoomLink(participantIdentity)}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-room-action px-5 py-2.5 text-sm font-bold text-room-action-foreground transition hover:bg-room-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-room-accent focus-visible:ring-offset-2 focus-visible:ring-offset-room-background"
                >
                    {CZECH_COMMUNITY_INVITATION_COPY.linkLabel}
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
            </div>
        </article>
    );
}
