import { BrandingComponentsDemo } from '@/components/branding-components-demo';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { buttonVariants } from '@/components/ui/button';
import { BRANDING_METADATA } from '@/lib/metadata/site-page-definitions';
import { cn } from '@/lib/utils';
import { ArrowUpRight, Download, Palette, ShieldCheck, Type } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = BRANDING_METADATA;

const logoCollections = [
    {
        title: 'Primary logo',
        description: 'Use this transparent blue version on light backgrounds, in documents, and on partner pages.',
        previewSrc: '/logo/promptbook-logo-blue-transparent-256.png',
        previewAlt: 'Promptbook blue transparent logo',
        previewClassName: 'border border-slate-200 bg-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]',
        downloads: [
            { label: '128 PNG', href: '/logo/promptbook-logo-blue-transparent-128.png' },
            { label: '256 PNG', href: '/logo/promptbook-logo-blue-transparent-256.png' },
            { label: '1024 PNG', href: '/logo/promptbook-logo-blue-transparent-1024.png' },
        ],
    },
    {
        title: 'Reversed logo',
        description: 'Use the blue-and-white version when you need more contrast or a filled badge.',
        previewSrc: '/logo/promptbook-logo-blue-white-256.png',
        previewAlt: 'Promptbook blue and white logo',
        previewClassName: 'border border-cyan-900/40 bg-slate-950',
        downloads: [
            { label: '128 PNG', href: '/logo/promptbook-logo-blue-white-128.png' },
            { label: '256 PNG', href: '/logo/promptbook-logo-blue-white-256.png' },
            { label: '1024 PNG', href: '/logo/promptbook-logo-blue-white-1024.png' },
        ],
    },
    {
        title: 'White logo',
        description: 'Use the white mark on dark photos, stage visuals, and dark interfaces.',
        previewSrc: '/logo/promptbook-logo-white-transparent-1024.png',
        previewAlt: 'Promptbook white transparent logo',
        previewClassName: 'border border-white/10 bg-[radial-gradient(circle_at_top,#1e293b_0%,#020617_68%)]',
        downloads: [{ label: '1024 PNG', href: '/logo/promptbook-logo-white-transparent-1024.png' }],
    },
] as const;

const colorTokens = [
    { name: 'Promptbook Blue', hex: '#7AEBFF', className: 'bg-[#7AEBFF]' },
    { name: 'Promptbook Blue Dark', hex: '#30A8BD', className: 'bg-[#30A8BD]' },
    { name: 'Promptbook Green', hex: '#7AFFEB', className: 'bg-[#7AFFEB]' },
    { name: 'Promptbook Green Dark', hex: '#30BDA8', className: 'bg-[#30BDA8]' },
    { name: 'Dark Gray', hex: '#111827', className: 'bg-[#111827]' },
    { name: 'Light Gray', hex: '#F3F4F6', className: 'bg-[#F3F4F6]' },
] as const;

const usageRules = [
    {
        title: 'Choose the right contrast',
        description: 'Put the transparent blue mark on light surfaces. Use the white mark on dark ones.',
        icon: ShieldCheck,
    },
    {
        title: 'Keep the mark intact',
        description: 'Do not stretch, recolor, rotate, outline, or decorate the Promptbook logo.',
        icon: Palette,
    },
    {
        title: 'Need another file?',
        description: 'This kit has raster PNGs. For print files, vector artwork, or partner lockups, contact us.',
        icon: Download,
    },
] as const;

const voiceExamples = [
    { language: 'EN', text: 'Create AI that truly understands your business.' },
    { language: 'CS', text: 'Vytvořte AI, která skutečně rozumí vaší firmě.' },
] as const;

