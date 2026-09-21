import {
    AI_TA_KRAJTA_PEOPLE,
    getAiTaKrajtaPersonPhotoPath,
    type AiTaKrajtaPerson,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
import { existsSync } from 'node:fs';
import path from 'node:path';
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
    it('addresses a portrait inside the shared folder of people', () => {
        expect(getAiTaKrajtaPersonPhotoPath(createPerson('someone.jpg'))).toBe('/people/someone.jpg');
    });

    it('has no address for a person the show has no picture of', () => {
        expect(getAiTaKrajtaPersonPhotoPath(createPerson(null))).toBeNull();
    });
});

describe('AI_TA_KRAJTA_PEOPLE', () => {
    // Note: A portrait which is only named and never cut breaks in the browser and nowhere else, which is why the
    //       roster is read against `public` here rather than trusted.
    it.each(AI_TA_KRAJTA_PEOPLE.filter((person) => person.photoFileName !== null))(
        'has the portrait of $name lying where it says it does',
        (person) => {
            expect(existsSync(path.join(PUBLIC_DIRECTORY, getAiTaKrajtaPersonPhotoPath(person)!))).toBe(true);
        },
    );

    it('draws no two people from the same portrait', () => {
        const photoFileNames = AI_TA_KRAJTA_PEOPLE.map((person) => person.photoFileName);

        expect(new Set(photoFileNames).size).toBe(photoFileNames.length);
    });
});
