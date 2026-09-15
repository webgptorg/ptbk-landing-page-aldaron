import type { ReactNode } from 'react';

/**
 * Where a card which shares the material list belongs among the ordinary materials
 *
 * Note: A card is placed by what it is rather than by a number written next to it, so the room which supplies one says
 *       what it means and this one rule decides where every member reading it sees it.
 */
export type WorkshopSpecialMaterialPlacement =
    /**
     * After the ordinary materials, which is where a card belongs that adds to what the room already handed over
     */
    | 'after-materials'

    /**
     * Before the ordinary materials while the member reading them does not pay for the community membership, and after
     * them once they do
     */
    | 'before-materials-until-paid';

/**
 * A participant-facing card which belongs in the material list without being an administrator-managed material.
 *
 * Note: A room can lead someone to a durable place such as the community without turning that link into content that
 *       is stored, timed, paid-only, or measured as an ordinary workshop material. Keeping these cards in the one
 *       material list still gives every participant the same predictable place to find them.
 */
export type WorkshopSpecialMaterial = {
    readonly id: string;
    readonly content: ReactNode;

    /**
     * Where this card belongs in the material list, which is after the ordinary materials unless it says otherwise
     */
    readonly placement?: WorkshopSpecialMaterialPlacement;
};

/**
 * What decides where a card belongs whose placement depends on the member reading it
 */
export type WorkshopSpecialMaterialMembership = {
    /**
     * Whether the room knows that the member reading it pays for the community membership
     */
    readonly isPaidMember: boolean;
};

/**
 * The special materials of a room divided around its ordinary materials, each group in the order it was supplied in
 */
export type WorkshopSpecialMaterialPlacementSelection = {
    readonly specialMaterialsBeforeContentBlocks: readonly WorkshopSpecialMaterial[];
    readonly specialMaterialsAfterContentBlocks: readonly WorkshopSpecialMaterial[];
};

/**
 * Divides the special materials of a room into the ones which open its material list and the ones which close it.
 *
 * Note: An invitation is the first thing a member who has not accepted it yet reads and one more way on for a member
 *       who is already inside, so one card is placed by what the member reading it has instead of two cards being
 *       written for the two of them.
 * Note: A member is only ever moved past an invitation once the room knows that they pay for the membership, so a
 *       membership which is still being loaded leaves the invitation where a member who does not pay reads it.
 */
export function selectWorkshopSpecialMaterialsByPlacement(
    specialMaterials: readonly WorkshopSpecialMaterial[],
    { isPaidMember }: WorkshopSpecialMaterialMembership,
): WorkshopSpecialMaterialPlacementSelection {
    const isPlacedBeforeContentBlocks = (specialMaterial: WorkshopSpecialMaterial): boolean =>
        specialMaterial.placement === 'before-materials-until-paid' && !isPaidMember;

    return {
        specialMaterialsBeforeContentBlocks: specialMaterials.filter(isPlacedBeforeContentBlocks),
        specialMaterialsAfterContentBlocks: specialMaterials.filter(
            (specialMaterial) => !isPlacedBeforeContentBlocks(specialMaterial),
        ),
    };
}
