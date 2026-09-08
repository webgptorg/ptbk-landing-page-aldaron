import {
    AI_TA_KRAJTA_PEOPLE,
    getAiTaKrajtaPersonPortraitPath,
    type AiTaKrajtaPerson,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

const PUBLIC_DIRECTORY = path.resolve(__dirname, '../../public');

function createPerson(portraitFileName: AiTaKrajtaPerson['portraitFileName']): AiTaKrajtaPerson {
    return {
        id: 'someone',
        name: 'Někdo Nový',
        headline: 'Přišel na jeden díl.',
        url: null,
        portraitFileName,
        mentionPatterns: [],
        episodeNumbers: [],
    };
}

describe('getAiTaKrajtaPersonPortraitPath', () => {
    it('addresses a portrait inside the shared folder of people', () => {
        expect(getAiTaKrajtaPersonPortraitPath(createPerson('someone-portrait.png'))).toBe(
            '/people/someone-portrait.png',
        );
    });
});

describe('AI_TA_KRAJTA_PEOPLE', () => {
    // Note: A portrait which is only named and never written breaks in the browser and nowhere else, which is why the
    //       roster is read against `public` here rather than trusted.
    it.each(AI_TA_KRAJTA_PEOPLE)(
        'has the portrait of $name lying where it says it does',
        (person) => {
            expect(existsSync(path.join(PUBLIC_DIRECTORY, getAiTaKrajtaPersonPortraitPath(person)))).toBe(true);
        },
    );

    it.each(AI_TA_KRAJTA_PEOPLE)('uses a truly transparent PNG for $name', async (person) => {
        const portraitPath = path.join(PUBLIC_DIRECTORY, getAiTaKrajtaPersonPortraitPath(person));
        const portrait = sharp(portraitPath);
        const [metadata, statistics] = await Promise.all([portrait.metadata(), portrait.stats()]);
        const alphaChannel = statistics.channels[3];

        expect(metadata.format).toBe('png');
        expect(metadata.hasAlpha).toBe(true);
        expect(alphaChannel).toBeDefined();
        expect(alphaChannel.min).toBeLessThan(255);
    });

    it('draws no two people from the same portrait', () => {
        const portraitFileNames = AI_TA_KRAJTA_PEOPLE.map((person) => person.portraitFileName);

        expect(new Set(portraitFileNames).size).toBe(portraitFileNames.length);
    });
});
