import { formatCzechNumber } from '@/lib/language/czechNumbers';

const CZECH_FULL_DATE_FORMAT = new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
const ONE_THOUSAND = 1_000;
const TEN_THOUSAND = 10_000;
const SMALL_ESTIMATE_ROUNDING_INCREMENT = 100;
const MEDIUM_ESTIMATE_ROUNDING_INCREMENT = 500;
const LARGE_ESTIMATE_ROUNDING_INCREMENT = 5_000;

/** Reads the publisher's explicit episode number from an introduction when its title and RSS tag omit it. */
export function readAiTaKrajtaEpisodeNumberFromSummary(summary: string): number | null {
    const match = /^(?:Vítejte|Vítáme vás)\s+u\s+(\d+)\.\s+dílu\b/i.exec(summary.trim());
    const number = Number(match?.[1]);

    return Number.isSafeInteger(number) && number > 0 ? number : null;
}

/**
 * Writes the day an episode came out, for example `27. srpna 2026`
 */
export function formatAiTaKrajtaDate(isoDate: string): string {
    return CZECH_FULL_DATE_FORMAT.format(new Date(isoDate));
}

/**
 * Writes the month an episode came out in the case which follows the Czech `od`, for example `května 2025`
 *
 * Note: `Intl` only declines a month name when it formats a whole date, so the day is formatted along with it and
 *       then dropped. Asking for the month on its own would give the nominative `květen`, which reads wrong after
 *       `od`.
 */
export function formatAiTaKrajtaMonthAfterOd(isoDate: string): string {
    return CZECH_FULL_DATE_FORMAT.format(new Date(isoDate)).replace(/^\d+\.\s*/, '');
}

/**
 * Writes a price the way an invoice writes it, for example `25 000 Kč`
 */
export function formatAiTaKrajtaPrice(priceInCzechCrowns: number): string {
    return `${formatCzechNumber(priceInCzechCrowns)} Kč`;
}

/**
 * Picks an intentionally broad interval for a public reach estimate, where fake precision would be misleading.
 */
function getAiTaKrajtaEstimateRoundingIncrement(value: number): number {
    if (value < ONE_THOUSAND) {
        return SMALL_ESTIMATE_ROUNDING_INCREMENT;
    }

    return value < TEN_THOUSAND ? MEDIUM_ESTIMATE_ROUNDING_INCREMENT : LARGE_ESTIMATE_ROUNDING_INCREMENT;
}

/**
 * Writes an intentionally conservative public estimate, for example `4 500+` or `10 000+`.
 */
export function formatAiTaKrajtaEstimate(value: number): string {
    const roundingIncrement = getAiTaKrajtaEstimateRoundingIncrement(value);
    const roundedValue = Math.floor(value / roundingIncrement) * roundingIncrement;

    return `${formatCzechNumber(roundedValue)}+`;
}
