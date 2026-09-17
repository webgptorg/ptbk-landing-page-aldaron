'use client';

import { CommunityPaidMembersNotice } from '@/businesses/community/membership/CommunityPaidMembersNotice';
import { useCommunityMembershipPurchaseOffer } from '@/businesses/community/membership/useCommunityMembershipPurchaseOffer';
import type { WorkshopPaidMembersVideo } from '@/lib/workshops/workshopTypes';
import { createYoutubeEmbedUrl } from '@/lib/youtube/youtubeEmbed';

const PAID_MEMBERS_VIDEO_TITLE = 'Záznam workshopu je pro placené členy';
const PAID_MEMBERS_VIDEO_DESCRIPTION =
    'Celý záznam tohoto workshopu si pustí členové komunity s placeným členstvím. Odemknete ho měsíčním placeným členstvím.';
const PAID_MEMBERS_VIDEO_PREVIEW_LABEL = 'Ukázka ze záznamu';
const MEMBERSHIP_TITLE = 'Pokračujte s placeným členstvím';
const MEMBERSHIP_DESCRIPTION =
    'Získejte přístup k záznamům workshopů, archivu a materiálům pro placené členy komunity.';

type WorkshopWrapUpMembershipOfferProps = {
    readonly paidMembersOnlyVideo: WorkshopPaidMembersVideo | null;
};

/**
 * Offers membership after every workshop, even without a recording. A withheld recording adds its existing teaser
 * to the same purchase action; access and checkout still belong to the shared membership controller.
 */
export function WorkshopWrapUpMembershipOffer({ paidMembersOnlyVideo }: WorkshopWrapUpMembershipOfferProps) {
    const membershipPurchaseOffer = useCommunityMembershipPurchaseOffer();
    if (membershipPurchaseOffer === null) {
        return null;
    }

    const previewYoutubeVideoId = paidMembersOnlyVideo?.previewYoutubeVideoId ?? null;

    return (
        <div className="mt-5">
            <CommunityPaidMembersNotice
                title={paidMembersOnlyVideo === null ? MEMBERSHIP_TITLE : PAID_MEMBERS_VIDEO_TITLE}
                description={paidMembersOnlyVideo === null ? MEMBERSHIP_DESCRIPTION : PAID_MEMBERS_VIDEO_DESCRIPTION}
                onUnlockPaidMembership={membershipPurchaseOffer.openMembershipModal}
                unlockedLabel={PAID_MEMBERS_VIDEO_PREVIEW_LABEL}
                unlockedContent={
                    previewYoutubeVideoId === null ? undefined : (
                        <div className="relative aspect-video overflow-hidden rounded-xl border border-amber-200/20 bg-slate-950">
                            <iframe
                                className="absolute inset-0 h-full w-full"
                                src={createYoutubeEmbedUrl(previewYoutubeVideoId, {
                                    isAutoplayed: false,
                                    isInlinePlayback: true,
                                    isRelatedVideoEnabled: false,
                                    isControlsVisible: true,
                                    isJavaScriptApiEnabled: false,
                                })}
                                title={PAID_MEMBERS_VIDEO_PREVIEW_LABEL}
                                allow="encrypted-media; fullscreen; picture-in-picture"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            />
                        </div>
                    )
                }
            />
        </div>
    );
}
