'use client';

import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Loader2, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchWorkshopRepositoryDeployment, startWorkshopRepositoryDeployment } from '@/businesses/workshop-admin/workshopRepositoryDeploymentApi';
import {
    isWorkshopVercelDeploymentFailed,
    WORKSHOP_VERCEL_DEPLOYMENT_POLL_INTERVAL_MILLISECONDS,
    WORKSHOP_VERCEL_DEPLOYMENT_TIMEOUT_MILLISECONDS,
    type WorkshopVercelDeployment,
} from '@/lib/workshops/workshopVercelDeployment';

type WorkshopRepositoryDeploymentControlProps = {
    readonly repositoryUrl: string;
    readonly onDeployed: (deploymentUrl: string) => void;
    readonly isDisabled: boolean;
};

function waitForDeploymentPoll(signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        const handleAbort = () => {
            window.clearTimeout(timeoutId);
            reject(new Error('Deployment polling stopped'));
        };
        const timeoutId = window.setTimeout(() => {
            signal.removeEventListener('abort', handleAbort);
            resolve();
        }, WORKSHOP_VERCEL_DEPLOYMENT_POLL_INTERVAL_MILLISECONDS);
        signal.addEventListener('abort', handleAbort, { once: true });
        if (signal.aborted) handleAbort();
    });
}

/** A build belongs to this mounted repository control. Changing rooms, repositories or URLs stops polling it. */
export function WorkshopRepositoryDeploymentControl({
    repositoryUrl, onDeployed, isDisabled,
}: WorkshopRepositoryDeploymentControlProps) {
    const [deployment, setDeployment] = useState<WorkshopVercelDeployment | null>(null);
    const [isDeploying, setIsDeploying] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const activeRequest = useRef<AbortController | null>(null);

    useEffect(() => () => activeRequest.current?.abort(), []);

    const deploy = async () => {
        if (activeRequest.current !== null) return;
        const controller = new AbortController();
        activeRequest.current = controller;
        setIsDeploying(true);
        setErrorMessage(null);
        const startedAt = Date.now();
        try {
            // A failed status request resumes the known build; it never starts another build just to check it.
            let currentDeployment = deployment !== null && !isWorkshopVercelDeploymentFailed(deployment)
                ? await fetchWorkshopRepositoryDeployment(deployment.id, controller.signal)
                : await startWorkshopRepositoryDeployment(repositoryUrl, controller.signal);

            while (!controller.signal.aborted) {
                setDeployment(currentDeployment);
                if (isWorkshopVercelDeploymentFailed(currentDeployment)) {
                    throw new Error('Nasazení se nezdařilo nebo bylo zastaveno. Zkontrolujte sestavení ve Vercelu a zkuste to znovu.');
                }
                if (currentDeployment.state === 'READY' && currentDeployment.deploymentUrl !== null) {
                    onDeployed(currentDeployment.deploymentUrl);
                    return;
                }
                if (Date.now() - startedAt >= WORKSHOP_VERCEL_DEPLOYMENT_TIMEOUT_MILLISECONDS) {
                    throw new Error('Nasazení stále čeká na dokončení. Stav můžete znovu ověřit nebo otevřít ve Vercelu.');
                }
                await waitForDeploymentPoll(controller.signal);
                currentDeployment = await fetchWorkshopRepositoryDeployment(currentDeployment.id, controller.signal);
            }
        } catch (error) {
            if (!controller.signal.aborted) {
                setErrorMessage(error instanceof Error ? error.message : 'Nasazení se nepodařilo spustit.');
            }
        } finally {
            if (!controller.signal.aborted) setIsDeploying(false);
            if (activeRequest.current === controller) activeRequest.current = null;
        }
    };

    const isResumable = deployment !== null && !isWorkshopVercelDeploymentFailed(deployment);
    return (
        <div className="mt-3 space-y-2">
            <Button type="button" variant="outline" size="sm" disabled={isDisabled || isDeploying}
                onClick={() => void deploy()}>
                {isDeploying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rocket className="mr-2 h-4 w-4" />}
                {isDeploying ? 'Nasazuji na Vercel…' : isResumable ? 'Ověřit stav nasazení' : 'Nasadit na Vercel'}
            </Button>
            <p className="text-xs font-normal text-slate-500">
                Nasadí produkční větev Vercelu, u nového projektu výchozí větev repozitáře. Další změny v této větvi
                se nasazují automaticky. Výběr větví a rozsah commitů slouží pro historii workshopu.
                Po dokončení doplníme URL; změnu potvrďte uložením nastavení.
            </p>
            {isDeploying && <p role="status" className="text-xs font-normal text-slate-600">
                {deployment === null ? 'Připojuji repozitář…' : deployment.state === 'READY'
                    ? 'Čekám na přiřazení veřejné adresy…' : 'Vercel připravuje nasazení. Může to trvat několik minut.'}
            </p>}
            {errorMessage !== null && <p role="alert" className="text-xs font-normal text-red-700">{errorMessage}</p>}
            {deployment?.inspectorUrl && <a href={deployment.inspectorUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-cyan-700 underline">
                Otevřít nasazení ve Vercelu <ExternalLink className="h-3 w-3" />
            </a>}
        </div>
    );
}
