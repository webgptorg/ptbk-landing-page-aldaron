'use client';

import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';

/** All homepage entry points use the existing shared qualification flow. */
export function HomepageCallButton({ label, id }: { label: string; id?: string }) {
    return (
        <Button
            id={id}
            size="lg"
            className="h-auto min-h-12 whitespace-normal rounded-full bg-cyan-800 px-6 py-3 text-base text-white hover:bg-cyan-900"
            onClick={() => window.dispatchEvent(new CustomEvent('open-qualification-popup'))}
        >
            {label}
            <ArrowUpRight aria-hidden="true" className="ml-2 h-5 w-5 shrink-0" />
        </Button>
    );
}
