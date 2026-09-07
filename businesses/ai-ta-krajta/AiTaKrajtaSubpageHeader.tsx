import { AiTaKrajtaMark } from '@/businesses/ai-ta-krajta/AiTaKrajtaMark';
import { AI_TA_KRAJTA_NAME, AI_TA_KRAJTA_PATH, type AiTaKrajtaSubpage } from '@/businesses/ai-ta-krajta/config';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * The compact header of a page which stands beside the podcast and has no audio-player state of its own
 *
 * Note: It deliberately does not reuse `AiTaKrajtaHeader`. That one plays the newest episode and navigates the
 *       sections of the podcast page, neither of which exists here.
 *
 * @param subpage the page this header belongs to, which it names next to the show
 */
export function AiTaKrajtaSubpageHeader({ subpage }: { readonly subpage: AiTaKrajtaSubpage }) {
    return (
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#1a201c]/90 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
                <Link href={AI_TA_KRAJTA_PATH} className="flex min-w-0 items-center gap-2.5 text-white">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#303832] p-1">
                        <AiTaKrajtaMark className="h-full w-full" />
                    </span>
                    <span className="truncate text-[15px] font-semibold tracking-tight sm:text-base">
                        {AI_TA_KRAJTA_NAME}
                        <span className="ml-2 font-normal text-white/45">{subpage.title}</span>
                    </span>
                </Link>

                <Link
                    href={AI_TA_KRAJTA_PATH}
                    className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Zpět k podcastu</span>
                    <span className="sm:hidden">Podcast</span>
                </Link>
            </div>
        </header>
    );
}
