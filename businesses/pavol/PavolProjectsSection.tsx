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
                'pavol-project-mark flex h-14 w-14 shrink-0 items-center justify-center gap-2 rounded-xl bg-white/10 text-white',
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
        <section
            id="projects"
            tabIndex={-1}
            className="pavol-projects pavol-section bg-[var(--pavol-ink)] text-[var(--pavol-paper)] outline-none"
        >
            <div className={PAVOL_CONTAINER_CLASS_NAME}>
                <PavolSectionHeading {...CONTENT} />
                <div className="pavol-project-grid mt-12 grid gap-5 md:grid-cols-2">
                    {PAVOL_PROJECTS[language].map((PROJECT, index) => {
                        const IS_FEATURED = index === 0;
                        return (
                            <article
                                key={PROJECT.title}
                                className={cn(
                                    'pavol-project relative isolate flex flex-col overflow-hidden rounded-2xl border border-white/15 p-6 sm:p-8',
                                    IS_FEATURED && 'pavol-project-featured',
                                )}
                            >
                                {IS_FEATURED && PROJECT.logos?.[0] && (
                                    <Image
                                        src={PROJECT.logos[0].src}
                                        alt=""
                                        aria-hidden="true"
                                        width={280}
                                        height={280}
                                        className="pavol-project-watermark pointer-events-none absolute -right-8 top-10 -z-10 h-64 w-64 object-contain brightness-0"
                                    />
                                )}
                                <div className="flex items-center justify-between gap-4">
                                    <ProjectMark project={PROJECT} />
                                    <span
                                        aria-hidden="true"
                                        className="pavol-project-number font-mono text-sm"
                                    >
                                        0{index + 1}
                                    </span>
                                </div>
                                <h3 className="mt-6 text-3xl font-medium tracking-tight">{PROJECT.title}</h3>
                                <p className="pavol-project-description mb-7 mt-3 max-w-lg text-sm leading-relaxed sm:text-base">
                                    {PROJECT.description}
                                </p>
                                <div className="mt-auto flex flex-wrap gap-3">
                                    {PROJECT.links.map((LINK) => (
                                        <a
                                            key={LINK.href}
                                            href={LINK.href}
                                            className="pavol-project-link inline-flex min-h-11 items-center justify-between gap-5 rounded-full border px-5 py-2 text-sm font-medium transition-colors"
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
