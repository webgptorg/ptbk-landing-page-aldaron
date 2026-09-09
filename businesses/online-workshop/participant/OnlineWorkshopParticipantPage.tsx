'use client';

import { CommunityRoomInvitation } from '@/businesses/community/CommunityRoomInvitation';
import { CommunityMembershipBadge } from '@/businesses/community/membership/CommunityMembershipBadge';
import { CommunityMembershipModal } from '@/businesses/community/membership/CommunityMembershipModal';
import { CommunityMembershipRoomProvider } from '@/businesses/community/membership/CommunityMembershipRoomProvider';
import { WorkshopCalendarInvitation } from '@/businesses/online-workshop/participant/WorkshopCalendarInvitation';
import { WorkshopChat } from '@/businesses/online-workshop/participant/WorkshopChat';
import {
    WorkshopConnectionForm,
    type WorkshopConnectionDetails,
} from '@/businesses/online-workshop/participant/WorkshopConnectionForm';
import { WorkshopContent } from '@/businesses/online-workshop/participant/WorkshopContent';
import { WorkshopParticipantBadge } from '@/businesses/online-workshop/participant/WorkshopParticipantBadge';
import { WorkshopPolls } from '@/businesses/online-workshop/participant/WorkshopPolls';
import { WorkshopReactions } from '@/businesses/online-workshop/participant/WorkshopReactions';
import { WorkshopRepositoryPanel } from '@/businesses/online-workshop/participant/WorkshopRepositoryPanel';
import { WorkshopStage } from '@/businesses/online-workshop/participant/WorkshopStage';
import { WorkshopServerConnectionStatus } from '@/businesses/online-workshop/participant/WorkshopServerConnectionStatus';
import { WorkshopWatchingBadge } from '@/businesses/online-workshop/participant/WorkshopWatchingBadge';
import { useWorkshopParticipantOfflineSupport } from '@/businesses/online-workshop/participant/useWorkshopParticipantOfflineSupport';
import { useWorkshopParticipant } from '@/businesses/online-workshop/participant/useWorkshopParticipant';
import { WorkshopLinksPanel } from '@/components/workshops/WorkshopLinksPanel';
import { getWorkshopKindCapabilities, isWorkshopPollVisibleInRoom } from '@/lib/workshops/workshopKindCapabilities';
import { isWorkshopParticipantModerating } from '@/lib/workshops/workshopModeration';
import { isWorkshopPanelOffered, type WorkshopPanelKey } from '@/lib/workshops/workshopPanels';
import { WORKSHOP_SEARCH_PARAMETER_NAME } from '@/lib/workshops/workshopParticipantLink';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';
import { RefreshCw, Radio } from 'lucide-react';
import Image from 'next/image';
import { useEffect, type ReactNode } from 'react';

/**
 * What it takes to offer this workshop to the calendar of a participant
 */
export type WorkshopCalendarDetails = {
    readonly hostFullname: string;
    readonly participantPath: string;
};

/**
 * Optional hand-off from a persistent room to the terms of every kind of event. The shared participant room only needs
 * the data required to keep a participant identity in those links, never business-specific UI knowledge.
 *
 * Note: Where one term leads is decided by the kind of event it is a term of, so this hand-off never names a path and
 *       a kind of event added later is led to without changing anything here.
 */
export type WorkshopNavigationDetails = {
    readonly workshops: readonly WorkshopSummary[];
    readonly title: string;
    readonly description: string;
    readonly emptyMessage: string;
    readonly locale: string;
    readonly timeZone: string;

    /**
     * Absolute url of the published calendar of these terms, which a room without one leaves out
     */
    readonly calendarFeedUrl?: string;
};

