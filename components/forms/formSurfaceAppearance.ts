/**
 * A form can keep the public page palette or follow the participant room's theme.
 *
 * Note: A form which is offered in both places is written once and told which surface it is on, so the same field
 *       never exists twice merely because one page is dark.
 */
export type FormSurfaceAppearance = 'light' | 'room';

type FormSurfaceClassNames = {
    readonly label: string;
    readonly input: string;
    readonly hint: string;
    readonly heading: string;
    readonly mutedText: string;
    readonly strikethroughText: string;
};

export const FORM_SURFACE_CLASS_NAMES: Readonly<Record<FormSurfaceAppearance, FormSurfaceClassNames>> = {
    light: {
        label: 'text-slate-700',
        input: '',
        hint: 'text-slate-500',
        heading: 'text-slate-950',
        mutedText: 'text-slate-500',
        strikethroughText: 'text-slate-400 decoration-slate-400/80',
    },
    room: {
        label: 'text-room-text',
        input: 'border-room-border/15 bg-room-inset/70 text-room-heading placeholder:text-room-subtle',
        hint: 'text-room-muted',
        heading: 'text-room-heading',
        mutedText: 'text-room-muted',
        strikethroughText: 'text-room-subtle decoration-room-muted/80',
    },
};
