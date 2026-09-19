'use client';

import { COMMUNITY_PATH } from '@/businesses/community/config';
import { CommunityProjectsSection } from '@/businesses/community/projects/CommunityProjectsSection';
import { WorkshopRoomThemeControl } from '@/components/workshops/WorkshopRoomThemeControl';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function CommunityProjectsListingPage() {
    return (
        <main className="workshop-room min-h-screen bg-room-background px-4 py-6 text-room-text sm:px-8 sm:py-8">
            <div className="mx-auto max-w-[1500px]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href={COMMUNITY_PATH}
                        className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-room-text transition hover:bg-room-overlay/10 hover:text-room-accent"
                    >
                        <ArrowLeft className="h-4 w-4" /> Zpět do komunity
                    </Link>
                    <WorkshopRoomThemeControl />
                </div>
                <div className="mt-5 rounded-2xl border border-room-accent/15 bg-room-accent/[0.04] px-5 py-5 sm:px-7">
                    <p className="flex items-center gap-2 text-sm font-bold text-room-accent">
                        <Sparkles className="h-4 w-4" /> Galerie komunity
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-room-heading">Všechny projekty a tvorba členů</h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-room-muted">
                        Hlasujte pro projekty, které chcete podpořit, a otevřete jejich diskuzi přímo v komunitě.
                    </p>
                </div>
                <CommunityProjectsSection isLimited={false} />
            </div>
        </main>
    );
}
