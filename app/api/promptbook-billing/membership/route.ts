import {
    getMemberEmailAuth,
    loadAuthorizedBillingOrders,
    memberResponse,
} from '@/lib/promptbook-billing/memberAccess';
import { getPromptbookBillingAvailability } from '@/lib/promptbook-billing/config';
import { hasPromptbookOrderConfirmation } from '@/lib/promptbook-billing/billingConfirmation';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const { supportEmail, supportedVersion, portalLoginUrl } = getPromptbookBillingAvailability();

    try {
        const orders = await loadAuthorizedBillingOrders(request);
        return memberResponse({
            memberships: orders.map((order) => ({
                id: order.id,
                plan: order.plan,
                status: order.status,
                paidThrough: order.paid_through,
                cancelAtPeriodEnd: order.cancel_at_period_end,
                invoiceUrl: order.invoice_url,
                amountPaid: order.amount_paid,
                discountPercent: order.discount_percent,
                discountMonths: order.discount_months,
                supportedVersion: order.engine_version,
                supportEmail: order.support_email,
                engineLicenceUrl: order.engine_licence_url,
                termsVersion: order.terms_version,
                baseAmount: order.base_amount,
                firstPaidAt: order.first_paid_at,
                confirmationUrl: hasPromptbookOrderConfirmation(order)
                    ? `/api/promptbook-billing/confirmation?id=${encodeURIComponent(order.id)}`
                    : null,
            })),
            supportEmail,
            supportedVersion,
            portalLoginUrl,
            emailVerificationEnabled: getMemberEmailAuth() !== null,
        });
    } catch {
        return memberResponse({ error: 'Předplatné teď nelze načíst. Zkuste to za chvíli.' }, 503);
    }
}
