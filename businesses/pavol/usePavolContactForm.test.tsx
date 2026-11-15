/** @vitest-environment jsdom */

import { act, cleanup, renderHook } from '@testing-library/react';
import type { FormEvent } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { subscribeToWaitlist } from '@/lib/subscription/subscribeToWaitlist';
import { PAVOL_PAGE_CONTENT } from './pavolContent';
import { usePavolContactForm } from './usePavolContactForm';

vi.mock('@/lib/subscription/subscribeToWaitlist', () => ({ subscribeToWaitlist: vi.fn() }));

const subscribe = vi.mocked(subscribeToWaitlist);

function submissionEvent(): FormEvent<HTMLFormElement> {
    return { preventDefault: vi.fn(), currentTarget: document.createElement('form') } as unknown as FormEvent<HTMLFormElement>;
}

beforeEach(() => {
    subscribe.mockReset();
    subscribe.mockResolvedValue(undefined);
    window.history.replaceState(null, '', '/');
});

afterEach(() => {
    cleanup();
    document.documentElement.lang = '';
});

describe.each(['cs', 'en'] as const)('personal contact form in %s', (language: SupportedHomepageLanguage) => {
    const content = PAVOL_PAGE_CONTENT[language];
    const training = content.services.items.find(item => item.id === 'ai-workshops-talks')!;
    const otherService = content.services.items.find(item => item.id !== training.id)!;

    it('prefills the training enquiry opened from its detail page', () => {
        window.history.replaceState(null, '', '/?inquiry=ai-workshops-talks#contact');
        const { result } = renderHook(() => usePavolContactForm(language));

        expect(result.current.isReady).toBe(true);
        expect(result.current.selectedServiceId).toBe(training.id);
        expect(result.current.fields.message).toBe(training.prefillMessage);
        expect(subscribe).not.toHaveBeenCalled();
    });

    it('preserves a custom message and contact details through service changes and a failed send', async () => {
        subscribe.mockRejectedValueOnce(new Error('Temporary failure'));
        const { result } = renderHook(() => usePavolContactForm(language));
        act(() => result.current.selectService(training.id));
        expect(result.current.fields.message).toBe(training.prefillMessage);
        act(() => result.current.selectService(otherService.id));
        expect(result.current.fields.message).toBe(otherService.prefillMessage);

        const message = 'My own question.\nKeep this second line.';
        act(() => {
            result.current.updateField('name', 'Test Visitor');
            result.current.updateField('email', 'visitor@example.com');
            result.current.updateField('message', message);
        });
        act(() => result.current.selectService(training.id));
        expect(result.current.fields.message).toBe(message);

        await act(async () => result.current.submitForm(submissionEvent()));

        expect(result.current.error).toBe(content.contact.submissionErrorMessage);
        expect(result.current.isSubmitting).toBe(false);
        expect(result.current.isSubmitted).toBe(false);
        expect(result.current.fields).toEqual({ name: 'Test Visitor', email: 'visitor@example.com', company: '', message });
        expect(result.current.selectedServiceId).toBe(training.id);
        act(() => result.current.selectService(otherService.id));
        expect(result.current.fields.message).toBe(message);
    });

    it('sends the existing contact source, explicit language and complete message, then resets on success', async () => {
        // The hook owns the language even if a caller is mounted outside the localized page shell.
        document.documentElement.lang = language === 'cs' ? 'en' : 'cs';
        const { result } = renderHook(() => usePavolContactForm(language));
        act(() => {
            result.current.selectService(training.id);
            result.current.updateField('name', '  Test Visitor  ');
            result.current.updateField('email', '  visitor@example.com  ');
            result.current.updateField('message', '  A custom enquiry.\nKeep the second line.  ');
        });

        await act(async () => result.current.submitForm(submissionEvent()));

        expect(subscribe).toHaveBeenCalledExactlyOnceWith({
            language,
            fullname: 'Test Visitor',
            email: 'visitor@example.com',
            placeName: `PavolPersonalPage-${language}`,
            note: [
                `Language: ${language}`,
                'Selected inquiry: ai-workshops-talks',
                'Company: (not provided)',
                'Message:',
                'A custom enquiry.\nKeep the second line.',
            ].join('\n'),
        });
        expect(result.current.isSubmitted).toBe(true);
        expect(result.current.fields).toEqual({ name: '', email: '', company: '', message: '' });
        expect(result.current.selectedServiceId).toBe('');
    });
});

it('keeps a pending enquiry immutable and prevents duplicate sends', async () => {
    let finish!: () => void;
    subscribe.mockImplementationOnce(() => new Promise<void>(resolve => { finish = resolve; }));
    const { result } = renderHook(() => usePavolContactForm('cs'));
    act(() => {
        result.current.updateField('name', 'Test Visitor');
        result.current.updateField('email', 'visitor@example.com');
        result.current.updateField('message', 'Keep this message.');
    });
    let request!: Promise<void>;
    act(() => { request = result.current.submitForm(submissionEvent()); });
    expect(result.current.isSubmitting).toBe(true);
    act(() => {
        result.current.updateField('message', 'Replacement');
        result.current.selectService('ai-workshops-talks');
        result.current.resetForm();
    });
    await act(async () => result.current.submitForm(submissionEvent()));
    expect(subscribe).toHaveBeenCalledTimes(1);
    expect(result.current.fields.message).toBe('Keep this message.');
    expect(result.current.selectedServiceId).toBe('');
    await act(async () => { finish(); await request; });
    expect(result.current.isSubmitted).toBe(true);
});
