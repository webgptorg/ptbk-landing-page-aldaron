import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { normalizePublicWebPageUrl } from '@/lib/network/publicWebPageUrl';

const PUBLIC_WEB_PAGE_REQUEST_TIMEOUT_MILLISECONDS = 10_000;
const MAXIMAL_PUBLIC_WEB_PAGE_HTML_BYTES = 1_000_000;
const MAXIMAL_PUBLIC_WEB_PAGE_REDIRECT_COUNT = 4;
const PUBLIC_WEB_PAGE_USER_AGENT = 'Promptbook Public Web Page Preview/1.0';
const HTML_META_TAG_PATTERN = /<meta\b[^>]*>/gi;
const HTML_ATTRIBUTE_PATTERN = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>]+)))?/g;
const HTML_TITLE_PATTERN = /<title\b[^>]*>([\s\S]*?)<\/title>/i;

export type PublicWebPagePreview = {
    readonly url: string;
    readonly title: string;
    readonly description: string;
    readonly previewImageUrl: string | null;
};

export type ScrapePublicWebPagePreviewOptions = {
    /**
     * How long a successfully fetched public page may be reused. A form which is editing a project leaves this out,
     * while a repeatedly rendered public card can avoid asking the project host on every visit.
     */
    readonly revalidateSeconds?: number;
};

export class PublicWebPagePreviewError extends Error {}

type HtmlAttributes = Readonly<Record<string, string>>;

