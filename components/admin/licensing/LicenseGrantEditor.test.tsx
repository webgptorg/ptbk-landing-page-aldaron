// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const fakes=vi.hoisted(() => ({request:vi.fn()}));
vi.mock('@/lib/admin/requestAdminJson',() => ({requestAdminJson:fakes.request}));
import { LicenseGrantEditor } from './LicenseGrantEditor';
import { capabilitiesForPlan } from '@/lib/promptbook-licensing/contract';
import type { AdminLicense } from '@/lib/promptbook-licensing/adminContract';
beforeEach(() => {vi.resetAllMocks();fakes.request.mockResolvedValue({grantId:'4408b4d6-6005-4b77-97eb-fdd67847ee91'});});
afterEach(cleanup);
it('explicitly creates a direct licence with numeric rights and no purchase fields',async () => {
    const saved=vi.fn();
    render(<LicenseGrantEditor isTest={false} onClose={() => {}} onSaved={saved}/>);
    expect(screen.getByText(/Přidělení nevytváří objednávku/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('E-mail účtu'),{target:{value:'customer@example.test'}});
    fireEvent.change(screen.getByLabelText('Důvod přidělení / změny'),{target:{value:'Partnerský pilot na základě dohody'}});
    expect(fakes.request).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button',{name:'Vytvořit licenci'}));
    await waitFor(() => expect(saved).toHaveBeenCalled());
    const body=JSON.parse(fakes.request.mock.calls[0]![1].body);
    expect(body.action).toBe('grant');expect(body.requestId).toMatch(/^[a-f0-9-]{36}$/);expect(body.email).toBe('customer@example.test');
    expect(body.capabilities).toEqual(capabilitiesForPlan('business'));expect(body).not.toHaveProperty('orderId');expect(body).not.toHaveProperty('stripe_subscription_id');
});
it('keeps unlimited capacity distinct from zero and offers community-only rights separately',async () => {
    render(<LicenseGrantEditor isTest onClose={() => {}} onSaved={() => {}}/>);
    expect(screen.getByLabelText('Harnessy')).toHaveValue(null);
    fireEvent.click(screen.getByRole('button',{name:'Jen komunita'}));
    expect(screen.getByLabelText('Projekty enginu')).toHaveValue(0);
    expect(screen.getByLabelText('Harnessy')).toHaveValue(0);
    expect(screen.getByLabelText('Vzdálené ovládání')).not.toBeChecked();
    expect(screen.getByText(/Testovací prostředí/)).toBeInTheDocument();
});
