/**
 * @vitest-environment jsdom
 */

import { WorkshopContent } from '@/businesses/online-workshop/participant/WorkshopContent';
import { WorkshopPresentationMaterial } from '@/businesses/online-workshop/participant/WorkshopPresentationMaterial';
import type { CommunityMembershipRoomState } from '@/lib/community-membership/communityMembershipTypes';
import type { WorkshopSpecialMaterial } from '@/lib/workshops/workshopSpecialMaterials';
import type { WorkshopContentBlock, WorkshopContentPreview } from '@/lib/workshops/workshopTypes';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The room as far as the material list is concerned: the membership it already loaded and the modal it can open
 */
const { membershipRoomMock, useReducedMotionMock } = vi.hoisted(() => ({
    membershipRoomMock: {
        membershipRoom: null as null | {
            membership: CommunityMembershipRoomState | null;
            openMembershipModal: () => void;
        },
    },
    useReducedMotionMock: vi.fn(() => false),
}));

vi.mock('@/businesses/community/membership/CommunityMembershipRoomProvider', () => ({
    useCommunityMembershipRoom: () => membershipRoomMock.membershipRoom,
}));

vi.mock('@/components/markdown-content', () => ({
    MarkdownContent: ({ content, className }: { readonly content: string; readonly className?: string }) => {
        const markdownLinks = Array.from(content.matchAll(/\[([^\]]+)\]\((?:<([^>]+)>|([^)]+))\)/g));
        const markdownWithoutLinks = content.replace(/\[([^\]]+)\]\((?:<([^>]+)>|([^)]+))\)/g, '$1');

        return (
            <div data-testid="markdown-content" className={className}>
                {markdownWithoutLinks}
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

vi.mock('framer-motion', async (importOriginal) => ({
    ...(await importOriginal<typeof import('framer-motion')>()),
    useReducedMotion: useReducedMotionMock,
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
let workshopRenderCount = 0;
let materialPreviewFetchMock: ReturnType<typeof vi.fn>;

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
    workshopSlug?: string,
) {
    const roomSlug = workshopSlug ?? `online-workshop-test-${++workshopRenderCount}`;
    return render(
        <WorkshopContent
            workshopSlug={roomSlug}
            contentBlocks={contentBlocks}
            nextContentUnlockAt={null}
            newlyUnlockedContentBlockIds={new Set()}
            paidMembersOnlyContentPreviews={paidMembersOnlyContentPreviews}
            specialMaterials={specialMaterials}
        />,
    );
}

function createWorkshopContentElement(
    workshopSlug: string,
    contentBlocks: readonly WorkshopContentBlock[],
    specialMaterials: readonly WorkshopSpecialMaterial[] = [],
) {
    return (
        <WorkshopContent
            workshopSlug={workshopSlug}
            contentBlocks={contentBlocks}
            nextContentUnlockAt={null}
            newlyUnlockedContentBlockIds={new Set()}
            paidMembersOnlyContentPreviews={[]}
            specialMaterials={specialMaterials}
        />
    );
}

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    membershipRoomMock.membershipRoom = null;
});

beforeEach(() => {
    useReducedMotionMock.mockReturnValue(false);
    materialPreviewFetchMock = vi.fn(async (requestUrl: string) => {
        const isMetadataFailureCase = requestUrl.includes('/metadata-failure/');
        return {
            ok: true,
            json: async () => isMetadataFailureCase
                ? {
                    title: 'example.com',
                    description: '',
                    domain: 'example.com',
                    imageUrl: '/api/workshops/metadata-failure/materials/material-1/preview?image=broken',
                    state: 'fallback',
                }
                : {
                    title: 'Průvodce k materiálu',
                    description: 'Krátký popis stránky.',
                    domain: 'example.com',
                    imageUrl: '/api/workshops/online-workshop/materials/material-1/preview?image=cover',
                    state: 'ready',
                },
        };
    });
    vi.stubGlobal('fetch', materialPreviewFetchMock);
    vi.stubGlobal(
        'IntersectionObserver',
        class {
            private readonly callback: (entries: readonly { readonly isIntersecting: boolean }[]) => void;

            public constructor(callback: (entries: readonly { readonly isIntersecting: boolean }[]) => void) {
                this.callback = callback;
            }

            public observe() {
                this.callback([{ isIntersecting: true }]);
            }

            public disconnect() {}
        },
    );
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

    it('uses the ordinary material card, primary action, and flip-to-QR preview for a workshop presentation', async () => {
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
        expect(screen.getByRole('heading', { name: 'Prezentace', level: 3 })).not.toBeNull();
        expect(screen.getByRole('link', { name: 'Otevřít prezentaci: Prezentace' }).getAttribute('href')).toBe(
            presentationUrl,
        );
        expect(screen.queryByTestId('workshop-material-qr-code')).toBeNull();
        await waitFor(() => expect(materialPreviewFetchMock).toHaveBeenCalled());
        await screen.findByText('Krátký popis stránky.');
        fireEvent.click(screen.getByRole('button', { name: /Zobrazit QR kód/ }));
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

    it('keeps a material with no links free of preview and QR controls', () => {
        renderWorkshopContent([{ ...CONTENT_BLOCK, bodyMarkdown: 'Only readable material text.' }]);

        expect(screen.getByTestId('markdown-content').textContent).toBe('Only readable material text.');
        expect(screen.queryByRole('button', { name: /Zobrazit QR kód/ })).toBeNull();
        expect(screen.queryByTestId('workshop-material-qr-code')).toBeNull();
    });

    it('starts each material link on its preview and reveals its existing short link QR when requested', async () => {
        const secondContentBlock: WorkshopContentBlock = {
            ...CONTENT_BLOCK,
            id: 'material-2',
            bodyMarkdown: '[Stáhnout podklady](https://ptbk.io/material-def456)',
        };
        renderWorkshopContent([CONTENT_BLOCK, secondContentBlock]);

        expect(screen.queryByTestId('workshop-material-qr-code')).toBeNull();
        expect(await screen.findAllByText('Krátký popis stránky.')).toHaveLength(2);
        expect(screen.getAllByText('Průvodce k materiálu').length).toBeGreaterThan(0);
        expect(screen.getAllByText('example.com').length).toBeGreaterThan(0);
        expect(screen.getAllByRole('button', { name: 'Zobrazit QR kód: Průvodce k materiálu' })).toHaveLength(2);

        fireEvent.click(screen.getAllByRole('button', { name: /Zobrazit QR kód/ })[0]!);
        const qrCode = await screen.findByTestId('workshop-material-qr-code');
        expect(qrCode.getAttribute('data-value')).toBe('https://ptbk.io/material-abc123');
        expect(qrCode.getAttribute('data-size')).toBe('156');
    });

    it('keeps preview and QR flips away from the tracked redirect and click-count path', async () => {
        renderWorkshopContent([CONTENT_BLOCK], [], [], 'preview-click-count');
        await screen.findByText('Krátký popis stránky.');

        const currentMaterialPreviewCalls = () => materialPreviewFetchMock.mock.calls.filter(([requestUrl]) =>
            String(requestUrl).includes('/preview-click-count/'),
        );
        const previewRequestCount = currentMaterialPreviewCalls().length;
        const previewRequestUrl = new URL(String(currentMaterialPreviewCalls()[0]?.[0]), 'https://room.test');
        expect(previewRequestUrl.pathname).toBe('/api/workshops/preview-click-count/materials/material-1/preview');
        expect(previewRequestUrl.searchParams.get('link')).toBe('https://ptbk.io/material-abc123');
        expect(currentMaterialPreviewCalls().every(([requestUrl]) => String(requestUrl).startsWith('/api/workshops/'))).toBe(true);

        fireEvent.click(screen.getByRole('button', { name: /Zobrazit QR kód/ }));
        fireEvent.click(screen.getByRole('button', { name: /Zobrazit náhled/ }));

        expect(currentMaterialPreviewCalls()).toHaveLength(previewRequestCount);
        expect(CONTENT_BLOCK.linkClickCount).toBe(0);
        expect(screen.getByRole('link', { name: 'Otevřít materiál: Zjistit více' }).getAttribute('href')).toBe(
            'https://ptbk.io/material-abc123',
        );
    });

    it('keeps a clean title and domain fallback when metadata is unavailable and an image fails', async () => {
        renderWorkshopContent([CONTENT_BLOCK], [], [], 'metadata-failure');
        await screen.findAllByText('example.com');

        const previewCard = screen.getByRole('group', { name: 'Náhled odkazu: Zjistit více' });
        const previewImage = previewCard.querySelector('img');
        expect(previewImage).not.toBeNull();
        fireEvent.error(previewImage!);

        await waitFor(() => expect(previewCard.querySelector('img')).toBeNull());
        expect(previewCard.textContent).not.toContain('nepodařilo');
        expect(previewCard.textContent).toContain('example.com');
        expect(screen.getByRole('button', { name: 'Zobrazit QR kód: example.com' })).not.toBeNull();
    });

    it('resets a stale QR when a live material link changes or the material disappears', async () => {
        const workshopSlug = 'live-material-preview';
        const initialContent = { ...CONTENT_BLOCK, bodyMarkdown: '[Otevřít](https://ptbk.io/material-before)' };
        const view = render(createWorkshopContentElement(workshopSlug, [initialContent]));
        fireEvent.click(await screen.findByRole('button', { name: /Zobrazit QR kód/ }));
        expect((await screen.findByTestId('workshop-material-qr-code')).getAttribute('data-value')).toBe(
            'https://ptbk.io/material-before',
        );

        const changedContent = { ...initialContent, bodyMarkdown: '[Otevřít](https://ptbk.io/material-after)' };
        view.rerender(createWorkshopContentElement(workshopSlug, [changedContent]));
        await waitFor(() => expect(screen.queryByTestId('workshop-material-qr-code')).toBeNull());
        fireEvent.click(await screen.findByRole('button', { name: /Zobrazit QR kód/ }));
        expect((await screen.findByTestId('workshop-material-qr-code')).getAttribute('data-value')).toBe(
            'https://ptbk.io/material-after',
        );

        view.rerender(createWorkshopContentElement(workshopSlug, []));
        await waitFor(() => expect(screen.queryByTestId('workshop-material-qr-code')).toBeNull());
        expect(screen.queryByRole('group', { name: /Náhled odkazu/ })).toBeNull();
    });

    it('keeps the flip button keyboard-focusable and changes faces immediately for reduced motion', async () => {
        useReducedMotionMock.mockReturnValue(true);
        renderWorkshopContent([CONTENT_BLOCK]);

        const showQrButton = await screen.findByRole('button', { name: /Zobrazit QR kód/ });
        showQrButton.focus();
        expect(document.activeElement).toBe(showQrButton);
        expect(showQrButton.className).toContain('focus-visible:ring-2');
        fireEvent.click(showQrButton);

        const flipSurface = screen.getByRole('group', { name: 'Náhled odkazu: Zjistit více' }).firstElementChild;
        expect(flipSurface?.className).toContain('duration-0');
        expect(await screen.findByTestId('workshop-material-qr-code')).not.toBeNull();
    });

    it('uses the QR renderer quiet zone without an extra frame or redundant phone prompt', async () => {
        renderWorkshopContent([CONTENT_BLOCK]);

        expect(screen.queryByTestId('workshop-material-qr-code')).toBeNull();
        fireEvent.click(await screen.findByRole('button', { name: /Zobrazit QR kód/ }));
        const qrCode = await screen.findByTestId('workshop-material-qr-code');
        const qrCodeFace = screen.getByRole('group', { name: 'Náhled odkazu: Zjistit více' });

        expect(qrCode.className).toContain('bg-white');
        expect(qrCode.className).not.toMatch(/(?:^|\s)p-\S+/);
        expect(screen.queryByText('Otevřít v telefonu')).toBeNull();
        expect(qrCodeFace.querySelector('[aria-hidden="true"] button')?.getAttribute('tabindex')).toBe('-1');
    });

    it('keeps multiple material links underlined in the room palette without a call to action', async () => {
        const contentBlockWithMultipleLinks: WorkshopContentBlock = {
            ...CONTENT_BLOCK,
            bodyMarkdown: '[První materiál](https://example.com/one) a [druhý materiál](https://example.com/two)',
        };
        const { container } = renderWorkshopContent([contentBlockWithMultipleLinks]);

        await waitFor(() => expect(container.querySelectorAll('[data-testid="markdown-content"] a')).toHaveLength(2));

        expect(screen.queryByRole('link', { name: /Otevřít materiál/ })).toBeNull();
        expect(screen.getByTestId('markdown-content').className).toContain('[--chat-md-link-color:rgb(var(--room-accent))]');
    });

    it('keeps preview cards in a single column on phones and adds a second column on wider screens', async () => {
        const { container } = renderWorkshopContent([CONTENT_BLOCK]);
        await screen.findByRole('button', { name: /Zobrazit QR kód/ });

        const previewList = container.querySelector('[aria-label="Náhledy odkazů v materiálu"]');
        expect(previewList?.className).toContain('grid-cols-1');
        expect(previewList?.className).toContain('sm:grid-cols-2');
        const previewCard = container.querySelector('[role="group"][aria-label="Náhled odkazu: Zjistit více"]');
        expect(previewCard?.className).toContain('h-[18rem]');
        expect(previewCard?.firstElementChild?.firstElementChild?.className).toContain('flex-col');
        expect(previewCard?.firstElementChild?.firstElementChild?.className).toContain('sm:flex-row');
    });

    it('keeps every multi-link preview independently scannable and opens only one QR face at a time', async () => {
        const contentBlockWithMultipleLinks: WorkshopContentBlock = {
            ...CONTENT_BLOCK,
            bodyMarkdown:
                '[První materiál](https://ptbk.io/material-one) a [druhý materiál](https://ptbk.io/material-two)',
        };
        renderWorkshopContent([contentBlockWithMultipleLinks]);

        expect(screen.queryByTestId('workshop-material-qr-code')).toBeNull();
        await screen.findAllByText('Krátký popis stránky.');
        const firstQrButton = await screen.findAllByRole('button', { name: /Zobrazit QR kód/ });
        fireEvent.click(firstQrButton[0]!);
        expect((await screen.findByTestId('workshop-material-qr-code')).getAttribute('data-value')).toBe(
            'https://ptbk.io/material-one',
        );

        fireEvent.click(screen.getAllByRole('button', { name: /Zobrazit QR kód/ })[0]!);
        await waitFor(() => {
            expect(screen.getAllByTestId('workshop-material-qr-code')).toHaveLength(1);
            expect(screen.getByTestId('workshop-material-qr-code').getAttribute('data-value')).toBe(
                'https://ptbk.io/material-two',
            );
        });
        fireEvent.click(screen.getByRole('button', { name: /Zobrazit náhled/ }));
        expect(screen.queryByTestId('workshop-material-qr-code')).toBeNull();
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
