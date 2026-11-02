/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('next/navigation', () => ({ usePathname: () => '/cs/pavol' }));
vi.mock('@/components/public-site-navigation-provider', () => ({ usePublicNavigationUrl: (url: string) => url }));
vi.mock('@/hooks/useFixedControlClearance', () => ({ useFixedControlClearance: () => ({ clearance: 0, height: 52 }) }));
import { COOKIE_SETTINGS_HASH } from '@/lib/legal/cookieSettingsHash';
import { CookiesBar } from './cookies-bar';
import { isCookieChoiceMade, saveCookiePreferences, ONLY_NECESSARY_COOKIES_ALLOWED } from '@/lib/legal/cookieConsentStorage';

describe('quiet cookie conversation', () => {
    beforeEach(() => { vi.useFakeTimers(); localStorage.clear(); window.history.replaceState(null, '', '/'); });
    afterEach(() => { cleanup(); vi.useRealTimers(); });
    it('starts as one launcher and offers a delayed choice whose rejection remains saved', () => {
        const view = render(<CookiesBar brandedLanguage="cs" />);
        expect(screen.queryByRole('dialog')).toBeNull();
        expect(screen.getByRole('button', {name:'Nastavení cookies'})).toBeVisible();
        expect(isCookieChoiceMade()).toBe(false);
        act(() => vi.advanceTimersByTime(6000));
        expect(screen.getByRole('dialog', {name:'Cookies'})).toBeVisible();
        fireEvent.click(screen.getByRole('button', {name:'Jen nutné'}));
        expect(isCookieChoiceMade()).toBe(true);
        expect(JSON.parse(localStorage.getItem('cookiePreferences')!)).toEqual({necessary:true,analytics:false,marketing:false});
        expect(screen.queryByRole('dialog')).toBeNull();
        view.unmount(); render(<CookiesBar brandedLanguage="cs" />);
        act(() => vi.advanceTimersByTime(12000));
        expect(screen.queryByRole('button', {name:'Nastavení cookies'})).toBeNull();
    });
    it('does not interrupt an intentionally opened conversation', () => {
        const existing = document.createElement('div'); existing.setAttribute('data-floating-open','pavol-chat'); document.body.append(existing);
        render(<CookiesBar brandedLanguage="en" />);
        act(() => vi.advanceTimersByTime(9000));
        expect(screen.queryByRole('dialog')).toBeNull();
        existing.remove(); act(() => vi.advanceTimersByTime(3000));
        expect(screen.getByRole('button',{name:'Necessary only'})).toBeVisible();
    });
    it('allows the footer settings link to reopen a previously saved choice', () => {
        saveCookiePreferences(ONLY_NECESSARY_COOKIES_ALLOWED);
        render(<CookiesBar brandedLanguage="cs" />);
        act(() => { window.location.hash = COOKIE_SETTINGS_HASH; window.dispatchEvent(new Event('hashchange')); });
        expect(screen.getByRole('dialog',{name:'Cookies'})).toBeVisible();
    });
});
