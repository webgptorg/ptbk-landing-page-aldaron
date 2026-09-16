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
                <label htmlFor="workshop-repository-branches">Větve repozitáře</label>
                <Textarea
                    id="workshop-repository-branches"
                    value={repository.branch}
                    onChange={(changeEvent) => onChange({ ...repository, branch: changeEvent.target.value })}
                    className="mt-2 font-mono"
                    placeholder="main, client-*, feature/* nebo *"
                    rows={3}
                />
                <span className="mt-1 block text-xs font-normal text-slate-400">
                    Prázdné znamená výchozí větev. Vzory oddělte čárkou nebo novým řádkem; <code>*</code> sleduje
                    všechny větve.
                </span>
            </div>

            <div className="text-sm font-medium text-slate-700">
                <label htmlFor="workshop-repository-deployments">URL nasazení projektu</label>
                <Textarea
                    id="workshop-repository-deployments"
                    value={repository.deploymentUrls}
                    onChange={(changeEvent) => onChange({ ...repository, deploymentUrls: changeEvent.target.value })}
                    className="mt-2 font-mono"
                    placeholder="https://…"
                    rows={3}
                />
                <span className="mt-1 block text-xs font-normal text-slate-400">
                    Nepovinné. Každé nasazení na vlastní řádek; účastníci dostanou odkaz na každé z nich. Náhled v
                    kartě termínu se bere z prvního.
                </span>
            </div>
        </>
    );
}
