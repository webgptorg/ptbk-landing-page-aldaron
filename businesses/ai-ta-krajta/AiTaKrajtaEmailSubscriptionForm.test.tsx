/**
 * @vitest-environment jsdom
 */

import { PublicSiteNavigationProvider } from '@/components/public-site-navigation-provider';
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const EMAIL_SUBSCRIPTION_MOCKS = vi.hoisted(() => ({
    subscribeToWaitlist: vi.fn(),
}));

vi.mock('@/lib/subscription/subscribeToWaitlist', () => ({
    subscribeToWaitlist: EMAIL_SUBSCRIPTION_MOCKS.subscribeToWaitlist,
}));

import { AiTaKrajtaEmailSubscriptionForm } from './AiTaKrajtaEmailSubscriptionForm';
import {
    AI_TA_KRAJTA_EMAIL_SUBSCRIPTION_CONTACT_NOTE,
    AI_TA_KRAJTA_EMAIL_SUBSCRIPTION_PLACE_NAME,
} from './config';

function renderEmailSubscriptionForm() {
    return render(
        <PublicSiteNavigationProvider hostname="www.ai-ta-krajta.cz">
            <AiTaKrajtaEmailSubscriptionForm />
        </PublicSiteNavigationProvider>,
    );
}

function submitForm() {
    const form = screen.getByRole('form', { name: 'AI ta Krajta do e-mailu' });
    fireEvent.submit(form);
}

beforeEach(() => {
    EMAIL_SUBSCRIPTION_MOCKS.subscribeToWaitlist.mockReset().mockResolvedValue(undefined);
});

afterEach(() => {
    cleanup();
});

describe('AI ta Krajta email subscription form', () => {
    it('asks only for an email and links to the canonical privacy page', () => {
        renderEmailSubscriptionForm();

        expect(screen.getByRole('heading', { name: 'AI ta Krajta do e-mailu' })).toBeVisible();
        expect(screen.getAllByRole('textbox')).toHaveLength(1);
        expect(screen.getByRole('textbox', { name: 'E-mail' })).toBeRequired();
        expect(screen.getByRole('button', { name: 'Odebírat e-mailem' })).toBeVisible();
        expect(screen.getByRole('link', { name: 'zásad ochrany osobních údajů' })).toHaveAttribute(
            'href',
            'https://ptbk.io/cs/ochrana-osobnich-udaju',
        );
    });

    it('validates the email, trims whitespace, and records the podcast-specific request', async () => {
        renderEmailSubscriptionForm();

        const emailField = screen.getByRole('textbox', { name: 'E-mail' });
        fireEvent.change(emailField, { target: { value: 'not-an-email' } });
        submitForm();

        expect(await screen.findByRole('alert')).toHaveTextContent('Ten e-mail nevypadá platně');
        expect(EMAIL_SUBSCRIPTION_MOCKS.subscribeToWaitlist).not.toHaveBeenCalled();

        fireEvent.change(emailField, { target: { value: '  listener@example.com  ' } });
        submitForm();

        expect(await screen.findByRole('status')).toHaveTextContent('žádost o e-mailové novinky jsme uložili');
        expect(EMAIL_SUBSCRIPTION_MOCKS.subscribeToWaitlist).toHaveBeenCalledTimes(1);
        expect(EMAIL_SUBSCRIPTION_MOCKS.subscribeToWaitlist).toHaveBeenCalledWith({
            email: 'listener@example.com',
            placeName: AI_TA_KRAJTA_EMAIL_SUBSCRIPTION_PLACE_NAME,
            note: AI_TA_KRAJTA_EMAIL_SUBSCRIPTION_CONTACT_NOTE,
        });
        expect(screen.queryByText('listener@example.com')).not.toBeInTheDocument();
    });

    it('keeps the email after a server error and allows a successful retry', async () => {
        EMAIL_SUBSCRIPTION_MOCKS.subscribeToWaitlist
            .mockRejectedValueOnce(new Error('The contact could not be saved, please try again'))
            .mockResolvedValueOnce(undefined);

        renderEmailSubscriptionForm();
        const emailField = screen.getByRole('textbox', { name: 'E-mail' });
        fireEvent.change(emailField, { target: { value: 'listener@example.com' } });
        submitForm();

        expect(await screen.findByRole('alert')).toHaveTextContent('The contact could not be saved');
        expect(screen.getByRole('textbox', { name: 'E-mail' })).toHaveValue('listener@example.com');
        expect(screen.queryByRole('status')).not.toBeInTheDocument();

        submitForm();

        expect(await screen.findByRole('status')).toHaveTextContent('žádost o e-mailové novinky jsme uložili');
        expect(EMAIL_SUBSCRIPTION_MOCKS.subscribeToWaitlist).toHaveBeenCalledTimes(2);
    });

    it('blocks repeated submissions while the request is in flight', async () => {
        let resolveSubscription: (() => void) | undefined;
        EMAIL_SUBSCRIPTION_MOCKS.subscribeToWaitlist.mockReturnValueOnce(
            new Promise<void>((resolve) => {
                resolveSubscription = resolve;
            }),
        );

        renderEmailSubscriptionForm();
        fireEvent.change(screen.getByRole('textbox', { name: 'E-mail' }), {
            target: { value: 'listener@example.com' },
        });

        submitForm();
        submitForm();

        expect(EMAIL_SUBSCRIPTION_MOCKS.subscribeToWaitlist).toHaveBeenCalledTimes(1);
        expect(screen.getByRole('button', { name: 'Odesíláme…' })).toBeDisabled();
        expect(screen.queryByRole('status')).not.toBeInTheDocument();

        await act(async () => {
            resolveSubscription?.();
        });

        expect(await screen.findByRole('status')).toHaveTextContent('žádost o e-mailové novinky jsme uložili');
    });
});
