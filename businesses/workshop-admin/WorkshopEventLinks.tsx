'use client';

import { Button } from '@/components/ui/button';
import { createPublicEventLinkOrNull } from '@/lib/events/eventLinks';
import { getEventTypeDefinition } from '@/lib/events/eventTypes';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';
import { ExternalLink, Globe } from 'lucide-react';

type WorkshopEventLinksProps = {
    /**
     * The administered term, which says which event it is a term of and whether it is published at all
     */
    readonly workshop: WorkshopSummary;
};

const UNPUBLISHED_EVENT_NOTE =
    'Termín zatím není publikovaný, takže návštěvníka pustí jen výběr publikovaných termínů.';

/**
 * Opens the very event which is being administered, so that whoever manages a term also reads it as a visitor does.
 *
 * Note: Where a term leads is decided once for the whole application, so this opens exactly the page a calendar
 *       invitation, a registration confirmation and the list of terms in the community lead to, rather than an address
 *       written a second time here. A permanent room which is no term of an event has no such page and offers no link.
 */
export function WorkshopEventLinks({ workshop }: WorkshopEventLinksProps) {
    const eventLink = createPublicEventLinkOrNull(workshop);
    if (workshop.event === null || eventLink === null) {
        return null;
    }

    // Note: A kind of event without a live room leads to its landing page already, so that page is offered a second
    //       time only where it is really somewhere else than the term itself.
    const { label: eventTypeLabel, landingPagePath } = getEventTypeDefinition(workshop.event.type);
    const isLandingPageSeparate = landingPagePath !== eventLink;

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="flex items-center gap-2 text-sm font-bold text-slate-950">
                        <Globe className="h-4 w-4 shrink-0 text-cyan-600" aria-hidden="true" /> {eventTypeLabel} na webu
                    </h2>
                    <p className="mt-1 break-all font-mono text-xs text-slate-500">{eventLink}</p>
                    {!workshop.isPublished && <p className="mt-1 text-xs text-amber-600">{UNPUBLISHED_EVENT_NOTE}</p>}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button asChild size="sm">
                        <a href={eventLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-1.5 h-4 w-4" aria-hidden="true" /> Otevřít akci
                        </a>
                    </Button>
                    {isLandingPageSeparate && (
                        <Button asChild variant="outline" size="sm">
                            <a href={landingPagePath} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-1.5 h-4 w-4" aria-hidden="true" /> Landing page akce
                            </a>
                        </Button>
                    )}
                </div>
            </div>
        </section>
    );
}
