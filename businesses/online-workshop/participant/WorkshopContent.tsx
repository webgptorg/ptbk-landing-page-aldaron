'use client';

import { CommunityPaidMembersNotice } from '@/businesses/community/membership/CommunityPaidMembersNotice';
import { useCommunityMembershipPurchaseOffer } from '@/businesses/community/membership/useCommunityMembershipPurchaseOffer';
import { useIsPaidCommunityMember } from '@/businesses/community/membership/useIsPaidCommunityMember';
import { MarkdownContent } from '@/components/markdown-content';
import { PromptbookQrCode } from '@/components/promptbook-qr-code';
import {
    selectWorkshopSpecialMaterialsByPlacement,
    type WorkshopSpecialMaterial,
} from '@/lib/workshops/workshopSpecialMaterials';
import type { WorkshopContentBlock, WorkshopContentPreview } from '@/lib/workshops/workshopTypes';
import { motion, useReducedMotion } from 'framer-motion';
import { Clock3, Crown, ExternalLink, Lock, Sparkles } from 'lucide-react';
import { Fragment, useEffect, useRef, useState } from 'react';

type WorkshopContentProps = {
    readonly contentBlocks: readonly WorkshopContentBlock[];
    readonly nextContentUnlockAt: string | null;
    readonly newlyUnlockedContentBlockIds: ReadonlySet<string>;

    /**
     * The paid materials the room hides from the member reading it, by their titles alone. The materials themselves
     * never reach this component for such a member; this is only the place where the room names them and offers the
     * key.
     */
    readonly paidMembersOnlyContentPreviews: readonly WorkshopContentPreview[];

    /**
     * Cards which share the materials placement but have their own source and access rules.
     *
     * Note: The room which knows whether a card applies supplies it here. This component only owns the common list,
     *       so it cannot accidentally make a special material conditional on paid-material visibility.
     * Note: Each card says where among the ordinary materials it belongs, while the membership of the member reading
     *       them is known here, so a card whose placement depends on that membership is placed without the room which
     *       supplied it having to ask what its reader pays for.
     */
    readonly specialMaterials?: readonly WorkshopSpecialMaterial[];
    readonly title?: string;
};

type WorkshopMaterialBodyProps = {
    readonly bodyMarkdown: string;
    readonly callToActionLabel?: string;
};

/**
 * The portion of a material card which is shared by an administrator-managed material and a room-level material.
 */
export type WorkshopMaterialCardContent = Pick<
    WorkshopContentBlock,
    'id' | 'title' | 'bodyMarkdown' | 'isFollowUp' | 'isPaidMembersOnly'
>;

type WorkshopMaterialCardProps = {
    readonly contentBlock: WorkshopMaterialCardContent;
    readonly isNewlyUnlocked?: boolean;
    readonly callToActionLabel?: string;
    readonly ariaLabel?: string;
};

type WorkshopMaterialLink = {
    readonly href: string;
    readonly label: string;
};

const CZECH_DATE_TIME_FORMAT = new Intl.DateTimeFormat('cs-CZ', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Prague',
});
const MATERIAL_CALL_TO_ACTION_LABEL = 'Otevřít materiál';
const MATERIAL_LINK_SELECTOR = 'a[href]:not([data-workshop-material-call-to-action])';
const MATERIAL_QR_CODE_SIZE = 144;

function configureMaterialLink(linkElement: HTMLAnchorElement): void {
    // The server has already replaced the href with a persisted short link.
    // This only preserves the existing new-tab behavior; it never observes or
    // reports a click, so copied and forwarded links use the same tracking path.
    linkElement.target = '_blank';
    linkElement.rel = 'noopener noreferrer';
}

function getWorkshopMaterialLinks(linkElements: readonly HTMLAnchorElement[]): readonly WorkshopMaterialLink[] {
    return linkElements.map((linkElement) => ({
        href: linkElement.href,
        label: linkElement.textContent?.trim() || MATERIAL_CALL_TO_ACTION_LABEL,
    }));
}

function areWorkshopMaterialLinkListsEqual(
    currentMaterialLinks: readonly WorkshopMaterialLink[],
    nextMaterialLinks: readonly WorkshopMaterialLink[],
): boolean {
    return (
        currentMaterialLinks.length === nextMaterialLinks.length &&
        currentMaterialLinks.every(
        (currentMaterialLink, index) =>
            currentMaterialLink.href === nextMaterialLinks[index]?.href &&
            currentMaterialLink.label === nextMaterialLinks[index]?.label,
        )
    );
}

/**
 * Every QR code carries the persisted short link already present in a material. On a desktop it gives the person
 * reading the room the same tracked destination on their phone without sending mobile layouts through an extra panel.
 */
