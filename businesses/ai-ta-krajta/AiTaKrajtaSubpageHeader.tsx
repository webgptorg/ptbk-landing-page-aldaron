import { AiTaKrajtaNavigation } from './AiTaKrajtaNavigation';
import type { AiTaKrajtaSubpage } from './config';

/** Supporting pages keep the same navigation without requiring homepage playback state. */
export function AiTaKrajtaSubpageHeader({ subpage }: { readonly subpage: AiTaKrajtaSubpage }) {
    return (
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#1a201c]/90 backdrop-blur-md">
            <AiTaKrajtaNavigation activePath={subpage.path} />
        </header>
    );
}
