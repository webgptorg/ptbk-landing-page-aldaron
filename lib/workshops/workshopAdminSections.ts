/**
 * The sections the workshop administration is divided into
 *
 * Note: The order is the order of the tabs, and the name of every one of them is what a shared link carries, so
 *       renaming one of these breaks the links which were shared before.
 */
export const WORKSHOP_ADMIN_SECTION_VALUES = [
    'overview',
    'participants',
    'memberships',
    'comments',
    'agents',
    'reactions',
    'content',
    'polls',
    'feedback',
    'settings',
] as const;

export type WorkshopAdminSection = (typeof WORKSHOP_ADMIN_SECTION_VALUES)[number];

export const DEFAULT_WORKSHOP_ADMIN_SECTION: WorkshopAdminSection = 'overview';

export function isWorkshopAdminSection(value: string): value is WorkshopAdminSection {
    return WORKSHOP_ADMIN_SECTION_VALUES.some((sectionValue) => sectionValue === value);
}
