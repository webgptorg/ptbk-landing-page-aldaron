'use client';

import { WorkshopModerationAction } from '@/businesses/online-workshop/participant/WorkshopModerationAction';
import type { WorkshopPollOptionModerationValues } from '@/lib/workshops/workshopPollOptionModeration';
import type { WorkshopPollOption } from '@/lib/workshops/workshopTypes';
import { Check, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';

type WorkshopPollOptionModerationProps = {
    readonly option: WorkshopPollOption;
    readonly onModerateOption: (optionId: string, values: WorkshopPollOptionModerationValues) => Promise<boolean>;
};

/**
 * What a moderator of the room does with one answer a member wrote into a poll
 *
 * Note: The decision is exactly the decision a chat message receives, so it is made by the same two actions. The
 *       wording of an answer belongs to the administration of the poll, which is why it is not corrected from here.
 */
export function WorkshopPollOptionModeration({ option, onModerateOption }: WorkshopPollOptionModerationProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    const moderateOption = async (values: WorkshopPollOptionModerationValues) => {
        setIsProcessing(true);
        try {
            await onModerateOption(option.id, values);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 pr-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-300/70">
                <ShieldCheck className="h-3 w-3" /> Moderace
            </span>
            {option.status !== 'approved' && (
                <WorkshopModerationAction
                    label="Schválit"
                    ariaLabel={`Schválit vlastní odpověď ${option.label}`}
                    icon={Check}
                    isDisabled={isProcessing}
                    onClick={() => void moderateOption({ status: 'approved' })}
                />
            )}
            {option.status !== 'rejected' && (
                <WorkshopModerationAction
                    label="Zamítnout"
                    ariaLabel={`Zamítnout vlastní odpověď ${option.label}`}
                    icon={X}
                    isDisabled={isProcessing}
                    onClick={() => void moderateOption({ status: 'rejected' })}
                />
            )}
        </div>
    );
}
