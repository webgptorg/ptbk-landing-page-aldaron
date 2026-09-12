'use client';

import type { WorkshopRepositoryDraft } from '@/businesses/workshop-admin/workshopRepositoryDraft';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { extractGithubRepository, formatGithubRepositoryName } from '@/lib/github/githubRepository';

type WorkshopRepositoryFieldsProps = {
    readonly repository: WorkshopRepositoryDraft;
    readonly onChange: (repository: WorkshopRepositoryDraft) => void;
};

/**
 * What one term says about the project it is about, wherever an administrator writes it
 *
 * Note: The repository is read here exactly as the server reads it when it is saved, so an administrator sees which
 *       project they connected before they save it, and sees nothing while what they wrote names no project yet.
 */
export function WorkshopRepositoryFields({ repository, onChange }: WorkshopRepositoryFieldsProps) {
    const connectedRepository = extractGithubRepository(repository.repositoryUrl);

    return (
        <>
            <label className="text-sm font-medium text-slate-700 md:col-span-2">
                GitHub repozitář projektu
                <Input
                    value={repository.repositoryUrl}
                    onChange={(changeEvent) =>
                        onChange({ ...repository, repositoryUrl: changeEvent.target.value })
                    }
                    className="mt-2 font-mono"
                    placeholder="https://github.com/hejny/promptbook"
                />
                <span className="mt-1 block text-xs font-normal text-slate-400">
                    {repository.repositoryUrl.trim() === ''
                        ? 'Prázdné pole znamená, že workshop není o žádném projektu. Účastníci pak repozitář nevidí.'
                        : connectedRepository === null
                          ? 'Zatím to nevypadá jako repozitář. Zadejte adresu na GitHubu nebo vlastník/název.'
                          : `Účastníci uvidí náhled a průběh repozitáře ${formatGithubRepositoryName(
                                connectedRepository,
                            )}.`}
                </span>
            </label>

            <div className="text-sm font-medium text-slate-700">
                <label htmlFor="workshop-repository-branches">Větev repozitáře</label>
                <Textarea
                    id="workshop-repository-branches"
                    value={repository.isAllBranches ? '' : repository.branch}
                    onChange={(changeEvent) =>
                        onChange({ ...repository, branch: changeEvent.target.value, isAllBranches: false })
                    }
                    className="mt-2 font-mono"
                    placeholder="Výchozí větev nebo jedna větev na řádek"
                    rows={3}
                    disabled={repository.isAllBranches}
                />
                <span className="mt-1 block text-xs font-normal text-slate-400">
                    Prázdné znamená výchozí větev. Pro více větví zadejte jednu na řádek nebo je oddělte čárkou.
                </span>
                <label className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                        type="checkbox"
                    checked={repository.isAllBranches}
                    onChange={(changeEvent) =>
                        onChange({
                            ...repository,
                            isAllBranches: changeEvent.target.checked,
                        })
                    }
                        disabled={repository.repositoryUrl.trim() === ''}
                        className="h-4 w-4 rounded"
                    />
                    Sledovat všechny větve
                </label>
                {repository.isAllBranches && (
                    <span className="mt-1 block text-xs font-normal text-cyan-700">
                        Účastníci uvidí commity všech větví v grafu historie.
                    </span>
                )}
            </div>

            <label className="text-sm font-medium text-slate-700">
                URL nasazení projektu
                <Input
                    type="url"
                    value={repository.deploymentUrl}
                    onChange={(changeEvent) => onChange({ ...repository, deploymentUrl: changeEvent.target.value })}
                    className="mt-2"
                    placeholder="https://…"
                />
                <span className="mt-1 block text-xs font-normal text-slate-400">
                    Nepovinné. Účastníci dostanou odkaz na běžící aplikaci.
                </span>
            </label>
        </>
    );
}
