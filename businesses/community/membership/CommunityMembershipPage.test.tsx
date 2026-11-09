/**
 * @vitest-environment jsdom
 */

import { EMPTY_COMMUNITY_PREVIEW, type CommunityPreview } from '@/lib/community/communityPreviewTypes';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/components/discounts/ScrollToRegistrationSection', () => ({
    ScrollToRegistrationSection: () => null,
}));

vi.mock('@/components/header', () => ({
    Header: ({
        brandContext,
        primaryAction,
    }: {
        brandContext?: { label: string };
        primaryAction?: { label: string; href: string };
    }) => (
        <header>
            <span>Promptbook &gt; {brandContext?.label}</span>
            <a href={primaryAction?.href}>{primaryAction?.label}</a>
        </header>
    ),
}));

vi.mock('@/components/minimal-footer', () => ({
    MinimalFooter: () => <footer>Footer</footer>,
}));

vi.mock('@/lib/discounts/useDiscountCodeValidation', () => ({
    useDiscountCodeValidation: () => ({
        discountCode: '',
        setDiscountCode: vi.fn(),
        activeDiscount: null,
        isValidationPending: false,
        validationError: null,
    }),
}));

vi.mock('./CommunityMembershipLivePreview', () => ({
    CommunityMembershipLivePreview: ({ preview }: { preview: CommunityPreview }) => (
        <div data-testid="live-preview" data-member-count={preview.totals.memberCount} />
    ),
}));

vi.mock('./CommunityMembershipRegistrationForm', () => ({
    CommunityMembershipRegistrationForm: ({
        initialFullname,
        initialEmail,
    }: {
        initialFullname: string;
        initialEmail: string;
    }) => <div data-testid="registration-form" data-fullname={initialFullname} data-email={initialEmail} />,
}));

import { CommunityMembershipPage } from './CommunityMembershipPage';

const REAL_COMMUNITY_PREVIEW: CommunityPreview = {
    ...EMPTY_COMMUNITY_PREVIEW,
    totals: {
        memberCount: 244,
        messageCount: 129,
        reactionCount: 1_275,
        projectCount: 2,
        heldWebinarCount: 2,
    },
    upcomingWebinars: [{ id: 'git-a-ai', title: 'Git a AI', startsAt: '2026-09-07T11:00:00.000Z' }],
};

describe('community membership page', () => {
    afterEach(() => {
        cleanup();
    });

    it('presents free live webinars and one 199 Kč monthly paid option', () => {
        render(
            <CommunityMembershipPage
                initialFullname="Pavol Hejný"
                initialEmail="pavol@example.com"
                initialDiscountCode=""
                initialActiveDiscountByPlaceId={{}}
                communityPreview={EMPTY_COMMUNITY_PREVIEW}
            />,
        );

        expect(screen.getByText('Promptbook > Vývojáři')).toBeTruthy();
        expect(screen.getByRole('heading', { name: 'Pavol Hejný, živé webináře máte zdarma.' })).toBeTruthy();
        expect(screen.getByText('Komunita zdarma')).toBeTruthy();
        expect(screen.getAllByText('Placené členství').length).toBeGreaterThan(0);
        expect(screen.getByText('199 Kč / měsíc')).toBeTruthy();
        expect(screen.getAllByText('Zrušení e-mailem').length).toBeGreaterThan(0);
        expect(screen.getByText('Záznamy a archiv webinářů')).toBeTruthy();
        expect(screen.getByText('Placená část komunitního Discordu')).toBeTruthy();
        expect(screen.queryByText('Premium')).toBeNull();
        expect(screen.queryByText('Standard')).toBeNull();
        expect(screen.queryByText(/7 dní zdarma/i)).toBeNull();
        expect(screen.queryByText('Ročně')).toBeNull();

        const registrationForm = screen.getByTestId('registration-form');
        expect(registrationForm.getAttribute('data-fullname')).toBe('Pavol Hejný');
        expect(registrationForm.getAttribute('data-email')).toBe('pavol@example.com');
    });

    it('hands the real community on to its preview and its sections', () => {
        render(
            <CommunityMembershipPage
                initialFullname=""
                initialEmail=""
                initialDiscountCode=""
                initialActiveDiscountByPlaceId={{}}
                communityPreview={REAL_COMMUNITY_PREVIEW}
            />,
        );

        expect(screen.getByTestId('live-preview').getAttribute('data-member-count')).toBe('244');
        expect(screen.getByText('Git a AI')).toBeTruthy();
        expect(screen.getByText('členů komunity')).toBeTruthy();
        expect(screen.getByText(/2 odvysílané webináře/)).toBeTruthy();
    });
});
