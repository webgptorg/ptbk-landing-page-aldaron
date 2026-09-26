import {
    DEFAULT_WORKSHOP_PRIMARY_STAGE_CONTENT,
    normalizeWorkshopPrimaryStageContent,
} from '@/lib/workshops/workshopPrimaryStageContent';
import { selectWorkshopSupplementarySources } from '@/lib/workshops/workshopSpecialMaterials';
import { describe, expect, it } from 'vitest';

const SOURCE_MATERIALS = [
    { id: 'video', content: null, sourceType: 'video' as const },
    { id: 'presentation', content: null, sourceType: 'presentation' as const },
    { id: 'repository', content: null, sourceType: 'repository' as const },
    { id: 'community', content: null },
];

describe('workshop primary stage content', () => {
    it('defaults missing and invalid values to video', () => {
        expect(normalizeWorkshopPrimaryStageContent(undefined)).toBe(DEFAULT_WORKSHOP_PRIMARY_STAGE_CONTENT);
        expect(normalizeWorkshopPrimaryStageContent('materials')).toBe('video');
    });

    it.each([
        ['video', ['presentation', 'repository', 'community']],
        ['presentation', ['video', 'repository', 'community']],
        ['repository', ['video', 'presentation', 'community']],
    ] as const)('keeps %s primary and offers every other source once as supplementary', (primary, expectedIds) => {
        expect(selectWorkshopSupplementarySources(SOURCE_MATERIALS, primary).map(({ id }) => id)).toEqual(expectedIds);
    });
});
