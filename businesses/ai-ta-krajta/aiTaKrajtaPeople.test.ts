import {
    AI_TA_KRAJTA_PEOPLE,
    getAiTaKrajtaPersonPhotoPath,
    type AiTaKrajtaPerson,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

const PUBLIC_DIRECTORY = path.resolve(__dirname, '../../public');

function createPerson(photoFileName: string | null): AiTaKrajtaPerson {
    return {
        id: 'someone',
        name: 'Někdo Nový',
        headline: 'Přišel na jeden díl.',
        url: null,
        photoFileName,
        mentionPatterns: [],
        episodeNumbers: [],
    };
}

describe('getAiTaKrajtaPersonPhotoPath', () => {
    it('addresses a portrait inside the normalized podcast portrait folder', () => {
        expect(getAiTaKrajtaPersonPhotoPath(createPerson('someone.png'))).toBe('/people/ai-ta-krajta/someone.png');
    });

    it('has no address for a person the show has no picture of', () => {
        expect(getAiTaKrajtaPersonPhotoPath(createPerson(null))).toBeNull();
    });
});

describe('AI_TA_KRAJTA_PEOPLE', () => {
    it('sets the requested episode-appearance factors', () => {
        const factoredPeople = AI_TA_KRAJTA_PEOPLE.filter((person) => person.factor !== undefined).map(
            ({ id, factor }) => ({ id, factor }),
        );

        expect(factoredPeople).toEqual([
            { id: 'pavol-hejny', factor: 0.8 },
            { id: 'katka-fajmanova', factor: 1.7 },
            { id: 'tomas-mikolov', factor: 5 },
        ]);
    });

    // Note: A portrait which is only named and never cut breaks in the browser and nowhere else, which is why the
    //       roster is read against `public` here rather than trusted.
    it.each(AI_TA_KRAJTA_PEOPLE)(
        'has a normalized transparent PNG portrait for $name',
        async (person) => {
            const photoPath = getAiTaKrajtaPersonPhotoPath(person);
            expect(photoPath).not.toBeNull();
            const filePath = path.join(PUBLIC_DIRECTORY, photoPath!);
            expect(existsSync(filePath)).toBe(true);

            const portrait = sharp(filePath);
            const metadata = await portrait.metadata();
            expect(metadata).toMatchObject({ format: 'png', width: 320, height: 320, hasAlpha: true });

            // An alpha channel filled with opaque pixels is still a background, not a cutout.
            const { channels } = await portrait.stats();
            const alpha = channels[3];
            expect(alpha.min).toBe(0);
            // Palette compression may round fully opaque alpha down by a couple of levels.
            expect(alpha.max).toBeGreaterThanOrEqual(250);
            expect(alpha.mean).toBeGreaterThan(50);
            expect(alpha.mean).toBeLessThan(230);
        },
    );

    it('draws no two people from the same portrait', () => {
        const photoFileNames = AI_TA_KRAJTA_PEOPLE.map((person) => person.photoFileName);

        expect(new Set(photoFileNames).size).toBe(photoFileNames.length);
    });
});
