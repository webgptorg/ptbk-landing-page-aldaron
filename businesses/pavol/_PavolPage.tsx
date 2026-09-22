'use client';

import { PavolFooter } from '@/businesses/pavol/_PavolFooter';
import { pavolMediaAppearances, pavolMediaMoreHref, type PavolMediaAppearance } from '@/businesses/pavol/config-media';
import { pavolNumbers } from '@/businesses/pavol/config-numbers';
import { pavolProjects, type PavolProject } from '@/businesses/pavol/config-projects';
import { pavolTestimonials } from '@/businesses/pavol/config-testimonials';
import { pavolContainerClassName } from '@/businesses/pavol/layout';
import { pavolPageContent } from '@/businesses/pavol/pavolContent';
import { Header } from '@/components/header';
import { PersonalDataConsentNote } from '@/components/legal/PersonalDataConsentNote';
import { TestimonialsSection } from '@/components/testimonials-section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { subscribeToWaitlist } from '@/lib/subscription/subscribeToWaitlist';
import { cn } from '@/lib/utils';
import pavolHejny from '@/public/people/pavol-hejny-transparent.png';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, ChevronRight, Globe2, Send } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState, type CSSProperties } from 'react';

type ContactFormState = {
    name: string;
    email: string;
    company: string;
    message: string;
};

function SectionHeading({
    eyebrow,
    title,
    description,
    align = 'left',
    tone = 'dark',
}: {
    eyebrow: string;
    title: string;
    description: string;
    align?: 'left' | 'center';
    tone?: 'dark' | 'light';
}) {
    return (
        <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--pavol-accent)]">{eyebrow}</p>
            <h2
                className={`mt-4 text-3xl font-bold tracking-tight sm:text-4xl ${
                    tone === 'light' ? 'text-white' : 'text-[var(--pavol-ink)]'
                }`}
            >
                {title}
            </h2>
            <p className={`mt-4 text-lg leading-relaxed ${tone === 'light' ? 'text-slate-200' : 'text-slate-600'}`}>
                {description}
            </p>
        </div>
    );
}

function MediaThumbnail({
    title,
    imageSrc,
    thumbnailLabel,
    thumbnailClassName,
    thumbnailBackgroundColor,
    className,
}: {
    title: string;
    imageSrc?: string;
    thumbnailLabel?: string;
    thumbnailClassName?: string;
    thumbnailBackgroundColor?: string;
    className?: string;
}) {
    const backgroundStyle = thumbnailBackgroundColor ? { backgroundColor: thumbnailBackgroundColor } : undefined;

    if (imageSrc) {
        return (
            <div
                style={backgroundStyle}
                className={cn(
                    'relative h-24 w-full overflow-hidden rounded-2xl bg-slate-100 sm:w-40',
                    thumbnailClassName,
                    className,
                )}
            >
                <Image
                    src={imageSrc}
                    alt={title}
                    fill
                    className="object-contain transition-transform duration-500 group-hover:scale-105"
                />
            </div>
        );
    }

    return (
        <div
            aria-hidden="true"
            style={backgroundStyle}
            className={cn(
                'flex h-24 w-full items-center justify-center rounded-2xl bg-slate-900 text-3xl font-bold lowercase sm:w-40',
                thumbnailClassName,
                className,
            )}
        >
            {thumbnailLabel ?? title.slice(0, 2)}
        </div>
    );
}

function MediaGroupLabel({ children }: { children: React.ReactNode }) {
    return <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">{children}</h3>;
}

