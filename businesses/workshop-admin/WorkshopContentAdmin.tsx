import type { WorkshopContentWriteValues } from '@/businesses/workshop-admin/workshopAdminApiClient';
import { WorkshopContentEditor } from '@/businesses/workshop-admin/WorkshopContentEditor';
import type { WorkshopContentBlock } from '@/lib/workshops/workshopTypes';

type WorkshopContentAdminProps = {
    /**
     * When a newly written material unlocks unless an admin picks another moment
     */
    readonly defaultUnlockAt: string;
    readonly contentBlocks: readonly WorkshopContentBlock[];
    readonly onCreate: (values: WorkshopContentWriteValues) => Promise<boolean>;
    readonly onUpdate: (contentId: string, values: WorkshopContentWriteValues) => Promise<boolean>;
    readonly onDelete: (contentId: string) => Promise<void>;
};

export function WorkshopContentAdmin({
    defaultUnlockAt,
    contentBlocks,
    onCreate,
    onUpdate,
    onDelete,
}: WorkshopContentAdminProps) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Časovaný Markdown obsah</h2>
            <p className="mt-1 text-sm text-slate-500">
                Změny, smazání i publikace se připojeným účastníkům projeví živě. Jeden materiál lze označit jako
                navazující – před koncem je zvýrazněný v seznamu a po konci vede wrap-up obrazovku.
            </p>
            <div className="mt-6 space-y-4">
                {contentBlocks.map((contentBlock) => (
                    <WorkshopContentEditor
                        key={contentBlock.id}
                        contentBlock={contentBlock}
                        defaultUnlockAt={defaultUnlockAt}
                        defaultSortOrder={contentBlock.sortOrder}
                        onSave={(values) => onUpdate(contentBlock.id, values)}
                        onDelete={() => onDelete(contentBlock.id)}
                    />
                ))}
                <WorkshopContentEditor
                    contentBlock={null}
                    defaultUnlockAt={defaultUnlockAt}
                    defaultSortOrder={contentBlocks.length * 10}
                    onSave={onCreate}
                />
            </div>
        </section>
    );
}
