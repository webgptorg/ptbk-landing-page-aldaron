import { PromptbookCoderBadge } from '@/components/promptbook-coder/PromptbookCoderBadge';
import { cn } from '@/lib/utils';

/**
 * The same badge, floating in the bottom right corner of a page from its first screen on
 *
 * Note: Only the terminal is shown until somebody reaches the badge, at which point the words unfold. A corner badge
 *       which stays open would sit over the page all the way down it, and the running octopus alone is what invites
 *       the click.
 *
 * Note: It stops one layer below whatever a page fixes to its bottom edge, and a page which puts something there
 *       moves the badge above it through `className` instead of letting the two overlap.
 *
 * @param className where in the corner the badge floats
 */
export function PromptbookCoderFloatingBadge({ className }: { readonly className?: string }) {
    return (
        <div
            data-promptbook-coder-badge
            className={cn(
                'fixed bottom-5 right-4 z-40 transition-[bottom] duration-300 print:hidden sm:right-6',
                className,
            )}
        >
            <PromptbookCoderBadge
                className="gap-0 border-white/15 bg-black/60 px-3 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-md"
                labelClassName="max-w-0 overflow-hidden opacity-0 transition-all duration-300 ease-out group-hover:ml-2 group-hover:max-w-[13rem] group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-[13rem] group-focus-visible:opacity-100"
            />
        </div>
    );
}