function MediaAppearanceCard({
    appearance,
    index,
    variant = 'rest',
}: {
    appearance: PavolMediaAppearance;
    index: number;
    variant?: PavolMediaAppearance['importance'];
}) {
    const isHighlight = variant === 'highlight';

    return (
        <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: index * 0.05 }}
            className={cn(
                'overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition-all hover:border-[var(--pavol-accent)]/30 hover:shadow-md',
                isHighlight && 'h-full shadow-md',
            )}
        >
            <Link
                href={appearance.href}
                className={cn(
                    'group flex h-full flex-col gap-5 p-5 sm:p-6',
                    !isHighlight && 'sm:flex-row sm:items-start',
                )}
            >
                <MediaThumbnail
                    title={appearance.title}
                    imageSrc={appearance.imageSrc}
                    thumbnailLabel={appearance.thumbnailLabel}
                    thumbnailClassName={appearance.thumbnailClassName}
                    thumbnailBackgroundColor={appearance.thumbnailBackgroundColor}
                    className={isHighlight ? 'h-36 sm:h-44 sm:w-full' : undefined}
                />
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[var(--pavol-accent)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--pavol-accent)]">
                            {appearance.kind}
                        </span>
                        <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                            {appearance.source}
                        </span>
                    </div>
                    <h3 className="mt-4 text-xl font-bold leading-snug text-[var(--pavol-ink)]">{appearance.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{appearance.description}</p>
                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--pavol-accent)]">
                        {appearance.source}
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                </div>
            </Link>
        </motion.article>
    );
}

