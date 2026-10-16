import { MinimalFooter } from '@/components/minimal-footer';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { getHomepageEnquiryThanks } from './homepageEnquiry';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export function HomepageEnquiryThanks({ language }: { readonly language: SupportedHomepageLanguage }) {
    const content = getHomepageEnquiryThanks(language);
    return (
        <div className="min-h-screen flex flex-col bg-white text-slate-900" lang={language}>
            <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
                <CheckCircle2 size={48} className="text-teal-700 mb-8" aria-hidden="true" />
                <h1 className="max-w-2xl text-4xl sm:text-5xl mb-6">{content.successTitle}</h1>
                <p className="max-w-lg text-lg text-slate-600 leading-relaxed">{content.successDescription}</p>
                <Link className="mt-10 underline underline-offset-4 text-teal-800" href={`/${language}`}>
                    {content.back}
                </Link>
            </main>
            <MinimalFooter language={language} />
        </div>
    );
}
