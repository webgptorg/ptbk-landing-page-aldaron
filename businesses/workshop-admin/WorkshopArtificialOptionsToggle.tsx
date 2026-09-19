'use client';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { SlidersHorizontal } from 'lucide-react';

type WorkshopArtificialOptionsToggleProps = {
    readonly isArtificialOptionsShown: boolean;
    readonly onChangeArtificialOptionsShown: (isArtificialOptionsShown: boolean) => void;
};

/**
 * Keeps the screen-sharing display choice one quiet click away from the ordinary room controls.
 *
 * The setting belongs in the URL state held by the parent, rather than in local state, so a refreshed or shared
 * administration view preserves whether synthetic controls are visible.
 */
export function WorkshopArtificialOptionsToggle({
    isArtificialOptionsShown,
    onChangeArtificialOptionsShown,
}: WorkshopArtificialOptionsToggleProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Nastavení zobrazení"
                    title="Nastavení zobrazení"
                    className="text-slate-500 hover:text-slate-950"
                >
                    <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold text-slate-950">Umělé možnosti</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                            Zobrazit nástroje pro připravené komentáře, hlasy, reakce a počet sledujících.
                        </p>
                    </div>
                    <Switch
                        checked={isArtificialOptionsShown}
                        onCheckedChange={onChangeArtificialOptionsShown}
                        aria-label="Zobrazit umělé možnosti"
                    />
                </div>
            </PopoverContent>
        </Popover>
    );
}