function PavolLinkContent({
    label,
    icon: Icon,
}: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
}) {
    return (
        <>
            {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
            <span>{label}</span>
        </>
    );
}

function PavolProjectIcon({ project }: { project: PavolProject }) {
    const Icon = project.icon;
    const logos = project.logos ?? [];

    return (
        <div
            aria-hidden="true"
            className={cn(
                'mx-auto flex h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--pavol-ink)] text-white',
                project.logoFrameClassName ?? 'w-12',
            )}
        >
            {logos.map((logo) => (
                <Image
                    key={logo.src}
                    src={logo.src}
                    alt=""
                    width={32}
                    height={32}
                    className={cn('h-6 w-6 object-contain brightness-0 invert', logo.className)}
                />
            ))}
            {project.logoText ? (
                <span className="text-sm font-black leading-none tracking-normal">{project.logoText}</span>
            ) : null}
            {logos.length === 0 && !project.logoText && Icon ? <Icon className="h-5 w-5" /> : null}
        </div>
    );
}

export function PavolPage({ language }: { language: SupportedHomepageLanguage }) {
    const content = pavolPageContent[language];
    const projects = pavolProjects[language];
    const numbers = pavolNumbers[language];
    const media = pavolMediaAppearances[language];
    const highlightedMedia = media.filter((appearance) => appearance.importance === 'highlight');
    const restMedia = media.filter((appearance) => appearance.importance === 'rest');
    const testimonials = pavolTestimonials[language];
    const isCzech = language === 'cs';

    const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
    const [formState, setFormState] = useState<ContactFormState>({
        name: '',
        email: '',
        company: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const languageSwitcher = useMemo(
        () => ({
            ariaLabel: content.header.languageSwitcherLabel,
            items: [
                {
                    href: '/cs/pavol',
                    label: 'Čeština',
                    iconSrc: '/locale-flags/cs.svg',
                    isActive: isCzech,
                },
                {
                    href: '/en/pavol',
                    label: 'English',
                    iconSrc: '/locale-flags/en.svg',
                    isActive: !isCzech,
                },
            ],
        }),
        [content.header.languageSwitcherLabel, isCzech],
    );

    const handleServiceClick = (serviceId: string, prefillMessage: string) => {
        setSelectedInquiryId(serviceId);
        setFormState((current) => ({
            ...current,
            message: prefillMessage,
        }));

        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!formState.name.trim() || !formState.email.trim() || !formState.message.trim()) {
            setError(content.contact.errorMessage);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const note = [
            `Language: ${language}`,
            `Selected inquiry: ${selectedInquiryId ?? 'general-contact'}`,
            `Company: ${formState.company || '(not provided)'}`,
            'Message:',
            formState.message,
        ].join('\n');

        try {
            await subscribeToWaitlist({
                fullname: formState.name,
                email: formState.email,
                placeName: `PavolPersonalPage-${language}`,
                note,
            });

            setSuccess(true);
            setFormState({
                name: '',
                email: '',
                company: '',
                message: '',
            });
            setSelectedInquiryId(null);
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : 'Unexpected error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main
            className="min-h-screen bg-[#fffaf5] text-slate-900"
            style={
                {
                    ['--pavol-ink' as string]: '#102033',
                    ['--pavol-accent' as string]: '#0f8c9d',
                    ['--pavol-warm' as string]: '#f5eee2',
                    ['--pavol-gold' as string]: '#d39b3d',
                } as CSSProperties
            }
        >
            <Header
                language={language}
                brandHref={`/${language}/pavol`}
                brandLogo={
                    <Image
                        src="/logo/pavol-hejny-ph.svg"
                        alt="Pavol Hejný"
                        width={32}
                        height={32}
                        className="h-8 w-8"
                    />
                }
                brandName={<span className="text-xl font-semibold text-[var(--pavol-ink)]">Pavol Hejný</span>}
                hideCenterContent
                navItems={content.header.navItems}
                languageSwitcher={languageSwitcher}
                containerClassName={pavolContainerClassName}
                primaryAction={{
                    label: content.header.primaryAction,
                    href: '#contact',
                    mobileLabel: isCzech ? 'Kontakt' : 'Contact',
                }}
            />

            <section
                className="relative overflow-hidden bg-white pt-28 sm:pt-32"
                style={{
                    backgroundImage:
                        'radial-gradient(circle at 18% 18%, rgba(15,140,157,0.08), transparent 34%), radial-gradient(circle at 84% 24%, rgba(211,155,61,0.14), transparent 28%), linear-gradient(180deg, #ffffff 0%, #fffaf5 100%)',
                }}
            >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--pavol-accent)]/30 to-transparent" />
                <div className={`${pavolContainerClassName} py-16 sm:py-20`}>
                    <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.8fr)]">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                            className="space-y-8"
                        >
                            <div className="space-y-5">
                                <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
                                    <Globe2 className="h-4 w-4 text-[var(--pavol-accent)]" />
                                    {content.hero.eyebrow}
                                </div>

                                <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-[var(--pavol-ink)] sm:text-5xl lg:text-6xl">
                                    {content.hero.title}
                                </h1>

                                <p className="max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
                                    {content.hero.description}
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 sm:flex-row">
                                <Button
                                    asChild
                                    size="lg"
                                    className="rounded-full bg-[var(--pavol-ink)] px-8 text-white hover:bg-[var(--pavol-ink)]/92"
                                >
                                    <Link href="#contact">
                                        {content.hero.primaryAction}
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>

                                <Button asChild size="lg" variant="outline" className="rounded-full px-8">
                                    <Link href="#projects">
                                        {content.hero.secondaryAction}
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                                {content.hero.badges.map((badge) => (
                                    <div
                                        key={badge}
                                        className="rounded-full border border-[var(--pavol-accent)]/20 bg-[var(--pavol-accent)]/5 px-4 py-2"
                                    >
                                        {badge}
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 28 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.15 }}
                            className="relative mx-auto w-full max-w-md"
                        >
                            <div className="absolute inset-0 rounded-[2rem] bg-[var(--pavol-warm)] blur-3xl" />
                            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-b from-white via-[#fffdf8] to-[var(--pavol-warm)] p-6 pb-0 shadow-[0_30px_80px_rgba(16,32,51,0.12)]">
                                <div className="absolute left-6 top-6 h-20 w-20 rounded-full bg-[var(--pavol-accent)]/10 blur-2xl" />
                                <div className="absolute bottom-4 right-4 h-28 w-28 rounded-full bg-[var(--pavol-gold)]/15 blur-2xl" />
                                <Image
                                    src={pavolHejny}
                                    alt="Pavol Hejný"
                                    priority
                                    className="relative z-10 mx-auto h-auto w-full max-w-[320px] object-contain"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section id="services" className="scroll-mt-32 bg-[#fcf7ef] py-20">
                <div className={pavolContainerClassName}>
                    <SectionHeading
                        eyebrow={content.services.eyebrow}
                        title={content.services.title}
                        description={content.services.description}
                    />

                    <div className="mt-12 grid gap-6 lg:grid-cols-2">
                        {content.services.items.map((service, index) => (
                            <motion.button
                                key={service.id}
                                type="button"
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-60px' }}
                                transition={{ duration: 0.45, delay: index * 0.08 }}
                                onClick={() => handleServiceClick(service.id, service.prefillMessage)}
                                className="group rounded-[1.75rem] border border-slate-200 bg-white p-8 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--pavol-accent)]/10 text-[var(--pavol-accent)]">
                                        <service.icon className="h-7 w-7" />
                                    </div>
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--pavol-accent)]/10 text-[var(--pavol-accent)]">
                                        <ChevronRight className="h-5 w-5" />
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-[var(--pavol-ink)]">{service.title}</h3>
                                        <p className="mt-4 text-base leading-relaxed text-slate-600">
                                            {service.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[var(--pavol-accent)]">
                                    {service.buttonLabel}
                                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </section>

            <TestimonialsSection
                id="testimonials"
                eyebrow={content.testimonials.eyebrow}
                title={content.testimonials.title}
                description={content.testimonials.description}
                testimonials={testimonials}
                metrics={[]}
            />

            <section id="projects" className="scroll-mt-32 bg-[#fffaf5] py-20">
                <div className={pavolContainerClassName}>
                    <SectionHeading
                        eyebrow={content.projects.eyebrow}
                        title={content.projects.title}
                        description={content.projects.description}
                    />

                    <div className="mt-12 grid gap-6 xl:grid-cols-4 md:grid-cols-2">
                        {projects.map((project, index) => (
                            <motion.div
                                key={project.title}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{ duration: 0.45, delay: index * 0.06 }}
                                className="rounded-[1.75rem] border border-slate-200 bg-white p-7 text-center shadow-sm"
                            >
                                <PavolProjectIcon project={project} />
                                <h3 className="mt-6 text-xl font-bold text-[var(--pavol-ink)]">{project.title}</h3>
                                <p className="mt-4 text-sm leading-relaxed text-slate-600">{project.description}</p>

                                <div className="mt-6 flex flex-wrap justify-center gap-2">
                                    {project.links.map((link) => (
                                        <Button
                                            key={`${project.title}-${link.href}`}
                                            asChild
                                            variant="outline"
                                            className="rounded-full text-xs font-semibold"
                                        >
                                            <Link href={link.href}>
                                                <PavolLinkContent label={link.label} icon={link.icon} />
                                            </Link>
                                        </Button>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section
                id="numbers"
                className="scroll-mt-32 py-20 text-white"
                style={{
                    backgroundImage: 'linear-gradient(135deg, #102033 0%, #153657 55%, #0f8c9d 140%)',
                }}
            >
                <div className={pavolContainerClassName}>
                    <SectionHeading
                        eyebrow={content.numbers.eyebrow}
                        title={content.numbers.title}
                        description={content.numbers.description}
                        align="center"
                        tone="light"
                    />

                    <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                        {numbers.map((item, index) => (
                            <motion.div
                                key={item.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-40px' }}
                                transition={{ duration: 0.45, delay: index * 0.06 }}
                                className="rounded-[1.75rem] border border-white/12 bg-white/8 p-6 text-center backdrop-blur-sm"
                            >
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[var(--pavol-gold)]">
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <div className="mt-6 text-5xl font-bold tracking-tight text-white sm:text-6xl">
                                    {item.value}
                                </div>
                                <p className="mt-3 text-sm leading-relaxed text-slate-200">{item.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="media" className="scroll-mt-32 bg-white py-20">
                <div className={pavolContainerClassName}>
                    <SectionHeading
                        eyebrow={content.media.eyebrow}
                        title={content.media.title}
                        description={content.media.description}
                    />

                    <div className="mt-12 space-y-10">
                        <div>
                            <MediaGroupLabel>{content.media.highlightsLabel}</MediaGroupLabel>
                            <div className="mt-5 grid gap-5 lg:grid-cols-2">
                                {highlightedMedia.map((appearance, index) => (
                                    <MediaAppearanceCard
                                        key={appearance.href}
                                        appearance={appearance}
                                        index={index}
                                        variant="highlight"
                                    />
                                ))}
                            </div>
                        </div>

                        <div>
                            <MediaGroupLabel>{content.media.restLabel}</MediaGroupLabel>
                            <div className="mt-5 space-y-4">
                                {restMedia.map((appearance, index) => (
                                    <MediaAppearanceCard key={appearance.href} appearance={appearance} index={index} />
                                ))}
                            </div>
                        </div>

                        <div>
                            <Button asChild variant="outline" className="rounded-full px-6">
                                <Link href={pavolMediaMoreHref}>
                                    {content.media.moreLabel}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <section
                id="contact"
                className="scroll-mt-32 py-20"
                style={{
                    backgroundImage: 'linear-gradient(180deg, #fffaf5 0%, #f8f2e8 100%)',
                }}
            >
                <div className={pavolContainerClassName}>
                    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.8fr)]">
                        <div>
                            <SectionHeading
                                eyebrow={content.contact.eyebrow}
                                title={content.contact.title}
                                description={content.contact.description}
                            />

                            <div className="mt-8 rounded-[1.75rem] border border-slate-200 bg-white/80 p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-[var(--pavol-ink)]">
                                    {content.contact.otherContactsTitle}
                                </h3>
                                <div className="mt-5 flex flex-wrap gap-3">
                                    {content.contact.links.map((link) => (
                                        <Button key={link.href} asChild variant="outline" className="rounded-full">
                                            <Link href={link.href}>
                                                <PavolLinkContent label={link.label} icon={link.icon} />
                                            </Link>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.45 }}
                            className="rounded-[1.9rem] border border-slate-200 bg-white p-7 shadow-[0_25px_70px_rgba(16,32,51,0.10)]"
                        >
                            {success ? (
                                <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                                        <CheckCircle2 className="h-8 w-8" />
                                    </div>
                                    <h3 className="mt-6 text-2xl font-bold text-[var(--pavol-ink)]">
                                        {content.contact.successTitle}
                                    </h3>
                                    <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">
                                        {content.contact.successDescription}
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700">
                                            {content.contact.formNameLabel}
                                        </label>
                                        <Input
                                            value={formState.name}
                                            onChange={(event) =>
                                                setFormState((current) => ({ ...current, name: event.target.value }))
                                            }
                                            placeholder={content.contact.formNamePlaceholder}
                                            className="mt-2 h-11"
                                            autoComplete="name"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-slate-700">
                                            {content.contact.formEmailLabel}
                                        </label>
                                        <Input
                                            type="email"
                                            value={formState.email}
                                            onChange={(event) =>
                                                setFormState((current) => ({ ...current, email: event.target.value }))
                                            }
                                            placeholder={content.contact.formEmailPlaceholder}
                                            className="mt-2 h-11"
                                            autoComplete="email"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-slate-700">
                                            {content.contact.formCompanyLabel}
                                        </label>
                                        <Input
                                            value={formState.company}
                                            onChange={(event) =>
                                                setFormState((current) => ({ ...current, company: event.target.value }))
                                            }
                                            placeholder={content.contact.formCompanyPlaceholder}
                                            className="mt-2 h-11"
                                            autoComplete="organization"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-slate-700">
                                            {content.contact.formMessageLabel}
                                        </label>
                                        <Textarea
                                            value={formState.message}
                                            onChange={(event) =>
                                                setFormState((current) => ({ ...current, message: event.target.value }))
                                            }
                                            placeholder={content.contact.formMessagePlaceholder}
                                            className="mt-2 min-h-[150px]"
                                        />
                                    </div>

                                    {error && (
                                        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="h-12 w-full rounded-full bg-[var(--pavol-ink)] text-white hover:bg-[var(--pavol-ink)]/92"
                                    >
                                        {isSubmitting ? content.contact.submittingLabel : content.contact.submitLabel}
                                        {!isSubmitting && <Send className="ml-2 h-4 w-4" />}
                                    </Button>

                                    <PersonalDataConsentNote
                                        language={language}
                                        className="text-center text-slate-500"
                                        linkClassName="text-[var(--pavol-accent)]"
                                    />
                                </form>
                            )}
                        </motion.div>
                    </div>
                </div>
            </section>

            <PavolFooter language={language} />
        </main>
    );
}
