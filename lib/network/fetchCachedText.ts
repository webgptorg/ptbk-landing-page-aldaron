/**
 * How long a publisher may take to answer before the page is built without it
 *
 * Note: A publisher which accepts a connection and then never answers would otherwise hold the render of a page open
 *       for as long as whatever asked for that page is willing to wait. The bound is far above what any of the
 *       publishers this page reads takes on a good day, so a slow answer still arrives, while a silent one stops
 *       taking the whole page down with it.
 */
const REMOTE_DOCUMENT_TIMEOUT_IN_MILLISECONDS = 60_000;

export type FetchCachedTextOptions = {
    /**
     * Address the text is read from
     */
    readonly url: string;

    /**
     * How long an answer may be reused before the address is read again
     */
    readonly revalidateSeconds: number;

    /**
     * Which kinds of document the publisher may answer with, as an `Accept` header
     */
    readonly acceptedMediaTypes: string;

    /**
     * How this application names itself to the publisher, left out when the publisher does not care
     *
     * Note: Some publishers, the API of GitHub among them, refuse a request which does not say which client made it.
     */
    readonly userAgent?: string;
};

/**
 * Reads a document of another publisher, keeping the answer on the server for a while
 *
 * Note: The server asks a publisher at most once per revalidation window however many visitors open the page, which is
 *       both what keeps the page fast and what keeps this application a polite client of somebody else's feed.
 *
 *       A page built on somebody else's document is a landing page first. When the publisher is unreachable, answers
 *       with an error, or stays silent longer than the bound above, the failure ends here and the caller receives
 *       nothing instead of an exception.
 *
 * @returns body of the answer, `null` when it could not be read
 */
export async function fetchCachedText(options: FetchCachedTextOptions): Promise<string | null> {
    try {
        const response = await fetch(options.url, {
            headers: {
                Accept: options.acceptedMediaTypes,
                ...(options.userAgent === undefined ? {} : { 'User-Agent': options.userAgent }),
            },
            signal: AbortSignal.timeout(REMOTE_DOCUMENT_TIMEOUT_IN_MILLISECONDS),
            next: { revalidate: options.revalidateSeconds },
        });

        if (!response.ok) {
            console.error(`${options.url} answered with the status ${response.status}`);
            return null;
        }

        return await response.text();
    } catch (fetchError) {
        console.error(`${options.url} could not be read`, fetchError);
        return null;
    }
}