function normalizeMetadataText(value: string): string {
    return value
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function parseHtmlAttributes(htmlTag: string): HtmlAttributes {
    const attributes: Record<string, string> = {};
    let attributeMatch: RegExpExecArray | null;

    while ((attributeMatch = HTML_ATTRIBUTE_PATTERN.exec(htmlTag)) !== null) {
        const attributeName = attributeMatch[1].toLowerCase();
        const attributeValue = attributeMatch[2] ?? attributeMatch[3] ?? attributeMatch[4] ?? '';
        attributes[attributeName] = attributeValue;
    }

    return attributes;
}

function getMetadataValue(html: string, names: readonly string[]): string | null {
    // The requested order is meaningful: Open Graph is the card contract, while a plain document description is only
    // a fallback. Looking for one name at a time prevents an earlier generic tag from winning over a later OG tag.
    for (const name of names) {
        HTML_META_TAG_PATTERN.lastIndex = 0;
        let metaTagMatch: RegExpExecArray | null;
        while ((metaTagMatch = HTML_META_TAG_PATTERN.exec(html)) !== null) {
            const attributes = parseHtmlAttributes(metaTagMatch[0]);
            const metadataName = attributes.property ?? attributes.name;
            const content = attributes.content;
            if (metadataName?.toLowerCase() !== name.toLowerCase() || content === undefined) {
                continue;
            }

            const normalizedContent = normalizeMetadataText(content);
            if (normalizedContent !== '') {
                return normalizedContent;
            }
        }
    }

    return null;
}

function getHtmlTitle(html: string): string | null {
    const titleMatch = html.match(HTML_TITLE_PATTERN);
    if (titleMatch === null) {
        return null;
    }

    const title = normalizeMetadataText(titleMatch[1]);
    return title === '' ? null : title;
}

function resolvePreviewImageUrl(value: string | null, pageUrl: string): string | null {
    if (value === null) {
        return null;
    }

    try {
        const imageUrl = new URL(value, pageUrl);
        return normalizePublicWebPageUrl(imageUrl.toString());
    } catch {
        return null;
    }
}

/**
 * Extracts display metadata from an already-read public page. Keeping parsing
 * outside networking gives every caller the same Open Graph and document-title
 * fallback without making their tests rely on the network.
 */
export function extractPublicWebPagePreview(html: string, pageUrl: string): PublicWebPagePreview {
    const normalizedUrl = normalizePublicWebPageUrl(pageUrl);
    if (normalizedUrl === null) {
        throw new PublicWebPagePreviewError('Page URL is invalid');
    }

    const fallbackTitle = new URL(normalizedUrl).hostname;
    const title = getMetadataValue(html, ['og:title', 'twitter:title']) ?? getHtmlTitle(html) ?? fallbackTitle;
    const description = getMetadataValue(html, ['og:description', 'twitter:description', 'description']) ?? '';
    const previewImageUrl = resolvePreviewImageUrl(
        getMetadataValue(html, ['og:image', 'twitter:image']),
        normalizedUrl,
    );

    return {
        url: normalizedUrl,
        title: title.slice(0, 200),
        description: description.slice(0, 2_000),
        previewImageUrl,
    };
}

function getIpAddressParts(address: string): readonly number[] | null {
    const parts = address.split('.');
    if (parts.length !== 4) {
        return null;
    }

    const numericParts = parts.map((part) => Number(part));
    return numericParts.every((part) => Number.isInteger(part) && part >= 0 && part <= 255) ? numericParts : null;
}

function isPrivateIpv4Address(address: string): boolean {
    const parts = getIpAddressParts(address);
    if (parts === null) {
        return true;
    }

    const [firstPart, secondPart] = parts;
    return (
        firstPart === 0 ||
        firstPart === 10 ||
        firstPart === 127 ||
        (firstPart === 100 && secondPart >= 64 && secondPart <= 127) ||
        (firstPart === 169 && secondPart === 254) ||
        (firstPart === 172 && secondPart >= 16 && secondPart <= 31) ||
        (firstPart === 192 && secondPart === 168) ||
        (firstPart === 198 && (secondPart === 18 || secondPart === 19)) ||
        firstPart >= 224
    );
}

function isPrivateIpv6Address(address: string): boolean {
    const normalizedAddress = address.toLowerCase();
    if (normalizedAddress === '::' || normalizedAddress === '::1') {
        return true;
    }

    if (
        normalizedAddress.startsWith('fc') ||
        normalizedAddress.startsWith('fd') ||
        normalizedAddress.startsWith('fe80:')
    ) {
        return true;
    }

    const mappedIpv4Address = normalizedAddress.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
    return mappedIpv4Address === undefined ? false : isPrivateIpv4Address(mappedIpv4Address);
}

function isPrivateIpAddress(address: string): boolean {
    return isIP(address) === 4 ? isPrivateIpv4Address(address) : isPrivateIpv6Address(address);
}

function getHostnameWithoutIpv6Brackets(hostname: string): string {
    return hostname.replace(/^\[/, '').replace(/\]$/, '');
}

async function assertPublicWebPageUrl(url: string): Promise<void> {
    const parsedUrl = new URL(url);
    const hostname = getHostnameWithoutIpv6Brackets(parsedUrl.hostname);
    if (hostname.toLowerCase() === 'localhost') {
        throw new PublicWebPagePreviewError('Page URL must be publicly reachable');
    }

    if (isIP(hostname) !== 0) {
        if (isPrivateIpAddress(hostname)) {
            throw new PublicWebPagePreviewError('Page URL must be publicly reachable');
        }
        return;
    }

    let addressRecords: Awaited<ReturnType<typeof lookup>>[];
    try {
        addressRecords = await lookup(hostname, { all: true, verbatim: true });
    } catch {
        throw new PublicWebPagePreviewError('Page URL could not be resolved');
    }

    if (
        addressRecords.length === 0 ||
        addressRecords.some((addressRecord) => isPrivateIpAddress(addressRecord.address))
    ) {
        throw new PublicWebPagePreviewError('Page URL must be publicly reachable');
    }
}

async function readPublicWebPageBytes(response: Response, maximalBytes: number): Promise<Buffer> {
    const reader = response.body?.getReader();
    if (reader === undefined) {
        return Buffer.alloc(0);
    }

    let byteCount = 0;
    const chunks: Uint8Array[] = [];

    while (true) {
        const readResult = await reader.read();
        if (readResult.done) {
            break;
        }

        byteCount += readResult.value.byteLength;
        if (byteCount > maximalBytes) {
            await reader.cancel();
            throw new PublicWebPagePreviewError('Page is too large to preview');
        }

        chunks.push(readResult.value);
    }

    return Buffer.concat(chunks);
}

/** HTML and its preview image share public-address checks, redirect limits and bounded, timed reads. */
export async function fetchPublicWebPageResource(
    initialUrl: string,
    options: {
        readonly accept: string;
        readonly contentTypePattern: RegExp;
        readonly maximalBytes: number;
        readonly revalidateSeconds?: number;
    },
): Promise<{ readonly bytes: Buffer; readonly url: string }> {
    if (normalizePublicWebPageUrl(initialUrl) === null) {
        throw new PublicWebPagePreviewError('Page URL is invalid');
    }
    let currentUrl = initialUrl;

    for (let redirectCount = 0; redirectCount <= MAXIMAL_PUBLIC_WEB_PAGE_REDIRECT_COUNT; redirectCount += 1) {
        await assertPublicWebPageUrl(currentUrl);

        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), PUBLIC_WEB_PAGE_REQUEST_TIMEOUT_MILLISECONDS);
        try {
            const response = await fetch(currentUrl, {
                method: 'GET',
                redirect: 'manual',
                signal: abortController.signal,
                headers: {
                    Accept: options.accept,
                    'User-Agent': PUBLIC_WEB_PAGE_USER_AGENT,
                },
                ...(options.revalidateSeconds === undefined ? {} : { next: { revalidate: options.revalidateSeconds } }),
            });

            if (response.status >= 300 && response.status < 400) {
                await response.body?.cancel();
                const redirectLocation = response.headers.get('location');
                if (redirectLocation === null || redirectCount === MAXIMAL_PUBLIC_WEB_PAGE_REDIRECT_COUNT) {
                    throw new PublicWebPagePreviewError('Page redirects too many times');
                }

                const redirectedUrl = normalizePublicWebPageUrl(new URL(redirectLocation, currentUrl).toString());
                if (redirectedUrl === null) {
                    throw new PublicWebPagePreviewError('Page redirects to an unsupported URL');
                }

                currentUrl = redirectedUrl;
                continue;
            }

            if (!response.ok) {
                await response.body?.cancel();
                throw new PublicWebPagePreviewError('Page could not be loaded');
            }

            const contentType = response.headers.get('content-type') ?? '';
            if (!options.contentTypePattern.test(contentType)) {
                await response.body?.cancel();
                throw new PublicWebPagePreviewError('Unsupported preview content type');
            }

            return { bytes: await readPublicWebPageBytes(response, options.maximalBytes), url: currentUrl };
        } catch (error) {
            if (error instanceof PublicWebPagePreviewError) throw error;
            throw new PublicWebPagePreviewError('Page could not be loaded');
        } finally {
            clearTimeout(timeoutId);
        }
    }

    throw new PublicWebPagePreviewError('Page redirects too many times');
}

/** Fetches a public web page and resolves one stable title for any UI which links to it. */
export async function fetchPublicWebPageTitle(value: string): Promise<string> {
    return (await scrapePublicWebPagePreview(value)).title;
}

/** Fetches a public page and resolves its Open Graph metadata for a link preview. */
export async function scrapePublicWebPagePreview(
    value: string,
    { revalidateSeconds }: ScrapePublicWebPagePreviewOptions = {},
): Promise<PublicWebPagePreview> {
    const normalizedUrl = normalizePublicWebPageUrl(value);
    if (normalizedUrl === null) {
        throw new PublicWebPagePreviewError('Page URL is invalid');
    }

    const { bytes, url } = await fetchPublicWebPageResource(normalizedUrl, {
        accept: 'text/html,application/xhtml+xml',
        contentTypePattern: /text\/html|application\/xhtml\+xml/i,
        maximalBytes: MAXIMAL_PUBLIC_WEB_PAGE_HTML_BYTES,
        revalidateSeconds,
    });
    return extractPublicWebPagePreview(bytes.toString('utf8'), url);
}
