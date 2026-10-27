import { getStudioProjectDuration, splitStudioGroup } from './studioProjectTimeline';
import type { StudioProject } from './studioProjectTypes';

/** Remove one project interval from every synchronized source, then close the gap. */
export function removeStudioSelection(project: StudioProject): StudioProject {
    const { startSeconds, endSeconds } = project.selection;
    const duration = getStudioProjectDuration(project);
    if (!Number.isFinite(startSeconds) || !Number.isFinite(endSeconds) || startSeconds < 0 || endSeconds > duration || endSeconds <= startSeconds)
        throw new Error('Vyberte platný úsek k vystřižení.');
    if (startSeconds === 0 && endSeconds === duration) throw new Error('Nelze vystřihnout celý záznam. Zkraťte výběr.');
    let result = project;
    for (const seconds of [endSeconds, startSeconds]) {
        const group = result.groups.find((item) => seconds > item.projectStartSeconds && seconds < item.projectStartSeconds + item.sourceOutSeconds - item.sourceInSeconds);
        if (group) result = splitStudioGroup(result, group.id, seconds);
    }
    const groups = result.groups.filter((group) => group.projectStartSeconds < startSeconds || group.projectStartSeconds >= endSeconds);
    const ids = new Set(groups.map((group) => group.id));
    result = { ...result,
        groups: groups.map((group) => ({ ...group, projectStartSeconds: group.projectStartSeconds >= endSeconds ? group.projectStartSeconds - (endSeconds - startSeconds) : group.projectStartSeconds })),
        clips: result.clips.filter((clip) => ids.has(clip.groupId)), scenes: result.scenes.filter((scene) => ids.has(scene.groupId)) };
    return { ...result, selection: { startSeconds: 0, endSeconds: getStudioProjectDuration(result) } };
}