type OnlineWorkshopParticipantPageProps = {
    readonly workshopSlug: string;
    readonly connectionDetails: WorkshopConnectionDetails;
    readonly calendarDetails: WorkshopCalendarDetails | null;

    /**
     * Identity carried here by the link which opened the room, offered to the connection form
     *
     * Note: This only ever prefills that form. A connected participant is described by the loaded room itself, so a
     *       returning member who opened no such link is known just as well.
     */
    readonly initialEmail: string;
    readonly initialFullname: string;
    readonly roomSubtitle?: string;
    readonly isWorkshopSelectionInUrl?: boolean;
    readonly workshopNavigation?: WorkshopNavigationDetails;
    readonly materialsTitle?: string;
    readonly unavailableConnectionMessage?: string;

    /**
     * Optional room-specific member information shown next to the connected participant. This keeps the shared room
     * layout unaware of the business surface that supplied the information.
     *
     * Note: The membership of the member is deliberately not supplied this way. It belongs to every room which offers
     *       it rather than to one business surface, so the room draws it itself just above this supplement.
     */
    readonly participantHeaderSupplement?: ReactNode;

    /**
     * Optional community-specific content placed after room navigation and before materials. It lets the permanent
     * community add a surface without copying the secured participant-room layout.
     */
    readonly mainContentAfterWorkshopNavigation?: ReactNode;

    /**
     * A project discussion has no materials of its own, while the shared community room continues to show them.
     */
    readonly isMaterialsShown?: boolean;

    /**
     * A room may require a domain-specific reconnection flow instead of the general name-and-email form.
     */
    readonly connectionRequiredContent?: ReactNode;
};

