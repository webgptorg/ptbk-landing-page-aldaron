'use client';

import {
    ONLINE_WORKSHOP_HOST_FULLNAME,
    ONLINE_WORKSHOP_PARTICIPANT_PATH,
} from '@/businesses/online-workshop/config';
import { createOnlineWorkshopConnectionDetails } from '@/businesses/online-workshop/onlineWorkshopTerms';
import { OnlineWorkshopParticipantPage } from '@/businesses/online-workshop/participant/OnlineWorkshopParticipantPage';
import { OnlineWorkshopRoomTermPicker } from '@/businesses/online-workshop/participant/OnlineWorkshopRoomTermPicker';
import type { EventOccurrence } from '@/lib/events/eventOccurrence';
import { createWorkshopSelectionPath } from '@/lib/workshops/workshopParticipantLink';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';
import { useState } from 'react';

/**
 * How many terms it takes for a participant to be offered a choice at all
 *
 * Note: One term is no choice, and a room which offers a list of exactly the workshop it already describes would only
 *       ask a participant to confirm what they have been told.
 */
const MINIMAL_PICKED_ONLINE_WORKSHOP_COUNT = 2;

type OnlineWorkshopSelectedTermRoomProps = {
    /**
     * The term this address opened, which is the one a participant connects to unless they pick another
     */
    readonly openedWorkshop: WorkshopSummary;

    /**
     * Every published term of the online workshop, which is what a participant picks from
     */
    readonly workshops: readonly EventOccurrence[];

    /**
     * Moment the server built this page at, which places every offered term in time
     */
    readonly currentTime: string;
    readonly initialEmail: string;
    readonly initialFullname: string;
};

/**
 * Keeps the address of the room on the term which is really being entered, so reloading the waiting room or sharing
 * its address opens the workshop a participant picked rather than the one they were offered first.
 */
function rememberPickedWorkshopInAddress(workshopSlug: string): void {
    const roomPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.history.replaceState(window.history.state, '', createWorkshopSelectionPath(roomPath, workshopSlug));
}

/**
 * The room of one term of the online workshop, together with the choice of which term that is
 *
 * Note: The choice lives here rather than in the shared room, because only this business surface knows which terms
 *       belong to the online workshop. The room below is the very same audited participant room every other kind of
 *       event uses.
 */
export function OnlineWorkshopSelectedTermRoom({
    openedWorkshop,
    workshops,
    currentTime,
    initialEmail,
    initialFullname,
}: OnlineWorkshopSelectedTermRoomProps) {
    const [pickedWorkshopSlug, setPickedWorkshopSlug] = useState(openedWorkshop.slug);

    // Note: A term which is not among the published ones leaves the room exactly where the address put it, so an
    //       address opening a term this list does not carry still enters that very term.
    const selectedWorkshop =
        workshops.find((workshop) => workshop.slug === pickedWorkshopSlug) ?? openedWorkshop;
    const isChoiceOffered = workshops.length >= MINIMAL_PICKED_ONLINE_WORKSHOP_COUNT;

    const pickWorkshop = (workshop: EventOccurrence) => {
        setPickedWorkshopSlug(workshop.slug);
        rememberPickedWorkshopInAddress(workshop.slug);
    };

    return (
        <OnlineWorkshopParticipantPage
            workshopSlug={selectedWorkshop.slug}
            connectionDetails={createOnlineWorkshopConnectionDetails(selectedWorkshop)}
            calendarDetails={{
                hostFullname: ONLINE_WORKSHOP_HOST_FULLNAME,
                participantPath: ONLINE_WORKSHOP_PARTICIPANT_PATH,
            }}
            initialEmail={initialEmail}
            initialFullname={initialFullname}
            connectionTermPicker={
                isChoiceOffered ? (
                    <OnlineWorkshopRoomTermPicker
                        terms={workshops}
                        selectedTermSlug={selectedWorkshop.slug}
                        onSelectTerm={pickWorkshop}
                        currentTime={currentTime}
                    />
                ) : undefined
            }
        />
    );
}
