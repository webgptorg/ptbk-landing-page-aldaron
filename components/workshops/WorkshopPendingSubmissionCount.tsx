type WorkshopPendingSubmissionCountProps = {
    readonly count: number | null;
    readonly authorName: string;
    readonly className?: string;
};

/** The complete pending total shown wherever somebody grants a participant trust or moderation. */
export function WorkshopPendingSubmissionCount({ count, authorName, className }: WorkshopPendingSubmissionCountProps) {
    if (typeof count !== 'number') {
        return null;
    }

    return (
        <span
            className={className}
            aria-label={`${authorName}: čeká na schválení ${count}`}
            title="Čekající komentáře, vlastní odpovědi v anketách a sdílené projekty. Udělení důvěry nebo moderování je schválí, pokud účastník nemá zakázané interakce."
        >
            Čeká na schválení: {count}
        </span>
    );
}
