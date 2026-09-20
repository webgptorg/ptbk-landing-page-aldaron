/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_WORKSHOP_AGENT_VALUES } from '@/lib/workshops/agents/workshopAgentTypes';
import { WorkshopAgentEditor } from './WorkshopAgentEditor';
import { settleAdminSavesForTest } from '@/lib/admin/adminAutosaveTestUtilities';

vi.mock('next/dynamic', () => ({ default: () => function BookEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
    return <textarea aria-label="Book" value={value} onChange={(event) => onChange(event.target.value)} />;
} }));

describe('Book agent editor', () => {
    afterEach(async () => { cleanup(); await settleAdminSavesForTest(); });

    it('autosaves an existing Book without closing its editor', async () => {
        const onSave = vi.fn().mockResolvedValue(true);
        const onCancel = vi.fn();
        render(<WorkshopAgentEditor initialValues={DEFAULT_WORKSHOP_AGENT_VALUES} isListeningOffered isSaving={false} onSave={onSave} onCancel={onCancel} />);
        fireEvent.change(screen.getByLabelText('Book'), { target: { value: 'Pavel\nPERSONA Ptej se na důkazy' } });
        await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ bookSource: 'Pavel\nPERSONA Ptej se na důkazy' })));
        expect(onCancel).not.toHaveBeenCalled();
    });

    it('saves the edited Book and room behavior together', async () => {
        const onSave = vi.fn().mockResolvedValue(undefined);
        render(<WorkshopAgentEditor initialValues={null} isListeningOffered isSaving={false} onSave={onSave} onCancel={vi.fn()} />);
        fireEvent.change(screen.getByLabelText('Jméno v chatu'), { target: { value: 'Skeptický Pavel' } });
        fireEvent.change(screen.getByLabelText('Book'), { target: { value: 'Pavel\nPERSONA Ptej se na důkazy' } });
        fireEvent.click(screen.getByLabelText('Naslouchat živému workshopu a pokládat otázky'));
        fireEvent.click(screen.getByRole('button', { name: 'Uložit agenta' }));
        await waitFor(() => expect(onSave).toHaveBeenCalledWith({ ...DEFAULT_WORKSHOP_AGENT_VALUES, name: 'Skeptický Pavel', bookSource: 'Pavel\nPERSONA Ptej se na důkazy', isListening: true }));
    });

    it('keeps an unsaved draft during background refresh and offers no audio in the community', () => {
        const props = { initialValues: DEFAULT_WORKSHOP_AGENT_VALUES, isListeningOffered: false, isSaving: false, onSave: vi.fn(), onCancel: vi.fn() };
        const { rerender } = render(<WorkshopAgentEditor {...props} />);
        fireEvent.change(screen.getByLabelText('Book'), { target: { value: 'My unfinished draft' } });
        rerender(<WorkshopAgentEditor {...props} initialValues={{ ...DEFAULT_WORKSHOP_AGENT_VALUES, bookSource: 'Server version' }} />);
        expect((screen.getByLabelText('Book') as HTMLTextAreaElement).value).toBe('My unfinished draft');
        expect(screen.queryByLabelText('Naslouchat živému workshopu a pokládat otázky')).toBeNull();
    });
});
