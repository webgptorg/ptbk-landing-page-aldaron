import {
    selectWorkshopSpecialMaterialsByPlacement,
    type WorkshopSpecialMaterial,
} from '@/lib/workshops/workshopSpecialMaterials';
import { describe, expect, it } from 'vitest';

const PRESENTATION_MATERIAL: WorkshopSpecialMaterial = { id: 'presentation', content: 'Prezentace' };
const REPOSITORY_MATERIAL: WorkshopSpecialMaterial = { id: 'repository', content: 'Projekt workshopu' };
const COMMUNITY_INVITATION: WorkshopSpecialMaterial = {
    id: 'community',
    content: 'Pokračujte s námi v komunitě',
    placement: 'before-materials-until-paid',
};

const SPECIAL_MATERIALS = [PRESENTATION_MATERIAL, REPOSITORY_MATERIAL, COMMUNITY_INVITATION];

function getSpecialMaterialIds(specialMaterials: readonly WorkshopSpecialMaterial[]): readonly string[] {
    return specialMaterials.map((specialMaterial) => specialMaterial.id);
}

describe('placement of the special materials of a room', () => {
    it('opens the material list of a member who does not pay with the invitation into the community', () => {
        const { specialMaterialsBeforeContentBlocks, specialMaterialsAfterContentBlocks } =
            selectWorkshopSpecialMaterialsByPlacement(SPECIAL_MATERIALS, { isPaidMember: false });

        expect(getSpecialMaterialIds(specialMaterialsBeforeContentBlocks)).toEqual(['community']);
        expect(getSpecialMaterialIds(specialMaterialsAfterContentBlocks)).toEqual(['presentation', 'repository']);
    });

    it('closes the material list of a paying member with that very same invitation', () => {
        const { specialMaterialsBeforeContentBlocks, specialMaterialsAfterContentBlocks } =
            selectWorkshopSpecialMaterialsByPlacement(SPECIAL_MATERIALS, { isPaidMember: true });

        expect(specialMaterialsBeforeContentBlocks).toEqual([]);
        expect(getSpecialMaterialIds(specialMaterialsAfterContentBlocks)).toEqual([
            'presentation',
            'repository',
            'community',
        ]);
    });

    it('leaves a card which says nothing about its placement after the ordinary materials of either member', () => {
        const unplacedSpecialMaterials = [PRESENTATION_MATERIAL, REPOSITORY_MATERIAL];

        for (const isPaidMember of [false, true]) {
            const { specialMaterialsBeforeContentBlocks, specialMaterialsAfterContentBlocks } =
                selectWorkshopSpecialMaterialsByPlacement(unplacedSpecialMaterials, { isPaidMember });

            expect(specialMaterialsBeforeContentBlocks).toEqual([]);
            expect(getSpecialMaterialIds(specialMaterialsAfterContentBlocks)).toEqual(['presentation', 'repository']);
        }
    });

    it('keeps the order each group was supplied in', () => {
        const secondInvitation: WorkshopSpecialMaterial = { ...COMMUNITY_INVITATION, id: 'second-invitation' };
        const { specialMaterialsBeforeContentBlocks } = selectWorkshopSpecialMaterialsByPlacement(
            [COMMUNITY_INVITATION, PRESENTATION_MATERIAL, secondInvitation],
            { isPaidMember: false },
        );

        expect(getSpecialMaterialIds(specialMaterialsBeforeContentBlocks)).toEqual(['community', 'second-invitation']);
    });
});
