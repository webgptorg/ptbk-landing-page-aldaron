import { PromptbookLogo } from '@/components/promptbook-logo';
import Link from 'next/link';

/**
 * Header holding nothing but the brand, used on the pages which must not tempt the visitor to navigate away
 *
 * Note: It is the counterpart of `<MinimalFooter/>` and belongs on the confirmation pages such as `/dekujeme`.
 */
export function MinimalHeader() {
    return (
        <header className="py-6 px-6">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="flex items-center gap-2.5 w-fit">
                    <PromptbookLogo size={36} alt="" className="w-9 h-9" isPriority />
                    <span className="text-xl text-gray-900">
                        Prompt<b>book</b>
                    </span>
                </Link>
            </div>
        </header>
    );
}
