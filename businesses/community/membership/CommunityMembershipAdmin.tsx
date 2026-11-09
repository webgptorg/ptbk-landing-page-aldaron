'use client';

import { DEFAULT_COMMUNITY_ID, type CommunityId } from '@/businesses/community/config';

import { CommunityMembershipAdminFilters } from '@/businesses/community/membership/CommunityMembershipAdminFilters';
import { CommunityMembershipStatusBadge } from '@/businesses/community/membership/CommunityMembershipStatusBadge';
import { fetchAdminCommunityMembershipPage } from '@/businesses/community/membership/communityMembershipAdminApi';
import { formatCommunityMembershipPrice } from '@/businesses/community/membership/communityMembershipPrice';
import { WorkshopParticipantPagination } from '@/businesses/workshop-admin/WorkshopParticipantPagination';
import { formatWorkshopAdminDateTime } from '@/businesses/workshop-admin/workshopAdminFormatting';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useUrlSynchronizedViewState } from '@/hooks/useUrlSynchronizedViewState';
import {
    createCommunityMembershipAdminPath,
    readCommunityMembershipAdminMemberEmail,
} from '@/lib/community-membership/communityMembershipAdminLinks';
import type { CommunityMembershipAdminPage } from '@/lib/community-membership/communityMembershipDatabase';
import {
    DEFAULT_COMMUNITY_MEMBERSHIP_ADMIN_QUERY,
    parseCommunityMembershipAdminQuery,
    serializeCommunityMembershipAdminQuery,
    type CommunityMembershipAdminQuery,
} from '@/lib/community-membership/communityMembershipAdminQuery';
import { createCommunityMembershipStripeDashboardUrl } from '@/lib/community-membership/communityMembershipStripeDashboard';
import { isCommunityMembershipCoveredByDiscountCode } from '@/lib/community-membership/communityMembershipTypes';
import { Crown, ExternalLink, RefreshCw, Users } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';

function getMembershipPageCount(totalCount: number, pageSize: number): number {
    return Math.max(1, Math.ceil(totalCount / pageSize));
}

function formatOptionalDateTime(timestamp: string | null): string {
    return timestamp === null ? '—' : formatWorkshopAdminDateTime(timestamp);
}

/**
 * Administers the durable payment records of the community. It does not duplicate Stripe mutations: Stripe remains
 * authoritative, and every record offers the exact Stripe object where an administrator can resolve a payment or
 * subscription while the mirrored lifecycle here stays visible alongside the member who owns it.
 */
