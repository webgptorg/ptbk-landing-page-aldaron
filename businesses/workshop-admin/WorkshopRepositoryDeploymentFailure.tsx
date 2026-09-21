import type { WorkshopVercelDeployment } from '@/lib/workshops/workshopVercelDeployment';
import { getWorkshopVercelDeploymentGuidance } from '@/lib/workshops/workshopVercelDeploymentGuidance';

/** Keep the reported cause and next steps readable; longer build output is available on demand. */
export function WorkshopRepositoryDeploymentFailure({ deployment }: { readonly deployment: WorkshopVercelDeployment }) {
    const guidance = getWorkshopVercelDeploymentGuidance(deployment);
    const failure = deployment.failure;
    return (
        <div role="alert" className="min-w-0 space-y-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-normal text-slate-700">
            <p className="font-semibold text-red-800">{guidance.title}</p>
            {failure?.message ? <p className="whitespace-pre-wrap break-words text-red-800">{failure.message}</p>
                : <p>Vercel neposkytl podrobný důvod. Podrobnosti hledejte v detailu nasazení v části Build Logs.</p>}
            {failure?.code && <p>Kód chyby: <code className="break-all">{failure.code}</code></p>}
            <div>
                <p className="mb-1 font-semibold">Co můžete udělat</p>
                <ol className="list-decimal space-y-1 pl-4">
                    {guidance.steps.map((step) => <li key={step}>{step}</li>)}
                </ol>
            </div>
            {failure?.buildLog ? <details>
                <summary className="cursor-pointer font-semibold">Zobrazit konec výpisu sestavení</summary>
                <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap break-words rounded bg-white p-2 text-slate-800">{failure.buildLog}</pre>
                <p className="mt-1 text-slate-500">Zkrácený výpis. Úplné Build Logs najdete ve Vercelu.</p>
            </details> : deployment.state === 'ERROR' && failure?.stage !== 'alias'
                ? <p>Výpis sestavení zde není k dispozici. Otevřete Build Logs ve Vercelu.</p> : null}
            <p className="break-all text-slate-500">ID nasazení: {deployment.id}</p>
        </div>
    );
}
