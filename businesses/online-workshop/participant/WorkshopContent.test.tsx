/**
 * @vitest-environment jsdom
 */

import { WorkshopContent } from '@/businesses/online-workshop/participant/WorkshopContent';
import { WorkshopPresentationMaterial } from '@/businesses/online-workshop/participant/WorkshopPresentationMaterial';
import type { CommunityMembershipRoomState } from '@/lib/community-membership/communityMembershipTypes';
import type { WorkshopSpecialMaterial } from '@/lib/workshops/workshopSpecialMaterials';
import type { WorkshopContentBlock, WorkshopContentPreview } from '@/lib/workshops/workshopTypes';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * The room as far as the material list is concerned: the membership it already loaded and the modal it can open
 */
const membershipRoomMock = vi.hoisted(() => ({
    membershipRoom: null as null | {
        membership: CommunityMembershipRoomState | null;
        openMembershipModal: () => void;
    },
}));

vi.mock('@/businesses/community/membership/CommunityMembershipRoomProvider', () => ({
    useCommunityMembershipRoom: () => membershipRoomMock.membershipRoom,
}));

vi.mock('@/components/markdown-content', () => ({
    MarkdownContent: ({ content, className }: { readonly content: string; readonly className?: string }) => {
        const markdownLinks = Array.from(content.matchAll(/\[([^\]]+)\]\((?:<([^>]+)>|([^)]+))\)/g));

        return (
            <div data-testid="markdown-content" className={className}>
                {markdownLinks.map((markdownLink) => {
                    const href = markdownLink[2] ?? markdownLink[3];
                    return (
                        <a key={href} href={href}>
                        {markdownLink[1]}
                    </a>
                    );
                })}
            </div>
        );
    },
}));

vi.mock('@/components/promptbook-qr-code', () => ({
    PromptbookQrCode: ({
        value,
        size,
        className,
    }: {
        readonly value: string;
        readonly size?: number;
        readonly className?: string;
    }) => <span data-testid="workshop-material-qr-code" data-value={value} data-size={size} className={className} />,
}));

const CONTENT_BLOCK: WorkshopContentBlock = {
    id: 'material-1',
    title: '',
    bodyMarkdown: '[Zjistit více](https://ptbk.io/material-abc123)',
    unlockAt: '2026-08-20T19:00:00.000Z',
    sortOrder: 0,
    isPublished: true,
    isFollowUp: false,
    isPaidMembersOnly: false,
    createdAt: '2026-08-20T18:00:00.000Z',
    updatedAt: '2026-08-20T18:00:00.000Z',
    linkClickCount: 0,
};

const FREE_PURCHASABLE_MEMBERSHIP: CommunityMembershipRoomState = {
    status: 'none',
    monthlyPriceCzk: null,
    currentPeriodEndsAt: null,
    isCancellationScheduled: false,
    isPurchaseOffered: true,
    isSubscriptionManagementOffered: false,
    isCoveredByDiscountCode: false,
    isPaymentInTestMode: false,
};

const PAID_MEMBERSHIP: CommunityMembershipRoomState = {
    ...FREE_PURCHASABLE_MEMBERSHIP,
    status: 'active',
    monthlyPriceCzk: 199,
    currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
    isPurchaseOffered: false,
    isSubscriptionManagementOffered: true,
};

const PAID_MEMBERS_ONLY_CONTENT_PREVIEWS: readonly WorkshopContentPreview[] = [
    { id: 'paid-material-1', title: 'Bonusové podklady' },
];

/**
 * The material list of a room which has an ordinary material, a card placed by the membership, and one placed after it
 */
const TITLED_CONTENT_BLOCK: WorkshopContentBlock = { ...CONTENT_BLOCK, title: 'Podklady z workshopu' };

const COMMUNITY_INVITATION: WorkshopSpecialMaterial = {
    id: 'community',
    content: <article aria-label="Komunita Promptbooku">Komunita Promptbooku</article>,
    placement: 'before-materials-until-paid',
};

