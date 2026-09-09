/**
 * Every kind of document a publisher of an Atom feed answers a request for it with
 *
 * Note: A YouTube channel and the commits of a GitHub repository are both published as Atom, so both of them ask for
 *       the very same kinds of document rather than each naming them again.
 */
export const ATOM_FEED_MEDIA_TYPES = 'application/atom+xml, application/xml;q=0.9, text/xml;q=0.8';

/**
 * Every kind of document a podcast host answers a request for a feed with
 */
export const RSS_FEED_MEDIA_TYPES = 'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8';
