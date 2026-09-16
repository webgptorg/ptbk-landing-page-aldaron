'use client';

import { Input } from '@/components/ui/input';
import type { EventDetails } from '@/lib/events/event';
import {
    EVENT_LOCATION_KIND_LABELS,
    EVENT_LOCATION_KIND_VALUES,
    isEventLocationKind,
} from '@/lib/events/eventLocation';
import { formatEventPrice } from '@/lib/events/eventPrice';
import { EVENT_TYPE_DEFINITION_LIST, isEventType, isExternalEventType } from '@/lib/events/eventTypes';

type WorkshopEventFieldsProps = {
    readonly event: EventDetails;
    readonly onChange: (event: EventDetails) => void;
};

const ADMIN_SELECT_CLASS_NAME =
    'mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-200';

/**
 * What the chosen kind of event means for the term being written, which is where it will be offered
 */
const LANDING_PAGE_EVENT_TYPE_HINT = 'Termín se vypíše na landing page tohoto typu akce.';
const EXTERNAL_EVENT_TYPE_HINT = 'Termín pořádá někdo jiný. Vypíše se v komunitě a odkáže na web pořadatele.';

function readOptionalCount(value: string): number | null {
    const count = Number.parseInt(value, 10);
    return Number.isSafeInteger(count) && count > 0 ? count : null;
}

function readPriceCzk(value: string): number {
    const priceCzk = Number.parseInt(value, 10);
    return Number.isSafeInteger(priceCzk) && priceCzk > 0 ? priceCzk : 0;
}

/**
 * What one term says about the event it is a term of, wherever an administrator writes it
 *
 * Note: Creating a term and editing one ask exactly the same questions, so an event never means one thing in one form
 *       and something else in the other.
 */
export function WorkshopEventFields({ event, onChange }: WorkshopEventFieldsProps) {
    const isEventHeldExternally = isExternalEventType(event.type);

    return (
        <>
            <label className="text-sm font-medium text-slate-700">
                Typ akce
                <select
                    value={event.type}
                    onChange={(changeEvent) => {
                        const eventType = changeEvent.target.value;
                        if (isEventType(eventType)) {
                            onChange({
                                ...event,
                                type: eventType,
                                // Note: Only an event held by somebody else has an address of its own, so choosing a
                                //       kind of event this application holds drops the address instead of storing one
                                //       nothing would ever lead to.
                                externalUrl: isExternalEventType(eventType) ? event.externalUrl : null,
                            });
                        }
                    }}
                    className={ADMIN_SELECT_CLASS_NAME}
                >
                    {EVENT_TYPE_DEFINITION_LIST.map((eventTypeDefinition) => (
                        <option key={eventTypeDefinition.id} value={eventTypeDefinition.id}>
                            {eventTypeDefinition.label}
                        </option>
                    ))}
                </select>
                <span className="mt-1 block text-xs font-normal text-slate-400">
                    {isEventHeldExternally ? EXTERNAL_EVENT_TYPE_HINT : LANDING_PAGE_EVENT_TYPE_HINT}
                </span>
            </label>

            {isEventHeldExternally && (
                <label htmlFor="workshop-external-url" className="text-sm font-medium text-slate-700">
                    URL akce u pořadatele
                    <Input
                        id="workshop-external-url"
                        type="url"
                        value={event.externalUrl ?? ''}
                        onChange={(changeEvent) =>
                            onChange({ ...event, externalUrl: changeEvent.target.value.trim() || null })
                        }
                        className="mt-2"
                        placeholder="https://konference.example.com/program"
                        required
                    />
                    <span className="mt-1 block text-xs font-normal text-slate-400">
                        Odkaz na stránku konference nebo workshopu, kam termín pošle členy komunity. Bez něj termín
                        nikam nevede, a proto se nikde nenabídne.
                    </span>
                </label>
            )}

            <label className="text-sm font-medium text-slate-700">
                Místo konání
                <select
                    value={event.locationKind}
                    onChange={(changeEvent) => {
                        const locationKind = changeEvent.target.value;
                        if (isEventLocationKind(locationKind)) {
                            onChange({
                                ...event,
                                locationKind,
                                locationLabel: locationKind === 'online' ? '' : event.locationLabel,
                            });
                        }
                    }}
                    className={ADMIN_SELECT_CLASS_NAME}
                >
                    {EVENT_LOCATION_KIND_VALUES.map((locationKind) => (
                        <option key={locationKind} value={locationKind}>
                            {EVENT_LOCATION_KIND_LABELS[locationKind]}
                        </option>
                    ))}
                </select>
            </label>

            {event.locationKind === 'onsite' && (
                <label className="text-sm font-medium text-slate-700">
                    Místo
                    <Input
                        value={event.locationLabel}
                        onChange={(changeEvent) => onChange({ ...event, locationLabel: changeEvent.target.value })}
                        className="mt-2"
                        placeholder="Praha"
                        required
                    />
                </label>
            )}

            <label className="text-sm font-medium text-slate-700">
                Cena za účastníka (Kč)
                <Input
                    type="number"
                    min={0}
                    value={event.priceCzk}
                    onChange={(changeEvent) =>
                        onChange({ ...event, priceCzk: readPriceCzk(changeEvent.target.value) })
                    }
                    className="mt-2"
                />
                <span className="mt-1 block text-xs font-normal text-slate-400">
                    Nula znamená akci zdarma, teď: {formatEventPrice(event.priceCzk)}.
                </span>
            </label>

            <label className="text-sm font-medium text-slate-700">
                Maximální počet účastníků
                <Input
                    type="number"
                    min={1}
                    value={event.maximumParticipantCount ?? ''}
                    onChange={(changeEvent) =>
                        onChange({
                            ...event,
                            maximumParticipantCount: readOptionalCount(changeEvent.target.value),
                        })
                    }
                    className="mt-2"
                    placeholder="Bez omezení"
                />
            </label>
        </>
    );
}
