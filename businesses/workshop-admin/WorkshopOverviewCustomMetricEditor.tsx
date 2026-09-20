'use client';

import { AdminEditorButton } from '@/components/admin/AdminEditorButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    createWorkshopOverviewCustomMetricMatcher,
    type WorkshopOverviewCustomMetric,
} from '@/lib/workshops/workshopOverviewGraphState';
import {
    getWorkshopOverviewCustomMetricColor,
    MAXIMAL_WORKSHOP_OVERVIEW_CUSTOM_METRIC_COUNT,
} from '@/lib/workshops/workshopOverviewSeries';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

type WorkshopOverviewCustomMetricEditorProps = {
    readonly customMetrics: readonly WorkshopOverviewCustomMetric[];
    readonly onChange: (customMetrics: readonly WorkshopOverviewCustomMetric[]) => void;
};

/**
 * Lines counted from the words of the chat, written as regular expressions and shared in the link with everything else
 */
export function WorkshopOverviewCustomMetricEditor({
    customMetrics,
    onChange,
}: WorkshopOverviewCustomMetricEditorProps) {
    const [label, setLabel] = useState('');
    const [pattern, setPattern] = useState('');

    const isPatternWritten = pattern.trim() !== '';
    const isPatternValid = !isPatternWritten || createWorkshopOverviewCustomMetricMatcher(pattern) !== null;
    const isAnotherMetricAllowed = customMetrics.length < MAXIMAL_WORKSHOP_OVERVIEW_CUSTOM_METRIC_COUNT;

    const addCustomMetric = () => {
        if (!isPatternWritten || !isPatternValid || !isAnotherMetricAllowed) {
            return;
        }

        onChange([
            ...customMetrics,
            { label: label.trim() === '' ? pattern.trim() : label.trim(), pattern: pattern.trim() },
        ]);
        setLabel('');
        setPattern('');
    };

    return (
        <section className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-bold text-slate-900">Vlastní metriky z komentářů</h3>
            <p className="mt-1 text-xs text-slate-500">
                Přidejte čáru, která počítá zprávy odpovídající regulárnímu výrazu, například{' '}
                <code className="rounded bg-white px-1 py-0.5">pomoc|help</code>. Na velikosti písmen nezáleží.
            </p>

            {customMetrics.length > 0 && (
                <ul className="mt-3 space-y-2" aria-label="Vlastní metriky">
                    {customMetrics.map((customMetric, customMetricIndex) => (
                        <li
                            key={`${customMetric.label}-${customMetric.pattern}`}
                            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
                        >
                            <span
                                aria-hidden="true"
                                className="h-0.5 w-4 shrink-0 rounded-full"
                                style={{ backgroundColor: getWorkshopOverviewCustomMetricColor(customMetricIndex) }}
                            />
                            <span className="text-sm font-medium text-slate-900">{customMetric.label}</span>
                            <code className="truncate text-xs text-slate-500">{customMetric.pattern}</code>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="ml-auto text-slate-500 hover:text-rose-600"
                                aria-label={`Odebrat metriku ${customMetric.label}`}
                                onClick={() =>
                                    onChange(
                                        customMetrics.filter((_, currentIndex) => currentIndex !== customMetricIndex),
                                    )
                                }
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </li>
                    ))}
                </ul>
            )}

            {isAnotherMetricAllowed ? (
                <AdminEditorButton label="Nová metrika" title="Nová metrika z komentářů" buttonProps={{ className: 'mt-3', size: 'sm' }}>
                    <div className="mt-3 flex flex-wrap items-start gap-2">
                        <Input
                            value={label}
                            onChange={(changeEvent) => setLabel(changeEvent.target.value)}
                            placeholder="Název čáry"
                            className="w-40 bg-white"
                            aria-label="Název vlastní metriky"
                        />
                        <div>
                            <Input
                                value={pattern}
                                onChange={(changeEvent) => setPattern(changeEvent.target.value)}
                                onKeyDown={(keyEvent) => {
                                    if (keyEvent.key === 'Enter') {
                                        keyEvent.preventDefault();
                                        addCustomMetric();
                                    }
                                }}
                                placeholder="Regulární výraz"
                                aria-label="Regulární výraz vlastní metriky"
                                aria-invalid={!isPatternValid}
                                className={`w-56 bg-white ${isPatternValid ? '' : 'border-rose-400'}`}
                            />
                            {!isPatternValid && (
                                <p className="mt-1 text-xs text-rose-600">Tento regulární výraz zatím nedává smysl.</p>
                            )}
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={!isPatternWritten || !isPatternValid}
                            onClick={addCustomMetric}
                        >
                            <Plus className="mr-1.5 h-4 w-4" /> Přidat metriku
                        </Button>
                    </div>
                </AdminEditorButton>
            ) : (
                <p className="mt-3 text-xs text-slate-500">
                    Graf unese {MAXIMAL_WORKSHOP_OVERVIEW_CUSTOM_METRIC_COUNT} vlastní metriky najednou, aby se jejich
                    barvy daly rozeznat. Odeberte jednu, chcete-li přidat jinou.
                </p>
            )}
        </section>
    );
}
