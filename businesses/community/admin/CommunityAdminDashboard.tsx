'use client';

import { COMMUNITIES, COMMUNITY_ADMIN_PATH, COMMUNITY_IDS, DEFAULT_COMMUNITY_ID, getCommunityById } from '@/businesses/community/config';
import { CommunityMembershipAdmin } from '@/businesses/community/membership/CommunityMembershipAdmin';
import { CommunityProjectModeration } from '@/businesses/community/projects/CommunityProjectModeration';
import { WorkshopAdminDashboard } from '@/businesses/workshop-admin/WorkshopAdminDashboard';
import { Crown } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

/**
 * Supplies the community-only concerns to the reusable room administration. The dashboard itself stays independent of
 * a payment business, while this client-side wrapper can safely pass its icon and section content as a local slot.
 */
export function CommunityAdminDashboard() {
    const searchParams = useSearchParams();
    const community = getCommunityById(searchParams.get('community') ?? '') ?? COMMUNITIES[DEFAULT_COMMUNITY_ID];

    return (
        <>
            <nav aria-label="Komunity" className="mx-auto flex max-w-7xl flex-wrap gap-2 px-6 pt-6">
                {COMMUNITY_IDS.map((id) => (
                    <Link
                        key={id}
                        href={`${COMMUNITY_ADMIN_PATH}?community=${id}`}
                        aria-current={community.id === id ? 'page' : undefined}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 aria-[current=page]:border-cyan-700 aria-[current=page]:text-cyan-800"
                    >
                        {COMMUNITIES[id].name}
                    </Link>
                ))}
            </nav>
            <WorkshopAdminDashboard
                key={community.id}
                initialWorkshopSlug={community.roomSlug}
                workshopKind="community"
                subjectLabel="komunity"
                emptyStateMessage="Komunita zatím není vytvořená. Spusťte databázovou migraci pro komunitu."
                additionalSections={community.hasPaidMembership ? [
                    {
                        value: 'memberships',
                        label: 'Placená členství',
                        icon: Crown,
                        content: <CommunityMembershipAdmin communityId={community.id} />,
                    },
                ] : []}
            />
            {community.hasProjects && (
                <div className="mx-auto max-w-7xl px-6 pb-8">
                    <CommunityProjectModeration />
                </div>
            )}
        </>
    );
}
