'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

/** The shared header already dispatches this event; every homepage enquiry opens the same dialog. */
export function HomepageCallButton({ label, id }: { label: string; id?: string }) {
    return (
        <Button
            id={id}
            onClick={() => window.dispatchEvent(new CustomEvent('open-qualification-popup'))}
            className="h-auto min-h-12 whitespace-normal rounded-full bg-cyan-700 px-6 py-3 text-base font-semibold text-white hover:bg-cyan-800"
        >
            {label}
            <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4 shrink-0" />
        </Button>
    );
}