const PRESENTATION_SPECIAL_MATERIAL: WorkshopSpecialMaterial = {
    id: 'presentation',
    content: <WorkshopPresentationMaterial presentationUrl="https://files.example.com/prezentace.pdf" />,
};

/**
 * Every card of the material list, in the order it is read in, named the way the member reading it is told
 */
function getMaterialOrder(container: HTMLElement): readonly string[] {
    return Array.from(container.querySelectorAll('article')).map(
        (materialCard) => materialCard.getAttribute('aria-label') ?? materialCard.querySelector('h3')?.textContent ?? '',
    );
}

function renderWorkshopContent(
    contentBlocks: readonly WorkshopContentBlock[],
    paidMembersOnlyContentPreviews: readonly WorkshopContentPreview[] = [],
    specialMaterials: readonly WorkshopSpecialMaterial[] = [],
) {
    return render(
        <WorkshopContent
            contentBlocks={contentBlocks}
            nextContentUnlockAt={null}
            newlyUnlockedContentBlockIds={new Set()}
            paidMembersOnlyContentPreviews={paidMembersOnlyContentPreviews}
            specialMaterials={specialMaterials}
        />,
    );
}

afterEach(() => {
    cleanup();
    membershipRoomMock.membershipRoom = null;
});

describe('workshop materials', () => {
    it('keeps a special material in the material list even when no ordinary material is unlocked', () => {
        renderWorkshopContent(
            [],
            [],
            [
            {
                id: 'community',
                content: <article aria-label="Komunita Promptbooku">Komunita Promptbooku</article>,
            },
            ],
        );

        expect(screen.getByRole('heading', { name: 'Materiály z workshopu' })).not.toBeNull();
        expect(screen.getByRole('article', { name: 'Komunita Promptbooku' })).not.toBeNull();
    });

    it('opens the material list of a member who does not pay with the invitation into the community', () => {
        membershipRoomMock.membershipRoom = { membership: FREE_PURCHASABLE_MEMBERSHIP, openMembershipModal: vi.fn() };
        const { container } = renderWorkshopContent(
            [TITLED_CONTENT_BLOCK],
            [],
            [PRESENTATION_SPECIAL_MATERIAL, COMMUNITY_INVITATION],
        );

        expect(getMaterialOrder(container)).toEqual([
            'Komunita Promptbooku',
            'Podklady z workshopu',
            'Prezentace workshopu',
        ]);
    });

    it('closes the material list of a paying member with that very same invitation', () => {
        membershipRoomMock.membershipRoom = { membership: PAID_MEMBERSHIP, openMembershipModal: vi.fn() };
        const { container } = renderWorkshopContent(
            [TITLED_CONTENT_BLOCK],
            [],
            [PRESENTATION_SPECIAL_MATERIAL, COMMUNITY_INVITATION],
        );

        expect(getMaterialOrder(container)).toEqual([
            'Podklady z workshopu',
            'Prezentace workshopu',
            'Komunita Promptbooku',
        ]);
    });

    it('invites into the community first while the membership of the member is still unknown', () => {
        const { container } = renderWorkshopContent([TITLED_CONTENT_BLOCK], [], [COMMUNITY_INVITATION]);

        expect(getMaterialOrder(container)).toEqual(['Komunita Promptbooku', 'Podklady z workshopu']);
    });

    it('uses the ordinary material card, primary action, and QR code for a workshop presentation', async () => {
        const presentationUrl = 'https://files.example.com/(ai-agents).pptx';
        renderWorkshopContent(
            [],
            [],
            [
                {
                    id: 'presentation',
                    content: <WorkshopPresentationMaterial presentationUrl={presentationUrl} />,
                },
            ],
        );

        expect(screen.getByLabelText('Prezentace workshopu')).not.toBeNull();
        expect(screen.getByRole('heading', { name: 'Prezentace' })).not.toBeNull();
        expect(screen.getByRole('link', { name: 'Otevřít prezentaci: Prezentace' }).getAttribute('href')).toBe(
            presentationUrl,
        );
        expect((await screen.findByTestId('workshop-material-qr-code')).getAttribute('data-value')).toBe(
            presentationUrl,
        );
    });

    it('offers a prominent short-link call to action when a material has one link', async () => {
        renderWorkshopContent([CONTENT_BLOCK]);

        const callToAction = await screen.findByRole('link', { name: /Otevřít materiál: Zjistit více/ });

        expect(callToAction.getAttribute('href')).toBe('https://ptbk.io/material-abc123');
        expect(callToAction.getAttribute('target')).toBe('_blank');
        expect(callToAction.getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('shows each material short link as a desktop-only QR code for opening on a phone', async () => {
        const secondContentBlock: WorkshopContentBlock = {
            ...CONTENT_BLOCK,
            id: 'material-2',
            bodyMarkdown: '[Stáhnout podklady](https://ptbk.io/material-def456)',
        };
        renderWorkshopContent([CONTENT_BLOCK, secondContentBlock]);

        const qrCodes = await screen.findAllByTestId('workshop-material-qr-code');

        expect(qrCodes.map((qrCode) => qrCode.getAttribute('data-value'))).toEqual([
            'https://ptbk.io/material-abc123',
            'https://ptbk.io/material-def456',
        ]);
        expect(qrCodes.every((qrCode) => qrCode.getAttribute('data-size') === '144')).toBe(true);
        expect(screen.getAllByLabelText('QR kódy materiálů')).toHaveLength(2);
        expect(
            screen.getAllByLabelText('QR kódy materiálů').every((qrCodes) => qrCodes.className.includes('hidden')),
        ).toBe(true);
        expect(
            screen.getAllByLabelText('QR kódy materiálů').every((qrCodes) => qrCodes.className.includes('lg:flex')),
        ).toBe(true);
    });

    it('uses the QR renderer quiet zone without an extra frame or redundant phone prompt', async () => {
        renderWorkshopContent([CONTENT_BLOCK]);

        const qrCode = await screen.findByTestId('workshop-material-qr-code');
        const qrCodeFigure = screen.getByLabelText('QR kód materiálu: Zjistit více');

        expect(qrCode.parentElement).toBe(qrCodeFigure);
        expect(qrCode.className).toContain('mx-auto');
        expect(qrCode.className).not.toMatch(/(?:^|\s)p-\S+/);
        expect(screen.queryByText('Otevřít v telefonu')).toBeNull();
    });

    it('keeps multiple material links underlined in the room palette without a call to action', async () => {
        const contentBlockWithMultipleLinks: WorkshopContentBlock = {
            ...CONTENT_BLOCK,
            bodyMarkdown: '[První materiál](https://example.com/one) a [druhý materiál](https://example.com/two)',
        };
        const { container } = renderWorkshopContent([contentBlockWithMultipleLinks]);

        await waitFor(() => expect(container.querySelectorAll('a')).toHaveLength(2));

        expect(screen.queryByRole('link', { name: /Otevřít materiál/ })).toBeNull();
        expect(screen.getByTestId('markdown-content').className).toContain('[--chat-md-link-color:rgb(var(--room-accent))]');
    });

    it('keeps every link of a multi-link material available through its own QR code', async () => {
        const contentBlockWithMultipleLinks: WorkshopContentBlock = {
            ...CONTENT_BLOCK,
            bodyMarkdown:
                '[První materiál](https://ptbk.io/material-one) a [druhý materiál](https://ptbk.io/material-two)',
        };
        renderWorkshopContent([contentBlockWithMultipleLinks]);

        const qrCodes = await screen.findAllByTestId('workshop-material-qr-code');

        expect(qrCodes.map((qrCode) => qrCode.getAttribute('data-value'))).toEqual([
            'https://ptbk.io/material-one',
            'https://ptbk.io/material-two',
        ]);
        expect(screen.getByLabelText('QR kód materiálu: První materiál')).not.toBeNull();
        expect(screen.getByLabelText('QR kód materiálu: druhý materiál')).not.toBeNull();
    });

    it('marks the selected follow-up material while it stays in the ordinary material list', () => {
        renderWorkshopContent([{ ...CONTENT_BLOCK, isFollowUp: true, title: 'Další krok' }]);

        expect(screen.getByText('Navazující materiál')).not.toBeNull();
        expect(screen.getByRole('heading', { name: 'Další krok' })).not.toBeNull();
    });

    it('marks a material which only paid members may see while it stays in the list of a member who paid', () => {
        renderWorkshopContent([{ ...CONTENT_BLOCK, isPaidMembersOnly: true, title: 'Bonusové podklady' }]);

        expect(screen.getByText('Pro placené členy')).not.toBeNull();
        expect(screen.getByRole('heading', { name: 'Bonusové podklady' })).not.toBeNull();
    });

    it('says where the paid materials are and offers the membership which unlocks them to a member who has not paid', () => {
        const openMembershipModal = vi.fn();
        membershipRoomMock.membershipRoom = { membership: FREE_PURCHASABLE_MEMBERSHIP, openMembershipModal };
        renderWorkshopContent([CONTENT_BLOCK], PAID_MEMBERS_ONLY_CONTENT_PREVIEWS);

        expect(screen.getByText('Materiály pro placené členy')).not.toBeNull();
        fireEvent.click(screen.getByRole('button', { name: /Koupit placené členství/ }));

        expect(openMembershipModal).toHaveBeenCalledOnce();
    });

    it('names every hidden paid material as a teaser of what the membership unlocks', () => {
        membershipRoomMock.membershipRoom = { membership: FREE_PURCHASABLE_MEMBERSHIP, openMembershipModal: vi.fn() };
        renderWorkshopContent(
            [CONTENT_BLOCK],
            [...PAID_MEMBERS_ONLY_CONTENT_PREVIEWS, { id: 'paid-material-2', title: 'Nahrávka workshopu' }],
        );

        const contentPreviewTitles = Array.from(
            screen.getByLabelText('Náhled materiálů pro placené členy').querySelectorAll('li'),
        ).map((listItem) => listItem.textContent);

        expect(contentPreviewTitles).toEqual(['Bonusové podklady', 'Nahrávka workshopu']);
        expect(screen.getByText('Co odemknete')).not.toBeNull();
    });

    it('keeps saying where the paid materials are when none of them has a title to tease with', () => {
        membershipRoomMock.membershipRoom = { membership: FREE_PURCHASABLE_MEMBERSHIP, openMembershipModal: vi.fn() };
        renderWorkshopContent([], [{ id: 'paid-material-1', title: '' }]);

        expect(screen.getByText('Materiály pro placené členy')).not.toBeNull();
        expect(screen.queryByLabelText('Náhled materiálů pro placené členy')).toBeNull();
    });

    it('keeps saying where the paid materials are even when nothing else is unlocked yet', () => {
        membershipRoomMock.membershipRoom = { membership: FREE_PURCHASABLE_MEMBERSHIP, openMembershipModal: vi.fn() };
        renderWorkshopContent([], PAID_MEMBERS_ONLY_CONTENT_PREVIEWS);

        expect(screen.getByText('Materiály pro placené členy')).not.toBeNull();
    });

    it('shows no paid-materials notice while the membership is still unknown or cannot be bought', () => {
        renderWorkshopContent([CONTENT_BLOCK], PAID_MEMBERS_ONLY_CONTENT_PREVIEWS);
        expect(screen.queryByText('Materiály pro placené členy')).toBeNull();
        expect(screen.queryByText('Bonusové podklady')).toBeNull();

        membershipRoomMock.membershipRoom = {
            membership: { ...FREE_PURCHASABLE_MEMBERSHIP, isPurchaseOffered: false },
            openMembershipModal: vi.fn(),
        };
        renderWorkshopContent([CONTENT_BLOCK], PAID_MEMBERS_ONLY_CONTENT_PREVIEWS);
        expect(screen.queryByText('Materiály pro placené členy')).toBeNull();
        expect(screen.queryByText('Bonusové podklady')).toBeNull();
    });
});
