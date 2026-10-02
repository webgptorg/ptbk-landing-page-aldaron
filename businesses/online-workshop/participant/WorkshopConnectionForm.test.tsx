/**
 * @vitest-environment jsdom
 */

import {
    WorkshopConnectionForm,
    type WorkshopConnectionDetails,
} from '@/businesses/online-workshop/participant/WorkshopConnectionForm';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const CONNECTION_DETAILS: WorkshopConnectionDetails = {
    title: 'Produkční kód s AI agenty',
    description: 'Celé workflow **od issue po merge**.',
    dateLabel: 'dnes · 19:00',
    durationLabel: '60 minut',
};

function renderConnectionForm(connectionDetails: WorkshopConnectionDetails) {
    return render(
        <WorkshopConnectionForm
            connectionDetails={connectionDetails}
            initialEmail=""
            initialFullname=""
            errorMessage={null}
            onConnect={vi.fn(async () => true)}
        />,
    );
}

describe('workshop connection form', () => {
    afterEach(cleanup);

    it('reads the formatting of a description its administration wrote', () => {
        renderConnectionForm({ ...CONNECTION_DETAILS, isDescriptionMarkdown: true });

        expect(screen.getByText('od issue po merge').tagName).toBe('STRONG');
    });

    it('leaves a description written by a member as the plain text it was submitted as', () => {
        const { container } = renderConnectionForm(CONNECTION_DETAILS);

        expect(container.querySelector('strong')).toBeNull();
        expect(container.textContent).toContain('Celé workflow **od issue po merge**.');
    });
});
