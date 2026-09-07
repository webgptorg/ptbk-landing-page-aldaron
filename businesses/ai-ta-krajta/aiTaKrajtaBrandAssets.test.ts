import {
    AI_TA_KRAJTA_BRAND_COLORS,
    AI_TA_KRAJTA_BRAND_FILES,
    AI_TA_KRAJTA_BRAND_NAME_EXAMPLES,
    AI_TA_KRAJTA_BRAND_TYPEFACES,
    AI_TA_KRAJTA_LOGO_BACKGROUND_COLORS,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaBrandAssets';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
    AI_TA_KRAJTA_APP_ICONS,
    AI_TA_KRAJTA_BRAND_NAME,
    AI_TA_KRAJTA_BRANDING_PATH,
    AI_TA_KRAJTA_COLORS,
    AI_TA_KRAJTA_COVER_IMAGE_PATH,
    AI_TA_KRAJTA_NAME,
    AI_TA_KRAJTA_PATH,
    AI_TA_KRAJTA_SUBPAGES,
} from '@/businesses/ai-ta-krajta/config';
import { describe, expect, it } from 'vitest';

/**
 * Every address this site really serves one of the brand files at
 */
const SERVED_BRAND_FILE_PATHS: readonly string[] = [
    AI_TA_KRAJTA_APP_ICONS.SCALABLE.path,
    AI_TA_KRAJTA_APP_ICONS.RASTER.path,
    AI_TA_KRAJTA_COVER_IMAGE_PATH,
];

describe('AI ta Krajta brand assets', () => {
    it('publishes no colour the show does not already wear', () => {
        const wornColors = Object.values(AI_TA_KRAJTA_COLORS);

        expect(AI_TA_KRAJTA_BRAND_COLORS.map((brandColor) => brandColor.hex).sort()).toEqual([...wornColors].sort());
    });

    it('offers the logo only on the plain surfaces it stays readable on', () => {
        expect(AI_TA_KRAJTA_LOGO_BACKGROUND_COLORS.map((brandColor) => brandColor.hex)).toEqual([
            AI_TA_KRAJTA_COLORS.MOSS,
            AI_TA_KRAJTA_COLORS.MOSS_DEEP,
            AI_TA_KRAJTA_COLORS.PAPER,
        ]);
    });

    it('hands out only files which the site itself serves', () => {
        expect(AI_TA_KRAJTA_BRAND_FILES.map((brandFile) => brandFile.path)).toEqual(SERVED_BRAND_FILE_PATHS);
    });

    it('writes the name of the show the way the show writes it itself', () => {
        const correctSpellings = AI_TA_KRAJTA_BRAND_NAME_EXAMPLES.map((nameExample) => nameExample.correct);

        expect(correctSpellings.every((spelling) => [AI_TA_KRAJTA_NAME, AI_TA_KRAJTA_BRAND_NAME].includes(spelling))).toBe(
            true,
        );
        expect(
            AI_TA_KRAJTA_BRAND_NAME_EXAMPLES.every((nameExample) => nameExample.incorrect !== nameExample.correct),
        ).toBe(true);
    });

    it('names only the typefaces the site really loads and sets its headings in', () => {
        const globalStylesheet = readFileSync(path.resolve(__dirname, '../../app/globals.css'), 'utf8');
        const [headingTypeface] = AI_TA_KRAJTA_BRAND_TYPEFACES;

        for (const typeface of AI_TA_KRAJTA_BRAND_TYPEFACES) {
            expect(globalStylesheet, `Expected ${typeface.name} to be loaded by the site`).toContain(
                `family=${typeface.name}:`,
            );
        }

        // Note: The stylesheet hands every heading to one typeface, and the brand kit offers that one first.
        expect(globalStylesheet).toContain(`var(--font-${headingTypeface.id}), '${headingTypeface.name}'`);
    });

    it('keeps every page beside the podcast underneath it and at its own address', () => {
        const subpagePaths = AI_TA_KRAJTA_SUBPAGES.map((subpage) => subpage.path);

        expect(subpagePaths).toContain(AI_TA_KRAJTA_BRANDING_PATH);
        expect(subpagePaths.every((path) => path.startsWith(AI_TA_KRAJTA_PATH + '/'))).toBe(true);
        expect(new Set(subpagePaths).size).toBe(subpagePaths.length);
    });
});
