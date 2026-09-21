import type { WorkshopVercelDeployment } from '@/lib/workshops/workshopVercelDeployment';

type DeploymentGuidance = { readonly title: string; readonly steps: readonly string[] };

const BUILD_CONFIGURATION_GUIDANCE = 'V nastavení projektu ve Vercelu ověřte Framework Preset, Root Directory, Build Command a Output Directory podle repozitáře.';
const ENVIRONMENT_GUIDANCE = 'V projektu ve Vercelu otevřete Settings → Environment Variables a doplňte potřebné proměnné pro Production. Proměnné této administrace se do nasazovaného projektu nepřenášejí.';
const RETRY_BUILD_GUIDANCE = 'Spusťte sestavení lokálně stejným příkazem jako ve Vercelu, opravte chybu a odešlete změny do produkční větve. Potom zkuste nasazení znovu.';
const BUILD_FAILURE_GUIDANCE: readonly { readonly pattern: RegExp; readonly steps: readonly string[] }[] = [
    {
        pattern: /(?:missing|required|undefined|not (?:set|found|defined))[^\n]*(?:environment variable|env var)|(?:environment variable|env var)[^\n]*(?:missing|required|undefined|not (?:set|found|defined))/i,
        steps: [ENVIRONMENT_GUIDANCE, 'Po doplnění proměnných spusťte nové nasazení.'],
    },
    {
        pattern: /out.of.memory|heap.*limit|\bENOMEM\b|(?:^|[^a-z])OOM(?:$|[^a-z])|memory limit/i,
        steps: ['Sestavení hlásí nedostatek paměti. V Build Logs ověřte, který krok ji vyčerpal, a snižte jeho nároky nebo upravte prostředky sestavení ve Vercelu.', RETRY_BUILD_GUIDANCE],
    },
    {
        pattern: /timed? ?out|timeout|BUILD_EXCEEDED_MAXIMUM_TIME/i,
        steps: ['V Build Logs najděte krok, který se nedokončil včas. Ověřte dostupnost služeb volaných při sestavení a zkraťte nebo opravte tento krok.', RETRY_BUILD_GUIDANCE],
    },
    {
        pattern: /root directory|output directory|no (?:next\.js|framework|build script)|missing script[^\n]*build|invalid.*(?:framework|configuration)/i,
        steps: [BUILD_CONFIGURATION_GUIDANCE, 'U monorepa nastavte Root Directory na složku nasazované aplikace. Po opravě nastavení zkuste nasazení znovu.'],
    },
    {
        pattern: /type error|typescript|syntaxerror|failed to compile/i,
        steps: ['V chybovém výpisu najděte uvedený soubor a řádek. Opravte chybu kompilace nebo typů v repozitáři.', RETRY_BUILD_GUIDANCE],
    },
    {
        pattern: /module not found|cannot find (?:module|package)|could not resolve|ERESOLVE|ERR_PNPM_|(?:npm|pnpm|yarn|bun) install[^\n]*exited/i,
        steps: ['Ověřte závislosti v package.json, lockfile a verzi Node.js. Chybějící balíček nebo nesprávný import opravte v repozitáři.', RETRY_BUILD_GUIDANCE],
    },
    {
        pattern: /internal error|INTERNAL_ERROR/i,
        steps: ['Vercel hlásí interní chybu. Zkuste nasazení za chvíli znovu; pokud se chyba opakuje, ověřte stav služby na vercel-status.com.'],
    },
];

/** Suggestions follow reported diagnostics; absent details get checks, never an invented cause. */
export function getWorkshopVercelDeploymentGuidance(deployment: WorkshopVercelDeployment): DeploymentGuidance {
    if (deployment.failure?.stage === 'alias') {
        return {
            title: 'Nepodařilo se přiřadit veřejnou adresu nasazení.',
            steps: ['V projektu ve Vercelu otevřete Settings → Domains. Ověřte přiřazení domény, její DNS a případný konflikt s jiným projektem.',
                'Po opravě přiřazení můžete veřejnou URL vyplnit ručně nebo nasazení zkusit znovu.'],
        };
    }
    if (deployment.state === 'CANCELED') {
        return { title: 'Nasazení bylo zrušeno.', steps: [
            'V detailu nasazení ověřte důvod zrušení a zda jej nenahradilo novější nasazení. Pokud existuje úspěšné produkční nasazení, můžete jeho URL vyplnit ručně.',
            'Pokud chcete spustit nové sestavení, zkuste nasazení znovu.',
        ] };
    }
    if (deployment.state === 'BLOCKED') {
        return { title: 'Vercel nasazení zablokoval.', steps: [
            'V detailu nasazení zkontrolujte důvod blokace. Podle uvedené zprávy ověřte oprávnění k repozitáři, limity nebo fakturaci účtu.',
            'Nejprve odstraňte blokaci ve Vercelu, potom zkuste nasazení znovu.',
        ] };
    }
    const diagnosticText = [deployment.failure?.code, deployment.failure?.message, deployment.failure?.buildLog].filter(Boolean).join('\n');
    return {
        title: 'Nasazení se nezdařilo.',
        steps: BUILD_FAILURE_GUIDANCE.find(({ pattern }) => pattern.test(diagnosticText))?.steps
            ?? [BUILD_CONFIGURATION_GUIDANCE, ENVIRONMENT_GUIDANCE, RETRY_BUILD_GUIDANCE],
    };
}
