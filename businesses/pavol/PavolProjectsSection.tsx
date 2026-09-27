import { pavolProjects as PAVOL_PROJECTS, type PavolProject } from '@/businesses/pavol/config-projects';
import { PAVOL_CONTAINER_CLASS_NAME } from '@/businesses/pavol/layout';
import { PAVOL_PAGE_CONTENT } from '@/businesses/pavol/pavolContent';
import { PavolSectionHeading } from '@/businesses/pavol/PavolSectionHeading';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { cn } from '@/lib/utils';
import Image from 'next/image';

function ProjectMark({ project }: { readonly project: PavolProject }) {
    return (
        <div
            aria-hidden="true"
            className={cn(
                'flex h-14 w-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[var(--pavol-ink)] text-white',
                project.logoFrameClassName,
            )}
        >
            {project.logos?.map((LOGO) => (
                <Image
                    key={LOGO.src}
                    src={LOGO.src}
                    alt=""
                    width={36}
                    height={36}
                    className={cn('h-8 w-8 object-contain brightness-0 invert', LOGO.className)}
                />
            ))}
            {project.logoText && <span className="text-lg font-black">{project.logoText}</span>}
            {!project.logos?.length && !project.logoText && project.icon && <project.icon className="h-7 w-7" />}
        </div>
    );
}

export function PavolProjectsSection({ language }: { readonly language: SupportedHomepageLanguage }) {
    const CONTENT = PAVOL_PAGE_CONTENT[language].projects;
    return (
        <section id="projects" tabIndex={-1} className="bg-[#f5eee2] py-16 outline-none sm:py-24">
            <div className={PAVOL_CONTAINER_CLASS_NAME}>
                <PavolSectionHeading {...CONTENT} />
                <div className="mt-10 grid gap-5 md:grid-cols-2">
                    {PAVOL_PROJECTS[language].map((PROJECT, index) => {
                        const IS_FEATURED = index === 0;
                        return (
                            <article
                                key={PROJECT.title}
                                className={cn(
                                    'flex flex-col rounded-3xl border p-6 sm:p-8',
                                    IS_FEATURED
                                        ? 'border-[var(--pavol-ink)] bg-[var(--pavol-ink)] text-white'
                                        : 'border-[var(--pavol-ink)]/10 bg-[#fffaf5]',
                                )}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <ProjectMark project={PROJECT} />
                                    <span
                                        aria-hidden="true"
                                        className={cn(
                                            'font-mono text-sm',
                                            IS_FEATURED ? 'text-slate-400' : 'text-slate-500',
                                        )}
                                    >
                                        0{index + 1}
                                    </span>
                                </div>
                                <h3 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
                                    {PROJECT.title}
                                </h3>
                                <p
                                    className={cn(
                                        'mb-8 mt-4 max-w-lg text-base leading-relaxed',
                                        IS_FEATURED ? 'text-slate-300' : 'text-slate-600',
                                    )}
                                >
                                    {PROJECT.description}
                                </p>
                                <div className="mt-auto flex flex-wrap gap-3">
                                    {PROJECT.links.map((LINK) => (
                                        <a
                                            key={LINK.href}
                                            href={LINK.href}
                                            className={cn(
                                                'inline-flex min-h-11 items-center gap-2 rounded-full border px-5 py-2 text-sm font-medium transition-colors',
                                                IS_FEATURED
                                                    ? 'border-white/25 hover:bg-white/10'
                                                    : 'border-[var(--pavol-ink)]/20 hover:bg-white',
                                            )}
                                        >
                                            {LINK.label}
                                            {LINK.icon && <LINK.icon aria-hidden="true" className="h-4 w-4" />}
                                        </a>
                                    ))}
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
