import { isAbsoluteUrl } from '@/lib/shortener/isAbsoluteUrl';
import type { ShortcodeLinkValues } from '@/lib/shortener/shortcodeLink';
import { z } from 'zod';
import { SHORTCODE_LINK_DOMAINS } from './shortcodeLinkDomains';

const SHORTCODE_PATTERN = /^[A-Za-z0-9-]+$/;

/**
 * A text which the administration may leave out altogether, so that an empty field and a missing field both mean that
 * the column holds nothing.
 */
const OPTIONAL_SHORTCODE_LINK_TEXT_SCHEMA = z
    .string()
    .nullish()
    .transform((value) => {
        const trimmedValue = (value ?? '').trim();

        return trimmedValue === '' ? null : trimmedValue;
    });

/**
 * The only values an administrator may persist for a public short link, whether they are creating or editing it.
 */
export const SHORTCODE_LINK_VALUES_SCHEMA: z.ZodType<ShortcodeLinkValues, z.ZodTypeDef, unknown> = z.object({
    domains: z.array(z.string().refine((domain) => SHORTCODE_LINK_DOMAINS.includes(domain), 'Choose a supported domain'))
        .min(1, 'Select at least one domain or use all domains').max(SHORTCODE_LINK_DOMAINS.length)
        .refine((domains) => new Set(domains).size === domains.length, 'Domains must not repeat').nullish(),
    shortcode: z
        .string()
        .trim()
        .min(1)
        .regex(SHORTCODE_PATTERN, 'Shortcode can contain only letters, numbers, and hyphens'),
    urls: z
        .array(z.string().trim().min(1).refine(isAbsoluteUrl, 'Every URL must be a valid absolute URL'))
        .min(1, 'At least one URL is required'),
    note: OPTIONAL_SHORTCODE_LINK_TEXT_SCHEMA,
    landingPage: OPTIONAL_SHORTCODE_LINK_TEXT_SCHEMA,
});
