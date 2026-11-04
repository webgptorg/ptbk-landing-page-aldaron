import { AiTaKrajtaLink as Link } from './AiTaKrajtaLink';
import {
    AI_TA_KRAJTA_MEDIA_KIT_PATH,
    AI_TA_KRAJTA_SECTION_IDS,
    createAiTaKrajtaMediaKitCollaborationPath,
} from './config';
import { ArrowUpRight } from 'lucide-react';

/** A short invitation; the collaboration page explains the options before its contact form. */
export function AiTaKrajtaCollaborationSection() {
    return (
        <section id={AI_TA_KRAJTA_SECTION_IDS.COLLABORATION} className="scroll-mt-20 border-t border-white/10 py-16 sm:py-20">
            <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 px-4 sm:px-6 lg:flex-row lg:items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Máte nápad?</h2>
                    <p className="mt-3 max-w-2xl leading-relaxed text-white/60">
                        Navrhněte hosta, pošlete téma nebo se domluvte na partnerství s podcastem.
                    </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-3">
                    <Link href={AI_TA_KRAJTA_MEDIA_KIT_PATH} className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-5 text-sm font-semibold text-white transition-colors hover:border-white/50">
                        Zjistit víc
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                    <Link href={createAiTaKrajtaMediaKitCollaborationPath('jine')} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#ff6b6b] px-5 text-sm font-semibold text-[#1a201c] transition-transform hover:scale-[1.02]">
                        Napsat nám
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
