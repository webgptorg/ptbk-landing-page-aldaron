'use client';

import { COMMUNITY_PATH } from '@/businesses/community/config';
import { connectToCommunityProjectDiscussion } from '@/businesses/community/projects/communityProjectsApi';
import { CommunityProjectDetailsPanel } from '@/businesses/community/projects/CommunityProjectDetailsPanel';
import { OnlineWorkshopParticipantPage } from '@/businesses/online-workshop/participant/OnlineWorkshopParticipantPage';
import { WorkshopRoomWaitingShell } from '@/components/workshops/WorkshopRoomWaitingShell';
import type { CommunityProject } from '@/lib/community-projects/communityProjectTypes';
import { ArrowLeft, LoaderCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

type CommunityProjectDiscussionPageProps = {
    readonly project: CommunityProject;
};

function CommunityProjectDiscussionAccess({
    errorMessage,
    isConnecting,
    onConnect,
}: {
    readonly errorMessage: string | null;
    readonly isConnecting: boolean;
    readonly onConnect: () => Promise<void>;
}) {
    return (
        <main className="flex min-h-[calc(100svh-4.5rem)] items-center justify-center bg-room-background px-6 text-room-text">
            <div className="max-w-md rounded-2xl border border-room-border/10 bg-room-overlay/[0.04] p-8 text-center shadow-2xl">
                <h1 className="text-2xl font-bold text-room-heading">Diskuze projektu je pro členy komunity</h1>
                <p className="mt-3 text-sm leading-6 text-room-muted">
                    {errorMessage ?? 'Ověřujeme vaše připojení do komunity.'}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => void onConnect()}
                        disabled={isConnecting}
                        className="inline-flex items-center gap-2 rounded-full bg-room-action px-5 py-2.5 text-sm font-bold text-room-action-foreground hover:bg-room-action-hover disabled:opacity-60"
                    >
                        {isConnecting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        Ověřit připojení
                    </button>
                    <Link
                        href={COMMUNITY_PATH}
                        className="inline-flex items-center gap-2 rounded-full border border-room-border/15 px-5 py-2.5 text-sm font-bold text-room-heading hover:bg-room-overlay/10"
                    >
                        <ArrowLeft className="h-4 w-4" /> Otevřít komunitu
                    </Link>
                </div>
            </div>
        </main>
    );
}

/**
 * Project discussions bootstrap their own narrowly scoped workshop session from the member's community session, then
 * hand off to the proven workshop participant room. The author record created with the project is already a moderator
 * of that room, so the normal chat moderation UI needs no special project branch.
 */
export function CommunityProjectDiscussionPage({ project }: CommunityProjectDiscussionPageProps) {
    const [isConnecting, setIsConnecting] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [sessionVersion, setSessionVersion] = useState(0);

    const connect = useCallback(async () => {
        setIsConnecting(true);
        setErrorMessage(null);
        try {
            await connectToCommunityProjectDiscussion(project.id);
            setIsConnected(true);
            setSessionVersion((currentVersion) => currentVersion + 1);
        } catch {
            setIsConnected(false);
            setErrorMessage('Nejdřív se připojte do komunity. Potom se sem můžete vrátit a otevřít diskuzi projektu.');
        } finally {
            setIsConnecting(false);
        }
    }, [project.id]);

    useEffect(() => {
        void connect();
    }, [connect]);

    if (!isConnected) {
        return (
            <WorkshopRoomWaitingShell>
                <CommunityProjectDiscussionAccess errorMessage={errorMessage} isConnecting={isConnecting} onConnect={connect} />
            </WorkshopRoomWaitingShell>
        );
    }

    return (
        <OnlineWorkshopParticipantPage
            key={sessionVersion}
            workshopSlug={project.discussionWorkshopSlug}
            connectionDetails={{
                title: project.title,
                description: project.description,
                dateLabel: 'Komunitní diskuze',
                durationLabel: 'Přístup pro členy',
                roomLabel: 'Projekt komunity',
                connectionHeading: 'Připojit se do diskuze',
                connectionDescription: 'Diskuze projektu navazuje na vaše připojení do komunity.',
                submitLabel: 'Otevřít diskuzi',
                language: 'cs',
            }}
            calendarDetails={null}
            initialEmail=""
            initialFullname=""
            roomSubtitle="Projekt komunity · Promptbook"
            isWorkshopSelectionInUrl={false}
            isMaterialsShown={false}
            mainContentAfterWorkshopNavigation={<CommunityProjectDetailsPanel project={project} />}
            connectionRequiredContent={
                <CommunityProjectDiscussionAccess
                    errorMessage="Připojení do diskuze vypršelo. Obnovíme ho podle vašeho členství v komunitě."
                    isConnecting={isConnecting}
                    onConnect={connect}
                />
            }
            unavailableConnectionMessage="Diskuze projektu se nepodařila načíst."
        />
    );
}
