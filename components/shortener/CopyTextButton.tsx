'use client';

import { Button } from '@/components/ui/button';
import { useCopyTextToClipboard } from '@/hooks/useCopyTextToClipboard';
import { Check, Copy } from 'lucide-react';

type CopyTextButtonProps = {
    readonly text: string;
    readonly label: string;
};

/**
 * Puts one plain text into the clipboard and says so for a moment afterwards.
 */
export function CopyTextButton({ text, label }: CopyTextButtonProps) {
    const { copyStatus, copyText } = useCopyTextToClipboard();

    return (
        <Button type="button" variant="ghost" size="sm" onClick={() => void copyText(text)} aria-label={label}>
            {copyStatus === 'copied' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
        </Button>
    );
}
