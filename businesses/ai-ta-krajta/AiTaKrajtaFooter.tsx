'use client';

import { AiTaKrajtaMark } from '@/businesses/ai-ta-krajta/AiTaKrajtaMark';
import {
    AI_TA_KRAJTA_NAME,
    AI_TA_KRAJTA_MEDIA_KIT_PATH,
    AI_TA_KRAJTA_PATH,
    AI_TA_KRAJTA_PLATFORMS,
    AI_TA_KRAJTA_SECTION_IDS,
    AI_TA_KRAJTA_TAGLINE_BY_LANGUAGE,
} from '@/businesses/ai-ta-krajta/config';
import { LegalFooterLinks } from '@/components/legal/LegalFooterLinks';
import { ORGANIZATION_LEGAL_NAME } from '@/lib/metadata/site-config';
import Link from 'next/link';

const FOOTER_LINK_CLASS_NAME = 'text-sm text-white/50 transition-colors hover:text-white';

/**
 * Year printed in the copyright line
 *
 * Note: It is read once when the module is loaded rather than on every render, so that the server and the browser
 *       never disagree about it in the middle of a New Year's Eve.
 */
const CURRENT_YEAR = new Date().getFullYear();

/**
 * Footer of the podcast page with the legal documents of the site
 *
 * Note: It deliberately does not reuse the product footer. A podcast needs neither its sales message nor its
 *       newsletter signup; only the legal links are shared through `LegalFooterLinks`.
 */
export function AiTaKrajtaFooter() {
    return (
        <footer className="border-t border-white/10 bg-[#141a16]">
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
                <div className="grid gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.8fr)]">
                    <div className="max-w-sm">
                        <Link
                            href={AI_TA_KRAJTA_PATH}
                            className="inline-flex items-center gap-2.5 text-white transition-opacity hover:opacity-80"
                        >
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#303832] p-1">
                                <AiTaKrajtaMark className="h-full w-full" />
                            </span>
                            <span className="text-lg font-semibold">{AI_TA_KRAJTA_NAME}</span>
                        </Link>

                        <p className="mt-5 text-sm leading-relaxed text-white/50">
                            {AI_TA_KRAJTA_TAGLINE_BY_LANGUAGE.cs}
                        </p>
                    </div>

                    <nav aria-label="Kde podcast vychází">
                        <h2 className="text-xs uppercase tracking-[0.16em] text-white/35">Poslouchat</h2>
                        <ul className="mt-4 grid gap-3">
                            {AI_TA_KRAJTA_PLATFORMS.map((platform) => (
                                <li key={platform.id}>
                                    <a
                                        href={platform.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={FOOTER_LINK_CLASS_NAME}
                                    >
                                        {platform.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <nav aria-label="Další stránky">
                        <h2 className="text-xs uppercase tracking-[0.16em] text-white/35">Dál</h2>
                        <ul className="mt-4 grid gap-3">
                            <li>
                                <Link href={AI_TA_KRAJTA_MEDIA_KIT_PATH} className={FOOTER_LINK_CLASS_NAME}>
                                    Media kit a spolupráce
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={AI_TA_KRAJTA_PATH + '#' + AI_TA_KRAJTA_SECTION_IDS.PEOPLE}
                                    className={FOOTER_LINK_CLASS_NAME}
                                >
                                    Kdo v tom jede
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>

                <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/40 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        © {CURRENT_YEAR} {AI_TA_KRAJTA_NAME}. Vydává {ORGANIZATION_LEGAL_NAME}. Všechna práva
                        vyhrazena.
                    </p>
                    <LegalFooterLinks
                        language="cs"
                        className="gap-x-5"
                        linkClassName="text-white/45 hover:text-white"
                    />
                </div>
            </div>
        </footer>
    );
}
