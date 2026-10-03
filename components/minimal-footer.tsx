const promptbookLogo = '/logo/promptbook-logo-blue-transparent-128.png'; // <- TODO: import promptbookLogo from '@/public/logo/promptbook-logo-blue-transparent-128.png';
import { LegalFooterLinks } from '@/components/legal/LegalFooterLinks';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Look shared by every link of this footer
 */
const MINIMAL_FOOTER_LINK_CLASS_NAME = 'text-[13px] text-gray-400 hover:text-gray-700 transition-colors duration-200';

export function MinimalFooter() {
    return (
        <footer className="bg-white border-t border-gray-200 py-10">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Logo + Copyright */}
                    <div className="flex items-center gap-3">
                        <Image
                            src={promptbookLogo}
                            alt="Promptbook"
                            width={38}
                            height={38}
                            className="w-[38px] h-[38px]"
                        />
                        <span className="text-xl text-gray-900">
                            Prompt<b>book</b>
                        </span>
                        <span className="text-[14px] text-gray-400 ml-2">© 2026 Všechna práva vyhrazena.</span>
                    </div>

                    {/* Links */}
                    {/* Note: This footer belongs on the Czech confirmation pages only, so its legal links are Czech
                              as well, just like the copyright line above. */}
                    <div className="flex items-center gap-6">
                        <Link href="/branding" className={MINIMAL_FOOTER_LINK_CLASS_NAME}>
                            Branding
                        </Link>
                        <LegalFooterLinks
                            language="cs"
                            className="gap-x-6"
                            linkClassName={MINIMAL_FOOTER_LINK_CLASS_NAME}
                        />
                    </div>
                </div>
            </div>
        </footer>
    );
}
