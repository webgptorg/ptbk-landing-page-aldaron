'use client';

import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { CommunityMembershipRoomState } from '@/lib/community-membership/communityMembershipTypes';
import { formatCzechWorkshopDay } from '@/lib/workshops/workshopDate';
import { CalendarClock, ExternalLink, Loader2, RotateCcw } from 'lucide-react';
import { useState, type MouseEvent } from 'react';

type CommunityMembershipSubscriptionManagementProps = {
    readonly membership: CommunityMembershipRoomState;
    readonly isMembershipCancellationChanging: boolean;
    readonly isMembershipPortalOpening: boolean;
    readonly errorMessage: string | null;
    readonly onScheduleCancellation: () => Promise<boolean>;
    readonly onReactivate: () => Promise<boolean>;
    readonly onOpenMembershipPortal: () => Promise<void>;
};

function createPaidAccessEndDescription(currentPeriodEndsAt: string | null): string {
    return currentPeriodEndsAt === null
        ? 'po dobu již zaplaceného období'
        : `do ${formatCzechWorkshopDay(currentPeriodEndsAt)}`;
}

type StripeSubscriptionPortalButtonProps = {
    readonly isMembershipCancellationChanging: boolean;
    readonly isMembershipPortalOpening: boolean;
    readonly onOpenMembershipPortal: () => Promise<void>;
};

function StripeSubscriptionPortalButton({
    isMembershipCancellationChanging,
    isMembershipPortalOpening,
    onOpenMembershipPortal,
}: StripeSubscriptionPortalButtonProps) {
    return (
        <Button
            type="button"
            variant="outline"
            disabled={isMembershipCancellationChanging || isMembershipPortalOpening}
            onClick={() => void onOpenMembershipPortal()}
            className="rounded-full border-room-accent/35 bg-transparent text-room-accent hover:bg-room-accent/10 hover:text-room-accent"
        >
            {isMembershipPortalOpening ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
                <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            Spravovat platbu ve Stripe
        </Button>
    );
}

/**
 * Keeps direct renewal cancellation and reactivation in the room while offering Stripe's customer portal for the
 * payment details Stripe owns.
 */
export function CommunityMembershipSubscriptionManagement({
    membership,
    isMembershipCancellationChanging,
    isMembershipPortalOpening,
    errorMessage,
    onScheduleCancellation,
    onReactivate,
    onOpenMembershipPortal,
}: CommunityMembershipSubscriptionManagementProps) {
    const [isCancellationConfirmationOpen, setIsCancellationConfirmationOpen] = useState(false);
    const paidAccessEndDescription = createPaidAccessEndDescription(membership.currentPeriodEndsAt);
    const isMembershipManagementChanging = isMembershipCancellationChanging || isMembershipPortalOpening;

    const handleCancellationConfirmation = async (event: MouseEvent<HTMLButtonElement>) => {
        // Wait for the server before closing the confirmation so a second click cannot create another cancellation
        // request. The main membership modal shows any refusal once this confirmation closes.
        event.preventDefault();
        await onScheduleCancellation();
        setIsCancellationConfirmationOpen(false);
    };

    if (!membership.isSubscriptionManagementOffered) {
        return null;
    }

    if (membership.isCancellationScheduled) {
        return (
            <section className="mt-5 rounded-2xl border border-room-warning/25 bg-room-warning/[0.08] p-4">
                <div className="flex items-start gap-3">
                    <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-room-warning" aria-hidden="true" />
                    <div>
                        <h3 className="font-semibold text-room-warning">Ukončení je naplánované</h3>
                        <p className="mt-1 text-sm leading-6 text-room-warning/85">
                            Další platbu už nestrhneme. Placené výhody vám zůstanou {paidAccessEndDescription}; potom
                            se členství automaticky přepne na Free členství.
                        </p>
                    </div>
                </div>

                {errorMessage !== null && (
                    <p
                        role="alert"
                        className="mt-4 rounded-xl border border-room-danger/25 bg-room-danger/10 px-3 py-2 text-sm text-room-danger"
                    >
                        {errorMessage}
                    </p>
                )}

                <div className="mt-4 flex flex-wrap gap-3">
                    <Button
                        type="button"
                        disabled={isMembershipManagementChanging}
                        onClick={() => void onReactivate()}
                        className="rounded-full bg-room-warning font-bold text-room-action-foreground hover:bg-room-warning"
                    >
                        {isMembershipCancellationChanging ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                            <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                        )}
                        Obnovit placené členství
                    </Button>
                    <StripeSubscriptionPortalButton
                        isMembershipCancellationChanging={isMembershipCancellationChanging}
                        isMembershipPortalOpening={isMembershipPortalOpening}
                        onOpenMembershipPortal={onOpenMembershipPortal}
                    />
                </div>
            </section>
        );
    }

    return (
        <section className="mt-5 rounded-2xl border border-room-border/10 bg-room-inset/40 p-4">
            <h3 className="font-semibold text-room-heading">Správa členství</h3>
            <p className="mt-1 text-sm leading-6 text-room-text">
                Členství se obnovuje každý měsíc. Když jeho obnovení zrušíte, placené výhody vám zůstanou{' '}
                {paidAccessEndDescription}.
            </p>

            {errorMessage !== null && (
                <p
                    role="alert"
                    className="mt-4 rounded-xl border border-room-danger/25 bg-room-danger/10 px-3 py-2 text-sm text-room-danger"
                >
                    {errorMessage}
                </p>
            )}

            <div className="mt-4">
                <StripeSubscriptionPortalButton
                    isMembershipCancellationChanging={isMembershipCancellationChanging}
                    isMembershipPortalOpening={isMembershipPortalOpening}
                    onOpenMembershipPortal={onOpenMembershipPortal}
                />
            </div>

            <AlertDialog open={isCancellationConfirmationOpen} onOpenChange={setIsCancellationConfirmationOpen}>
                <AlertDialogTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isMembershipManagementChanging}
                        className="mt-3 rounded-full border-room-danger/35 bg-transparent text-room-danger hover:bg-room-danger/10 hover:text-room-danger"
                    >
                        Zrušit placené členství
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="workshop-room border-room-border/10 bg-room-surface text-room-heading sm:rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-room-heading">Opravdu chcete zrušit placené členství?</AlertDialogTitle>
                        <AlertDialogDescription className="leading-6 text-room-text">
                            Další platbu už nestrhneme. Placené výhody vám přesto zůstanou {paidAccessEndDescription}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={isMembershipManagementChanging}
                            className="border-room-border/20 bg-transparent text-room-text hover:bg-room-overlay/10 hover:text-room-heading"
                        >
                            Nechat aktivní
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isMembershipManagementChanging}
                            onClick={(event) => void handleCancellationConfirmation(event)}
                            className="bg-room-danger text-room-action-foreground hover:bg-room-danger/90"
                        >
                            {isMembershipCancellationChanging && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                            )}
                            Ano, zrušit obnovu
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    );
}
