import { stripVTControlCharacters } from 'node:util';
import { z } from 'zod';
import { requestVercel } from '@/lib/vercel/vercelApi';
import { WORKSHOP_VERCEL_BUILD_LOG_MAX_LENGTH, WORKSHOP_VERCEL_DIAGNOSTIC_MAX_LENGTH } from '@/lib/workshops/workshopVercelDeployment';

const VERCEL_BUILD_LOG_EVENT_LIMIT = 50;
const VERCEL_BUILD_LOG_LINE_LIMIT = 30;
const VERCEL_BUILD_LOG_EVENT_SCHEMA = z.object({
    type: z.string(),
    text: z.string().nullish(),
    payload: z.object({ text: z.string().nullish() }).nullish(),
});
const VERCEL_BUILD_LOG_SCHEMA = z.array(VERCEL_BUILD_LOG_EVENT_SCHEMA).nullable();
const VERCEL_BUILD_LOG_TEXT_TYPES = new Set(['command', 'stdout', 'stderr', 'fatal']);
const REDACTED_VALUE = '[skryto]';
const SECRET_ASSIGNMENT_PATTERN = /(\b[\w-]*(?:token|secret|password|api[_-]?key|private[_-]?key|database_url|redis_url)[\w-]*["']?\s*[:=]\s*)(?:"[^"\n]*"|'[^'\n]*'|[^\s,;]+)/gi;

/** Provider diagnostics are plain text; strip terminal controls and credentials before projecting them to admin. */
export function sanitizeVercelDiagnostic(
    value: string | null | undefined,
    maximumLength = WORKSHOP_VERCEL_DIAGNOSTIC_MAX_LENGTH,
    isKeepingEnd = false,
): string | null {
    if (!value) return null;
    let text = stripVTControlCharacters(value);
    for (const credential of [process.env.VERCEL_TOKEN?.trim(), process.env.VERCEL_TEAM_ID?.trim()]) {
        if (credential) text = text.split(credential).join(REDACTED_VALUE);
    }
    text = text
        .replace(/\b(Bearer|Basic)\s+[\w.+/=-]+/gi, `$1 ${REDACTED_VALUE}`)
        .replace(SECRET_ASSIGNMENT_PATTERN, `$1${REDACTED_VALUE}`)
        .replace(/([a-z][a-z\d+.-]*:\/\/)[^\s/@]+:[^\s/@]+@/gi, `$1${REDACTED_VALUE}@`)
        .split('').filter((character) => character === '\n' || character === '\t' || character.charCodeAt(0) >= 32)
        .join('').trim();
    if (text.length <= maximumLength) return text || null;
    return isKeepingEnd ? `…${text.slice(-(maximumLength - 1))}` : `${text.slice(0, maximumLength - 1)}…`;
}

/** A bounded, non-streaming build-log tail is optional: a log outage must never hide the deployment's failure. */
export async function getVercelBuildLogExcerpt(deploymentId: string): Promise<string | null> {
    try {
        const parameters = new URLSearchParams({ direction: 'backward', follow: '0', builds: '1', limit: String(VERCEL_BUILD_LOG_EVENT_LIMIT) });
        const events = await requestVercel(`/v3/deployments/${encodeURIComponent(deploymentId)}/events?${parameters}`, VERCEL_BUILD_LOG_SCHEMA);
        const lines = (events ?? []).slice(0, VERCEL_BUILD_LOG_EVENT_LIMIT).reverse()
            .filter((event) => VERCEL_BUILD_LOG_TEXT_TYPES.has(event.type))
            .map((event) => sanitizeVercelDiagnostic(event.payload?.text ?? event.text, WORKSHOP_VERCEL_BUILD_LOG_MAX_LENGTH, true))
            .filter((text) => text !== null)
            .flatMap((text) => text.split('\n'));
        // Keep the end of the already-redacted text, where build tools report the final error.
        return lines.slice(-VERCEL_BUILD_LOG_LINE_LIMIT).join('\n').slice(-WORKSHOP_VERCEL_BUILD_LOG_MAX_LENGTH) || null;
    } catch {
        return null;
    }
}