function WorkshopMaterialQrCodes({ materialLinks }: { readonly materialLinks: readonly WorkshopMaterialLink[] }) {
    return (
        <aside aria-label="QR kódy materiálů" className="hidden shrink-0 lg:flex lg:flex-col lg:items-center lg:gap-4">
            {materialLinks.map((materialLink, index) => (
                <figure
                    key={`${materialLink.href}-${index}`}
                    aria-label={`QR kód materiálu: ${materialLink.label}`}
                    className="w-44"
                >
                    <PromptbookQrCode
                        value={materialLink.href}
                        size={MATERIAL_QR_CODE_SIZE}
                        className="mx-auto overflow-hidden rounded-xl bg-white shadow-lg shadow-cyan-300/10"
                    />
                    {materialLinks.length > 1 && (
                        <figcaption
                            className="mt-2 truncate text-center text-xs font-semibold leading-5 text-slate-400"
                            title={materialLink.label}
                        >
                            {materialLink.label}
                        </figcaption>
                    )}
                </figure>
            ))}
        </aside>
    );
}

function WorkshopMaterialBody({
    bodyMarkdown,
    callToActionLabel = MATERIAL_CALL_TO_ACTION_LABEL,
}: WorkshopMaterialBodyProps) {
    const materialBodyReference = useRef<HTMLDivElement>(null);
    const [materialLinks, setMaterialLinks] = useState<readonly WorkshopMaterialLink[]>([]);
    const singleMaterialLink = materialLinks.length === 1 ? materialLinks[0] : null;

    useEffect(() => {
        const materialBodyElement = materialBodyReference.current;
        if (materialBodyElement === null) {
            return;
        }

        const configureMaterialLinks = () => {
            const linkElements = Array.from(
                materialBodyElement.querySelectorAll<HTMLAnchorElement>(MATERIAL_LINK_SELECTOR),
            );
            linkElements.forEach((linkElement) => {
                configureMaterialLink(linkElement);
            });

            const nextMaterialLinks = getWorkshopMaterialLinks(linkElements);
            setMaterialLinks((currentMaterialLinks) =>
                areWorkshopMaterialLinkListsEqual(currentMaterialLinks, nextMaterialLinks)
                    ? currentMaterialLinks
                    : nextMaterialLinks,
            );
        };

        configureMaterialLinks();
        const observer = new MutationObserver(configureMaterialLinks);
        observer.observe(materialBodyElement, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [bodyMarkdown]);

    return (
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-8">
            <div ref={materialBodyReference} className="min-w-0 break-words">
                <MarkdownContent
                    content={bodyMarkdown}
                    theme="DARK"
                    className="max-w-none leading-7 text-slate-200 [--chat-md-link-color:#f1f5f9] [&_a]:font-semibold [&_code]:break-words [&_code]:text-cyan-100 [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_img]:max-w-full [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto"
                />
                {singleMaterialLink && (
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                        <a
                            href={singleMaterialLink.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-workshop-material-call-to-action
                            aria-label={`${callToActionLabel}: ${singleMaterialLink.label}`}
                            className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-300/10 transition hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07151d]"
                        >
                            {callToActionLabel}
                            <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        </a>
                    </div>
                )}
            </div>
            {materialLinks.length > 0 && <WorkshopMaterialQrCodes materialLinks={materialLinks} />}
        </div>
    );
}

/**
 * The shared card for every material-shaped item in a room.
 *
 * Note: A presentation is configured with the workshop rather than stored as scheduled content, but it deliberately
 *       uses this card so its link, primary action, and desktop QR code never drift from ordinary materials.
 */
export function WorkshopMaterialCard({
    contentBlock,
    isNewlyUnlocked = false,
    callToActionLabel,
    ariaLabel,
}: WorkshopMaterialCardProps) {
    const isReducedMotionPreferred = useReducedMotion() === true;
    const isFollowUp = contentBlock.isFollowUp;
    const isPaidMembersOnly = contentBlock.isPaidMembersOnly;

    return (
        <motion.article
            id={`workshop-material-${contentBlock.id}`}
            aria-label={ariaLabel}
            initial={isNewlyUnlocked && !isReducedMotionPreferred ? { opacity: 0, y: 24, scale: 0.97 } : false}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: isReducedMotionPreferred ? 0 : 0.55, ease: 'easeOut' }}
            className={`relative scroll-mt-5 overflow-hidden rounded-2xl border bg-white/[0.045] p-5 text-slate-200 shadow-lg transition-colors sm:p-8 ${isNewlyUnlocked ? 'border-cyan-300/60 pt-16 shadow-cyan-300/10 sm:pt-8' : isFollowUp || isPaidMembersOnly ? 'border-amber-300/60 shadow-amber-300/10' : 'border-white/10'}`}
        >
            {isNewlyUnlocked && (
                <span className="absolute right-4 top-4 rounded-full bg-cyan-300 px-3 py-1 text-xs font-bold text-slate-950 shadow-lg">
                    Právě odemčeno
                </span>
            )}
            {(isFollowUp || isPaidMembersOnly) && (
                <div className="mb-4 flex flex-wrap gap-2">
                    {isFollowUp && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/30 bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-100">
                            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Navazující materiál
                        </span>
                    )}
                    {isPaidMembersOnly && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/30 bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-100">
                            <Crown className="h-3.5 w-3.5" aria-hidden="true" /> Pro placené členy
                        </span>
                    )}
                </div>
            )}
            {contentBlock.title && <h3 className="mb-5 text-xl font-bold text-white">{contentBlock.title}</h3>}
            <WorkshopMaterialBody bodyMarkdown={contentBlock.bodyMarkdown} callToActionLabel={callToActionLabel} />
        </motion.article>
    );
}

