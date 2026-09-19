'use client';

import {
    previewCommunityProject,
    saveCommunityProject,
} from '@/businesses/community/projects/communityProjectsApi';
import { CommunityProjectPreviewImage } from '@/businesses/community/projects/CommunityProjectPreviewImage';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CommunityProject, CommunityProjectPreview } from '@/lib/community-projects/communityProjectTypes';
import { ArrowLeft, ArrowRight, LoaderCircle, Sparkles } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

type CommunityProjectCreationWizardProps = {
    readonly isOpen: boolean;
    readonly onOpenChange: (isOpen: boolean) => void;
    readonly onProjectCreated: (project: CommunityProject) => void;
};

type CommunityProjectWizardStep = 'url' | 'details';

function getCommunityProjectErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Požadavek se nepodařilo dokončit. Zkuste to prosím znovu.';
}

/**
 * A deliberately two-step project form. The initial step accepts no copy beyond the URL, then the scraped title and
 * description become transparent, editable defaults in the confirmation step.
 */
export function CommunityProjectCreationWizard({
    isOpen,
    onOpenChange,
    onProjectCreated,
}: CommunityProjectCreationWizardProps) {
    const [step, setStep] = useState<CommunityProjectWizardStep>('url');
    const [url, setUrl] = useState('');
    const [preview, setPreview] = useState<CommunityProjectPreview | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setStep('url');
            setUrl('');
            setPreview(null);
            setTitle('');
            setDescription('');
            setErrorMessage(null);
            setIsPreviewLoading(false);
            setIsSaving(false);
        }
    }, [isOpen]);

    const handlePreview = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsPreviewLoading(true);
        setErrorMessage(null);

        try {
            const scrapedPreview = await previewCommunityProject(url);
            setPreview(scrapedPreview);
            setUrl(scrapedPreview.url);
            setTitle(scrapedPreview.title);
            setDescription(scrapedPreview.description);
            setStep('details');
        } catch (error) {
            setErrorMessage(getCommunityProjectErrorMessage(error));
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const handleSave = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (preview === null) {
            setStep('url');
            return;
        }

        setIsSaving(true);
        setErrorMessage(null);
        try {
            const project = await saveCommunityProject({ url: preview.url, title, description });
            onProjectCreated(project);
            onOpenChange(false);
        } catch (error) {
            setErrorMessage(getCommunityProjectErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="workshop-room max-h-[calc(100vh-2rem)] max-w-xl overflow-y-auto border-room-border/10 bg-room-surface p-0 text-room-heading">
                <div className="border-b border-room-border/10 px-6 py-5">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl text-room-heading">
                            <Sparkles className="h-5 w-5 text-room-accent" /> Sdílet projekt
                        </DialogTitle>
                        <DialogDescription className="text-room-muted">
                            {step === 'url'
                                ? '1 / 2 · Vložte odkaz. Název, popis a náhled načteme ze stránky.'
                                : '2 / 2 · Zkontrolujte údaje, které se objeví na kartě projektu.'}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {step === 'url' ? (
                    <form onSubmit={(event) => void handlePreview(event)} className="space-y-5 px-6 pb-6">
                        <div className="space-y-2">
                            <Label htmlFor="community-project-url" className="text-room-text">
                                URL projektu
                            </Label>
                            <Input
                                id="community-project-url"
                                type="url"
                                inputMode="url"
                                autoFocus
                                required
                                value={url}
                                onChange={(event) => setUrl(event.target.value)}
                                placeholder="https://muj-projekt.cz"
                                className="border-room-border/15 bg-room-inset/70 text-room-heading placeholder:text-room-subtle"
                            />
                            <p className="text-xs leading-5 text-room-subtle">
                                Načteme veřejný Open Graph náhled. Nezadávejte adresy interních systémů.
                            </p>
                        </div>
                        {errorMessage !== null && (
                            <p role="alert" className="rounded-lg border border-room-danger/25 bg-room-danger/10 px-3 py-2 text-sm text-room-danger">
                                {errorMessage}
                            </p>
                        )}
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={isPreviewLoading || url.trim() === ''}
                                className="gap-2 bg-room-action text-room-action-foreground hover:bg-room-action-hover"
                            >
                                {isPreviewLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                                Načíst náhled <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={(event) => void handleSave(event)} className="space-y-5 px-6 pb-6">
                        {preview !== null && (
                            <div className="overflow-hidden rounded-xl border border-room-border/10 bg-room-inset/60">
                                <div className="aspect-[16/7]">
                                    <CommunityProjectPreviewImage imageUrl={preview.previewImageUrl} title={title || preview.title} />
                                </div>
                                <p className="truncate px-3 py-2 text-xs text-room-accent/80">{preview.url}</p>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="community-project-title" className="text-room-text">
                                Název
                            </Label>
                            <Input
                                id="community-project-title"
                                required
                                maxLength={200}
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                className="border-room-border/15 bg-room-inset/70 text-room-heading"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="community-project-description" className="text-room-text">
                                Popis
                            </Label>
                            <Textarea
                                id="community-project-description"
                                maxLength={2000}
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                className="min-h-28 border-room-border/15 bg-room-inset/70 text-room-heading"
                            />
                        </div>
                        {errorMessage !== null && (
                            <p role="alert" className="rounded-lg border border-room-danger/25 bg-room-danger/10 px-3 py-2 text-sm text-room-danger">
                                {errorMessage}
                            </p>
                        )}
                        <div className="flex flex-wrap justify-between gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                disabled={isSaving}
                                onClick={() => setStep('url')}
                                className="gap-2 text-room-text hover:bg-room-overlay/10 hover:text-room-heading"
                            >
                                <ArrowLeft className="h-4 w-4" /> Změnit URL
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSaving || title.trim() === ''}
                                className="gap-2 bg-room-action text-room-action-foreground hover:bg-room-action-hover"
                            >
                                {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                Sdílet projekt
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
