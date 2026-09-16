import { normalizePublicWebPageUrl } from '@/lib/network/publicWebPageUrl';

/**
 * The public addresses one connected project runs at, in the order its administration wrote them
 *
 * Note: A project which is published nowhere has no deployment rather than an empty address, so the list itself is
 *       the whole answer and nothing beside it says whether the project runs anywhere.
 */
export type WorkshopDeploymentUrls = readonly string[];

const DEPLOYMENT_URL_SEPARATOR = ', ';
const WWW_HOSTNAME_PREFIX = 'www.';
const TRAILING_PATH_SEPARATOR_PATTERN = /\/$/;

/**
 * Reads the deployments of a project, keeping every address which can be read as a public page exactly once
 *
 * Note: Writes are validated already, so this is the second, defensive pass an old or manually altered row goes
 *       through before a participant browser is handed a link. An address which cannot be read is left out instead of
 *       taking the whole connection down, and the written order is kept, because the first address is the one a
 *       preview is made of.
 */
export function normalizeWorkshopDeploymentUrls(values: readonly string[] | null | undefined): WorkshopDeploymentUrls {
    if (values === null || values === undefined) {
        return [];
    }

    const normalizedDeploymentUrls: string[] = [];
    values.forEach((value) => {
        const normalizedDeploymentUrl = normalizePublicWebPageUrl(value);
        if (normalizedDeploymentUrl !== null && !normalizedDeploymentUrls.includes(normalizedDeploymentUrl)) {
            normalizedDeploymentUrls.push(normalizedDeploymentUrl);
        }
    });

    return normalizedDeploymentUrls;
}

/**
 * The one deployment which stands for the project wherever a single address is asked for, such as the preview of a
 * community card, or `null` when the project is published nowhere
 */
export function getPrimaryWorkshopDeploymentUrl(deploymentUrls: WorkshopDeploymentUrls): string | null {
    return deploymentUrls[0] ?? null;
}

/**
 * Writes every deployment of a project on one line, for an administrator reading an export, and leaves a project
 * which is published nowhere empty
 */
export function formatWorkshopDeploymentUrls(deploymentUrls: WorkshopDeploymentUrls): string | null {
    return deploymentUrls.length === 0 ? null : deploymentUrls.join(DEPLOYMENT_URL_SEPARATOR);
}

/**
 * Names one deployment by the address it is reached at, which is what tells several deployments of one project apart
 *
 * Note: An address which cannot be read is named by itself rather than by nothing, so a link never loses its label.
 */
export function formatWorkshopDeploymentName(deploymentUrl: string): string {
    let parsedUrl: URL;
    try {
        parsedUrl = new URL(deploymentUrl);
    } catch {
        return deploymentUrl;
    }

    const hostname = parsedUrl.hostname.startsWith(WWW_HOSTNAME_PREFIX)
        ? parsedUrl.hostname.slice(WWW_HOSTNAME_PREFIX.length)
        : parsedUrl.hostname;
    const path = parsedUrl.pathname.replace(TRAILING_PATH_SEPARATOR_PATTERN, '');

    return `${hostname}${path}${parsedUrl.search}`;
}