export default function BrandingPage() {
    return (
        <div className="min-h-screen bg-white text-slate-900">
            <Header isBare />

            <main className="pt-14">
                <section className="relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(180deg,#f8fdff_0%,#ffffff_100%)]">
                    <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,_rgba(122,235,255,0.28),_transparent_62%)]" />

                    <div className="container relative mx-auto px-4 py-16 sm:px-6 sm:py-20">
                        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
                            <div className="max-w-2xl">
                                <div className="inline-flex items-center rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-800">
                                    Official brand kit
                                </div>

                                <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                                    Promptbook brand kit for partners, press, and product teams.
                                </h1>

                                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                                    Find the Promptbook logos, colors, typefaces, and approved messages for
                                    presentations, event materials, partner pages, and articles.
                                </p>

                                <div className="mt-8 flex flex-wrap gap-3">
                                    <a
                                        href="/logo/promptbook-logo-blue-transparent-1024.png"
                                        download
                                        className={cn(
                                            buttonVariants({ size: 'lg' }),
                                            'rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800',
                                        )}
                                    >
                                        Download the primary logo
                                        <Download className="ml-2 h-4 w-4" />
                                    </a>

                                    <Link
                                        href="/contact"
                                        className={cn(
                                            buttonVariants({ variant: 'outline', size: 'lg' }),
                                            'rounded-full border-slate-300 px-6 text-slate-700 hover:bg-slate-50',
                                        )}
                                    >
                                        Contact us
                                        <ArrowUpRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </div>

                                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <p className="text-sm font-medium text-slate-500">Logo files</p>
                                        <p className="mt-2 text-2xl font-semibold text-slate-950">3 logo versions</p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <p className="text-sm font-medium text-slate-500">Typefaces</p>
                                        <p className="mt-2 text-2xl font-semibold text-slate-950">Outfit + Inter</p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <p className="text-sm font-medium text-slate-500">Positioning</p>
                                        <p className="mt-2 text-2xl font-semibold text-slate-950">Practical AI</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.18)] sm:col-span-2">
                                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-8">
                                        <Image
                                            src="/logo/promptbook-logo-blue-transparent-1024.png"
                                            alt="Promptbook logo on light background"
                                            width={240}
                                            height={240}
                                            className="h-24 w-24"
                                        />

                                        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                                            Main message
                                        </p>
                                        <p className="mt-3 text-2xl font-semibold leading-tight text-slate-950">
                                            Create AI that truly understands your business.
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)]">
                                    <Image
                                        src="/logo/promptbook-logo-white-transparent-1024.png"
                                        alt="Promptbook white logo"
                                        width={176}
                                        height={176}
                                        className="h-16 w-16"
                                    />
                                    <p className="mt-6 text-sm uppercase tracking-[0.18em] text-slate-400">On dark backgrounds</p>
                                    <p className="mt-2 text-lg font-semibold text-white">
                                        Use the white mark on dark backgrounds.
                                    </p>
                                </div>

                                <div className="rounded-[28px] border border-cyan-100 bg-cyan-50 p-6 shadow-[0_30px_80px_-30px_rgba(8,145,178,0.28)]">
                                    <p className="text-sm uppercase tracking-[0.18em] text-cyan-800">Tone of voice</p>
                                    <div className="mt-4 space-y-3">
                                        {voiceExamples.map((example) => (
                                            <div key={example.language} className="rounded-2xl bg-white/80 p-4">
                                                <p className="text-xs font-semibold tracking-[0.18em] text-cyan-900">
                                                    {example.language}
                                                </p>
                                                <p className="mt-2 text-sm leading-6 text-slate-700">{example.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="container mx-auto px-4 py-16 sm:px-6">
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl bg-slate-950 p-3 text-white">
                                    <Type className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                                        Typography
                                    </p>
                                    <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                                        Two fonts. Two jobs.
                                    </h2>
                                </div>
                            </div>

                            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                    <p className="font-['Outfit'] text-3xl font-semibold text-slate-950">Outfit</p>
                                    <p className="mt-3 text-sm leading-6 text-slate-600">
                                        Use it for headlines, section titles, and other prominent text.
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                    <p className="text-3xl font-medium text-slate-950">Inter</p>
                                    <p className="mt-3 text-sm leading-6 text-slate-600">
                                        Use it for body copy, interface text, labels, and supporting information.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-8 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl bg-white p-3 text-slate-950 shadow-sm">
                                    <Palette className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                                        Color system
                                    </p>
                                    <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                                        The colors used on the site.
                                    </h2>
                                </div>
                            </div>

                            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                                {colorTokens.map((color) => (
                                    <div key={color.hex} className="rounded-2xl border border-slate-200 bg-white p-4">
                                        <div className={cn('h-16 rounded-xl', color.className)} />
                                        <p className="mt-4 text-sm font-semibold text-slate-950">{color.name}</p>
                                        <p className="mt-1 text-sm text-slate-500">{color.hex}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="border-y border-slate-200 bg-slate-50/70">
                    <div className="container mx-auto px-4 py-16 sm:px-6">
                        <div className="max-w-2xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Logo files
                            </p>
                            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                                Pick the logo that fits the background.
                            </h2>
                            <p className="mt-4 text-base leading-7 text-slate-600">
                                These are the current Promptbook PNG exports.
                            </p>
                        </div>

                        <div className="mt-10 grid gap-6 lg:grid-cols-3">
                            {logoCollections.map((asset) => (
                                <article
                                    key={asset.title}
                                    className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
                                >
                                    <div className="p-6">
                                        <div
                                            className={cn(
                                                'flex min-h-56 items-center justify-center rounded-[22px] p-8',
                                                asset.previewClassName,
                                            )}
                                        >
                                            <Image
                                                src={asset.previewSrc}
                                                alt={asset.previewAlt}
                                                width={220}
                                                height={220}
                                                className="h-auto w-28 sm:w-32"
                                            />
                                        </div>

                                        <h3 className="mt-6 text-2xl font-semibold text-slate-950">{asset.title}</h3>
                                        <p className="mt-3 text-sm leading-6 text-slate-600">{asset.description}</p>

                                        <div className="mt-6 flex flex-wrap gap-2">
                                            {asset.downloads.map((download) => (
                                                <a
                                                    key={`${asset.title}-${download.href}`}
                                                    href={download.href}
                                                    download
                                                    className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-white"
                                                >
                                                    {download.label}
                                                    <Download className="ml-2 h-3.5 w-3.5" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="container mx-auto px-4 py-16 sm:px-6">
                    <div className="max-w-2xl">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Using the logo</p>
                        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                            Keep the logo clear and recognizable.
                        </h2>
                    </div>

                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                        {usageRules.map((rule) => (
                            <article
                                key={rule.title}
                                className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
                            >
                                <div className="inline-flex rounded-2xl bg-slate-950 p-3 text-white">
                                    <rule.icon className="h-5 w-5" />
                                </div>
                                <h3 className="mt-6 text-xl font-semibold text-slate-950">{rule.title}</h3>
                                <p className="mt-3 text-sm leading-6 text-slate-600">{rule.description}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="container mx-auto px-4 py-16 sm:px-6">
                    <div className="max-w-2xl">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">UI components</p>
                        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                            Components for your product.
                        </h2>
                        <p className="mt-4 text-base leading-7 text-slate-600">
                            The <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm">@promptbook/components</code> package includes{' '}
                            <strong>BookEditor</strong> for writing agents in plain text and <strong>MockedChat</strong> for
                            showing conversation previews in your product or landing page.
                        </p>
                    </div>

                    <div className="mt-10">
                        <BrandingComponentsDemo />
                    </div>
                </section>

                <section className="container mx-auto px-4 pb-16 sm:px-6">
                    <div className="rounded-[32px] border border-slate-200 bg-slate-950 px-8 py-10 text-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.5)] sm:px-10">
                        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-2xl">
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                                    Need a different file?
                                </p>
                                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                                    Need a custom export, partner lockup, or print-ready file?
                                </h2>
                                <p className="mt-4 text-base leading-7 text-slate-300">
                                    If the PNGs do not cover your use case, tell us the surface, size, and context. We
                                    will send the right file.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href="/contact"
                                    className={cn(
                                        buttonVariants({ size: 'lg' }),
                                        'rounded-full bg-white px-6 text-slate-950 hover:bg-slate-100',
                                    )}
                                >
                                    Contact us
                                    <ArrowUpRight className="ml-2 h-4 w-4" />
                                </Link>

                                <Link
                                    href="/en"
                                    className={cn(
                                        buttonVariants({ variant: 'outline', size: 'lg' }),
                                        'rounded-full border-white/20 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white',
                                    )}
                                >
                                    Back to homepage
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer language="en" />
        </div>
    );
}
