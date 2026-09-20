import { COMMUNITY_ADMIN_PATH } from '@/businesses/community/config';
import {
    ADMIN_CONTACTS_PATH,
    ADMIN_DASHBOARD_PATH,
    ADMIN_DISCOUNT_CODES_PATH,
    ADMIN_WORKSHOPS_PATH,
} from '@/lib/admin/adminConstants';
import { ADMIN_SHORTENER_PATH } from '@/lib/shortener/shortcodeLinkConstants';
import { RECORDING_STUDIO_PATH } from '@/lib/recording-studio/recordingStudioTypes';
import { ContactRound, LayoutDashboard, Link2, Radio, TicketPercent, UsersRound, Video, type LucideIcon } from 'lucide-react';

export type AdminNavigationItem = {
    readonly path: string;
    readonly label: string;
    readonly title?: string;
    readonly description: string;
    readonly icon: LucideIcon;
};

/**
 * The administration's pages in the order in which they are offered in the shared navigation and dashboard.
 *
 * Keeping the route, copy and icon together means a new admin page only needs one entry here to appear in both
 * places, instead of maintaining two lists which can drift apart.
 */
export const ADMIN_NAVIGATION_ITEMS: readonly AdminNavigationItem[] = [
    {
        path: ADMIN_DASHBOARD_PATH,
        label: 'Dashboard',
        title: 'Administrační dashboard',
        description: 'Všechny interní stránky na jednom místě.',
        icon: LayoutDashboard,
    },
    {
        path: ADMIN_WORKSHOPS_PATH,
        label: 'Živé workshopy',
        description: 'Stream, časovaný Markdown obsah, účastníci a moderace chatu.',
        icon: Radio,
    },
    {
        path: COMMUNITY_ADMIN_PATH,
        label: 'Komunita',
        title: 'Komunita Promptbooku',
        description: 'Stálá komunitní místnost, její jeviště, účastníci a moderace.',
        icon: UsersRound,
    },
    {
        path: RECORDING_STUDIO_PATH,
        label: 'Nahrávací studio',
        description: 'Souběžný záznam kamer a obrazovek, společný ořez a ZIP pro střihače.',
        icon: Video,
    },
    {
        path: ADMIN_CONTACTS_PATH,
        label: 'Kontakty a leady',
        description: 'Kontakty získané z registračních a poptávkových formulářů.',
        icon: ContactRound,
    },
    {
        path: ADMIN_SHORTENER_PATH,
        label: 'Zkracovač odkazů',
        description: 'Vytváření veřejných krátkých odkazů a QR kódů.',
        icon: Link2,
    },
    {
        path: ADMIN_DISCOUNT_CODES_PATH,
        label: 'Slevové kódy',
        description: 'Platnost, místa a použití slevových kódů pro placené registrace.',
        icon: TicketPercent,
    },
];