export function CommunityMembershipAdmin({ communityId = DEFAULT_COMMUNITY_ID }: { readonly communityId?: CommunityId }) {
    const searchParams = useSearchParams();
    const [membershipQuery, changeMembershipQuery] = useUrlSynchronizedViewState<CommunityMembershipAdminQuery>({
        parseViewState: parseCommunityMembershipAdminQuery,
        serializeViewState: serializeCommunityMembershipAdminQuery,
    });
    const [membershipPage, setMembershipPage] = useState<CommunityMembershipAdminPage | null>(null);
    const [isMembershipsLoading, setIsMembershipsLoading] = useState(true);
    const [membershipErrorMessage, setMembershipErrorMessage] = useState<string | null>(null);
    const membershipPageLoadSequenceReference = useRef(0);
    const handledMemberEmailReference = useRef<string | null>(null);
    const deferredSearchQuery = useDeferredValue(membershipQuery.searchQuery);
    const selectedMemberEmail = useMemo(
        () => readCommunityMembershipAdminMemberEmail(new URLSearchParams(searchParams.toString())),
        [searchParams],
    );
    const requestedMembershipQuery = useMemo<CommunityMembershipAdminQuery>(
        () => ({ ...membershipQuery, searchQuery: deferredSearchQuery }),
        [deferredSearchQuery, membershipQuery],
    );

    const loadMembershipPage = useCallback(async () => {
        const loadSequence = ++membershipPageLoadSequenceReference.current;
        setIsMembershipsLoading(true);
        try {
            const loadedMembershipPage = await fetchAdminCommunityMembershipPage(requestedMembershipQuery, communityId);
            if (loadSequence !== membershipPageLoadSequenceReference.current) {
                return;
            }

            setMembershipPage(loadedMembershipPage);
            setMembershipErrorMessage(null);
            const totalPageCount = getMembershipPageCount(loadedMembershipPage.totalCount, requestedMembershipQuery.pageSize);
            if (requestedMembershipQuery.page > totalPageCount) {
                changeMembershipQuery((currentQuery) =>
                    currentQuery.page === requestedMembershipQuery.page
                        ? { ...currentQuery, page: totalPageCount }
                        : currentQuery,
                );
            }
        } catch (error) {
            if (loadSequence === membershipPageLoadSequenceReference.current) {
                setMembershipErrorMessage(
                    error instanceof Error ? error.message : 'Placená členství se nepodařilo načíst.',
                );
            }
        } finally {
            if (loadSequence === membershipPageLoadSequenceReference.current) {
                setIsMembershipsLoading(false);
            }
        }
    }, [changeMembershipQuery, communityId, requestedMembershipQuery]);

    useEffect(() => {
        void loadMembershipPage();
    }, [loadMembershipPage]);

    useEffect(() => {
        if (selectedMemberEmail === null || selectedMemberEmail === handledMemberEmailReference.current) {
            return;
        }

        handledMemberEmailReference.current = selectedMemberEmail;
        changeMembershipQuery((currentQuery) => ({
            ...currentQuery,
            searchQuery: selectedMemberEmail,
            page: 1,
        }));
    }, [changeMembershipQuery, selectedMemberEmail]);

    const changeQuery = (changes: Partial<CommunityMembershipAdminQuery>) => {
        changeMembershipQuery((currentQuery) => ({
            ...currentQuery,
            ...changes,
            page: changes.page ?? 1,
        }));
    };

    const memberships = membershipPage?.memberships ?? [];
    const membershipCount = membershipPage?.totalCount ?? 0;

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950">
                        <Crown className="h-5 w-5 text-amber-500" /> Placená členství a platby
                    </h2>
                    <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                        Každý řádek je jedno trvalé členství podle e-mailu ve vybrané komunitě. Stav se načítá ze Stripe. Platební údaje
                        a změny předplatného se spravují u stejného záznamu ve Stripe.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-800">
                        {membershipCount}
                    </span>
                    <Button asChild type="button" variant="outline" size="sm">
                        <Link href={createCommunityMembershipAdminPath('participants', undefined, communityId)}>
                            <Users className="mr-1.5 h-4 w-4" /> Účastníci komunity
                        </Link>
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => void loadMembershipPage()}>
                        <RefreshCw className="mr-1.5 h-4 w-4" /> Obnovit platby
                    </Button>
                </div>
            </div>

            <div className="mt-6">
                <CommunityMembershipAdminFilters query={membershipQuery} onChange={changeQuery} />
            </div>

            {membershipErrorMessage !== null ? (
                <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                    {membershipErrorMessage}
                </div>
            ) : isMembershipsLoading && memberships.length === 0 ? (
                <div className="flex justify-center py-12">
                    <RefreshCw className="h-5 w-5 animate-spin text-cyan-600" />
                </div>
            ) : memberships.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
                    Žádné placené členství neodpovídá aktuálnímu filtru.
                </div>
            ) : (
                <div className="mt-4 rounded-xl border border-slate-200">
                    <Table
                        className="min-w-[1320px]"
                        horizontalScrollLabel="Posunout tabulku placených členství vodorovně"
                    >
                        <TableHeader>
                            <TableRow>
                                <TableHead isPinned>Člen</TableHead>
                                <TableHead>Stav</TableHead>
                                <TableHead>Tarif a cena</TableHead>
                                <TableHead>Platba ve Stripe</TableHead>
                                <TableHead>Zaplaceno do</TableHead>
                                <TableHead>Časové údaje</TableHead>
                                <TableHead>Správa</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {memberships.map((membership) => {
                                const stripeDashboardUrl = createCommunityMembershipStripeDashboardUrl(membership);
                                const isSubscriptionAvailable = membership.stripeSubscriptionId !== null;
                                const isCoveredByDiscountCode = isCommunityMembershipCoveredByDiscountCode(membership);

                                return (
                                    <TableRow key={membership.id}>
                                        <TableCell isPinned className="min-w-64 align-top">
                                            <p className="font-semibold text-slate-900">{membership.fullname}</p>
                                            <p className="mt-1 break-all text-xs text-slate-500">{membership.email}</p>
                                            <Link
                                                href={createCommunityMembershipAdminPath('participants', membership.email)}
                                                className="mt-2 inline-flex text-xs font-semibold text-cyan-700 hover:underline"
                                            >
                                                Otevřít účastníka v komunitě
                                            </Link>
                                        </TableCell>
                                        <TableCell className="min-w-44 align-top">
                                            <CommunityMembershipStatusBadge status={membership.status} />
                                            <p className="mt-2 text-xs text-slate-500">
                                                {membership.isTestPayment ? 'Testovací Stripe' : 'Ostrý Stripe'}
                                            </p>
                                        </TableCell>
                                        <TableCell className="min-w-48 align-top">
                                            <p className="font-medium text-slate-800">{membership.planId}</p>
                                            <p className="mt-1 text-sm text-slate-600">
                                                {formatCommunityMembershipPrice(membership.monthlyPriceCzk)} / měsíc
                                            </p>
                                            {membership.discountPercent > 0 && (
                                                <p className="mt-1 text-xs text-emerald-700">
                                                    Sleva {membership.discountPercent} %
                                                    {membership.discountCode === null ? '' : ` · ${membership.discountCode}`}
                                                </p>
                                            )}
                                        </TableCell>
                                        <TableCell className="min-w-60 align-top text-xs text-slate-600">
                                            {membership.stripeCustomerId !== null && (
                                                <p className="break-all">Zákazník: {membership.stripeCustomerId}</p>
                                            )}
                                            {membership.stripeSubscriptionId !== null && (
                                                <p className="mt-1 break-all">Předplatné: {membership.stripeSubscriptionId}</p>
                                            )}
                                            {membership.stripeCheckoutSessionId !== null && (
                                                <p className="mt-1 break-all">Checkout: {membership.stripeCheckoutSessionId}</p>
                                            )}
                                        </TableCell>
                                        <TableCell className="min-w-40 align-top text-sm text-slate-700">
                                            {formatOptionalDateTime(membership.currentPeriodEndsAt)}
                                        </TableCell>
                                        <TableCell className="min-w-52 align-top text-xs text-slate-600">
                                            <p>Požadováno {formatWorkshopAdminDateTime(membership.createdAt)}</p>
                                            <p className="mt-1">Aktivováno {formatOptionalDateTime(membership.activatedAt)}</p>
                                            <p className="mt-1">Zrušeno {formatOptionalDateTime(membership.canceledAt)}</p>
                                        </TableCell>
                                        <TableCell className="min-w-52 align-top">
                                            {stripeDashboardUrl === null ? (
                                                <span className="text-xs text-slate-400">
                                                    {isCoveredByDiscountCode
                                                        ? 'Členství pokryl slevový kód, platba ve Stripe nevznikla.'
                                                        : 'Stripe záznam zatím nevznikl.'}
                                                </span>
                                            ) : (
                                                <a
                                                    href={stripeDashboardUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"
                                                >
                                                    {isSubscriptionAvailable ? 'Spravovat předplatné' : 'Otevřít checkout'}
                                                    <ExternalLink className="ml-1.5 h-4 w-4" />
                                                </a>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}

            <div className="mt-4">
                <WorkshopParticipantPagination
                    totalCount={membershipCount}
                    page={membershipQuery.page}
                    pageSize={membershipQuery.pageSize}
                    itemLabel="placených členství"
                    emptyMessage="Žádné placené členství neodpovídá filtru."
                    onChangePage={(page) => changeQuery({ page })}
                    onChangePageSize={(pageSize) => changeQuery({ pageSize })}
                />
            </div>
        </section>
    );
}
