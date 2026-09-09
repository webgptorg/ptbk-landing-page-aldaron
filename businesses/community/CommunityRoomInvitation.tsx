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
        <section
            aria-labelledby={COMMUNITY_ROOM_INVITATION_TITLE_ID}
            className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5"
        >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200">
                        <Users className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">
                            {CZECH_COMMUNITY_INVITATION_COPY.eyebrow}
                        </p>
                        <h2 id={COMMUNITY_ROOM_INVITATION_TITLE_ID} className="mt-1 text-sm font-bold text-white">
                            {CZECH_COMMUNITY_INVITATION_COPY.title}
                        </h2>
                        <p className="mt-1 text-xs leading-5 text-slate-400">
                            {CZECH_COMMUNITY_INVITATION_COPY.description}
                        </p>
                        <ul className="mt-3 flex flex-wrap gap-2">
                            {CZECH_COMMUNITY_INVITATION_COPY.sectionTitles.map((sectionTitle) => (
                                <li
                                    key={sectionTitle}
                                    className="rounded-full border border-white/10 bg-slate-950/40 px-2.5 py-1 text-xs text-slate-300"
                                >
                                    {sectionTitle}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <Link
                    href={createCommunityRoomLink(participantIdentity)}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06131b]"
                >
                    {CZECH_COMMUNITY_INVITATION_COPY.linkLabel}
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
            </div>
        </section>
    );
}
