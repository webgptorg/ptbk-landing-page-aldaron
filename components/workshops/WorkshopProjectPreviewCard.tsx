import { PublicWebPagePreviewImage } from '@/components/public-web-page-preview-image';
import { formatWorkshopDeploymentName } from '@/lib/workshops/workshopDeployments';
import type { WorkshopProjectPreview } from '@/lib/workshops/workshopTypes';
import { Github, Globe } from 'lucide-react';

/** Shared project identity; its parent decides whether clicking opens the workshop or the application. */
export function WorkshopProjectPreviewCard({ project }: { readonly project: WorkshopProjectPreview }) {
    const isRepositoryTitle = project.title === project.repositoryName;
    const deploymentName = project.deploymentUrl === null ? null : formatWorkshopDeploymentName(project.deploymentUrl);
    const PreviewIcon = deploymentName === null ? Github : Globe;

    return (
        <div className="overflow-hidden rounded-lg border border-room-border/10 bg-room-inset/50">
            <div className="relative aspect-[2/1] overflow-hidden bg-room-hover">
                <PublicWebPagePreviewImage
                    imageUrl={project.previewImageUrl}
                    alt={`Náhled projektu ${project.title}`}
                    fallbackLabel={deploymentName === null
                        ? 'Náhled projektu není k dispozici'
                        : `Živá aplikace ${deploymentName}`}
                    fallback={<PreviewIcon className="mt-6 h-9 w-9 text-room-accent/80" aria-hidden="true" />}
                    className="object-top motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.025] motion-safe:group-focus-visible:scale-[1.025]"
                />
                <span className="absolute left-3 top-3 rounded-full border border-room-border/15 bg-room-inset/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-room-accent">
                    Projekt workshopu
                </span>
            </div>
            <div className="min-w-0 p-3">
                <span className="line-clamp-2 break-words text-sm font-semibold leading-5 text-room-heading">
                    {project.title}
                </span>
                {project.description !== '' && (
                    <span className="mt-1 line-clamp-2 break-words text-xs font-normal leading-5 text-room-muted">
                        {project.description}
                    </span>
                )}
                {deploymentName !== null && (
                    <span className="mt-2 flex min-w-0 items-center gap-1.5 text-room-accent">
                        <Globe className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate text-xs">{deploymentName}</span>
                    </span>
                )}
                {!isRepositoryTitle && (
                    <span className="mt-2 flex min-w-0 items-center gap-1.5 text-room-muted">
                        <Github className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate font-mono text-[11px]">{project.repositoryName}</span>
                    </span>
                )}
            </div>
        </div>
    );
}
