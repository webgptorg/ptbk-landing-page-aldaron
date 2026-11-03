/**
 * @vitest-environment jsdom
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ButtonHTMLAttributes, ImgHTMLAttributes, InputHTMLAttributes, PropsWithChildren } from 'react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { subscribeToWaitlistMock } = vi.hoisted(() => ({
    subscribeToWaitlistMock: vi.fn(),
}));

vi.mock('@/components/legal/LegalFooterLinks', () => ({
    LegalFooterLinks: () => null,
}));

vi.mock('@/components/legal/PersonalDataConsentNote', () => ({
    PersonalDataConsentNote: () => null,
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, ...props }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) => (
        <button {...props}>{children}</button>
    ),
}));

vi.mock('@/components/ui/checkbox', () => ({
    Checkbox: ({
        checked,
        onCheckedChange,
        ...props
    }: InputHTMLAttributes<HTMLInputElement> & {
        checked?: boolean;
        onCheckedChange?: (isChecked: boolean) => void;
    }) => (
        <input
            {...props}
            type="checkbox"
            checked={checked}
            onChange={(event) => onCheckedChange?.(event.currentTarget.checked)}
        />
    ),
}));

vi.mock('@/components/ui/input', () => ({
    Input: (props: InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock('@/lib/subscription/subscribeToWaitlist', () => ({
    subscribeToWaitlist: subscribeToWaitlistMock,
}));

vi.mock('next/image', () => ({
    default: (props: ImgHTMLAttributes<HTMLImageElement>) => React.createElement('img', { ...props, alt: props.alt ?? '' }),
}));

vi.mock('next/link', () => ({
    default: ({ children, ...props }: PropsWithChildren<React.AnchorHTMLAttributes<HTMLAnchorElement>>) => (
        <a {...props}>{children}</a>
    ),
}));

vi.mock('next/navigation', () => ({
    usePathname: () => '/en',
}));

import { Footer } from './footer';

describe('Footer newsletter subscription', () => {
    beforeEach(() => {
        subscribeToWaitlistMock.mockReset();
        subscribeToWaitlistMock.mockResolvedValue(undefined);
    });

    it('records a newsletter subscriber once through the shared contact pipeline', async () => {
        render(<Footer isTechnologyIncubationShown={false} />);

        fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
            target: { value: 'reader@example.com' },
        });
        fireEvent.click(screen.getByRole('checkbox'));
        fireEvent.click(screen.getByRole('button', { name: 'Subscribe' }));

        await waitFor(() => {
            expect(subscribeToWaitlistMock).toHaveBeenCalledWith({
                email: 'reader@example.com',
                placeName: 'newsletter-footer',
                language: 'en', marketingConsent: true,
            });
        });

        expect(subscribeToWaitlistMock).toHaveBeenCalledTimes(1);
        expect(screen.getByText('Successfully subscribed!')).toBeTruthy();
    });
});
