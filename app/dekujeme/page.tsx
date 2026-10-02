'use client';

import { MinimalFooter } from '@/components/minimal-footer';
import { MinimalHeader } from '@/components/minimal-header';
import jiriJahn from '@/public/people/jiri-jahn-transparent-square.png';
import pavolHejny from '@/public/people/pavol-hejny-transparent-square.png';
import { CheckCircle2, Handshake, Mail, Phone, PhoneCall, Video } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ThankYouContent() {
    const searchParams = useSearchParams();
    const name = searchParams.get('name') || '';
    const email = searchParams.get('email') || '';

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <MinimalHeader />

            {/* Main content */}
            <main className="flex-1 flex items-center justify-center px-6 py-12 md:py-20">
                <div className="max-w-2xl w-full text-center">
                    {/* Success icon */}
                    <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-full flex items-center justify-center ring-8 ring-cyan-50/50">
                        <CheckCircle2 className="w-10 h-10 text-cyan-600" />
                    </div>

                    {/* Heading */}
                    <h1
                        className="text-[32px] sm:text-[40px] font-extrabold text-[#0f172a] tracking-tight mb-4"
                        style={{ lineHeight: 1.15 }}
                    >
                        {name ? `Díky, ${name}!` : 'Děkujeme za váš zájem.'}
                    </h1>
                    <p className="text-[16px] sm:text-[18px] text-gray-500 leading-relaxed max-w-lg mx-auto mb-12">
                        Vaše odpovědi máme. Takhle to bude pokračovat:
                    </p>

                    {/* Timeline steps */}
                    <div className="max-w-md mx-auto mb-16 space-y-0">
                        {/* Step 1 */}
                        <div className="flex gap-4 text-left">
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 rounded-full bg-cyan-600 text-white flex items-center justify-center shrink-0">
                                    <PhoneCall className="w-5 h-5" />
                                </div>
                                <div className="w-px h-full bg-gray-200 my-1" />
                            </div>
                            <div className="pb-8">
                                <h3 className="text-[15px] font-bold text-[#0f172a] mb-1">
                                    Jirka vám do 24 hodin zavolá
                                </h3>
                                <p className="text-[14px] text-gray-500 leading-relaxed">
                                    Probereme, co potřebujete, a odpovíme na vaše otázky. Bez prodejního tlaku. Jen
                                    otevřený rozhovor.
                                </p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex gap-4 text-left">
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                                    <Video className="w-5 h-5" />
                                </div>
                                <div className="w-px h-full bg-gray-200 my-1" />
                            </div>
                            <div className="pb-8">
                                <h3 className="text-[15px] font-bold text-[#0f172a] mb-1">Domluvíme si videohovor</h3>
                                <p className="text-[14px] text-gray-500 leading-relaxed">
                                    Odkaz pošleme na{' '}
                                    {email ? <strong className="text-[#0f172a]">{email}</strong> : 'váš e-mail'}.
                                    Promptbook vám ukážeme na vašich reálných datech.
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex gap-4 text-left">
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
                                    <Handshake className="w-5 h-5" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-[15px] font-bold text-[#0f172a] mb-1">
                                    Na videohovoru si řekneme, co dál
                                </h3>
                                <p className="text-[14px] text-gray-500 leading-relaxed">
                                    Pokud to bude dávat smysl vám i nám, navrhneme řešení podle vaší situace.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Team section */}
                    <div className="border-t border-gray-100 pt-12 mb-12">
                        <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-8">
                            S kým si zavoláte?
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-lg mx-auto">
                            {/* Jirka */}
                            <div className="text-center">
                                <div className="relative w-[120px] h-[120px] rounded-full overflow-hidden mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 ring-4 ring-gray-100">
                                    <Image
                                        src={jiriJahn}
                                        alt="Jiří Jahn"
                                        fill
                                        sizes="120px"
                                        className="w-full h-full object-cover object-top"
                                    />
                                </div>
                                <h3 className="text-[15px] font-bold text-[#0f172a]">Jiří Jahn</h3>
                                <p className="text-[13px] text-gray-400 mb-2">CEO</p>
                                <div className="space-y-1">
                                    <a
                                        href="mailto:jiri@ptbk.io"
                                        className="flex items-center justify-center gap-1.5 text-[13px] text-gray-400 hover:text-cyan-600 transition-colors"
                                    >
                                        <Mail className="w-3.5 h-3.5" />
                                        jiri@ptbk.io
                                    </a>
                                    <a
                                        href="tel:+420777090067"
                                        className="flex items-center justify-center gap-1.5 text-[13px] text-gray-400 hover:text-cyan-600 transition-colors"
                                    >
                                        <Phone className="w-3.5 h-3.5" />
                                        +420 777 090 067
                                    </a>
                                </div>
                            </div>

                            {/* Pavol */}
                            <div className="text-center">
                                <div className="relative w-[120px] h-[120px] rounded-full overflow-hidden mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 ring-4 ring-gray-100">
                                    <Image
                                        src={pavolHejny}
                                        alt="Pavol Hejný"
                                        fill
                                        sizes="120px"
                                        className="w-full h-full object-cover object-top"
                                    />
                                </div>
                                <h3 className="text-[15px] font-bold text-[#0f172a]">Pavol Hejný</h3>
                                <p className="text-[13px] text-gray-400 mb-2">CTO</p>
                                <div className="space-y-1">
                                    <a
                                        href="mailto:pavol@ptbk.io"
                                        className="flex items-center justify-center gap-1.5 text-[13px] text-gray-400 hover:text-cyan-600 transition-colors"
                                    >
                                        <Mail className="w-3.5 h-3.5" />
                                        pavol@ptbk.io
                                    </a>
                                    <a
                                        href="tel:+420777759767"
                                        className="flex items-center justify-center gap-1.5 text-[13px] text-gray-400 hover:text-cyan-600 transition-colors"
                                    >
                                        <Phone className="w-3.5 h-3.5" />
                                        +420 777 759 767
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Back to homepage */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-[14px] text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        ← Zpět na hlavní stránku
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <MinimalFooter />
        </div>
    );
}

export default function DekujemePage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-white">
                    <div className="w-8 h-8 border-2 border-cyan-200 border-t-cyan-600 rounded-full animate-spin" />
                </div>
            }
        >
            <ThankYouContent />
        </Suspense>
    );
}