/**
 * Where the paid materials are, for the members who cannot see them. The materials themselves stay on the server;
 * this card only names them, says that they are here and opens the very same membership popup the badge in the header
 * opens.
 */
function WorkshopPaidMembersContentNotice({
    contentPreviews,
    onUnlockPaidMaterials,
}: {
    readonly contentPreviews: readonly WorkshopContentPreview[];
    readonly onUnlockPaidMaterials: () => void;
}) {
    // A material an administrator left untitled has nothing to tease with, so it keeps this card without being named
    // in it.
    const namedContentPreviews = contentPreviews.filter((contentPreview) => contentPreview.title.trim() !== '');

    return (
        <CommunityPaidMembersNotice
            title="Materiály pro placené členy"
            description="Na tomto místě jsou materiály dostupné jen pro placené členy komunity. Odemknete je měsíčním placeným členstvím."
            onUnlockPaidMembership={onUnlockPaidMaterials}
            unlockedLabel="Co odemknete"
            unlockedContent={
                namedContentPreviews.length === 0 ? undefined : (
                    <ul aria-label="Náhled materiálů pro placené členy" className="space-y-2">
                        {namedContentPreviews.map((contentPreview) => (
                            <li key={contentPreview.id} className="flex items-start gap-2">
                                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-200/70" aria-hidden="true" />
                                <span className="min-w-0 break-words text-sm font-semibold leading-6 text-amber-50">
                                    {contentPreview.title}
                                </span>
                            </li>
                        ))}
                    </ul>
                )
            }
        />
    );
}

export function WorkshopContent({
    contentBlocks,
    nextContentUnlockAt,
    newlyUnlockedContentBlockIds,
    paidMembersOnlyContentPreviews,
    specialMaterials = [],
    title = 'Materiály z workshopu',
}: WorkshopContentProps) {
    // Note: The purchase is only offered while a gate is configured and the member has not paid yet, which is exactly
    //       when the server keeps the paid materials hidden, so the notice and the hidden materials cannot disagree.
    const membershipPurchaseOffer = useCommunityMembershipPurchaseOffer();
    const isPaidMembersContentNoticeShown =
        paidMembersOnlyContentPreviews.length > 0 && membershipPurchaseOffer !== null;
    const isSpecialMaterialShown = specialMaterials.length > 0;
    // Note: The community is invited to at the head of the list of a member who has not joined it yet and stays at
    //       the end of the list of a member who already pays, which is the one difference the membership makes here.
    const isPaidMember = useIsPaidCommunityMember();
    const { specialMaterialsBeforeContentBlocks, specialMaterialsAfterContentBlocks } =
        selectWorkshopSpecialMaterialsByPlacement(specialMaterials, { isPaidMember });

    if (
        contentBlocks.length === 0 &&
        nextContentUnlockAt === null &&
        !isPaidMembersContentNoticeShown &&
        !isSpecialMaterialShown
    ) {
        return null;
    }

    return (
        <section className="mt-8" aria-labelledby="workshop-materials-title">
            <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-300" />
                <h2 id="workshop-materials-title" className="text-xl font-bold text-white">
                    {title}
                </h2>
            </div>

            <div className="space-y-4">
                {specialMaterialsBeforeContentBlocks.map((specialMaterial) => (
                    <Fragment key={specialMaterial.id}>{specialMaterial.content}</Fragment>
                ))}

                {contentBlocks.map((contentBlock) => (
                    <WorkshopMaterialCard
                            key={contentBlock.id}
                                contentBlock={contentBlock}
                        isNewlyUnlocked={newlyUnlockedContentBlockIds.has(contentBlock.id)}
                            />
                ))}

                {specialMaterialsAfterContentBlocks.map((specialMaterial) => (
                    <Fragment key={specialMaterial.id}>{specialMaterial.content}</Fragment>
                ))}

                {nextContentUnlockAt && (
                    <div className="flex items-start gap-3 rounded-xl border border-dashed border-cyan-300/20 bg-cyan-300/[0.04] px-5 py-4 text-sm text-slate-400">
                        <Clock3 className="h-5 w-5 shrink-0 text-cyan-300" />
                        <span className="min-w-0">
                            Další materiál se automaticky odemkne{' '}
                            {CZECH_DATE_TIME_FORMAT.format(new Date(nextContentUnlockAt))}.
                        </span>
                    </div>
                )}

                {isPaidMembersContentNoticeShown && membershipPurchaseOffer !== null && (
                    <WorkshopPaidMembersContentNotice
                        contentPreviews={paidMembersOnlyContentPreviews}
                        onUnlockPaidMaterials={membershipPurchaseOffer.openMembershipModal}
                    />
                )}
            </div>
        </section>
    );
}
