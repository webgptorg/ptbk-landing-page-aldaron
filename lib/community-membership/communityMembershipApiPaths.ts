/**
 * Every address the membership of a connected member is read and changed at, inside one room.
 */
export type CommunityMembershipApiPaths = {
    readonly membership: string;
    readonly checkout: string;
    readonly checkoutConfirmation: string;
    readonly cancellation: string;
    readonly portal: string;
    readonly verification: string;
};

/**
 * The membership endpoints of one room, which sit below the API path of that very room.
 *
 * Note: A room session is a cookie scoped to the addresses of its own room, so the membership is asked about under the
 *       session which already proves who is asking. The membership itself belongs to the address of the member rather
 *       than to the room, so the community and a workshop occurrence reach one and the same membership this way.
 */
export function createCommunityMembershipApiPaths(workshopSlug: string): CommunityMembershipApiPaths {
    const membershipPath = `/api/workshops/${encodeURIComponent(workshopSlug)}/membership`;

    return {
        membership: membershipPath,
        checkout: `${membershipPath}/checkout`,
        checkoutConfirmation: `${membershipPath}/checkout/confirmation`,
        cancellation: `${membershipPath}/cancellation`,
        portal: `${membershipPath}/portal`,
        verification: `${membershipPath}/verification`,
    };
}