export function OnlineWorkshopParticipantPage({
    workshopSlug,
    connectionDetails,
    calendarDetails,
    initialEmail,
    initialFullname,
    roomSubtitle = 'Online workshop · Promptbook',
    isWorkshopSelectionInUrl = true,
    workshopNavigation,
    materialsTitle,
    unavailableConnectionMessage = 'Připojení k workshopu se nepodařilo ověřit.',
    participantHeaderSupplement,
    mainContentAfterWorkshopNavigation,
    isMaterialsShown = true,
    connectionRequiredContent,
}: OnlineWorkshopParticipantPageProps) {
    const controller = useWorkshopParticipant(workshopSlug);
    useWorkshopParticipantOfflineSupport();

    useEffect(() => {
        if (controller.state === null) {
            return;
        }

        const sanitizedUrl = new URL(window.location.href);
        const isWorkshopSelectionChanged = sanitizedUrl.searchParams.get(WORKSHOP_SEARCH_PARAMETER_NAME) !== workshopSlug;
        const isUrlChanged =
            (isWorkshopSelectionInUrl && isWorkshopSelectionChanged) ||
            (!isWorkshopSelectionInUrl && sanitizedUrl.searchParams.has(WORKSHOP_SEARCH_PARAMETER_NAME)) ||
            sanitizedUrl.searchParams.has('email') ||
            sanitizedUrl.searchParams.has('fullname');
        sanitizedUrl.searchParams.delete('email');
        sanitizedUrl.searchParams.delete('fullname');
        if (isWorkshopSelectionInUrl) {
            sanitizedUrl.searchParams.set(WORKSHOP_SEARCH_PARAMETER_NAME, workshopSlug);
        } else {
            sanitizedUrl.searchParams.delete(WORKSHOP_SEARCH_PARAMETER_NAME);
        }
        if (isUrlChanged) {
            window.history.replaceState(
                window.history.state,
                '',
                `${sanitizedUrl.pathname}${sanitizedUrl.search}${sanitizedUrl.hash}`,
            );
        }
    }, [controller.state, isWorkshopSelectionInUrl, workshopSlug]);

    if (controller.isCheckingConnection && controller.state === null) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#07151d] text-cyan-200">
                <RefreshCw className="h-7 w-7 animate-spin" aria-label="Ověřuji připojení" />
            </main>
        );
    }

    if (controller.isConnectionRequired) {
        return (
            connectionRequiredContent ?? (
                <WorkshopConnectionForm
                    connectionDetails={connectionDetails}
                    initialEmail={initialEmail}
                    initialFullname={initialFullname}
                    errorMessage={controller.errorMessage}
                    onConnect={controller.connect}
                />
            )
        );
    }

    if (controller.state === null) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#07151d] px-6 text-center text-slate-200">
                <div className="max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl">
                    <Radio className="mx-auto h-9 w-9 text-cyan-300" />
                    <h1 className="mt-5 text-2xl font-bold text-white">Místnost teď není dostupná</h1>
                    <p className="mt-3 text-sm leading-6 text-slate-400">
                        {controller.errorMessage ?? unavailableConnectionMessage}
                    </p>
                    <button
                        type="button"
                        onClick={() => void controller.refresh()}
                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-200"
                    >
                        <RefreshCw className="h-4 w-4" /> Zkusit znovu
                    </button>
                </div>
            </main>
        );
    }

    const { state } = controller;
    const roomCapabilities = getWorkshopKindCapabilities(state.workshop.kind);
    const isWorkshopPollVisible = isWorkshopPollVisibleInRoom(state.workshop.kind);
    const isModerating = isWorkshopParticipantModerating(state.participant);
    const followUpContentBlock = state.contentBlocks.find((contentBlock) => contentBlock.isFollowUp) ?? null;

    // Note: What the kind of this room has and what an administrator switched off is asked here once, so a new panel
    //       is one line of the room.
    const isPanelOffered = (panelKey: WorkshopPanelKey) =>
        isWorkshopPanelOffered(state.workshop.kind, state.workshop.disabledPanels, panelKey);

    const roomLayout = (
        <div className="min-h-screen bg-[#06131b] text-slate-200">
            <header className="border-b border-white/[0.07] bg-[#071820]/90 backdrop-blur">
                <div className="mx-auto flex max-w-[1500px] flex-col items-stretch gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-8">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <Image
                            src="/logo/promptbook-logo-blue-white-256.png"
                            alt="Promptbook"
                            width={36}
                            height={36}
                            className="h-9 w-9 rounded-lg"
                        />
                        <div className="min-w-0">
                            <p className="break-words text-sm font-bold text-white">{state.workshop.title}</p>
                            <p className="hidden text-xs text-slate-500 sm:block">{roomSubtitle}</p>
                        </div>
                    </div>
                    <div className="flex min-w-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
                        {isPanelOffered('watching-count') && (
                            <WorkshopWatchingBadge watchingParticipantCount={state.watchingParticipantCount} />
                        )}
                        <WorkshopParticipantBadge
                            fullname={state.participant.fullname}
                            isInteractionBanned={state.participant.isInteractionBanned}
                            isModerating={isModerating}
                            isRefreshing={controller.isRefreshing}
                            onChangeFullname={controller.changeFullname}
                        />
                        {/*
                          * Note: Every room which offers the membership says which one its member has and lets them
                          *       buy or manage it with the very same badge and modal instead of a surface of its own.
                          */}
                        <CommunityMembershipBadge />
                        <CommunityMembershipModal />
                        {participantHeaderSupplement}
                        <WorkshopServerConnectionStatus
                            isUsingCachedState={controller.isUsingCachedState}
                            isRefreshing={controller.isRefreshing}
                            unavailableMessage={controller.isUsingCachedState ? controller.errorMessage : null}
                            onRefresh={() => void controller.refresh()}
                        />
                    </div>
                </div>
            </header>

            <main className="mx-auto grid w-full min-w-0 max-w-[1500px] grid-cols-1 gap-5 px-4 py-4 sm:px-8 sm:py-5 lg:grid-cols-[minmax(0,1fr)_390px]">
                <div className="min-w-0 lg:col-start-1 lg:row-start-1">
                    {controller.errorMessage && !controller.isUsingCachedState ? (
                        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.08] px-4 py-3 text-sm text-rose-200">
                            <span className="min-w-0 flex-1 break-words">{controller.errorMessage}</span>
                            <button
                                type="button"
                                onClick={() => void controller.refresh()}
                                className="shrink-0 font-semibold underline underline-offset-4"
                            >
                                Zkusit znovu
                            </button>
                        </div>
                    ) : null}

                    {roomCapabilities.isStageOffered && (
                        <WorkshopStage
                            workshop={state.workshop}
                            serverTime={state.serverTime}
                            subscribeToReactions={controller.subscribeToReactions}
                            feedback={state.feedback}
                            followUpContentBlock={followUpContentBlock}
                            stageComment={state.stageComment}
                            paidMembersOnlyVideo={state.paidMembersOnlyVideo}
                            onSaveFeedback={controller.saveFeedback}
                        />
                    )}
                    {/*
                      * Note: A term is about a project only while its administration connected one, so a room which is
                      *       about no project shows nothing about one rather than an empty panel.
                      */}
                    {roomCapabilities.isRepositoryOffered && state.workshop.repository !== null && (
                        <WorkshopRepositoryPanel
                            workshopSlug={workshopSlug}
                            repository={state.workshop.repository}
                        />
                    )}
                    {calendarDetails !== null && (
                        <WorkshopCalendarInvitation
                            workshop={state.workshop}
                            serverTime={state.serverTime}
                            hostFullname={calendarDetails.hostFullname}
                            participantPath={calendarDetails.participantPath}
                            participantIdentity={state.participant}
                        />
                    )}
                    {isWorkshopPollVisible && (
                        <WorkshopPolls
                            polls={state.polls}
                            isInteractionBanned={state.participant.isInteractionBanned}
                            linkedParticipantIdentity={
                                workshopNavigation === undefined ? undefined : state.participant
                            }
                            onVote={controller.voteOnPoll}
                        />
                    )}
                    {workshopNavigation !== undefined && (
                        <WorkshopLinksPanel
                            workshops={workshopNavigation.workshops}
                            participantIdentity={state.participant}
                            title={workshopNavigation.title}
                            description={workshopNavigation.description}
                            emptyMessage={workshopNavigation.emptyMessage}
                            locale={workshopNavigation.locale}
                            timeZone={workshopNavigation.timeZone}
                            serverTime={state.serverTime}
                            calendarFeedUrl={workshopNavigation.calendarFeedUrl}
                        />
                    )}
                    {mainContentAfterWorkshopNavigation}
                    {isPanelOffered('reactions') && (
                        <WorkshopReactions
                            emojis={state.workshop.allowedReactions}
                            reactionCounts={state.reactionCounts}
                            isInteractionBanned={state.participant.isInteractionBanned}
                            onReact={controller.react}
                        />
                    )}
                    {/*
                      * Note: The community lists the terms and leads a member into the room of each of them, and this
                      *       is the way back out of such a room. It closes the main column rather than competing with
                      *       the stage, because it says where to go next rather than what is happening now.
                      */}
                    {roomCapabilities.isCommunityInvitationOffered && (
                        <CommunityRoomInvitation participantIdentity={state.participant} />
                    )}
                </div>

                <WorkshopChat
                    className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1"
                    comments={state.comments}
                    commentSort={controller.commentSort}
                    isEnabled={isPanelOffered('chat')}
                    isInteractionBanned={state.participant.isInteractionBanned}
                    isModerating={isModerating}
                    onChangeSort={controller.changeCommentSort}
                    onSubmitComment={controller.submitComment}
                    onUpvoteComment={controller.upvoteComment}
                    onModerateComment={controller.moderateComment}
                    onModerateAuthor={controller.moderateAuthor}
                />

                {isMaterialsShown && (
                    <div className="min-w-0 lg:col-start-1 lg:row-start-2">
                        <WorkshopContent
                            contentBlocks={state.contentBlocks}
                            nextContentUnlockAt={state.nextContentUnlockAt}
                            newlyUnlockedContentBlockIds={controller.newlyUnlockedContentBlockIds}
                            paidMembersOnlyContentPreviews={state.paidMembersOnlyContentPreviews}
                            title={materialsTitle}
                        />
                    </div>
                )}
            </main>
        </div>
    );

    /*
     * Note: The membership of a member is one membership wherever they read it from, and every surface of the room
     *       which needs to know it — the badge and the modal in the header, the paid materials and the video which a
     *       paid member unlocks after the workshop — asks this one controller instead of loading a membership of its
     *       own.
     */
    return (
        <CommunityMembershipRoomProvider
            workshopSlug={workshopSlug}
            isMembershipOffered={roomCapabilities.isMembershipOffered}
        >
            {roomLayout}
        </CommunityMembershipRoomProvider>
    );
}
