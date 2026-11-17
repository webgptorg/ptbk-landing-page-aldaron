import 'server-only';
import type { AvatarPrincipal } from './auth';
import { AvatarError, getAvatarAvailability } from './config';
import { getAvatarDatabase } from './database';

export type AvatarPlan = 'free' | 'light' | 'full';
export type AvatarAccess = {
    plan: AvatarPlan; limit: number; used: number; periodStart: string; periodEnd: string;
    subscription: { id: string; status: string; cancelAtPeriodEnd: boolean; paidThrough: string | null } | null;
};
export function avatarCalendarPeriod(now = new Date()): { periodStart: string; periodEnd: string } {
    return { periodStart: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString(),
        periodEnd: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString() };
}
/** Rights come from this product's confirmed invoices, or the paid Developers membership benefit. */
export async function getAvatarAccess(principal: AvatarPrincipal): Promise<AvatarAccess> {
    const db = getAvatarDatabase();
    const { isTest, limits } = getAvatarAvailability();
    const { periodStart, periodEnd } = avatarCalendarPeriod();
    const orders = await db.from('avatar_orders').select('id,status,cancel_at_period_end,paid_through,stripe_subscription_id,usage_limits')
        .eq('principal_id', principal.id).eq('is_test', isTest).order('created_at', { ascending: false }).limit(100);
    if (orders.error) throw new AvatarError('Předplatné avatara teď nelze ověřit.');
    const now = new Date().toISOString();
    const candidates = (orders.data ?? []).filter(order => ['active', 'past_due', 'canceled'].includes(order.status) && order.paid_through && Date.parse(order.paid_through) > Date.parse(now));
    let fullOrder: typeof candidates[number] | null = null;
    if (candidates.length) {
        const invoices = await db.from('avatar_invoices').select('order_id,amount_paid,refunded_amount,paid_through')
            .in('order_id', candidates.map(order => order.id)).gt('paid_through', now);
        if (invoices.error) throw new AvatarError('Úhradu předplatného teď nelze ověřit.');
        fullOrder = candidates.find(order => invoices.data?.some(invoice => invoice.order_id === order.id && invoice.amount_paid > invoice.refunded_amount)) ?? null;
    }
    let plan: AvatarPlan = fullOrder ? 'full' : 'free';
    if (!fullOrder) {
        const member = await db.from('community_memberships').select('status,current_period_ends_at')
            .eq('community_id', 'vyvojari').eq('email', principal.email).eq('is_test_payment', isTest)
            .eq('status', 'active').gt('current_period_ends_at', now).limit(1);
        if (member.error) throw new AvatarError('Členský benefit teď nelze ověřit.');
        if (member.data?.length) plan = 'light';
    }
    const usage = await db.from('avatar_usage').select('used').eq('principal_id', principal.id).eq('period_start', periodStart).maybeSingle();
    if (usage.error) throw new AvatarError('Spotřebu avatara teď nelze načíst.');
    const visibleOrder = fullOrder ?? (orders.data ?? []).find(order => ['pending','active','trialing','past_due','unpaid','paused'].includes(order.status));
    const frozenLimit = fullOrder?.usage_limits?.full;
    const acceptedFullLimit = Number.isSafeInteger(frozenLimit) && frozenLimit > 0 && frozenLimit <= 100000 ? frozenLimit as number : limits.full;
    return { plan, limit: plan === 'full' ? acceptedFullLimit : limits[plan], used: usage.data?.used ?? 0, periodStart, periodEnd,
        subscription: visibleOrder ? { id: visibleOrder.id, status: visibleOrder.status, cancelAtPeriodEnd: visibleOrder.cancel_at_period_end,
            paidThrough: visibleOrder.paid_through } : null };
}
