const CZECH_COMMIT_TIME_FORMAT = new Intl.DateTimeFormat('cs-CZ', {
    year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Prague',
});

/** Administration and the room describe the same committed timestamp in the workshop's timezone. */
export function formatGithubCommitDate(committedAt: string): string {
    return CZECH_COMMIT_TIME_FORMAT.format(new Date(committedAt));
}
